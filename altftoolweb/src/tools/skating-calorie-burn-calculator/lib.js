/**
 * Skating (inline, quad and ice) energy expenditure.
 *
 * Energy model: the ACSM metabolic equivalent definition — 1 MET is a resting
 * oxygen uptake of 3.5 mL O2 per kg per minute, and 1 L of O2 liberates ~5 kcal:
 *   kcal/min = MET x 3.5 x bodyMassKg / 200
 *
 * MET values are published rows of the 2011 Compendium of Physical Activities
 * (Ainsworth et al., Med Sci Sports Exerc 43(8):1575-81). The in-line skating
 * rows are defined at four specific speeds, so this module selects the row
 * whose published speed is nearest to yours rather than interpolating between
 * rows that were never measured that way.
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
 * In-line skating rows, 2011 Compendium of Physical Activities:
 *   in-line skating, 14.4 km/h (9.0 mph), recreational pace ........ 7.5 METs
 *   in-line skating, 17.7 km/h (11.0 mph), moderate exercise pace .. 9.8 METs
 *   in-line skating, 21.0 km/h (13.0 mph), fast exercise pace ...... 12.3 METs
 *   in-line skating, 24.0 km/h (15.0 mph), maximal effort .......... 14.0 METs
 * Band edges sit at the midpoints between the published speeds (10, 12 and
 * 14 mph), so each speed maps to its nearest measured row.
 */
export const INLINE_BANDS = [
  { id: "rec", label: "Recreational pace, about 14.4 km/h (9 mph)", met: 7.5, maxMph: 10 },
  { id: "moderate", label: "Moderate training pace, about 17.7 km/h (11 mph)", met: 9.8, maxMph: 12 },
  { id: "fast", label: "Fast training pace, about 21.0 km/h (13 mph)", met: 12.3, maxMph: 14 },
  { id: "max", label: "Maximal effort, about 24.0 km/h (15 mph)", met: 14.0, maxMph: Infinity },
];

/**
 * Ice skating rows, 2011 Compendium of Physical Activities:
 *   skating, ice, 9 mph or less ................................... 5.5 METs
 *   skating, ice, rapidly, more than 9 mph, not competitive ....... 9.0 METs
 * The 9 mph edge is the published boundary, equal to 14.484 km/h.
 */
export const ICE_BANDS = [
  { id: "easy", label: "9 mph (14.5 km/h) or less", met: 5.5, maxMph: 9 },
  { id: "rapid", label: "Faster than 9 mph, not competitive", met: 9.0, maxMph: Infinity },
];

/**
 * Disciplines. Those with a fixed MET use a single published Compendium row:
 *   roller skating (quad) ......................................... 7.0 METs
 *   skating, speed, competitive ................................... 13.3 METs
 */
export const DISCIPLINES = [
  {
    id: "inline",
    label: "Inline skating / rollerblading",
    bands: INLINE_BANDS,
    met: null,
    defaultSpeedKmh: 16,
  },
  {
    id: "ice",
    label: "Ice skating (recreational)",
    bands: ICE_BANDS,
    met: null,
    defaultSpeedKmh: 12,
  },
  {
    id: "quad",
    label: "Quad roller skating / rink session",
    bands: null,
    met: 7.0,
    defaultSpeedKmh: 12,
  },
  {
    id: "speed",
    label: "Competitive speed skating",
    bands: null,
    met: 13.3,
    defaultSpeedKmh: 30,
  },
];

export const LIMITS = {
  weightKg: { min: 20, max: 300 },
  speedKmh: { min: 1, max: 60 },
  minutes: { min: 1, max: 1440 },
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** kcal burned at a given MET for a given mass and duration in minutes. */
export function kcalFromMet(met, weightKg, minutes) {
  if (!isNum(met) || !isNum(weightKg) || !isNum(minutes)) return 0;
  if (met <= 0 || weightKg <= 0 || minutes <= 0) return 0;
  return (met * MET_ML_O2_PER_KG_MIN * weightKg * minutes) / KCAL_CONVERSION_DIVISOR;
}

/** Pick the band whose published speed range contains this mph figure. */
export function bandForSpeed(bands, speedMph) {
  if (!Array.isArray(bands) || bands.length === 0) return null;
  if (!isNum(speedMph)) return bands[0];
  return bands.find((band) => speedMph <= band.maxMph) || bands[bands.length - 1];
}

/**
 * Compute a skating session.
 * @returns {{error:string}|object} plain result object, never NaN or Infinity.
 */
export function computeSkatingSession({
  weightKg,
  speedKmh,
  minutes,
  discipline = "inline",
} = {}) {
  const required = { weightKg, speedKmh, minutes };
  for (const key of Object.keys(required)) {
    if (!isNum(required[key])) return { error: "Enter a valid number in every field." };
  }

  if (weightKg < LIMITS.weightKg.min || weightKg > LIMITS.weightKg.max) {
    return {
      error: `Body weight should be between ${LIMITS.weightKg.min} and ${LIMITS.weightKg.max} kg.`,
    };
  }
  if (speedKmh < LIMITS.speedKmh.min || speedKmh > LIMITS.speedKmh.max) {
    return {
      error: `Skating speed should be between ${LIMITS.speedKmh.min} and ${LIMITS.speedKmh.max} km/h.`,
    };
  }
  if (minutes < LIMITS.minutes.min || minutes > LIMITS.minutes.max) {
    return {
      error: `Session length should be between ${LIMITS.minutes.min} and ${LIMITS.minutes.max} minutes.`,
    };
  }

  const sport = DISCIPLINES.find((item) => item.id === discipline) || DISCIPLINES[0];
  const speedMph = speedKmh / KM_PER_MILE;
  const band = sport.bands ? bandForSpeed(sport.bands, speedMph) : null;
  const met = sport.met === null && band ? band.met : sport.met;

  if (!isNum(met) || met <= 0) return { error: "That discipline has no usable intensity value." };

  const hours = minutes / 60;
  const distanceKm = speedKmh * hours;
  const grossKcal = kcalFromMet(met, weightKg, minutes);
  const restingKcal = kcalFromMet(RESTING_MET, weightKg, minutes);
  const netKcal = Math.max(0, grossKcal - restingKcal);

  const kcalPerKm = distanceKm > 0 ? grossKcal / distanceKm : 0;
  const kcalPerHour = hours > 0 ? grossKcal / hours : 0;
  const kcalPerMinute = minutes > 0 ? grossKcal / minutes : 0;

  return {
    disciplineLabel: sport.label,
    speedDrivesMet: sport.met === null,
    bandLabel: band ? band.label : sport.label,
    met,
    speedKmh,
    speedMph,
    minutes,
    hours,
    distanceKm,
    grossKcal,
    restingKcal,
    netKcal,
    kcalPerKm,
    kcalPerHour,
    kcalPerMinute,
  };
}

/** Minutes of skating at the same intensity needed to reach a calorie target. */
export function minutesForTarget({ kcalPerMinute, targetKcal } = {}) {
  if (!isNum(kcalPerMinute) || !isNum(targetKcal)) return null;
  if (kcalPerMinute <= 0 || targetKcal <= 0) return null;
  return targetKcal / kcalPerMinute;
}
