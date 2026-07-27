/**
 * Weekly review dashboard — goal grading, task completion and time variance.
 *
 * Goals are graded on the OKR 0.0-1.0 scale rather than a raw percentage, so a
 * stretch goal delivered 70% of the way reads as a success, not a failure.
 */

/**
 * Google's OKR guidance (re:Work, "Set goals with OKRs"): 0.6-0.7 is the
 * expected landing zone for an aspirational objective, consistently hitting 1.0
 * means the goals were not ambitious enough, and below 0.4 signals a real miss.
 */
export const OKR_ON_TARGET = 0.7;
export const OKR_SANDBAG_THRESHOLD = 0.9;
export const OKR_MISS_THRESHOLD = 0.4;

/** A goal scores at most 1.0 no matter how far past target it lands. */
export const OKR_MAX_SCORE = 1;

/** Weight range for how much a goal matters this week. */
export const MIN_WEIGHT = 1;
export const MAX_WEIGHT = 5;

/** Time spent more than this far above plan is flagged as an estimate problem. */
export const HOURS_VARIANCE_TOLERANCE_PERCENT = 25;

/** Guards so a runaway paste cannot freeze the tab. */
export const MAX_GOALS = 25;
export const MAX_TASKS = 200;

export const GRADE_BANDS = [
  { min: 0.9, label: "Delivered in full", note: "Consider whether next week's goals are ambitious enough." },
  { min: 0.7, label: "On target", note: "This is the OKR landing zone — keep the same level of stretch." },
  { min: 0.4, label: "Partial progress", note: "Movement, but something blocked the back half of the week." },
  { min: 0, label: "Missed", note: "Look at what got in the way before setting the same goal again." },
];

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Grade one goal on the 0.0-1.0 OKR scale.
 * @returns {{score:number, rawRatio:number}|{error:string}}
 */
export function scoreGoal({ target, actual } = {}) {
  const targetValue = toNumber(target);
  const actualValue = toNumber(actual);

  if (targetValue === null || actualValue === null) {
    return { error: "Target and actual must both be numbers." };
  }
  if (targetValue <= 0) {
    return { error: "A goal's target must be greater than zero." };
  }
  if (actualValue < 0) {
    return { error: "Actual progress cannot be negative." };
  }

  const rawRatio = actualValue / targetValue;
  return {
    rawRatio: Number(rawRatio.toFixed(3)),
    score: Number(Math.min(OKR_MAX_SCORE, rawRatio).toFixed(3)),
  };
}

export function gradeFor(score) {
  return GRADE_BANDS.find((band) => score >= band.min) ?? GRADE_BANDS[GRADE_BANDS.length - 1];
}

/**
 * Grade a whole week.
 * @param {{goals:Array, tasks:Array, plannedHours:number, actualHours:number,
 *          previousScore:number|null}} input
 * @returns {object|{error:string}}
 */
