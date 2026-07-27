/**
 * Garden soil / topsoil volume estimator.
 *
 * Rule implemented: volume = area x depth, then split by parts-by-volume across
 * topsoil, compost and grit. Weight uses a volume-weighted density, because a
 * cubic metre of compost weighs roughly half what a cubic metre of topsoil does.
 */

// International foot: 1 ft = 0.3048 m exactly; 1 in = 25.4 mm exactly.
export const M_PER_FT = 0.3048;
export const SQM_PER_SQFT = M_PER_FT * M_PER_FT;
export const M3_PER_CUFT = M_PER_FT ** 3; // 0.028316846592
export const CUFT_PER_M3 = 1 / M3_PER_CUFT;
export const CUFT_PER_CUYD = 27;
export const LITRES_PER_M3 = 1000;
export const M_PER_INCH = 0.0254;

/**
 * Typical delivered bulk densities, kg per cubic metre. Screened topsoil is
 * usually quoted at 1.2-1.4 t/m3, green-waste compost at 0.6-0.8 t/m3, and
 * sharp sand or horticultural grit at 1.5-1.7 t/m3.
 */
export const COMPONENT_DENSITY_KG_PER_M3 = {
  topsoil: 1300,
  compost: 700,
  grit: 1600,
};

export const COMPONENT_LABELS = {
  topsoil: "Screened topsoil",
  compost: "Compost / organic matter",
  grit: "Sharp sand or grit",
};

/** Common mixes expressed as parts by volume. */
export const MIX_PRESETS = [
  { id: "topsoil", label: "Topsoil only", parts: { topsoil: 1, compost: 0, grit: 0 } },
  { id: "raised", label: "Raised bed 60/30/10", parts: { topsoil: 6, compost: 3, grit: 1 } },
  { id: "thirds", label: "Equal thirds mix", parts: { topsoil: 1, compost: 1, grit: 1 } },
  { id: "dressing", label: "Lawn dressing 70 sand / 30 loam", parts: { topsoil: 3, compost: 0, grit: 7 } },
];

/** Depth guidance in centimetres and inches for the common soil jobs. */
export const DEPTH_PRESETS = [
  { id: "topdress", label: "Lawn top-dressing", cm: 0.5, inches: 0.25 },
  { id: "level", label: "Levelling hollows in turf", cm: 2, inches: 0.75 },
  { id: "newlawn", label: "Topsoil under a new lawn", cm: 15, inches: 6 },
  { id: "bed", label: "Vegetable raised bed", cm: 30, inches: 12 },
];

/** A standard builders' bulk bag holds about 0.72 m3 (often sold as "1 tonne"). */
export const BULK_BAG_M3 = 0.72;

/** Retail soil and compost bags are usually 25-60 litres. */
export const DEFAULT_BAG_LITRES = 40;

export const MAX_AREA = 100000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @returns {{error:string}|object}
 */
