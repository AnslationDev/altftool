/**
 * Gravel driveway quantity calculator.
 *
 * The chain of reasoning is:
 *
 *   compacted volume = area x finished depth
 *   loose volume     = compacted volume x (1 + compaction allowance)
 *   weight           = loose volume x bulk density
 *
 * Aggregate is delivered loose and settles when rolled, so you must buy more
 * volume than the finished depth implies. Crushed aggregate typically loses
 * 20-30% of its loose volume under compaction, and 25% is the usual working
 * allowance.
 *
 * Bulk densities are held in short tons per cubic yard, the unit US aggregate
 * suppliers quote, and converted to metric for the metric readouts.
 */

/** 1 cubic yard = 27 cubic feet = 0.764555 m³. */
export const CUBIC_FEET_PER_YARD = 27;
export const M3_PER_CUBIC_YARD = 0.764555;
/** 1 short ton = 2,000 lb = 0.907185 metric tonnes. */
export const TONNES_PER_SHORT_TON = 0.907185;
/** 1 foot = 0.3048 m exactly; 1 m² = 10.7639 ft². */
export const M_PER_FT = 0.3048;
export const SQFT_PER_SQM = 10.7639;
export const INCHES_PER_FOOT = 12;

/** Usual working allowance for settlement of crushed aggregate under a roller. */
export const DEFAULT_COMPACTION_PCT = 25;

/**
 * Aggregate bulk densities in short tons per loose cubic yard, as quoted by
 * aggregate suppliers. Angular crusher run packs denser than clean, single-
 * sized stone because the fines fill the voids.
 */
export const MATERIALS = {
  crusherRun: {
    key: "crusherRun",
    label: 'Crusher run / #411 (dust + 3/4" stone)',
    tonsPerYard: 1.5,
    note: "Binds and compacts hard — the usual driving surface.",
  },
  stone57: {
    key: "stone57",
    label: '#57 clean crushed stone (3/4")',
    tonsPerYard: 1.35,
    note: "Drains freely; used as the middle layer.",
  },
  stone3: {
    key: "stone3",
    label: '#3 base stone (2-3")',
    tonsPerYard: 1.35,
    note: "Large angular rock for the sub-base over soil.",
  },
  peaGravel: {
    key: "peaGravel",
    label: "Pea gravel (rounded)",
    tonsPerYard: 1.4,
    note: "Rounded stones do not lock together — it migrates under tyres.",
  },
  riverRock: {
    key: "riverRock",
    label: "River rock",
    tonsPerYard: 1.35,
    note: "Decorative only; poor for a driving surface.",
  },
  decomposedGranite: {
    key: "decomposedGranite",
    label: "Decomposed granite",
    tonsPerYard: 1.5,
    note: "Compacts to a firm surface but erodes on slopes.",
  },
};

/**
 * The standard three-layer build-up for a gravel driveway on bare soil:
 * large angular rock at the bottom for load spreading, clean stone to drain,
 * and crusher run on top to bind into a surface.
 */
export const BUILDUP_LAYERS = [
  { key: "stone3", label: "Sub-base", material: "stone3", defaultInches: 4 },
  { key: "stone57", label: "Middle course", material: "stone57", defaultInches: 4 },
  { key: "crusherRun", label: "Surface course", material: "crusherRun", defaultInches: 4 },
];

/** Deeper than this and you are excavating, not surfacing. */
export const MAX_DEPTH_INCHES = 24;

const round = (value, decimals = 0) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Volume and weight of one layer.
 * @param {number} areaSqft finished area in square feet
 * @param {number} depthFt finished (compacted) depth in feet
 * @param {number} tonsPerYard bulk density in short tons per cubic yard
 * @param {number} compactionPct settlement allowance, percent
 */
