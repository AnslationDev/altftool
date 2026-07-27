/**
 * TET (Teacher Eligibility Test) countdown with a paper-wise prep tracker.
 *
 * Facts encoded from the CBSE CTET Information Bulletin and the NCTE
 * guidelines that state TETs follow:
 *
 *  - Paper I is for classes 1–5, Paper II for classes 6–8. A candidate who
 *    wants to teach both levels writes both papers.
 *  - Each paper has 150 multiple-choice questions worth 150 marks in
 *    150 minutes, with NO negative marking — exactly one minute per question.
 *  - Paper I sections (30 questions × 1 mark each): Child Development &
 *    Pedagogy, Language I, Language II, Mathematics, Environmental Studies.
 *  - Paper II: CDP 30, Language I 30, Language II 30, and either
 *    Mathematics & Science (60) or Social Studies / Social Science (60).
 *  - Qualifying (NCTE guidelines): 60% for general candidates — 90 of 150.
 *    School managements may allow up to 5% relaxation for reserved
 *    categories, i.e. 55% — 82.5 of 150 (boards state the rounded figure in
 *    their own bulletins).
 *  - A TET qualifying certificate is valid for life (CBSE/NCTE decision of
 *    2021, applied retrospectively).
 *
 * Prep readiness is a weighted average: each section's self-assessed
 * readiness percent weighted by its share of the paper's questions.
 *
 * Pure functions only — today's date is always an argument.
 */

/** Every TET paper: 150 questions, 150 marks, 150 minutes, no negative marking. */
export const TOTAL_QUESTIONS = 150;
export const TOTAL_MARKS = 150;
export const EXAM_DURATION_MINUTES = 150;

/** NCTE qualifying thresholds. */
export const QUALIFYING_PERCENT_GENERAL = 60; // 90 of 150
export const QUALIFYING_PERCENT_RESERVED = 55; // 82.5 of 150 (5% relaxation)

const MS_PER_DAY = 86400000;
const DAYS_PER_WEEK = 7;
const MAX_STUDY_HOURS = 18;

/** Papers with their section structure. */
export const PAPER_PRESETS = [
  {
    id: "paper1",
    label: "Paper I — Classes 1 to 5",
    sections: [
      { id: "cdp", label: "Child Development & Pedagogy", questions: 30 },
      { id: "lang1", label: "Language I", questions: 30 },
      { id: "lang2", label: "Language II", questions: 30 },
      { id: "maths", label: "Mathematics", questions: 30 },
      { id: "evs", label: "Environmental Studies", questions: 30 },
    ],
  },
  {
    id: "paper2-maths-science",
    label: "Paper II — Classes 6 to 8 (Maths & Science)",
    sections: [
      { id: "cdp", label: "Child Development & Pedagogy", questions: 30 },
      { id: "lang1", label: "Language I", questions: 30 },
      { id: "lang2", label: "Language II", questions: 30 },
      { id: "maths-science", label: "Mathematics & Science", questions: 60 },
    ],
  },
  {
    id: "paper2-social",
    label: "Paper II — Classes 6 to 8 (Social Studies)",
    sections: [
      { id: "cdp", label: "Child Development & Pedagogy", questions: 30 },
      { id: "lang1", label: "Language I", questions: 30 },
      { id: "lang2", label: "Language II", questions: 30 },
      { id: "social", label: "Social Studies / Social Science", questions: 60 },
    ],
  },
];

export function paperById(id) {
  return PAPER_PRESETS.find((paper) => paper.id === id) || null;
}

/** Parse a YYYY-MM-DD civil date to a UTC timestamp. Returns null if invalid. */
export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const stamp = Date.UTC(year, month - 1, day);
  const probe = new Date(stamp);
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return stamp;
}

/** Whole days from one civil date to another. Negative if the target is past. */
export function daysBetween(fromISO, toISO) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISO);
  if (from === null || to === null) return null;
  return Math.round((to - from) / MS_PER_DAY);
}

