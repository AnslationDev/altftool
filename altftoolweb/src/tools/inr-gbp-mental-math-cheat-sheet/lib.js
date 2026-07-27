/**
 * INR / GBP mental-math cheat sheet.
 *
 * Converting a price in your head is one multiplication, so the only real question is which
 * multiplication a person can run while standing at a till.
 *
 * Any rate splits into a decimal shift and a working multiplier in [1, 10):
 *
 *     rate = working x 10^(-shift)
 *
 * Moving a decimal point costs nothing, so all the difficulty is in `working`. Three families of
 * approximation are searched, and each one's error is a fixed percentage of the exact answer,
 * because every rule is itself a pure multiplier:
 *
 *     error% = (rule rate - true rate) / true rate x 100
 *
 *   1. Quick rule    — round `working` to the nearest easy multiplier (quarters below 3, halves
 *                      above).
 *   2. Tuned rule    — the quick rule plus one easy percentage nudge: 10% is a decimal shift, 50%
 *                      a halving, 25% a quarter, 12.5% an eighth.
 *   3. Fraction rule — the closest simple fraction, reduced, with powers of ten pulled back out.
 *
 * The pound is the case where the tuned rule earns its keep: near a round hundred the quick rule
 * has nowhere accurate to land, and "add two zeros, then add an eighth" beats it comfortably.
 *
 * The second half of the file is Britain-specific. Unlike the United States, UK shelf prices
 * already include VAT, so the tag is the price — except in restaurants, where a discretionary
 * service charge is commonly added to the bill before you are asked to pay.
 */

/**
 * The pound sterling. Bank of England polymer notes circulate as £5, £10, £20 and £50; Scottish
 * and Northern Irish banks issue their own notes, which are legal currency across the UK but are
 * sometimes refused by shops in England. The rate floats, so `defaultInrPerUnit` is a starting
 * point in the band the pair has traded in recently, not a quote.
 */
export const CURRENCY = {
  code: "GBP",
  name: "pound sterling",
  plural: "pounds",
  symbol: "£",
  country: "the United Kingdom",
  defaultInrPerUnit: 112,
  notes: [50, 20, 10, 5],
  pricePoints: [
    { amount: 1, note: "Newspaper" },
    { amount: 3, note: "Coffee" },
    { amount: 7, note: "Pint of beer in London" },
    { amount: 15, note: "Pub main course" },
    { amount: 30, note: "Theatre ticket, upper circle" },
    { amount: 60, note: "Dinner for one with a glass of wine" },
    { amount: 150, note: "Mid-range hotel night" },
    { amount: 400, note: "Return train to Edinburgh, booked late" },
    { amount: 1000, note: "Laptop" },
  ],
};

/** Rupee amounts an Indian traveller thinks in when converting the other way. */
export const RUPEE_ANCHORS = [100, 500, 1000, 5000, 10000, 50000];

/**
 * Multipliers a shopper can apply at a till. Quarters below 3, where relative granularity matters
 * most; halves above.
 */
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
 * United Kingdom till rules. The standard VAT rate is 20% and it is already inside every displayed
 * retail price, so unlike the United States the tag is what you pay in a shop. Restaurants
 * commonly add a discretionary service charge — 12.5% is the usual London figure — which is
 * printed on the bill and can be asked to be removed. Since January 2021 the UK no longer operates
 * VAT-free shopping for visitors taking goods home, so there is no airport refund to plan for.
 */
export const UK_VAT_PERCENT = 20;
export const TYPICAL_SERVICE_CHARGE_PERCENT = 12.5;
export const VAT_REFUND_FOR_VISITORS_AVAILABLE = false;

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

/** Print 2.50 as "2.5" and 3.00 as "3". */
const num = (value) => String(round(value, 6));

const zeroWord = (count) => (count === 1 ? "one zero" : count === 2 ? "two zeros" : `${count} zeros`);

/** Split a rate into a decimal shift and a working multiplier in [1, 10). */
export function splitRate(rate) {
  let shift = -Math.floor(Math.log10(rate));
  let working = rate * Math.pow(10, shift);
  // log10 lands just outside the band for exact powers of ten, so nudge it back in.
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
    // A strict comparison keeps the earlier, rounder candidate on a tie.
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

function buildTunedRule(rate, quick) {
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
      `${best.percent > 0 ? "Add" : "Subtract"} ${num(magnitude)}% (about ₹${num(round(magnitude, 1))} on every ₹100)`,
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
 * Menu price to what the card is actually charged in Britain. VAT is already inside the displayed
 * price, so the only addition is the discretionary service charge a restaurant may apply.
 *
 * @returns {{factor:number, serviceAmount:number, vatInside:number, total:number, steps:string[]}}
 */
export function tillPrice({ sticker, serviceChargePercent }) {
  const base = Number.isFinite(sticker) && sticker > 0 ? sticker : 0;
  const service = (base * (Number.isFinite(serviceChargePercent) ? serviceChargePercent : 0)) / 100;
  const total = base + service;
  // VAT is inside the displayed price, so the tax already paid on a gross amount is
  // gross x rate / (100 + rate) — shown for information, not added on.
  const vatInside = (base * UK_VAT_PERCENT) / (100 + UK_VAT_PERCENT);
  const steps = [];
  if (service > 0) {
    steps.push(`Discretionary service charge ${num(serviceChargePercent)}% added to the bill`);
  }
  steps.push(`${UK_VAT_PERCENT}% VAT is already inside the displayed price`);
  return {
    factor: base > 0 ? total / base : 1,
    serviceAmount: round(service, 2),
    vatInside: round(vatInside, 2),
    total: round(total, 2),
    steps,
  };
}

/**
 * Build the whole cheat sheet.
 *
 * @param {object} input
 * @param {number|string} input.inrPerUnit rupees per 1 pound
 * @param {number|string} [input.amount] a pound price to work through as an example
 * @param {number|string} [input.serviceChargePercent]
 * @returns {object} the cheat sheet, or { error } when the rate is unusable
 */
export function buildCheatSheet({
  inrPerUnit,
  amount,
  serviceChargePercent = TYPICAL_SERVICE_CHARGE_PERCENT,
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

  const service = toNumber(serviceChargePercent);
  if (!Number.isFinite(service) || service < 0 || service > 50) {
    return { error: "Service charge must be between 0% and 50%." };
  }

  const forward = deriveRules(rate);
  const reverse = deriveRules(1 / rate);

  const priceLadder = CURRENCY.pricePoints.map((point) => {
    const exact = point.amount * rate;
    const quick = point.amount * forward.quick.rate;
    const tuned = point.amount * forward.tuned.rate;
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
    const till = tillPrice({ sticker: parsedAmount, serviceChargePercent: service });
    const exact = parsedAmount * rate;
    worked = {
      amount: parsedAmount,
      exactInr: round(exact, 2),
      quickInr: round(parsedAmount * forward.quick.rate, 2),
      tunedInr: round(parsedAmount * forward.tuned.rate, 2),
      fractionInr: round(parsedAmount * forward.fraction.rate, 2),
      quickGapInr: round(parsedAmount * forward.quick.rate - exact, 2),
      till,
      tillInr: round(till.total * rate, 2),
      tillQuickInr: round(till.total * forward.quick.rate, 2),
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
    serviceChargePercent: service,
    vatPercent: UK_VAT_PERCENT,
    worked,
  };
}
