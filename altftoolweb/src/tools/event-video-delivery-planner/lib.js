/**
 * Event video delivery planner.
 *
 * Two independent calculations, both pure:
 *
 * 1. Dates. Every deliverable has a turnaround measured from the last day of the
 *    event. Turnaround can be counted in calendar days or in business days
 *    (Monday to Friday), which is what most production agreements actually say.
 *    All date maths runs in UTC on YYYY-MM-DD strings so it never shifts with
 *    the viewer's time zone, and "today" is never consulted — the event date is
 *    always supplied by the caller.
 *
 * 2. Effort. Post-production is estimated as
 *        edit hours = fixed hours + finished minutes x hours-per-finished-minute
 *    The hours-per-finished-minute figure is the standard way editorial work is
 *    quoted: a fast social cutdown with no grade is a small multiple, a heavily
 *    crafted highlight film is a large one. The defaults here are planning
 *    figures and every one of them is editable.
 */

const DAY_MS = 86_400_000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Saturday = 6, Sunday = 0 in JS getUTCDay(). */
const WEEKEND_DAYS = new Set([0, 6]);

export const MIN_HOURS_PER_DAY = 1;
export const MAX_HOURS_PER_DAY = 16;
export const MAX_RUNTIME_MINUTES = 600;

/**
 * Deliverable catalogue.
 *  - runtimeMinutes: typical finished duration
 *  - hoursPerMinute:  editorial hours per finished minute (planning ratio)
 *  - fixedHours:      ingest, export, upload and admin that does not scale with runtime
 *  - turnaround:      days after the event the client expects it
 */
export const DELIVERABLE_CATALOGUE = [
  {
    id: "social-teaser",
    name: "Same-week social teaser (vertical)",
    runtimeMinutes: 0.5,
    hoursPerMinute: 3,
    fixedHours: 1,
    turnaround: 2,
    note: "Cut fast, graphics-light, exported 9:16 and 1:1.",
  },
  {
    id: "highlight",
    name: "Highlight film",
    runtimeMinutes: 3,
    hoursPerMinute: 8,
    fixedHours: 3,
    turnaround: 14,
    note: "The hero deliverable: music-led, graded, sound-designed.",
  },
  {
    id: "keynote",
    name: "Full keynote or ceremony (multicam)",
    runtimeMinutes: 60,
    hoursPerMinute: 1.5,
    fixedHours: 4,
    turnaround: 21,
    note: "Sync, switch, clean audio. Long but mostly mechanical.",
  },
  {
    id: "session-cuts",
    name: "Individual session cuts",
    runtimeMinutes: 30,
    hoursPerMinute: 1,
    fixedHours: 3,
    turnaround: 21,
    note: "Topped and tailed, slated, captioned on request.",
  },
  {
    id: "testimonials",
    name: "Attendee testimonial reel",
    runtimeMinutes: 2,
    hoursPerMinute: 6,
    fixedHours: 2,
    turnaround: 21,
    note: "Interview selects, paper edit first, then assembly.",
  },
  {
    id: "sizzle",
    name: "Next-year sizzle / sales promo",
    runtimeMinutes: 1.5,
    hoursPerMinute: 10,
    fixedHours: 3,
    turnaround: 30,
    note: "Highest craft per second; usually needs client sign-off rounds.",
  },
  {
    id: "archive",
    name: "Raw footage archive handover",
    runtimeMinutes: 0,
    hoursPerMinute: 0,
    fixedHours: 4,
    turnaround: 7,
    note: "Offload, checksum, transcode proxies, upload or ship drive.",
  },
];

export const TURNAROUND_MODES = [
  { id: "business", label: "Business days (Mon–Fri)" },
  { id: "calendar", label: "Calendar days" },
];

const round1 = (value) => Math.round(value * 10) / 10;

/** Parse a YYYY-MM-DD string into UTC midnight ms, or null if invalid. */
export function parseIsoDate(iso) {
  if (typeof iso !== "string" || !ISO_DATE.test(iso)) return null;
  const [year, month, day] = iso.split("-").map(Number);
  const ms = Date.UTC(year, month - 1, day);
  const date = new Date(ms);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return ms;
}

/** UTC ms back to YYYY-MM-DD. */
export function toIsoDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * YYYY-MM-DD for a Date object read in the viewer's own calendar.
 * Takes the Date as an argument so this stays pure and testable.
 */
export function formatLocalIso(dateObject) {
  if (!(dateObject instanceof Date) || Number.isNaN(dateObject.getTime())) return null;
  const year = dateObject.getFullYear();
  const month = String(dateObject.getMonth() + 1).padStart(2, "0");
  const day = String(dateObject.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** "Fri 14 Aug 2026" — rendered in UTC so it matches the stored date exactly. */
export function formatDate(ms) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(ms));
}

export function isWeekend(ms) {
  return WEEKEND_DAYS.has(new Date(ms).getUTCDay());
}

/** Add whole calendar days (may be negative). */
export function addCalendarDays(ms, days) {
  return ms + Math.round(days) * DAY_MS;
}

/**
 * Add whole business days (Mon–Fri), skipping weekends. Negative counts move
 * backwards. Zero returns the same instant untouched.
 */
export function addBusinessDays(ms, days) {
  const step = days >= 0 ? DAY_MS : -DAY_MS;
  let remaining = Math.abs(Math.round(days));
  let cursor = ms;
  while (remaining > 0) {
    cursor += step;
    if (!isWeekend(cursor)) remaining -= 1;
  }
  return cursor;
}

export function shiftDays(ms, days, mode) {
  return mode === "calendar" ? addCalendarDays(ms, days) : addBusinessDays(ms, days);
}

