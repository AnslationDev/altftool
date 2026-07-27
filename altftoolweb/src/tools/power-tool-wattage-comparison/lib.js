/**
 * Power tool load, and whether a generator, inverter or battery can run it.
 *
 * The number on the tool is its running power. What decides whether a supply
 * copes is the starting surge, and how big that surge is depends entirely on
 * the kind of motor inside:
 *
 *   Universal (brushed) motors — drills, grinders, circular saws, routers,
 *   vacuums. They start under load with a modest inrush, roughly 2x running,
 *   and run at a power factor close to 1.
 *
 *   Induction motors — table saws, bench grinders, compressors, pumps. Locked
 *   rotor current is typically 5 to 6 times full load current, so the surge is
 *   about 5x running power, and the power factor is around 0.8, meaning the
 *   supply has to deliver more VA than the watts suggest.
 *
 *   Resistive loads — heat guns, halogen lamps, soldering irons. No surge and
 *   a power factor of 1.
 *
 * Sizing therefore uses two separate tests:
 *   running test  total running watts must be within the supply's continuous rating
 *   surge test    (total running watts, minus the largest tool, plus that
 *                 tool's starting surge) must be within the surge rating,
 *                 because you start the biggest machine last
 *
 * Generators lose output with altitude and heat. The standard derating used
 * here is 3% per 300 m of elevation and 1% per 5.6 degrees C above 25 C.
 *
 * Battery runtime for an inverter is
 *   hours = (amp-hours x battery volts x usable depth of discharge x inverter
 *            efficiency) / load watts
 * with usable depth of discharge set by chemistry: 50% for lead-acid, 80% for
 * lithium iron phosphate.
 *
 * Wattages listed are typical figures for common tool sizes. Use the rating
 * plate on your own tool where it differs.
 */

/** Motor types, with their surge multiple and power factor. */
export const MOTOR_TYPES = {
  universal: {
    label: "Universal (brushed)",
    surgeFactor: 2,
    powerFactor: 0.95,
    note: "Series-wound brush motor. Starts against load with a short inrush of roughly twice running current.",
  },
  induction: {
    label: "Induction",
    surgeFactor: 5,
    powerFactor: 0.8,
    note: "Locked rotor current runs 5 to 6 times full load current, so the surge is what sizes the generator.",
  },
  "capacitor-start": {
    label: "Capacitor-start induction",
    surgeFactor: 3.5,
    powerFactor: 0.85,
    note: "The start capacitor cuts the inrush compared with a plain induction motor, but it is still several times running.",
  },
  electronic: {
    label: "Electronically commutated / inverter drive",
    surgeFactor: 1.5,
    powerFactor: 0.95,
    note: "Soft-started by its own electronics, so the surge is small — but the drive can be fussy about a dirty generator waveform.",
  },
  resistive: {
    label: "Resistive heating or lighting",
    surgeFactor: 1,
    powerFactor: 1,
    note: "No motor, no surge. What it draws at the first instant is what it draws for ever.",
  },
};

/** Typical running watts for common tools. */
export const TOOL_LIBRARY = [
  { id: "drill-corded", label: "Corded drill, 13 mm", watts: 700, motor: "universal" },
  { id: "impact-driver", label: "Impact driver (corded)", watts: 400, motor: "universal" },
  { id: "sds", label: "SDS rotary hammer", watts: 800, motor: "universal" },
  { id: "demolition", label: "Demolition hammer", watts: 1500, motor: "universal" },
  { id: "grinder-115", label: "Angle grinder, 115 mm", watts: 900, motor: "universal" },
  { id: "grinder-230", label: "Angle grinder, 230 mm", watts: 2200, motor: "universal" },
  { id: "circular-saw", label: "Circular saw, 185 mm", watts: 1400, motor: "universal" },
  { id: "mitre-saw", label: "Mitre saw, 254 mm", watts: 1800, motor: "universal" },
  { id: "jigsaw", label: "Jigsaw", watts: 600, motor: "universal" },
  { id: "router", label: "Router, 12 mm collet", watts: 1800, motor: "universal" },
  { id: "planer", label: "Hand planer", watts: 900, motor: "universal" },
  { id: "orbital-sander", label: "Random orbit sander", watts: 300, motor: "universal" },
  { id: "belt-sander", label: "Belt sander", watts: 900, motor: "universal" },
  { id: "vacuum", label: "Wet and dry vacuum", watts: 1200, motor: "universal" },
  { id: "table-saw", label: "Table saw, 254 mm", watts: 1800, motor: "induction" },
  { id: "bandsaw", label: "Bandsaw", watts: 750, motor: "induction" },
  { id: "pillar-drill", label: "Pillar drill", watts: 550, motor: "induction" },
  { id: "bench-grinder", label: "Bench grinder", watts: 400, motor: "induction" },
  { id: "planer-thicknesser", label: "Planer thicknesser", watts: 1500, motor: "induction" },
  { id: "dust-extractor", label: "Dust extractor", watts: 1100, motor: "induction" },
  { id: "compressor", label: "Air compressor, 2 HP", watts: 1500, motor: "capacitor-start" },
  { id: "pressure-washer", label: "Pressure washer", watts: 1800, motor: "capacitor-start" },
  { id: "pump", label: "Submersible pump, 0.5 HP", watts: 400, motor: "capacitor-start" },
  { id: "tile-cutter", label: "Wet tile cutter", watts: 800, motor: "induction" },
  { id: "mixer", label: "Cement or paddle mixer", watts: 1400, motor: "universal" },
  { id: "welder", label: "Inverter welder, 160 A", watts: 4000, motor: "electronic" },
  { id: "heat-gun", label: "Heat gun", watts: 2000, motor: "resistive" },
  { id: "halogen-light", label: "Halogen work light", watts: 500, motor: "resistive" },
  { id: "led-light", label: "LED work light", watts: 50, motor: "resistive" },
  { id: "soldering", label: "Soldering iron", watts: 60, motor: "resistive" },
  { id: "charger", label: "Battery charger (cordless tool)", watts: 100, motor: "electronic" },
];

