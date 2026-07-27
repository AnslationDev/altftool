/**
 * Bank fixed deposit maturity value, year-wise interest accrual and TDS.
 *
 * Conventions and statutory rules encoded here:
 *  - Indian banks compound term-deposit interest QUARTERLY on a cumulative
 *    (reinvestment) deposit, so the maturity value is P x (1 + r/4)^(4n) where r
 *    is the annual rate as a decimal and n the term in years.
 *  - Section 194A of the Income-tax Act, 1961: a bank deducts tax at source on
 *    interest CREDITED OR PAID during a financial year once it crosses the
 *    threshold for the payer branch aggregate. The Finance Act, 2025 raised the
 *    thresholds with effect from 1 April 2025 to ₹1,00,000 for a resident senior
 *    citizen and ₹50,000 for everyone else.
 *  - The rate of deduction is 10%; under section 206AA it is 20% where PAN is not
 *    furnished.
 *  - Section 197A(1A)/(1C): Form 15G, or Form 15H for a resident aged 60 or more,
 *    can be filed for nil deduction where estimated total income is below the
 *    taxable limit.
 *  - TDS is not the final tax. The whole interest is added to total income and
 *    taxed at the depositor's slab rate; TDS is only a credit against that.
 */

/** Banks compound fixed deposit interest four times a year. */
export const COMPOUNDS_PER_YEAR = 4;

/** Section 194A TDS thresholds for FY 2025-26 (₹). */
export const TDS_THRESHOLD = 50000;
export const TDS_THRESHOLD_SENIOR = 100000;

/** Section 194A / 206AA deduction rates (%). */
export const TDS_RATE = 10;
export const TDS_RATE_NO_PAN = 20;

/** Age at which the senior-citizen threshold and Form 15H become available. */
export const SENIOR_AGE = 60;

/** Longest term Indian banks normally accept, in months. */
export const MAX_TERM_MONTHS = 120;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Value of one rupee after `months` months at `annualRate` compounded quarterly.
 * Broken quarters are carried at the same compounded rate, pro-rated in quarters.
 */
export function growthFactor(annualRate, months, compounds = COMPOUNDS_PER_YEAR) {
  if (!isNum(annualRate) || !isNum(months) || months < 0) return 1;
  const periodic = annualRate / 100 / compounds;
  return Math.pow(1 + periodic, (compounds * months) / 12);
}

/**
 * Effective annual yield of a nominal rate compounded q times a year:
 * (1 + r/q)^q - 1.
 */
export function effectiveAnnualYield(annualRate, compounds = COMPOUNDS_PER_YEAR) {
  if (!isNum(annualRate) || annualRate <= 0) return 0;
  return (Math.pow(1 + annualRate / 100 / compounds, compounds) - 1) * 100;
}

/**
 * TDS on one year's interest accrual.
 *
 * @param {number} interest interest credited in the year
 * @param {object} [options]
 * @returns {{ rate: number, tds: number, threshold: number, deducted: boolean }}
 */
export function tdsOnInterest(
  interest,
  { isSenior = false, panFurnished = true, formFiled = false } = {},
) {
  const threshold = isSenior ? TDS_THRESHOLD_SENIOR : TDS_THRESHOLD;
  if (!isNum(interest) || interest <= 0 || formFiled) {
    return { rate: 0, tds: 0, threshold, deducted: false };
  }
  // Section 194A exempts deduction where the aggregate "does not exceed" the limit.
  if (interest <= threshold) return { rate: 0, tds: 0, threshold, deducted: false };
  const rate = panFurnished ? TDS_RATE : TDS_RATE_NO_PAN;
  return { rate, tds: (interest * rate) / 100, threshold, deducted: true };
}

