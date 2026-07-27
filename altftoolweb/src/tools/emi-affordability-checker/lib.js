/**
 * EMI affordability: FOIR, surplus and a rate-rise stress test.
 *
 * EMI on a reducing-balance loan:
 *
 *   EMI = P x r x (1+r)^n / ((1+r)^n - 1)      r = annual rate / 12 / 100
 *
 * with the r = 0 case degenerating cleanly to P / n. The same formula inverted
 * gives the loan a given EMI can carry:
 *
 *   P = EMI x ((1+r)^n - 1) / (r x (1+r)^n)
 *
 * FOIR (Fixed Obligation to Income Ratio), also written as the debt-burden
 * ratio, is what a lender actually underwrites against:
 *
 *   FOIR = (existing EMIs + proposed EMI) / net monthly income x 100
 *
 * There is no statutory FOIR limit for retail loans in India; it is a lender
 * underwriting norm. In practice banks and NBFCs work to a ceiling of roughly
 * 50% of net income, tightening towards 40% at lower incomes and loosening
 * towards 55-60% for high earners with strong profiles. The bands below reflect
 * that convention and are adjustable, not a rule of law.
 *
 * A floating-rate loan is repriced against an external benchmark under the
 * RBI's External Benchmark Lending Rate framework, so a stress test at a higher
 * rate is included: banks usually extend the tenure rather than raise the EMI,
 * but tenure cannot extend past the borrower's retirement, at which point the
 * EMI does rise.
 *
 * All functions are pure; nothing here reads the clock.
 */

/** Common lender FOIR ceiling for salaried retail borrowers. */
export const TYPICAL_FOIR_CEILING_PCT = 50;

/** Conservative FOIR a borrower can comfortably live inside. */
export const COMFORTABLE_FOIR_PCT = 35;

/** Percentage points the stress test adds to a floating rate. */
export const STRESS_RATE_STEP_PCT = 2;

/** Verdict bands, expressed as the upper bound of each band. */
export const FOIR_BANDS = [
  { id: "comfortable", maxPct: 35, label: "Comfortable", note: "Well inside what lenders and household budgets tolerate." },
  { id: "workable", maxPct: 40, label: "Workable", note: "Approvable, but leaves less room if rates or expenses rise." },
  { id: "stretched", maxPct: 50, label: "Stretched", note: "At the usual lender ceiling. Expect scrutiny of your other outgoings." },
  { id: "over-limit", maxPct: Infinity, label: "Over the usual limit", note: "Above the FOIR most lenders will sanction without a co-applicant." },
];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

/** Reducing-balance EMI. Returns null for input that has no valid EMI. */
export function emiFor({ principal, annualRatePct, months }) {
  if (!isNum(principal) || !isNum(annualRatePct) || !isNum(months)) return null;
  if (principal <= 0 || months <= 0) return null;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return round2(principal / months);
  const growth = (1 + r) ** months;
  if (!Number.isFinite(growth) || growth <= 1) return null;
  const emi = (principal * r * growth) / (growth - 1);
  return Number.isFinite(emi) ? round2(emi) : null;
}

/** Inverse: the loan a given EMI can service. Returns null if undefined. */
export function loanFor({ emi, annualRatePct, months }) {
  if (!isNum(emi) || !isNum(annualRatePct) || !isNum(months)) return null;
  if (emi <= 0 || months <= 0) return null;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return round2(emi * months);
  const growth = (1 + r) ** months;
  if (!Number.isFinite(growth) || growth <= 1) return null;
  const principal = (emi * (growth - 1)) / (r * growth);
  return Number.isFinite(principal) ? round2(principal) : null;
}

function bandFor(foirPct) {
  return FOIR_BANDS.find((band) => foirPct <= band.maxPct) ?? FOIR_BANDS[FOIR_BANDS.length - 1];
}

/**
 * Assess whether a proposed loan fits.
 *
 * @param {object} args
 * @param {number} args.netMonthlyIncome  take-home pay plus other reliable income
 * @param {number} args.existingEmis      total of every EMI already running
 * @param {number} args.loanAmount        principal being applied for
 * @param {number} args.annualRatePct     quoted interest rate
 * @param {number} args.tenureYears       tenure in years
 * @param {number} args.monthlyExpenses   essential living costs, excluding EMIs
 * @param {number} args.foirCeilingPct    lender ceiling to test against
 * @returns {object} the assessment, or { error }
 */
