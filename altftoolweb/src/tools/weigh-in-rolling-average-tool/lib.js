/**
 * Weigh-in rolling average tool — pure calculation module.
 * No React, no DOM, no Date.now(): all dates arrive as "YYYY-MM-DD" strings.
 */

/** Default smoothing window. Seven days covers a full weekly routine. */
export const DEFAULT_WINDOW = 7;

/**
 * Smoothing factor for the exponentially weighted trend. 0.1 is the value used
 * by the Hacker's Diet trend line: each new reading moves the trend one tenth
 * of the way towards itself, which is roughly a 7-day equivalent smoothing.
 */
export const DEFAULT_ALPHA = 0.1;

/** Energy in one kilogram / one pound of body tissue. */
export const KCAL_PER_KG = 7700;
export const KCAL_PER_LB = 3500;

/** Windows offered for the moving average. */
export const WINDOW_OPTIONS = [3, 5, 7, 10, 14];

const MS_PER_DAY = 86400000;
const DAYS_PER_WEEK = 7;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const round = (value, places = 2) => {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

export function parseIsoDate(value) {
  const match = DATE_RE.exec(String(value || "").trim());
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return ms;
}

export function addDaysIso(dateString, days) {
  const ms = parseIsoDate(dateString);
  if (ms === null) return null;
  return new Date(ms + Math.round(days) * MS_PER_DAY).toISOString().slice(0, 10);
}

export function kcalPerUnit(units) {
  return units === "lb" ? KCAL_PER_LB : KCAL_PER_KG;
}

/**
 * Ordinary least-squares fit of weight against elapsed days.
 * @returns {{slopePerDay:number, intercept:number, r2:number}|null}
 */
export function linearTrend(points) {
  const n = points.length;
  if (n < 2) return null;
  let sumX = 0;
  let sumY = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
  }
  const meanX = sumX / n;
  const meanY = sumY / n;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (const p of points) {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    sxx += dx * dx;
    sxy += dx * dy;
    syy += dy * dy;
  }
  if (sxx === 0) return null; // every reading on the same day
  const slope = sxy / sxx;
  const intercept = meanY - slope * meanX;
  const r2 = syy === 0 ? 1 : Math.max(0, Math.min(1, (sxy * sxy) / (sxx * syy)));
  return { slopePerDay: slope, intercept, r2 };
}

/** Sample standard deviation of an array of numbers. */
export function standardDeviation(values) {
  const n = values.length;
  if (n < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / n;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1);
  return Math.sqrt(variance);
}

/**
 * Smooth a list of weigh-ins.
 *
 * @param {Array} rawEntries [{ date: "YYYY-MM-DD", weight: number }]
 * @param {object} options { window, alpha, units }
 * @returns {object} series and summary, or { error }.
 */
