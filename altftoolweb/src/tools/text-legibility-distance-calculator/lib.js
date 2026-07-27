/**
 * Text legibility by visual angle.
 *
 * Legibility does not depend on physical letter height on its own — it depends on
 * the angle the letter subtends at the eye. Human-factors standards state the
 * requirement that way: ANSI/HFES 100 and ISO 9241-303 put the recommended
 * character height at roughly 20 to 22 minutes of arc, with about 16 arcminutes as
 * the absolute floor before reading accuracy falls away. Safety and wayfinding
 * signage is normally set larger still, near 30 arcminutes — which is exactly the
 * familiar "one inch of letter height per ten feet of viewing distance" rule.
 *
 * Cap height h for a viewing distance D at angle theta:
 *     h = 2 * D * tan(theta / 2)
 */

export const MM_PER_INCH = 25.4;
export const POINTS_PER_INCH = 72; // PostScript / CSS point
export const ARCMIN_PER_DEGREE = 60;
export const DEGREES_PER_RADIAN = 180 / Math.PI;

/** Conversion factors into millimetres. */
export const DISTANCE_UNITS = Object.freeze({
  mm: { label: "millimetres", toMm: 1 },
  cm: { label: "centimetres", toMm: 10 },
  m: { label: "metres", toMm: 1000 },
  in: { label: "inches", toMm: MM_PER_INCH },
  ft: { label: "feet", toMm: MM_PER_INCH * 12 },
});

/**
 * Legibility targets in minutes of arc.
 * 30' matches the 1 inch per 10 ft signage rule; 20-22' is the ISO 9241-303 /
 * ANSI-HFES 100 recommended range; 16' is the accepted minimum for accurate reading.
 */
export const LEGIBILITY_LEVELS = Object.freeze([
  {
    id: "signage",
    label: "Signage and wayfinding",
    arcmin: 30,
    note: "Read at a glance, in motion or in poor light. Equivalent to 1 inch of cap height per 10 ft.",
  },
  {
    id: "comfortable",
    label: "Comfortable reading",
    arcmin: 22,
    note: "Upper end of the ISO 9241-303 recommended range — the safe default for slides and posters.",
  },
  {
    id: "standard",
    label: "Standard recommended",
    arcmin: 20,
    note: "Lower end of the recommended range for sustained reading by adults with normal vision.",
  },
  {
    id: "minimum",
    label: "Absolute minimum",
    arcmin: 16,
    note: "The floor before reading speed and accuracy drop off. Do not use for anything important.",
  },
]);

/**
 * Cap height as a fraction of the em for common typeface classes.
 * Measured from the fonts named: cap height divided by units per em.
 */
export const CAP_HEIGHT_RATIOS = Object.freeze([
  { id: "grotesque", label: "Grotesque sans (Helvetica, Arial)", ratio: 0.716 },
  { id: "geometric", label: "Geometric sans (Futura, Poppins)", ratio: 0.7 },
  { id: "screen-serif", label: "Screen serif (Georgia)", ratio: 0.692 },
  { id: "text-serif", label: "Transitional serif (Times)", ratio: 0.662 },
]);

export const MIN_ARCMIN = 1;
export const MAX_ARCMIN = 600; // 10 degrees — beyond this it is a graphic, not text
export const MIN_CAP_RATIO = 0.4;
export const MAX_CAP_RATIO = 1;
export const MAX_DISTANCE_MM = 10_000_000; // 10 km

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Convert a distance in a supported unit to millimetres. Returns null if unusable. */
export function toMillimetres(value, unit) {
  const spec = DISTANCE_UNITS[unit];
  if (!spec || !isFiniteNumber(value)) return null;
  return value * spec.toMm;
}

/** Minutes of arc to radians. */
export function arcminToRadians(arcmin) {
  if (!isFiniteNumber(arcmin)) return NaN;
  return (arcmin / ARCMIN_PER_DEGREE) * (Math.PI / 180);
}

/** Cap height in mm that subtends `arcmin` at `distanceMm`. */
export function capHeightMmFor(distanceMm, arcmin) {
  if (!isFiniteNumber(distanceMm) || !isFiniteNumber(arcmin)) return NaN;
  return 2 * distanceMm * Math.tan(arcminToRadians(arcmin) / 2);
}

/** The furthest distance (mm) at which a given cap height still subtends `arcmin`. */
export function maxDistanceMmFor(capHeightMm, arcmin) {
  if (!isFiniteNumber(capHeightMm) || !isFiniteNumber(arcmin)) return NaN;
  const halfAngle = arcminToRadians(arcmin) / 2;
  const tangent = Math.tan(halfAngle);
  if (!(tangent > 0)) return NaN;
  return capHeightMm / (2 * tangent);
}

