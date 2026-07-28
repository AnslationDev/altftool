/**
 * Gardening energy cost, plus how far a gardening week goes toward the WHO
 * physical-activity guideline.
 *
 * Energy method (the standard metabolic-equivalent approach):
 *   VO2 (mL/kg/min) = MET x 3.5
 *   kcal/min        = VO2 x kg / 1000 x 5 kcal per litre of oxygen
 *                   = MET x 3.5 x kg / 200
 *
 * MET values are the published lawn-and-garden values from Ainsworth BE et al.,
 * "2011 Compendium of Physical Activities: a second update of codes and MET values",
 * Med Sci Sports Exerc 2011;43(8):1575-1581 (major heading 08, Lawn and Garden).
 *
 * Intensity bands and the weekly target follow the WHO 2020 guidelines on physical
 * activity and sedentary behaviour: light is below 3.0 METs, moderate is 3.0-5.9 METs,
 * vigorous is 6.0 METs and above, and adults are advised to do 150-300 minutes of
 * moderate-intensity aerobic activity a week, with one vigorous minute counting as two
 * moderate minutes.
 */

/** Oxygen uptake of one metabolic equivalent, mL O2 per kg per minute. */
export const ML_O2_PER_MET = 3.5;
/** Caloric equivalent of oxygen used throughout the compendium, kcal per litre. */
export const KCAL_PER_LITRE_O2 = 5;
/** 1 pound = 0.45359237 kg exactly. */
export const KG_PER_LB = 0.45359237;
/** WHO: moderate-intensity activity starts at 3.0 METs. */
export const MODERATE_MET_FLOOR = 3.0;
/** WHO: vigorous-intensity activity starts at 6.0 METs. */
export const VIGOROUS_MET_FLOOR = 6.0;
/** WHO 2020: lower end of the weekly moderate-activity recommendation, in minutes. */
export const WHO_WEEKLY_MODERATE_MIN = 150;
/** WHO 2020: upper end of the weekly moderate-activity recommendation, in minutes. */
export const WHO_WEEKLY_MODERATE_MAX = 300;
/** One vigorous minute counts as two moderate minutes toward the weekly target. */
export const VIGOROUS_TO_MODERATE_FACTOR = 2;

export const WEIGHT_MIN_KG = 20;
export const WEIGHT_MAX_KG = 300;
export const TASK_MAX_MIN = 480;
export const SESSION_MAX_MIN = 720;
export const SESSIONS_PER_WEEK_MAX = 14;

