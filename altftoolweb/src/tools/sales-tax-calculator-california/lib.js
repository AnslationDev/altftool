/**
 * California sales and use tax.
 *
 * Rules implemented
 * -----------------
 * 1. Statewide base rate is 7.25%, made up of a 6.00% state share and a 1.25% uniform local
 *    share. The 1.25% is 1.00% Bradley-Burns city/county tax plus 0.25% county
 *    transportation tax — Revenue & Taxation Code div. 2, part 1 and part 1.5.
 * 2. District transactions and use taxes (RTC part 1.6) are voted locally and stack on top of
 *    the 7.25% base, which is why combined rates around the state run from 7.25% up to about
 *    10.75%. The district component is an input here because it depends on the address.
 * 3. District tax is sourced to the place the goods are delivered or first used, so an order
 *    shipped to a customer uses the customer's district rate.
 * 4. Delivery charges are exempt when the goods are shipped by common carrier, the charge is
 *    separately stated on the invoice, and it does not exceed the actual cost of delivery —
 *    Regulation 1628. Handling charges are taxable, and a combined "shipping and handling"
 *    line is taxable in full.
 * 5. Food products for human consumption sold for off-premises use are exempt — RTC 6359.
 *    Hot prepared food, carbonated drinks and restaurant meals are not.
 * 6. California does NOT allow a trade-in allowance to reduce the taxable selling price of a
 *    vehicle; tax is due on the full price before any trade-in credit.
 *
 * Nothing here is tax advice. District rates change; the CDTFA rate lookup is authoritative.
 */

/** State share of the statewide base rate — RTC part 1. */
export const CA_STATE_RATE = 0.06;

/** Uniform local share: 1.00% Bradley-Burns + 0.25% county transportation. */
export const CA_LOCAL_RATE = 0.0125;

/** Statewide minimum combined rate = 6.00% + 1.25%. */
export const CA_BASE_RATE = CA_STATE_RATE + CA_LOCAL_RATE;

/**
 * Sanity bound on the district component. The highest combined rates in California sit
 * around 10.75%, i.e. a district component of about 3.5%. Anything above 4% is almost
 * certainly the combined rate typed in by mistake, so it is rejected.
 */
export const CA_DISTRICT_RATE_MAX_PERCENT = 4;

/**
 * Reference combined rates for well-known California destinations, including the 7.25% base.
 * Presets only — district rates change as measures pass and expire, so verify a street
 * address with the CDTFA "Find a Sales and Use Tax Rate" lookup before charging or filing.
 */
export const CA_LOCATION_PRESETS = [
  { name: "No district (statewide minimum)", county: "Various", combinedPercent: 7.25 },
  { name: "San Diego", county: "San Diego", combinedPercent: 7.75 },
  { name: "Anaheim", county: "Orange", combinedPercent: 7.75 },
  { name: "Bakersfield", county: "Kern", combinedPercent: 8.25 },
  { name: "Fresno", county: "Fresno", combinedPercent: 8.35 },
  { name: "San Francisco", county: "San Francisco", combinedPercent: 8.625 },
  { name: "Sacramento", county: "Sacramento", combinedPercent: 8.75 },
  { name: "Riverside", county: "Riverside", combinedPercent: 8.75 },
  { name: "San Jose", county: "Santa Clara", combinedPercent: 9.375 },
  { name: "Los Angeles", county: "Los Angeles", combinedPercent: 9.5 },
  { name: "Oakland", county: "Alameda", combinedPercent: 10.25 },
  { name: "Santa Monica", county: "Los Angeles", combinedPercent: 10.25 },
];

