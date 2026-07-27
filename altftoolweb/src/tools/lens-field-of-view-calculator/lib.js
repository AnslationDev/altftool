/**
 * Lens Field of View Calculator — camera optics, done with the real formulas.
 *
 * Angle of view (the thin-lens formula used by every lens manufacturer):
 *     AOV = 2 · arctan( sensorDimension / (2 · focalLength) )
 * applied separately to the sensor width, height and diagonal.
 *
 * Scene coverage at a subject distance D (D measured from the lens):
 *     coverage = 2 · D · tan(AOV / 2)   which reduces to  D · sensorDimension / f
 *
 * Crop factor is the ratio of the 35 mm full-frame diagonal to the sensor
 * diagonal, and the "35 mm equivalent" focal length is f × crop factor.
 *
 * Depth of field uses the hyperfocal distance
 *     H = f² / (N · c) + f
 * with the circle of confusion c taken as sensorDiagonal / 1500, the Zeiss
 * convention that most published DoF tables use.
 *
 * All lengths are millimetres inside the module; distances are accepted in
 * metres and converted, and coverage is returned in metres.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Millimetres in a metre. */
export const MM_PER_METRE = 1000;

/** 35 mm full frame is 36 × 24 mm — the reference for crop factor. */
export const FULL_FRAME_WIDTH_MM = 36;
export const FULL_FRAME_HEIGHT_MM = 24;

/**
 * Circle of confusion = sensor diagonal / 1500. The "d/1500" (Zeiss) rule is
 * the basis of most published depth-of-field tables; it gives 0.029 mm on full
 * frame, close to the 0.03 mm figure printed on older lens barrels.
 */
export const COC_DIVISOR = 1500;

/** Sensor sizes in millimetres (manufacturer specifications). */
export const SENSOR_PRESETS = [
  { id: "medium-44x33", label: "Medium format 44 × 33 (GFX, X1D)", width: 44, height: 33 },
  { id: "full-frame", label: "Full frame 36 × 24", width: 36, height: 24 },
  { id: "aps-c-sony", label: "APS-C Sony / Nikon / Fuji 23.5 × 15.6", width: 23.5, height: 15.6 },
  { id: "aps-c-canon", label: "APS-C Canon 22.3 × 14.9", width: 22.3, height: 14.9 },
  { id: "super-35", label: "Super 35 cinema 24.89 × 18.66", width: 24.89, height: 18.66 },
  { id: "mft", label: "Micro Four Thirds 17.3 × 13", width: 17.3, height: 13 },
  { id: "one-inch", label: '1" type 13.2 × 8.8', width: 13.2, height: 8.8 },
  { id: "one-over-1p7", label: '1/1.7" type 7.6 × 5.7', width: 7.6, height: 5.7 },
  { id: "one-over-2p3", label: '1/2.3" compact & drone 6.17 × 4.55', width: 6.17, height: 4.55 },
  { id: "phone-1over2p55", label: '1/2.55" phone 5.6 × 4.2', width: 5.6, height: 4.2 },
];

/** Sanity bounds — beyond these the thin-lens model stops being useful. */
export const MIN_FOCAL_MM = 1;
export const MAX_FOCAL_MM = 5000;
export const MAX_SENSOR_MM = 200;
export const MAX_DISTANCE_M = 100000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const toDegrees = (radians) => (radians * 180) / Math.PI;
const toRadians = (degrees) => (degrees * Math.PI) / 180;

/** Pythagorean sensor diagonal in millimetres. */
export function diagonalMm(width, height) {
  if (!isNum(width) || !isNum(height) || width <= 0 || height <= 0) return null;
  return Math.sqrt(width * width + height * height);
}

/** Full-frame diagonal, 43.2666 mm. */
export const FULL_FRAME_DIAGONAL_MM = Math.sqrt(
  FULL_FRAME_WIDTH_MM * FULL_FRAME_WIDTH_MM + FULL_FRAME_HEIGHT_MM * FULL_FRAME_HEIGHT_MM,
);

/**
 * Crop factor: how much smaller the sensor's diagonal is than full frame.
 *
 * @returns {number | null}
 */
