/**
 * AI Time Saved Calculator — before/after task-timing arithmetic:
 *
 *   saved per run    = before minutes − after minutes
 *   weekly saving    = saved per run × runs per week
 *   annual saving    = weekly saving × working weeks per year
 *   reduction %      = saved per run ÷ before minutes × 100
 *
 * This is the measurement approach productivity studies use (timed task pairs),
 * not a vendor multiplier: the numbers are only as good as the timings entered.
 */

/**
 * Default working weeks per year: 52 calendar weeks minus ~6 weeks of leave,
 * public holidays and sick days — a common full-time assumption. Adjustable.
 */
export const DEFAULT_WORK_WEEKS_PER_YEAR = 46;
export const MAX_WORK_WEEKS_PER_YEAR = 52;

export const MINUTES_PER_HOUR = 60;

/** A single run longer than 24h (1440 min) is almost certainly a data-entry mistake. */
export const MAX_TASK_MINUTES = 1440;

/** More than 200 runs/week of one task (~28/day) flags a data-entry mistake. */
export const MAX_RUNS_PER_WEEK = 200;

/**
 * Computes savings for a list of tasks:
 * tasks: [{ name, beforeMinutes, afterMinutes, runsPerWeek }]
 * Returns { taskResults, weeklyMinutes, weeklyHours, annualHours, ... } or { error }.
 */
export function computeTimeSaved({ tasks, workWeeksPerYear = DEFAULT_WORK_WEEKS_PER_YEAR }) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return { error: "Add at least one task with before and after timings." };
  }

  const weeks = Number(workWeeksPerYear);
  if (!Number.isFinite(weeks) || weeks < 1 || weeks > MAX_WORK_WEEKS_PER_YEAR) {
    return { error: `Working weeks per year must be between 1 and ${MAX_WORK_WEEKS_PER_YEAR}.` };
  }

  const taskResults = [];
  for (let i = 0; i < tasks.length; i += 1) {
    const t = tasks[i];
    const label = String(t.name ?? "").trim() || `Task ${i + 1}`;
    const before = Number(t.beforeMinutes);
    const after = Number(t.afterMinutes);
    const runs = Number(t.runsPerWeek);

    if (!Number.isFinite(before) || before <= 0 || before > MAX_TASK_MINUTES) {
      return { error: `${label}: "before" minutes must be between 1 and ${MAX_TASK_MINUTES}.` };
    }
    if (!Number.isFinite(after) || after < 0 || after > MAX_TASK_MINUTES) {
      return { error: `${label}: "after" minutes must be between 0 and ${MAX_TASK_MINUTES}.` };
    }
    if (!Number.isFinite(runs) || runs < 0 || runs > MAX_RUNS_PER_WEEK) {
      return { error: `${label}: runs per week must be between 0 and ${MAX_RUNS_PER_WEEK}.` };
    }

    const savedPerRun = before - after;
    const weeklySavedMinutes = savedPerRun * runs;
    taskResults.push({
      name: label,
      savedPerRun,
      weeklySavedMinutes,
      reductionPct: (savedPerRun / before) * 100,
      slower: savedPerRun < 0,
    });
  }

  const weeklyMinutes = taskResults.reduce((sum, t) => sum + t.weeklySavedMinutes, 0);
  const weeklyHours = weeklyMinutes / MINUTES_PER_HOUR;
  const annualHours = weeklyHours * weeks;

  return {
    taskResults,
    weeklyMinutes,
    weeklyHours,
    annualHours,
    workWeeksPerYear: weeks,
    /** Full 8-hour working days equivalent per year. */
    annualDaysEquivalent: annualHours / 8,
    anyTaskSlower: taskResults.some((t) => t.slower),
  };
}
