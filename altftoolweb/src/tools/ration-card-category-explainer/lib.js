/**
 * Ration card categories and entitlements under the National Food Security Act, 2013.
 *
 * Rule sources:
 *  - NFSA 2013 section 3(1) and Schedule I: entitlements and issue prices.
 *  - NFSA 2013 section 3(2): 35 kg per household per month for Antyodaya Anna Yojana
 *    households and 5 kg per person per month for priority households.
 *  - NFSA 2013 section 3(2) proviso and section 9: coverage of up to 75% of the rural
 *    population and up to 50% of the urban population.
 *  - NFSA 2013 sections 4, 5 and 6: maternity benefit and children's entitlements.
 *  - Pradhan Mantri Garib Kalyan Anna Yojana: NFSA foodgrains supplied free of cost from
 *    1 January 2023, extended for five years from 1 January 2024.
 *
 * Identification of households into AAY and priority categories is done by state
 * governments under their own guidelines, so this module explains the entitlements that
 * follow from a category rather than guessing which category a family belongs to.
 */

/** Section 3(2)(a): AAY households get a flat quantity per household, not per person. */
export const AAY_KG_PER_HOUSEHOLD_PER_MONTH = 35;

/** Section 3(2)(b): priority households get this quantity per person per month. */
export const PHH_KG_PER_PERSON_PER_MONTH = 5;

/** Schedule I issue prices, in rupees per kg. */
export const NFSA_ISSUE_PRICE_RICE = 3;
export const NFSA_ISSUE_PRICE_WHEAT = 2;
export const NFSA_ISSUE_PRICE_COARSE = 1;

/** Under PMGKAY the NFSA quota is issued free of cost, so beneficiaries pay nothing. */
export const PMGKAY_ISSUE_PRICE = 0;

/** Section 3(2) proviso: outer limits of NFSA coverage. */
export const NFSA_RURAL_COVERAGE_PCT = 75;
export const NFSA_URBAN_COVERAGE_PCT = 50;

/** Section 4: maternity benefit for pregnant women and lactating mothers. */
export const MATERNITY_BENEFIT_MIN = 6000;

/** Grains a card holder can draw, with the NFSA issue price of each. */
export const GRAIN_TYPES = [
  { id: "rice", label: "Rice", issuePrice: NFSA_ISSUE_PRICE_RICE },
  { id: "wheat", label: "Wheat", issuePrice: NFSA_ISSUE_PRICE_WHEAT },
  { id: "coarse", label: "Coarse grains", issuePrice: NFSA_ISSUE_PRICE_COARSE },
];

/**
 * The three card categories a household is likely to hold, with what each one means.
 * Eligibility is framed as the criteria states commonly use, because NFSA leaves
 * identification to state governments.
 */
export const CARD_CATEGORIES = [
  {
    id: "aay",
    label: "Antyodaya Anna Yojana (AAY)",
    entitlementRule: `${AAY_KG_PER_HOUSEHOLD_PER_MONTH} kg of foodgrain per household per month, whatever the household size.`,
    who: "The poorest of the poor, identified by the state government.",
    typicalCriteria: [
      "Landless agricultural labourers, marginal farmers, rural artisans and craftspeople without assured subsistence.",
      "Households headed by a widow, a terminally ill person, a disabled person, or a person aged 60 or above with no assured means of subsistence.",
      "Primitive tribal households and, in urban areas, households in comparable distress.",
      "All households of particularly vulnerable tribal groups, as notified by states.",
    ],
  },
  {
    id: "phh",
    label: "Priority Household (PHH)",
    entitlementRule: `${PHH_KG_PER_PERSON_PER_MONTH} kg of foodgrain per person per month, so the quantity grows with the family.`,
    who: "Households inside the NFSA coverage limits but not identified as AAY.",
    typicalCriteria: [
      "Identified by the state government under guidelines it frames, within coverage of up to 75% of the rural and 50% of the urban population.",
      "States commonly exclude income-tax payers, government employees, four-wheeler owners and households holding land above a stated limit.",
      "Every eligible household is issued a card with the eldest woman aged 18 or above as the head of the household.",
    ],
  },
  {
    id: "non-nfsa",
    label: "Non-NFSA / state scheme card",
    entitlementRule:
      "No NFSA quantity applies. Grain, sugar or kerosene come only from state schemes, at state-set quantities and prices.",
    who: "Households outside the NFSA coverage limits, holding a state card.",
    typicalCriteria: [
      "Issued by states under their own schemes, often labelled APL, orange, white or a similar local name.",
      "Quantities and prices vary widely and are revised by the state, not by the central Act.",
      "The card is still valid proof of residence and is used for other state benefits.",
    ],
  },
];