export function computeSoilVolume({
  unit = "metric",
  shape = "rectangle",
  length = 0,
  width = 0,
  diameter = 0,
  area = 0,
  depth = 30,
  parts = { topsoil: 1, compost: 0, grit: 0 },
  bagLitres = DEFAULT_BAG_LITRES,
  pricePerBag = 0,
  bulkBagVolumeM3 = BULK_BAG_M3,
  pricePerBulkBag = 0,
} = {}) {
  if (unit !== "metric" && unit !== "imperial") {
    return { error: "Choose either metric (metres and cm) or imperial (feet and inches)." };
  }
  if (!["rectangle", "circle", "area"].includes(shape)) {
    return { error: "Choose a rectangular area, a circular area, or enter the area directly." };
  }

  const partValues = {
    topsoil: parts?.topsoil ?? 0,
    compost: parts?.compost ?? 0,
    grit: parts?.grit ?? 0,
  };

  const allNumbers = [
    length, width, diameter, area, depth, bagLitres, pricePerBag, bulkBagVolumeM3, pricePerBulkBag,
    partValues.topsoil, partValues.compost, partValues.grit,
  ];
  if (!allNumbers.every(isNum)) {
    return { error: "Enter a valid number in every field." };
  }

  let footprint;
  if (shape === "rectangle") {
    if (!(length > 0) || !(width > 0)) {
      return { error: "Length and width must both be greater than zero." };
    }
    footprint = length * width;
  } else if (shape === "circle") {
    if (!(diameter > 0)) return { error: "Diameter must be greater than zero." };
    footprint = Math.PI * (diameter / 2) ** 2;
  } else {
    if (!(area > 0)) return { error: "Area must be greater than zero." };
    footprint = area;
  }

  if (footprint > MAX_AREA) {
    return { error: `That area is over ${MAX_AREA.toLocaleString("en-US")} square units — check the measurements.` };
  }
  if (!(depth > 0)) return { error: "Soil depth must be greater than zero." };

  const isMetric = unit === "metric";
  if (isMetric && depth > 300) return { error: "A soil depth over 300 cm is not realistic for a garden." };
  if (!isMetric && depth > 120) return { error: "A soil depth over 120 inches is not realistic for a garden." };

  if (!(bagLitres > 0)) return { error: "Bag size must be greater than zero litres." };
  if (!(bulkBagVolumeM3 > 0)) return { error: "Bulk bag volume must be greater than zero." };
  if (pricePerBag < 0 || pricePerBulkBag < 0) return { error: "Prices cannot be negative." };

  const partsSum = partValues.topsoil + partValues.compost + partValues.grit;
  if (!(partsSum > 0)) return { error: "The mix needs at least one part of topsoil, compost or grit." };
  if (partValues.topsoil < 0 || partValues.compost < 0 || partValues.grit < 0) {
    return { error: "Mix parts cannot be negative." };
  }

  const areaM2 = isMetric ? footprint : footprint * SQM_PER_SQFT;
  const depthM = isMetric ? depth / 100 : depth * M_PER_INCH;
  const volumeM3 = areaM2 * depthM;

  const components = ["topsoil", "compost", "grit"].map((key) => {
    const share = partValues[key] / partsSum;
    const componentVolumeM3 = volumeM3 * share;
    return {
      key,
      label: COMPONENT_LABELS[key],
      parts: partValues[key],
      share,
      volumeM3: componentVolumeM3,
      volumeLitres: componentVolumeM3 * LITRES_PER_M3,
      volumeCuFt: componentVolumeM3 * CUFT_PER_M3,
      weightKg: componentVolumeM3 * COMPONENT_DENSITY_KG_PER_M3[key],
    };
  });

  const weightKg = components.reduce((sum, item) => sum + item.weightKg, 0);
  const effectiveDensity = volumeM3 > 0 ? weightKg / volumeM3 : 0;

  const bagVolumeM3 = bagLitres / LITRES_PER_M3;
  const bags = Math.ceil(volumeM3 / bagVolumeM3);
  const bulkBags = Math.ceil(volumeM3 / bulkBagVolumeM3);

  return {
    unit,
    footprint,
    areaUnit: isMetric ? "m²" : "sq ft",
    lengthUnit: isMetric ? "m" : "ft",
    depthUnit: isMetric ? "cm" : "in",
    volumeM3,
    volumeLitres: volumeM3 * LITRES_PER_M3,
    volumeCuFt: volumeM3 * CUFT_PER_M3,
    volumeCuYd: (volumeM3 * CUFT_PER_M3) / CUFT_PER_CUYD,
    primaryVolume: isMetric ? volumeM3 : volumeM3 * CUFT_PER_M3,
    primaryVolumeUnit: isMetric ? "m³" : "cu ft",
    components,
    weightKg,
    weightTonnes: weightKg / 1000,
    effectiveDensity,
    bags,
    bagCost: bags * pricePerBag,
    bulkBags,
    bulkBagCost: bulkBags * pricePerBulkBag,
  };
}
