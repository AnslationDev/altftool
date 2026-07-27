/**
 * Traditional Vastu Shastra colour associations by direction, presented as a
 * reference. Vastu is a body of traditional Indian architectural practice, not
 * a measurable science; everything below is a record of what the tradition
 * says, not a claim about outcomes.
 *
 * The one genuinely computational part is the compass work.
 *
 * DIRECTION FROM A BEARING. Vastu divides the plan into eight sectors of 45
 * degrees each, centred on the cardinal and ordinal points, so north spans
 * 337.5 to 22.5 degrees, north-east 22.5 to 67.5, and so on. The sector index
 * is therefore round(bearing / 45) mod 8.
 *
 * MAGNETIC DECLINATION. Vastu orientation is taken from true (geographic)
 * north, while a phone or handheld compass needle points at magnetic north.
 * The two differ by the local magnetic declination, and:
 *
 *   true bearing = magnetic bearing + declination
 *
 * with declination signed east-positive. Declination across India runs from
 * roughly 1 degree west in the far north-west to about 3 degrees east in the
 * north-east, so the correction is small there but large enough to move a
 * reading that sits near a 22.5 degree sector boundary into the next sector.
 * Declination also drifts year on year, so the current local value should be
 * looked up rather than assumed.
 *
 * Sources for the associations: the standard dikpala (directional guardian),
 * panchabhuta (five element) and navagraha (planetary) correspondences used
 * across mainstream Vastu texts and practice.
 */

/** Vastu divides the plan into eight sectors of this many degrees each. */
export const SECTOR_DEGREES = 45;

/** Half a sector — the distance from a cardinal point to a sector boundary. */
export const SECTOR_HALF = SECTOR_DEGREES / 2;

/** A reading within this many degrees of a boundary is treated as borderline. */
export const BOUNDARY_TOLERANCE = 5;

/**
 * The eight directions in clockwise order from north, each with its
 * traditional guardian deity, element, planet and colour associations.
 * Hex values are representative of the named shade, for on-screen reference.
 */
