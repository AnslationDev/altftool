/**
 * Eligibility for the GST composition scheme, section 10 of the Central Goods and Services Tax
 * Act, 2017, read with Rule 7 of the CGST Rules and Notification No. 14/2019-Central Tax.
 *
 * Two separate routes exist:
 *  - Section 10(1): suppliers of goods and restaurant service, ceiling Rs 1.5 crore
 *    (Rs 75 lakh in the states listed in Notification 14/2019-CT).
 *  - Section 10(2A): any other supplier, including pure service providers, ceiling Rs 50 lakh,
 *    introduced by Notification No. 2/2019-Central Tax (Rate) and later put into the Act.
 */

export const COMPOSITION_LIMIT_STANDARD = 15000000;
export const COMPOSITION_LIMIT_SPECIAL = 7500000;
export const COMPOSITION_LIMIT_SERVICE_ROUTE = 5000000;

/**
 * First proviso to section 10(1): a goods supplier under the scheme may also supply services
 * up to 10% of turnover in the State in the preceding financial year, or Rs 5,00,000,
 * whichever is higher.
 */
export const SERVICE_ALLOWANCE_PERCENT = 10;
export const SERVICE_ALLOWANCE_FLOOR = 500000;

/** States where the composition ceiling remains Rs 75 lakh. */
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

/** Composition rates, Rule 7 of the CGST Rules, 2017. */
export const ACTIVITIES = [
  { id: "manufacturer", label: "Manufacturer of goods", route: "10(1)", rate: 1 },
  { id: "trader", label: "Trader or retailer of goods", route: "10(1)", rate: 1 },
  {
    id: "restaurant",
    label: "Restaurant or eating house not serving alcohol",
    route: "10(1)",
    rate: 5,
  },
  { id: "service", label: "Service provider or mixed supplier", route: "10(2A)", rate: 6 },
];

/**
 * Goods a composition manufacturer may not make — notified under section 10(2)(e).
 * Ice cream, pan masala and tobacco from the start; aerated water added with effect from
 * 1 October 2019; bricks and roofing tiles added with effect from 1 April 2022.
 */
export const NOTIFIED_BLOCKED_GOODS = [
  "Ice cream and other edible ice, whether or not containing cocoa",
  "Pan masala",
  "Tobacco and manufactured tobacco substitutes",
  "Aerated water",
  "Fly ash bricks, fly ash aggregate and fly ash blocks",
  "Bricks of fossil meals or similar siliceous earths",
  "Building bricks",
  "Earthen or roofing tiles",
];

export function getActivity(id) {
  return ACTIVITIES.find((activity) => activity.id === id);
}

export function compositionCeiling(state, activityId) {
  if (activityId === "service") return COMPOSITION_LIMIT_SERVICE_ROUTE;
  return STATES_WITH_75L_COMPOSITION.includes(state)
    ? COMPOSITION_LIMIT_SPECIAL
    : COMPOSITION_LIMIT_STANDARD;
}

/** First proviso to section 10(1): higher of 10% of turnover and Rs 5 lakh. */
export function serviceAllowance(previousYearTurnover) {
  const turnover = Number(previousYearTurnover);
  if (!Number.isFinite(turnover) || turnover <= 0) return SERVICE_ALLOWANCE_FLOOR;
  return Math.max((turnover * SERVICE_ALLOWANCE_PERCENT) / 100, SERVICE_ALLOWANCE_FLOOR);
}

/**
 * Run every statutory condition and report which ones pass.
 *
 * @param {object} input
 * @param {number} input.previousYearTurnover  Aggregate turnover of the preceding financial year.
 * @param {number} [input.serviceTurnover]     Value of services supplied, for the 10(1) proviso.
 * @param {string} input.state
 * @param {string} input.activityId
 * @param {boolean} [input.interStateOutward]      Section 10(2)(c).
 * @param {boolean} [input.nonTaxableSupplies]     Section 10(2)(b) — alcohol, petrol, diesel.
 * @param {boolean} [input.ecommerceTcs]           Section 10(2)(d).
 * @param {boolean} [input.notifiedGoods]          Section 10(2)(e).
 * @param {boolean} [input.casualOrNonResident]    Section 10(2)(f).
 * @param {boolean} [input.otherPanUnitsRegular]   Section 10(2) proviso — all PAN units together.
 * @returns {object} eligibility, or { error }.
 */
