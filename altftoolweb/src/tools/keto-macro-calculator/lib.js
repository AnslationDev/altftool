/**
 * Ketogenic macronutrient targets.
 *
 * Chain of rules:
 *   1. BMR from the Mifflin-St Jeor equation (Mifflin et al., 1990):
 *        men   BMR = 10 x kg + 6.25 x cm - 5 x age + 5
 *        women BMR = 10 x kg + 6.25 x cm - 5 x age - 161
 *   2. TDEE = BMR x activity multiplier.
 *   3. Calorie target = TDEE + goal adjustment, clamped to a safety floor.
 *   4. Net carbs are FIXED first (that is what makes a diet ketogenic).
 *   5. Protein is set from grams per kilogram of reference weight.
 *   6. Fat takes every remaining calorie.
 *
 * Energy conversions are the Atwater factors: 4 kcal/g protein, 4 kcal/g
 * carbohydrate, 9 kcal/g fat.
 */

export const KCAL_PER_G_PROTEIN = 4;
export const KCAL_PER_G_CARB = 4;
export const KCAL_PER_G_FAT = 9;

/** ~7,700 kcal is the energy in a kilogram of body fat (3,500 kcal per pound). */
export const KCAL_PER_KG_BODY_FAT = 7700;

/** Harris-Benedict style activity multipliers, the set used by most TDEE tools. */
export const ACTIVITY_LEVELS = [
  { id: "sedentary", label: "Sedentary — desk job, little exercise", multiplier: 1.2 },
  { id: "light", label: "Lightly active — 1-3 sessions a week", multiplier: 1.375 },
  { id: "moderate", label: "Moderately active — 3-5 sessions a week", multiplier: 1.55 },
  { id: "very", label: "Very active — 6-7 sessions a week", multiplier: 1.725 },
  { id: "extra", label: "Extra active — physical job or twice-daily training", multiplier: 1.9 },
];

/** A 500 kcal daily deficit is the classic 3,500 kcal-per-pound-a-week rule. */
export const GOALS = [
  { id: "cut-fast", label: "Lose weight quickly (-750 kcal)", deltaKcal: -750 },
  { id: "cut", label: "Lose weight (-500 kcal)", deltaKcal: -500 },
  { id: "cut-slow", label: "Lose slowly (-250 kcal)", deltaKcal: -250 },
  { id: "maintain", label: "Maintain weight", deltaKcal: 0 },
  { id: "gain-slow", label: "Gain slowly (+250 kcal)", deltaKcal: 250 },
  { id: "gain", label: "Gain weight (+500 kcal)", deltaKcal: 500 },
];

/**
 * Floors below which a diet should not be self-directed. 1,200 kcal for women
 * and 1,500 kcal for men are the figures used in mainstream weight-management
 * guidance; below them, medical supervision is the standard advice.
 */
export const CALORIE_FLOOR = { female: 1200, male: 1500 };

/**
 * A standard ketogenic diet is generally defined as under 50 g of net carbs a
 * day; 20-30 g is the range most people use to reach ketosis reliably.
 */
export const KETO_NET_CARB_DEFAULT_G = 25;
export const KETO_NET_CARB_MAX_G = 50;

/** Protein targets in grams per kg of reference weight. */
export const PROTEIN_PER_KG_MIN = 0.8;
export const PROTEIN_PER_KG_DEFAULT = 1.6;
export const PROTEIN_PER_KG_MAX = 2.5;

/**
 * Above roughly 35% of energy from protein, gluconeogenesis and the practical
 * limit on urea synthesis make very-high-protein intakes a poor fit for a
 * ketogenic diet. Treated here as a warning threshold, not a hard rule.
 */
export const PROTEIN_ENERGY_WARNING_PCT = 35;

/** Fat share typical of a working ketogenic diet. */
export const KETO_FAT_TARGET_PCT = 70;

/** Input guard rails. */
export const LIMITS = {
  weightKg: { min: 25, max: 300 },
  heightCm: { min: 100, max: 250 },
  age: { min: 14, max: 100 },
  bodyFatPct: { min: 3, max: 70 },
};

