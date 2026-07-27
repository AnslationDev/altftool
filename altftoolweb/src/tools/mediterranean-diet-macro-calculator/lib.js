/**
 * Mediterranean diet macro calculator.
 *
 * Energy
 * ------
 * Mifflin-St Jeor resting metabolic rate (Mifflin MD et al., Am J Clin Nutr
 * 1990;51:241-247) multiplied by a physical-activity factor, then adjusted for
 * the goal.
 *
 * Macro distribution
 * ------------------
 * The traditional Mediterranean pattern described by Willett et al.
 * (Am J Clin Nutr 1995;61:1402S) and the 2011 Mediterranean Diet Pyramid
 * (Bach-Faig A et al., Public Health Nutr 2011;14:2274-2284) is a relatively
 * HIGH-fat, high-monounsaturated pattern: total fat about 35-40% of energy with
 * olive oil as the principal added fat, protein about 15-18%, and the rest from
 * carbohydrate (whole grains, legumes, vegetables and fruit). Saturated fat is
 * kept under 10% of energy.
 *
 * Olive oil
 * ---------
 * The pyramid puts 3-4 servings of olive oil a day at the base of every main
 * meal. One tablespoon is 15 mL / 13.5 g of oil and 119 kcal (USDA FDC olive
 * oil, salad or cooking). The PREDIMED trial (Estruch R et al., N Engl J Med
 * 2013/2018) supplied its olive-oil arm with 50 mL (about 4 tbsp) of
 * extra-virgin olive oil a day and its nut arm with 30 g/day of mixed nuts made
 * up of 15 g walnuts, 7.5 g almonds and 7.5 g hazelnuts.
 *
 * Fibre target uses the Institute of Medicine adequate intake of 14 g per
 * 1,000 kcal.
 *
 * Informational only. Not medical or dietetic advice.
 */

/** Mifflin-St Jeor sex constants (kcal/day). */
export const MIFFLIN_OFFSET = { male: 5, female: -161 };

/** Physical-activity factors applied to resting metabolic rate. */
export const ACTIVITY_FACTORS = {
  sedentary: { factor: 1.2, label: "Sedentary (desk job, little exercise)" },
  light: { factor: 1.375, label: "Lightly active (1-3 sessions a week)" },
  moderate: { factor: 1.55, label: "Moderately active (3-5 sessions a week)" },
  very: { factor: 1.725, label: "Very active (6-7 sessions a week)" },
  athlete: { factor: 1.9, label: "Athlete (twice-daily training or physical job)" },
};

/** Goal adjustment applied to maintenance energy. */
export const GOALS = {
  lose: { adjust: -0.15, label: "Lose fat (15% below maintenance)" },
  maintain: { adjust: 0, label: "Maintain weight" },
  gain: { adjust: 0.1, label: "Gain weight (10% above maintenance)" },
};

/** Atwater energy factors, kcal per gram. */
export const KCAL_PER_GRAM = { carb: 4, protein: 4, fat: 9 };

/** Traditional Mediterranean energy shares (Willett 1995, Bach-Faig 2011). */
export const MED_SHARES = {
  fat: { min: 0.3, traditional: 0.37, max: 0.45 },
  protein: { min: 0.13, traditional: 0.17, max: 0.22 },
};

/** Saturated fat ceiling for the pattern: under 10% of total energy. */
export const SAT_FAT_MAX_SHARE = 0.1;

/** One tablespoon of olive oil: 15 mL, 13.5 g of fat, 119 kcal (USDA FoodData Central). */
export const OLIVE_OIL_TBSP = { mL: 15, fatGrams: 13.5, kcal: 119 };

/** PREDIMED extra-virgin olive oil allowance for the EVOO arm, mL/day. */
export const PREDIMED_EVOO_ML = 50;

/** Mediterranean Diet Pyramid daily olive-oil servings (1 serving = 1 tbsp). */
export const PYRAMID_OLIVE_OIL_TBSP = { min: 3, max: 4 };

/**
 * PREDIMED mixed-nut serving: 15 g walnuts + 7.5 g almonds + 7.5 g hazelnuts.
 * Composition from USDA FoodData Central per 100 g:
 *   walnut   654 kcal, 65.2 g fat, 15.2 g protein
 *   almond   579 kcal, 49.9 g fat, 21.2 g protein
 *   hazelnut 628 kcal, 60.8 g fat, 15.0 g protein
 */
