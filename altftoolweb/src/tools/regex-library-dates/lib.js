/**
 * Date / time regex library.
 *
 * Sources for the rules encoded here:
 *  - ISO 8601 / RFC 3339 — YYYY-MM-DD calendar dates and the
 *    date-time T separator, fractional seconds and Z / ±hh:mm offsets.
 *  - RFC 3164 §4.1.2 — the classic syslog TIMESTAMP: "Mmm dd hh:mm:ss" where
 *    a single-digit day is padded with a space ("Jan  1").
 *  - Apache Common Log Format — the %t field "[dd/Mmm/yyyy:hh:mm:ss +zzzz]".
 *  - Month/day digit ranges (01–12, 01–31, hours 00–23, minutes/seconds
 *    00–59) are validated by alternation; per-month day counts and leap
 *    years are NOT — regex cannot reasonably know February's length.
 */

/**
 * Guard against pathological inputs; a log line rarely exceeds a few hundred
 * characters, and 2000 keeps worst-case backtracking trivial.
 */
export const MAX_TEST_INPUT = 2000;

export const PATTERNS = [
  {
    id: "iso-date",
    name: "ISO 8601 date (YYYY-MM-DD)",
    strictness: "Validation",
    source: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.source,
    flags: "",
    description:
      "Calendar dates in the ISO 8601 / RFC 3339 full-date shape, with the month held to 01–12 and the day to 01–31 by alternation.",
    limitations: [
      "Does not know month lengths — 2026-02-31 and 2026-04-31 pass; verify with a date parser.",
      "No leap-year logic — 2025-02-29 passes.",
      "Requires zero padding: 2026-7-6 fails (that is correct ISO, but surprises people).",
    ],
    shouldMatch: ["2026-07-26", "1999-12-31", "2028-02-29"],
    shouldNotMatch: ["2026-13-01", "2026-00-10", "2026-07-32", "26-07-2026"],
  },
  {
    id: "iso-datetime",
    name: "ISO 8601 date-time (RFC 3339)",
    strictness: "Validation",
    source:
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])[T ]([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d{1,6})?(Z|[+-]([01]\d|2[0-3]):?[0-5]\d)?$/
        .source,
    flags: "",
    description:
      "Timestamps like 2026-07-26T14:30:00Z or 2026-07-26 09:15:59.123+05:30 — T or space separator, optional fractional seconds (up to 6 digits) and optional Z / ±hh:mm offset.",
    limitations: [
      "Rejects ISO's special 24:00:00 midnight notation (hours stop at 23 here).",
      "Same month-length blindness as the plain date pattern.",
      "An offset like +99:99 fails, but the pattern cannot check the offset is a real timezone.",
    ],
    shouldMatch: [
      "2026-07-26T14:30:00Z",
      "2026-07-26 09:15:59.123+05:30",
      "2026-01-01T00:00:00",
    ],
    shouldNotMatch: ["2026-07-26T24:00:00Z", "2026-07-26T14:60:00Z", "2026/07/26T14:30:00Z"],
  },
  {
    id: "ddmmyyyy",
    name: "DD/MM/YYYY (India, UK, EU)",
    strictness: "Validation",
    source: /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.source,
    flags: "",
    description:
      "Day-first slash dates as written in India, the UK and most of Europe, with day 01–31 and month 01–12 enforced.",
    limitations: [
      "Ambiguous with US order for days ≤ 12 — 01/02/2026 also matches the MM/DD pattern; a regex cannot tell you which was meant.",
      "Zero padding required: 6/7/2026 fails.",
      "No month-length or leap-year checks (31/02/2026 passes).",
    ],
    shouldMatch: ["26/07/2026", "01/01/1900", "31/12/2026"],
    shouldNotMatch: ["32/01/2026", "26/13/2026", "7/26/2026"],
  },
  {
    id: "mmddyyyy",
    name: "MM/DD/YYYY (US)",
    strictness: "Validation",
    source: /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/.source,
    flags: "",
    description:
      "Month-first US slash dates, with month 01–12 and day 01–31 enforced by alternation.",
    limitations: [
      "Ambiguous with day-first order for days ≤ 12 — decide the convention per data source, not per string.",
      "Zero padding required: 7/4/2026 fails.",
      "No month-length or leap-year checks (02/31/2026 passes).",
    ],
    shouldMatch: ["07/26/2026", "12/31/2026", "02/29/2028"],
    shouldNotMatch: ["13/01/2026", "07/32/2026", "26/07/2026"],
  },
  {
    id: "clock-time",
    name: "Clock time (24h or 12h AM/PM)",
    strictness: "Validation",
    source:
      /^(?:([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?|(0?[1-9]|1[0-2]):[0-5]\d(?::[0-5]\d)?\s?[AaPp][Mm])$/
        .source,
    flags: "",
    description:
      "Times of day: 24-hour form (14:30, 23:59:59) or 12-hour form with AM/PM (9:05 PM, 12:00am), seconds optional in both.",
    limitations: [
      "24:00 is rejected even though some standards allow it as end-of-day.",
      "Accepts 12-hour times without checking the 12 AM/PM edge semantics — 12:30 AM means 00:30, which your parser must handle.",
      "No timezone component; combine with the ISO date-time pattern when you need offsets.",
    ],
    shouldMatch: ["14:30", "23:59:59", "9:05 PM", "12:00am"],
    shouldNotMatch: ["24:00", "13:00 PM", "12:60"],
  },
  {
    id: "syslog",
    name: "Syslog timestamp (RFC 3164)",
    strictness: "Log matching",
    source: /^[A-Z][a-z]{2}\s{1,2}\d{1,2}\s\d{2}:\d{2}:\d{2}/.source,
    flags: "",
    description:
      "Matches lines starting with the classic syslog header time — 'Jul 26 14:30:05' — including the double space RFC 3164 uses before single-digit days ('Jan  1').",
    limitations: [
      "Anchored to line start only (no $), so it is a prefix matcher for grepping, not a full-line validator.",
      "Any capitalised three-letter word passes as the month (Xyz 26 14:30:05 matches).",
      "RFC 3164 timestamps carry no year or timezone — you must infer both when parsing.",
    ],
    shouldMatch: ["Jul 26 14:30:05 host app[123]: started", "Jan  1 00:00:00 boot"],
    shouldNotMatch: ["2026-07-26 message", "26 Jul 14:30:05"],
  },
  {
    id: "apache-clf",
    name: "Apache access log %t (CLF)",
    strictness: "Log extraction",
    source: /\[\d{2}\/[A-Z][a-z]{2}\/\d{4}:\d{2}:\d{2}:\d{2} [+-]\d{4}\]/.source,
    flags: "",
    description:
      "Finds the bracketed Common Log Format timestamp — [26/Jul/2026:14:30:05 +0530] — anywhere in an access-log line, ready for use with a global flag when extracting.",
    limitations: [
      "Unanchored extraction pattern — it finds the field, it does not validate a whole line.",
      "Digit ranges are not checked (day 99 or hour 66 would pass); CLF writers never emit those, so the trade keeps the pattern readable.",
      "Month must be an English three-letter abbreviation with initial capital, as Apache writes it.",
    ],
    shouldMatch: [
      '127.0.0.1 - - [26/Jul/2026:14:30:05 +0530] "GET / HTTP/1.1" 200 512',
      "[01/Jan/2026:00:00:00 +0000]",
    ],
    shouldNotMatch: ["[2026-07-26 14:30:05]", "[26/July/2026:14:30:05 +0530]"],
  },
];

/**
 * Compile a pattern source safely.
 * @returns {{regex: RegExp} | {error: string}}
 */
export function compileRegex(source, flags = "") {
  if (typeof source !== "string" || source.length === 0) {
    return { error: "Pattern source is empty." };
  }
  try {
    return { regex: new RegExp(source, flags) };
  } catch (cause) {
    return { error: `Invalid regular expression: ${cause.message}` };
  }
}

/**
 * Test one input string against a pattern.
 * @returns {{matched: boolean, input: string} | {error: string}}
 */
export function testInput({ source, flags = "", input }) {
  if (typeof input !== "string") {
    return { error: "Type a value to test." };
  }
  if (input.length > MAX_TEST_INPUT) {
    return { error: `Test input is limited to ${MAX_TEST_INPUT} characters.` };
  }
  const compiled = compileRegex(source, flags);
  if (compiled.error) return { error: compiled.error };
  return { matched: compiled.regex.test(input), input };
}

/**
 * Run a pattern against its own documented examples.
 * @returns {{passed: boolean, total: number, failures: string[]}}
 */
export function selfTest(pattern) {
  const failures = [];
  const compiled = compileRegex(pattern.source, pattern.flags);
  if (compiled.error) {
    return { passed: false, total: 0, failures: [compiled.error] };
  }
  for (const sample of pattern.shouldMatch) {
    if (!compiled.regex.test(sample)) failures.push(`expected match: ${sample}`);
  }
  for (const sample of pattern.shouldNotMatch) {
    if (compiled.regex.test(sample)) failures.push(`expected NO match: ${sample}`);
  }
  const total = pattern.shouldMatch.length + pattern.shouldNotMatch.length;
  return { passed: failures.length === 0, total, failures };
}
