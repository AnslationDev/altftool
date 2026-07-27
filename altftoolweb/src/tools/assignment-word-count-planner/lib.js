/**
 * Assignment word-count planning.
 *
 * The weighting defaults follow the structure taught in most university academic
 * writing guides (e.g. the widely used "10% introduction, 80% body, 10% conclusion"
 * rule of thumb for essays and reports). Weights are user-editable; the planner
 * allocates the total budget proportionally to the weights entered.
 */

/**
 * Common academic guidance: introduction ~10%, conclusion ~10%, body ~80%.
 * The body is split into three main points by default.
 */
export const DEFAULT_SECTIONS = [
  { name: "Introduction", weight: 10, written: 0 },
  { name: "Main point 1", weight: 27, written: 0 },
  { name: "Main point 2", weight: 27, written: 0 },
  { name: "Main point 3", weight: 26, written: 0 },
  { name: "Conclusion", weight: 10, written: 0 },
];

/**
 * Most universities allow a tolerance of +/-10% on the stated word limit before
 * penalties apply. Purely a convention shown as guidance, not a statutory rule.
 */
export const TYPICAL_TOLERANCE_PERCENT = 10;

/** Cap to keep arithmetic sane; no real assignment exceeds this. */
export const MAX_TOTAL_WORDS = 1000000;

/**
 * Allocate integer word targets that sum exactly to totalWords using the
 * largest-remainder (Hamilton) method over the section weights.
 *
 * @param {object} input
 * @param {number} input.totalWords  Total word budget for the assignment.
 * @param {Array<{name: string, weight: number, written: number}>} input.sections
 * @returns {object} plan or { error }
 */
export function computeWordPlan({ totalWords, sections }) {
  const total = Number(totalWords);
  if (!Number.isFinite(total) || total <= 0) {
    return { error: "Enter a total word budget greater than zero." };
  }
  if (total > MAX_TOTAL_WORDS) {
    return { error: "Word budget is unrealistically large — enter a smaller number." };
  }
  if (!Array.isArray(sections) || sections.length === 0) {
    return { error: "Add at least one section to plan." };
  }

  const cleaned = sections.map((section, index) => ({
    name:
      typeof section.name === "string" && section.name.trim() !== ""
        ? section.name.trim()
        : `Section ${index + 1}`,
    weight: section.weight === undefined || section.weight === "" ? 0 : Number(section.weight),
    written: section.written === undefined || section.written === "" ? 0 : Number(section.written),
  }));

  for (const section of cleaned) {
    if (!Number.isFinite(section.weight) || section.weight < 0) {
      return { error: `Weight for "${section.name}" must be zero or a positive number.` };
    }
    if (!Number.isFinite(section.written) || section.written < 0) {
      return { error: `Words written for "${section.name}" must be zero or more.` };
    }
  }

  const weightSum = cleaned.reduce((sum, section) => sum + section.weight, 0);
  if (weightSum <= 0) {
    return { error: "At least one section needs a weight greater than zero." };
  }

  // Largest-remainder allocation so integer targets sum exactly to the budget.
  const raw = cleaned.map((section) => (total * section.weight) / weightSum);
  const floors = raw.map(Math.floor);
  let shortfall = Math.round(total) - floors.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  const targets = floors.slice();
  for (let i = 0; i < order.length && shortfall > 0; i += 1) {
    targets[order[i].index] += 1;
    shortfall -= 1;
  }

  const rows = cleaned.map((section, index) => {
    const target = targets[index];
    const remaining = Math.max(0, target - section.written);
    const over = Math.max(0, section.written - target);
    const progressPercent =
      target > 0 ? Math.min(999, (section.written / target) * 100) : section.written > 0 ? 100 : 0;
    return {
      name: section.name,
      weight: section.weight,
      sharePercent: (section.weight / weightSum) * 100,
      target,
      written: section.written,
      remaining,
      over,
      progressPercent,
      done: section.written >= target && target > 0,
    };
  });

  const totalWritten = rows.reduce((sum, row) => sum + row.written, 0);
  const totalRemaining = Math.max(0, Math.round(total) - totalWritten);
  const tolerance = Math.round((Math.round(total) * TYPICAL_TOLERANCE_PERCENT) / 100);

  return {
    totalWords: Math.round(total),
    weightSum,
    weightsSumTo100: Math.abs(weightSum - 100) < 1e-9,
    rows,
    totalWritten,
    totalRemaining,
    overallProgressPercent: Math.min(999, (totalWritten / Math.round(total)) * 100),
    toleranceWords: tolerance,
    lowerBound: Math.round(total) - tolerance,
    upperBound: Math.round(total) + tolerance,
  };
}
