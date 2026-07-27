/**
 * Countdown and revision-phase maths for SSC CGL.
 *
 * Pure time arithmetic: the current instant is always passed in as epoch milliseconds,
 * so identical inputs always give identical outputs.
 *
 * Exam-date defaults: the Staff Selection Commission announces exact dates in its
 * annual calendar and admit cards. In recent cycles the CGL Tier-I computer-based exam
 * has run in September and Tier-II in the following December-January window. The
 * defaults below sit in those customary windows; they are NOT notified dates, the date
 * stays editable, and the UI tells the user to confirm on ssc.gov.in.
 */

export const TIER_PRESETS = [
  {
    id: "tier1",
    label: "CGL Tier-I",
    // Customary September window for Tier-I.
    defaultDate: "2026-09-14",
    note: "Tier-I customarily runs in September — confirm your shift date on ssc.gov.in or the admit card.",
  },
  {
    id: "tier2",
    label: "CGL Tier-II",
    // Customary December-January window after a September Tier-I.
    defaultDate: "2027-01-15",
    note: "Tier-II customarily follows in the December-January window — confirm the notified date on ssc.gov.in.",
  },
];

export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;
export const DAYS_PER_WEEK = 7;

/**
 * Revision phases as fractions of the remaining time, a standard taper:
 * finish new material in the first 50%, drill mocks to 80%, revise to 95%,
 * and keep the final 5% light.
 */
export const REVISION_PHASES = [
  {
    id: "syllabus",
    label: "Finish remaining syllabus",
    from: 0,
    to: 0.5,
    detail: "New topics stop here — everything after this is consolidation.",
  },
  {
    id: "mocks",
    label: "Mock tests and PYQs",
    from: 0.5,
    to: 0.8,
    detail: "Alternate full mocks with previous-year papers; log every error.",
  },
  {
    id: "revision",
    label: "Focused revision",
    from: 0.8,
    to: 0.95,
    detail: "Error log, formulas, vocab and static GK on loop — no new sources.",
  },
  {
    id: "taper",
    label: "Exam-week taper",
    from: 0.95,
    to: 1,
    detail: "Light recall, admit card and centre logistics, full sleep.",
  },
];

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
 * Days/hours/minutes/seconds from `nowMs` to the exam date.
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
  return {
    past: false,
    totalMs: diff,
    days,
    hours: Math.floor((diff % MS_PER_DAY) / MS_PER_HOUR),
    minutes: Math.floor((diff % MS_PER_HOUR) / MS_PER_MINUTE),
    seconds: Math.floor((diff % MS_PER_MINUTE) / MS_PER_SECOND),
    weeks: Math.floor(days / DAYS_PER_WEEK),
    weekRemainderDays: days % DAYS_PER_WEEK,
    /** Includes the partial day in progress — what planning should use. */
    totalDays: Math.ceil(diff / MS_PER_DAY),
  };
}

/**
 * Map the REVISION_PHASES taper onto the interval from now to the exam,
 * giving each phase a start date, end date and day count.
 */
export function computeRevisionPlan({ nowMs, examDate }) {
  const countdown = computeCountdown({ nowMs, examDate });
  if (countdown.error) return countdown;
  if (countdown.past) return { phases: [] };

  const phases = REVISION_PHASES.map((phase) => {
    const startMs = nowMs + countdown.totalMs * phase.from;
    const endMs = nowMs + countdown.totalMs * phase.to;
    return {
      id: phase.id,
      label: phase.label,
      detail: phase.detail,
      startDate: new Date(startMs).toISOString().slice(0, 10),
      endDate: new Date(endMs).toISOString().slice(0, 10),
      days: Math.max(1, Math.round((endMs - startMs) / MS_PER_DAY)),
      startPercent: Math.round(phase.from * 100),
      endPercent: Math.round(phase.to * 100),
    };
  });
  return { phases };
}

/**
 * Mocks budget: how many full mock tests fit in the remaining time at a given cadence.
 *
 * @param {object} input
 * @param {number} input.nowMs
 * @param {string} input.examDate
 * @param {number} input.mocksPerWeek 1 to 14.
 */
export function computeMockBudget({ nowMs, examDate, mocksPerWeek }) {
  const countdown = computeCountdown({ nowMs, examDate });
  if (countdown.error) return countdown;
  if (countdown.past) return { error: "That date has passed — pick the next exam date." };
  const cadence = Number(mocksPerWeek);
  if (!Number.isFinite(cadence) || cadence <= 0) {
    return { error: "Mocks per week must be more than zero." };
  }
  if (cadence > 14) {
    return { error: "More than two full mocks a day is not a workable cadence." };
  }
  return {
    totalMocks: Math.floor((countdown.totalDays / DAYS_PER_WEEK) * cadence),
    mocksPerWeek: cadence,
    days: countdown.totalDays,
  };
}
