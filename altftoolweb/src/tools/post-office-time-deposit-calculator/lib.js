/**
 * Post Office Time Deposit (National Savings Time Deposit Scheme, 2019).
 *
 * Rules encoded here come from the scheme notification and the quarterly small
 * savings rate notifications issued by the Ministry of Finance:
 *  - accounts are opened for 1, 2, 3 or 5 years;
 *  - interest is CALCULATED on a quarterly compounded basis but PAYABLE ANNUALLY,
 *    credited to the depositor's post office savings account;
 *  - the 5-year account qualifies for a deduction under section 80C of the
 *    Income-tax Act, 1961; the shorter tenures do not.
 */

/** Notified rates, % per annum, in force from the quarter beginning 1 January 2024. */
export const POTD_RATES = {
  1: 6.9,
  2: 7.0,
  3: 7.1,
  5: 7.5,
};

/** Tenures the scheme allows, in years. */
export const POTD_TENURES = [1, 2, 3, 5];

/** Interest is compounded quarterly under the scheme. */
export const COMPOUNDS_PER_YEAR = 4;

/** Minimum deposit and the multiple deposits must be in. */
export const POTD_MIN_DEPOSIT = 1000;
export const POTD_MULTIPLE = 100;

/** Post Office Savings Account rate, used for premature-closure part periods. */
export const POSB_RATE = 4.0;

/** No premature closure is permitted in the first six months. */
export const PREMATURE_MIN_MONTHS = 6;

/** Premature closure after a year pays 2 percentage points below the TD rate. */
export const PREMATURE_RATE_PENALTY = 2.0;

/** Section 80C ceiling on the 5-year account (₹1.5 lakh across all 80C items). */
export const SECTION_80C_LIMIT = 150000;
export const SECTION_80C_TENURE = 5;

/**
 * Section 194A TDS thresholds on post office / bank interest for FY 2025-26
 * (raised by the Finance Act, 2025): ₹1,00,000 for senior citizens, ₹50,000 for
 * everyone else. TDS is deducted at 10% where PAN is on record.
 */
export const TDS_THRESHOLD = 50000;
export const TDS_THRESHOLD_SENIOR = 100000;
export const TDS_RATE = 10;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Effective annual yield of a nominal rate compounded q times a year.
 * (1 + r/q)^q - 1
 */
export function effectiveAnnualYield(annualRate, compounds = COMPOUNDS_PER_YEAR) {
  if (!isNum(annualRate) || annualRate <= 0) return 0;
  return (Math.pow(1 + annualRate / 100 / compounds, compounds) - 1) * 100;
}

/**
 * Post Office Time Deposit projection.
 *
 * @param {object} input
 * @param {number} input.principal deposit amount in rupees
 * @param {number} input.tenureYears 1, 2, 3 or 5
 * @param {number} [input.annualRate] override the notified rate
 * @param {number} [input.taxSlabPercent] the depositor's income-tax slab rate
 * @param {boolean} [input.isSenior] senior citizen, for the TDS threshold
 * @returns {object} result, or { error } for invalid input
 */
export function computeTimeDeposit({
  principal,
  tenureYears = 5,
  annualRate,
  taxSlabPercent = 0,
  isSenior = false,
} = {}) {
  if (!isNum(principal)) {
    return { error: "Enter the amount you want to deposit." };
  }
  if (principal <= 0) {
    return { error: "The deposit amount must be greater than zero." };
  }
  if (principal > 1e11) {
    return { error: "Enter a deposit below ₹10,000 crore." };
  }
  if (!POTD_TENURES.includes(tenureYears)) {
    return { error: "Post Office Time Deposit accounts run for 1, 2, 3 or 5 years only." };
  }
  const rate = isNum(annualRate) ? annualRate : POTD_RATES[tenureYears];
  if (!isNum(rate) || rate <= 0) {
    return { error: "Enter an interest rate greater than zero." };
  }
  if (rate > 25) {
    return { error: "Enter an interest rate of 25% or less." };
  }
  const slab = isNum(taxSlabPercent) && taxSlabPercent >= 0 ? Math.min(taxSlabPercent, 50) : 0;

  const yieldPercent = effectiveAnnualYield(rate);
  // Interest is payable annually, so one year of quarterly compounding is the payout.
  const annualInterest = principal * (yieldPercent / 100);
  const totalInterest = annualInterest * tenureYears;
  const maturityValue = principal + annualInterest; // principal back plus the last payout
  const totalReceived = principal + totalInterest;

  // What the same deposit would grow to if every payout were re-deposited at the
  // same rate instead of being spent.
  const reinvestedValue =
    principal * Math.pow(1 + rate / 100 / COMPOUNDS_PER_YEAR, COMPOUNDS_PER_YEAR * tenureYears);

  const threshold = isSenior ? TDS_THRESHOLD_SENIOR : TDS_THRESHOLD;
  const tdsApplies = annualInterest > threshold;
  const tdsPerYear = tdsApplies ? annualInterest * (TDS_RATE / 100) : 0;

  const taxPerYear = annualInterest * (slab / 100);
  const postTaxAnnualInterest = annualInterest - taxPerYear;

  const eligible80C = tenureYears === SECTION_80C_TENURE;
  const deduction80C = eligible80C ? Math.min(principal, SECTION_80C_LIMIT) : 0;

  const schedule = [];
  for (let year = 1; year <= tenureYears; year += 1) {
    schedule.push({
      year,
      interest: annualInterest,
      tds: tdsPerYear,
      postTax: postTaxAnnualInterest,
      cumulative: annualInterest * year,
      principalReturned: year === tenureYears ? principal : 0,
    });
  }

  return {
    principal,
    tenureYears,
    annualRate: rate,
    effectiveYield: yieldPercent,
    quarterlyRate: rate / COMPOUNDS_PER_YEAR,
    annualInterest,
    quarterlyAccrual: annualInterest / COMPOUNDS_PER_YEAR,
    monthlyEquivalent: annualInterest / 12,
    totalInterest,
    maturityValue,
    totalReceived,
    reinvestedValue,
    reinvestedGain: reinvestedValue - principal,
    tdsThreshold: threshold,
    tdsApplies,
    tdsPerYear,
    taxSlabPercent: slab,
    taxPerYear,
    postTaxAnnualInterest,
    postTaxTotalInterest: postTaxAnnualInterest * tenureYears,
    eligible80C,
    deduction80C,
    belowMinimum: principal < POTD_MIN_DEPOSIT,
    offMultiple: Math.abs(principal % POTD_MULTIPLE) > 1e-9,
    schedule,
  };
}