/** Mifflin-St Jeor resting metabolic rate in kcal/day. */
export function mifflinStJeorBmr({ sex, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

/** Lean body mass from weight and body-fat percentage. */
export function leanBodyMass(weightKg, bodyFatPct) {
  if (!Number.isFinite(bodyFatPct) || bodyFatPct <= 0) return null;
  return weightKg * (1 - bodyFatPct / 100);
}

function inRange(value, { min, max }) {
  return Number.isFinite(value) && value >= min && value <= max;
}

/**
 * @param {object} input
 * @param {"male"|"female"} input.sex
 * @param {number} input.weightKg
 * @param {number} input.heightCm
 * @param {number} input.age
 * @param {string} input.activityId
 * @param {string} input.goalId
 * @param {number} [input.netCarbGrams]  fixed carb budget for the day
 * @param {number} [input.proteinPerKg]
 * @param {number} [input.bodyFatPct]    optional; switches protein to lean mass
 * @returns {object} targets, or { error } when the input cannot produce a real answer
 */
export function computeKetoMacros({
  sex,
  weightKg,
  heightCm,
  age,
  activityId = "moderate",
  goalId = "cut",
  netCarbGrams = KETO_NET_CARB_DEFAULT_G,
  proteinPerKg = PROTEIN_PER_KG_DEFAULT,
  bodyFatPct = 0,
} = {}) {
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female — the Mifflin-St Jeor equation uses a different constant for each." };
  }

  const weight = Number(weightKg);
  const height = Number(heightCm);
  const years = Number(age);
  if (!inRange(weight, LIMITS.weightKg)) {
    return { error: `Weight must be between ${LIMITS.weightKg.min} and ${LIMITS.weightKg.max} kg.` };
  }
  if (!inRange(height, LIMITS.heightCm)) {
    return { error: `Height must be between ${LIMITS.heightCm.min} and ${LIMITS.heightCm.max} cm.` };
  }
  if (!inRange(years, LIMITS.age)) {
    return { error: `This calculator covers ages ${LIMITS.age.min} to ${LIMITS.age.max}.` };
  }

  const activity = ACTIVITY_LEVELS.find((level) => level.id === activityId);
  if (!activity) return { error: "Choose an activity level." };

  const goal = GOALS.find((option) => option.id === goalId);
  if (!goal) return { error: "Choose a weight goal." };

  const carbs = Number(netCarbGrams);
  if (!Number.isFinite(carbs) || carbs < 0 || carbs > KETO_NET_CARB_MAX_G) {
    return { error: `Net carbs must be between 0 and ${KETO_NET_CARB_MAX_G} g — above that it is no longer a ketogenic diet.` };
  }

  const perKg = Number(proteinPerKg);
  if (!Number.isFinite(perKg) || perKg < PROTEIN_PER_KG_MIN || perKg > PROTEIN_PER_KG_MAX) {
    return { error: `Protein must be between ${PROTEIN_PER_KG_MIN} and ${PROTEIN_PER_KG_MAX} g per kg.` };
  }

  const bodyFat = Number(bodyFatPct);
  if (bodyFat !== 0 && !inRange(bodyFat, LIMITS.bodyFatPct)) {
    return { error: `Body fat, if you enter it, must be between ${LIMITS.bodyFatPct.min}% and ${LIMITS.bodyFatPct.max}%.` };
  }

  const bmr = mifflinStJeorBmr({ sex, weightKg: weight, heightCm: height, age: years });
  const tdee = bmr * activity.multiplier;
  const rawTarget = tdee + goal.deltaKcal;
  const floor = CALORIE_FLOOR[sex];
  const floored = rawTarget < floor;
  const calories = floored ? floor : rawTarget;

  const lbm = leanBodyMass(weight, bodyFat);
  const referenceWeight = lbm ?? weight;
  const proteinGrams = perKg * referenceWeight;

  const carbKcal = carbs * KCAL_PER_G_CARB;
  const proteinKcal = proteinGrams * KCAL_PER_G_PROTEIN;
  const fatKcal = calories - carbKcal - proteinKcal;

  if (fatKcal <= 0) {
    return {
      error:
        "Protein and carbs alone already exceed the calorie target. Lower the grams of protein per kg, or pick a smaller deficit.",
    };
  }

  const fatGrams = fatKcal / KCAL_PER_G_FAT;
  const proteinPct = (proteinKcal / calories) * 100;

  return {
    bmr,
    tdee,
    calories,
    rawTarget,
    floored,
    floor,
    weeklyKgChange: (goal.deltaKcal * 7) / KCAL_PER_KG_BODY_FAT,
    goalLabel: goal.label,
    activityLabel: activity.label,
    referenceWeight,
    usedLeanMass: lbm !== null,
    protein: { grams: proteinGrams, kcal: proteinKcal, pct: proteinPct },
    fat: { grams: fatGrams, kcal: fatKcal, pct: (fatKcal / calories) * 100 },
    netCarbs: { grams: carbs, kcal: carbKcal, pct: (carbKcal / calories) * 100 },
    proteinWarning: proteinPct > PROTEIN_ENERGY_WARNING_PCT,
  };
}

/** Split a daily target across N meals. Returns null for a nonsense meal count. */
export function splitAcrossMeals(dailyGrams, meals) {
  if (!Number.isFinite(dailyGrams) || dailyGrams < 0) return null;
  if (!Number.isInteger(meals) || meals < 1 || meals > 8) return null;
  return dailyGrams / meals;
}
