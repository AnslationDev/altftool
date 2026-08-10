/**
 * New York State and local sales tax.
 *
 * Rules implemented
 * -----------------
 * 1. State rate is 4% of the receipt — Tax Law article 28, § 1105.
 * 2. Counties and some cities impose their own rate under Tax Law article 29, typically
 *    3% to 4.75%. New York City's local rate is 4.5%.
 * 3. An extra 0.375% Metropolitan Commuter Transportation District (MCTD) surcharge applies
 *    in the five boroughs plus Dutchess, Nassau, Orange, Putnam, Rockland, Suffolk and
 *    Westchester counties. NYC therefore totals 4% + 4.5% + 0.375% = 8.875%.
 * 4. Clothing and footwear sold for less than $110 per item are exempt from the 4% state tax
 *    and from the 0.375% MCTD surcharge — Tax Law § 1115(a)(30). The local tax still applies
 *    unless the county or city has elected the same exemption; New York City has, so
 *    qualifying clothing is fully untaxed there. At $110 or more per item the whole price is
 *    taxable, not just the excess.
 * 5. Delivery, shipping and handling charges are part of the taxable receipt when the item
 *    sold is taxable — Tax Bulletin ST-838. If the item is exempt, so is its delivery charge.
 * 6. New York is destination-sourced: use the rate where the customer takes delivery.
 *
 * Nothing here is tax advice. Local rates change; the Department of Taxation and Finance
 * jurisdiction/rate publications (ST-100 series) are authoritative.
 */

/** State sales tax rate — Tax Law § 1105. */
export const NY_STATE_RATE = 0.04;

/** Metropolitan Commuter Transportation District surcharge. */
export const NY_MCTD_RATE = 0.00375;

/** Per-item price below which clothing and footwear are exempt — Tax Law § 1115(a)(30). */
export const NY_CLOTHING_EXEMPTION_THRESHOLD = 110;

/**
 * Sanity bound on the local component. The highest local rate in New York is 4.75%
 * (Erie and Oneida Counties); anything above 6% is certainly the combined rate typed by mistake.
 */
export const NY_LOCAL_RATE_MAX_PERCENT = 6;

/**
 * Reference combined rates for common New York destinations, including the 4% state share and
 * the MCTD surcharge where it applies. Presets only — confirm a jurisdiction with Publication
 * 718 before charging or filing.
 */
export const NY_LOCATION_PRESETS = [
  {
    name: "New York City",
    localPercent: 4.5,
    inMctd: true,
    localExemptsClothing: true,
    combinedPercent: 8.875,
  },
  { name: "Yonkers", localPercent: 4.5, inMctd: true, localExemptsClothing: false, combinedPercent: 8.875 },
  { name: "Nassau County", localPercent: 4.25, inMctd: true, localExemptsClothing: false, combinedPercent: 8.625 },
  { name: "Suffolk County", localPercent: 4.375, inMctd: true, localExemptsClothing: false, combinedPercent: 8.75 },
  { name: "Westchester County (outside cities)", localPercent: 4, inMctd: true, localExemptsClothing: false, combinedPercent: 8.375 },
  { name: "Rockland County", localPercent: 4, inMctd: true, localExemptsClothing: false, combinedPercent: 8.375 },
  { name: "Putnam County", localPercent: 4, inMctd: true, localExemptsClothing: false, combinedPercent: 8.375 },
  { name: "Dutchess County", localPercent: 3.75, inMctd: true, localExemptsClothing: false, combinedPercent: 8.125 },
  { name: "Orange County", localPercent: 3.75, inMctd: true, localExemptsClothing: false, combinedPercent: 8.125 },
  { name: "Erie County (Buffalo)", localPercent: 4.75, inMctd: false, localExemptsClothing: false, combinedPercent: 8.75 },
  { name: "Monroe County (Rochester)", localPercent: 4, inMctd: false, localExemptsClothing: true, combinedPercent: 8 },
  { name: "Onondaga County (Syracuse)", localPercent: 4, inMctd: false, localExemptsClothing: false, combinedPercent: 8 },
  { name: "Albany County", localPercent: 4, inMctd: false, localExemptsClothing: false, combinedPercent: 8 },
  { name: "Saratoga County", localPercent: 3, inMctd: false, localExemptsClothing: false, combinedPercent: 7 },
];

