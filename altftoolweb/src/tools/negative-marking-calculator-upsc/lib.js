/**
 * UPSC Civil Services Preliminary Examination marking rules.
 *
 * From the UPSC Civil Services Examination notification, "Penalty for wrong
 * answers":
 *  - There are four alternatives for the answer to every question.
 *  - For each question answered wrongly, ONE-THIRD of the marks assigned to
 *    that question is deducted as a penalty.
 *  - If a candidate marks more than one answer, it is treated as a wrong answer
 *    and attracts the same penalty, even if one of the marked answers is right.
 *  - A question left blank attracts no penalty.
 *
 * Paper structure:
 *  - Paper I (General Studies): 100 questions, 200 marks, 2 hours. Each
 *    question carries 2 marks, so a wrong answer costs 2/3 of a mark.
 *  - Paper II (CSAT): 80 questions, 200 marks, 2 hours. Each question carries
 *    2.5 marks, so a wrong answer costs 5/6 of a mark. Paper II is qualifying
 *    only: UPSC fixes the minimum qualifying marks at 33%, which is 66 of 200,
 *    and merit for the Mains stage is drawn from Paper I alone.
 *
 * Confirm the pattern against the notification for your examination year.
 */

/** One-third of the marks assigned to a question is deducted for a wrong answer. */
export const UPSC_PENALTY_FRACTION = 1 / 3;

/** Every prelims question offers four alternatives. */
export const UPSC_OPTIONS_PER_QUESTION = 4;

/** Minimum percentage required in Paper II for it to be treated as qualified. */
export const CSAT_QUALIFYING_PERCENT = 33;

/** Published structure of the two prelims papers. */
export const UPSC_PAPERS = {
  gs: {
    key: "gs",
    label: "Paper I — General Studies",
    questions: 100,
    totalMarks: 200,
    marksPerQuestion: 2,
    qualifyingPercent: null,
    note: "Merit for the Mains stage is decided by this paper alone.",
  },
  csat: {
    key: "csat",
    label: "Paper II — CSAT",
    questions: 80,
    totalMarks: 200,
    marksPerQuestion: 2.5,
    qualifyingPercent: CSAT_QUALIFYING_PERCENT,
    note: "Qualifying only — you need 33%, which is 66 of 200.",
  },
};

/**
 * Accuracy at which answering breaks even.
 * With a penalty of f × M for a wrong answer, a·M − (1 − a)·f·M = 0
 * gives a = f / (1 + f). For f = 1/3 that is exactly 25%.
 * @returns {number|null} fraction of 1, or null if the scheme is degenerate.
 */
export function breakEvenAccuracy(penaltyFraction = UPSC_PENALTY_FRACTION) {
  if (!Number.isFinite(penaltyFraction) || penaltyFraction < 0) return null;
  return penaltyFraction / (1 + penaltyFraction);
}

/**
 * Expected marks from one answer given `optionsRemaining` live options.
 * @returns {number|null}
 */
export function tierExpectedValue({
  optionsRemaining,
  marksPerQuestion = UPSC_PAPERS.gs.marksPerQuestion,
  penaltyFraction = UPSC_PENALTY_FRACTION,
} = {}) {
  if (!Number.isFinite(optionsRemaining) || optionsRemaining < 1) return null;
  if (!Number.isFinite(marksPerQuestion) || marksPerQuestion <= 0) return null;
  if (!Number.isFinite(penaltyFraction) || penaltyFraction < 0) return null;
  const hitRate = 1 / optionsRemaining;
  const penalty = marksPerQuestion * penaltyFraction;
  return hitRate * marksPerQuestion - (1 - hitRate) * penalty;
}

/** Confidence tiers a candidate sorts questions into during the paper. */
export const GUESS_TIERS = [
  { key: "twoLeft", optionsRemaining: 2, label: "Down to two options" },
  { key: "threeLeft", optionsRemaining: 3, label: "One option ruled out" },
  { key: "blind", optionsRemaining: 4, label: "No idea — blind guess" },
];

/**
 * Model a UPSC prelims paper from a tiered attempt plan.
 *
 * @param {object} input
 * @param {number} input.questions           questions in the paper
 * @param {number} input.marksPerQuestion    marks for a correct answer
 * @param {number} input.penaltyFraction     fraction of marks deducted if wrong
 * @param {number} input.sureAttempts        questions answered from knowledge
 * @param {number} input.sureAccuracyPercent accuracy on those
 * @param {number} input.twoLeft             guesses with two options left
 * @param {number} input.threeLeft           guesses with three options left
 * @param {number} input.blind               guesses with all four options live
 * @param {number} input.targetMarks         cutoff or personal target
 * @returns {object} projection, or { error } for invalid input
 */
