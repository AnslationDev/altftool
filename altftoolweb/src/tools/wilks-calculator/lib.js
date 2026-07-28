/**
 * Wilks Calculator — bodyweight-adjusted powerlifting scores.
 *
 * A 60 kg lifter and a 120 kg lifter cannot be compared on total alone, so
 * powerlifting uses a coefficient that scales the total by bodyweight. Three
 * are implemented here, all exactly as published:
 *
 * 1. WILKS (Robert Wilks, 1994 — the classic IPF formula until 2019)
 *      coefficient = 500 / (a + bx + cx^2 + dx^3 + ex^4 + fx^5)
 *      Wilks score = total x coefficient,  x = bodyweight in kg
 *    Check: a 100 kg man has a coefficient of 0.6086.
 *
 * 2. DOTS (Dynamic Objective Team Scoring, 2019 — used by many federations)
 *      coefficient = 500 / (ax^4 + bx^3 + cx^2 + dx + e)
 *      DOTS score = total x coefficient
 *    Check: a 100 kg man has a coefficient of 0.6155.
 *
 * 3. IPF GL POINTS (IPF Goodlift, official since 2020)
 *      points = total x 100 / (A - B x e^(-C x bodyweight))
 *    The scale is calibrated so that a world-class performance sits near 100.
 *
 * Every coefficient is a curve fitted to competition data, so it is only
 * meaningful inside the bodyweight range it was fitted on — roughly 40-200 kg
 * for men and 27-155 kg for women. Outside that the polynomial can even turn
 * negative, which this module reports as an error rather than a score.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Kilograms in one pound (international avoirdupois, exact). */
export const KG_PER_LB = 0.45359237;

/** Wilks (1994) polynomial coefficients, bodyweight in kg. */
export const WILKS_COEFFICIENTS = {
  male: [-216.0475144, 16.2606339, -0.002388645, -0.00113732, 7.01863e-6, -1.291e-8],
  female: [594.31747775582, -27.23842536447, 0.82112226871, -0.00930733913, 4.731582e-5, -9.054e-8],
};

/** Wilks numerator: the coefficient is scaled so 500 is the reference. */
export const WILKS_NUMERATOR = 500;

/** DOTS (2019) polynomial coefficients, highest power first, bodyweight in kg. */
export const DOTS_COEFFICIENTS = {
  male: [-0.000001093, 0.0007391293, -0.1918759221, 24.0900756, -307.75076],
  female: [-0.0000010706, 0.0005158568, -0.1126655495, 13.6175032, -57.96288],
};

export const DOTS_NUMERATOR = 500;

/** IPF GL Points (2020) coefficients for the classic (raw) full-power total. */
export const IPF_GL_COEFFICIENTS = {
  "male-raw-total": { A: 1199.72839, B: 1025.18162, C: 0.00921 },
  "female-raw-total": { A: 610.32796, B: 1045.59282, C: 0.03048 },
  "male-equipped-total": { A: 1236.25115, B: 1449.21864, C: 0.01644 },
  "female-equipped-total": { A: 758.63878, B: 949.31382, C: 0.02435 },
  "male-raw-bench": { A: 320.98041, B: 281.40258, C: 0.01008 },
  "female-raw-bench": { A: 142.40398, B: 442.52671, C: 0.04724 },
  "male-equipped-bench": { A: 381.22073, B: 733.79378, C: 0.02398 },
  "female-equipped-bench": { A: 221.82209, B: 357.00377, C: 0.02937 },
};

export const IPF_EVENTS = [
  { id: "raw-total", label: "Classic (raw) full power" },
  { id: "equipped-total", label: "Equipped full power" },
  { id: "raw-bench", label: "Classic (raw) bench only" },
  { id: "equipped-bench", label: "Equipped bench only" },
];

/**
 * Bodyweight range the curves were fitted on. Outside it the score is an
 * extrapolation, so it is returned with a warning rather than silently.
 */
export const FITTED_RANGE_KG = { male: { min: 40, max: 200 }, female: { min: 27, max: 155 } };

/** Hard input bounds. */
export const MIN_BODYWEIGHT_KG = 20;
export const MAX_BODYWEIGHT_KG = 300;
export const MAX_TOTAL_KG = 2000;

/**
 * IPF GL points are calibrated so that a performance at the level of a world
 * champion scores about 100 — that is the definition of the scale.
 */
export const IPF_GL_REFERENCE = 100;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

const sexKey = (sex) => (sex === "female" ? "female" : "male");

/** Convert pounds to kilograms. */
export function lbToKg(pounds) {
  if (!isNum(pounds)) return NaN;
  return pounds * KG_PER_LB;
}

/** Convert kilograms to pounds. */
export function kgToLb(kilograms) {
  if (!isNum(kilograms)) return NaN;
  return kilograms / KG_PER_LB;
}

function validateInputs(bodyweightKg, totalKg) {
  if (!isNum(bodyweightKg) || bodyweightKg <= 0) return { error: "Enter a bodyweight greater than zero." };
  if (bodyweightKg < MIN_BODYWEIGHT_KG || bodyweightKg > MAX_BODYWEIGHT_KG) {
    return { error: `Bodyweight must be between ${MIN_BODYWEIGHT_KG} and ${MAX_BODYWEIGHT_KG} kg.` };
  }
  if (!isNum(totalKg) || totalKg <= 0) return { error: "Enter a total greater than zero." };
  if (totalKg > MAX_TOTAL_KG) return { error: `Totals above ${MAX_TOTAL_KG} kg are beyond any recorded lift.` };
  return null;
}

