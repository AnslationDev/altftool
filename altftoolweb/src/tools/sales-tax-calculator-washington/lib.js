/**
 * Washington State retail sales tax.
 *
 * Rules implemented
 * -----------------
 * 1. State rate: 6.5% of the selling price — RCW 82.08.020(1).
 * 2. Local rate: cities, counties and transit districts add their own rate on top of the
 *    state rate (RCW 82.14). Local rates are set by each jurisdiction, so the rate itself is
 *    an input here; the Department of Revenue Tax Rate Lookup tool is the authoritative source.
 * 3. Destination sourcing: the rate is the rate at the place the buyer receives the goods,
 *    not the seller's location — RCW 82.32.730.
 * 4. Selling price includes delivery / shipping and handling charges when the goods being
 *    delivered are taxable — RCW 82.08.010(1).
 * 5. Trade-in of like-kind property is deducted from the selling price before tax —
 *    RCW 82.08.010(1)(a).
 * 6. Motor vehicle sales and leases carry an extra 0.3% state tax — RCW 82.08.020(3).
 * 7. Tax is computed on the selling price and rounded to the nearest cent (WAC 458-20-107).
 */

/** State retail sales tax rate — RCW 82.08.020(1). */
export const WA_STATE_SALES_TAX_RATE = 0.065;

/** Additional state tax on retail sales and leases of motor vehicles — RCW 82.08.020(3). */
export const WA_MOTOR_VEHICLE_ADDITIONAL_RATE = 0.003;

/**
 * Sanity bounds on the local component. No Washington jurisdiction levies a local rate
 * above about 4.1%, which puts the combined rate in the 7.0%–10.6% band. Anything outside
 * this range is almost certainly a typing mistake, so it is rejected rather than computed.
 */
export const WA_LOCAL_RATE_MAX_PERCENT = 5;

/**
 * Reference combined rates for common Washington destinations, expressed as a percentage of
 * the selling price and including the 6.5% state component. These are convenience presets
 * only: local rates change every quarter, so confirm the exact rate for a street address with
 * the Department of Revenue Tax Rate Lookup before charging or filing.
 */
export const WA_LOCATION_PRESETS = [
  { name: "Seattle", county: "King", combinedPercent: 10.35 },
  { name: "Bellevue", county: "King", combinedPercent: 10.3 },
  { name: "Kent", county: "King", combinedPercent: 10.3 },
  { name: "Tacoma", county: "Pierce", combinedPercent: 10.3 },
  { name: "Lynnwood", county: "Snohomish", combinedPercent: 10.6 },
  { name: "Everett", county: "Snohomish", combinedPercent: 9.9 },
  { name: "Olympia", county: "Thurston", combinedPercent: 9.5 },
  { name: "Spokane", county: "Spokane", combinedPercent: 9.0 },
  { name: "Bellingham", county: "Whatcom", combinedPercent: 9.0 },
  { name: "Vancouver", county: "Clark", combinedPercent: 8.7 },
  { name: "Yakima", county: "Yakima", combinedPercent: 8.3 },
  { name: "Unincorporated low-rate area", county: "Various", combinedPercent: 7.7 },
];

/** Round a money amount to the nearest cent, half away from zero. */
function roundCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isBadNumber(value) {
  return typeof value !== "number" || !Number.isFinite(value);
}

/**
 * Compute Washington sales tax on a sale.
 *
 * @param {object} input
 * @param {number} input.itemsAmount        Selling price of the taxable goods or services.
 * @param {number} input.localRatePercent   Local (city + county + transit) rate, in percent.
 * @param {number} [input.shippingAmount]   Delivery / shipping and handling charged.
 * @param {boolean} [input.shippingTaxable] Whether the delivered goods are taxable (default true).
 * @param {number} [input.tradeInAmount]    Like-kind trade-in allowance.
 * @param {boolean} [input.isMotorVehicle]  Adds the 0.3% motor vehicle tax.
 * @param {boolean} [input.priceIncludesTax] Treat the amounts entered as tax-inclusive.
 * @returns {object} breakdown, or { error } when the input cannot produce a real answer.
 */
export function computeWashingtonSalesTax(input = {}) {
  const {
    itemsAmount,
    localRatePercent,
    shippingAmount = 0,
    shippingTaxable = true,
    tradeInAmount = 0,
    isMotorVehicle = false,
    priceIncludesTax = false,
  } = input;

  if (
    isBadNumber(itemsAmount) ||
    isBadNumber(localRatePercent) ||
    isBadNumber(shippingAmount) ||
    isBadNumber(tradeInAmount)
  ) {
    return { error: "Enter valid numbers for the sale amount, local rate, shipping and trade-in." };
  }
  if (itemsAmount < 0 || shippingAmount < 0 || tradeInAmount < 0) {
    return { error: "Amounts cannot be negative." };
  }
  if (localRatePercent < 0) {
    return { error: "The local rate cannot be negative." };
  }
  if (localRatePercent > WA_LOCAL_RATE_MAX_PERCENT) {
    return {
      error: `No Washington jurisdiction adds more than about ${WA_LOCAL_RATE_MAX_PERCENT}% on top of the 6.5% state rate. Enter the local part only, not the combined rate.`,
    };
  }
  if (tradeInAmount > itemsAmount) {
    return { error: "The trade-in allowance cannot be more than the selling price of the goods." };
  }

  const localRate = localRatePercent / 100;
  const vehicleRate = isMotorVehicle ? WA_MOTOR_VEHICLE_ADDITIONAL_RATE : 0;
  const totalRate = WA_STATE_SALES_TAX_RATE + localRate + vehicleRate;

  const goodsAfterTradeIn = Math.max(0, itemsAmount - tradeInAmount);
  const taxableShipping = shippingTaxable ? shippingAmount : 0;
  const exemptShipping = shippingTaxable ? 0 : shippingAmount;

  // Gross-up or reverse-out depending on whether the figures entered already contain tax.
  const enteredTaxable = goodsAfterTradeIn + taxableShipping;
  const taxableBase = priceIncludesTax ? enteredTaxable / (1 + totalRate) : enteredTaxable;

  const stateTax = roundCents(taxableBase * WA_STATE_SALES_TAX_RATE);
  const localTax = roundCents(taxableBase * localRate);
  const vehicleTax = roundCents(taxableBase * vehicleRate);
  const totalTax = roundCents(stateTax + localTax + vehicleTax);
  const preTaxTotal = roundCents(taxableBase + exemptShipping);
  const grandTotal = roundCents(preTaxTotal + totalTax);

  return {
    taxableBase: roundCents(taxableBase),
    exemptShipping: roundCents(exemptShipping),
    tradeInApplied: roundCents(Math.min(tradeInAmount, itemsAmount)),
    stateRatePercent: WA_STATE_SALES_TAX_RATE * 100,
    localRatePercent,
    vehicleRatePercent: vehicleRate * 100,
    combinedRatePercent: roundCents(totalRate * 100),
    stateTax,
    localTax,
    vehicleTax,
    totalTax,
    preTaxTotal,
    grandTotal,
    effectiveRatePercent: preTaxTotal > 0 ? roundCents((totalTax / preTaxTotal) * 100) : 0,
  };
}

/**
 * Split a combined (state + local) percentage into its local component, for the presets above.
 * Returns 0 rather than a negative number if a combined rate below 6.5% is passed in.
 */
export function localPartOfCombined(combinedPercent) {
  if (isBadNumber(combinedPercent)) return 0;
  return roundCents(Math.max(0, combinedPercent - WA_STATE_SALES_TAX_RATE * 100));
}