export function smoothWeighIns(rawEntries, options = {}) {
  const window = Number.isFinite(Number(options.window)) ? Math.round(Number(options.window)) : DEFAULT_WINDOW;
  const alpha = Number.isFinite(Number(options.alpha)) ? Number(options.alpha) : DEFAULT_ALPHA;
  const units = options.units === "lb" ? "lb" : "kg";

  if (!Array.isArray(rawEntries) || rawEntries.length < 2) {
    return { error: "Add at least two weigh-ins before a trend can be calculated." };
  }
  if (window < 2 || window > 30) return { error: "The averaging window must be between 2 and 30 readings." };
  if (!(alpha > 0) || alpha > 1) return { error: "The smoothing factor must be greater than 0 and at most 1." };

  const maxWeight = units === "lb" ? 900 : 400;
  const minWeight = units === "lb" ? 60 : 25;

  const entries = [];
  const seen = new Set();
  for (let i = 0; i < rawEntries.length; i += 1) {
    const raw = rawEntries[i] || {};
    const ms = parseIsoDate(raw.date);
    if (ms === null) return { error: `Row ${i + 1}: enter a real date as YYYY-MM-DD.` };
    const weight = Number(raw.weight);
    if (!Number.isFinite(weight)) return { error: `Row ${i + 1}: enter a number for the weight.` };
    if (weight < minWeight || weight > maxWeight) {
      return { error: `Row ${i + 1}: weight must be between ${minWeight} and ${maxWeight} ${units}.` };
    }
    const date = new Date(ms).toISOString().slice(0, 10);
    if (seen.has(date)) return { error: `Two rows share the date ${date}. Keep one weigh-in per day.` };
    seen.add(date);
    entries.push({ date, ms, weight });
  }

  entries.sort((a, b) => a.ms - b.ms);
  const firstMs = entries[0].ms;

  // Simple moving average over the last `window` logged readings.
  const series = entries.map((entry, index) => {
    const start = Math.max(0, index - window + 1);
    const slice = entries.slice(start, index + 1);
    const complete = slice.length === window;
    const average = slice.reduce((s, e) => s + e.weight, 0) / slice.length;
    return {
      date: entry.date,
      dayOffset: Math.round((entry.ms - firstMs) / MS_PER_DAY),
      weight: round(entry.weight, 2),
      movingAverage: round(average, 2),
      movingAverageComplete: complete,
      readingsUsed: slice.length,
    };
  });

  // Exponentially weighted trend, seeded on the first reading.
  let ewma = entries[0].weight;
  series.forEach((row, index) => {
    if (index > 0) ewma += alpha * (entries[index].weight - ewma);
    row.trend = round(ewma, 2);
    row.deviation = round(entries[index].weight - ewma, 2);
  });

  const regression = linearTrend(series.map((row) => ({ x: row.dayOffset, y: row.weight })));
  const spanDays = series[series.length - 1].dayOffset - series[0].dayOffset;

  const weights = series.map((row) => row.weight);
  const residuals = series.map((row) => row.deviation);
  const noise = round(standardDeviation(residuals), 2);

  const slopePerWeek = regression ? round(regression.slopePerDay * DAYS_PER_WEEK, 3) : null;
  const kcalPerDay = regression ? round((regression.slopePerDay * kcalPerUnit(units)), 0) : null;

  const firstAverage = series[0].movingAverage;
  const lastAverage = series[series.length - 1].movingAverage;
  const averageChange = round(lastAverage - firstAverage, 2);

  const latest = series[series.length - 1];
  const scaleVsTrend = round(latest.weight - latest.trend, 2);

  const notes = [];
  if (series.length < window) {
    notes.push(`Only ${series.length} readings logged, so the ${window}-reading average is not complete yet — keep logging.`);
  }
  if (spanDays < DAYS_PER_WEEK) {
    notes.push(`These readings cover ${spanDays} day(s). A weekly rate from under a week of data is not yet meaningful.`);
  }
  if (regression && regression.r2 < 0.3) {
    notes.push(
      `The straight-line fit explains only ${round(regression.r2 * 100, 0)}% of the variation, so daily noise is currently larger than the trend. More days will separate them.`,
    );
  }
  notes.push(
    `Day-to-day noise around the trend is ${noise} ${units} (one standard deviation), so a single reading that far from the line means nothing on its own.`,
  );
  if (Math.abs(scaleVsTrend) > noise) {
    notes.push(
      `Your latest reading sits ${Math.abs(scaleVsTrend)} ${units} ${scaleVsTrend > 0 ? "above" : "below"} the trend — further than typical daily noise, usually fluid rather than a real change.`,
    );
  }

  return {
    units,
    window,
    alpha,
    series,
    count: series.length,
    spanDays,
    firstDate: series[0].date,
    lastDate: series[series.length - 1].date,
    minWeight: round(Math.min(...weights), 2),
    maxWeight: round(Math.max(...weights), 2),
    rawRange: round(Math.max(...weights) - Math.min(...weights), 2),
    firstAverage,
    lastAverage,
    averageChange,
    latestTrend: latest.trend,
    scaleVsTrend,
    noise,
    slopePerWeek,
    slopePerDay: regression ? round(regression.slopePerDay, 4) : null,
    r2: regression ? round(regression.r2, 3) : null,
    kcalPerDay,
    projected30Day:
      regression !== null ? round(latest.trend + regression.slopePerDay * 30, 2) : null,
    projected30DayDate: addDaysIso(latest.date, 30),
    notes,
  };
}
