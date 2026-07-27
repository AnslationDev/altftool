/**
 * Extra fuel burnt by car air conditioning.
 *
 * The compressor is a mechanical load on the engine, so its fuel cost is its average
 * shaft power multiplied by the engine's brake specific fuel consumption:
 *
 *   compressorKw   = baseCompressorKw x tempFactor x sunFactor
 *                    + (occupants - REFERENCE_OCCUPANTS) x KW_PER_EXTRA_OCCUPANT
 *   fuelMassPerHour = compressorKw x bsfcGramsPerKwh / 1000        (kg per hour)
 *   fuelUnitsPerHour = fuelMassPerHour / densityKgPerLitre         (litres, or kg for CNG)
 *
 * tempFactor scales with how hard the cabin is being pulled down:
 *   tempFactor = (ambient - setpoint) / REFERENCE_DELTA_C,  clamped
 *
 * The percentage hit to mileage is then the AC's hourly fuel against the car's own
 * hourly fuel at your average speed:  baseUnitsPerHour = avgSpeed / mileage.
 */

/**
 * Average compressor shaft power in kW at the reference condition, by cabin size.
 * These are duty-cycle averages, not peak draw: an automotive compressor cycles, so a
 * system with 3-5 kW of cooling capacity averages well under 1 kW of shaft power over a
 * drive. They are calibrated so that a mid-size car in 35 C heat lands inside the
 * 10-20% fuel-economy penalty that AC is consistently measured to cost.
 */
export const CAR_SIZES = [
  { value: "hatchback", label: "Hatchback", compressorKw: 0.55 },
  { value: "sedan", label: "Sedan / compact SUV", compressorKw: 0.7 },
  { value: "suv", label: "Mid-size or large SUV", compressorKw: 0.9 },
  { value: "mpv", label: "MPV / 7-seater", compressorKw: 1.05 },
];

/** Ambient minus setpoint at which the compressor powers above are quoted, in kelvin. */
export const REFERENCE_DELTA_C = 11;

/** Occupant count the reference compressor power assumes. */
export const REFERENCE_OCCUPANTS = 2;

/**
 * Each additional person adds roughly 100 W of metabolic heat to the cabin. At a typical
 * automotive AC coefficient of performance near 2.2, that is about 0.045 kW of extra
 * shaft power per person.
 */
export const KW_PER_EXTRA_OCCUPANT = 0.045;

/** Load factor is clamped to this band so extreme inputs cannot produce absurd numbers. */
export const MIN_TEMP_FACTOR = 0.25;
export const MAX_TEMP_FACTOR = 2.2;

/** Solar gain through the glass: shade and cloud cut the load, harsh direct sun raises it. */
export const SUN_LEVELS = [
  { value: "shade", label: "Cloudy, shaded or after dark", factor: 0.85 },
  { value: "normal", label: "Ordinary daylight", factor: 1 },
  { value: "harsh", label: "Harsh direct sun, car parked in the open", factor: 1.2 },
];

/**
 * Fuel properties.
 * bsfc: part-load brake specific fuel consumption in grams per kWh of shaft work.
 *   Petrol spark-ignition engines run near 300 g/kWh at part load, diesels near 220,
 *   and CNG near 250 on an energy-equivalent mass basis.
 * density: kg per litre at 15 C. CNG is sold by mass, so its density is set to 1
 *   and the "units" it returns are already kilograms.
 */
export const FUEL_TYPES = [
  { value: "petrol", label: "Petrol", bsfc: 300, density: 0.745, unit: "litre", unitShort: "L", co2PerUnit: 2.31 },
  { value: "diesel", label: "Diesel", bsfc: 220, density: 0.832, unit: "litre", unitShort: "L", co2PerUnit: 2.68 },
  { value: "cng", label: "CNG", bsfc: 250, density: 1, unit: "kg", unitShort: "kg", co2PerUnit: 2.75 },
];

