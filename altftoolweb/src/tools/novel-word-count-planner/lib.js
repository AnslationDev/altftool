/**
 * Novel Word Count Planner — pure logic.
 *
 * Splits a novel word target across chapters, counts the real writing days
 * between a start date and a deadline given the weekdays you actually write,
 * and turns that into a daily word goal and a chapter delivery schedule.
 *
 * No React, no DOM, no clock reads — dates are always arguments.
 */

/* ------------------------------ length rules ------------------------------ */

/**
 * SFWA (Science Fiction and Fantasy Writers Association) Nebula Award length
 * categories, which are the most widely quoted fixed boundaries in publishing:
 *   short story   under 7,500 words
 *   novelette     7,500 to 17,499
 *   novella       17,500 to 39,999
 *   novel         40,000 and above
 */
export const SFWA_NOVELETTE_MIN = 7500;
export const SFWA_NOVELLA_MIN = 17500;
export const SFWA_NOVEL_MIN = 40000;

/**
 * Typical manuscript word-count bands by category. These are trade
 * expectations quoted by agents and editors, not hard rules — a debut well
 * outside the band is a harder sell, not an impossible one.
 */
export const CATEGORY_TARGETS = [
  { id: "picture-book", label: "Picture book", min: 300, max: 1000, typical: 600 },
  { id: "chapter-book", label: "Chapter book", min: 5000, max: 12000, typical: 8000 },
  { id: "middle-grade", label: "Middle grade", min: 30000, max: 55000, typical: 45000 },
  { id: "young-adult", label: "Young adult", min: 55000, max: 80000, typical: 70000 },
  { id: "commercial", label: "Adult commercial / literary", min: 80000, max: 100000, typical: 90000 },
  { id: "romance", label: "Category romance", min: 50000, max: 60000, typical: 55000 },
  { id: "thriller", label: "Thriller / crime", min: 70000, max: 100000, typical: 85000 },
  { id: "epic-fantasy", label: "Epic fantasy / science fiction", min: 100000, max: 150000, typical: 120000 },
  { id: "novella", label: "Novella", min: SFWA_NOVELLA_MIN, max: SFWA_NOVEL_MIN - 1, typical: 25000 },
];

/** Chapter length band commonly seen in commercial fiction. */
export const TYPICAL_CHAPTER_MIN_WORDS = 1500;
export const TYPICAL_CHAPTER_MAX_WORDS = 5000;

/* ------------------------------ input bounds ------------------------------ */

export const MIN_TARGET_WORDS = 1000;
export const MAX_TARGET_WORDS = 500000;
export const MIN_CHAPTERS = 1;
export const MAX_CHAPTERS = 200;
/** Longest planning horizon this tool will schedule. */
export const MAX_SCHEDULE_DAYS = 1096; // three years including a leap day

export const WEEKDAYS = [
  { id: 1, short: "Mon", label: "Monday" },
  { id: 2, short: "Tue", label: "Tuesday" },
  { id: 3, short: "Wed", label: "Wednesday" },
  { id: 4, short: "Thu", label: "Thursday" },
  { id: 5, short: "Fri", label: "Friday" },
  { id: 6, short: "Sat", label: "Saturday" },
  { id: 0, short: "Sun", label: "Sunday" },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_MS = 86400000;

/* -------------------------------- helpers -------------------------------- */

/** Parse yyyy-mm-dd into a UTC timestamp, or null if it is not a real date. */
export function parseIsoDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const stamp = Date.UTC(year, month - 1, day);
  const date = new Date(stamp);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return stamp;
}

