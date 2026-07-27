/**
 * Maintenance Window Announcement Generator.
 *
 * Takes a scheduled-maintenance window expressed as a wall-clock start in one IANA time
 * zone plus a duration, and produces:
 *   1. the same instant restated in UTC and in a set of reader time zones, and
 *   2. a ready-to-post announcement with impact, user action, rollback and status cadence.
 *
 * Time rules used here:
 *  - Instants are rendered in ISO 8601 extended form with the "Z" designator for UTC
 *    (ISO 8601-1:2019, and the profile in RFC 3339 section 5.6).
 *  - Zone offsets are resolved through the IANA Time Zone Database via Intl.DateTimeFormat,
 *    so DST is handled by the platform rather than by a hardcoded offset table.
 *
 * Everything in this module is pure: the "current time" used for notice-period arithmetic is
 * passed in as an argument, never read from the clock.
 */

/* ------------------------------------------------------------------ *
 * Constants
 * ------------------------------------------------------------------ */

/** Shortest window worth announcing at all — anything below this reads as a blip, not a window. */
export const MIN_WINDOW_MINUTES = 5;

/** Longest single window this tool will format. Longer work should be split into windows. */
export const MAX_WINDOW_MINUTES = 72 * 60;

/** Minutes in an hour / hours in a day — named so the arithmetic below reads as intent. */
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const MS_PER_MINUTE = 60 * 1000;

/**
 * A change window is conventionally announced with a buffer either side of the actual work,
 * so a late start or an overrun does not itself become an incident. 15 minutes is the usual
 * granularity operations calendars are booked in.
 */
export const DEFAULT_BUFFER_MINUTES = 15;

/**
 * Impact tiers, ordered least to most disruptive.
 *
 * `noticeHours` is the advance notice typically written into enterprise SaaS agreements for a
 * window of that severity (7 days for a full outage, 72 hours for a partial outage, 24 hours
 * for degraded performance, none required when there is no user-visible effect). These are
 * common contract values, not a single published standard — treat the warning as a prompt to
 * check your own agreement, not as a legal threshold.
 */
export const IMPACT_LEVELS = [
  {
    id: "none",
    label: "No user-visible impact",
    noticeHours: 0,
    summary: "no downtime and no expected degradation",
    userLine:
      "No action is needed. Sessions stay live and no requests are expected to fail.",
  },
  {
    id: "degraded",
    label: "Degraded performance",
    noticeHours: 24,
    summary: "slower responses and possible retries, but no full outage",
    userLine:
      "Expect slower responses and occasional retries. Avoid starting long imports or bulk jobs inside the window.",
  },
  {
    id: "partial",
    label: "Partial outage — some features unavailable",
    noticeHours: 72,
    summary: "some features unavailable while the rest of the service stays up",
    userLine:
      "The listed features will be unavailable for part of the window. Other functionality continues to work normally.",
  },
  {
    id: "full",
    label: "Full outage — service unavailable",
    noticeHours: 7 * HOURS_PER_DAY,
    summary: "the service is completely unavailable for the duration of the window",
    userLine:
      "The service will be unreachable for the whole window. Finish or pause anything time-sensitive before it starts.",
  },
];

/** Output channels. Each shapes the same facts differently. */
export const CHANNELS = [
  { id: "status", label: "Status page post" },
  { id: "email", label: "Customer email" },
  { id: "slack", label: "Slack / Teams message" },
];

/**
 * Reader time zones offered for the "local times" table. IANA Time Zone Database identifiers.
 */
export const TIME_ZONES = [
  { id: "UTC", label: "UTC" },
  { id: "Asia/Kolkata", label: "India — Asia/Kolkata" },
  { id: "Asia/Dubai", label: "Gulf — Asia/Dubai" },
  { id: "Asia/Singapore", label: "Singapore — Asia/Singapore" },
  { id: "Asia/Tokyo", label: "Japan — Asia/Tokyo" },
  { id: "Australia/Sydney", label: "Sydney — Australia/Sydney" },
  { id: "Europe/London", label: "UK — Europe/London" },
  { id: "Europe/Berlin", label: "Central Europe — Europe/Berlin" },
  { id: "America/New_York", label: "US East — America/New_York" },
  { id: "America/Chicago", label: "US Central — America/Chicago" },
  { id: "America/Denver", label: "US Mountain — America/Denver" },
  { id: "America/Los_Angeles", label: "US West — America/Los_Angeles" },
  { id: "America/Sao_Paulo", label: "Brazil — America/Sao_Paulo" },
];

