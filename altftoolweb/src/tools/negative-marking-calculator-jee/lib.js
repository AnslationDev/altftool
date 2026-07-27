/**
 * JEE Main (Paper 1, B.E./B.Tech) marking scheme — National Testing Agency.
 *
 * Rules encoded here:
 *  - The paper has three subjects (Mathematics, Physics, Chemistry).
 *  - Section A of each subject holds 20 single-answer MCQs with four options.
 *  - Section B of each subject holds numerical-value questions where the answer
 *    is typed in, not chosen from options.
 *  - Every question, in both sections, carries +4 for a correct response and
 *    -1 for an incorrect response. Negative marking was extended to the
 *    numerical-value section from JEE Main 2023.
 *  - Unanswered questions score 0 with no penalty.
 *  - From JEE Main 2025 the optional questions in Section B were withdrawn:
 *    all 5 numerical questions per subject are compulsory, giving 75 questions
 *    and 300 marks in 180 minutes.
 *  - The score computed here is the RAW score. The NTA score printed on the
 *    scorecard is a normalised percentile across shifts and cannot be derived
 *    from a raw score alone.
 *
 * Confirm the pattern in the NTA information bulletin for your exam year.
 */

/** Marks for a correct response, both sections. */
export const JEE_MARKS_PER_CORRECT = 4;

/** Marks deducted for an incorrect response, both sections. */
export const JEE_PENALTY_PER_WRONG = 1;

/** Options on a Section A multiple-choice question. */
export const JEE_OPTIONS_PER_MCQ = 4;

/** Section A MCQs across the three subjects (20 × 3). */
export const JEE_MCQ_TOTAL = 60;

/** Section B numerical-value questions across the three subjects (5 × 3). */
export const JEE_NVT_TOTAL = 15;

/** Questions and marks in JEE Main Paper 1. */
export const JEE_TOTAL_QUESTIONS = JEE_MCQ_TOTAL + JEE_NVT_TOTAL;
export const JEE_TOTAL_MARKS = JEE_TOTAL_QUESTIONS * JEE_MARKS_PER_CORRECT;

/** Subject split published by NTA. */
export const JEE_SUBJECTS = [
  { key: "maths", label: "Mathematics", mcq: 20, nvt: 5 },
  { key: "physics", label: "Physics", mcq: 20, nvt: 5 },
  { key: "chemistry", label: "Chemistry", mcq: 20, nvt: 5 },
];

/**
 * A Section B answer is typed in, so there is no fixed set of options to guess
 * from. A wild numerical guess is treated as certain to be wrong.
 */
export const NVT_BLIND_GUESS_HIT_RATE = 0;

/**
 * Accuracy at which answering breaks even: a·M − (1 − a)·P = 0 → a = P/(M+P).
 * @returns {number|null} fraction of 1, or null for a degenerate scheme.
 */
export function breakEvenAccuracy(marksPerCorrect = JEE_MARKS_PER_CORRECT, penaltyPerWrong = JEE_PENALTY_PER_WRONG) {
  const denominator = marksPerCorrect + penaltyPerWrong;
  if (!Number.isFinite(denominator) || denominator <= 0) return null;
  if (marksPerCorrect <= 0 || penaltyPerWrong < 0) return null;
  return penaltyPerWrong / denominator;
}

/** Expected marks from one guess with `optionsRemaining` options still live. */
export function guessExpectedValue({
  optionsRemaining = JEE_OPTIONS_PER_MCQ,
  marksPerCorrect = JEE_MARKS_PER_CORRECT,
  penaltyPerWrong = JEE_PENALTY_PER_WRONG,
} = {}) {
  if (!Number.isFinite(optionsRemaining) || optionsRemaining < 1) return null;
  const hitRate = 1 / optionsRemaining;
  return hitRate * marksPerCorrect - (1 - hitRate) * penaltyPerWrong;
}

function scoreBlock({ correct, wrong, marksPerCorrect, penaltyPerWrong }) {
  return correct * marksPerCorrect - wrong * penaltyPerWrong;
}

