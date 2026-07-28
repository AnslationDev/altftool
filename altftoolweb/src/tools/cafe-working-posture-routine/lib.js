/**
 * Cafe Working Posture Routine — pure calculation module.
 *
 * You cannot adjust a cafe's furniture, but you can choose which table you sit
 * at. This module ranks the three standard cafe seating heights against your own
 * elbow height, then sizes the cushion, footrest and riser that close whatever
 * gap is left.
 */

/** Sitting elbow height above the seat / stature. Pheasant, Bodyspace, 50th pct. */
export const SITTING_ELBOW_RATIO = 0.133;

/** Sitting eye height above the seat / stature. Pheasant, Bodyspace, 50th pct. */
export const SITTING_EYE_RATIO = 0.454;

/** Popliteal (seat) height / stature. Pheasant, Bodyspace, 50th pct. */
export const POPLITEAL_RATIO = 0.25;

/**
 * The three standard commercial seating heights. Table and matching seat heights
 * are the mid-points of the ranges used across the furniture trade: dining
 * 73-76 cm with a 45 cm chair, counter 86-91 cm with a 61-66 cm stool, bar
 * 100-107 cm with a 74-76 cm stool.
 */
export const TABLE_TYPES = [
  { key: "dining", label: "Dining-height table with a normal chair", tableCm: 75, seatCm: 45 },
  { key: "counter", label: "Counter-height table with a mid stool", tableCm: 89, seatCm: 64 },
  { key: "bar", label: "Bar-height table with a tall stool", tableCm: 104, seatCm: 75 },
];

/** ANSI/HFES 100 and OSHA: top of the viewable screen at or slightly below eye height. */
export const MONITOR_TOP_BELOW_EYE_CM = 5;

/** Typical laptop base thickness at the hinge. */
export const LAPTOP_BASE_THICKNESS_CM = 2;

/** Laptop screens are normally worked at about 100 degrees from the base. */
export const SCREEN_OPEN_ANGLE_DEG = 100;

/** Most current laptop panels are 16:10; height = diagonal x 10 / sqrt(16^2+10^2). */
export const LAPTOP_ASPECT_HEIGHT_FACTOR = 10 / Math.sqrt(16 * 16 + 10 * 10);

/** Table-to-elbow mismatch small enough to ignore, in cm. */
export const FIT_TOLERANCE_CM = 3;

/**
 * Break cadences. The 20-20-20 rule (every 20 minutes look 20 feet away for
 * 20 seconds) is the standard optometric advice for screen work; changing
 * posture at least every 30 minutes is the general sedentary-work guidance.
 */
export const EYE_BREAK_INTERVAL_MIN = 20;
export const POSTURE_BREAK_INTERVAL_MIN = 30;

/** Portable kit, in the order it removes the most strain. */
export const CAFE_KIT = [
  ["Folding laptop stand or a bag to sit under the laptop", "Lifts the screen towards eye level."],
  ["Slim wireless keyboard", "Lets the hands stay at elbow height once the screen goes up."],
  ["Small travel mouse", "Stops the wrist twisting on a trackpad for hours."],
  ["Rolled jumper or scarf", "Improvised lumbar support against a flat cafe chair back."],
  ["Reusable cup or a book", "A 3-5 cm footrest is better than dangling feet on a tall stool."],
];

const CM_PER_INCH = 2.54;
const DEG = Math.PI / 180;
const round1 = (value) => Math.round(value * 10) / 10;

/**
 * @param {object} input
 * @param {number} input.heightCm             Body height, 120-220.
 * @param {string} input.tableType            Key of TABLE_TYPES.
 * @param {number} input.sessionMinutes       Planned session, 10-600.
 * @param {number} input.laptopInches         Screen diagonal, 8-20.
 * @param {number} input.viewingDistanceCm    Eye to screen, 25-100.
 * @param {boolean} input.hasExternalKeyboard
 * @returns {object} ranked tables, adjustments and break counts — or { error }.
 */
