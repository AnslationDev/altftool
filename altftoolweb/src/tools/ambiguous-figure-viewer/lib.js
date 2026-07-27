/**
 * Bistable-perception measurement.
 *
 * An ambiguous (bistable) figure has two mutually exclusive interpretations.
 * Only one is seen at a time, and perception flips between them on its own.
 * The standard laboratory measure is the *dominance duration*: how long one
 * interpretation holds before it reverses.
 *
 * Published regularities this module works against:
 *  - Dominance durations are right-skewed and are well fitted by a gamma
 *    distribution (Levelt 1967; Borsellino, De Marco, Allazetta, Rinesi &
 *    Bartolini 1972, "Reversal time distribution in the perception of visual
 *    ambiguous stimuli", Kybernetik 10, which reported gamma shape ≈ 3-4).
 *  - Successive durations are close to independent, so the coefficient of
 *    variation, not the raw mean, is the informative shape statistic.
 *  - For a gamma distribution the method-of-moments shape estimate is
 *    k = mean² / variance, which equals 1 / CV².
 *
 * Everything here is arithmetic on an array of timestamps supplied by the
 * caller. No clock is read inside this module, so the same input always gives
 * the same output.
 */

/** Classic ambiguous figures. `firstPercept` / `secondPercept` name the two
 * mutually exclusive interpretations. */
export const FIGURES = [
  {
    id: "necker-cube",
    name: "Necker cube",
    firstPercept: "Front face lower-left",
    secondPercept: "Front face upper-right",
    discovered: "Louis Albert Necker, 1832",
    note: "A wireframe cube with no occlusion cues, so either square can read as the near face.",
  },
  {
    id: "schroder-stairs",
    name: "Schröder stairs",
    firstPercept: "Staircase seen from above",
    secondPercept: "Staircase seen from below",
    discovered: "Heinrich Schröder, 1858",
    note: "The same line drawing flips between a normal staircase and one hanging upside down.",
  },
  {
    id: "rubin-vase",
    name: "Rubin's vase",
    firstPercept: "A vase",
    secondPercept: "Two faces",
    discovered: "Edgar Rubin, 1915",
    note: "A figure-ground reversal: whichever region you treat as the object owns the contour.",
  },
];

/** Perception cannot genuinely reverse faster than this; anything shorter is a
 * double-tap on the key, not a percept switch. */
export const MIN_EPOCH_MS = 150;

/** Two complete epochs are the minimum for a variance, so three timestamps
 * (two switches plus the trial end) are the minimum useful trial. */
export const MIN_SWITCHES = 2;

/** Mean dominance durations reported for static ambiguous figures in
 * untrained observers, in milliseconds. */
export const TYPICAL_MEAN_DOMINANCE_MS = [1000, 5000];

/** Gamma shape values reported by Borsellino et al. (1972) for reversal times. */
export const TYPICAL_GAMMA_SHAPE = [3, 6];

/** Coefficient of variation implied by that shape band: CV = 1/sqrt(k). */
export const TYPICAL_CV = [
  1 / Math.sqrt(TYPICAL_GAMMA_SHAPE[1]),
  1 / Math.sqrt(TYPICAL_GAMMA_SHAPE[0]),
];

/** Milliseconds in a minute, for the alternation-rate conversion. */
export const MS_PER_MINUTE = 60000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Split a trial into dominance epochs.
 *
 * The trial starts at 0 with percept 0. Each timestamp in `switchTimesMs` ends
 * the current epoch and starts the next with the other percept. The stretch
 * from the final switch to `totalMs` is *censored* — the percept had not
 * finished when the trial stopped — and is reported separately rather than
 * being averaged in, which would drag every mean down.
 *
 * @param {{ switchTimesMs: number[], totalMs: number }} input
 * @returns {{ epochs: Array<{startMs:number,endMs:number,durationMs:number,percept:0|1}>,
 *             censoredMs: number } | { error: string }}
 */
export function computeEpochs({ switchTimesMs, totalMs } = {}) {
  if (!Array.isArray(switchTimesMs)) {
    return { error: "Record some perceptual switches first." };
  }
  if (!isNum(totalMs) || totalMs <= 0) {
    return { error: "The trial has no length, so nothing can be measured." };
  }

  const times = switchTimesMs.filter(isNum);
  if (times.length !== switchTimesMs.length) {
    return { error: "One of the switch times is not a number." };
  }
  for (let i = 0; i < times.length; i += 1) {
    if (times[i] < 0) return { error: "Switch times cannot be negative." };
    if (i > 0 && times[i] < times[i - 1]) {
      return { error: "Switch times must be in the order they happened." };
    }
    if (times[i] > totalMs) {
      return { error: "A switch was recorded after the trial ended." };
    }
  }

  const epochs = [];
  let previous = 0;
  for (let i = 0; i < times.length; i += 1) {
    const durationMs = times[i] - previous;
    if (durationMs < MIN_EPOCH_MS) {
      return {
        error: `Two switches came ${Math.round(durationMs)} ms apart. Perception cannot reverse faster than about ${MIN_EPOCH_MS} ms — that reads as a double tap.`,
      };
    }
    epochs.push({ startMs: previous, endMs: times[i], durationMs, percept: i % 2 });
    previous = times[i];
  }

  return { epochs, censoredMs: totalMs - previous };
}

const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