const round = (value, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const findOption = (options, value) => options.find((option) => option.value === value) || null;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

/**
 * @param {object} input
 * @param {string} [input.carSize] One of CAR_SIZES values.
 * @param {string} [input.fuelType] One of FUEL_TYPES values.
 * @param {number|string} [input.fuelPrice] Price per litre or per kg, INR.
 * @param {number|string} [input.mileage] Mileage without AC, km per litre or km per kg.
 * @param {number|string} [input.avgSpeed] Average moving speed, km/h.
 * @param {number|string} [input.ambientC] Outside temperature, degrees C.
 * @param {number|string} [input.setpointC] Cabin temperature you set, degrees C.
 * @param {string} [input.sun] One of SUN_LEVELS values.
 * @param {number|string} [input.occupants] People in the car.
 * @param {number|string} [input.hoursPerDay] Hours of AC use per driving day.
 * @param {number|string} [input.daysPerMonth] Driving days per month.
 */
export function computeAcFuelImpact({
  carSize = "sedan",
  fuelType = "petrol",
  fuelPrice = 105,
  mileage = 16,
  avgSpeed = 30,
  ambientC = 38,
  setpointC = 24,
  sun = "normal",
  occupants = 2,
  hoursPerDay = 2,
  daysPerMonth = 26,
} = {}) {
  const car = findOption(CAR_SIZES, carSize);
  const fuel = findOption(FUEL_TYPES, fuelType);
  const solar = findOption(SUN_LEVELS, sun);
  if (!car || !fuel || !solar) return { error: "Choose a valid car size, fuel and sun condition." };

  const v = {
    price: toNumber(fuelPrice),
    mileage: toNumber(mileage),
    speed: toNumber(avgSpeed),
    ambient: toNumber(ambientC),
    setpoint: toNumber(setpointC),
    people: toNumber(occupants),
    hours: toNumber(hoursPerDay),
    days: toNumber(daysPerMonth),
  };

  if (Object.values(v).some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (v.price < 0) return { error: "Fuel price cannot be negative." };
  if (!(v.mileage > 0)) return { error: `Enter the car's mileage in km per ${fuel.unit}.` };
  if (v.mileage > 100) return { error: "Mileage above 100 km per unit is not realistic for a car." };
  if (!(v.speed > 0)) return { error: "Enter an average speed greater than zero." };
  if (v.speed > 200) return { error: "Enter an average speed under 200 km/h." };
  if (v.ambient < -20 || v.ambient > 60) return { error: "Outside temperature should be between -20°C and 60°C." };
  if (v.setpoint < 16 || v.setpoint > 32) return { error: "A cabin setpoint outside 16°C to 32°C is not selectable on a car." };
  if (v.people < 1 || v.people > 12) return { error: "Occupants should be between 1 and 12." };
  if (v.hours < 0 || v.hours > 24) return { error: "AC hours per day should be between 0 and 24." };
  if (v.days < 0 || v.days > 31) return { error: "Driving days per month should be between 0 and 31." };

  const deltaC = v.ambient - v.setpoint;
  const rawTempFactor = deltaC / REFERENCE_DELTA_C;
  const tempFactor = clamp(rawTempFactor, MIN_TEMP_FACTOR, MAX_TEMP_FACTOR);

  const occupantKw = (v.people - REFERENCE_OCCUPANTS) * KW_PER_EXTRA_OCCUPANT;
  const compressorKw = Math.max(0.05, car.compressorKw * tempFactor * solar.factor + occupantKw);

  const fuelKgPerHour = (compressorKw * fuel.bsfc) / 1000;
  const acUnitsPerHour = fuelKgPerHour / fuel.density;

  const baseUnitsPerHour = v.speed / v.mileage;
  const penaltyPct = baseUnitsPerHour > 0 ? (acUnitsPerHour / baseUnitsPerHour) * 100 : 0;
  const mileageWithAc = v.speed / (baseUnitsPerHour + acUnitsPerHour);
  const acUnitsPerKm = acUnitsPerHour / v.speed;

  const hoursPerMonth = v.hours * v.days;
  const unitsPerMonth = acUnitsPerHour * hoursPerMonth;
  const costPerHour = acUnitsPerHour * v.price;
  const costPerMonth = unitsPerMonth * v.price;
  const costPerYear = costPerMonth * 12;
  const unitsPerYear = unitsPerMonth * 12;
  const co2PerYearKg = unitsPerYear * fuel.co2PerUnit;

  const notes = [];
  if (rawTempFactor < MIN_TEMP_FACTOR) {
    notes.push(
      "The outside air is already at or below your setpoint, so the compressor is only dehumidifying — the load is held at its minimum.",
    );
  }
  if (rawTempFactor > MAX_TEMP_FACTOR) {
    notes.push("Load is capped at its maximum: past a point the compressor simply runs continuously and cannot draw more.");
  }
  if (penaltyPct > 25) {
    notes.push(
      `A ${round(penaltyPct)}% hit is at the top of the measured range for car AC. It happens at low speeds in extreme heat — the same AC costs far less proportionally on a highway run.`,
    );
  }
  notes.push(
    "Parking in shade or cracking the windows for the first minute cuts the pull-down load, which is the most expensive part of any AC cycle.",
  );

  return {
    carLabel: car.label,
    fuelLabel: fuel.label,
    fuelUnit: fuel.unit,
    fuelUnitShort: fuel.unitShort,
    ambientC: round(v.ambient, 1),
    setpointC: round(v.setpoint, 1),
    deltaC: round(deltaC, 1),
    tempFactor: round(tempFactor, 2),
    sunFactor: solar.factor,
    occupants: Math.round(v.people),
    occupantKw: round(occupantKw, 3),
    compressorKw: round(compressorKw, 2),
    bsfc: fuel.bsfc,
    fuelKgPerHour: round(fuelKgPerHour, 3),
    acUnitsPerHour: round(acUnitsPerHour, 3),
    acUnitsPerKm: round(acUnitsPerKm, 4),
    baseUnitsPerHour: round(baseUnitsPerHour, 3),
    penaltyPct: round(penaltyPct, 1),
    mileageWithoutAc: round(v.mileage, 2),
    mileageWithAc: round(mileageWithAc, 2),
    costPerHour: round(costPerHour, 2),
    hoursPerMonth: round(hoursPerMonth, 1),
    unitsPerMonth: round(unitsPerMonth, 2),
    costPerMonth: round(costPerMonth),
    unitsPerYear: round(unitsPerYear, 1),
    costPerYear: round(costPerYear),
    co2PerYearKg: round(co2PerYearKg),
    notes,
  };
}
