/**
 * Delhi University (DU) attendance maths.
 *
 * Under Delhi University's Ordinance VII, a student must attend at least
 * two-thirds of the lectures delivered in each course/paper (and the prescribed
 * share of tutorials and practicals) to be eligible for the semester
 * examination. The requirement is therefore the exact fraction 2/3 — usually
 * quoted as 66.67% — and colleges apply it per paper when certifying students.
 *
 * Because 2/3 is an exact ratio, every rule here is computed with integer
 * arithmetic and is exact — no floating point thresholds:
 *
 *   Eligible                     ⇔ 3 × attended ≥ 2 × held
 *
 *   Lectures that can still be missed while staying at 2/3:
 *     attended / (held + n) ≥ 2/3  ⇔  n ≤ (3 × attended − 2 × held) / 2
 *
 *   Lectures to attend consecutively to climb back to 2/3:
 *     (attended + n) / (held + n) ≥ 2/3  ⇔  n ≥ 2 × held − 3 × attended
 *
 * Pure module: no clock reads, no DOM, no randomness.
 */

/** Ordinance VII requirement: attend at least REQUIRED_NUM/REQUIRED_DEN of lectures. */
export const REQUIRED_NUM = 2;
export const REQUIRED_DEN = 3;

/** The same requirement expressed as a display percentage. */
export const REQUIRED_PERCENT_LABEL = "66.67%";

/** Sanity ceiling on lectures in one paper per semester. */
export const MAX_CLASSES = 1000;

/** Sanity ceiling on papers in one semester. */
export const MAX_PAPERS = 20;

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round(Number((value * factor).toPrecision(12))) / factor;
}

/** True when attended/held meets the two-thirds rule (exact integer test). */
export function isEligible(held, attended) {
  return REQUIRED_DEN * attended >= REQUIRED_NUM * held;
}

/**
 * Lectures that can still be missed while staying at two-thirds.
 * Exact: n ≤ (3 × attended − 2 × held) / 2, floored at 0.
 */
export function lecturesYouCanMiss(held, attended) {
  return Math.max(
    0,
    Math.floor((REQUIRED_DEN * attended - REQUIRED_NUM * held) / REQUIRED_NUM),
  );
}

/**
 * Lectures to attend consecutively to climb back to two-thirds.
 * Exact: n ≥ 2 × held − 3 × attended, floored at 0.
 */
export function lecturesToRecover(held, attended) {
  return Math.max(0, REQUIRED_NUM * held - REQUIRED_DEN * attended);
}

/**
 * Attendance analysis for one DU paper.
 *
 * @param {object} input
 * @param {string} [input.name]
 * @param {number} input.held     Lectures delivered so far.
 * @param {number} input.attended Lectures attended.
 * @returns {object} analysis, or { error }
 */
export function analysePaper({ name = "Paper", held, attended }) {
  if ([held, attended].some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: `${name}: enter both the lectures delivered and the lectures attended.` };
  }
  if (!Number.isInteger(held) || !Number.isInteger(attended)) {
    return { error: `${name}: lecture counts must be whole numbers.` };
  }
  if (held < 0 || attended < 0) return { error: `${name}: counts cannot be negative.` };
  if (held === 0) return { error: `${name}: no lectures delivered yet, so there is no percentage.` };
  if (attended > held) {
    return { error: `${name}: attended (${attended}) is more than delivered (${held}).` };
  }
  if (held > MAX_CLASSES) {
    return { error: `${name}: ${held} lectures is beyond the ${MAX_CLASSES}-lecture limit.` };
  }

  const eligible = isEligible(held, attended);

  return {
    name,
    held,
    attended,
    missed: held - attended,
    percent: round((attended / held) * 100, 2),
    eligible,
    canMiss: eligible ? lecturesYouCanMiss(held, attended) : 0,
    needed: eligible ? 0 : lecturesToRecover(held, attended),
  };
}

/**
 * Analysis of every paper plus the aggregate.
 *
 * @param {object} input
 * @param {Array<{name?: string, held: number, attended: number}>} input.papers
 * @returns {object} { rows, aggregate, worst, shortCount, totalCanMiss } or { error }
 */
export function analysePapers({ papers }) {
  if (!Array.isArray(papers) || papers.length === 0) {
    return { error: "Add at least one paper with its lecture counts." };
  }
  if (papers.length > MAX_PAPERS) {
    return { error: `A semester with more than ${MAX_PAPERS} papers is not supported.` };
  }

  const rows = [];
  let totalHeld = 0;
  let totalAttended = 0;

  for (let i = 0; i < papers.length; i += 1) {
    const row = analysePaper({
      name: papers[i]?.name || `Paper ${i + 1}`,
      held: Number(papers[i]?.held),
      attended: Number(papers[i]?.attended),
    });
    if (row.error) return { error: row.error };
    rows.push(row);
    totalHeld += row.held;
    totalAttended += row.attended;
  }

  const aggregatePercent = totalHeld > 0 ? round((totalAttended / totalHeld) * 100, 2) : 0;

  return {
    rows,
    aggregate: {
      held: totalHeld,
      attended: totalAttended,
      missed: totalHeld - totalAttended,
      percent: aggregatePercent,
      eligible: isEligible(totalHeld, totalAttended),
    },
    worst: rows.reduce((low, row) => (!low || row.percent < low.percent ? row : low), null),
    shortCount: rows.filter((row) => !row.eligible).length,
    totalCanMiss: rows.reduce((sum, row) => sum + row.canMiss, 0),
  };
}
