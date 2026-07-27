/**
 * Grass seed quantity for a lawn.
 *
 *   seedGrams = areaM2 x adjustedRate x (1 + wastage)
 *   adjustedRate = baseRate x purpose factor x (REFERENCE_PLS / actualPLS)
 *   actualPLS   = purity% x germination%   ("pure live seed", from the seed label)
 *
 * Published sowing rates are quoted in pounds per 1000 sq ft for bulk seed of normal
 * label quality. 1 lb/1000 sq ft = 453.592 g / 92.903 m2 = 4.883 g/m2, and every rate
 * below is that conversion of the standard extension-service range for the species.
 */

/** 1 lb per 1000 sq ft expressed in grams per square metre. */
export const LB_PER_1000SQFT_TO_G_PER_M2 = 453.59237 / 92.90304;

/**
 * Pure live seed the published bulk rates implicitly assume: about 95-98% purity
 * multiplied by about 85% germination. Seed better than this needs proportionally less.
 */
export const REFERENCE_PLS = 0.8;

/** Area unit conversions to square metres (international foot and yard). */
export const AREA_UNITS = [
  { value: "m2", label: "Square metres (m²)", toM2: 1 },
  { value: "sqft", label: "Square feet (sq ft)", toM2: 0.09290304 },
  { value: "sqyd", label: "Square yards / gaj", toM2: 0.83612736 },
  { value: "acre", label: "Acres", toM2: 4046.8564224 },
];

/**
 * Base new-lawn sowing rate in g/m2, and seeds per gram.
 * Rates are the mid-point of the standard lb/1000 sq ft range for each species;
 * seed counts are the usual published seeds-per-pound figures divided by 453.59.
 */
export const GRASS_TYPES = [
  { value: "ryegrass", label: "Perennial ryegrass", rate: 35, seedsPerGram: 500, lbPer1000: "7–9" },
  { value: "tallfescue", label: "Tall fescue", rate: 35, seedsPerGram: 500, lbPer1000: "6–8" },
  { value: "finefescue", label: "Fine / creeping fescue", rate: 22, seedsPerGram: 1000, lbPer1000: "4–5" },
  { value: "bluegrass", label: "Kentucky bluegrass", rate: 15, seedsPerGram: 4400, lbPer1000: "2–3" },
  { value: "bermuda", label: "Bermuda / doob grass (hulled)", rate: 7, seedsPerGram: 4400, lbPer1000: "1–2" },
  { value: "zoysia", label: "Zoysia / Korean grass", rate: 7, seedsPerGram: 2600, lbPer1000: "1–2" },
  { value: "bahia", label: "Bahia grass", rate: 35, seedsPerGram: 600, lbPer1000: "5–10" },
  { value: "centipede", label: "Centipede grass", rate: 2, seedsPerGram: 9900, lbPer1000: "0.25–0.5" },
];

/**
 * Purpose multiplier on the new-lawn rate. Overseeding an existing sward uses about
 * half the rate because established plants already occupy most of the ground; patch
 * repair on bare soil is sown slightly heavy to out-compete weeds.
 */
export const PURPOSES = [
  { value: "new", label: "New lawn on bare soil", factor: 1 },
  { value: "overseed", label: "Overseeding an existing lawn", factor: 0.5 },
  { value: "repair", label: "Patch repair on bare spots", factor: 1.25 },
];

/** Sensible bound on wastage from spreader spill, edges and birds. */
export const MAX_WASTAGE_PCT = 50;

