/**
 * Elliptical / cross-trainer energy cost.
 *
 * There is no ACSM metabolic equation for the elliptical the way there is for the
 * treadmill and the cycle ergometer, because the stride path and arm involvement
 * differ between machines. This module therefore uses two routes that ARE grounded
 * in published work, and refuses to invent a third.
 *
 * 1. HEART RATE (default, most accurate for a cross-trainer)
 *    Keytel LR, Goedecke JH, Noakes TD, Hiiloskorpi H, Laukkanen R, van der Merwe L,
 *    Lambert EV. "Prediction of energy expenditure from heart rate monitoring during
 *    submaximal exercise." Journal of Sports Sciences 2005;23(3):289-297.
 *
 *      Men:   EE (kJ/min) = -55.0969 + 0.6309 x HR + 0.1988 x W + 0.2017 x A
 *      Women: EE (kJ/min) = -20.4022 + 0.4472 x HR - 0.1263 x W + 0.0740 x A
 *
 *    with HR in bpm, W in kg and A in years. Divide by 4.184 for kcal/min.
 *    Heart rate already reflects resistance, ramp and arm use, which is exactly why
 *    it is the right input for a machine with no standard work-rate scale.
 *
 * 2. CONSOLE WATTS
 *    Where the console reports external power, oxygen uptake is taken from the ACSM
 *    leg-work relationship of 10.8 mL O2 per watt per minute plus a 7 mL/kg/min
 *    baseline (3.5 resting + 3.5 unloaded movement), then priced at 5 kcal per litre.
 *
 * Resistance level and ramp angle are recorded as session context. They are NOT
 * applied as calorie multipliers: manufacturers do not calibrate those dials to any
 * common scale, and their effect already shows up in heart rate or in watts.
 */

/** 1 kcal = 4.184 kJ (thermochemical calorie). */
export const KJ_PER_KCAL = 4.184;
/** One metabolic equivalent, mL O2 per kg per minute. */
export const ML_O2_PER_MET = 3.5;
/** ACSM caloric equivalent of oxygen, kcal per litre. */
export const KCAL_PER_LITRE_O2 = 5;
/** ACSM leg-work constant: mL O2 per minute per watt of external work. */
export const ML_O2_PER_WATT_MIN = 10.8;
/** Resting plus unloaded movement, mL/kg/min. */
export const MOVEMENT_BASELINE_ML_KG_MIN = 7;
/** 1 pound = 0.45359237 kg exactly. */
export const KG_PER_LB = 0.45359237;

/** Keytel et al. 2005 regression coefficients, output in kJ per minute. */
export const KEYTEL_COEFFICIENTS = {
  male: { intercept: -55.0969, hr: 0.6309, weight: 0.1988, age: 0.2017 },
  female: { intercept: -20.4022, hr: 0.4472, weight: -0.1263, age: 0.074 },
};

/** Range over which the Keytel equation was fitted and is safe to apply. */
export const KEYTEL_HR_MIN = 90;
export const KEYTEL_HR_MAX = 200;

export const HR_INPUT_MIN = 60;
export const HR_INPUT_MAX = 220;
export const AGE_MIN = 15;
export const AGE_MAX = 90;
export const WEIGHT_MIN_KG = 20;
export const WEIGHT_MAX_KG = 300;
export const POWER_MAX_W = 800;
export const DURATION_MAX_MIN = 600;
export const RAMP_MAX_DEGREES = 40;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Convert a body weight in kg or lb to kilograms. */
export function toKilograms(weight, unit) {
  if (!isNum(weight)) return null;
  return unit === "lb" ? weight * KG_PER_LB : weight;
}

/**
 * Keytel et al. 2005 energy expenditure from heart rate.
 *
 * @param {object} input
 * @param {number} input.heartRate bpm
 * @param {number} input.weightKg  body mass in kg
 * @param {number} input.age       years
 * @param {"male"|"female"} input.sex
 * @returns {number|null} kcal per minute, or null for unusable input.
 */
export function keytelKcalPerMinute({ heartRate, weightKg, age, sex }) {
  const coefficients = KEYTEL_COEFFICIENTS[sex];
  if (!coefficients) return null;
  if (!isNum(heartRate) || !isNum(weightKg) || !isNum(age)) return null;
  const kjPerMin =
    coefficients.intercept +
    coefficients.hr * heartRate +
    coefficients.weight * weightKg +
    coefficients.age * age;
  return kjPerMin / KJ_PER_KCAL;
}

/**
 * Full elliptical session estimate.
 *
 * @param {object} input
 * @param {"heartRate"|"watts"} [input.mode]
 * @param {number} input.weight
 * @param {"kg"|"lb"} [input.weightUnit]
 * @param {number} input.minutes
 * @param {number} [input.heartRate]      Average heart rate, for the heartRate mode.
 * @param {number} [input.age]            Age in years, for the heartRate mode.
 * @param {"male"|"female"} [input.sex]   Required by the Keytel equation.
 * @param {number} [input.watts]          Average console power, for the watts mode.
 * @param {number|null} [input.resistanceLevel] Session context only.
 * @param {number|null} [input.rampDegrees]     Session context only.
 * @returns {object} energy figures, or { error }.
 */
