/**
 * High-protein macro calculator for a calorie deficit.
 *
 * The problem it solves: in a deficit the body will strip both fat and lean
 * tissue. Two things reduce the lean loss - resistance training, and eating
 * enough protein. This calculator sizes the deficit from a target rate of weight
 * loss, sets protein high, puts a floor under dietary fat, and gives whatever
 * energy is left to carbohydrate.
 *
 * Evidence the ranges come from
 * -----------------------------
 * - ISSN position stand on protein and exercise (Jager et al., JISSN 2017):
 *   1.4-2.0 g protein/kg body weight/day builds and maintains muscle in people
 *   who train; higher intakes are appropriate during energy restriction. That
 *   is why the body-weight basis (PROTEIN_PER_KG_BODYWEIGHT) allows entries up
 *   to 3.0 g/kg rather than capping at the reviewed 2.0 g/kg ceiling - this
 *   tool is specifically for a calorie deficit, where the higher end applies.
 * - Helms et al. (Int J Sport Nutr Exerc Metab 2014) reviewed lean, resistance-
 *   trained athletes dieting and recommended 2.3-3.1 g/kg of FAT-FREE MASS.
 *   That is why this tool lets you base protein on lean mass when you know your
 *   body-fat percentage - at 20% body fat, 2.6 g/kg lean mass is about 2.1 g/kg
 *   of total body weight. The lean-mass input (PROTEIN_PER_KG_LEAN) is allowed
 *   down to 1.8 g/kg, below Helms' reviewed 2.3 g/kg floor, because that floor
 *   was measured in already-lean, competition-prep athletes; 1.8 g/kg of lean
 *   mass is roughly the ISSN's 1.4 g/kg body-weight floor converted at a
 *   typical 20% body fat, for people dieting less aggressively than Helms'
 *   cohort. The sane default (2.6 g/kg) sits inside both reviewed ranges.
 * - Dietary fat is held at or above a floor because very low fat intakes are hard
 *   to sustain and cut into fat-soluble vitamin absorption; 0.5-1.0 g/kg is the
 *   usual practical range and 20% of calories the usual lower bound.
 *
 * Deficit maths
 * -------------
 * Adipose tissue is roughly 87% lipid, so 1 kg carries about 7,700 kcal. A target
 * loss rate in kg per week therefore becomes a daily deficit:
 *   daily deficit kcal = rate kg/week x 7,700 / 7
 * Losing faster than about 1% of body weight a week sharply increases lean tissue
 * loss, so anything above that is flagged.
 *
 * Energy base: Mifflin-St Jeor (Am J Clin Nutr 1990;51:241-247) x activity factor.
 *
 * Informational only - not a substitute for advice from a doctor or registered
 * dietitian, particularly if you have kidney disease, are pregnant, or are under 18.
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

/** Energy per gram, Atwater factors. */
export const KCAL_PER_GRAM = { carb: 4, protein: 4, fat: 9 };

/** Energy stored in a kilogram of adipose tissue, kcal. */
export const KCAL_PER_KG_FAT = 7700;

/** ISSN 2017 range for people who train, g protein per kg body weight. */
export const PROTEIN_PER_KG_BODYWEIGHT = { min: 1.4, sane: 2.2, max: 3.0 };

/** Helms et al. 2014 range for dieting lean athletes, g protein per kg fat-free mass. */
export const PROTEIN_PER_KG_LEAN = { min: 1.8, sane: 2.6, max: 3.1 };

/** Practical range for dietary fat, g per kg body weight. */
export const FAT_PER_KG = { min: 0.4, sane: 0.8, max: 2 };

/** Fat below this share of calories is flagged as impractical. */
export const MIN_FAT_ENERGY_SHARE = 0.2;

/** Below this many carb grams a day the plan is effectively ketogenic. */
export const LOW_CARB_FLAG_G = 50;

/** Losing faster than 1% of body weight a week costs disproportionate lean mass. */
export const MAX_SAFE_LOSS_FRACTION = 0.01;

/**
 * Calorie floors below which self-directed dieting is not advised.
 * (Commonly cited clinical guidance: very-low-energy diets need supervision.)
 */
export const MIN_CALORIES = { female: 1200, male: 1500 };

/** Protein doses above roughly 0.4 g/kg per meal add little extra muscle signal. */
export const PROTEIN_PER_MEAL_CEILING_PER_KG = 0.4;

export const LIMITS = {
  age: { min: 16, max: 90 },
  weightKg: { min: 35, max: 250 },
  heightCm: { min: 130, max: 230 },
  bodyFatPercent: { min: 3, max: 60 },
  weeklyLossKg: { min: 0, max: 2 },
  meals: { min: 2, max: 8 },
};

/** Mifflin-St Jeor resting metabolic rate, kcal/day. */
export function basalMetabolicRate(sex, weightKg, heightCm, age) {
  const offset = MIFFLIN_OFFSET[sex];
  if (offset === undefined) return null;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + offset;
}

/** Fat-free mass in kg from body weight and body-fat percentage. */
export function leanBodyMass(weightKg, bodyFatPercent) {
  return weightKg * (1 - bodyFatPercent / 100);
}

/** Daily kcal deficit implied by a target weekly loss rate. */
export function dailyDeficit(weeklyLossKg) {
  return (weeklyLossKg * KCAL_PER_KG_FAT) / 7;
}