export const DIRECTIONS = [
  {
    id: "N",
    name: "North",
    sanskrit: "Uttara",
    deity: "Kubera",
    element: "Water (Jal)",
    planet: "Mercury (Budha)",
    theme: "Wealth, opportunity and cash flow",
    colours: [
      { name: "Pistachio green", hex: "#B7D3A8" },
      { name: "Light green", hex: "#CBE3B4" },
      { name: "Pale blue", hex: "#BFD9E8" },
    ],
    avoid: ["Deep red", "Heavy black"],
    note: "Kept light and open in the tradition, since north is where wealth is said to enter. Greens tied to Mercury are the usual choice.",
  },
  {
    id: "NE",
    name: "North-East",
    sanskrit: "Ishanya",
    deity: "Ishana (Shiva)",
    element: "Water (Jal)",
    planet: "Jupiter (Brihaspati)",
    theme: "Clarity, study and prayer",
    colours: [
      { name: "White", hex: "#F7F7F4" },
      { name: "Light blue", hex: "#CBDDF0" },
      { name: "Pale yellow", hex: "#F3E7B8" },
    ],
    avoid: ["Black", "Dark red", "Heavy dark brown"],
    note: "Treated as the most auspicious corner and kept the lightest and least cluttered part of the home.",
  },
  {
    id: "E",
    name: "East",
    sanskrit: "Purva",
    deity: "Indra",
    element: "Air (Vayu)",
    planet: "Sun (Surya)",
    theme: "Health, growth and new beginnings",
    colours: [
      { name: "White", hex: "#F7F7F4" },
      { name: "Light blue", hex: "#CBDDF0" },
      { name: "Soft wood tone", hex: "#D9C3A5" },
    ],
    avoid: ["Very dark shades that block morning light"],
    note: "Associated with the rising sun, so pale reflective finishes that carry morning light into the room are preferred.",
  },
  {
    id: "SE",
    name: "South-East",
    sanskrit: "Agneya",
    deity: "Agni",
    element: "Fire (Agni)",
    planet: "Venus (Shukra)",
    theme: "Energy, cooking and transformation",
    colours: [
      { name: "Orange", hex: "#E2A05A" },
      { name: "Coral red", hex: "#D97764" },
      { name: "Silver grey", hex: "#C6C8CB" },
    ],
    avoid: ["Blue", "Black"],
    note: "The fire corner, and the traditional position for the kitchen hob. Warm shades are said to suit it and water colours to work against it.",
  },
  {
    id: "S",
    name: "South",
    sanskrit: "Dakshina",
    deity: "Yama",
    element: "Fire (Agni)",
    planet: "Mars (Mangal)",
    theme: "Stability, discipline and reputation",
    colours: [
      { name: "Terracotta", hex: "#C97B5A" },
      { name: "Coral", hex: "#E09A86" },
      { name: "Warm red", hex: "#C05B4B" },
    ],
    avoid: ["Pale blue used across a whole wall"],
    note: "A grounded, warm direction in the tradition. Depth here is welcome, where north and north-east are kept pale.",
  },
  {
    id: "SW",
    name: "South-West",
    sanskrit: "Nairutya",
    deity: "Nirriti",
    element: "Earth (Prithvi)",
    planet: "Rahu",
    theme: "Weight, permanence and relationships",
    colours: [
      { name: "Beige", hex: "#DCCBB0" },
      { name: "Peach", hex: "#EDC3A8" },
      { name: "Earth brown", hex: "#A98467" },
    ],
    avoid: ["Blue", "Black", "Anything that lightens the corner"],
    note: "The heaviest corner, traditionally given to the master bedroom and to storage. Earth colours reinforce that weight.",
  },
  {
    id: "W",
    name: "West",
    sanskrit: "Paschima",
    deity: "Varuna",
    element: "Water (Jal)",
    planet: "Saturn (Shani)",
    theme: "Gains, results and completion",
    colours: [
      { name: "White", hex: "#F7F7F4" },
      { name: "Silver grey", hex: "#C6C8CB" },
      { name: "Deep blue", hex: "#5C7CA6" },
    ],
    avoid: ["Strong red across a whole wall"],
    note: "Associated with Saturn and with things being completed. Cool, quiet finishes are the tradition here.",
  },
  {
    id: "NW",
    name: "North-West",
    sanskrit: "Vayavya",
    deity: "Vayu",
    element: "Air (Vayu)",
    planet: "Moon (Chandra)",
    theme: "Movement, guests and support",
    colours: [
      { name: "Cream", hex: "#F1E7D6" },
      { name: "White", hex: "#F7F7F4" },
      { name: "Light grey", hex: "#D6D8DA" },
    ],
    avoid: ["Deep red", "Heavy dark tones"],
    note: "The direction of air and movement, given to guest rooms and to things that should not settle permanently.",
  },
];

/** The centre of the plan, treated separately from the eight sectors. */
export const CENTRE = {
  id: "C",
  name: "Centre",
  sanskrit: "Brahmasthan",
  deity: "Brahma",
  element: "Space (Akasha)",
  planet: "—",
  theme: "Openness and the balance of the whole plan",
  colours: [
    { name: "White", hex: "#F7F7F4" },
    { name: "Off-white", hex: "#F0EDE6" },
    { name: "Pale cream", hex: "#F4EDE0" },
  ],
  avoid: ["Dark colours", "Heavy fixed structures of any colour"],
  note: "Traditionally left open and pale. Heavy structures, staircases and toilets in the centre of the plan are the thing Vastu objects to most consistently.",
};

/**
 * Rooms and the directions the tradition prefers, accepts and avoids.
 * A direction not listed anywhere is treated as neutral.
 */
