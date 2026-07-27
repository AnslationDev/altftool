/**
 * Crontab evaluator — pure logic for standard five-field cron expressions.
 *
 * Syntax follows Vixie cron / crontab(5), which is what cron, cronie and most
 * schedulers implement:
 *
 *   ┌───── minute        0-59
 *   │ ┌─── hour          0-23
 *   │ │ ┌─ day of month  1-31
 *   │ │ │ ┌ month        1-12 or JAN-DEC
 *   │ │ │ │ ┌ day of week 0-7 or SUN-SAT (0 and 7 are both Sunday)
 *   * * * * *
 *
 * All arithmetic is wall-clock: the caller passes a local "YYYY-MM-DDTHH:mm"
 * string and gets wall-clock results back. That matches cron itself, which
 * schedules against the machine's local clock. No Date.now() is used here.
 */

/* ------------------------------------------------------------------ */
/* Field definitions                                                   */
/* ------------------------------------------------------------------ */

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

/** Three-letter aliases accepted in the month field (crontab(5)). */
export const MONTH_ALIASES = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
};

/** Three-letter aliases accepted in the day-of-week field (crontab(5)). */
export const DAY_ALIASES = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

/**
 * Field order and legal ranges. Day-of-week allows 7 as a second spelling of
 * Sunday, which is normalised to 0 after parsing.
 */
export const CRON_FIELDS = [
  { key: "minute", label: "Minute", min: 0, max: 59, aliases: null },
  { key: "hour", label: "Hour", min: 0, max: 23, aliases: null },
  { key: "dayOfMonth", label: "Day of month", min: 1, max: 31, aliases: null },
  { key: "month", label: "Month", min: 1, max: 12, aliases: MONTH_ALIASES },
  { key: "dayOfWeek", label: "Day of week", min: 0, max: 7, aliases: DAY_ALIASES },
];

/** Non-standard but universally supported shorthand macros. */
export const CRON_MACROS = {
  "@yearly": "0 0 1 1 *",
  "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *",
  "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *",
};

/** How many results the evaluator will produce in one call. */
export const MIN_OCCURRENCES = 1;
export const MAX_OCCURRENCES = 50;
export const DEFAULT_OCCURRENCES = 8;

/**
 * Upper bound on the forward day-by-day scan. "0 0 29 2 1" (29 February that
 * is also a Monday) can be up to 28 years away, so 40 years is a safe ceiling
 * while still terminating quickly.
 */
export const MAX_SCAN_DAYS = 365 * 40;

const MS_PER_MINUTE = 60000;
const MS_PER_DAY = 86400000;

const DATETIME_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

/* ------------------------------------------------------------------ */
/* Parsing                                                             */
/* ------------------------------------------------------------------ */

function parseAtom(atom, field) {
  const text = atom.trim();
  if (!text) return { error: `${field.label}: empty value in the list.` };

  let rangePart = text;
  let step = 1;

  const slash = text.indexOf("/");
  if (slash !== -1) {
    rangePart = text.slice(0, slash);
    const stepText = text.slice(slash + 1);
    if (!/^\d+$/.test(stepText)) {
      return { error: `${field.label}: step after "/" must be a whole number.` };
    }
    step = Number(stepText);
    if (step < 1) return { error: `${field.label}: step must be 1 or more.` };
  }

  const resolve = (token) => {
    const upper = token.trim().toUpperCase();
    if (field.aliases && Object.prototype.hasOwnProperty.call(field.aliases, upper)) {
      return field.aliases[upper];
    }
    if (!/^\d+$/.test(upper)) return null;
    return Number(upper);
  };

  let from;
  let to;
  if (rangePart === "*") {
    from = field.min;
    to = field.max;
  } else if (rangePart.includes("-")) {
    const [a, b] = rangePart.split("-");
    from = resolve(a);
    to = resolve(b);
    if (from === null || to === null) {
      return { error: `${field.label}: "${rangePart}" is not a valid range.` };
    }
    if (from > to) {
      return { error: `${field.label}: range "${rangePart}" runs backwards.` };
    }
  } else {
    from = resolve(rangePart);
    if (from === null) return { error: `${field.label}: "${rangePart}" is not a valid value.` };
    // "5/15" means "from 5 to the field maximum, every 15".
    to = slash === -1 ? from : field.max;
  }

  if (from < field.min || to > field.max) {
    return { error: `${field.label}: values must be between ${field.min} and ${field.max}.` };
  }

  const values = [];
  for (let value = from; value <= to; value += step) values.push(value);
  return { values };
}