/** Format a Date object as a local YYYY-MM-DD string (no UTC shift). */
export function toLocalISODate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Qualifying marks for a category, out of TOTAL_MARKS. */
export function qualifyingMarks(isReserved) {
  const percent = isReserved ? QUALIFYING_PERCENT_RESERVED : QUALIFYING_PERCENT_GENERAL;
  return { percent, marks: (percent / 100) * TOTAL_MARKS };
}

/**
 * Countdown plus a readiness score weighted by each section's question share.
 *
 * @param {object} input
 * @param {string} input.todayISO
 * @param {string} input.examISO          exam date from the board's notice
 * @param {string} input.paperId          one of PAPER_PRESETS ids
 * @param {object} input.readiness        { [sectionId]: percent 0–100 }
 * @param {number} input.dailyStudyHours
 * @param {number} input.latestMockScore  latest full-mock marks (out of 150), or NaN to skip
 * @param {boolean} input.isReserved      apply the 55% relaxed qualifying threshold
 * @returns {object} plan, or { error }
 */
export function buildTetPlan({
  todayISO,
  examISO,
  paperId,
  readiness = {},
  dailyStudyHours,
  latestMockScore = Number.NaN,
  isReserved = false,
}) {
  if (parseISODate(todayISO) === null) {
    return { error: "Enter today's date as a valid calendar date." };
  }
  if (parseISODate(examISO) === null) {
    return { error: "Enter the exam date as a valid calendar date." };
  }
  const daysToExam = daysBetween(todayISO, examISO);
  if (daysToExam < 0) {
    return { error: "That exam date is already past — set the next CTET or state TET date." };
  }

  const paper = paperById(paperId);
  if (!paper) {
    return { error: "Pick which TET paper you are preparing for." };
  }

  const hours = Number(dailyStudyHours);
  if (!Number.isFinite(hours) || hours < 0 || hours > MAX_STUDY_HOURS) {
    return { error: `Daily study hours must be between 0 and ${MAX_STUDY_HOURS}.` };
  }

  let weightedSum = 0;
  const sections = [];
  for (const section of paper.sections) {
    const value = Number(readiness[section.id]);
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      return { error: `${section.label}: readiness must be between 0% and 100%.` };
    }
    weightedSum += value * section.questions;
    sections.push({
      ...section,
      readinessPercent: value,
      weightPercent: (section.questions / TOTAL_QUESTIONS) * 100,
      // With no negative marking, expected marks scale directly with readiness.
      expectedMarks: (value / 100) * section.questions,
    });
  }
  const overallReadiness = weightedSum / TOTAL_QUESTIONS;
  const expectedMarks = sections.reduce((sum, s) => sum + s.expectedMarks, 0);

  const qualifying = qualifyingMarks(Boolean(isReserved));

  let mock = null;
  const mockScore = Number(latestMockScore);
  if (Number.isFinite(mockScore)) {
    if (mockScore < 0 || mockScore > TOTAL_MARKS) {
      return { error: `A mock score must be between 0 and ${TOTAL_MARKS}.` };
    }
    mock = {
      score: mockScore,
      gapToQualifying: qualifying.marks - mockScore,
      clearsQualifying: mockScore >= qualifying.marks,
    };
  }

  // Weakest section = lowest readiness, tie broken by bigger question weight.
  const weakest = sections.reduce(
    (worst, s) =>
      worst === null ||
      s.readinessPercent < worst.readinessPercent ||
      (s.readinessPercent === worst.readinessPercent && s.questions > worst.questions)
        ? s
        : worst,
    null,
  );

  return {
    daysToExam,
    weeksToExam: Math.floor(daysToExam / DAYS_PER_WEEK),
    spareDays: daysToExam % DAYS_PER_WEEK,
    examIsToday: daysToExam === 0,
    studyHoursLeft: daysToExam * hours,
    paper,
    sections,
    overallReadiness,
    expectedMarks,
    qualifying,
    expectedClearsQualifying: expectedMarks >= qualifying.marks,
    mock,
    weakest,
    /** 150 questions in 150 minutes: exactly one minute per question. */
    minutesPerQuestion: EXAM_DURATION_MINUTES / TOTAL_QUESTIONS,
  };
}
