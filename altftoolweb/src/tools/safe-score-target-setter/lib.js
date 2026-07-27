/**
 * Safe score target setter.
 *
 * An expected cutoff is a point estimate, and a point estimate is exactly the
 * wrong thing to aim at: land on it and you clear the list roughly half the
 * time. The fix is a buffer sized from how much the cutoff has actually moved
 * between years.
 *
 * Method
 * ------
 * 1. Take the last few years' cutoffs and compute the sample standard
 *    deviation s = sqrt( sum (x - mean)^2 / (n - 1) ). The (n - 1) denominator
 *    is Bessel's correction, which makes s an unbiased estimate of the spread
 *    of the underlying process from a small sample.
 * 2. Treat this year's cutoff as roughly normal around the expected value with
 *    that spread. Then a target of expected + z * s clears the actual cutoff
 *    with probability equal to the one-sided normal confidence attached to z.
 * 3. Convert the target into attempts. With m marks per correct answer, a
 *    penalty p per wrong answer and an accuracy a (as a fraction), the expected
 *    net score per attempted question is  a*m - (1 - a)*p. Dividing the target
 *    by that gives the number of questions you must attempt.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/**
 * One-sided standard-normal quantiles z such that P(Z < z) equals the stated
 * confidence. Values are the standard table entries rounded to four decimals.
 */
export const RISK_PROFILES = {
  aggressive: {
    id: "aggressive",
    label: "Aggressive — just clear it",
    confidence: 0.8,
    z: 0.8416,
    blurb: "Smallest buffer. Fine when the cutoff has barely moved in years.",
  },
  balanced: {
    id: "balanced",
    label: "Balanced — one bad year of margin",
    confidence: 0.9,
    z: 1.2816,
    blurb: "The default most aspirants should plan around.",
  },
  safe: {
    id: "safe",
    label: "Safe — clears all but a shock year",
    confidence: 0.95,
    z: 1.6449,
    blurb: "Absorbs an easy paper that pushes the cutoff up.",
  },
  verySafe: {
    id: "verySafe",
    label: "Very safe — last attempt, no second chance",
    confidence: 0.99,
    z: 2.3263,
    blurb: "Use when age limit or attempt limit means this is the final try.",
  },
};

/**
 * When there is no usable cutoff history, fall back to a buffer expressed as a
 * fraction of total marks. 3% of the paper is a conventional planning cushion
 * used in coaching guidance; it is a rule of thumb, not a statistic.
 */
export const FALLBACK_SPREAD_FRACTION_OF_MAX = 0.03;

/** At least two past cutoffs are needed before a spread can be computed. */
export const MIN_HISTORY_POINTS = 2;

/** Sanity ceilings so absurd input produces a message, not a nonsense number. */
export const MAX_MARKS_LIMIT = 2000;
export const MAX_QUESTIONS_LIMIT = 1000;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round(v * 100) / 100;

/**
 * Parse a free-text list of past cutoffs into numbers.
 *
 * @param {string} raw comma, space or newline separated
 * @returns {number[]} finite numbers only, in the order given
 */
export function parseCutoffList(raw) {
  if (typeof raw !== "string") return [];
  return raw
    .split(/[\s,;]+/)
    .map((token) => Number(token.trim()))
    .filter((value) => Number.isFinite(value) && value >= 0);
}

/**
 * Mean and sample standard deviation of a list of cutoffs.
 *
 * @param {number[]} values
 * @returns {{ count: number, mean: number|null, sd: number|null, min: number|null, max: number|null, range: number|null }}
 */
export function cutoffStats(values) {
  const list = Array.isArray(values) ? values.filter(isNum) : [];
  const count = list.length;
  if (count === 0) return { count: 0, mean: null, sd: null, min: null, max: null, range: null };

  const mean = list.reduce((sum, v) => sum + v, 0) / count;
  const min = Math.min(...list);
  const max = Math.max(...list);

  if (count < MIN_HISTORY_POINTS) {
    return { count, mean: round2(mean), sd: null, min, max, range: round2(max - min) };
  }

  const variance =
    list.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (count - 1); // Bessel's correction
  return {
    count,
    mean: round2(mean),
    sd: round2(Math.sqrt(variance)),
    min,
    max,
    range: round2(max - min),
  };
}

/**
 * Buffered target score.
 *
 * @param {object} input
 * @param {number} input.expectedCutoff this year's expected cutoff, in marks
 * @param {number} input.maxMarks total marks in the paper
 * @param {string} input.riskId key of RISK_PROFILES
 * @param {number|null} [input.spread] standard deviation of past cutoffs; when
 *   null or missing, a fallback of 3% of total marks is used
 * @returns {object} result, or { error }
 */