export function layerQuantities(areaSqft, depthFt, tonsPerYard, compactionPct) {
  const compactedCubicFeet = areaSqft * depthFt;
  const compactedYards = compactedCubicFeet / CUBIC_FEET_PER_YARD;
  const looseYards = compactedYards * (1 + compactionPct / 100);
  const shortTons = looseYards * tonsPerYard;
  return {
    compactedYards,
    looseYards,
    looseM3: looseYards * M3_PER_CUBIC_YARD,
    shortTons,
    tonnes: shortTons * TONNES_PER_SHORT_TON,
  };
}

/**
 * Calculate a gravel driveway order.
 *
 * @param {object} input
 * @param {"single"|"buildup"} input.mode
 * @param {"dimensions"|"area"} input.areaMode
 * @param {number|string} input.length      driveway length
 * @param {number|string} input.width       driveway width
 * @param {number|string} input.area        area directly
 * @param {"ft"|"m"} input.unit             unit for length/width
 * @param {"sqft"|"sqm"} input.areaUnit     unit when entering area directly
 * @param {string} input.material           key of MATERIALS, for single mode
 * @param {number|string} input.depth       finished depth, for single mode
 * @param {"in"|"cm"} input.depthUnit
 * @param {object} input.layerDepths        { stone3, stone57, crusherRun } in the depth unit
 * @param {number|string} input.compactionPct
 * @param {number|string} input.pricePerTon
 * @param {number|string} input.truckTons   capacity of one delivery truck, short tons
 * @returns {object} gravel result, or { error } for invalid input
 */
