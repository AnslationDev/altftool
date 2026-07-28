/**
 * Unit circle geometry and trigonometry.
 *
 * The unit circle is the circle of radius 1 centred at the origin. An angle θ
 * measured anticlockwise from the positive x-axis meets the circle at the point
 *
 *   (x, y) = (cos θ, sin θ)
 *
 * which is the definition every other identity here follows from:
 *   tan θ = sin θ / cos θ = y / x     (undefined where x = 0)
 *   csc θ = 1 / sin θ                 (undefined where y = 0)
 *   sec θ = 1 / cos θ                 (undefined where x = 0)
 *   cot θ = cos θ / sin θ = x / y     (undefined where y = 0)
 *
 * Because the radius is 1, the arc length swept from the positive x-axis is
 * numerically equal to the angle in radians (arc = rθ with r = 1).
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Degrees in one full turn. */
export const DEGREES_PER_TURN = 360;

/** Degrees per radian: 180/π, from the definition that a full turn is 2π rad. */
export const DEGREES_PER_RADIAN = 180 / Math.PI;

/** Anything smaller than this in absolute value is floating-point noise from
 * Math.sin / Math.cos and is reported as exactly 0. Math.cos(Math.PI / 2) is
 * 6.12e-17 rather than 0, which would otherwise print as a tiny non-zero x. */
export const ZERO_EPSILON = 1e-12;

/** Sanity limit on the entered angle so normalisation stays numerically sound;
 * beyond roughly this magnitude double precision loses whole degrees. */
export const MAX_ABS_DEGREES = 1e7;

/** Number of decimals used when reporting a ratio. */
export const RATIO_DECIMALS = 6;

/**
 * The 16 special angles of the unit circle: every multiple of 30° and 45°.
 * Exact values are the standard surd forms taught with the 30-60-90 and
 * 45-45-90 reference triangles, with denominators rationalised.
 */
export const SPECIAL_ANGLES = [
  { degrees: 0, radianLabel: "0", cos: "1", sin: "0", tan: "0" },
  { degrees: 30, radianLabel: "π/6", cos: "√3/2", sin: "1/2", tan: "√3/3" },
  { degrees: 45, radianLabel: "π/4", cos: "√2/2", sin: "√2/2", tan: "1" },
  { degrees: 60, radianLabel: "π/3", cos: "1/2", sin: "√3/2", tan: "√3" },
  { degrees: 90, radianLabel: "π/2", cos: "0", sin: "1", tan: "undefined" },
  { degrees: 120, radianLabel: "2π/3", cos: "−1/2", sin: "√3/2", tan: "−√3" },
  { degrees: 135, radianLabel: "3π/4", cos: "−√2/2", sin: "√2/2", tan: "−1" },
  { degrees: 150, radianLabel: "5π/6", cos: "−√3/2", sin: "1/2", tan: "−√3/3" },
  { degrees: 180, radianLabel: "π", cos: "−1", sin: "0", tan: "0" },
  { degrees: 210, radianLabel: "7π/6", cos: "−√3/2", sin: "−1/2", tan: "√3/3" },
  { degrees: 225, radianLabel: "5π/4", cos: "−√2/2", sin: "−√2/2", tan: "1" },
  { degrees: 240, radianLabel: "4π/3", cos: "−1/2", sin: "−√3/2", tan: "√3" },
  { degrees: 270, radianLabel: "3π/2", cos: "0", sin: "−1", tan: "undefined" },
  { degrees: 300, radianLabel: "5π/3", cos: "1/2", sin: "−√3/2", tan: "−√3" },
  { degrees: 315, radianLabel: "7π/4", cos: "√2/2", sin: "−√2/2", tan: "−1" },
  { degrees: 330, radianLabel: "11π/6", cos: "√3/2", sin: "−1/2", tan: "−√3/3" },
];

/** Which of the six ratios are positive in each quadrant — the "All Students
 * Take Calculus" mnemonic: All in I, Sine in II, Tangent in III, Cosine in IV. */
