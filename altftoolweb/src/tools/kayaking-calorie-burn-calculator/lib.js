/**
 * Kayaking / paddling energy expenditure.
 *
 * Energy model: the ACSM metabolic equivalent definition — 1 MET is a resting
 * oxygen uptake of 3.5 mL O2 per kg per minute, and 1 L of O2 liberates ~5 kcal:
 *   kcal/min = MET x 3.5 x bodyMassKg / 200
 *
 * MET values are published rows of the 2011 Compendium of Physical Activities
 * (Ainsworth et al., Med Sci Sports Exerc 43(8):1575-81). On flat water the
 * Compendium defines paddling intensity by boat speed, so the speed you
 * actually achieved selects the row. Sea kayaking and whitewater have their own
 * single rows because boat speed is a poor proxy for effort there.
 */

/** 1 MET expressed as oxygen uptake, mL O2 per kg per minute (ACSM definition). */
export const MET_ML_O2_PER_KG_MIN = 3.5;

/** Divisor converting mL O2/kg/min into kcal/min (1 L O2 ~ 5 kcal => 1000/5). */
export const KCAL_CONVERSION_DIVISOR = 200;

/** Exact statute mile in kilometres (international definition). */
export const KM_PER_MILE = 1.609344;

/** Resting baseline used to convert gross calories to net. */
export const RESTING_MET = 1;

/**
 * Flat-water paddling speed bands, 2011 Compendium of Physical Activities.
 * The published rows are defined in miles per hour:
 *   canoeing / rowing / paddling, 2.0-3.9 mph, light effort .... 2.8 METs
 *   canoeing / rowing / paddling, 4.0-5.9 mph, moderate effort . 5.8 METs
 *   canoeing / rowing / paddling, over 6.0 mph, vigorous effort  12.5 METs
 * There is no published row below 2.0 mph, so the light row is used as a floor
 * rather than extrapolating downwards.
 */
export const FLAT_WATER_BANDS = [
  { id: "light", label: "Light effort (under 4.0 mph / 6.4 km/h)", met: 2.8, maxMph: 3.999 },
  { id: "moderate", label: "Moderate effort (4.0-5.9 mph / 6.4-9.5 km/h)", met: 5.8, maxMph: 5.999 },
  { id: "vigorous", label: "Vigorous effort (6.0 mph / 9.7 km/h and above)", met: 12.5, maxMph: Infinity },
];

/**
 * Water-type models. "flat" resolves its MET from the speed bands above;
 * the others use their own published Compendium row.
 *   kayaking, moderate effort ................................. 5.0 METs
 *   whitewater rafting, kayaking or canoeing .................. 5.0 METs
 *   canoeing / rowing / kayaking, competition, over 6 mph ..... 12.5 METs
 */
export const WATER_TYPES = [
  {
    id: "flat",
    label: "Flat water — intensity from your pace",
    met: null,
    note: "Speed selects the published Compendium band.",
  },
  {
    id: "sea",
    label: "Sea or open-water touring",
    met: 5.0,
    note: "Uses the single kayaking, moderate effort row (5.0 METs).",
  },
  {
    id: "whitewater",
    label: "Whitewater",
    met: 5.0,
    note: "Uses the whitewater kayaking / rafting row (5.0 METs).",
  },
  {
    id: "race",
    label: "Racing or competition paddling",
    met: 12.5,
    note: "Uses the competition paddling row (12.5 METs).",
  },
];

export const LIMITS = {
  weightKg: { min: 20, max: 300 },
  distanceKm: { min: 0.1, max: 200 },
  minutes: { min: 1, max: 1440 },
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** kcal burned at a given MET for a given mass and duration in minutes. */
export function kcalFromMet(met, weightKg, minutes) {
  if (!isNum(met) || !isNum(weightKg) || !isNum(minutes)) return 0;
  if (met <= 0 || weightKg <= 0 || minutes <= 0) return 0;
  return (met * MET_ML_O2_PER_KG_MIN * weightKg * minutes) / KCAL_CONVERSION_DIVISOR;
}

/** Pick the flat-water Compendium band for a speed in miles per hour. */
export function flatWaterBand(speedMph) {
  if (!isNum(speedMph)) return FLAT_WATER_BANDS[0];
  return FLAT_WATER_BANDS.find((band) => speedMph <= band.maxMph) || FLAT_WATER_BANDS[0];
}

/**
 * Compute a paddling session.
 * @returns {{error:string}|object} plain result object, never NaN or Infinity.
 */
export function computePaddleSession({
  weightKg,
  distanceKm,
  minutes,
  waterType = "flat",
} = {}) {
  const required = { weightKg, distanceKm, minutes };
  for (const key of Object.keys(required)) {
    if (!isNum(required[key])) return { error: "Enter a valid number in every field." };
  }

  if (weightKg < LIMITS.weightKg.min || weightKg > LIMITS.weightKg.max) {
    return {
      error: `Body weight should be between ${LIMITS.weightKg.min} and ${LIMITS.weightKg.max} kg.`,
    };
  }
  if (distanceKm < LIMITS.distanceKm.min || distanceKm > LIMITS.distanceKm.max) {
    return {
      error: `Distance paddled should be between ${LIMITS.distanceKm.min} and ${LIMITS.distanceKm.max} km.`,
    };
  }
  if (minutes < LIMITS.minutes.min || minutes > LIMITS.minutes.max) {
    return {
      error: `Time on the water should be between ${LIMITS.minutes.min} and ${LIMITS.minutes.max} minutes.`,
    };
  }

  const water = WATER_TYPES.find((item) => item.id === waterType) || WATER_TYPES[0];

  const hours = minutes / 60;
  const speedKmh = distanceKm / hours;
  const speedMph = speedKmh / KM_PER_MILE;
  const minutesPerKm = minutes / distanceKm;

  const band = flatWaterBand(speedMph);
  const met = water.met === null ? band.met : water.met;
  const intensityLabel = water.met === null ? band.label : water.note;

  const grossKcal = kcalFromMet(met, weightKg, minutes);
  const restingKcal = kcalFromMet(RESTING_MET, weightKg, minutes);
  const netKcal = Math.max(0, grossKcal - restingKcal);

  const kcalPerKm = distanceKm > 0 ? grossKcal / distanceKm : 0;
  const kcalPerHour = hours > 0 ? grossKcal / hours : 0;
  const kcalPerMinute = minutes > 0 ? grossKcal / minutes : 0;

  return {
    waterLabel: water.label,
    waterNote: water.note,
    intensityLabel,
    met,
    speedKmh,
    speedMph,
    minutesPerKm,
    hours,
    grossKcal,
    restingKcal,
    netKcal,
    kcalPerKm,
    kcalPerHour,
    kcalPerMinute,
  };
}

/**
 * Distance (km) that would need to be paddled at the same speed and intensity
 * to reach a calorie target. Returns null when it cannot be computed.
 */
export function distanceForTarget({ kcalPerKm, targetKcal } = {}) {
  if (!isNum(kcalPerKm) || !isNum(targetKcal)) return null;
  if (kcalPerKm <= 0 || targetKcal <= 0) return null;
  return targetKcal / kcalPerKm;
}
