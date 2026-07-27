/**
 * Fuel wasted idling.
 *
 * Idle fuel flow is not driven by speed — it is friction plus accessory load, which
 * scales closely with engine displacement:
 *
 *   idleUnitsPerHour = displacementLitres x IDLE_RATE_PER_LITRE[fuel] x (acOn ? AC_IDLE_FACTOR : 1)
 *   idleSecondsPerDay = signals x avgWaitSeconds + otherIdleMinutes x 60
 *   unitsPerDay       = idleUnitsPerHour x idleSecondsPerDay / 3600
 *
 * Switching off is only worth it past the fuel a restart costs. A modern fuel-injected
 * engine restarts on roughly the fuel of RESTART_EQUIVALENT_SECONDS of idling, so the
 * recoverable idle time per stop is (waitSeconds - RESTART_EQUIVALENT_SECONDS).
 */

/**
 * Idle fuel flow per litre of engine displacement, in litres (or kg for CNG) per hour.
 * Petrol: a 1.2 L engine idles near 0.6 L/h and a 2.0 L near 1.0 L/h, giving 0.5 L/h
 * per litre of displacement. Diesel idles leaner because of its far better part-load
 * efficiency; CNG sits between the two on a mass basis.
 */
export const IDLE_RATE_PER_LITRE = {
  petrol: 0.5,
  diesel: 0.35,
  cng: 0.38,
};

export const FUEL_TYPES = [
  { value: "petrol", label: "Petrol", unit: "litre", unitShort: "L", mileageLabel: "km/l", co2PerUnit: 2.31 },
  { value: "diesel", label: "Diesel", unit: "litre", unitShort: "L", mileageLabel: "km/l", co2PerUnit: 2.68 },
  { value: "cng", label: "CNG", unit: "kg", unitShort: "kg", mileageLabel: "km/kg", co2PerUnit: 2.75 },
];

/**
 * Air conditioning at idle is expensive because there is no ram air over the condenser
 * and the engine is producing almost no other work. Measured increases fall in the
 * 20-40% band; 30% is used here.
 */
export const AC_IDLE_FACTOR = 1.3;

/**
 * Restarting a warm fuel-injected engine consumes roughly the fuel of ten seconds of
 * idling. Below that, leaving the engine running is cheaper; above it, switching off wins.
 * This is the threshold behind every "switch off at the signal" campaign and behind
 * factory idle-stop systems.
 */
export const RESTART_EQUIVALENT_SECONDS = 10;

