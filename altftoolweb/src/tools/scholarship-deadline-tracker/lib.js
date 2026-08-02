/**
 * Scholarship Deadline Tracker — pure date arithmetic over a user-entered list
 * of scholarship windows. "Today" is always passed in as an argument so the
 * maths stays deterministic; the UI supplies the current date.
 *
 * Status rule:
 *   closed        — the close date is before today
 *   closing-soon  — 0 <= days left <= warnDays (default 7)
 *   not-open      — an open date exists and is after today
 *   open          — otherwise
 */

/**
 * Default "closing soon" horizon in days. Seven days is the common
 * last-mile window most portals use for reminder mails; user-adjustable.
 */
export const DEFAULT_WARN_DAYS = 7;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Whole days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/**
 * Evaluate one deadline row.
 *
 * @param {object} input
 * @param {string} input.name     Scholarship / task name.
 * @param {string} input.opens    Optional window-open date (yyyy-mm-dd) or "".
 * @param {string} input.closes   Close date (yyyy-mm-dd) — required.
 * @param {string} input.today    Reference date (yyyy-mm-dd).
 * @param {number} [input.warnDays] "Closing soon" horizon; default 7.
 * @returns {object} { status, daysLeft, daysToOpen } or { error }.
 */
export function evaluateDeadline({ name, opens, closes, today, warnDays = DEFAULT_WARN_DAYS }) {
  const label = typeof name === "string" && name.trim() !== "" ? name.trim() : "Untitled";
  const todayDate = parseIsoDate(today);
  if (!todayDate) return { error: "Enter today's date in yyyy-mm-dd form." };

  const closeDate = parseIsoDate(closes);
  if (!closeDate) {
    return { error: `"${label}": enter a valid close date in yyyy-mm-dd form.` };
  }

  let openDate = null;
  if (typeof opens === "string" && opens.trim() !== "") {
    openDate = parseIsoDate(opens);
    if (!openDate) {
      return { error: `"${label}": the open date is not a valid yyyy-mm-dd date.` };
    }
    if (openDate > closeDate) {
      return { error: `"${label}": the window opens after it closes — check the dates.` };
    }
  }

  const warn = Number(warnDays);
  if (!Number.isFinite(warn) || warn < 0) {
    return { error: "The closing-soon horizon must be zero or more days." };
  }

  const daysLeft = daysBetween(todayDate, closeDate);
  const daysToOpen = openDate ? daysBetween(todayDate, openDate) : null;

  let status;
  if (daysLeft < 0) {
    status = "closed";
  } else if (daysToOpen !== null && daysToOpen > 0) {
    status = "not-open";
  } else if (daysLeft <= warn) {
    status = "closing-soon";
  } else {
    status = "open";
  }

  return { name: label, status, daysLeft, daysToOpen };
}

/**
 * Evaluate and sort a whole list of deadline rows.
 * Rows with invalid dates are returned in `invalid` with their error text;
 * valid rows are sorted by close date (soonest first, closed items last).
 *
 * @returns {{items: object[], invalid: {index:number, error:string}[],
 *   counts: {open:number, closingSoon:number, notOpen:number, closed:number},
 *   nextDeadline: object|null}|{error:string}}
 */
export function trackDeadlines({ rows, today, warnDays = DEFAULT_WARN_DAYS }) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { error: "Add at least one scholarship deadline to track." };
  }
  if (!parseIsoDate(today)) {
    return { error: "Enter today's date in yyyy-mm-dd form." };
  }

  const items = [];
  const invalid = [];
  rows.forEach((row, index) => {
    const evaluated = evaluateDeadline({ ...row, today, warnDays });
    if (evaluated.error) {
      invalid.push({ index, error: evaluated.error });
    } else {
      items.push({ ...evaluated, index });
    }
  });

  // Rank actionable rows (open / closing-soon) ahead of rows whose window
  // has not opened yet, and put closed rows last of all — a deadline you
  // cannot yet act on should never outrank one you can act on today, even
  // if its close date happens to come sooner.
  const STATUS_RANK = { open: 0, "closing-soon": 0, "not-open": 1, closed: 2 };
  items.sort((a, b) => {
    const rankDiff = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (rankDiff !== 0) return rankDiff;
    return a.daysLeft - b.daysLeft;
  });

  const counts = {
    open: items.filter((i) => i.status === "open").length,
    closingSoon: items.filter((i) => i.status === "closing-soon").length,
    notOpen: items.filter((i) => i.status === "not-open").length,
    closed: items.filter((i) => i.status === "closed").length,
  };

  const nextDeadline = items.find((i) => i.status !== "closed") ?? null;

  return { items, invalid, counts, nextDeadline };
}
