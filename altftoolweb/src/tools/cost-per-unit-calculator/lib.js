/**
 * Batch costing: absorption cost per unit, contribution and break-even.
 *
 * Standard cost-accounting treatment:
 *
 *   Total variable cost = variable cost per unit STARTED x units started
 *       (material, direct labour, packaging and other variable costs are consumed
 *        by every unit put into the batch, including the ones later rejected)
 *
 *   Fixed overhead absorbed by this batch = period fixed overhead / batches in the period
 *       (the "number of batches" absorption base - CIMA/ICAI cost sheet practice)
 *
 *   Good units = units started x (1 - reject rate)
 *
 *   Absorption (full) cost per unit = (total variable cost + fixed absorbed) / good units
 *
 * Break-even follows the marginal costing identity:
 *
 *   Contribution per unit = selling price - variable cost per GOOD unit
 *   Break-even units      = fixed cost absorbed / contribution per unit
 *
 * Because the cost of rejected units has to be recovered from the units you can
 * actually sell, the variable cost per good unit is higher than the variable cost
 * per unit started whenever the reject rate is above zero.
 */

/** A reject rate at or above this leaves nothing saleable, so costing is undefined. */
export const MAX_REJECT_PERCENT = 100;
/** Sanity ceiling on batch size for a browser-side calculator. */
export const MAX_BATCH_UNITS = 10_000_000;

/** The variable cost lines the calculator collects, in cost-sheet order. */
export const VARIABLE_COST_LINES = [
  { key: "material", label: "Direct material per unit" },
  { key: "labour", label: "Direct labour per unit" },
  { key: "packaging", label: "Packaging per unit" },
  { key: "otherVariable", label: "Other variable cost per unit" },
];

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @param {object} input
 * @param {number} input.unitsStarted        Units put into the batch.
 * @param {number} [input.rejectPercent]     Percentage of started units scrapped.
 * @param {number} [input.material]          Direct material cost per unit started.
 * @param {number} [input.labour]            Direct labour cost per unit started.
 * @param {number} [input.packaging]         Packaging cost per unit started.
 * @param {number} [input.otherVariable]     Any other variable cost per unit started.
 * @param {number} [input.periodFixedCost]   Fixed overhead for the whole period.
 * @param {number} [input.batchesInPeriod]   How many batches share that overhead.
 * @param {number} [input.sellingPrice]      Selling price per good unit.
 * @param {number} [input.targetMarginPercent] Desired net margin ON selling price.
 * @returns {object} breakdown, or { error }.
 */
