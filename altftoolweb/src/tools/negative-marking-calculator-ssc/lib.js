/**
 * Negative marking impact for SSC exams.
 *
 * Marking schemes, from the Staff Selection Commission's own notifications:
 *  - SSC CGL Tier-I: 100 questions x 2 marks = 200 marks, 0.50 mark deducted per wrong
 *    answer (one-fourth of the question's marks).
 *  - SSC CGL Tier-II (Paper-I, 2022 pattern onwards): 3 marks per question, 1 mark
 *    deducted per wrong answer (one-third).
 *  - SSC CHSL Tier-I: 100 questions x 2 marks = 200 marks, 0.50 deducted per wrong.
 *  - SSC CPO Paper-I: 200 questions x 1 mark = 200 marks, 0.25 deducted per wrong.
 *  - SSC MTS Session-II: 3 marks per question, 1 mark deducted per wrong answer
 *    (Session-I of MTS has no negative marking).
 *
 * Core identities:
 *    marks lost        = wrong x penalty
 *    net score         = correct x marksPerQuestion - wrong x penalty
 *    wrongs that cancel one correct = marksPerQuestion / penalty  (4 at the 0.5-of-2 scheme)
 *    break-even guessing accuracy   = penalty / (marksPerQuestion + penalty)
 *      (expected value of an attempt: p*m - (1-p)*n = 0  =>  p = n/(m+n); 20% for SSC's
 *       quarter-negative schemes, below the 25% chance of a blind 4-option guess)
 */

export const SSC_PRESETS = [
  {
    id: "cgl-tier1",
    label: "SSC CGL Tier-I — 100 Q × 2 marks, −0.50",
    totalQuestions: 100,
    marksPerQuestion: 2,
    penalty: 0.5,
  },
  {
    id: "cgl-tier2",
    label: "SSC CGL Tier-II Paper-I — 3 marks, −1",
    totalQuestions: 130,
    marksPerQuestion: 3,
    penalty: 1,
  },
  {
    id: "chsl-tier1",
    label: "SSC CHSL Tier-I — 100 Q × 2 marks, −0.50",
    totalQuestions: 100,
    marksPerQuestion: 2,
    penalty: 0.5,
  },
  {
    id: "cpo-paper1",
    label: "SSC CPO Paper-I — 200 Q × 1 mark, −0.25",
    totalQuestions: 200,
    marksPerQuestion: 1,
    penalty: 0.25,
  },
  {
    id: "mts-session2",
    label: "SSC MTS Session-II — 3 marks, −1",
    totalQuestions: 50,
    marksPerQuestion: 3,
    penalty: 1,
  },
  {
    id: "custom",
    label: "Custom scheme",
    totalQuestions: 100,
    marksPerQuestion: 2,
    penalty: 0.5,
  },
];

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const isCount = (value) => Number.isFinite(value) && Number.isInteger(value) && value >= 0;

/**
 * Full negative-marking impact card.
 *
 * @param {object} input
 * @param {number} input.totalQuestions
 * @param {number} input.marksPerQuestion
 * @param {number} input.penalty          Marks deducted per wrong answer.
 * @param {number} input.correct
 * @param {number} input.wrong
 * @returns {object} impact card or { error }.
 */
export function computeNegativeImpact({
  totalQuestions,
  marksPerQuestion,
  penalty,
  correct,
  wrong,
}) {
  const total = Number(totalQuestions);
  const perQ = Number(marksPerQuestion);
  const pen = Number(penalty);
  const c = Number(correct);
  const w = Number(wrong);

  if (!Number.isFinite(total) || !Number.isInteger(total) || total <= 0 || total > 1000) {
    return { error: "Total questions must be a whole number between 1 and 1000." };
  }
  if (!Number.isFinite(perQ) || perQ <= 0) {
    return { error: "Marks per question must be more than zero." };
  }
  if (!Number.isFinite(pen) || pen < 0) {
    return { error: "The penalty per wrong answer cannot be negative." };
  }
  if (pen >= perQ) {
    return { error: "The penalty should be smaller than the marks per question — check the notification." };
  }
  if (!isCount(c)) return { error: "Correct answers must be a whole number, zero or more." };
  if (!isCount(w)) return { error: "Wrong answers must be a whole number, zero or more." };
  if (c + w > total) {
    return { error: `Correct plus wrong is ${c + w}, but the paper has only ${total} questions.` };
  }

  const attempted = c + w;
  const maxMarks = round2(total * perQ);
  const grossMarks = round2(c * perQ);
  const marksLost = round2(w * pen);
  const netScore = round2(grossMarks - marksLost);

  // Wrong answers expressed as "correct answers cancelled".
  const wrongsPerCorrect = pen > 0 ? round2(perQ / pen) : null;
  const correctsCancelled = pen > 0 ? round2(marksLost / perQ) : 0;

  // Further wrong answers you can afford before the score drops below any target is
  // left to the caller; here we give the break-even guessing accuracy.
  const breakEvenAccuracy = pen > 0 ? round2((pen / (perQ + pen)) * 100) : 0;

  return {
    totalQuestions: total,
    maxMarks,
    attempted,
    unattempted: total - attempted,
    correct: c,
    wrong: w,
    grossMarks,
    marksLost,
    netScore,
    percentage: round2((netScore / maxMarks) * 100),
    accuracy: attempted > 0 ? round2((c / attempted) * 100) : 0,
    wrongsPerCorrect,
    correctsCancelled,
    breakEvenAccuracy,
    marksPerQuestion: perQ,
    penalty: pen,
  };
}

/**
 * Table of cumulative loss for growing numbers of wrong answers, used to visualise how
 * fast the penalty compounds. Pure: depends only on the scheme.
 *
 * @param {object} input
 * @param {number} input.marksPerQuestion
 * @param {number} input.penalty
 * @param {number[]} [input.steps] Wrong-answer counts to tabulate.
 */
export function wipeoutTable({ marksPerQuestion, penalty, steps = [1, 4, 8, 12, 20, 30] }) {
  const perQ = Number(marksPerQuestion);
  const pen = Number(penalty);
  if (!Number.isFinite(perQ) || perQ <= 0 || !Number.isFinite(pen) || pen < 0) return [];
  return steps
    .filter((step) => Number.isInteger(step) && step > 0)
    .map((step) => ({
      wrong: step,
      marksLost: round2(step * pen),
      correctsCancelled: round2((step * pen) / perQ),
    }));
}
