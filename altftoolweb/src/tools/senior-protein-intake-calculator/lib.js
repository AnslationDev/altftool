/**
 * Senior protein intake calculator (adults roughly 60 and over).
 *
 * Why older adults need more than the RDA
 * ---------------------------------------
 * The adult RDA of 0.8 g/kg/day (Institute of Medicine, DRI for Macronutrients
 * 2005) was set to prevent deficiency in healthy young adults. Ageing muscle
 * shows anabolic resistance - it responds less to the same dose of protein - so
 * two expert groups independently recommended higher intakes for older people:
 *
 *   PROT-AGE Study Group (Bauer J et al., J Am Med Dir Assoc 2013;14:542-559)
 *   ESPEN expert group (Deutz NEP et al., Clin Nutr 2014;33:929-936)
 *
 * Both concluded:
 *   healthy adults 65+                       1.0 - 1.2 g/kg/day
 *   with acute or chronic illness            1.2 - 1.5 g/kg/day
 *   severe illness, injury or malnutrition    up to 2.0 g/kg/day
 *   people who exercise                      at least 1.2 g/kg/day
 *   severe kidney disease (eGFR under 30,
 *   not on dialysis)                         protein must be RESTRICTED and
 *                                            managed by a clinician
 *
 * Per-meal dose
 * -------------
 * Total daily grams are not enough on their own: muscle protein synthesis
 * responds to the size of each individual meal. Around 25-30 g of high-quality
 * protein per meal, carrying roughly 2.5-2.8 g of leucine, is the dose commonly
 * cited as needed to overcome anabolic resistance (Paddon-Jones D & Rasmussen
 * BB, Curr Opin Clin Nutr Metab Care 2009;12:86-90). Moore DR et al.
 * (J Gerontol A Biol Sci Med Sci 2015;70:57-62) put the per-meal dose at about
 * 0.40 g/kg for older adults against 0.24 g/kg for young adults.
 *
 * Body-weight basis
 * -----------------
 * Actual body weight is used, except at a BMI of 30 or more, where dosing on
 * actual weight over-estimates lean mass. In that case clinical practice uses
 * adjusted body weight: ABW = IBW + 0.25 x (actual - IBW), with ideal body
 * weight from the Devine formula (Devine BJ, Drug Intell Clin Pharm 1974):
 * men 50 kg + 2.3 kg per inch over 5 ft, women 45.5 kg + 2.3 kg per inch.
 *
 * Informational only. Not medical or dietetic advice.
 */

/** Adult protein RDA, g per kg body weight per day (IOM 2005). */
export const ADULT_RDA_G_PER_KG = 0.8;

/** Protein bands in g/kg/day from the PROT-AGE and ESPEN recommendations. */
export const HEALTH_STATUS = {
  healthy: {
    label: "Healthy and independent",
    min: 1.0,
    max: 1.2,
    note: "PROT-AGE and ESPEN both recommend 1.0-1.2 g/kg/day for healthy older adults.",
    restricted: false,
  },
  chronic: {
    label: "Living with a chronic illness",
    min: 1.2,
    max: 1.5,
    note: "Chronic conditions raise protein needs to 1.2-1.5 g/kg/day.",
    restricted: false,
  },
  acute: {
    label: "Acute illness, injury, surgery or malnutrition",
    min: 1.5,
    max: 2.0,
    note: "Acute illness, injury and malnutrition can push needs as high as 2.0 g/kg/day.",
    restricted: false,
  },
  kidney: {
    label: "Severe kidney disease, not on dialysis",
    min: ADULT_RDA_G_PER_KG,
    max: ADULT_RDA_G_PER_KG,
    note: "With severe kidney disease protein is restricted rather than increased, and the target must be set by your kidney team.",
    restricted: true,
  },
};

/**
 * Resistance training floors, g/kg/day. PROT-AGE recommends at least
 * 1.2 g/kg/day for older people who exercise.
 */
export const TRAINING_LEVELS = {
  none: { label: "No regular resistance training", minFloor: 0, maxFloor: 0 },
  some: { label: "Resistance training 1-2 days a week", minFloor: 1.2, maxFloor: 0 },
  regular: { label: "Resistance training 3 or more days a week", minFloor: 1.2, maxFloor: 1.5 },
};

/** Per-meal protein needed to trigger muscle protein synthesis in older adults, grams. */
export const PER_MEAL_THRESHOLD_G = { min: 25, max: 30 };

/** Leucine that a 25-30 g high-quality protein meal typically carries, grams. */
export const PER_MEAL_LEUCINE_G = { min: 2.5, max: 2.8 };

/** Moore 2015 per-meal dose for older adults, g per kg of body weight. */
export const PER_MEAL_G_PER_KG_OLDER = 0.4;

/** Devine ideal body weight constants (1974). */
export const DEVINE = { maleBaseKg: 50, femaleBaseKg: 45.5, kgPerInchOver5ft: 2.3 };

/** Centimetres in one inch, and the height of 5 feet in centimetres. */
export const CM_PER_INCH = 2.54;
export const FIVE_FEET_CM = 152.4;

/** BMI at or above which adjusted body weight is used instead of actual weight. */
export const ADJUSTED_WEIGHT_BMI_THRESHOLD = 30;