const round = (value, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const findOption = (options, value) => options.find((option) => option.value === value) || null;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

/**
 * @param {object} input
 * @param {number|string} input.displacementL Engine displacement in litres (1500 cc = 1.5).
 * @param {string} [input.fuelType] One of FUEL_TYPES values.
 * @param {boolean} [input.acOn] Air conditioning running while idling.
 * @param {number|string} [input.signalsPerDay] Signals and traffic halts per day.
 * @param {number|string} [input.avgWaitSeconds] Average wait at each halt, seconds.
 * @param {number|string} [input.otherIdleMinutes] Other engine-on waiting per day, minutes.
 * @param {number|string} [input.daysPerMonth] Driving days per month.
 * @param {number|string} [input.fuelPrice] Price per litre or per kg, INR.
 * @param {number|string} [input.mileage] Mileage, for the "distance you could have driven" line.
 */
export function computeIdlingWaste({
  displacementL,
  fuelType = "petrol",
  acOn = true,
  signalsPerDay = 15,
  avgWaitSeconds = 60,
  otherIdleMinutes = 10,
  daysPerMonth = 26,
  fuelPrice = 105,
  mileage = 16,
} = {}) {
  const fuel = findOption(FUEL_TYPES, fuelType);
  if (!fuel) return { error: "Choose a valid fuel type." };
  const idleRate = IDLE_RATE_PER_LITRE[fuel.value];

  const v = {
    displacement: toNumber(displacementL),
    signals: toNumber(signalsPerDay),
    wait: toNumber(avgWaitSeconds),
    other: toNumber(otherIdleMinutes),
    days: toNumber(daysPerMonth),
    price: toNumber(fuelPrice),
    mileage: toNumber(mileage),
  };

  if (Object.values(v).some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (!(v.displacement > 0)) return { error: "Enter the engine size in litres — 1500 cc is 1.5." };
  if (v.displacement > 8) return { error: "Engine displacement above 8 litres is not a passenger vehicle." };
  if (v.signals < 0 || v.signals > 200) return { error: "Signals per day should be between 0 and 200." };
  if (v.wait < 0 || v.wait > 3600) return { error: "Average wait should be between 0 and 3600 seconds." };
  if (v.other < 0 || v.other > 600) return { error: "Other idling should be between 0 and 600 minutes a day." };
  if (v.days < 0 || v.days > 31) return { error: "Driving days per month should be between 0 and 31." };
  if (v.price < 0) return { error: "Fuel price cannot be negative." };
  if (!(v.mileage > 0)) return { error: `Enter the vehicle's mileage in ${fuel.mileageLabel}.` };
  if (v.mileage > 100) return { error: "Mileage above 100 km per unit is not realistic for a car." };

  const acFactor = acOn ? AC_IDLE_FACTOR : 1;
  const idleUnitsPerHour = v.displacement * idleRate * acFactor;

  const signalSeconds = v.signals * v.wait;
  const otherSeconds = v.other * 60;
  const idleSecondsPerDay = signalSeconds + otherSeconds;
  const idleMinutesPerDay = idleSecondsPerDay / 60;

  const unitsPerDay = (idleUnitsPerHour * idleSecondsPerDay) / 3600;
  const unitsPerMonth = unitsPerDay * v.days;
  const unitsPerYear = unitsPerMonth * 12;

  const costPerDay = unitsPerDay * v.price;
  const costPerMonth = unitsPerMonth * v.price;
  const costPerYear = unitsPerYear * v.price;

  const co2PerYearKg = unitsPerYear * fuel.co2PerUnit;
  const kmEquivalentPerYear = unitsPerYear * v.mileage;

  // What switching off would recover, net of the fuel each restart costs.
  const recoverableSignalSeconds = v.signals * Math.max(0, v.wait - RESTART_EQUIVALENT_SECONDS);
  const recoverableOtherSeconds = Math.max(0, otherSeconds - RESTART_EQUIVALENT_SECONDS);
  const recoverableSecondsPerDay = recoverableSignalSeconds + recoverableOtherSeconds;
  const recoverableSharePct =
    idleSecondsPerDay > 0 ? (recoverableSecondsPerDay / idleSecondsPerDay) * 100 : 0;

  const savableUnitsPerYear =
    ((idleUnitsPerHour * recoverableSecondsPerDay) / 3600) * v.days * 12;
  const savableCostPerYear = savableUnitsPerYear * v.price;
  const savableCo2PerYearKg = savableUnitsPerYear * fuel.co2PerUnit;

  const notes = [];
  if (idleSecondsPerDay <= 0) {
    notes.push("No idling entered, so there is nothing to recover. Add your signal count and average wait above.");
  } else if (v.signals > 0 && v.wait > 0 && v.wait <= RESTART_EQUIVALENT_SECONDS) {
    notes.push(
      `At ${round(v.wait)} seconds a halt, switching off saves almost nothing — a restart costs about ${RESTART_EQUIVALENT_SECONDS} seconds of idling.`,
    );
  } else if (v.signals > 0 && v.wait > RESTART_EQUIVALENT_SECONDS) {
    notes.push(
      `Every halt longer than ${RESTART_EQUIVALENT_SECONDS} seconds is worth switching off for; yours average ${round(v.wait)} seconds.`,
    );
  }
  if (acOn) {
    notes.push(
      "Idling with the AC on burns about 30% more than idling without it, because there is no airflow over the condenser to help.",
    );
  }
  if (idleMinutesPerDay > 45) {
    notes.push(
      `${round(idleMinutesPerDay)} minutes of idling a day is a lot. A factory idle-stop system would recover most of it automatically.`,
    );
  }

  return {
    fuelLabel: fuel.label,
    fuelUnit: fuel.unit,
    fuelUnitShort: fuel.unitShort,
    displacementL: round(v.displacement, 2),
    idleRatePerLitre: idleRate,
    acFactor,
    idleUnitsPerHour: round(idleUnitsPerHour, 3),
    signalSeconds: round(signalSeconds),
    otherSeconds: round(otherSeconds),
    idleMinutesPerDay: round(idleMinutesPerDay, 1),
    idleHoursPerYear: round((idleSecondsPerDay / 3600) * v.days * 12, 1),
    unitsPerDay: round(unitsPerDay, 3),
    unitsPerMonth: round(unitsPerMonth, 2),
    unitsPerYear: round(unitsPerYear, 1),
    costPerDay: round(costPerDay, 2),
    costPerMonth: round(costPerMonth),
    costPerYear: round(costPerYear),
    co2PerYearKg: round(co2PerYearKg),
    kmEquivalentPerYear: round(kmEquivalentPerYear),
    recoverableSharePct: round(recoverableSharePct, 1),
    savableUnitsPerYear: round(savableUnitsPerYear, 1),
    savableCostPerYear: round(savableCostPerYear),
    savableCo2PerYearKg: round(savableCo2PerYearKg),
    notes,
  };
}
