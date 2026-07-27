/**
 * Travel cash-versus-card planner for an Indian traveller.
 *
 * The model answers one question: of everything you are going to spend on the
 * ground, how much has to leave India as physical currency notes, and what does
 * that choice cost against putting the same spend on a card?
 *
 * Four real rule sets drive the money side, and all of them are Indian rules
 * rather than destination rules:
 *
 * 1. GST on buying foreign exchange. Rule 32(2)(b) of the CGST Rules sets the
 *    *value of supply* for a money-changing service on a slab, and GST at 18%
 *    is charged on that value — not on the currency itself. The slab is 1% of
 *    the gross amount up to Rs 1,00,000 (minimum Rs 250); Rs 1,000 plus 0.5% of
 *    the amount above Rs 1,00,000 up to Rs 10,00,000; and Rs 5,500 plus 0.1% of
 *    the amount above Rs 10,00,000, capped at a value of Rs 60,000. So on
 *    Rs 1,00,000 of notes the GST is 18% of Rs 1,000 = Rs 180.
 *
 * 2. The RBI cap on carrying notes. A resident travelling abroad may carry
 *    foreign exchange in the form of currency notes and coins up to the
 *    equivalent of USD 3,000 per visit; anything beyond that has to travel as a
 *    forex card, traveller's cheque or banker's draft. A few destinations are
 *    excepted (higher or unlimited note allowances apply to some countries and
 *    to Haj/Umrah travel).
 *
 * 3. Customs declaration on the way back. Foreign exchange brought into India
 *    must be declared on a Currency Declaration Form if the currency notes
 *    alone exceed USD 5,000 equivalent, or the aggregate of notes plus
 *    traveller's cheques exceeds USD 10,000 equivalent.
 *
 * 4. TCS under the Liberalised Remittance Scheme. Section 206C(1G) collects tax
 *    at source on LRS remittances beyond a per-financial-year threshold, raised
 *    to Rs 10,00,000 with effect from 1 April 2025, at 20% on the excess for
 *    ordinary travel remittances. TCS is not a cost: it is credited against
 *    your income tax and refundable if you have no liability. Buying notes and
 *    loading a forex or debit card count towards LRS; spending abroad on an
 *    international *credit* card has been kept outside LRS pending further
 *    notification, which is why the card type changes the figure.
 *
 * The card side is simpler: the issuer converts at a rate close to the
 * mid-market rate and adds a foreign-currency markup, and GST at 18% applies to
 * that markup fee.
 *
 * Pure module: no clock, no network, no DOM. Every rate and limit is a named
 * constant with its source in the comment above it.
 */

/**
 * The Indonesian rupiah. Bank Indonesia notes run 1,000, 2,000, 5,000, 10,000,
 * 20,000, 50,000 and 100,000 rupiah, with 100,000 the largest.
 *
 * Indonesia is cash-heavy away from malls and chain hotels: warungs, scooter
 * hire, temple donations, guides, parking attendants and beach vendors all
 * expect notes.
 *
 * Two local quirks drive the arithmetic. ATM withdrawal ceilings depend on the
 * denomination the machine is loaded with — a machine dispensing 100,000 notes
 * lets you take out far more per transaction than one loaded with 50,000 notes
 * — and most machines charge a fee per withdrawal, so the number of trips to
 * the ATM matters as much as the total.
 */
export const CURRENCY = {
  code: "IDR",
  name: "Indonesian rupiah",
  plural: "rupiah",
  symbol: "Rp ",
  country: "Indonesia",
  defaultInrPerUnit: 0.0053,
  notes: [100000, 50000, 20000, 10000, 5000, 2000, 1000],
  cashRoundingStep: 100000,
  defaultCashSharePct: 55,
  defaultCashMarkupPct: 1.5,
  defaultOneOffCash: 0,
  defaultAtmWithdrawal: 2500000,
  spendStyles: [
    { id: "budget", label: "Budget", perDay: 500000 },
    { id: "mid", label: "Mid-range", perDay: 1200000 },
    { id: "comfort", label: "Comfortable", perDay: 2500000 },
  ],
  cashFacts: [
    "Warungs, scooter hire, temple donations, local guides, parking attendants and beach vendors are cash-only.",
    "How much an Indonesian ATM gives per transaction depends on the note it is loaded with — machines stocked with Rp 100,000 notes dispense far more than those stocked with Rp 50,000 notes.",
    "Use ATMs attached to bank branches or inside malls rather than standalone machines, and cover the keypad; card skimming has been a recurring problem in tourist areas.",
    "Changers advertising no commission at unusually good rates sometimes shortchange during the count. Prefer bank-affiliated counters and count the money before leaving.",
    "Hotels, malls, chain restaurants and airlines take cards, but many add a surcharge of around 2% to 3% for card payment.",
  ],
};

