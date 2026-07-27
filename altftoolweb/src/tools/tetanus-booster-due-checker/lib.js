/**
 * Tetanus booster due checker.
 *
 * Encoded rules (ACIP/CDC tetanus prophylaxis in routine wound management, the
 * schedule most national guidelines follow):
 *
 *  - Primary series: 3 doses of a tetanus toxoid-containing vaccine.
 *  - Routine booster: Td or Tdap every 10 years after the primary series.
 *  - Clean, minor wound: give a booster if 10 or more years have passed since the last
 *    dose, or if the person has had fewer than 3 doses or an unknown history.
 *  - All other wounds (contaminated with dirt, soil, faeces or saliva; punctures;
 *    avulsions; crush injuries; burns; frostbite): give a booster if 5 or more years
 *    have passed, or if the history is fewer than 3 doses or unknown.
 *  - Tetanus immune globulin (TIG) is indicated in addition to the vaccine for those
 *    "other" wounds when the person has had fewer than 3 doses or the history is
 *    unknown. TIG is not indicated for clean minor wounds.
 *  - Pregnancy: one dose of Tdap in EVERY pregnancy, preferably between 27 and 36
 *    weeks of gestation, regardless of when the last tetanus dose was given.
 *
 * All calendar maths is pure and UTC-based; "today" is always an argument.
 *
 * Informational only — a wound needing tetanus cover needs to be seen by a clinician,
 * who will also assess whether the wound itself needs cleaning, closure or antibiotics.
 */

export const ROUTINE_BOOSTER_INTERVAL_YEARS = 10;
export const DIRTY_WOUND_INTERVAL_YEARS = 5;
export const PRIMARY_SERIES_DOSES = 3;

/** Preferred gestational window for the Tdap dose given in every pregnancy. */
export const TDAP_PREGNANCY_MIN_WEEK = 27;
export const TDAP_PREGNANCY_MAX_WEEK = 36;

export const DOSE_HISTORY = ["three-or-more", "fewer-than-three", "unknown"];
export const WOUND_TYPES = ["none", "clean-minor", "other"];

export const WOUND_LABELS = {
  none: "No wound — routine check",
  "clean-minor": "Clean, minor wound",
  other: "Dirty, deep, puncture, burn or crush wound",
};

export const DOSE_HISTORY_LABELS = {
  "three-or-more": "3 or more previous doses",
  "fewer-than-three": "Fewer than 3 previous doses",
  unknown: "Unknown vaccination history",
};

const MS_PER_DAY = 86400000;
/** Mean Gregorian year length, used only to express an elapsed span in years. */
const DAYS_PER_YEAR = 365.2425;

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

/** Add whole years, clamping 29 February to 28 February in a non-leap year. */
export function addYears(ms, years) {
  const date = new Date(ms);
  const targetYear = date.getUTCFullYear() + years;
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const daysInMonth = new Date(Date.UTC(targetYear, month + 1, 0)).getUTCDate();
  return Date.UTC(targetYear, month, Math.min(day, daysInMonth));
}

export function diffDays(fromMs, toMs) {
  return Math.round((toMs - fromMs) / MS_PER_DAY);
}

/**
 * @param {object} input
 * @param {string} input.todayISO        Reference date.
 * @param {string} [input.lastDoseISO]   Date of the most recent tetanus-containing dose.
 * @param {string} [input.doseHistory]   "three-or-more" | "fewer-than-three" | "unknown"
 * @param {string} [input.wound]         "none" | "clean-minor" | "other"
 * @param {boolean} [input.pregnant]     Currently pregnant.
 * @param {number|null} [input.weeksPregnant] Gestational age in weeks, if known.
 * @returns {object} assessment, or { error }
 */