export function calculateGravel({
  mode = "single",
  areaMode = "dimensions",
  length = 60,
  width = 12,
  area = 720,
  unit = "ft",
  areaUnit = "sqft",
  material = "crusherRun",
  depth = 4,
  depthUnit = "in",
  layerDepths = {},
  compactionPct = DEFAULT_COMPACTION_PCT,
  pricePerTon = 30,
  truckTons = 15,
}) {
  const compaction = toNumber(compactionPct);
  const price = toNumber(pricePerTon);
  const truck = toNumber(truckTons);

  if ([compaction, price, truck].some((v) => Number.isNaN(v))) {
    return { error: "Enter valid numbers for compaction, price and truck capacity." };
  }
  if (compaction < 0 || compaction > 60) {
    return { error: "Compaction allowance should be between 0% and 60%." };
  }
  if (price < 0) return { error: "Price per ton cannot be negative." };
  if (truck <= 0) return { error: "Truck capacity must be greater than zero." };
  if (depthUnit !== "in" && depthUnit !== "cm") {
    return { error: "Depth unit must be inches or centimetres." };
  }

  // Finished area in square feet.
  let areaSqft;
  if (areaMode === "dimensions") {
    const l = toNumber(length);
    const w = toNumber(width);
    if (Number.isNaN(l) || Number.isNaN(w)) {
      return { error: "Enter the length and width as numbers." };
    }
    if (l <= 0 || w <= 0) return { error: "Length and width must be greater than zero." };
    if (unit !== "ft" && unit !== "m") return { error: "Dimension unit must be feet or metres." };
    const toFt = unit === "m" ? 1 / M_PER_FT : 1;
    areaSqft = l * toFt * (w * toFt);
  } else if (areaMode === "area") {
    const a = toNumber(area);
    if (Number.isNaN(a)) return { error: "Enter the area as a number." };
    if (a <= 0) return { error: "Area must be greater than zero." };
    if (areaUnit !== "sqft" && areaUnit !== "sqm") {
      return { error: "Area unit must be square feet or square metres." };
    }
    areaSqft = areaUnit === "sqm" ? a * SQFT_PER_SQM : a;
  } else {
    return { error: "Choose whether to enter dimensions or an area." };
  }

  if (areaSqft > 500000) {
    return { error: "Above 500,000 ft² this is a civil works job — get a contractor to quote it." };
  }

  // Convert a depth in the chosen unit to feet.
  const depthToFeet = (value) =>
    depthUnit === "cm" ? value / 100 / M_PER_FT : value / INCHES_PER_FOOT;
  const depthToInches = (value) => (depthUnit === "cm" ? value / 2.54 : value);

  const layers = [];

  if (mode === "single") {
    const mat = MATERIALS[material];
    if (!mat) return { error: "Choose one of the listed aggregate types." };
    const d = toNumber(depth);
    if (Number.isNaN(d)) return { error: "Enter the depth as a number." };
    if (d <= 0) return { error: "Depth must be greater than zero." };
    if (depthToInches(d) > MAX_DEPTH_INCHES) {
      return { error: `Depth above ${MAX_DEPTH_INCHES} inches needs an engineered sub-base design.` };
    }
    layers.push({ label: "Gravel layer", material: mat, depthValue: d, depthFt: depthToFeet(d) });
  } else if (mode === "buildup") {
    let totalInches = 0;
    for (const spec of BUILDUP_LAYERS) {
      const raw = layerDepths[spec.key];
      const d = toNumber(raw === undefined || raw === "" ? spec.defaultInches : raw);
      if (Number.isNaN(d)) return { error: `Enter a valid depth for the ${spec.label.toLowerCase()}.` };
      if (d < 0) return { error: "Layer depths cannot be negative." };
      totalInches += depthToInches(d);
      if (d > 0) {
        layers.push({
          label: spec.label,
          material: MATERIALS[spec.material],
          depthValue: d,
          depthFt: depthToFeet(d),
        });
      }
    }
    if (layers.length === 0) return { error: "Give at least one layer a depth greater than zero." };
    if (totalInches > MAX_DEPTH_INCHES) {
      return {
        error: `Total build-up of ${round(totalInches, 1)} inches exceeds the ${MAX_DEPTH_INCHES} inch limit for this calculator.`,
      };
    }
  } else {
    return { error: "Choose a single layer or a three-layer build-up." };
  }

  const rows = layers.map((layer) => {
    const q = layerQuantities(areaSqft, layer.depthFt, layer.material.tonsPerYard, compaction);
    return {
      label: layer.label,
      materialLabel: layer.material.label,
      note: layer.material.note,
      depthValue: layer.depthValue,
      depthInches: round(layer.depthFt * INCHES_PER_FOOT, 2),
      compactedYards: round(q.compactedYards, 2),
      looseYards: round(q.looseYards, 2),
      looseM3: round(q.looseM3, 2),
      shortTons: round(q.shortTons, 2),
      tonnes: round(q.tonnes, 2),
      cost: round(q.shortTons * price, 2),
    };
  });

  const totals = layers.reduce(
    (acc, layer) => {
      const q = layerQuantities(areaSqft, layer.depthFt, layer.material.tonsPerYard, compaction);
      acc.compactedYards += q.compactedYards;
      acc.looseYards += q.looseYards;
      acc.looseM3 += q.looseM3;
      acc.shortTons += q.shortTons;
      acc.tonnes += q.tonnes;
      acc.depthFt += layer.depthFt;
      return acc;
    },
    { compactedYards: 0, looseYards: 0, looseM3: 0, shortTons: 0, tonnes: 0, depthFt: 0 },
  );

  return {
    areaSqft: round(areaSqft, 1),
    areaSqm: round(areaSqft / SQFT_PER_SQM, 1),
    totalDepthInches: round(totals.depthFt * INCHES_PER_FOOT, 2),
    totalDepthCm: round(totals.depthFt * M_PER_FT * 100, 1),
    compactionPct: compaction,
    compactedYards: round(totals.compactedYards, 2),
    looseYards: round(totals.looseYards, 2),
    looseM3: round(totals.looseM3, 2),
    shortTons: round(totals.shortTons, 2),
    tonnes: round(totals.tonnes, 2),
    kg: round(totals.tonnes * 1000, 0),
    truckLoads: Math.ceil(totals.shortTons / truck),
    truckTons: truck,
    totalCost: round(totals.shortTons * price, 2),
    rows,
  };
}
