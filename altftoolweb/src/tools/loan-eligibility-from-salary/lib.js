/**
 * Loan eligibility from take-home salary.
 *
 * Two independent ceilings are applied and the lower one governs.
 *
 * 1. FOIR (fixed obligation to income ratio)
 *    FOIR = (existing EMIs + proposed EMI) / net monthly income. This is a
 *    lender underwriting norm set by each bank's credit policy, NOT a statutory
 *    rule. The bands below are the ones commonly published by Indian retail
 *    lenders: the higher the take-home pay, the larger the share of it a lender
 *    is willing to see committed, because the residual income left over is what
 *    really matters. Override the percentage if your lender uses a different one.
 *
 *    Maximum EMI = net monthly income x FOIR - existing EMIs
 *    Maximum loan = the present value of that EMI:
 *      L = EMI x [(1 + i)^n - 1] / [i x (1 + i)^n]
 *    where i is the monthly rate and n the number of instalments.
 *
 * 2. Loan-to-value ceiling on housing loans
 *    The RBI Master Circular on Housing Finance caps LTV by loan size:
 *      up to Rs 30 lakh          -> 90% of the property value
 *      above Rs 30 lakh to 75 lakh -> 80%
 *      above Rs 75 lakh          -> 75%
 *    The property value for this purpose excludes stamp duty, registration and
 *    other documentation charges, which the borrower must fund separately.
 *
 * Nothing here reads the clock.
 */

/**
 * Indicative FOIR bands used by Indian retail lenders, keyed on net monthly
 * income. Lender credit policy, not regulation — always confirm with the bank.
 */
export const FOIR_BANDS = [
  { upTo: 30000, foirPercent: 40, label: "Up to Rs 30,000 a month" },
  { upTo: 50000, foirPercent: 45, label: "Rs 30,001 to Rs 50,000" },
  { upTo: 100000, foirPercent: 50, label: "Rs 50,001 to Rs 1,00,000" },
  { upTo: Infinity, foirPercent: 55, label: "Above Rs 1,00,000" },
];

/**
 * RBI loan-to-value ceilings for housing loans, by loan size.
 * Source: RBI Master Circular on Housing Finance (LTV / risk weight norms).
 */
export const HOUSING_LTV_BANDS = [
  { minLoan: 0, maxLoan: 3000000, ltvPercent: 90 },
  { minLoan: 3000000, maxLoan: 7500000, ltvPercent: 80 },
  { minLoan: 7500000, maxLoan: Infinity, ltvPercent: 75 },
];

/** Longest tenure this calculator accepts, in months (30 years). */
export const MAX_TENURE_MONTHS = 360;

/** Upper sanity bound on any rupee amount. */
const MAX_AMOUNT = 1e10;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * FOIR percentage a lender would typically allow at this income level.
 * @param {number} netMonthlyIncome take-home pay per month
 * @returns {number} FOIR as a percentage
 */
export function foirForIncome(netMonthlyIncome) {
  if (!isNum(netMonthlyIncome) || netMonthlyIncome <= 0) return FOIR_BANDS[0].foirPercent;
  const band = FOIR_BANDS.find((entry) => netMonthlyIncome <= entry.upTo);
  return band ? band.foirPercent : FOIR_BANDS[FOIR_BANDS.length - 1].foirPercent;
}

/**
 * Present value of a level monthly instalment — the loan an EMI can service.
 *
 * @param {number} emi monthly instalment in rupees
 * @param {number} annualRatePercent interest rate, % a year
 * @param {number} months number of instalments
 * @returns {number} loan principal
 */
export function loanFromEmi(emi, annualRatePercent, months) {
  if (!isNum(emi) || !isNum(annualRatePercent) || !isNum(months)) return 0;
  if (emi <= 0 || months <= 0) return 0;
  const i = annualRatePercent / 12 / 100;
  if (i <= 0) return emi * months;
  const growth = Math.pow(1 + i, months);
  return (emi * (growth - 1)) / (i * growth);
}

/**
 * Level EMI for a loan — the inverse of loanFromEmi, used for the summary.
 */
export function emiFromLoan(principal, annualRatePercent, months) {
  if (!isNum(principal) || !isNum(annualRatePercent) || !isNum(months)) return 0;
  if (principal <= 0 || months <= 0) return 0;
  const i = annualRatePercent / 12 / 100;
  if (i <= 0) return principal / months;
  const growth = Math.pow(1 + i, months);
  return (principal * i * growth) / (growth - 1);
}

/**
 * Largest housing loan the RBI LTV ladder permits for a given property value.
 *
 * A loan L is permissible when L <= ltv(L) x propertyValue, and ltv(L) itself
 * depends on L, so each band is tested and the largest workable amount wins.
 *
 * @param {number} propertyValue value of the property, excluding stamp duty
 * @returns {{ maxLoan: number, ltvPercent: number }}
 */
