/**
 * Clock Changes & DST Tracker — pure transforms over the IANA time zone database.
 *
 * DATA SOURCE (single, traceable, zero-maintenance)
 * -------------------------------------------------
 * Every instant, offset and abbreviation below is read out of the IANA tz
 * database that ships inside the already-installed `moment-timezone`
 * dependency. Nothing is hand-typed. `moment.tz.zone(name)` exposes three
 * parallel arrays:
 *   untils[i]  — the UTC millisecond at which segment i STOPS applying
 *                (the last element is Infinity, i.e. "and onwards")
 *   offsets[i] — minutes to SUBTRACT from UTC during segment i, so the signed
 *                UTC offset is  -offsets[i]  (offsets[i] = 300 means UTC-05:00)
 *   abbrs[i]   — the zone abbreviation in force during segment i (EST, BST…)
 * A clock change is therefore exactly the boundary untils[i], where the signed
 * offset moves from -offsets[i] to -offsets[i+1].
 *
 * Because the dataset is the tzdb release bundled with the dependency, this
 * page is correct for whatever tzdb version is installed and self-updates on a
 * dependency bump. The version in use is exported as TZDB_VERSION.
 *
 * Rules the data encodes (spot-checked by hand against the published law,
 * read 2026-07-29):
 *   • United States — Energy Policy Act of 2005 §110, in force since 2007:
 *     DST starts the 2nd Sunday of March at 02:00 local standard time and ends
 *     the 1st Sunday of November at 02:00 local daylight time.
 *   • European Union — Directive 2000/84/EC Art. 2-3: summer time starts the
 *     last Sunday of March at 01:00 UTC and ends the last Sunday of October at
 *     01:00 UTC, simultaneously across the whole Union.
 *   • Australia (NSW/VIC/SA/TAS/ACT) — DST starts the 1st Sunday of October at
 *     02:00 local standard time and ends the 1st Sunday of April at 03:00
 *     local daylight time.
 * The mismatch between the US and EU start dates is what produces the three
 * weeks each March, and the one week each autumn, in which the New York ↔
 * London gap is not its usual five hours.
 *
 * Pure module: no React, no DOM, no clock reads. Every function that needs
 * "now" takes the instant or the date as an argument.
 */

import moment from "moment-timezone";

/** tzdb release bundled with the installed moment-timezone (e.g. "2026c"). */
export const TZDB_VERSION = moment.tz.dataVersion;

export const MS_PER_MINUTE = 60 * 1000;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;
export const MINUTES_PER_HOUR = 60;

/**
 * The largest UTC offset any zone has ever used is +14:00 (Pacific/Kiritimati)
 * and the smallest is -12:00, so the instant matching a given wall clock always
 * lies within 15 hours of that wall clock read as if it were UTC. Used to bound
 * the offset search in resolveLocalTime().
 */
const OFFSET_SEARCH_WINDOW_MS = 15 * MS_PER_HOUR;

/**
 * Query bounds. tzdb data is authoritative from 1970 (Unix epoch) and the
 * packed dataset projects present-day rules forward for centuries; anything
 * past the current year is a projection of today's law, not a promise, so the
 * tool refuses years outside a sane band rather than pretending to know 2500.
 */
export const MIN_YEAR = 1970;
export const MAX_YEAR = 2100;

/** Meeting-safety scan limits (UI and clipboard stay readable). */
export const MEETING_MIN_ZONES = 2;
export const MEETING_MAX_ZONES = 4;
export const MEETING_MIN_WEEKS = 2;
export const MEETING_MAX_WEEKS = 104;

/** ISO weekday names, index = JavaScript Date#getUTCDay(). */
export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Curated zone list. Every id is a canonical IANA identifier that exists in the
 * bundled tzdb; the labels are only for the picker. Deliberately mixes zones
 * that still change their clocks, zones that stopped, zones that never did, and
 * the awkward half-hour / 30-minute-DST cases (Kolkata, Kathmandu, Chatham,
 * Lord Howe) because those are where naive offset tables break.
 */
