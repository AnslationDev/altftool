/**
 * Puja room planner — the measurable part of the layout, plus the traditional
 * placement guidance that people usually want alongside it.
 *
 * The dimensions are geometry, not belief:
 *
 *   shrine width = (idol width * count) + gaps between idols + side margins
 *   shrine depth = idol depth + a zone in front for lamp, offerings and thali
 *   platform top = the worshipper's eye height when seated - the height of the
 *                  idol's face above its own base
 *
 * That last line is the whole point of a platform: traditional practice places
 * the deity's face at or a little above the eye level of the person praying, and
 * eye level depends on whether you sit on the floor or stand.
 *
 * The direction notes below record widely followed Vastu convention. They are
 * offered as information about that tradition, not as a rule about what a home
 * must do; nothing here is religious or structural advice.
 */

/** Spacing around and between idols, in millimetres. */
export const IDOL_GAP_MM = 100;
export const SHRINE_SIDE_MARGIN_MM = 75;
/** Depth kept in front of the idols for the lamp, bell, thali and offerings. */
export const OFFERING_ZONE_MM = 250;

/** An idol's face sits roughly nine-tenths of the way up its own height. */
export const IDOL_FACE_HEIGHT_RATIO = 0.9;

/**
 * Anthropometric ratios of standing height used to locate eye level:
 * sitting cross-legged on the floor puts the eyes near 0.48 of stature, and
 * standing puts them near 0.936 of stature.
 */
export const FLOOR_SEATED_EYE_RATIO = 0.48;
export const STANDING_EYE_RATIO = 0.936;

/** A person seated for prayer occupies roughly a 600 x 900 mm mat. */
export const MAT_WIDTH_MM = 600;
export const MAT_DEPTH_MM = 900;
/** Room to stand up and step away behind the seating. */
export const CIRCULATION_MM = 600;

/** Clear height to keep above an oil lamp so heat and soot are not trapped. */
export const LAMP_HEADROOM_MM = 600;

/** Each storage shelf or drawer holds about this many puja items. */
export const ITEMS_PER_SHELF = 8;

/**
 * Traditional Vastu preference for where a shrine sits within the home.
 * North-east (Ishanya) is the most commonly recommended zone.
 */
export const DIRECTION_NOTES = [
  { id: "north-east", label: "North-east (Ishanya)", rank: 1, note: "The zone traditionally set aside for worship — the first choice in Vastu practice." },
  { id: "east", label: "East", rank: 2, note: "Widely accepted, and it lets the person praying face the rising sun." },
  { id: "north", label: "North", rank: 2, note: "Commonly used when the north-east corner is not available." },
  { id: "west", label: "West", rank: 3, note: "Workable if north-east, east and north are all taken." },
  { id: "north-west", label: "North-west", rank: 4, note: "Traditionally avoided for a shrine; usually assigned to storage instead." },
  { id: "south-east", label: "South-east (Agni)", rank: 4, note: "Traditionally the fire zone, associated with the kitchen rather than the shrine." },
  { id: "south", label: "South", rank: 5, note: "Traditionally avoided for a puja space." },
  { id: "south-west", label: "South-west", rank: 5, note: "Traditionally reserved for the heaviest, most permanent use, not for a shrine." },
];

/** Deity facing convention: idols face west or south, so the devotee faces east or north. */
export const DEITY_FACING = "West or south";
export const DEVOTEE_FACING = "East or north";

const MAX_IDOLS = 12;

export function directionNote(id) {
  return DIRECTION_NOTES.find((entry) => entry.id === id) || null;
}

/**
 * @returns {{error:string}|object}
 */
