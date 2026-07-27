/**
 * Drill bit size selection.
 *
 * Four different jobs, four different rules, and getting them mixed up is why
 * screws snap and threads strip.
 *
 * 1. PILOT HOLE for a wood screw. The hole removes the material the screw's
 *    solid core has to occupy, leaving the threads to cut into the wood
 *    around it. Published pilot charts work out at roughly 60% of the screw's
 *    outer thread diameter in softwood and 75% in hardwood — the denser the
 *    timber, the closer the pilot has to be to the screw's root diameter,
 *    because dense fibres split rather than compress.
 *
 * 2. CLEARANCE HOLE. In the top piece of a two-part joint the screw must pass
 *    through without gripping, otherwise it jacks the pieces apart instead of
 *    pulling them together. That hole is the full outer diameter plus a
 *    little. For machine screws the sizes are standardised in ISO 273.
 *
 * 3. TAPPED HOLE. The standard tap drill rule for ISO metric coarse threads
 *    is drill diameter = D - P, the nominal diameter minus the pitch. It
 *    produces about 77% thread engagement, which carries essentially the full
 *    strength of the thread while keeping tapping torque reasonable — a 100%
 *    thread needs roughly three times the torque for about 5% more strength.
 *
 * 4. WALL PLUG or anchor. The hole matches the plug's own stated diameter
 *    exactly, and is drilled deeper than the plug so drilling dust has
 *    somewhere to go rather than stopping the plug short.
 *
 * Screw gauge follows the standard definition: major diameter in inches =
 * 0.060 + 0.013 x gauge.
 */

/** Millimetres per inch, exact by definition. */
export const MM_PER_INCH = 25.4;

/** Wood screw gauge to major diameter in inches: 0.060 + 0.013 x gauge. */
export const GAUGE_BASE_INCH = 0.06;
export const GAUGE_STEP_INCH = 0.013;

/**
 * Pilot hole as a fraction of the screw's outer thread diameter, derived from
 * published pilot-hole charts. Denser material needs a larger pilot because
 * the fibres split instead of compressing.
 */
export const PILOT_FACTORS = {
  softwood: {
    label: "Softwood (pine, deal, cedar)",
    pilot: 0.6,
    note: "Fibres compress, so a smaller pilot still holds. Too large and the thread has nothing to bite.",
  },
  plywood: {
    label: "Plywood or OSB",
    pilot: 0.65,
    note: "Cross-laminated plies resist splitting but the face veneer tears — countersink rather than force the head in.",
  },
  hardwood: {
    label: "Hardwood (oak, teak, sal, maple)",
    pilot: 0.75,
    note: "Close to the screw's root diameter. Undersize a pilot in hardwood and you snap the screw before it seats.",
  },
  mdf: {
    label: "MDF or particleboard",
    pilot: 0.75,
    note: "No grain to compress and it swells hard. Always pilot, and never drive a screw within 50 mm of an edge without one.",
  },
  plastic: {
    label: "Hard plastic (acrylic, PVC)",
    pilot: 0.85,
    note: "Brittle and it cracks from the hole outwards. Go large, drill slowly, and back the sheet with scrap.",
  },
};

/** Clearance hole for a wood screw: the outer diameter plus a working margin. */
export const WOOD_CLEARANCE_FACTOR = 1.05;

/** Countersunk head diameter is close to twice the screw's outer diameter. */
export const COUNTERSINK_FACTOR = 1.95;

/**
 * ISO metric coarse threads: nominal diameter and pitch in mm.
 * Tap drill is computed as D - P, not stored, so it cannot drift.
 */
export const METRIC_COARSE = [
  { size: "M3", d: 3, pitch: 0.5 },
  { size: "M4", d: 4, pitch: 0.7 },
  { size: "M5", d: 5, pitch: 0.8 },
  { size: "M6", d: 6, pitch: 1.0 },
  { size: "M8", d: 8, pitch: 1.25 },
  { size: "M10", d: 10, pitch: 1.5 },
  { size: "M12", d: 12, pitch: 1.75 },
  { size: "M16", d: 16, pitch: 2.0 },
  { size: "M20", d: 20, pitch: 2.5 },
];

