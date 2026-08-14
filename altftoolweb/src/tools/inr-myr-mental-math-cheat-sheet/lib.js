/**
 * Mental-math cheat sheet engine: a foreign price -> Indian rupees, in your head.
 *
 * You give the engine today's rate (rupees per 1 unit of the foreign currency)
 * and it searches a small set of *mentally executable* arithmetic rules for the
 * ones that land closest to the exact conversion.
 *
 * Every rule has the same shape, because every currency conversion is a single
 * multiplication:
 *
 *     rupees = price x trueRate
 *     rule   = price x M x 10^(-d)
 *
 * d is a decimal shift (dropping or adding zeros), which costs nothing
 * mentally, and M is the "working multiplier" that is left over. d is chosen so
 * that M always lands in [1, 10), which is the range humans multiply in.
 *
 * Three rule families are searched:
 *
 *   1. Quick rule    - M rounded to the nearest whole number or half.
 *   2. Tuned rule    - the quick rule plus a percentage nudge drawn from a set
 *                      of percentages that are easy to do in the head
 *                      (10% = move the decimal point, 25% = a quarter, and so on).
 *   3. Fraction rule - the closest simple fraction to the true rate, reduced and
 *                      with powers of ten factored back out.
 *
 * Because every rule is a pure multiplier, its error is a fixed percentage of
 * the exact answer and does not depend on the price:
 *
 *     error% = (ruleRate - trueRate) / trueRate x 100
 *
 * Nothing below is currency-specific except the CURRENCY block.
 */

/**
 * The Malaysian ringgit. Bank Negara Malaysia issues the fourth series of
 * notes in RM 1, 5, 10, 20, 50 and 100; RM 2 and RM 500/1000 notes have been
 * demonetised, so RM 100 is the largest note you will be handed.
 *
 * MYR floats against the rupee, so `defaultInrPerUnit` is only a starting
 * point. It sits in the band the pair has traded in over recent years
 * (roughly Rs 19-22 per ringgit) and is meant to be replaced with the rate you
 * actually see on the day.
 */
export const CURRENCY = {
  code: "MYR",
  name: "Malaysian ringgit",
  plural: "ringgit",
  symbol: "RM",
  country: "Malaysia",
  defaultInrPerUnit: 20.5,
  notes: [100, 50, 20, 10, 5, 1],
  pricePoints: [
    { amount: 2, note: "Bottle of water" },
    { amount: 5, note: "Teh tarik at a kopitiam" },
    { amount: 12, note: "Nasi lemak plate" },
    { amount: 20, note: "Short Grab ride" },
    { amount: 50, note: "Sit-down dinner for one" },
    { amount: 100, note: "Museum day plus transport" },
    { amount: 250, note: "Mid-range hotel night" },
    { amount: 500, note: "Weekend of spending" },
    { amount: 1000, note: "Domestic flight leg" },
  ],
};

/** Rupee amounts a traveller thinks in when going the other way. */
export const RUPEE_ANCHORS = [100, 500, 1000, 2000, 5000, 10000];

/**
 * Multipliers a shopper can apply standing at a till: whole numbers and halves.
 * Anything finer than a half stops being mental arithmetic.
 */
export const EASY_MULTIPLIERS = [
  1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10,
];

/**
 * Percentage nudges people can actually do, listed easiest first. 10% is a
 * decimal shift, 50% is a halving, 25% is a quarter, 5% is half of 10%,
 * 33.3% is a third, 12.5% is an eighth and 2.5% is a quarter of 10%.
 */
export const ADJUSTMENT_PERCENTS = [
  0, 10, -10, 50, -50, 25, -25, 5, -5, 20, -20, 100 / 3, -100 / 3, 12.5, -12.5,
  2.5, -2.5,
];

/** Denominators simple enough to divide by without paper. */
export const FRACTION_DENOMINATORS = [2, 3, 4, 5, 6, 8, 10, 16, 20];

/**
 * A fraction rule is only offered if the numerator and denominator of the
 * reduced fraction add up to no more than this. 5/8 passes, 41/2 does not.
 */
export const MAX_FRACTION_COMPLEXITY = 30;

/** A rule has to beat the quick rule by this many percentage points to be worth learning. */
export const MIN_IMPROVEMENT_POINTS = 0.3;

/** Within this much of the exact answer, a rule is good enough for shopping. */
export const SHOPPING_ACCURACY_PERCENT = 2;

/** Rates outside this range are typing mistakes, not exchange rates. */
export const MIN_RATE = 1e-7;
export const MAX_RATE = 1e7;

const round = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

