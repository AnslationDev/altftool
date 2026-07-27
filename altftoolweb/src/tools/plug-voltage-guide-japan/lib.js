/**
 * Plugs, voltage and frequency in Japan, and what a visitor's device actually needs.
 *
 * Japan is the awkward destination for travel electronics, for three separate reasons:
 *
 * 1. VOLTAGE. Mains is 100 V — the lowest national supply voltage in the world. A dual-voltage
 *    charger marked "100-240V" is fine, but a 230 V-only appliance will barely function, and a
 *    120 V US appliance will run noticeably weaker.
 *
 * 2. FREQUENCY. Japan is the only country with a permanent split grid: 50 Hz in the east
 *    (Tokyo, Yokohama, Sendai, Sapporo) and 60 Hz in the west (Osaka, Kyoto, Nagoya, Hiroshima,
 *    Fukuoka). The boundary runs roughly along the Fuji River in Shizuoka and the Itoigawa in
 *    Niigata. It dates from the 1890s, when Tokyo bought 50 Hz generators from AEG in Germany
 *    and Osaka bought 60 Hz machines from General Electric in the United States, and it has
 *    never been unified.
 *
 * 3. PLUGS. Sockets are Type A (two flat parallel blades) and, less often, Type B (Type A plus a
 *    round earth pin). Many Japanese Type A sockets are unpolarised — both slots the same width —
 *    so a North American polarised plug with one wider neutral blade will not physically fit.
 *
 * The power maths is the standard resistive-load relation. For a heating element the resistance
 * is fixed, so
 *
 *     P = V^2 / R      and therefore     P_actual = P_rated x (V_actual / V_rated)^2
 *
 * A 120 V, 1800 W hair dryer on Japan's 100 V delivers 1800 x (100/120)^2 = 1250 W. This does
 * NOT apply to switch-mode electronics, which regulate their output and draw whatever current
 * they need across their whole rated range.
 */

/** Japanese mains voltage, the lowest in the world. */
export const JAPAN_VOLTAGE = 100;
/** Eastern Japan runs at 50 Hz, western Japan at 60 Hz. */
export const JAPAN_HZ_EAST = 50;
export const JAPAN_HZ_WEST = 60;
/** Japanese sockets accept these plug types. */
export const JAPAN_PLUG_TYPES = ["A", "B"];
/** Typical Japanese residential circuit rating, which sets the practical wattage ceiling. */
export const JAPAN_OUTLET_AMPS = 15;
export const JAPAN_OUTLET_WATTS = JAPAN_VOLTAGE * JAPAN_OUTLET_AMPS;

/** Cities grouped by the grid that serves them. */
export const JAPAN_REGIONS = [
  {
    id: "east",
    label: "Eastern Japan — 50 Hz",
    hz: JAPAN_HZ_EAST,
    utilities: "TEPCO, Tohoku Electric, Hokkaido Electric",
    cities: [
      "Tokyo",
      "Yokohama",
      "Chiba",
      "Saitama",
      "Kamakura",
      "Hakone",
      "Kawaguchiko (Mt Fuji)",
      "Karuizawa",
      "Nikko",
      "Sendai",
      "Sapporo",
      "Hakodate",
    ],
  },
  {
    id: "west",
    label: "Western Japan — 60 Hz",
    hz: JAPAN_HZ_WEST,
    utilities: "Kansai Electric, Chubu Electric, Chugoku Electric, Kyushu Electric, Okinawa Electric",
    cities: [
      "Osaka",
      "Kyoto",
      "Kobe",
      "Nara",
      "Himeji",
      "Nagoya",
      "Takayama",
      "Kanazawa",
      "Hiroshima",
      "Matsuyama",
      "Fukuoka",
      "Nagasaki",
      "Kumamoto",
      "Kagoshima",
      "Naha (Okinawa)",
    ],
  },
];

/**
 * Home countries with their mains supply and domestic plug types, following the IEC plug-type
 * lettering. Voltages are the declared nominal supply, not the tolerance band.
 */
