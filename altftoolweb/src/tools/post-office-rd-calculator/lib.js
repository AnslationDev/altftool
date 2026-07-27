/**
 * Post Office Recurring Deposit — the National Savings Recurring Deposit
 * Account under the Government Savings Promotion Act rules of 2019.
 *
 * Scheme rules encoded here:
 *  - The account runs for FIVE YEARS (60 monthly instalments) and can be extended
 *    for further blocks of five years on application.
 *  - The minimum deposit is ₹100 a month and further deposits must be in
 *    multiples of ₹10. There is no maximum.
 *  - Interest is compounded QUARTERLY at the rate notified by the Ministry of
 *    Finance for small savings schemes. The rate is revised quarterly; 6.7% a
 *    year has been notified for the quarters running from 1 January 2024, and it
 *    is an input here so the figure can be updated.
 *  - Each instalment earns interest only from the month it is paid, so the
 *    instalment paid in month m of an n-month account stays invested for
 *    (n - m + 1) months.
 *  - DEFAULT FEE: a default fee of ₹1 for every ₹100 of the account's monthly
 *    denomination is charged for each defaulted month, payable with the arrears.
 *  - After FOUR defaults the account is treated as discontinued. It can be
 *    revived within two months from the month of the fourth default.
 *  - ADVANCE DEPOSIT REBATE: on an account of ₹100 denomination, a rebate of ₹10
 *    is allowed for six advance instalments and ₹40 for twelve, scaled pro rata
 *    to the actual denomination.
 *  - PREMATURE CLOSURE is allowed only after three years, and interest is then
 *    paid at the Post Office Savings Account rate.
 *  - A loan of up to 50% of the balance is available once twelve instalments
 *    have been paid and the account has run for a year.
 */

/** Small savings interest is compounded four times a year. */
export const COMPOUNDS_PER_YEAR = 4;
export const MONTHS_PER_QUARTER = 3;

/** Notified rate for the quarters from 1 January 2024 (% per year). */
export const NOTIFIED_RATE = 6.7;

/** Post Office Savings Account rate, used on premature closure (% per year). */
export const POSB_RATE = 4;

/** Account term and the permitted extension, in months. */
export const BASE_TERM_MONTHS = 60;
export const EXTENDED_TERM_MONTHS = 120;

/** Deposit limits. */
export const MIN_MONTHLY_DEPOSIT = 100;
export const DEPOSIT_MULTIPLE = 10;

/** Default fee: ₹1 per ₹100 of monthly denomination, per defaulted month. */
export const DEFAULT_FEE_PER_100 = 1;

/** Defaults tolerated before the account is treated as discontinued. */
export const MAX_DEFAULTS = 4;
export const REVIVAL_WINDOW_MONTHS = 2;

/** Advance deposit rebate per ₹100 of monthly denomination. */
export const ADVANCE_REBATE_PER_100 = { 6: 10, 12: 40 };

/** Premature closure is barred before this many months. */
export const PREMATURE_MIN_MONTHS = 36;

/** Loan against the account: share of balance, and the qualifying instalments. */
export const LOAN_SHARE_OF_BALANCE = 0.5;
export const LOAN_MIN_INSTALMENTS = 12;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Monthly growth factor implied by quarterly compounding at `annualRate`. */
export function monthlyFactor(annualRate) {
  if (!isNum(annualRate) || annualRate <= 0) return 1;
  return Math.pow(1 + annualRate / 100 / COMPOUNDS_PER_YEAR, 1 / MONTHS_PER_QUARTER);
}

/**
 * Value of a ₹1 monthly instalment stream after `months` instalments:
 * f + f^2 + ... + f^months.
 */
export function annuityFactor(annualRate, months) {
  if (!isNum(months) || months <= 0) return 0;
  const n = Math.round(months);
  const f = monthlyFactor(annualRate);
  if (Math.abs(f - 1) < 1e-12) return n;
  return (f * (Math.pow(f, n) - 1)) / (f - 1);
}

/**
 * Rebate allowed for depositing instalments in advance.
 *
 * @param {number} monthlyDeposit the account denomination
 * @param {number} advanceMonths 6 or 12; anything else earns no rebate
 */
export function advanceRebate(monthlyDeposit, advanceMonths) {
  if (!isNum(monthlyDeposit) || monthlyDeposit <= 0) return 0;
  const perHundred = ADVANCE_REBATE_PER_100[advanceMonths];
  if (!perHundred) return 0;
  return (monthlyDeposit / 100) * perHundred;
}

/**
 * Default fee payable on arrears.
 *
 * @param {number} monthlyDeposit
 * @param {number} defaultedMonths
 */
export function defaultFee(monthlyDeposit, defaultedMonths) {
  if (!isNum(monthlyDeposit) || monthlyDeposit <= 0) return 0;
  if (!isNum(defaultedMonths) || defaultedMonths <= 0) return 0;
  return (monthlyDeposit / 100) * DEFAULT_FEE_PER_100 * Math.round(defaultedMonths);
}

