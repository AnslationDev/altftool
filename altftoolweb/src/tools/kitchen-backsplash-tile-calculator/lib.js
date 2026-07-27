/**
 * Kitchen backsplash tile calculator.
 *
 * A backsplash is the band of tile between the countertop and the underside of
 * the overhead cabinets, plus (usually) a taller panel behind the hob running
 * up to the chimney. The take-off is:
 *
 *   band area  = counter run x band height
 *   hob panel  = hob width x extra height above the band
 *   net area   = band + hob panel - window openings
 *
 * Socket and switch cutouts do not reduce the area, but each one costs a tile
 * or two in ruined cuts, so they are added back as spare tiles.
 */

/** 1 m = 1/0.3048 ft exactly, so 1 m^2 = 10.7639... ft^2. */
export const SQFT_PER_SQM = 1 / (0.3048 * 0.3048);
export const INCHES_PER_FT = 12;

export const MAX_BACKSPLASH_AREA_SQFT = 5_000;
export const MAX_WASTAGE_PERCENT = 40;

/**
 * Standard Indian modular kitchen geometry: counter top at 36 in (900 mm) and
 * the overhead cabinet bottom at 54 to 60 in, leaving an 18 to 24 in band.
 */
export const COUNTER_HEIGHT_IN = 36;
export const DEFAULT_BAND_HEIGHT_IN = 24;
export const MIN_BAND_HEIGHT_IN = 6;
export const MAX_BAND_HEIGHT_IN = 96;

/**
 * A cracked or mis-cut tile around a switchboard or socket is common enough
 * that tilers keep one spare tile per cutout on hand.
 */
export const SPARE_TILES_PER_CUTOUT = 1;

/** Cementitious adhesive: 1.5 kg per square metre per millimetre of bed. */
export const ADHESIVE_KG_PER_SQM_PER_MM = 1.5;
export const DEFAULT_ADHESIVE_BED_MM = 3;
export const ADHESIVE_BAG_KG = 20;

/** Grout density from grout pack datasheets, g/cm^3. */
export const GROUT_DENSITY_G_PER_CM3 = 1.6;