export const ZONE_PRESETS = [
  { id: "Pacific/Honolulu", label: "Honolulu", region: "United States" },
  { id: "America/Anchorage", label: "Anchorage", region: "United States" },
  { id: "America/Los_Angeles", label: "Los Angeles", region: "United States" },
  { id: "America/Phoenix", label: "Phoenix", region: "United States (Arizona)" },
  { id: "America/Denver", label: "Denver", region: "United States" },
  { id: "America/Chicago", label: "Chicago", region: "United States" },
  { id: "America/New_York", label: "New York", region: "United States" },
  { id: "America/Toronto", label: "Toronto", region: "Canada" },
  { id: "America/Mexico_City", label: "Mexico City", region: "Mexico" },
  { id: "America/Bogota", label: "Bogotá", region: "Colombia" },
  { id: "America/Santiago", label: "Santiago", region: "Chile" },
  { id: "America/Sao_Paulo", label: "São Paulo", region: "Brazil" },
  { id: "UTC", label: "UTC", region: "Coordinated Universal Time" },
  { id: "Europe/London", label: "London", region: "United Kingdom" },
  { id: "Europe/Dublin", label: "Dublin", region: "Ireland" },
  { id: "Europe/Lisbon", label: "Lisbon", region: "Portugal" },
  { id: "Europe/Paris", label: "Paris", region: "France" },
  { id: "Europe/Berlin", label: "Berlin", region: "Germany" },
  { id: "Europe/Madrid", label: "Madrid", region: "Spain" },
  { id: "Europe/Amsterdam", label: "Amsterdam", region: "Netherlands" },
  { id: "Europe/Warsaw", label: "Warsaw", region: "Poland" },
  { id: "Europe/Athens", label: "Athens", region: "Greece" },
  { id: "Europe/Kyiv", label: "Kyiv", region: "Ukraine" },
  { id: "Europe/Istanbul", label: "Istanbul", region: "Türkiye" },
  { id: "Europe/Moscow", label: "Moscow", region: "Russia" },
  { id: "Africa/Lagos", label: "Lagos", region: "Nigeria" },
  { id: "Africa/Cairo", label: "Cairo", region: "Egypt" },
  { id: "Africa/Johannesburg", label: "Johannesburg", region: "South Africa" },
  { id: "Africa/Nairobi", label: "Nairobi", region: "Kenya" },
  { id: "Asia/Jerusalem", label: "Jerusalem", region: "Israel" },
  { id: "Asia/Tehran", label: "Tehran", region: "Iran" },
  { id: "Asia/Dubai", label: "Dubai", region: "United Arab Emirates" },
  { id: "Asia/Karachi", label: "Karachi", region: "Pakistan" },
  { id: "Asia/Kolkata", label: "Kolkata / Mumbai / Delhi", region: "India" },
  { id: "Asia/Kathmandu", label: "Kathmandu", region: "Nepal" },
  { id: "Asia/Dhaka", label: "Dhaka", region: "Bangladesh" },
  { id: "Asia/Bangkok", label: "Bangkok", region: "Thailand" },
  { id: "Asia/Singapore", label: "Singapore", region: "Singapore" },
  { id: "Asia/Shanghai", label: "Shanghai", region: "China" },
  { id: "Asia/Tokyo", label: "Tokyo", region: "Japan" },
  { id: "Asia/Seoul", label: "Seoul", region: "South Korea" },
  { id: "Australia/Perth", label: "Perth", region: "Australia" },
  { id: "Australia/Brisbane", label: "Brisbane", region: "Australia" },
  { id: "Australia/Adelaide", label: "Adelaide", region: "Australia" },
  { id: "Australia/Sydney", label: "Sydney", region: "Australia" },
  { id: "Australia/Lord_Howe", label: "Lord Howe Island", region: "Australia" },
  { id: "Pacific/Auckland", label: "Auckland", region: "New Zealand" },
  { id: "Pacific/Chatham", label: "Chatham Islands", region: "New Zealand" },
];

/** Zones shown in the year-at-a-glance table by default. */
export const MAJOR_ZONE_IDS = [
  "America/Los_Angeles",
  "America/New_York",
  "America/Santiago",
  "Europe/London",
  "Europe/Berlin",
  "Africa/Cairo",
  "Asia/Jerusalem",
  "Australia/Sydney",
  "Pacific/Auckland",
];

/** Zones surveyed in the "no clock changes" panel. */
export const NO_DST_SURVEY_ZONE_IDS = [
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Dubai",
  "Asia/Tehran",
  "Europe/Istanbul",
  "Europe/Moscow",
  "America/Sao_Paulo",
  "America/Mexico_City",
  "America/Phoenix",
  "America/Bogota",
  "Africa/Johannesburg",
  "Africa/Lagos",
  "Australia/Brisbane",
  "Australia/Perth",
];

