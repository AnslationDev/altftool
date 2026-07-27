/**
 * Pescatarian macro calculator.
 *
 * A pescatarian eats no meat or poultry but does eat fish and seafood, usually
 * alongside eggs and dairy. That makes two numbers worth tracking rather than
 * one: total protein, and long-chain omega-3 (EPA + DHA), which is the nutrient
 * fish is actually irreplaceable for.
 *
 * Energy
 * ------
 * Mifflin-St Jeor resting metabolic rate (Mifflin MD et al., Am J Clin Nutr
 * 1990;51:241-247) x activity factor, adjusted for the goal.
 *
 * Omega-3 target
 * --------------
 * EFSA's Panel on Dietetic Products set an adequate intake of 250 mg/day of
 * EPA + DHA for adults (EFSA Journal 2010;8(3):1461), the same figure used in
 * the joint FAO/WHO 2010 fats and fatty acids report. The American Heart
 * Association separately recommends at least two servings of fish a week,
 * preferably oily, where one serving is about 100 g (3.5 oz) cooked.
 *
 * Fish composition
 * ----------------
 * Protein, fat, energy and EPA + DHA per 100 g of cooked (or drained canned)
 * fish, from USDA FoodData Central. EPA is 20:5 n-3 and DHA is 22:6 n-3; the
 * figure shown is their sum.
 *
 * Protein quality
 * ---------------
 * Fish, egg and dairy protein count at face value. Mixed plant protein needs
 * roughly 12.5% more grams for the same usable protein (0.9 vs 0.8 g/kg,
 * Academy of Nutrition and Dietetics, J Acad Nutr Diet 2016;116:1970-1980).
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

/** Mixed plant protein uplift for the share that is not fish, egg or dairy. */
export const PLANT_PROTEIN_UPLIFT = 1.125;

/**
 * Per 100 g cooked or drained, USDA FoodData Central.
 * epaDhaMg is EPA (20:5 n-3) + DHA (22:6 n-3) in milligrams.
 */
export const FISH_TYPES = {
  salmon: {
    label: "Salmon, Atlantic farmed (cooked)",
    protein: 25.4,
    fat: 12.35,
    kcal: 206,
    epaDhaMg: 2147,
    oily: true,
  },
  mackerel: {
    label: "Mackerel, Atlantic (cooked)",
    protein: 23.85,
    fat: 17.8,
    kcal: 262,
    epaDhaMg: 1203,
    oily: true,
  },
  trout: {
    label: "Trout, rainbow farmed (cooked)",
    protein: 22.9,
    fat: 7.2,
    kcal: 168,
    epaDhaMg: 1090,
    oily: true,
  },
  sardines: {
    label: "Sardines, canned in oil (drained)",
    protein: 24.6,
    fat: 11.45,
    kcal: 208,
    epaDhaMg: 982,
    oily: true,
  },
  shrimp: {
    label: "Shrimp / prawns (cooked)",
    protein: 24.0,
    fat: 0.28,
    kcal: 99,
    epaDhaMg: 315,
    oily: false,
  },
  tuna: {
    label: "Tuna, light, canned in water (drained)",
    protein: 19.4,
    fat: 0.82,
    kcal: 86,
    epaDhaMg: 270,
    oily: false,
  },
  tilapia: {
    label: "Tilapia (cooked)",
    protein: 26.15,
    fat: 2.65,
    kcal: 128,
    epaDhaMg: 115,
    oily: false,
  },
};

/** EFSA / FAO-WHO adequate intake for EPA + DHA in adults, mg per day. */
export const EPA_DHA_TARGET_MG_PER_DAY = 250;

/** AHA guidance: at least two fish servings a week, one serving about 100 g cooked. */
export const AHA_SERVINGS_PER_WEEK = 2;
export const AHA_SERVING_GRAMS = 100;

/** Days in the week, used to convert a weekly fish habit into a daily average. */
export const DAYS_PER_WEEK = 7;

/** Institute of Medicine adequate intake for fibre, g per 1,000 kcal. */
export const FIBRE_G_PER_1000_KCAL = 14;

/**
 * Fish the US FDA and EPA advise pregnant and breastfeeding people and young
 * children to avoid entirely because of methylmercury (2021 joint advice).
 */