/** Whole business days from `startMs` up to and including `endMs`, exclusive of the start day. */
export function businessDaysBetween(startMs, endMs) {
  if (endMs <= startMs) return 0;
  let count = 0;
  let cursor = startMs;
  while (cursor < endMs) {
    cursor += DAY_MS;
    if (!isWeekend(cursor)) count += 1;
  }
  return count;
}

/**
 * Build the delivery schedule.
 * @returns {{error: string} | object}
 */
export function planDelivery({ eventDate, deliverables, hoursPerDay, turnaroundMode = "business" } = {}) {
  const eventMs = parseIsoDate(eventDate);
  if (eventMs === null) {
    return { error: "Enter the last day of the event as a valid date." };
  }

  const perDay = Number(hoursPerDay);
  if (!Number.isFinite(perDay)) {
    return { error: "Editing hours per day must be a number." };
  }
  if (perDay < MIN_HOURS_PER_DAY || perDay > MAX_HOURS_PER_DAY) {
    return {
      error: `Editing hours per day must be between ${MIN_HOURS_PER_DAY} and ${MAX_HOURS_PER_DAY}.`,
    };
  }

  const mode = turnaroundMode === "calendar" ? "calendar" : "business";

  const selected = Array.isArray(deliverables) ? deliverables.filter((item) => item && item.enabled) : [];
  if (selected.length === 0) {
    return { error: "Select at least one deliverable to build a schedule." };
  }

  const rows = [];
  for (const item of selected) {
    const preset = DELIVERABLE_CATALOGUE.find((entry) => entry.id === item.id);
    const name = preset ? preset.name : String(item.id ?? "Deliverable");
    const runtime = Number(item.runtimeMinutes);
    const turnaround = Number(item.turnaround);
    const hoursPerMinute = Number(item.hoursPerMinute ?? preset?.hoursPerMinute ?? 0);
    const fixedHours = Number(item.fixedHours ?? preset?.fixedHours ?? 0);

    if (![runtime, turnaround, hoursPerMinute, fixedHours].every((value) => Number.isFinite(value))) {
      return { error: `"${name}" has a non-numeric runtime, turnaround or rate.` };
    }
    if (runtime < 0 || runtime > MAX_RUNTIME_MINUTES) {
      return { error: `"${name}" runtime must be between 0 and ${MAX_RUNTIME_MINUTES} minutes.` };
    }
    if (turnaround < 0 || turnaround > 365) {
      return { error: `"${name}" turnaround must be between 0 and 365 days.` };
    }
    if (hoursPerMinute < 0 || fixedHours < 0) {
      return { error: `"${name}" cannot have a negative effort rate.` };
    }

    const editHours = fixedHours + runtime * hoursPerMinute;
    const editDays = perDay > 0 ? editHours / perDay : 0;
    const dueMs = shiftDays(eventMs, turnaround, mode);
    // Work backwards from the due date by whole working days of effort.
    const startMs = addBusinessDays(dueMs, -Math.ceil(editDays));

    rows.push({
      id: item.id,
      name,
      note: preset?.note ?? "",
      runtimeMinutes: runtime,
      hoursPerMinute,
      fixedHours,
      turnaround,
      editHours: round1(editHours),
      editDays: round1(editDays),
      dueMs,
      dueIso: toIsoDate(dueMs),
      dueLabel: formatDate(dueMs),
      startMs,
      startIso: toIsoDate(startMs),
      startLabel: formatDate(startMs),
      // Flags a deliverable whose edit has to begin before the event finishes.
      startsBeforeEvent: startMs < eventMs,
    });
  }

  rows.sort((a, b) => a.dueMs - b.dueMs || a.name.localeCompare(b.name));

  const totalHours = rows.reduce((sum, row) => sum + row.editHours, 0);
  const totalDays = totalHours / perDay;
  const lastDueMs = rows[rows.length - 1].dueMs;
  const firstDueMs = rows[0].dueMs;

  // Capacity: how many working days one editor actually has between the end of
  // the event and the final delivery date.
  const availableWorkingDays = businessDaysBetween(eventMs, lastDueMs);
  const availableHours = availableWorkingDays * perDay;
  const capacityGapHours = round1(totalHours - availableHours);
  const overCapacity = totalHours > availableHours;
  const utilisation = availableHours > 0 ? round1((totalHours / availableHours) * 100) : null;

  const summaryText = [
    `Event video delivery plan — event ends ${formatDate(eventMs)}`,
    `Turnaround counted in ${mode === "calendar" ? "calendar" : "business"} days · ${perDay} editing hours per day`,
    "",
    ...rows.map(
      (row) =>
        `${row.dueLabel} — ${row.name} (${row.runtimeMinutes} min finished, ~${row.editHours} h edit, start by ${row.startLabel})`,
    ),
    "",
    `Total edit effort: ${round1(totalHours)} h ≈ ${round1(totalDays)} working days`,
    `Editor capacity to final delivery: ${availableWorkingDays} working days ≈ ${round1(availableHours)} h`,
    overCapacity
      ? `SHORTFALL: about ${capacityGapHours} h more work than one editor can absorb — add an editor or move dates.`
      : "One editor can absorb this schedule at the stated hours per day.",
  ].join("\n");

  return {
    rows,
    eventMs,
    eventLabel: formatDate(eventMs),
    mode,
    hoursPerDay: perDay,
    totalHours: round1(totalHours),
    totalDays: round1(totalDays),
    firstDueLabel: formatDate(firstDueMs),
    lastDueLabel: formatDate(lastDueMs),
    availableWorkingDays,
    availableHours: round1(availableHours),
    capacityGapHours,
    overCapacity,
    utilisation,
    summaryText,
  };
}
