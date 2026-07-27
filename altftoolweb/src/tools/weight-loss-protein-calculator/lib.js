/**
 * Protein floor for a calorie deficit — the intake that protects lean mass
 * while you lose fat.
 *
 * Rules implemented:
 *  - US Institute of Medicine Dietary Reference Intakes: the protein RDA is
 *    0.8 g per kg bodyweight per day. That is a minimum to avoid deficiency in
 *    weight-stable adults, not a target for people in an energy deficit.
 *  - Reviews of energy-restricted diets (e.g. Leidy et al., Am J Clin Nutr
 *    2015): intakes of roughly 1.2-1.6 g/kg preserve fat-free mass and appetite
 *    control better than the RDA during weight loss.
 *  - ISSN Position Stand on protein and exercise (2017): 1.4-2.0 g/kg for
 *    people doing resistance training, with the top of the band appropriate in
 *    a deficit.
 *  - Devine formula (1974) for ideal body weight: 50 kg (men) or 45.5 kg
 *    (women) plus 2.3 kg for every inch of height above 5 feet.
 *  - Standard clinical adjusted body weight: ABW = IBW + 0.25 x (actual - IBW),
 *    used from BMI 30 upward, because fat mass is not metabolically active
 *    protein-consuming tissue and g/kg of scale weight overshoots badly.
 *  - IOM Acceptable Macronutrient Distribution Range: protein 10-35% of energy.
 *  - Protein supplies 4 kcal per gram (Atwater factor).
 */

/** Atwater energy factor for protein. */
export const KCAL_PER_G_PROTEIN = 4;

/** IOM protein RDA for adults, g per kg bodyweight per day. */
export const PROTEIN_RDA_G_PER_KG = 0.8;

/** BMI at which the adjusted body weight correction kicks in (WHO obesity). */
export const ADJUSTED_WEIGHT_BMI_THRESHOLD = 30;

/** Clinical adjustment factor in ABW = IBW + factor x (actual - IBW). */
export const ADJUSTED_WEIGHT_FACTOR = 0.25;

/** Devine formula constants. */
export const DEVINE_BASE_KG = { male: 50, female: 45.5 };
export const DEVINE_PER_INCH_KG = 2.3;
export const DEVINE_BASE_HEIGHT_INCHES = 60; // 5 feet
export const CM_PER_INCH = 2.54;

/** Floor so the Devine extrapolation cannot produce an absurd IBW. */
export const MIN_IBW_KG = 30;

/** IOM AMDR for protein, percent of daily energy. */
export const AMDR_MIN_PCT = 10;
export const AMDR_MAX_PCT = 35;

/** Per-meal dose that maximally stimulates muscle protein synthesis, grams. */
export const PER_MEAL_MPS_G = 25;

/**
 * Training and activity levels mapped onto the published g/kg bands.
 * Values apply to the reference weight (actual or adjusted).
 */
export const ACTIVITY_LEVELS = [
  {
    id: "sedentary",
    label: "Sedentary — desk job, no structured exercise",
    gPerKg: 1.2,
    note: "Lower edge of the range shown to preserve fat-free mass in a deficit.",
  },
  {
    id: "light",
    label: "Light — walking, occasional cardio",
    gPerKg: 1.4,
    note: "Mid range for energy-restricted diets without heavy lifting.",
  },
  {
    id: "resistance2",
    label: "Resistance training 1-2 times a week",
    gPerKg: 1.6,
    note: "Top of the general weight-loss range, bottom of the ISSN training range.",
  },
  {
    id: "resistance3",
    label: "Resistance training 3-4 times a week",
    gPerKg: 1.8,
    note: "ISSN range for people training to keep muscle while dieting.",
  },
  {
    id: "resistance5",
    label: "Resistance training 5+ times a week",
    gPerKg: 2.0,
    note: "Upper ISSN figure, for trained lifters in a sustained deficit.",
  },
];

export const MIN_WEIGHT_KG = 30;
export const MAX_WEIGHT_KG = 300;
export const MIN_HEIGHT_CM = 120;
export const MAX_HEIGHT_CM = 230;
export const MIN_MEALS = 2;
export const MAX_MEALS = 8;

const round = (value, dp = 0) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/** Devine ideal body weight in kg, floored at MIN_IBW_KG. */
export function idealBodyWeightKg(heightCm, sex) {
  const inches = heightCm / CM_PER_INCH;
  const base = DEVINE_BASE_KG[sex] ?? DEVINE_BASE_KG.female;
  const ibw = base + DEVINE_PER_INCH_KG * (inches - DEVINE_BASE_HEIGHT_INCHES);
  return Math.max(MIN_IBW_KG, ibw);
}

/** Body mass index in kg/m². */
export function bodyMassIndex(weightKg, heightCm) {
  const metres = heightCm / 100;
  return weightKg / (metres * metres);
}

/**
 * @param {object} input
 * @param {number} input.weightKg        Current weight in kilograms.
 * @param {number} input.heightCm        Height in centimetres.
 * @param {string} [input.sex]           "male" | "female".
 * @param {string} [input.activity]      Id from ACTIVITY_LEVELS.
 * @param {number} [input.meals]         Protein-containing meals per day.
 * @param {number|null} [input.dailyKcal] Optional calorie target while dieting.
 * @returns {object} result, or { error } for invalid input.
 */