/**
 * How often to post progress updates, by window length. Long windows without updates read as
 * a stalled change; very short ones only need a start and an end note.
 */
export const UPDATE_CADENCE_RULES = [
  { maxMinutes: 30, cadenceMinutes: 0, text: "one note at start and one at completion" },
  { maxMinutes: 120, cadenceMinutes: 30, text: "an update every 30 minutes" },
  { maxMinutes: 8 * MINUTES_PER_HOUR, cadenceMinutes: 60, text: "an update every hour" },
  { maxMinutes: Infinity, cadenceMinutes: 120, text: "an update every 2 hours" },
];

export function getImpactLevel(id) {
  return IMPACT_LEVELS.find((level) => level.id === id) || null;
}

export function getChannel(id) {
  return CHANNELS.find((channel) => channel.id === id) || null;
}

/* ------------------------------------------------------------------ *
 * Time-zone maths
 * ------------------------------------------------------------------ */

const OFFSET_FORMATTER_CACHE = new Map();

function offsetFormatter(timeZone) {
  let formatter = OFFSET_FORMATTER_CACHE.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    OFFSET_FORMATTER_CACHE.set(timeZone, formatter);
  }
  return formatter;
}

/** True when the platform recognises the IANA zone id. */
export function isValidTimeZone(timeZone) {
  if (typeof timeZone !== "string" || timeZone.trim() === "") return false;
  try {
    offsetFormatter(timeZone).format(0);
    return true;
  } catch {
    return false;
  }
}

/**
 * Offset of `timeZone` from UTC, in minutes, at the instant `utcMs`.
 * Positive east of Greenwich (Asia/Kolkata -> +330).
 */
export function zoneOffsetMinutes(utcMs, timeZone) {
  const parts = offsetFormatter(timeZone).formatToParts(new Date(utcMs));
  const field = {};
  for (const part of parts) {
    if (part.type !== "literal") field[part.type] = Number(part.value);
  }
  const asIfUtc = Date.UTC(
    field.year,
    field.month - 1,
    field.day,
    field.hour % HOURS_PER_DAY,
    field.minute,
    field.second,
  );
  return Math.round((asIfUtc - utcMs) / MS_PER_MINUTE);
}

/**
 * Convert a wall-clock date/time in a zone to a UTC epoch value.
 *
 * Two passes: guess the instant using the offset that applies to the naive UTC reading, then
 * re-read the offset at that instant and correct. This is the standard fix for windows near a
 * DST transition, where the first offset can belong to the wrong side of the change.
 *
 * @param {string} dateText "YYYY-MM-DD"
 * @param {string} timeText "HH:MM"
 * @param {string} timeZone IANA identifier
 * @returns {{error:string}|{utcMs:number, offsetMinutes:number}}
 */
export function wallTimeToUtc(dateText, timeText, timeZone) {
  if (!isValidTimeZone(timeZone)) {
    return { error: "Choose a valid time zone for the start time." };
  }
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateText || "").trim());
  if (!dateMatch) return { error: "Enter the start date as YYYY-MM-DD." };
  const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(String(timeText || "").trim());
  if (!timeMatch) return { error: "Enter the start time as HH:MM on a 24-hour clock." };

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (month < 1 || month > 12) return { error: "Start month must be between 01 and 12." };
  if (day < 1 || day > 31) return { error: "Start day must be between 01 and 31." };
  if (hour > 23) return { error: "Start hour must be between 00 and 23." };
  if (minute > 59) return { error: "Start minute must be between 00 and 59." };

  const naive = Date.UTC(year, month - 1, day, hour, minute, 0);
  if (!Number.isFinite(naive)) return { error: "That start date and time is not a real instant." };
  // Reject dates the calendar rolled over (e.g. 2026-02-30 becoming 2026-03-02).
  const rolled = new Date(naive);
  if (
    rolled.getUTCFullYear() !== year ||
    rolled.getUTCMonth() !== month - 1 ||
    rolled.getUTCDate() !== day
  ) {
    return { error: "That date does not exist in the calendar — check the day of the month." };
  }

  const firstOffset = zoneOffsetMinutes(naive, timeZone);
  let utcMs = naive - firstOffset * MS_PER_MINUTE;
  const secondOffset = zoneOffsetMinutes(utcMs, timeZone);
  if (secondOffset !== firstOffset) {
    utcMs = naive - secondOffset * MS_PER_MINUTE;
  }
  return { utcMs, offsetMinutes: zoneOffsetMinutes(utcMs, timeZone) };
}

