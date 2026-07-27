/**
 * Profit margin and markup converter — pure logic.
 *
 * Margin and markup describe the same profit against different denominators,
 * which is why quoting one as the other is such a common and expensive error:
 *
 *   markup % = (price - cost) / cost  x 100      profit measured against COST
 *   margin % = (price - cost) / price x 100      profit measured against PRICE
 *
 * Converting between them is exact:
 *
 *   margin = markup / (1 + markup)
 *   markup = margin / (1 - margin)                (margin expressed as a fraction)
 *
 * Markup is always the larger number for a profitable sale. A 50% markup is a
 * 33.33% margin; reaching a 50% margin needs a 100% markup.
 *
 * Boundary conditions that must be guarded, not rounded away:
 *   - margin of 100% would need an infinite markup (cost would be zero)
 *   - markup of -100% puts the price at zero, so no margin exists
 *   - a cost of zero makes markup undefined, since it divides by cost
 *
 * Pure module: no React, no DOM, no clock reads.
 */

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Margin can approach but never reach 100%. */
export const MAX_MARGIN_PERCENT = 100;
/** Markup can fall to but not below -100%, where the price hits zero. */
export const MIN_MARKUP_PERCENT = -100;
/** Sanity ceiling on a quotable markup: 100,000% is a 1,001x multiplier. */
export const MAX_MARKUP_PERCENT = 100000;

/** Retail shorthand people ask about by name. */
export const PRICING_PRESETS = [
  { id: "keystone", label: "Keystone (double the cost)", markupPercent: 100, note: "100% markup = 50% margin" },
  { id: "triple", label: "Triple keystone", markupPercent: 200, note: "200% markup = 66.67% margin" },
  { id: "third", label: "One third on cost", markupPercent: 33.3333, note: "33.33% markup = 25% margin" },
  { id: "half-margin", label: "Half the price is profit", markupPercent: 100, note: "50% margin" },
];

/**
 * Markup percentage -> margin percentage.
 *
 * @param {number} markupPercent
 * @returns {{ marginPercent: number } | { error: string }}
 */
export function markupToMargin(markupPercent) {
  if (!isNum(markupPercent)) return { error: "Enter the markup as a number." };
  if (markupPercent <= MIN_MARKUP_PERCENT) {
    return { error: "A markup of -100% puts the selling price at zero, so there is no margin." };
  }
  if (markupPercent > MAX_MARKUP_PERCENT) {
    return { error: `Keep the markup under ${MAX_MARKUP_PERCENT}%.` };
  }
  const m = markupPercent / 100;
  return { marginPercent: (m / (1 + m)) * 100 };
}

/**
 * Margin percentage -> markup percentage.
 *
 * @param {number} marginPercent
 * @returns {{ markupPercent: number } | { error: string }}
 */
export function marginToMarkup(marginPercent) {
  if (!isNum(marginPercent)) return { error: "Enter the margin as a number." };
  if (marginPercent >= MAX_MARGIN_PERCENT) {
    return { error: "A 100% margin would need an infinite markup — the cost would have to be zero." };
  }
  const m = marginPercent / 100;
  const markupPercent = (m / (1 - m)) * 100;
  if (!Number.isFinite(markupPercent) || markupPercent > MAX_MARKUP_PERCENT) {
    return { error: "That margin needs a markup too large to be meaningful." };
  }
  return { markupPercent };
}

/** What the selling price is as a multiple of cost. Keystone pricing is 2x. */
export function multiplierFromMarkup(markupPercent) {
  if (!isNum(markupPercent)) return { error: "Enter the markup as a number." };
  const multiplier = 1 + markupPercent / 100;
  if (multiplier <= 0) return { error: "That markup gives a selling price of zero or less." };
  return { multiplier };
}

/** Input modes the solver accepts. */
export const SOLVE_MODES = {
  "cost-markup": { id: "cost-markup", label: "Cost and markup %" },
  "cost-margin": { id: "cost-margin", label: "Cost and margin %" },
  "cost-price": { id: "cost-price", label: "Cost and selling price" },
  "price-margin": { id: "price-margin", label: "Selling price and margin %" },
  "price-markup": { id: "price-markup", label: "Selling price and markup %" },
};

/**
 * Solve the whole pricing picture from any two of cost, price, margin, markup.
 *
 * @param {object} input
 * @param {string} input.mode key of SOLVE_MODES
 * @param {number} input.cost
 * @param {number} input.price
 * @param {number} input.percent the margin or markup, depending on the mode
 * @returns {object} { cost, price, profit, markupPercent, marginPercent, multiplier } or { error }
 */