/** Garden tasks with the compendium entry each MET value is taken from. */
export const GARDEN_TASKS = [
  {
    id: "watering",
    label: "Watering the lawn or garden",
    met: 1.5,
    code: "08170",
    source: "Watering lawn or garden, standing or walking",
  },
  {
    id: "containers",
    label: "Container and pot gardening, seated or kneeling",
    met: 2.3,
    code: "08246",
    source: "Gardening using containers, older adults over 60 years",
  },
  {
    id: "weeding",
    label: "Weeding and cultivating beds",
    met: 3.5,
    code: "08180",
    source: "Weeding, cultivating garden",
  },
  {
    id: "general",
    label: "General pottering about the garden",
    met: 3.8,
    code: "08245",
    source: "Gardening, general",
  },
  {
    id: "raking",
    label: "Raking the lawn and bagging leaves",
    met: 4.0,
    code: "08120",
    source: "Raking lawn",
  },
  {
    id: "trimming",
    label: "Trimming shrubs or hedges with a manual cutter",
    met: 4.0,
    code: "08160",
    source: "Trimming shrubs or trees, manual cutter",
  },
  {
    id: "planting",
    label: "Planting seedlings and shrubs",
    met: 4.3,
    code: "08095",
    source: "Planting seedlings, shrubs",
  },
  {
    id: "digging",
    label: "Digging, spading, turning compost",
    met: 5.0,
    code: "08050",
    source: "Digging, spading, filling garden, composting",
  },
  {
    id: "mowingPower",
    label: "Mowing behind a walk-along power mower",
    met: 5.0,
    code: "08080",
    source: "Mowing lawn, walking, power mower",
  },
  {
    id: "mowingHand",
    label: "Mowing with a push hand mower",
    met: 6.0,
    code: "08085",
    source: "Mowing lawn, walking, hand mower",
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
 * Energy cost of a gardening session and its contribution to the WHO weekly target.
 *
 * @param {object} input
 * @param {number} input.weight
 * @param {"kg"|"lb"} [input.weightUnit]
 * @param {Record<string, number>} input.minutes  Minutes per task id from GARDEN_TASKS.
 * @param {number} input.sessionsPerWeek          Gardening sessions in a typical week.
 * @returns {object} Energy and guideline figures, or { error }.
 */
export function computeGardeningCalories({
  weight,
  weightUnit = "kg",
  minutes = {},
  sessionsPerWeek,
}) {
  const weightKg = toKilograms(weight, weightUnit);
  if (weightKg === null) return { error: "Enter your body weight." };
  if (weightKg < WEIGHT_MIN_KG || weightKg > WEIGHT_MAX_KG) {
    return { error: `Body weight should be between ${WEIGHT_MIN_KG} and ${WEIGHT_MAX_KG} kg.` };
  }

  if (!isNum(sessionsPerWeek)) return { error: "Enter how many gardening sessions you do a week." };
  if (sessionsPerWeek <= 0) return { error: "Enter at least one gardening session per week." };
  if (sessionsPerWeek > SESSIONS_PER_WEEK_MAX) {
    return { error: `More than ${SESSIONS_PER_WEEK_MAX} sessions a week is outside this calculator's range.` };
  }

  const rows = [];
  let sessionMinutes = 0;
  let sessionKcal = 0;
  let metMinutes = 0;
  let lightMinutes = 0;
  let moderateMinutes = 0;
  let vigorousMinutes = 0;

  for (const task of GARDEN_TASKS) {
    const raw = minutes[task.id];
    const value = raw === undefined || raw === null || raw === "" ? 0 : raw;
    if (!isNum(value)) return { error: `Enter a number of minutes for "${task.label}".` };
    if (value < 0) return { error: "Minutes cannot be negative." };
    if (value > TASK_MAX_MIN) {
      return { error: `No single garden task can be longer than ${TASK_MAX_MIN} minutes.` };
    }
    if (value === 0) continue;

    const band = intensityBand(task.met);
    if (band === "vigorous") vigorousMinutes += value;
    else if (band === "moderate") moderateMinutes += value;
    else lightMinutes += value;

    const perMin = kcalPerMinute(task.met, weightKg);
    const kcal = perMin * value;
    sessionMinutes += value;
    sessionKcal += kcal;
    metMinutes += task.met * value;
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

  if (sessionMinutes <= 0) return { error: "Add some minutes to at least one garden task." };
  if (sessionMinutes > SESSION_MAX_MIN) {
    return { error: `A single gardening session cannot exceed ${SESSION_MAX_MIN} minutes here.` };
  }

  const restingPerMin = kcalPerMinute(1, weightKg);
  const sessionRestingKcal = restingPerMin * sessionMinutes;
  const sessionNetKcal = Math.max(0, sessionKcal - sessionRestingKcal);
  const averageMet = sessionKcal / sessionRestingKcal;

  const weeklyModerateMinutes = moderateMinutes * sessionsPerWeek;
  const weeklyVigorousMinutes = vigorousMinutes * sessionsPerWeek;
  const weeklyMvpaEquivalent =
    weeklyModerateMinutes + weeklyVigorousMinutes * VIGOROUS_TO_MODERATE_FACTOR;

  return {
    weightKg,
    sessionsPerWeek,
    sessionMinutes,
    sessionKcal,
    sessionNetKcal,
    sessionRestingKcal,
    averageMet,
    kcalPerMin: sessionKcal / sessionMinutes,
    metMinutes,
    lightMinutes,
    moderateMinutes,
    vigorousMinutes,
    weekMinutes: sessionMinutes * sessionsPerWeek,
    weekKcal: sessionKcal * sessionsPerWeek,
    weekNetKcal: sessionNetKcal * sessionsPerWeek,
    weekMetMinutes: metMinutes * sessionsPerWeek,
    weeklyModerateMinutes,
    weeklyVigorousMinutes,
    weeklyMvpaEquivalent,
    whoTargetPercent: (weeklyMvpaEquivalent / WHO_WEEKLY_MODERATE_MIN) * 100,
    meetsWhoMinimum: weeklyMvpaEquivalent >= WHO_WEEKLY_MODERATE_MIN,
    rows,
  };
}
