/**
 * Moving-day energy cost.
 *
 * Moving house is one of the few household jobs that reaches vigorous intensity:
 * carrying boxes upstairs is rated 9.0 METs, higher than jogging. Each activity is
 * priced with its own published MET value and summed.
 *
 * Method (the standard metabolic-equivalent approach):
 *   VO2 (mL/kg/min) = MET x 3.5
 *   kcal/min        = VO2 x kg / 1000 x 5 kcal per litre of oxygen
 *                   = MET x 3.5 x kg / 200
 *
 * MET values come from Ainsworth BE et al., "2011 Compendium of Physical Activities:
 * a second update of codes and MET values", Med Sci Sports Exerc 2011;43(8):1575-1581,
 * major heading 05 (Home Activities).
 *
 * Intensity bands follow the WHO 2020 physical-activity guidelines: light below
 * 3.0 METs, moderate 3.0-5.9 METs, vigorous 6.0 METs and above.
 */

/** Oxygen uptake of one metabolic equivalent, mL O2 per kg per minute. */
export const ML_O2_PER_MET = 3.5;
/** Caloric equivalent of oxygen used throughout the compendium, kcal per litre. */
export const KCAL_PER_LITRE_O2 = 5;
/** 1 pound = 0.45359237 kg exactly. */
export const KG_PER_LB = 0.45359237;
/** WHO: vigorous-intensity activity starts at 6.0 METs. */
export const VIGOROUS_MET_FLOOR = 6.0;
/** WHO: moderate-intensity activity starts at 3.0 METs. */
export const MODERATE_MET_FLOOR = 3.0;
/** Compendium: jogging, general. Used only for the comparison line. */
export const JOGGING_MET = 7.0;

export const WEIGHT_MIN_KG = 20;
export const WEIGHT_MAX_KG = 300;
export const TASK_MAX_MIN = 720;
export const DAY_MAX_MIN = 1080;

/** Moving-day activities and the compendium entry each MET value is taken from. */
export const MOVING_TASKS = [
  {
    id: "packing",
    label: "Packing and taping boxes, standing",
    met: 3.5,
    code: "05120",
    source:
      "Standing, packing or unpacking boxes, occasional lifting of lightweight household items, moderate effort",
  },
  {
    id: "loading",
    label: "Loading and unloading the van or car",
    met: 3.5,
    code: "05120",
    source: "Standing, loading and unloading items in a car, moderate effort",
  },
  {
    id: "carrying",
    label: "Carrying boxes and furniture on the level",
    met: 5.8,
    code: "05090",
    source: "Moving furniture and household items, carrying boxes",
  },
  {
    id: "pushing",
    label: "Pushing or dragging heavy items over about 35 kg",
    met: 7.5,
    code: "05125",
    source: "Pushing or pulling heavy objects of 75 lb or more, such as desks or moving-van work",
  },
  {
    id: "stairs",
    label: "Carrying boxes or furniture up and down stairs",
    met: 9.0,
    code: "05110",
    source: "Moving household items upstairs, carrying boxes or furniture",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Classify a MET value into the WHO light / moderate / vigorous bands. */
export function intensityBand(met) {
  if (!isNum(met)) return null;
  if (met >= VIGOROUS_MET_FLOOR) return "vigorous";
  if (met >= MODERATE_MET_FLOOR) return "moderate";
  return "light";
}

/** Convert a body weight in kg or lb to kilograms. */
export function toKilograms(weight, unit) {
  if (!isNum(weight)) return null;
  return unit === "lb" ? weight * KG_PER_LB : weight;
}

/** kcal per minute for a given MET value and body mass. */
export function kcalPerMinute(met, weightKg) {
  if (!isNum(met) || !isNum(weightKg)) return null;
  return ((met * ML_O2_PER_MET * weightKg) / 1000) * KCAL_PER_LITRE_O2;
}

/**
 * Energy cost of a moving day.
 *
 * @param {object} input
 * @param {number} input.weight
 * @param {"kg"|"lb"} [input.weightUnit]
 * @param {Record<string, number>} input.minutes Minutes per task id from MOVING_TASKS.
 * @returns {object} Energy figures, or { error }.
 */
export function computeMovingCalories({ weight, weightUnit = "kg", minutes = {} }) {
  const weightKg = toKilograms(weight, weightUnit);
  if (weightKg === null) return { error: "Enter your body weight." };
  if (weightKg < WEIGHT_MIN_KG || weightKg > WEIGHT_MAX_KG) {
    return { error: `Body weight should be between ${WEIGHT_MIN_KG} and ${WEIGHT_MAX_KG} kg.` };
  }

  const rows = [];
  let dayMinutes = 0;
  let dayKcal = 0;
  let metMinutes = 0;
  let moderateMinutes = 0;
  let vigorousMinutes = 0;
  let peakMet = 0;

  for (const task of MOVING_TASKS) {
    const raw = minutes[task.id];
    const value = raw === undefined || raw === null || raw === "" ? 0 : raw;
    if (!isNum(value)) return { error: `Enter a number of minutes for "${task.label}".` };
    if (value < 0) return { error: "Minutes cannot be negative." };
    if (value > TASK_MAX_MIN) {
      return { error: `No single moving task can be longer than ${TASK_MAX_MIN} minutes.` };
    }
    if (value === 0) continue;

    const band = intensityBand(task.met);
    if (band === "vigorous") vigorousMinutes += value;
    else if (band === "moderate") moderateMinutes += value;

    const perMin = kcalPerMinute(task.met, weightKg);
    const kcal = perMin * value;
    dayMinutes += value;
    dayKcal += kcal;
    metMinutes += task.met * value;
    if (task.met > peakMet) peakMet = task.met;

    rows.push({
      id: task.id,
      label: task.label,
      met: task.met,
      code: task.code,
      band,
      minutes: value,
      kcalPerMin: perMin,
      kcal,
    });
  }

  if (dayMinutes <= 0) return { error: "Add some minutes to at least one moving task." };
  if (dayMinutes > DAY_MAX_MIN) {
    return { error: `A moving day longer than ${DAY_MAX_MIN} minutes is outside this calculator's range.` };
  }

  const restingPerMin = kcalPerMinute(1, weightKg);
  const dayRestingKcal = restingPerMin * dayMinutes;
  const dayNetKcal = Math.max(0, dayKcal - dayRestingKcal);
  const averageMet = dayKcal / dayRestingKcal;

  const joggingPerMin = kcalPerMinute(JOGGING_MET, weightKg);
  const joggingEquivalentMinutes = joggingPerMin > 0 ? dayKcal / joggingPerMin : 0;

  return {
    weightKg,
    dayMinutes,
    dayKcal,
    dayNetKcal,
    dayRestingKcal,
    averageMet,
    kcalPerMin: dayKcal / dayMinutes,
    metMinutes,
    metHours: metMinutes / 60,
    moderateMinutes,
    vigorousMinutes,
    peakMet,
    reachesVigorous: peakMet >= VIGOROUS_MET_FLOOR,
    joggingEquivalentMinutes,
    rows,
  };
}
