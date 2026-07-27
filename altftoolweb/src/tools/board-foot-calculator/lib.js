/**
 * Board foot arithmetic for timber.
 *
 * A board foot is the volume of a piece 1 inch thick, 12 inches wide and 12 inches
 * long, that is 144 cubic inches. So for any board
 *      board feet = thickness(in) x width(in) x length(in) / 144
 * Twelve board feet make one cubic foot (1728 / 144 = 12), which is the unit Indian
 * timber yards quote as CFT.
 */

/** 1 board foot = 144 cubic inches, by definition. */
export const CUBIC_INCHES_PER_BOARD_FOOT = 144;

/** 12 x 12 x 12 inches. */
export const CUBIC_INCHES_PER_CUBIC_FOOT = 1728;

/** 1728 / 144 — board feet in one cubic foot. */
export const BOARD_FEET_PER_CUBIC_FOOT = CUBIC_INCHES_PER_CUBIC_FOOT / CUBIC_INCHES_PER_BOARD_FOOT;

/** International inch, fixed at exactly 25.4 mm since 1959. */
export const MM_PER_INCH = 25.4;

/** 0.3048^3 — exact, from the international foot. */
export const CUBIC_METRES_PER_CUBIC_FOOT = 0.028316846592;

/**
 * Hardwood is traded in quarters of an inch of rough thickness: 4/4 is one inch,
 * 8/4 is two inches, and so on. These are rough-sawn sizes, before surfacing.
 */
export const QUARTER_THICKNESS_INCHES = {
  "4/4": 1,
  "5/4": 1.25,
  "6/4": 1.5,
  "8/4": 2,
  "10/4": 2.5,
  "12/4": 3,
  "16/4": 4,
};

/**
 * Hardwood yards bill any board thinner than one inch as one inch, because the
 * log still had to be cut. Optional, because softwood and sheet stock are not
 * usually charged that way.
 */
export const MIN_BILLED_THICKNESS_INCHES = 1;

export const LENGTH_UNITS = {
  in: { label: "inches", toInches: 1 },
  ft: { label: "feet", toInches: 12 },
  mm: { label: "millimetres", toInches: 1 / MM_PER_INCH },
  cm: { label: "centimetres", toInches: 10 / MM_PER_INCH },
  m: { label: "metres", toInches: 1000 / MM_PER_INCH },
};

export const PRICE_BASES = {
  boardFoot: "per board foot",
  cubicFoot: "per cubic foot (CFT)",
  cubicMetre: "per cubic metre",
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Convert a measurement in any supported unit to inches. */
export function toInches(value, unit) {
  const entry = LENGTH_UNITS[unit];
  if (!entry || !isNum(value)) return NaN;
  return value * entry.toInches;
}

/** Board feet in a single board, from dimensions already in inches. */
export function boardFeet({ thicknessIn, widthIn, lengthIn }) {
  if (![thicknessIn, widthIn, lengthIn].every(isNum)) return 0;
  if (thicknessIn <= 0 || widthIn <= 0 || lengthIn <= 0) return 0;
  return (thicknessIn * widthIn * lengthIn) / CUBIC_INCHES_PER_BOARD_FOOT;
}

/**
 * Full board-foot and volume calculation for a batch of identical boards.
 * Returns { error } when the input cannot produce a meaningful figure.
 */
export function computeBoardFeet({
  thickness,
  thicknessUnit = "in",
  width,
  widthUnit = "in",
  length,
  lengthUnit = "ft",
  pieces = 1,
  wastePercent = 0,
  price = 0,
  priceBasis = "boardFoot",
  billThinStockAtOneInch = false,
}) {
  if (![thickness, width, length, pieces, wastePercent, price].every(isNum)) {
    return { error: "Enter a valid number in every field." };
  }
  if (thickness <= 0 || width <= 0 || length <= 0) {
    return { error: "Thickness, width and length must all be greater than zero." };
  }
  if (!Number.isInteger(pieces) || pieces < 1 || pieces > 100000) {
    return { error: "Number of pieces must be a whole number between 1 and 100000." };
  }
  if (wastePercent < 0 || wastePercent > 100) {
    return { error: "Waste allowance should be between 0% and 100%." };
  }
  if (price < 0) return { error: "Price cannot be negative." };

  const rawThicknessIn = toInches(thickness, thicknessUnit);
  const widthIn = toInches(width, widthUnit);
  const lengthIn = toInches(length, lengthUnit);
  if (![rawThicknessIn, widthIn, lengthIn].every(isNum)) {
    return { error: "Choose a valid unit for each measurement." };
  }

  const billedThicknessIn =
    billThinStockAtOneInch && rawThicknessIn < MIN_BILLED_THICKNESS_INCHES
      ? MIN_BILLED_THICKNESS_INCHES
      : rawThicknessIn;

  const bfPerPiece = boardFeet({
    thicknessIn: billedThicknessIn,
    widthIn,
    lengthIn,
  });
  const actualBfPerPiece = boardFeet({ thicknessIn: rawThicknessIn, widthIn, lengthIn });

  const boardFeetTotal = bfPerPiece * pieces;
  const boardFeetWithWaste = boardFeetTotal * (1 + wastePercent / 100);
  const cubicFeet = boardFeetWithWaste / BOARD_FEET_PER_CUBIC_FOOT;
  const cubicMetres = cubicFeet * CUBIC_METRES_PER_CUBIC_FOOT;
  const cubicInches = boardFeetWithWaste * CUBIC_INCHES_PER_BOARD_FOOT;

  let totalCost = 0;
  if (priceBasis === "cubicFoot") totalCost = cubicFeet * price;
  else if (priceBasis === "cubicMetre") totalCost = cubicMetres * price;
  else totalCost = boardFeetWithWaste * price;

  const linearFeet = (lengthIn / 12) * pieces;

  return {
    thicknessIn: rawThicknessIn,
    billedThicknessIn,
    widthIn,
    lengthIn,
    bfPerPiece,
    actualBfPerPiece,
    boardFeetTotal,
    boardFeetWithWaste,
    wasteBoardFeet: boardFeetWithWaste - boardFeetTotal,
    cubicFeet,
    cubicMetres,
    cubicInches,
    linearFeet,
    totalCost,
    costPerPiece: pieces > 0 ? totalCost / pieces : 0,
    costPerBoardFoot: boardFeetWithWaste > 0 ? totalCost / boardFeetWithWaste : 0,
    costPerCubicFoot: cubicFeet > 0 ? totalCost / cubicFeet : 0,
    pieces,
  };
}
