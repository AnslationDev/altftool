/**
 * School attendance tracking against board examination eligibility.
 *
 * The rule that matters for a school student in India is the 75% attendance
 * condition in the CBSE Examination Bye-Laws: a candidate who has not attended
 * 75% of the working days of the school in the academic session is not eligible
 * to be sent up for the Class X / Class XII board examination. Other boards
 * (ICSE/CISCE, and most state boards) apply a comparable 75% condition, which is
 * why the requirement is an editable input here rather than a hard-coded figure.
 * Shortage may be condoned by the board in listed circumstances — prolonged
 * illness, the death of a parent, participation in approved national events —
 * on a case-by-case application routed through the school. Condonation is
 * discretionary and is never granted merely because the student asked.
 *
 * The arithmetic:
 *
 *   attendance %        = days present ÷ working days so far × 100
 *   leave budget        = floor(session working days × (100 − target) ÷ 100)
 *   days you must still = ceil(target × session working days ÷ 100) − days present
 *     attend
 *
 * Session length is checked against the minimum number of instructional days a
 * school is expected to run. The Right of Children to Free and Compulsory
 * Education Act, 2009 lays down 200 working days for classes I to V and 220 for
 * classes VI to VIII in its Schedule. Classes IX to XII sit outside the RTE
 * Act; the 200-day figure shown for them reflects the instructional-days
 * expectation in CBSE's affiliation norms and is indicative only.
 */

/** Attendance condition in the CBSE Examination Bye-Laws for board eligibility. */
export const BOARD_REQUIRED_PERCENT = 75;

/** Minimum instructional days by school stage. */
export const STAGE_MIN_WORKING_DAYS = [
  { id: "primary", label: "Classes I – V", minDays: 200, source: "RTE Act 2009, Schedule" },
  { id: "upper-primary", label: "Classes VI – VIII", minDays: 220, source: "RTE Act 2009, Schedule" },
  {
    id: "secondary",
    label: "Classes IX – XII",
    minDays: 200,
    source: "Indicative: CBSE affiliation norms; the RTE Act does not cover these classes",
  },
];

/** A school session cannot sensibly run more instructional days than this. */
export const MAX_SESSION_WORKING_DAYS = 320;

/** Highest attendance target the tracker will accept. */
export const MAX_TARGET_PERCENT = 100;

const EPSILON = 1e-9;

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function isWholeCount(value) {
  return Number.isFinite(value) && value >= 0 && Number.isInteger(value);
}

/** Minimum instructional days for a stage id, or null when unknown. */
export function minWorkingDaysForStage(stageId) {
  const stage = STAGE_MIN_WORKING_DAYS.find((item) => item.id === stageId);
  return stage ? stage.minDays : null;
}

/**
 * Eligibility band for a percentage against the board requirement.
 * A five point cushion is used to mark "borderline" because a single week of
 * absence in a 200-day session moves attendance by roughly 2.5 points.
 */
export const BORDERLINE_CUSHION_POINTS = 5;

export function eligibilityStatus(percent, requiredPercent = BOARD_REQUIRED_PERCENT) {
  if (percent === null || !Number.isFinite(percent)) {
    return { id: "not-started", label: "No working days recorded yet", tone: "muted" };
  }
  if (percent + EPSILON >= requiredPercent + BORDERLINE_CUSHION_POINTS) {
    return { id: "safe", label: "Comfortably eligible", tone: "success" };
  }
  if (percent + EPSILON >= requiredPercent) {
    return { id: "borderline", label: "Eligible, but with little room left", tone: "warning" };
  }
  return { id: "short", label: "Below the requirement", tone: "danger" };
}

/**
 * Full attendance picture for a school session.
 *
 * @param {object} input
 * @param {number} input.workingDaysSoFar   instructional days held to date
 * @param {number} input.daysPresent        days the student was marked present
 * @param {number} [input.workingDaysRemaining] instructional days left in the session
 * @param {number} [input.plannedLeaveDays] leave the student already intends to take
 * @param {number} [input.requiredPercent]  eligibility threshold, default 75
 * @param {string} [input.stageId]          school stage for the working-days check
 * @returns {object} result, or { error } for input that cannot be scored
 */
