/**
 * Carpet roll quantity maths for wall-to-wall (broadloom) installation.
 *
 * Broadloom carpet is manufactured in continuous rolls of a fixed width and sold
 * by the running metre off that roll. A room wider than the roll must be covered
 * by several parallel "drops" (strips) joined at seams, so the quantity depends on
 * which way the drops run. This module evaluates both orientations and reports the
 * cheaper one.
 */

/** Roll widths carried by most broadloom mills. 3.66 m is the imperial 12 ft roll. */
export const ROLL_WIDTHS = [
  { value: 2, label: "2 m" },
  { value: 3.66, label: "3.66 m (12 ft) — most common" },
  { value: 4, label: "4 m" },
  { value: 5, label: "5 m" },
];

/**
 * Trim allowance added to the length of every drop. Fitters cut each drop long and
 * trim it into the gripper rod at both walls; 50 mm at each end is the usual habit.
 */
export const DEFAULT_TRIM_PER_DROP_M = 0.1;

/** Underlay is cut with a small overlap and trimmed, so buy a little over room area. */
export const UNDERLAY_ALLOWANCE = 0.05; // 5% over the finished floor area

/** Carpet is cut off the roll in 0.1 m steps at the warehouse. */
const PURCHASE_STEP_M = 0.1;

/** Sanity limits so a typo cannot produce a silly order. */
const MAX_ROOM_SIDE_M = 60;
const MAX_PATTERN_REPEAT_M = 5;

const roundUpTo = (value, step) => Math.ceil((value - 1e-9) / step) * step;

/**
 * Work out one orientation.
 * @param {number} spanAcross  room dimension the roll width has to cover
 * @param {number} dropRun     room dimension each drop runs along
 */
function evaluateOrientation(spanAcross, dropRun, rollWidth, trim, patternRepeat) {
  const drops = Math.ceil((spanAcross - 1e-9) / rollWidth);
  let dropLength = dropRun + trim;
  // A patterned carpet has to be cut in whole repeats so the motif lines up at seams.
  if (patternRepeat > 0) dropLength = roundUpTo(dropLength, patternRepeat);
  const runningMetres = roundUpTo(drops * dropLength, PURCHASE_STEP_M);
  return { drops, dropLength, runningMetres, seams: Math.max(0, drops - 1) };
}

/**
 * @returns {{error:string}|object} carpet order for one rectangular room
 */
export function computeCarpet({
  roomLengthM,
  roomWidthM,
  rollWidthM,
  patternRepeatM = 0,
  trimPerDropM = DEFAULT_TRIM_PER_DROP_M,
  pricePerSqm = 0,
  underlayPricePerSqm = 0,
  doorwayWidthsM = 0,
}) {
  const values = [
    roomLengthM,
    roomWidthM,
    rollWidthM,
    patternRepeatM,
    trimPerDropM,
    pricePerSqm,
    underlayPricePerSqm,
    doorwayWidthsM,
  ];
  if (values.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    return { error: "Enter a valid number in every field." };
  }
  if (roomLengthM <= 0 || roomWidthM <= 0) {
    return { error: "Room length and width must both be greater than zero." };
  }
  if (roomLengthM > MAX_ROOM_SIDE_M || roomWidthM > MAX_ROOM_SIDE_M) {
    return { error: `Each room side must be ${MAX_ROOM_SIDE_M} m or less.` };
  }
  if (rollWidthM <= 0) return { error: "Roll width must be greater than zero." };
  if (patternRepeatM < 0 || patternRepeatM > MAX_PATTERN_REPEAT_M) {
    return { error: `Pattern repeat must be between 0 and ${MAX_PATTERN_REPEAT_M} m.` };
  }
  if (trimPerDropM < 0 || trimPerDropM > 1) {
    return { error: "Trim allowance per drop must be between 0 and 1 m." };
  }
  if (pricePerSqm < 0 || underlayPricePerSqm < 0) {
    return { error: "Prices cannot be negative." };
  }
  if (doorwayWidthsM < 0) return { error: "Doorway width cannot be negative." };

  const perimeter = 2 * (roomLengthM + roomWidthM);
  if (doorwayWidthsM >= perimeter) {
    return { error: "Total doorway width cannot be as large as the room perimeter." };
  }

  // Option A: drops run along the room length, roll width covers the room width.
  const alongLength = evaluateOrientation(
    roomWidthM,
    roomLengthM,
    rollWidthM,
    trimPerDropM,
    patternRepeatM,
  );
  // Option B: drops run along the room width, roll width covers the room length.
  const alongWidth = evaluateOrientation(
    roomLengthM,
    roomWidthM,
    rollWidthM,
    trimPerDropM,
    patternRepeatM,
  );

  const aBetter =
    alongLength.runningMetres < alongWidth.runningMetres ||
    (alongLength.runningMetres === alongWidth.runningMetres &&
      alongLength.seams <= alongWidth.seams);
  const chosen = aBetter ? alongLength : alongWidth;
  const other = aBetter ? alongWidth : alongLength;

  const roomArea = roomLengthM * roomWidthM;
  const purchasedArea = chosen.runningMetres * rollWidthM;
  const offcutArea = Math.max(0, purchasedArea - roomArea);
  const wastagePercent = roomArea > 0 ? (offcutArea / roomArea) * 100 : 0;

  const underlayArea = roomArea * (1 + UNDERLAY_ALLOWANCE);
  const gripperRodLengthM = Math.max(0, perimeter - doorwayWidthsM);

  const carpetCost = purchasedArea * pricePerSqm;
  const underlayCost = underlayArea * underlayPricePerSqm;

  return {
    orientation: aBetter ? "along-length" : "along-width",
    orientationLabel: aBetter
      ? "Drops running along the room length"
      : "Drops running along the room width",
    drops: chosen.drops,
    dropLengthM: chosen.dropLength,
    seams: chosen.seams,
    runningMetres: chosen.runningMetres,
    alternativeRunningMetres: other.runningMetres,
    metresSavedByOrientation: Math.max(0, other.runningMetres - chosen.runningMetres),
    roomArea,
    purchasedArea,
    offcutArea,
    wastagePercent,
    underlayArea,
    gripperRodLengthM,
    perimeter,
    carpetCost,
    underlayCost,
    totalCost: carpetCost + underlayCost,
  };
}
