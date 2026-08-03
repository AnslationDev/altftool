/**
 * Timber weight = volume x density, where density depends on how wet the wood is.
 *
 * Wood swells as it takes up water below the fibre saturation point (about 30%
 * moisture content) and simply gains water above it. The USDA Wood Handbook models
 * this with the basic specific gravity Gb (oven-dry mass over green volume):
 *
 *      G(M) = Gb / (1 - 0.265 x a x Gb),   a = (30 - M) / 30 for M < 30, else 0
 *      density(M) = 1000 x G(M) x (1 + M/100)   kg per cubic metre
 *
 * The 0.265 constant is the Wood Handbook estimate of volumetric shrinkage per unit
 * of specific gravity. Species tables publish density at 12% moisture, so the table
 * below stores that and the code inverts the relation to recover Gb.
 */

/** Fibre saturation point: above this, extra water adds mass but no more swelling. */
export const FIBRE_SATURATION_PERCENT = 30;

/** Volumetric shrinkage coefficient from the USDA Wood Handbook. */
export const SHRINKAGE_COEFFICIENT = 0.265;

/** Reference moisture content of the published "seasoned" densities below. */
export const REFERENCE_MOISTURE_PERCENT = 12;

export const KG_PER_POUND = 0.45359237;
export const CUBIC_METRES_PER_CUBIC_FOOT = 0.028316846592;
export const MM_PER_INCH = 25.4;

export const LENGTH_UNITS = {
  mm: { label: "millimetres", toMetres: 0.001 },
  cm: { label: "centimetres", toMetres: 0.01 },
  m: { label: "metres", toMetres: 1 },
  in: { label: "inches", toMetres: MM_PER_INCH / 1000 },
  ft: { label: "feet", toMetres: (12 * MM_PER_INCH) / 1000 },
};

/**
 * Air-dry density at 12% moisture content, kg per cubic metre. Values are the
 * commonly published mid-range figures for each species; natural timber varies by
 * roughly plus or minus 10% between trees, so treat them as typical, not exact.
 * Engineered boards are manufactured to a target density and are not modelled by
 * the moisture equation, so they carry `engineered: true`.
 */
export const SPECIES = [
  { id: "teak", label: "Teak (Tectona grandis)", density12: 650 },
  { id: "sal", label: "Sal (Shorea robusta)", density12: 880 },
  { id: "sheesham", label: "Sheesham / Indian rosewood", density12: 780 },
  { id: "mango", label: "Mango (Mangifera indica)", density12: 650 },
  { id: "neem", label: "Neem (Azadirachta indica)", density12: 700 },
  { id: "babool", label: "Babool (Acacia nilotica)", density12: 800 },
  { id: "deodar", label: "Deodar cedar", density12: 560 },
  { id: "chirPine", label: "Chir pine", density12: 550 },
  { id: "rubberwood", label: "Rubberwood (Hevea)", density12: 610 },
  { id: "poplar", label: "Poplar", density12: 400 },
  { id: "silverOak", label: "Silver oak (Grevillea)", density12: 600 },
  { id: "mahogany", label: "Mahogany (Swietenia)", density12: 550 },
  { id: "whiteOak", label: "White oak", density12: 755 },
  { id: "hardMaple", label: "Hard maple", density12: 705 },
  { id: "radiataPine", label: "Radiata pine", density12: 480 },
  { id: "balsa", label: "Balsa", density12: 160 },
  { id: "plywood", label: "Commercial plywood", density12: 600, engineered: true },
  { id: "mdf", label: "MDF board", density12: 750, engineered: true },
  { id: "particleBoard", label: "Particle board", density12: 650, engineered: true },
  { id: "blockboard", label: "Blockboard", density12: 550, engineered: true },
  { id: "custom", label: "Custom density", density12: 650, custom: true },
];

