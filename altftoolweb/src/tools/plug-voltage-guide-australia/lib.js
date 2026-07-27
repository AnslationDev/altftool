/**
 * Plug and voltage rules for Australia (and New Zealand, which shares the standard).
 *
 * Australia supplies single-phase mains at 230 V, 50 Hz. Its socket is
 * AS/NZS 3112 — the two flat pins in a shallow V plus a vertical earth pin
 * that the IEC calls type I. Two things catch travellers out:
 *
 *   1. Nothing else fits. Australian sockets have no round-pin provision at
 *      all, so even a Europlug — which slips into half the world's outlets —
 *      cannot enter one.
 *   2. Higher-current versions of the same pattern use a WIDER earth pin. A
 *      10 A plug goes into a 15 A or 20 A socket, but a 15 A plug will not go
 *      into a 10 A socket. This is the caravan-park and campervan trap.
 *
 * The decision made here is the usual travel one:
 *   1. Does the plug enter an Australian socket, or is an adapter needed?
 *   2. Does the appliance accept 230 V, or is a voltage converter needed?
 *   3. Does the appliance accept 50 Hz?
 *   4. Which socket rating does the load need — 10 A, 15 A, 20 A or more?
 *
 * A plug adapter changes shape only. A converter or transformer changes volts.
 */

/** Nominal single-phase mains voltage. Australia moved from 240 V to the 230 V standard value in AS 60038. */
export const MAINS_VOLTAGE_V = 230;

/** Nominal mains frequency in Australia and New Zealand. */
export const MAINS_FREQUENCY_HZ = 50;

/**
 * Declared supply tolerance for low-voltage distribution: 230 V +10% / -6%,
 * so the supply can legally sit anywhere from about 216 V to 253 V. This is
 * why appliances still labelled for the historic 240 V run without trouble.
 */
export const TOLERANCE_PLUS_FRACTION = 0.1;
export const TOLERANCE_MINUS_FRACTION = 0.06;
export const SUPPLY_MIN_V = MAINS_VOLTAGE_V * (1 - TOLERANCE_MINUS_FRACTION); // 216.2 V
export const SUPPLY_MAX_V = MAINS_VOLTAGE_V * (1 + TOLERANCE_PLUS_FRACTION); // 253 V

/** Rating of the ordinary Australian wall socket. */
export const STANDARD_SOCKET_A = 10;

/** The AS/NZS 3112 current ladder. Each step up widens the earth pin, so plugs only fit upwards. */
export const SOCKET_LADDER_A = [10, 15, 20, 32];

/** Above this a single-voltage appliance needs a transformer too heavy to be worth carrying. */
export const HIGH_DRAW_HINT_W = 1000;

/** Sockets and outlets a visitor actually meets in Australia. */
export const SOCKET_TYPES = [
  {
    code: "I10",
    label: "AS/NZS 3112 10 A socket (type I)",
    ratedCurrentA: 10,
    detail:
      "The standard outlet in every house, office and hotel room. Two flat pins in a shallow V plus a vertical earth pin, usually with its own switch.",
  },
  {
    code: "I15",
    label: "AS/NZS 3112 15 A socket",
    ratedCurrentA: 15,
    detail:
      "Same shape with a wider earth pin and a wider earth slot. Common at caravan parks and on campervans; it accepts a 10 A plug as well.",
  },
  {
    code: "I20",
    label: "AS/NZS 3112 20 A socket",
    ratedCurrentA: 20,
    detail: "Wider again, fitted for larger fixed appliances and workshop equipment.",
  },
  {
    code: "I32",
    label: "AS/NZS 3112 25 A / 32 A socket",
    ratedCurrentA: 32,
    detail: "Heavy-duty single-phase outlets for site power and large caravans; not something you will find in a hotel.",
  },
];

/**
 * Plug types and whether they enter an Australian socket unaided.
 * fit: "native" | "polarity" | "no"
 */
