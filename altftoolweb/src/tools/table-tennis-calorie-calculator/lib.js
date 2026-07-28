/**
 * Table tennis calorie burn maths.
 *
 * Energy model: the ACSM metabolic equivalent (MET) equation used by the
 * Compendium of Physical Activities (Ainsworth et al., 2011):
 *
 *   kcal / minute = MET x 3.5 x body weight in kg / 200
 *
 * Sourced anchors:
 *   code 15680  table tennis, ping pong                = 4.0 MET
 *   code 07021  standing quietly / standing in a line  = 1.3 MET (used for breaks)
 * The Compendium publishes a single table tennis value, so the two harder levels
 * are interpolated towards its neighbouring racquet-sport entries (tennis doubles
 * 6.0 MET, badminton competitive 7.0 MET). Each level says which it is.
 */

export const ML_O2_PER_MET = 3.5;
export const KCAL_DIVISOR = 200;
export const LB_PER_KG = 2.20462262185;

export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 400;
export const MAX_GAMES = 40;
export const MAX_MINUTES_PER_GAME = 60;
export const MAX_REST_MINUTES = 300;

/** Compendium 07021: standing quietly between games. */
export const REST_MET = 1.3;

export const TABLE_TENNIS_LEVELS = [
  {
    id: "casual",
    label: "Casual / social rallying",
    met: 4.0,
    sourced: true,
    source: "2011 Compendium 15680 — table tennis, ping pong",
  },
  {
    id: "club",
    label: "Club practice with multiball drills",
    met: 5.0,
    sourced: false,
    source: "Interpolated above Compendium 15680 (4.0): continuous feeding removes most dead time",
  },
  {
    id: "competitive",
    label: "Competitive match play",
    met: 6.0,
    sourced: false,
    source: "Interpolated towards neighbouring racquet sports (tennis doubles 6.0, badminton competitive 7.0)",
  },
];

export function findLevel(id) {
  return TABLE_TENNIS_LEVELS.find((level) => level.id === id) || null;
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
export function computeTableTennisCalories({ weightKg, games, minutesPerGame, restMinutes, levelId }) {
  const weight = Number(weightKg);
  const gameCount = Number(games);
  const perGame = Number(minutesPerGame);
  const rest = Number(restMinutes === "" || restMinutes === undefined || restMinutes === null ? 0 : restMinutes);

  if (![weight, gameCount, perGame, rest].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for weight, games, minutes per game and breaks." };
  }
  if (weight < MIN_WEIGHT_KG || weight > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }
  if (gameCount <= 0) return { error: "Play at least one game." };
  if (gameCount > MAX_GAMES) return { error: `Enter ${MAX_GAMES} games or fewer.` };
  if (perGame <= 0) return { error: "Minutes per game must be more than zero." };
  if (perGame > MAX_MINUTES_PER_GAME) {
    return { error: `A single game over ${MAX_MINUTES_PER_GAME} minutes is outside this calculator's range.` };
  }
  if (rest < 0) return { error: "Break time cannot be negative." };
  if (rest > MAX_REST_MINUTES) return { error: `Keep total break time under ${MAX_REST_MINUTES} minutes.` };

  const level = findLevel(levelId);
  if (!level) return { error: "Choose how hard you were playing." };

  const playRate = kcalPerMinute(level.met, weight);
  const restRate = kcalPerMinute(REST_MET, weight);
  const playMinutes = gameCount * perGame;
  const playKcal = playRate * playMinutes;
  const restKcal = restRate * rest;
  const totalKcal = playKcal + restKcal;
  const totalMinutes = playMinutes + rest;
  const netKcal = Math.max(0, totalKcal - kcalPerMinute(1, weight) * totalMinutes);

  return {
    levelLabel: level.label,
    met: level.met,
    sourced: level.sourced,
    source: level.source,
    weightKg: weight,
    games: gameCount,
    minutesPerGame: perGame,
    playMinutes,
    restMinutes: rest,
    totalMinutes,
    playRate,
    playKcal,
    restKcal,
    totalKcal,
    netKcal,
    kcalPerGame: playRate * perGame,
    kcalPerHourOfPlay: playRate * 60,
  };
}
