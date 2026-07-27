/**
 * Bank exam countdown board, stage gap analysis, speed and cutoff maths.
 *
 * Four calculations, all pure — today's date is always an argument:
 *
 * 1. Countdown: whole calendar days between two civil dates, parsed at UTC
 *    midnight so no timezone shift can move an answer by a day.
 *
 * 2. Gap analysis: days between one stage and the next, i.e. the window you get
 *    to switch from prelims practice to mains preparation.
 *
 * 3. Speed: bank prelims are speed tests with sectional time limits, so
 *      secondsPerQuestion = sectionMinutes x 60 / questions
 *      secondsPerAttempt  = sectionMinutes x 60 / plannedAttempts
 *
 * 4. Cutoff: every wrong answer costs a quarter of the marks for that question,
 *    so the marks a single attempt is worth on average are
 *      netPerAttempt = marksPerQuestion x (accuracy - 0.25 x (1 - accuracy))
 *      attempts      = cutoffMarks / netPerAttempt
 */

const MS_PER_DAY = 86400000;
const DAYS_PER_WEEK = 7;
/** Tolerance for binary floating point noise when rounding an attempt count up. */
const ROUNDING_EPSILON = 1e-9;
const SECONDS_PER_MINUTE = 60;

/**
 * Public sector bank recruitment exams deduct one fourth of the marks assigned
 * to a question for every wrong answer, in both the preliminary and main
 * objective papers. Questions left blank cost nothing.
 */
export const BANK_NEGATIVE_FRACTION = 0.25;

/**
 * IBPS declares its probationary officer merit list on a weightage of 80 for
 * the main examination and 20 for the interview, after normalising both to a
 * common scale. The preliminary examination is only a qualifying filter and
 * carries no weight in the final merit.
 */
export const IBPS_PO_MERIT_WEIGHTS = { mains: 80, interview: 20 };

/**
 * Stage structures follow the pattern in recent IBPS, SBI and RBI
 * notifications. Every field here is a starting point that you can edit — banks
 * revise the pattern from one recruitment cycle to the next, so the notification
 * for the year you are writing is the only authority.
 */
export const BANK_EXAM_PRESETS = [
  {
    id: "ibps-po",
    label: "IBPS PO",
    stages: [
      {
        id: "pre",
        label: "Preliminary exam",
        marks: 100,
        minutes: 60,
        sections: [
          { label: "English Language", questions: 30, minutes: 20 },
          { label: "Quantitative Aptitude", questions: 35, minutes: 20 },
          { label: "Reasoning Ability", questions: 35, minutes: 20 },
        ],
      },
      { id: "main", label: "Main exam (objective)", marks: 200, minutes: 180, sections: [] },
      { id: "interview", label: "Interview", marks: 100, minutes: 0, sections: [] },
    ],
  },
  {
    id: "ibps-clerk",
    label: "IBPS Clerk",
    stages: [
      {
        id: "pre",
        label: "Preliminary exam",
        marks: 100,
        minutes: 60,
        sections: [
          { label: "English Language", questions: 30, minutes: 20 },
          { label: "Numerical Ability", questions: 35, minutes: 20 },
          { label: "Reasoning Ability", questions: 35, minutes: 20 },
        ],
      },
      { id: "main", label: "Main exam", marks: 200, minutes: 160, sections: [] },
    ],
  },
  {
    id: "sbi-po",
    label: "SBI PO",
    stages: [
      {
        id: "pre",
        label: "Preliminary exam",
        marks: 100,
        minutes: 60,
        sections: [
          { label: "English Language", questions: 30, minutes: 20 },
          { label: "Quantitative Aptitude", questions: 35, minutes: 20 },
          { label: "Reasoning Ability", questions: 35, minutes: 20 },
        ],
      },
      { id: "main", label: "Main exam (objective)", marks: 200, minutes: 180, sections: [] },
      { id: "psycho", label: "Psychometric test", marks: 0, minutes: 20, sections: [] },
      { id: "interview", label: "Interview and group exercise", marks: 50, minutes: 0, sections: [] },
    ],
  },
  {
    id: "sbi-clerk",
    label: "SBI Clerk",
    stages: [
      {
        id: "pre",
        label: "Preliminary exam",
        marks: 100,
        minutes: 60,
        sections: [
          { label: "English Language", questions: 30, minutes: 20 },
          { label: "Numerical Ability", questions: 35, minutes: 20 },
          { label: "Reasoning Ability", questions: 35, minutes: 20 },
        ],
      },
      { id: "main", label: "Main exam", marks: 200, minutes: 160, sections: [] },
    ],
  },
  {
    id: "rbi-gradeb",
    label: "RBI Grade B (DR General)",
    stages: [
      {
        id: "phase1",
        label: "Phase 1 (objective)",
        marks: 200,
        minutes: 120,
        sections: [
          { label: "General Awareness", questions: 80, minutes: 25 },
          { label: "Reasoning", questions: 60, minutes: 45 },
          { label: "English Language", questions: 30, minutes: 25 },
          { label: "Quantitative Aptitude", questions: 30, minutes: 25 },
        ],
      },
      { id: "esi", label: "Phase 2 — Economic & Social Issues", marks: 100, minutes: 90, sections: [] },
      { id: "eng", label: "Phase 2 — English Writing Skills", marks: 100, minutes: 90, sections: [] },
      { id: "fm", label: "Phase 2 — Finance & Management", marks: 100, minutes: 90, sections: [] },
      { id: "interview", label: "Interview", marks: 75, minutes: 0, sections: [] },
    ],
  },
  {
    id: "rbi-assistant",
    label: "RBI Assistant",
    stages: [
      {
        id: "pre",
        label: "Preliminary exam",
        marks: 100,
        minutes: 60,
        sections: [
          { label: "English Language", questions: 30, minutes: 20 },
          { label: "Numerical Ability", questions: 35, minutes: 20 },
          { label: "Reasoning Ability", questions: 35, minutes: 20 },
        ],
      },
      { id: "main", label: "Main exam", marks: 200, minutes: 135, sections: [] },
      { id: "lpt", label: "Language Proficiency Test", marks: 0, minutes: 0, sections: [] },
    ],
  },
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
 * Countdown board across every stage that has a date filled in, sorted by date,
 * with the gap to the previous dated stage.
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
      weeks: Math.floor(Math.abs(days) / DAYS_PER_WEEK),
      spareDays: Math.abs(days) % DAYS_PER_WEEK,
      isPast: days < 0,
      isToday: days === 0,
    });
  }

  if (dated.length === 0) {
    return { error: "Fill in at least one stage date from your notification." };
  }

  dated.sort((a, b) => a.days - b.days);

  const rows = dated.map((row, index) => ({
    ...row,
    gapFromPrevious: index === 0 ? null : row.days - dated[index - 1].days,
    previousLabel: index === 0 ? null : dated[index - 1].label,
  }));

  const upcoming = rows.filter((row) => row.days >= 0);
  const next = upcoming.length > 0 ? upcoming[0] : null;
  const following = upcoming.length > 1 ? upcoming[1] : null;

  return {
    rows,
    next,
    following,
    gapToFollowing: next && following ? following.days - next.days : null,
    allPast: upcoming.length === 0,
    totalStages: rows.length,
  };
}