export function computeBatchCost({
  unitsStarted,
  rejectPercent = 0,
  material = 0,
  labour = 0,
  packaging = 0,
  otherVariable = 0,
  periodFixedCost = 0,
  batchesInPeriod = 1,
  sellingPrice = 0,
  targetMarginPercent = 0,
} = {}) {
  const costs = { material, labour, packaging, otherVariable };

  if (!isNum(unitsStarted)) return { error: "Enter a valid batch size." };
  if (unitsStarted <= 0) return { error: "Batch size must be at least 1 unit." };
  if (unitsStarted > MAX_BATCH_UNITS) {
    return { error: `Batch size must be under ${MAX_BATCH_UNITS.toLocaleString("en-IN")} units.` };
  }
  if (!isNum(rejectPercent) || rejectPercent < 0) return { error: "Reject rate cannot be negative." };
  if (rejectPercent >= MAX_REJECT_PERCENT) {
    return { error: "A 100% reject rate leaves no saleable units to cost." };
  }
  for (const [key, value] of Object.entries(costs)) {
    if (!isNum(value)) return { error: "Every cost line must be a valid number." };
    if (value < 0) return { error: `${key} cost cannot be negative.` };
  }
  if (!isNum(periodFixedCost) || periodFixedCost < 0) {
    return { error: "Fixed overhead cannot be negative." };
  }
  if (!isNum(batchesInPeriod) || batchesInPeriod < 1) {
    return { error: "There must be at least 1 batch in the period." };
  }
  if (!isNum(sellingPrice) || sellingPrice < 0) return { error: "Selling price cannot be negative." };
  if (!isNum(targetMarginPercent) || targetMarginPercent < 0 || targetMarginPercent >= 100) {
    return { error: "Target margin must be between 0% and 99%." };
  }

  const started = Math.floor(unitsStarted);
  const goodUnits = started * (1 - rejectPercent / 100);
  if (!(goodUnits > 0)) return { error: "The reject rate leaves no saleable units." };
  const rejectedUnits = started - goodUnits;

  const variablePerStarted = material + labour + packaging + otherVariable;
  const totalVariableCost = variablePerStarted * started;
  const fixedAbsorbed = periodFixedCost / Math.floor(batchesInPeriod);
  const totalBatchCost = totalVariableCost + fixedAbsorbed;

  const variablePerGoodUnit = totalVariableCost / goodUnits;
  const fixedPerGoodUnit = fixedAbsorbed / goodUnits;
  const fullCostPerUnit = variablePerGoodUnit + fixedPerGoodUnit;
  const scrapCost = variablePerStarted * rejectedUnits;

  const contributionPerUnit = sellingPrice - variablePerGoodUnit;
  const contributionMarginPercent = sellingPrice > 0 ? (contributionPerUnit / sellingPrice) * 100 : 0;

  // Break-even only exists when each unit contributes something towards fixed cost.
  const breakEvenUnits = contributionPerUnit > 0 ? fixedAbsorbed / contributionPerUnit : null;
  const breakEvenRevenue = breakEvenUnits === null ? null : breakEvenUnits * sellingPrice;

  const batchRevenue = sellingPrice * goodUnits;
  const batchProfit = batchRevenue - totalBatchCost;
  const netMarginPercent = batchRevenue > 0 ? (batchProfit / batchRevenue) * 100 : 0;
  const profitPerUnit = sellingPrice - fullCostPerUnit;

  const marginOfSafetyUnits = breakEvenUnits === null ? null : goodUnits - breakEvenUnits;
  const marginOfSafetyPercent =
    breakEvenUnits === null || goodUnits <= 0 ? null : ((goodUnits - breakEvenUnits) / goodUnits) * 100;

  // Price that delivers the requested net margin on selling price: p = cost / (1 - m).
  const suggestedPrice = fullCostPerUnit / (1 - targetMarginPercent / 100);

  return {
    unitsStarted: started,
    goodUnits: round2(goodUnits),
    rejectedUnits: round2(rejectedUnits),
    variablePerStarted: round2(variablePerStarted),
    totalVariableCost: round2(totalVariableCost),
    fixedAbsorbed: round2(fixedAbsorbed),
    totalBatchCost: round2(totalBatchCost),
    variablePerGoodUnit: round2(variablePerGoodUnit),
    fixedPerGoodUnit: round2(fixedPerGoodUnit),
    fullCostPerUnit: round2(fullCostPerUnit),
    scrapCost: round2(scrapCost),
    sellingPrice: round2(sellingPrice),
    contributionPerUnit: round2(contributionPerUnit),
    contributionMarginPercent: round2(contributionMarginPercent),
    breakEvenUnits: breakEvenUnits === null ? null : Math.ceil(breakEvenUnits),
    breakEvenRevenue: breakEvenRevenue === null ? null : round2(breakEvenRevenue),
    batchRevenue: round2(batchRevenue),
    batchProfit: round2(batchProfit),
    netMarginPercent: round2(netMarginPercent),
    profitPerUnit: round2(profitPerUnit),
    marginOfSafetyUnits: marginOfSafetyUnits === null ? null : round2(marginOfSafetyUnits),
    marginOfSafetyPercent: marginOfSafetyPercent === null ? null : round2(marginOfSafetyPercent),
    targetMarginPercent,
    suggestedPrice: round2(suggestedPrice),
  };
}

/**
 * Cost per unit at a different batch size, holding the fixed absorption constant.
 * Shows how spreading the same overhead over more units lowers the unit cost.
 * @param {object} base result of computeBatchCost
 * @param {number} units alternative good-unit count
 * @returns {number|null}
 */
export function unitCostAtVolume(base, units) {
  if (!base || base.error) return null;
  if (!isNum(units) || units <= 0) return null;
  return round2(base.variablePerStarted / (1 - base.rejectedUnits / base.unitsStarted) + base.fixedAbsorbed / units);
}