export const PLUG_TYPES = [
  { code: "I-AU", name: "Type I - Australian / New Zealand AS/NZS 3112", where: "Australia, New Zealand, Fiji, Papua New Guinea", fit: "native" },
  { code: "I-CN", name: "Type I - Chinese GB 1002", where: "Mainland China", fit: "polarity" },
  { code: "I-AR", name: "Type I - Argentine IRAM 2073", where: "Argentina, Uruguay", fit: "polarity" },
  { code: "A", name: "Type A - two flat parallel pins", where: "United States, Canada, Mexico, Japan", fit: "no" },
  { code: "B", name: "Type B - two flat pins plus round earth", where: "United States, Canada, Mexico", fit: "no" },
  { code: "C", name: "Type C - Europlug, two 4 mm round pins", where: "Most of Europe, unearthed devices", fit: "no" },
  { code: "D", name: "Type D - three large round pins", where: "India, Nepal, Sri Lanka", fit: "no" },
  { code: "E", name: "Type E - French, socket-mounted earth pin", where: "France, Belgium, Poland, Czechia", fit: "no" },
  { code: "F", name: "Type F - Schuko, side earth clips", where: "Germany, Spain, Netherlands, Nordics", fit: "no" },
  { code: "G", name: "Type G - three rectangular pins, fused", where: "United Kingdom, Ireland, Singapore, Malaysia", fit: "no" },
  { code: "H", name: "Type H - three pins in a shallow V", where: "Israel, Palestine", fit: "no" },
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

/** Current drawn from a 230 V Australian socket at unity power factor. */
export function currentAtAustralianMains(watts) {
  return watts / MAINS_VOLTAGE_V;
}

/**
 * Smallest AS/NZS 3112 socket rating that carries this load.
 * @returns {number|null} null when the load exceeds every single-phase rating.
 */
export function requiredSocketRatingA(watts) {
  if (!Number.isFinite(watts) || watts <= 0) return null;
  const amps = currentAtAustralianMains(watts);
  return SOCKET_LADDER_A.find((rating) => amps <= rating) ?? null;
}

/**
 * @returns {{error:string}|object}
 */
export function assessAustralianPower({
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
      ? "Your plug is the Australian plug — nothing to buy."
      : plug.fit === "polarity"
        ? "The pins are the same shape, so it goes in — but that national variant of type I does not agree with AS/NZS 3112 on which pin carries line, so treat the polarity as unknown."
        : "Australian sockets have no round-pin provision at all, so this plug cannot enter one. Carry a type I adapter.";

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
    ? "Australia runs 50 Hz, which your label accepts."
    : "Your label says 60 Hz only. A synchronous motor or a mains-timed clock runs about 17% slow on 50 Hz; a switch-mode charger normally does not care.";

  const currentA = currentAtAustralianMains(deviceWatts);
  const fitsStandardSocket = currentA <= STANDARD_SOCKET_A;
  const socketRatingA = requiredSocketRatingA(deviceWatts);

  const actions = [];
  if (adapterNeeded) actions.push("Pack a type I (AS/NZS 3112) travel adapter — a Europlug will not fit.");
  if (polarityReversed) {
    actions.push(
      "Same pin shape, unverified polarity: fine for a double-insulated charger, but anything with a single-pole switch or an exposed element is safer on a locally bought lead.",
    );
  }
  if (converterNeeded && converterDirection === "step-down") {
    actions.push(
      deviceWatts >= HIGH_DRAW_HINT_W
        ? `Single-voltage and ${Math.round(deviceWatts)} W, so it would need a heavy step-down transformer — buying a 230 V version locally is usually cheaper than carrying one.`
        : "Single-voltage device: it needs a 230 V to 110/120 V step-down converter. A plug adapter alone will destroy it.",
    );
  }
  if (converterNeeded && converterDirection === "step-up") {
    actions.push("Your device needs more than 230 V, so it needs a step-up transformer rated above its wattage.");
  }
  if (!frequencyOk) actions.push("Expect anything clock- or motor-driven to run slow on 50 Hz.");
  if (socketRatingA && socketRatingA > STANDARD_SOCKET_A) {
    actions.push(
      `Needs a ${socketRatingA} A outlet, not the ordinary ${STANDARD_SOCKET_A} A socket. The bigger plug has a wider earth pin and will not fit a 10 A wall socket.`,
    );
  }
  if (!socketRatingA) {
    actions.push("Beyond every standard single-phase AS/NZS 3112 outlet — this needs a dedicated hard-wired supply.");
  }
  if (toleranceRisk) {
    actions.push(
      `Australian supply may sit as high as ${Math.round(SUPPLY_MAX_V)} V; your label stops at ${deviceMaxVoltageV} V, which leaves little margin.`,
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
    socketRatingA,
    maxWattsOnStandardSocket: STANDARD_SOCKET_A * MAINS_VOLTAGE_V,
    verdict,
    actions,
  };
}
