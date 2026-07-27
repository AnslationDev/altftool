/**
 * Teen protein intake calculator (ages 9-18).
 *
 * Protein RDA by age
 * ------------------
 * Institute of Medicine, Dietary Reference Intakes for Energy, Carbohydrate,
 * Fibre, Fat, Fatty Acids, Cholesterol, Protein and Amino Acids (2005):
 *   9-13 years   EAR 0.76 g/kg/day   RDA 0.95 g/kg/day
 *   14-18 years  EAR 0.71 g/kg/day   RDA 0.85 g/kg/day
 *   19+ years    EAR 0.66 g/kg/day   RDA 0.80 g/kg/day
 * The RDA is higher than the adult figure because growing tissue is being laid
 * down, not just maintained.
 *
 * Sport
 * -----
 * The joint position stand of the Academy of Nutrition and Dietetics, Dietitians
 * of Canada and the American College of Sports Medicine (Med Sci Sports Exerc
 * 2016;48:543-568) puts athlete protein needs at 1.2-2.0 g/kg/day, with the
 * upper end for athletes building muscle or in heavy training. The bands used
 * here sit inside that range and never fall below the age-appropriate RDA.
 *
 * Energy
 * ------
 * Estimated Energy Requirement from the same IOM report, for children 9-18,
 * including the 25 kcal/day allowance for energy deposition (growth):
 *   Boys:  EER = 88.5 - 61.9 x age + PA x (26.7 x weight_kg + 903 x height_m) + 25
 *   Girls: EER = 135.3 - 30.8 x age + PA x (10.0 x weight_kg + 934 x height_m) + 25
 * PA is the physical-activity coefficient for the child's activity category.
 *
 * Acceptable Macronutrient Distribution Range
 * -------------------------------------------
 * For children aged 4-18 the IOM AMDR for protein is 10-30% of total energy
 * (adults 10-35%). The tool checks the recommended intake against that window,
 * because a gram target can look sensible and still be out of range for a very
 * large or very small energy intake.
 *
 * Informational only. Not medical or dietetic advice, and not a substitute for a
 * paediatrician or sports dietitian.
 */

/** Protein RDA and EAR in g/kg/day by age band (IOM 2005). */
export const AGE_BANDS = [
  { label: "9-13 years", minAge: 9, maxAge: 13, rdaPerKg: 0.95, earPerKg: 0.76 },
  { label: "14-18 years", minAge: 14, maxAge: 18, rdaPerKg: 0.85, earPerKg: 0.71 },
];

/** IOM physical-activity coefficients for children aged 3-18. */
export const ACTIVITY_LEVELS = {
  sedentary: {
    label: "Sedentary (school and daily living only)",
    paBoys: 1.0,
    paGirls: 1.0,
  },
  lowActive: {
    label: "Low active (about 30-60 min of activity a day)",
    paBoys: 1.13,
    paGirls: 1.16,
  },
  active: {
    label: "Active (about 60 min of activity a day)",
    paBoys: 1.26,
    paGirls: 1.31,
  },
  veryActive: {
    label: "Very active (60 min plus extra vigorous training)",
    paBoys: 1.42,
    paGirls: 1.56,
  },
};

/**
 * Protein bands in g/kg/day by sport involvement. null means "use the RDA".
 * All values sit inside the 1.2-2.0 g/kg athlete range from the 2016 joint
 * position stand.
 */
export const SPORT_LEVELS = {
  none: { label: "No regular sport or training", min: null, max: null },
  recreational: { label: "Recreational sport, 2-3 sessions a week", min: 1.0, max: 1.2 },
  competitive: { label: "Competitive team or endurance sport", min: 1.2, max: 1.6 },
  strength: { label: "Strength training to build muscle", min: 1.4, max: 1.7 },
};

/** Atwater energy factor for protein, kcal per gram. */
export const KCAL_PER_GRAM_PROTEIN = 4;

/** IOM AMDR for protein in children aged 4-18, as a fraction of total energy. */
export const AMDR_PROTEIN = { min: 0.1, max: 0.3 };

/** Energy deposition allowance for growth in the 9-18 EER equations, kcal/day. */
export const GROWTH_KCAL = 25;

/** Per-meal protein dose that reliably stimulates muscle protein synthesis, g per kg. */
export const PER_MEAL_G_PER_KG = 0.25;

export const LIMITS = {
  age: { min: 9, max: 18 },
  weightKg: { min: 20, max: 150 },
  heightCm: { min: 110, max: 210 },
  mealsPerDay: { min: 3, max: 6 },
};

/** The IOM age band a teenager falls into, or null when out of range. */
export function ageBandFor(age) {
  return AGE_BANDS.find((band) => age >= band.minAge && age <= band.maxAge) ?? null;
}

/**
 * IOM Estimated Energy Requirement for a child aged 9-18, kcal/day.
 * Returns null when sex or activity level is unknown.
 */