export function reviewWeek({
  goals = [],
  tasks = [],
  plannedHours = 0,
  actualHours = 0,
  previousScore = null,
} = {}) {
  if (!Array.isArray(goals)) return { error: "Goals must be a list." };
  if (goals.length === 0) return { error: "Add at least one goal to review the week." };
  if (goals.length > MAX_GOALS) {
    return { error: `That is ${goals.length} goals. The limit is ${MAX_GOALS} per week.` };
  }
  if (!Array.isArray(tasks)) return { error: "Tasks must be a list." };
  if (tasks.length > MAX_TASKS) {
    return { error: `That is ${tasks.length} tasks. The limit is ${MAX_TASKS} per week.` };
  }

  const planned = toNumber(plannedHours);
  const actual = toNumber(actualHours);
  if (planned === null || actual === null) return { error: "Planned and actual hours must be numbers." };
  if (planned < 0 || actual < 0) return { error: "Hours cannot be negative." };

  const byGoal = [];
  for (const goal of goals) {
    const title = String(goal?.title ?? "").trim() || "Untitled goal";
    const graded = scoreGoal({ target: goal?.target, actual: goal?.actual });
    if (graded.error) return { error: `"${title}": ${graded.error}` };

    const rawWeight = toNumber(goal?.weight);
    const weight = rawWeight === null ? MIN_WEIGHT : Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, rawWeight));

    byGoal.push({
      id: goal?.id ?? title,
      title,
      target: Number(goal.target),
      actual: Number(goal.actual),
      unit: String(goal?.unit ?? "").trim(),
      weight,
      score: graded.score,
      rawRatio: graded.rawRatio,
      percent: Number((graded.score * 100).toFixed(1)),
      grade: gradeFor(graded.score).label,
    });
  }

  const weightTotal = byGoal.reduce((sum, goal) => sum + goal.weight, 0);
  // weightTotal cannot be zero: every weight is clamped to at least MIN_WEIGHT.
  const overallScore = Number(
    (byGoal.reduce((sum, goal) => sum + goal.score * goal.weight, 0) / weightTotal).toFixed(3)
  );
  const band = gradeFor(overallScore);

  const doneTasks = tasks.filter((task) => task?.done).length;
  const carriedTasks = tasks.filter((task) => !task?.done && task?.carriedOver).length;
  const taskCompletion = tasks.length > 0
    ? Number(((doneTasks / tasks.length) * 100).toFixed(1))
    : 0;

  const hoursVariance = actual - planned;
  const hoursVariancePercent = planned > 0
    ? Number(((hoursVariance / planned) * 100).toFixed(1))
    : null;

  const previous = toNumber(previousScore);
  const trend = previous === null ? null : Number((overallScore - previous).toFixed(3));

  const warnings = [];
  for (const goal of byGoal) {
    if (goal.score < OKR_MISS_THRESHOLD) {
      warnings.push(`"${goal.title}" landed at ${goal.percent}% — below the 40% miss line.`);
    }
  }
  if (overallScore >= OKR_SANDBAG_THRESHOLD) {
    warnings.push(
      `Every goal came in at or near 100%. On the OKR scale that usually means the targets were too safe — stretch them next week.`
    );
  }
  if (
    hoursVariancePercent !== null &&
    hoursVariancePercent > HOURS_VARIANCE_TOLERANCE_PERCENT
  ) {
    warnings.push(
      `You spent ${hoursVariance.toFixed(1)}h more than planned (${hoursVariancePercent}% over) — the estimates need adjusting.`
    );
  }
  if (carriedTasks > 0) {
    warnings.push(`${carriedTasks} task(s) have now rolled over more than once.`);
  }
  if (tasks.length > 0 && taskCompletion < 50) {
    warnings.push(`Only ${taskCompletion}% of tasks closed — the list may be larger than the week.`);
  }

  return {
    overallScore,
    overallPercent: Number((overallScore * 100).toFixed(1)),
    grade: band.label,
    gradeNote: band.note,
    onTarget: overallScore >= OKR_ON_TARGET,
    trend,
    byGoal: byGoal.sort((a, b) => b.weight - a.weight || b.score - a.score),
    goalCount: byGoal.length,
    taskCount: tasks.length,
    doneTasks,
    carriedTasks,
    taskCompletion,
    plannedHours: planned,
    actualHours: actual,
    hoursVariance: Number(hoursVariance.toFixed(1)),
    hoursVariancePercent,
    warnings,
  };
}

/** Markdown summary for pasting into a journal, a standup or a manager update. */
export function buildSummary({ weekLabel = "This week", wins = "", blockers = "", nextWeek = "", review } = {}) {
  if (!review || review.error) return { error: review?.error || "Nothing to summarise yet." };

  const lines = [
    `# Weekly review — ${weekLabel}`,
    ``,
    `**Score ${review.overallPercent}% (${review.overallScore.toFixed(2)} on the OKR scale) — ${review.grade}**`,
    review.trend === null
      ? null
      : `Trend vs last week: ${review.trend >= 0 ? "+" : ""}${(review.trend * 100).toFixed(1)} points`,
    ``,
    `## Goals`,
    ``,
    `| Goal | Target | Actual | Weight | Score |`,
    `| --- | --- | --- | --- | --- |`,
  ].filter((line) => line !== null);

  for (const goal of review.byGoal) {
    lines.push(
      `| ${goal.title} | ${goal.target}${goal.unit ? ` ${goal.unit}` : ""} | ${goal.actual}${goal.unit ? ` ${goal.unit}` : ""} | ${goal.weight} | ${goal.score.toFixed(2)} |`
    );
  }

  lines.push(
    ``,
    `## Tasks and time`,
    ``,
    `- Tasks closed: ${review.doneTasks} of ${review.taskCount} (${review.taskCompletion}%)`,
    `- Rolled over again: ${review.carriedTasks}`,
    `- Hours: ${review.actualHours} actual vs ${review.plannedHours} planned (${review.hoursVariance >= 0 ? "+" : ""}${review.hoursVariance}h)`,
    ``,
    `## Reflection`,
    ``,
    `**What worked:** ${wins || "(not filled in)"}`,
    ``,
    `**What blocked me:** ${blockers || "(not filled in)"}`,
    ``,
    `**Focus next week:** ${nextWeek || "(not filled in)"}`
  );

  if (review.warnings.length) {
    lines.push(``, `## Flags`, ``);
    for (const warning of review.warnings) lines.push(`- ${warning}`);
  }

  return { text: lines.join("\n") };
}
