/**
 * Stream time-zone conversion.
 *
 * A wall-clock time is meaningless without a zone, so the whole module works
 * in two steps:
 *   1. resolve the entered date + time + IANA zone to a single UTC instant, and
 *   2. re-render that instant in every audience zone.
 *
 * Step 1 has no direct API in JavaScript, so it uses the standard round-trip:
 * guess the instant as if the wall time were UTC, ask Intl what offset the
 * zone had at that guess, subtract it, then repeat once. The second pass is
 * what makes daylight-saving transitions land correctly, because the offset
 * either side of a DST jump differs from the offset at the naive guess.
 *
 * All zone data comes from the browser/Node ICU database via Intl — there is
 * no hardcoded offset table to go stale.
 */

/** IANA zones that cover the bulk of a typical stream audience. */
export const ZONE_PRESETS = [
  { id: "Pacific/Auckland", label: "Auckland" },
  { id: "Australia/Sydney", label: "Sydney" },
  { id: "Asia/Tokyo", label: "Tokyo" },
  { id: "Asia/Seoul", label: "Seoul" },
  { id: "Asia/Shanghai", label: "Shanghai" },
  { id: "Asia/Singapore", label: "Singapore" },
  { id: "Asia/Jakarta", label: "Jakarta" },
  { id: "Asia/Kolkata", label: "India (IST)" },
  { id: "Asia/Karachi", label: "Karachi" },
  { id: "Asia/Dubai", label: "Dubai" },
  { id: "Europe/Moscow", label: "Moscow" },
  { id: "Europe/Istanbul", label: "Istanbul" },
  { id: "Africa/Lagos", label: "Lagos" },
  { id: "Europe/Berlin", label: "Berlin / Paris / Madrid" },
  { id: "Europe/London", label: "London" },
  { id: "UTC", label: "UTC" },
  { id: "America/Sao_Paulo", label: "Sao Paulo" },
  { id: "America/New_York", label: "New York (ET)" },
  { id: "America/Chicago", label: "Chicago (CT)" },
  { id: "America/Denver", label: "Denver (MT)" },
  { id: "America/Los_Angeles", label: "Los Angeles (PT)" },
  { id: "Pacific/Honolulu", label: "Honolulu" },
];

/**
 * Rough day-part bands used to flag whether a slot is friendly for viewers.
 * Streaming prime time is widely taken as roughly 18:00-23:00 local.
 */
export const DAY_PARTS = [
  { id: "late-night", label: "Late night", from: 0, to: 5, friendly: false },
  { id: "early", label: "Early morning", from: 5, to: 9, friendly: false },
  { id: "morning", label: "Morning", from: 9, to: 12, friendly: true },
  { id: "afternoon", label: "Afternoon", from: 12, to: 17, friendly: true },
  { id: "evening", label: "Prime time", from: 17, to: 23, friendly: true },
  { id: "night", label: "Night", from: 23, to: 24, friendly: false },
];

const MS_PER_MINUTE = 60000;
const MINUTES_PER_HOUR = 60;

const pad = (n) => String(n).padStart(2, "0");

/** Does this runtime know the zone? Unknown zones make Intl throw. */
export function isValidZone(timeZone) {
  if (typeof timeZone !== "string" || timeZone.trim() === "") return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(0);
    return true;
  } catch {
    return false;
  }
}

/**
 * The zone's UTC offset, in minutes, at a given instant.
 * Positive means ahead of UTC (Kolkata = +330).
 */
export function zoneOffsetMinutes(instantMs, timeZone) {
  if (!Number.isFinite(instantMs) || !isValidZone(timeZone)) return NaN;
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = {};
  for (const part of dtf.formatToParts(new Date(instantMs))) {
    if (part.type !== "literal") parts[part.type] = Number(part.value);
  }
  const asIfUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return Math.round((asIfUtc - instantMs) / MS_PER_MINUTE);
}

/** "+05:30", "-07:00", "+00:00" */
export function formatOffset(minutes) {
  if (!Number.isFinite(minutes)) return "—";
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  return `${sign}${pad(Math.floor(abs / MINUTES_PER_HOUR))}:${pad(abs % MINUTES_PER_HOUR)}`;
}

/**
 * Resolve a wall-clock time in a named zone to a UTC instant in milliseconds.
 * Two passes handle daylight-saving boundaries.
 */
export function wallTimeToInstant({ year, month, day, hour, minute, timeZone }) {
  if (![year, month, day, hour, minute].every((v) => Number.isFinite(v))) return NaN;
  if (!isValidZone(timeZone)) return NaN;
  const naive = Date.UTC(year, month - 1, day, hour, minute, 0);
  let instant = naive - zoneOffsetMinutes(naive, timeZone) * MS_PER_MINUTE;
  instant = naive - zoneOffsetMinutes(instant, timeZone) * MS_PER_MINUTE;
  return instant;
}

/** Which day-part band an hour falls in. */
export function dayPartForHour(hour) {
  return DAY_PARTS.find((part) => hour >= part.from && hour < part.to) || DAY_PARTS[0];
}