/** Round a money amount to the nearest cent, half away from zero. */
function roundCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Round a percentage to three decimals so 8.875% survives intact. */
function roundRate(value) {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

function isBadNumber(value) {
  return typeof value !== "number" || !Number.isFinite(value);
}

/**
 * Split a whole-cent total across raw (unrounded) component amounts so the
 * components always sum exactly to that total (largest-remainder method).
 * Rounding stateTax/localTax/mctdTax independently before summing them can
 * drift a cent away from rounding the combined rate once; this keeps the
 * displayed breakdown consistent with totalTax in every case.
 */
function allocateTaxCents(rawAmounts, totalCents) {
  const cents = rawAmounts.map((value) => Math.floor(value * 100 + 1e-9));
  const fractions = rawAmounts.map((value, index) => ({
    index,
    fraction: value * 100 - cents[index],
  }));
  let diff = totalCents - cents.reduce((sum, value) => sum + value, 0);

  const byLargestFraction = [...fractions].sort((a, b) => b.fraction - a.fraction);
  for (let i = 0; diff > 0 && i < byLargestFraction.length; i += 1) {
    cents[byLargestFraction[i].index] += 1;
    diff -= 1;
  }
  const bySmallestFraction = [...fractions].sort((a, b) => a.fraction - b.fraction);
  for (let i = 0; diff < 0 && i < bySmallestFraction.length; i += 1) {
    cents[bySmallestFraction[i].index] -= 1;
    diff += 1;
  }
  return cents;
}

/**
 * Compute New York sales tax on a receipt that may mix ordinary taxable goods with clothing.
 *
 * @param {object} input
 * @param {number} input.taxableAmount           Ordinary taxable goods and services.
 * @param {number} [input.clothingItemPrice]     Price of ONE clothing or footwear item.
 * @param {number} [input.clothingQuantity]      How many of that item.
 * @param {number} [input.localRatePercent]      County or city rate, in percent.
 * @param {boolean} [input.inMctd]               Adds the 0.375% MCTD surcharge.
 * @param {boolean} [input.localExemptsClothing] Locality has elected the clothing exemption.
 * @param {number} [input.shippingAmount]        Delivery / shipping / handling charged.
 * @param {boolean} [input.shippingTaxable]      Taxable when the goods shipped are taxable.
 * @param {boolean} [input.priceIncludesTax]     Treat the entered figures as tax-inclusive.
 * @returns {object} breakdown, or { error } when the input cannot produce a real answer.
 */
export function computeNewYorkSalesTax(input = {}) {
  const {
    taxableAmount,
    clothingItemPrice = 0,
    clothingQuantity = 0,
    localRatePercent = 0,
    inMctd = false,
    localExemptsClothing = false,
    shippingAmount = 0,
    shippingTaxable = true,
    priceIncludesTax = false,
  } = input;

  if (
    isBadNumber(taxableAmount) ||
    isBadNumber(clothingItemPrice) ||
    isBadNumber(clothingQuantity) ||
    isBadNumber(localRatePercent) ||
    isBadNumber(shippingAmount)
  ) {
    return { error: "Enter valid numbers for the sale amount, clothing, local rate and shipping." };
  }
  if (taxableAmount < 0 || clothingItemPrice < 0 || shippingAmount < 0) {
    return { error: "Amounts cannot be negative." };
  }
  if (clothingQuantity < 0) {
    return { error: "Clothing quantity cannot be negative." };
  }
  if (localRatePercent < 0) {
    return { error: "The local rate cannot be negative." };
  }
  if (localRatePercent > NY_LOCAL_RATE_MAX_PERCENT) {
    return {
      error: `No New York jurisdiction adds more than about ${NY_LOCAL_RATE_MAX_PERCENT}% on top of the 4% state rate. Enter the local part only, not the combined rate.`,
    };
  }

  const localRate = localRatePercent / 100;
  const mctdRate = inMctd ? NY_MCTD_RATE : 0;
  const fullRate = NY_STATE_RATE + localRate + mctdRate;

  // Clothing under the per-item threshold escapes the state rate and the MCTD surcharge; the
  // local rate applies unless the jurisdiction has elected the same exemption.
  const clothingQualifies =
    clothingQuantity > 0 && clothingItemPrice > 0 && clothingItemPrice < NY_CLOTHING_EXEMPTION_THRESHOLD;
  const clothingRate = clothingQualifies ? (localExemptsClothing ? 0 : localRate) : fullRate;

  const taxableShipping = shippingTaxable ? shippingAmount : 0;
  const exemptShipping = shippingTaxable ? 0 : shippingAmount;

  const enteredGeneral = taxableAmount + taxableShipping;
  const enteredClothing = clothingItemPrice * clothingQuantity;

  const generalBase = priceIncludesTax ? enteredGeneral / (1 + fullRate) : enteredGeneral;
  const clothingBase = priceIncludesTax ? enteredClothing / (1 + clothingRate) : enteredClothing;

  const stateTaxRaw = generalBase * NY_STATE_RATE + (clothingQualifies ? 0 : clothingBase * NY_STATE_RATE);
  const mctdTaxRaw = generalBase * mctdRate + (clothingQualifies ? 0 : clothingBase * mctdRate);
  const localTaxRaw =
    generalBase * localRate + clothingBase * (clothingQualifies && localExemptsClothing ? 0 : localRate);

  // Round the combined total once, then allocate whole cents back to the three
  // components so the displayed breakdown always sums exactly to totalTax.
  const totalTax = roundCents(stateTaxRaw + localTaxRaw + mctdTaxRaw);
  const [stateCents, localCents, mctdCents] = allocateTaxCents(
    [stateTaxRaw, localTaxRaw, mctdTaxRaw],
    Math.round(totalTax * 100),
  );
  const stateTax = stateCents / 100;
  const localTax = localCents / 100;
  const mctdTax = mctdCents / 100;

  const preTaxTotal = roundCents(generalBase + clothingBase + exemptShipping);
  const grandTotal = roundCents(preTaxTotal + totalTax);

  return {
    generalBase: roundCents(generalBase),
    clothingBase: roundCents(clothingBase),
    clothingQualifies,
    clothingFullyExempt: clothingQualifies && localExemptsClothing,
    clothingRatePercent: roundRate(clothingRate * 100),
    exemptShipping: roundCents(exemptShipping),
    stateRatePercent: roundRate(NY_STATE_RATE * 100),
    localRatePercent: roundRate(localRatePercent),
    mctdRatePercent: roundRate(mctdRate * 100),
    combinedRatePercent: roundRate(fullRate * 100),
    stateTax,
    localTax,
    mctdTax,
    totalTax,
    preTaxTotal,
    grandTotal,
    effectiveRatePercent: preTaxTotal > 0 ? roundRate((totalTax / preTaxTotal) * 100) : 0,
  };
}
