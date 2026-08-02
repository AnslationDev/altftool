/**
 * Rug size selector.
 *
 * Rug sizing is a set of clearance rules, not a matter of taste, and each room
 * has its own:
 *
 *   DINING — the rug must extend at least 60 cm (24 in) beyond every edge of
 *     the table, so a chair pulled back to sit down still has all four legs on
 *     the rug. Anything less and the chair catches on the edge every time.
 *
 *   LIVING — three recognised placements. "All legs on" puts the whole seating
 *     group on the rug with roughly a 45 cm border of rug showing around it.
 *     "Front legs on" runs the rug under the front 40 cm or so of each piece
 *     and stays about 30 cm wider than the sofa on each side. "Floating" sits
 *     under the coffee table only and is the smallest of the three.
 *
 *   BEDROOM — the rug should show at least 60 cm of soft floor on each side of
 *     the bed and past the foot. The usual placement starts the rug about a
 *     third of the way down the bed, below the nightstands, so its length is
 *     two thirds of the bed plus the foot overhang.
 *
 * The chosen size is then checked against the room: a rug wants roughly 45 cm
 * of bare floor showing to the walls, and never less than about 20 cm, or the
 * room reads as badly fitted wall-to-wall carpet.
 */

export const CM_PER_FOOT = 30.48;

/** Rug sizes sold as standard, in feet. */
export const STANDARD_RUG_SIZES = [
  { label: "3 x 5 ft", widthFt: 3, lengthFt: 5, runner: false },
  { label: "4 x 6 ft", widthFt: 4, lengthFt: 6, runner: false },
  { label: "5 x 7 ft", widthFt: 5, lengthFt: 7, runner: false },
  { label: "5 x 8 ft", widthFt: 5, lengthFt: 8, runner: false },
  { label: "6 x 9 ft", widthFt: 6, lengthFt: 9, runner: false },
  { label: "7 x 10 ft", widthFt: 7, lengthFt: 10, runner: false },
  { label: "8 x 10 ft", widthFt: 8, lengthFt: 10, runner: false },
  { label: "9 x 12 ft", widthFt: 9, lengthFt: 12, runner: false },
  { label: "10 x 14 ft", widthFt: 10, lengthFt: 14, runner: false },
  { label: "12 x 15 ft", widthFt: 12, lengthFt: 15, runner: false },
  { label: "2.5 x 8 ft runner", widthFt: 2.5, lengthFt: 8, runner: true },
  { label: "2.5 x 10 ft runner", widthFt: 2.5, lengthFt: 10, runner: true },
];

/** A chair pulled back to sit down travels about this far. */
export const DINING_CHAIR_PULLOUT_CM = 60;
/** Rug showing around a fully-on seating group. */
export const LIVING_ALL_LEGS_BORDER_CM = 45;
/** How much wider than the sofa the rug runs on a front-legs-on layout. */
export const LIVING_FRONT_LEGS_SIDE_CM = 30;
/** How much of each facing piece sits off the back edge of the rug. */
export const LIVING_FRONT_LEGS_BACK_INSET_CM = 40;
/** A floating rug should still clear the coffee table by this much. */
export const LIVING_FLOATING_CLEARANCE_CM = 20;
/** Soft floor each side of the bed and past the foot. */
export const BED_SIDE_CLEARANCE_CM = 60;
export const BED_FOOT_CLEARANCE_CM = 60;
/** Fraction of the bed the rug runs under when it starts below the nightstands. */
export const BED_UNDER_FRACTION = 2 / 3;
/** Bare floor left between rug and wall. */
export const IDEAL_WALL_BORDER_CM = 45;
export const MIN_WALL_BORDER_CM = 20;

export const MAX_ROOM_CM = 2000;

