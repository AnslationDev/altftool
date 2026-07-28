/**
 * Energy cost of looking after young children.
 *
 * Method (the standard metabolic-equivalent approach):
 *   VO2 (mL/kg/min) = MET x 3.5
 *   kcal/min        = VO2 x kg / 1000 x 5 kcal per litre of oxygen
 *                   = MET x 3.5 x kg / 200
 *
 * MET values come from Ainsworth BE et al., "2011 Compendium of Physical Activities:
 * a second update of codes and MET values", Med Sci Sports Exerc 2011;43(8):1575-1581,
 * major heading 05 (Home Activities, including the child-care entries) and major
 * heading 17 (Walking) for pushing a pram.
 *
 * IMPORTANT METHOD NOTE: the compendium's play entries are explicitly defined for
 * "only active periods". An hour on the floor with a toddler is not an hour of
 * 3.5 MET activity — a good part of it is sitting or standing supervision. This module
 * therefore takes an active-fraction input and credits the remainder of play time at
 * the standing-quietly value of 1.3 METs, rather than pretending the whole session was
 * active. That correction usually lowers the answer, which is the point.
 */

/** Oxygen uptake of one metabolic equivalent, mL O2 per kg per minute. */
export const ML_O2_PER_MET = 3.5;
/** Caloric equivalent of oxygen used throughout the compendium, kcal per litre. */
export const KCAL_PER_LITRE_O2 = 5;
/** 1 pound = 0.45359237 kg exactly. */
export const KG_PER_LB = 0.45359237;
/** Compendium 07040: standing quietly. Used for the non-active part of play time. */
export const SUPERVISING_MET = 1.3;
/** 365.25 days / 7 — average weeks in a calendar year. */
export const WEEKS_PER_YEAR = 365.25 / 7;

export const WEIGHT_MIN_KG = 20;
export const WEIGHT_MAX_KG = 300;
export const STAGE_MAX_MIN = 720;
export const DAY_MAX_MIN = 1440;
export const DAYS_PER_WEEK_MAX = 7;

/**
 * Child-care activities. `activeFractionApplies` marks the entries the compendium
 * defines for active periods only.
 */
