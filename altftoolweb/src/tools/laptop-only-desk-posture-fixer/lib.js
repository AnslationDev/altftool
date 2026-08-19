/**
 * Laptop-Only Desk Posture Fixer — pure calculation module.
 *
 * The laptop problem in one line: the screen and the keyboard are welded
 * together, so a height that is right for one is wrong for the other. This
 * module quantifies how far apart the two "right" heights are.
 */

/** Sitting eye height above the seat / stature. Pheasant, Bodyspace, 50th pct. */
export const SITTING_EYE_RATIO = 0.454;

/** Sitting elbow height above the seat / stature. Pheasant, Bodyspace, 50th pct. */
export const SITTING_ELBOW_RATIO = 0.133;

/**
 * ANSI/HFES 100 and OSHA computer-workstation guidance: top of the viewable
 * screen at, or slightly below, eye height.
 */
export const MONITOR_TOP_BELOW_EYE_CM = 5;

/** Typical thickness of a laptop base at the hinge, where the screen pivots. */
export const LAPTOP_BASE_THICKNESS_CM = 2;

/** Laptops are normally worked at roughly 100 degrees from the base. */
export const SCREEN_OPEN_ANGLE_DEG = 100;

/** Screen height as a fraction of the diagonal, by aspect ratio. */
export const ASPECT_RATIOS = {
  "16:10": { label: "16:10 (most modern laptops)", w: 16, h: 10 },
  "16:9": { label: "16:9 (widescreen)", w: 16, h: 9 },
  "3:2": { label: "3:2 (Surface, some ultrabooks)", w: 3, h: 2 },
};

/** ANSI/HFES 100 recommends a 50-100 cm viewing distance; laptops sit low in that band. */
export const LAPTOP_DISTANCE_MIN_CM = 50;
export const LAPTOP_DISTANCE_MAX_CM = 70;

/** Desk-to-elbow mismatch that is small enough to ignore. */
export const DESK_TOLERANCE_CM = 2;

/**
 * Effective load on the cervical spine against forward head tilt, from
 * Hansraj KK, "Assessment of stresses in the cervical spine caused by posture
 * and position of the head", Surgical Technology International 2014
 * (10-12 lb neutral, 27 lb at 15 deg, 40 lb at 30 deg, 49 lb at 45 deg,
 * 60 lb at 60 deg), converted to kilograms.
 */
export const CERVICAL_LOAD_TABLE = [
  [0, 5.4],
  [15, 12],
  [30, 18],
  [45, 22],
  [60, 27],
];

const CM_PER_INCH = 2.54;
const DEG = Math.PI / 180;

const round1 = (value) => Math.round(value * 10) / 10;

/** Linear interpolation across CERVICAL_LOAD_TABLE, clamped at both ends. */
export function cervicalLoadKg(angleDeg) {
  const angle = Number(angleDeg);
  if (!Number.isFinite(angle)) return NaN;
  const a = Math.min(Math.max(angle, 0), 60);
  for (let i = 1; i < CERVICAL_LOAD_TABLE.length; i += 1) {
    const [x0, y0] = CERVICAL_LOAD_TABLE[i - 1];
    const [x1, y1] = CERVICAL_LOAD_TABLE[i];
    if (a <= x1) {
      const t = x1 === x0 ? 0 : (a - x0) / (x1 - x0);
      return round1(y0 + t * (y1 - y0));
    }
  }
  return CERVICAL_LOAD_TABLE[CERVICAL_LOAD_TABLE.length - 1][1];
}

/** Vertical height of a screen, in centimetres, from its diagonal in inches. */
export function screenHeightCm(diagonalInches, aspectKey) {
  const diagonal = Number(diagonalInches);
  const aspect = ASPECT_RATIOS[aspectKey] || ASPECT_RATIOS["16:10"];
  if (!Number.isFinite(diagonal) || diagonal <= 0) return NaN;
  const factor = aspect.h / Math.sqrt(aspect.w * aspect.w + aspect.h * aspect.h);
  return diagonal * factor * CM_PER_INCH;
}

