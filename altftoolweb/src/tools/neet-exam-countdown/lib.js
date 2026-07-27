/**
 * NEET (UG) countdown, chapter-wise pace indicator and daily question target.
 *
 * The paper facts encoded here come from the NTA NEET (UG) Information
 * Bulletin (pattern in force from NEET 2025, when the optional Section B was
 * withdrawn):
 *
 *  - 180 compulsory multiple-choice questions worth 720 marks, answered in
 *    180 minutes on an OMR sheet.
 *  - Subject split: Physics 45, Chemistry 45, Biology 90 (Botany 45 +
 *    Zoology 45).
 *  - Marking: +4 for a correct answer, −1 for a wrong one, 0 for a blank.
 *
 * The pace maths is plain proportion, not a study method:
 *
 *      requiredChaptersPerDay = chaptersLeft / (daysToExam − revisionDays)
 *
 * and the pace indicator compares the share of the syllabus finished with the
 * share of prep time already spent:
 *
 *      paceDelta = %chaptersDone − %prepTimeElapsed
 *
 * Chapter counts default to the rationalised NTA syllabus in force since
 * NEET 2024, but every count is editable because trackers, coaching modules
 * and state-board editions divide chapters differently.
 *
 * Pure functions only — today's date is always an argument.
 */

/** NTA NEET (UG) paper: 180 questions, 720 marks, 180 minutes. */
export const TOTAL_QUESTIONS = 180;
export const TOTAL_MARKS = 720;
export const EXAM_DURATION_MINUTES = 180;

/** NTA marking scheme: +4 correct, −1 wrong, 0 unanswered. */
export const MARK_CORRECT = 4;
export const PENALTY_WRONG = 1;

const MS_PER_DAY = 86400000;
const DAYS_PER_WEEK = 7;
const MAX_PRACTICE_QUESTIONS_PER_DAY = 1000;

/**
 * Subjects with their question count in the paper (fixed by NTA) and a
 * default chapter count from the rationalised syllabus — editable in the UI.
 */
