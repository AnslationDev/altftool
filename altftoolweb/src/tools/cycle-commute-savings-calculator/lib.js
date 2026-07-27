/**
 * Cycle commute savings.
 *
 * Money saved = fuel (or fare) + parking + per-km maintenance you no longer pay,
 * minus what the bicycle itself costs to run. Emissions saved come from the
 * tank-to-wheel combustion factors: burning one litre of petrol releases about
 * 2.31 kg of CO2 and one litre of diesel about 2.68 kg, because the carbon in
 * the fuel leaves as CO2 regardless of how efficiently the engine runs.
 */

/** Tank-to-wheel CO2 released per unit of fuel burned. */
export const CO2_PER_UNIT = {
  petrolLitre: 2.31,
  dieselLitre: 2.68,
  cngKg: 2.75,
  /**
   * Indian grid emission factor. The CEA CO2 Baseline Database puts the
   * national average around 0.71 kg CO2 per kWh generated; a rooftop-solar
   * charger would be far lower.
   */
  gridKwh: 0.71,
};

/**
 * A mature broadleaf tree sequesters roughly 21 kg of CO2 a year — the figure
 * commonly used for carbon-offset comparisons. It varies hugely by species,
 * age and climate, so treat it as an illustration, not an accounting entry.
 */
export const KG_CO2_PER_TREE_YEAR = 21;

export const MONTHS_PER_YEAR = 12;

/**
 * Modes you might be replacing. Efficiency, price and maintenance defaults are
 * typical Indian 2025-26 figures and are all editable in the UI.
 * `pricing: "fuel"` charges by fuel consumed; `pricing: "perKm"` charges a fare.
 */
export const MODES = {
  petrolBike: {
    label: "Petrol motorcycle or scooter",
    pricing: "fuel",
    unit: "litre",
    unitLabel: "km per litre",
    priceLabel: "Petrol price per litre",
    defaultEfficiency: 45,
    defaultPrice: 105,
    co2PerUnit: CO2_PER_UNIT.petrolLitre,
    defaultMaintPerKm: 0.6,
  },
  petrolCar: {
    label: "Petrol car",
    pricing: "fuel",
    unit: "litre",
    unitLabel: "km per litre",
    priceLabel: "Petrol price per litre",
    defaultEfficiency: 14,
    defaultPrice: 105,
    co2PerUnit: CO2_PER_UNIT.petrolLitre,
    defaultMaintPerKm: 2.5,
  },
  dieselCar: {
    label: "Diesel car",
    pricing: "fuel",
    unit: "litre",
    unitLabel: "km per litre",
    priceLabel: "Diesel price per litre",
    defaultEfficiency: 18,
    defaultPrice: 92,
    co2PerUnit: CO2_PER_UNIT.dieselLitre,
    defaultMaintPerKm: 2.5,
  },
  cngCar: {
    label: "CNG car",
    pricing: "fuel",
    unit: "kg",
    unitLabel: "km per kg",
    priceLabel: "CNG price per kg",
    defaultEfficiency: 22,
    defaultPrice: 80,
    co2PerUnit: CO2_PER_UNIT.cngKg,
    defaultMaintPerKm: 2.2,
  },
  evScooter: {
    label: "Electric scooter",
    pricing: "fuel",
    unit: "kWh",
    unitLabel: "km per kWh",
    priceLabel: "Electricity tariff per kWh",
    defaultEfficiency: 35,
    defaultPrice: 8,
    co2PerUnit: CO2_PER_UNIT.gridKwh,
    defaultMaintPerKm: 0.35,
  },
  evCar: {
    label: "Electric car",
    pricing: "fuel",
    unit: "kWh",
    unitLabel: "km per kWh",
    priceLabel: "Electricity tariff per kWh",
    defaultEfficiency: 6.5,
    defaultPrice: 8,
    co2PerUnit: CO2_PER_UNIT.gridKwh,
    defaultMaintPerKm: 1.2,
  },
  cab: {
    label: "Cab or auto-rickshaw (pay per km)",
    pricing: "perKm",
    unit: "km",
    unitLabel: "Fare per km",
    priceLabel: "Fare per km",
    defaultEfficiency: 18,
    defaultPrice: 18,
    /** 2.31 kg CO2 per litre at an assumed 16.5 km/l fleet average = 0.14 kg/km. */
    co2PerKm: 0.14,
    defaultMaintPerKm: 0,
  },
};

/** Typical bicycle running cost: tyres, chain, brake pads and servicing. */
export const DEFAULT_BIKE_COST_PER_KM = 0.5;

const MAX_DISTANCE_KM = 200;
const MAX_DAYS_PER_MONTH = 31;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const nonNeg = (value, fallback = 0) => (isNum(value) && value >= 0 ? value : fallback);

