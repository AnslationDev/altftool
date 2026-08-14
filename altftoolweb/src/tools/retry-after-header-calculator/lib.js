/**
 * Retry-After header construction.
 *
 * Rule sources:
 *
 *  - RFC 9110 section 10.2.3 defines the field as:
 *        Retry-After = HTTP-date / delay-seconds
 *        delay-seconds = 1*DIGIT
 *    So the value is EITHER an HTTP-date OR a non-negative integer count of
 *    seconds. There is no unit suffix, no decimal point and no sign. "120s",
 *    "2 minutes" and "-1" are all malformed and will be ignored by a conforming
 *    client.
 *
 *  - RFC 9110 section 5.6.7 requires a sender generating an HTTP-date to use the
 *    IMF-fixdate format, in GMT, with no offset other than "GMT":
 *        Sun, 06 Nov 1994 08:49:37 GMT
 *    Day and month names are the fixed English three-letter abbreviations. The
 *    day-of-month is two digits, zero padded. rfc850-date and asctime-date are
 *    accepted by recipients for legacy reasons but must never be generated.
 *
 *  - RFC 9110 section 15.6.4 (503 Service Unavailable) and section 15.4
 *    (redirection) allow Retry-After. RFC 6585 section 4 defines 429 Too Many
 *    Requests and states the response "can" include Retry-After.
 *
 *  - Exponential backoff with jitter follows the pattern described in the AWS
 *    Architecture Blog article "Exponential Backoff And Jitter": the uncapped
 *    delay for attempt n is base * factor^(n-1), capped at a ceiling, and then
 *    randomised so that a synchronised herd of clients does not retry in lockstep.
 *    "Full" jitter picks uniformly from [0, cap]; "equal" jitter picks
 *    cap/2 + uniform(0, cap/2).
 *
 * Everything here is pure. The current time is always passed in as an argument so
 * the same inputs always give the same output.
 */

/** IMF-fixdate day names, RFC 9110 section 5.6.7. Index 0 is Sunday. */
export const IMF_DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** IMF-fixdate month names, RFC 9110 section 5.6.7. Index 0 is January. */
export const IMF_MONTH_NAMES = [
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
 * Practical ceiling on a delay-seconds value: one year. The grammar itself sets
 * no maximum, but proxies and clients routinely clamp very large values, and a
 * wait longer than a year is almost always a bug.
 */
export const MAX_DELAY_SECONDS = 31536000;

/** Largest backoff table this tool will render, to keep output readable. */
export const MAX_BACKOFF_ATTEMPTS = 20;

/** Status codes on which Retry-After is meaningful, with what it signals. */
export const RETRY_AFTER_STATUSES = [
  {
    code: 429,
    label: "429 Too Many Requests",
    spec: "RFC 6585 section 4",
    guidance:
      "Rate limit hit. Send the number of seconds until the client's quota window refills. Pair it with your own rate-limit headers so the client can see the budget as well as the wait.",
  },
  {
    code: 503,
    label: "503 Service Unavailable",
    spec: "RFC 9110 section 15.6.4",
    guidance:
      "Overload or planned maintenance. Use delay-seconds for transient overload and an HTTP-date when you know the exact time the maintenance window ends.",
  },
  {
    code: 301,
    label: "301 Moved Permanently",
    spec: "RFC 9110 section 15.4.2",
    guidance:
      "Rarely useful. Retry-After on a redirect tells the client how long to wait before following the Location header.",
  },
  {
    code: 307,
    label: "307 Temporary Redirect",
    spec: "RFC 9110 section 15.4.8",
    guidance:
      "Used when traffic is being parked on a holding page and you want clients to pause before coming back.",
  },
  {
    code: 202,
    label: "202 Accepted",
    spec: "RFC 9110 section 15.3.3",
    guidance:
      "Not defined by the spec for 202, but widely used by long-running job APIs to pace polling of the status URL. Clients must be told to expect it.",
  },
];

const isInteger = (value) => Number.isFinite(value) && Math.floor(value) === value;

const pad2 = (value) => String(value).padStart(2, "0");

/**
 * asctime-date, RFC 9110 section 5.6.7 (accepted by recipients for legacy
 * reasons): `Sun Nov  6 08:49:37 1994`. Unlike IMF-fixdate and rfc850-date it
 * carries no "GMT"/offset marker at all, so it is always implicitly GMT — but
 * the native Date.parse has no way to know that and falls back to parsing it
 * in the host's local time zone. Matched and built with Date.UTC here so the
 * result does not drift with the visitor's own time zone.
 */
const ASCTIME_SHAPE_RE =
  /^[A-Za-z]{3} [A-Za-z]{3} {1,2}\d{1,2} \d{2}:\d{2}:\d{2} \d{4}$/;
const ASCTIME_RE =
  /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (?: ([1-9])|([0-2]\d|3[01])) (\d{2}):(\d{2}):(\d{2}) (\d{4})$/;

const IMF_FIXDATE_RE =
  /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat), (\d{2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d{2}):(\d{2}):(\d{2}) GMT$/;

const RFC850_DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const RFC850_DATE_RE =
  /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), (\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{2}) (\d{2}):(\d{2}):(\d{2}) GMT$/;

