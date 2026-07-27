/**
 * Practical / laboratory attendance, tracked apart from theory.
 *
 * Universities and polytechnics almost always treat a laboratory course as a
 * separate head of account from the theory paper that goes with it. Three
 * things follow from that, and all three are computed here:
 *
 *  1. TWO SEPARATE BARS. The theory percentage and the practical percentage are
 *     each tested against the requirement. A student at 90% in theory and 60% in
 *     the lab is detained in the lab, and the theory figure does not rescue it.
 *     The common bar is 75% of the classes held; some institutions set a higher
 *     bar for practicals, so both targets are inputs.
 *
 *  2. LAB SESSIONS ARE LONGER THAN LECTURES. A lab slot is normally two or three
 *     continuous periods and is marked as that many contact hours on the roll.
 *     A combined percentage therefore differs depending on whether sessions or
 *     contact hours are counted:
 *
 *       combined by session count = (theory attended + lab attended)
 *                                 ÷ (theory held + lab held) × 100
 *       combined by contact hours = (theory attended × theory hours
 *                                    + lab attended × lab hours)
 *                                 ÷ (theory held × theory hours
 *                                    + lab held × lab hours) × 100
 *
 *     Both are reported, because institutions differ on which one they publish.
 *
 *  3. THE RECORD BOOK IS A SECOND CONDITION. Practical courses prescribe a list
 *     of experiments, and a student who attended the sessions but did not
 *     complete and get the record signed is normally still held back. Pending
 *     experiments are therefore tracked alongside the percentages.
 *
 * Classes needed to recover follow the same identity used for any attendance
 * shortfall — attending a session raises the numerator and the denominator
 * together:
 *
 *     n = ceil((target × held − 100 × attended) ÷ (100 − target))
 */

/** Usual minimum attendance in each head, theory and practical alike. */
export const DEFAULT_REQUIRED_PERCENT = 75;

/** A lecture period is one contact hour. */
export const DEFAULT_THEORY_HOURS_PER_CLASS = 1;

/** A laboratory slot normally runs two continuous periods. */
export const DEFAULT_LAB_HOURS_PER_SESSION = 2;

/** Sanity ceilings so a typo cannot produce a meaningless answer. */
export const MAX_CLASSES = 400;
export const MAX_HOURS_PER_SESSION = 8;
export const MAX_EXPERIMENTS = 100;
export const MAX_TARGET_PERCENT = 100;

const EPSILON = 1e-9;

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function isWholeCount(value) {
  return Number.isFinite(value) && value >= 0 && Number.isInteger(value);
}

/**
 * Attendance figures for one head (theory or practical).
 * Returns null percentages rather than NaN when nothing has been held yet.
 */
function headAttendance({ label, held, attended, remaining, target }) {
  const percent = held === 0 ? null : round((attended / held) * 100, 2);
  const totalPlanned = held + remaining;

  const neededAtEnd = Math.ceil((target * totalPlanned) / 100 - EPSILON);
  const mustAttendOfRemaining = Math.max(0, neededAtEnd - attended);
  const targetReachable = totalPlanned > 0 && mustAttendOfRemaining <= remaining;
  const canSkipOfRemaining = targetReachable ? remaining - mustAttendOfRemaining : 0;

  let consecutiveNeeded = 0;
  if (percent !== null && percent + EPSILON < target) {
    consecutiveNeeded =
      target >= MAX_TARGET_PERCENT
        ? null
        : Math.max(0, Math.ceil((target * held - 100 * attended) / (100 - target) - EPSILON));
  }

  const canMissNow =
    percent !== null && percent + EPSILON >= target
      ? Math.max(0, Math.floor((attended * 100) / target + EPSILON) - held)
      : 0;

  return {
    label,
    held,
    attended,
    missed: held - attended,
    remaining,
    totalPlanned,
    target,
    percent,
    meetsTarget: percent !== null && percent + EPSILON >= target,
    shortfallPoints: percent === null ? null : round(Math.max(0, target - percent), 2),
    bestPossible: totalPlanned === 0 ? null : round(((attended + remaining) / totalPlanned) * 100, 2),
    mustAttendOfRemaining,
    canSkipOfRemaining,
    targetReachable,
    consecutiveNeeded,
    canMissNow,
  };
}

/**
 * Full practical-versus-theory attendance picture for one course.
 *
 * @param {object} input
 * @returns {object} result, or { error } when the counts cannot be scored
 */
