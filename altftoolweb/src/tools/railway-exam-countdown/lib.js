/**
 * Railway Recruitment Board exam countdown, phase indicator and daily mix.
 *
 * All functions are pure — today's date is always an argument.
 *
 * 1. Countdown: whole calendar days between two civil dates, parsed at UTC
 *    midnight so no timezone or DST shift can move an answer by a day.
 *
 * 2. Phase: which band of the run-up you are in, from foundation study down to
 *    the final revision week.
 *
 * 3. Daily mix: how the day should be divided between new learning, practice
 *    with revision, and full mocks. It moves linearly with progress through
 *    your preparation window, where t = 1 - daysLeft / windowDays clamped to
 *    the range 0 to 1:
 *
 *      newLearning% = 60 x (1 - t)      60% on day one, 0% on exam day
 *      mocks%       = 10 + 40 x t       10% on day one, 50% on exam day
 *      revision%    = 100 - the other two
 *
 * 4. Expected net score under the one third negative marking that RRB computer
 *    based tests apply:
 *
 *      net = attempts x marksPerQuestion x (accuracy - (1/3) x (1 - accuracy))
 */

const MS_PER_DAY = 86400000;
const DAYS_PER_WEEK = 7;

/**
 * Every RRB computer based test deducts one third of the marks assigned to a
 * question for each wrong answer. Unattempted questions cost nothing, which
 * puts break-even accuracy at 25%.
 */
export const RRB_NEGATIVE_FRACTION = 1 / 3;

/**
 * Stage structures follow the pattern in recent Railway Recruitment Board
 * centralised employment notices. Question counts and durations differ between
 * notices, so treat these as the starting point and check the CEN you applied
 * under.
 */
export const RRB_EXAM_PRESETS = [
  {
    id: "ntpc",
    label: "RRB NTPC (Graduate & Undergraduate)",
    stages: [
      {
        id: "cbt1",
        label: "CBT 1",
        marks: 100,
        minutes: 90,
        sections: [
          { label: "General Awareness", questions: 40 },
          { label: "Mathematics", questions: 30 },
          { label: "General Intelligence & Reasoning", questions: 30 },
        ],
      },
      {
        id: "cbt2",
        label: "CBT 2",
        marks: 120,
        minutes: 90,
        sections: [
          { label: "General Awareness", questions: 50 },
          { label: "Mathematics", questions: 35 },
          { label: "General Intelligence & Reasoning", questions: 35 },
        ],
      },
      { id: "skill", label: "Typing skill test / CBAT", marks: 0, minutes: 0, sections: [] },
      { id: "dv", label: "Document verification & medical", marks: 0, minutes: 0, sections: [] },
    ],
  },
  {
    id: "groupd",
    label: "RRB Group D (Level 1)",
    stages: [
      {
        id: "cbt",
        label: "Single stage CBT",
        marks: 100,
        minutes: 90,
        sections: [
          { label: "General Intelligence & Reasoning", questions: 30 },
          { label: "General Science", questions: 25 },
          { label: "Mathematics", questions: 25 },
          { label: "General Awareness & Current Affairs", questions: 20 },
        ],
      },
      { id: "pet", label: "Physical efficiency test", marks: 0, minutes: 0, sections: [] },
      { id: "dv", label: "Document verification & medical", marks: 0, minutes: 0, sections: [] },
    ],
  },
  {
    id: "alp",
    label: "RRB ALP (Assistant Loco Pilot)",
    stages: [
      {
        id: "cbt1",
        label: "CBT 1",
        marks: 75,
        minutes: 60,
        sections: [
          { label: "General Intelligence & Reasoning", questions: 25 },
          { label: "Mathematics", questions: 20 },
          { label: "General Science", questions: 20 },
          { label: "General Awareness & Current Affairs", questions: 10 },
        ],
      },
      { id: "cbt2a", label: "CBT 2 Part A", marks: 100, minutes: 90, sections: [] },
      { id: "cbt2b", label: "CBT 2 Part B (qualifying)", marks: 75, minutes: 60, sections: [] },
      { id: "cbat", label: "Computer based aptitude test", marks: 0, minutes: 0, sections: [] },
      { id: "dv", label: "Document verification & medical", marks: 0, minutes: 0, sections: [] },
    ],
  },
  {
    id: "je",
    label: "RRB JE (Junior Engineer)",
    stages: [
      { id: "cbt1", label: "CBT 1", marks: 100, minutes: 90, sections: [] },
      { id: "cbt2", label: "CBT 2", marks: 150, minutes: 120, sections: [] },
      { id: "dv", label: "Document verification & medical", marks: 0, minutes: 0, sections: [] },
    ],
  },
];

