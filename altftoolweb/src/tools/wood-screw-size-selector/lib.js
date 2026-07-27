/**
 * Wood screw gauge, length, pilot hole and countersink selection.
 *
 * Three long-standing workshop rules do the work.
 *
 * 1. GAUGE follows the thickness of the board being screwed into. Thin stock
 *    takes a thin screw so it does not split; thick stock can carry a fatter
 *    one. GAUGE_BY_THICKNESS holds the usual bands.
 *
 * 2. LENGTH follows the "two-thirds" rule: the screw should bury about twice
 *    the thickness of the board it passes through into the board underneath, so
 *    total length is about three times the top board thickness. Two limits
 *    apply — the tip must stop at least 3 mm short of the far face on a blind
 *    joint, and the embedment must never fall below 6 mm.
 *
 * 3. PILOT HOLE is a fraction of the screw's major (outside) diameter: about
 *    0.60 in softwood and 0.70 in hardwood. Those two factors reproduce the
 *    published drill charts - a #8 screw of 4.2 mm gives 2.5 mm (3/32") in
 *    softwood and 2.9 mm (7/64") in hardwood.
 *
 * End-grain holding is far weaker than face-grain holding, so an end-grain
 * joint asks for 50% more embedment - and, where possible, a joinery method
 * that does not rely on end grain at all.
 */

/**
 * Imperial wood screw gauges. Major diameter and countersunk head diameter are
 * the ANSI/ASME B18.6.1 nominal figures; clearance hole is the drill size the
 * shank passes through freely.
 */
export const SCREW_GAUGES = [
  { gauge: "#2", majorMm: 2.2, headMm: 4.3, clearanceMm: 2.4 },
  { gauge: "#4", majorMm: 2.8, headMm: 5.5, clearanceMm: 2.8 },
  { gauge: "#6", majorMm: 3.5, headMm: 6.9, clearanceMm: 3.6 },
  { gauge: "#8", majorMm: 4.2, headMm: 8.2, clearanceMm: 4.4 },
  { gauge: "#10", majorMm: 4.8, headMm: 9.7, clearanceMm: 4.8 },
  { gauge: "#12", majorMm: 5.5, headMm: 11.1, clearanceMm: 5.6 },
  { gauge: "#14", majorMm: 6.3, headMm: 12.5, clearanceMm: 6.4 },
];

/** Receiving-board thickness bands, in millimetres, and the gauge that suits each. */
export const GAUGE_BY_THICKNESS = [
  { maxThicknessMm: 10, gauge: "#4" },
  { maxThicknessMm: 15, gauge: "#6" },
  { maxThicknessMm: 21, gauge: "#8" },
  { maxThicknessMm: 28, gauge: "#10" },
  { maxThicknessMm: 40, gauge: "#12" },
  { maxThicknessMm: Infinity, gauge: "#14" },
];

/**
 * Materials being screwed into. pilotFactor is the pilot drill as a fraction of
 * the screw's major diameter; holdingFactor is roughly how well the material
 * grips compared with softwood, used only to flag weak substrates.
 */
export const BASE_MATERIALS = [
  {
    id: "softwood",
    label: "Softwood (pine, spruce, fir, deodar)",
    pilotFactor: 0.6,
    holdingFactor: 1,
    alwaysPredrill: false,
    note: "Predrill near ends and edges; the fibres split easily along the grain.",
  },
  {
    id: "hardwood",
    label: "Hardwood (oak, teak, maple, sheesham)",
    pilotFactor: 0.7,
    holdingFactor: 1.35,
    alwaysPredrill: true,
    note: "Always predrill. Dense hardwood will snap a screw or split before it drives home.",
  },
  {
    id: "plywood",
    label: "Plywood",
    pilotFactor: 0.65,
    holdingFactor: 0.9,
    alwaysPredrill: false,
    note: "Screwing into a plywood edge holds far less than into its face — allow more embedment.",
  },
  {
    id: "mdf",
    label: "MDF",
    pilotFactor: 0.75,
    holdingFactor: 0.6,
    alwaysPredrill: true,
    note: "MDF splits without a generous pilot, especially into the edge. Use straight-shank screws.",
  },
  {
    id: "particleboard",
    label: "Particleboard / chipboard",
    pilotFactor: 0.7,
    holdingFactor: 0.5,
    alwaysPredrill: true,
    note: "Low grip. Use coarse chipboard screws and avoid re-driving into the same hole.",
  },
];

