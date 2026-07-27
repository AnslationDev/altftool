/**
 * Bank recruitment exam marking — IBPS and SBI objective tests.
 *
 * From the IBPS and SBI common recruitment advertisements, "Penalty for wrong
 * answers":
 *  - There is a penalty for wrong answers marked in the objective tests.
 *  - For each question answered wrongly, ONE-FOURTH of the marks assigned to
 *    that question is deducted as a penalty.
 *  - If no answer is marked, there is no penalty for that question.
 *  - The descriptive paper (where one exists) is not subject to this penalty.
 *
 * Objective questions in these papers carry five alternatives. With one mark a
 * question and a 0.25 deduction, a blind five-option guess is right 20% of the
 * time and is therefore worth 0.2 × 1 − 0.8 × 0.25 = 0 marks: exactly neutral.
 * That makes elimination, not attempt volume, the thing that moves the score.
 *
 * Prelims papers are usually one mark a question; mains papers weight sections
 * differently, so marks per question is an input rather than a fixed constant.
 * Confirm the pattern in the advertisement for your recruitment cycle.
 */

/** One-fourth of the question's marks is deducted for a wrong answer. */
export const BANKING_PENALTY_FRACTION = 1 / 4;

/** Objective questions in IBPS and SBI papers carry five alternatives. */
export const BANKING_OPTIONS_PER_QUESTION = 5;

/**
 * Section structures published in recent recruitment advertisements. Sectional
 * timing applies in most prelims papers, which is why sections are modelled
 * separately here.
 */
export const BANKING_EXAM_PATTERNS = [
  {
    key: "ibps-po-pre",
    label: "IBPS PO Prelims",
    durationMinutes: 60,
    sections: [
      { key: "english", label: "English Language", questions: 30, marksPerQuestion: 1, minutes: 20 },
      { key: "quant", label: "Quantitative Aptitude", questions: 35, marksPerQuestion: 1, minutes: 20 },
      { key: "reasoning", label: "Reasoning Ability", questions: 35, marksPerQuestion: 1, minutes: 20 },
    ],
  },
  {
    key: "ibps-clerk-pre",
    label: "IBPS Clerk Prelims",
    durationMinutes: 60,
    sections: [
      { key: "english", label: "English Language", questions: 30, marksPerQuestion: 1, minutes: 20 },
      { key: "numerical", label: "Numerical Ability", questions: 35, marksPerQuestion: 1, minutes: 20 },
      { key: "reasoning", label: "Reasoning Ability", questions: 35, marksPerQuestion: 1, minutes: 20 },
    ],
  },
  {
    key: "sbi-po-pre",
    label: "SBI PO Prelims",
    durationMinutes: 60,
    sections: [
      { key: "english", label: "English Language", questions: 30, marksPerQuestion: 1, minutes: 20 },
      { key: "quant", label: "Quantitative Aptitude", questions: 35, marksPerQuestion: 1, minutes: 20 },
      { key: "reasoning", label: "Reasoning Ability", questions: 35, marksPerQuestion: 1, minutes: 20 },
    ],
  },
  {
    key: "rrb-officer-pre",
    label: "IBPS RRB Officer Scale I Prelims",
    durationMinutes: 45,
    sections: [
      { key: "reasoning", label: "Reasoning", questions: 40, marksPerQuestion: 1, minutes: 45 },
      { key: "quant", label: "Quantitative Aptitude", questions: 40, marksPerQuestion: 1, minutes: 45 },
    ],
  },
];

/**
 * Accuracy at which answering breaks even.
 * a·M − (1 − a)·f·M = 0 → a = f / (1 + f). For f = 1/4 that is 20%.
 * @returns {number|null} fraction of 1, or null for an invalid penalty.
 */
export function breakEvenAccuracy(penaltyFraction = BANKING_PENALTY_FRACTION) {
  if (!Number.isFinite(penaltyFraction) || penaltyFraction < 0) return null;
  return penaltyFraction / (1 + penaltyFraction);
}

/** Expected marks from a single guess with `optionsRemaining` live options. */
export function guessExpectedValue({
  optionsRemaining = BANKING_OPTIONS_PER_QUESTION,
  marksPerQuestion = 1,
  penaltyFraction = BANKING_PENALTY_FRACTION,
} = {}) {
  if (!Number.isFinite(optionsRemaining) || optionsRemaining < 1) return null;
  if (!Number.isFinite(marksPerQuestion) || marksPerQuestion <= 0) return null;
  if (!Number.isFinite(penaltyFraction) || penaltyFraction < 0) return null;
  const hitRate = 1 / optionsRemaining;
  return hitRate * marksPerQuestion - (1 - hitRate) * marksPerQuestion * penaltyFraction;
}

/**
 * Net score for one section after the penalty.
 * @returns {object} section result, or { error }
 */
export function scoreSection({ questions, marksPerQuestion = 1, attempted = 0, accuracyPercent = 0, penaltyFraction = BANKING_PENALTY_FRACTION }) {
  const values = [questions, marksPerQuestion, attempted, accuracyPercent, penaltyFraction];
  if (values.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter a valid number in every section field." };
  }
  if (questions <= 0 || questions > 300) return { error: "A section must hold 1 to 300 questions." };
  if (marksPerQuestion <= 0) return { error: "Marks per question must be greater than zero." };
  if (attempted < 0) return { error: "Attempts cannot be negative." };
  if (attempted > questions) return { error: `Attempts (${attempted}) exceed the ${questions} questions in the section.` };
  if (accuracyPercent < 0 || accuracyPercent > 100) return { error: "Accuracy must be between 0% and 100%." };
  if (penaltyFraction < 0 || penaltyFraction > 1) return { error: "The penalty must be between 0 and 1 of the question's marks." };

  const penaltyPerWrong = marksPerQuestion * penaltyFraction;
  const correct = attempted * (accuracyPercent / 100);
  const wrong = attempted - correct;
  const gained = correct * marksPerQuestion;
  const lost = wrong * penaltyPerWrong;

  return {
    questions,
    marksPerQuestion,
    attempted,
    skipped: questions - attempted,
    correct,
    wrong,
    gained,
    lost,
    net: gained - lost,
    maxMarks: questions * marksPerQuestion,
    penaltyPerWrong,
  };
}

