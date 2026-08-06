/**
 * JEE exam countdown + syllabus pace tracker.
 *
 * Two independent pieces of arithmetic:
 *
 * 1. Countdown — whole calendar days between two civil dates. Both dates are
 *    parsed at UTC midnight so that a daylight-saving or timezone shift can
 *    never turn 30 days into 29.9 and round the wrong way.
 *
 * 2. Pace — how many syllabus units you must finish per study day to reach the
 *    exam with a revision buffer intact:
 *
 *      prepDays   = max(0, calendarDaysLeft - revisionBufferDays)
 *      studyDays  = floor(prepDays x studyDaysPerWeek / 7)
 *      unitsLeft  = sum(total - done) over subjects
 *      pace       = unitsLeft / studyDays          (units per study day)
 *      hoursPerUnit = (studyDays x hoursPerDay) / unitsLeft
 *
 * Everything here is pure: today's date is passed in, never read from the clock.
 */

const MS_PER_DAY = 86400000;
const DAYS_PER_WEEK = 7;

/**
 * JEE Main Paper 1 (BE/BTech) pattern published by NTA: 75 questions to be
 * answered — 25 each in Physics, Chemistry and Mathematics — for 300 marks in
 * 3 hours, marked +4 for a correct answer and -1 for a wrong one.
 */
export const JEE_MAIN_PATTERN = {
  questionsAttempted: 75,
  totalMarks: 300,
  durationHours: 3,
  correctMark: 4,
  negativeMark: -1,
};

/**
 * JEE Advanced is written on a single day as two compulsory papers of 3 hours
 * each, and only candidates inside the JEE Main cut-off announced by the JAB
 * (2,50,000 across all categories in recent years) are allowed to register.
 */
export const JEE_ADVANCED_PATTERN = {
  papers: 2,
  paperDurationHours: 3,
  mainQualifiersCap: 250000,
};

/**
 * Default unit counts follow the NTA JEE Main syllabus document: Mathematics is
 * organised into 14 units, Physics into 20 units in Section A plus a Section B
 * on experimental skills, and Chemistry into 20 units spread across physical,
 * inorganic and organic. NTA revises this list, so every count is editable.
 */
export const JEE_SUBJECT_DEFAULTS = [
  { id: "physics", label: "Physics", total: 20, done: 8 },
  { id: "chemistry", label: "Chemistry", total: 20, done: 9 },
  { id: "mathematics", label: "Mathematics", total: 14, done: 6 },
];

/**
 * Typical windows only, not notified dates. JEE Main runs in two sessions
 * (January and April) and JEE Advanced is held in May. Replace each one with
 * the date printed on your NTA information bulletin or admit card.
 */
export const JEE_EVENT_DEFAULTS = [
  { id: "main-1", label: "JEE Main Session 1", date: "2027-01-22" },
  { id: "main-2", label: "JEE Main Session 2", date: "2027-04-02" },
  { id: "advanced", label: "JEE Advanced", date: "2027-05-23" },
];