/** Backsplash tile sizes commonly used in Indian kitchens, in millimetres. */
export const BACKSPLASH_TILE_SIZES = [
  { label: "75 x 150 mm subway", widthMm: 75, heightMm: 150, tilesPerBox: 88 },
  { label: "100 x 300 mm subway", widthMm: 100, heightMm: 300, tilesPerBox: 33 },
  { label: "200 x 300 mm", widthMm: 200, heightMm: 300, tilesPerBox: 20 },
  { label: "300 x 450 mm", widthMm: 300, heightMm: 450, tilesPerBox: 10 },
  { label: "300 x 600 mm", widthMm: 300, heightMm: 600, tilesPerBox: 8 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;
const round3 = (value) => Math.round(value * 1000) / 1000;

/**
 * Height of the backsplash band from the counter to the cabinet underside.
 * @param {number} cabinetBottomHeightIn Height of the overhead cabinet base above the floor.
 * @param {number} [counterHeightIn]     Counter top height above the floor.
 * @returns {number} Band height in inches, or NaN if the geometry is impossible.
 */
export function bandHeightFromCabinet(cabinetBottomHeightIn, counterHeightIn = COUNTER_HEIGHT_IN) {
  if (!isNum(cabinetBottomHeightIn) || !isNum(counterHeightIn)) return NaN;
  const band = cabinetBottomHeightIn - counterHeightIn;
  return band > 0 ? band : NaN;
}

/**
 * @param {object} input
 * @param {number} input.counterRunFt      Running feet of counter to be splashed.
 * @param {number} [input.bandHeightIn]    Height of the tiled band, inches.
 * @param {number} [input.hobWidthFt]      Width of the taller panel behind the hob.
 * @param {number} [input.hobExtraHeightIn] Extra height of that panel above the band.
 * @param {number} [input.windowCount]
 * @param {number} [input.windowWidthFt]
 * @param {number} [input.windowHeightFt]
 * @param {number} [input.cutoutCount]     Sockets, switchboards and pipe penetrations.
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
export function calculateBacksplash({
  counterRunFt,
  bandHeightIn = DEFAULT_BAND_HEIGHT_IN,
  hobWidthFt = 0,
  hobExtraHeightIn = 0,
  windowCount = 0,
  windowWidthFt = 0,
  windowHeightFt = 0,
  cutoutCount = 0,
  tileWidthMm,
  tileHeightMm,
  tilesPerBox,
  wastagePercent = 12,
  pricePerBox = 0,
  tileThicknessMm = 8,
  jointWidthMm = 2,
  adhesiveBedMm = DEFAULT_ADHESIVE_BED_MM,
} = {}) {
  const values = {
    counterRunFt,
    bandHeightIn,
    hobWidthFt,
    hobExtraHeightIn,
    windowCount,
    windowWidthFt,
    windowHeightFt,
    cutoutCount,
    tileWidthMm,
    tileHeightMm,
    tilesPerBox,
    wastagePercent,
    pricePerBox,
    tileThicknessMm,
    jointWidthMm,
    adhesiveBedMm,
  };
  if (Object.values(values).some((value) => !isNum(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (counterRunFt <= 0) return { error: "Counter run must be greater than zero." };
  if (bandHeightIn < MIN_BAND_HEIGHT_IN || bandHeightIn > MAX_BAND_HEIGHT_IN) {
    return { error: `Backsplash height should be between ${MIN_BAND_HEIGHT_IN} and ${MAX_BAND_HEIGHT_IN} inches.` };
  }
  if (hobWidthFt < 0 || hobExtraHeightIn < 0) return { error: "Hob panel dimensions cannot be negative." };
  if (hobWidthFt > counterRunFt) return { error: "The hob panel cannot be wider than the counter run." };
  if (windowCount < 0 || windowWidthFt < 0 || windowHeightFt < 0) {
    return { error: "Window count and size cannot be negative." };
  }
  if (cutoutCount < 0) return { error: "Cutout count cannot be negative." };
  if (tileWidthMm <= 0 || tileHeightMm <= 0) return { error: "Tile width and height must be greater than zero." };
  if (tilesPerBox < 1) return { error: "A box must contain at least one tile." };
  if (wastagePercent < 0) return { error: "Wastage cannot be negative." };
  if (wastagePercent > MAX_WASTAGE_PERCENT) {
    return { error: `Wastage above ${MAX_WASTAGE_PERCENT}% suggests a measurement error.` };
  }
  if (pricePerBox < 0) return { error: "Price per box cannot be negative." };
  if (tileThicknessMm <= 0) return { error: "Tile thickness must be greater than zero." };
  if (jointWidthMm < 0) return { error: "Joint width cannot be negative." };
  if (adhesiveBedMm <= 0) return { error: "Adhesive bed must be greater than zero." };

  const bandAreaSqft = counterRunFt * (bandHeightIn / INCHES_PER_FT);
  const hobPanelSqft = hobWidthFt * (hobExtraHeightIn / INCHES_PER_FT);
  const grossAreaSqft = bandAreaSqft + hobPanelSqft;

  if (grossAreaSqft > MAX_BACKSPLASH_AREA_SQFT) {
    return { error: `Backsplash area above ${MAX_BACKSPLASH_AREA_SQFT.toLocaleString("en-IN")} sqft is out of range for this tool.` };
  }

  const windowAreaSqft = Math.floor(windowCount) * windowWidthFt * windowHeightFt;
  if (windowAreaSqft >= grossAreaSqft) {
    return { error: "Window openings are as large as the backsplash — check the window size." };
  }
  const netAreaSqft = grossAreaSqft - windowAreaSqft;

  const tileAreaSqm = (tileWidthMm / 1000) * (tileHeightMm / 1000);
  const tileAreaSqft = tileAreaSqm * SQFT_PER_SQM;
  const boxCoverageSqft = tileAreaSqft * tilesPerBox;

  const tilesExact = netAreaSqft / tileAreaSqft;
  const tilesWithWastage = Math.ceil(tilesExact * (1 + wastagePercent / 100));
  const cutoutSpares = Math.floor(cutoutCount) * SPARE_TILES_PER_CUTOUT;
  const tilesRequired = tilesWithWastage + cutoutSpares;

  const boxes = Math.ceil(tilesRequired / tilesPerBox);
  const tilesSupplied = boxes * tilesPerBox;
  const spareTiles = tilesSupplied - tilesRequired;

  const totalCost = boxes * pricePerBox;
  const costPerSqft = totalCost / netAreaSqft;

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
    bandAreaSqft: round2(bandAreaSqft),
    hobPanelSqft: round2(hobPanelSqft),
    grossAreaSqft: round2(grossAreaSqft),
    windowAreaSqft: round2(windowAreaSqft),
    netAreaSqft: round2(netAreaSqft),
    netAreaSqm: round2(netAreaSqm),
    tileAreaSqft: round3(tileAreaSqft),
    boxCoverageSqft: round2(boxCoverageSqft),
    tilesExact: round2(tilesExact),
    tilesWithWastage,
    cutoutSpares,
    tilesRequired,
    boxes,
    tilesSupplied,
    spareTiles,
    totalCost: Math.round(totalCost),
    costPerSqft: round2(costPerSqft),
    adhesiveKg: round2(adhesiveKg),
    adhesiveBags,
    groutKgPerSqm: round3(groutKgPerSqm),
    groutKg: round2(groutKg),
  };
}