/**
 * Sectional speed. Bank prelims lock each section to its own clock, so the
 * time you actually get per question is fixed by the paper, not by you.
 */
export function sectionSpeed({ questions, minutes, plannedAttempts }) {
  const q = Number(questions);
  const m = Number(minutes);
  if (!Number.isFinite(q) || q <= 0) return { error: "Questions in the section must be more than zero." };
  if (!Number.isFinite(m) || m <= 0) return { error: "Section time must be more than zero minutes." };

  const seconds = m * SECONDS_PER_MINUTE;
  const attempts = Number(plannedAttempts);
  const hasPlan = Number.isFinite(attempts) && attempts > 0;
  if (hasPlan && attempts > q) {
    return { error: "You cannot plan more attempts than the section has questions." };
  }

  return {
    questions: q,
    minutes: m,
    secondsPerQuestion: seconds / q,
    plannedAttempts: hasPlan ? attempts : null,
    secondsPerAttempt: hasPlan ? seconds / attempts : null,
    sparePerAttemptSeconds: hasPlan ? seconds / attempts - seconds / q : null,
  };
}

/** Sum a whole paper's sections into one speed picture. */
export function paperSpeed(sections) {
  if (!Array.isArray(sections) || sections.length === 0) {
    return { error: "This stage has no sectional break-up recorded." };
  }
  const rows = [];
  let questions = 0;
  let minutes = 0;
  for (const section of sections) {
    const result = sectionSpeed({
      questions: section.questions,
      minutes: section.minutes,
      plannedAttempts: section.plannedAttempts,
    });
    if (result.error) return { error: `${section.label || "Section"}: ${result.error}` };
    questions += result.questions;
    minutes += result.minutes;
    rows.push({ label: section.label, ...result });
  }
  return {
    rows,
    questions,
    minutes,
    secondsPerQuestion: (minutes * SECONDS_PER_MINUTE) / questions,
  };
}

/**
 * Attempts needed to reach a cutoff at a given accuracy, priced with the one
 * fourth negative marking that bank objective papers apply.
 */
export function attemptsForCutoff({
  cutoffMarks,
  accuracyPercent,
  marksPerQuestion = 1,
  questionsAvailable,
}) {
  if (!Number.isFinite(cutoffMarks) || cutoffMarks <= 0) {
    return { error: "The cutoff you are targeting must be greater than zero." };
  }
  if (!Number.isFinite(accuracyPercent) || accuracyPercent <= 0 || accuracyPercent > 100) {
    return { error: "Accuracy must be between 0% and 100%." };
  }
  if (!Number.isFinite(marksPerQuestion) || marksPerQuestion <= 0) {
    return { error: "Marks per question must be greater than zero." };
  }

  const accuracy = accuracyPercent / 100;
  const netPerAttempt =
    marksPerQuestion * (accuracy - BANK_NEGATIVE_FRACTION * (1 - accuracy));

  if (netPerAttempt <= 0) {
    return {
      error:
        "At 20% accuracy or below, one fourth negative marking cancels everything you earn. Raise accuracy before raising attempts.",
    };
  }

  const attempts = cutoffMarks / netPerAttempt;
  // Nudge before rounding up so an exact boundary (e.g. 50.0000000001 attempts
  // produced by binary floating point) does not silently become 51.
  const rounded = Math.ceil(attempts - ROUNDING_EPSILON);
  const available = Number(questionsAvailable);
  const capped = Number.isFinite(available) && available > 0 && rounded > available;

  return {
    netPerAttempt,
    attempts,
    attemptsRounded: rounded,
    correctNeeded: Math.ceil(rounded * accuracy),
    marksLostToNegatives: rounded * (1 - accuracy) * marksPerQuestion * BANK_NEGATIVE_FRACTION,
    exceedsPaper: capped,
    questionsAvailable: Number.isFinite(available) && available > 0 ? available : null,
    breakEvenAccuracyPercent: (BANK_NEGATIVE_FRACTION / (1 + BANK_NEGATIVE_FRACTION)) * 100,
  };
}
