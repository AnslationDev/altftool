/**
 * Crontab expression parsing, description, next-run projection and line building.
 *
 * Field ranges and syntax follow the Vixie/ISC cron manual (`man 5 crontab`)
 * as shipped on Debian, Ubuntu and RHEL:
 *   minute 0-59, hour 0-23, day-of-month 1-31, month 1-12 or JAN-DEC,
 *   day-of-week 0-7 or SUN-SAT where both 0 and 7 mean Sunday.
 * Lists (a,b), ranges (a-b), and steps (a-b/n, or the star form "star/n") are supported.
 *
 * The one rule everybody trips on: when BOTH day-of-month and day-of-week are
 * restricted, cron runs the job when EITHER field matches, not both.
 *
 * Pure module — every function that needs "now" takes the date as an argument.
 */

export const FIELD_SPECS = [
  { key: "minute", label: "Minute", min: 0, max: 59, names: null },
  { key: "hour", label: "Hour", min: 0, max: 23, names: null },
  { key: "dom", label: "Day of month", min: 1, max: 31, names: null },
  {
    key: "month",
    label: "Month",
    min: 1,
    max: 12,
    names: { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 },
  },
  {
    key: "dow",
    label: "Day of week",
    min: 0,
    max: 7,
    names: { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 },
  },
];

export const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const DOW_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Nickname schedules understood by Vixie cron. */
export const SPECIALS = [
  { id: "@reboot", equivalent: null, label: "@reboot — once at every system start" },
  { id: "@yearly", equivalent: "0 0 1 1 *", label: "@yearly — midnight on 1 January" },
  { id: "@monthly", equivalent: "0 0 1 * *", label: "@monthly — midnight on the 1st" },
  { id: "@weekly", equivalent: "0 0 * * 0", label: "@weekly — midnight on Sunday" },
  { id: "@daily", equivalent: "0 0 * * *", label: "@daily — every midnight" },
  { id: "@hourly", equivalent: "0 * * * *", label: "@hourly — on the hour" },
];

/** Ready-made expressions people ask for most often. */
export const PRESETS = [
  { label: "Every 5 minutes", expression: "*/5 * * * *" },
  { label: "Every 15 minutes", expression: "*/15 * * * *" },
  { label: "Hourly at :00", expression: "0 * * * *" },
  { label: "Daily 02:30", expression: "30 2 * * *" },
  { label: "Weekdays 09:00", expression: "0 9 * * 1-5" },
  { label: "Sundays 04:00", expression: "0 4 * * 0" },
  { label: "1st of month 00:15", expression: "15 0 1 * *" },
  { label: "Twice daily 06 & 18", expression: "0 6,18 * * *" },
];

/** cron only ever inherits this PATH unless the crontab sets one. */
export const CRON_DEFAULT_PATH = "/usr/bin:/bin";
/** How far ahead nextRuns will search before giving up, in days. */
export const SEARCH_HORIZON_DAYS = 1500;

const SAFE_ARG = /^[A-Za-z0-9_@%+=:,./-]+$/;

