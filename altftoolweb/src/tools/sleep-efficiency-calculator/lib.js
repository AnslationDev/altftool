/**
 * Sleep efficiency maths, following the standard consensus sleep-diary
 * definitions used in insomnia research and in CBT-I (cognitive behavioural
 * therapy for insomnia).
 *
 *   Time in bed (TIB)   = time you got out of bed - time you got into bed
 *   Total sleep time    = TIB - sleep-onset latency - wake after sleep onset
 *                             - time awake in bed before rising
 *   Sleep efficiency %  = total sleep time / time in bed x 100
 *
 * Nothing here reads the system clock; all times come in as "HH:MM" strings.
 */

export const MINUTES_PER_DAY = 1440;

/**
 * Sleep efficiency of 85% or more is the usual cut-off for "normal" in adult
 * sleep-diary work, and is the level CBT-I protocols aim to restore before
 * time in bed is extended again. 90% and above is generally treated as
 * consolidated, efficient sleep.
 */
export const EFFICIENCY_HEALTHY = 85;
export const EFFICIENCY_EXCELLENT = 90;
/** Below this, sleep is markedly fragmented on a diary. */
export const EFFICIENCY_POOR = 75;

/** Sleep-onset latency of 30 minutes or more is a standard insomnia criterion. */
export const ONSET_CONCERN_MINUTES = 30;
/** Wake after sleep onset of 30 minutes or more is the matching criterion. */
export const WASO_CONCERN_MINUTES = 30;

/**
 * Sleep restriction therapy: the prescribed time-in-bed window is set close to
 * the person's average total sleep time (commonly with a small buffer), and is
 * never cut below 5 hours because shorter windows cause excessive daytime
 * sleepiness.
 */
export const CBTI_BUFFER_MINUTES = 30;
export const CBTI_MIN_WINDOW_MINUTES = 300;
/** Standard weekly titration step once efficiency is measured. */
export const CBTI_STEP_MINUTES = 15;

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

/** Format a duration in minutes as "7h 05m". */
export function formatDuration(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) return "0h 00m";
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

