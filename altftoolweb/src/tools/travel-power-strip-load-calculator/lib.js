/**
 * Travel power strip load calculator.
 *
 * Everything on a power strip shares one wall socket, one flexible cord and
 * one set of contacts, so the limit is a current limit, not a "number of
 * sockets" limit. Two rules do all the work:
 *
 *   1. Current from power:      I = P / V
 *      A 2,000 W load draws 16.7 A at 120 V but only 8.7 A at 230 V, which is
 *      why the same travel kit is safe in Europe and marginal in the US.
 *
 *   2. The continuous-load derating:
 *      Where a load runs for three hours or more, the US National Electrical
 *      Code (210.20(A) and 210.19(A)) requires the protective device and
 *      conductors to be rated at least 125% of that load — which is the same
 *      as saying the continuous load must not exceed 80% of the rating.
 *      European practice does not word it that way, but 80% is the margin
 *      manufacturers and electricians work to, so this module uses it as the
 *      planning limit and reports the full rating separately as the hard
 *      ceiling.
 *
 * The binding limit is whichever is lower: the wall socket's rating or the
 * power strip's own rating. A 16 A strip plugged into a 10 A socket is still
 * a 10 A system.
 *
 * All figures assume unity power factor, which is right for heaters, kettles
 * and modern chargers. Motors and old transformers draw more current than
 * their wattage suggests.
 */

/** Continuous-load planning margin: 80% of the rating (NEC 125% rule, inverted). */
export const CONTINUOUS_LOAD_FRACTION = 0.8;

/** Destination supplies a traveller actually meets, with their usual socket rating. */
export const MAINS_PRESETS = [
  { code: "jp", label: "Japan — 100 V, 50/60 Hz", voltageV: 100, socketRatingA: 15 },
  { code: "us", label: "United States / Canada — 120 V, 60 Hz", voltageV: 120, socketRatingA: 15 },
  { code: "cn", label: "China / Argentina — 220 V, 50 Hz", voltageV: 220, socketRatingA: 10 },
  { code: "eu", label: "Europe (Schuko) — 230 V, 50 Hz", voltageV: 230, socketRatingA: 16 },
  { code: "uk", label: "UK / UAE / Singapore — 230 V, 50 Hz", voltageV: 230, socketRatingA: 13 },
  { code: "au", label: "Australia / New Zealand — 230 V, 50 Hz", voltageV: 230, socketRatingA: 10 },
  { code: "in", label: "India — 230 V, 50 Hz", voltageV: 230, socketRatingA: 6 },
  { code: "za", label: "South Africa — 230 V, 50 Hz", voltageV: 230, socketRatingA: 15 },
];

/** Ratings printed on the back of travel and domestic power strips. */
export const STRIP_RATINGS_A = [5, 6, 10, 13, 15, 16];

/**
 * Typical rated power for things people carry. These are planning starting
 * points taken from the ranges printed on common consumer equipment, not
 * measurements of a specific model — every row is editable because the number
 * on your own label is the one that counts.
 */
export const DEVICE_CATALOGUE = [
  { key: "phone", label: "Phone fast charger", watts: 25, heating: false },
  { key: "tablet", label: "Tablet charger", watts: 20, heating: false },
  { key: "laptop", label: "Laptop charger (USB-C)", watts: 65, heating: false },
  { key: "laptop-big", label: "Gaming or workstation laptop charger", watts: 180, heating: false },
  { key: "camera", label: "Camera battery charger", watts: 20, heating: false },
  { key: "toothbrush", label: "Electric toothbrush charger", watts: 5, heating: false },
  { key: "speaker", label: "Bluetooth speaker", watts: 15, heating: false },
  { key: "powerbank", label: "Power bank charging", watts: 30, heating: false },
  { key: "cpap", label: "CPAP machine", watts: 60, heating: false },
  { key: "fan", label: "Portable fan", watts: 40, heating: false },
  { key: "scooter", label: "E-scooter or e-bike charger", watts: 150, heating: false },
  { key: "straightener", label: "Hair straightener", watts: 75, heating: true },
  { key: "kettle", label: "Travel kettle", watts: 1000, heating: true },
  { key: "iron", label: "Travel iron", watts: 1000, heating: true },
  { key: "dryer-travel", label: "Travel hair dryer", watts: 1200, heating: true },
  { key: "dryer-full", label: "Full-size hair dryer", watts: 1800, heating: true },
  { key: "heater", label: "Portable fan heater", watts: 1500, heating: true },
];

const MAX_DEVICES = 24;
const MAX_QTY = 20;
const MAX_WATTS_PER_DEVICE = 5000;
const MAX_VOLTAGE = 300;
const MIN_VOLTAGE = 50;
const MAX_RATING_A = 40;

export function catalogueEntry(key) {
  return DEVICE_CATALOGUE.find((item) => item.key === key) || null;
}

/** Current drawn by a load of `watts` at `voltageV`, at unity power factor. */
export function currentFromWatts(watts, voltageV) {
  if (!Number.isFinite(watts) || !Number.isFinite(voltageV) || voltageV <= 0) return null;
  return watts / voltageV;
}

/**
 * @param {object} input
 * @param {Array<{label:string, watts:number, qty:number, heating?:boolean}>} input.devices
 * @returns {{error:string}|object}
 */
