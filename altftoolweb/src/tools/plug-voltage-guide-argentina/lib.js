/**
 * Plug and voltage rules for Argentina.
 *
 * Argentina supplies 220 V at 50 Hz. Its earthed socket is IRAM 2073 — the
 * flat angled-pin pattern the IEC calls type I, physically the same shape as
 * the Australian AS/NZS 3112 plug but wired the other way round: the pin that
 * carries line in Australia and New Zealand carries neutral in Argentina.
 * Older and unearthed fittings take the two-pin round type C Europlug, and
 * combination sockets that accept both shapes are common in hotels.
 *
 * The decision made here is the usual travel one:
 *   1. Does the plug enter an Argentine socket, or is an adapter needed?
 *   2. Does the appliance accept 220 V, or is a voltage converter needed?
 *   3. Does the appliance accept 50 Hz?
 *   4. Does the current stay inside the 10 A socket rating?
 *
 * A plug adapter changes shape only. A converter or transformer changes volts.
 */

/** Nominal single-phase mains voltage in Argentina. */
export const MAINS_VOLTAGE_V = 220;

/** Nominal mains frequency in Argentina. */
export const MAINS_FREQUENCY_HZ = 50;

/**
 * Working planning margin. Distribution supply is never exactly nominal, and
 * a swing of several percent either way is ordinary, so this module treats
 * +/-10% as the band an appliance should tolerate rather than a legal limit.
 */
export const PLANNING_TOLERANCE_FRACTION = 0.1;
export const SUPPLY_MIN_V = MAINS_VOLTAGE_V * (1 - PLANNING_TOLERANCE_FRACTION); // 198 V
export const SUPPLY_MAX_V = MAINS_VOLTAGE_V * (1 + PLANNING_TOLERANCE_FRACTION); // 242 V

/** Sockets in use in Argentina. IRAM 2071/2073 covers the 10 A and 20 A patterns. */
export const SOCKET_TYPES = [
  {
    code: "I10",
    label: "Type I 10 A (IRAM 2073)",
    ratedCurrentA: 10,
    detail:
      "Two flat pins in a shallow V plus a vertical earth pin. The standard Argentine outlet — same shape as Australia, opposite polarity.",
  },
  {
    code: "I20",
    label: "Type I 20 A (IRAM 2073)",
    ratedCurrentA: 20,
    detail: "Same pattern with wider pin spacing, fitted for air conditioners, ovens and electric water heaters.",
  },
  {
    code: "C",
    label: "Type C two-pin round",
    ratedCurrentA: 10,
    detail: "Unearthed round-pin outlet still found in older buildings; takes any Europlug.",
  },
  {
    code: "COMBO",
    label: "Combination I + C outlet",
    ratedCurrentA: 10,
    detail: "A single faceplate slotted for both the flat angled pins and round Europlug pins. Common in hotels.",
  },
];

/**
 * Plug types and whether they enter an Argentine socket unaided.
 * fit: "native" | "fits" | "partial" | "no"
 */
export const PLUG_TYPES = [
  { code: "A", name: "Type A - two flat parallel pins", where: "United States, Canada, Mexico, Japan", fit: "no" },
  { code: "B", name: "Type B - two flat pins plus round earth", where: "United States, Canada, Mexico", fit: "no" },
  { code: "C", name: "Type C - Europlug, two 4 mm round pins", where: "Most of Europe, unearthed devices", fit: "fits" },
  { code: "D", name: "Type D - three large round pins", where: "India, Nepal, Sri Lanka (older fittings)", fit: "no" },
  { code: "E", name: "Type E - French, socket-mounted earth pin", where: "France, Belgium, Poland, Czechia", fit: "no" },
  { code: "F", name: "Type F - Schuko, side earth clips", where: "Germany, Spain, Netherlands, Nordics", fit: "no" },
  { code: "G", name: "Type G - three rectangular pins", where: "United Kingdom, Ireland, Malta, Singapore", fit: "no" },
  { code: "H", name: "Type H - three pins in a shallow V", where: "Israel, Palestine", fit: "no" },
  { code: "I-AU", name: "Type I - Australian / New Zealand", where: "Australia, New Zealand", fit: "polarity" },
  { code: "I-CN", name: "Type I - Chinese GB 1002", where: "Mainland China", fit: "polarity" },
  { code: "I-AR", name: "Type I - Argentine IRAM 2073", where: "Argentina, Uruguay", fit: "native" },
  { code: "J", name: "Type J - Swiss three-pin", where: "Switzerland, Liechtenstein", fit: "no" },
  { code: "K", name: "Type K - Danish three-pin", where: "Denmark, Greenland", fit: "no" },
  { code: "L", name: "Type L - Italian three in-line pins", where: "Italy, Chile, Uruguay", fit: "no" },
  { code: "M", name: "Type M - three very large round pins", where: "South Africa, Namibia, Botswana", fit: "no" },
  { code: "N", name: "Type N - Brazilian NBR 14136", where: "Brazil", fit: "no" },
];