/** UTC timestamp back to yyyy-mm-dd. */
export function toIsoDate(stamp) {
  const date = new Date(Number(stamp));
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = String(date.getUTCFullYear()).padStart(4, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** "2026-08-04" -> "Tue 4 Aug 2026". Returns "" for an invalid date. */
export function formatIsoShort(iso) {
  const stamp = parseIsoDate(iso);
  if (stamp === null) return "";
  const date = new Date(stamp);
  const weekday = WEEKDAYS.find((day) => day.id === date.getUTCDay());
  return `${weekday ? weekday.short : ""} ${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()].slice(0, 3)} ${date.getUTCFullYear()}`;
}

/**
 * Every date between start and end (both inclusive) that falls on one of the
 * selected weekdays (0 = Sunday … 6 = Saturday).
 * @returns {string[]} ISO dates, or null if the range is invalid.
 */
export function listWritingDays(startIso, endIso, weekdayIds) {
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  if (start === null || end === null || end < start) return null;

  const allowed = new Set((Array.isArray(weekdayIds) ? weekdayIds : []).map(Number));
  const days = [];
  for (let stamp = start; stamp <= end; stamp += DAY_MS) {
    if (allowed.has(new Date(stamp).getUTCDay())) days.push(toIsoDate(stamp));
  }
  return days;
}

/**
 * Add whole calendar months to an ISO date, in UTC.
 * Day-of-month overflow follows JavaScript's own rule (31 Jan + 1 month is
 * 3 March in a non-leap year), which is fine for picking a default deadline.
 * Returns "" for an invalid input date.
 */
export function addMonthsIso(iso, months) {
  const stamp = parseIsoDate(iso);
  if (stamp === null) return "";
  const offset = Number(months);
  if (!Number.isFinite(offset)) return "";
  const date = new Date(stamp);
  return toIsoDate(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + Math.trunc(offset), date.getUTCDate()),
  );
}

/** Calendar days between two ISO dates, inclusive. Null if the range is invalid. */
export function calendarDays(startIso, endIso) {
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  if (start === null || end === null || end < start) return null;
  return Math.round((end - start) / DAY_MS) + 1;
}

/** Split a total into whole parts summing exactly to it, remainder to the earliest parts. */
export function splitEvenly(total, parts) {
  const t = Math.max(0, Math.round(Number(total) || 0));
  const n = Math.max(1, Math.round(Number(parts) || 1));
  const base = Math.floor(t / n);
  const remainder = t - base * n;
  return Array.from({ length: n }, (_, index) => base + (index < remainder ? 1 : 0));
}

/** SFWA length category for a word count. */
export function classifyLength(words) {
  const value = Number(words);
  if (!Number.isFinite(value) || value < 0) return { id: "unknown", label: "Unknown" };
  if (value < SFWA_NOVELETTE_MIN) return { id: "short-story", label: "Short story" };
  if (value < SFWA_NOVELLA_MIN) return { id: "novelette", label: "Novelette" };
  if (value < SFWA_NOVEL_MIN) return { id: "novella", label: "Novella" };
  return { id: "novel", label: "Novel" };
}

/* -------------------------------- planner -------------------------------- */

/**
 * Build the writing plan.
 *
 * @param {object} input
 * @param {number} input.targetWords
 * @param {number} input.chapters
 * @param {string} input.startIso     yyyy-mm-dd first writing day.
 * @param {string} input.deadlineIso  yyyy-mm-dd last writing day.
 * @param {number[]} input.writingDays Weekday ids you write on (0 = Sunday).
 * @param {number} input.wordsSoFar   Already drafted.
 * @returns {object} plan, or { error }.
 */
export function planNovel(input = {}) {
  const {
    targetWords,
    chapters = 30,
    startIso,
    deadlineIso,
    writingDays = [1, 2, 3, 4, 5],
    wordsSoFar = 0,
  } = input;

  if (!Number.isFinite(Number(targetWords))) return { error: "Enter a word target for the finished book." };
  const target = Math.round(Number(targetWords));
  if (target < MIN_TARGET_WORDS) {
    return { error: `Set a target of at least ${MIN_TARGET_WORDS} words.` };
  }
  if (target > MAX_TARGET_WORDS) {
    return { error: `${MAX_TARGET_WORDS} words is the ceiling here — plan a multi-volume work book by book.` };
  }

  if (!Number.isFinite(Number(chapters))) return { error: "Enter how many chapters you are planning." };
  const chapterCount = Math.round(Number(chapters));
  if (chapterCount < MIN_CHAPTERS || chapterCount > MAX_CHAPTERS) {
    return { error: `Plan between ${MIN_CHAPTERS} and ${MAX_CHAPTERS} chapters.` };
  }

  const done = Math.max(0, Math.round(Number(wordsSoFar) || 0));
  const remaining = Math.max(0, target - done);

  const start = parseIsoDate(startIso);
  const end = parseIsoDate(deadlineIso);
  if (start === null) return { error: "Enter a valid start date." };
  if (end === null) return { error: "Enter a valid deadline." };
  if (end < start) return { error: "The deadline must fall on or after the start date." };

  const totalCalendarDays = calendarDays(startIso, deadlineIso);
  if (totalCalendarDays > MAX_SCHEDULE_DAYS) {
    return { error: `Keep the schedule within ${MAX_SCHEDULE_DAYS} days — beyond three years the plan stops meaning anything.` };
  }

  const selectedDays = (Array.isArray(writingDays) ? writingDays : [])
    .map(Number)
    .filter((day) => WEEKDAYS.some((weekday) => weekday.id === day));
  const uniqueDays = selectedDays.filter((day, index) => selectedDays.indexOf(day) === index);
  if (uniqueDays.length === 0) {
    return { error: "Pick at least one day of the week that you actually write on." };
  }

  const days = listWritingDays(startIso, deadlineIso, uniqueDays);
  if (!days || days.length === 0) {
    return { error: "No writing days fall in that range — widen the dates or add a weekday." };
  }

  const perChapter = splitEvenly(target, chapterCount);
  const dailyTarget = remaining === 0 ? 0 : Math.ceil(remaining / days.length);

  // Chapter n is due on the writing day that closes its share of the schedule.
  const schedule = perChapter.map((words, index) => {
    const dayIndex = Math.max(
      0,
      Math.min(days.length - 1, Math.ceil(((index + 1) * days.length) / chapterCount) - 1),
    );
    return {
      chapter: index + 1,
      words,
      cumulativeWords: perChapter.slice(0, index + 1).reduce((sum, value) => sum + value, 0),
      dueIso: days[dayIndex],
      dueLabel: formatIsoShort(days[dayIndex]),
    };
  });

  const averageChapter = target / chapterCount;
  const category = classifyLength(target);

  return {
    target,
    wordsSoFar: done,
    remaining,
    chapters: chapterCount,
    perChapter,
    averageChapter,
    schedule,
    startIso: toIsoDate(start),
    deadlineIso: toIsoDate(end),
    startLabel: formatIsoShort(toIsoDate(start)),
    deadlineLabel: formatIsoShort(toIsoDate(end)),
    calendarDays: totalCalendarDays,
    writingDayCount: days.length,
    daysPerWeek: uniqueDays.length,
    dailyTarget,
    weeklyTarget: dailyTarget * uniqueDays.length,
    category,
    chapterTooShort: averageChapter < TYPICAL_CHAPTER_MIN_WORDS,
    chapterTooLong: averageChapter > TYPICAL_CHAPTER_MAX_WORDS,
    percentDone: target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0,
    complete: remaining === 0,
    lastWritingDay: days[days.length - 1],
  };
}

/** Render the plan as copyable plain text. */
export function planToText(plan) {
  if (!plan || plan.error) return "";
  const lines = [
    `Novel plan — ${plan.target.toLocaleString("en-IN")} words in ${plan.chapters} chapters (${plan.category.label})`,
    `${plan.startLabel} to ${plan.deadlineLabel}: ${plan.writingDayCount} writing days out of ${plan.calendarDays} calendar days`,
    `Daily target: ${plan.dailyTarget.toLocaleString("en-IN")} words · weekly: ${plan.weeklyTarget.toLocaleString("en-IN")}`,
    "",
  ];
  plan.schedule.forEach((row) => {
    lines.push(`Chapter ${row.chapter}: ${row.words} words — due ${row.dueLabel}`);
  });
  return lines.join("\n").trim();
}
