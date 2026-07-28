/**
 * Senior calorie needs calculator.
 *
 * Resting energy is estimated with the Mifflin-St Jeor equation (Mifflin et al.,
 * Am J Clin Nutr 1990), which is the equation the Academy of Nutrition and
 * Dietetics recommends for adults and which already carries an explicit age
 * term of -5 kcal per year — the arithmetic behind the fact that energy needs
 * fall with age:
 *
 *   Men:   BMR = 10 x weight(kg) + 6.25 x height(cm) - 5 x age(years) + 5
 *   Women: BMR = 10 x weight(kg) + 6.25 x height(cm) - 5 x age(years) - 161
 *
 * Total daily energy is BMR multiplied by a physical activity factor.
 * Protein targets follow the PROT-AGE study group and ESPEN guidance for older
 * adults, which is higher than the general 0.8 g/kg RDA.
 */

export const MIN_AGE = 50;
export const MAX_AGE = 110;
export const MIN_WEIGHT_KG = 25;
export const MAX_WEIGHT_KG = 250;
export const MIN_HEIGHT_CM = 100;
export const MAX_HEIGHT_CM = 230;

export const ACTIVITY_LEVELS = [
  { key: "sedentary", label: "Sedentary", factor: 1.2, detail: "Mostly seated, little walking beyond the house." },
  { key: "light", label: "Lightly active", factor: 1.375, detail: "Light housework or a short walk most days." },
  { key: "moderate", label: "Moderately active", factor: 1.55, detail: "Brisk walking, gardening or exercise class 3-5 days a week." },
  { key: "very", label: "Very active", factor: 1.725, detail: "Hard physical activity or exercise on most days." },
  { key: "extra", label: "Extremely active", factor: 1.9, detail: "Physical job plus daily training." },
];

/**
 * Protein targets in grams per kilogram of body weight per day.
 * PROT-AGE / ESPEN advise 1.0-1.2 g/kg for healthy older adults, rising to
 * 1.2-1.5 g/kg with acute or chronic illness — well above the 0.8 g/kg RDA.
 */
export const PROTEIN_G_PER_KG = { healthyMin: 1.0, healthyMax: 1.2, illnessMin: 1.2, illnessMax: 1.5 };

/** Calories in one gram of protein (Atwater factor). */
export const KCAL_PER_G_PROTEIN = 4;

/**
 * Weight-change goals. A 500 kcal daily deficit corresponds to roughly
 * 0.45 kg (1 lb) a week using the traditional 7,700 kcal per kg of body fat.
 */
export const GOALS = [
  { key: "maintain", label: "Keep weight steady", delta: 0, note: "Energy in matches energy out." },
  { key: "gentle-loss", label: "Lose weight slowly", delta: -500, note: "About 0.45 kg a week. Slower loss protects muscle in later life." },
  { key: "gentle-gain", label: "Regain lost weight", delta: 300, note: "About 0.25 kg a week, paired with resistance exercise so the gain is muscle." },
];

export const KCAL_PER_KG_BODY_MASS = 7700;

/**
 * Clinical minimum intakes below which a diet is unlikely to supply enough
 * micronutrients without supervision.
 */
export const MIN_SAFE_KCAL = { male: 1500, female: 1200 };

/** Body-water fraction falls with age, so fluid guidance is included alongside. */
export const FLUID_ML_PER_KCAL = 1; // ~1 mL of fluid per kcal consumed, a standard geriatric estimate

export function mifflinStJeorBmr({ sex, weightKg, heightCm, ageYears }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return sex === "male" ? base + 5 : base - 161;
}

function round(value) {
  return Math.round(value);
}

/**
 * @param {object} input
 * @param {"male"|"female"} input.sex
 * @param {number} input.ageYears
 * @param {number} input.weightKg
 * @param {number} input.heightCm
 * @param {string} input.activityKey
 * @param {string} input.goalKey
 * @param {boolean} [input.illnessOrRecovery] use the higher protein band
 * @returns {object} results, or { error }
 */