/**
 * Premature closure estimate.
 *
 * Scheme rules: nothing may be withdrawn in the first 6 months. Closed between 6
 * and 12 months, only the Post Office Savings Account rate is paid. Closed after a
 * year, completed years earn 2 percentage points below the Time Deposit rate for
 * the nearest completed tenure (1, 2 or 3 years) and the leftover months earn the
 * savings account rate.
 *
 * @param {object} input
 * @param {number} input.principal
 * @param {number} input.monthsHeld whole months the deposit ran
 * @param {number} [input.fullTermInterest] interest the deposit would have earned
 *   if held to maturity, used to report the interest given up
 * @returns {object} result, or { error }
 */
export function computePrematureClosure({ principal, monthsHeld, fullTermInterest = 0 } = {}) {
  const forgone = (earned) =>
    isNum(fullTermInterest) && fullTermInterest > earned ? fullTermInterest - earned : 0;

  if (!isNum(principal) || principal <= 0) {
    return { error: "Enter a deposit amount greater than zero." };
  }
  if (!isNum(monthsHeld) || monthsHeld < 0) {
    return { error: "Enter how many months the deposit has run." };
  }
  const months = Math.floor(monthsHeld);
  if (months < PREMATURE_MIN_MONTHS) {
    return {
      allowed: false,
      reason: "A Time Deposit cannot be closed within six months of opening.",
      principal,
      monthsHeld: months,
      payout: principal,
      interest: 0,
      appliedRate: 0,
    };
  }
  if (months < 12) {
    // Only the savings account rate applies, simple, for the months held.
    const interest = principal * (POSB_RATE / 100) * (months / 12);
    return {
      allowed: true,
      reason: `Closed before one year, so only the ${POSB_RATE}% Post Office Savings Account rate applies.`,
      principal,
      monthsHeld: months,
      completedYears: 0,
      appliedRate: POSB_RATE,
      interest,
      payout: principal + interest,
    };
  }

  const completedYears = Math.floor(months / 12);
  // Nearest notified tenure at or below the completed years.
  const bracket = [1, 2, 3].filter((years) => years <= completedYears).pop() ?? 1;
  const appliedRate = Math.max(POTD_RATES[bracket] - PREMATURE_RATE_PENALTY, 0);
  const compounded =
    principal *
    Math.pow(1 + appliedRate / 100 / COMPOUNDS_PER_YEAR, COMPOUNDS_PER_YEAR * completedYears);
  const leftoverMonths = months - completedYears * 12;
  const leftoverInterest = compounded * (POSB_RATE / 100) * (leftoverMonths / 12);
  const payout = compounded + leftoverInterest;

  return {
    allowed: true,
    reason: `Completed years earn the ${bracket}-year rate of ${POTD_RATES[bracket]}% less ${PREMATURE_RATE_PENALTY} points; the remaining ${leftoverMonths} month${
      leftoverMonths === 1 ? "" : "s"
    } earn the ${POSB_RATE}% savings rate.`,
    principal,
    monthsHeld: months,
    completedYears,
    rateBracket: bracket,
    appliedRate,
    leftoverMonths,
    interest: payout - principal,
    payout,
  };
}