/** "+05:30", "-04:00", "+00:00". */
export function formatOffset(minutes) {
  const value = Number(minutes);
  if (!Number.isFinite(value)) return "+00:00";
  const sign = value < 0 ? "-" : "+";
  const abs = Math.abs(Math.round(value));
  const hh = String(Math.floor(abs / MINUTES_PER_HOUR)).padStart(2, "0");
  const mm = String(abs % MINUTES_PER_HOUR).padStart(2, "0");
  return `${sign}${hh}:${mm}`;
}

/** ISO 8601 / RFC 3339 UTC timestamp, minute precision: "2026-08-15T22:00Z". */
export function formatIsoUtc(utcMs) {
  if (!Number.isFinite(utcMs)) return "";
  return `${new Date(utcMs).toISOString().slice(0, 16)}Z`;
}

const READABLE_CACHE = new Map();

/** "Sat 15 Aug 2026, 03:30" in the given zone. */
export function formatReadable(utcMs, timeZone) {
  if (!Number.isFinite(utcMs)) return "";
  let formatter = READABLE_CACHE.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hourCycle: "h23",
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    READABLE_CACHE.set(timeZone, formatter);
  }
  return formatter.format(new Date(utcMs)).replace(/,\s*(\d{2}:\d{2})$/, ", $1");
}

/** 95 -> "1 h 35 m"; 60 -> "1 h"; 45 -> "45 m". */
export function formatDuration(minutes) {
  const value = Number(minutes);
  if (!Number.isFinite(value) || value < 0) return "0 m";
  const whole = Math.floor(value / MINUTES_PER_HOUR);
  const rest = Math.round(value % MINUTES_PER_HOUR);
  if (whole === 0) return `${rest} m`;
  if (rest === 0) return `${whole} h`;
  return `${whole} h ${rest} m`;
}

/** Pick the update cadence that matches a window of this length. */
export function updateCadenceFor(windowMinutes) {
  const value = Number(windowMinutes);
  const rule =
    UPDATE_CADENCE_RULES.find((entry) => value <= entry.maxMinutes) ||
    UPDATE_CADENCE_RULES[UPDATE_CADENCE_RULES.length - 1];
  return rule;
}

