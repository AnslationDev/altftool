/**
 * World Clock Dashboard — pure time-zone maths.
 *
 * Everything here is built on the ECMA-402 `Intl.DateTimeFormat` time-zone
 * database (IANA tzdb), which the JS engine ships and keeps current. That means
 * daylight-saving transitions, half-hour and 45-minute offsets (India +05:30,
 * Nepal +05:45, Chatham +12:45) are handled by the platform rather than by a
 * hand-written offset table, which is the usual source of world-clock bugs.
 *
 * Offset derivation: format the instant in the target zone, re-read those wall
 * clock fields as if they were UTC, and subtract the true instant. The
 * difference is exactly that zone's UTC offset at that moment.
 *
 * Pure module: no React, no DOM, and no clock reads — every function takes the
 * reference instant as an argument.
 */

/** Minutes in one hour / one day — used for offset and wrap arithmetic. */
export const MINUTES_PER_HOUR = 60;
export const MINUTES_PER_DAY = 1440;

/** Hours shown across the overlap strip: a full civil day, 0..23. */
export const HOURS_IN_DAY = 24;

/** Default "working day" window used for the meeting-overlap strip.
 * 09:00–17:00 local is the ordinary office day in most of the world; both
 * bounds are user-editable in the UI. */
export const DEFAULT_WORK_START_HOUR = 9;
export const DEFAULT_WORK_END_HOUR = 17;

/** Local hours treated as daylight for the day/night dot.
 * 06:00–17:59 is a rough civil-daylight band; it is a display cue only and
 * makes no claim about actual sunrise or sunset at a given latitude. */
export const DAYLIGHT_START_HOUR = 6;
export const DAYLIGHT_END_HOUR = 18;

/** Maximum clocks on the board, to keep the layout and the overlap strip
 * readable on a phone. */
export const MAX_ZONES = 12;

/**
 * Curated city list. Every `timeZone` is a canonical IANA identifier.
 * `offsetHintMinutes` is the zone's standard-time offset and is used only for
 * sorting the picker — the live offset always comes from Intl.
 */
