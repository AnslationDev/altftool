/**
 * Carnivore (all-animal-food) macronutrient targets.
 *
 *   1. BMR from Mifflin-St Jeor (1990):
 *        men   = 10 x kg + 6.25 x cm - 5 x age + 5
 *        women = 10 x kg + 6.25 x cm - 5 x age - 161
 *   2. TDEE = BMR x activity multiplier.
 *   3. Calories = TDEE + goal adjustment, held at a safety floor.
 *   4. Carbohydrate is fixed at whatever trace amount you allow (usually 0).
 *   5. Protein = grams per kg x body weight.
 *   6. Fat takes every remaining calorie.
 *   7. The fat-to-protein ratio by weight is reported, because that is the
 *      number carnivore eaters actually use to pick cuts.
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

export const CALORIE_FLOOR = { female: 1200, male: 1500 };

export const PROTEIN_PER_KG_MIN = 0.8;
export const PROTEIN_PER_KG_DEFAULT = 1.8;
export const PROTEIN_PER_KG_MAX = 3;

/**
 * Protein above roughly 35% of total energy for a sustained period is the
 * threshold associated with protein poisoning ("rabbit starvation"), the
 * condition seen historically when only very lean meat was available. On an
 * all-meat diet fat is what keeps protein below that share, which is why this
 * calculator warns rather than simply returning the number.
 */
export const PROTEIN_ENERGY_CEILING_PCT = 35;

/** Carnivore eaters commonly target 1-2 g of fat per gram of protein. */
export const FAT_PROTEIN_RATIO_LOW = 1;
export const FAT_PROTEIN_RATIO_HIGH = 2;

/** Trace carbohydrate allowance; strict carnivore is 0 g. */
export const CARB_ALLOWANCE_DEFAULT_G = 0;
export const CARB_ALLOWANCE_MAX_G = 20;

export const LIMITS = {
  weightKg: { min: 25, max: 300 },
  heightCm: { min: 100, max: 250 },
  age: { min: 14, max: 100 },
};

/**
 * Typical composition per 100 g as eaten (cooked where relevant). Cuts vary a
 * great deal — a ribeye's fat content depends on the grade and the trim — so
 * treat these as planning values, not label accuracy.
 */
export const CARNIVORE_FOODS = [
  { id: "ribeye", label: "Ribeye steak", proteinPer100g: 24, fatPer100g: 21, kcalPer100g: 291 },
  { id: "beef-80-20", label: "Ground beef, 80/20", proteinPer100g: 26, fatPer100g: 16, kcalPer100g: 254 },
  { id: "beef-liver", label: "Beef liver", proteinPer100g: 26.5, fatPer100g: 4.7, kcalPer100g: 175 },
  { id: "salmon", label: "Salmon", proteinPer100g: 25, fatPer100g: 11, kcalPer100g: 206 },
  { id: "chicken-thigh", label: "Chicken thigh with skin", proteinPer100g: 25, fatPer100g: 14, kcalPer100g: 229 },
  { id: "pork-belly", label: "Pork belly", proteinPer100g: 9.3, fatPer100g: 53, kcalPer100g: 518 },
  { id: "bacon", label: "Bacon", proteinPer100g: 37, fatPer100g: 42, kcalPer100g: 541 },
  { id: "eggs", label: "Whole eggs", proteinPer100g: 12.6, fatPer100g: 9.5, kcalPer100g: 143 },
  { id: "butter", label: "Butter", proteinPer100g: 0.85, fatPer100g: 81, kcalPer100g: 717 },
  { id: "tallow", label: "Beef tallow", proteinPer100g: 0, fatPer100g: 100, kcalPer100g: 902 },
];

/** Butter is used as the default way to close a fat shortfall. */
export const FAT_TOPUP_FOOD_ID = "butter";

