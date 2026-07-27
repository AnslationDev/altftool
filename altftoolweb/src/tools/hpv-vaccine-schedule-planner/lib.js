/**
 * HPV vaccination schedule planner.
 *
 * The rules encoded here are the ACIP/CDC schedule, which WHO and most national
 * programmes mirror:
 *
 *  - Licensed from age 9. Routine vaccination is recommended at 11-12 years.
 *  - Series STARTED BEFORE THE 15TH BIRTHDAY: 2 doses, at 0 and 6-12 months.
 *    The minimum interval between dose 1 and dose 2 is 5 months. If dose 2 is given
 *    earlier than 5 months after dose 1, a third dose is required.
 *  - Series STARTED ON OR AFTER THE 15TH BIRTHDAY, or in anyone immunocompromised
 *    (including HIV infection) regardless of age: 3 doses, at 0, 1-2 and 6 months.
 *    Minimum intervals are 4 weeks between doses 1 and 2, 12 weeks between doses 2
 *    and 3, and 5 months between doses 1 and 3.
 *  - An interrupted series is resumed, never restarted, however long the gap.
 *  - Vaccination is licensed through age 45; for adults aged 27-45 it is a shared
 *    clinical decision rather than a routine recommendation.
 *
 * All maths is pure calendar arithmetic on ISO date strings in UTC. Dates are
 * arguments, never read from the clock.
 *
 * Informational scheduling only — the actual schedule is confirmed by the clinician
 * giving the vaccine.
 */

export const MIN_AGE_YEARS = 9;
export const ROUTINE_AGE_YEARS = 11;
/** Starting the series before this birthday allows the 2-dose schedule. */
export const TWO_DOSE_MAX_START_AGE = 15;
export const SHARED_DECISION_MIN_AGE = 27;
export const UPPER_LICENSED_AGE = 45;

/** 2-dose schedule: recommended 6 months, acceptable up to 12, minimum 5. */
export const TWO_DOSE_RECOMMENDED_MONTHS = 6;
export const TWO_DOSE_LATEST_MONTHS = 12;
export const TWO_DOSE_MIN_MONTHS = 5;

/** 3-dose schedule: 0, 1-2 months, 6 months. */
export const THREE_DOSE_D2_RECOMMENDED_MONTHS = 2;
export const THREE_DOSE_D2_MIN_DAYS = 28; // 4 weeks
export const THREE_DOSE_D3_RECOMMENDED_MONTHS = 6;
export const THREE_DOSE_D3_MIN_AFTER_D2_DAYS = 84; // 12 weeks
export const THREE_DOSE_D3_MIN_AFTER_D1_MONTHS = 5;

const MS_PER_DAY = 86400000;