export const CITY_PRESETS = [
  { id: "honolulu", city: "Honolulu", country: "United States", timeZone: "Pacific/Honolulu", offsetHintMinutes: -600 },
  { id: "anchorage", city: "Anchorage", country: "United States", timeZone: "America/Anchorage", offsetHintMinutes: -540 },
  { id: "los-angeles", city: "Los Angeles", country: "United States", timeZone: "America/Los_Angeles", offsetHintMinutes: -480 },
  { id: "vancouver", city: "Vancouver", country: "Canada", timeZone: "America/Vancouver", offsetHintMinutes: -480 },
  { id: "denver", city: "Denver", country: "United States", timeZone: "America/Denver", offsetHintMinutes: -420 },
  { id: "mexico-city", city: "Mexico City", country: "Mexico", timeZone: "America/Mexico_City", offsetHintMinutes: -360 },
  { id: "chicago", city: "Chicago", country: "United States", timeZone: "America/Chicago", offsetHintMinutes: -360 },
  { id: "new-york", city: "New York", country: "United States", timeZone: "America/New_York", offsetHintMinutes: -300 },
  { id: "toronto", city: "Toronto", country: "Canada", timeZone: "America/Toronto", offsetHintMinutes: -300 },
  { id: "bogota", city: "Bogotá", country: "Colombia", timeZone: "America/Bogota", offsetHintMinutes: -300 },
  { id: "santiago", city: "Santiago", country: "Chile", timeZone: "America/Santiago", offsetHintMinutes: -240 },
  { id: "sao-paulo", city: "São Paulo", country: "Brazil", timeZone: "America/Sao_Paulo", offsetHintMinutes: -180 },
  { id: "buenos-aires", city: "Buenos Aires", country: "Argentina", timeZone: "America/Argentina/Buenos_Aires", offsetHintMinutes: -180 },
  { id: "reykjavik", city: "Reykjavík", country: "Iceland", timeZone: "Atlantic/Reykjavik", offsetHintMinutes: 0 },
  { id: "utc", city: "UTC", country: "Coordinated Universal Time", timeZone: "UTC", offsetHintMinutes: 0 },
  { id: "london", city: "London", country: "United Kingdom", timeZone: "Europe/London", offsetHintMinutes: 0 },
  { id: "lisbon", city: "Lisbon", country: "Portugal", timeZone: "Europe/Lisbon", offsetHintMinutes: 0 },
  { id: "lagos", city: "Lagos", country: "Nigeria", timeZone: "Africa/Lagos", offsetHintMinutes: 60 },
  { id: "paris", city: "Paris", country: "France", timeZone: "Europe/Paris", offsetHintMinutes: 60 },
  { id: "berlin", city: "Berlin", country: "Germany", timeZone: "Europe/Berlin", offsetHintMinutes: 60 },
  { id: "madrid", city: "Madrid", country: "Spain", timeZone: "Europe/Madrid", offsetHintMinutes: 60 },
  { id: "amsterdam", city: "Amsterdam", country: "Netherlands", timeZone: "Europe/Amsterdam", offsetHintMinutes: 60 },
  { id: "zurich", city: "Zurich", country: "Switzerland", timeZone: "Europe/Zurich", offsetHintMinutes: 60 },
  { id: "warsaw", city: "Warsaw", country: "Poland", timeZone: "Europe/Warsaw", offsetHintMinutes: 60 },
  { id: "cairo", city: "Cairo", country: "Egypt", timeZone: "Africa/Cairo", offsetHintMinutes: 120 },
  { id: "johannesburg", city: "Johannesburg", country: "South Africa", timeZone: "Africa/Johannesburg", offsetHintMinutes: 120 },
  { id: "athens", city: "Athens", country: "Greece", timeZone: "Europe/Athens", offsetHintMinutes: 120 },
  { id: "istanbul", city: "Istanbul", country: "Türkiye", timeZone: "Europe/Istanbul", offsetHintMinutes: 180 },
  { id: "moscow", city: "Moscow", country: "Russia", timeZone: "Europe/Moscow", offsetHintMinutes: 180 },
  { id: "nairobi", city: "Nairobi", country: "Kenya", timeZone: "Africa/Nairobi", offsetHintMinutes: 180 },
  { id: "riyadh", city: "Riyadh", country: "Saudi Arabia", timeZone: "Asia/Riyadh", offsetHintMinutes: 180 },
  { id: "dubai", city: "Dubai", country: "United Arab Emirates", timeZone: "Asia/Dubai", offsetHintMinutes: 240 },
  { id: "karachi", city: "Karachi", country: "Pakistan", timeZone: "Asia/Karachi", offsetHintMinutes: 300 },
  { id: "mumbai", city: "Mumbai", country: "India", timeZone: "Asia/Kolkata", offsetHintMinutes: 330 },
  { id: "delhi", city: "New Delhi", country: "India", timeZone: "Asia/Kolkata", offsetHintMinutes: 330 },
  { id: "bengaluru", city: "Bengaluru", country: "India", timeZone: "Asia/Kolkata", offsetHintMinutes: 330 },
  { id: "kathmandu", city: "Kathmandu", country: "Nepal", timeZone: "Asia/Kathmandu", offsetHintMinutes: 345 },
  { id: "dhaka", city: "Dhaka", country: "Bangladesh", timeZone: "Asia/Dhaka", offsetHintMinutes: 360 },
  { id: "bangkok", city: "Bangkok", country: "Thailand", timeZone: "Asia/Bangkok", offsetHintMinutes: 420 },
  { id: "jakarta", city: "Jakarta", country: "Indonesia", timeZone: "Asia/Jakarta", offsetHintMinutes: 420 },
  { id: "singapore", city: "Singapore", country: "Singapore", timeZone: "Asia/Singapore", offsetHintMinutes: 480 },
  { id: "hong-kong", city: "Hong Kong", country: "Hong Kong SAR", timeZone: "Asia/Hong_Kong", offsetHintMinutes: 480 },
  { id: "shanghai", city: "Shanghai", country: "China", timeZone: "Asia/Shanghai", offsetHintMinutes: 480 },
  { id: "perth", city: "Perth", country: "Australia", timeZone: "Australia/Perth", offsetHintMinutes: 480 },
  { id: "seoul", city: "Seoul", country: "South Korea", timeZone: "Asia/Seoul", offsetHintMinutes: 540 },
  { id: "tokyo", city: "Tokyo", country: "Japan", timeZone: "Asia/Tokyo", offsetHintMinutes: 540 },
  { id: "sydney", city: "Sydney", country: "Australia", timeZone: "Australia/Sydney", offsetHintMinutes: 600 },
  { id: "melbourne", city: "Melbourne", country: "Australia", timeZone: "Australia/Melbourne", offsetHintMinutes: 600 },
  { id: "brisbane", city: "Brisbane", country: "Australia", timeZone: "Australia/Brisbane", offsetHintMinutes: 600 },
  { id: "auckland", city: "Auckland", country: "New Zealand", timeZone: "Pacific/Auckland", offsetHintMinutes: 720 },
];