export function computeCommuteSavings({
  oneWayKm,
  daysPerMonth = 22,
  mode = "petrolBike",
  efficiency,
  fuelPrice,
  parkingPerDay = 0,
  tollsPerDay = 0,
  maintPerKm,
  bicycleCost = 0,
  bicycleCostPerKm = DEFAULT_BIKE_COST_PER_KM,
  drivingSpeedKmph = 25,
  cyclingSpeedKmph = 16,
} = {}) {
  if (!isNum(oneWayKm) || !isNum(daysPerMonth)) {
    return { error: "Enter your one-way distance and commuting days as numbers." };
  }
  if (oneWayKm <= 0 || oneWayKm > MAX_DISTANCE_KM) {
    return { error: `One-way distance must be between 0 and ${MAX_DISTANCE_KM} km.` };
  }
  if (daysPerMonth <= 0 || daysPerMonth > MAX_DAYS_PER_MONTH) {
    return { error: `Commuting days must be between 1 and ${MAX_DAYS_PER_MONTH} a month.` };
  }
  const config = MODES[mode];
  if (!config) return { error: "Pick the mode of transport you are replacing." };

  const eff = isNum(efficiency) && efficiency > 0 ? efficiency : config.defaultEfficiency;
  const price = nonNeg(fuelPrice, config.defaultPrice);
  const maint = nonNeg(maintPerKm, config.defaultMaintPerKm);
  const parking = nonNeg(parkingPerDay);
  const tolls = nonNeg(tollsPerDay);
  const bikeCost = nonNeg(bicycleCost);
  const bikePerKm = nonNeg(bicycleCostPerKm, DEFAULT_BIKE_COST_PER_KM);
  if (config.pricing === "fuel" && !(eff > 0)) {
    return { error: "Fuel efficiency must be greater than zero." };
  }
  const driveSpeed = isNum(drivingSpeedKmph) && drivingSpeedKmph > 0 ? drivingSpeedKmph : 25;
  const cycleSpeed = isNum(cyclingSpeedKmph) && cyclingSpeedKmph > 0 ? cyclingSpeedKmph : 16;

  const kmPerDay = oneWayKm * 2;
  const kmPerMonth = kmPerDay * daysPerMonth;
  const kmPerYear = kmPerMonth * MONTHS_PER_YEAR;

  let fuelUnitsPerMonth = 0;
  let fuelCostPerMonth = 0;
  let co2PerMonthKg = 0;

  if (config.pricing === "fuel") {
    fuelUnitsPerMonth = kmPerMonth / eff;
    fuelCostPerMonth = fuelUnitsPerMonth * price;
    co2PerMonthKg = fuelUnitsPerMonth * config.co2PerUnit;
  } else {
    fuelCostPerMonth = kmPerMonth * price;
    co2PerMonthKg = kmPerMonth * config.co2PerKm;
  }

  const parkingPerMonth = parking * daysPerMonth;
  const tollsPerMonth = tolls * daysPerMonth;
  const maintPerMonth = kmPerMonth * maint;
  const grossPerMonth = fuelCostPerMonth + parkingPerMonth + tollsPerMonth + maintPerMonth;
  const bicycleRunningPerMonth = kmPerMonth * bikePerKm;
  const netPerMonth = grossPerMonth - bicycleRunningPerMonth;

  const paybackMonths = netPerMonth > 0 && bikeCost > 0 ? bikeCost / netPerMonth : null;
  const firstYearNet = netPerMonth * MONTHS_PER_YEAR - bikeCost;

  const driveMinutesPerDay = (kmPerDay / driveSpeed) * 60;
  const cycleMinutesPerDay = (kmPerDay / cycleSpeed) * 60;

  return {
    modeLabel: config.label,
    config,
    efficiency: eff,
    fuelPrice: price,
    kmPerDay,
    kmPerMonth,
    kmPerYear,
    fuelUnitsPerMonth,
    fuelUnitsPerYear: fuelUnitsPerMonth * MONTHS_PER_YEAR,
    fuelCostPerMonth,
    parkingPerMonth,
    tollsPerMonth,
    maintPerMonth,
    grossPerMonth,
    bicycleRunningPerMonth,
    netPerMonth,
    netPerYear: netPerMonth * MONTHS_PER_YEAR,
    firstYearNet,
    bicycleCost: bikeCost,
    paybackMonths,
    co2PerMonthKg,
    co2PerYearKg: co2PerMonthKg * MONTHS_PER_YEAR,
    treesEquivalent: (co2PerMonthKg * MONTHS_PER_YEAR) / KG_CO2_PER_TREE_YEAR,
    driveMinutesPerDay,
    cycleMinutesPerDay,
    extraMinutesPerDay: cycleMinutesPerDay - driveMinutesPerDay,
  };
}
