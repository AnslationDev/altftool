/**
 * Exam notification alert planner.
 *
 * Recruitment and entrance bodies publish notifications in a broadly stable
 * month each cycle, but the exact date moves every year. The planner
 * therefore anchors each alert to the FIRST day of the expected month (the
 * earliest the notification could plausibly drop) and derives a reminder date
 * a chosen number of days before that anchor.
 *
 *   nextOccurrence = 1st of expected month, this year if still ahead of
 *                    "today", otherwise next year
 *   reminderDate   = nextOccurrence - leadDays
 */

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Default reminder lead. Most Indian recruitment notifications keep the
 * application window open 3-4 weeks, so a 15-day head start before the
 * expected month leaves time to arrange photographs, certificates and fee
 * payment without racing the deadline.
 */
export const DEFAULT_LEAD_DAYS = 15;

/** A reminder more than a year ahead is meaningless for an annual cycle. */
export const MAX_LEAD_DAYS = 365;

/**
 * Months these exams' notifications have typically appeared in over recent
 * cycles. They shift year to year — the official calendar is always the
 * authority; these are planning defaults only.
 */
export const EXAM_PRESETS = [
  { id: "upsc-cse", name: "UPSC Civil Services (prelims notification)", month: 2 },
  { id: "ssc-cgl", name: "SSC CGL", month: 6 },
  { id: "ibps-po", name: "IBPS PO", month: 8 },
  { id: "jee-main-1", name: "JEE Main (session 1)", month: 11 },
  { id: "neet-ug", name: "NEET UG", month: 2 },
  { id: "ctet", name: "CTET", month: 9 },
];

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

/** Whole days between two UTC-midnight dates (positive when `to` is later). */
export function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/** Format a UTC-midnight Date as yyyy-mm-dd. */
export function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Compute the alert schedule for every followed exam.
 *
 * @param {object} input
 * @param {Array}  input.items  [{ name, month (1-12), leadDays }]
 * @param {string} input.today  yyyy-mm-dd, injected by the caller.
 * @returns {{alerts:Array, nextUp:object|null}|{error:string}}
 */
export function computeAlerts({ items, today }) {
  if (!Array.isArray(items)) return { error: "Add at least one exam to follow." };
  const now = parseIsoDate(today);
  if (!now) return { error: "Enter today's date as yyyy-mm-dd." };

  const alerts = [];
  for (const item of items) {
    const name = typeof item.name === "string" ? item.name.trim() : "";
    if (name === "") return { error: "Every followed exam needs a name." };

    const month = Number(item.month);
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return { error: `"${name}": expected month must be 1-12.` };
    }

    const leadDays = item.leadDays === undefined ? DEFAULT_LEAD_DAYS : Number(item.leadDays);
    if (!Number.isInteger(leadDays) || leadDays < 0 || leadDays > MAX_LEAD_DAYS) {
      return { error: `"${name}": reminder lead must be 0-${MAX_LEAD_DAYS} days.` };
    }

    // Anchor: 1st of the expected month, rolling to next year once passed.
    let occurrence = new Date(Date.UTC(now.getUTCFullYear(), month - 1, 1));
    if (occurrence < now) {
      occurrence = new Date(Date.UTC(now.getUTCFullYear() + 1, month - 1, 1));
    }
    const reminder = new Date(occurrence.getTime() - leadDays * MS_PER_DAY);

    const daysToNotification = daysBetween(now, occurrence);
    const daysToReminder = daysBetween(now, reminder);

    alerts.push({
      name,
      month,
      monthName: MONTH_NAMES[month - 1],
      leadDays,
      expectedDate: toIsoDate(occurrence),
      reminderDate: toIsoDate(reminder),
      daysToNotification,
      daysToReminder,
      // Reminder date already passed but the window hasn't opened yet:
      // start preparing documents now.
      reminderDue: daysToReminder <= 0 && daysToNotification > 0,
      // Anchor is today: the notification month has arrived — check the site.
      windowOpen: daysToNotification === 0,
    });
  }

  alerts.sort((a, b) => a.daysToNotification - b.daysToNotification);
  return { alerts, nextUp: alerts[0] ?? null };
}
