/**
 * SMART Goal Planner — scoring, pacing and milestone maths.
 *
 * SMART comes from George T. Doran, "There's a S.M.A.R.T. way to write
 * management's goals and objectives", Management Review, November 1981:
 * Specific, Measurable, Achievable, Relevant, Time-bound.
 *
 * Pure functions only. Every date is passed in as an ISO `YYYY-MM-DD` string;
 * nothing here reads the clock.
 */

/** One day in milliseconds — used for all date differences. */
export const MS_PER_DAY = 86400000;

/** Each of the five SMART letters is worth an equal share of 100. */
export const POINTS_PER_CRITERION = 20;

/** A goal statement shorter than this reads as a slogan, not a goal. */
export const MIN_STATEMENT_CHARS = 20;

/** …and needs at least this many words to name an action and an object. */
export const MIN_STATEMENT_WORDS = 4;

/** A "why this matters" note shorter than this is not a relevance case. */
export const MIN_RELEVANCE_CHARS = 15;

/**
 * Achievability test: the pace the goal demands may exceed your proven pace,
 * but not by more than this multiple. 2x is the common "stretch, don't snap"
 * planning heuristic — beyond it the plan needs new resources, not more effort.
 */
export const STRETCH_CAP_MULTIPLIER = 2;

/**
 * Time-bound partial credit: a deadline further out than this loses half the
 * Time-bound points because it stops driving weekly behaviour.
 */
export const MAX_ACTIONABLE_HORIZON_DAYS = 365;

/** Status bands for how progress compares with time elapsed. */
export const PACE_BANDS = Object.freeze([
  [10, "Ahead of schedule"],
  [-5, "On track"],
  [-20, "Slipping"],
  [-Infinity, "At risk"],
]);

