/**
 * Floor tile quantity calculator.
 *
 * Tiles are sold by the box, so the useful answer is always "how many boxes",
 * not "how many tiles". The chain is:
 *   floor area -> tiles by area -> + wastage -> round up -> boxes -> cost.
 *
 * Adhesive and grout are estimated from published manufacturer formulas so the
 * material list is complete enough to hand to a supplier.
 */

/** 1 m = 1/0.3048 ft exactly (international foot), so 1 m^2 = 10.7639... ft^2. */
export const SQFT_PER_SQM = 1 / (0.3048 * 0.3048);

/** Guard rails so an absurd input cannot produce a meaningless number. */
export const MAX_FLOOR_AREA_SQFT = 500_000;
export const MAX_WASTAGE_PERCENT = 40;

/**
 * Cementitious tile adhesive spreads at roughly 1.5 kg per square metre per
 * millimetre of bed thickness (typical value on Indian adhesive datasheets).
 */
export const ADHESIVE_KG_PER_SQM_PER_MM = 1.5;
export const DEFAULT_ADHESIVE_BED_MM = 3;
export const ADHESIVE_BAG_KG = 20;

/**
 * Grout density used by tile grout datasheets, in g/cm^3. It converts the
 * joint volume per square metre into kilograms.
 */
export const GROUT_DENSITY_G_PER_CM3 = 1.6;