/** Pace bands, in syllabus units per study day. A judgement call, not a rule. */
export const PACE_BANDS = [
  { max: 0.5, tone: "success", label: "Comfortable", note: "Half a unit a day clears the syllabus with room to spare." },
  { max: 1, tone: "success", label: "On track", note: "About one unit a day — a sustainable school-plus-coaching load." },
  { max: 2, tone: "warning", label: "Tight", note: "Two units a day needs disciplined weekday hours." },
  { max: Infinity, tone: "danger", label: "Behind", note: "More than two units a day. Cut the buffer, add hours, or drop to high-weight units first." },
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

/** Countdown for one dated event. */
export function countdownTo(todayISO, targetISO) {
  const days = daysBetween(todayISO, targetISO);
  if (days === null) return { error: "Enter the date as a valid calendar date." };
  return {
    days,
    weeks: Math.floor(Math.abs(days) / DAYS_PER_WEEK),
    spareDays: Math.abs(days) % DAYS_PER_WEEK,
    isPast: days < 0,
    isToday: days === 0,
  };
}

/**
 * Countdown board for every event, plus the next one still ahead.
 * Events already gone are kept and flagged so the board stays honest.
 */
export function buildCountdownBoard(todayISO, events) {
  if (!Array.isArray(events) || events.length === 0) {
    return { error: "Add at least one exam date." };
  }
  if (parseISODate(todayISO) === null) {
    return { error: "Today's date: Enter the date as a valid calendar date." };
  }
  const rows = events.map((event) => {
    const result = countdownTo(todayISO, event.date);
    if (result.error) {
      return { ...event, error: `${event.label || "Exam"}: ${result.error}` };
    }
    return { ...event, ...result };
  });
  // Valid rows sort earliest-first; rows with an unparseable date sink to the
  // bottom instead of blanking the whole board (a bad date on one event should
  // never hide the countdown for every other, still-valid event).
  rows.sort((a, b) => {
    if (a.error && b.error) return 0;
    if (a.error) return 1;
    if (b.error) return -1;
    return a.days - b.days;
  });
  const upcoming = rows.filter((row) => !row.error && row.days >= 0);
  const anyValid = rows.some((row) => !row.error);
  return { rows, next: upcoming.length > 0 ? upcoming[0] : null, allPast: anyValid && upcoming.length === 0 };
}

function bandFor(pace) {
  return PACE_BANDS.find((band) => pace <= band.max) || PACE_BANDS[PACE_BANDS.length - 1];
}

/**
 * Syllabus pace to the target exam.
 *
 * @param {object} input
 * @param {string} input.todayISO        today, YYYY-MM-DD
 * @param {string} input.targetISO       the exam being paced towards
 * @param {Array}  input.subjects        [{ id, label, total, done }]
 * @param {number} input.revisionBufferDays days reserved for revision + mocks
 * @param {number} input.studyDaysPerWeek   1..7
 * @param {number} input.hoursPerDay        study hours on a study day
 */
export function computePace({
  todayISO,
  targetISO,
  subjects,
  revisionBufferDays,
  studyDaysPerWeek,
  hoursPerDay,
}) {
  const calendarDaysLeft = daysBetween(todayISO, targetISO);
  if (calendarDaysLeft === null) return { error: "Enter the date as a valid calendar date." };
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return { error: "Add at least one subject to track." };
  }
  if (!Number.isFinite(revisionBufferDays) || revisionBufferDays < 0) {
    return { error: "Revision buffer cannot be negative." };
  }
  if (!Number.isFinite(studyDaysPerWeek) || studyDaysPerWeek < 1 || studyDaysPerWeek > DAYS_PER_WEEK) {
    return { error: "Study days per week must be between 1 and 7." };
  }
  if (!Number.isFinite(hoursPerDay) || hoursPerDay <= 0 || hoursPerDay > 18) {
    return { error: "Study hours a day must be between 0 and 18." };
  }

  const perSubject = [];
  let unitsTotal = 0;
  let unitsDone = 0;
  for (const subject of subjects) {
    const total = Number(subject.total);
    const done = Number(subject.done);
    if (!Number.isFinite(total) || total <= 0) {
      return { error: `${subject.label || "Subject"}: total units must be greater than zero.` };
    }
    if (!Number.isFinite(done) || done < 0) {
      return { error: `${subject.label || "Subject"}: units finished cannot be negative.` };
    }
    if (done > total) {
      return { error: `${subject.label || "Subject"}: units finished cannot exceed total units.` };
    }
    unitsTotal += total;
    unitsDone += done;
    perSubject.push({
      id: subject.id,
      label: subject.label,
      total,
      done,
      remaining: total - done,
      percentDone: (done / total) * 100,
    });
  }

  const unitsLeft = unitsTotal - unitsDone;
  const percentDone = (unitsDone / unitsTotal) * 100;

  if (calendarDaysLeft < 0) {
    return {
      error: "That exam date has already passed. Pick the next session date.",
      calendarDaysLeft,
      unitsTotal,
      unitsDone,
      unitsLeft,
      percentDone,
      perSubject,
    };
  }

  const prepDays = Math.max(0, calendarDaysLeft - revisionBufferDays);
  const bufferDaysApplied = calendarDaysLeft - prepDays;
  const studyDays = Math.floor((prepDays * studyDaysPerWeek) / DAYS_PER_WEEK);
  const studyHours = studyDays * hoursPerDay;

  if (unitsLeft === 0) {
    return {
      calendarDaysLeft,
      prepDays,
      bufferDaysApplied,
      studyDays,
      studyHours,
      unitsTotal,
      unitsDone,
      unitsLeft,
      percentDone,
      perSubject,
      unitsPerStudyDay: 0,
      hoursPerUnit: null,
      band: { tone: "success", label: "Syllabus complete", note: "Every unit is marked done — the buffer is now pure revision and mock time." },
    };
  }

  if (studyDays <= 0) {
    let note;
    if (calendarDaysLeft === 0) {
      note = "The exam is today, so there are no calendar days left for a first pass.";
    } else if (bufferDaysApplied === 0) {
      // prepDays > 0 but flooring at a low studyDaysPerWeek rounds the usable
      // study days down to zero — the buffer (0 days applied) isn't the cause.
      note = `Studying ${studyDaysPerWeek} day${studyDaysPerWeek === 1 ? "" : "s"} a week rounds down to zero study days across ${prepDays} prep day${prepDays === 1 ? "" : "s"}. Raise study days per week (or add hours per day) instead of blaming the buffer.`;
    } else {
      note = "The revision buffer swallows every remaining day. Shorten the buffer or accept that the leftover units stay unread.";
    }
    return {
      calendarDaysLeft,
      prepDays,
      bufferDaysApplied,
      studyDays: 0,
      studyHours: 0,
      unitsTotal,
      unitsDone,
      unitsLeft,
      percentDone,
      perSubject,
      unitsPerStudyDay: null,
      hoursPerUnit: null,
      band: {
        tone: "danger",
        label: "No first-pass days left",
        note,
      },
    };
  }

  const unitsPerStudyDay = unitsLeft / studyDays;
  const hoursPerUnit = studyHours / unitsLeft;

  return {
    calendarDaysLeft,
    prepDays,
    bufferDaysApplied,
    studyDays,
    studyHours,
    unitsTotal,
    unitsDone,
    unitsLeft,
    percentDone,
    perSubject,
    unitsPerStudyDay,
    hoursPerUnit,
    band: bandFor(unitsPerStudyDay),
  };
}
