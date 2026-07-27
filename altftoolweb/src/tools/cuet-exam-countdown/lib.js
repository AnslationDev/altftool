/**
 * CUET countdown, per-subject readiness and revision alerts.
 *
 * Readiness is not just syllabus coverage — a chapter read six weeks ago and
 * never revisited is not exam-ready. Each subject is scored as
 *
 *      coverage  = unitsDone / unitsTotal
 *      retention = e^(-daysSinceRevision / stabilityDays)     Ebbinghaus decay
 *      readiness = coverage x retention
 *
 * The exponential retention term is the classic Ebbinghaus forgetting curve,
 * R = e^(-t/S), where S is the stability of the memory in days. Inverting it
 * gives the day a revision becomes due, i.e. the day retention would fall to
 * the floor you are willing to accept:
 *
 *      daysUntilDue = -S x ln(retentionFloor)
 *
 * Expected marks use the CUET marking scheme of +5 for a correct answer and -1
 * for a wrong one. Treating readiness as the probability of answering a
 * question correctly, the expected marks on a paper of n questions are
 *
 *      expected = n x (5 x readiness - 1 x (1 - readiness)) = n x (6 x readiness - 1)
 *
 * which is zero at a readiness of 1/6, the break-even point for guessing.
 *
 * All functions are pure: today's date is always an argument.
 */

const MS_PER_DAY = 86400000;
const DAYS_PER_WEEK = 7;

/**
 * CUET UG is a computer-based test in which you choose your subject papers.
 * Recent papers ask 50 questions in 60 minutes per subject, marked +5 for a
 * correct answer and -1 for a wrong one, and NTA has capped the number of
 * subjects a candidate may take at 5. NTA revises the pattern between cycles,
 * so the question count here is editable.
 */
export const CUET_PATTERN = {
  questionsPerSubject: 50,
  minutesPerSubject: 60,
  correctMark: 5,
  negativeMark: -1,
  maxSubjects: 5,
};

/** Guessing breaks even where 5p = 1 - p, i.e. at a readiness of one sixth. */
export const BREAK_EVEN_READINESS =
  -CUET_PATTERN.negativeMark / (CUET_PATTERN.correctMark - CUET_PATTERN.negativeMark);

/**
 * Default memory stability in days for the Ebbinghaus term. Twenty-one days is
 * a deliberately conservative choice for material that has been studied once
 * and practised a little; well-drilled material is more stable and material
 * skimmed the night before is far less, so this is per-subject editable.
 */
export const DEFAULT_STABILITY_DAYS = 21;

/** Retention you are willing to drop to before a revision counts as overdue. */
export const DEFAULT_RETENTION_FLOOR = 0.75;

/** Readiness bands used for the alert colour and wording. */
export const READINESS_BANDS = [
  { min: 0.8, tone: "success", label: "Exam ready", note: "Hold it with a short weekly touch-up." },
  { min: 0.6, tone: "success", label: "Solid", note: "One focused revision pass will lift this above 80%." },
  { min: 0.4, tone: "warning", label: "Shaky", note: "Coverage or recency is slipping. Schedule this subject next." },
  { min: 0, tone: "danger", label: "At risk", note: "Either large parts are unread or nothing has been revised in weeks." },
];

/** A starting set of CUET papers. Rename or repoint these to your own choices. */
export const CUET_SUBJECT_DEFAULTS = [
  { id: "general", label: "General Test", total: 12, done: 7, lastRevisedOffset: 5 },
  { id: "english", label: "English (Section IA)", total: 10, done: 8, lastRevisedOffset: 2 },
  { id: "domain-1", label: "Domain — Business Studies", total: 12, done: 6, lastRevisedOffset: 18 },
  { id: "domain-2", label: "Domain — Accountancy", total: 11, done: 5, lastRevisedOffset: 30 },
];

/** CUET UG is normally held in May. Replace with the date on your admit card. */
export const CUET_DEFAULT_EXAM_DATE = "2027-05-15";

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

function bandFor(readiness) {
  return READINESS_BANDS.find((band) => readiness >= band.min) || READINESS_BANDS[READINESS_BANDS.length - 1];
}

/**
 * Readiness for a single subject.
 *
 * @param {object} input
 * @param {string} input.todayISO        today's date
 * @param {number} input.unitsTotal      chapters or units in the syllabus
 * @param {number} input.unitsDone       how many have been studied at least once
 * @param {string} input.lastRevisedISO  when this subject was last revised
 * @param {number} input.stabilityDays   memory stability S in the decay term
 * @param {number} input.retentionFloor  retention at which revision falls due
 * @param {number} input.questions       questions on that subject's paper
 */