export function computeSeniorCalories({
  sex,
  ageYears,
  weightKg,
  heightCm,
  activityKey,
  goalKey,
  illnessOrRecovery = false,
} = {}) {
  if (sex !== "male" && sex !== "female") return { error: "Choose male or female — the equation differs." };

  const age = Number(ageYears);
  if (!Number.isFinite(age)) return { error: "Enter an age in years." };
  if (age < MIN_AGE || age > MAX_AGE) {
    return { error: `This calculator covers ages ${MIN_AGE} to ${MAX_AGE}.` };
  }

  const weight = Number(weightKg);
  if (!Number.isFinite(weight)) return { error: "Enter a weight in kilograms." };
  if (weight < MIN_WEIGHT_KG || weight > MAX_WEIGHT_KG) {
    return { error: `Enter a weight between ${MIN_WEIGHT_KG} and ${MAX_WEIGHT_KG} kg.` };
  }

  const height = Number(heightCm);
  if (!Number.isFinite(height)) return { error: "Enter a height in centimetres." };
  if (height < MIN_HEIGHT_CM || height > MAX_HEIGHT_CM) {
    return { error: `Enter a height between ${MIN_HEIGHT_CM} and ${MAX_HEIGHT_CM} cm.` };
  }

  const activity = ACTIVITY_LEVELS.find((row) => row.key === activityKey);
  if (!activity) return { error: "Choose an activity level." };

  const goal = GOALS.find((row) => row.key === goalKey);
  if (!goal) return { error: "Choose a weight goal." };

  const bmr = mifflinStJeorBmr({ sex, weightKg: weight, heightCm: height, ageYears: age });
  if (!Number.isFinite(bmr) || bmr <= 0) {
    return { error: "Those measurements produce an impossible resting energy figure — please re-check them." };
  }

  const maintenance = bmr * activity.factor;
  const rawTarget = maintenance + goal.delta;
  const floor = MIN_SAFE_KCAL[sex];
  const flooredTarget = Math.max(rawTarget, floor);
  const floorApplied = flooredTarget > rawTarget;

  // What one year of age costs in calories at this activity level: the -5 kcal
  // per year age term of the equation, carried through the activity factor.
  const kcalPerYearOfAge = 5 * activity.factor;

  const proteinBand = illnessOrRecovery
    ? { min: PROTEIN_G_PER_KG.illnessMin, max: PROTEIN_G_PER_KG.illnessMax }
    : { min: PROTEIN_G_PER_KG.healthyMin, max: PROTEIN_G_PER_KG.healthyMax };
  const proteinMinG = weight * proteinBand.min;
  const proteinMaxG = weight * proteinBand.max;

  const weeklyChangeKg = (goal.delta * 7) / KCAL_PER_KG_BODY_MASS;

  return {
    sex,
    ageYears: age,
    weightKg: weight,
    heightCm: height,
    activity,
    goal,
    bmr: round(bmr),
    maintenance: round(maintenance),
    target: round(flooredTarget),
    rawTarget: round(rawTarget),
    floor,
    floorApplied,
    kcalPerYearOfAge: Math.round(kcalPerYearOfAge * 10) / 10,
    kcalPerDecade: round(kcalPerYearOfAge * 10),
    proteinBand,
    proteinMinG: round(proteinMinG),
    proteinMaxG: round(proteinMaxG),
    proteinKcalMin: round(proteinMinG * KCAL_PER_G_PROTEIN),
    proteinKcalMax: round(proteinMaxG * KCAL_PER_G_PROTEIN),
    fluidMl: round(flooredTarget * FLUID_ML_PER_KCAL),
    weeklyChangeKg: Math.round(weeklyChangeKg * 100) / 100,
    illnessOrRecovery: Boolean(illnessOrRecovery),
  };
}
