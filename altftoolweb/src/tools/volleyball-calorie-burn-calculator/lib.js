/**
 * Volleyball calorie burn maths.
 *
 * Energy model: the ACSM metabolic equivalent (MET) equation behind the
 * Compendium of Physical Activities (Ainsworth et al., 2011):
 *
 *   kcal / minute = MET x 3.5 x body weight in kg / 200
 *
 * All three playing values are published Compendium entries:
 *   code 15720  volleyball, beach, in sand                              = 8.0 MET
 *   code 15710  volleyball, competitive, in gymnasium                   = 6.0 MET
 *   code 15711  volleyball, non-competitive, 6-9 member team, general   = 3.0 MET
 *   code 07021  standing quietly / in a line                            = 1.3 MET (between sets)
 *
 * Sand play is rated highest because every step, jump and dive is damped by the
 * surface and beach teams are only two players covering the whole court.
 */

export const ML_O2_PER_MET = 3.5;
export const KCAL_DIVISOR = 200;
export const LB_PER_KG = 2.20462262185;

export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 400;
export const MAX_SETS = 7;
export const MAX_MINUTES_PER_SET = 90;
export const MAX_BREAK_MINUTES = 180;

/** Compendium 07021: standing between sets. */
export const BREAK_MET = 1.3;

export const VOLLEYBALL_MODES = [
  {
    id: "beach",
    label: "Beach volleyball (in sand)",
    met: 8.0,
    code: "15720 volleyball, beach, in sand",
  },
  {
    id: "indoor-competitive",
    label: "Indoor competitive (gymnasium)",
    met: 6.0,
    code: "15710 volleyball, competitive, in gymnasium",
  },
  {
    id: "indoor-casual",
    label: "Casual indoor, 6 to 9 a side",
    met: 3.0,
    code: "15711 volleyball, non-competitive, 6-9 member team, general",
  },
];

export function findMode(id) {
  return VOLLEYBALL_MODES.find((mode) => mode.id === id) || null;
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
export function computeVolleyballCalories({ weightKg, sets, minutesPerSet, breakMinutes, modeId }) {
  const weight = Number(weightKg);
  const setCount = Number(sets);
  const perSet = Number(minutesPerSet);
  const breaks = Number(
    breakMinutes === "" || breakMinutes === undefined || breakMinutes === null ? 0 : breakMinutes,
  );

  if (![weight, setCount, perSet, breaks].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for weight, sets, minutes per set and breaks." };
  }
  if (weight < MIN_WEIGHT_KG || weight > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }
  if (setCount <= 0) return { error: "Play at least one set." };
  if (setCount > MAX_SETS) return { error: `A volleyball match rarely runs past ${MAX_SETS} sets.` };
  if (perSet <= 0) return { error: "Minutes per set must be more than zero." };
  if (perSet > MAX_MINUTES_PER_SET) {
    return { error: `A single set over ${MAX_MINUTES_PER_SET} minutes is outside this calculator's range.` };
  }
  if (breaks < 0) return { error: "Break time cannot be negative." };
  if (breaks > MAX_BREAK_MINUTES) return { error: `Keep total break time under ${MAX_BREAK_MINUTES} minutes.` };

  const mode = findMode(modeId);
  if (!mode) return { error: "Choose indoor or beach volleyball." };

  const playRate = kcalPerMinute(mode.met, weight);
  const breakRate = kcalPerMinute(BREAK_MET, weight);
  const playMinutes = setCount * perSet;
  const playKcal = playRate * playMinutes;
  const breakKcal = breakRate * breaks;
  const totalKcal = playKcal + breakKcal;
  const totalMinutes = playMinutes + breaks;
  const netKcal = Math.max(0, totalKcal - kcalPerMinute(1, weight) * totalMinutes);

  return {
    modeLabel: mode.label,
    met: mode.met,
    code: mode.code,
    weightKg: weight,
    sets: setCount,
    minutesPerSet: perSet,
    playMinutes,
    breakMinutes: breaks,
    totalMinutes,
    playRate,
    playKcal,
    breakKcal,
    totalKcal,
    netKcal,
    kcalPerSet: playRate * perSet,
    kcalPerHourOfPlay: playRate * 60,
  };
}