/**
 * Build a UTC instant only when every parsed HTTP-date field is semantically
 * valid. JavaScript's native Date parser silently rolls impossible dates such
 * as 31 February into March and accepts misspelled weekdays, so it cannot be
 * used as the validator for a protocol field.
 */
function buildHttpDate({ dayIndex, year, month, day, hour, minute, second }) {
  if (
    !Number.isInteger(dayIndex) ||
    dayIndex < 0 ||
    dayIndex > 6 ||
    !Number.isInteger(year) ||
    year < 1900 ||
    year > 9999 ||
    !Number.isInteger(month) ||
    month < 0 ||
    month > 11 ||
    !Number.isInteger(day) ||
    day < 1 ||
    day > 31 ||
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23 ||
    !Number.isInteger(minute) ||
    minute < 0 ||
    minute > 59 ||
    !Number.isInteger(second) ||
    second < 0 ||
    second > 60
  ) {
    return null;
  }

  // setUTCFullYear avoids Date.UTC's special 1900 offset for years 0000-0099.
  // Build with second 59 and add one second afterwards for the RFC's allowed
  // leap-second value, 60, because JavaScript Date has no leap-second field.
  const comparableSecond = Math.min(second, 59);
  const date = new Date(0);
  date.setUTCFullYear(year, month, day);
  date.setUTCHours(hour, minute, comparableSecond, 0);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month ||
    date.getUTCDate() !== day ||
    date.getUTCHours() !== hour ||
    date.getUTCMinutes() !== minute ||
    date.getUTCSeconds() !== comparableSecond ||
    date.getUTCDay() !== dayIndex
  ) {
    return null;
  }

  const epochMs = date.getTime() + (second === 60 ? 1000 : 0);
  return Number.isFinite(epochMs) ? epochMs : null;
}

function parseImfFixdate(text) {
  const match = IMF_FIXDATE_RE.exec(text);
  if (!match) return null;
  const [, dayName, dayText, monthName, yearText, hh, mm, ss] = match;
  return buildHttpDate({
    dayIndex: IMF_DAY_NAMES.indexOf(dayName),
    year: Number(yearText),
    month: IMF_MONTH_NAMES.indexOf(monthName),
    day: Number(dayText),
    hour: Number(hh),
    minute: Number(mm),
    second: Number(ss),
  });
}

function parseRfc850Date(text, nowMs) {
  const match = RFC850_DATE_RE.exec(text);
  if (!match) return null;
  const [, dayName, dayText, monthName, shortYearText, hh, mm, ss] = match;
  const currentYear = new Date(nowMs).getUTCFullYear();
  let year = Math.floor(currentYear / 100) * 100 + Number(shortYearText);
  // RFC 9110 section 5.6.7: an obsolete two-digit year that appears more than
  // 50 years in the future is interpreted as the most recent matching year in
  // the past.
  if (year > currentYear + 50) year -= 100;

  return buildHttpDate({
    dayIndex: RFC850_DAY_NAMES.indexOf(dayName),
    year,
    month: IMF_MONTH_NAMES.indexOf(monthName),
    day: Number(dayText),
    hour: Number(hh),
    minute: Number(mm),
    second: Number(ss),
  });
}

function parseAsctimeAsGmt(text) {
  if (!ASCTIME_SHAPE_RE.test(text)) return { matched: false, epochMs: null };
  const match = ASCTIME_RE.exec(text);
  if (!match) return { matched: true, epochMs: null };

  const [, dayName, monthName, oneDigitDay, twoDigitDay, hh, mm, ss, yearText] = match;
  const year = Number(yearText);
  const month = IMF_MONTH_NAMES.indexOf(monthName);
  const day = Number(oneDigitDay || twoDigitDay);
  const hour = Number(hh);
  const minute = Number(mm);
  const second = Number(ss);
  const epochMs = buildHttpDate({
    dayIndex: IMF_DAY_NAMES.indexOf(dayName),
    year,
    month,
    day,
    hour,
    minute,
    second,
  });
  return { matched: true, epochMs };
}

/**
 * Format an epoch-milliseconds instant as an IMF-fixdate string in GMT.
 * Built from fixed English tables rather than a locale so the output can never
 * drift with the host locale or time zone.
 *
 * @param {number} epochMs
 * @returns {string|null} the formatted date, or null when the instant is invalid
 */
