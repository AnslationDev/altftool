/**
 * Asian / Asia-Pacific BMI cutoffs.
 *
 * BMI = weight (kg) / height (m)^2  — Quetelet index, unchanged for every population.
 * What changes for South and East Asian populations is where the risk lines sit.
 *
 * Sources for the thresholds used here:
 *  - WHO Expert Consultation, "Appropriate body-mass index for Asian populations
 *    and its implications for policy and intervention strategies", Lancet 2004;363:157-63.
 *    Public-health action points at BMI 23, 27.5 (and 32.5, 37.5).
 *  - WHO/IASO/IOTF, "The Asia-Pacific Perspective: Redefining Obesity and its
 *    Treatment" (2000): underweight <18.5, normal 18.5-22.9, overweight >=23,
 *    obese >=25.
 *  - WHO Technical Report Series 894 (2000) for the standard international bands.
 *  - IDF (2006) / South Asian waist thresholds: men >=90 cm, women >=80 cm.
 *  - Consensus Statement for Diagnosis of Obesity, Abdominal Obesity and the
 *    Metabolic Syndrome for Asian Indians (JAPI 2009): overweight 23-24.9,
 *    obesity >=25, waist men >=90 cm, women >=80 cm.
 */

/** BMI is only meaningful for adults; children need age-and-sex percentile charts. */
export const MIN_ADULT_AGE = 18;

/** Sanity limits so a typo cannot produce a plausible-looking BMI. */
export const LIMITS = {
  heightCm: { min: 100, max: 250 },
  weightKg: { min: 20, max: 400 },
  waistCm: { min: 40, max: 200 },
};

/**
 * Coarse risk ladder shared by both schemes, so the two can be compared even
 * though they slice obesity into a different number of classes.
 */
export const RISK_LEVEL = { underweight: 0, normal: 1, overweight: 2, obese: 3 };

/** WHO Asia-Pacific (2000) bands, in BMI kg/m^2. `max` is exclusive. */
export const ASIA_PACIFIC_BANDS = [
  { key: "underweight", label: "Underweight", min: 0, max: 18.5, tone: "warn", level: RISK_LEVEL.underweight },
  { key: "normal", label: "Healthy weight", min: 18.5, max: 23, tone: "good", level: RISK_LEVEL.normal },
  { key: "overweight", label: "Overweight (at risk)", min: 23, max: 25, tone: "warn", level: RISK_LEVEL.overweight },
  { key: "obese1", label: "Obese I", min: 25, max: 30, tone: "bad", level: RISK_LEVEL.obese },
  { key: "obese2", label: "Obese II", min: 30, max: Infinity, tone: "bad", level: RISK_LEVEL.obese },
];

/** Standard WHO international bands (TRS 894), for the side-by-side comparison. */
export const WHO_STANDARD_BANDS = [
  { key: "underweight", label: "Underweight", min: 0, max: 18.5, tone: "warn", level: RISK_LEVEL.underweight },
  { key: "normal", label: "Healthy weight", min: 18.5, max: 25, tone: "good", level: RISK_LEVEL.normal },
  { key: "overweight", label: "Overweight", min: 25, max: 30, tone: "warn", level: RISK_LEVEL.overweight },
  { key: "obese1", label: "Obesity class I", min: 30, max: 35, tone: "bad", level: RISK_LEVEL.obese },
  { key: "obese2", label: "Obesity class II", min: 35, max: 40, tone: "bad", level: RISK_LEVEL.obese },
  { key: "obese3", label: "Obesity class III", min: 40, max: Infinity, tone: "bad", level: RISK_LEVEL.obese },
];

/** WHO 2004 Lancet public-health action points for Asian populations. */
export const WHO_ACTION_POINTS = [23, 27.5, 32.5, 37.5];

/** IDF / JAPI 2009 abdominal-obesity waist thresholds for South Asians, cm. */
export const ASIAN_WAIST_CM = { male: 90, female: 80 };

/** Upper end of the Asia-Pacific healthy band — used for the target-weight figure. */
export const ASIA_PACIFIC_HEALTHY = { min: 18.5, max: 22.9 };

const round = (value, dp = 1) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

function classify(bmi, bands) {
  return bands.find((band) => bmi >= band.min && bmi < band.max) ?? bands[bands.length - 1];
}