/** Bolt clearance holes, ISO 273, in mm: close / medium / free fit. */
export const ISO_273_CLEARANCE = {
  M3: { close: 3.2, medium: 3.4, free: 3.6 },
  M4: { close: 4.3, medium: 4.5, free: 4.8 },
  M5: { close: 5.3, medium: 5.5, free: 5.8 },
  M6: { close: 6.4, medium: 6.6, free: 7.0 },
  M8: { close: 8.4, medium: 9.0, free: 10.0 },
  M10: { close: 10.5, medium: 11.0, free: 12.0 },
  M12: { close: 13.0, medium: 13.5, free: 14.5 },
  M16: { close: 17.0, medium: 17.5, free: 18.5 },
  M20: { close: 21.0, medium: 22.0, free: 24.0 },
};

/**
 * Usable thread depth per side for a 60-degree ISO or Unified thread is
 * 0.6495 x pitch (Machinery's Handbook), so a 100% thread corresponds to a
 * hole 2 x 0.6495 x P below the nominal diameter. This is the constant behind
 * the familiar result that a D - P tap drill gives 100 / 1.299 = 77% thread.
 */
export const THREAD_DEPTH_PER_SIDE = 0.6495;

/** Common metric HSS twist drill sizes, mm. */
export const TWIST_BITS_MM = [
  1, 1.5, 2, 2.5, 3, 3.2, 3.5, 4, 4.2, 4.5, 4.8, 5, 5.5, 6, 6.5, 6.8, 7, 8, 8.5, 9, 10, 10.2, 11,
  12, 13, 14, 14.5, 15, 16, 17, 17.5, 18, 19, 20,
];

/** Common masonry bit sizes, mm. Plugs are sold to match these. */
export const MASONRY_BITS_MM = [4, 5, 5.5, 6, 6.5, 7, 8, 10, 12, 14, 16];

/** Wall plug colours as sold across most of the UK/EU/India range. */
export const WALL_PLUGS = [
  { colour: "Yellow", drillMm: 5, plugLengthMm: 25, screws: "Gauge 4–6 (3.0–3.5 mm)" },
  { colour: "Red", drillMm: 6, plugLengthMm: 30, screws: "Gauge 6–8 (3.5–4.5 mm)" },
  { colour: "Brown", drillMm: 7, plugLengthMm: 35, screws: "Gauge 8–10 (4.5–5.0 mm)" },
  { colour: "Blue", drillMm: 10, plugLengthMm: 50, screws: "Gauge 12–14 (5.5–6.5 mm)" },
];

/** Extra depth drilled past a plug so dust does not stop it short, mm. */
export const PLUG_DEPTH_ALLOWANCE_MM = 10;

/** Extra depth past a wood screw tip, mm. */
export const SCREW_DEPTH_ALLOWANCE_MM = 3;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const MAX_DIAMETER_MM = 30;
const MAX_LENGTH_MM = 400;

/** Wood screw gauge to major diameter in mm. */
export function gaugeToMm(gauge) {
  if (!isNum(gauge) || gauge < 0 || gauge > 24) return null;
  return (GAUGE_BASE_INCH + GAUGE_STEP_INCH * gauge) * MM_PER_INCH;
}

/** Major diameter in mm back to the nearest wood screw gauge. */
export function mmToGauge(mm) {
  if (!isNum(mm) || mm <= 0) return null;
  return Math.round((mm / MM_PER_INCH - GAUGE_BASE_INCH) / GAUGE_STEP_INCH);
}

