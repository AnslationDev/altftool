/**
 * Badminton calorie burn maths.
 *
 * Energy model: the ACSM metabolic equivalent (MET) equation used by the
 * Compendium of Physical Activities (Ainsworth et al., 2011):
 *
 *   kcal / minute = MET x 3.5 x body weight in kg / 200
 *
 * Sourced anchors from the 2011 Compendium:
 *   code 15030  badminton, competitive                          = 7.0 MET
 *   code 15040  badminton, social singles and doubles, general  = 5.5 MET
 *   code 07021  standing quietly / standing in a line           = 1.3 MET (used for breaks)
 *
 * The Compendium does not publish separate singles and doubles values, so the two
 * middle formats below are interpolated between those two sourced anchors: a singles
 * player covers the whole court alone, while doubles partners share coverage. Each
 * format states whether its MET is measured or interpolated.
 */

export const ML_O2_PER_MET = 3.5;
export const KCAL_DIVISOR = 200;
export const LB_PER_KG = 2.20462262185;

export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 400;
export const MAX_MINUTES = 600;

/** Compendium 07021: standing quietly between games. */
export const REST_MET = 1.3;

export const BADMINTON_FORMATS = [
  {
    id: "social-doubles",
    label: "Social doubles",
    met: 5.5,
    sourced: true,
    source: "2011 Compendium 15040 — badminton, social singles and doubles, general",
  },
  {
    id: "social-singles",
    label: "Social singles",
    met: 6.0,
    sourced: false,
    source: "Interpolated between Compendium 15040 (5.5) and 15030 (7.0): one player covers the full court",
  },
  {
    id: "competitive-doubles",
    label: "Competitive doubles",
    met: 6.5,
    sourced: false,
    source: "Interpolated below Compendium 15030 (7.0): match pace, but court coverage shared with a partner",
  },
  {
    id: "competitive-singles",
    label: "Competitive singles",
    met: 7.0,
    sourced: true,
    source: "2011 Compendium 15030 — badminton, competitive",
  },
];

export function findFormat(id) {
  return BADMINTON_FORMATS.find((format) => format.id === id) || null;
}

/** Convert a weight in kg or lb to kilograms. Returns NaN for unusable input. */
export function toKilograms(value, unit) {
  const raw = Number(String(value).replace(/,/g, "").trim());
  if (!Number.isFinite(raw)) return NaN;
  return unit === "lb" ? raw / LB_PER_KG : raw;
}

/** kcal per minute for a given MET and body weight. */
export function kcalPerMinute(met, weightKg) {
  return (met * ML_O2_PER_MET * weightKg) / KCAL_DIVISOR;
}

/**
 * @returns {{error:string}|object} plain object, never NaN or Infinity.
 */
export function computeBadmintonCalories({ weightKg, playMinutes, restMinutes, formatId }) {
  const weight = Number(weightKg);
  const play = Number(playMinutes);
  const rest = Number(restMinutes === "" || restMinutes === undefined || restMinutes === null ? 0 : restMinutes);

  if (!Number.isFinite(weight) || !Number.isFinite(play) || !Number.isFinite(rest)) {
    return { error: "Enter a valid body weight, playing time and break time." };
  }
  if (weight < MIN_WEIGHT_KG || weight > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }
  if (play <= 0) {
    return { error: "Playing time must be more than zero minutes." };
  }
  if (rest < 0) {
    return { error: "Break time cannot be negative." };
  }
  if (play + rest > MAX_MINUTES) {
    return { error: `Keep the whole session under ${MAX_MINUTES} minutes (10 hours).` };
  }

  const format = findFormat(formatId);
  if (!format) return { error: "Choose singles or doubles and a play standard." };

  const playRate = kcalPerMinute(format.met, weight);
  const restRate = kcalPerMinute(REST_MET, weight);
  const playKcal = playRate * play;
  const restKcal = restRate * rest;
  const totalKcal = playKcal + restKcal;
  const totalMinutes = play + rest;
  // Net burn removes the 1 MET you would have spent resting anyway.
  const netKcal = Math.max(0, totalKcal - kcalPerMinute(1, weight) * totalMinutes);

  return {
    formatLabel: format.label,
    met: format.met,
    sourced: format.sourced,
    source: format.source,
    weightKg: weight,
    playMinutes: play,
    restMinutes: rest,
    totalMinutes,
    playRate,
    restRate,
    playKcal,
    restKcal,
    totalKcal,
    netKcal,
    kcalPerHourOfPlay: playRate * 60,
    averageRate: totalKcal / totalMinutes,
  };
}
