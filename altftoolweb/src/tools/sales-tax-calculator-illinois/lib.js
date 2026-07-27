/**
 * Illinois sales tax (Retailers' Occupation Tax and Use Tax).
 *
 * Rules implemented
 * -----------------
 * 1. General merchandise is taxed at 6.25% under the Retailers' Occupation Tax Act,
 *    35 ILCS 120. That 6.25% is itself split three ways by statute: 5.00% is kept by the
 *    state, 1.00% is distributed to municipalities and 0.25% to counties.
 * 2. Local governments add their own tax on top — home rule municipal ROT, county tax, the
 *    RTA/transit tax and business district taxes. Chicago's combined rate of 10.25% is the
 *    6.25% state rate plus 1.25% city, 1.75% Cook County and 1.00% RTA.
 * 3. A reduced 1% rate applies to qualifying drugs, medical appliances and qualifying food.
 *    Home rule local taxes generally do not attach to these items, but some non-home-rule and
 *    county taxes do, so the low rate is an explicit input here rather than a fixed number.
 *    Public Act 103-0781 repealed the 1% STATE grocery tax with effect from 1 January 2026
 *    and lets municipalities impose their own 1% grocery tax in its place — which rate you
 *    charge on food now depends on the municipality.
 * 4. Delivery charges are taxable when they are an inseparable part of the sale. They are not
 *    taxable when the charge is separately contracted for and the buyer could have avoided it,
 *    for example by collecting the goods — 86 Ill. Adm. Code 130.415.
 * 5. Sourcing: Illinois retailers with a physical selling location generally source to that
 *    location; remote retailers and, since 1 January 2025, out-of-state sellers with Illinois
 *    inventory source to the destination.
 *
 * Nothing here is tax advice. Local rates change twice a year; the MyTax Illinois Tax Rate
 * Finder is the authoritative source for an address.
 */

/** General merchandise state rate — 35 ILCS 120. */
export const IL_STATE_GENERAL_RATE = 0.0625;

/** How the 6.25% is divided by statute. */
export const IL_STATE_SHARE = 0.05;
export const IL_MUNICIPAL_SHARE = 0.01;
export const IL_COUNTY_SHARE = 0.0025;

/** Reduced rate for qualifying drugs, medical appliances and qualifying food. */
export const IL_LOW_RATE_PERCENT = 1;

/**
 * Sanity bound on the local component. The highest combined rates in Illinois are around
 * 11.5%, i.e. a local component near 5.25%. Anything above 6% is the combined rate typed in
 * by mistake.
 */
export const IL_LOCAL_RATE_MAX_PERCENT = 6;

/**
 * Reference combined general-merchandise rates for common Illinois destinations, including
 * the 6.25% state rate. Presets only — rates change on 1 January and 1 July, so verify an
 * address with the MyTax Illinois Tax Rate Finder before charging or filing.
 */