/** Express a millimetre size as the nearest inch fraction, reduced. */
export function mmToInchFraction(mm, denominator = 64) {
  if (!isNum(mm) || mm <= 0 || !isNum(denominator) || denominator <= 0) return null;
  const inches = mm / MM_PER_INCH;
  let numerator = Math.round(inches * denominator);
  if (numerator <= 0) return null;
  let den = denominator;
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(numerator, den);
  numerator /= divisor;
  den /= divisor;
  const whole = Math.floor(numerator / den);
  const remainder = numerator - whole * den;
  const fraction = remainder === 0 ? "" : `${remainder}/${den}`;
  const text = whole > 0 ? `${whole}${fraction ? ` ${fraction}` : ""}"` : `${fraction}"`;
  return { numerator, denominator: den, inches, text };
}

/** Nearest available bit from a set, plus the one under and the one over. */
export function nearestBit(targetMm, bits = TWIST_BITS_MM) {
  if (!isNum(targetMm) || targetMm <= 0 || !Array.isArray(bits) || bits.length === 0) return null;
  const sorted = [...bits].sort((a, b) => a - b);
  let under = null;
  let over = null;
  for (const bit of sorted) {
    if (bit <= targetMm) under = bit;
    if (bit >= targetMm && over === null) over = bit;
  }
  let nearest;
  if (under === null) nearest = over;
  else if (over === null) nearest = under;
  else nearest = targetMm - under <= over - targetMm ? under : over;
  return { target: targetMm, nearest, under, over };
}

/**
 * The whole selection.
 *
 * @param {object} input
 * @param {"wood"|"tap"|"plug"} input.mode
 * @param {number} [input.screwDiameterMm] Outer thread diameter of a wood screw.
 * @param {number} [input.screwLengthMm]   Screw length, for drill depth.
 * @param {string} [input.material]        Key of PILOT_FACTORS.
 * @param {string} [input.threadSize]      "M6" etc, for the tap mode.
 * @param {"close"|"medium"|"free"} [input.fit] Clearance series for the tap mode.
 * @param {number} [input.plugDrillMm]     Plug's stated drill size.
 * @param {number} [input.plugLengthMm]    Plug length.
 */
