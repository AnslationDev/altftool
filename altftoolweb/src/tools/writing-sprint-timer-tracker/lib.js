/**
 * Writing Sprint Timer — pure logic.
 *
 * Builds the sprint/break schedule, converts logged sprints into words per
 * minute, and projects how long a word target will take at your own measured
 * pace. The countdown itself lives in the component; every number it displays
 * is computed here.
 *
 * No React, no DOM, no clock reads — elapsed time is always an argument.
 */

/* ------------------------------- constants ------------------------------- */

/**
 * The Pomodoro Technique (Francesco Cirillo): a 25-minute focused interval,
 * a 5-minute short break, and a longer 15-30 minute break after every four
 * intervals. Used as the defaults; every value is adjustable.
 */
export const POMODORO_SPRINT_MINUTES = 25;
export const POMODORO_SHORT_BREAK_MINUTES = 5;
export const POMODORO_LONG_BREAK_MINUTES = 15;
export const POMODORO_LONG_BREAK_EVERY = 4;

/** Common alternative sprint lengths used by writing groups. */
export const SPRINT_PRESETS = [
  { id: "sprint-10", label: "10 minute dash", minutes: 10, breakMinutes: 3 },
  { id: "sprint-15", label: "15 minute sprint", minutes: 15, breakMinutes: 5 },
  { id: "pomodoro", label: "25 minute Pomodoro", minutes: POMODORO_SPRINT_MINUTES, breakMinutes: POMODORO_SHORT_BREAK_MINUTES },
  { id: "sprint-45", label: "45 minute deep block", minutes: 45, breakMinutes: 10 },
];

/** Input bounds. Below one minute nothing is measurable; above three hours it is not a sprint. */
export const MIN_SPRINT_MINUTES = 1;
export const MAX_SPRINT_MINUTES = 180;
export const MAX_BREAK_MINUTES = 60;
export const MAX_SPRINTS = 24;

/* -------------------------------- helpers -------------------------------- */

const isNum = (value) => Number.isFinite(Number(value));

/** Seconds as mm:ss (or h:mm:ss beyond an hour). Never negative. */
export function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Minutes as "1 h 55 min" / "45 min". */
export function formatMinutes(totalMinutes) {
  const minutes = Math.max(0, Math.round(Number(totalMinutes) || 0));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/** Whole minutes to whole seconds. Never negative. */
export function minutesToSeconds(minutes) {
  const value = Number(minutes);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value * 60);
}

/** How far through a block the countdown is, as a 0-100 integer. */
export function blockProgressPercent(blockSeconds, secondsLeft) {
  const total = Number(blockSeconds);
  const left = Number(secondsLeft);
  if (!Number.isFinite(total) || total <= 0) return 0;
  const done = Math.max(0, Math.min(total, total - (Number.isFinite(left) ? left : total)));
  return Math.round((done / total) * 100);
}

/** Median of a numeric list. Returns 0 for an empty list. */
export function median(values) {
  const list = (Array.isArray(values) ? values : [])
    .map(Number)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  if (list.length === 0) return 0;
  const mid = Math.floor(list.length / 2);
  return list.length % 2 === 1 ? list[mid] : (list[mid - 1] + list[mid]) / 2;
}

/* ------------------------------- scheduling ------------------------------- */

/**
 * Build the sprint/break schedule.
 *
 * @param {object} input
 * @param {number} input.sprintMinutes
 * @param {number} input.breakMinutes      Short break after each sprint.
 * @param {number} input.sprints           How many sprints in the session.
 * @param {number} input.longBreakEvery    0 disables the long break.
 * @param {number} input.longBreakMinutes
 * @returns {object} { blocks, totalMinutes, ... } or { error }.
 */
