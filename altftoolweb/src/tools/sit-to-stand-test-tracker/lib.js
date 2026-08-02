/**
 * 30-second chair stand (sit-to-stand) test scoring.
 *
 * Reference ranges are the Rikli & Jones Senior Fitness Test normative values,
 * the same table the CDC STEADI fall-prevention toolkit uses. Each range spans
 * the 25th to 75th percentile for that age and sex, so a score inside the range
 * is "normal for age" and a score below it is the STEADI below-average marker
 * of increased fall risk.
 *
 * Protocol: a straight-backed chair about 43 cm (17 in) high against a wall,
 * arms folded across the chest, stand fully and sit fully as many times as
 * possible in 30 seconds. If you are more than halfway up when time expires,
 * that counts as a full stand.
 */

/** Duration of the standard test, in seconds. */
export const TEST_SECONDS = 30;

/** Standard chair seat height used in the Senior Fitness Test. */
export const CHAIR_HEIGHT_CM = 43;
export const CHAIR_HEIGHT_IN = 17;

/** Sanity ceiling on the count. */
export const MAX_STANDS = 100;

/** Age the published Senior Fitness Test norms start at. */
export const MIN_TABLE_AGE = 60;

export const AGE_GROUPS = [
  { min: 60, max: 64, label: "60-64" },
  { min: 65, max: 69, label: "65-69" },
  { min: 70, max: 74, label: "70-74" },
  { min: 75, max: 79, label: "75-79" },
  { min: 80, max: 84, label: "80-84" },
  { min: 85, max: 89, label: "85-89" },
  { min: 90, max: 94, label: "90-94" },
];

/**
 * Normal range (25th-75th percentile) of full stands in 30 seconds.
 * Source: Rikli & Jones Senior Fitness Test / CDC STEADI 30-second chair stand.
 */
export const CHAIR_STAND_NORMS = {
  male: {
    "60-64": [14, 19],
    "65-69": [12, 18],
    "70-74": [12, 17],
    "75-79": [11, 17],
    "80-84": [10, 15],
    "85-89": [8, 14],
    "90-94": [7, 12],
  },
  female: {
    "60-64": [12, 17],
    "65-69": [11, 16],
    "70-74": [10, 15],
    "75-79": [10, 15],
    "80-84": [9, 14],
    "85-89": [8, 13],
    "90-94": [4, 11],
  },
};

export const BAND_BELOW = "Below average for age";
export const BAND_NORMAL = "Within the normal range";
export const BAND_ABOVE = "Above average for age";

/** Published age band label, clamped onto the ends of the table. */
export function ageGroupFor(age) {
  // Age brackets are whole-year buckets (60-64, 65-69, ...). Floor first so a
  // fractional age (e.g. 64.5, however it was entered or computed) still
  // lands in the bracket for its actual age in whole years, instead of
  // falling through the gap between one bracket's max and the next
  // bracket's min and silently defaulting to 60-64.
  const years = Math.floor(age);
  const found = AGE_GROUPS.find((group) => years >= group.min && years <= group.max);
  if (found) return found.label;
  if (years > 94) return "90-94";
  return "60-64";
}

/**
 * Score a 30-second chair stand test.
 *
 * @param {{ age:number, sex:"male"|"female", stands:number,
 *           previousStands?:number|null, durationSeconds?:number }} input
 * @returns {object} result, or { error } for unusable input.
 */
export function classifyChairStand({
  age,
  sex,
  stands,
  previousStands = null,
  durationSeconds = TEST_SECONDS,
}) {
  if (!Number.isFinite(age) || !Number.isFinite(stands) || !Number.isFinite(durationSeconds)) {
    return { error: "Enter age, stand count and test length as numbers." };
  }
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female — the reference ranges differ." };
  }
  if (age < 18) {
    return { error: "This test is scored for adults aged 18 and over." };
  }
  if (age > 120) {
    return { error: "Enter an age of 120 or below." };
  }
  if (stands < 0) {
    return { error: "Stand count cannot be negative." };
  }
  if (stands > MAX_STANDS) {
    return { error: `Enter a count of ${MAX_STANDS} or fewer.` };
  }
  if (durationSeconds < 5 || durationSeconds > 120) {
    return { error: "Test length must be between 5 and 120 seconds." };
  }
  if (previousStands !== null && !Number.isFinite(previousStands)) {
    return { error: "The previous count must be a number, or left blank." };
  }
  if (previousStands !== null && (previousStands < 0 || previousStands > MAX_STANDS)) {
    return { error: `The previous count must be between 0 and ${MAX_STANDS}.` };
  }

  const rawStands = Math.floor(stands);
  // Scale to the 30-second standard if a different clock was used.
  const scaled = (rawStands * TEST_SECONDS) / durationSeconds;
  const score = Math.round(scaled);

  const groupLabel = ageGroupFor(age);
  const [low, high] = CHAIR_STAND_NORMS[sex][groupLabel];

  let band = BAND_NORMAL;
  if (score < low) band = BAND_BELOW;
  else if (score > high) band = BAND_ABOVE;

  const standsToNormal = score < low ? low - score : 0;
  const standsToAbove = score <= high ? high + 1 - score : 0;

  let change = null;
  if (previousStands !== null) {
    const previous = Math.floor(previousStands);
    change = {
      previous,
      delta: score - previous,
      improved: score > previous,
    };
  }

  return {
    rawStands,
    durationSeconds,
    score,
    normalised: durationSeconds !== TEST_SECONDS,
    secondsPerStand: score > 0 ? TEST_SECONDS / score : null,
    band,
    belowAverage: band === BAND_BELOW,
    rangeLow: low,
    rangeHigh: high,
    ageGroup: groupLabel,
    belowTableAge: age < MIN_TABLE_AGE,
    aboveTableAge: age > 94,
    standsToNormal,
    standsToAbove,
    change,
  };
}
