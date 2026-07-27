/**
 * Headphone listening break timer.
 *
 * Two independent pieces of maths, both pure:
 *
 * 1. Schedule: a session is a repeating cycle of one listening block followed by one rest
 *    block, truncated at the end of the session. The commonly given "60/60" guidance —
 *    no more than about 60 minutes of continuous listening, then a rest — is the default.
 *
 * 2. Dose: the WHO-ITU safe listening standard (Recommendation ITU-T H.870) allows
 *    80 dB(A) for 40 hours a week for adults, with sound energy doubling every 3 dB, so
 *    the permitted duration halves for every 3 dB you turn up. Spread evenly that is
 *    40 / 7 hours a day at 80 dB(A). Listening time during rest blocks does not count.
 *
 * Informational only — not a hearing test and not medical advice.
 */

/** WHO-ITU H.870 adult reference level, dB(A). */
export const REFERENCE_LEVEL_DB = 80;

/** WHO-ITU H.870 reference duration for that level, in hours per week. */
export const REFERENCE_HOURS_PER_WEEK = 40;

/** Equal-energy exchange rate: +3 dB halves the permitted duration. */
export const EXCHANGE_RATE_DB = 3;

export const DAYS_PER_WEEK = 7;
export const SECONDS_PER_MINUTE = 60;

/** Default cycle from the widely used 60/60 listening guidance. */
export const DEFAULT_LISTEN_MINUTES = 60;
export const DEFAULT_BREAK_MINUTES = 5;

/** Practical input limits. */
export const MIN_LISTEN_MINUTES = 5;
export const MAX_LISTEN_MINUTES = 240;
export const MIN_BREAK_MINUTES = 1;
export const MAX_BREAK_MINUTES = 60;
export const MAX_SESSION_MINUTES = 720; // 12 hours is the longest session worth planning

export const MIN_LEVEL_DB = 40;
export const MAX_LEVEL_DB = 130;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Minutes of listening a day that stay inside the WHO-ITU weekly allowance at a given level. */
export function safeDailyMinutes(levelDb) {
  if (!isNum(levelDb)) return NaN;
  const weeklyHours =
    REFERENCE_HOURS_PER_WEEK * 2 ** ((REFERENCE_LEVEL_DB - levelDb) / EXCHANGE_RATE_DB);
  return (weeklyHours / DAYS_PER_WEEK) * SECONDS_PER_MINUTE;
}

