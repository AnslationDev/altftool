/**
 * Stationary bike energy cost.
 *
 * Oxygen uptake comes from the ACSM leg-cycle-ergometry equation
 * (ACSM's Guidelines for Exercise Testing and Prescription):
 *
 *   VO2 (mL/kg/min) = (10.8 x W) / M + 7
 *
 * where W is external power in watts and M is body mass in kg. The constant 7 is
 * 3.5 mL/kg/min resting uptake plus 3.5 mL/kg/min for unloaded pedalling. The
 * equation is validated for work rates of roughly 50-200 W.
 *
 * Energy uses the ACSM caloric equivalent of oxygen, 5 kcal per litre of O2.
 *
 * When the bike shows no wattage, power is estimated from the flywheel physics:
 *
 *   P = torque x angular velocity,  angular velocity = cadence x 2*PI / 60
 *
 * with braking torque assumed to rise linearly with the resistance setting. This
 * is an approximation — consumer bikes are not calibrated to a common scale — so
 * the watts mode is always the more accurate of the two.
 */

/** One metabolic equivalent, mL O2 per kg per minute. */
export const ML_O2_PER_MET = 3.5;
/** ACSM caloric equivalent of oxygen, kcal per litre. */
export const KCAL_PER_LITRE_O2 = 5;
/** ACSM cycling constant: mL O2 per minute per watt of external work. */
export const ML_O2_PER_WATT_MIN = 10.8;
/** Resting (3.5) plus unloaded pedalling (3.5), mL/kg/min. */
export const CYCLING_BASELINE_ML_KG_MIN = 7;
/** ACSM validity window for the leg ergometry equation, in watts. */
export const CYCLE_VALID_MIN_W = 50;
export const CYCLE_VALID_MAX_W = 200;

/**
 * Braking torque at full resistance, in newton-metres.
 * Calibrated so that half resistance at 80 rpm gives roughly 150 W, which is a
 * typical mid-range magnetic spin bike. Real bikes vary widely.
 */
export const FULL_RESISTANCE_TORQUE_NM = 36;

/** 1 pound = 0.45359237 kg exactly. */
export const KG_PER_LB = 0.45359237;

export const WEIGHT_MIN_KG = 20;
export const WEIGHT_MAX_KG = 300;
export const POWER_MAX_W = 1000;
export const CADENCE_MAX_RPM = 200;
export const DURATION_MAX_MIN = 600;

/** Resistance dial sizes found on common machines. */
export const RESISTANCE_SCALES = [8, 10, 16, 20, 24, 32];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Convert a body weight in kg or lb to kilograms. */
export function toKilograms(weight, unit) {
  if (!isNum(weight)) return null;
  return unit === "lb" ? weight * KG_PER_LB : weight;
}

/**
 * Estimate external power from a resistance setting and cadence.
 *
 * @param {number} level     Current resistance setting.
 * @param {number} maxLevel  Highest setting on the dial.
 * @param {number} cadence   Pedal cadence in revolutions per minute.
 * @returns {number|null} watts, or null for unusable input.
 */
export function estimatePowerWatts(level, maxLevel, cadence) {
  if (!isNum(level) || !isNum(maxLevel) || !isNum(cadence)) return null;
  if (maxLevel <= 0 || level < 0 || cadence < 0) return null;
  if (level > maxLevel) return null;
  const torque = FULL_RESISTANCE_TORQUE_NM * (level / maxLevel);
  const angularVelocity = (cadence * 2 * Math.PI) / 60;
  return torque * angularVelocity;
}

/**
 * Full stationary bike session estimate.
 *
 * @param {object} input
 * @param {number} input.weight             Body weight.
 * @param {"kg"|"lb"} [input.weightUnit]
 * @param {"watts"|"resistance"} [input.mode]
 * @param {number} [input.watts]            Power, when mode is "watts".
 * @param {number} [input.level]            Resistance setting, when mode is "resistance".
 * @param {number} [input.maxLevel]         Highest setting on the dial.
 * @param {number} [input.cadence]          Cadence in rpm, when mode is "resistance".
 * @param {number} input.minutes            Session length.
 * @returns {object} energy figures, or { error }.
 */
