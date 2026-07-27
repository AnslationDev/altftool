/**
 * Mahila Samman Savings Certificate (MSSC) maths.
 *
 * Rule source: the Mahila Samman Savings Certificate, 2023 notification issued by the
 * Ministry of Finance (Department of Economic Affairs) on 31 March 2023 under the
 * Government Savings Promotion Act, 1873, together with the scheme's operating rules.
 *
 * Unlike SCSS, MSSC does not pay interest out. Interest is compounded quarterly and the
 * whole amount is paid on maturity, so the maturity value is P x (1 + r/400)^(4t).
 */

/** Fixed rate for the scheme, set in the notification and not revised quarterly. */
export const MSSC_RATE = 7.5;

/** Interest is compounded quarterly. */
export const COMPOUNDS_PER_YEAR = 4;

/** The certificate runs for two years from the date of deposit. */
export const MSSC_TENURE_YEARS = 2;

/** Smallest deposit accepted. */
export const MSSC_MIN_DEPOSIT = 1000;

/** Deposits must be in multiples of ₹100. */
export const MSSC_DEPOSIT_MULTIPLE = 100;

/** Ceiling per depositor across all MSSC accounts. */
export const MSSC_MAX_DEPOSIT = 200000;

/** A second account may be opened only three months after the first. */
export const MSSC_GAP_BETWEEN_ACCOUNTS_MONTHS = 3;

/** Partial withdrawal is capped at 40% of the eligible balance. */
export const MSSC_PARTIAL_WITHDRAWAL_PCT = 40;

/** Partial withdrawal is allowed only after one year from the date of opening. */
export const MSSC_PARTIAL_WITHDRAWAL_AFTER_YEARS = 1;

/** Closure without a stated reason is allowed only after six months. */
export const MSSC_VOLUNTARY_CLOSURE_AFTER_MONTHS = 6;

/** Closure without a stated reason earns 2 percentage points below the scheme rate. */
export const MSSC_VOLUNTARY_CLOSURE_RATE_CUT = 2;

/** The scheme accepted fresh deposits only between these dates; existing certificates run to maturity. */
export const MSSC_DEPOSIT_WINDOW_OPEN = "2023-04-01";
export const MSSC_DEPOSIT_WINDOW_CLOSE = "2025-03-31";

const round2 = (value) => Math.round(value * 100) / 100;
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Quarterly compounding: balance after `quarters` quarters at `annualRate` percent. */
function compound(principal, annualRate, quarters) {
  const quarterlyRate = annualRate / 100 / COMPOUNDS_PER_YEAR;
  return principal * Math.pow(1 + quarterlyRate, quarters);
}

function validateDeposit(deposit) {
  if (!isNum(deposit)) return "Enter the deposit amount in rupees.";
  if (deposit < MSSC_MIN_DEPOSIT) {
    return `The minimum MSSC deposit is ₹${MSSC_MIN_DEPOSIT.toLocaleString("en-IN")}.`;
  }
  if (deposit > MSSC_MAX_DEPOSIT) {
    return `A depositor cannot hold more than ₹${MSSC_MAX_DEPOSIT.toLocaleString("en-IN")} across all MSSC accounts.`;
  }
  return null;
}

/**
 * Maturity value and the quarter-by-quarter balance of an MSSC certificate.
 *
 * @param {object} input
 * @param {number} input.deposit    Amount deposited, in rupees.
 * @param {number} [input.annualRate] Scheme rate; defaults to the notified 7.5%.
 * @param {number} [input.tenureYears] Defaults to the fixed two-year term.
 * @returns {object} maturity breakdown, or { error }
 */
export function computeMsscMaturity({
  deposit,
  annualRate = MSSC_RATE,
  tenureYears = MSSC_TENURE_YEARS,
} = {}) {
  const depositError = validateDeposit(deposit);
  if (depositError) return { error: depositError };
  if (!isNum(annualRate) || annualRate < 0 || annualRate > 20) {
    return { error: "Enter a rate between 0% and 20% per year." };
  }
  if (!isNum(tenureYears) || tenureYears <= 0 || tenureYears > MSSC_TENURE_YEARS) {
    return { error: `An MSSC certificate runs for ${MSSC_TENURE_YEARS} years and cannot be extended.` };
  }

  const totalQuarters = Math.round(tenureYears * COMPOUNDS_PER_YEAR);
  const schedule = [];
  let balance = deposit;

  for (let quarter = 1; quarter <= totalQuarters; quarter += 1) {
    const interest = (balance * annualRate) / 100 / COMPOUNDS_PER_YEAR;
    balance += interest;
    schedule.push({
      quarter,
      interest: round2(interest),
      balance: round2(balance),
    });
  }

  const maturityValue = balance;
  const totalInterest = maturityValue - deposit;
  const simpleEquivalentRate = tenureYears > 0 ? (totalInterest / deposit / tenureYears) * 100 : 0;

  return {
    deposit: round2(deposit),
    annualRate,
    tenureYears,
    totalQuarters,
    maturityValue: round2(maturityValue),
    totalInterest: round2(totalInterest),
    simpleEquivalentRate: round2(simpleEquivalentRate),
    schedule,
    depositIsValidMultiple: deposit % MSSC_DEPOSIT_MULTIPLE === 0,
    headroomToCap: round2(Math.max(0, MSSC_MAX_DEPOSIT - deposit)),
  };
}