export function solvePricing({ mode, cost, price, percent }) {
  if (!SOLVE_MODES[mode]) return { error: "Choose which two figures you know." };

  let finalCost;
  let finalPrice;

  if (mode === "cost-markup") {
    if (!isNum(cost) || cost <= 0) return { error: "The cost must be greater than zero." };
    const multiplier = multiplierFromMarkup(percent);
    if (multiplier.error) return { error: multiplier.error };
    finalCost = cost;
    finalPrice = cost * multiplier.multiplier;
  } else if (mode === "cost-margin") {
    if (!isNum(cost) || cost <= 0) return { error: "The cost must be greater than zero." };
    if (!isNum(percent)) return { error: "Enter the margin as a number." };
    if (percent >= MAX_MARGIN_PERCENT) {
      return { error: "A 100% margin would need a cost of zero." };
    }
    finalCost = cost;
    finalPrice = cost / (1 - percent / 100);
    if (!(finalPrice > 0)) return { error: "That margin gives a selling price of zero or less." };
  } else if (mode === "cost-price") {
    if (!isNum(cost) || cost <= 0) return { error: "The cost must be greater than zero." };
    if (!isNum(price) || price <= 0) return { error: "The selling price must be greater than zero." };
    finalCost = cost;
    finalPrice = price;
  } else if (mode === "price-margin") {
    if (!isNum(price) || price <= 0) return { error: "The selling price must be greater than zero." };
    if (!isNum(percent)) return { error: "Enter the margin as a number." };
    if (percent >= MAX_MARGIN_PERCENT) return { error: "A margin of 100% or more leaves no cost to recover." };
    finalPrice = price;
    finalCost = price * (1 - percent / 100);
    if (!(finalCost > 0)) return { error: "That margin implies a cost of zero or less." };
  } else {
    if (!isNum(price) || price <= 0) return { error: "The selling price must be greater than zero." };
    const multiplier = multiplierFromMarkup(percent);
    if (multiplier.error) return { error: multiplier.error };
    finalPrice = price;
    finalCost = price / multiplier.multiplier;
  }

  if (!Number.isFinite(finalCost) || !Number.isFinite(finalPrice)) {
    return { error: "Those figures are too large to price." };
  }

  const profit = finalPrice - finalCost;
  return {
    cost: finalCost,
    price: finalPrice,
    profit,
    markupPercent: (profit / finalCost) * 100,
    marginPercent: (profit / finalPrice) * 100,
    multiplier: finalPrice / finalCost,
    belowCost: profit < 0,
  };
}

/**
 * The discount that wipes out a given margin — the number that stops a sale
 * being run at a loss. Discounting by exactly the margin leaves zero profit.
 *
 * @param {number} marginPercent current gross margin
 * @param {number} discountPercent discount off the selling price
 * @returns {{ remainingMarginPercent: number, wipesOut: boolean } | { error: string }}
 */
export function marginAfterDiscount(marginPercent, discountPercent) {
  if (!isNum(marginPercent) || marginPercent >= MAX_MARGIN_PERCENT) {
    return { error: "Enter a margin below 100%." };
  }
  if (!isNum(discountPercent) || discountPercent < 0 || discountPercent >= 100) {
    return { error: "The discount must be between 0% and 99%." };
  }
  // price falls to (1 - d), cost is unchanged at (1 - margin) of the old price
  const oldPrice = 1;
  const cost = oldPrice * (1 - marginPercent / 100);
  const newPrice = oldPrice * (1 - discountPercent / 100);
  if (newPrice <= 0) return { error: "That discount takes the price to zero." };
  const remaining = ((newPrice - cost) / newPrice) * 100;
  return { remainingMarginPercent: remaining, wipesOut: remaining <= 0 };
}

/** Side-by-side table so the gap between the two measures is visible. */
export const COMPARISON_MARKUPS = [10, 20, 25, 33.3333, 50, 66.6667, 100, 150, 200, 300];

/**
 * Markup / margin pairs for the comparison table.
 *
 * @returns {Array<{ markupPercent: number, marginPercent: number, multiplier: number }>}
 */
export function buildComparisonTable() {
  const rows = [];
  for (const markupPercent of COMPARISON_MARKUPS) {
    const margin = markupToMargin(markupPercent);
    if (margin.error) continue;
    rows.push({
      markupPercent,
      marginPercent: margin.marginPercent,
      multiplier: 1 + markupPercent / 100,
    });
  }
  return rows;
}
