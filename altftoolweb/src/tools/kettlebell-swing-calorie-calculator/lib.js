/**
 * Kettlebell swing energy expenditure.
 *
 * Anchored on Farrar RE, Mayhew JL, Koch AJ, "Oxygen cost of kettlebell swings",
 * J Strength Cond Res 2010, which measured continuous two-hand swings with a 16 kg
 * bell at a mean oxygen uptake of about 34 mL/kg/min — roughly 9.8 METs. That single
 * measured point is then scaled for how heavy your bell is relative to your body mass
 * and for how fast you swing, because both change the load.
 */

/** Measured working intensity for continuous two-hand swings at the reference load. */
export const REFERENCE_MET = 9.8;

/** Reference conditions in the source study: a 16 kg bell for roughly an 80 kg lifter. */
export const REFERENCE_BELL_KG = 16;
export const REFERENCE_BODY_KG = 80;
export const REFERENCE_BELL_TO_BODY = REFERENCE_BELL_KG / REFERENCE_BODY_KG;

/** Reference cadence: a two-second swing cycle, which is 30 swings per minute. */
export const REFERENCE_SWINGS_PER_MINUTE = 30;

/**
 * Sensitivity of oxygen cost to load and cadence. Neither is one-for-one: a large part
 * of the cost of a swing is accelerating your own trunk and hips, which does not change
 * when the bell does. These partial coefficients keep the scaling conservative.
 */
export const LOAD_SENSITIVITY = 0.45;
export const CADENCE_SENSITIVITY = 0.6;

/** Bounds so extreme inputs cannot produce a physiologically impossible intensity. */
export const WORK_MET_FLOOR = 4;
export const WORK_MET_CEILING = 16;
export const LOAD_FACTOR_BOUNDS = [0.55, 1.9];
export const CADENCE_FACTOR_BOUNDS = [0.6, 1.5];

/** Standing and walking off a set. Compendium 17152, walking 3.2 km/h, is 2.0 METs. */
export const REST_MET = 2;

/** One MET by definition, used to strip out baseline metabolism. */
export const RESTING_MET = 1;

/** ACSM energy equation: kcal/min = METs x 3.5 mL O2 per kg per min x kg / 200. */
export const ML_O2_PER_MET = 3.5;
export const ACSM_KCAL_DIVISOR = 200;

/** Standard gravity, m/s^2, and joules per kilocalorie, for the mechanical work figure. */
export const GRAVITY = 9.80665;
export const JOULES_PER_KCAL = 4184;

/**
 * Vertical travel of the bell in a Russian swing, from the bottom of the backswing to
 * chest height. About 0.9 m for an average adult; adjust for an American swing overhead.
 */
export const SWING_RISE_M = 0.9;

export const LIMITS = {
  weightKg: [25, 250],
  bellKg: [2, 80],
  sets: [1, 100],
  swingsPerSet: [1, 500],
  swingsPerMinute: [5, 80],
  restSeconds: [0, 600],
};

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/** kcal per minute for a given MET value and body mass. */
export function kcalPerMinute(met, weightKg) {
  if (!isFiniteNumber(met) || !isFiniteNumber(weightKg)) return NaN;
  return (met * ML_O2_PER_MET * weightKg) / ACSM_KCAL_DIVISOR;
}

/** How much harder the bell is than the reference, relative to your own body mass. */
export function loadFactor(bellKg, weightKg) {
  if (!isFiniteNumber(bellKg) || !isFiniteNumber(weightKg) || weightKg <= 0) return NaN;
  const ratio = bellKg / weightKg;
  const raw = 1 + LOAD_SENSITIVITY * (ratio / REFERENCE_BELL_TO_BODY - 1);
  return clamp(raw, LOAD_FACTOR_BOUNDS[0], LOAD_FACTOR_BOUNDS[1]);
}

/** How much harder a faster or slower swing cadence is than the reference. */
export function cadenceFactor(swingsPerMinute) {
  if (!isFiniteNumber(swingsPerMinute)) return NaN;
  const raw = 1 + CADENCE_SENSITIVITY * (swingsPerMinute / REFERENCE_SWINGS_PER_MINUTE - 1);
  return clamp(raw, CADENCE_FACTOR_BOUNDS[0], CADENCE_FACTOR_BOUNDS[1]);
}

/**
 * @param {object} input
 * @param {number} input.weightKg          body mass in kilograms
 * @param {number} input.bellKg            kettlebell mass in kilograms
 * @param {number} input.sets              number of sets
 * @param {number} input.swingsPerSet      swings in each set
 * @param {number} input.swingsPerMinute   swing cadence during a set
 * @param {number} input.restSeconds       rest between sets
 * @param {number} [input.swingRiseM]      vertical travel of the bell per swing
 */
