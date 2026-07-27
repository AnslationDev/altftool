/**
 * Turf / sod roll estimator.
 *
 * Rule implemented: order area = measured lawn area x (1 + trim wastage %),
 * rolls = ceil(order area / coverage of one roll). Turf is sold whole, never cut
 * to fit at the depot, so the roll count is always rounded up.
 */

// A cut turf roll in the UK, EU and India is standardised at 1.64 m x 0.61 m,
// which lays exactly 1 square metre of grass.
export const STANDARD_ROLL_M2 = 1;

// A "big roll" from a turf farm is typically 10 m x 0.61 m = 6.1 m2.
export const BIG_ROLL_M2 = 6.1;

// A US sod slab is cut at 16 in x 24 in = 384 sq in = 2.667 sq ft.
export const US_SLAB_SQFT = (16 * 24) / 144;

// A US mini sod roll is cut at 2 ft x 5 ft = 10 sq ft.
export const US_ROLL_SQFT = 10;

// 1 ft = 0.3048 m exactly (international foot), so 1 m2 = 10.7639... sq ft.
export const SQFT_PER_SQM = 1 / (0.3048 * 0.3048);

export const ROLL_PRESETS = [
  { id: "metric-roll", label: "Turf roll 1.64 m x 0.61 m", unit: "m", coverage: STANDARD_ROLL_M2 },
  { id: "big-roll", label: "Big roll 10 m x 0.61 m", unit: "m", coverage: BIG_ROLL_M2 },
  { id: "us-slab", label: 'US sod slab 16" x 24"', unit: "ft", coverage: US_SLAB_SQFT },
  { id: "us-roll", label: "US sod roll 2 ft x 5 ft", unit: "ft", coverage: US_ROLL_SQFT },
];

// Turf growers advise ordering extra to cover cutting, shaping and edge trim.
// 5% for straight edges, ~10% once beds and curves are involved, ~15% for
// slopes and heavily cut-up shapes.
export const WASTAGE_PRESETS = [
  { id: "square", label: "Square or rectangular lawn", pct: 5 },
  { id: "curved", label: "Curved edges, beds or a path", pct: 10 },
  { id: "complex", label: "Slopes, many cut-outs, awkward shape", pct: 15 },
];

// Turf is delivered palletised; a common pallet load is 50 one-square-metre rolls.
export const DEFAULT_ROLLS_PER_PALLET = 50;

// Sanity ceiling so a mistyped figure cannot produce a meaningless order.
export const MAX_AREA = 100000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @returns {{error:string}|{netArea:number,orderArea:number,rolls:number,coveredArea:number,
 * surplusArea:number,pallets:number,materialCost:number,labourCost:number,deliveryCost:number,
 * totalCost:number,costPerUnitArea:number,altArea:number,unit:string,areaUnit:string,
 * altAreaUnit:string,wastageArea:number}}
 */
export function computeTurfRolls({
  shape = "rectangle",
  length = 0,
  width = 0,
  area = 0,
  unit = "m",
  rollCoverage = STANDARD_ROLL_M2,
  wastagePct = 5,
  pricePerRoll = 0,
  rollsPerPallet = DEFAULT_ROLLS_PER_PALLET,
  deliveryCost = 0,
  labourRate = 0,
} = {}) {
  if (unit !== "m" && unit !== "ft") {
    return { error: "Choose either metres or feet as the measurement unit." };
  }

  const numbers = [length, width, area, rollCoverage, wastagePct, pricePerRoll, rollsPerPallet, deliveryCost, labourRate];
  if (!numbers.every(isNum)) {
    return { error: "Enter a valid number in every field." };
  }

  let netArea;
  if (shape === "rectangle") {
    if (!(length > 0) || !(width > 0)) {
      return { error: "Lawn length and width must both be greater than zero." };
    }
    netArea = length * width;
  } else {
    if (!(area > 0)) {
      return { error: "Lawn area must be greater than zero." };
    }
    netArea = area;
  }

  if (netArea > MAX_AREA) {
    return { error: `That is more than ${MAX_AREA.toLocaleString("en-US")} sq ${unit} — check the measurements.` };
  }
  if (!(rollCoverage > 0)) {
    return { error: "Roll coverage must be greater than zero." };
  }
  if (wastagePct < 0 || wastagePct > 100) {
    return { error: "Trim wastage should be between 0% and 100%." };
  }
  if (pricePerRoll < 0 || deliveryCost < 0 || labourRate < 0) {
    return { error: "Prices cannot be negative." };
  }
  if (!(rollsPerPallet >= 1)) {
    return { error: "A pallet must hold at least one roll." };
  }

  const orderArea = netArea * (1 + wastagePct / 100);
  const rolls = Math.ceil(orderArea / rollCoverage);
  const coveredArea = rolls * rollCoverage;
  const surplusArea = coveredArea - netArea;
  const pallets = Math.ceil(rolls / Math.floor(rollsPerPallet));

  const materialCost = rolls * pricePerRoll;
  const labourCost = netArea * labourRate;
  const totalCost = materialCost + labourCost + deliveryCost;
  const costPerUnitArea = netArea > 0 ? totalCost / netArea : 0;

  const areaUnit = unit === "m" ? "m²" : "sq ft";
  const altAreaUnit = unit === "m" ? "sq ft" : "m²";
  const altArea = unit === "m" ? netArea * SQFT_PER_SQM : netArea / SQFT_PER_SQM;

  return {
    netArea,
    orderArea,
    wastageArea: orderArea - netArea,
    rolls,
    coveredArea,
    surplusArea,
    pallets,
    materialCost,
    labourCost,
    deliveryCost,
    totalCost,
    costPerUnitArea,
    altArea,
    unit,
    areaUnit,
    altAreaUnit,
  };
}