/** Fraction of excess weight added back in the adjusted body weight formula. */
export const ADJUSTED_WEIGHT_FACTOR = 0.25;

export const LIMITS = {
  age: { min: 60, max: 110 },
  weightKg: { min: 30, max: 250 },
  heightCm: { min: 120, max: 220 },
  mealsPerDay: { min: 2, max: 6 },
};

/** Devine ideal body weight in kilograms. Returns null for an unknown sex. */
export function idealBodyWeightKg(sex, heightCm) {
  const base = sex === "male" ? DEVINE.maleBaseKg : sex === "female" ? DEVINE.femaleBaseKg : null;
  if (base === null) return null;
  const inchesOver5ft = Math.max(0, (heightCm - FIVE_FEET_CM) / CM_PER_INCH);
  return base + DEVINE.kgPerInchOver5ft * inchesOver5ft;
}

/** Body mass index, kg/m^2. Returns null when height is not usable. */
export function bodyMassIndex(weightKg, heightCm) {
  if (!(heightCm > 0) || !(weightKg > 0)) return null;
  const metres = heightCm / 100;
  return weightKg / (metres * metres);
}

/**
 * Daily protein target for an older adult.
 *
 * @param {object} input
 * @param {"male"|"female"} input.sex
 * @param {number} input.age            years
 * @param {number} input.weightKg
 * @param {number} input.heightCm
 * @param {string} input.healthStatus   key of HEALTH_STATUS
 * @param {string} input.training       key of TRAINING_LEVELS
 * @param {number} input.mealsPerDay    protein-containing meals a day
 * @returns {object} the target, or { error }
 */
export function seniorProteinTarget({
  sex,
  age,
  weightKg,
  heightCm,
  healthStatus = "healthy",
  training = "none",
  mealsPerDay = 3,
}) {
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female so the ideal-body-weight formula can be applied." };
  }
  const numeric = { age, weightKg, heightCm, mealsPerDay };
  for (const [key, value] of Object.entries(numeric)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return { error: `Enter a valid number for ${key}.` };
    }
  }
  if (age < LIMITS.age.min || age > LIMITS.age.max) {
    return {
      error: `This calculator uses recommendations written for adults aged ${LIMITS.age.min} and over.`,
    };
  }
  if (weightKg < LIMITS.weightKg.min || weightKg > LIMITS.weightKg.max) {
    return { error: `Weight must be between ${LIMITS.weightKg.min} and ${LIMITS.weightKg.max} kg.` };
  }
  if (heightCm < LIMITS.heightCm.min || heightCm > LIMITS.heightCm.max) {
    return { error: `Height must be between ${LIMITS.heightCm.min} and ${LIMITS.heightCm.max} cm.` };
  }
  if (mealsPerDay < LIMITS.mealsPerDay.min || mealsPerDay > LIMITS.mealsPerDay.max) {
    return {
      error: `Spread protein across ${LIMITS.mealsPerDay.min} to ${LIMITS.mealsPerDay.max} meals a day.`,
    };
  }
  if (!Number.isInteger(mealsPerDay)) {
    return { error: "Meals a day must be a whole number." };
  }
  const status = HEALTH_STATUS[healthStatus];
  if (!status) return { error: "Choose a health status." };
  const trainingDef = TRAINING_LEVELS[training];
  if (!trainingDef) return { error: "Choose a resistance-training level." };

  const bmi = bodyMassIndex(weightKg, heightCm);
  const ibw = idealBodyWeightKg(sex, heightCm);
  const usesAdjustedWeight = bmi >= ADJUSTED_WEIGHT_BMI_THRESHOLD && weightKg > ibw;
  const adjustedWeight = ibw + ADJUSTED_WEIGHT_FACTOR * (weightKg - ibw);
  const dosingWeight = usesAdjustedWeight ? adjustedWeight : weightKg;

  // Training raises the floor, but never overrides a medically restricted target.
  const minPerKg = status.restricted ? status.min : Math.max(status.min, trainingDef.minFloor);
  const maxPerKg = status.restricted ? status.max : Math.max(status.max, trainingDef.maxFloor);
  const midPerKg = (minPerKg + maxPerKg) / 2;

  const minGrams = minPerKg * dosingWeight;
  const maxGrams = maxPerKg * dosingWeight;
  const recommendedGrams = midPerKg * dosingWeight;
  const rdaGrams = ADULT_RDA_G_PER_KG * dosingWeight;

  const perMealGrams = recommendedGrams / mealsPerDay;
  const perMealMooreGrams = PER_MEAL_G_PER_KG_OLDER * dosingWeight;
  const mealsToClearThreshold = Math.floor(recommendedGrams / PER_MEAL_THRESHOLD_G.min);

  return {
    bmi,
    idealBodyWeightKg: ibw,
    adjustedBodyWeightKg: adjustedWeight,
    dosingWeightKg: dosingWeight,
    usesAdjustedWeight,
    statusLabel: status.label,
    statusNote: status.note,
    restricted: status.restricted,
    trainingLabel: trainingDef.label,
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
    perMealMooreGrams,
    perMealThresholdG: PER_MEAL_THRESHOLD_G,
    perMealLeucineG: PER_MEAL_LEUCINE_G,
    perMealBelowThreshold: perMealGrams < PER_MEAL_THRESHOLD_G.min,
    mealsToClearThreshold,
  };
}
