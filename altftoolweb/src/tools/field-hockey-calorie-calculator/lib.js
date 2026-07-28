/**
 * Field hockey calorie burn maths.
 *
 * Energy model: the ACSM metabolic equivalent (MET) equation behind the
 * Compendium of Physical Activities (Ainsworth et al., 2011):
 *
 *   kcal / minute = MET x 3.5 x body weight in kg / 200
 *
 * Sourced values:
 *   code 15300  field hockey                                        = 7.8 MET (match play)
 *   code 15605  soccer, casual, general                             = 7.0 MET (proxy for team drills)
 *   code 15665  tennis, hitting balls, non-game, moderate effort     = 5.0 MET (proxy for skills work)
 *   code 07021  standing quietly / in a line                        = 1.3 MET (rolling-sub bench time)
 * Only the first is a field hockey entry; the other two are named proxies because
 * the Compendium publishes no separate hockey training values, and the tool says so.
 */

export const ML_O2_PER_MET = 3.5;
export const KCAL_DIVISOR = 200;
export const LB_PER_KG = 2.20462262185;

export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 400;
export const MAX_MINUTES = 600;

/** Compendium 07021: field hockey uses rolling substitutions, so bench time is common. */
export const BENCH_MET = 1.3;

/** FIH international format since 2015: four quarters of 15 minutes. */
export const QUARTER_MINUTES = 15;
export const QUARTERS_PER_MATCH = 4;
/** Traditional club format still used in many leagues: two halves of 35 minutes. */
export const HALF_MINUTES = 35;
export const HALVES_PER_MATCH = 2;

export const HOCKEY_MODES = [
  {
    id: "match",
    label: "Match play",
    met: 7.8,
    basis: "sourced",
    source: "Compendium 15300 — field hockey",
  },
  {
    id: "training",
    label: "Training: small-sided games and drills",
    met: 7.0,
    basis: "proxy",
    source: "Compendium 15605 (soccer, casual, general) — team drills at practice pace",
  },
  {
    id: "skills",
    label: "Skills session: hitting, trapping, set pieces",
    met: 5.0,
    basis: "proxy",
    source: "Compendium 15665 (hitting balls, non-game play, moderate effort)",
  },
];

export function findMode(id) {
  return HOCKEY_MODES.find((mode) => mode.id === id) || null;
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
export function computeHockeyCalories({ weightKg, playMinutes, benchMinutes, modeId }) {
  const weight = Number(weightKg);
  const play = Number(playMinutes);
  const bench = Number(benchMinutes === "" || benchMinutes === undefined || benchMinutes === null ? 0 : benchMinutes);

  if (![weight, play, bench].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for body weight, playing time and bench time." };
  }
  if (weight < MIN_WEIGHT_KG || weight > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }
  if (play <= 0) return { error: "Playing time must be more than zero minutes." };
  if (bench < 0) return { error: "Bench time cannot be negative." };
  if (play + bench > MAX_MINUTES) {
    return { error: `Keep the whole session under ${MAX_MINUTES} minutes (10 hours).` };
  }

  const mode = findMode(modeId);
  if (!mode) return { error: "Choose match play, training or a skills session." };

  const playRate = kcalPerMinute(mode.met, weight);
  const benchRate = kcalPerMinute(BENCH_MET, weight);
  const playKcal = playRate * play;
  const benchKcal = benchRate * bench;
  const totalKcal = playKcal + benchKcal;
  const totalMinutes = play + bench;
  const netKcal = Math.max(0, totalKcal - kcalPerMinute(1, weight) * totalMinutes);

  return {
    modeLabel: mode.label,
    met: mode.met,
    basis: mode.basis,
    source: mode.source,
    weightKg: weight,
    playMinutes: play,
    benchMinutes: bench,
    totalMinutes,
    playRate,
    playKcal,
    benchKcal,
    totalKcal,
    netKcal,
    kcalPerQuarter: playRate * QUARTER_MINUTES,
    kcalPerHalf: playRate * HALF_MINUTES,
    kcalPerHourOfPlay: playRate * 60,
  };
}
