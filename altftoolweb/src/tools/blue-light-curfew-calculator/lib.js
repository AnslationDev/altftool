/**
 * Blue light curfew maths.
 *
 * Everything is done in "minutes past midnight" integers so the calculations are
 * pure and timezone-free. The caller supplies clock strings; nothing here reads
 * the system clock.
 */

/** Minutes in a full day. */
export const MINUTES_PER_DAY = 1440;

/**
 * Average length of one full NREM-REM sleep cycle in adults. Sleep physiology
 * texts put the cycle at roughly 90 minutes (range about 70-120 minutes), which
 * is why sleep is commonly planned in 90-minute blocks.
 */
export const SLEEP_CYCLE_MINUTES = 90;

/**
 * Screen-curfew presets, in minutes before lights-out.
 * 30-60 minutes is the common sleep-hygiene recommendation for putting bright
 * screens away; a 120-minute gap is the stricter option used when evening light
 * exposure is clearly delaying sleep onset.
 */
export const CURFEW_PRESETS = [
  { id: "light", label: "Light — 30 min", minutes: 30 },
  { id: "standard", label: "Standard — 60 min", minutes: 60 },
  { id: "strict", label: "Strict — 120 min", minutes: 120 },
];

/** Default lead time for switching devices to warm/night mode before the curfew. */
export const DEFAULT_NIGHT_MODE_LEAD_MINUTES = 60;

/** Typical time an adult takes to fall asleep once in bed (sleep-onset latency). */
export const DEFAULT_ONSET_MINUTES = 15;

/** Guard rails for the inputs. */
export const MIN_SLEEP_HOURS = 3;
export const MAX_SLEEP_HOURS = 14;
export const MAX_ONSET_MINUTES = 120;
export const MAX_CURFEW_MINUTES = 240;
export const MAX_NIGHT_MODE_LEAD_MINUTES = 240;

/**
 * Parse an "HH:MM" 24-hour clock string into minutes past midnight.
 * Returns null when the string is not a valid time.
 */
