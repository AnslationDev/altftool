/**
 * Smart home power budget.
 *
 * For each device line:
 *   daily Wh = qty x (active W x active hours + standby W x (24 - active hours))
 * Totals roll up to kWh per day, month and year, and to a running cost at your tariff.
 * The "always on" figure is the sum of standby watts, i.e. what the house draws with
 * nobody touching anything - the load that never appears on a device's box.
 */

export const HOURS_PER_DAY = 24;

/** 365.25 / 12 - the average calendar month, so annual and monthly figures agree. */
export const DAYS_PER_MONTH = 30.4375;

export const DAYS_PER_YEAR = 365.25;

/**
 * EU Ecodesign Regulation 1275/2008 caps plain off-mode and standby at 0.5 W
 * (1.0 W where the device keeps an information or status display lit).
 * Networked standby, where the device stays reachable over Wi-Fi, is allowed more -
 * which is exactly why smart devices dominate a modern home's idle draw.
 */
export const STANDBY_BENCHMARK_WATTS = 0.5;

export const CURRENCIES = [
  { code: "INR", locale: "en-IN", label: "Indian rupee" },
  { code: "USD", locale: "en-US", label: "US dollar" },
  { code: "EUR", locale: "de-DE", label: "Euro" },
  { code: "GBP", locale: "en-GB", label: "Pound sterling" },
  { code: "AUD", locale: "en-AU", label: "Australian dollar" },
];

/**
 * Typical measured draws for mains-powered smart devices.
 * `standbyWatts` is networked idle (connected, waiting); `activeWatts` is doing its job.
 * Battery-only devices such as smart locks and sensors are excluded - they draw nothing
 * from the mains except when their charger is plugged in.
 */
export const DEVICE_LIBRARY = [
  { id: "router", label: "Wi-Fi router", standbyWatts: 7, activeWatts: 11, hours: 6 },
  { id: "mesh-node", label: "Mesh Wi-Fi node", standbyWatts: 4, activeWatts: 6, hours: 6 },
  { id: "hub", label: "Smart home hub / bridge", standbyWatts: 2, activeWatts: 2.5, hours: 2 },
  { id: "speaker-small", label: "Smart speaker (compact)", standbyWatts: 1.8, activeWatts: 3, hours: 2 },
  { id: "speaker-display", label: "Smart display", standbyWatts: 2.5, activeWatts: 8, hours: 3 },
  { id: "bulb", label: "Smart LED bulb", standbyWatts: 0.4, activeWatts: 9, hours: 5 },
  { id: "light-strip", label: "Smart light strip", standbyWatts: 0.5, activeWatts: 18, hours: 3 },
  { id: "plug", label: "Smart plug", standbyWatts: 0.5, activeWatts: 0.8, hours: 4 },
  { id: "cam-indoor", label: "Indoor security camera", standbyWatts: 2.5, activeWatts: 4, hours: 8 },
  { id: "cam-outdoor", label: "Outdoor camera (wired)", standbyWatts: 3.5, activeWatts: 6, hours: 8 },
  { id: "doorbell", label: "Video doorbell (wired)", standbyWatts: 3, activeWatts: 5, hours: 1 },
  { id: "thermostat", label: "Smart thermostat", standbyWatts: 1.5, activeWatts: 2.5, hours: 4 },
  { id: "tv", label: "Smart TV 43 in", standbyWatts: 0.5, activeWatts: 95, hours: 4 },
  { id: "streamer", label: "Streaming stick / box", standbyWatts: 1.5, activeWatts: 4, hours: 4 },
  { id: "robot-vac", label: "Robot vacuum dock", standbyWatts: 2, activeWatts: 28, hours: 1.5 },
  { id: "nas", label: "NAS / home server", standbyWatts: 10, activeWatts: 30, hours: 4 },
  { id: "printer", label: "Wi-Fi printer", standbyWatts: 2, activeWatts: 25, hours: 0.3 },
  { id: "air-purifier", label: "Smart air purifier", standbyWatts: 1, activeWatts: 40, hours: 8 },
];

const LIMITS = { maxWatts: 5000, maxQty: 200, maxTariff: 100 };

/**
 * @param {object} input
 * @param {Array<{label?:string, qty:number, standbyWatts:number, activeWatts:number, hours:number}>} input.devices
 * @param {number} input.tariff Cost per kWh in your currency.
 * @returns {object} result or { error }
 */