export function getSpecies(id) {
  return SPECIES.find((entry) => entry.id === id) || SPECIES[0];
}

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Basic specific gravity recovered from a published 12%-moisture density. */
export function basicSpecificGravity(density12) {
  if (!isNum(density12) || density12 <= 0) return 0;
  const a = (FIBRE_SATURATION_PERCENT - REFERENCE_MOISTURE_PERCENT) / FIBRE_SATURATION_PERCENT;
  const wet = 1 + REFERENCE_MOISTURE_PERCENT / 100;
  // density12 = 1000 * Gb * wet / (1 - k*a*Gb)  ->  solve for Gb
  return density12 / (1000 * wet + SHRINKAGE_COEFFICIENT * a * density12);
}

/** Density in kg per cubic metre at an arbitrary moisture content. */
export function densityAtMoisture({ density12, moisturePercent }) {
  if (!isNum(density12) || density12 <= 0) return 0;
  if (!isNum(moisturePercent) || moisturePercent < 0) return density12;
  const gb = basicSpecificGravity(density12);
  const a =
    moisturePercent < FIBRE_SATURATION_PERCENT
      ? (FIBRE_SATURATION_PERCENT - moisturePercent) / FIBRE_SATURATION_PERCENT
      : 0;
  const denominator = 1 - SHRINKAGE_COEFFICIENT * a * gb;
  if (denominator <= 0) return 0;
  return (1000 * gb * (1 + moisturePercent / 100)) / denominator;
}

/** Convert a measurement in a supported unit to metres. */
export function toMetres(value, unit) {
  const entry = LENGTH_UNITS[unit];
  if (!entry || !isNum(value)) return NaN;
  return value * entry.toMetres;
}

/**
 * Weight of a batch of identical timber pieces.
 * Returns { error } when the input cannot produce a meaningful figure.
 */
export function computeTimberWeight({
  speciesId = "teak",
  customDensity = 650,
  thickness,
  thicknessUnit = "mm",
  width,
  widthUnit = "mm",
  length,
  lengthUnit = "m",
  pieces = 1,
  moisturePercent = REFERENCE_MOISTURE_PERCENT,
}) {
  const species = getSpecies(speciesId);
  const requiredFields = species.custom
    ? [thickness, width, length, pieces, moisturePercent, customDensity]
    : [thickness, width, length, pieces, moisturePercent];
  if (!requiredFields.every(isNum)) {
    return { error: "Enter a valid number in every field." };
  }
  if (thickness <= 0 || width <= 0 || length <= 0) {
    return { error: "Thickness, width and length must all be greater than zero." };
  }
  if (!Number.isInteger(pieces) || pieces < 1 || pieces > 100000) {
    return { error: "Number of pieces must be a whole number between 1 and 100000." };
  }
  if (moisturePercent < 0 || moisturePercent > 200) {
    return { error: "Moisture content should be between 0% and 200% of dry weight." };
  }

  const density12 = species.custom ? customDensity : species.density12;
  if (!(density12 > 0) || density12 > 1500) {
    return { error: "Density should be between 1 and 1500 kg per cubic metre." };
  }

  const t = toMetres(thickness, thicknessUnit);
  const w = toMetres(width, widthUnit);
  const l = toMetres(length, lengthUnit);
  if (![t, w, l].every(isNum)) return { error: "Choose a valid unit for each measurement." };

  const density = species.engineered
    ? density12
    : densityAtMoisture({ density12, moisturePercent });
  if (!(density > 0)) return { error: "That combination of density and moisture has no solution." };

  const volumePerPiece = t * w * l;
  const totalVolume = volumePerPiece * pieces;
  const weightPerPiece = volumePerPiece * density;
  const totalWeight = totalVolume * density;

  return {
    speciesLabel: species.label,
    engineered: Boolean(species.engineered),
    density12,
    density,
    densityChangePercent: density12 > 0 ? (density / density12 - 1) * 100 : 0,
    specificGravity: basicSpecificGravity(density12),
    volumePerPiece,
    totalVolume,
    totalVolumeCubicFeet: totalVolume / CUBIC_METRES_PER_CUBIC_FOOT,
    weightPerPiece,
    totalWeight,
    totalWeightPounds: totalWeight / KG_PER_POUND,
    weightPerMetreRun: l > 0 ? weightPerPiece / l : 0,
    pieces,
  };
}
