/**
 * Cooper 12-minute run test
 *
 * Kenneth H. Cooper's field test (JAMA, 1968): run or walk as far as possible in
 * 12 minutes on a flat measured course, then estimate maximal oxygen uptake
 * from the distance covered.
 *
 *   VO2 max (ml/kg/min) = (distance in metres - 504.9) / 44.73
 *
 * The equivalent imperial form is VO2 max = 35.97 x miles - 11.29, which agrees
 * with the metric version to about 0.1 ml/kg/min.
 *
 * The fitness ratings are Cooper's published distance categories by age band and
 * sex. Informational only: this is an estimate from a field test, not a
 * laboratory measurement, and a maximal effort test is not appropriate for
 * everyone — check with a doctor first if you are unwell, inactive or have a
 * heart, lung or joint condition.
 */

/** Test duration in minutes. */
export const COOPER_DURATION_MIN = 12;

/** Regression constants from Cooper's distance-to-VO2max equation. */
export const VO2_INTERCEPT_M = 504.9;
export const VO2_DIVISOR = 44.73;

/** Imperial form of the same regression, kept for cross-checking. */
export const VO2_MILES_SLOPE = 35.97;
export const VO2_MILES_INTERCEPT = 11.29;

export const METRES_PER_MILE = 1609.344;

/** One MET is 3.5 ml of oxygen per kg per minute, by definition. */
export const ML_PER_MET = 3.5;

/**
 * Below this distance the linear equation stops being meaningful — 800 m in
 * 12 minutes is a 4 km/h walk, already the bottom of any published table.
 */
export const MIN_DISTANCE_M = 800;
/** No human has covered this in 12 minutes; anything above it is a typo. */
export const MAX_DISTANCE_M = 6000;

export const AGE_MIN = 13;
export const AGE_MAX = 100;

/**
 * Cooper's 12-minute run distance categories, in metres, by sex and age band.
 * Each row lists the lower bound of the category; the top category is open-ended.
 */
export const COOPER_TABLE = {
  male: [
    { minAge: 13, maxAge: 14, bands: [{ min: 2700, label: "Excellent" }, { min: 2400, label: "Above average" }, { min: 2200, label: "Average" }, { min: 2100, label: "Below average" }, { min: 0, label: "Poor" }] },
    { minAge: 15, maxAge: 16, bands: [{ min: 2800, label: "Excellent" }, { min: 2500, label: "Above average" }, { min: 2300, label: "Average" }, { min: 2200, label: "Below average" }, { min: 0, label: "Poor" }] },
    { minAge: 17, maxAge: 19, bands: [{ min: 3000, label: "Excellent" }, { min: 2700, label: "Above average" }, { min: 2500, label: "Average" }, { min: 2300, label: "Below average" }, { min: 0, label: "Poor" }] },
    { minAge: 20, maxAge: 29, bands: [{ min: 2800, label: "Excellent" }, { min: 2400, label: "Above average" }, { min: 2200, label: "Average" }, { min: 1600, label: "Below average" }, { min: 0, label: "Poor" }] },
    { minAge: 30, maxAge: 39, bands: [{ min: 2700, label: "Excellent" }, { min: 2300, label: "Above average" }, { min: 1900, label: "Average" }, { min: 1500, label: "Below average" }, { min: 0, label: "Poor" }] },
    { minAge: 40, maxAge: 49, bands: [{ min: 2500, label: "Excellent" }, { min: 2100, label: "Above average" }, { min: 1700, label: "Average" }, { min: 1400, label: "Below average" }, { min: 0, label: "Poor" }] },
    { minAge: 50, maxAge: AGE_MAX, bands: [{ min: 2400, label: "Excellent" }, { min: 2000, label: "Above average" }, { min: 1600, label: "Average" }, { min: 1300, label: "Below average" }, { min: 0, label: "Poor" }] },
  ],
  female: [
    { minAge: 13, maxAge: 14, bands: [{ min: 2000, label: "Excellent" }, { min: 1900, label: "Above average" }, { min: 1600, label: "Average" }, { min: 1500, label: "Below average" }, { min: 0, label: "Poor" }] },
    { minAge: 15, maxAge: 16, bands: [{ min: 2100, label: "Excellent" }, { min: 2000, label: "Above average" }, { min: 1700, label: "Average" }, { min: 1600, label: "Below average" }, { min: 0, label: "Poor" }] },
    { minAge: 17, maxAge: 19, bands: [{ min: 2300, label: "Excellent" }, { min: 2100, label: "Above average" }, { min: 1800, label: "Average" }, { min: 1700, label: "Below average" }, { min: 0, label: "Poor" }] },
    { minAge: 20, maxAge: 29, bands: [{ min: 2700, label: "Excellent" }, { min: 2200, label: "Above average" }, { min: 1800, label: "Average" }, { min: 1500, label: "Below average" }, { min: 0, label: "Poor" }] },
    { minAge: 30, maxAge: 39, bands: [{ min: 2500, label: "Excellent" }, { min: 2000, label: "Above average" }, { min: 1700, label: "Average" }, { min: 1400, label: "Below average" }, { min: 0, label: "Poor" }] },
    { minAge: 40, maxAge: 49, bands: [{ min: 2300, label: "Excellent" }, { min: 1900, label: "Above average" }, { min: 1500, label: "Average" }, { min: 1200, label: "Below average" }, { min: 0, label: "Poor" }] },
    { minAge: 50, maxAge: AGE_MAX, bands: [{ min: 2200, label: "Excellent" }, { min: 1700, label: "Above average" }, { min: 1400, label: "Average" }, { min: 1100, label: "Below average" }, { min: 0, label: "Poor" }] },
  ],
};