export function parseISODate(iso) {
  if (typeof iso !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return ms;
}

export function toISODate(ms) {
  if (!Number.isFinite(ms)) return null;
  const date = new Date(ms);
  return [
    String(date.getUTCFullYear()).padStart(4, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function addDays(ms, days) {
  return ms + days * MS_PER_DAY;
}

/** Add whole calendar months, clamping to the last day of the target month. */
export function addMonths(ms, months) {
  const date = new Date(ms);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const targetMonthStart = Date.UTC(year, month + months, 1);
  const target = new Date(targetMonthStart);
  const daysInTargetMonth = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(day, daysInTargetMonth));
}

export function diffDays(fromMs, toMs) {
  return Math.round((toMs - fromMs) / MS_PER_DAY);
}

/** Completed years between two UTC dates. */
export function ageInYears(birthMs, onMs) {
  const birth = new Date(birthMs);
  const on = new Date(onMs);
  let years = on.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday =
    on.getUTCMonth() < birth.getUTCMonth() ||
    (on.getUTCMonth() === birth.getUTCMonth() && on.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) years -= 1;
  return years;
}

/**
 * @param {object} input
 * @param {string} input.birthDateISO      Date of birth.
 * @param {string} input.firstDoseISO      Date dose 1 was or will be given.
 * @param {boolean} [input.immunocompromised] Forces the 3-dose schedule at any age.
 * @param {string} [input.secondDoseISO]   Actual date of dose 2, if already given.
 * @param {string} [input.todayISO]        Reference date for "days away" figures.
 * @returns {object} schedule, or { error }
 */
export function planHpvSchedule({
  birthDateISO,
  firstDoseISO,
  immunocompromised = false,
  secondDoseISO = "",
  todayISO = "",
} = {}) {
  const birthMs = parseISODate(birthDateISO);
  if (birthMs === null) return { error: "Enter a valid date of birth." };

  const firstMs = parseISODate(firstDoseISO);
  if (firstMs === null) return { error: "Enter a valid date for the first dose." };
  if (firstMs < birthMs) return { error: "The first dose cannot be dated before the date of birth." };

  const ageAtFirstDose = ageInYears(birthMs, firstMs);
  if (ageAtFirstDose < MIN_AGE_YEARS) {
    return {
      error: `HPV vaccine is licensed from age ${MIN_AGE_YEARS}; this first dose falls at age ${ageAtFirstDose}.`,
    };
  }

  let todayMs = null;
  if (todayISO) {
    todayMs = parseISODate(todayISO);
    if (todayMs === null) return { error: "The reference date is not a valid calendar date." };
  }

  let secondActualMs = null;
  if (secondDoseISO) {
    secondActualMs = parseISODate(secondDoseISO);
    if (secondActualMs === null) return { error: "The second dose date is not a valid calendar date." };
    if (secondActualMs <= firstMs) {
      return { error: "The second dose must come after the first dose." };
    }
  }

  const twoDoseEligible = ageAtFirstDose < TWO_DOSE_MAX_START_AGE && !immunocompromised;

  const doses = [];
  let thirdDoseRequired = false;
  let secondDoseTooEarly = false;

  doses.push({
    number: 1,
    recommendedMs: firstMs,
    earliestMs: firstMs,
    latestMs: firstMs,
    given: true,
    note: `Age ${ageAtFirstDose} at dose 1`,
  });

  if (twoDoseEligible) {
    const recommendedMs = addMonths(firstMs, TWO_DOSE_RECOMMENDED_MONTHS);
    const earliestMs = addMonths(firstMs, TWO_DOSE_MIN_MONTHS);
    const latestMs = addMonths(firstMs, TWO_DOSE_LATEST_MONTHS);
    doses.push({
      number: 2,
      recommendedMs: secondActualMs ?? recommendedMs,
      earliestMs,
      latestMs,
      given: secondActualMs !== null,
      note: `${TWO_DOSE_RECOMMENDED_MONTHS}-${TWO_DOSE_LATEST_MONTHS} months after dose 1, minimum ${TWO_DOSE_MIN_MONTHS} months`,
    });

    if (secondActualMs !== null && secondActualMs < earliestMs) {
      secondDoseTooEarly = true;
      thirdDoseRequired = true;
      const catchUpEarliest = Math.max(
        addDays(secondActualMs, THREE_DOSE_D3_MIN_AFTER_D2_DAYS),
        addMonths(firstMs, THREE_DOSE_D3_MIN_AFTER_D1_MONTHS),
      );
      doses.push({
        number: 3,
        recommendedMs: catchUpEarliest,
        earliestMs: catchUpEarliest,
        latestMs: addMonths(firstMs, TWO_DOSE_LATEST_MONTHS),
        given: false,
        note: `Needed because dose 2 came less than ${TWO_DOSE_MIN_MONTHS} months after dose 1`,
      });
    }
  } else {
    const d2Recommended = addMonths(firstMs, THREE_DOSE_D2_RECOMMENDED_MONTHS);
    const d2Earliest = addDays(firstMs, THREE_DOSE_D2_MIN_DAYS);
    const d2Actual = secondActualMs ?? d2Recommended;
    doses.push({
      number: 2,
      recommendedMs: d2Actual,
      earliestMs: d2Earliest,
      latestMs: addMonths(firstMs, THREE_DOSE_D2_RECOMMENDED_MONTHS),
      given: secondActualMs !== null,
      note: `1-${THREE_DOSE_D2_RECOMMENDED_MONTHS} months after dose 1, minimum 4 weeks`,
    });
    if (secondActualMs !== null && secondActualMs < d2Earliest) secondDoseTooEarly = true;

    const d3Recommended = addMonths(firstMs, THREE_DOSE_D3_RECOMMENDED_MONTHS);
    const d3Earliest = Math.max(
      addDays(d2Actual, THREE_DOSE_D3_MIN_AFTER_D2_DAYS),
      addMonths(firstMs, THREE_DOSE_D3_MIN_AFTER_D1_MONTHS),
    );
    doses.push({
      number: 3,
      recommendedMs: Math.max(d3Recommended, d3Earliest),
      earliestMs: d3Earliest,
      latestMs: addMonths(firstMs, TWO_DOSE_LATEST_MONTHS),
      given: false,
      note: `${THREE_DOSE_D3_RECOMMENDED_MONTHS} months after dose 1; at least 12 weeks after dose 2 and 5 months after dose 1`,
    });
  }

  const lastDose = doses[doses.length - 1];
  const completionMs = lastDose.recommendedMs;

  return {
    ageAtFirstDose,
    immunocompromised: Boolean(immunocompromised),
    doseCount: doses.length,
    scheduleName: doses.length === 2 ? "2-dose schedule" : "3-dose schedule",
    scheduleReason: twoDoseEligible
      ? `Series starts before the ${TWO_DOSE_MAX_START_AGE}th birthday`
      : immunocompromised
        ? "Immunocompromising condition — 3 doses at any starting age"
        : `Series starts at or after the ${TWO_DOSE_MAX_START_AGE}th birthday`,
    doses: doses.map((dose) => ({
      number: dose.number,
      recommendedISO: toISODate(dose.recommendedMs),
      earliestISO: toISODate(dose.earliestMs),
      latestISO: toISODate(dose.latestMs),
      given: dose.given,
      note: dose.note,
      daysFromFirst: diffDays(firstMs, dose.recommendedMs),
      daysAway: todayMs === null ? null : diffDays(todayMs, dose.recommendedMs),
    })),
    firstDoseISO: toISODate(firstMs),
    completionISO: toISODate(completionMs),
    totalMonths: diffDays(firstMs, completionMs) / 30.4375,
    secondDoseTooEarly,
    thirdDoseRequired,
    sharedDecision:
      ageAtFirstDose >= SHARED_DECISION_MIN_AGE && ageAtFirstDose <= UPPER_LICENSED_AGE,
    aboveLicensedAge: ageAtFirstDose > UPPER_LICENSED_AGE,
    routineAge: ageAtFirstDose >= ROUTINE_AGE_YEARS && ageAtFirstDose <= 12,
  };
}
