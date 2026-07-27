/**
 * Eggetarian macro calculator.
 *
 * "Eggetarian" is vegetarian plus eggs: no meat and no fish, but eggs and
 * usually dairy are allowed. Egg protein is the reference protein of nutrition
 * science (PDCAAS 1.00, DIAAS about 1.13), so it is the highest-quality protein
 * available on this pattern and worth counting exactly.
 *
 * Energy
 * ------
 * Mifflin-St Jeor resting metabolic rate (Mifflin MD et al., Am J Clin Nutr
 * 1990;51:241-247) x activity factor, adjusted for the goal.
 *
 * Egg composition
 * ---------------
 * Per 100 g of edible raw whole egg (USDA FoodData Central):
 *   143 kcal, 12.56 g protein, 9.51 g fat, 0.72 g carbohydrate,
 *   372 mg cholesterol, 294 mg choline, 0.89 mcg vitamin B12, 2.0 mcg vitamin D.
 * Per 100 g of raw egg white: 52 kcal, 10.9 g protein, 0.17 g fat, 0.73 g carb,
 * no cholesterol. The white is about 66% of the edible egg by weight, which is
 * why one 50 g large egg gives 6.3 g of protein and 186 mg of cholesterol while
 * its white alone gives 3.6 g of protein and none.
 *
 * Cholesterol reference
 * ---------------------
 * The 300 mg/day dietary cholesterol ceiling was dropped as a numeric limit from
 * the 2015-2020 US Dietary Guidelines, but the American Heart Association's 2019
 * science advisory (Circulation 2020;141:e39-e53) still frames about one whole
 * egg a day as consistent with a heart-healthy pattern for most adults, with
 * lower intakes advised for people with high LDL cholesterol or diabetes. The
 * 300 mg figure is used here purely as a reference marker, not as a rule.
 *
 * Protein quality
 * ---------------
 * Egg and dairy protein count at face value. Mixed plant protein needs roughly
 * 12.5% more grams for the same usable protein (0.9 vs 0.8 g/kg, Academy of
 * Nutrition and Dietetics position paper, J Acad Nutr Diet 2016;116:1970-1980).
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

/** Mixed plant protein uplift for the non-egg, non-dairy share. */
export const PLANT_PROTEIN_UPLIFT = 1.125;

/** Raw whole egg, per 100 g edible portion (USDA FoodData Central). */
export const WHOLE_EGG_PER_100G = {
  kcal: 143,
  protein: 12.56,
  fat: 9.51,
  carb: 0.72,
  cholesterolMg: 372,
  cholineMg: 293.8,
  b12Mcg: 0.89,
  vitaminDMcg: 2.0,
};

/** Raw egg white, per 100 g (USDA FoodData Central). No cholesterol, negligible fat. */
export const EGG_WHITE_PER_100G = {
  kcal: 52,
  protein: 10.9,
  fat: 0.17,
  carb: 0.73,
  cholesterolMg: 0,
  cholineMg: 1.1,
  b12Mcg: 0.09,
  vitaminDMcg: 0,
};

/** The white is about 66% of an egg's edible weight; the yolk carries the other 34%. */
export const WHITE_FRACTION_OF_EGG = 0.66;

/** Edible-portion weight in grams by egg size (shell removed). */
export const EGG_SIZES = {
  small: { label: "Small (about 38 g without shell)", grams: 38 },
  medium: { label: "Medium (about 44 g without shell)", grams: 44 },
  large: { label: "Large (about 50 g without shell)", grams: 50 },
  extraLarge: { label: "Extra large (about 56 g without shell)", grams: 56 },
};

/** Historic dietary cholesterol ceiling, mg/day. Kept as a reference marker only. */
export const CHOLESTEROL_REFERENCE_MG = 300;

/** Adequate intake for choline, mg/day (Institute of Medicine): 550 men, 425 women. */
export const CHOLINE_AI_MG = { male: 550, female: 425 };

/** Adult vitamin B12 RDA, micrograms/day (Institute of Medicine). */
export const B12_RDA_MCG = 2.4;

/** Vitamin D RDA for adults up to 70, micrograms/day (Institute of Medicine): 15 mcg = 600 IU. */
export const VITAMIN_D_RDA_MCG = 15;

