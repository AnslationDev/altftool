/**
 * Office worker protein calculator.
 *
 * Built for desk-bound adults, where the problem is rarely a protein deficiency
 * and usually a slow loss of lean mass on a low-movement day.
 *
 * Energy
 * ------
 * Mifflin-St Jeor resting metabolic rate (Mifflin MD et al., Am J Clin Nutr
 * 1990;51:241-247) multiplied by an activity factor chosen from the daily step
 * count, using the pedometer-based classification of Tudor-Locke C & Bassett DR
 * (Sports Med 2004;34:1-8):
 *   under 5,000 steps       sedentary
 *   5,000-7,499             low active
 *   7,500-9,999             somewhat active
 *   10,000-12,499           active
 *   12,500 or more          highly active
 * Structured gym sessions are added separately with the ACSM metabolic
 * equation, kcal/min = MET x weight_kg x 3.5 / 200, at 5.0 METs for a
 * moderate-to-vigorous resistance session (2011 Compendium of Physical
 * Activities, code 02054). Keeping the two apart avoids double counting a gym
 * habit that a step count never sees.
 *
 * Protein
 * -------
 * The 0.8 g/kg RDA (Institute of Medicine 2005) is the amount that prevents
 * deficiency, not the amount that best preserves muscle. For that:
 *   maintaining lean mass          1.0 - 1.2 g/kg/day
 *     (Phillips SM, Chevalier S, Leidy HJ, Appl Physiol Nutr Metab
 *      2016;41:565-572, "Protein requirements beyond the RDA")
 *   resistance training            up to about 1.6 g/kg/day
 *     (Morton RW et al., Br J Sports Med 2018;52:376-384, found a breakpoint at
 *      1.62 g/kg/day beyond which extra protein added nothing)
 *   fat loss with lean-mass
 *   preservation                   1.6 - 2.2 g/kg/day
 *     (Helms ER et al., Int J Sport Nutr Exerc Metab 2014;24:127-138)
 *
 * Per-meal dose: about 0.24 g/kg for young adults, rising to roughly 0.40 g/kg
 * past middle age (Moore DR et al., J Gerontol A Biol Sci Med Sci 2015;70:57-62).
 *
 * The protein target is also checked against the IOM Acceptable Macronutrient
 * Distribution Range for adults, 10-35% of total energy.
 *
 * Movement is compared with the WHO 2020 physical activity guidelines:
 * 150-300 minutes of moderate aerobic activity a week (or 75-150 vigorous) plus
 * muscle-strengthening on two or more days.
 *
 * Informational only. Not medical or dietetic advice.
 */

/** Mifflin-St Jeor sex constants (kcal/day). */
export const MIFFLIN_OFFSET = { male: 5, female: -161 };

/** Adult protein RDA, g per kg per day (IOM 2005). */
export const ADULT_RDA_G_PER_KG = 0.8;

/** Atwater energy factor for protein, kcal per gram. */
export const KCAL_PER_GRAM_PROTEIN = 4;

/** Step-count bands (Tudor-Locke & Bassett 2004) and their energy multipliers. */
export const STEP_BANDS = [
  { label: "Sedentary (under 5,000 steps)", maxSteps: 5000, factor: 1.2 },
  { label: "Low active (5,000-7,499 steps)", maxSteps: 7500, factor: 1.375 },
  { label: "Somewhat active (7,500-9,999 steps)", maxSteps: 10000, factor: 1.55 },
  { label: "Active (10,000-12,499 steps)", maxSteps: 12500, factor: 1.725 },
  { label: "Highly active (12,500+ steps)", maxSteps: Infinity, factor: 1.9 },
];

/** MET value used for a moderate-to-vigorous resistance session. */
export const RESISTANCE_MET = 5.0;

/** ACSM metabolic equation constant: kcal/min = MET x kg x 3.5 / 200. */
export const ACSM_KCAL_CONSTANT = 3.5 / 200;

/** Protein bands in g/kg/day by goal. */
export const GOALS = {
  maintain: {
    label: "Maintain weight and keep muscle",
    min: 1.0,
    max: 1.2,
    note: "1.0-1.2 g/kg preserves lean mass better than the 0.8 g/kg RDA, which was set to prevent deficiency.",
  },
  fatLoss: {
    label: "Lose fat, keep muscle",
    min: 1.6,
    max: 2.2,
    note: "In a calorie deficit, 1.6-2.2 g/kg protects lean mass while the fat comes off.",
  },
  buildMuscle: {
    label: "Build muscle",
    min: 1.6,
    max: 2.0,
    note: "Morton's 2018 meta-analysis found gains plateaued around 1.62 g/kg/day, so more than about 2.0 g/kg adds cost without benefit.",
  },
};

