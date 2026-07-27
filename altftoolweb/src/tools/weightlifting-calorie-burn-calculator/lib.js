/**
 * Weightlifting session energy expenditure.
 *
 * Method: the MET (metabolic equivalent) model used throughout exercise physiology.
 *   VO2 (mL/kg/min) = MET x 3.5
 *   kcal            = MET x 3.5 x bodyMassKg / 1000 x 5 x minutes
 * i.e. 1 litre of oxygen consumed releases about 5 kcal at a mixed-substrate
 * respiratory exchange ratio (ACSM's Guidelines for Exercise Testing and Prescription).
 *
 * A lifting session is NOT one steady intensity: the working sets are brief and hard
 * while the rest between sets is close to standing. This module therefore splits the
 * session into working time, rest time and warm-up time and applies a separate MET to
 * each, instead of smearing one average MET across the whole hour.
 *
 * MET values are from the 2011 Compendium of Physical Activities
 * (Ainsworth BE et al., Med Sci Sports Exerc 43(8):1575-1581).
 */

/** Oxygen uptake of one MET, in mL of O2 per kg of body mass per minute. */
export const ML_O2_PER_MET = 3.5;
/** Caloric equivalent of oxygen, kcal per litre of O2 (ACSM). */
export const KCAL_PER_LITRE_O2 = 5;
/** 1 pound = 0.45359237 kg exactly (1959 international yard and pound agreement). */
export const KG_PER_LB = 0.45359237;
/** Resting metabolic rate is 1 MET by definition. */
export const RESTING_MET = 1;

/**
 * Working-set intensities, Compendium 2011 activity codes:
 *  02054 resistance training, light or moderate effort, general workout -> 3.5
 *  02052 resistance (weight) training, squats, slow or explosive effort -> 5.0
 *  02050 resistance training, power lifting or body building, vigorous effort -> 6.0
 */
export const LIFT_INTENSITIES = [
  {
    id: "light",
    label: "Light / moderate — machines, isolation work",
    met: 3.5,
    code: "Compendium 02054",
  },
  {
    id: "compound",
    label: "Compound lifts — squats, deadlifts, presses",
    met: 5.0,
    code: "Compendium 02052",
  },
  {
    id: "vigorous",
    label: "Vigorous — powerlifting or bodybuilding, hard sets",
    met: 6.0,
    code: "Compendium 02050",
  },
];

/**
 * Rest between sets. The Compendium codes standing quietly at 1.3 METs and standing
 * with light activity (changing plates, walking to the next rack) at 2.0 METs; 1.5 is
 * the value used here for a lifter resting on their feet between sets.
 */
export const REST_MET = 1.5;
/** Warm-up and stretching: Compendium 02101, stretching / mobility, mild effort -> 2.3. */
export const WARMUP_MET = 2.3;

export const WEIGHT_MIN_KG = 20;
export const WEIGHT_MAX_KG = 300;
export const SETS_MAX = 100;
export const SET_SECONDS_MAX = 600;
export const REST_SECONDS_MAX = 1200;
export const WARMUP_MINUTES_MAX = 120;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Convert a body weight given in kg or lb to kilograms. */
export function toKilograms(weight, unit) {
  if (!isNum(weight)) return null;
  return unit === "lb" ? weight * KG_PER_LB : weight;
}

/** Gross kcal for `minutes` spent at `met` by a person of `weightKg`. */
export function kcalFromMet(met, weightKg, minutes) {
  if (!isNum(met) || !isNum(weightKg) || !isNum(minutes)) return 0;
  if (met <= 0 || weightKg <= 0 || minutes <= 0) return 0;
  return ((met * ML_O2_PER_MET * weightKg) / 1000) * KCAL_PER_LITRE_O2 * minutes;
}

/** Look up a lifting intensity by id; falls back to the compound-lift entry. */
export function getLiftIntensity(id) {
  return LIFT_INTENSITIES.find((item) => item.id === id) || LIFT_INTENSITIES[1];
}