/**
 * Preparation phase bands, in days remaining. A planning convention rather than
 * an official rule, chosen so the last month is spent on mocks and revision
 * instead of on unread chapters.
 */
export const RRB_PHASES = [
  {
    id: "foundation",
    label: "Foundation",
    minDays: 121,
    note: "New chapters, NCERT-level science and basic arithmetic. Mocks only to find your baseline.",
  },
  {
    id: "build",
    label: "Sectional build",
    minDays: 61,
    note: "Topic-wise question banks with a timer, plus daily current affairs for General Awareness.",
  },
  {
    id: "practice",
    label: "Practice and revision",
    minDays: 31,
    note: "Full sections against the clock, error log maintained, no untouched chapters left.",
  },
  {
    id: "mock",
    label: "Full mock sprint",
    minDays: 8,
    note: "Full-length CBTs in the shift timing on your admit card, each analysed the same day.",
  },
  {
    id: "final",
    label: "Final revision week",
    minDays: 1,
    note: "Formula sheets, static GK revision, admit card and ID sorted, travel to the centre planned.",
  },
  {
    id: "examday",
    label: "Exam day",
    minDays: 0,
    note: "Nothing new. Reach the centre early with the admit card and original photo ID.",
  },
];

/** Where the daily mix starts and ends, as percentages of study time. */
export const MIX_ENDPOINTS = {
  newLearningStart: 60,
  newLearningEnd: 0,
  mockStart: 10,
  mockEnd: 50,
};

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

/** The preparation phase for a given number of days remaining. */
export function phaseForDays(daysLeft) {
  if (!Number.isFinite(daysLeft) || daysLeft < 0) return null;
  return RRB_PHASES.find((phase) => daysLeft >= phase.minDays) || RRB_PHASES[RRB_PHASES.length - 1];
}

const clamp01 = (value) => Math.min(1, Math.max(0, value));

/**
 * Countdown, phase and daily study mix for one exam date.
 *
 * @param {object} input
 * @param {string} input.todayISO       today's date
 * @param {string} input.examISO        the exam date
 * @param {number} input.windowDays     length of your whole preparation window
 * @param {number} input.studyHoursPerDay hours you can actually study each day
 */
export function buildDayPlan({ todayISO, examISO, windowDays, studyHoursPerDay }) {
  const daysLeft = daysBetween(todayISO, examISO);
  if (daysLeft === null) return { error: "Enter the exam date as a valid calendar date." };
  if (daysLeft < 0) return { error: "That exam date has already passed. Enter the next one." };
  if (!Number.isFinite(windowDays) || windowDays <= 0) {
    return { error: "Your preparation window must be at least one day." };
  }
  if (!Number.isFinite(studyHoursPerDay) || studyHoursPerDay <= 0 || studyHoursPerDay > 18) {
    return { error: "Study hours a day must be between 0 and 18." };
  }

  const progress = clamp01(1 - daysLeft / windowDays);
  const newLearningPercent =
    MIX_ENDPOINTS.newLearningStart +
    (MIX_ENDPOINTS.newLearningEnd - MIX_ENDPOINTS.newLearningStart) * progress;
  const mockPercent =
    MIX_ENDPOINTS.mockStart + (MIX_ENDPOINTS.mockEnd - MIX_ENDPOINTS.mockStart) * progress;
  const revisionPercent = 100 - newLearningPercent - mockPercent;

  const mix = [
    { id: "new", label: "New learning", percent: newLearningPercent },
    { id: "revision", label: "Practice & revision", percent: revisionPercent },
    { id: "mock", label: "Mocks & analysis", percent: mockPercent },
  ].map((row) => ({ ...row, hours: (studyHoursPerDay * row.percent) / 100 }));

  return {
    daysLeft,
    weeks: Math.floor(daysLeft / DAYS_PER_WEEK),
    spareDays: daysLeft % DAYS_PER_WEEK,
    windowDays,
    daysElapsed: Math.max(0, windowDays - daysLeft),
    progressPercent: progress * 100,
    phase: phaseForDays(daysLeft),
    mix,
    studyHoursPerDay,
    studyHoursLeft: daysLeft * studyHoursPerDay,
  };
}

