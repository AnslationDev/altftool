/**
 * Legal deadline countdown board.
 *
 * Everything is done in whole calendar days on the proleptic Gregorian
 * calendar, using UTC midnight for each date so that a user's local timezone
 * or daylight-saving change can never shift a count by a day:
 *
 *   daysRemaining = (dueUTC - todayUTC) / 86,400,000
 *
 * Working days are counted the way a docket clerk counts them - every day
 * strictly after "today" up to and including the due date that is not a
 * Saturday or Sunday, plus any date the user lists as a court holiday.
 * Court/registry holidays vary by jurisdiction and by year, so they are an
 * input rather than a hardcoded table.
 */

/** Milliseconds in one calendar day (no leap seconds in JS Date arithmetic). */
export const MS_PER_DAY = 86400000;

/** Day-of-week indices returned by Date.prototype.getUTCDay(). */
export const SUNDAY = 0;
export const SATURDAY = 6;

/**
 * Reminder bands. These mirror the tiering most litigation docketing systems
 * use - a final call the day before, a short fuse inside the working week, a
 * one-week warning and a one-month horizon. They are a convention, not a rule
 * of procedure.
 */
export const BANDS = [
  { id: "overdue", label: "Overdue", tone: "danger", max: -1 },
  { id: "today", label: "Due today", tone: "danger", max: 0 },
  { id: "critical", label: "Critical", tone: "danger", max: 3 },
  { id: "warning", label: "This week", tone: "warning", max: 7 },
  { id: "upcoming", label: "Upcoming", tone: "primary", max: 30 },
  { id: "clear", label: "Clear", tone: "success", max: Infinity },
];

/** Longest horizon the board will accept, to keep typos from silly output. */
export const MAX_HORIZON_DAYS = 3650;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parse a "YYYY-MM-DD" string into a UTC-midnight timestamp.
 * Returns null for anything that is not a real calendar date.
 */
export function parseIsoDate(value) {
  const raw = String(value ?? "").trim();
  if (!ISO_DATE.test(raw)) return null;
  const year = Number(raw.slice(0, 4));
  const month = Number(raw.slice(5, 7));
  const day = Number(raw.slice(8, 10));
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ts = Date.UTC(year, month - 1, day);
  const back = new Date(ts);
  // Rejects 2025-02-30 and friends, which Date.UTC would silently roll over.
  if (
    back.getUTCFullYear() !== year ||
    back.getUTCMonth() !== month - 1 ||
    back.getUTCDate() !== day
  ) {
    return null;
  }
  return ts;
}

/** Add whole days to an ISO date and return a new ISO date string. */
export function addDays(iso, days) {
  const ts = parseIsoDate(iso);
  const n = Number(days);
  if (ts === null || !Number.isFinite(n)) return null;
  return new Date(ts + Math.round(n) * MS_PER_DAY).toISOString().slice(0, 10);
}

/** Signed whole calendar days from `fromIso` to `toIso`. */
export function daysBetween(fromIso, toIso) {
  const a = parseIsoDate(fromIso);
  const b = parseIsoDate(toIso);
  if (a === null || b === null) return null;
  return Math.round((b - a) / MS_PER_DAY);
}

/**
 * Signed working days from `fromIso` to `toIso`, counting the days strictly
 * after `fromIso` through `toIso` inclusive. Saturdays, Sundays and any date in
 * `holidays` are excluded. A past due date returns a negative count.
 */
export function workingDaysBetween(fromIso, toIso, holidays = []) {
  const from = parseIsoDate(fromIso);
  const to = parseIsoDate(toIso);
  if (from === null || to === null) return null;
  if (from === to) return 0;

  const skip = new Set();
  for (const h of holidays) {
    const ts = parseIsoDate(h);
    if (ts !== null) skip.add(ts);
  }

  const forward = to > from;
  const start = forward ? from : to;
  const end = forward ? to : from;
  if ((end - start) / MS_PER_DAY > MAX_HORIZON_DAYS) return null;

  let count = 0;
  for (let ts = start + MS_PER_DAY; ts <= end; ts += MS_PER_DAY) {
    const dow = new Date(ts).getUTCDay();
    if (dow === SATURDAY || dow === SUNDAY) continue;
    if (skip.has(ts)) continue;
    count += 1;
  }
  return forward ? count : -count;
}

