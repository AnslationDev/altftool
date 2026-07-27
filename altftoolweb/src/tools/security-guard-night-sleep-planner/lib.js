/**
 * Daytime sleep planner for overnight security shifts.
 *
 * Three schedules are laid out from the same inputs, all by simple addition on a timeline
 * anchored to the morning the shift ends:
 *
 *   IMMEDIATE  sleep starts at shift end + commute home + a short wind-down, and runs for the
 *              full sleep target. Easiest to fall asleep (sleep pressure is highest) but the
 *              afternoon wake time leaves a long stretch awake before the next shift.
 *   DELAYED    sleep ends just before you need to get up for the next shift, so you start the
 *              night freshly awake. Harder to fall asleep because the body clock is pushing wake.
 *   SPLIT      an anchor sleep after the shift plus a second nap before it. Total sleep is the
 *              same but it is split into two easier-to-obtain chunks.
 *
 * Constants and where they come from:
 *  - AASM / Sleep Research Society consensus (SLEEP, 2015): adults need 7 or more hours per
 *    24 hours; night workers commonly average 1-4 hours less, which is the deficit this flags.
 *  - Caffeine has a half-life of roughly 5 hours, so a 6-hour gap before planned sleep leaves
 *    about a quarter of the dose circulating. Shift-work fatigue training (NIOSH) recommends
 *    avoiding caffeine in the later part of a night shift for the same reason.
 *  - Morning daylight is the strongest signal that advances the body clock, so the commute home
 *    after a night shift is done in dark wrap-around sunglasses to protect day sleep.
 *  - WHO Night Noise Guidelines: about 30 dB(A) indoors is the level at which sleep is
 *    generally undisturbed; 40 dB Lnight outdoors is the health-based target.
 *  - Common sleep-environment guidance puts the bedroom at roughly 16-19 degrees C.
 *
 * Pure module: times arrive as "HH:MM" strings and nothing reads the system clock.
 */

export const MINUTES_PER_DAY = 1440;

export const ADULT_MIN_SLEEP_H = 7;
export const DEFAULT_SLEEP_LATENCY_MIN = 15;

/** Short decompression period between arriving home and lights-out. */
export const POST_SHIFT_WIND_DOWN_MIN = 30;

/** Time awake between the alarm and leaving for the next shift, on top of commute and prep. */
export const PRE_SHIFT_BUFFER_MIN = 60;

/** Last caffeine this long before planned sleep onset. */
export const CAFFEINE_CUTOFF_BEFORE_SLEEP_H = 6;

/** Bedroom environment targets. */
export const BEDROOM_MAX_INDOOR_NOISE_DBA = 30; // WHO: undisturbed sleep indoors
export const BEDROOM_TEMP_MIN_C = 16;
export const BEDROOM_TEMP_MAX_C = 19;
export const BEDROOM_MAX_LIGHT_LUX = 5; // effectively blackout; overcast daylight is 1000+ lux

/** Being awake beyond this before starting a shift measurably degrades alertness. */
export const LONG_WAKEFULNESS_WARN_MIN = 16 * 60;

const pad2 = (n) => String(n).padStart(2, "0");

