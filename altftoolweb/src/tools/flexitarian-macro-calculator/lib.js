/**
 * Flexitarian macro calculator.
 *
 * The flexitarian approach (Dawn Jackson Blatner, The Flexitarian Diet) is
 * plant-first eating with a capped weekly meat allowance rather than outright
 * vegetarianism. It defines three levels by how many days a week are meatless and
 * how many ounces of meat the week holds:
 *
 *   Beginner   2 meatless days a week      up to 26 oz of meat a week
 *   Advanced   3-4 meatless days a week    up to 18 oz of meat a week
 *   Expert     5+ meatless days a week     up to  9 oz of meat a week
 *
 * Protein
 * -------
 * A standard meat exchange is 1 oz of cooked meat, poultry or fish = about 7 g of
 * protein, so the weekly allowance converts straight into grams. Whatever the
 * allowance does not cover has to come from plants, and plant protein sources
 * score lower on digestibility-corrected quality scales (PDCAAS/DIAAS) than animal
 * ones. A mixed, well-combined plant diet lands roughly 10% behind, so this tool
 * asks for about 10% more grams from the plant share to deliver the same usable
 * protein - the same reasoning behind the commonly quoted advice that vegetarians
 * should aim a little above the 0.8 g/kg RDA.
 *
 * Energy and the rest of the plate
 * --------------------------------
 * Mifflin-St Jeor BMR (Am J Clin Nutr 1990;51:241-247) x activity factor, adjusted
 * for the goal. Fat is set as a share of calories and carbohydrate takes the
 * remainder, which is what a plant-forward plate looks like in practice.
 *
 * Fibre target uses the Institute of Medicine adequate intake of 14 g per 1,000 kcal.
 *
 * Informational only, not medical or dietetic advice.
 */

/** Mifflin-St Jeor sex constants. */
export const MIFFLIN_OFFSET = { male: 5, female: -161 };

/** Physical-activity factors applied to BMR. */
export const ACTIVITY_FACTORS = {
  sedentary: { factor: 1.2, label: "Sedentary (desk job, little exercise)" },
  light: { factor: 1.375, label: "Lightly active (1-3 sessions a week)" },
  moderate: { factor: 1.55, label: "Moderately active (3-5 sessions a week)" },
  very: { factor: 1.725, label: "Very active (6-7 sessions a week)" },
  athlete: { factor: 1.9, label: "Athlete (twice-daily or physical job)" },
};

/** Goal adjustment applied to maintenance energy. */
export const GOALS = {
  lose: { adjust: -0.15, label: "Lose fat (15% below maintenance)" },
  maintain: { adjust: 0, label: "Maintain weight" },
  gain: { adjust: 0.1, label: "Gain weight (10% above maintenance)" },
};

/** Energy per gram, Atwater factors. */
export const KCAL_PER_GRAM = { carb: 4, protein: 4, fat: 9 };

/** The three published flexitarian levels. */
export const FLEXITARIAN_LEVELS = {
  beginner: {
    id: "beginner",
    name: "Beginner",
    meatlessDays: "2 days a week",
    meatlessDayCount: 2,
    maxMeatOzPerWeek: 26,
  },
  advanced: {
    id: "advanced",
    name: "Advanced",
    meatlessDays: "3-4 days a week",
    meatlessDayCount: 4,
    maxMeatOzPerWeek: 18,
  },
  expert: {
    id: "expert",
    name: "Expert",
    meatlessDays: "5 or more days a week",
    meatlessDayCount: 5,
    maxMeatOzPerWeek: 9,
  },
};

/** One ounce of cooked meat, poultry or fish supplies about 7 g of protein (standard meat exchange). */
export const PROTEIN_PER_OZ_MEAT = 7;

/** 1 ounce = 28.3495 g, used only to show the allowance in grams. */
export const GRAMS_PER_OZ = 28.3495;

/**
 * Plant protein delivers roughly 10% less usable protein per gram than animal
 * protein once digestibility and amino-acid scoring are accounted for.
 */
export const PLANT_PROTEIN_UPLIFT = 1.1;

/** Institute of Medicine adequate intake for fibre, g per 1,000 kcal. */
export const FIBRE_G_PER_1000_KCAL = 14;

/** Adult RDA for vitamin B12, micrograms per day (IOM). Worth watching as meat falls. */
export const B12_RDA_MCG = 2.4;

/** Fat below this share of calories is impractical; above it, carbs get squeezed. */
export const FAT_SHARE = { min: 0.2, sane: 0.3, max: 0.45 };

export const LIMITS = {
  age: { min: 18, max: 100 },
  weightKg: { min: 35, max: 250 },
  heightCm: { min: 130, max: 230 },
  proteinPerKg: { min: 0.8, max: 2.2 },
  weeklyMeatOz: { min: 0, max: 40 },
  servingOz: { min: 2, max: 8 },
};

/** Mifflin-St Jeor resting metabolic rate, kcal/day. */
export function basalMetabolicRate(sex, weightKg, heightCm, age) {
  const offset = MIFFLIN_OFFSET[sex];
  if (offset === undefined) return null;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + offset;
}

/**
 * Which flexitarian level a weekly meat intake actually corresponds to.
 * Returns null when the intake is above even the Beginner cap.
 */
export function levelForWeeklyOz(weeklyMeatOz) {
  if (typeof weeklyMeatOz !== "number" || !Number.isFinite(weeklyMeatOz) || weeklyMeatOz < 0) {
    return null;
  }
  const ordered = [
    FLEXITARIAN_LEVELS.expert,
    FLEXITARIAN_LEVELS.advanced,
    FLEXITARIAN_LEVELS.beginner,
  ];
  return ordered.find((level) => weeklyMeatOz <= level.maxMeatOzPerWeek) ?? null;
}