export function assessTetanusBooster({
  todayISO,
  lastDoseISO = "",
  doseHistory = "three-or-more",
  wound = "none",
  pregnant = false,
  weeksPregnant = null,
} = {}) {
  if (!DOSE_HISTORY.includes(doseHistory)) {
    return { error: "Choose how many previous tetanus doses you have had." };
  }
  if (!WOUND_TYPES.includes(wound)) {
    return { error: "Choose the wound type, or 'no wound' for a routine check." };
  }

  const todayMs = parseISODate(todayISO);
  if (todayMs === null) return { error: "Enter today's date as a valid calendar date." };

  let lastDoseMs = null;
  if (lastDoseISO) {
    lastDoseMs = parseISODate(lastDoseISO);
    if (lastDoseMs === null) return { error: "The last dose date is not a valid calendar date." };
    if (lastDoseMs > todayMs) return { error: "The last dose date cannot be in the future." };
  } else if (doseHistory === "three-or-more") {
    return {
      error:
        "Enter the date of your last tetanus dose, or change the history to 'unknown' if you cannot find it.",
    };
  }

  if (pregnant && weeksPregnant !== null && weeksPregnant !== "" ) {
    const weeks = Number(weeksPregnant);
    if (!Number.isFinite(weeks) || weeks < 0 || weeks > 45) {
      return { error: "Weeks of pregnancy must be between 0 and 45." };
    }
  }

  const completedSeries = doseHistory === "three-or-more";
  const daysSinceLastDose = lastDoseMs === null ? null : diffDays(lastDoseMs, todayMs);
  const yearsSinceLastDose = daysSinceLastDose === null ? null : daysSinceLastDose / DAYS_PER_YEAR;

  const routineDueMs =
    lastDoseMs === null ? null : addYears(lastDoseMs, ROUTINE_BOOSTER_INTERVAL_YEARS);
  const woundDueMs =
    lastDoseMs === null ? null : addYears(lastDoseMs, DIRTY_WOUND_INTERVAL_YEARS);

  const routineOverdue = routineDueMs !== null && todayMs >= routineDueMs;
  const pastFiveYears = woundDueMs !== null && todayMs >= woundDueMs;

  // Which interval applies for this visit.
  const thresholdYears =
    wound === "other" ? DIRTY_WOUND_INTERVAL_YEARS : ROUTINE_BOOSTER_INTERVAL_YEARS;
  const intervalReached =
    lastDoseMs === null ? true : wound === "other" ? pastFiveYears : routineOverdue;

  const boosterIndicated = !completedSeries || intervalReached;
  const tigIndicated = wound === "other" && !completedSeries;

  const weeks =
    pregnant && weeksPregnant !== null && weeksPregnant !== ""
      ? Number(weeksPregnant)
      : null;
  const pregnancyTdapDue = pregnant;
  const pregnancyInWindow =
    weeks === null ? null : weeks >= TDAP_PREGNANCY_MIN_WEEK && weeks <= TDAP_PREGNANCY_MAX_WEEK;

  let headline;
  if (!completedSeries) {
    headline = "Primary course needed";
  } else if (boosterIndicated) {
    headline = "Booster due";
  } else {
    headline = "Not due yet";
  }

  const reasons = [];
  if (!completedSeries) {
    reasons.push(
      `A full course is ${PRIMARY_SERIES_DOSES} doses. With ${doseHistory === "unknown" ? "an unknown history" : "fewer than 3 doses"}, the course is completed rather than a single booster given.`,
    );
  }
  if (wound === "other") {
    reasons.push(
      `For a dirty, deep or contaminated wound the interval is ${DIRTY_WOUND_INTERVAL_YEARS} years, not ${ROUTINE_BOOSTER_INTERVAL_YEARS}.`,
    );
  }
  if (completedSeries && wound !== "other" && !routineOverdue && routineDueMs !== null) {
    reasons.push(
      `The routine ${ROUTINE_BOOSTER_INTERVAL_YEARS}-year booster is not due until ${toISODate(routineDueMs)}.`,
    );
  }
  if (tigIndicated) {
    reasons.push(
      "Tetanus immune globulin is also indicated for this wound because the primary course is incomplete or unknown.",
    );
  }
  if (pregnancyTdapDue) {
    reasons.push(
      `Tdap is recommended in every pregnancy, ideally between weeks ${TDAP_PREGNANCY_MIN_WEEK} and ${TDAP_PREGNANCY_MAX_WEEK}, whatever the interval since the last dose.`,
    );
  }

  return {
    headline,
    boosterIndicated,
    tigIndicated,
    completedSeries,
    doseHistory,
    doseHistoryLabel: DOSE_HISTORY_LABELS[doseHistory],
    wound,
    woundLabel: WOUND_LABELS[wound],
    thresholdYears,
    lastDoseISO: lastDoseMs === null ? null : toISODate(lastDoseMs),
    todayISO: toISODate(todayMs),
    daysSinceLastDose,
    yearsSinceLastDose,
    routineDueISO: routineDueMs === null ? null : toISODate(routineDueMs),
    woundDueISO: woundDueMs === null ? null : toISODate(woundDueMs),
    daysUntilRoutineDue: routineDueMs === null ? null : diffDays(todayMs, routineDueMs),
    routineOverdue,
    pastFiveYears,
    pregnancyTdapDue,
    pregnancyInWindow,
    weeksPregnant: weeks,
    reasons,
  };
}
