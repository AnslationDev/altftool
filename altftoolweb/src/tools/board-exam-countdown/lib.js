/**
 * Board exam countdown, datesheet view and marks-needed maths.
 *
 * The number that actually matters in a board exam season is not "days to the
 * first paper" but how many free days sit before each individual paper, because
 * the datesheet decides that for you. For the first paper still ahead:
 *
 *      freeDaysBefore = daysBetween(today, paperDate)
 *
 * and for every paper after it:
 *
 *      freeDaysBefore = daysBetween(previousPaperDate, paperDate) - 1
 *
 * The day of the previous paper is spent writing it, and the day of this paper
 * is the exam itself, so neither is counted as a study day.
 *
 * The marks calculation inverts the usual percentage:
 *
 *      requiredTheory = targetPercent / 100 x (theoryMax + internalMax) - internalSecured
 *
 * All functions are pure — today's date is always an argument.
 */

const MS_PER_DAY = 86400000;
const DAYS_PER_WEEK = 7;

/**
 * CBSE requires 33 percent to pass a subject. Where a subject has a practical
 * or internal component, the 33 percent has to be reached in the theory and in
 * the practical separately as well as in the total.
 */
export const BOARD_PASS_PERCENT = 33;

/**
 * A CBSE theory paper runs 3 hours, and candidates are given 15 minutes of
 * reading time before writing begins, during which the question paper may be
 * read but nothing may be written in the answer book.
 */
export const PAPER_DURATION_MINUTES = 180;
export const READING_TIME_MINUTES = 15;

/**
 * Subject sets with the usual CBSE theory and internal split: 80 plus 20 for
 * most subjects, and 70 plus 30 where there is a full practical, as in Physics,
 * Chemistry and Biology. Rename subjects and edit the splits to match your own
 * scheme of studies — state boards differ.
 */
