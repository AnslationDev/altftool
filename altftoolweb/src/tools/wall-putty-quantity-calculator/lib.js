/**
 * Wall putty quantity.
 *
 * Putty makers publish coverage as an area PER KILO FOR TWO COATS, because two
 * coats is the specified system. Everything here is derived from that published
 * figure so the answer matches the number printed on the bag:
 *
 *   per-coat coverage = published two-coat coverage x 2
 *   kilos            = area x coats / (per-coat coverage x surface factor)
 *
 * White-cement putty is a dry powder gauged with water on site; ready-mix
 * acrylic putty comes wet and needs none.
 */

/**
 * Published coverages are the manufacturer figures for a smooth plastered
 * surface: white-cement wall putty is quoted at 20-22 sq ft per kg in two
 * coats (21 is the midpoint), ready-mix acrylic putty at 30-35 sq ft per kg.
 */
export const PUTTY_TYPES = [
  {
    id: "white-cement",
    label: "White cement wall putty (powder, mix with water)",
    twoCoatCoverageSqftPerKg: 21,
    /** Gauging water is about 38% of the putty weight; 1 kg of water = 1 litre. */
    waterRatioByWeight: 0.38,
    packSizes: [40, 20, 5, 1],
    note: "Dry powder. Mix only what you can apply in about 20 minutes before it stiffens.",
  },
  {
    id: "acrylic",
    label: "Ready-mix acrylic putty (interior, no water)",
    twoCoatCoverageSqftPerKg: 32,
    waterRatioByWeight: 0,
    packSizes: [20, 5, 1],
    note: "Supplied wet and applied thinner, so it goes further per kilo but costs more per kilo.",
  },
];

/** Multipliers on the smooth-plaster coverage for the substrate you actually have. */
export const SURFACE_FACTORS = [
  {
    id: "gypsum",
    label: "Gypsum / POP plastered surface",
    factor: 1.15,
    note: "Already flat, so putty is only skimmed on.",
  },
  {
    id: "repaint",
    label: "Sound old paint, sanded and cleaned",
    factor: 1.1,
    note: "Non-absorbent, so less putty is drawn into the wall.",
  },
  {
    id: "smooth-plaster",
    label: "Smooth cement plaster",
    factor: 1.0,
    note: "The reference surface the bag coverage is quoted against.",
  },
  {
    id: "uneven-plaster",
    label: "Slightly uneven plaster",
    factor: 0.75,
    note: "Extra putty goes into levelling rather than into the film.",
  },
  {
    id: "rough-plaster",
    label: "Rough or wavy plaster",
    factor: 0.58,
    note: "Deep hollows are cheaper to fix with plaster than with putty.",
  },
];

/** Trowel, board and hardened-in-the-bucket losses. */
export const DEFAULT_WASTAGE_PERCENT = 5;

/** Sanity ceiling so a mistyped dimension cannot produce a nonsense answer. */
export const MAX_AREA_SQFT = 200000;

const INF = 0x7fffffff;
const EMPTY_PLAN = { packs: [], totalUnits: 0, totalPacks: 0 };

function packTable(sizes, limit) {
  const best = new Int32Array(limit + 1).fill(INF);
  const pick = new Int32Array(limit + 1).fill(-1);
  best[0] = 0;
  for (let i = 1; i <= limit; i += 1) {
    for (let k = 0; k < sizes.length; k += 1) {
      const size = sizes[k];
      if (size > i) continue;
      const previous = best[i - size];
      if (previous !== INF && previous + 1 < best[i]) {
        best[i] = previous + 1;
        pick[i] = k;
      }
    }
  }
  return { best, pick };
}

function unwind(sizes, pick, total) {
  const counts = new Map();
  let cursor = total;
  while (cursor > 0 && pick[cursor] >= 0) {
    const size = sizes[pick[cursor]];
    counts.set(size, (counts.get(size) || 0) + 1);
    cursor -= size;
  }
  const packs = Array.from(counts.entries())
    .map(([size, count]) => ({ size, count, units: size * count }))
    .sort((a, b) => b.size - a.size);
  return {
    packs,
    totalUnits: total,
    totalPacks: packs.reduce((sum, row) => sum + row.count, 0),
  };
}

/** Least material bought: the smallest whole-kilo total at or above the need. */
export function planBags(kilosNeeded, packSizes) {
  const target = Math.ceil(Number(kilosNeeded));
  if (!Number.isFinite(target) || target <= 0 || !packSizes || packSizes.length === 0) {
    return { ...EMPTY_PLAN };
  }
  const sizes = packSizes.slice().sort((a, b) => b - a);
  const { pick } = packTable(sizes, target);
  return unwind(sizes, pick, target);
}

/** Fewest bags to carry: may overshoot by up to one bag of the largest size. */
export function planFewestBags(kilosNeeded, packSizes) {
  const target = Math.ceil(Number(kilosNeeded));
  if (!Number.isFinite(target) || target <= 0 || !packSizes || packSizes.length === 0) {
    return { ...EMPTY_PLAN };
  }
  const sizes = packSizes.slice().sort((a, b) => b - a);
  const limit = target + sizes[0];
  const { best, pick } = packTable(sizes, limit);
  let chosen = target;
  for (let i = target; i <= limit; i += 1) {
    if (best[i] === INF) continue;
    if (best[chosen] === INF || best[i] < best[chosen]) chosen = i;
  }
  if (best[chosen] === INF) return { ...EMPTY_PLAN };
  return unwind(sizes, pick, chosen);
}

