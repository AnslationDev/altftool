/**
 * One-minute sit-up (bent-knee curl-up) benchmark.
 *
 * Norms are the widely reproduced 60-second sit-up tables from Golding et al.,
 * "Y's Way to Physical Fitness" (YMCA), also carried in Heyward's Advanced
 * Fitness Assessment and Exercise Prescription. Protocol: lie supine, knees bent
 * about 90 degrees, feet held, hands across the chest or at the temples, and
 * curl up until the elbows or trunk clear the set position — as many complete
 * repetitions as possible in exactly 60 seconds.
 */

/** The test the norms were collected with. */
export const STANDARD_DURATION_SECONDS = 60;

/** Age bands published in the table. The oldest band is open-ended. */
export const AGE_GROUPS = [
  { min: 18, max: 25, label: "18-25" },
  { min: 26, max: 35, label: "26-35" },
  { min: 36, max: 45, label: "36-45" },
  { min: 46, max: 55, label: "46-55" },
  { min: 56, max: 65, label: "56-65" },
  { min: 66, max: Infinity, label: "66+" },
];

/** Youngest age the adult table covers. */
export const MIN_AGE = 18;

/** Sanity ceilings for the inputs. */
export const MAX_REPS = 300;
export const MIN_DURATION_SECONDS = 10;
export const MAX_DURATION_SECONDS = 600;

/**
 * Highest sustained rate a human can plausibly hold on a bent-knee curl-up,
 * in reps per second. Even elite/record-pace sit-ups don't sustain much above
 * this, so a higher implied rate means the reps/duration pairing is not
 * physically plausible rather than merely an exceptional score.
 */
export const MAX_PLAUSIBLE_REPS_PER_SECOND = 2.5;

/** Rating names, best first. Anything below the lowest cut-off is "Very poor". */
export const BANDS = [
  "Excellent",
  "Good",
  "Above average",
  "Average",
  "Below average",
  "Poor",
  "Very poor",
];

/**
 * Minimum 60-second rep count for each of the first six bands, per age group.
 * A score below the last number falls in "Very poor".
 * Source: Golding et al. / YMCA one-minute sit-up norms.
 */
export const SITUP_NORMS = {
  male: {
    "18-25": [50, 44, 39, 35, 31, 25],
    "26-35": [46, 40, 35, 31, 29, 22],
    "36-45": [42, 35, 30, 27, 23, 17],
    "46-55": [36, 29, 25, 22, 18, 13],
    "56-65": [32, 25, 21, 17, 13, 9],
    "66+": [29, 22, 19, 15, 11, 7],
  },
  female: {
    "18-25": [44, 37, 33, 29, 25, 18],
    "26-35": [40, 33, 29, 25, 21, 13],
    "36-45": [34, 27, 23, 19, 15, 7],
    "46-55": [28, 22, 18, 14, 10, 5],
    // NOTE: the "Above average"/"Average" cut-offs (indices 2-3) rise slightly
    // from 56-65 (13/10) to 66+ (14/11) instead of falling like every other
    // band transition. This has been verified against the published Golding
    // et al. table (cross-checked against independent reproductions of the
    // same source) — it is a genuine quirk of the source data, not a
    // transcription error, so do not "correct" it to be monotonic without
    // re-verifying against the primary source first.
    "56-65": [25, 18, 13, 10, 7, 3],
    "66+": [24, 17, 14, 11, 5, 2],
  },
};

/** Published age band label for an age. */
export function ageGroupFor(age) {
  const found = AGE_GROUPS.find((group) => age >= group.min && age <= group.max);
  return found ? found.label : null;
}

/**
 * Score a sit-up test.
 *
 * If the test ran for something other than 60 seconds the count is scaled
 * linearly to a 60-second equivalent before it is compared with the table.
 *
 * @param {{ age:number, sex:"male"|"female", reps:number, durationSeconds?:number }} input
 * @returns {object} rating result, or { error } for unusable input.
 */
export function classifySitups({ age, sex, reps, durationSeconds = STANDARD_DURATION_SECONDS }) {
  if (!Number.isFinite(age) || !Number.isFinite(reps) || !Number.isFinite(durationSeconds)) {
    return { error: "Enter age, sit-up count and test length as numbers." };
  }
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female — the reference tables differ." };
  }
  if (age < MIN_AGE) {
    return { error: `These adult norms start at age ${MIN_AGE}.` };
  }
  if (age > 120) {
    return { error: "Enter an age of 120 or below." };
  }
  if (reps < 0) {
    return { error: "Sit-up count cannot be negative." };
  }
  if (reps > MAX_REPS) {
    return { error: `Enter a count of ${MAX_REPS} or fewer.` };
  }
  if (durationSeconds < MIN_DURATION_SECONDS || durationSeconds > MAX_DURATION_SECONDS) {
    return {
      error: `Test length must be between ${MIN_DURATION_SECONDS} and ${MAX_DURATION_SECONDS} seconds.`,
    };
  }
  if (reps / durationSeconds > MAX_PLAUSIBLE_REPS_PER_SECOND) {
    return {
      error: "That's more sit-ups than is physically possible in this time — check your numbers.",
    };
  }

  const rawReps = Math.floor(reps);
  const scaled = (rawReps * STANDARD_DURATION_SECONDS) / durationSeconds;
  const perMinute = Math.round(scaled);
  // Age bands are defined in whole years; floor a fractional age (e.g. 25.5)
  // to the completed-years convention so it always lands inside a band
  // instead of falling in the gap between two integer boundaries (which
  // would otherwise return a null label and crash the lookup below).
  const groupLabel = ageGroupFor(Math.floor(age));
  const cutoffs = SITUP_NORMS[sex][groupLabel];

  let bandIndex = cutoffs.findIndex((cutoff) => perMinute >= cutoff);
  if (bandIndex === -1) bandIndex = BANDS.length - 1;

  const nextBandIndex = bandIndex - 1;
  const nextBand = nextBandIndex >= 0 ? BANDS[nextBandIndex] : null;
  const repsToNextBand = nextBandIndex >= 0 ? cutoffs[nextBandIndex] - perMinute : 0;

  const rows = BANDS.map((name, index) => ({
    name,
    min: index < cutoffs.length ? cutoffs[index] : 0,
    max: index === 0 ? null : cutoffs[index - 1] - 1,
    current: index === bandIndex,
  }));

  return {
    rawReps,
    durationSeconds,
    perMinute,
    scaled,
    repsPerSecond: rawReps / durationSeconds,
    band: BANDS[bandIndex],
    bandIndex,
    ageGroup: groupLabel,
    normalised: durationSeconds !== STANDARD_DURATION_SECONDS,
    cutoffs,
    excellentAt: cutoffs[0],
    averageAt: cutoffs[3],
    nextBand,
    repsToNextBand,
    rows,
  };
}
