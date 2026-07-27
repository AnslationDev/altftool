/**
 * Road trip fuel cost.
 *
 *   totalDistance   = oneWay x (returnTrip ? 2 : 1)
 *   effectiveMileage = ratedMileage x conditionFactor x acFactor x roofFactor
 *   fuelUnits       = totalDistance / effectiveMileage
 *   fuelCost        = fuelUnits x pricePerUnit
 *   tripCost        = fuelCost + tolls + parkingAndMisc
 *   perHead         = tripCost / travellers
 *
 * Refuel stops assume you leave with a full tank and never run below the reserve:
 *   usableTank  = tankCapacity x USABLE_TANK_FRACTION
 *   rangePerTank = usableTank x effectiveMileage
 *   stops        = max(0, ceil(totalDistance / rangePerTank) - 1)
 */

/** Fraction of a tank you can plan on using before the reserve light and a hunt for a pump. */
export const USABLE_TANK_FRACTION = 0.9;

/**
 * Fuels, with the unit they are sold in and the tank-to-wheel CO2 released per unit.
 * Petrol 2.31 kg/litre and diesel 2.68 kg/litre are the standard combustion factors.
 * CNG is quoted per kg: burning 1 kg of methane yields 44/16 = 2.75 kg of CO2.
 * Auto LPG is taken at the commonly published 1.51 kg of CO2 per litre.
 */
export const FUEL_TYPES = [
  { value: "petrol", label: "Petrol", unit: "litre", unitShort: "L", mileageLabel: "km/l", co2PerUnit: 2.31 },
  { value: "diesel", label: "Diesel", unit: "litre", unitShort: "L", mileageLabel: "km/l", co2PerUnit: 2.68 },
  { value: "cng", label: "CNG", unit: "kg", unitShort: "kg", mileageLabel: "km/kg", co2PerUnit: 2.75 },
  { value: "lpg", label: "Auto LPG", unit: "litre", unitShort: "L", mileageLabel: "km/l", co2PerUnit: 1.51 },
];

/**
 * Mileage multipliers against the rated (combined-cycle) figure. Steady highway cruising
 * beats the combined figure; stop-start city driving and continuous ghat climbs are well
 * below it. These are the widely used rules of thumb, not type-approval numbers.
 */
export const ROAD_CONDITIONS = [
  { value: "highway", label: "Open highway cruising", factor: 1.1 },
  { value: "mixed", label: "Mixed highway and towns", factor: 1 },
  { value: "city", label: "City and heavy traffic", factor: 0.8 },
  { value: "hills", label: "Hills and ghat roads", factor: 0.75 },
];

/** Air conditioning costs roughly 5-10% of fuel on a highway run; 7% is used here. */
export const AC_FACTOR = 0.93;

/** A loaded roof carrier is a large aerodynamic penalty at highway speed, commonly 5-15%. */
export const ROOF_CARRIER_FACTOR = 0.9;

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
 * @param {number|string} input.oneWayKm One-way trip distance, km.
 * @param {boolean} [input.returnTrip] Whether you are driving back too.
 * @param {number|string} input.mileage Rated mileage in km per litre or km per kg.
 * @param {string} [input.fuelType] One of FUEL_TYPES values.
 * @param {number|string} [input.fuelPrice] Price per litre or per kg, INR.
 * @param {string} [input.condition] One of ROAD_CONDITIONS values.
 * @param {boolean} [input.acOn] Air conditioning running most of the trip.
 * @param {boolean} [input.roofCarrier] Loaded roof box or carrier fitted.
 * @param {number|string} [input.tankCapacity] Tank size in litres or kg.
 * @param {number|string} [input.tolls] Total tolls both ways, INR.
 * @param {number|string} [input.miscCost] Parking, permits and other fixed costs, INR.
 * @param {number|string} [input.travellers] People splitting the cost.
 * @param {number|string} [input.avgSpeed] Average moving speed, km/h.
 * @param {number|string} [input.breakMinutes] Total planned break time, minutes.
 */
