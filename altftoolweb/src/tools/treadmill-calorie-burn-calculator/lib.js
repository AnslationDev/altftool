/**
 * Treadmill energy cost from the ACSM metabolic equations.
 *
 * Source: ACSM's Guidelines for Exercise Testing and Prescription — the walking and
 * running equations for gross oxygen uptake on a motorised treadmill.
 *
 *   Walking: VO2 (mL/kg/min) = 0.1 x S + 1.8 x S x G + 3.5
 *   Running: VO2 (mL/kg/min) = 0.2 x S + 0.9 x S x G + 3.5
 *
 * where S is speed in metres per minute and G is the fractional grade (10% -> 0.10).
 * The trailing 3.5 is resting oxygen uptake, so both equations return GROSS uptake.
 *
 * Energy is then 1 litre of oxygen consumed ~= 5 kcal (the ACSM conversion at a
 * mixed-substrate respiratory exchange ratio).
 */

/** One metabolic equivalent, in mL of oxygen per kg of body mass per minute. */
export const ML_O2_PER_MET = 3.5;
/** ACSM caloric equivalent of oxygen, kcal per litre of O2. */
export const KCAL_PER_LITRE_O2 = 5;
/** 1 km/h expressed in metres per minute (1000 m / 60 min). */
export const M_PER_MIN_PER_KMH = 1000 / 60;
/** 1 mile = 1.609344 km exactly (1959 international agreement). */
export const KM_PER_MILE = 1.609344;
/** 1 pound = 0.45359237 kg exactly (1959 international agreement). */
export const KG_PER_LB = 0.45359237;

/** ACSM validity windows, in metres per minute. */
export const WALK_VALID_MIN_M_MIN = 50; // ~1.9 mph
export const WALK_VALID_MAX_M_MIN = 100; // ~3.7 mph
export const RUN_VALID_MIN_M_MIN = 134; // ~5.0 mph
/** Above this speed the running equation is the better fit for most people. */
export const AUTO_RUN_THRESHOLD_M_MIN = 107; // ~4.0 mph / 6.4 km/h

export const WEIGHT_MIN_KG = 20;
export const WEIGHT_MAX_KG = 300;
export const SPEED_MAX_KMH = 30;
export const INCLINE_MAX_PERCENT = 40;
export const DURATION_MAX_MIN = 600;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Convert a body weight in kg or lb to kilograms. */
export function toKilograms(weight, unit) {
  if (!isNum(weight)) return null;
  return unit === "lb" ? weight * KG_PER_LB : weight;
}

/**
 * Gross oxygen uptake for treadmill walking or running.
 *
 * @param {number} speedMPerMin Speed in metres per minute.
 * @param {number} grade        Fractional grade, e.g. 0.10 for 10%.
 * @param {"walk"|"run"} gait
 * @returns {number|null} mL/kg/min, or null for unusable input.
 */
export function treadmillVo2(speedMPerMin, grade, gait) {
  if (!isNum(speedMPerMin) || !isNum(grade)) return null;
  if (speedMPerMin <= 0) return null;
  if (gait === "run") {
    return 0.2 * speedMPerMin + 0.9 * speedMPerMin * grade + ML_O2_PER_MET;
  }
  return 0.1 * speedMPerMin + 1.8 * speedMPerMin * grade + ML_O2_PER_MET;
}

/**
 * Full treadmill session estimate.
 *
 * @param {object} input
 * @param {number} input.weight            Body weight.
 * @param {"kg"|"lb"} [input.weightUnit]   Unit of the weight above.
 * @param {number} input.speed             Treadmill speed.
 * @param {"kmh"|"mph"} [input.speedUnit]  Unit of the speed above.
 * @param {number} input.inclinePercent    Treadmill grade in percent.
 * @param {number} input.minutes           Session length in minutes.
 * @param {"auto"|"walk"|"run"} [input.gait]
 * @returns {object} energy figures, or { error }.
 */
