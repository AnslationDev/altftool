/**
 * Plug and voltage rules for the United Arab Emirates.
 *
 * The UAE supplies single-phase mains at 230 V, 50 Hz. It inherited the
 * British wiring system, so the general-purpose socket is BS 1363 — the three
 * rectangular-pin pattern the IEC calls type G — and, like the UK, the plug
 * itself carries a BS 1362 cartridge fuse sized to the appliance rather than
 * to the circuit. The IEC also lists type C and type D outlets for the UAE:
 * round-pin fittings that survive in older buildings and in equipment imported
 * from Europe and the Indian subcontinent.
 *
 * The decision made here:
 *   1. Does the plug enter the socket you will actually find, or is an
 *      adapter needed?
 *   2. Does the appliance accept 230 V, or is a voltage converter needed?
 *   3. Does the appliance accept 50 Hz?
 *   4. Which BS 1362 fuse belongs in the plug, and does the load fit 13 A?
 *
 * A plug adapter changes shape only. A converter or transformer changes volts.
 */

/** Nominal single-phase mains voltage in the UAE (IEC World Plugs lists 230 V). */
export const MAINS_VOLTAGE_V = 230;

/** Nominal mains frequency in the UAE. */
export const MAINS_FREQUENCY_HZ = 50;

/**
 * Working planning margin. Distribution supply is never exactly nominal and a
 * swing of several percent either way is ordinary, so this module treats
 * +/-10% as the band an appliance should tolerate rather than a legal limit.
 */
export const PLANNING_TOLERANCE_FRACTION = 0.1;
export const SUPPLY_MIN_V = MAINS_VOLTAGE_V * (1 - PLANNING_TOLERANCE_FRACTION); // 207 V
export const SUPPLY_MAX_V = MAINS_VOLTAGE_V * (1 + PLANNING_TOLERANCE_FRACTION); // 253 V

/** Rating of the ordinary BS 1363 wall socket and of the largest plug fuse. */
export const STANDARD_SOCKET_A = 13;

/** Fuse ratings manufactured to BS 1362 and sold across the Gulf. */
export const FUSE_RATINGS_A = [3, 5, 13];

/** Above this a single-voltage appliance needs a transformer too heavy to be worth carrying. */
export const HIGH_DRAW_HINT_W = 1000;

/** Sockets and outlets a visitor actually meets in the UAE. */
export const SOCKET_TYPES = [
  {
    code: "G13",
    label: "BS 1363 13 A switched socket (type G)",
    ratedCurrentA: 13,
    detail:
      "The standard outlet in Dubai and Abu Dhabi. Three rectangular pins with a longer earth pin that opens the shutters, usually with its own switch.",
  },
  {
    code: "UNIV",
    label: "Universal / multi-standard hotel socket",
    ratedCurrentA: 13,
    detail:
      "A single faceplate slotted for several plug shapes, common in hotel rooms and serviced apartments. Convenient, but it does nothing about voltage.",
  },
  {
    code: "C",
    label: "Type C two-pin round outlet",
    ratedCurrentA: 10,
    detail: "Unearthed Europlug socket found in older buildings and on imported European fittings.",
  },
  {
    code: "D5",
    label: "BS 546 5 A round-pin socket (type D)",
    ratedCurrentA: 5,
    detail: "Three round pins, a legacy fitting still seen in older villas and on some imported appliances.",
  },
];

/**
 * Plug types and whether they enter a UAE socket unaided.
 * fit: "native" | "sometimes" | "no"
 * "sometimes" means it fits only the legacy round-pin outlets, not the BS 1363
 * socket that most rooms actually have.
 */
export const PLUG_TYPES = [
  { code: "G", name: "Type G - three rectangular pins, fused", where: "UAE, UK, Ireland, Singapore, Malaysia, Hong Kong", fit: "native" },
  { code: "C", name: "Type C - Europlug, two 4 mm round pins", where: "Most of Europe, unearthed devices", fit: "sometimes" },
  { code: "D", name: "Type D - three large round pins", where: "India, Nepal, Sri Lanka", fit: "sometimes" },
  { code: "A", name: "Type A - two flat parallel pins", where: "United States, Canada, Mexico, Japan", fit: "no" },
  { code: "B", name: "Type B - two flat pins plus round earth", where: "United States, Canada, Mexico", fit: "no" },
  { code: "E", name: "Type E - French, socket-mounted earth pin", where: "France, Belgium, Poland, Czechia", fit: "no" },
  { code: "F", name: "Type F - Schuko, side earth clips", where: "Germany, Spain, Netherlands, Nordics", fit: "no" },
  { code: "H", name: "Type H - three pins in a shallow V", where: "Israel, Palestine", fit: "no" },
  { code: "I", name: "Type I - flat angled pins", where: "Australia, New Zealand, China, Argentina", fit: "no" },
  { code: "J", name: "Type J - Swiss three-pin", where: "Switzerland, Liechtenstein", fit: "no" },
  { code: "K", name: "Type K - Danish three-pin", where: "Denmark, Greenland", fit: "no" },
  { code: "L", name: "Type L - Italian three in-line pins", where: "Italy, Chile", fit: "no" },
  { code: "M", name: "Type M - three very large round pins", where: "South Africa, Namibia, Botswana", fit: "no" },
  { code: "N", name: "Type N - Brazilian / IEC 60906-1 pattern", where: "Brazil, South Africa (new installs)", fit: "no" },
];