/** The reminder band a given day count falls into. */
export function bandFor(daysRemaining) {
  if (!Number.isFinite(daysRemaining)) return BANDS[BANDS.length - 1];
  for (const band of BANDS) {
    if (daysRemaining <= band.max) return band;
  }
  return BANDS[BANDS.length - 1];
}

/**
 * Build the board.
 *
 * @param {object} input
 * @param {string} input.today       Reference date, "YYYY-MM-DD".
 * @param {Array}  input.items       [{ id, title, matter, due, notice }]
 *                                   `notice` is the lead time in days the user
 *                                   wants to start work before the due date.
 * @param {string[]} [input.holidays] Extra non-working dates, "YYYY-MM-DD".
 * @returns {object} { rows, counts, nextDue, overdueCount, ... } or { error }.
 */
export function computeDeadlineBoard({ today, items = [], holidays = [] }) {
  const todayTs = parseIsoDate(today);
  if (todayTs === null) {
    return { error: "Enter today's date as a real calendar date (YYYY-MM-DD)." };
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Add at least one deadline to build the board." };
  }

  const cleanHolidays = [];
  for (const h of holidays) {
    if (parseIsoDate(h) !== null) cleanHolidays.push(h);
  }

  const rows = [];
  for (const item of items) {
    const title = String(item?.title ?? "").trim();
    const due = String(item?.due ?? "").trim();
    if (title === "" && due === "") continue;
    if (title === "") return { error: "Every deadline needs a name." };
    const dueTs = parseIsoDate(due);
    if (dueTs === null) {
      return { error: `"${title}" needs a valid due date (YYYY-MM-DD).` };
    }
    const spread = Math.abs(dueTs - todayTs) / MS_PER_DAY;
    if (spread > MAX_HORIZON_DAYS) {
      return {
        error: `"${title}" is more than ${MAX_HORIZON_DAYS} days from today - check the year.`,
      };
    }

    const noticeRaw = Number(item?.notice);
    const notice = Number.isFinite(noticeRaw) && noticeRaw >= 0 ? Math.round(noticeRaw) : 0;
    if (notice > MAX_HORIZON_DAYS) {
      return { error: `The lead time on "${title}" is unrealistically long.` };
    }

    const daysRemaining = Math.round((dueTs - todayTs) / MS_PER_DAY);
    const workingDays = workingDaysBetween(today, due, cleanHolidays);
    const startBy = addDays(due, -notice);
    const daysToStart = daysRemaining - notice;

    rows.push({
      id: item?.id ?? `${title}-${due}`,
      title,
      matter: String(item?.matter ?? "").trim(),
      due,
      dueWeekday: new Date(dueTs).getUTCDay(),
      notice,
      startBy,
      daysToStart,
      startOverdue: daysToStart < 0,
      daysRemaining,
      workingDays,
      weeksRemaining: daysRemaining / 7,
      overdue: daysRemaining < 0,
      dueToday: daysRemaining === 0,
      band: bandFor(daysRemaining),
    });
  }

  if (rows.length === 0) {
    return { error: "Add at least one deadline to build the board." };
  }

  rows.sort((a, b) => a.daysRemaining - b.daysRemaining || a.title.localeCompare(b.title));

  const counts = {};
  for (const band of BANDS) counts[band.id] = 0;
  for (const row of rows) counts[row.band.id] += 1;

  const future = rows.filter((r) => r.daysRemaining >= 0);
  const nextDue = future.length > 0 ? future[0] : null;

  return {
    rows,
    counts,
    total: rows.length,
    overdueCount: rows.filter((r) => r.overdue).length,
    dueTodayCount: rows.filter((r) => r.dueToday).length,
    withinSevenDays: rows.filter((r) => r.daysRemaining >= 0 && r.daysRemaining <= 7).length,
    startNowCount: rows.filter((r) => r.daysToStart <= 0 && !r.overdue).length,
    nextDue,
    holidaysUsed: cleanHolidays.length,
  };
}