export function shellQuote(value) {
  const raw = String(value ?? "").trim();
  if (raw === "") return "''";
  if (SAFE_ARG.test(raw)) return raw;
  return `'${raw.replace(/'/g, `'\\''`)}'`;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

/**
 * Parse one crontab field into the sorted list of values it matches.
 * @returns {{ok:true, values:number[], wildcard:boolean, step:number|null}}
 *          | {ok:false, message:string}
 */
export function parseCronField(text, specIndex) {
  const spec = FIELD_SPECS[specIndex];
  if (!spec) return { ok: false, message: "Unknown cron field." };
  const raw = String(text ?? "").trim();
  if (raw === "") return { ok: false, message: `${spec.label} is empty.` };

  const readValue = (token) => {
    const lower = token.toLowerCase();
    if (spec.names && Object.prototype.hasOwnProperty.call(spec.names, lower.slice(0, 3)) && !/^\d+$/.test(lower)) {
      return spec.names[lower.slice(0, 3)];
    }
    if (!/^\d+$/.test(token)) return null;
    return Number(token);
  };

  const values = new Set();
  let wildcard = false;
  let step = null;

  for (const chunk of raw.split(",")) {
    const piece = chunk.trim();
    if (piece === "") return { ok: false, message: `${spec.label} has an empty item in its list.` };

    let base = piece;
    let stride = 1;
    if (piece.includes("/")) {
      const [basePart, stridePart, ...rest] = piece.split("/");
      if (rest.length > 0) return { ok: false, message: `${spec.label}: only one / is allowed per item.` };
      if (!/^\d+$/.test(stridePart)) return { ok: false, message: `${spec.label}: the step after / must be a number.` };
      stride = Number(stridePart);
      if (stride < 1) return { ok: false, message: `${spec.label}: a step of 0 matches nothing.` };
      if (stride > spec.max - spec.min + 1) {
        return { ok: false, message: `${spec.label}: a step of ${stride} is larger than the whole field.` };
      }
      base = basePart;
      step = stride;
    }

    let low;
    let high;
    if (base === "*") {
      low = spec.min;
      high = spec.max;
      if (stride === 1) wildcard = true;
    } else if (base.includes("-")) {
      const [lowPart, highPart, ...rest] = base.split("-");
      if (rest.length > 0) return { ok: false, message: `${spec.label}: only one - is allowed per range.` };
      low = readValue(lowPart);
      high = readValue(highPart);
      if (low === null || high === null) return { ok: false, message: `${spec.label}: "${base}" is not a valid range.` };
      if (low > high) return { ok: false, message: `${spec.label}: range ${base} runs backwards.` };
    } else {
      low = readValue(base);
      if (low === null) return { ok: false, message: `${spec.label}: "${base}" is not a number or a recognised name.` };
      high = stride > 1 ? spec.max : low;
    }

    if (low < spec.min || high > spec.max) {
      return { ok: false, message: `${spec.label} must be between ${spec.min} and ${spec.max}.` };
    }
    for (let value = low; value <= high; value += stride) values.add(value);
  }

  let list = [...values].sort((a, b) => a - b);
  if (spec.key === "dow") {
    // 7 and 0 both mean Sunday; normalise so matching is simple.
    list = [...new Set(list.map((value) => (value === 7 ? 0 : value)))].sort((a, b) => a - b);
  }
  if (list.length === 0) return { ok: false, message: `${spec.label} matches no values.` };

  return { ok: true, values: list, wildcard, step };
}

/**
 * Parse a full five-field expression, or one of the @nickname forms.
 * @returns {{ok:true, fields:object, expression:string, special:string|null}}
 *          | {ok:false, message:string}
 */
export function parseCronExpression(expression) {
  const raw = String(expression ?? "").trim().replace(/\s+/g, " ");
  if (!raw) return { ok: false, message: "Enter a schedule such as 30 2 * * *." };

  if (raw.startsWith("@")) {
    const special = SPECIALS.find((item) => item.id === raw.toLowerCase());
    if (!special) {
      return { ok: false, message: `Unknown nickname ${raw}. Valid ones are ${SPECIALS.map((s) => s.id).join(", ")}.` };
    }
    if (!special.equivalent) {
      return { ok: true, fields: null, expression: special.id, special: special.id };
    }
    const parsed = parseCronExpression(special.equivalent);
    return parsed.ok ? { ...parsed, expression: special.id, special: special.id } : parsed;
  }

  const tokens = raw.split(" ");
  if (tokens.length !== 5) {
    return {
      ok: false,
      message: `A crontab schedule has exactly 5 fields (minute hour day month weekday); you gave ${tokens.length}.`,
    };
  }

  const fields = {};
  for (let index = 0; index < 5; index += 1) {
    const parsed = parseCronField(tokens[index], index);
    if (!parsed.ok) return parsed;
    fields[FIELD_SPECS[index].key] = parsed;
  }
  return { ok: true, fields, expression: raw, special: null };
}

/** Human-readable summary of a parsed expression. */
export function describeSchedule(parsed) {
  if (!parsed || !parsed.ok) return "";
  if (!parsed.fields) return "Once each time the machine boots.";

  const { minute, hour, dom, month, dow } = parsed.fields;
  let timePart;
  if (minute.wildcard && hour.wildcard) {
    timePart = "Every minute";
  } else if (minute.step && minute.values.length > 1 && hour.wildcard) {
    timePart = `Every ${minute.step} minutes`;
  } else if (minute.values.length === 1 && hour.wildcard) {
    timePart = `At minute ${minute.values[0]} of every hour`;
  } else if (minute.values.length === 1 && hour.values.length <= 4) {
    timePart = `At ${hour.values.map((h) => `${pad(h)}:${pad(minute.values[0])}`).join(", ")}`;
  } else {
    timePart = `At minute ${minute.values.join(",")} past hour ${hour.values.join(",")}`;
  }

  let dayPart;
  if (dom.wildcard && dow.wildcard) {
    dayPart = "every day";
  } else if (!dom.wildcard && dow.wildcard) {
    dayPart = `on day ${dom.values.join(", ")} of the month`;
  } else if (dom.wildcard && !dow.wildcard) {
    dayPart = `on ${dow.values.map((d) => DOW_LABELS[d]).join(", ")}`;
  } else {
    dayPart = `on day ${dom.values.join(", ")} of the month OR on ${dow.values
      .map((d) => DOW_LABELS[d])
      .join(", ")} (cron matches either, not both)`;
  }

  const monthPart = month.wildcard
    ? ""
    : `, in ${month.values.map((m) => MONTH_LABELS[m - 1]).join(", ")}`;

  return `${timePart}, ${dayPart}${monthPart}.`;
}

/** True when the calendar day matches, applying the day-of-month / day-of-week OR rule. */
function dayMatches(fields, date) {
  const dom = date.getDate();
  const dow = date.getDay();
  const domOk = fields.dom.values.includes(dom);
  const dowOk = fields.dow.values.includes(dow);
  if (fields.dom.wildcard && fields.dow.wildcard) return true;
  if (fields.dom.wildcard) return dowOk;
  if (fields.dow.wildcard) return domOk;
  return domOk || dowOk;
}

/**
 * Project the next run times after `from`, in the caller's local timezone.
 * @returns {Date[]} — empty when the expression can never fire (e.g. 30 February).
 */
export function nextRuns(parsed, from, count = 5) {
  if (!parsed || !parsed.ok || !parsed.fields) return [];
  const wanted = Math.max(1, Math.min(20, Math.floor(Number(count) || 5)));
  const start = from instanceof Date && !Number.isNaN(from.getTime()) ? from : null;
  if (!start) return [];

  const { fields } = parsed;
  const runs = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());

  for (let day = 0; day < SEARCH_HORIZON_DAYS && runs.length < wanted; day += 1) {
    const probe = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + day);
    if (!fields.month.values.includes(probe.getMonth() + 1)) continue;
    if (!dayMatches(fields, probe)) continue;
    for (const hour of fields.hour.values) {
      for (const minute of fields.minute.values) {
        const when = new Date(probe.getFullYear(), probe.getMonth(), probe.getDate(), hour, minute, 0, 0);
        if (when.getTime() <= start.getTime()) continue;
        runs.push(when);
        if (runs.length >= wanted) break;
      }
      if (runs.length >= wanted) break;
    }
  }
  return runs;
}

/**
 * Build the crontab block: environment lines, the schedule line, and warnings.
 * @returns {{line:string, block:string, envLines:string[], warnings:string[]}} or {error}
 */
export function buildCronLine(options = {}) {
  const {
    expression = "30 2 * * *",
    command = "/usr/local/bin/backup.sh",
    workingDir = "",
    logFile = "/var/log/backup.log",
    redirectStderr = true,
    lockFile = "",
    mailTo = "",
    setPath = true,
    pathValue = "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
    shellValue = "/bin/bash",
    setShell = true,
    timeoutSeconds = "",
  } = options;

  const parsed = parseCronExpression(expression);
  if (!parsed.ok) return { error: parsed.message };

  const cmd = String(command ?? "").trim();
  if (!cmd) return { error: "Enter the command cron should run." };
  if (cmd.includes("\n")) return { error: "A crontab command must be a single line." };

  const timeout = String(timeoutSeconds ?? "").trim();
  let timeoutValue = null;
  if (timeout !== "") {
    const parsedTimeout = Number(timeout);
    if (!Number.isFinite(parsedTimeout) || !Number.isInteger(parsedTimeout) || parsedTimeout <= 0) {
      return { error: "The timeout must be a whole number of seconds greater than zero." };
    }
    if (parsedTimeout > 86400) return { error: "A timeout above 86400 seconds (one day) is almost certainly a mistake." };
    timeoutValue = parsedTimeout;
  }

  const pieces = [];
  const dir = String(workingDir ?? "").trim();
  if (dir) pieces.push(`cd ${shellQuote(dir)} &&`);

  const lock = String(lockFile ?? "").trim();
  let core = cmd;
  if (timeoutValue !== null) core = `/usr/bin/timeout ${timeoutValue}s ${core}`;
  if (lock) core = `/usr/bin/flock -n ${shellQuote(lock)} -c ${shellQuote(core)}`;
  pieces.push(core);

  const log = String(logFile ?? "").trim();
  if (log) {
    pieces.push(`>> ${shellQuote(log)}`);
    if (redirectStderr) pieces.push("2>&1");
  } else if (redirectStderr) {
    pieces.push("2>&1");
  }

  const commandPart = pieces.join(" ");
  const line = `${parsed.expression} ${commandPart}`;

  const envLines = [];
  if (setShell && String(shellValue).trim()) envLines.push(`SHELL=${String(shellValue).trim()}`);
  if (setPath && String(pathValue).trim()) envLines.push(`PATH=${String(pathValue).trim()}`);
  if (String(mailTo).trim() !== "") envLines.push(`MAILTO="${String(mailTo).trim()}"`);

  const warnings = [];
  if (parsed.fields && !parsed.fields.dom.wildcard && !parsed.fields.dow.wildcard) {
    warnings.push(
      "Both day-of-month and day-of-week are restricted, so cron fires when EITHER matches. Leave one as * unless you really want the union.",
    );
  }
  if (cmd.includes("%")) {
    warnings.push("An unescaped % in a crontab command is turned into a newline. Write \\% for a literal percent sign.");
  }
  if (!cmd.startsWith("/") && !dir) {
    warnings.push(`cron runs with PATH=${CRON_DEFAULT_PATH} unless the crontab sets one, so use an absolute path to the command.`);
  }
  if (!log) {
    warnings.push("With no redirection cron emails the output to the crontab owner; on a server with no MTA that output is simply lost.");
  }
  if (!lock) {
    warnings.push("If a run can overlap the next one, wrap it in flock -n so a slow run never stacks up.");
  }
  if (String(mailTo).trim() === "") {
    warnings.push('Set MAILTO="" to silence cron mail entirely, or to a real address to receive failures.');
  }
  if (parsed.special === "@reboot") {
    warnings.push("@reboot fires when cron starts, which on a systemd host may be before the network or your database is up.");
  }
  warnings.push("cron uses the system timezone (or CRON_TZ if set), and a DST jump can skip or repeat a 01:00-03:00 job.");

  const block = [...envLines, "", line].filter((entry, index) => !(entry === "" && index === 0)).join("\n");

  return {
    line,
    block,
    envLines,
    warnings,
    parsed,
    description: describeSchedule(parsed),
  };
}
