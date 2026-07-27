/**
 * The normalization formulas used by Indian recruitment and entrance exams, worked
 * through step by step.
 *
 * Why normalization exists: when a test is held in several shifts on different question
 * papers, the papers are never exactly equally hard. Comparing raw marks across shifts
 * would reward whoever happened to sit the easier paper, so the marks of each shift are
 * mapped onto a common scale first.
 *
 * Four methods are implemented, each exactly as published:
 *
 * 1. SSC LINEAR EQUATING. The Staff Selection Commission maps two reference points of a
 *    shift onto the corresponding all-shift points — the shift's "mean plus one standard
 *    deviation" point and the average of its top 0.1% of candidates:
 *
 *      X̂ = ((M̄t − M̄tg) / (M̄i − M̄ig)) × (X − M̄ig) + M̄tg
 *
 *    M̄t  = average marks of the top 0.1% of candidates across all shifts
 *    M̄tg = mean + standard deviation of the marks of all candidates across all shifts
 *    M̄i  = average marks of the top 0.1% of candidates in this shift
 *    M̄ig = mean + standard deviation of the marks of candidates in this shift
 *    X   = the candidate's raw marks
 *
 * 2. Z-SCORE (STANDARD SCORE) EQUATING. Express the mark as standard deviations from the
 *    shift mean, then re-express it on the all-shift scale:
 *
 *      Z = (X − μi) / σi        and        X̂ = μg + Z × σg
 *
 *    The T-score, 50 + 10Z, is the same figure on a 50/10 scale. Where the marks are
 *    roughly normal, the percentile is Φ(Z) × 100.
 *
 * 3. NTA PERCENTILE. The National Testing Agency does not scale marks at all; it converts
 *    each session's marks to a percentile within that session:
 *
 *      NTA score = 100 × (candidates in the session scoring equal to or below you)
 *                        / (total candidates in that session)
 *
 *    The topper of every session therefore gets 100, and percentiles from different
 *    sessions are merged to produce the final rank.
 *
 * 4. MIN-MAX SCALING. Plain linear rescaling of a range onto another range, used to put
 *    raw marks on a common 0-100 scale:
 *
 *      X̂ = (X − min) / (max − min) × (targetMax − targetMin) + targetMin
 *
 * Nothing here predicts a cut-off; it reproduces the published arithmetic on your numbers.
 */

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round = (value, dp = 2) => {
  const factor = 10 ** dp;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

/**
 * Standard normal cumulative distribution, via the Abramowitz & Stegun 7.1.26
 * approximation of the error function (absolute error below 1.5e-7).
 */
export function normalCdf(z) {
  if (!isNum(z)) return NaN;
  const p = 0.3275911;
  const a = [0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429];
  const x = z / Math.SQRT2;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + p * ax);
  const poly = a[0] * t + a[1] * t ** 2 + a[2] * t ** 3 + a[3] * t ** 4 + a[4] * t ** 5;
  const erf = sign * (1 - poly * Math.exp(-ax * ax));
  return 0.5 * (1 + erf);
}

export const METHODS = [
  {
    key: "ssc",
    name: "SSC linear equating",
    formula: "X̂ = ((M̄t − M̄tg) ÷ (M̄i − M̄ig)) × (X − M̄ig) + M̄tg",
    used: "SSC CGL, CHSL, CPO, MTS and other multi-shift SSC papers.",
  },
  {
    key: "zscore",
    name: "Z-score equating",
    formula: "Z = (X − μi) ÷ σi, then X̂ = μg + Z × σg",
    used: "Many state PSCs, university entrance tests and internal moderation.",
  },
  {
    key: "nta",
    name: "NTA percentile",
    formula: "NTA score = 100 × (candidates at or below you) ÷ (candidates in the session)",
    used: "JEE Main, CUET and other NTA multi-session tests.",
  },
  {
    key: "minmax",
    name: "Min-max scaling",
    formula: "X̂ = (X − min) ÷ (max − min) × (targetMax − targetMin) + targetMin",
    used: "Putting raw marks from different papers on a common 0-100 scale.",
  },
];

