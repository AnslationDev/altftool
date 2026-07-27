/**
 * Two-wheeler fuel cost.
 *
 * Everything follows from the definition of mileage in km/l:
 *   litres  = distance_km / mileage_kmpl
 *   cost    = litres x price_per_litre
 *   range   = tank_litres x mileage_kmpl
 *
 * Weekly usage is converted to a month with the calendar average of
 * 52 weeks / 12 months = 4.333... weeks per month.
 */

/** 52 weeks in a year over 12 months. */
export const WEEKS_PER_MONTH = 52 / 12;

/** Weeks in a year. */
export const WEEKS_PER_YEAR = 52;

/**
 * Upper sanity bound for two-wheeler mileage in km/l. Production 100-125cc
 * commuters peak near 70-90 km/l, so anything past 150 is a typo.
 */
export const MAX_KMPL = 150;

/** Largest realistic motorcycle fuel tank in litres (touring bikes ~25 l). */
export const MAX_TANK_LITRES = 60;

/** Single-trip distance ceiling, km. */
export const MAX_TRIP_KM = 2000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @param {object} input
 * @param {number} input.tripKm       one-way distance of a typical ride, km
 * @param {boolean} [input.roundTrip] true when the same distance is ridden back
 * @param {number} input.tripsPerWeek number of such rides in a week
 * @param {number} input.mileageKmpl  real-world mileage, km per litre
 * @param {number} input.fuelPrice    petrol price per litre
 * @param {number} input.tankLitres   fuel tank capacity in litres
 * @returns {object} breakdown, or { error } for invalid input
 */
export function computeBikeFuelCost({
  tripKm,
  roundTrip = true,
  tripsPerWeek,
  mileageKmpl,
  fuelPrice,
  tankLitres,
}) {
  const values = [tripKm, tripsPerWeek, mileageKmpl, fuelPrice, tankLitres];
  if (!values.every(isNum)) {
    return { error: "Enter a number in every field." };
  }
  if (tripKm <= 0) {
    return { error: "Trip distance must be greater than zero." };
  }
  if (tripKm > MAX_TRIP_KM) {
    return { error: `Trip distance above ${MAX_TRIP_KM} km is out of range for this calculator.` };
  }
  if (tripsPerWeek <= 0 || tripsPerWeek > 100) {
    return { error: "Rides per week must be between 1 and 100." };
  }
  if (mileageKmpl <= 0) {
    return { error: "Mileage must be greater than zero km per litre." };
  }
  if (mileageKmpl > MAX_KMPL) {
    return { error: `Mileage above ${MAX_KMPL} km/l is not realistic for a two-wheeler.` };
  }
  if (fuelPrice <= 0) {
    return { error: "Fuel price must be greater than zero." };
  }
  if (tankLitres <= 0 || tankLitres > MAX_TANK_LITRES) {
    return { error: `Tank capacity must be between 0 and ${MAX_TANK_LITRES} litres.` };
  }

  const legs = roundTrip ? 2 : 1;
  const tripDistance = tripKm * legs;

  const litresPerTrip = tripDistance / mileageKmpl;
  const costPerTrip = litresPerTrip * fuelPrice;
  const costPerKm = fuelPrice / mileageKmpl;

  const weeklyKm = tripDistance * tripsPerWeek;
  const monthlyKm = weeklyKm * WEEKS_PER_MONTH;
  const yearlyKm = weeklyKm * WEEKS_PER_YEAR;

  const weeklyLitres = weeklyKm / mileageKmpl;
  const monthlyLitres = monthlyKm / mileageKmpl;
  const yearlyLitres = yearlyKm / mileageKmpl;

  const tankRangeKm = tankLitres * mileageKmpl;
  const fullTankCost = tankLitres * fuelPrice;
  const refillsPerMonth = monthlyKm / tankRangeKm;
  const daysPerRefill = refillsPerMonth > 0 ? 30 / refillsPerMonth : 0;

  return {
    legs,
    tripDistance,
    litresPerTrip,
    costPerTrip,
    costPerKm,
    weeklyKm,
    monthlyKm,
    yearlyKm,
    weeklyLitres,
    monthlyLitres,
    yearlyLitres,
    weeklyCost: weeklyLitres * fuelPrice,
    monthlyCost: monthlyLitres * fuelPrice,
    yearlyCost: yearlyLitres * fuelPrice,
    tankRangeKm,
    fullTankCost,
    refillsPerMonth,
    daysPerRefill,
  };
}

/**
 * Fuel cost of the same riding pattern on a different mileage — useful for
 * comparing a 100cc commuter against a 350cc bike on the same route.
 */
export function compareBikeMileage({ monthlyKm, fuelPrice, altMileageKmpl }) {
  if (!isNum(monthlyKm) || monthlyKm <= 0) {
    return { error: "Fix the ride inputs first." };
  }
  if (!isNum(fuelPrice) || fuelPrice <= 0) {
    return { error: "Fuel price must be greater than zero." };
  }
  if (!isNum(altMileageKmpl) || altMileageKmpl <= 0 || altMileageKmpl > MAX_KMPL) {
    return { error: `Comparison mileage must be between 0 and ${MAX_KMPL} km/l.` };
  }
  const monthlyLitres = monthlyKm / altMileageKmpl;
  return {
    monthlyLitres,
    monthlyCost: monthlyLitres * fuelPrice,
    yearlyCost: monthlyLitres * fuelPrice * 12,
  };
}
