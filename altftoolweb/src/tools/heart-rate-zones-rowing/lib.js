/**
 * Rowing training bands for the erg and the water.
 *
 * Rowing does not use the generic five-zone model. British Rowing and most
 * club programmes use named bands — UT2, UT1, AT, TR, AN — expressed as
 * percentages of maximum heart rate, each with its own stroke rate window.
 *
 * The 500 m split guidance uses the standard coaching offsets from 2 km test
 * pace: UT2 sits about 20–24 seconds slower per 500 m than 2 km pace, UT1
 * 12–16 seconds slower, AT 8–10, TR 4–6, and AN at or inside 2 km pace.
 */

/** Age-predicted maximum heart rate formulas. */
export const MAX_HR_FORMULAS = [
  {
    id: "tanaka",
    label: "Tanaka",
    expression: "208 − 0.7 × age",
    // Tanaka, Monahan & Seals (2001), meta-analysis of 351 studies.
    compute: (age) => 208 - 0.7 * age,
  },
  {
    id: "fox",
    label: "Fox",
    expression: "220 − age",
    // Fox, Naughton & Haskell (1971).
    compute: (age) => 220 - age,
  },
  {
    id: "gulati",
    label: "Gulati (women)",
    expression: "206 − 0.88 × age",
    // Gulati et al. (2010), derived from 5,437 women.
    compute: (age) => 206 - 0.88 * age,
  },
];

export const ZONE_METHODS = [
  { id: "pctmax", label: "% of maximum heart rate" },
  { id: "karvonen", label: "Karvonen (heart rate reserve)" },
];

/**
 * British Rowing style training bands.
 * `low`/`high` are fractions of maximum heart rate (or of heart rate reserve
 * under Karvonen). `splitAdd*` are seconds per 500 m to add to 2 km test pace.
 */
export const ROWING_BANDS = [
  {
    id: "ut2",
    name: "UT2",
    title: "Utilisation 2 — steady state",
    low: 0.6,
    high: 0.7,
    rateLow: 18,
    rateHigh: 20,
    splitAddFast: 20,
    splitAddSlow: 24,
    purpose:
      "The volume band. Long, conversational pieces that build aerobic capacity and technical consistency.",
    session: "40–90 min continuous, or 3 × 20 min",
  },
  {
    id: "ut1",
    name: "UT1",
    title: "Utilisation 1 — extensive aerobic",
    low: 0.7,
    high: 0.8,
    rateLow: 20,
    rateHigh: 24,
    splitAddFast: 12,
    splitAddSlow: 16,
    purpose: "Firmer steady work. Still aerobic, but with enough load to lift the ceiling of UT2.",
    session: "30–60 min, or 4 × 10 min with 2 min rest",
  },
  {
    id: "at",
    name: "AT",
    title: "Anaerobic threshold",
    low: 0.8,
    high: 0.85,
    rateLow: 24,
    rateHigh: 28,
    splitAddFast: 8,
    splitAddSlow: 10,
    purpose: "Right at the tipping point where lactate starts to accumulate. Raises sustainable pace.",
    session: "3 × 10 min or 4 × 8 min, 3 min rest",
  },
  {
    id: "tr",
    name: "TR",
    title: "Transportation — oxygen transport",
    low: 0.85,
    high: 0.92,
    rateLow: 28,
    rateHigh: 32,
    splitAddFast: 4,
    splitAddSlow: 6,
    purpose: "VO2 max work, close to race pace. Heavy breathing, tightly controlled volume.",
    session: "5 × 4 min or 8 × 500 m, full recovery",
  },
  {
    id: "an",
    name: "AN",
    title: "Anaerobic",
    low: 0.92,
    high: 1,
    rateLow: 32,
    rateHigh: 38,
    splitAddFast: -2,
    splitAddSlow: 2,
    purpose: "Race starts, sprints and lactate tolerance. Heart rate lags, so judge it by pace.",
    session: "6 × 250 m or 8 × 40 s, long rests",
  },
];

export const AGE_MIN = 10;
export const AGE_MAX = 100;
export const REST_HR_MIN = 30;
export const REST_HR_MAX = 120;
export const MAX_HR_MIN = 100;
export const MAX_HR_MAX = 230;
/** 2 km test split limits, seconds per 500 m. */
export const SPLIT_SEC_MIN = 80;
export const SPLIT_SEC_MAX = 180;

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Age-predicted maximum heart rate. */
export function estimateMaxHr(age, formulaId = "tanaka") {
  const formula = MAX_HR_FORMULAS.find((entry) => entry.id === formulaId);
  if (!formula || !isNumber(age) || age < AGE_MIN || age > AGE_MAX) return NaN;
  return formula.compute(age);
}

