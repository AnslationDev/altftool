/**
 * Subject strength radar.
 *
 * Each subject score is normalised to a percentage (obtained / max × 100) and
 * plotted on a radar (spider) chart: axis i sits at angle
 *   θᵢ = -90° + i × 360°/n  (first axis straight up, clockwise),
 * and a value v maps to the point (cx + r·(v/100)·cosθ, cy + r·(v/100)·sinθ).
 * Balance across subjects is measured with the population standard deviation
 *   σ = √( Σ(xᵢ - x̄)² / n ).
 */

/** A radar chart needs at least 3 axes to enclose an area. */
export const MIN_SUBJECTS = 3;

/** Practical cap so labels stay legible; not a statistical rule. */
export const MAX_SUBJECTS = 10;

/**
 * Balance bands on the standard deviation of subject percentages.
 * σ < 8: subjects within a typical one-grade band of each other → balanced.
 * σ < 15: about a grade-and-a-half of spread → moderately uneven.
 * Otherwise clearly lopsided. Bands are this tool's rubric, chosen so that a
 * 10-point grade slab (as in CBSE's 91-100/81-90 bands) straddles "moderate".
 */
export const BALANCE_BANDS = [
  { maxSd: 8, id: "balanced", label: "Well balanced" },
  { maxSd: 15, id: "moderate", label: "Moderately uneven" },
  { maxSd: Infinity, id: "uneven", label: "Uneven — clear strong and weak subjects" },
];

const round1 = (v) => Math.round(v * 10) / 10;

/** Population standard deviation. Caller guarantees a non-empty array. */
export function standardDeviation(values) {
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Vertex coordinates for a radar polygon.
 *
 * @param {number[]} percents  values 0..100, one per axis
 * @param {number} cx  centre x
 * @param {number} cy  centre y
 * @param {number} radius  radius representing 100%
 * @returns {Array<{x:number, y:number}>}
 */
export function radarPoints(percents, cx, cy, radius) {
  const n = percents.length;
  return percents.map((value, i) => {
    const angle = (-90 + (i * 360) / n) * (Math.PI / 180);
    const r = radius * Math.min(100, Math.max(0, value)) / 100;
    return {
      x: round1(cx + r * Math.cos(angle)),
      y: round1(cy + r * Math.sin(angle)),
    };
  });
}

/** Axis endpoint (100%) and label anchor positions for each subject. */
export function radarAxes(count, cx, cy, radius, labelOffset = 16) {
  const axes = [];
  for (let i = 0; i < count; i += 1) {
    const angle = (-90 + (i * 360) / count) * (Math.PI / 180);
    axes.push({
      x: round1(cx + radius * Math.cos(angle)),
      y: round1(cy + radius * Math.sin(angle)),
      labelX: round1(cx + (radius + labelOffset) * Math.cos(angle)),
      labelY: round1(cy + (radius + labelOffset) * Math.sin(angle)),
      angleDeg: -90 + (i * 360) / count,
    });
  }
  return axes;
}

/**
 * Analyse subject-wise marks for the radar view.
 *
 * @param {object} input
 * @param {Array<{name:string, obtained:number|string, max:number|string}>} input.subjects
 * @returns {object} analysis, or { error } for invalid input.
 */
export function analyseSubjects({ subjects }) {
  if (!Array.isArray(subjects) || subjects.length < MIN_SUBJECTS) {
    return { error: `Add at least ${MIN_SUBJECTS} subjects — a radar needs three axes.` };
  }
  if (subjects.length > MAX_SUBJECTS) {
    return { error: `This tool plots up to ${MAX_SUBJECTS} subjects at a time.` };
  }

  const rows = [];
  for (let i = 0; i < subjects.length; i += 1) {
    const name = String(subjects[i].name ?? "").trim() || `Subject ${i + 1}`;
    const obtained = Number(subjects[i].obtained);
    const max = Number(subjects[i].max);
    if (!Number.isFinite(obtained) || !Number.isFinite(max)) {
      return { error: `Enter numeric marks for ${name}.` };
    }
    if (max <= 0) return { error: `Maximum marks for ${name} must be greater than zero.` };
    if (obtained < 0) return { error: `Marks for ${name} cannot be negative.` };
    if (obtained > max) {
      return { error: `Marks for ${name} cannot exceed the maximum (${max}).` };
    }
    rows.push({ name, obtained, max, percent: round1((obtained / max) * 100) });
  }

  const percents = rows.map((r) => r.percent);
  const average = round1(percents.reduce((s, p) => s + p, 0) / percents.length);
  const sd = round1(standardDeviation(percents));
  const band = BALANCE_BANDS.find((b) => sd < b.maxSd) ?? BALANCE_BANDS[BALANCE_BANDS.length - 1];
  const strongest = rows.reduce((a, b) => (b.percent > a.percent ? b : a));
  const weakest = rows.reduce((a, b) => (b.percent < a.percent ? b : a));

  return {
    rows,
    averagePercent: average,
    standardDeviation: sd,
    balanceId: band.id,
    balanceLabel: band.label,
    strongestName: strongest.name,
    strongestPercent: strongest.percent,
    weakestName: weakest.name,
    weakestPercent: weakest.percent,
    // Gap between best and worst subject in percentage points.
    spreadPoints: round1(strongest.percent - weakest.percent),
  };
}
