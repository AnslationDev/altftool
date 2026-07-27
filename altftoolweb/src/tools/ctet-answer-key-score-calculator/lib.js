/**
 * CTET scoring, from the CBSE exam pattern.
 *
 * Both papers of the Central Teacher Eligibility Test carry 150 multiple-choice
 * questions of one mark each, for 150 marks in 150 minutes, and there is NO negative
 * marking — a wrong answer costs nothing, which is why leaving a question blank is
 * never better than guessing.
 *
 *  Paper I (for classes I to V) has five sections of 30 questions each:
 *    Child Development and Pedagogy, Language I, Language II, Mathematics,
 *    Environmental Studies.
 *  Paper II (for classes VI to VIII) has Child Development and Pedagogy, Language I and
 *    Language II at 30 questions each, plus one 60-question subject block: Mathematics
 *    and Science for a maths or science teacher, or Social Studies / Social Science for
 *    a social studies teacher.
 *
 * The qualifying standard is 60% — 90 marks out of 150. CBSE's notification adds that
 * school managements may extend a relaxation of up to 5% to candidates of reserved
 * categories in line with their existing reservation policy, which works out at 55%;
 * many state notices state that as 82 marks, while 55% of 150 is arithmetically 82.5.
 * Both figures are reported here so nothing is hidden behind a rounding choice.
 *
 * A CTET certificate issued for a qualifying candidate is valid for life, following the
 * 2021 decision to replace the earlier seven-year validity.
 */

export const MARKS_PER_QUESTION = 1;
export const NEGATIVE_MARKING = 0;
export const TOTAL_QUESTIONS = 150;
export const TOTAL_MARKS = 150;
export const DURATION_MINUTES = 150;

/** Qualifying percentages: 60% general, 55% where the 5% relaxation is extended. */
export const QUALIFYING_PERCENT = { general: 60, reserved: 55 };

/** Marks commonly quoted in notifications for the relaxed categories. */
export const RESERVED_MARKS_COMMONLY_QUOTED = 82;

export const PAPERS = {
  paper1: { key: "paper1", label: "Paper I — classes I to V", tracks: [] },
  paper2: {
    key: "paper2",
    label: "Paper II — classes VI to VIII",
    tracks: [
      { key: "mathsci", label: "Mathematics and Science teacher" },
      { key: "social", label: "Social Studies / Social Science teacher" },
    ],
  },
};

const PAPER1_SECTIONS = [
  { key: "cdp", label: "Child Development & Pedagogy", questions: 30 },
  { key: "lang1", label: "Language I", questions: 30 },
  { key: "lang2", label: "Language II", questions: 30 },
  { key: "maths", label: "Mathematics", questions: 30 },
  { key: "evs", label: "Environmental Studies", questions: 30 },
];

const PAPER2_COMMON = [
  { key: "cdp", label: "Child Development & Pedagogy", questions: 30 },
  { key: "lang1", label: "Language I", questions: 30 },
  { key: "lang2", label: "Language II", questions: 30 },
];

/**
 * The section list for a paper (and, for Paper II, the subject track).
 * @param {"paper1"|"paper2"} paper
 * @param {"mathsci"|"social"} [track]
 */
export function sectionsFor(paper, track = "mathsci") {
  if (paper === "paper1") return PAPER1_SECTIONS;
  const subject =
    track === "social"
      ? { key: "social", label: "Social Studies / Social Science", questions: 60 }
      : { key: "mathsci", label: "Mathematics and Science", questions: 60 };
  return [...PAPER2_COMMON, subject];
}

const isInt = (value) => typeof value === "number" && Number.isFinite(value) && Number.isInteger(value);
const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Score a CTET paper from a marked response sheet.
 *
 * @param {object} input
 * @param {"paper1"|"paper2"} input.paper
 * @param {"mathsci"|"social"} [input.track]
 * @param {Object<string, {correct: number, wrong: number}>} input.responses keyed by section
 * @param {"general"|"reserved"} [input.category]
 * @returns {object} the score card, or { error }.
 */
export function scoreCtet({ paper = "paper1", track = "mathsci", responses = {}, category = "general" } = {}) {
  if (!PAPERS[paper]) return { error: "Choose Paper I or Paper II." };
  if (!QUALIFYING_PERCENT[category]) return { error: "Choose a valid category." };

  const sections = sectionsFor(paper, track);
  const rows = [];
  let correct = 0;
  let wrong = 0;

  for (const section of sections) {
    const entry = responses[section.key] || {};
    const c = Number(entry.correct);
    const w = Number(entry.wrong);
    if (!isInt(c) || !isInt(w)) {
      return { error: `${section.label}: enter whole numbers of correct and wrong answers.` };
    }
    if (c < 0 || w < 0) return { error: `${section.label}: counts cannot be negative.` };
    if (c + w > section.questions) {
      return {
        error: `${section.label}: correct plus wrong is ${c + w}, but the section only has ${section.questions} questions.`,
      };
    }

    const attempted = c + w;
    const unattempted = section.questions - attempted;
    rows.push({
      key: section.key,
      label: section.label,
      questions: section.questions,
      correct: c,
      wrong: w,
      attempted,
      unattempted,
      marks: c * MARKS_PER_QUESTION,
      /** Share of the section's own marks. */
      sectionPercent: round2((c / section.questions) * 100),
      accuracy: attempted > 0 ? round2((c / attempted) * 100) : 0,
    });
    correct += c;
    wrong += w;
  }

  const attempted = correct + wrong;
  const unattempted = TOTAL_QUESTIONS - attempted;
  // No negative marking, so the score is simply the marks for the correct answers.
  const score = correct * MARKS_PER_QUESTION;
  const percentage = round2((score / TOTAL_MARKS) * 100);

  const qualifyingPercent = QUALIFYING_PERCENT[category];
  const exactQualifyingMarks = round2((TOTAL_MARKS * qualifyingPercent) / 100);
  const qualifyingMarks = Math.ceil(exactQualifyingMarks);
  const qualified = score >= qualifyingMarks;

  return {
    paper,
    track: paper === "paper2" ? track : null,
    category,
    sections: rows,
    correct,
    wrong,
    attempted,
    unattempted,
    score,
    percentage,
    accuracy: attempted > 0 ? round2((correct / attempted) * 100) : 0,
    qualifyingPercent,
    /** 90 for general; 82.5 exact for the relaxed categories, so 83 whole marks. */
    exactQualifyingMarks,
    qualifyingMarks,
    qualified,
    marksNeeded: qualified ? 0 : qualifyingMarks - score,
    /** Marks left on the table: unattempted questions cost nothing to guess. */
    marksForgone: unattempted * MARKS_PER_QUESTION,
    strongest: rows.reduce((best, row) => (best === null || row.sectionPercent > best.sectionPercent ? row : best), null),
    weakest: rows.reduce((worst, row) => (worst === null || row.sectionPercent < worst.sectionPercent ? row : worst), null),
  };
}
