/**
 * Phantom load (standby power) accounting.
 *
 * Phantom load is the power a device draws while switched "off" or idle but
 * still plugged in. The arithmetic is deliberately simple and exact:
 *
 *   annual kWh = watts x hours per day x 365 / 1000
 *   annual cost = annual kWh x tariff per kWh
 *
 * The default wattages below are typical measured standby figures of the kind
 * published in the Lawrence Berkeley National Laboratory Standby Power
 * Summary Table. They are starting points, not measurements of your own
 * hardware — every one is editable, and a plug-in energy meter will always
 * beat a table. Note that EU Ecodesign Regulation 1275/2008 has capped
 * off-mode draw for most new consumer appliances at 0.5 W since 2013, so
 * modern kit sits far below older equipment on this list.
 */

/** Days used to annualise a daily figure. */
export const DAYS_PER_YEAR = 365;

/** Watts in a kilowatt. */
const W_PER_KW = 1000;

/**
 * Grid emission factor for India, kg CO2 per kWh. Central Electricity
 * Authority CO2 Baseline Database, approximately 0.71 kg/kWh.
 */
export const GRID_EMISSION_FACTOR_KG_PER_KWH = 0.71;

/** Months in a year, for converting a monthly bill to an annual one. */
export const MONTHS_PER_YEAR = 12;

/**
 * Typical always-on and standby devices.
 *  watts        - typical standby / idle draw in watts
 *  hoursPerDay  - hours a day it sits in that state
 *  switchable   - hours a day you could realistically cut power at the socket
 */
export const PHANTOM_DEVICES = [
  { id: "set-top-box", name: "TV set-top box / DTH receiver", watts: 17, hoursPerDay: 20, switchable: 20, note: "The single worst offender in most homes — many draw nearly as much off as on." },
  { id: "dvr", name: "CCTV recorder (DVR/NVR)", watts: 15, hoursPerDay: 24, switchable: 0, note: "Genuinely needs to stay on if it is doing its job." },
  { id: "console", name: "Game console in instant-on mode", watts: 12, hoursPerDay: 22, switchable: 22, note: "Switching to full shutdown mode typically drops this below 1 W." },
  { id: "router", name: "Wi-Fi router", watts: 8, hoursPerDay: 24, switchable: 6, note: "Only switchable overnight, and not if anything else depends on it." },
  { id: "modem", name: "Broadband modem / fibre ONT", watts: 6, hoursPerDay: 24, switchable: 6, note: "Same overnight window as the router." },
  { id: "desktop-sleep", name: "Desktop PC asleep", watts: 4, hoursPerDay: 20, switchable: 20, note: "Shutting down instead of sleeping removes almost all of it." },
  { id: "microwave", name: "Microwave clock display", watts: 3, hoursPerDay: 23, switchable: 23, note: "The clock costs more over a year than the cooking for light users." },
  { id: "printer", name: "Printer on standby", watts: 3, hoursPerDay: 23, switchable: 23, note: "Inkjets may run a cleaning cycle when powered back up." },
  { id: "smart-speaker", name: "Smart speaker idle", watts: 2.5, hoursPerDay: 24, switchable: 0, note: "Needs power to hear the wake word." },
  { id: "ac-standby", name: "Air conditioner on standby", watts: 2, hoursPerDay: 24, switchable: 20, note: "Cutting the isolator in winter removes it entirely." },
  { id: "tv", name: "TV on standby", watts: 1, hoursPerDay: 22, switchable: 22, note: "Modern sets are capped at 0.5 W; older ones can be 5 W or more." },
  { id: "washing-machine", name: "Washing machine standby", watts: 1, hoursPerDay: 23, switchable: 23, note: "Small individually, but it runs every hour of the year." },
  { id: "laptop-charger", name: "Laptop charger left plugged in", watts: 0.4, hoursPerDay: 20, switchable: 20, note: "Small, but most homes have several." },
  { id: "phone-charger", name: "Phone charger with nothing attached", watts: 0.2, hoursPerDay: 22, switchable: 22, note: "The classic example, and in truth one of the smallest." },
];

const MAX_TARIFF = 100;
const MAX_WATTS = 5000;
const MAX_QTY = 50;
const HOURS_PER_DAY = 24;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Annual kWh for a single continuous load. */
export function annualKwh({ watts, hoursPerDay, qty = 1 }) {
  if (!isNum(watts) || !isNum(hoursPerDay) || !isNum(qty)) return null;
  if (watts < 0 || hoursPerDay < 0 || qty < 0 || hoursPerDay > HOURS_PER_DAY) return null;
  return (watts * qty * hoursPerDay * DAYS_PER_YEAR) / W_PER_KW;
}

