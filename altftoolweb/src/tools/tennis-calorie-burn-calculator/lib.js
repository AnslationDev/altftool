/**
 * Tennis calorie burn maths.
 *
 * Energy model: the ACSM metabolic equivalent (MET) equation behind the
 * Compendium of Physical Activities (Ainsworth et al., 2011):
 *
 *   kcal / minute = MET x 3.5 x body weight in kg / 200
 *
 * All four MET values below are published Compendium entries, so nothing here is
 * interpolated:
 *   code 15675  tennis, general                                      = 7.3 MET
 *   code 15670  tennis, singles                                      = 8.0 MET
 *   code 15660  tennis, doubles                                      = 6.0 MET
 *   code 15665  tennis, hitting balls, non-game play, moderate effort = 5.0 MET
 */

export const ML_O2_PER_MET = 3.5;
export const KCAL_DIVISOR = 200;
export const LB_PER_KG = 2.20462262185;

export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 400;
export const MAX_SETS = 7;
export const MAX_MINUTES_PER_SET = 180;

export const TENNIS_FORMATS = [
  { id: "singles", label: "Singles match", met: 8.0, code: "15670 tennis, singles" },
  { id: "doubles", label: "Doubles match", met: 6.0, code: "15660 tennis, doubles" },
  { id: "general", label: "General play (mixed singles and doubles)", met: 7.3, code: "15675 tennis, general" },
  {
    id: "hitting",
    label: "Hitting / drills, non-game play",
    met: 5.0,
    code: "15665 tennis, hitting balls, non-game play, moderate effort",
  },
];

export function findFormat(id) {
  return TENNIS_FORMATS.find((format) => format.id === id) || null;
}

export function toKilograms(value, unit) {
  const raw = Number(String(value).replace(/,/g, "").trim());
  if (!Number.isFinite(raw)) return NaN;
  return unit === "lb" ? raw / LB_PER_KG : raw;
}

export function kcalPerMinute(met, weightKg) {
  return (met * ML_O2_PER_MET * weightKg) / KCAL_DIVISOR;
}

/**
 * @returns {{error:string}|object} plain object, never NaN or Infinity.
 */
export function computeTennisCalories({ weightKg, sets, minutesPerSet, formatId }) {
  const weight = Number(weightKg);
  const setCount = Number(sets);
  const perSet = Number(minutesPerSet);

  if (!Number.isFinite(weight) || !Number.isFinite(setCount) || !Number.isFinite(perSet)) {
    return { error: "Enter a valid body weight, number of sets and minutes per set." };
  }
  if (weight < MIN_WEIGHT_KG || weight > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }
  if (setCount <= 0) return { error: "Play at least one set." };
  if (setCount > MAX_SETS) return { error: `A match rarely runs past ${MAX_SETS} sets.` };
  if (perSet <= 0) return { error: "Minutes per set must be more than zero." };
  if (perSet > MAX_MINUTES_PER_SET) {
    return { error: `A single set over ${MAX_MINUTES_PER_SET} minutes is outside this calculator's range.` };
  }

  const format = findFormat(formatId);
  if (!format) return { error: "Choose singles, doubles, general play or drills." };

  const rate = kcalPerMinute(format.met, weight);
  const totalMinutes = setCount * perSet;
  const totalKcal = rate * totalMinutes;
  const kcalPerSet = rate * perSet;
  // Net burn removes the 1 MET of resting metabolism spent over the same period.
  const netKcal = Math.max(0, totalKcal - kcalPerMinute(1, weight) * totalMinutes);

  return {
    formatLabel: format.label,
    met: format.met,
    code: format.code,
    weightKg: weight,
    sets: setCount,
    minutesPerSet: perSet,
    totalMinutes,
    rate,
    kcalPerSet,
    totalKcal,
    netKcal,
    kcalPerHour: rate * 60,
  };
}

/** Same weight and court time, priced across every format — used for the comparison table. */
export function compareFormats({ weightKg, totalMinutes }) {
  const weight = Number(weightKg);
  const minutes = Number(totalMinutes);
  if (!Number.isFinite(weight) || !Number.isFinite(minutes) || weight <= 0 || minutes <= 0) {
    return [];
  }
  return TENNIS_FORMATS.map((format) => ({
    id: format.id,
    label: format.label,
    met: format.met,
    kcal: kcalPerMinute(format.met, weight) * minutes,
  }));
}