export function buildSchedule(input = {}) {
  const {
    sprintMinutes = POMODORO_SPRINT_MINUTES,
    breakMinutes = POMODORO_SHORT_BREAK_MINUTES,
    sprints = POMODORO_LONG_BREAK_EVERY,
    longBreakEvery = POMODORO_LONG_BREAK_EVERY,
    longBreakMinutes = POMODORO_LONG_BREAK_MINUTES,
  } = input;

  if (![sprintMinutes, breakMinutes, sprints, longBreakEvery, longBreakMinutes].every(isNum)) {
    return { error: "Enter numbers for every sprint and break setting." };
  }

  const sprintLen = Math.round(Number(sprintMinutes));
  const shortBreak = Math.round(Number(breakMinutes));
  const count = Math.round(Number(sprints));
  const longEvery = Math.round(Number(longBreakEvery));
  const longBreak = Math.round(Number(longBreakMinutes));

  if (sprintLen < MIN_SPRINT_MINUTES || sprintLen > MAX_SPRINT_MINUTES) {
    return { error: `Sprint length must be between ${MIN_SPRINT_MINUTES} and ${MAX_SPRINT_MINUTES} minutes.` };
  }
  if (shortBreak < 0 || shortBreak > MAX_BREAK_MINUTES) {
    return { error: `Break length must be between 0 and ${MAX_BREAK_MINUTES} minutes.` };
  }
  if (longBreak < 0 || longBreak > MAX_BREAK_MINUTES) {
    return { error: `Long break must be between 0 and ${MAX_BREAK_MINUTES} minutes.` };
  }
  if (count < 1 || count > MAX_SPRINTS) {
    return { error: `Plan between 1 and ${MAX_SPRINTS} sprints in one session.` };
  }
  if (longEvery < 0) return { error: "Long break interval cannot be negative." };

  const blocks = [];
  let elapsed = 0;

  for (let i = 1; i <= count; i += 1) {
    blocks.push({
      id: `sprint-${i}`,
      kind: "sprint",
      label: `Sprint ${i}`,
      minutes: sprintLen,
      startsAtMinute: elapsed,
    });
    elapsed += sprintLen;

    const isLast = i === count;
    if (isLast) continue;

    const isLong = longEvery > 0 && i % longEvery === 0 && longBreak > 0;
    const restMinutes = isLong ? longBreak : shortBreak;
    if (restMinutes <= 0) continue;

    blocks.push({
      id: `break-${i}`,
      kind: isLong ? "long-break" : "break",
      label: isLong ? "Long break" : "Break",
      minutes: restMinutes,
      startsAtMinute: elapsed,
    });
    elapsed += restMinutes;
  }

  const writingMinutes = sprintLen * count;

  return {
    blocks,
    sprints: count,
    sprintMinutes: sprintLen,
    breakMinutes: shortBreak,
    longBreakMinutes: longBreak,
    longBreakEvery: longEvery,
    writingMinutes,
    restMinutes: elapsed - writingMinutes,
    totalMinutes: elapsed,
  };
}

/* -------------------------------- tracking -------------------------------- */

/**
 * Turn logged sprints into words-per-minute figures and a simple trend.
 *
 * @param {Array<{minutes:number, words:number}>} sessions
 * @returns {object} stats, or { error }.
 */
export function sprintStats(sessions) {
  const list = Array.isArray(sessions) ? sessions : [];
  if (list.length === 0) {
    return { error: "Log at least one sprint to see your pace." };
  }

  const rows = [];
  for (let i = 0; i < list.length; i += 1) {
    const minutes = Number(list[i]?.minutes);
    const words = Number(list[i]?.words);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      return { error: `Sprint ${i + 1} needs a length greater than zero minutes.` };
    }
    if (!Number.isFinite(words) || words < 0) {
      return { error: `Sprint ${i + 1} needs a word count of zero or more.` };
    }
    rows.push({
      index: i + 1,
      minutes,
      words,
      wpm: words / minutes,
    });
  }

  const totalWords = rows.reduce((sum, row) => sum + row.words, 0);
  const totalMinutes = rows.reduce((sum, row) => sum + row.minutes, 0);
  const overallWpm = totalMinutes > 0 ? totalWords / totalMinutes : 0;

  const best = rows.reduce((top, row) => (row.wpm > top.wpm ? row : top), rows[0]);
  const worst = rows.reduce((low, row) => (row.wpm < low.wpm ? row : low), rows[0]);

  // Trend: mean wpm of the second half against the first half.
  const half = Math.floor(rows.length / 2);
  const firstHalf = rows.slice(0, half);
  const secondHalf = rows.slice(rows.length - half);
  const meanOf = (items) =>
    items.length > 0 ? items.reduce((sum, row) => sum + row.wpm, 0) / items.length : 0;
  const firstMean = meanOf(firstHalf);
  const secondMean = meanOf(secondHalf);
  const trendPercent = firstMean > 0 ? ((secondMean - firstMean) / firstMean) * 100 : 0;

  return {
    rows,
    count: rows.length,
    totalWords,
    totalMinutes,
    overallWpm,
    medianWpm: median(rows.map((row) => row.wpm)),
    bestSprint: best,
    worstSprint: worst,
    averageWordsPerSprint: totalWords / rows.length,
    trendPercent: rows.length >= 2 && firstMean > 0 ? trendPercent : null,
    trendDirection:
      rows.length < 2 || firstMean <= 0
        ? "flat"
        : trendPercent > 1
          ? "up"
          : trendPercent < -1
            ? "down"
            : "flat",
  };
}

