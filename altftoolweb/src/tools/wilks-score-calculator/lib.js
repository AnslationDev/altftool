/**
 * Wilks score (Robert Wilks, 1994).
 *
 * Wilks score = total lifted (kg) x coefficient
 * coefficient = 500 / (a + b·x + c·x² + d·x³ + e·x⁴ + f·x⁵)
 * where x is bodyweight in kilograms.
 *
 * The IPF used this formula as its official relative-strength score until 2019,
 * when it was replaced by IPF GL points; many federations and gyms still quote it.
 * The two coefficient sets below are the published Wilks constants.
 */

/** Numerator of the Wilks coefficient - fixed at 500 in the original formula. */
export const WILKS_NUMERATOR = 500;

/** Published Wilks polynomial constants for men. */
export const WILKS_MEN = {
  a: -216.0475144,
  b: 16.2606339,
  c: -0.002388645,
  d: -0.00113732,
  e: 7.01863e-6,
  f: -1.291e-8,
};

/** Published Wilks polynomial constants for women. */
export const WILKS_WOMEN = {
  a: 594.31747775582,
  b: -27.23842536447,
  c: 0.82112226871,
  d: -0.00930733913,
  e: 4.731582e-5,
  f: -9.054e-8,
};

/** Exact pound (1959 international yard and pound agreement). */
export const KG_PER_LB = 0.45359237;

/**
 * Hard input guards. The polynomial is only fitted to competitive bodyweights;
 * outside roughly 40-200 kg it stops behaving, so we refuse well before that.
 */
export const MIN_BODYWEIGHT_KG = 25;
export const MAX_BODYWEIGHT_KG = 250;
/** Fitted range of the original formula - results outside it are flagged, not blocked. */
export const RELIABLE_BODYWEIGHT_KG = { min: 40, max: 200 };
/** No raw powerlifting total has come close to 1500 kg, so anything above is a typo. */
export const MAX_TOTAL_KG = 2000;

/**
 * Informal community benchmarks for a raw three-lift Wilks score.
 * These are gym conventions, not federation classifications.
 */
export const WILKS_BANDS = [
  { min: 0, label: "Beginner", note: "Early training, still adding weight most sessions." },
  { min: 200, label: "Novice", note: "Consistent training with a full three-lift total." },
  { min: 300, label: "Intermediate", note: "Competitive at a local meet." },
  { min: 400, label: "Advanced", note: "Regional-level relative strength." },
  { min: 500, label: "Elite", note: "National-level relative strength." },
  { min: 600, label: "World class", note: "International podium territory." },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export const lbToKg = (lb) => (isNum(lb) ? lb * KG_PER_LB : null);
export const kgToLb = (kg) => (isNum(kg) ? kg / KG_PER_LB : null);

/** Format a kg bound in the display unit the caller is showing to the user. */
function formatBound(kgValue, unit) {
  if (unit === "lb") return kgToLb(kgValue).toFixed(1);
  return String(kgValue);
}

/**
 * Wilks coefficient for a bodyweight.
 * @param {{bodyweightKg:number, sex?:"male"|"female", unit?:"kg"|"lb"}} input
 *   `unit` only controls how out-of-range error messages are phrased — bodyweightKg
 *   must always already be converted to kilograms by the caller.
 */
export function wilksCoefficient({ bodyweightKg, sex = "male", unit = "kg" } = {}) {
  if (!isNum(bodyweightKg)) return { error: "Enter a bodyweight." };
  if (bodyweightKg < MIN_BODYWEIGHT_KG || bodyweightKg > MAX_BODYWEIGHT_KG) {
    return {
      error: `Bodyweight must be between ${formatBound(MIN_BODYWEIGHT_KG, unit)} and ${formatBound(MAX_BODYWEIGHT_KG, unit)} ${unit}.`,
    };
  }

  const k = sex === "female" ? WILKS_WOMEN : WILKS_MEN;
  const x = bodyweightKg;
  const denominator =
    k.a + k.b * x + k.c * x ** 2 + k.d * x ** 3 + k.e * x ** 4 + k.f * x ** 5;

  if (!isNum(denominator) || denominator <= 0) {
    return { error: "The Wilks formula does not produce a usable value at that bodyweight." };
  }

  return {
    coefficient: WILKS_NUMERATOR / denominator,
    denominator,
    outsideFittedRange:
      bodyweightKg < RELIABLE_BODYWEIGHT_KG.min || bodyweightKg > RELIABLE_BODYWEIGHT_KG.max,
  };
}

/** Band label for a Wilks score. */
export function classifyWilks(score) {
  if (!isNum(score) || score < 0) return WILKS_BANDS[0];
  let match = WILKS_BANDS[0];
  for (const band of WILKS_BANDS) {
    if (score >= band.min) match = band;
  }
  return match;
}

/**
 * Full Wilks report from a bodyweight and either a total or the three lifts.
 *
 * @param {{bodyweightKg:number, sex?:"male"|"female", unit?:"kg"|"lb", totalKg?:number,
 *          squatKg?:number, benchKg?:number, deadliftKg?:number}} input
 *   `unit` only controls how out-of-range error messages are phrased — every *Kg
 *   value must already be converted to kilograms by the caller.
 */
export function computeWilks({
  bodyweightKg,
  sex = "male",
  unit = "kg",
  totalKg,
  squatKg,
  benchKg,
  deadliftKg,
} = {}) {
  const coeff = wilksCoefficient({ bodyweightKg, sex, unit });
  if (coeff.error) return { error: coeff.error };

  const lifts = [squatKg, benchKg, deadliftKg];
  const anyLift = lifts.some((value) => isNum(value));
  let total = totalKg;
  if (!isNum(total) && anyLift) {
    if (lifts.some((value) => !isNum(value))) {
      return { error: "Enter all three lifts, or enter a total instead." };
    }
    total = lifts.reduce((sum, value) => sum + value, 0);
  }

  if (!isNum(total)) return { error: "Enter a competition total, or the three individual lifts." };
  if (total <= 0) return { error: "Total must be greater than zero." };
  if (total > MAX_TOTAL_KG) {
    return { error: `Total must be under ${formatBound(MAX_TOTAL_KG, unit)} ${unit}.` };
  }
  if (lifts.some((value) => isNum(value) && value < 0)) {
    return { error: "Individual lifts cannot be negative." };
  }

  const score = total * coeff.coefficient;

  return {
    score,
    coefficient: coeff.coefficient,
    totalKg: total,
    totalLb: kgToLb(total),
    bodyweightKg,
    bodyweightLb: kgToLb(bodyweightKg),
    sex,
    band: classifyWilks(score),
    outsideFittedRange: coeff.outsideFittedRange,
    /** How many kg of total are needed for each extra Wilks point at this bodyweight. */
    kgPerWilksPoint: 1 / coeff.coefficient,
    totalToBodyweightRatio: total / bodyweightKg,
  };
}

/**
 * Total needed to reach a target Wilks score at a given bodyweight.
 * total = target / coefficient
 */
export function totalForWilks({ bodyweightKg, sex = "male", targetScore } = {}) {
  const coeff = wilksCoefficient({ bodyweightKg, sex });
  if (coeff.error) return { error: coeff.error };
  if (!isNum(targetScore) || targetScore <= 0) {
    return { error: "Target Wilks score must be greater than zero." };
  }
  return { totalKg: targetScore / coeff.coefficient, coefficient: coeff.coefficient };
}
