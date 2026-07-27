/**
 * Atkins phase macro planner.
 *
 * Energy base
 * -----------
 * Resting energy is estimated with the Mifflin-St Jeor equation
 * (Mifflin MD, St Jeor ST et al., Am J Clin Nutr 1990;51:241-247), the equation
 * the Academy of Nutrition and Dietetics recommends for non-obese and obese adults:
 *   men   BMR = 10*kg + 6.25*cm - 5*age + 5
 *   women BMR = 10*kg + 6.25*cm - 5*age - 161
 * Total daily energy expenditure = BMR x an activity factor.
 *
 * Macro structure
 * ---------------
 * Atkins is a carbohydrate-restricted plan, not a calorie-counting plan: the carb
 * ceiling is fixed by the phase you are in, protein is held at a moderate,
 * body-weight-based amount, and dietary fat makes up the remaining energy.
 *   carb kcal    = net carb grams x 4
 *   protein kcal = protein grams x 4
 *   fat kcal     = target kcal - carb kcal - protein kcal, then / 9 for grams
 *
 * Net carbs (the number Atkins counts) = total carbohydrate - fibre - sugar
 * alcohols, because fibre and most polyols are not absorbed as glucose.
 *
 * Phase carb ladder (Atkins 20 programme, as published by Atkins Nutritionals):
 *   Phase 1 Induction         20 g net carbs/day, minimum 2 weeks
 *   Phase 2 Balancing (OWL)   start 25 g, add 5 g/day each week while still losing
 *   Phase 3 Fine-Tuning       start 50 g, add 10 g/day each week, run until goal weight
 *   Phase 4 Lifetime Maint.   personal carb tolerance, typically 80-100 g/day
 * In every phase 12-15 g of the daily net carbs should come from "foundation
 * vegetables" (leafy greens and other low-starch vegetables).
 *
 * This tool is informational. Very-low-carbohydrate eating is not appropriate for
 * everyone - speak to a doctor or dietitian first if you are pregnant, have kidney
 * or liver disease, or take insulin, sulfonylureas or SGLT2 inhibitors.
 */

/** Mifflin-St Jeor sex constants. */
export const MIFFLIN_OFFSET = { male: 5, female: -161 };

/** Standard physical-activity factors applied to BMR to get TDEE. */
export const ACTIVITY_FACTORS = {
  sedentary: { factor: 1.2, label: "Sedentary (desk job, little exercise)" },
  light: { factor: 1.375, label: "Lightly active (1-3 sessions a week)" },
  moderate: { factor: 1.55, label: "Moderately active (3-5 sessions a week)" },
  very: { factor: 1.725, label: "Very active (6-7 sessions a week)" },
  athlete: { factor: 1.9, label: "Athlete (twice-daily or physical job)" },
};

/**
 * The four Atkins phases and their published net-carb rules.
 * `start` is the daily net carb allowance in week 1 of the phase,
 * `stepPerWeek` is the weekly increase, `ceiling` is where the phase stops.
 */
export const ATKINS_PHASES = {
  induction: {
    id: "induction",
    name: "Phase 1 - Induction",
    start: 20,
    stepPerWeek: 0,
    ceiling: 20,
    minWeeks: 2,
    summary:
      "Fixed at 20 g net carbs a day for at least two weeks to start fat adaptation.",
  },
  balancing: {
    id: "balancing",
    name: "Phase 2 - Balancing (OWL)",
    start: 25,
    stepPerWeek: 5,
    ceiling: 50,
    minWeeks: 1,
    summary:
      "Begins at 25 g and rises 5 g a week while weight loss continues; nuts, seeds and berries return.",
  },
  fineTuning: {
    id: "fineTuning",
    name: "Phase 3 - Fine-Tuning",
    start: 50,
    stepPerWeek: 10,
    ceiling: 80,
    minWeeks: 1,
    summary:
      "Starts at 50 g and rises 10 g a week once you are within about 4-5 kg of goal weight.",
  },
  maintenance: {
    id: "maintenance",
    name: "Phase 4 - Lifetime Maintenance",
    start: 90,
    stepPerWeek: 0,
    ceiling: 120,
    minWeeks: 1,
    summary:
      "Settles at your personal carb tolerance, usually 80-100 g net carbs a day.",
  },
};

