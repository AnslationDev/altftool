/**
 * Plug and voltage rules for mainland China.
 *
 * Mainland China supplies single-phase mains at 220 V, 50 Hz. The IEC lists
 * three plug types in use: type A (two flat parallel pins, unearthed), type C
 * (the two-pin round Europlug) and type I — the flat angled-pin earthed plug
 * standardised in the GB 2099 / GB 1002 series. The everyday wall outlet is a
 * combination faceplate: two flat slots for the type A pattern above or beside
 * the three angled slots for type I.
 *
 * Two things catch travellers out:
 *   1. The Chinese type I plug shares its shape with the Australian and
 *      Argentine plugs, but the three national standards do not agree on which
 *      pin carries line. A plug from one of those countries goes in, yet its
 *      polarity should be treated as unverified.
 *   2. Hong Kong and Macau are separate electrical jurisdictions. Hong Kong
 *      uses the British type G socket; Macau mixes type G with older
 *      continental and British colonial fittings. A mainland adapter is not
 *      enough for a trip that includes them.
 *
 * The decision made here is the usual travel one:
 *   1. Does the plug enter a Chinese socket, or is an adapter needed?
 *   2. Does the appliance accept 220 V, or is a voltage converter needed?
 *   3. Does the appliance accept 50 Hz?
 *   4. Does the current stay inside the 10 A socket rating?
 *
 * A plug adapter changes shape only. A converter or transformer changes volts.
 */

/** Nominal single-phase mains voltage in mainland China. */
export const MAINS_VOLTAGE_V = 220;

/** Nominal mains frequency in mainland China. */
export const MAINS_FREQUENCY_HZ = 50;

/**
 * Working planning margin. Distribution supply is never exactly nominal, and a
 * swing of several percent either way is ordinary, so this module treats
 * +/-10% as the band an appliance should tolerate rather than a legal limit.
 */
export const PLANNING_TOLERANCE_FRACTION = 0.1;
export const SUPPLY_MIN_V = MAINS_VOLTAGE_V * (1 - PLANNING_TOLERANCE_FRACTION); // 198 V
export const SUPPLY_MAX_V = MAINS_VOLTAGE_V * (1 + PLANNING_TOLERANCE_FRACTION); // 242 V

/** Rating of the ordinary Chinese wall socket. */
export const STANDARD_SOCKET_A = 10;

/** Rating of the heavy-appliance socket fitted for air conditioners and water heaters. */
export const HEAVY_SOCKET_A = 16;

/** Above this a single-voltage appliance needs a transformer too heavy to be worth carrying. */
export const HIGH_DRAW_HINT_W = 1000;

/**
 * How far outside its printed range an appliance is still treated as "runs,
 * but off its design point" rather than "needs a transformer". Set to the same
 * +/-10% planning band above, because a European 230 V appliance on China's
 * 220 V supply is inside the normal distribution swing of both countries.
 */
export const MARGINAL_FRACTION = PLANNING_TOLERANCE_FRACTION;

/**
 * Power a purely resistive appliance actually delivers when it is run off a
 * voltage other than the one it was rated for. Resistance is fixed, so
 * P = V^2 / R and the delivered power scales with the square of the voltage
 * ratio. Kettles, irons, heaters and filament lamps follow this closely;
 * switch-mode chargers and inverter appliances do not.
 * @returns {number|null} null for invalid input rather than NaN or Infinity.
 */
export function resistivePowerAtVoltage(ratedWatts, ratedVoltageV, actualVoltageV = MAINS_VOLTAGE_V) {
  if (![ratedWatts, ratedVoltageV, actualVoltageV].every((v) => Number.isFinite(v))) return null;
  if (ratedWatts <= 0 || ratedVoltageV <= 0 || actualVoltageV <= 0) return null;
  return ratedWatts * (actualVoltageV / ratedVoltageV) ** 2;
}

/** Sockets found in mainland China and the plug codes each one physically accepts. */
export const SOCKET_TYPES = [
  {
    code: "AI10",
    label: "Combination type A + type I 10 A socket",
    ratedCurrentA: STANDARD_SOCKET_A,
    accepts: ["A", "I-CN", "I-AU", "I-AR"],
    detail:
      "The standard Chinese wall outlet: two flat parallel slots for unearthed plugs plus three angled slots for the earthed GB type I plug.",
  },
  {
    code: "I16",
    label: "Type I 16 A socket",
    ratedCurrentA: HEAVY_SOCKET_A,
    accepts: ["I-CN"],
    detail:
      "Larger three-pin outlet with wider pin spacing, fitted for air conditioners, water heaters and induction hobs.",
  },
  {
    code: "C",
    label: "Type C two-pin round outlet",
    ratedCurrentA: STANDARD_SOCKET_A,
    accepts: ["C"],
    detail: "Round-pin Europlug outlet, listed by the IEC for China and common on power strips and imported fittings.",
  },
];