export function planPujaRoom({
  direction = "north-east",
  idolCount = 3,
  idolWidthMm = 150,
  idolDepthMm = 150,
  idolHeightMm = 300,
  devoteeHeightCm = 165,
  posture = "floor",
  devotees = 2,
  itemsToStore = 20,
  availableWidthMm = 1200,
  availableDepthMm = 2100,
  underStaircase = false,
  sharesToiletWall = false,
  insideBedroom = false,
}) {
  const zone = directionNote(direction);
  if (!zone) return { error: "Choose where in the home the puja space sits." };
  if (posture !== "floor" && posture !== "standing") {
    return { error: "Choose whether you pray seated on the floor or standing." };
  }

  const numbers = [
    idolCount,
    idolWidthMm,
    idolDepthMm,
    idolHeightMm,
    devoteeHeightCm,
    devotees,
    itemsToStore,
    availableWidthMm,
    availableDepthMm,
  ];
  if (numbers.some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter a valid number in every field." };
  }
  if (!Number.isInteger(idolCount) || idolCount < 1 || idolCount > MAX_IDOLS) {
    return { error: `Number of idols must be a whole number from 1 to ${MAX_IDOLS}.` };
  }
  if (idolWidthMm <= 0 || idolDepthMm <= 0 || idolHeightMm <= 0) {
    return { error: "Idol width, depth and height must all be greater than zero." };
  }
  if (idolWidthMm > 1500 || idolDepthMm > 1500 || idolHeightMm > 2000) {
    return { error: "These idol dimensions are larger than a domestic shrine can hold." };
  }
  if (devoteeHeightCm < 100 || devoteeHeightCm > 220) {
    return { error: "Enter a standing height between 100 cm and 220 cm." };
  }
  if (!Number.isInteger(devotees) || devotees < 1 || devotees > 12) {
    return { error: "Number of people praying together must be a whole number from 1 to 12." };
  }
  if (itemsToStore < 0) return { error: "Item count cannot be negative." };
  if (availableWidthMm <= 0 || availableDepthMm <= 0) {
    return { error: "The space available must be greater than zero in both directions." };
  }

  const shrineWidthMm =
    idolCount * idolWidthMm + (idolCount - 1) * IDOL_GAP_MM + 2 * SHRINE_SIDE_MARGIN_MM;
  const shrineDepthMm = idolDepthMm + OFFERING_ZONE_MM;

  const eyeRatio = posture === "floor" ? FLOOR_SEATED_EYE_RATIO : STANDING_EYE_RATIO;
  const eyeHeightMm = devoteeHeightCm * 10 * eyeRatio;
  const idolFaceAboveBaseMm = idolHeightMm * IDOL_FACE_HEIGHT_RATIO;
  const rawPlatformHeightMm = eyeHeightMm - idolFaceAboveBaseMm;
  const platformHeightMm = Math.max(0, rawPlatformHeightMm);
  // A tall idol already reaches eye level from the floor of the shrine.
  const idolReachesEyeLevelUnaided = rawPlatformHeightMm <= 0;

  // People sit side by side across whatever width the room gives, not just the shrine width.
  const matsPerRow = Math.max(1, Math.floor(availableWidthMm / MAT_WIDTH_MM));
  const seatingRows = Math.ceil(devotees / matsPerRow);
  const seatingDepthMm = seatingRows * MAT_DEPTH_MM;
  const totalDepthMm = shrineDepthMm + seatingDepthMm + CIRCULATION_MM;
  const seatingWidthMm = Math.min(devotees, matsPerRow) * MAT_WIDTH_MM;

  const widthFits = shrineWidthMm <= availableWidthMm;
  const depthFits = totalDepthMm <= availableDepthMm;

  const shelvesNeeded = Math.ceil(itemsToStore / ITEMS_PER_SHELF);

  const cautions = [];
  if (zone.rank >= 4) cautions.push(`${zone.label}: ${zone.note}`);
  if (underStaircase) {
    cautions.push("Under a staircase: traditionally avoided, and in practice the headroom and the footfall overhead both work against a quiet shrine.");
  }
  if (sharesToiletWall) {
    cautions.push("Shares a wall with a bathroom or toilet: traditionally avoided, and damp migrating through the wall will damage wooden shrine work.");
  }
  if (insideBedroom) {
    cautions.push("Inside a bedroom: many families avoid this; if there is no alternative, a shuttered or curtained cabinet away from the foot of the bed is the usual compromise.");
  }
  if (!widthFits) {
    cautions.push(`The shrine needs ${Math.round(shrineWidthMm)} mm of width but only ${Math.round(availableWidthMm)} mm is free.`);
  }
  if (!depthFits) {
    cautions.push(`Shrine, seating and circulation need ${Math.round(totalDepthMm)} mm of depth but only ${Math.round(availableDepthMm)} mm is free.`);
  }

  return {
    zone,
    shrineWidthMm,
    shrineDepthMm,
    platformHeightMm,
    idolReachesEyeLevelUnaided,
    eyeHeightMm,
    idolFaceAboveBaseMm,
    matsPerRow,
    seatingRows,
    seatingDepthMm,
    seatingWidthMm,
    totalDepthMm,
    footprintM2: (shrineWidthMm / 1000) * (totalDepthMm / 1000),
    widthFits,
    depthFits,
    shelvesNeeded,
    lampHeadroomMm: LAMP_HEADROOM_MM,
    deityFacing: DEITY_FACING,
    devoteeFacing: DEVOTEE_FACING,
    cautions,
  };
}
