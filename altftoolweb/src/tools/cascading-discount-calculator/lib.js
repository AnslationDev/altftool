/**
 * Cascading (successive) discount maths.
 *
 * A "cascading" or "successive" discount is applied one after another, each on the
 * price left by the previous one — not on the original list price. So the remaining
 * fractions multiply:
 *
 *   priceAfter = list x (1 - d1/100) x (1 - d2/100) x ... x (1 - dn/100)
 *
 * The single equivalent discount is therefore
 *
 *   D = [1 - product(1 - di/100)] x 100
 *
 * which for two discounts reduces to the familiar shopkeeper's formula
 * D = d1 + d2 - (d1 x d2)/100. This is always LESS than the plain sum of the
 * discounts, which is why "50% + 20% off" is 60% off and never 70% off.
 *
 * A flat currency coupon (a rupees-off voucher) is applied after the percentage
 * stages, which is how most Indian marketplaces sequence it, and tax is charged on
 * the discounted value because GST is levied on the transaction value under
 * section 15 of the CGST Act, 2017 (discounts shown on the invoice are excluded).
 */

/** Practical ceiling on how many stacked offers the tool will model. */
export const MAX_DISCOUNT_STAGES = 8;
/** A percentage discount cannot exceed 100% - the price would go negative. */
export const MAX_DISCOUNT_PERCENT = 100;
/** Upper sanity bound on a tax rate entered as a percentage. */
export const MAX_TAX_PERCENT = 100;

/** Common Indian GST slabs (CGST/SGST combined), for the quick-pick buttons. */
export const GST_SLABS = [0, 5, 12, 18, 28];

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Single equivalent discount for a chain of percentage discounts.
 * @param {number[]} discounts percentages, e.g. [20, 10]
 * @returns {number} the equivalent single discount percentage, or NaN if input is bad
 */
export function equivalentSingleDiscount(discounts) {
  if (!Array.isArray(discounts) || discounts.length === 0) return 0;
  let remaining = 1;
  for (const d of discounts) {
    if (!isNumber(d) || d < 0 || d > MAX_DISCOUNT_PERCENT) return NaN;
    remaining *= 1 - d / 100;
  }
  return (1 - remaining) * 100;
}

/**
 * Full cascading-discount computation.
 *
 * @param {object} input
 * @param {number} input.listPrice     Marked / MRP price of one unit, before any discount.
 * @param {number[]} input.discounts   Percentage discounts applied one after another.
 * @param {number} [input.flatOff]     Flat currency amount off, applied after the percentages.
 * @param {number} [input.taxRate]     Tax percentage charged on the discounted value.
 * @param {number} [input.quantity]    Number of units.
 * @returns {object} breakdown, or { error } for invalid input.
 */
export function computeCascadingDiscount({
  listPrice,
  discounts = [],
  flatOff = 0,
  taxRate = 0,
  quantity = 1,
} = {}) {
  if (!isNumber(listPrice)) return { error: "Enter a valid list price." };
  if (listPrice <= 0) return { error: "List price must be greater than zero." };
  if (!Array.isArray(discounts)) return { error: "Discounts must be a list of percentages." };
  if (discounts.length > MAX_DISCOUNT_STAGES) {
    return { error: `Add at most ${MAX_DISCOUNT_STAGES} discount stages.` };
  }
  for (const d of discounts) {
    if (!isNumber(d)) return { error: "Every discount must be a valid number." };
    if (d < 0) return { error: "A discount cannot be negative." };
    if (d > MAX_DISCOUNT_PERCENT) return { error: "A single discount cannot exceed 100%." };
  }
  if (!isNumber(flatOff) || flatOff < 0) return { error: "Flat coupon amount cannot be negative." };
  if (!isNumber(taxRate) || taxRate < 0 || taxRate > MAX_TAX_PERCENT) {
    return { error: "Tax rate should be between 0% and 100%." };
  }
  if (!isNumber(quantity) || quantity < 1) return { error: "Quantity must be at least 1." };

  const units = Math.floor(quantity);

  let running = listPrice;
  const steps = discounts.map((rate, index) => {
    const amountOff = running * (rate / 100);
    const priceAfter = running - amountOff;
    running = priceAfter;
    return {
      stage: index + 1,
      ratePercent: rate,
      priceBefore: round2(priceAfter + amountOff),
      amountOff: round2(amountOff),
      priceAfter: round2(priceAfter),
    };
  });

  const priceAfterDiscounts = running;
  // A coupon can never push the price below zero, so it is capped at what is left.
  const flatOffApplied = Math.min(flatOff, priceAfterDiscounts);
  const flatOffWasted = flatOff - flatOffApplied;
  const netPrice = priceAfterDiscounts - flatOffApplied;

  const totalSavedPerUnit = listPrice - netPrice;
  const effectiveDiscountPercent = (totalSavedPerUnit / listPrice) * 100;
  const percentOnlyDiscount = equivalentSingleDiscount(discounts);
  const sumOfDiscountsPercent = discounts.reduce((total, d) => total + d, 0);

  const taxAmount = netPrice * (taxRate / 100);
  const payablePerUnit = netPrice + taxAmount;

  return {
    listPrice: round2(listPrice),
    quantity: units,
    steps,
    priceAfterDiscounts: round2(priceAfterDiscounts),
    flatOff: round2(flatOff),
    flatOffApplied: round2(flatOffApplied),
    flatOffWasted: round2(flatOffWasted),
    netPrice: round2(netPrice),
    totalSavedPerUnit: round2(totalSavedPerUnit),
    effectiveDiscountPercent: round2(effectiveDiscountPercent),
    percentOnlyDiscount: round2(percentOnlyDiscount),
    sumOfDiscountsPercent: round2(sumOfDiscountsPercent),
    // How much the naive "just add the percentages" answer overstates the saving.
    overstatedByPercent: round2(sumOfDiscountsPercent - percentOnlyDiscount),
    taxRate,
    taxAmount: round2(taxAmount),
    payablePerUnit: round2(payablePerUnit),
    lineListTotal: round2(listPrice * units),
    lineNetTotal: round2(netPrice * units),
    lineTaxTotal: round2(taxAmount * units),
    linePayable: round2(payablePerUnit * units),
    lineSaved: round2(totalSavedPerUnit * units),
  };
}

/**
 * Reverse check: what single percentage discount, applied once, gives the same
 * final price as the chain? Useful for comparing two competing offers.
 * @param {number} listPrice
 * @param {number} finalPrice price after all discounts (before tax)
 * @returns {number|{error:string}}
 */
export function discountFromPrices(listPrice, finalPrice) {
  if (!isNumber(listPrice) || listPrice <= 0) return { error: "List price must be greater than zero." };
  if (!isNumber(finalPrice) || finalPrice < 0) return { error: "Final price cannot be negative." };
  if (finalPrice > listPrice) return { error: "Final price cannot exceed the list price." };
  return round2(((listPrice - finalPrice) / listPrice) * 100);
}