const round2 = (value) => Math.round(value * 100) / 100;
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Look up a category definition by id. Returns null for anything unrecognised. */
export function getCardCategory(cardType) {
  return CARD_CATEGORIES.find((item) => item.id === cardType) || null;
}

/**
 * Monthly and yearly foodgrain entitlement, and what it is worth.
 *
 * @param {object} input
 * @param {"aay"|"phh"|"non-nfsa"} input.cardType
 * @param {number} input.householdMembers Number of members listed on the card.
 * @param {number} [input.ricePct]  Share of the quota drawn as rice, 0 to 100. The rest is wheat.
 * @param {number} [input.marketRicePrice]  Open-market rice price per kg, for the value comparison.
 * @param {number} [input.marketWheatPrice] Open-market wheat price per kg.
 * @returns {object} entitlement breakdown, or { error }
 */
export function computeRationEntitlement({
  cardType = "phh",
  householdMembers,
  ricePct = 100,
  marketRicePrice = 0,
  marketWheatPrice = 0,
} = {}) {
  const category = getCardCategory(cardType);
  if (!category) return { error: "Choose one of the ration card categories." };
  if (!isNum(householdMembers) || householdMembers < 1) {
    return { error: "Enter at least one member listed on the ration card." };
  }
  if (householdMembers > 30) {
    return { error: "Enter a household size of 30 members or fewer." };
  }
  if (!isNum(ricePct) || ricePct < 0 || ricePct > 100) {
    return { error: "The rice share must be between 0% and 100%." };
  }
  if (!isNum(marketRicePrice) || marketRicePrice < 0 || !isNum(marketWheatPrice) || marketWheatPrice < 0) {
    return { error: "Market prices cannot be negative." };
  }

  let monthlyKg;
  if (cardType === "aay") {
    monthlyKg = AAY_KG_PER_HOUSEHOLD_PER_MONTH;
  } else if (cardType === "phh") {
    monthlyKg = PHH_KG_PER_PERSON_PER_MONTH * householdMembers;
  } else {
    monthlyKg = 0;
  }

  const riceKg = (monthlyKg * ricePct) / 100;
  const wheatKg = monthlyKg - riceKg;

  const costAtIssuePrice = riceKg * NFSA_ISSUE_PRICE_RICE + wheatKg * NFSA_ISSUE_PRICE_WHEAT;
  const costUnderPmgkay = monthlyKg * PMGKAY_ISSUE_PRICE;
  const marketValue = riceKg * marketRicePrice + wheatKg * marketWheatPrice;

  return {
    cardType,
    categoryLabel: category.label,
    entitlementRule: category.entitlementRule,
    householdMembers,
    monthlyKg: round2(monthlyKg),
    annualKg: round2(monthlyKg * 12),
    perPersonKg: round2(monthlyKg / householdMembers),
    riceKg: round2(riceKg),
    wheatKg: round2(wheatKg),
    costAtIssuePrice: round2(costAtIssuePrice),
    costUnderPmgkay: round2(costUnderPmgkay),
    savingVsIssuePrice: round2(costAtIssuePrice - costUnderPmgkay),
    marketValue: round2(marketValue),
    annualMarketValue: round2(marketValue * 12),
    monthlyBenefit: round2(marketValue - costUnderPmgkay),
    annualBenefit: round2((marketValue - costUnderPmgkay) * 12),
    hasNfsaEntitlement: monthlyKg > 0,
  };
}

/**
 * How the same household would fare under each category, so the difference is visible.
 *
 * @param {object} input Same shape as computeRationEntitlement, minus cardType.
 * @returns {Array<object>|{error: string}} one row per category
 */
export function compareRationCategories(input = {}) {
  const rows = CARD_CATEGORIES.map((category) =>
    computeRationEntitlement({ ...input, cardType: category.id }),
  );
  const failed = rows.find((row) => row.error);
  if (failed) return { error: failed.error };
  return rows;
}
