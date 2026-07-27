/**
 * Plug and voltage rules for the United Kingdom.
 *
 * The UK supplies single-phase mains at 230 V, 50 Hz. Its socket is BS 1363 —
 * the three rectangular-pin pattern the IEC calls type G. Two things make the
 * UK different from almost everywhere else:
 *
 *   1. The plug itself contains a cartridge fuse to BS 1362. The fuse protects
 *      the flexible cord, not the appliance, so it is chosen from the
 *      appliance's current draw, not from the socket rating.
 *   2. Sockets are fed from ring final circuits protected at 32 A, so the
 *      13 A plug fuse — not the wall socket — is the real ceiling on one plug.
 *
 * The decision this module makes is the usual travel one:
 *   1. Does the plug enter a BS 1363 socket, or is an adapter needed?
 *   2. Does the appliance accept 230 V, or is a voltage converter needed?
 *   3. Does the appliance accept 50 Hz?
 *   4. Which BS 1362 fuse belongs in the plug, and does the load fit 13 A?
 *
 * A plug adapter changes shape only. A converter or transformer changes volts.
 */

/** Nominal single-phase mains voltage, harmonised value in BS EN 60038. */
export const MAINS_VOLTAGE_V = 230;

/** Nominal mains frequency in the UK. */
export const MAINS_FREQUENCY_HZ = 50;

/**
 * Statutory supply tolerance. The Electricity Safety, Quality and Continuity
 * Regulations 2002 allow 230 V +10% / -6%, which is why UK equipment built for
 * the historic 240 V still works and why the supply can legally sit at 253 V.
 */
export const TOLERANCE_PLUS_FRACTION = 0.1;
export const TOLERANCE_MINUS_FRACTION = 0.06;
export const SUPPLY_MIN_V = MAINS_VOLTAGE_V * (1 - TOLERANCE_MINUS_FRACTION); // 216.2 V
export const SUPPLY_MAX_V = MAINS_VOLTAGE_V * (1 + TOLERANCE_PLUS_FRACTION); // 253 V

/** Rating of the ordinary BS 1363 wall socket and of the largest plug fuse. */
export const STANDARD_SOCKET_A = 13;

/** Ring final circuits serving socket outlets are protected at 32 A (BS 7671). */
export const RING_CIRCUIT_A = 32;

/**
 * Bathroom shaver supply units to BS EN 61558-2-5 are isolating transformers
 * with a typical output rating of 20 VA — enough for a shaver or toothbrush
 * charger and nothing else. This is why a hair dryer trips or cooks them.
 */
export const SHAVER_SOCKET_VA = 20;

/** Above this a single-voltage appliance needs a transformer too heavy to carry. */
export const HIGH_DRAW_HINT_W = 1000;

/** Fuse ratings actually manufactured to BS 1362 and sold in UK shops. */
export const FUSE_RATINGS_A = [3, 5, 13];

/**
 * Conventional UK shorthand: 3 A for appliances up to about 700 W, 13 A above.
 * The rounded 700 W comes from 3 A at the historic 240 V supply (720 W); at the
 * harmonised 230 V a 3 A fuse actually covers 690 W, which is what the
 * next-rating-up calculation below uses.
 */
export const THREE_AMP_CONVENTION_W = 700;

/** Sockets and outlets a visitor actually meets in the UK. */
export const SOCKET_TYPES = [
  {
    code: "G13",
    label: "BS 1363 13 A switched socket (type G)",
    ratedCurrentA: 13,
    detail:
      "Three rectangular pins with a longer earth pin that opens the shutters. Single or double, almost always with its own rocker switch.",
  },
  {
    code: "USB",
    label: "BS 1363 socket with built-in USB",
    ratedCurrentA: 13,
    detail:
      "Same faceplate with USB-A or USB-C outlets. The USB side is typically a few amps at 5 V and shares the same 13 A supply.",
  },
  {
    code: "D5",
    label: "BS 546 5 A round-pin socket (type D)",
    ratedCurrentA: 5,
    detail:
      "Three round pins, now used almost only on switched lamp circuits in hotels and theatres. Not a general-purpose outlet.",
  },
  {
    code: "SHAVER",
    label: "Bathroom shaver supply unit",
    ratedCurrentA: 0.09,
    detail:
      "Isolated dual-voltage 115 V / 230 V outlet rated about 20 VA. Shavers and toothbrushes only — never a hair dryer.",
  },
];