const PART_CACHE = new Map();

function partsFormatter(timeZone) {
  let fmt = PART_CACHE.get(timeZone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      weekday: "short",
    });
    PART_CACHE.set(timeZone, fmt);
  }
  return fmt;
}

/**
 * Is this string a time zone the runtime actually knows?
 * @param {string} timeZone
 * @returns {boolean}
 */
export function isValidTimeZone(timeZone) {
  if (typeof timeZone !== "string" || timeZone.trim() === "") return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

function toDate(instant) {
  if (instant instanceof Date) return Number.isFinite(instant.getTime()) ? instant : null;
  if (typeof instant === "number" && Number.isFinite(instant)) return new Date(instant);
  if (typeof instant === "string") {
    const parsed = new Date(instant);
    return Number.isFinite(parsed.getTime()) ? parsed : null;
  }
  return null;
}

/**
 * Break an instant into the wall-clock fields seen in a zone.
 *
 * @param {string} timeZone IANA identifier, e.g. "Asia/Kolkata"
 * @param {Date|number|string} instant
 * @returns {{year:number,month:number,day:number,hour:number,minute:number,second:number,weekday:string}|{error:string}}
 */
export function wallClockParts(timeZone, instant) {
  const date = toDate(instant);
  if (!date) return { error: "Provide a valid reference date and time." };
  if (!isValidTimeZone(timeZone)) return { error: `"${timeZone}" is not a time zone this browser recognises.` };

  const parts = partsFormatter(timeZone).formatToParts(date);
  const map = {};
  for (const part of parts) map[part.type] = part.value;

  // Some engines emit hour "24" for midnight under h23 edge cases.
  const hour = Number(map.hour) % HOURS_IN_DAY;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour,
    minute: Number(map.minute),
    second: Number(map.second),
    weekday: map.weekday || "",
  };
}

/**
 * UTC offset of a zone at a given instant, in minutes east of UTC.
 * India returns 330, New York returns -300 (or -240 in DST).
 *
 * @returns {{offsetMinutes:number}|{error:string}}
 */
export function zoneOffsetMinutes(timeZone, instant) {
  const date = toDate(instant);
  if (!date) return { error: "Provide a valid reference date and time." };
  const parts = wallClockParts(timeZone, date);
  if (parts.error) return { error: parts.error };

  const asIfUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const trueInstantWholeSeconds = date.getTime() - date.getMilliseconds();
  return { offsetMinutes: Math.round((asIfUtc - trueInstantWholeSeconds) / 60000) };
}

/**
 * Render an offset in minutes as "UTC+05:30" / "UTC−04:00" / "UTC".
 * Uses U+2212 MINUS SIGN so negative offsets line up in a table.
 */
export function formatOffset(offsetMinutes) {
  if (!Number.isFinite(offsetMinutes)) return "—";
  if (offsetMinutes === 0) return "UTC";
  const sign = offsetMinutes < 0 ? "−" : "+";
  const abs = Math.abs(offsetMinutes);
  const hh = String(Math.floor(abs / MINUTES_PER_HOUR)).padStart(2, "0");
  const mm = String(abs % MINUTES_PER_HOUR).padStart(2, "0");
  return `UTC${sign}${hh}:${mm}`;
}

/**
 * Difference between two zones at an instant, e.g. "9h 30m ahead".
 * @returns {{minutes:number,label:string}|{error:string}}
 */
export function offsetDifference(timeZone, baseTimeZone, instant) {
  const a = zoneOffsetMinutes(timeZone, instant);
  if (a.error) return { error: a.error };
  const b = zoneOffsetMinutes(baseTimeZone, instant);
  if (b.error) return { error: b.error };

  const minutes = a.offsetMinutes - b.offsetMinutes;
  if (minutes === 0) return { minutes: 0, label: "Same time" };

  const abs = Math.abs(minutes);
  const hours = Math.floor(abs / MINUTES_PER_HOUR);
  const mins = abs % MINUTES_PER_HOUR;
  const size = mins === 0 ? `${hours}h` : hours === 0 ? `${mins}m` : `${hours}h ${mins}m`;
  return { minutes, label: `${size} ${minutes > 0 ? "ahead" : "behind"}` };
}

