/**
 * Laundry-day energy cost.
 *
 * Laundry is not one activity: hand-scrubbing clothes is roughly twice the intensity
 * of folding them, and carrying a full basket upstairs is several times either. This
 * module therefore prices each stage separately with its own published MET value and
 * adds them up.
 *
 * Method (the metabolic-equivalent method used throughout physical-activity research):
 *   VO2 (mL/kg/min) = MET x 3.5
 *   kcal/min        = VO2 x kg / 1000 x 5 kcal per litre of oxygen
 *                   = MET x 3.5 x kg / 200
 *
 * MET values are the published home-activity values from Ainsworth BE et al.,
 * "2011 Compendium of Physical Activities: a second update of codes and MET values",
 * Med Sci Sports Exerc 2011;43(8):1575-1581 (major heading 05, Home Activities).
 */

/** Oxygen uptake of one metabolic equivalent, mL O2 per kg per minute. */
export const ML_O2_PER_MET = 3.5;
/** Caloric equivalent of oxygen used throughout the compendium, kcal per litre. */
export const KCAL_PER_LITRE_O2 = 5;
/** 1 pound = 0.45359237 kg exactly. */
export const KG_PER_LB = 0.45359237;
/** 365.25 days / 12 months / 7 days — average weeks in a calendar month. */
export const WEEKS_PER_MONTH = 365.25 / 12 / 7;
/** 365.25 days / 7 — average weeks in a calendar year. */
export const WEEKS_PER_YEAR = 365.25 / 7;

export const WEIGHT_MIN_KG = 20;
export const WEIGHT_MAX_KG = 300;
export const STAGE_MAX_MIN = 300;
export const SESSION_MAX_MIN = 600;
export const LAUNDRY_DAYS_MAX = 7;

/** Laundry stages with the compendium entry each MET value is taken from. */
export const LAUNDRY_STAGES = [
  {
    id: "sorting",
    label: "Sorting and loading the washing machine",
    met: 2.0,
    code: "05060",
    source:
      "Laundry: fold or hang clothes, put clothes in washer or dryer, implied walking, light effort",
  },
  {
    id: "handwash",
    label: "Hand washing and scrubbing clothes",
    met: 4.0,
    code: "05065",
    source: "Laundry: hanging wash, washing clothes by hand, moderate effort",
  },
  {
    id: "hanging",
    label: "Hanging wash out on the line",
    met: 4.0,
    code: "05065",
    source: "Laundry: hanging wash, washing clothes by hand, moderate effort",
  },
  {
    id: "folding",
    label: "Folding and putting clothes away",
    met: 2.0,
    code: "05060",
    source: "Laundry: fold or hang clothes, implied walking, light effort",
  },
  {
    id: "ironing",
    label: "Ironing, standing",
    met: 1.8,
    code: "05185",
    source: "Ironing",
  },
  {
    id: "linens",
    label: "Stripping and changing bed linen",
    met: 3.3,
    code: "05070",
    source: "Making bed, changing linens",
  },
  {
    id: "stairs",
    label: "Carrying laundry baskets up the stairs",
    met: 7.5,
    code: "05045",
    source: "Carrying groceries upstairs — the compendium's stair-carrying entry",
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
 * Energy cost of a laundry day, projected across the week, month and year.
 *
 * @param {object} input
 * @param {number} input.weight
 * @param {"kg"|"lb"} [input.weightUnit]
 * @param {Record<string, number>} input.minutes  Minutes per stage id from LAUNDRY_STAGES.
 * @param {number} input.laundryDaysPerWeek       Laundry days in a typical week.
 * @returns {object} Energy figures, or { error }.
 */
export function computeLaundryCalories({
  weight,
  weightUnit = "kg",
  minutes = {},
  laundryDaysPerWeek,
}) {
  const weightKg = toKilograms(weight, weightUnit);
  if (weightKg === null) return { error: "Enter your body weight." };
  if (weightKg < WEIGHT_MIN_KG || weightKg > WEIGHT_MAX_KG) {
    return { error: `Body weight should be between ${WEIGHT_MIN_KG} and ${WEIGHT_MAX_KG} kg.` };
  }

  if (!isNum(laundryDaysPerWeek)) return { error: "Enter how many laundry days you have per week." };
  if (laundryDaysPerWeek <= 0) return { error: "Enter at least one laundry day per week." };
  if (laundryDaysPerWeek > LAUNDRY_DAYS_MAX) {
    return { error: "There are only 7 days in a week." };
  }

  const rows = [];
  let sessionMinutes = 0;
  let sessionKcal = 0;

  for (const stage of LAUNDRY_STAGES) {
    const raw = minutes[stage.id];
    const value = raw === undefined || raw === null || raw === "" ? 0 : raw;
    if (!isNum(value)) return { error: `Enter a number of minutes for "${stage.label}".` };
    if (value < 0) return { error: "Minutes cannot be negative." };
    if (value > STAGE_MAX_MIN) {
      return { error: `No single laundry stage can be longer than ${STAGE_MAX_MIN} minutes.` };
    }
    if (value === 0) continue;

    const perMin = kcalPerMinute(stage.met, weightKg);
    const kcal = perMin * value;
    sessionMinutes += value;
    sessionKcal += kcal;
    rows.push({
      id: stage.id,
      label: stage.label,
      met: stage.met,
      code: stage.code,
      minutes: value,
      kcalPerMin: perMin,
      kcal,
    });
  }

  if (sessionMinutes <= 0) return { error: "Add some minutes to at least one laundry stage." };
  if (sessionMinutes > SESSION_MAX_MIN) {
    return { error: `A single laundry day cannot exceed ${SESSION_MAX_MIN} minutes here.` };
  }

  const restingPerMin = kcalPerMinute(1, weightKg);
  const sessionRestingKcal = restingPerMin * sessionMinutes;
  const sessionNetKcal = Math.max(0, sessionKcal - sessionRestingKcal);
  const averageMet = sessionKcal / sessionRestingKcal;

  const weekKcal = sessionKcal * laundryDaysPerWeek;
  const weekNetKcal = sessionNetKcal * laundryDaysPerWeek;
  const weekMinutes = sessionMinutes * laundryDaysPerWeek;

  return {
    weightKg,
    laundryDaysPerWeek,
    sessionMinutes,
    sessionKcal,
    sessionNetKcal,
    sessionRestingKcal,
    averageMet,
    kcalPerMin: sessionKcal / sessionMinutes,
    weekMinutes,
    weekKcal,
    weekNetKcal,
    monthKcal: weekKcal * WEEKS_PER_MONTH,
    monthNetKcal: weekNetKcal * WEEKS_PER_MONTH,
    yearKcal: weekKcal * WEEKS_PER_YEAR,
    yearNetKcal: weekNetKcal * WEEKS_PER_YEAR,
    rows,
  };
}