/** Institute of Medicine adequate intake for fibre, g per 1,000 kcal. */
export const FIBRE_G_PER_1000_KCAL = 14;

export const LIMITS = {
  age: { min: 18, max: 100 },
  weightKg: { min: 35, max: 250 },
  heightCm: { min: 130, max: 230 },
  proteinPerKg: { min: 0.8, max: 2.2 },
  fatShare: { min: 0.15, max: 0.45 },
  eggShare: { min: 0.05, max: 0.8 },
  extraWhites: { min: 0, max: 12 },
  dairyProtein: { min: 0, max: 120 },
};

/** Mifflin-St Jeor resting metabolic rate, kcal/day. Returns null for an unknown sex. */
export function basalMetabolicRate(sex, weightKg, heightCm, age) {
  const offset = MIFFLIN_OFFSET[sex];
  if (offset === undefined) return null;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + offset;
}

/** Nutrition of one whole egg of the given edible weight. */
export function wholeEggNutrition(eggGrams) {
  const f = eggGrams / 100;
  return {
    grams: eggGrams,
    kcal: WHOLE_EGG_PER_100G.kcal * f,
    protein: WHOLE_EGG_PER_100G.protein * f,
    fat: WHOLE_EGG_PER_100G.fat * f,
    carb: WHOLE_EGG_PER_100G.carb * f,
    cholesterolMg: WHOLE_EGG_PER_100G.cholesterolMg * f,
    cholineMg: WHOLE_EGG_PER_100G.cholineMg * f,
    b12Mcg: WHOLE_EGG_PER_100G.b12Mcg * f,
    vitaminDMcg: WHOLE_EGG_PER_100G.vitaminDMcg * f,
  };
}

/** Nutrition of the white from one egg of the given edible weight. */
export function eggWhiteNutrition(eggGrams) {
  const f = (eggGrams * WHITE_FRACTION_OF_EGG) / 100;
  return {
    grams: eggGrams * WHITE_FRACTION_OF_EGG,
    kcal: EGG_WHITE_PER_100G.kcal * f,
    protein: EGG_WHITE_PER_100G.protein * f,
    fat: EGG_WHITE_PER_100G.fat * f,
    carb: EGG_WHITE_PER_100G.carb * f,
    cholesterolMg: 0,
    cholineMg: EGG_WHITE_PER_100G.cholineMg * f,
    b12Mcg: EGG_WHITE_PER_100G.b12Mcg * f,
    vitaminDMcg: 0,
  };
}

/**
 * Build an eggetarian daily plan and work out how many eggs it takes.
 *
 * @param {object} input
 * @param {"male"|"female"} input.sex
 * @param {number} input.age
 * @param {number} input.weightKg
 * @param {number} input.heightCm
 * @param {string} input.activity        key of ACTIVITY_FACTORS
 * @param {string} input.goal            key of GOALS
 * @param {number} input.proteinPerKg    usable protein target, g per kg
 * @param {number} input.fatShare        fat as a fraction of calories
 * @param {string} input.eggSize         key of EGG_SIZES
 * @param {number} input.eggShare        share of the protein target to take from eggs
 * @param {number} input.extraWhites     egg whites eaten on top, per day
 * @param {number} input.dairyProteinG   protein from milk, curd and paneer, g per day
 * @returns {object} the plan, or { error }
 */
