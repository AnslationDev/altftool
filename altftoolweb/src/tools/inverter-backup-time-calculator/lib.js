/**
 * Inverter backup time.
 *
 * Two models are reported:
 *  1. Plain energy balance  -> hours = usable Wh / (load W / inverter efficiency)
 *  2. Peukert-corrected     -> t = H * (C / (I * H))^k, the standard Peukert's law form
 *     where C is the rated capacity at the rated discharge period H and I is the actual
 *     DC discharge current. Lead-acid banks deliver noticeably less than their C20 rating
 *     when discharged in a few hours, which is exactly what a home inverter does.
 */

/**
 * Battery capacities in India are almost always printed at the 20-hour rate (C20),
 * i.e. 150Ah means 7.5 A for 20 hours. IEC 60896 / IS 13369 use the same convention.
 */
export const RATED_DISCHARGE_HOURS = 20;

/**
 * Depth of discharge = the fraction of nominal capacity a chemistry may give up per
 * cycle without wrecking its cycle life, and the Peukert exponent k for that chemistry.
 * Lead-acid k values sit in the 1.1-1.3 band; LiFePO4 is nearly flat at ~1.02.
 */
export const BATTERY_TYPES = {
  "tubular-lead-acid": {
    label: "Tubular lead-acid (inverter battery)",
    dod: 0.8,
    peukert: 1.2,
  },
  "flat-plate-lead-acid": {
    label: "Flat plate lead-acid",
    dod: 0.7,
    peukert: 1.25,
  },
  "smf-vrla": { label: "SMF / VRLA sealed", dod: 0.6, peukert: 1.3 },
  "lithium-lifepo4": { label: "Lithium LiFePO4", dod: 0.9, peukert: 1.02 },
};

export const DEFAULT_BATTERY_TYPE = "tubular-lead-acid";

/**
 * Typical wall-to-load conversion efficiency of the inverter stage.
 * Square / modified-sine home inverters land near 80%; good pure-sine units reach 90%.
 */
export const EFFICIENCY_PRESETS = [
  { id: "square", label: "Square wave (~75%)", value: 75 },
  { id: "modified", label: "Modified sine (~80%)", value: 80 },
  { id: "pure", label: "Pure sine (~90%)", value: 90 },
];

/** Nominal terminal voltage options for a single battery block. */
export const BATTERY_VOLTAGES = [6, 12, 24, 48];

/** Steady running wattages used for the quick load builder (nameplate averages). */
export const COMMON_LOADS = [
  { id: "led-bulb", label: "LED bulb (9 W)", watts: 9 },
  { id: "tube-light", label: "LED tube light (20 W)", watts: 20 },
  { id: "ceiling-fan", label: "Ceiling fan (75 W)", watts: 75 },
  { id: "bldc-fan", label: "BLDC ceiling fan (30 W)", watts: 30 },
  { id: "tv", label: "LED TV 43 in (100 W)", watts: 100 },
  { id: "laptop", label: "Laptop (65 W)", watts: 65 },
  { id: "wifi", label: "Wi-Fi router (12 W)", watts: 12 },
  { id: "fridge", label: "Fridge 250 L, running (150 W)", watts: 150 },
];

const LIMITS = {
  maxAh: 5000,
  maxBatteries: 24,
  maxLoadWatts: 20000,
};

/**
 * @param {object} input
 * @param {number} input.batteryAh        Rated capacity of ONE battery at C20, in Ah.
 * @param {number} input.batteryVolts     Nominal voltage of ONE battery.
 * @param {number} input.batteryCount     Batteries wired in series to form the bank.
 * @param {number} input.loadWatts        Total connected load in watts.
 * @param {number} input.efficiencyPct    Inverter efficiency, percent.
 * @param {string} input.batteryType      Key of BATTERY_TYPES.
 * @param {number} input.chargePercent    Present state of charge, percent.
 * @returns {object} result or { error }
 */
