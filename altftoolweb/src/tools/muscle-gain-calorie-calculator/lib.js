/**
 * Lean-bulk calorie and macronutrient targets.
 *
 * Maintenance comes from Mifflin-St Jeor multiplied by an activity factor.
 * The surplus is derived from a target rate of weight gain rather than a
 * round number, because the rate is what determines how much of the gain is
 * muscle rather than fat.
 */

/** Mifflin-St Jeor (1990) resting metabolic rate, kcal/day. */
export const MIFFLIN = { weight: 10, height: 6.25, age: 5, maleConstant: 5, femaleConstant: -161 };

/** Conventional activity multipliers applied to RMR. */
export const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary — desk job, little exercise", factor: 1.2 },
  { value: "light", label: "Lightly active — 1 to 3 sessions a week", factor: 1.375 },
  { value: "moderate", label: "Moderately active — 3 to 5 sessions a week", factor: 1.55 },
  { value: "very", label: "Very active — 6 to 7 sessions a week", factor: 1.725 },
  { value: "extra", label: "Extra active — physical job or twice-daily training", factor: 1.9 },
];

/**
 * Rate-of-gain guidance widely used in evidence-based hypertrophy practice
 * (e.g. Aragon & Schoenfeld), expressed as percent of body weight per month.
 * Faster than this and a growing share of the gain is fat.
 */
export const TRAINING_LEVELS = [
  { value: "beginner", label: "Beginner (first 1-2 years)", low: 1.0, high: 1.5, target: 1.25 },
  { value: "intermediate", label: "Intermediate (2-4 years)", low: 0.5, high: 1.0, target: 0.75 },
  { value: "advanced", label: "Advanced (4+ years)", low: 0.25, high: 0.5, target: 0.375 },
];

/** Average Gregorian month expressed in weeks: 365.25 / 12 / 7. */
export const WEEKS_PER_MONTH = 365.25 / 12 / 7;

/**
 * The conventional energy value of a kilogram of body-weight change,
 * 7,700 kcal (the metric form of the 3,500 kcal per pound rule). It is an
 * approximation for mixed tissue and drifts over long periods.
 */
export const KCAL_PER_KG_BODY_WEIGHT = 7700;

/** Atwater factors, kcal per gram. */
export const KCAL_PER_G = { protein: 4, carb: 4, fat: 9 };

/**
 * Protein: meta-analysis (Morton et al., BJSM 2018) found resistance-training
 * gains plateau near 1.62 g/kg/day, with a practical range of 1.6-2.2.
 * Fat: 0.8-1.0 g/kg/day is a common floor for hormonal and vitamin needs.
 */
export const PROTEIN_RANGE_G_PER_KG = [1.6, 2.2];
export const FAT_RANGE_G_PER_KG = [0.8, 1.0];

export const MIN_AGE = 14;
export const MAX_AGE = 100;
export const MIN_HEIGHT_CM = 120;
export const MAX_HEIGHT_CM = 250;
export const MIN_WEIGHT_KG = 30;
export const MAX_WEIGHT_KG = 300;
export const MAX_MONTHLY_GAIN_PERCENT = 5;

/** A surplus this small is inside day-to-day measurement noise. */
export const SMALL_SURPLUS_PERCENT = 5;
/** Above this share of maintenance, fat gain tends to outpace muscle gain. */
export const LARGE_SURPLUS_PERCENT = 20;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function mifflinStJeor({ sex, weightKg, heightCm, age } = {}) {
  if (![weightKg, heightCm, age].every(isNum)) return null;
  const base = MIFFLIN.weight * weightKg + MIFFLIN.height * heightCm - MIFFLIN.age * age;
  return base + (sex === "female" ? MIFFLIN.femaleConstant : MIFFLIN.maleConstant);
}

export function activityFactor(value) {
  const level = ACTIVITY_LEVELS.find((entry) => entry.value === value);
  return level ? level.factor : null;
}

export function trainingLevel(value) {
  return TRAINING_LEVELS.find((entry) => entry.value === value) ?? null;
}

/**
 * @param {object} input
 * @param {"male"|"female"} input.sex
 * @param {number} input.age
 * @param {number} input.heightCm
 * @param {number} input.weightKg
 * @param {string} input.activity            one of ACTIVITY_LEVELS values
 * @param {number} input.monthlyGainPercent  target gain, percent of body weight per month
 * @param {number} input.proteinPerKg        g of protein per kg body weight per day
 * @param {number} input.fatPerKg            g of fat per kg body weight per day
 * @param {number} input.goalGainKg          total weight to gain, for the timeline
 */