export function computeKettlebellSwingCalories({
  weightKg,
  bellKg,
  sets,
  swingsPerSet,
  swingsPerMinute,
  restSeconds,
  swingRiseM = SWING_RISE_M,
}) {
  const numbers = [weightKg, bellKg, sets, swingsPerSet, swingsPerMinute, restSeconds, swingRiseM];
  if (!numbers.every(isFiniteNumber)) {
    return { error: "Enter a number in every field." };
  }
  if (weightKg < LIMITS.weightKg[0] || weightKg > LIMITS.weightKg[1]) {
    return { error: `Body weight should be between ${LIMITS.weightKg[0]} kg and ${LIMITS.weightKg[1]} kg.` };
  }
  if (bellKg < LIMITS.bellKg[0] || bellKg > LIMITS.bellKg[1]) {
    return { error: `Bell weight should be between ${LIMITS.bellKg[0]} kg and ${LIMITS.bellKg[1]} kg.` };
  }
  if (sets < LIMITS.sets[0] || sets > LIMITS.sets[1] || !Number.isInteger(sets)) {
    return { error: `Sets should be a whole number between ${LIMITS.sets[0]} and ${LIMITS.sets[1]}.` };
  }
  if (
    swingsPerSet < LIMITS.swingsPerSet[0] ||
    swingsPerSet > LIMITS.swingsPerSet[1] ||
    !Number.isInteger(swingsPerSet)
  ) {
    return {
      error: `Swings per set should be a whole number between ${LIMITS.swingsPerSet[0]} and ${LIMITS.swingsPerSet[1]}.`,
    };
  }
  if (swingsPerMinute < LIMITS.swingsPerMinute[0] || swingsPerMinute > LIMITS.swingsPerMinute[1]) {
    return {
      error: `Cadence should be between ${LIMITS.swingsPerMinute[0]} and ${LIMITS.swingsPerMinute[1]} swings per minute.`,
    };
  }
  if (restSeconds < LIMITS.restSeconds[0] || restSeconds > LIMITS.restSeconds[1]) {
    return { error: `Rest between sets should be between ${LIMITS.restSeconds[0]} and ${LIMITS.restSeconds[1]} seconds.` };
  }
  if (swingRiseM <= 0 || swingRiseM > 2.5) {
    return { error: "Bell travel per swing should be between 0 and 2.5 metres." };
  }

  const load = loadFactor(bellKg, weightKg);
  const cadence = cadenceFactor(swingsPerMinute);
  const workMet = clamp(REFERENCE_MET * load * cadence, WORK_MET_FLOOR, WORK_MET_CEILING);

  const totalSwings = sets * swingsPerSet;
  const workMinutes = totalSwings / swingsPerMinute;
  // You rest between sets, not after the last one.
  const restMinutes = (Math.max(0, sets - 1) * restSeconds) / 60;
  const totalMinutes = workMinutes + restMinutes;

  const workKcalPerMin = kcalPerMinute(workMet, weightKg);
  const restKcalPerMin = kcalPerMinute(REST_MET, weightKg);
  const restingKcalPerMin = kcalPerMinute(RESTING_MET, weightKg);

  const workKcal = workKcalPerMin * workMinutes;
  const restKcal = restKcalPerMin * restMinutes;
  const grossKcal = workKcal + restKcal;
  const netKcal = Math.max(0, grossKcal - restingKcalPerMin * totalMinutes);

  const totalVolumeKg = totalSwings * bellKg;
  const bellWorkJoules = totalSwings * bellKg * GRAVITY * swingRiseM;

  return {
    workMet,
    loadFactor: load,
    cadenceFactor: cadence,
    bellToBodyRatio: bellKg / weightKg,
    averageMet: totalMinutes > 0 ? grossKcal / totalMinutes / restingKcalPerMin : 0,
    totalSwings,
    workMinutes,
    restMinutes,
    totalMinutes,
    workKcalPerMin,
    workKcal,
    restKcal,
    grossKcal,
    netKcal,
    kcalPerSwing: totalSwings > 0 ? grossKcal / totalSwings : 0,
    totalVolumeKg,
    bellWorkJoules,
    bellWorkKcal: bellWorkJoules / JOULES_PER_KCAL,
  };
}

/** Swings needed to reach a calorie target at the same bell weight and cadence. */
export function swingsForTarget(kcalPerSwing, targetKcal) {
  if (!isFiniteNumber(kcalPerSwing) || !isFiniteNumber(targetKcal)) return null;
  if (kcalPerSwing <= 0 || targetKcal <= 0) return null;
  return Math.ceil(targetKcal / kcalPerSwing);
}