export function estimatedEnergyRequirement({ sex, age, weightKg, heightCm, activity }) {
  const level = ACTIVITY_LEVELS[activity];
  if (!level) return null;
  const heightM = heightCm / 100;
  if (sex === "male") {
    return 88.5 - 61.9 * age + level.paBoys * (26.7 * weightKg + 903 * heightM) + GROWTH_KCAL;
  }
  if (sex === "female") {
    return 135.3 - 30.8 * age + level.paGirls * (10.0 * weightKg + 934 * heightM) + GROWTH_KCAL;
  }
  return null;
}

/**
 * Daily protein target for a 9-18 year old.
 *
 * @param {object} input
 * @param {"male"|"female"} input.sex
 * @param {number} input.age           years, 9 to 18
 * @param {number} input.weightKg
 * @param {number} input.heightCm
 * @param {string} input.activity      key of ACTIVITY_LEVELS
 * @param {string} input.sport         key of SPORT_LEVELS
 * @param {number} input.mealsPerDay   protein-containing meals and snacks
 * @returns {object} the target, or { error }
 */
export function teenProteinTarget({
  sex,
  age,
  weightKg,
  heightCm,
  activity = "active",
  sport = "recreational",
  mealsPerDay = 4,
}) {
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female so the correct growth equations are used." };
  }
  const numeric = { age, weightKg, heightCm, mealsPerDay };
  for (const [key, value] of Object.entries(numeric)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return { error: `Enter a valid number for ${key}.` };
    }
  }
  if (age < LIMITS.age.min || age > LIMITS.age.max) {
    return {
      error: `This calculator covers ages ${LIMITS.age.min} to ${LIMITS.age.max}. Younger children and adults use different reference values.`,
    };
  }
  if (weightKg < LIMITS.weightKg.min || weightKg > LIMITS.weightKg.max) {
    return { error: `Weight must be between ${LIMITS.weightKg.min} and ${LIMITS.weightKg.max} kg.` };
  }
  if (heightCm < LIMITS.heightCm.min || heightCm > LIMITS.heightCm.max) {
    return { error: `Height must be between ${LIMITS.heightCm.min} and ${LIMITS.heightCm.max} cm.` };
  }
  if (!Number.isInteger(mealsPerDay)) {
    return { error: "Meals a day must be a whole number." };
  }
  if (mealsPerDay < LIMITS.mealsPerDay.min || mealsPerDay > LIMITS.mealsPerDay.max) {
    return {
      error: `Spread protein across ${LIMITS.mealsPerDay.min} to ${LIMITS.mealsPerDay.max} meals and snacks.`,
    };
  }
  const band = ageBandFor(age);
  if (!band) return { error: "Enter an age between 9 and 18." };
  const activityDef = ACTIVITY_LEVELS[activity];
  if (!activityDef) return { error: "Choose an activity level." };
  const sportDef = SPORT_LEVELS[sport];
  if (!sportDef) return { error: "Choose a sport level." };

  const rdaPerKg = band.rdaPerKg;
  const minPerKg = sportDef.min === null ? rdaPerKg : Math.max(rdaPerKg, sportDef.min);
  const maxPerKg = sportDef.max === null ? rdaPerKg : Math.max(minPerKg, sportDef.max);
  const midPerKg = (minPerKg + maxPerKg) / 2;

  const rdaGrams = rdaPerKg * weightKg;
  const earGrams = band.earPerKg * weightKg;
  const minGrams = minPerKg * weightKg;
  const maxGrams = maxPerKg * weightKg;
  const recommendedGrams = midPerKg * weightKg;

  const energyKcal = estimatedEnergyRequirement({ sex, age, weightKg, heightCm, activity });
  if (energyKcal === null || !(energyKcal > 0)) {
    return { error: "These measurements do not produce a usable energy estimate." };
  }

  const proteinKcal = recommendedGrams * KCAL_PER_GRAM_PROTEIN;
  const proteinShareOfEnergy = proteinKcal / energyKcal;
  const amdrMinGrams = (energyKcal * AMDR_PROTEIN.min) / KCAL_PER_GRAM_PROTEIN;
  const amdrMaxGrams = (energyKcal * AMDR_PROTEIN.max) / KCAL_PER_GRAM_PROTEIN;

  return {
    bandLabel: band.label,
    rdaPerKg,
    earPerKg: band.earPerKg,
    rdaGrams,
    earGrams,
    minPerKg,
    maxPerKg,
    midPerKg,
    minGrams,
    maxGrams,
    recommendedGrams,
    extraOverRdaGrams: recommendedGrams - rdaGrams,
    activityLabel: activityDef.label,
    sportLabel: sportDef.label,
    energyKcal,
    proteinKcal,
    proteinShareOfEnergy,
    amdrMinShare: AMDR_PROTEIN.min,
    amdrMaxShare: AMDR_PROTEIN.max,
    amdrMinGrams,
    amdrMaxGrams,
    belowAmdr: proteinShareOfEnergy < AMDR_PROTEIN.min,
    aboveAmdr: proteinShareOfEnergy > AMDR_PROTEIN.max,
    mealsPerDay,
    perMealGrams: recommendedGrams / mealsPerDay,
    perMealMinimumGrams: PER_MEAL_G_PER_KG * weightKg,
    growthKcal: GROWTH_KCAL,
  };
}