export const HIGH_MERCURY_FISH = [
  "shark",
  "swordfish",
  "king mackerel",
  "tilefish",
  "bigeye tuna",
  "marlin",
  "orange roughy",
];

export const LIMITS = {
  age: { min: 18, max: 100 },
  weightKg: { min: 35, max: 250 },
  heightCm: { min: 130, max: 230 },
  proteinPerKg: { min: 0.8, max: 2.2 },
  fatShare: { min: 0.15, max: 0.45 },
  servingsPerWeek: { min: 0, max: 14 },
  servingGrams: { min: 30, max: 400 },
  otherProtein: { min: 0, max: 150 },
};

/** Mifflin-St Jeor resting metabolic rate, kcal/day. Returns null for an unknown sex. */
export function basalMetabolicRate(sex, weightKg, heightCm, age) {
  const offset = MIFFLIN_OFFSET[sex];
  if (offset === undefined) return null;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + offset;
}

/**
 * Grams of a given fish per week needed to average the EPA + DHA target.
 * Returns null when the fish supplies no long-chain omega-3 at all.
 */
export function weeklyGramsForOmega3Target(epaDhaMgPer100g, targetMgPerDay = EPA_DHA_TARGET_MG_PER_DAY) {
  if (!(epaDhaMgPer100g > 0) || !(targetMgPerDay > 0)) return null;
  const weeklyTargetMg = targetMgPerDay * DAYS_PER_WEEK;
  return (weeklyTargetMg * 100) / epaDhaMgPer100g;
}

/**
 * Build a pescatarian daily plan.
 *
 * @param {object} input
 * @param {"male"|"female"} input.sex
 * @param {number} input.age
 * @param {number} input.weightKg
 * @param {number} input.heightCm
 * @param {string} input.activity          key of ACTIVITY_FACTORS
 * @param {string} input.goal              key of GOALS
 * @param {number} input.proteinPerKg      usable protein target, g per kg
 * @param {number} input.fatShare          fat as a fraction of calories
 * @param {string} input.fishType          key of FISH_TYPES
 * @param {number} input.servingsPerWeek   fish servings eaten per week
 * @param {number} input.servingGrams      cooked grams in one serving
 * @param {number} input.otherProteinG     protein from eggs and dairy, g per day
 * @returns {object} the plan, or { error }
 */
