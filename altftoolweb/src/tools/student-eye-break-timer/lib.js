/**
 * Study pomodoros with eye rest built in — pure logic, no DOM, no clock reads.
 *
 * Two rules are combined:
 *
 * 1. The Pomodoro Technique (Francesco Cirillo): a 25 minute focused block, a
 *    short break of 3-5 minutes after each one, and a longer break of 15-30
 *    minutes after every four blocks.
 * 2. The 20-20-20 rule for digital eye strain: after at most 20 minutes of
 *    near work, look about 20 feet (6.1 m) away for at least 20 seconds.
 *
 * They do not line up. A 25 minute pomodoro runs five minutes past the eye
 * rule, so a short glance into the distance has to happen inside the block —
 * without stopping the study timer. This module works out how many of those
 * glances each pomodoro needs and lays the whole session out on the clock.
 */

/** Eye rule constants. */
export const EYE_RULE_MINUTES = 20;
export const EYE_BREAK_SECONDS = 20;
export const EYE_BREAK_DISTANCE_METRES = 6.1;

/** Classic pomodoro defaults. */
export const DEFAULT_POMODORO_MINUTES = 25;
export const DEFAULT_SHORT_BREAK_MINUTES = 5;
export const DEFAULT_LONG_BREAK_MINUTES = 15;
export const DEFAULT_POMODOROS_PER_SET = 4;

export const LIMITS = {
  pomodoroMinutes: { min: 5, max: 90 },
  shortBreakMinutes: { min: 1, max: 30 },
  longBreakMinutes: { min: 5, max: 60 },
  pomodorosPerSet: { min: 1, max: 8 },
  sets: { min: 1, max: 12 },
};

export const BLOCK_KINDS = {
  STUDY: "study",
  SHORT_BREAK: "shortBreak",
  LONG_BREAK: "longBreak",
};

