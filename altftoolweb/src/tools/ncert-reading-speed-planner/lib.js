/**
 * NCERT reading speed planner.
 *
 * Plain scheduling arithmetic, all steps stated:
 *   calendar days   = days from start date to target date, both inclusive
 *   study days      = floor(calendar days x (7 - days off per week) / 7)
 *   effective days  = floor(study days x (1 - revision buffer %))
 *   pages per day   = ceil(pages left / effective days)
 * Floors are used on days (you cannot study a fraction of a day you don't have)
 * and ceil on pages (finishing requires rounding the daily quota up).
 */

/** Upper sanity bounds — the full class 6-12 NCERT stack is commonly cited around 10-12k pages. */
export const MAX_TOTAL_PAGES = 50000;

/** A dense NCERT page with notes is commonly planned at ~3 minutes; user-adjustable. */
export const DEFAULT_MINUTES_PER_PAGE = 3;
export const MAX_MINUTES_PER_PAGE = 60;

export const DAYS_PER_WEEK = 7;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

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

/**
 * Build the reading plan.
 * @param {object} input
 * @param {number} input.totalPages       Total pages in the book/stack.
 * @param {number} [input.pagesDone]      Pages already read (default 0).
 * @param {string} input.startDate        yyyy-mm-dd, first reading day.
 * @param {string} input.targetDate      yyyy-mm-dd, last day you allow yourself.
 * @param {number} [input.daysOffPerWeek] 0-6 rest days per week (default 1).
 * @param {number} [input.bufferPercent]  0-90, share of study days reserved for revision (default 10).
 * @param {number} [input.minutesPerPage] Minutes one page takes you (default 3).
 * @returns {object} plan or { error }
 */
export function planReading({
  totalPages,
  pagesDone = 0,
  startDate,
  targetDate,
  daysOffPerWeek = 1,
  bufferPercent = 10,
  minutesPerPage = DEFAULT_MINUTES_PER_PAGE,
}) {
  const total = Number(totalPages);
  const done = Number(pagesDone);
  const off = Number(daysOffPerWeek);
  const buffer = Number(bufferPercent);
  const minsPerPage = Number(minutesPerPage);

  if (!Number.isFinite(total) || total <= 0 || total > MAX_TOTAL_PAGES) {
    return { error: `Total pages must be between 1 and ${MAX_TOTAL_PAGES}.` };
  }
  if (!Number.isFinite(done) || done < 0) {
    return { error: "Pages already read cannot be negative." };
  }
  if (done > total) {
    return { error: "Pages already read cannot exceed the total pages." };
  }
  if (!Number.isInteger(off) || off < 0 || off > DAYS_PER_WEEK - 1) {
    return { error: "Days off per week must be a whole number from 0 to 6." };
  }
  if (!Number.isFinite(buffer) || buffer < 0 || buffer > 90) {
    return { error: "Revision buffer must be between 0% and 90%." };
  }
  if (!Number.isFinite(minsPerPage) || minsPerPage <= 0 || minsPerPage > MAX_MINUTES_PER_PAGE) {
    return { error: `Minutes per page must be above 0 and at most ${MAX_MINUTES_PER_PAGE}.` };
  }

  const start = parseIsoDate(startDate);
  const target = parseIsoDate(targetDate);
  if (!start) return { error: "Enter a valid start date." };
  if (!target) return { error: "Enter a valid target date." };
  if (target < start) return { error: "The target date is before the start date." };

  // Both endpoints count as available days.
  const calendarDays = Math.round((target.getTime() - start.getTime()) / MS_PER_DAY) + 1;
  const studyDays = Math.floor((calendarDays * (DAYS_PER_WEEK - off)) / DAYS_PER_WEEK);
  const bufferDays = Math.floor((studyDays * buffer) / 100);
  const effectiveDays = studyDays - bufferDays;

  const pagesLeft = total - done;

  if (pagesLeft === 0) {
    return {
      calendarDays,
      studyDays,
      bufferDays,
      effectiveDays,
      pagesLeft: 0,
      pagesPerDay: 0,
      minutesPerDay: 0,
      finished: true,
    };
  }
  if (effectiveDays < 1) {
    return {
      error:
        "No reading days remain after days off and the revision buffer — extend the target date or cut the buffer.",
    };
  }

  const pagesPerDay = Math.ceil(pagesLeft / effectiveDays);
  const minutesPerDay = Math.ceil(pagesPerDay * minsPerPage);

  return {
    calendarDays,
    studyDays,
    bufferDays,
    effectiveDays,
    pagesLeft,
    pagesPerDay,
    minutesPerDay,
    finished: false,
  };
}
