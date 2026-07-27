/**
 * Plug and voltage rules for Italy.
 *
 * Italy's low-voltage distribution follows the harmonised European standard:
 * 230 V nominal, 50 Hz. Sockets are the Italian type L (CEI 23-50, formerly
 * CEI 23-16), the German Schuko type F, and the two-pin Europlug type C which
 * mates with both. The decision this module makes is the standard travel one:
 *
 *   1. Does the plug physically enter an Italian socket, or is an adapter needed?
 *   2. Does the appliance accept 230 V, or is a voltage converter needed?
 *   3. Does the appliance accept 50 Hz?
 *   4. Does the current draw stay inside the socket and the meter contract?
 *
 * An adapter only changes the shape of the pins. A converter or transformer
 * changes the voltage. They are not interchangeable.
 */

/** Nominal mains voltage in Italy, per CENELEC HD 60038 (230 V single phase). */
export const MAINS_VOLTAGE_V = 230;

/** Nominal mains frequency in Italy. */
export const MAINS_FREQUENCY_HZ = 50;

/**
 * EN 50160 permits the supply voltage to sit anywhere inside 230 V +/- 10%
 * for 95% of each week, so an appliance can legitimately see these extremes.
 */
export const VOLTAGE_TOLERANCE_FRACTION = 0.1;
export const SUPPLY_MIN_V = MAINS_VOLTAGE_V * (1 - VOLTAGE_TOLERANCE_FRACTION); // 207 V
export const SUPPLY_MAX_V = MAINS_VOLTAGE_V * (1 + VOLTAGE_TOLERANCE_FRACTION); // 253 V

/**
 * Sockets you actually meet in Italian homes and hotels.
 * The type L family is specified in CEI 23-50: the 10 A "P11" pattern uses
 * 4 mm pins on 19 mm centres, the 16 A "P17" pattern uses 5 mm pins on 26 mm
 * centres, so a 16 A Italian plug will not enter a 10 A socket.
 */
export const SOCKET_TYPES = [
  {
    code: "L",
    label: "Type L 10 A (CEI 23-50 P11)",
    ratedCurrentA: 10,
    detail: "Three in-line 4 mm round pins, 19 mm apart, earth in the centre. The everyday Italian socket.",
  },
  {
    code: "L16",
    label: "Type L 16 A (CEI 23-50 P17)",
    ratedCurrentA: 16,
    detail: "Same layout scaled up: 5 mm pins on 26 mm centres, used for heaters, ovens and air conditioners.",
  },
  {
    code: "F",
    label: "Type F Schuko (CEE 7/3)",
    ratedCurrentA: 16,
    detail: "Round recess with side earth clips. Common in newer builds and in most hotels.",
  },
  {
    code: "BIPASSO",
    label: "Bipasso / Schuko-Italian universal",
    ratedCurrentA: 16,
    detail: "A single socket that swallows 10 A type L, 16 A type L and Schuko. Increasingly the default fitting.",
  },
];

/** Standard domestic supply contract sold by Italian retailers, in watts. */
export const DOMESTIC_CONTRACT_W = 3000;

/**
 * Plug types and whether they enter an Italian socket unaided.
 * fit: "native"  - the Italian plug itself
 *      "fits"    - enters ordinary Italian sockets with no adapter
 *      "partial" - enters only Schuko or bipasso sockets, not a plain 10 A type L
 *      "no"      - needs an adapter
 */
export const PLUG_TYPES = [
  { code: "A", name: "Type A - two flat pins", where: "United States, Canada, Mexico, Japan", fit: "no" },
  { code: "B", name: "Type B - two flat pins plus round earth", where: "United States, Canada, Mexico", fit: "no" },
  { code: "C", name: "Type C - Europlug, two 4 mm round pins", where: "Most of Europe, unearthed devices", fit: "fits" },
  { code: "D", name: "Type D - three large round pins", where: "India, Nepal, Sri Lanka (older fittings)", fit: "no" },
  { code: "E", name: "Type E - French, socket-mounted earth pin", where: "France, Belgium, Poland, Czechia", fit: "partial" },
  { code: "F", name: "Type F - Schuko, side earth clips", where: "Germany, Spain, Netherlands, Nordics", fit: "partial" },
  { code: "G", name: "Type G - three rectangular pins", where: "United Kingdom, Ireland, Malta, Singapore", fit: "no" },
  { code: "H", name: "Type H - three pins in a shallow V", where: "Israel, Palestine", fit: "no" },
  { code: "I", name: "Type I - two angled flat pins plus earth", where: "Australia, New Zealand, Argentina, China", fit: "no" },
  { code: "J", name: "Type J - Swiss three-pin", where: "Switzerland, Liechtenstein", fit: "no" },
  { code: "K", name: "Type K - Danish three-pin", where: "Denmark, Greenland", fit: "no" },
  { code: "L", name: "Type L - Italian three in-line pins", where: "Italy, Chile, Uruguay", fit: "native" },
  { code: "M", name: "Type M - three very large round pins", where: "South Africa, Namibia, Botswana", fit: "no" },
  { code: "N", name: "Type N - Brazilian NBR 14136", where: "Brazil, South Africa (new installations)", fit: "no" },
];

/** Devices whose only job is to make heat draw their full nameplate power the whole time. */
export const HIGH_DRAW_HINT_W = 1000;

const MAX_REASONABLE_WATTS = 20000;
const MAX_REASONABLE_VOLTS = 1000;

export function findPlugType(code) {
  return PLUG_TYPES.find((p) => p.code === code) || null;
}

/**
 * Current an appliance pulls from an Italian socket.
 * A voltage converter passes power through, so the wall-side current is still
 * (roughly) watts / 230 whether or not a converter sits in between.
 */