/**
 * The 40% partial withdrawal allowed after one year, and what the certificate is worth
 * at maturity once that money has been taken out.
 *
 * @param {object} input
 * @param {number} input.deposit
 * @param {number} [input.annualRate]
 * @param {number} [input.withdrawalPct] Share of the eligible balance withdrawn, up to 40.
 * @returns {object} withdrawal breakdown, or { error }
 */
export function computeMsscPartialWithdrawal({
  deposit,
  annualRate = MSSC_RATE,
  withdrawalPct = MSSC_PARTIAL_WITHDRAWAL_PCT,
} = {}) {
  const depositError = validateDeposit(deposit);
  if (depositError) return { error: depositError };
  if (!isNum(annualRate) || annualRate < 0 || annualRate > 20) {
    return { error: "Enter a rate between 0% and 20% per year." };
  }
  if (!isNum(withdrawalPct) || withdrawalPct < 0) {
    return { error: "Enter the share you want to withdraw, as a percentage." };
  }
  if (withdrawalPct > MSSC_PARTIAL_WITHDRAWAL_PCT) {
    return {
      error: `Only ${MSSC_PARTIAL_WITHDRAWAL_PCT}% of the eligible balance may be withdrawn, and only once the account is a year old.`,
    };
  }

  const quartersToWithdrawal = MSSC_PARTIAL_WITHDRAWAL_AFTER_YEARS * COMPOUNDS_PER_YEAR;
  const remainingQuarters = MSSC_TENURE_YEARS * COMPOUNDS_PER_YEAR - quartersToWithdrawal;

  const balanceAtOneYear = compound(deposit, annualRate, quartersToWithdrawal);
  const maxWithdrawal = (balanceAtOneYear * MSSC_PARTIAL_WITHDRAWAL_PCT) / 100;
  const withdrawn = (balanceAtOneYear * withdrawalPct) / 100;
  const balanceAfterWithdrawal = balanceAtOneYear - withdrawn;
  const maturityAfterWithdrawal = compound(balanceAfterWithdrawal, annualRate, remainingQuarters);
  const maturityIfUntouched = compound(deposit, annualRate, MSSC_TENURE_YEARS * COMPOUNDS_PER_YEAR);

  return {
    balanceAtOneYear: round2(balanceAtOneYear),
    maxWithdrawal: round2(maxWithdrawal),
    withdrawalPct,
    withdrawn: round2(withdrawn),
    balanceAfterWithdrawal: round2(balanceAfterWithdrawal),
    maturityAfterWithdrawal: round2(maturityAfterWithdrawal),
    totalReceived: round2(withdrawn + maturityAfterWithdrawal),
    maturityIfUntouched: round2(maturityIfUntouched),
    costOfWithdrawing: round2(maturityIfUntouched - (withdrawn + maturityAfterWithdrawal)),
    remainingQuarters,
  };
}

/**
 * What a certificate pays if it is closed before the two years are up.
 *
 * Grounds and rates under the MSSC, 2023 notification:
 *  - death of the account holder, or extreme compassionate grounds accepted by the
 *    post office: the scheme rate applies for the period held;
 *  - closure without a reason, allowed only after six months: the scheme rate less
 *    2 percentage points applies;
 *  - before six months with no accepted ground: closure is not permitted.
 *
 * @param {object} input
 * @param {number} input.deposit
 * @param {number} [input.annualRate]
 * @param {number} input.heldMonths Months completed since the deposit.
 * @param {"voluntary"|"death"|"compassionate"} [input.ground]
 * @returns {object} closure breakdown, or { error }
 */
export function computeMsscPrematureClosure({
  deposit,
  annualRate = MSSC_RATE,
  heldMonths,
  ground = "voluntary",
} = {}) {
  const depositError = validateDeposit(deposit);
  if (depositError) return { error: depositError };
  if (!isNum(annualRate) || annualRate < 0 || annualRate > 20) {
    return { error: "Enter a rate between 0% and 20% per year." };
  }
  if (!isNum(heldMonths) || heldMonths <= 0) {
    return { error: "Enter how many months the certificate has been held." };
  }
  if (heldMonths >= MSSC_TENURE_YEARS * 12) {
    return { error: "At 24 months the certificate matures normally, so no early-closure rate applies." };
  }
  if (ground === "voluntary" && heldMonths < MSSC_VOLUNTARY_CLOSURE_AFTER_MONTHS) {
    return {
      error: `Closure without a stated reason is allowed only after ${MSSC_VOLUNTARY_CLOSURE_AFTER_MONTHS} months. Before that, only death or accepted compassionate grounds permit closure.`,
    };
  }

  const appliedRate =
    ground === "voluntary" ? Math.max(0, annualRate - MSSC_VOLUNTARY_CLOSURE_RATE_CUT) : annualRate;
  const completedQuarters = Math.floor(heldMonths / 3);
  const payout = compound(deposit, appliedRate, completedQuarters);
  const interestEarned = payout - deposit;
  const payoutAtFullRate = compound(deposit, annualRate, completedQuarters);

  return {
    ground,
    heldMonths,
    completedQuarters,
    appliedRate,
    rateReduction: round2(annualRate - appliedRate),
    payout: round2(payout),
    interestEarned: round2(interestEarned),
    interestGivenUp: round2(payoutAtFullRate - payout),
    maturityIfHeld: round2(compound(deposit, annualRate, MSSC_TENURE_YEARS * COMPOUNDS_PER_YEAR)),
  };
}