/** Rating of the ordinary Argentine wall socket. */
export const STANDARD_SOCKET_A = 10;
/** Rating of the heavy-appliance Argentine socket. */
export const HEAVY_SOCKET_A = 20;

/** Above this, a single-voltage device needs a transformer too heavy to be worth carrying. */
export const HIGH_DRAW_HINT_W = 1000;

const MAX_REASONABLE_WATTS = 20000;
const MAX_REASONABLE_VOLTS = 1000;

export function findPlugType(code) {
  return PLUG_TYPES.find((p) => p.code === code) || null;
}

/** Current drawn from a 220 V Argentine socket at unity power factor. */
export function currentAtArgentineMains(watts) {
  return watts / MAINS_VOLTAGE_V;
}

/**
 * @returns {{error:string}|object}
 */
export function assessArgentinaPower({
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
  const polarityReversed = plug.fit === "polarity";
  const adapterNote =
    plug.fit === "native"
      ? "Your plug is the Argentine plug — nothing to buy."
      : plug.fit === "fits"
        ? "A Europlug enters Argentine round-pin and combination sockets, so no adapter is needed."
        : plug.fit === "polarity"
          ? "The pins are the same shape, so it goes in — but Argentine wiring puts line and neutral on the opposite pins from Australia, New Zealand and China."
          : "This plug will not enter an Argentine socket. Carry a type I adapter.";

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
    ? "Argentina runs 50 Hz, which your label accepts."
    : "Your label says 60 Hz only. A synchronous motor or a mains-timed clock runs about 17% slow on 50 Hz; a switch-mode charger normally does not care.";

  const currentA = currentAtArgentineMains(deviceWatts);
  const fitsStandardSocket = currentA <= STANDARD_SOCKET_A;
  const fitsHeavySocket = currentA <= HEAVY_SOCKET_A;

  const actions = [];
  if (adapterNeeded) actions.push("Pack a type I (IRAM 2073) travel adapter.");
  if (polarityReversed) {
    actions.push(
      "Same pin shape, reversed polarity: fine for a double-insulated charger, but anything with a single-pole switch or an exposed element is safer on a proper earthed Argentine lead.",
    );
  }
  if (converterNeeded && converterDirection === "step-down") {
    actions.push(
      deviceWatts >= HIGH_DRAW_HINT_W
        ? `Single-voltage and ${Math.round(deviceWatts)} W, so it would need a heavy step-down transformer — buying a 220 V version locally is usually cheaper than carrying one.`
        : "Single-voltage device: it needs a 220 V to 110/120 V step-down converter. A plug adapter alone will destroy it.",
    );
  }
  if (converterNeeded && converterDirection === "step-up") {
    actions.push("Your device needs more than 220 V, so it needs a step-up transformer rated above its wattage.");
  }
  if (!frequencyOk) actions.push("Expect anything clock- or motor-driven to run slow on 50 Hz.");
  if (!fitsStandardSocket && fitsHeavySocket) {
    actions.push(`Over ${STANDARD_SOCKET_A} A — use a ${HEAVY_SOCKET_A} A outlet, not the ordinary wall socket.`);
  }
  if (!fitsHeavySocket) actions.push(`Over ${HEAVY_SOCKET_A} A — beyond any ordinary Argentine socket.`);
  if (toleranceRisk) {
    actions.push(
      `Plan for the supply drifting to about ${Math.round(SUPPLY_MAX_V)} V; your label stops at ${deviceMaxVoltageV} V, which leaves little margin.`,
    );
  }
  if (actions.length === 0) actions.push("Nothing to buy — plug it straight in.");

  let verdict;
  if (converterNeeded) verdict = "Converter required";
  else if (adapterNeeded) verdict = "Adapter only";
  else if (polarityReversed) verdict = "Fits, check polarity";
  else verdict = "Plug straight in";

  return {
    plug,
    adapterNeeded,
    polarityReversed,
    adapterNote,
    voltageOk,
    converterNeeded,
    converterDirection,
    toleranceRisk,
    frequencyOk,
    frequencyNote,
    currentA,
    fitsStandardSocket,
    fitsHeavySocket,
    maxWattsOnStandardSocket: STANDARD_SOCKET_A * MAINS_VOLTAGE_V,
    verdict,
    actions,
  };
}