export function parseTimeToMinutes(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

export function toClock(absoluteMinutes) {
  if (!Number.isFinite(absoluteMinutes)) return null;
  const rounded = Math.round(absoluteMinutes);
  const dayOffset = Math.floor(rounded / MINUTES_PER_DAY);
  const within = rounded - dayOffset * MINUTES_PER_DAY;
  const h = Math.floor(within / 60);
  const m = within % 60;
  const time = `${pad2(h)}:${pad2(m)}`;
  return { minutes: rounded, minutesOfDay: within, dayOffset, time };
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

const segment = (label, startAbs, inBedMin, latencyMin) => ({
  label,
  start: toClock(startAbs),
  end: toClock(startAbs + inBedMin),
  inBedMin,
  sleepMin: Math.max(0, inBedMin - latencyMin),
});

/**
 * @param {object} input
 * @param {string} input.shiftStart        "HH:MM" the night shift begins
 * @param {string} input.shiftEnd          "HH:MM" the night shift ends
 * @param {number} input.commuteHomeMin    travel home after the shift
 * @param {number} input.commuteToWorkMin  travel to the next shift
 * @param {number} input.prepMin           getting ready before leaving for the shift
 * @param {number} input.targetSleepH      total sleep aimed for in the 24 hours
 * @param {number} [input.anchorSleepH]    length of the after-shift block in the split plan
 * @param {number} [input.sleepLatencyMin] minutes you take to fall asleep
 */
export function planGuardSleep({
  shiftStart,
  shiftEnd,
  commuteHomeMin,
  commuteToWorkMin,
  prepMin,
  targetSleepH,
  anchorSleepH = 4,
  sleepLatencyMin = DEFAULT_SLEEP_LATENCY_MIN,
}) {
  const startMoD = parseTimeToMinutes(shiftStart);
  const endMoD = parseTimeToMinutes(shiftEnd);
  if (startMoD === null || endMoD === null) {
    return { error: "Enter shift times as HH:MM, for example 22:00 and 06:00." };
  }

  const numbers = { commuteHomeMin, commuteToWorkMin, prepMin, targetSleepH, anchorSleepH, sleepLatencyMin };
  for (const key of Object.keys(numbers)) {
    if (typeof numbers[key] !== "number" || !Number.isFinite(numbers[key])) {
      return { error: "Enter a valid number in every field." };
    }
  }
  if (commuteHomeMin < 0 || commuteToWorkMin < 0 || prepMin < 0 || sleepLatencyMin < 0) {
    return { error: "Times cannot be negative." };
  }
  if (commuteHomeMin > 300 || commuteToWorkMin > 300) return { error: "Commute over 5 hours — check the value." };
  if (prepMin > 240) return { error: "Getting-ready time over 4 hours — check the value." };
  if (sleepLatencyMin > 180) return { error: "Sleep-onset time over 3 hours — check the value." };
  if (targetSleepH < 4 || targetSleepH > 12) return { error: "Set a sleep target between 4 and 12 hours." };

  const shiftLengthMin = ((endMoD - startMoD) % MINUTES_PER_DAY + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  if (shiftLengthMin === 0) return { error: "Shift start and end cannot be the same time." };
  if (shiftLengthMin > 16 * 60) return { error: "A shift longer than 16 hours leaves no workable sleep plan." };

  if (anchorSleepH <= 0 || anchorSleepH >= targetSleepH) {
    return { error: "The after-shift block in the split plan must be shorter than the total sleep target." };
  }

  // Timeline: minute 0 is midnight of the morning the shift ends.
  const shiftEndAbs = endMoD;
  const nextShiftStartAbs = startMoD > endMoD ? startMoD : startMoD + MINUTES_PER_DAY;

  const totalInBedMin = targetSleepH * 60 + sleepLatencyMin;
  const homeAtAbs = shiftEndAbs + commuteHomeMin;
  const earliestSleepAbs = homeAtAbs + POST_SHIFT_WIND_DOWN_MIN;
  const mustBeUpAbs = nextShiftStartAbs - (commuteToWorkMin + prepMin + PRE_SHIFT_BUFFER_MIN);

  const availableWindowMin = mustBeUpAbs - earliestSleepAbs;
  if (availableWindowMin <= 0) {
    return {
      error:
        "There is no gap between getting home and leaving for the next shift. Check the shift times and the commute figures.",
    };
  }

  const buildOption = (key, label, segments, blurb) => {
    const totalSleepMin = segments.reduce((sum, s) => sum + s.sleepMin, 0);
    const lastEnd = segments[segments.length - 1].end.minutes;
    const firstStart = segments[0].start.minutes;
    let overlaps = false;
    for (let i = 1; i < segments.length; i += 1) {
      if (segments[i].start.minutes < segments[i - 1].end.minutes) overlaps = true;
    }
    return {
      key,
      label,
      blurb,
      segments,
      totalSleepMin,
      totalInBedMin: segments.reduce((sum, s) => sum + s.inBedMin, 0),
      caffeineCutoff: toClock(firstStart - CAFFEINE_CUTOFF_BEFORE_SLEEP_H * 60),
      sunglassesFrom: toClock(shiftEndAbs),
      sunglassesUntil: toClock(firstStart),
      awakeBeforeShiftMin: nextShiftStartAbs - lastEnd,
      overlaps,
      fits: !overlaps && firstStart >= earliestSleepAbs && lastEnd <= mustBeUpAbs,
    };
  };

  const immediate = buildOption(
    "immediate",
    "Sleep immediately after the shift",
    [segment("Main sleep", earliestSleepAbs, totalInBedMin, sleepLatencyMin)],
    "Highest sleep pressure, so it is the easiest to fall asleep — but you wake in the afternoon and face a long stretch awake before the next shift.",
  );

  const delayed = buildOption(
    "delayed",
    "Delayed sleep before the shift",
    [segment("Main sleep", mustBeUpAbs - totalInBedMin, totalInBedMin, sleepLatencyMin)],
    "You start the night freshly awake, which suits long or high-vigilance posts. Falling asleep is harder because you go to bed when the body clock is pushing for wake.",
  );

  const anchorInBed = anchorSleepH * 60 + sleepLatencyMin;
  const napInBed = (targetSleepH - anchorSleepH) * 60 + sleepLatencyMin;
  const split = buildOption(
    "split",
    "Split: anchor sleep plus pre-shift nap",
    [
      segment("Anchor sleep", earliestSleepAbs, anchorInBed, sleepLatencyMin),
      segment("Pre-shift nap", mustBeUpAbs - napInBed, napInBed, sleepLatencyMin),
    ],
    "Two shorter blocks are often easier to actually obtain than one long daytime sleep, and the nap lands the alertness boost close to the shift.",
  );

  const warnings = [];
  if (targetSleepH < ADULT_MIN_SLEEP_H) {
    warnings.push(
      `A ${targetSleepH}-hour target is below the ${ADULT_MIN_SLEEP_H}-hour minimum the AASM recommends per 24 hours. Night workers already lose sleep to daylight and noise, so aim higher where the roster allows.`,
    );
  }
  if (availableWindowMin < totalInBedMin) {
    warnings.push(
      `Only ${formatDuration(availableWindowMin)} exists between getting home and leaving again, but the plan needs ${formatDuration(totalInBedMin)} in bed. Something has to give — usually the pre-shift buffer or the sleep target.`,
    );
  }
  if (immediate.awakeBeforeShiftMin > LONG_WAKEFULNESS_WARN_MIN) {
    warnings.push(
      `On the immediate plan you would be awake ${formatDuration(immediate.awakeBeforeShiftMin)} before the shift even starts. The split or delayed plan keeps alertness closer to the post.`,
    );
  }
  if (shiftLengthMin >= 12 * 60) {
    warnings.push("On 12-hour nights, take the pre-shift nap option if the roster allows — alertness falls sharply in the last quarter of a long shift.");
  }

  return {
    shiftStart: toClock(startMoD),
    shiftEnd: toClock(endMoD),
    shiftLengthMin,
    homeAt: toClock(homeAtAbs),
    earliestSleep: toClock(earliestSleepAbs),
    mustBeUpBy: toClock(mustBeUpAbs),
    availableWindowMin,
    totalInBedMin,
    targetSleepMin: targetSleepH * 60,
    sleepDeficitMin: Math.max(0, ADULT_MIN_SLEEP_H * 60 - targetSleepH * 60),
    options: { immediate, delayed, split },
    environment: {
      noiseDbA: BEDROOM_MAX_INDOOR_NOISE_DBA,
      tempMinC: BEDROOM_TEMP_MIN_C,
      tempMaxC: BEDROOM_TEMP_MAX_C,
      lightLux: BEDROOM_MAX_LIGHT_LUX,
    },
    warnings,
  };
}