export const JOINT_TYPES = [
  {
    id: "face",
    label: "Face to face (through one board into the flat of another)",
    embedmentFactor: 1,
    intoEndGrain: false,
  },
  {
    id: "endgrain",
    label: "Butt joint into end grain (shelf end, frame corner)",
    embedmentFactor: 1.5,
    intoEndGrain: true,
  },
  {
    id: "edge",
    label: "Into a panel edge (plywood, MDF or board edge)",
    embedmentFactor: 1.4,
    intoEndGrain: true,
  },
  {
    id: "hardware",
    label: "Mounting hardware (hinge, bracket, runner)",
    embedmentFactor: 1.6,
    intoEndGrain: false,
  },
];

/** Screw should bury about twice the top board thickness into the base board. */
export const EMBEDMENT_MULTIPLIER = 2;

/** Tip must stop this far short of the far face on a blind (non-through) joint, mm. */
export const TIP_CLEARANCE_MM = 3;

/** Never rely on less than this much thread in the base board, mm. */
export const MIN_EMBEDMENT_MM = 6;

/** Common screw lengths sold, in millimetres, with their nearest imperial call-out. */
export const SCREW_LENGTHS_MM = [
  { mm: 12, inch: '1/2"' },
  { mm: 16, inch: '5/8"' },
  { mm: 20, inch: '3/4"' },
  { mm: 25, inch: '1"' },
  { mm: 30, inch: '1 1/8"' },
  { mm: 32, inch: '1 1/4"' },
  { mm: 35, inch: '1 3/8"' },
  { mm: 40, inch: '1 1/2"' },
  { mm: 45, inch: '1 3/4"' },
  { mm: 50, inch: '2"' },
  { mm: 60, inch: '2 3/8"' },
  { mm: 65, inch: '2 1/2"' },
  { mm: 70, inch: '2 3/4"' },
  { mm: 80, inch: '3 1/8"' },
  { mm: 90, inch: '3 1/2"' },
  { mm: 100, inch: '4"' },
  { mm: 120, inch: '4 3/4"' },
  { mm: 150, inch: '6"' },
];

/** Minimum distance from an unpredrilled end, as a multiple of screw diameter. */
export const END_DISTANCE_FACTOR = 10;

/** Minimum distance from an edge, as a multiple of screw diameter. */
export const EDGE_DISTANCE_FACTOR = 5;

/** Predrilling roughly halves the distances above. */
export const PREDRILL_DISTANCE_RELIEF = 0.5;

const round1 = (value) => Math.round(value * 10) / 10;

/** Reference chart of shank, pilot and countersink sizes for every gauge. */
export function pilotChart() {
  const softwood = BASE_MATERIALS.find((entry) => entry.id === "softwood").pilotFactor;
  const hardwood = BASE_MATERIALS.find((entry) => entry.id === "hardwood").pilotFactor;
  return SCREW_GAUGES.map((entry) => ({
    gauge: entry.gauge,
    majorMm: entry.majorMm,
    pilotSoftwoodMm: round1(entry.majorMm * softwood),
    pilotHardwoodMm: round1(entry.majorMm * hardwood),
    clearanceMm: entry.clearanceMm,
    countersinkMm: entry.headMm,
  }));
}

function gaugeForThickness(thicknessMm) {
  const band = GAUGE_BY_THICKNESS.find((entry) => thicknessMm <= entry.maxThicknessMm);
  return band ? band.gauge : "#8";
}

function shiftGauge(gauge, steps) {
  const index = SCREW_GAUGES.findIndex((entry) => entry.gauge === gauge);
  if (index < 0) return SCREW_GAUGES[3];
  const next = Math.min(SCREW_GAUGES.length - 1, Math.max(0, index + steps));
  return SCREW_GAUGES[next];
}

/**
 * @param {object} input
 * @param {number} input.topThicknessMm  board the screw passes through
 * @param {number} input.baseThicknessMm board the screw bites into
 * @param {string} input.baseMaterial    id from BASE_MATERIALS
 * @param {string} input.jointType       id from JOINT_TYPES
 * @param {string} input.load            "light" | "normal" | "heavy"
 * @param {boolean} input.throughFixing  true if the tip may break out of the far face
 * @param {boolean} input.predrilled     true if a pilot hole will be drilled
 * @returns {object} recommendation, or { error }
 */
