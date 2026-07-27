/**
 * Home loan eligibility.
 *
 * Two independent ceilings decide how much a lender will sanction:
 *
 *  1. Repayment capacity — the FOIR (Fixed Obligation to Income Ratio) test.
 *     Permitted EMI = net monthly income x FOIR% - existing EMIs. That EMI is then
 *     capitalised back into a principal with the standard reducing-balance present
 *     value formula  P = EMI x (1 - (1 + r)^-n) / r.
 *
 *  2. Security cover — the RBI loan-to-value (LTV) ceiling for housing loans.
 *
 * The sanction is the lower of the two.
 */

/**
 * Indicative FOIR grid used by Indian retail lenders. The permitted share of
 * income rises with income because what a lender really underwrites is the
 * residual income left after the EMI. Every bank publishes its own grid, so this
 * is a starting point the user can override, not a statutory rule.
 * `upTo` is the upper bound of NET (take-home) monthly income in rupees.
 */
export const FOIR_BANDS = [
  { upTo: 30000, foirPercent: 50 },
  { upTo: 60000, foirPercent: 55 },
  { upTo: 120000, foirPercent: 60 },
  { upTo: Infinity, foirPercent: 65 },
];

/**
 * RBI loan-to-value ceilings for individual housing loans (RBI Master Circular on
 * Housing Finance / the LTV-linked risk-weight norms): up to 90% of property value
 * for loans up to Rs 30 lakh, 80% above Rs 30 lakh and up to Rs 75 lakh, and 75%
 * above Rs 75 lakh. The slab is chosen by the LOAN amount, not the property value.
 */
export const LTV_SLABS = [
  { maxLoan: 3000000, ltvPercent: 90 },
  { maxLoan: 7500000, ltvPercent: 80 },
  { maxLoan: Infinity, ltvPercent: 75 },
];

/**
 * Lenders want the loan to close by superannuation. 60 is the usual cap for
 * salaried borrowers and 65 for self-employed borrowers who have no fixed
 * retirement date.
 */
export const MAX_AGE_AT_MATURITY = { salaried: 60, selfEmployed: 65 };

/** Longest tenure offered by mainstream Indian home loan products. */
export const MAX_TENURE_YEARS = 30;

/** Highest interest rate this tool will accept, to catch typos like 95 for 9.5. */
export const MAX_ANNUAL_RATE = 30;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** FOIR percentage a lender is likely to allow at this income level. */
export function suggestedFoirPercent(netMonthlyIncome) {
  if (!isNum(netMonthlyIncome) || netMonthlyIncome <= 0) return FOIR_BANDS[0].foirPercent;
  const band = FOIR_BANDS.find((entry) => netMonthlyIncome <= entry.upTo);
  return band ? band.foirPercent : FOIR_BANDS[FOIR_BANDS.length - 1].foirPercent;
}

/**
 * Largest loan the RBI LTV ceilings permit against a property of this value.
 * A slab only applies when the loan it produces actually falls inside that slab,
 * so the answer is the best feasible candidate across the three slabs.
 */
export function maxLoanByLtv(propertyValue) {
  if (!isNum(propertyValue) || propertyValue <= 0) {
    return { loan: 0, effectiveLtvPercent: 0 };
  }
  let bestLoan = 0;
  let slabFloor = 0;
  for (const slab of LTV_SLABS) {
    const raw = (propertyValue * slab.ltvPercent) / 100;
    if (raw > slabFloor) {
      const loan = Math.min(raw, slab.maxLoan);
      if (loan > bestLoan) bestLoan = loan;
    }
    slabFloor = slab.maxLoan;
  }
  return {
    loan: bestLoan,
    effectiveLtvPercent: (bestLoan / propertyValue) * 100,
  };
}

/** Present value of a level monthly payment stream (reducing balance). */
export function loanFromEmi({ emi, annualRate, months }) {
  if (!isNum(emi) || !isNum(annualRate) || !isNum(months)) return 0;
  if (emi <= 0 || months <= 0) return 0;
  const r = annualRate / 12 / 100;
  if (r <= 0) return emi * months;
  return (emi * (1 - Math.pow(1 + r, -months))) / r;
}