export function formatImfFixdate(epochMs) {
  if (!Number.isFinite(epochMs)) return null;
  const date = new Date(epochMs);
  if (Number.isNaN(date.getTime())) return null;
  const day = IMF_DAY_NAMES[date.getUTCDay()];
  const month = IMF_MONTH_NAMES[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  // RFC 9110 applies RFC 5322 date semantics, whose year starts at 1900.
  if (year < 1900 || year > 9999) return null;
  return (
    `${day}, ${pad2(date.getUTCDate())} ${month} ${String(year).padStart(4, "0")} ` +
    `${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}:${pad2(date.getUTCSeconds())} GMT`
  );
}

/**
 * Convert a duration expressed in a unit into whole seconds, rounding UP so the
 * client never comes back earlier than intended.
 *
 * @param {number} amount
 * @param {"seconds"|"minutes"|"hours"|"days"} unit
 * @returns {number|null}
 */
export function toDelaySeconds(amount, unit) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return null;
  const multiplier = { seconds: 1, minutes: 60, hours: 3600, days: 86400 }[unit];
  if (!multiplier) return null;
  return Math.ceil(value * multiplier);
}

/**
 * Build the header for a fixed delay.
 *
 * @param {{ delaySeconds:number, nowMs:number }} input
 * @returns {object} result, or { error } for input that cannot produce a valid header
 */
export function buildFromDelay({ delaySeconds, nowMs } = {}) {
  const seconds = Number(delaySeconds);
  if (!Number.isFinite(seconds)) {
    return { error: "Enter the wait as a number of seconds." };
  }
  if (seconds < 0) {
    return {
      error:
        "delay-seconds is 1*DIGIT — a non-negative integer. A negative wait cannot be expressed; send 0 to mean retry immediately.",
    };
  }
  if (!isInteger(seconds)) {
    return {
      error:
        "delay-seconds must be a whole number. Round up so the client never returns before you are ready.",
    };
  }
  if (seconds > MAX_DELAY_SECONDS) {
    return {
      error: `A wait longer than ${MAX_DELAY_SECONDS} seconds (one year) is almost certainly a mistake, and many proxies clamp it anyway.`,
    };
  }
  const now = Number(nowMs);
  if (!Number.isFinite(now)) {
    return { error: "The reference time is not a valid instant." };
  }

  const targetMs = now + seconds * 1000;
  const dateValue = formatImfFixdate(targetMs);
  if (!dateValue) {
    return { error: "That wait pushes the retry time outside the range of an HTTP date." };
  }

  return {
    delaySeconds: seconds,
    dateValue,
    targetMs,
    secondsHeader: `Retry-After: ${seconds}`,
    dateHeader: `Retry-After: ${dateValue}`,
  };
}

/**
 * Build the header for an absolute target instant.
 *
 * @param {{ targetMs:number, nowMs:number }} input
 * @returns {object} result, or { error }
 */
export function buildFromTarget({ targetMs, nowMs } = {}) {
  const target = Number(targetMs);
  const now = Number(nowMs);
  if (!Number.isFinite(target)) {
    return { error: "Pick the date and time the client should come back." };
  }
  if (!Number.isFinite(now)) {
    return { error: "The reference time is not a valid instant." };
  }

  // Round up: a client that waits ceil(gap) is never early.
  const rawSeconds = (target - now) / 1000;
  const seconds = Math.max(0, Math.ceil(rawSeconds));
  if (seconds > MAX_DELAY_SECONDS) {
    return {
      error: `That instant is more than ${MAX_DELAY_SECONDS} seconds (one year) away — check the date you picked.`,
    };
  }

  const dateValue = formatImfFixdate(target);
  if (!dateValue) {
    return { error: "That instant is outside the range an HTTP date can express." };
  }

  return {
    delaySeconds: seconds,
    dateValue,
    targetMs: target,
    inPast: rawSeconds < 0,
    secondsHeader: `Retry-After: ${seconds}`,
    dateHeader: `Retry-After: ${dateValue}`,
  };
}

/**
 * Exponential backoff table. Pure: jitter is reported as the RANGE a client
 * would draw from rather than a sampled value.
 *
 * @param {{ baseSeconds:number, factor:number, attempts:number, maxSeconds:number,
 *          jitter:"none"|"full"|"equal" }} input
 * @returns {{ rows:Array, totalMin:number, totalMax:number }} or { error }
 */
