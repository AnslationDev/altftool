/**
 * Weekly Planner — the scheduling arithmetic behind a seven-day plan.
 *
 * Everything here is calendar and interval maths, done in whole minutes from
 * midnight so there is no floating-point drift and no timezone surprise:
 *
 *   start of week  = date - ((weekday - weekStartsOn + 7) mod 7) days
 *   block end      = start minutes + duration minutes
 *   two blocks clash when  a.start < b.end  AND  b.start < a.end
 *   day load       = sum of block minutes / minutes in the waking window
 *
 * Dates are handled as plain "YYYY-MM-DD" strings and converted with Date.UTC,
 * never with the local-time Date constructor, because `new Date("2026-07-28")`
 * is parsed as UTC midnight while `new Date(2026, 6, 28)` is local midnight —
 * mixing the two shifts a planner by a day for anyone west of Greenwich.
 *
 * Pure module: no React, no DOM, no clock reads. The current date is always
 * passed in by the caller.
 */

/** Minutes in a day. */
export const MINUTES_PER_DAY = 24 * 60;

/** Day names, index 0 = Sunday, matching Date#getUTCDay. */
export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Default waking window used to measure how full a day is: 08:00 to 22:00. */
export const DEFAULT_DAY_START_MINUTES = 8 * 60;
export const DEFAULT_DAY_END_MINUTES = 22 * 60;

/** Categories a block can be tagged with. */
export const CATEGORIES = [
  { id: "deep-work", label: "Deep work" },
  { id: "meetings", label: "Meetings" },
  { id: "admin", label: "Admin" },
  { id: "learning", label: "Learning" },
  { id: "health", label: "Health" },
  { id: "personal", label: "Personal" },
  { id: "rest", label: "Rest" },
];

export const PRIORITIES = [
  { id: "high", label: "High", weight: 3 },
  { id: "medium", label: "Medium", weight: 2 },
  { id: "low", label: "Low", weight: 1 },
];

/**
 * A day is "overloaded" once planned blocks fill more than this share of the
 * waking window. 85% leaves roughly two hours of the day unbooked for the
 * transitions, overruns and interruptions every real schedule has.
 */
