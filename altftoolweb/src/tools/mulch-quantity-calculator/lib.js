/**
 * Mulch quantity estimator.
 *
 * Rule implemented: volume = bed area x mulch depth. Everything is normalised to
 * cubic metres internally, then reported in cubic feet, cubic yards and litres.
 * Bags are always rounded up because mulch is sold by the whole bag.
 */

// International foot: 1 ft = 0.3048 m exactly.
export const M_PER_FT = 0.3048;
export const SQM_PER_SQFT = M_PER_FT * M_PER_FT;
export const M3_PER_CUFT = M_PER_FT ** 3; // 0.028316846592
export const CUFT_PER_M3 = 1 / M3_PER_CUFT; // 35.3146667
export const CUFT_PER_CUYD = 27;
export const LITRES_PER_M3 = 1000;
// 1 inch = 25.4 mm exactly.
export const M_PER_INCH = 0.0254;

/**
 * Depth guidance from university extension services: 5-10 cm (2-4 in) of organic
 * mulch on beds, thinner when topping up, and never piled against stems or trunks.
 */
export const DEPTH_PRESETS = [
  { id: "topup", label: "Top-up over old mulch", inches: 1, cm: 2.5 },
  { id: "standard", label: "Standard bed", inches: 2, cm: 5 },
  { id: "weeds", label: "Weed suppression", inches: 3, cm: 7.5 },
  { id: "bare", label: "Bare soil / deep bed", inches: 4, cm: 10 },
];

// Common retail bag sizes. US bark and wood mulch is bagged at 2 cu ft;
// UK, EU and Indian compost/bark bags are sold in litres.
export const BAG_PRESETS = [
  { id: "cuft2", label: "2 cu ft bag", unit: "imperial", size: 2 },
  { id: "cuft3", label: "3 cu ft bag", unit: "imperial", size: 3 },
  { id: "l50", label: "50 litre bag", unit: "metric", size: 50 },
  { id: "l70", label: "70 litre bag", unit: "metric", size: 70 },
];

/**
 * Bulk density of shredded bark / wood mulch, air dry. Real loads range roughly
 * 250-650 kg/m3 depending on species and moisture; 400 is a working middle.
 */
export const MULCH_DENSITY_KG_PER_M3 = 400;

// Sanity ceiling on bed area, in the user's own square unit.
export const MAX_AREA = 100000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @returns {{error:string}|object} volume figures, bag count and costs.
 */
export function computeMulch({
  unit = "imperial",
  shape = "rectangle",
  length = 0,
  width = 0,
  diameter = 0,
  area = 0,
  depth = 3,
  bagSize = 2,
  pricePerBag = 0,
  bulkPrice = 0,
} = {}) {
  if (unit !== "imperial" && unit !== "metric") {
    return { error: "Choose either imperial (feet) or metric (metres) units." };
  }
  if (!["rectangle", "circle", "area"].includes(shape)) {
    return { error: "Choose a rectangular bed, a circular bed, or enter the area directly." };
  }
  if (![length, width, diameter, area, depth, bagSize, pricePerBag, bulkPrice].every(isNum)) {
    return { error: "Enter a valid number in every field." };
  }

  let bedArea;
  if (shape === "rectangle") {
    if (!(length > 0) || !(width > 0)) {
      return { error: "Bed length and width must both be greater than zero." };
    }
    bedArea = length * width;
  } else if (shape === "circle") {
    if (!(diameter > 0)) return { error: "Bed diameter must be greater than zero." };
    bedArea = Math.PI * (diameter / 2) ** 2;
  } else {
    if (!(area > 0)) return { error: "Bed area must be greater than zero." };
    bedArea = area;
  }

  if (bedArea > MAX_AREA) {
    return { error: `That bed is over ${MAX_AREA.toLocaleString("en-US")} square units — check the measurements.` };
  }
  if (!(depth > 0)) return { error: "Mulch depth must be greater than zero." };
  if (!(bagSize > 0)) return { error: "Bag size must be greater than zero." };
  if (pricePerBag < 0 || bulkPrice < 0) return { error: "Prices cannot be negative." };

  const isImperial = unit === "imperial";
  if (isImperial && depth > 24) return { error: "A mulch depth over 24 inches is not realistic." };
  if (!isImperial && depth > 60) return { error: "A mulch depth over 60 cm is not realistic." };

  const areaM2 = isImperial ? bedArea * SQM_PER_SQFT : bedArea;
  const depthM = isImperial ? depth * M_PER_INCH : depth / 100;
  const volumeM3 = areaM2 * depthM;

  const volumeCuFt = volumeM3 * CUFT_PER_M3;
  const volumeCuYd = volumeCuFt / CUFT_PER_CUYD;
  const volumeLitres = volumeM3 * LITRES_PER_M3;

  const bagVolumeM3 = isImperial ? bagSize * M3_PER_CUFT : bagSize / LITRES_PER_M3;
  const bags = Math.ceil(volumeM3 / bagVolumeM3);
  const baggedVolumeM3 = bags * bagVolumeM3;
  const bagCost = bags * pricePerBag;

  // Bulk mulch is ordered in whole or half cubic yards (imperial) / cubic metres (metric).
  const bulkUnitVolume = isImperial ? volumeCuYd : volumeM3;
  const bulkOrder = Math.ceil(bulkUnitVolume * 2) / 2;
  const bulkCost = bulkOrder * bulkPrice;

  const weightKg = volumeM3 * MULCH_DENSITY_KG_PER_M3;

  return {
    unit,
    bedArea,
    areaUnit: isImperial ? "sq ft" : "m²",
    lengthUnit: isImperial ? "ft" : "m",
    depthUnit: isImperial ? "in" : "cm",
    volumeM3,
    volumeCuFt,
    volumeCuYd,
    volumeLitres,
    primaryVolume: isImperial ? volumeCuFt : volumeM3,
    primaryVolumeUnit: isImperial ? "cu ft" : "m³",
    bags,
    bagOverflowM3: baggedVolumeM3 - volumeM3,
    bagCost,
    bulkOrder,
    bulkUnit: isImperial ? "cu yd" : "m³",
    bulkCost,
    weightKg,
    cheaper: bagCost > 0 && bulkCost > 0 ? (bulkCost < bagCost ? "bulk" : "bags") : "",
  };
}
