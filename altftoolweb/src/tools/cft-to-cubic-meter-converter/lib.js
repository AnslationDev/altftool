/**
 * Volume conversions for construction materials, plus the weight that volume carries.
 *
 * Exact definitions used:
 *   1 ft = 0.3048 m, so 1 cubic foot = 0.3048^3 = 0.028316846592 cubic metres exactly
 *   1 cubic metre = 1,000 litres
 *   1 cubic yard = 27 cubic feet
 *   1 brass = 100 cubic feet - the unit sand, aggregate and rubble are sold in across
 *             western India; it is a volume, not a weight
 *
 * Weight comes from bulk density: mass = volume x density. The densities offered are the
 * unit weights listed in IS 875 (Part 1), the Indian code of practice for dead loads, and
 * the standard 1,440 kg/m3 for cement that gives the familiar 50 kg bag of 0.0347 m3.
 * Real site material varies with moisture and grading, so treat weights as estimates and
 * weigh the load if you are paying by the tonne.
 */

/** Exact by definition. */
export const M_PER_FT = 0.3048;
export const CBM_PER_CFT = M_PER_FT ** 3; // 0.028316846592
export const CFT_PER_BRASS = 100;
export const CFT_PER_CUBIC_YARD = 27;
export const LITRES_PER_CBM = 1000;
export const CEMENT_BAG_KG = 50;

/** Each unit as its size in cubic metres. */
export const VOLUME_UNITS = [
  { id: "cft", label: "Cubic feet (CFT)", short: "cft", cbm: CBM_PER_CFT },
  { id: "cbm", label: "Cubic metres (CBM)", short: "cu m", cbm: 1 },
  { id: "litre", label: "Litres", short: "L", cbm: 1 / LITRES_PER_CBM },
  { id: "brass", label: "Brass (100 cft)", short: "brass", cbm: CFT_PER_BRASS * CBM_PER_CFT },
  { id: "cuyd", label: "Cubic yards", short: "cu yd", cbm: CFT_PER_CUBIC_YARD * CBM_PER_CFT },
  { id: "cuin", label: "Cubic inches", short: "cu in", cbm: CBM_PER_CFT / 1728 },
];

/**
 * Bulk densities in kg per cubic metre. The building materials are the unit weights given
 * in IS 875 (Part 1); cement at 1,440 is the figure the 50 kg bag volume is based on.
 */
export const MATERIALS = [
  { id: "sand", label: "River sand (dry)", density: 1600 },
  { id: "aggregate", label: "Coarse aggregate, 20 mm", density: 1550 },
  { id: "cement", label: "Cement (loose)", density: 1440 },
  { id: "soil", label: "Earth / excavated soil", density: 1700 },
  { id: "brickwork", label: "Brick masonry", density: 1920 },
  { id: "concrete", label: "Plain cement concrete", density: 2400 },
  { id: "rcc", label: "Reinforced cement concrete", density: 2500 },
  { id: "water", label: "Water", density: 1000 },
];

export const LENGTH_UNITS = [
  { id: "ft", label: "Feet", cbmPerUnitCubed: CBM_PER_CFT },
  { id: "m", label: "Metres", cbmPerUnitCubed: 1 },
  { id: "in", label: "Inches", cbmPerUnitCubed: CBM_PER_CFT / 1728 },
];

/** Sanity bound: 1 million cubic metres, far beyond any single delivery. */
export const MAX_CBM = 1e6;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const byId = (list, id) => list.find((item) => item.id === id);

/**
 * @param {object} input
 * @param {"volume"|"dimensions"} [input.mode]
 * @param {number} input.value          volume when mode is "volume"
 * @param {string} input.unit           id from VOLUME_UNITS
 * @param {number} [input.length]       when mode is "dimensions"
 * @param {number} [input.width]
 * @param {number} [input.height]
 * @param {string} [input.lengthUnit]   id from LENGTH_UNITS
 * @param {number} [input.density]      kg per cubic metre; 0 to skip the weight
 * @param {number} [input.truckCapacityCft] tipper or truck capacity in cubic feet
 * @param {number} [input.rate]         price per unit of rateUnit
 * @param {string} [input.rateUnit]     id from VOLUME_UNITS
 * @returns {{error:string}|object}
 */
export function convertVolume({
  mode = "volume",
  value,
  unit = "cft",
  length,
  width,
  height,
  lengthUnit = "ft",
  density = 1600,
  truckCapacityCft = 100,
  rate = 0,
  rateUnit = "cft",
}) {
  let cbm;

  if (mode === "dimensions") {
    const lu = byId(LENGTH_UNITS, lengthUnit);
    if (!lu) return { error: "Pick a valid unit for the dimensions." };
    if (![length, width, height].every(isNum)) {
      return { error: "Enter a number for length, width and height." };
    }
    if (length <= 0 || width <= 0 || height <= 0) {
      return { error: "Length, width and height must all be greater than zero." };
    }
    cbm = length * width * height * lu.cbmPerUnitCubed;
  } else {
    const vu = byId(VOLUME_UNITS, unit);
    if (!vu) return { error: "Pick a valid volume unit." };
    if (!isNum(value)) return { error: "Enter a number to convert." };
    if (value <= 0) return { error: "Volume must be greater than zero." };
    cbm = value * vu.cbm;
  }

  if (!isNum(cbm) || cbm > MAX_CBM) {
    return { error: "That volume is far larger than any delivery - check the number and the unit." };
  }

  const volumes = {};
  VOLUME_UNITS.forEach((vu) => {
    volumes[vu.id] = cbm / vu.cbm;
  });

  if (!isNum(density) || density < 0) return { error: "Density cannot be negative." };
  const weightKg = density > 0 ? cbm * density : null;
  const weightTonnes = weightKg === null ? null : weightKg / 1000;
  const cementBags = weightKg === null ? null : weightKg / CEMENT_BAG_KG;

  if (!isNum(truckCapacityCft) || truckCapacityCft < 0) {
    return { error: "Truck capacity cannot be negative." };
  }
  const truckLoads = truckCapacityCft > 0 ? volumes.cft / truckCapacityCft : null;

  let pricing = null;
  if (isNum(rate) && rate > 0) {
    const ru = byId(VOLUME_UNITS, rateUnit);
    if (!ru) return { error: "Pick a valid unit for the rate." };
    const total = volumes[ru.id] * rate;
    const perUnit = {};
    VOLUME_UNITS.forEach((vu) => {
      perUnit[vu.id] = total / volumes[vu.id];
    });
    pricing = {
      total,
      perUnit,
      rateUnit: ru.id,
      perTonne: weightTonnes && weightTonnes > 0 ? total / weightTonnes : null,
    };
  } else if (isNum(rate) && rate < 0) {
    return { error: "Rate cannot be negative." };
  }

  return {
    cbm,
    volumes,
    weightKg,
    weightTonnes,
    cementBags,
    truckLoads,
    truckLoadsRoundedUp: truckLoads === null ? null : Math.ceil(truckLoads),
    pricing,
  };
}
