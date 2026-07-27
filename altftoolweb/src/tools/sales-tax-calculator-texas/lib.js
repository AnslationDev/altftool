/**
 * Texas sales and use tax.
 *
 * Rules implemented
 * -----------------
 * 1. State rate is 6.25% of the sales price — Texas Tax Code § 151.051.
 * 2. Local taxing jurisdictions (cities, counties, special purpose districts and transit
 *    authorities) may impose local sales and use tax, but the combined local rate at any one
 *    address is capped at 2%. That makes 8.25% the maximum combined rate anywhere in Texas —
 *    Tax Code chapters 321, 322, 323 and § 321.101.
 * 3. Sales by a seller with a place of business in Texas are generally sourced to that place
 *    of business (origin sourcing) for the local portion; remote sellers with no Texas
 *    location may instead elect the single local use tax rate published by the Comptroller
 *    rather than tracking every jurisdiction — Tax Code § 151.0595.
 * 4. Delivery, shipping, handling and transportation charges are part of the taxable sales
 *    price when the item sold is taxable — Comptroller Rule 3.303. If the item is exempt,
 *    the related delivery charge is exempt too.
 * 5. Food products for home consumption are exempt (§ 151.314), as are prescription and
 *    most over-the-counter drugs (§ 151.313). Prepared food, candy and soft drinks are taxable.
 * 6. Motor vehicles are NOT taxed under this general sales tax. They fall under the separate
 *    motor vehicle sales tax in Tax Code chapter 152, charged at 6.25% of the sales price
 *    less any trade-in allowance, with no local component.
 *
 * Nothing here is tax advice. Local rates change quarterly; the Comptroller's Sales Tax Rate
 * Locator is the authoritative source for an address.
 */

/** State sales and use tax rate — Tax Code § 151.051. */
export const TX_STATE_RATE = 0.0625;

/** Statutory cap on the combined local rate at any one address. */
export const TX_LOCAL_RATE_CAP_PERCENT = 2;

/** Maximum combined rate anywhere in Texas: 6.25% + 2%. */
export const TX_MAX_COMBINED_PERCENT = TX_STATE_RATE * 100 + TX_LOCAL_RATE_CAP_PERCENT;

/**
 * Single local use tax rate a remote seller may elect instead of tracking every local
 * jurisdiction — Tax Code § 151.0595. The Comptroller republishes the figure each year;
 * it has been 1.75% since the election was introduced. Confirm the current rate before use.
 */
export const TX_SINGLE_LOCAL_USE_TAX_RATE_PERCENT = 1.75;

/** Motor vehicle sales tax rate under the separate chapter 152 regime. */
export const TX_MOTOR_VEHICLE_RATE_PERCENT = 6.25;

/**
 * Reference combined rates for common Texas destinations, including the 6.25% state share.
 * The large cities all levy the full 2% local ceiling. Presets only — verify an address with
 * the Comptroller's Sales Tax Rate Locator before charging or filing.
 */