const toNumber = (raw) => {
  if (raw === null || raw === undefined || raw === "") return NaN;
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/** Trim trailing zeros so 2.50 prints as "2.5" and 3.00 as "3". */
const num = (value) => {
  const rounded = round(value, 6);
  return String(rounded);
};

const zeroWord = (count) =>
  count === 1 ? "one zero" : count === 2 ? "two zeros" : `${count} zeros`;

/**
 * Split a rate into a decimal shift d and a working multiplier in [1, 10),
 * so that rate === working * 10^(-d).
 */
export function splitRate(rate) {
  let shift = -Math.floor(Math.log10(rate));
  let working = rate * Math.pow(10, shift);
  // Guard the log10 edge cases (0.001 and friends land just outside the band).
  if (working >= 10) {
    shift -= 1;
    working = rate * Math.pow(10, shift);
  }
  if (working < 1) {
    shift += 1;
    working = rate * Math.pow(10, shift);
  }
  return { shift, working: round(working, 10) };
}

const shiftStep = (shift) => {
  if (shift > 0) return `Drop ${zeroWord(shift)} (divide by ${10 ** shift})`;
  if (shift < 0) return `Add ${zeroWord(-shift)} (multiply by ${10 ** -shift})`;
  return null;
};

const errorPercent = (ruleRate, trueRate) => ((ruleRate - trueRate) / trueRate) * 100;

const nearestEasyMultiplier = (working) => {
  let best = EASY_MULTIPLIERS[0];
  let bestGap = Infinity;
  for (const candidate of EASY_MULTIPLIERS) {
    const gap = Math.abs(candidate - working);
    // A strict < keeps the earlier (whole-number) candidate when there is a tie.
    if (gap < bestGap - 1e-12) {
      bestGap = gap;
      best = candidate;
    }
  }
  return best;
};

const buildQuickRule = (rate) => {
  const { shift, working } = splitRate(rate);
  const multiplier = nearestEasyMultiplier(working);
  const ruleRate = multiplier * Math.pow(10, -shift);
  const steps = [];
  const merged = shift <= 0 ? multiplier * Math.pow(10, -shift) : null;
  if (merged !== null) {
    steps.push(`Multiply by ${num(merged)}`);
  } else {
    steps.push(shiftStep(shift));
    steps.push(`Multiply by ${num(multiplier)}`);
  }
  return {
    id: "quick",
    label: "Quick rule",
    multiplier,
    shift,
    rate: ruleRate,
    errorPercent: round(errorPercent(ruleRate, rate), 2),
    steps: steps.filter(Boolean),
  };
};

const buildTunedRule = (rate, quick) => {
  let best = null;
  ADJUSTMENT_PERCENTS.forEach((percent, index) => {
    const ruleRate = quick.rate * (1 + percent / 100);
    const err = Math.abs(errorPercent(ruleRate, rate));
    if (!best || err < best.err - 1e-9) {
      best = { percent, index, ruleRate, err };
    }
  });

  const steps = [...quick.steps];
  if (Math.abs(best.percent) > 1e-9) {
    const magnitude = round(Math.abs(best.percent), 2);
    const direction = best.percent > 0 ? "Add" : "Subtract";
    steps.push(
      `${direction} ${num(magnitude)}% (about Rs ${num(round(magnitude, 1))} on every Rs 100)`,
    );
  }

  const err = round(errorPercent(best.ruleRate, rate), 2);
  return {
    id: "tuned",
    label: "Tuned rule",
    adjustPercent: round(best.percent, 4),
    rate: best.ruleRate,
    errorPercent: err,
    steps,
    improves:
      Math.abs(best.percent) > 1e-9 &&
      Math.abs(err) + MIN_IMPROVEMENT_POINTS < Math.abs(quick.errorPercent),
  };
};

const buildFractionRule = (rate, quick) => {
  const { shift, working } = splitRate(rate);
  let best = null;

  for (const denominator of FRACTION_DENOMINATORS) {
    const numerator = Math.round(working * denominator);
    if (numerator < 1) continue;
    const value = numerator / denominator;
    const err = Math.abs(errorPercent(value * Math.pow(10, -shift), rate));
    const weight = numerator + denominator;
    if (!best || err < best.err - 1e-9 || (Math.abs(err - best.err) <= 1e-9 && weight < best.weight)) {
      best = { numerator, denominator, err, weight };
    }
  }

  // Fold the decimal shift into the fraction, reduce it, then pull whole
  // powers of ten back out so the rule reads as "drop three zeros, x17, /5".
  const tenPower = Math.round(Math.pow(10, Math.abs(shift)));
  let p = shift >= 0 ? best.numerator : best.numerator * tenPower;
  let q = shift >= 0 ? best.denominator * tenPower : best.denominator;
  const divisor = gcd(p, q);
  p /= divisor;
  q /= divisor;

  let displayShift = 0;
  while (p % 10 === 0) {
    p /= 10;
    displayShift -= 1;
  }
  while (q % 10 === 0) {
    q /= 10;
    displayShift += 1;
  }

  const ruleRate = (p / q) * Math.pow(10, -displayShift);
  const err = round(errorPercent(ruleRate, rate), 2);

  const steps = [];
  const shiftText = shiftStep(displayShift);
  if (shiftText) steps.push(shiftText);
  if (p !== 1) steps.push(`Multiply by ${p}`);
  if (q !== 1) steps.push(`Divide by ${q}`);
  if (steps.length === 0) steps.push("Multiply by 1");

  return {
    id: "fraction",
    label: "Fraction rule",
    numerator: p,
    denominator: q,
    shift: displayShift,
    complexity: p + q,
    rate: ruleRate,
    errorPercent: err,
    steps,
    worthwhile:
      p + q <= MAX_FRACTION_COMPLEXITY &&
      Math.abs(err) + MIN_IMPROVEMENT_POINTS < Math.abs(quick.errorPercent),
  };
};

/** Derive the three mental rules for one direction of a rate. */
export function deriveRules(rate) {
  const quick = buildQuickRule(rate);
  const tuned = buildTunedRule(rate, quick);
  const fraction = buildFractionRule(rate, quick);

  const candidates = [quick];
  if (tuned.improves) candidates.push(tuned);
  if (fraction.worthwhile) candidates.push(fraction);
  const recommended = candidates.reduce((a, b) =>
    Math.abs(b.errorPercent) < Math.abs(a.errorPercent) - 1e-9 ? b : a,
  );

  return {
    rate,
    quick,
    tuned,
    fraction,
    recommendedId: recommended.id,
    recommendedRate: recommended.rate,
    recommendedErrorPercent: recommended.errorPercent,
    shoppingAccurate: Math.abs(recommended.errorPercent) <= SHOPPING_ACCURACY_PERCENT,
  };
}

/**
 * Build the whole cheat sheet.
 *
 * @param {object} input
 * @param {number|string} input.inrPerUnit rupees per 1 unit of the foreign currency
 * @param {number|string} [input.amount]   an optional price to convert as a worked example
 * @returns {object} the cheat sheet, or { error } when the rate is unusable
 */
export function buildCheatSheet({ inrPerUnit, amount } = {}) {
  const rate = toNumber(inrPerUnit);

  if (!Number.isFinite(rate)) {
    return { error: `Enter today's rate as a number of rupees per 1 ${CURRENCY.code}.` };
  }
  if (rate <= 0) {
    return { error: "The exchange rate has to be greater than zero." };
  }
  if (rate < MIN_RATE || rate > MAX_RATE) {
    return { error: "That rate is outside any plausible exchange rate. Check the decimal point." };
  }

  const forward = deriveRules(rate);
  const reverse = deriveRules(1 / rate);

  const priceLadder = CURRENCY.pricePoints.map((point) => {
    const exact = point.amount * rate;
    const quick = point.amount * forward.quick.rate;
    const recommended = point.amount * forward[forward.recommendedId].rate;
    return {
      amount: point.amount,
      note: point.note,
      exactInr: round(exact, 2),
      quickInr: round(quick, 2),
      recommendedInr: round(recommended, 2),
      quickGapInr: round(quick - exact, 2),
      recommendedGapInr: round(recommended - exact, 2),
    };
  });

  const rupeeLadder = RUPEE_ANCHORS.map((rupees) => ({
    rupees,
    exactUnits: round(rupees / rate, 2),
    ruleUnits: round(rupees * reverse[reverse.recommendedId].rate, 2),
  }));

  const noteLadder = CURRENCY.notes.map((note) => ({
    note,
    inr: round(note * rate, 2),
  }));

  let worked = null;
  const parsedAmount = toNumber(amount);
  if (Number.isFinite(parsedAmount) && parsedAmount >= 0) {
    const exact = parsedAmount * rate;
    worked = {
      amount: parsedAmount,
      exactInr: round(exact, 2),
      quickInr: round(parsedAmount * forward.quick.rate, 2),
      tunedInr: round(parsedAmount * forward.tuned.rate, 2),
      fractionInr: round(parsedAmount * forward.fraction.rate, 2),
      recommendedInr: round(parsedAmount * forward[forward.recommendedId].rate, 2),
      quickGapInr: round(parsedAmount * forward.quick.rate - exact, 2),
    };
  }

  return {
    code: CURRENCY.code,
    symbol: CURRENCY.symbol,
    rate: round(rate, 8),
    unitsPerRupee: round(1 / rate, 6),
    forward,
    reverse,
    priceLadder,
    rupeeLadder,
    noteLadder,
    worked,
  };
}