/** Split a comma or newline separated list into deduplicated trimmed entries. */
export function parseList(text) {
  if (typeof text !== "string") return [];
  const out = [];
  const seen = new Set();
  for (const raw of text.split(/\r?\n|,/)) {
    const item = raw.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim();
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Window model
 * ------------------------------------------------------------------ */

/**
 * Resolve a window: start instant, end instant, buffered end, notice lead and DST crossing.
 *
 * @param {object} input
 * @param {string} input.startDate      "YYYY-MM-DD" wall-clock date in `timeZone`
 * @param {string} input.startTime      "HH:MM" wall-clock time in `timeZone`
 * @param {string} input.timeZone       IANA zone the wall time is expressed in
 * @param {number} input.durationMinutes Length of the work itself
 * @param {number} [input.bufferMinutes] Contingency added after the work
 * @param {string} [input.announcedAtIso] ISO instant the notice goes out — for lead-time maths
 * @returns {{error:string}|object}
 */
export function resolveWindow({
  startDate,
  startTime,
  timeZone,
  durationMinutes,
  bufferMinutes = DEFAULT_BUFFER_MINUTES,
  announcedAtIso,
}) {
  const duration = Number(durationMinutes);
  if (!Number.isFinite(duration)) {
    return { error: "Enter the window length in minutes." };
  }
  if (duration < MIN_WINDOW_MINUTES) {
    return { error: `A window shorter than ${MIN_WINDOW_MINUTES} minutes is not worth announcing.` };
  }
  if (duration > MAX_WINDOW_MINUTES) {
    return {
      error: `Windows longer than ${MAX_WINDOW_MINUTES / MINUTES_PER_HOUR} hours should be split into separate announcements.`,
    };
  }

  const buffer = Number(bufferMinutes);
  if (!Number.isFinite(buffer) || buffer < 0) {
    return { error: "Contingency buffer must be zero or more minutes." };
  }
  if (buffer > MAX_WINDOW_MINUTES) {
    return { error: "Contingency buffer is longer than the maximum window this tool formats." };
  }

  const start = wallTimeToUtc(startDate, startTime, timeZone);
  if (start.error) return { error: start.error };

  const startUtcMs = start.utcMs;
  const endUtcMs = startUtcMs + duration * MS_PER_MINUTE;
  const bufferedEndUtcMs = endUtcMs + buffer * MS_PER_MINUTE;

  const startOffset = zoneOffsetMinutes(startUtcMs, timeZone);
  const endOffset = zoneOffsetMinutes(bufferedEndUtcMs, timeZone);
  const crossesDstChange = startOffset !== endOffset;

  let noticeMinutes = null;
  if (typeof announcedAtIso === "string" && announcedAtIso.trim() !== "") {
    const announcedMs = Date.parse(announcedAtIso);
    if (!Number.isFinite(announcedMs)) {
      return { error: "The announcement time is not a valid date." };
    }
    noticeMinutes = Math.round((startUtcMs - announcedMs) / MS_PER_MINUTE);
  }

  return {
    startUtcMs,
    endUtcMs,
    bufferedEndUtcMs,
    durationMinutes: duration,
    bufferMinutes: buffer,
    totalMinutes: duration + buffer,
    timeZone,
    startOffsetMinutes: startOffset,
    endOffsetMinutes: endOffset,
    crossesDstChange,
    noticeMinutes,
    cadence: updateCadenceFor(duration + buffer),
  };
}

/** Restate one instant across a list of zones. */
export function localTimeTable(utcMs, zoneIds) {
  if (!Number.isFinite(utcMs) || !Array.isArray(zoneIds)) return [];
  return zoneIds
    .filter((id) => isValidTimeZone(id))
    .map((id) => {
      const offset = zoneOffsetMinutes(utcMs, id);
      const known = TIME_ZONES.find((zone) => zone.id === id);
      return {
        id,
        label: known ? known.label : id,
        offsetMinutes: offset,
        offsetText: formatOffset(offset),
        readable: formatReadable(utcMs, id),
      };
    });
}

/* ------------------------------------------------------------------ *
 * Announcement
 * ------------------------------------------------------------------ */

/**
 * Build the full announcement.
 *
 * @returns {{error:string}|{text:string, window:object, warnings:string[], ...}}
 */
export function buildMaintenanceAnnouncement({
  serviceName,
  reason,
  startDate,
  startTime,
  timeZone,
  durationMinutes,
  bufferMinutes = DEFAULT_BUFFER_MINUTES,
  impactId,
  affectedText,
  rollbackText,
  statusUrl,
  contact,
  channelId,
  displayZones,
  announcedAtIso,
} = {}) {
  const service = typeof serviceName === "string" ? serviceName.trim() : "";
  if (!service) return { error: "Enter the name of the service going into maintenance." };

  const impact = getImpactLevel(impactId);
  if (!impact) return { error: "Choose the expected impact level." };

  const channel = getChannel(channelId);
  if (!channel) return { error: "Choose the channel this announcement is for." };

  const window = resolveWindow({
    startDate,
    startTime,
    timeZone,
    durationMinutes,
    bufferMinutes,
    announcedAtIso,
  });
  if (window.error) return { error: window.error };

  const zoneIds = Array.isArray(displayZones) && displayZones.length > 0 ? displayZones : ["UTC"];
  const startTable = localTimeTable(window.startUtcMs, zoneIds);
  const endTable = localTimeTable(window.bufferedEndUtcMs, zoneIds);
  if (startTable.length === 0) {
    return { error: "Select at least one time zone to show local times for." };
  }

  const affected = parseList(affectedText);
  if (impact.id !== "none" && affected.length === 0) {
    return {
      error: "List at least one affected service or feature, or set the impact to “No user-visible impact”.",
    };
  }

  const rollback = typeof rollbackText === "string" ? rollbackText.trim() : "";
  if (!rollback) {
    return { error: "Write the rollback statement — what happens if the change has to be reverted." };
  }

  const status = typeof statusUrl === "string" ? statusUrl.trim() : "";
  const contactLine = typeof contact === "string" ? contact.trim() : "";
  const why = typeof reason === "string" ? reason.trim() : "";

  const warnings = [];
  if (window.noticeMinutes !== null) {
    const noticeHours = window.noticeMinutes / MINUTES_PER_HOUR;
    if (window.noticeMinutes < 0) {
      warnings.push("The window starts before the announcement time — this notice is already late.");
    } else if (impact.noticeHours > 0 && noticeHours < impact.noticeHours) {
      warnings.push(
        `Only ${formatDuration(window.noticeMinutes)} of notice. Windows with this impact level are commonly contracted to need ${impact.noticeHours} hours.`,
      );
    }
  }
  if (window.crossesDstChange) {
    warnings.push(
      `The clock in ${window.timeZone} changes offset inside this window (${formatOffset(window.startOffsetMinutes)} to ${formatOffset(window.endOffsetMinutes)}) — publish the UTC times as the authoritative ones.`,
    );
  }

  const headline = `Scheduled maintenance: ${service} — ${formatReadable(window.startUtcMs, "UTC")} UTC`;

  const lines = [];
  if (channel.id === "email") {
    lines.push(`Subject: ${headline}`, "");
  } else {
    lines.push(headline, "");
  }

  lines.push(
    `We will perform scheduled maintenance on ${service}${why ? ` to ${why}` : ""}. Expect ${impact.summary}.`,
    "",
    "WHEN",
    `Start: ${formatIsoUtc(window.startUtcMs)} (UTC)`,
    `End:   ${formatIsoUtc(window.bufferedEndUtcMs)} (UTC)`,
    `Window length: ${formatDuration(window.totalMinutes)} — ${formatDuration(window.durationMinutes)} of work plus ${formatDuration(window.bufferMinutes)} contingency.`,
    "",
    "Local start times:",
    ...startTable.map((zone) => `  ${zone.label}: ${zone.readable} (UTC${zone.offsetText})`),
    "",
    "Local end times:",
    ...endTable.map((zone) => `  ${zone.label}: ${zone.readable} (UTC${zone.offsetText})`),
    "",
    `EXPECTED IMPACT — ${impact.label}`,
    impact.userLine,
  );

  if (affected.length > 0) {
    lines.push("", `Affected (${affected.length}):`, ...affected.map((item) => `  - ${item}`));
  }

  lines.push(
    "",
    "ROLLBACK",
    rollback,
    `If the change is reverted, the service returns to its current version and this window closes early. We will post a note either way by ${formatIsoUtc(window.bufferedEndUtcMs)}.`,
    "",
    "UPDATES",
    `We will post ${window.cadence.text} while the window is open${status ? ` at ${status}` : ""}.`,
  );

  if (contactLine) {
    lines.push(`Questions or an urgent problem during the window: ${contactLine}.`);
  }

  if (channel.id === "slack") {
    lines.push(
      "",
      `TL;DR: ${service} maintenance, ${formatIsoUtc(window.startUtcMs)} UTC for ${formatDuration(window.totalMinutes)}. ${impact.label}.`,
    );
  }
  if (channel.id === "email") {
    lines.push("", "No reply is needed. This notice is sent once per scheduled window.");
  }

  const text = lines.join("\n");

  return {
    text,
    headline,
    window,
    impact,
    channel,
    affected,
    startTable,
    endTable,
    warnings,
    startIsoUtc: formatIsoUtc(window.startUtcMs),
    endIsoUtc: formatIsoUtc(window.bufferedEndUtcMs),
  };
}
