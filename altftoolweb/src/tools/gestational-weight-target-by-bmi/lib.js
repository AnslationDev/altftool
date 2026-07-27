/**
 * Gestational weight gain targets.
 *
 * Ranges follow the Institute of Medicine / National Academies 2009
 * recommendations, which are keyed to pre-pregnancy BMI and are still the
 * bands used by ACOG and most national antenatal services.
 *
 * Singleton pregnancy, total gain and mean second/third trimester rate:
 *   Underweight  BMI < 18.5      12.5-18 kg    0.51 kg/week (0.44-0.58)
 *   Normal       18.5-24.9       11.5-16 kg    0.42 kg/week (0.35-0.50)
 *   Overweight   25.0-29.9       7-11.5 kg     0.28 kg/week (0.23-0.33)
 *   Obese        BMI >= 30       5-9 kg        0.22 kg/week (0.17-0.27)
 *
 * Twin pregnancy (IOM provisional guidance; no range was issued for
 * underweight women because the evidence was insufficient):
 *   Normal 16.8-24.5 kg, Overweight 14.1-22.7 kg, Obese 11.3-19.1 kg
 *
 * First trimester gain is small for every category: 0.5-2 kg in total.
 */

/** BMI cut-offs (WHO adult categories, as used by the IOM guidance). */
export const BMI_UNDERWEIGHT_MAX = 18.5;
export const BMI_NORMAL_MAX = 25;
export const BMI_OVERWEIGHT_MAX = 30;

/** Total first-trimester gain, all categories, in kg. */
export const FIRST_TRIMESTER_GAIN_KG = { min: 0.5, max: 2 };
/** Week at which the steady weekly rate takes over from the first-trimester allowance. */
export const FIRST_TRIMESTER_END_WEEK = 13;

export const MIN_WEEK = 1;
export const MAX_WEEK = 42;
export const MIN_HEIGHT_CM = 120;
export const MAX_HEIGHT_CM = 220;
export const MIN_WEIGHT_KG = 30;
export const MAX_WEIGHT_KG = 250;

export const BMI_CATEGORIES = [
  {
    id: "underweight",
    label: "Underweight",
    bmiLabel: "BMI under 18.5",
    total: { min: 12.5, max: 18 },
    weekly: { min: 0.44, max: 0.58, mean: 0.51 },
    twins: null,
  },
  {
    id: "normal",
    label: "Healthy weight",
    bmiLabel: "BMI 18.5 to 24.9",
    total: { min: 11.5, max: 16 },
    weekly: { min: 0.35, max: 0.5, mean: 0.42 },
    twins: { min: 16.8, max: 24.5 },
  },
  {
    id: "overweight",
    label: "Overweight",
    bmiLabel: "BMI 25.0 to 29.9",
    total: { min: 7, max: 11.5 },
    weekly: { min: 0.23, max: 0.33, mean: 0.28 },
    twins: { min: 14.1, max: 22.7 },
  },
  {
    id: "obese",
    label: "Obese",
    bmiLabel: "BMI 30 and above",
    total: { min: 5, max: 9 },
    weekly: { min: 0.17, max: 0.27, mean: 0.22 },
    twins: { min: 11.3, max: 19.1 },
  },
];

/** Unit helpers so the UI never does its own arithmetic. */
export const POUNDS_PER_KG = 2.2046226218;
export const CM_PER_INCH = 2.54;

export function poundsToKg(pounds) {
  const value = Number(pounds);
  return Number.isFinite(value) ? value / POUNDS_PER_KG : NaN;
}

export function kgToPounds(kg) {
  const value = Number(kg);
  return Number.isFinite(value) ? value * POUNDS_PER_KG : NaN;
}

export function feetInchesToCm(feet, inches) {
  const ft = Number(feet) || 0;
  const inch = Number(inches) || 0;
  return (ft * 12 + inch) * CM_PER_INCH;
}

/** Body mass index in kg/m². Returns null for impossible input. */
export function bodyMassIndex({ weightKg, heightCm }) {
  const weight = Number(weightKg);
  const height = Number(heightCm);
  if (!Number.isFinite(weight) || !Number.isFinite(height)) return null;
  if (weight <= 0 || height <= 0) return null;
  const metres = height / 100;
  return weight / (metres * metres);
}

/** Map a BMI value onto its IOM category. */
export function categoryForBmi(bmi) {
  if (!Number.isFinite(bmi)) return null;
  if (bmi < BMI_UNDERWEIGHT_MAX) return BMI_CATEGORIES[0];
  if (bmi < BMI_NORMAL_MAX) return BMI_CATEGORIES[1];
  if (bmi < BMI_OVERWEIGHT_MAX) return BMI_CATEGORIES[2];
  return BMI_CATEGORIES[3];
}

