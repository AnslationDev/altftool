/**
 * Ibuprofen dose interval maths.
 *
 * Nothing here is medical advice — it is arithmetic on the dosing rules printed
 * on the pack. The numbers below come from the standard labelling:
 *
 *  - Adult over-the-counter ibuprofen (US OTC monograph / UK & IN OTC packs):
 *    200-400 mg per dose, no more often than every 4-6 hours, maximum 1200 mg
 *    in 24 hours without a doctor's direction, and no more than 10 days of
 *    self-treatment for pain.
 *  - Adult prescription ibuprofen: 400-800 mg every 6-8 hours, maximum
 *    3200 mg in 24 hours (US prescribing information); many clinicians keep
 *    long-term use at or below 1200 mg/day because gastrointestinal and
 *    cardiovascular risk rises with dose.
 *  - Children (over 3 months, weight based): 5-10 mg/kg per dose every
 *    6-8 hours, maximum 4 doses in 24 hours and a ceiling of 40 mg/kg/day
 *    (BNF for Children / paediatric OTC labelling). The adult 1200 mg OTC
 *    ceiling still applies as an absolute cap for self-treatment.
 *
 * All times are handled as "minutes since midnight" so the maths stays pure —
 * the caller supplies the clock time, this module never reads the clock.
 */

/** Minutes in one day — used to wrap clock arithmetic past midnight. */
export const MINUTES_PER_DAY = 1440;

/** Absolute self-treatment ceiling in one rolling 24-hour period, milligrams. */
export const OTC_DAILY_CEILING_MG = 1200;

/** Paediatric ceiling per kilogram of body weight in 24 hours, milligrams. */
export const CHILD_MAX_MG_PER_KG_PER_DAY = 40;

/** Paediatric single dose band, milligrams per kilogram. */
export const CHILD_DOSE_MG_PER_KG = { min: 5, max: 10 };

/** Ibuprofen is not given to infants under this age without a doctor. */
export const MIN_CHILD_AGE_MONTHS = 3;

/** Sanity limits so a typo cannot produce a plausible-looking plan. */
export const LIMITS = {
  weightKg: { min: 5, max: 200 },
  doseMg: { min: 25, max: 800 },
  intervalHours: { min: 4, max: 12 },
};

export const IBUPROFEN_PROFILES = {
  adultOtc: {
    key: "adultOtc",
    label: "Adult / 12+ over-the-counter",
    doseMin: 200,
    doseMax: 400,
    defaultDose: 400,
    intervalMin: 4,
    intervalMax: 6,
    defaultInterval: 6,
    dailyMaxMg: OTC_DAILY_CEILING_MG,
    maxDosesPerDay: 3,
    source: "OTC pack labelling: 200-400 mg every 4-6 h, max 1200 mg/24 h.",
  },
  adultRx: {
    key: "adultRx",
    label: "Adult prescription strength",
    doseMin: 200,
    doseMax: 800,
    defaultDose: 400,
    intervalMin: 6,
    intervalMax: 8,
    defaultInterval: 8,
    dailyMaxMg: 3200,
    maxDosesPerDay: 4,
    source: "Prescription labelling: 400-800 mg every 6-8 h, max 3200 mg/24 h.",
  },
  child: {
    key: "child",
    label: "Child (weight based)",
    doseMin: 25,
    doseMax: 400,
    defaultDose: null, // derived from weight
    intervalMin: 6,
    intervalMax: 8,
    defaultInterval: 6,
    dailyMaxMg: null, // derived from weight
    maxDosesPerDay: 4,
    source: "Paediatric dosing: 5-10 mg/kg every 6-8 h, max 4 doses and 40 mg/kg/24 h.",
  },
};

const round = (value, dp = 0) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/**
 * Parse a 24-hour "HH:MM" string into minutes since midnight.
 * @returns {number|null} null when the string is not a valid time.
 */
