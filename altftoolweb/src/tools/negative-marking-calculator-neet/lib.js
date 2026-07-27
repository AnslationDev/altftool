/**
 * NEET (UG) marking scheme — National Testing Agency question paper instructions.
 *
 * Rules encoded here:
 *  - Each question carries 4 marks for a correct response.
 *  - 1 mark is deducted for every incorrect response.
 *  - Questions left unanswered carry no penalty and no reward (0 marks).
 *  - If a question is later dropped or a key is revised, NTA awards full marks
 *    to every candidate for that question; that is handled by the "grace marks"
 *    input rather than by the scoring formula.
 *  - The paper is a single-answer MCQ paper with four options per question.
 *  - From NEET UG 2025 the paper returned to 180 compulsory questions with no
 *    optional Section B, giving a maximum of 720 marks over 180 minutes.
 *    Physics, Chemistry, Botany and Zoology carry 45 questions each.
 *
 * Always confirm the question count and marking scheme against the NTA
 * information bulletin for your exam year before relying on a projection.
 */

/** Marks awarded for one correct response. */
export const NEET_MARKS_PER_CORRECT = 4;

/** Marks deducted for one incorrect response. */
export const NEET_PENALTY_PER_WRONG = 1;

/** Compulsory questions in the NEET UG paper (45 per subject × 4 subjects). */
export const NEET_TOTAL_QUESTIONS = 180;

/** Maximum obtainable marks = 180 × 4. */
export const NEET_TOTAL_MARKS = NEET_TOTAL_QUESTIONS * NEET_MARKS_PER_CORRECT;

/** Every NEET question is a four-option single-answer MCQ. */
export const NEET_OPTIONS_PER_QUESTION = 4;

/** Section-wise question split published by NTA. */
export const NEET_SUBJECTS = [
  { key: "physics", label: "Physics", questions: 45 },
  { key: "chemistry", label: "Chemistry", questions: 45 },
  { key: "botany", label: "Botany", questions: 45 },
  { key: "zoology", label: "Zoology", questions: 45 },
];

/**
 * Accuracy at which answering is exactly break-even.
 *
 * Expected marks from one answered question at accuracy a:
 *   E(a) = a·M − (1 − a)·P
 * Setting E(a) = 0 gives a = P / (M + P).
 *
 * @returns {number|null} break-even accuracy as a fraction of 1, or null if the
 * marking scheme is degenerate.
 */
export function breakEvenAccuracy(marksPerCorrect = NEET_MARKS_PER_CORRECT, penaltyPerWrong = NEET_PENALTY_PER_WRONG) {
  const denominator = marksPerCorrect + penaltyPerWrong;
  if (!Number.isFinite(denominator) || denominator <= 0) return null;
  if (penaltyPerWrong < 0 || marksPerCorrect <= 0) return null;
  return penaltyPerWrong / denominator;
}

/**
 * Expected marks from a single random guess among `optionsRemaining` options.
 * Probability of being right is 1 / optionsRemaining.
 */
export function guessExpectedValue({
  optionsRemaining = NEET_OPTIONS_PER_QUESTION,
  marksPerCorrect = NEET_MARKS_PER_CORRECT,
  penaltyPerWrong = NEET_PENALTY_PER_WRONG,
} = {}) {
  if (!Number.isFinite(optionsRemaining) || optionsRemaining < 1) return null;
  const hitRate = 1 / optionsRemaining;
  return hitRate * marksPerCorrect - (1 - hitRate) * penaltyPerWrong;
}

/**
 * Project a NEET score from a study/attempt strategy.
 *
 * @param {object} input
 * @param {number} input.totalQuestions   questions in the paper
 * @param {number} input.attempted        questions answered from knowledge
 * @param {number} input.accuracyPercent  accuracy on those answered questions
 * @param {number} input.blindGuesses     extra questions answered by guessing
 * @param {number} input.optionsRemaining options left standing on a guess (1–4)
 * @param {number} input.graceMarks       marks added for dropped/revised keys
 * @returns {object} projection, or { error } for invalid input
 */
