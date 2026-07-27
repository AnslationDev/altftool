/**
 * Merch unit economics.
 *
 * Revenue on an order is the item price plus whatever shipping you charge the
 * customer. Marketplaces and payment processors normally take their percentage
 * of that whole amount, not just the item price, which is why "free shipping"
 * costs more than the postage alone:
 *
 *   revenue    = price + shippingCharged
 *   feeCost    = revenue x (platformRate + processingRate)
 *                + platformFixed + processingFixed
 *   unitCost   = blankCost + printCost + packagingCost + shippingCost
 *   profit     = revenue - feeCost - unitCost
 *
 * Margin and markup are different ratios of the same profit:
 *   margin = profit / revenue    (share of the sale you keep)
 *   markup = profit / totalCost  (how far you marked the cost up)
 *
 * Break-even price solves profit = 0 for price:
 *   price = (fixedFees + unitCost) / (1 - platformRate - processingRate)
 *           - shippingCharged
 *
 * Returns: a refunded order gives the revenue back and the goods and outbound
 * postage are gone, so the loss on a return is taken as the unit cost.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Cost lines that make up one physical unit. */
export const UNIT_COST_KEYS = ["blankCost", "printCost", "packagingCost", "shippingCost"];

export const MAX_PERCENT = 100;

export function computeMerchMargin({
  price,
  shippingCharged = 0,
  blankCost = 0,
  printCost = 0,
  packagingCost = 0,
  shippingCost = 0,
  platformFeePercent = 0,
  platformFixed = 0,
  processingFeePercent = 0,
  processingFixed = 0,
  returnRatePercent = 0,
  setupCost = 0,
}) {
  const values = {
    price,
    shippingCharged,
    blankCost,
    printCost,
    packagingCost,
    shippingCost,
    platformFeePercent,
    platformFixed,
    processingFeePercent,
    processingFixed,
    returnRatePercent,
    setupCost,
  };
  for (const [key, value] of Object.entries(values)) {
    if (!isNum(value)) return { error: `Enter a number for ${key}.` };
    if (value < 0) return { error: "Prices, costs and rates cannot be negative." };
  }
  if (price <= 0) return { error: "Selling price must be greater than zero." };
  if (platformFeePercent + processingFeePercent >= MAX_PERCENT) {
    return { error: "Platform and payment fees together must stay under 100%." };
  }
  if (returnRatePercent >= MAX_PERCENT) {
    return { error: "Return rate must be under 100%." };
  }

  const revenue = price + shippingCharged;
  const feeRate = (platformFeePercent + processingFeePercent) / 100;
  const platformFee = revenue * (platformFeePercent / 100) + platformFixed;
  const processingFee = revenue * (processingFeePercent / 100) + processingFixed;
  const feeCost = platformFee + processingFee;
  const unitCost = blankCost + printCost + packagingCost + shippingCost;
  const totalCost = feeCost + unitCost;
  const profit = revenue - totalCost;

  const returnRate = returnRatePercent / 100;
  const effectiveProfit = (1 - returnRate) * profit - returnRate * unitCost;

  const fixedFees = platformFixed + processingFixed;
  const breakEvenPrice = (fixedFees + unitCost) / (1 - feeRate) - shippingCharged;

  const unitsToCoverSetup =
    setupCost > 0 ? (effectiveProfit > 0 ? Math.ceil(setupCost / effectiveProfit) : null) : 0;

  return {
    revenue,
    unitCost,
    platformFee,
    processingFee,
    feeCost,
    totalCost,
    profit,
    marginPercent: (profit / revenue) * 100,
    markupPercent: totalCost > 0 ? (profit / totalCost) * 100 : null,
    effectiveProfit,
    effectiveMarginPercent: (effectiveProfit / revenue) * 100,
    breakEvenPrice,
    priceHeadroom: price - breakEvenPrice,
    unitsToCoverSetup,
    lines: [
      { key: "blankCost", label: "Blank / base garment", amount: blankCost },
      { key: "printCost", label: "Printing or embroidery", amount: printCost },
      { key: "packagingCost", label: "Packaging", amount: packagingCost },
      { key: "shippingCost", label: "Shipping you pay", amount: shippingCost },
      { key: "platformFee", label: "Marketplace fee", amount: platformFee },
      { key: "processingFee", label: "Payment processing", amount: processingFee },
    ].map((line) => ({
      ...line,
      share: revenue > 0 ? (line.amount / revenue) * 100 : 0,
    })),
  };
}

/**
 * The price that hits a target margin.
 *
 *   margin = profit / revenue = 1 - feeRate - (fixedFees + unitCost) / revenue
 *   =>  revenue = (fixedFees + unitCost) / (1 - feeRate - margin)
 *   =>  price   = revenue - shippingCharged
 *
 * The target is unreachable when feeRate + margin >= 1, because fees alone would
 * already consume everything the margin needs.
 */
export function priceForTargetMargin({
  targetMarginPercent,
  unitCost,
  platformFeePercent = 0,
  processingFeePercent = 0,
  platformFixed = 0,
  processingFixed = 0,
  shippingCharged = 0,
}) {
  const values = {
    targetMarginPercent,
    unitCost,
    platformFeePercent,
    processingFeePercent,
    platformFixed,
    processingFixed,
    shippingCharged,
  };
  for (const [key, value] of Object.entries(values)) {
    if (!isNum(value)) return { error: `Enter a number for ${key}.` };
    if (value < 0) return { error: "Values cannot be negative." };
  }
  const feeRate = (platformFeePercent + processingFeePercent) / 100;
  const margin = targetMarginPercent / 100;
  const denominator = 1 - feeRate - margin;
  if (denominator <= 0) {
    return {
      error: "That margin is impossible once fees are taken off — lower the target or the fees.",
    };
  }
  const fixedFees = platformFixed + processingFixed;
  const revenue = (fixedFees + unitCost) / denominator;
  const price = revenue - shippingCharged;
  if (price <= 0) return { error: "The target margin needs a price above zero — check your costs." };
  return { price, revenue, targetMarginPercent };
}
