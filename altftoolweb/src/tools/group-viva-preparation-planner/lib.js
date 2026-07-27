/**
 * Group viva preparation planner.
 *
 * Rotation rule: the classic round-robin questioning rotation used in peer viva
 * practice. With n members seated in a fixed order, in round r (1-based) member i
 * asks member (i + offset) mod n, where offset = ((r - 1) mod (n - 1)) + 1.
 *
 * Properties this guarantees (all provable from modular arithmetic):
 *  - offset is never 0, so nobody ever questions themselves;
 *  - within one round every member appears exactly once as asker and exactly once
 *    as answerer, so workload per round is equal by construction;
 *  - after n - 1 rounds every member has asked every other member exactly once
 *    (full pairing coverage), after which the cycle repeats.
 */

/** A viva practice pair needs at least a questioner and a respondent. */
export const MIN_MEMBERS = 2;

/** Cap so the rotation table stays readable; larger groups should split. */
export const MAX_MEMBERS = 16;

/** Practical session caps to keep total time sane. */
export const MAX_ROUNDS = 20;
export const MAX_QUESTIONS_PER_ROUND = 20;
export const MAX_MINUTES_PER_QUESTION = 60;
export const MAX_FEEDBACK_MINUTES = 30;

function isPositiveInt(value, max) {
  return Number.isInteger(value) && value >= 1 && value <= max;
}

/**
 * Build the full rotation plan.
 *
 * @param {object} input
 * @param {string[]} input.memberNames  member names in seating order
 * @param {number} input.rounds  number of rotation rounds
 * @param {number} input.questionsPerRound  questions each asker puts per round
 * @param {number} input.minutesPerQuestion  minutes to answer one question
 * @param {number} input.feedbackMinutesPerQuestion  peer-feedback minutes per question (0 allowed)
 * @returns plan object or { error }
 */
export function buildVivaPlan({
  memberNames,
  rounds,
  questionsPerRound,
  minutesPerQuestion,
  feedbackMinutesPerQuestion,
}) {
  const members = (Array.isArray(memberNames) ? memberNames : [])
    .map((name) => String(name ?? "").trim())
    .filter((name) => name.length > 0);

  if (members.length < MIN_MEMBERS) {
    return { error: "Enter at least two member names, one per line." };
  }
  if (members.length > MAX_MEMBERS) {
    return {
      error: `Keep the group to ${MAX_MEMBERS} members or fewer — split larger cohorts into two circles.`,
    };
  }
  const seen = new Set();
  for (const name of members) {
    const key = name.toLowerCase();
    if (seen.has(key)) {
      return { error: `"${name}" appears more than once. Every member needs a distinct name.` };
    }
    seen.add(key);
  }

  if (!isPositiveInt(rounds, MAX_ROUNDS)) {
    return { error: `Rounds must be a whole number between 1 and ${MAX_ROUNDS}.` };
  }
  if (!isPositiveInt(questionsPerRound, MAX_QUESTIONS_PER_ROUND)) {
    return {
      error: `Questions per round must be a whole number between 1 and ${MAX_QUESTIONS_PER_ROUND}.`,
    };
  }
  if (
    !Number.isFinite(minutesPerQuestion) ||
    minutesPerQuestion <= 0 ||
    minutesPerQuestion > MAX_MINUTES_PER_QUESTION
  ) {
    return {
      error: `Minutes per question must be above 0 and at most ${MAX_MINUTES_PER_QUESTION}.`,
    };
  }
  if (
    !Number.isFinite(feedbackMinutesPerQuestion) ||
    feedbackMinutesPerQuestion < 0 ||
    feedbackMinutesPerQuestion > MAX_FEEDBACK_MINUTES
  ) {
    return {
      error: `Feedback minutes per question must be between 0 and ${MAX_FEEDBACK_MINUTES}.`,
    };
  }

  const n = members.length;
  const schedule = [];
  for (let r = 1; r <= rounds; r += 1) {
    // Offset cycles through 1..n-1 so nobody asks themselves and, over n-1
    // rounds, every ordered pair (asker, answerer) occurs exactly once.
    const offset = ((r - 1) % (n - 1)) + 1;
    const pairs = [];
    for (let i = 0; i < n; i += 1) {
      pairs.push({ asker: members[i], answerer: members[(i + offset) % n] });
    }
    schedule.push({ round: r, offset, pairs });
  }

  const questionsAskedPerMember = rounds * questionsPerRound;
  const totalQuestions = rounds * n * questionsPerRound;
  const minutesPerExchange = minutesPerQuestion + feedbackMinutesPerQuestion;
  const minutesPerRound = n * questionsPerRound * minutesPerExchange;
  const totalMinutes = rounds * minutesPerRound;
  // Full coverage: after n-1 rounds each member has asked every other member once.
  const roundsForFullCoverage = n - 1;

  return {
    members,
    schedule,
    questionsAskedPerMember,
    questionsAnsweredPerMember: questionsAskedPerMember,
    totalQuestions,
    minutesPerRound,
    totalMinutes,
    roundsForFullCoverage,
    fullCoverage: rounds >= roundsForFullCoverage,
  };
}