/* ------------------------------------------------------------------ */
/* Zone primitives                                                     */
/* ------------------------------------------------------------------ */

/** True when the name is a canonical zone present in the bundled tzdb. */
export function isValidZone(zoneName) {
  if (typeof zoneName !== "string" || zoneName.trim() === "") return false;
  return moment.tz.zone(zoneName) !== null;
}

function requireZone(zoneName) {
  const zone = typeof zoneName === "string" ? moment.tz.zone(zoneName) : null;
  if (!zone) return null;
  return zone;
}

/**
 * Signed UTC offset of a zone at an instant, in minutes.
 * tzdb stores minutes to subtract, so the sign is flipped here exactly once.
 */
export function zoneOffsetMinutes(zoneName, instantMs) {
  const zone = requireZone(zoneName);
  if (!zone) return null;
  return -zone.utcOffset(instantMs);
}

/** Zone abbreviation in force at an instant ("EST", "BST", "+0530"…). */
export function zoneAbbr(zoneName, instantMs) {
  const zone = requireZone(zoneName);
  if (!zone) return null;
  return zone.abbr(instantMs);
}

/** Format a signed minute offset as "UTC+05:30" / "UTC-04:00" / "UTC±00:00". */
export function formatOffset(offsetMinutes) {
  if (!Number.isFinite(offsetMinutes)) return "—";
  const rounded = Math.round(offsetMinutes);
  const sign = rounded === 0 ? "±" : rounded > 0 ? "+" : "-";
  const abs = Math.abs(rounded);
  const h = Math.floor(abs / MINUTES_PER_HOUR);
  const m = abs % MINUTES_PER_HOUR;
  return `UTC${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Format a signed minute difference as "+1 h", "-30 min", "+1 h 45 min". */
export function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) return "—";
  const rounded = Math.round(minutes);
  if (rounded === 0) return "0 min";
  const sign = rounded > 0 ? "+" : "-";
  const abs = Math.abs(rounded);
  const h = Math.floor(abs / MINUTES_PER_HOUR);
  const m = abs % MINUTES_PER_HOUR;
  if (h === 0) return `${sign}${m} min`;
  if (m === 0) return `${sign}${h} h`;
  return `${sign}${h} h ${m} min`;
}

/**
 * Wall clock an observer in `zoneName` reads at `instantMs`, given the offset
 * that applies. Passing the offset explicitly is what lets the tool print the
 * reading *just before* a transition as well as *just after* it — moment would
 * only ever report the post-transition offset for the transition instant.
 */
export function wallClockAt(instantMs, offsetMinutes) {
  const shifted = new Date(instantMs + offsetMinutes * MS_PER_MINUTE);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    weekday: shifted.getUTCDay(),
  };
}

/** The wall clock a zone shows at an instant (offset looked up for you). */
export function wallClockInZone(zoneName, instantMs) {
  const offset = zoneOffsetMinutes(zoneName, instantMs);
  if (offset === null) return null;
  return wallClockAt(instantMs, offset);
}

/** "Sun 8 Mar 2026, 02:00" */
export function formatWallClock(parts) {
  if (!parts) return "—";
  const day = WEEKDAY_NAMES[parts.weekday].slice(0, 3);
  const month = MONTH_NAMES[parts.month - 1];
  const hh = String(parts.hour).padStart(2, "0");
  const mm = String(parts.minute).padStart(2, "0");
  return `${day} ${parts.day} ${month} ${parts.year}, ${hh}:${mm}`;
}

/** "2026-03-08" */
export function formatISODate(parts) {
  if (!parts) return "—";
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

/** "02:00" */
export function formatClock(parts) {
  if (!parts) return "—";
  return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Transitions                                                         */
/* ------------------------------------------------------------------ */

function buildTransition(zoneName, atMs, offsetBefore, offsetAfter, abbrBefore, abbrAfter) {
  const deltaMinutes = offsetAfter - offsetBefore;
  const localBefore = wallClockAt(atMs, offsetBefore);
  const localAfter = wallClockAt(atMs, offsetAfter);
  return {
    zone: zoneName,
    utcMs: atMs,
    utcISO: new Date(atMs).toISOString(),
    offsetBefore,
    offsetAfter,
    deltaMinutes,
    /** "forward" = clocks jump ahead (an hour disappears); "back" = repeat. */
    direction: deltaMinutes > 0 ? "forward" : "back",
    abbrBefore,
    abbrAfter,
    /** Reading on the wall immediately BEFORE the jump. */
    localBefore,
    /** Reading the clock is set to immediately AFTER the jump. */
    localAfter,
    /**
     * forward: local times in [localBefore, localAfter) never occur.
     * back:    local times in [localAfter, localBefore) occur twice.
     */
    skippedFrom: deltaMinutes > 0 ? localBefore : null,
    skippedTo: deltaMinutes > 0 ? localAfter : null,
    repeatedFrom: deltaMinutes < 0 ? localAfter : null,
    repeatedTo: deltaMinutes < 0 ? localBefore : null,
  };
}

/** Memoised full transition list per zone — the arrays are ~1 100 entries. */
const transitionCache = new Map();

function allTransitions(zoneName) {
  if (transitionCache.has(zoneName)) return transitionCache.get(zoneName);
  const zone = requireZone(zoneName);
  if (!zone) return [];
  const list = [];
  // untils[i] ends segment i; the final element is Infinity, so the last real
  // boundary is at index length - 2.
  for (let i = 0; i < zone.untils.length - 1; i += 1) {
    const at = zone.untils[i];
    if (at === null || !Number.isFinite(at)) continue;
    const offsetBefore = -zone.offsets[i];
    const offsetAfter = -zone.offsets[i + 1];
    // Some boundaries only rename the abbreviation; the clock does not move.
    if (offsetBefore === offsetAfter) continue;
    list.push(
      buildTransition(zoneName, at, offsetBefore, offsetAfter, zone.abbrs[i], zone.abbrs[i + 1]),
    );
  }
  transitionCache.set(zoneName, list);
  return list;
}

/**
 * Clock changes for a zone inside [fromMs, toMs).
 * @returns {Array|{error:string}}
 */
export function listTransitions({ zone, fromMs, toMs }) {
  if (!isValidZone(zone)) return { error: `"${zone}" is not a time zone in the IANA database.` };
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) {
    return { error: "The scan window needs two real instants." };
  }
  if (toMs <= fromMs) return { error: "The scan window ends before it starts." };
  return allTransitions(zone).filter((t) => t.utcMs >= fromMs && t.utcMs < toMs);
}

/**
 * The next clock change in a zone at or after `fromMs`.
 * @returns {{transition:object|null, lastTransition:object|null}|{error:string}}
 */
export function nextTransition({ zone, fromMs }) {
  if (!isValidZone(zone)) return { error: `"${zone}" is not a time zone in the IANA database.` };
  if (!Number.isFinite(fromMs)) return { error: "A reference instant is required." };
  const list = allTransitions(zone);
  const upcoming = list.find((t) => t.utcMs >= fromMs) || null;
  const past = [...list].reverse().find((t) => t.utcMs < fromMs) || null;
  const currentOffset = zoneOffsetMinutes(zone, fromMs);
  return {
    zone,
    referenceMs: fromMs,
    currentOffset,
    currentOffsetLabel: formatOffset(currentOffset),
    currentAbbr: zoneAbbr(zone, fromMs),
    currentLocal: wallClockAt(fromMs, currentOffset),
    transition: upcoming,
    /** Days until the next change, floored — display only, derived from ms. */
    daysUntil: upcoming ? Math.floor((upcoming.utcMs - fromMs) / MS_PER_DAY) : null,
    lastTransition: past,
  };
}

/* ------------------------------------------------------------------ */
/* Year view and DST status                                            */
/* ------------------------------------------------------------------ */

function yearBounds(year) {
  return { startMs: Date.UTC(year, 0, 1), endMs: Date.UTC(year + 1, 0, 1) };
}

/**
 * Every clock change a zone makes during a calendar year (UTC-bounded), plus a
 * plain description of whether the zone changed its clocks at all and, if not,
 * the year in which it last did.
 */
export function zoneYearStatus({ zone, year }) {
  if (!isValidZone(zone)) return { error: `"${zone}" is not a time zone in the IANA database.` };
  const y = Number(year);
  if (!Number.isInteger(y) || y < MIN_YEAR || y > MAX_YEAR) {
    return { error: `Pick a year between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }
  const { startMs, endMs } = yearBounds(y);
  const all = allTransitions(zone);
  const changes = all.filter((t) => t.utcMs >= startMs && t.utcMs < endMs);

  const midYearOffset = zoneOffsetMinutes(zone, Date.UTC(y, 6, 1));
  const janOffset = zoneOffsetMinutes(zone, startMs);
  const offsetsInYear = [janOffset, midYearOffset, ...changes.map((t) => t.offsetAfter)];
  const standardOffset = Math.min(...offsetsInYear);
  const summerOffset = Math.max(...offsetsInYear);

  const lastEver = all.length > 0 ? all[all.length - 1] : null;
  const lastBeforeYear = [...all].reverse().find((t) => t.utcMs < startMs) || null;

  let status;
  let statusLabel;
  if (changes.length > 0) {
    status = "changes";
    statusLabel = `${changes.length} clock change${changes.length === 1 ? "" : "s"} in ${y}`;
  } else if (lastBeforeYear) {
    const lastYear = wallClockAt(lastBeforeYear.utcMs, lastBeforeYear.offsetAfter).year;
    status = "stopped";
    statusLabel = `No clock change in ${y} — clocks last moved in ${lastYear}`;
  } else {
    status = "none-on-record";
    statusLabel = `No clock change in ${y}, and none on record in this zone`;
  }

  return {
    zone,
    year: y,
    changes,
    changeCount: changes.length,
    standardOffset,
    standardOffsetLabel: formatOffset(standardOffset),
    summerOffset,
    summerOffsetLabel: formatOffset(summerOffset),
    /** Spread between the year's lowest and highest offset, in minutes. */
    dstShiftMinutes: summerOffset - standardOffset,
    status,
    statusLabel,
    lastTransitionEver: lastEver,
    lastChangeYear: lastBeforeYear
      ? wallClockAt(lastBeforeYear.utcMs, lastBeforeYear.offsetAfter).year
      : null,
  };
}

