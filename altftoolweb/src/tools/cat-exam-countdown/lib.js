/**
 * CAT countdown, phased mock schedule and sectional pace.
 *
 * Three separate calculations, all pure — today's date is always an argument.
 *
 * 1. Countdown: whole calendar days between two civil dates, both parsed at
 *    UTC midnight so no timezone or DST shift can move the answer by a day.
 *
 * 2. Mock plan: the remaining calendar is split into three phases and the
 *    mocks you still owe yourself are distributed across them, back-loaded:
 *
 *      phaseDays  = floor(daysLeft x phaseShare)      (remainder to the last phase)
 *      phaseMocks = round(mocksLeft x phaseMockShare) (remainder to the last phase)
 *      mocksPerWeek = phaseMocks x 7 / phaseDays
 *
 * 3. Sectional pace: study hours are split by each section's share of the
 *    paper, then divided by the topics that section still has left:
 *
 *      studyDays    = floor(prepDays x studyDaysPerWeek / 7)
 *      sectionHours = studyDays x hoursPerDay x sectionWeight
 *      hoursPerTopic = sectionHours / topicsRemaining
 *
 * 4. Target score: CAT scores +3 for a correct answer and -1 for a wrong
 *    multiple-choice answer, with no penalty on type-in-the-answer questions:
 *
 *      netPerAttempt = 3 x accuracy - mcqShare x (1 - accuracy)
 *      attempts      = targetNet / netPerAttempt
 */

const MS_PER_DAY = 86400000;
const DAYS_PER_WEEK = 7;
/** Tolerance for binary floating point noise when rounding an attempt count up. */
const ROUNDING_EPSILON = 1e-9;

/**
 * CAT pattern as run by the IIMs in recent years: a 120 minute computer-based
 * test of three sections — Verbal Ability and Reading Comprehension, Data
 * Interpretation and Logical Reasoning, and Quantitative Ability — each locked
 * to its own 40 minute window, so you cannot borrow time from one section for
 * another. Recent papers carried 66 to 68 questions in total. Marking is +3 for
 * a correct answer and -1 for a wrong multiple-choice answer; type-in-the-answer
 * (TITA) questions carry no negative marking.
 */
export const CAT_PATTERN = {
  totalMinutes: 120,
  sectionMinutes: 40,
  correctMark: 3,
  mcqNegativeMark: -1,
  titaNegativeMark: 0,
};

/**
 * Section weights are each section's share of the question paper, using the
 * 24 / 22 / 22 split of a 68 question paper. Edit the topic counts to match
 * whatever syllabus list your coaching material uses.
 */
export const CAT_SECTION_DEFAULTS = [
  { id: "varc", label: "VARC", questions: 24, total: 12, done: 5 },
  { id: "dilr", label: "DILR", questions: 22, total: 14, done: 4 },
  { id: "qa", label: "QA", questions: 22, total: 22, done: 9 },
];

/**
 * Preparation phases. The shares are a planning convention, not an official
 * rule: roughly the first half on concepts, the next third on sectionals and
 * measured mocks, and the last fifth on full-length mocks plus analysis, with
 * mock volume deliberately back-loaded into the final phases.
 */
export const CAT_PHASES = [
  {
    id: "build",
    label: "Concept build",
    dayShare: 0.45,
    mockShare: 0.2,
    note: "Fundamentals and topic-wise practice. Mocks here are diagnostic, not scores to worry about.",
  },
  {
    id: "practice",
    label: "Sectional practice",
    dayShare: 0.35,
    mockShare: 0.4,
    note: "Sectional tests plus a weekly full mock, each one analysed for longer than it took to write.",
  },
  {
    id: "peak",
    label: "Full-mock peak",
    dayShare: 0.2,
    mockShare: 0.4,
    note: "Mocks in the real 3.30 pm slot, selection strategy fixed, no new topics started.",
  },
];

/** CAT is normally written on the last Sunday of November. Replace with your admit card date. */
export const CAT_DEFAULT_EXAM_DATE = "2026-11-29";

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

