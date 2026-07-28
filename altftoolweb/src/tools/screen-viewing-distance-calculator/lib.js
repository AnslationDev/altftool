/**
 * Screen Viewing Distance Calculator — logic only. No React, no DOM.
 *
 * Formulas and where they come from:
 *  - Panel width and height from the diagonal and the aspect ratio:
 *      width = diagonal * aw / sqrt(aw^2 + ah^2)
 *  - Pixel density: ppi = sqrt(rw^2 + rh^2) / diagonal (inches).
 *  - "Pixel-free" distance: the distance at which one pixel subtends one
 *    arcminute, the classic 20/20 (6/6) resolution limit. One arcminute is
 *    1/60 of a degree, so distance = pixelPitch / tan(1/60 deg), and
 *    1 / tan(1/60 deg) = 3437.75 (the number of radians-worth of arcminutes,
 *    i.e. 180*60/pi).
 *  - SMPTE EG-18 recommends a 30 degree horizontal field for cinema-style
 *    viewing; THX recommends up to 40 degrees. Distance for a target angle t:
 *      distance = width / (2 * tan(t/2)).
 *  - Desk ergonomics: OSHA and the American Optometric Association put the
 *    monitor roughly 20 to 40 inches (50 to 100 cm) from the eyes, with the
 *    top of the screen at or slightly below eye level and the screen tilted
 *    back 10 to 20 degrees.
 */

/** Arcminutes per radian: 180 * 60 / PI. One pixel per arcminute = 20/20 limit. */
export const ARCMIN_PER_RADIAN = (180 * 60) / Math.PI;

/** Millimetres in an inch. */
export const MM_PER_INCH = 25.4;

/** Centimetres in an inch. */
export const CM_PER_INCH = 2.54;

/** SMPTE EG-18 recommended horizontal viewing angle, in degrees. */
export const SMPTE_ANGLE_DEG = 30;

/** THX recommended maximum horizontal viewing angle, in degrees. */
export const THX_ANGLE_DEG = 40;

/** Ergonomic minimum eye-to-screen distance for desk work, in centimetres. */
export const ERGONOMIC_MIN_CM = 50;

/** Ergonomic maximum eye-to-screen distance for desk work, in centimetres. */
export const ERGONOMIC_MAX_CM = 100;

/** Recommended screen tilt away from vertical, in degrees. */
export const SCREEN_TILT_DEG = [10, 20];

export const ASPECT_RATIOS = [
  { id: "16:9", label: "16:9 (most monitors and TVs)", w: 16, h: 9 },
  { id: "16:10", label: "16:10 (WUXGA laptops, some monitors)", w: 16, h: 10 },
  { id: "21:9", label: "21:9 (ultrawide)", w: 21, h: 9 },
  { id: "32:9", label: "32:9 (super ultrawide)", w: 32, h: 9 },
  { id: "3:2", label: "3:2 (Surface, some laptops)", w: 3, h: 2 },
  { id: "4:3", label: "4:3 (older displays, projectors)", w: 4, h: 3 },
];

export const USE_CASES = [
  {
    id: "desk",
    label: "Desk work (documents, code, spreadsheets)",
    basis: "ergonomic",
    note: "Prioritises the 50-100 cm ergonomic window and pushes to the pixel-free distance inside it.",
  },
  {
    id: "media",
    label: "Films and TV",
    basis: "smpte",
    note: "Uses the SMPTE 30 degree horizontal field, with THX 40 degrees as the closest sensible seat.",
  },
  {
    id: "gaming",
    label: "Gaming (desk or living room)",
    basis: "thx",
    note: "Uses the wider THX 40 degree field, which fills more of your view without losing the corners.",
  },
];

export function findAspect(id) {
  return ASPECT_RATIOS.find((ratio) => ratio.id === id) || null;
}

export function findUseCase(id) {
  return USE_CASES.find((useCase) => useCase.id === id) || null;
}

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

/** Distance (same unit as width) at which a screen of that width fills `angleDeg`. */
export function distanceForAngle(width, angleDeg) {
  if (!isNum(width) || width <= 0 || !isNum(angleDeg) || angleDeg <= 0 || angleDeg >= 180) return null;
  return width / (2 * Math.tan((angleDeg * Math.PI) / 360));
}

/** Horizontal viewing angle in degrees for a given width and distance. */
export function angleForDistance(width, distance) {
  if (!isNum(width) || width <= 0 || !isNum(distance) || distance <= 0) return null;
  return (2 * Math.atan(width / (2 * distance)) * 180) / Math.PI;
}

/**
 * @param {object} input
 * @param {number} input.diagonalInches Screen diagonal in inches.
 * @param {string} input.aspectId       Aspect ratio id from ASPECT_RATIOS.
 * @param {number} input.pixelWidth     Horizontal resolution in pixels.
 * @param {number} input.pixelHeight    Vertical resolution in pixels.
 * @param {string} input.useCaseId      Use case id from USE_CASES.
 * @param {number} input.currentCm      Your current eye-to-screen distance in cm.
 * @returns {object} distances and angles, or { error }.
 */
