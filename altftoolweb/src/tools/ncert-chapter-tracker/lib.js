/**
 * NCERT chapter tracker.
 *
 * Each book is a list of chapters; each chapter carries one of four statuses.
 * Progress convention used by the tool:
 *  - "% read"    = chapters in status read OR revised, over total chapters.
 *  - "% revised" = chapters in status revised, over total chapters.
 * Overall progress across books is weighted by chapter count, i.e. total
 * qualifying chapters over total chapters — not an average of book percentages.
 */

/** Chapter statuses in cycling order (tapping a chapter advances one step). */
export const STATUSES = [
  { id: "not-started", label: "Not started", short: "—" },
  { id: "reading", label: "Reading", short: "R" },
  { id: "read", label: "Read once", short: "✓" },
  { id: "revised", label: "Revised", short: "✓✓" },
];

export const STATUS_IDS = STATUSES.map((status) => status.id);

/** Advance a chapter one step in the cycle, wrapping back to not-started. */
export function nextStatus(statusId) {
  const index = STATUS_IDS.indexOf(statusId);
  return STATUS_IDS[(index + 1) % STATUS_IDS.length];
}

/** Practical bounds on chapters per book; no NCERT textbook exceeds this. */
export const MIN_CHAPTERS = 1;
export const MAX_CHAPTERS = 40;

/**
 * Chapter counts for the RATIONALISED NCERT textbooks (the editions in print
 * from academic year 2023-24 onward, after NCERT's 2022 syllabus
 * rationalisation trimmed chapters). Older pre-2023 prints have more chapters —
 * the count field stays editable for that reason.
 */
export const NCERT_PRESETS = [
  { id: "c10-sci", label: "Class 10 Science (rationalised)", chapters: 13 },
  { id: "c10-math", label: "Class 10 Maths (rationalised)", chapters: 14 },
  { id: "c11-phy", label: "Class 11 Physics (rationalised)", chapters: 14 },
  { id: "c11-chem", label: "Class 11 Chemistry (rationalised)", chapters: 9 },
  { id: "c12-phy", label: "Class 12 Physics (rationalised)", chapters: 14 },
  { id: "c12-chem", label: "Class 12 Chemistry (rationalised)", chapters: 10 },
  { id: "c12-bio", label: "Class 12 Biology (rationalised)", chapters: 13 },
  { id: "c12-math", label: "Class 12 Maths (rationalised)", chapters: 13 },
];

/**
 * Summarise one book.
 * @param {object} input
 * @param {string} input.name
 * @param {string[]} input.statuses  One status id per chapter.
 * @returns {object} summary or { error }
 */
export function summarizeBook({ name, statuses }) {
  const title = typeof name === "string" ? name.trim() : "";
  if (title === "") return { error: "Give the book a name." };
  if (!Array.isArray(statuses) || statuses.length < MIN_CHAPTERS || statuses.length > MAX_CHAPTERS) {
    return { error: `"${title}": chapter count must be between ${MIN_CHAPTERS} and ${MAX_CHAPTERS}.` };
  }
  const counts = { "not-started": 0, reading: 0, read: 0, revised: 0 };
  for (const status of statuses) {
    if (!(status in counts)) return { error: `"${title}": unknown chapter status "${status}".` };
    counts[status] += 1;
  }
  const total = statuses.length;
  const readOrBetter = counts.read + counts.revised;
  return {
    name: title,
    total,
    counts,
    readOrBetter,
    percentRead: (readOrBetter / total) * 100,
    percentRevised: (counts.revised / total) * 100,
    complete: counts.revised === total,
  };
}

/**
 * Summarise all books, weighting overall progress by chapter count.
 * @param {object} input
 * @param {Array<{name: string, statuses: string[]}>} input.books
 * @returns {object} { books, totalChapters, overallPercentRead, overallPercentRevised, ... } or { error }
 */
export function summarizeTracker({ books }) {
  if (!Array.isArray(books) || books.length === 0) {
    return { error: "Add at least one NCERT book to track." };
  }
  const summaries = [];
  for (const book of books) {
    const summary = summarizeBook(book);
    if (summary.error) return { error: summary.error };
    summaries.push(summary);
  }
  const totalChapters = summaries.reduce((sum, book) => sum + book.total, 0);
  const totalRead = summaries.reduce((sum, book) => sum + book.readOrBetter, 0);
  const totalRevised = summaries.reduce((sum, book) => sum + book.counts.revised, 0);
  const remaining = totalChapters - totalRead;

  return {
    books: summaries,
    bookCount: summaries.length,
    totalChapters,
    totalRead,
    totalRevised,
    remaining,
    overallPercentRead: totalChapters > 0 ? (totalRead / totalChapters) * 100 : 0,
    overallPercentRevised: totalChapters > 0 ? (totalRevised / totalChapters) * 100 : 0,
  };
}

/** Build a fresh statuses array for a book of `count` chapters. */
export function freshStatuses(count) {
  const n = Number(count);
  if (!Number.isInteger(n) || n < MIN_CHAPTERS || n > MAX_CHAPTERS) return [];
  return Array.from({ length: n }, () => STATUS_IDS[0]);
}

/**
 * Resize a statuses array to a new chapter count, preserving existing statuses
 * and appending not-started chapters. Returns [] when the count is invalid.
 */
export function resizeStatuses(statuses, count) {
  const n = Number(count);
  if (!Number.isInteger(n) || n < MIN_CHAPTERS || n > MAX_CHAPTERS) return [];
  const base = Array.isArray(statuses) ? statuses.slice(0, n) : [];
  while (base.length < n) base.push(STATUS_IDS[0]);
  return base;
}
