/**
 * Bank recurring deposit (RD) maturity value.
 *
 * Method:
 *  - Indian banks compound recurring deposit interest QUARTERLY, at the rate
 *    contracted for the chosen tenure.
 *  - Each monthly instalment earns interest only from the month it is paid, so an
 *    instalment paid in month m of an n-month RD stays invested for (n - m + 1)
 *    months. Its maturity value is R x (1 + r/4)^((n - m + 1) / 3), because one
 *    quarter is three months.
 *  - The maturity value is the sum of those n instalment values, which is a
 *    geometric series in the monthly growth factor (1 + r/4)^(1/3).
 *
 * Tax rules:
 *  - Interest on a recurring deposit has been within section 194A since the
 *    Finance Act, 2015 removed the earlier exclusion, so banks deduct TDS on it.
 *  - The Finance Act, 2025 raised the section 194A thresholds with effect from
 *    1 April 2025 to ₹1,00,000 for a resident senior citizen and ₹50,000 for
 *    everyone else, tested on the interest credited in a financial year.
 *  - The rate is 10%, or 20% under section 206AA where PAN is not furnished.
 *    Form 15G/15H can be filed for nil deduction where income is below the
 *    taxable limit.
 *  - TDS is not the final tax: the interest is taxed at the depositor's slab rate.
 */

/** Banks compound recurring deposit interest four times a year. */
export const COMPOUNDS_PER_YEAR = 4;

/** Months in one compounding quarter. */
export const MONTHS_PER_QUARTER = 3;

/** Section 194A thresholds for FY 2025-26 (₹). */
export const TDS_THRESHOLD = 50000;
export const TDS_THRESHOLD_SENIOR = 100000;

/** Section 194A / 206AA deduction rates (%). */
export const TDS_RATE = 10;
export const TDS_RATE_NO_PAN = 20;

/** Tenures banks accept for a recurring deposit, in months. */
export const MIN_TENURE_MONTHS = 6;
export const MAX_TENURE_MONTHS = 120;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Monthly growth factor implied by quarterly compounding at `annualRate`. */
export function monthlyFactor(annualRate) {
  if (!isNum(annualRate) || annualRate <= 0) return 1;
  const quarterly = 1 + annualRate / 100 / COMPOUNDS_PER_YEAR;
  return Math.pow(quarterly, 1 / MONTHS_PER_QUARTER);
}

/**
 * Value of a ₹1 monthly instalment stream after `months` months.
 * Sum of f^1 + f^2 + ... + f^months, where f is the monthly growth factor.
 */
export function annuityFactor(annualRate, months) {
  if (!isNum(months) || months <= 0) return 0;
  const n = Math.round(months);
  const f = monthlyFactor(annualRate);
  if (Math.abs(f - 1) < 1e-12) return n; // zero rate: no growth, straight sum
  return (f * (Math.pow(f, n) - 1)) / (f - 1);
}

/**
 * TDS on one financial year's credited interest.
 */
export function tdsOnInterest(
  interest,
  { isSenior = false, panFurnished = true, formFiled = false } = {},
) {
  const threshold = isSenior ? TDS_THRESHOLD_SENIOR : TDS_THRESHOLD;
  if (!isNum(interest) || interest <= 0 || formFiled) {
    return { rate: 0, tds: 0, threshold, deducted: false };
  }
  if (interest <= threshold) return { rate: 0, tds: 0, threshold, deducted: false };
  const rate = panFurnished ? TDS_RATE : TDS_RATE_NO_PAN;
  return { rate, tds: (interest * rate) / 100, threshold, deducted: true };
}

/**
 * Monthly instalment required to reach a target maturity value.
 *
 * @returns {number|null} the instalment, or null for invalid input
 */
export function instalmentForTarget({ target, annualRate, months } = {}) {
  if (!isNum(target) || target <= 0) return null;
  const factor = annuityFactor(annualRate, months);
  if (!(factor > 0)) return null;
  return target / factor;
}