export const HOME_COUNTRIES = [
  { id: "in", label: "India", voltage: 230, hz: 50, plugs: ["C", "D", "M"] },
  { id: "gb", label: "United Kingdom", voltage: 230, hz: 50, plugs: ["G"] },
  { id: "ie", label: "Ireland", voltage: 230, hz: 50, plugs: ["G"] },
  { id: "us", label: "United States", voltage: 120, hz: 60, plugs: ["A", "B"] },
  { id: "ca", label: "Canada", voltage: 120, hz: 60, plugs: ["A", "B"] },
  { id: "mx", label: "Mexico", voltage: 127, hz: 60, plugs: ["A", "B"] },
  { id: "de", label: "Germany", voltage: 230, hz: 50, plugs: ["C", "F"] },
  { id: "fr", label: "France", voltage: 230, hz: 50, plugs: ["C", "E"] },
  { id: "es", label: "Spain", voltage: 230, hz: 50, plugs: ["C", "F"] },
  { id: "it", label: "Italy", voltage: 230, hz: 50, plugs: ["C", "F", "L"] },
  { id: "ch", label: "Switzerland", voltage: 230, hz: 50, plugs: ["C", "J"] },
  { id: "dk", label: "Denmark", voltage: 230, hz: 50, plugs: ["C", "E", "F", "K"] },
  { id: "au", label: "Australia", voltage: 230, hz: 50, plugs: ["I"] },
  { id: "nz", label: "New Zealand", voltage: 230, hz: 50, plugs: ["I"] },
  { id: "cn", label: "China", voltage: 220, hz: 50, plugs: ["A", "C", "I"] },
  { id: "kr", label: "South Korea", voltage: 220, hz: 60, plugs: ["C", "F"] },
  { id: "tw", label: "Taiwan", voltage: 110, hz: 60, plugs: ["A", "B"] },
  { id: "th", label: "Thailand", voltage: 230, hz: 50, plugs: ["A", "B", "C", "O"] },
  { id: "ph", label: "Philippines", voltage: 220, hz: 60, plugs: ["A", "B", "C"] },
  { id: "sg", label: "Singapore", voltage: 230, hz: 50, plugs: ["G"] },
  { id: "ae", label: "United Arab Emirates", voltage: 230, hz: 50, plugs: ["C", "D", "G"] },
  { id: "za", label: "South Africa", voltage: 230, hz: 50, plugs: ["C", "D", "M", "N"] },
  { id: "br", label: "Brazil", voltage: 127, hz: 60, plugs: ["C", "N"] },
];

/**
 * How a device behaves on a different supply.
 *  - "electronics"  switch-mode power supply: regulated, frequency-agnostic, no derating.
 *  - "heating"      resistive element: power follows V^2, so it simply runs weaker.
 *  - "motor"        synchronous motor or mains-timed clock: speed follows the frequency.
 */
export const DEVICE_KINDS = [
  {
    id: "electronics",
    label: "Charger, laptop or phone (switch-mode supply)",
    frequencySensitive: false,
    voltageSquared: false,
  },
  {
    id: "heating",
    label: "Hair dryer, kettle, iron or straightener (heating element)",
    frequencySensitive: false,
    voltageSquared: true,
  },
  {
    id: "motor",
    label: "Mains-timed clock, turntable or synchronous motor",
    frequencySensitive: true,
    voltageSquared: false,
  },
];

/** Common dual-voltage marking found on chargers and travel appliances. */
export const DUAL_VOLTAGE_MIN = 100;
export const DUAL_VOLTAGE_MAX = 240;

/**
 * IEC 60038 allows a supply to sit within +/-10% of its declared voltage, and equipment is
 * designed to tolerate that band. So Japan's 100 V is inside the tolerance of a 110 V device
 * (100/110 = 0.909) but outside that of a 120 V one (100/120 = 0.833).
 */
export const MAINS_TOLERANCE = 0.1;

/**
 * Common things travellers pack. `dual` means the label reads 100-240V; otherwise the device is
 * single-voltage and rated for whatever the home country supplies. Wattages are typical figures
 * for the class of device, and every one is editable.
 */