export function computeStripLoad({
  devices = [],
  mainsVoltageV = 230,
  stripRatingA = 10,
  socketRatingA = 13,
}) {
  if (!Array.isArray(devices)) return { error: "Device list is missing." };
  if (devices.length > MAX_DEVICES) return { error: `Keep the list to ${MAX_DEVICES} rows or fewer.` };

  const scalars = [mainsVoltageV, stripRatingA, socketRatingA];
  if (!scalars.every((v) => typeof v === "number" && Number.isFinite(v))) {
    return { error: "Enter a number for the supply voltage and both current ratings." };
  }
  if (mainsVoltageV < MIN_VOLTAGE || mainsVoltageV > MAX_VOLTAGE) {
    return { error: `Supply voltage must be between ${MIN_VOLTAGE} V and ${MAX_VOLTAGE} V.` };
  }
  if (stripRatingA <= 0 || socketRatingA <= 0) {
    return { error: "Current ratings must be greater than zero — check the label on the strip." };
  }
  if (stripRatingA > MAX_RATING_A || socketRatingA > MAX_RATING_A) {
    return { error: `A rating above ${MAX_RATING_A} A is not a plug-in socket or strip.` };
  }

  const rows = [];
  for (const device of devices) {
    const watts = Number(device?.watts);
    const qty = Number(device?.qty);
    if (!Number.isFinite(watts) || !Number.isFinite(qty)) {
      return { error: "Every row needs a wattage and a quantity." };
    }
    if (watts < 0) return { error: "Wattage cannot be negative." };
    if (watts > MAX_WATTS_PER_DEVICE) {
      return { error: `${device?.label || "One device"} is over ${MAX_WATTS_PER_DEVICE} W — that is not a plug-in appliance.` };
    }
    if (!Number.isInteger(qty) || qty < 0 || qty > MAX_QTY) {
      return { error: `Quantity must be a whole number from 0 to ${MAX_QTY}.` };
    }
    const totalWatts = watts * qty;
    rows.push({
      key: device.key ?? device.label,
      label: device.label ?? "Device",
      watts,
      qty,
      heating: Boolean(device.heating),
      totalWatts,
      totalAmps: totalWatts / mainsVoltageV,
    });
  }

  const totalWatts = rows.reduce((sum, row) => sum + row.totalWatts, 0);
  const totalAmps = totalWatts / mainsVoltageV;

  // The system can only be as strong as its weakest rated part.
  const bindingRatingA = Math.min(stripRatingA, socketRatingA);
  const bindingPart = stripRatingA <= socketRatingA ? "power strip" : "wall socket";

  const continuousLimitA = bindingRatingA * CONTINUOUS_LOAD_FRACTION;
  const maxWattsPeak = bindingRatingA * mainsVoltageV;
  const maxWattsContinuous = continuousLimitA * mainsVoltageV;

  const utilisationPct = bindingRatingA > 0 ? (totalAmps / bindingRatingA) * 100 : 0;
  const spareWattsToContinuous = maxWattsContinuous - totalWatts;
  const spareWattsToPeak = maxWattsPeak - totalWatts;

  const withinContinuous = totalAmps <= continuousLimitA;
  const withinPeak = totalAmps <= bindingRatingA;

  let verdict;
  if (!withinPeak) verdict = "Overloaded";
  else if (!withinContinuous) verdict = "Over the 80% margin";
  else verdict = "Within limits";

  const heatingRows = rows.filter((row) => row.heating && row.qty > 0);
  const heatingWatts = heatingRows.reduce((sum, row) => sum + row.totalWatts, 0);
  const activeRows = rows.filter((row) => row.qty > 0 && row.totalWatts > 0);
  const worstOffender = activeRows.reduce(
    (worst, row) => (worst === null || row.totalWatts > worst.totalWatts ? row : worst),
    null,
  );

  const notes = [];
  if (!withinPeak) {
    notes.push(
      `Over the ${bindingRatingA} A limit of the ${bindingPart}. Unplug something before you switch on — the strip's own cord is the part that overheats.`,
    );
    if (worstOffender) {
      notes.push(
        `Dropping ${worstOffender.label} removes ${Math.round(worstOffender.totalWatts)} W and brings the total to ${Math.round(totalWatts - worstOffender.totalWatts)} W.`,
      );
    }
  } else if (!withinContinuous) {
    notes.push(
      `Inside the ${bindingRatingA} A rating but above the ${Math.round(CONTINUOUS_LOAD_FRACTION * 100)}% margin used for loads that run for hours. Fine for a kettle that boils for two minutes, not for an overnight heater.`,
    );
  }
  if (heatingRows.length > 1) {
    notes.push(
      `Two or more heating appliances on one strip: ${heatingRows.map((row) => row.label).join(", ")}. Run them one at a time — together they come to ${Math.round(heatingWatts)} W.`,
    );
  }
  if (mainsVoltageV <= 130 && totalWatts > 0) {
    notes.push(
      `At ${mainsVoltageV} V every watt costs roughly twice the current it would at 230 V, so a kit that is comfortable in Europe can trip a US or Japanese socket.`,
    );
  }
  if (stripRatingA > socketRatingA) {
    notes.push(
      `Your strip is rated ${stripRatingA} A but the socket is only ${socketRatingA} A, so ${socketRatingA} A is the real limit.`,
    );
  }
  if (totalWatts === 0) {
    notes.push("Nothing switched on yet — set a quantity above zero to see the load.");
  }

  return {
    rows,
    activeRows,
    totalWatts,
    totalAmps,
    heatingWatts,
    bindingRatingA,
    bindingPart,
    continuousLimitA,
    maxWattsPeak,
    maxWattsContinuous,
    utilisationPct,
    spareWattsToContinuous,
    spareWattsToPeak,
    withinContinuous,
    withinPeak,
    worstOffender,
    verdict,
    notes,
  };
}