/** Tile sizes stocked by most Indian dealers, in millimetres. */
export const COMMON_TILE_SIZES = [
  { label: "300 x 300 mm (1 x 1 ft)", widthMm: 300, heightMm: 300, tilesPerBox: 11 },
  { label: "600 x 600 mm (2 x 2 ft)", widthMm: 600, heightMm: 600, tilesPerBox: 4 },
  { label: "600 x 1200 mm (2 x 4 ft)", widthMm: 600, heightMm: 1200, tilesPerBox: 2 },
  { label: "800 x 800 mm", widthMm: 800, heightMm: 800, tilesPerBox: 3 },
  { label: "800 x 1600 mm", widthMm: 800, heightMm: 1600, tilesPerBox: 2 },
  { label: "1200 x 1200 mm (4 x 4 ft)", widthMm: 1200, heightMm: 1200, tilesPerBox: 2 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;
const round3 = (value) => Math.round(value * 1000) / 1000;

/**
 * @param {object} input
 * @param {number} input.lengthFt       Room length in feet.
 * @param {number} input.widthFt        Room width in feet.
 * @param {number} [input.extraAreaSqft] Extra area (alcoves, another room) in sqft.
 * @param {number} input.tileWidthMm    Tile width in millimetres.
 * @param {number} input.tileHeightMm   Tile height in millimetres.
 * @param {number} input.tilesPerBox    Tiles packed in one box.
 * @param {number} [input.wastagePercent] Cutting and breakage allowance.
 * @param {number} [input.pricePerBox]  Dealer price of one box, INR.
 * @param {number} [input.tileThicknessMm] Tile body thickness, for grout volume.
 * @param {number} [input.jointWidthMm] Grout joint width in millimetres.
 * @param {number} [input.adhesiveBedMm] Adhesive bed thickness in millimetres.
 * @returns {object} Material take-off, or { error } for invalid input.
 */
export function calculateFloorTiles({
  lengthFt,
  widthFt,
  extraAreaSqft = 0,
  tileWidthMm,
  tileHeightMm,
  tilesPerBox,
  wastagePercent = 10,
  pricePerBox = 0,
  tileThicknessMm = 9,
  jointWidthMm = 2,
  adhesiveBedMm = DEFAULT_ADHESIVE_BED_MM,
} = {}) {
  if (!isNum(lengthFt) || !isNum(widthFt)) return { error: "Enter room length and width as numbers." };
  if (lengthFt <= 0 || widthFt <= 0) return { error: "Room length and width must be greater than zero." };
  if (!isNum(extraAreaSqft)) return { error: "Enter the additional area as a number." };
  if (extraAreaSqft < 0) return { error: "Extra area cannot be negative." };
  if (!isNum(tileWidthMm) || !isNum(tileHeightMm) || tileWidthMm <= 0 || tileHeightMm <= 0) {
    return { error: "Tile width and height must be greater than zero." };
  }
  if (!isNum(tilesPerBox) || !Number.isInteger(tilesPerBox) || tilesPerBox < 1) {
    return { error: "Tiles per box must be a whole number of at least 1." };
  }
  if (!isNum(wastagePercent)) return { error: "Enter the wastage allowance as a number." };
  if (wastagePercent < 0) return { error: "Wastage cannot be negative." };
  if (wastagePercent > MAX_WASTAGE_PERCENT) {
    return { error: `Wastage above ${MAX_WASTAGE_PERCENT}% suggests a measurement error.` };
  }
  if (!isNum(pricePerBox)) return { error: "Enter the price per box as a number." };
  if (pricePerBox < 0) return { error: "Price per box cannot be negative." };
  if (!isNum(tileThicknessMm) || tileThicknessMm <= 0) return { error: "Tile thickness must be greater than zero." };
  if (!isNum(jointWidthMm)) return { error: "Enter the joint width as a number." };
  if (jointWidthMm < 0) return { error: "Joint width cannot be negative." };
  if (!isNum(adhesiveBedMm) || adhesiveBedMm <= 0) return { error: "Adhesive bed must be greater than zero." };

  const floorAreaSqft = lengthFt * widthFt + extraAreaSqft;
  if (floorAreaSqft > MAX_FLOOR_AREA_SQFT) {
    return { error: `Floor area above ${MAX_FLOOR_AREA_SQFT.toLocaleString("en-IN")} sqft is out of range for this tool.` };
  }

  const tileAreaSqm = (tileWidthMm / 1000) * (tileHeightMm / 1000);
  const tileAreaSqft = tileAreaSqm * SQFT_PER_SQM;
  const boxCoverageSqft = tileAreaSqft * tilesPerBox;

  const tilesExact = floorAreaSqft / tileAreaSqft;
  const tilesWithWastage = tilesExact * (1 + wastagePercent / 100);
  const tilesRequired = Math.ceil(tilesWithWastage);
  const boxes = Math.ceil(tilesRequired / tilesPerBox);
  const tilesSupplied = boxes * tilesPerBox;
  const areaCoveredSqft = tilesSupplied * tileAreaSqft;
  const spareTiles = tilesSupplied - tilesRequired;

  const totalCost = boxes * pricePerBox;
  const costPerSqft = totalCost / floorAreaSqft;

  const areaSqm = floorAreaSqft / SQFT_PER_SQM;
  const adhesiveKg = areaSqm * ADHESIVE_KG_PER_SQM_PER_MM * adhesiveBedMm;
  const adhesiveBags = Math.ceil(adhesiveKg / ADHESIVE_BAG_KG);

  /**
   * Grout kg per m^2 = ((A + B) / (A x B)) x thickness x joint x density,
   * with A, B, thickness and joint all in millimetres. This is the standard
   * joint-volume formula printed on tile grout packs.
   */
  const groutKgPerSqm =
    ((tileWidthMm + tileHeightMm) / (tileWidthMm * tileHeightMm)) *
    tileThicknessMm *
    jointWidthMm *
    GROUT_DENSITY_G_PER_CM3;
  const groutKg = groutKgPerSqm * areaSqm;

  return {
    floorAreaSqft: round2(floorAreaSqft),
    areaSqm: round2(areaSqm),
    tileAreaSqft: round2(tileAreaSqft),
    boxCoverageSqft: round2(boxCoverageSqft),
    tilesExact: round2(tilesExact),
    tilesRequired,
    boxes,
    tilesSupplied,
    spareTiles,
    areaCoveredSqft: round2(areaCoveredSqft),
    wastageTiles: tilesRequired - Math.ceil(tilesExact),
    totalCost: Math.round(totalCost),
    costPerSqft: round2(costPerSqft),
    adhesiveKg: round2(adhesiveKg),
    adhesiveBags,
    groutKgPerSqm: round3(groutKgPerSqm),
    groutKg: round2(groutKg),
  };
}