export function computeBikeCalories({
  weight,
  weightUnit = "kg",
  mode = "resistance",
  watts = null,
  level = null,
  maxLevel = 20,
  cadence = null,
  minutes,
}) {
  const weightKg = toKilograms(weight, weightUnit);
  if (weightKg === null) return { error: "Enter your body weight." };
  if (weightKg < WEIGHT_MIN_KG || weightKg > WEIGHT_MAX_KG) {
    return { error: `Body weight should be between ${WEIGHT_MIN_KG} and ${WEIGHT_MAX_KG} kg.` };
  }

  if (!isNum(minutes)) return { error: "Enter how long you rode for." };
  if (minutes <= 0) return { error: "Duration must be greater than zero minutes." };
  if (minutes > DURATION_MAX_MIN) {
    return { error: `Rides longer than ${DURATION_MAX_MIN} minutes are outside this calculator's range.` };
  }

  let powerW;
  let estimated = false;

  if (mode === "watts") {
    if (!isNum(watts)) return { error: "Enter the average power shown on the console, in watts." };
    if (watts < 0) return { error: "Power cannot be negative." };
    if (watts > POWER_MAX_W) {
      return { error: `An average of more than ${POWER_MAX_W} W is outside this calculator's range.` };
    }
    powerW = watts;
  } else {
    if (!isNum(level)) return { error: "Enter the resistance level you rode at." };
    if (!isNum(maxLevel) || maxLevel <= 0) {
      return { error: "Choose how many resistance levels your bike has." };
    }
    if (level < 0) return { error: "Resistance level cannot be negative." };
    if (level > maxLevel) {
      return { error: `Resistance level cannot be higher than the maximum of ${maxLevel}.` };
    }
    if (!isNum(cadence)) return { error: "Enter your average cadence in rpm." };
    if (cadence <= 0) return { error: "Cadence must be greater than zero — you have to be pedalling." };
    if (cadence > CADENCE_MAX_RPM) {
      return { error: `A cadence above ${CADENCE_MAX_RPM} rpm is outside this calculator's range.` };
    }
    powerW = estimatePowerWatts(level, maxLevel, cadence);
    if (powerW === null) return { error: "That resistance and cadence combination cannot be evaluated." };
    estimated = true;
  }

  const vo2 = (ML_O2_PER_WATT_MIN * powerW) / weightKg + CYCLING_BASELINE_ML_KG_MIN;
  const litresPerMin = (vo2 * weightKg) / 1000;
  const kcalPerMin = litresPerMin * KCAL_PER_LITRE_O2;
  const grossKcal = kcalPerMin * minutes;

  const restingKcalPerMin = ((ML_O2_PER_MET * weightKg) / 1000) * KCAL_PER_LITRE_O2;
  const restingKcal = restingKcalPerMin * minutes;
  const netKcal = Math.max(0, grossKcal - restingKcal);

  /** Mechanical work done, in kilojoules: watts x seconds / 1000. */
  const workKj = (powerW * minutes * 60) / 1000;
  /** 1 kcal = 4.184 kJ (thermochemical calorie). */
  const KJ_PER_KCAL = 4.184;
  const grossEfficiency = grossKcal > 0 ? (workKj / (grossKcal * KJ_PER_KCAL)) * 100 : null;

  const warnings = [];
  if (estimated) {
    warnings.push(
      "Resistance dials are not calibrated to a common standard, so this power figure is a physics-based approximation. If your console shows watts, use the watts mode instead.",
    );
  }
  if (powerW > 0 && powerW < CYCLE_VALID_MIN_W) {
    warnings.push(
      `The ACSM cycling equation is validated from about ${CYCLE_VALID_MIN_W} W upward; below that the estimate is rough.`,
    );
  }
  if (powerW > CYCLE_VALID_MAX_W) {
    warnings.push(
      `The ACSM cycling equation is validated to about ${CYCLE_VALID_MAX_W} W. Above that it slightly underestimates oxygen uptake for most riders.`,
    );
  }

  return {
    weightKg,
    minutes,
    powerW,
    estimatedPower: estimated,
    level: estimated ? level : null,
    maxLevel: estimated ? maxLevel : null,
    cadence: estimated ? cadence : null,
    vo2,
    mets: vo2 / ML_O2_PER_MET,
    kcalPerMin,
    grossKcal,
    netKcal,
    restingKcal,
    workKj,
    grossEfficiency,
    wattsPerKg: powerW / weightKg,
    warnings,
  };
}
