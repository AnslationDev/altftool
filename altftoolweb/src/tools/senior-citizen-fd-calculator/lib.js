/**
 * Senior citizen fixed deposit: what the extra rate is worth, and how the
 * deposit is taxed.
 *
 * Rules encoded here:
 *  - Banks offer resident depositors aged 60 or above an additional rate over
 *    the card rate. The amount is each bank's commercial decision; 0.50
 *    percentage points is the common figure, and several banks add a further
 *    0.25 points for depositors aged 80 and above ("super senior"). Both are
 *    inputs here rather than fixed rules.
 *  - Term deposit interest compounds QUARTERLY, so maturity = P x (1 + r/4)^(4n).
 *  - Section 80TTB of the Income-tax Act, 1961 allows a resident individual aged
 *    60 or above to deduct interest on deposits with banks, co-operative banks
 *    and the post office, up to ₹50,000 in a financial year. It is available only
 *    under the OLD tax regime; a taxpayer under section 115BAC, the default
 *    regime from assessment year 2024-25, cannot claim it.
 *  - Section 194A: banks deduct TDS at 10% once interest credited in a financial
 *    year exceeds ₹1,00,000 for a resident senior citizen — the threshold raised
 *    by the Finance Act, 2025 — or 20% under section 206AA without PAN. A senior
 *    citizen whose estimated total income is below the taxable limit may file
 *    Form 15H for nil deduction.
 */

/** Banks compound term deposit interest four times a year. */
export const COMPOUNDS_PER_YEAR = 4;

/** Age from which the senior citizen rate and section 80TTB apply. */
export const SENIOR_AGE = 60;

/** Age from which many banks add a further premium. */
export const SUPER_SENIOR_AGE = 80;

/** Typical additional rates offered by banks (percentage points). */
export const TYPICAL_SENIOR_PREMIUM = 0.5;
export const TYPICAL_SUPER_SENIOR_PREMIUM = 0.75;

/** Section 80TTB ceiling on deposit interest in a financial year (₹). */
export const SECTION_80TTB_LIMIT = 50000;

/** Section 194A TDS threshold for a resident senior citizen, FY 2025-26 (₹). */
export const TDS_THRESHOLD_SENIOR = 100000;

/** Section 194A threshold for everyone else, for comparison (₹). */
export const TDS_THRESHOLD_GENERAL = 50000;

/** Section 194A / 206AA deduction rates (%). */
export const TDS_RATE = 10;
export const TDS_RATE_NO_PAN = 20;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Value of one rupee after `years` years at `annualRate`, compounded quarterly. */
export function growthFactor(annualRate, years) {
  if (!isNum(annualRate) || annualRate <= 0 || !isNum(years) || years <= 0) return 1;
  return Math.pow(1 + annualRate / 100 / COMPOUNDS_PER_YEAR, COMPOUNDS_PER_YEAR * years);
}

/**
 * The additional rate a depositor of this age qualifies for.
 *
 * @param {number} age depositor's age in completed years
 * @param {object} [premiums]
 * @returns {{ premium: number, tier: "none"|"senior"|"super" }}
 */
export function seniorPremiumForAge(
  age,
  { senior = TYPICAL_SENIOR_PREMIUM, superSenior = TYPICAL_SUPER_SENIOR_PREMIUM } = {},
) {
  if (!isNum(age) || age < SENIOR_AGE) return { premium: 0, tier: "none" };
  if (age >= SUPER_SENIOR_AGE) return { premium: superSenior, tier: "super" };
  return { premium: senior, tier: "senior" };
}

/**
 * TDS on one financial year's credited interest, for a senior citizen unless
 * told otherwise.
 */
export function tdsOnInterest(
  interest,
  { isSenior = true, panFurnished = true, formFiled = false } = {},
) {
  const threshold = isSenior ? TDS_THRESHOLD_SENIOR : TDS_THRESHOLD_GENERAL;
  if (!isNum(interest) || interest <= 0 || formFiled) {
    return { rate: 0, tds: 0, threshold, deducted: false };
  }
  if (interest <= threshold) return { rate: 0, tds: 0, threshold, deducted: false };
  const rate = panFurnished ? TDS_RATE : TDS_RATE_NO_PAN;
  return { rate, tds: (interest * rate) / 100, threshold, deducted: true };
}

/**
 * Senior citizen deposit projection.
 *
 * @param {object} input
 * @param {number} input.principal
 * @param {number} input.baseRate the bank's ordinary card rate, %
 * @param {number} input.years tenure in years
 * @param {number} input.age depositor's age in completed years
 * @param {number} [input.seniorPremium] extra points for ages 60-79
 * @param {number} [input.superSeniorPremium] extra points from age 80
 * @param {number} [input.otherDepositInterest] other deposit interest in the year,
 *   which also counts towards the ₹50,000 section 80TTB ceiling
 * @param {boolean} [input.oldRegime] taxpayer is under the old regime
 * @param {number} [input.taxSlabPercent]
 * @param {boolean} [input.panFurnished]
 * @param {boolean} [input.formFiled] Form 15H filed
 * @returns {object} result, or { error }
 */
