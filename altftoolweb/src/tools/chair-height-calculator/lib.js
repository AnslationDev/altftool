/**
 * Chair Height Calculator — pure calculation module.
 *
 * Seat height is set by one measurement: popliteal height, the distance from the
 * floor to the crease behind your knee while seated with your feet flat. Every
 * other number on this page follows from it.
 */

/** Popliteal (seat) height / stature. Pheasant, Bodyspace, 50th-percentile adult. */
export const POPLITEAL_RATIO = 0.25;

/** Buttock-to-popliteal length (usable seat depth) / stature. Pheasant, 50th pct. */
export const BUTTOCK_POPLITEAL_RATIO = 0.29;

/** Sitting elbow height above the seat / stature. Pheasant, 50th pct. */
export const SITTING_ELBOW_RATIO = 0.133;

/** Thigh clearance (seat surface to top of thigh) / stature. Pheasant, 50th pct. */
export const THIGH_THICKNESS_RATIO = 0.094;

/** Gap left behind the knee so the seat front edge does not press on the calf. */
export const KNEE_CLEARANCE_CM = 5;

/** Free space wanted above the thigh, under the desk. */
export const THIGH_AIR_GAP_CM = 2;

/**
 * OSHA computer-workstation guidance for knee space under a work surface:
 * at least 20 inches (51 cm) wide and 15 inches (38 cm) deep at knee level.
 */
export const KNEE_SPACE_WIDTH_CM = 51;
export const KNEE_SPACE_DEPTH_CM = 38;

/** Desk-to-elbow mismatch small enough to ignore. */
export const FIT_TOLERANCE_CM = 2;

const round1 = (value) => {
  const rounded = Math.round(value * 10) / 10;
  return Object.is(rounded, -0) ? 0 : rounded;
};

/**
 * @param {object} input
 * @param {string} input.mode          "measured" (popliteal) or "stature".
 * @param {number} input.poplitealCm   Floor to back of knee, seated, 25-65.
 * @param {number} input.heightCm      Body height, 120-220.
 * @param {number} input.shoeHeelCm    Heel thickness of the shoes you wear, 0-15.
 * @param {number} input.deskHeightCm  Current desk height, 50-130.
 * @param {boolean} input.deskAdjustable
 * @param {number} input.deskApronCm   Thickness of the desk top plus any frame under it, 0-15.
 * @returns {object} chair and desk targets, or { error }.
 */
export function calculateChairHeight({
  mode = "measured",
  poplitealCm,
  heightCm,
  shoeHeelCm,
  deskHeightCm,
  deskAdjustable = false,
  deskApronCm,
}) {
  const shoe = Number(shoeHeelCm);
  const desk = Number(deskHeightCm);
  const apron = Number(deskApronCm);

  if ([shoe, desk, apron].some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }
  if (shoe < 0 || shoe > 15) return { error: "Heel thickness should be between 0 cm and 15 cm." };
  if (desk < 50 || desk > 130) return { error: "Desk height is usually between 50 cm and 130 cm." };
  if (apron < 0 || apron > 15) {
    return { error: "Desk top plus under-frame thickness should be between 0 cm and 15 cm." };
  }

  let popliteal;
  let stature;

  if (mode === "stature") {
    const height = Number(heightCm);
    if (!Number.isFinite(height)) return { error: "Enter your body height." };
    if (height < 120 || height > 220) {
      return { error: "Enter a body height between 120 cm and 220 cm." };
    }
    stature = height;
    popliteal = height * POPLITEAL_RATIO;
  } else {
    const measured = Number(poplitealCm);
    if (!Number.isFinite(measured)) return { error: "Enter your popliteal height." };
    if (measured < 25 || measured > 65) {
      return { error: "Popliteal height is usually between 25 cm and 65 cm — measure floor to the back of the knee." };
    }
    popliteal = measured;
    // Working the stature back out lets the elbow, thigh and seat-depth
    // proportions follow from the same measurement.
    stature = measured / POPLITEAL_RATIO;
  }

  const idealSeatCm = popliteal + shoe;
  const seatDepthCm = stature * BUTTOCK_POPLITEAL_RATIO - KNEE_CLEARANCE_CM;
  const elbowAboveSeatCm = stature * SITTING_ELBOW_RATIO;
  const idealDeskCm = idealSeatCm + elbowAboveSeatCm;
  const thighThicknessCm = stature * THIGH_THICKNESS_RATIO;

  // With a fixed desk, the seat has to move to the desk and the feet need help.
  const seatForFixedDeskCm = desk - elbowAboveSeatCm;
  // An adjustable desk comes to you, so the seat stays at its ideal height and
  // no footrest is needed.
  const footrestCm = deskAdjustable ? 0 : Math.max(0, seatForFixedDeskCm - idealSeatCm);
  const deskRaiseCm = Math.max(0, idealDeskCm - desk);
  const deskLowerCm = Math.max(0, desk - idealDeskCm);

  const workingSeatCm = deskAdjustable ? idealSeatCm : Math.max(idealSeatCm, seatForFixedDeskCm);
  const recommendedDeskCm = deskAdjustable ? idealDeskCm : desk;
  const underDeskClearanceCm = recommendedDeskCm - apron;
  const thighTopCm = workingSeatCm + thighThicknessCm;
  const thighGapCm = underDeskClearanceCm - thighTopCm;
  const thighClearanceOk = thighGapCm >= THIGH_AIR_GAP_CM;

  const deskDeltaCm = desk - idealDeskCm;
  const deskFits = Math.abs(deskDeltaCm) <= FIT_TOLERANCE_CM;

  return {
    mode,
    poplitealCm: round1(popliteal),
    statureCm: round1(stature),
    statureEstimated: mode === "measured",
    idealSeatCm: round1(idealSeatCm),
    seatDepthCm: round1(seatDepthCm),
    elbowAboveSeatCm: round1(elbowAboveSeatCm),
    idealDeskCm: round1(idealDeskCm),
    deskDeltaCm: round1(deskDeltaCm),
    deskFits,
    deskAdjustable: Boolean(deskAdjustable),
    seatForFixedDeskCm: round1(seatForFixedDeskCm),
    workingSeatCm: round1(workingSeatCm),
    recommendedDeskCm: round1(recommendedDeskCm),
    footrestCm: round1(footrestCm),
    deskRaiseCm: round1(deskRaiseCm),
    deskLowerCm: round1(deskLowerCm),
    thighThicknessCm: round1(thighThicknessCm),
    thighTopCm: round1(thighTopCm),
    underDeskClearanceCm: round1(underDeskClearanceCm),
    thighGapCm: round1(thighGapCm),
    thighClearanceOk,
    // How much the desk has to come up to restore the wanted air gap.
    thighRiserNeededCm: thighClearanceOk ? 0 : round1(THIGH_AIR_GAP_CM - thighGapCm),
    kneeSpaceWidthCm: KNEE_SPACE_WIDTH_CM,
    kneeSpaceDepthCm: KNEE_SPACE_DEPTH_CM,
  };
}
