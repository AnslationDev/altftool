/**
 * Break-even accuracy under a negative marking scheme.
 *
 * The rule this file implements is a single expected-value identity, not an
 * exam-specific policy:
 *
 *   Answering one question at accuracy a, with M marks for a correct answer and
 *   P marks deducted for a wrong one, is worth
 *
 *       E(a) = a·M − (1 − a)·P
 *
 *   Leaving it blank is worth 0. Setting E(a) = 0 gives the break-even accuracy
 *
 *       a* = P / (M + P)
 *
 *   Above a* answering beats leaving blank; below it, blank beats answering.
 *
 * A random pick between k live options is right with probability 1/k, so a
 * guess pays exactly when 1/k > a*, i.e. when k < (M + P) / P.
 *
 * The presets below record the marking scheme published by each examining body.
 * They are the scheme only — always confirm against the information bulletin or
 * notification for your exam year, since bodies revise these.
 */

/** Marking schemes published by Indian examining bodies. */
export const MARKING_PRESETS = [
  {
    key: "neet",
    label: "NEET UG",
    marksPerCorrect: 4,
    penaltyPerWrong: 1,
    options: 4,
    note: "NTA — 4 marks correct, 1 deducted, four options.",
  },
  {
    key: "jee-main",
    label: "JEE Main",
    marksPerCorrect: 4,
    penaltyPerWrong: 1,
    options: 4,
    note: "NTA — applies to numerical-value questions too since 2023.",
  },
  {
    key: "cuet-ug",
    label: "CUET UG",
    marksPerCorrect: 5,
    penaltyPerWrong: 1,
    options: 4,
    note: "NTA — 5 marks correct, 1 deducted.",
  },
  {
    key: "upsc-gs",
    label: "UPSC Prelims — GS Paper I",
    marksPerCorrect: 2,
    penaltyPerWrong: 2 / 3,
    options: 4,
    note: "One-third of the question's 2 marks is deducted.",
  },
  {
    key: "upsc-csat",
    label: "UPSC Prelims — CSAT",
    marksPerCorrect: 2.5,
    penaltyPerWrong: 5 / 6,
    options: 4,
    note: "One-third of the question's 2.5 marks is deducted.",
  },
  {
    key: "banking",
    label: "IBPS / SBI objective test",
    marksPerCorrect: 1,
    penaltyPerWrong: 0.25,
    options: 5,
    note: "One-fourth of the question's marks; five options.",
  },
  {
    key: "ssc-tier1",
    label: "SSC CGL Tier I",
    marksPerCorrect: 2,
    penaltyPerWrong: 0.5,
    options: 4,
    note: "SSC — 2 marks correct, 0.50 deducted.",
  },
  {
    key: "ssc-tier2",
    label: "SSC CGL Tier II (Paper I)",
    marksPerCorrect: 3,
    penaltyPerWrong: 1,
    options: 4,
    note: "SSC — 3 marks correct, 1 deducted in Sections I to III.",
  },
  {
    key: "cat",
    label: "CAT (MCQ questions)",
    marksPerCorrect: 3,
    penaltyPerWrong: 1,
    options: 4,
    note: "IIM — non-MCQ (TITA) questions carry no penalty at all.",
  },
  {
    key: "clat",
    label: "CLAT",
    marksPerCorrect: 1,
    penaltyPerWrong: 0.25,
    options: 4,
    note: "Consortium of NLUs — 0.25 deducted per wrong answer.",
  },
  {
    key: "gate-1",
    label: "GATE — 1 mark MCQ",
    marksPerCorrect: 1,
    penaltyPerWrong: 1 / 3,
    options: 4,
    note: "IIT/IISc — one-third deducted; NAT and MSQ questions carry none.",
  },
  {
    key: "gate-2",
    label: "GATE — 2 mark MCQ",
    marksPerCorrect: 2,
    penaltyPerWrong: 2 / 3,
    options: 4,
    note: "IIT/IISc — two-thirds deducted on 2 mark MCQs.",
  },
];

/**
 * Break-even accuracy: a* = P / (M + P).
 * @returns {number|null} fraction of 1, or null when the scheme is invalid.
 */
export function breakEvenAccuracy(marksPerCorrect, penaltyPerWrong) {
  if (!Number.isFinite(marksPerCorrect) || !Number.isFinite(penaltyPerWrong)) return null;
  if (marksPerCorrect <= 0 || penaltyPerWrong < 0) return null;
  const denominator = marksPerCorrect + penaltyPerWrong;
  if (denominator <= 0) return null;
  return penaltyPerWrong / denominator;
}

/** Expected marks from answering one question at a known accuracy. */
export function expectedMarksPerAttempt({ accuracy, marksPerCorrect, penaltyPerWrong }) {
  if (![accuracy, marksPerCorrect, penaltyPerWrong].every(Number.isFinite)) return null;
  return accuracy * marksPerCorrect - (1 - accuracy) * penaltyPerWrong;
}

