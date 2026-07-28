/**
 * Swim stroke-count analysis.
 *
 * Counting strokes per length is the standard pool-side measure of stroke
 * efficiency. Two figures matter:
 *
 *   distance per stroke = pool length / strokes taken in that length
 *   drift = how far the count rises between the first and second half of a set
 *
 * A rising count at the same speed means the stroke is shortening under
 * fatigue; a falling count at the same speed means the stroke is getting more
 * efficient. Neither number means anything on its own — they are only useful
 * compared with your own previous sessions at the same pace.
 *
 * Count consistently: this module treats a "stroke" as whatever you count
 * (single arm entries or full cycles), it just has to be the same every length.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Sanity bounds for one length. Below 3 is not a swim; above 120 is a mis-entry. */
export const MIN_STROKES = 1;
export const MAX_STROKES = 120;

/** Most sets logged pool-side are well under this many lengths. */
export const MAX_LENGTHS = 200;

/** How to describe the change in stroke count from the first half to the second. */
export const DRIFT_BANDS = [
  { max: 2, label: "Very steady", note: "Stroke length held almost perfectly across the set." },
  { max: 5, label: "Steady", note: "A small rise — normal in a well-paced set." },
  { max: 10, label: "Drifting", note: "The stroke is shortening. Check catch and body position late in the set." },
  { max: Infinity, label: "Falling apart", note: "A large rise means technique is breaking down; shorten the set or slow the pace." },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Read stroke counts from free text separated by commas, spaces or new lines.
 * @returns {{counts:number[]}|{error:string}}
 */
export function parseStrokeCounts(text) {
  if (typeof text !== "string") return { error: "Enter your stroke counts, separated by commas." };
  const tokens = text.split(/[\s,;]+/).filter((token) => token !== "");
  if (tokens.length === 0) return { error: "Enter at least one length's stroke count." };
  if (tokens.length > MAX_LENGTHS) {
    return { error: `That is more than ${MAX_LENGTHS} lengths — split the session into sets.` };
  }
  const counts = [];
  for (const token of tokens) {
    if (!/^\d+$/.test(token)) {
      return { error: `"${token}" is not a whole number of strokes.` };
    }
    const value = Number(token);
    if (value < MIN_STROKES || value > MAX_STROKES) {
      return { error: `Stroke counts must be between ${MIN_STROKES} and ${MAX_STROKES} per length.` };
    }
    counts.push(value);
  }
  return { counts };
}

/** Population standard deviation. Returns 0 for a single value, never NaN. */
export function standardDeviation(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) * (value - mean), 0) / values.length;
  return Math.sqrt(variance);
}

/** Median of a numeric array. Returns 0 for an empty array. */
export function median(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

/** Band describing a percentage drift between halves. */
export function driftBand(driftPercent) {
  const value = isNum(driftPercent) ? driftPercent : 0;
  return DRIFT_BANDS.find((band) => value <= band.max) ?? DRIFT_BANDS[DRIFT_BANDS.length - 1];
}

/**
 * Summarise a set of per-length stroke counts.
 *
 * @param {object} input
 * @param {number[]} input.counts       Strokes taken in each length, in order.
 * @param {number} input.poolLengthM    Length of the pool, in metres.
 */
export function summariseStrokes({ counts, poolLengthM } = {}) {
  if (!Array.isArray(counts) || counts.length === 0) {
    return { error: "Enter at least one length's stroke count." };
  }
  if (!counts.every((value) => isNum(value) && value >= MIN_STROKES && value <= MAX_STROKES)) {
    return { error: `Stroke counts must be between ${MIN_STROKES} and ${MAX_STROKES} per length.` };
  }
  if (!isNum(poolLengthM) || poolLengthM <= 0) {
    return { error: "Pool length must be greater than zero." };
  }
  if (poolLengthM > 100) return { error: "Pool length above 100 m is outside this tool's range." };

  const lengths = counts.length;
  const totalStrokes = counts.reduce((sum, value) => sum + value, 0);
  const mean = totalStrokes / lengths;
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const spread = max - min;
  const sd = standardDeviation(counts);

  const half = Math.floor(lengths / 2);
  const hasHalves = half >= 1;
  const firstHalf = hasHalves ? counts.slice(0, half) : [];
  const secondHalf = hasHalves ? counts.slice(lengths - half) : [];
  const firstHalfMean = hasHalves
    ? firstHalf.reduce((sum, value) => sum + value, 0) / half
    : null;
  const secondHalfMean = hasHalves
    ? secondHalf.reduce((sum, value) => sum + value, 0) / half
    : null;
  const driftPercent =
    hasHalves && firstHalfMean > 0 ? ((secondHalfMean - firstHalfMean) / firstHalfMean) * 100 : null;

  return {
    counts,
    lengths,
    poolLengthM,
    totalDistanceM: lengths * poolLengthM,
    totalStrokes,
    mean,
    median: median(counts),
    min,
    max,
    spread,
    standardDeviation: sd,
    distancePerStroke: poolLengthM / mean,
    bestDistancePerStroke: poolLengthM / min,
    firstHalfMean,
    secondHalfMean,
    driftPercent,
    driftBand: driftPercent === null ? null : driftBand(driftPercent),
    strokesPerMetre: mean / poolLengthM,
  };
}