export function checkAffordability({
  netMonthlyIncome,
  existingEmis = 0,
  loanAmount,
  annualRatePct,
  tenureYears,
  monthlyExpenses = 0,
  foirCeilingPct = TYPICAL_FOIR_CEILING_PCT,
}) {
  const numeric = {
    netMonthlyIncome,
    existingEmis,
    loanAmount,
    annualRatePct,
    tenureYears,
    monthlyExpenses,
    foirCeilingPct,
  };
  for (const [key, value] of Object.entries(numeric)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${key}.` };
    if (value < 0) return { error: "Incomes, EMIs and rates cannot be negative." };
  }

  if (netMonthlyIncome <= 0) return { error: "Enter your net monthly income." };
  if (loanAmount <= 0) return { error: "Enter a loan amount greater than zero." };
  if (tenureYears <= 0 || tenureYears > 40) {
    return { error: "Tenure should be between 1 and 40 years." };
  }
  if (annualRatePct > 60) return { error: "Interest rate should be 60% a year or less." };
  if (foirCeilingPct <= 0 || foirCeilingPct > 100) {
    return { error: "The FOIR ceiling must be between 1% and 100%." };
  }
  if (existingEmis >= netMonthlyIncome) {
    return { error: "Your existing EMIs already equal or exceed your net income." };
  }

  const months = Math.round(tenureYears * 12);
  const proposedEmi = emiFor({ principal: loanAmount, annualRatePct, months });
  if (proposedEmi === null) return { error: "That combination of loan, rate and tenure has no valid EMI." };

  const totalObligations = round2(existingEmis + proposedEmi);
  const foirPct = round2((totalObligations / netMonthlyIncome) * 100);
  const band = bandFor(foirPct);
  const withinCeiling = foirPct <= foirCeilingPct;

  const surplus = round2(netMonthlyIncome - totalObligations - monthlyExpenses);
  const surplusPct = round2((surplus / netMonthlyIncome) * 100);

  // Headroom at the chosen ceiling.
  const maxEmiAtCeiling = round2((netMonthlyIncome * foirCeilingPct) / 100 - existingEmis);
  const emiHeadroom = round2(maxEmiAtCeiling - proposedEmi);
  const maxLoanAtCeiling =
    maxEmiAtCeiling > 0 ? loanFor({ emi: maxEmiAtCeiling, annualRatePct, months }) : 0;

  // Budget-side ceiling: the EMI that leaves the surplus at exactly zero.
  const maxEmiFromBudget = round2(netMonthlyIncome - monthlyExpenses - existingEmis);

  // Stress test: same principal and tenure at a higher rate.
  const stressRatePct = round2(annualRatePct + STRESS_RATE_STEP_PCT);
  const stressEmi = emiFor({ principal: loanAmount, annualRatePct: stressRatePct, months });
  const stressFoirPct =
    stressEmi === null ? null : round2(((existingEmis + stressEmi) / netMonthlyIncome) * 100);

  const totalRepayment = round2(proposedEmi * months);
  const totalInterest = round2(totalRepayment - loanAmount);

  return {
    months,
    proposedEmi,
    existingEmis: round2(existingEmis),
    totalObligations,
    netMonthlyIncome: round2(netMonthlyIncome),
    monthlyExpenses: round2(monthlyExpenses),
    foirPct,
    foirCeilingPct,
    withinCeiling,
    band,
    surplus,
    surplusPct,
    maxEmiAtCeiling,
    emiHeadroom,
    maxLoanAtCeiling,
    maxEmiFromBudget,
    budgetIsTighterThanLender: maxEmiFromBudget < maxEmiAtCeiling,
    stressRatePct,
    stressEmi,
    stressEmiIncrease: stressEmi === null ? null : round2(stressEmi - proposedEmi),
    stressFoirPct,
    stressWithinCeiling: stressFoirPct === null ? null : stressFoirPct <= foirCeilingPct,
    totalRepayment,
    totalInterest,
    interestSharePct: totalRepayment > 0 ? round2((totalInterest / totalRepayment) * 100) : 0,
  };
}
