/**
 * The 20-20-20 rule, turned into a session plan — pure logic, no DOM.
 *
 * The rule, credited to optometrist Jeffrey Anshel and repeated by the
 * American Academy of Ophthalmology and the American Optometric Association:
 * every 20 minutes of near work, look at something about 20 feet away for at
 * least 20 seconds. The point is to relax the ciliary muscle holding
 * accommodation at a near focus, and to give the blink reflex a chance to
 * re-wet the eye surface.
 */

/** The three twenties. */
export const WORK_INTERVAL_MINUTES = 20;
export const BREAK_SECONDS = 20;
export const DISTANCE_FEET = 20;
/** 20 feet = 6.096 metres (1 foot = 0.3048 m, exactly). */
export const METRES_PER_FOOT = 0.3048;
export const DISTANCE_METRES = DISTANCE_FEET * METRES_PER_FOOT;

/**
 * Why 20 feet: beyond roughly 6 metres the eye's accommodation is effectively
 * relaxed, which is also why 6 m (or its mirrored equivalent) is the standard
 * testing distance for a Snellen chart.
 */
export const OPTICAL_INFINITY_METRES = 6;

/**
 * Spontaneous blink rate is around 15-20 blinks a minute at rest and falls by
 * roughly half during concentrated screen work, which is the main reason
 * screen use leaves eyes feeling dry.
 */
export const RESTING_BLINK_RATE_PER_MIN = 15;
export const SCREEN_BLINK_RATE_PER_MIN = 7;

export const LIMITS = {
  sessionMinutes: { min: 5, max: 480 },
  workMinutes: { min: 5, max: 60 },
  breakSeconds: { min: 5, max: 120 },
};