export function cropFactor(width, height) {
  const diagonal = diagonalMm(width, height);
  if (!diagonal) return null;
  return FULL_FRAME_DIAGONAL_MM / diagonal;
}

/**
 * Angle of view in degrees for one sensor dimension.
 *
 * @param {number} sensorMm the sensor's width, height or diagonal
 * @param {number} focalMm
 * @returns {number | null}
 */
export function angleOfView(sensorMm, focalMm) {
  if (!isNum(sensorMm) || !isNum(focalMm) || sensorMm <= 0 || focalMm <= 0) return null;
  return toDegrees(2 * Math.atan(sensorMm / (2 * focalMm)));
}

/**
 * Scene width or height covered at a given distance, in metres.
 *
 * @param {number} angleDegrees angle of view for that axis
 * @param {number} distanceM subject distance in metres
 * @returns {number | null}
 */
export function coverageAtDistance(angleDegrees, distanceM) {
  if (!isNum(angleDegrees) || !isNum(distanceM) || angleDegrees <= 0 || distanceM <= 0) return null;
  return 2 * distanceM * Math.tan(toRadians(angleDegrees) / 2);
}

/**
 * Hyperfocal distance in millimetres: H = f² / (N · c) + f.
 *
 * @param {number} focalMm
 * @param {number} aperture f-number N
 * @param {number} cocMm circle of confusion
 * @returns {number | null}
 */
export function hyperfocalMm(focalMm, aperture, cocMm) {
  if (!isNum(focalMm) || !isNum(aperture) || !isNum(cocMm)) return null;
  if (focalMm <= 0 || aperture <= 0 || cocMm <= 0) return null;
  return (focalMm * focalMm) / (aperture * cocMm) + focalMm;
}

/**
 * Depth of field limits in millimetres for a focus distance.
 *
 * near = H·D / (H + (D − f)),  far = H·D / (H − (D − f)), with the far limit
 * infinite once the focus distance reaches the hyperfocal distance.
 *
 * @returns {{ near: number, far: number | null, total: number | null } | null}
 */
export function depthOfFieldMm(focalMm, aperture, cocMm, focusMm) {
  const hyperfocal = hyperfocalMm(focalMm, aperture, cocMm);
  if (!hyperfocal || !isNum(focusMm) || focusMm <= 0) return null;
  const near = (hyperfocal * focusMm) / (hyperfocal + (focusMm - focalMm));
  const farDenominator = hyperfocal - (focusMm - focalMm);
  const far = farDenominator <= 0 ? null : (hyperfocal * focusMm) / farDenominator;
  return { near, far, total: far === null ? null : far - near };
}

/**
 * Everything the tool shows for one lens on one sensor.
 *
 * @param {object} input
 * @param {number} input.focalLength focal length in millimetres
 * @param {number} input.sensorWidth sensor width in millimetres
 * @param {number} input.sensorHeight sensor height in millimetres
 * @param {number} input.distance subject distance in metres
 * @param {number} [input.aperture] f-number, for the depth-of-field figures
 * @returns {object} result, or { error }
 */
