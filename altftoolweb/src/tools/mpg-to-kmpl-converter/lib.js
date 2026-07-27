/**
 * Fuel economy unit conversion.
 *
 * All conversions go through km/l as the pivot, using exact unit definitions:
 *   1 international mile   = 1.609344 km          (exact, international yard)
 *   1 US liquid gallon     = 3.785411784 litres   (exact, 231 cubic inches)
 *   1 imperial gallon      = 4.54609 litres       (exact, UK Weights and Measures Act 1985)
 *
 * Note that km/l and mpg are "distance per fuel" (higher is better) while
 * l/100 km is "fuel per distance" (lower is better), so the two families are
 * reciprocals of each other: l/100km = 100 / kmpl.
 */

/** 1 mile in kilometres, exact. */
export const KM_PER_MILE = 1.609344;

/** 1 US liquid gallon in litres, exact. */
export const LITRES_PER_US_GALLON = 3.785411784;

/** 1 imperial gallon in litres, exact. */
export const LITRES_PER_UK_GALLON = 4.54609;

/** km/l for 1 US mpg. */
export const KMPL_PER_MPG_US = KM_PER_MILE / LITRES_PER_US_GALLON;

/** km/l for 1 imperial mpg. */
export const KMPL_PER_MPG_UK = KM_PER_MILE / LITRES_PER_UK_GALLON;

/** Anything beyond this in km/l is outside road-vehicle reality. */
export const MAX_KMPL = 1000;

export const UNITS = [
  { id: "kmpl", label: "km per litre (km/l)", short: "km/l" },
  { id: "mpgUs", label: "miles per US gallon (US mpg)", short: "US mpg" },
  { id: "mpgUk", label: "miles per imperial gallon (UK mpg)", short: "UK mpg" },
  { id: "milesPerLitre", label: "miles per litre", short: "mi/l" },
  { id: "l100km", label: "litres per 100 km", short: "l/100km" },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Convert any supported unit into km/l. */
export function toKmpl(value, unit) {
  if (!isNum(value)) return NaN;
  switch (unit) {
    case "kmpl":
      return value;
    case "mpgUs":
      return value * KMPL_PER_MPG_US;
    case "mpgUk":
      return value * KMPL_PER_MPG_UK;
    case "milesPerLitre":
      return value * KM_PER_MILE;
    case "l100km":
      return value > 0 ? 100 / value : NaN;
    default:
      return NaN;
  }
}

/**
 * @param {object} input
 * @param {number} input.value  the number typed by the user
 * @param {string} input.unit   one of the ids in UNITS
 * @param {number} [input.fuelPrice] price per litre, for cost figures
 * @returns {object} the same economy expressed in every unit, or { error }
 */
export function convertFuelEconomy({ value, unit, fuelPrice = 0 }) {
  if (!isNum(value)) return { error: "Enter a number to convert." };
  if (!UNITS.some((entry) => entry.id === unit)) {
    return { error: "Pick a unit to convert from." };
  }
  if (value <= 0) {
    return { error: "Fuel economy must be greater than zero." };
  }

  const kmpl = toKmpl(value, unit);
  if (!isNum(kmpl) || kmpl <= 0) {
    return { error: "That value cannot be converted — check the unit." };
  }
  if (kmpl > MAX_KMPL) {
    return { error: `That works out to over ${MAX_KMPL} km/l, which is outside the useful range.` };
  }

  const costPerKm = isNum(fuelPrice) && fuelPrice > 0 ? fuelPrice / kmpl : 0;

  return {
    kmpl,
    mpgUs: kmpl / KMPL_PER_MPG_US,
    mpgUk: kmpl / KMPL_PER_MPG_UK,
    milesPerLitre: kmpl / KM_PER_MILE,
    l100km: 100 / kmpl,
    gallonsUsPer100Miles: (100 / (kmpl / KMPL_PER_MPG_US)),
    costPerKm,
    costPer100Km: costPerKm * 100,
  };
}

/** Handy reference rows for a printable conversion table. */
export function buildReferenceTable(mpgUsValues = [15, 20, 25, 30, 35, 40, 45, 50, 60]) {
  return mpgUsValues
    .filter((value) => isNum(value) && value > 0)
    .map((mpgUs) => {
      const kmpl = mpgUs * KMPL_PER_MPG_US;
      return {
        mpgUs,
        kmpl,
        mpgUk: kmpl / KMPL_PER_MPG_UK,
        l100km: 100 / kmpl,
      };
    });
}