export const QUADRANT_POSITIVES = {
  I: "All six ratios are positive",
  II: "Only sine and cosecant are positive",
  III: "Only tangent and cotangent are positive",
  IV: "Only cosine and secant are positive",
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Collapse floating-point noise to exact zero. */
function snap(value) {
  return Math.abs(value) < ZERO_EPSILON ? 0 : value;
}

function roundTo(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Degrees to radians.
 * @param {number} degrees
 * @returns {number|null} null when the input is not a finite number
 */
export function degreesToRadians(degrees) {
  if (!isNum(degrees)) return null;
  return degrees / DEGREES_PER_RADIAN;
}

/**
 * Radians to degrees.
 * @param {number} radians
 * @returns {number|null}
 */
export function radiansToDegrees(radians) {
  if (!isNum(radians)) return null;
  return radians * DEGREES_PER_RADIAN;
}

/**
 * Bring any angle into [0, 360) by adding or removing whole turns.
 * @param {number} degrees
 * @returns {number|null}
 */
export function normalizeDegrees(degrees) {
  if (!isNum(degrees)) return null;
  const wrapped = degrees % DEGREES_PER_TURN;
  return wrapped < 0 ? wrapped + DEGREES_PER_TURN : wrapped;
}

/**
 * Quadrant (or axis) of a normalised angle.
 * @param {number} normalizedDegrees angle already in [0, 360)
 * @returns {{ quadrant: "I"|"II"|"III"|"IV"|null, label: string }}
 */
export function quadrantOf(normalizedDegrees) {
  const d = normalizedDegrees;
  if (d === 0) return { quadrant: null, label: "On the positive x-axis" };
  if (d === 90) return { quadrant: null, label: "On the positive y-axis" };
  if (d === 180) return { quadrant: null, label: "On the negative x-axis" };
  if (d === 270) return { quadrant: null, label: "On the negative y-axis" };
  if (d < 90) return { quadrant: "I", label: "Quadrant I" };
  if (d < 180) return { quadrant: "II", label: "Quadrant II" };
  if (d < 270) return { quadrant: "III", label: "Quadrant III" };
  return { quadrant: "IV", label: "Quadrant IV" };
}

/**
 * Reference angle: the acute angle between the terminal side and the x-axis.
 * @param {number} normalizedDegrees angle already in [0, 360)
 * @returns {number}
 */
export function referenceAngleDegrees(normalizedDegrees) {
  const d = normalizedDegrees;
  if (d <= 90) return d;
  if (d <= 180) return 180 - d;
  if (d <= 270) return d - 180;
  return DEGREES_PER_TURN - d;
}

/**
 * Exact surd values, when the angle is one of the 16 special angles.
 * @param {number} normalizedDegrees
 * @returns {{ radianLabel: string, cos: string, sin: string, tan: string }|null}
 */
export function exactValuesFor(normalizedDegrees) {
  const match = SPECIAL_ANGLES.find(
    (entry) => Math.abs(entry.degrees - normalizedDegrees) < 1e-9,
  );
  if (!match) return null;
  return { radianLabel: match.radianLabel, cos: match.cos, sin: match.sin, tan: match.tan };
}

/**
 * Full description of a point on the unit circle.
 *
 * @param {number} value the angle
 * @param {"degrees"|"radians"} unit how `value` is expressed
 * @returns {{
 *   degrees: number, radians: number, normalizedDegrees: number, normalizedRadians: number,
 *   turns: number, x: number, y: number, arcLength: number,
 *   quadrant: string|null, quadrantLabel: string, quadrantNote: string,
 *   referenceDegrees: number, referenceRadians: number,
 *   ratios: Array<{ key: string, label: string, value: number|null, note: string }>,
 *   exact: { radianLabel: string, cos: string, sin: string, tan: string }|null
 * } | { error: string }}
 */
export function describeAngle(value, unit = "degrees") {
  if (!isNum(value)) return { error: "Enter the angle as a number." };
  if (unit !== "degrees" && unit !== "radians") {
    return { error: "Choose degrees or radians for the angle unit." };
  }

  const degrees = unit === "degrees" ? value : radiansToDegrees(value);
  if (Math.abs(degrees) > MAX_ABS_DEGREES) {
    return {
      error: `Keep the angle within ±${MAX_ABS_DEGREES.toLocaleString("en-US")} degrees so the result stays exact.`,
    };
  }

  const normalizedDegrees = normalizeDegrees(degrees);
  const radians = degreesToRadians(degrees);
  const normalizedRadians = degreesToRadians(normalizedDegrees);

  // Evaluate from the normalised angle so 720° and 0° give identical output.
  const cos = snap(Math.cos(normalizedRadians));
  const sin = snap(Math.sin(normalizedRadians));

  const tan = cos === 0 ? null : sin / cos;
  const csc = sin === 0 ? null : 1 / sin;
  const sec = cos === 0 ? null : 1 / cos;
  const cot = sin === 0 ? null : cos / sin;

  const quadrant = quadrantOf(normalizedDegrees);
  const referenceDegrees = referenceAngleDegrees(normalizedDegrees);

  const ratios = [
    { key: "sin", label: "sin θ  (y)", value: roundTo(sin, RATIO_DECIMALS), note: "" },
    { key: "cos", label: "cos θ  (x)", value: roundTo(cos, RATIO_DECIMALS), note: "" },
    {
      key: "tan",
      label: "tan θ  (y / x)",
      value: tan === null ? null : roundTo(snap(tan), RATIO_DECIMALS),
      note: tan === null ? "Undefined: cos θ = 0 here" : "",
    },
    {
      key: "csc",
      label: "csc θ  (1 / sin θ)",
      value: csc === null ? null : roundTo(csc, RATIO_DECIMALS),
      note: csc === null ? "Undefined: sin θ = 0 here" : "",
    },
    {
      key: "sec",
      label: "sec θ  (1 / cos θ)",
      value: sec === null ? null : roundTo(sec, RATIO_DECIMALS),
      note: sec === null ? "Undefined: cos θ = 0 here" : "",
    },
    {
      key: "cot",
      label: "cot θ  (x / y)",
      value: cot === null ? null : roundTo(snap(cot), RATIO_DECIMALS),
      note: cot === null ? "Undefined: sin θ = 0 here" : "",
    },
  ];

  return {
    degrees: roundTo(degrees, 6),
    radians: roundTo(radians, 6),
    normalizedDegrees: roundTo(normalizedDegrees, 6),
    normalizedRadians: roundTo(normalizedRadians, 6),
    turns: roundTo(degrees / DEGREES_PER_TURN, 4),
    x: roundTo(cos, RATIO_DECIMALS),
    y: roundTo(sin, RATIO_DECIMALS),
    // Arc length on a unit circle equals the angle in radians (arc = rθ, r = 1).
    arcLength: roundTo(normalizedRadians, 6),
    quadrant: quadrant.quadrant,
    quadrantLabel: quadrant.label,
    quadrantNote: quadrant.quadrant ? QUADRANT_POSITIVES[quadrant.quadrant] : "Two ratios are undefined on an axis",
    referenceDegrees: roundTo(referenceDegrees, 6),
    referenceRadians: roundTo(degreesToRadians(referenceDegrees), 6),
    ratios,
    exact: exactValuesFor(normalizedDegrees),
  };
}

/**
 * Format an angle in radians as a multiple of π, e.g. 1.5708 -> "0.5π".
 * @param {number} radians
 * @returns {string}
 */
export function formatAsPiMultiple(radians) {
  if (!isNum(radians)) return "—";
  const multiple = radians / Math.PI;
  if (Math.abs(multiple) < ZERO_EPSILON) return "0";
  return `${roundTo(multiple, 4)}π`;
}