/** Round a money amount to the nearest cent, half away from zero. */
function roundCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Round a percentage to three decimals so rates like 8.625% survive intact. */
function roundRate(value) {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

function isBadNumber(value) {
  return typeof value !== "number" || !Number.isFinite(value);
}

/**
 * Split a combined percentage into its district component by removing the 7.25% base.
 * Never returns a negative number.
 */
export function districtPartOfCombined(combinedPercent) {
  if (isBadNumber(combinedPercent)) return 0;
  return roundRate(Math.max(0, combinedPercent - CA_BASE_RATE * 100));
}

/**
 * Compute California sales tax on a sale.
 *
 * @param {object} input
 * @param {number} input.taxableAmount          Selling price of taxable goods.
 * @param {number} [input.exemptAmount]         Exempt items such as grocery food (RTC 6359).
 * @param {number} [input.districtRatePercent]  District tax component, in percent.
 * @param {number} [input.shippingAmount]       Delivery / shipping charged.
 * @param {boolean} [input.shippingExempt]      True when shipped by common carrier, separately
 *                                              stated and at actual cost (Reg 1628).
 * @param {number} [input.handlingAmount]       Handling charge — always taxable.
 * @param {boolean} [input.priceIncludesTax]    Treat the taxable figures as tax-inclusive.
 * @returns {object} breakdown, or { error } when the input cannot produce a real answer.
 */
export function computeCaliforniaSalesTax(input = {}) {
  const {
    taxableAmount,
    exemptAmount = 0,
    districtRatePercent = 0,
    shippingAmount = 0,
    shippingExempt = true,
    handlingAmount = 0,
    priceIncludesTax = false,
  } = input;

  if (
    isBadNumber(taxableAmount) ||
    isBadNumber(exemptAmount) ||
    isBadNumber(districtRatePercent) ||
    isBadNumber(shippingAmount) ||
    isBadNumber(handlingAmount)
  ) {
    return { error: "Enter valid numbers for the sale amount, district rate, shipping and handling." };
  }
  if (
    taxableAmount < 0 ||
    exemptAmount < 0 ||
    shippingAmount < 0 ||
    handlingAmount < 0
  ) {
    return { error: "Amounts cannot be negative." };
  }
  if (districtRatePercent < 0) {
    return { error: "The district rate cannot be negative." };
  }
  if (districtRatePercent > CA_DISTRICT_RATE_MAX_PERCENT) {
    return {
      error: `No California district adds more than about ${CA_DISTRICT_RATE_MAX_PERCENT}% on top of the 7.25% base. Enter the district part only, not the combined rate.`,
    };
  }

  const districtRate = districtRatePercent / 100;
  const totalRate = CA_BASE_RATE + districtRate;

  const taxableShipping = shippingExempt ? 0 : shippingAmount;
  const exemptShipping = shippingExempt ? shippingAmount : 0;
  const enteredTaxable = taxableAmount + handlingAmount + taxableShipping;

  const taxableBase = priceIncludesTax ? enteredTaxable / (1 + totalRate) : enteredTaxable;

  const stateTax = roundCents(taxableBase * CA_STATE_RATE);
  const localTax = roundCents(taxableBase * CA_LOCAL_RATE);
  const districtTax = roundCents(taxableBase * districtRate);
  const totalTax = roundCents(stateTax + localTax + districtTax);

  const nonTaxableTotal = roundCents(exemptAmount + exemptShipping);
  const preTaxTotal = roundCents(taxableBase + nonTaxableTotal);
  const grandTotal = roundCents(preTaxTotal + totalTax);

  return {
    taxableBase: roundCents(taxableBase),
    exemptItems: roundCents(exemptAmount),
    exemptShipping: roundCents(exemptShipping),
    nonTaxableTotal,
    stateRatePercent: roundRate(CA_STATE_RATE * 100),
    localRatePercent: roundRate(CA_LOCAL_RATE * 100),
    baseRatePercent: roundRate(CA_BASE_RATE * 100),
    districtRatePercent: roundRate(districtRatePercent),
    combinedRatePercent: roundRate(totalRate * 100),
    stateTax,
    localTax,
    districtTax,
    totalTax,
    preTaxTotal,
    grandTotal,
    effectiveRatePercent: preTaxTotal > 0 ? roundRate((totalTax / preTaxTotal) * 100) : 0,
  };
}
