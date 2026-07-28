/**
 * Keyboard and Mouse Position Guide — pure calculation module.
 *
 * Three things decide whether typing is neutral: the height of the key surface,
 * the tilt of the key plane, and how far the keyboard pushes the mouse away from
 * the shoulder. This module measures all three.
 */

/** Sitting elbow height above the seat / stature. Pheasant, Bodyspace, 50th pct. */
export const SITTING_ELBOW_RATIO = 0.133;

/**
 * Elbow-to-fingertip (forearm plus hand) length / stature. Pheasant, 50th pct:
 * 475 mm at 1740 mm. This is the radius of the reach zone the forearm alone
 * covers, with the upper arm hanging at the side.
 */
export const FOREARM_HAND_RATIO = 0.273;

/** Forward grip reach / stature. Pheasant, 50th pct: 780 mm at 1740 mm. */
export const FORWARD_REACH_RATIO = 0.448;

/**
 * Half the biacromial (shoulder joint to shoulder joint) breadth / stature.
 * Pheasant gives a 50th-percentile biacromial breadth near 400 mm at 1740 mm,
 * so each shoulder sits about 0.115 x stature from the body midline. A mouse
 * directly under that line needs no shoulder abduction at all.
 */
export const SHOULDER_OFFSET_RATIO = 0.115;

/**
 * Typical measured widths of common keyboard layouts, in centimetres. These are
 * mainstream mid-points — check your own board if it has an unusual case.
 */
export const KEYBOARD_LAYOUTS = [
  { key: "fullsize", label: "Full-size (104 key, with numpad)", widthCm: 44 },
  { key: "tkl", label: "Tenkeyless (87 key)", widthCm: 36 },
  { key: "seventyfive", label: "75% compact", widthCm: 32 },
  { key: "sixtyfive", label: "65% compact", widthCm: 31.5 },
  { key: "sixty", label: "60% mini", widthCm: 29.5 },
  { key: "laptop", label: "Laptop built-in (14 inch class)", widthCm: 31 },
];

/**
 * Bands used on this page to describe how far the mouse sits outside the
 * shoulder line. They are a practical reading of the general guidance to keep
 * the mouse within the forearm's own reach zone, not a published standard.
 */
export const ABDUCTION_BANDS = [
  { max: 2, label: "Neutral — the mouse is under your shoulder" },
  { max: 6, label: "Mild reach — noticeable over a long day" },
  { max: Infinity, label: "Significant reach — the shoulder is doing the work" },
];

/**
 * OSHA and ISO 9241 both describe a neutral wrist as straight. Sustained wrist
 * extension beyond about 15 degrees is the usual threshold quoted for a
 * non-neutral typing posture, and a positive keyboard tilt adds directly to it.
 */
export const WRIST_EXTENSION_LIMIT_DEG = 15;

/** Desk-to-elbow mismatch small enough to ignore. */
export const HEIGHT_TOLERANCE_CM = 2;

const DEG_PER_RAD = 180 / Math.PI;

const round1 = (value) => {
  const rounded = Math.round(value * 10) / 10;
  return Object.is(rounded, -0) ? 0 : rounded;
};

/** Descriptive band for a lateral offset, in centimetres. */
export function abductionBand(offsetCm) {
  const value = Number(offsetCm);
  if (!Number.isFinite(value)) return ABDUCTION_BANDS[ABDUCTION_BANDS.length - 1].label;
  const magnitude = Math.max(0, value);
  const band = ABDUCTION_BANDS.find((entry) => magnitude <= entry.max);
  return (band || ABDUCTION_BANDS[ABDUCTION_BANDS.length - 1]).label;
}

/**
 * @param {object} input
 * @param {number} input.heightCm            Body height, 120-220.
 * @param {number} input.seatHeightCm        Floor to seat cushion, 30-70.
 * @param {number} input.deskHeightCm        Floor to desk surface, 50-130.
 * @param {string} input.layout              Key of KEYBOARD_LAYOUTS.
 * @param {number} input.mouseWidthCm        Widest part of the mouse, 3-15.
 * @param {number} input.gapCm               Gap between keyboard edge and mouse, 0-40.
 * @param {number} input.frontHeightCm       Key surface height at the front edge, 0.5-6.
 * @param {number} input.rearHeightCm        Key surface height at the back edge, 0.5-10.
 * @param {number} input.keyboardDepthCm     Front-to-back depth of the keyboard, 8-30.
 * @returns {object} heights, tilt and reach analysis, or { error }.
 */
