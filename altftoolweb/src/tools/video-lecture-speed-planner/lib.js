/**
 * Video lecture speed planner.
 *
 * Model: watching at playback speed s for W wall-clock minutes consumes
 * W x s minutes of lecture content. A pause/rewind overhead of p% means only
 * (1 - p/100) of the wall-clock sitting is actual playback, so
 *
 *   contentPerDay = dailyWatchMinutes x (1 - p/100) x speed
 *   daysNeeded    = ceil(totalContentMinutes / contentPerDay)
 *
 * The finish date counts the start date as day 1.
 */

/**
 * Standard playback steps shipped by YouTube and most coaching apps
 * (1x to 2x in 0.25 increments).
 */
export const SPEED_OPTIONS = [1, 1.25, 1.5, 1.75, 2];

/** Sanity bounds: below 0.5x nobody plans a backlog, above 3x no player common in coaching apps goes. */
export const MIN_SPEED = 0.5;
export const MAX_SPEED = 3;

/**
 * Pause/rewind overhead cap. Above 90% the "watching" is really note-taking,
 * and the division below would explode toward infinity.
 */
export const MAX_OVERHEAD_PCT = 90;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Parse an ISO yyyy-mm-dd string into a UTC-midnight Date, or null when invalid. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

/** Format a UTC-midnight Date back to yyyy-mm-dd. */
export function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

/** Add whole days to a UTC-midnight date, returning a new Date. */
export function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Plan completion at one speed and compare across all standard speeds.
 *
 * @param {object} input
 * @param {number} input.totalContentMinutes  Remaining lecture content, in minutes at 1x.
 * @param {number} input.dailyWatchMinutes    Wall-clock minutes you sit down to watch per day.
 * @param {number} input.speed                Chosen playback speed.
 * @param {string} input.startDate            yyyy-mm-dd of day 1.
 * @param {number} [input.overheadPct]        % of sitting time lost to pausing/rewinding/notes.
 * @returns {object} plan, or { error } for unusable input.
 */
export function planLectureCompletion({
  totalContentMinutes,
  dailyWatchMinutes,
  speed,
  startDate,
  overheadPct = 0,
}) {
  const content = Number(totalContentMinutes);
  const daily = Number(dailyWatchMinutes);
  const s = Number(speed);
  const overhead = Number(overheadPct);

  if (!Number.isFinite(content) || content <= 0) {
    return { error: "Enter the remaining lecture content in minutes (more than 0)." };
  }
  if (!Number.isFinite(daily) || daily <= 0) {
    return { error: "Enter how many minutes per day you can watch (more than 0)." };
  }
  if (daily > 24 * 60) {
    return { error: "Daily watch time cannot exceed 24 hours." };
  }
  if (!Number.isFinite(s) || s < MIN_SPEED || s > MAX_SPEED) {
    return { error: `Playback speed must be between ${MIN_SPEED}x and ${MAX_SPEED}x.` };
  }
  if (!Number.isFinite(overhead) || overhead < 0 || overhead > MAX_OVERHEAD_PCT) {
    return { error: `Pause/rewind overhead must be between 0% and ${MAX_OVERHEAD_PCT}%.` };
  }
  const start = parseIsoDate(startDate);
  if (!start) return { error: "Enter a valid start date (yyyy-mm-dd)." };

  const effectiveShare = 1 - overhead / 100; // share of sitting time that is playback

  const planAt = (atSpeed) => {
    const contentPerDay = daily * effectiveShare * atSpeed;
    const daysNeeded = Math.ceil(content / contentPerDay);
    return {
      speed: atSpeed,
      contentPerDay: Math.round(contentPerDay * 10) / 10,
      daysNeeded,
      finishDate: toIsoDate(addDays(start, daysNeeded - 1)), // start date counts as day 1
    };
  };

  const chosen = planAt(s);
  const baseline = planAt(1);
  const comparison = SPEED_OPTIONS.map((option) => {
    const row = planAt(option);
    return { ...row, daysSavedVs1x: baseline.daysNeeded - row.daysNeeded };
  });

  return {
    ...chosen,
    daysSavedVs1x: baseline.daysNeeded - chosen.daysNeeded,
    baselineDays: baseline.daysNeeded,
    baselineFinishDate: baseline.finishDate,
    // Wall-clock hours actually spent sitting, at the chosen speed.
    totalSittingHours: Math.round(((content / (effectiveShare * s)) / 60) * 10) / 10,
    comparison,
  };
}
