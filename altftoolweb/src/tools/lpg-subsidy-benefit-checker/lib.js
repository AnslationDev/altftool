/**
 * Domestic LPG subsidy maths for India.
 *
 * Rule sources:
 *  - PAHAL (DBTL): domestic LPG is sold at market price and any subsidy is transferred
 *    directly to the consumer's bank account after purchase.
 *  - Pradhan Mantri Ujjwala Yojana (PMUY): a targeted subsidy per 14.2 kg refill for PMUY
 *    beneficiaries, announced by the Ministry of Petroleum and Natural Gas at ₹200 in May
 *    2022 and raised to ₹300 in October 2023.
 *  - The subsidised entitlement has long been capped at twelve 14.2 kg refills per
 *    household per year; smaller cylinders count against the same quantity in kilograms.
 *
 * Retail prices differ by city and change with each revision, so the price is an input.
 */

/** Standard domestic cylinder size in kilograms. */
export const STANDARD_CYLINDER_KG = 14.2;

/** Subsidised refills per household per year, expressed in standard cylinders. */
export const ANNUAL_SUBSIDISED_REFILLS = 12;

/** The same entitlement expressed in kilograms, used when the household buys 5 kg cylinders. */
export const ANNUAL_SUBSIDISED_KG = ANNUAL_SUBSIDISED_REFILLS * STANDARD_CYLINDER_KG;

/** Targeted PMUY subsidy per 14.2 kg refill, raised from ₹200 to ₹300 in October 2023. */
export const PMUY_SUBSIDY_PER_REFILL = 300;

/**
 * Subsidy for a general (non-PMUY) domestic consumer. The DBTL transfer has been nil at
 * prevailing market prices since mid-2020, so the default here is zero rather than a guess.
 */
export const GENERAL_SUBSIDY_PER_REFILL = 0;

/** Cylinder sizes sold to domestic consumers. */
export const CYLINDER_SIZES = [
  { kg: 14.2, label: "14.2 kg (standard domestic)" },
  { kg: 5, label: "5 kg (small domestic)" },
];

/** Categories that qualify a household for a PMUY connection. */
export const PMUY_QUALIFYING_CATEGORIES = [
  { id: "secc", label: "Listed in the SECC 2011 data" },
  { id: "sc-st", label: "Scheduled Caste or Scheduled Tribe household" },
  { id: "pmay-g", label: "Beneficiary of Pradhan Mantri Awas Yojana (Gramin)" },
  { id: "aay", label: "Antyodaya Anna Yojana household" },
  { id: "forest", label: "Forest dweller" },
  { id: "mbc", label: "Most backward class" },
  { id: "tea-garden", label: "Tea and ex-tea garden tribe" },
  { id: "islands", label: "Resident of islands or river islands" },
  { id: "poor-declaration", label: "Poor household under the 14-point declaration" },
  { id: "none", label: "None of these" },
];

/** Guards integer division of quantities like 170.4 / 14.2 against binary rounding. */
const FLOAT_EPSILON = 1e-9;

const round2 = (value) => Math.round(value * 100) / 100;
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Annual LPG cost for a household, before and after subsidy.
 *
 * @param {object} input
 * @param {number} input.cylinderPrice   Retail price of one cylinder in your city, in rupees.
 * @param {number} [input.cylinderKg]    Cylinder size, 14.2 or 5.
 * @param {"ujjwala"|"general"} [input.consumerType]
 * @param {number} input.refillsPerYear  How many cylinders the household buys in a year.
 * @param {number} [input.subsidyPerStandardRefill] Subsidy per 14.2 kg refill; defaults by consumer type.
 * @returns {object} cost breakdown, or { error }
 */