const MAX_REASONABLE_WATTS = 20000;
const MAX_REASONABLE_VOLTS = 1000;

export function findPlugType(code) {
  return PLUG_TYPES.find((p) => p.code === code) || null;
}

/** Current drawn from a 230 V UAE socket at unity power factor. */
export function currentAtUaeMains(watts) {
  return watts / MAINS_VOLTAGE_V;
}

/**
 * Smallest BS 1362 fuse at or above the appliance current.
 * @returns {number|null} null when the load exceeds every manufactured rating.
 */
export function recommendFuseA(watts) {
  if (!Number.isFinite(watts) || watts <= 0) return null;
  const amps = currentAtUaeMains(watts);
  return FUSE_RATINGS_A.find((rating) => amps <= rating) ?? null;
}

/**
 * @returns {{error:string}|object}
 */
export function assessUaePower({
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

  const adapterNeeded = plug.fit !== "native";
  const conditionalFit = plug.fit === "sometimes";
  const adapterNote =
    plug.fit === "native"
      ? "Your plug is the UAE plug — nothing to buy."
      : plug.fit === "sometimes"
        ? "This shape only enters the legacy round-pin outlets the IEC still lists for the UAE. The BS 1363 socket in most rooms is shuttered and will not take it, so pack a type G adapter anyway."
        : "This plug will not enter a UAE socket. Carry a type G adapter.";

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
    ? "The UAE runs 50 Hz, which your label accepts."
    : "Your label says 60 Hz only. A synchronous motor or a mains-timed clock runs about 17% slow on 50 Hz; a switch-mode charger normally does not care.";

  const currentA = currentAtUaeMains(deviceWatts);
  const fitsStandardSocket = currentA <= STANDARD_SOCKET_A;
  const fuseA = recommendFuseA(deviceWatts);

  const actions = [];
  if (adapterNeeded) actions.push("Pack a type G (BS 1363) travel adapter — ideally a fused one.");
  if (conditionalFit) {
    actions.push("Do not count on finding a round-pin outlet; treat it as a bonus, not a plan.");
  }
  if (converterNeeded && converterDirection === "step-down") {
    actions.push(
      deviceWatts >= HIGH_DRAW_HINT_W
        ? `Single-voltage and ${Math.round(deviceWatts)} W, so it would need a heavy step-down transformer — a 230 V version bought locally is usually cheaper than carrying one.`
        : "Single-voltage device: it needs a 230 V to 110/120 V step-down converter. A plug adapter alone will destroy it.",
    );
  }
  if (converterNeeded && converterDirection === "step-up") {
    actions.push("Your device needs more than 230 V, so it needs a step-up transformer rated above its wattage.");
  }
  if (!frequencyOk) actions.push("Expect anything clock- or motor-driven to run slow on 50 Hz.");
  if (fuseA) {
    actions.push(
      `Fit a ${fuseA} A BS 1362 fuse in the plug — the smallest standard rating above the ${currentA.toFixed(2)} A this appliance draws.`,
    );
  } else {
    actions.push(`Over ${STANDARD_SOCKET_A} A — no BS 1362 plug fuse covers it, so it needs a dedicated circuit.`);
  }
  if (toleranceRisk) {
    actions.push(
      `Plan for the supply drifting to about ${Math.round(SUPPLY_MAX_V)} V; your label stops at ${deviceMaxVoltageV} V, which leaves little margin.`,
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
    conditionalFit,
    adapterNote,
    voltageOk,
    converterNeeded,
    converterDirection,
    toleranceRisk,
    frequencyOk,
    frequencyNote,
    currentA,
    fuseA,
    fitsStandardSocket,
    maxWattsOnStandardSocket: STANDARD_SOCKET_A * MAINS_VOLTAGE_V,
    verdict,
    actions,
  };
}
