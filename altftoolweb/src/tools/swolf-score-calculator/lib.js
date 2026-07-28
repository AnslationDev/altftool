/**
 * SWOLF (SWim + gOLF) scoring.
 *
 * SWOLF is the simplest efficiency score in swimming: for a single length, add
 * the time in seconds to the number of strokes taken.
 *
 *     SWOLF = length time (seconds) + strokes in that length
 *
 * Like golf, lower is better — you either covered the length faster or used
 * fewer strokes to do it. The score is only comparable within the same pool
 * length and the same stroke, which is why watches compute it per length. To
 * compare a 50 m pool against a 25 m pool this module also reports a
 * length-normalised figure:
 *
 *     SWOLF per 25 = SWOLF x (25 / pool length)
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Reference length used for the normalised score, in metres. */
export const REFERENCE_LENGTH_M = 25;

/** Guard rails so a mis-entry cannot produce a fake score. */
export const MAX_LENGTH_TIME_SECONDS = 600;
export const MAX_STROKES = 200;
export const MAX_POOL_LENGTH_M = 100;
export const MAX_LENGTHS = 400;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Seconds -> "m:ss.s". Total function: never NaN. */
export function formatSeconds(totalSeconds, decimals = 1) {
  if (!isNum(totalSeconds) || totalSeconds < 0) return "0:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  const text = seconds.toFixed(decimals).padStart(decimals > 0 ? 3 + decimals : 2, "0");
  return `${minutes}:${text}`;
}

/**
 * SWOLF for one length.
 *
 * @param {object} input
 * @param {number} input.lengthTimeSeconds Time for that single length.
 * @param {number} input.strokes           Strokes taken in that length.
 * @param {number} input.poolLengthM       Pool length in metres.
 */
export function computeSwolf({ lengthTimeSeconds, strokes, poolLengthM } = {}) {
  if (![lengthTimeSeconds, strokes, poolLengthM].every(isNum)) {
    return { error: "Enter a time, a stroke count and a pool length." };
  }
  if (lengthTimeSeconds <= 0) return { error: "Length time must be greater than zero." };
  if (lengthTimeSeconds > MAX_LENGTH_TIME_SECONDS) {
    return { error: `A single length longer than ${MAX_LENGTH_TIME_SECONDS} seconds is outside this tool's range.` };
  }
  if (strokes < 1 || strokes > MAX_STROKES) {
    return { error: `Strokes per length must be between 1 and ${MAX_STROKES}.` };
  }
  if (poolLengthM <= 0 || poolLengthM > MAX_POOL_LENGTH_M) {
    return { error: `Pool length must be between 0 and ${MAX_POOL_LENGTH_M} metres.` };
  }

  const swolf = lengthTimeSeconds + strokes;
  const normalised = swolf * (REFERENCE_LENGTH_M / poolLengthM);

  return {
    swolf,
    normalisedSwolf25: normalised,
    lengthTimeSeconds,
    strokes,
    poolLengthM,
    timeShare: swolf > 0 ? lengthTimeSeconds / swolf : 0,
    strokeShare: swolf > 0 ? strokes / swolf : 0,
    speedMps: poolLengthM / lengthTimeSeconds,
    pacePer100Seconds: lengthTimeSeconds * (100 / poolLengthM),
    distancePerStrokeM: poolLengthM / strokes,
    strokeRatePerMinute: (strokes / lengthTimeSeconds) * 60,
  };
}

/**
 * SWOLF averaged over a whole set, from totals.
 *
 * @param {object} input
 * @param {number} input.totalTimeSeconds Total swim time.
 * @param {number} input.totalStrokes     Total strokes across the set.
 * @param {number} input.lengths          Number of lengths swum.
 * @param {number} input.poolLengthM      Pool length in metres.
 */
export function computeSwolfSet({ totalTimeSeconds, totalStrokes, lengths, poolLengthM } = {}) {
  if (![totalTimeSeconds, totalStrokes, lengths, poolLengthM].every(isNum)) {
    return { error: "Enter the total time, total strokes, lengths and pool length." };
  }
  if (lengths < 1 || lengths > MAX_LENGTHS) {
    return { error: `Lengths must be between 1 and ${MAX_LENGTHS}.` };
  }
  if (totalTimeSeconds <= 0) return { error: "Total time must be greater than zero." };
  if (totalStrokes < 1) return { error: "Total strokes must be at least 1." };

  const perLengthTime = totalTimeSeconds / lengths;
  const perLengthStrokes = totalStrokes / lengths;
  const single = computeSwolf({
    lengthTimeSeconds: perLengthTime,
    strokes: perLengthStrokes,
    poolLengthM,
  });
  if (single.error) return single;

  return {
    ...single,
    lengths,
    totalTimeSeconds,
    totalStrokes,
    totalDistanceM: lengths * poolLengthM,
  };
}

/**
 * Trade-off table: for stroke counts around the one entered, the length time
 * that would keep the same SWOLF score. Shows the cost of "gliding for a lower
 * stroke count" in seconds.
 */
export function tradeOffTable(result, offsets = [-3, -2, -1, 0, 1, 2, 3]) {
  if (!result || result.error) return [];
  const { swolf, strokes, poolLengthM } = result;
  return offsets
    .map((offset) => {
      const newStrokes = Math.round(strokes) + offset;
      if (newStrokes < 1 || newStrokes > MAX_STROKES) return null;
      const requiredTime = swolf - newStrokes;
      if (requiredTime <= 0) return null;
      return {
        offset,
        strokes: newStrokes,
        requiredTimeSeconds: requiredTime,
        speedMps: poolLengthM / requiredTime,
        distancePerStrokeM: poolLengthM / newStrokes,
      };
    })
    .filter(Boolean);
}
