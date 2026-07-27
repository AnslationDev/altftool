/**
 * Area conversions between square feet, square metres and the other units a property
 * listing mixes into the same page.
 *
 * Everything below is derived from two exact definitions rather than typed in:
 *   1 ft = 0.3048 m exactly (international yard and pound agreement, 1959)
 *   1 yd = 3 ft, 1 in = 1/12 ft, 1 acre = 43,560 sq ft, 1 hectare = 10,000 sq m
 * So 1 sq ft = 0.3048^2 = 0.09290304 sq m exactly, and 1 sq yd = 9 sq ft = 0.83612736 sq m.
 */

/** Exact: 1 ft = 0.3048 m. */
export const M_PER_FT = 0.3048;
export const SQM_PER_SQFT = M_PER_FT * M_PER_FT; // 0.09290304
export const SQFT_PER_SQYD = 9; // 1 yd = 3 ft
export const SQFT_PER_ACRE = 43560; // 1 acre = 1 chain x 1 furlong = 66 ft x 660 ft
export const SQM_PER_HECTARE = 10000; // 1 ha = 100 m x 100 m

/** Every unit is stored as its size in square metres, so one factor drives all conversions. */
export const AREA_UNITS = [
  { id: "sqft", label: "Square feet (sq ft)", short: "sq ft", sqm: SQM_PER_SQFT },
  { id: "sqm", label: "Square metres (sq m)", short: "sq m", sqm: 1 },
  { id: "sqyd", label: "Square yards / gaj", short: "sq yd", sqm: SQFT_PER_SQYD * SQM_PER_SQFT },
  { id: "sqin", label: "Square inches", short: "sq in", sqm: SQM_PER_SQFT / 144 },
  { id: "are", label: "Are (100 sq m)", short: "are", sqm: 100 },
  { id: "acre", label: "Acre", short: "acre", sqm: SQFT_PER_ACRE * SQM_PER_SQFT },
  { id: "hectare", label: "Hectare", short: "ha", sqm: SQM_PER_HECTARE },
];

export const LENGTH_UNITS = [
  { id: "ft", label: "Feet", sqmPerUnitSquared: SQM_PER_SQFT },
  { id: "m", label: "Metres", sqmPerUnitSquared: 1 },
  { id: "yd", label: "Yards", sqmPerUnitSquared: SQFT_PER_SQYD * SQM_PER_SQFT },
];

/** Sanity bound: a hair over the size of Rajasthan, so any real plot passes. */
export const MAX_SQM = 1e12;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const unitById = (list, id) => list.find((u) => u.id === id);

/**
 * Convert an area, plus optionally price it.
 *
 * @param {object} input
 * @param {"area"|"dimensions"} [input.mode]
 * @param {number} input.value        area, when mode is "area"
 * @param {string} input.unit         id from AREA_UNITS, when mode is "area"
 * @param {number} [input.length]     plot length, when mode is "dimensions"
 * @param {number} [input.width]      plot width, when mode is "dimensions"
 * @param {string} [input.lengthUnit] id from LENGTH_UNITS
 * @param {number} [input.rate]       price per unit of rateUnit; 0 or omitted to skip pricing
 * @param {string} [input.rateUnit]   id from AREA_UNITS
 * @returns {{error:string}|object}
 */
export function convertArea({
  mode = "area",
  value,
  unit = "sqft",
  length,
  width,
  lengthUnit = "ft",
  rate = 0,
  rateUnit = "sqft",
}) {
  let sqm;

  if (mode === "dimensions") {
    const lu = unitById(LENGTH_UNITS, lengthUnit);
    if (!lu) return { error: "Pick a valid unit for the plot dimensions." };
    if (!isNum(length) || !isNum(width)) return { error: "Enter a number for both length and width." };
    if (length <= 0 || width <= 0) return { error: "Length and width must be greater than zero." };
    sqm = length * width * lu.sqmPerUnitSquared;
  } else {
    const au = unitById(AREA_UNITS, unit);
    if (!au) return { error: "Pick a valid area unit." };
    if (!isNum(value)) return { error: "Enter a number to convert." };
    if (value <= 0) return { error: "Area must be greater than zero." };
    sqm = value * au.sqm;
  }

  if (!isNum(sqm) || sqm > MAX_SQM) {
    return { error: "That area is too large to be a plot - check the number and the unit." };
  }

  const areas = {};
  AREA_UNITS.forEach((au) => {
    areas[au.id] = sqm / au.sqm;
  });

  let pricing = null;
  if (isNum(rate) && rate > 0) {
    const ru = unitById(AREA_UNITS, rateUnit);
    if (!ru) return { error: "Pick a valid unit for the rate." };
    const total = areas[ru.id] * rate;
    const perUnit = {};
    AREA_UNITS.forEach((au) => {
      // Rate per unit is the total spread over the area measured in that unit.
      perUnit[au.id] = total / areas[au.id];
    });
    pricing = { total, perUnit, rateUnit: ru.id, rate };
  } else if (isNum(rate) && rate < 0) {
    return { error: "Rate cannot be negative." };
  }

  return { sqm, areas, pricing };
}