/**
 * Post Office RD projection.
 *
 * @param {object} input
 * @param {number} input.monthlyDeposit
 * @param {number} [input.annualRate] notified rate
 * @param {number} [input.termMonths] 60, or 120 if extended
 * @param {number} [input.defaultedMonths] months missed and paid late
 * @param {number} [input.advanceMonths] instalments paid in advance (6 or 12)
 * @param {number} [input.closeAfterMonths] months held if closed prematurely
 * @returns {object} result, or { error }
 */
export function computePostOfficeRd({
  monthlyDeposit,
  annualRate = NOTIFIED_RATE,
  termMonths = BASE_TERM_MONTHS,
  defaultedMonths = 0,
  advanceMonths = 0,
  closeAfterMonths = 0,
} = {}) {
  if (!isNum(monthlyDeposit)) return { error: "Enter the amount you will deposit each month." };
  if (monthlyDeposit < MIN_MONTHLY_DEPOSIT) {
    return { error: "The scheme has a minimum monthly deposit of ₹100." };
  }
  if (monthlyDeposit > 1e8) return { error: "Enter a monthly deposit below ₹10 crore." };
  if (!isNum(annualRate) || annualRate <= 0 || annualRate > 15) {
    return { error: "Enter a notified rate between 0% and 15%." };
  }
  if (termMonths !== BASE_TERM_MONTHS && termMonths !== EXTENDED_TERM_MONTHS) {
    return { error: "The account runs for five years, or ten years if extended once." };
  }
  if (!isNum(defaultedMonths) || defaultedMonths < 0 || defaultedMonths > termMonths) {
    return { error: "Enter the number of defaulted months within the account term." };
  }
  if (!isNum(closeAfterMonths) || closeAfterMonths < 0 || closeAfterMonths > termMonths) {
    return { error: "Enter the months held as a value within the account term." };
  }

  const n = termMonths;
  const factor = annuityFactor(annualRate, n);
  const maturityValue = monthlyDeposit * factor;
  const totalDeposited = monthlyDeposit * n;
  const totalInterest = maturityValue - totalDeposited;

  const defaults = Math.round(defaultedMonths);
  const fee = defaultFee(monthlyDeposit, defaults);
  const discontinued = defaults > MAX_DEFAULTS;
  const rebate = advanceRebate(monthlyDeposit, advanceMonths);

  const netMaturity = maturityValue - fee;
  const netOutlay = totalDeposited + fee - rebate;

  // Yearly progress, so a depositor can see the balance build up.
  const schedule = [];
  for (let year = 1; year <= Math.ceil(n / 12); year += 1) {
    const monthsSoFar = Math.min(n, year * 12);
    const closing = monthlyDeposit * annuityFactor(annualRate, monthsSoFar);
    const paidIn = monthlyDeposit * monthsSoFar;
    schedule.push({
      year,
      monthsSoFar,
      paidIn,
      closing,
      interest: closing - paidIn,
    });
  }

  // Premature closure: allowed only after three years, and then only the Post
  // Office Savings Account rate is paid on the whole account.
  const held = Math.round(closeAfterMonths);
  let premature = null;
  if (held > 0) {
    if (held < PREMATURE_MIN_MONTHS) {
      premature = {
        allowed: false,
        monthsHeld: held,
        reason: `The account cannot be closed before ${PREMATURE_MIN_MONTHS} months, except on the death of the depositor.`,
        payout: monthlyDeposit * held,
        interest: 0,
        appliedRate: 0,
      };
    } else {
      const payout = monthlyDeposit * annuityFactor(POSB_RATE, held);
      const paidIn = monthlyDeposit * held;
      const ifContinued = monthlyDeposit * annuityFactor(annualRate, held);
      premature = {
        allowed: true,
        monthsHeld: held,
        reason: `Closed early, so interest is paid at the ${POSB_RATE}% Post Office Savings Account rate instead of ${annualRate}%.`,
        appliedRate: POSB_RATE,
        paidIn,
        payout,
        interest: payout - paidIn,
        interestLost: ifContinued - payout,
      };
    }
  }

  const loanEligibleAfter = LOAN_MIN_INSTALMENTS;
  const loanAvailableAtYearOne =
    monthlyDeposit * annuityFactor(annualRate, LOAN_MIN_INSTALMENTS) * LOAN_SHARE_OF_BALANCE;

  return {
    monthlyDeposit,
    annualRate,
    termMonths: n,
    maturityValue,
    totalDeposited,
    totalInterest,
    netMaturity,
    netOutlay,
    interestOnDeposits: (totalInterest / totalDeposited) * 100,
    effectiveYield:
      (Math.pow(1 + annualRate / 100 / COMPOUNDS_PER_YEAR, COMPOUNDS_PER_YEAR) - 1) * 100,
    defaultedMonths: defaults,
    defaultFee: fee,
    discontinued,
    maxDefaults: MAX_DEFAULTS,
    revivalWindowMonths: REVIVAL_WINDOW_MONTHS,
    advanceMonths,
    advanceRebate: rebate,
    offMultiple: Math.abs(monthlyDeposit % DEPOSIT_MULTIPLE) > 1e-9,
    schedule,
    premature,
    loanEligibleAfter,
    loanAvailableAtYearOne,
  };
}
