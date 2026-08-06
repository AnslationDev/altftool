/**
 * Daily commute fuel cost.
 *
 * Core identity used throughout:
 *   litres = distance_km / mileage_kmpl        (definition of km/l)
 *   fuel cost = litres x price_per_litre
 *
 * Commute days are converted from "days per week" to "days per month" with the
 * calendar average of 52 weeks / 12 months = 4.333... weeks per month, so a
 * 5-day week is 21.67 commute days a month rather than a rounded 22.
 */

/** 52 weeks in a calendar year divided by 12 months. */
export const WEEKS_PER_MONTH = 52 / 12;

/** Months in a year. */
export const MONTHS_PER_YEAR = 12;

/** Highest plausible per-day one-way commute (km). Guards typo input. */
export const MAX_ONE_WAY_KM = 1000;

/** Highest plausible mileage in km per litre (hybrids top out far below this). */
export const MAX_KMPL = 200;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @param {object} input
 * @param {number} input.oneWayKm        one-way distance home -> workplace, km
 * @param {boolean} [input.roundTrip]    true if the same distance is driven back
 * @param {number} input.daysPerWeek     commute days in a week (0-7)
 * @param {number} input.mileageKmpl     real-world mileage of the vehicle, km/l
 * @param {number} input.fuelPrice       pump price per litre
 * @param {number} [input.tollPerDay]    toll paid on a commute day
 * @param {number} [input.parkingPerDay] parking paid on a commute day
 * @returns {object} breakdown, or { error } for invalid input
 */
export function computeCommuteCost({
  oneWayKm,
  roundTrip = true,
  daysPerWeek,
  mileageKmpl,
  fuelPrice,
  tollPerDay = 0,
  parkingPerDay = 0,
}) {
  const values = [oneWayKm, daysPerWeek, mileageKmpl, fuelPrice, tollPerDay, parkingPerDay];
  if (!values.every(isNum)) {
    return { error: "Enter a number in every field." };
  }
  if (oneWayKm <= 0) {
    return { error: "One-way distance must be greater than zero." };
  }
  if (oneWayKm > MAX_ONE_WAY_KM) {
    return { error: `One-way distance above ${MAX_ONE_WAY_KM} km is not a daily commute.` };
  }
  if (daysPerWeek < 1 || daysPerWeek > 7) {
    return { error: "Commute days must be between 1 and 7 per week." };
  }
  if (mileageKmpl <= 0) {
    return { error: "Mileage must be greater than zero km per litre." };
  }
  if (mileageKmpl > MAX_KMPL) {
    return { error: `Mileage above ${MAX_KMPL} km/l is not realistic — check the figure.` };
  }
  if (fuelPrice <= 0) {
    return { error: "Fuel price must be greater than zero." };
  }
  if (tollPerDay < 0 || parkingPerDay < 0) {
    return { error: "Toll and parking cannot be negative." };
  }

  const tripsPerDay = roundTrip ? 2 : 1;
  const dailyKm = oneWayKm * tripsPerDay;
  const daysPerMonth = daysPerWeek * WEEKS_PER_MONTH;
  const daysPerYear = daysPerWeek * 52;

  const monthlyKm = dailyKm * daysPerMonth;
  const yearlyKm = dailyKm * daysPerYear;

  const dailyLitres = dailyKm / mileageKmpl;
  const monthlyLitres = monthlyKm / mileageKmpl;
  const yearlyLitres = yearlyKm / mileageKmpl;

  const fuelPerKm = fuelPrice / mileageKmpl;
  const dailyFuelCost = dailyLitres * fuelPrice;
  const monthlyFuelCost = monthlyLitres * fuelPrice;
  const yearlyFuelCost = yearlyLitres * fuelPrice;

  const extrasPerDay = tollPerDay + parkingPerDay;
  const monthlyExtras = extrasPerDay * daysPerMonth;
  const yearlyExtras = extrasPerDay * daysPerYear;

  const dailyTotal = dailyFuelCost + extrasPerDay;
  const monthlyTotal = monthlyFuelCost + monthlyExtras;
  const yearlyTotal = yearlyFuelCost + yearlyExtras;

  return {
    tripsPerDay,
    dailyKm,
    daysPerMonth,
    daysPerYear,
    monthlyKm,
    yearlyKm,
    dailyLitres,
    monthlyLitres,
    yearlyLitres,
    fuelPerKm,
    dailyFuelCost,
    monthlyFuelCost,
    yearlyFuelCost,
    extrasPerDay,
    monthlyExtras,
    yearlyExtras,
    dailyTotal,
    monthlyTotal,
    yearlyTotal,
    totalCostPerKm: monthlyKm > 0 ? monthlyTotal / monthlyKm : 0,
  };
}

/**
 * Fuel-only saving from a change of mileage (for example after a service or a
 * switch of vehicle), over the same commute pattern.
 */
export function compareMileage({ base, altMileageKmpl }) {
  if (!base || base.error) return { error: "Fix the commute inputs first." };
  if (!isNum(altMileageKmpl) || altMileageKmpl <= 0 || altMileageKmpl > MAX_KMPL) {
    return { error: "Comparison mileage must be between 0 and 200 km/l." };
  }
  const altMonthlyLitres = base.monthlyKm / altMileageKmpl;
  const altMonthlyFuelCost = altMonthlyLitres * (base.monthlyFuelCost / base.monthlyLitres);
  return {
    altMonthlyLitres,
    altMonthlyFuelCost,
    monthlySaving: base.monthlyFuelCost - altMonthlyFuelCost,
    yearlySaving: (base.monthlyFuelCost - altMonthlyFuelCost) * MONTHS_PER_YEAR,
  };
}