/* ------------------------------------------------------------------ statute */

/** GST rate applied to the value of a money-changing supply and to bank fees. */
export const GST_RATE_PCT = 18;

/** Rule 32(2)(b) CGST Rules — value of supply slabs for money changing. */
export const FOREX_SLAB_1_CEILING_INR = 100000;
export const FOREX_SLAB_1_PCT = 1;
export const FOREX_SLAB_1_MIN_VALUE_INR = 250;
export const FOREX_SLAB_2_CEILING_INR = 1000000;
export const FOREX_SLAB_2_BASE_INR = 1000;
export const FOREX_SLAB_2_PCT = 0.5;
export const FOREX_SLAB_3_BASE_INR = 5500;
export const FOREX_SLAB_3_PCT = 0.1;
export const FOREX_MAX_TAXABLE_VALUE_INR = 60000;

/** RBI: currency notes and coins a resident may carry per visit. */
export const RBI_CASH_NOTES_LIMIT_USD = 3000;

/** Customs: Currency Declaration Form thresholds on arrival in India. */
export const CUSTOMS_NOTES_DECLARE_USD = 5000;
export const CUSTOMS_AGGREGATE_DECLARE_USD = 10000;

/** Section 206C(1G): LRS TCS threshold per financial year, from 1 April 2025. */
export const LRS_TCS_THRESHOLD_INR = 1000000;
export const LRS_TCS_RATE_PCT = 20;

/** LRS overall ceiling per resident individual per financial year. */
export const LRS_ANNUAL_LIMIT_USD = 250000;

/** Reference rupee value of one US dollar, used only for the USD-denominated limits. */
export const DEFAULT_INR_PER_USD = 86;

/* ------------------------------------------------------------------- inputs */

/**
 * How a card settles. The distinction matters twice: credit cards are outside
 * LRS for now, and forex cards are pre-loaded so their rate is fixed on the day
 * you load rather than on the day you spend.
 */
export const CARD_TYPES = [
  {
    id: "credit",
    label: "International credit card",
    inLrs: false,
    note: "Spending abroad on a credit card is currently outside LRS, so no TCS is collected on it.",
  },
  {
    id: "forex",
    label: "Prepaid forex card",
    inLrs: true,
    note: "Loading a forex card is an LRS remittance and counts towards the TCS threshold. The rate is locked when you load it.",
  },
  {
    id: "debit",
    label: "Debit card on your Indian account",
    inLrs: true,
    note: "Debit card spending abroad is an LRS remittance and counts towards the TCS threshold.",
  },
];

export const MAX_TRIP_DAYS = 365;
export const MAX_TRAVELLERS = 30;
export const MAX_DAILY_SPEND = 1e9;
export const MAX_MARKUP_PCT = 20;
export const MAX_BUFFER_PCT = 100;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const isCount = (value) => isNum(value) && Number.isInteger(value) && value >= 0;
const round2 = (value) => Math.round(value * 100) / 100;
const round0 = (value) => Math.round(value);

/** Indian digit grouping for the plain-language notes. Deterministic: fixed locale. */
const GROUPED = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const grouped = (value) => GROUPED.format(Math.round(value));
/**
 * Rates can be 86 rupees per dollar or 0.0053 rupees per rupiah, so a fixed
 * number of decimal places would destroy one or the other. Keep eight.
 */