/** Heart rate for a fraction of intensity, by method. */
export function targetBpm(fraction, maxHr, restHr, method) {
  if (!isNumber(fraction) || !isNumber(maxHr)) return NaN;
  if (method === "karvonen") {
    if (!isNumber(restHr) || maxHr <= restHr) return NaN;
    return restHr + fraction * (maxHr - restHr);
  }
  return fraction * maxHr;
}

/** Seconds to a m:ss split string. */
export function formatSplit(seconds) {
  if (!isNumber(seconds) || seconds <= 0) return "—";
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

/** Minutes + seconds fields to total seconds. */
export function splitToSeconds(minutes, seconds) {
  const m = isNumber(minutes) ? minutes : NaN;
  const s = isNumber(seconds) ? seconds : 0;
  if (!isNumber(m)) return NaN;
  return m * 60 + s;
}

/** Total 2 km time from a 500 m split. A 2 km piece is four 500 m splits. */
export const SPLITS_PER_2K = 4;

/**
 * @param {object} input
 * @param {number} [input.age]
 * @param {number} [input.restHr]
 * @param {string} [input.formulaId]
 * @param {string} [input.method] "pctmax" | "karvonen"
 * @param {number} [input.maxHrOverride]
 * @param {number} [input.splitSec] 2 km test pace, seconds per 500 m
 * @returns {object} result or { error }
 */
export function computeRowingBands({
  age,
  restHr,
  formulaId = "tanaka",
  method = "pctmax",
  maxHrOverride,
  splitSec,
} = {}) {
  const useOverride = isNumber(maxHrOverride) && maxHrOverride > 0;

  if (useOverride) {
    if (maxHrOverride < MAX_HR_MIN || maxHrOverride > MAX_HR_MAX) {
      return {
        error: `A measured maximum heart rate should be between ${MAX_HR_MIN} and ${MAX_HR_MAX} bpm.`,
      };
    }
  } else if (!isNumber(age) || age < AGE_MIN || age > AGE_MAX) {
    return {
      error: `Enter an age between ${AGE_MIN} and ${AGE_MAX}, or a maximum heart rate you have measured.`,
    };
  }

  const maxHr = useOverride ? maxHrOverride : estimateMaxHr(age, formulaId);
  if (!isNumber(maxHr) || maxHr <= 0) {
    return { error: "Could not work out a maximum heart rate from that input." };
  }

  if (method === "karvonen") {
    if (!isNumber(restHr) || restHr < REST_HR_MIN || restHr > REST_HR_MAX) {
      return {
        error: `Karvonen needs a resting heart rate between ${REST_HR_MIN} and ${REST_HR_MAX} bpm — take it lying down before you get up.`,
      };
    }
    if (restHr >= maxHr) {
      return { error: "Resting heart rate must be lower than maximum heart rate." };
    }
  }

  let splitOk = false;
  if (isNumber(splitSec) && splitSec > 0) {
    if (splitSec < SPLIT_SEC_MIN || splitSec > SPLIT_SEC_MAX) {
      return {
        error: `A 2 km test split should be between ${formatSplit(SPLIT_SEC_MIN)} and ${formatSplit(
          SPLIT_SEC_MAX,
        )} per 500 m.`,
      };
    }
    splitOk = true;
  }

  const bands = ROWING_BANDS.map((band) => ({
    ...band,
    lowBpm: Math.round(targetBpm(band.low, maxHr, restHr, method)),
    highBpm: Math.round(targetBpm(band.high, maxHr, restHr, method)),
    fastSplitSec: splitOk ? splitSec + band.splitAddFast : NaN,
    slowSplitSec: splitOk ? splitSec + band.splitAddSlow : NaN,
  }));

  const formula = MAX_HR_FORMULAS.find((entry) => entry.id === formulaId);

  return {
    maxHr,
    maxHrRounded: Math.round(maxHr),
    usedMeasuredMax: useOverride,
    formulaLabel: useOverride ? "Measured in a test" : formula ? formula.label : "",
    formulaExpression: useOverride ? "" : formula ? formula.expression : "",
    method,
    restHr: method === "karvonen" ? restHr : null,
    reserve: method === "karvonen" ? maxHr - restHr : null,
    splitOk,
    splitSec: splitOk ? splitSec : NaN,
    time2kSec: splitOk ? splitSec * SPLITS_PER_2K : NaN,
    bands,
  };
}