/** Training floors applied when someone trains at least twice a week. */
export const TRAINING_FLOOR = { sessionsPerWeek: 2, minPerKg: 1.4, maxPerKg: 1.6 };

/** Per-meal protein dose, g per kg of body weight (Moore 2015). */
export const PER_MEAL_G_PER_KG = { young: 0.24, older: 0.4 };

/** Age from which the higher per-meal dose is used. */
export const OLDER_ADULT_AGE = 60;

/** IOM Acceptable Macronutrient Distribution Range for protein in adults. */
export const AMDR_PROTEIN = { min: 0.1, max: 0.35 };

/** WHO 2020 physical activity guidelines for adults. */
export const WHO_GUIDELINES = {
  moderateMinutesPerWeek: { min: 150, max: 300 },
  vigorousMinutesPerWeek: { min: 75, max: 150 },
  strengthDaysPerWeek: 2,
};

export const LIMITS = {
  age: { min: 18, max: 80 },
  weightKg: { min: 35, max: 250 },
  heightCm: { min: 130, max: 230 },
  deskHours: { min: 0, max: 16 },
  steps: { min: 0, max: 40000 },
  sessionsPerWeek: { min: 0, max: 14 },
  sessionMinutes: { min: 10, max: 180 },
  mealsPerDay: { min: 2, max: 6 },
};

/** Mifflin-St Jeor resting metabolic rate, kcal/day. Returns null for an unknown sex. */
export function basalMetabolicRate(sex, weightKg, heightCm, age) {
  const offset = MIFFLIN_OFFSET[sex];
  if (offset === undefined) return null;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + offset;
}

/** The Tudor-Locke step band a daily step count falls into. */
export function stepBandFor(steps) {
  if (typeof steps !== "number" || !Number.isFinite(steps) || steps < 0) return null;
  return STEP_BANDS.find((band) => steps < band.maxSteps) ?? STEP_BANDS[STEP_BANDS.length - 1];
}

/** Energy cost of one resistance session, kcal (ACSM metabolic equation). */
export function sessionEnergyKcal(weightKg, minutes, met = RESISTANCE_MET) {
  if (!(weightKg > 0) || !(minutes > 0)) return 0;
  return met * weightKg * ACSM_KCAL_CONSTANT * minutes;
}

/**
 * Daily protein and energy plan for a desk-based adult.
 *
 * @param {object} input
 * @param {"male"|"female"} input.sex
 * @param {number} input.age
 * @param {number} input.weightKg
 * @param {number} input.heightCm
 * @param {number} input.deskHours        hours seated at work
 * @param {number} input.steps            average daily steps
 * @param {number} input.sessionsPerWeek  resistance sessions a week
 * @param {number} input.sessionMinutes   minutes per session
 * @param {string} input.goal             key of GOALS
 * @param {number} input.mealsPerDay
 * @returns {object} the plan, or { error }
 */
