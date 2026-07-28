/**
 * Basketball calorie burn maths.
 *
 * Energy model: the ACSM metabolic equivalent (MET) equation behind the
 * Compendium of Physical Activities (Ainsworth et al., 2011):
 *
 *   kcal / minute = MET x 3.5 x body weight in kg / 200
 *
 * Every MET value below is a published Compendium entry — nothing is invented:
 *   code 15055  basketball, game                  = 8.0 MET
 *   code 15060  basketball, non-game, general     = 6.0 MET
 *   code 15070  basketball, shooting baskets      = 4.5 MET
 *   code 15075  basketball, drills, practice      = 9.3 MET
 *   code 15080  basketball, wheelchair            = 7.8 MET
 *   code 07021  standing quietly / in a line      = 1.3 MET (used for bench time)
 */

export const ML_O2_PER_MET = 3.5;
export const KCAL_DIVISOR = 200;
export const LB_PER_KG = 2.20462262185;

export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 400;
export const MAX_MINUTES = 600;

/** Compendium 07021: sitting or standing on the bench. */
export const BENCH_MET = 1.3;

/** FIBA regulation game: four 10-minute quarters of running clock time. */
export const FIBA_GAME_MINUTES = 40;
/** NBA regulation game: four 12-minute quarters. */
export const NBA_GAME_MINUTES = 48;

export const BASKETBALL_MODES = [
  { id: "game", label: "Full-court game", met: 8.0, code: "15055 basketball, game" },
  {
    id: "pickup",
    label: "Half-court / pick-up, non-game",
    met: 6.0,
    code: "15060 basketball, non-game, general",
  },
  { id: "drills", label: "Drills and structured practice", met: 9.3, code: "15075 basketball, drills, practice" },
  { id: "shooting", label: "Shooting baskets", met: 4.5, code: "15070 basketball, shooting baskets" },
  { id: "wheelchair", label: "Wheelchair basketball", met: 7.8, code: "15080 basketball, wheelchair" },
];

export function findMode(id) {
  return BASKETBALL_MODES.find((mode) => mode.id === id) || null;
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
export function computeBasketballCalories({ weightKg, courtMinutes, benchMinutes, modeId }) {
  const weight = Number(weightKg);
  const court = Number(courtMinutes);
  const bench = Number(benchMinutes === "" || benchMinutes === undefined || benchMinutes === null ? 0 : benchMinutes);

  if (![weight, court, bench].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for body weight, court time and bench time." };
  }
  if (weight < MIN_WEIGHT_KG || weight > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }
  if (court <= 0) return { error: "Court time must be more than zero minutes." };
  if (bench < 0) return { error: "Bench time cannot be negative." };
  if (court + bench > MAX_MINUTES) {
    return { error: `Keep the whole session under ${MAX_MINUTES} minutes (10 hours).` };
  }

  const mode = findMode(modeId);
  if (!mode) return { error: "Choose the kind of basketball you played." };

  const courtRate = kcalPerMinute(mode.met, weight);
  const benchRate = kcalPerMinute(BENCH_MET, weight);
  const courtKcal = courtRate * court;
  const benchKcal = benchRate * bench;
  const totalKcal = courtKcal + benchKcal;
  const totalMinutes = court + bench;
  const netKcal = Math.max(0, totalKcal - kcalPerMinute(1, weight) * totalMinutes);

  return {
    modeLabel: mode.label,
    met: mode.met,
    code: mode.code,
    weightKg: weight,
    courtMinutes: court,
    benchMinutes: bench,
    totalMinutes,
    courtRate,
    courtKcal,
    benchKcal,
    totalKcal,
    netKcal,
    kcalPerHourOnCourt: courtRate * 60,
    kcalPerQuarter: courtRate * (FIBA_GAME_MINUTES / 4),
  };
}

/** The same court time priced across every mode — used for the comparison table. */
export function compareModes({ weightKg, courtMinutes }) {
  const weight = Number(weightKg);
  const minutes = Number(courtMinutes);
  if (!Number.isFinite(weight) || !Number.isFinite(minutes) || weight <= 0 || minutes <= 0) return [];
  return BASKETBALL_MODES.map((mode) => ({
    id: mode.id,
    label: mode.label,
    met: mode.met,
    kcal: kcalPerMinute(mode.met, weight) * minutes,
  }));
}
