/**
 * NEET (UG) OMR practice sheet layout builder.
 *
 * Patterns encoded from NTA NEET (UG) information bulletins:
 *  - 2021–2024 pattern: 200 questions are printed on the paper — each of the four
 *    subjects carries Section A (35 compulsory questions) and Section B (15 printed
 *    questions of which any 10 are to be attempted), so 180 answers are marked.
 *  - 2025 pattern: Section B was withdrawn — 180 compulsory questions, 45 per subject.
 *
 * NEET answer options are printed as (1) (2) (3) (4), and the OMR is marked with a
 * ball-point pen. Correct answers earn +4 and wrong answers −1 under the NTA
 * marking scheme (encoded here only for the sheet legend).
 */

/** NEET options are numbered, not lettered (NTA bulletin, question paper format). */
export const NEET_OPTION_LABELS = ["1", "2", "3", "4"];

/** NTA marking scheme for NEET (UG): +4 correct, −1 incorrect, 0 unattempted. */
export const MARKS_CORRECT = 4;
export const MARKS_WRONG = -1;

/** Subject order as printed on the NEET question paper and OMR. */
export const NEET_SUBJECTS = ["Physics", "Chemistry", "Botany", "Zoology"];

/** Digits available in each roll-number grid column. */
export const ROLL_DIGIT_ROWS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Sensible bounds for the roll-number grid so the sheet stays printable on A4. */
export const MIN_ROLL_COLUMNS = 4;
export const MAX_ROLL_COLUMNS = 15;
/** NEET admit cards carry a long numeric roll/application number; 12 fits both. */
export const DEFAULT_ROLL_COLUMNS = 12;

export const SHEET_PATTERNS = [
  {
    id: "neet-200",
    label: "NEET 2021–2024 pattern — 200 questions (Section A 35 + Section B 15 per subject)",
    totalQuestions: 200,
    perSubject: 50,
    sectionA: 35,
    sectionB: 15,
    answersToMark: 180,
  },
  {
    id: "neet-180",
    label: "NEET 2025 pattern — 180 questions (45 per subject, all compulsory)",
    totalQuestions: 180,
    perSubject: 45,
    sectionA: 45,
    sectionB: 0,
    answersToMark: 180,
  },
];

/**
 * Build the full OMR sheet model for a NEET pattern.
 *
 * @param {object} input
 * @param {string} input.patternId    One of SHEET_PATTERNS ids.
 * @param {number} input.rollColumns  Number of roll-number grid columns.
 * @returns {object} { pattern, blocks, rollColumns, totalQuestions, answersToMark }
 *                   or { error } for invalid input.
 */
export function buildNeetSheet({ patternId, rollColumns = DEFAULT_ROLL_COLUMNS }) {
  const pattern = SHEET_PATTERNS.find((p) => p.id === patternId);
  if (!pattern) return { error: "Choose a NEET paper pattern for the sheet." };

  const columns = Number(rollColumns);
  if (!Number.isInteger(columns) || columns < MIN_ROLL_COLUMNS || columns > MAX_ROLL_COLUMNS) {
    return {
      error: `Roll number columns must be a whole number between ${MIN_ROLL_COLUMNS} and ${MAX_ROLL_COLUMNS}.`,
    };
  }

  const blocks = [];
  let next = 1;
  for (const subject of NEET_SUBJECTS) {
    const sectionAQuestions = range(next, pattern.sectionA);
    next += pattern.sectionA;
    blocks.push({
      subject,
      section: pattern.sectionB > 0 ? "Section A" : null,
      start: sectionAQuestions[0],
      end: sectionAQuestions[sectionAQuestions.length - 1],
      questions: sectionAQuestions,
    });
    if (pattern.sectionB > 0) {
      const sectionBQuestions = range(next, pattern.sectionB);
      next += pattern.sectionB;
      blocks.push({
        subject,
        section: "Section B",
        start: sectionBQuestions[0],
        end: sectionBQuestions[sectionBQuestions.length - 1],
        questions: sectionBQuestions,
      });
    }
  }

  return {
    pattern,
    blocks,
    rollColumns: columns,
    totalQuestions: pattern.totalQuestions,
    answersToMark: pattern.answersToMark,
    subjects: NEET_SUBJECTS.length,
    optionLabels: NEET_OPTION_LABELS,
  };
}

/** Consecutive integers: range(5, 3) -> [5, 6, 7]. Length <= 0 gives []. */
export function range(start, length) {
  const s = Number(start);
  const n = Number(length);
  if (!Number.isInteger(s) || !Number.isInteger(n) || n <= 0) return [];
  return Array.from({ length: n }, (_, i) => s + i);
}
