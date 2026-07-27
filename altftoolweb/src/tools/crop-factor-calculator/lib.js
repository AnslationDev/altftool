/**
 * Sensor crop factor and equivalence maths.
 *
 * Crop factor is the ratio of the 35mm "full frame" diagonal to the diagonal
 * of the sensor in question:
 *
 *   crop factor = 43.267 mm / sqrt(width^2 + height^2)
 *
 * because a 36 x 24 mm frame has a diagonal of sqrt(36^2 + 24^2) = 43.267 mm.
 *
 * Full equivalence between two formats then requires three matched changes:
 *
 *   equivalent focal length = focal x crop factor      (same framing)
 *   equivalent f-number     = f-number x crop factor   (same depth of field
 *                                                       and same total light)
 *   equivalent ISO          = ISO x crop factor^2      (same exposure with
 *                                                       that equivalent f-number)
 *
 * Focal length and f-number are properties of the lens and never change — the
 * "equivalent" figures describe what a full-frame camera would need to produce
 * the same photograph.
 *
 * Angle of view comes straight from the geometry:
 *   AoV = 2 * atan(sensor dimension / (2 * focal length))
 *
 * Pure module: no React, no DOM, no clock.
 */

/** The 35mm film frame, and the reference every crop factor is measured against. */
export const FULL_FRAME_WIDTH_MM = 36;
export const FULL_FRAME_HEIGHT_MM = 24;
export const FULL_FRAME_DIAGONAL_MM = Math.sqrt(
  FULL_FRAME_WIDTH_MM ** 2 + FULL_FRAME_HEIGHT_MM ** 2,
);

export const MAX_SENSOR_MM = 200;
export const MAX_FOCAL_MM = 5000;

/**
 * Nominal sensor dimensions in millimetres. Manufacturers vary by a few
 * tenths of a millimetre between bodies, so treat the crop factors as close
 * approximations of a specific camera.
 */
export const SENSOR_PRESETS = [
  { id: "mf-4433", label: "Medium format 44 × 33 (GFX, X1D)", width: 44, height: 33 },
  { id: "ff", label: "Full frame 36 × 24", width: 36, height: 24 },
  { id: "aps-h", label: "APS-H 28.7 × 19", width: 28.7, height: 19 },
  { id: "s35", label: "Super 35 cinema 24.89 × 18.66", width: 24.89, height: 18.66 },
  { id: "aps-c-nikon", label: "APS-C 23.6 × 15.7 (Nikon, Sony, Fujifilm)", width: 23.6, height: 15.7 },
  { id: "aps-c-canon", label: "APS-C 22.3 × 14.9 (Canon)", width: 22.3, height: 14.9 },
  { id: "mft", label: "Micro Four Thirds 17.3 × 13", width: 17.3, height: 13 },
  { id: "one-inch", label: '1" type 13.2 × 8.8', width: 13.2, height: 8.8 },
  { id: "type-1-1-7", label: '1/1.7" type 7.6 × 5.7', width: 7.6, height: 5.7 },
  { id: "type-1-2-3", label: '1/2.3" type 6.17 × 4.55', width: 6.17, height: 4.55 },
];

export const FOCAL_PRESETS = [14, 24, 35, 50, 85, 135, 200, 400];

const isFiniteNumber = (value) => Number.isFinite(value);
const RAD_TO_DEG = 180 / Math.PI;

/** Diagonal of a rectangular sensor in millimetres. */
export function sensorDiagonal(width, height) {
  return Math.sqrt(width * width + height * height);
}

/** Crop factor relative to a 36 × 24 mm frame. */
export function cropFactorFor(width, height) {
  const diagonal = sensorDiagonal(width, height);
  if (!(diagonal > 0)) return null;
  return FULL_FRAME_DIAGONAL_MM / diagonal;
}

/** Angle of view in degrees across a sensor dimension for a given focal length. */
export function angleOfView(sensorDimensionMm, focalLengthMm) {
  if (!(focalLengthMm > 0) || !(sensorDimensionMm > 0)) return null;
  return 2 * Math.atan(sensorDimensionMm / (2 * focalLengthMm)) * RAD_TO_DEG;
}

/**
 * Everything that changes when the same lens sits on a smaller or larger
 * sensor.
 *
 * @returns {object} either { error } or the full equivalence set.
 */
export function computeCropFactor({
  sensorWidth,
  sensorHeight,
  focalLength,
  aperture = 2.8,
  iso = 100,
}) {
  const width = Number(sensorWidth);
  const height = Number(sensorHeight);
  const focal = Number(focalLength);
  const fNumber = Number(aperture);
  const sensitivity = Number(iso);

  if (![width, height, focal, fNumber, sensitivity].every(isFiniteNumber)) {
    return { error: "Enter a number in every field." };
  }
  if (width <= 0 || height <= 0) {
    return { error: "Sensor width and height must both be greater than zero." };
  }
  if (width > MAX_SENSOR_MM || height > MAX_SENSOR_MM) {
    return { error: `Sensor dimensions above ${MAX_SENSOR_MM} mm are out of range.` };
  }
  if (focal <= 0) return { error: "Focal length must be greater than zero." };
  if (focal > MAX_FOCAL_MM) return { error: `Focal lengths above ${MAX_FOCAL_MM} mm are out of range.` };
  if (fNumber <= 0) return { error: "The f-number must be greater than zero." };
  if (sensitivity <= 0) return { error: "ISO must be greater than zero." };

  const diagonal = sensorDiagonal(width, height);
  const crop = FULL_FRAME_DIAGONAL_MM / diagonal;

  return {
    sensorWidth: width,
    sensorHeight: height,
    diagonal,
    cropFactor: crop,
    areaRatio: (FULL_FRAME_WIDTH_MM * FULL_FRAME_HEIGHT_MM) / (width * height),
    focalLength: focal,
    aperture: fNumber,
    iso: sensitivity,
    equivalentFocalLength: focal * crop,
    equivalentAperture: fNumber * crop,
    equivalentIso: sensitivity * crop * crop,
    /** Lens you would fit on THIS sensor to match a full-frame focal length. */
    focalForFullFrameLook: focal / crop,
    horizontalAov: angleOfView(width, focal),
    verticalAov: angleOfView(height, focal),
    diagonalAov: angleOfView(diagonal, focal),
    fullFrameDiagonalAov: angleOfView(FULL_FRAME_DIAGONAL_MM, focal * crop),
    /** Stops of light-gathering difference against full frame, from the area. */
    lightStopsVsFullFrame: Math.log2(
      (FULL_FRAME_WIDTH_MM * FULL_FRAME_HEIGHT_MM) / (width * height),
    ),
  };
}

/**
 * The focal length that gives the same framing on a second sensor.
 * matched focal = focal x (crop of target) / (crop of source)
 */
export function matchFocalAcrossSensors({ focalLength, sourceCrop, targetCrop }) {
  const focal = Number(focalLength);
  const from = Number(sourceCrop);
  const to = Number(targetCrop);
  if (![focal, from, to].every(isFiniteNumber)) return { error: "Enter a number in every field." };
  if (focal <= 0) return { error: "Focal length must be greater than zero." };
  if (from <= 0 || to <= 0) return { error: "Crop factors must be greater than zero." };
  return { focalLength: (focal * from) / to };
}
