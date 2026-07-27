/**
 * Countdown and study-plan maths for the UPSC Civil Services Examination.
 *
 * Everything here is pure time arithmetic: the current instant is always passed IN
 * (as epoch milliseconds) so the same inputs give the same outputs.
 *
 * Exam-date defaults: UPSC publishes its annual calendar about a year ahead. The
 * Civil Services (Preliminary) Examination is customarily held on the last Sunday of
 * May, and the Mains starts on a Friday about three months later, running five days.
 * The defaults below follow that customary pattern for the next cycle. They are NOT
 * notification dates — the tool keeps the date editable and the UI tells the user to
 * confirm on upsc.gov.in, because a wrong date is worse than none.
 */

/** Customary-pattern defaults for the next cycle (editable in the UI). */
export const EXAM_PRESETS = [
  {
    id: "prelims",
    label: "Civil Services Prelims",
    // Last Sunday of May 2027 (customary Prelims slot).
    defaultDate: "2027-05-30",
    note: "UPSC customarily holds Prelims on the last Sunday of May — confirm the notified date on upsc.gov.in.",
  },
  {
    id: "mains",
    label: "Civil Services Mains",
    // Mains customarily begins on a Friday in late August, about 3 months after Prelims.
    defaultDate: "2027-08-27",
    note: "Mains customarily begins in late August, about three months after Prelims — confirm the notified date on upsc.gov.in.",
  },
];

export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;
export const DAYS_PER_WEEK = 7;

/** Prep-time milestone fractions rendered on the timeline. */
export const MILESTONE_FRACTIONS = [0.25, 0.5, 0.75, 0.9];

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse ISO yyyy-mm-dd into epoch ms at UTC midnight, or null. */
export function parseIsoToMs(value) {
  if (typeof value !== "string") return null;
  const match = DATE_PATTERN.exec(value.trim());
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return date.getTime();
}

/**
 * Break the interval from `nowMs` to the exam date into days/hours/minutes/seconds.
 *
 * @param {object} input
 * @param {number} input.nowMs      Current instant, epoch milliseconds.
 * @param {string} input.examDate   Exam date, ISO yyyy-mm-dd (counted to local-style UTC midnight).
 * @returns {object} countdown or { error }.
 */
export function computeCountdown({ nowMs, examDate }) {
  if (!Number.isFinite(nowMs)) return { error: "Current time is missing." };
  const target = parseIsoToMs(examDate);
  if (target === null) return { error: "Enter a valid exam date in yyyy-mm-dd form." };

  const diff = target - nowMs;
  if (diff <= 0) {
    return {
      past: true,
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      weeks: 0,
      weekRemainderDays: 0,
      totalDays: 0,
    };
  }

  const days = Math.floor(diff / MS_PER_DAY);
  const hours = Math.floor((diff % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((diff % MS_PER_HOUR) / MS_PER_MINUTE);
  const seconds = Math.floor((diff % MS_PER_MINUTE) / MS_PER_SECOND);

  return {
    past: false,
    totalMs: diff,
    days,
    hours,
    minutes,
    seconds,
    weeks: Math.floor(days / DAYS_PER_WEEK),
    weekRemainderDays: days % DAYS_PER_WEEK,
    /** Days including the partial day in progress — what a study plan should use. */
    totalDays: Math.ceil(diff / MS_PER_DAY),
  };
}

/**
 * Daily study target: how many hours of preparation remain at a given daily commitment,
 * and what shifting the commitment by an hour is worth.
 *
 * @param {object} input
 * @param {number} input.nowMs
 * @param {string} input.examDate
 * @param {number} input.hoursPerDay  Planned study hours per day (0.5 to 18).
 */
export function computeStudyPlan({ nowMs, examDate, hoursPerDay }) {
  const countdown = computeCountdown({ nowMs, examDate });
  if (countdown.error) return countdown;
  const hours = Number(hoursPerDay);
  if (!Number.isFinite(hours) || hours <= 0) {
    return { error: "Study hours per day must be more than zero." };
  }
  if (hours > 18) {
    return { error: "More than 18 study hours a day is not a plan anyone can keep." };
  }
  if (countdown.past) return { error: "That date has passed — pick the next exam date." };

  const days = countdown.totalDays;
  return {
    days,
    hoursPerDay: hours,
    totalHours: Math.round(days * hours),
    hoursPerWeek: Math.round(hours * DAYS_PER_WEEK * 10) / 10,
    /** What one extra daily hour buys between now and the exam. */
    extraHourYield: days,
  };
}

/**
 * Prep-time milestones between now and the exam: the dates by which 25%, 50%, 75% and
 * 90% of the remaining time will have elapsed.
 */
export function computeMilestones({ nowMs, examDate }) {
  const countdown = computeCountdown({ nowMs, examDate });
  if (countdown.error) return countdown;
  if (countdown.past) return { milestones: [] };

  const milestones = MILESTONE_FRACTIONS.map((fraction) => {
    const atMs = nowMs + countdown.totalMs * fraction;
    return {
      fraction,
      percent: Math.round(fraction * 100),
      date: new Date(atMs).toISOString().slice(0, 10),
      daysFromNow: Math.round((atMs - nowMs) / MS_PER_DAY),
    };
  });
  return { milestones };
}
