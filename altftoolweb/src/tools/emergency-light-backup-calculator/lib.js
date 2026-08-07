/**
 * Emergency light backup runtime calculator.
 *
 * Two runtime figures are produced because they answer different questions.
 *
 * 1. Energy runtime — the textbook figure:
 *      usable Wh = V x Ah x depth-of-discharge x state-of-health
 *      draw W    = LED load / driver efficiency + controller standby
 *      runtime h = usable Wh / draw W
 *
 * 2. Peukert-corrected runtime — the realistic figure for lead-acid, where a
 *    battery discharged faster than its rating delivers fewer amp-hours:
 *      t = H x (C / (I x H))^n
 *    (Peukert 1897, in the modern form used on VRLA datasheets), where H is the
 *    hour rate the capacity is quoted at, C the rated Ah, I the actual current
 *    and n the Peukert exponent. The result is time to a flat battery, so it is
 *    then scaled by the depth of discharge you are willing to use.
 */

/**
 * Depth of discharge, state-of-health floor, Peukert exponent, the hour rate
 * the capacity is normally quoted at, and the charge factor (amp-hours you must
 * put back for each amp-hour taken out).
 *
 * Lead-acid: cyclic service is limited to 50% DoD to reach a useful cycle life,
 * capacity is quoted at the 20-hour rate, the Peukert exponent for VRLA sits
 * near 1.15, and charge efficiency means roughly 120% must be returned.
 * LiFePO4 and Li-ion: 80% DoD is the usual design figure, capacity is quoted at
 * a much faster rate so Peukert effects are small (exponent near 1.05), and
 * coulombic efficiency is high enough that 105% covers the return charge.
 */
export const BATTERY_TYPES = [
  {
    id: "sla",
    label: "Sealed lead-acid / VRLA",
    depthOfDischarge: 0.5,
    peukertExponent: 1.15,
    ratedHourRate: 20,
    chargeFactor: 1.2,
    nominalVoltage: 12,
  },
  {
    id: "agm",
    label: "AGM lead-acid",
    depthOfDischarge: 0.5,
    peukertExponent: 1.12,
    ratedHourRate: 20,
    chargeFactor: 1.15,
    nominalVoltage: 12,
  },
  {
    id: "lifepo4",
    label: "LiFePO4",
    depthOfDischarge: 0.8,
    peukertExponent: 1.05,
    ratedHourRate: 5,
    chargeFactor: 1.05,
    nominalVoltage: 12.8,
  },
  {
    id: "liion",
    label: "Li-ion (18650 pack)",
    depthOfDischarge: 0.8,
    peukertExponent: 1.05,
    ratedHourRate: 5,
    chargeFactor: 1.05,
    nominalVoltage: 11.1,
  },
  {
    id: "nimh",
    label: "NiMH pack",
    depthOfDischarge: 0.8,
    peukertExponent: 1.1,
    ratedHourRate: 5,
    chargeFactor: 1.4,
    nominalVoltage: 4.8,
  },
];

/**
 * Autonomy targets. EN 1838 sets one hour as the minimum duration for escape
 * lighting and three hours where the premises are used at night or evacuation
 * is not immediate; Indian practice under the National Building Code follows
 * the same one-hour and three-hour bands. Treat these as design references and
 * confirm the duration your local fire authority requires.
 */
export const AUTONOMY_TARGETS = [
  { id: "half", label: "30 minutes — short power cuts", hours: 0.5 },
  { id: "one", label: "1 hour — escape lighting minimum", hours: 1 },
  { id: "three", label: "3 hours — night-use premises", hours: 3 },
  { id: "four", label: "4 hours — long load-shedding", hours: 4 },
];

/** A constant-current LED driver at typical part load. */
export const DEFAULT_DRIVER_EFFICIENCY_PERCENT = 85;
/** Charger, indicator LED and changeover circuit sitting across the battery. */
export const DEFAULT_STANDBY_WATTS = 0.4;