export function computeEllipticalCalories({
  mode = "heartRate",
  weight,
  weightUnit = "kg",
  minutes,
  heartRate = null,
  age = null,
  sex = "female",
  watts = null,
  resistanceLevel = null,
  rampDegrees = null,
}) {
  const weightKg = toKilograms(weight, weightUnit);
  if (weightKg === null) return { error: "Enter your body weight." };
  if (weightKg < WEIGHT_MIN_KG || weightKg > WEIGHT_MAX_KG) {
    return { error: `Body weight should be between ${WEIGHT_MIN_KG} and ${WEIGHT_MAX_KG} kg.` };
  }

  if (!isNum(minutes)) return { error: "Enter how long the session lasted." };
  if (minutes <= 0) return { error: "Duration must be greater than zero minutes." };
  if (minutes > DURATION_MAX_MIN) {
    return { error: `Sessions longer than ${DURATION_MAX_MIN} minutes are outside this calculator's range.` };
  }

  if (resistanceLevel !== null && resistanceLevel !== undefined && resistanceLevel !== "") {
    if (!isNum(resistanceLevel) || resistanceLevel < 0 || resistanceLevel > 100) {
      return { error: "Resistance level should be a number between 0 and 100." };
    }
  }
  if (rampDegrees !== null && rampDegrees !== undefined && rampDegrees !== "") {
    if (!isNum(rampDegrees) || rampDegrees < 0 || rampDegrees > RAMP_MAX_DEGREES) {
      return { error: `Ramp angle should be between 0 and ${RAMP_MAX_DEGREES} degrees.` };
    }
  }

  const restingKcalPerMin = ((ML_O2_PER_MET * weightKg) / 1000) * KCAL_PER_LITRE_O2;
  const warnings = [];

  let kcalPerMin;
  let method;
  let vo2 = null;
  let powerW = null;

  if (mode === "watts") {
    if (!isNum(watts)) return { error: "Enter the average power shown on the console, in watts." };
    if (watts < 0) return { error: "Power cannot be negative." };
    if (watts > POWER_MAX_W) {
      return { error: `An average above ${POWER_MAX_W} W is outside this calculator's range.` };
    }
    powerW = watts;
    vo2 = (ML_O2_PER_WATT_MIN * powerW) / weightKg + MOVEMENT_BASELINE_ML_KG_MIN;
    kcalPerMin = ((vo2 * weightKg) / 1000) * KCAL_PER_LITRE_O2;
    method = "ACSM leg-work oxygen cost from console watts";
    warnings.push(
      "Elliptical consoles vary in how they report watts, and arm work is not always included. Treat this route as an approximation and prefer the heart rate mode where you can.",
    );
  } else {
    if (!KEYTEL_COEFFICIENTS[sex]) {
      return { error: "The Keytel equation has separate coefficients for men and women — choose one." };
    }
    if (!isNum(heartRate)) return { error: "Enter your average heart rate for the session." };
    if (heartRate < HR_INPUT_MIN || heartRate > HR_INPUT_MAX) {
      return { error: `Average heart rate should be between ${HR_INPUT_MIN} and ${HR_INPUT_MAX} bpm.` };
    }
    if (!isNum(age)) return { error: "Enter your age — the Keytel equation uses it." };
    if (age < AGE_MIN || age > AGE_MAX) {
      return { error: `Age should be between ${AGE_MIN} and ${AGE_MAX} years.` };
    }

    kcalPerMin = keytelKcalPerMinute({ heartRate, weightKg, age, sex });
    if (kcalPerMin === null) return { error: "That combination cannot be evaluated." };
    method = "Keytel et al. 2005 heart rate equation";

    if (heartRate < KEYTEL_HR_MIN) {
      warnings.push(
        `The Keytel equation was fitted to submaximal exercise heart rates from about ${KEYTEL_HR_MIN} bpm upward. Below that it drifts toward — and can fall under — resting energy expenditure.`,
      );
    }
    if (heartRate > KEYTEL_HR_MAX) {
      warnings.push(
        `Above about ${KEYTEL_HR_MAX} bpm the equation is being extrapolated beyond the data it was fitted to.`,
      );
    }
    if (kcalPerMin < restingKcalPerMin) {
      kcalPerMin = restingKcalPerMin;
      warnings.push(
        "The equation returned less than your resting metabolic rate at that heart rate, so the result has been floored at rest.",
      );
    }
  }

  if (!isNum(kcalPerMin) || kcalPerMin < 0) {
    return { error: "That combination of inputs does not produce a usable estimate." };
  }

  const grossKcal = kcalPerMin * minutes;
  const restingKcal = restingKcalPerMin * minutes;
  const netKcal = Math.max(0, grossKcal - restingKcal);
  const metsEquivalent = kcalPerMin / restingKcalPerMin;

  return {
    weightKg,
    minutes,
    mode,
    method,
    kcalPerMin,
    grossKcal,
    netKcal,
    restingKcal,
    mets: metsEquivalent,
    vo2,
    powerW,
    heartRate: mode === "heartRate" ? heartRate : null,
    age: mode === "heartRate" ? age : null,
    sex: mode === "heartRate" ? sex : null,
    resistanceLevel: isNum(resistanceLevel) ? resistanceLevel : null,
    rampDegrees: isNum(rampDegrees) ? rampDegrees : null,
    warnings,
  };
}
