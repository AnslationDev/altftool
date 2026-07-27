/**
 * Unit test weightage calculator.
 *
 * Schools and colleges combine unit tests of different sizes into one subject
 * score by the standard WEIGHTED MEAN OF PERCENTAGES:
 *   finalFraction = Σ ( weight_i × scored_i / max_i ) ÷ Σ weight_i
 *   finalScore    = finalFraction × finalMax
 * Weights are relative, not percentages — e.g. UT1 weight 1, UT2 weight 1,
 * half-yearly weight 2 means the half-yearly counts double. Because the formula
 * normalises by Σ weight, the weights need not add to any particular number.
 * This is ordinary weighted-average arithmetic; each institution chooses its
 * own weights, so every number here is user-supplied.
 */

/** At least one test must carry positive weight for the mean to exist. */
export const MIN_TOTAL_WEIGHT = 0;

/** Sanity caps to catch typos, not real limits of the mathematics. */
export const MAX_TESTS = 30;
export const MAX_WEIGHT = 1000;
export const MAX_FINAL_SCALE = 1000;

/**
 * Combine unit tests into a final subject score.
 *
 * @param {object} input
 * @param {Array<{name: string, scored: number|string, max: number|string, weight: number|string}>} input.tests
 * @param {number|string} input.finalMax  Scale of the final score (e.g. 100, 50 or 20).
 * @returns {object} result, or { error }.
 */
export function computeWeightedScore({ tests, finalMax }) {
  const scale = Number(finalMax);
  if (!Number.isFinite(scale) || scale <= 0) {
    return { error: "Final score scale must be a positive number (commonly 100, 50 or 20)." };
  }
  if (scale > MAX_FINAL_SCALE) {
    return { error: `Final score scale above ${MAX_FINAL_SCALE} looks like a typo — check the value.` };
  }

  if (!Array.isArray(tests) || tests.length === 0) {
    return { error: "Add at least one unit test." };
  }
  if (tests.length > MAX_TESTS) {
    return { error: `More than ${MAX_TESTS} tests is not supported — remove some rows.` };
  }

  const rows = [];
  let weightSum = 0;
  let weightedFractionSum = 0;

  for (let index = 0; index < tests.length; index += 1) {
    const test = tests[index];
    const name =
      typeof test.name === "string" && test.name.trim()
        ? test.name.trim().replace(/\s+/g, " ")
        : `Test ${index + 1}`;

    const scored = Number(test.scored);
    const max = Number(test.max);
    const weight = Number(test.weight);

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
    if (weight > MAX_WEIGHT) {
      return { error: `"${name}": weight above ${MAX_WEIGHT} looks like a typo.` };
    }

    weightSum += weight;
    weightedFractionSum += weight * (scored / max);
    rows.push({ name, scored, max, weight, fraction: scored / max });
  }

  if (weightSum <= MIN_TOTAL_WEIGHT) {
    return { error: "At least one test must have a weight greater than zero." };
  }

  const finalFraction = weightedFractionSum / weightSum;

  const breakdown = rows.map((row) => ({
    name: row.name,
    scored: row.scored,
    max: row.max,
    weight: row.weight,
    percent: Number((row.fraction * 100).toFixed(1)),
    /** Share of the final score this test controls: weight_i / Σ weight. */
    effectiveWeightPercent: Number(((row.weight / weightSum) * 100).toFixed(1)),
    /** Marks this test contributes to the final score. */
    contribution: Number((row.fraction * (row.weight / weightSum) * scale).toFixed(2)),
  }));

  return {
    finalMax: scale,
    breakdown,
    totalWeight: Number(weightSum.toFixed(2)),
    finalScore: Number((finalFraction * scale).toFixed(2)),
    finalPercent: Number((finalFraction * 100).toFixed(1)),
    roundedFinalScore: Math.round(finalFraction * scale),
  };
}