/**
 * Total up a checklist of phantom loads.
 *
 * @param {object} input
 * @param {Array}  input.devices        [{ id, name, watts, qty, hoursPerDay, switchOffHoursPerDay }]
 * @param {number} input.tariffPerKwh   Electricity tariff per unit.
 * @param {number} [input.monthlyUnits] Household consumption a month, for the share figure.
 */
export function computePhantomLoad({ devices, tariffPerKwh, monthlyUnits = 0 }) {
  if (!Array.isArray(devices)) {
    return { error: "No device list was supplied." };
  }
  if (!isNum(tariffPerKwh) || !isNum(monthlyUnits)) {
    return { error: "Enter valid numbers for the tariff and monthly units." };
  }
  if (tariffPerKwh <= 0 || tariffPerKwh > MAX_TARIFF) {
    return { error: `Electricity tariff should be between 0 and ${MAX_TARIFF} per unit.` };
  }
  if (monthlyUnits < 0) {
    return { error: "Monthly consumption cannot be negative." };
  }

  const rows = [];
  for (const device of devices) {
    const watts = Number(device.watts);
    const qty = Number(device.qty);
    const hours = Number(device.hoursPerDay);
    const offHours = Number(device.switchOffHoursPerDay);

    if (![watts, qty, hours, offHours].every(isNum)) {
      return { error: `Check the numbers entered for "${device.name}".` };
    }
    if (watts < 0 || qty < 0 || hours < 0 || offHours < 0) {
      return { error: `Values for "${device.name}" cannot be negative.` };
    }
    if (watts > MAX_WATTS) {
      return { error: `${MAX_WATTS} W is beyond a standby load — check "${device.name}".` };
    }
    if (qty > MAX_QTY) {
      return { error: `Quantity for "${device.name}" should be ${MAX_QTY} or fewer.` };
    }
    if (hours > HOURS_PER_DAY) {
      return { error: `"${device.name}" cannot be on standby for more than 24 hours a day.` };
    }
    if (offHours > hours) {
      return {
        error: `You cannot switch "${device.name}" off for longer than it sits on standby.`,
      };
    }

    const kwh = (watts * qty * hours * DAYS_PER_YEAR) / W_PER_KW;
    const savableKwh = (watts * qty * offHours * DAYS_PER_YEAR) / W_PER_KW;

    rows.push({
      id: device.id,
      name: device.name,
      watts,
      qty,
      hoursPerDay: hours,
      switchOffHoursPerDay: offHours,
      totalWatts: watts * qty,
      annualKwh: kwh,
      annualCost: kwh * tariffPerKwh,
      savableKwh,
      savableCost: savableKwh * tariffPerKwh,
      dailyWh: watts * qty * hours,
    });
  }

  const totalKwh = rows.reduce((sum, row) => sum + row.annualKwh, 0);
  const totalCost = rows.reduce((sum, row) => sum + row.annualCost, 0);
  const savableKwh = rows.reduce((sum, row) => sum + row.savableKwh, 0);
  const savableCost = rows.reduce((sum, row) => sum + row.savableCost, 0);
  const standbyWatts = rows.reduce((sum, row) => sum + row.totalWatts, 0);

  const annualUnits = monthlyUnits * MONTHS_PER_YEAR;
  const shareOfBillPct = annualUnits > 0 ? (totalKwh / annualUnits) * 100 : null;

  const ranked = [...rows].sort((a, b) => b.annualCost - a.annualCost);
  const worst = ranked.length > 0 ? ranked[0] : null;

  return {
    rows,
    ranked,
    worst,
    deviceCount: rows.length,
    standbyWatts,
    totalKwh,
    totalCost,
    monthlyCost: totalCost / MONTHS_PER_YEAR,
    savableKwh,
    savableCost,
    savablePct: totalKwh > 0 ? (savableKwh / totalKwh) * 100 : 0,
    annualCo2Kg: totalKwh * GRID_EMISSION_FACTOR_KG_PER_KWH,
    savableCo2Kg: savableKwh * GRID_EMISSION_FACTOR_KG_PER_KWH,
    shareOfBillPct,
  };
}