/**
 * Full legibility result for one viewing distance.
 *
 * @param {object} input
 * @param {number} input.distance          viewing distance value
 * @param {string} input.distanceUnit      key of DISTANCE_UNITS
 * @param {number} input.arcmin            target visual angle in minutes of arc
 * @param {number} input.capHeightRatio    cap height as a fraction of the em
 * @param {number} [input.screenHeight]    physical height of the display or artwork
 * @param {string} [input.screenHeightUnit]
 * @param {number} [input.canvasHeightPx]  pixel height of the artboard or slide
 * @returns {object} sizes in mm, inches, points and pixels, or { error }
 */
export function computeLegibleTextSize({
  distance,
  distanceUnit = "m",
  arcmin,
  capHeightRatio,
  screenHeight = 0,
  screenHeightUnit = "m",
  canvasHeightPx = 0,
} = {}) {
  if (!DISTANCE_UNITS[distanceUnit]) return { error: "Choose a valid distance unit." };
  if (!isFiniteNumber(distance) || distance <= 0) {
    return { error: "Enter a viewing distance greater than zero." };
  }
  const distanceMm = toMillimetres(distance, distanceUnit);
  if (distanceMm === null || distanceMm > MAX_DISTANCE_MM) {
    return { error: "Viewing distance must be 10 km or less." };
  }
  if (!isFiniteNumber(arcmin) || arcmin < MIN_ARCMIN || arcmin > MAX_ARCMIN) {
    return { error: `Visual angle must be between ${MIN_ARCMIN} and ${MAX_ARCMIN} minutes of arc.` };
  }
  if (
    !isFiniteNumber(capHeightRatio) ||
    capHeightRatio < MIN_CAP_RATIO ||
    capHeightRatio > MAX_CAP_RATIO
  ) {
    return {
      error: `Cap height ratio must be between ${MIN_CAP_RATIO} and ${MAX_CAP_RATIO} of the em.`,
    };
  }

  const capHeightMm = capHeightMmFor(distanceMm, arcmin);
  const emHeightMm = capHeightMm / capHeightRatio;
  const fontSizePt = (emHeightMm / MM_PER_INCH) * POINTS_PER_INCH;

  // Cross-check against the classic signage rule of thumb: 1 inch per 10 ft.
  const distanceFt = distanceMm / DISTANCE_UNITS.ft.toMm;
  const ruleOfThumbCapIn = distanceFt / 10;

  const result = {
    distanceMm,
    distanceFt,
    arcmin,
    capHeightRatio,
    capHeightMm,
    capHeightIn: capHeightMm / MM_PER_INCH,
    capHeightCm: capHeightMm / 10,
    emHeightMm,
    fontSizePt,
    fontSizeMm: emHeightMm,
    ruleOfThumbCapIn,
    ruleOfThumbCapMm: ruleOfThumbCapIn * MM_PER_INCH,
    xHeightMm: capHeightMm * 0.72, // typical x-height/cap-height ratio for text faces
    onScreen: null,
  };

  const screenHeightMm = toMillimetres(screenHeight, screenHeightUnit);
  if (
    screenHeightMm !== null &&
    screenHeightMm > 0 &&
    isFiniteNumber(canvasHeightPx) &&
    canvasHeightPx > 0
  ) {
    const shareOfScreen = capHeightMm / screenHeightMm;
    result.onScreen = {
      screenHeightMm,
      canvasHeightPx,
      shareOfScreenPct: shareOfScreen * 100,
      capHeightPx: shareOfScreen * canvasHeightPx,
      fontSizePx: (shareOfScreen * canvasHeightPx) / capHeightRatio,
      fitsOnScreen: shareOfScreen <= 1,
    };
  }

  return result;
}

/**
 * The same cap height evaluated at every legibility level, so you can see how far
 * a chosen size actually carries.
 */
export function buildDistanceLadder(capHeightMm, unit = "m") {
  if (!isFiniteNumber(capHeightMm) || capHeightMm <= 0) return [];
  const spec = DISTANCE_UNITS[unit];
  if (!spec) return [];
  return LEGIBILITY_LEVELS.map((level) => {
    const mm = maxDistanceMmFor(capHeightMm, level.arcmin);
    return {
      id: level.id,
      label: level.label,
      arcmin: level.arcmin,
      distanceMm: mm,
      distance: mm / spec.toMm,
      unit,
    };
  });
}
