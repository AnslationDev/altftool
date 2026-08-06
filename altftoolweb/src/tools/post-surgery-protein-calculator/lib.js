/**
 * Recovery-phase protein and energy estimate after surgery. INFORMATIONAL ONLY
 * — it reproduces published guideline bands so a patient can understand the
 * numbers their dietitian or surgical team is working from. It is not a
 * prescription and does not replace an individual assessment.
 *
 * Rules implemented:
 *  - ESPEN practical guideline "Clinical nutrition in surgery" (Weimann et al.,
 *    Clin Nutr): surgical patients need about 1.5 g protein per kg per day, and
 *    25-30 kcal per kg per day of total energy.
 *  - ESPEN guideline on hospital nutrition: general medical and minor-procedure
 *    patients sit nearer 1.0-1.3 g/kg per day.
 *  - EPUAP/NPIAP/PPPIA pressure ulcer guideline: 1.25-1.5 g/kg per day for
 *    adults with, or at risk of, a pressure injury; higher with a large open
 *    wound.
 *  - ASPEN/SCCM critical care guideline: 1.2-2.0 g/kg per day where the patient
 *    is catabolic (major surgery with complications, sepsis).
 *  - ESPEN geriatric guideline (Volkert et al.): older adults with acute
 *    illness need at least 1.2 g/kg per day.
 *  - ESPEN advises using ideal or adjusted body weight in obesity rather than
 *    actual weight. Adjusted body weight = IBW + 0.25 x (actual - IBW).
 *  - Devine formula (1974) for ideal body weight: 50 kg (men) or 45.5 kg
 *    (women) plus 2.3 kg per inch of height above 5 feet.
 *  - Protein supplies 4 kcal per gram (Atwater factor).
 */

/** Atwater energy factor for protein. */
export const KCAL_PER_G_PROTEIN = 4;

/** ESPEN surgical energy target, kcal per kg per day. */
export const ENERGY_KCAL_PER_KG_MIN = 25;
export const ENERGY_KCAL_PER_KG_MAX = 30;

/** BMI at which the adjusted body weight correction applies (WHO obesity). */
export const ADJUSTED_WEIGHT_BMI_THRESHOLD = 30;
export const ADJUSTED_WEIGHT_FACTOR = 0.25;

/** Devine formula constants. */
export const DEVINE_BASE_KG = { male: 50, female: 45.5 };
export const DEVINE_PER_INCH_KG = 2.3;
export const DEVINE_BASE_HEIGHT_INCHES = 60;
export const CM_PER_INCH = 2.54;
export const MIN_IBW_KG = 30;

/** ESPEN geriatric floor: acutely ill adults at or above this age. */
export const OLDER_ADULT_AGE_YEARS = 65;
export const OLDER_ADULT_FLOOR_G_PER_KG = 1.2;

/** Absolute ceiling used by the tool, from the ASPEN critical-care range. */
export const MAX_G_PER_KG = 2.0;

/** Surgery categories and their guideline protein bands, g/kg/day. */
export const SURGERY_TYPES = [
  {
    id: "minor",
    label: "Minor day-case procedure (skin lesion, dental, arthroscopy)",
    low: 1.0,
    target: 1.0,
    high: 1.3,
    source: "ESPEN hospital nutrition band for low-stress recovery.",
  },
  {
    id: "moderate",
    label: "Moderate elective surgery (hernia repair, laparoscopic gallbladder)",
    low: 1.2,
    target: 1.3,
    high: 1.5,
    source: "Between the general ward band and the ESPEN surgical 1.5 g/kg figure.",
  },
  {
    id: "major",
    label: "Major surgery (abdominal, joint replacement, cardiac)",
    low: 1.5,
    target: 1.5,
    high: 1.7,
    source: "ESPEN clinical nutrition in surgery: about 1.5 g/kg per day.",
  },
  {
    id: "complicated",
    label: "Major surgery with an open wound, pressure injury or infection",
    low: 1.5,
    target: 1.75,
    high: 2.0,
    source: "ASPEN catabolic-patient range, overlapping the pressure-injury guideline.",
  },
];

