/**
 * Push-up fitness benchmark.
 *
 * Norms are the push-up tables published in the Canadian Society for Exercise
 * Physiology (CSEP) Canadian Physical Activity, Fitness & Lifestyle Approach
 * (CPAFLA) appraisal manual, the tables most commonly reproduced by ACSM and by
 * national fitness testing guides. Protocol: as many consecutive push-ups as
 * possible with no time limit and no rest — the test ends at the first break in
 * form or the first pause. Men use the standard (toes) push-up; women use the
 * modified (knees) push-up, which is the position the female norms were
 * collected in.
 */

/** Lower age bound of each published age band, in years. */
export const AGE_GROUPS = [
  { min: 15, max: 19, label: "15-19" },
  { min: 20, max: 29, label: "20-29" },
  { min: 30, max: 39, label: "30-39" },
  { min: 40, max: 49, label: "40-49" },
  { min: 50, max: 59, label: "50-59" },
  { min: 60, max: 69, label: "60-69" },
];

/** Youngest and oldest age the published tables cover. */
export const MIN_AGE = 15;
export const MAX_TABLE_AGE = 69;

/** Highest rep count the input accepts — a sanity ceiling, not a world record. */
export const MAX_REPS = 500;

/**
 * Band names, best first. CSEP reports five categories; the approximate
 * population percentile span of each is given for context.
 */
export const BANDS = [
  { name: "Excellent", percentile: "81st-100th" },
  { name: "Very good", percentile: "61st-80th" },
  { name: "Good", percentile: "41st-60th" },
  { name: "Fair", percentile: "21st-40th" },
  { name: "Needs improvement", percentile: "1st-20th" },
];

/**
 * Minimum reps required for Excellent, Very good, Good and Fair, per age band.
 * Anything below the fourth number falls in "Needs improvement".
 * Source: CSEP/CPAFLA push-up norms.
 */
export const PUSHUP_NORMS = {
  male: {
    "15-19": [39, 29, 23, 18],
    "20-29": [36, 29, 22, 17],
    "30-39": [30, 22, 17, 12],
    "40-49": [25, 17, 13, 10],
    "50-59": [21, 13, 10, 7],
    "60-69": [18, 11, 8, 5],
  },
  female: {
    "15-19": [33, 25, 18, 12],
    "20-29": [30, 21, 15, 10],
    "30-39": [27, 20, 13, 8],
    "40-49": [24, 15, 11, 5],
    "50-59": [21, 11, 7, 2],
    "60-69": [17, 12, 5, 2],
  },
};

/** Push-up variation each set of norms was collected with. */
export const PROTOCOL = {
  male: "Standard push-up (toes), full range, no pause.",
  female: "Modified push-up (knees), full range, no pause.",
};

/**
 * Return the published age band label for an age, clamping ages above the top
 * of the table onto the oldest band.
 */
export function ageGroupFor(age) {
  const found = AGE_GROUPS.find((group) => age >= group.min && age <= group.max);
  if (found) return found.label;
  if (age > MAX_TABLE_AGE) return AGE_GROUPS[AGE_GROUPS.length - 1].label;
  return null;
}

/**
 * Classify a max push-up count.
 *
 * @param {{ age:number, sex:"male"|"female", reps:number }} input
 * @returns {object} band result, or { error } for unusable input.
 */
export function classifyPushups({ age, sex, reps }) {
  if (!Number.isFinite(age) || !Number.isFinite(reps)) {
    return { error: "Enter your age and your push-up count as numbers." };
  }
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female — the reference tables differ." };
  }
  if (age < MIN_AGE) {
    return { error: `These norms start at age ${MIN_AGE}. Youth testing uses different tables.` };
  }
  if (age > 120) {
    return { error: "Enter an age of 120 or below." };
  }
  if (reps < 0) {
    return { error: "Push-up count cannot be negative." };
  }
  if (reps > MAX_REPS) {
    return { error: `Enter a count of ${MAX_REPS} or fewer.` };
  }

  const groupLabel = ageGroupFor(age);
  const cutoffs = PUSHUP_NORMS[sex][groupLabel];
  const wholeReps = Math.floor(reps);

  let bandIndex = cutoffs.findIndex((cutoff) => wholeReps >= cutoff);
  if (bandIndex === -1) bandIndex = BANDS.length - 1;

  const nextBandIndex = bandIndex - 1;
  const nextBand = nextBandIndex >= 0 ? BANDS[nextBandIndex].name : null;
  const repsToNextBand = nextBandIndex >= 0 ? cutoffs[nextBandIndex] - wholeReps : 0;

  // Rows for a full reference table: [band name, minimum reps, maximum reps or null]
  const rows = BANDS.map((band, index) => ({
    name: band.name,
    percentile: band.percentile,
    min: index < cutoffs.length ? cutoffs[index] : 0,
    max: index === 0 ? null : cutoffs[index - 1] - 1,
    current: index === bandIndex,
  }));

  return {
    reps: wholeReps,
    band: BANDS[bandIndex].name,
    bandIndex,
    percentile: BANDS[bandIndex].percentile,
    ageGroup: groupLabel,
    ageAboveTable: age > MAX_TABLE_AGE,
    protocol: PROTOCOL[sex],
    cutoffs,
    excellentAt: cutoffs[0],
    nextBand,
    repsToNextBand,
    rows,
  };
}
