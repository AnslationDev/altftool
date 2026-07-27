/**
 * Roof pitch converter.
 *
 * Every roof pitch is one number — the tangent of the slope, rise divided by
 * run — dressed up four different ways:
 *
 *   rise per 12 of run   riseIn12 = 12 x (rise / run)
 *   angle in degrees     angle    = atan(rise / run)
 *   grade as a percent   percent  = 100 x (rise / run)
 *   ratio 1 : n          n        = run / rise
 *
 * Two derived factors follow straight from the same tangent:
 *
 *   slope factor      = sqrt(1 + (rise/run)^2)   — plan area to sloped area
 *   hip/valley factor = sqrt(2 + (rise/run)^2)   — plan run to hip rafter
 *
 * A 6-in-12 roof is 26.565 degrees, 50%, 1:2, slope factor 1.1180 and hip
 * factor exactly 1.5.
 */

export const STANDARD_RUN = 12;
export const DEGREES_PER_RADIAN = 180 / Math.PI;

/**
 * The pitch below which each covering is not weathertight without special
 * detailing. Figures follow mainstream manufacturer installation instructions
 * and the Indian practice for tiled roofs; always confirm against the specific
 * product datasheet, since laps and underlays change the limit.
 */
export const MATERIAL_MINIMUMS = [
  { id: "membrane", label: "Waterproof membrane / RCC terrace", minRiseIn12: 0.25 },
  { id: "standing", label: "Standing seam metal", minRiseIn12: 1.5 },
  { id: "profiled", label: "Corrugated or profiled metal sheet", minRiseIn12: 2 },
  { id: "shingle", label: "Asphalt shingle (with double underlay)", minRiseIn12: 2 },
  { id: "shingleStd", label: "Asphalt shingle (standard underlay)", minRiseIn12: 4 },
  { id: "fibrecement", label: "Fibre-cement sheet", minRiseIn12: 3 },
  { id: "concreteTile", label: "Concrete interlocking tile", minRiseIn12: 4 },
  { id: "mangalore", label: "Mangalore / clay pantile", minRiseIn12: 5 },
  { id: "slate", label: "Natural slate", minRiseIn12: 5 },
  { id: "thatch", label: "Thatch", minRiseIn12: 12 },
];

/** Pitches with the names roofers and drawings use for them. */
export const PITCH_NAMES = [
  { maxRiseIn12: 0.5, name: "Effectively flat — drainage fall only" },
  { maxRiseIn12: 2, name: "Low slope" },
  { maxRiseIn12: 4, name: "Shallow pitch" },
  { maxRiseIn12: 9, name: "Conventional pitch" },
  { maxRiseIn12: 12, name: "Steep pitch" },
  { maxRiseIn12: Infinity, name: "Very steep — mansard or spire territory" },
];

export const PITCH_MODES = ["riseIn12", "degrees", "percent", "ratio", "riseRun"];

export const MAX_RISE_IN_12 = 60;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;
const round3 = (value) => Math.round(value * 1000) / 1000;
const round4 = (value) => Math.round(value * 10000) / 10000;

/** Name for a pitch band. */
export function pitchName(riseIn12) {
  if (!isNum(riseIn12) || riseIn12 < 0) return "";
  const band = PITCH_NAMES.find((item) => riseIn12 <= item.maxRiseIn12);
  return band ? band.name : "";
}

/**
 * Reduce any of the accepted pitch notations to a single tangent (rise / run).
 *
 * @param {object} input
 * @param {"riseIn12"|"degrees"|"percent"|"ratio"|"riseRun"} input.mode
 * @param {number} [input.value]  Primary figure for riseIn12/degrees/percent/ratio.
 * @param {number} [input.rise]   Used when mode is "riseRun".
 * @param {number} [input.run]    Used when mode is "riseRun"; for "ratio" this
 *                                is the n in 1 : n, supplied as `value`.
 * @returns {number} rise / run, or NaN when the input cannot describe a roof.
 */
