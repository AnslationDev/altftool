/**
 * Premature closure of a bank fixed deposit, and the alternative of borrowing
 * against the deposit instead of breaking it.
 *
 * Rules encoded here follow the RBI Master Direction on Interest Rate on
 * Deposits (Directions, 2016) and standard bank practice under it:
 *  - On premature withdrawal, interest is payable at the rate applicable for the
 *    period the deposit ACTUALLY remained with the bank — the card rate for the
 *    run period — and not at the rate contracted for the original tenure.
 *  - Banks may levy a penalty on that rate. The Directions leave the amount to
 *    each bank's board-approved policy; 0.50% to 1.00% is the usual range, and
 *    many banks waive it where the proceeds are redeposited for a longer term.
 *  - No interest is payable on a term deposit that has run for less than seven
 *    days.
 *  - A bank may not charge a penalty on a deposit closed on the death of the
 *    depositor.
 *  - Loans and overdrafts against a term deposit are available up to a high
 *    percentage of the deposit, priced a spread above the deposit rate — commonly
 *    1% to 2% — which makes borrowing the cheaper option when the deposit is
 *    close to maturity.
 */

/** Banks compound term deposit interest quarterly. */
export const COMPOUNDS_PER_YEAR = 4;

/** No interest is payable on a term deposit held for fewer than seven days. */
export const MIN_DAYS_FOR_INTEREST = 7;

/** Usual band for the premature-closure penalty (percentage points). */
export const TYPICAL_PENALTY_MIN = 0.5;
export const TYPICAL_PENALTY_MAX = 1.0;

/** Usual spread over the deposit rate on a loan against the deposit (points). */
export const TYPICAL_LOAN_SPREAD = 1.5;

/** Banks generally lend up to this share of the deposit value. */
export const MAX_LOAN_TO_DEPOSIT = 0.9;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Value of one rupee after `months` months at `annualRate`, compounded quarterly. */
export function growthFactor(annualRate, months) {
  if (!isNum(annualRate) || annualRate <= 0 || !isNum(months) || months <= 0) return 1;
  return Math.pow(1 + annualRate / 100 / COMPOUNDS_PER_YEAR, (COMPOUNDS_PER_YEAR * months) / 12);
}

/**
 * Rate actually paid on a deposit closed early: the card rate for the run
 * period, less the bank's penalty, floored at zero.
 */
export function penalisedRate(cardRateForRunPeriod, penaltyPercent) {
  const card = isNum(cardRateForRunPeriod) ? cardRateForRunPeriod : 0;
  const penalty = isNum(penaltyPercent) && penaltyPercent > 0 ? penaltyPercent : 0;
  return Math.max(0, card - penalty);
}

/**
 * Compare breaking the deposit against borrowing on it.
 *
 * @param {object} input
 * @param {number} input.principal deposit amount
 * @param {number} input.contractedRate rate booked for the original tenure, %
 * @param {number} input.tenureMonths original tenure in months
 * @param {number} input.monthsHeld months the deposit has actually run
 * @param {number} input.cardRateForRunPeriod the bank's card rate for that run
 *   period today, %
 * @param {number} [input.penaltyPercent] premature closure penalty, points
 * @param {number} [input.amountNeeded] cash you need right now
 * @param {number} [input.loanRate] rate on a loan against the deposit, %
 * @param {number} [input.reinvestRate] rate at which surplus cash is redeposited, %
 * @returns {object} result, or { error }
 */