/** Format a Date object as a local YYYY-MM-DD string (no UTC shift). */
export function toLocalISODate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Countdown for one dated event. */
export function countdownTo(todayISO, targetISO) {
  const days = daysBetween(todayISO, targetISO);
  if (days === null) return { error: "Enter the exam date as a valid calendar date." };
  return {
    days,
    weeks: Math.floor(Math.abs(days) / DAYS_PER_WEEK),
    spareDays: Math.abs(days) % DAYS_PER_WEEK,
    isPast: days < 0,
    isToday: days === 0,
  };
}

/**
 * Split the remaining calendar into phases and distribute the mocks you still
 * have to write, back-loaded so mock volume rises as the exam approaches.
 */
export function buildMockPlan({ todayISO, examISO, mocksTaken, targetMocks }) {
  const daysLeft = daysBetween(todayISO, examISO);
  if (daysLeft === null) return { error: "Enter the exam date as a valid calendar date." };
  if (daysLeft < 0) return { error: "That CAT date has already passed. Enter the next one." };
  if (!Number.isFinite(targetMocks) || targetMocks <= 0) {
    return { error: "Set a mock target greater than zero." };
  }
  if (!Number.isFinite(mocksTaken) || mocksTaken < 0) {
    return { error: "Mocks already written cannot be negative." };
  }
  if (mocksTaken > targetMocks) {
    return { error: "Mocks already written cannot exceed your mock target." };
  }

  const mocksLeft = targetMocks - mocksTaken;
  const phases = [];
  let dayCursor = 0;
  let daysAssigned = 0;
  let mocksAssigned = 0;

  CAT_PHASES.forEach((phase, index) => {
    const isLast = index === CAT_PHASES.length - 1;
    const days = isLast
      ? daysLeft - daysAssigned
      : Math.floor(daysLeft * phase.dayShare);
    const mocks = isLast ? mocksLeft - mocksAssigned : Math.round(mocksLeft * phase.mockShare);
    daysAssigned += days;
    mocksAssigned += mocks;
    const startISO = addDays(todayISO, dayCursor);
    dayCursor += days;
    const endISO = addDays(todayISO, Math.max(dayCursor - 1, 0));
    phases.push({
      id: phase.id,
      label: phase.label,
      note: phase.note,
      days,
      mocks,
      startISO,
      endISO,
      mocksPerWeek: days > 0 ? (mocks * DAYS_PER_WEEK) / days : null,
    });
  });

  return {
    daysLeft,
    weeksLeft: daysLeft / DAYS_PER_WEEK,
    mocksLeft,
    mocksTaken,
    targetMocks,
    mocksPerWeekOverall: daysLeft > 0 ? (mocksLeft * DAYS_PER_WEEK) / daysLeft : null,
    phases,
  };
}

/**
 * Sectional pace over the first-pass window, i.e. everything except the final
 * full-mock phase, with study hours split by each section's share of the paper.
 */