export function computeSubjectReadiness({
  todayISO,
  unitsTotal,
  unitsDone,
  lastRevisedISO,
  stabilityDays,
  retentionFloor,
  questions,
}) {
  const total = Number(unitsTotal);
  const done = Number(unitsDone);
  if (!Number.isFinite(total) || total <= 0) {
    return { error: "Units in the syllabus must be greater than zero." };
  }
  if (!Number.isFinite(done) || done < 0) return { error: "Units studied cannot be negative." };
  if (done > total) return { error: "Units studied cannot exceed units in the syllabus." };

  const stability = Number(stabilityDays);
  if (!Number.isFinite(stability) || stability <= 0) {
    return { error: "Memory stability must be greater than zero days." };
  }
  const floor = Number(retentionFloor);
  if (!Number.isFinite(floor) || floor <= 0 || floor >= 1) {
    return { error: "The retention floor must be between 0 and 1, exclusive." };
  }
  const questionCount = Number(questions);
  if (!Number.isFinite(questionCount) || questionCount <= 0) {
    return { error: "Questions on the paper must be greater than zero." };
  }

  const daysSince = daysBetween(lastRevisedISO, todayISO);
  if (daysSince === null) return { error: "Enter the last revision date as a valid calendar date." };
  if (daysSince < 0) return { error: "The last revision date cannot be in the future." };

  const coverage = done / total;
  const retention = Math.exp(-daysSince / stability);
  const readiness = coverage * retention;

  const dueAfterDays = Math.ceil(-stability * Math.log(floor));
  const dueISO = addDays(lastRevisedISO, dueAfterDays);
  const daysUntilDue = dueAfterDays - daysSince;

  const expectedMarks =
    questionCount *
    (CUET_PATTERN.correctMark * readiness + CUET_PATTERN.negativeMark * (1 - readiness));

  return {
    coverage,
    coveragePercent: coverage * 100,
    retention,
    retentionPercent: retention * 100,
    readiness,
    readinessPercent: readiness * 100,
    daysSinceRevision: daysSince,
    revisionDueISO: dueISO,
    daysUntilRevisionDue: daysUntilDue,
    revisionOverdue: daysUntilDue <= 0,
    unitsRemaining: total - done,
    expectedMarks,
    maxMarks: questionCount * CUET_PATTERN.correctMark,
    band: bandFor(readiness),
  };
}

/**
 * Readiness board across every subject, plus the exam countdown and the
 * subject that should be revised next.
 */
export function buildReadinessBoard({
  todayISO,
  examISO,
  subjects,
  stabilityDays,
  retentionFloor,
  questionsPerSubject,
}) {
  const countdown = countdownTo(todayISO, examISO);
  if (countdown.error) return { error: countdown.error };
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return { error: "Add at least one CUET subject to track." };
  }
  if (subjects.length > CUET_PATTERN.maxSubjects) {
    return {
      error: `NTA allows at most ${CUET_PATTERN.maxSubjects} subject papers. Remove one before planning.`,
    };
  }

  const rows = [];
  for (const subject of subjects) {
    const result = computeSubjectReadiness({
      todayISO,
      unitsTotal: subject.total,
      unitsDone: subject.done,
      lastRevisedISO: subject.lastRevised,
      stabilityDays,
      retentionFloor,
      questions: questionsPerSubject,
    });
    if (result.error) return { error: `${subject.label || "Subject"}: ${result.error}` };
    rows.push({ id: subject.id, label: subject.label, ...result });
  }

  const overdue = rows.filter((row) => row.revisionOverdue);
  const byReadiness = [...rows].sort((a, b) => a.readiness - b.readiness);
  const totalExpected = rows.reduce((sum, row) => sum + row.expectedMarks, 0);
  const totalMax = rows.reduce((sum, row) => sum + row.maxMarks, 0);
  const averageReadiness = rows.reduce((sum, row) => sum + row.readiness, 0) / rows.length;

  return {
    countdown,
    daysLeft: countdown.days,
    rows,
    overdue,
    weakest: byReadiness[0],
    averageReadiness,
    averageReadinessPercent: averageReadiness * 100,
    totalExpected,
    totalMax,
    totalExpectedPercent: totalMax > 0 ? (totalExpected / totalMax) * 100 : 0,
    band: bandFor(averageReadiness),
    breakEvenReadinessPercent: BREAK_EVEN_READINESS * 100,
  };
}
