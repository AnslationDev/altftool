/**
 * Break the FD, or borrow against it?
 *
 * Rules encoded here:
 *  - Bank term deposits in India are compounded QUARTERLY, which is the standard
 *    IBA/RBI market practice for cumulative deposits.
 *  - On premature closure the bank pays interest at the card rate applicable to
 *    the period the deposit actually stayed with it, LESS a premature-withdrawal
 *    penalty (commonly 0.5% to 1% a year), and that revised rate applies from the
 *    date of deposit, not just to the shortfall period. RBI leaves the penalty to
 *    each bank's board-approved policy, so it is an input here.
 *  - A loan against a fixed deposit is a secured overdraft. Banks lend a
 *    percentage of the deposit value — typically 90%, sometimes up to 95% — and
 *    price it at the deposit's contracted rate plus a spread, usually 1% to 2%.
 *  - Overdraft interest runs on the daily outstanding balance and is serviced as
 *    it accrues, so it is simple interest on the drawn amount, not an EMI.
 *  - The FD keeps earning its contracted rate while the loan is outstanding.
 *
 * Both options are valued at the ORIGINAL maturity date of the deposit so they
 * are directly comparable. No clock is read here; every period is an argument.
 */

/** Bank term deposits compound quarterly. */
export const COMPOUNDINGS_PER_YEAR = 4;

/** Typical premature-withdrawal penalty on the card rate, % a year. */
export const DEFAULT_PREMATURE_PENALTY_PERCENT = 1;

/** Typical spread over the deposit rate charged on a loan against FD, % a year. */
export const DEFAULT_LOAN_SPREAD_PERCENT = 2;

/** Typical loan-to-value on a deposit-backed overdraft, %. */
export const DEFAULT_LTV_PERCENT = 90;

/** Highest loan-to-value banks generally sanction on a term deposit, %. */
export const MAX_LTV_PERCENT = 95;

/** Longest deposit tenure accepted, in months (10 years). */
export const MAX_TENURE_MONTHS = 120;

/** Upper sanity bound on any rupee amount. */
const MAX_AMOUNT = 1e10;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Value of a quarterly-compounded deposit after a number of months.
 *
 * @param {number} principal rupees deposited
 * @param {number} annualRatePercent nominal rate, % a year
 * @param {number} months months elapsed (fractional quarters allowed)
 * @returns {number} maturity or interim value
 */
export function depositValue(principal, annualRatePercent, months) {
  if (!isNum(principal) || !isNum(annualRatePercent) || !isNum(months)) return 0;
  if (principal <= 0 || months < 0) return 0;
  const quarterlyRate = annualRatePercent / COMPOUNDINGS_PER_YEAR / 100;
  const quarters = months / (12 / COMPOUNDINGS_PER_YEAR);
  return principal * Math.pow(1 + quarterlyRate, quarters);
}

/**
 * Compare closing the deposit early with taking an overdraft against it.
 *
 * @param {object} input
 * @param {number} input.principal deposit amount in rupees
 * @param {number} input.contractedRatePercent rate booked on the deposit
 * @param {number} input.tenureMonths original tenure of the deposit
 * @param {number} input.monthsCompleted months already run
 * @param {number} input.cardRateForRunPeriodPercent card rate for the run period
 * @param {number} input.penaltyPercent premature-withdrawal penalty, % a year
 * @param {number} input.amountNeeded cash you need today
 * @param {number} input.loanSpreadPercent spread over the deposit rate
 * @param {number} input.ltvPercent loan-to-value the bank allows
 * @param {number} [input.loanMonths] months the overdraft stays drawn
 * @param {number} [input.reinvestRatePercent] rate on any surplus after breaking
 * @returns {object} comparison, or { error } when the input is unusable
 */
