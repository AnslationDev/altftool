/**
 * Cost-Volume-Profit (break-even) analysis.
 *
 * Standard management accounting formulas:
 *   Contribution per unit      = selling price - variable cost per unit
 *   Contribution margin ratio  = contribution per unit / selling price
 *   Break-even units           = fixed costs / contribution per unit
 *   Break-even revenue         = fixed costs / contribution margin ratio
 *   Units for a target profit  = (fixed costs + target profit) / contribution
 *   For an after-tax target, gross the profit up first:
 *                                pre-tax target = after-tax target / (1 - tax rate)
 *   Margin of safety           = expected sales - break-even sales
 *   Degree of operating leverage = total contribution / operating profit
 *
 * A business only has a break-even point when contribution per unit is positive.
 * If the variable cost equals or exceeds the price, every extra unit deepens the
 * loss and no volume can cover the fixed costs.
 */

/** Tax rate is entered as a percentage; anything at or above this is rejected. */
export const MAX_TAX_PERCENT = 99;

/** A contribution margin below this is usually too thin to absorb any cost shock. */
export const THIN_MARGIN_PERCENT = 10;

export function contributionPerUnit(price, variableCost) {
  return price - variableCost;
}

/**
 * @param {object} input
 * @param {number} input.fixedCosts       Fixed costs for the period, INR.
 * @param {number} input.price            Selling price per unit, INR.
 * @param {number} input.variableCost     Variable cost per unit, INR.
 * @param {number} input.expectedUnits    Units you expect to sell in the period.
 * @param {number} input.targetProfit     Profit you want in the period, INR.
 * @param {number} input.taxPercent       Tax on profit, %. 0 treats the target as pre-tax.
 * @returns {object} analysis or { error }
 */
export function breakEven({
  fixedCosts,
  price,
  variableCost,
  expectedUnits = 0,
  targetProfit = 0,
  taxPercent = 0,
}) {
  const nums = [fixedCosts, price, variableCost, expectedUnits, targetProfit, taxPercent];
  if (nums.some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (fixedCosts < 0) return { error: "Fixed costs cannot be negative." };
  if (price <= 0) return { error: "Selling price must be greater than zero." };
  if (variableCost < 0) return { error: "Variable cost per unit cannot be negative." };
  if (expectedUnits < 0) return { error: "Expected units cannot be negative." };
  if (targetProfit < 0) return { error: "Target profit cannot be negative." };
  if (taxPercent < 0 || taxPercent > MAX_TAX_PERCENT) {
    return { error: `Tax rate must be between 0% and ${MAX_TAX_PERCENT}%.` };
  }

  const contribution = contributionPerUnit(price, variableCost);
  if (contribution <= 0) {
    return {
      error:
        variableCost === price
          ? "Price equals variable cost, so each unit contributes nothing and there is no break-even point."
          : "Variable cost is above the selling price, so every unit sold increases the loss. Raise the price or cut the unit cost.",
    };
  }

  const marginRatio = contribution / price;
  const breakEvenUnits = fixedCosts / contribution;
  const breakEvenRevenue = fixedCosts / marginRatio;

  const preTaxTarget = taxPercent > 0 ? targetProfit / (1 - taxPercent / 100) : targetProfit;
  const targetUnits = (fixedCosts + preTaxTarget) / contribution;
  const targetRevenue = targetUnits * price;

  const totalContribution = expectedUnits * contribution;
  const operatingProfit = totalContribution - fixedCosts;
  const expectedRevenue = expectedUnits * price;
  const marginOfSafetyUnits = expectedUnits - breakEvenUnits;
  const marginOfSafetyPercent =
    expectedUnits > 0 ? (marginOfSafetyUnits / expectedUnits) * 100 : null;
  const operatingLeverage = operatingProfit > 0 ? totalContribution / operatingProfit : null;

  return {
    contribution,
    marginRatio: marginRatio * 100,
    thinMargin: marginRatio * 100 < THIN_MARGIN_PERCENT,
    breakEvenUnits,
    breakEvenUnitsRounded: Math.ceil(breakEvenUnits),
    breakEvenRevenue,
    breakEvenPerDay: breakEvenUnits / 30,
    preTaxTarget,
    targetUnits,
    targetUnitsRounded: Math.ceil(targetUnits),
    targetRevenue,
    expectedUnits,
    expectedRevenue,
    totalContribution,
    totalVariableCost: expectedUnits * variableCost,
    operatingProfit,
    profitable: operatingProfit > 0,
    marginOfSafetyUnits,
    marginOfSafetyPercent,
    marginOfSafetyRevenue: marginOfSafetyUnits * price,
    operatingLeverage,
    fixedCosts,
    price,
    variableCost,
  };
}

/**
 * Break-even for a service business that sells hours rather than units.
 * @param {number} fixedCosts    Fixed costs for the period, INR.
 * @param {number} hourlyRate    Billing rate per hour, INR.
 * @param {number} costPerHour   Direct cost of delivering an hour, INR.
 */
export function breakEvenHours(fixedCosts, hourlyRate, costPerHour) {
  const result = breakEven({
    fixedCosts,
    price: hourlyRate,
    variableCost: costPerHour,
  });
  if (result.error) return result;
  return {
    hours: result.breakEvenUnits,
    hoursRounded: Math.ceil(result.breakEvenUnits),
    revenue: result.breakEvenRevenue,
    contributionPerHour: result.contribution,
  };
}