export function computeTreadmillCalories({
  weight,
  weightUnit = "kg",
  speed,
  speedUnit = "kmh",
  inclinePercent,
  minutes,
  gait = "auto",
}) {
  const weightKg = toKilograms(weight, weightUnit);
  if (weightKg === null) return { error: "Enter your body weight." };
  if (weightKg < WEIGHT_MIN_KG || weightKg > WEIGHT_MAX_KG) {
    return { error: `Body weight should be between ${WEIGHT_MIN_KG} and ${WEIGHT_MAX_KG} kg.` };
  }

  if (!isNum(speed)) return { error: "Enter the treadmill speed." };
  const speedKmh = speedUnit === "mph" ? speed * KM_PER_MILE : speed;
  if (speedKmh <= 0) return { error: "Treadmill speed must be greater than zero." };
  if (speedKmh > SPEED_MAX_KMH) {
    return { error: `A treadmill speed above ${SPEED_MAX_KMH} km/h is outside this calculator's range.` };
  }

  if (!isNum(inclinePercent)) return { error: "Enter the incline as a percentage." };
  if (inclinePercent < 0 || inclinePercent > INCLINE_MAX_PERCENT) {
    return { error: `Incline should be between 0% and ${INCLINE_MAX_PERCENT}%.` };
  }

  if (!isNum(minutes)) return { error: "Enter how long you were on the treadmill." };
  if (minutes <= 0) return { error: "Duration must be greater than zero minutes." };
  if (minutes > DURATION_MAX_MIN) {
    return { error: `Sessions longer than ${DURATION_MAX_MIN} minutes are outside this calculator's range.` };
  }

  const speedMPerMin = speedKmh * M_PER_MIN_PER_KMH;
  const grade = inclinePercent / 100;
  const gaitUsed = gait === "auto" ? (speedMPerMin >= AUTO_RUN_THRESHOLD_M_MIN ? "run" : "walk") : gait;

  const vo2 = treadmillVo2(speedMPerMin, grade, gaitUsed);
  if (vo2 === null || vo2 <= 0) {
    return { error: "That speed and incline combination cannot be evaluated." };
  }

  const litresPerMin = (vo2 * weightKg) / 1000;
  const kcalPerMin = litresPerMin * KCAL_PER_LITRE_O2;
  const grossKcal = kcalPerMin * minutes;

  const restingKcalPerMin = ((ML_O2_PER_MET * weightKg) / 1000) * KCAL_PER_LITRE_O2;
  const restingKcal = restingKcalPerMin * minutes;
  const netKcal = Math.max(0, grossKcal - restingKcal);

  const distanceKm = speedKmh * (minutes / 60);

  const warnings = [];
  if (gaitUsed === "walk" && speedMPerMin > WALK_VALID_MAX_M_MIN) {
    warnings.push(
      "The ACSM walking equation is validated up to about 100 m/min (3.7 mph / 6.0 km/h). Above that it overestimates the cost of walking — switch to running if you are jogging.",
    );
  }
  if (gaitUsed === "walk" && speedMPerMin < WALK_VALID_MIN_M_MIN) {
    warnings.push(
      "Below about 50 m/min (1.9 mph / 3.0 km/h) the walking equation is outside its validated range and the estimate becomes rough.",
    );
  }
  if (gaitUsed === "run" && speedMPerMin < RUN_VALID_MIN_M_MIN) {
    warnings.push(
      "The running equation is validated above about 134 m/min (5.0 mph / 8.0 km/h). It still applies to a genuine jog below that, but the estimate is less precise.",
    );
  }

  return {
    weightKg,
    speedKmh,
    speedMph: speedKmh / KM_PER_MILE,
    speedMPerMin,
    inclinePercent,
    minutes,
    gaitUsed,
    vo2,
    mets: vo2 / ML_O2_PER_MET,
    kcalPerMin,
    grossKcal,
    netKcal,
    restingKcal,
    distanceKm,
    distanceMiles: distanceKm / KM_PER_MILE,
    kcalPerKm: distanceKm > 0 ? grossKcal / distanceKm : null,
    warnings,
  };
}
