/**
 * CLAT (UG) countdown, prep milestones and section-wise daily targets.
 *
 * Paper facts from the Consortium of NLUs notification (pattern in force
 * since CLAT 2024, when the paper was cut from 150 to 120 questions):
 *
 *  - 120 multiple-choice questions, 120 marks, 120 minutes, pen-and-paper.
 *  - Marking: +1 for a correct answer, −0.25 for a wrong one.
 *  - Sections and their published question ranges:
 *      English Language              22–26  (~20%)
 *      Current Affairs incl. GK      28–32  (~25%)
 *      Legal Reasoning               28–32  (~25%)
 *      Logical Reasoning             22–26  (~20%)
 *      Quantitative Techniques       10–14  (~10%)
 *    Daily targets below use the midpoint of each range.
 *
 * Planning rules (defaults, all editable — they are conventions of CLAT
 * prep, not Consortium rules):
 *
 *  - Current affairs questions overwhelmingly come from roughly the twelve
 *    months before the exam, so coverage is tracked in months of news
 *    compiled and revised.
 *  - The last MOCK_PHASE_DAYS days are kept mock-heavy: full papers plus
 *    current-affairs revision, no new topics.
 *
 * Pure functions only — today's date is always an argument.
 */

/** Consortium pattern since CLAT 2024: 120 questions, 120 marks, 120 minutes. */
export const TOTAL_QUESTIONS = 120;
export const TOTAL_MARKS = 120;
export const EXAM_DURATION_MINUTES = 120;

/** Marking: +1 correct, −0.25 wrong. */
export const MARK_CORRECT = 1;
export const PENALTY_WRONG = 0.25;

/** Current affairs in CLAT is drawn mainly from the ~12 months before the paper. */
export const CURRENT_AFFAIRS_MONTHS = 12;

/** Final stretch reserved for full mocks and current-affairs revision (planning default). */
export const MOCK_PHASE_DAYS = 30;

/** Sectional-test phase before the mock phase begins (planning default). */
export const SECTIONAL_PHASE_DAYS = 30;

const MS_PER_DAY = 86400000;
const DAYS_PER_WEEK = 7;
const MAX_DAILY_QUESTIONS = 500;
const MAX_MOCKS_PER_WEEK = 14;

/** Sections with the Consortium's question ranges; midpoint drives the split. */
export const SECTIONS = [
  { id: "english", label: "English Language", min: 22, max: 26 },
  { id: "current-affairs", label: "Current Affairs incl. GK", min: 28, max: 32 },
  { id: "legal", label: "Legal Reasoning", min: 28, max: 32 },
  { id: "logical", label: "Logical Reasoning", min: 22, max: 26 },
  { id: "quant", label: "Quantitative Techniques", min: 10, max: 14 },
];

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