/**
 * Plug types and whether they enter a BS 1363 socket unaided.
 * fit: "native" | "no"
 * UK sockets are shuttered and the shutters only open when a longer earth pin
 * enters first, so no continental or American plug fits, with or without force.
 */
export const PLUG_TYPES = [
  { code: "G", name: "Type G - three rectangular pins, fused", where: "UK, Ireland, Malta, Cyprus, Singapore, Malaysia, Hong Kong, UAE, Kenya", fit: "native" },
  { code: "A", name: "Type A - two flat parallel pins", where: "United States, Canada, Mexico, Japan", fit: "no" },
  { code: "B", name: "Type B - two flat pins plus round earth", where: "United States, Canada, Mexico", fit: "no" },
  { code: "C", name: "Type C - Europlug, two 4 mm round pins", where: "Most of Europe, unearthed devices", fit: "no" },
  { code: "D", name: "Type D - three large round pins", where: "India, Nepal, Sri Lanka", fit: "no" },
  { code: "E", name: "Type E - French, socket-mounted earth pin", where: "France, Belgium, Poland, Czechia", fit: "no" },
  { code: "F", name: "Type F - Schuko, side earth clips", where: "Germany, Spain, Netherlands, Nordics", fit: "no" },
  { code: "H", name: "Type H - three pins in a shallow V", where: "Israel, Palestine", fit: "no" },
  { code: "I", name: "Type I - flat angled pins", where: "Australia, New Zealand, China, Argentina", fit: "no" },
  { code: "J", name: "Type J - Swiss three-pin", where: "Switzerland, Liechtenstein", fit: "no" },
  { code: "K", name: "Type K - Danish three-pin", where: "Denmark, Greenland", fit: "no" },
  { code: "L", name: "Type L - Italian three in-line pins", where: "Italy, Chile", fit: "no" },
  { code: "M", name: "Type M - three very large round pins", where: "South Africa, Namibia, Botswana", fit: "no" },
  { code: "N", name: "Type N - Brazilian / South African NBR-IEC pattern", where: "Brazil, South Africa (new installs)", fit: "no" },
];

const MAX_REASONABLE_WATTS = 20000;
const MAX_REASONABLE_VOLTS = 1000;

export function findPlugType(code) {
  return PLUG_TYPES.find((p) => p.code === code) || null;
}

/** Current drawn from a 230 V UK socket at unity power factor. */
export function currentAtUkMains(watts) {
  return watts / MAINS_VOLTAGE_V;
}

/**
 * Smallest BS 1362 fuse at or above the appliance current.
 * @returns {number|null} null when the load exceeds every manufactured rating.
 */
export function recommendFuseA(watts) {
  if (!Number.isFinite(watts) || watts <= 0) return null;
  const amps = currentAtUkMains(watts);
  return FUSE_RATINGS_A.find((rating) => amps <= rating) ?? null;
}

/**
 * @returns {{error:string}|object}
 */
export function assessUkPower({
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

  const adapterNeeded = plug.fit === "no";
  const adapterNote =
    plug.fit === "native"
      ? "Your plug is the UK plug — nothing to buy."
      : "British sockets are shuttered and only open for a longer earth pin, so this plug cannot enter one. Carry a type G adapter.";

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
    ? "The UK runs 50 Hz, which your label accepts."
    : "Your label says 60 Hz only. A synchronous motor or a mains-timed clock runs about 17% slow on 50 Hz; a switch-mode charger normally does not care.";

  const currentA = currentAtUkMains(deviceWatts);
  const fitsStandardSocket = currentA <= STANDARD_SOCKET_A;
  const fuseA = recommendFuseA(deviceWatts);
  const shaverSocketOk = deviceWatts <= SHAVER_SOCKET_VA;

  const actions = [];
  if (adapterNeeded) actions.push("Pack a type G (BS 1363) travel adapter — ideally a fused one.");
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
  if (!shaverSocketOk) {
    actions.push(`Too heavy for a bathroom shaver socket, which is limited to about ${SHAVER_SOCKET_VA} VA.`);
  }
  if (toleranceRisk) {
    actions.push(
      `UK supply may legally sit as high as ${Math.round(SUPPLY_MAX_V)} V; your label stops at ${deviceMaxVoltageV} V, which leaves little margin.`,
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
    fuseA,
    fitsStandardSocket,
    shaverSocketOk,
    maxWattsOnStandardSocket: STANDARD_SOCKET_A * MAINS_VOLTAGE_V,
    verdict,
    actions,
  };
}
