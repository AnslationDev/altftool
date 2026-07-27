/**
 * Eisenhower Matrix — sorting tasks by importance against urgency.
 *
 * The matrix comes from a line Dwight D. Eisenhower quoted in his 1954 address
 * to the Second Assembly of the World Council of Churches: "I have two kinds of
 * problems, the urgent and the important. The urgent are not important, and the
 * important are never urgent." Stephen Covey later drew it as four quadrants.
 *
 * Classification is a straight pair of threshold tests on two 1-10 scores:
 *
 *   important = importance >= threshold
 *   urgent    = urgency    >= threshold
 *
 *   important & urgent    -> Q1 Do now
 *   important & !urgent   -> Q2 Schedule      (where planned work should sit)
 *   !important & urgent   -> Q3 Delegate
 *   !important & !urgent  -> Q4 Drop
 *
 * Urgency can also be derived from a deadline instead of typed in: a task due
 * today or overdue scores 10, and the score falls linearly to 1 at the end of
 * the planning horizon. That is this tool's own convention, stated so you can
 * override it, not an external standard.
 *
 * Pure module: no React, no DOM, no clock reads — "today" is always an argument.
 */

/** The four quadrants, in the order they should be worked. */
export const QUADRANTS = {
  Q1: {
    key: "Q1",
    label: "Do now",
    subtitle: "Urgent and important",
    action: "Handle these yourself, today.",
  },
  Q2: {
    key: "Q2",
    label: "Schedule",
    subtitle: "Important, not urgent",
    action: "Book time for these before they turn into Q1.",
  },
  Q3: {
    key: "Q3",
    label: "Delegate",
    subtitle: "Urgent, not important",
    action: "Hand these to someone else or batch them.",
  },
  Q4: {
    key: "Q4",
    label: "Drop",
    subtitle: "Neither urgent nor important",
    action: "Delete them; they are the cost of a full calendar.",
  },
};

export const QUADRANT_ORDER = ["Q1", "Q2", "Q3", "Q4"];

/** Both axes are scored 1-10. */
export const SCORE_MIN = 1;
export const SCORE_MAX = 10;

/** A score at or above this counts as "high" on either axis. */
export const DEFAULT_THRESHOLD = 6;

/** Deadline further out than this scores the minimum urgency of 1. */
export const DEFAULT_HORIZON_DAYS = 14;

/** Most tasks one board will sort. */
export const MAX_TASKS = 200;

/** Longest single task the planner will accept, in hours. */
export const MAX_TASK_HOURS = 500;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round = (v, p = 2) => {
  const f = 10 ** p;
  return Math.round((v + Number.EPSILON) * f) / f;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Whole days from `from` to `to`, both plain ISO dates (YYYY-MM-DD).
 * Uses UTC midnight for both, so daylight saving never shifts the count.
 *
 * @param {string} from
 * @param {string} to
 * @returns {{ days: number } | { error: string }}
 */
export function daysBetween(from, to) {
  if (!ISO_DATE.test(String(from)) || !ISO_DATE.test(String(to))) {
    return { error: "Dates must be written as YYYY-MM-DD." };
  }
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return { error: "That is not a real calendar date." };
  }
  return { days: Math.round((b - a) / 86400000) };
}

/**
 * Convert a deadline into a 1-10 urgency score.
 * Due today or overdue -> 10. At or beyond the horizon -> 1. Linear in between.
 *
 * @param {{ dueDate: string, today: string, horizonDays?: number }} input
 * @returns {{ urgency: number, daysLeft: number, overdue: boolean } | { error: string }}
 */
export function urgencyFromDueDate({ dueDate, today, horizonDays = DEFAULT_HORIZON_DAYS } = {}) {
  const gap = daysBetween(today, dueDate);
  if (gap.error) return { error: gap.error };
  if (!isNum(horizonDays) || horizonDays <= 0) {
    return { error: "The planning horizon must be at least one day." };
  }
  const daysLeft = gap.days;
  if (daysLeft <= 0) return { urgency: SCORE_MAX, daysLeft, overdue: daysLeft < 0 };
  if (daysLeft >= horizonDays) return { urgency: SCORE_MIN, daysLeft, overdue: false };
  const urgency = SCORE_MAX - (daysLeft / horizonDays) * (SCORE_MAX - SCORE_MIN);
  return { urgency: round(urgency, 1), daysLeft, overdue: false };
}

/**
 * Place one task in a quadrant.
 *
 * @param {{ importance: number, urgency: number, threshold?: number }} input
 * @returns {{ quadrant: string, important: boolean, urgent: boolean } | { error: string }}
 */
