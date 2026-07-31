/**
 * Resting heart rate trend maths.
 *
 * All functions are pure: dates arrive as "YYYY-MM-DD" strings and are converted to
 * an integer day number, so no clock is read inside the calculations.
 *
 * Reference points used for interpretation:
 *  - American Heart Association: a normal adult resting heart rate is 60-100 bpm.
 *  - Well-trained endurance athletes commonly sit at 40-60 bpm.
 *  - A sustained rise of about 5 bpm or more above your own rolling baseline is the
 *    threshold most recovery-tracking guidance uses as a signal to back off, because
 *    it is roughly the point at which the change exceeds normal day-to-day noise.
 */

/** Plausible measurement bounds for a resting (not exercising) pulse. */
export const RHR_MIN = 25;
export const RHR_MAX = 130;
/** AHA normal adult range. */
export const NORMAL_RHR_LOW = 60;
export const NORMAL_RHR_HIGH = 100;
/** Typical trained-endurance-athlete band. */
export const ATHLETE_RHR_HIGH = 60;
/** Deviation from personal baseline that is treated as a meaningful signal, in bpm. */
export const ELEVATED_DELTA = 5;
export const SUPPRESSED_DELTA = -5;
/** Default window lengths in calendar days. */
export const ROLLING_WINDOW_DAYS = 7;
export const BASELINE_WINDOW_DAYS = 28;

const MS_PER_DAY = 86400000;
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Convert an ISO "YYYY-MM-DD" string into an integer day number (days since 1970-01-01 UTC).
 * Returns null for anything that is not a valid calendar date.
 */
export function toDayNumber(isoDate) {
  if (typeof isoDate !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  // Rejects impossible dates such as 2025-02-30, which Date.UTC silently rolls over.
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return Math.round(ms / MS_PER_DAY);
}

/** Mean of a numeric array; null for an empty array. */
export function mean(values) {
  if (!Array.isArray(values) || values.length === 0) return null;
  let total = 0;
  for (const value of values) {
    if (!isNum(value)) return null;
    total += value;
  }
  return total / values.length;
}

/** Population standard deviation; null for fewer than two values. */
export function standardDeviation(values) {
  if (!Array.isArray(values) || values.length < 2) return null;
  const avg = mean(values);
  if (avg === null) return null;
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Ordinary least squares slope of bpm against day number.
 * Returns bpm change per day, or null when the x values carry no variance.
 */
export function linearSlope(points) {
  if (!Array.isArray(points) || points.length < 2) return null;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xBar = mean(xs);
  const yBar = mean(ys);
  if (xBar === null || yBar === null) return null;
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < points.length; i += 1) {
    numerator += (xs[i] - xBar) * (ys[i] - yBar);
    denominator += (xs[i] - xBar) ** 2;
  }
  if (denominator === 0) return null;
  return numerator / denominator;
}

/**
 * Clean, validate, sort and de-duplicate a list of readings.
 * Later entries win when the same date is logged twice.
 *
 * @param {Array<{date: string, bpm: number}>} entries
 * @returns {{ entries: Array } | { error: string }}
 */
export function normaliseEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { error: "Add at least one morning reading to see a trend." };
  }

  const byDate = new Map();
  for (const entry of entries) {
    const day = toDayNumber(entry && entry.date);
    if (day === null) return { error: `"${entry && entry.date}" is not a valid YYYY-MM-DD date.` };
    const bpm = Number(entry.bpm);
    if (!isNum(bpm)) return { error: `The reading for ${entry.date} is not a number.` };
    if (bpm < RHR_MIN || bpm > RHR_MAX) {
      return {
        error: `${entry.date}: a resting heart rate of ${entry.bpm} bpm is outside the ${RHR_MIN}-${RHR_MAX} bpm range this tracker accepts.`,
      };
    }
    byDate.set(day, { date: entry.date.trim(), day, bpm });
  }

  const sorted = [...byDate.values()].sort((a, b) => a.day - b.day);
  return { entries: sorted };
}

/**
 * Full trend summary over a list of readings.
 *
 * @param {Array<{date: string, bpm: number}>} entries
 * @param {object} [options]
 * @param {number} [options.rollingWindowDays] Calendar-day width of the rolling average.
 * @param {number} [options.baselineWindowDays] Calendar-day width of the personal baseline.
 * @returns {object} trend figures, or { error }.
 */
