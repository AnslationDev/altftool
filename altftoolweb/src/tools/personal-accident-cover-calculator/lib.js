/**
 * Personal Accident (PA) cover sizing.
 *
 * Method: the needs-based "human life value" approach used by underwriters —
 *   required cover = income to replace + debts to clear + goals to fund
 *                    - cover already held - liquid savings.
 * The answer is then tested against the income multiple insurers will actually
 * issue. Indian PA underwriting normally caps the capital sum insured at about
 * 10 times gross annual income (some insurers stretch to 20x for salaried
 * applicants with proof of income), because PA is an indemnity against lost
 * earning capacity, not an investment.
 *
 * Benefit structure follows the standard Indian PA wording:
 *   Accidental Death (AD)                  = 100% of the capital sum insured
 *   Permanent Total Disablement (PTD)      = 100% (many policies pay 125%)
 *   Permanent Partial Disablement (PPD)    = a scheduled percentage, e.g. 50%
 *                                            for loss of one limb or one eye
 *   Temporary Total Disablement (TTD)      = 1% of the sum insured per week,
 *                                            subject to a rupee cap, for up to
 *                                            104 weeks
 */

/** Typical PA underwriting ceiling as a multiple of gross annual income. */
export const DEFAULT_INCOME_MULTIPLE = 10;
export const MAX_INCOME_MULTIPLE = 20;
export const MIN_INCOME_MULTIPLE = 5;

/** Weekly temporary-disability benefit: 1% of the sum insured per week. */
export const TTD_WEEKLY_PERCENT = 1;
/** Most Indian PA wordings cap the weekly benefit in rupees; Rs 5,000 is common. */
export const TTD_WEEKLY_RUPEE_CAP = 5000;
/** Maximum number of weeks TTD is payable. */
export const TTD_MAX_WEEKS = 104;

/** Scheduled payout for loss of one limb or the sight of one eye. */
export const PPD_ONE_LIMB_PERCENT = 50;

/** Cover is quoted in whole lakhs, so round the answer up to the next lakh. */
export const COVER_ROUNDING_STEP = 100000;

/** GST on a general insurance premium. */
export const GST_RATE_PERCENT = 18;

/**
 * Indicative annual premium per Rs 1,000 of sum insured, by occupation risk
 * group. Personal accident has been de-tariffed since 2007, so insurers price
 * freely; these are the mid-market rates for a death + disability + weekly
 * benefit policy and should be treated as a ballpark only.
 */
export const RISK_GROUP_RATES = [
  { id: "1", label: "Group I — desk, administrative, professional", ratePerMille: 1.0 },
  { id: "2", label: "Group II — field work, supervision, frequent travel", ratePerMille: 1.5 },
  { id: "3", label: "Group III — manual, machinery, hazardous work", ratePerMille: 2.0 },
];

export const MAX_REPLACEMENT_YEARS = 40;

export function roundUpToLakh(value) {
  if (!(value > 0)) return 0;
  return Math.ceil(value / COVER_ROUNDING_STEP) * COVER_ROUNDING_STEP;
}

/**
 * @param {object} input
 * @param {number} input.annualIncome        Gross annual income, INR.
 * @param {number} input.replacementYears    Years of income the family must replace.
 * @param {number} input.outstandingLoans    Loans that must be cleared, INR.
 * @param {number} input.futureGoals         Education / marriage / other corpus, INR.
 * @param {number} input.existingCover       Personal accident cover already held, INR.
 * @param {number} input.liquidSavings       Savings the family can fall back on, INR.
 * @param {number} input.incomeMultiple      Underwriting ceiling as a multiple of income.
 * @param {number} input.ptdPercent          Permanent total disablement payout, % of sum insured.
 * @param {number} input.ratePerMille        Indicative premium per Rs 1,000 of cover.
 * @param {number} input.dependants          People financially dependent on the income.
 * @returns {object} sizing or { error }
 */
export function sizePersonalAccidentCover({
  annualIncome,
  replacementYears = DEFAULT_INCOME_MULTIPLE,
  outstandingLoans = 0,
  futureGoals = 0,
  existingCover = 0,
  liquidSavings = 0,
  incomeMultiple = DEFAULT_INCOME_MULTIPLE,
  ptdPercent = 100,
  ratePerMille = 1.0,
  dependants = 0,
}) {
  const nums = [
    annualIncome,
    replacementYears,
    outstandingLoans,
    futureGoals,
    existingCover,
    liquidSavings,
    incomeMultiple,
    ptdPercent,
    ratePerMille,
    dependants,
  ];
  if (nums.some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (annualIncome <= 0) {
    return { error: "Annual income must be greater than zero." };
  }
  if ([outstandingLoans, futureGoals, existingCover, liquidSavings, dependants].some((n) => n < 0)) {
    return { error: "Amounts and dependant counts cannot be negative." };
  }
  if (replacementYears < 1 || replacementYears > MAX_REPLACEMENT_YEARS) {
    return { error: `Replace between 1 and ${MAX_REPLACEMENT_YEARS} years of income.` };
  }
  if (incomeMultiple < MIN_INCOME_MULTIPLE || incomeMultiple > MAX_INCOME_MULTIPLE) {
    return {
      error: `Insurers issue between ${MIN_INCOME_MULTIPLE} and ${MAX_INCOME_MULTIPLE} times annual income.`,
    };
  }
  if (ptdPercent < 50 || ptdPercent > 200) {
    return { error: "Permanent total disablement payout is normally between 50% and 200% of cover." };
  }
  if (ratePerMille <= 0 || ratePerMille > 20) {
    return { error: "Premium rate per Rs 1,000 of cover should be between 0 and 20." };
  }

  const incomeNeed = annualIncome * replacementYears;
  const grossNeed = incomeNeed + outstandingLoans + futureGoals;
  const offsets = existingCover + liquidSavings;
  const rawGap = grossNeed - offsets;
  const requiredCover = Math.max(0, rawGap);

  const underwritingCap = annualIncome * incomeMultiple;
  // Round up to the next lakh first, then clamp to the insurer's underwriting
  // cap — rounding up a figure that was already at or near the cap must never
  // push the displayed recommendedCover back above what insurers will issue.
  const recommendedCover = Math.min(roundUpToLakh(requiredCover), underwritingCap);
  const cappedByUnderwriting = requiredCover > recommendedCover;
  const shortfallAboveCap = Math.max(0, requiredCover - underwritingCap);

  const ttdWeekly = Math.min(
    (recommendedCover * TTD_WEEKLY_PERCENT) / 100,
    TTD_WEEKLY_RUPEE_CAP,
  );

  const basePremium = (recommendedCover / 1000) * ratePerMille;
  const gst = (basePremium * GST_RATE_PERCENT) / 100;

  const roundedDependants = Math.round(dependants);

  return {
    incomeNeed,
    grossNeed,
    offsets,
    requiredCover,
    underwritingCap,
    recommendedCover,
    cappedByUnderwriting,
    shortfallAboveCap,
    alreadyCovered: requiredCover === 0,
    dependants: roundedDependants,
    perDependantSupport: roundedDependants > 0 ? recommendedCover / roundedDependants : 0,
    accidentalDeathBenefit: recommendedCover,
    ptdBenefit: (recommendedCover * ptdPercent) / 100,
    ppdOneLimbBenefit: (recommendedCover * PPD_ONE_LIMB_PERCENT) / 100,
    ttdWeekly,
    ttdMaximum: ttdWeekly * TTD_MAX_WEEKS,
    basePremium,
    gst,
    totalPremium: basePremium + gst,
    monthlyPremium: (basePremium + gst) / 12,
  };
}