/**
 * @param {object} input
 * @param {"male"|"female"} input.sex
 * @param {number} input.age
 * @param {number} input.weightKg
 * @param {number} input.heightCm
 * @param {string} input.activity          key of ACTIVITY_FACTORS
 * @param {number} input.weeklyLossKg      target loss rate, kg per week (0 = maintain)
 * @param {"bodyweight"|"lean"} input.proteinBasis
 * @param {number} input.proteinPerKg      g protein per kg of the chosen basis
 * @param {number} [input.bodyFatPercent]  required when proteinBasis is "lean"
 * @param {number} input.fatPerKg          g fat per kg body weight
 * @param {number} input.meals             meals the protein is spread across
 * @returns {object} plan or { error }
 */
export function highProteinMacros({
  sex,
  age,
  weightKg,
  heightCm,
  activity,
  weeklyLossKg = 0.5,
  proteinBasis = "bodyweight",
  proteinPerKg = PROTEIN_PER_KG_BODYWEIGHT.sane,
  bodyFatPercent = 20,
  fatPerKg = FAT_PER_KG.sane,
  meals = 4,
}) {
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female so the correct BMR equation is used." };
  }
  const fields = { age, weightKg, heightCm, weeklyLossKg, proteinPerKg, fatPerKg, meals };
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
  if (weeklyLossKg < 0 || weeklyLossKg > LIMITS.weeklyLossKg.max) {
    return { error: `Target loss must be between 0 and ${LIMITS.weeklyLossKg.max} kg a week.` };
  }
  if (meals < LIMITS.meals.min || meals > LIMITS.meals.max) {
    return { error: `Spread protein across ${LIMITS.meals.min} to ${LIMITS.meals.max} meals.` };
  }
  if (fatPerKg < FAT_PER_KG.min || fatPerKg > FAT_PER_KG.max) {
    return { error: `Fat must be between ${FAT_PER_KG.min} and ${FAT_PER_KG.max} g per kg body weight.` };
  }

  const activityDef = ACTIVITY_FACTORS[activity];
  if (!activityDef) return { error: "Choose an activity level." };

  let proteinBaseKg = weightKg;
  let lean = null;
  if (proteinBasis === "lean") {
    if (typeof bodyFatPercent !== "number" || !Number.isFinite(bodyFatPercent)) {
      return { error: "Enter your body-fat percentage to base protein on lean mass." };
    }
    if (bodyFatPercent < LIMITS.bodyFatPercent.min || bodyFatPercent > LIMITS.bodyFatPercent.max) {
      return {
        error: `Body fat must be between ${LIMITS.bodyFatPercent.min}% and ${LIMITS.bodyFatPercent.max}%.`,
      };
    }
    lean = leanBodyMass(weightKg, bodyFatPercent);
    proteinBaseKg = lean;
  } else if (proteinBasis !== "bodyweight") {
    return { error: "Choose whether protein is based on body weight or lean mass." };
  }

  const range = proteinBasis === "lean" ? PROTEIN_PER_KG_LEAN : PROTEIN_PER_KG_BODYWEIGHT;
  if (proteinPerKg < range.min || proteinPerKg > range.max) {
    return {
      error: `For this basis, protein should be between ${range.min} and ${range.max} g per kg.`,
    };
  }

  const bmr = basalMetabolicRate(sex, weightKg, heightCm, age);
  const tdee = bmr * activityDef.factor;
  const deficit = dailyDeficit(weeklyLossKg);
  const calories = tdee - deficit;

  if (calories <= 0) {
    return { error: "That loss rate wipes out the entire calorie budget. Choose a slower rate." };
  }

  const proteinGrams = proteinPerKg * proteinBaseKg;
  const fatGrams = fatPerKg * weightKg;
  const proteinKcal = proteinGrams * KCAL_PER_GRAM.protein;
  const fatKcal = fatGrams * KCAL_PER_GRAM.fat;
  const carbKcal = calories - proteinKcal - fatKcal;

  if (carbKcal < 0) {
    return {
      error:
        "Protein and fat alone exceed the calorie target, so carbohydrate would be negative. Lower the protein or fat per kg, or diet more slowly.",
    };
  }

  const carbGrams = carbKcal / KCAL_PER_GRAM.carb;
  const perMealProtein = proteinGrams / meals;
  const perMealCeiling = PROTEIN_PER_MEAL_CEILING_PER_KG * weightKg;

  return {
    bmr,
    tdee,
    deficit,
    calories,
    lean,
    proteinBaseKg,
    proteinGrams,
    fatGrams,
    carbGrams,
    proteinKcal,
    fatKcal,
    carbKcal,
    proteinShare: proteinKcal / calories,
    fatShare: fatKcal / calories,
    carbShare: carbKcal / calories,
    proteinPerKgBodyweight: proteinGrams / weightKg,
    perMealProtein,
    perMealCeiling,
    meals,
    weeklyLossKg,
    monthlyLossKg: weeklyLossKg * 4.345, // average weeks per month
    lossFractionPerWeek: weeklyLossKg / weightKg,
    // Flags
    aggressiveLoss: weeklyLossKg / weightKg > MAX_SAFE_LOSS_FRACTION,
    belowCalorieFloor: calories < MIN_CALORIES[sex],
    calorieFloor: MIN_CALORIES[sex],
    belowBmr: calories < bmr,
    lowFat: fatKcal / calories < MIN_FAT_ENERGY_SHARE,
    lowCarb: carbGrams < LOW_CARB_FLAG_G,
    perMealAboveCeiling: perMealProtein > perMealCeiling,
  };
}