/**
 * @param {object} input
 * @param {number} input.heightCm            Body height, 120-220.
 * @param {number} input.seatHeightCm        Floor to top of seat cushion, 30-70.
 * @param {number} input.deskHeightCm        Floor to desk surface, 50-120.
 * @param {number} input.laptopInches        Screen diagonal, 8-20.
 * @param {string} input.aspect              Key of ASPECT_RATIOS.
 * @param {number} input.viewingDistanceCm   Eye to screen, 25-120.
 * @param {boolean} input.hasExternalKeyboard
 * @returns {object} measurements and ordered fixes, or { error }.
 */
export function analyseLaptopSetup({
  heightCm,
  seatHeightCm,
  deskHeightCm,
  laptopInches,
  aspect = "16:10",
  viewingDistanceCm,
  hasExternalKeyboard = false,
}) {
  const height = Number(heightCm);
  const seat = Number(seatHeightCm);
  const desk = Number(deskHeightCm);
  const diagonal = Number(laptopInches);
  const distance = Number(viewingDistanceCm);

  if ([height, seat, desk, diagonal, distance].some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }
  if (height < 120 || height > 220) return { error: "Enter a body height between 120 cm and 220 cm." };
  if (seat < 30 || seat > 70) return { error: "Seat height is usually between 30 cm and 70 cm." };
  if (desk < 50 || desk > 120) return { error: "Desk height is usually between 50 cm and 120 cm." };
  if (diagonal < 8 || diagonal > 20) {
    return { error: "Laptop screens are between 8 and 20 inches — check the diagonal." };
  }
  if (distance < 25 || distance > 120) {
    return { error: "Viewing distance should be between 25 cm and 120 cm." };
  }
  if (desk <= seat) {
    return { error: "The desk has to be higher than the seat — check both measurements." };
  }

  const aspectKey = ASPECT_RATIOS[aspect] ? aspect : "16:10";
  const screenH = screenHeightCm(diagonal, aspectKey);
  const screenVertical = screenH * Math.sin(SCREEN_OPEN_ANGLE_DEG * DEG);

  const seatedEyeHeight = seat + SITTING_EYE_RATIO * height;
  const seatedElbowHeight = seat + SITTING_ELBOW_RATIO * height;

  const deskDelta = desk - seatedElbowHeight; // positive = desk above elbow height
  const deskTooHigh = deskDelta > DESK_TOLERANCE_CM;
  const deskTooLow = deskDelta < -DESK_TOLERANCE_CM;

  // If the desk is too high, the "raise your chair" fix below raises the
  // seat (and with it, the eye height) by deskDelta; if the desk is too low,
  // the "lower your chair" fix lowers the seat by the same (negative)
  // deskDelta. Either way, the riser and the post-fix gaze/load figures must
  // target that rebased eye height, not the current one, so a user who
  // follows both recommendations actually lands on target instead of
  // overshooting or ending up short.
  const eyeHeightForTarget = deskTooHigh || deskTooLow ? seatedEyeHeight + deskDelta : seatedEyeHeight;

  const screenTopAboveDesk = LAPTOP_BASE_THICKNESS_CM + screenVertical;
  const currentTopHeight = desk + screenTopAboveDesk;
  const targetTopHeight = eyeHeightForTarget - MONITOR_TOP_BELOW_EYE_CM;
  const riserRaw = targetTopHeight - currentTopHeight;
  const riserCm = Math.max(0, riserRaw);

  const centreNow = desk + LAPTOP_BASE_THICKNESS_CM + screenVertical / 2;
  const dropNow = seatedEyeHeight - centreNow;
  const gazeNowDeg = (Math.atan(dropNow / distance) * 180) / Math.PI;

  const centreFixed = centreNow + riserCm;
  const dropFixed = eyeHeightForTarget - centreFixed;
  const gazeFixedDeg = (Math.atan(dropFixed / distance) * 180) / Math.PI;

  const loadNow = cervicalLoadKg(gazeNowDeg);
  const loadFixed = cervicalLoadKg(gazeFixedDeg);

  const needsExternalKeyboard = riserCm > DESK_TOLERANCE_CM;

  const fixes = [];
  if (needsExternalKeyboard && !hasExternalKeyboard) {
    fixes.push({
      title: "Get a separate keyboard and mouse first",
      detail: `The screen needs to come up ${round1(riserCm)} cm. Raising the laptop without a separate keyboard just moves the strain from your neck to your shoulders and wrists.`,
    });
  }
  if (riserCm > 0) {
    fixes.push({
      title: `Raise the laptop by ${round1(riserCm)} cm`,
      detail: `That puts the top of the screen at ${round1(targetTopHeight)} cm above the floor — about ${MONITOR_TOP_BELOW_EYE_CM} cm below your seated eye height${deskTooHigh ? " after raising your chair" : deskTooLow ? " after lowering your chair" : ""} of ${round1(eyeHeightForTarget)} cm.`,
    });
  } else {
    fixes.push({
      title: "Screen height is already fine",
      detail: `The top of the screen sits at ${round1(currentTopHeight)} cm, at or above the ${round1(targetTopHeight)} cm target, so no riser is needed.`,
    });
  }
  if (deskTooHigh) {
    fixes.push({
      title: `Raise your chair by ${round1(deskDelta)} cm and add a footrest`,
      detail: `The desk sits ${round1(deskDelta)} cm above your seated elbow height of ${round1(seatedElbowHeight)} cm, which is what makes your shoulders creep up. A footrest roughly ${round1(deskDelta)} cm tall keeps your feet supported after the change.`,
    });
  } else if (deskTooLow) {
    fixes.push({
      title: `Lower your chair by ${round1(Math.abs(deskDelta))} cm`,
      detail: `The desk sits ${round1(Math.abs(deskDelta))} cm below your seated elbow height of ${round1(seatedElbowHeight)} cm, so you are reaching down to type.`,
    });
  } else {
    fixes.push({
      title: "Keyboard height is within range",
      detail: `The desk is within ${DESK_TOLERANCE_CM} cm of your seated elbow height of ${round1(seatedElbowHeight)} cm.`,
    });
  }
  if (distance < LAPTOP_DISTANCE_MIN_CM) {
    fixes.push({
      title: `Push the screen back to at least ${LAPTOP_DISTANCE_MIN_CM} cm`,
      detail: `You are at ${round1(distance)} cm. ANSI/HFES 100 puts the comfortable range at 50-100 cm; for a ${diagonal}-inch screen, ${LAPTOP_DISTANCE_MIN_CM}-${LAPTOP_DISTANCE_MAX_CM} cm works well.`,
    });
  } else if (distance > LAPTOP_DISTANCE_MAX_CM) {
    fixes.push({
      title: "Screen may be further away than a laptop can carry",
      detail: `At ${round1(distance)} cm a ${diagonal}-inch screen has small text, which pulls your head forward again. Try ${LAPTOP_DISTANCE_MIN_CM}-${LAPTOP_DISTANCE_MAX_CM} cm and increase the system text size instead.`,
    });
  }

  return {
    screenHeightCm: round1(screenH),
    screenVerticalCm: round1(screenVertical),
    seatedEyeHeightCm: round1(seatedEyeHeight),
    seatedElbowHeightCm: round1(seatedElbowHeight),
    currentTopHeightCm: round1(currentTopHeight),
    targetTopHeightCm: round1(targetTopHeight),
    riserCm: round1(riserCm),
    riserAlreadyHighCm: riserRaw < 0 ? round1(-riserRaw) : 0,
    gazeNowDeg: round1(gazeNowDeg),
    gazeFixedDeg: round1(gazeFixedDeg),
    loadNowKg: loadNow,
    loadFixedKg: loadFixed,
    loadSavedKg: round1(loadNow - loadFixed),
    deskDeltaCm: round1(deskDelta),
    deskTooHigh,
    deskTooLow,
    needsExternalKeyboard,
    hasExternalKeyboard: Boolean(hasExternalKeyboard),
    distanceInRange: distance >= LAPTOP_DISTANCE_MIN_CM && distance <= LAPTOP_DISTANCE_MAX_CM,
    fixes,
  };
}
