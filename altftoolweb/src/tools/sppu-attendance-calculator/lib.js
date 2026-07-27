/**
 * SPPU (Savitribai Phule Pune University) attendance maths.
 *
 * SPPU's rules — reflected in university circulars and the discipline conveyed
 * to affiliated colleges — require a minimum of 75% attendance in each subject
 * (theory and practical counted by the college) for a student to be sent up for
 * the university examinations; colleges publish defaulter lists each term and
 * may bar or penalise students below the line. This tool therefore checks each
 * subject against 75% and reports the "safe bunk" head-room per subject.
 *
 * Arithmetic used:
 *
 *   percentage = attended / held × 100
 *
 *   Safe bunks while staying at R% (missing the next n classes):
 *     attended / (held + n) ≥ R/100 → n ≤ (100 × attended / R) − held
 *
 *   Classes to attend consecutively to climb back to R%:
 *     (attended + n) / (held + n) ≥ R/100
 *       → n ≥ (R × held − 100 × attended) / (100 − R)
 *     Undefined at R = 100 — once a class is missed, 100% is unreachable.
 *
 * Pure module: no clock reads, no DOM, no randomness.
 */

/** SPPU minimum attendance per subject for the exam defaulter line. */
export const REQUIRED_PERCENT = 75;

/** Sanity ceiling on classes in one subject per term. */
export const MAX_CLASSES = 1000;

/** Sanity ceiling on subjects in one term. */
export const MAX_SUBJECTS = 20;

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round(Number((value * factor).toPrecision(12))) / factor;
}

/** Consecutive classes needed to reach the target %, or null when unreachable. */
export function classesToReach(held, attended, target = REQUIRED_PERCENT) {
  if (target >= 100) return attended === held ? 0 : null;
  const needed = (target * held - 100 * attended) / (100 - target);
  return Math.max(0, Math.ceil(round(needed, 6)));
}

/** Classes that can still be bunked while staying at the target %. */
export function safeBunks(held, attended, target = REQUIRED_PERCENT) {
  if (!(target > 0)) return null;
  const room = (100 * attended) / target - held;
  return Math.max(0, Math.floor(round(room, 6)));
}

/**
 * Attendance analysis for one SPPU subject.
 *
 * @param {object} input
 * @param {string} [input.name]
 * @param {number} input.held
 * @param {number} input.attended
 * @param {number} [input.required]
 * @returns {object} analysis, or { error }
 */
export function analyseSubject({ name = "Subject", held, attended, required = REQUIRED_PERCENT }) {
  if ([held, attended].some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: `${name}: enter both the lectures held and the lectures attended.` };
  }
  if (held < 0 || attended < 0) return { error: `${name}: counts cannot be negative.` };
  if (held === 0) return { error: `${name}: no lectures held yet, so there is no percentage.` };
  if (attended > held) {
    return { error: `${name}: attended (${attended}) is more than held (${held}).` };
  }
  if (held > MAX_CLASSES) {
    return { error: `${name}: ${held} lectures is beyond the ${MAX_CLASSES}-lecture limit.` };
  }

  const percent = round((attended / held) * 100, 2);
  const isSafe = percent >= required;

  return {
    name,
    held,
    attended,
    missed: held - attended,
    percent,
    isSafe,
    safeBunks: isSafe ? safeBunks(held, attended, required) : 0,
    needed: isSafe ? 0 : classesToReach(held, attended, required),
    shortagePercent: isSafe ? 0 : round(required - percent, 2),
  };
}

/**
 * Analysis of every subject plus the aggregate.
 *
 * @param {object} input
 * @param {Array<{name?: string, held: number, attended: number}>} input.subjects
 * @param {number} [input.required] Requirement %, defaults to 75.
 * @returns {object} { rows, aggregate, worst, defaulterCount } or { error }
 */
export function analyseTerm({ subjects, required = REQUIRED_PERCENT }) {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return { error: "Add at least one subject with its lecture counts." };
  }
  if (subjects.length > MAX_SUBJECTS) {
    return { error: `A term with more than ${MAX_SUBJECTS} subjects is not supported.` };
  }
  if (typeof required !== "number" || !Number.isFinite(required) || required <= 0 || required > 100) {
    return { error: "The attendance requirement must be between 1% and 100%." };
  }

  const rows = [];
  let totalHeld = 0;
  let totalAttended = 0;

  for (let i = 0; i < subjects.length; i += 1) {
    const row = analyseSubject({
      name: subjects[i]?.name || `Subject ${i + 1}`,
      held: Number(subjects[i]?.held),
      attended: Number(subjects[i]?.attended),
      required,
    });
    if (row.error) return { error: row.error };
    rows.push(row);
    totalHeld += row.held;
    totalAttended += row.attended;
  }

  const aggregatePercent = totalHeld > 0 ? round((totalAttended / totalHeld) * 100, 2) : 0;

  return {
    rows,
    required,
    aggregate: {
      held: totalHeld,
      attended: totalAttended,
      missed: totalHeld - totalAttended,
      percent: aggregatePercent,
      isSafe: aggregatePercent >= required,
    },
    worst: rows.reduce((low, row) => (!low || row.percent < low.percent ? row : low), null),
    defaulterCount: rows.filter((row) => !row.isSafe).length,
    totalSafeBunks: rows.reduce((sum, row) => sum + (row.safeBunks || 0), 0),
  };
}
