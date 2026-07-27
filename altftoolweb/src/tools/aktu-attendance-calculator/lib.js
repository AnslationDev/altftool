/**
 * AKTU (Dr. A.P.J. Abdul Kalam Technical University, Lucknow) attendance maths.
 *
 * AKTU's ordinances require a minimum of 75% attendance in the semester to be
 * eligible for the end-semester (carry-over eligible) examinations; a limited
 * relaxation on medical or similar genuine grounds may be granted by the
 * university/institute authorities, but it is discretionary and documented —
 * so 75% is the line every student should plan around.
 *
 * Arithmetic used:
 *
 *   percentage = attended / held × 100
 *
 *   Shortage in classes (how many of the classes already held you are short):
 *     shortage = max(0, ceil(R/100 × held) − attended)
 *
 *   Consecutive classes to recover to R%:
 *     (attended + n) / (held + n) ≥ R/100
 *       → n ≥ (R × held − 100 × attended) / (100 − R)
 *     Undefined at R = 100 — once one class is missed, 100% is unreachable.
 *
 *   Classes that can still be missed while holding R%:
 *     attended / (held + n) ≥ R/100 → n ≤ (100 × attended / R) − held
 *
 *   With F future classes left in the semester, the best final percentage is
 *   (attended + F) / (held + F); the most future classes that can be missed
 *   while ending at R% is m ≤ attended + F − R/100 × (held + F).
 *
 * Pure module: no clock reads, no DOM, no randomness.
 */

/** AKTU ordinance minimum attendance for end-semester exam eligibility. */
export const REQUIRED_PERCENT = 75;

/** Sanity ceiling on classes in one semester. */
export const MAX_CLASSES = 2000;

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round(Number((value * factor).toPrecision(12))) / factor;
}

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return NaN;
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

/** Consecutive classes needed to reach target %, or null when unreachable. */
export function classesToReach(held, attended, target = REQUIRED_PERCENT) {
  if (target >= 100) return attended === held ? 0 : null;
  const needed = (target * held - 100 * attended) / (100 - target);
  return Math.max(0, Math.ceil(round(needed, 6)));
}

/** Classes that can still be missed right now while staying at target %. */
export function classesYouCanMiss(held, attended, target = REQUIRED_PERCENT) {
  if (!(target > 0)) return null;
  const room = (100 * attended) / target - held;
  return Math.max(0, Math.floor(round(room, 6)));
}

/**
 * Full AKTU attendance analysis.
 *
 * @param {object} input
 * @param {number|string} input.held      Classes held so far.
 * @param {number|string} input.attended  Classes attended so far.
 * @param {number|string} [input.remaining] Classes still to be held this semester (optional).
 * @param {number|string} [input.required]  Requirement %, defaults to 75.
 * @returns {object} analysis, or { error }
 */
export function computeAktuAttendance({ held, attended, remaining = 0, required = REQUIRED_PERCENT }) {
  const heldN = toNumber(held);
  const attendedN = toNumber(attended);
  const remainingN = remaining === "" || remaining === null || remaining === undefined ? 0 : toNumber(remaining);
  const requiredN = toNumber(required);

  if (Number.isNaN(heldN) || Number.isNaN(attendedN)) {
    return { error: "Enter both the classes held and the classes attended." };
  }
  if (heldN < 0 || attendedN < 0) return { error: "Class counts cannot be negative." };
  if (heldN === 0) return { error: "No classes held yet, so there is no percentage to check." };
  if (attendedN > heldN) {
    return { error: `Attended (${attendedN}) cannot be more than held (${heldN}).` };
  }
  if (heldN > MAX_CLASSES) {
    return { error: `${heldN} classes is beyond the ${MAX_CLASSES}-class sanity limit.` };
  }
  if (Number.isNaN(remainingN) || remainingN < 0) {
    return { error: "Remaining classes cannot be negative." };
  }
  if (remainingN > MAX_CLASSES) {
    return { error: `${remainingN} remaining classes is beyond the ${MAX_CLASSES}-class sanity limit.` };
  }
  if (Number.isNaN(requiredN) || requiredN <= 0 || requiredN > 100) {
    return { error: "The attendance requirement must be between 1% and 100%." };
  }

  const percent = round((attendedN / heldN) * 100, 2);
  const isShort = percent < requiredN;

  // Of the classes already held, how many attendances short of the line you are.
  const shortageClasses = Math.max(0, Math.ceil(round((requiredN / 100) * heldN, 6)) - attendedN);

  const needed = classesToReach(heldN, attendedN, requiredN);
  const canMiss = classesYouCanMiss(heldN, attendedN, requiredN);

  // Projection over the rest of the semester.
  const finalHeld = heldN + remainingN;
  const bestFinalPercent = round(((attendedN + remainingN) / finalHeld) * 100, 2);
  const recoverable = bestFinalPercent >= requiredN;
  // Future classes that can be skipped while still ending the semester at the line.
  const futureCanMiss = Math.max(
    0,
    Math.floor(round(attendedN + remainingN - (requiredN / 100) * finalHeld, 6)),
  );

  return {
    held: heldN,
    attended: attendedN,
    missed: heldN - attendedN,
    remaining: remainingN,
    required: requiredN,
    percent,
    isShort,
    shortagePercent: isShort ? round(requiredN - percent, 2) : 0,
    shortageClasses: isShort ? shortageClasses : 0,
    needed,
    canMiss: isShort ? 0 : canMiss,
    bestFinalPercent: remainingN > 0 ? bestFinalPercent : null,
    recoverable: remainingN > 0 ? recoverable : null,
    futureCanMiss: remainingN > 0 ? futureCanMiss : null,
  };
}