export const PREDIMED_NUTS = {
  grams: 30,
  kcal: 15 * 6.54 + 7.5 * 5.79 + 7.5 * 6.28,
  fatGrams: 15 * 0.652 + 7.5 * 0.499 + 7.5 * 0.608,
  proteinGrams: 15 * 0.152 + 7.5 * 0.212 + 7.5 * 0.15,
};

/** Institute of Medicine adequate intake for fibre, g per 1,000 kcal. */
export const FIBRE_G_PER_1000_KCAL = 14;

/** Weekly food pattern from the 2011 Mediterranean Diet Pyramid. */
export const WEEKLY_PATTERN = [
  ["Fish and seafood", "2 or more servings a week"],
  ["Legumes (beans, lentils, chickpeas)", "2 or more servings a week"],
  ["White meat (poultry, rabbit)", "2 servings a week"],
  ["Eggs", "2-4 servings a week"],
  ["Red meat", "fewer than 2 servings a week"],
  ["Processed meat", "1 serving a week or less"],
  ["Potatoes", "3 servings a week or fewer"],
  ["Sweets", "2 servings a week or fewer"],
];

export const LIMITS = {
  age: { min: 18, max: 100 },
  weightKg: { min: 35, max: 250 },
  heightCm: { min: 130, max: 230 },
  oliveOilShare: { min: 0.1, max: 0.9 },
};

/** Mifflin-St Jeor resting metabolic rate, kcal/day. Returns null for an unknown sex. */
export function basalMetabolicRate(sex, weightKg, heightCm, age) {
  const offset = MIFFLIN_OFFSET[sex];
  if (offset === undefined) return null;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + offset;
}

/** Grams of olive-oil fat expressed as tablespoons (13.5 g per tbsp). */
export function fatGramsToTablespoons(fatGrams) {
  if (typeof fatGrams !== "number" || !Number.isFinite(fatGrams) || fatGrams < 0) return 0;
  return fatGrams / OLIVE_OIL_TBSP.fatGrams;
}

/**
 * Build a Mediterranean-style daily macro and olive-oil plan.
 *
 * @param {object} input
 * @param {"male"|"female"} input.sex
 * @param {number} input.age                 years
 * @param {number} input.weightKg
 * @param {number} input.heightCm
 * @param {string} input.activity            key of ACTIVITY_FACTORS
 * @param {string} input.goal                key of GOALS
 * @param {number} input.fatShare            total fat as a fraction of energy
 * @param {number} input.proteinShare        protein as a fraction of energy
 * @param {number} input.oliveOilShare       fraction of NON-nut fat coming from olive oil
 * @param {boolean} input.includeNuts        include the 30 g PREDIMED nut serving
 * @returns {object} the plan, or { error } when the input cannot produce a real answer
 */