/**
 * Full break-even analysis for one marking scheme.
 *
 * @param {object} input
 * @param {number} input.marksPerCorrect marks awarded for a correct answer
 * @param {number} input.penaltyPerWrong marks deducted for a wrong answer
 * @param {number} input.options         alternatives printed against the question
 * @param {number} input.eliminated      options you can rule out before guessing
 * @param {number} input.accuracyPercent your real accuracy on this question type
 * @param {number} input.attempts        how many such questions you plan to answer
 * @returns {object} analysis, or { error }
 */
export function breakEvenAnalysis({
  marksPerCorrect = 4,
  penaltyPerWrong = 1,
  options = 4,
  eliminated = 0,
  accuracyPercent = 0,
  attempts = 0,
} = {}) {
  const values = [marksPerCorrect, penaltyPerWrong, options, eliminated, accuracyPercent, attempts];
  if (values.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (marksPerCorrect <= 0) return { error: "Marks for a correct answer must be greater than zero." };
  if (penaltyPerWrong < 0) return { error: "The deduction for a wrong answer cannot be negative." };
  if (penaltyPerWrong > marksPerCorrect * 20) {
    return { error: "That deduction is more than 20 times the marks on offer — check the scheme." };
  }
  if (options < 2 || options > 10) return { error: "A question must have between 2 and 10 options." };
  if (!Number.isInteger(options)) return { error: "The number of options must be a whole number." };
  if (eliminated < 0) return { error: "You cannot eliminate a negative number of options." };
  if (eliminated > options - 1) {
    return { error: `With ${options} options you can rule out at most ${options - 1} and still be guessing.` };
  }
  if (accuracyPercent < 0 || accuracyPercent > 100) return { error: "Accuracy must be between 0% and 100%." };
  if (attempts < 0) return { error: "The number of attempts cannot be negative." };

  const breakEven = breakEvenAccuracy(marksPerCorrect, penaltyPerWrong);
  if (breakEven === null) return { error: "That marking scheme has no meaningful break-even point." };

  const optionsLeft = options - eliminated;
  const hitRate = 1 / optionsLeft;
  const evPerGuess = expectedMarksPerAttempt({
    accuracy: hitRate,
    marksPerCorrect,
    penaltyPerWrong,
  });

  // Ladder over every elimination level, from a blind guess to a two-way split.
  const ladder = [];
  for (let left = options; left >= 2; left -= 1) {
    const rate = 1 / left;
    const ev = expectedMarksPerAttempt({ accuracy: rate, marksPerCorrect, penaltyPerWrong });
    ladder.push({
      optionsLeft: left,
      eliminated: options - left,
      hitRatePercent: rate * 100,
      evPerGuess: ev,
      verdict: ev > 0 ? "answer" : ev === 0 ? "neutral" : "leave blank",
    });
  }

  // Fewest eliminations that make a guess strictly profitable.
  let minEliminations = null;
  for (const row of ladder) {
    if (row.evPerGuess > 0) {
      minEliminations = row.eliminated;
      break;
    }
  }

  const accuracy = accuracyPercent / 100;
  const evPerAttempt = expectedMarksPerAttempt({ accuracy, marksPerCorrect, penaltyPerWrong });
  const expectedCorrect = attempts * accuracy;
  const expectedWrong = attempts - expectedCorrect;
  const marksGained = expectedCorrect * marksPerCorrect;
  const marksLost = expectedWrong * penaltyPerWrong;

  return {
    marksPerCorrect,
    penaltyPerWrong,
    options,
    eliminated,
    optionsLeft,
    breakEvenAccuracy: breakEven,
    breakEvenAccuracyPercent: breakEven * 100,
    hitRatePercent: hitRate * 100,
    evPerGuess,
    guessVerdict: evPerGuess > 0 ? "answer" : evPerGuess === 0 ? "neutral" : "leave blank",
    ladder,
    minEliminations,
    blindGuessPays: ladder[0].evPerGuess > 0,
    blindGuessIsNeutral: ladder[0].evPerGuess === 0,
    // Marks per correct answer needed just to survive one wrong answer.
    correctAnswersPerWrongAnswer: marksPerCorrect > 0 ? penaltyPerWrong / marksPerCorrect : null,
    accuracyPercent,
    evPerAttempt,
    beatsBreakEven: accuracy > breakEven,
    accuracyMarginPercent: (accuracy - breakEven) * 100,
    attempts,
    expectedCorrect,
    expectedWrong,
    marksGained,
    marksLost,
    netMarks: marksGained - marksLost,
    marksLostPer100Attempts: 100 * (1 - accuracy) * penaltyPerWrong,
  };
}
