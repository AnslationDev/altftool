/**
 * Rubric Prompt Builder — assembles a prompt that asks an AI assistant to write
 * an analytic grading rubric: weighted criteria in rows, performance levels in
 * columns, with observable descriptors in every cell.
 *
 * Criterion weights (percentages summing to 100) are converted into whole point
 * maxima with the largest-remainder (Hare quota) method, so per-criterion points
 * always sum exactly to the assignment's total points.
 */

/**
 * Standard performance-level scales. The names follow common analytic-rubric
 * practice in education (e.g. AAC&U VALUE rubrics use a 4-level scale;
 * 3- and 5-level scales are the other widely used variants).
 */
export const LEVEL_PRESETS = [
  { id: "3", count: 3, labels: ["Exceeds expectations", "Meets expectations", "Below expectations"] },
  { id: "4", count: 4, labels: ["Exemplary", "Proficient", "Developing", "Beginning"] },
  { id: "5", count: 5, labels: ["Exceptional", "Strong", "Satisfactory", "Emerging", "Insufficient"] },
];

/** Practical bounds so the rubric stays usable on one page. */
export const MIN_CRITERIA = 2; // one criterion is a holistic rubric, not analytic
export const MAX_CRITERIA = 10; // rubrics beyond ~10 rows become unusable for graders
export const MIN_TOTAL_POINTS = 4; // need at least one point step per level
export const MAX_TOTAL_POINTS = 1000;
export const PERCENT_TOTAL = 100; // criterion weights must be a complete percentage split

/**
 * Largest-remainder apportionment: split `total` whole points across
 * percentage `shares` so the parts always sum to `total`.
 * Ties in fractional remainder go to the earlier share for determinism.
 */
export function apportionByLargestRemainder(total, shares) {
  const quotas = shares.map((share) => (total * share) / PERCENT_TOTAL);
  const counts = quotas.map((quota) => Math.floor(quota));
  let leftover = total - counts.reduce((sum, count) => sum + count, 0);
  const order = quotas
    .map((quota, index) => ({ index, frac: quota - Math.floor(quota) }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index);
  for (let i = 0; leftover > 0 && i < order.length; i += 1) {
    counts[order[i].index] += 1;
    leftover -= 1;
  }
  return counts;
}

/**
 * Build the rubric-generation prompt.
 *
 * @param {object} input
 * @param {string} input.assignment       What is being graded (essay, lab report...).
 * @param {string} [input.audience]       Course / grade level (optional).
 * @param {number} input.totalPoints      Whole points the rubric is out of.
 * @param {string} input.levelPresetId    Id from LEVEL_PRESETS ("3" | "4" | "5").
 * @param {Array<{name: string, weight: number}>} input.criteria Criterion rows.
 * @param {boolean} [input.includeFeedbackLine] Ask for a feedback sentence per criterion.
 * @returns {object} { prompt, criteriaPoints, totalPoints, levelLabels } or { error }.
 */
export function buildRubricPrompt({
  assignment,
  audience = "",
  totalPoints,
  levelPresetId,
  criteria,
  includeFeedbackLine = true,
}) {
  const cleanAssignment = typeof assignment === "string" ? assignment.trim() : "";
  if (!cleanAssignment) return { error: "Describe the assignment the rubric will grade." };

  const preset = LEVEL_PRESETS.find((option) => option.id === String(levelPresetId));
  if (!preset) return { error: "Choose how many performance levels the rubric should have." };

  const points = Number(totalPoints);
  if (!Number.isInteger(points) || points < MIN_TOTAL_POINTS || points > MAX_TOTAL_POINTS) {
    return {
      error: `Total points must be a whole number between ${MIN_TOTAL_POINTS} and ${MAX_TOTAL_POINTS}.`,
    };
  }

  if (!Array.isArray(criteria)) return { error: "Add at least two grading criteria." };
  const rows = criteria
    .map((row) => ({
      name: typeof row?.name === "string" ? row.name.trim() : "",
      weight: Number(row?.weight),
    }))
    .filter((row) => row.name !== "" || Number.isFinite(row.weight));

  if (rows.length < MIN_CRITERIA || rows.length > MAX_CRITERIA) {
    return { error: `Use between ${MIN_CRITERIA} and ${MAX_CRITERIA} criteria.` };
  }
  for (const row of rows) {
    if (!row.name) return { error: "Every criterion needs a name." };
    if (!Number.isFinite(row.weight) || row.weight <= 0) {
      return { error: `Criterion "${row.name}" needs a weight above 0%.` };
    }
  }
  const weightSum = rows.reduce((sum, row) => sum + row.weight, 0);
  if (Math.round(weightSum) !== PERCENT_TOTAL) {
    return {
      error: `Criterion weights must add up to ${PERCENT_TOTAL}% — they currently add up to ${weightSum}%.`,
    };
  }

  const pointsPerCriterion = apportionByLargestRemainder(
    points,
    rows.map((row) => row.weight),
  );
  const criteriaPoints = rows.map((row, index) => ({
    name: row.name,
    weight: row.weight,
    maxPoints: pointsPerCriterion[index],
  }));

  const lines = [];
  lines.push(
    "You are an experienced educator designing a fair, transparent analytic grading rubric.",
  );
  lines.push("");
  lines.push(`Create a grading rubric for: ${cleanAssignment}.`);
  if (audience.trim()) lines.push(`Course / level: ${audience.trim()}.`);
  lines.push(`The rubric is scored out of ${points} points in total.`);
  lines.push("");
  lines.push(
    `Use exactly ${preset.count} performance levels as columns, in this order: ${preset.labels.join(", ")}.`,
  );
  lines.push("");
  lines.push("Criteria (rows) with fixed maximum points — do not change these numbers:");
  for (const row of criteriaPoints) {
    lines.push(`- ${row.name}: ${row.maxPoints} points (${row.weight}% of the grade)`);
  }
  lines.push("");
  lines.push("Rules for the rubric:");
  lines.push(
    "- Present it as a table: one row per criterion, one column per performance level, plus a points column.",
  );
  lines.push(
    "- In each cell, write 1-2 sentences describing observable, measurable evidence — what the work shows, not vague adjectives like \"good\" or \"poor\".",
  );
  lines.push(
    "- For each criterion, give every performance level a point range; ranges must not overlap and the top level's maximum must equal the criterion's maximum points.",
  );
  lines.push("- Descriptors at adjacent levels must differ on the same dimensions so graders can place work consistently.");
  lines.push("- Avoid penalising style preferences that are not part of the stated criteria.");
  if (includeFeedbackLine) {
    lines.push(
      "- After the table, add a short \"Feedback starters\" list: one sentence stem per criterion a grader can complete when returning work.",
    );
  }

  return {
    prompt: lines.join("\n"),
    criteriaPoints,
    totalPoints: points,
    levelLabels: preset.labels,
    criteriaCount: rows.length,
  };
}
