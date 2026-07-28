/**
 * NaNoWriMo Pace Calculator — pure logic.
 *
 * Compares a running word count against the par line for a 50,000-word,
 * 30-day challenge and works out the daily pace still required.
 *
 * No React, no DOM, no clock reads — the day number is always an argument.
 */

/* ------------------------------- constants ------------------------------- */

/** The classic challenge: 50,000 words during the 30 days of November. */
export const DEFAULT_GOAL_WORDS = 50000;
export const DEFAULT_CHALLENGE_DAYS = 30;

/**
 * Par per day, rounded up: 50,000 / 30 = 1,666.67, published as 1,667.
 * Writing exactly 1,667 every day finishes on 50,010 — ten words clear.
 */
export const PAR_WORDS_PER_DAY = Math.ceil(DEFAULT_GOAL_WORDS / DEFAULT_CHALLENGE_DAYS);

/** Bounds. A challenge of one day or a million words is not a pace problem. */
export const MIN_GOAL_WORDS = 1000;
export const MAX_GOAL_WORDS = 500000;
export const MIN_CHALLENGE_DAYS = 1;
export const MAX_CHALLENGE_DAYS = 92; // longest quarter, covers a three-month camp

/** Common variants of the format used by writing groups. */
export const CHALLENGE_PRESETS = [
  { id: "november", label: "50,000 in 30 days", goal: 50000, days: 30 },
  { id: "camp-25k", label: "25,000 in 30 days", goal: 25000, days: 30 },
  { id: "camp-july", label: "50,000 in 31 days", goal: 50000, days: 31 },
  { id: "half", label: "30,000 in 30 days", goal: 30000, days: 30 },
];

/* -------------------------------- helpers -------------------------------- */

const isNum = (value) => Number.isFinite(Number(value));

const DAY_MS = 86400000;

/** Parse yyyy-mm-dd to a UTC timestamp, or null if it is not a real date. */
export function parseIsoDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const stamp = Date.UTC(year, month - 1, day);
  const date = new Date(stamp);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return stamp;
}

/**
 * Which day of the challenge a date falls on. The start date is day 1.
 * Returns null for invalid dates; may return 0 or a number beyond the
 * challenge length if the date is outside it.
 */
export function dayNumberFor(startIso, todayIso) {
  const start = parseIsoDate(startIso);
  const today = parseIsoDate(todayIso);
  if (start === null || today === null) return null;
  return Math.round((today - start) / DAY_MS) + 1;
}

/** Par word count at the end of day n. */
export function parAtDay(day, goal = DEFAULT_GOAL_WORDS, days = DEFAULT_CHALLENGE_DAYS) {
  const n = Number(day);
  const total = Number(goal);
  const span = Number(days);
  if (!Number.isFinite(n) || !Number.isFinite(total) || !Number.isFinite(span) || span <= 0) return 0;
  const clamped = Math.max(0, Math.min(span, n));
  return Math.round((total * clamped) / span);
}

/* ------------------------------- calculator ------------------------------- */

/**
 * Work out where you stand.
 *
 * @param {object} input
 * @param {number} input.goalWords     Target for the whole challenge.
 * @param {number} input.challengeDays Length of the challenge in days.
 * @param {number} input.daysElapsed   Days completed, including today. 0 means it has not started.
 * @param {number} input.wordsWritten  Your running total.
 * @returns {object} result, or { error }.
 */