export const CARE_ACTIVITIES = [
  {
    id: "seatedCare",
    label: "Seated or kneeling care — feeding, dressing, nappy changes",
    met: 2.0,
    code: "05175",
    source:
      "Child care: sitting or kneeling (dressing, bathing, grooming, feeding, occasional lifting), light effort",
    activeFractionApplies: false,
  },
  {
    id: "standingCare",
    label: "Standing care — bathing, dressing, clearing up after them",
    met: 3.0,
    code: "05181",
    source: "Child care: standing (dressing, bathing, grooming, feeding), moderate effort",
    activeFractionApplies: false,
  },
  {
    id: "chores",
    label: "Housework with a toddler in tow",
    met: 3.5,
    code: "05171",
    source: "Multiple household tasks all at once, moderate effort",
    activeFractionApplies: false,
  },
  {
    id: "pram",
    label: "Walking while pushing a pram or pushchair",
    met: 4.0,
    code: "17250",
    source: "Pushing a stroller or walking with children, 2.5 to 3 mph",
    activeFractionApplies: false,
  },
  {
    id: "playModerate",
    label: "Active play — walking, lifting, floor games",
    met: 3.5,
    code: "05190",
    source: "Walking or running while playing with children, moderate effort, active periods only",
    activeFractionApplies: true,
  },
  {
    id: "playVigorous",
    label: "Vigorous play — chasing, tag, carrying them about",
    met: 5.8,
    code: "05191",
    source: "Walking or running while playing with children, vigorous effort, active periods only",
    activeFractionApplies: true,
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

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
 * Energy cost of a day of child care, projected across the week and the year.
 *
 * @param {object} input
 * @param {number} input.weight
 * @param {"kg"|"lb"} [input.weightUnit]
 * @param {Record<string, number>} input.minutes Minutes per activity id from CARE_ACTIVITIES.
 * @param {number} input.activePercent           Share of play time that is genuinely active, 0-100.
 * @param {number} input.daysPerWeek             Days a week you do this much care.
 * @returns {object} Energy figures, or { error }.
 */
export function computeChildcareCalories({
  weight,
  weightUnit = "kg",
  minutes = {},
  activePercent = 60,
  daysPerWeek,
}) {
  const weightKg = toKilograms(weight, weightUnit);
  if (weightKg === null) return { error: "Enter your body weight." };
  if (weightKg < WEIGHT_MIN_KG || weightKg > WEIGHT_MAX_KG) {
    return { error: `Body weight should be between ${WEIGHT_MIN_KG} and ${WEIGHT_MAX_KG} kg.` };
  }

  if (!isNum(activePercent)) return { error: "Enter the active share of play time as a percentage." };
  if (activePercent < 0 || activePercent > 100) {
    return { error: "The active share of play time must be between 0% and 100%." };
  }

  if (!isNum(daysPerWeek)) return { error: "Enter how many days a week you do this much care." };
  if (daysPerWeek <= 0) return { error: "Enter at least one day per week." };
  if (daysPerWeek > DAYS_PER_WEEK_MAX) return { error: "There are only 7 days in a week." };

  const activeShare = activePercent / 100;
  const supervisingPerMin = kcalPerMinute(SUPERVISING_MET, weightKg);

  const rows = [];
  let dayMinutes = 0;
  let dayKcal = 0;

  for (const activity of CARE_ACTIVITIES) {
    const raw = minutes[activity.id];
    const value = raw === undefined || raw === null || raw === "" ? 0 : raw;
    if (!isNum(value)) return { error: `Enter a number of minutes for "${activity.label}".` };
    if (value < 0) return { error: "Minutes cannot be negative." };
    if (value > STAGE_MAX_MIN) {
      return { error: `No single care activity can be longer than ${STAGE_MAX_MIN} minutes a day.` };
    }
    if (value === 0) continue;

    const activeMinutes = activity.activeFractionApplies ? value * activeShare : value;
    const supervisingMinutes = value - activeMinutes;
    const perMin = kcalPerMinute(activity.met, weightKg);
    const kcal = perMin * activeMinutes + supervisingPerMin * supervisingMinutes;

    dayMinutes += value;
    dayKcal += kcal;
    rows.push({
      id: activity.id,
      label: activity.label,
      met: activity.met,
      code: activity.code,
      minutes: value,
      activeMinutes,
      supervisingMinutes,
      kcal,
      effectiveMet: kcal / (kcalPerMinute(1, weightKg) * value),
    });
  }

  if (dayMinutes <= 0) return { error: "Add some minutes to at least one care activity." };
  if (dayMinutes > DAY_MAX_MIN) {
    return { error: `A single day cannot contain more than ${DAY_MAX_MIN} minutes.` };
  }

  const restingPerMin = kcalPerMinute(1, weightKg);
  const dayRestingKcal = restingPerMin * dayMinutes;
  const dayNetKcal = Math.max(0, dayKcal - dayRestingKcal);
  const averageMet = dayKcal / dayRestingKcal;

  const weekKcal = dayKcal * daysPerWeek;
  const weekNetKcal = dayNetKcal * daysPerWeek;

  return {
    weightKg,
    activePercent,
    daysPerWeek,
    dayMinutes,
    dayKcal,
    dayNetKcal,
    dayRestingKcal,
    averageMet,
    kcalPerMin: dayKcal / dayMinutes,
    weekMinutes: dayMinutes * daysPerWeek,
    weekKcal,
    weekNetKcal,
    yearKcal: weekKcal * WEEKS_PER_YEAR,
    yearNetKcal: weekNetKcal * WEEKS_PER_YEAR,
    rows,
  };
}