export function toTangent({ mode, value, rise, run } = {}) {
  if (mode === "riseRun") {
    if (!isNum(rise) || !isNum(run)) return NaN;
    if (run <= 0 || rise < 0) return NaN;
    return rise / run;
  }
  if (!isNum(value) || value < 0) return NaN;
  if (mode === "degrees") {
    if (value >= 90) return NaN;
    return Math.tan(value / DEGREES_PER_RADIAN);
  }
  if (mode === "percent") return value / 100;
  if (mode === "ratio") {
    // "1 in n" means one unit of rise for n units of run.
    if (value <= 0) return NaN;
    return 1 / value;
  }
  return value / STANDARD_RUN;
}

/**
 * Convert a pitch and, optionally, apply it to a span.
 *
 * @param {object} input
 * @param {"riseIn12"|"degrees"|"percent"|"ratio"|"riseRun"} [input.mode]
 * @param {number} [input.value]
 * @param {number} [input.rise]
 * @param {number} [input.run]
 * @param {number} [input.spanFt]   Full span of the roof, feet. The common
 *                                  rafter run is half of it on a gable or hip.
 * @param {number} [input.overhangFt] Horizontal eaves projection, feet.
 * @returns {object} Conversions and lengths, or { error } for invalid input.
 */
export function convertPitch({
  mode = "riseIn12",
  value,
  rise,
  run,
  spanFt = 0,
  overhangFt = 0,
} = {}) {
  if (!PITCH_MODES.includes(mode)) return { error: "Pick one of the supported pitch notations." };
  if (!isNum(spanFt) || !isNum(overhangFt)) {
    return { error: "Enter a valid number for span and overhang." };
  }
  if (spanFt < 0) return { error: "Span cannot be negative." };
  if (overhangFt < 0) return { error: "Overhang cannot be negative." };

  const tangent = toTangent({ mode, value, rise, run });
  if (!isNum(tangent)) {
    return {
      error:
        mode === "degrees"
          ? "Enter an angle of 0 or more but below 90 degrees."
          : "Enter a positive pitch — run and ratio figures must be above zero.",
    };
  }
  const riseIn12 = tangent * STANDARD_RUN;
  if (riseIn12 > MAX_RISE_IN_12) {
    return { error: `A pitch above ${MAX_RISE_IN_12} in 12 is a wall, not a roof.` };
  }

  const angleDeg = Math.atan(tangent) * DEGREES_PER_RADIAN;
  const percent = tangent * 100;
  // 1 : n notation is undefined for a dead-flat roof.
  const ratioRunPerRise = tangent > 0 ? 1 / tangent : NaN;
  const slopeFactor = Math.sqrt(1 + tangent * tangent);
  const hipFactor = Math.sqrt(2 + tangent * tangent);

  // Rafter geometry. Half the span is the common rafter run on a gable or hip.
  const commonRunFt = spanFt / 2;
  const riseFt = commonRunFt * tangent;
  const rafterFt = commonRunFt * slopeFactor;
  const overhangRafterFt = overhangFt * slopeFactor;
  const totalRafterFt = rafterFt + overhangRafterFt;
  const hipRafterFt = commonRunFt * hipFactor;
  // Extra area a square foot of plan turns into.
  const areaMultiplier = slopeFactor;

  return {
    tangent: round4(tangent),
    riseIn12: round3(riseIn12),
    angleDeg: round2(angleDeg),
    percent: round2(percent),
    ratioRunPerRise: Number.isFinite(ratioRunPerRise) ? round2(ratioRunPerRise) : NaN,
    slopeFactor: round4(slopeFactor),
    hipFactor: round4(hipFactor),
    areaMultiplier: round4(areaMultiplier),
    pitchName: pitchName(riseIn12),

    spanFt: round2(spanFt),
    commonRunFt: round2(commonRunFt),
    riseFt: round2(riseFt),
    rafterFt: round2(rafterFt),
    overhangRafterFt: round2(overhangRafterFt),
    totalRafterFt: round2(totalRafterFt),
    hipRafterFt: round2(hipRafterFt),

    materials: MATERIAL_MINIMUMS.map((item) => ({
      id: item.id,
      label: item.label,
      minRiseIn12: item.minRiseIn12,
      suitable: riseIn12 >= item.minRiseIn12,
    })),
  };
}
