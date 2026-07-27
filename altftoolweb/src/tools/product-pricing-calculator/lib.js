/**
 * Product pricing calculator with taxes — pure logic.
 *
 * Pricing from cost is four separate steps, and skipping any of them is what
 * produces a price that looks profitable and is not:
 *
 *   1. Landed unit cost: materials + labour + packaging + inbound shipping +
 *      any other direct cost, plus monthly overhead divided by monthly units.
 *   2. Price before tax, set so the target GROSS MARGIN survives the
 *      marketplace's commission. Because commission is a share of the selling
 *      price, not of cost, the price solves as:
 *
 *          P x (1 - commission) - cost = margin x P
 *          P = cost / (1 - commission - margin)
 *
 *      which has no solution once commission + margin reach 100%.
 *   3. Tax. A tax-exclusive price is multiplied by (1 + rate); a shelf price
 *      quoted inclusive of tax is divided by it to recover the net price.
 *   4. Rounding to a price point, after which the real achieved margin is
 *      recomputed rather than assumed.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Ceilings that catch typos rather than constrain real businesses. */
export const MAX_PERCENT = 100;
export const MAX_UNIT_COST = 1e9;

/** How the tax rate relates to the price you type in. */
export const TAX_MODES = {
  exclusive: { id: "exclusive", label: "Add tax on top of my price (tax-exclusive)" },
  inclusive: { id: "inclusive", label: "My price already includes tax (tax-inclusive)" },
};

/** Common consumption-tax rates, offered as a starting point. Rates change and
 * many countries apply reduced rates by product category — always confirm the
 * rate that applies to your goods. */
export const TAX_PRESETS = [
  { id: "none", label: "No tax", percent: 0 },
  { id: "in-5", label: "India GST 5%", percent: 5 },
  { id: "in-12", label: "India GST 12%", percent: 12 },
  { id: "in-18", label: "India GST 18%", percent: 18 },
  { id: "in-28", label: "India GST 28%", percent: 28 },
  { id: "uk-20", label: "UK VAT standard 20%", percent: 20 },
  { id: "eu-19", label: "Germany VAT standard 19%", percent: 19 },
  { id: "ae-5", label: "UAE VAT 5%", percent: 5 },
  { id: "sg-9", label: "Singapore GST 9%", percent: 9 },
  { id: "au-10", label: "Australia GST 10%", percent: 10 },
];

/** Price-point rounding strategies. */
export const ROUNDING_STRATEGIES = {
  none: { id: "none", label: "No rounding" },
  charm99: { id: "charm99", label: "End in .99" },
  charm95: { id: "charm95", label: "End in .95" },
  whole: { id: "whole", label: "Nearest whole unit" },
  nearest5: { id: "nearest5", label: "Round up to a multiple of 5" },
  nearest10: { id: "nearest10", label: "Round up to a multiple of 10" },
  nearest100: { id: "nearest100", label: "Round up to a multiple of 100" },
};

/**
 * Landed cost of one unit, including a share of fixed overhead.
 *
 * @param {object} input
 * @param {number} input.materials
 * @param {number} input.labour
 * @param {number} [input.packaging]
 * @param {number} [input.shipping] inbound shipping per unit
 * @param {number} [input.other] any other direct cost per unit
 * @param {number} [input.overheadPerMonth] fixed costs to absorb
 * @param {number} [input.unitsPerMonth] units the overhead is spread across
 * @returns {object} cost breakdown, or { error }
 */
export function buildUnitCost({
  materials,
  labour,
  packaging = 0,
  shipping = 0,
  other = 0,
  overheadPerMonth = 0,
  unitsPerMonth = 0,
}) {
  const parts = { materials, labour, packaging, shipping, other };
  for (const [name, value] of Object.entries(parts)) {
    if (!isNum(value) || value < 0) return { error: `The ${name} cost must be zero or more.` };
  }
  if (!isNum(overheadPerMonth) || overheadPerMonth < 0) {
    return { error: "Monthly overhead cannot be negative." };
  }
  if (!isNum(unitsPerMonth) || unitsPerMonth < 0) {
    return { error: "Units a month cannot be negative." };
  }
  if (overheadPerMonth > 0 && unitsPerMonth <= 0) {
    return { error: "Enter how many units a month the overhead is spread across." };
  }

  const variableCost = materials + labour + packaging + shipping + other;
  const overheadPerUnit = unitsPerMonth > 0 ? overheadPerMonth / unitsPerMonth : 0;
  const unitCost = variableCost + overheadPerUnit;

  if (unitCost <= 0) return { error: "The unit cost must be greater than zero to price from it." };
  if (unitCost > MAX_UNIT_COST) return { error: "That unit cost is too large to price." };

  return { variableCost, overheadPerUnit, unitCost, ...parts };
}

/**
 * The price before tax that delivers a target gross margin after commission.
 *
 * @param {object} input
 * @param {number} input.unitCost
 * @param {number} input.targetMarginPercent margin measured on the selling price
 * @param {number} [input.commissionPercent] marketplace or reseller commission
 * @returns {{ price: number } | { error: string }}
 */
export function priceForMargin({ unitCost, targetMarginPercent, commissionPercent = 0 }) {
  if (!isNum(unitCost) || unitCost <= 0) return { error: "The unit cost must be greater than zero." };
  if (!isNum(targetMarginPercent)) return { error: "Enter the target margin as a number." };
  if (targetMarginPercent >= MAX_PERCENT) {
    return { error: "A margin of 100% would need a cost of zero." };
  }
  if (!isNum(commissionPercent) || commissionPercent < 0 || commissionPercent >= MAX_PERCENT) {
    return { error: "Commission must be between 0% and 99%." };
  }
  const denominator = 1 - commissionPercent / 100 - targetMarginPercent / 100;
  if (!(denominator > 0)) {
    return {
      error: "Commission plus target margin reach 100% of the price — no price can deliver that margin.",
    };
  }
  const price = unitCost / denominator;
  if (!Number.isFinite(price)) return { error: "That combination is too large to price." };
  return { price };
}

