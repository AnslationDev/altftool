/**
 * India Import Duty & Landed Cost — pure calculation layer.
 *
 * No React, no DOM, no clocks. Every function is deterministic: same input in,
 * same numbers out. Every magic number is a named constant carrying the section
 * or notification it came from.
 *
 * This computes an ESTIMATE on the rates encoded in ./data.js. It is not a
 * customs valuation, not a bill of entry, and not advice.
 */

/* ------------------------------------------------------------------ */
/* Statutory constants                                                 */
/* ------------------------------------------------------------------ */

/** Baggage is assessed under Customs Tariff heading 9803. The effective Basic
 *  Customs Duty rate on dutiable baggage is 35% (Notification No. 26/2016-Customs
 *  dated 31 March 2016). */
export const BAGGAGE_BCD_RATE = 35;

/** Social Welfare Surcharge, levied at 10% of the aggregate of customs duties
 *  (Section 110, Finance Act 2018). It replaced the Education Cesses. */
export const SWS_RATE = 10;

/** 35% BCD + 10% SWS on that BCD = 35 + 3.5 = 38.5% of the dutiable value.
 *  Kept as a derived constant so the two halves stay in step. */
export const BAGGAGE_ALL_IN_RATE =
  BAGGAGE_BCD_RATE + (BAGGAGE_BCD_RATE * SWS_RATE) / 100;

/** Bona fide gifts imported by post or air: CIF value up to ₹5,000
 *  (Notification No. 171/93-Customs dated 16 September 1993, as amended). */
export const GIFT_EXEMPTION_LIMIT_INR = 5000;

/** Minimum age for the free-laptop provision
 *  (Notification No. 11/2004-Customs dated 8 January 2004). */
export const LAPTOP_EXEMPTION_MIN_AGE = 18;

/** Rule 5, Baggage Rules 2016 — duty-free jewellery for a passenger who has
 *  resided abroad for more than one year. Both the weight cap and the value cap
 *  bind; whichever is reached first ends the free allowance. */
export const JEWELLERY_FREE_ALLOWANCE = {
  male: { grams: 20, valueInr: 50000 },
  female: { grams: 40, valueInr: 100000 },
};
export const JEWELLERY_MIN_STAY_MONTHS = 12;

/** An "eligible passenger" for the concessional metal rate must have stayed
 *  abroad for at least six months. */
export const ELIGIBLE_PASSENGER_MIN_STAY_MONTHS = 6;

/** Weight ceilings on metal brought in by an eligible passenger under
 *  S. Nos. 356/357 of Notification No. 50/2017-Customs. */
export const GOLD_WEIGHT_CAP_GRAMS = 1000;
export const SILVER_WEIGHT_CAP_GRAMS = 10000;

/** Concessional passenger rate on gold and silver: 5% BCD + 1% Agriculture
 *  Infrastructure and Development Cess = 6%, per Notification No. 50/2017-Customs
 *  as amended by Notification No. 34/2024-Customs dated 23 July 2024. */
export const METAL_CONCESSIONAL_BCD_RATE = 6;

/** Social Welfare Surcharge is exempt on gold and silver
 *  (Notification No. 11/2018-Customs dated 2 February 2018). */
export const METAL_SWS_RATE = 0;

/** IGST on gold and silver is 3%. */
export const METAL_IGST_RATE = 3;

/** Residual valuation percentages under the Customs Valuation (Determination of
 *  Value of Imported Goods) Rules, 2007 where the actual figure is not
 *  ascertainable: transport 20% of FOB (Rule 10(2)), insurance 1.125% of FOB
 *  (Rule 10(1)(d)). */
export const DEEMED_FREIGHT_PCT = 20;
export const DEEMED_INSURANCE_PCT = 1.125;

/** The 1% landing charge that used to be added to CIF was removed with effect
 *  from 26 September 2017 (Notification No. 91/2017-Customs (N.T.)). Assessable
 *  value is therefore plain CIF. */
