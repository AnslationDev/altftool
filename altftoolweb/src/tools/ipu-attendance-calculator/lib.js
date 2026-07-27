/**
 * GGSIPU (Guru Gobind Singh Indraprastha University, Delhi) attendance maths.
 *
 * The attendance rule lives in the University's examination ordinance for
 * undergraduate and postgraduate programmes. Two things matter for a student:
 *
 *  1. Attendance is counted PER SUBJECT, not as one term average. A student who
 *     sits at 90% in five subjects and 60% in the sixth is still detained in
 *     that sixth subject.
 *  2. The bar is 75% of the classes actually held in that subject. A shortfall
 *     of up to 5 percentage points may be condoned by the Dean/Director of the
 *     institution, and a further 5 points may be relaxed by the Vice-Chancellor
 *     for students who represented the University in sports, NCC, NSS or similar
 *     approved activity. Condonation is discretionary — it is never a right.
 *
 * The arithmetic itself is plain:
 *
 *     attendance %          = attended / held × 100
 *     classes still needed  = ceil(target% × (held + remaining) / 100) − attended
 *     classes safely missed = remaining − classes still needed
 *
 * When the number of classes left in the term is not known, the open-ended form
 * is used instead — how many classes in a row must be attended so that every
 * additional class raises both the numerator and the denominator:
 *
 *     n = ceil((target × held − 100 × attended) / (100 − target))
 *
 * Every figure here is informational. The attendance printed on the IPU/institute
 * portal on the cut-off date is the one that decides eligibility.
 */

/** Minimum attendance in each subject to sit the end-term examination. */
export const IPU_REQUIRED_PERCENT = 75;

/** Shortfall (in percentage points) the Dean/Director may condone. */
export const IPU_DEAN_CONDONATION_POINTS = 5;

/**
 * Further shortfall the Vice-Chancellor may relax for students representing the
 * University in approved sports / NCC / NSS / cultural activity.
 */
export const IPU_VC_RELAXATION_POINTS = 5;

/** Sanity ceiling: no IPU subject runs more than this many classes in a semester. */
export const MAX_CLASSES_PER_SUBJECT = 400;

/** Highest target attendance the calculator will accept. */
export const MAX_TARGET_PERCENT = 100;

const EPSILON = 1e-9;

/** Round to `places` decimals without floating-point noise leaking out. */
function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/** True when `value` is a finite, non-negative whole number. */
function isWholeCount(value) {
  return Number.isFinite(value) && value >= 0 && Number.isInteger(value);
}

/**
 * Status band for one subject, given the target and the two condonation steps.
 * @param {number|null} percent
 * @param {number} requiredPercent
 * @returns {{id: string, label: string, tone: string}}
 */
export function attendanceStatus(percent, requiredPercent = IPU_REQUIRED_PERCENT) {
  if (percent === null || !Number.isFinite(percent)) {
    return { id: "not-started", label: "No classes held yet", tone: "muted" };
  }
  if (percent + EPSILON >= requiredPercent) {
    return { id: "safe", label: "Eligible — above the bar", tone: "success" };
  }
  if (percent + EPSILON >= requiredPercent - IPU_DEAN_CONDONATION_POINTS) {
    return {
      id: "condonable",
      label: `Short — within the ${IPU_DEAN_CONDONATION_POINTS}-point Dean condonation`,
      tone: "warning",
    };
  }
  if (
    percent + EPSILON >=
    requiredPercent - IPU_DEAN_CONDONATION_POINTS - IPU_VC_RELAXATION_POINTS
  ) {
    return {
      id: "relaxable",
      label: "Short — only a Vice-Chancellor relaxation can save this",
      tone: "warning",
    };
  }
  return { id: "detained", label: "Detained — below every relaxation", tone: "danger" };
}

/**
 * Attendance picture for a single subject.
 *
 * @param {object} input
 * @param {number} input.held      classes conducted in this subject so far
 * @param {number} input.attended  classes of those you were present for
 * @param {number} [input.remaining] classes still scheduled before the cut-off
 * @param {number} [input.requiredPercent] target attendance, default 75
 * @param {string} [input.name]
 * @returns {object} result, or { error } when the counts cannot be scored
 */
