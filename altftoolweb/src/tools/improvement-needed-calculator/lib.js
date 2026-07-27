/**
 * Improvement-needed calculation.
 *
 * The overall percentage is the weighted definition used by boards and
 * universities: total marks obtained across all papers divided by total
 * maximum marks, times 100. For a target T% the marks still needed are
 *
 *   needed = ceil( T/100 × (maxSoFar + remainingMax) − obtainedSoFar )
 *
 * ceil because marks are awarded in whole units on most mark sheets; needing
 * "429.5 marks" means 430 must actually be scored. The target is achievable
 * only when needed ≤ remainingMax.
 */

/** Percentages cannot exceed 100 of the combined maximum. */
export const MAX_TARGET_PERCENT = 100;

const round2 = (v) => Math.round(v * 100) / 100;

/**
 * @param {object} input
 * @param {number|string} input.obtainedSoFar  Marks already scored.
 * @param {number|string} input.maxSoFar       Maximum marks of exams already taken.
 * @param {number|string} input.remainingMax   Maximum marks still to be examined.
 * @param {number|string} input.targetPercent  Desired overall percentage.
 * @returns {object} result, or { error } for invalid input.
 */
export function computeImprovementNeeded({
  obtainedSoFar,
  maxSoFar,
  remainingMax,
  targetPercent,
}) {
  const obtained = Number(obtainedSoFar);
  const doneMax = Number(maxSoFar);
  const restMax = Number(remainingMax);
  const target = Number(targetPercent);

  if (!Number.isFinite(obtained) || !Number.isFinite(doneMax)) {
    return { error: "Enter the marks scored so far and their maximum as numbers." };
  }
  if (doneMax <= 0) return { error: "Maximum marks so far must be greater than zero." };
  if (obtained < 0) return { error: "Marks obtained cannot be negative." };
  if (obtained > doneMax) {
    return { error: "Marks obtained cannot exceed the maximum marks so far." };
  }
  if (!Number.isFinite(restMax) || restMax < 0) {
    return { error: "Remaining maximum marks must be zero or a positive number." };
  }
  if (!Number.isFinite(target) || target <= 0 || target > MAX_TARGET_PERCENT) {
    return { error: `Target percentage must be between 0 and ${MAX_TARGET_PERCENT}.` };
  }

  const totalMax = doneMax + restMax;
  const currentPercent = round2((obtained / doneMax) * 100);
  // Total marks that must exist on the final sheet to hit the target.
  const totalNeededRaw = (target / 100) * totalMax;
  const marksNeeded = Math.max(0, Math.ceil(totalNeededRaw - obtained));

  if (restMax === 0) {
    // Nothing left to write: the outcome is already decided.
    const achieved = currentPercent >= target;
    return {
      currentPercent,
      totalMax,
      marksNeeded: achieved ? 0 : marksNeeded,
      requiredPercentOfRemaining: null,
      achievable: achieved,
      alreadyAchieved: achieved,
      bestPossiblePercent: currentPercent,
      shortfallPoints: achieved ? 0 : round2(target - currentPercent),
      message: achieved
        ? "No exams remain and your current percentage already meets the target."
        : "No exams remain, so the target can no longer be reached this term.",
    };
  }

  const requiredPercentOfRemaining = round2((marksNeeded / restMax) * 100);
  const achievable = marksNeeded <= restMax;
  const alreadyAchieved = marksNeeded === 0;
  // Best possible overall percentage if every remaining mark is scored.
  const bestPossiblePercent = round2(((obtained + restMax) / totalMax) * 100);

  let message;
  if (alreadyAchieved) {
    message =
      "Marks already banked are enough — even 0 in the remaining exams keeps you at or above the target.";
  } else if (achievable) {
    message = `Score at least ${marksNeeded} of the remaining ${restMax} marks (${requiredPercentOfRemaining}% of what is left).`;
  } else {
    message = `Even a perfect score in the remaining exams tops out at ${bestPossiblePercent}%, below the ${target}% target.`;
  }

  return {
    currentPercent,
    totalMax,
    marksNeeded,
    requiredPercentOfRemaining,
    achievable,
    alreadyAchieved,
    bestPossiblePercent,
    shortfallPoints: achievable ? 0 : round2(target - bestPossiblePercent),
    message,
  };
}