export const ROOMS = [
  { id: "pooja", label: "Pooja / prayer room", preferred: ["NE"], acceptable: ["E", "N"], avoid: ["S", "SW", "SE"], note: "The north-east corner, at ground level, with the person facing east or north while praying." },
  { id: "kitchen", label: "Kitchen", preferred: ["SE"], acceptable: ["NW"], avoid: ["NE", "SW", "N"], note: "South-east is the fire corner; the hob traditionally sits there with the cook facing east." },
  { id: "master-bedroom", label: "Master bedroom", preferred: ["SW"], acceptable: ["S", "W"], avoid: ["NE", "SE"], note: "The heaviest corner of the plan is given to the heads of the household." },
  { id: "children-bedroom", label: "Children's bedroom", preferred: ["W", "NW"], acceptable: ["E", "N"], avoid: ["SW", "SE"], note: "West and north-west are the usual choices; the south-west is reserved for the master bedroom." },
  { id: "guest-bedroom", label: "Guest bedroom", preferred: ["NW"], acceptable: ["W"], avoid: ["SW"], note: "North-west is the direction of air and movement, so guests are not held in place." },
  { id: "living", label: "Living room", preferred: ["N", "NE", "E"], acceptable: ["NW", "W"], avoid: ["SW"], note: "Kept in the lighter half of the plan, with seating arranged so the household faces north or east." },
  { id: "dining", label: "Dining room", preferred: ["W"], acceptable: ["E", "N"], avoid: ["SW", "NE"], note: "West is the conventional position, ideally adjoining but not inside the kitchen." },
  { id: "study", label: "Study / home office", preferred: ["NE", "N", "E"], acceptable: ["W"], avoid: ["SE", "SW"], note: "Facing east or north while working is the traditional arrangement." },
  { id: "bathroom", label: "Bathroom / toilet", preferred: ["NW", "W"], acceptable: ["S"], avoid: ["NE", "SE", "C"], note: "Kept out of the north-east above all; the tradition treats a toilet there as the most serious fault in a plan." },
  { id: "store", label: "Store room", preferred: ["SW", "W"], acceptable: ["S"], avoid: ["NE"], note: "Weight and stored goods belong in the heavy half of the plan." },
  { id: "staircase", label: "Staircase", preferred: ["S", "SW", "W"], acceptable: ["SE", "NW"], avoid: ["NE", "C"], note: "Kept out of the centre and the north-east, turning clockwise as it rises." },
  { id: "entrance", label: "Main entrance", preferred: ["N", "NE", "E"], acceptable: ["W", "NW"], avoid: ["SW"], note: "The lighter half of the plan is preferred, with the south-west treated as the least favourable entry." },
];

/** All eight sector ids plus the centre, in one lookup. */
export const ALL_ZONES = [...DIRECTIONS, CENTRE];

const round = (value, places = 0) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/** Wrap any bearing into 0 (inclusive) to 360 (exclusive). */
export function normaliseBearing(degrees) {
  if (!Number.isFinite(degrees)) return null;
  return ((degrees % 360) + 360) % 360;
}

/**
 * Correct a magnetic compass reading to a true bearing.
 * Declination is east-positive: true = magnetic + declination.
 */
export function toTrueBearing(magneticBearing, declination = 0) {
  const mag = normaliseBearing(magneticBearing);
  if (mag === null) return null;
  const dec = Number.isFinite(declination) ? declination : 0;
  return normaliseBearing(mag + dec);
}

/**
 * Which of the eight 45-degree Vastu sectors a true bearing falls in.
 * North spans 337.5 to 22.5 degrees, so the index is round(bearing / 45) mod 8.
 */
export function directionFromBearing(trueBearing) {
  const bearing = normaliseBearing(trueBearing);
  if (bearing === null) return null;
  const index = Math.round(bearing / SECTOR_DEGREES) % DIRECTIONS.length;
  return DIRECTIONS[index];
}

/**
 * How far a bearing sits from the centre of its sector, and from the nearest
 * sector boundary. Used to flag readings that could fall either way.
 */
export function sectorPosition(trueBearing) {
  const bearing = normaliseBearing(trueBearing);
  if (bearing === null) return null;
  const index = Math.round(bearing / SECTOR_DEGREES) % DIRECTIONS.length;
  const centre = index * SECTOR_DEGREES;
  let offset = bearing - centre;
  if (offset > 180) offset -= 360;
  if (offset < -180) offset += 360;
  const toBoundary = SECTOR_HALF - Math.abs(offset);
  return {
    sectorCentre: centre,
    offsetFromCentre: round(offset, 2),
    degreesToBoundary: round(toBoundary, 2),
    isBorderline: toBoundary <= BOUNDARY_TOLERANCE,
  };
}

