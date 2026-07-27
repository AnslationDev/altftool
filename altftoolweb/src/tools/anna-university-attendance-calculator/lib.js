/**
 * Anna University attendance maths.
 *
 * Anna University regulations require a student to have attended at least 75%
 * of the classes in each course to be permitted to sit the end-semester
 * examination. Where attendance falls between 65% and just under 75%, the
 * shortage can normally be condoned on payment of the prescribed condonation
 * fee with supporting documents (medical certificate or equivalent). Below
 * 65% the student is not permitted to write the examination and has to redo
 * the course. Colleges apply the condonation clause under their own approval
 * process, so the bands here are the standard ones and not a guarantee.
 *
 * The arithmetic:
 *
 *   percentage = attended / held × 100
 *
 *   Classes you must attend consecutively to reach R%, starting from
 *   (attended, held):
 *       (attended + n) / (held + n) ≥ R/100
 *     → n ≥ (R × held − 100 × attended) / (100 − R)
 *     → n = ceil of that, floored at 0.
 *     This has no solution when R = 100, because missing even one class then
 *     puts the target permanently out of reach.
 *
 *   Classes you can still miss and stay at or above R%:
 *       attended / (held + n) ≥ R/100
 *     → n ≤ (100 × attended / R) − held
 *     → n = floor of that, floored at 0.
 *
 *   When the total number of classes planned for the term is known, the
 *   binding figure is instead the absolute count you must attend overall:
 *       mustAttendOverall = ceil(R/100 × totalPlanned)
 *   and everything else follows from how many of those you already have.
 */

/** Minimum attendance percentage required to sit the end-semester exam. */
export const REQUIRED_PERCENT = 75;

/** Attendance at or above this but below the requirement is normally condonable. */
export const CONDONATION_FLOOR_PERCENT = 65;

/** Sanity ceiling on classes held in one course in one semester. */
export const MAX_CLASSES = 1000;

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round(Number((value * factor).toPrecision(12))) / factor;
}

/**
 * Status band for an attendance percentage.
 * @param {number} percent
 * @returns {{key: string, title: string, detail: string}}
 */
export function statusFor(percent) {
  if (percent >= REQUIRED_PERCENT) {
    return {
      key: "eligible",
      title: "Eligible to write the exam",
      detail: `At or above the ${REQUIRED_PERCENT}% requirement.`,
    };
  }
  if (percent >= CONDONATION_FLOOR_PERCENT) {
    return {
      key: "condonable",
      title: "Short, but usually condonable",
      detail: `Between ${CONDONATION_FLOOR_PERCENT}% and ${REQUIRED_PERCENT}%, so the shortage is normally condoned on payment of the condonation fee with supporting documents.`,
    };
  }
  return {
    key: "detained",
    title: "Below the condonation floor",
    detail: `Under ${CONDONATION_FLOOR_PERCENT}%, which is outside the condonation band — the course normally has to be redone.`,
  };
}

/**
 * Classes that must be attended consecutively to reach a target percentage.
 * @param {number} held
 * @param {number} attended
 * @param {number} target percentage, 0 – 100
 * @returns {number|null} count, or null when the target can never be reached
 */
export function classesToReach(held, attended, target) {
  if (target >= 100) return attended === held ? 0 : null;
  const needed = (target * held - 100 * attended) / (100 - target);
  return Math.max(0, Math.ceil(round(needed, 6)));
}

/**
 * Classes that can still be missed while staying at or above a target.
 * @param {number} held
 * @param {number} attended
 * @param {number} target percentage, 0 – 100
 * @returns {number|null} count, or null when there is no minimum to protect
 */
export function classesYouCanMiss(held, attended, target) {
  if (typeof target !== "number" || !Number.isFinite(target) || target <= 0) return null;
  const room = (100 * attended) / target - held;
  return Math.max(0, Math.floor(round(room, 6)));
}

/**
 * Full attendance analysis for one Anna University course.
 *
 * @param {object} input
 * @param {number} input.held            Classes conducted so far.
 * @param {number} input.attended        Classes you attended.
 * @param {number} [input.totalPlanned]  Total classes planned for the term, if known.
 * @param {number} [input.classesPerWeek] Classes of this course held each week.
 * @returns {object} analysis, or { error }
 */
export function analyseAttendance({ held, attended, totalPlanned = null, classesPerWeek = 0 }) {
  if ([held, attended].some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter the number of classes held and the number you attended." };
  }
  if (held < 0 || attended < 0) {
    return { error: "Class counts cannot be negative." };
  }
  if (held === 0) {
    return { error: "No classes have been held yet, so there is no percentage to calculate." };
  }
  if (attended > held) {
    return { error: "You cannot attend more classes than were held. Check the two numbers." };
  }
  if (held > MAX_CLASSES) {
    return { error: `${held} classes is beyond the ${MAX_CLASSES}-class limit for one course.` };
  }

  const percent = round((attended / held) * 100, 2);
  const status = statusFor(percent);
  const missed = held - attended;

  const needForRequired = classesToReach(held, attended, REQUIRED_PERCENT);
  const needForCondonation = classesToReach(held, attended, CONDONATION_FLOOR_PERCENT);
  const canMiss = classesYouCanMiss(held, attended, REQUIRED_PERCENT);

  let plan = null;
  if (typeof totalPlanned === "number" && Number.isFinite(totalPlanned) && totalPlanned > 0) {
    if (totalPlanned < held) {
      return {
        error: "The total classes planned for the term is less than the classes already held.",
      };
    }
    const remaining = totalPlanned - held;
    const mustAttendOverall = Math.ceil(round((REQUIRED_PERCENT / 100) * totalPlanned, 6));
    const stillNeeded = Math.max(0, mustAttendOverall - attended);
    plan = {
      totalPlanned,
      remaining,
      mustAttendOverall,
      stillNeeded,
      feasible: stillNeeded <= remaining,
      skippableFromHere: Math.max(0, remaining - stillNeeded),
      bestPossiblePercent: round(((attended + remaining) / totalPlanned) * 100, 2),
      worstPossiblePercent: round((attended / totalPlanned) * 100, 2),
    };
  }

  let weeks = null;
  if (typeof classesPerWeek === "number" && Number.isFinite(classesPerWeek) && classesPerWeek > 0) {
    weeks = {
      classesPerWeek,
      weeksToRequired: needForRequired === null ? null : round(needForRequired / classesPerWeek, 1),
      weeksToCondonation:
        needForCondonation === null ? null : round(needForCondonation / classesPerWeek, 1),
    };
  }

  return {
    percent,
    missed,
    status,
    needForRequired,
    needForCondonation,
    canMiss,
    plan,
    weeks,
    held,
    attended,
  };
}

/**
 * Attendance percentage after attending `extra` more consecutive classes.
 * @param {number} held
 * @param {number} attended
 * @param {number} extra
 * @returns {number|null} percentage, or null for invalid input
 */
export function percentAfterAttending(held, attended, extra) {
  const values = [held, attended, extra];
  if (values.some((value) => typeof value !== "number" || !Number.isFinite(value))) return null;
  if (held < 0 || attended < 0 || extra < 0 || attended > held) return null;
  const total = held + extra;
  if (total <= 0) return null;
  return round(((attended + extra) / total) * 100, 2);
}
