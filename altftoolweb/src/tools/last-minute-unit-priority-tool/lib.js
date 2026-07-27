/**
 * Last-minute unit priority tool.
 *
 * When study time before a paper is short, the rational order is by MARKS
 * RECOVERABLE PER HOUR — the classic greedy value-density heuristic used for
 * the fractional knapsack problem, where it is provably optimal when partial
 * study yields proportional marks:
 *   recoverable_i = paperMarks_i × (1 − readiness_i / 100)
 *   priority_i    = recoverable_i ÷ hoursNeeded_i
 * Units are sorted by priority and the available hours are allocated greedily:
 * top unit gets its full hours, then the next, until time runs out; the unit at
 * the cut-off gets a partial allocation. Expected gain from partial study is
 * assumed linear in hours (stated to the user as an assumption — real learning
 * curves are not perfectly linear, but the ranking itself does not depend on
 * that assumption).
 */

/** Readiness is a percentage of the unit already mastered. */
export const READINESS_MIN = 0;
export const READINESS_MAX = 100;

/** Sanity caps to catch typos, not real limits. */
export const MAX_UNITS = 30;
export const MAX_HOURS = 500;
export const MAX_UNIT_MARKS = 500;

/**
 * Rank units and allocate the available hours greedily.
 *
 * @param {object} input
 * @param {Array<{name: string, marks: number|string, readiness: number|string, hours: number|string}>} input.units
 *   marks     — marks this unit is worth in the paper.
 *   readiness — % of the unit already mastered.
 *   hours     — hours needed to take the unit to full readiness.
 * @param {number|string} input.hoursAvailable  Study hours left before the paper.
 * @returns {object} plan, or { error }.
 */
export function prioritizeUnits({ units, hoursAvailable }) {
  const budget = Number(hoursAvailable);
  if (!Number.isFinite(budget) || budget <= 0) {
    return { error: "Hours available must be a positive number." };
  }
  if (budget > MAX_HOURS) {
    return { error: `More than ${MAX_HOURS} hours is not last-minute — check the value.` };
  }

  if (!Array.isArray(units) || units.length === 0) {
    return { error: "Add at least one unit." };
  }
  if (units.length > MAX_UNITS) {
    return { error: `More than ${MAX_UNITS} units is not supported — remove some rows.` };
  }

  const rows = [];
  for (let index = 0; index < units.length; index += 1) {
    const unit = units[index];
    const name =
      typeof unit.name === "string" && unit.name.trim()
        ? unit.name.trim().replace(/\s+/g, " ")
        : `Unit ${index + 1}`;

    const marks = Number(unit.marks);
    const readiness = Number(unit.readiness);
    const hours = Number(unit.hours);

    if (!Number.isFinite(marks) || marks <= 0) {
      return { error: `"${name}": marks in the paper must be a positive number.` };
    }
    if (marks > MAX_UNIT_MARKS) {
      return { error: `"${name}": ${marks} marks for one unit looks like a typo.` };
    }
    if (!Number.isFinite(readiness) || readiness < READINESS_MIN || readiness > READINESS_MAX) {
      return { error: `"${name}": readiness must be between ${READINESS_MIN} and ${READINESS_MAX} percent.` };
    }
    if (!Number.isFinite(hours) || hours <= 0) {
      return { error: `"${name}": hours needed must be a positive number.` };
    }

    const recoverable = marks * (1 - readiness / 100);
    rows.push({
      name,
      marks,
      readiness,
      hours,
      recoverable,
      priority: recoverable / hours, // marks per hour
    });
  }

  // Highest marks-per-hour first; ties broken by bigger recoverable pool.
  rows.sort((a, b) => b.priority - a.priority || b.recoverable - a.recoverable);

  let remaining = budget;
  const plan = rows.map((row, index) => {
    const allocated = Math.min(row.hours, remaining);
    remaining = Math.max(0, remaining - allocated);
    const coverage = allocated <= 0 ? "skip" : allocated < row.hours ? "partial" : "full";
    // Linear-return assumption for partial coverage.
    const expectedGain = row.recoverable * (row.hours > 0 ? allocated / row.hours : 0);
    return {
      rank: index + 1,
      name: row.name,
      marks: row.marks,
      readiness: row.readiness,
      hoursNeeded: row.hours,
      recoverable: Number(row.recoverable.toFixed(1)),
      priority: Number(row.priority.toFixed(2)),
      allocatedHours: Number(allocated.toFixed(1)),
      coverage,
      expectedGain: Number(expectedGain.toFixed(1)),
    };
  });

  const totalRecoverable = rows.reduce((sum, row) => sum + row.recoverable, 0);
  const plannedGain = plan.reduce((sum, row) => sum + row.expectedGain, 0);
  const hoursNeededTotal = rows.reduce((sum, row) => sum + row.hours, 0);

  return {
    plan,
    hoursAvailable: budget,
    hoursUsed: Number(Math.min(budget, hoursNeededTotal).toFixed(1)),
    hoursNeededTotal: Number(hoursNeededTotal.toFixed(1)),
    totalRecoverable: Number(totalRecoverable.toFixed(1)),
    plannedGain: Number(plannedGain.toFixed(1)),
    /** Share of all recoverable marks the plan captures. */
    captureRatePercent:
      totalRecoverable > 0 ? Number(((plannedGain / totalRecoverable) * 100).toFixed(0)) : 100,
    fullyCovered: plan.filter((row) => row.coverage === "full").length,
    skipped: plan.filter((row) => row.coverage === "skip").length,
  };
}