export const DEVICE_PRESETS = [
  { id: "phone", label: "Phone or USB charger", kindId: "electronics", dual: true, watts: 30 },
  { id: "laptop", label: "Laptop charger", kindId: "electronics", dual: true, watts: 65 },
  { id: "camera", label: "Camera battery charger", kindId: "electronics", dual: true, watts: 20 },
  { id: "cpap", label: "CPAP machine", kindId: "electronics", dual: true, watts: 60 },
  { id: "travel-dryer", label: "Travel hair dryer (dual voltage)", kindId: "heating", dual: true, watts: 1200 },
  { id: "home-dryer", label: "Hair dryer from home (single voltage)", kindId: "heating", dual: false, watts: 1800 },
  { id: "straightener", label: "Hair straightener from home", kindId: "heating", dual: false, watts: 50 },
  { id: "kettle", label: "Travel kettle from home", kindId: "heating", dual: false, watts: 2000 },
  { id: "iron", label: "Travel iron from home", kindId: "heating", dual: false, watts: 1000 },
  { id: "clock", label: "Mains-timed clock or turntable", kindId: "motor", dual: false, watts: 10 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round = (value, places = 0) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

export function findCountry(id) {
  return HOME_COUNTRIES.find((country) => country.id === id) ?? null;
}

export function findRegion(id) {
  return JAPAN_REGIONS.find((region) => region.id === id) ?? null;
}

export function findKind(id) {
  return DEVICE_KINDS.find((kind) => kind.id === id) ?? null;
}

/**
 * Turn a preset plus the traveller's home supply voltage into the four label figures the
 * compatibility check needs. Pure; returns null for an unknown preset.
 */
export function presetToInputs(presetId, homeVoltage) {
  const preset = DEVICE_PRESETS.find((item) => item.id === presetId);
  if (!preset) return null;
  if (!isNum(homeVoltage) || homeVoltage <= 0) return null;
  return {
    kindId: preset.kindId,
    minVoltage: preset.dual ? DUAL_VOLTAGE_MIN : homeVoltage,
    maxVoltage: preset.dual ? DUAL_VOLTAGE_MAX : homeVoltage,
    ratedVoltage: preset.dual ? DUAL_VOLTAGE_MAX : homeVoltage,
    ratedWatts: preset.watts,
  };
}

/** Which Japanese region serves a city, or null when the city is not in the list. */
export function regionForCity(city) {
  return JAPAN_REGIONS.find((region) => region.cities.includes(city)) ?? null;
}

/**
 * Work out what a traveller needs for one device in Japan.
 *
 * @param {object} input
 * @param {string} input.homeId          HOME_COUNTRIES[].id
 * @param {string} input.regionId        JAPAN_REGIONS[].id
 * @param {string} input.kindId          DEVICE_KINDS[].id
 * @param {number} input.minVoltage      lowest voltage printed on the device label
 * @param {number} input.maxVoltage      highest voltage printed on the device label
 * @param {number} input.ratedVoltage    the voltage the wattage figure is quoted at
 * @param {number} input.ratedWatts      the wattage printed on the device label
 * @returns {{error:string}|object}
 */
export function checkJapanCompatibility({
  homeId,
  regionId,
  kindId,
  minVoltage,
  maxVoltage,
  ratedVoltage,
  ratedWatts,
}) {
  const home = findCountry(homeId);
  if (!home) return { error: "Choose the country your device was bought in." };
  const region = findRegion(regionId);
  if (!region) return { error: "Choose whether you are going to eastern or western Japan." };
  const kind = findKind(kindId);
  if (!kind) return { error: "Choose the kind of device." };

  if (!isNum(minVoltage) || !isNum(maxVoltage) || minVoltage <= 0 || maxVoltage <= 0) {
    return { error: "Enter the voltage range printed on the device label, in volts." };
  }
  if (minVoltage > maxVoltage) {
    return { error: "The lowest voltage on the label cannot be higher than the highest." };
  }
  if (maxVoltage > 1000) {
    return { error: "That voltage is far outside anything a mains appliance is rated for." };
  }
  if (!isNum(ratedVoltage) || ratedVoltage <= 0 || ratedVoltage > 1000) {
    return { error: "Enter the voltage the wattage figure is quoted at, in volts." };
  }
  if (!isNum(ratedWatts) || ratedWatts < 0 || ratedWatts > 20000) {
    return { error: "Enter the device wattage, between 0 and 20,000 W." };
  }

  // --- Plugs -------------------------------------------------------------------
  const homePlugs = home.plugs;
  const directFit = homePlugs.filter((type) => JAPAN_PLUG_TYPES.includes(type));
  const plugFits = directFit.length > 0;
  const adapterNeeded = !plugFits;
  // A three-pin Type B plug only enters a Type B (earthed) socket, and plenty of Japanese
  // buildings only have two-slot sockets.
  const earthPinProblem = homePlugs.includes("B") && !homePlugs.includes("A");
  // North American polarised Type A plugs have one wider blade that unpolarised Japanese
  // sockets will not accept.
  const polarisationProblem = directFit.includes("A") && (home.id === "us" || home.id === "ca");

  // --- Voltage -----------------------------------------------------------------
  const dualVoltage = minVoltage <= JAPAN_VOLTAGE && maxVoltage >= JAPAN_VOLTAGE;
  // Undervoltage is merely weak; overvoltage is what destroys equipment. They are graded apart.
  const lowestTolerated = minVoltage * (1 - MAINS_TOLERANCE);
  const highestTolerated = maxVoltage * (1 + MAINS_TOLERANCE);
  let voltageStatus;
  if (dualVoltage) voltageStatus = "in-range";
  else if (maxVoltage < JAPAN_VOLTAGE) {
    voltageStatus = JAPAN_VOLTAGE <= highestTolerated ? "marginal-high" : "over";
  } else {
    voltageStatus = JAPAN_VOLTAGE >= lowestTolerated ? "marginal-low" : "under";
  }
  const converterNeeded = voltageStatus === "over" || voltageStatus === "under";
  const converterDirection = converterNeeded ? (voltageStatus === "under" ? "step-up" : "step-down") : null;
  /** Overvoltage is the only case that can damage the device or start a fire. */
  const unsafe = voltageStatus === "over" || voltageStatus === "marginal-high";

  // --- Power on 100 V ----------------------------------------------------------
  // Only a fixed-resistance element derates with voltage; regulated electronics do not.
  const voltageRatio = JAPAN_VOLTAGE / ratedVoltage;
  const derates = kind.voltageSquared && voltageStatus !== "in-range";
  const actualWatts = derates ? ratedWatts * voltageRatio * voltageRatio : ratedWatts;
  const powerPct = ratedWatts > 0 ? (actualWatts / ratedWatts) * 100 : 100;
  const timeFactor = actualWatts > 0 ? ratedWatts / actualWatts : null;
  const currentAmps = actualWatts / JAPAN_VOLTAGE;
  const overloadsOutlet = currentAmps > JAPAN_OUTLET_AMPS;

  // --- Frequency ---------------------------------------------------------------
  const frequencyMismatch = kind.frequencySensitive && home.hz !== region.hz;
  const speedRatio = kind.frequencySensitive ? region.hz / home.hz : null;

  // --- Verdict ------------------------------------------------------------------
  const warnings = [];
  const actions = [];

  if (adapterNeeded) {
    actions.push(`Pack a Type A plug adapter — Japanese sockets take Type A (two flat parallel blades), and your ${home.plugs.join("/")} plugs will not fit.`);
  }
  if (earthPinProblem) {
    warnings.push("Your three-pin plug needs an earthed Type B socket, which many Japanese buildings do not have. Carry a three-to-two adapter as well.");
  }
  if (polarisationProblem) {
    warnings.push("North American plugs with one wider (neutral) blade will not enter an older unpolarised Japanese socket. A cheap Type A adapter solves it.");
  }
  if (unsafe) {
    actions.push(`Do not plug this in. It is rated only up to ${round(maxVoltage)} V and Japan supplies ${JAPAN_VOLTAGE} V, so it would be run above its rating. You need a step-down converter, not a plug adapter.`);
  }
  if (voltageStatus === "under") {
    actions.push(`This device needs at least ${round(minVoltage)} V and Japan supplies ${JAPAN_VOLTAGE} V. Running it is not dangerous, but it will be badly underpowered — use a step-up transformer rated above ${round(ratedWatts)} W, or leave it at home.`);
  }
  if (voltageStatus === "marginal-low") {
    warnings.push(`Japan's ${JAPAN_VOLTAGE} V is just inside the +/-10% supply tolerance for a ${round(minVoltage)} V device, so it should run, though not quite at full strength.`);
  }
  if (derates && ratedWatts > 0 && timeFactor !== null) {
    warnings.push(`On ${JAPAN_VOLTAGE} V a fixed heating element delivers ${round(powerPct)}% of its rated power, so it will take about ${round(timeFactor, 2)}x as long to heat up.`);
  }
  if (overloadsOutlet) {
    warnings.push(`At ${round(currentAmps, 1)} A this exceeds the ${JAPAN_OUTLET_AMPS} A a typical Japanese socket supplies and will trip the breaker.`);
  }
  if (frequencyMismatch) {
    warnings.push(`Your device is built for ${home.hz} Hz and this part of Japan runs at ${region.hz} Hz, so a mains-timed motor or clock will run at ${round(speedRatio * 100)}% of its normal speed.`);
  }
  if (
    !adapterNeeded &&
    !converterNeeded &&
    !unsafe &&
    !derates &&
    !frequencyMismatch &&
    !earthPinProblem &&
    !polarisationProblem &&
    voltageStatus === "in-range"
  ) {
    actions.push("Nothing needed — plug it straight in.");
  }

  let verdict;
  if (unsafe) verdict = "unsafe";
  else if (voltageStatus === "under") verdict = "underpowered";
  else if (overloadsOutlet || frequencyMismatch) verdict = "caution";
  else if (derates || voltageStatus === "marginal-low") verdict = "works-weaker";
  else if (adapterNeeded || earthPinProblem || polarisationProblem) verdict = "adapter";
  else verdict = "fine";

  return {
    home,
    region,
    kind,
    japanVoltage: JAPAN_VOLTAGE,
    japanHz: region.hz,
    plugFits,
    adapterNeeded,
    adapterType: adapterNeeded ? "A" : null,
    earthPinProblem,
    polarisationProblem,
    dualVoltage,
    voltageStatus,
    unsafe,
    converterNeeded,
    converterDirection,
    ratedWatts,
    actualWatts: round(actualWatts, 1),
    powerPct: round(powerPct, 1),
    timeFactor: timeFactor === null ? null : round(timeFactor, 2),
    currentAmps: round(currentAmps, 2),
    overloadsOutlet,
    outletWattCeiling: JAPAN_OUTLET_WATTS,
    frequencyMismatch,
    speedRatio: speedRatio === null ? null : round(speedRatio, 3),
    verdict,
    actions,
    warnings,
  };
}
