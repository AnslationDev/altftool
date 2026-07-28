/**
 * Monitor Height Calculator — pure calculation module.
 *
 * Two published rules govern monitor height and they have to agree:
 *   1. The top of the viewable screen sits at, or slightly below, eye height
 *      (ANSI/HFES 100-2007; OSHA computer-workstation guidance).
 *   2. The centre of the screen sits roughly 15-20 degrees below horizontal eye
 *      level, which is where the eyes rest naturally.
 * This module solves both and reports where they disagree.
 */

/** Sitting eye height above the seat / stature. Pheasant, Bodyspace, 50th pct. */
export const SITTING_EYE_RATIO = 0.454;

/** Standing eye height / stature. Pheasant, Bodyspace, 50th pct. */
export const STANDING_EYE_RATIO = 0.936;

/** Top of the viewable screen: at eye height down to this far below it. */
export const TOP_BELOW_EYE_MIN_CM = 0;
export const TOP_BELOW_EYE_MAX_CM = 5;

/** Comfortable downward gaze angle to the centre of the screen, in degrees. */
export const CENTRE_GAZE_MIN_DEG = 15;
export const CENTRE_GAZE_MAX_DEG = 20;

/** ANSI/HFES 100 comfortable viewing-distance band, in centimetres. */
export const DISTANCE_MIN_CM = 50;
export const DISTANCE_MAX_CM = 100;

/**
 * Single-vision correction looks through the middle of the lens; bifocal and
 * progressive wearers look through the lower segment, so the screen has to come
 * down further to avoid tipping the head back.
 */
export const BIFOCAL_EXTRA_DROP_CM = 7.5;

/** Panel height as a fraction of the diagonal, by aspect ratio. */
export const ASPECT_RATIOS = {
  "16:9": { label: "16:9 — most monitors and TVs", w: 16, h: 9 },
  "16:10": { label: "16:10 — many productivity monitors", w: 16, h: 10 },
  "21:9": { label: "21:9 — ultrawide", w: 21, h: 9 },
  "32:9": { label: "32:9 — super ultrawide", w: 32, h: 9 },
  "4:3": { label: "4:3 — older or square-ish panels", w: 4, h: 3 },
  "3:2": { label: "3:2 — Surface-style panels", w: 3, h: 2 },
};

const CM_PER_INCH = 2.54;
const DEG = Math.PI / 180;

const round1 = (value) => {
  const rounded = Math.round(value * 10) / 10;
  return Object.is(rounded, -0) ? 0 : rounded;
};

/** Visible panel height in centimetres from the diagonal in inches. */
export function panelHeightCm(diagonalInches, aspectKey) {
  const diagonal = Number(diagonalInches);
  const aspect = ASPECT_RATIOS[aspectKey] || ASPECT_RATIOS["16:9"];
  if (!Number.isFinite(diagonal) || diagonal <= 0) return NaN;
  const factor = aspect.h / Math.sqrt(aspect.w * aspect.w + aspect.h * aspect.h);
  return diagonal * factor * CM_PER_INCH;
}

/**
 * @param {object} input
 * @param {string} input.eyeMode            "measured" | "stature"
 * @param {number} input.eyeHeightCm        Floor to eye, used when eyeMode is "measured".
 * @param {number} input.heightCm           Body height, used when eyeMode is "stature".
 * @param {number} input.seatHeightCm       Seat height, used when eyeMode is "stature" and seated.
 * @param {boolean} input.standing          Standing rather than seated (stature mode only).
 * @param {number} input.screenInches       Panel diagonal, 10-60.
 * @param {string} input.aspect             Key of ASPECT_RATIOS.
 * @param {number} input.viewingDistanceCm  Eye to screen, 30-150.
 * @param {number} input.deskHeightCm       Floor to desk surface, 50-130.
 * @param {number} input.panelBottomAboveDeskCm Current gap from desk to bottom of the picture, 0-60.
 * @param {boolean} input.bifocals
 * @returns {object} target heights and the adjustment needed, or { error }.
 */
