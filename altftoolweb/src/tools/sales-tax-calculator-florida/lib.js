/**
 * Florida sales and use tax.
 *
 * Rules implemented
 * -----------------
 * 1. State rate is 6% of the sales price — Fla. Stat. § 212.05.
 * 2. Counties may levy a discretionary sales surtax on top, which is why combined rates run
 *    from 6% in counties with no surtax up to around 7.5% — Fla. Stat. § 212.055. The
 *    Department of Revenue republishes every county rate each January in form DR-15DSS.
 * 3. THE $5,000 CAP. The discretionary sales surtax applies only to the first $5,000 of the
 *    sales price of any single item of tangible personal property — Fla. Stat.
 *    § 212.054(2)(b)1. The 6% state tax has no cap. The cap is tested item by item, so two
 *    $4,000 laptops on one invoice are each under the cap, but one $9,000 machine is not.
 *    The cap does NOT apply to services, commercial rent or admissions.
 * 4. The surtax rate is the rate of the county where the item is delivered.
 * 5. Delivery and freight are part of the taxable sales price unless the charge is separately
 *    stated AND the buyer has the option to avoid it by picking the item up — Rule 12A-1.045.
 *    When taxable, freight forms part of the item's sales price and so counts toward the cap.
 * 6. Groceries — food products for human consumption — are exempt under § 212.08(1), as are
 *    prescription medicines. Prepared food and soft drinks are taxable.
 *
 * Nothing here is tax advice. County surtax rates change each January; DR-15DSS governs.
 */

/** State sales and use tax rate — Fla. Stat. § 212.05. */
export const FL_STATE_RATE = 0.06;

/** Surtax applies only to the first $5,000 of a single item — Fla. Stat. § 212.054(2)(b)1. */
export const FL_SURTAX_ITEM_CAP = 5000;

/**
 * Sanity bound on the county surtax. The statutory combinations top out at 2.5%, and no
 * county currently levies more than 1.5%, so anything above 3% is a typing mistake.
 */
export const FL_SURTAX_MAX_PERCENT = 3;

/**
 * Reference county surtax rates. Presets only — the Department of Revenue republishes every
 * rate each January in DR-15DSS, and surtaxes expire and renew, so verify before charging.
 */
export const FL_COUNTY_PRESETS = [
  { name: "Miami-Dade", surtaxPercent: 1 },
  { name: "Broward", surtaxPercent: 1 },
  { name: "Palm Beach", surtaxPercent: 1 },
  { name: "Hillsborough (Tampa)", surtaxPercent: 1.5 },
  { name: "Duval (Jacksonville)", surtaxPercent: 1.5 },
  { name: "Orange (Orlando)", surtaxPercent: 0.5 },
  { name: "Pinellas (St. Petersburg)", surtaxPercent: 1 },
  { name: "Polk", surtaxPercent: 1 },
  { name: "Lee (Fort Myers)", surtaxPercent: 0.5 },
  { name: "Leon (Tallahassee)", surtaxPercent: 1.5 },
  { name: "Monroe (Key West)", surtaxPercent: 1.5 },
  { name: "Collier (Naples) — no surtax", surtaxPercent: 0 },
  { name: "Citrus — no surtax", surtaxPercent: 0 },
];