export function checkCompositionEligibility({
  previousYearTurnover,
  serviceTurnover = 0,
  state,
  activityId,
  interStateOutward = false,
  nonTaxableSupplies = false,
  ecommerceTcs = false,
  notifiedGoods = false,
  casualOrNonResident = false,
  otherPanUnitsRegular = false,
}) {
  const activity = getActivity(activityId);
  if (!activity) return { error: "Choose the activity your business carries on." };
  if (!STATES.includes(state)) return { error: "Choose the state where you are registered." };

  const turnover = Number(previousYearTurnover);
  const services = Number(serviceTurnover);
  if (!Number.isFinite(turnover)) {
    return { error: "Enter last year's aggregate turnover as a number." };
  }
  if (turnover < 0) return { error: "Turnover cannot be negative." };
  if (!Number.isFinite(services) || services < 0) {
    return { error: "Service turnover must be zero or more." };
  }
  if (services > turnover) {
    return { error: "Service turnover cannot exceed total turnover." };
  }

  const ceiling = compositionCeiling(state, activity.id);
  const allowance = serviceAllowance(turnover);
  const isGoodsRoute = activity.route === "10(1)";

  const checks = [
    {
      id: "turnover",
      section: isGoodsRoute ? "Section 10(1)" : "Section 10(2A)",
      label: `Aggregate turnover of the preceding year is within the ceiling for ${state}`,
      passed: turnover <= ceiling,
      detail: `Ceiling is Rs ${ceiling.toLocaleString("en-IN")}; you entered Rs ${turnover.toLocaleString("en-IN")}.`,
    },
    {
      id: "service-cap",
      section: "First proviso to section 10(1)",
      label: "Services supplied stay within the allowance for a goods composition dealer",
      passed: !isGoodsRoute || activity.id === "restaurant" || services <= allowance,
      detail: isGoodsRoute
        ? `Allowed: higher of 10% of turnover and Rs 5,00,000, i.e. Rs ${Math.round(allowance).toLocaleString("en-IN")}. Restaurant service is not counted against this cap.`
        : "Not applicable — you are being tested under the section 10(2A) route for service suppliers.",
    },
    {
      id: "non-taxable",
      section: "Section 10(2)(b)",
      label: "No supply of goods or services that are not leviable to GST",
      passed: !nonTaxableSupplies,
      detail: "Alcoholic liquor for human consumption, petrol, diesel and ATF are outside GST.",
    },
    {
      id: "inter-state",
      section: "Section 10(2)(c)",
      label: "No inter-state outward supplies",
      passed: !interStateOutward,
      detail: "Buying from another state is fine; selling to another state is not.",
    },
    {
      id: "ecommerce",
      section: "Section 10(2)(d)",
      label: "No supplies through an e-commerce operator that collects TCS under section 52",
      passed: !ecommerceTcs,
      detail: "Selling on a marketplace that deducts 0.5% TCS closes the scheme to you.",
    },
    {
      id: "notified-goods",
      section: "Section 10(2)(e)",
      label: "Not a manufacturer of the notified goods",
      passed: !notifiedGoods,
      detail: NOTIFIED_BLOCKED_GOODS.join("; ") + ".",
    },
    {
      id: "casual",
      section: "Section 10(2)(f)",
      label: "Not a casual taxable person or a non-resident taxable person",
      passed: !casualOrNonResident,
      detail: "Both are excluded outright, whatever the turnover.",
    },
    {
      id: "pan-units",
      section: "Proviso to section 10(2)",
      label: "Every other registration on the same PAN also opts for composition",
      passed: !otherPanUnitsRegular,
      detail: "The scheme is all-or-nothing across all registrations held under one PAN.",
    },
  ];

  const failed = checks.filter((check) => !check.passed);
  const eligible = failed.length === 0;

  // The 10(2A) route is available only to a person not eligible under 10(1).
  let fallbackRoute = null;
  if (!eligible && isGoodsRoute) {
    const onlyTurnoverOrServiceFailed = failed.every(
      (check) => check.id === "turnover" || check.id === "service-cap",
    );
    if (onlyTurnoverOrServiceFailed && turnover <= COMPOSITION_LIMIT_SERVICE_ROUTE) {
      fallbackRoute = {
        section: "10(2A)",
        rate: 6,
        ceiling: COMPOSITION_LIMIT_SERVICE_ROUTE,
        reason:
          "You fall outside section 10(1) but your turnover is within Rs 50 lakh, so the section 10(2A) route at 6% may still be open.",
      };
    }
  }

  return {
    eligible,
    route: activity.route,
    rate: activity.rate,
    activity: activity.label,
    state,
    ceiling,
    serviceAllowance: Math.round(allowance),
    turnover,
    serviceTurnover: services,
    checks,
    failedCount: failed.length,
    failedReasons: failed.map((check) => `${check.section}: ${check.label}`),
    fallbackRoute,
  };
}
