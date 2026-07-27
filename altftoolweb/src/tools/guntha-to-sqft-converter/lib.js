/**
 * Guntha and the units Maharashtra and Karnataka land records are written in.
 *
 * The guntha is defined off the acre, so its size is fixed and not regional:
 *   1 acre   = 40 guntha = 43,560 sq ft
 *   1 guntha = 1,089 sq ft = 121 sq yd = 101.17 sq m (33 ft x 33 ft)
 *   1 are    = 100 sq m; 100 are = 1 hectare = 10,000 sq m
 *
 * Revenue records themselves are metric. A Maharashtra 7/12 extract (satbara utara) and a
 * Karnataka RTC state area as hectare, are and square metre - the H-R-P columns, where P is
 * square metres, not "pole". This module converts that triple as well as any single unit.
 *
 * The square foot to square metre link is exact: 1 ft = 0.3048 m, so 1 sq ft = 0.09290304 sq m.
 */

export const M_PER_FT = 0.3048;
export const SQM_PER_SQFT = M_PER_FT * M_PER_FT; // 0.09290304
export const SQFT_PER_ACRE = 43560;
export const GUNTHAS_PER_ACRE = 40;
export const SQFT_PER_GUNTHA = SQFT_PER_ACRE / GUNTHAS_PER_ACRE; // 1,089 = 33 ft x 33 ft
export const SQM_PER_ARE = 100;
export const ARES_PER_HECTARE = 100;
export const SQM_PER_HECTARE = SQM_PER_ARE * ARES_PER_HECTARE; // 10,000

/** Each unit as its size in square metres, since the land records are metric. */
export const AREA_UNITS = [
  { id: "guntha", label: "Guntha (1/40 acre)", short: "guntha", sqm: SQFT_PER_GUNTHA * SQM_PER_SQFT },
  { id: "sqft", label: "Square feet", short: "sq ft", sqm: SQM_PER_SQFT },
  { id: "sqm", label: "Square metres", short: "sq m", sqm: 1 },
  { id: "sqyd", label: "Square yards", short: "sq yd", sqm: 9 * SQM_PER_SQFT },
  { id: "are", label: "Are (100 sq m)", short: "are", sqm: SQM_PER_ARE },
  { id: "acre", label: "Acre (40 guntha)", short: "acre", sqm: SQFT_PER_ACRE * SQM_PER_SQFT },
  { id: "hectare", label: "Hectare", short: "ha", sqm: SQM_PER_HECTARE },
  { id: "cent", label: "Cent (1/100 acre)", short: "cent", sqm: (SQFT_PER_ACRE / 100) * SQM_PER_SQFT },
];

/** Sanity bound: 100 sq km, larger than any single survey number. */
export const MAX_SQM = 1e8;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const byId = (id) => AREA_UNITS.find((u) => u.id === id);

/**
 * Convert an area given either as one unit or as a 7/12 style hectare-are-sqm triple.
 *
 * @param {object} input
 * @param {"single"|"hrp"} [input.mode]
 * @param {number} input.value      area when mode is "single"
 * @param {string} input.unit       id from AREA_UNITS
 * @param {number} [input.hectares] H column of the record
 * @param {number} [input.ares]     R column of the record
 * @param {number} [input.sqmPart]  P column of the record, in square metres
 * @param {number} [input.rate]     price per unit of rateUnit
 * @param {string} [input.rateUnit] id from AREA_UNITS
 * @returns {{error:string}|object}
 */
export function convertGuntha({
  mode = "single",
  value,
  unit = "guntha",
  hectares = 0,
  ares = 0,
  sqmPart = 0,
  rate = 0,
  rateUnit = "guntha",
}) {
  let sqm;

  if (mode === "hrp") {
    if (![hectares, ares, sqmPart].every(isNum)) {
      return { error: "Enter a number in each of the hectare, are and square metre boxes (use 0 where blank)." };
    }
    if (hectares < 0 || ares < 0 || sqmPart < 0) return { error: "Record areas cannot be negative." };
    if (ares >= ARES_PER_HECTARE) {
      return { error: "The are column runs 0 to 99 - 100 are is one hectare, so carry it over." };
    }
    if (sqmPart >= SQM_PER_ARE) {
      return { error: "The square metre column runs 0 to 99 - 100 sq m is one are, so carry it over." };
    }
    sqm = hectares * SQM_PER_HECTARE + ares * SQM_PER_ARE + sqmPart;
    if (sqm <= 0) return { error: "The recorded area works out to zero - check the H, R and P columns." };
  } else {
    const au = byId(unit);
    if (!au) return { error: "Pick a valid area unit." };
    if (!isNum(value)) return { error: "Enter a number to convert." };
    if (value <= 0) return { error: "Area must be greater than zero." };
    sqm = value * au.sqm;
  }

  if (!isNum(sqm) || sqm > MAX_SQM) {
    return { error: "That area is larger than any single survey number - check the figure and the unit." };
  }

  const areas = {};
  AREA_UNITS.forEach((au) => {
    areas[au.id] = sqm / au.sqm;
  });

  // The same area written back in the record's own H-R-P columns.
  const hPart = Math.floor(sqm / SQM_PER_HECTARE);
  const rPart = Math.floor((sqm - hPart * SQM_PER_HECTARE) / SQM_PER_ARE);
  const pPart = sqm - hPart * SQM_PER_HECTARE - rPart * SQM_PER_ARE;

  let pricing = null;
  if (isNum(rate) && rate > 0) {
    const ru = byId(rateUnit);
    if (!ru) return { error: "Pick a valid unit for the rate." };
    const total = areas[ru.id] * rate;
    const perUnit = {};
    AREA_UNITS.forEach((au) => {
      perUnit[au.id] = total / areas[au.id];
    });
    pricing = { total, perUnit, rateUnit: ru.id };
  } else if (isNum(rate) && rate < 0) {
    return { error: "Rate cannot be negative." };
  }

  return {
    sqm,
    areas,
    record: { hectares: hPart, ares: rPart, sqm: pPart },
    pricing,
  };
}

/**
 * Whole acres plus the leftover guntha, the way a deal is usually spoken about
 * ("two acre twelve guntha").
 * @returns {{error:string}|{acres:number,gunthas:number}}
 */
export function asAcresAndGunthas(totalGunthas) {
  if (!isNum(totalGunthas) || totalGunthas < 0) return { error: "Guntha count must be zero or more." };
  const acres = Math.floor(totalGunthas / GUNTHAS_PER_ACRE);
  return { acres, gunthas: totalGunthas - acres * GUNTHAS_PER_ACRE };
}