export function trackSchoolAttendance({
  workingDaysSoFar,
  daysPresent,
  workingDaysRemaining = 0,
  plannedLeaveDays = 0,
  requiredPercent = BOARD_REQUIRED_PERCENT,
  stageId = "secondary",
} = {}) {
  const heldDays = Number(workingDaysSoFar);
  const presentDays = Number(daysPresent);
  const remainingDays = Number(workingDaysRemaining);
  const plannedLeave = Number(plannedLeaveDays);
  const target = Number(requiredPercent);

  if (
    !isWholeCount(heldDays) ||
    !isWholeCount(presentDays) ||
    !isWholeCount(remainingDays) ||
    !isWholeCount(plannedLeave)
  ) {
    return { error: "Day counts must be whole numbers of zero or more." };
  }
  if (!Number.isFinite(target) || target <= 0 || target > MAX_TARGET_PERCENT) {
    return { error: `The attendance requirement must be above 0% and at most ${MAX_TARGET_PERCENT}%.` };
  }
  if (presentDays > heldDays) {
    return {
      error: `Days present (${presentDays}) cannot exceed the ${heldDays} working days held so far.`,
    };
  }
  if (heldDays + remainingDays > MAX_SESSION_WORKING_DAYS) {
    return {
      error: `A school session does not run more than ${MAX_SESSION_WORKING_DAYS} working days. Check the day counts.`,
    };
  }
  if (heldDays + remainingDays === 0) {
    return { error: "Enter the working days held so far, or the days left in the session." };
  }
  if (plannedLeave > remainingDays) {
    return {
      error: `Planned leave (${plannedLeave} days) is more than the ${remainingDays} working days left in the session.`,
    };
  }

  const sessionDays = heldDays + remainingDays;
  const absencesSoFar = heldDays - presentDays;
  const percent = heldDays === 0 ? null : round((presentDays / heldDays) * 100, 2);

  // Total absences the session can carry and still finish at the target.
  const leaveBudget = Math.floor((sessionDays * (100 - target)) / 100 + EPSILON);
  const leaveBudgetLeft = leaveBudget - absencesSoFar;

  // Days still to attend out of those remaining.
  const presentDaysNeeded = Math.ceil((target * sessionDays) / 100 - EPSILON);
  const mustAttendOfRemaining = Math.max(0, presentDaysNeeded - presentDays);
  const targetReachable = mustAttendOfRemaining <= remainingDays;
  const canMissOfRemaining = targetReachable ? remainingDays - mustAttendOfRemaining : 0;

  // Where the year ends if every remaining day is attended, and if none is.
  const bestPossible = round(((presentDays + remainingDays) / sessionDays) * 100, 2);
  const worstPossible = round((presentDays / sessionDays) * 100, 2);

  // Where the year ends on the leave the student already plans to take.
  const projectedPresent = presentDays + (remainingDays - plannedLeave);
  const projectedPercent = round((projectedPresent / sessionDays) * 100, 2);

  const minDays = minWorkingDaysForStage(stageId);
  const meetsMinWorkingDays = minDays === null ? null : sessionDays >= minDays;

  const status = eligibilityStatus(percent, target);
  const projectedStatus = eligibilityStatus(projectedPercent, target);

  let verdict;
  if (!targetReachable) {
    verdict = `Even attending every one of the ${remainingDays} remaining days finishes the session at ${bestPossible}%, below ${target}%. A condonation request through the school is the only route left, and it is decided by the board, not the school.`;
  } else if (projectedPercent + EPSILON < target) {
    verdict = `The ${plannedLeave} days of leave already planned would end the session at ${projectedPercent}%. Cutting the planned leave to ${canMissOfRemaining} days or fewer keeps eligibility intact.`;
  } else if (leaveBudgetLeft <= 0) {
    verdict = `The full ${leaveBudget}-day leave allowance for this session is used up. Every further absence now drops the year below ${target}%.`;
  } else {
    verdict = `${leaveBudgetLeft} day${leaveBudgetLeft === 1 ? "" : "s"} of absence are still affordable across the rest of the session while finishing at or above ${target}%.`;
  }

  return {
    requiredPercent: target,
    workingDaysSoFar: heldDays,
    daysPresent: presentDays,
    absencesSoFar,
    workingDaysRemaining: remainingDays,
    sessionDays,
    percent,
    status,
    leaveBudget,
    leaveBudgetLeft,
    leaveBudgetOverrun: Math.max(0, -leaveBudgetLeft),
    presentDaysNeeded,
    mustAttendOfRemaining,
    canMissOfRemaining,
    targetReachable,
    bestPossible,
    worstPossible,
    plannedLeaveDays: plannedLeave,
    projectedPresent,
    projectedPercent,
    projectedStatus,
    shortfallPoints: percent === null ? null : round(Math.max(0, target - percent), 2),
    stageMinWorkingDays: minDays,
    meetsMinWorkingDays,
    verdict,
  };
}
