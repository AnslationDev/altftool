/**
 * Standby ("vampire") power cost.
 *
 * Every device costs the same way:
 *
 *   kWh per year = watts x quantity x hours in standby per day x 365 / 1000
 *
 * The interesting part is not the arithmetic, it is that the biggest offenders
 * are almost never the ones people unplug. A phone charger left in the socket
 * draws under 0.1 W; a DTH set-top box in "standby" can draw 15 W, which is
 * 150 times more, all year.
 */

/** Hours in a day, days in a year, watts in a kilowatt. */
export const HOURS_PER_DAY = 24;
export const DAYS_PER_YEAR = 365;
export const WATTS_PER_KW = 1000;
export const MONTHS_PER_YEAR = 12;

/**
 * Grid emission factor for India, kg CO2 per kWh. The CEA CO2 Baseline Database
 * puts the weighted average of the Indian grid at roughly 0.71 kg per kWh.
 */
export const GRID_EMISSION_FACTOR_KG_PER_KWH = 0.71;

/**
 * The IEA "1-watt plan" target that most modern appliances are designed to meet
 * in true standby. Anything far above this is worth switching off at the socket.
 */
export const ONE_WATT_TARGET = 1;

/**
 * Typical measured standby / idle draw in watts, in line with published standby
 * power measurements (LBNL standby power tables and the IEA 1-watt work).
 * `hoursPerDay` is how long the device typically sits idle rather than in use.
 */
export const DEVICE_PRESETS = [
  { id: "dth-box", label: "DTH / cable set-top box", watts: 15, hoursPerDay: 20 },
  { id: "wifi-router", label: "Wi-Fi router (always on)", watts: 6, hoursPerDay: 24 },
  { id: "inverter", label: "Home inverter on float charge", watts: 20, hoursPerDay: 24 },
  { id: "ro-purifier", label: "RO water purifier", watts: 3, hoursPerDay: 23 },
  { id: "led-tv", label: "LED television on standby", watts: 0.5, hoursPerDay: 20 },
  { id: "microwave", label: "Microwave clock display", watts: 3, hoursPerDay: 23 },
  { id: "ac-standby", label: "Air conditioner remote receiver", watts: 2.5, hoursPerDay: 22 },
  { id: "desktop-sleep", label: "Desktop PC asleep", watts: 3, hoursPerDay: 16 },
  { id: "console", label: "Game console in rest mode", watts: 10, hoursPerDay: 20 },
  { id: "printer", label: "Printer idle", watts: 3, hoursPerDay: 23 },
  { id: "soundbar", label: "Soundbar / music system", watts: 2, hoursPerDay: 21 },
  { id: "smart-speaker", label: "Smart speaker listening", watts: 2, hoursPerDay: 24 },
  { id: "washing-machine", label: "Washing machine display", watts: 1, hoursPerDay: 23 },
  { id: "laptop-charger", label: "Laptop charger, no laptop", watts: 0.3, hoursPerDay: 16 },
  { id: "phone-charger", label: "Phone charger, no phone", watts: 0.1, hoursPerDay: 20 },
];

/** A sensible starting home, so the tool shows a real number at first paint. */
export const DEFAULT_HOME = [
  { presetId: "dth-box", quantity: 1 },
  { presetId: "wifi-router", quantity: 1 },
  { presetId: "led-tv", quantity: 1 },
  { presetId: "microwave", quantity: 1 },
  { presetId: "ac-standby", quantity: 2 },
  { presetId: "phone-charger", quantity: 2 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Annual kWh for one device line. */
export function deviceAnnualKwh({ watts, quantity, hoursPerDay }) {
  if (!isNum(watts) || !isNum(quantity) || !isNum(hoursPerDay)) return 0;
  if (watts <= 0 || quantity <= 0 || hoursPerDay <= 0) return 0;
  return (watts * quantity * Math.min(HOURS_PER_DAY, hoursPerDay) * DAYS_PER_YEAR) / WATTS_PER_KW;
}

/**
 * Total standby cost for a list of devices.
 * Each device is { label, watts, quantity, hoursPerDay }.
 * Returns { error } when the list or the tariff cannot give a meaningful answer.
 */
export function computeStandbyCost({
  devices = [],
  tariffPerKwh = 8,
  emissionFactorKgPerKwh = GRID_EMISSION_FACTOR_KG_PER_KWH,
} = {}) {
  if (!Array.isArray(devices) || devices.length === 0) {
    return { error: "Add at least one device to see what standby is costing you." };
  }
  if (!isNum(tariffPerKwh)) return { error: "Enter a valid electricity tariff." };
  if (tariffPerKwh <= 0) return { error: "Electricity tariff must be greater than zero." };
  if (tariffPerKwh > 100) return { error: "Check the tariff — it is entered in rupees per unit (kWh)." };

  const rows = [];
  for (const device of devices) {
    const { label, watts, quantity, hoursPerDay } = device;
    if (![watts, quantity, hoursPerDay].every(isNum)) {
      return { error: `Enter valid numbers for "${label || "the device"}".` };
    }
    if (watts < 0 || quantity < 0 || hoursPerDay < 0) {
      return { error: "Watts, quantity and hours cannot be negative." };
    }
    if (hoursPerDay > HOURS_PER_DAY) return { error: "A device cannot idle for more than 24 hours a day." };
    if (watts > 1000) return { error: "Standby draw above 1000 W is not standby — check that figure." };
    if (quantity > 200) return { error: "More than 200 of one device looks like a typo." };

    const annualKwh = deviceAnnualKwh({ watts, quantity, hoursPerDay });
    rows.push({
      ...device,
      continuousWatts: watts * quantity * (Math.min(HOURS_PER_DAY, hoursPerDay) / HOURS_PER_DAY),
      annualKwh,
      annualCost: annualKwh * tariffPerKwh,
      monthlyCost: (annualKwh * tariffPerKwh) / MONTHS_PER_YEAR,
      aboveOneWatt: watts > ONE_WATT_TARGET,
    });
  }

  const annualKwh = rows.reduce((sum, row) => sum + row.annualKwh, 0);
  const annualCost = annualKwh * tariffPerKwh;
  const ranked = [...rows].sort((a, b) => b.annualCost - a.annualCost);
  const worst = ranked[0] ?? null;

  const avoidableKwh = rows
    .filter((row) => row.aboveOneWatt)
    .reduce((sum, row) => sum + row.annualKwh, 0);

  const emissionFactor = isNum(emissionFactorKgPerKwh) && emissionFactorKgPerKwh >= 0
    ? emissionFactorKgPerKwh
    : GRID_EMISSION_FACTOR_KG_PER_KWH;

  return {
    rows,
    ranked,
    worst,
    deviceCount: rows.reduce((sum, row) => sum + row.quantity, 0),
    continuousWatts: rows.reduce((sum, row) => sum + row.continuousWatts, 0),
    dailyKwh: annualKwh / DAYS_PER_YEAR,
    monthlyKwh: annualKwh / MONTHS_PER_YEAR,
    annualKwh,
    monthlyCost: annualCost / MONTHS_PER_YEAR,
    annualCost,
    tenYearCost: annualCost * 10,
    avoidableKwh,
    avoidableCost: avoidableKwh * tariffPerKwh,
    annualCo2Kg: annualKwh * emissionFactor,
  };
}
