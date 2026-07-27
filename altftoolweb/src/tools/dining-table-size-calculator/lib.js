/**
 * Dining table sizing and clearance.
 *
 * The rules used here are the standard furniture-planning figures:
 *  - each diner needs a run of table edge to themselves;
 *  - a table with diners facing each other needs enough depth for two place
 *    settings plus a serving strip down the middle;
 *  - a chair needs floor behind the table edge to be pulled out and sat on.
 */

/** Table edge per diner. 60 cm is the usual minimum, 70 cm is generous. */
export const EDGE_PER_DINER_MIN_CM = 60;
export const EDGE_PER_DINER_COMFORT_CM = 70;

/**
 * Table depth for a rectangular or square table used from both sides:
 * 2 x 35 cm place settings plus a 20 cm serving strip = 90 cm.
 */
export const TABLE_DEPTH_MIN_CM = 75;
export const TABLE_DEPTH_RECOMMENDED_CM = 90;

/** Floor behind the table edge so a chair can be pulled out and sat on. */
export const CHAIR_CLEARANCE_CM = 90;
/** Extra floor when people also walk behind seated diners. */
export const WALKWAY_CLEARANCE_CM = 120;

/** Standard dining ergonomics. */
export const TABLE_HEIGHT_CM = 75;
export const CHAIR_SEAT_HEIGHT_CM = 45;
export const KNEE_CLEARANCE_CM = 30;

/** Beyond this diameter nobody can reach the middle of a round table. */
export const ROUND_REACH_LIMIT_CM = 150;

/** Tables are made in 5 cm steps, so recommendations are rounded up to that. */
export const SIZE_STEP_CM = 5;

export const MAX_SEATS = 20;

export const SHAPES = [
  { id: "rectangle", label: "Rectangular / oval" },
  { id: "round", label: "Round" },
  { id: "square", label: "Square" },
];

const round = (value, dp) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

const roundUpToStep = (value) => Math.ceil(value / SIZE_STEP_CM) * SIZE_STEP_CM;

/**
 * Recommended table dimensions for a seat count.
 * Returns { lengthCm, widthCm } for rectangle/square, { diameterCm } for round.
 */
export function tableForSeats({ seats, shape, edgePerDinerCm, seatEnds = false }) {
  if (shape === "round") {
    // Circumference must give every diner their run of edge: pi * D >= n * edge.
    const needed = (seats * edgePerDinerCm) / Math.PI;
    const diameterCm = Math.max(TABLE_DEPTH_RECOMMENDED_CM, roundUpToStep(needed));
    return { diameterCm, lengthCm: diameterCm, widthCm: diameterCm };
  }

  if (shape === "square") {
    // All four sides are used: perimeter 4S >= n * edge.
    const needed = (seats * edgePerDinerCm) / 4;
    const side = Math.max(TABLE_DEPTH_RECOMMENDED_CM, roundUpToStep(needed));
    return { lengthCm: side, widthCm: side };
  }

  // Rectangle: long sides always used, short ends optional.
  const endSeats = seatEnds ? Math.min(2, seats) : 0;
  const sideSeats = Math.max(0, seats - endSeats);
  const perSide = Math.ceil(sideSeats / 2);
  const lengthCm = Math.max(edgePerDinerCm, roundUpToStep(perSide * edgePerDinerCm));
  // If the ends are used, the table also has to be wide enough for a place setting there.
  const widthCm = Math.max(
    TABLE_DEPTH_RECOMMENDED_CM,
    seatEnds ? roundUpToStep(edgePerDinerCm) : 0,
  );
  return { lengthCm, widthCm, perSide, endSeats };
}

/** How many diners a given table takes at a given edge allowance. */
export function seatsForTable({ shape, lengthCm, widthCm, edgePerDinerCm, seatEnds = false }) {
  if (!(edgePerDinerCm > 0)) return 0;
  if (shape === "round") {
    return Math.floor((Math.PI * lengthCm) / edgePerDinerCm);
  }
  if (shape === "square") {
    return Math.floor((4 * lengthCm) / edgePerDinerCm);
  }
  const perSide = Math.floor(lengthCm / edgePerDinerCm);
  const ends = seatEnds && widthCm >= edgePerDinerCm ? 2 : 0;
  return perSide * 2 + ends;
}

/**
 * Full plan: table size for the seats you want, footprint with chairs pulled
 * out, whether it fits the room, and the largest table the room can take.
 *
 * @param {object} input
 * @param {number} input.seats
 * @param {string} input.shape        rectangle | round | square
 * @param {number} input.edgePerDinerCm
 * @param {boolean} input.seatEnds    seat the short ends of a rectangular table
 * @param {boolean} input.walkBehind  people walk behind seated diners
 * @param {number} input.roomLengthCm
 * @param {number} input.roomWidthCm
 */
