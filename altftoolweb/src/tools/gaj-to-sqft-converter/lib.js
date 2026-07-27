/**
 * Gaj and the other north Indian plot units.
 *
 * "Gaj" in a property listing means a square yard. That part is fixed: 1 yd = 3 ft, so
 * 1 gaj = 9 sq ft exactly, and since 1 ft = 0.3048 m by definition, 1 gaj = 0.83612736 sq m
 * exactly.
 *
 * The units built on top of it are also fixed ratios:
 *   1 marla = 30.25 sq yd = 272.25 sq ft   (1/160 of an acre)
 *   1 kanal = 20 marla    = 605 sq yd = 5,445 sq ft   (1/8 of an acre)
 *   1 biswa = 151.25 sq yd = 1,361.25 sq ft (1/20 of a pucca bigha)
 *   1 acre  = 4,840 sq yd = 43,560 sq ft
 *
 * Bigha is the exception: it is NOT standardised and its size depends on the state and on
 * whether the record uses a pucca or kaccha bigha. Those variants are listed separately,
 * each defined by the smaller unit it is built from, and must be checked against the
 * actual land record.
 */

/** Exact by definition. */
export const M_PER_FT = 0.3048;
export const SQM_PER_SQFT = M_PER_FT * M_PER_FT; // 0.09290304
export const SQFT_PER_GAJ = 9; // 1 sq yd = 3 ft x 3 ft
export const SQFT_PER_MARLA = 272.25; // 30.25 sq yd
export const MARLA_PER_KANAL = 20;
export const SQFT_PER_KANAL = SQFT_PER_MARLA * MARLA_PER_KANAL; // 5,445
export const SQFT_PER_BISWA = 1361.25; // 151.25 sq yd, 1/20 of a pucca bigha
export const SQFT_PER_ACRE = 43560;
export const SQFT_PER_HECTARE = 10000 / SQM_PER_SQFT; // 107,639.10

/** Every unit as its size in square feet, so one number drives every conversion. */
export const PLOT_UNITS = [
  { id: "gaj", label: "Gaj (square yard)", short: "gaj", sqft: SQFT_PER_GAJ },
  { id: "sqft", label: "Square feet", short: "sq ft", sqft: 1 },
  { id: "sqm", label: "Square metres", short: "sq m", sqft: 1 / SQM_PER_SQFT },
  { id: "biswa", label: "Biswa (1/20 pucca bigha)", short: "biswa", sqft: SQFT_PER_BISWA },
  { id: "marla", label: "Marla (30.25 sq yd)", short: "marla", sqft: SQFT_PER_MARLA },
  { id: "kanal", label: "Kanal (20 marla)", short: "kanal", sqft: SQFT_PER_KANAL },
  { id: "acre", label: "Acre", short: "acre", sqft: SQFT_PER_ACRE },
  { id: "hectare", label: "Hectare", short: "ha", sqft: SQFT_PER_HECTARE },
];

/**
 * Bigha is a local unit. Each entry states the composition it comes from so the number can
 * be checked, and none of them should be used in place of the figure in the land record.
 */
export const BIGHA_VARIANTS = [
  { id: "up-pucca", label: "Uttar Pradesh, pucca bigha (20 biswa of 151.25 sq yd)", sqft: 27225 },
  { id: "up-kaccha", label: "Uttar Pradesh, kaccha bigha (one third of a pucca bigha)", sqft: 9075 },
  { id: "rajasthan-pucca", label: "Rajasthan, pucca bigha (3,025 sq yd)", sqft: 27225 },
  { id: "bihar", label: "Bihar, bigha (20 katha of 1,361.25 sq ft)", sqft: 27225 },
  { id: "west-bengal", label: "West Bengal, bigha (20 katha of 720 sq ft)", sqft: 14400 },
  { id: "assam", label: "Assam, bigha (5 katha of 2,880 sq ft)", sqft: 14400 },
];

export const LENGTH_UNITS = [
  { id: "ft", label: "Feet", sqftPerUnitSquared: 1 },
  { id: "yd", label: "Yards (gaj)", sqftPerUnitSquared: 9 },
  { id: "m", label: "Metres", sqftPerUnitSquared: 1 / SQM_PER_SQFT },
];

/** Sanity bound: about 100 sq km, far larger than any single plot. */
export const MAX_SQFT = 1.1e9;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const byId = (list, id) => list.find((item) => item.id === id);

/**
 * @param {object} input
 * @param {"area"|"dimensions"} [input.mode]
 * @param {number} input.value       area value when mode is "area"
 * @param {string} input.unit        id from PLOT_UNITS
 * @param {number} [input.length]    plot length when mode is "dimensions"
 * @param {number} [input.width]     plot width when mode is "dimensions"
 * @param {string} [input.lengthUnit] id from LENGTH_UNITS
 * @param {number} [input.rate]      price per unit of rateUnit
 * @param {string} [input.rateUnit]  id from PLOT_UNITS
 * @returns {{error:string}|object}
 */
export function convertGaj({
  mode = "area",
  value,
  unit = "gaj",
  length,
  width,
  lengthUnit = "ft",
  rate = 0,
  rateUnit = "gaj",
}) {
  let sqft;

  if (mode === "dimensions") {
    const lu = byId(LENGTH_UNITS, lengthUnit);
    if (!lu) return { error: "Pick a valid unit for the plot dimensions." };
    if (!isNum(length) || !isNum(width)) return { error: "Enter a number for both length and width." };
    if (length <= 0 || width <= 0) return { error: "Length and width must be greater than zero." };
    sqft = length * width * lu.sqftPerUnitSquared;
  } else {
    const pu = byId(PLOT_UNITS, unit);
    if (!pu) return { error: "Pick a valid unit." };
    if (!isNum(value)) return { error: "Enter a number to convert." };
    if (value <= 0) return { error: "Area must be greater than zero." };
    sqft = value * pu.sqft;
  }

  if (!isNum(sqft) || sqft > MAX_SQFT) {
    return { error: "That area is larger than any plot - check the number and the unit." };
  }

  const areas = {};
  PLOT_UNITS.forEach((pu) => {
    areas[pu.id] = sqft / pu.sqft;
  });

  const bighas = BIGHA_VARIANTS.map((variant) => ({
    id: variant.id,
    label: variant.label,
    sqftPerBigha: variant.sqft,
    bighas: sqft / variant.sqft,
  }));

  let pricing = null;
  if (isNum(rate) && rate > 0) {
    const ru = byId(PLOT_UNITS, rateUnit);
    if (!ru) return { error: "Pick a valid unit for the rate." };
    const total = areas[ru.id] * rate;
    const perUnit = {};
    PLOT_UNITS.forEach((pu) => {
      perUnit[pu.id] = total / areas[pu.id];
    });
    pricing = { total, perUnit, rateUnit: ru.id };
  } else if (isNum(rate) && rate < 0) {
    return { error: "Rate cannot be negative." };
  }

  return { sqft, areas, bighas, pricing };
}

/**
 * The other side of a rectangular plot when you know its area and one side.
 * @returns {{error:string}|{otherSideFt:number}}
 */
export function otherSide({ sqft, sideFt }) {
  if (!isNum(sqft) || !isNum(sideFt)) return { error: "Enter a number for the area and the known side." };
  if (sideFt <= 0) return { error: "The known side must be greater than zero." };
  if (sqft <= 0) return { error: "Area must be greater than zero." };
  return { otherSideFt: sqft / sideFt };
}