/**
 * Calories for a full weight-training session.
 *
 * @param {object} input
 * @param {number} input.weight              Body weight.
 * @param {"kg"|"lb"} [input.weightUnit]     Unit of the weight above.
 * @param {number} input.sets                Total working sets in the session.
 * @param {number} input.secondsPerSet       Time under tension per working set, seconds.
 * @param {number} input.restSeconds         Rest taken between sets, seconds.
 * @param {number} [input.warmupMinutes]     Warm-up / cool-down minutes outside the sets.
 * @param {string} [input.intensity]         Id from LIFT_INTENSITIES.
 * @returns {object} energy figures, or { error }.
 */
export function computeLiftingCalories({
  weight,
  weightUnit = "kg",
  sets,
  secondsPerSet,
  restSeconds,
  warmupMinutes = 0,
  intensity = "compound",
}) {
  const weightKg = toKilograms(weight, weightUnit);
  if (weightKg === null) return { error: "Enter your body weight." };
  if (weightKg < WEIGHT_MIN_KG || weightKg > WEIGHT_MAX_KG) {
    return { error: `Body weight should be between ${WEIGHT_MIN_KG} and ${WEIGHT_MAX_KG} kg.` };
  }

  if (!isNum(sets)) return { error: "Enter how many working sets you did." };
  if (sets < 1) return { error: "A session needs at least one working set." };
  if (sets > SETS_MAX) {
    return { error: `More than ${SETS_MAX} working sets is outside this calculator's range.` };
  }

  if (!isNum(secondsPerSet)) return { error: "Enter the length of a working set in seconds." };
  if (secondsPerSet <= 0) return { error: "A working set must be longer than zero seconds." };
  if (secondsPerSet > SET_SECONDS_MAX) {
    return { error: `A single set longer than ${SET_SECONDS_MAX} seconds is outside this range.` };
  }

  if (!isNum(restSeconds)) return { error: "Enter the rest taken between sets in seconds." };
  if (restSeconds < 0) return { error: "Rest between sets cannot be negative." };
  if (restSeconds > REST_SECONDS_MAX) {
    return { error: `Rest longer than ${REST_SECONDS_MAX} seconds between sets is outside this range.` };
  }

  if (!isNum(warmupMinutes)) return { error: "Enter warm-up minutes, or 0 if you skipped it." };
  if (warmupMinutes < 0) return { error: "Warm-up minutes cannot be negative." };
  if (warmupMinutes > WARMUP_MINUTES_MAX) {
    return { error: `A warm-up longer than ${WARMUP_MINUTES_MAX} minutes is outside this range.` };
  }

  const setCount = Math.floor(sets);
  const chosen = getLiftIntensity(intensity);

  // Rest happens between sets, so n sets contain n-1 rest intervals.
  const restIntervals = Math.max(0, setCount - 1);
  const workMinutes = (setCount * secondsPerSet) / 60;
  const restMinutes = (restIntervals * restSeconds) / 60;
  const totalMinutes = workMinutes + restMinutes + warmupMinutes;

  const workKcal = kcalFromMet(chosen.met, weightKg, workMinutes);
  const restKcal = kcalFromMet(REST_MET, weightKg, restMinutes);
  const warmupKcal = kcalFromMet(WARMUP_MET, weightKg, warmupMinutes);
  const grossKcal = workKcal + restKcal + warmupKcal;

  const restingKcal = kcalFromMet(RESTING_MET, weightKg, totalMinutes);
  const netKcal = Math.max(0, grossKcal - restingKcal);

  const averageMet = totalMinutes > 0 ? grossKcal / kcalFromMet(1, weightKg, totalMinutes) : 0;

  return {
    weightKg,
    setCount,
    intensityId: chosen.id,
    intensityLabel: chosen.label,
    liftMet: chosen.met,
    liftMetSource: chosen.code,
    workMinutes,
    restMinutes,
    warmupMinutes,
    totalMinutes,
    workKcal,
    restKcal,
    warmupKcal,
    grossKcal,
    restingKcal,
    netKcal,
    averageMet,
    kcalPerMinute: totalMinutes > 0 ? grossKcal / totalMinutes : 0,
    kcalPerSet: setCount > 0 ? grossKcal / setCount : 0,
  };
}