/**
 * Render an instant in a zone: calendar parts, both clock formats, the zone's
 * short name, and the offset that actually applied on that date.
 */
export function describeInZone(instantMs, timeZone) {
  if (!Number.isFinite(instantMs) || !isValidZone(timeZone)) return null;
  const date = new Date(instantMs);
  const parts = {};
  for (const part of new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hourCycle: "h23",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }
  const numeric = {};
  for (const part of new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date)) {
    if (part.type !== "literal") numeric[part.type] = Number(part.value);
  }
  let shortName = "";
  try {
    shortName =
      new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" })
        .formatToParts(date)
        .find((p) => p.type === "timeZoneName")?.value || "";
  } catch {
    shortName = "";
  }
  const hour12 = numeric.hour % 12 === 0 ? 12 : numeric.hour % 12;
  const meridiem = numeric.hour < 12 ? "am" : "pm";
  const bandInfo = dayPartForHour(numeric.hour);

  return {
    timeZone,
    year: numeric.year,
    month: numeric.month,
    day: numeric.day,
    hour: numeric.hour,
    minute: numeric.minute,
    dateKey: `${numeric.year}-${pad(numeric.month)}-${pad(numeric.day)}`,
    weekday: parts.weekday || "",
    dateLabel: `${parts.weekday || ""} ${parts.day || ""} ${parts.month || ""}`.trim(),
    time24: `${pad(numeric.hour)}:${pad(numeric.minute)}`,
    time12: `${hour12}:${pad(numeric.minute)} ${meridiem}`,
    shortName,
    offsetMinutes: zoneOffsetMinutes(instantMs, timeZone),
    dayPart: bandInfo.label,
    friendly: bandInfo.friendly,
  };
}

/** Whole days between two YYYY-MM-DD keys. */
export function dayDifference(fromKey, toKey) {
  const [fy, fm, fd] = fromKey.split("-").map(Number);
  const [ty, tm, td] = toKey.split("-").map(Number);
  const a = Date.UTC(fy, fm - 1, fd);
  const b = Date.UTC(ty, tm - 1, td);
  return Math.round((b - a) / (24 * 60 * MS_PER_MINUTE));
}

/**
 * Main conversion.
 *
 * @param {object} input
 * @param {string} input.date        "YYYY-MM-DD" of the stream start.
 * @param {string} input.time        "HH:MM" in 24-hour form.
 * @param {string} input.sourceZone  IANA zone the date and time are given in.
 * @param {string[]} input.targetZones IANA zones to convert into.
 * @returns {object} source + rows, or { error }.
 */
export function convertStreamTime({ date, time, sourceZone, targetZones = [] } = {}) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: "Pick a valid stream date." };
  }
  if (typeof time !== "string" || !/^\d{2}:\d{2}$/.test(time)) {
    return { error: "Pick a valid start time in 24-hour form." };
  }
  if (!isValidZone(sourceZone)) {
    return { error: "Choose the time zone your start time is written in." };
  }
  if (!Array.isArray(targetZones) || targetZones.length === 0) {
    return { error: "Add at least one audience time zone." };
  }

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { error: "That date does not exist." };
  }
  if (hour > 23 || minute > 59) {
    return { error: "Start time must be between 00:00 and 23:59." };
  }

  const instantMs = wallTimeToInstant({ year, month, day, hour, minute, timeZone: sourceZone });
  if (!Number.isFinite(instantMs)) {
    return { error: "That date and time could not be resolved in the chosen zone." };
  }

  const source = describeInZone(instantMs, sourceZone);
  if (!source) return { error: "That date and time could not be resolved in the chosen zone." };

  const rows = [];
  for (const zone of targetZones) {
    if (!isValidZone(zone)) continue;
    const detail = describeInZone(instantMs, zone);
    if (!detail) continue;
    rows.push({
      ...detail,
      label: ZONE_PRESETS.find((z) => z.id === zone)?.label || zone,
      dayShift: dayDifference(source.dateKey, detail.dateKey),
      hoursFromSource: (detail.offsetMinutes - source.offsetMinutes) / MINUTES_PER_HOUR,
    });
  }

  if (rows.length === 0) return { error: "None of the chosen time zones are recognised." };

  rows.sort((a, b) => b.offsetMinutes - a.offsetMinutes);
  const friendlyCount = rows.filter((row) => row.friendly).length;

  // If re-rendering the instant in the source zone does not reproduce the
  // requested wall time, that wall time falls inside a daylight-saving gap
  // (the hour the clocks skip) and simply never happens locally.
  const dstGap = source.hour !== hour || source.minute !== minute;

  return {
    instantMs,
    utcIso: new Date(instantMs).toISOString(),
    source,
    dstGap,
    requestedTime: `${pad(hour)}:${pad(minute)}`,
    rows,
    friendlyCount,
    friendlyPct: (friendlyCount / rows.length) * 100,
  };
}