/** Format minutes past midnight as a 12-hour clock string. */
export function formatClock12(minutes) {
  if (!Number.isFinite(minutes)) return "—";
  const m = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours24 = Math.floor(m / 60);
  const suffix = hours24 >= 12 ? "pm" : "am";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(m % 60).padStart(2, "0")} ${suffix}`;
}

/** Minutes from bedtime forward to rise time across midnight (1..1440). */
export function timeInBedMinutes(bedMinutes, riseMinutes) {
  const diff = ((riseMinutes - bedMinutes) % MINUTES_PER_DAY + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return diff === 0 ? MINUTES_PER_DAY : diff;
}

/** Band an efficiency percentage into a plain-language rating. */
export function rateEfficiency(efficiency) {
  if (!Number.isFinite(efficiency)) return { id: "unknown", label: "Unknown" };
  if (efficiency >= EFFICIENCY_EXCELLENT) {
    return { id: "excellent", label: "Excellent — sleep is well consolidated" };
  }
  if (efficiency >= EFFICIENCY_HEALTHY) {
    return { id: "healthy", label: "Healthy — at or above the 85% benchmark" };
  }
  if (efficiency >= EFFICIENCY_POOR) {
    return { id: "low", label: "Below target — noticeable time awake in bed" };
  }
  return { id: "poor", label: "Poor — most of the night is fragmented" };
}

/** Round a minute count to the nearest 15-minute step. */
function roundToStep(minutes, step = CBTI_STEP_MINUTES) {
  return Math.round(minutes / step) * step;
}

/**
 * Compute sleep efficiency and the supporting sleep-diary figures for one night.
 *
 * @param {object} input
 * @param {string} input.bedTime "HH:MM" — when you got into bed.
 * @param {string} input.riseTime "HH:MM" — when you finally got out of bed.
 * @param {number} input.onsetMinutes Minutes taken to fall asleep.
 * @param {number} input.wasoMinutes Total minutes awake during the night after first falling asleep.
 * @param {number} [input.earlyWakeMinutes] Minutes awake in bed after the final awakening, before rising.
 * @param {number} [input.awakenings] Number of times you woke up.
 * @returns {object} results or { error }
 */
export function computeSleepEfficiency({
  bedTime,
  riseTime,
  onsetMinutes,
  wasoMinutes,
  earlyWakeMinutes = 0,
  awakenings = 0,
} = {}) {
  const bed = parseClock(bedTime);
  const rise = parseClock(riseTime);
  if (bed === null) return { error: "Enter a valid bedtime in 24-hour HH:MM form." };
  if (rise === null) return { error: "Enter a valid get-up time in 24-hour HH:MM form." };
  if (bed === rise) return { error: "Bedtime and get-up time cannot be identical." };

  const onset = Number(onsetMinutes);
  const waso = Number(wasoMinutes);
  const earlyWake = Number(earlyWakeMinutes);
  const wakeCount = Number(awakenings);

  if (![onset, waso, earlyWake, wakeCount].every((value) => Number.isFinite(value))) {
    return { error: "Enter minutes as numbers in every field." };
  }
  if (onset < 0 || waso < 0 || earlyWake < 0 || wakeCount < 0) {
    return { error: "Minutes and awakenings cannot be negative." };
  }

  const tib = timeInBedMinutes(bed, rise);
  const awake = Math.round(onset) + Math.round(waso) + Math.round(earlyWake);

  if (awake >= tib) {
    return {
      error: `Time awake (${formatDuration(awake)}) is not less than time in bed (${formatDuration(tib)}) — check the entries.`,
    };
  }

  const tst = tib - awake;
  const efficiency = (tst / tib) * 100;
  const rating = rateEfficiency(efficiency);

  // CBT-I style prescribed window: total sleep time plus a small buffer,
  // rounded to a 15-minute step and floored at the 5-hour minimum.
  const prescribedWindow = Math.max(
    CBTI_MIN_WINDOW_MINUTES,
    roundToStep(tst + CBTI_BUFFER_MINUTES),
  );
  const windowChange = prescribedWindow - tib;

  let titration;
  if (efficiency >= EFFICIENCY_EXCELLENT) {
    titration = `Efficiency is at or above ${EFFICIENCY_EXCELLENT}% — a window ${CBTI_STEP_MINUTES} minutes longer is the usual next step.`;
  } else if (efficiency >= EFFICIENCY_HEALTHY) {
    titration = `Efficiency is in the ${EFFICIENCY_HEALTHY}-${EFFICIENCY_EXCELLENT}% band — hold the current window steady.`;
  } else {
    titration = `Efficiency is under ${EFFICIENCY_HEALTHY}% — sleep restriction protocols trim the window by about ${CBTI_STEP_MINUTES} minutes.`;
  }

  const flags = [];
  if (Math.round(onset) >= ONSET_CONCERN_MINUTES) {
    flags.push(`Falling asleep takes ${Math.round(onset)} minutes (${ONSET_CONCERN_MINUTES}+ is the insomnia threshold).`);
  }
  if (Math.round(waso) + Math.round(earlyWake) >= WASO_CONCERN_MINUTES) {
    flags.push(
      `${formatDuration(Math.round(waso) + Math.round(earlyWake))} awake after first falling asleep (${WASO_CONCERN_MINUTES}+ minutes is the threshold).`,
    );
  }

  return {
    bed,
    rise,
    tib,
    tst,
    awake,
    onsetMinutes: Math.round(onset),
    wasoMinutes: Math.round(waso),
    earlyWakeMinutes: Math.round(earlyWake),
    awakenings: Math.round(wakeCount),
    efficiency,
    rating,
    prescribedWindow,
    windowChange,
    titration,
    flags,
    awakeShare: (awake / tib) * 100,
  };
}