/** Formats a duration in whole seconds as mm:ss, or h:mm:ss past an hour. */
export function formatClock(totalSeconds) {
  const safe = isNum(totalSeconds) && totalSeconds > 0 ? Math.round(totalSeconds) : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Builds the listen/rest segment plan for a session.
 *
 * @returns {{error:string}|{
 *   segments:Array<{index:number,type:"listen"|"break",startMinute:number,endMinute:number,minutes:number}>,
 *   listeningMinutes:number, breakMinutes:number, sessionMinutes:number,
 *   cycleMinutes:number, breakCount:number, listenBlockCount:number
 * }}
 */
export function buildSchedule({
  sessionMinutes = 180,
  listenMinutes = DEFAULT_LISTEN_MINUTES,
  breakMinutes = DEFAULT_BREAK_MINUTES,
} = {}) {
  if (![sessionMinutes, listenMinutes, breakMinutes].every(isNum)) {
    return { error: "Enter valid numbers for session, listening block and break length." };
  }
  if (sessionMinutes <= 0 || sessionMinutes > MAX_SESSION_MINUTES) {
    return { error: `Session length must be between 1 and ${MAX_SESSION_MINUTES} minutes.` };
  }
  if (listenMinutes < MIN_LISTEN_MINUTES || listenMinutes > MAX_LISTEN_MINUTES) {
    return {
      error: `Listening block must be between ${MIN_LISTEN_MINUTES} and ${MAX_LISTEN_MINUTES} minutes.`,
    };
  }
  if (breakMinutes < MIN_BREAK_MINUTES || breakMinutes > MAX_BREAK_MINUTES) {
    return {
      error: `Break must be between ${MIN_BREAK_MINUTES} and ${MAX_BREAK_MINUTES} minutes.`,
    };
  }

  const segments = [];
  let cursor = 0;
  let listeningMinutes = 0;
  let restMinutes = 0;
  let index = 0;
  let listening = true;

  while (cursor < sessionMinutes) {
    const wanted = listening ? listenMinutes : breakMinutes;
    const minutes = Math.min(wanted, sessionMinutes - cursor);
    index += 1;
    segments.push({
      index,
      type: listening ? "listen" : "break",
      startMinute: cursor,
      endMinute: cursor + minutes,
      minutes,
    });
    if (listening) listeningMinutes += minutes;
    else restMinutes += minutes;
    cursor += minutes;
    listening = !listening;
  }

  return {
    segments,
    listeningMinutes,
    breakMinutes: restMinutes,
    sessionMinutes,
    cycleMinutes: listenMinutes + breakMinutes,
    breakCount: segments.filter((segment) => segment.type === "break").length,
    listenBlockCount: segments.filter((segment) => segment.type === "listen").length,
  };
}

/**
 * Pure timer state for a given elapsed time. Nothing here reads the clock — the caller
 * supplies elapsedSeconds, which makes the whole function testable and deterministic.
 *
 * @returns {{error:string}|{
 *   phase:"listen"|"break"|"done", remainingSeconds:number, phaseSeconds:number,
 *   phaseProgress:number, cycleNumber:number, listenedSeconds:number,
 *   restedSeconds:number, sessionRemainingSeconds:number, done:boolean
 * }}
 */
export function timerState({
  elapsedSeconds = 0,
  listenSeconds = DEFAULT_LISTEN_MINUTES * SECONDS_PER_MINUTE,
  breakSeconds = DEFAULT_BREAK_MINUTES * SECONDS_PER_MINUTE,
  sessionSeconds = 180 * SECONDS_PER_MINUTE,
} = {}) {
  if (![elapsedSeconds, listenSeconds, breakSeconds, sessionSeconds].every(isNum)) {
    return { error: "Timer inputs must be numbers." };
  }
  if (listenSeconds <= 0 || breakSeconds <= 0 || sessionSeconds <= 0) {
    return { error: "Session, listening block and break must all be longer than zero." };
  }

  const elapsed = Math.max(0, Math.min(elapsedSeconds, sessionSeconds));
  const cycle = listenSeconds + breakSeconds;
  const completedCycles = Math.floor(elapsed / cycle);
  const positionInCycle = elapsed - completedCycles * cycle;
  const inListen = positionInCycle < listenSeconds;

  const listenedSeconds =
    completedCycles * listenSeconds + Math.min(positionInCycle, listenSeconds);
  const restedSeconds = elapsed - listenedSeconds;
  const sessionRemainingSeconds = sessionSeconds - elapsed;
  const done = elapsed >= sessionSeconds;

  const phaseSeconds = inListen ? listenSeconds : breakSeconds;
  const phaseElapsed = inListen ? positionInCycle : positionInCycle - listenSeconds;
  const rawRemaining = phaseSeconds - phaseElapsed;
  const remainingSeconds = done ? 0 : Math.min(rawRemaining, sessionRemainingSeconds);

  return {
    phase: done ? "done" : inListen ? "listen" : "break",
    remainingSeconds,
    phaseSeconds,
    phaseProgress: phaseSeconds > 0 ? Math.min(1, phaseElapsed / phaseSeconds) : 0,
    cycleNumber: completedCycles + 1,
    listenedSeconds,
    restedSeconds,
    sessionRemainingSeconds,
    done,
  };
}

/** How much of the day's safe listening allowance a number of listened minutes uses at a level. */
export function doseUsed(listenedMinutes, levelDb) {
  const allowance = safeDailyMinutes(levelDb);
  if (!isNum(listenedMinutes) || !isNum(allowance) || allowance <= 0) return null;
  if (listenedMinutes < 0) return null;
  return {
    allowanceMinutes: allowance,
    usedMinutes: listenedMinutes,
    usedPercent: (listenedMinutes / allowance) * 100,
    withinAllowance: listenedMinutes <= allowance,
  };
}
