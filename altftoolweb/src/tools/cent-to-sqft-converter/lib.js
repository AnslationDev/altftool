/**
 * South Indian land units.
 *
 * The cent is the unit Kerala, Tamil Nadu, Karnataka and Andhra Pradesh land records are
 * usually kept in, and it is defined off the acre, not invented locally:
 *   1 cent    = 1/100 acre = 435.6 sq ft = 40.4685642 sq m
 *   1 acre    = 43,560 sq ft (66 ft x 660 ft)
 *   1 guntha  = 1/40 acre = 1,089 sq ft = 2.5 cent
 *   1 ground  = 2,400 sq ft (Chennai and much of Tamil Nadu) = 5.509 cent
 *   1 ankanam = 8 sq yd = 72 sq ft (Andhra Pradesh and parts of Karnataka)
 *   1 are     = 100 sq m = 1,076.39 sq ft; 100 are = 1 hectare
 *
 * The square foot to square metre link is exact: 1 ft = 0.3048 m by definition, so
 * 1 sq ft = 0.09290304 sq m.
 */

export const M_PER_FT = 0.3048;
export const SQM_PER_SQFT = M_PER_FT * M_PER_FT; // 0.09290304
export const SQFT_PER_ACRE = 43560;
export const CENTS_PER_ACRE = 100;
export const SQFT_PER_CENT = SQFT_PER_ACRE / CENTS_PER_ACRE; // 435.6
export const GUNTHAS_PER_ACRE = 40;
export const SQFT_PER_GUNTHA = SQFT_PER_ACRE / GUNTHAS_PER_ACRE; // 1,089
export const SQFT_PER_GROUND = 2400; // Chennai ground
export const SQFT_PER_ANKANAM = 72; // 8 sq yd
export const SQFT_PER_ARE = 100 / SQM_PER_SQFT; // 1,076.39
export const SQFT_PER_HECTARE = 10000 / SQM_PER_SQFT; // 107,639.10

/** Each unit stored as its size in square feet. */
export const LAND_UNITS = [
  { id: "cent", label: "Cent (1/100 acre)", short: "cent", sqft: SQFT_PER_CENT },
  { id: "sqft", label: "Square feet", short: "sq ft", sqft: 1 },
  { id: "sqm", label: "Square metres", short: "sq m", sqft: 1 / SQM_PER_SQFT },
  { id: "sqyd", label: "Square yards", short: "sq yd", sqft: 9 },
  { id: "ankanam", label: "Ankanam (8 sq yd)", short: "ankanam", sqft: SQFT_PER_ANKANAM },
  { id: "ground", label: "Ground (2,400 sq ft)", short: "ground", sqft: SQFT_PER_GROUND },
  { id: "guntha", label: "Guntha (1/40 acre)", short: "guntha", sqft: SQFT_PER_GUNTHA },
  { id: "are", label: "Are (100 sq m)", short: "are", sqft: SQFT_PER_ARE },
  { id: "acre", label: "Acre", short: "acre", sqft: SQFT_PER_ACRE },
  { id: "hectare", label: "Hectare", short: "ha", sqft: SQFT_PER_HECTARE },
];

export const LENGTH_UNITS = [
  { id: "ft", label: "Feet", sqftPerUnitSquared: 1 },
  { id: "m", label: "Metres", sqftPerUnitSquared: 1 / SQM_PER_SQFT },
];

/** Sanity bound: about 100 sq km. */
export const MAX_SQFT = 1.1e9;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const byId = (list, id) => list.find((item) => item.id === id);

/**
 * @param {object} input
 * @param {"area"|"dimensions"} [input.mode]
 * @param {number} input.value
 * @param {string} input.unit         id from LAND_UNITS
 * @param {number} [input.length]
 * @param {number} [input.width]
 * @param {string} [input.lengthUnit] id from LENGTH_UNITS
 * @param {number} [input.rate]       price per unit of rateUnit
 * @param {string} [input.rateUnit]   id from LAND_UNITS
 * @returns {{error:string}|object}
 */
export function convertLand({
  mode = "area",
  value,
  unit = "cent",
  length,
  width,
  lengthUnit = "ft",
  rate = 0,
  rateUnit = "cent",
}) {
  let sqft;

  if (mode === "dimensions") {
    const lu = byId(LENGTH_UNITS, lengthUnit);
    if (!lu) return { error: "Pick a valid unit for the dimensions." };
    if (!isNum(length) || !isNum(width)) return { error: "Enter a number for both length and width." };
    if (length <= 0 || width <= 0) return { error: "Length and width must be greater than zero." };
    sqft = length * width * lu.sqftPerUnitSquared;
  } else {
    const lu = byId(LAND_UNITS, unit);
    if (!lu) return { error: "Pick a valid land unit." };
    if (!isNum(value)) return { error: "Enter a number to convert." };
    if (value <= 0) return { error: "Area must be greater than zero." };
    sqft = value * lu.sqft;
  }

  if (!isNum(sqft) || sqft > MAX_SQFT) {
    return { error: "That area is larger than any land parcel here - check the number and the unit." };
  }

  const areas = {};
  LAND_UNITS.forEach((lu) => {
    areas[lu.id] = sqft / lu.sqft;
  });

  let pricing = null;
  if (isNum(rate) && rate > 0) {
    const ru = byId(LAND_UNITS, rateUnit);
    if (!ru) return { error: "Pick a valid unit for the rate." };
    const total = areas[ru.id] * rate;
    const perUnit = {};
    LAND_UNITS.forEach((lu) => {
      perUnit[lu.id] = total / areas[lu.id];
    });
    pricing = { total, perUnit, rateUnit: ru.id };
  } else if (isNum(rate) && rate < 0) {
    return { error: "Rate cannot be negative." };
  }

  return { sqft, areas, pricing };
}

/**
 * Split a parcel into equal shares - the arithmetic behind a partition deed.
 * @returns {{error:string}|{perShareSqft:number,perShareCent:number}}
 */
export function splitIntoShares({ sqft, shares }) {
  if (!isNum(sqft) || sqft <= 0) return { error: "Area must be greater than zero." };
  if (!Number.isInteger(shares) || shares < 1) return { error: "Number of shares must be a whole number of 1 or more." };
  const perShareSqft = sqft / shares;
  return { perShareSqft, perShareCent: perShareSqft / SQFT_PER_CENT };
}