export const PLACEMENTS = {
  living: [
    { id: "allLegs", label: "All furniture legs on the rug" },
    { id: "frontLegs", label: "Front legs on the rug" },
    { id: "floating", label: "Floating under the coffee table only" },
  ],
  dining: [{ id: "standard", label: "Chairs stay on when pulled back" }],
  bedroom: [
    { id: "belowNightstands", label: "Rug starts below the nightstands" },
    { id: "fullSurround", label: "Whole bed on the rug" },
    { id: "runners", label: "A runner down each side" },
  ],
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

/** Convert a length to centimetres. Unit is "cm" or "ft". */
export function toCentimetres(value, unit) {
  if (!isNum(value)) return NaN;
  return unit === "ft" ? value * CM_PER_FOOT : value;
}

/**
 * The rug area a placement demands, in centimetres.
 * @returns {{widthCm:number,lengthCm:number,note:string}|{error:string}}
 */
export function requiredRugSize({
  roomType,
  placement,
  furnitureWidthCm,
  furnitureDepthCm,
  zoneDepthCm,
}) {
  if (roomType === "dining") {
    return {
      widthCm: furnitureWidthCm + 2 * DINING_CHAIR_PULLOUT_CM,
      lengthCm: furnitureDepthCm + 2 * DINING_CHAIR_PULLOUT_CM,
      note: `Table plus ${DINING_CHAIR_PULLOUT_CM} cm on every side so a pulled-back chair keeps all four legs on the rug.`,
    };
  }

  if (roomType === "living") {
    if (placement === "allLegs") {
      return {
        widthCm: furnitureWidthCm + 2 * LIVING_ALL_LEGS_BORDER_CM,
        lengthCm: zoneDepthCm + 2 * LIVING_ALL_LEGS_BORDER_CM,
        note: `Whole seating group on the rug with about ${LIVING_ALL_LEGS_BORDER_CM} cm of rug showing all round.`,
      };
    }
    if (placement === "floating") {
      return {
        widthCm: Math.max(120, furnitureWidthCm * 0.8),
        lengthCm: Math.max(
          90,
          zoneDepthCm - 2 * furnitureDepthCm - 2 * LIVING_FLOATING_CLEARANCE_CM,
        ),
        note: "Rug sits inside the seating group under the coffee table, touching no furniture legs.",
      };
    }
    return {
      widthCm: furnitureWidthCm + 2 * LIVING_FRONT_LEGS_SIDE_CM,
      lengthCm: Math.max(150, zoneDepthCm - 2 * LIVING_FRONT_LEGS_BACK_INSET_CM),
      note: `Rug runs ${LIVING_FRONT_LEGS_SIDE_CM} cm past the sofa on each side and tucks under the front legs of every piece.`,
    };
  }

  if (roomType === "bedroom") {
    if (placement === "runners") {
      return {
        widthCm: 75,
        lengthCm: furnitureDepthCm,
        note: "Two runners, one down each side of the bed, at least as long as the mattress.",
      };
    }
    if (placement === "fullSurround") {
      return {
        widthCm: furnitureWidthCm + 2 * BED_SIDE_CLEARANCE_CM,
        lengthCm: furnitureDepthCm + BED_FOOT_CLEARANCE_CM + BED_SIDE_CLEARANCE_CM,
        note: "Whole bed on the rug with soft floor at the head, the foot and both sides.",
      };
    }
    return {
      widthCm: furnitureWidthCm + 2 * BED_SIDE_CLEARANCE_CM,
      lengthCm: furnitureDepthCm * BED_UNDER_FRACTION + BED_FOOT_CLEARANCE_CM,
      note: `Rug starts about a third of the way down the bed, below the nightstands, and runs ${BED_FOOT_CLEARANCE_CM} cm past the foot.`,
    };
  }

  return { error: "Pick a living room, dining room or bedroom." };
}

/**
 * @param {object} input
 * @param {"living"|"dining"|"bedroom"} input.roomType
 * @param {string} input.placement
 * @param {number} input.furnitureWidth  Sofa width, table width or bed width.
 * @param {number} input.furnitureDepth  Sofa depth, table length or bed length.
 * @param {number} [input.zoneDepth]     Living rooms: back of sofa to back of the piece opposite.
 * @param {number} input.roomWidth
 * @param {number} input.roomLength
 * @param {"cm"|"ft"} [input.unit]
 * @returns {object} A recommendation, or { error } for invalid input.
 */
export function recommendRug({
  roomType = "living",
  placement = "frontLegs",
  furnitureWidth,
  furnitureDepth,
  zoneDepth = 0,
  roomWidth,
  roomLength,
  unit = "cm",
} = {}) {
  const raw = { furnitureWidth, furnitureDepth, zoneDepth, roomWidth, roomLength };
  if (Object.values(raw).some((value) => !isNum(value))) {
    return { error: "Enter a valid number in every field." };
  }

  const furnitureWidthCm = toCentimetres(furnitureWidth, unit);
  const furnitureDepthCm = toCentimetres(furnitureDepth, unit);
  const zoneDepthCm = toCentimetres(zoneDepth, unit);
  const roomWidthCm = toCentimetres(roomWidth, unit);
  const roomLengthCm = toCentimetres(roomLength, unit);

  if (furnitureWidthCm <= 0 || furnitureDepthCm <= 0) {
    return { error: "Furniture width and depth must be greater than zero." };
  }
  if (roomWidthCm <= 0 || roomLengthCm <= 0) {
    return { error: "Room width and length must be greater than zero." };
  }
  if (roomWidthCm > MAX_ROOM_CM || roomLengthCm > MAX_ROOM_CM) {
    return { error: "Rooms larger than 20 m a side are outside the range of this tool." };
  }
  if (furnitureWidthCm >= roomWidthCm && furnitureWidthCm >= roomLengthCm) {
    return { error: "The furniture is wider than the room — check the measurements." };
  }
  if (roomType === "living" && placement !== "floating" && zoneDepthCm <= furnitureDepthCm) {
    return {
      error: "The seating zone must be deeper than the sofa itself — measure to the piece opposite.",
    };
  }

  const required = requiredRugSize({
    roomType,
    placement,
    furnitureWidthCm,
    furnitureDepthCm,
    zoneDepthCm,
  });
  if (required.error) return { error: required.error };
  if (required.widthCm <= 0 || required.lengthCm <= 0) {
    return { error: "Those dimensions do not leave room for a rug — check the seating zone depth." };
  }

  // The rug's long side runs along the room's long side.
  const requiredShort = Math.min(required.widthCm, required.lengthCm);
  const requiredLong = Math.max(required.widthCm, required.lengthCm);
  const roomShort = Math.min(roomWidthCm, roomLengthCm);
  const roomLong = Math.max(roomWidthCm, roomLengthCm);

  const wantRunner = roomType === "bedroom" && placement === "runners";

  const candidates = STANDARD_RUG_SIZES.filter((size) => size.runner === wantRunner).map((size) => {
    const shortCm = Math.min(size.widthFt, size.lengthFt) * CM_PER_FOOT;
    const longCm = Math.max(size.widthFt, size.lengthFt) * CM_PER_FOOT;

    // Runners flank the bed rather than sitting alone in the room: the
    // footprint that has to clear the walls is one runner's width on each
    // side of the bed, not a single runner measured against the whole room.
    const footprintWidthCm = wantRunner ? furnitureWidthCm + 2 * shortCm : shortCm;
    const footprintShortCm = wantRunner ? Math.min(footprintWidthCm, longCm) : shortCm;
    const footprintLongCm = wantRunner ? Math.max(footprintWidthCm, longCm) : longCm;

    return {
      label: size.label,
      shortCm,
      longCm,
      areaSqft: size.widthFt * size.lengthFt,
      meetsRequirement: shortCm >= requiredShort && longCm >= requiredLong,
      borderShortCm: (roomShort - footprintShortCm) / 2,
      borderLongCm: (roomLong - footprintLongCm) / 2,
      fitsRoom:
        roomShort - footprintShortCm >= 2 * MIN_WALL_BORDER_CM &&
        roomLong - footprintLongCm >= 2 * MIN_WALL_BORDER_CM,
      idealBorder:
        roomShort - footprintShortCm >= 2 * IDEAL_WALL_BORDER_CM &&
        roomLong - footprintLongCm >= 2 * IDEAL_WALL_BORDER_CM,
    };
  });

  const meeting = candidates.filter((item) => item.meetsRequirement);
  const pick = meeting.length > 0 ? meeting.reduce((a, b) => (a.areaSqft <= b.areaSqft ? a : b)) : null;

  // Anything offered as a size the room "could take" has to remain a valid
  // rug for this placement — it must still satisfy the same clearance rule
  // as every other recommendation, not merely leave a decent wall border.
  const meetingAndFitting = candidates.filter((item) => item.meetsRequirement && item.fitsRoom);
  const bestBoth =
    meetingAndFitting.length > 0
      ? meetingAndFitting.reduce((a, b) => (a.areaSqft <= b.areaSqft ? a : b))
      : null;
  const largestThatFits =
    meetingAndFitting.length > 0
      ? meetingAndFitting.reduce((a, b) => (a.areaSqft >= b.areaSqft ? a : b))
      : null;

  const borderVerdict = !pick
    ? "none"
    : pick.idealBorder
      ? "ideal"
      : pick.fitsRoom
        ? "tight"
        : "toobig";

  return {
    roomType,
    placement,
    placementNote: required.note,

    furnitureWidthCm: round1(furnitureWidthCm),
    furnitureDepthCm: round1(furnitureDepthCm),
    zoneDepthCm: round1(zoneDepthCm),
    roomWidthCm: round1(roomWidthCm),
    roomLengthCm: round1(roomLengthCm),

    requiredWidthCm: round1(required.widthCm),
    requiredLengthCm: round1(required.lengthCm),
    requiredShortFt: round2(requiredShort / CM_PER_FOOT),
    requiredLongFt: round2(requiredLong / CM_PER_FOOT),

    pickLabel: pick ? pick.label : "",
    pickShortCm: pick ? round1(pick.shortCm) : NaN,
    pickLongCm: pick ? round1(pick.longCm) : NaN,
    pickAreaSqft: pick ? pick.areaSqft : NaN,
    pickCount: wantRunner ? 2 : 1,

    borderShortCm: pick ? round1(pick.borderShortCm) : NaN,
    borderLongCm: pick ? round1(pick.borderLongCm) : NaN,
    borderVerdict,

    alternativeLabel: bestBoth && pick && bestBoth.label !== pick.label ? bestBoth.label : "",
    largestThatFitsLabel: largestThatFits ? largestThatFits.label : "",

    sizes: candidates.map((item) => ({
      label: item.label,
      shortCm: round1(item.shortCm),
      longCm: round1(item.longCm),
      meetsRequirement: item.meetsRequirement,
      fitsRoom: item.fitsRoom,
    })),
  };
}