export function computeRoadTripCost({
  oneWayKm,
  returnTrip = true,
  mileage,
  fuelType = "petrol",
  fuelPrice = 105,
  condition = "highway",
  acOn = true,
  roofCarrier = false,
  tankCapacity = 42,
  tolls = 1200,
  miscCost = 0,
  travellers = 4,
  avgSpeed = 60,
  breakMinutes = 60,
} = {}) {
  const fuel = findOption(FUEL_TYPES, fuelType);
  const road = findOption(ROAD_CONDITIONS, condition);
  if (!fuel || !road) return { error: "Choose a valid fuel type and road condition." };

  const v = {
    oneWay: toNumber(oneWayKm),
    rated: toNumber(mileage),
    price: toNumber(fuelPrice),
    tank: toNumber(tankCapacity),
    toll: toNumber(tolls),
    misc: toNumber(miscCost),
    people: toNumber(travellers),
    speed: toNumber(avgSpeed),
    breaks: toNumber(breakMinutes),
  };

  if (Object.values(v).some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (!(v.oneWay > 0)) return { error: "Enter a one-way distance greater than zero." };
  if (v.oneWay > 20000) return { error: "Enter a one-way distance under 20,000 km." };
  if (!(v.rated > 0)) return { error: `Enter the vehicle's mileage in ${fuel.mileageLabel}.` };
  if (v.rated > 100) return { error: "Mileage above 100 km per unit is not realistic for a road vehicle." };
  if (v.price < 0 || v.toll < 0 || v.misc < 0) return { error: "Prices and costs cannot be negative." };
  if (!(v.tank > 0)) return { error: "Enter a tank capacity greater than zero." };
  if (v.tank > 500) return { error: "Enter a tank capacity under 500 units." };
  if (!(v.people >= 1)) return { error: "There has to be at least one traveller." };
  if (v.people > 60) return { error: "Enter 60 travellers or fewer." };
  if (!(v.speed > 0)) return { error: "Enter an average speed greater than zero." };
  if (v.speed > 200) return { error: "Enter an average speed under 200 km/h." };
  if (v.breaks < 0 || v.breaks > 10080) return { error: "Break time should be between 0 minutes and one week." };

  const totalKm = v.oneWay * (returnTrip ? 2 : 1);
  const acFactor = acOn ? AC_FACTOR : 1;
  const roofFactor = roofCarrier ? ROOF_CARRIER_FACTOR : 1;
  const effectiveMileage = v.rated * road.factor * acFactor * roofFactor;

  const fuelUnits = totalKm / effectiveMileage;
  const fuelCost = fuelUnits * v.price;
  const tripCost = fuelCost + v.toll + v.misc;
  const perHead = tripCost / v.people;
  const costPerKm = tripCost / totalKm;
  const fuelCostPerKm = fuelCost / totalKm;

  const usableTank = v.tank * USABLE_TANK_FRACTION;
  const rangePerTank = usableTank * effectiveMileage;
  const refuelStops = Math.max(0, Math.ceil(totalKm / rangePerTank) - 1);

  const drivingHours = totalKm / v.speed;
  const totalHours = drivingHours + v.breaks / 60;

  const co2Kg = fuelUnits * fuel.co2PerUnit;
  const co2PerHeadKg = co2Kg / v.people;

  const notes = [];
  if (refuelStops === 0) {
    notes.push(
      `A full tank covers about ${round(rangePerTank)} km on these settings, so the whole trip fits without refuelling.`,
    );
  } else {
    notes.push(
      `Plan ${refuelStops} refuel stop${refuelStops === 1 ? "" : "s"} — usable range is about ${round(rangePerTank)} km per tank.`,
    );
  }
  if (drivingHours > 10) {
    notes.push(
      `${round(drivingHours, 1)} hours of driving is beyond what one driver should do in a day. Split the trip or share the wheel.`,
    );
  }
  if (roofCarrier) {
    notes.push("A loaded roof carrier costs roughly 10% of your fuel at highway speed — remove it if you can pack inside.");
  }

  return {
    totalKm: round(totalKm, 1),
    oneWayKm: round(v.oneWay, 1),
    returnTrip,
    ratedMileage: round(v.rated, 2),
    conditionLabel: road.label,
    conditionFactor: road.factor,
    acFactor,
    roofFactor,
    effectiveMileage: round(effectiveMileage, 2),
    mileageLabel: fuel.mileageLabel,
    fuelLabel: fuel.label,
    fuelUnitShort: fuel.unitShort,
    fuelUnits: round(fuelUnits, 2),
    fuelPrice: round(v.price, 2),
    fuelCost: round(fuelCost),
    tolls: round(v.toll),
    miscCost: round(v.misc),
    tripCost: round(tripCost),
    travellers: Math.round(v.people),
    perHead: round(perHead),
    costPerKm: round(costPerKm, 2),
    fuelCostPerKm: round(fuelCostPerKm, 2),
    usableTank: round(usableTank, 1),
    rangePerTank: round(rangePerTank),
    refuelStops,
    drivingHours: round(drivingHours, 1),
    breakHours: round(v.breaks / 60, 1),
    totalHours: round(totalHours, 1),
    co2Kg: round(co2Kg, 1),
    co2PerHeadKg: round(co2PerHeadKg, 1),
    notes,
  };
}