/** Generator derating: 3% per 300 m of altitude. */
export const ALTITUDE_DERATE_PER_M = 0.03 / 300;

/** Generator derating: 1% per 5.6 C above 25 C. */
export const TEMP_DERATE_PER_C = 0.01 / 5.6;
export const DERATE_REFERENCE_TEMP_C = 25;

/** Usable depth of discharge by battery chemistry. */
export const BATTERY_CHEMISTRY = {
  lead: { label: "Lead-acid / AGM", depthOfDischarge: 0.5 },
  lifepo4: { label: "Lithium iron phosphate", depthOfDischarge: 0.8 },
};

/** Typical inverter conversion efficiency. */
export const DEFAULT_INVERTER_EFFICIENCY = 0.88;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const MAX_WATTS = 100000;

/** Derating factor for a generator at altitude and temperature. */
export function generatorDerateFactor({ altitudeM = 0, ambientC = DERATE_REFERENCE_TEMP_C } = {}) {
  if (!isNum(altitudeM) || !isNum(ambientC)) return null;
  if (altitudeM < 0) return null;
  const altitudeLoss = altitudeM * ALTITUDE_DERATE_PER_M;
  const tempLoss = Math.max(0, ambientC - DERATE_REFERENCE_TEMP_C) * TEMP_DERATE_PER_C;
  return Math.max(0.5, 1 - altitudeLoss - tempLoss);
}

/**
 * Work out the load and test it against a supply.
 *
 * @param {object} input
 * @param {Array<{id: string, quantity: number}>} input.selection Tools in use at once.
 * @param {number} [input.voltage]        Mains voltage, 230 or 120.
 * @param {"generator"|"inverter"} [input.supplyType]
 * @param {number} [input.supplyRunningW] Continuous rating of the supply.
 * @param {number} [input.supplySurgeW]   Surge or peak rating of the supply.
 * @param {number} [input.altitudeM]      Generator only.
 * @param {number} [input.ambientC]       Generator only.
 * @param {number} [input.batteryAh]      Inverter only.
 * @param {number} [input.batteryV]       Inverter only.
 * @param {string} [input.chemistry]      Inverter only.
 * @param {number} [input.inverterEfficiency]
 */
