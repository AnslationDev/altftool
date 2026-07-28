/**
 * Pool laps -> distance conversion.
 *
 * The only real ambiguity in "laps" is what a lap means. Competitive swimming
 * (World Aquatics / USA Swimming) counts a *length* — one end of the pool to the
 * other. Recreational swimmers and most gym signage count a lap as "there and
 * back" = 2 lengths. Both conventions are supported explicitly.
 */

/** International yard = 0.9144 m exactly (1959 international yard & pound agreement). */
export const METRES_PER_YARD = 0.9144;

/** International (statute) mile = 1760 yd = 1609.344 m exactly. */
export const METRES_PER_MILE = 1609.344;

/** Metric "swim mile" used by open-water and pool distance events: 1500 m. */
export const METRIC_SWIM_MILE_METRES = 1500;

/** US "swimmer's mile": 1650 yd in a short-course-yards pool = 1508.76 m. */
export const SWIMMERS_MILE_METRES = 1650 * METRES_PER_YARD;

/** Common pool sizes. 25 m/50 m are the World Aquatics short- and long-course standards. */
export const POOL_PRESETS = [
  { id: "scm25", label: "25 m — short course metres", length: 25, unit: "m" },
  { id: "lcm50", label: "50 m — Olympic / long course", length: 50, unit: "m" },
  { id: "scy25", label: "25 yd — short course yards", length: 25, unit: "yd" },
  { id: "m33", label: "33.33 m — older municipal pool", length: 33.33, unit: "m" },
  { id: "m20", label: "20 m — compact community pool", length: 20, unit: "m" },
  { id: "m15", label: "15 m — hotel / apartment pool", length: 15, unit: "m" },
  { id: "yd20", label: "20 yd — small US pool", length: 20, unit: "yd" },
];

/** How many pool lengths one "lap" means under each counting convention. */
export const LAP_MODES = [
  {
    id: "length",
    lengthsPerLap: 1,
    label: "1 lap = 1 length (competitive convention)",
  },
  {
    id: "roundTrip",
    lengthsPerLap: 2,
    label: "1 lap = down and back (2 lengths)",
  },
];

/** Distance units the tool can read a target distance in. */
export const DISTANCE_UNITS = {
  m: 1,
  km: 1000,
  yd: METRES_PER_YARD,
  mi: METRES_PER_MILE,
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Convert a pool length given in metres or yards into metres. */
export function poolLengthToMetres(length, unit) {
  if (!isNum(length)) return NaN;
  return unit === "yd" ? length * METRES_PER_YARD : length;
}

/**
 * Convert a lap count into every distance unit, plus optional pace.
 *
 * @param {object} input
 * @param {number} input.laps              Laps swum (>= 0).
 * @param {number} input.poolLength        Pool length value.
 * @param {"m"|"yd"} [input.poolUnit]      Unit the pool length is given in.
 * @param {1|2} [input.lengthsPerLap]      Lap counting convention.
 * @param {number} [input.targetDistance]  Optional session goal (0 = none).
 * @param {"m"|"km"|"yd"|"mi"} [input.targetUnit]
 * @param {number} [input.totalSeconds]    Optional total swim time (0 = none).
 * @returns {object} result or { error }
 */
export function convertLaps({
  laps,
  poolLength,
  poolUnit = "m",
  lengthsPerLap = 2,
  targetDistance = 0,
  targetUnit = "m",
  totalSeconds = 0,
} = {}) {
  if (!isNum(laps) || !isNum(poolLength) || !isNum(targetDistance) || !isNum(totalSeconds)) {
    return { error: "Enter numbers only — laps, pool length, goal and time must all be numeric." };
  }
  if (laps < 0) return { error: "Lap count cannot be negative." };
  if (poolLength <= 0) return { error: "Pool length must be greater than zero." };
  if (poolLength > 1000) return { error: "Pool length looks wrong — enter the length of one lane, not the whole session." };
  if (targetDistance < 0) return { error: "Goal distance cannot be negative." };
  if (totalSeconds < 0) return { error: "Swim time cannot be negative." };
  if (lengthsPerLap !== 1 && lengthsPerLap !== 2) {
    return { error: "Choose whether a lap means one length or a down-and-back." };
  }
  if (poolUnit !== "m" && poolUnit !== "yd") {
    return { error: "Pool length must be measured in metres or yards." };
  }
  const unitFactor = DISTANCE_UNITS[targetUnit];
  if (!unitFactor) return { error: "Choose a goal unit of m, km, yd or mi." };

  const poolLengthMetres = poolLengthToMetres(poolLength, poolUnit);
  const lengths = laps * lengthsPerLap;
  const metres = lengths * poolLengthMetres;

  const targetMetres = targetDistance * unitFactor;
  const remainingMetres = Math.max(0, targetMetres - metres);
  const metresPerLap = poolLengthMetres * lengthsPerLap;
  const lapsRemaining = metresPerLap > 0 ? remainingMetres / metresPerLap : 0;

  let pace = null;
  if (totalSeconds > 0 && metres > 0) {
    const secondsPer100m = (totalSeconds / metres) * 100;
    pace = {
      secondsPer100m,
      secondsPerLength: totalSeconds / lengths,
      metresPerMinute: (metres / totalSeconds) * 60,
      kmPerHour: (metres / totalSeconds) * 3.6,
    };
  }

  return {
    poolLengthMetres,
    metresPerLap,
    lengths,
    metres,
    kilometres: metres / 1000,
    yards: metres / METRES_PER_YARD,
    miles: metres / METRES_PER_MILE,
    metricSwimMiles: metres / METRIC_SWIM_MILE_METRES,
    swimmersMiles: metres / SWIMMERS_MILE_METRES,
    targetMetres,
    remainingMetres,
    lapsRemaining,
    overshootMetres: Math.max(0, metres - targetMetres),
    goalReached: targetMetres > 0 && metres >= targetMetres,
    goalPercent: targetMetres > 0 ? Math.min(100, (metres / targetMetres) * 100) : 0,
    pace,
  };
}

/**
 * Inverse direction: how many laps make up a given distance in this pool.
 * @returns {object} result or { error }
 */
export function lapsForDistance({
  distance,
  distanceUnit = "m",
  poolLength,
  poolUnit = "m",
  lengthsPerLap = 2,
} = {}) {
  if (!isNum(distance) || !isNum(poolLength)) {
    return { error: "Enter a numeric distance and pool length." };
  }
  if (distance < 0) return { error: "Distance cannot be negative." };
  if (poolLength <= 0) return { error: "Pool length must be greater than zero." };
  const unitFactor = DISTANCE_UNITS[distanceUnit];
  if (!unitFactor) return { error: "Choose a distance unit of m, km, yd or mi." };

  const poolLengthMetres = poolLengthToMetres(poolLength, poolUnit);
  const metres = distance * unitFactor;
  const lengths = metres / poolLengthMetres;
  const laps = lengths / lengthsPerLap;

  return {
    metres,
    lengths,
    laps,
    wholeLaps: Math.floor(laps),
    partialLength: (lengths % lengthsPerLap).toFixed(2) * 1,
  };
}

/** Combine a minutes and seconds pair into total seconds. Returns NaN if either is bad. */
export function toTotalSeconds(minutes, seconds) {
  if (!isNum(minutes) || !isNum(seconds)) return NaN;
  return minutes * 60 + seconds;
}

/** Format a seconds value as m:ss (used for pace strings). */
export function formatSeconds(totalSeconds) {
  if (!isNum(totalSeconds) || totalSeconds < 0) return "—";
  const rounded = Math.round(totalSeconds);
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
