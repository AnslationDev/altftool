/**
 * Time zone meeting planner — find the slots on a given day that land inside
 * working hours in every participating zone.
 *
 * All zone arithmetic goes through the IANA time zone database that ships with
 * the browser's Intl implementation, so daylight saving transitions, half-hour
 * offsets such as India's UTC+05:30 and 45-minute offsets such as Nepal's
 * UTC+05:45 are handled by the platform rather than by a hard-coded table.
 *
 * The scoring rule: for each candidate start time, every zone is graded
 *   2 points - the whole meeting sits inside that zone's working hours
 *   1 point  - it spills up to one hour before or after working hours
 *   0 points - it falls outside that, or crosses local midnight
 * and the slots are ranked by total score, earliest first on a tie.
 */

/** Grades a single zone can receive for a candidate slot. */
export const QUALITY_GOOD = "good";
export const QUALITY_FAIR = "fair";
export const QUALITY_POOR = "poor";

/** Points each grade contributes to a slot's score. */
export const QUALITY_POINTS = { good: 2, fair: 1, poor: 0 };

/** How far outside working hours still counts as "fair", in minutes. */
export const FAIR_TOLERANCE_MINUTES = 60;

/** Limits that keep the grid a sensible size. */
export const MAX_ZONES = 8;
export const MIN_DURATION_MINUTES = 5;
export const MAX_DURATION_MINUTES = 600;
export const STEP_CHOICES = [15, 30, 60];

/** A short, opinionated starting list of zones people actually schedule across. */
export const COMMON_ZONES = [
  { timeZone: "Pacific/Auckland", label: "Auckland" },
  { timeZone: "Australia/Sydney", label: "Sydney" },
  { timeZone: "Australia/Brisbane", label: "Brisbane" },
  { timeZone: "Asia/Tokyo", label: "Tokyo" },
  { timeZone: "Asia/Seoul", label: "Seoul" },
  { timeZone: "Asia/Shanghai", label: "Shanghai" },
  { timeZone: "Asia/Singapore", label: "Singapore" },
  { timeZone: "Asia/Jakarta", label: "Jakarta" },
  { timeZone: "Asia/Bangkok", label: "Bangkok" },
  { timeZone: "Asia/Kathmandu", label: "Kathmandu" },
  { timeZone: "Asia/Kolkata", label: "India (Kolkata)" },
  { timeZone: "Asia/Karachi", label: "Karachi" },
  { timeZone: "Asia/Dubai", label: "Dubai" },
  { timeZone: "Europe/Moscow", label: "Moscow" },
  { timeZone: "Africa/Nairobi", label: "Nairobi" },
  { timeZone: "Europe/Istanbul", label: "Istanbul" },
  { timeZone: "Europe/Athens", label: "Athens" },
  { timeZone: "Africa/Johannesburg", label: "Johannesburg" },
  { timeZone: "Europe/Berlin", label: "Berlin" },
  { timeZone: "Europe/Paris", label: "Paris" },
  { timeZone: "Europe/Madrid", label: "Madrid" },
  { timeZone: "Europe/Warsaw", label: "Warsaw" },
  { timeZone: "Africa/Lagos", label: "Lagos" },
  { timeZone: "Europe/London", label: "London" },
  { timeZone: "Europe/Dublin", label: "Dublin" },
  { timeZone: "Europe/Lisbon", label: "Lisbon" },
  { timeZone: "Atlantic/Reykjavik", label: "Reykjavik" },
  { timeZone: "America/Sao_Paulo", label: "São Paulo" },
  { timeZone: "America/Argentina/Buenos_Aires", label: "Buenos Aires" },
  { timeZone: "America/Santiago", label: "Santiago" },
  { timeZone: "America/New_York", label: "New York" },
  { timeZone: "America/Toronto", label: "Toronto" },
  { timeZone: "America/Bogota", label: "Bogotá" },
  { timeZone: "America/Chicago", label: "Chicago" },
  { timeZone: "America/Mexico_City", label: "Mexico City" },
  { timeZone: "America/Denver", label: "Denver" },
  { timeZone: "America/Phoenix", label: "Phoenix" },
  { timeZone: "America/Los_Angeles", label: "Los Angeles" },
  { timeZone: "America/Vancouver", label: "Vancouver" },
  { timeZone: "America/Anchorage", label: "Anchorage" },
  { timeZone: "Pacific/Honolulu", label: "Honolulu" },
  { timeZone: "UTC", label: "UTC" },
];