export function computeWeightLossProtein({
  weightKg,
  heightCm,
  sex = "male",
  activity = "resistance2",
  meals = 3,
  dailyKcal = null,
} = {}) {
  const weight = Number(weightKg);
  if (!Number.isFinite(weight)) return { error: "Enter your current weight in kilograms." };
  if (weight < MIN_WEIGHT_KG || weight > MAX_WEIGHT_KG) {
    return { error: `Weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }

  const height = Number(heightCm);
  if (!Number.isFinite(height)) return { error: "Enter your height in centimetres." };
  if (height < MIN_HEIGHT_CM || height > MAX_HEIGHT_CM) {
    return { error: `Height should be between ${MIN_HEIGHT_CM} cm and ${MAX_HEIGHT_CM} cm.` };
  }

  const mealCount = Number(meals);
  if (!Number.isFinite(mealCount) || !Number.isInteger(mealCount) || mealCount < MIN_MEALS || mealCount > MAX_MEALS) {
    return { error: `Choose between ${MIN_MEALS} and ${MAX_MEALS} protein meals per day.` };
  }

  let kcal = null;
  if (dailyKcal !== null && dailyKcal !== "" && dailyKcal !== undefined) {
    const parsed = Number(dailyKcal);
    if (!Number.isFinite(parsed)) return { error: "Calorie target must be a number, or leave it blank." };
    if (parsed < 800 || parsed > 5000) {
      return { error: "Calorie target should be between 800 and 5000 kcal, or left blank." };
    }
    kcal = parsed;
  }

  const level = ACTIVITY_LEVELS.find((item) => item.id === activity) ?? ACTIVITY_LEVELS[2];
  const normalisedSex = sex === "female" ? "female" : "male";

  const bmi = bodyMassIndex(weight, height);
  const ibwKg = idealBodyWeightKg(height, normalisedSex);
  const usesAdjustedWeight = bmi >= ADJUSTED_WEIGHT_BMI_THRESHOLD && weight > ibwKg;
  const adjustedKg = ibwKg + ADJUSTED_WEIGHT_FACTOR * (weight - ibwKg);
  const referenceKg = usesAdjustedWeight ? adjustedKg : weight;

  const proteinFloor = level.gPerKg * referenceKg;
  const rdaBaseline = PROTEIN_RDA_G_PER_KG * weight;

  const perMeal = proteinFloor / mealCount;
  const proteinKcal = proteinFloor * KCAL_PER_G_PROTEIN;
  const proteinPctOfIntake = kcal === null ? null : (proteinKcal / kcal) * 100;
  const remainingKcal = kcal === null ? null : kcal - proteinKcal;

  const notes = [];
  if (usesAdjustedWeight) {
    notes.push(
      `BMI is ${round(bmi, 1)}, so the target uses adjusted body weight of ${round(referenceKg, 1)} kg rather than ${round(weight, 1)} kg. Scaling protein to full scale weight at this BMI produces a figure most people cannot eat or afford.`,
    );
  } else {
    notes.push(
      `BMI is ${round(bmi, 1)}, so the target is scaled to your actual weight of ${round(weight, 1)} kg.`,
    );
  }
  if (perMeal < PER_MEAL_MPS_G) {
    notes.push(
      `Each meal works out at ${round(perMeal)} g, under the ~25 g that reliably stimulates muscle protein synthesis. Fewer, larger feeds — about ${Math.max(2, Math.floor(proteinFloor / PER_MEAL_MPS_G))} a day — would keep every meal above that mark.`,
    );
  }
  if (proteinPctOfIntake !== null && proteinPctOfIntake > AMDR_MAX_PCT) {
    notes.push(
      `Protein would supply ${round(proteinPctOfIntake)}% of a ${round(kcal)} kcal day, above the 10-35% AMDR. That is common in an aggressive deficit but leaves little room for carbohydrate and fat.`,
    );
  }
  notes.push(
    "Losing more than about 1% of bodyweight a week tends to cost lean mass however much protein you eat — a slower deficit plus resistance training protects muscle better.",
  );

  return {
    weightKg: round(weight, 1),
    heightCm: round(height, 1),
    sex: normalisedSex,
    bmi: round(bmi, 1),
    ibwKg: round(ibwKg, 1),
    adjustedKg: round(adjustedKg, 1),
    usesAdjustedWeight,
    referenceKg: round(referenceKg, 1),
    referenceLabel: usesAdjustedWeight ? "adjusted body weight" : "actual body weight",
    activityId: level.id,
    activityLabel: level.label,
    activityNote: level.note,
    gPerKg: level.gPerKg,
    proteinFloor: round(proteinFloor),
    rdaBaseline: round(rdaBaseline),
    aboveRda: round(proteinFloor - rdaBaseline),
    rdaMultiple: round(proteinFloor / rdaBaseline, 2),
    meals: mealCount,
    perMeal: round(perMeal),
    meetsPerMealMps: perMeal >= PER_MEAL_MPS_G,
    proteinKcal: round(proteinKcal),
    dailyKcal: kcal === null ? null : round(kcal),
    proteinPctOfIntake: proteinPctOfIntake === null ? null : round(proteinPctOfIntake, 1),
    remainingKcal: remainingKcal === null ? null : round(remainingKcal),
    notes,
  };
}
