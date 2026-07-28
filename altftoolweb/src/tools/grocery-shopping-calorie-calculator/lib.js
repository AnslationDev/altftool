/**
 * Energy cost of a grocery trip, from door to unpacked shopping.
 *
 * A shopping trip is four different activities stitched together: the walk there, the
 * time pushing a trolley around the aisles, the walk home carrying the load, and
 * putting everything away. Each has its own published MET value, so each is priced
 * separately here.
 *
 * Method (the standard metabolic-equivalent approach):
 *   VO2 (mL/kg/min) = MET x 3.5
 *   kcal/min        = VO2 x kg / 1000 x 5 kcal per litre of oxygen
 *                   = MET x 3.5 x kg / 200
 *
 * MET values come from Ainsworth BE et al., "2011 Compendium of Physical Activities:
 * a second update of codes and MET values", Med Sci Sports Exerc 2011;43(8):1575-1581 —
 * major heading 05 (Home Activities) for the shopping and carrying entries and major
 * heading 17 (Walking) for the walking paces.
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
/** WHO: moderate-intensity activity starts at 3.0 METs. */
export const MODERATE_MET_FLOOR = 3.0;
/** 365.25 days / 7 — average weeks in a calendar year. */
export const WEEKS_PER_YEAR = 365.25 / 7;

export const WEIGHT_MIN_KG = 20;
export const WEIGHT_MAX_KG = 300;
export const STAGE_MAX_MIN = 240;
export const TRIP_MAX_MIN = 480;
export const TRIPS_PER_WEEK_MAX = 21;

/** Walking paces on the way to the shop (compendium major heading 17, Walking). */
export const WALK_PACES = [
  { id: "slow", label: "Strolling, about 2.0 mph / 3.2 kmph", met: 2.8, code: "17152" },
  { id: "easy", label: "Easy pace, about 2.5 mph / 4.0 kmph", met: 3.0, code: "17170" },
  { id: "moderate", label: "Moderate pace, about 3.0 mph / 4.8 kmph", met: 3.5, code: "17190" },
  { id: "brisk", label: "Brisk pace, about 3.5 mph / 5.6 kmph", met: 4.3, code: "17200" },
];

/**
 * The fixed stages of a shopping trip. The outbound walk is not listed here because
 * its MET value depends on the pace the user selects.
 */
