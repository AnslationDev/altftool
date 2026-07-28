/**
 * Tile calculator — how many tiles, how many boxes, and how much grout and
 * adhesive a floor or wall needs.
 *
 * Three real rules do the work:
 *
 * 1. Tile count. Tiles are laid on a module, not on their bare size: each tile
 *    occupies its own footprint plus one grout joint on two of its sides. So the
 *    covering module is (tileWidth + joint) x (tileHeight + joint), and
 *    tiles = ceil(area / moduleArea x (1 + wastage)).
 *
 * 2. Grout. The published thin-joint formula, used by grout manufacturers, is
 *      kg per m2 = ((A + B) / (A x B)) x C x D x 1.6
 *    with tile sides A and B, joint width C and tile thickness D all in mm, and
 *    1.6 g/cm3 as the density of cementitious grout. It follows from there being
 *    1,000,000/(A x B) tiles in a square metre and (A + B) mm of joint per tile.
 *
 * 3. Adhesive. Thin-bed cement adhesive is consumed at roughly 1.5 kg per square
 *    metre for every millimetre of bed depth, and the notched trowel size sets
 *    that depth — a 6 mm notch leaves about a 3 mm bed, a 10 mm notch about 5 mm.
 */

/** Grout density used by the manufacturers' formula, in g/cm3. */
export const GROUT_DENSITY = 1.6;
/** Thin-bed adhesive consumption, kg per m2 per mm of bed depth. */
export const ADHESIVE_KG_PER_MM = 1.5;

/** Notched trowel sizes and the bed depth each one actually leaves. */
export const TROWELS = [
  { value: "3", label: "3 mm notch — mosaic and small tiles", bedMm: 1.5 },
  { value: "6", label: "6 mm notch — up to 300 mm tiles", bedMm: 3 },
  { value: "8", label: "8 mm notch — 300 to 450 mm tiles", bedMm: 4 },
  { value: "10", label: "10 mm notch — 450 to 600 mm tiles", bedMm: 5 },
  { value: "12", label: "12 mm notch — large format over 600 mm", bedMm: 6 },
  { value: "20", label: "20 mm half-trowel — slabs, back-buttered", bedMm: 10 },
];

/** Unit conversions. */
export const M_PER_FOOT = 0.3048;
export const MM_PER_INCH = 25.4;
export const SQM_PER_SQFT = M_PER_FOOT * M_PER_FOOT; // 0.09290304

/** Guard rails. */
export const MAX_SIDE_M = 500;
export const MAX_TILE_MM = 3600;
export const MIN_TILE_MM = 10;
export const MAX_WASTAGE_PERCENT = 50;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round = (v, dp = 2) => {
  const f = 10 ** dp;
  return Math.round(v * f) / f;
};

/** Convert a room dimension to metres. */
export function toMetres(value, unit) {
  return unit === "ft" ? value * M_PER_FOOT : value;
}

/** Convert a tile dimension to millimetres. */
export function toMillimetres(value, unit) {
  return unit === "in" ? value * MM_PER_INCH : value;
}

/**
 * Full tile take-off.
 *
 * @param {object} input
 * @param {number} input.length        Room or wall length.
 * @param {number} input.width         Room height or width.
 * @param {string} input.roomUnit      "m" or "ft".
 * @param {number} input.deductArea    Area to subtract (doors, windows), in roomUnit squared.
 * @param {number} input.tileWidth     Tile width.
 * @param {number} input.tileHeight    Tile height.
 * @param {string} input.tileUnit      "mm" or "in".
 * @param {number} input.tileThickness Tile thickness in mm (for the grout formula).
 * @param {number} input.jointMm       Grout joint width in mm.
 * @param {number} input.wastagePercent Extra tile allowance, percent.
 * @param {number} input.tilesPerBox   Tiles in a sealed box.
 * @param {number} input.pricePerBox   Price of one box.
 * @param {string} input.trowel        TROWELS value.
 */