/** zoneYearStatus() applied to a list of zones, in the order given. */
export function yearChangeTable({ zones, year }) {
  if (!Array.isArray(zones) || zones.length === 0) {
    return { error: "Pick at least one time zone for the year table." };
  }
  const rows = [];
  for (const zone of zones) {
    const row = zoneYearStatus({ zone, year });
    if (row.error) return row;
    rows.push(row);
  }
  return { year: Number(year), rows };
}

/* ------------------------------------------------------------------ */
/* Wall-clock resolution: gaps and repeats                             */
/* ------------------------------------------------------------------ */

/**
 * Turn a local wall-clock reading into the UTC instant(s) it names.
 *
 * Method: the instant t that shows wall clock W in a zone with offset o
 * satisfies t = W(as-UTC) - o. Since every real offset lies inside ±15 h, all
 * candidate offsets in that window are collected from the zone's own
 * transitions, each is tested for self-consistency, and the survivors are the
 * answer:
 *   1 survivor  → an ordinary time
 *   0 survivors → the reading is inside a spring-forward gap and never happens
 *   2 survivors → the reading is inside an autumn fall-back overlap and happens
 *                 twice, once on summer offset and once on standard offset
 *
 * @returns {{status:"unique"|"nonexistent"|"ambiguous", ...}|{error:string}}
 */