export const MIN_WEIGHT_KG = 30;
export const MAX_WEIGHT_KG = 300;
export const MIN_HEIGHT_CM = 120;
export const MAX_HEIGHT_CM = 230;
export const MIN_AGE_YEARS = 16;
export const MAX_AGE_YEARS = 110;
export const MIN_MEALS = 3;
export const MAX_MEALS = 8;

const round = (value, dp = 0) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/** Devine ideal body weight in kg, floored at MIN_IBW_KG. */
export function idealBodyWeightKg(heightCm, sex) {
  const inches = heightCm / CM_PER_INCH;
  const base = DEVINE_BASE_KG[sex] ?? DEVINE_BASE_KG.female;
  return Math.max(MIN_IBW_KG, base + DEVINE_PER_INCH_KG * (inches - DEVINE_BASE_HEIGHT_INCHES));
}

/** Body mass index in kg/m². */
export function bodyMassIndex(weightKg, heightCm) {
  const metres = heightCm / 100;
  return weightKg / (metres * metres);
}

/**
 * @param {object} input
 * @param {number} input.weightKg           Usual weight before surgery, kg.
 * @param {number} input.heightCm           Height in centimetres.
 * @param {string} [input.sex]              "male" | "female".
 * @param {number} [input.ageYears]         Age in years.
 * @param {string} [input.surgeryType]      Id from SURGERY_TYPES.
 * @param {number} [input.meals]            Meals and supplements per day.
 * @param {number|null} [input.currentProteinG] Protein actually eaten today, g.
 * @returns {object} result, or { error } for invalid input.
 */
