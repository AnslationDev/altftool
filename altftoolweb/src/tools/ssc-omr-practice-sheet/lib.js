/**
 * SSC-style OMR practice sheet layout builder.
 *
 * Patterns encoded from Staff Selection Commission examination notices:
 *  - SSC CGL Tier-I structure: 100 questions in 4 parts of 25 (General Intelligence &
 *    Reasoning, General Awareness, Quantitative Aptitude, English Comprehension),
 *    2 marks each, with 0.50 marks deducted per wrong answer.
 *  - SSC CHSL Tier-I structure: same 100-question / 4 x 25 layout, 2 marks each,
 *    0.50 negative per wrong answer.
 *  - Classic paper-based CGL Tier-I (pre computer-based era): 200 questions in
 *    4 parts of 50, 1 mark each, 0.25 negative per wrong answer.
 *
 * SSC OMR answer options are lettered A, B, C, D.
 */

/** SSC OMR options are lettered (SSC question paper format). */
export const SSC_OPTION_LABELS = ["A", "B", "C", "D"];

/** Digits available in each roll-number grid column. */
export const ROLL_DIGIT_ROWS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Bounds for the roll-number grid so the sheet stays printable on A4. */
export const MIN_ROLL_COLUMNS = 4;
export const MAX_ROLL_COLUMNS = 15;
/** SSC roll numbers are 10-digit numeric strings on the admit card. */
export const DEFAULT_ROLL_COLUMNS = 10;

export const SHEET_PATTERNS = [
  {
    id: "cgl-tier1",
    label: "SSC CGL Tier-I style — 100 questions (4 parts × 25)",
    parts: [
      { name: "General Intelligence & Reasoning", questions: 25 },
      { name: "General Awareness", questions: 25 },
      { name: "Quantitative Aptitude", questions: 25 },
      { name: "English Comprehension", questions: 25 },
    ],
    // SSC CGL notice: Tier-I questions carry 2 marks; 0.50 deducted per wrong answer.
    marksPerQuestion: 2,
    negativePerWrong: 0.5,
  },
  {
    id: "chsl-tier1",
    label: "SSC CHSL Tier-I style — 100 questions (4 parts × 25)",
    parts: [
      { name: "General Intelligence", questions: 25 },
      { name: "General Awareness", questions: 25 },
      { name: "Quantitative Aptitude (Basic Arithmetic)", questions: 25 },
      { name: "English Language (Basic Knowledge)", questions: 25 },
    ],
    // SSC CHSL notice: Tier-I questions carry 2 marks; 0.50 deducted per wrong answer.
    marksPerQuestion: 2,
    negativePerWrong: 0.5,
  },
  {
    id: "classic-200",
    label: "Classic paper-pattern SSC CGL Tier-I — 200 questions (4 parts × 50)",
    parts: [
      { name: "General Intelligence & Reasoning", questions: 50 },
      { name: "General Awareness", questions: 50 },
      { name: "Quantitative Aptitude", questions: 50 },
      { name: "English Comprehension", questions: 50 },
    ],
    // Pre computer-based CGL Tier-I: 200 questions of 1 mark; 0.25 negative per wrong.
    marksPerQuestion: 1,
    negativePerWrong: 0.25,
  },
];

/**
 * Build the full OMR sheet model for an SSC pattern.
 *
 * @param {object} input
 * @param {string} input.patternId    One of SHEET_PATTERNS ids.
 * @param {number} input.rollColumns  Number of roll-number grid columns.
 * @returns {object} sheet model or { error } for invalid input.
 */
export function buildSscSheet({ patternId, rollColumns = DEFAULT_ROLL_COLUMNS }) {
  const pattern = SHEET_PATTERNS.find((p) => p.id === patternId);
  if (!pattern) return { error: "Choose an SSC paper pattern for the sheet." };

  const columns = Number(rollColumns);
  if (!Number.isInteger(columns) || columns < MIN_ROLL_COLUMNS || columns > MAX_ROLL_COLUMNS) {
    return {
      error: `Roll number columns must be a whole number between ${MIN_ROLL_COLUMNS} and ${MAX_ROLL_COLUMNS}.`,
    };
  }

  const blocks = [];
  let next = 1;
  for (const part of pattern.parts) {
    const questions = Array.from({ length: part.questions }, (_, i) => next + i);
    next += part.questions;
    blocks.push({
      name: part.name,
      start: questions[0],
      end: questions[questions.length - 1],
      questions,
    });
  }

  const totalQuestions = next - 1;

  return {
    pattern,
    blocks,
    rollColumns: columns,
    totalQuestions,
    totalMarks: totalQuestions * pattern.marksPerQuestion,
    marksPerQuestion: pattern.marksPerQuestion,
    negativePerWrong: pattern.negativePerWrong,
    optionLabels: SSC_OPTION_LABELS,
  };
}