export function planCafeSession({
  heightCm,
  tableType = "dining",
  sessionMinutes,
  laptopInches,
  viewingDistanceCm,
  hasExternalKeyboard = false,
}) {
  const height = Number(heightCm);
  const session = Number(sessionMinutes);
  const diagonal = Number(laptopInches);
  const distance = Number(viewingDistanceCm);

  if ([height, session, diagonal, distance].some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }
  if (height < 120 || height > 220) return { error: "Enter a body height between 120 cm and 220 cm." };
  if (session < 10) return { error: "Enter a session of at least 10 minutes." };
  if (session > 600) return { error: "Keep the session to 10 hours or less." };
  if (diagonal < 8 || diagonal > 20) {
    return { error: "Laptop screens are between 8 and 20 inches — check the diagonal." };
  }
  if (distance < 25 || distance > 100) {
    return { error: "Eye-to-screen distance should be between 25 cm and 100 cm." };
  }

  const elbowAboveSeat = height * SITTING_ELBOW_RATIO;
  const eyeAboveSeat = height * SITTING_EYE_RATIO;
  const idealSeatHeight = height * POPLITEAL_RATIO;

  const ranked = TABLE_TYPES.map((type) => {
    const elbowHeight = type.seatCm + elbowAboveSeat;
    const mismatch = type.tableCm - elbowHeight; // positive = table above elbow height
    const footGap = type.seatCm - idealSeatHeight; // positive = feet dangle
    return {
      ...type,
      elbowHeightCm: round1(elbowHeight),
      mismatchCm: round1(mismatch),
      absMismatchCm: round1(Math.abs(mismatch)),
      footGapCm: round1(footGap),
      footrestCm: footGap > FIT_TOLERANCE_CM ? round1(footGap) : 0,
    };
  }).sort((a, b) => a.absMismatchCm - b.absMismatchCm);

  const bestKey = ranked[0].key;
  const chosen =
    ranked.find((type) => type.key === tableType) || ranked.find((type) => type.key === bestKey);

  // Sitting on a cushion raises you, which closes a table that is too high.
  const cushionCm = chosen.mismatchCm > FIT_TOLERANCE_CM ? round1(chosen.mismatchCm) : 0;
  const effectiveSeatCm = chosen.seatCm + cushionCm;
  const effectiveFootGap = effectiveSeatCm - idealSeatHeight;
  const footrestCm = effectiveFootGap > FIT_TOLERANCE_CM ? round1(effectiveFootGap) : 0;

  const screenH = diagonal * LAPTOP_ASPECT_HEIGHT_FACTOR * CM_PER_INCH;
  const screenVertical = screenH * Math.sin(SCREEN_OPEN_ANGLE_DEG * DEG);
  const eyeHeightCm = effectiveSeatCm + eyeAboveSeat;
  const screenTopNow = chosen.tableCm + LAPTOP_BASE_THICKNESS_CM + screenVertical;
  const screenTopTarget = eyeHeightCm - MONITOR_TOP_BELOW_EYE_CM;
  const riserCm = Math.max(0, round1(screenTopTarget - screenTopNow));

  const centreNow = chosen.tableCm + LAPTOP_BASE_THICKNESS_CM + screenVertical / 2;
  const gazeNowDeg = (Math.atan((eyeHeightCm - centreNow) / distance) * 180) / Math.PI;
  const centreFixed = centreNow + (hasExternalKeyboard ? riserCm : 0);
  const gazeFixedDeg = (Math.atan((eyeHeightCm - centreFixed) / distance) * 180) / Math.PI;

  // Breaks that fall strictly inside the session: the one landing on the final
  // minute is the end of the session, not a break.
  const eyeBreaks = Math.max(0, Math.ceil(session / EYE_BREAK_INTERVAL_MIN) - 1);
  const postureBreaks = Math.max(0, Math.ceil(session / POSTURE_BREAK_INTERVAL_MIN) - 1);

  return {
    ranked,
    bestKey,
    bestLabel: ranked[0].label,
    chosen,
    isBestChoice: chosen.key === bestKey,
    elbowAboveSeatCm: round1(elbowAboveSeat),
    idealSeatHeightCm: round1(idealSeatHeight),
    cushionCm,
    footrestCm,
    effectiveSeatCm: round1(effectiveSeatCm),
    screenHeightCm: round1(screenH),
    screenTopNowCm: round1(screenTopNow),
    screenTopTargetCm: round1(screenTopTarget),
    riserCm,
    riserUsable: hasExternalKeyboard,
    gazeNowDeg: round1(gazeNowDeg),
    gazeFixedDeg: round1(gazeFixedDeg),
    eyeBreaks,
    postureBreaks,
    eyeBreakIntervalMin: EYE_BREAK_INTERVAL_MIN,
    postureBreakIntervalMin: POSTURE_BREAK_INTERVAL_MIN,
    sessionMinutes: Math.round(session),
  };
}