export function pescatarianPlan({
  sex,
  age,
  weightKg,
  heightCm,
  activity = "moderate",
  goal = "maintain",
  proteinPerKg = 1.4,
  fatShare = 0.28,
  fishType = "salmon",
  servingsPerWeek = 3,
  servingGrams = 120,
  otherProteinG = 20,
}) {
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female so the correct BMR equation is used." };
  }
  const numeric = {
    age,
    weightKg,
    heightCm,
    proteinPerKg,
    fatShare,
    servingsPerWeek,
    servingGrams,
    otherProteinG,
  };
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
  if (proteinPerKg < LIMITS.proteinPerKg.min || proteinPerKg > LIMITS.proteinPerKg.max) {
    return {
      error: `Protein should be between ${LIMITS.proteinPerKg.min} and ${LIMITS.proteinPerKg.max} g per kg of body weight.`,
    };
  }
  if (fatShare < LIMITS.fatShare.min || fatShare > LIMITS.fatShare.max) {
    return {
      error: `Fat should supply between ${Math.round(LIMITS.fatShare.min * 100)}% and ${Math.round(
        LIMITS.fatShare.max * 100,
      )}% of calories.`,
    };
  }
  if (servingsPerWeek < LIMITS.servingsPerWeek.min || servingsPerWeek > LIMITS.servingsPerWeek.max) {
    return { error: `Fish servings should be between 0 and ${LIMITS.servingsPerWeek.max} a week.` };
  }
  if (servingGrams < LIMITS.servingGrams.min || servingGrams > LIMITS.servingGrams.max) {
    return {
      error: `A serving should be between ${LIMITS.servingGrams.min} g and ${LIMITS.servingGrams.max} g of cooked fish.`,
    };
  }
  if (otherProteinG < LIMITS.otherProtein.min || otherProteinG > LIMITS.otherProtein.max) {
    return { error: `Egg and dairy protein should be between 0 and ${LIMITS.otherProtein.max} g a day.` };
  }
  const activityDef = ACTIVITY_FACTORS[activity];
  if (!activityDef) return { error: "Choose an activity level." };
  const goalDef = GOALS[goal];
  if (!goalDef) return { error: "Choose a goal." };
  const fish = FISH_TYPES[fishType];
  if (!fish) return { error: "Choose a fish or seafood." };

  const bmr = basalMetabolicRate(sex, weightKg, heightCm, age);
  const tdee = bmr * activityDef.factor;
  const calories = tdee * (1 + goalDef.adjust);
  if (!(calories > 0)) {
    return { error: "These body measurements do not produce a usable calorie target." };
  }

  const fishGramsPerWeek = servingsPerWeek * servingGrams;
  const per100 = fishGramsPerWeek / 100;
  const fishProteinPerWeek = per100 * fish.protein;
  const fishFatPerWeek = per100 * fish.fat;
  const fishKcalPerWeek = per100 * fish.kcal;
  const epaDhaPerWeekMg = per100 * fish.epaDhaMg;

  const fishProteinPerDay = fishProteinPerWeek / DAYS_PER_WEEK;
  const fishFatPerDay = fishFatPerWeek / DAYS_PER_WEEK;
  const fishKcalPerDay = fishKcalPerWeek / DAYS_PER_WEEK;
  const epaDhaPerDayMg = epaDhaPerWeekMg / DAYS_PER_WEEK;

  if (fishKcalPerDay > calories) {
    return {
      error:
        "The fish alone averages more calories than the whole day's target. Reduce the servings or the serving size.",
    };
  }

  const usableProteinTarget = proteinPerKg * weightKg;
  const highQualityProtein = fishProteinPerDay + otherProteinG;
  const plantProteinUsable = Math.max(0, usableProteinTarget - highQualityProtein);
  const plantProteinToEat = plantProteinUsable * PLANT_PROTEIN_UPLIFT;
  const proteinGrams = highQualityProtein + plantProteinToEat;

  const proteinKcal = proteinGrams * KCAL_PER_GRAM.protein;
  const fatKcal = calories * fatShare;
  const carbKcal = calories - proteinKcal - fatKcal;
  if (carbKcal <= 0) {
    return {
      error:
        "Protein and fat together already use the whole calorie budget, leaving no carbohydrate. Lower the protein per kg or the fat share.",
    };
  }
  const fatGrams = fatKcal / KCAL_PER_GRAM.fat;
  const carbGrams = carbKcal / KCAL_PER_GRAM.carb;

  const gramsForTarget = weeklyGramsForOmega3Target(fish.epaDhaMg);
  const servingsForTarget = gramsForTarget === null ? null : gramsForTarget / servingGrams;

  return {
    bmr,
    tdee,
    calories,
    activityLabel: activityDef.label,
    goalLabel: goalDef.label,
    fishLabel: fish.label,
    fishIsOily: fish.oily,
    fishEpaDhaPer100g: fish.epaDhaMg,
    fishProteinPer100g: fish.protein,
    fishGramsPerWeek,
    fishProteinPerWeek,
    fishProteinPerDay,
    fishFatPerDay,
    fishKcalPerDay,
    epaDhaPerDayMg,
    epaDhaPerWeekMg,
    epaDhaTargetMg: EPA_DHA_TARGET_MG_PER_DAY,
    epaDhaShareOfTarget: epaDhaPerDayMg / EPA_DHA_TARGET_MG_PER_DAY,
    meetsOmega3Target: epaDhaPerDayMg >= EPA_DHA_TARGET_MG_PER_DAY,
    gramsForTarget,
    servingsForTarget,
    meetsAhaServings: servingsPerWeek >= AHA_SERVINGS_PER_WEEK,
    ahaServingsPerWeek: AHA_SERVINGS_PER_WEEK,
    usableProteinTarget,
    otherProteinG,
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
    fishShareOfProtein: proteinGrams > 0 ? fishProteinPerDay / proteinGrams : 0,
    nonFishFat: fatGrams - fishFatPerDay,
    fibreTargetG: (calories / 1000) * FIBRE_G_PER_1000_KCAL,
    highQualityCoversTarget: highQualityProtein >= usableProteinTarget,
  };
}
