/**
 * Paracetamol (acetaminophen) dose spacing.
 *
 * This module only does arithmetic on the standard, widely published dosing
 * limits — it is not a prescribing tool.
 *
 * Adults and children 16+ (standard product labelling):
 *   500 mg to 1 g per dose, at least 4 hours apart, no more than 4 doses in
 *   any 24 hours. The maximum is 4 g (4000 mg) in 24 hours; many over-the-
 *   counter labels use a lower 3 g ceiling as an extra margin.
 *
 * Children (standard weight-based paediatric dosing):
 *   15 mg per kg per dose, every 4 to 6 hours, up to 4 doses in 24 hours,
 *   i.e. 60 mg/kg/day, and never more than the adult maximum.
 *
 * Times are handled as "HH:MM" strings and minutes past midnight. Nothing here
 * reads the system clock — pass the current time in if you want a countdown.
 */

export const MINUTES_PER_DAY = 1440;

/** Adult per-dose range, in milligrams. */
export const ADULT_DOSE_MIN_MG = 500;
export const ADULT_DOSE_MAX_MG = 1000;
/** Minimum gap between doses, in hours, and the maximum number of doses a day. */
export const MIN_INTERVAL_HOURS = 4;
export const MAX_INTERVAL_HOURS = 8;
export const MAX_DOSES_PER_DAY = 4;
/** Adult 24-hour ceilings. */
export const ADULT_DAILY_MAX_MG = 4000;
export const OTC_LABEL_DAILY_MAX_MG = 3000;

/** Paediatric weight-based dosing. */
export const CHILD_DOSE_MG_PER_KG = 15;
export const CHILD_DAILY_MAX_MG_PER_KG = 60;
export const CHILD_MIN_WEIGHT_KG = 4;
export const CHILD_MAX_WEIGHT_KG = 100;
/** Below this weight, dosing should come from a clinician rather than a table. */
export const CHILD_CLINICIAN_WEIGHT_KG = 6;

/** Sanity bounds for the inputs. */
export const MAX_DOSES_INPUT = 12;
export const MIN_DOSE_MG = 60;
export const MAX_DOSE_MG = 1000;

export const MODES = [
  { id: "adult", label: "Adult or child 16 and over" },
  { id: "child", label: "Child, dosed by weight" },
];