export function parseClock(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Wrap any minute value into the 0..1439 range. */
export function wrapMinutes(minutes) {
  if (!Number.isFinite(minutes)) return 0;
  const wrapped = Math.round(minutes) % MINUTES_PER_DAY;
  return wrapped < 0 ? wrapped + MINUTES_PER_DAY : wrapped;
}

/** Format minutes past midnight as a 24-hour "HH:MM" string. */
export function formatClock24(minutes) {
  const m = wrapMinutes(minutes);
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** Format minutes past midnight as a 12-hour clock, e.g. "10:45 pm". */
export function formatClock12(minutes) {
  const m = wrapMinutes(minutes);
  const hours24 = Math.floor(m / 60);
  const suffix = hours24 >= 12 ? "pm" : "am";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(m % 60).padStart(2, "0")} ${suffix}`;
}

/** Format a duration in minutes as "7h 30m". */
export function formatDuration(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) return "0m";
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Minutes from `fromMinutes` forward to `toMinutes` on a 24-hour wrap-around
 * clock. Always returns a value in 0..1439.
 */
export function minutesUntil(fromMinutes, toMinutes) {
  return wrapMinutes(toMinutes - fromMinutes);
}

/**
 * Build tonight's wind-down schedule from a target wake-up time.
 *
 * Chain (working backwards from the alarm):
 *   asleepBy      = wakeTime - sleepDuration
 *   lightsOut     = asleepBy - sleepOnsetLatency
 *   screenCurfew  = lightsOut - curfewMinutes
 *   nightModeAt   = screenCurfew - nightModeLeadMinutes
 *
 * @param {object} input
 * @param {string} input.wakeTime "HH:MM" 24-hour target wake-up time.
 * @param {number} input.sleepHours Target hours of actual sleep.
 * @param {number} [input.onsetMinutes] Minutes to fall asleep after lights out.
 * @param {number} [input.curfewMinutes] Minutes of no bright screens before lights out.
 * @param {number} [input.nightModeLeadMinutes] Extra lead time for warm/night mode.
 * @param {number|null} [input.nowMinutes] Optional current time (minutes past midnight)
 *        supplied by the caller, used only for "time remaining" figures.
 * @returns {object} schedule or { error }
 */
export function buildCurfewSchedule({
  wakeTime,
  sleepHours,
  onsetMinutes = DEFAULT_ONSET_MINUTES,
  curfewMinutes = 60,
  nightModeLeadMinutes = DEFAULT_NIGHT_MODE_LEAD_MINUTES,
  nowMinutes = null,
} = {}) {
  const wake = parseClock(wakeTime);
  if (wake === null) return { error: "Enter a valid wake-up time in 24-hour HH:MM form." };

  const hours = Number(sleepHours);
  if (!Number.isFinite(hours)) return { error: "Enter how many hours of sleep you are aiming for." };
  if (hours < MIN_SLEEP_HOURS || hours > MAX_SLEEP_HOURS) {
    return {
      error: `Target sleep should be between ${MIN_SLEEP_HOURS} and ${MAX_SLEEP_HOURS} hours.`,
    };
  }

  const onset = Number(onsetMinutes);
  if (!Number.isFinite(onset) || onset < 0 || onset > MAX_ONSET_MINUTES) {
    return { error: `Time to fall asleep should be between 0 and ${MAX_ONSET_MINUTES} minutes.` };
  }

  const curfew = Number(curfewMinutes);
  if (!Number.isFinite(curfew) || curfew < 0 || curfew > MAX_CURFEW_MINUTES) {
    return { error: `The screen curfew should be between 0 and ${MAX_CURFEW_MINUTES} minutes.` };
  }

  const nightLead = Number(nightModeLeadMinutes);
  if (!Number.isFinite(nightLead) || nightLead < 0 || nightLead > MAX_NIGHT_MODE_LEAD_MINUTES) {
    return {
      error: `Night-mode lead time should be between 0 and ${MAX_NIGHT_MODE_LEAD_MINUTES} minutes.`,
    };
  }

  const sleepMinutes = Math.round(hours * 60);
  const asleepBy = wrapMinutes(wake - sleepMinutes);
  const lightsOut = wrapMinutes(asleepBy - Math.round(onset));
  const screenCurfew = wrapMinutes(lightsOut - Math.round(curfew));
  const nightModeAt = wrapMinutes(screenCurfew - Math.round(nightLead));

  const timeInBed = sleepMinutes + Math.round(onset);
  const cycles = sleepMinutes / SLEEP_CYCLE_MINUTES;
  const wholeCycles = Math.floor(cycles);
  const cycleAlignedSleep = wholeCycles * SLEEP_CYCLE_MINUTES;
  const cycleAlignedLightsOut = wrapMinutes(wake - cycleAlignedSleep - Math.round(onset));

  const now = Number.isFinite(Number(nowMinutes)) && nowMinutes !== null ? wrapMinutes(nowMinutes) : null;

  const steps = [
    {
      id: "night-mode",
      label: "Switch to warm / night mode",
      at: nightModeAt,
      detail: "Drop screen brightness and turn on the warm colour filter.",
    },
    {
      id: "curfew",
      label: "Screens down (blue light curfew)",
      at: screenCurfew,
      detail: "Phone, laptop and TV away; keep the room dim from here on.",
    },
    {
      id: "lights-out",
      label: "Lights out, in bed",
      at: lightsOut,
      detail: "Room dark and quiet so sleep onset can begin.",
    },
    { id: "asleep", label: "Asleep by", at: asleepBy, detail: "Roughly when you should drift off." },
    { id: "wake", label: "Alarm", at: wake, detail: "Your target wake-up time." },
  ].map((step) => ({
    ...step,
    inMinutes: now === null ? null : minutesUntil(now, step.at),
  }));

  return {
    wake,
    asleepBy,
    lightsOut,
    screenCurfew,
    nightModeAt,
    sleepMinutes,
    onsetMinutes: Math.round(onset),
    curfewMinutes: Math.round(curfew),
    nightModeLeadMinutes: Math.round(nightLead),
    timeInBed,
    cycles,
    wholeCycles,
    cycleAlignedSleep,
    cycleAlignedLightsOut,
    screenFreeWindow: Math.round(curfew) + Math.round(onset),
    steps,
  };
}