export function eggetarianPlan({
  sex,
  age,
  weightKg,
  heightCm,
  activity = "moderate",
  goal = "maintain",
  proteinPerKg = 1.2,
  fatShare = 0.28,
  eggSize = "large",
  eggShare = 0.35,
  extraWhites = 0,
  dairyProteinG = 16,
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
    eggShare,
    extraWhites,
    dairyProteinG,
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
  if (eggShare < LIMITS.eggShare.min || eggShare > LIMITS.eggShare.max) {
    return { error: "Eggs should cover between 5% and 80% of your protein target." };
  }
  if (extraWhites < LIMITS.extraWhites.min || extraWhites > LIMITS.extraWhites.max) {
    return { error: `Extra egg whites should be between 0 and ${LIMITS.extraWhites.max} a day.` };
  }
  if (dairyProteinG < LIMITS.dairyProtein.min || dairyProteinG > LIMITS.dairyProtein.max) {
    return { error: `Dairy protein should be between 0 and ${LIMITS.dairyProtein.max} g a day.` };
  }
  const activityDef = ACTIVITY_FACTORS[activity];
  if (!activityDef) return { error: "Choose an activity level." };
  const goalDef = GOALS[goal];
  if (!goalDef) return { error: "Choose a goal." };
  const size = EGG_SIZES[eggSize];
  if (!size) return { error: "Choose an egg size." };

  const bmr = basalMetabolicRate(sex, weightKg, heightCm, age);
  const tdee = bmr * activityDef.factor;
  const calories = tdee * (1 + goalDef.adjust);
  if (!(calories > 0)) {
    return { error: "These body measurements do not produce a usable calorie target." };
  }

  const oneEgg = wholeEggNutrition(size.grams);
  const oneWhite = eggWhiteNutrition(size.grams);

  const usableProteinTarget = proteinPerKg * weightKg;
  const eggProteinTarget = usableProteinTarget * eggShare;
  const whitesProtein = extraWhites * oneWhite.protein;
  const proteinLeftForWholeEggs = Math.max(0, eggProteinTarget - whitesProtein);
  const wholeEggsExact = proteinLeftForWholeEggs / oneEgg.protein;
  const wholeEggsPractical = Math.ceil(wholeEggsExact);

  const eggProteinActual = wholeEggsPractical * oneEgg.protein + whitesProtein;
  const eggFat = wholeEggsPractical * oneEgg.fat + extraWhites * oneWhite.fat;
  const eggCarb = wholeEggsPractical * oneEgg.carb + extraWhites * oneWhite.carb;
  const eggKcal = wholeEggsPractical * oneEgg.kcal + extraWhites * oneWhite.kcal;
  const cholesterolMg = wholeEggsPractical * oneEgg.cholesterolMg;
  const cholineMg = wholeEggsPractical * oneEgg.cholineMg + extraWhites * oneWhite.cholineMg;
  const b12Mcg = wholeEggsPractical * oneEgg.b12Mcg + extraWhites * oneWhite.b12Mcg;
  const vitaminDMcg = wholeEggsPractical * oneEgg.vitaminDMcg;

  if (eggKcal > calories) {
    return {
      error:
        "The eggs alone would use more calories than the whole day's target. Lower the egg share or raise calories.",
    };
  }

  const highQualityProtein = eggProteinActual + dairyProteinG;
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

  const cholineAi = CHOLINE_AI_MG[sex];

  return {
    bmr,
    tdee,
    calories,
    activityLabel: activityDef.label,
    goalLabel: goalDef.label,
    eggSizeLabel: size.label,
    eggGrams: size.grams,
    proteinPerEgg: oneEgg.protein,
    proteinPerWhite: oneWhite.protein,
    cholesterolPerEgg: oneEgg.cholesterolMg,
    usableProteinTarget,
    eggProteinTarget,
    wholeEggsExact,
    wholeEggsPractical,
    extraWhites,
    eggProteinActual,
    eggFat,
    eggCarb,
    eggKcal,
    eggShareAchieved: usableProteinTarget > 0 ? eggProteinActual / usableProteinTarget : 0,
    dairyProteinG,
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
    cholesterolMg,
    cholesterolReferenceMg: CHOLESTEROL_REFERENCE_MG,
    cholesterolOverReference: cholesterolMg > CHOLESTEROL_REFERENCE_MG,
    cholineMg,
    cholineAiMg: cholineAi,
    cholineShareOfAi: cholineMg / cholineAi,
    b12Mcg,
    b12RdaMcg: B12_RDA_MCG,
    b12ShareOfRda: b12Mcg / B12_RDA_MCG,
    vitaminDMcg,
    vitaminDRdaMcg: VITAMIN_D_RDA_MCG,
    vitaminDShareOfRda: vitaminDMcg / VITAMIN_D_RDA_MCG,
    nonEggFat: fatGrams - eggFat,
    fibreTargetG: (calories / 1000) * FIBRE_G_PER_1000_KCAL,
    highQualityCoversTarget: highQualityProtein >= usableProteinTarget,
  };
}