/**
 * Project a JEE Main raw score.
 *
 * @param {object} input
 * @param {number} input.mcqTotal            Section A questions available
 * @param {number} input.mcqAttempted        Section A answered from knowledge
 * @param {number} input.mcqAccuracyPercent  accuracy on those
 * @param {number} input.mcqGuesses          extra Section A questions guessed
 * @param {number} input.mcqOptionsRemaining options left standing on a guess
 * @param {number} input.nvtTotal            Section B questions available
 * @param {number} input.nvtAttempted        Section B answered from working
 * @param {number} input.nvtAccuracyPercent  accuracy on those
 * @param {number} input.nvtGuesses          Section B answers typed on a hunch
 * @returns {object} projection, or { error } for invalid input
 */
export function modelJeeScore({
  mcqTotal = JEE_MCQ_TOTAL,
  mcqAttempted = 0,
  mcqAccuracyPercent = 0,
  mcqGuesses = 0,
  mcqOptionsRemaining = JEE_OPTIONS_PER_MCQ,
  nvtTotal = JEE_NVT_TOTAL,
  nvtAttempted = 0,
  nvtAccuracyPercent = 0,
  nvtGuesses = 0,
  marksPerCorrect = JEE_MARKS_PER_CORRECT,
  penaltyPerWrong = JEE_PENALTY_PER_WRONG,
} = {}) {
  const values = [
    mcqTotal,
    mcqAttempted,
    mcqAccuracyPercent,
    mcqGuesses,
    mcqOptionsRemaining,
    nvtTotal,
    nvtAttempted,
    nvtAccuracyPercent,
    nvtGuesses,
    marksPerCorrect,
    penaltyPerWrong,
  ];
  if (values.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (mcqTotal < 0 || nvtTotal < 0 || mcqTotal + nvtTotal <= 0) {
    return { error: "The paper must contain at least one question." };
  }
  if (mcqTotal > 300 || nvtTotal > 300) {
    return { error: "Section sizes above 300 questions are not a JEE paper." };
  }
  if ([mcqAttempted, mcqGuesses, nvtAttempted, nvtGuesses].some((value) => value < 0)) {
    return { error: "Attempts and guesses cannot be negative." };
  }
  if (mcqAccuracyPercent < 0 || mcqAccuracyPercent > 100 || nvtAccuracyPercent < 0 || nvtAccuracyPercent > 100) {
    return { error: "Accuracy must be between 0% and 100%." };
  }
  if (mcqOptionsRemaining < 1 || mcqOptionsRemaining > JEE_OPTIONS_PER_MCQ) {
    return { error: `Options left on an MCQ guess must be between 1 and ${JEE_OPTIONS_PER_MCQ}.` };
  }
  if (marksPerCorrect <= 0 || penaltyPerWrong < 0) {
    return { error: "Marks per correct answer must be positive and the penalty cannot be negative." };
  }
  if (mcqAttempted + mcqGuesses > mcqTotal) {
    return { error: `Section A answers (${mcqAttempted + mcqGuesses}) exceed the ${mcqTotal} MCQs available.` };
  }
  if (nvtAttempted + nvtGuesses > nvtTotal) {
    return {
      error: `Section B answers (${nvtAttempted + nvtGuesses}) exceed the ${nvtTotal} numerical questions available.`,
    };
  }

  const mcqHitRate = 1 / mcqOptionsRemaining;
  const mcqKnownCorrect = mcqAttempted * (mcqAccuracyPercent / 100);
  const mcqKnownWrong = mcqAttempted - mcqKnownCorrect;
  const mcqGuessCorrect = mcqGuesses * mcqHitRate;
  const mcqGuessWrong = mcqGuesses - mcqGuessCorrect;

  const nvtKnownCorrect = nvtAttempted * (nvtAccuracyPercent / 100);
  const nvtKnownWrong = nvtAttempted - nvtKnownCorrect;
  const nvtGuessCorrect = nvtGuesses * NVT_BLIND_GUESS_HIT_RATE;
  const nvtGuessWrong = nvtGuesses - nvtGuessCorrect;

  const mcqCorrect = mcqKnownCorrect + mcqGuessCorrect;
  const mcqWrong = mcqKnownWrong + mcqGuessWrong;
  const nvtCorrect = nvtKnownCorrect + nvtGuessCorrect;
  const nvtWrong = nvtKnownWrong + nvtGuessWrong;

  const mcqScore = scoreBlock({ correct: mcqCorrect, wrong: mcqWrong, marksPerCorrect, penaltyPerWrong });
  const nvtScore = scoreBlock({ correct: nvtCorrect, wrong: nvtWrong, marksPerCorrect, penaltyPerWrong });

  const totalCorrect = mcqCorrect + nvtCorrect;
  const totalWrong = mcqWrong + nvtWrong;
  const answered = mcqAttempted + mcqGuesses + nvtAttempted + nvtGuesses;
  const totalQuestions = mcqTotal + nvtTotal;
  const maxMarks = totalQuestions * marksPerCorrect;

  const marksGained = totalCorrect * marksPerCorrect;
  const marksLost = totalWrong * penaltyPerWrong;
  const expectedScore = marksGained - marksLost;

  // Range comes from the guessed block only; known answers are held fixed.
  const knownScore =
    scoreBlock({ correct: mcqKnownCorrect, wrong: mcqKnownWrong, marksPerCorrect, penaltyPerWrong }) +
    scoreBlock({ correct: nvtKnownCorrect, wrong: nvtKnownWrong, marksPerCorrect, penaltyPerWrong });
  const guessCount = mcqGuesses + nvtGuesses;
  const bestCase = knownScore + guessCount * marksPerCorrect;
  const worstCase = knownScore - guessCount * penaltyPerWrong;

  const mcqEv = guessExpectedValue({ optionsRemaining: mcqOptionsRemaining, marksPerCorrect, penaltyPerWrong });
  const nvtEv = NVT_BLIND_GUESS_HIT_RATE * marksPerCorrect - (1 - NVT_BLIND_GUESS_HIT_RATE) * penaltyPerWrong;
  const breakEven = breakEvenAccuracy(marksPerCorrect, penaltyPerWrong);

  return {
    mcqTotal,
    nvtTotal,
    totalQuestions,
    answered,
    unattempted: totalQuestions - answered,
    mcqCorrect,
    mcqWrong,
    nvtCorrect,
    nvtWrong,
    totalCorrect,
    totalWrong,
    mcqScore,
    nvtScore,
    knownScore,
    guessCount,
    marksGained,
    marksLost,
    expectedScore,
    bestCase,
    worstCase,
    maxMarks,
    percentOfMax: maxMarks > 0 ? (expectedScore / maxMarks) * 100 : 0,
    overallAccuracyPercent: answered > 0 ? (totalCorrect / answered) * 100 : 0,
    mcqEvPerGuess: mcqEv,
    nvtEvPerGuess: nvtEv,
    mcqGuessHitRatePercent: mcqHitRate * 100,
    breakEvenAccuracyPercent: breakEven === null ? null : breakEven * 100,
    mcqGuessingIsWorthIt: mcqEv !== null && mcqEv > 0,
    nvtGuessingIsWorthIt: nvtEv > 0,
  };
}

/**
 * Minimum options that must remain live for an MCQ guess to be worth taking.
 * Guessing pays while 1/k > P/(M+P), i.e. k < (M + P) / P.
 * @returns {number|null} the largest option count that is still profitable.
 */
export function maxProfitableOptions(marksPerCorrect = JEE_MARKS_PER_CORRECT, penaltyPerWrong = JEE_PENALTY_PER_WRONG) {
  if (!Number.isFinite(marksPerCorrect) || !Number.isFinite(penaltyPerWrong) || marksPerCorrect <= 0) return null;
  // With no penalty every guess is free, so every option count stays profitable.
  if (penaltyPerWrong <= 0) return JEE_OPTIONS_PER_MCQ;
  const limit = (marksPerCorrect + penaltyPerWrong) / penaltyPerWrong;
  const largest = Math.ceil(limit) - 1;
  if (!Number.isFinite(largest) || largest < 1) return null;
  return largest;
}