export function resolveLocalTime({ zone, year, month, day, hour, minute }) {
  if (!isValidZone(zone)) return { error: `"${zone}" is not a time zone in the IANA database.` };
  const y = Number(year);
  const mo = Number(month);
  const d = Number(day);
  const h = Number(hour);
  const mi = Number(minute);
  if (!Number.isInteger(y) || y < MIN_YEAR || y > MAX_YEAR) {
    return { error: `Pick a year between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }
  if (!Number.isInteger(mo) || mo < 1 || mo > 12) return { error: "Month must be 1 to 12." };
  if (!Number.isInteger(d) || d < 1 || d > 31) return { error: "Day must be 1 to 31." };
  if (!Number.isInteger(h) || h < 0 || h > 23) return { error: "Hour must be 0 to 23." };
  if (!Number.isInteger(mi) || mi < 0 || mi > 59) return { error: "Minute must be 0 to 59." };

  const wallAsUtc = Date.UTC(y, mo - 1, d, h, mi);
  const check = new Date(wallAsUtc);
  if (check.getUTCMonth() + 1 !== mo || check.getUTCDate() !== d) {
    return { error: `${d}/${mo}/${y} is not a real calendar date.` };
  }

  const lo = wallAsUtc - OFFSET_SEARCH_WINDOW_MS;
  const hi = wallAsUtc + OFFSET_SEARCH_WINDOW_MS;
  const candidates = new Set([zoneOffsetMinutes(zone, lo), zoneOffsetMinutes(zone, hi)]);
  const nearby = allTransitions(zone).filter((t) => t.utcMs >= lo && t.utcMs <= hi);
  for (const t of nearby) {
    candidates.add(t.offsetBefore);
    candidates.add(t.offsetAfter);
  }

  const matches = [];
  for (const offset of candidates) {
    const instantMs = wallAsUtc - offset * MS_PER_MINUTE;
    if (zoneOffsetMinutes(zone, instantMs) === offset) {
      matches.push({
        instantMs,
        utcISO: new Date(instantMs).toISOString(),
        offsetMinutes: offset,
        offsetLabel: formatOffset(offset),
        abbr: zoneAbbr(zone, instantMs),
      });
    }
  }
  matches.sort((a, b) => a.instantMs - b.instantMs);

  const wallParts = { year: y, month: mo, day: d, hour: h, minute: mi, weekday: check.getUTCDay() };
  const base = { zone, wall: wallParts, wallLabel: formatWallClock(wallParts) };

  if (matches.length === 1) {
    return { ...base, status: "unique", instants: matches, chosen: matches[0], transition: null };
  }

  if (matches.length >= 2) {
    // Fall-back overlap: the earlier instant is on the higher (summer) offset.
    const transition =
      nearby.find(
        (t) =>
          t.direction === "back" &&
          wallAsUtc >= t.utcMs + t.offsetAfter * MS_PER_MINUTE &&
          wallAsUtc < t.utcMs + t.offsetBefore * MS_PER_MINUTE,
      ) || null;
    return {
      ...base,
      status: "ambiguous",
      instants: matches,
      chosen: matches[0],
      firstOccurrence: matches[0],
      secondOccurrence: matches[matches.length - 1],
      repeatGapMinutes: (matches[matches.length - 1].instantMs - matches[0].instantMs) / MS_PER_MINUTE,
      transition,
    };
  }

  // No self-consistent offset: the reading sits inside a spring-forward gap.
  const transition =
    nearby.find(
      (t) =>
        t.direction === "forward" &&
        wallAsUtc >= t.utcMs + t.offsetBefore * MS_PER_MINUTE &&
        wallAsUtc < t.utcMs + t.offsetAfter * MS_PER_MINUTE,
    ) || null;
  return {
    ...base,
    status: "nonexistent",
    instants: [],
    chosen: transition
      ? {
          instantMs: transition.utcMs,
          utcISO: transition.utcISO,
          offsetMinutes: transition.offsetAfter,
          offsetLabel: formatOffset(transition.offsetAfter),
          abbr: transition.abbrAfter,
        }
      : null,
    transition,
  };
}

/* ------------------------------------------------------------------ */
/* Meeting safety check                                                */
/* ------------------------------------------------------------------ */

/** Parse "HH:MM" into minutes past midnight, or null. */
export function parseClock(value) {
  if (typeof value !== "string") return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (h < 0 || h > 23 || mi < 0 || mi > 59) return null;
  return { hour: h, minute: mi };
}

/** Parse "YYYY-MM-DD" into calendar parts, or null. */
export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() + 1 !== month || probe.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day };
}

/**
 * Meeting safety check.
 *
 * A recurring meeting is pinned to a wall-clock time in ONE anchor zone and
 * repeats every 7 days. The gap between the anchor and each other zone is
 * offset(other) − offset(anchor) at that occurrence's instant. Because regions
 * switch on different weekends (US 2nd Sunday of March vs EU last Sunday of
 * March, for instance), that gap is not constant: this function walks every
 * weekly occurrence and reports the dates on which the gap to any zone differs
 * from the previous week's, which are exactly the weeks the meeting lands at an
 * unexpected local hour for somebody.
 *
 * It also reports occurrences where the anchor wall time falls in a
 * spring-forward gap (the meeting time does not exist) or an autumn overlap
 * (it happens twice); for those the earlier valid instant, or the instant the
 * clocks jump to, is used so the rest of the row is still computable.
 *
 * @param {object} input
 * @param {string} input.anchorZone   IANA zone the meeting time is written in.
 * @param {string[]} input.otherZones 1-3 further IANA zones to compare.
 * @param {string} input.localTime    "HH:MM" in the anchor zone.
 * @param {string} input.startDate    "YYYY-MM-DD", the first occurrence.
 * @param {number} input.weeks        Number of weekly occurrences to scan.
 */
export function meetingSafetyCheck({ anchorZone, otherZones, localTime, startDate, weeks }) {
  if (!isValidZone(anchorZone)) {
    return { error: `"${anchorZone}" is not a time zone in the IANA database.` };
  }
  const others = Array.isArray(otherZones) ? otherZones.filter(Boolean) : [];
  if (others.length === 0) {
    return { error: "Add at least one other time zone to compare against." };
  }
  const zones = [anchorZone, ...others];
  if (zones.length > MEETING_MAX_ZONES) {
    return { error: `Compare at most ${MEETING_MAX_ZONES} time zones at once.` };
  }
  if (new Set(zones).size !== zones.length) {
    return { error: "The same time zone is listed twice — pick different zones." };
  }
  for (const z of others) {
    if (!isValidZone(z)) return { error: `"${z}" is not a time zone in the IANA database.` };
  }

  const clock = parseClock(localTime);
  if (!clock) return { error: "Meeting time must look like 14:30 on a 24-hour clock." };
  const start = parseISODate(startDate);
  if (!start) return { error: "Start date must be a real date written as YYYY-MM-DD." };

  const n = Number(weeks);
  if (!Number.isInteger(n) || n < MEETING_MIN_WEEKS || n > MEETING_MAX_WEEKS) {
    return { error: `Scan between ${MEETING_MIN_WEEKS} and ${MEETING_MAX_WEEKS} weeks.` };
  }
  const startUtcNoon = Date.UTC(start.year, start.month - 1, start.day);
  const endYear = new Date(startUtcNoon + n * 7 * MS_PER_DAY).getUTCFullYear();
  if (start.year < MIN_YEAR || endYear > MAX_YEAR) {
    return { error: `The scan must stay between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }

  const occurrences = [];
  for (let week = 0; week < n; week += 1) {
    // Advance the CALENDAR date by 7 days, not the instant by 7×24 h — a
    // weekly meeting keeps its local wall time across a clock change.
    const dateMs = startUtcNoon + week * 7 * MS_PER_DAY;
    const dateParts = new Date(dateMs);
    const resolved = resolveLocalTime({
      zone: anchorZone,
      year: dateParts.getUTCFullYear(),
      month: dateParts.getUTCMonth() + 1,
      day: dateParts.getUTCDate(),
      hour: clock.hour,
      minute: clock.minute,
    });
    if (resolved.error) return resolved;
    if (!resolved.chosen) {
      return { error: "That meeting time cannot be placed on the calendar in the anchor zone." };
    }

    const instantMs = resolved.chosen.instantMs;
    const anchorOffset = resolved.chosen.offsetMinutes;
    const rows = zones.map((zone) => {
      const offset = zoneOffsetMinutes(zone, instantMs);
      const wall = wallClockAt(instantMs, offset);
      return {
        zone,
        offsetMinutes: offset,
        offsetLabel: formatOffset(offset),
        abbr: zoneAbbr(zone, instantMs),
        wall,
        clockLabel: formatClock(wall),
        dateLabel: formatISODate(wall),
        dayShift: dayShiftFromAnchor(resolved.wall, wall),
        gapMinutes: offset - anchorOffset,
        gapLabel: formatDuration(offset - anchorOffset),
      };
    });

    occurrences.push({
      week,
      date: formatISODate(resolved.wall),
      weekday: WEEKDAY_NAMES[resolved.wall.weekday],
      instantMs,
      utcISO: resolved.chosen.utcISO,
      anchorStatus: resolved.status,
      anchorResolution: resolved,
      rows,
      signature: rows
        .slice(1)
        .map((r) => r.gapMinutes)
        .join("|"),
    });
  }

  const changes = [];
  for (let i = 1; i < occurrences.length; i += 1) {
    const prev = occurrences[i - 1];
    const curr = occurrences[i];
    if (curr.signature === prev.signature) continue;
    const movedZones = [];
    for (let j = 1; j < curr.rows.length; j += 1) {
      const before = prev.rows[j];
      const after = curr.rows[j];
      if (before.gapMinutes === after.gapMinutes) continue;
      movedZones.push({
        zone: after.zone,
        previousGapMinutes: before.gapMinutes,
        previousGapLabel: formatDuration(before.gapMinutes),
        gapMinutes: after.gapMinutes,
        gapLabel: formatDuration(after.gapMinutes),
        gapDeltaMinutes: after.gapMinutes - before.gapMinutes,
        gapDeltaLabel: formatDuration(after.gapMinutes - before.gapMinutes),
        previousClockLabel: before.clockLabel,
        clockLabel: after.clockLabel,
      });
    }
    changes.push({
      date: curr.date,
      previousDate: prev.date,
      week: curr.week,
      movedZones,
    });
  }

  const flagged = occurrences.filter((o) => o.anchorStatus !== "unique");

  return {
    anchorZone,
    zones,
    localTime: `${String(clock.hour).padStart(2, "0")}:${String(clock.minute).padStart(2, "0")}`,
    weekday: occurrences[0] ? occurrences[0].weekday : null,
    weeks: n,
    firstDate: occurrences[0] ? occurrences[0].date : null,
    lastDate: occurrences.length ? occurrences[occurrences.length - 1].date : null,
    occurrences,
    changes,
    changeCount: changes.length,
    /** Occurrences where the anchor wall time is skipped or repeated. */
    flaggedOccurrences: flagged,
    stable: changes.length === 0,
  };
}

/** Calendar-day difference between the anchor reading and another zone's. */
function dayShiftFromAnchor(anchorWall, otherWall) {
  const a = Date.UTC(anchorWall.year, anchorWall.month - 1, anchorWall.day);
  const b = Date.UTC(otherWall.year, otherWall.month - 1, otherWall.day);
  return Math.round((b - a) / MS_PER_DAY);
}

/* ------------------------------------------------------------------ */
/* Clipboard text                                                      */
/* ------------------------------------------------------------------ */

/** Unsigned size of a shift: "1 h", "30 min", "1 h 45 min". */
export function formatMagnitude(minutes) {
  if (!Number.isFinite(minutes)) return "—";
  const abs = Math.abs(Math.round(minutes));
  if (abs === 0) return "0 min";
  const h = Math.floor(abs / MINUTES_PER_HOUR);
  const m = abs % MINUTES_PER_HOUR;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/** One-line summary of a transition, e.g. for a change ticket. */
export function describeTransition(t) {
  if (!t) return "No clock change on record.";
  const verb = t.direction === "forward" ? "forward" : "back";
  const effect =
    t.direction === "forward"
      ? `local times from ${formatClock(t.localBefore)} to ${formatClock(t.localAfter)} never happen`
      : `local times from ${formatClock(t.localAfter)} to ${formatClock(t.localBefore)} happen twice`;
  return [
    `${t.zone}: clocks go ${verb} ${formatMagnitude(t.deltaMinutes)}`,
    `at ${formatWallClock(t.localBefore)} local the clock reads ${formatClock(t.localAfter)}`,
    `${t.abbrBefore} ${formatOffset(t.offsetBefore)} becomes ${t.abbrAfter} ${formatOffset(t.offsetAfter)}`,
    `UTC instant ${t.utcISO}`,
    effect,
    `Source: IANA tzdb ${TZDB_VERSION}`,
  ].join("\n");
}

/** Plain-text export of a meeting safety check. */
export function buildMeetingClipboard(result) {
  if (!result || result.error) return "";
  const lines = [];
  lines.push(`Meeting safety check — ${result.localTime} ${result.anchorZone}, weekly on ${result.weekday}`);
  lines.push(`${result.firstDate} to ${result.lastDate} (${result.weeks} occurrences) · IANA tzdb ${TZDB_VERSION}`);
  lines.push("");
  if (result.changes.length === 0) {
    lines.push("The gap between these zones never changes across the scan.");
  } else {
    lines.push(`Gap changes on ${result.changes.length} date(s):`);
    for (const c of result.changes) {
      for (const z of c.movedZones) {
        lines.push(
          `  ${c.date}: ${z.zone} moves from ${z.previousGapLabel} to ${z.gapLabel} vs ${result.anchorZone} — local ${z.previousClockLabel} becomes ${z.clockLabel}`,
        );
      }
    }
  }
  for (const o of result.flaggedOccurrences) {
    lines.push(
      o.anchorStatus === "nonexistent"
        ? `  ${o.date}: ${result.localTime} does not exist in ${result.anchorZone} (spring-forward gap)`
        : `  ${o.date}: ${result.localTime} happens twice in ${result.anchorZone} (fall-back overlap)`,
    );
  }
  return lines.join("\n");
}
