/**
 * GST for very small businesses in India: registration threshold, composition scheme under
 * section 10 of the CGST Act, 2017, and a like-for-like comparison against the regular scheme.
 *
 * Sources encoded below:
 *  - Section 22(1) CGST Act, 2017 — base registration threshold of Rs 20 lakh, Rs 10 lakh for the
 *    special category states named in the proviso.
 *  - Notification No. 10/2019-Central Tax — Rs 40 lakh threshold for a person engaged exclusively
 *    in the supply of goods, with the listed states left out of the enhancement.
 *  - Section 10 CGST Act read with Rule 7 and Notification No. 14/2019-Central Tax —
 *    composition turnover limit of Rs 1.5 crore, Rs 75 lakh for the listed states.
 *  - Notification No. 2/2019-Central Tax (Rate) — 6% composition option for service providers
 *    with turnover up to Rs 50 lakh.
 */

/** Registration thresholds, section 22 read with Notification 10/2019-CT. */
export const THRESHOLD_GOODS_STANDARD = 4000000;
export const THRESHOLD_SERVICES_STANDARD = 2000000;
export const THRESHOLD_REDUCED = 2000000;
export const THRESHOLD_SPECIAL_CATEGORY = 1000000;

/** Composition turnover ceilings. */
export const COMPOSITION_LIMIT_STANDARD = 15000000;
export const COMPOSITION_LIMIT_SPECIAL = 7500000;
/** Section 10(2A) / Notification 2/2019-CT(R) option for service suppliers. */
export const COMPOSITION_LIMIT_SERVICES = 5000000;

/** States where the Rs 40 lakh goods threshold was NOT adopted (Notification 10/2019-CT). */
export const STATES_WITHOUT_40L_GOODS_THRESHOLD = [
  "Arunachal Pradesh",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Puducherry",
  "Sikkim",
  "Telangana",
  "Tripura",
  "Uttarakhand",
];

/** Special category states with the Rs 10 lakh threshold, proviso to section 22(1). */
export const STATES_WITH_10L_THRESHOLD = ["Manipur", "Mizoram", "Nagaland", "Tripura"];

/** States where the composition ceiling stays at Rs 75 lakh, Notification 14/2019-CT. */
export const STATES_WITH_75L_COMPOSITION = [
  "Arunachal Pradesh",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Sikkim",
  "Tripura",
  "Uttarakhand",
];

export const STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

/** Composition rates, Rule 7 of the CGST Rules, 2017. Percentages of turnover in the State. */
export const BUSINESS_TYPES = [
  {
    id: "trader",
    label: "Trader / retailer of goods",
    compositionRate: 1,
    compositionBase: "taxable turnover of goods in the State",
    dealsInGoods: true,
  },
  {
    id: "manufacturer",
    label: "Manufacturer of goods",
    compositionRate: 1,
    compositionBase: "total turnover in the State",
    dealsInGoods: true,
  },
  {
    id: "restaurant",
    label: "Restaurant or eating house (no alcohol served)",
    compositionRate: 5,
    compositionBase: "total turnover in the State",
    dealsInGoods: true,
  },
  {
    id: "service",
    label: "Service provider or mixed supplier",
    compositionRate: 6,
    compositionBase: "total turnover in the State, under section 10(2A)",
    dealsInGoods: false,
  },
];

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export function getBusinessType(id) {
  return BUSINESS_TYPES.find((type) => type.id === id);
}

/** Registration threshold that applies to a business in a given state. */
export function registrationThreshold(state, dealsInGoodsOnly) {
  if (STATES_WITH_10L_THRESHOLD.includes(state)) return THRESHOLD_SPECIAL_CATEGORY;
  if (!dealsInGoodsOnly) return THRESHOLD_SERVICES_STANDARD;
  if (STATES_WITHOUT_40L_GOODS_THRESHOLD.includes(state)) return THRESHOLD_REDUCED;
  return THRESHOLD_GOODS_STANDARD;
}

/** Composition turnover ceiling for a state and business type. */
export function compositionCeiling(state, businessTypeId) {
  if (businessTypeId === "service") return COMPOSITION_LIMIT_SERVICES;
  return STATES_WITH_75L_COMPOSITION.includes(state)
    ? COMPOSITION_LIMIT_SPECIAL
    : COMPOSITION_LIMIT_STANDARD;
}

