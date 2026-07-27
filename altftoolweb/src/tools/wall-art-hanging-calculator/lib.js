/**
 * Picture-hanging geometry.
 *
 * The core rule is the gallery centre line: galleries and museums hang work so
 * the centre of the piece sits about 145 cm (57 in) above the floor, which is
 * average adult eye level. Everything else here follows from that plus the
 * physical geometry of a hanging wire.
 */

export const CM_PER_INCH = 2.54;

/** Gallery / museum standard centre height. Commonly quoted as 57-60 inches. */
export const GALLERY_CENTRE_CM = 145;
export const GALLERY_CENTRE_ALT_CM = 152;

/**
 * Clear gap between the top of a sofa, console or headboard and the bottom of
 * the frame. Interior guidance puts this at 15-25 cm; 20 cm is the usual pick.
 */
export const FURNITURE_GAP_MIN_CM = 15;
export const FURNITURE_GAP_DEFAULT_CM = 20;
export const FURNITURE_GAP_MAX_CM = 25;

/** Typical spacing between frames in a gallery wall: 5-10 cm, 7.5 cm standard. */
export const FRAME_GAP_MIN_CM = 5;
export const FRAME_GAP_DEFAULT_CM = 7.5;
export const FRAME_GAP_MAX_CM = 10;

/** Frames wider than this, or heavier than this, are steadier on two hooks. */
export const TWO_HOOK_WIDTH_CM = 60;
export const TWO_HOOK_WEIGHT_KG = 5;

/** Safety factor applied to artwork weight when picking a hook rating. */
export const HOOK_SAFETY_FACTOR = 2;

/** Ratings printed on off-the-shelf picture hooks and wall plugs, in kg. */
export const HOOK_RATINGS_KG = [5, 10, 20, 30, 50];

const round = (value, dp) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/**
 * Nail / hook height for a single frame.
 *
 * hookHeight = centreOfFrame + frameHeight/2 - wireDrop
 *
 * wireDrop is measured by pulling the hanging wire taut toward the top of the
 * frame and measuring from the top edge down to the taut wire.
 *
 * @param {object} input
 * @param {number} input.frameHeightCm
 * @param {number} input.frameWidthCm
 * @param {number} input.wireDropCm       0 for a D-ring or sawtooth flush to the frame
 * @param {number} input.centreHeightCm   desired centre of the artwork above the floor
 * @param {number} input.weightKg
 * @param {number|null} input.furnitureTopCm height of furniture below, or null
 * @param {number} input.furnitureGapCm   clear gap wanted above that furniture
 */