/** Atkins asks for 12-15 g of the daily net carbs to come from foundation vegetables. */
export const FOUNDATION_VEG_NET_CARBS = { min: 12, max: 15 };

/** Energy per gram, Atwater factors. */
export const KCAL_PER_GRAM = { carb: 4, protein: 4, fat: 9 };

/** Goal adjustments applied to TDEE. Atkins is usually run at a modest deficit. */
export const GOALS = {
  lose: { adjust: -0.2, label: "Lose weight (20% below maintenance)" },
  gentle: { adjust: -0.1, label: "Lose slowly (10% below maintenance)" },
  maintain: { adjust: 0, label: "Maintain weight" },
};

/** Accepted input ranges. Outside these the estimate stops being meaningful. */
export const LIMITS = {
  age: { min: 18, max: 100 },
  weightKg: { min: 30, max: 300 },
  heightCm: { min: 120, max: 230 },
  proteinPerKg: { min: 0.8, max: 2.2 },
  weeks: { min: 1, max: 52 },
  maintenanceCarbs: { min: 40, max: 120 },
};

/** Fat should not fall below roughly a fifth of energy on a ketogenic-style plan. */
export const MIN_FAT_ENERGY_SHARE = 0.2;

/**
 * Mifflin-St Jeor resting metabolic rate, kcal/day.
 * @param {"male"|"female"} sex
 * @param {number} weightKg
 * @param {number} heightCm
 * @param {number} age years
 */
export function basalMetabolicRate(sex, weightKg, heightCm, age) {
  const offset = MIFFLIN_OFFSET[sex];
  if (offset === undefined) return null;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + offset;
}

/**
 * Daily net carb allowance for a phase after a number of weeks spent in it.
 * @param {string} phaseId key of ATKINS_PHASES
 * @param {number} weeksInPhase 1 = first week of the phase
 * @param {number} [maintenanceCarbs] personal tolerance used only in Phase 4
 */
export function netCarbAllowance(phaseId, weeksInPhase, maintenanceCarbs) {
  const phase = ATKINS_PHASES[phaseId];
  if (!phase) return null;
  if (phaseId === "maintenance") {
    const tol = Number.isFinite(maintenanceCarbs) ? maintenanceCarbs : phase.start;
    return Math.min(Math.max(tol, LIMITS.maintenanceCarbs.min), LIMITS.maintenanceCarbs.max);
  }
  const weeks = Math.max(1, Math.floor(weeksInPhase));
  const raw = phase.start + phase.stepPerWeek * (weeks - 1);
  return Math.min(raw, phase.ceiling);
}

/**
 * Full phase plan: calories, net carbs, protein and fat.
 *
 * @param {object} input
 * @param {"male"|"female"} input.sex
 * @param {number} input.age                 years
 * @param {number} input.weightKg
 * @param {number} input.heightCm
 * @param {string} input.activity            key of ACTIVITY_FACTORS
 * @param {string} input.phase               key of ATKINS_PHASES
 * @param {number} input.weeksInPhase        weeks completed in this phase, 1-based
 * @param {string} input.goal                key of GOALS
 * @param {number} input.proteinPerKg        grams of protein per kg body weight
 * @param {number} [input.maintenanceCarbs]  personal net carb tolerance, Phase 4 only
 * @returns {object} plan or { error }
 */