/**
 * Full fixed deposit projection.
 *
 * @param {object} input
 * @param {number} input.principal deposit amount in rupees
 * @param {number} input.annualRate contracted rate, % per year
 * @param {number} [input.years] whole years of the term
 * @param {number} [input.months] extra months of the term
 * @param {boolean} [input.isSenior]
 * @param {boolean} [input.panFurnished]
 * @param {boolean} [input.formFiled] Form 15G/15H filed
 * @param {number} [input.taxSlabPercent] the depositor's marginal slab rate
 * @returns {object} result, or { error } for invalid input
 */
export function computeFdMaturity({
  principal,
  annualRate,
  years = 0,
  months = 0,
  isSenior = false,
  panFurnished = true,
  formFiled = false,
  taxSlabPercent = 0,
} = {}) {
  if (!isNum(principal)) return { error: "Enter the amount you want to deposit." };
  if (principal <= 0) return { error: "The deposit amount must be greater than zero." };
  if (principal > 1e11) return { error: "Enter a deposit below ₹10,000 crore." };
  if (!isNum(annualRate)) return { error: "Enter the interest rate the bank has quoted." };
  if (annualRate <= 0) return { error: "The interest rate must be greater than zero." };
  if (annualRate > 25) return { error: "Enter an interest rate of 25% or less." };
  if (!isNum(years) || !isNum(months) || years < 0 || months < 0) {
    return { error: "Enter a term as a whole number of years and months." };
  }
  const totalMonths = Math.round(years * 12 + months);
  if (totalMonths < 1) return { error: "The term must be at least one month." };
  if (totalMonths > MAX_TERM_MONTHS) {
    return { error: "Banks accept term deposits of up to 10 years." };
  }
  const slab = isNum(taxSlabPercent) && taxSlabPercent >= 0 ? Math.min(taxSlabPercent, 50) : 0;

  const maturityValue = principal * growthFactor(annualRate, totalMonths);
  const totalInterest = maturityValue - principal;

  // Year-wise accrual: the bank credits interest quarterly, so the interest that
  // belongs to a financial year is the growth in balance over that year.
  const schedule = [];
  let totalTds = 0;
  let elapsed = 0;
  let openingBalance = principal;
  let index = 0;
  while (elapsed < totalMonths) {
    const monthsThisYear = Math.min(12, totalMonths - elapsed);
    const closing = principal * growthFactor(annualRate, elapsed + monthsThisYear);
    const interest = closing - openingBalance;
    const { tds, rate, threshold, deducted } = tdsOnInterest(interest, {
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
      interest,
      closing,
      tds,
      tdsRate: rate,
      tdsDeducted: deducted,
      threshold,
    });
    openingBalance = closing;
    elapsed += monthsThisYear;
  }

  const taxOnInterest = (totalInterest * slab) / 100;
  const balanceTax = taxOnInterest - totalTds;
  const postTaxValue = maturityValue - taxOnInterest;
  const termYears = totalMonths / 12;
  const grossYield = (Math.pow(maturityValue / principal, 1 / termYears) - 1) * 100;
  const postTaxYield = (Math.pow(postTaxValue / principal, 1 / termYears) - 1) * 100;

  return {
    principal,
    annualRate,
    totalMonths,
    termYears,
    maturityValue,
    totalInterest,
    payoutAtMaturity: maturityValue - totalTds,
    effectiveYield: effectiveAnnualYield(annualRate),
    grossYield,
    postTaxYield,
    quarterlyRate: annualRate / COMPOUNDS_PER_YEAR,
    totalTds,
    tdsThreshold: isSenior ? TDS_THRESHOLD_SENIOR : TDS_THRESHOLD,
    tdsRate: formFiled ? 0 : panFurnished ? TDS_RATE : TDS_RATE_NO_PAN,
    anyTds: totalTds > 0,
    taxSlabPercent: slab,
    taxOnInterest,
    balanceTaxPayable: balanceTax > 0 ? balanceTax : 0,
    excessTdsRefundable: balanceTax < 0 ? -balanceTax : 0,
    postTaxValue,
    postTaxInterest: totalInterest - taxOnInterest,
    isSenior,
    schedule,
  };
}
