/**
 * Senior sleep routine planner.
 *
 * The schedule is built backwards from the wake time, which is the anchor
 * sleep medicine tells people to keep fixed seven days a week.
 *
 * Reference points used:
 *  - Sleep need: the National Sleep Foundation consensus recommends 7-8 hours
 *    for older adults (65+) and 7-9 hours for adults aged 18-64.
 *  - Sleep efficiency: total sleep time divided by time in bed. 85% or more is
 *    the usual target, and it is the measure CBT-I uses to decide whether to
 *    extend or shorten time in bed.
 *  - Sleep restriction (CBT-I): prescribed time in bed is set near the average
 *    actual sleep time, conventionally plus about 30 minutes, and is never cut
 *    below 5.5 hours.
 *  - Caffeine: the half-life in adults averages about 5 hours and lengthens with
 *    age and with some medicines, so a cut-off 8 hours before bed leaves roughly
 *    a third of the dose still circulating.
 *  - Circadian phase advance: the body clock shifts earlier with age, which is
 *    why many older adults feel sleepy in the early evening and wake before dawn.
 *    Bright light in the evening, not the morning, is what pushes it later.
 */

export const MINUTES_PER_DAY = 1440;

/** Recommended nightly sleep, in hours. */
export const SLEEP_NEED_HOURS = { adult: { min: 7, max: 9 }, olderAdult: { min: 7, max: 8 } };

/** Age at which the older-adult sleep recommendation applies. */
export const OLDER_ADULT_AGE = 65;

/** Sleep efficiency target as a percentage. */
export const EFFICIENCY_TARGET = 85;

/** CBT-I never prescribes less time in bed than this, in hours. */
export const MIN_TIME_IN_BED_HOURS = 5.5;

/** Minutes added to average sleep time when prescribing time in bed. */
export const SLEEP_RESTRICTION_BUFFER_MIN = 30;

/** Caffeine half-life in hours, average adult. */
export const CAFFEINE_HALF_LIFE_HOURS = 5;

/** Offsets from lights-out, in minutes. */
export const OFFSETS = {
  windDown: 60, // screens off, lights down, calm activity
  eveningDimLight: 120,
  lastLargeDrink: 120, // reduces night-time toilet trips without cutting the daily total
  lastAlcohol: 180,
  lastCaffeine: 480, // 8 hours
  lastHeavyMeal: 180,
  lastVigorousExercise: 120,
};

/** Naps: keep them short and finish before mid-afternoon. */
export const NAP_RULES = { maxMinutes: 30, latestEndMinutes: 15 * 60 };

/** Morning light exposure window after waking, in minutes. */
export const MORNING_LIGHT_MINUTES = 60;

const TIME_PATTERN = /^([01]?\d|2[0-3]):([0-5]\d)$/;

