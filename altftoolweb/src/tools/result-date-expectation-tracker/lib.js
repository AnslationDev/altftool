/**
 * Result date expectation tracker.
 *
 * Exam bodies rarely announce result dates, but the exam-to-result gap is
 * fairly stable across cycles. Given the gaps (in days) observed in past
 * cycles, the tracker projects a window for the current cycle:
 *
 *   earliest = examDate + min(gaps)
 *   latest   = examDate + max(gaps)
 *   likely   = examDate + median(gaps)   (median resists one outlier cycle)
 *
 * and reports where "today" sits relative to that window.
 */

/** At least this many past cycles are needed before a window means anything. */
export const MIN_CYCLES = 1;

/** More than 20 cycles is beyond any series' comparable history. */
export const MAX_CYCLES = 20;

/**
 * Two years is the sanity ceiling for an exam-to-result gap — even the
 * slowest multi-stage government cycles publish within that.
 */
export const MAX_GAP_DAYS = 730;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Parse an ISO yyyy-mm-dd string into a UTC-midnight Date, or null when invalid. */
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

/** Whole days between two UTC-midnight dates. */
export function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/** Add whole days to a UTC-midnight date. */
export function addDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/** Format a UTC-midnight Date as yyyy-mm-dd. */
export function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

/** Median of a numeric array (mean of middle two for even counts). */
export function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Project the expected result window.
 *
 * @param {object} input
 * @param {string}   input.examDate  yyyy-mm-dd the exam was (or will be) held.
 * @param {number[]} input.pastGaps  Exam-to-result gaps from past cycles, in days.
 * @param {string}   input.today     yyyy-mm-dd, injected by the caller.
 * @returns {object} window projection, or { error } for unusable input.
 */
export function expectResultWindow({ examDate, pastGaps, today }) {
  const exam = parseIsoDate(examDate);
  if (!exam) return { error: "Enter the exam date as yyyy-mm-dd." };
  const now = parseIsoDate(today);
  if (!now) return { error: "Enter today's date as yyyy-mm-dd." };

  if (!Array.isArray(pastGaps) || pastGaps.length < MIN_CYCLES) {
    return { error: "Enter at least one past cycle's exam-to-result gap in days." };
  }
  if (pastGaps.length > MAX_CYCLES) {
    return { error: `Use at most ${MAX_CYCLES} past cycles.` };
  }
  const gaps = pastGaps.map(Number);
  for (const gap of gaps) {
    if (!Number.isFinite(gap) || !Number.isInteger(gap) || gap < 1 || gap > MAX_GAP_DAYS) {
      return { error: `Every past gap must be a whole number of days between 1 and ${MAX_GAP_DAYS}.` };
    }
  }

  const minGap = Math.min(...gaps);
  const maxGap = Math.max(...gaps);
  const midGap = Math.round(median(gaps));
  const meanGap = Math.round(gaps.reduce((sum, g) => sum + g, 0) / gaps.length);

  const earliest = addDays(exam, minGap);
  const latest = addDays(exam, maxGap);
  const likely = addDays(exam, midGap);

  const daysSinceExam = daysBetween(exam, now);
  const daysToEarliest = daysBetween(now, earliest);
  const daysToLatest = daysBetween(now, latest);

  let status;
  if (daysSinceExam < 0) {
    status = { phase: "before-exam", text: "The exam has not happened yet." };
  } else if (daysToEarliest > 0) {
    status = {
      phase: "too-early",
      text: `Too early — the window opens in ${daysToEarliest} day${daysToEarliest === 1 ? "" : "s"}.`,
    };
  } else if (daysToLatest >= 0) {
    status = {
      phase: "in-window",
      text: `Inside the expected window — up to ${daysToLatest} day${daysToLatest === 1 ? "" : "s"} to its end.`,
    };
  } else {
    status = {
      phase: "overdue",
      text: `Past the expected window by ${-daysToLatest} day${daysToLatest === -1 ? "" : "s"} — check the official site.`,
    };
  }

  return {
    cycles: gaps.length,
    minGap,
    maxGap,
    medianGap: midGap,
    meanGap,
    earliestDate: toIsoDate(earliest),
    likelyDate: toIsoDate(likely),
    latestDate: toIsoDate(latest),
    daysSinceExam: Math.max(0, daysSinceExam),
    daysToEarliest,
    daysToLatest,
    status,
  };
}
