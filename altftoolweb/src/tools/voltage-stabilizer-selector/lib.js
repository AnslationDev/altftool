/**
 * Voltage stabilizer sizing and working-range selection.
 *
 * Capacity:  load VA = running watts / power factor
 *            required VA = load VA x margin factor
 *            (margin factor covers the compressor in-rush on a motor load and simple
 *             future headroom on an electronics load)
 *            recommended size = the next standard stabilizer rating at or above required VA
 *
 * Range:     the stabilizer's working (input) range must cover the lowest and highest voltage
 *            your supply actually reaches, with a small buffer, or it will cut off.
 */

/** Single-phase declared LV supply voltage in India, IS 12360. */
export const NOMINAL_VOLTAGE = 230;

/**
 * Central Electricity Authority (Measures relating to Safety and Electric Supply)
 * Regulations allow low-voltage supply to vary by +/-6% of the declared voltage.
 * Anything outside 216-244 V at your meter is worth reporting to the utility as well.
 */
export const SUPPLY_TOLERANCE_PCT = 6;

/** Standard single-phase stabilizer ratings sold for domestic use, in VA. */
export const STANDARD_VA = [500, 1000, 2000, 3000, 4000, 5000, 6000, 8000, 10000];

/** Voltage the chosen range must clear beyond your observed swing, in volts. */
export const RANGE_BUFFER_VOLTS = 5;

/** Typical relay/servo stabilizer conversion efficiency, used for input-current draw. */
export const STABILIZER_EFFICIENCY = 0.97;

/** Working ranges offered on the market, narrowest first. */
export const WORKING_RANGES = [
  { id: "170-270", min: 170, max: 270, label: "170–270 V (steady urban supply)", type: "Relay" },
  { id: "150-280", min: 150, max: 280, label: "150–280 V (standard digital)", type: "Relay" },
  { id: "130-290", min: 130, max: 290, label: "130–290 V (wide range)", type: "Relay / servo" },
  { id: "100-300", min: 100, max: 300, label: "100–300 V (extra-wide servo)", type: "Servo" },
  { id: "90-310", min: 90, max: 310, label: "90–310 V (heavy-duty servo)", type: "Servo" },
];

/**
 * Appliance presets.
 * `pf` is the displacement power factor of the load; `margin` is the multiple applied to
 * load VA. Compressor loads get 2.0 because a direct-on-line compressor pulls several times
 * running current for a second or two; electronics get 1.25 as plain headroom.
 */
export const APPLIANCE_PRESETS = [
  { id: "ac-1", label: "Air conditioner — 1 ton", watts: 1000, pf: 0.85, margin: 2.0, motor: true },
  { id: "ac-1.5", label: "Air conditioner — 1.5 ton", watts: 1500, pf: 0.85, margin: 2.0, motor: true },
  { id: "ac-2", label: "Air conditioner — 2 ton", watts: 2000, pf: 0.85, margin: 2.0, motor: true },
  { id: "fridge-250", label: "Refrigerator — up to 300 L", watts: 150, pf: 0.8, margin: 2.0, motor: true },
  { id: "fridge-500", label: "Refrigerator — 300 to 600 L", watts: 250, pf: 0.8, margin: 2.0, motor: true },
  { id: "washer", label: "Washing machine", watts: 500, pf: 0.8, margin: 2.0, motor: true },
  { id: "tv-43", label: "LED TV — up to 43 in", watts: 100, pf: 0.95, margin: 1.25, motor: false },
  { id: "tv-65", label: "LED TV — 55 to 65 in", watts: 180, pf: 0.95, margin: 1.25, motor: false },
  { id: "microwave", label: "Microwave oven", watts: 1200, pf: 0.95, margin: 1.25, motor: false },
  { id: "geyser", label: "Water heater / geyser", watts: 2000, pf: 1.0, margin: 1.25, motor: false },
  { id: "home-theatre", label: "Home theatre / AV rack", watts: 300, pf: 0.95, margin: 1.25, motor: false },
  { id: "custom", label: "Custom appliance", watts: 800, pf: 0.9, margin: 1.5, motor: false },
];

const LIMITS = { minVolts: 50, maxVolts: 400, maxWatts: 20000 };

/**
 * Does a working range clear the observed swing at both ends, buffer included?
 * @returns {boolean}
 */
export function rangeCovers(range, siteMinVolts, siteMaxVolts) {
  if (!range) return false;
  if (!Number.isFinite(siteMinVolts) || !Number.isFinite(siteMaxVolts)) return false;
  return (
    range.min <= siteMinVolts - RANGE_BUFFER_VOLTS && range.max >= siteMaxVolts + RANGE_BUFFER_VOLTS
  );
}

/**
 * @param {object} input
 * @param {number} input.watts          Running power of the appliance.
 * @param {number} input.powerFactor    0.1 to 1.
 * @param {number} input.marginFactor   1 to 4. Multiple applied to load VA.
 * @param {number} input.siteMinVolts   Lowest voltage your supply reaches.
 * @param {number} input.siteMaxVolts   Highest voltage your supply reaches.
 * @param {number} [input.nominalVolts] Declared supply voltage.
 * @returns {object} result or { error }
 */
