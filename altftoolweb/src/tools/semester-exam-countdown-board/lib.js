/**
 * Semester exam countdown board.
 *
 * Pure date arithmetic: for each paper the board computes whole days remaining
 * from a supplied "today" (never read from the clock here — the UI passes it),
 * sorts papers chronologically, and flags papers "at risk" using a simple,
 * transparent rule: readiness below RISK_READINESS_MAX percent with
 * RISK_DAYS_MAX or fewer days to go. The risk thresholds are this tool's own
 * planning heuristic (a paper you are less than half ready for, inside the last
 * week, needs attention first) — they are not an external standard, and the UI
 * states as much.
 */

/** A paper is "at risk" when readiness is below this percentage... */
export const RISK_READINESS_MAX = 50;
/** ...and it is this many days away or fewer. Last-week heuristic. */
export const RISK_DAYS_MAX = 7;

/** Readiness is a percentage. */
export const READINESS_MIN = 0;
export const READINESS_MAX = 100;

/** Sanity cap so a typo (year 3026) is caught instead of showing 365000 days. */
export const MAX_DAYS_AHEAD = 730;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Parse an ISO yyyy-mm-dd string into a UTC-midnight Date, or null when invalid. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
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

/** Whole days from one UTC-midnight date to another (positive when `to` is later). */
export function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/**
 * Build the countdown board.
 *
 * @param {object} input
 * @param {Array<{name: string, examDate: string, readiness: number|string}>} input.papers
 * @param {string} input.today  ISO date the countdown is measured from.
 * @returns {object} board, or { error }.
 */
export function buildBoard({ papers, today }) {
  const todayDate = parseIsoDate(today);
  if (!todayDate) return { error: "Pick a valid 'counting from' date." };

  if (!Array.isArray(papers) || papers.length === 0) {
    return { error: "Add at least one paper to the board." };
  }

  const rows = [];
  for (let index = 0; index < papers.length; index += 1) {
    const paper = papers[index];
    const name = typeof paper.name === "string" ? paper.name.trim().replace(/\s+/g, " ") : "";
    if (!name) return { error: `Paper ${index + 1} needs a subject name.` };

    const examDate = parseIsoDate(paper.examDate);
    if (!examDate) return { error: `Pick a valid exam date for "${name}".` };

    const readiness = Number(paper.readiness);
    if (!Number.isFinite(readiness) || readiness < READINESS_MIN || readiness > READINESS_MAX) {
      return { error: `Readiness for "${name}" must be between ${READINESS_MIN} and ${READINESS_MAX} percent.` };
    }

    const daysLeft = daysBetween(todayDate, examDate);
    if (daysLeft > MAX_DAYS_AHEAD) {
      return { error: `"${name}" is more than ${MAX_DAYS_AHEAD} days away — check the exam date's year.` };
    }

    const status = daysLeft < 0 ? "done" : daysLeft === 0 ? "today" : "upcoming";
    const atRisk =
      status !== "done" && readiness < RISK_READINESS_MAX && daysLeft <= RISK_DAYS_MAX;

    rows.push({ name, examDate: paper.examDate, readiness, daysLeft, status, atRisk });
  }

  rows.sort((a, b) => a.daysLeft - b.daysLeft || a.name.localeCompare(b.name));

  const pending = rows.filter((row) => row.status !== "done");
  const next = pending[0] ?? null;
  const last = pending[pending.length - 1] ?? null;

  const avgReadiness =
    pending.length > 0
      ? Math.round(pending.reduce((sum, row) => sum + row.readiness, 0) / pending.length)
      : null;

  return {
    rows,
    nextPaper: next ? { name: next.name, daysLeft: next.daysLeft } : null,
    /** Days from the first pending paper to the last — the length of the exam window. */
    examWindowDays: next && last ? last.daysLeft - next.daysLeft : 0,
    pendingCount: pending.length,
    doneCount: rows.length - pending.length,
    avgReadiness,
    riskCount: rows.filter((row) => row.atRisk).length,
  };
}