export function modelUpscPrelims({
  questions = UPSC_PAPERS.gs.questions,
  marksPerQuestion = UPSC_PAPERS.gs.marksPerQuestion,
  penaltyFraction = UPSC_PENALTY_FRACTION,
  sureAttempts = 0,
  sureAccuracyPercent = 0,
  twoLeft = 0,
  threeLeft = 0,
  blind = 0,
  targetMarks = 0,
} = {}) {
  const values = [
    questions,
    marksPerQuestion,
    penaltyFraction,
    sureAttempts,
    sureAccuracyPercent,
    twoLeft,
    threeLeft,
    blind,
    targetMarks,
  ];
  if (values.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (questions <= 0 || questions > 500) {
    return { error: "The paper must have between 1 and 500 questions." };
  }
  if (marksPerQuestion <= 0) {
    return { error: "Marks per question must be greater than zero." };
  }
  if (penaltyFraction < 0 || penaltyFraction > 1) {
    return { error: "The penalty fraction must be between 0 and 1 of the question's marks." };
  }
  if ([sureAttempts, twoLeft, threeLeft, blind, targetMarks].some((value) => value < 0)) {
    return { error: "Attempts and target marks cannot be negative." };
  }
  if (sureAccuracyPercent < 0 || sureAccuracyPercent > 100) {
    return { error: "Accuracy must be between 0% and 100%." };
  }

  const answered = sureAttempts + twoLeft + threeLeft + blind;
  if (answered > questions) {
    return { error: `Answered questions (${answered}) exceed the ${questions} in the paper.` };
  }

  const penaltyPerWrong = marksPerQuestion * penaltyFraction;
  const totalMarks = questions * marksPerQuestion;

  const sureCorrect = sureAttempts * (sureAccuracyPercent / 100);
  const sureWrong = sureAttempts - sureCorrect;
  const sureScore = sureCorrect * marksPerQuestion - sureWrong * penaltyPerWrong;

  const counts = { twoLeft, threeLeft, blind };
  const tiers = GUESS_TIERS.map((tier) => {
    const count = counts[tier.key];
    const hitRate = 1 / tier.optionsRemaining;
    const correct = count * hitRate;
    const wrong = count - correct;
    const evPerQuestion = tierExpectedValue({
      optionsRemaining: tier.optionsRemaining,
      marksPerQuestion,
      penaltyFraction,
    });
    return {
      ...tier,
      count,
      correct,
      wrong,
      hitRatePercent: hitRate * 100,
      evPerQuestion,
      score: correct * marksPerQuestion - wrong * penaltyPerWrong,
      worthAttempting: evPerQuestion > 0,
      neutral: evPerQuestion === 0,
    };
  });

  const guessScore = tiers.reduce((sum, tier) => sum + tier.score, 0);
  const guessCorrect = tiers.reduce((sum, tier) => sum + tier.correct, 0);
  const guessWrong = tiers.reduce((sum, tier) => sum + tier.wrong, 0);
  const guessCount = tiers.reduce((sum, tier) => sum + tier.count, 0);

  const totalCorrect = sureCorrect + guessCorrect;
  const totalWrong = sureWrong + guessWrong;
  const marksGained = totalCorrect * marksPerQuestion;
  const marksLost = totalWrong * penaltyPerWrong;
  const expectedScore = marksGained - marksLost;

  const bestCase = sureScore + guessCount * marksPerQuestion;
  const worstCase = sureScore - guessCount * penaltyPerWrong;

  // The attempt count that maximises expected marks: keep every question whose
  // tier has a strictly positive expected value, drop the rest.
  const profitableGuesses = tiers
    .filter((tier) => tier.worthAttempting)
    .reduce((sum, tier) => sum + tier.count, 0);
  const optimalAttempts = sureAttempts + profitableGuesses;
  const optimalScore =
    sureScore + tiers.filter((tier) => tier.worthAttempting).reduce((sum, tier) => sum + tier.score, 0);

  const breakEven = breakEvenAccuracy(penaltyFraction);
  const qualifyingMarks = (totalMarks * CSAT_QUALIFYING_PERCENT) / 100;

  return {
    questions,
    marksPerQuestion,
    penaltyPerWrong,
    totalMarks,
    answered,
    unattempted: questions - answered,
    sureAttempts,
    sureCorrect,
    sureWrong,
    sureScore,
    tiers,
    guessCount,
    guessScore,
    totalCorrect,
    totalWrong,
    marksGained,
    marksLost,
    expectedScore,
    bestCase,
    worstCase,
    percentOfMax: totalMarks > 0 ? (expectedScore / totalMarks) * 100 : 0,
    overallAccuracyPercent: answered > 0 ? (totalCorrect / answered) * 100 : 0,
    breakEvenAccuracyPercent: breakEven === null ? null : breakEven * 100,
    blindGuessIsNeutral: tiers.some((tier) => tier.key === "blind" && tier.neutral),
    optimalAttempts,
    optimalScore,
    attemptsToDrop: answered - optimalAttempts,
    marksGivenAwayByBadGuesses: optimalScore - expectedScore,
    targetMarks,
    targetGap: targetMarks - expectedScore,
    meetsTarget: expectedScore >= targetMarks,
    qualifyingMarks,
    qualifiesCsat: expectedScore >= qualifyingMarks,
  };
}