export function selectWoodScrew({
  topThicknessMm,
  baseThicknessMm,
  baseMaterial = "softwood",
  jointType = "face",
  load = "normal",
  throughFixing = false,
  predrilled = true,
}) {
  const top = Number(topThicknessMm);
  const base = Number(baseThicknessMm);

  const material = BASE_MATERIALS.find((entry) => entry.id === baseMaterial);
  const joint = JOINT_TYPES.find((entry) => entry.id === jointType);
  if (!material) return { error: "Choose a material for the board being screwed into." };
  if (!joint) return { error: "Choose a joint type." };

  if (!Number.isFinite(top) || !Number.isFinite(base)) {
    return { error: "Enter both board thicknesses as numbers." };
  }
  if (top <= 0 || base <= 0) return { error: "Both board thicknesses must be greater than zero." };
  if (top > 200 || base > 300) {
    return { error: "Board thickness is limited to 200 mm on top and 300 mm underneath." };
  }

  const loadSteps = load === "heavy" ? 1 : load === "light" ? -1 : 0;
  const screw = shiftGauge(gaugeForThickness(base), loadSteps);

  const targetEmbedment = top * EMBEDMENT_MULTIPLIER * joint.embedmentFactor;
  const maxEmbedment = throughFixing ? base + 50 : base - TIP_CLEARANCE_MM;
  const warnings = [];

  if (maxEmbedment < MIN_EMBEDMENT_MM) {
    return {
      error: `A ${round1(base)} mm base leaves under ${MIN_EMBEDMENT_MM} mm of thread once the ${TIP_CLEARANCE_MM} mm tip clearance is taken off. Screw through into something thicker, or use a through bolt.`,
    };
  }

  let embedment = Math.min(targetEmbedment, maxEmbedment);
  if (embedment < MIN_EMBEDMENT_MM) embedment = MIN_EMBEDMENT_MM;
  if (embedment < targetEmbedment) {
    warnings.push(
      `The base board only allows ${round1(embedment)} mm of thread instead of the ideal ${round1(targetEmbedment)} mm — the joint will be weaker than the rule of thumb.`,
    );
  }

  const idealLength = top + embedment;
  const maxLength = top + maxEmbedment;
  const usable = SCREW_LENGTHS_MM.filter((entry) => entry.mm <= maxLength + 0.001);
  if (usable.length === 0) {
    return {
      error: `Even the shortest common screw (${SCREW_LENGTHS_MM[0].mm} mm) would break through. Use a shorter fixing or a through fixing.`,
    };
  }

  let best = usable[0];
  for (const entry of usable) {
    if (Math.abs(entry.mm - idealLength) < Math.abs(best.mm - idealLength)) best = entry;
  }
  const chosenIndex = SCREW_LENGTHS_MM.findIndex((entry) => entry.mm === best.mm);
  const shorter = chosenIndex > 0 ? SCREW_LENGTHS_MM[chosenIndex - 1] : null;
  const longer =
    chosenIndex < SCREW_LENGTHS_MM.length - 1 && SCREW_LENGTHS_MM[chosenIndex + 1].mm <= maxLength
      ? SCREW_LENGTHS_MM[chosenIndex + 1]
      : null;

  const actualEmbedment = best.mm - top;
  if (actualEmbedment < MIN_EMBEDMENT_MM) {
    warnings.push(
      `A ${best.mm} mm screw leaves only ${round1(actualEmbedment)} mm of thread in the base board — glue the joint or add a mechanical fixing.`,
    );
  }
  if (!throughFixing && best.mm > base + top - TIP_CLEARANCE_MM) {
    warnings.push("This length may show on the far face — check before driving.");
  }

  const needsPredrill = material.alwaysPredrill || joint.intoEndGrain;
  if (needsPredrill && !predrilled) {
    const reason = material.alwaysPredrill ? material.label.split(" (")[0] : "This end-grain fixing";
    warnings.push(`${reason} needs a pilot hole — driving dry will split the board.`);
  }
  if (material.holdingFactor < 0.75) {
    warnings.push(
      `${material.label.split(" (")[0]} grips poorly. Use a coarse-thread screw, add glue, or fit an insert for anything load bearing.`,
    );
  }
  if (joint.intoEndGrain) {
    warnings.push("End grain holds roughly half as well as face grain — dowels, dominoes or pocket holes are stronger where you can use them.");
  }

  const relief = predrilled ? PREDRILL_DISTANCE_RELIEF : 1;

  return {
    gauge: screw.gauge,
    majorMm: screw.majorMm,
    headMm: screw.headMm,
    lengthMm: best.mm,
    lengthInch: best.inch,
    shorterOption: shorter,
    longerOption: longer,
    idealLengthMm: round1(idealLength),
    embedmentMm: round1(actualEmbedment),
    targetEmbedmentMm: round1(targetEmbedment),
    maxEmbedmentMm: round1(maxEmbedment),
    pilotMm: round1(screw.majorMm * material.pilotFactor),
    pilotFactor: material.pilotFactor,
    clearanceMm: screw.clearanceMm,
    countersinkMm: screw.headMm,
    endDistanceMm: round1(screw.majorMm * END_DISTANCE_FACTOR * relief),
    edgeDistanceMm: round1(screw.majorMm * EDGE_DISTANCE_FACTOR * relief),
    materialNote: material.note,
    needsPredrill,
    warnings,
  };
}