/**
 * Plug types and whether they enter a Chinese socket unaided.
 * fit: "native" | "fits" | "polarity" | "no"
 */
export const PLUG_TYPES = [
  { code: "I-CN", name: "Type I - Chinese GB 2099 / GB 1002", where: "Mainland China", fit: "native" },
  { code: "A", name: "Type A - two flat parallel pins", where: "China, United States, Canada, Japan", fit: "native" },
  { code: "C", name: "Type C - Europlug, two 4 mm round pins", where: "Most of Europe, unearthed devices", fit: "fits" },
  { code: "I-AU", name: "Type I - Australian / New Zealand AS/NZS 3112", where: "Australia, New Zealand", fit: "polarity" },
  { code: "I-AR", name: "Type I - Argentine IRAM 2073", where: "Argentina, Uruguay", fit: "polarity" },
  { code: "B", name: "Type B - two flat pins plus round earth", where: "United States, Canada, Mexico", fit: "no" },
  { code: "D", name: "Type D - three large round pins", where: "India, Nepal, Sri Lanka", fit: "no" },
  { code: "E", name: "Type E - French, socket-mounted earth pin", where: "France, Belgium, Poland, Czechia", fit: "no" },
  { code: "F", name: "Type F - Schuko, side earth clips", where: "Germany, Spain, Netherlands, Nordics", fit: "no" },
  { code: "G", name: "Type G - three rectangular pins, fused", where: "United Kingdom, Hong Kong, Singapore, UAE", fit: "no" },
  { code: "H", name: "Type H - three pins in a shallow V", where: "Israel, Palestine", fit: "no" },
  { code: "J", name: "Type J - Swiss three-pin", where: "Switzerland, Liechtenstein", fit: "no" },
  { code: "K", name: "Type K - Danish three-pin", where: "Denmark, Greenland", fit: "no" },
  { code: "L", name: "Type L - Italian three in-line pins", where: "Italy, Chile", fit: "no" },
  { code: "M", name: "Type M - three very large round pins", where: "South Africa, Namibia, Botswana", fit: "no" },
  { code: "N", name: "Type N - Brazilian / IEC 60906-1 pattern", where: "Brazil, South Africa (new installs)", fit: "no" },
];

/**
 * The three jurisdictions a "China trip" can cover. Hong Kong and Macau keep
 * their own electrical rules, which is why one adapter is often not enough.
 */