export function computePowerBudget({ devices = [], tariff = 0 }) {
  if (!Array.isArray(devices) || devices.length === 0) {
    return { error: "Add at least one device to the budget." };
  }
  if (typeof tariff !== "number" || !Number.isFinite(tariff) || tariff < 0) {
    return { error: "Electricity tariff must be 0 or more per kWh." };
  }
  if (tariff > LIMITS.maxTariff) {
    return { error: `A tariff above ${LIMITS.maxTariff} per kWh looks like a typing slip.` };
  }

  const rows = [];
  let totalDailyWh = 0;
  let standbyDailyWh = 0;
  let activeDailyWh = 0;
  let alwaysOnWatts = 0;
  let totalDevices = 0;

  for (const device of devices) {
    const qty = Number(device?.qty);
    const standbyWatts = Number(device?.standbyWatts);
    const activeWatts = Number(device?.activeWatts);
    const hours = Number(device?.hours);

    if (![qty, standbyWatts, activeWatts, hours].every((value) => Number.isFinite(value))) {
      return { error: "Every device needs a quantity, standby watts, active watts and active hours." };
    }
    if (qty < 0 || !Number.isInteger(qty)) {
      return { error: "Device quantity must be a whole number of 0 or more." };
    }
    if (qty > LIMITS.maxQty) return { error: `Keep each device line to ${LIMITS.maxQty} units or fewer.` };
    if (standbyWatts < 0 || activeWatts < 0) return { error: "Watt figures cannot be negative." };
    if (standbyWatts > LIMITS.maxWatts || activeWatts > LIMITS.maxWatts) {
      return { error: `Watt figures above ${LIMITS.maxWatts} W are not smart-home devices.` };
    }
    if (hours < 0 || hours > HOURS_PER_DAY) {
      return { error: `Active hours must be between 0 and ${HOURS_PER_DAY} per day.` };
    }

    const idleHours = HOURS_PER_DAY - hours;
    const activeWh = qty * activeWatts * hours;
    const standbyWh = qty * standbyWatts * idleHours;
    const dailyWh = activeWh + standbyWh;

    rows.push({
      label: device?.label ?? "Device",
      qty,
      standbyWatts,
      activeWatts,
      hours,
      activeWh,
      standbyWh,
      dailyWh,
      monthlyKwh: (dailyWh * DAYS_PER_MONTH) / 1000,
      yearlyKwh: (dailyWh * DAYS_PER_YEAR) / 1000,
      monthlyCost: ((dailyWh * DAYS_PER_MONTH) / 1000) * tariff,
      aboveBenchmark: standbyWatts > STANDBY_BENCHMARK_WATTS,
    });

    totalDailyWh += dailyWh;
    standbyDailyWh += standbyWh;
    activeDailyWh += activeWh;
    alwaysOnWatts += qty * standbyWatts;
    totalDevices += qty;
  }

  if (totalDevices === 0) {
    return { error: "All quantities are zero — set at least one device to 1 or more." };
  }

  const dailyKwh = totalDailyWh / 1000;
  const monthlyKwh = (totalDailyWh * DAYS_PER_MONTH) / 1000;
  const yearlyKwh = (totalDailyWh * DAYS_PER_YEAR) / 1000;

  const standbySharePct = totalDailyWh > 0 ? (standbyDailyWh / totalDailyWh) * 100 : 0;
  const averageWatts = totalDailyWh / HOURS_PER_DAY;

  // Sort a copy so the caller can show the biggest consumers first without re-sorting.
  const byImpact = [...rows].sort((a, b) => b.dailyWh - a.dailyWh);

  return {
    rows,
    byImpact,
    totalDevices,
    totalDailyWh,
    standbyDailyWh,
    activeDailyWh,
    dailyKwh,
    monthlyKwh,
    yearlyKwh,
    dailyCost: dailyKwh * tariff,
    monthlyCost: monthlyKwh * tariff,
    yearlyCost: yearlyKwh * tariff,
    standbyMonthlyCost: ((standbyDailyWh * DAYS_PER_MONTH) / 1000) * tariff,
    standbyYearlyKwh: (standbyDailyWh * DAYS_PER_YEAR) / 1000,
    standbyYearlyCost: ((standbyDailyWh * DAYS_PER_YEAR) / 1000) * tariff,
    activeSharePct: totalDailyWh > 0 ? (activeDailyWh / totalDailyWh) * 100 : 0,
    standbySharePct,
    alwaysOnWatts,
    averageWatts,
  };
}
