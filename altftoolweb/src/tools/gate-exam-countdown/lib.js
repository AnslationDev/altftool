/**
 * GATE countdown and subject rotation planner.
 *
 * The rotation uses a halving compression, the standard way a syllabus is
 * revised: each successive pass over the same subjects gets half the days of
 * the pass before it, so with n cycles the share of cycle i (counting from 0) is
 *
 *      share_i = 2^(n-1-i) / (2^n - 1)
 *
 * which for three cycles is 4/7, 2/7 and 1/7 of the days available. Inside a
 * cycle the days are divided between subjects in proportion to the weight you
 * give each one. Both splits use cumulative rounding, so the parts always add
 * back to the whole number of days and nothing is lost to rounding drift.
 *
 * Every function is pure: today's date is an argument, never read from the clock.
 */

const MS_PER_DAY = 86400000;
const DAYS_PER_WEEK = 7;

/**
 * GATE pattern published by the organising institute: a 3 hour computer-based
 * test of 65 questions for 100 marks, of which General Aptitude carries 15
 * marks and the chosen subject paper the remaining 85. Multiple-choice
 * questions carry negative marking of one third of the marks for a 1 mark
 * question and two thirds for a 2 mark question; multiple-select and
 * numerical-answer questions carry none. A GATE score stays valid for 3 years
 * from the date the result is announced.
 */
export const GATE_PATTERN = {
  durationHours: 3,
  questions: 65,
  totalMarks: 100,
  generalAptitudeMarks: 15,
  subjectMarks: 85,
  negativeFractionOneMark: 1 / 3,
  negativeFractionTwoMark: 2 / 3,
  scoreValidityYears: 3,
};

/**
 * Subject lists are the section headings of the official GATE syllabus for each
 * paper, plus General Aptitude, which every paper carries. Weights start equal
 * at 1 because published marks weightage moves year to year — set them yourself
 * from your own past-paper analysis.
 */
export const GATE_BRANCHES = [
  {
    id: "cs",
    label: "CS — Computer Science & IT",
    subjects: [
      "General Aptitude",
      "Engineering Mathematics",
      "Digital Logic",
      "Computer Organization & Architecture",
      "Programming & Data Structures",
      "Algorithms",
      "Theory of Computation",
      "Compiler Design",
      "Operating System",
      "Databases",
      "Computer Networks",
    ],
  },
  {
    id: "me",
    label: "ME — Mechanical Engineering",
    subjects: [
      "General Aptitude",
      "Engineering Mathematics",
      "Applied Mechanics & Design",
      "Fluid Mechanics & Thermal Sciences",
      "Materials, Manufacturing & Industrial Engineering",
    ],
  },
  {
    id: "ce",
    label: "CE — Civil Engineering",
    subjects: [
      "General Aptitude",
      "Engineering Mathematics",
      "Structural Engineering",
      "Geotechnical Engineering",
      "Water Resources Engineering",
      "Environmental Engineering",
      "Transportation Engineering",
      "Geomatics Engineering",
    ],
  },
  {
    id: "ee",
    label: "EE — Electrical Engineering",
    subjects: [
      "General Aptitude",
      "Engineering Mathematics",
      "Electric Circuits",
      "Electromagnetic Fields",
      "Signals & Systems",
      "Electrical Machines",
      "Power Systems",
      "Control Systems",
      "Electrical & Electronic Measurements",
      "Analog & Digital Electronics",
      "Power Electronics",
    ],
  },
  {
    id: "ec",
    label: "EC — Electronics & Communication",
    subjects: [
      "General Aptitude",
      "Engineering Mathematics",
      "Networks, Signals & Systems",
      "Electronic Devices",
      "Analog Circuits",
      "Digital Circuits",
      "Control Systems",
      "Communications",
      "Electromagnetics",
    ],
  },
];

/** GATE is written across weekends in early February. Replace with your admit card date. */
export const GATE_DEFAULT_EXAM_DATE = "2027-02-06";

export const MIN_CYCLES = 1;
export const MAX_CYCLES = 5;

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
 * Split a whole number into parts in the given proportions, using cumulative
 * rounding so the parts always sum back exactly to the total.
 */
export function splitWholeDays(total, shares) {
  const sum = shares.reduce((acc, share) => acc + share, 0);
  if (!(total >= 0) || !(sum > 0)) return shares.map(() => 0);
  const parts = [];
  let cumulativeShare = 0;
  let previousBoundary = 0;
  for (let index = 0; index < shares.length; index += 1) {
    cumulativeShare += shares[index] / sum;
    const boundary = index === shares.length - 1 ? total : Math.round(total * cumulativeShare);
    parts.push(boundary - previousBoundary);
    previousBoundary = boundary;
  }
  return parts;
}

