/**
 * Driveway sealer quantity calculator.
 *
 * Sealer is sold by spread rate, so the whole calculation is:
 *
 *     gallons for a coat = area x waste allowance / coverage for that coat
 *
 * Coverage depends on what the surface is and how thirsty it is. Asphalt
 * emulsion and coal-tar driveway sealers are rated by manufacturers at roughly
 * 70-80 square feet per gallon per coat on an average surface, which is why a
 * 5-gallon pail is usually labelled "up to 500 sq ft for two coats". Concrete
 * sealers are thin penetrating or acrylic products and go far further, around
 * 250 square feet per gallon.
 *
 * A second coat always goes further than the first because the first coat has
 * already filled the surface pores; 25% further is the usual allowance.
 */

/** 1 US gallon = 3.785411784 litres exactly. */
export const LITRES_PER_GALLON = 3.785411784;
/** Driveway sealer is sold in 5-gallon pails and 55-gallon drums. */
export const GALLONS_PER_PAIL = 5;
export const GALLONS_PER_DRUM = 55;
/** 1 square metre = 10.7639 square feet. */
export const SQFT_PER_SQM = 10.7639;
/** 1 foot = 0.3048 m exactly. */
export const M_PER_FT = 0.3048;

/** A second and any later coat covers 25% more area than the first. */
export const LATER_COAT_COVERAGE_FACTOR = 1.25;

/**
 * Pourable crack filler covers about 125 linear feet of a typical 1/4 inch
 * crack per gallon; a 10 oz caulk tube does about 25 linear feet.
 */
export const CRACK_FEET_PER_GALLON = 125;
export const CRACK_FEET_PER_TUBE = 25;

export const MATERIALS = {
  asphalt: {
    key: "asphalt",
    label: "Asphalt / blacktop — emulsion or coal-tar sealer",
    baseSqftPerGallon: 75,
  },
  concrete: {
    key: "concrete",
    label: "Concrete — acrylic or silane-siloxane sealer",
    baseSqftPerGallon: 250,
  },
};

export const CONDITIONS = {
  smooth: { key: "smooth", label: "New or smooth, tight surface", factor: 1.2 },
  average: { key: "average", label: "Average — a few years old, lightly weathered", factor: 1.0 },
  porous: { key: "porous", label: "Porous or weathered, aggregate showing", factor: 0.8 },
  veryPorous: { key: "veryPorous", label: "Very porous, rough or never sealed", factor: 0.67 },
};

/** More than four coats is not a real job. */
export const MAX_COATS = 4;

const round = (value, decimals = 0) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Calculate driveway sealer needed.
 *
 * @param {object} input
 * @param {"dimensions"|"area"} input.mode
 * @param {number|string} input.length     driveway length
 * @param {number|string} input.width      driveway width
 * @param {number|string} input.area       area directly, when mode is "area"
 * @param {"ft"|"m"} input.unit            unit for length/width
 * @param {"sqft"|"sqm"} input.areaUnit    unit when entering area directly
 * @param {number|string} input.extraArea  extra apron or parking pad, same area unit
 * @param {string} input.material          key of MATERIALS
 * @param {string} input.condition         key of CONDITIONS
 * @param {number|string} input.coats      number of coats
 * @param {number|string} input.wastePct   overlap and spillage allowance, percent
 * @param {number|string} input.crackFeet  linear feet of cracks to fill
 * @param {number|string} input.pricePerPail price of one 5-gallon pail
 * @returns {object} sealer result, or { error } for invalid input
 */
