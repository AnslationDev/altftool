/**
 * 5K race time prediction from a recent race result.
 *
 * Uses Pete Riegel's endurance formula (Runner's World, 1977; refined 1981):
 *   T2 = T1 * (D2 / D1) ^ 1.06
 * where T1 is the time for the known distance D1 and T2 the predicted time for
 * distance D2. The exponent 1.06 is Riegel's fatigue factor: it says a runner
 * slows by about 6% per doubling of distance. It is most reliable when both
 * distances sit between roughly 1500 m and the marathon, and when the target is
 * within about a factor of four of the known distance.
 */

/** Riegel fatigue exponent. */
export const RIEGEL_EXPONENT = 1.06;

/** Target distance of this tool, in kilometres. */
export const TARGET_KM = 5;

/** Metres in one statute mile (exact, by definition). */
export const METRES_PER_MILE = 1609.344;

/** Guard rails on the inputs. */
export const MIN_DISTANCE_KM = 0.4;
export const MAX_DISTANCE_KM = 200;
export const MAX_TIME_SECONDS = 24 * 3600;

/** Common race distances, in kilometres. */
export const DISTANCE_PRESETS = [
  { label: "1500 m", km: 1.5 },
  { label: "1 mile", km: METRES_PER_MILE / 1000 },
  { label: "3 km", km: 3 },
  { label: "5 km", km: 5 },
  { label: "8 km", km: 8 },
  { label: "5 miles", km: (5 * METRES_PER_MILE) / 1000 },
  { label: "10 km", km: 10 },
  { label: "10 miles", km: (10 * METRES_PER_MILE) / 1000 },
  { label: "Half marathon", km: 21.0975 },
  { label: "Marathon", km: 42.195 },
];

/** Beyond this ratio between known and target distance, Riegel drifts. */
export const RELIABLE_RATIO = 4;

/** Convert hours, minutes and seconds to a total number of seconds. */
export function toSeconds({ hours = 0, minutes = 0, seconds = 0 }) {
  if (![hours, minutes, seconds].every((value) => Number.isFinite(value))) return NaN;
  return hours * 3600 + minutes * 60 + seconds;
}

/** Format a duration in seconds as h:mm:ss or m:ss. */
export function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "—";
  const rounded = Math.round(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;
  const pad = (value) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`;
}

/** Format a pace in seconds per unit as m:ss. */
export function formatPace(secondsPerUnit) {
  if (!Number.isFinite(secondsPerUnit) || secondsPerUnit <= 0) return "—";
  const rounded = Math.round(secondsPerUnit);
  const minutes = Math.floor(rounded / 60);
  const secs = rounded % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

/** Riegel prediction. Returns seconds. */
export function riegelPredict(knownTimeSeconds, knownDistanceKm, targetDistanceKm, exponent = RIEGEL_EXPONENT) {
  if (!(knownTimeSeconds > 0) || !(knownDistanceKm > 0) || !(targetDistanceKm > 0)) return NaN;
  return knownTimeSeconds * Math.pow(targetDistanceKm / knownDistanceKm, exponent);
}

/**
 * Predict a 5K time and build the supporting pace and split figures.
 *
 * @param {{ knownDistanceKm:number, knownTimeSeconds:number, exponent?:number }} input
 * @returns {object} prediction, or { error } for unusable input.
 */
export function predictFiveK({ knownDistanceKm, knownTimeSeconds, exponent = RIEGEL_EXPONENT }) {
  if (!Number.isFinite(knownDistanceKm) || !Number.isFinite(knownTimeSeconds)) {
    return { error: "Enter the distance and the time of your recent race." };
  }
  if (knownDistanceKm < MIN_DISTANCE_KM || knownDistanceKm > MAX_DISTANCE_KM) {
    return {
      error: `Race distance must be between ${MIN_DISTANCE_KM} km and ${MAX_DISTANCE_KM} km.`,
    };
  }
  if (knownTimeSeconds <= 0) {
    return { error: "Race time must be greater than zero." };
  }
  if (knownTimeSeconds > MAX_TIME_SECONDS) {
    return { error: "Race time must be under 24 hours." };
  }
  if (!Number.isFinite(exponent) || exponent < 1 || exponent > 1.2) {
    return { error: "The fatigue exponent should be between 1.00 and 1.20 (Riegel uses 1.06)." };
  }

  const knownPacePerKm = knownTimeSeconds / knownDistanceKm;
  if (knownPacePerKm < 120) {
    return { error: "That pace is faster than the world record — check the distance and time." };
  }

  const predictedSeconds = riegelPredict(knownTimeSeconds, knownDistanceKm, TARGET_KM, exponent);
  if (!Number.isFinite(predictedSeconds) || predictedSeconds <= 0) {
    return { error: "Could not compute a prediction from those numbers." };
  }

  const pacePerKm = predictedSeconds / TARGET_KM;
  const pacePerMile = pacePerKm * (METRES_PER_MILE / 1000);
  const speedKmh = TARGET_KM / (predictedSeconds / 3600);

  // Even-pace kilometre splits with the cumulative clock at each marker.
  const splits = [];
  for (let km = 1; km <= TARGET_KM; km += 1) {
    splits.push({ km, split: pacePerKm, cumulative: pacePerKm * km });
  }

  const ratio =
    knownDistanceKm > TARGET_KM ? knownDistanceKm / TARGET_KM : TARGET_KM / knownDistanceKm;

  // Equivalent performances at other common distances, same fitness.
  const equivalents = DISTANCE_PRESETS.map((preset) => ({
    label: preset.label,
    km: preset.km,
    seconds: riegelPredict(knownTimeSeconds, knownDistanceKm, preset.km, exponent),
  }));

  return {
    predictedSeconds,
    pacePerKm,
    pacePerMile,
    speedKmh,
    knownPacePerKm,
    knownDistanceKm,
    knownTimeSeconds,
    exponent,
    splits,
    equivalents,
    ratio,
    reliable: ratio <= RELIABLE_RATIO,
    sameDistance: Math.abs(knownDistanceKm - TARGET_KM) < 0.001,
  };
}
