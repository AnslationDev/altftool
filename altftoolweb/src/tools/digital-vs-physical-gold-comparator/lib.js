/**
 * Cost comparison across gold formats.
 *
 * Every gold format holds the same metal, so the only thing that differs is friction. This
 * module prices that friction in four places and reports what is left at the end:
 *
 *   1. ENTRY.  acquisition = gold value + entry charge + GST
 *              entry charge = gold value x charge% + flat charge
 *              GST is charged on the gold plus the charge, because jewellery is supplied
 *              as a composite supply and the whole invoice value carries the 3% rate.
 *
 *   2. CARRY.  a percentage-of-assets cost each year — a fund's expense ratio, a vault
 *              storage fee — compounds against the price, so the metal grows at
 *                   (1 + appreciation) x (1 - annual cost)      per year
 *              Flat annual charges (a demat account fee) are simply summed.
 *
 *   3. EXIT.   sale proceeds = value x (1 - exit deduction), covering a buyback discount
 *              on jewellery, a bid-ask spread on digital gold, or exit brokerage.
 *
 *   4. TAX.    applied to the gain, at a rate you supply. Capital gains rules and holding
 *              periods for gold and gold funds have changed more than once recently, so the
 *              rate is an input rather than a hardcoded assumption — confirm yours before
 *              relying on the net figure.
 *
 * The comparison then reports the effective cost per gram at entry, the total friction paid
 * across the holding period, and the annualised return actually realised.
 *
 * The charge percentages supplied as defaults are typical market figures, not regulated
 * rates. Making charges, platform spreads and expense ratios vary widely — replace them
 * with the numbers on your own invoice or scheme document.
 */

/** GST on gold in India: 1.5% CGST plus 1.5% SGST on the invoice value of the supply. */
export const GST_ON_GOLD_PCT = 3;
/** BIS hallmarking charge levied per article on hallmarked jewellery, before GST. */
export const HALLMARKING_CHARGE_PER_ARTICLE = 45;
/** Exchange-traded gold carries no GST on the metal; GST at 18% applies only to brokerage. */
export const GST_ON_BROKERAGE_PCT = 18;

export const MAX_YEARS = 50;
export const MAX_GRAMS = 100000;

/**
 * Default cost profile for each format. Percentages are typical market figures meant to be
 * edited — only the GST rate and the hallmarking charge are set by rule.
 */
export const FORMATS = [
  {
    key: "jewellery",
    label: "Gold jewellery",
    note: "Making charges are never recovered on resale.",
    entryChargePct: 12,
    flatCharge: HALLMARKING_CHARGE_PER_ARTICLE,
    gstPct: GST_ON_GOLD_PCT,
    annualCostPct: 0,
    annualFlatFee: 0,
    exitDeductionPct: 3,
  },
  {
    key: "coin",
    label: "Coins and bars",
    note: "A minting premium instead of making charges, and a smaller buyback discount.",
    entryChargePct: 4,
    flatCharge: 0,
    gstPct: GST_ON_GOLD_PCT,
    annualCostPct: 0,
    annualFlatFee: 0,
    exitDeductionPct: 2,
  },
  {
    key: "digital",
    label: "Digital gold",
    note: "The platform's buy-sell spread is the real cost; storage is free only for a limited period.",
    entryChargePct: 3,
    flatCharge: 0,
    gstPct: GST_ON_GOLD_PCT,
    annualCostPct: 0,
    annualFlatFee: 0,
    exitDeductionPct: 3,
  },
  {
    key: "etf",
    label: "Gold ETF",
    note: "No GST on the metal; the entry charge is brokerage including 18% GST on it.",
    entryChargePct: 0.35,
    flatCharge: 0,
    gstPct: 0,
    annualCostPct: 0.55,
    annualFlatFee: 300,
    exitDeductionPct: 0.35,
  },
];

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

const round0 = (value) => Math.round(value);
const round2 = (value) => Math.round(value * 100) / 100;

