/**
 * Year-on-year marks comparison.
 *
 * Each period (year, semester or term) is a pair of marks obtained and maximum
 * marks. The tool converts every period to a percentage, reports the
 * percentage-point change between consecutive periods, and fits an ordinary
 * least-squares straight line (percentage vs period index) to describe the
 * overall trend — the standard OLS slope formula
 *   slope = Σ((x - x̄)(y - ȳ)) / Σ((x - x̄)²).
 */

/** Percentages are conventionally reported to 2 decimal places on mark sheets. */
export const PERCENT_DECIMALS = 2;

/** A meaningful comparison needs at least two periods. */
export const MIN_PERIODS = 2;

/** Practical safety cap so the UI stays usable; not a statistical rule. */
export const MAX_PERIODS = 12;

/**
 * Trend is called "improving"/"declining" only when the OLS slope exceeds this
 * many percentage points per period; smaller slopes are reported as "stable".
 * Half a point per period is below the rounding noise of most mark sheets.
 */
export const STABLE_SLOPE_THRESHOLD = 0.5;

const round = (value, decimals = PERCENT_DECIMALS) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/**
 * Ordinary least-squares slope and intercept of y over x = 0..n-1.
 * Returns { slope, intercept }. Caller guarantees n >= 2.
 */
export function leastSquares(values) {
  const n = values.length;
  const xMean = (n - 1) / 2; // mean of 0..n-1
  const yMean = values.reduce((sum, v) => sum + v, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i += 1) {
    num += (i - xMean) * (values[i] - yMean);
    den += (i - xMean) ** 2;
  }
  // den is 0 only when n === 1, which callers exclude.
  return { slope: num / den, intercept: yMean - (num / den) * xMean };
}

/**
 * Compare marks across periods.
 *
 * @param {object} input
 * @param {Array<{label:string, obtained:number|string, max:number|string}>} input.periods
 * @returns {object} comparison result, or { error } for invalid input.
 */
export function compareMarks({ periods }) {
  if (!Array.isArray(periods) || periods.length < MIN_PERIODS) {
    return { error: `Add at least ${MIN_PERIODS} periods to compare.` };
  }
  if (periods.length > MAX_PERIODS) {
    return { error: `This tool compares up to ${MAX_PERIODS} periods at a time.` };
  }

  const rows = [];
  for (let i = 0; i < periods.length; i += 1) {
    const label = String(periods[i].label ?? "").trim() || `Period ${i + 1}`;
    const obtained = Number(periods[i].obtained);
    const max = Number(periods[i].max);
    if (!Number.isFinite(obtained) || !Number.isFinite(max)) {
      return { error: `Enter numeric marks for ${label}.` };
    }
    if (max <= 0) {
      return { error: `Maximum marks for ${label} must be greater than zero.` };
    }
    if (obtained < 0) {
      return { error: `Marks obtained for ${label} cannot be negative.` };
    }
    if (obtained > max) {
      return { error: `Marks obtained for ${label} cannot exceed the maximum (${max}).` };
    }
    rows.push({ label, obtained, max, percent: round((obtained / max) * 100) });
  }

  const percents = rows.map((r) => r.percent);
  const withDeltas = rows.map((row, i) => ({
    ...row,
    // Change is in percentage points versus the previous period; null for the first.
    deltaPoints: i === 0 ? null : round(row.percent - rows[i - 1].percent),
  }));

  const { slope } = leastSquares(percents);
  const best = withDeltas.reduce((a, b) => (b.percent > a.percent ? b : a));
  const worst = withDeltas.reduce((a, b) => (b.percent < a.percent ? b : a));
  const average = round(percents.reduce((s, p) => s + p, 0) / percents.length);
  const overallChange = round(percents[percents.length - 1] - percents[0]);

  let trend = "stable";
  if (slope > STABLE_SLOPE_THRESHOLD) trend = "improving";
  else if (slope < -STABLE_SLOPE_THRESHOLD) trend = "declining";

  // Straight-line projection for the next period, clamped to a valid percentage.
  const projectedNext = round(
    Math.min(100, Math.max(0, percents[percents.length - 1] + slope)),
  );

  return {
    rows: withDeltas,
    averagePercent: average,
    bestLabel: best.label,
    bestPercent: best.percent,
    worstLabel: worst.label,
    worstPercent: worst.percent,
    overallChangePoints: overallChange,
    slopePerPeriod: round(slope),
    trend,
    projectedNextPercent: projectedNext,
  };
}
