/**
 * Washing machine running cost.
 *
 * Energy per cycle is modelled the way appliance test standards (IS 302-2-7 /
 * IEC 60456 style cycle measurement) break it down:
 *
 *   energy = drum/pump/spin energy  +  energy to raise the wash water to the
 *            selected programme temperature
 *
 * Water heating dominates every warm or hot programme, which is why a cold
 * wash on the same machine costs a fraction of a 60 C wash.
 */

/** Specific heat capacity of liquid water, kJ per kg per degree C (standard value at ~25 C). */
export const SPECIFIC_HEAT_WATER_KJ_PER_KG_C = 4.186;

/** 1 kWh = 3600 kJ (1 kW for 3600 s). */
export const KJ_PER_KWH = 3600;

/** Density of water: 1 litre = 1 kg (close enough between 10 C and 90 C). */
export const KG_PER_LITRE = 1;

/**
 * In-drum immersion heaters sit inside the water they heat, so nearly all the
 * electrical input ends up in the water. The 5% loss covers the drum, cabinet
 * and the hot water still in the sump at drain.
 */
export const HEATER_EFFICIENCY = 0.95;

/** A month is 52/12 weeks, not 4 — using 4 understates the yearly bill by ~8%. */
export const WEEKS_PER_MONTH = 52 / 12;
export const WEEKS_PER_YEAR = 52;

/** Litres in a kilolitre — Indian water bills are quoted per kilolitre. */
export const LITRES_PER_KILOLITRE = 1000;

/**
 * Per-kilogram-of-rated-capacity figures.
 *
 * waterLitresPerKg  — typical full-programme water draw. BIS/BEE declared water
 *                     consumption puts a 7 kg front loader near 55-62 L a cycle
 *                     and a 7 kg fully automatic top loader near 105-120 L.
 * baseKwhPerKg      — motor, pump, valves and spin only (a cold programme).
 * heatedFraction    — share of total cycle water that is actually heated: only
 *                     the main wash fill is heated, the rinses run on cold mains.
 */
export const MACHINE_TYPES = {
  "front-load": {
    id: "front-load",
    label: "Front load (fully automatic)",
    waterLitresPerKg: 8.5,
    baseKwhPerKg: 0.045,
    heatedFraction: 0.4,
    hasBuiltInHeater: true,
    note: "Tumble action reuses a small amount of water many times, so it needs the least water and heats the least.",
  },
  "top-load-auto": {
    id: "top-load-auto",
    label: "Top load (fully automatic)",
    waterLitresPerKg: 16,
    baseKwhPerKg: 0.055,
    heatedFraction: 0.35,
    hasBuiltInHeater: false,
    note: "The drum has to be filled to float the clothes, so water use is roughly double a front loader.",
  },
  "semi-auto": {
    id: "semi-auto",
    label: "Semi automatic (twin tub)",
    waterLitresPerKg: 12,
    baseKwhPerKg: 0.03,
    heatedFraction: 0.5,
    hasBuiltInHeater: false,
    note: "Short wash and spin cycles with a simple motor, so the lowest electricity use — but you fill and drain it yourself.",
  },
};

/**
 * Programme temperatures. `null` means no heating at all: the machine washes at
 * whatever the mains water temperature happens to be.
 */
