/**
 * Ergonomic workstation heights derived from stature.
 *
 * The seat, desk and monitor heights all come from anthropometric ratios of
 * standing height. The ratios below are the standard proportions used in
 * workstation design and match published 50th-percentile adult measurements.
 */

export const CM_PER_INCH = 2.54;

/**
 * Popliteal height (floor to the crease behind the knee) is close to 0.26 of
 * stature. With feet flat and knees near a right angle this is the seat height,
 * plus a heel allowance for shoes.
 */
export const POPLITEAL_RATIO = 0.26;

/**
 * Seated elbow height above the seat pan, forearms horizontal, is close to
 * 0.145 of stature. Desk height = seat height + this.
 */
export const SEATED_ELBOW_ABOVE_SEAT_RATIO = 0.145;

/** Standing elbow height is close to 0.63 of stature - the standing desk height. */
export const STANDING_ELBOW_RATIO = 0.63;

/** Seated eye height above the seat pan is close to 0.45 of stature. */
export const SEATED_EYE_ABOVE_SEAT_RATIO = 0.45;

/** Default heel height allowance for indoor footwear. */
export const DEFAULT_SHOE_ALLOWANCE_CM = 2.5;

/**
 * Screen guidance: the top of the display at or just below eye level, and the
 * centre of the display 15-20 degrees below the horizontal line of sight.
 */
export const MONITOR_GAZE_DOWN_DEG = 15;
export const MONITOR_GAZE_DOWN_MAX_DEG = 20;

/**
 * Viewing distance for a desk monitor: at least arm's length, and scaled with
 * the panel width so a wide screen is not read from too close.
 */
export const MIN_VIEWING_DISTANCE_CM = 50;
export const VIEWING_DISTANCE_WIDTH_FACTOR = 1.2;

/** Clear knee space under the desk top, front to back and floor to underside. */
export const MIN_KNEE_DEPTH_CM = 45;
export const MIN_THIGH_CLEARANCE_CM = 20;

/** Monitors are 16:9; width = diagonal * 16 / sqrt(16^2 + 9^2). */
const ASPECT_HYP = Math.sqrt(16 * 16 + 9 * 9);

const round = (value, dp) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

const toRadians = (deg) => (deg * Math.PI) / 180;

/** Panel width and height in cm for a 16:9 diagonal given in inches. */
export function monitorPanelCm(diagonalIn) {
  const widthIn = (diagonalIn * 16) / ASPECT_HYP;
  const heightIn = (diagonalIn * 9) / ASPECT_HYP;
  return { widthCm: widthIn * CM_PER_INCH, heightCm: heightIn * CM_PER_INCH };
}

/**
 * @param {object} input
 * @param {number} input.heightCm            standing height without shoes
 * @param {number} input.shoeAllowanceCm     heel height of indoor footwear
 * @param {number} input.monitorDiagonalIn   monitor size, 16:9 assumed
 * @param {number|null} input.fixedDeskHeightCm height of a desk you cannot adjust
 */
