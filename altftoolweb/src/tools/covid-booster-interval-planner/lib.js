/**
 * COVID booster interval planning.
 *
 * The earliest eligible date is simply the later of two dates:
 *
 *   last dose date  + the minimum interval between doses
 *   infection date  + the deferral period after infection
 *
 * The intervals themselves differ by country and change over time, so they are
 * inputs here rather than hard-coded truth. The presets reflect the rules most
 * commonly published:
 *
 *  - A minimum of 2 months (56 days) since the previous COVID-19 vaccine dose
 *    is the interval US CDC guidance has used for an additional updated dose.
 *  - Deferring vaccination for 3 months (90 days) after a SARS-CoV-2 infection,
 *    counted from symptom onset or the positive test, is the CDC's stated
 *    option for people who were recently infected.
 *  - UK JCVI-style programmes have used a 3-month (91-day) minimum after both
 *    a previous dose and an infection.
 *  - Seasonal autumn/spring campaigns typically space doses about 6 months
 *    (182 days) apart for eligible groups.
 *
 * Nothing here reads the system clock; pass an "as of" date for the countdown.
 */

export const MS_PER_DAY = 86400000;

export const PRESETS = [
  {
    id: "cdc",
    label: "2 months since dose · 3 months after infection",
    doseDays: 56,
    infectionDays: 90,
    note: "Matches the commonly published US-style minimum interval and post-infection deferral.",
  },
  {
    id: "uk",
    label: "3 months since dose · 3 months after infection",
    doseDays: 91,
    infectionDays: 91,
    note: "Matches UK-style programme rules, which use a 3-month gap after both.",
  },
  {
    id: "seasonal",
    label: "6 months since dose · 3 months after infection",
    doseDays: 182,
    infectionDays: 90,
    note: "Typical spacing for seasonal autumn/spring campaigns in eligible groups.",
  },
  {
    id: "immunocompromised",
    label: "2 months since dose · no infection deferral",
    doseDays: 56,
    infectionDays: 0,
    note: "Additional doses for immunocompromised people are often given without a post-infection wait — follow your specialist's advice.",
  },
];

export const MAX_INTERVAL_DAYS = 730;
export const DAYS_PER_MONTH_APPROX = 30.4375; // 365.25 / 12

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse "YYYY-MM-DD" into a UTC timestamp, or null. */
export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = ISO_PATTERN.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 2019 || year > 2100) return null;
  const timestamp = Date.UTC(year, month - 1, day);
  const check = new Date(timestamp);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return timestamp;
}

/** Format a UTC timestamp as "YYYY-MM-DD". */
export function toISODate(timestamp) {
  if (!Number.isFinite(timestamp)) return "";
  const date = new Date(timestamp);
  return `${String(date.getUTCFullYear()).padStart(4, "0")}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function addDays(timestamp, days) {
  if (!Number.isFinite(timestamp) || !Number.isFinite(days)) return NaN;
  return timestamp + Math.round(days) * MS_PER_DAY;
}

export function daysBetween(from, to) {
  if (!Number.isFinite(from) || !Number.isFinite(to)) return NaN;
  return Math.round((to - from) / MS_PER_DAY);
}

/** Approximate a day count as months, for readable output. */
export function daysToMonths(days) {
  if (!Number.isFinite(days)) return null;
  return days / DAYS_PER_MONTH_APPROX;
}

/** Look up a preset by id. */
export function presetById(id) {
  return PRESETS.find((preset) => preset.id === id) || null;
}

/**
 * Compute the earliest booster date.
 *
 * @param {object} input
 * @param {string} input.lastDoseDate "YYYY-MM-DD" of the most recent COVID vaccine dose.
 * @param {string} [input.infectionDate] "YYYY-MM-DD" of symptom onset or the positive test.
 * @param {number} input.doseIntervalDays Minimum days since the last dose.
 * @param {number} input.infectionDeferralDays Days to defer after infection.
 * @param {string} [input.asOfDate] "YYYY-MM-DD" used for the countdown.
 * @returns {object} results or { error }
 */
export function computeBoosterEligibility({
  lastDoseDate,
  infectionDate = "",
  doseIntervalDays = 56,
  infectionDeferralDays = 90,
  asOfDate = "",
} = {}) {
  const lastDose = parseISODate(lastDoseDate);
  if (lastDose === null) return { error: "Enter a valid last dose date as YYYY-MM-DD." };

  const doseDays = Number(doseIntervalDays);
  if (!Number.isFinite(doseDays) || doseDays < 0 || doseDays > MAX_INTERVAL_DAYS) {
    return { error: `The dose interval should be between 0 and ${MAX_INTERVAL_DAYS} days.` };
  }

  const infectionDays = Number(infectionDeferralDays);
  if (!Number.isFinite(infectionDays) || infectionDays < 0 || infectionDays > MAX_INTERVAL_DAYS) {
    return { error: `The infection deferral should be between 0 and ${MAX_INTERVAL_DAYS} days.` };
  }

  let infection = null;
  const hasInfection = typeof infectionDate === "string" && infectionDate.trim() !== "";
  if (hasInfection) {
    infection = parseISODate(infectionDate);
    if (infection === null) return { error: "Enter a valid infection date as YYYY-MM-DD." };
  }

  const doseEligibleDate = addDays(lastDose, doseDays);
  const infectionEligibleDate = infection === null ? null : addDays(infection, infectionDays);

  let earliestDate = doseEligibleDate;
  let drivenBy = "last dose";
  if (infectionEligibleDate !== null && infectionEligibleDate > doseEligibleDate) {
    earliestDate = infectionEligibleDate;
    drivenBy = "recent infection";
  } else if (infectionEligibleDate !== null && infectionEligibleDate === doseEligibleDate) {
    drivenBy = "both rules together";
  }

  let status = null;
  const hasAsOf = typeof asOfDate === "string" && asOfDate.trim() !== "";
  if (hasAsOf) {
    const asOf = parseISODate(asOfDate);
    if (asOf === null) return { error: "Enter a valid 'as of' date as YYYY-MM-DD." };
    const daysUntil = daysBetween(asOf, earliestDate);
    status = {
      asOf,
      daysUntil: daysUntil > 0 ? daysUntil : 0,
      eligibleNow: daysUntil <= 0,
      daysSinceDose: daysBetween(lastDose, asOf),
      daysSinceInfection: infection === null ? null : daysBetween(infection, asOf),
      daysSinceEligible: daysUntil <= 0 ? -daysUntil : 0,
    };
  }

  return {
    lastDose,
    infection,
    doseIntervalDays: Math.round(doseDays),
    infectionDeferralDays: Math.round(infectionDays),
    doseEligibleDate,
    infectionEligibleDate,
    earliestDate,
    drivenBy,
    doseIntervalMonths: daysToMonths(doseDays),
    infectionDeferralMonths: daysToMonths(infectionDays),
    status,
  };
}
