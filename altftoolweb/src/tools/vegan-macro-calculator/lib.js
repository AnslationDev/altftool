/**
 * Vegan macronutrient targets.
 *
 *   1. BMR from Mifflin-St Jeor (1990):
 *        men   = 10 x kg + 6.25 x cm - 5 x age + 5
 *        women = 10 x kg + 6.25 x cm - 5 x age - 161
 *   2. TDEE = BMR x activity multiplier.
 *   3. Calories = TDEE + goal adjustment, held at a safety floor.
 *   4. Protein = grams per kg x body weight, then multiplied by a plant
 *      digestibility factor (see PLANT_PROTEIN_ADJUSTMENT).
 *   5. Fat = a chosen percentage of total energy.
 *   6. Carbohydrate takes the remaining calories.
 *   7. Fibre target = 14 g per 1,000 kcal.
 *
 * Atwater factors: 4 kcal/g protein, 4 kcal/g carbohydrate, 9 kcal/g fat.
 */

export const KCAL_PER_G_PROTEIN = 4;
export const KCAL_PER_G_CARB = 4;
export const KCAL_PER_G_FAT = 9;

/** ~7,700 kcal per kilogram of body fat (3,500 kcal per pound). */
export const KCAL_PER_KG_BODY_FAT = 7700;

export const ACTIVITY_LEVELS = [
  { id: "sedentary", label: "Sedentary — desk job, little exercise", multiplier: 1.2 },
  { id: "light", label: "Lightly active — 1-3 sessions a week", multiplier: 1.375 },
  { id: "moderate", label: "Moderately active — 3-5 sessions a week", multiplier: 1.55 },
  { id: "very", label: "Very active — 6-7 sessions a week", multiplier: 1.725 },
  { id: "extra", label: "Extra active — physical job or twice-daily training", multiplier: 1.9 },
];

export const GOALS = [
  { id: "cut-fast", label: "Lose weight quickly (-750 kcal)", deltaKcal: -750 },
  { id: "cut", label: "Lose weight (-500 kcal)", deltaKcal: -500 },
  { id: "cut-slow", label: "Lose slowly (-250 kcal)", deltaKcal: -250 },
  { id: "maintain", label: "Maintain weight", deltaKcal: 0 },
  { id: "gain-slow", label: "Gain slowly (+250 kcal)", deltaKcal: 250 },
  { id: "gain", label: "Gain weight (+500 kcal)", deltaKcal: 500 },
];

/** Mainstream floors for an unsupervised diet. */
export const CALORIE_FLOOR = { female: 1200, male: 1500 };

/**
 * Most plant proteins score lower than animal proteins on digestibility scales
 * such as PDCAAS and DIAAS, chiefly because of limiting amino acids and lower
 * absorption, so plant-based intake targets are commonly raised by 10-20%.
 * Soy and quinoa need little or no adjustment; a diet built on grains and
 * pulses needs more.
 */
export const PLANT_PROTEIN_ADJUSTMENT = 1.15;
export const PLANT_PROTEIN_ADJUSTMENT_MIN = 1;
export const PLANT_PROTEIN_ADJUSTMENT_MAX = 1.3;

/** Total fat between 20% and 35% of energy is the usual dietary-guideline band. */
export const FAT_PCT_DEFAULT = 27;
export const FAT_PCT_MIN = 15;
export const FAT_PCT_MAX = 40;

/** Fibre adequate intake: 14 g per 1,000 kcal (Institute of Medicine). */
export const FIBRE_G_PER_1000_KCAL = 14;

export const PROTEIN_PER_KG_MIN = 0.8;
export const PROTEIN_PER_KG_DEFAULT = 1.6;
export const PROTEIN_PER_KG_MAX = 2.5;

export const LIMITS = {
  weightKg: { min: 25, max: 300 },
  heightCm: { min: 100, max: 250 },
  age: { min: 14, max: 100 },
};

/**
 * Typical reference values per 100 g as eaten (cooked where relevant).
 * Brands and preparation vary — check the label on what you actually buy.
 */
export const PLANT_PROTEIN_SOURCES = [
  { id: "seitan", label: "Seitan", proteinPer100g: 25, kcalPer100g: 141, complete: false },
  { id: "tempeh", label: "Tempeh", proteinPer100g: 19, kcalPer100g: 192, complete: true },
  { id: "tofu", label: "Firm tofu", proteinPer100g: 17, kcalPer100g: 144, complete: true },
  { id: "lentils", label: "Cooked lentils", proteinPer100g: 9, kcalPer100g: 116, complete: false },
  { id: "chickpeas", label: "Cooked chickpeas", proteinPer100g: 8.9, kcalPer100g: 164, complete: false },
  { id: "kidney", label: "Cooked kidney beans", proteinPer100g: 8.7, kcalPer100g: 127, complete: false },
  { id: "quinoa", label: "Cooked quinoa", proteinPer100g: 4.4, kcalPer100g: 120, complete: true },
  { id: "hemp", label: "Hemp seeds", proteinPer100g: 32, kcalPer100g: 553, complete: true },
  { id: "peanut-butter", label: "Peanut butter", proteinPer100g: 25, kcalPer100g: 588, complete: false },
  { id: "pumpkin-seeds", label: "Pumpkin seeds", proteinPer100g: 30, kcalPer100g: 559, complete: false },
  { id: "soy-milk", label: "Unsweetened soy milk", proteinPer100g: 3.3, kcalPer100g: 33, complete: true },
  { id: "tvp", label: "Textured soy protein (dry)", proteinPer100g: 52, kcalPer100g: 330, complete: true },
];

