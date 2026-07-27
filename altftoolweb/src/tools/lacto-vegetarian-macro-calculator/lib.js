/**
 * Lacto-vegetarian macro calculator.
 *
 * A lacto-vegetarian diet excludes meat, fish and eggs but keeps dairy, so milk,
 * curd (dahi) and paneer are the only complete, high-digestibility protein
 * sources on the plate. Everything else has to come from dal, legumes, soya,
 * nuts and grains.
 *
 * Energy
 * ------
 * Mifflin-St Jeor resting metabolic rate (Mifflin MD et al., Am J Clin Nutr
 * 1990;51:241-247) x activity factor, adjusted for the goal.
 *
 * Protein quality
 * ---------------
 * Milk protein is a reference protein with a PDCAAS of 1.00. Mixed plant protein
 * scores lower once digestibility and amino-acid limitation are accounted for,
 * which is why the Academy of Nutrition and Dietetics position paper on
 * vegetarian diets (J Acad Nutr Diet 2016;116:1970-1980) notes vegetarians may
 * need about 0.9 g/kg against the 0.8 g/kg RDA - a 12.5% uplift. This tool
 * applies that uplift only to the share of protein that has to come from plants.
 *
 * Dairy composition
 * -----------------
 * Milk classes follow the FSSAI Food Safety and Standards (Food Products
 * Standards) minimum fat and solids-not-fat specifications:
 *   full cream    6.0% fat, 9.0% SNF
 *   toned         3.0% fat, 8.5% SNF
 *   double toned  1.5% fat, 9.0% SNF
 * Protein, calcium and B12 figures are typical published values for those
 * classes (IFCT 2017 / USDA FoodData Central). Energy is derived from the macros
 * with Atwater factors rather than hard-coded, so the numbers stay consistent.
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

/**
 * Mixed plant protein needs roughly 12.5% more grams than dairy protein to
 * deliver the same usable protein (0.9 vs 0.8 g/kg, AND position paper 2016).
 */
export const PLANT_PROTEIN_UPLIFT = 1.125;

/** Milk classes, per 100 mL. Fat and SNF minimums are the FSSAI standards. */
export const MILK_TYPES = {
  toned: { label: "Toned milk (3% fat)", protein: 3.2, fat: 3.0, carb: 4.7, calciumMg: 120, b12Mcg: 0.45 },
  fullCream: { label: "Full-cream milk (6% fat)", protein: 3.4, fat: 6.0, carb: 4.8, calciumMg: 125, b12Mcg: 0.45 },
  doubleToned: { label: "Double-toned milk (1.5% fat)", protein: 3.4, fat: 1.5, carb: 4.8, calciumMg: 125, b12Mcg: 0.45 },
  buffalo: { label: "Buffalo milk", protein: 4.3, fat: 6.5, carb: 5.0, calciumMg: 210, b12Mcg: 0.36 },
};

/** Set curd (dahi) from toned milk, per 100 g. */
export const CURD_PER_100G = { protein: 3.1, fat: 3.0, carb: 4.0, calciumMg: 120, b12Mcg: 0.4 };

/** Paneer from full-cream milk, per 100 g (IFCT 2017 / USDA). */
export const PANEER_PER_100G = { protein: 18.0, fat: 20.8, carb: 1.2, calciumMg: 480, b12Mcg: 1.0 };

/** One katori of curd as commonly served in India. */
export const CURD_KATORI_GRAMS = 150;

/** Milk fat is roughly 65% saturated, which is why paneer moves the saturated-fat total fast. */
export const DAIRY_SATURATED_FRACTION = 0.65;

/** Saturated fat ceiling used here: under 10% of total energy (WHO / ICMR-NIN guidance). */
export const SAT_FAT_MAX_SHARE = 0.1;

/** Adult calcium RDA, mg/day (ICMR-NIN 2020 for Indian adults; IOM gives the same for 19-50). */
export const CALCIUM_RDA_MG = 1000;

/** Adult vitamin B12 RDA, micrograms/day (Institute of Medicine). */
export const B12_RDA_MCG = 2.4;

