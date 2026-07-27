/**
 * Exam date clash detector.
 *
 * Two exams CLASH when their date ranges overlap by at least one day —
 * interval overlap test: aStart <= bEnd AND bStart <= aEnd.
 *
 * Two exams are TIGHT when they do not overlap but the free gap between the
 * earlier one's last day and the later one's first day is small: with a gap
 * of g days there are g-1 fully free days between them (consecutive days
 * g = 1 mean zero free days).
 */

/**
 * Default tight-gap threshold. A gap of 2 days or less between two exams
 * leaves at most one free day — not enough for both travel and a revision
 * day, which is why multi-exam aspirants treat such pairs as schedule risks.
 */
export const DEFAULT_TIGHT_GAP_DAYS = 2;

/** More than a month of gap is never "tight"; cap keeps the input sane. */
export const MAX_TIGHT_GAP_DAYS = 30;

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

/**
 * Detect clashes and tight gaps across applied-for exams.
 *
 * @param {object} input
 * @param {Array}  input.exams        [{ name, start: yyyy-mm-dd, end?: yyyy-mm-dd }]
 * @param {number} [input.tightGapDays]  Gap (in days) at or below which a pair is "tight".
 * @returns {{timeline:Array, clashes:Array, tightPairs:Array}|{error:string}}
 */
export function detectClashes({ exams, tightGapDays = DEFAULT_TIGHT_GAP_DAYS }) {
  if (!Array.isArray(exams)) return { error: "Add the exams you have applied for." };

  const threshold = Number(tightGapDays);
  if (!Number.isInteger(threshold) || threshold < 0 || threshold > MAX_TIGHT_GAP_DAYS) {
    return { error: `Tight-gap threshold must be 0-${MAX_TIGHT_GAP_DAYS} days.` };
  }

  const parsed = [];
  for (const exam of exams) {
    const name = typeof exam.name === "string" ? exam.name.trim() : "";
    if (name === "") return { error: "Every exam needs a name." };
    const start = parseIsoDate(exam.start);
    if (!start) return { error: `"${name}": enter a valid start date (yyyy-mm-dd).` };
    const end = exam.end ? parseIsoDate(exam.end) : start;
    if (!end) return { error: `"${name}": the end date is not a valid yyyy-mm-dd date.` };
    if (end < start) return { error: `"${name}": the end date is before the start date.` };
    parsed.push({ name, start, end, startIso: exam.start, endIso: exam.end || exam.start });
  }

  const timeline = [...parsed].sort(
    (a, b) => a.start.getTime() - b.start.getTime() || a.name.localeCompare(b.name),
  );

  const clashes = [];
  const tightPairs = [];
  for (let i = 0; i < timeline.length; i += 1) {
    for (let j = i + 1; j < timeline.length; j += 1) {
      const a = timeline[i];
      const b = timeline[j];
      // Interval overlap: at least one shared day.
      if (a.start <= b.end && b.start <= a.end) {
        const overlapStart = a.start > b.start ? a.start : b.start;
        const overlapEnd = a.end < b.end ? a.end : b.end;
        clashes.push({
          first: a.name,
          second: b.name,
          overlapDays: daysBetween(overlapStart, overlapEnd) + 1, // inclusive day count
        });
        continue;
      }
      // No overlap: earlier finisher vs later starter.
      const [earlier, later] = a.end <= b.start ? [a, b] : [b, a];
      const gap = daysBetween(earlier.end, later.start); // g=1 => consecutive days
      if (gap >= 1 && gap <= threshold) {
        tightPairs.push({
          first: earlier.name,
          second: later.name,
          gapDays: gap,
          freeDays: gap - 1, // fully free days between the two
        });
      }
    }
  }

  return {
    timeline: timeline.map(({ name, startIso, endIso }) => ({ name, start: startIso, end: endIso })),
    clashes,
    tightPairs,
    clashCount: clashes.length,
    tightCount: tightPairs.length,
    examCount: timeline.length,
  };
}