/**
 * Compare composition and regular scheme for a small business.
 *
 * Both schemes are compared at the SAME money collected from customers, which is how a small
 * B2C trader actually experiences the choice:
 *  - Regular: the receipts are treated as GST inclusive, so output tax comes out of the price and
 *    input tax on purchases is recovered as input tax credit.
 *  - Composition: no tax may be collected from customers, the composition levy is paid out of the
 *    margin, and GST paid on purchases is a sunk cost because no credit is allowed.
 *
 * @param {object} input
 * @param {number} input.annualTurnover        Money received from customers in the year.
 * @param {number} input.annualPurchases       Purchases for the year, GST inclusive.
 * @param {number} input.outputGstRate         Rate applicable to your sales, in per cent.
 * @param {number} input.inputGstRate          Average rate suffered on purchases, in per cent.
 * @param {string} input.businessTypeId
 * @param {string} input.state
 * @param {boolean} [input.makesInterStateSupplies]  Blocks composition, section 10(2)(c).
 * @returns {object} comparison, or { error }.
 */
export function compareSchemes({
  annualTurnover,
  annualPurchases,
  outputGstRate,
  inputGstRate,
  businessTypeId,
  state,
  makesInterStateSupplies = false,
}) {
  const type = getBusinessType(businessTypeId);
  if (!type) return { error: "Choose the kind of business you run." };
  if (!STATES.includes(state)) return { error: "Choose the state where you are registered." };

  const turnover = Number(annualTurnover);
  const purchases = Number(annualPurchases);
  const outRate = Number(outputGstRate);
  const inRate = Number(inputGstRate);

  if (!Number.isFinite(turnover)) return { error: "Enter your annual turnover as a number." };
  if (turnover < 0) return { error: "Turnover cannot be negative." };
  if (!Number.isFinite(purchases) || purchases < 0) {
    return { error: "Annual purchases must be zero or more." };
  }
  if (purchases > turnover) {
    return { error: "Purchases exceed turnover — check the figures before comparing schemes." };
  }
  if (!Number.isFinite(outRate) || outRate < 0 || outRate > 40) {
    return { error: "Output GST rate should be between 0% and 40%." };
  }
  if (!Number.isFinite(inRate) || inRate < 0 || inRate > 40) {
    return { error: "Input GST rate should be between 0% and 40%." };
  }

  const threshold = registrationThreshold(state, type.dealsInGoods);
  const registrationRequired = turnover > threshold;

  const ceiling = compositionCeiling(state, type.id);
  const compositionBlockers = [];
  if (turnover > ceiling) {
    compositionBlockers.push(`Turnover is above the composition ceiling for ${state}.`);
  }
  if (makesInterStateSupplies) {
    compositionBlockers.push(
      "Section 10(2)(c) bars composition for anyone making inter-state outward supplies.",
    );
  }
  const compositionEligible = compositionBlockers.length === 0;

  // Regular scheme: receipts are GST inclusive.
  const regularTaxableValue = round2(turnover / (1 + outRate / 100));
  const regularOutputTax = round2(turnover - regularTaxableValue);
  const purchaseBase = round2(purchases / (1 + inRate / 100));
  const inputTaxCredit = round2(purchases - purchaseBase);
  const regularNetGst = round2(Math.max(0, regularOutputTax - inputTaxCredit));
  const regularCreditCarried = round2(Math.max(0, inputTaxCredit - regularOutputTax));
  const regularMargin = round2(regularTaxableValue - purchaseBase);

  // Composition scheme: no tax collected, no credit.
  const compositionTax = round2(turnover * (type.compositionRate / 100));
  const compositionMargin = round2(turnover - compositionTax - purchases);

  const marginDifference = round2(compositionMargin - regularMargin);
  let betterScheme = "either";
  if (!compositionEligible) betterScheme = "regular";
  else if (marginDifference > 0) betterScheme = "composition";
  else if (marginDifference < 0) betterScheme = "regular";

  return {
    state,
    businessType: type.label,
    threshold,
    registrationRequired,
    compositionCeiling: ceiling,
    compositionEligible,
    compositionBlockers,
    compositionRate: type.compositionRate,
    compositionBase: type.compositionBase,
    compositionTax,
    compositionMargin,
    regularTaxableValue,
    regularOutputTax,
    purchaseBase,
    inputTaxCredit,
    regularNetGst,
    regularCreditCarried,
    regularMargin,
    marginDifference,
    betterScheme,
    turnover,
    purchases,
  };
}