export function calculateFieldOfView({
  focalLength,
  sensorWidth,
  sensorHeight,
  distance,
  aperture = 5.6,
}) {
  if (!isNum(focalLength) || focalLength <= 0) {
    return { error: "Enter a focal length greater than zero." };
  }
  if (focalLength < MIN_FOCAL_MM || focalLength > MAX_FOCAL_MM) {
    return { error: `Focal length must be between ${MIN_FOCAL_MM} mm and ${MAX_FOCAL_MM} mm.` };
  }
  if (!isNum(sensorWidth) || !isNum(sensorHeight) || sensorWidth <= 0 || sensorHeight <= 0) {
    return { error: "Sensor width and height must both be greater than zero." };
  }
  if (sensorWidth > MAX_SENSOR_MM || sensorHeight > MAX_SENSOR_MM) {
    return { error: `Sensor dimensions above ${MAX_SENSOR_MM} mm are outside this calculator's range.` };
  }
  if (!isNum(distance) || distance <= 0) {
    return { error: "Enter a subject distance greater than zero." };
  }
  if (distance > MAX_DISTANCE_M) {
    return { error: `Keep the subject distance under ${MAX_DISTANCE_M} m.` };
  }
  if (!isNum(aperture) || aperture <= 0) {
    return { error: "Enter an f-number greater than zero, such as 2.8 or 8." };
  }
  // A thin lens forms a real image only when the subject sits further away
  // than one focal length, so anything closer cannot be focused at all.
  if (distance * MM_PER_METRE <= focalLength) {
    return {
      error: `A ${focalLength} mm lens cannot focus on a subject closer than ${focalLength} mm — increase the distance.`,
    };
  }

  const sensorDiagonal = diagonalMm(sensorWidth, sensorHeight);
  const crop = FULL_FRAME_DIAGONAL_MM / sensorDiagonal;
  const coc = sensorDiagonal / COC_DIVISOR;

  const horizontalAov = angleOfView(sensorWidth, focalLength);
  const verticalAov = angleOfView(sensorHeight, focalLength);
  const diagonalAov = angleOfView(sensorDiagonal, focalLength);

  const coverageWidth = coverageAtDistance(horizontalAov, distance);
  const coverageHeight = coverageAtDistance(verticalAov, distance);

  const focusMm = distance * MM_PER_METRE;
  // Thin-lens magnification: m = f / (D − f). Undefined once the subject is at
  // or inside the focal length, where nothing can be brought to focus.
  const magnification = focusMm > focalLength ? focalLength / (focusMm - focalLength) : null;

  const hyperfocal = hyperfocalMm(focalLength, aperture, coc);
  const dof = depthOfFieldMm(focalLength, aperture, coc, focusMm);

  return {
    focalLength,
    aperture,
    sensorWidth,
    sensorHeight,
    sensorDiagonal,
    cropFactor: crop,
    equivalentFocalLength: focalLength * crop,
    circleOfConfusion: coc,
    horizontalAov,
    verticalAov,
    diagonalAov,
    coverageWidth,
    coverageHeight,
    coverageArea: coverageWidth * coverageHeight,
    magnification,
    hyperfocalM: hyperfocal / MM_PER_METRE,
    nearLimitM: dof ? dof.near / MM_PER_METRE : null,
    farLimitM: dof && dof.far !== null ? dof.far / MM_PER_METRE : null,
    depthOfFieldM: dof && dof.total !== null ? dof.total / MM_PER_METRE : null,
    distance,
  };
}

/** Focal lengths used by the built-in comparison table (millimetres). */
export const COMPARISON_FOCAL_LENGTHS = [14, 24, 35, 50, 85, 135, 200, 400];

/**
 * The same sensor and distance across a set of focal lengths, for the
 * side-by-side table.
 *
 * @param {object} input same shape as calculateFieldOfView, minus focalLength
 * @param {number[]} [focalLengths]
 * @returns {Array<object>} rows; empty when the base input is invalid
 */
export function buildLensComparison(input, focalLengths = COMPARISON_FOCAL_LENGTHS) {
  const rows = [];
  for (const focalLength of focalLengths) {
    const result = calculateFieldOfView({ ...input, focalLength });
    if (result.error) continue;
    rows.push({
      focalLength,
      diagonalAov: result.diagonalAov,
      horizontalAov: result.horizontalAov,
      coverageWidth: result.coverageWidth,
      equivalentFocalLength: result.equivalentFocalLength,
    });
  }
  return rows;
}

/**
 * Distance needed to frame a subject of a known height, in metres.
 * From coverage = D · sensorHeight / f, rearranged for D.
 *
 * @param {number} subjectHeightM
 * @param {number} focalLength millimetres
 * @param {number} sensorHeight millimetres
 * @returns {{ distance: number } | { error: string }}
 */
export function distanceToFrameSubject(subjectHeightM, focalLength, sensorHeight) {
  if (!isNum(subjectHeightM) || subjectHeightM <= 0) {
    return { error: "Enter a subject height greater than zero." };
  }
  if (!isNum(focalLength) || focalLength <= 0 || !isNum(sensorHeight) || sensorHeight <= 0) {
    return { error: "Enter a valid focal length and sensor height." };
  }
  return { distance: (subjectHeightM * focalLength) / sensorHeight };
}
