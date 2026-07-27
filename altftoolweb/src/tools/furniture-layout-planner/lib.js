/**
 * Furniture Layout Planner — room maths, clearance rules and a deterministic
 * wall-hugging arrangement for a printable floor plan.
 *
 * Every dimension below is a published residential space-planning figure,
 * converted with the exact factor 1 inch = 2.54 cm:
 *
 *   Circulation
 *     main walkway through a room      36 in  =  91 cm
 *     secondary path (beside a bed)    24 in  =  61 cm
 *     sofa to coffee table             18 in  =  46 cm
 *     dining chair pull-out from table 36 in  =  91 cm
 *     walking behind a seated diner    44 in  = 112 cm
 *     in front of a hinged wardrobe    30 in  =  76 cm
 *     behind a desk for the chair      30 in  =  76 cm
 *
 *   Density guideline
 *     furniture should cover no more than 60% of the floor, leaving 40% open
 *     for circulation — the standard rule of thumb in residential planning.
 *
 *   Television seating distance
 *     SMPTE 30-degree viewing angle  ->  distance ~= 1.6 x screen diagonal
 *     THX 40-degree viewing angle    ->  distance ~= 1.2 x screen diagonal
 *
 * Furniture sizes are standard manufactured sizes (US mattress sizes are the
 * ISPA standards: Twin 38x75 in, Full 54x75 in, Queen 60x80 in, King 76x80 in).
 *
 * Pure module: no React, no DOM, no clock reads, no storage.
 */

/** Exact inch-to-centimetre factor. */
export const CM_PER_INCH = 2.54;
/** Exact square-metre to square-foot factor (1 m = 39.3700787 in). */
export const SQFT_PER_SQM = 10.7639104;

/** Clearance minimums in centimetres, converted from the inch figures above. */
export const CLEARANCES = {
  mainWalkway: 91, // 36 in — the primary path through a room
  minorWalkway: 61, // 24 in — one side of a bed, between a wall and a chest
  sofaToCoffeeTable: 46, // 18 in
  diningChairPullout: 91, // 36 in from the table edge to the wall
  diningWalkBehind: 112, // 44 in when someone also walks behind the chair
  wardrobeDoorSwing: 76, // 30 in in front of a hinged door
  deskChairPullout: 76, // 30 in behind a desk
};

/** Keep furniture under 60% of the floor so 40% stays open for circulation. */
export const MAX_FURNITURE_DENSITY = 0.6;

/** Screen-diagonal multipliers for seating distance. */
export const TV_DISTANCE_THX = 1.2; // 40-degree viewing angle
export const TV_DISTANCE_SMPTE = 1.6; // 30-degree viewing angle

/** Sanity limits: rooms between 1 m and 30 m a side. */
export const MIN_ROOM_CM = 100;
export const MAX_ROOM_CM = 3000;
/** No more than this many pieces in one plan. */
export const MAX_PIECES = 40;

/**
 * Standard manufactured furniture footprints, width x depth in centimetres.
 * `wall` marks pieces that normally sit against a wall.
 */