/** Institute of Medicine adequate intake for fibre, g per 1,000 kcal. */
export const FIBRE_G_PER_1000_KCAL = 14;

export const LIMITS = {
  age: { min: 18, max: 100 },
  weightKg: { min: 35, max: 250 },
  heightCm: { min: 130, max: 230 },
  proteinPerKg: { min: 0.8, max: 2.2 },
  fatShare: { min: 0.15, max: 0.45 },
  milkMl: { min: 0, max: 2000 },
  curdKatoris: { min: 0, max: 8 },
  paneerG: { min: 0, max: 500 },
};

/** Mifflin-St Jeor resting metabolic rate, kcal/day. Returns null for an unknown sex. */
export function basalMetabolicRate(sex, weightKg, heightCm, age) {
  const offset = MIFFLIN_OFFSET[sex];
  if (offset === undefined) return null;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + offset;
}

/** Energy of a macro triple using Atwater factors. */
export function macrosToKcal({ protein = 0, fat = 0, carb = 0 }) {
  return protein * KCAL_PER_GRAM.protein + fat * KCAL_PER_GRAM.fat + carb * KCAL_PER_GRAM.carb;
}

/**
 * Sum the nutrition delivered by a day's dairy.
 *
 * @param {object} input
 * @param {string} input.milkType      key of MILK_TYPES
 * @param {number} input.milkMl        millilitres of milk a day
 * @param {number} input.curdKatoris   katoris of curd a day (150 g each)
 * @param {number} input.paneerG       grams of paneer a day
 * @returns {object|null} totals, or null when milkType is unknown
 */
export function dairyTotals({ milkType, milkMl, curdKatoris, paneerG }) {
  const milk = MILK_TYPES[milkType];
  if (!milk) return null;
  const curdG = curdKatoris * CURD_KATORI_GRAMS;

  const protein =
    (milkMl / 100) * milk.protein +
    (curdG / 100) * CURD_PER_100G.protein +
    (paneerG / 100) * PANEER_PER_100G.protein;
  const fat =
    (milkMl / 100) * milk.fat +
    (curdG / 100) * CURD_PER_100G.fat +
    (paneerG / 100) * PANEER_PER_100G.fat;
  const carb =
    (milkMl / 100) * milk.carb +
    (curdG / 100) * CURD_PER_100G.carb +
    (paneerG / 100) * PANEER_PER_100G.carb;
  const calciumMg =
    (milkMl / 100) * milk.calciumMg +
    (curdG / 100) * CURD_PER_100G.calciumMg +
    (paneerG / 100) * PANEER_PER_100G.calciumMg;
  const b12Mcg =
    (milkMl / 100) * milk.b12Mcg +
    (curdG / 100) * CURD_PER_100G.b12Mcg +
    (paneerG / 100) * PANEER_PER_100G.b12Mcg;

  return {
    curdG,
    protein,
    fat,
    carb,
    calciumMg,
    b12Mcg,
    kcal: macrosToKcal({ protein, fat, carb }),
    saturatedFat: fat * DAIRY_SATURATED_FRACTION,
  };
}

/**
 * Build a lacto-vegetarian daily plan.
 *
 * @param {object} input
 * @param {"male"|"female"} input.sex
 * @param {number} input.age
 * @param {number} input.weightKg
 * @param {number} input.heightCm
 * @param {string} input.activity      key of ACTIVITY_FACTORS
 * @param {string} input.goal          key of GOALS
 * @param {number} input.proteinPerKg  usable protein target, g per kg body weight
 * @param {number} input.fatShare      fat as a fraction of calories
 * @param {string} input.milkType      key of MILK_TYPES
 * @param {number} input.milkMl
 * @param {number} input.curdKatoris
 * @param {number} input.paneerG
 * @returns {object} the plan, or { error }
 */