export function computeSeniorFd({
  principal,
  baseRate,
  years,
  age = 62,
  seniorPremium = TYPICAL_SENIOR_PREMIUM,
  superSeniorPremium = TYPICAL_SUPER_SENIOR_PREMIUM,
  otherDepositInterest = 0,
  oldRegime = true,
  taxSlabPercent = 0,
  panFurnished = true,
  formFiled = false,
} = {}) {
  if (!isNum(principal) || principal <= 0) {
    return { error: "Enter a deposit amount greater than zero." };
  }
  if (principal > 1e11) return { error: "Enter a deposit below ₹10,000 crore." };
  if (!isNum(baseRate) || baseRate <= 0) {
    return { error: "Enter the bank's ordinary rate, greater than zero." };
  }
  if (baseRate > 25) return { error: "Enter an interest rate of 25% or less." };
  if (!isNum(years) || years <= 0) return { error: "Enter a tenure greater than zero." };
  if (years > 10) return { error: "Banks accept term deposits of up to 10 years." };
  if (!isNum(age) || age < 0 || age > 120) {
    return { error: "Enter the depositor's age in completed years." };
  }
  if (!isNum(seniorPremium) || seniorPremium < 0 || seniorPremium > 3) {
    return { error: "Enter a senior citizen premium between 0 and 3 percentage points." };
  }
  if (!isNum(superSeniorPremium) || superSeniorPremium < 0 || superSeniorPremium > 3) {
    return { error: "Enter a super senior premium between 0 and 3 percentage points." };
  }
  if (!isNum(otherDepositInterest) || otherDepositInterest < 0) {
    return { error: "Other deposit interest cannot be negative." };
  }
  const slab = isNum(taxSlabPercent) && taxSlabPercent >= 0 ? Math.min(taxSlabPercent, 50) : 0;

  const { premium, tier } = seniorPremiumForAge(age, {
    senior: seniorPremium,
    superSenior: superSeniorPremium,
  });
  const isSenior = tier !== "none";
  const seniorRate = baseRate + premium;

  const seniorMaturity = principal * growthFactor(seniorRate, years);
  const regularMaturity = principal * growthFactor(baseRate, years);
  const seniorInterest = seniorMaturity - principal;
  const regularInterest = regularMaturity - principal;
  const extraFromPremium = seniorMaturity - regularMaturity;

  const schedule = [];
  let totalTds = 0;
  let total80ttb = 0;
  let totalTaxable = 0;
  const wholeYears = Math.ceil(years);
  for (let year = 1; year <= wholeYears; year += 1) {
    const span = Math.min(1, years - (year - 1));
    const opening = principal * growthFactor(seniorRate, year - 1);
    const closing = principal * growthFactor(seniorRate, year - 1 + span);
    const interest = closing - opening;
    const { tds, deducted } = tdsOnInterest(interest, { isSenior, panFurnished, formFiled });
    // Section 80TTB is a per-year ceiling shared with all other deposit interest,
    // so any other interest declared uses up the ₹50,000 headroom first.
    const headroom = Math.max(0, SECTION_80TTB_LIMIT - otherDepositInterest);
    const deductionAgainstThisDeposit =
      isSenior && oldRegime ? Math.min(interest, headroom) : 0;
    const taxable = Math.max(0, interest - deductionAgainstThisDeposit);
    totalTds += tds;
    total80ttb += deductionAgainstThisDeposit;
    totalTaxable += taxable;
    schedule.push({
      year,
      monthsInYear: Math.round(span * 12),
      opening,
      interest,
      closing,
      tds,
      tdsDeducted: deducted,
      deduction: deductionAgainstThisDeposit,
      taxable,
    });
  }

  const taxOnInterest = (totalTaxable * slab) / 100;
  const taxWithout80ttb = (seniorInterest * slab) / 100;
  const balanceTax = taxOnInterest - totalTds;

  return {
    principal,
    age,
    tier,
    isSenior,
    baseRate,
    premium,
    seniorRate,
    years,
    seniorMaturity,
    regularMaturity,
    seniorInterest,
    regularInterest,
    extraFromPremium,
    extraPerYear: extraFromPremium / years,
    effectiveYield:
      (Math.pow(1 + seniorRate / 100 / COMPOUNDS_PER_YEAR, COMPOUNDS_PER_YEAR) - 1) * 100,
    firstYearInterest: schedule[0]?.interest ?? 0,
    tdsThreshold: isSenior ? TDS_THRESHOLD_SENIOR : TDS_THRESHOLD_GENERAL,
    totalTds,
    anyTds: totalTds > 0,
    oldRegime,
    deduction80ttb: total80ttb,
    deduction80ttbLimit: SECTION_80TTB_LIMIT,
    taxableInterest: totalTaxable,
    taxSlabPercent: slab,
    taxOnInterest,
    taxSavedBy80ttb: taxWithout80ttb - taxOnInterest,
    balanceTaxPayable: balanceTax > 0 ? balanceTax : 0,
    excessTdsRefundable: balanceTax < 0 ? -balanceTax : 0,
    postTaxValue: seniorMaturity - taxOnInterest,
    schedule,
  };
}