export const DISTANCE_UNITS = [
  { value: "m", label: "metres", toMetres: (value) => value },
  { value: "km", label: "kilometres", toMetres: (value) => value * 1000 },
  { value: "mi", label: "miles", toMetres: (value) => value * METRES_PER_MILE },
];

/** Convert a distance in any supported unit to metres. Returns null if unknown. */
export function toMetres(distance, unit) {
  const entry = DISTANCE_UNITS.find((u) => u.value === unit);
  const value = Number(distance);
  if (!entry || !Number.isFinite(value)) return null;
  return entry.toMetres(value);
}

/** VO2 max in ml/kg/min from a 12-minute distance in metres. */
export function vo2MaxFromMetres(metres) {
  const d = Number(metres);
  if (!Number.isFinite(d)) return null;
  return (d - VO2_INTERCEPT_M) / VO2_DIVISOR;
}

/** The same estimate via Cooper's imperial regression, used as a cross-check. */
export function vo2MaxFromMiles(miles) {
  const m = Number(miles);
  if (!Number.isFinite(m)) return null;
  return VO2_MILES_SLOPE * m - VO2_MILES_INTERCEPT;
}

export function ratingRowFor(sex, age) {
  const rows = COOPER_TABLE[sex];
  if (!rows) return null;
  return rows.find((row) => age >= row.minAge && age <= row.maxAge) || null;
}

export function ratingForDistance(sex, age, metres) {
  const row = ratingRowFor(sex, age);
  if (!row) return null;
  const band = row.bands.find((b) => metres >= b.min);
  return band ? { label: band.label, row } : null;
}

/**
 * Score a Cooper test.
 *
 * @param {object} input
 * @param {number} input.distance      Distance covered in 12 minutes.
 * @param {"m"|"km"|"mi"} [input.unit] Unit of that distance. Defaults to metres.
 * @param {number} input.age           Age in years, used for the rating table.
 * @param {"male"|"female"} input.sex  Used for the rating table.
 * @returns {object} Result object, or { error } when it cannot be scored.
 */
export function computeCooperTest({ distance, unit = "m", age, sex = "male" } = {}) {
  const metres = toMetres(distance, unit);
  if (metres === null) {
    return { error: "Enter the distance you covered as a number, and pick a unit." };
  }
  if (metres < MIN_DISTANCE_M) {
    return {
      error: `Cooper's equation is only meaningful from about ${MIN_DISTANCE_M} m in 12 minutes — a slow walk. Check the distance and unit.`,
    };
  }
  if (metres > MAX_DISTANCE_M) {
    return { error: `${Math.round(metres)} m in 12 minutes is faster than the world record pace. Check the distance and unit.` };
  }

  const a = Number(age);
  if (!Number.isFinite(a) || a < AGE_MIN || a > AGE_MAX) {
    return { error: `Enter an age between ${AGE_MIN} and ${AGE_MAX}. Cooper's tables start at ${AGE_MIN}.` };
  }
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female — Cooper's rating tables are sex-specific." };
  }

  const vo2Max = vo2MaxFromMetres(metres);
  const miles = metres / METRES_PER_MILE;
  const rating = ratingForDistance(sex, a, metres);

  // Speed and pace over the fixed 12-minute test window.
  const speedKmh = metres / 1000 / (COOPER_DURATION_MIN / 60);
  const pacePerKmMin = COOPER_DURATION_MIN / (metres / 1000);
  const pacePerKmSeconds = Math.round(pacePerKmMin * 60);

  return {
    metres,
    km: metres / 1000,
    miles,
    laps400: metres / 400,
    vo2Max,
    vo2MaxImperialCheck: vo2MaxFromMiles(miles),
    mets: vo2Max / ML_PER_MET,
    speedKmh,
    pacePerKmSeconds,
    paceLabel: `${Math.floor(pacePerKmSeconds / 60)}:${String(pacePerKmSeconds % 60).padStart(2, "0")} min/km`,
    rating: rating ? rating.label : "",
    ratingRow: rating ? rating.row : null,
    age: a,
    sex,
    durationMin: COOPER_DURATION_MIN,
  };
}