export const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse an ISO date to a UTC timestamp, or return null if it is not a real day. */
export function parseIsoDate(value) {
  const match = ISO_DATE_RE.exec(String(value == null ? "" : value).trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const ms = Date.UTC(Number(y), Number(m) - 1, Number(d));
  const date = new Date(ms);
  if (
    date.getUTCFullYear() !== Number(y) ||
    date.getUTCMonth() !== Number(m) - 1 ||
    date.getUTCDate() !== Number(d)
  ) {
    return null;
  }
  return ms;
}

/** Whole days from one ISO date to another (b - a). */
export function daysBetween(aIso, bIso) {
  const a = parseIsoDate(aIso);
  const b = parseIsoDate(bIso);
  if (a === null || b === null) return null;
  return Math.round((b - a) / MS_PER_DAY);
}

/** Add whole days to an ISO date and return a new ISO date string. */
export function addDays(iso, days) {
  const base = parseIsoDate(iso);
  if (base === null || !Number.isFinite(days)) return null;
  return new Date(base + Math.round(days) * MS_PER_DAY).toISOString().slice(0, 10);
}

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return Number.NaN;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const text = (value) => String(value == null ? "" : value).trim();

const wordCount = (value) => text(value).split(/\s+/).filter(Boolean).length;

const round = (value, dp = 1) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/** Turn a list of milestones into completion counts and a percentage. */
export function summariseMilestones(milestones = []) {
  const list = (Array.isArray(milestones) ? milestones : []).filter(
    (item) => item && text(item.title) !== "",
  );
  const done = list.filter((item) => Boolean(item.done)).length;
  const percent = list.length === 0 ? 0 : round((done / list.length) * 100, 1);
  return { total: list.length, done, remaining: list.length - done, percent };
}

/** Label the gap between progress made and time spent. */
export function paceBand(gapPercentagePoints) {
  const found = PACE_BANDS.find(([min]) => gapPercentagePoints >= min);
  return found ? found[1] : "At risk";
}

/**
 * Plan and score one SMART goal.
 *
 * @param {object} input
 * @param {string} input.statement       The goal, written as one sentence.
 * @param {string} input.metric          What is being counted (e.g. "paying customers").
 * @param {number} input.baseline        Metric value when the goal started.
 * @param {number} input.target          Metric value that means "done".
 * @param {number} input.current         Metric value as of `asOfDate`.
 * @param {number} input.provenRatePerDay Rate per day you actually sustained in a comparable past period.
 * @param {string} input.relevance       Why this goal matters, in one line.
 * @param {string} input.startDate       ISO date the goal started.
 * @param {string} input.dueDate         ISO deadline.
 * @param {string} input.asOfDate        ISO date the `current` reading was taken.
 * @param {Array}  input.milestones      [{ title, done }]
 * @returns {object} plan and score, or { error }
 */
export function planSmartGoal(input = {}) {
  const statement = text(input.statement);
  const metric = text(input.metric);
  const relevance = text(input.relevance);
  const baseline = toNumber(input.baseline);
  const target = toNumber(input.target);
  const current = toNumber(input.current);
  const provenRatePerDay = toNumber(input.provenRatePerDay);

  if (statement === "") return { error: "Write the goal as one sentence before scoring it." };
  if (!Number.isFinite(baseline)) return { error: "Baseline must be a number." };
  if (!Number.isFinite(target)) return { error: "Target must be a number." };
  if (!Number.isFinite(current)) return { error: "Current value must be a number." };
  if (target === baseline) {
    return { error: "Target and baseline are the same — there is nothing to measure." };
  }

  const start = parseIsoDate(input.startDate);
  const due = parseIsoDate(input.dueDate);
  const asOf = parseIsoDate(input.asOfDate);
  if (start === null) return { error: "Start date must be a real date in YYYY-MM-DD format." };
  if (due === null) return { error: "Due date must be a real date in YYYY-MM-DD format." };
  if (asOf === null) return { error: "The as-of date must be a real date in YYYY-MM-DD format." };
  if (due <= start) return { error: "The due date must be after the start date." };
  if (asOf < start) return { error: "The as-of date cannot be before the start date." };

  const totalDays = Math.round((due - start) / MS_PER_DAY);
  const daysElapsed = Math.round((asOf - start) / MS_PER_DAY);
  const daysRemaining = totalDays - daysElapsed;

  const span = target - baseline;
  const direction = span > 0 ? "increase" : "decrease";

  const progressPct = Math.min(100, Math.max(0, ((current - baseline) / span) * 100));
  const timeElapsedPct = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));
  const gap = progressPct - timeElapsedPct;

  const remainingAmount = target - current;
  const requiredRatePerDay =
    daysRemaining > 0 ? remainingAmount / daysRemaining : null;
  const observedRatePerDay = daysElapsed > 0 ? (current - baseline) / daysElapsed : null;

  const projectedValue =
    observedRatePerDay === null || daysRemaining <= 0
      ? current
      : current + observedRatePerDay * daysRemaining;
  /** Capped at 999% so a nonsense reading cannot render as scientific notation. */
  const projectedProgressPct = Math.min(999, Math.max(0, ((projectedValue - baseline) / span) * 100));

  /** Date the goal lands on, projecting the observed rate forward. */
  let forecastDate = null;
  if (observedRatePerDay !== null && observedRatePerDay !== 0) {
    const daysNeeded = remainingAmount / observedRatePerDay;
    if (daysNeeded >= 0 && Number.isFinite(daysNeeded) && daysNeeded < 36500) {
      forecastDate = addDays(input.asOfDate, Math.ceil(daysNeeded));
    }
  }
  if (Math.abs(current - baseline) >= Math.abs(span)) forecastDate = text(input.asOfDate);

  // ---- SMART scoring -------------------------------------------------------
  const criteria = [];

  const specificOk =
    statement.length >= MIN_STATEMENT_CHARS && wordCount(statement) >= MIN_STATEMENT_WORDS;
  criteria.push({
    key: "specific",
    label: "Specific",
    points: specificOk ? POINTS_PER_CRITERION : 0,
    note: specificOk
      ? "The statement names an action and an object."
      : `Write at least ${MIN_STATEMENT_CHARS} characters and ${MIN_STATEMENT_WORDS} words saying who does what.`,
  });

  const measurableOk = metric !== "" && span !== 0;
  criteria.push({
    key: "measurable",
    label: "Measurable",
    points: measurableOk ? POINTS_PER_CRITERION : 0,
    note: measurableOk
      ? `Counted in ${metric}, moving from ${baseline} to ${target}.`
      : "Name the unit you are counting so progress is a number, not an opinion.",
  });

  let achievablePoints = 0;
  let achievableNote = "";
  if (!Number.isFinite(provenRatePerDay) || provenRatePerDay <= 0) {
    achievableNote =
      "Enter the rate per day you actually sustained in a comparable past period to test achievability.";
  } else if (requiredRatePerDay === null) {
    achievableNote = "The deadline has passed, so the required pace can no longer be tested.";
  } else {
    const ratio = Math.abs(requiredRatePerDay) / provenRatePerDay;
    if (ratio <= 1) {
      achievablePoints = POINTS_PER_CRITERION;
      achievableNote = `Needs ${round(Math.abs(requiredRatePerDay), 2)} per day — at or below your proven pace.`;
    } else if (ratio <= STRETCH_CAP_MULTIPLIER) {
      achievablePoints = POINTS_PER_CRITERION / 2;
      achievableNote = `Needs ${round(ratio, 2)}x your proven pace — a stretch, still inside the ${STRETCH_CAP_MULTIPLIER}x cap.`;
    } else {
      achievableNote = `Needs ${round(ratio, 2)}x your proven pace, over the ${STRETCH_CAP_MULTIPLIER}x cap — change the target, the date or the resources.`;
    }
  }
  criteria.push({ key: "achievable", label: "Achievable", points: achievablePoints, note: achievableNote });

  const relevantOk = relevance.length >= MIN_RELEVANCE_CHARS;
  criteria.push({
    key: "relevant",
    label: "Relevant",
    points: relevantOk ? POINTS_PER_CRITERION : 0,
    note: relevantOk
      ? "The goal is tied to a stated outcome."
      : `Say in at least ${MIN_RELEVANCE_CHARS} characters which larger objective this serves.`,
  });

  const timeBoundPoints =
    totalDays <= MAX_ACTIONABLE_HORIZON_DAYS ? POINTS_PER_CRITERION : POINTS_PER_CRITERION / 2;
  criteria.push({
    key: "timeBound",
    label: "Time-bound",
    points: timeBoundPoints,
    note:
      totalDays <= MAX_ACTIONABLE_HORIZON_DAYS
        ? `A ${totalDays}-day window with a fixed end date.`
        : `${totalDays} days is beyond the ${MAX_ACTIONABLE_HORIZON_DAYS}-day actionable horizon — split it into shorter goals.`,
  });

  const smartScore = criteria.reduce((sum, item) => sum + item.points, 0);

  const milestones = summariseMilestones(input.milestones);

  const status =
    daysRemaining < 0 && progressPct < 100
      ? "Overdue"
      : progressPct >= 100
        ? "Complete"
        : paceBand(gap);

  return {
    statement,
    metric,
    direction,
    smartScore,
    criteria,
    progressPct: round(progressPct, 1),
    timeElapsedPct: round(timeElapsedPct, 1),
    paceGapPoints: round(gap, 1),
    status,
    totalDays,
    daysElapsed,
    daysRemaining,
    remainingAmount: round(remainingAmount, 2),
    requiredRatePerDay: requiredRatePerDay === null ? null : round(requiredRatePerDay, 3),
    observedRatePerDay: observedRatePerDay === null ? null : round(observedRatePerDay, 3),
    /** Magnitudes, so a "reduce X" goal reads as a positive per-day figure. */
    requiredRatePerDayMagnitude:
      requiredRatePerDay === null ? null : round(Math.abs(requiredRatePerDay), 3),
    observedRatePerDayMagnitude:
      observedRatePerDay === null ? null : round(Math.abs(observedRatePerDay), 3),
    remainingAmountMagnitude: round(Math.abs(remainingAmount), 2),
    projectedValue: round(projectedValue, 2),
    projectedProgressPct: round(projectedProgressPct, 1),
    forecastDate,
    milestones,
  };
}