export function parseClockTime(text) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(text ?? "").trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Render minutes-since-midnight as a 12-hour clock label, e.g. 870 -> "2:30 PM". */
export function formatClockTime(minutes) {
  if (!Number.isFinite(minutes)) return "—";
  const wrapped = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours24 = Math.floor(wrapped / 60);
  const mins = wrapped % 60;
  const suffix = hours24 < 12 ? "AM" : "PM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(mins).padStart(2, "0")} ${suffix}`;
}

/** Whole hours and minutes between two instants, as a "4 h 30 min" style label. */
export function formatGap(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) return "—";
  const safe = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins} min`;
}

/** Recommended single paediatric dose: 10 mg/kg, rounded down to a 25 mg step. */
export function childDoseForWeight(weightKg) {
  if (!Number.isFinite(weightKg) || weightKg <= 0) return null;
  const raw = weightKg * CHILD_DOSE_MG_PER_KG.max;
  const stepped = Math.floor(raw / 25) * 25;
  return Math.min(400, Math.max(25, stepped));
}

/**
 * Build the dosing plan.
 *
 * @param {object} input
 * @param {"adultOtc"|"adultRx"|"child"} input.profileKey
 * @param {number} input.doseMg           Size of one dose in milligrams.
 * @param {number} input.intervalHours    Gap the user intends to leave between doses.
 * @param {number} input.lastDoseMinutes  Last dose taken, minutes since midnight.
 * @param {number} input.mgTakenToday     Milligrams already taken in the last 24 h (includes the last dose).
 * @param {number} [input.weightKg]       Required for the child profile.
 * @returns {object} plan, or { error } when the input cannot produce a safe answer.
 */
export function planIbuprofenDoses({
  profileKey = "adultOtc",
  doseMg,
  intervalHours,
  lastDoseMinutes,
  mgTakenToday,
  weightKg,
}) {
  const profile = IBUPROFEN_PROFILES[profileKey];
  if (!profile) return { error: "Choose who the dose is for." };

  const numbers = [doseMg, intervalHours, lastDoseMinutes, mgTakenToday];
  if (numbers.some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Fill in the dose, the gap, the time of the last dose and the amount taken so far." };
  }
  if (lastDoseMinutes < 0 || lastDoseMinutes >= MINUTES_PER_DAY) {
    return { error: "Enter the time of the last dose as a valid time of day." };
  }
  if (doseMg < LIMITS.doseMg.min || doseMg > LIMITS.doseMg.max) {
    return { error: `A single ibuprofen dose should be between ${LIMITS.doseMg.min} mg and ${LIMITS.doseMg.max} mg.` };
  }
  if (intervalHours < LIMITS.intervalHours.min || intervalHours > LIMITS.intervalHours.max) {
    return {
      error: `Ibuprofen doses are spaced ${LIMITS.intervalHours.min} to ${LIMITS.intervalHours.max} hours apart.`,
    };
  }
  if (mgTakenToday < 0) return { error: "Milligrams already taken cannot be negative." };

  let dailyMaxMg = profile.dailyMaxMg;
  let mgPerKgPerDose = null;
  let weight = null;

  if (profile.key === "child") {
    if (typeof weightKg !== "number" || !Number.isFinite(weightKg)) {
      return { error: "Enter the child's weight — paediatric ibuprofen is dosed per kilogram." };
    }
    if (weightKg < LIMITS.weightKg.min || weightKg > LIMITS.weightKg.max) {
      return {
        error: `Weight must be between ${LIMITS.weightKg.min} kg and ${LIMITS.weightKg.max} kg.`,
      };
    }
    weight = weightKg;
    // 40 mg/kg/day, never above the 1200 mg self-treatment ceiling.
    dailyMaxMg = Math.min(OTC_DAILY_CEILING_MG, weightKg * CHILD_MAX_MG_PER_KG_PER_DAY);
    mgPerKgPerDose = doseMg / weightKg;
  }

  if (!(dailyMaxMg > 0)) return { error: "Could not work out a daily ceiling for that profile." };

  const minIntervalHours = profile.intervalMin;
  const earliestNextMinutes = lastDoseMinutes + minIntervalHours * 60;
  const plannedNextMinutes = lastDoseMinutes + intervalHours * 60;

  const mgRemaining = Math.max(0, dailyMaxMg - mgTakenToday);
  const dosesRemaining = Math.floor(mgRemaining / doseMg);

  // How many doses of this size fit under the ceiling in one day, and how many
  // the chosen interval physically allows in 24 hours.
  const dosesByCeiling = Math.floor(dailyMaxMg / doseMg);
  const dosesByInterval = Math.floor(24 / intervalHours);
  const maxDosesPerDay = Math.min(dosesByCeiling, dosesByInterval, profile.maxDosesPerDay);

  // Forward schedule from the last dose, stopping at the ceiling or the day.
  const schedule = [];
  let cumulative = mgTakenToday;
  for (let i = 1; i <= dosesRemaining && i <= maxDosesPerDay; i += 1) {
    const minutes = lastDoseMinutes + i * intervalHours * 60;
    if (minutes - lastDoseMinutes > MINUTES_PER_DAY) break;
    cumulative += doseMg;
    schedule.push({
      index: i,
      minutes,
      nextDay: minutes >= MINUTES_PER_DAY,
      label: formatClockTime(minutes),
      cumulativeMg: cumulative,
      headroomMg: Math.max(0, dailyMaxMg - cumulative),
    });
  }

  const warnings = [];
  if (mgTakenToday >= dailyMaxMg) {
    warnings.push(
      `The ${round(dailyMaxMg)} mg ceiling for the last 24 hours is already used up. No further ibuprofen until 24 hours after the first dose of the day.`,
    );
  }
  if (doseMg > profile.doseMax) {
    warnings.push(
      `${round(doseMg)} mg is above the usual ${profile.doseMax} mg single dose for this profile — check the pack or ask a pharmacist.`,
    );
  }
  if (doseMg < profile.doseMin) {
    warnings.push(
      `${round(doseMg)} mg is below the usual ${profile.doseMin} mg single dose, so it may not relieve pain.`,
    );
  }
  if (intervalHours < profile.intervalMin) {
    warnings.push(`Doses for this profile are normally at least ${profile.intervalMin} hours apart.`);
  }
  if (profile.key === "child" && mgPerKgPerDose !== null) {
    if (mgPerKgPerDose > CHILD_DOSE_MG_PER_KG.max) {
      warnings.push(
        `That works out to ${round(mgPerKgPerDose, 1)} mg/kg per dose, above the usual ${CHILD_DOSE_MG_PER_KG.max} mg/kg maximum.`,
      );
    } else if (mgPerKgPerDose < CHILD_DOSE_MG_PER_KG.min) {
      warnings.push(
        `That works out to ${round(mgPerKgPerDose, 1)} mg/kg per dose, below the usual ${CHILD_DOSE_MG_PER_KG.min} mg/kg starting dose.`,
      );
    }
  }
  if (dosesRemaining === 0 && mgRemaining > 0) {
    warnings.push(
      `Only ${round(mgRemaining)} mg of headroom is left — less than one full ${round(doseMg)} mg dose.`,
    );
  }

  return {
    profile,
    doseMg: round(doseMg),
    intervalHours,
    minIntervalHours,
    dailyMaxMg: round(dailyMaxMg),
    mgTakenToday: round(mgTakenToday),
    mgRemaining: round(mgRemaining),
    dosesRemaining,
    maxDosesPerDay,
    lastDoseMinutes,
    lastDoseLabel: formatClockTime(lastDoseMinutes),
    earliestNextMinutes,
    earliestNextLabel: formatClockTime(earliestNextMinutes),
    earliestNextIsTomorrow: earliestNextMinutes >= MINUTES_PER_DAY,
    plannedNextMinutes,
    plannedNextLabel: formatClockTime(plannedNextMinutes),
    plannedNextIsTomorrow: plannedNextMinutes >= MINUTES_PER_DAY,
    gapToEarliestMinutes: minIntervalHours * 60,
    weightKg: weight,
    mgPerKgPerDose: mgPerKgPerDose === null ? null : round(mgPerKgPerDose, 1),
    ceilingMgPerKgPerDay: weight === null ? null : round(dailyMaxMg / weight, 1),
    schedule,
    warnings,
  };
}
