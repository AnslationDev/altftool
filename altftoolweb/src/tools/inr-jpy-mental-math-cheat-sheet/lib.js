/**
 * INR / JPY mental-math cheat sheet.
 *
 * Converting a price in your head is one multiplication, so the only question is which
 * multiplication a person can run standing at a till.
 *
 * Any rate splits into a decimal shift and a working multiplier in [1, 10):
 *
 *     rate = working x 10^(-shift)
 *
 * Moving a decimal point costs nothing, so all the difficulty is in `working`. Three families of
 * approximation are searched, and each rule's error is a fixed percentage of the exact answer,
 * because every rule is itself a pure multiplier:
 *
 *     error% = (rule rate - true rate) / true rate x 100
 *
 *   1. Quick rule    — round `working` to the nearest easy multiplier (quarters below 3, halves
 *                      above).
 *   2. Tuned rule    — the quick rule plus one easy percentage nudge (a tenth, a quarter, a half,
 *                      an eighth).
 *   3. Fraction rule — the closest simple fraction, reduced, with powers of ten pulled back out.
 *
 * The yen is the currency where the decimal shift does most of the work: prices run in hundreds
 * and thousands, so the rule is nearly always "drop a zero, then halve it, roughly".
 *
 * The second half is Japan-specific, and it is the opposite of the American problem. Since April
 * 2021 Japanese sellers must display tax-included prices, and tipping is not practised, so the
 * number on the label really is the number you pay. What does change the total is where you eat
 * it: consumption tax is 10% normally but a reduced 8% applies to food and non-alcoholic drinks
 * taken away, so the same bakery item costs two different amounts depending on your answer at the
 * counter.
 */

/**
 * The Japanese yen. Bank of Japan notes circulate as ¥1,000, ¥2,000 (rare), ¥5,000 and ¥10,000,
 * and coins go up to ¥500, so a lot of Japanese cash is coins. The yen floats, so
 * `defaultInrPerUnit` is only a starting point in the band the pair has traded in recently.
 */
export const CURRENCY = {
  code: "JPY",
  name: "Japanese yen",
  plural: "yen",
  symbol: "¥",
  country: "Japan",
  defaultInrPerUnit: 0.57,
  notes: [10000, 5000, 2000, 1000],
  pricePoints: [
    { amount: 100, note: "Convenience store onigiri" },
    { amount: 300, note: "Canned coffee and a snack" },
    { amount: 800, note: "Bowl of udon" },
    { amount: 1200, note: "Ramen with a topping" },
    { amount: 3000, note: "Izakaya dinner for one" },
    { amount: 8000, note: "A day of transport and entry tickets" },
    { amount: 15000, note: "Business hotel night" },
    { amount: 50000, note: "7-day ordinary Japan Rail Pass" },
    { amount: 150000, note: "Camera" },
  ],
};

/** Rupee amounts an Indian traveller thinks in when converting the other way. */
export const RUPEE_ANCHORS = [100, 500, 1000, 5000, 10000, 50000];

/** Multipliers a shopper can apply at a till: quarters below 3, halves above. */
export const EASY_MULTIPLIERS = [
  1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5,
];

/**
 * Percentage nudges people can genuinely do, easiest first: 10% is a decimal shift, 50% a halving,
 * 25% a quarter, 5% half of 10%, 20% a fifth, a third, 12.5% an eighth, 2.5% a quarter of 10%.
 */
export const ADJUSTMENT_PERCENTS = [
  0, 10, -10, 50, -50, 25, -25, 5, -5, 20, -20, 100 / 3, -100 / 3, 12.5, -12.5, 2.5, -2.5,
];

/** Denominators that can be divided by without paper. */
export const FRACTION_DENOMINATORS = [2, 3, 4, 5, 6, 8, 10, 16, 20];

/** A fraction rule is only offered if numerator + denominator stays this small. */
export const MAX_FRACTION_COMPLEXITY = 30;

/**
 * ...and if the multiply itself stays small. "x 7 / 3" is mental arithmetic; "x 26 / 3" is not,
 * even though both are inside the complexity budget.
 */
export const MAX_FRACTION_NUMERATOR = 12;

/** A rule must beat the quick rule by this many percentage points to be worth learning. */
export const MIN_IMPROVEMENT_POINTS = 0.3;

/** Inside this error, a rule is accurate enough for shopping decisions. */
export const SHOPPING_ACCURACY_PERCENT = 2;

/** Anything outside this band is a typing mistake, not an exchange rate. */
export const MIN_RATE = 1e-7;
export const MAX_RATE = 1e7;

/**
 * Japanese consumption tax. The standard rate is 10%; a reduced rate of 8% applies to food and
 * non-alcoholic drinks that are taken away rather than eaten on the premises, which is why a
 * convenience store or bakery asks whether you will eat in. Total-price display has been mandatory
 * since April 2021, so shelf and menu prices are tax-included unless a shop states otherwise.
 */
