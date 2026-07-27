/**
 * Laminate flooring take-off.
 *
 * A laminate job is three separate orders, and forgetting any one of them
 * stalls the fitter:
 *   1. planks, sold by the pack, sized from area + wastage
 *   2. underlay, sold by the roll, sized from bare floor area
 *   3. beading or skirting, sold in fixed lengths, sized from the wall
 *      perimeter minus door openings
 *
 * Laminate is a floating floor, so it is never fixed down and always needs an
 * expansion gap at the perimeter, hidden by the beading.
 */

/** 1 m = 1/0.3048 ft exactly, so 1 m^2 = 10.7639... ft^2. */
export const SQFT_PER_SQM = 1 / (0.3048 * 0.3048);
export const FT_PER_M = 1 / 0.3048;

export const MAX_ROOM_AREA_SQFT = 100_000;
export const MAX_WASTAGE_PERCENT = 40;

/**
 * Manufacturers specify an expansion gap around the whole perimeter of a
 * floating laminate floor so it can move with humidity; 10 mm is the usual
 * minimum, rising to 12 to 15 mm on runs over about 8 metres.
 */
export const EXPANSION_GAP_MM = 10;
export const LONG_RUN_EXPANSION_GAP_MM = 12;
export const LONG_RUN_THRESHOLD_M = 8;

/** Wastage guidance by laying pattern, as a percentage of bare floor area. */
export const WASTAGE_GUIDE = [
  { label: "Straight lay, simple rectangular room", percent: 8 },
  { label: "Straight lay, irregular room or many doorways", percent: 12 },
  { label: "Diagonal lay", percent: 15 },
  { label: "Herringbone or chevron", percent: 20 },
];

