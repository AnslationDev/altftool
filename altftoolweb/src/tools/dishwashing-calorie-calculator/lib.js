/**
 * Dishwashing energy cost.
 *
 * Uses the metabolic-equivalent (MET) method, the standard way low-intensity daily
 * tasks are priced in physical-activity research:
 *
 *   VO2 (mL/kg/min) = MET x 3.5
 *   kcal/min        = VO2 x kg / 1000 x 5 kcal per litre of oxygen
 *                   = MET x 3.5 x kg / 200
 *
 * MET values are the published home-activity values from Ainsworth BE et al.,
 * "2011 Compendium of Physical Activities: a second update of codes and MET values",
 * Med Sci Sports Exerc 2011;43(8):1575-1581 (major heading 05, Home Activities).
 * Nothing is scaled or invented; where the compendium has no separate entry for a
 * modern task (loading a dishwasher) the closest published entry is used and named.
 *
 * The projection to a week and a year multiplies the per-session figure by the number
 * of washes, and the fat equivalent uses the classic 7,700 kcal per kilogram of
 * adipose tissue (Wishnofsky M, "Caloric equivalents of gained or lost weight",
 * Am J Clin Nutr 1958;6(5):542-546, originally stated as 3,500 kcal per pound).
 */

/** Oxygen uptake of one metabolic equivalent, mL O2 per kg per minute. */
export const ML_O2_PER_MET = 3.5;
/** Caloric equivalent of oxygen used throughout the compendium, kcal per litre. */
export const KCAL_PER_LITRE_O2 = 5;
/** 1 pound = 0.45359237 kg exactly. */
export const KG_PER_LB = 0.45359237;
/** Wishnofsky 1958: 3,500 kcal per pound of body fat = 7,700 kcal per kilogram. */
export const KCAL_PER_KG_BODY_FAT = 7700;
/** 365.25 days / 7 — average weeks in a calendar year including leap years. */
export const WEEKS_PER_YEAR = 365.25 / 7;

export const WEIGHT_MIN_KG = 20;
export const WEIGHT_MAX_KG = 300;
export const MINUTES_MAX = 240;
export const SESSIONS_MAX = 12;
export const DAYS_PER_WEEK_MAX = 7;

/** Washing-up styles and the compendium entry each MET value comes from. */
export const WASH_METHODS = [
  {
    id: "sink",
    label: "Hand washing at the sink, standing",
    met: 1.8,
    code: "05052",
    source: "Washing dishes, standing",
  },
  {
    id: "clearing",
    label: "Washing plus clearing the table, walking back and forth",
    met: 2.5,
    code: "05053",
    source: "Washing dishes and clearing dishes from the table, walking, light effort",
  },
  {
    id: "scrubbing",
    label: "Heavy scrubbing — pots, pans and burnt-on utensils",
    met: 3.3,
    code: "05050",
    source: "Kitchen activity, general (cooking, washing dishes, cleaning up), moderate effort",
  },
  {
    id: "dishwasher",
    label: "Loading and unloading a dishwasher",
    met: 2.5,
    code: "05053",
    source:
      "No dedicated compendium code exists, so the clearing-dishes-while-walking entry is used",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Look up a washing-up method by id. */
export function findWashMethod(id) {
  return WASH_METHODS.find((method) => method.id === id) ?? null;
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
 * Energy cost of washing up, projected across the week and the year.
 *
 * @param {object} input
 * @param {number} input.weight
 * @param {"kg"|"lb"} [input.weightUnit]
 * @param {string} input.method            Id from WASH_METHODS.
 * @param {number} input.minutesPerSession Minutes at the sink per wash.
 * @param {number} input.sessionsPerDay    Washes on a day you wash up.
 * @param {number} input.daysPerWeek       Days per week you wash up.
 * @returns {object} Energy figures, or { error }.
 */
export function computeDishwashingCalories({
  weight,
  weightUnit = "kg",
  method = "sink",
  minutesPerSession,
  sessionsPerDay,
  daysPerWeek,
}) {
  const activity = findWashMethod(method);
  if (!activity) return { error: "Choose how you wash up." };

  const weightKg = toKilograms(weight, weightUnit);
  if (weightKg === null) return { error: "Enter your body weight." };
  if (weightKg < WEIGHT_MIN_KG || weightKg > WEIGHT_MAX_KG) {
    return { error: `Body weight should be between ${WEIGHT_MIN_KG} and ${WEIGHT_MAX_KG} kg.` };
  }

  if (!isNum(minutesPerSession)) return { error: "Enter how many minutes one wash takes." };
  if (minutesPerSession <= 0) return { error: "Minutes per wash must be greater than zero." };
  if (minutesPerSession > MINUTES_MAX) {
    return { error: `A single wash longer than ${MINUTES_MAX} minutes is outside this calculator's range.` };
  }

  if (!isNum(sessionsPerDay)) return { error: "Enter how many washes you do in a day." };
  if (sessionsPerDay <= 0) return { error: "You need at least one wash per day." };
  if (sessionsPerDay > SESSIONS_MAX) {
    return { error: `More than ${SESSIONS_MAX} washes a day is outside this calculator's range.` };
  }

  if (!isNum(daysPerWeek)) return { error: "Enter how many days a week you wash up." };
  if (daysPerWeek <= 0) return { error: "Enter at least one day per week." };
  if (daysPerWeek > DAYS_PER_WEEK_MAX) {
    return { error: "There are only 7 days in a week." };
  }

  const grossPerMin = kcalPerMinute(activity.met, weightKg);
  const restingPerMin = kcalPerMinute(1, weightKg);
  const netPerMin = Math.max(0, grossPerMin - restingPerMin);

  const sessionMinutes = minutesPerSession;
  const dayMinutes = sessionMinutes * sessionsPerDay;
  const weekMinutes = dayMinutes * daysPerWeek;
  const yearMinutes = weekMinutes * WEEKS_PER_YEAR;

  const sessionKcal = grossPerMin * sessionMinutes;
  const dayKcal = grossPerMin * dayMinutes;
  const weekKcal = grossPerMin * weekMinutes;
  const yearKcal = grossPerMin * yearMinutes;

  const sessionNetKcal = netPerMin * sessionMinutes;
  const dayNetKcal = netPerMin * dayMinutes;
  const weekNetKcal = netPerMin * weekMinutes;
  const yearNetKcal = netPerMin * yearMinutes;

  const daysToBurnKgFat = dayNetKcal > 0 ? KCAL_PER_KG_BODY_FAT / dayNetKcal : null;

  return {
    weightKg,
    method: activity,
    grossPerMin,
    netPerMin,
    sessionMinutes,
    dayMinutes,
    weekMinutes,
    yearMinutes,
    sessionKcal,
    dayKcal,
    weekKcal,
    yearKcal,
    sessionNetKcal,
    dayNetKcal,
    weekNetKcal,
    yearNetKcal,
    daysToBurnKgFat,
  };
}