/**
 * How many sprints and how much clock time a word target needs at a given pace.
 *
 * @param {object} input
 * @param {number} input.targetWords
 * @param {number} input.wpm            Words per minute of actual writing.
 * @param {number} input.sprintMinutes
 * @param {number} input.breakMinutes
 * @param {number} input.wordsSoFar     Already written; subtracted from the target.
 * @returns {object} projection, or { error }.
 */
export function projectSprints(input = {}) {
  const {
    targetWords,
    wpm,
    sprintMinutes = POMODORO_SPRINT_MINUTES,
    breakMinutes = POMODORO_SHORT_BREAK_MINUTES,
    wordsSoFar = 0,
  } = input;

  if (![targetWords, wpm, sprintMinutes, breakMinutes, wordsSoFar].every(isNum)) {
    return { error: "Enter numbers for the target, pace and sprint settings." };
  }

  const target = Math.round(Number(targetWords));
  const pace = Number(wpm);
  const sprintLen = Math.round(Number(sprintMinutes));
  const shortBreak = Math.round(Number(breakMinutes));
  const done = Math.max(0, Math.round(Number(wordsSoFar)));

  if (target <= 0) return { error: "Word target must be greater than zero." };
  if (pace <= 0) return { error: "Pace must be greater than zero words per minute." };
  if (sprintLen < MIN_SPRINT_MINUTES) return { error: `Sprint length must be at least ${MIN_SPRINT_MINUTES} minute.` };
  if (shortBreak < 0) return { error: "Break length cannot be negative." };

  const remaining = Math.max(0, target - done);
  const wordsPerSprint = pace * sprintLen;
  const sprintsNeeded = remaining === 0 ? 0 : Math.ceil(remaining / wordsPerSprint);
  const writingMinutes = sprintsNeeded * sprintLen;
  const restMinutes = sprintsNeeded > 1 ? (sprintsNeeded - 1) * shortBreak : 0;

  return {
    target,
    wordsSoFar: done,
    remaining,
    wordsPerSprint,
    sprintsNeeded,
    writingMinutes,
    restMinutes,
    clockMinutes: writingMinutes + restMinutes,
    complete: remaining === 0,
    percentDone: target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0,
  };
}

/** Render the logged sprints as copyable plain text. */
export function statsToText(stats, projection) {
  if (!stats || stats.error) return "";
  const lines = ["Writing sprint log", ""];
  stats.rows.forEach((row) => {
    lines.push(`Sprint ${row.index}: ${row.words} words in ${row.minutes} min (${row.wpm.toFixed(1)} wpm)`);
  });
  lines.push("");
  lines.push(`Total: ${stats.totalWords} words in ${formatMinutes(stats.totalMinutes)}`);
  lines.push(`Overall pace: ${stats.overallWpm.toFixed(1)} words per minute`);
  lines.push(`Best sprint: #${stats.bestSprint.index} at ${stats.bestSprint.wpm.toFixed(1)} wpm`);
  if (projection && !projection.error) {
    lines.push(
      `To reach ${projection.target} words: ${projection.sprintsNeeded} more sprint${projection.sprintsNeeded === 1 ? "" : "s"}, about ${formatMinutes(projection.clockMinutes)} on the clock.`,
    );
  }
  return lines.join("\n").trim();
}
