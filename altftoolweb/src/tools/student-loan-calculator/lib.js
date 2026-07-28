/**
 * Student Loan Calculator.
 *
 * Formulas:
 *
 * 1. Interest during study / grace (unsubsidised loans).
 *    Federal student loans accrue simple daily interest on the outstanding
 *    principal and that accrued interest is capitalised — added to principal —
 *    when repayment begins. Over g months at annual rate r:
 *      accrued  = P x r x (g / 12)
 *      balance at repayment start = P + accrued
 *    On a subsidised loan the government pays that interest, so nothing
 *    capitalises and the balance at repayment start is still P.
 *
 * 2. Level monthly payment (standard amortisation):
 *      i = r / 12,  n = term in months
 *      M = B x i / (1 - (1 + i)^-n)      and, when i = 0,  M = B / n
 *
 * 3. Month-by-month amortisation with any extra payment:
 *      interest_m  = balance x i
 *      principal_m = (M + extra) - interest_m
 *      balance    -= principal_m
 *    The final instalment is trimmed so the balance lands exactly on zero.
 *
 * The US Department of Education's Standard Repayment Plan runs 10 years
 * (120 months) for Direct Loans, which is the default term used here.
 */

/** Standard Repayment Plan length for US federal Direct Loans, in years. */
export const STANDARD_TERM_YEARS = 10;

export const MONTHS_PER_YEAR = 12;

/** Input ceilings that keep the projection meaningful. */
export const MAX_TERM_YEARS = 30;
export const MAX_RATE_PERCENT = 50;
export const MAX_GRACE_MONTHS = 120;
/** Safety valve on the amortisation loop (30 years plus a margin). */
export const MAX_MONTHS = 600;

/**
 * Level monthly payment for an amortising loan.
 *
 * @param {number} balance      Amount owed when repayment starts.
 * @param {number} monthlyRate  Periodic rate as a decimal (annual / 12).
 * @param {number} months       Number of instalments.
 * @returns {number} payment, or NaN on unusable input.
 */
export function monthlyPayment(balance, monthlyRate, months) {
  const b = Number(balance);
  const i = Number(monthlyRate);
  const n = Math.trunc(Number(months));
  if (!Number.isFinite(b) || !Number.isFinite(i) || !Number.isFinite(n)) return Number.NaN;
  if (b <= 0 || n <= 0 || i < 0) return Number.NaN;
  if (i === 0) return b / n;
  const factor = Math.pow(1 + i, -n);
  const denominator = 1 - factor;
  if (denominator <= 0) return Number.NaN;
  return (b * i) / denominator;
}

/**
 * Amortise a balance at a fixed monthly payment.
 * @returns {{months: number, totalInterest: number, totalPaid: number, rows: Array}|null}
 */
function amortise(balance, monthlyRate, payment) {
  let remaining = balance;
  let totalInterest = 0;
  let totalPaid = 0;
  let months = 0;
  const rows = [];
  let yearInterest = 0;
  let yearPrincipal = 0;

  while (remaining > 0.005 && months < MAX_MONTHS) {
    const interest = remaining * monthlyRate;
    let principalPart = payment - interest;
    if (principalPart <= 0) return null; // payment never clears the interest
    if (principalPart > remaining) principalPart = remaining;
    remaining -= principalPart;
    totalInterest += interest;
    totalPaid += interest + principalPart;
    yearInterest += interest;
    yearPrincipal += principalPart;
    months += 1;
    if (months % MONTHS_PER_YEAR === 0 || remaining <= 0.005) {
      rows.push({
        year: Math.ceil(months / MONTHS_PER_YEAR),
        interest: yearInterest,
        principal: yearPrincipal,
        balance: remaining,
      });
      yearInterest = 0;
      yearPrincipal = 0;
    }
  }

  if (remaining > 0.005) return null;
  return { months, totalInterest, totalPaid, rows };
}