export function computeSectionalPace({
  todayISO,
  examISO,
  sections,
  studyDaysPerWeek,
  hoursPerDay,
  peakPhaseDays,
}) {
  const daysLeft = daysBetween(todayISO, examISO);
  if (daysLeft === null) return { error: "Enter the exam date as a valid calendar date." };
  if (daysLeft < 0) return { error: "That CAT date has already passed. Enter the next one." };
  if (!Array.isArray(sections) || sections.length === 0) {
    return { error: "Add at least one section to track." };
  }
  if (!Number.isFinite(studyDaysPerWeek) || studyDaysPerWeek < 1 || studyDaysPerWeek > DAYS_PER_WEEK) {
    return { error: "Study days per week must be between 1 and 7." };
  }
  if (!Number.isFinite(hoursPerDay) || hoursPerDay <= 0 || hoursPerDay > 18) {
    return { error: "Study hours a day must be between 0 and 18." };
  }
  if (!Number.isFinite(peakPhaseDays) || peakPhaseDays < 0) {
    return { error: "The mock-only phase cannot be a negative number of days." };
  }

  let questionsTotal = 0;
  let topicsTotal = 0;
  let topicsDone = 0;
  const cleaned = [];
  for (const section of sections) {
    const total = Number(section.total);
    const done = Number(section.done);
    const questions = Number(section.questions);
    if (!Number.isFinite(total) || total <= 0) {
      return { error: `${section.label || "Section"}: total topics must be greater than zero.` };
    }
    if (!Number.isFinite(done) || done < 0) {
      return { error: `${section.label || "Section"}: topics finished cannot be negative.` };
    }
    if (done > total) {
      return { error: `${section.label || "Section"}: topics finished cannot exceed total topics.` };
    }
    if (!Number.isFinite(questions) || questions <= 0) {
      return { error: `${section.label || "Section"}: question count must be greater than zero.` };
    }
    questionsTotal += questions;
    topicsTotal += total;
    topicsDone += done;
    cleaned.push({ ...section, total, done, questions, remaining: total - done });
  }

  const prepDays = Math.max(0, daysLeft - peakPhaseDays);
  const studyDays = Math.floor((prepDays * studyDaysPerWeek) / DAYS_PER_WEEK);
  const totalHours = studyDays * hoursPerDay;
  const topicsRemaining = topicsTotal - topicsDone;

  const perSection = cleaned.map((section) => {
    const weight = section.questions / questionsTotal;
    const hours = totalHours * weight;
    return {
      id: section.id,
      label: section.label,
      total: section.total,
      done: section.done,
      remaining: section.remaining,
      percentDone: (section.done / section.total) * 100,
      weightPercent: weight * 100,
      hours,
      hoursPerTopic: section.remaining > 0 ? hours / section.remaining : null,
    };
  });

  return {
    daysLeft,
    prepDays,
    studyDays,
    totalHours,
    topicsTotal,
    topicsDone,
    topicsRemaining,
    percentDone: (topicsDone / topicsTotal) * 100,
    topicsPerStudyDay: studyDays > 0 ? topicsRemaining / studyDays : null,
    perSection,
  };
}

/**
 * Attempts needed for a target net score, given your mock accuracy and the
 * share of questions you attempt that are multiple choice (the rest being TITA,
 * which carry no negative marking).
 */
export function attemptsForTargetScore({ targetNet, accuracyPercent, mcqSharePercent }) {
  if (!Number.isFinite(targetNet) || targetNet <= 0) {
    return { error: "Target net score must be greater than zero." };
  }
  if (!Number.isFinite(accuracyPercent) || accuracyPercent <= 0 || accuracyPercent > 100) {
    return { error: "Accuracy must be between 0% and 100%." };
  }
  if (!Number.isFinite(mcqSharePercent) || mcqSharePercent < 0 || mcqSharePercent > 100) {
    return { error: "MCQ share must be between 0% and 100%." };
  }

  const accuracy = accuracyPercent / 100;
  const mcqShare = mcqSharePercent / 100;
  const netPerAttempt =
    CAT_PATTERN.correctMark * accuracy + CAT_PATTERN.mcqNegativeMark * mcqShare * (1 - accuracy);

  if (netPerAttempt <= 0) {
    return {
      error:
        "At this accuracy every extra attempt costs more than it earns. Raise accuracy before raising attempts.",
    };
  }

  const attempts = targetNet / netPerAttempt;
  // Nudge before rounding up so an exact boundary produced by binary floating
  // point (e.g. 45.0000000001 attempts) does not silently become 46.
  const attemptsRounded = Math.ceil(attempts - ROUNDING_EPSILON);
  return {
    netPerAttempt,
    attempts,
    attemptsRounded,
    correctNeeded: Math.ceil(attempts) * accuracy,
    marksLostToNegatives: Math.ceil(attempts) * (1 - accuracy) * mcqShare,
  };
}