export function computeSafeTarget({ expectedCutoff, maxMarks, riskId, spread }) {
  const profile = RISK_PROFILES[riskId];
  if (!profile) return { error: "Choose a risk appetite." };
  if (!isNum(maxMarks) || maxMarks <= 0) return { error: "Enter the total marks in the paper." };
  if (maxMarks > MAX_MARKS_LIMIT) {
    return { error: `Total marks above ${MAX_MARKS_LIMIT} look like a typing slip.` };
  }
  if (!isNum(expectedCutoff) || expectedCutoff < 0) {
    return { error: "Enter the expected cutoff as a number of marks, zero or above." };
  }
  if (expectedCutoff > maxMarks) {
    return { error: "The expected cutoff cannot be higher than the total marks." };
  }

  const usedFallback = !isNum(spread) || spread <= 0;
  const spreadUsed = usedFallback ? maxMarks * FALLBACK_SPREAD_FRACTION_OF_MAX : spread;

  const rawBuffer = profile.z * spreadUsed;
  const rawTarget = expectedCutoff + rawBuffer;
  const cappedAtMax = rawTarget > maxMarks;
  const target = cappedAtMax ? maxMarks : rawTarget;
  const buffer = target - expectedCutoff;

  return {
    profile,
    expectedCutoff: round2(expectedCutoff),
    maxMarks: round2(maxMarks),
    spreadUsed: round2(spreadUsed),
    usedFallback,
    buffer: round2(buffer),
    bufferPercentOfMax: round2((buffer / maxMarks) * 100),
    target: round2(target),
    targetPercentOfMax: round2((target / maxMarks) * 100),
    /** Marks still available above the target — the headroom left in the paper. */
    headroom: round2(maxMarks - target),
    cappedAtMax,
    confidencePercent: round2(profile.confidence * 100),
  };
}

/**
 * Attempts and accuracy needed to reach a target under negative marking.
 *
 * @param {object} input
 * @param {number} input.target marks to reach
 * @param {number} input.totalQuestions questions in the paper
 * @param {number} input.marksPerCorrect
 * @param {number} input.negativeMark marks deducted per wrong answer (positive number)
 * @param {number} input.accuracyPercent accuracy on attempted questions, 0-100
 * @returns {object} plan, or { error }
 */
export function attemptPlan({
  target,
  totalQuestions,
  marksPerCorrect,
  negativeMark,
  accuracyPercent,
}) {
  if (!isNum(target) || target < 0) return { error: "The target must be zero or more marks." };
  if (!isNum(totalQuestions) || totalQuestions <= 0) {
    return { error: "Enter how many questions the paper has." };
  }
  if (totalQuestions > MAX_QUESTIONS_LIMIT) {
    return { error: `A paper with more than ${MAX_QUESTIONS_LIMIT} questions looks like a slip.` };
  }
  if (!isNum(marksPerCorrect) || marksPerCorrect <= 0) {
    return { error: "Marks per correct answer must be greater than zero." };
  }
  if (!isNum(negativeMark) || negativeMark < 0) {
    return { error: "Negative marking cannot be less than zero. Use 0 if there is no penalty." };
  }
  if (!isNum(accuracyPercent) || accuracyPercent < 0 || accuracyPercent > 100) {
    return { error: "Accuracy must be between 0% and 100%." };
  }

  const accuracy = accuracyPercent / 100;
  const netPerAttempt = accuracy * marksPerCorrect - (1 - accuracy) * negativeMark;

  /** Accuracy at which attempting one more question breaks even:
   *  a*m - (1-a)*p = 0  =>  a = p / (m + p). */
  const breakEvenAccuracyPercent =
    marksPerCorrect + negativeMark > 0
      ? round2((negativeMark / (marksPerCorrect + negativeMark)) * 100)
      : 0;

  if (netPerAttempt <= 0) {
    return {
      error: `At ${round2(accuracyPercent)}% accuracy the penalty cancels the gain — every extra attempt loses marks. You need above ${breakEvenAccuracyPercent}% accuracy for attempting to pay.`,
      breakEvenAccuracyPercent,
    };
  }

  const attemptsNeeded = Math.ceil(target / netPerAttempt - 1e-9);
  const feasible = attemptsNeeded <= totalQuestions;
  const attempts = Math.min(attemptsNeeded, totalQuestions);
  const correct = Math.round(attempts * accuracy);
  const wrong = attempts - correct;
  const projectedScore = correct * marksPerCorrect - wrong * negativeMark;

  /** Best score reachable if every remaining question is also attempted at the
   *  same accuracy — the ceiling this accuracy can deliver. */
  const maxCorrect = Math.round(totalQuestions * accuracy);
  const maxReachable = maxCorrect * marksPerCorrect - (totalQuestions - maxCorrect) * negativeMark;

  /** Accuracy required if the whole paper is attempted:
   *  target = n*(a*m) - n*(1-a)*p  =>  a = (target/n + p) / (m + p). */
  const requiredAccuracyFullPaper =
    marksPerCorrect + negativeMark > 0
      ? ((target / totalQuestions + negativeMark) / (marksPerCorrect + negativeMark)) * 100
      : 0;

  return {
    netPerAttempt: round2(netPerAttempt),
    breakEvenAccuracyPercent,
    attemptsNeeded,
    attempts,
    correct,
    wrong,
    skipped: totalQuestions - attempts,
    projectedScore: round2(projectedScore),
    feasible,
    maxReachable: round2(maxReachable),
    requiredAccuracyFullPaper: round2(
      Math.min(100, Math.max(0, requiredAccuracyFullPaper)),
    ),
  };
}

/**
 * The same expected cutoff and spread shown at every risk level, so the cost of
 * extra safety is visible in marks.
 *
 * @param {number} expectedCutoff
 * @param {number} maxMarks
 * @param {number|null} spread
 * @returns {Array<object>}
 */
export function buildRiskLadder(expectedCutoff, maxMarks, spread) {
  return Object.values(RISK_PROFILES)
    .map((profile) => {
      const row = computeSafeTarget({
        expectedCutoff,
        maxMarks,
        riskId: profile.id,
        spread,
      });
      if (row.error) return null;
      return {
        id: profile.id,
        label: profile.label,
        confidencePercent: row.confidencePercent,
        buffer: row.buffer,
        target: row.target,
        targetPercentOfMax: row.targetPercentOfMax,
      };
    })
    .filter(Boolean);
}
