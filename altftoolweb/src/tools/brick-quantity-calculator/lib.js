/**
 * Brick, mortar, cement and sand take-off for masonry walls.
 *
 * Every brick in a wall occupies its own size plus one mortar joint in each of
 * the three directions, so the nominal cell a brick fills is
 *
 *   Vcell = (l + j) x (w + j) x (h + j)
 *
 * and the brick count for a wall of net volume V is  n = V / Vcell.
 * With the Indian modular brick of 190 x 90 x 90 mm and a 10 mm joint the cell
 * is 0.2 x 0.1 x 0.1 = 0.002 m3, which is the familiar figure of 500 bricks per
 * cubic metre of brickwork.
 *
 * Mortar is what is left over:
 *
 *   wet mortar = wall volume - (brick count x actual brick volume)
 *
 * Dry ingredients are bulked up by 1.33 before being split by the cement : sand
 * ratio, because loose sand and cement lose their voids once mixed and packed
 * into the joints.
 */

/** Common brick sizes in millimetres. */
export const BRICK_PRESETS = [
  { id: "in-modular", label: "Indian modular 190 x 90 x 90 mm", length: 190, width: 90, height: 90 },
  { id: "in-traditional", label: "Indian traditional 230 x 110 x 70 mm", length: 230, width: 110, height: 70 },
  { id: "uk", label: "UK standard 215 x 102.5 x 65 mm", length: 215, width: 102.5, height: 65 },
  { id: "us", label: "US modular 194 x 92 x 57 mm", length: 194, width: 92, height: 57 },
  { id: "aac-600", label: "AAC block 600 x 200 x 100 mm", length: 600, width: 200, height: 100 },
  { id: "custom", label: "Custom size", length: 190, width: 90, height: 90 },
];

/** Cement : sand mortar proportions used for masonry. */
export const MORTAR_MIXES = [
  { id: "1:3", cement: 1, sand: 3, use: "Load-bearing, damp or below-plinth work" },
  { id: "1:4", cement: 1, sand: 4, use: "Load-bearing brickwork, external walls" },
  { id: "1:5", cement: 1, sand: 5, use: "General brickwork" },
  { id: "1:6", cement: 1, sand: 6, use: "Half-brick partitions, internal walls" },
];

/** Bulking allowance from wet mortar volume to loose dry ingredients. */
export const MORTAR_DRY_FACTOR = 1.33;

export const CEMENT_BAG_KG = 50;

/** Bulk density of bagged cement, kg/m3. */
export const CEMENT_DENSITY_KG_M3 = 1440;

/** Volume of one 50 kg cement bag, m3. */
export const CEMENT_BAG_VOLUME_M3 = CEMENT_BAG_KG / CEMENT_DENSITY_KG_M3;

/** Loose bulk density of dry sand, kg/m3. */
export const SAND_DENSITY_KG_M3 = 1600;

/** Water-cement ratio for masonry mortar, by weight. */
export const MORTAR_WATER_CEMENT_RATIO = 0.5;

export const CFT_PER_M3 = 35.3146667;
export const SQFT_PER_M2 = 10.7639104;

/** Ready-made wall thickness choices in millimetres. */
export const WALL_THICKNESS_PRESETS = [
  { mm: 110, label: '110 mm (half brick, 4½")' },
  { mm: 150, label: "150 mm (block partition)" },
  { mm: 200, label: "200 mm (block wall)" },
  { mm: 230, label: '230 mm (one brick, 9")' },
  { mm: 350, label: '350 mm (one and a half brick, 13½")' },
];

/**
 * @param {object} input
 * @param {number} input.wallLengthM     wall length in metres
 * @param {number} input.wallHeightM     wall height in metres
 * @param {number} input.wallThicknessMm wall thickness in millimetres
 * @param {number} input.brickLengthMm
 * @param {number} input.brickWidthMm
 * @param {number} input.brickHeightMm
 * @param {number} input.jointMm         mortar joint thickness in millimetres
 * @param {number} input.openingAreaM2   doors and windows to deduct, m2
 * @param {number} input.wastagePct      breakage allowance on bricks
 * @param {string} input.mortarMix       id from MORTAR_MIXES
 * @param {number} input.brickRate       optional price per brick
 * @returns {object} take-off, or { error }
 */
