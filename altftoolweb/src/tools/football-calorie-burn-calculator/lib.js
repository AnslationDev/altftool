/**
 * Football (soccer) calorie burn maths.
 *
 * Energy model: the ACSM metabolic equivalent (MET) equation used throughout the
 * Compendium of Physical Activities (Ainsworth et al., 2011):
 *
 *   kcal / minute = MET x 3.5 x body weight in kg / 200
 *
 * 3.5 ml O2/kg/min is one MET (resting oxygen uptake) and 200 converts millilitres
 * of oxygen into kilocalories (1 litre of O2 ~ 5 kcal, so ml -> kcal is / 1000 x 5).
 *
 * Position workload comes from elite match GPS/motion analysis (Di Salvo et al.,
 * 2007, "Performance characteristics according to playing position in elite soccer",
 * Int J Sports Med): total match distance differs sharply by position, so a
 * midfielder covering ~11.5 km burns materially more than a centre-back on ~9.9 km.
 */

/** ml O2/kg/min for one MET (ACSM resting metabolic rate). */
export const ML_O2_PER_MET = 3.5;
/** Divisor that turns MET x 3.5 x kg into kcal/min (1 L O2 = 5 kcal). */
export const KCAL_DIVISOR = 200;
/** 1 kilogram in pounds, for unit conversion only. */
export const LB_PER_KG = 2.20462262185;
/** Sanity bounds so absurd input returns an error instead of a fake number. */
export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 400;
export const MAX_MINUTES = 600;

/**
 * Match intensity modes. MET values are the soccer entries of the 2011
 * Compendium of Physical Activities (activity codes 15605 and 15610).
 */
export const FOOTBALL_MODES = [
  {
    id: "competitive",
    label: "Competitive 11-a-side match",
    met: 10.0, // Compendium 15610 "soccer, competitive"
    note: "Full-pitch match play with referees and league intensity.",
    matchPlay: true,
  },
  {
    id: "casual",
    label: "Casual match / kickabout",
    met: 7.0, // Compendium 15605 "soccer, casual, general"
    note: "Friendly game, park football or a relaxed five-a-side.",
    matchPlay: true,
  },
  {
    id: "training",
    label: "Training session (drills + small-sided games)",
    met: 7.0, // Modelled on Compendium 15605: continuous work but coaching stoppages
    note: "Technical drills and possession games with coaching breaks.",
    matchPlay: false,
  },
];

/**
 * Position workload factors.
 * distanceM = mean total distance covered in a 90-minute elite match
 * (Di Salvo et al., 2007). Goalkeeper distance is from goalkeeper-specific
 * match analyses, which consistently report roughly 5.5-6 km per match.
 * factor = position distance / mean outfield distance, applied to the MET value.
 */
const RAW_POSITIONS = [
  { id: "goalkeeper", label: "Goalkeeper", distanceM: 5600, outfield: false },
  { id: "centre-back", label: "Centre-back", distanceM: 9885, outfield: true },
  { id: "full-back", label: "Full-back / wing-back", distanceM: 10710, outfield: true },
  { id: "central-midfielder", label: "Central midfielder", distanceM: 11450, outfield: true },
  { id: "wide-midfielder", label: "Winger / wide midfielder", distanceM: 11535, outfield: true },
  { id: "forward", label: "Forward / striker", distanceM: 10314, outfield: true },
];

const OUTFIELD = RAW_POSITIONS.filter((p) => p.outfield);
/** Mean outfield match distance used as the 1.00 reference point. */
export const REFERENCE_OUTFIELD_DISTANCE_M =
  OUTFIELD.reduce((sum, p) => sum + p.distanceM, 0) / OUTFIELD.length;

export const FOOTBALL_POSITIONS = RAW_POSITIONS.map((p) => ({
  ...p,
  distanceKm: p.distanceM / 1000,
  factor: p.distanceM / REFERENCE_OUTFIELD_DISTANCE_M,
}));

/** Standard match length in minutes, used to scale distance covered. */
export const FULL_MATCH_MINUTES = 90;

export function findMode(id) {
  return FOOTBALL_MODES.find((mode) => mode.id === id) || null;
}

export function findPosition(id) {
  return FOOTBALL_POSITIONS.find((position) => position.id === id) || null;
}

/** Convert a weight in kg or lb to kilograms. Returns NaN for unusable input. */
export function toKilograms(value, unit) {
  const raw = Number(String(value).replace(/,/g, "").trim());
  if (!Number.isFinite(raw)) return NaN;
  return unit === "lb" ? raw / LB_PER_KG : raw;
}

/**
 * Core calculation.
 * @returns {{error:string}|object} plain object, never NaN or Infinity.
 */
export function computeFootballCalories({ weightKg, minutes, modeId, positionId }) {
  const weight = Number(weightKg);
  const mins = Number(minutes);

  if (!Number.isFinite(weight) || !Number.isFinite(mins)) {
    return { error: "Enter a valid body weight and a valid number of minutes." };
  }
  if (weight < MIN_WEIGHT_KG || weight > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }
  if (mins <= 0) {
    return { error: "Time on the pitch must be more than zero minutes." };
  }
  if (mins > MAX_MINUTES) {
    return { error: `Keep the session under ${MAX_MINUTES} minutes (10 hours).` };
  }

  const mode = findMode(modeId);
  if (!mode) return { error: "Choose a match or training intensity." };

  const position = findPosition(positionId);
  if (!position) return { error: "Choose the position you played." };

  const effectiveMet = mode.met * position.factor;
  const kcalPerMinute = (effectiveMet * ML_O2_PER_MET * weight) / KCAL_DIVISOR;
  const kcal = kcalPerMinute * mins;
  // Net burn subtracts the 1 MET you would have spent resting anyway.
  const netKcalPerMinute = (Math.max(0, effectiveMet - 1) * ML_O2_PER_MET * weight) / KCAL_DIVISOR;
  const netKcal = netKcalPerMinute * mins;
  // Distance is only meaningful for match play; drills are position-neutral.
  const distanceKm = mode.matchPlay
    ? (position.distanceM * (mins / FULL_MATCH_MINUTES)) / 1000
    : null;

  return {
    modeLabel: mode.label,
    modeNote: mode.note,
    baseMet: mode.met,
    positionLabel: position.label,
    positionFactor: position.factor,
    effectiveMet,
    minutes: mins,
    weightKg: weight,
    kcalPerMinute,
    kcalPerHour: kcalPerMinute * 60,
    kcal,
    netKcal,
    kcalPerKg: kcal / weight,
    distanceKm,
  };
}