export function nanoPace(input = {}) {
  const {
    goalWords = DEFAULT_GOAL_WORDS,
    challengeDays = DEFAULT_CHALLENGE_DAYS,
    daysElapsed = 0,
    wordsWritten = 0,
  } = input;

  if (![goalWords, challengeDays, daysElapsed, wordsWritten].every(isNum)) {
    return { error: "Enter numbers for the goal, the challenge length, the day and your word count." };
  }

  const goal = Math.round(Number(goalWords));
  const days = Math.round(Number(challengeDays));
  const elapsed = Math.round(Number(daysElapsed));
  const words = Math.round(Number(wordsWritten));

  if (goal < MIN_GOAL_WORDS || goal > MAX_GOAL_WORDS) {
    return { error: `Set a goal between ${MIN_GOAL_WORDS} and ${MAX_GOAL_WORDS} words.` };
  }
  if (days < MIN_CHALLENGE_DAYS || days > MAX_CHALLENGE_DAYS) {
    return { error: `The challenge must run between ${MIN_CHALLENGE_DAYS} and ${MAX_CHALLENGE_DAYS} days.` };
  }
  if (elapsed < 0 || elapsed > days) {
    return { error: `Day must be between 0 and ${days}.` };
  }
  if (words < 0) {
    return { error: "Word count cannot be negative." };
  }

  const parPerDay = Math.ceil(goal / days);
  const parToDate = parAtDay(elapsed, goal, days);
  const difference = words - parToDate;
  const remainingWords = Math.max(0, goal - words);
  const daysRemaining = Math.max(0, days - elapsed);

  const neededPerDay =
    remainingWords === 0 ? 0 : daysRemaining > 0 ? Math.ceil(remainingWords / daysRemaining) : null;

  const averagePerDay = elapsed > 0 ? words / elapsed : 0;
  const projectedTotal = elapsed > 0 ? Math.round(averagePerDay * days) : null;

  let finishDay = null;
  if (words >= goal) {
    finishDay = elapsed;
  } else if (averagePerDay > 0) {
    finishDay = Math.ceil(goal / averagePerDay);
  }

  const daysBuffer = parPerDay > 0 ? difference / parPerDay : 0;

  return {
    goal,
    days,
    daysElapsed: elapsed,
    daysRemaining,
    words,
    parPerDay,
    parToDate,
    difference,
    ahead: difference > 0,
    behind: difference < 0,
    onPar: difference === 0,
    daysAheadOrBehind: Math.round(daysBuffer * 10) / 10,
    remainingWords,
    neededPerDay,
    averagePerDay: Math.round(averagePerDay * 10) / 10,
    projectedTotal,
    projectedShortfall: projectedTotal === null ? null : goal - projectedTotal,
    finishDay,
    finishesInTime: finishDay !== null && finishDay <= days,
    daysSpare: finishDay !== null ? Math.max(0, days - finishDay) : null,
    surplus: Math.max(0, words - goal),
    complete: words >= goal,
    percentDone: goal > 0 ? Math.min(100, Math.round((words / goal) * 100)) : 0,
    outOfDays: daysRemaining === 0 && words < goal,
  };
}

/** Par line for every day of the challenge. */
export function parTable(goal = DEFAULT_GOAL_WORDS, days = DEFAULT_CHALLENGE_DAYS) {
  const total = Math.round(Number(goal) || 0);
  const span = Math.round(Number(days) || 0);
  if (total <= 0 || span <= 0 || span > MAX_CHALLENGE_DAYS) return [];
  return Array.from({ length: span }, (_, index) => {
    const day = index + 1;
    const cumulative = parAtDay(day, total, span);
    const previous = parAtDay(day - 1, total, span);
    return { day, cumulative, daily: cumulative - previous };
  });
}

/** Render the result as copyable plain text. */
export function resultToText(result) {
  if (!result || result.error) return "";
  const lines = [
    `Pace check — day ${result.daysElapsed} of ${result.days}`,
    `Written: ${result.words.toLocaleString("en-IN")} of ${result.goal.toLocaleString("en-IN")} (${result.percentDone}%)`,
    `Par to date: ${result.parToDate.toLocaleString("en-IN")}`,
    `${result.ahead ? "Ahead by" : result.behind ? "Behind by" : "Exactly on par —"} ${Math.abs(result.difference).toLocaleString("en-IN")} words`,
  ];
  if (result.neededPerDay !== null && result.remainingWords > 0) {
    lines.push(`Needed per day for the rest: ${result.neededPerDay.toLocaleString("en-IN")} words`);
  }
  if (result.projectedTotal !== null) {
    lines.push(`At your current average of ${result.averagePerDay} a day, you finish on ${result.projectedTotal.toLocaleString("en-IN")} words.`);
  }
  return lines.join("\n").trim();
}
