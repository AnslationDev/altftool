/**
 * POSIX/Vixie cron expression parser and explainer.
 *
 * Grammar implemented (per crontab(5)):
 *   minute (0-59)  hour (0-23)  day-of-month (1-31)  month (1-12 or JAN-DEC)
 *   day-of-week (0-7 or SUN-SAT, where both 0 and 7 mean Sunday)
 * Each field accepts: "*", value, range a-b, step "*"/n or a-b/n, and
 * comma-separated lists. Vixie cron's special day rule is honoured: when
 * BOTH day-of-month and day-of-week are restricted, a day matches if
 * EITHER field matches (crontab(5): "the command will be run when either
 * field matches the current time").
 */

/** Field definitions in order — bounds straight from crontab(5). */
export const FIELD_DEFS = [
  { name: "minute", min: 0, max: 59 },
  { name: "hour", min: 0, max: 23 },
  { name: "day-of-month", min: 1, max: 31 },
  { name: "month", min: 1, max: 12 },
  { name: "day-of-week", min: 0, max: 6 },
];

/** Standard @-macros from crontab(5). */
export const MACROS = {
  "@yearly": "0 0 1 1 *",
  "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *",
  "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *",
};

const MONTH_NAMES = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];
const DOW_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW_FULL = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

/** How far ahead to search for occurrences before declaring the schedule unreachable. */
const MAX_SEARCH_DAYS = 1500; // > 4 years covers 29 February schedules

const resolveToken = (token, fieldIndex) => {
  const upper = token.toUpperCase();
  if (fieldIndex === 3) {
    const nameIdx = MONTH_NAMES.indexOf(upper);
    if (nameIdx !== -1) return nameIdx + 1;
  }
  if (fieldIndex === 4) {
    const nameIdx = DOW_NAMES.indexOf(upper);
    if (nameIdx !== -1) return nameIdx;
  }
  if (!/^\d+$/.test(token)) return null;
  let value = Number(token);
  if (fieldIndex === 4 && value === 7) value = 0; // 7 == Sunday == 0
  return value;
};

function parseField(raw, fieldIndex) {
  const def = FIELD_DEFS[fieldIndex];
  const values = new Set();
  const parts = raw.split(",");
  if (parts.some((p) => p === "")) {
    return { error: `Empty list item in the ${def.name} field.` };
  }
  for (const part of parts) {
    const stepMatch = part.match(/^(.+?)(?:\/(\d+))?$/);
    const base = stepMatch[1];
    const step = stepMatch[2] === undefined ? 1 : Number(stepMatch[2]);
    if (!Number.isInteger(step) || step < 1) {
      return { error: `Step in "${part}" must be a whole number of at least 1 (${def.name} field).` };
    }
    let lo;
    let hi;
    if (base === "*") {
      lo = def.min;
      hi = def.max;
    } else if (base.includes("-")) {
      const [a, b] = base.split("-");
      lo = resolveToken(a, fieldIndex);
      hi = resolveToken(b, fieldIndex);
      if (lo === null || hi === null) {
        return { error: `"${base}" is not a valid range for the ${def.name} field.` };
      }
      if (lo > hi) {
        return { error: `Range "${base}" is reversed — the ${def.name} field needs low-high.` };
      }
    } else {
      lo = resolveToken(base, fieldIndex);
      if (lo === null) {
        return { error: `"${base}" is not a valid value for the ${def.name} field.` };
      }
      // Vixie cron: "a/step" means "a through max, every step".
      hi = stepMatch[2] === undefined ? lo : def.max;
    }
    if (lo < def.min || hi > def.max) {
      return {
        error: `The ${def.name} field allows ${def.min}-${def.max}; "${part}" is out of range.`,
      };
    }
    for (let v = lo; v <= hi; v += step) values.add(v);
  }
  const full = values.size === def.max - def.min + 1;
  return { values, full, raw };
}

const label = (fieldIndex, value) => {
  if (fieldIndex === 3) return MONTH_FULL[value - 1];
  if (fieldIndex === 4) return DOW_FULL[value];
  return String(value);
};

function describeField(parsed, fieldIndex) {
  const def = FIELD_DEFS[fieldIndex];
  if (parsed.full) return `every ${def.name}`;
  const sorted = [...parsed.values].sort((a, b) => a - b);
  const shown = sorted.slice(0, 12).map((v) => label(fieldIndex, v));
  const suffix = sorted.length > 12 ? `, … (${sorted.length} values)` : "";
  return `${def.name} ${shown.join(", ")}${suffix}`;
}

