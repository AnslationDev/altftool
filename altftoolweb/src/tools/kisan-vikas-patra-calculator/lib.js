/**
 * Kisan Vikas Patra (KVP) doubling maths.
 *
 * KVP is a Government of India small savings certificate sold at post offices and
 * designated banks. The Ministry of Finance notifies, every quarter, an interest
 * rate compounded ANNUALLY and a tenure chosen so that the certificate matures at
 * exactly twice the amount invested.
 *
 * Source of the rules encoded below: Kisan Vikas Patra Scheme, 2019 (as amended)
 * and the quarterly small savings rate notifications of the Ministry of Finance,
 * Department of Economic Affairs.
 */

/** Notified KVP interest rate, % per annum, compounded annually. */
export const KVP_ANNUAL_RATE = 7.5;

/**
 * Notified KVP tenure at 7.5% p.a. = 115 months (9 years 7 months).
 * 12 * ln(2) / ln(1.075) = 115.01 months, which is why 115 was notified.
 */
export const KVP_TENURE_MONTHS = 115;

/** Minimum purchase under the KVP scheme rules. */
export const KVP_MIN_INVESTMENT = 1000;

/** Certificates are issued in multiples of ₹100; there is no upper limit. */
export const KVP_MULTIPLE = 100;

/**
 * Premature closure is not permitted before 2 years 6 months (30 months) from the
 * date of deposit, except on the death of the holder, forfeiture by a pledgee
 * being a Gazetted officer, or on order of a court.
 */
export const KVP_PREMATURE_LOCK_MONTHS = 30;

/**
 * Rate/tenure pairs actually notified by the Ministry of Finance. Used to tell the
 * user when their chosen rate matches a notified combination (maturity then equals
 * exactly twice the principal by notification, not by the compounding formula).
 */
export const NOTIFIED_COMBINATIONS = [
  { rate: 7.5, months: 115 }, // from the quarter beginning 1 April 2023 onwards
  { rate: 7.2, months: 120 }, // quarter beginning 1 January 2023
  { rate: 7.0, months: 123 }, // quarter beginning 1 October 2022
  { rate: 6.9, months: 124 }, // 1 April 2020 to 30 September 2022
  { rate: 7.6, months: 113 }, // quarter beginning 1 October 2018
  { rate: 7.3, months: 118 }, // quarter beginning 1 July 2018
];

/** Sanity ceiling so absurd rates cannot produce meaningless output. */
const MAX_RATE = 25;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Exact time for money to double at an annually compounded rate.
 * Solves (1 + r)^t = 2 for t, i.e. t = ln(2) / ln(1 + r).
 * @param {number} annualRate percent per annum, e.g. 7.5
 * @returns {{ years: number, months: number, wholeMonths: number }|{ error: string }}
 */
export function doublingPeriod(annualRate) {
  if (!isNum(annualRate) || annualRate <= 0) {
    return { error: "Enter an interest rate greater than zero." };
  }
  if (annualRate > MAX_RATE) {
    return { error: `Enter an interest rate of ${MAX_RATE}% or less.` };
  }
  const years = Math.LN2 / Math.log(1 + annualRate / 100);
  const months = years * 12;
  return { years, months, wholeMonths: Math.round(months) };
}

/**
 * Split a count of months into years + months for display.
 * @param {number} totalMonths
 */
export function splitMonths(totalMonths) {
  if (!isNum(totalMonths) || totalMonths < 0) return { years: 0, months: 0 };
  const whole = Math.round(totalMonths);
  return { years: Math.floor(whole / 12), months: whole % 12 };
}

/**
 * Value of an annually compounded deposit after a whole number of months.
 * Partial years use a fractional exponent, which is how the notified KVP maturity
 * value of exactly 2x at 115 months is arrived at (1.075^(115/12) = 1.99977).
 */
function compoundValue(principal, annualRate, months) {
  return principal * Math.pow(1 + annualRate / 100, months / 12);
}

/**
 * Full KVP projection.
 *
 * @param {object} input
 * @param {number} input.principal amount invested, in rupees
 * @param {number} [input.annualRate] % p.a. compounded annually (default 7.5)
 * @param {number} [input.tenureMonths] months held (default: notified 115)
 * @returns {object} result, or { error } for invalid input
 */
export function computeKvp({
  principal,
  annualRate = KVP_ANNUAL_RATE,
  tenureMonths = KVP_TENURE_MONTHS,
} = {}) {
  if (!isNum(principal)) {
    return { error: "Enter the amount you want to invest in Kisan Vikas Patra." };
  }
  if (principal <= 0) {
    return { error: "The investment amount must be greater than zero." };
  }
  if (principal > 1e12) {
    return { error: "Enter an investment amount below ₹1 lakh crore." };
  }
  const doubling = doublingPeriod(annualRate);
  if (doubling.error) return { error: doubling.error };
  if (!isNum(tenureMonths) || tenureMonths < 1) {
    return { error: "Enter a holding period of at least one month." };
  }
  if (tenureMonths > 600) {
    return { error: "Enter a holding period of 600 months (50 years) or less." };
  }

  const months = Math.round(tenureMonths);
  const notified = NOTIFIED_COMBINATIONS.find(
    (row) => Math.abs(row.rate - annualRate) < 1e-9 && row.months === months,
  );
  const formulaValue = compoundValue(principal, annualRate, months);

  // For a notified rate/tenure pair the certificate matures at exactly double the
  // face value by notification; otherwise the compounding formula governs.
  const maturityValue = notified ? principal * 2 : formulaValue;
  const interest = maturityValue - principal;

  // Year-by-year balance on annual compounding, with a final stub for the
  // remaining months (e.g. the 7 months at the end of the 115-month tenure).
  const schedule = [];
  const fullYears = Math.floor(months / 12);
  for (let year = 1; year <= fullYears; year += 1) {
    const closing = compoundValue(principal, annualRate, year * 12);
    const opening = compoundValue(principal, annualRate, (year - 1) * 12);
    schedule.push({
      label: `Year ${year}`,
      months: year * 12,
      opening,
      interest: closing - opening,
      closing,
    });
  }
  const stub = months - fullYears * 12;
  if (stub > 0) {
    const opening = compoundValue(principal, annualRate, fullYears * 12);
    schedule.push({
      label: `Final ${stub} month${stub === 1 ? "" : "s"}`,
      months,
      opening,
      interest: maturityValue - opening,
      closing: maturityValue,
    });
  } else if (schedule.length > 0 && notified) {
    // Align the last row with the notified maturity value.
    const last = schedule[schedule.length - 1];
    last.interest = maturityValue - last.opening;
    last.closing = maturityValue;
  }

  const lock = splitMonths(KVP_PREMATURE_LOCK_MONTHS);

  return {
    principal,
    annualRate,
    tenureMonths: months,
    tenure: splitMonths(months),
    isNotifiedCombination: Boolean(notified),
    maturityValue,
    formulaValue,
    interest,
    growthMultiple: maturityValue / principal,
    // Simple (non-compounded) return over the whole holding period, for context.
    totalReturnPercent: (interest / principal) * 100,
    exactDoublingMonths: doubling.months,
    exactDoublingYears: doubling.years,
    doublingTenure: splitMonths(doubling.wholeMonths),
    prematureLockMonths: KVP_PREMATURE_LOCK_MONTHS,
    prematureLockTenure: lock,
    belowMinimum: principal < KVP_MIN_INVESTMENT,
    offMultiple: Math.abs(principal % KVP_MULTIPLE) > 1e-9,
    schedule,
  };
}