export function classifyTask({ importance, urgency, threshold = DEFAULT_THRESHOLD } = {}) {
  if (!isNum(importance) || !isNum(urgency)) {
    return { error: "Score both importance and urgency from 1 to 10." };
  }
  if (importance < SCORE_MIN || importance > SCORE_MAX || urgency < SCORE_MIN || urgency > SCORE_MAX) {
    return { error: `Importance and urgency must be between ${SCORE_MIN} and ${SCORE_MAX}.` };
  }
  if (!isNum(threshold) || threshold <= SCORE_MIN || threshold > SCORE_MAX) {
    return { error: `The threshold must sit above ${SCORE_MIN} and at most ${SCORE_MAX}.` };
  }
  const important = importance >= threshold;
  const urgent = urgency >= threshold;
  let quadrant;
  if (important && urgent) quadrant = "Q1";
  else if (important) quadrant = "Q2";
  else if (urgent) quadrant = "Q3";
  else quadrant = "Q4";
  return { quadrant, important, urgent };
}

/**
 * Sort a whole task list into the four quadrants and summarise the workload.
 *
 * `focus` is this tool's own rule, not an external standard: a board is
 * balanced when scheduled (Q2) hours are at least as large as firefighting
 * (Q1) hours and nothing has been left sitting in Q4.
 *
 * @param {{ tasks: Array<object>, threshold?: number }} input
 * @returns {object} board summary or { error }
 */
export function buildMatrix({ tasks, threshold = DEFAULT_THRESHOLD } = {}) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return { error: "Add at least one task to sort." };
  }
  if (tasks.length > MAX_TASKS) {
    return { error: `This board sorts up to ${MAX_TASKS} tasks.` };
  }

  const buckets = {};
  for (const key of QUADRANT_ORDER) {
    buckets[key] = { ...QUADRANTS[key], tasks: [], count: 0, hours: 0, share: 0, hoursShare: 0 };
  }

  let totalHours = 0;
  const placed = [];

  for (let i = 0; i < tasks.length; i += 1) {
    const raw = tasks[i] ?? {};
    const hours = isNum(raw.hours) ? raw.hours : 0;
    if (hours < 0) return { error: "Estimated hours cannot be negative." };
    if (hours > MAX_TASK_HOURS) return { error: `Keep each task under ${MAX_TASK_HOURS} hours.` };
    const verdict = classifyTask({ importance: raw.importance, urgency: raw.urgency, threshold });
    if (verdict.error) return { error: verdict.error };
    const entry = {
      id: String(raw.id ?? i),
      title: String(raw.title ?? "").trim() || `Task ${i + 1}`,
      importance: raw.importance,
      urgency: raw.urgency,
      hours,
      note: String(raw.note ?? ""),
      quadrant: verdict.quadrant,
      important: verdict.important,
      urgent: verdict.urgent,
      // Distance from the origin; used only to order tasks inside a quadrant.
      weight: round(Math.sqrt(raw.importance ** 2 + raw.urgency ** 2), 3),
    };
    totalHours += hours;
    placed.push(entry);
    buckets[verdict.quadrant].tasks.push(entry);
  }

  for (const key of QUADRANT_ORDER) {
    const bucket = buckets[key];
    bucket.tasks.sort((a, b) => b.weight - a.weight);
    bucket.count = bucket.tasks.length;
    bucket.hours = round(bucket.tasks.reduce((sum, t) => sum + t.hours, 0), 2);
    bucket.share = round((bucket.count / placed.length) * 100, 1);
    bucket.hoursShare = totalHours > 0 ? round((bucket.hours / totalHours) * 100, 1) : 0;
  }

  const q1 = buckets.Q1;
  const q2 = buckets.Q2;
  const q3 = buckets.Q3;
  const q4 = buckets.Q4;
  const balanced = q2.hours >= q1.hours && q4.count === 0;

  const advice = [];
  if (q1.count === 0 && q2.count === 0) {
    advice.push("Nothing here is important — check the importance scores before you spend a day on this list.");
  }
  if (q1.hours > q2.hours) {
    advice.push("More time goes to firefighting than to planned work; move some Q2 items into the calendar.");
  }
  if (q3.count > 0) {
    advice.push(`${q3.count} task${q3.count === 1 ? "" : "s"} could be delegated, freeing ${q3.hours} hours.`);
  }
  if (q4.count > 0) {
    advice.push(
      q4.count === 1
        ? "1 task scores low on both axes — delete it rather than carrying it."
        : `${q4.count} tasks score low on both axes — delete them rather than carrying them.`,
    );
  }
  if (advice.length === 0) {
    advice.push("The board is balanced: planned work outweighs firefighting and nothing is dead weight.");
  }

  return {
    quadrants: QUADRANT_ORDER.map((k) => buckets[k]),
    byKey: buckets,
    tasks: placed,
    total: placed.length,
    totalHours: round(totalHours, 2),
    threshold,
    balanced,
    focusPercent: q2.hoursShare,
    firefightingPercent: q1.hoursShare,
    delegatableHours: buckets.Q3.hours,
    droppableHours: q4.hours,
    advice,
  };
}