/** Parse an "HH:MM" 24-hour clock string into minutes past midnight, or null. */
export function parseClock(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Wrap any minute value into 0..1439. */
export function wrapMinutes(minutes) {
  if (!Number.isFinite(minutes)) return 0;
  const wrapped = Math.round(minutes) % MINUTES_PER_DAY;
  return wrapped < 0 ? wrapped + MINUTES_PER_DAY : wrapped;
}

/** Format minutes past midnight as a 12-hour clock string. */
export function formatClock12(minutes) {
  const m = wrapMinutes(minutes);
  const hours24 = Math.floor(m / 60);
  const suffix = hours24 >= 12 ? "pm" : "am";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(m % 60).padStart(2, "0")} ${suffix}`;
}

/** Format a duration in minutes as "4h 30m". */
export function formatDuration(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return "0m";
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Weight-based paediatric dose, rounded down to the nearest 5 mg. */
export function childDoseMg(weightKg) {
  const weight = Number(weightKg);
  if (!Number.isFinite(weight) || weight <= 0) return null;
  return Math.floor((weight * CHILD_DOSE_MG_PER_KG) / 5) * 5;
}

/** Weight-based 24-hour ceiling, capped at the adult maximum. */
export function childDailyMaxMg(weightKg) {
  const weight = Number(weightKg);
  if (!Number.isFinite(weight) || weight <= 0) return null;
  return Math.min(ADULT_DAILY_MAX_MG, weight * CHILD_DAILY_MAX_MG_PER_KG);
}

/**
 * Work out the next dose time and what is left of the 24-hour allowance.
 *
 * @param {object} input
 * @param {string} [input.mode] "adult" or "child".
 * @param {number} [input.weightKg] Required in child mode.
 * @param {string} input.lastDoseTime "HH:MM" of the most recent dose.
 * @param {number} input.dosesTaken Doses already taken in the past 24 hours.
 * @param {number} input.mgPerDose Milligrams in each of those doses.
 * @param {number} [input.intervalHours] Gap you are using between doses.
 * @param {number} [input.dailyMaxMg] Override the 24-hour ceiling.
 * @param {number|null} [input.nowMinutes] Current time for the countdown.
 * @returns {object} results or { error }
 */
export function computeParacetamolPlan({
  mode = "adult",
  weightKg = null,
  lastDoseTime,
  dosesTaken = 0,
  mgPerDose = 1000,
  intervalHours = MIN_INTERVAL_HOURS,
  dailyMaxMg = null,
  nowMinutes = null,
} = {}) {
  if (!MODES.some((entry) => entry.id === mode)) {
    return { error: "Choose whether this is adult or weight-based child dosing." };
  }

  const lastDose = parseClock(lastDoseTime);
  if (lastDose === null) return { error: "Enter the last dose time in 24-hour HH:MM form." };

  const doses = Number(dosesTaken);
  if (!Number.isFinite(doses) || doses < 1 || doses > MAX_DOSES_INPUT) {
    return { error: `Doses taken in the last 24 hours should be between 1 and ${MAX_DOSES_INPUT}.` };
  }

  const perDose = Number(mgPerDose);
  if (!Number.isFinite(perDose) || perDose < MIN_DOSE_MG || perDose > MAX_DOSE_MG) {
    return { error: `A single dose should be between ${MIN_DOSE_MG} and ${MAX_DOSE_MG} mg.` };
  }

  const interval = Number(intervalHours);
  if (!Number.isFinite(interval) || interval < MIN_INTERVAL_HOURS || interval > MAX_INTERVAL_HOURS) {
    return {
      error: `The gap between doses should be between ${MIN_INTERVAL_HOURS} and ${MAX_INTERVAL_HOURS} hours.`,
    };
  }

  let weight = null;
  let recommendedDose = null;
  let ceiling = Number(dailyMaxMg);

  if (mode === "child") {
    weight = Number(weightKg);
    if (!Number.isFinite(weight) || weight < CHILD_MIN_WEIGHT_KG || weight > CHILD_MAX_WEIGHT_KG) {
      return {
        error: `Child weight should be between ${CHILD_MIN_WEIGHT_KG} and ${CHILD_MAX_WEIGHT_KG} kg.`,
      };
    }
    recommendedDose = childDoseMg(weight);
    if (!Number.isFinite(ceiling) || ceiling <= 0) ceiling = childDailyMaxMg(weight);
  } else if (!Number.isFinite(ceiling) || ceiling <= 0) {
    ceiling = ADULT_DAILY_MAX_MG;
  }

  if (!Number.isFinite(ceiling) || ceiling <= 0) {
    return { error: "Could not work out a 24-hour limit from those values." };
  }

  const takenMg = Math.round(doses) * perDose;
  const remainingMg = ceiling - takenMg;
  const dosesLeftByMg = remainingMg >= perDose ? Math.floor(remainingMg / perDose) : 0;
  // The spacing rule limits how many doses physically fit in a 24-hour period.
  const slotsPerDay = Math.floor(24 / interval);
  const dosesLeftBySpacing = Math.max(0, slotsPerDay - Math.round(doses));
  const remainingDoses = Math.min(dosesLeftByMg, dosesLeftBySpacing);
  const limitingFactor =
    dosesLeftByMg === dosesLeftBySpacing
      ? "both the daily limit and the dose spacing"
      : dosesLeftByMg < dosesLeftBySpacing
        ? "the 24-hour milligram limit"
        : "the minimum gap between doses";
  const overLimit = takenMg > ceiling;
  const atLimit = !overLimit && remainingDoses === 0;

  const intervalMinutes = Math.round(interval * 60);
  const nextDoseMinutes = wrapMinutes(lastDose + intervalMinutes);
  const twentyFourHourResetMinutes = wrapMinutes(lastDose);

  const schedule = [];
  for (let index = 0; index < remainingDoses; index += 1) {
    schedule.push({
      index: index + 1,
      at: wrapMinutes(lastDose + intervalMinutes * (index + 1)),
      cumulativeMg: takenMg + perDose * (index + 1),
    });
  }

  let countdown = null;
  if (nowMinutes !== null && Number.isFinite(Number(nowMinutes))) {
    const now = wrapMinutes(nowMinutes);
    const untilNext = wrapMinutes(nextDoseMinutes - now);
    const sinceLast = wrapMinutes(now - lastDose);
    countdown = {
      now,
      minutesUntilNext: sinceLast >= intervalMinutes ? 0 : untilNext,
      minutesSinceLast: sinceLast,
      dueNow: sinceLast >= intervalMinutes,
    };
  }

  const warnings = [];
  if (overLimit) {
    warnings.push(
      `That is ${takenMg} mg in 24 hours, above the ${ceiling} mg limit. Paracetamol overdose can damage the liver without early symptoms — contact a doctor or poisons service now, even if you feel fine.`,
    );
  } else if (atLimit) {
    warnings.push(
      `No further doses fit in this 24-hour period — you are limited by ${limitingFactor}. Wait until 24 hours after your first dose before taking any more.`,
    );
  }
  if (mode === "adult" && ceiling > OTC_LABEL_DAILY_MAX_MG) {
    warnings.push(
      `Many over-the-counter labels cap the day at ${OTC_LABEL_DAILY_MAX_MG} mg rather than ${ADULT_DAILY_MAX_MG} mg — use the lower figure unless a clinician told you otherwise.`,
    );
  }
  if (mode === "child" && weight !== null && weight < CHILD_CLINICIAN_WEIGHT_KG) {
    warnings.push(
      `Below about ${CHILD_CLINICIAN_WEIGHT_KG} kg, dosing should come from a doctor or pharmacist rather than a weight table.`,
    );
  }
  if (mode === "child" && recommendedDose !== null && perDose > recommendedDose) {
    warnings.push(
      `${perDose} mg is above the ${recommendedDose} mg that ${CHILD_DOSE_MG_PER_KG} mg/kg gives for ${weight} kg — check the dose against the bottle and the label.`,
    );
  }
  warnings.push(
    "Check every other medicine you are taking for paracetamol or acetaminophen — cold and flu remedies often contain it, and the doses add up.",
  );

  return {
    mode,
    weightKg: weight,
    recommendedDoseMg: recommendedDose,
    lastDose,
    dosesTaken: Math.round(doses),
    mgPerDose: perDose,
    intervalHours: interval,
    intervalMinutes,
    dailyMaxMg: ceiling,
    takenMg,
    remainingMg: remainingMg > 0 ? remainingMg : 0,
    remainingDoses,
    dosesLeftByMg,
    dosesLeftBySpacing,
    limitingFactor,
    overLimit,
    atLimit,
    nextDoseMinutes,
    twentyFourHourResetMinutes,
    schedule,
    countdown,
    warnings,
    usedShare: (takenMg / ceiling) * 100,
    // Clamped to 0-100 so it can be used directly as a bar width.
    usedShareCapped: Math.max(0, Math.min(100, (takenMg / ceiling) * 100)),
  };
}
