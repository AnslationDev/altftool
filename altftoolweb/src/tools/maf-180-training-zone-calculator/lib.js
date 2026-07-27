/**
 * MAF 180 Formula — Dr Philip Maffetone's "maximum aerobic function" heart rate.
 *
 * Published in "The Big Book of Endurance Training and Racing" (2010) and on
 * philmaffetone.com/180-formula. The method:
 *
 *   1. Subtract your age from 180.
 *   2. Modify the result by ONE health/training category:
 *        a) recovering from major illness or surgery, or on regular medication  -> -10
 *        b) injured, regressing, 2+ colds a year, allergies/asthma, or returning -> -5
 *        c) training consistently at least 4x/week for up to two years, no issues -> +0
 *        d) training 2+ years with steady progress and no injury                 -> +5
 *   3. Athletes 65 and over who fall in category (c) or (d) may add up to 10.
 *   4. For athletes 16 and under the subtraction does not apply; use 165 bpm.
 *
 * The result is a CEILING, not a target. Aerobic training is done at or below it,
 * conventionally within the 10 bpm band immediately underneath.
 */

/** Base constant of the 180 Formula. */
export const MAF_BASE = 180;
/** Maffetone's fixed ceiling for athletes aged 16 and under. */
export const YOUTH_MAF_HR = 165;
export const YOUTH_AGE_LIMIT = 16;
/** Age at which the optional senior uplift becomes available. */
export const SENIOR_AGE = 65;
export const SENIOR_MAX_BONUS = 10;
/** Width in bpm of the aerobic training band beneath the ceiling. */
export const MAF_ZONE_WIDTH = 10;

export const AGE_MIN = 5;
export const AGE_MAX = 100;

