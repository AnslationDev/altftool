/**
 * Cooking and kitchen-work energy cost.
 *
 * Every figure here comes from the metabolic-equivalent (MET) method, which is the
 * standard way physical-activity epidemiology prices low-intensity daily tasks:
 *
 *   VO2 (mL/kg/min) = MET x 3.5
 *   kcal/min        = VO2 x body mass (kg) / 1000 x 5 kcal per litre of oxygen
 *                   = MET x 3.5 x kg / 200
 *
 * The MET values are the published compendium values for home/kitchen activities
 * (Ainsworth BE et al., "2011 Compendium of Physical Activities: a second update of
 * codes and MET values", Med Sci Sports Exerc 2011;43(8):1575-1581, major heading 05
 * "Home Activities"). Nothing here is scaled, boosted or invented.
 *
 * A MET of 1 is resting metabolism, so the extra energy a task costs above simply
 * sitting still is (MET - 1) x 3.5 x kg / 200 per minute. Both the gross figure and
 * that net figure are returned, because only the net number is genuinely "burned by
 * cooking" — the gross number includes calories you would have spent anyway.
 */

/** Oxygen uptake of one metabolic equivalent, mL O2 per kg per minute. */
export const ML_O2_PER_MET = 3.5;
/** Caloric equivalent of oxygen used throughout the compendium, kcal per litre. */
export const KCAL_PER_LITRE_O2 = 5;
/** 1 pound = 0.45359237 kg exactly (international avoirdupois pound). */
export const KG_PER_LB = 0.45359237;
/** Compendium 17200: walking 2.8-3.2 mph, level, moderate pace. Used for the comparison line. */
export const BRISK_WALK_MET = 3.5;

export const WEIGHT_MIN_KG = 20;
export const WEIGHT_MAX_KG = 300;
/** No single kitchen stage in one sitting is treated as longer than 10 hours. */
export const STAGE_MAX_MIN = 600;
/** Total kitchen time is capped at one full day. */
export const TOTAL_MAX_MIN = 1440;

/**
 * Kitchen stages with their compendium MET values.
 * `code` is the 2011 Compendium activity code the value is taken from.
 */
export const COOKING_STAGES = [
  {
    id: "prep",
    label: "Prep and chopping (standing or sitting)",
    met: 2.0,
    code: "05040",
    source: "Cooking or food preparation, standing or sitting, manual appliances, light effort",
  },
  {
    id: "stove",
    label: "Active cooking, moving between stove, fridge and counter",
    met: 2.5,
    code: "05041",
    source: "Cooking or food preparation, walking",
  },
  {
    id: "dough",
    label: "Kneading, rolling rotis or cooking on an open stove",
    met: 3.0,
    code: "05046",
    source: "Cooking Indian bread on an outside stove",
  },
  {
    id: "fullKitchen",
    label: "Full kitchen mode — cooking, washing and tidying together",
    met: 3.3,
    code: "05050",
    source: "Kitchen activity, general (cooking, washing dishes, cleaning up), moderate effort",
  },
  {
    id: "serving",
    label: "Serving food and setting the table",
    met: 2.5,
    code: "05042",
    source: "Serving food, setting table, implied walking or standing",
  },
  {
    id: "washup",
    label: "Washing up afterwards (standing at the sink)",
    met: 1.8,
    code: "05052",
    source: "Washing dishes, standing",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Convert a body weight given in kg or lb to kilograms. */
export function toKilograms(weight, unit) {
  if (!isNum(weight)) return null;
  return unit === "lb" ? weight * KG_PER_LB : weight;
}

/** kcal per minute for a given MET value and body mass. */
export function kcalPerMinute(met, weightKg) {
  if (!isNum(met) || !isNum(weightKg)) return null;
  return (met * ML_O2_PER_MET * weightKg) / 1000 * KCAL_PER_LITRE_O2;
}

/**
 * Energy cost of a cooking session built from one or more kitchen stages.
 *
 * @param {object} input
 * @param {number} input.weight              Body weight.
 * @param {"kg"|"lb"} [input.weightUnit]     Unit of `weight`.
 * @param {Record<string, number>} input.minutes  Minutes per stage id from COOKING_STAGES.
 * @returns {object} Energy figures, or { error } describing what is wrong.
 */
export function computeCookingCalories({ weight, weightUnit = "kg", minutes = {} }) {
  const weightKg = toKilograms(weight, weightUnit);
  if (weightKg === null) return { error: "Enter your body weight." };
  if (weightKg < WEIGHT_MIN_KG || weightKg > WEIGHT_MAX_KG) {
    if (weightUnit === "lb") {
      const minLb = Math.round(WEIGHT_MIN_KG / KG_PER_LB);
      const maxLb = Math.round(WEIGHT_MAX_KG / KG_PER_LB);
      return { error: `Body weight should be between ${minLb} and ${maxLb} lb.` };
    }
    return { error: `Body weight should be between ${WEIGHT_MIN_KG} and ${WEIGHT_MAX_KG} kg.` };
  }

  const rows = [];
  let totalMinutes = 0;
  let grossKcal = 0;

  for (const stage of COOKING_STAGES) {
    const raw = minutes[stage.id];
    const value = raw === undefined || raw === null || raw === "" ? 0 : raw;
    if (!isNum(value)) return { error: `Enter a number of minutes for "${stage.label}".` };
    if (value < 0) return { error: "Minutes cannot be negative." };
    if (value > STAGE_MAX_MIN) {
      return { error: `No single kitchen stage can be longer than ${STAGE_MAX_MIN} minutes.` };
    }
    if (value === 0) continue;

    const perMin = kcalPerMinute(stage.met, weightKg);
    const kcal = perMin * value;
    totalMinutes += value;
    grossKcal += kcal;
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

  if (totalMinutes <= 0) {
    return { error: "Add some minutes to at least one kitchen stage." };
  }
  if (totalMinutes > TOTAL_MAX_MIN) {
    return { error: `Total kitchen time cannot exceed ${TOTAL_MAX_MIN} minutes in one day.` };
  }

  const restingPerMin = kcalPerMinute(1, weightKg);
  const restingKcal = restingPerMin * totalMinutes;
  const netKcal = Math.max(0, grossKcal - restingKcal);
  const averageMet = grossKcal / restingKcal;
  const briskWalkPerMin = kcalPerMinute(BRISK_WALK_MET, weightKg);
  const briskWalkMinutes = briskWalkPerMin > 0 ? grossKcal / briskWalkPerMin : 0;

  return {
    weightKg,
    totalMinutes,
    grossKcal,
    netKcal,
    restingKcal,
    averageMet,
    kcalPerMin: grossKcal / totalMinutes,
    briskWalkMinutes,
    rows,
  };
}
