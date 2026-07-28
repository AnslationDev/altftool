/**
 * Steps to Calories Converter.
 *
 * Method (all values from published, citable sources):
 *
 * 1. Steps -> distance
 *      step length (m) = height (m) x factor
 *    The widely used walking step-length estimate is 0.415 x standing height
 *    for men and 0.413 x standing height for women.
 *      distance (km) = steps x step length (m) / 1000
 *
 * 2. Distance + pace -> duration
 *      minutes = distance (km) / speed (km/h) x 60
 *
 * 3. Duration + MET -> energy, using the ACSM metabolic equation
 *      1 MET = 3.5 mL O2 / kg / min, and 1 L of O2 consumed releases ~5 kcal,
 *    which gives the standard form
 *      kcal/min = MET x 3.5 x body mass (kg) / 200
 *    Gross kcal = kcal/min x minutes  (includes resting metabolism)
 *    Net kcal   = (MET - 1) x 3.5 x kg / 200 x minutes  (activity only)
 *
 * MET values are the walking and running codes of the 2011 Compendium of
 * Physical Activities (Ainsworth et al., Med Sci Sports Exerc 43:1575-1581).
 */

/** 1 MET expressed as oxygen uptake, mL O2 per kg per minute (ACSM). */
export const MET_ML_O2_PER_KG_MIN = 3.5;

/** Energy released per litre of oxygen consumed, kcal (indirect calorimetry). */
export const KCAL_PER_LITRE_O2 = 5;

/** Step length as a fraction of standing height. */
export const STEP_LENGTH_FACTOR = { male: 0.415, female: 0.413 };

/** Unit conversions (exact definitions). */
export const KG_PER_LB = 0.45359237;
export const KM_PER_MILE = 1.609344;
export const CM_PER_INCH = 2.54;

/** Plausible input bounds so a typo produces a message rather than a number. */
export const MIN_HEIGHT_CM = 100;
export const MAX_HEIGHT_CM = 250;
export const MAX_STEPS = 200000;

/**
 * Walking / running paces with their Compendium of Physical Activities MET value.
 * Speeds are the Compendium's own mph figures converted to km/h.
 */
export const PACES = [
  { id: "slow", label: "Slow stroll — 2.0 mph (3.2 km/h)", mph: 2.0, met: 2.8, code: "17152" },
  { id: "easy", label: "Easy — 2.5 mph (4.0 km/h)", mph: 2.5, met: 3.0, code: "17170" },
  { id: "moderate", label: "Moderate — 3.0 mph (4.8 km/h)", mph: 3.0, met: 3.5, code: "17190" },
  { id: "brisk", label: "Brisk — 3.5 mph (5.6 km/h)", mph: 3.5, met: 4.3, code: "17200" },
  { id: "veryBrisk", label: "Very brisk — 4.0 mph (6.4 km/h)", mph: 4.0, met: 5.0, code: "17220" },
  { id: "fast", label: "Fast walk — 4.5 mph (7.2 km/h)", mph: 4.5, met: 7.0, code: "17231" },
  {
    id: "uphill",
    label: "Uphill 1–5% grade — 3.0–3.5 mph",
    mph: 3.25,
    met: 5.3,
    code: "17210",
  },
  { id: "jog", label: "Jogging — 5.0 mph (8.0 km/h)", mph: 5.0, met: 8.3, code: "12030" },
];

export const SEXES = [
  { id: "female", label: "Female (step length 0.413 × height)" },
  { id: "male", label: "Male (step length 0.415 × height)" },
];

export const WEIGHT_UNITS = [
  { id: "kg", label: "Kilograms (kg)" },
  { id: "lb", label: "Pounds (lb)" },
];

/**
 * Energy burnt per minute at a given MET and body mass.
 * kcal/min = MET x 3.5 x kg / 200
 */
export function kcalPerMinute(met, weightKg) {
  const m = Number(met);
  const kg = Number(weightKg);
  if (!Number.isFinite(m) || !Number.isFinite(kg) || m <= 0 || kg <= 0) return Number.NaN;
  return (m * MET_ML_O2_PER_KG_MIN * kg * KCAL_PER_LITRE_O2) / 1000;
}

/**
 * Convert a step count into distance, duration and calories.
 *
 * @param {object} input
 * @param {number} input.steps          Steps walked.
 * @param {number} input.weight         Body mass in the chosen unit.
 * @param {string} [input.weightUnit]   "kg" or "lb".
 * @param {number} input.heightCm       Standing height in centimetres.
 * @param {string} [input.sex]          "female" or "male" (step-length factor only).
 * @param {string} [input.paceId]       PACES[].id.
 * @returns {object} result or { error }.
 */
export function stepsToCalories({
  steps,
  weight,
  weightUnit = "kg",
  heightCm,
  sex = "female",
  paceId = "moderate",
}) {
  const stepCount = Number(steps);
  if (!Number.isFinite(stepCount) || stepCount <= 0) {
    return { error: "Enter a step count greater than zero." };
  }
  if (stepCount > MAX_STEPS) {
    return { error: `${MAX_STEPS.toLocaleString("en-US")} steps is roughly 140 km — check the figure.` };
  }

  const rawWeight = Number(weight);
  if (!Number.isFinite(rawWeight) || rawWeight <= 0) {
    return { error: "Enter your body weight — it must be greater than zero." };
  }
  const weightKg = weightUnit === "lb" ? rawWeight * KG_PER_LB : rawWeight;
  if (weightKg > 400) {
    return { error: "That body weight is outside the range this estimate is valid for." };
  }

  const height = Number(heightCm);
  if (!Number.isFinite(height) || height < MIN_HEIGHT_CM || height > MAX_HEIGHT_CM) {
    return { error: `Enter a height between ${MIN_HEIGHT_CM} cm and ${MAX_HEIGHT_CM} cm.` };
  }

  const pace = PACES.find((p) => p.id === paceId);
  if (!pace) return { error: "Choose a walking pace." };

  const factor = STEP_LENGTH_FACTOR[sex] ?? STEP_LENGTH_FACTOR.female;
  const stepLengthM = (height / 100) * factor;
  const distanceKm = (stepCount * stepLengthM) / 1000;
  const distanceMiles = distanceKm / KM_PER_MILE;

  const speedKmh = pace.mph * KM_PER_MILE;
  const minutes = (distanceKm / speedKmh) * 60;

  const grossPerMin = kcalPerMinute(pace.met, weightKg);
  const netPerMin = kcalPerMinute(pace.met - 1, weightKg);
  if (!Number.isFinite(grossPerMin) || !Number.isFinite(netPerMin)) {
    return { error: "Those numbers do not produce a valid estimate — check the inputs." };
  }

  const grossCalories = grossPerMin * minutes;
  const netCalories = netPerMin * minutes;

  return {
    steps: stepCount,
    pace,
    weightKg,
    heightCm: height,
    stepLengthM,
    stepLengthCm: stepLengthM * 100,
    distanceKm,
    distanceMiles,
    speedKmh,
    minutes,
    grossCalories,
    netCalories,
    grossPerMin,
    caloriesPer1000Steps: (grossCalories / stepCount) * 1000,
    stepsPer100Calories: (stepCount / grossCalories) * 100,
  };
}