/**
 * SSC linear equating.
 * @returns {{steps: Array, result: number}|{error: string}}
 */
export function explainSsc({
  raw,
  shiftMean,
  shiftSd,
  shiftTopMean,
  globalMean,
  globalSd,
  globalTopMean,
} = {}) {
  const values = { raw, shiftMean, shiftSd, shiftTopMean, globalMean, globalSd, globalTopMean };
  for (const [key, value] of Object.entries(values)) {
    if (!isNum(value)) return { error: `Enter a number for every field — ${key} is missing or invalid.` };
  }
  if (shiftSd < 0 || globalSd < 0) return { error: "A standard deviation cannot be negative." };

  const shiftAnchor = round(shiftMean + shiftSd, 4); // M̄ig
  const globalAnchor = round(globalMean + globalSd, 4); // M̄tg
  const denominator = round(shiftTopMean - shiftAnchor, 6);
  if (denominator === 0) {
    return {
      error:
        "The shift's top-0.1% average equals its mean plus standard deviation, so the formula divides by zero. Check the shift statistics.",
    };
  }

  const numerator = round(globalTopMean - globalAnchor, 4);
  const ratio = numerator / denominator;
  const shifted = round(raw - shiftAnchor, 4);
  const result = round(ratio * shifted + globalAnchor, 2);

  return {
    result,
    /** Positive means the shift was harder than average and the mark was raised. */
    adjustment: round(result - raw, 2),
    steps: [
      {
        label: "Shift anchor M̄ig = mean + standard deviation of this shift",
        expression: `${shiftMean} + ${shiftSd}`,
        value: shiftAnchor,
      },
      {
        label: "All-shift anchor M̄tg = mean + standard deviation of everyone",
        expression: `${globalMean} + ${globalSd}`,
        value: globalAnchor,
      },
      {
        label: "Stretch factor = (M̄t − M̄tg) ÷ (M̄i − M̄ig)",
        expression: `(${globalTopMean} − ${globalAnchor}) ÷ (${shiftTopMean} − ${shiftAnchor}) = ${numerator} ÷ ${denominator}`,
        value: round(ratio, 4),
      },
      {
        label: "Distance of your mark above the shift anchor",
        expression: `${raw} − ${shiftAnchor}`,
        value: shifted,
      },
      {
        label: "Normalized mark = stretch factor × distance + all-shift anchor",
        expression: `${round(ratio, 4)} × ${shifted} + ${globalAnchor}`,
        value: result,
      },
    ],
  };
}

/** Z-score equating, with the T-score and the normal-curve percentile. */
export function explainZScore({ raw, shiftMean, shiftSd, globalMean, globalSd } = {}) {
  const values = { raw, shiftMean, shiftSd, globalMean, globalSd };
  for (const [key, value] of Object.entries(values)) {
    if (!isNum(value)) return { error: `Enter a number for every field — ${key} is missing or invalid.` };
  }
  if (shiftSd <= 0) {
    return { error: "The shift standard deviation must be greater than zero, or every candidate scored the same." };
  }
  if (globalSd < 0) return { error: "A standard deviation cannot be negative." };

  const deviation = round(raw - shiftMean, 4);
  const z = round(deviation / shiftSd, 4);
  const result = round(globalMean + z * globalSd, 2);
  const tScore = round(50 + 10 * z, 2);
  const percentile = round(normalCdf(z) * 100, 2);

  return {
    result,
    z,
    tScore,
    percentile,
    adjustment: round(result - raw, 2),
    steps: [
      {
        label: "Distance from your shift's mean",
        expression: `${raw} − ${shiftMean}`,
        value: deviation,
      },
      {
        label: "Z-score = distance ÷ shift standard deviation",
        expression: `${deviation} ÷ ${shiftSd}`,
        value: z,
      },
      {
        label: "Normalized mark = all-shift mean + Z × all-shift standard deviation",
        expression: `${globalMean} + ${z} × ${globalSd}`,
        value: result,
      },
      {
        label: "T-score on a 50/10 scale = 50 + 10Z",
        expression: `50 + 10 × ${z}`,
        value: tScore,
      },
      {
        label: "Percentile if marks follow a normal curve = Φ(Z) × 100",
        expression: `Φ(${z}) × 100`,
        value: percentile,
      },
    ],
  };
}