export function subjectAttendance({
  held,
  attended,
  remaining = 0,
  requiredPercent = IPU_REQUIRED_PERCENT,
  name = "Subject",
} = {}) {
  const heldCount = Number(held);
  const attendedCount = Number(attended);
  const remainingCount = Number(remaining);
  const target = Number(requiredPercent);

  if (!isWholeCount(heldCount) || !isWholeCount(attendedCount) || !isWholeCount(remainingCount)) {
    return { error: `${name}: class counts must be whole numbers of zero or more.` };
  }
  if (heldCount > MAX_CLASSES_PER_SUBJECT || remainingCount > MAX_CLASSES_PER_SUBJECT) {
    return {
      error: `${name}: a single subject does not run more than ${MAX_CLASSES_PER_SUBJECT} classes in a semester.`,
    };
  }
  if (attendedCount > heldCount) {
    return {
      error: `${name}: you cannot attend ${attendedCount} of ${heldCount} classes. Attended must not exceed classes held.`,
    };
  }
  if (!Number.isFinite(target) || target <= 0 || target > MAX_TARGET_PERCENT) {
    return { error: `Target attendance must be greater than 0 and at most ${MAX_TARGET_PERCENT}%.` };
  }

  const percent = heldCount === 0 ? null : round((attendedCount / heldCount) * 100, 2);
  const missed = heldCount - attendedCount;
  const totalPlanned = heldCount + remainingCount;

  // Best and worst the subject can finish at, once every scheduled class is over.
  const bestPossible =
    totalPlanned === 0 ? null : round(((attendedCount + remainingCount) / totalPlanned) * 100, 2);
  const worstPossible = totalPlanned === 0 ? null : round((attendedCount / totalPlanned) * 100, 2);

  // How many of the remaining classes must be attended to finish at the target.
  const neededAtEnd = Math.ceil((target * totalPlanned) / 100 - EPSILON);
  const mustAttendOfRemaining = Math.max(0, neededAtEnd - attendedCount);
  const targetReachable = totalPlanned > 0 && mustAttendOfRemaining <= remainingCount;
  const canSkipOfRemaining = targetReachable
    ? Math.max(0, remainingCount - mustAttendOfRemaining)
    : 0;

  // Open-ended form: consecutive future classes needed when the term length is
  // unknown. At target = 100% a student who has ever missed a class can never
  // recover, so the answer is "not possible" rather than a number.
  let consecutiveNeeded = 0;
  if (percent !== null && percent + EPSILON < target) {
    if (target >= MAX_TARGET_PERCENT) {
      consecutiveNeeded = null;
    } else {
      consecutiveNeeded = Math.max(
        0,
        Math.ceil((target * heldCount - 100 * attendedCount) / (100 - target) - EPSILON),
      );
    }
  }

  // How many classes can be missed from here and still stay at or above target,
  // assuming no further classes are attended after them.
  const canMissNow =
    percent !== null && percent + EPSILON >= target
      ? Math.max(0, Math.floor((attendedCount * 100) / target + EPSILON) - heldCount)
      : 0;

  return {
    name,
    held: heldCount,
    attended: attendedCount,
    missed,
    remaining: remainingCount,
    totalPlanned,
    requiredPercent: target,
    percent,
    bestPossible,
    worstPossible,
    mustAttendOfRemaining,
    canSkipOfRemaining,
    targetReachable,
    consecutiveNeeded,
    canMissNow,
    shortfallPoints: percent === null ? null : round(Math.max(0, target - percent), 2),
    status: attendanceStatus(percent, target),
  };
}

/**
 * Whole-semester report across every subject.
 *
 * @param {object} input
 * @param {Array<{name?: string, held: number, attended: number, remaining?: number}>} input.subjects
 * @param {number} [input.requiredPercent]
 * @returns {object} report, or { error }
 */
export function computeIpuAttendance({ subjects, requiredPercent = IPU_REQUIRED_PERCENT } = {}) {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return { error: "Add at least one subject with its class counts." };
  }

  const rows = [];
  let totalHeld = 0;
  let totalAttended = 0;
  let totalRemaining = 0;

  for (let i = 0; i < subjects.length; i += 1) {
    const row = subjectAttendance({
      ...subjects[i],
      requiredPercent,
      name: subjects[i]?.name?.trim() || `Subject ${i + 1}`,
    });
    if (row.error) return { error: row.error };
    rows.push(row);
    totalHeld += row.held;
    totalAttended += row.attended;
    totalRemaining += row.remaining;
  }

  if (totalHeld === 0 && totalRemaining === 0) {
    return { error: "No classes recorded. Enter the classes held in at least one subject." };
  }

  const overallPercent = totalHeld === 0 ? null : round((totalAttended / totalHeld) * 100, 2);
  const counts = rows.reduce(
    (acc, row) => {
      acc[row.status.id] = (acc[row.status.id] || 0) + 1;
      return acc;
    },
    { safe: 0, condonable: 0, relaxable: 0, detained: 0, "not-started": 0 },
  );

  const scored = rows.filter((row) => row.percent !== null);
  const weakest = scored.length
    ? scored.reduce((worst, row) => (row.percent < worst.percent ? row : worst))
    : null;

  const blocked = rows.filter((row) => row.status.id === "detained");
  const shortOfTarget = scored.filter((row) => row.percent + EPSILON < requiredPercent);

  let verdict;
  if (blocked.length > 0) {
    verdict = `${blocked.length} subject${blocked.length > 1 ? "s are" : " is"} below even the relaxed floor of ${requiredPercent - IPU_DEAN_CONDONATION_POINTS - IPU_VC_RELAXATION_POINTS}%. Speak to the class coordinator now, not at the end of term.`;
  } else if (shortOfTarget.length > 0) {
    verdict = `${shortOfTarget.length} subject${shortOfTarget.length > 1 ? "s sit" : " sits"} under ${requiredPercent}%. Attendance is judged subject by subject, so a high overall average will not cover the gap.`;
  } else {
    verdict = `Every subject is at or above ${requiredPercent}%. Keep the weakest subject in view — one week of missed classes moves it fastest.`;
  }

  return {
    rows,
    requiredPercent,
    overallPercent,
    totalHeld,
    totalAttended,
    totalMissed: totalHeld - totalAttended,
    totalRemaining,
    subjectCount: rows.length,
    counts,
    weakest,
    blockedCount: blocked.length,
    shortCount: shortOfTarget.length,
    condonationFloor: requiredPercent - IPU_DEAN_CONDONATION_POINTS,
    relaxationFloor: requiredPercent - IPU_DEAN_CONDONATION_POINTS - IPU_VC_RELAXATION_POINTS,
    verdict,
  };
}
