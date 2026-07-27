/**
 * Video Series Content Calendar — pure scheduling maths.
 * No React, no JSX, no DOM. Dates are passed in as ISO strings; nothing reads the clock.
 * All date arithmetic runs in UTC so a timezone never shifts a publish day.
 */

export const WEEKDAYS = [
  { index: 0, short: "Sun", label: "Sunday" },
  { index: 1, short: "Mon", label: "Monday" },
  { index: 2, short: "Tue", label: "Tuesday" },
  { index: 3, short: "Wed", label: "Wednesday" },
  { index: 4, short: "Thu", label: "Thursday" },
  { index: 5, short: "Fri", label: "Friday" },
  { index: 6, short: "Sat", label: "Saturday" },
];

/** Formats cycle through this list unless the caller supplies its own. */
export const DEFAULT_FORMATS = [
  "Tutorial",
  "Listicle",
  "Deep dive",
  "Q&A",
  "Case study",
  "Behind the scenes",
  "Interview",
  "Short / Reel",
];

export const LIMITS = {
  weeks: { min: 1, max: 104 },
  perWeek: { min: 1, max: 7 },
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Parse "YYYY-MM-DD" strictly, in UTC. Returns null when the date is not real. */
export function parseISODate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const stamp = Date.UTC(year, month - 1, day);
  const date = new Date(stamp);
  // Rejects 2026-02-30 and friends, which JavaScript would otherwise roll forward.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return stamp;
}

/** UTC timestamp -> "YYYY-MM-DD". */
export function toISODate(stamp) {
  const date = new Date(stamp);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** UTC weekday index, 0 = Sunday. */
export function weekdayOf(stamp) {
  return new Date(stamp).getUTCDay();
}

/** Human date such as "Tue, 4 Aug 2026", built without touching the local timezone. */
export function prettyDate(stamp) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(stamp));
}

/**
 * Build a dated episode schedule.
 *
 * @param {object} options
 * @param {string} options.startDate    "YYYY-MM-DD" — the earliest possible publish date.
 * @param {number} options.weeks        How many weeks the series runs.
 * @param {number} options.perWeek      Episodes per week.
 * @param {number[]} options.publishDays Weekday indices (0 = Sunday) to publish on.
 * @param {string[]} options.topics     Topic titles, used in order.
 * @param {string[]} options.formats    Format labels, cycled in order.
 * @returns {{error:string}|{episodes:Array,totalEpisodes:number,endDate:string,weeksUsed:number,topicsUsed:number,topicsMissing:number,formatCounts:object,cadence:string}}
 */
export function buildCalendar({
  startDate = "",
  weeks = 4,
  perWeek = 2,
  publishDays = [2, 5],
  topics = [],
  formats = DEFAULT_FORMATS,
} = {}) {
  const start = parseISODate(startDate);
  if (start === null) return { error: "Enter a real start date in YYYY-MM-DD form." };

  const weekCount = Math.round(Number(weeks));
  const perWeekCount = Math.round(Number(perWeek));
  if (!Number.isFinite(weekCount) || weekCount < LIMITS.weeks.min || weekCount > LIMITS.weeks.max) {
    return { error: `Plan between ${LIMITS.weeks.min} and ${LIMITS.weeks.max} weeks.` };
  }
  if (
    !Number.isFinite(perWeekCount) ||
    perWeekCount < LIMITS.perWeek.min ||
    perWeekCount > LIMITS.perWeek.max
  ) {
    return { error: `Publish between ${LIMITS.perWeek.min} and ${LIMITS.perWeek.max} videos a week.` };
  }

  const days = Array.from(
    new Set(
      (Array.isArray(publishDays) ? publishDays : [])
        .map((day) => Math.round(Number(day)))
        .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6),
    ),
  ).sort((a, b) => a - b);

  if (days.length === 0) return { error: "Pick at least one publish day of the week." };
  if (days.length < perWeekCount) {
    return {
      error: `You want ${perWeekCount} videos a week but only picked ${days.length} publish day${days.length === 1 ? "" : "s"}.`,
    };
  }

  const chosenDays = days.slice(0, perWeekCount);
  const topicList = (Array.isArray(topics) ? topics : [])
    .map((topic) => String(topic ?? "").trim())
    .filter(Boolean);
  const formatList = (Array.isArray(formats) ? formats : [])
    .map((format) => String(format ?? "").trim())
    .filter(Boolean);
  const usableFormats = formatList.length > 0 ? formatList : DEFAULT_FORMATS;

  const totalEpisodes = weekCount * perWeekCount;
  const episodes = [];
  const formatCounts = {};

  let cursor = start;
  let guard = 0;
  const maxScan = (weekCount + 2) * 7 + 14;

  while (episodes.length < totalEpisodes && guard <= maxScan) {
    if (chosenDays.includes(weekdayOf(cursor))) {
      const index = episodes.length;
      const format = usableFormats[index % usableFormats.length];
      formatCounts[format] = (formatCounts[format] || 0) + 1;
      episodes.push({
        number: index + 1,
        week: Math.floor(index / perWeekCount) + 1,
        stamp: cursor,
        date: toISODate(cursor),
        pretty: prettyDate(cursor),
        weekday: WEEKDAYS[weekdayOf(cursor)].label,
        topic: topicList[index] || "Topic TBD",
        topicPlanned: Boolean(topicList[index]),
        format,
      });
    }
    cursor += MS_PER_DAY;
    guard += 1;
  }

  if (episodes.length < totalEpisodes) {
    return { error: "Could not fill every slot — check the publish days and try again." };
  }

  const last = episodes[episodes.length - 1];
  const spanDays = Math.round((last.stamp - start) / MS_PER_DAY) + 1;

  return {
    episodes,
    totalEpisodes,
    startDate: toISODate(start),
    endDate: last.date,
    endPretty: last.pretty,
    spanDays,
    weeksUsed: weekCount,
    perWeek: perWeekCount,
    publishDays: chosenDays.map((day) => WEEKDAYS[day].label),
    topicsUsed: Math.min(topicList.length, totalEpisodes),
    topicsMissing: Math.max(0, totalEpisodes - topicList.length),
    topicsSpare: Math.max(0, topicList.length - totalEpisodes),
    formatCounts,
    cadence: `${perWeekCount} a week on ${chosenDays.map((day) => WEEKDAYS[day].short).join(" and ")}`,
  };
}

/** One topic per line, ignoring blanks and list bullets. */
export function parseTopics(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").trim())
    .filter(Boolean);
}

/** Tab-separated export, ready to paste into a spreadsheet. */
export function toTsv(result) {
  if (!result || result.error) return "";
  const header = ["Ep", "Week", "Date", "Day", "Topic", "Format"].join("\t");
  const rows = result.episodes.map((episode) =>
    [episode.number, episode.week, episode.date, episode.weekday, episode.topic, episode.format].join("\t"),
  );
  return [header, ...rows].join("\n");
}
