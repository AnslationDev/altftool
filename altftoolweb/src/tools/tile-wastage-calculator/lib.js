/**
 * Tile wastage recommendation and box quantity.
 *
 * Tile waste is not a single number. It is driven by how much of each tile ends up
 * as an unusable offcut, which depends mainly on the laying pattern (how many tiles
 * are cut and at what angle), then on the room outline, the tile format and the
 * skill of whoever is cutting. This module adds those contributions into one
 * recommended percentage and converts it into tiles and sealed boxes.
 *
 * The base figures follow the allowances tile suppliers and the Tile Council-style
 * fixing guides publish: about 5% for a straight grid, roughly triple that for a
 * 45-degree diagonal, and more again for herringbone and chevron because every
 * perimeter tile is cut on an angle and only one half of it is reusable.
 */

/** Base allowance by laying pattern, in percent of finished floor area. */
export const PATTERNS = [
  { value: "grid", label: "Straight / stack bond", percent: 5 },
  { value: "brick", label: "Brick or offset bond (1/2 or 1/3)", percent: 8 },
  { value: "modular", label: "Modular / mixed tile sizes", percent: 12 },
  { value: "diagonal", label: "Diagonal at 45°", percent: 15 },
  { value: "herringbone", label: "Herringbone", percent: 18 },
  { value: "chevron", label: "Chevron (mitred ends)", percent: 22 },
];

/** Extra allowance for a floor plan that is not a plain rectangle. */
export const SHAPES = [
  { value: "rectangular", label: "Simple rectangle", percent: 0 },
  { value: "lshaped", label: "L-shaped or with an alcove", percent: 2 },
  { value: "irregular", label: "Irregular, curved or multi-level", percent: 5 },
];

/** Extra allowance for who is cutting: a bad cut on a large tile is a whole tile lost. */
export const INSTALLERS = [
  { value: "professional", label: "Experienced tiler with a wet saw", percent: 0 },
  { value: "average", label: "Ordinary local contractor", percent: 2 },
  { value: "diy", label: "First-time DIY", percent: 4 },
];

/**
 * Extra allowance by tile format, keyed on the longest edge in mm. Large-format
 * tiles waste more because the offcut from a cut tile is usually too big to reuse
 * elsewhere and breakage during handling is higher.
 */
export const SIZE_BANDS = [
  { maxEdgeMm: 299, percent: 0, label: "Small (under 300 mm)" },
  { maxEdgeMm: 599, percent: 1, label: "Medium (300–599 mm)" },
  { maxEdgeMm: 1199, percent: 3, label: "Large format (600–1199 mm)" },
  { maxEdgeMm: Infinity, percent: 5, label: "Slab (1200 mm and over)" },
];

/** Each cutout — a pillar, WC pan, floor trap or island — costs part of a tile. */
export const PERCENT_PER_CUTOUT = 0.5;
export const MAX_CUTOUT_PERCENT = 4;

/** Sensible floor and ceiling so the recommendation stays orderable. */
export const MIN_WASTAGE_PERCENT = 3;
export const MAX_WASTAGE_PERCENT = 35;

const MAX_ROOM_SIDE_M = 100;

export function sizeBandFor(longestEdgeMm) {
  return SIZE_BANDS.find((band) => longestEdgeMm <= band.maxEdgeMm) ?? SIZE_BANDS[SIZE_BANDS.length - 1];
}

const lookup = (list, value) => list.find((item) => item.value === value);

/**
 * @returns {{error:string}|object} recommended wastage plus the resulting order
 */
