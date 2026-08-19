/**
 * HbA1c goal progress tracker — pure logic.
 *
 * Conversions and reference values, all published:
 *
 *  - NGSP/DCCT percent to IFCC mmol/mol (the NGSP master equation):
 *      mmol/mol = (percent - 2.15) x 10.929
 *    So 7.0% is 53 mmol/mol and 6.0% is 42 mmol/mol.
 *
 *  - Estimated average glucose, from the A1c-Derived Average Glucose (ADAG)
 *    study, Nathan et al. 2008:
 *      eAG mg/dL  = 28.7 x A1c - 46.7
 *      eAG mmol/L = 1.5944 x A1c - 2.5944
 *    So 7.0% corresponds to about 154 mg/dL or 8.6 mmol/L.
 *
 *  - Reference bands used by the American Diabetes Association for adults:
 *    below 5.7% is normal, 5.7-6.4% is the prediabetes range, and 6.5% or
 *    above meets the diagnostic threshold for diabetes. A general glycaemic
 *    target of below 7.0% applies to many non-pregnant adults with diabetes,
 *    but targets are individualised, so the tool takes yours as input.
 *
 *  - HbA1c reflects average glycaemia over roughly the previous 8-12 weeks,
 *    because red cells live about 120 days; the most recent 30 days contribute
 *    a disproportionate share of the value.
 *
 * Trends use ordinary least squares on (days since first reading, percent).
 * Nothing here reads the clock — every date is an argument.
 */

export const IFCC_SLOPE = 10.929;
export const IFCC_INTERCEPT = 2.15;

export const EAG_MGDL_SLOPE = 28.7;
export const EAG_MGDL_INTERCEPT = -46.7;
export const EAG_MMOL_SLOPE = 1.5944;
export const EAG_MMOL_INTERCEPT = -2.5944;

export const PREDIABETES_MIN_PERCENT = 5.7;
export const DIABETES_MIN_PERCENT = 6.5;
export const ADA_GENERAL_TARGET_PERCENT = 7.0;

/** ADA testing frequency: at least twice a year at goal, quarterly otherwise. */
export const RETEST_DAYS_AT_GOAL = 180;
export const RETEST_DAYS_OFF_GOAL = 90;

/** HbA1c reflects roughly this many days of average glycaemia. */
export const HBA1C_WINDOW_DAYS = 90;
export const RED_CELL_LIFESPAN_DAYS = 120;

/** Plausible measurement range; outside this a value is a typo or a unit mix-up. */
export const MIN_PERCENT = 3;
export const MAX_PERCENT = 20;

export const UNITS = [
  { id: "percent", label: "% (NGSP/DCCT)", short: "%" },
  { id: "mmol", label: "mmol/mol (IFCC)", short: "mmol/mol" },
];

export const BANDS = [
  { id: "normal", maxPercent: PREDIABETES_MIN_PERCENT, label: "Below the prediabetes range" },
  { id: "prediabetes", maxPercent: DIABETES_MIN_PERCENT, label: "Prediabetes range (5.7-6.4%)" },
  { id: "at-target", maxPercent: ADA_GENERAL_TARGET_PERCENT, label: "6.5-6.9% — at or below the common 7% adult target" },
  { id: "above", maxPercent: 8, label: "7.0-7.9% — above the common 7% target" },
  { id: "well-above", maxPercent: 10, label: "8.0-9.9% — well above the common target" },
  { id: "very-high", maxPercent: Infinity, label: "10% or above" },
];

const DAY_MS = 86400000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseIsoDate(iso) {
  if (typeof iso !== "string" || !ISO_DATE.test(iso)) return NaN;
  const [y, m, d] = iso.split("-").map(Number);
  const ms = Date.UTC(y, m - 1, d);
  const check = new Date(ms);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) {
    return NaN;
  }
  return ms;
}

export function addDaysIso(epochMs, days) {
  const next = new Date(epochMs + Math.round(days) * DAY_MS);
  const y = next.getUTCFullYear();
  const m = String(next.getUTCMonth() + 1).padStart(2, "0");
  const d = String(next.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const percentToMmol = (percent) => (percent - IFCC_INTERCEPT) * IFCC_SLOPE;
export const mmolToPercent = (mmol) => mmol / IFCC_SLOPE + IFCC_INTERCEPT;
export const percentToEagMgDl = (percent) => EAG_MGDL_SLOPE * percent + EAG_MGDL_INTERCEPT;
export const percentToEagMmolL = (percent) => EAG_MMOL_SLOPE * percent + EAG_MMOL_INTERCEPT;

export function bandFor(percent) {
  return BANDS.find((band) => percent < band.maxPercent) || BANDS[BANDS.length - 1];
}

const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

/** Convert a value in the caller's unit to NGSP percent, or NaN. */
export function toPercent(value, unit) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) return NaN;
  return unit === "mmol" ? mmolToPercent(raw) : raw;
}

/**
 * @param {object} input
 * @param {Array<{id: *, date: string, value: number}>} input.readings
 * @param {string} input.unit - "percent" or "mmol"
 * @param {number} input.targetValue - in the same unit
 * @returns {object|{error: string}}
 */