const roundRate = (value) => Math.round(value * 1e8) / 1e8;
const sentenceCase = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);

/** Round a cash figure up to a whole number of the currency's practical step. */
export function roundUpToStep(value, step) {
  if (!isNum(value) || value <= 0) return 0;
  if (!isNum(step) || step <= 0) return round2(value);
  return Math.ceil(value / step) * step;
}

/** Greedy note breakdown of a cash amount, largest note first. */
export function noteBreakdown(amount, notes) {
  if (!isNum(amount) || amount <= 0) return [];
  let remaining = Math.round(amount);
  const out = [];
  for (const note of notes) {
    const count = Math.floor(remaining / note);
    if (count > 0) {
      out.push({ note, count, value: count * note });
      remaining -= count * note;
    }
  }
  if (remaining > 0) out.push({ note: remaining, count: 1, value: remaining, remainder: true });
  return out;
}

/**
 * GST payable on buying foreign exchange, via the Rule 32(2)(b) value of supply.
 *
 * @param {number} grossInr rupees handed over for the currency
 * @returns {{ taxableValue: number, gst: number }}
 */
export function forexConversionGst(grossInr) {
  if (!isNum(grossInr) || grossInr <= 0) return { taxableValue: 0, gst: 0 };
  let taxableValue;
  if (grossInr <= FOREX_SLAB_1_CEILING_INR) {
    taxableValue = Math.max(
      FOREX_SLAB_1_MIN_VALUE_INR,
      (grossInr * FOREX_SLAB_1_PCT) / 100,
    );
  } else if (grossInr <= FOREX_SLAB_2_CEILING_INR) {
    taxableValue =
      FOREX_SLAB_2_BASE_INR +
      ((grossInr - FOREX_SLAB_1_CEILING_INR) * FOREX_SLAB_2_PCT) / 100;
  } else {
    taxableValue = Math.min(
      FOREX_MAX_TAXABLE_VALUE_INR,
      FOREX_SLAB_3_BASE_INR +
        ((grossInr - FOREX_SLAB_2_CEILING_INR) * FOREX_SLAB_3_PCT) / 100,
    );
  }
  return { taxableValue: round2(taxableValue), gst: round2((taxableValue * GST_RATE_PCT) / 100) };
}

/**
 * TCS attributable to one LRS remittance, given what the traveller has already
 * remitted in the same financial year.
 *
 * @param {number} amountInr this remittance
 * @param {number} alreadyUsedInr LRS already used this financial year
 */
export function lrsTcs(amountInr, alreadyUsedInr = 0) {
  const amount = isNum(amountInr) && amountInr > 0 ? amountInr : 0;
  const used = isNum(alreadyUsedInr) && alreadyUsedInr > 0 ? alreadyUsedInr : 0;
  const headroom = Math.max(0, LRS_TCS_THRESHOLD_INR - used);
  const taxable = Math.max(0, amount - headroom);
  return {
    thresholdInr: LRS_TCS_THRESHOLD_INR,
    headroomInr: round2(headroom),
    taxableInr: round2(taxable),
    tcsInr: round2((taxable * LRS_TCS_RATE_PCT) / 100),
  };
}

/**
 * Plan the cash split for a trip.
 *
 * @returns {object} the plan, or { error: string } when an input is unusable
 */