export function comparePowerTools({
  selection = [],
  voltage = 230,
  supplyType = "generator",
  supplyRunningW = 3000,
  supplySurgeW = 3500,
  altitudeM = 0,
  ambientC = 25,
  batteryAh = 100,
  batteryV = 12,
  chemistry = "lead",
  inverterEfficiency = DEFAULT_INVERTER_EFFICIENCY,
} = {}) {
  if (!Array.isArray(selection)) return { error: "Selection must be a list of tools." };
  if (supplyType !== "generator" && supplyType !== "inverter") {
    return { error: "Choose a generator or an inverter." };
  }
  if (![voltage, supplyRunningW, supplySurgeW].every(isNum)) {
    return { error: "Enter valid numbers for voltage and the supply ratings." };
  }
  if (voltage <= 0 || voltage > 500) {
    return { error: "Supply voltage should be between 1 and 500 V." };
  }
  if (supplyRunningW <= 0 || supplyRunningW > MAX_WATTS) {
    return { error: `Continuous rating should be between 1 and ${MAX_WATTS} W.` };
  }
  if (supplySurgeW < supplyRunningW) {
    return { error: "Surge rating cannot be lower than the continuous rating." };
  }

  const items = [];
  for (const entry of selection) {
    const tool = TOOL_LIBRARY.find((candidate) => candidate.id === entry.id);
    if (!tool) continue;
    const quantity = Math.round(Number(entry.quantity));
    if (!Number.isFinite(quantity) || quantity <= 0) continue;
    if (quantity > 20) return { error: "Twenty of one tool at once is beyond this calculation." };
    const motor = MOTOR_TYPES[tool.motor];
    items.push({
      ...tool,
      quantity,
      motor,
      runningW: tool.watts * quantity,
      va: (tool.watts / motor.powerFactor) * quantity,
      surgeW: tool.watts * motor.surgeFactor,
      ampsEach: tool.watts / motor.powerFactor / voltage,
    });
  }

  if (items.length === 0) {
    return { error: "Add at least one tool to compare." };
  }

  const runningW = items.reduce((sum, item) => sum + item.runningW, 0);
  const runningVA = items.reduce((sum, item) => sum + item.va, 0);
  const combinedPowerFactor = runningVA > 0 ? runningW / runningVA : 1;
  const runningAmps = runningVA / voltage;

  // Start the machine with the biggest surge last: everything else is already
  // running when it kicks.
  let hardest = items[0];
  for (const item of items) {
    if (item.surgeW > hardest.surgeW) hardest = item;
  }
  const peakW = runningW - hardest.watts + hardest.surgeW;
  const peakAmps = peakW / hardest.motor.powerFactor / voltage;

  const derate =
    supplyType === "generator" ? generatorDerateFactor({ altitudeM, ambientC }) : 1;
  if (derate === null) {
    return { error: "Altitude must be zero or more and temperature a valid number." };
  }
  const availableRunningW = supplyRunningW * derate;
  const availableSurgeW = supplySurgeW * derate;

  const runningOk = runningW <= availableRunningW;
  const surgeOk = peakW <= availableSurgeW;
  const headroomPct = availableRunningW > 0 ? ((availableRunningW - runningW) / availableRunningW) * 100 : 0;
  const recommendedSupplyW = peakW / derate;

  let runtimeHours = null;
  let usableWh = null;
  if (supplyType === "inverter") {
    const battery = BATTERY_CHEMISTRY[chemistry];
    if (!battery) return { error: "Choose a battery chemistry." };
    if (![batteryAh, batteryV, inverterEfficiency].every(isNum)) {
      return { error: "Enter valid numbers for the battery bank and inverter efficiency." };
    }
    if (batteryAh <= 0 || batteryV <= 0) {
      return { error: "Battery capacity and voltage must be greater than zero." };
    }
    if (inverterEfficiency <= 0 || inverterEfficiency > 1) {
      return { error: "Inverter efficiency should be between 0 and 1." };
    }
    usableWh = batteryAh * batteryV * battery.depthOfDischarge * inverterEfficiency;
    runtimeHours = runningW > 0 ? usableWh / runningW : null;
  }

  let verdict;
  if (!runningOk) {
    verdict = `${Math.round(runningW)} W of running load against ${Math.round(availableRunningW)} W available. The supply will overload as soon as everything is switched on, before any starting surge.`;
  } else if (!surgeOk) {
    verdict = `Running load fits, but starting the ${hardest.label.toLowerCase()} needs ${Math.round(peakW)} W and the supply peaks at ${Math.round(availableSurgeW)} W. Start it first, on its own, or fit a supply of at least ${Math.round(recommendedSupplyW)} W.`;
  } else {
    verdict = `Both tests pass: ${Math.round(runningW)} W running against ${Math.round(availableRunningW)} W, and a ${Math.round(peakW)} W start against ${Math.round(availableSurgeW)} W of surge. ${Math.round(headroomPct)}% headroom on the continuous rating.`;
  }

  return {
    items: items.sort((a, b) => b.runningW - a.runningW),
    voltage,
    supplyType,
    runningW,
    runningVA,
    combinedPowerFactor,
    runningAmps,
    hardest,
    peakW,
    peakAmps,
    derate,
    availableRunningW,
    availableSurgeW,
    runningOk,
    surgeOk,
    passes: runningOk && surgeOk,
    headroomPct,
    recommendedSupplyW,
    usableWh,
    runtimeHours,
    verdict,
  };
}
