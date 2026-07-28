/**
 * Out-of-office auto-reply generator.
 *
 * Composes the reply text and works out the absence arithmetic an OOO needs:
 * calendar days away, working days away (Saturday and Sunday excluded, optional
 * holiday list), and the first working day back.
 *
 * Pure module — no React, no DOM, no clock reads. Dates arrive as YYYY-MM-DD.
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86400000;

/** An auto-reply is read on a phone lock screen; past this it gets skimmed. */
export const MAX_RECOMMENDED_CHARS = 500;

/** Absences longer than this really need a named delegate, not just "I will reply later". */
export const DELEGATE_REQUIRED_DAYS = 3;

/** Longest absence this tool will format in one message. */
export const MAX_ABSENCE_DAYS = 365;

export const TONES = [
  {
    id: "standard",
    label: "Standard",
    opener: (range) => `Thank you for your email. I am out of the office ${range}.`,
    accessLine: (access) => access,
    signOffLine: "",
  },
  {
    id: "warm",
    label: "Warm",
    opener: (range) => `Thanks for writing. I am away ${range} and will be slow to reply.`,
    accessLine: (access) => access,
    signOffLine: "Thanks for your patience.",
  },
  {
    id: "minimal",
    label: "Minimal",
    opener: (range) => `Away ${range}.`,
    accessLine: (access) => access,
    signOffLine: "",
  },
  {
    id: "formal",
    label: "Formal",
    opener: (range) =>
      `Thank you for your message. Please note that I am not available ${range}.`,
    accessLine: (access) => access,
    signOffLine: "Your message will receive attention on my return.",
  },
];

export const ACCESS_LEVELS = [
  {
    id: "none",
    label: "No email access at all",
    sentence: "I will not have access to email during this period.",
  },
  {
    id: "limited",
    label: "Checking occasionally",
    sentence: "I will be checking email occasionally and may be slower than usual to reply.",
  },
  {
    id: "daily",
    label: "Checking once a day",
    sentence: "I am checking email once a day and will reply to anything urgent.",
  },
];

export const REASONS = [
  { id: "none", label: "Do not say why", phrase: "" },
  { id: "annual", label: "Annual leave", phrase: "on annual leave" },
  { id: "travel", label: "Business travel", phrase: "travelling for work" },
  { id: "conference", label: "At a conference", phrase: "attending a conference" },
  { id: "parental", label: "Parental leave", phrase: "on parental leave" },
  { id: "training", label: "In training", phrase: "in training" },
];

export function parseIsoDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return date;
}

const LONG_DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});
const SHORT_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

export function formatLong(date) {
  return date instanceof Date && !Number.isNaN(date.getTime()) ? LONG_DATE.format(date) : "";
}

export function formatShort(date) {
  return date instanceof Date && !Number.isNaN(date.getTime()) ? SHORT_DATE.format(date) : "";
}