const puttyFor = (id) => PUTTY_TYPES.find((entry) => entry.id === id);
const surfaceFor = (id) => SURFACE_FACTORS.find((entry) => entry.id === id);

/**
 * @param {object} input
 * @param {"room"|"area"} input.mode      How the surface is described.
 * @param {number} input.lengthFt         Room length, feet.
 * @param {number} input.widthFt          Room width, feet.
 * @param {number} input.heightFt         Wall height, feet.
 * @param {boolean} input.includeCeiling  Putty the ceiling as well as the walls.
 * @param {number} input.directAreaSqft   Surface area entered directly.
 * @param {number} input.openingsSqft     Doors and windows to deduct.
 * @param {number} input.coats            Number of putty coats.
 * @param {string} input.puttyType        Id from PUTTY_TYPES.
 * @param {string} input.surface          Id from SURFACE_FACTORS.
 * @param {number} input.wastagePercent   Trowel and setting losses.
 * @param {number} input.pricePerKg       Putty price, INR per kg.
 */
export function computePutty({
  mode = "room",
  lengthFt = 0,
  widthFt = 0,
  heightFt = 0,
  includeCeiling = false,
  directAreaSqft = 0,
  openingsSqft = 0,
  coats = 2,
  puttyType = "white-cement",
  surface = "smooth-plaster",
  wastagePercent = DEFAULT_WASTAGE_PERCENT,
  pricePerKg = 0,
} = {}) {
  const n = {
    lengthFt: Number(lengthFt),
    widthFt: Number(widthFt),
    heightFt: Number(heightFt),
    directAreaSqft: Number(directAreaSqft),
    openingsSqft: Number(openingsSqft),
    coats: Number(coats),
    wastagePercent: Number(wastagePercent),
    pricePerKg: Number(pricePerKg),
  };

  const relevant =
    mode === "area"
      ? ["directAreaSqft", "openingsSqft", "coats", "wastagePercent", "pricePerKg"]
      : [
          "lengthFt",
          "widthFt",
          "heightFt",
          "openingsSqft",
          "coats",
          "wastagePercent",
          "pricePerKg",
        ];

  if (relevant.some((key) => !Number.isFinite(n[key]))) {
    return { error: "Enter a valid number in every field." };
  }
  if (relevant.some((key) => n[key] < 0)) {
    return { error: "Dimensions, wastage and price cannot be negative." };
  }

  let wallArea = 0;
  let ceilingArea = 0;
  let grossArea = 0;

  if (mode === "area") {
    grossArea = n.directAreaSqft;
  } else {
    if (!(n.lengthFt > 0) || !(n.widthFt > 0) || !(n.heightFt > 0)) {
      return { error: "Room length, width and wall height must all be greater than zero." };
    }
    wallArea = 2 * (n.lengthFt + n.widthFt) * n.heightFt;
    ceilingArea = includeCeiling ? n.lengthFt * n.widthFt : 0;
    grossArea = wallArea + ceilingArea;
  }

  if (!(grossArea > 0)) {
    return { error: "Enter a surface area greater than zero." };
  }
  if (grossArea > MAX_AREA_SQFT) {
    return { error: "That area looks unrealistic — check the units, they should be feet." };
  }
  if (n.openingsSqft >= grossArea) {
    return { error: "Openings cannot be larger than the surface being puttied." };
  }
  if (!(n.coats >= 1) || n.coats > 4) {
    return { error: "Wall putty is applied in 1 to 4 coats — two is the standard system." };
  }
  if (n.wastagePercent > 50) {
    return { error: "A wastage allowance above 50% is not a realistic estimate." };
  }

  const type = puttyFor(puttyType) || puttyFor("white-cement");
  const surfaceEntry = surfaceFor(surface) || surfaceFor("smooth-plaster");

  const netArea = grossArea - n.openingsSqft;
  // Published coverage is for two coats, so a single coat goes twice as far.
  const perCoatCoverage = type.twoCoatCoverageSqftPerKg * 2 * surfaceEntry.factor;
  const kilosBare = (netArea * n.coats) / perCoatCoverage;
  const kilosNeeded = kilosBare * (1 + n.wastagePercent / 100);

  const plan = planBags(kilosNeeded, type.packSizes);
  const compact = planFewestBags(kilosNeeded, type.packSizes);
  const materialCost = plan.totalUnits * n.pricePerKg;

  return {
    wallArea,
    ceilingArea,
    grossArea,
    openings: n.openingsSqft,
    netArea,
    coats: n.coats,
    typeLabel: type.label,
    typeNote: type.note,
    surfaceLabel: surfaceEntry.label,
    surfaceNote: surfaceEntry.note,
    perCoatCoverage,
    coveragePerKgAtThisSpec: kilosNeeded > 0 ? netArea / kilosNeeded : 0,
    kilosBare,
    kilosNeeded,
    bags: plan.packs,
    purchasedKilos: plan.totalUnits,
    totalBags: plan.totalPacks,
    spareKilos: plan.totalUnits - kilosNeeded,
    compactBags: compact.packs,
    compactKilos: compact.totalUnits,
    compactBagCount: compact.totalPacks,
    compactCost: compact.totalUnits * n.pricePerKg,
    waterLitres: kilosNeeded * type.waterRatioByWeight,
    materialCost,
    costPerSqft: netArea > 0 ? materialCost / netArea : 0,
  };
}
