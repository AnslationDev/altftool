/**
 * True mileage from the tank-to-tank (brim-to-brim) method.
 *
 * Procedure the maths assumes:
 *   1. Fill the tank to the brim and note the odometer. This is the baseline;
 *      the litres in that first fill are NOT counted, because they replaced
 *      fuel burnt before the measurement started.
 *   2. Drive normally.
 *   3. Fill to the brim again, note the odometer and the litres dispensed.
 *
 * Then, for each refill i:
 *   segment_kmpl = (odometer_i - odometer_(i-1)) / litres_i
 * and across the whole log:
 *   overall_kmpl = (last_odometer - first_odometer) / sum(litres of refills 2..n)
 *
 * This is the only method that measures real consumption; the trip computer
 * estimate is a model and is commonly optimistic by a few percent.
 */

/** 1 international mile = 1.609344 km exactly (NIST / international yard). */
export const KM_PER_MILE = 1.609344;

/** 1 US liquid gallon = 3.785411784 litres exactly. */
export const LITRES_PER_US_GALLON = 3.785411784;

/** 1 imperial (UK) gallon = 4.54609 litres exactly. */
export const LITRES_PER_UK_GALLON = 4.54609;

/** km/l -> US mpg. */
export const KMPL_TO_MPG_US = LITRES_PER_US_GALLON / KM_PER_MILE;

/** km/l -> imperial mpg. */
export const KMPL_TO_MPG_UK = LITRES_PER_UK_GALLON / KM_PER_MILE;

/** Highest plausible mileage for a road vehicle, km/l. */
export const MAX_KMPL = 200;

/** Largest single fill this tool accepts, litres. */
export const MAX_FILL_LITRES = 500;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Convert a km/l figure into the other common consumption units.
 * @param {number} kmpl
 * @param {number} [fuelPrice] price per litre, for cost figures
 */
export function convertMileage(kmpl, fuelPrice = 0) {
  if (!isNum(kmpl) || kmpl <= 0) return { error: "Mileage must be greater than zero km/l." };
  const costPerKm = isNum(fuelPrice) && fuelPrice > 0 ? fuelPrice / kmpl : 0;
  return {
    kmpl,
    litresPer100Km: 100 / kmpl,
    mpgUs: kmpl * KMPL_TO_MPG_US,
    mpgUk: kmpl * KMPL_TO_MPG_UK,
    milesPerLitre: kmpl / KM_PER_MILE,
    costPerKm,
    costPer100Km: costPerKm * 100,
  };
}

/**
 * @param {object} input
 * @param {Array<{odometer: number, litres: number}>} input.fills
 *        fills[0] is the baseline brim fill (its litres are ignored)
 * @param {number} [input.fuelPrice] price per litre for cost figures
 * @returns {object} overall + per-segment mileage, or { error }
 */
export function computeMileageFromFills({ fills = [], fuelPrice = 0 }) {
  if (!Array.isArray(fills) || fills.length < 2) {
    return { error: "Add the baseline fill plus at least one refill." };
  }
  if (!fills.every((fill) => isNum(fill.odometer))) {
    return { error: "Enter an odometer reading for every fill." };
  }
  if (fills.some((fill) => fill.odometer < 0)) {
    return { error: "Odometer readings cannot be negative." };
  }
  for (let i = 1; i < fills.length; i += 1) {
    if (fills[i].odometer <= fills[i - 1].odometer) {
      return { error: `Fill ${i + 1} must have a higher odometer reading than fill ${i}.` };
    }
    if (!isNum(fills[i].litres)) {
      return { error: `Enter the litres filled at fill ${i + 1}.` };
    }
    if (fills[i].litres <= 0) {
      return { error: `Litres at fill ${i + 1} must be greater than zero.` };
    }
    if (fills[i].litres > MAX_FILL_LITRES) {
      return { error: `A single fill above ${MAX_FILL_LITRES} litres is out of range.` };
    }
  }

  const segments = [];
  let totalDistance = 0;
  let totalLitres = 0;

  for (let i = 1; i < fills.length; i += 1) {
    const distance = fills[i].odometer - fills[i - 1].odometer;
    const litres = fills[i].litres;
    const kmpl = distance / litres;
    if (kmpl > MAX_KMPL) {
      return {
        error: `Fill ${i + 1} works out to ${kmpl.toFixed(1)} km/l — check the odometer and litres.`,
      };
    }
    totalDistance += distance;
    totalLitres += litres;
    segments.push({ index: i, distance, litres, kmpl });
  }

  const overallKmpl = totalDistance / totalLitres;
  const converted = convertMileage(overallKmpl, fuelPrice);
  const best = segments.reduce((a, b) => (b.kmpl > a.kmpl ? b : a));
  const worst = segments.reduce((a, b) => (b.kmpl < a.kmpl ? b : a));

  return {
    totalDistance,
    totalLitres,
    overallKmpl,
    segments,
    bestKmpl: best.kmpl,
    worstKmpl: worst.kmpl,
    spread: best.kmpl - worst.kmpl,
    fuelSpent: isNum(fuelPrice) && fuelPrice > 0 ? totalLitres * fuelPrice : 0,
    ...converted,
  };
}
