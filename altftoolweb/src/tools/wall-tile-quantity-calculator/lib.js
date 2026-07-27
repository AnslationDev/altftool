/**
 * Wall tile quantity calculator.
 *
 * Wall tiling is measured as (wall run x tiling height) minus every opening
 * that is not tiled, because door and window openings are deducted from a
 * tiler's measurement sheet at full size. The net area then drives tile count,
 * boxes and cost, plus a courses-per-wall figure so you can see whether the
 * last course lands as an awkward sliver.
 */

/** 1 m = 1/0.3048 ft exactly, so 1 m^2 = 10.7639... ft^2. */
export const SQFT_PER_SQM = 1 / (0.3048 * 0.3048);
export const MM_PER_FT = 304.8;

export const MAX_WALL_AREA_SQFT = 100_000;
export const MAX_WASTAGE_PERCENT = 40;

/**
 * Wall tile adhesive is applied at a thinner bed than floor tile because the
 * tiles are lighter; 1.5 kg per square metre per millimetre of bed is the
 * typical datasheet figure for cementitious adhesive.
 */
export const ADHESIVE_KG_PER_SQM_PER_MM = 1.5;
export const DEFAULT_WALL_ADHESIVE_BED_MM = 3;
export const ADHESIVE_BAG_KG = 20;

/** Grout density used on grout packs, g/cm^3. */
export const GROUT_DENSITY_G_PER_CM3 = 1.6;

/** Wall tile sizes commonly stocked in India, in millimetres. */
export const COMMON_WALL_TILE_SIZES = [
  { label: "200 x 300 mm", widthMm: 200, heightMm: 300, tilesPerBox: 20 },
  { label: "250 x 375 mm", widthMm: 250, heightMm: 375, tilesPerBox: 12 },
  { label: "300 x 450 mm", widthMm: 300, heightMm: 450, tilesPerBox: 10 },
  { label: "300 x 600 mm", widthMm: 300, heightMm: 600, tilesPerBox: 8 },
  { label: "600 x 600 mm", widthMm: 600, heightMm: 600, tilesPerBox: 4 },
];

/** A standard Indian flush door leaf, in feet. */
export const DEFAULT_DOOR = { widthFt: 3, heightFt: 7 };
/** A common two-track window, in feet. */
export const DEFAULT_WINDOW = { widthFt: 4, heightFt: 3 };

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;
const round3 = (value) => Math.round(value * 1000) / 1000;

/**
 * Total run of the four walls enclosing a rectangular room.
 * @returns {number} Perimeter in feet, or NaN if the inputs are unusable.
 */
export function roomPerimeterFt(lengthFt, widthFt) {
  if (!isNum(lengthFt) || !isNum(widthFt)) return NaN;
  if (lengthFt <= 0 || widthFt <= 0) return NaN;
  return 2 * (lengthFt + widthFt);
}

/**
 * @param {object} input
 * @param {number} input.wallRunFt       Total horizontal run of wall being tiled, feet.
 * @param {number} input.tilingHeightFt  Height tiled up the wall, feet.
 * @param {number} [input.doorCount]     Number of door openings to deduct.
 * @param {number} [input.doorWidthFt]
 * @param {number} [input.doorHeightFt]
 * @param {number} [input.windowCount]   Number of window openings to deduct.
 * @param {number} [input.windowWidthFt]
 * @param {number} [input.windowHeightFt]
 * @param {number} input.tileWidthMm
 * @param {number} input.tileHeightMm
 * @param {number} input.tilesPerBox
 * @param {number} [input.wastagePercent]
 * @param {number} [input.pricePerBox]
 * @param {number} [input.tileThicknessMm]
 * @param {number} [input.jointWidthMm]
 * @param {number} [input.adhesiveBedMm]
 * @returns {object} Take-off, or { error } for invalid input.
 */
