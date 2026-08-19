/**
 * Skirting (baseboard) quantity maths.
 *
 * Skirting runs round the wall/floor junction, so the base figure is the room
 * perimeter. Doorways and other floor-level openings carry no skirting and are
 * deducted; a cutting allowance is then added because every mitre wastes a little
 * board, and the result is converted into whole factory lengths.
 */

/** Lengths skirting is sold in. 2.44 m and 3.66 m are the metric 8 ft and 12 ft boards. */
export const PIECE_LENGTHS = [
  { value: 2.4, label: "2.4 m" },
  { value: 2.44, label: "2.44 m (8 ft)" },
  { value: 3, label: "3 m" },
  { value: 3.66, label: "3.66 m (12 ft)" },
];

/** Common skirting heights in mm. */
export const SKIRTING_HEIGHTS = [75, 100, 150, 200, 250];

/** A mitred internal or external corner typically loses this much board per joint. */
export const DEFAULT_WASTAGE_PERCENT = 5;

/** Fixing centres. Trade practice is a screw or nail every 300–450 mm; 400 mm is the usual spec. */
export const FIXING_SPACING_M = 0.4;

/** 1 international foot = 0.3048 m exactly, for quotes given in running feet. */
export const METRES_PER_FOOT = 0.3048;

const MAX_ROOM_SIDE_M = 60;

/**
 * @returns {{error:string}|object} skirting order for one rectangular room
 */
export function computeSkirting({
  roomLengthM,
  roomWidthM,
  doorCount = 0,
  doorWidthM = 0.9,
  otherOpeningsM = 0,
  extraRunM = 0,
  wastagePercent = DEFAULT_WASTAGE_PERCENT,
  pieceLengthM = 2.44,
  skirtingHeightMm = 100,
  pricePerMetre = 0,
}) {
  const numbers = [
    roomLengthM,
    roomWidthM,
    doorCount,
    doorWidthM,
    otherOpeningsM,
    extraRunM,
    wastagePercent,
    pieceLengthM,
    skirtingHeightMm,
    pricePerMetre,
  ];
  if (numbers.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    return { error: "Enter a valid number in every field." };
  }
  if (roomLengthM <= 0 || roomWidthM <= 0) {
    return { error: "Room length and width must both be greater than zero." };
  }
  if (roomLengthM > MAX_ROOM_SIDE_M || roomWidthM > MAX_ROOM_SIDE_M) {
    return { error: `Each room side must be ${MAX_ROOM_SIDE_M} m or less.` };
  }
  if (doorCount < 0 || !Number.isInteger(doorCount)) {
    return { error: "Number of doorways must be a whole number of zero or more." };
  }
  if (doorWidthM < 0 || otherOpeningsM < 0 || extraRunM < 0) {
    return { error: "Widths and extra runs cannot be negative." };
  }
  if (wastagePercent < 0 || wastagePercent > 50) {
    return { error: "Cutting allowance should be between 0% and 50%." };
  }
  if (pieceLengthM <= 0) return { error: "Piece length must be greater than zero." };
  if (skirtingHeightMm <= 0) return { error: "Skirting height must be greater than zero." };
  if (pricePerMetre < 0) return { error: "Price cannot be negative." };

  const perimeter = 2 * (roomLengthM + roomWidthM);
  const deduction = doorCount * doorWidthM + otherOpeningsM;
  if (deduction >= perimeter) {
    return { error: "Doorways and openings add up to more than the room perimeter." };
  }

  const netRunM = perimeter - deduction + extraRunM;
  const withWastageM = netRunM * (1 + wastagePercent / 100);
  const pieces = Math.ceil((withWastageM - 1e-9) / pieceLengthM);
  const purchasedLengthM = pieces * pieceLengthM;
  const spareM = Math.max(0, purchasedLengthM - withWastageM);

  // A plain rectangular room has four internal corners; each doorway leaves two
  // exposed ends that need a returned (external mitred) end cap. The "extra run"
  // input lets the user model an alcove or an L-shape by adding running length,
  // but a single extra-metres figure doesn't tell us the actual shape (a simple
  // straight extension, a boxed-in alcove and an L-shaped room all add
  // different numbers of corners), so the corner count below still assumes a
  // plain rectangle whenever extra run is used and callers should flag that.
  const internalCorners = 4;
  const externalEnds = doorCount * 2;
  const cornerCountAssumesRectangle = extraRunM > 0;

  const surfaceAreaM2 = netRunM * (skirtingHeightMm / 1000);
  const fixings = Math.ceil(netRunM / FIXING_SPACING_M);

  return {
    perimeterM: perimeter,
    deductionM: deduction,
    netRunM,
    netRunFt: netRunM / METRES_PER_FOOT,
    withWastageM,
    pieces,
    purchasedLengthM,
    spareM,
    internalCorners,
    externalEnds,
    cornerCountAssumesRectangle,
    surfaceAreaM2,
    fixings,
    materialCost: purchasedLengthM * pricePerMetre,
    costPerRunningFoot: pricePerMetre * METRES_PER_FOOT,
  };
}