/**
 * Convert a wall-clock time in a zone back into an absolute instant.
 * Two passes, because the offset used to build the guess may itself change
 * across a DST boundary.
 *
 * @returns {{instant:Date}|{error:string}}
 */
export function zonedWallTimeToInstant(timeZone, { year, month, day, hour, minute }) {
  const fields = [year, month, day, hour, minute];
  if (fields.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter a complete date and time." };
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return { error: "That calendar date does not exist." };
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return { error: "Enter a time between 00:00 and 23:59." };
  if (!isValidTimeZone(timeZone)) return { error: `"${timeZone}" is not a time zone this browser recognises.` };

  const guessUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  let step = zoneOffsetMinutes(timeZone, new Date(guessUtc));
  if (step.error) return { error: step.error };
  let ts = guessUtc - step.offsetMinutes * 60000;

  step = zoneOffsetMinutes(timeZone, new Date(ts));
  if (step.error) return { error: step.error };
  ts = guessUtc - step.offsetMinutes * 60000;

  return { instant: new Date(ts) };
}

/**
 * Full read-out for one clock on the board.
 *
 * @param {{timeZone:string, city?:string, country?:string}} zone
 * @param {Date|number|string} instant  the shared reference moment
 * @param {{baseTimeZone?:string, workStartHour?:number, workEndHour?:number, hour12?:boolean}} [options]
 * @returns {object|{error:string}}
 */
export function describeZone(zone, instant, options = {}) {
  const timeZone = zone && zone.timeZone;
  const parts = wallClockParts(timeZone, instant);
  if (parts.error) return { error: parts.error };

  const offset = zoneOffsetMinutes(timeZone, instant);
  if (offset.error) return { error: offset.error };

  const {
    baseTimeZone = "UTC",
    workStartHour = DEFAULT_WORK_START_HOUR,
    workEndHour = DEFAULT_WORK_END_HOUR,
    hour12 = false,
  } = options;

  const diff = offsetDifference(timeZone, baseTimeZone, instant);
  const baseParts = wallClockParts(baseTimeZone, instant);

  let dayShift = 0;
  if (!baseParts.error) {
    const here = Date.UTC(parts.year, parts.month - 1, parts.day);
    const there = Date.UTC(baseParts.year, baseParts.month - 1, baseParts.day);
    dayShift = Math.round((here - there) / (MINUTES_PER_DAY * 60000));
  }

  const minutesOfDay = parts.hour * MINUTES_PER_HOUR + parts.minute;
  const isDaylight = parts.hour >= DAYLIGHT_START_HOUR && parts.hour < DAYLIGHT_END_HOUR;
  const withinWorkHours = isHourInWindow(parts.hour, workStartHour, workEndHour);

  return {
    timeZone,
    city: zone.city || timeZone,
    country: zone.country || "",
    ...parts,
    minutesOfDay,
    time: formatClock(parts.hour, parts.minute, hour12),
    seconds: String(parts.second).padStart(2, "0"),
    offsetMinutes: offset.offsetMinutes,
    offsetLabel: formatOffset(offset.offsetMinutes),
    differenceLabel: diff.error ? "—" : diff.label,
    differenceMinutes: diff.error ? 0 : diff.minutes,
    dayShift,
    dayShiftLabel: dayShift === 0 ? "Same day" : dayShift > 0 ? "Next day" : "Previous day",
    isDaylight,
    withinWorkHours,
  };
}

/** "14:05" or "2:05 PM". */
export function formatClock(hour, minute, hour12 = false) {
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return "—";
  const mm = String(minute).padStart(2, "0");
  if (!hour12) return `${String(hour).padStart(2, "0")}:${mm}`;
  const suffix = hour < 12 ? "AM" : "PM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${mm} ${suffix}`;
}

/**
 * Is an hour inside a working window? Windows that wrap past midnight
 * (e.g. 22 -> 6 for a night shift) are supported.
 */
export function isHourInWindow(hour, startHour, endHour) {
  if (![hour, startHour, endHour].every((v) => Number.isFinite(v))) return false;
  if (startHour === endHour) return false;
  if (startHour < endHour) return hour >= startHour && hour < endHour;
  return hour >= startHour || hour < endHour;
}

/**
 * Build the 24-slot meeting-overlap strip.
 *
 * Slot i is the instant `i` hours after the start of the reference day in the
 * base zone. For each slot the local hour in every zone is derived from the
 * offset difference, so half-hour zones land on the right slot.
 *
 * @param {Array<{timeZone:string, city?:string}>} zones
 * @param {Date|number|string} instant
 * @param {{baseTimeZone?:string, workStartHour?:number, workEndHour?:number}} [options]
 * @returns {{slots:Array, bestRun:{startHour:number,length:number}|null, anyOverlap:boolean}|{error:string}}
 */
export function buildOverlapStrip(zones, instant, options = {}) {
  if (!Array.isArray(zones) || zones.length === 0) {
    return { error: "Add at least one city to see the overlap strip." };
  }
  const {
    baseTimeZone = "UTC",
    workStartHour = DEFAULT_WORK_START_HOUR,
    workEndHour = DEFAULT_WORK_END_HOUR,
  } = options;

  if (!Number.isInteger(workStartHour) || !Number.isInteger(workEndHour)) {
    return { error: "Working hours must be whole hours between 0 and 23." };
  }
  if (workStartHour < 0 || workStartHour > 23 || workEndHour < 0 || workEndHour > 23) {
    return { error: "Working hours must be whole hours between 0 and 23." };
  }
  if (workStartHour === workEndHour) {
    return { error: "Working-day start and end cannot be the same hour." };
  }

  const baseParts = wallClockParts(baseTimeZone, instant);
  if (baseParts.error) return { error: baseParts.error };

  const offsets = [];
  for (const zone of zones) {
    const off = zoneOffsetMinutes(zone.timeZone, instant);
    if (off.error) return { error: off.error };
    offsets.push(off.offsetMinutes);
  }
  const baseOffset = zoneOffsetMinutes(baseTimeZone, instant);
  if (baseOffset.error) return { error: baseOffset.error };

  const slots = [];
  for (let slot = 0; slot < HOURS_IN_DAY; slot += 1) {
    const cells = zones.map((zone, index) => {
      const shifted = slot * MINUTES_PER_HOUR + (offsets[index] - baseOffset.offsetMinutes);
      const wrapped = ((shifted % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
      const hour = Math.floor(wrapped / MINUTES_PER_HOUR);
      const minute = wrapped % MINUTES_PER_HOUR;
      return {
        timeZone: zone.timeZone,
        city: zone.city || zone.timeZone,
        hour,
        minute,
        label: formatClock(hour, minute, false),
        working: isHourInWindow(hour, workStartHour, workEndHour),
      };
    });
    slots.push({
      baseHour: slot,
      baseLabel: formatClock(slot, 0, false),
      cells,
      allWorking: cells.every((cell) => cell.working),
      workingCount: cells.filter((cell) => cell.working).length,
    });
  }

  // Longest run of consecutive fully-working slots, allowing wrap past midnight.
  let bestRun = null;
  let runStart = -1;
  let runLength = 0;
  for (let i = 0; i < HOURS_IN_DAY * 2; i += 1) {
    const slot = slots[i % HOURS_IN_DAY];
    if (slot.allWorking) {
      if (runLength === 0) runStart = i % HOURS_IN_DAY;
      runLength += 1;
      if (runLength <= HOURS_IN_DAY && (!bestRun || runLength > bestRun.length)) {
        bestRun = { startHour: runStart, length: runLength };
      }
    } else {
      runLength = 0;
    }
  }

  return { slots, bestRun, anyOverlap: Boolean(bestRun) };
}

/**
 * Plain-text export of the board, for the copy button.
 * @returns {string}
 */
export function buildClipboardText(rows, headerLabel) {
  if (!Array.isArray(rows) || rows.length === 0) return "";
  const lines = [headerLabel || "World clock"];
  for (const row of rows) {
    if (!row || row.error) continue;
    const day = row.dayShift === 0 ? "" : ` (${row.dayShiftLabel.toLowerCase()})`;
    lines.push(`${row.city} — ${row.time}${day} · ${row.offsetLabel} · ${row.differenceLabel}`);
  }
  return lines.join("\n");
}