/** Wilks coefficient for a bodyweight, in kg. */
export function wilksCoefficient(bodyweightKg, sex) {
  if (!isNum(bodyweightKg) || bodyweightKg <= 0) return { error: "Enter a bodyweight greater than zero." };
  const [a, b, c, d, e, f] = WILKS_COEFFICIENTS[sexKey(sex)];
  const x = bodyweightKg;
  const denominator = a + b * x + c * x ** 2 + d * x ** 3 + e * x ** 4 + f * x ** 5;
  if (denominator <= 0) {
    return { error: "The Wilks curve does not produce a usable coefficient at that bodyweight." };
  }
  return { coefficient: WILKS_NUMERATOR / denominator };
}

/** DOTS coefficient for a bodyweight, in kg. */
export function dotsCoefficient(bodyweightKg, sex) {
  if (!isNum(bodyweightKg) || bodyweightKg <= 0) return { error: "Enter a bodyweight greater than zero." };
  const [a, b, c, d, e] = DOTS_COEFFICIENTS[sexKey(sex)];
  const x = bodyweightKg;
  const denominator = a * x ** 4 + b * x ** 3 + c * x ** 2 + d * x + e;
  if (denominator <= 0) {
    return { error: "The DOTS curve does not produce a usable coefficient at that bodyweight." };
  }
  return { coefficient: DOTS_NUMERATOR / denominator };
}

/** IPF GL points for a total, bodyweight in kg. */
export function ipfGlPoints({ bodyweightKg, totalKg, sex, event = "raw-total" }) {
  const bad = validateInputs(bodyweightKg, totalKg);
  if (bad) return bad;
  const key = `${sexKey(sex)}-${event}`;
  const coefficients = IPF_GL_COEFFICIENTS[key];
  if (!coefficients) return { error: "Choose one of the four IPF events." };
  const denominator = coefficients.A - coefficients.B * Math.exp(-coefficients.C * bodyweightKg);
  if (denominator <= 0) {
    return { error: "The IPF GL curve does not produce a usable score at that bodyweight." };
  }
  return { points: (totalKg * 100) / denominator, denominator };
}

/**
 * All three scores for one lifter, plus the squat/bench/deadlift split.
 *
 * @param {{ bodyweightKg: number, squatKg?: number, benchKg?: number,
 *           deadliftKg?: number, totalKg?: number, sex: "male"|"female",
 *           event?: string }} input
 */
export function calculateScores({ bodyweightKg, squatKg, benchKg, deadliftKg, totalKg, sex, event = "raw-total" }) {
  const lifts = [squatKg, benchKg, deadliftKg];
  const haveLifts = lifts.every((lift) => isNum(lift) && lift >= 0);
  const total = isNum(totalKg) && totalKg > 0 ? totalKg : haveLifts ? lifts.reduce((sum, lift) => sum + lift, 0) : NaN;

  const bad = validateInputs(bodyweightKg, total);
  if (bad) return bad;

  const wilks = wilksCoefficient(bodyweightKg, sex);
  if (wilks.error) return wilks;
  const dots = dotsCoefficient(bodyweightKg, sex);
  if (dots.error) return dots;
  const gl = ipfGlPoints({ bodyweightKg, totalKg: total, sex, event });
  if (gl.error) return gl;

  const range = FITTED_RANGE_KG[sexKey(sex)];
  const extrapolated = bodyweightKg < range.min || bodyweightKg > range.max;

  return {
    totalKg: total,
    totalLb: kgToLb(total),
    bodyweightKg,
    wilksCoefficient: wilks.coefficient,
    wilksScore: total * wilks.coefficient,
    dotsCoefficient: dots.coefficient,
    dotsScore: total * dots.coefficient,
    ipfGlPoints: gl.points,
    strengthToWeight: total / bodyweightKg,
    squatShare: haveLifts && total > 0 ? (squatKg / total) * 100 : null,
    benchShare: haveLifts && total > 0 ? (benchKg / total) * 100 : null,
    deadliftShare: haveLifts && total > 0 ? (deadliftKg / total) * 100 : null,
    extrapolated,
    fittedRange: range,
  };
}

/**
 * The total that would score the same Wilks at a different bodyweight —
 * useful when deciding whether to cut or move up a class.
 *
 * @param {{ wilksScore: number, targetBodyweightKg: number, sex: string }} input
 */
export function equivalentTotal({ wilksScore, targetBodyweightKg, sex }) {
  if (!isNum(wilksScore) || wilksScore <= 0) return { error: "Enter a Wilks score greater than zero." };
  const coefficient = wilksCoefficient(targetBodyweightKg, sex);
  if (coefficient.error) return coefficient;
  return { totalKg: wilksScore / coefficient.coefficient, coefficient: coefficient.coefficient };
}

/** Wilks coefficients across a span of bodyweights, for the reference table. */
export function coefficientTable(sex, from = 50, to = 140, step = 10) {
  if (!isNum(from) || !isNum(to) || !isNum(step) || step <= 0 || to < from) {
    return { error: "The table range is not valid." };
  }
  const rows = [];
  for (let bw = from; bw <= to + 1e-9; bw += step) {
    const wilks = wilksCoefficient(bw, sex);
    const dots = dotsCoefficient(bw, sex);
    rows.push({
      bodyweightKg: Math.round(bw * 100) / 100,
      wilks: wilks.error ? null : wilks.coefficient,
      dots: dots.error ? null : dots.coefficient,
    });
  }
  return { rows };
}
