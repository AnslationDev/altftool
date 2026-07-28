/**
 * Walking pace maths.
 *
 * Pace is simply elapsed time divided by distance; the intensity figures come
 * from the walking entries of the Compendium of Physical Activities
 * (Ainsworth et al., 2011), interpolated between the tabulated speeds.
 */

/** International mile = 1609.344 m exactly (NIST SP 811). */
export const METRES_PER_MILE = 1609.344;
export const KM_PER_MILE = METRES_PER_MILE / 1000;

/**
 * Compendium of Physical Activities 2011, walking on a level firm surface.
 * mph -> MET. Values are the published table entries, not estimates.
 *   2.0 mph slow .......... 2.8   (code 17152)
 *   2.5 mph ............... 3.0   (code 17170)
 *   3.0 mph moderate ...... 3.5   (code 17190)
 *   3.5 mph brisk ......... 4.3   (code 17200)
 *   4.0 mph very brisk .... 5.0   (code 17220)
 *   4.5 mph ............... 7.0   (code 17230)
 *   5.0 mph ............... 8.3   (code 17231)
 */
export const WALK_MET_TABLE = [
  { mph: 2.0, met: 2.8 },
  { mph: 2.5, met: 3.0 },
  { mph: 3.0, met: 3.5 },
  { mph: 3.5, met: 4.3 },
  { mph: 4.0, met: 5.0 },
  { mph: 4.5, met: 7.0 },
  { mph: 5.0, met: 8.3 },
];

/** Compendium entry for "walking, less than 2.0 mph, level, strolling, very slow" = 2.0 METs. */
export const STROLL_MET = 2.0;

/** ACSM shortcut: kcal/min = MET x 3.5 mL/kg/min x kg / 200. */
export const MET_KCAL_FACTOR = 3.5 / 200;

/** Anything above this is running or a data-entry slip: the race-walk world record is about 15 km/h. */
export const MAX_WALK_KMH = 20;

/**
 * Speed bands for walking. Boundaries follow US physical-activity guidance,
 * where 3.0 mph (4.83 km/h) is the usual "brisk / moderate intensity" line
 * and 4.0 mph (6.44 km/h) is where walking becomes vigorous for most adults.
 */
export const PACE_BANDS = [
  {
    maxKmh: 3.2,
    label: "Strolling",
    note: "Light activity — window-shopping speed, below the moderate-intensity threshold.",
  },
  {
    maxKmh: 4.8,
    label: "Easy walk",
    note: "Comfortable everyday pace, still short of the brisk 3 mph line.",
  },
  {
    maxKmh: 6.4,
    label: "Brisk",
    note: "Moderate intensity — this is the pace that counts toward the 150 minutes a week target.",
  },
  {
    maxKmh: 7.2,
    label: "Power walk",
    note: "Vigorous for most adults; breathing is hard enough that talking comes in short phrases.",
  },
  {
    maxKmh: Infinity,
    label: "Race-walk pace",
    note: "Faster than 4.5 mph — near competitive walking speed and hard to hold for long.",
  },
];