export const OVERLOAD_THRESHOLD_PERCENT = 85;

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/** Parse "YYYY-MM-DD" into a UTC-midnight Date, or null if malformed. */
export function isoToUtcDate(iso) {
  const match = ISO_RE.exec(String(iso ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

/** Format a UTC Date back to "YYYY-MM-DD". */
export function utcDateToIso(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** Shift an ISO date by a whole number of days. */
export function addDays(iso, days) {
  const date = isoToUtcDate(iso);
  if (!date || !isNum(days)) return { error: "Enter a valid date in YYYY-MM-DD form." };
  return { iso: utcDateToIso(new Date(date.getTime() + Math.round(days) * MINUTES_PER_DAY * 60 * 1000)) };
}

/**
 * First day of the week containing `iso`.
 *
 * @param {string} iso
 * @param {number} weekStartsOn 0 = Sunday, 1 = Monday
 */
export function startOfWeek(iso, weekStartsOn = 1) {
  const date = isoToUtcDate(iso);
  if (!date) return { error: "Enter a valid date in YYYY-MM-DD form." };
  if (weekStartsOn !== 0 && weekStartsOn !== 1) return { error: "Weeks can start on Sunday (0) or Monday (1)." };
  const offset = (date.getUTCDay() - weekStartsOn + 7) % 7;
  return addDays(iso, -offset);
}

/** The seven dated days of a week beginning at `startIso`. */
export function buildWeek(startIso) {
  const first = isoToUtcDate(startIso);
  if (!first) return { error: "Enter a valid week start date in YYYY-MM-DD form." };
  const days = [];
  for (let i = 0; i < 7; i += 1) {
    const shifted = addDays(startIso, i);
    const date = isoToUtcDate(shifted.iso);
    days.push({
      iso: shifted.iso,
      weekday: date.getUTCDay(),
      dayName: DAY_NAMES[date.getUTCDay()],
      dayShort: DAY_SHORT[date.getUTCDay()],
      dayOfMonth: date.getUTCDate(),
      monthShort: MONTH_SHORT[date.getUTCMonth()],
      label: `${DAY_SHORT[date.getUTCDay()]} ${date.getUTCDate()} ${MONTH_SHORT[date.getUTCMonth()]}`,
    });
  }
  return { days };
}

/** Parse "HH:MM" into minutes after midnight. */
export function parseTime(text) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(text ?? "").trim());
  if (!match) return { error: "Use a 24-hour time such as 09:30." };
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return { error: "Hours must be 0-23 and minutes 0-59." };
  return { minutes: hours * 60 + minutes };
}

/** Format minutes after midnight as "HH:MM". */
export function formatTime(minutes) {
  if (!isNum(minutes)) return "--:--";
  const wrapped = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(Math.floor(wrapped / 60))}:${pad(wrapped % 60)}`;
}

/** Format a span of minutes as "2h 30m". */
export function formatDuration(minutes) {
  if (!isNum(minutes) || minutes < 0) return "—";
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Validate one planned block before it joins the week.
 *
 * @param {{ title: string, dayIso: string, start: string, durationMinutes: number }} block
 */
export function validateBlock({ title, dayIso, start, durationMinutes }) {
  if (!String(title ?? "").trim()) return { error: "Give the block a name." };
  if (!isoToUtcDate(dayIso)) return { error: "Pick a day inside the week." };
  const parsed = parseTime(start);
  if (parsed.error) return parsed;
  if (!isNum(durationMinutes) || durationMinutes <= 0) return { error: "Duration must be more than zero minutes." };
  if (durationMinutes > MINUTES_PER_DAY) return { error: "A single block cannot be longer than 24 hours." };
  if (parsed.minutes + durationMinutes > MINUTES_PER_DAY) {
    return { error: `A block starting at ${formatTime(parsed.minutes)} can run for at most ${formatDuration(MINUTES_PER_DAY - parsed.minutes)} before midnight.` };
  }
  return { startMinutes: parsed.minutes, endMinutes: parsed.minutes + durationMinutes };
}

/**
 * Lay blocks out across the week, sorted by start time, with clashes flagged
 * and each day's load measured against the waking window.
 *
 * @param {{ blocks: Array, days: Array,
 *           dayStartMinutes?: number, dayEndMinutes?: number }} input
 */
export function planWeek({ blocks, days, dayStartMinutes = DEFAULT_DAY_START_MINUTES, dayEndMinutes = DEFAULT_DAY_END_MINUTES }) {
  if (!Array.isArray(blocks)) return { error: "The block list is missing." };
  if (!Array.isArray(days) || days.length !== 7) return { error: "A week needs exactly seven days." };
  if (!isNum(dayStartMinutes) || !isNum(dayEndMinutes)) return { error: "Set the start and end of your working day." };
  if (dayEndMinutes <= dayStartMinutes) return { error: "The end of your day must be later than the start." };

  const windowMinutes = dayEndMinutes - dayStartMinutes;
  const categoryMinutes = {};
  const priorityMinutes = {};
  let totalMinutes = 0;
  let totalClashes = 0;

  const laidOut = days.map((day) => {
    const forDay = blocks
      .filter((b) => b.dayIso === day.iso)
      .map((b) => {
        const checked = validateBlock(b);
        if (checked.error) return null;
        return { ...b, startMinutes: checked.startMinutes, endMinutes: checked.endMinutes };
      })
      .filter(Boolean)
      .sort((a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes);

    const clashIds = new Set();
    for (let i = 0; i < forDay.length; i += 1) {
      for (let j = i + 1; j < forDay.length; j += 1) {
        if (forDay[i].startMinutes < forDay[j].endMinutes && forDay[j].startMinutes < forDay[i].endMinutes) {
          clashIds.add(forDay[i].id);
          clashIds.add(forDay[j].id);
        }
      }
    }
    totalClashes += clashIds.size;

    let plannedMinutes = 0;
    for (const block of forDay) {
      plannedMinutes += block.endMinutes - block.startMinutes;
      categoryMinutes[block.category] = (categoryMinutes[block.category] ?? 0) + (block.endMinutes - block.startMinutes);
      priorityMinutes[block.priority] = (priorityMinutes[block.priority] ?? 0) + (block.endMinutes - block.startMinutes);
    }
    totalMinutes += plannedMinutes;

    // Union of covered minutes inside the waking window, so overlapping blocks
    // are not double-counted when measuring free time.
    let coveredInWindow = 0;
    let cursor = dayStartMinutes;
    for (const block of forDay) {
      const from = Math.max(block.startMinutes, cursor, dayStartMinutes);
      const to = Math.min(block.endMinutes, dayEndMinutes);
      if (to > from) {
        coveredInWindow += to - from;
        cursor = to;
      }
    }
    const freeMinutes = Math.max(0, windowMinutes - coveredInWindow);
    const loadPercent = windowMinutes > 0 ? (coveredInWindow / windowMinutes) * 100 : 0;

    return {
      ...day,
      blocks: forDay,
      clashIds,
      plannedMinutes,
      coveredInWindow,
      freeMinutes,
      loadPercent,
      overloaded: loadPercent > OVERLOAD_THRESHOLD_PERCENT,
    };
  });

  const busiest = laidOut.reduce((best, day) => (day.plannedMinutes > best.plannedMinutes ? day : best), laidOut[0]);
  const lightest = laidOut.reduce((least, day) => (day.plannedMinutes < least.plannedMinutes ? day : least), laidOut[0]);
  const weekWindowMinutes = windowMinutes * 7;

  return {
    days: laidOut,
    totalMinutes,
    totalBlocks: laidOut.reduce((sum, day) => sum + day.blocks.length, 0),
    totalClashes,
    weekWindowMinutes,
    weekLoadPercent: weekWindowMinutes > 0 ? (totalMinutes / weekWindowMinutes) * 100 : 0,
    freeMinutes: laidOut.reduce((sum, day) => sum + day.freeMinutes, 0),
    busiestDay: busiest ? busiest.label : "",
    busiestMinutes: busiest ? busiest.plannedMinutes : 0,
    lightestDay: lightest ? lightest.label : "",
    categoryMinutes,
    priorityMinutes,
  };
}

/** Render a week as plain text, for the copy button. */
export function weekToText(plan, weekLabel) {
  if (!plan || plan.error) return "";
  const lines = [`Weekly plan — ${weekLabel}`, ""];
  for (const day of plan.days) {
    lines.push(`${day.label} (${formatDuration(day.plannedMinutes)} planned, ${formatDuration(day.freeMinutes)} free)`);
    if (day.blocks.length === 0) lines.push("  — nothing scheduled —");
    for (const block of day.blocks) {
      const clash = day.clashIds.has(block.id) ? "  [clash]" : "";
      lines.push(`  ${formatTime(block.startMinutes)}-${formatTime(block.endMinutes)}  ${block.title}${clash}`);
    }
    lines.push("");
  }
  lines.push(`Total planned: ${formatDuration(plan.totalMinutes)} across ${plan.totalBlocks} blocks`);
  lines.push(`Week load: ${plan.weekLoadPercent.toFixed(1)}% of the waking window`);
  return lines.join("\n");
}