/** Plank sizes common in Indian retail, in millimetres. */
export const COMMON_PLANK_SIZES = [
  { label: "1215 x 195 mm", lengthMm: 1215, widthMm: 195, planksPerPack: 8 },
  { label: "1285 x 192 mm", lengthMm: 1285, widthMm: 192, planksPerPack: 8 },
  { label: "1380 x 193 mm", lengthMm: 1380, widthMm: 193, planksPerPack: 7 },
  { label: "1220 x 168 mm", lengthMm: 1220, widthMm: 168, planksPerPack: 10 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {object} input
 * @param {number} input.roomLengthFt
 * @param {number} input.roomWidthFt
 * @param {number} input.plankLengthMm
 * @param {number} input.plankWidthMm
 * @param {number} input.planksPerPack
 * @param {number} [input.wastagePercent]
 * @param {number} [input.pricePerPack]      INR per pack of planks.
 * @param {number} [input.underlayRollSqm]   Coverage of one underlay roll, sqm.
 * @param {number} [input.underlayRollPrice] INR per underlay roll.
 * @param {number} [input.doorOpeningsFt]    Total width of doorways, feet (no beading there).
 * @param {number} [input.beadingPieceFt]    Length of one beading piece, feet.
 * @param {number} [input.beadingPiecePrice] INR per beading piece.
 * @returns {object} Take-off, or { error } for invalid input.
 */
export function calculateLaminateFlooring({
  roomLengthFt,
  roomWidthFt,
  plankLengthMm,
  plankWidthMm,
  planksPerPack,
  wastagePercent = 10,
  pricePerPack = 0,
  underlayRollSqm = 15,
  underlayRollPrice = 0,
  doorOpeningsFt = 3,
  beadingPieceFt = 8,
  beadingPiecePrice = 0,
} = {}) {
  const values = {
    roomLengthFt,
    roomWidthFt,
    plankLengthMm,
    plankWidthMm,
    planksPerPack,
    wastagePercent,
    pricePerPack,
    underlayRollSqm,
    underlayRollPrice,
    doorOpeningsFt,
    beadingPieceFt,
    beadingPiecePrice,
  };
  if (Object.values(values).some((value) => !isNum(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (roomLengthFt <= 0 || roomWidthFt <= 0) {
    return { error: "Room length and width must be greater than zero." };
  }
  if (plankLengthMm <= 0 || plankWidthMm <= 0) {
    return { error: "Plank length and width must be greater than zero." };
  }
  if (planksPerPack < 1) return { error: "A pack must contain at least one plank." };
  if (wastagePercent < 0) return { error: "Wastage cannot be negative." };
  if (wastagePercent > MAX_WASTAGE_PERCENT) {
    return { error: `Wastage above ${MAX_WASTAGE_PERCENT}% suggests a measurement error.` };
  }
  if (pricePerPack < 0 || underlayRollPrice < 0 || beadingPiecePrice < 0) {
    return { error: "Prices cannot be negative." };
  }
  if (underlayRollSqm <= 0) return { error: "Underlay roll coverage must be greater than zero." };
  if (doorOpeningsFt < 0) return { error: "Door opening width cannot be negative." };
  if (beadingPieceFt <= 0) return { error: "Beading piece length must be greater than zero." };

  const areaSqft = roomLengthFt * roomWidthFt;
  if (areaSqft > MAX_ROOM_AREA_SQFT) {
    return { error: `Room area above ${MAX_ROOM_AREA_SQFT.toLocaleString("en-IN")} sqft is out of range for this tool.` };
  }

  const perimeterFt = 2 * (roomLengthFt + roomWidthFt);
  if (doorOpeningsFt >= perimeterFt) {
    return { error: "Doorway width cannot be as large as the room perimeter." };
  }

  const plankAreaSqm = (plankLengthMm / 1000) * (plankWidthMm / 1000);
  const plankAreaSqft = plankAreaSqm * SQFT_PER_SQM;
  const packCoverageSqft = plankAreaSqft * planksPerPack;
  const packCoverageSqm = plankAreaSqm * planksPerPack;

  const planksExact = areaSqft / plankAreaSqft;
  const planksRequired = Math.ceil(planksExact * (1 + wastagePercent / 100));
  const packs = Math.ceil(planksRequired / planksPerPack);
  const planksSupplied = packs * planksPerPack;
  const sparePlanks = planksSupplied - planksRequired;
  const areaCoveredSqft = planksSupplied * plankAreaSqft;

  const areaSqm = areaSqft / SQFT_PER_SQM;
  const underlayRolls = Math.ceil(areaSqm / underlayRollSqm);

  const beadingRunFt = perimeterFt - doorOpeningsFt;
  const beadingPieces = Math.ceil(beadingRunFt / beadingPieceFt);
  const beadingSuppliedFt = beadingPieces * beadingPieceFt;

  const plankCost = packs * pricePerPack;
  const underlayCost = underlayRolls * underlayRollPrice;
  const beadingCost = beadingPieces * beadingPiecePrice;
  const totalCost = plankCost + underlayCost + beadingCost;

  const longestRunM = Math.max(roomLengthFt, roomWidthFt) / FT_PER_M;
  const expansionGapMm =
    longestRunM > LONG_RUN_THRESHOLD_M ? LONG_RUN_EXPANSION_GAP_MM : EXPANSION_GAP_MM;

  /** Rows of planks running across the room, to spot a sliver last row. */
  const rowsExact = (Math.min(roomLengthFt, roomWidthFt) / FT_PER_M) * 1000 / plankWidthMm;
  const fullRows = Math.floor(rowsExact);
  const lastRowWidthMm = round2((rowsExact - fullRows) * plankWidthMm);

  return {
    areaSqft: round2(areaSqft),
    areaSqm: round2(areaSqm),
    perimeterFt: round2(perimeterFt),
    plankAreaSqft: round2(plankAreaSqft),
    packCoverageSqft: round2(packCoverageSqft),
    packCoverageSqm: round2(packCoverageSqm),
    planksExact: round2(planksExact),
    planksRequired,
    packs,
    planksSupplied,
    sparePlanks,
    areaCoveredSqft: round2(areaCoveredSqft),
    underlayRolls,
    underlaySqm: round2(areaSqm),
    beadingRunFt: round2(beadingRunFt),
    beadingPieces,
    beadingSuppliedFt: round2(beadingSuppliedFt),
    plankCost: Math.round(plankCost),
    underlayCost: Math.round(underlayCost),
    beadingCost: Math.round(beadingCost),
    totalCost: Math.round(totalCost),
    costPerSqft: round2(totalCost / areaSqft),
    expansionGapMm,
    fullRows,
    lastRowWidthMm,
  };
}
