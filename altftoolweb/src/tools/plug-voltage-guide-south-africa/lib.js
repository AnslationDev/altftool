/**
 * Plug and voltage rules for South Africa.
 *
 * South Africa supplies single-phase mains at 230 V, 50 Hz, and is unusual in
 * being mid-way through a change of socket standard:
 *
 *   - SANS 164-1, the IEC's type M: three large round pins, rated 15 A. This
 *     is the big old South African socket, derived from BS 546, and it is
 *     still what most existing buildings have.
 *   - SANS 164-2, the IEC's type N: the slimmer 16 A pattern based on
 *     IEC 60906-1 and shared with Brazil. Since the 2018 edition of the
 *     national wiring code SANS 10142-1, new and rewired installations have to
 *     provide at least one type N socket at every outlet point, so newer
 *     buildings carry both.
 *   - A type N socket also accepts a two-pin Europlug, which is why so many
 *     imported chargers work in new installations and not in old ones.
 *   - SANS 164-3 keeps the small 5 A round-pin (type D) outlet alive for
 *     lamps and small appliances.
 *
 * So the useful question in South Africa is not just "adapter or not" but
 * "which of the sockets in this building will actually take my plug". This
 * module answers that, then applies the usual voltage and frequency checks.
 *
 * A plug adapter changes shape only. A converter or transformer changes volts.
 */

/** Nominal single-phase mains voltage in South Africa. */
export const MAINS_VOLTAGE_V = 230;

/** Nominal mains frequency in South Africa. */
export const MAINS_FREQUENCY_HZ = 50;

/**
 * Working planning margin. Distribution supply is never exactly nominal, and a
 * swing of several percent either way is ordinary, so this module treats
 * +/-10% as the band an appliance should tolerate rather than a legal limit.
 */
export const PLANNING_TOLERANCE_FRACTION = 0.1;
export const SUPPLY_MIN_V = MAINS_VOLTAGE_V * (1 - PLANNING_TOLERANCE_FRACTION); // 207 V
export const SUPPLY_MAX_V = MAINS_VOLTAGE_V * (1 + PLANNING_TOLERANCE_FRACTION); // 253 V

/** The old and new South African general-purpose socket ratings. */
export const TYPE_M_SOCKET_A = 15;
export const TYPE_N_SOCKET_A = 16;

/** Above this a single-voltage appliance needs a transformer too heavy to be worth carrying. */
export const HIGH_DRAW_HINT_W = 1000;

/**
 * Sockets found in South Africa and the plug codes each one physically accepts.
 * `accepts` lists PLUG_TYPES codes that enter the socket without an adapter.
 */
export const SOCKET_TYPES = [
  {
    code: "M",
    label: "SANS 164-1 15 A socket (type M)",
    ratedCurrentA: TYPE_M_SOCKET_A,
    accepts: ["M"],
    detail:
      "The large three-round-pin outlet in most existing homes and older hotels. Nothing but a type M plug fits it.",
  },
  {
    code: "N",
    label: "SANS 164-2 16 A socket (type N)",
    ratedCurrentA: TYPE_N_SOCKET_A,
    accepts: ["N", "C"],
    detail:
      "The slimmer IEC 60906-1 pattern required at every new outlet point since the 2018 wiring code. It also takes a two-pin Europlug.",
  },
  {
    code: "D",
    label: "SANS 164-3 5 A round-pin socket (type D)",
    ratedCurrentA: 5,
    accepts: ["D"],
    detail: "Small round-pin outlet kept for lamps and light appliances, often on a switched lighting circuit.",
  },
  {
    code: "G",
    label: "BS 1363 13 A socket (type G)",
    ratedCurrentA: 13,
    accepts: ["G"],
    detail:
      "Not a South African standard, but fitted in some newer developments and guesthouses alongside the SANS outlets.",
  },
];

/**
 * Plug types and how they fare in South Africa.
 * fit: "native" (a South African standard plug) | "fits" (enters a socket that
 * is genuinely common) | "sometimes" (only where a non-standard outlet exists)
 * | "no".
 */