/** Round a money amount to the nearest cent, half away from zero. */
function roundCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Round a percentage to three decimals. */
function roundRate(value) {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

function isBadNumber(value) {
  return typeof value !== "number" || !Number.isFinite(value);
}

/**
 * Compute Florida sales tax, applying the $5,000 per-item discretionary surtax cap.
 *
 * @param {object} input
 * @param {number} input.itemPrice            Sales price of ONE item of tangible personal property.
 * @param {number} [input.quantity]           How many of that item (the cap is tested per item).
 * @param {number} [input.surtaxRatePercent]  County discretionary surtax, in percent.
 * @param {number} [input.otherTaxableAmount] Taxable amounts the cap never applies to, e.g. services.
 * @param {number} [input.exemptAmount]       Exempt items such as groceries (§ 212.08).
 * @param {number} [input.shippingAmount]     Delivery / freight charged.
 * @param {boolean} [input.shippingTaxable]   False when separately stated and pickup was optional.
 * @returns {object} breakdown, or { error } when the input cannot produce a real answer.
 */
export function computeFloridaSalesTax(input = {}) {
  const {
    itemPrice,
    quantity = 1,
    surtaxRatePercent = 0,
    otherTaxableAmount = 0,
    exemptAmount = 0,
    shippingAmount = 0,
    shippingTaxable = true,
  } = input;

  if (
    isBadNumber(itemPrice) ||
    isBadNumber(quantity) ||
    isBadNumber(surtaxRatePercent) ||
    isBadNumber(otherTaxableAmount) ||
    isBadNumber(exemptAmount) ||
    isBadNumber(shippingAmount)
  ) {
    return { error: "Enter valid numbers for the item price, quantity, surtax rate and other amounts." };
  }
  if (
    itemPrice < 0 ||
    otherTaxableAmount < 0 ||
    exemptAmount < 0 ||
    shippingAmount < 0
  ) {
    return { error: "Amounts cannot be negative." };
  }
  if (quantity < 0) {
    return { error: "Quantity cannot be negative." };
  }
  if (!Number.isInteger(quantity)) {
    return { error: "Quantity must be a whole number of items." };
  }
  if (surtaxRatePercent < 0) {
    return { error: "The county surtax rate cannot be negative." };
  }
  if (surtaxRatePercent > FL_SURTAX_MAX_PERCENT) {
    return {
      error: `No Florida county levies a discretionary surtax above about ${FL_SURTAX_MAX_PERCENT}%. Enter the county surtax only, not the combined rate.`,
    };
  }

  const surtaxRate = surtaxRatePercent / 100;

  const taxableShipping = shippingTaxable ? shippingAmount : 0;
  const exemptShipping = shippingTaxable ? 0 : shippingAmount;

  // Taxable freight is part of the item's sales price, so it counts toward the per-item cap.
  // With no items on the invoice it falls into the uncapped bucket instead.
  const freightPerItem = quantity > 0 ? taxableShipping / quantity : 0;
  const salesPricePerItem = quantity > 0 ? itemPrice + freightPerItem : 0;
  const itemsTotal = salesPricePerItem * quantity;
  const uncappedTotal = otherTaxableAmount + (quantity > 0 ? 0 : taxableShipping);

  const stateBase = itemsTotal + uncappedTotal;
  const cappedPerItem = Math.min(salesPricePerItem, FL_SURTAX_ITEM_CAP);
  const surtaxBase = cappedPerItem * quantity + uncappedTotal;

  const stateTax = roundCents(stateBase * FL_STATE_RATE);
  const surtax = roundCents(surtaxBase * surtaxRate);
  const surtaxWithoutCap = roundCents(stateBase * surtaxRate);
  const totalTax = roundCents(stateTax + surtax);

  const nonTaxableTotal = roundCents(exemptAmount + exemptShipping);
  const preTaxTotal = roundCents(stateBase + nonTaxableTotal);
  const grandTotal = roundCents(preTaxTotal + totalTax);

  return {
    salesPricePerItem: roundCents(salesPricePerItem),
    quantity,
    itemsTotal: roundCents(itemsTotal),
    uncappedTotal: roundCents(uncappedTotal),
    stateBase: roundCents(stateBase),
    surtaxBase: roundCents(surtaxBase),
    capApplies: quantity > 0 && salesPricePerItem > FL_SURTAX_ITEM_CAP,
    surtaxExcludedByCap: roundCents(Math.max(0, stateBase - surtaxBase)),
    surtaxSavedByCap: roundCents(Math.max(0, surtaxWithoutCap - surtax)),
    exemptItems: roundCents(exemptAmount),
    exemptShipping: roundCents(exemptShipping),
    nonTaxableTotal,
    stateRatePercent: roundRate(FL_STATE_RATE * 100),
    surtaxRatePercent: roundRate(surtaxRatePercent),
    combinedRatePercent: roundRate(FL_STATE_RATE * 100 + surtaxRatePercent),
    stateTax,
    surtax,
    totalTax,
    preTaxTotal,
    grandTotal,
    effectiveRatePercent: preTaxTotal > 0 ? roundRate((totalTax / preTaxTotal) * 100) : 0,
  };
}
