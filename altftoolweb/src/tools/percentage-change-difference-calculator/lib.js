/**
 * Percentage change, percentage difference and the other four questions people
 * actually mean when they say "percentage".
 *
 * These are distinct formulas and mixing them up is the usual source of a wrong
 * answer:
 *
 *   Percentage change      (new - old) / |old| x 100
 *     Directional. Has a reference point: the OLD value is the baseline, so the
 *     absolute value in the denominator keeps the sign of the change correct
 *     even when the baseline is negative. Undefined when old is 0, because
 *     nothing is a finite multiple of nothing.
 *
 *   Percentage difference  |a - b| / ((a + b) / 2) x 100
 *     Symmetric. No baseline — used when neither value is "before". Divides by
 *     the arithmetic mean, so swapping a and b gives the same answer. Undefined
 *     when the mean is 0.
 *
 *   Percentage of          value x percent / 100
 *   What percent           part / whole x 100          (undefined when whole = 0)
 *   Apply a change         value x (1 + percent / 100)
 *   Percentage points      b - a, where a and b are themselves percentages
 *     A rise from 45% to 60% is +15 percentage points but a +33.3% relative
 *     change. News reports conflate the two constantly.
 *
 * Every function is total: invalid input returns { error }, never NaN.
 */

export const MODES = [
  { id: "change", label: "Percentage change", hint: "From an old value to a new value" },
  { id: "difference", label: "Percentage difference", hint: "Between two values with no baseline" },
  { id: "of", label: "Percent of a number", hint: "What is 15% of 2,000?" },
  { id: "what-percent", label: "X is what percent of Y", hint: "300 is what percent of 2,000?" },
  { id: "apply", label: "Increase or decrease by", hint: "Add or take off a percentage" },
  { id: "points", label: "Percentage points", hint: "Compare two percentages correctly" },
];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/** Keep 6 significant decimals; enough for currency and for ratios alike. */
const round = (v, dp = 6) => {
  if (!Number.isFinite(v)) return v;
  const factor = 10 ** dp;
  const scaled = (v + Number.EPSILON) * factor;
  if (!Number.isFinite(scaled)) return v;
  return Math.round(scaled) / factor;
};

/**
 * IEEE 754 doubles top out near 1.8e308, so an extreme ratio can overflow to
 * Infinity. Any result that does is reported as out of range rather than shown.
 */
const OVERFLOW_ERROR = {
  error:
    "These numbers are too far apart to express as a percentage without overflowing. Scale them down and try again.",
};

const allFinite = (...values) => values.every((v) => v === null || Number.isFinite(v));

/**
 * Directional change from `from` to `to`.
 * Denominator uses |from| so the sign of the result reflects real direction.
 */
export function percentageChange({ from, to }) {
  if (!isNum(from) || !isNum(to)) return { error: "Enter a number in both fields." };
  if (from === 0) {
    return {
      error:
        "Percentage change from zero is undefined — there is no baseline to grow from. Use the absolute change instead.",
    };
  }

  const absoluteChange = round(to - from);
  const changePct = round(((to - from) / Math.abs(from)) * 100);
  const direction = absoluteChange > 0 ? "increase" : absoluteChange < 0 ? "decrease" : "no change";

  // The change that takes you back: measured against the NEW value.
  const reversePct = to === 0 ? null : round(((from - to) / Math.abs(to)) * 100);
  // A multiplier only makes sense when both values share a sign.
  const multiplier = from > 0 === to > 0 && to !== 0 ? round(to / from) : null;
  const ofOriginal = round((to / from) * 100);

  if (!allFinite(absoluteChange, changePct, reversePct, multiplier, ofOriginal)) {
    return OVERFLOW_ERROR;
  }

  return {
    from,
    to,
    absoluteChange,
    changePct,
    direction,
    reversePct,
    multiplier,
    ofOriginal,
  };
}

/** Symmetric difference: divides by the mean, so order does not matter. */
export function percentageDifference({ a, b }) {
  if (!isNum(a) || !isNum(b)) return { error: "Enter a number in both fields." };
  const mean = (a + b) / 2;
  if (mean === 0) {
    return {
      error:
        "Percentage difference needs a non-zero average of the two values. With an average of zero there is nothing to measure the gap against.",
    };
  }

  const absoluteDifference = round(Math.abs(a - b));
  const differencePct = round((Math.abs(a - b) / Math.abs(mean)) * 100);
  // Shown alongside so the asymmetry between the two framings is visible.
  const aRelativeToB = b === 0 ? null : round(((a - b) / Math.abs(b)) * 100);
  const bRelativeToA = a === 0 ? null : round(((b - a) / Math.abs(a)) * 100);

  if (!allFinite(absoluteDifference, differencePct, aRelativeToB, bRelativeToA)) {
    return OVERFLOW_ERROR;
  }

  return {
    a,
    b,
    mean: round(mean),
    absoluteDifference,
    differencePct,
    aRelativeToB,
    bRelativeToA,
  };
}

/** value x percent / 100 */
export function percentOf({ percent, value }) {
  if (!isNum(percent) || !isNum(value)) return { error: "Enter a number in both fields." };
  const result = round((value * percent) / 100);
  const remainder = round(value - result);
  if (!allFinite(result, remainder)) return OVERFLOW_ERROR;
  return { percent, value, result, remainder };
}

/** part / whole x 100 */
export function whatPercent({ part, whole }) {
  if (!isNum(part) || !isNum(whole)) return { error: "Enter a number in both fields." };
  if (whole === 0) {
    return { error: "Nothing can be a percentage of zero — the whole must not be zero." };
  }
  const result = round((part / whole) * 100);
  if (!allFinite(result)) return OVERFLOW_ERROR;
  return { part, whole, result, remainderPct: round(100 - result), rest: round(whole - part) };
}

/** value x (1 + percent/100). Negative percent takes the amount off. */
export function applyPercent({ value, percent }) {
  if (!isNum(value) || !isNum(percent)) return { error: "Enter a number in both fields." };
  if (percent < -100) {
    return { error: "A decrease of more than 100% would take the value below zero and reverse it." };
  }
  const change = round((value * percent) / 100);
  const result = round(value + change);
  if (!allFinite(change, result)) return OVERFLOW_ERROR;
  return {
    value,
    percent,
    change,
    result,
    direction: percent > 0 ? "increase" : percent < 0 ? "decrease" : "no change",
  };
}

/**
 * Compare two figures that are themselves percentages.
 * The gap in percentage points and the relative change are different numbers.
 */
export function percentagePoints({ fromPct, toPct }) {
  if (!isNum(fromPct) || !isNum(toPct)) return { error: "Enter a number in both fields." };
  const points = round(toPct - fromPct);
  const relativePct =
    fromPct === 0 ? null : round(((toPct - fromPct) / Math.abs(fromPct)) * 100);
  if (!allFinite(points, relativePct)) return OVERFLOW_ERROR;
  return {
    fromPct,
    toPct,
    points,
    relativePct,
    direction: points > 0 ? "up" : points < 0 ? "down" : "unchanged",
  };
}