/** Halving shares for n revision cycles: 2^(n-1-i) / (2^n - 1). */
export function cycleShares(cycles) {
  const shares = [];
  for (let index = 0; index < cycles; index += 1) {
    shares.push(Math.pow(2, cycles - 1 - index));
  }
  return shares;
}

/**
 * Build the rotation schedule.
 *
 * @param {object} input
 * @param {string} input.todayISO   today's date
 * @param {string} input.startISO   the day the rotation begins (often today)
 * @param {string} input.examISO    the GATE date
 * @param {Array}  input.subjects   [{ id, label, weight }]
 * @param {number} input.cycles     how many passes over the whole syllabus
 * @param {number} input.mockBufferDays days at the end kept for mock tests only
 */
export function buildRotation({
  todayISO,
  startISO,
  examISO,
  subjects,
  cycles,
  mockBufferDays,
}) {
  const daysToExam = daysBetween(todayISO, examISO);
  if (daysToExam === null) return { error: "Enter the exam date as a valid calendar date." };
  const rotationSpan = daysBetween(startISO, examISO);
  if (rotationSpan === null) return { error: "Enter the rotation start date as a valid calendar date." };
  if (rotationSpan <= 0) {
    return { error: "The rotation must start at least one day before the exam." };
  }
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return { error: "Pick a branch so there are subjects to rotate." };
  }
  if (!Number.isFinite(cycles) || !Number.isInteger(cycles) || cycles < MIN_CYCLES || cycles > MAX_CYCLES) {
    return { error: `Revision cycles must be a whole number between ${MIN_CYCLES} and ${MAX_CYCLES}.` };
  }
  if (!Number.isFinite(mockBufferDays) || !Number.isInteger(mockBufferDays) || mockBufferDays < 0) {
    return { error: "The mock-test buffer must be a whole number of days." };
  }
  if (mockBufferDays >= rotationSpan) {
    return { error: "The mock-test buffer leaves no days for the rotation. Shorten it." };
  }

  const weights = [];
  for (const subject of subjects) {
    const weight = Number(subject.weight);
    if (!Number.isFinite(weight) || weight <= 0) {
      return { error: `${subject.label || "Subject"}: weight must be greater than zero.` };
    }
    weights.push(weight);
  }

  const rotationDays = rotationSpan - mockBufferDays;
  const perCycleDays = splitWholeDays(rotationDays, cycleShares(cycles));

  const blocks = [];
  let offset = 0;
  perCycleDays.forEach((cycleDays, cycleIndex) => {
    const perSubject = splitWholeDays(cycleDays, weights);
    subjects.forEach((subject, subjectIndex) => {
      const days = perSubject[subjectIndex];
      blocks.push({
        key: `${subject.id}-${cycleIndex}`,
        cycle: cycleIndex + 1,
        subjectId: subject.id,
        label: subject.label,
        days,
        startISO: addDays(startISO, offset),
        endISO: addDays(startISO, Math.max(offset + days - 1, offset)),
        startOffset: offset,
      });
      offset += days;
    });
  });

  const elapsed = daysBetween(startISO, todayISO);
  let current = null;
  if (elapsed !== null && elapsed >= 0) {
    for (const block of blocks) {
      if (block.days > 0 && elapsed >= block.startOffset && elapsed < block.startOffset + block.days) {
        current = { ...block, dayInBlock: elapsed - block.startOffset + 1 };
        break;
      }
    }
  }

  const matrix = subjects.map((subject, subjectIndex) => ({
    id: subject.id,
    label: subject.label,
    weight: weights[subjectIndex],
    weightPercent: (weights[subjectIndex] / weights.reduce((a, b) => a + b, 0)) * 100,
    perCycle: blocks
      .filter((block) => block.subjectId === subject.id)
      .map((block) => block.days),
    totalDays: blocks
      .filter((block) => block.subjectId === subject.id)
      .reduce((acc, block) => acc + block.days, 0),
  }));

  const squeezed = matrix.filter((row) => row.perCycle.some((days) => days === 0));

  return {
    daysToExam,
    rotationSpan,
    rotationDays,
    mockBufferDays,
    perCycleDays,
    cycles,
    blocks,
    matrix,
    current,
    inMockPhase: elapsed !== null && elapsed >= rotationDays && elapsed < rotationSpan,
    squeezedSubjects: squeezed.map((row) => row.label),
    daysPerSubjectPerCycle: rotationDays / (cycles * subjects.length),
  };
}