export function planCashBudget({
  tripDays = 1,
  travellers = 1,
  dailySpendPerPerson = 0,
  oneOffCash = 0,
  cashSharePct = CURRENCY.defaultCashSharePct,
  bufferPct = 15,
  inrPerUnit = CURRENCY.defaultInrPerUnit,
  inrPerUsd = DEFAULT_INR_PER_USD,
  cashRateMarkupPct = CURRENCY.defaultCashMarkupPct,
  cardMarkupPct = 3,
  cardTypeId = "credit",
  atmWithdrawalSize = CURRENCY.defaultAtmWithdrawal,
  atmFeeInr = 200,
  lrsAlreadyUsedInr = 0,
} = {}) {
  const cardType = CARD_TYPES.find((entry) => entry.id === cardTypeId);
  if (!cardType) return { error: "Choose a credit, forex or debit card." };

  if (!isCount(tripDays) || tripDays < 1) {
    return { error: "Enter the trip length as a whole number of days, at least one." };
  }
  if (tripDays > MAX_TRIP_DAYS) return { error: `Enter ${MAX_TRIP_DAYS} days or fewer.` };
  if (!isCount(travellers) || travellers < 1) {
    return { error: "Enter at least one traveller as a whole number." };
  }
  if (travellers > MAX_TRAVELLERS) return { error: `Enter ${MAX_TRAVELLERS} travellers or fewer.` };
  if (!isNum(dailySpendPerPerson) || dailySpendPerPerson < 0) {
    return { error: `Enter the daily on-ground spend in ${CURRENCY.code} as a number of zero or more.` };
  }
  if (dailySpendPerPerson > MAX_DAILY_SPEND) {
    return { error: "That daily spend looks mistyped. Check the number of zeros." };
  }
  if (!isNum(oneOffCash) || oneOffCash < 0) {
    return { error: "One-off cash costs must be zero or more." };
  }
  if (!isNum(cashSharePct) || cashSharePct < 0 || cashSharePct > 100) {
    return { error: "The cash share must be between 0% and 100%." };
  }
  if (!isNum(bufferPct) || bufferPct < 0 || bufferPct > MAX_BUFFER_PCT) {
    return { error: `The emergency buffer must be between 0% and ${MAX_BUFFER_PCT}%.` };
  }
  if (!isNum(inrPerUnit) || inrPerUnit <= 0) {
    return { error: `Enter the rate as rupees per 1 ${CURRENCY.code}, greater than zero.` };
  }
  if (!isNum(inrPerUsd) || inrPerUsd <= 0) {
    return { error: "Enter the rupee value of one US dollar, greater than zero." };
  }
  if (!isNum(cashRateMarkupPct) || cashRateMarkupPct < 0 || cashRateMarkupPct > MAX_MARKUP_PCT) {
    return { error: `The money changer's markup must be between 0% and ${MAX_MARKUP_PCT}%.` };
  }
  if (!isNum(cardMarkupPct) || cardMarkupPct < 0 || cardMarkupPct > MAX_MARKUP_PCT) {
    return { error: `The card markup must be between 0% and ${MAX_MARKUP_PCT}%.` };
  }
  if (!isNum(atmWithdrawalSize) || atmWithdrawalSize <= 0) {
    return { error: `Enter the ATM withdrawal size in ${CURRENCY.code}, greater than zero.` };
  }
  if (!isNum(atmFeeInr) || atmFeeInr < 0) {
    return { error: "The ATM fee must be zero or more." };
  }
  if (!isNum(lrsAlreadyUsedInr) || lrsAlreadyUsedInr < 0) {
    return { error: "LRS already used this year must be zero or more." };
  }

  /* ---------------------------------------------------------- the split */

  const groundSpend = dailySpendPerPerson * tripDays * travellers;
  const cashFromDaily = (groundSpend * cashSharePct) / 100;
  const cardSpend = groundSpend - cashFromDaily;
  const cashBeforeBuffer = cashFromDaily + oneOffCash;
  const bufferAmount = (cashBeforeBuffer * bufferPct) / 100;
  const cashNeeded = cashBeforeBuffer + bufferAmount;
  const cashToCarry = roundUpToStep(cashNeeded, CURRENCY.cashRoundingStep);

  /* ------------------------------------------------- what the cash costs */

  const cashMidInr = cashToCarry * inrPerUnit;
  const cashMarkupInr = (cashMidInr * cashRateMarkupPct) / 100;
  const cashGrossInr = cashMidInr + cashMarkupInr;
  const cashGst = forexConversionGst(cashGrossInr);
  const cashAllInInr = cashGrossInr + cashGst.gst;
  const cashEffectiveRate = cashToCarry > 0 ? cashAllInInr / cashToCarry : 0;

  /* ------------------------------------------------- what the card costs */

  const cardMidInr = cardSpend * inrPerUnit;
  const cardMarkupInr = (cardMidInr * cardMarkupPct) / 100;
  const cardMarkupGstInr = (cardMarkupInr * GST_RATE_PCT) / 100;
  const cardAllInInr = cardMidInr + cardMarkupInr + cardMarkupGstInr;
  const cardEffectiveRate = cardSpend > 0 ? cardAllInInr / cardSpend : 0;

  const tripAllInInr = cashAllInInr + cardAllInInr;

  /* -------------------------------------- the two ways of getting the cash */

  // Drawing the same notes from an ATM at the destination instead: the card's
  // foreign-currency markup applies to the withdrawal, GST applies to that
  // markup, and each withdrawal carries a flat issuer fee that also bears GST.
  const withdrawals = cashToCarry > 0 ? Math.ceil(cashToCarry / atmWithdrawalSize) : 0;
  const atmMarkupInr = (cashMidInr * cardMarkupPct) / 100;
  const atmMarkupGstInr = (atmMarkupInr * GST_RATE_PCT) / 100;
  const atmFeeBaseInr = withdrawals * atmFeeInr;
  const atmFeeGstInr = (atmFeeBaseInr * GST_RATE_PCT) / 100;
  const atmTotalInr = cashMidInr + atmMarkupInr + atmMarkupGstInr + atmFeeBaseInr + atmFeeGstInr;
  const cheaperCashRoute = atmTotalInr < cashAllInInr ? "atm" : "changer";
  const cashRouteSavingInr = Math.abs(atmTotalInr - cashAllInInr);

  /* ------------------------------------------- what if it were all one way */

  // Both hypotheticals carry the same emergency buffer and the same rounding as
  // the real plan, otherwise they would look cheaper simply for holding less
  // currency, and the comparison would be meaningless.
  const allCashUnits = roundUpToStep(
    (groundSpend + oneOffCash) * (1 + bufferPct / 100),
    CURRENCY.cashRoundingStep,
  );
  const allCashGrossInr = allCashUnits * inrPerUnit * (1 + cashRateMarkupPct / 100);
  const allCashInr = allCashGrossInr + forexConversionGst(allCashGrossInr).gst;

  // Everything possible on the card. Only the one-off costs that can only be
  // settled in notes are bought as currency, and they carry the buffer too.
  const allCardCardInr =
    groundSpend * inrPerUnit * (1 + (cardMarkupPct / 100) * (1 + GST_RATE_PCT / 100));
  const allCardCashUnits = roundUpToStep(
    oneOffCash * (1 + bufferPct / 100),
    CURRENCY.cashRoundingStep,
  );
  const allCardCashGrossInr = allCardCashUnits * inrPerUnit * (1 + cashRateMarkupPct / 100);
  const allCardInr =
    allCardCardInr + allCardCashGrossInr + forexConversionGst(allCardCashGrossInr).gst;

  /* --------------------------------------------------- statutory checks */

  const cashUsdEquivalent = inrPerUsd > 0 ? cashMidInr / inrPerUsd : 0;
  const overRbiNoteLimit = cashUsdEquivalent > RBI_CASH_NOTES_LIMIT_USD;
  const rbiHeadroomUnits =
    inrPerUnit > 0 ? (RBI_CASH_NOTES_LIMIT_USD * inrPerUsd) / inrPerUnit : 0;

  const lrsAmountInr = cashGrossInr + (cardType.inLrs ? cardMidInr : 0);
  const tcs = lrsTcs(lrsAmountInr, lrsAlreadyUsedInr);

  /* ------------------------------------------------------------ warnings */

  const warnings = [];
  if (groundSpend === 0 && oneOffCash === 0) {
    warnings.push("Nothing is budgeted yet — set a daily on-ground spend to see a cash figure.");
  }
  if (overRbiNoteLimit) {
    warnings.push(
      `That is about USD ${grouped(cashUsdEquivalent)} in notes, above the USD ${grouped(RBI_CASH_NOTES_LIMIT_USD)} per visit a resident may carry as currency. Carry roughly ${CURRENCY.symbol}${grouped(rbiHeadroomUnits)} in notes and move the rest onto a forex card.`,
    );
  }
  if (cashUsdEquivalent > CUSTOMS_NOTES_DECLARE_USD) {
    warnings.push(
      `Unspent notes worth more than USD ${grouped(CUSTOMS_NOTES_DECLARE_USD)} have to be declared to Indian customs on the way back, and the aggregate limit including traveller's cheques is USD ${grouped(CUSTOMS_AGGREGATE_DECLARE_USD)}.`,
    );
  }
  if (tcs.tcsInr > 0) {
    warnings.push(
      `About Rs ${grouped(tcs.taxableInr)} of this crosses the Rs ${grouped(LRS_TCS_THRESHOLD_INR)} LRS threshold for the financial year, so ${LRS_TCS_RATE_PCT}% TCS of roughly Rs ${grouped(tcs.tcsInr)} will be collected. TCS is credited against your income tax, not a fee.`,
    );
  }
  if (cashSharePct >= 80 && CURRENCY.defaultCashSharePct < 50) {
    warnings.push(
      `${sentenceCase(CURRENCY.country)} runs mostly on cards — carrying ${cashSharePct}% of your spend in notes usually means paying the changer's markup on money you did not need to convert.`,
    );
  }
  if (cashSharePct <= 20 && CURRENCY.defaultCashSharePct >= 50) {
    warnings.push(
      `A lot of everyday spending in ${CURRENCY.country} is cash-only. ${cashSharePct}% may leave you short at markets, small kitchens and local transport.`,
    );
  }
  if (bufferPct === 0) {
    warnings.push("With no buffer there is nothing left for a deposit, a missed connection or a closed card.");
  }

  return {
    code: CURRENCY.code,
    symbol: CURRENCY.symbol,
    cardType,
    tripDays,
    travellers,
    groundSpend: round2(groundSpend),
    cashFromDaily: round2(cashFromDaily),
    oneOffCash: round2(oneOffCash),
    bufferAmount: round2(bufferAmount),
    cashNeeded: round2(cashNeeded),
    cashToCarry: round2(cashToCarry),
    cashPerPersonPerDay: round2(cashToCarry / travellers / tripDays),
    cardSpend: round2(cardSpend),
    actualCashSharePct:
      groundSpend + oneOffCash > 0
        ? round2((cashToCarry / (groundSpend + oneOffCash)) * 100)
        : 0,
    notes: noteBreakdown(cashToCarry, CURRENCY.notes),

    cashMidInr: round0(cashMidInr),
    cashMarkupInr: round0(cashMarkupInr),
    cashGstTaxableInr: cashGst.taxableValue,
    cashGstInr: round0(cashGst.gst),
    cashAllInInr: round0(cashAllInInr),
    cashEffectiveRate: roundRate(cashEffectiveRate),

    cardMidInr: round0(cardMidInr),
    cardMarkupInr: round0(cardMarkupInr),
    cardMarkupGstInr: round0(cardMarkupGstInr),
    cardAllInInr: round0(cardAllInInr),
    cardEffectiveRate: roundRate(cardEffectiveRate),

    tripAllInInr: round0(tripAllInInr),
    costOverMidMarketInr: round0(tripAllInInr - (cashMidInr + cardMidInr)),

    atmWithdrawals: withdrawals,
    atmFeesInr: round0(atmFeeBaseInr + atmFeeGstInr),
    atmTotalInr: round0(atmTotalInr),
    cheaperCashRoute,
    cashRouteSavingInr: round0(cashRouteSavingInr),

    allCashUnits: round2(allCashUnits),
    allCashInr: round0(allCashInr),
    allCardCashUnits: round2(allCardCashUnits),
    allCardInr: round0(allCardInr),

    cashUsdEquivalent: round0(cashUsdEquivalent),
    rbiLimitUsd: RBI_CASH_NOTES_LIMIT_USD,
    rbiHeadroomUnits: round0(rbiHeadroomUnits),
    overRbiNoteLimit,
    mustDeclareOnReturn: cashUsdEquivalent > CUSTOMS_NOTES_DECLARE_USD,
    lrsAmountInr: round0(lrsAmountInr),
    tcs,
    warnings,
  };
}