export function officeProteinPlan({
  sex,
  age,
  weightKg,
  heightCm,
  deskHours = 8,
  steps = 6000,
  sessionsPerWeek = 3,
  sessionMinutes = 45,
  goal = "maintain",
  mealsPerDay = 4,
}) {
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female so the correct BMR equation is used." };
  }
  const numeric = {
    age,
    weightKg,
    heightCm,
    deskHours,
    steps,
    sessionsPerWeek,
    sessionMinutes,
    mealsPerDay,
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
  if (deskHours < LIMITS.deskHours.min || deskHours > LIMITS.deskHours.max) {
    return { error: `Desk hours must be between 0 and ${LIMITS.deskHours.max} a day.` };
  }
  if (steps < LIMITS.steps.min || steps > LIMITS.steps.max) {
    return { error: `Daily steps must be between 0 and ${LIMITS.steps.max}.` };
  }
  if (sessionsPerWeek < LIMITS.sessionsPerWeek.min || sessionsPerWeek > LIMITS.sessionsPerWeek.max) {
    return { error: `Training sessions must be between 0 and ${LIMITS.sessionsPerWeek.max} a week.` };
  }
  if (sessionMinutes < LIMITS.sessionMinutes.min || sessionMinutes > LIMITS.sessionMinutes.max) {
    return {
      error: `A session should be between ${LIMITS.sessionMinutes.min} and ${LIMITS.sessionMinutes.max} minutes.`,
    };
  }
  if (!Number.isInteger(mealsPerDay)) {
    return { error: "Meals a day must be a whole number." };
  }
  if (mealsPerDay < LIMITS.mealsPerDay.min || mealsPerDay > LIMITS.mealsPerDay.max) {
    return {
      error: `Spread protein across ${LIMITS.mealsPerDay.min} to ${LIMITS.mealsPerDay.max} meals.`,
    };
  }
  const goalDef = GOALS[goal];
  if (!goalDef) return { error: "Choose a goal." };
  const band = stepBandFor(steps);
  if (!band) return { error: "Enter a valid daily step count." };

  const bmr = basalMetabolicRate(sex, weightKg, heightCm, age);
  const baseTdee = bmr * band.factor;
  const perSessionKcal = sessionEnergyKcal(weightKg, sessionMinutes);
  const trainingKcalPerDay = (perSessionKcal * sessionsPerWeek) / 7;
  const calories = baseTdee + trainingKcalPerDay;
  if (!(calories > 0)) {
    return { error: "These inputs do not produce a usable energy estimate." };
  }

  const trains = sessionsPerWeek >= TRAINING_FLOOR.sessionsPerWeek;
  const minPerKg = trains ? Math.max(goalDef.min, TRAINING_FLOOR.minPerKg) : goalDef.min;
  const maxPerKg = trains ? Math.max(goalDef.max, TRAINING_FLOOR.maxPerKg) : goalDef.max;
  const midPerKg = (minPerKg + maxPerKg) / 2;

  const rdaGrams = ADULT_RDA_G_PER_KG * weightKg;
  const minGrams = minPerKg * weightKg;
  const maxGrams = maxPerKg * weightKg;
  const recommendedGrams = midPerKg * weightKg;

  const perMealPerKg = age >= OLDER_ADULT_AGE ? PER_MEAL_G_PER_KG.older : PER_MEAL_G_PER_KG.young;
  const perMealGrams = recommendedGrams / mealsPerDay;
  const perMealMinimumGrams = perMealPerKg * weightKg;

  const proteinKcal = recommendedGrams * KCAL_PER_GRAM_PROTEIN;
  const proteinShareOfEnergy = proteinKcal / calories;

  const trainingMinutesPerWeek = sessionsPerWeek * sessionMinutes;

  return {
    bmr,
    stepBandLabel: band.label,
    activityFactor: band.factor,
    baseTdee,
    perSessionKcal,
    trainingKcalPerDay,
    calories,
    deskHours,
    steps,
    goalLabel: goalDef.label,
    goalNote: goalDef.note,
    trains,
    sessionsPerWeek,
    sessionMinutes,
    trainingMinutesPerWeek,
    minPerKg,
    maxPerKg,
    midPerKg,
    minGrams,
    maxGrams,
    recommendedGrams,
    rdaGrams,
    rdaPerKg: ADULT_RDA_G_PER_KG,
    extraOverRdaGrams: recommendedGrams - rdaGrams,
    multipleOfRda: rdaGrams > 0 ? recommendedGrams / rdaGrams : 0,
    mealsPerDay,
    perMealGrams,
    perMealMinimumGrams,
    perMealPerKg,
    perMealBelowMinimum: perMealGrams < perMealMinimumGrams,
    proteinKcal,
    proteinShareOfEnergy,
    amdrMinShare: AMDR_PROTEIN.min,
    amdrMaxShare: AMDR_PROTEIN.max,
    belowAmdr: proteinShareOfEnergy < AMDR_PROTEIN.min,
    aboveAmdr: proteinShareOfEnergy > AMDR_PROTEIN.max,
    meetsWhoStrength: sessionsPerWeek >= WHO_GUIDELINES.strengthDaysPerWeek,
    whoStrengthDays: WHO_GUIDELINES.strengthDaysPerWeek,
    whoModerateMinutes: WHO_GUIDELINES.moderateMinutesPerWeek,
    buildingWithoutTraining: goal === "buildMuscle" && sessionsPerWeek === 0,
  };
}
