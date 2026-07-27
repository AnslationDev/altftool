/**
 * Exam preparation milestone board.
 *
 * Model: linear pacing. Milestones are spaced evenly between the start of
 * preparation and exam day; at any date, the expected number completed is the
 * elapsed fraction of the cycle times the milestone count. This is the same
 * planned-vs-actual comparison used in basic earned-value tracking
 * (planned value ~ linear schedule baseline).
 *
 * Motivation framing: breaking a distant goal into visible sub-goals and
 * marking each one done leverages goal-gradient and small-wins effects
 * (Amabile & Kramer's progress-principle research).
 *
 * All maths is pure; "today" is always an argument.
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Parse an ISO yyyy-mm-dd string into a UTC-midnight Date, or null. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function isoFromDate(date) {
  return date.toISOString().slice(0, 10);
}

export const MAX_MILESTONES = 12;
export const MIN_MILESTONES = 2;

/** Ahead/behind tolerance: within +/- 1 milestone of plan counts as on track. */
export const ON_TRACK_TOLERANCE = 1;

/**
 * Compute the milestone board.
 *
 * @param {object} input
 * @param {string} input.startIso   Prep start date, yyyy-mm-dd.
 * @param {string} input.examIso    Exam date, yyyy-mm-dd (must be after start).
 * @param {string} input.todayIso   Today, yyyy-mm-dd.
 * @param {{name:string, done:boolean}[]} input.milestones  In intended order.
 * @returns {{totalDays, daysElapsed, daysLeft, cycleProgressPercent,
 *            doneCount, expectedDoneCount, delta, status, progressPercent,
 *            nextMilestone, board}|{error:string}}
 */
export function computeMilestoneBoard({ startIso, examIso, todayIso, milestones }) {
  const start = parseIsoDate(startIso);
  const exam = parseIsoDate(examIso);
  const today = parseIsoDate(todayIso);
  if (!start) return { error: "Enter a valid preparation start date." };
  if (!exam) return { error: "Enter a valid exam date." };
  if (!today) return { error: "Today's date is missing — reload and try again." };
  if (exam.getTime() <= start.getTime()) {
    return { error: "The exam date must be after the preparation start date." };
  }

  if (!Array.isArray(milestones)) return { error: "Milestones must be a list." };
  const cleaned = milestones
    .map((m) => ({ name: String(m?.name ?? "").trim(), done: Boolean(m?.done) }))
    .filter((m) => m.name !== "");
  if (cleaned.length < MIN_MILESTONES) {
    return { error: `Add at least ${MIN_MILESTONES} named milestones to build the board.` };
  }
  if (cleaned.length > MAX_MILESTONES) {
    return { error: `Keep it to ${MAX_MILESTONES} milestones — fewer, bigger wins beat a long checklist.` };
  }

  const totalDays = Math.round((exam.getTime() - start.getTime()) / MS_PER_DAY);
  const rawElapsed = Math.round((today.getTime() - start.getTime()) / MS_PER_DAY);
  const daysElapsed = Math.min(Math.max(rawElapsed, 0), totalDays);
  const daysLeft = totalDays - daysElapsed;
  const cycleProgress = daysElapsed / totalDays;

  const n = cleaned.length;
  // Milestone i (1-based) is targeted at start + (i/n) x totalDays: evenly
  // spaced, with the last milestone landing on exam day.
  const board = cleaned.map((m, index) => {
    const targetOffset = Math.round((totalDays * (index + 1)) / n);
    const targetDate = new Date(start.getTime() + targetOffset * MS_PER_DAY);
    return {
      index: index + 1,
      name: m.name,
      done: m.done,
      targetIso: isoFromDate(targetDate),
      targetInDays: targetOffset - daysElapsed, // negative = target has passed
      overdue: !m.done && targetOffset < daysElapsed,
    };
  });

  const doneCount = board.filter((m) => m.done).length;
  // Planned value under linear pacing.
  const expectedDoneCount = Math.floor(n * cycleProgress);
  const delta = doneCount - expectedDoneCount;

  let status;
  if (delta > ON_TRACK_TOLERANCE) status = "ahead";
  else if (delta < -ON_TRACK_TOLERANCE) status = "behind";
  else status = "on-track";

  const nextMilestone = board.find((m) => !m.done) ?? null;

  return {
    totalDays,
    daysElapsed,
    daysLeft,
    cycleProgressPercent: Math.round(cycleProgress * 100),
    doneCount,
    milestoneCount: n,
    expectedDoneCount,
    delta,
    status,
    progressPercent: Math.round((doneCount / n) * 100),
    nextMilestone,
    board,
  };
}
