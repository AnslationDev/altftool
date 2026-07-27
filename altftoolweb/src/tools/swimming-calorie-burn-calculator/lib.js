/**
 * Swimming energy expenditure from published MET values.
 *
 * Source of the MET values: Ainsworth BE et al., "2011 Compendium of Physical
 * Activities: a second update of codes and MET values" (Med Sci Sports Exerc),
 * water activity category 18. A MET is a multiple of resting metabolic rate,
 * defined as 3.5 mL of oxygen per kilogram of body mass per minute.
 *
 * Energy conversion (ACSM): 1 litre of oxygen consumed ~= 5 kcal, so
 *
 *   kcal/min = MET x 3.5 mL/kg/min x kg / 1000 x 5 = MET x 3.5 x kg / 200
 *
 * That figure is GROSS energy expenditure. Subtracting the 1 MET you would have
 * spent resting over the same period gives NET (exercise-only) calories, which is
 * the number to use when comparing a swim against food eaten.
 */

/** Resting oxygen uptake, mL of O2 per kg of body mass per minute (1 MET). */
export const ML_O2_PER_MET = 3.5;
/** ACSM caloric equivalent of oxygen: kcal per litre of O2 at a mixed RER. */
export const KCAL_PER_LITRE_O2 = 5;
/** 1 pound = 0.45359237 kg exactly (1959 international yard and pound agreement). */
export const KG_PER_LB = 0.45359237;
/** Energy density of adipose tissue commonly used in weight-loss maths, kcal per kg. */
export const KCAL_PER_KG_FAT = 7700;

export const WEIGHT_MIN_KG = 20;
export const WEIGHT_MAX_KG = 300;
export const MINUTES_MIN = 1;
export const MINUTES_MAX = 600;
export const LAPS_MAX = 400;
export const POOL_LENGTH_MIN_M = 5;
export const POOL_LENGTH_MAX_M = 100;

/**
 * Stroke / effort options with their 2011 Compendium MET values.
 * `code` is the Compendium activity code the value is taken from.
 */
export const SWIM_STROKES = [
  { id: "leisure", label: "Leisure swimming, not lap swimming", met: 6.0, code: "18310" },
  { id: "freestyle-slow", label: "Freestyle (front crawl), slow to moderate effort", met: 5.8, code: "18230" },
  { id: "freestyle-fast", label: "Freestyle (front crawl), fast, vigorous effort", met: 9.8, code: "18240" },
  { id: "backstroke-rec", label: "Backstroke, recreational", met: 4.8, code: "18229" },
  { id: "backstroke-training", label: "Backstroke, training or competition", met: 9.5, code: "18220" },
  { id: "breaststroke-rec", label: "Breaststroke, recreational", met: 5.3, code: "18209" },
  { id: "breaststroke-training", label: "Breaststroke, training or competition", met: 10.3, code: "18200" },
  { id: "butterfly", label: "Butterfly, general", met: 13.8, code: "18240" },
  { id: "sidestroke", label: "Sidestroke, general", met: 7.0, code: "18250" },
  { id: "treading-moderate", label: "Treading water, moderate effort", met: 3.5, code: "18300" },
  { id: "treading-vigorous", label: "Treading water, fast, vigorous effort", met: 9.8, code: "18290" },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Look up a stroke option by id. Returns null when the id is unknown. */
export function findStroke(id) {
  return SWIM_STROKES.find((stroke) => stroke.id === id) || null;
}

/** Convert a body weight given in kg or lb to kilograms. */
export function toKilograms(weight, unit) {
  if (!isNum(weight)) return null;
  return unit === "lb" ? weight * KG_PER_LB : weight;
}

/**
 * Gross kcal burned per minute at a given MET and body mass.
 * Returns null for unusable input rather than NaN.
 */
export function kcalPerMinute(met, weightKg) {
  if (!isNum(met) || !isNum(weightKg)) return null;
  if (met <= 0 || weightKg <= 0) return null;
  return (met * ML_O2_PER_MET * weightKg * KCAL_PER_LITRE_O2) / 1000;
}

/**
 * Full swim-session estimate.
 *
 * @param {object} input
 * @param {number} input.weight            Body weight.
 * @param {"kg"|"lb"} [input.weightUnit]   Unit of the weight above. Default "kg".
 * @param {string} input.strokeId          Id from SWIM_STROKES.
 * @param {number} input.minutes           Time actually spent swimming.
 * @param {number} [input.laps]            Lengths of the pool completed (optional).
 * @param {number} [input.poolLength]      Pool length in metres (optional).
 * @returns {object} Energy and pace figures, or { error } for invalid input.
 */
export function computeSwimCalories({
  weight,
  weightUnit = "kg",
  strokeId,
  minutes,
  laps = 0,
  poolLength = 25,
}) {
  const stroke = findStroke(strokeId);
  if (!stroke) return { error: "Choose a swimming stroke." };

  if (!isNum(weight) || weight <= 0) return { error: "Enter your body weight as a positive number." };
  const weightKg = toKilograms(weight, weightUnit);
  if (weightKg < WEIGHT_MIN_KG || weightKg > WEIGHT_MAX_KG) {
    return { error: `Body weight should be between ${WEIGHT_MIN_KG} kg and ${WEIGHT_MAX_KG} kg.` };
  }

  if (!isNum(minutes) || minutes < MINUTES_MIN) {
    return { error: "Enter how many minutes you swam (at least 1)." };
  }
  if (minutes > MINUTES_MAX) {
    return { error: `Session length should be ${MINUTES_MAX} minutes or less.` };
  }

  const hasLaps = isNum(laps) && laps > 0;
  if (isNum(laps) && laps < 0) return { error: "Lengths swum cannot be negative." };
  if (hasLaps) {
    if (!isNum(poolLength) || poolLength < POOL_LENGTH_MIN_M || poolLength > POOL_LENGTH_MAX_M) {
      return { error: `Pool length should be between ${POOL_LENGTH_MIN_M} m and ${POOL_LENGTH_MAX_M} m.` };
    }
    if (laps > LAPS_MAX) return { error: `Enter ${LAPS_MAX} lengths or fewer.` };
  }

  const grossPerMinute = kcalPerMinute(stroke.met, weightKg);
  if (grossPerMinute === null) return { error: "Could not calculate with those values." };
  const netPerMinute = Math.max(0, kcalPerMinute(stroke.met - 1, weightKg) ?? 0);

  const grossKcal = grossPerMinute * minutes;
  const netKcal = netPerMinute * minutes;

  const distanceM = hasLaps ? laps * poolLength : null;
  const pacePer100mMin = distanceM && distanceM > 0 ? (minutes * 100) / distanceM : null;
  const kcalPer100m = distanceM && distanceM > 0 ? (grossKcal * 100) / distanceM : null;
  const kcalPerLap = hasLaps ? grossKcal / laps : null;

  return {
    met: stroke.met,
    strokeLabel: stroke.label,
    weightKg,
    minutes,
    kcalPerMinute: grossPerMinute,
    netKcalPerMinute: netPerMinute,
    grossKcal,
    netKcal,
    kcalPerHour: grossPerMinute * 60,
    distanceM,
    pacePer100mMin,
    kcalPer100m,
    kcalPerLap,
    fatGrams: (netKcal / KCAL_PER_KG_FAT) * 1000,
  };
}