/**
 * Full recurring deposit projection.
 *
 * @param {object} input
 * @param {number} input.instalment monthly deposit in rupees
 * @param {number} input.annualRate contracted rate, % per year
 * @param {number} input.months tenure in months
 * @param {boolean} [input.isSenior]
 * @param {boolean} [input.panFurnished]
 * @param {boolean} [input.formFiled]
 * @param {number} [input.taxSlabPercent]
 * @returns {object} result, or { error }
 */
export function computeRdMaturity({
  instalment,
  annualRate,
  months,
  isSenior = false,
  panFurnished = true,
  formFiled = false,
  taxSlabPercent = 0,
} = {}) {
  if (!isNum(instalment)) return { error: "Enter the amount you will deposit each month." };
  if (instalment <= 0) return { error: "The monthly instalment must be greater than zero." };
  if (instalment > 1e9) return { error: "Enter a monthly instalment below ₹100 crore." };
  if (!isNum(annualRate)) return { error: "Enter the interest rate the bank has quoted." };
  if (annualRate <= 0) return { error: "The interest rate must be greater than zero." };
  if (annualRate > 25) return { error: "Enter an interest rate of 25% or less." };
  if (!isNum(months)) return { error: "Enter the tenure in months." };
  const n = Math.round(months);
  if (n < MIN_TENURE_MONTHS) {
    return { error: "Banks open recurring deposits for a minimum of six months." };
  }
  if (n > MAX_TENURE_MONTHS) {
    return { error: "Recurring deposits run for up to ten years (120 months)." };
  }
  const slab = isNum(taxSlabPercent) && taxSlabPercent >= 0 ? Math.min(taxSlabPercent, 50) : 0;

  const maturityValue = instalment * annuityFactor(annualRate, n);
  const totalDeposited = instalment * n;
  const totalInterest = maturityValue - totalDeposited;

  // Balance after t months, so that each year's credited interest can be isolated.
  const balanceAfter = (t) => instalment * annuityFactor(annualRate, t);

  const schedule = [];
  let totalTds = 0;
  let elapsed = 0;
  let openingBalance = 0;
  let index = 0;
  while (elapsed < n) {
    const monthsThisYear = Math.min(12, n - elapsed);
    const deposits = instalment * monthsThisYear;
    const closing = balanceAfter(elapsed + monthsThisYear);
    const interest = closing - openingBalance - deposits;
    const { tds, rate, deducted } = tdsOnInterest(interest, {
      isSenior,
      panFurnished,
      formFiled,
    });
    totalTds += tds;
    index += 1;
    schedule.push({
      year: index,
      monthsInYear: monthsThisYear,
      opening: openingBalance,
      deposits,
      interest,
      closing,
      tds,
      tdsRate: rate,
      tdsDeducted: deducted,
    });
    openingBalance = closing;
    elapsed += monthsThisYear;
  }

  const taxOnInterest = (totalInterest * slab) / 100;
  const balanceTax = taxOnInterest - totalTds;
  const years = n / 12;
  const effectiveYield =
    (Math.pow(1 + annualRate / 100 / COMPOUNDS_PER_YEAR, COMPOUNDS_PER_YEAR) - 1) * 100;

  return {
    instalment,
    annualRate,
    months: n,
    years,
    maturityValue,
    totalDeposited,
    totalInterest,
    interestOnDeposits: (totalInterest / totalDeposited) * 100,
    effectiveYield,
    payoutAtMaturity: maturityValue - totalTds,
    totalTds,
    tdsThreshold: isSenior ? TDS_THRESHOLD_SENIOR : TDS_THRESHOLD,
    tdsRate: formFiled ? 0 : panFurnished ? TDS_RATE : TDS_RATE_NO_PAN,
    anyTds: totalTds > 0,
    taxSlabPercent: slab,
    taxOnInterest,
    balanceTaxPayable: balanceTax > 0 ? balanceTax : 0,
    excessTdsRefundable: balanceTax < 0 ? -balanceTax : 0,
    postTaxValue: maturityValue - taxOnInterest,
    postTaxInterest: totalInterest - taxOnInterest,
    isSenior,
    schedule,
  };
}