export const TRIP_STAGES = [
  {
    id: "inStore",
    label: "In the shop, browsing and pushing a trolley",
    met: 2.3,
    code: "05048",
    source: "Food shopping with or without a grocery cart, standing or walking",
  },
  {
    id: "carryHome",
    label: "Walking home carrying the bags",
    met: 5.0,
    code: "17270",
    source: "Walking while carrying a load of about 15 lb, level ground",
  },
  {
    id: "stairs",
    label: "Carrying shopping up the stairs",
    met: 7.5,
    code: "05045",
    source: "Carrying groceries upstairs",
  },
  {
    id: "putAway",
    label: "Unpacking and putting the shopping away",
    met: 2.5,
    code: "05044",
    source: "Putting away groceries, carrying packages",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Look up a walking pace by id. */
export function findWalkPace(id) {
  return WALK_PACES.find((pace) => pace.id === id) ?? null;
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
 * Energy cost of one grocery trip, projected across the week and the year.
 *
 * @param {object} input
 * @param {number} input.weight
 * @param {"kg"|"lb"} [input.weightUnit]
 * @param {string} input.walkPace                Id from WALK_PACES.
 * @param {number} input.walkToStoreMinutes      Minutes walking to the shop.
 * @param {Record<string, number>} input.minutes Minutes per stage id from TRIP_STAGES.
 * @param {number} input.tripsPerWeek            Shopping trips in a typical week.
 * @returns {object} Energy figures, or { error }.
 */
export function computeGroceryCalories({
  weight,
  weightUnit = "kg",
  walkPace = "moderate",
  walkToStoreMinutes,
  minutes = {},
  tripsPerWeek,
}) {
  const pace = findWalkPace(walkPace);
  if (!pace) return { error: "Choose the pace you walk to the shop." };

  const weightKg = toKilograms(weight, weightUnit);
  if (weightKg === null) return { error: "Enter your body weight." };
  if (weightKg < WEIGHT_MIN_KG || weightKg > WEIGHT_MAX_KG) {
    return { error: `Body weight should be between ${WEIGHT_MIN_KG} and ${WEIGHT_MAX_KG} kg.` };
  }

  if (!isNum(tripsPerWeek)) return { error: "Enter how many shopping trips you make a week." };
  if (tripsPerWeek <= 0) return { error: "Enter at least one shopping trip per week." };
  if (tripsPerWeek > TRIPS_PER_WEEK_MAX) {
    return { error: `More than ${TRIPS_PER_WEEK_MAX} trips a week is outside this calculator's range.` };
  }

  const entries = [
    {
      id: "walkToStore",
      label: `Walking to the shop — ${pace.label}`,
      met: pace.met,
      code: pace.code,
      raw: walkToStoreMinutes,
    },
    ...TRIP_STAGES.map((stage) => ({
      id: stage.id,
      label: stage.label,
      met: stage.met,
      code: stage.code,
      raw: minutes[stage.id],
    })),
  ];

  const rows = [];
  let tripMinutes = 0;
  let tripKcal = 0;
  let metMinutes = 0;
  let moderateOrAboveMinutes = 0;

  for (const entry of entries) {
    const value = entry.raw === undefined || entry.raw === null || entry.raw === "" ? 0 : entry.raw;
    if (!isNum(value)) return { error: `Enter a number of minutes for "${entry.label}".` };
    if (value < 0) return { error: "Minutes cannot be negative." };
    if (value > STAGE_MAX_MIN) {
      return { error: `No single part of a trip can be longer than ${STAGE_MAX_MIN} minutes.` };
    }
    if (value === 0) continue;

    const perMin = kcalPerMinute(entry.met, weightKg);
    const kcal = perMin * value;
    tripMinutes += value;
    tripKcal += kcal;
    metMinutes += entry.met * value;
    if (entry.met >= MODERATE_MET_FLOOR) moderateOrAboveMinutes += value;

    rows.push({
      id: entry.id,
      label: entry.label,
      met: entry.met,
      code: entry.code,
      minutes: value,
      kcalPerMin: perMin,
      kcal,
    });
  }

  if (tripMinutes <= 0) return { error: "Add some minutes to at least one part of the trip." };
  if (tripMinutes > TRIP_MAX_MIN) {
    return { error: `A single shopping trip cannot exceed ${TRIP_MAX_MIN} minutes here.` };
  }

  const restingPerMin = kcalPerMinute(1, weightKg);
  const tripRestingKcal = restingPerMin * tripMinutes;
  const tripNetKcal = Math.max(0, tripKcal - tripRestingKcal);
  const averageMet = tripKcal / tripRestingKcal;

  const weekKcal = tripKcal * tripsPerWeek;
  const weekNetKcal = tripNetKcal * tripsPerWeek;

  return {
    weightKg,
    pace,
    tripsPerWeek,
    tripMinutes,
    tripKcal,
    tripNetKcal,
    tripRestingKcal,
    averageMet,
    kcalPerMin: tripKcal / tripMinutes,
    metMinutes,
    moderateOrAboveMinutes,
    weekMinutes: tripMinutes * tripsPerWeek,
    weekKcal,
    weekNetKcal,
    weekMetMinutes: metMinutes * tripsPerWeek,
    weekModerateMinutes: moderateOrAboveMinutes * tripsPerWeek,
    yearKcal: weekKcal * WEEKS_PER_YEAR,
    yearNetKcal: weekNetKcal * WEEKS_PER_YEAR,
    rows,
  };
}