export function computePrematureWithdrawal({
  principal,
  contractedRate,
  tenureMonths,
  monthsHeld,
  cardRateForRunPeriod,
  penaltyPercent = TYPICAL_PENALTY_MAX,
  amountNeeded = 0,
  loanRate,
  reinvestRate,
} = {}) {
  if (!isNum(principal) || principal <= 0) {
    return { error: "Enter the deposit amount, greater than zero." };
  }
  if (principal > 1e11) return { error: "Enter a deposit below ₹10,000 crore." };
  if (!isNum(contractedRate) || contractedRate <= 0 || contractedRate > 25) {
    return { error: "Enter the contracted rate as a percentage between 0 and 25." };
  }
  if (!isNum(tenureMonths) || tenureMonths < 1 || tenureMonths > 120) {
    return { error: "Enter the original tenure in months, between 1 and 120." };
  }
  if (!isNum(monthsHeld) || monthsHeld <= 0) {
    return { error: "Enter how many months the deposit has already run." };
  }
  if (monthsHeld >= tenureMonths) {
    return { error: "The deposit has reached its maturity date, so there is nothing to break." };
  }
  if (!isNum(cardRateForRunPeriod) || cardRateForRunPeriod < 0 || cardRateForRunPeriod > 25) {
    return { error: "Enter the bank's card rate for the completed period, between 0 and 25." };
  }
  if (!isNum(penaltyPercent) || penaltyPercent < 0 || penaltyPercent > 5) {
    return { error: "Enter a penalty between 0 and 5 percentage points." };
  }
  if (!isNum(amountNeeded) || amountNeeded < 0) {
    return { error: "The cash you need cannot be negative." };
  }

  const held = Math.round(monthsHeld);
  const tenure = Math.round(tenureMonths);
  const remainingMonths = tenure - held;
  const spreadRate = isNum(loanRate) && loanRate > 0 ? loanRate : contractedRate + TYPICAL_LOAN_SPREAD;
  const redepositRate = isNum(reinvestRate) && reinvestRate > 0 ? reinvestRate : cardRateForRunPeriod;

  const appliedRate = penalisedRate(cardRateForRunPeriod, penaltyPercent);
  const payout = principal * growthFactor(appliedRate, held);
  const interestOnBreak = payout - principal;

  // What the same period would have paid at the contracted rate, had the bank
  // not repriced it — the true cost of closing early.
  const interestAtContractedRate = principal * growthFactor(contractedRate, held) - principal;
  const interestLost = interestAtContractedRate - interestOnBreak;

  const fullMaturityValue = principal * growthFactor(contractedRate, tenure);
  const fullMaturityInterest = fullMaturityValue - principal;

  const realisedAnnualReturn =
    held > 0 ? (Math.pow(payout / principal, 12 / held) - 1) * 100 : 0;

  // Option A: break the deposit, spend what you need, redeposit the surplus for
  // the remaining months. Option B: borrow what you need, let the deposit run.
  const surplusAfterNeed = payout - amountNeeded;
  const shortfall = surplusAfterNeed < 0 ? -surplusAfterNeed : 0;
  const breakValueAtOriginalMaturity =
    surplusAfterNeed > 0 ? surplusAfterNeed * growthFactor(redepositRate, remainingMonths) : 0;

  // Loan against deposit: interest accrues on the outstanding for the months left.
  const loanInterest = (amountNeeded * spreadRate * remainingMonths) / (100 * 12);
  const loanValueAtOriginalMaturity = fullMaturityValue - amountNeeded - loanInterest;

  const loanExceedsLimit = amountNeeded > principal * MAX_LOAN_TO_DEPOSIT;
  const comparisonPossible = amountNeeded > 0 && !shortfall;
  const advantageOfLoan = loanValueAtOriginalMaturity - breakValueAtOriginalMaturity;

  return {
    principal,
    contractedRate,
    tenureMonths: tenure,
    monthsHeld: held,
    remainingMonths,
    cardRateForRunPeriod,
    penaltyPercent,
    appliedRate,
    payout,
    interestOnBreak,
    interestAtContractedRate,
    interestLost,
    fullMaturityValue,
    fullMaturityInterest,
    realisedAnnualReturn,
    amountNeeded,
    shortfall,
    surplusAfterNeed: surplusAfterNeed > 0 ? surplusAfterNeed : 0,
    redepositRate,
    breakValueAtOriginalMaturity,
    loanRate: spreadRate,
    loanInterest,
    loanValueAtOriginalMaturity,
    loanExceedsLimit,
    maxLoanAvailable: principal * MAX_LOAN_TO_DEPOSIT,
    comparisonPossible,
    advantageOfLoan,
    betterOption: !comparisonPossible ? null : advantageOfLoan > 0 ? "loan" : "break",
    noInterestWindow: MIN_DAYS_FOR_INTEREST,
  };
}