export const REGIONS = [
  {
    code: "mainland",
    label: "Mainland China",
    voltageV: 220,
    frequencyHz: 50,
    plugs: "A, C, I",
    note: "Combination type A + type I wall sockets; 10 A general outlets and 16 A outlets for large appliances.",
  },
  {
    code: "hongkong",
    label: "Hong Kong SAR",
    voltageV: 220,
    frequencyHz: 50,
    plugs: "G",
    note: "British BS 1363 sockets with fused plugs. A mainland type I adapter is useless here.",
  },
  {
    code: "macau",
    label: "Macau SAR",
    voltageV: 220,
    frequencyHz: 50,
    plugs: "G, D, F, M",
    note: "Mostly British type G, with older round-pin fittings still in service in some buildings.",
  },
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

/** Current drawn from a 220 V Chinese socket at unity power factor. */
export function currentAtChineseMains(watts) {
  return watts / MAINS_VOLTAGE_V;
}

/**
 * @returns {{error:string}|object}
 */
export function assessChinesePower({
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
  const polarityUnverified = plug.fit === "polarity";
  const adapterNote =
    plug.fit === "native"
      ? "Your plug is one of the Chinese standard shapes — nothing to buy."
      : plug.fit === "fits"
        ? "A Europlug enters the round-pin outlets the IEC lists for China and most Chinese power strips, so an adapter is usually unnecessary."
        : plug.fit === "polarity"
          ? "The pins are the same shape, so it goes in — but that national variant of type I does not agree with the Chinese standard on which pin carries line, so treat the polarity as unknown."
          : "This plug will not enter a Chinese socket. Carry a type I (GB 2099) adapter.";

  const voltageOk = deviceMinVoltageV <= MAINS_VOLTAGE_V && deviceMaxVoltageV >= MAINS_VOLTAGE_V;
  // Just below the printed minimum: a 230 V European appliance on China's 220 V
  // supply. It runs, but a resistive one delivers less power.
  const marginalLow =
    !voltageOk &&
    MAINS_VOLTAGE_V < deviceMinVoltageV &&
    MAINS_VOLTAGE_V >= deviceMinVoltageV * (1 - MARGINAL_FRACTION);
  // Just above the printed maximum: it runs, but with no headroom left.
  const marginalHigh =
    !voltageOk &&
    MAINS_VOLTAGE_V > deviceMaxVoltageV &&
    MAINS_VOLTAGE_V <= deviceMaxVoltageV * (1 + MARGINAL_FRACTION);
  const converterNeeded = !voltageOk && !marginalLow && !marginalHigh;
  const converterDirection = converterNeeded
    ? deviceMaxVoltageV < MAINS_VOLTAGE_V
      ? "step-down"
      : "step-up"
    : null;
  const toleranceRisk = voltageOk && deviceMaxVoltageV < SUPPLY_MAX_V;
  const resistivePowerHereW = marginalLow
    ? resistivePowerAtVoltage(deviceWatts, deviceMinVoltageV, MAINS_VOLTAGE_V)
    : null;

  const freq = String(deviceFrequency);
  const frequencyOk = freq === "both" || freq === "50";
  const frequencyNote = frequencyOk
    ? "China runs 50 Hz, which your label accepts."
    : "Your label says 60 Hz only. A synchronous motor or a mains-timed clock runs about 17% slow on 50 Hz; a switch-mode charger normally does not care.";

  const currentA = currentAtChineseMains(deviceWatts);
  const fitsStandardSocket = currentA <= STANDARD_SOCKET_A;
  const fitsHeavySocket = currentA <= HEAVY_SOCKET_A;

  const actions = [];
  if (adapterNeeded) actions.push("Pack a type I (GB 2099) travel adapter for mainland China.");
  if (polarityUnverified) {
    actions.push(
      "Same pin shape, unverified polarity: fine for a double-insulated charger, but anything with a single-pole switch or an exposed element is safer on a locally bought lead.",
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
  if (marginalLow && resistivePowerHereW !== null) {
    actions.push(
      `China's ${MAINS_VOLTAGE_V} V is just under the ${deviceMinVoltageV} V your label starts at. No transformer needed, but a purely resistive appliance such as a kettle or iron will deliver about ${Math.round(resistivePowerHereW)} W instead of ${Math.round(deviceWatts)} W, because power falls with the square of the voltage.`,
    );
  }
  if (marginalHigh) {
    actions.push(
      `China's ${MAINS_VOLTAGE_V} V is just above the ${deviceMaxVoltageV} V your label stops at. It will run, but with no headroom — watch for the appliance running hot.`,
    );
  }
  if (!frequencyOk) actions.push("Expect anything clock- or motor-driven to run slow on 50 Hz.");
  if (!fitsStandardSocket && fitsHeavySocket) {
    actions.push(`Over ${STANDARD_SOCKET_A} A — use a ${HEAVY_SOCKET_A} A outlet, not the ordinary wall socket.`);
  }
  if (!fitsHeavySocket) actions.push(`Over ${HEAVY_SOCKET_A} A — beyond any ordinary Chinese socket.`);
  if (toleranceRisk) {
    actions.push(
      `Plan for the supply drifting to about ${Math.round(SUPPLY_MAX_V)} V; your label stops at ${deviceMaxVoltageV} V, which leaves little margin.`,
    );
  }
  actions.push("Hong Kong and Macau use the British type G socket — pack that adapter too if the trip includes them.");

  let verdict;
  if (converterNeeded) verdict = "Converter required";
  else if (adapterNeeded) verdict = "Adapter only";
  else if (marginalLow || marginalHigh) verdict = "Runs, off its design voltage";
  else if (polarityUnverified) verdict = "Fits, check polarity";
  else verdict = "Plug straight in";

  return {
    plug,
    fittingSockets,
    adapterNeeded,
    polarityUnverified,
    adapterNote,
    voltageOk,
    marginalLow,
    marginalHigh,
    resistivePowerHereW,
    converterNeeded,
    converterDirection,
    toleranceRisk,
    frequencyOk,
    frequencyNote,
    currentA,
    fitsStandardSocket,
    fitsHeavySocket,
    maxWattsOnStandardSocket: STANDARD_SOCKET_A * MAINS_VOLTAGE_V,
    maxWattsOnHeavySocket: HEAVY_SOCKET_A * MAINS_VOLTAGE_V,
    verdict,
    actions,
  };
}
