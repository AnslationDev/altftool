/**
 * Appliance-wise electricity cost.
 *
 * The billing unit on an Indian electricity bill is one kilowatt-hour (kWh),
 * also called a "unit". An appliance consumes:
 *
 *   kWh per day   = watts x hours run per day x how many you have / 1000
 *   kWh per month = kWh per day x days used in the month
 *   energy charge = kWh per month x tariff per unit
 *
 * A domestic bill then adds a fixed charge (levied per kW of sanctioned load,
 * whether or not you consume anything) and electricity duty, which every state
 * levies as a percentage of the energy charge under its own electricity duty
 * act. Both are entered here because they differ by state and by consumer
 * category.
 *
 * Typical wattages below are the ratings printed on common Indian appliances.
 * The nameplate on your own device is always the better number — a BEE 5 star
 * inverter air conditioner draws far less than a 3 star fixed-speed one.
 */

/** Exact mechanical to electrical conversion: 1 horsepower = 745.7 watts. */
export const WATTS_PER_HP = 745.7;

/**
 * Average CO2 emitted per unit of grid electricity in India, from the Central
 * Electricity Authority's CO2 baseline database. Rounded, and it falls every
 * year as renewables grow.
 */
export const GRID_EMISSION_KG_PER_KWH = 0.71;

export const MAX_HOURS_PER_DAY = 24;
export const MAX_DAYS_PER_MONTH = 31;
export const MONTHS_IN_YEAR = 12;

/** Typical nameplate wattage of common household appliances. */
export const APPLIANCE_PRESETS = [
  { id: "fan", label: "Ceiling fan", watts: 70, hours: 10 },
  { id: "led-bulb", label: "LED bulb", watts: 9, hours: 6 },
  { id: "led-tube", label: "LED tube light", watts: 20, hours: 6 },
  { id: "fridge", label: "Refrigerator, 250 L", watts: 150, hours: 8 },
  { id: "ac-3star", label: "Split AC 1.5 ton, 3 star", watts: 1500, hours: 6 },
  { id: "ac-5star", label: "Split AC 1.5 ton, 5 star inverter", watts: 1100, hours: 6 },
  { id: "window-ac", label: "Window AC 1.5 ton", watts: 1800, hours: 6 },
  { id: "cooler", label: "Air cooler", watts: 200, hours: 8 },
  { id: "geyser", label: "Water heater, 15 L", watts: 2000, hours: 1 },
  { id: "washing", label: "Washing machine", watts: 500, hours: 1 },
  { id: "microwave", label: "Microwave oven", watts: 1200, hours: 0.5 },
  { id: "induction", label: "Induction cooktop", watts: 2000, hours: 1 },
  { id: "mixer", label: "Mixer grinder", watts: 500, hours: 0.5 },
  { id: "iron", label: "Clothes iron", watts: 1000, hours: 0.5 },
  { id: "tv", label: 'LED television, 43"', watts: 80, hours: 5 },
  { id: "laptop", label: "Laptop", watts: 65, hours: 8 },
  { id: "desktop", label: "Desktop computer", watts: 200, hours: 8 },
  { id: "pump", label: "Water pump, 1 HP", watts: Math.round(WATTS_PER_HP), hours: 1 },
  { id: "router", label: "Wi-Fi router", watts: 10, hours: 24 },
  { id: "chimney", label: "Kitchen chimney", watts: 250, hours: 1 },
];

export function presetById(id) {
  return APPLIANCE_PRESETS.find((preset) => preset.id === id) || null;
}

/** Convert a motor rating in horsepower to watts. */
export function hpToWatts(hp) {
  if (typeof hp !== "number" || !Number.isFinite(hp) || hp < 0) {
    return { error: "Enter a valid horsepower rating." };
  }
  return { watts: hp * WATTS_PER_HP };
}

/**
 * Units and cost for one appliance.
 *
 * @param {object} item { name, watts, hoursPerDay, quantity, daysPerMonth }
 * @returns {object} usage or { error }
 */