export function mediterraneanMacros({
  sex,
  age,
  weightKg,
  heightCm,
  activity = "moderate",
  goal = "maintain",
  fatShare = MED_SHARES.fat.traditional,
  proteinShare = MED_SHARES.protein.traditional,
  oliveOilShare = 0.45,
  includeNuts = true,
}) {
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female so the correct BMR equation is used." };
  }
  const numeric = { age, weightKg, heightCm, fatShare, proteinShare, oliveOilShare };
  for (const [key, value] of Object.entries(numeric)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return { error: `Enter a valid number for ${key}.` };
    }
  }
  if (age < LIMITS.age.min || age > LIMITS.age.max) {
    return { error: `Age must be between ${LIMITS.age.min} and ${LIMITS.age.max} years.` };
  }
  if (weightKg < LIMITS.weightKg.min || weightKg > LIMITS.weightKg.max) {
    return { error: `Weight must be between ${LIMITS.weightKg.min} and ${LIMITS.weightKg.max} kg.` };
  }
  if (heightCm < LIMITS.heightCm.min || heightCm > LIMITS.heightCm.max) {
    return { error: `Height must be between ${LIMITS.heightCm.min} and ${LIMITS.heightCm.max} cm.` };
  }
  if (fatShare < MED_SHARES.fat.min || fatShare > MED_SHARES.fat.max) {
    return {
      error: `Mediterranean fat intake sits between ${Math.round(
        MED_SHARES.fat.min * 100,
      )}% and ${Math.round(MED_SHARES.fat.max * 100)}% of calories.`,
    };
  }
  if (proteinShare < MED_SHARES.protein.min || proteinShare > MED_SHARES.protein.max) {
    return {
      error: `Protein should be between ${Math.round(
        MED_SHARES.protein.min * 100,
      )}% and ${Math.round(MED_SHARES.protein.max * 100)}% of calories.`,
    };
  }
  if (oliveOilShare < LIMITS.oliveOilShare.min || oliveOilShare > LIMITS.oliveOilShare.max) {
    return { error: "Olive oil should supply between 10% and 90% of your fat." };
  }
  const activityDef = ACTIVITY_FACTORS[activity];
  if (!activityDef) return { error: "Choose an activity level." };
  const goalDef = GOALS[goal];
  if (!goalDef) return { error: "Choose a goal." };

  const bmr = basalMetabolicRate(sex, weightKg, heightCm, age);
  const tdee = bmr * activityDef.factor;
  const calories = tdee * (1 + goalDef.adjust);
  if (!(calories > 0)) {
    return { error: "These body measurements do not produce a usable calorie target." };
  }

  const fatKcal = calories * fatShare;
  const proteinKcal = calories * proteinShare;
  const carbKcal = calories - fatKcal - proteinKcal;
  if (carbKcal <= 0) {
    return {
      error: "Fat and protein together use up the whole calorie budget. Lower one of the two shares.",
    };
  }

  const fatGrams = fatKcal / KCAL_PER_GRAM.fat;
  const proteinGrams = proteinKcal / KCAL_PER_GRAM.protein;
  const carbGrams = carbKcal / KCAL_PER_GRAM.carb;

  const nutsFat = includeNuts ? PREDIMED_NUTS.fatGrams : 0;
  const nonNutFat = fatGrams - nutsFat;
  if (nonNutFat <= 0) {
    return {
      error:
        "The 30 g nut serving alone exceeds this fat budget. Raise calories or turn the nut serving off.",
    };
  }

  const oliveOilFatGrams = nonNutFat * oliveOilShare;
  const oliveOilTbsp = fatGramsToTablespoons(oliveOilFatGrams);
  const oliveOilMl = oliveOilTbsp * OLIVE_OIL_TBSP.mL;
  const oliveOilKcal = oliveOilTbsp * OLIVE_OIL_TBSP.kcal;
  const wholeFoodFatGrams = nonNutFat - oliveOilFatGrams;

  return {
    bmr,
    tdee,
    calories,
    activityLabel: activityDef.label,
    goalLabel: goalDef.label,
    fatGrams,
    proteinGrams,
    carbGrams,
    fatKcal,
    proteinKcal,
    carbKcal,
    fatShare: fatKcal / calories,
    proteinShare: proteinKcal / calories,
    carbShare: carbKcal / calories,
    proteinPerKg: proteinGrams / weightKg,
    oliveOilTbsp,
    oliveOilMl,
    oliveOilKcal,
    oliveOilFatGrams,
    wholeFoodFatGrams,
    nutsIncluded: includeNuts,
    nutsGrams: includeNuts ? PREDIMED_NUTS.grams : 0,
    nutsKcal: includeNuts ? PREDIMED_NUTS.kcal : 0,
    nutsFatGrams: nutsFat,
    nutsProteinGrams: includeNuts ? PREDIMED_NUTS.proteinGrams : 0,
    satFatMaxGrams: (calories * SAT_FAT_MAX_SHARE) / KCAL_PER_GRAM.fat,
    fibreTargetG: (calories / 1000) * FIBRE_G_PER_1000_KCAL,
    oliveOilBelowPyramid: oliveOilTbsp < PYRAMID_OLIVE_OIL_TBSP.min,
    oliveOilAbovePyramid: oliveOilTbsp > PYRAMID_OLIVE_OIL_TBSP.max,
    predimedEvooMl: PREDIMED_EVOO_ML,
  };
}
