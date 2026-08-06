/**
 * NDA / CDS defence exam countdown: written paper date, paper-wise attempt
 * maths, and the SSB interview window.
 *
 * Facts encoded from the UPSC examination notices:
 *
 *  - NDA & NA written examination: Mathematics — 300 marks, 120 questions,
 *    2½ hours; General Ability Test — 600 marks, 150 questions, 2½ hours.
 *    Written total 900; the SSB interview carries a further 900 marks.
 *  - CDS written (IMA / INA / AFA entries): English, General Knowledge and
 *    Elementary Mathematics, 100 marks and 2 hours each (English and GK have
 *    120 questions, Mathematics 100). OTA entry drops Mathematics.
 *    SSB carries 300 marks for IMA/INA/AFA entries and 200 for OTA.
 *  - Negative marking (UPSC rule printed in every notice): one-third of the
 *    marks assigned to a question is deducted for each wrong answer.
 *  - The SSB (Services Selection Board) process is a 5-day affair: screening
 *    on day 1, psychology tests on day 2, GTO tasks on days 3–4, and the
 *    conference on day 5. The interview happens on one of days 2–4.
 *
 * Pure functions only — today's date is always an argument.
 */

/** UPSC deducts one-third of a question's marks for a wrong answer. */
export const NEGATIVE_MARK_FRACTION = 1 / 3;

/** The SSB selection process runs five days from reporting to conference. */
export const SSB_PROCESS_DAYS = 5;

const MS_PER_DAY = 86400000;
const DAYS_PER_WEEK = 7;

/** Written-paper structure per exam, from the UPSC notices. */
export const EXAM_PRESETS = [
  {
    id: "nda",
    label: "NDA & NA (written 900 + SSB 900)",
    ssbMarks: 900,
    papers: [
      { id: "maths", label: "Mathematics", marks: 300, questions: 120, minutes: 150 },
      { id: "gat", label: "General Ability Test", marks: 600, questions: 150, minutes: 150 },
    ],
  },
  {
    id: "cds-ima",
    label: "CDS — IMA / INA / AFA (written 300 + SSB 300)",
    ssbMarks: 300,
    papers: [
      { id: "english", label: "English", marks: 100, questions: 120, minutes: 120 },
      { id: "gk", label: "General Knowledge", marks: 100, questions: 120, minutes: 120 },
      { id: "maths", label: "Elementary Mathematics", marks: 100, questions: 100, minutes: 120 },
    ],
  },
  {
    id: "cds-ota",
    label: "CDS — OTA (written 200 + SSB 200)",
    ssbMarks: 200,
    papers: [
      { id: "english", label: "English", marks: 100, questions: 120, minutes: 120 },
      { id: "gk", label: "General Knowledge", marks: 100, questions: 120, minutes: 120 },
    ],
  },
];

/** The standard 5-day SSB schedule. */
export const SSB_SCHEDULE = [
  { day: 1, label: "Screening", detail: "Officer Intelligence Rating (OIR) test and Picture Perception & Description Test (PPDT). Only screened-in candidates stay." },
  { day: 2, label: "Psychology tests", detail: "TAT, WAT, SRT and Self-Description written in one sitting. Personal interviews begin from this evening for some batches." },
  { day: 3, label: "GTO — day 1", detail: "Group discussion, group planning, progressive group task, group obstacle race and half group task." },
  { day: 4, label: "GTO — day 2", detail: "Individual obstacles, command task, lecturette and final group task. Interviews continue." },
  { day: 5, label: "Conference", detail: "Board conference, final results announced, medicals for recommended candidates follow." },
];