export function modelNeetScore({
  totalQuestions = NEET_TOTAL_QUESTIONS,
  attempted = 0,
  accuracyPercent = 0,
  blindGuesses = 0,
  optionsRemaining = NEET_OPTIONS_PER_QUESTION,
  graceMarks = 0,
  marksPerCorrect = NEET_MARKS_PER_CORRECT,
  penaltyPerWrong = NEET_PENALTY_PER_WRONG,
} = {}) {
  const numbers = [
    totalQuestions,
    attempted,
    accuracyPercent,
    blindGuesses,
    optionsRemaining,
    graceMarks,
    marksPerCorrect,
    penaltyPerWrong,
  ];
  if (numbers.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (totalQuestions <= 0 || totalQuestions > 500) {
    return { error: "Total questions must be between 1 and 500." };
  }
  if (attempted < 0 || blindGuesses < 0 || graceMarks < 0) {
    return { error: "Attempts, guesses and grace marks cannot be negative." };
  }
  if (accuracyPercent < 0 || accuracyPercent > 100) {
    return { error: "Accuracy must be between 0% and 100%." };
  }
  if (optionsRemaining < 1 || optionsRemaining > NEET_OPTIONS_PER_QUESTION) {
    return { error: `Options left on a guess must be between 1 and ${NEET_OPTIONS_PER_QUESTION}.` };
  }
  if (marksPerCorrect <= 0) {
    return { error: "Marks per correct answer must be greater than zero." };
  }
  if (penaltyPerWrong < 0) {
    return { error: "The penalty per wrong answer cannot be negative." };
  }
  if (attempted + blindGuesses > totalQuestions) {
    return {
      error: `Answered questions (${attempted + blindGuesses}) exceed the ${totalQuestions} questions in the paper.`,
    };
  }

  const accuracy = accuracyPercent / 100;
  const knowledgeCorrect = attempted * accuracy;
  const knowledgeWrong = attempted - knowledgeCorrect;

  const guessHitRate = 1 / optionsRemaining;
  const guessCorrect = blindGuesses * guessHitRate;
  const guessWrong = blindGuesses - guessCorrect;

  const totalCorrect = knowledgeCorrect + guessCorrect;
  const totalWrong = knowledgeWrong + guessWrong;
  const answered = attempted + blindGuesses;
  const unattempted = totalQuestions - answered;

  const maxMarks = totalQuestions * marksPerCorrect;
  const marksGained = totalCorrect * marksPerCorrect;
  const marksLost = totalWrong * penaltyPerWrong;
  const expectedScore = marksGained - marksLost + graceMarks;

  const knowledgeScore = knowledgeCorrect * marksPerCorrect - knowledgeWrong * penaltyPerWrong;
  const guessScore = guessCorrect * marksPerCorrect - guessWrong * penaltyPerWrong;

  // Range across the guessed block only: every guess right vs every guess wrong.
  const bestCase = knowledgeScore + blindGuesses * marksPerCorrect + graceMarks;
  const worstCase = knowledgeScore - blindGuesses * penaltyPerWrong + graceMarks;

  const evPerGuess = guessExpectedValue({ optionsRemaining, marksPerCorrect, penaltyPerWrong });
  const breakEven = breakEvenAccuracy(marksPerCorrect, penaltyPerWrong);

  return {
    totalQuestions,
    answered,
    unattempted,
    attempted,
    blindGuesses,
    knowledgeCorrect,
    knowledgeWrong,
    guessCorrect,
    guessWrong,
    totalCorrect,
    totalWrong,
    marksGained,
    marksLost,
    graceMarks,
    expectedScore,
    knowledgeScore,
    guessScore,
    bestCase,
    worstCase,
    maxMarks,
    percentOfMax: maxMarks > 0 ? (expectedScore / maxMarks) * 100 : 0,
    overallAccuracyPercent: answered > 0 ? (totalCorrect / answered) * 100 : 0,
    evPerGuess,
    guessHitRatePercent: guessHitRate * 100,
    breakEvenAccuracyPercent: breakEven === null ? null : breakEven * 100,
    guessingIsWorthIt: evPerGuess !== null && evPerGuess > 0,
  };
}

/**
 * Compare several guessing volumes side by side, holding knowledge constant.
 * Returns rows only for guess counts that still fit inside the paper.
 */
export function buildGuessLadder(input = {}, guessCounts = [0, 10, 20, 30, 45]) {
  const rows = [];
  for (const guesses of guessCounts) {
    const result = modelNeetScore({ ...input, blindGuesses: guesses });
    if (result.error) continue;
    rows.push({
      blindGuesses: guesses,
      expectedScore: result.expectedScore,
      worstCase: result.worstCase,
      bestCase: result.bestCase,
      gainOverNoGuess: null,
    });
  }
  const base = rows.find((row) => row.blindGuesses === 0);
  if (base) {
    for (const row of rows) row.gainOverNoGuess = row.expectedScore - base.expectedScore;
  }
  return rows;
}