function humanSentence(fields) {
  const [minute, hour, dom, month, dow] = fields;
  const list = (parsed, idx) =>
    [...parsed.values].sort((a, b) => a - b).map((v) => label(idx, v)).join(", ");

  let time;
  if (!minute.full && !hour.full && minute.values.size === 1 && hour.values.size === 1) {
    const h = [...hour.values][0];
    const m = [...minute.values][0];
    time = `at ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  } else {
    const minutePart = minute.full
      ? "every minute"
      : minute.values.size === 1
        ? `at minute ${list(minute, 0)}`
        : `at minutes ${list(minute, 0)}`;
    const hourPart = hour.full
      ? ""
      : hour.values.size === 1
        ? ` past hour ${list(hour, 1)}`
        : ` past hours ${list(hour, 1)}`;
    time = `${minutePart}${hourPart}`;
  }

  const domRestricted = !dom.full;
  const dowRestricted = !dow.full;
  let dayPart = "";
  if (domRestricted && dowRestricted) {
    dayPart = ` on day ${list(dom, 2)} of the month or on ${list(dow, 4)}`;
  } else if (domRestricted) {
    dayPart = ` on day ${list(dom, 2)} of the month`;
  } else if (dowRestricted) {
    dayPart = ` on ${list(dow, 4)}`;
  }

  const monthPart = month.full ? "" : ` in ${list(month, 3)}`;
  return `Runs ${time}${dayPart}${monthPart}.`;
}

/**
 * Parse a cron expression.
 *
 * @param {string} expression Five space-separated fields or an @macro.
 * @returns {object} { fields, sentence, breakdown, macroExpansion } or { error }.
 */
export function parseCron(expression) {
  const trimmed = String(expression ?? "").trim().replace(/\s+/g, " ");
  if (trimmed === "") return { error: "Enter a cron expression." };

  const lower = trimmed.toLowerCase();
  if (lower === "@reboot") {
    return {
      error:
        "@reboot runs once at daemon startup — it has no calendar schedule to explain or predict.",
    };
  }
  const source = MACROS[lower] ?? trimmed;
  const macroExpansion = MACROS[lower] ? `${lower} expands to "${MACROS[lower]}"` : null;

  const parts = source.split(" ");
  if (parts.length !== 5) {
    return {
      error: `Expected 5 fields (minute hour day-of-month month day-of-week) but got ${parts.length}.`,
    };
  }

  const fields = [];
  for (let i = 0; i < 5; i += 1) {
    const parsed = parseField(parts[i], i);
    if (parsed.error) return { error: parsed.error };
    fields.push(parsed);
  }

  const breakdown = fields.map((parsed, i) => ({
    field: FIELD_DEFS[i].name,
    raw: parts[i],
    allowed: `${FIELD_DEFS[i].min}-${FIELD_DEFS[i].max}`,
    meaning: describeField(parsed, i),
    count: parsed.values.size,
  }));

  return {
    fields,
    sentence: humanSentence(fields),
    breakdown,
    macroExpansion,
    normalized: source,
  };
}

/**
 * Compute the next occurrences of a parsed cron schedule, in UTC.
 *
 * @param {object} parsed  Result of parseCron (must not be an error).
 * @param {string} fromIso Start instant "yyyy-mm-ddThh:mm" treated as UTC.
 * @param {number} count   How many occurrences to return (1-20).
 * @returns {string[] | {error: string}} ISO "yyyy-mm-dd hh:mm UTC" strings.
 */
export function nextOccurrences(parsed, fromIso, count = 5) {
  if (!parsed || parsed.error || !parsed.fields) return { error: "Parse the expression first." };
  const n = Number(count);
  if (!Number.isInteger(n) || n < 1 || n > 20) {
    return { error: "Occurrence count must be between 1 and 20." };
  }
  const match = String(fromIso ?? "").match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!match) return { error: "Enter the start time as yyyy-mm-ddThh:mm." };
  const [, y, mo, d, h, mi] = match.map(Number);
  const start = new Date(Date.UTC(y, mo - 1, d, h, mi));
  if (Number.isNaN(start.getTime()) || start.getUTCMonth() !== mo - 1 || start.getUTCDate() !== d) {
    return { error: "That start date does not exist on the calendar." };
  }

  const [minuteF, hourF, domF, monthF, dowF] = parsed.fields;
  const minutes = [...minuteF.values].sort((a, b) => a - b);
  const hours = [...hourF.values].sort((a, b) => a - b);
  const domRestricted = !domF.full;
  const dowRestricted = !dowF.full;

  const dayMatches = (date) => {
    if (!monthF.values.has(date.getUTCMonth() + 1)) return false;
    const domOk = domF.values.has(date.getUTCDate());
    const dowOk = dowF.values.has(date.getUTCDay());
    if (domRestricted && dowRestricted) return domOk || dowOk; // Vixie OR rule
    if (domRestricted) return domOk;
    if (dowRestricted) return dowOk;
    return true;
  };

  const results = [];
  // First candidate is the minute after the start instant.
  const first = new Date(start.getTime() + 60000);
  for (let dayOffset = 0; dayOffset < MAX_SEARCH_DAYS; dayOffset += 1) {
    const day = new Date(
      Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), first.getUTCDate() + dayOffset),
    );
    if (!dayMatches(day)) continue;
    for (const hh of hours) {
      for (const mm of minutes) {
        const candidate = new Date(day.getTime() + (hh * 60 + mm) * 60000);
        if (candidate.getTime() < first.getTime()) continue;
        results.push(
          `${candidate.toISOString().slice(0, 10)} ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")} UTC`,
        );
        if (results.length === n) return results;
      }
    }
  }
  return { error: "No occurrence found within the next 4 years — check the day/month combination." };
}
