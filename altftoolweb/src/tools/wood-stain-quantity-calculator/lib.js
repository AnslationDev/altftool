/**
 * How much wood stain, sealer or varnish a job needs.
 *
 * Every finish is sold with a spreading rate - the area one litre covers in one
 * coat on smooth, planed, average-porosity timber. Three things change it:
 *
 *   effective coverage = base coverage / (texture factor x porosity factor)
 *
 * Rough-sawn timber has far more surface than its measured area suggests, and
 * open-grained softwood drinks more than dense hardwood. Bare wood also takes
 * noticeably more on the first coat than on later ones, so coat one is loaded by
 * a first-coat factor and the rest are not.
 *
 *   litres = area / effective coverage, summed over the coats, plus wastage
 *
 * Spreading rates below are the mid-points of the ranges manufacturers print on
 * the tin; always check the actual product label, because a single brand can
 * vary by 30% between its own product lines.
 */

export const M2_PER_SQFT = 0.09290304;
export const SQFT_PER_M2 = 10.7639104;
export const LITRES_PER_US_GALLON = 3.785411784;

/** Base spreading rate on smooth, medium-porosity wood, m2 per litre per coat. */
export const PRODUCTS = [
  { id: "oil-stain", label: "Penetrating oil-based wood stain", coverage: 9, coats: 2 },
  { id: "water-stain", label: "Water-based wood stain", coverage: 10, coats: 2 },
  { id: "gel-stain", label: "Gel stain", coverage: 8, coats: 2 },
  { id: "danish-oil", label: "Danish / tung / teak oil", coverage: 14, coats: 3 },
  { id: "sanding-sealer", label: "Sanding sealer", coverage: 11, coats: 1 },
  { id: "polyurethane", label: "Polyurethane varnish", coverage: 10, coats: 2 },
  { id: "exterior-stain", label: "Exterior decking / fence stain", coverage: 6, coats: 2 },
];

/** How much more finish a surface texture drinks than a planed one. */
export const TEXTURES = [
  { id: "smooth", label: "Planed and sanded smooth", factor: 1 },
  { id: "mill", label: "Mill finish, lightly sanded", factor: 1.15 },
  { id: "rough", label: "Rough sawn or weathered", factor: 1.7 },
  { id: "sealed", label: "Already sealed or previously coated", factor: 0.85 },
];

/** How much more an open-grained wood drinks than an average one. */
export const POROSITIES = [
  { id: "dense", label: "Dense hardwood (teak, oak, maple, sheesham)", factor: 0.85 },
  { id: "medium", label: "Medium (ash, birch, beech, mango, rubberwood)", factor: 1 },
  { id: "open", label: "Open-grained softwood (pine, deodar, cedar)", factor: 1.25 },
  { id: "board", label: "MDF or particleboard edges, heavy end grain", factor: 1.6 },
];

/** Bare wood takes this much more on the first coat than on later coats. */
export const FIRST_COAT_FACTOR = 1.3;

/** Tin sizes normally stocked, in litres. */
export const CAN_SIZES_L = [0.25, 0.5, 1, 4, 5, 10, 20];

export const MAX_COATS = 6;

/**
 * Surface area to be finished, in square metres.
 *
 * @param {object} input
 * @param {string} input.mode        "direct" | "pieces"
 * @param {number} input.areaValue   area when mode is direct
 * @param {string} input.areaUnit    "m2" | "sqft"
 * @param {number} input.lengthM     piece length in metres
 * @param {number} input.widthM      piece width in metres
 * @param {number} input.thicknessMm piece thickness in millimetres
 * @param {number} input.count       how many identical pieces
 * @param {boolean} input.bothSides  finish the back as well as the front
 * @param {boolean} input.includeEdges add the four edges
 * @returns {number} area in m2, or NaN when the input is unusable
 */