export function computePostSurgeryProtein({
  weightKg,
  heightCm,
  sex = "male",
  ageYears = 55,
  surgeryType = "major",
  meals = 5,
  currentProteinG = null,
} = {}) {
  const weight = Number(weightKg);
  if (!Number.isFinite(weight)) return { error: "Enter the patient's usual weight in kilograms." };
  if (weight < MIN_WEIGHT_KG || weight > MAX_WEIGHT_KG) {
    return { error: `Weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }

  const height = Number(heightCm);
  if (!Number.isFinite(height)) return { error: "Enter height in centimetres." };
  if (height < MIN_HEIGHT_CM || height > MAX_HEIGHT_CM) {
    return { error: `Height should be between ${MIN_HEIGHT_CM} cm and ${MAX_HEIGHT_CM} cm.` };
  }

  const age = Number(ageYears);
  if (!Number.isFinite(age) || age < MIN_AGE_YEARS || age > MAX_AGE_YEARS) {
    return { error: `Age should be between ${MIN_AGE_YEARS} and ${MAX_AGE_YEARS} years. This tool covers adults only.` };
  }

  const mealCount = Number(meals);
  if (!Number.isFinite(mealCount) || !Number.isInteger(mealCount) || mealCount < MIN_MEALS || mealCount > MAX_MEALS) {
    return { error: `Choose between ${MIN_MEALS} and ${MAX_MEALS} meals or supplements per day.` };
  }

  let eatenToday = null;
  if (currentProteinG !== null && currentProteinG !== "" && currentProteinG !== undefined) {
    const parsed = Number(currentProteinG);
    if (!Number.isFinite(parsed)) return { error: "Protein eaten today must be a number, or leave it blank." };
    if (parsed < 0 || parsed > 400) {
      return { error: "Protein eaten today should be between 0 g and 400 g, or left blank." };
    }
    eatenToday = parsed;
  }

  const type = SURGERY_TYPES.find((item) => item.id === surgeryType) ?? SURGERY_TYPES[2];
  const normalisedSex = sex === "female" ? "female" : "male";

  const bmi = bodyMassIndex(weight, height);
  const ibwKg = idealBodyWeightKg(height, normalisedSex);
  const usesAdjustedWeight = bmi >= ADJUSTED_WEIGHT_BMI_THRESHOLD && weight > ibwKg;
  const adjustedKg = ibwKg + ADJUSTED_WEIGHT_FACTOR * (weight - ibwKg);
  const referenceKg = usesAdjustedWeight ? adjustedKg : weight;

  const isOlderAdult = age >= OLDER_ADULT_AGE_YEARS;
  let targetGPerKg = type.target;
  if (isOlderAdult && targetGPerKg < OLDER_ADULT_FLOOR_G_PER_KG) {
    targetGPerKg = OLDER_ADULT_FLOOR_G_PER_KG;
  }
  targetGPerKg = Math.min(MAX_G_PER_KG, targetGPerKg);

  const proteinTarget = targetGPerKg * referenceKg;
  const proteinLow = type.low * referenceKg;
  const proteinHigh = type.high * referenceKg;

  const energyMin = ENERGY_KCAL_PER_KG_MIN * referenceKg;
  const energyMax = ENERGY_KCAL_PER_KG_MAX * referenceKg;
  const proteinKcal = proteinTarget * KCAL_PER_G_PROTEIN;

  const perMeal = proteinTarget / mealCount;
  const shortfall = eatenToday === null ? null : Math.max(0, proteinTarget - eatenToday);
  const percentOfTarget = eatenToday === null ? null : (eatenToday / proteinTarget) * 100;
  // Compare the ROUNDED shortfall (what the UI actually displays) so the note
  // text never contradicts the on-screen number, e.g. "0 g short" alongside
  // a "still short" message when the raw difference rounds down to zero.
  const shortfallRounded = shortfall === null ? null : round(shortfall);

  const notes = [];
  if (usesAdjustedWeight) {
    notes.push(
      `BMI is ${round(bmi, 1)}. ESPEN advises using ideal or adjusted body weight in obesity, so this uses ${round(referenceKg, 1)} kg rather than ${round(weight, 1)} kg.`,
    );
  }
  if (isOlderAdult && type.target < OLDER_ADULT_FLOOR_G_PER_KG) {
    notes.push(
      `Age ${round(age)} applies the ESPEN geriatric floor of ${OLDER_ADULT_FLOOR_G_PER_KG} g/kg for acutely ill older adults.`,
    );
  }
  if (shortfallRounded !== null && shortfallRounded > 0) {
    notes.push(
      `Currently ${shortfallRounded} g short of the estimate — about ${round(percentOfTarget)}% of the target so far today.`,
    );
  }
  if (shortfallRounded === 0) {
    notes.push("Today's intake already meets this estimate.");
  }
  notes.push(
    "Protein only works if total energy is also met. If calories fall short, the body burns the protein for fuel instead of using it to heal.",
  );

  return {
    weightKg: round(weight, 1),
    heightCm: round(height, 1),
    sex: normalisedSex,
    ageYears: round(age),
    bmi: round(bmi, 1),
    ibwKg: round(ibwKg, 1),
    adjustedKg: round(adjustedKg, 1),
    usesAdjustedWeight,
    referenceKg: round(referenceKg, 1),
    referenceLabel: usesAdjustedWeight ? "adjusted body weight" : "actual body weight",
    isOlderAdult,
    surgeryTypeId: type.id,
    surgeryLabel: type.label,
    surgerySource: type.source,
    gPerKg: round(targetGPerKg, 2),
    bandLow: type.low,
    bandHigh: type.high,
    proteinTarget: round(proteinTarget),
    proteinLow: round(proteinLow),
    proteinHigh: round(proteinHigh),
    proteinKcal: round(proteinKcal),
    energyMin: round(energyMin),
    energyMax: round(energyMax),
    meals: mealCount,
    perMeal: round(perMeal),
    currentProteinG: eatenToday === null ? null : round(eatenToday),
    shortfall: shortfallRounded,
    percentOfTarget: percentOfTarget === null ? null : round(percentOfTarget),
    notes,
  };
}
