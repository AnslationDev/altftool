/**
 * Swim pace maths.
 *
 * Pace is expressed the way swimmers use it — time per 100 of whatever unit the
 * pool is measured in:
 *
 *     pace per 100 = total time x (100 / distance)
 *
 * Predictions across other distances use Riegel's endurance equation:
 *
 *     T2 = T1 x (D2 / D1) ^ k
 *
 * Riegel derived k = 1.06 from running data. Swimming shows a flatter fatigue
 * curve because drag, not fuel, dominates, so a smaller exponent around 1.02 to
 * 1.03 fits better; 1.03 is used here and is adjustable. A pure "hold the same
 * pace" prediction (k = 1) is also provided for comparison.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** International yard, exactly 0.9144 metres. */
export const METRES_PER_YARD = 0.9144;

/** Fatigue exponent used for swim predictions. Running uses 1.06. */
export const SWIM_RIEGEL_EXPONENT = 1.03;

/** Distances shown in the prediction table, in the pool's own unit. */
export const STANDARD_DISTANCES = [50, 100, 200, 400, 800, 1500];

/** Open-water race distances, in metres. */
export const OPEN_WATER_DISTANCES_M = [
  { label: "Sprint triathlon swim", metres: 750 },
  { label: "Olympic triathlon swim", metres: 1500 },
  { label: "Half-iron swim", metres: 1900 },
  { label: "Full-iron swim", metres: 3800 },
];

/** Common pool lengths, in the unit named. */
export const POOL_LENGTHS = [
  { id: "scm25", label: "25 m (short course)", length: 25, unit: "m" },
  { id: "lcm50", label: "50 m (long course)", length: 50, unit: "m" },
  { id: "scy25", label: "25 yd (short course yards)", length: 25, unit: "yd" },
  { id: "m33", label: "33.3 m", length: 33.3, unit: "m" },
];

/** Guard rails. */
export const MAX_DISTANCE = 25000;
export const MAX_TIME_SECONDS = 12 * 3600;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Parse a swim time written as "ss", "m:ss" or "h:mm:ss" (decimals allowed on
 * the seconds). Returns seconds, or null when it cannot be read.
 */
export function parseSwimTime(text) {
  if (typeof text !== "string") return null;
  const trimmed = text.trim();
  if (trimmed === "") return null;
  const parts = trimmed.split(":");
  if (parts.length > 3) return null;
  let seconds = 0;
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index].trim();
    if (part === "" || !/^\d*\.?\d+$/.test(part)) return null;
    const value = Number(part);
    if (!Number.isFinite(value) || value < 0) return null;
    // Only the leading field may exceed 59 ("90:00" is fine, "6:75" is not).
    if (index > 0 && value >= 60) return null;
    seconds = seconds * 60 + value;
  }
  return Number.isFinite(seconds) ? seconds : null;
}

/** Seconds -> "m:ss" or "h:mm:ss", with optional tenths. Never returns NaN. */
export function formatSwimTime(totalSeconds, decimals = 0) {
  if (!isNum(totalSeconds) || totalSeconds < 0) return "0:00";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds - hours * 3600 - minutes * 60;
  const secondsText = seconds.toFixed(decimals).padStart(decimals > 0 ? 3 + decimals : 2, "0");
  const pad = (n) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${secondsText}` : `${minutes}:${secondsText}`;
}

/** Riegel prediction: time over d2 given a time over d1. */
export function riegelPredict(timeSeconds, fromDistance, toDistance, exponent = SWIM_RIEGEL_EXPONENT) {
  if (![timeSeconds, fromDistance, toDistance, exponent].every(isNum)) return null;
  if (timeSeconds <= 0 || fromDistance <= 0 || toDistance <= 0) return null;
  return timeSeconds * Math.pow(toDistance / fromDistance, exponent);
}

/**
 * Full swim pace breakdown.
 *
 * @param {object} input
 * @param {number} input.distance      Distance swum, in the pool's unit.
 * @param {number} input.timeSeconds   Time taken.
 * @param {"m"|"yd"} [input.unit="m"]  Unit the distance is measured in.
 * @param {number} [input.poolLength=25] Length of one pool length, same unit.
 * @param {number} [input.exponent]    Riegel fatigue exponent.
 */
export function computeSwimPace({
  distance,
  timeSeconds,
  unit = "m",
  poolLength = 25,
  exponent = SWIM_RIEGEL_EXPONENT,
} = {}) {
  if (![distance, timeSeconds, poolLength, exponent].every(isNum)) {
    return { error: "Enter a distance and a time such as 6:00." };
  }
  if (distance <= 0) return { error: "Distance must be greater than zero." };
  if (distance > MAX_DISTANCE) {
    return { error: `Distances above ${MAX_DISTANCE} are outside this tool's range.` };
  }
  if (timeSeconds <= 0) return { error: "Time must be greater than zero." };
  if (timeSeconds > MAX_TIME_SECONDS) {
    return { error: "Times longer than 12 hours are outside this tool's range." };
  }
  if (poolLength <= 0) return { error: "Pool length must be greater than zero." };
  if (exponent < 1 || exponent > 1.2) {
    return { error: "Fatigue exponent must be between 1.00 and 1.20." };
  }

  const metres = unit === "yd" ? distance * METRES_PER_YARD : distance;
  const pacePer100 = timeSeconds * (100 / distance);
  const speedUnitsPerSecond = distance / timeSeconds;
  const speedMps = metres / timeSeconds;

  const lengths = distance / poolLength;
  const secondsPerLength = timeSeconds / lengths;

  const predictions = STANDARD_DISTANCES.map((target) => ({
    distance: target,
    isSource: Math.abs(target - distance) < 1e-9,
    riegelSeconds: riegelPredict(timeSeconds, distance, target, exponent),
    evenPaceSeconds: (pacePer100 * target) / 100,
  }));

  const openWater = OPEN_WATER_DISTANCES_M.map((race) => {
    const targetInUnit = unit === "yd" ? race.metres / METRES_PER_YARD : race.metres;
    return {
      label: race.label,
      metres: race.metres,
      distanceInUnit: targetInUnit,
      riegelSeconds: riegelPredict(timeSeconds, distance, targetInUnit, exponent),
    };
  });

  return {
    unit,
    distance,
    metres,
    timeSeconds,
    pacePer100,
    pacePer50: pacePer100 / 2,
    pacePer25: pacePer100 / 4,
    speedUnitsPerSecond,
    speedMps,
    speedKmh: speedMps * 3.6,
    lengths,
    secondsPerLength,
    exponent,
    predictions,
    openWater,
  };
}