export const MAX_CAPACITY_AH = 2000;
export const MAX_VOLTAGE = 400;
export const MAX_LOAD_WATTS = 5000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;
const round3 = (value) => Math.round(value * 1000) / 1000;

/** Look a battery preset up by id. */
export function batteryType(id) {
  return BATTERY_TYPES.find((item) => item.id === id) ?? BATTERY_TYPES[0];
}

/**
 * Format a duration in hours as "3 h 24 min".
 * @returns {string}
 */
export function formatHours(hours) {
  if (!isNum(hours) || hours < 0) return "—";
  let whole = Math.floor(hours);
  let minutes = Math.round((hours - whole) * 60);
  if (minutes === 60) {
    whole += 1;
    minutes = 0;
  }
  if (whole === 0) return `${minutes} min`;
  if (minutes === 0) return `${whole} h`;
  return `${whole} h ${minutes} min`;
}

/**
 * Peukert time to a flat battery.
 * @param {number} ratedAh   Capacity as printed on the battery.
 * @param {number} currentA  Actual discharge current.
 * @param {number} hourRate  Hour rate the capacity is quoted at (20 for C20).
 * @param {number} exponent  Peukert exponent.
 * @returns {number} Hours to full discharge, or NaN for unusable input.
 */
export function peukertHours(ratedAh, currentA, hourRate, exponent) {
  if (!isNum(ratedAh) || !isNum(currentA) || !isNum(hourRate) || !isNum(exponent)) return NaN;
  if (ratedAh <= 0 || currentA <= 0 || hourRate <= 0 || exponent < 1) return NaN;
  return hourRate * (ratedAh / (currentA * hourRate)) ** exponent;
}

/**
 * @param {object} input
 * @param {string} [input.batteryId]            One of BATTERY_TYPES ids.
 * @param {number} input.voltage                Battery nominal voltage.
 * @param {number} input.capacityAh             Rated capacity.
 * @param {number} [input.stateOfHealthPercent] 100 for a new battery.
 * @param {number} input.lampCount              Number of LED heads.
 * @param {number} input.wattsPerLamp           Watts per head.
 * @param {number} [input.driverEfficiencyPercent]
 * @param {number} [input.standbyWatts]         Always-on control circuit load.
 * @param {number} [input.chargeCurrentA]       Charger output current.
 * @param {number} [input.targetHours]          Autonomy you need.
 * @returns {object} Runtime figures, or { error } for unusable input.
 */
