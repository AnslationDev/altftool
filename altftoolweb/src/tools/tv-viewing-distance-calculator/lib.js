/**
 * TV size, seating distance and mounting height maths.
 *
 * Three independent rules are applied:
 *  1. Horizontal viewing angle  - SMPTE and THX recommendations.
 *  2. Pixel acuity limit        - the distance beyond which 20/20 vision can no
 *                                 longer resolve individual pixels, so extra
 *                                 resolution stops being visible.
 *  3. Mounting height           - screen centre at the seated viewer's eye level.
 */

export const CM_PER_INCH = 2.54;

/**
 * SMPTE EG-18 recommends a minimum horizontal viewing angle of 30 degrees for
 * the back row of a review room.
 */
export const SMPTE_ANGLE_DEG = 30;
/** THX recommends about 36 degrees, with 40 degrees as the closest front row. */
export const THX_RECOMMENDED_ANGLE_DEG = 36;
export const THX_MAX_ANGLE_DEG = 40;

/**
 * Snellen 20/20 vision resolves detail subtending one arcminute (1/60 of a
 * degree). Individual pixels become indistinguishable once one pixel subtends
 * less than that.
 */
export const ACUITY_ARCMIN = 1;
export const DEG_PER_ARCMIN = 1 / 60;

/**
 * Typical eye height of an adult sitting on a sofa, floor to eye. Used as the
 * default height for the centre of the screen.
 */
export const DEFAULT_SEATED_EYE_HEIGHT_CM = 105;

/**
 * Ergonomic guidance for screens: keep the top of the display no more than
 * about 15 degrees above the horizontal line of sight to avoid neck strain.
 */
export const MAX_UPWARD_TILT_DEG = 15;

export const RESOLUTIONS = [
  { id: "720p", label: "HD Ready (720p)", horizontal: 1280, vertical: 720 },
  { id: "1080p", label: "Full HD (1080p)", horizontal: 1920, vertical: 1080 },
  { id: "4k", label: "4K UHD (2160p)", horizontal: 3840, vertical: 2160 },
  { id: "8k", label: "8K UHD (4320p)", horizontal: 7680, vertical: 4320 },
];

export const ASPECT_RATIOS = [
  { id: "16:9", label: "16:9 (all modern TVs)", w: 16, h: 9 },
  { id: "21:9", label: "21:9 ultrawide", w: 21, h: 9 },
  { id: "4:3", label: "4:3 (older sets)", w: 4, h: 3 },
];

const round = (value, dp) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

const toRadians = (deg) => (deg * Math.PI) / 180;
const toDegrees = (rad) => (rad * 180) / Math.PI;

/**
 * Panel width and height from the diagonal, using Pythagoras on the aspect ratio.
 * width = diagonal * w / sqrt(w^2 + h^2)
 */
export function screenDimensions(diagonalIn, aspectW = 16, aspectH = 9) {
  const hyp = Math.sqrt(aspectW * aspectW + aspectH * aspectH);
  return {
    widthIn: (diagonalIn * aspectW) / hyp,
    heightIn: (diagonalIn * aspectH) / hyp,
  };
}

/** Seating distance that makes a screen of this width subtend a given angle. */
export function distanceForAngle(widthIn, angleDeg) {
  const half = toRadians(angleDeg / 2);
  const tan = Math.tan(half);
  if (!(tan > 0)) return null;
  return widthIn / 2 / tan;
}

/** Screen width that subtends a given angle from a given distance. */
export function widthForAngle(distanceIn, angleDeg) {
  return 2 * distanceIn * Math.tan(toRadians(angleDeg / 2));
}

/** Actual horizontal viewing angle for a width viewed from a distance. */
export function angleForDistance(widthIn, distanceIn) {
  if (!(distanceIn > 0)) return null;
  return toDegrees(2 * Math.atan(widthIn / 2 / distanceIn));
}

/**
 * Distance at which one pixel subtends exactly one arcminute. Sitting closer
 * than this lets you see the pixel structure; sitting further wastes resolution.
 */
export function pixelAcuityDistanceIn(screenHeightIn, verticalPixels) {
  if (!(verticalPixels > 0) || !(screenHeightIn > 0)) return null;
  const pixelSizeIn = screenHeightIn / verticalPixels;
  return pixelSizeIn / Math.tan(toRadians(ACUITY_ARCMIN * DEG_PER_ARCMIN));
}

/**
 * Full recommendation.
 *
 * @param {object} input
 * @param {number} input.diagonalIn        screen diagonal in inches
 * @param {string} input.resolutionId      one of RESOLUTIONS ids
 * @param {string} input.aspectId          one of ASPECT_RATIOS ids
 * @param {number} input.seatingDistanceCm floor distance from screen to eyes
 * @param {number} input.seatedEyeHeightCm floor to eye height when seated
 */