export function compareFdBreakVsLoan({
  principal,
  contractedRatePercent,
  tenureMonths,
  monthsCompleted,
  cardRateForRunPeriodPercent,
  penaltyPercent = DEFAULT_PREMATURE_PENALTY_PERCENT,
  amountNeeded,
  loanSpreadPercent = DEFAULT_LOAN_SPREAD_PERCENT,
  ltvPercent = DEFAULT_LTV_PERCENT,
  loanMonths,
  reinvestRatePercent,
} = {}) {
  const numbers = [
    principal,
    contractedRatePercent,
    tenureMonths,
    monthsCompleted,
    cardRateForRunPeriodPercent,
    penaltyPercent,
    amountNeeded,
    loanSpreadPercent,
    ltvPercent,
  ];
  if (!numbers.every(isNum)) {
    return { error: "Enter a valid number in every field." };
  }
  if (numbers.some((value) => value < 0)) {
    return { error: "Amounts, rates and periods cannot be negative." };
  }
  if (principal <= 0) return { error: "Enter the fixed deposit amount." };
  if (principal > MAX_AMOUNT) return { error: "Enter a deposit below Rs 1,000 crore." };
  if (amountNeeded <= 0) return { error: "Enter how much cash you need today." };
  if (tenureMonths <= 0 || tenureMonths > MAX_TENURE_MONTHS) {
    return { error: `Deposit tenure should be between 1 and ${MAX_TENURE_MONTHS} months.` };
  }
  if (monthsCompleted >= tenureMonths) {
    return { error: "The deposit has already matured — months completed must be less than the tenure." };
  }
  if (contractedRatePercent <= 0 || cardRateForRunPeriodPercent <= 0) {
    return { error: "Enter the deposit's contracted rate and the current card rate — both must be above 0%." };
  }
  if (contractedRatePercent > 20 || cardRateForRunPeriodPercent > 20 || loanSpreadPercent > 20) {
    return { error: "Rates above 20% a year are not realistic for a bank deposit." };
  }
  if (penaltyPercent > 5) {
    return { error: "A premature-withdrawal penalty above 5% is not realistic." };
  }
  if (ltvPercent <= 0 || ltvPercent > MAX_LTV_PERCENT) {
    return { error: `Loan-to-value should be between 1% and ${MAX_LTV_PERCENT}%.` };
  }

  const remainingMonths = tenureMonths - monthsCompleted;
  // loanMonths === 0 is a deliberate, distinct choice (repay the overdraft
  // immediately) and must not fall through to "left blank" — only a missing/
  // invalid/negative value defaults to running the overdraft to maturity.
  const drawnMonths =
    isNum(loanMonths) && loanMonths >= 0 ? Math.min(loanMonths, remainingMonths) : remainingMonths;
  const reinvestRate = isNum(reinvestRatePercent) ? reinvestRatePercent : contractedRatePercent;

  // ---- Option A: break the deposit now ----
  const prematureRate = Math.max(0, cardRateForRunPeriodPercent - penaltyPercent);
  const breakValue = depositValue(principal, prematureRate, monthsCompleted);
  const breakInterest = breakValue - principal;
  const shortfall = Math.max(0, amountNeeded - breakValue);
  const surplusAfterSpend = Math.max(0, breakValue - amountNeeded);
  const surplusAtMaturity = depositValue(surplusAfterSpend, reinvestRate, remainingMonths);
  const breakNetAtMaturity = surplusAtMaturity - shortfall;

  // ---- Option B: overdraft against the deposit ----
  const fdValueToday = depositValue(principal, contractedRatePercent, monthsCompleted);
  const maxLoan = (fdValueToday * ltvPercent) / 100;
  const loanShortfall = Math.max(0, amountNeeded - maxLoan);
  const loanDrawn = Math.min(amountNeeded, maxLoan);
  const loanRate = contractedRatePercent + loanSpreadPercent;
  // Overdraft interest accrues on the daily outstanding and is serviced as it
  // arises, so it is simple interest over the months the money stays drawn.
  const loanInterest = (loanDrawn * loanRate * drawnMonths) / (12 * 100);
  const fdMaturityValue = depositValue(principal, contractedRatePercent, tenureMonths);
  const loanNetAtMaturity = fdMaturityValue - loanDrawn - loanInterest - loanShortfall;

  const advantage = loanNetAtMaturity - breakNetAtMaturity;
  // Floored at 0: when the current card rate for the run period is high
  // enough relative to the deposit's original contracted rate, breaking
  // early can earn MORE than running the deposit to full (lower-rate)
  // maturity would have. There is no such thing as negative interest given
  // up in that case — nothing was forgone.
  const interestForgone = Math.max(0, fdMaturityValue - principal - breakInterest);

  return {
    principal,
    contractedRatePercent,
    tenureMonths,
    monthsCompleted,
    remainingMonths,
    drawnMonths,
    amountNeeded,

    prematureRate,
    breakValue,
    breakInterest,
    breakShortfall: shortfall,
    surplusAfterSpend,
    surplusAtMaturity,
    breakNetAtMaturity,
    interestForgone,

    fdValueToday,
    ltvPercent,
    maxLoan,
    loanDrawn,
    loanShortfall,
    loanRate,
    loanInterest,
    /** Monthly interest to service on the overdraft. */
    monthlyLoanInterest: drawnMonths > 0 ? loanInterest / drawnMonths : 0,
    fdMaturityValue,
    loanNetAtMaturity,

    /** Positive when borrowing beats breaking the deposit. */
    advantage,
    better: advantage > 0 ? "loan" : advantage < 0 ? "break" : "either",
    canBorrowFullAmount: loanShortfall === 0,
    canCoverFromBreak: shortfall === 0,
  };
}