/**
 * @param {object} input
 * @param {"male"|"female"} input.sex
 * @param {number} input.age
 * @param {number} input.weightKg
 * @param {number} input.heightCm
 * @param {string} input.activity        key of ACTIVITY_FACTORS
 * @param {string} input.goal            key of GOALS
 * @param {string} input.level           key of FLEXITARIAN_LEVELS
 * @param {number} input.weeklyMeatOz    ounces of cooked meat/poultry/fish per week
 * @param {number} input.servingOz       ounces in one meat serving
 * @param {number} input.proteinPerKg    usable protein target, g per kg body weight
 * @param {number} input.fatShare        fat as a fraction of calories (0.2-0.45)
 * @returns {object} plan or { error }
 */
export function flexitarianPlan({
  sex,
  age,
  weightKg,
  heightCm,
  activity,
  goal = "maintain",
  level = "advanced",
  weeklyMeatOz = FLEXITARIAN_LEVELS.advanced.maxMeatOzPerWeek,
  servingOz = 4,
  proteinPerKg = 1.2,
  fatShare = FAT_SHARE.sane,
}) {
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female so the correct BMR equation is used." };
  }
  const fields = { age, weightKg, heightCm, weeklyMeatOz, servingOz, proteinPerKg, fatShare };
  for (const [key, value] of Object.entries(fields)) {
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
  if (proteinPerKg < LIMITS.proteinPerKg.min || proteinPerKg > LIMITS.proteinPerKg.max) {
    return {
      error: `Protein must be between ${LIMITS.proteinPerKg.min} and ${LIMITS.proteinPerKg.max} g per kg.`,
    };
  }
  if (weeklyMeatOz < LIMITS.weeklyMeatOz.min || weeklyMeatOz > LIMITS.weeklyMeatOz.max) {
    return { error: `Weekly meat must be between 0 and ${LIMITS.weeklyMeatOz.max} oz.` };
  }
  if (servingOz < LIMITS.servingOz.min || servingOz > LIMITS.servingOz.max) {
    return {
      error: `A meat serving should be between ${LIMITS.servingOz.min} and ${LIMITS.servingOz.max} oz.`,
    };
  }
  if (fatShare < FAT_SHARE.min || fatShare > FAT_SHARE.max) {
    return {
      error: `Fat should be between ${Math.round(FAT_SHARE.min * 100)}% and ${Math.round(
        FAT_SHARE.max * 100,
      )}% of calories.`,
    };
  }
  const levelDef = FLEXITARIAN_LEVELS[level];
  if (!levelDef) return { error: "Choose a flexitarian level." };
  const activityDef = ACTIVITY_FACTORS[activity];
  if (!activityDef) return { error: "Choose an activity level." };
  const goalDef = GOALS[goal];
  if (!goalDef) return { error: "Choose a goal." };

  const bmr = basalMetabolicRate(sex, weightKg, heightCm, age);
  const tdee = bmr * activityDef.factor;
  const calories = tdee * (1 + goalDef.adjust);

  // Usable protein target, then split between the meat allowance and plants.
  const usableProteinTarget = proteinPerKg * weightKg;
  const meatProteinPerDay = (weeklyMeatOz * PROTEIN_PER_OZ_MEAT) / 7;
  const plantProteinUsable = Math.max(0, usableProteinTarget - meatProteinPerDay);
  const plantProteinToEat = plantProteinUsable * PLANT_PROTEIN_UPLIFT;
  const proteinGrams = meatProteinPerDay + plantProteinToEat;

  const proteinKcal = proteinGrams * KCAL_PER_GRAM.protein;
  const fatKcal = calories * fatShare;
  const carbKcal = calories - proteinKcal - fatKcal;

  if (carbKcal < 0) {
    return {
      error:
        "Protein and fat together already exceed the calorie target, leaving negative carbohydrate. Lower protein per kg or the fat share.",
    };
  }

  const fatGrams = fatKcal / KCAL_PER_GRAM.fat;
  const carbGrams = carbKcal / KCAL_PER_GRAM.carb;
  const meatServingsPerWeek = servingOz > 0 ? weeklyMeatOz / servingOz : 0;
  const actualLevel = levelForWeeklyOz(weeklyMeatOz);

  return {
    bmr,
    tdee,
    calories,
    levelName: levelDef.name,
    levelMeatlessDays: levelDef.meatlessDays,
    levelCapOz: levelDef.maxMeatOzPerWeek,
    weeklyMeatOz,
    weeklyMeatGrams: weeklyMeatOz * GRAMS_PER_OZ,
    meatServingsPerWeek,
    meatDaysPerWeek: Math.min(7, Math.ceil(meatServingsPerWeek)),
    meatlessDaysPerWeek: Math.max(0, 7 - Math.min(7, Math.ceil(meatServingsPerWeek))),
    usableProteinTarget,
    meatProteinPerDay,
    plantProteinUsable,
    plantProteinToEat,
    proteinGrams,
    fatGrams,
    carbGrams,
    proteinKcal,
    fatKcal,
    carbKcal,
    proteinShare: proteinKcal / calories,
    fatShare: fatKcal / calories,
    carbShare: carbKcal / calories,
    plantShareOfProtein: proteinGrams > 0 ? plantProteinToEat / proteinGrams : 0,
    fibreTargetG: (calories / 1000) * FIBRE_G_PER_1000_KCAL,
    b12RdaMcg: B12_RDA_MCG,
    actualLevelName: actualLevel ? actualLevel.name : null,
    aboveChosenLevel: weeklyMeatOz > levelDef.maxMeatOzPerWeek,
    aboveAllLevels: actualLevel === null,
  };
}