export function hangSingle({
  frameHeightCm,
  frameWidthCm,
  wireDropCm = 0,
  centreHeightCm = GALLERY_CENTRE_CM,
  weightKg = 0,
  furnitureTopCm = null,
  furnitureGapCm = FURNITURE_GAP_DEFAULT_CM,
}) {
  const height = Number(frameHeightCm);
  const width = Number(frameWidthCm);
  const drop = Number(wireDropCm);
  const centreWanted = Number(centreHeightCm);
  const weight = Number(weightKg);

  if (![height, width, drop, centreWanted, weight].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for the frame size, wire drop and centre height." };
  }
  if (height <= 0 || width <= 0) {
    return { error: "Frame width and height must both be greater than zero." };
  }
  if (height > 400 || width > 400) {
    return { error: "Frame dimensions above 4 m are outside this calculator's range." };
  }
  if (drop < 0) return { error: "Wire drop cannot be negative." };
  if (drop >= height) {
    return { error: "Wire drop must be less than the frame height — measure it with the wire pulled taut." };
  }
  if (centreWanted <= 0 || centreWanted > 400) {
    return { error: "Centre height should be between 1 cm and 400 cm above the floor." };
  }
  if (weight < 0 || weight > 200) {
    return { error: "Artwork weight should be between 0 kg and 200 kg." };
  }

  let mode = "gallery-centre";
  let centre = centreWanted;
  let furnitureNote = null;

  const furniture = furnitureTopCm === null || furnitureTopCm === "" ? null : Number(furnitureTopCm);
  if (furniture !== null) {
    if (!Number.isFinite(furniture) || furniture < 0 || furniture > 300) {
      return { error: "Furniture height should be between 0 cm and 300 cm, or left blank." };
    }
    const gap = Number(furnitureGapCm);
    if (!Number.isFinite(gap) || gap < 0 || gap > 100) {
      return { error: "The gap above furniture should be between 0 cm and 100 cm." };
    }
    const bottomFromFurniture = furniture + gap;
    const centreFromFurniture = bottomFromFurniture + height / 2;
    if (centreFromFurniture > centreWanted) {
      // Furniture forces the piece higher than the gallery line.
      centre = centreFromFurniture;
      mode = "above-furniture";
      furnitureNote = `The furniture pushes the piece above the ${round(centreWanted, 0)} cm centre line; anchoring ${round(gap, 0)} cm above it wins.`;
    } else {
      furnitureNote = `The gallery centre line already clears the furniture by ${round(centreWanted - height / 2 - furniture, 1)} cm.`;
    }
  }

  const topCm = round(centre + height / 2, 1);
  const bottomCm = round(centre - height / 2, 1);
  const hookHeightCm = round(centre + height / 2 - drop, 1);

  const needsTwoHooks = width > TWO_HOOK_WIDTH_CM || weight > TWO_HOOK_WEIGHT_KG;
  // Two hooks sit a quarter of the frame width in from each edge.
  const hookSpacingCm = needsTwoHooks ? round(width / 2, 1) : null;
  const hookInsetCm = needsTwoHooks ? round(width / 4, 1) : null;

  const requiredRatingKg = weight * HOOK_SAFETY_FACTOR;
  const perHook = needsTwoHooks ? requiredRatingKg / 2 : requiredRatingKg;
  const hookRatingKg = HOOK_RATINGS_KG.find((rating) => rating >= perHook) || null;

  return {
    mode,
    centreHeightCm: round(centre, 1),
    hookHeightCm,
    topCm,
    bottomCm,
    needsTwoHooks,
    hookSpacingCm,
    hookInsetCm,
    hookCount: needsTwoHooks ? 2 : 1,
    perHookLoadKg: round(weight / (needsTwoHooks ? 2 : 1), 2),
    requiredRatingPerHookKg: round(perHook, 2),
    hookRatingKg,
    furnitureNote,
    bottomBelowFloor: bottomCm < 0,
  };
}

/**
 * Even spacing for a row of identical frames, centred on a wall.
 *
 * totalWidth = count * frameWidth + (count - 1) * gap
 */
export function layoutRow({ count, frameWidthCm, gapCm = FRAME_GAP_DEFAULT_CM, wallWidthCm }) {
  const n = Number(count);
  const width = Number(frameWidthCm);
  const gap = Number(gapCm);
  const wall = Number(wallWidthCm);

  if (![n, width, gap, wall].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for frame count, frame width, gap and wall width." };
  }
  if (!Number.isInteger(n) || n < 1 || n > 12) {
    return { error: "Frame count must be a whole number from 1 to 12." };
  }
  if (width <= 0) return { error: "Frame width must be greater than zero." };
  if (gap < 0) return { error: "The gap between frames cannot be negative." };
  if (wall <= 0) return { error: "Wall width must be greater than zero." };

  const totalWidthCm = n * width + (n - 1) * gap;
  const spareCm = wall - totalWidthCm;
  const leftMarginCm = spareCm / 2;

  const positions = [];
  for (let index = 0; index < n; index += 1) {
    const left = leftMarginCm + index * (width + gap);
    positions.push({
      index: index + 1,
      leftCm: round(left, 1),
      centreCm: round(left + width / 2, 1),
      rightCm: round(left + width, 1),
    });
  }

  // Largest gap that still fits the wall, useful when the row overflows.
  const maxGapCm = n > 1 ? (wall - n * width) / (n - 1) : null;

  return {
    count: n,
    totalWidthCm: round(totalWidthCm, 1),
    spareCm: round(spareCm, 1),
    leftMarginCm: round(leftMarginCm, 1),
    fits: spareCm >= 0,
    positions,
    maxGapCm: maxGapCm === null ? null : round(maxGapCm, 1),
    wallCoveragePct: round((totalWidthCm / wall) * 100, 1),
  };
}
