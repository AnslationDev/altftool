/**
 * CAGR (Compound Annual Growth Rate) maths.
 *
 * Definition (standard finance identity):
 *   CAGR = (endValue / beginValue) ^ (1 / years) - 1
 *
 * CAGR is the single constant annual rate that would take beginValue to
 * endValue over the holding period. It is a geometric mean, so it ignores the
 * path taken in between — that is what makes it comparable across investments.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Mean length of a Gregorian calendar year in days (365.2425), used to turn a
 * date range into a fractional number of years. Source: Gregorian calendar rule
 * of 97 leap days per 400 years -> 146097 / 400 = 365.2425. */
export const DAYS_PER_YEAR = 365.2425;

/** Milliseconds in a day. */
export const MS_PER_DAY = 86400000;

/** Upper sanity bound on the holding period. Longer than any realistic
 * investment record, so anything beyond this is almost certainly a typo. */
export const MAX_YEARS = 200;

/** Shortest period we will annualise: one day. */
export const MIN_YEARS = 1 / 365;

/** Upper bound on a reportable annualised rate: 1,000,000% a year (a 10,000x
 * multiple every year). Annualising a large gain earned over days mathematically
 * produces rates far beyond this, and quoting them is misleading rather than
 * informative, so we ask for absolute return instead. */
export const MAX_CAGR_PERCENT = 1000000;

/** ln(2), used for the doubling-time identity t = ln 2 / ln(1 + r). */
const LN2 = Math.log(2);

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Fractional years between two calendar dates.
 * Takes dates as arguments so the function stays pure (no Date.now()).
 *
 * @param {string|Date} start ISO date string or Date
 * @param {string|Date} end   ISO date string or Date
 * @returns {{ years: number, days: number } | { error: string }}
 */
export function yearsBetween(start, end) {
  const a = start instanceof Date ? start : new Date(String(start));
  const b = end instanceof Date ? end : new Date(String(end));
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) {
    return { error: "Enter both dates in a valid calendar format." };
  }
  const days = (b.getTime() - a.getTime()) / MS_PER_DAY;
  if (days <= 0) return { error: "The end date must be after the start date." };
  return { days, years: days / DAYS_PER_YEAR };
}

/**
 * Compound annual growth rate and the figures that go with it.
 *
 * @param {object} input
 * @param {number} input.beginValue Value at the start of the period (> 0)
 * @param {number} input.endValue   Value at the end of the period (>= 0)
 * @param {number} input.years      Holding period in years (> 0)
 * @returns {object} result, or { error } when the input cannot produce a real rate
 */
export function computeCagr({ beginValue, endValue, years }) {
  if (![beginValue, endValue, years].every(isNum)) {
    return { error: "Enter a number in every field." };
  }
  if (beginValue <= 0) {
    return { error: "The starting value must be greater than zero — you cannot grow from nothing." };
  }
  if (endValue < 0) {
    return { error: "The ending value cannot be negative." };
  }
  if (years < MIN_YEARS) {
    return { error: "The period must be at least one day." };
  }
  if (years > MAX_YEARS) {
    return { error: `Keep the period under ${MAX_YEARS} years.` };
  }

  const multiple = endValue / beginValue;
  // (end/begin)^(1/years) - 1. multiple >= 0 and years > 0, so this is finite.
  const cagr = Math.pow(multiple, 1 / years) - 1;
  if (!Number.isFinite(cagr) || cagr * 100 > MAX_CAGR_PERCENT) {
    return {
      error:
        "Annualising this gain over such a short period gives a rate too extreme to be meaningful — compare the absolute return instead.",
    };
  }
  const absoluteReturn = multiple - 1;
  const totalGain = endValue - beginValue;

  // Simple (non-compounded) annualisation, shown for contrast only.
  const simpleAnnualReturn = absoluteReturn / years;

  // t = ln 2 / ln(1 + r); only meaningful while the rate is positive.
  const doublingYears = cagr > 0 ? LN2 / Math.log(1 + cagr) : null;

  return {
    cagr, // decimal, e.g. 0.1487 for 14.87%
    cagrPercent: cagr * 100,
    absoluteReturn,
    absoluteReturnPercent: absoluteReturn * 100,
    simpleAnnualReturnPercent: simpleAnnualReturn * 100,
    multiple,
    totalGain,
    years,
    beginValue,
    endValue,
    doublingYears,
  };
}

/**
 * The smooth compounding path implied by a CAGR: what the value would be at the
 * end of each whole year if it grew at exactly that constant rate.
 *
 * @param {object} input
 * @param {number} input.beginValue
 * @param {number} input.cagr decimal rate, e.g. 0.12
 * @param {number} input.years
 * @param {number} [input.maxRows] cap on rows returned (default 30)
 * @returns {Array<{ year: number, value: number, gain: number }>}
 */
export function buildGrowthPath({ beginValue, cagr, years, maxRows = 30 }) {
  if (!isNum(beginValue) || !isNum(cagr) || !isNum(years) || years <= 0) return [];
  const whole = Math.min(Math.floor(years), maxRows);
  const rows = [];
  for (let year = 1; year <= whole; year += 1) {
    const value = beginValue * Math.pow(1 + cagr, year);
    if (!Number.isFinite(value)) break;
    rows.push({ year, value, gain: value - beginValue });
  }
  if (years > whole && rows.length < maxRows) {
    const value = beginValue * Math.pow(1 + cagr, years);
    if (Number.isFinite(value)) {
      rows.push({ year: years, value, gain: value - beginValue });
    }
  }
  return rows;
}
