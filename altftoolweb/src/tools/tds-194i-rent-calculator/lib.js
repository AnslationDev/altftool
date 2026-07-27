/**
 * Section 194-I of the Income-tax Act, 1961 — TDS on rent paid to a resident.
 *
 * Rules implemented here:
 *  - Rate: 2% for the use of plant, machinery or equipment; 10% for the use of
 *    land, building (including a factory building), land appurtenant to a
 *    building, furniture or fittings.
 *  - Threshold: up to 31 March 2025 the proviso exempted aggregate rent of
 *    Rs 2,40,000 or less in a financial year. The Finance Act 2025 replaced
 *    that with Rs 50,000 for a month or part of a month, with effect from
 *    1 April 2025.
 *  - Payer: every person except an individual or HUF whose accounts were not
 *    subject to tax audit under section 44AB in the preceding financial year.
 *  - "Rent" covers any lease, sub-lease, tenancy or other arrangement for the
 *    use of the listed assets, whether or not the payee owns them.
 *  - Section 206AA: deduction at 20% where the payee furnishes no PAN.
 *  - TDS is computed on rent excluding GST where GST is shown separately
 *    (CBDT Circular 23/2017).
 *  - No surcharge or cess is added on payments to residents.
 */

/** Threshold from 1 April 2025 — Rs 50,000 for a month or part of a month. */
export const MONTHLY_THRESHOLD_FY_2025_26 = 50000;

/** Threshold up to 31 March 2025 — Rs 2,40,000 of aggregate rent in the year. */
export const ANNUAL_THRESHOLD_UPTO_FY_2024_25 = 240000;

/** Section 206AA rate where no PAN is furnished. */
export const NO_PAN_RATE = 20;

export const ASSET_TYPES = [
  {
    id: "plant-machinery",
    label: "Plant, machinery or equipment",
    rate: 2,
    note: "Includes hired vehicles, generators, cranes and leased equipment.",
  },
  {
    id: "land-building",
    label: "Land, building, furniture or fittings",
    rate: 10,
    note: "Includes factory buildings, land appurtenant to a building, and furniture let with premises.",
  },
];

export function getAssetType(id) {
  return ASSET_TYPES.find((asset) => asset.id === id) || ASSET_TYPES[1];
}

const round2 = (value) => Math.round(value * 100) / 100;
const inr = (value) => `Rs ${Number(value).toLocaleString("en-IN")}`;

/**
 * Threshold rule that applies in a given financial year.
 * @param {number} fyStartYear Calendar year the FY begins in (2025 = FY 2025-26).
 */
export function thresholdRuleForFy(fyStartYear) {
  if (Number.isFinite(fyStartYear) && fyStartYear >= 2025) {
    return {
      basis: "monthly",
      amount: MONTHLY_THRESHOLD_FY_2025_26,
      label: `${inr(MONTHLY_THRESHOLD_FY_2025_26)} for a month or part of a month`,
    };
  }
  return {
    basis: "annual",
    amount: ANNUAL_THRESHOLD_UPTO_FY_2024_25,
    label: `${inr(ANNUAL_THRESHOLD_UPTO_FY_2024_25)} of aggregate rent in the financial year`,
  };
}

/**
 * Compute section 194-I TDS for a tenancy with a uniform monthly rent.
 *
 * @param {object} input
 * @param {number} input.monthlyRent    Rent per month, excluding GST shown separately (Rs).
 * @param {number} input.months         Number of months of rent in this financial year (1-12).
 * @param {string} input.assetType      One of ASSET_TYPES[].id
 * @param {number} input.fyStartYear    Calendar year the FY begins in.
 * @param {boolean} input.panFurnished  Whether the landlord furnished a PAN.
 * @param {boolean} input.payerCovered  Whether the payer must deduct under 194-I.
 * @returns {object} result, or { error } when the input is unusable.
 */