/** Ready-made variants students actually use. */
export const STUDY_PRESETS = [
  {
    id: "classic",
    name: "Classic pomodoro",
    pomodoroMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    pomodorosPerSet: 4,
    note: "Cirillo's original 25/5 with a long break after four blocks.",
  },
  {
    id: "eyeSafe",
    name: "Eye-safe 20/5",
    pomodoroMinutes: 20,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    pomodorosPerSet: 4,
    note: "Trims the block to 20 minutes so the break itself satisfies the eye rule.",
  },
  {
    id: "deep",
    name: "Deep work 50/10",
    pomodoroMinutes: 50,
    shortBreakMinutes: 10,
    longBreakMinutes: 30,
    pomodorosPerSet: 3,
    note: "Longer blocks for essays and problem sets; needs two mid-block glances.",
  },
  {
    id: "exam",
    name: "Exam sprint 45/15",
    pomodoroMinutes: 45,
    shortBreakMinutes: 15,
    longBreakMinutes: 30,
    pomodorosPerSet: 3,
    note: "Matches a typical exam-paper section length.",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

function checkRange(value, bounds, label) {
  if (!isNum(value)) return `${label} must be a number.`;
  if (value < bounds.min) return `${label} cannot be below ${bounds.min}.`;
  if (value > bounds.max) return `${label} cannot be above ${bounds.max}.`;
  return null;
}

/** "HH:MM" -> minutes past midnight, or NaN. 24-hour clock only. */
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
  const wrapped = ((Math.round(minutesPastMidnight) % 1440) + 1440) % 1440;
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Minutes -> "2h 05m" / "45m". Never NaN. */
export function formatDuration(totalMinutes) {
  const safe = isNum(totalMinutes) && totalMinutes > 0 ? Math.round(totalMinutes) : 0;
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

/**
 * How many mid-block glances into the distance a study block of this length
 * needs. A 20 minute block needs none (the break that follows does the job);
 * a 25 minute block needs one; a 50 minute block needs two.
 */
export function eyeGlancesPerBlock(pomodoroMinutes) {
  if (!isNum(pomodoroMinutes) || pomodoroMinutes <= 0) return 0;
  return Math.max(0, Math.ceil(pomodoroMinutes / EYE_RULE_MINUTES) - 1);
}

/**
 * Lay out the whole revision session.
 * @returns {{error:string}|object}
 */
export function buildStudyPlan({
  startTime = "09:00",
  pomodoroMinutes = DEFAULT_POMODORO_MINUTES,
  shortBreakMinutes = DEFAULT_SHORT_BREAK_MINUTES,
  longBreakMinutes = DEFAULT_LONG_BREAK_MINUTES,
  pomodorosPerSet = DEFAULT_POMODOROS_PER_SET,
  sets = 2,
} = {}) {
  const startMinutes = parseClock(startTime);
  if (!isNum(startMinutes)) {
    return { error: "Enter a start time as a 24-hour clock time, for example 09:00." };
  }

  const problem =
    checkRange(pomodoroMinutes, LIMITS.pomodoroMinutes, "Study block (minutes)") ||
    checkRange(shortBreakMinutes, LIMITS.shortBreakMinutes, "Short break (minutes)") ||
    checkRange(longBreakMinutes, LIMITS.longBreakMinutes, "Long break (minutes)") ||
    checkRange(pomodorosPerSet, LIMITS.pomodorosPerSet, "Blocks before a long break") ||
    checkRange(sets, LIMITS.sets, "Number of sets");
  if (problem) return { error: problem };

  const perSet = Math.round(pomodorosPerSet);
  const setCount = Math.round(sets);
  const study = Math.round(pomodoroMinutes);
  const shortBreak = Math.round(shortBreakMinutes);
  const longBreak = Math.round(longBreakMinutes);

  const totalBlocks = perSet * setCount;
  const glancesPerBlock = eyeGlancesPerBlock(study);

  const blocks = [];
  let clock = startMinutes;
  for (let index = 1; index <= totalBlocks; index += 1) {
    blocks.push({
      kind: BLOCK_KINDS.STUDY,
      label: `Study block ${index}`,
      minutes: study,
      startsAt: clock,
      endsAt: clock + study,
      glances: glancesPerBlock,
      /** Minute marks inside the block where a glance is due. */
      glanceAt: Array.from({ length: glancesPerBlock }, (_, step) => (step + 1) * EYE_RULE_MINUTES),
    });
    clock += study;

    if (index === totalBlocks) break;

    const isSetEnd = index % perSet === 0;
    const length = isSetEnd ? longBreak : shortBreak;
    blocks.push({
      kind: isSetEnd ? BLOCK_KINDS.LONG_BREAK : BLOCK_KINDS.SHORT_BREAK,
      label: isSetEnd ? "Long break" : "Short break",
      minutes: length,
      startsAt: clock,
      endsAt: clock + length,
      glances: 0,
      glanceAt: [],
    });
    clock += length;
  }

  const studyMinutes = totalBlocks * study;
  const shortBreakCount = blocks.filter((block) => block.kind === BLOCK_KINDS.SHORT_BREAK).length;
  const longBreakCount = blocks.filter((block) => block.kind === BLOCK_KINDS.LONG_BREAK).length;
  const breakMinutes = shortBreakCount * shortBreak + longBreakCount * longBreak;
  const totalMinutes = studyMinutes + breakMinutes;
  const endMinutes = startMinutes + totalMinutes;

  const glanceTotal = totalBlocks * glancesPerBlock;
  const eyeRestSeconds = glanceTotal * EYE_BREAK_SECONDS;
  const longestNearWorkMinutes = glancesPerBlock > 0 ? EYE_RULE_MINUTES : study;

  return {
    blocks,
    startMinutes,
    endMinutes,
    crossesMidnight: endMinutes >= 1440,
    totalBlocks,
    studyMinutes,
    breakMinutes,
    totalMinutes,
    shortBreakCount,
    longBreakCount,
    glancesPerBlock,
    glanceTotal,
    eyeRestSeconds,
    longestNearWorkMinutes,
    blockExceedsEyeRule: study > EYE_RULE_MINUTES,
    studySharePercent: totalMinutes > 0 ? Math.round((studyMinutes / totalMinutes) * 100) : 0,
    pomodoroMinutes: study,
    shortBreakMinutes: shortBreak,
    longBreakMinutes: longBreak,
    pomodorosPerSet: perSet,
    sets: setCount,
  };
}

/**
 * Which block is running `elapsedSeconds` into the session, and whether a
 * distance glance is due right now (within the 20 seconds after each mark).
 */
export function blockAt(blocks, elapsedSeconds) {
  const list = Array.isArray(blocks) ? blocks : [];
  const total = list.reduce((sum, block) => sum + (isNum(block.minutes) ? block.minutes * 60 : 0), 0);
  const t = isNum(elapsedSeconds) && elapsedSeconds > 0 ? elapsedSeconds : 0;

  if (list.length === 0) {
    return { index: -1, block: null, remaining: 0, overallProgress: 0, done: true, glanceDue: false };
  }
  if (t >= total) {
    return {
      index: list.length,
      block: null,
      remaining: 0,
      overallProgress: 1,
      done: true,
      glanceDue: false,
    };
  }

  let cursor = 0;
  for (let index = 0; index < list.length; index += 1) {
    const block = list[index];
    const length = (isNum(block.minutes) ? block.minutes : 0) * 60;
    if (t < cursor + length) {
      const into = t - cursor;
      const glanceDue = (block.glanceAt || []).some((mark) => {
        const markSeconds = mark * 60;
        return into >= markSeconds && into < markSeconds + EYE_BREAK_SECONDS;
      });
      return {
        index,
        block,
        remaining: Math.max(0, cursor + length - t),
        intoBlock: into,
        overallProgress: total > 0 ? t / total : 1,
        done: false,
        glanceDue,
      };
    }
    cursor += length;
  }

  return { index: list.length, block: null, remaining: 0, overallProgress: 1, done: true, glanceDue: false };
}
