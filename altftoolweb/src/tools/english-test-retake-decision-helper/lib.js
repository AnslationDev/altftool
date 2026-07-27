/**
 * Retake decision model for the major English proficiency tests.
 *
 * Core planning rule: Cambridge English guided-learning-hours guidance puts a
 * full CEFR level of progress at roughly 200 guided hours of study. One IELTS
 * band in the middle of the scale is commonly treated as roughly one CEFR
 * step, so the model prices score gaps in "band equivalents" at 200 hours per
 * band. Other tests are converted to band equivalents using the published
 * score concordances (ETS TOEFL-IELTS comparison table, Pearson PTE-IELTS
 * concordance, Duolingo-IELTS comparison), which in the middle of each scale
 * work out to approximately:
 *   1 IELTS band ≈ 15 TOEFL iBT points ≈ 10 PTE points ≈ 25 DET points.
 */

/** Guided study hours to improve one CEFR level / one IELTS band (Cambridge guidance). */
export const HOURS_PER_BAND = 200;

/**
 * Feasibility thresholds on the ratio of available hours to needed hours.
 * >= 1.0 : comfortably enough time.
 * >= 0.6 : tight but plausible with focused prep (allows for the guideline
 *          being conservative for test-specific technique gains).
 * <  0.6 : the plan is unrealistic in the time given.
 */
export const COMFORTABLE_RATIO = 1.0;
export const TIGHT_RATIO = 0.6;

export const TEST_SCALES = [
  { id: "ielts", name: "IELTS", min: 0, max: 9, step: 0.5, pointsPerBand: 1 },
  { id: "toefl", name: "TOEFL iBT", min: 0, max: 120, step: 1, pointsPerBand: 15 },
  { id: "pte", name: "PTE Academic", min: 10, max: 90, step: 1, pointsPerBand: 10 },
  { id: "det", name: "Duolingo English Test", min: 10, max: 160, step: 5, pointsPerBand: 25 },
];

/**
 * Decide whether a retake is realistic.
 *
 * @param {object} input
 * @param {string} input.testId        One of ielts | toefl | pte | det.
 * @param {number} input.currentScore  Latest overall score.
 * @param {number} input.targetScore   Score the programme asks for.
 * @param {number} input.weeksAvailable  Weeks left before you must have the score.
 * @param {number} input.hoursPerWeek  Realistic weekly study hours.
 */
export function computeRetakeDecision({
  testId,
  currentScore,
  targetScore,
  weeksAvailable,
  hoursPerWeek,
}) {
  const scale = TEST_SCALES.find((t) => t.id === testId);
  if (!scale) return { error: "Choose which test you took." };

  const current = Number(currentScore);
  const target = Number(targetScore);
  const weeks = Number(weeksAvailable);
  const hpw = Number(hoursPerWeek);

  if (!Number.isFinite(current) || !Number.isFinite(target)) {
    return { error: "Enter both your current score and your target score." };
  }
  if (current < scale.min || current > scale.max) {
    return { error: `${scale.name} scores run from ${scale.min} to ${scale.max}.` };
  }
  if (target < scale.min || target > scale.max) {
    return { error: `${scale.name} targets must be between ${scale.min} and ${scale.max}.` };
  }
  if (!Number.isFinite(weeks) || weeks < 0) {
    return { error: "Weeks until your deadline cannot be negative." };
  }
  if (!Number.isFinite(hpw) || hpw < 0) {
    return { error: "Weekly study hours cannot be negative." };
  }
  if (hpw > 168) {
    return { error: "There are only 168 hours in a week — lower your weekly study hours." };
  }

  const gap = target - current;

  if (gap <= 0) {
    return {
      decision: "no-retake",
      headline: "No retake needed",
      reason:
        "Your current score already meets or beats the target. Spend the time on the rest of your application instead.",
      gap,
      bandGap: 0,
      hoursNeeded: 0,
      hoursAvailable: Math.round(weeks * hpw),
      weeksNeeded: 0,
      ratio: null,
      scale,
    };
  }

  const bandGap = gap / scale.pointsPerBand;
  const hoursNeeded = Math.round(bandGap * HOURS_PER_BAND);
  const hoursAvailable = Math.round(weeks * hpw);
  const weeksNeeded = hpw > 0 ? Math.ceil(hoursNeeded / hpw) : null;
  const ratio = hoursNeeded > 0 && hoursAvailable > 0 ? hoursAvailable / hoursNeeded : 0;

  let decision;
  let headline;
  let reason;
  if (hpw === 0 || weeks === 0) {
    decision = "not-feasible";
    headline = "Not feasible as planned";
    reason =
      weeks === 0
        ? "You have no weeks left before the deadline. Look for programmes with later intakes, or ask the university whether a conditional offer is possible."
        : "With zero weekly study hours the gap cannot close. Free up study time or push the attempt to a later intake.";
  } else if (ratio >= COMFORTABLE_RATIO) {
    decision = "retake";
    headline = "Retake — realistic";
    reason = `You have about ${hoursAvailable} study hours against roughly ${hoursNeeded} needed for this gap, so a retake before your deadline is a sound plan.`;
  } else if (ratio >= TIGHT_RATIO) {
    decision = "retake-tight";
    headline = "Retake — but it will be tight";
    reason = `You have about ${hoursAvailable} study hours against roughly ${hoursNeeded} needed. It is doable with focused, test-specific practice, but consider raising weekly hours or booking the latest possible test date.`;
  } else {
    decision = "reconsider";
    headline = "Reconsider the plan";
    reason = `Roughly ${hoursNeeded} study hours are typically needed for this gap but only about ${hoursAvailable} are available. Consider a later intake, a lower-requirement programme, or checking whether the university accepts a slightly lower score with a pre-sessional English course.`;
  }

  return {
    decision,
    headline,
    reason,
    gap: Math.round(gap * 100) / 100,
    bandGap: Math.round(bandGap * 100) / 100,
    hoursNeeded,
    hoursAvailable,
    weeksNeeded,
    ratio: ratio === null ? null : Math.round(ratio * 100) / 100,
    scale,
  };
}