export function applianceUsage(item) {
  const watts = Number(item.watts);
  const hoursPerDay = Number(item.hoursPerDay);
  const quantity = Number(item.quantity);
  const daysPerMonth = Number(item.daysPerMonth);
  const name = item.name || "Appliance";

  if ([watts, hoursPerDay, quantity, daysPerMonth].some((n) => !Number.isFinite(n))) {
    return { error: `Enter valid numbers for ${name}.` };
  }
  if (watts < 0) return { error: `${name}: wattage cannot be negative.` };
  if (quantity < 0) return { error: `${name}: quantity cannot be negative.` };
  if (hoursPerDay < 0 || hoursPerDay > MAX_HOURS_PER_DAY) {
    return { error: `${name}: hours a day must be between 0 and ${MAX_HOURS_PER_DAY}.` };
  }
  if (daysPerMonth < 0 || daysPerMonth > MAX_DAYS_PER_MONTH) {
    return { error: `${name}: days a month must be between 0 and ${MAX_DAYS_PER_MONTH}.` };
  }

  const kwhPerDay = (watts * hoursPerDay * quantity) / 1000;
  return {
    kwhPerDay,
    kwhPerMonth: kwhPerDay * daysPerMonth,
    kwhPerYear: kwhPerDay * daysPerMonth * MONTHS_IN_YEAR,
    connectedLoadKw: (watts * quantity) / 1000,
  };
}

/**
 * Whole-bill estimate.
 *
 * @param {object} input
 * @param {Array}  input.appliances  [{ id, name, watts, hoursPerDay, quantity, daysPerMonth }]
 * @param {number} input.tariff      Energy charge per unit, INR.
 * @param {number} input.fixedCharge Fixed / demand charge for the month, INR.
 * @param {number} input.dutyPercent Electricity duty on the energy charge, %.
 * @returns {object} bill or { error }
 */
export function estimateBill({ appliances = [], tariff, fixedCharge = 0, dutyPercent = 0 }) {
  if (!Array.isArray(appliances) || appliances.length === 0) {
    return { error: "Add at least one appliance." };
  }
  if (typeof tariff !== "number" || !Number.isFinite(tariff) || tariff <= 0) {
    return { error: "Enter the tariff per unit as a number greater than zero." };
  }
  if (typeof fixedCharge !== "number" || !Number.isFinite(fixedCharge) || fixedCharge < 0) {
    return { error: "Fixed charges cannot be negative." };
  }
  if (typeof dutyPercent !== "number" || !Number.isFinite(dutyPercent) || dutyPercent < 0 || dutyPercent > 50) {
    return { error: "Electricity duty should be between 0% and 50%." };
  }

  const rows = [];
  let totalKwh = 0;
  let connectedLoadKw = 0;

  for (const item of appliances) {
    const usage = applianceUsage(item);
    if (usage.error) return { error: usage.error };
    totalKwh += usage.kwhPerMonth;
    connectedLoadKw += usage.connectedLoadKw;
    rows.push({
      id: item.id,
      name: item.name || "Appliance",
      watts: Number(item.watts),
      quantity: Number(item.quantity),
      hoursPerDay: Number(item.hoursPerDay),
      daysPerMonth: Number(item.daysPerMonth),
      kwhPerDay: usage.kwhPerDay,
      kwhPerMonth: usage.kwhPerMonth,
      kwhPerYear: usage.kwhPerYear,
      monthlyCost: usage.kwhPerMonth * tariff,
      annualCost: usage.kwhPerYear * tariff,
    });
  }

  const energyCharge = totalKwh * tariff;
  const duty = (energyCharge * dutyPercent) / 100;
  const totalBill = energyCharge + duty + fixedCharge;

  const ranked = [...rows].sort((a, b) => b.kwhPerMonth - a.kwhPerMonth);

  return {
    rows: rows.map((row) => ({
      ...row,
      sharePercent: totalKwh > 0 ? (row.kwhPerMonth / totalKwh) * 100 : 0,
    })),
    ranked: ranked.map((row) => ({
      ...row,
      sharePercent: totalKwh > 0 ? (row.kwhPerMonth / totalKwh) * 100 : 0,
    })),
    biggest: ranked.length > 0 ? ranked[0] : null,
    totalKwh,
    totalKwhPerYear: totalKwh * MONTHS_IN_YEAR,
    connectedLoadKw,
    energyCharge,
    duty,
    fixedCharge,
    totalBill,
    annualBill: totalBill * MONTHS_IN_YEAR,
    effectiveRatePerUnit: totalKwh > 0 ? totalBill / totalKwh : 0,
    co2KgPerMonth: totalKwh * GRID_EMISSION_KG_PER_KWH,
    co2KgPerYear: totalKwh * MONTHS_IN_YEAR * GRID_EMISSION_KG_PER_KWH,
  };
}