export function computeTileWastage({
  roomLengthM,
  roomWidthM,
  tileWidthMm,
  tileHeightMm,
  pattern = "grid",
  shape = "rectangular",
  installer = "average",
  cutouts = 0,
  tilesPerBox = 4,
  pricePerBox = 0,
  spareBoxes = 1,
}) {
  const numbers = [
    roomLengthM,
    roomWidthM,
    tileWidthMm,
    tileHeightMm,
    cutouts,
    tilesPerBox,
    pricePerBox,
    spareBoxes,
  ];
  if (numbers.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    return { error: "Enter a valid number in every field." };
  }

  const patternRule = lookup(PATTERNS, pattern);
  const shapeRule = lookup(SHAPES, shape);
  const installerRule = lookup(INSTALLERS, installer);
  if (!patternRule || !shapeRule || !installerRule) {
    return { error: "Choose a pattern, room shape and installer from the lists." };
  }

  if (roomLengthM <= 0 || roomWidthM <= 0) {
    return { error: "Room length and width must both be greater than zero." };
  }
  if (roomLengthM > MAX_ROOM_SIDE_M || roomWidthM > MAX_ROOM_SIDE_M) {
    return { error: `Each room side must be ${MAX_ROOM_SIDE_M} m or less.` };
  }
  if (tileWidthMm <= 0 || tileHeightMm <= 0) {
    return { error: "Tile width and height must both be greater than zero." };
  }
  if (tileWidthMm > 3600 || tileHeightMm > 3600) {
    return { error: "Tile dimensions must be 3600 mm or less." };
  }
  if (cutouts < 0 || !Number.isInteger(cutouts)) {
    return { error: "Number of cutouts must be a whole number of zero or more." };
  }
  if (tilesPerBox <= 0 || !Number.isInteger(tilesPerBox)) {
    return { error: "Tiles per box must be a whole number of one or more." };
  }
  if (spareBoxes < 0 || !Number.isInteger(spareBoxes)) {
    return { error: "Spare boxes must be a whole number of zero or more." };
  }
  if (pricePerBox < 0) return { error: "Price per box cannot be negative." };

  const band = sizeBandFor(Math.max(tileWidthMm, tileHeightMm));
  const cutoutPercent = Math.min(MAX_CUTOUT_PERCENT, cutouts * PERCENT_PER_CUTOUT);

  const rawPercent =
    patternRule.percent + shapeRule.percent + band.percent + installerRule.percent + cutoutPercent;
  const wastagePercent = Math.min(
    MAX_WASTAGE_PERCENT,
    Math.max(MIN_WASTAGE_PERCENT, rawPercent),
  );

  const floorAreaM2 = roomLengthM * roomWidthM;
  const tileAreaM2 = (tileWidthMm / 1000) * (tileHeightMm / 1000);
  const areaWithWastageM2 = floorAreaM2 * (1 + wastagePercent / 100);

  const tilesForFloor = Math.ceil((floorAreaM2 - 1e-9) / tileAreaM2);
  const tilesNeeded = Math.ceil((areaWithWastageM2 - 1e-9) / tileAreaM2);
  const boxesNeeded = Math.ceil((tilesNeeded - 1e-9) / tilesPerBox);
  const tilesSupplied = boxesNeeded * tilesPerBox;
  const totalBoxes = boxesNeeded + spareBoxes;

  const deliveredAreaM2 = tilesSupplied * tileAreaM2;
  const effectiveWastagePercent =
    floorAreaM2 > 0 ? ((deliveredAreaM2 - floorAreaM2) / floorAreaM2) * 100 : 0;

  return {
    breakdown: [
      [`Pattern — ${patternRule.label}`, patternRule.percent],
      [`Room shape — ${shapeRule.label}`, shapeRule.percent],
      [`Tile format — ${band.label}`, band.percent],
      [`Installer — ${installerRule.label}`, installerRule.percent],
      [`Cutouts (${cutouts})`, cutoutPercent],
    ],
    rawPercent,
    wastagePercent,
    clamped: rawPercent !== wastagePercent,
    floorAreaM2,
    tileAreaM2,
    areaWithWastageM2,
    tilesForFloor,
    tilesNeeded,
    boxesNeeded,
    tilesSupplied,
    spareBoxes,
    totalBoxes,
    deliveredAreaM2,
    effectiveWastagePercent,
    materialCost: totalBoxes * pricePerBox,
    areaPerBoxM2: tilesPerBox * tileAreaM2,
  };
}