function evaluateFormat(format, context) {
  const label = (format && format.label && String(format.label).trim()) || "Format";
  const entryPct = toNumber(format && format.entryChargePct);
  const flat = toNumber(format && format.flatCharge);
  const gstPct = toNumber(format && format.gstPct);
  const annualPct = toNumber(format && format.annualCostPct);
  const annualFlat = toNumber(format && format.annualFlatFee);
  const exitPct = toNumber(format && format.exitDeductionPct);

  const all = [entryPct, flat, gstPct, annualPct, annualFlat, exitPct];
  if (all.some((value) => Number.isNaN(value))) return { error: `Enter valid numbers for ${label}.` };
  if (all.some((value) => value < 0)) return { error: `Charges for ${label} cannot be negative.` };
  if (entryPct > 100 || exitPct > 100 || annualPct > 100 || gstPct > 100) {
    return { error: `Percentage charges for ${label} must be 100% or less.` };
  }

  const { goldValue, grams, years, appreciation, taxPct } = context;

  const entryCharge = (goldValue * entryPct) / 100 + flat;
  const gst = ((goldValue + entryCharge) * gstPct) / 100;
  const acquisition = goldValue + entryCharge + gst;

  const priceGrowth = Math.pow(1 + appreciation / 100, years);
  const carryFactor = Math.pow(1 - annualPct / 100, years);
  const valueNoCarry = goldValue * priceGrowth;
  const valueAfterCarry = valueNoCarry * carryFactor;

  const exitDeduction = (valueAfterCarry * exitPct) / 100;
  const flatFees = annualFlat * years;
  const proceedsBeforeTax = valueAfterCarry - exitDeduction - flatFees;

  const gain = proceedsBeforeTax - acquisition;
  const tax = gain > 0 ? (gain * taxPct) / 100 : 0;
  const net = proceedsBeforeTax - tax;

  const carryCost = valueNoCarry - valueAfterCarry;
  const totalFriction = entryCharge + gst + carryCost + exitDeduction + flatFees;

  let annualisedPct = null;
  if (years > 0 && acquisition > 0 && net > 0) {
    annualisedPct = (Math.pow(net / acquisition, 1 / years) - 1) * 100;
  }

  return {
    key: format.key,
    label,
    note: format.note || "",
    entryChargePct: round2(entryPct),
    entryCharge: round0(entryCharge),
    gstPct: round2(gstPct),
    gst: round0(gst),
    acquisition: round0(acquisition),
    costPerGram: grams > 0 ? round2(acquisition / grams) : null,
    premiumOverSpotPct: goldValue > 0 ? round2(((acquisition - goldValue) / goldValue) * 100) : 0,
    annualCostPct: round2(annualPct),
    annualFlatFee: round0(annualFlat),
    carryCost: round0(carryCost),
    flatFees: round0(flatFees),
    carryTotal: round0(carryCost + flatFees),
    exitDeductionPct: round2(exitPct),
    exitDeduction: round0(exitDeduction),
    valueAtSale: round0(valueAfterCarry),
    proceedsBeforeTax: round0(proceedsBeforeTax),
    gain: round0(gain),
    tax: round0(tax),
    net: round0(net),
    profit: round0(net - acquisition),
    totalFriction: round0(totalFriction),
    frictionPct: goldValue > 0 ? round2((totalFriction / goldValue) * 100) : 0,
    annualisedPct: annualisedPct === null ? null : round2(annualisedPct),
  };
}

/**
 * @param {object} input
 * @param {number|string} input.spotPerGram Spot gold price per gram at purchase.
 * @param {number|string} input.grams Quantity bought, in grams.
 * @param {number|string} [input.years] Holding period.
 * @param {number|string} [input.appreciationPct] Assumed price growth, % per year.
 * @param {number|string} [input.taxPct] Tax on the gain, % — supply your own applicable rate.
 * @param {Array} [input.formats] Cost profile per format.
 */
export function compareGoldFormats({
  spotPerGram,
  grams,
  years = 5,
  appreciationPct = 8,
  taxPct = 0,
  formats = FORMATS,
} = {}) {
  const spot = toNumber(spotPerGram);
  const weight = toNumber(grams);
  const holding = toNumber(years);
  const appreciation = toNumber(appreciationPct);
  const tax = toNumber(taxPct);

  if ([spot, weight, holding, appreciation, tax].some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (!(spot > 0)) return { error: "Enter the spot gold price per gram." };
  if (!(weight > 0)) return { error: "Enter the quantity of gold in grams." };
  if (weight > MAX_GRAMS) return { error: `Enter ${MAX_GRAMS} grams or less.` };
  if (holding < 0 || holding > MAX_YEARS) {
    return { error: `Holding period must be between 0 and ${MAX_YEARS} years.` };
  }
  if (appreciation < -50 || appreciation > 50) {
    return { error: "Assume a price change between -50% and +50% a year." };
  }
  if (tax < 0 || tax > 50) return { error: "Enter a tax rate between 0% and 50%." };
  if (!Array.isArray(formats) || formats.length === 0) {
    return { error: "Add at least one gold format to compare." };
  }

  const goldValue = spot * weight;
  const context = { goldValue, grams: weight, years: holding, appreciation, taxPct: tax };

  const rows = [];
  for (const format of formats) {
    const row = evaluateFormat(format, context);
    if (row.error) return { error: row.error };
    rows.push(row);
  }

  // Ranked on total friction, not on sale proceeds: each format buys the same metal, so the
  // one that loses least to charges is the better buy. Comparing proceeds would flatter the
  // format that simply had less money put into it.
  const ranked = [...rows].sort((a, b) => a.totalFriction - b.totalFriction);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];
  const cheapestEntry = [...rows].sort((a, b) => a.acquisition - b.acquisition)[0];
  const withReturn = rows.filter((row) => row.annualisedPct !== null);
  const bestByReturn = withReturn.length
    ? withReturn.reduce((top, row) => (row.annualisedPct > top.annualisedPct ? row : top))
    : null;

  return {
    spotPerGram: round2(spot),
    grams: round2(weight),
    goldValue: round0(goldValue),
    years: round2(holding),
    appreciationPct: round2(appreciation),
    taxPct: round2(tax),
    rows,
    ranked,
    best,
    worst,
    cheapestEntry,
    bestByReturn,
    extraCostOfWorst: round0(worst.totalFriction - best.totalFriction),
  };
}