/**
 * Countdown board across every stage that has a date filled in, with the gap
 * from the previous dated stage.
 */
export function buildStageBoard(todayISO, stages) {
  if (parseISODate(todayISO) === null) {
    return { error: "Enter today's date as a valid calendar date." };
  }
  if (!Array.isArray(stages) || stages.length === 0) {
    return { error: "Pick an exam so there are stages to track." };
  }

  const dated = [];
  for (const stage of stages) {
    const raw = typeof stage.date === "string" ? stage.date.trim() : "";
    if (raw === "") continue;
    const days = daysBetween(todayISO, raw);
    if (days === null) {
      return { error: `${stage.label || "Stage"}: enter the date as a valid calendar date.` };
    }
    dated.push({
      id: stage.id,
      label: stage.label,
      marks: stage.marks,
      minutes: stage.minutes,
      date: raw,
      days,
      isPast: days < 0,
      phase: days >= 0 ? phaseForDays(days) : null,
    });
  }

  if (dated.length === 0) {
    return { error: "Fill in at least one stage date from your CEN or admit card." };
  }

  dated.sort((a, b) => a.days - b.days);
  const rows = dated.map((row, index) => ({
    ...row,
    gapFromPrevious: index === 0 ? null : row.days - dated[index - 1].days,
  }));
  const upcoming = rows.filter((row) => row.days >= 0);

  return {
    rows,
    next: upcoming.length > 0 ? upcoming[0] : null,
    allPast: upcoming.length === 0,
  };
}

/**
 * Question count and marks per question for a stage. When the sectional
 * break-up is recorded the questions are summed from it; otherwise the RRB
 * convention of one mark per question is assumed, so questions equal marks.
 */
export function stageQuestionProfile(stage) {
  if (!stage || !Number.isFinite(Number(stage.marks)) || Number(stage.marks) <= 0) {
    return { error: "This stage carries no marks, so there is nothing to score." };
  }
  const marks = Number(stage.marks);
  const questions =
    Array.isArray(stage.sections) && stage.sections.length > 0
      ? stage.sections.reduce((sum, section) => sum + Number(section.questions || 0), 0)
      : marks;
  if (!Number.isFinite(questions) || questions <= 0) {
    return { error: "This stage has no usable question count." };
  }
  return { questions, marks, marksPerQuestion: marks / questions };
}

/** Seconds available per question, and the expected net score at a given accuracy. */
export function paperMaths({ questions, minutes, marksPerQuestion, attempts, accuracyPercent }) {
  const q = Number(questions);
  const m = Number(minutes);
  const mpq = Number(marksPerQuestion);
  if (!Number.isFinite(q) || q <= 0) return { error: "Questions in the paper must be more than zero." };
  if (!Number.isFinite(m) || m <= 0) return { error: "Paper duration must be more than zero minutes." };
  if (!Number.isFinite(mpq) || mpq <= 0) return { error: "Marks per question must be more than zero." };

  const a = Number(attempts);
  if (!Number.isFinite(a) || a <= 0) return { error: "Planned attempts must be more than zero." };
  if (a > q) return { error: "You cannot attempt more questions than the paper has." };
  if (!Number.isFinite(accuracyPercent) || accuracyPercent < 0 || accuracyPercent > 100) {
    return { error: "Accuracy must be between 0% and 100%." };
  }

  const accuracy = accuracyPercent / 100;
  const correct = a * accuracy;
  const wrong = a - correct;
  const grossMarks = correct * mpq;
  const penalty = wrong * mpq * RRB_NEGATIVE_FRACTION;

  return {
    questions: q,
    minutes: m,
    totalMarks: q * mpq,
    secondsPerQuestion: (m * 60) / q,
    secondsPerAttempt: (m * 60) / a,
    attempts: a,
    correct,
    wrong,
    grossMarks,
    penalty,
    netScore: grossMarks - penalty,
    netPercent: ((grossMarks - penalty) / (q * mpq)) * 100,
    breakEvenAccuracyPercent:
      (RRB_NEGATIVE_FRACTION / (1 + RRB_NEGATIVE_FRACTION)) * 100,
  };
}