/**
 * The Vastu colour guidance for one room in one zone.
 *
 * @param {object} input
 * @param {string} input.zone   one of ALL_ZONES ids ("N", "NE", ... or "C")
 * @param {string} [input.room] one of ROOMS ids
 * @returns {object} { error } or the guidance
 */
export function vastuGuidance({ zone, room } = {}) {
  const area = ALL_ZONES.find((z) => z.id === zone);
  if (!area) {
    return { error: "Choose one of the eight directions, or the centre of the plan." };
  }
  const space = ROOMS.find((r) => r.id === room);
  if (!space) {
    return { error: "Choose which room you are decorating." };
  }

  let alignment = "neutral";
  let alignmentLabel = "Not specifically placed by the tradition";
  if (space.preferred.includes(area.id)) {
    alignment = "preferred";
    alignmentLabel = "This is the traditionally preferred direction for this room";
  } else if (space.acceptable.includes(area.id)) {
    alignment = "acceptable";
    alignmentLabel = "An acceptable alternative in the tradition";
  } else if (space.avoid.includes(area.id)) {
    alignment = "avoid";
    alignmentLabel = "The tradition advises against this room in this direction";
  }

  const preferredZones = space.preferred
    .map((id) => ALL_ZONES.find((z) => z.id === id))
    .filter(Boolean);

  // When the room is in a direction the tradition avoids, the usual remedy is
  // to keep the direction's own colours on the walls rather than the room's,
  // so the zone is not further weakened. Both palettes are returned so the
  // difference is visible.
  const remedy =
    alignment === "avoid"
      ? `Moving the room is rarely practical. The conventional response is to decorate for the direction rather than the room — keep ${area.name} in its own palette (${area.colours.map((c) => c.name.toLowerCase()).join(", ")}), keep the zone light and uncluttered, and avoid ${area.avoid.join(" and ").toLowerCase()} here.`
      : null;

  return {
    zoneId: area.id,
    zoneName: area.name,
    sanskrit: area.sanskrit,
    deity: area.deity,
    element: area.element,
    planet: area.planet,
    theme: area.theme,
    colours: area.colours,
    avoid: area.avoid,
    zoneNote: area.note,
    roomId: space.id,
    roomLabel: space.label,
    roomNote: space.note,
    alignment,
    alignmentLabel,
    preferredZoneNames: preferredZones.map((z) => z.name),
    remedy,
  };
}

/**
 * Full lookup from a compass reading: correct for declination, find the
 * sector, and return the guidance for the chosen room in that sector.
 *
 * @param {object} input
 * @param {number} input.magneticBearing  reading from the compass, degrees
 * @param {number} [input.declination]    local magnetic declination, east-positive
 * @param {string} [input.room]           one of ROOMS ids
 */
export function guidanceFromCompass({ magneticBearing, declination = 0, room } = {}) {
  const magnetic = Number(magneticBearing);
  if (!Number.isFinite(magnetic)) {
    return { error: "Enter the compass bearing of the room in degrees, 0 to 360." };
  }
  const dec = Number(declination);
  if (!Number.isFinite(dec) || Math.abs(dec) > 30) {
    return { error: "Magnetic declination should be between -30 and +30 degrees. Look up the current value for your location." };
  }
  const trueBearing = toTrueBearing(magnetic, dec);
  const direction = directionFromBearing(trueBearing);
  const position = sectorPosition(trueBearing);
  const guidance = vastuGuidance({ zone: direction.id, room });
  if (guidance.error) return guidance;
  return {
    ...guidance,
    magneticBearing: round(normaliseBearing(magnetic), 1),
    declination: round(dec, 1),
    trueBearing: round(trueBearing, 1),
    sectorFrom: round(normaliseBearing(position.sectorCentre - SECTOR_HALF), 1),
    sectorTo: round(normaliseBearing(position.sectorCentre + SECTOR_HALF), 1),
    offsetFromCentre: position.offsetFromCentre,
    degreesToBoundary: position.degreesToBoundary,
    isBorderline: position.isBorderline,
  };
}