export const WASH_TEMPERATURES = [
  { id: "cold", label: "Cold / tap water", tempC: null },
  { id: "30", label: "30 °C warm", tempC: 30 },
  { id: "40", label: "40 °C warm", tempC: 40 },
  { id: "60", label: "60 °C hot", tempC: 60 },
  { id: "90", label: "90 °C boil wash", tempC: 90 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Energy needed to raise `litres` of water by `deltaT` degrees C, in kWh.
 * Returns 0 when there is nothing to heat.
 */
export function waterHeatingKwh(litres, deltaT, efficiency = HEATER_EFFICIENCY) {
  if (!isNum(litres) || !isNum(deltaT) || litres <= 0 || deltaT <= 0) return 0;
  if (!isNum(efficiency) || efficiency <= 0) return 0;
  const kj = litres * KG_PER_LITRE * SPECIFIC_HEAT_WATER_KJ_PER_KG_C * deltaT;
  return kj / KJ_PER_KWH / efficiency;
}

/**
 * Full per-wash and per-year running cost.
 * Returns { error } for any input that cannot produce a meaningful number.
 */
export function computeWashCost({
  machineType = "front-load",
  capacityKg = 7,
  washTempC = null,
  inletTempC = 25,
  washesPerWeek = 5,
  tariffPerKwh = 8,
  waterCostPerKilolitre = 20,
  detergentCostPerWash = 6,
} = {}) {
  const machine = MACHINE_TYPES[machineType];
  if (!machine) return { error: "Choose a machine type from the list." };

  const numbers = {
    capacityKg,
    inletTempC,
    washesPerWeek,
    tariffPerKwh,
    waterCostPerKilolitre,
    detergentCostPerWash,
  };
  for (const value of Object.values(numbers)) {
    if (!isNum(value)) return { error: "Enter valid numbers in every field." };
  }
  if (washTempC !== null && !isNum(washTempC)) {
    return { error: "Enter valid numbers in every field." };
  }

  if (capacityKg <= 0) return { error: "Machine capacity must be greater than zero." };
  if (capacityKg > 20) return { error: "Home washing machines are rated 5 kg to 12 kg — check the capacity." };
  if (inletTempC < -5 || inletTempC > 60) {
    return { error: "Inlet water temperature should be between -5 °C and 60 °C." };
  }
  if (washesPerWeek < 0) return { error: "Washes per week cannot be negative." };
  if (washesPerWeek > 50) return { error: "More than 50 washes a week is a laundry, not a home machine." };
  if (tariffPerKwh <= 0) return { error: "Electricity tariff must be greater than zero." };
  if (tariffPerKwh > 100) return { error: "Check the electricity tariff — it is entered per unit (kWh)." };
  if (waterCostPerKilolitre < 0 || detergentCostPerWash < 0) {
    return { error: "Water and detergent costs cannot be negative." };
  }

  const waterLitresPerWash = capacityKg * machine.waterLitresPerKg;
  const heatedLitres = waterLitresPerWash * machine.heatedFraction;
  const deltaT = washTempC === null ? 0 : Math.max(0, washTempC - inletTempC);

  const baseEnergyKwh = capacityKg * machine.baseKwhPerKg;
  const heatEnergyKwh = waterHeatingKwh(heatedLitres, deltaT);
  const energyPerWashKwh = baseEnergyKwh + heatEnergyKwh;

  const electricityCostPerWash = energyPerWashKwh * tariffPerKwh;
  const waterCostPerWash = (waterLitresPerWash / LITRES_PER_KILOLITRE) * waterCostPerKilolitre;
  const totalCostPerWash = electricityCostPerWash + waterCostPerWash + detergentCostPerWash;

  const washesPerMonth = washesPerWeek * WEEKS_PER_MONTH;
  const washesPerYear = washesPerWeek * WEEKS_PER_YEAR;

  return {
    machineLabel: machine.label,
    machineNote: machine.note,
    hasBuiltInHeater: machine.hasBuiltInHeater,
    deltaT,
    waterLitresPerWash,
    heatedLitres,
    baseEnergyKwh,
    heatEnergyKwh,
    energyPerWashKwh,
    electricityCostPerWash,
    waterCostPerWash,
    detergentCostPerWash,
    totalCostPerWash,
    heatingShareOfEnergy: energyPerWashKwh > 0 ? (heatEnergyKwh / energyPerWashKwh) * 100 : 0,
    washesPerMonth,
    washesPerYear,
    monthlyCost: totalCostPerWash * washesPerMonth,
    annualCost: totalCostPerWash * washesPerYear,
    annualKwh: energyPerWashKwh * washesPerYear,
    annualWaterKilolitres: (waterLitresPerWash * washesPerYear) / LITRES_PER_KILOLITRE,
    annualElectricityCost: electricityCostPerWash * washesPerYear,
    annualWaterCost: waterCostPerWash * washesPerYear,
  };
}

/**
 * Same machine and tariffs, every programme temperature — the table that shows
 * what a cold wash actually saves.
 */
export function buildTemperatureComparison(input = {}) {
  const rows = [];
  for (const option of WASH_TEMPERATURES) {
    const result = computeWashCost({ ...input, washTempC: option.tempC });
    if (result.error) return { error: result.error };
    rows.push({
      id: option.id,
      label: option.label,
      tempC: option.tempC,
      energyPerWashKwh: result.energyPerWashKwh,
      totalCostPerWash: result.totalCostPerWash,
      annualCost: result.annualCost,
    });
  }
  const cheapest = rows.reduce((best, row) => (row.annualCost < best.annualCost ? row : best), rows[0]);
  return {
    rows,
    cheapestId: cheapest.id,
    cheapestAnnualCost: cheapest.annualCost,
  };
}