export function planDiningTable({
  seats,
  shape = "rectangle",
  edgePerDinerCm = EDGE_PER_DINER_MIN_CM,
  seatEnds = false,
  walkBehind = false,
  roomLengthCm,
  roomWidthCm,
}) {
  const n = Number(seats);
  const edge = Number(edgePerDinerCm);
  const roomL = Number(roomLengthCm);
  const roomW = Number(roomWidthCm);

  if (!SHAPES.some((item) => item.id === shape)) {
    return { error: "Choose a table shape: rectangular, round or square." };
  }
  if (![n, edge, roomL, roomW].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for seats, edge per diner and room size." };
  }
  if (!Number.isInteger(n) || n < 2 || n > MAX_SEATS) {
    return { error: `Seat count must be a whole number between 2 and ${MAX_SEATS}.` };
  }
  if (edge < 45 || edge > 120) {
    return { error: "Edge per diner should be between 45 cm and 120 cm." };
  }
  if (roomL <= 0 || roomW <= 0) {
    return { error: "Room length and width must both be greater than zero." };
  }
  if (roomL > 3000 || roomW > 3000) {
    return { error: "Room dimensions above 30 m are outside this planner's range." };
  }

  const clearance = walkBehind ? WALKWAY_CLEARANCE_CM : CHAIR_CLEARANCE_CM;
  const table = tableForSeats({ seats: n, shape, edgePerDinerCm: edge, seatEnds });

  const footprintLengthCm = table.lengthCm + 2 * clearance;
  const footprintWidthCm = table.widthCm + 2 * clearance;

  const fitsLength = footprintLengthCm <= roomL;
  const fitsWidth = footprintWidthCm <= roomW;
  const fits = fitsLength && fitsWidth;

  // Largest table the room can take with the same clearance.
  const maxTableLengthCm = round(roomL - 2 * clearance, 1);
  const maxTableWidthCm = round(roomW - 2 * clearance, 1);

  let roomMaxSeats = 0;
  let roomTooNarrow = false;
  if (maxTableLengthCm > 0 && maxTableWidthCm > 0) {
    if (shape === "round" || shape === "square") {
      const side = Math.min(maxTableLengthCm, maxTableWidthCm);
      roomTooNarrow = side < TABLE_DEPTH_MIN_CM;
      roomMaxSeats = roomTooNarrow
        ? 0
        : seatsForTable({ shape, lengthCm: side, widthCm: side, edgePerDinerCm: edge });
    } else {
      roomTooNarrow = maxTableWidthCm < TABLE_DEPTH_MIN_CM;
      roomMaxSeats = roomTooNarrow
        ? 0
        : seatsForTable({
            shape,
            lengthCm: maxTableLengthCm,
            widthCm: maxTableWidthCm,
            edgePerDinerCm: edge,
            seatEnds,
          });
    }
  } else {
    roomTooNarrow = true;
  }

  const notes = [];
  if (shape === "round" && table.diameterCm > ROUND_REACH_LIMIT_CM) {
    notes.push(
      `A ${table.diameterCm} cm round table is past the ${ROUND_REACH_LIMIT_CM} cm reach limit — nobody can serve themselves from the middle. A rectangular or oval table seats this many people better.`,
    );
  }
  if (shape === "rectangle" && seatEnds) {
    notes.push(`Two diners sit at the short ends, so ${table.perSide} chairs go along each long side.`);
  }
  if (roomTooNarrow) {
    notes.push(
      `With ${clearance} cm of chair clearance on each side, this room leaves under ${TABLE_DEPTH_MIN_CM} cm for the table itself.`,
    );
  }

  const tableAreaSqM =
    shape === "round"
      ? (Math.PI * (table.diameterCm / 2) ** 2) / 10000
      : (table.lengthCm * table.widthCm) / 10000;

  return {
    shape,
    seats: n,
    edgePerDinerCm: edge,
    clearanceCm: clearance,
    tableLengthCm: table.lengthCm,
    tableWidthCm: table.widthCm,
    diameterCm: shape === "round" ? table.diameterCm : null,
    tableAreaSqM: round(tableAreaSqM, 2),
    footprintLengthCm: round(footprintLengthCm, 1),
    footprintWidthCm: round(footprintWidthCm, 1),
    footprintAreaSqM: round((footprintLengthCm * footprintWidthCm) / 10000, 2),
    fits,
    fitsLength,
    fitsWidth,
    spareLengthCm: round(roomL - footprintLengthCm, 1),
    spareWidthCm: round(roomW - footprintWidthCm, 1),
    maxTableLengthCm,
    maxTableWidthCm,
    roomMaxSeats,
    roomTooNarrow,
    notes,
    tableHeightCm: TABLE_HEIGHT_CM,
    chairSeatHeightCm: CHAIR_SEAT_HEIGHT_CM,
    kneeClearanceCm: KNEE_CLEARANCE_CM,
  };
}