export const BOARD_PRESETS = [
  {
    id: "class10",
    label: "Class 10 (CBSE)",
    papers: [
      { id: "eng", label: "English", theoryMax: 80, internalMax: 20 },
      { id: "hin", label: "Hindi", theoryMax: 80, internalMax: 20 },
      { id: "math", label: "Mathematics", theoryMax: 80, internalMax: 20 },
      { id: "sci", label: "Science", theoryMax: 80, internalMax: 20 },
      { id: "sst", label: "Social Science", theoryMax: 80, internalMax: 20 },
    ],
  },
  {
    id: "class12-science",
    label: "Class 12 Science (CBSE)",
    papers: [
      { id: "eng", label: "English Core", theoryMax: 80, internalMax: 20 },
      { id: "phy", label: "Physics", theoryMax: 70, internalMax: 30 },
      { id: "chem", label: "Chemistry", theoryMax: 70, internalMax: 30 },
      { id: "math", label: "Mathematics", theoryMax: 80, internalMax: 20 },
      { id: "bio", label: "Biology", theoryMax: 70, internalMax: 30 },
    ],
  },
  {
    id: "class12-commerce",
    label: "Class 12 Commerce (CBSE)",
    papers: [
      { id: "eng", label: "English Core", theoryMax: 80, internalMax: 20 },
      { id: "acc", label: "Accountancy", theoryMax: 80, internalMax: 20 },
      { id: "bst", label: "Business Studies", theoryMax: 80, internalMax: 20 },
      { id: "eco", label: "Economics", theoryMax: 80, internalMax: 20 },
      { id: "math", label: "Applied Mathematics", theoryMax: 80, internalMax: 20 },
    ],
  },
  {
    id: "class12-humanities",
    label: "Class 12 Humanities (CBSE)",
    papers: [
      { id: "eng", label: "English Core", theoryMax: 80, internalMax: 20 },
      { id: "hist", label: "History", theoryMax: 80, internalMax: 20 },
      { id: "pol", label: "Political Science", theoryMax: 80, internalMax: 20 },
      { id: "geo", label: "Geography", theoryMax: 70, internalMax: 30 },
      { id: "psy", label: "Psychology", theoryMax: 70, internalMax: 30 },
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

/**
 * Build the datesheet view.
 *
 * @param {object} input
 * @param {string} input.todayISO       today's date
 * @param {Array}  input.papers         [{ id, label, date, theoryMax, internalMax }]
 * @param {number} input.studyHoursPerDay hours of study on a free day
 */
export function buildDatesheet({ todayISO, papers, studyHoursPerDay }) {
  if (parseISODate(todayISO) === null) {
    return { error: "Enter today's date as a valid calendar date." };
  }
  if (!Array.isArray(papers) || papers.length === 0) {
    return { error: "Pick a stream so there are papers to schedule." };
  }
  const hours = Number(studyHoursPerDay);
  if (!Number.isFinite(hours) || hours <= 0 || hours > 18) {
    return { error: "Study hours on a free day must be between 0 and 18." };
  }

  const dated = [];
  for (const paper of papers) {
    const raw = typeof paper.date === "string" ? paper.date.trim() : "";
    if (raw === "") continue;
    const days = daysBetween(todayISO, raw);
    if (days === null) {
      return { error: `${paper.label || "Paper"}: enter the date as a valid calendar date.` };
    }
    const theoryMax = Number(paper.theoryMax);
    const internalMax = Number(paper.internalMax);
    if (!Number.isFinite(theoryMax) || theoryMax <= 0) {
      return { error: `${paper.label || "Paper"}: theory marks must be greater than zero.` };
    }
    if (!Number.isFinite(internalMax) || internalMax < 0) {
      return { error: `${paper.label || "Paper"}: internal marks cannot be negative.` };
    }
    dated.push({
      id: paper.id,
      label: paper.label,
      date: raw,
      days,
      theoryMax,
      internalMax,
      subjectMax: theoryMax + internalMax,
    });
  }

  if (dated.length === 0) {
    return { error: "Fill in at least one paper date from your datesheet." };
  }

  dated.sort((a, b) => a.days - b.days);

  const upcoming = dated.filter((row) => row.days >= 0);
  let previousDate = null;
  const rows = dated.map((row) => {
    const isPast = row.days < 0;
    let freeDaysBefore = 0;
    if (!isPast) {
      freeDaysBefore =
        previousDate === null
          ? Math.max(0, row.days)
          : Math.max(0, daysBetween(previousDate, row.date) - 1);
      previousDate = row.date;
    }
    return {
      ...row,
      isPast,
      isToday: row.days === 0,
      freeDaysBefore,
      freeHoursBefore: freeDaysBefore * hours,
      passMarks: (BOARD_PASS_PERCENT / 100) * row.subjectMax,
    };
  });

  const first = upcoming.length > 0 ? upcoming[0] : null;
  const last = upcoming.length > 0 ? upcoming[upcoming.length - 1] : null;

  return {
    rows,
    upcomingCount: upcoming.length,
    first,
    last,
    seasonSpanDays: first && last ? last.days - first.days : null,
    daysToFirst: first ? first.days : null,
    daysToLast: last ? last.days : null,
    weeksToFirst: first ? Math.floor(first.days / DAYS_PER_WEEK) : null,
    spareDaysToFirst: first ? first.days % DAYS_PER_WEEK : null,
    totalFreeDays: rows.reduce((sum, row) => sum + row.freeDaysBefore, 0),
    totalFreeHours: rows.reduce((sum, row) => sum + row.freeHoursBefore, 0),
    allPast: upcoming.length === 0,
    tightestGap: rows
      .filter((row) => !row.isPast)
      .reduce(
        (worst, row) => (worst === null || row.freeDaysBefore < worst.freeDaysBefore ? row : worst),
        null,
      ),
  };
}

/**
 * Theory marks required in one subject to reach a target overall percentage,
 * given the internal or practical marks already secured.
 */
export function requiredTheoryMarks({
  targetPercent,
  theoryMax,
  internalMax,
  internalSecured,
}) {
  const target = Number(targetPercent);
  const theory = Number(theoryMax);
  const internal = Number(internalMax);
  const secured = Number(internalSecured);

  if (!Number.isFinite(target) || target <= 0 || target > 100) {
    return { error: "The target percentage must be between 0 and 100." };
  }
  if (!Number.isFinite(theory) || theory <= 0) {
    return { error: "Theory marks must be greater than zero." };
  }
  if (!Number.isFinite(internal) || internal < 0) {
    return { error: "Internal marks cannot be negative." };
  }
  if (!Number.isFinite(secured) || secured < 0) {
    return { error: "Internal marks secured cannot be negative." };
  }
  if (secured > internal) {
    return { error: "Internal marks secured cannot exceed the internal maximum." };
  }

  const subjectMax = theory + internal;
  const targetMarks = (target / 100) * subjectMax;
  const required = targetMarks - secured;
  const passMarks = (BOARD_PASS_PERCENT / 100) * subjectMax;
  const requiredToPass = Math.max(0, passMarks - secured);

  if (required > theory) {
    return {
      error: `Even full theory marks reach only ${(((theory + secured) / subjectMax) * 100).toFixed(1)}% in this subject. Lower the target.`,
      subjectMax,
      targetMarks,
      theoryMax: theory,
    };
  }

  return {
    subjectMax,
    targetMarks,
    requiredTheory: Math.max(0, required),
    requiredTheoryPercent: (Math.max(0, required) / theory) * 100,
    alreadyEnough: required <= 0,
    passMarks,
    requiredToPass,
    requiredToPassPercent: (requiredToPass / theory) * 100,
    marginOverPass: Math.max(0, required) - requiredToPass,
  };
}