const round = (value, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const findOption = (options, value) => options.find((option) => option.value === value) || null;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

/**
 * @param {object} input
 * @param {number|string} input.area Lawn area in the given unit.
 * @param {string} [input.areaUnit] One of AREA_UNITS values.
 * @param {string} [input.grass] One of GRASS_TYPES values.
 * @param {string} [input.purpose] One of PURPOSES values.
 * @param {number|string} [input.purityPct] Purity from the seed label, %.
 * @param {number|string} [input.germinationPct] Germination from the seed label, %.
 * @param {number|string} [input.wastagePct] Spill and edge allowance, %.
 * @param {number|string} [input.bagKg] Bag size the seed is sold in, kg.
 * @param {number|string} [input.pricePerKg] Seed price per kg, for the cost line.
 */
export function computeLawnSeed({
  area,
  areaUnit = "m2",
  grass = "ryegrass",
  purpose = "new",
  purityPct = 98,
  germinationPct = 85,
  wastagePct = 10,
  bagKg = 5,
  pricePerKg = 0,
} = {}) {
  const unit = findOption(AREA_UNITS, areaUnit);
  const species = findOption(GRASS_TYPES, grass);
  const use = findOption(PURPOSES, purpose);
  if (!unit || !species || !use) {
    return { error: "Choose a valid area unit, grass type and sowing purpose." };
  }

  const areaValue = toNumber(area);
  const purity = toNumber(purityPct);
  const germination = toNumber(germinationPct);
  const wastage = toNumber(wastagePct);
  const bag = toNumber(bagKg);
  const price = toNumber(pricePerKg);

  if ([areaValue, purity, germination, wastage, bag, price].some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (!(areaValue > 0)) {
    return { error: "Enter a lawn area greater than zero." };
  }
  if (purity <= 0 || purity > 100) {
    return { error: "Seed purity must be between 1% and 100%." };
  }
  if (germination <= 0 || germination > 100) {
    return { error: "Germination must be between 1% and 100% — check the seed label." };
  }
  if (wastage < 0 || wastage > MAX_WASTAGE_PCT) {
    return { error: `Wastage should be between 0% and ${MAX_WASTAGE_PCT}%.` };
  }
  if (!(bag > 0)) {
    return { error: "Bag size must be greater than zero." };
  }
  if (price < 0) {
    return { error: "Seed price cannot be negative." };
  }

  const areaM2 = areaValue * unit.toM2;
  if (areaM2 > 400000) {
    return { error: "That is over 100 acres — this tool is built for lawns, not farm-scale sowing." };
  }

  const pls = (purity / 100) * (germination / 100);
  const plsFactor = REFERENCE_PLS / pls;

  const baseRate = species.rate * use.factor;
  const adjustedRate = baseRate * plsFactor;

  const seedGramsBeforeWastage = areaM2 * adjustedRate;
  const seedGrams = seedGramsBeforeWastage * (1 + wastage / 100);
  const seedKg = seedGrams / 1000;

  const bagsNeeded = Math.ceil(seedKg / bag);
  const totalCost = seedKg * price;

  const seedsPerM2 = adjustedRate * species.seedsPerGram;
  const seedsPerCm2 = seedsPerM2 / 10000;

  const notes = [];
  if (pls < 0.6) {
    notes.push(
      `Pure live seed is only ${round(pls * 100)}% — over a third of the bag will never grow. Fresher seed is usually cheaper than sowing extra.`,
    );
  }
  if (use.value === "overseed") {
    notes.push("Scalp the lawn low and rake the surface first, or overseeded seed sits on thatch and never touches soil.");
  }
  if (species.value === "bermuda" || species.value === "zoysia") {
    notes.push("Warm-season seed needs soil above about 20°C to germinate, so sow after the ground has warmed.");
  }
  notes.push("Spread half the seed walking north-south and half east-west to avoid stripes.");

  return {
    areaM2: round(areaM2, 1),
    areaSqft: round(areaM2 / 0.09290304, 1),
    speciesLabel: species.label,
    purposeLabel: use.label,
    baseRate: round(species.rate, 2),
    baseRateLbPer1000: species.lbPer1000,
    purposeFactor: use.factor,
    plsPct: round(pls * 100, 1),
    plsFactor: round(plsFactor, 3),
    adjustedRate: round(adjustedRate, 2),
    seedGramsBeforeWastage: round(seedGramsBeforeWastage),
    wastagePct: round(wastage, 1),
    seedGrams: round(seedGrams),
    seedKg: round(seedKg, 2),
    bagKg: round(bag, 2),
    bagsNeeded,
    totalCost: round(totalCost),
    seedsPerM2: round(seedsPerM2),
    seedsPerCm2: round(seedsPerCm2, 1),
    notes,
  };
}