export function planWorkstation({
  heightCm,
  shoeAllowanceCm = DEFAULT_SHOE_ALLOWANCE_CM,
  monitorDiagonalIn = 24,
  fixedDeskHeightCm = null,
}) {
  const stature = Number(heightCm);
  const shoe = Number(shoeAllowanceCm);
  const diagonal = Number(monitorDiagonalIn);

  if (![stature, shoe, diagonal].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for your height, heel allowance and monitor size." };
  }
  if (stature < 120 || stature > 220) {
    return { error: "Enter a standing height between 120 cm and 220 cm." };
  }
  if (shoe < 0 || shoe > 8) {
    return { error: "Heel allowance should be between 0 cm and 8 cm." };
  }
  if (diagonal < 10 || diagonal > 60) {
    return { error: "Monitor diagonal should be between 10 and 60 inches." };
  }

  const seatHeightCm = stature * POPLITEAL_RATIO + shoe;
  const elbowAboveSeatCm = stature * SEATED_ELBOW_ABOVE_SEAT_RATIO;
  const deskHeightCm = seatHeightCm + elbowAboveSeatCm;
  const standingDeskHeightCm = stature * STANDING_ELBOW_RATIO;
  const seatedEyeHeightCm = seatHeightCm + stature * SEATED_EYE_ABOVE_SEAT_RATIO;

  const panel = monitorPanelCm(diagonal);
  const viewingDistanceCm = Math.max(
    MIN_VIEWING_DISTANCE_CM,
    panel.widthCm * VIEWING_DISTANCE_WIDTH_FACTOR,
  );

  // Two published constraints on where the screen sits.
  const centreAtGazeCm = seatedEyeHeightCm - viewingDistanceCm * Math.tan(toRadians(MONITOR_GAZE_DOWN_DEG));
  const centreTopAtEyeCm = seatedEyeHeightCm - panel.heightCm / 2;
  const monitorCentreCm = Math.min(centreAtGazeCm, centreTopAtEyeCm);
  const monitorTopCm = monitorCentreCm + panel.heightCm / 2;
  const monitorBottomCm = monitorCentreCm - panel.heightCm / 2;
  const riserAboveDeskCm = monitorBottomCm - deskHeightCm;

  const notes = [];
  let fixedDesk = null;
  const fixed = fixedDeskHeightCm === null || fixedDeskHeightCm === "" ? null : Number(fixedDeskHeightCm);
  if (fixed !== null) {
    if (!Number.isFinite(fixed) || fixed < 50 || fixed > 130) {
      return { error: "A fixed desk height should be between 50 cm and 130 cm, or left blank." };
    }
    const seatForDeskCm = fixed - elbowAboveSeatCm;
    const footrestHeightCm = Math.max(0, seatForDeskCm - seatHeightCm);
    const thighClearanceCm = fixed - seatForDeskCm;
    fixedDesk = {
      deskHeightCm: round(fixed, 1),
      seatForDeskCm: round(seatForDeskCm, 1),
      footrestHeightCm: round(footrestHeightCm, 1),
      needsFootrest: footrestHeightCm > 1,
      deskTooLowCm: round(Math.max(0, deskHeightCm - fixed), 1),
      thighClearanceCm: round(thighClearanceCm, 1),
    };
    if (footrestHeightCm > 1) {
      notes.push(
        `Raise the chair to ${round(seatForDeskCm, 1)} cm for this desk and add a footrest of ${round(footrestHeightCm, 1)} cm so your feet stay supported.`,
      );
    } else if (deskHeightCm - fixed > 1) {
      notes.push(
        `This desk is ${round(deskHeightCm - fixed, 1)} cm lower than your ideal height, so you will reach down to type. Raising it on risers is the cleanest fix.`,
      );
    } else {
      notes.push("This desk height is within a centimetre of your ideal — no footrest or riser needed.");
    }
  }

  if (riserAboveDeskCm < 0) {
    notes.push(
      `Your monitor centre lands below the desk top, which means the screen is larger than this seated position suits. Move the screen back or use a smaller panel.`,
    );
  } else if (riserAboveDeskCm > 25) {
    notes.push(
      `A ${round(riserAboveDeskCm, 1)} cm gap between desk and the bottom of the screen usually needs a monitor arm rather than a stand.`,
    );
  }

  return {
    statureCm: round(stature, 1),
    seatHeightCm: round(seatHeightCm, 1),
    deskHeightCm: round(deskHeightCm, 1),
    standingDeskHeightCm: round(standingDeskHeightCm, 1),
    seatedEyeHeightCm: round(seatedEyeHeightCm, 1),
    elbowAboveSeatCm: round(elbowAboveSeatCm, 1),
    monitorWidthCm: round(panel.widthCm, 1),
    monitorHeightCm: round(panel.heightCm, 1),
    viewingDistanceCm: round(viewingDistanceCm, 1),
    monitorCentreCm: round(monitorCentreCm, 1),
    monitorTopCm: round(monitorTopCm, 1),
    monitorBottomCm: round(monitorBottomCm, 1),
    riserAboveDeskCm: round(riserAboveDeskCm, 1),
    centreAtGazeCm: round(centreAtGazeCm, 1),
    centreTopAtEyeCm: round(centreTopAtEyeCm, 1),
    minKneeDepthCm: MIN_KNEE_DEPTH_CM,
    minThighClearanceCm: MIN_THIGH_CLEARANCE_CM,
    fixedDesk,
    notes,
  };
}