export function calculateSealer({
  mode = "dimensions",
  length = 60,
  width = 12,
  area = 720,
  unit = "ft",
  areaUnit = "sqft",
  extraArea = 0,
  material = "asphalt",
  condition = "average",
  coats = 2,
  wastePct = 5,
  crackFeet = 0,
  pricePerPail = 35,
}) {
  const mat = MATERIALS[material];
  if (!mat) return { error: "Choose either an asphalt or a concrete sealer." };

  const cond = CONDITIONS[condition];
  if (!cond) return { error: "Choose one of the listed surface conditions." };

  const coatCountRaw = toNumber(coats);
  const waste = toNumber(wastePct);
  const cracks = toNumber(crackFeet);
  const price = toNumber(pricePerPail);
  const extra = toNumber(extraArea);

  if ([coatCountRaw, waste, cracks, price, extra].some((v) => Number.isNaN(v))) {
    return { error: "Enter valid numbers for coats, waste, cracks, extra area and price." };
  }
  if (!Number.isInteger(coatCountRaw)) {
    return { error: "Coats must be a whole number." };
  }
  const coatCount = coatCountRaw;
  if (coatCount < 1 || coatCount > MAX_COATS) {
    return { error: `Number of coats must be between 1 and ${MAX_COATS}.` };
  }
  if (waste < 0 || waste > 50) return { error: "Waste allowance should be between 0% and 50%." };
  if (cracks < 0) return { error: "Crack length cannot be negative." };
  if (price < 0) return { error: "Price per pail cannot be negative." };
  if (extra < 0) return { error: "Extra area cannot be negative." };

  // Extra area is entered in whichever system the main measurement uses.
  const usingMetric = mode === "dimensions" ? unit === "m" : areaUnit === "sqm";

  let baseSqft;
  if (mode === "dimensions") {
    const l = toNumber(length);
    const w = toNumber(width);
    if (Number.isNaN(l) || Number.isNaN(w)) {
      return { error: "Enter the driveway length and width as numbers." };
    }
    if (l <= 0 || w <= 0) return { error: "Driveway length and width must be greater than zero." };
    if (unit !== "ft" && unit !== "m") return { error: "Dimension unit must be feet or metres." };
    const factor = unit === "m" ? 1 / M_PER_FT : 1;
    baseSqft = l * factor * (w * factor);
  } else if (mode === "area") {
    const a = toNumber(area);
    if (Number.isNaN(a)) return { error: "Enter the driveway area as a number." };
    if (a <= 0) return { error: "Driveway area must be greater than zero." };
    if (areaUnit !== "sqft" && areaUnit !== "sqm") {
      return { error: "Area unit must be square feet or square metres." };
    }
    baseSqft = areaUnit === "sqm" ? a * SQFT_PER_SQM : a;
  } else {
    return { error: "Choose whether to enter dimensions or an area." };
  }

  const extraSqft = usingMetric ? extra * SQFT_PER_SQM : extra;

  const totalSqft = baseSqft + extraSqft;
  if (totalSqft > 200000) {
    return { error: "Above 200,000 ft² this is a commercial paving contract — get a contractor quote." };
  }

  const effectiveSqft = totalSqft * (1 + waste / 100);

  const firstCoatCoverage = mat.baseSqftPerGallon * cond.factor;
  const laterCoatCoverage = firstCoatCoverage * LATER_COAT_COVERAGE_FACTOR;

  const firstCoatGallons = effectiveSqft / firstCoatCoverage;
  const laterCoatGallons = (coatCount - 1) * (effectiveSqft / laterCoatCoverage);
  const totalGallons = firstCoatGallons + laterCoatGallons;

  const pails = Math.ceil(totalGallons / GALLONS_PER_PAIL);
  const drums = Math.ceil(totalGallons / GALLONS_PER_DRUM);
  const litres = totalGallons * LITRES_PER_GALLON;

  const crackGallons = cracks / CRACK_FEET_PER_GALLON;
  const crackTubes = Math.ceil(cracks / CRACK_FEET_PER_TUBE);

  const totalCost = pails * price;

  const perCoat = [];
  for (let coat = 1; coat <= coatCount; coat += 1) {
    const coverage = coat === 1 ? firstCoatCoverage : laterCoatCoverage;
    perCoat.push({
      coat,
      coverage: round(coverage, 1),
      gallons: round(effectiveSqft / coverage, 2),
      litres: round((effectiveSqft / coverage) * LITRES_PER_GALLON, 1),
    });
  }

  return {
    materialLabel: mat.label,
    conditionLabel: cond.label,
    totalSqft: round(totalSqft, 1),
    totalSqm: round(totalSqft / SQFT_PER_SQM, 1),
    effectiveSqft: round(effectiveSqft, 1),
    coats: coatCount,
    firstCoatCoverage: round(firstCoatCoverage, 1),
    laterCoatCoverage: round(laterCoatCoverage, 1),
    coverageSqmPerLitre: round(firstCoatCoverage / SQFT_PER_SQM / LITRES_PER_GALLON, 2),
    firstCoatGallons: round(firstCoatGallons, 2),
    laterCoatGallons: round(laterCoatGallons, 2),
    totalGallons: round(totalGallons, 2),
    litres: round(litres, 1),
    pails,
    drums,
    leftoverGallons: round(pails * GALLONS_PER_PAIL - totalGallons, 2),
    crackGallons: round(crackGallons, 2),
    crackJugs: Math.ceil(crackGallons),
    crackTubes,
    totalCost: round(totalCost, 2),
    perCoat,
  };
}