export function computeTds194I({
  monthlyRent,
  months = 12,
  assetType = "land-building",
  fyStartYear = 2025,
  panFurnished = true,
  payerCovered = true,
} = {}) {
  if (!Number.isFinite(monthlyRent) || !Number.isFinite(months)) {
    return { error: "Enter the rent and the number of months as numbers." };
  }
  if (monthlyRent < 0) {
    return { error: "Rent cannot be negative." };
  }
  if (monthlyRent === 0) {
    return { error: "Enter a monthly rent greater than zero." };
  }
  if (monthlyRent > 1e11) {
    return { error: "That rent is unrealistically large — check the figure you entered." };
  }
  if (months < 1 || months > 12) {
    return { error: "A financial year has 1 to 12 months of rent. Enter a value in that range." };
  }
  if (!Number.isInteger(months)) {
    return { error: "Enter whole months — a part of a month counts as a full month under 194-I." };
  }

  const asset = getAssetType(assetType);
  const rule = thresholdRuleForFy(fyStartYear);
  const annualRent = round2(monthlyRent * months);
  const rate = panFurnished ? asset.rate : NO_PAN_RATE;

  const base = {
    assetLabel: asset.label,
    assetNote: asset.note,
    statutoryRate: asset.rate,
    monthlyRent: round2(monthlyRent),
    months,
    annualRent,
    thresholdBasis: rule.basis,
    thresholdAmount: rule.amount,
    thresholdLabel: rule.label,
    panFurnished,
  };

  if (!payerCovered) {
    return {
      ...base,
      appliedRate: 0,
      thresholdCrossed: false,
      deductionRequired: false,
      tdsPerMonth: 0,
      tdsForPeriod: 0,
      netMonthlyRent: round2(monthlyRent),
      netForPeriod: annualRent,
      headroom: 0,
      reason:
        "An individual or HUF whose accounts were not audited under section 44AB in the preceding year is outside section 194-I. Section 194-IB may apply instead at 2% once monthly rent exceeds Rs 50,000.",
    };
  }

  const thresholdCrossed =
    rule.basis === "monthly" ? monthlyRent > rule.amount : annualRent > rule.amount;

  if (!thresholdCrossed) {
    const headroom =
      rule.basis === "monthly"
        ? round2(rule.amount - monthlyRent)
        : round2(rule.amount - annualRent);
    return {
      ...base,
      appliedRate: 0,
      thresholdCrossed: false,
      deductionRequired: false,
      tdsPerMonth: 0,
      tdsForPeriod: 0,
      netMonthlyRent: round2(monthlyRent),
      netForPeriod: annualRent,
      headroom,
      reason:
        rule.basis === "monthly"
          ? `Monthly rent of ${inr(round2(monthlyRent))} is within the ${inr(rule.amount)} a month limit, so no tax is deducted.`
          : `Rent for the year totals ${inr(annualRent)}, within the ${inr(rule.amount)} annual limit, so no tax is deducted.`,
    };
  }

  const tdsPerMonth = round2((monthlyRent * rate) / 100);
  const tdsForPeriod = round2((annualRent * rate) / 100);

  return {
    ...base,
    appliedRate: rate,
    thresholdCrossed: true,
    deductionRequired: tdsForPeriod > 0,
    tdsPerMonth,
    tdsForPeriod,
    netMonthlyRent: round2(monthlyRent - tdsPerMonth),
    netForPeriod: round2(annualRent - tdsForPeriod),
    headroom: 0,
    reason: panFurnished
      ? rule.basis === "monthly"
        ? `Monthly rent of ${inr(round2(monthlyRent))} exceeds the ${inr(rule.amount)} a month limit, so ${rate}% is deducted from every rent payment.`
        : `Rent for the year totals ${inr(annualRent)}, above the ${inr(rule.amount)} annual limit, so ${rate}% is deducted from every rent payment.`
      : `No PAN was furnished, so section 206AA raises the deduction to ${NO_PAN_RATE}% instead of ${asset.rate}%.`,
  };
}