/**
 * Model a full bank objective paper from per-section attempts plus an optional
 * block of blind guesses spread across whatever questions are left.
 *
 * @param {object} input
 * @param {Array}  input.sections        [{ key, label, questions, marksPerQuestion, attempted, accuracyPercent }]
 * @param {number} input.penaltyFraction fraction of a question's marks deducted if wrong
 * @param {number} input.blindGuesses    extra questions answered without solving
 * @param {number} input.optionsRemaining options still live when guessing
 * @param {number} input.guessMarksPerQuestion marks carried by a guessed question
 * @param {number} input.cutoff          the overall cutoff you are aiming at
 * @returns {object} projection, or { error }
 */
export function modelBankingScore({
  sections = [],
  penaltyFraction = BANKING_PENALTY_FRACTION,
  blindGuesses = 0,
  optionsRemaining = BANKING_OPTIONS_PER_QUESTION,
  guessMarksPerQuestion = 1,
  cutoff = 0,
} = {}) {
  if (!Array.isArray(sections) || sections.length === 0) {
    return { error: "Add at least one section to score." };
  }
  const scalars = [penaltyFraction, blindGuesses, optionsRemaining, guessMarksPerQuestion, cutoff];
  if (scalars.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (blindGuesses < 0 || cutoff < 0) return { error: "Guesses and the cutoff cannot be negative." };
  if (optionsRemaining < 1 || optionsRemaining > BANKING_OPTIONS_PER_QUESTION) {
    return { error: `Options left on a guess must be between 1 and ${BANKING_OPTIONS_PER_QUESTION}.` };
  }
  if (guessMarksPerQuestion <= 0) return { error: "Marks per guessed question must be greater than zero." };

  const scored = [];
  for (const section of sections) {
    const result = scoreSection({ ...section, penaltyFraction });
    if (result.error) return { error: `${section.label ?? "Section"}: ${result.error}` };
    scored.push({ key: section.key, label: section.label, ...result });
  }

  const totalQuestions = scored.reduce((sum, s) => sum + s.questions, 0);
  const totalAttempted = scored.reduce((sum, s) => sum + s.attempted, 0);
  const questionsLeft = totalQuestions - totalAttempted;
  if (blindGuesses > questionsLeft) {
    return { error: `Only ${questionsLeft} unanswered questions remain, so you cannot guess ${blindGuesses}.` };
  }

  const guessHitRate = 1 / optionsRemaining;
  const guessPenalty = guessMarksPerQuestion * penaltyFraction;
  const guessCorrect = blindGuesses * guessHitRate;
  const guessWrong = blindGuesses - guessCorrect;
  const guessGained = guessCorrect * guessMarksPerQuestion;
  const guessLost = guessWrong * guessPenalty;
  // Expressed as count × expected value per guess so an exactly neutral scheme
  // returns a clean 0 rather than a floating-point residue.
  const guessEv = guessHitRate * guessMarksPerQuestion - (1 - guessHitRate) * guessPenalty;
  const guessNet = blindGuesses * guessEv;

  const sectionNet = scored.reduce((sum, s) => sum + s.net, 0);
  const totalGained = scored.reduce((sum, s) => sum + s.gained, 0) + guessGained;
  const totalLost = scored.reduce((sum, s) => sum + s.lost, 0) + guessLost;
  const totalCorrect = scored.reduce((sum, s) => sum + s.correct, 0) + guessCorrect;
  const totalWrong = scored.reduce((sum, s) => sum + s.wrong, 0) + guessWrong;
  const maxMarks = scored.reduce((sum, s) => sum + s.maxMarks, 0);
  const netScore = sectionNet + guessNet;

  const answered = totalAttempted + blindGuesses;
  const evPerGuess = guessExpectedValue({
    optionsRemaining,
    marksPerQuestion: guessMarksPerQuestion,
    penaltyFraction,
  });
  const breakEven = breakEvenAccuracy(penaltyFraction);

  return {
    sections: scored,
    totalQuestions,
    totalAttempted,
    blindGuesses,
    answered,
    unattempted: totalQuestions - answered,
    totalCorrect,
    totalWrong,
    totalGained,
    totalLost,
    sectionNet,
    guessNet,
    netScore,
    maxMarks,
    bestCase: sectionNet + blindGuesses * guessMarksPerQuestion,
    worstCase: sectionNet - blindGuesses * guessPenalty,
    percentOfMax: maxMarks > 0 ? (netScore / maxMarks) * 100 : 0,
    overallAccuracyPercent: answered > 0 ? (totalCorrect / answered) * 100 : 0,
    evPerGuess,
    guessHitRatePercent: guessHitRate * 100,
    breakEvenAccuracyPercent: breakEven === null ? null : breakEven * 100,
    guessingIsWorthIt: evPerGuess !== null && evPerGuess > 0,
    guessingIsNeutral: evPerGuess === 0,
    cutoff,
    cutoffGap: cutoff - netScore,
    clearsCutoff: netScore >= cutoff,
  };
}