export function mifflinStJeorBmr({ sex, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

/** Grams of a food needed to supply a given amount of a macronutrient. */
export function gramsForMacro(targetGrams, macroPer100g) {
  if (!Number.isFinite(targetGrams) || targetGrams < 0) return null;
  if (!Number.isFinite(macroPer100g) || macroPer100g <= 0) return null;
  return (targetGrams / macroPer100g) * 100;
}

/** Grams of fat per gram of protein in a food, or null when it has no protein. */
export function fatProteinRatio(fatGrams, proteinGrams) {
  if (!Number.isFinite(fatGrams) || fatGrams < 0) return null;
  if (!Number.isFinite(proteinGrams) || proteinGrams <= 0) return null;
  return fatGrams / proteinGrams;
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
 * @param {number} [input.carbGrams]  trace carbohydrate allowance
 * @returns {object} targets, or { error }
 */
export function computeCarnivoreMacros({
  sex,
  weightKg,
  heightCm,
  age,
  activityId = "moderate",
  goalId = "maintain",
  proteinPerKg = PROTEIN_PER_KG_DEFAULT,
  carbGrams = CARB_ALLOWANCE_DEFAULT_G,
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

  const carbs = Number(carbGrams);
  if (!Number.isFinite(carbs) || carbs < 0 || carbs > CARB_ALLOWANCE_MAX_G) {
    return { error: `The carbohydrate allowance must be between 0 and ${CARB_ALLOWANCE_MAX_G} g.` };
  }

  const bmr = mifflinStJeorBmr({ sex, weightKg: weight, heightCm: height, age: years });
  const tdee = bmr * activity.multiplier;
  const rawTarget = tdee + goal.deltaKcal;
  const floor = CALORIE_FLOOR[sex];
  const floored = rawTarget < floor;
  const calories = floored ? floor : rawTarget;

  const proteinGrams = perKg * weight;
  const proteinKcal = proteinGrams * KCAL_PER_G_PROTEIN;
  const carbKcal = carbs * KCAL_PER_G_CARB;
  const fatKcal = calories - proteinKcal - carbKcal;

  if (fatKcal <= 0) {
    return {
      error:
        "Protein alone already exceeds the calorie target, which leaves no room for fat. Lower the grams per kilogram or choose a smaller deficit.",
    };
  }

  const fatGrams = fatKcal / KCAL_PER_G_FAT;
  const proteinPct = (proteinKcal / calories) * 100;
  const ratio = fatProteinRatio(fatGrams, proteinGrams);

  const topup = CARNIVORE_FOODS.find((food) => food.id === FAT_TOPUP_FOOD_ID);
  const foods = CARNIVORE_FOODS.map((food) => {
    const foodRatio = fatProteinRatio(food.fatPer100g, food.proteinPer100g);
    const gramsForProtein = gramsForMacro(proteinGrams, food.proteinPer100g);
    const fatDelivered = gramsForProtein === null ? null : (gramsForProtein / 100) * food.fatPer100g;
    const fatGap = fatDelivered === null ? null : fatGrams - fatDelivered;
    return {
      ...food,
      ratio: foodRatio,
      ratioGap: foodRatio === null || ratio === null ? null : Math.abs(foodRatio - ratio),
      gramsForProtein,
      fatDelivered,
      fatGap,
      topupGrams:
        fatGap === null || fatGap <= 0 || !topup ? null : gramsForMacro(fatGap, topup.fatPer100g),
    };
  });

  const matches = foods.filter((food) => food.ratioGap !== null).sort((a, b) => a.ratioGap - b.ratioGap);

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
    protein: { grams: proteinGrams, kcal: proteinKcal, pct: proteinPct },
    fat: { grams: fatGrams, kcal: fatKcal, pct: (fatKcal / calories) * 100 },
    carbs: { grams: carbs, kcal: carbKcal, pct: (carbKcal / calories) * 100 },
    fatProteinRatio: ratio,
    ratioInRange: ratio !== null && ratio >= FAT_PROTEIN_RATIO_LOW && ratio <= FAT_PROTEIN_RATIO_HIGH,
    proteinCeilingBreached: proteinPct > PROTEIN_ENERGY_CEILING_PCT,
    topupFoodLabel: topup ? topup.label : null,
    foods,
    bestMatch: matches.length > 0 ? matches[0] : null,
  };
}