export function calculateWallTiles({
  wallRunFt,
  tilingHeightFt,
  doorCount = 0,
  doorWidthFt = DEFAULT_DOOR.widthFt,
  doorHeightFt = DEFAULT_DOOR.heightFt,
  windowCount = 0,
  windowWidthFt = DEFAULT_WINDOW.widthFt,
  windowHeightFt = DEFAULT_WINDOW.heightFt,
  tileWidthMm,
  tileHeightMm,
  tilesPerBox,
  wastagePercent = 10,
  pricePerBox = 0,
  tileThicknessMm = 8,
  jointWidthMm = 2,
  adhesiveBedMm = DEFAULT_WALL_ADHESIVE_BED_MM,
} = {}) {
  const numeric = {
    wallRunFt,
    tilingHeightFt,
    doorCount,
    doorWidthFt,
    doorHeightFt,
    windowCount,
    windowWidthFt,
    windowHeightFt,
    tileWidthMm,
    tileHeightMm,
    tilesPerBox,
    wastagePercent,
    pricePerBox,
    tileThicknessMm,
    jointWidthMm,
    adhesiveBedMm,
  };
  if (Object.values(numeric).some((value) => !isNum(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (wallRunFt <= 0 || tilingHeightFt <= 0) {
    return { error: "Wall run and tiling height must be greater than zero." };
  }
  if (doorCount < 0 || windowCount < 0) return { error: "Opening counts cannot be negative." };
  if (doorWidthFt < 0 || doorHeightFt < 0 || windowWidthFt < 0 || windowHeightFt < 0) {
    return { error: "Opening sizes cannot be negative." };
  }
  if (tileWidthMm <= 0 || tileHeightMm <= 0) {
    return { error: "Tile width and height must be greater than zero." };
  }
  if (tilesPerBox < 1) return { error: "A box must contain at least one tile." };
  if (wastagePercent < 0) return { error: "Wastage cannot be negative." };
  if (wastagePercent > MAX_WASTAGE_PERCENT) {
    return { error: `Wastage above ${MAX_WASTAGE_PERCENT}% suggests a measurement error.` };
  }
  if (pricePerBox < 0) return { error: "Price per box cannot be negative." };
  if (tileThicknessMm <= 0) return { error: "Tile thickness must be greater than zero." };
  if (jointWidthMm < 0) return { error: "Joint width cannot be negative." };
  if (adhesiveBedMm <= 0) return { error: "Adhesive bed must be greater than zero." };

  const grossAreaSqft = wallRunFt * tilingHeightFt;
  if (grossAreaSqft > MAX_WALL_AREA_SQFT) {
    return { error: `Wall area above ${MAX_WALL_AREA_SQFT.toLocaleString("en-IN")} sqft is out of range for this tool.` };
  }

  const doorAreaSqft = Math.floor(doorCount) * doorWidthFt * doorHeightFt;
  const windowAreaSqft = Math.floor(windowCount) * windowWidthFt * windowHeightFt;
  const openingAreaSqft = doorAreaSqft + windowAreaSqft;

  if (openingAreaSqft >= grossAreaSqft) {
    return { error: "Openings are as large as the wall — check the opening sizes and counts." };
  }

  const netAreaSqft = grossAreaSqft - openingAreaSqft;

  const tileAreaSqm = (tileWidthMm / 1000) * (tileHeightMm / 1000);
  const tileAreaSqft = tileAreaSqm * SQFT_PER_SQM;
  const boxCoverageSqft = tileAreaSqft * tilesPerBox;

  const tilesExact = netAreaSqft / tileAreaSqft;
  const tilesRequired = Math.ceil(tilesExact * (1 + wastagePercent / 100));
  const boxes = Math.ceil(tilesRequired / tilesPerBox);
  const tilesSupplied = boxes * tilesPerBox;
  const spareTiles = tilesSupplied - tilesRequired;

  const totalCost = boxes * pricePerBox;
  const costPerSqft = totalCost / netAreaSqft;

  /**
   * Courses: how many tile rows stack up the tiled height, counting the joint.
   * A fractional remainder is the sliver course you will have to cut.
   */
  const courseHeightMm = tileHeightMm + jointWidthMm;
  const coursesExact = (tilingHeightFt * MM_PER_FT) / courseHeightMm;
  const fullCourses = Math.floor(coursesExact);
  const partCourseMm = round2((coursesExact - fullCourses) * courseHeightMm);

  const netAreaSqm = netAreaSqft / SQFT_PER_SQM;
  const adhesiveKg = netAreaSqm * ADHESIVE_KG_PER_SQM_PER_MM * adhesiveBedMm;
  const adhesiveBags = Math.ceil(adhesiveKg / ADHESIVE_BAG_KG);

  const groutKgPerSqm =
    ((tileWidthMm + tileHeightMm) / (tileWidthMm * tileHeightMm)) *
    tileThicknessMm *
    jointWidthMm *
    GROUT_DENSITY_G_PER_CM3;
  const groutKg = groutKgPerSqm * netAreaSqm;

  return {
    grossAreaSqft: round2(grossAreaSqft),
    doorAreaSqft: round2(doorAreaSqft),
    windowAreaSqft: round2(windowAreaSqft),
    openingAreaSqft: round2(openingAreaSqft),
    netAreaSqft: round2(netAreaSqft),
    netAreaSqm: round2(netAreaSqm),
    tileAreaSqft: round2(tileAreaSqft),
    boxCoverageSqft: round2(boxCoverageSqft),
    tilesExact: round2(tilesExact),
    tilesRequired,
    boxes,
    tilesSupplied,
    spareTiles,
    totalCost: Math.round(totalCost),
    costPerSqft: round2(costPerSqft),
    fullCourses,
    partCourseMm,
    adhesiveKg: round2(adhesiveKg),
    adhesiveBags,
    groutKgPerSqm: round3(groutKgPerSqm),
    groutKg: round2(groutKg),
  };
}
