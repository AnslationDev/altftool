/**
 * DOTS (Dynamic Objective Team Scoring), Tim Konertz, 2019.
 *
 * DOTS score = total lifted (kg) x coefficient
 * coefficient = 500 / (A·x⁴ + B·x³ + C·x² + D·x + E)
 * where x is bodyweight in kilograms, clamped to the fitted range for that sex.
 *
 * DOTS was fitted to raw (unequipped) results and replaced Wilks in the German
 * federation and several others; it is the score used by the OpenPowerlifting
 * database. The polynomial is fourth order, one degree lower than Wilks.
 */

/** Numerator of the DOTS coefficient. */
export const DOTS_NUMERATOR = 500;

/** Published DOTS polynomial constants for men. */
export const DOTS_MEN = {
  a: -0.000001093,
  b: 0.0007391293,
  c: -0.1918759221,
  d: 24.0900756,
  e: -307.75076,
};

/** Published DOTS polynomial constants for women. */
export const DOTS_WOMEN = {
  a: -0.0000010706,
  b: 0.0005158568,
  c: -0.1126655495,
  d: 13.6175032,
  e: -57.96288,
};

/**
 * Fitted bodyweight range per sex. Outside it the polynomial is not defined, so
 * DOTS clamps the bodyweight rather than extrapolating: a 230 kg man is scored
 * with the 210 kg coefficient, a 160 kg woman with the 150 kg coefficient.
 */
export const DOTS_CLAMP = {
  male: { min: 40, max: 210 },
  female: { min: 40, max: 150 },
};

/** Exact pound (1959 international yard and pound agreement). */
export const KG_PER_LB = 0.45359237;

/** Refuse obvious typos before the maths runs. */
export const MIN_BODYWEIGHT_KG = 20;
export const MAX_BODYWEIGHT_KG = 400;
export const MAX_TOTAL_KG = 2000;

/**
 * Informal reference bands for a raw three-lift DOTS score.
 * DOTS is deliberately scaled close to Wilks, so the familiar landmarks carry over.
 * These are community conventions, not federation classifications.
 */
export const DOTS_BANDS = [
  { min: 0, label: "Beginner", note: "First months of structured lifting." },
  { min: 200, label: "Novice", note: "A full three-lift total with consistent training." },
  { min: 300, label: "Intermediate", note: "Competitive at a local meet." },
  { min: 400, label: "Advanced", note: "Regional-level relative strength." },
  { min: 500, label: "Elite", note: "National-level relative strength." },
  { min: 600, label: "World class", note: "International podium territory." },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export const lbToKg = (lb) => (isNum(lb) ? lb * KG_PER_LB : null);
export const kgToLb = (kg) => (isNum(kg) ? kg / KG_PER_LB : null);

/**
 * DOTS coefficient for a bodyweight.
 * @param {{bodyweightKg:number, sex?:"male"|"female"}} input
 */
export function dotsCoefficient({ bodyweightKg, sex = "male" } = {}) {
  if (!isNum(bodyweightKg)) return { error: "Enter a bodyweight." };
  if (bodyweightKg < MIN_BODYWEIGHT_KG || bodyweightKg > MAX_BODYWEIGHT_KG) {
    return { error: `Bodyweight must be between ${MIN_BODYWEIGHT_KG} and ${MAX_BODYWEIGHT_KG} kg.` };
  }

  const female = sex === "female";
  const k = female ? DOTS_WOMEN : DOTS_MEN;
  const range = female ? DOTS_CLAMP.female : DOTS_CLAMP.male;
  const x = Math.min(range.max, Math.max(range.min, bodyweightKg));
  const clamped = x !== bodyweightKg;

  const denominator = k.a * x ** 4 + k.b * x ** 3 + k.c * x ** 2 + k.d * x + k.e;
  if (!isNum(denominator) || denominator <= 0) {
    return { error: "The DOTS formula does not produce a usable value at that bodyweight." };
  }

  return {
    coefficient: DOTS_NUMERATOR / denominator,
    denominator,
    bodyweightUsedKg: x,
    clamped,
    range,
  };
}

/** Band label for a DOTS score. */
export function classifyDots(score) {
  if (!isNum(score) || score < 0) return DOTS_BANDS[0];
  let match = DOTS_BANDS[0];
  for (const band of DOTS_BANDS) {
    if (score >= band.min) match = band;
  }
  return match;
}

/**
 * Full DOTS report from a bodyweight and either a total or the three lifts.
 * @param {{bodyweightKg:number, sex?:"male"|"female", totalKg?:number,
 *          squatKg?:number, benchKg?:number, deadliftKg?:number}} input
 */
export function computeDots({
  bodyweightKg,
  sex = "male",
  totalKg,
  squatKg,
  benchKg,
  deadliftKg,
} = {}) {
  const coeff = dotsCoefficient({ bodyweightKg, sex });
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
  if (lifts.some((value) => isNum(value) && value < 0)) {
    return { error: "Individual lifts cannot be negative." };
  }
  if (total <= 0) return { error: "Total must be greater than zero." };
  if (total > MAX_TOTAL_KG) return { error: `Total must be under ${MAX_TOTAL_KG} kg.` };

  const score = total * coeff.coefficient;

  return {
    score,
    coefficient: coeff.coefficient,
    totalKg: total,
    totalLb: kgToLb(total),
    bodyweightKg,
    bodyweightLb: kgToLb(bodyweightKg),
    bodyweightUsedKg: coeff.bodyweightUsedKg,
    clamped: coeff.clamped,
    range: coeff.range,
    sex,
    band: classifyDots(score),
    kgPerDotsPoint: 1 / coeff.coefficient,
    totalToBodyweightRatio: total / bodyweightKg,
    liftShare: lifts.every((value) => isNum(value))
      ? {
          squat: (squatKg / total) * 100,
          bench: (benchKg / total) * 100,
          deadlift: (deadliftKg / total) * 100,
        }
      : null,
  };
}

/** Total needed to reach a target DOTS score at a given bodyweight. */
export function totalForDots({ bodyweightKg, sex = "male", targetScore } = {}) {
  const coeff = dotsCoefficient({ bodyweightKg, sex });
  if (coeff.error) return { error: coeff.error };
  if (!isNum(targetScore) || targetScore <= 0) {
    return { error: "Target DOTS score must be greater than zero." };
  }
  return { totalKg: targetScore / coeff.coefficient, coefficient: coeff.coefficient };
}