function parseField(text, field) {
  const raw = String(text == null ? "" : text).trim();
  if (!raw) return { error: `${field.label}: this field is empty.` };
  const collected = new Set();
  for (const atom of raw.split(",")) {
    const parsed = parseAtom(atom, field);
    if (parsed.error) return parsed;
    for (const value of parsed.values) collected.add(value);
  }
  return { values: [...collected].sort((a, b) => a - b), wildcard: raw === "*" };
}

/**
 * Parse a five-field cron expression (or a macro) into value sets.
 * Returns { error } for anything cron would reject.
 */
export function parseCron(expression) {
  const raw = String(expression == null ? "" : expression).trim();
  if (!raw) return { error: "Enter a cron expression, for example 30 9 * * 1-5." };

  const macroKey = raw.toLowerCase();
  const expanded = Object.prototype.hasOwnProperty.call(CRON_MACROS, macroKey)
    ? CRON_MACROS[macroKey]
    : raw;

  if (expanded.startsWith("@")) {
    return {
      error: `"${raw}" is not a known macro. Supported: ${Object.keys(CRON_MACROS).join(", ")}.`,
    };
  }

  const parts = expanded.split(/\s+/);
  if (parts.length !== CRON_FIELDS.length) {
    return {
      error: `A cron expression needs exactly 5 fields separated by spaces — this has ${parts.length}.`,
    };
  }

  const fields = {};
  const wildcards = {};
  for (let index = 0; index < CRON_FIELDS.length; index += 1) {
    const field = CRON_FIELDS[index];
    const parsed = parseField(parts[index], field);
    if (parsed.error) return { error: parsed.error };
    fields[field.key] = parsed.values;
    wildcards[field.key] = parsed.wildcard;
  }

  // 7 and 0 are both Sunday in crontab(5); collapse them.
  fields.dayOfWeek = [...new Set(fields.dayOfWeek.map((d) => (d === 7 ? 0 : d)))].sort(
    (a, b) => a - b,
  );

  return {
    expression: expanded,
    original: raw,
    macro: expanded !== raw ? macroKey : null,
    fields,
    wildcards,
    // Vixie cron: when BOTH day fields are restricted, a day matches if EITHER
    // matches. When only one is restricted, only that one is consulted.
    domRestricted: !wildcards.dayOfMonth,
    dowRestricted: !wildcards.dayOfWeek,
  };
}

/* ------------------------------------------------------------------ */
/* Human description                                                   */
/* ------------------------------------------------------------------ */

function listPhrase(values, mapper) {
  const items = values.map(mapper);
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

const pad2 = (value) => String(value).padStart(2, "0");

/** Plain-English summary of a parsed cron expression. */
export function describeCron(parsed) {
  if (!parsed || parsed.error) return "";
  const { fields, wildcards } = parsed;

  let time;
  if (wildcards.minute && wildcards.hour) {
    time = "Every minute";
  } else if (wildcards.hour) {
    time = `At minute ${listPhrase(fields.minute, String)} of every hour`;
  } else if (wildcards.minute) {
    time = `Every minute during hour ${listPhrase(fields.hour, String)}`;
  } else if (fields.minute.length * fields.hour.length <= 24) {
    const stamps = [];
    for (const hour of fields.hour) {
      for (const minute of fields.minute) stamps.push(`${pad2(hour)}:${pad2(minute)}`);
    }
    time = `At ${listPhrase(stamps.sort(), String)}`;
  } else {
    time = `At minute ${listPhrase(fields.minute, String)} past hour ${listPhrase(fields.hour, String)}`;
  }

  const dayParts = [];
  if (parsed.domRestricted) {
    dayParts.push(`on day ${listPhrase(fields.dayOfMonth, String)} of the month`);
  }
  if (parsed.dowRestricted) {
    dayParts.push(`on ${listPhrase(fields.dayOfWeek, (d) => DAY_NAMES[d])}`);
  }
  let days = "";
  if (dayParts.length === 2) days = ` ${dayParts[0]} or ${dayParts[1]}`;
  else if (dayParts.length === 1) days = ` ${dayParts[0]}`;

  const months = wildcards.month
    ? ""
    : ` in ${listPhrase(fields.month, (m) => MONTH_NAMES[m - 1])}`;

  return `${time}${days}${months}.`;
}

/* ------------------------------------------------------------------ */
/* Occurrence calculation                                              */
/* ------------------------------------------------------------------ */

function dayMatches(parsed, date) {
  const { fields } = parsed;
  if (!fields.month.includes(date.getUTCMonth() + 1)) return false;

  const domHit = fields.dayOfMonth.includes(date.getUTCDate());
  const dowHit = fields.dayOfWeek.includes(date.getUTCDay());

  if (parsed.domRestricted && parsed.dowRestricted) return domHit || dowHit;
  if (parsed.domRestricted) return domHit;
  if (parsed.dowRestricted) return dowHit;
  return true;
}

/** Does a given wall-clock "YYYY-MM-DDTHH:mm" moment match the expression? */
export function matchesMoment(expression, isoMinute) {
  const parsed = parseCron(expression);
  if (parsed.error) return { error: parsed.error };
  const match = DATETIME_RE.exec(String(isoMinute == null ? "" : isoMinute).trim());
  if (!match) return { error: "Reference time must look like 2026-07-27T09:30." };
  const [, y, mo, d, h, mi] = match.map(Number);
  const date = new Date(Date.UTC(y, mo - 1, d, h, mi));
  if (Number.isNaN(date.getTime())) return { error: "That reference time is not a real date." };
  return {
    matches:
      dayMatches(parsed, date) &&
      parsed.fields.hour.includes(h) &&
      parsed.fields.minute.includes(mi),
  };
}

function formatMoment(date) {
  const y = date.getUTCFullYear();
  const mo = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const h = date.getUTCHours();
  const mi = date.getUTCMinutes();
  return {
    iso: `${y}-${pad2(mo)}-${pad2(d)}T${pad2(h)}:${pad2(mi)}`,
    date: `${pad2(d)} ${MONTH_NAMES[mo - 1].slice(0, 3)} ${y}`,
    time: `${pad2(h)}:${pad2(mi)}`,
    weekday: DAY_NAMES[date.getUTCDay()],
    timestamp: date.getTime(),
  };
}

/** Round a millisecond gap into a readable "2h 30m" style string. */
export function formatGap(milliseconds) {
  const totalMinutes = Math.round(milliseconds / MS_PER_MINUTE);
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "—";
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes || parts.length === 0) parts.push(`${minutes}m`);
  return parts.join(" ");
}