export function surfaceArea({
  mode = "direct",
  areaValue,
  areaUnit = "m2",
  lengthM,
  widthM,
  thicknessMm = 0,
  count = 1,
  bothSides = false,
  includeEdges = false,
}) {
  if (mode === "direct") {
    const value = Number(areaValue);
    if (!(value > 0)) return NaN;
    return areaUnit === "sqft" ? value * M2_PER_SQFT : value;
  }
  const L = Number(lengthM);
  const W = Number(widthM);
  const t = Number(thicknessMm) / 1000;
  const n = Number(count);
  if (!(L > 0) || !(W > 0) || !(n > 0)) return NaN;
  const faces = bothSides ? 2 : 1;
  const edges = includeEdges && t > 0 ? 2 * (L + W) * t : 0;
  return n * (L * W * faces + edges);
}

/**
 * @param {object} input  everything surfaceArea takes, plus:
 * @param {string} input.product   id from PRODUCTS
 * @param {string} input.texture   id from TEXTURES
 * @param {string} input.porosity  id from POROSITIES
 * @param {number} input.coats     number of coats
 * @param {boolean} input.bareWood true when the wood has never been finished
 * @param {number} input.wastePct  brush loss, spills and touch-ups
 * @param {number} input.canSizeL  tin size to buy in
 * @param {number} input.pricePerLitre
 * @returns {object} litres and coat breakdown, or { error }
 */
export function computeStain(input) {
  const {
    product = "oil-stain",
    texture = "smooth",
    porosity = "medium",
    coats = 2,
    bareWood = true,
    wastePct = 10,
    canSizeL = 1,
    pricePerLitre = 0,
  } = input;

  const finish = PRODUCTS.find((entry) => entry.id === product);
  const tex = TEXTURES.find((entry) => entry.id === texture);
  const por = POROSITIES.find((entry) => entry.id === porosity);
  if (!finish) return { error: "Choose a finish product." };
  if (!tex) return { error: "Choose a surface texture." };
  if (!por) return { error: "Choose a wood porosity." };

  const coatCount = Number(coats);
  const waste = Number(wastePct);
  const can = Number(canSizeL);
  const price = Number(pricePerLitre);

  if (![coatCount, waste, can, price].every((v) => Number.isFinite(v))) {
    return { error: "Enter valid numbers for coats, wastage, tin size and price." };
  }
  if (!Number.isInteger(coatCount) || coatCount < 1 || coatCount > MAX_COATS) {
    return { error: `Number of coats must be a whole number between 1 and ${MAX_COATS}.` };
  }
  if (waste < 0 || waste > 60) return { error: "Wastage should be between 0% and 60%." };
  if (!(can > 0) || can > 200) return { error: "Tin size must be between 0 and 200 litres." };
  if (price < 0) return { error: "Price per litre cannot be negative." };

  const areaM2 = surfaceArea(input);
  if (!Number.isFinite(areaM2) || areaM2 <= 0) {
    return { error: "Enter a surface area greater than zero." };
  }
  if (areaM2 > 100000) return { error: "That area is unrealistically large — check the units." };

  const effectiveCoverage = finish.coverage / (tex.factor * por.factor);
  if (!(effectiveCoverage > 0)) return { error: "Coverage works out to zero — check the texture and porosity." };

  const perCoat = [];
  let net = 0;
  for (let coat = 1; coat <= coatCount; coat += 1) {
    const loading = coat === 1 && bareWood ? FIRST_COAT_FACTOR : 1;
    const litres = (areaM2 / effectiveCoverage) * loading;
    net += litres;
    perCoat.push({ coat, litres, loading });
  }

  const totalLitres = net * (1 + waste / 100);
  const cans = Math.ceil(totalLitres / can);

  return {
    areaM2,
    areaSqft: areaM2 * SQFT_PER_M2,
    product: finish.label,
    baseCoverage: finish.coverage,
    suggestedCoats: finish.coats,
    textureFactor: tex.factor,
    porosityFactor: por.factor,
    effectiveCoverage,
    effectiveCoverageSqftPerGallon: effectiveCoverage * SQFT_PER_M2 * LITRES_PER_US_GALLON,
    perCoat,
    netLitres: net,
    totalLitres,
    wastePct: waste,
    canSizeL: can,
    cans,
    litresPurchased: cans * can,
    leftoverLitres: cans * can - totalLitres,
    cost: price > 0 ? cans * can * price : 0,
    bareWood: Boolean(bareWood),
  };
}
