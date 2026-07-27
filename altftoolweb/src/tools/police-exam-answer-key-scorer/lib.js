/**
 * Score a state police written exam from counts of correct and wrong answers.
 *
 * Marking schemes differ by state, so each preset carries the pattern from that
 * recruitment board's own notification. Where a state's scheme changes between
 * cycles, the values below are from the most recent completed cycle; the custom
 * option lets a candidate enter any scheme straight from their notification.
 *
 * Preset sources:
 *  - UP Police Constable (UPPRPB, 2023-24 cycle): 150 questions x 2 marks = 300,
 *    negative marking of 0.5 mark per wrong answer (1/4 of the question's marks).
 *  - Bihar Police Constable (CSBC): 100 questions x 1 mark = 100, NO negative marking.
 *  - Delhi Police Constable (through SSC, 2023): 100 questions x 1 mark = 100,
 *    negative marking of 0.25 mark per wrong answer.
 *  - Rajasthan Police Constable (2023-24): 150 questions x 1 mark = 150, negative
 *    marking of 1/4 (0.25) mark per wrong answer.
 *  - MP Police Constable (MPESB, 2023): 100 questions x 1 mark = 100, no negative
 *    marking.
 *
 * The score formula every board uses:
 *    score = correct x marksPerQuestion - wrong x negativePerWrong
 * A useful derived figure: one wrong answer cancels
 *    negativePerWrong / marksPerQuestion of a question,
 * so with 1/4 negative marking, 4 wrong answers wipe out one correct answer.
 */

export const EXAM_PRESETS = [
  {
    id: "up-constable",
    label: "UP Police Constable — 150 Q × 2 marks, −0.5",
    totalQuestions: 150,
    marksPerQuestion: 2,
    negativePerWrong: 0.5,
  },
  {
    id: "bihar-constable",
    label: "Bihar Police Constable — 100 Q × 1 mark, no negative",
    totalQuestions: 100,
    marksPerQuestion: 1,
    negativePerWrong: 0,
  },
  {
    id: "delhi-constable",
    label: "Delhi Police Constable (SSC) — 100 Q × 1 mark, −0.25",
    totalQuestions: 100,
    marksPerQuestion: 1,
    negativePerWrong: 0.25,
  },
  {
    id: "rajasthan-constable",
    label: "Rajasthan Police Constable — 150 Q × 1 mark, −0.25",
    totalQuestions: 150,
    marksPerQuestion: 1,
    negativePerWrong: 0.25,
  },
  {
    id: "mp-constable",
    label: "MP Police Constable — 100 Q × 1 mark, no negative",
    totalQuestions: 100,
    marksPerQuestion: 1,
    negativePerWrong: 0,
  },
  {
    id: "custom",
    label: "Custom — enter your exam's scheme",
    totalQuestions: 100,
    marksPerQuestion: 1,
    negativePerWrong: 0.25,
  },
];

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const isCount = (value) => Number.isFinite(value) && Number.isInteger(value) && value >= 0;

/**
 * @param {object} input
 * @param {number} input.totalQuestions    Questions in the paper.
 * @param {number} input.marksPerQuestion  Marks for a correct answer.
 * @param {number} input.negativePerWrong  Marks deducted per wrong answer (0 for none).
 * @param {number} input.correct           Count of correct answers per the key.
 * @param {number} input.wrong             Count of wrong answers per the key.
 * @returns {object} score card or { error }.
 */
export function scorePoliceExam({
  totalQuestions,
  marksPerQuestion,
  negativePerWrong,
  correct,
  wrong,
}) {
  const total = Number(totalQuestions);
  const perQ = Number(marksPerQuestion);
  const penalty = Number(negativePerWrong);
  const c = Number(correct);
  const w = Number(wrong);

  if (!Number.isFinite(total) || !Number.isInteger(total) || total <= 0 || total > 1000) {
    return { error: "Total questions must be a whole number between 1 and 1000." };
  }
  if (!Number.isFinite(perQ) || perQ <= 0) {
    return { error: "Marks per question must be more than zero." };
  }
  if (!Number.isFinite(penalty) || penalty < 0) {
    return { error: "Negative marking cannot be less than zero." };
  }
  if (penalty >= perQ) {
    return { error: "Negative marking per wrong answer should be less than the marks for a correct one — check the notification." };
  }
  if (!isCount(c)) return { error: "Correct answers must be a whole number, zero or more." };
  if (!isCount(w)) return { error: "Wrong answers must be a whole number, zero or more." };
  if (c + w > total) {
    return {
      error: `Correct plus wrong is ${c + w}, but the paper only has ${total} questions.`,
    };
  }

  const attempted = c + w;
  const unattempted = total - attempted;
  const maxMarks = round2(total * perQ);
  const positiveMarks = round2(c * perQ);
  const negativeMarks = round2(w * penalty);
  const score = round2(positiveMarks - negativeMarks);

  // How many wrong answers cancel one correct answer (null when no negative marking).
  const wrongsPerCorrect = penalty > 0 ? round2(perQ / penalty) : null;

  // Accuracy below which random attempting loses marks: expected value of an attempt is
  // p*perQ - (1-p)*penalty, zero at p = penalty / (perQ + penalty).
  const breakEvenAccuracy = penalty > 0 ? round2((penalty / (perQ + penalty)) * 100) : 0;

  return {
    totalQuestions: total,
    maxMarks,
    attempted,
    unattempted,
    correct: c,
    wrong: w,
    positiveMarks,
    negativeMarks,
    score,
    percentage: round2((score / maxMarks) * 100),
    accuracy: attempted > 0 ? round2((c / attempted) * 100) : 0,
    wrongsPerCorrect,
    breakEvenAccuracy,
    marksPerQuestion: perQ,
    negativePerWrong: penalty,
  };
}