/**
 * The next `count` wall-clock run times strictly after `fromIso`.
 *
 * @param {string} expression five-field cron expression or a macro
 * @param {string} fromIso    "YYYY-MM-DDTHH:mm" reference moment
 * @param {number} count      how many occurrences to return
 */
export function nextRuns(expression, fromIso, count = DEFAULT_OCCURRENCES) {
  const parsed = parseCron(expression);
  if (parsed.error) return { error: parsed.error };

  const wanted = Math.trunc(Number(count));
  if (!Number.isFinite(wanted) || wanted < MIN_OCCURRENCES || wanted > MAX_OCCURRENCES) {
    return { error: `Ask for between ${MIN_OCCURRENCES} and ${MAX_OCCURRENCES} occurrences.` };
  }

  const match = DATETIME_RE.exec(String(fromIso == null ? "" : fromIso).trim());
  if (!match) return { error: "Reference time must look like 2026-07-27T09:30." };
  const [, year, month, day, hour, minute] = match.map(Number);
  const startMs = Date.UTC(year, month - 1, day, hour, minute);
  if (Number.isNaN(startMs)) return { error: "That reference time is not a real date." };
  // Cron never fires on the reference minute itself; the first candidate is
  // the following minute.
  const afterMs = startMs + MS_PER_MINUTE;

  const runs = [];
  const dayZero = Date.UTC(year, month - 1, day);
  for (let offset = 0; offset < MAX_SCAN_DAYS && runs.length < wanted; offset += 1) {
    const dayStart = new Date(dayZero + offset * MS_PER_DAY);
    if (!dayMatches(parsed, dayStart)) continue;
    const y = dayStart.getUTCFullYear();
    const mo = dayStart.getUTCMonth();
    const d = dayStart.getUTCDate();
    for (const h of parsed.fields.hour) {
      for (const mi of parsed.fields.minute) {
        const ms = Date.UTC(y, mo, d, h, mi);
        if (ms < afterMs) continue;
        runs.push(formatMoment(new Date(ms)));
        if (runs.length >= wanted) break;
      }
      if (runs.length >= wanted) break;
    }
  }

  if (runs.length === 0) {
    return {
      error:
        "This expression never fires — check the day-of-month and month combination, for example 31 February.",
    };
  }

  const gaps = runs.slice(1).map((run, index) => run.timestamp - runs[index].timestamp);
  const shortestGap = gaps.length ? Math.min(...gaps) : null;

  return {
    expression: parsed.expression,
    macro: parsed.macro,
    description: describeCron(parsed),
    fields: parsed.fields,
    runs,
    truncated: runs.length < wanted,
    nextRun: runs[0],
    waitToNext: formatGap(runs[0].timestamp - startMs),
    shortestGap: shortestGap === null ? "—" : formatGap(shortestGap),
    runsPerDay:
      parsed.wildcards.dayOfMonth && parsed.wildcards.dayOfWeek && parsed.wildcards.month
        ? parsed.fields.hour.length * parsed.fields.minute.length
        : null,
  };
}