/**
 * Apply or strip consumption tax.
 *
 * @param {number} price
 * @param {number} taxPercent
 * @param {string} mode key of TAX_MODES — how `price` should be read
 * @returns {{ net: number, tax: number, gross: number } | { error: string }}
 */
export function applyTax(price, taxPercent, mode = "exclusive") {
  if (!isNum(price) || price < 0) return { error: "The price cannot be negative." };
  if (!isNum(taxPercent) || taxPercent < 0 || taxPercent > MAX_PERCENT) {
    return { error: "The tax rate must be between 0% and 100%." };
  }
  if (!TAX_MODES[mode]) return { error: "Choose whether the price includes tax." };
  const rate = taxPercent / 100;
  if (mode === "exclusive") {
    const tax = price * rate;
    return { net: price, tax, gross: price + tax };
  }
  const net = price / (1 + rate);
  return { net, tax: price - net, gross: price };
}

/**
 * Move a price to a price point.
 *
 * @param {number} price
 * @param {string} strategy key of ROUNDING_STRATEGIES
 * @returns {{ price: number } | { error: string }}
 */
export function roundToPricePoint(price, strategy = "none") {
  if (!isNum(price) || price < 0) return { error: "The price cannot be negative." };
  if (!ROUNDING_STRATEGIES[strategy]) return { error: "Choose a rounding strategy." };
  if (strategy === "none") return { price };

  const stepUp = (step) => Math.ceil((price - 1e-9) / step) * step;

  if (strategy === "whole") return { price: Math.ceil(price - 1e-9) };
  if (strategy === "nearest5") return { price: stepUp(5) };
  if (strategy === "nearest10") return { price: stepUp(10) };
  if (strategy === "nearest100") return { price: stepUp(100) };

  // Charm pricing: the next price point ending in .99 or .95 that is not below
  // the calculated price, so rounding never quietly cuts the margin.
  const ending = strategy === "charm99" ? 0.99 : 0.95;
  const floor = Math.floor(price);
  const candidate = floor + ending;
  return { price: candidate >= price - 1e-9 ? candidate : floor + 1 + ending };
}

/**
 * Everything about one price: what it earns after commission and tax, and the
 * margin actually achieved once rounding has moved it.
 *
 * @param {object} input
 * @param {number} input.unitCost
 * @param {number} input.netPrice price before tax
 * @param {number} [input.commissionPercent]
 * @param {number} [input.taxPercent]
 * @returns {object} the outcome, or { error }
 */
export function evaluatePrice({ unitCost, netPrice, commissionPercent = 0, taxPercent = 0 }) {
  if (!isNum(unitCost) || unitCost <= 0) return { error: "The unit cost must be greater than zero." };
  if (!isNum(netPrice) || netPrice <= 0) return { error: "The selling price must be greater than zero." };
  if (!isNum(commissionPercent) || commissionPercent < 0 || commissionPercent >= MAX_PERCENT) {
    return { error: "Commission must be between 0% and 99%." };
  }
  const taxed = applyTax(netPrice, taxPercent, "exclusive");
  if (taxed.error) return { error: taxed.error };

  const commission = netPrice * (commissionPercent / 100);
  const netReceived = netPrice - commission;
  const profit = netReceived - unitCost;

  return {
    unitCost,
    netPrice,
    commission,
    netReceived,
    tax: taxed.tax,
    grossPrice: taxed.gross,
    profit,
    marginPercent: (profit / netPrice) * 100,
    markupPercent: (profit / unitCost) * 100,
    belowCost: profit < 0,
  };
}

/**
 * Units needed to cover fixed costs at a given contribution per unit.
 *
 * @param {object} input
 * @param {number} input.fixedCosts fixed costs for the period
 * @param {number} input.netReceivedPerUnit price after commission
 * @param {number} input.variableCostPerUnit direct cost, excluding overhead
 * @returns {{ contribution: number, units: number } | { error: string }}
 */
export function breakEvenUnits({ fixedCosts, netReceivedPerUnit, variableCostPerUnit }) {
  if (!isNum(fixedCosts) || fixedCosts < 0) return { error: "Fixed costs cannot be negative." };
  if (!isNum(netReceivedPerUnit) || netReceivedPerUnit <= 0) {
    return { error: "The price received per unit must be greater than zero." };
  }
  if (!isNum(variableCostPerUnit) || variableCostPerUnit < 0) {
    return { error: "The variable cost cannot be negative." };
  }
  const contribution = netReceivedPerUnit - variableCostPerUnit;
  if (contribution <= 0) {
    return { error: "Each unit loses money before overheads, so no volume reaches break-even." };
  }
  return { contribution, units: Math.ceil(fixedCosts / contribution) };
}

/**
 * The same cost priced at a ladder of target margins, for choosing a position.
 *
 * @param {object} input { unitCost, commissionPercent, taxPercent }
 * @param {Array<number>} margins
 * @returns {Array<object>}
 */
export function buildMarginLadder(input, margins = [20, 30, 40, 50, 60]) {
  const rows = [];
  for (const targetMarginPercent of margins) {
    const priced = priceForMargin({ ...input, targetMarginPercent });
    if (priced.error) continue;
    const evaluated = evaluatePrice({ ...input, netPrice: priced.price });
    if (evaluated.error) continue;
    rows.push({
      targetMarginPercent,
      netPrice: priced.price,
      grossPrice: evaluated.grossPrice,
      profit: evaluated.profit,
    });
  }
  return rows;
}
