/**
 * Podcast release calendar maths.
 *
 * All arithmetic is done on UTC midnight timestamps. UTC has no daylight-saving
 * shifts, so "add 7 days" is always exactly 7 * 86400000 ms and a season planned
 * across a clock change never drifts by an hour into the previous day.
 *
 * Pure module: every date the maths depends on is passed in as an argument.
 */

/** Milliseconds in one day. Exact in UTC because UTC never changes offset. */
export const MS_PER_DAY = 86400000;

/** Day-of-week names indexed the way Date#getUTCDay() reports them (0 = Sunday). */
export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Release cadences.
 *
 * Each cadence is a repeating pattern: `cycleDays` long, with one release at
 * each day offset in `offsets`. Modelling it this way keeps the publishing
 * weekday fixed for every episode, which is what podcast hosts and the Apple
 * Podcasts / Spotify schedulers expect.
 *
 * - twice-weekly uses offsets [0, 3] (e.g. Monday + Thursday), the standard
 *   split so the two drops are not back to back.
 * - monthly uses a 28-day cycle rather than a calendar month so the release
 *   always lands on the same weekday; a calendar month would walk the weekday
 *   forward by 2-3 days each time.
 */
export const CADENCES = {
  weekly: { id: "weekly", label: "Weekly", cycleDays: 7, offsets: [0] },
  "twice-weekly": {
    id: "twice-weekly",
    label: "Twice weekly",
    cycleDays: 7,
    offsets: [0, 3],
  },
  biweekly: { id: "biweekly", label: "Every 2 weeks", cycleDays: 14, offsets: [0] },
  monthly: { id: "monthly", label: "Every 4 weeks", cycleDays: 28, offsets: [0] },
};

/** Two years of weekly releases — beyond this a season plan stops being useful. */
export const MAX_EPISODES = 104;

/** Upper bound for any single lead time, in days. */
export const MAX_LEAD_DAYS = 90;

/** Longest mid-season break the planner will model, in weeks. */
export const MAX_BREAK_WEEKS = 26;

/**
 * Parse a strict "YYYY-MM-DD" string into a UTC-midnight timestamp.
 * Returns null for anything that is not a real calendar date.
 */
export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ts = Date.UTC(year, month - 1, day);
  const check = new Date(ts);
  // Rejects 2026-02-30 and friends, which Date.UTC would silently roll forward.
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return ts;
}

/** Format a UTC-midnight timestamp back to "YYYY-MM-DD". */
export function toISODate(ts) {
  if (!Number.isFinite(ts)) return "";
  return new Date(ts).toISOString().slice(0, 10);
}

/** Add a whole number of days to a UTC timestamp. */
export function addDays(ts, days) {
  return ts + days * MS_PER_DAY;
}

/** Weekday name for a UTC timestamp. */
export function weekdayOf(ts) {
  if (!Number.isFinite(ts)) return "";
  return WEEKDAYS[new Date(ts).getUTCDay()];
}

/**
 * First date on or after `ts` that falls on `weekday` (0 = Sunday).
 * Used to snap a season start onto the show's regular release day.
 */
export function nextWeekdayOnOrAfter(ts, weekday) {
  if (!Number.isFinite(ts)) return ts;
  const target = ((Math.trunc(weekday) % 7) + 7) % 7;
  const current = new Date(ts).getUTCDay();
  return addDays(ts, (target - current + 7) % 7);
}

/**
 * Day offset of episode `index` (0-based) from the season start date.
 * Applies the mid-season break as a flat shift to every later episode.
 */
export function episodeOffsetDays(index, cadence, breakAfterEpisode, breakWeeks) {
  const pattern = CADENCES[cadence] || CADENCES.weekly;
  const perCycle = pattern.offsets.length;
  const base =
    Math.floor(index / perCycle) * pattern.cycleDays + pattern.offsets[index % perCycle];
  // breakAfterEpisode is a 1-based episode number; episodes after it slide right.
  const shift =
    breakAfterEpisode > 0 && index >= breakAfterEpisode ? breakWeeks * 7 : 0;
  return base + shift;
}

/**
 * Build a full season plan.
 *
 * Deadline chain, working backwards from each publish date:
 *   publishDate   - the episode goes live
 *   editDeadline  = publishDate - bufferDays   (finished master uploaded and scheduled)
 *   recordDeadline = editDeadline - editDays   (raw audio in the editor's hands)
 *
 * @param {object} input
 * @param {string} input.startDate        First publish date, "YYYY-MM-DD".
 * @param {number} input.episodes         Episodes in the season.
 * @param {string} input.cadence          Key of CADENCES.
 * @param {number} input.editDays         Turnaround from raw recording to final master.
 * @param {number} input.bufferDays       Days a finished file sits scheduled before release.
 * @param {number} input.breakAfterEpisode Episode number the mid-season break follows (0 = none).
 * @param {number} input.breakWeeks       Length of that break in weeks.
 * @param {number} input.batchSize        Episodes recorded per session (1 = record one at a time).
 * @param {string} [input.today]          Optional "YYYY-MM-DD" used only to flag late deadlines.
 */