/** Standard distances, in kilometres, used for the split table. */
export const SPLIT_DISTANCES = [
  { label: "1 km", km: 1 },
  { label: "1 mile", km: KM_PER_MILE },
  { label: "5 km", km: 5 },
  { label: "10 km", km: 10 },
  { label: "Half marathon", km: 21.0975 },
  { label: "Marathon", km: 42.195 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Linear interpolation across the Compendium walking table, clamped at both ends. */
export function metForSpeedMph(mph) {
  if (!isNum(mph) || mph <= 0) return STROLL_MET;
  const first = WALK_MET_TABLE[0];
  const last = WALK_MET_TABLE[WALK_MET_TABLE.length - 1];
  if (mph < first.mph) return STROLL_MET;
  if (mph >= last.mph) return last.met;
  for (let i = 0; i < WALK_MET_TABLE.length - 1; i += 1) {
    const a = WALK_MET_TABLE[i];
    const b = WALK_MET_TABLE[i + 1];
    if (mph >= a.mph && mph < b.mph) {
      const t = (mph - a.mph) / (b.mph - a.mph);
      return a.met + t * (b.met - a.met);
    }
  }
  return last.met;
}

export function bandForSpeedKmh(kmh) {
  return PACE_BANDS.find((band) => kmh < band.maxKmh) ?? PACE_BANDS[PACE_BANDS.length - 1];
}

/** Seconds -> "h:mm:ss" or "m:ss". Pure string formatting, no locale needed. */
export function formatDuration(totalSeconds) {
  if (!isNum(totalSeconds) || totalSeconds < 0) return "—";
  const rounded = Math.round(totalSeconds);
  const h = Math.floor(rounded / 3600);
  const m = Math.floor((rounded % 3600) / 60);
  const s = rounded % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/**
 * @param {object} input
 * @param {number} input.distance   distance covered, in the chosen unit
 * @param {"km"|"mi"} input.unit    unit of the distance value
 * @param {number} input.hours
 * @param {number} input.minutes
 * @param {number} input.seconds
 * @param {number} input.weightKg   body mass, used only for the calorie estimate
 * @param {number} input.stepsTaken optional step count, for cadence and stride length
 */
export function computeWalkingPace({
  distance,
  unit = "km",
  hours = 0,
  minutes = 0,
  seconds = 0,
  weightKg = 0,
  stepsTaken = 0,
} = {}) {
  if (![distance, hours, minutes, seconds, weightKg, stepsTaken].every(isNum)) {
    return { error: "Enter a number in every field." };
  }
  if (unit !== "km" && unit !== "mi") {
    return { error: "Choose kilometres or miles." };
  }
  if (distance <= 0) {
    return { error: "Distance must be greater than zero." };
  }
  if (hours < 0 || minutes < 0 || seconds < 0) {
    return { error: "Time values cannot be negative." };
  }
  if (weightKg < 0 || stepsTaken < 0) {
    return { error: "Weight and step count cannot be negative." };
  }

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  if (totalSeconds <= 0) {
    return { error: "Enter how long the walk took." };
  }

  const distanceKm = unit === "mi" ? distance * KM_PER_MILE : distance;
  const distanceMiles = distanceKm / KM_PER_MILE;
  const totalMinutes = totalSeconds / 60;
  const hoursElapsed = totalSeconds / 3600;

  const speedKmh = distanceKm / hoursElapsed;
  if (speedKmh > MAX_WALK_KMH) {
    return {
      error: `That works out to ${speedKmh.toFixed(1)} km/h, faster than any human walks — check the distance and time.`,
    };
  }
  const speedMph = distanceMiles / hoursElapsed;

  const paceSecPerKm = totalSeconds / distanceKm;
  const paceSecPerMile = totalSeconds / distanceMiles;

  const met = metForSpeedMph(speedMph);
  const band = bandForSpeedKmh(speedKmh);
  const kcal = weightKg > 0 ? met * MET_KCAL_FACTOR * weightKg * totalMinutes : 0;

  const cadence = stepsTaken > 0 ? stepsTaken / totalMinutes : 0;
  const strideM = stepsTaken > 0 ? (distanceKm * 1000) / stepsTaken : 0;

  const splits = SPLIT_DISTANCES.map((entry) => ({
    label: entry.label,
    km: entry.km,
    seconds: paceSecPerKm * entry.km,
  }));

  return {
    distanceKm,
    distanceMiles,
    totalSeconds,
    totalMinutes,
    speedKmh,
    speedMph,
    paceSecPerKm,
    paceSecPerMile,
    paceMinPerKm: paceSecPerKm / 60,
    paceMinPerMile: paceSecPerMile / 60,
    met,
    bandLabel: band.label,
    bandNote: band.note,
    kcal,
    hasWeight: weightKg > 0,
    cadence,
    strideM,
    hasSteps: stepsTaken > 0,
    splits,
  };
}