/** Every zone this browser knows, falling back to the curated list. */
export function listSupportedTimeZones() {
  try {
    if (typeof Intl.supportedValuesOf === "function") {
      const all = Intl.supportedValuesOf("timeZone");
      if (Array.isArray(all) && all.length > 0) return all;
    }
  } catch {
    // fall through
  }
  return COMMON_ZONES.map((z) => z.timeZone);
}

/** True when the platform recognises this IANA identifier. */
export function isValidTimeZone(timeZone) {
  if (typeof timeZone !== "string" || timeZone.trim() === "") return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(0);
    return true;
  } catch {
    return false;
  }
}

const PART_FORMATTER_CACHE = new Map();

function partsFormatter(timeZone) {
  let f = PART_FORMATTER_CACHE.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      weekday: "short",
    });
    PART_FORMATTER_CACHE.set(timeZone, f);
  }
  return f;
}

/**
 * Wall-clock reading of an instant in a zone.
 * @param {string} timeZone IANA identifier.
 * @param {number} utcMs    Instant in epoch milliseconds.
 */
export function wallClock(timeZone, utcMs) {
  const parts = partsFormatter(timeZone).formatToParts(new Date(utcMs));
  const get = (type) => parts.find((p) => p.type === type)?.value ?? "0";
  const hour = Number(get("hour")) % 24; // some ICU builds emit "24" for midnight
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour,
    minute: Number(get("minute")),
    second: Number(get("second")),
    weekday: parts.find((p) => p.type === "weekday")?.value ?? "",
  };
}

/** Minutes this zone is ahead of UTC at the given instant (negative if behind). */
export function offsetMinutes(timeZone, utcMs) {
  const w = wallClock(timeZone, utcMs);
  const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);
  return Math.round((asUtc - utcMs) / 60000);
}

/**
 * Convert a wall-clock time in a zone into an epoch instant. Applied twice so a
 * daylight-saving change between the guess and the real offset is corrected.
 */
export function zonedTimeToUtc(timeZone, year, month, day, hour, minute) {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  let ts = guess - offsetMinutes(timeZone, guess) * 60000;
  ts = guess - offsetMinutes(timeZone, ts) * 60000;
  return ts;
}

/** "YYYY-MM-DD" -> { year, month, day }, or null if it is not a real date. */
export function parseISODate(iso) {
  const m = String(iso ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) return null;
  return { year, month, day };
}

/** "HH:MM" -> minutes after midnight, or null. */
export function parseClock(value) {
  const m = String(value ?? "").match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour > 24 || minute > 59) return null;
  if (hour === 24 && minute !== 0) return null;
  return hour * 60 + minute;
}