export function planSeason({
  startDate,
  episodes,
  cadence = "weekly",
  editDays = 0,
  bufferDays = 0,
  breakAfterEpisode = 0,
  breakWeeks = 0,
  batchSize = 1,
  today = "",
} = {}) {
  const start = parseISODate(startDate);
  if (start === null) {
    return { error: "Enter a valid first publish date in YYYY-MM-DD form." };
  }
  if (!CADENCES[cadence]) {
    return { error: "Choose one of the listed release cadences." };
  }

  const count = Math.trunc(Number(episodes));
  if (!Number.isFinite(count) || count < 1) {
    return { error: "A season needs at least one episode." };
  }
  if (count > MAX_EPISODES) {
    return { error: `Plan up to ${MAX_EPISODES} episodes at a time.` };
  }

  const edit = Number(editDays);
  const buffer = Number(bufferDays);
  if (!Number.isFinite(edit) || !Number.isFinite(buffer)) {
    return { error: "Edit turnaround and buffer must be numbers." };
  }
  if (edit < 0 || buffer < 0) {
    return { error: "Lead times cannot be negative." };
  }
  if (edit > MAX_LEAD_DAYS || buffer > MAX_LEAD_DAYS) {
    return { error: `Keep each lead time under ${MAX_LEAD_DAYS} days.` };
  }

  const breakAfter = Math.trunc(Number(breakAfterEpisode)) || 0;
  const weeksOff = Math.trunc(Number(breakWeeks)) || 0;
  if (breakAfter < 0 || breakAfter > count) {
    return { error: "The break has to fall on an episode inside the season." };
  }
  if (weeksOff < 0 || weeksOff > MAX_BREAK_WEEKS) {
    return { error: `A mid-season break can run up to ${MAX_BREAK_WEEKS} weeks.` };
  }

  const batch = Math.trunc(Number(batchSize));
  if (!Number.isFinite(batch) || batch < 1 || batch > count) {
    return { error: "Episodes per recording session must be between 1 and the season length." };
  }

  const todayTs = today ? parseISODate(today) : null;
  const editLead = Math.round(edit);
  const bufferLead = Math.round(buffer);

  const list = [];
  for (let index = 0; index < count; index += 1) {
    const publish = addDays(
      start,
      episodeOffsetDays(index, cadence, breakAfter, weeksOff),
    );
    const editDeadline = addDays(publish, -bufferLead);
    const recordDeadline = addDays(editDeadline, -editLead);
    list.push({
      number: index + 1,
      session: Math.floor(index / batch) + 1,
      publishTs: publish,
      publishDate: toISODate(publish),
      publishWeekday: weekdayOf(publish),
      editTs: editDeadline,
      editDeadline: toISODate(editDeadline),
      recordTs: recordDeadline,
      recordDeadline: toISODate(recordDeadline),
      firstAfterBreak: breakAfter > 0 && weeksOff > 0 && index === breakAfter,
      overdue: todayTs !== null && recordDeadline < todayTs,
    });
  }

  const sessions = [];
  for (let i = 0; i < list.length; i += batch) {
    const group = list.slice(i, i + batch);
    // Everything in a batch has to be in the can by the earliest deadline in it.
    const recordTs = Math.min(...group.map((episode) => episode.recordTs));
    sessions.push({
      number: sessions.length + 1,
      episodes: group.map((episode) => episode.number),
      recordTs,
      recordBy: toISODate(recordTs),
      recordWeekday: weekdayOf(recordTs),
      overdue: todayTs !== null && recordTs < todayTs,
    });
  }

  const first = list[0];
  const last = list[list.length - 1];
  const spanDays = (last.publishTs - first.publishTs) / MS_PER_DAY;

  return {
    episodes: list,
    sessions,
    firstPublish: first.publishDate,
    firstPublishWeekday: first.publishWeekday,
    lastPublish: last.publishDate,
    lastPublishWeekday: last.publishWeekday,
    seasonSpanDays: spanDays,
    // Inclusive week count: a 49-day span from ep 1 to ep 8 is an 8-week run.
    seasonSpanWeeks: Math.round((spanDays / 7 + 1) * 10) / 10,
    productionStart: list[0].recordDeadline,
    totalEpisodes: count,
    sessionCount: sessions.length,
    overdueCount: list.filter((episode) => episode.overdue).length,
    breakStart: breakAfter > 0 && weeksOff > 0 ? list[breakAfter - 1].publishDate : "",
    breakEnd: breakAfter > 0 && weeksOff > 0 ? list[breakAfter].publishDate : "",
    editLeadDays: editLead,
    bufferLeadDays: bufferLead,
    cadenceLabel: CADENCES[cadence].label,
  };
}
