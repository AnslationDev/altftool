/**
 * Blended (combined) mileage from a city / highway driving mix.
 *
 * The correct blend is fuel-weighted, not distance-weighted on the mileage
 * numbers. Over a distance D with a city share f:
 *   litres = D x f / city_kmpl + D x (1 - f) / highway_kmpl
 *   blended_kmpl = D / litres = 1 / (f / city_kmpl + (1 - f) / highway_kmpl)
 *
 * That is the harmonic mean weighted by distance share. Taking the plain
 * arithmetic mean of the two km/l figures always OVERSTATES real economy,
 * because the thirsty city kilometres consume a larger share of the fuel than
 * of the distance.
 */

/**
 * The US EPA combined label figure weights city and highway 55 / 45 by
 * distance, computed on the same harmonic (fuel) basis used here.
 */
export const EPA_CITY_SHARE = 0.55;

/** Upper sanity bound for road-vehicle mileage, km/l. */
export const MAX_KMPL = 200;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @param {object} input
 * @param {number} input.cityKmpl        mileage in stop-start city traffic
 * @param {number} input.highwayKmpl     mileage at steady highway cruise
 * @param {number} input.citySharePct    percentage of distance driven in the city (0-100)
 * @param {number} [input.monthlyKm]     distance driven per month, for cost figures
 * @param {number} [input.fuelPrice]     fuel price per litre
 * @returns {object} blended mileage and running cost, or { error }
 */
export function blendMileage({
  cityKmpl,
  highwayKmpl,
  citySharePct,
  monthlyKm = 0,
  fuelPrice = 0,
}) {
  if (![cityKmpl, highwayKmpl, citySharePct, monthlyKm, fuelPrice].every(isNum)) {
    return { error: "Enter a number in every field." };
  }
  if (cityKmpl <= 0 || highwayKmpl <= 0) {
    return { error: "City and highway mileage must both be greater than zero." };
  }
  if (cityKmpl > MAX_KMPL || highwayKmpl > MAX_KMPL) {
    return { error: `Mileage above ${MAX_KMPL} km/l is not realistic — check the figures.` };
  }
  if (citySharePct < 0 || citySharePct > 100) {
    return { error: "City share must be between 0% and 100% of your distance." };
  }
  if (monthlyKm < 0) return { error: "Monthly distance cannot be negative." };
  if (fuelPrice < 0) return { error: "Fuel price cannot be negative." };

  const cityShare = citySharePct / 100;
  const highwayShare = 1 - cityShare;

  const litresPerKm = cityShare / cityKmpl + highwayShare / highwayKmpl;
  const blendedKmpl = 1 / litresPerKm;
  const arithmeticMean = cityShare * cityKmpl + highwayShare * highwayKmpl;

  const cityKm = monthlyKm * cityShare;
  const highwayKm = monthlyKm * highwayShare;
  const cityLitres = cityKm / cityKmpl;
  const highwayLitres = highwayKm / highwayKmpl;
  const monthlyLitres = cityLitres + highwayLitres;

  const monthlyCost = monthlyLitres * fuelPrice;
  const costPerKm = fuelPrice * litresPerKm;

  return {
    cityShare,
    highwayShare,
    blendedKmpl,
    litresPer100Km: 100 * litresPerKm,
    arithmeticMean,
    naiveError: arithmeticMean - blendedKmpl,
    naiveErrorPct: blendedKmpl > 0 ? ((arithmeticMean - blendedKmpl) / blendedKmpl) * 100 : 0,
    cityKm,
    highwayKm,
    cityLitres,
    highwayLitres,
    monthlyLitres,
    cityFuelShare: monthlyLitres > 0 ? cityLitres / monthlyLitres : cityShare,
    monthlyCost,
    yearlyCost: monthlyCost * 12,
    costPerKm,
    allCityCost: monthlyKm > 0 ? (monthlyKm / cityKmpl) * fuelPrice : 0,
    allHighwayCost: monthlyKm > 0 ? (monthlyKm / highwayKmpl) * fuelPrice : 0,
  };
}

/**
 * Blended mileage on the EPA-style 55% city / 45% highway distance split,
 * for comparison against a label figure.
 */
export function epaStyleCombined({ cityKmpl, highwayKmpl }) {
  return blendMileage({
    cityKmpl,
    highwayKmpl,
    citySharePct: EPA_CITY_SHARE * 100,
  });
}