export const MAF_CATEGORIES = [
  {
    key: "a",
    adjustment: -10,
    label: "Recovering from major illness, surgery, or on regular medication",
    detail:
      "Heart disease, any hospital stay or operation, or a long-term prescription such as a beta-blocker.",
  },
  {
    key: "b",
    adjustment: -5,
    label: "Injured, regressing, frequently ill, or returning after a break",
    detail:
      "Also applies with more than two colds or flu episodes a year, allergies or asthma, or inconsistent training.",
  },
  {
    key: "c",
    adjustment: 0,
    label: "Training consistently up to two years with none of the above",
    detail: "At least four sessions a week, no injuries, no more than two colds a year.",
  },
  {
    key: "d",
    adjustment: 5,
    label: "Training more than two years with steady progress and no injury",
    detail: "Competition results improving without setbacks.",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Compute the MAF heart rate ceiling and the aerobic training band beneath it.
 *
 * @param {object} input
 * @param {number} input.age              Age in years.
 * @param {string} input.category         "a" | "b" | "c" | "d" from MAF_CATEGORIES.
 * @param {number} [input.seniorBonus]    0-10 bpm, only valid for age >= 65 in category c or d.
 * @param {number|null} [input.restingHr] Optional resting HR, used only for context output.
 * @returns {object} MAF figures, or { error } for invalid input.
 */
export function computeMafZone({ age, category = "c", seniorBonus = 0, restingHr = null }) {
  if (!isNum(age)) return { error: "Enter your age in years." };
  if (age < AGE_MIN || age > AGE_MAX) {
    return { error: `Age should be between ${AGE_MIN} and ${AGE_MAX} years.` };
  }

  const chosen = MAF_CATEGORIES.find((item) => item.key === category);
  if (!chosen) return { error: "Choose one of the four health and training categories." };

  if (!isNum(seniorBonus)) return { error: "Senior adjustment must be a number of beats." };
  if (seniorBonus < 0 || seniorBonus > SENIOR_MAX_BONUS) {
    return { error: `The senior adjustment can only be 0 to ${SENIOR_MAX_BONUS} bpm.` };
  }

  if (restingHr !== null && restingHr !== undefined) {
    if (!isNum(restingHr)) return { error: "Resting heart rate must be a number." };
    if (restingHr < 25 || restingHr > 130) {
      return { error: "Resting heart rate should be between 25 and 130 bpm." };
    }
  }

  const isYouth = age <= YOUTH_AGE_LIMIT;
  const seniorEligible = age >= SENIOR_AGE && (chosen.key === "c" || chosen.key === "d");
  const appliedSeniorBonus = !isYouth && seniorEligible ? seniorBonus : 0;

  const baseValue = isYouth ? YOUTH_MAF_HR : MAF_BASE - age;
  const categoryAdjustment = isYouth ? 0 : chosen.adjustment;
  const ceiling = baseValue + categoryAdjustment + appliedSeniorBonus;

  if (!(ceiling > 0)) {
    return { error: "That combination gives a heart rate at or below zero — check your inputs." };
  }

  const floor = Math.max(0, ceiling - MAF_ZONE_WIDTH);

  const steps = isYouth
    ? [`Age ${age} is ${YOUTH_AGE_LIMIT} or under, so the 180 Formula uses a fixed ${YOUTH_MAF_HR} bpm.`]
    : [
        `${MAF_BASE} − ${age} = ${MAF_BASE - age} bpm`,
        `Category ${chosen.key.toUpperCase()}: ${categoryAdjustment >= 0 ? "+" : ""}${categoryAdjustment} bpm`,
      ];

  if (appliedSeniorBonus > 0) {
    steps.push(`Age ${SENIOR_AGE}+ in category ${chosen.key.toUpperCase()}: +${appliedSeniorBonus} bpm`);
  }

  return {
    age,
    ceiling,
    floor,
    zoneWidth: ceiling - floor,
    baseValue,
    categoryKey: chosen.key,
    categoryLabel: chosen.label,
    categoryAdjustment,
    appliedSeniorBonus,
    seniorEligible: seniorEligible && !isYouth,
    isYouth,
    steps,
    /** Percentage of heart rate reserve this ceiling represents, when a resting HR is known. */
    percentOfReserve:
      isNum(restingHr) && ceiling > restingHr
        ? Math.round(((ceiling - restingHr) / (220 - age - restingHr)) * 100)
        : null,
    restingHr: isNum(restingHr) ? restingHr : null,
  };
}

/**
 * MAF test pacing helper: how much a given pace should improve as aerobic fitness builds.
 * Pure conversion between pace (seconds per km) and speed, for the test-log table.
 *
 * @param {number} secondsPerKm
 * @returns {string} mm:ss per km, or "—" for unusable input.
 */
export function formatPace(secondsPerKm) {
  if (!isNum(secondsPerKm) || secondsPerKm <= 0) return "—";
  const total = Math.round(secondsPerKm);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * MAF test result: the pace you actually held while capped at the MAF ceiling.
 * Repeating this test every month is how Maffetone tracks aerobic progress —
 * the same heart rate should produce a faster pace over time.
 *
 * @param {object} input
 * @param {number} input.distanceKm Distance covered in kilometres.
 * @param {number} input.minutes    Elapsed time in minutes.
 * @returns {object} pace figures, or { error } for invalid input.
 */
export function mafTestPace({ distanceKm, minutes }) {
  if (!isNum(distanceKm) || !isNum(minutes)) {
    return { error: "Enter both the distance and the time for your MAF test." };
  }
  if (distanceKm <= 0) return { error: "MAF test distance must be greater than zero." };
  if (minutes <= 0) return { error: "MAF test time must be greater than zero." };

  const secondsPerKm = (minutes * 60) / distanceKm;
  const kmPerHour = distanceKm / (minutes / 60);
  /** 1 mile = 1.609344 km exactly (international yard and pound agreement, 1959). */
  const KM_PER_MILE = 1.609344;

  return {
    secondsPerKm,
    paceLabel: formatPace(secondsPerKm),
    milePaceLabel: formatPace(secondsPerKm * KM_PER_MILE),
    kmPerHour,
  };
}