/**
 * Complementary pairings. Cereals are typically limiting in lysine; pulses are
 * typically limiting in the sulphur amino acids methionine and cysteine, so the
 * two cover each other. Current guidance is that this variety only has to
 * happen across the day, not within a single meal.
 */
export const COMPLEMENTARY_PAIRS = [
  ["Rice + beans", "Rice is short on lysine, beans are short on methionine."],
  ["Dal + roti or rice", "The classic pulse-and-cereal pairing, covering both limiting amino acids."],
  ["Hummus + wholewheat pita", "Chickpeas supply the lysine wheat lacks."],
  ["Peanut butter + wholegrain bread", "Legume and cereal again, in sandwich form."],
  ["Tofu or tempeh on its own", "Soy is already complete, so it needs no partner."],
];

export function mifflinStJeorBmr({ sex, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

/** Grams of a food needed to supply a given amount of protein. */
export function gramsForProtein(targetGrams, proteinPer100g) {
  if (!Number.isFinite(targetGrams) || targetGrams < 0) return null;
  if (!Number.isFinite(proteinPer100g) || proteinPer100g <= 0) return null;
  return (targetGrams / proteinPer100g) * 100;
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
 * @param {number} [input.proteinPerKg]
 * @param {number} [input.plantAdjustment] digestibility multiplier, 1.0-1.3
 * @param {number} [input.fatPct]          share of energy from fat
 * @returns {object} targets, or { error }
 */
export function computeVeganMacros({
  sex,
  weightKg,
  heightCm,
  age,
  activityId = "moderate",
  goalId = "maintain",
  proteinPerKg = PROTEIN_PER_KG_DEFAULT,
  plantAdjustment = PLANT_PROTEIN_ADJUSTMENT,
  fatPct = FAT_PCT_DEFAULT,
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

  const perKg = Number(proteinPerKg);
  if (!Number.isFinite(perKg) || perKg < PROTEIN_PER_KG_MIN || perKg > PROTEIN_PER_KG_MAX) {
    return { error: `Protein must be between ${PROTEIN_PER_KG_MIN} and ${PROTEIN_PER_KG_MAX} g per kg.` };
  }

  const adjustment = Number(plantAdjustment);
  if (
    !Number.isFinite(adjustment) ||
    adjustment < PLANT_PROTEIN_ADJUSTMENT_MIN ||
    adjustment > PLANT_PROTEIN_ADJUSTMENT_MAX
  ) {
    return {
      error: `The plant protein adjustment must be between ${PLANT_PROTEIN_ADJUSTMENT_MIN} and ${PLANT_PROTEIN_ADJUSTMENT_MAX}.`,
    };
  }

  const fatShare = Number(fatPct);
  if (!Number.isFinite(fatShare) || fatShare < FAT_PCT_MIN || fatShare > FAT_PCT_MAX) {
    return { error: `Fat must be between ${FAT_PCT_MIN}% and ${FAT_PCT_MAX}% of energy.` };
  }

  const bmr = mifflinStJeorBmr({ sex, weightKg: weight, heightCm: height, age: years });
  const tdee = bmr * activity.multiplier;
  const rawTarget = tdee + goal.deltaKcal;
  const floor = CALORIE_FLOOR[sex];
  const floored = rawTarget < floor;
  const calories = floored ? floor : rawTarget;

  const proteinBaseGrams = perKg * weight;
  const proteinGrams = proteinBaseGrams * adjustment;
  const proteinKcal = proteinGrams * KCAL_PER_G_PROTEIN;

  const fatKcal = calories * (fatShare / 100);
  const fatGrams = fatKcal / KCAL_PER_G_FAT;

  const carbKcal = calories - proteinKcal - fatKcal;
  if (carbKcal <= 0) {
    return {
      error:
        "Protein and fat alone already use up the calorie target. Lower the protein per kg or the fat percentage.",
    };
  }

  return {
    bmr,
    tdee,
    calories,
    rawTarget,
    floored,
    floor,
    goalLabel: goal.label,
    activityLabel: activity.label,
    weeklyKgChange: (goal.deltaKcal * 7) / KCAL_PER_KG_BODY_FAT,
    proteinBaseGrams,
    plantAdjustment: adjustment,
    protein: { grams: proteinGrams, kcal: proteinKcal, pct: (proteinKcal / calories) * 100 },
    fat: { grams: fatGrams, kcal: fatKcal, pct: (fatKcal / calories) * 100 },
    carbs: { grams: carbKcal / KCAL_PER_G_CARB, kcal: carbKcal, pct: (carbKcal / calories) * 100 },
    fibreGrams: (calories / 1000) * FIBRE_G_PER_1000_KCAL,
    sourcePortions: PLANT_PROTEIN_SOURCES.map((source) => ({
      ...source,
      gramsForDailyProtein: gramsForProtein(proteinGrams, source.proteinPer100g),
    })),
  };
}
