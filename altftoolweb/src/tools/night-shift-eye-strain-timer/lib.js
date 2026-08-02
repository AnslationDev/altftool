/**
 * Eye breaks mapped across an overnight shift — pure logic, no DOM, no clock
 * reads. Every time is passed in as a 24-hour "HH:MM" string.
 *
 * Three facts shape the schedule:
 *
 * 1. The 20-20-20 rule: after at most 20 minutes of near work, look about 20
 *    feet (6.1 m) away for at least 20 seconds.
 * 2. The circadian nadir. Core body temperature and alertness bottom out in
 *    the early hours, conventionally taken as roughly 03:00 to 05:00. Errors,
 *    microsleeps and the subjective feeling of eye strain all cluster there,
 *    so breaks in that window are worth lengthening.
 * 3. Light in the biological night delays the body clock and suppresses
 *    melatonin. If you intend to sleep soon after the shift, the last stretch
 *    of screen time — and the commute home in daylight — is what most needs
 *    dimming.
 */

export const EYE_RULE_MINUTES = 20;
export const EYE_BREAK_SECONDS = 20;
export const EYE_BREAK_DISTANCE_METRES = 6.1;

/** Circadian low, in minutes past midnight: 03:00 to 05:00. */
export const CIRCADIAN_LOW_START_MINUTES = 3 * 60;
export const CIRCADIAN_LOW_END_MINUTES = 5 * 60;

/** Breaks inside the circadian low are lengthened by this factor. */
export const LOW_WINDOW_BREAK_MULTIPLIER = 3;

/**
 * Dark adaptation timings, for shifts where you look from a bright screen into
 * an unlit room: the cones settle in roughly the first 5 to 10 minutes, while
 * rod adaptation keeps improving for 20 to 30 minutes.
 */
export const CONE_ADAPTATION_MINUTES = 7;
export const ROD_ADAPTATION_MINUTES = 25;

export const MINUTES_PER_DAY = 1440;

export const LIMITS = {
  breakIntervalMinutes: { min: 5, max: 60 },
  breakSeconds: { min: 5, max: 300 },
  windDownMinutes: { min: 0, max: 240 },
  shiftMinutes: { min: 30, max: 16 * 60 },
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

function checkRange(value, bounds, label) {
  if (!isNum(value)) return `${label} must be a number.`;
  if (value < bounds.min) return `${label} cannot be below ${bounds.min}.`;
  if (value > bounds.max) return `${label} cannot be above ${bounds.max}.`;
  return null;
}

/** "HH:MM" -> minutes past midnight, or NaN. */
export function parseClock(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return NaN;
  return hours * 60 + minutes;
}

/** Minutes past midnight -> "HH:MM", wrapping over midnight. */
export function formatClock(minutesPastMidnight) {
  if (!isNum(minutesPastMidnight)) return "--:--";
  const wrapped = ((Math.round(minutesPastMidnight) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
}

/** Minutes -> "8h 00m" / "45m". Never NaN. */
export function formatDuration(totalMinutes) {
  const safe = isNum(totalMinutes) && totalMinutes > 0 ? Math.round(totalMinutes) : 0;
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  return hours === 0 ? `${minutes}m` : `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

/** Is a wall-clock minute inside the 03:00-05:00 circadian low? */
export function inCircadianLow(minutesPastMidnight) {
  if (!isNum(minutesPastMidnight)) return false;
  const wrapped = ((Math.round(minutesPastMidnight) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return wrapped >= CIRCADIAN_LOW_START_MINUTES && wrapped < CIRCADIAN_LOW_END_MINUTES;
}

/**
 * Lay the shift out with break times on the wall clock.
 * @returns {{error:string}|object}
 */
export function buildNightShiftPlan({
  startTime = "22:00",
  endTime = "06:00",
  breakIntervalMinutes = EYE_RULE_MINUTES,
  breakSeconds = EYE_BREAK_SECONDS,
  windDownMinutes = 60,
} = {}) {
  const start = parseClock(startTime);
  const end = parseClock(endTime);
  if (!isNum(start)) return { error: "Enter the shift start as a 24-hour time, for example 22:00." };
  if (!isNum(end)) return { error: "Enter the shift end as a 24-hour time, for example 06:00." };
  if (start === end) return { error: "Shift start and end cannot be the same time." };

  // An end time at or before the start means the shift runs past midnight.
  const durationMinutes = end > start ? end - start : end + MINUTES_PER_DAY - start;

  const problem =
    checkRange(durationMinutes, LIMITS.shiftMinutes, "Shift length (minutes)") ||
    checkRange(breakIntervalMinutes, LIMITS.breakIntervalMinutes, "Break interval (minutes)") ||
    checkRange(breakSeconds, LIMITS.breakSeconds, "Break length (seconds)") ||
    checkRange(windDownMinutes, LIMITS.windDownMinutes, "Screen wind-down (minutes)");
  if (problem) return { error: problem };

  const interval = Math.round(breakIntervalMinutes);
  const restSeconds = Math.round(breakSeconds);
  const windDown = Math.min(Math.round(windDownMinutes), durationMinutes);
  const windDownStartOffset = durationMinutes - windDown;

  const breaks = [];
  for (let offset = interval; offset < durationMinutes; offset += interval) {
    const wallMinutes = start + offset;
    const low = inCircadianLow(wallMinutes);
    breaks.push({
      offsetMinutes: offset,
      wallMinutes,
      clock: formatClock(wallMinutes),
      inLowWindow: low,
      inWindDown: windDown > 0 && offset >= windDownStartOffset,
      seconds: low ? restSeconds * LOW_WINDOW_BREAK_MULTIPLIER : restSeconds,
    });
  }

  const lowWindowBreaks = breaks.filter((item) => item.inLowWindow).length;
  const windDownBreaks = breaks.filter((item) => item.inWindDown).length;
  const eyeRestSeconds = breaks.reduce((sum, item) => sum + item.seconds, 0);

  // How much of the shift actually falls inside the 03:00-05:00 window.
  let lowWindowMinutes = 0;
  for (let offset = 0; offset < durationMinutes; offset += 1) {
    if (inCircadianLow(start + offset)) lowWindowMinutes += 1;
  }

  return {
    startMinutes: start,
    endMinutes: start + durationMinutes,
    durationMinutes,
    crossesMidnight: start + durationMinutes >= MINUTES_PER_DAY,
    interval,
    restSeconds,
    breaks,
    breakCount: breaks.length,
    lowWindowBreaks,
    windDownBreaks,
    eyeRestSeconds,
    lowWindowMinutes,
    coversCircadianLow: lowWindowMinutes > 0,
    windDownMinutes: windDown,
    windDownStartClock: formatClock(start + windDownStartOffset),
    restSharePercent:
      durationMinutes > 0
        ? Math.round((eyeRestSeconds / (durationMinutes * 60)) * 1000) / 10
        : 0,
    followsRule: interval <= EYE_RULE_MINUTES && restSeconds >= EYE_BREAK_SECONDS,
  };
}
