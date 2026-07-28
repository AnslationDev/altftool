/**
 * Kabaddi calorie burn maths.
 *
 * Energy model: the ACSM metabolic equivalent (MET) equation behind the
 * Compendium of Physical Activities (Ainsworth et al., 2011):
 *
 *   kcal / minute = MET x 3.5 x body weight in kg / 200
 *
 * IMPORTANT SOURCING NOTE: the Compendium does not list kabaddi. Rather than invent
 * a value, every option below is anchored on a named Compendium entry for a sport
 * with the same movement pattern — repeated sprints plus grappling and tackling:
 *   code 15700  rugby, union, team, competitive   = 8.3 MET
 *   code 15701  rugby, touch, non-competitive     = 6.3 MET
 *   code 15730  wrestling (one match = 5 minutes) = 6.0 MET
 *   code 07021  standing quietly / in a line      = 1.3 MET (used for bench time)
 * Options marked proxy use one of those values directly; options marked interpolated
 * sit between two of them, and each says so on screen.
 */

export const ML_O2_PER_MET = 3.5;
export const KCAL_DIVISOR = 200;
export const LB_PER_KG = 2.20462262185;

export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 400;
export const MAX_MINUTES = 600;

/** Compendium 07021: sitting out a raid or waiting on the bench. */
export const BENCH_MET = 1.3;

/** Standard kabaddi match: two halves of 20 minutes with a 5-minute interval. */
export const MATCH_HALF_MINUTES = 20;
export const MATCH_HALVES = 2;
export const MATCH_INTERVAL_MINUTES = 5;

export const KABADDI_ROLES = [
  {
    id: "raider",
    label: "Raider — competitive match",
    met: 8.3,
    basis: "proxy",
    source: "Compendium 15700 (rugby union, competitive) — repeated maximal sprints into contact",
  },
  {
    id: "all-rounder",
    label: "All-rounder — competitive match",
    met: 7.8,
    basis: "interpolated",
    source: "Midway between the raider and defender values below",
  },
  {
    id: "defender",
    label: "Defender / anti-raider — competitive match",
    met: 7.2,
    basis: "interpolated",
    source: "Between Compendium 15700 (8.3) and 15730 wrestling (6.0): short holds from a set position",
  },
  {
    id: "recreational",
    label: "Recreational / street kabaddi",
    met: 6.3,
    basis: "proxy",
    source: "Compendium 15701 (rugby, touch, non-competitive)",
  },
  {
    id: "practice",
    label: "Practice drills, holds and technique",
    met: 6.0,
    basis: "proxy",
    source: "Compendium 15730 (wrestling) — grappling drills at practice pace",
  },
];

export function findRole(id) {
  return KABADDI_ROLES.find((role) => role.id === id) || null;
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
export function computeKabaddiCalories({ weightKg, matMinutes, benchMinutes, roleId }) {
  const weight = Number(weightKg);
  const mat = Number(matMinutes);
  const bench = Number(benchMinutes === "" || benchMinutes === undefined || benchMinutes === null ? 0 : benchMinutes);

  if (![weight, mat, bench].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for weight, mat time and bench time." };
  }
  if (weight < MIN_WEIGHT_KG || weight > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }
  if (mat <= 0) return { error: "Time on the mat must be more than zero minutes." };
  if (bench < 0) return { error: "Bench time cannot be negative." };
  if (mat + bench > MAX_MINUTES) {
    return { error: `Keep the whole session under ${MAX_MINUTES} minutes (10 hours).` };
  }

  const role = findRole(roleId);
  if (!role) return { error: "Choose whether you raided, defended or played all-rounder." };

  const matRate = kcalPerMinute(role.met, weight);
  const benchRate = kcalPerMinute(BENCH_MET, weight);
  const matKcal = matRate * mat;
  const benchKcal = benchRate * bench;
  const totalKcal = matKcal + benchKcal;
  const totalMinutes = mat + bench;
  const netKcal = Math.max(0, totalKcal - kcalPerMinute(1, weight) * totalMinutes);
  // How many standard 40-minute matches of mat time this represents.
  const matchEquivalents = mat / (MATCH_HALF_MINUTES * MATCH_HALVES);

  return {
    roleLabel: role.label,
    met: role.met,
    basis: role.basis,
    source: role.source,
    weightKg: weight,
    matMinutes: mat,
    benchMinutes: bench,
    totalMinutes,
    matRate,
    matKcal,
    benchKcal,
    totalKcal,
    netKcal,
    kcalPerHourOnMat: matRate * 60,
    matchEquivalents,
  };
}