export function computeBackup({
  batteryAh,
  batteryVolts,
  batteryCount,
  loadWatts,
  efficiencyPct,
  batteryType = DEFAULT_BATTERY_TYPE,
  chargePercent = 100,
}) {
  const numbers = [
    batteryAh,
    batteryVolts,
    batteryCount,
    loadWatts,
    efficiencyPct,
    chargePercent,
  ];
  if (numbers.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter a valid number in every field." };
  }

  const spec = BATTERY_TYPES[batteryType];
  if (!spec) return { error: "Choose a battery type." };

  if (!(batteryAh > 0)) return { error: "Battery capacity must be greater than 0 Ah." };
  if (batteryAh > LIMITS.maxAh) {
    return { error: `Battery capacity above ${LIMITS.maxAh} Ah is outside home inverter range.` };
  }
  if (!(batteryVolts > 0)) return { error: "Battery voltage must be greater than 0 V." };
  if (!(batteryCount >= 1) || !Number.isInteger(batteryCount)) {
    return { error: "Number of batteries must be a whole number of 1 or more." };
  }
  if (batteryCount > LIMITS.maxBatteries) {
    return { error: `Keep the bank to ${LIMITS.maxBatteries} batteries or fewer.` };
  }
  if (!(loadWatts > 0)) return { error: "Connected load must be greater than 0 W." };
  if (loadWatts > LIMITS.maxLoadWatts) {
    return { error: `A load above ${LIMITS.maxLoadWatts} W is beyond a home inverter.` };
  }
  if (!(efficiencyPct > 0) || efficiencyPct > 100) {
    return { error: "Inverter efficiency must be between 1% and 100%." };
  }
  if (!(chargePercent > 0) || chargePercent > 100) {
    return { error: "State of charge must be between 1% and 100%." };
  }

  const efficiency = efficiencyPct / 100;
  const charge = chargePercent / 100;

  const bankVolts = batteryVolts * batteryCount;
  const bankAh = batteryAh; // series wiring raises voltage, capacity stays at one block
  const nominalWh = bankAh * bankVolts;

  // Energy the bank is allowed to give up this cycle.
  const usableWh = nominalWh * spec.dod * charge;

  // The inverter must pull more DC power than the AC load because of its own losses.
  const dcWatts = loadWatts / efficiency;
  const dcCurrent = dcWatts / bankVolts;

  const simpleHours = usableWh / dcWatts;

  // Peukert: hours the FULL bank would last at this current, then scaled by DoD and SoC.
  const ratedCurrent = bankAh / RATED_DISCHARGE_HOURS;
  const fullPeukertHours =
    RATED_DISCHARGE_HOURS * Math.pow(bankAh / (dcCurrent * RATED_DISCHARGE_HOURS), spec.peukert);
  const realisticHours = fullPeukertHours * spec.dod * charge;

  const capacityFactor = simpleHours > 0 ? realisticHours / simpleHours : 0;

  return {
    bankVolts,
    bankAh,
    nominalWh,
    usableWh,
    dcWatts,
    dcCurrent,
    ratedCurrent,
    simpleHours,
    realisticHours,
    capacityFactor,
    dodPercent: spec.dod * 100,
    peukert: spec.peukert,
    batteryLabel: spec.label,
    // Wh the inverter itself burns as heat over the realistic run.
    inverterLossWh: (dcWatts - loadWatts) * realisticHours,
  };
}

/** Split decimal hours into whole hours and minutes for display. Pure. */
export function splitHours(hours) {
  if (typeof hours !== "number" || !Number.isFinite(hours) || hours < 0) {
    return { hours: 0, minutes: 0 };
  }
  const totalMinutes = Math.round(hours * 60);
  return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
}

/**
 * Battery Ah (at the given bank voltage) needed to hold a load for a target number of hours,
 * inverted from the plain energy balance and then grossed up for DoD.
 */
export function requiredAh({ loadWatts, targetHours, bankVolts, efficiencyPct, batteryType = DEFAULT_BATTERY_TYPE }) {
  const spec = BATTERY_TYPES[batteryType];
  if (!spec) return { error: "Choose a battery type." };
  if (!(loadWatts > 0) || !(targetHours > 0) || !(bankVolts > 0)) {
    return { error: "Load, target hours and bank voltage must all be greater than zero." };
  }
  if (!(efficiencyPct > 0) || efficiencyPct > 100) {
    return { error: "Inverter efficiency must be between 1% and 100%." };
  }
  const dcWatts = loadWatts / (efficiencyPct / 100);
  const ah = (dcWatts * targetHours) / (bankVolts * spec.dod);
  return { ah };
}