export function calculateMonitorHeight({
  eyeMode = "stature",
  eyeHeightCm,
  heightCm,
  seatHeightCm,
  standing = false,
  screenInches,
  aspect = "16:9",
  viewingDistanceCm,
  deskHeightCm,
  panelBottomAboveDeskCm,
  bifocals = false,
}) {
  const diagonal = Number(screenInches);
  const distance = Number(viewingDistanceCm);
  const desk = Number(deskHeightCm);
  const panelGap = Number(panelBottomAboveDeskCm);

  if ([diagonal, distance, desk, panelGap].some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }
  if (diagonal < 10 || diagonal > 60) {
    return { error: "Enter a screen diagonal between 10 and 60 inches." };
  }
  if (distance < 30 || distance > 150) {
    return { error: "Viewing distance should be between 30 cm and 150 cm." };
  }
  if (desk < 50 || desk > 130) return { error: "Desk height is usually between 50 cm and 130 cm." };
  if (panelGap < 0 || panelGap > 60) {
    return { error: "The gap from the desk to the bottom of the picture should be 0-60 cm." };
  }

  let eyeHeight;
  if (eyeMode === "measured") {
    const measured = Number(eyeHeightCm);
    if (!Number.isFinite(measured)) return { error: "Enter your measured eye height." };
    if (measured < 60 || measured > 220) {
      return { error: "Measured eye height should be between 60 cm and 220 cm." };
    }
    eyeHeight = measured;
  } else {
    const height = Number(heightCm);
    if (!Number.isFinite(height)) return { error: "Enter your body height." };
    if (height < 120 || height > 220) {
      return { error: "Enter a body height between 120 cm and 220 cm." };
    }
    if (standing) {
      eyeHeight = height * STANDING_EYE_RATIO;
    } else {
      const seat = Number(seatHeightCm);
      if (!Number.isFinite(seat)) return { error: "Enter your seat height." };
      if (seat < 30 || seat > 80) return { error: "Seat height is usually between 30 cm and 80 cm." };
      eyeHeight = seat + height * SITTING_EYE_RATIO;
    }
  }

  const screenHeight = panelHeightCm(diagonal, aspect);
  if (!Number.isFinite(screenHeight) || screenHeight <= 0) {
    return { error: "That screen size and aspect ratio do not give a usable panel height." };
  }

  const bifocalDrop = bifocals ? BIFOCAL_EXTRA_DROP_CM : 0;

  // Rule 1: top of the viewable screen at, to 5 cm below, eye height.
  const topHighCm = eyeHeight - TOP_BELOW_EYE_MIN_CM - bifocalDrop;
  const topLowCm = eyeHeight - TOP_BELOW_EYE_MAX_CM - bifocalDrop;
  const recommendedTopCm = (topHighCm + topLowCm) / 2;
  const recommendedCentreCm = recommendedTopCm - screenHeight / 2;
  const recommendedBottomCm = recommendedTopCm - screenHeight;
  const resultingGazeDeg = (Math.atan((eyeHeight - recommendedCentreCm) / distance) * 180) / Math.PI;

  // Rule 2: centre of the screen 15-20 degrees below horizontal eye level.
  const centreForMinAngle = eyeHeight - distance * Math.tan(CENTRE_GAZE_MIN_DEG * DEG);
  const centreForMaxAngle = eyeHeight - distance * Math.tan(CENTRE_GAZE_MAX_DEG * DEG);
  const gazeRuleTopHighCm = centreForMinAngle + screenHeight / 2;
  const gazeRuleTopLowCm = centreForMaxAngle + screenHeight / 2;
  const rulesAgree =
    resultingGazeDeg >= CENTRE_GAZE_MIN_DEG && resultingGazeDeg <= CENTRE_GAZE_MAX_DEG;

  const currentBottomCm = desk + panelGap;
  const currentTopCm = currentBottomCm + screenHeight;
  const currentCentreCm = currentBottomCm + screenHeight / 2;
  const currentGazeDeg = (Math.atan((eyeHeight - currentCentreCm) / distance) * 180) / Math.PI;
  const adjustCm = recommendedTopCm - currentTopCm;

  const diagonalCm = diagonal * CM_PER_INCH;
  const suggestedDistanceCm = Math.min(DISTANCE_MAX_CM, Math.max(DISTANCE_MIN_CM, diagonalCm));
  const distanceInBand = distance >= DISTANCE_MIN_CM && distance <= DISTANCE_MAX_CM;

  return {
    eyeHeightCm: round1(eyeHeight),
    screenHeightCm: round1(screenHeight),
    screenDiagonalCm: round1(diagonalCm),
    topLowCm: round1(topLowCm),
    topHighCm: round1(topHighCm),
    recommendedTopCm: round1(recommendedTopCm),
    recommendedCentreCm: round1(recommendedCentreCm),
    recommendedBottomCm: round1(recommendedBottomCm),
    resultingGazeDeg: round1(resultingGazeDeg),
    gazeRuleTopLowCm: round1(gazeRuleTopLowCm),
    gazeRuleTopHighCm: round1(gazeRuleTopHighCm),
    rulesAgree,
    currentTopCm: round1(currentTopCm),
    currentCentreCm: round1(currentCentreCm),
    currentBottomCm: round1(currentBottomCm),
    currentGazeDeg: round1(currentGazeDeg),
    adjustCm: round1(adjustCm),
    raiseNeeded: adjustCm > 0.5,
    lowerNeeded: adjustCm < -0.5,
    bifocalDropCm: bifocalDrop,
    suggestedDistanceCm: round1(suggestedDistanceCm),
    distanceInBand,
  };
}