/** NTA percentile within a session. */
export function explainNtaPercentile({ candidatesAtOrBelow, totalCandidates } = {}) {
  if (!isNum(candidatesAtOrBelow) || !isNum(totalCandidates)) {
    return { error: "Enter both candidate counts as numbers." };
  }
  if (totalCandidates <= 0) return { error: "The session must have at least one candidate." };
  if (candidatesAtOrBelow < 0) return { error: "The count of candidates cannot be negative." };
  if (candidatesAtOrBelow > totalCandidates) {
    return { error: "The candidates at or below you cannot exceed the total in the session." };
  }

  const percentile = round((candidatesAtOrBelow / totalCandidates) * 100, 6);
  const above = Math.round(totalCandidates - candidatesAtOrBelow);
  const projectedRank = above + 1;

  return {
    result: round(percentile, 4),
    percentile: round(percentile, 4),
    candidatesAbove: above,
    projectedRank,
    steps: [
      {
        label: "Candidates in the session scoring at or below you",
        expression: `${candidatesAtOrBelow} of ${totalCandidates}`,
        value: candidatesAtOrBelow,
      },
      {
        label: "NTA score = 100 × that count ÷ total candidates in the session",
        expression: `100 × ${candidatesAtOrBelow} ÷ ${totalCandidates}`,
        value: round(percentile, 4),
      },
      {
        label: "Candidates ahead of you in this session",
        expression: `${totalCandidates} − ${candidatesAtOrBelow}`,
        value: above,
      },
      {
        label: "Session rank",
        expression: `${above} + 1`,
        value: projectedRank,
      },
    ],
  };
}

/** Min-max linear rescaling onto a target range. */
export function explainMinMax({ raw, min, max, targetMin = 0, targetMax = 100 } = {}) {
  const values = { raw, min, max, targetMin, targetMax };
  for (const [key, value] of Object.entries(values)) {
    if (!isNum(value)) return { error: `Enter a number for every field — ${key} is missing or invalid.` };
  }
  if (max === min) {
    return { error: "The highest and lowest marks are identical, so there is no range to scale across." };
  }
  if (max < min) return { error: "The highest mark must be greater than the lowest mark." };
  if (targetMax === targetMin) return { error: "The target range must have a width greater than zero." };

  const span = round(max - min, 6);
  const position = round(raw - min, 6);
  const fraction = position / span;
  const result = round(fraction * (targetMax - targetMin) + targetMin, 2);

  return {
    result,
    fraction: round(fraction, 4),
    /** Position within the observed range, expressed as a percentage. */
    fractionPercent: round(fraction * 100, 2),
    /** True when the mark sits outside the observed range, so the result is extrapolated. */
    outsideRange: raw < min || raw > max,
    steps: [
      {
        label: "Width of the observed range",
        expression: `${max} − ${min}`,
        value: span,
      },
      {
        label: "Your position within that range",
        expression: `${raw} − ${min}`,
        value: position,
      },
      {
        label: "Position as a fraction of the range",
        expression: `${position} ÷ ${span}`,
        value: round(fraction, 4),
      },
      {
        label: "Scaled onto the target range",
        expression: `${round(fraction, 4)} × (${targetMax} − ${targetMin}) + ${targetMin}`,
        value: result,
      },
    ],
  };
}

/**
 * Dispatch to the requested method.
 * @param {"ssc"|"zscore"|"nta"|"minmax"} method
 * @param {object} values
 */
export function explain(method, values = {}) {
  if (method === "ssc") return explainSsc(values);
  if (method === "zscore") return explainZScore(values);
  if (method === "nta") return explainNtaPercentile(values);
  if (method === "minmax") return explainMinMax(values);
  return { error: "Choose one of the four normalization methods." };
}