export function analyseKeyboardPosition({
  heightCm,
  seatHeightCm,
  deskHeightCm,
  layout = "fullsize",
  mouseWidthCm,
  gapCm,
  frontHeightCm,
  rearHeightCm,
  keyboardDepthCm,
}) {
  const height = Number(heightCm);
  const seat = Number(seatHeightCm);
  const desk = Number(deskHeightCm);
  const mouseWidth = Number(mouseWidthCm);
  const gap = Number(gapCm);
  const front = Number(frontHeightCm);
  const rear = Number(rearHeightCm);
  const depth = Number(keyboardDepthCm);

  if ([height, seat, desk, mouseWidth, gap, front, rear, depth].some((v) => !Number.isFinite(v))) {
    return { error: "Enter a number in every field." };
  }
  if (height < 120 || height > 220) return { error: "Enter a body height between 120 cm and 220 cm." };
  if (seat < 30 || seat > 70) return { error: "Seat height is usually between 30 cm and 70 cm." };
  if (desk < 50 || desk > 130) return { error: "Desk height is usually between 50 cm and 130 cm." };
  if (desk <= seat) return { error: "The desk has to be higher than the seat — check both figures." };
  if (mouseWidth < 3 || mouseWidth > 15) return { error: "Mouse width should be between 3 cm and 15 cm." };
  if (gap < 0 || gap > 40) return { error: "The gap to the mouse should be between 0 cm and 40 cm." };
  if (front < 0.5 || front > 6) return { error: "Front key height should be between 0.5 cm and 6 cm." };
  if (rear < 0.5 || rear > 10) return { error: "Back key height should be between 0.5 cm and 10 cm." };
  if (depth < 8 || depth > 30) return { error: "Keyboard depth should be between 8 cm and 30 cm." };

  const chosen =
    KEYBOARD_LAYOUTS.find((entry) => entry.key === layout) || KEYBOARD_LAYOUTS[0];

  const elbowHeightCm = seat + height * SITTING_ELBOW_RATIO;
  const deskDeltaCm = desk - elbowHeightCm;
  const deskTooHigh = deskDeltaCm > HEIGHT_TOLERANCE_CM;
  const deskTooLow = deskDeltaCm < -HEIGHT_TOLERANCE_CM;
  // The keys sit on top of the board, so the surface the hands meet is higher
  // than the desk by the front-edge height.
  const keySurfaceCm = desk + front;
  const keySurfaceDeltaCm = keySurfaceCm - elbowHeightCm;

  const forearmReachCm = height * FOREARM_HAND_RATIO;
  const forwardReachCm = height * FORWARD_REACH_RATIO;
  const shoulderOffsetCm = height * SHOULDER_OFFSET_RATIO;

  const layouts = KEYBOARD_LAYOUTS.map((entry) => {
    const midlineOffset = entry.widthCm / 2 + gap + mouseWidth / 2;
    const shoulderOffset = midlineOffset - shoulderOffsetCm;
    return {
      ...entry,
      midlineOffsetCm: round1(midlineOffset),
      shoulderOffsetCm: round1(shoulderOffset),
      withinForearmReach: midlineOffset <= forearmReachCm,
      band: abductionBand(shoulderOffset),
    };
  });

  const current = layouts.find((entry) => entry.key === chosen.key) || layouts[0];
  const best = layouts.reduce((a, b) =>
    Math.abs(b.shoulderOffsetCm) < Math.abs(a.shoulderOffsetCm) ? b : a,
  );
  const savingCm = round1(Math.abs(current.shoulderOffsetCm) - Math.abs(best.shoulderOffsetCm));

  const tiltDeg = Math.atan((rear - front) / depth) * DEG_PER_RAD;
  const tiltPositive = tiltDeg > 0.5;
  const tiltNegative = tiltDeg < -0.5;
  const tiltOverLimit = tiltDeg > WRIST_EXTENSION_LIMIT_DEG;

  const deskWidthNeededCm = chosen.widthCm + gap + mouseWidth;

  return {
    layoutKey: chosen.key,
    layoutLabel: chosen.label,
    layoutWidthCm: chosen.widthCm,
    elbowHeightCm: round1(elbowHeightCm),
    keySurfaceCm: round1(keySurfaceCm),
    keySurfaceDeltaCm: round1(keySurfaceDeltaCm),
    deskDeltaCm: round1(deskDeltaCm),
    deskTooHigh,
    deskTooLow,
    forearmReachCm: round1(forearmReachCm),
    forwardReachCm: round1(forwardReachCm),
    shoulderLineCm: round1(shoulderOffsetCm),
    mouseMidlineOffsetCm: current.midlineOffsetCm,
    mouseShoulderOffsetCm: current.shoulderOffsetCm,
    withinForearmReach: current.withinForearmReach,
    band: current.band,
    layouts,
    bestLayoutKey: best.key,
    bestLayoutLabel: best.label,
    savingCm,
    tiltDeg: round1(tiltDeg),
    tiltPositive,
    tiltNegative,
    tiltOverLimit,
    wristLimitDeg: WRIST_EXTENSION_LIMIT_DEG,
    deskWidthNeededCm: round1(deskWidthNeededCm),
  };
}
