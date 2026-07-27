/**
 * Paleo macronutrient targets.
 *
 *   1. BMR from Mifflin-St Jeor (1990):
 *        men   = 10 x kg + 6.25 x cm - 5 x age + 5
 *        women = 10 x kg + 6.25 x cm - 5 x age - 161
 *   2. TDEE = BMR x activity multiplier.
 *   3. Calories = TDEE + goal adjustment, held at a safety floor.
 *   4. Protein = grams per kg x body weight (paleo runs protein-forward).
 *   5. Fat = a chosen share of energy.
 *   6. Carbohydrate takes the remainder, and is then expressed in the foods a
 *      paleo diet actually gets carbohydrate from: tubers, fruit and vegetables.
 *   7. Fibre = 14 g per 1,000 kcal.
 *
 * Paleo is defined by which foods are included, not by a fixed macro ratio, so
 * the split here is adjustable rather than dictated.
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

/** Paleo eating tends to land near the top of the usual protein range. */
export const PROTEIN_PER_KG_MIN = 0.8;
export const PROTEIN_PER_KG_DEFAULT = 1.8;
export const PROTEIN_PER_KG_MAX = 2.5;

/**
 * Fat commonly supplies 35-45% of energy on a paleo diet because the grain and
 * legume calories are gone and have to be replaced somewhere.
 */
export const FAT_PCT_DEFAULT = 40;
export const FAT_PCT_MIN = 20;
export const FAT_PCT_MAX = 60;

/** Fibre adequate intake: 14 g per 1,000 kcal (Institute of Medicine). */
export const FIBRE_G_PER_1000_KCAL = 14;

/**
 * Above roughly 35% of energy from protein you run into the practical ceiling
 * on urea synthesis; treated here as a warning, not a hard limit.
 */
export const PROTEIN_ENERGY_WARNING_PCT = 35;

export const LIMITS = {
  weightKg: { min: 25, max: 300 },
  heightCm: { min: 100, max: 250 },
  age: { min: 14, max: 100 },
};

/** Food groups a strict paleo template leaves out, and the usual reason given. */
export const EXCLUDED_GROUPS = [
  ["Cereal grains", "Wheat, rice, oats, corn and anything made from them."],
  ["Legumes", "Beans, lentils, peanuts and soy, including peanut butter."],
  ["Dairy", "Milk, cheese, yoghurt and butter — though some versions allow ghee."],
  ["Refined sugar and refined oils", "Table sugar, syrups, and industrially refined seed oils."],
  ["Most processed foods", "Anything with an ingredient list built around the above."],
];

/**
 * Typical composition per 100 g as eaten. Paleo-compliant carbohydrate sources.
 * Reference values for planning; varieties and cooking method shift them.
 */
export const PALEO_CARB_SOURCES = [
  { id: "sweet-potato", label: "Cooked sweet potato", carbsPer100g: 20.7, kcalPer100g: 90, fibrePer100g: 3.3 },
  { id: "banana", label: "Banana", carbsPer100g: 22.8, kcalPer100g: 89, fibrePer100g: 2.6 },
  { id: "butternut", label: "Cooked butternut squash", carbsPer100g: 10.5, kcalPer100g: 40, fibrePer100g: 2 },
  { id: "apple", label: "Apple", carbsPer100g: 13.8, kcalPer100g: 52, fibrePer100g: 2.4 },
  { id: "blueberries", label: "Blueberries", carbsPer100g: 14.5, kcalPer100g: 57, fibrePer100g: 2.4 },
  { id: "carrot", label: "Carrot", carbsPer100g: 9.6, kcalPer100g: 41, fibrePer100g: 2.8 },
  { id: "broccoli", label: "Cooked broccoli", carbsPer100g: 7.2, kcalPer100g: 35, fibrePer100g: 3.3 },
];

/** Paleo-compliant protein sources, protein per 100 g as eaten. */
export const PALEO_PROTEIN_SOURCES = [
  { id: "chicken-breast", label: "Cooked chicken breast", proteinPer100g: 31, kcalPer100g: 165 },
  { id: "beef-mince", label: "Cooked lean beef mince", proteinPer100g: 26, kcalPer100g: 217 },
  { id: "salmon", label: "Cooked salmon", proteinPer100g: 25, kcalPer100g: 206 },
  { id: "eggs", label: "Whole eggs", proteinPer100g: 12.6, kcalPer100g: 143 },
  { id: "prawns", label: "Cooked prawns", proteinPer100g: 24, kcalPer100g: 99 },
];

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
 * @param {number} [input.fatPct]
 * @returns {object} targets, or { error }
 */
export function computePaleoMacros({
  sex,
  weightKg,
  heightCm,
  age,
  activityId = "moderate",
  goalId = "maintain",
  proteinPerKg = PROTEIN_PER_KG_DEFAULT,
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

  const proteinGrams = perKg * weight;
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

  const carbGrams = carbKcal / KCAL_PER_G_CARB;
  const proteinPct = (proteinKcal / calories) * 100;

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
    carbs: { grams: carbGrams, kcal: carbKcal, pct: (carbKcal / calories) * 100 },
    fibreGrams: (calories / 1000) * FIBRE_G_PER_1000_KCAL,
    proteinWarning: proteinPct > PROTEIN_ENERGY_WARNING_PCT,
    carbPortions: PALEO_CARB_SOURCES.map((source) => ({
      ...source,
      gramsForDailyCarbs: gramsForMacro(carbGrams, source.carbsPer100g),
    })),
    proteinPortions: PALEO_PROTEIN_SOURCES.map((source) => ({
      ...source,
      gramsForDailyProtein: gramsForMacro(proteinGrams, source.proteinPer100g),
    })),
  };
}
