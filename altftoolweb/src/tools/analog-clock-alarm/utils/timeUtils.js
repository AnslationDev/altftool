/**
 * Time utility helpers for analog-clock-alarm tool.
 */

/**
 * Returns the current Date object (live).
 */
export function now() {
  return new Date();
}

/**
 * Formats a Date to HH:MM:SS (24h) or hh:MM:SS AM/PM (12h).
 */
export function formatTime(date, use24h = false) {
  const h24 = date.getHours();
  const m = date.getMinutes().toString().padStart(2, "0");
  const s = date.getSeconds().toString().padStart(2, "0");
  if (use24h) {
    return `${h24.toString().padStart(2, "0")}:${m}:${s}`;
  }
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = ((h24 % 12) || 12).toString().padStart(2, "0");
  return `${h12}:${m}:${s} ${period}`;
}

/**
 * Returns a human-readable date string, e.g. "Monday, 14 July 2026".
 */
export function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Returns short timezone label, e.g. "IST", "UTC+5:30".
 */
export function getTimezoneLabel(date) {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZoneName: "short",
      timeZone: tz,
    }).formatToParts(date);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    return tzPart ? tzPart.value : tz;
  } catch {
    return "";
  }
}

/**
 * Returns a Date object in the given IANA timezone using Intl.
 */
export function getTimeInZone(timezone) {
  try {
    const str = new Date().toLocaleString("en-US", { timeZone: timezone });
    return new Date(str);
  } catch {
    return new Date();
  }
}

/**
 * Returns the UTC offset string, e.g. "UTC+5:30".
 */
export function getUtcOffset(timezone) {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    }).formatToParts(now);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    return tzPart ? tzPart.value : "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Pads a number to 2 digits.
 */
export function pad2(n) {
  return n.toString().padStart(2, "0");
}

/**
 * Returns HH:MM string from hours and minutes numbers.
 */
export function toHHMM(h, m) {
  return `${pad2(h)}:${pad2(m)}`;
}

/**
 * Checks if two time strings match the current time (HH:MM format vs current h+m).
 */
export function timeMatchesNow(timeStr, use24h) {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes();
  const [ah, am] = timeStr.split(":").map(Number);
  return ah === h && am === m && d.getSeconds() === 0;
}
