/**
 * Cycling commute maths: calories burned, plus the fuel, money and CO2 that
 * the same journey by car would have cost.
 *
 * Energy model (ACSM):  kcal/min = MET x 3.5 x kg / 200
 *   1 MET = 3.5 mL O2 per kg per minute, 1 L O2 ~= 5 kcal.
 *
 * Cycling MET values come from the bicycling codes of the Compendium of
 * Physical Activities (Ainsworth et al., 2011), which are banded by speed.
 * Combustion CO2 factors are the standard figures for burning one litre of
 * road fuel: 2.31 kg CO2 per litre of petrol, 2.68 kg per litre of diesel.
 */

export const LB_TO_KG = 0.45359237;
export const KM_PER_MILE = 1.609344;
export const O2_ML_PER_KG_PER_MET = 3.5;
export const KCAL_PER_LITRE_O2 = 5;
export const RESTING_MET = 1;
export const KCAL_PER_KG_BODY_FAT = 7700;
export const WEEKS_PER_YEAR = 52;

export const MIN_WEIGHT_KG = 25;
export const MAX_WEIGHT_KG = 400;
export const MAX_ONE_WAY_KM = 200;
export const MIN_SPEED_KMH = 5;
export const MAX_SPEED_KMH = 60;
export const MAX_DAYS_PER_WEEK = 7;
export const MAX_MILEAGE_KM_PER_L = 100;

export const FUEL_TYPES = [
  { id: "petrol", label: "Petrol", kgCo2PerLitre: 2.31 },
  { id: "diesel", label: "Diesel", kgCo2PerLitre: 2.68 },
];

/**
 * Compendium bicycling codes, banded by average speed.
 * maxKmh is exclusive; the last band has no upper bound.
 */
export const CYCLING_SPEED_BANDS = [
  { maxKmh: 16, met: 4.0, label: "Leisure, under 16 km/h" },
  { maxKmh: 19.3, met: 6.8, label: "Light effort, 16-19 km/h" },
  { maxKmh: 22.5, met: 8.0, label: "Moderate effort, 19-22 km/h" },
  { maxKmh: 25.7, met: 10.0, label: "Vigorous effort, 22-26 km/h" },
  { maxKmh: 30.6, met: 12.0, label: "Very fast, 26-31 km/h" },
  { maxKmh: Infinity, met: 15.8, label: "Racing pace, over 31 km/h" },
];

const round = (value, places = 0) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

export function metToKcalPerMinute(met, weightKg) {
  if (!Number.isFinite(met) || !Number.isFinite(weightKg)) return 0;
  if (met <= 0 || weightKg <= 0) return 0;
  return (met * O2_ML_PER_KG_PER_MET * weightKg * KCAL_PER_LITRE_O2) / 1000;
}

/** Compendium MET for an average cycling speed in km/h. */
export function bicyclingMetForSpeed(speedKmh) {
  if (!Number.isFinite(speedKmh) || speedKmh <= 0) return null;
  return CYCLING_SPEED_BANDS.find((band) => speedKmh < band.maxKmh) || null;
}

export function getFuelType(id) {
  return FUEL_TYPES.find((item) => item.id === id) || null;
}

/**
 * @param {object} input
 * @param {number} input.weight body weight in `weightUnit`
 * @param {"kg"|"lb"} input.weightUnit
 * @param {number} input.oneWayDistance distance in `distanceUnit`
 * @param {"km"|"mi"} input.distanceUnit
 * @param {number} input.speedKmh average riding speed, km/h
 * @param {number} input.tripsPerDay 1 for one way, 2 for a return commute
 * @param {number} input.daysPerWeek commuting days
 * @param {number} input.carKmPerLitre the car's real-world fuel economy
 * @param {number} input.fuelPricePerLitre local pump price
 * @param {string} input.fuelTypeId one of FUEL_TYPES ids
 */