/**
 * @param {object} input
 * @param {number} input.heightCm  Standing height in centimetres.
 * @param {number} input.weightKg  Body weight in kilograms.
 * @param {number} [input.age]     Age in years (adults only).
 * @param {"male"|"female"} [input.sex] Used only for the waist threshold.
 * @param {number} [input.waistCm] Optional waist circumference in centimetres.
 * @returns {object} classification, or { error } for unusable input.
 */
export function asianBmi({ heightCm, weightKg, age, sex = "male", waistCm }) {
  const required = [heightCm, weightKg];
  if (required.some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter a valid height and weight." };
  }
  if (heightCm < LIMITS.heightCm.min || heightCm > LIMITS.heightCm.max) {
    return {
      error: `Height must be between ${LIMITS.heightCm.min} cm and ${LIMITS.heightCm.max} cm.`,
    };
  }
  if (weightKg < LIMITS.weightKg.min || weightKg > LIMITS.weightKg.max) {
    return {
      error: `Weight must be between ${LIMITS.weightKg.min} kg and ${LIMITS.weightKg.max} kg.`,
    };
  }
  if (age !== undefined && age !== null && Number.isFinite(age) && age < MIN_ADULT_AGE) {
    return {
      error: `These cutoffs apply to adults aged ${MIN_ADULT_AGE} and over. Children and teenagers need age-and-sex BMI percentile charts instead.`,
    };
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  if (!Number.isFinite(bmi) || bmi <= 0) {
    return { error: "That height and weight do not produce a usable BMI." };
  }

  // Classify the value that is actually displayed, so the band can never
  // contradict the number shown next to it (e.g. a BMI printed as 23.0).
  const shownBmi = round(bmi, 1);
  const asian = classify(shownBmi, ASIA_PACIFIC_BANDS);
  const standard = classify(shownBmi, WHO_STANDARD_BANDS);

  // Weight range that would put this height inside the Asia-Pacific healthy band.
  const healthyMinKg = ASIA_PACIFIC_HEALTHY.min * heightM * heightM;
  const healthyMaxKg = ASIA_PACIFIC_HEALTHY.max * heightM * heightM;
  const excessKg = weightKg > healthyMaxKg ? weightKg - healthyMaxKg : 0;
  const deficitKg = weightKg < healthyMinKg ? healthyMinKg - weightKg : 0;

  const nextActionPoint = WHO_ACTION_POINTS.find((point) => bmi < point) ?? null;
  const kgToNextPoint =
    nextActionPoint === null ? null : nextActionPoint * heightM * heightM - weightKg;

  let waist = null;
  if (typeof waistCm === "number" && Number.isFinite(waistCm) && waistCm > 0) {
    if (waistCm < LIMITS.waistCm.min || waistCm > LIMITS.waistCm.max) {
      return {
        error: `Waist must be between ${LIMITS.waistCm.min} cm and ${LIMITS.waistCm.max} cm, or left blank.`,
      };
    }
    const threshold = ASIAN_WAIST_CM[sex] ?? ASIAN_WAIST_CM.male;
    waist = {
      value: round(waistCm),
      threshold,
      abdominalObesity: waistCm >= threshold,
      overBy: round(Math.max(0, waistCm - threshold)),
      waistToHeight: round(waistCm / heightCm, 2),
    };
  }

  return {
    bmi: round(bmi, 1),
    bmiExact: bmi,
    asianBand: asian,
    standardBand: standard,
    reclassified: asian.level > standard.level,
    healthyMinKg: round(healthyMinKg, 1),
    healthyMaxKg: round(healthyMaxKg, 1),
    excessKg: round(excessKg, 1),
    deficitKg: round(deficitKg, 1),
    nextActionPoint,
    kgToNextPoint: kgToNextPoint === null ? null : round(kgToNextPoint, 1),
    waist,
    heightM: round(heightM, 3),
  };
}

/** Convert feet + inches to centimetres. 1 inch = 2.54 cm exactly. */
export function feetInchesToCm(feet, inches) {
  const ft = Number.isFinite(feet) ? feet : 0;
  const inch = Number.isFinite(inches) ? inches : 0;
  return (ft * 12 + inch) * 2.54;
}

/** Convert pounds to kilograms. 1 lb = 0.45359237 kg exactly. */
export function poundsToKg(pounds) {
  return Number.isFinite(pounds) ? pounds * 0.45359237 : 0;
}
