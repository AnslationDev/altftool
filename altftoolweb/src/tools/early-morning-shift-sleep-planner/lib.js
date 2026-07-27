/**
 * Early-morning shift sleep planner.
 *
 * Everything is derived by counting backwards from the shift start time:
 *   wake time      = shift start − commute − getting-ready time
 *   bedtime        = wake time − target sleep − sleep-onset latency
 *   wind-down start= bedtime − wind-down length
 *
 * Rule sources for the constants:
 *  - AASM / Sleep Research Society consensus (SLEEP, 2015): adults should sleep 7 or more
 *    hours per night on a regular basis; 7-9 h is the recommended range.
 *  - Normal sleep-onset latency in healthy adults is roughly 10-20 minutes, so 15 min is used
 *    as the default gap between lights-out and being asleep.
 *  - Drake et al. (J Clin Sleep Med, 2013) found caffeine taken 6 hours before bed still
 *    measurably disrupted sleep, so the default caffeine cutoff is 8 hours before bed.
 *  - Evening light suppresses melatonin; a 90-minute screen-dimming buffer before bed is the
 *    common sleep-hygiene recommendation.
 *
 * All maths is pure: times are passed in as "HH:MM" strings, never read from the clock.
 */

export const MINUTES_PER_DAY = 1440;

/** Normal healthy sleep-onset latency, minutes. */
export const DEFAULT_SLEEP_LATENCY_MIN = 15;

/** AASM/SRS consensus: 7 hours minimum, 9 hours upper end of the recommended adult range. */
export const RECOMMENDED_SLEEP_MIN_H = 7;
export const RECOMMENDED_SLEEP_MAX_H = 9;

/** Default wind-down (no work, no bright screens, low light) before lights-out. */
export const DEFAULT_WIND_DOWN_MIN = 45;

/** Caffeine cutoff before bed, hours. Caffeine's half-life is about 5 hours in most adults. */
export const CAFFEINE_CUTOFF_BEFORE_BED_H = 8;

/** Dim screens and overhead lights this long before lights-out, minutes. */
export const SCREEN_DIM_BEFORE_BED_MIN = 90;

/** Finish the last full meal this long before lights-out, minutes. */
export const LAST_MEAL_BEFORE_BED_MIN = 180;

/** A bedtime earlier than this is socially very hard to hold, so we flag it. */
export const VERY_EARLY_BEDTIME_MIN = 19 * 60; // 19:00

/** Recovery nap length that avoids waking from deep sleep (NASA/NIOSH short-nap guidance). */
export const SHORT_NAP_MIN = 20;
export const LONG_NAP_MIN = 90; // one full sleep cycle

const pad2 = (n) => String(n).padStart(2, "0");