export const FURNITURE_CATALOGUE = {
  bedSingle: { label: "Single bed (Twin, 38x75 in)", width: 97, depth: 191, wall: true, group: "Bedroom" },
  bedDouble: { label: "Double bed (Full, 54x75 in)", width: 137, depth: 191, wall: true, group: "Bedroom" },
  bedQueen: { label: "Queen bed (60x80 in)", width: 152, depth: 203, wall: true, group: "Bedroom" },
  bedKing: { label: "King bed (76x80 in)", width: 193, depth: 203, wall: true, group: "Bedroom" },
  bedsideTable: { label: "Bedside table", width: 45, depth: 40, wall: true, group: "Bedroom" },
  wardrobe2: { label: "Wardrobe, 2 door", width: 90, depth: 60, wall: true, group: "Bedroom" },
  wardrobe3: { label: "Wardrobe, 3 door", width: 135, depth: 60, wall: true, group: "Bedroom" },
  dresser: { label: "Chest of drawers", width: 100, depth: 45, wall: true, group: "Bedroom" },
  sofa3: { label: "Sofa, 3 seat", width: 210, depth: 90, wall: true, group: "Living" },
  sofa2: { label: "Sofa, 2 seat", width: 150, depth: 90, wall: true, group: "Living" },
  armchair: { label: "Armchair", width: 85, depth: 85, wall: false, group: "Living" },
  coffeeTable: { label: "Coffee table", width: 120, depth: 60, wall: false, group: "Living" },
  tvUnit: { label: "TV unit", width: 150, depth: 40, wall: true, group: "Living" },
  bookshelf: { label: "Bookshelf", width: 80, depth: 30, wall: true, group: "Living" },
  diningTable4: { label: "Dining table, 4 seat", width: 120, depth: 75, wall: false, group: "Dining" },
  diningTable6: { label: "Dining table, 6 seat", width: 180, depth: 90, wall: false, group: "Dining" },
  diningChair: { label: "Dining chair", width: 45, depth: 50, wall: false, group: "Dining" },
  sideboard: { label: "Sideboard", width: 160, depth: 45, wall: true, group: "Dining" },
  desk: { label: "Desk", width: 120, depth: 60, wall: true, group: "Work" },
  officeChair: { label: "Office chair", width: 60, depth: 60, wall: false, group: "Work" },
  filingCabinet: { label: "Filing cabinet", width: 45, depth: 60, wall: true, group: "Work" },
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round = (value, places = 2) => {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

/** Centimetres to a readable metric + imperial string. */
export function formatLength(cm) {
  if (!isNum(cm)) return "—";
  const inches = cm / CM_PER_INCH;
  const feet = Math.floor(inches / 12);
  const restInches = Math.round(inches - feet * 12);
  return `${round(cm / 100, 2)} m (${feet}' ${restInches}")`;
}

/** Floor area of a rectangular room. */
export function roomArea({ lengthCm, widthCm } = {}) {
  if (!isNum(lengthCm) || !isNum(widthCm)) return { error: "Enter both room dimensions in centimetres." };
  if (lengthCm < MIN_ROOM_CM || widthCm < MIN_ROOM_CM) {
    return { error: `A room side must be at least ${MIN_ROOM_CM} cm (1 m).` };
  }
  if (lengthCm > MAX_ROOM_CM || widthCm > MAX_ROOM_CM) {
    return { error: `This planner handles rooms up to ${MAX_ROOM_CM / 100} m a side.` };
  }
  const areaSqM = (lengthCm * widthCm) / 10000;
  return {
    lengthCm,
    widthCm,
    areaSqM: round(areaSqM, 2),
    areaSqFt: round(areaSqM * SQFT_PER_SQM, 1),
    perimeterCm: round(2 * (lengthCm + widthCm), 0),
  };
}

/**
 * Seating distance for a television, from the screen diagonal.
 *
 * @param {number} diagonalInches
 */
export function tvSeatingDistance(diagonalInches) {
  if (!isNum(diagonalInches) || diagonalInches <= 0) {
    return { error: "Enter the screen diagonal in inches." };
  }
  const diagonalCm = diagonalInches * CM_PER_INCH;
  return {
    diagonalInches,
    minCm: round(diagonalCm * TV_DISTANCE_THX, 0),
    maxCm: round(diagonalCm * TV_DISTANCE_SMPTE, 0),
  };
}

/** Resolve a piece row into its real footprint, from the catalogue or custom sizes. */
export function resolvePiece(piece = {}) {
  const quantity = isNum(piece.quantity) ? Math.floor(piece.quantity) : 1;
  if (quantity < 1) return { error: "Every piece needs a quantity of at least 1." };
  if (piece.type === "custom") {
    if (!isNum(piece.width) || !isNum(piece.depth) || piece.width <= 0 || piece.depth <= 0) {
      return { error: "A custom piece needs a width and a depth greater than zero." };
    }
    return {
      key: piece.key ?? "custom",
      label: piece.label || "Custom piece",
      width: piece.width,
      depth: piece.depth,
      wall: piece.wall !== false,
      quantity,
    };
  }
  const meta = FURNITURE_CATALOGUE[piece.type];
  if (!meta) return { error: `"${piece.type}" is not a piece this planner knows.` };
  return { key: piece.key ?? piece.type, label: meta.label, width: meta.width, depth: meta.depth, wall: meta.wall, quantity };
}

/**
 * Place wall-hugging pieces around the perimeter, clockwise from the top-left
 * corner: top wall, bottom wall, then the two side walls with the corners the
 * top and bottom rows already used taken out. Deterministic — the same input
 * always produces the same plan.
 */
export function arrangeAlongWalls({ lengthCm, widthCm, pieces = [] } = {}) {
  const units = [];
  for (const piece of pieces) {
    for (let i = 0; i < piece.quantity; i += 1) {
      units.push({ key: `${piece.key}-${i + 1}`, label: piece.label, width: piece.width, depth: piece.depth });
    }
  }
  units.sort((a, b) => b.width * b.depth - a.width * a.depth || a.label.localeCompare(b.label));

  const placed = [];
  const unplaced = [];
  let topCursor = 0;
  let bottomCursor = 0;
  let topDepth = 0;
  let bottomDepth = 0;
  const sideQueue = [];

  for (const unit of units) {
    if (unit.width > widthCm && unit.width > lengthCm) {
      unplaced.push(unit);
      continue;
    }
    if (topCursor <= bottomCursor && topCursor + unit.width <= widthCm) {
      placed.push({ ...unit, x: topCursor, y: 0, w: unit.width, h: unit.depth, wall: "top" });
      topCursor += unit.width;
      topDepth = Math.max(topDepth, unit.depth);
    } else if (bottomCursor + unit.width <= widthCm) {
      placed.push({
        ...unit,
        x: bottomCursor,
        y: lengthCm - unit.depth,
        w: unit.width,
        h: unit.depth,
        wall: "bottom",
      });
      bottomCursor += unit.width;
      bottomDepth = Math.max(bottomDepth, unit.depth);
    } else {
      sideQueue.push(unit);
    }
  }

  const sideStart = topDepth;
  const sideLimit = lengthCm - bottomDepth;
  let leftCursor = sideStart;
  let rightCursor = sideStart;

  for (const unit of sideQueue) {
    if (leftCursor <= rightCursor && leftCursor + unit.width <= sideLimit) {
      placed.push({ ...unit, x: 0, y: leftCursor, w: unit.depth, h: unit.width, wall: "left" });
      leftCursor += unit.width;
    } else if (rightCursor + unit.width <= sideLimit) {
      placed.push({
        ...unit,
        x: widthCm - unit.depth,
        y: rightCursor,
        w: unit.depth,
        h: unit.width,
        wall: "right",
      });
      rightCursor += unit.width;
    } else {
      unplaced.push(unit);
    }
  }

  const usedWallCm = topCursor + bottomCursor + (leftCursor - sideStart) + (rightCursor - sideStart);
  return {
    placed,
    unplaced,
    usedWallCm: round(usedWallCm, 0),
    freeWallCm: round(Math.max(0, 2 * (lengthCm + widthCm) - usedWallCm), 0),
    centreGap: {
      widthCm: round(Math.max(0, widthCm - 2 * Math.max(...placed.filter((p) => p.wall === "left" || p.wall === "right").map((p) => p.w), 0)), 0),
      lengthCm: round(Math.max(0, lengthCm - topDepth - bottomDepth), 0),
    },
  };
}

/**
 * Full layout check: area, furniture footprint, density, remaining walkway and
 * a list of clearance warnings.
 *
 * @param {{ lengthCm: number, widthCm: number, pieces: Array, doorways?: number }} input
 * @returns {object} analysis or { error }
 */
export function analyseLayout({ lengthCm, widthCm, pieces = [], doorways = 1 } = {}) {
  const room = roomArea({ lengthCm, widthCm });
  if (room.error) return { error: room.error };
  if (!Array.isArray(pieces) || pieces.length === 0) {
    return { error: "Add at least one piece of furniture to check the layout." };
  }
  if (pieces.length > MAX_PIECES) {
    return { error: `This planner handles up to ${MAX_PIECES} rows of furniture.` };
  }
  if (!isNum(doorways) || doorways < 0 || doorways > 8) {
    return { error: "Enter between 0 and 8 doorways." };
  }

  const resolved = [];
  for (const piece of pieces) {
    const item = resolvePiece(piece);
    if (item.error) return { error: item.error };
    resolved.push(item);
  }

  let footprintSqCm = 0;
  let totalUnits = 0;
  for (const item of resolved) {
    footprintSqCm += item.width * item.depth * item.quantity;
    totalUnits += item.quantity;
  }
  const footprintSqM = footprintSqCm / 10000;
  const density = footprintSqM / room.areaSqM;
  const freeSqM = room.areaSqM - footprintSqM;

  const layout = arrangeAlongWalls({ lengthCm, widthCm, pieces: resolved });

  // Each doorway needs a clear 91 cm swing zone of about 0.83 sq m.
  const doorwayZoneSqM = round(((CLEARANCES.mainWalkway / 100) ** 2) * doorways, 2);

  const warnings = [];
  if (density > MAX_FURNITURE_DENSITY) {
    warnings.push(
      `Furniture covers ${Math.round(density * 100)}% of the floor. Keep it under ${Math.round(
        MAX_FURNITURE_DENSITY * 100,
      )}% so there is room to move.`,
    );
  }
  if (freeSqM < doorwayZoneSqM) {
    warnings.push(
      `Only ${round(freeSqM, 2)} sq m is left free, less than the ${doorwayZoneSqM} sq m the doorways alone need to swing and enter.`,
    );
  }
  if (layout.unplaced.length > 0) {
    warnings.push(
      `${layout.unplaced.length} piece${layout.unplaced.length === 1 ? "" : "s"} will not fit along a wall: ${layout.unplaced
        .map((unit) => unit.label)
        .join(", ")}.`,
    );
  }
  if (layout.centreGap.lengthCm < CLEARANCES.mainWalkway) {
    warnings.push(
      `The gap between the front and back rows is ${layout.centreGap.lengthCm} cm — a main walkway needs ${CLEARANCES.mainWalkway} cm.`,
    );
  }
  const bed = resolved.find((item) => item.key.startsWith("bed") && item.depth > 150);
  if (bed) {
    const sideSpace = (widthCm - bed.width) / 2;
    if (sideSpace < CLEARANCES.minorWalkway) {
      warnings.push(
        `A ${bed.label} centred on this wall leaves ${Math.round(sideSpace)} cm each side; you need ${CLEARANCES.minorWalkway} cm to walk past.`,
      );
    }
  }
  const diningTable = resolved.find((item) => item.key.startsWith("diningTable"));
  if (diningTable) {
    const needed = diningTable.depth + 2 * CLEARANCES.diningChairPullout;
    if (needed > Math.min(lengthCm, widthCm)) {
      warnings.push(
        `A ${diningTable.label} needs ${needed} cm across to pull chairs out on both sides; the shorter room side is ${Math.min(
          lengthCm,
          widthCm,
        )} cm.`,
      );
    }
  }

  return {
    room,
    totalUnits,
    footprintSqM: round(footprintSqM, 2),
    footprintSqFt: round(footprintSqM * SQFT_PER_SQM, 1),
    densityPercent: round(density * 100, 1),
    freeSqM: round(freeSqM, 2),
    freeSqFt: round(freeSqM * SQFT_PER_SQM, 1),
    freePercent: round((1 - density) * 100, 1),
    maxFootprintSqM: round(room.areaSqM * MAX_FURNITURE_DENSITY, 2),
    spareCapacitySqM: round(room.areaSqM * MAX_FURNITURE_DENSITY - footprintSqM, 2),
    doorwayZoneSqM,
    layout,
    warnings,
    comfortable: warnings.length === 0,
    resolved,
  };
}

/** A sensible starting layout: a 12 x 14 ft bedroom with the usual pieces. */
export const DEFAULT_PIECES = [
  { key: "bedQueen", type: "bedQueen", quantity: 1 },
  { key: "bedsideTable", type: "bedsideTable", quantity: 2 },
  { key: "wardrobe3", type: "wardrobe3", quantity: 1 },
  { key: "dresser", type: "dresser", quantity: 1 },
];