export function computeBrickwork({
  wallLengthM,
  wallHeightM,
  wallThicknessMm,
  brickLengthMm,
  brickWidthMm,
  brickHeightMm,
  jointMm = 10,
  openingAreaM2 = 0,
  wastagePct = 5,
  mortarMix = "1:6",
  brickRate = 0,
}) {
  const L = Number(wallLengthM);
  const H = Number(wallHeightM);
  const tMm = Number(wallThicknessMm);
  const bl = Number(brickLengthMm);
  const bw = Number(brickWidthMm);
  const bh = Number(brickHeightMm);
  const j = Number(jointMm);
  const openings = Number(openingAreaM2);
  const waste = Number(wastagePct);
  const rate = Number(brickRate);

  const mix = MORTAR_MIXES.find((entry) => entry.id === mortarMix);
  if (!mix) return { error: "Choose a mortar mix from the list." };

  if (![L, H, tMm, bl, bw, bh, j, openings, waste, rate].every((v) => Number.isFinite(v))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (L <= 0 || H <= 0) return { error: "Wall length and height must be greater than zero." };
  if (L > 1000 || H > 100) return { error: "Wall length must be under 1000 m and height under 100 m." };
  if (tMm <= 0) return { error: "Wall thickness must be greater than zero." };
  if (bl <= 0 || bw <= 0 || bh <= 0) return { error: "Brick length, width and height must all be greater than zero." };
  if (j < 0 || j > 50) return { error: "Mortar joint should be between 0 and 50 mm." };
  if (openings < 0) return { error: "Opening area cannot be negative." };
  if (waste < 0 || waste > 50) return { error: "Wastage should be between 0% and 50%." };
  if (rate < 0) return { error: "Brick rate cannot be negative." };

  const grossArea = L * H;
  if (openings >= grossArea) {
    return { error: "Openings are as large as the wall — there is nothing left to build." };
  }

  const netArea = grossArea - openings;
  const thickness = tMm / 1000;
  const wallVolume = netArea * thickness;

  const cellVolume = ((bl + j) / 1000) * ((bw + j) / 1000) * ((bh + j) / 1000);
  const brickVolume = (bl / 1000) * (bw / 1000) * (bh / 1000);
  if (!(cellVolume > 0)) return { error: "Brick size and joint give a zero volume — check the numbers." };

  const bricksExact = wallVolume / cellVolume;
  const bricksPerM3 = 1 / cellVolume;
  const bricksPerM2 = bricksPerM3 * thickness;

  const wetMortar = Math.max(0, wallVolume - bricksExact * brickVolume);
  const dryMortar = wetMortar * MORTAR_DRY_FACTOR;
  const totalParts = mix.cement + mix.sand;
  const cementVolume = (dryMortar * mix.cement) / totalParts;
  const sandVolume = (dryMortar * mix.sand) / totalParts;
  const cementKg = cementVolume * CEMENT_DENSITY_KG_M3;

  const bricksWithWastage = bricksExact * (1 + waste / 100);

  return {
    grossArea,
    netArea,
    netAreaSqft: netArea * SQFT_PER_M2,
    wallVolume,
    thicknessMm: tMm,
    bricksExact,
    bricksToBuy: Math.ceil(bricksWithWastage),
    bricksPerM3,
    bricksPerM2,
    bricksPerSqft: bricksPerM2 / SQFT_PER_M2,
    wastagePct: waste,
    wetMortar,
    mortarSharePct: wallVolume > 0 ? (wetMortar / wallVolume) * 100 : 0,
    dryMortar,
    mortarMix: mix.id,
    mortarUse: mix.use,
    cementVolume,
    cementKg,
    cementBags: cementVolume / CEMENT_BAG_VOLUME_M3,
    cementBagsToBuy: Math.ceil(cementVolume / CEMENT_BAG_VOLUME_M3),
    sandVolume,
    sandCft: sandVolume * CFT_PER_M3,
    sandKg: sandVolume * SAND_DENSITY_KG_M3,
    waterLitres: cementKg * MORTAR_WATER_CEMENT_RATIO,
    brickCost: rate > 0 ? Math.ceil(bricksWithWastage) * rate : 0,
  };
}