export function calculateBackup({
  batteryId = "sla",
  voltage,
  capacityAh,
  stateOfHealthPercent = 100,
  lampCount,
  wattsPerLamp,
  driverEfficiencyPercent = DEFAULT_DRIVER_EFFICIENCY_PERCENT,
  standbyWatts = DEFAULT_STANDBY_WATTS,
  chargeCurrentA = 1,
  targetHours = 1,
} = {}) {
  const battery = batteryType(batteryId);
  const raw = {
    voltage,
    capacityAh,
    stateOfHealthPercent,
    lampCount,
    wattsPerLamp,
    driverEfficiencyPercent,
    standbyWatts,
    chargeCurrentA,
    targetHours,
  };
  if (Object.values(raw).some((value) => !isNum(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (voltage <= 0) return { error: "Battery voltage must be greater than zero." };
  if (voltage > MAX_VOLTAGE) return { error: `Voltage above ${MAX_VOLTAGE} V is outside this tool.` };
  if (capacityAh <= 0) return { error: "Battery capacity must be greater than zero amp-hours." };
  if (capacityAh > MAX_CAPACITY_AH) {
    return { error: `Capacity above ${MAX_CAPACITY_AH} Ah is outside this tool.` };
  }
  if (stateOfHealthPercent <= 0 || stateOfHealthPercent > 100) {
    return { error: "State of health must be between 1% and 100%." };
  }
  if (lampCount < 1 || !Number.isInteger(lampCount)) {
    return { error: "Number of LED heads must be a whole number of at least 1." };
  }
  if (wattsPerLamp <= 0) return { error: "Lamp wattage must be greater than zero." };
  if (driverEfficiencyPercent <= 0 || driverEfficiencyPercent > 100) {
    return { error: "Driver efficiency must be between 1% and 100%." };
  }
  if (standbyWatts < 0) return { error: "Standby load cannot be negative." };
  if (chargeCurrentA <= 0) return { error: "Charge current must be greater than zero." };
  if (targetHours <= 0) return { error: "Target backup time must be greater than zero." };

  const lamps = Math.floor(lampCount);
  const lampLoadW = lamps * wattsPerLamp;
  if (lampLoadW > MAX_LOAD_WATTS) {
    return { error: `A load above ${MAX_LOAD_WATTS} W is outside the range of this tool.` };
  }

  const driverEfficiency = driverEfficiencyPercent / 100;
  const soh = stateOfHealthPercent / 100;
  const dod = battery.depthOfDischarge;

  const drawW = lampLoadW / driverEfficiency + standbyWatts;
  const currentA = drawW / voltage;

  const nominalWh = voltage * capacityAh;
  const usableWh = nominalWh * dod * soh;
  const runtimeEnergyH = usableWh / drawW;

  const effectiveAh = capacityAh * soh;
  const peukertFullH = peukertHours(
    effectiveAh,
    currentA,
    battery.ratedHourRate,
    battery.peukertExponent,
  );
  // Peukert gives time to a flat battery; scale to the depth of discharge used.
  const runtimePeukertH = Number.isFinite(peukertFullH) ? peukertFullH * dod : NaN;

  const designRuntimeH = Math.min(runtimeEnergyH, runtimePeukertH);
  const meetsTarget = designRuntimeH >= targetHours;

  // Capacity needed to hold the target for the same load -- take the larger
  // of the energy-only bound and the Peukert-derated bound (whichever binds).
  const requiredWh = drawW * targetHours;
  const requiredAhEnergy = requiredWh / (voltage * dod * soh);
  const requiredAhPeukert =
    ((currentA * battery.ratedHourRate) / soh) *
    (targetHours / (dod * battery.ratedHourRate)) ** (1 / battery.peukertExponent);
  const requiredAh = Math.max(requiredAhEnergy, requiredAhPeukert);
  const extraAh = Math.max(0, requiredAh - capacityAh);

  // Amp-hours removed at the design runtime, and the charge time to put them back.
  const ahRemoved = Math.min(currentA * designRuntimeH, effectiveAh * dod);
  const rechargeHours = (ahRemoved * battery.chargeFactor) / chargeCurrentA;

  const cRate = currentA / capacityAh;

  return {
    batteryLabel: battery.label,
    depthOfDischarge: dod,
    depthOfDischargePercent: round1(dod * 100),
    peukertExponent: battery.peukertExponent,
    ratedHourRate: battery.ratedHourRate,
    chargeFactor: battery.chargeFactor,

    lampLoadW: round2(lampLoadW),
    drawW: round2(drawW),
    currentA: round2(currentA),
    cRate: round3(cRate),

    nominalWh: round1(nominalWh),
    usableWh: round1(usableWh),

    runtimeEnergyH: round2(runtimeEnergyH),
    runtimePeukertH: Number.isFinite(runtimePeukertH) ? round2(runtimePeukertH) : NaN,
    designRuntimeH: round2(designRuntimeH),
    designRuntimeText: formatHours(designRuntimeH),

    targetHours: round2(targetHours),
    meetsTarget,
    marginH: round2(designRuntimeH - targetHours),
    shortfallH: round2(Math.max(0, targetHours - designRuntimeH)),

    requiredWh: round1(requiredWh),
    requiredAh: round1(requiredAh),
    extraAh: round1(extraAh),

    ahRemoved: round2(ahRemoved),
    rechargeHours: round2(rechargeHours),
    rechargeText: formatHours(rechargeHours),
  };
}
