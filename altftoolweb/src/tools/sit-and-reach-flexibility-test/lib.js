/**
 * Sit-and-reach (trunk forward flexion) flexibility scoring.
 *
 * Norms are the CSEP / Canadian Physical Activity, Fitness & Lifestyle Approach
 * trunk forward flexion tables, also reproduced in ACSM's Guidelines for
 * Exercise Testing and Prescription. They assume a sit-and-reach box whose
 * scale reads 26 cm at the footline, so that just touching the toes scores
 * 26 cm. Protocol: warm up, shoes off, knees straight, slide the marker forward
 * slowly and hold for two seconds; record the best of three or four trials.
 */

/** Scale position of the footline on the standard box, in centimetres. */
export const STANDARD_FOOTLINE_CM = 26;

/** The other footline commonly found on older boxes, in centimetres. */
export const ALTERNATE_FOOTLINE_CM = 23;

/** Centimetres in one inch (exact, by definition). */
export const CM_PER_INCH = 2.54;

/** Plausible reading window on the 26 cm scale, in centimetres. */
export const MIN_READING_CM = -30;
export const MAX_READING_CM = 70;

export const AGE_GROUPS = [
  { min: 15, max: 19, label: "15-19" },
  { min: 20, max: 29, label: "20-29" },
  { min: 30, max: 39, label: "30-39" },
  { min: 40, max: 49, label: "40-49" },
  { min: 50, max: 59, label: "50-59" },
  { min: 60, max: 69, label: "60-69" },
];

export const MIN_AGE = 15;
export const MAX_TABLE_AGE = 69;

/** Rating names, best first. */
export const BANDS = ["Excellent", "Very good", "Good", "Fair", "Needs improvement"];

/**
 * Minimum reading in centimetres (26 cm footline) for Excellent, Very good,
 * Good and Fair. Below the last value is "Needs improvement".
 * Source: CSEP/CPAFLA trunk forward flexion norms.
 */
export const SIT_REACH_NORMS = {
  male: {
    "15-19": [39, 34, 29, 24],
    "20-29": [40, 34, 30, 25],
    "30-39": [38, 33, 28, 23],
    "40-49": [35, 29, 24, 18],
    "50-59": [35, 28, 24, 16],
    "60-69": [33, 25, 20, 15],
  },
  female: {
    "15-19": [43, 38, 34, 29],
    "20-29": [41, 37, 33, 28],
    "30-39": [41, 36, 32, 27],
    "40-49": [38, 34, 30, 25],
    "50-59": [39, 33, 30, 25],
    "60-69": [35, 31, 27, 23],
  },
};

/** Published age band label for an age, clamped onto the oldest band above 69. */
export function ageGroupFor(age) {
  const found = AGE_GROUPS.find((group) => age >= group.min && age <= group.max);
  if (found) return found.label;
  if (age > MAX_TABLE_AGE) return AGE_GROUPS[AGE_GROUPS.length - 1].label;
  return null;
}

/**
 * Convert a raw box reading to centimetres on the standard 26 cm scale.
 * A box whose footline sits at 23 cm reads exactly 3 cm lower for the same
 * physical reach, so 3 cm is added back.
 */
export function toStandardCm(reading, unit, footlineCm) {
  const cm = unit === "in" ? reading * CM_PER_INCH : reading;
  return cm + (STANDARD_FOOTLINE_CM - footlineCm);
}

/**
 * Score a sit-and-reach reading.
 *
 * @param {{ age:number, sex:"male"|"female", reading:number, unit?:"cm"|"in",
 *           footlineCm?:number, previousReading?:number|null }} input
 * @returns {object} rating result, or { error } for unusable input.
 */
export function scoreSitAndReach({
  age,
  sex,
  reading,
  unit = "cm",
  footlineCm = STANDARD_FOOTLINE_CM,
  previousReading = null,
}) {
  if (!Number.isFinite(age) || !Number.isFinite(reading)) {
    return { error: "Enter your age and the box reading as numbers." };
  }
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female — the reference tables differ." };
  }
  if (unit !== "cm" && unit !== "in") {
    return { error: "Choose centimetres or inches." };
  }
  if (footlineCm !== STANDARD_FOOTLINE_CM && footlineCm !== ALTERNATE_FOOTLINE_CM) {
    return { error: "Choose a 26 cm or 23 cm footline box." };
  }
  if (age < MIN_AGE) {
    return { error: `These norms start at age ${MIN_AGE}.` };
  }
  if (age > 120) {
    return { error: "Enter an age of 120 or below." };
  }
  if (previousReading !== null && !Number.isFinite(previousReading)) {
    return { error: "The previous reading must be a number, or left blank." };
  }

  const standardCm = toStandardCm(reading, unit, footlineCm);
  if (standardCm < MIN_READING_CM || standardCm > MAX_READING_CM) {
    return {
      error: `A reading of ${MIN_READING_CM} to ${MAX_READING_CM} cm on the 26 cm scale is expected — check the units and the box scale.`,
    };
  }

  const groupLabel = ageGroupFor(age);
  const cutoffs = SIT_REACH_NORMS[sex][groupLabel];

  let bandIndex = cutoffs.findIndex((cutoff) => standardCm >= cutoff);
  if (bandIndex === -1) bandIndex = BANDS.length - 1;

  const nextBandIndex = bandIndex - 1;
  const nextBand = nextBandIndex >= 0 ? BANDS[nextBandIndex] : null;
  const cmToNextBand = nextBandIndex >= 0 ? cutoffs[nextBandIndex] - standardCm : 0;

  // Distance past (or short of) the toes: the footline reads 26 on the standard scale.
  const pastToesCm = standardCm - STANDARD_FOOTLINE_CM;

  let change = null;
  if (previousReading !== null) {
    const previousStandardCm = toStandardCm(previousReading, unit, footlineCm);
    change = {
      previousStandardCm,
      deltaCm: standardCm - previousStandardCm,
      deltaIn: (standardCm - previousStandardCm) / CM_PER_INCH,
      improved: standardCm > previousStandardCm,
    };
  }

  const rows = BANDS.map((name, index) => ({
    name,
    min: index < cutoffs.length ? cutoffs[index] : MIN_READING_CM,
    max: index === 0 ? null : cutoffs[index - 1] - 1,
    current: index === bandIndex,
  }));

  return {
    standardCm,
    standardIn: standardCm / CM_PER_INCH,
    pastToesCm,
    reachesToes: standardCm >= STANDARD_FOOTLINE_CM,
    band: BANDS[bandIndex],
    bandIndex,
    ageGroup: groupLabel,
    ageAboveTable: age > MAX_TABLE_AGE,
    cutoffs,
    excellentAt: cutoffs[0],
    nextBand,
    cmToNextBand,
    change,
    rows,
    converted: unit === "in" || footlineCm !== STANDARD_FOOTLINE_CM,
  };
}