export function presetById(id) {
  return EXAM_PRESETS.find((preset) => preset.id === id) || null;
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

/** Add whole civil days to a YYYY-MM-DD date. Returns null on invalid input. */
export function addDaysISO(iso, days) {
  const stamp = parseISODate(iso);
  if (stamp === null || !Number.isFinite(days)) return null;
  const next = new Date(stamp + days * MS_PER_DAY);
  const year = String(next.getUTCFullYear()).padStart(4, "0");
  const month = String(next.getUTCMonth() + 1).padStart(2, "0");
  const day = String(next.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Countdown to the written paper and, when known, to the SSB window.
 *
 * @param {object} input
 * @param {string} input.todayISO
 * @param {string} input.writtenISO      written exam date from the UPSC notice
 * @param {string} [input.ssbStartISO]   first day of your allotted SSB reporting window, if known
 * @param {number} input.dailyStudyHours planning input for the study-hours total
 * @returns {object} plan, or { error }
 */
export function buildDefenceCountdown({ todayISO, writtenISO, ssbStartISO = "", dailyStudyHours }) {
  if (parseISODate(todayISO) === null) {
    return { error: "Enter today's date as a valid calendar date." };
  }
  if (parseISODate(writtenISO) === null) {
    return { error: "Enter the written exam date as a valid calendar date." };
  }
  const daysToWritten = daysBetween(todayISO, writtenISO);
  if (daysToWritten < 0) {
    return { error: "That written exam date is already past — set the next one from the UPSC calendar." };
  }

  const hours = Number(dailyStudyHours);
  if (!Number.isFinite(hours) || hours < 0 || hours > 18) {
    return { error: "Daily study hours must be between 0 and 18." };
  }

  let ssb = null;
  if (typeof ssbStartISO === "string" && ssbStartISO.trim() !== "") {
    if (parseISODate(ssbStartISO) === null) {
      return { error: "Enter the SSB reporting date as a valid calendar date." };
    }
    const daysToSsb = daysBetween(todayISO, ssbStartISO);
    const writtenToSsb = daysBetween(writtenISO, ssbStartISO);
    if (writtenToSsb < 0) {
      return { error: "The SSB reporting date cannot be before the written exam." };
    }
    // Conference day is reporting day + 4 (five days inclusive).
    const conferenceOffsetDays = SSB_PROCESS_DAYS - 1;
    ssb = {
      daysToSsb,
      writtenToSsb,
      processDays: SSB_PROCESS_DAYS,
      conferenceOffsetDays,
      conferenceISO: addDaysISO(ssbStartISO, conferenceOffsetDays),
    };
  }

  return {
    daysToWritten,
    weeksToWritten: Math.floor(daysToWritten / DAYS_PER_WEEK),
    spareDays: daysToWritten % DAYS_PER_WEEK,
    writtenIsToday: daysToWritten === 0,
    studyHoursLeft: daysToWritten * hours,
    ssb,
  };
}

/**
 * Attempt maths for one paper under the UPSC one-third negative rule.
 *
 *   marks per question = paper marks / question count
 *   penalty            = one-third of marks per question
 *
 * @returns {object} projection or { error }
 */
export function paperProjection({ paper, attempted, accuracyPercent }) {
  if (!paper || !Number.isFinite(Number(paper.marks)) || !Number.isFinite(Number(paper.questions))) {
    return { error: "Pick a paper first." };
  }
  const tries = Number(attempted);
  const accuracy = Number(accuracyPercent);
  const questions = Number(paper.questions);
  const paperMarks = Number(paper.marks);

  if (questions <= 0 || paperMarks <= 0) {
    return { error: "The paper must have questions and marks greater than zero." };
  }
  if (!Number.isFinite(tries) || tries < 0) {
    return { error: "Questions attempted must be zero or more." };
  }
  if (tries > questions) {
    return { error: `${paper.label} has only ${questions} questions.` };
  }
  if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100) {
    return { error: "Accuracy must be between 0% and 100%." };
  }

  const marksPerQuestion = paperMarks / questions;
  const penaltyPerWrong = marksPerQuestion * NEGATIVE_MARK_FRACTION;
  const correct = (tries * accuracy) / 100;
  const wrong = tries - correct;

  return {
    marksPerQuestion,
    penaltyPerWrong,
    correct,
    wrong,
    marks: correct * marksPerQuestion - wrong * penaltyPerWrong,
    maxMarks: paperMarks,
    /**
     * Accuracy at which one more guess breaks even:
     * p·m = (1−p)·m/3  →  p = 1/4 = 25%.
     */
    breakEvenAccuracy:
      (NEGATIVE_MARK_FRACTION / (1 + NEGATIVE_MARK_FRACTION)) * 100,
  };
}