export function selectDrillBit({
  mode = "wood",
  screwDiameterMm = 4,
  screwLengthMm = 40,
  material = "softwood",
  threadSize = "M6",
  fit = "medium",
  plugDrillMm = 6,
  plugLengthMm = 30,
} = {}) {
  if (mode === "wood") {
    const spec = PILOT_FACTORS[material];
    if (!spec) return { error: "Choose the material you are drilling into." };
    if (!isNum(screwDiameterMm) || !isNum(screwLengthMm)) {
      return { error: "Enter the screw diameter and length as numbers." };
    }
    if (screwDiameterMm <= 0) return { error: "Screw diameter must be greater than zero." };
    if (screwDiameterMm > MAX_DIAMETER_MM) {
      return { error: `Screw diameter above ${MAX_DIAMETER_MM} mm is outside the range of these pilot rules.` };
    }
    if (screwLengthMm <= 0 || screwLengthMm > MAX_LENGTH_MM) {
      return { error: `Screw length should be between 1 and ${MAX_LENGTH_MM} mm.` };
    }

    const pilotMm = screwDiameterMm * spec.pilot;
    const clearanceMm = screwDiameterMm * WOOD_CLEARANCE_FACTOR;
    const countersinkMm = screwDiameterMm * COUNTERSINK_FACTOR;
    const depthMm = screwLengthMm + SCREW_DEPTH_ALLOWANCE_MM;

    const pilot = nearestBit(pilotMm);
    const clearance = nearestBit(clearanceMm);

    return {
      mode,
      material: spec,
      screwDiameterMm,
      screwLengthMm,
      gauge: mmToGauge(screwDiameterMm),
      pilotMm,
      pilotBit: pilot.nearest,
      pilotBitInch: mmToInchFraction(pilot.nearest),
      pilotAlternatives: pilot,
      clearanceMm,
      clearanceBit: clearance.nearest,
      clearanceBitInch: mmToInchFraction(clearance.nearest),
      countersinkMm,
      depthMm,
      headline: `${pilot.nearest} mm pilot`,
      verdict: `Pilot ${pilot.nearest} mm, clearance ${clearance.nearest} mm in the top piece, drill ${depthMm} mm deep. ${spec.note}`,
    };
  }

  if (mode === "tap") {
    const thread = METRIC_COARSE.find((entry) => entry.size === threadSize);
    if (!thread) return { error: "Choose a metric coarse thread size from M3 to M20." };
    const clearanceSet = ISO_273_CLEARANCE[threadSize];
    if (!clearanceSet) return { error: "No ISO 273 clearance figures for that thread size." };
    if (!["close", "medium", "free"].includes(fit)) {
      return { error: "Choose a close, medium or free clearance fit." };
    }

    // Tap drill = D - P. Thread engagement is measured against a full thread,
    // which sits 2 x 0.6495 x P below the nominal diameter, so
    // % thread = 100 x (D - hole) / (1.299 x P). At hole = D - P that is 77%.
    const tapDrillMm = thread.d - thread.pitch;
    const fullThreadDepthMm = 2 * THREAD_DEPTH_PER_SIDE * thread.pitch;
    const minorBasicMm = thread.d - fullThreadDepthMm;
    const engagementPct = ((thread.d - tapDrillMm) / fullThreadDepthMm) * 100;
    const clearanceMm = clearanceSet[fit];
    const tap = nearestBit(tapDrillMm);
    const clearance = nearestBit(clearanceMm);

    return {
      mode,
      thread,
      fit,
      tapDrillMm,
      tapBit: tap.nearest,
      tapBitInch: mmToInchFraction(tapDrillMm),
      minorBasicMm,
      engagementPct,
      clearanceMm,
      clearanceBit: clearance.nearest,
      clearanceSet,
      headline: `${tapDrillMm.toFixed(2).replace(/\.?0+$/, "")} mm tap drill`,
      verdict: `${thread.size} coarse has a ${thread.pitch} mm pitch, so the tap drill is ${thread.d} − ${thread.pitch} = ${tapDrillMm.toFixed(2).replace(/\.?0+$/, "")} mm, giving about ${engagementPct.toFixed(0)}% thread engagement. Drill the clearance hole in the part being bolted through at ${clearanceMm} mm.`,
    };
  }

  if (mode === "plug") {
    if (!isNum(plugDrillMm) || !isNum(plugLengthMm)) {
      return { error: "Enter the plug's drill size and length as numbers." };
    }
    if (plugDrillMm <= 0 || plugDrillMm > MAX_DIAMETER_MM) {
      return { error: `Plug drill size should be between 0 and ${MAX_DIAMETER_MM} mm.` };
    }
    if (plugLengthMm <= 0 || plugLengthMm > MAX_LENGTH_MM) {
      return { error: `Plug length should be between 1 and ${MAX_LENGTH_MM} mm.` };
    }

    const depthMm = plugLengthMm + PLUG_DEPTH_ALLOWANCE_MM;
    const bit = nearestBit(plugDrillMm, MASONRY_BITS_MM);
    const known = WALL_PLUGS.find((plug) => plug.drillMm === bit.nearest);

    return {
      mode,
      plugDrillMm,
      plugLengthMm,
      plugBit: bit.nearest,
      plugBitInch: mmToInchFraction(bit.nearest),
      depthMm,
      matchedPlug: known ?? null,
      headline: `${bit.nearest} mm masonry bit`,
      verdict: `Drill ${bit.nearest} mm to ${depthMm} mm deep — the plug length plus ${PLUG_DEPTH_ALLOWANCE_MM} mm so dust does not stop the plug short. Use hammer action in brick or concrete, but switch it off in hollow block or tile.${known ? ` A ${known.colour.toLowerCase()} plug takes ${known.screws}.` : ""}`,
    };
  }

  return { error: "Choose a wood screw, tapped thread or wall plug." };
}