export function computeLpgAnnualCost({
  cylinderPrice,
  cylinderKg = STANDARD_CYLINDER_KG,
  consumerType = "ujjwala",
  refillsPerYear,
  subsidyPerStandardRefill,
} = {}) {
  if (!isNum(cylinderPrice) || cylinderPrice <= 0) {
    return { error: "Enter the retail price of one cylinder in your city." };
  }
  if (cylinderPrice > 10000) {
    return { error: "That price looks wrong — a domestic cylinder costs well under ₹10,000." };
  }
  if (!isNum(cylinderKg) || cylinderKg <= 0) {
    return { error: "Choose a valid cylinder size." };
  }
  if (!isNum(refillsPerYear) || refillsPerYear < 0) {
    return { error: "Enter how many refills the household buys in a year, or zero." };
  }
  if (refillsPerYear > 100) {
    return { error: "Enter a realistic number of refills — up to 100 a year." };
  }

  const baseSubsidy = isNum(subsidyPerStandardRefill)
    ? subsidyPerStandardRefill
    : consumerType === "ujjwala"
      ? PMUY_SUBSIDY_PER_REFILL
      : GENERAL_SUBSIDY_PER_REFILL;

  if (baseSubsidy < 0 || baseSubsidy > cylinderPrice) {
    return { error: "The subsidy cannot be negative or larger than the cylinder price." };
  }

  // The 12-refill cap is set in kilograms, so a 5 kg cylinder gets proportionally more refills.
  // The epsilon keeps 170.4 / 14.2 from landing on 11.999... in binary floating point.
  const subsidisedRefillsAllowed = Math.floor(ANNUAL_SUBSIDISED_KG / cylinderKg + FLOAT_EPSILON);
  const subsidyPerRefill = (baseSubsidy * cylinderKg) / STANDARD_CYLINDER_KG;

  const subsidisedRefills = Math.min(refillsPerYear, subsidisedRefillsAllowed);
  const unsubsidisedRefills = Math.max(0, refillsPerYear - subsidisedRefillsAllowed);

  const grossAnnualCost = refillsPerYear * cylinderPrice;
  const totalSubsidy = subsidisedRefills * subsidyPerRefill;
  const netAnnualCost = grossAnnualCost - totalSubsidy;
  const effectivePriceSubsidised = cylinderPrice - subsidyPerRefill;
  const totalKg = refillsPerYear * cylinderKg;

  return {
    consumerType,
    cylinderPrice: round2(cylinderPrice),
    cylinderKg,
    refillsPerYear,
    subsidisedRefillsAllowed,
    subsidisedRefills,
    unsubsidisedRefills,
    subsidyPerRefill: round2(subsidyPerRefill),
    effectivePriceSubsidised: round2(effectivePriceSubsidised),
    grossAnnualCost: round2(grossAnnualCost),
    totalSubsidy: round2(totalSubsidy),
    netAnnualCost: round2(netAnnualCost),
    monthlyAverage: round2(netAnnualCost / 12),
    totalKg: round2(totalKg),
    costPerKg: totalKg > 0 ? round2(netAnnualCost / totalKg) : 0,
    subsidyShare: grossAnnualCost > 0 ? round2((totalSubsidy / grossAnnualCost) * 100) : 0,
    capReached: refillsPerYear > subsidisedRefillsAllowed,
  };
}

/**
 * Compare the same household's yearly bill as a PMUY beneficiary and as a general consumer.
 *
 * @param {object} input Same shape as computeLpgAnnualCost, minus consumerType.
 * @returns {object} { ujjwala, general, annualAdvantage } or { error }
 */
export function compareLpgConsumerTypes(input = {}) {
  const ujjwala = computeLpgAnnualCost({ ...input, consumerType: "ujjwala" });
  if (ujjwala.error) return { error: ujjwala.error };
  const general = computeLpgAnnualCost({
    ...input,
    consumerType: "general",
    subsidyPerStandardRefill: GENERAL_SUBSIDY_PER_REFILL,
  });
  if (general.error) return { error: general.error };

  return {
    ujjwala,
    general,
    annualAdvantage: round2(general.netAnnualCost - ujjwala.netAnnualCost),
  };
}

/**
 * Whether a household can apply for a PMUY (Ujjwala) connection.
 *
 * PMUY gives a deposit-free connection to an adult woman of a qualifying poor household,
 * and Ujjwala 2.0 adds a free first refill and a free stove. The scheme requires that no
 * other LPG connection exists in the same household.
 *
 * @param {object} input
 * @param {boolean} input.applicantIsAdultWoman
 * @param {boolean} input.householdHasLpgConnection
 * @param {string} input.qualifyingCategory One of PMUY_QUALIFYING_CATEGORIES ids.
 * @returns {{eligible: boolean, checks: Array<{id: string, label: string, passed: boolean, detail: string}>}}
 */
export function checkUjjwalaConnectionEligibility({
  applicantIsAdultWoman = true,
  householdHasLpgConnection = false,
  qualifyingCategory = "secc",
} = {}) {
  const category = PMUY_QUALIFYING_CATEGORIES.find((item) => item.id === qualifyingCategory);
  const categoryQualifies = Boolean(category) && qualifyingCategory !== "none";

  const checks = [
    {
      id: "woman",
      label: "Applicant is an adult woman of the household",
      passed: Boolean(applicantIsAdultWoman),
      detail: applicantIsAdultWoman
        ? "The connection is issued in the name of an adult woman of the household."
        : "PMUY connections are issued only to an adult woman of the household.",
    },
    {
      id: "no-existing",
      label: "No other LPG connection in the household",
      passed: !householdHasLpgConnection,
      detail: householdHasLpgConnection
        ? "A household that already holds an LPG connection cannot take a PMUY connection."
        : "No existing connection declared, which is what the scheme requires.",
    },
    {
      id: "category",
      label: "Household belongs to a qualifying category",
      passed: categoryQualifies,
      detail: categoryQualifies
        ? `${category.label} is one of the categories PMUY covers.`
        : "The household must fall in one of the listed poor-household categories, or self-declare poor status under the 14-point declaration.",
    },
  ];

  return {
    eligible: checks.every((check) => check.passed),
    checks,
  };
}
