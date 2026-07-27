/**
 * Internal assessment (sessional) marks calculator.
 *
 * Indian universities award an internal/sessional component alongside the
 * external end-semester paper. The internal is assembled from weighted parts —
 * typically mid-term/class tests, assignments or tutorials, and attendance —
 * and scaled to the subject's internal maximum (commonly 25, 30, 40 or 50).
 *
 * The arithmetic is the universal weighted-percentage formula:
 *   contribution_i = (scored_i / max_i) × (weight_i / 100) × internalMax
 *   internal       = Σ contribution_i
 * where the weights must sum to 100%. Each university fixes its own split; the
 * presets below are common published splits, and every number is editable.
 */

/** Weights must sum to 100% within this tolerance (guards float drift). */
export const WEIGHT_SUM_TOLERANCE = 0.01;

/** Practical cap on the internal maximum — no scheme awards more than 100. */
export const INTERNAL_MAX_LIMIT = 100;

/**
 * Common internal-assessment splits published by universities. Purely example
 * presets — users edit them to match their own scheme's ordinance.
 */
export const PRESETS = [
  {
    id: "tests-assign-attendance",
    label: "Mid-terms 60% + assignments 25% + attendance 15%",
    internalMax: 30,
    components: [
      { name: "Mid-term tests (average)", scored: 32, max: 50, weight: 60 },
      { name: "Assignments / tutorials", scored: 18, max: 20, weight: 25 },
      { name: "Attendance", scored: 68, max: 80, weight: 15 },
    ],
  },
  {
    id: "equal-tests-assign",
    label: "Two tests 50% + assignments 50%",
    internalMax: 25,
    components: [
      { name: "Class tests (average)", scored: 30, max: 40, weight: 50 },
      { name: "Assignments", scored: 16, max: 20, weight: 50 },
    ],
  },
  {
    id: "cbcs-style",
    label: "Test 50% + seminar 30% + attendance 20%",
    internalMax: 40,
    components: [
      { name: "Internal test", scored: 35, max: 50, weight: 50 },
      { name: "Seminar / presentation", scored: 8, max: 10, weight: 30 },
      { name: "Attendance", scored: 55, max: 60, weight: 20 },
    ],
  },
];

/**
 * Compute internal marks from weighted components.
 *
 * @param {object} input
 * @param {Array<{name: string, scored: number|string, max: number|string, weight: number|string}>} input.components
 * @param {number|string} input.internalMax  The internal component's maximum marks.
 * @returns {object} result, or { error }.
 */
export function computeInternalMarks({ components, internalMax }) {
  const cap = Number(internalMax);
  if (!Number.isFinite(cap) || cap <= 0) {
    return { error: "Internal maximum must be a positive number (commonly 25, 30, 40 or 50)." };
  }
  if (cap > INTERNAL_MAX_LIMIT) {
    return { error: `Internal maximum above ${INTERNAL_MAX_LIMIT} is not a real scheme — check the value.` };
  }

  if (!Array.isArray(components) || components.length === 0) {
    return { error: "Add at least one assessment component." };
  }

  const rows = [];
  let weightSum = 0;

  for (let index = 0; index < components.length; index += 1) {
    const component = components[index];
    const name =
      typeof component.name === "string" && component.name.trim()
        ? component.name.trim().replace(/\s+/g, " ")
        : `Component ${index + 1}`;

    const scored = Number(component.scored);
    const max = Number(component.max);
    const weight = Number(component.weight);

    if (!Number.isFinite(max) || max <= 0) {
      return { error: `"${name}": maximum marks must be a positive number.` };
    }
    if (!Number.isFinite(scored) || scored < 0) {
      return { error: `"${name}": marks scored cannot be negative.` };
    }
    if (scored > max) {
      return { error: `"${name}": marks scored (${scored}) cannot exceed the maximum (${max}).` };
    }
    if (!Number.isFinite(weight) || weight < 0) {
      return { error: `"${name}": weight cannot be negative.` };
    }
    if (weight > 100) {
      return { error: `"${name}": weight cannot exceed 100%.` };
    }

    weightSum += weight;
    rows.push({ name, scored, max, weight, fraction: scored / max });
  }

  if (Math.abs(weightSum - 100) > WEIGHT_SUM_TOLERANCE) {
    return {
      error: `Component weights must add up to 100% — they currently add up to ${Number(weightSum.toFixed(2))}%.`,
    };
  }

  const breakdown = rows.map((row) => ({
    name: row.name,
    scored: row.scored,
    max: row.max,
    weight: row.weight,
    percent: Number((row.fraction * 100).toFixed(1)),
    // (scored/max) × (weight/100) × internalMax
    contribution: Number((row.fraction * (row.weight / 100) * cap).toFixed(2)),
    contributionMax: Number(((row.weight / 100) * cap).toFixed(2)),
  }));

  const rawTotal = rows.reduce(
    (sum, row) => sum + row.fraction * (row.weight / 100) * cap,
    0,
  );

  return {
    internalMax: cap,
    breakdown,
    /** Exact weighted total before any rounding. */
    rawTotal: Number(rawTotal.toFixed(2)),
    /** Universities normally record internals as whole marks (nearest integer). */
    roundedTotal: Math.round(rawTotal),
    percent: Number(((rawTotal / cap) * 100).toFixed(1)),
  };
}