/**
 * Project a student loan repayment.
 *
 * @param {object} input
 * @param {number} input.principal          Amount borrowed.
 * @param {number} input.annualRatePercent  Fixed annual interest rate, percent.
 * @param {number} [input.termYears]        Repayment term in years.
 * @param {number} [input.graceMonths]      Months of study/grace before repayment.
 * @param {boolean} [input.subsidised]      Government pays interest during grace.
 * @param {number} [input.extraMonthly]     Voluntary extra payment each month.
 * @returns {object} projection or { error }.
 */
export function computeStudentLoan({
  principal,
  annualRatePercent,
  termYears = STANDARD_TERM_YEARS,
  graceMonths = 0,
  subsidised = false,
  extraMonthly = 0,
}) {
  const p = Number(principal);
  if (!Number.isFinite(p) || p <= 0) {
    return { error: "Enter the amount borrowed — it must be greater than zero." };
  }

  const ratePercent = Number(annualRatePercent);
  if (!Number.isFinite(ratePercent) || ratePercent < 0) {
    return { error: "Enter an interest rate of zero or more." };
  }
  if (ratePercent > MAX_RATE_PERCENT) {
    return { error: `An interest rate above ${MAX_RATE_PERCENT}% is outside the range this tool models.` };
  }

  const years = Number(termYears);
  if (!Number.isFinite(years) || years <= 0) {
    return { error: "Enter a repayment term longer than zero years." };
  }
  if (years > MAX_TERM_YEARS) {
    return { error: `Repayment terms longer than ${MAX_TERM_YEARS} years are not modelled here.` };
  }

  const grace = Number(graceMonths);
  if (!Number.isFinite(grace) || grace < 0) {
    return { error: "Months before repayment starts cannot be negative." };
  }
  if (grace > MAX_GRACE_MONTHS) {
    return { error: `Enter ${MAX_GRACE_MONTHS} months or fewer before repayment starts.` };
  }

  const extra = Number(extraMonthly);
  if (!Number.isFinite(extra) || extra < 0) {
    return { error: "Extra monthly payment cannot be negative." };
  }

  const annualRate = ratePercent / 100;
  const monthlyRate = annualRate / MONTHS_PER_YEAR;
  const months = Math.round(years * MONTHS_PER_YEAR);

  // Simple interest accrued during study/grace, capitalised once at repayment.
  const capitalisedInterest = subsidised ? 0 : p * annualRate * (grace / MONTHS_PER_YEAR);
  const startingBalance = p + capitalisedInterest;

  const payment = monthlyPayment(startingBalance, monthlyRate, months);
  if (!Number.isFinite(payment) || payment <= 0) {
    return { error: "Those numbers do not produce a valid repayment — check the amount and term." };
  }

  const base = amortise(startingBalance, monthlyRate, payment);
  if (!base) {
    return { error: "The scheduled payment never clears the interest — lower the rate or shorten the term." };
  }

  let accelerated = null;
  if (extra > 0) {
    accelerated = amortise(startingBalance, monthlyRate, payment + extra);
  }

  return {
    principal: p,
    annualRate,
    monthlyRate,
    termMonths: months,
    graceMonths: grace,
    subsidised,
    capitalisedInterest,
    startingBalance,
    monthlyPayment: payment,
    totalInterest: base.totalInterest,
    totalPaid: base.totalPaid,
    totalCostOfBorrowing: capitalisedInterest + base.totalInterest,
    schedule: base.rows,
    payoffMonths: base.months,
    payoffYears: base.months / MONTHS_PER_YEAR,
    extraMonthly: extra,
    withExtra: accelerated
      ? {
          payment: payment + extra,
          months: accelerated.months,
          years: accelerated.months / MONTHS_PER_YEAR,
          totalInterest: accelerated.totalInterest,
          totalPaid: accelerated.totalPaid,
          interestSaved: base.totalInterest - accelerated.totalInterest,
          monthsSaved: base.months - accelerated.months,
        }
      : null,
  };
}