export function trackLabAttendance({
  theoryHeld = 0,
  theoryAttended = 0,
  theoryRemaining = 0,
  theoryHoursPerClass = DEFAULT_THEORY_HOURS_PER_CLASS,
  labHeld = 0,
  labAttended = 0,
  labRemaining = 0,
  labHoursPerSession = DEFAULT_LAB_HOURS_PER_SESSION,
  theoryRequiredPercent = DEFAULT_REQUIRED_PERCENT,
  labRequiredPercent = DEFAULT_REQUIRED_PERCENT,
  experimentsPrescribed = 0,
  experimentsCompleted = 0,
} = {}) {
  const counts = {
    theoryHeld: Number(theoryHeld),
    theoryAttended: Number(theoryAttended),
    theoryRemaining: Number(theoryRemaining),
    labHeld: Number(labHeld),
    labAttended: Number(labAttended),
    labRemaining: Number(labRemaining),
    experimentsPrescribed: Number(experimentsPrescribed),
    experimentsCompleted: Number(experimentsCompleted),
  };

  if (!Object.values(counts).every(isWholeCount)) {
    return { error: "Class, session and experiment counts must be whole numbers of zero or more." };
  }
  if (counts.theoryHeld + counts.theoryRemaining > MAX_CLASSES) {
    return { error: `A theory paper does not run more than ${MAX_CLASSES} classes in a semester.` };
  }
  if (counts.labHeld + counts.labRemaining > MAX_CLASSES) {
    return { error: `A lab course does not run more than ${MAX_CLASSES} sessions in a semester.` };
  }
  if (counts.theoryAttended > counts.theoryHeld) {
    return {
      error: `Theory attended (${counts.theoryAttended}) cannot exceed the ${counts.theoryHeld} classes held.`,
    };
  }
  if (counts.labAttended > counts.labHeld) {
    return {
      error: `Lab sessions attended (${counts.labAttended}) cannot exceed the ${counts.labHeld} sessions held.`,
    };
  }
  if (counts.experimentsPrescribed > MAX_EXPERIMENTS) {
    return { error: `A lab syllabus does not prescribe more than ${MAX_EXPERIMENTS} experiments.` };
  }
  if (counts.experimentsCompleted > counts.experimentsPrescribed) {
    return {
      error: `Experiments completed (${counts.experimentsCompleted}) cannot exceed the ${counts.experimentsPrescribed} prescribed.`,
    };
  }

  const theoryTarget = Number(theoryRequiredPercent);
  const labTarget = Number(labRequiredPercent);
  for (const target of [theoryTarget, labTarget]) {
    if (!Number.isFinite(target) || target <= 0 || target > MAX_TARGET_PERCENT) {
      return { error: `Attendance targets must be above 0% and at most ${MAX_TARGET_PERCENT}%.` };
    }
  }

  const theoryHours = Number(theoryHoursPerClass);
  const labHours = Number(labHoursPerSession);
  for (const hours of [theoryHours, labHours]) {
    if (!Number.isFinite(hours) || hours <= 0 || hours > MAX_HOURS_PER_SESSION) {
      return {
        error: `Contact hours per class must be above 0 and at most ${MAX_HOURS_PER_SESSION}.`,
      };
    }
  }

  if (counts.theoryHeld + counts.labHeld + counts.theoryRemaining + counts.labRemaining === 0) {
    return { error: "Nothing to score yet. Enter the classes or lab sessions held." };
  }

  const theory = headAttendance({
    label: "Theory",
    held: counts.theoryHeld,
    attended: counts.theoryAttended,
    remaining: counts.theoryRemaining,
    target: theoryTarget,
  });
  const lab = headAttendance({
    label: "Practical / lab",
    held: counts.labHeld,
    attended: counts.labAttended,
    remaining: counts.labRemaining,
    target: labTarget,
  });

  // Combined views. The denominators are guarded above by the "nothing held"
  // check plus the positive contact-hour validation.
  const combinedHeld = counts.theoryHeld + counts.labHeld;
  const combinedAttended = counts.theoryAttended + counts.labAttended;
  const combinedByCount =
    combinedHeld === 0 ? null : round((combinedAttended / combinedHeld) * 100, 2);

  const heldHours = counts.theoryHeld * theoryHours + counts.labHeld * labHours;
  const attendedHours = counts.theoryAttended * theoryHours + counts.labAttended * labHours;
  const combinedByHours = heldHours === 0 ? null : round((attendedHours / heldHours) * 100, 2);

  const experimentsPending = counts.experimentsPrescribed - counts.experimentsCompleted;
  const recordPercent =
    counts.experimentsPrescribed === 0
      ? null
      : round((counts.experimentsCompleted / counts.experimentsPrescribed) * 100, 2);
  const recordComplete = counts.experimentsPrescribed === 0 ? null : experimentsPending === 0;

  const blockers = [];
  if (lab.held > 0 && !lab.meetsTarget) {
    blockers.push(
      `Practical attendance is ${lab.percent}%, ${lab.shortfallPoints} points under the ${labTarget}% bar.`,
    );
  }
  if (theory.held > 0 && !theory.meetsTarget) {
    blockers.push(
      `Theory attendance is ${theory.percent}%, ${theory.shortfallPoints} points under the ${theoryTarget}% bar.`,
    );
  }
  if (recordComplete === false) {
    blockers.push(
      `${experimentsPending} experiment${experimentsPending === 1 ? "" : "s"} still to be completed and signed in the record.`,
    );
  }

  const eligible = blockers.length === 0;

  let verdict;
  if (eligible) {
    verdict = `Both heads clear their bar and the record is complete. The practical head has the least slack: ${lab.remaining > 0 ? `${lab.canSkipOfRemaining} of the ${lab.remaining} sessions left can be missed` : `${lab.canMissNow} more session${lab.canMissNow === 1 ? "" : "s"} can be missed`}.`;
  } else if (lab.held > 0 && !lab.meetsTarget && !lab.targetReachable && lab.remaining >= 0) {
    verdict = `Attending every one of the ${lab.remaining} lab sessions left still finishes at ${lab.bestPossible}%, under ${labTarget}%. Ask about a repeat lab or a condonation now — lab sessions are scheduled weekly, so they run out faster than lectures.`;
  } else {
    verdict = `Not eligible yet. ${blockers[0]} Lab slots come round once a week, so a shortfall here is much harder to recover than a lecture shortfall.`;
  }

  return {
    theory,
    lab,
    combinedByCount,
    combinedByHours,
    combinedHeld,
    combinedAttended,
    heldHours,
    attendedHours,
    theoryHoursPerClass: theoryHours,
    labHoursPerSession: labHours,
    hoursGap:
      combinedByCount === null || combinedByHours === null
        ? null
        : round(combinedByHours - combinedByCount, 2),
    experimentsPrescribed: counts.experimentsPrescribed,
    experimentsCompleted: counts.experimentsCompleted,
    experimentsPending,
    recordPercent,
    recordComplete,
    blockers,
    eligible,
    verdict,
  };
}
