/**
 * Indian lacto-vegetarian macronutrient targets, plus a plate builder that
 * converts those targets into chapatis, katoris and grams of paneer.
 *
 *   1. BMR from Mifflin-St Jeor (1990):
 *        men   = 10 x kg + 6.25 x cm - 5 x age + 5
 *        women = 10 x kg + 6.25 x cm - 5 x age - 161
 *   2. TDEE = BMR x activity multiplier.
 *   3. Calories = TDEE + goal adjustment, held at a safety floor.
 *   4. Protein = g per kg x weight x a digestibility adjustment.
 *   5. Fat = a chosen share of energy; carbohydrate takes the rest.
 *   6. Fibre = 14 g per 1,000 kcal.
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

/**
 * A lacto-vegetarian diet mixes high-quality dairy protein with cereals and
 * pulses that score lower on PDCAAS/DIAAS, so the adjustment sits between the
 * omnivore figure (1.0) and the all-plant figure (about 1.15-1.2).
 */
export const VEG_PROTEIN_ADJUSTMENT = 1.1;
export const VEG_PROTEIN_ADJUSTMENT_MIN = 1;
export const VEG_PROTEIN_ADJUSTMENT_MAX = 1.25;

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
 * Typical composition per 100 g as eaten, with a household portion size.
 * A "katori" is taken as 150 g of the cooked dish. These are representative
 * values for planning — thickness of dal, amount of tempering oil and the
 * brand of paneer all move them, so weigh and check labels when it matters.
 */
export const INDIAN_VEG_FOODS = [
  {
    id: "chapati",
    label: "Chapati / roti",
    portionLabel: "1 medium (30 g atta)",
    portionGrams: 30,
    per100g: { kcal: 340, protein: 12, carbs: 72, fat: 1.7 },
  },
  {
    id: "rice",
    label: "Cooked rice",
    portionLabel: "1 katori (150 g)",
    portionGrams: 150,
    per100g: { kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  },
  {
    id: "dal",
    label: "Cooked toor dal (thick)",
    portionLabel: "1 katori (150 g)",
    portionGrams: 150,
    per100g: { kcal: 121, protein: 6.8, carbs: 23.2, fat: 0.4 },
  },
  {
    id: "rajma",
    label: "Cooked rajma",
    portionLabel: "1 katori (150 g)",
    portionGrams: 150,
    per100g: { kcal: 127, protein: 8.7, carbs: 22.8, fat: 0.5 },
  },
  {
    id: "paneer",
    label: "Paneer (full fat)",
    portionLabel: "100 g",
    portionGrams: 100,
    per100g: { kcal: 296, protein: 18, carbs: 3.6, fat: 24 },
  },
  {
    id: "curd",
    label: "Curd / dahi (whole milk)",
    portionLabel: "1 katori (150 g)",
    portionGrams: 150,
    per100g: { kcal: 60, protein: 3.1, carbs: 4.7, fat: 3.3 },
  },
  {
    id: "milk",
    label: "Toned milk",
    portionLabel: "1 glass (200 ml)",
    portionGrams: 200,
    per100g: { kcal: 58, protein: 3.1, carbs: 4.7, fat: 3 },
  },
  {
    id: "soya",
    label: "Soya chunks (dry weight)",
    portionLabel: "30 g dry",
    portionGrams: 30,
    per100g: { kcal: 345, protein: 52, carbs: 33, fat: 0.5 },
  },
  {
    id: "peanuts",
    label: "Peanuts",
    portionLabel: "30 g",
    portionGrams: 30,
    per100g: { kcal: 567, protein: 26, carbs: 16, fat: 49 },
  },
  {
    id: "ghee",
    label: "Ghee or oil",
    portionLabel: "1 tsp (5 g)",
    portionGrams: 5,
    per100g: { kcal: 900, protein: 0, carbs: 0, fat: 100 },
  },
];

export function mifflinStJeorBmr({ sex, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

/** Macros contributed by one household portion of a food. */
export function portionMacros(food) {
  const factor = food.portionGrams / 100;
  return {
    kcal: food.per100g.kcal * factor,
    protein: food.per100g.protein * factor,
    carbs: food.per100g.carbs * factor,
    fat: food.per100g.fat * factor,
  };
}

/**
 * Add up a day's plate.
 * @param {object} counts { chapati: 4, rice: 1, ... } number of portions
 * @returns {object} totals, or { error } when a count is not a sane number
 */
export function tallyPlate(counts = {}) {
  const totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  const rows = [];
  for (const food of INDIAN_VEG_FOODS) {
    const portions = Number(counts[food.id] ?? 0);
    if (!Number.isFinite(portions) || portions < 0 || portions > 50) {
      return { error: `${food.label}: portions must be between 0 and 50.` };
    }
    if (portions === 0) continue;
    const one = portionMacros(food);
    const row = {
      id: food.id,
      label: food.label,
      portionLabel: food.portionLabel,
      portions,
      kcal: one.kcal * portions,
      protein: one.protein * portions,
      carbs: one.carbs * portions,
      fat: one.fat * portions,
    };
    rows.push(row);
    totals.kcal += row.kcal;
    totals.protein += row.protein;
    totals.carbs += row.carbs;
    totals.fat += row.fat;
  }
  return { totals, rows };
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
 * @param {number} [input.proteinAdjustment]
 * @param {number} [input.fatPct]
 * @returns {object} targets, or { error }
 */
export function computeIndianVegMacros({
  sex,
  weightKg,
  heightCm,
  age,
  activityId = "moderate",
  goalId = "maintain",
  proteinPerKg = PROTEIN_PER_KG_DEFAULT,
  proteinAdjustment = VEG_PROTEIN_ADJUSTMENT,
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

  const adjustment = Number(proteinAdjustment);
  if (
    !Number.isFinite(adjustment) ||
    adjustment < VEG_PROTEIN_ADJUSTMENT_MIN ||
    adjustment > VEG_PROTEIN_ADJUSTMENT_MAX
  ) {
    return {
      error: `The protein quality adjustment must be between ${VEG_PROTEIN_ADJUSTMENT_MIN} and ${VEG_PROTEIN_ADJUSTMENT_MAX}.`,
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
    proteinAdjustment: adjustment,
    protein: { grams: proteinGrams, kcal: proteinKcal, pct: (proteinKcal / calories) * 100 },
    fat: { grams: fatGrams, kcal: fatKcal, pct: (fatKcal / calories) * 100 },
    carbs: { grams: carbKcal / KCAL_PER_G_CARB, kcal: carbKcal, pct: (carbKcal / calories) * 100 },
    fibreGrams: (calories / 1000) * FIBRE_G_PER_1000_KCAL,
  };
}

/** How a tallied plate compares with the day's targets. */
export function compareToTargets(totals, targets) {
  if (!totals || !targets) return null;
  const gap = (eaten, target) => ({
    eaten,
    target,
    remaining: target - eaten,
    pct: target > 0 ? (eaten / target) * 100 : null,
  });
  return {
    kcal: gap(totals.kcal, targets.calories),
    protein: gap(totals.protein, targets.protein.grams),
    carbs: gap(totals.carbs, targets.carbs.grams),
    fat: gap(totals.fat, targets.fat.grams),
  };
}
