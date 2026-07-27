/**
 * Age on an exam cutoff date, counted the way Indian recruitment and
 * examination notifications count it.
 *
 * Conventions encoded:
 *  - Age in completed years/months/days by the calendar ("crucial date" or
 *    "as on" clauses): a year completes on the birthday anniversary, so a
 *    candidate born 2000-08-02 has NOT attained 26 years "as on" 2026-08-01.
 *  - Minimum-age clauses ("must have attained X years") pass when the Xth
 *    birthday falls on or before the cutoff date.
 *  - Maximum-age clauses ("must not have attained Y years") fail on the very
 *    day the Yth birthday falls on the cutoff — UPSC notifications express the
 *    same rule as "born not earlier than <cutoff minus Y years, plus one day>".
 *
 * Pure module: no React, no DOM, no clock reads — both dates are inputs.
 */

/** Bounds that keep the arithmetic meaningful. */
export const MAX_AGE_LIMIT_YEARS = 120;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
/** Mean Gregorian month length in days (400-year cycle: 146097 / 4800). */
export const MEAN_MONTH_DAYS = 146097 / 4800;

/** Parse an ISO yyyy-mm-dd string into a UTC-midnight Date, or null when invalid. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

/** Whole days between two UTC-midnight dates (to - from). */
export function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/**
 * Calendar age (completed years, months, days) on a reference date.
 * Days are borrowed from the month preceding the reference month.
 */
export function calendarAge(dob, asOn) {
  let years = asOn.getUTCFullYear() - dob.getUTCFullYear();
  let months = asOn.getUTCMonth() - dob.getUTCMonth();
  let days = asOn.getUTCDate() - dob.getUTCDate();

  if (days < 0) {
    const prevMonthDays = new Date(
      Date.UTC(asOn.getUTCFullYear(), asOn.getUTCMonth(), 0),
    ).getUTCDate();
    days += prevMonthDays;
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }
  return { years, months, days };
}

/**
 * The date on which a person born `dob` attains `years` years — i.e. the
 * birthday anniversary. 29 February birthdays roll to 1 March in non-leap
 * years, which matches how Date.UTC normalises the overflow.
 */
export function birthdayAnniversary(dob, years) {
  return new Date(Date.UTC(dob.getUTCFullYear() + years, dob.getUTCMonth(), dob.getUTCDate()));
}

/**
 * Age on a cutoff date, with optional minimum / maximum age-limit checks.
 *
 * @param {object} input
 * @param {string} input.dob        Date of birth, yyyy-mm-dd.
 * @param {string} input.cutoffDate The notification's crucial date, yyyy-mm-dd.
 * @param {number|string} [input.minYears] "Must have attained" limit; "" to skip.
 * @param {number|string} [input.maxYears] "Must not have attained" limit; "" to skip.
 * @returns {object} result, or { error }.
 */
export function computeAgeOnCutoff({ dob, cutoffDate, minYears = "", maxYears = "" } = {}) {
  const birth = parseIsoDate(dob);
  if (!birth) return { error: "Enter a valid date of birth in yyyy-mm-dd form." };
  const cutoff = parseIsoDate(cutoffDate);
  if (!cutoff) return { error: "Enter a valid cutoff date in yyyy-mm-dd form." };
  if (birth.getTime() > cutoff.getTime()) {
    return { error: "The date of birth is after the cutoff date — check both inputs." };
  }

  const hasMin = minYears !== "" && minYears !== null && minYears !== undefined;
  const hasMax = maxYears !== "" && maxYears !== null && maxYears !== undefined;

  let min = null;
  if (hasMin) {
    min = Number(minYears);
    if (!Number.isInteger(min) || min < 0 || min > MAX_AGE_LIMIT_YEARS) {
      return { error: `The minimum age must be a whole number of years between 0 and ${MAX_AGE_LIMIT_YEARS}.` };
    }
  }
  let max = null;
  if (hasMax) {
    max = Number(maxYears);
    if (!Number.isInteger(max) || max <= 0 || max > MAX_AGE_LIMIT_YEARS) {
      return { error: `The maximum age must be a whole number of years between 1 and ${MAX_AGE_LIMIT_YEARS}.` };
    }
  }
  if (min !== null && max !== null && min >= max) {
    return { error: "The minimum age limit must be below the maximum age limit." };
  }

  const age = calendarAge(birth, cutoff);
  const totalDays = daysBetween(birth, cutoff);
  const totalMonths = age.years * 12 + age.months;

  let minCheck = null;
  if (min !== null) {
    // Attains `min` years on the min-th birthday anniversary.
    const attainsOn = birthdayAnniversary(birth, min);
    const meets = attainsOn.getTime() <= cutoff.getTime();
    minCheck = {
      limit: min,
      meets,
      // Days from attaining the limit to the cutoff (positive: attained earlier).
      marginDays: daysBetween(attainsOn, cutoff),
    };
  }

  let maxCheck = null;
  if (max !== null) {
    // "Must NOT have attained max years" — fails when the max-th birthday
    // falls on or before the cutoff.
    const attainsOn = birthdayAnniversary(birth, max);
    const meets = attainsOn.getTime() > cutoff.getTime();
    maxCheck = {
      limit: max,
      meets,
      // Days of headroom before the limit is attained (positive: still within).
      marginDays: daysBetween(cutoff, attainsOn),
    };
  }

  const checksApplied = [minCheck, maxCheck].filter(Boolean);

  return {
    age,
    totalDays,
    totalWeeks: Math.floor(totalDays / 7),
    totalMonths,
    minCheck,
    maxCheck,
    hasChecks: checksApplied.length > 0,
    eligible: checksApplied.length > 0 ? checksApplied.every((c) => c.meets) : null,
  };
}