export function calculateTiles({
  length,
  width,
  roomUnit = "m",
  deductArea = 0,
  tileWidth,
  tileHeight,
  tileUnit = "mm",
  tileThickness = 9,
  jointMm = 3,
  wastagePercent = 10,
  tilesPerBox = 4,
  pricePerBox = 0,
  trowel = "10",
} = {}) {
  if (!isNum(length) || !isNum(width)) {
    return { error: "Enter the length and width of the area as numbers." };
  }
  if (length <= 0 || width <= 0) {
    return { error: "Length and width must both be greater than zero." };
  }

  const lengthM = toMetres(length, roomUnit);
  const widthM = toMetres(width, roomUnit);
  if (lengthM > MAX_SIDE_M || widthM > MAX_SIDE_M) {
    return { error: `Each side must be under ${MAX_SIDE_M} m — check the units you picked.` };
  }

  const grossAreaM2 = lengthM * widthM;
  const deduct = isNum(deductArea) && deductArea > 0 ? deductArea : 0;
  const deductM2 = roomUnit === "ft" ? deduct * SQM_PER_SQFT : deduct;
  if (deductM2 >= grossAreaM2) {
    return { error: "The area you are deducting is as large as the room — nothing left to tile." };
  }
  const netAreaM2 = grossAreaM2 - deductM2;

  if (!isNum(tileWidth) || !isNum(tileHeight)) {
    return { error: "Enter the tile width and height as numbers." };
  }
  const tileWmm = toMillimetres(tileWidth, tileUnit);
  const tileHmm = toMillimetres(tileHeight, tileUnit);
  if (tileWmm < MIN_TILE_MM || tileHmm < MIN_TILE_MM) {
    return { error: `A tile side must be at least ${MIN_TILE_MM} mm.` };
  }
  if (tileWmm > MAX_TILE_MM || tileHmm > MAX_TILE_MM) {
    return { error: `A tile side over ${MAX_TILE_MM} mm is beyond what this calculator handles.` };
  }

  const joint = isNum(jointMm) && jointMm >= 0 ? Math.min(30, jointMm) : 3;
  const thickness = isNum(tileThickness) && tileThickness > 0 ? Math.min(50, tileThickness) : 9;

  const waste = isNum(wastagePercent) && wastagePercent >= 0
    ? Math.min(MAX_WASTAGE_PERCENT, wastagePercent)
    : 0;

  const perBox = isNum(tilesPerBox) && tilesPerBox >= 1 ? Math.floor(tilesPerBox) : 1;
  const boxPrice = isNum(pricePerBox) && pricePerBox > 0 ? pricePerBox : 0;

  // --- Tile count ----------------------------------------------------------
  const tileAreaM2 = (tileWmm / 1000) * (tileHmm / 1000);
  const moduleAreaM2 = ((tileWmm + joint) / 1000) * ((tileHmm + joint) / 1000);
  const tilesExact = netAreaM2 / moduleAreaM2;
  const tilesWithWaste = tilesExact * (1 + waste / 100);
  const tilesNeeded = Math.ceil(tilesWithWaste);

  const boxes = Math.ceil(tilesNeeded / perBox);
  const tilesSupplied = boxes * perBox;
  const spareTiles = tilesSupplied - Math.ceil(tilesExact);
  // Wastage actually delivered once the order is rounded to sealed boxes.
  const deliveredWastePercent = tilesExact > 0
    ? ((tilesSupplied - tilesExact) / tilesExact) * 100
    : 0;

  const areaCoveredM2 = tilesSupplied * moduleAreaM2;

  // --- Grout ---------------------------------------------------------------
  const groutKgPerM2 =
    ((tileWmm + tileHmm) / (tileWmm * tileHmm)) * joint * thickness * GROUT_DENSITY;
  const groutKg = groutKgPerM2 * netAreaM2;

  // --- Adhesive ------------------------------------------------------------
  const trowelSpec = TROWELS.find((t) => t.value === String(trowel)) || TROWELS[3];
  const adhesiveKgPerM2 = trowelSpec.bedMm * ADHESIVE_KG_PER_MM;
  const adhesiveKg = adhesiveKgPerM2 * netAreaM2;
  // Adhesive is sold in 20 kg bags almost everywhere.
  const adhesiveBags = Math.ceil(adhesiveKg / 20);

  const tileCost = boxes * boxPrice;

  return {
    grossAreaM2: round(grossAreaM2, 3),
    deductedM2: round(deductM2, 3),
    netAreaM2: round(netAreaM2, 3),
    netAreaFt2: round(netAreaM2 / SQM_PER_SQFT, 2),
    tileAreaM2: round(tileAreaM2, 4),
    moduleAreaM2: round(moduleAreaM2, 4),
    moduleAreaCm2: round(moduleAreaM2 * 10000, 1),
    tilesExact: round(tilesExact, 2),
    tilesNeeded,
    tilesSupplied,
    spareTiles,
    boxes,
    tilesPerBox: perBox,
    areaCoveredM2: round(areaCoveredM2, 3),
    wastagePercent: round(waste, 2),
    deliveredWastePercent: round(deliveredWastePercent, 1),
    jointMm: joint,
    tileThicknessMm: thickness,
    groutKgPerM2: round(groutKgPerM2, 3),
    groutKg: round(groutKg, 2),
    adhesiveKgPerM2: round(adhesiveKgPerM2, 2),
    adhesiveKg: round(adhesiveKg, 2),
    adhesiveBags,
    trowelLabel: trowelSpec.label,
    bedMm: trowelSpec.bedMm,
    pricePerBox: round(boxPrice, 2),
    tileCost: round(tileCost, 2),
    costPerM2: netAreaM2 > 0 ? round(tileCost / netAreaM2, 2) : 0,
  };
}