export function computeCyclingCommute({
  weight,
  weightUnit = "kg",
  oneWayDistance,
  distanceUnit = "km",
  speedKmh,
  tripsPerDay = 2,
  daysPerWeek = 5,
  carKmPerLitre = 15,
  fuelPricePerLitre = 0,
  fuelTypeId = "petrol",
}) {
  const numbers = [
    weight,
    oneWayDistance,
    speedKmh,
    tripsPerDay,
    daysPerWeek,
    carKmPerLitre,
    fuelPricePerLitre,
  ];
  if (numbers.some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }

  const fuel = getFuelType(fuelTypeId);
  if (!fuel) return { error: "Pick a fuel type for the car comparison." };

  const weightKg = weightUnit === "lb" ? weight * LB_TO_KG : weight;
  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }

  const oneWayKm = distanceUnit === "mi" ? oneWayDistance * KM_PER_MILE : oneWayDistance;
  if (oneWayKm <= 0) return { error: "One-way distance must be more than zero." };
  if (oneWayKm > MAX_ONE_WAY_KM) {
    return { error: `One-way distance should be ${MAX_ONE_WAY_KM} km or less.` };
  }
  if (speedKmh < MIN_SPEED_KMH || speedKmh > MAX_SPEED_KMH) {
    return { error: `Average speed should be between ${MIN_SPEED_KMH} and ${MAX_SPEED_KMH} km/h.` };
  }
  if (tripsPerDay < 1 || tripsPerDay > 4) {
    return { error: "Trips per day should be between 1 and 4." };
  }
  if (daysPerWeek < 1 || daysPerWeek > MAX_DAYS_PER_WEEK) {
    return { error: `Commuting days should be between 1 and ${MAX_DAYS_PER_WEEK}.` };
  }
  if (carKmPerLitre <= 0 || carKmPerLitre > MAX_MILEAGE_KM_PER_L) {
    return { error: `Car fuel economy should be between 0 and ${MAX_MILEAGE_KM_PER_L} km per litre.` };
  }
  if (fuelPricePerLitre < 0) return { error: "Fuel price cannot be negative." };

  const band = bicyclingMetForSpeed(speedKmh);
  if (!band) return { error: "Average speed must be greater than zero." };

  const minutesPerTrip = (oneWayKm / speedKmh) * 60;
  const kcalPerMinute = metToKcalPerMinute(band.met, weightKg);
  const restingPerMinute = metToKcalPerMinute(RESTING_MET, weightKg);

  const kcalPerTrip = kcalPerMinute * minutesPerTrip;
  const netKcalPerTrip = Math.max(0, kcalPerTrip - restingPerMinute * minutesPerTrip);

  const tripsPerWeek = tripsPerDay * daysPerWeek;
  const kmPerWeek = oneWayKm * tripsPerWeek;
  const kcalPerWeek = kcalPerTrip * tripsPerWeek;
  const netKcalPerWeek = netKcalPerTrip * tripsPerWeek;

  const litresPerWeek = kmPerWeek / carKmPerLitre;
  const moneyPerWeek = litresPerWeek * fuelPricePerLitre;
  const co2KgPerWeek = litresPerWeek * fuel.kgCo2PerLitre;

  return {
    weightKg: round(weightKg, 1),
    oneWayKm: round(oneWayKm, 2),
    met: band.met,
    speedBandLabel: band.label,
    minutesPerTrip: round(minutesPerTrip, 1),
    minutesPerWeek: round(minutesPerTrip * tripsPerWeek, 1),
    kcalPerMinute: round(kcalPerMinute, 2),
    kcalPerTrip: round(kcalPerTrip),
    netKcalPerTrip: round(netKcalPerTrip),
    kcalPerDay: round(kcalPerTrip * tripsPerDay),
    kcalPerWeek: round(kcalPerWeek),
    netKcalPerWeek: round(netKcalPerWeek),
    kcalPerYear: round(kcalPerWeek * WEEKS_PER_YEAR),
    kmPerWeek: round(kmPerWeek, 1),
    kmPerYear: round(kmPerWeek * WEEKS_PER_YEAR),
    litresPerWeek: round(litresPerWeek, 2),
    litresPerYear: round(litresPerWeek * WEEKS_PER_YEAR, 1),
    moneyPerWeek: round(moneyPerWeek),
    moneyPerYear: round(moneyPerWeek * WEEKS_PER_YEAR),
    co2KgPerWeek: round(co2KgPerWeek, 2),
    co2KgPerYear: round(co2KgPerWeek * WEEKS_PER_YEAR, 1),
    fuelLabel: fuel.label,
    fatGramsPerWeek: round((netKcalPerWeek / KCAL_PER_KG_BODY_FAT) * 1000, 1),
  };
}