/** Standard reducing-balance EMI for a principal. Handles the 0% case. */
export function emiFromLoan({ principal, annualRate, months }) {
  if (!isNum(principal) || !isNum(annualRate) || !isNum(months)) return 0;
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 12 / 100;
  if (r <= 0) return principal / months;
  const growth = Math.pow(1 + r, months);
  return (principal * r * growth) / (growth - 1);
}

/**
 * Full eligibility assessment.
 * Returns { error } for input that cannot produce a meaningful number.
 */
export function computeHomeLoanEligibility({
  netMonthlyIncome,
  otherMonthlyIncome = 0,
  existingEmi = 0,
  foirPercent,
  annualRate,
  tenureYears,
  age,
  employment = "salaried",
  propertyValue,
}) {
  const fields = [
    netMonthlyIncome,
    otherMonthlyIncome,
    existingEmi,
    foirPercent,
    annualRate,
    tenureYears,
    age,
    propertyValue,
  ];
  if (fields.some((value) => !isNum(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (netMonthlyIncome <= 0) {
    return { error: "Net monthly income must be greater than zero." };
  }
  if (otherMonthlyIncome < 0 || existingEmi < 0 || propertyValue < 0) {
    return { error: "Income, EMI and property amounts cannot be negative." };
  }
  if (foirPercent <= 0 || foirPercent > 100) {
    return { error: "FOIR must be between 1% and 100% of income." };
  }
  if (annualRate < 0 || annualRate > MAX_ANNUAL_RATE) {
    return { error: `Interest rate should be between 0% and ${MAX_ANNUAL_RATE}% per year.` };
  }
  if (tenureYears <= 0 || tenureYears > MAX_TENURE_YEARS) {
    return { error: `Tenure should be between 1 and ${MAX_TENURE_YEARS} years.` };
  }
  if (age < 18 || age > 75) {
    return { error: "Applicant age should be between 18 and 75 years." };
  }
  if (propertyValue <= 0) {
    return { error: "Enter the agreement value of the property." };
  }

  const maturityAge =
    employment === "selfEmployed" ? MAX_AGE_AT_MATURITY.selfEmployed : MAX_AGE_AT_MATURITY.salaried;
  const yearsToMaturity = maturityAge - age;
  if (yearsToMaturity < 1) {
    return {
      error: `Lenders normally want the loan repaid by age ${maturityAge}, which leaves no usable tenure at this age.`,
    };
  }

  const allowedTenureYears = Math.min(tenureYears, MAX_TENURE_YEARS, yearsToMaturity);
  const tenureCapped = allowedTenureYears < tenureYears;
  const months = Math.round(allowedTenureYears * 12);

  const totalIncome = netMonthlyIncome + otherMonthlyIncome;
  const foirAllowance = (totalIncome * foirPercent) / 100;
  const emiCapacity = foirAllowance - existingEmi;

  if (emiCapacity <= 0) {
    return {
      error: `Existing EMIs of the amount entered already consume the whole ${foirPercent}% FOIR allowance, so no further loan is possible at this income.`,
    };
  }

  const eligibleByIncome = loanFromEmi({ emi: emiCapacity, annualRate, months });
  const ltv = maxLoanByLtv(propertyValue);
  const eligibleLoan = Math.min(eligibleByIncome, ltv.loan);
  const limitedBy = eligibleByIncome <= ltv.loan ? "income" : "property";

  const emi = emiFromLoan({ principal: eligibleLoan, annualRate, months });
  const totalRepayment = emi * months;
  const totalInterest = Math.max(0, totalRepayment - eligibleLoan);
  const downPayment = Math.max(0, propertyValue - eligibleLoan);

  return {
    eligibleLoan,
    eligibleByIncome,
    eligibleByLtv: ltv.loan,
    effectiveLtvPercent: propertyValue > 0 ? (eligibleLoan / propertyValue) * 100 : 0,
    ltvCeilingPercent: ltv.effectiveLtvPercent,
    limitedBy,
    emi,
    emiCapacity,
    foirAllowance,
    foirUsedPercent: totalIncome > 0 ? ((existingEmi + emi) / totalIncome) * 100 : 0,
    totalIncome,
    months,
    allowedTenureYears,
    tenureCapped,
    maturityAge,
    totalRepayment,
    totalInterest,
    downPayment,
    downPaymentPercent: propertyValue > 0 ? (downPayment / propertyValue) * 100 : 0,
  };
}