export const PLUG_TYPES = [
  { code: "M", name: "Type M - three very large round pins", where: "South Africa, Namibia, Botswana, Eswatini, Lesotho", fit: "native" },
  { code: "N", name: "Type N - SANS 164-2 / IEC 60906-1", where: "South Africa (new installs), Brazil", fit: "native" },
  { code: "C", name: "Type C - Europlug, two 4 mm round pins", where: "Most of Europe, unearthed devices", fit: "fits" },
  { code: "D", name: "Type D - three round pins, 5 A", where: "India, Nepal, Sri Lanka, SA lighting circuits", fit: "fits" },
  { code: "G", name: "Type G - three rectangular pins, fused", where: "United Kingdom, Ireland, UAE, Singapore", fit: "sometimes" },
  { code: "A", name: "Type A - two flat parallel pins", where: "United States, Canada, Mexico, Japan", fit: "no" },
  { code: "B", name: "Type B - two flat pins plus round earth", where: "United States, Canada, Mexico", fit: "no" },
  { code: "E", name: "Type E - French, socket-mounted earth pin", where: "France, Belgium, Poland, Czechia", fit: "no" },
  { code: "F", name: "Type F - Schuko, side earth clips", where: "Germany, Spain, Netherlands, Nordics", fit: "no" },
  { code: "H", name: "Type H - three pins in a shallow V", where: "Israel, Palestine", fit: "no" },
  { code: "I", name: "Type I - flat angled pins", where: "Australia, New Zealand, China, Argentina", fit: "no" },
  { code: "J", name: "Type J - Swiss three-pin", where: "Switzerland, Liechtenstein", fit: "no" },
  { code: "K", name: "Type K - Danish three-pin", where: "Denmark, Greenland", fit: "no" },
  { code: "L", name: "Type L - Italian three in-line pins", where: "Italy, Chile", fit: "no" },
];

const MAX_REASONABLE_WATTS = 20000;
const MAX_REASONABLE_VOLTS = 1000;

export function findPlugType(code) {
  return PLUG_TYPES.find((p) => p.code === code) || null;
}

/** Sockets that physically accept this plug, largest rating first. */
export function socketsForPlug(plugCode) {
  return SOCKET_TYPES.filter((socket) => socket.accepts.includes(plugCode)).sort(
    (a, b) => b.ratedCurrentA - a.ratedCurrentA,
  );
}

/** Current drawn from a 230 V South African socket at unity power factor. */
export function currentAtSouthAfricanMains(watts) {
  return watts / MAINS_VOLTAGE_V;
}

/**
 * @returns {{error:string}|object}
 */
export function assessSouthAfricanPower({
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

  const fittingSockets = socketsForPlug(plug.code);
  const adapterNeeded = fittingSockets.length === 0;
  const conditionalFit = plug.fit === "sometimes";
  const adapterNote =
    plug.fit === "native"
      ? "Your plug is a South African standard plug — nothing to buy."
      : plug.fit === "fits"
        ? "This plug enters a socket that is genuinely common in South Africa, so an adapter is not strictly needed — but the old type M outlet will not take it."
        : plug.fit === "sometimes"
          ? "This is not a South African standard, though some newer buildings fit it. Carry a type M plus type N adapter rather than relying on it."
          : "This plug will not enter any South African socket. Carry an adapter that offers both the large type M pins and the type N pattern.";

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
    ? "South Africa runs 50 Hz, which your label accepts."
    : "Your label says 60 Hz only. A synchronous motor or a mains-timed clock runs about 17% slow on 50 Hz; a switch-mode charger normally does not care.";

  const currentA = currentAtSouthAfricanMains(deviceWatts);
  const bestSocketA = fittingSockets.length > 0 ? fittingSockets[0].ratedCurrentA : 0;
  const fitsBestSocket = fittingSockets.length > 0 && currentA <= bestSocketA;
  const fitsTypeM = currentA <= TYPE_M_SOCKET_A;
  const fitsTypeN = currentA <= TYPE_N_SOCKET_A;

  const actions = [];
  if (adapterNeeded) {
    actions.push("Pack a travel adapter that covers both the large type M pins and the newer type N pattern.");
  }
  if (conditionalFit) actions.push("Do not count on finding a type G socket; treat it as a bonus, not a plan.");
  if (!adapterNeeded && !fittingSockets.some((socket) => socket.code === "M")) {
    actions.push(
      "Older buildings only have the big type M outlet, which your plug will not enter — carry a type M adapter as a fallback.",
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
  if (fittingSockets.length > 0 && !fitsBestSocket) {
    actions.push(
      `At ${currentA.toFixed(2)} A this exceeds the ${bestSocketA} A rating of the largest socket your plug fits.`,
    );
  }
  if (!fitsTypeM && !fitsTypeN) {
    actions.push("Beyond both the 15 A type M and the 16 A type N outlet — this needs a dedicated circuit.");
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
  else if (plug.fit === "fits" || plug.fit === "sometimes") verdict = "Fits some sockets";
  else verdict = "Plug straight in";

  return {
    plug,
    fittingSockets,
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
    bestSocketA,
    fitsBestSocket,
    fitsTypeM,
    fitsTypeN,
    maxWattsOnTypeM: TYPE_M_SOCKET_A * MAINS_VOLTAGE_V,
    maxWattsOnTypeN: TYPE_N_SOCKET_A * MAINS_VOLTAGE_V,
    verdict,
    actions,
  };
}
