/**
 * Ponderal index (Rohrer's index / corpulence index).
 *
 * Adults:  PI = weight (kg) / height (m)^3          -> kg/m^3
 * Newborn: PI = 100 x weight (g) / length (cm)^3    -> g/cm^3 x 100
 *
 * BMI divides by height squared, but body mass scales closer to height cubed,
 * so BMI drifts upward for tall people and downward for short people. The
 * ponderal index removes that drift, which is why neonatology uses it to spot
 * babies who are thin for their length.
 *
 * Sources and caveats:
 *  - Rohrer F (1921) proposed the index; Sheldon later called it the corpulence
 *    index. There is no WHO classification for adult ponderal index, so the
 *    adult band used here (about 11 to 15 kg/m^3) is a descriptive reference
 *    range reported in the anthropometry literature, not a diagnostic cutoff.
 *  - Newborn bands follow Miller HC & Hassanein K, "Diagnosis of impaired fetal
 *    growth in newborn infants", Pediatrics 1971;48:511-22, and the standard
 *    neonatal convention: PI below 2.2 marks asymmetric (thin-for-length)
 *    growth restriction, 2.2 to 3.0 is appropriate, above 3.0 is heavy for
 *    length.
 *  - WHO Technical Report Series 894 (2000) supplies the BMI bands shown for
 *    comparison.
 */

export const LIMITS = {
  heightCm: { min: 100, max: 250 },
  weightKg: { min: 20, max: 400 },
  lengthCm: { min: 25, max: 65 },
  birthWeightG: { min: 300, max: 7000 },
};

/** Descriptive adult ponderal-index bands, kg/m^3. `max` is exclusive. */
export const ADULT_BANDS = [
  { key: "low", label: "Below the usual adult range", min: 0, max: 11, tone: "warn" },
  { key: "lean", label: "Usual range — leaner half", min: 11, max: 13, tone: "good" },
  { key: "solid", label: "Usual range — heavier half", min: 13, max: 15, tone: "good" },
  { key: "high", label: "Above the usual adult range", min: 15, max: Infinity, tone: "warn" },
];

/** Newborn ponderal-index bands, 100 x g/cm^3. */
export const NEWBORN_BANDS = [
  {
    key: "thin",
    label: "Thin for length — asymmetric growth restriction",
    min: 0,
    max: 2.2,
    tone: "bad",
  },
  { key: "appropriate", label: "Appropriate for length", min: 2.2, max: 3.0, tone: "good" },
  { key: "heavy", label: "Heavy for length", min: 3.0, max: Infinity, tone: "warn" },
];

/** Reference range used to convert an adult PI back into a weight range. */
export const ADULT_USUAL_PI = { min: 11, max: 15 };

/** WHO healthy BMI range, used only for the comparison figures. */
export const HEALTHY_BMI = { min: 18.5, max: 24.9 };

/** Height the "if you were average height" figure normalises to, in metres. */
export const REFERENCE_HEIGHT_M = 1.7;

const round = (value, dp) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

const floorTo = (value, dp) => {
  const factor = 10 ** dp;
  return Math.floor(value * factor) / factor;
};

const ceilTo = (value, dp) => {
  const factor = 10 ** dp;
  return Math.ceil(value * factor) / factor;
};

// classify() is fed a pi value already rounded to 2dp, so a raw pi within
// 0.005 of a band threshold crosses it once rounded. Any "usual range"
// weight window shown alongside the band label has to be widened by this
// same tolerance (and rounded outward, not to nearest) so it can never
// exclude a weight whose rounded pi was just classified as inside it.
const PI_ROUND_TOLERANCE = 0.005;

const classify = (value, bands) =>
  bands.find((band) => value >= band.min && value < band.max) ?? bands[bands.length - 1];

/**
 * Adult ponderal index.
 * @param {object} input
 * @param {number} input.heightCm Height in centimetres.
 * @param {number} input.weightKg Weight in kilograms.
 * @returns {object} index, bands and BMI comparison, or { error }.
 */
export function adultPonderalIndex({ heightCm, weightKg }) {
  if ([heightCm, weightKg].some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter a valid height and weight." };
  }
  if (heightCm < LIMITS.heightCm.min || heightCm > LIMITS.heightCm.max) {
    return { error: `Height must be between ${LIMITS.heightCm.min} cm and ${LIMITS.heightCm.max} cm.` };
  }
  if (weightKg < LIMITS.weightKg.min || weightKg > LIMITS.weightKg.max) {
    return { error: `Weight must be between ${LIMITS.weightKg.min} kg and ${LIMITS.weightKg.max} kg.` };
  }

  const heightM = heightCm / 100;
  const cube = heightM ** 3;
  const square = heightM ** 2;
  if (!(cube > 0)) return { error: "That height does not produce a usable ponderal index." };

  const pi = weightKg / cube;
  const bmi = weightKg / square;
  // Classify the value that is actually shown, so the band never contradicts it.
  const band = classify(round(pi, 2), ADULT_BANDS);

  // Same build, average height: keeps PI constant and solves for weight at 1.70 m.
  const weightAtReferenceHeight = pi * REFERENCE_HEIGHT_M ** 3;

  return {
    pi: round(pi, 2),
    piExact: pi,
    bmi: round(bmi, 1),
    band,
    heightM: round(heightM, 3),
    piWeightMin: floorTo((ADULT_USUAL_PI.min - PI_ROUND_TOLERANCE) * cube, 1),
    piWeightMax: ceilTo((ADULT_USUAL_PI.max - PI_ROUND_TOLERANCE) * cube, 1),
    bmiWeightMin: round(HEALTHY_BMI.min * square, 1),
    bmiWeightMax: round(HEALTHY_BMI.max * square, 1),
    weightAtReferenceHeight: round(weightAtReferenceHeight, 1),
    /** Positive when BMI's healthy ceiling is stricter than the PI range allows. */
    ceilingGapKg: round(ADULT_USUAL_PI.max * cube - HEALTHY_BMI.max * square, 1),
  };
}

/**
 * Newborn ponderal index.
 * @param {object} input
 * @param {number} input.birthWeightG Birth weight in grams.
 * @param {number} input.lengthCm     Crown-heel length in centimetres.
 * @returns {object} index and band, or { error }.
 */
export function newbornPonderalIndex({ birthWeightG, lengthCm }) {
  if ([birthWeightG, lengthCm].some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter a valid birth weight and length." };
  }
  if (birthWeightG < LIMITS.birthWeightG.min || birthWeightG > LIMITS.birthWeightG.max) {
    return {
      error: `Birth weight must be between ${LIMITS.birthWeightG.min} g and ${LIMITS.birthWeightG.max} g.`,
    };
  }
  if (lengthCm < LIMITS.lengthCm.min || lengthCm > LIMITS.lengthCm.max) {
    return { error: `Length must be between ${LIMITS.lengthCm.min} cm and ${LIMITS.lengthCm.max} cm.` };
  }

  const cube = lengthCm ** 3;
  if (!(cube > 0)) return { error: "That length does not produce a usable ponderal index." };

  const pi = (100 * birthWeightG) / cube;
  const band = classify(round(pi, 2), NEWBORN_BANDS);

  return {
    pi: round(pi, 2),
    piExact: pi,
    band,
    weightMinG: Math.floor(((NEWBORN_BANDS[1].min - PI_ROUND_TOLERANCE) * cube) / 100),
    weightMaxG: Math.ceil(((NEWBORN_BANDS[1].max - PI_ROUND_TOLERANCE) * cube) / 100),
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
