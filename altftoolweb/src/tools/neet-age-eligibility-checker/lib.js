/**
 * NEET (UG) minimum-age eligibility.
 *
 * Rule encoded (Graduate Medical Education Regulations, 1997, as amended, and
 * the NTA NEET (UG) information bulletin): a candidate must have COMPLETED
 * 17 years of age on or before 31 December of the year of admission to the
 * first year of the MBBS/BDS course.
 *
 * The upper age limit was removed: the National Medical Commission decided in
 * 2022 that there is no upper age bar for NEET (UG), and NTA bulletins since
 * then state the same. Only the minimum age is therefore checked here.
 *
 * Pure module: no React, no DOM, no clock reads — the admission year is an
 * input, never taken from the system clock inside the maths.
 */

/** Minimum completed age on the cutoff date, per the GME Regulations. */
export const NEET_MIN_AGE_YEARS = 17;
/** Cutoff is 31 December of the admission year (month/day). */
export const CUTOFF_MONTH = 12;
export const CUTOFF_DAY = 31;

/** Sane bounds for the admission-year input. */
export const MIN_ADMISSION_YEAR = 1990;
export const MAX_ADMISSION_YEAR = 2100;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

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
 * Calendar age (completed years, months, days) on an "as on" date, the way
 * eligibility clauses count it: years complete on the birthday anniversary.
 *
 * @param {Date} dob   UTC-midnight date of birth.
 * @param {Date} asOn  UTC-midnight reference date (must be >= dob).
 * @returns {{years:number, months:number, days:number}}
 */
export function calendarAge(dob, asOn) {
  let years = asOn.getUTCFullYear() - dob.getUTCFullYear();
  let months = asOn.getUTCMonth() - dob.getUTCMonth();
  let days = asOn.getUTCDate() - dob.getUTCDate();

  if (days < 0) {
    // Borrow the length of the month preceding the "as on" month.
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
 * Latest date of birth that still satisfies the 17-year rule for an admission
 * year: born on or before 31 December of (admissionYear - 17).
 */
export function latestEligibleDob(admissionYear) {
  return new Date(Date.UTC(admissionYear - NEET_MIN_AGE_YEARS, CUTOFF_MONTH - 1, CUTOFF_DAY));
}

const pad2 = (n) => String(n).padStart(2, "0");
const toIso = (date) =>
  `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;

/**
 * Check NEET minimum-age eligibility.
 *
 * @param {object} input
 * @param {string} input.dob            Date of birth, yyyy-mm-dd.
 * @param {number|string} input.admissionYear Year of admission to first-year MBBS/BDS.
 * @returns {object} result, or { error } when input cannot produce an answer.
 */
export function checkNeetAgeEligibility({ dob, admissionYear } = {}) {
  const year = Number(admissionYear);
  if (!Number.isFinite(year) || !Number.isInteger(year)) {
    return { error: "Enter the admission year as a whole number, e.g. 2026." };
  }
  if (year < MIN_ADMISSION_YEAR || year > MAX_ADMISSION_YEAR) {
    return { error: `Enter an admission year between ${MIN_ADMISSION_YEAR} and ${MAX_ADMISSION_YEAR}.` };
  }

  const birth = parseIsoDate(dob);
  if (!birth) return { error: "Enter a valid date of birth in yyyy-mm-dd form." };

  const cutoff = new Date(Date.UTC(year, CUTOFF_MONTH - 1, CUTOFF_DAY));
  if (birth.getTime() > cutoff.getTime()) {
    return { error: "The date of birth is after the 31 December cutoff — check both inputs." };
  }

  const age = calendarAge(birth, cutoff);
  const latestDob = latestEligibleDob(year);
  // Positive margin: born this many days BEFORE the last eligible birth date.
  const marginDays = daysBetween(birth, latestDob);
  const eligible = marginDays >= 0;

  return {
    eligible,
    cutoffDate: toIso(cutoff),
    age,
    totalDaysOnCutoff: daysBetween(birth, cutoff),
    latestEligibleDob: toIso(latestDob),
    marginDays: Math.abs(marginDays),
    marginDirection: eligible ? "spare" : "short",
    minAgeYears: NEET_MIN_AGE_YEARS,
    admissionYear: year,
  };
}
