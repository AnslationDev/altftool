/**
 * Test coverage target calculator.
 *
 * Every coverage tool — Istanbul/nyc, JaCoCo, coverage.py, go tool cover,
 * SimpleCov — reports the same ratio for whichever unit it counts:
 *
 *   coverage % = covered items / total items x 100
 *
 * where an "item" is a line, a branch, a statement or a function depending on
 * the metric. Because items are whole things, a percentage threshold has to be
 * turned back into a whole number before it means anything:
 *
 *   items you must have covered = ceil(total x target / 100)
 *   items still to cover        = max(0, that number - already covered)
 *
 * Ceiling, not round: a gate configured at 80% fails at 79.99%, so covering
 * one item fewer than the ceiling still fails the build.
 *
 * The same arithmetic answers the two questions that follow: how well the code
 * in this pull request has to be covered for the overall number to reach the
 * gate, and how much slack you have before adding untested code breaks it.
 */

/** Guard against binary floating point turning 160.0 into 160.00000000000003. */
const EPSILON = 1e-9;

export const METRICS = [
  { id: "lines", label: "Lines", unit: "line" },
  { id: "branches", label: "Branches", unit: "branch" },
  { id: "statements", label: "Statements", unit: "statement" },
  { id: "functions", label: "Functions", unit: "function" },
];

export const MINUTES_PER_HOUR = 60;

/** Smallest whole number of items that satisfies a percentage gate. */
export function itemsRequiredFor(total, targetPercent) {
  return Math.ceil((total * targetPercent) / 100 - EPSILON);
}

function validate({ total, covered, targetPercent }) {
  const values = [total, covered, targetPercent].map(Number);
  if (values.some((value) => !Number.isFinite(value))) {
    return "Enter numbers for the total, the covered count and the target percentage.";
  }
  const [totalItems, coveredItems, target] = values;
  if (totalItems <= 0) return "The total has to be at least 1 — take it from your coverage report.";
  if (coveredItems < 0) return "Covered items cannot be negative.";
  if (coveredItems > totalItems) return "Covered items cannot exceed the total the report counts.";
  if (target < 0 || target > 100) return "A coverage target has to sit between 0% and 100%.";
  return null;
}

/**
 * How far the current report is from a threshold.
 *
 * @param {object} input
 * @param {number} input.total          items the report counts
 * @param {number} input.covered        items already covered
 * @param {number} input.targetPercent  the gate, e.g. 80
 */
export function coverageGap({ total, covered, targetPercent } = {}) {
  const error = validate({ total, covered, targetPercent });
  if (error) return { error };

  const totalItems = Number(total);
  const coveredItems = Number(covered);
  const target = Number(targetPercent);

  const currentPercent = (coveredItems / totalItems) * 100;
  const required = Math.min(totalItems, itemsRequiredFor(totalItems, target));
  const toCover = Math.max(0, required - coveredItems);
  const surplus = Math.max(0, coveredItems - required);
  const uncovered = totalItems - coveredItems;
  const allowedUncovered = totalItems - required;

  // If you are already above the gate, how many untested items can be added
  // before the ratio drops below it: covered / (total + k) >= target/100.
  const uncoveredBudget =
    target > 0 ? Math.max(0, Math.floor((coveredItems * 100) / target - totalItems + EPSILON)) : Infinity;

  return {
    total: totalItems,
    covered: coveredItems,
    target,
    currentPercent,
    required,
    toCover,
    surplus,
    uncovered,
    allowedUncovered,
    meetsTarget: coveredItems >= required,
    uncoveredBudget: Number.isFinite(uncoveredBudget) ? uncoveredBudget : null,
    percentAfter: ((coveredItems + toCover) / totalItems) * 100,
  };
}

/**
 * What the code you are about to add has to achieve.
 *
 * Adding `newItems` items grows the denominator, so the ceiling moves too:
 *
 *   required after = ceil((total + new) x target / 100)
 *   new items to cover = required after - already covered
 *
 * If that exceeds the number of new items, the target cannot be reached by
 * covering the new code alone and some existing code has to be covered as well.
 */