export const PHASE_KINDS = {
  WORK: "work",
  BREAK: "break",
  DONE: "done",
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

function checkRange(value, bounds, label) {
  if (!isNum(value)) return `${label} must be a number.`;
  if (value < bounds.min) return `${label} cannot be below ${bounds.min}.`;
  if (value > bounds.max) return `${label} cannot be above ${bounds.max}.`;
  return null;
}

/** Seconds -> m:ss (h:mm:ss past an hour). Never NaN. */
export function formatClock(totalSeconds) {
  const safe = isNum(totalSeconds) && totalSeconds > 0 ? Math.round(totalSeconds) : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/** Feet to metres, rounded to one decimal. */
export function feetToMetres(feet) {
  if (!isNum(feet) || feet < 0) return 0;
  return Math.round(feet * METRES_PER_FOOT * 10) / 10;
}

/**
 * Plan a work session broken up by 20-20-20 pauses.
 * @returns {{error:string}|object}
 */
export function buildTwentyPlan({
  sessionMinutes = 120,
  workMinutes = WORK_INTERVAL_MINUTES,
  breakSeconds = BREAK_SECONDS,
} = {}) {
  const problem =
    checkRange(sessionMinutes, LIMITS.sessionMinutes, "Session length (minutes)") ||
    checkRange(workMinutes, LIMITS.workMinutes, "Work interval (minutes)") ||
    checkRange(breakSeconds, LIMITS.breakSeconds, "Break length (seconds)");
  if (problem) return { error: problem };

  const totalSeconds = Math.round(sessionMinutes * 60);
  const workSeconds = Math.round(workMinutes * 60);
  const restSeconds = Math.round(breakSeconds);
  const cycleSeconds = workSeconds + restSeconds;

  // A break only happens once a full work interval has been completed inside
  // the session, so partial trailing work does not earn one.
  const breaks = Math.floor(totalSeconds / cycleSeconds);
  const usedSeconds = breaks * cycleSeconds;
  const tailSeconds = totalSeconds - usedSeconds;

  const phases = [];
  for (let index = 1; index <= breaks; index += 1) {
    phases.push({
      kind: PHASE_KINDS.WORK,
      label: "Work",
      hint: "Screen time. Blink deliberately now and then — blink rate roughly halves while you concentrate.",
      seconds: workSeconds,
      cycle: index,
    });
    phases.push({
      kind: PHASE_KINDS.BREAK,
      label: `Look ${DISTANCE_FEET} feet away`,
      hint: `Eyes off the screen. Find something at least ${feetToMetres(DISTANCE_FEET)} m away — out of a window, down a corridor — and let your focus settle there.`,
      seconds: restSeconds,
      cycle: index,
    });
  }
  if (tailSeconds > 0) {
    phases.push({
      kind: PHASE_KINDS.WORK,
      label: "Work",
      hint: "Final stretch before the session ends.",
      seconds: tailSeconds,
      cycle: breaks + 1,
    });
  }

  const breakTotalSeconds = breaks * restSeconds;
  const screenSeconds = totalSeconds - breakTotalSeconds;
  const hours = totalSeconds / 3600;

  return {
    phases,
    totalSeconds,
    workSeconds,
    restSeconds,
    cycleSeconds,
    breaks,
    breakTotalSeconds,
    screenSeconds,
    tailSeconds,
    breaksPerHour: hours > 0 ? Math.round((breaks / hours) * 10) / 10 : 0,
    restSharePercent: totalSeconds > 0 ? Math.round((breakTotalSeconds / totalSeconds) * 1000) / 10 : 0,
    followsRule: workSeconds <= WORK_INTERVAL_MINUTES * 60 && restSeconds >= BREAK_SECONDS,
    longestUnbrokenMinutes: Math.round((Math.max(workSeconds, tailSeconds) / 60) * 10) / 10,
    /** Blinks "missed" over the session at the reduced screen-work blink rate. */
    blinksLostEstimate: Math.round(
      ((RESTING_BLINK_RATE_PER_MIN - SCREEN_BLINK_RATE_PER_MIN) * screenSeconds) / 60,
    ),
  };
}

/** Which phase is running at `elapsedSeconds`. Mirrors buildTwentyPlan output. */
export function phaseAt(phases, elapsedSeconds) {
  const list = Array.isArray(phases) ? phases : [];
  const total = list.reduce((sum, phase) => sum + (isNum(phase.seconds) ? phase.seconds : 0), 0);
  const t = isNum(elapsedSeconds) && elapsedSeconds > 0 ? elapsedSeconds : 0;

  if (list.length === 0) {
    return { index: -1, phase: null, remaining: 0, phaseProgress: 0, overallProgress: 0, done: true, breaksTaken: 0 };
  }

  let cursor = 0;
  let breaksTaken = 0;
  for (let index = 0; index < list.length; index += 1) {
    const phase = list[index];
    const length = isNum(phase.seconds) ? phase.seconds : 0;
    if (t < cursor + length || index === list.length - 1) {
      const finished = t >= total;
      if (finished) {
        breaksTaken = list.filter((item) => item.kind === PHASE_KINDS.BREAK).length;
        return {
          index: list.length,
          phase: {
            kind: PHASE_KINDS.DONE,
            label: "Session finished",
            hint: "Stand up, look out of a window, and give your eyes a longer rest before the next block.",
            seconds: 0,
            cycle: 0,
          },
          remaining: 0,
          phaseProgress: 1,
          overallProgress: 1,
          done: true,
          breaksTaken,
        };
      }
      const into = Math.min(Math.max(t - cursor, 0), length);
      return {
        index,
        phase,
        remaining: Math.max(0, length - into),
        phaseProgress: length > 0 ? into / length : 1,
        overallProgress: total > 0 ? Math.min(1, t / total) : 1,
        done: false,
        breaksTaken,
      };
    }
    if (phase.kind === PHASE_KINDS.BREAK) breaksTaken += 1;
    cursor += length;
  }

  return { index: list.length, phase: null, remaining: 0, phaseProgress: 1, overallProgress: 1, done: true, breaksTaken };
}