/**
 * Expected cumulative gain range by a given week.
 * Before week 13 the first-trimester allowance is prorated; after it the
 * weekly rate is added on top of the full first-trimester allowance.
 */
export function expectedGainByWeek({ week, category, twins = false }) {
  const w = Number(week);
  if (!Number.isFinite(w) || !category) return null;

  if (twins) {
    // The twin guidance is a total-gain range only; prorate it across 40 weeks.
    const range = category.twins;
    if (!range) return null;
    const share = Math.min(1, Math.max(0, w / 40));
    return { min: range.min * share, max: range.max * share, prorated: true };
  }

  if (w <= FIRST_TRIMESTER_END_WEEK) {
    const share = Math.min(1, Math.max(0, w / FIRST_TRIMESTER_END_WEEK));
    return {
      min: FIRST_TRIMESTER_GAIN_KG.min * share,
      max: FIRST_TRIMESTER_GAIN_KG.max * share,
      prorated: true,
    };
  }

  const laterWeeks = w - FIRST_TRIMESTER_END_WEEK;
  return {
    min: FIRST_TRIMESTER_GAIN_KG.min + category.weekly.min * laterWeeks,
    max: FIRST_TRIMESTER_GAIN_KG.max + category.weekly.max * laterWeeks,
    prorated: false,
  };
}

/**
 * Full gestational weight target assessment.
 *
 * @param {object} input
 * @param {number} input.prePregnancyWeightKg
 * @param {number} input.heightCm
 * @param {number} input.week Current gestational week.
 * @param {number} [input.currentWeightKg] Optional — enables the on-track check.
 * @param {boolean} [input.twins]
 * @returns {object} results or { error }
 */
export function computeGestationalWeightTarget({
  prePregnancyWeightKg,
  heightCm,
  week,
  currentWeightKg = null,
  twins = false,
} = {}) {
  const preWeight = Number(prePregnancyWeightKg);
  const height = Number(heightCm);
  const w = Number(week);

  if (!Number.isFinite(preWeight) || preWeight < MIN_WEIGHT_KG || preWeight > MAX_WEIGHT_KG) {
    return { error: `Pre-pregnancy weight should be between ${MIN_WEIGHT_KG} and ${MAX_WEIGHT_KG} kg.` };
  }
  if (!Number.isFinite(height) || height < MIN_HEIGHT_CM || height > MAX_HEIGHT_CM) {
    return { error: `Height should be between ${MIN_HEIGHT_CM} and ${MAX_HEIGHT_CM} cm.` };
  }
  if (!Number.isFinite(w) || w < MIN_WEEK || w > MAX_WEEK) {
    return { error: `Gestational week should be between ${MIN_WEEK} and ${MAX_WEEK}.` };
  }

  const bmi = bodyMassIndex({ weightKg: preWeight, heightCm: height });
  const category = categoryForBmi(bmi);
  if (!category) return { error: "Could not compute BMI from those figures." };

  const isTwins = twins === true;
  const totalRange = isTwins ? category.twins : category.total;

  if (isTwins && !totalRange) {
    return {
      bmi,
      category,
      twins: true,
      totalRange: null,
      error: null,
      noTwinGuideline: true,
      message:
        "The IOM did not issue a twin-pregnancy range for underweight women because the evidence was insufficient — your obstetrician should set an individual target.",
      expected: null,
      progress: null,
      weeklyRange: null,
      remaining: null,
    };
  }

  const expected = expectedGainByWeek({ week: w, category, twins: isTwins });

  let progress = null;
  const current = Number(currentWeightKg);
  if (currentWeightKg !== null && currentWeightKg !== "" && Number.isFinite(current)) {
    if (current < MIN_WEIGHT_KG || current > MAX_WEIGHT_KG) {
      return { error: `Current weight should be between ${MIN_WEIGHT_KG} and ${MAX_WEIGHT_KG} kg.` };
    }
    const gain = current - preWeight;
    let status = "within";
    if (expected && gain < expected.min) status = "below";
    else if (expected && gain > expected.max) status = "above";
    progress = {
      currentWeightKg: current,
      gain,
      status,
      shortfall: expected ? Math.max(0, expected.min - gain) : 0,
      excess: expected ? Math.max(0, gain - expected.max) : 0,
      remainingToTargetMin: totalRange.min - gain,
      remainingToTargetMax: totalRange.max - gain,
      // Clamped at zero: once the lower target is reached there is nothing left to gain for it.
      remainingToLowerTarget: Math.max(0, totalRange.min - gain),
    };
  }

  const weeksLeft = Math.max(0, 40 - w);

  return {
    bmi,
    category,
    twins: isTwins,
    week: w,
    totalRange,
    weeklyRange: isTwins ? null : category.weekly,
    expected,
    progress,
    weeksLeft,
    firstTrimesterRange: FIRST_TRIMESTER_GAIN_KG,
    noTwinGuideline: false,
  };
}