export const LANDING_CHARGE_PCT = 0;

/** Sanity ceiling. Above this the tool refuses rather than printing a number
 *  nobody can check. ₹1,000 crore. */
const MAX_VALUE_INR = 1e10;
const MAX_QUANTITY = 1000;
const MAX_BCD_RATE = 300;
const MAX_IGST_RATE = 40;
const MAX_GRAMS = 100000;

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function toNumber(value) {
  if (value === "" || value === null || value === undefined) return NaN;
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  if (typeof value === "string") {
    const cleaned = value.replace(/[\s,]/g, "");
    if (cleaned === "") return NaN;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  return NaN;
}

/** Customs duty is worked to the rupee, so every component is rounded to the
 *  nearest rupee and the totals are built from the rounded parts. That is what
 *  makes the printed waterfall add up exactly. */
function rupees(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

function fail(reason) {
  return { error: reason };
}

function line(key, label, amount, note) {
  return { key, label, amount, note: note || "" };
}

/* ------------------------------------------------------------------ */
/* Shared input validation                                             */
/* ------------------------------------------------------------------ */

function readMoney(raw, label) {
  const value = toNumber(raw);
  if (Number.isNaN(value)) return { error: `${label} must be a number.` };
  if (value < 0) return { error: `${label} cannot be negative.` };
  return { value };
}

function readRate(raw, label, max) {
  const value = toNumber(raw);
  if (Number.isNaN(value)) return { error: `${label} must be a number.` };
  if (value < 0) return { error: `${label} cannot be negative.` };
  if (value > max) return { error: `${label} above ${max}% is outside this estimator.` };
  return { value };
}

/**
 * Converts a foreign-currency amount to rupees at a user-supplied rate.
 * Customs uses the rate notified by CBIC under Section 14 of the Customs Act,
 * 1962, revised fortnightly — not a market or card rate.
 */
export function toInr(amountForeign, exchangeRate) {
  const amount = toNumber(amountForeign);
  const rate = toNumber(exchangeRate);
  if (Number.isNaN(amount) || Number.isNaN(rate)) return NaN;
  return amount * rate;
}

/* ------------------------------------------------------------------ */
/* Route 1 — courier / post / commercial import                        */
/* ------------------------------------------------------------------ */

/**
 * Duty waterfall on a courier or post import.
 *
 *   Assessable value = cost + insurance + freight (CIF)
 *   BCD              = AV x bcdRate
 *   SWS              = BCD x 10%
 *   IGST             = (AV + BCD + SWS) x igstRate
 *
 * All money inputs are in the foreign currency; exchangeRate converts to INR.
 * handlingFeeInr is a courier's own clearance charge — it is not a duty, so it
 * is excluded from the effective duty rate but included in landed cost.
 */
export function computeCourierLandedCost(input = {}) {
  const {
    itemPrice,
    quantity = 1,
    exchangeRate = 1,
    freight = 0,
    insurance = 0,
    bcdRate = 0,
    igstRate = 0,
    swsRate = SWS_RATE,
    isGift = false,
    handlingFeeInr = 0,
  } = input;

  const price = readMoney(itemPrice, "Item price");
  if (price.error) return fail(price.error);

  const qty = toNumber(quantity);
  if (Number.isNaN(qty) || !Number.isInteger(qty) || qty < 1) {
    return fail("Quantity must be a whole number of 1 or more.");
  }
  if (qty > MAX_QUANTITY) {
    return fail(`Quantity above ${MAX_QUANTITY} is outside this estimator — that is a commercial consignment.`);
  }

  const rate = toNumber(exchangeRate);
  if (Number.isNaN(rate)) return fail("Exchange rate must be a number.");
  if (rate <= 0) return fail("Exchange rate must be greater than zero.");

  const fr = readMoney(freight, "Freight");
  if (fr.error) return fail(fr.error);
  const ins = readMoney(insurance, "Insurance");
  if (ins.error) return fail(ins.error);

  const bcdPct = readRate(bcdRate, "Basic Customs Duty rate", MAX_BCD_RATE);
  if (bcdPct.error) return fail(bcdPct.error);
  const igstPct = readRate(igstRate, "IGST rate", MAX_IGST_RATE);
  if (igstPct.error) return fail(igstPct.error);
  const swsPct = readRate(swsRate, "Social Welfare Surcharge rate", 100);
  if (swsPct.error) return fail(swsPct.error);

  const handling = readMoney(handlingFeeInr, "Courier handling fee");
  if (handling.error) return fail(handling.error);

  const goodsInr = rupees(price.value * qty * rate);
  const freightInr = rupees(fr.value * rate);
  const insuranceInr = rupees(ins.value * rate);
  const assessableValue = goodsInr + freightInr + insuranceInr;

  if (assessableValue > MAX_VALUE_INR) {
    return fail("That assessable value is above ₹1,000 crore — outside what this estimator will price.");
  }

  const giftExemptionApplied = Boolean(isGift) && assessableValue <= GIFT_EXEMPTION_LIMIT_INR;

  const bcd = giftExemptionApplied ? 0 : rupees((assessableValue * bcdPct.value) / 100);
  const sws = giftExemptionApplied ? 0 : rupees((bcd * swsPct.value) / 100);
  const igstBase = assessableValue + bcd + sws;
  const igst = giftExemptionApplied ? 0 : rupees((igstBase * igstPct.value) / 100);

  const totalDuty = bcd + sws + igst;
  const landedCost = assessableValue + totalDuty + rupees(handling.value);
  const effectiveDutyRate = assessableValue > 0 ? (totalDuty / assessableValue) * 100 : 0;

  const lines = [
    line("goods", qty > 1 ? `Item cost (FOB) — ${qty} units` : "Item cost (FOB)", goodsInr),
    line("freight", "Freight", freightInr, "Rule 10(2), Customs Valuation Rules 2007"),
    line("insurance", "Insurance", insuranceInr, "Rule 10(1)(d), Customs Valuation Rules 2007"),
    line(
      "av",
      "Assessable value (CIF)",
      assessableValue,
      "Section 14, Customs Act 1962. The 1% landing charge was removed with effect from 26.09.2017."
    ),
    line("bcd", `Basic Customs Duty @ ${bcdPct.value}%`, bcd, "First Schedule, Customs Tariff Act 1975"),
    line("sws", `Social Welfare Surcharge @ ${swsPct.value}% of BCD`, sws, "Section 110, Finance Act 2018"),
    line(
      "igst",
      `IGST @ ${igstPct.value}% on ₹${igstBase.toLocaleString("en-IN")}`,
      igst,
      "Sections 3(7) and 3(8), Customs Tariff Act 1975 — IGST sits on value plus duties"
    ),
    line("duty", "Total duty and tax", totalDuty),
    line("handling", "Courier handling / clearance fee", rupees(handling.value), "Charged by the courier, not by customs"),
    line("landed", "Landed cost", landedCost),
  ];

  return {
    route: "courier",
    goodsInr,
    freightInr,
    insuranceInr,
    assessableValue,
    bcd,
    sws,
    igst,
    igstBase,
    totalDuty,
    handlingFee: rupees(handling.value),
    landedCost,
    effectiveDutyRate,
    giftExemptionApplied,
    giftLimit: GIFT_EXEMPTION_LIMIT_INR,
    lines,
  };
}

/**
 * Residual freight and insurance under the Customs Valuation Rules 2007 where
 * the actual figures are not ascertainable. Returned in the SAME currency as
 * the FOB value passed in.
 */
export function estimateFreightAndInsurance(unitPrice, quantity = 1) {
  const unit = toNumber(unitPrice);
  const qty = toNumber(quantity);
  if (Number.isNaN(unit) || unit < 0) return { error: "FOB value must be a number of 0 or more." };
  if (Number.isNaN(qty) || !Number.isInteger(qty) || qty < 1) {
    return { error: "Quantity must be a whole number of 1 or more." };
  }
  const fob = unit * qty;
  return {
    fob,
    freight: (fob * DEEMED_FREIGHT_PCT) / 100,
    insurance: (fob * DEEMED_INSURANCE_PCT) / 100,
    freightPct: DEEMED_FREIGHT_PCT,
    insurancePct: DEEMED_INSURANCE_PCT,
  };
}

/* ------------------------------------------------------------------ */
/* Route 2 — carried in accompanied baggage                            */
/* ------------------------------------------------------------------ */

/**
 * Baggage duty under the Baggage Rules, 2016.
 *
 *   Dutiable value = goods value - free laptop (if claimed) - free allowance
 *   Duty           = dutiable value x 35% BCD, plus 10% SWS on that BCD
 *                  = dutiable value x 38.5%
 *
 * Annexure I goods (a flat-panel TV, for instance) get no allowance at all, so
 * their whole value is dutiable.
 */
export function computeBaggageDuty(input = {}) {
  const {
    itemPrice,
    quantity = 1,
    exchangeRate = 1,
    freeAllowanceInr = 0,
    isAnnexureI = false,
    claimLaptopExemption = false,
    laptopPrice = 0,
    passengerAge = 18,
  } = input;

  const price = readMoney(itemPrice, "Goods value");
  if (price.error) return fail(price.error);

  const qty = toNumber(quantity);
  if (Number.isNaN(qty) || !Number.isInteger(qty) || qty < 1) {
    return fail("Quantity must be a whole number of 1 or more.");
  }
  if (qty > MAX_QUANTITY) {
    return fail(`Quantity above ${MAX_QUANTITY} is outside this estimator.`);
  }

  const rate = toNumber(exchangeRate);
  if (Number.isNaN(rate)) return fail("Exchange rate must be a number.");
  if (rate <= 0) return fail("Exchange rate must be greater than zero.");

  const allowance = readMoney(freeAllowanceInr, "Free allowance");
  if (allowance.error) return fail(allowance.error);

  const laptop = readMoney(laptopPrice, "Laptop value");
  if (laptop.error) return fail(laptop.error);

  const age = toNumber(passengerAge);
  if (Number.isNaN(age) || age < 0 || age > 120) {
    return fail("Passenger age must be between 0 and 120.");
  }

  const goodsInr = rupees(price.value * qty * rate);
  if (goodsInr > MAX_VALUE_INR) {
    return fail("That baggage value is above ₹1,000 crore — outside what this estimator will price.");
  }

  const laptopEligible = Boolean(claimLaptopExemption) && age >= LAPTOP_EXEMPTION_MIN_AGE;
  const laptopInr = laptopEligible ? Math.min(rupees(laptop.value * rate), goodsInr) : 0;
  const laptopRejectedForAge = Boolean(claimLaptopExemption) && !laptopEligible;

  const valueAfterLaptop = goodsInr - laptopInr;

  const allowanceAvailable = isAnnexureI ? 0 : rupees(allowance.value);
  const allowanceUsed = Math.min(allowanceAvailable, valueAfterLaptop);
  const dutiableValue = valueAfterLaptop - allowanceUsed;

  const bcd = rupees((dutiableValue * BAGGAGE_BCD_RATE) / 100);
  const sws = rupees((bcd * SWS_RATE) / 100);
  const totalDuty = bcd + sws;
  const landedCost = goodsInr + totalDuty;
  const effectiveDutyRate = goodsInr > 0 ? (totalDuty / goodsInr) * 100 : 0;

  const lines = [
    line("goods", qty > 1 ? `Goods value carried — ${qty} units` : "Goods value carried", goodsInr),
    line(
      "laptop",
      "Less: one laptop, duty free",
      -laptopInr,
      "Notification No. 11/2004-Customs — one laptop for a passenger aged 18 or above"
    ),
    line(
      "allowance",
      "Less: duty-free allowance used",
      -allowanceUsed,
      isAnnexureI
        ? "No allowance — this item is in Annexure I to the Baggage Rules, 2016"
        : "Rule 3 / Rule 4 / Rule 6, Baggage Rules 2016"
    ),
    line("dutiable", "Dutiable value", dutiableValue),
    line("bcd", `Basic Customs Duty @ ${BAGGAGE_BCD_RATE}%`, bcd, "Heading 9803, Notification No. 26/2016-Customs"),
    line("sws", `Social Welfare Surcharge @ ${SWS_RATE}% of BCD`, sws, "Section 110, Finance Act 2018"),
    line("duty", `Total baggage duty (${BAGGAGE_ALL_IN_RATE}% of the dutiable value)`, totalDuty),
    line("landed", "Landed cost", landedCost),
  ];

  return {
    route: "baggage",
    goodsInr,
    laptopExemptionInr: laptopInr,
    laptopRejectedForAge,
    allowanceAvailable,
    allowanceUsed,
    allowanceUnused: Math.max(0, allowanceAvailable - allowanceUsed),
    dutiableValue,
    bcd,
    sws,
    totalDuty,
    landedCost,
    effectiveDutyRate,
    allInRate: BAGGAGE_ALL_IN_RATE,
    isAnnexureI: Boolean(isAnnexureI),
    withinAllowance: dutiableValue === 0,
    lines,
  };
}

/* ------------------------------------------------------------------ */
/* Route 3 — gold and silver in baggage                                */
/* ------------------------------------------------------------------ */

/**
 * Gold and silver carried by a passenger.
 *
 * Rule 5 of the Baggage Rules, 2016 gives a free jewellery allowance ONLY to a
 * passenger who has resided abroad for more than one year: 20 g capped at
 * ₹50,000 for a gentleman, 40 g capped at ₹1,00,000 for a lady. Both caps bind.
 *
 * Beyond that, an "eligible passenger" — one who has stayed abroad at least six
 * months — pays the concessional 6% (5% BCD + 1% AIDC) plus 3% IGST, within a
 * 1 kg gold / 10 kg silver ceiling. A passenger who has not been abroad six
 * months is not eligible for the concession and the metal is charged at the
 * ordinary baggage rate of 38.5%.
 */
export function computeMetalBaggage(input = {}) {
  const {
    metal = "gold",
    form = "jewellery",
    grams,
    pricePerGram,
    exchangeRate = 1,
    gender = "male",
    stayAbroadMonths = 0,
  } = input;

  if (metal !== "gold" && metal !== "silver") {
    return fail("Metal must be gold or silver.");
  }
  if (form !== "jewellery" && form !== "bars-coins") {
    return fail("Form must be jewellery or bars/coins.");
  }
  if (gender !== "male" && gender !== "female") {
    return fail("Passenger must be recorded as a gentleman or a lady passenger — Rule 5 sets different caps.");
  }

  const weight = toNumber(grams);
  if (Number.isNaN(weight)) return fail("Weight must be a number of grams.");
  if (weight < 0) return fail("Weight cannot be negative.");
  if (weight > MAX_GRAMS) {
    return fail(`Weight above ${MAX_GRAMS.toLocaleString("en-IN")} g is outside this estimator.`);
  }

  const perGram = readMoney(pricePerGram, "Price per gram");
  if (perGram.error) return fail(perGram.error);

  const rate = toNumber(exchangeRate);
  if (Number.isNaN(rate)) return fail("Exchange rate must be a number.");
  if (rate <= 0) return fail("Exchange rate must be greater than zero.");

  const months = toNumber(stayAbroadMonths);
  if (Number.isNaN(months) || months < 0 || months > 600) {
    return fail("Stay abroad must be between 0 and 600 months.");
  }

  const perGramInr = perGram.value * rate;
  const totalValue = rupees(weight * perGramInr);
  if (totalValue > MAX_VALUE_INR) {
    return fail("That metal value is above ₹1,000 crore — outside what this estimator will price.");
  }

  // --- Rule 5 free jewellery allowance -----------------------------
  const caps = JEWELLERY_FREE_ALLOWANCE[gender];
  const rule5Available =
    metal === "gold" && form === "jewellery" && months > JEWELLERY_MIN_STAY_MONTHS;

  let freeGrams = 0;
  let freeValue = 0;
  if (rule5Available && perGramInr > 0) {
    freeGrams = Math.min(weight, caps.grams);
    const valueAtFreeGrams = freeGrams * perGramInr;
    if (valueAtFreeGrams > caps.valueInr) {
      freeValue = caps.valueInr;
      freeGrams = caps.valueInr / perGramInr;
    } else {
      freeValue = valueAtFreeGrams;
    }
  }
  freeValue = rupees(freeValue);

  const dutiableValue = Math.max(0, totalValue - freeValue);
  const dutiableGrams = Math.max(0, weight - freeGrams);

  // --- Which rate applies ------------------------------------------
  const eligiblePassenger = months >= ELIGIBLE_PASSENGER_MIN_STAY_MONTHS;
  const weightCap = metal === "gold" ? GOLD_WEIGHT_CAP_GRAMS : SILVER_WEIGHT_CAP_GRAMS;
  const overWeightCap = weight > weightCap;

  let bcd = 0;
  let sws = 0;
  let igst = 0;
  let bcdRateUsed = 0;
  let basis = "";

  if (eligiblePassenger) {
    bcdRateUsed = METAL_CONCESSIONAL_BCD_RATE;
    bcd = rupees((dutiableValue * METAL_CONCESSIONAL_BCD_RATE) / 100);
    sws = rupees((bcd * METAL_SWS_RATE) / 100);
    igst = rupees(((dutiableValue + bcd + sws) * METAL_IGST_RATE) / 100);
    basis =
      "Eligible passenger — stayed abroad at least 6 months. Concessional 6% (5% BCD + 1% AIDC) under Notification No. 50/2017-Customs as amended on 23.07.2024, Social Welfare Surcharge exempt, plus 3% IGST.";
  } else {
    bcdRateUsed = BAGGAGE_BCD_RATE;
    bcd = rupees((dutiableValue * BAGGAGE_BCD_RATE) / 100);
    sws = rupees((bcd * SWS_RATE) / 100);
    igst = 0;
    basis = `Stay abroad is under ${ELIGIBLE_PASSENGER_MIN_STAY_MONTHS} months, so the passenger is not an "eligible passenger" for the concessional metal rate. The ordinary baggage rate of ${BAGGAGE_ALL_IN_RATE}% applies.`;
  }

  const totalDuty = bcd + sws + igst;
  const landedCost = totalValue + totalDuty;
  const effectiveDutyRate = totalValue > 0 ? (totalDuty / totalValue) * 100 : 0;

  const lines = [
    line("value", `${metal === "gold" ? "Gold" : "Silver"} value — ${weight} g`, totalValue),
    line(
      "free",
      "Less: Rule 5 duty-free jewellery allowance",
      -freeValue,
      rule5Available
        ? `Rule 5, Baggage Rules 2016 — ${caps.grams} g capped at ₹${caps.valueInr.toLocaleString("en-IN")} for a ${gender === "female" ? "lady" : "gentleman"} passenger`
        : `Not available: Rule 5 needs gold jewellery and a stay abroad of more than ${JEWELLERY_MIN_STAY_MONTHS} months`
    ),
    line("dutiable", "Dutiable value", dutiableValue),
    line("bcd", `Customs duty @ ${bcdRateUsed}%`, bcd),
    line("sws", `Social Welfare Surcharge @ ${eligiblePassenger ? METAL_SWS_RATE : SWS_RATE}% of duty`, sws),
    line("igst", `IGST @ ${eligiblePassenger ? METAL_IGST_RATE : 0}%`, igst),
    line("duty", "Total duty and tax", totalDuty),
    line("landed", "Landed cost", landedCost),
  ];

  return {
    route: "metal",
    metal,
    form,
    grams: weight,
    perGramInr,
    totalValue,
    rule5Available,
    freeGrams,
    freeValue,
    dutiableGrams,
    dutiableValue,
    eligiblePassenger,
    weightCap,
    overWeightCap,
    excessGrams: overWeightCap ? weight - weightCap : 0,
    bcdRateUsed,
    bcd,
    sws,
    igst,
    totalDuty,
    landedCost,
    effectiveDutyRate,
    basis,
    lines,
  };
}

/* ------------------------------------------------------------------ */
/* "Is it cheaper abroad?"                                             */
/* ------------------------------------------------------------------ */

/**
 * Compares a computed landed cost against an Indian retail price. It reports
 * the two figures and the gap between them. It does not tell anyone what to do.
 */
export function compareWithIndianPrice({ landedCostInr, indianPriceInr }) {
  const landed = readMoney(landedCostInr, "Landed cost");
  if (landed.error) return fail(landed.error);
  const indian = readMoney(indianPriceInr, "Indian retail price");
  if (indian.error) return fail(indian.error);

  if (indian.value === 0) {
    return fail("Enter the Indian retail price to compare against.");
  }
  if (indian.value > MAX_VALUE_INR) {
    return fail("That Indian price is above ₹1,000 crore — outside what this estimator will compare.");
  }

  const landedCost = rupees(landed.value);
  const indianPrice = rupees(indian.value);
  const difference = indianPrice - landedCost;
  const percentVsIndian = (difference / indianPrice) * 100;

  let cheaperSide = "same";
  if (difference > 0) cheaperSide = "abroad";
  else if (difference < 0) cheaperSide = "india";

  return {
    landedCost,
    indianPrice,
    difference,
    absDifference: Math.abs(difference),
    percentVsIndian,
    cheaperSide,
  };
}

/* ------------------------------------------------------------------ */
/* Plain-text summary for the copy button                              */
/* ------------------------------------------------------------------ */

export function formatResultText({ heading, result, category, stamp, comparison }) {
  if (!result || result.error) return result?.error || "No result.";
  const fmt = (n) =>
    `${n < 0 ? "-" : ""}₹${Math.abs(Math.round(n)).toLocaleString("en-IN")}`;

  const rows = result.lines
    .filter((item) => item.amount !== 0 || item.key === "dutiable" || item.key === "duty")
    .map((item) => `${item.label}: ${fmt(item.amount)}`);

  const parts = [heading];
  if (category) {
    parts.push(`Assumed classification: ${category.label} — HSN heading ${category.hsn} (Chapter ${category.chapter})`);
  }
  parts.push("");
  parts.push(...rows);
  parts.push("");
  parts.push(`Effective duty rate: ${result.effectiveDutyRate.toFixed(2)}% of ${result.route === "courier" ? "assessable value" : "goods value"}`);

  if (comparison && !comparison.error) {
    parts.push("");
    parts.push(`Indian retail price: ${fmt(comparison.indianPrice)}`);
    parts.push(`Landed cost: ${fmt(comparison.landedCost)}`);
    parts.push(
      `Difference: ${fmt(comparison.absDifference)} (${Math.abs(comparison.percentVsIndian).toFixed(1)}% ${comparison.cheaperSide === "abroad" ? "below" : comparison.cheaperSide === "india" ? "above" : "of"} the Indian price)`
    );
  }

  parts.push("");
  parts.push(stamp);
  parts.push("Estimate on the rates encoded in this tool. Not a customs valuation and not advice.");
  return parts.join("\n");
}