export function maxHousingLoanByLtv(propertyValue) {
  if (!isNum(propertyValue) || propertyValue <= 0) return { maxLoan: 0, ltvPercent: 0 };
  let best = { maxLoan: 0, ltvPercent: 0 };
  for (const band of HOUSING_LTV_BANDS) {
    const capByLtv = (propertyValue * band.ltvPercent) / 100;
    const candidate = Math.min(band.maxLoan, capByLtv);
    const insideBand = candidate > band.minLoan && candidate <= capByLtv;
    if (insideBand && candidate > best.maxLoan) {
      best = { maxLoan: candidate, ltvPercent: band.ltvPercent };
    }
  }
  return best;
}

/**
 * Full eligibility calculation.
 *
 * @param {object} input
 * @param {number} input.netMonthlyIncome take-home pay per month
 * @param {number} [input.otherMonthlyIncome] rent, pension or other steady income
 * @param {number} [input.existingEmi] EMIs already running
 * @param {number} input.annualRatePercent interest rate on the new loan
 * @param {number} input.tenureMonths tenure of the new loan
 * @param {number} [input.foirPercent] override the banded FOIR
 * @param {"home"|"other"} [input.loanType]
 * @param {number} [input.propertyValue] required for the LTV ceiling on a home loan
 * @returns {object} eligibility, or { error } when the input is unusable
 */
export function computeLoanEligibility({
  netMonthlyIncome,
  otherMonthlyIncome = 0,
  existingEmi = 0,
  annualRatePercent,
  tenureMonths,
  foirPercent,
  loanType = "home",
  propertyValue = 0,
} = {}) {
  const numbers = [
    netMonthlyIncome,
    otherMonthlyIncome,
    existingEmi,
    annualRatePercent,
    tenureMonths,
    propertyValue,
  ];
  if (!numbers.every(isNum)) {
    return { error: "Enter a valid number in every field." };
  }
  if (numbers.some((value) => value < 0)) {
    return { error: "Income, EMIs, rates and periods cannot be negative." };
  }
  if (netMonthlyIncome <= 0) {
    return { error: "Enter your net take-home salary per month." };
  }
  if (netMonthlyIncome > MAX_AMOUNT || propertyValue > MAX_AMOUNT) {
    return { error: "Enter amounts below Rs 1,000 crore." };
  }
  if (annualRatePercent < 0 || annualRatePercent > 40) {
    return { error: "Interest rate should be between 0% and 40% a year." };
  }
  if (tenureMonths <= 0 || tenureMonths > MAX_TENURE_MONTHS) {
    return { error: `Tenure should be between 1 and ${MAX_TENURE_MONTHS} months.` };
  }
  if (loanType !== "home" && loanType !== "other") {
    return { error: "Choose a home loan or another kind of loan." };
  }

  const totalIncome = netMonthlyIncome + otherMonthlyIncome;
  const bandedFoir = foirForIncome(totalIncome);
  const usedFoir = isNum(foirPercent) && foirPercent > 0 ? foirPercent : bandedFoir;
  if (usedFoir > 100) {
    return { error: "FOIR cannot be more than 100% of your income." };
  }

  const emiCeiling = (totalIncome * usedFoir) / 100;
  const maxEmi = emiCeiling - existingEmi;

  if (maxEmi <= 0) {
    return {
      error:
        "Your existing EMIs already use up the whole obligation limit, so no further loan is available at this FOIR.",
    };
  }

  const loanByFoir = loanFromEmi(maxEmi, annualRatePercent, tenureMonths);
  const ltv = loanType === "home" && propertyValue > 0
    ? maxHousingLoanByLtv(propertyValue)
    : { maxLoan: Infinity, ltvPercent: 0 };

  const eligibleLoan = Math.min(loanByFoir, ltv.maxLoan);
  const bindingConstraint = loanByFoir <= ltv.maxLoan ? "foir" : "ltv";
  const actualEmi = emiFromLoan(eligibleLoan, annualRatePercent, tenureMonths);
  const totalRepayment = actualEmi * tenureMonths;

  return {
    totalIncome,
    netMonthlyIncome,
    otherMonthlyIncome,
    existingEmi,
    annualRatePercent,
    tenureMonths,
    loanType,
    propertyValue,

    bandedFoirPercent: bandedFoir,
    foirPercent: usedFoir,
    emiCeiling,
    maxEmi,
    existingFoirPercent: totalIncome > 0 ? (existingEmi / totalIncome) * 100 : 0,

    loanByFoir,
    ltvPercent: ltv.ltvPercent,
    loanByLtv: Number.isFinite(ltv.maxLoan) ? ltv.maxLoan : null,
    eligibleLoan,
    bindingConstraint,

    emiAtEligibleLoan: actualEmi,
    totalRepayment,
    totalInterest: totalRepayment - eligibleLoan,
    downPayment:
      loanType === "home" && propertyValue > 0 ? Math.max(0, propertyValue - eligibleLoan) : 0,
    /** Income left each month after the new EMI and existing obligations. */
    residualIncome: totalIncome - existingEmi - actualEmi,
  };
}