export const IL_LOCATION_PRESETS = [
  { name: "Chicago", county: "Cook", combinedPercent: 10.25 },
  { name: "Evanston", county: "Cook", combinedPercent: 10.25 },
  { name: "Springfield", county: "Sangamon", combinedPercent: 9.75 },
  { name: "Decatur", county: "Macon", combinedPercent: 9.25 },
  { name: "Suburban Cook County (unincorporated)", county: "Cook", combinedPercent: 9 },
  { name: "Peoria", county: "Peoria", combinedPercent: 9 },
  { name: "Champaign", county: "Champaign", combinedPercent: 9 },
  { name: "Rockford", county: "Winnebago", combinedPercent: 8.75 },
  { name: "Joliet", county: "Will", combinedPercent: 8.75 },
  { name: "Aurora", county: "Kane", combinedPercent: 8.25 },
  { name: "Naperville", county: "DuPage", combinedPercent: 7.75 },
  { name: "No local tax (state rate only)", county: "Various", combinedPercent: 6.25 },
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

/** Strip the 6.25% state rate out of a combined percentage. Never returns a negative. */
export function localPartOfCombined(combinedPercent) {
  if (isBadNumber(combinedPercent)) return 0;
  return roundRate(Math.max(0, combinedPercent - IL_STATE_GENERAL_RATE * 100));
}

/**
 * Compute Illinois sales tax on a receipt that may mix general merchandise with low-rate items.
 *
 * @param {object} input
 * @param {number} input.generalAmount        General merchandise subject to 6.25% plus local.
 * @param {number} [input.lowRateAmount]      Qualifying drugs, medical appliances or food.
 * @param {number} [input.lowRatePercent]     Rate applied to those items (default 1%).
 * @param {number} [input.localRatePercent]   Local tax on general merchandise, in percent.
 * @param {number} [input.exemptAmount]       Fully exempt items.
 * @param {number} [input.shippingAmount]     Delivery charge.
 * @param {boolean} [input.shippingTaxable]   False when separately contracted and avoidable.
 * @param {boolean} [input.priceIncludesTax]  Treat the entered figures as tax-inclusive.
 * @returns {object} breakdown, or { error } when the input cannot produce a real answer.
 */
export function computeIllinoisSalesTax(input = {}) {
  const {
    generalAmount,
    lowRateAmount = 0,
    lowRatePercent = IL_LOW_RATE_PERCENT,
    localRatePercent = 0,
    exemptAmount = 0,
    shippingAmount = 0,
    shippingTaxable = true,
    priceIncludesTax = false,
  } = input;

  if (
    isBadNumber(generalAmount) ||
    isBadNumber(lowRateAmount) ||
    isBadNumber(lowRatePercent) ||
    isBadNumber(localRatePercent) ||
    isBadNumber(exemptAmount) ||
    isBadNumber(shippingAmount)
  ) {
    return { error: "Enter valid numbers for the sale amounts, rates and shipping." };
  }
  if (
    generalAmount < 0 ||
    lowRateAmount < 0 ||
    exemptAmount < 0 ||
    shippingAmount < 0
  ) {
    return { error: "Amounts cannot be negative." };
  }
  if (localRatePercent < 0 || lowRatePercent < 0) {
    return { error: "Tax rates cannot be negative." };
  }
  if (localRatePercent > IL_LOCAL_RATE_MAX_PERCENT) {
    return {
      error: `No Illinois jurisdiction adds more than about ${IL_LOCAL_RATE_MAX_PERCENT}% on top of the 6.25% state rate. Enter the local part only, not the combined rate.`,
    };
  }
  if (lowRatePercent > IL_STATE_GENERAL_RATE * 100) {
    return {
      error: "The reduced rate for food, drugs and medical appliances cannot exceed the 6.25% general rate.",
    };
  }

  const localRate = localRatePercent / 100;
  const generalRate = IL_STATE_GENERAL_RATE + localRate;
  const lowRate = lowRatePercent / 100;

  const taxableShipping = shippingTaxable ? shippingAmount : 0;
  const exemptShipping = shippingTaxable ? 0 : shippingAmount;

  const enteredGeneral = generalAmount + taxableShipping;
  const generalBase = priceIncludesTax ? enteredGeneral / (1 + generalRate) : enteredGeneral;
  const lowBase = priceIncludesTax ? lowRateAmount / (1 + lowRate) : lowRateAmount;

  // The 6.25% general rate is distributed: 5.00% state, 1.00% municipal, 0.25% county.
  const stateShareTax = roundCents(generalBase * IL_STATE_SHARE);
  const municipalShareTax = roundCents(generalBase * IL_MUNICIPAL_SHARE);
  const countyShareTax = roundCents(generalBase * IL_COUNTY_SHARE);
  const localTax = roundCents(generalBase * localRate);
  const lowRateTax = roundCents(lowBase * lowRate);

  const totalTax = roundCents(
    stateShareTax + municipalShareTax + countyShareTax + localTax + lowRateTax,
  );

  const nonTaxableTotal = roundCents(exemptAmount + exemptShipping);
  const preTaxTotal = roundCents(generalBase + lowBase + nonTaxableTotal);
  const grandTotal = roundCents(preTaxTotal + totalTax);

  return {
    generalBase: roundCents(generalBase),
    lowRateBase: roundCents(lowBase),
    exemptItems: roundCents(exemptAmount),
    exemptShipping: roundCents(exemptShipping),
    nonTaxableTotal,
    stateRatePercent: roundRate(IL_STATE_GENERAL_RATE * 100),
    localRatePercent: roundRate(localRatePercent),
    combinedRatePercent: roundRate(generalRate * 100),
    lowRatePercent: roundRate(lowRatePercent),
    stateShareTax,
    municipalShareTax,
    countyShareTax,
    stateRateTax: roundCents(stateShareTax + municipalShareTax + countyShareTax),
    localTax,
    lowRateTax,
    totalTax,
    preTaxTotal,
    grandTotal,
    effectiveRatePercent: preTaxTotal > 0 ? roundRate((totalTax / preTaxTotal) * 100) : 0,
  };
}