export function computeMuscleGainPlan({
  sex = "male",
  age,
  heightCm,
  weightKg,
  activity = "moderate",
  monthlyGainPercent,
  proteinPerKg = 1.8,
  fatPerKg = 0.9,
  goalGainKg = 5,
} = {}) {
  if (
    ![age, heightCm, weightKg, monthlyGainPercent, proteinPerKg, fatPerKg, goalGainKg].every(isNum)
  ) {
    return { error: "Enter a number in every field." };
  }
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female — the Mifflin-St Jeor constant differs." };
  }
  if (age < MIN_AGE || age > MAX_AGE) {
    return { error: `Age should be between ${MIN_AGE} and ${MAX_AGE}.` };
  }
  if (heightCm < MIN_HEIGHT_CM || heightCm > MAX_HEIGHT_CM) {
    return { error: `Height should be between ${MIN_HEIGHT_CM} and ${MAX_HEIGHT_CM} cm.` };
  }
  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    return { error: `Weight should be between ${MIN_WEIGHT_KG} and ${MAX_WEIGHT_KG} kg.` };
  }
  const factor = activityFactor(activity);
  if (factor === null) {
    return { error: "Choose one of the listed activity levels." };
  }
  if (monthlyGainPercent <= 0) {
    return { error: "Target gain rate must be greater than zero percent a month." };
  }
  if (monthlyGainPercent > MAX_MONTHLY_GAIN_PERCENT) {
    return {
      error: `A target above ${MAX_MONTHLY_GAIN_PERCENT}% of body weight a month is not a lean bulk — lower the rate.`,
    };
  }
  if (proteinPerKg <= 0 || fatPerKg <= 0) {
    return { error: "Protein and fat targets must be greater than zero." };
  }
  if (goalGainKg <= 0) {
    return { error: "Enter how much weight you want to gain in total." };
  }

  const bmr = mifflinStJeor({ sex, weightKg, heightCm, age });
  const maintenance = bmr * factor;

  const monthlyGainKg = (monthlyGainPercent / 100) * weightKg;
  const weeklyGainKg = monthlyGainKg / WEEKS_PER_MONTH;
  const dailySurplus = (weeklyGainKg * KCAL_PER_KG_BODY_WEIGHT) / 7;
  const targetCalories = maintenance + dailySurplus;
  const surplusPercent = (dailySurplus / maintenance) * 100;

  const proteinG = proteinPerKg * weightKg;
  const fatG = fatPerKg * weightKg;
  const proteinKcal = proteinG * KCAL_PER_G.protein;
  const fatKcal = fatG * KCAL_PER_G.fat;
  const carbKcal = targetCalories - proteinKcal - fatKcal;

  if (carbKcal < 0) {
    return {
      error:
        "Protein and fat alone already exceed the calorie target — lower the grams per kilogram or raise the gain rate.",
    };
  }

  const carbG = carbKcal / KCAL_PER_G.carb;
  const weeksToGoal = goalGainKg / weeklyGainKg;

  const notes = [];
  if (surplusPercent < SMALL_SURPLUS_PERCENT) {
    notes.push(
      `A surplus of ${surplusPercent.toFixed(1)}% of maintenance is inside day-to-day measurement noise — judge it on 2 to 3 weeks of weigh-ins rather than daily numbers.`,
    );
  }
  if (surplusPercent > LARGE_SURPLUS_PERCENT) {
    notes.push(
      `A surplus above ${LARGE_SURPLUS_PERCENT}% of maintenance usually adds fat faster than muscle. Consider a slower target rate.`,
    );
  }
  if (proteinPerKg < PROTEIN_RANGE_G_PER_KG[0]) {
    notes.push(
      `Protein is below the ${PROTEIN_RANGE_G_PER_KG[0]} g/kg lower end of the range associated with maximal training gains.`,
    );
  }
  if (proteinPerKg > PROTEIN_RANGE_G_PER_KG[1]) {
    notes.push(
      `Above about ${PROTEIN_RANGE_G_PER_KG[1]} g/kg there is no measured extra hypertrophy benefit — the calories are usually better spent on carbohydrate.`,
    );
  }
  if (fatPerKg < FAT_RANGE_G_PER_KG[0]) {
    notes.push(`Fat below ${FAT_RANGE_G_PER_KG[0]} g/kg is a low floor for hormone and vitamin needs.`);
  }

  return {
    bmr,
    maintenance,
    activityFactorUsed: factor,
    monthlyGainKg,
    weeklyGainKg,
    dailySurplus,
    targetCalories,
    surplusPercent,
    proteinG,
    fatG,
    carbG,
    proteinKcal,
    fatKcal,
    carbKcal,
    proteinPercent: (proteinKcal / targetCalories) * 100,
    fatPercent: (fatKcal / targetCalories) * 100,
    carbPercent: (carbKcal / targetCalories) * 100,
    weeksToGoal,
    monthsToGoal: weeksToGoal / WEEKS_PER_MONTH,
    goalGainKg,
    notes,
  };
}
