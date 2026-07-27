/**
 * Change freeze calendar planner.
 *
 * Pure date arithmetic in UTC. Every date is an ISO "YYYY-MM-DD" string and is
 * passed in as an argument — nothing here reads the system clock, so the same
 * inputs always produce the same calendar.
 */

const MS_PER_DAY = 86400000;

/** Hard ceiling so one typo cannot freeze several years. */
export const MAX_PAD_DAYS = 120;
export const MIN_YEAR = 2000;
export const MAX_YEAR = 2100;

/**
 * Proleptic Gregorian leap rule: divisible by 4, except centuries, except
 * multiples of 400.
 */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}

/** @returns {number|null} epoch ms at UTC midnight, or null if unparseable. */
export function parseIsoDate(iso) {
  if (typeof iso !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ms = Date.UTC(year, month - 1, day);
  const back = new Date(ms);
  // Rejects impossible dates such as 2026-02-30, which Date.UTC would roll over.
  if (back.getUTCFullYear() !== year || back.getUTCMonth() !== month - 1 || back.getUTCDate() !== day) {
    return null;
  }
  return ms;
}

export function toIsoDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(iso, days) {
  const ms = parseIsoDate(iso);
  if (ms === null) return null;
  return toIsoDate(ms + days * MS_PER_DAY);
}

/** Inclusive day count between two ISO dates. */
export function inclusiveDays(startIso, endIso) {
  const a = parseIsoDate(startIso);
  const b = parseIsoDate(endIso);
  if (a === null || b === null || b < a) return 0;
  return Math.round((b - a) / MS_PER_DAY) + 1;
}

/** Weekdays (Mon–Fri, UTC) inside an inclusive range. */
export function weekdaysInRange(startIso, endIso) {
  const a = parseIsoDate(startIso);
  const b = parseIsoDate(endIso);
  if (a === null || b === null || b < a) return 0;
  let count = 0;
  for (let ms = a; ms <= b; ms += MS_PER_DAY) {
    const dow = new Date(ms).getUTCDay(); // 0 = Sunday, 6 = Saturday
    if (dow >= 1 && dow <= 5) count += 1;
  }
  return count;
}

export const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function weekdayName(iso) {
  const ms = parseIsoDate(iso);
  if (ms === null) return "";
  return WEEKDAY_NAMES[new Date(ms).getUTCDay()];
}

/**
 * Events whose date is the same every year in the Gregorian calendar.
 * Indian statutory FY ends 31 March (Income-tax Act, s.3 "previous year"), so
 * both the FY close and the calendar quarter ends are offered.
 */
export const FIXED_EVENT_TEMPLATES = [
  { id: "new-year", label: "New Year's Day", month: 1, day: 1, lead: 2, trail: 1, group: "Holiday" },
  { id: "republic-day", label: "Republic Day sale (India)", month: 1, day: 26, lead: 3, trail: 1, group: "Sale" },
  { id: "fy-close-in", label: "Indian financial year close (31 Mar)", month: 3, day: 31, lead: 5, trail: 2, group: "Fiscal" },
  { id: "q1-close", label: "Calendar Q2 close (30 Jun)", month: 6, day: 30, lead: 2, trail: 1, group: "Fiscal" },
  { id: "independence-day", label: "Independence Day sale (India)", month: 8, day: 15, lead: 3, trail: 1, group: "Sale" },
  { id: "q3-close", label: "Calendar Q3 close (30 Sep)", month: 9, day: 30, lead: 2, trail: 1, group: "Fiscal" },
  { id: "christmas", label: "Christmas", month: 12, day: 25, lead: 3, trail: 2, group: "Holiday" },
  { id: "year-end", label: "Year-end / Q4 close (31 Dec)", month: 12, day: 31, lead: 4, trail: 2, group: "Fiscal" },
];

/**
 * Events that move year to year — Diwali and Eid follow lunar calendars, and
 * Black Friday is the Friday after the fourth Thursday of November in the US.
 * The date is asked for rather than guessed, so nothing here can go stale.
 */
export const MOVEABLE_EVENT_TEMPLATES = [
  { id: "diwali", label: "Diwali / festive sale", lead: 7, trail: 3, group: "Sale" },
  { id: "bfcm", label: "Black Friday – Cyber Monday", lead: 5, trail: 4, group: "Sale" },
];

const pad2 = (value) => String(value).padStart(2, "0");

/** Materialise the fixed-date templates for a given year. */
export function fixedEventsForYear(year) {
  return FIXED_EVENT_TEMPLATES.map((template) => ({
    id: template.id,
    label: template.label,
    group: template.group,
    date: `${year}-${pad2(template.month)}-${pad2(template.day)}`,
    leadDays: template.lead,
    trailDays: template.trail,
  }));
}

/**
 * Compute freeze windows for a list of events and merge the ones that touch.
 *
 * @param {{events: Array<{id:string,label:string,date:string,leadDays:number,trailDays:number}>, year?: number}} input
 * @returns {{error:string}|{windows:Array,merged:Array,frozenDays:number,frozenWeekdays:number,frozenPct:number,yearDays:number,longest:object|null}}
 */
export function computeFreezeCalendar(input) {
  const { events, year } = input || {};
  if (!Array.isArray(events) || events.length === 0) {
    return { error: "Add at least one event to freeze around." };
  }
  if (year !== undefined && (!Number.isFinite(year) || year < MIN_YEAR || year > MAX_YEAR)) {
    return { error: `Year must be between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }

  const windows = [];
  for (const event of events) {
    const startMs = parseIsoDate(event?.date);
    if (startMs === null) {
      return { error: `"${event?.label || "Event"}" needs a real date in YYYY-MM-DD form.` };
    }
    const lead = Number(event.leadDays);
    const trail = Number(event.trailDays);
    if (!Number.isFinite(lead) || !Number.isFinite(trail)) {
      return { error: `"${event.label}" needs whole numbers for the days before and after.` };
    }
    if (lead < 0 || trail < 0) {
      return { error: "Days before and after an event cannot be negative." };
    }
    if (lead > MAX_PAD_DAYS || trail > MAX_PAD_DAYS) {
      return { error: `Keep the padding under ${MAX_PAD_DAYS} days on each side of an event.` };
    }
    const start = toIsoDate(startMs - Math.round(lead) * MS_PER_DAY);
    const end = toIsoDate(startMs + Math.round(trail) * MS_PER_DAY);
    windows.push({
      id: event.id,
      label: event.label,
      group: event.group || "Event",
      eventDate: event.date,
      start,
      end,
      days: inclusiveDays(start, end),
      weekdays: weekdaysInRange(start, end),
    });
  }

  windows.sort((a, b) => parseIsoDate(a.start) - parseIsoDate(b.start));

  // Merge windows that overlap or sit back to back (gap of zero days between
  // them), because a one-day thaw between two freezes is not a release window.
  const merged = [];
  for (const window of windows) {
    const last = merged[merged.length - 1];
    if (last && parseIsoDate(window.start) <= parseIsoDate(last.end) + MS_PER_DAY) {
      if (parseIsoDate(window.end) > parseIsoDate(last.end)) last.end = window.end;
      last.labels.push(window.label);
      last.days = inclusiveDays(last.start, last.end);
      last.weekdays = weekdaysInRange(last.start, last.end);
    } else {
      merged.push({
        start: window.start,
        end: window.end,
        labels: [window.label],
        days: inclusiveDays(window.start, window.end),
        weekdays: weekdaysInRange(window.start, window.end),
      });
    }
  }

  const frozenDays = merged.reduce((sum, block) => sum + block.days, 0);
  const frozenWeekdays = merged.reduce((sum, block) => sum + block.weekdays, 0);
  const yearDays = Number.isFinite(year) ? daysInYear(year) : 365;
  const frozenPct = yearDays > 0 ? Math.round((frozenDays / yearDays) * 1000) / 10 : 0;
  const longest = merged.reduce((best, block) => (!best || block.days > best.days ? block : best), null);

  // Gaps between merged blocks — the windows you can actually ship in.
  const shipWindows = [];
  for (let i = 1; i < merged.length; i += 1) {
    const gapStart = addDays(merged[i - 1].end, 1);
    const gapEnd = addDays(merged[i].start, -1);
    const days = inclusiveDays(gapStart, gapEnd);
    if (days > 0) shipWindows.push({ start: gapStart, end: gapEnd, days, weekdays: weekdaysInRange(gapStart, gapEnd) });
  }

  return {
    windows,
    merged,
    shipWindows,
    frozenDays,
    frozenWeekdays,
    frozenPct,
    yearDays,
    longest,
  };
}

/** Markdown export of a computed calendar. */
export function freezeCalendarMarkdown(result, year) {
  if (!result || result.error) return "";
  const lines = [
    `# Change freeze calendar${Number.isFinite(year) ? ` — ${year}` : ""}`,
    "",
    `- Frozen days: ${result.frozenDays} of ${result.yearDays} (${result.frozenPct}%)`,
    `- Frozen weekdays: ${result.frozenWeekdays}`,
    `- Freeze blocks: ${result.merged.length}`,
    "",
    "## Freeze blocks",
  ];
  for (const block of result.merged) {
    lines.push(`- ${block.start} to ${block.end} (${block.days} days) — ${block.labels.join(", ")}`);
  }
  if (result.shipWindows.length) {
    lines.push("", "## Release windows between freezes");
    for (const gap of result.shipWindows) {
      lines.push(`- ${gap.start} to ${gap.end} (${gap.weekdays} weekdays)`);
    }
  }
  return lines.join("\n");
}