export const SUBJECTS = [
  { id: "physics", label: "Physics", questions: 45, defaultChapters: 20, defaultDone: 8 },
  { id: "chemistry", label: "Chemistry", questions: 45, defaultChapters: 20, defaultDone: 9 },
  { id: "biology", label: "Biology (Botany + Zoology)", questions: 90, defaultChapters: 38, defaultDone: 15 },
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

/**
 * Countdown, per-subject pace and a daily practice-question split.
 *
 * @param {object} input
 * @param {string} input.todayISO           today's date
 * @param {string} input.examISO            exam date from the NTA notice
 * @param {string} [input.prepStartISO]     when serious prep began (for the pace indicator)
 * @param {number} input.revisionDays       days at the end kept for full-syllabus revision
 * @param {number} input.dailyPracticeQuestions questions solved per day, split by paper pattern
 * @param {Array}  input.subjects           [{ id, label, questions, chaptersTotal, chaptersDone }]
 * @returns {object} plan, or { error }
 */
export function buildNeetPlan({
  todayISO,
  examISO,
  prepStartISO = "",
  revisionDays,
  dailyPracticeQuestions,
  subjects,
}) {
  if (parseISODate(todayISO) === null) {
    return { error: "Enter today's date as a valid calendar date." };
  }
  if (parseISODate(examISO) === null) {
    return { error: "Enter the NEET exam date as a valid calendar date." };
  }

  const daysToExam = daysBetween(todayISO, examISO);
  if (daysToExam < 0) {
    return { error: "That exam date is already past — set the next NEET date from the NTA notice." };
  }

  const revision = Number(revisionDays);
  if (!Number.isFinite(revision) || revision < 0) {
    return { error: "Revision buffer days must be zero or more." };
  }
  if (revision > daysToExam) {
    return {
      error: `Only ${daysToExam} day(s) remain, so a ${revision}-day revision buffer leaves no study days. Reduce it.`,
    };
  }

  const practice = Number(dailyPracticeQuestions);
  if (!Number.isFinite(practice) || practice < 0) {
    return { error: "Daily practice questions must be zero or more." };
  }
  if (practice > MAX_PRACTICE_QUESTIONS_PER_DAY) {
    return { error: `More than ${MAX_PRACTICE_QUESTIONS_PER_DAY} questions a day is not a plan a human can keep.` };
  }

  if (!Array.isArray(subjects) || subjects.length === 0) {
    return { error: "At least one subject is needed to build the pace plan." };
  }

  const studyDays = daysToExam - revision;

  let chaptersTotalAll = 0;
  let chaptersDoneAll = 0;
  const paperQuestions = subjects.reduce((sum, s) => sum + Number(s.questions || 0), 0);
  if (paperQuestions <= 0) {
    return { error: "Subject question counts must add up to more than zero." };
  }

  const rows = [];
  for (const subject of subjects) {
    const total = Number(subject.chaptersTotal);
    const done = Number(subject.chaptersDone);
    if (!Number.isFinite(total) || total <= 0) {
      return { error: `${subject.label}: total chapters must be greater than zero.` };
    }
    if (!Number.isFinite(done) || done < 0) {
      return { error: `${subject.label}: chapters completed cannot be negative.` };
    }
    if (done > total) {
      return { error: `${subject.label}: chapters completed cannot exceed the total (${total}).` };
    }
    const left = total - done;
    chaptersTotalAll += total;
    chaptersDoneAll += done;
    rows.push({
      id: subject.id,
      label: subject.label,
      questions: Number(subject.questions || 0),
      chaptersTotal: total,
      chaptersDone: done,
      chaptersLeft: left,
      percentDone: (done / total) * 100,
      // Required pace to clear the remaining chapters before revision begins.
      requiredChaptersPerDay: left === 0 ? 0 : studyDays > 0 ? left / studyDays : null,
      // Daily practice questions in proportion to the paper's subject weights.
      dailyQuestionTarget: (Number(subject.questions || 0) / paperQuestions) * practice,
    });
  }

  const chaptersLeftAll = chaptersTotalAll - chaptersDoneAll;
  const syllabusPercentDone = (chaptersDoneAll / chaptersTotalAll) * 100;

  // Pace indicator: compare syllabus % done against prep time % elapsed.
  let pace = null;
  if (typeof prepStartISO === "string" && prepStartISO.trim() !== "") {
    if (parseISODate(prepStartISO) === null) {
      return { error: "Enter the prep start date as a valid calendar date." };
    }
    const elapsed = daysBetween(prepStartISO, todayISO);
    const span = daysBetween(prepStartISO, examISO) - revision;
    if (elapsed < 0) {
      return { error: "The prep start date cannot be after today." };
    }
    if (span > 0) {
      const timePercent = Math.min(100, (elapsed / span) * 100);
      const delta = syllabusPercentDone - timePercent;
      pace = {
        elapsedDays: elapsed,
        spanDays: span,
        timePercent,
        delta,
        // Within ±5 percentage points of even pace counts as on track.
        status: delta >= 5 ? "ahead" : delta <= -5 ? "behind" : "on-track",
      };
    }
  }

  return {
    daysToExam,
    weeksToExam: Math.floor(daysToExam / DAYS_PER_WEEK),
    spareDays: daysToExam % DAYS_PER_WEEK,
    studyDays,
    revisionDays: revision,
    examIsToday: daysToExam === 0,
    rows,
    chaptersTotalAll,
    chaptersDoneAll,
    chaptersLeftAll,
    syllabusPercentDone,
    requiredChaptersPerDayAll:
      chaptersLeftAll === 0 ? 0 : studyDays > 0 ? chaptersLeftAll / studyDays : null,
    dailyPracticeQuestions: practice,
    pace,
  };
}

/**
 * Marks under the NEET scheme for an attempt plan: +4 correct, −1 wrong.
 *
 * @returns {object} { correct, wrong, marks, maxMarks, breakEvenAccuracy } or { error }
 */
export function projectedScore({ attempted, accuracyPercent }) {
  const tries = Number(attempted);
  const accuracy = Number(accuracyPercent);

  if (!Number.isFinite(tries) || tries < 0) {
    return { error: "Questions attempted must be zero or more." };
  }
  if (tries > TOTAL_QUESTIONS) {
    return { error: `NEET has only ${TOTAL_QUESTIONS} questions.` };
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
    /** Accuracy at which one more guess breaks even: 1 / (4 + 1) = 20%. */
    breakEvenAccuracy: (PENALTY_WRONG / (MARK_CORRECT + PENALTY_WRONG)) * 100,
  };
}