export function computeViewingDistance({
  diagonalInches,
  aspectId,
  pixelWidth,
  pixelHeight,
  useCaseId,
  currentCm,
} = {}) {
  const aspect = findAspect(aspectId);
  if (!aspect) return { error: "Choose an aspect ratio." };
  const useCase = findUseCase(useCaseId);
  if (!useCase) return { error: "Choose what the screen is mostly used for." };

  if (!isNum(diagonalInches) || !isNum(pixelWidth) || !isNum(pixelHeight) || !isNum(currentCm)) {
    return { error: "Enter a number in every field." };
  }
  if (diagonalInches <= 0) return { error: "Screen diagonal must be greater than zero." };
  if (diagonalInches > 200) return { error: "Enter a diagonal of 200 inches or less." };
  if (pixelWidth <= 0 || pixelHeight <= 0) return { error: "Resolution must be greater than zero in both directions." };
  if (pixelWidth > 20000 || pixelHeight > 20000) return { error: "Enter a resolution below 20000 pixels per side." };
  if (currentCm < 0) return { error: "Your current distance cannot be negative." };

  const diag = Math.hypot(aspect.w, aspect.h);
  const widthIn = (diagonalInches * aspect.w) / diag;
  const heightIn = (diagonalInches * aspect.h) / diag;
  const widthCm = widthIn * CM_PER_INCH;
  const heightCm = heightIn * CM_PER_INCH;

  const ppi = Math.hypot(pixelWidth, pixelHeight) / diagonalInches;
  const pitchMm = MM_PER_INCH / ppi;

  // Distance beyond which a 20/20 eye can no longer resolve individual pixels.
  const pixelFreeCm = (pitchMm * ARCMIN_PER_RADIAN) / 10;

  const smpteCm = distanceForAngle(widthCm, SMPTE_ANGLE_DEG);
  const thxCm = distanceForAngle(widthCm, THX_ANGLE_DEG);

  let recommendedCm;
  let recommendedBasis;
  if (useCase.basis === "ergonomic") {
    // Sit far enough that pixels disappear, but stay inside the desk window.
    const wanted = Math.max(pixelFreeCm, ERGONOMIC_MIN_CM);
    recommendedCm = Math.min(ERGONOMIC_MAX_CM, wanted);
    recommendedBasis =
      pixelFreeCm > ERGONOMIC_MAX_CM
        ? "Capped at the 100 cm ergonomic limit — this panel would need to be further away to hide its pixels"
        : pixelFreeCm > ERGONOMIC_MIN_CM
          ? "Set by pixel density, inside the 50-100 cm ergonomic window"
          : "Set by the 50 cm ergonomic minimum — the pixels are already invisible closer than that";
  } else if (useCase.basis === "smpte") {
    recommendedCm = smpteCm;
    recommendedBasis = "SMPTE 30 degree horizontal field";
  } else {
    recommendedCm = thxCm;
    recommendedBasis = "THX 40 degree horizontal field";
  }

  const currentAngle = currentCm > 0 ? angleForDistance(widthCm, currentCm) : null;
  const pixelsVisibleNow = currentCm > 0 ? currentCm < pixelFreeCm : null;

  const deltaCm = currentCm > 0 ? round1(currentCm - recommendedCm) : null;
  let verdict = "";
  if (currentCm > 0) {
    if (Math.abs(deltaCm) <= 5) verdict = "Your current distance is within 5 cm of the recommendation.";
    else if (deltaCm < 0) verdict = `Move back about ${Math.abs(deltaCm)} cm.`;
    else verdict = `You could move about ${deltaCm} cm closer.`;
  }

  // Top of the screen at or just below eye level, so the centre sits about
  // half the panel height below the top edge.
  const centreBelowTopCm = heightCm / 2;

  return {
    aspect,
    useCase,
    widthCm: round1(widthCm),
    heightCm: round1(heightCm),
    widthIn: round2(widthIn),
    heightIn: round2(heightIn),
    ppi: round1(ppi),
    pitchMm: round2(pitchMm),
    pixelFreeCm: round1(pixelFreeCm),
    smpteCm: round1(smpteCm),
    thxCm: round1(thxCm),
    recommendedCm: round1(recommendedCm),
    recommendedIn: round1(recommendedCm / CM_PER_INCH),
    recommendedBasis,
    recommendedAngle: round1(angleForDistance(widthCm, recommendedCm)),
    ergonomicMinCm: ERGONOMIC_MIN_CM,
    ergonomicMaxCm: ERGONOMIC_MAX_CM,
    currentCm,
    currentAngle: currentAngle === null ? null : round1(currentAngle),
    pixelsVisibleNow,
    deltaCm,
    verdict,
    centreBelowTopCm: round1(centreBelowTopCm),
    tiltDeg: SCREEN_TILT_DEG,
  };
}
