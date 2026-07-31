/**
 * Calendar Versioning (CalVer) formatter.
 *
 * Token meanings follow the CalVer scheme reference (calver.org):
 *   YYYY  full year            2006, 2016, 2026
 *   YY    short year           6, 16, 106        (year minus 2000, no padding)
 *   0Y    zero-padded short yr 06, 16, 106
 *   MM    month                1 .. 12 (no padding)
 *   0M    zero-padded month    01 .. 12
 *   WW    short week           1 .. 53  (week of the year since January 1st)
 *   0W    zero-padded week     01 .. 53
 *   DD    day                  1 .. 31 (no padding)
 *   0D    zero-padded day      01 .. 31
 *   MINOR / MICRO              ordinary incremented numbers
 *   MODIFIER                   optional tag such as beta or rc1
 * Real-world examples: Ubuntu uses YY.0M (24.04 = April 2024); JetBrains IDEs
 * use YYYY.MINOR (2026.1).
 */

export const KNOWN_TOKENS = ["YYYY", "YY", "0Y", "MM", "0M", "WW", "0W", "DD", "0D", "MINOR", "MICRO", "MODIFIER"];

/** Ready-made schemes offered in the UI, with their best-known users. */
export const PRESET_SCHEMES = [
  { scheme: "YYYY.MM.MICRO", note: "Full year, unpadded month, release counter" },
  { scheme: "YY.0M", note: "Ubuntu style — 24.04 is April 2024" },
  { scheme: "YYYY.MINOR", note: "JetBrains style — 2026.1" },
  { scheme: "YYYY.0M.0D", note: "Full date, zero-padded" },
  { scheme: "YY.MM.MICRO", note: "Short year variant" },
  { scheme: "YYYY.WW", note: "Year plus week number" },
];

/** CalVer's short year is counted from 2000 (calver.org: 2006 -> 6, 2106 -> 106). */
const SHORT_YEAR_BASE = 2000;
const DAYS_PER_WEEK = 7;

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function daysInMonth(year, month) {
  if (month === 2 && isLeapYear(year)) return 29;
  return DAYS_IN_MONTH[month - 1];
}

/** 1-based day of year for a valid calendar date. */
export function dayOfYear(year, month, day) {
  let total = day;
  for (let m = 1; m < month; m += 1) total += daysInMonth(year, m);
  return total;
}

/** Week of the year "since the start of the year": Jan 1-7 -> 1, Jan 8-14 -> 2, ... */
export function weekOfYear(year, month, day) {
  return Math.floor((dayOfYear(year, month, day) - 1) / DAYS_PER_WEEK) + 1;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

/**
 * Format one CalVer version.
 * @param {object} input
 * @param {string} input.scheme    Dot-separated tokens, e.g. "YYYY.MM.MICRO".
 * @param {number} input.year, input.month, input.day  Release date parts.
 * @param {number} [input.minor]   Value for MINOR tokens.
 * @param {number} [input.micro]   Value for MICRO tokens.
 * @param {string} [input.modifier] Value for MODIFIER tokens (e.g. "beta1").
 * @returns {{version:string, tokens:Array<{token:string, value:string}>}|{error:string}}
 */
export function formatCalVer({ scheme, year, month, day, minor = 0, micro = 0, modifier = "" }) {
  const schemeText = String(scheme ?? "").trim();
  if (schemeText === "") return { error: "Enter a scheme such as YYYY.MM.MICRO." };

  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (!Number.isInteger(y) || y < SHORT_YEAR_BASE || y > 2999) {
    return { error: "Enter a release year between 2000 and 2999 (CalVer short years count from 2000)." };
  }
  if (!Number.isInteger(m) || m < 1 || m > 12) return { error: "Enter a month from 1 to 12." };
  if (!Number.isInteger(d) || d < 1 || d > daysInMonth(y, m)) {
    return { error: `That day does not exist — ${y}-${pad2(m)} has ${daysInMonth(y, m)} days.` };
  }
  const minorNum = Number(minor);
  const microNum = Number(micro);
  if (!Number.isInteger(minorNum) || minorNum < 0) return { error: "MINOR must be a whole number of 0 or more." };
  if (!Number.isInteger(microNum) || microNum < 0) return { error: "MICRO must be a whole number of 0 or more." };

  const modifierText = String(modifier ?? "").trim();
  const tokens = schemeText.split(".").map((token) => token.trim());
  const rendered = [];
  for (const token of tokens) {
    const upper = token.toUpperCase();
    if (!KNOWN_TOKENS.includes(upper)) {
      return { error: `Unknown token "${token}" — valid tokens are ${KNOWN_TOKENS.join(", ")}.` };
    }
    let value;
    if (upper === "YYYY") value = String(y);
    else if (upper === "YY") value = String(y - SHORT_YEAR_BASE);
    else if (upper === "0Y") value = pad2(y - SHORT_YEAR_BASE);
    else if (upper === "MM") value = String(m);
    else if (upper === "0M") value = pad2(m);
    else if (upper === "WW") value = String(weekOfYear(y, m, d));
    else if (upper === "0W") value = pad2(weekOfYear(y, m, d));
    else if (upper === "DD") value = String(d);
    else if (upper === "0D") value = pad2(d);
    else if (upper === "MINOR") value = String(minorNum);
    else if (upper === "MICRO") value = String(microNum);
    else {
      // MODIFIER: skipped entirely when empty.
      if (modifierText === "") continue;
      value = modifierText;
    }
    rendered.push({ token: upper, value });
  }
  if (rendered.length === 0) return { error: "The scheme produced no output — add at least one date token." };

  return { version: rendered.map((part) => part.value).join("."), tokens: rendered };
}

function addMonths(year, month, count) {
  const zeroBased = year * 12 + (month - 1) + count;
  return { year: Math.floor(zeroBased / 12), month: (zeroBased % 12) + 1 };
}

/**
 * Preview timeline: the version each of the next `count` monthly releases would get,
 * with MICRO/MINOR reset to 0 each period (the CalVer convention: counters restart
 * when the date segment rolls over).
 */
export function previewTimeline({ scheme, year, month, day, count = 6, modifier = "" }) {
  const releases = [];
  for (let i = 1; i <= count; i += 1) {
    const next = addMonths(Number(year), Number(month), i);
    const clampedDay = Math.min(Number(day), daysInMonth(next.year, next.month));
    const result = formatCalVer({
      scheme,
      year: next.year,
      month: next.month,
      day: clampedDay,
      minor: 0,
      micro: 0,
      modifier,
    });
    if (result.error) return { error: result.error };
    releases.push({ year: next.year, month: next.month, day: clampedDay, version: result.version });
  }
  return { releases };
}