export const TX_LOCATION_PRESETS = [
  { name: "Houston", county: "Harris", combinedPercent: 8.25 },
  { name: "Dallas", county: "Dallas", combinedPercent: 8.25 },
  { name: "San Antonio", county: "Bexar", combinedPercent: 8.25 },
  { name: "Austin", county: "Travis", combinedPercent: 8.25 },
  { name: "Fort Worth", county: "Tarrant", combinedPercent: 8.25 },
  { name: "El Paso", county: "El Paso", combinedPercent: 8.25 },
  { name: "Arlington", county: "Tarrant", combinedPercent: 8.25 },
  { name: "Corpus Christi", county: "Nueces", combinedPercent: 8.25 },
  { name: "Lubbock", county: "Lubbock", combinedPercent: 8.25 },
  { name: "Remote seller — single local use tax rate", county: "Statewide election", combinedPercent: 8 },
  { name: "City with 1% local tax only", county: "Various", combinedPercent: 7.25 },
  { name: "Unincorporated area, no local tax", county: "Various", combinedPercent: 6.25 },
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

/** Strip the 6.25% state share out of a combined percentage. Never returns a negative. */
export function localPartOfCombined(combinedPercent) {
  if (isBadNumber(combinedPercent)) return 0;
  return roundRate(Math.max(0, combinedPercent - TX_STATE_RATE * 100));
}

/**
 * Compute Texas sales tax on a sale.
 *
 * @param {object} input
 * @param {number} input.taxableAmount        Sales price of the taxable items.
 * @param {number} [input.exemptAmount]       Exempt items — groceries, prescription drugs.
 * @param {number} [input.localRatePercent]   Combined local rate, in percent (0 to 2).
 * @param {number} [input.shippingAmount]     Delivery / shipping / handling charged.
 * @param {boolean} [input.shippingTaxable]   Taxable when the item shipped is taxable (Rule 3.303).
 * @param {boolean} [input.priceIncludesTax]  Treat the taxable figures as tax-inclusive.
 * @returns {object} breakdown, or { error } when the input cannot produce a real answer.
 */
export function computeTexasSalesTax(input = {}) {
  const {
    taxableAmount,
    exemptAmount = 0,
    localRatePercent = 0,
    shippingAmount = 0,
    shippingTaxable = true,
    priceIncludesTax = false,
  } = input;

  if (
    isBadNumber(taxableAmount) ||
    isBadNumber(exemptAmount) ||
    isBadNumber(localRatePercent) ||
    isBadNumber(shippingAmount)
  ) {
    return { error: "Enter valid numbers for the sale amount, local rate, exempt items and shipping." };
  }
  if (taxableAmount < 0 || exemptAmount < 0 || shippingAmount < 0) {
    return { error: "Amounts cannot be negative." };
  }
  if (localRatePercent < 0) {
    return { error: "The local rate cannot be negative." };
  }
  if (localRatePercent > TX_LOCAL_RATE_CAP_PERCENT) {
    return {
      error: `Texas caps the combined local rate at ${TX_LOCAL_RATE_CAP_PERCENT}%, so no address exceeds ${TX_MAX_COMBINED_PERCENT}% in total. Enter the local part only, not the combined rate.`,
    };
  }

  const localRate = localRatePercent / 100;
  const totalRate = TX_STATE_RATE + localRate;

  const taxableShipping = shippingTaxable ? shippingAmount : 0;
  const exemptShipping = shippingTaxable ? 0 : shippingAmount;
  const enteredTaxable = taxableAmount + taxableShipping;

  const taxableBase = priceIncludesTax ? enteredTaxable / (1 + totalRate) : enteredTaxable;

  const stateTax = roundCents(taxableBase * TX_STATE_RATE);
  const localTax = roundCents(taxableBase * localRate);
  const totalTax = roundCents(stateTax + localTax);

  const nonTaxableTotal = roundCents(exemptAmount + exemptShipping);
  const preTaxTotal = roundCents(taxableBase + nonTaxableTotal);
  const grandTotal = roundCents(preTaxTotal + totalTax);

  return {
    taxableBase: roundCents(taxableBase),
    exemptItems: roundCents(exemptAmount),
    exemptShipping: roundCents(exemptShipping),
    nonTaxableTotal,
    stateRatePercent: roundRate(TX_STATE_RATE * 100),
    localRatePercent: roundRate(localRatePercent),
    combinedRatePercent: roundRate(totalRate * 100),
    atLocalCap: roundRate(localRatePercent) === TX_LOCAL_RATE_CAP_PERCENT,
    stateTax,
    localTax,
    totalTax,
    preTaxTotal,
    grandTotal,
    effectiveRatePercent: preTaxTotal > 0 ? roundRate((totalTax / preTaxTotal) * 100) : 0,
  };
}

/**
 * Texas motor vehicle sales tax — a separate 6.25% tax under Tax Code chapter 152, computed
 * on the sales price less any trade-in allowance, with no local component.
 *
 * @param {object} input
 * @param {number} input.salesPrice      Vehicle sales price.
 * @param {number} [input.tradeInAmount] Trade-in allowance given by the dealer.
 * @returns {object} breakdown, or { error }.
 */
export function computeTexasMotorVehicleTax(input = {}) {
  const { salesPrice, tradeInAmount = 0 } = input;

  if (isBadNumber(salesPrice) || isBadNumber(tradeInAmount)) {
    return { error: "Enter a valid vehicle price and trade-in allowance." };
  }
  if (salesPrice < 0 || tradeInAmount < 0) {
    return { error: "Amounts cannot be negative." };
  }
  if (tradeInAmount > salesPrice) {
    return { error: "The trade-in allowance cannot be more than the vehicle price." };
  }

  const taxableValue = salesPrice - tradeInAmount;
  const tax = roundCents(taxableValue * (TX_MOTOR_VEHICLE_RATE_PERCENT / 100));

  return {
    salesPrice: roundCents(salesPrice),
    tradeInAmount: roundCents(tradeInAmount),
    taxableValue: roundCents(taxableValue),
    ratePercent: TX_MOTOR_VEHICLE_RATE_PERCENT,
    tax,
    totalWithTax: roundCents(salesPrice + tax),
  };
}