/** Add whole days to a civil date and return YYYY-MM-DD. */
export function addDays(isoDate, days) {
  const stamp = parseISODate(isoDate);
  if (stamp === null || !Number.isFinite(days)) return "";
  const moved = new Date(stamp + Math.trunc(days) * MS_PER_DAY);
  const year = String(moved.getUTCFullYear()).padStart(4, "0");
  const month = String(moved.getUTCMonth() + 1).padStart(2, "0");
  const day = String(moved.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Countdown, phase milestones, mock capacity, current-affairs pace and
 * section-wise daily question targets.
 *
 * @param {object} input
 * @param {string} input.todayISO
 * @param {string} input.examISO                 CLAT date from the Consortium notice
 * @param {number} input.mocksPerWeek            full mocks you can realistically write
 * @param {number} input.caMonthsCovered         months of current affairs already compiled and revised
 * @param {number} input.dailyPracticeQuestions  questions per day, split by section midpoints
 * @returns {object} plan, or { error }
 */
export function buildClatPlan({
  todayISO,
  examISO,
  mocksPerWeek,
  caMonthsCovered,
  dailyPracticeQuestions,
}) {
  if (parseISODate(todayISO) === null) {
    return { error: "Enter today's date as a valid calendar date." };
  }
  if (parseISODate(examISO) === null) {
    return { error: "Enter the CLAT exam date as a valid calendar date." };
  }
  const daysToExam = daysBetween(todayISO, examISO);
  if (daysToExam < 0) {
    return { error: "That exam date is already past — set the next CLAT date from the Consortium notice." };
  }

  const mocks = Number(mocksPerWeek);
  if (!Number.isFinite(mocks) || mocks < 0) {
    return { error: "Mocks per week must be zero or more." };
  }
  if (mocks > MAX_MOCKS_PER_WEEK) {
    return { error: `More than ${MAX_MOCKS_PER_WEEK} full mocks a week leaves no time to analyse any of them.` };
  }

  const caCovered = Number(caMonthsCovered);
  if (!Number.isFinite(caCovered) || caCovered < 0) {
    return { error: "Months of current affairs covered must be zero or more." };
  }
  if (caCovered > CURRENT_AFFAIRS_MONTHS) {
    return { error: `The tracker covers the ${CURRENT_AFFAIRS_MONTHS} months before the exam — coverage cannot exceed that.` };
  }

  const practice = Number(dailyPracticeQuestions);
  if (!Number.isFinite(practice) || practice < 0) {
    return { error: "Daily practice questions must be zero or more." };
  }
  if (practice > MAX_DAILY_QUESTIONS) {
    return { error: `More than ${MAX_DAILY_QUESTIONS} questions a day is not a sustainable plan.` };
  }

  const weeksToExam = Math.floor(daysToExam / DAYS_PER_WEEK);
  const mocksPossible = Math.floor((daysToExam / DAYS_PER_WEEK) * mocks);

  // Phase boundaries, clipped when the exam is closer than the standard windows.
  const mockPhaseStartDays = Math.min(daysToExam, MOCK_PHASE_DAYS);
  const sectionalPhaseStartDays = Math.min(daysToExam, MOCK_PHASE_DAYS + SECTIONAL_PHASE_DAYS);
  const phases = [
    {
      id: "foundation",
      label: "Concepts and section practice",
      fromISO: todayISO,
      toISO: addDays(examISO, -sectionalPhaseStartDays),
      days: Math.max(0, daysToExam - sectionalPhaseStartDays),
      note: "New topics, passage practice and current-affairs compilation.",
    },
    {
      id: "sectionals",
      label: "Sectional tests",
      fromISO: addDays(examISO, -sectionalPhaseStartDays),
      toISO: addDays(examISO, -mockPhaseStartDays),
      days: Math.max(0, sectionalPhaseStartDays - mockPhaseStartDays),
      note: "Timed section tests; legal and current-affairs sections every week.",
    },
    {
      id: "mocks",
      label: "Full mocks + CA revision",
      fromISO: addDays(examISO, -mockPhaseStartDays),
      toISO: examISO,
      days: mockPhaseStartDays,
      note: "Full papers on the exam clock, analysis, and current-affairs revision only.",
    },
  ];

  // Current affairs pace: months still to compile vs days before the mock phase.
  const caMonthsLeft = CURRENT_AFFAIRS_MONTHS - caCovered;
  const caDaysAvailable = Math.max(0, daysToExam - mockPhaseStartDays);
  const caDaysPerMonth =
    caMonthsLeft === 0 ? 0 : caDaysAvailable > 0 ? caDaysAvailable / caMonthsLeft : null;

  const midpointTotal = SECTIONS.reduce((sum, s) => sum + (s.min + s.max) / 2, 0);
  const sections = SECTIONS.map((section) => {
    const midpoint = (section.min + section.max) / 2;
    return {
      ...section,
      midpoint,
      sharePercent: (midpoint / midpointTotal) * 100,
      dailyQuestionTarget: (midpoint / midpointTotal) * practice,
    };
  });

  return {
    daysToExam,
    weeksToExam,
    spareDays: daysToExam % DAYS_PER_WEEK,
    examIsToday: daysToExam === 0,
    mocksPerWeek: mocks,
    mocksPossible,
    phases,
    caMonthsCovered: caCovered,
    caMonthsLeft,
    caDaysAvailable,
    caDaysPerMonth,
    caPercentCovered: (caCovered / CURRENT_AFFAIRS_MONTHS) * 100,
    sections,
    dailyPracticeQuestions: practice,
  };
}

/**
 * Marks under the CLAT scheme: +1 correct, −0.25 wrong, 0 blank.
 * @returns {object} { correct, wrong, marks, maxMarks, breakEvenAccuracy } or { error }
 */
export function projectedScore({ attempted, accuracyPercent }) {
  const tries = Number(attempted);
  const accuracy = Number(accuracyPercent);

  if (!Number.isFinite(tries) || tries < 0) {
    return { error: "Questions attempted must be zero or more." };
  }
  if (tries > TOTAL_QUESTIONS) {
    return { error: `CLAT has only ${TOTAL_QUESTIONS} questions.` };
  }
  if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100) {
    return { error: "Accuracy must be between 0% and 100%." };
  }

  const correct = (tries * accuracy) / 100;
  const wrong = tries - correct;
  return {
    correct,
    wrong,
    marks: correct * MARK_CORRECT - wrong * PENALTY_WRONG,
    maxMarks: TOTAL_MARKS,
    /** Accuracy at which a guess breaks even: 0.25 / (1 + 0.25) = 20%. */
    breakEvenAccuracy: (PENALTY_WRONG / (MARK_CORRECT + PENALTY_WRONG)) * 100,
  };
}