/** Minutes after midnight -> "HH:MM" in 24-hour form. */
export function formatClock24(minutes) {
  const total = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Minutes after midnight -> "9:30 am". */
export function formatClock12(minutes) {
  const total = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h24 < 12 ? "am" : "pm";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Signed offset as "UTC+05:30". */
export function formatOffset(minutes) {
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

/**
 * The calendar date in a zone at a given instant, as "YYYY-MM-DD".
 * Pure: pass the instant in rather than reading the clock inside.
 */
export function dateISOInZone(timeZone, utcMs) {
  if (!isValidTimeZone(timeZone)) return null;
  const w = wallClock(timeZone, utcMs);
  return `${String(w.year).padStart(4, "0")}-${String(w.month).padStart(2, "0")}-${String(w.day).padStart(2, "0")}`;
}

function gradeZone(startMinutes, durationMinutes, workStart, workEnd) {
  const endMinutes = startMinutes + durationMinutes;
  if (endMinutes > 1440) return QUALITY_POOR; // runs past local midnight
  if (startMinutes >= workStart && endMinutes <= workEnd) return QUALITY_GOOD;
  if (
    startMinutes >= workStart - FAIR_TOLERANCE_MINUTES &&
    endMinutes <= workEnd + FAIR_TOLERANCE_MINUTES
  ) {
    return QUALITY_FAIR;
  }
  return QUALITY_POOR;
}

/**
 * Build the slot grid for one day.
 *
 * @param {object} input
 * @param {string} input.dateISO      Meeting day, "YYYY-MM-DD", read in the home zone.
 * @param {string} input.homeTimeZone The zone the date and the grid are anchored to.
 * @param {Array}  input.zones        [{ timeZone, label }] participants, home zone included.
 * @param {number} input.durationMinutes Meeting length.
 * @param {number} input.stepMinutes  Grid granularity: 15, 30 or 60.
 * @param {string} input.workStart    Working day start, "HH:MM".
 * @param {string} input.workEnd      Working day end, "HH:MM".
 */
export function planMeeting({
  dateISO,
  homeTimeZone = "UTC",
  zones = [],
  durationMinutes = 60,
  stepMinutes = 30,
  workStart = "09:00",
  workEnd = "17:00",
} = {}) {
  const date = parseISODate(dateISO);
  if (!date) return { error: "Pick a meeting date in YYYY-MM-DD form." };

  if (!isValidTimeZone(homeTimeZone)) {
    return { error: `"${homeTimeZone}" is not a time zone this browser recognises.` };
  }

  const list = Array.isArray(zones) ? zones.filter((z) => z && z.timeZone) : [];
  if (list.length === 0) return { error: "Add at least one time zone to compare." };
  if (list.length > MAX_ZONES) {
    return { error: `Compare up to ${MAX_ZONES} zones at once — that was ${list.length}.` };
  }
  const unknown = list.find((z) => !isValidTimeZone(z.timeZone));
  if (unknown) {
    return { error: `"${unknown.timeZone}" is not a time zone this browser recognises.` };
  }

  const start = parseClock(workStart);
  const end = parseClock(workEnd);
  if (start === null || end === null) {
    return { error: "Working hours must be times like 09:00 and 17:30." };
  }
  if (end <= start) return { error: "The working day has to end after it starts." };

  const duration = Number.isFinite(durationMinutes) ? Math.round(durationMinutes) : NaN;
  if (!Number.isFinite(duration)) return { error: "Enter the meeting length in minutes." };
  if (duration < MIN_DURATION_MINUTES) {
    return { error: `A meeting has to be at least ${MIN_DURATION_MINUTES} minutes long.` };
  }
  if (duration > MAX_DURATION_MINUTES) {
    return { error: `Keep the meeting under ${MAX_DURATION_MINUTES} minutes.` };
  }
  if (duration > end - start) {
    return { error: `A ${duration}-minute meeting does not fit inside a ${end - start}-minute working day.` };
  }

  const step = STEP_CHOICES.includes(Number(stepMinutes)) ? Number(stepMinutes) : 30;

  const slots = [];
  for (let m = 0; m + duration <= 1440; m += step) {
    const utcMs = zonedTimeToUtc(
      homeTimeZone,
      date.year,
      date.month,
      date.day,
      Math.floor(m / 60),
      m % 60,
    );

    const perZone = list.map((zone) => {
      const w = wallClock(zone.timeZone, utcMs);
      const localStart = w.hour * 60 + w.minute;
      const quality = gradeZone(localStart, duration, start, end);
      const dayShift =
        Date.UTC(w.year, w.month - 1, w.day) - Date.UTC(date.year, date.month - 1, date.day);
      return {
        timeZone: zone.timeZone,
        label: zone.label || zone.timeZone,
        offsetMinutes: offsetMinutes(zone.timeZone, utcMs),
        startMinutes: localStart,
        endMinutes: localStart + duration,
        start24: formatClock24(localStart),
        end24: formatClock24(localStart + duration),
        start12: formatClock12(localStart),
        end12: formatClock12(localStart + duration),
        weekday: w.weekday,
        dayShiftDays: Math.round(dayShift / 86400000),
        quality,
      };
    });

    const score = perZone.reduce((sum, z) => sum + QUALITY_POINTS[z.quality], 0);
    slots.push({
      homeMinutes: m,
      home24: formatClock24(m),
      home12: formatClock12(m),
      utcMs,
      utcISO: new Date(utcMs).toISOString(),
      score,
      allGood: perZone.every((z) => z.quality === QUALITY_GOOD),
      zones: perZone,
    });
  }

  const maxScore = list.length * QUALITY_POINTS.good;
  const ranked = [...slots].sort((a, b) =>
    b.score - a.score || a.homeMinutes - b.homeMinutes,
  );
  const bestScore = ranked.length > 0 ? ranked[0].score : 0;
  const perfect = slots.filter((s) => s.allGood);

  return {
    dateISO,
    homeTimeZone,
    durationMinutes: duration,
    stepMinutes: step,
    workStartMinutes: start,
    workEndMinutes: end,
    slots,
    best: ranked.slice(0, 5),
    bestSlot: ranked[0] ?? null,
    bestScore,
    maxScore,
    perfectSlotCount: perfect.length,
    firstPerfectSlot: perfect[0] ?? null,
    zoneCount: list.length,
  };
}