export function analyseHba1c({ readings, unit = "percent", targetValue }) {
  if (!UNITS.some((item) => item.id === unit)) {
    return { error: "Pick a unit: % or mmol/mol." };
  }
  if (!Array.isArray(readings) || readings.length === 0) {
    return { error: "Add at least one HbA1c result." };
  }

  const targetPercent = round1(toPercent(targetValue, unit));
  if (!Number.isFinite(targetPercent)) {
    return { error: "Enter the target your clinician agreed with you." };
  }
  if (targetPercent < MIN_PERCENT || targetPercent > MAX_PERCENT) {
    return { error: `A target between ${MIN_PERCENT}% and ${MAX_PERCENT}% is expected.` };
  }

  const parsed = [];
  for (let i = 0; i < readings.length; i += 1) {
    const reading = readings[i];
    const epoch = parseIsoDate(reading.date);
    if (Number.isNaN(epoch)) {
      return { error: `Result ${i + 1} needs a valid date in YYYY-MM-DD form.` };
    }
    const percent = round1(toPercent(reading.value, unit));
    if (!Number.isFinite(percent)) {
      return { error: `Result ${i + 1} needs a number.` };
    }
    if (percent < MIN_PERCENT || percent > MAX_PERCENT) {
      return {
        error: `Result ${i + 1} is outside the plausible ${MIN_PERCENT}-${MAX_PERCENT}% range — check the value and the unit.`,
      };
    }
    parsed.push({ id: reading.id, epoch, percent, date: reading.date });
  }

  parsed.sort((a, b) => a.epoch - b.epoch);

  const firstEpoch = parsed[0].epoch;
  const rows = parsed.map((entry, index) => {
    const previous = index > 0 ? parsed[index - 1] : null;
    const band = bandFor(entry.percent);
    return {
      id: entry.id,
      date: entry.date,
      daysSinceFirst: Math.round((entry.epoch - firstEpoch) / DAY_MS),
      percent: round1(entry.percent),
      mmol: Math.round(percentToMmol(entry.percent)),
      eagMgDl: Math.round(percentToEagMgDl(entry.percent)),
      eagMmolL: round1(percentToEagMmolL(entry.percent)),
      bandId: band.id,
      bandLabel: band.label,
      atTarget: entry.percent <= targetPercent + 1e-9,
      changeFromPrevious: previous ? round1(entry.percent - previous.percent) : null,
      changeFromBaseline: round1(entry.percent - parsed[0].percent),
    };
  });

  const baseline = parsed[0];
  const latest = parsed[parsed.length - 1];
  const atGoal = latest.percent <= targetPercent + 1e-9;

  const totalChange = round1(latest.percent - baseline.percent);
  const distanceToTarget = round1(latest.percent - targetPercent);
  // How far along the baseline-to-target journey the latest result sits.
  // Already at or below target counts as complete, whatever the baseline was.
  const goalGap = baseline.percent - targetPercent;
  let progressPct = 0;
  if (atGoal) {
    progressPct = 100;
  } else if (goalGap > 1e-9) {
    progressPct = Math.max(
      0,
      Math.min(100, Math.round(((baseline.percent - latest.percent) / goalGap) * 100)),
    );
  }

  // Ordinary least squares on days vs percent.
  let slopePerDay = null;
  let projectedTargetDate = null;
  let monthsToTarget = null;
  if (parsed.length >= 2) {
    const n = parsed.length;
    const xs = parsed.map((entry) => (entry.epoch - firstEpoch) / DAY_MS);
    const ys = parsed.map((entry) => entry.percent);
    const meanX = xs.reduce((sum, value) => sum + value, 0) / n;
    const meanY = ys.reduce((sum, value) => sum + value, 0) / n;
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i += 1) {
      numerator += (xs[i] - meanX) * (ys[i] - meanY);
      denominator += (xs[i] - meanX) ** 2;
    }
    if (denominator > 0) {
      slopePerDay = numerator / denominator;
      if (!atGoal && slopePerDay < -1e-9) {
        const daysNeeded = (targetPercent - latest.percent) / slopePerDay;
        if (Number.isFinite(daysNeeded) && daysNeeded > 0 && daysNeeded < 3650) {
          projectedTargetDate = addDaysIso(latest.epoch, daysNeeded);
          monthsToTarget = round1(daysNeeded / 30.44);
        }
      }
    }
  }

  const retestDays = atGoal ? RETEST_DAYS_AT_GOAL : RETEST_DAYS_OFF_GOAL;
  const nextTestDate = addDaysIso(latest.epoch, retestDays);

  // Normalised chart coordinates, so the component only has to scale to pixels.
  const values = rows.map((row) => row.percent).concat([round1(targetPercent)]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const span = maxValue - minValue || 1;
  const dayRange = rows[rows.length - 1].daysSinceFirst || 1;
  const chart = {
    minValue: round1(minValue),
    maxValue: round1(maxValue),
    targetY: (maxValue - targetPercent) / span,
    points: rows.map((row) => ({
      id: row.id,
      x: rows.length === 1 ? 0.5 : row.daysSinceFirst / dayRange,
      y: (maxValue - row.percent) / span,
      percent: row.percent,
      date: row.date,
      atTarget: row.atTarget,
    })),
  };

  return {
    unit,
    targetPercent: round1(targetPercent),
    targetMmol: Math.round(percentToMmol(targetPercent)),
    targetEagMgDl: Math.round(percentToEagMgDl(targetPercent)),
    targetEagMmolL: round1(percentToEagMmolL(targetPercent)),
    rows,
    baseline: rows[0],
    latest: rows[rows.length - 1],
    atGoal,
    totalChange,
    distanceToTarget,
    progressPct,
    slopePerMonth: slopePerDay === null ? null : round2(slopePerDay * 30.44),
    projectedTargetDate,
    monthsToTarget,
    nextTestDate,
    retestDays,
    readingCount: rows.length,
    spanDays: rows[rows.length - 1].daysSinceFirst,
    chart,
  };
}