function isWeekend(date) {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

function toKey(date) {
  return date.toISOString().slice(0, 10);
}

/** Inclusive count of Mon-Fri days between two dates, minus any listed holidays. */
export function countWorkingDays(start, end, holidays = []) {
  if (!(start instanceof Date) || !(end instanceof Date)) return 0;
  const skip = new Set(holidays);
  let count = 0;
  for (let t = start.getTime(); t <= end.getTime(); t += MS_PER_DAY) {
    const day = new Date(t);
    if (!isWeekend(day) && !skip.has(toKey(day))) count += 1;
  }
  return count;
}

/** Inclusive count of Saturdays and Sundays between two dates. */
export function countWeekendDays(start, end) {
  if (!(start instanceof Date) || !(end instanceof Date)) return 0;
  let count = 0;
  for (let t = start.getTime(); t <= end.getTime(); t += MS_PER_DAY) {
    if (isWeekend(new Date(t))) count += 1;
  }
  return count;
}

/** First Mon-Fri day strictly after `end` that is not in the holiday list. */
export function nextWorkingDay(end, holidays = []) {
  if (!(end instanceof Date)) return null;
  const skip = new Set(holidays);
  let cursor = new Date(end.getTime() + MS_PER_DAY);
  for (let guard = 0; guard < 30; guard += 1) {
    if (!isWeekend(cursor) && !skip.has(toKey(cursor))) return cursor;
    cursor = new Date(cursor.getTime() + MS_PER_DAY);
  }
  return cursor;
}

export function parseHolidays(raw) {
  if (typeof raw !== "string") return [];
  return raw
    .split(/[,\s;]+/)
    .map((item) => item.trim())
    .filter((item) => DATE_PATTERN.test(item) && parseIsoDate(item));
}

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

/**
 * Build the out-of-office reply.
 * Returns { message, workingDays, ... } or { error }.
 */
export function buildOutOfOffice(input = {}) {
  const start = parseIsoDate(input.startDate);
  if (!start) return { error: "Pick a valid first day away." };
  const end = parseIsoDate(input.endDate);
  if (!end) return { error: "Pick a valid last day away." };
  if (end.getTime() < start.getTime()) {
    return { error: "The last day away cannot be before the first day away." };
  }

  const calendarDays = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
  if (calendarDays > MAX_ABSENCE_DAYS) {
    return { error: `Absences longer than ${MAX_ABSENCE_DAYS} days need a handover, not an auto-reply.` };
  }

  const name = clean(input.name);
  if (!name) return { error: "Add your name so the reply is signed." };

  const holidays = parseHolidays(input.holidays);
  const workingDays = countWorkingDays(start, end, holidays);
  const returnDate = nextWorkingDay(end, holidays);

  const tone = TONES.find((item) => item.id === clean(input.tone)) || TONES[0];
  const access =
    ACCESS_LEVELS.find((item) => item.id === clean(input.access)) || ACCESS_LEVELS[0];
  const reason = REASONS.find((item) => item.id === clean(input.reason)) || REASONS[0];

  const backupName = clean(input.backupName);
  const backupEmail = clean(input.backupEmail);
  if (backupEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(backupEmail)) {
    return { error: "The backup contact's email address does not look valid." };
  }

  const sameDay = start.getTime() === end.getTime();
  const range = sameDay
    ? `on ${formatLong(start)}`
    : `from ${formatShort(start)} to ${formatLong(end)}`;

  const lines = [];
  const opener = tone.opener(range);
  lines.push(reason.phrase ? opener.replace(/\.$/, `, ${reason.phrase}.`) : opener);
  lines.push(tone.accessLine(access.sentence));
  lines.push(`I will be back at work on ${formatLong(returnDate)}.`);

  if (backupName) {
    const contact = backupEmail ? `${backupName} (${backupEmail})` : backupName;
    lines.push(`For anything that cannot wait, please contact ${contact}.`);
  }

  const escalation = clean(input.escalation);
  if (escalation) lines.push(escalation);
  if (tone.signOffLine) lines.push(tone.signOffLine);

  const message = [...lines.filter(Boolean), "", name].join("\n");
  const charCount = message.length;

  const checklist = [
    { label: "Exact first and last day away are stated", ok: true },
    { label: "Return date is a working day", ok: Boolean(returnDate) && !isWeekend(returnDate) },
    { label: "Says whether you are reading email", ok: true },
    {
      label: `Names a backup contact${workingDays > DELEGATE_REQUIRED_DAYS ? " (required for a long absence)" : ""}`,
      ok: workingDays <= DELEGATE_REQUIRED_DAYS || Boolean(backupName),
    },
    { label: "Backup contact has a reachable email", ok: !backupName || Boolean(backupEmail) },
    { label: `Under ${MAX_RECOMMENDED_CHARS} characters`, ok: charCount <= MAX_RECOMMENDED_CHARS },
    {
      label: "Avoids disclosing personal or family circumstances",
      ok: reason.id !== "parental",
    },
  ];

  const subject = `Out of office: ${formatShort(start)}${sameDay ? "" : ` – ${formatShort(end)}`}`;

  return {
    subject,
    message,
    charCount,
    calendarDays,
    workingDays,
    weekendDays: countWeekendDays(start, end),
    holidayCount: holidays.length,
    startLabel: formatLong(start),
    endLabel: formatLong(end),
    returnLabel: formatLong(returnDate),
    toneLabel: tone.label,
    accessLabel: access.label,
    tooLong: charCount > MAX_RECOMMENDED_CHARS,
    checklist,
    score: checklist.filter((item) => item.ok).length,
    scoreMax: checklist.length,
  };
}