export function analyseSetup({
  diagonalIn,
  resolutionId = "4k",
  aspectId = "16:9",
  seatingDistanceCm,
  seatedEyeHeightCm = DEFAULT_SEATED_EYE_HEIGHT_CM,
}) {
  const diagonal = Number(diagonalIn);
  const distanceCm = Number(seatingDistanceCm);
  const eyeCm = Number(seatedEyeHeightCm);

  const resolution = RESOLUTIONS.find((item) => item.id === resolutionId);
  const aspect = ASPECT_RATIOS.find((item) => item.id === aspectId);

  if (!resolution) return { error: "Pick a screen resolution." };
  if (!aspect) return { error: "Pick an aspect ratio." };
  if (![diagonal, distanceCm, eyeCm].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for screen size, seating distance and eye height." };
  }
  if (diagonal < 10 || diagonal > 200) {
    return { error: "Enter a screen diagonal between 10 and 200 inches." };
  }
  if (distanceCm <= 0 || distanceCm > 2000) {
    return { error: "Seating distance must be between 1 cm and 20 m." };
  }
  if (eyeCm < 40 || eyeCm > 200) {
    return { error: "Seated eye height should be between 40 cm and 200 cm from the floor." };
  }

  const { widthIn, heightIn } = screenDimensions(diagonal, aspect.w, aspect.h);
  const distanceIn = distanceCm / CM_PER_INCH;

  const smpteIn = distanceForAngle(widthIn, SMPTE_ANGLE_DEG);
  const thxIn = distanceForAngle(widthIn, THX_RECOMMENDED_ANGLE_DEG);
  const thxMinIn = distanceForAngle(widthIn, THX_MAX_ANGLE_DEG);
  const acuityIn = pixelAcuityDistanceIn(heightIn, resolution.vertical);

  const actualAngle = angleForDistance(widthIn, distanceIn);

  let verdict;
  if (actualAngle > THX_MAX_ANGLE_DEG) verdict = "too-close";
  else if (actualAngle >= SMPTE_ANGLE_DEG) verdict = "ideal";
  else if (actualAngle >= SMPTE_ANGLE_DEG - 5) verdict = "acceptable";
  else verdict = "too-far";

  // Screen size that would be ideal from where you actually sit.
  const idealMinDiagonal = (widthForAngle(distanceIn, SMPTE_ANGLE_DEG) * Math.sqrt(aspect.w * aspect.w + aspect.h * aspect.h)) / aspect.w;
  const idealMaxDiagonal = (widthForAngle(distanceIn, THX_MAX_ANGLE_DEG) * Math.sqrt(aspect.w * aspect.w + aspect.h * aspect.h)) / aspect.w;

  // Mounting: screen centre at seated eye level.
  const heightCm = heightIn * CM_PER_INCH;
  const centreHeightCm = eyeCm;
  const bottomHeightCm = centreHeightCm - heightCm / 2;
  const topHeightCm = centreHeightCm + heightCm / 2;
  const topTiltDeg = toDegrees(Math.atan((topHeightCm - eyeCm) / distanceCm));

  return {
    resolutionLabel: resolution.label,
    aspectLabel: aspect.label,
    widthIn: round(widthIn, 1),
    heightIn: round(heightIn, 1),
    widthCm: round(widthIn * CM_PER_INCH, 1),
    heightCm: round(heightCm, 1),
    seatingDistanceCm: round(distanceCm, 1),
    seatingDistanceM: round(distanceCm / 100, 2),
    seatingDistanceFt: round(distanceIn / 12, 2),
    actualAngleDeg: round(actualAngle, 1),
    verdict,
    smpteDistanceCm: round(smpteIn * CM_PER_INCH, 1),
    thxDistanceCm: round(thxIn * CM_PER_INCH, 1),
    thxClosestCm: round(thxMinIn * CM_PER_INCH, 1),
    acuityDistanceCm: round(acuityIn * CM_PER_INCH, 1),
    resolutionFullyUsed: distanceCm <= acuityIn * CM_PER_INCH,
    idealMinDiagonalIn: round(idealMinDiagonal, 1),
    idealMaxDiagonalIn: round(idealMaxDiagonal, 1),
    centreHeightCm: round(centreHeightCm, 1),
    bottomHeightCm: round(bottomHeightCm, 1),
    topHeightCm: round(topHeightCm, 1),
    topTiltDeg: round(topTiltDeg, 1),
    tiltWithinComfort: topTiltDeg <= MAX_UPWARD_TILT_DEG,
    aboveFloorWarning: bottomHeightCm < 0,
  };
}
