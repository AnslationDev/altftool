/**
 * Story point → hours conversion.
 *
 * Story points are deliberately unit-less, so the ONLY defensible conversion to
 * hours is empirical: divide the person-hours a team actually had in a sprint by
 * the points it actually completed (its velocity). That is the approach described
 * by Mike Cohn (Agile Estimating and Planning, 2005) and the Scrum Guide's
 * position that velocity is a team-local, historical measure — there is no
 * universal "1 point = X hours" constant.
 */

/**
 * The modified Fibonacci scale popularised by Mountain Goat Software and used by
 * Planning Poker decks. Exposed for the UI's quick-pick buttons.
 */
export const FIBONACCI_POINTS = [1, 2, 3, 5, 8, 13, 21, 34];

/** A standard full-time working day for person-day conversion (8h × 5d = 40h week). */
export const HOURS_PER_PERSON_DAY = 8;

/**
 * Confidence bounds. 100% collapses the range to a single number; anything below
 * 10% would mean the estimate is essentially unknown, which no range can express.
 * The band is a symmetric ±(100 − confidence)% spread around the midpoint —
 * a simple three-point-style envelope, not a statistical guarantee.
 */
export const MIN_CONFIDENCE_PCT = 10;
export const MAX_CONFIDENCE_PCT = 100;

/** Practical input ceilings so absurd values fail loudly instead of overflowing the UI. */
export const MAX_STORY_POINTS = 10000;
export const MAX_VELOCITY = 10000;
export const MAX_SPRINT_HOURS = 100000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Convert story points to an hour estimate with a confidence range.
 *
 * @param {object} input
 * @param {number} input.storyPoints       Points on the story/epic being converted.
 * @param {number} input.velocityPoints    Points the team completes per sprint (historical average).
 * @param {number} input.sprintPersonHours Person-hours the team has per sprint (people × days × focus hours).
 * @param {number} input.confidencePercent 10–100; the range spreads ±(100 − confidence)%.
 * @returns {{error:string}|object}
 */
export function computeStoryPointEstimate({
  storyPoints,
  velocityPoints,
  sprintPersonHours,
  confidencePercent,
}) {
  if (!isNum(storyPoints) || !isNum(velocityPoints) || !isNum(sprintPersonHours) || !isNum(confidencePercent)) {
    return { error: "Enter a valid number in every field." };
  }
  if (storyPoints < 0) return { error: "Story points cannot be negative." };
  if (storyPoints > MAX_STORY_POINTS) {
    return { error: `Story points above ${MAX_STORY_POINTS} are outside any usable scale — split the work.` };
  }
  if (velocityPoints <= 0) {
    return { error: "Velocity must be greater than zero — use the points completed in a typical sprint." };
  }
  if (velocityPoints > MAX_VELOCITY) {
    return { error: `Velocity above ${MAX_VELOCITY} points per sprint is not plausible.` };
  }
  if (sprintPersonHours <= 0) {
    return { error: "Sprint person-hours must be greater than zero." };
  }
  if (sprintPersonHours > MAX_SPRINT_HOURS) {
    return { error: `Sprint person-hours above ${MAX_SPRINT_HOURS} is not plausible.` };
  }
  if (confidencePercent < MIN_CONFIDENCE_PCT || confidencePercent > MAX_CONFIDENCE_PCT) {
    return { error: `Confidence must be between ${MIN_CONFIDENCE_PCT}% and ${MAX_CONFIDENCE_PCT}%.` };
  }

  // Empirical conversion rate: the team's own hours-per-point.
  const hoursPerPoint = sprintPersonHours / velocityPoints;
  const midHours = storyPoints * hoursPerPoint;

  // Symmetric spread: ±(100 − confidence)% around the midpoint.
  const spread = (MAX_CONFIDENCE_PCT - confidencePercent) / 100;
  const lowHours = midHours * (1 - spread);
  const highHours = midHours * (1 + spread);

  // Sprint forecast comes straight from velocity, independent of hours.
  const sprintsNeeded = storyPoints / velocityPoints;

  return {
    hoursPerPoint: round1(hoursPerPoint),
    midHours: round1(midHours),
    lowHours: round1(lowHours),
    highHours: round1(highHours),
    midPersonDays: round1(midHours / HOURS_PER_PERSON_DAY),
    lowPersonDays: round1(lowHours / HOURS_PER_PERSON_DAY),
    highPersonDays: round1(highHours / HOURS_PER_PERSON_DAY),
    sprintsNeeded: round1(sprintsNeeded),
    sprintsNeededWhole: Math.ceil(sprintsNeeded),
    spreadPercent: Math.round(spread * 100),
  };
}