export function newCodeRequirement({ total, covered, targetPercent, newItems } = {}) {
  const error = validate({ total, covered, targetPercent });
  if (error) return { error };

  const added = Number(newItems);
  if (!Number.isFinite(added)) return { error: "Enter how many new items this change adds." };
  if (added < 0) return { error: "New items cannot be negative." };

  const totalItems = Number(total);
  const coveredItems = Number(covered);
  const target = Number(targetPercent);

  const totalAfter = totalItems + added;
  const requiredAfter = Math.min(totalAfter, itemsRequiredFor(totalAfter, target));
  const needFromAnywhere = Math.max(0, requiredAfter - coveredItems);
  const fromNewCode = Math.min(added, needFromAnywhere);
  const fromExistingCode = Math.max(0, needFromAnywhere - added);
  const newCodeCoverageNeeded = added > 0 ? (fromNewCode / added) * 100 : 0;
  const bestCasePercent = ((coveredItems + added) / totalAfter) * 100;

  return {
    totalAfter,
    requiredAfter,
    needFromAnywhere,
    fromNewCode,
    fromExistingCode,
    newCodeCoverageNeeded,
    bestCasePercent,
    reachableWithNewCodeAlone: fromExistingCode === 0,
    percentIfNewCodeUntested: (coveredItems / totalAfter) * 100,
  };
}

/**
 * A ratchet: raise the gate in equal percentage-point steps instead of one jump.
 * Returns one row per step with the whole-number count that step demands.
 */
export function ratchetPlan({ total, covered, targetPercent, steps } = {}) {
  const error = validate({ total, covered, targetPercent });
  if (error) return { error };

  const stepCount = Number(steps);
  if (!Number.isFinite(stepCount)) return { error: "Enter how many sprints the ratchet runs for." };
  if (stepCount < 1 || stepCount > 52) return { error: "Use between 1 and 52 steps." };

  const totalItems = Number(total);
  const coveredItems = Number(covered);
  const target = Number(targetPercent);
  const currentPercent = (coveredItems / totalItems) * 100;

  if (currentPercent >= target) {
    return { rows: [], alreadyThere: true, currentPercent, target, perStepPoints: 0 };
  }

  const whole = Math.floor(stepCount);
  const perStepPoints = (target - currentPercent) / whole;
  const rows = [];
  let previousRequired = coveredItems;

  for (let step = 1; step <= whole; step += 1) {
    const gate = step === whole ? target : currentPercent + perStepPoints * step;
    const required = Math.min(totalItems, itemsRequiredFor(totalItems, gate));
    rows.push({
      step,
      gatePercent: gate,
      requiredCovered: required,
      itemsThisStep: Math.max(0, required - previousRequired),
    });
    previousRequired = required;
  }

  return { rows, alreadyThere: false, currentPercent, target, perStepPoints };
}

/**
 * Rough effort for the backlog: items x minutes each.
 * The minutes figure is yours — measure a few real cases rather than guessing.
 */
export function effortEstimate({ items, minutesPerItem } = {}) {
  const count = Number(items);
  const minutes = Number(minutesPerItem);
  if (!Number.isFinite(count) || !Number.isFinite(minutes)) {
    return { error: "Enter a whole number of items and the minutes each one takes." };
  }
  if (count < 0) return { error: "Item count cannot be negative." };
  if (minutes < 0) return { error: "Minutes per item cannot be negative." };

  const totalMinutes = count * minutes;
  return {
    totalMinutes,
    totalHours: totalMinutes / MINUTES_PER_HOUR,
    workingDays: totalMinutes / (MINUTES_PER_HOUR * 6),
  };
}

export function metricById(id) {
  return METRICS.find((item) => item.id === id) || METRICS[0];
}