export function atkinsPlan({
  sex,
  age,
  weightKg,
  heightCm,
  activity,
  phase,
  weeksInPhase = 1,
  goal = "lose",
  proteinPerKg = 1.4,
  maintenanceCarbs = ATKINS_PHASES.maintenance.start,
}) {
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female so the correct BMR equation is used." };
  }
  const numbers = { age, weightKg, heightCm, proteinPerKg, weeksInPhase };
  for (const [key, value] of Object.entries(numbers)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return { error: `Enter a valid number for ${key}.` };
    }
  }
  if (age < LIMITS.age.min || age > LIMITS.age.max) {
    return { error: `Age must be between ${LIMITS.age.min} and ${LIMITS.age.max} years.` };
  }
  if (weightKg < LIMITS.weightKg.min || weightKg > LIMITS.weightKg.max) {
    return {
      error: `Weight must be between ${LIMITS.weightKg.min} and ${LIMITS.weightKg.max} kg.`,
    };
  }
  if (heightCm < LIMITS.heightCm.min || heightCm > LIMITS.heightCm.max) {
    return {
      error: `Height must be between ${LIMITS.heightCm.min} and ${LIMITS.heightCm.max} cm.`,
    };
  }
  if (proteinPerKg < LIMITS.proteinPerKg.min || proteinPerKg > LIMITS.proteinPerKg.max) {
    return {
      error: `Protein must be between ${LIMITS.proteinPerKg.min} and ${LIMITS.proteinPerKg.max} g per kg of body weight.`,
    };
  }
  if (weeksInPhase < LIMITS.weeks.min || weeksInPhase > LIMITS.weeks.max) {
    return { error: `Weeks in phase must be between 1 and ${LIMITS.weeks.max}.` };
  }
  const phaseDef = ATKINS_PHASES[phase];
  if (!phaseDef) return { error: "Choose one of the four Atkins phases." };
  const activityDef = ACTIVITY_FACTORS[activity];
  if (!activityDef) return { error: "Choose an activity level." };
  const goalDef = GOALS[goal];
  if (!goalDef) return { error: "Choose a weight goal." };

  const bmr = basalMetabolicRate(sex, weightKg, heightCm, age);
  const tdee = bmr * activityDef.factor;
  const calories = tdee * (1 + goalDef.adjust);

  const netCarbs = netCarbAllowance(phase, weeksInPhase, maintenanceCarbs);
  const proteinGrams = proteinPerKg * weightKg;
  const carbKcal = netCarbs * KCAL_PER_GRAM.carb;
  const proteinKcal = proteinGrams * KCAL_PER_GRAM.protein;
  const fatKcal = calories - carbKcal - proteinKcal;

  if (fatKcal <= 0) {
    return {
      error:
        "Protein and carbs alone already exceed the calorie target. Lower the protein per kg or choose a smaller deficit.",
    };
  }

  const fatGrams = fatKcal / KCAL_PER_GRAM.fat;
  const fatShare = fatKcal / calories;

  const foundationVeg = {
    min: Math.min(FOUNDATION_VEG_NET_CARBS.min, netCarbs),
    max: Math.min(FOUNDATION_VEG_NET_CARBS.max, netCarbs),
  };

  return {
    bmr,
    tdee,
    calories,
    phaseName: phaseDef.name,
    phaseSummary: phaseDef.summary,
    minWeeks: phaseDef.minWeeks,
    netCarbs,
    carbCeiling: phase === "maintenance" ? LIMITS.maintenanceCarbs.max : phaseDef.ceiling,
    atCeiling: netCarbs >= phaseDef.ceiling,
    foundationVeg,
    otherCarbs: Math.max(0, netCarbs - foundationVeg.min),
    proteinGrams,
    fatGrams,
    carbKcal,
    proteinKcal,
    fatKcal,
    carbShare: carbKcal / calories,
    proteinShare: proteinKcal / calories,
    fatShare,
    lowFatWarning: fatShare < MIN_FAT_ENERGY_SHARE,
    nextWeekCarbs:
      phaseDef.stepPerWeek > 0
        ? netCarbAllowance(phase, weeksInPhase + 1, maintenanceCarbs)
        : netCarbs,
  };
}
