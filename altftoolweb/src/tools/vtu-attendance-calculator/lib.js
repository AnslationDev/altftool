/**
 * VTU (Visvesvaraya Technological University, Belagavi) attendance maths.
 *
 * VTU's academic regulations set the attendance requirement per course rather
 * than as an overall average: a student must have attended at least 85% of the
 * classes conducted in EACH course to be eligible for that course's
 * end-semester examination. Shortage in genuine cases — medical grounds,
 * university-approved participation in sport or cultural events — may be
 * considered for condonation down to 75% by the college and the university.
 * A course you are ineligible in has to be repeated even if the other courses
 * are comfortably above the line, which is why the per-course figure, not the
 * average, is the one to watch.
 *
 * Arithmetic used throughout:
 *
 *   percentage = attended / held × 100
 *
 *   Classes that must be attended consecutively to reach R%:
 *     (attended + n) / (held + n) ≥ R/100
 *       → n ≥ (R × held − 100 × attended) / (100 − R)
 *     Undefined at R = 100 — once a class is missed, 100% is unreachable.
 *
 *   Classes that can still be missed while holding R%:
 *     attended / (held + n) ≥ R/100
 *       → n ≤ (100 × attended / R) − held
 *
 * The aggregate row sums classes across courses. It is reported because
 * students find it useful, but it is NOT the figure VTU checks — a healthy
 * aggregate can hide one course that is below the line.
 */

/** VTU attendance requirement in each individual course. */
export const REQUIRED_PERCENT = 85;

/** Floor to which a genuine shortage may be considered for condonation. */
export const CONDONATION_FLOOR_PERCENT = 75;

/** Sanity ceiling on classes held in one course in one semester. */
export const MAX_CLASSES = 1000;

/** Sanity ceiling on the number of courses in one semester. */
export const MAX_SUBJECTS = 20;

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round(Number((value * factor).toPrecision(12))) / factor;
}

/**
 * Classes that must be attended consecutively to reach a target percentage.
 * @param {number} held
 * @param {number} attended
 * @param {number} target 0 – 100
 * @returns {number|null} count, or null when the target is unreachable
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
 * @param {number} target 0 – 100
 * @returns {number|null} count, or null when there is no minimum to protect
 */
export function classesYouCanMiss(held, attended, target) {
  if (typeof target !== "number" || !Number.isFinite(target) || target <= 0) return null;
  const room = (100 * attended) / target - held;
  return Math.max(0, Math.floor(round(room, 6)));
}

/**
 * Eligibility band for one course.
 * @param {number} percent
 * @param {number} required
 * @param {number} condonationFloor
 * @returns {{key: string, title: string}}
 */
export function statusFor(percent, required = REQUIRED_PERCENT, condonationFloor = CONDONATION_FLOOR_PERCENT) {
  if (percent >= required) return { key: "eligible", title: "Eligible" };
  if (percent >= condonationFloor) return { key: "condonable", title: "Short — condonation route" };
  return { key: "ineligible", title: "Ineligible" };
}

/**
 * Attendance analysis for one VTU course.
 * @param {object} input
 * @param {string} [input.name]
 * @param {number} input.held
 * @param {number} input.attended
 * @param {number} [input.required]
 * @param {number} [input.condonationFloor]
 * @returns {object} analysis, or { error }
 */
export function analyseSubject({
  name = "Course",
  held,
  attended,
  required = REQUIRED_PERCENT,
  condonationFloor = CONDONATION_FLOOR_PERCENT,
}) {
  if ([held, attended].some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: `${name}: enter both the classes held and the classes attended.` };
  }
  if (held < 0 || attended < 0) return { error: `${name}: class counts cannot be negative.` };
  if (held === 0) return { error: `${name}: no classes held yet, so there is no percentage.` };
  if (attended > held) {
    return { error: `${name}: attended (${attended}) is more than held (${held}).` };
  }
  if (held > MAX_CLASSES) {
    return { error: `${name}: ${held} classes is beyond the ${MAX_CLASSES}-class limit.` };
  }

  const percent = round((attended / held) * 100, 2);

  return {
    name,
    held,
    attended,
    missed: held - attended,
    percent,
    status: statusFor(percent, required, condonationFloor),
    needed: classesToReach(held, attended, required),
    neededForCondonation: classesToReach(held, attended, condonationFloor),
    canMiss: classesYouCanMiss(held, attended, required),
    canMissBeforeCondonationFloor: classesYouCanMiss(held, attended, condonationFloor),
  };
}

/**
 * Analysis of every course in the semester plus the aggregate.
 * @param {object} input
 * @param {Array<{name?: string, held: number, attended: number}>} input.subjects
 * @param {number} [input.required]
 * @param {number} [input.condonationFloor]
 * @returns {object} { rows, aggregate, worst, ineligibleCount } or { error }
 */
export function analyseSemester({
  subjects,
  required = REQUIRED_PERCENT,
  condonationFloor = CONDONATION_FLOOR_PERCENT,
}) {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return { error: "Add at least one course with its class counts." };
  }
  if (subjects.length > MAX_SUBJECTS) {
    return { error: `A semester with more than ${MAX_SUBJECTS} courses is not supported.` };
  }
  if (
    typeof required !== "number" ||
    !Number.isFinite(required) ||
    required <= 0 ||
    required > 100
  ) {
    return { error: "The attendance requirement must be between 1% and 100%." };
  }
  if (
    typeof condonationFloor !== "number" ||
    !Number.isFinite(condonationFloor) ||
    condonationFloor < 0 ||
    condonationFloor > required
  ) {
    return { error: "The condonation floor must be between 0% and the attendance requirement." };
  }

  const rows = [];
  let totalHeld = 0;
  let totalAttended = 0;

  for (let i = 0; i < subjects.length; i += 1) {
    const row = analyseSubject({
      name: subjects[i]?.name || `Course ${i + 1}`,
      held: Number(subjects[i]?.held),
      attended: Number(subjects[i]?.attended),
      required,
      condonationFloor,
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
    condonationFloor,
    aggregate: {
      held: totalHeld,
      attended: totalAttended,
      missed: totalHeld - totalAttended,
      percent: aggregatePercent,
      status: statusFor(aggregatePercent, required, condonationFloor),
    },
    worst: rows.reduce((low, row) => (!low || row.percent < low.percent ? row : low), null),
    ineligibleCount: rows.filter((row) => row.status.key !== "eligible").length,
    classesNeededTotal: rows.reduce((sum, row) => sum + (row.needed || 0), 0),
  };
}