export function lactoVegetarianPlan({
  sex,
  age,
  weightKg,
  heightCm,
  activity = "moderate",
  goal = "maintain",
  proteinPerKg = 1.1,
  fatShare = 0.28,
  milkType = "toned",
  milkMl = 500,
  curdKatoris = 1,
  paneerG = 100,
}) {
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female so the correct BMR equation is used." };
  }
  const numeric = { age, weightKg, heightCm, proteinPerKg, fatShare, milkMl, curdKatoris, paneerG };
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
  if (milkMl < LIMITS.milkMl.min || milkMl > LIMITS.milkMl.max) {
    return { error: `Milk should be between 0 and ${LIMITS.milkMl.max} mL a day.` };
  }
  if (curdKatoris < LIMITS.curdKatoris.min || curdKatoris > LIMITS.curdKatoris.max) {
    return { error: `Curd should be between 0 and ${LIMITS.curdKatoris.max} katoris a day.` };
  }
  if (paneerG < LIMITS.paneerG.min || paneerG > LIMITS.paneerG.max) {
    return { error: `Paneer should be between 0 and ${LIMITS.paneerG.max} g a day.` };
  }
  const activityDef = ACTIVITY_FACTORS[activity];
  if (!activityDef) return { error: "Choose an activity level." };
  const goalDef = GOALS[goal];
  if (!goalDef) return { error: "Choose a goal." };
  const milk = MILK_TYPES[milkType];
  if (!milk) return { error: "Choose a milk type." };

  const bmr = basalMetabolicRate(sex, weightKg, heightCm, age);
  const tdee = bmr * activityDef.factor;
  const calories = tdee * (1 + goalDef.adjust);
  if (!(calories > 0)) {
    return { error: "These body measurements do not produce a usable calorie target." };
  }

  const dairy = dairyTotals({ milkType, milkMl, curdKatoris, paneerG });
  if (dairy.kcal > calories) {
    return {
      error:
        "Your dairy alone uses more calories than the whole day's target. Reduce the milk, curd or paneer amounts.",
    };
  }

  const usableProteinTarget = proteinPerKg * weightKg;
  const dairyProteinUsable = Math.min(dairy.protein, usableProteinTarget);
  const plantProteinUsable = Math.max(0, usableProteinTarget - dairy.protein);
  const plantProteinToEat = plantProteinUsable * PLANT_PROTEIN_UPLIFT;
  const proteinGrams = dairy.protein + plantProteinToEat;

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

  const nonDairyFat = fatGrams - dairy.fat;
  const nonDairyCarb = carbGrams - dairy.carb;
  const satFatMaxGrams = (calories * SAT_FAT_MAX_SHARE) / KCAL_PER_GRAM.fat;

  return {
    bmr,
    tdee,
    calories,
    activityLabel: activityDef.label,
    goalLabel: goalDef.label,
    milkLabel: milk.label,
    proteinGrams,
    fatGrams,
    carbGrams,
    proteinKcal,
    fatKcal,
    carbKcal,
    proteinShare: proteinKcal / calories,
    fatShare: fatKcal / calories,
    carbShare: carbKcal / calories,
    usableProteinTarget,
    dairyProtein: dairy.protein,
    dairyProteinUsable,
    dairyFat: dairy.fat,
    dairyCarb: dairy.carb,
    dairyKcal: dairy.kcal,
    dairySaturatedFat: dairy.saturatedFat,
    curdGrams: dairy.curdG,
    plantProteinUsable,
    plantProteinToEat,
    dairyShareOfProtein: proteinGrams > 0 ? dairy.protein / proteinGrams : 0,
    dairyCoversTarget: dairy.protein >= usableProteinTarget,
    nonDairyFat,
    nonDairyCarb,
    fatBudgetExceeded: nonDairyFat < 0,
    carbBudgetExceeded: nonDairyCarb < 0,
    satFatMaxGrams,
    satFatOverCeiling: dairy.saturatedFat > satFatMaxGrams,
    calciumMg: dairy.calciumMg,
    calciumRdaMg: CALCIUM_RDA_MG,
    calciumShareOfRda: dairy.calciumMg / CALCIUM_RDA_MG,
    b12Mcg: dairy.b12Mcg,
    b12RdaMcg: B12_RDA_MCG,
    b12ShareOfRda: dairy.b12Mcg / B12_RDA_MCG,
    fibreTargetG: (calories / 1000) * FIBRE_G_PER_1000_KCAL,
  };
}