export function summariseRestingHr(entries, options = {}) {
  const rollingWindowDays = isNum(options.rollingWindowDays)
    ? Math.round(options.rollingWindowDays)
    : ROLLING_WINDOW_DAYS;
  const baselineWindowDays = isNum(options.baselineWindowDays)
    ? Math.round(options.baselineWindowDays)
    : BASELINE_WINDOW_DAYS;

  if (rollingWindowDays < 2 || rollingWindowDays > 90) {
    return { error: "The rolling window must be between 2 and 90 days." };
  }
  if (baselineWindowDays < rollingWindowDays || baselineWindowDays > 365) {
    return {
      error: "The baseline window must be at least as long as the rolling window, and under a year.",
    };
  }

  const cleaned = normaliseEntries(entries);
  if (cleaned.error) return { error: cleaned.error };

  const list = cleaned.entries;
  const series = list.map((entry, index) => {
    const windowValues = [];
    for (let j = index; j >= 0; j -= 1) {
      if (entry.day - list[j].day >= rollingWindowDays) break;
      windowValues.push(list[j].bpm);
    }
    return {
      ...entry,
      rolling: mean(windowValues),
      rollingCount: windowValues.length,
    };
  });

  const latest = series[series.length - 1];
  const baselineValues = list
    .filter((item) => item.day !== latest.day && latest.day - item.day < baselineWindowDays)
    .map((item) => item.bpm);
  const baseline = mean(baselineValues);
  const deviation = baseline === null ? null : latest.bpm - baseline;

  const slopePerDay = linearSlope(series.map((item) => ({ x: item.day, y: item.bpm })));
  const slopePerWeek = slopePerDay === null ? null : slopePerDay * 7;

  const allValues = list.map((item) => item.bpm);
  const lowest = list.reduce((best, item) => (item.bpm < best.bpm ? item : best), list[0]);
  const highest = list.reduce((best, item) => (item.bpm > best.bpm ? item : best), list[0]);

  let status = "steady";
  let statusText = "Latest reading is within normal day-to-day variation of your baseline.";
  if (deviation === null) {
    statusText = `Log more mornings within the ${baselineWindowDays}-day window to build a personal baseline to compare against.`;
  } else if (deviation >= ELEVATED_DELTA) {
    status = "elevated";
    statusText = `Latest reading is ${deviation.toFixed(1)} bpm above your ${baselineWindowDays}-day baseline. A rise of ${ELEVATED_DELTA} bpm or more often follows poor sleep, alcohol, heat, illness or an unusually hard training block.`;
  } else if (deviation <= SUPPRESSED_DELTA) {
    status = "low";
    statusText = `Latest reading is ${Math.abs(deviation).toFixed(1)} bpm below your ${baselineWindowDays}-day baseline, which usually reflects good recovery or improving aerobic fitness.`;
  }

  let band = "normal";
  if (latest.bpm < ATHLETE_RHR_HIGH) band = "athletic";
  else if (latest.bpm > NORMAL_RHR_HIGH) band = "above-normal";

  return {
    series,
    count: list.length,
    spanDays: list[list.length - 1].day - list[0].day + 1,
    latest,
    average: mean(allValues),
    baseline,
    baselineCount: baselineValues.length,
    baselineWindowDays,
    rollingWindowDays,
    rollingLatest: latest.rolling,
    deviation,
    slopePerDay,
    slopePerWeek,
    spread: standardDeviation(allValues),
    lowest,
    highest,
    status,
    statusText,
    band,
  };
}

/**
 * Turn a summarised series into 0-100 chart coordinates for an SVG polyline.
 * Y is inverted so that a higher bpm draws higher on screen.
 *
 * @param {Array<{day:number,bpm:number,rolling:number|null}>} series
 * @returns {{ points: Array, minBpm: number, maxBpm: number } | null}
 */
export function buildChartPoints(series) {
  if (!Array.isArray(series) || series.length === 0) return null;

  const values = series.flatMap((item) =>
    item.rolling === null ? [item.bpm] : [item.bpm, item.rolling],
  );
  let minBpm = Math.min(...values);
  let maxBpm = Math.max(...values);
  if (maxBpm === minBpm) {
    minBpm -= 1;
    maxBpm += 1;
  }

  const firstDay = series[0].day;
  const lastDay = series[series.length - 1].day;
  const daySpan = lastDay - firstDay;

  const toY = (bpm) => 100 - ((bpm - minBpm) / (maxBpm - minBpm)) * 100;

  const points = series.map((item, index) => ({
    key: item.date,
    x: daySpan === 0 ? (series.length === 1 ? 50 : (index / (series.length - 1)) * 100) : ((item.day - firstDay) / daySpan) * 100,
    y: toY(item.bpm),
    rollingY: item.rolling === null ? null : toY(item.rolling),
    bpm: item.bpm,
    rolling: item.rolling,
    date: item.date,
  }));

  return { points, minBpm, maxBpm };
}