export function selectStabilizer({
  watts,
  powerFactor,
  marginFactor,
  siteMinVolts,
  siteMaxVolts,
  nominalVolts = NOMINAL_VOLTAGE,
}) {
  const values = [watts, powerFactor, marginFactor, siteMinVolts, siteMaxVolts, nominalVolts];
  if (values.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (!(watts > 0)) return { error: "Appliance wattage must be greater than 0 W." };
  if (watts > LIMITS.maxWatts) {
    return { error: `Above ${LIMITS.maxWatts} W you need a three-phase or industrial stabilizer.` };
  }
  if (!(powerFactor >= 0.1) || powerFactor > 1) {
    return { error: "Power factor must be between 0.1 and 1." };
  }
  if (!(marginFactor >= 1) || marginFactor > 4) {
    return { error: "Safety margin must be between 1x and 4x the load VA." };
  }
  if (!(nominalVolts > 0)) return { error: "Declared supply voltage must be greater than 0 V." };
  if (!(siteMinVolts >= LIMITS.minVolts) || siteMinVolts > LIMITS.maxVolts) {
    return { error: `Lowest site voltage should be between ${LIMITS.minVolts} V and ${LIMITS.maxVolts} V.` };
  }
  if (!(siteMaxVolts >= LIMITS.minVolts) || siteMaxVolts > LIMITS.maxVolts) {
    return { error: `Highest site voltage should be between ${LIMITS.minVolts} V and ${LIMITS.maxVolts} V.` };
  }
  if (siteMinVolts >= siteMaxVolts) {
    return { error: "Highest site voltage must be greater than the lowest." };
  }

  const loadVa = watts / powerFactor;
  const requiredVa = loadVa * marginFactor;

  const recommendedVa =
    STANDARD_VA.find((size) => size >= requiredVa) ?? STANDARD_VA[STANDARD_VA.length - 1];
  const oversizedRequirement = requiredVa > STANDARD_VA[STANDARD_VA.length - 1];

  const headroomPct = ((recommendedVa - requiredVa) / requiredVa) * 100;

  const needMin = siteMinVolts - RANGE_BUFFER_VOLTS;
  const needMax = siteMaxVolts + RANGE_BUFFER_VOLTS;
  const chosenRange =
    WORKING_RANGES.find((range) => range.min <= needMin && range.max >= needMax) ?? null;
  const rangeFit = WORKING_RANGES.map((range) => ({
    ...range,
    covers: rangeCovers(range, siteMinVolts, siteMaxVolts),
  }));

  const outputCurrent = loadVa / nominalVolts;
  const inputCurrentAtMin = loadVa / (siteMinVolts * STABILIZER_EFFICIENCY);
  const boostRatio = nominalVolts / siteMinVolts;

  const toleranceLow = nominalVolts * (1 - SUPPLY_TOLERANCE_PCT / 100);
  const toleranceHigh = nominalVolts * (1 + SUPPLY_TOLERANCE_PCT / 100);
  const withinStatutory = siteMinVolts >= toleranceLow && siteMaxVolts <= toleranceHigh;

  const notes = [];
  if (!chosenRange) {
    notes.push(
      `No off-the-shelf domestic range covers ${siteMinVolts}–${siteMaxVolts} V with a ${RANGE_BUFFER_VOLTS} V buffer. Ask for a custom servo stabilizer or an online UPS.`,
    );
  } else if (chosenRange.type === "Servo") {
    notes.push(
      "Your swing needs a servo stabilizer — relay types cannot correct that far without stepping the output around noticeably.",
    );
  }
  if (oversizedRequirement) {
    notes.push(
      `Required ${Math.round(requiredVa)} VA is beyond the ${STANDARD_VA[STANDARD_VA.length - 1]} VA domestic ceiling; use a commercial unit.`,
    );
  }
  if (!withinStatutory) {
    notes.push(
      `Your supply leaves the +/-${SUPPLY_TOLERANCE_PCT}% band (${Math.round(toleranceLow)}–${Math.round(
        toleranceHigh,
      )} V) that the distribution licensee is meant to hold. A stabilizer is a fix at your end; also raise it with the utility.`,
    );
  }
  if (boostRatio > 1.35) {
    notes.push(
      `At ${siteMinVolts} V the stabilizer must boost ${(boostRatio * 100 - 100).toFixed(0)}%, so it draws about ${inputCurrentAtMin.toFixed(
        1,
      )} A from the wall. Check the socket and wiring are rated for that.`,
    );
  }

  return {
    loadVa,
    requiredVa,
    recommendedVa,
    recommendedKva: recommendedVa / 1000,
    headroomPct,
    chosenRange,
    rangeFit,
    outputCurrent,
    inputCurrentAtMin,
    boostRatio,
    toleranceLow,
    toleranceHigh,
    withinStatutory,
    oversizedRequirement,
    notes,
  };
}