/** Sample variance (n-1 denominator); returns 0 for a single value. */
function sampleVariance(values) {
  if (values.length < 2) return 0;
  const m = mean(values);
  return values.reduce((sum, value) => sum + (value - m) ** 2, 0) / (values.length - 1);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

/**
 * Full reversal statistics for one trial.
 *
 * @param {{ switchTimesMs:number[], totalMs:number }} input
 * @returns {object} statistics, or { error: string }
 */
export function analyzeReversals({ switchTimesMs, totalMs } = {}) {
  const split = computeEpochs({ switchTimesMs, totalMs });
  if (split.error) return { error: split.error };

  const { epochs, censoredMs } = split;
  if (epochs.length < MIN_SWITCHES) {
    return {
      error: `Only ${epochs.length} completed percept${epochs.length === 1 ? "" : "s"} so far. Keep watching and tap on at least ${MIN_SWITCHES} reversals before reading the statistics.`,
    };
  }

  const durations = epochs.map((epoch) => epoch.durationMs);
  const meanMs = mean(durations);
  if (!isNum(meanMs) || meanMs <= 0) {
    return { error: "The recorded durations do not add up to a measurable trial." };
  }

  const variance = sampleVariance(durations);
  const sd = Math.sqrt(variance);
  const cv = sd / meanMs;
  // Method of moments for a gamma: k = mean²/variance. Zero variance means a
  // perfectly metronomic tap pattern, which no real perception produces.
  const gammaShape = variance > 0 ? (meanMs * meanMs) / variance : null;
  const gammaScale = gammaShape ? meanMs / gammaShape : null;

  const first = durations.filter((_, index) => index % 2 === 0);
  const second = durations.filter((_, index) => index % 2 === 1);
  const meanFirst = first.length ? mean(first) : null;
  const meanSecond = second.length ? mean(second) : null;
  const dominanceRatio =
    meanFirst !== null && meanSecond !== null && meanFirst + meanSecond > 0
      ? meanFirst / (meanFirst + meanSecond)
      : null;

  const alternationsPerMinute = (epochs.length / totalMs) * MS_PER_MINUTE;

  return {
    epochs,
    censoredMs,
    totalMs,
    completed: epochs.length,
    meanMs,
    medianMs: median(durations),
    minMs: Math.min(...durations),
    maxMs: Math.max(...durations),
    sdMs: sd,
    cv,
    gammaShape,
    gammaScale,
    meanFirstMs: meanFirst,
    meanSecondMs: meanSecond,
    dominanceRatio,
    alternationsPerMinute,
    interpretation: interpretTrial({ meanMs, cv, gammaShape, dominanceRatio }),
  };
}

/**
 * Plain-language reading of the numbers against the published bands.
 *
 * @returns {Array<{ id:string, label:string, verdict:string, detail:string }>}
 */
export function interpretTrial({ meanMs, cv, gammaShape, dominanceRatio }) {
  const out = [];
  const [meanLow, meanHigh] = TYPICAL_MEAN_DOMINANCE_MS;

  out.push({
    id: "mean",
    label: "Mean dominance duration",
    verdict:
      meanMs < meanLow ? "Faster than typical" : meanMs > meanHigh ? "Slower than typical" : "Typical",
    detail: `Static ambiguous figures usually hold for ${meanLow / 1000}-${meanHigh / 1000} s per percept in untrained observers. Yours averaged ${(meanMs / 1000).toFixed(2)} s.`,
  });

  const [cvLow, cvHigh] = TYPICAL_CV;
  out.push({
    id: "cv",
    label: "Variability (CV)",
    verdict: cv < cvLow ? "Unusually regular" : cv > cvHigh ? "Unusually irregular" : "Typical",
    detail: `A gamma-distributed reversal process gives a coefficient of variation near ${cvLow.toFixed(2)}-${cvHigh.toFixed(2)}. Yours was ${cv.toFixed(2)}.`,
  });

  if (gammaShape !== null) {
    const [shapeLow, shapeHigh] = TYPICAL_GAMMA_SHAPE;
    out.push({
      id: "shape",
      label: "Gamma shape (k = mean²/variance)",
      verdict:
        gammaShape < shapeLow
          ? "Below the reported band"
          : gammaShape > shapeHigh
            ? "Above the reported band"
            : "Matches the literature",
      detail: `Borsellino et al. (1972) fitted shapes of about ${shapeLow}-${shapeHigh} to reversal times. Yours is ${gammaShape.toFixed(2)}.`,
    });
  }

  if (dominanceRatio !== null) {
    const skew = Math.abs(dominanceRatio - 0.5);
    out.push({
      id: "bias",
      label: "Percept bias",
      verdict: skew < 0.1 ? "Balanced" : skew < 0.2 ? "Mild bias" : "Strong bias",
      detail: `The first interpretation held ${(dominanceRatio * 100).toFixed(1)}% of the measured time. A perfectly unbiased observer sits at 50%.`,
    });
  }

  return out;
}

/**
 * Histogram of dominance durations, for plotting.
 *
 * @param {number[]} durationsMs
 * @param {number} binCount
 * @returns {Array<{ fromMs:number, toMs:number, count:number }>}
 */
export function buildHistogram(durationsMs, binCount = 8) {
  if (!Array.isArray(durationsMs) || durationsMs.length === 0) return [];
  const bins = Math.max(1, Math.min(30, Math.round(binCount)));
  const values = durationsMs.filter(isNum);
  if (values.length === 0) return [];
  const low = Math.min(...values);
  const high = Math.max(...values);
  const span = high - low;
  // All durations identical: one bin holding everything, no divide by zero.
  if (span <= 0) return [{ fromMs: low, toMs: low, count: values.length }];

  const width = span / bins;
  const buckets = Array.from({ length: bins }, (_, index) => ({
    fromMs: low + index * width,
    toMs: low + (index + 1) * width,
    count: 0,
  }));
  for (const value of values) {
    const index = Math.min(bins - 1, Math.floor((value - low) / width));
    buckets[index].count += 1;
  }
  return buckets;
}

/** Seconds, to two decimals, from milliseconds. Returns null for bad input. */
export function toSeconds(ms) {
  return isNum(ms) ? ms / 1000 : null;
}