export function parseTimeToMinutes(value) {
  if (typeof value !== "string") return NaN;
  const match = TIME_PATTERN.exec(value.trim());
  if (!match) return NaN;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function minutesToTime(minutes) {
  const n = Number(minutes);
  if (!Number.isFinite(n)) return "--:--";
  const wrapped = ((Math.round(n) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function minutesToClock12(minutes) {
  const n = Number(minutes);
  if (!Number.isFinite(n)) return "--:--";
  const wrapped = ((Math.round(n) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h24 = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  const suffix = h24 < 12 ? "am" : "pm";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatDuration(minutes) {
  const n = Math.max(0, Math.round(Number(minutes) || 0));
  const h = Math.floor(n / 60);
  const m = n % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/**
 * @param {object} input
 * @param {string} input.wakeTime "HH:MM" 24-hour
 * @param {number} input.ageYears
 * @param {number} input.targetSleepHours desired nightly sleep
 * @param {number} input.sleepLatencyMin usual minutes to fall asleep
 * @param {number} [input.napMinutes] usual daytime nap length
 * @param {number|null} [input.avgSleepHours] average actual sleep from a diary
 * @param {number|null} [input.timeInBedHours] average time in bed from a diary
 * @returns {object} schedule, or { error }
 */
export function planSeniorSleep({
  wakeTime,
  ageYears,
  targetSleepHours,
  sleepLatencyMin,
  napMinutes = 0,
  avgSleepHours = null,
  timeInBedHours = null,
} = {}) {
  const wake = parseTimeToMinutes(wakeTime);
  if (!Number.isFinite(wake)) return { error: "Enter a wake-up time in 24-hour HH:MM form." };

  const age = Number(ageYears);
  if (!Number.isFinite(age)) return { error: "Enter an age in years." };
  if (age < 18 || age > 110) return { error: "This planner covers adults aged 18 to 110." };

  const target = Number(targetSleepHours);
  if (!Number.isFinite(target)) return { error: "Enter a nightly sleep target in hours." };
  if (target < 4 || target > 12) return { error: "Set a nightly sleep target between 4 and 12 hours." };

  const latency = Number(sleepLatencyMin);
  if (!Number.isFinite(latency)) return { error: "Enter how long it usually takes to fall asleep." };
  if (latency < 0) return { error: "Time to fall asleep cannot be negative." };
  if (latency > 180) return { error: "Enter a time to fall asleep of 180 minutes or less." };

  const nap = Number(napMinutes);
  if (!Number.isFinite(nap) || nap < 0) return { error: "Nap length must be zero or more minutes." };
  if (nap > 240) return { error: "Enter a nap of 240 minutes or less." };

  const band = age >= OLDER_ADULT_AGE ? SLEEP_NEED_HOURS.olderAdult : SLEEP_NEED_HOURS.adult;
  const targetMinutes = Math.round(target * 60);
  const inBedMinutes = targetMinutes + Math.round(latency);
  const lightsOut = wake - inBedMinutes;

  const schedule = [
    { key: "morning-light", label: "Get outside or into bright light", at: wake, until: wake + MORNING_LIGHT_MINUTES, why: "Morning light within an hour of waking anchors the body clock and makes the evening sleep signal arrive on time." },
    { key: "last-caffeine", label: "Last tea, coffee or cola", at: lightsOut - OFFSETS.lastCaffeine, why: `Caffeine has a half-life of about ${CAFFEINE_HALF_LIFE_HOURS} hours, so a cup eight hours before bed still leaves roughly a third of it circulating.` },
    { key: "last-exercise", label: "Finish vigorous exercise", at: lightsOut - OFFSETS.lastVigorousExercise, why: "Hard exercise raises core temperature and alertness; gentle walking or stretching in the evening is fine." },
    { key: "last-meal", label: "Finish the last heavy meal", at: lightsOut - OFFSETS.lastHeavyMeal, why: "Lying down soon after a large meal worsens reflux, a common cause of waking in later life." },
    { key: "last-alcohol", label: "Last alcoholic drink", at: lightsOut - OFFSETS.lastAlcohol, why: "Alcohol shortens sleep onset but fragments the second half of the night and worsens snoring." },
    { key: "dim-light", label: "Dim the lights, screens down low", at: lightsOut - OFFSETS.eveningDimLight, why: "Bright evening light pushes the body clock later and suppresses melatonin." },
    { key: "last-drink", label: "Last large drink", at: lightsOut - OFFSETS.lastLargeDrink, why: "Front-loading fluids earlier in the day reduces night-time toilet trips without cutting the daily total." },
    { key: "wind-down", label: "Start the wind-down routine", at: lightsOut - OFFSETS.windDown, why: "A consistent hour of calm, dim, low-stimulation activity is the strongest behavioural cue for sleep." },
    { key: "lights-out", label: "Lights out, into bed", at: lightsOut, why: "Only go to bed at this point. Bed is for sleep, not for reading the news or waiting to feel tired." },
    { key: "asleep", label: "Expected to be asleep", at: lightsOut + Math.round(latency), why: `Based on the ${Math.round(latency)} minutes you usually take to drop off.` },
    { key: "wake", label: "Alarm, up and out of bed", at: wake, why: "Keep this time fixed seven days a week, including weekends. It is the single most powerful lever on sleep timing." },
  ].map((item) => ({
    ...item,
    time24: minutesToTime(item.at),
    time12: minutesToClock12(item.at),
    until24: item.until === undefined ? null : minutesToTime(item.until),
    until12: item.until === undefined ? null : minutesToClock12(item.until),
  }));

  const napPlan =
    nap > 0
      ? {
          minutes: Math.min(nap, NAP_RULES.maxMinutes),
          overLong: nap > NAP_RULES.maxMinutes,
          latestStart: NAP_RULES.latestEndMinutes - Math.min(nap, NAP_RULES.maxMinutes),
          latestStart24: minutesToTime(NAP_RULES.latestEndMinutes - Math.min(nap, NAP_RULES.maxMinutes)),
          latestStart12: minutesToClock12(NAP_RULES.latestEndMinutes - Math.min(nap, NAP_RULES.maxMinutes)),
          latestEnd24: minutesToTime(NAP_RULES.latestEndMinutes),
          latestEnd12: minutesToClock12(NAP_RULES.latestEndMinutes),
        }
      : null;

  let efficiency = null;
  if (
    avgSleepHours !== null &&
    avgSleepHours !== undefined &&
    avgSleepHours !== "" &&
    timeInBedHours !== null &&
    timeInBedHours !== undefined &&
    timeInBedHours !== ""
  ) {
    const slept = Number(avgSleepHours);
    const inBed = Number(timeInBedHours);
    if (!Number.isFinite(slept) || !Number.isFinite(inBed)) {
      return { error: "Enter the sleep diary figures as numbers of hours, or leave both blank." };
    }
    if (slept < 0 || inBed <= 0) return { error: "Sleep diary hours must be positive." };
    if (inBed > 24 || slept > 24) return { error: "Sleep diary hours cannot exceed 24." };
    if (slept > inBed) return { error: "Actual sleep cannot be longer than time in bed." };

    const percent = (slept / inBed) * 100;
    const prescribedMin = Math.max(
      MIN_TIME_IN_BED_HOURS * 60,
      slept * 60 + SLEEP_RESTRICTION_BUFFER_MIN,
    );
    efficiency = {
      percent: Math.round(percent * 10) / 10,
      meetsTarget: percent >= EFFICIENCY_TARGET,
      target: EFFICIENCY_TARGET,
      sleptMinutes: Math.round(slept * 60),
      inBedMinutes: Math.round(inBed * 60),
      awakeInBedMinutes: Math.round((inBed - slept) * 60),
      prescribedTimeInBedMinutes: Math.round(prescribedMin),
      prescribedLightsOut: minutesToTime(wake - Math.round(prescribedMin)),
      prescribedLightsOut12: minutesToClock12(wake - Math.round(prescribedMin)),
      floorApplied: slept * 60 + SLEEP_RESTRICTION_BUFFER_MIN < MIN_TIME_IN_BED_HOURS * 60,
    };
  }

  const notes = [];
  if (target < band.min || target > band.max) {
    notes.push(
      `The recommended range for ${age >= OLDER_ADULT_AGE ? "adults 65 and over" : "adults under 65"} is ${band.min} to ${band.max} hours a night; you have set ${target}.`,
    );
  }
  if (nap > NAP_RULES.maxMinutes) {
    notes.push(
      `A ${Math.round(nap)}-minute nap is long enough to enter deep sleep, which causes grogginess and eats into night-time sleep pressure. Cap naps at ${NAP_RULES.maxMinutes} minutes.`,
    );
  }
  if (latency > 30) {
    notes.push(
      "Taking more than 30 minutes to fall asleep on most nights is one of the definitions of insomnia. Get out of bed if you are still awake after about 20 minutes and return only when sleepy.",
    );
  }
  if (age >= OLDER_ADULT_AGE) {
    notes.push(
      "The body clock shifts earlier with age, so early evening sleepiness and pre-dawn waking are normal rather than a fault. Bright light in the early evening, not the morning, is what nudges it later.",
    );
  }

  return {
    wakeMinutes: wake,
    wake24: minutesToTime(wake),
    wake12: minutesToClock12(wake),
    ageYears: age,
    band,
    targetMinutes,
    latencyMinutes: Math.round(latency),
    inBedMinutes,
    lightsOutMinutes: lightsOut,
    lightsOut24: minutesToTime(lightsOut),
    lightsOut12: minutesToClock12(lightsOut),
    totalSleepWithNapMinutes: targetMinutes + Math.round(nap),
    schedule,
    napPlan,
    efficiency,
    notes,
  };
}