/** "HH:MM" -> minutes after midnight, or null when malformed. */
export function parseTimeToMinutes(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (!Number.isInteger(h) || !Number.isInteger(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/**
 * Wrap a possibly negative minute offset into a clock time plus a day offset.
 * dayOffset -1 means "the previous calendar day".
 */
export function toClock(absoluteMinutes) {
  if (!Number.isFinite(absoluteMinutes)) return null;
  const rounded = Math.round(absoluteMinutes);
  const dayOffset = Math.floor(rounded / MINUTES_PER_DAY);
  const within = rounded - dayOffset * MINUTES_PER_DAY;
  const h = Math.floor(within / 60);
  const m = within % 60;
  return {
    minutes: rounded,
    minutesOfDay: within,
    dayOffset,
    time: `${pad2(h)}:${pad2(m)}`,
    label:
      dayOffset === 0
        ? `${pad2(h)}:${pad2(m)}`
        : `${pad2(h)}:${pad2(m)} (${dayOffset < 0 ? "previous day" : "next day"})`,
  };
}

export function formatDuration(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return "—";
  const mins = Math.round(totalMinutes);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/**
 * @param {object} input
 * @param {string} input.shiftStart      "HH:MM" on the shift day
 * @param {number} input.commuteMin      travel time to work, minutes
 * @param {number} input.prepMin         wash/dress/eat time after the alarm, minutes
 * @param {number} input.targetSleepH    hours of sleep you are aiming for
 * @param {number} [input.sleepLatencyMin] minutes you normally take to fall asleep
 * @param {number} [input.windDownMin]   length of the wind-down routine, minutes
 */
export function planEarlyShift({
  shiftStart,
  commuteMin,
  prepMin,
  targetSleepH,
  sleepLatencyMin = DEFAULT_SLEEP_LATENCY_MIN,
  windDownMin = DEFAULT_WIND_DOWN_MIN,
}) {
  const shiftMinutes = parseTimeToMinutes(shiftStart);
  if (shiftMinutes === null) return { error: "Enter the shift start time as HH:MM, for example 04:30." };

  const numbers = { commuteMin, prepMin, targetSleepH, sleepLatencyMin, windDownMin };
  for (const key of Object.keys(numbers)) {
    if (typeof numbers[key] !== "number" || !Number.isFinite(numbers[key])) {
      return { error: "Enter a valid number in every field." };
    }
  }
  if (commuteMin < 0 || prepMin < 0 || sleepLatencyMin < 0 || windDownMin < 0) {
    return { error: "Times cannot be negative." };
  }
  if (commuteMin > 300) return { error: "Commute over 5 hours — check the value." };
  if (prepMin > 240) return { error: "Getting-ready time over 4 hours — check the value." };
  if (targetSleepH < 3 || targetSleepH > 12) {
    return { error: "Set a sleep target between 3 and 12 hours." };
  }
  if (sleepLatencyMin > 180) return { error: "Sleep-onset time over 3 hours — check the value." };
  if (windDownMin > 240) return { error: "Wind-down longer than 4 hours — check the value." };

  const alarmToDoorMin = commuteMin + prepMin;
  const wakeMinutes = shiftMinutes - alarmToDoorMin;
  const timeInBedMin = targetSleepH * 60 + sleepLatencyMin;
  const bedtimeMinutes = wakeMinutes - timeInBedMin;

  const wake = toClock(wakeMinutes);
  const bedtime = toClock(bedtimeMinutes);
  const windDownStart = toClock(bedtimeMinutes - windDownMin);
  const caffeineCutoff = toClock(bedtimeMinutes - CAFFEINE_CUTOFF_BEFORE_BED_H * 60);
  const screensDimBy = toClock(bedtimeMinutes - SCREEN_DIM_BEFORE_BED_MIN);
  const lastMealBy = toClock(bedtimeMinutes - LAST_MEAL_BEFORE_BED_MIN);

  const warnings = [];
  if (targetSleepH < RECOMMENDED_SLEEP_MIN_H) {
    warnings.push(
      `Your target is below the ${RECOMMENDED_SLEEP_MIN_H}-hour minimum the AASM recommends for adults — plan a nap or move the bedtime earlier.`,
    );
  }
  if (bedtime.minutesOfDay < VERY_EARLY_BEDTIME_MIN && bedtime.minutesOfDay >= 12 * 60) {
    warnings.push(
      "That bedtime lands before 19:00, which is hard to protect socially. A 20-minute nap after the shift can cover part of the gap instead.",
    );
  }
  if (alarmToDoorMin < 20) {
    warnings.push("Under 20 minutes between the alarm and leaving is tight — most people need longer to become alert.");
  }
  if (windDownMin < 20) {
    warnings.push("A wind-down shorter than 20 minutes rarely gives the body time to settle.");
  }

  const sleepDebtMin = Math.max(0, RECOMMENDED_SLEEP_MIN_H * 60 - targetSleepH * 60);
  const napMin = sleepDebtMin === 0 ? 0 : Math.min(LONG_NAP_MIN, Math.max(SHORT_NAP_MIN, sleepDebtMin));

  return {
    shiftStart: toClock(shiftMinutes),
    wake,
    bedtime,
    windDownStart,
    caffeineCutoff,
    screensDimBy,
    lastMealBy,
    alarmToDoorMin,
    timeInBedMin,
    targetSleepMin: targetSleepH * 60,
    sleepLatencyMin,
    windDownMin,
    sleepDebtMin,
    napMin,
    withinRecommended:
      targetSleepH >= RECOMMENDED_SLEEP_MIN_H && targetSleepH <= RECOMMENDED_SLEEP_MAX_H,
    warnings,
  };
}