export const JAPAN_STANDARD_TAX_PERCENT = 10;
export const JAPAN_REDUCED_TAX_PERCENT = 8;
export const TIPPING_EXPECTED = false;

const round = (value, decimals) => {
  const factor = 10 ** decimals;
  const result = Math.round(value * factor) / factor;
  return result === 0 ? 0 : result;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

const toNumber = (raw) => {
  if (raw === null || raw === undefined || raw === "") return NaN;
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/** Print 2.50 as "2.5" and 3.00 as "3". */
const num = (value) => String(round(value, 6));

const zeroWord = (count) => (count === 1 ? "one zero" : count === 2 ? "two zeros" : `${count} zeros`);

/** Split a rate into a decimal shift and a working multiplier in [1, 10). */
export function splitRate(rate) {
  let shift = -Math.floor(Math.log10(rate));
  let working = rate * Math.pow(10, shift);
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
    if (gap < bestGap - 1e-12) {
      bestGap = gap;
      best = candidate;
    }
  }
  return best;
};

function buildQuickRule(rate) {
  const { shift, working } = splitRate(rate);
  const multiplier = nearestEasyMultiplier(working);
  const ruleRate = multiplier * Math.pow(10, -shift);
  const steps = [];
  if (shift <= 0) {
    steps.push(`Multiply by ${num(multiplier * Math.pow(10, -shift))}`);
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
}

function buildTunedRule(rate, quick, symbol) {
  let best = null;
  for (const percent of ADJUSTMENT_PERCENTS) {
    const ruleRate = quick.rate * (1 + percent / 100);
    const err = Math.abs(errorPercent(ruleRate, rate));
    if (!best || err < best.err - 1e-9) best = { percent, ruleRate, err };
  }

  const steps = [...quick.steps];
  if (Math.abs(best.percent) > 1e-9) {
    const magnitude = round(Math.abs(best.percent), 2);
    steps.push(
      `${best.percent > 0 ? "Add" : "Subtract"} ${num(magnitude)}% (about ${symbol}${num(round(magnitude, 1))} on every ${symbol}100)`,
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
}

/**
 * Fold a fraction and a decimal shift into the tidiest equivalent form: reduce numerator and
 * denominator, then pull whole powers of ten back out so the rule reads as a sequence of steps.
 */
function foldFraction(numerator, denominator, shift) {
  const tenPower = Math.round(Math.pow(10, Math.abs(shift)));
  let p = shift >= 0 ? numerator : numerator * tenPower;
  let q = shift >= 0 ? denominator * tenPower : denominator;
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

  return { p, q, displayShift, rate: (p / q) * Math.pow(10, -displayShift) };
}

function buildFractionRule(rate, quick) {
  const { shift, working } = splitRate(rate);

  // Every candidate is folded first and judged afterwards. Judging before folding lets an exact
  // but useless fraction such as 57/10 crowd out a usable near miss such as 7/3.
  const candidates = [];
  for (const denominator of FRACTION_DENOMINATORS) {
    const numerator = Math.round(working * denominator);
    if (numerator < 1) continue;
    const folded = foldFraction(numerator, denominator, shift);
    candidates.push({
      ...folded,
      complexity: folded.p + folded.q,
      err: errorPercent(folded.rate, rate),
    });
  }

  // A rule is only usable if both the multiply and the divide stay small enough to do in the head.
  const usable = candidates.filter(
    (candidate) =>
      candidate.p <= MAX_FRACTION_NUMERATOR && candidate.complexity <= MAX_FRACTION_COMPLEXITY,
  );
  const pool = usable.length > 0 ? usable : candidates;
  const best = pool.reduce((a, b) => {
    const ea = Math.abs(a.err);
    const eb = Math.abs(b.err);
    if (eb < ea - 1e-9) return b;
    if (Math.abs(eb - ea) <= 1e-9 && b.complexity < a.complexity) return b;
    return a;
  });

  const err = round(best.err, 2);
  const steps = [];
  const shiftText = shiftStep(best.displayShift);
  if (shiftText) steps.push(shiftText);
  if (best.p !== 1) steps.push(`Multiply by ${best.p}`);
  if (best.q !== 1) steps.push(`Divide by ${best.q}`);
  if (steps.length === 0) steps.push("Multiply by 1");

  return {
    id: "fraction",
    label: "Fraction rule",
    numerator: best.p,
    denominator: best.q,
    shift: best.displayShift,
    complexity: best.complexity,
    rate: best.rate,
    errorPercent: err,
    steps,
    worthwhile:
      usable.length > 0 &&
      best.p <= MAX_FRACTION_NUMERATOR &&
      best.complexity <= MAX_FRACTION_COMPLEXITY &&
      Math.abs(err) + MIN_IMPROVEMENT_POINTS < Math.abs(quick.errorPercent),
  };
}

/** Derive the three mental rules for one direction of a rate. */
export function deriveRules(rate, symbol = "₹") {
  const quick = buildQuickRule(rate);
  const tuned = buildTunedRule(rate, quick, symbol);
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
 * Japanese consumption tax on one price, in either direction.
 *
 * Tax-included prices are the norm, so the tax already inside a displayed price is
 *
 *     tax = gross x rate / (100 + rate)
 *
 * and the eat-in / takeaway difference on a tax-included price is not simply two percentage
 * points: the same pre-tax item is grossed up by 1.10 or by 1.08, so switching from eat-in to
 * takeaway on a ¥1,100 tax-included item saves ¥1,100 x (1 - 1.08/1.10) = ¥20.
 *
 * @returns {{ratePercent:number, base:number, tax:number, total:number, eatInTotal:number,
 *            takeawayTotal:number, eatInPremium:number}}
 */
export function consumptionTax({ price, priceIncludesTax = true, eatIn = true }) {
  const value = Number.isFinite(price) && price > 0 ? price : 0;
  const ratePercent = eatIn ? JAPAN_STANDARD_TAX_PERCENT : JAPAN_REDUCED_TAX_PERCENT;

  const base = priceIncludesTax ? (value * 100) / (100 + ratePercent) : value;
  const total = priceIncludesTax ? value : value * (1 + ratePercent / 100);
  const tax = total - base;

  const eatInTotal = base * (1 + JAPAN_STANDARD_TAX_PERCENT / 100);
  const takeawayTotal = base * (1 + JAPAN_REDUCED_TAX_PERCENT / 100);

  return {
    ratePercent,
    base: round(base, 2),
    tax: round(tax, 2),
    total: round(total, 2),
    eatInTotal: round(eatInTotal, 2),
    takeawayTotal: round(takeawayTotal, 2),
    eatInPremium: round(eatInTotal - takeawayTotal, 2),
  };
}

/**
 * Build the whole cheat sheet.
 *
 * @param {object} input
 * @param {number|string} input.inrPerUnit rupees per 1 yen
 * @param {number|string} [input.amount] a yen price to work through as an example
 * @param {boolean} [input.priceIncludesTax] whether the price shown already includes tax
 * @param {boolean} [input.eatIn] eating on the premises attracts the standard 10% rate
 * @returns {object} the cheat sheet, or { error } when the rate is unusable
 */
export function buildCheatSheet({
  inrPerUnit,
  amount,
  priceIncludesTax = true,
  eatIn = true,
} = {}) {
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

  const forward = deriveRules(rate, "₹");
  const reverse = deriveRules(1 / rate, CURRENCY.symbol);

  const priceLadder = CURRENCY.pricePoints.map((point) => {
    const exact = point.amount * rate;
    const quick = point.amount * forward.quick.rate;
    const tuned = point.amount * forward[forward.recommendedId].rate;
    return {
      amount: point.amount,
      note: point.note,
      exactInr: round(exact, 2),
      quickInr: round(quick, 2),
      tunedInr: round(tuned, 2),
      quickGapInr: round(quick - exact, 2),
      tunedGapInr: round(tuned - exact, 2),
    };
  });

  const rupeeLadder = RUPEE_ANCHORS.map((rupees) => ({
    rupees,
    exactUnits: round(rupees / rate, 2),
    quickUnits: round(rupees * reverse.quick.rate, 2),
    ruleUnits: round(rupees * reverse.recommendedRate, 2),
  }));

  const noteLadder = CURRENCY.notes.map((note) => ({ note, inr: round(note * rate, 2) }));

  let worked = null;
  const parsedAmount = toNumber(amount);
  if (Number.isFinite(parsedAmount) && parsedAmount >= 0) {
    const tax = consumptionTax({ price: parsedAmount, priceIncludesTax, eatIn });
    const exact = parsedAmount * rate;
    worked = {
      amount: parsedAmount,
      exactInr: round(exact, 2),
      quickInr: round(parsedAmount * forward.quick.rate, 2),
      tunedInr: round(parsedAmount * forward.tuned.rate, 2),
      fractionInr: round(parsedAmount * forward.fraction.rate, 2),
      quickGapInr: round(parsedAmount * forward.quick.rate - exact, 2),
      tax,
      totalInr: round(tax.total * rate, 2),
      eatInInr: round(tax.eatInTotal * rate, 2),
      takeawayInr: round(tax.takeawayTotal * rate, 2),
      eatInPremiumInr: round(tax.eatInPremium * rate, 2),
    };
  }

  return {
    code: CURRENCY.code,
    symbol: CURRENCY.symbol,
    rate: round(rate, 8),
    unitsPerRupee: round(1 / rate, 8),
    forward,
    reverse,
    priceLadder,
    rupeeLadder,
    noteLadder,
    priceIncludesTax,
    eatIn,
    worked,
  };
}