export function backoffSchedule({
  baseSeconds = 1,
  factor = 2,
  attempts = 6,
  maxSeconds = 3600,
  jitter = "full",
} = {}) {
  const base = Number(baseSeconds);
  const growth = Number(factor);
  const count = Number(attempts);
  const cap = Number(maxSeconds);

  if (![base, growth, count, cap].every(Number.isFinite)) {
    return { error: "Enter valid numbers for the backoff settings." };
  }
  if (base <= 0) return { error: "The base delay must be greater than zero." };
  if (growth < 1) {
    return { error: "The multiplier must be at least 1 — anything less shrinks the wait each attempt." };
  }
  if (cap < base) return { error: "The cap must be at least as large as the base delay." };
  if (cap > MAX_DELAY_SECONDS) {
    return { error: `Keep the cap at or under ${MAX_DELAY_SECONDS} seconds (one year).` };
  }
  if (!isInteger(count) || count < 1 || count > MAX_BACKOFF_ATTEMPTS) {
    return { error: `Choose between 1 and ${MAX_BACKOFF_ATTEMPTS} attempts.` };
  }
  if (!["none", "full", "equal"].includes(jitter)) {
    return { error: "Choose a jitter strategy: none, full or equal." };
  }

  const rows = [];
  let totalMin = 0;
  let totalMax = 0;

  for (let attempt = 1; attempt <= count; attempt += 1) {
    const uncapped = base * Math.pow(growth, attempt - 1);
    // Guard the overflow that a large factor and attempt count can produce.
    const capped = Number.isFinite(uncapped) ? Math.min(uncapped, cap) : cap;

    // A Retry-After value must be a whole number, so this is what you would send.
    const headerSeconds = Math.ceil(capped);

    // With no jitter there is no range to draw from — the client waits exactly
    // the whole-second value that goes in the header, so these columns must
    // report that (not the raw, un-rounded `capped` delay) or they contradict
    // the Retry-After value shown in the same row.
    let low = headerSeconds;
    let high = headerSeconds;
    if (jitter === "full") {
      low = 0;
      high = capped;
    } else if (jitter === "equal") {
      low = capped / 2;
      high = capped;
    }

    totalMin += low;
    totalMax += high;

    rows.push({
      attempt,
      uncappedSeconds: Number.isFinite(uncapped) ? uncapped : Infinity,
      cappedSeconds: capped,
      wasCapped: !Number.isFinite(uncapped) || uncapped > cap,
      jitterLow: low,
      jitterHigh: high,
      headerSeconds,
      headerLine: `Retry-After: ${headerSeconds}`,
      cumulativeMin: totalMin,
      cumulativeMax: totalMax,
    });
  }

  return { rows, totalMin, totalMax };
}

/**
 * Parse a Retry-After value the way a conforming client would, so you can check a
 * value you already have.
 *
 * @param {string} raw the field value, without the field name
 * @param {number} nowMs reference instant used to turn a date into a wait
 * @returns {{ kind:"seconds"|"date", seconds:number, targetMs:number, normalised:string }|{ error:string }}
 */
export function parseRetryAfter(raw, nowMs) {
  const text = String(raw ?? "").trim();
  const now = Number(nowMs);
  if (!text) return { error: "Nothing to parse — paste a Retry-After value." };
  if (!Number.isFinite(now)) return { error: "The reference time is not a valid instant." };

  // delay-seconds is 1*DIGIT: digits only, nothing else.
  if (/^\d+$/.test(text)) {
    const seconds = Number(text);
    if (!Number.isFinite(seconds)) {
      return { error: "That number is too large to be a usable delay." };
    }
    return {
      kind: "seconds",
      seconds,
      targetMs: now + seconds * 1000,
      normalised: String(seconds),
    };
  }

  if (/^[+-]?\d*\.?\d+\s*[a-zA-Z]*$/.test(text)) {
    return {
      error:
        "Not a valid delay-seconds value. The grammar is 1*DIGIT — digits only, so no sign, no decimal point and no unit suffix such as \"s\" or \"ms\".",
    };
  }

  const asctime = parseAsctimeAsGmt(text);
  const parsed = asctime.matched
    ? asctime.epochMs
    : (parseImfFixdate(text) ?? parseRfc850Date(text, now));
  if (!Number.isFinite(parsed)) {
    return {
      error:
        "Neither a run of digits nor a date any client could parse. Send whole seconds, or an IMF-fixdate such as Sun, 06 Nov 1994 08:49:37 GMT.",
    };
  }

  const normalised = formatImfFixdate(parsed);
  const seconds = Math.max(0, Math.ceil((parsed - now) / 1000));
  return {
    kind: "date",
    seconds,
    targetMs: parsed,
    normalised: normalised ?? text,
    isImfFixdate: normalised === text,
    note:
      normalised === text
        ? "Valid IMF-fixdate."
        : `Parseable, but not the required IMF-fixdate form. Send "${normalised}" instead — RFC 9110 section 5.6.7 allows recipients to accept other forms but requires senders to generate IMF-fixdate.`,
  };
}

export default buildFromDelay;