export function currentAtItalianMains(watts) {
  return watts / MAINS_VOLTAGE_V;
}

/**
 * @returns {{error:string}|object}
 */
export function assessItalyPower({
  plugType = "C",
  deviceMinVoltageV = 100,
  deviceMaxVoltageV = 240,
  deviceFrequency = "both",
  deviceWatts = 65,
}) {
  const plug = findPlugType(plugType);
  if (!plug) return { error: "Pick a plug type from the list." };

  const nums = [deviceMinVoltageV, deviceMaxVoltageV, deviceWatts];
  if (nums.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    return { error: "Enter a number for the voltage range and the wattage." };
  }
  if (!["both", "50", "60"].includes(String(deviceFrequency))) {
    return { error: "Choose the frequency printed on the label: 50 Hz, 60 Hz or both." };
  }
  if (deviceMinVoltageV <= 0 || deviceMaxVoltageV <= 0) {
    return { error: "Voltage must be greater than zero — copy the range printed on the label." };
  }
  if (deviceMaxVoltageV < deviceMinVoltageV) {
    return { error: "The maximum voltage cannot be lower than the minimum voltage." };
  }
  if (deviceMaxVoltageV > MAX_REASONABLE_VOLTS) {
    return { error: "Voltage looks too high — mains appliances are labelled somewhere between 100 V and 250 V." };
  }
  if (deviceWatts <= 0) {
    return { error: "Enter the appliance wattage — it must be greater than zero." };
  }
  if (deviceWatts > MAX_REASONABLE_WATTS) {
    return { error: "That wattage is beyond anything a wall socket can supply." };
  }

  const adapterNeeded = plug.fit === "no" || plug.fit === "partial";
  const adapterNote =
    plug.fit === "native"
      ? "Your plug is the Italian plug — nothing to buy."
      : plug.fit === "fits"
        ? "A Europlug enters both the Italian type L socket and a Schuko socket, so no adapter is needed."
        : plug.fit === "partial"
          ? "This plug enters a Schuko or bipasso socket but will not go into a plain 10 A type L socket. Carry a slim type L adapter for older rooms."
          : "This plug will not enter any Italian socket. Carry a type L or Schuko adapter.";

  const voltageOk = deviceMinVoltageV <= MAINS_VOLTAGE_V && deviceMaxVoltageV >= MAINS_VOLTAGE_V;
  const converterNeeded = !voltageOk;
  const converterDirection = converterNeeded
    ? deviceMaxVoltageV < MAINS_VOLTAGE_V
      ? "step-down"
      : "step-up"
    : null;
  const toleranceRisk = voltageOk && deviceMaxVoltageV < SUPPLY_MAX_V;

  const freq = String(deviceFrequency);
  const frequencyOk = freq === "both" || freq === "50";
  const frequencyNote = frequencyOk
    ? "Italy runs 50 Hz, which your label accepts."
    : "Your label says 60 Hz only. Anything with a synchronous motor or a mains-driven clock will run about 17% slow on 50 Hz; a switch-mode charger normally does not care.";

  const currentA = currentAtItalianMains(deviceWatts);
  const fitsSocket10A = currentA <= 10;
  const fitsSocket16A = currentA <= 16;
  const exceedsDomesticContract = deviceWatts > DOMESTIC_CONTRACT_W;
  const headroomOnContractW = DOMESTIC_CONTRACT_W - deviceWatts;

  const actions = [];
  if (adapterNeeded) {
    actions.push(
      plug.fit === "partial"
        ? "Pack a type L adapter for older 10 A sockets."
        : "Pack a type L or Schuko travel adapter.",
    );
  }
  if (converterNeeded && converterDirection === "step-down") {
    actions.push(
      deviceWatts >= HIGH_DRAW_HINT_W
        ? `Your device is single-voltage and draws ${Math.round(deviceWatts)} W, so it would need a heavy step-down transformer. Buying or borrowing a 230 V version in Italy is usually cheaper than carrying one.`
        : "Your device is single-voltage, so it needs a 230 V to 120 V step-down converter — an adapter alone will destroy it.",
    );
  }
  if (converterNeeded && converterDirection === "step-up") {
    actions.push("Your device needs more than 230 V, so it needs a step-up transformer rated for its full wattage.");
  }
  if (!frequencyOk) actions.push("Expect anything clock- or motor-driven to run slow on 50 Hz.");
  if (!fitsSocket10A && fitsSocket16A) {
    actions.push("Over 10 A — use a 16 A type L or Schuko socket, not the small everyday one.");
  }
  if (!fitsSocket16A) actions.push("Over 16 A — no ordinary Italian socket is rated for this appliance.");
  if (exceedsDomesticContract) {
    actions.push(
      `Above the ${DOMESTIC_CONTRACT_W} W standard Italian domestic contract, so it can trip the meter on its own.`,
    );
  }
  if (toleranceRisk) {
    actions.push(
      `The supply is allowed to drift to ${Math.round(SUPPLY_MAX_V)} V; your label tops out at ${deviceMaxVoltageV} V, which leaves no margin.`,
    );
  }
  if (actions.length === 0) actions.push("Nothing to buy — plug it straight in.");

  let verdict;
  if (converterNeeded) verdict = "Converter required";
  else if (adapterNeeded) verdict = "Adapter only";
  else verdict = "Plug straight in";

  return {
    plug,
    adapterNeeded,
    adapterNote,
    voltageOk,
    converterNeeded,
    converterDirection,
    toleranceRisk,
    frequencyOk,
    frequencyNote,
    currentA,
    fitsSocket10A,
    fitsSocket16A,
    exceedsDomesticContract,
    headroomOnContractW,
    verdict,
    actions,
  };
}
