/**
 * Primer quantity.
 *
 *   litres = area x coats / (spreading rate x absorbency factor)
 *
 * Spreading rates are the manufacturer figures in square feet per litre per
 * coat, measured on a smooth reference substrate with the primer thinned as
 * directed. The absorbency factor scales that rate for the substrate you are
 * actually priming: a factor below 1 means the surface drinks more primer.
 */

/**
 * Published single-coat spreading rates for the common Indian primer families,
 * taken as the midpoint of the range printed on the data sheet.
 */
export const PRIMER_TYPES = [
  {
    id: "interior-wall-wb",
    label: "Interior wall primer (water-based)",
    spreadSqftPerLitre: 110,
    range: "100-120 sq ft / L / coat",
    thinner: "clean water",
    thinPercent: [30, 50],
    packSizes: [20, 10, 4, 1],
  },
  {
    id: "exterior-wall-wb",
    label: "Exterior wall primer (water-based)",
    spreadSqftPerLitre: 100,
    range: "90-110 sq ft / L / coat",
    thinner: "clean water",
    thinPercent: [20, 30],
    packSizes: [20, 10, 4, 1],
  },
  {
    id: "cement-primer-sb",
    label: "Cement primer (solvent-based)",
    spreadSqftPerLitre: 120,
    range: "110-130 sq ft / L / coat",
    thinner: "mineral turpentine oil",
    thinPercent: [30, 40],
    packSizes: [20, 10, 4, 1],
  },
  {
    id: "wood-primer",
    label: "Wood primer",
    spreadSqftPerLitre: 110,
    range: "100-120 sq ft / L / coat",
    thinner: "mineral turpentine oil",
    thinPercent: [10, 20],
    packSizes: [20, 10, 4, 1],
  },
  {
    id: "metal-redoxide",
    label: "Red oxide metal primer",
    spreadSqftPerLitre: 100,
    range: "90-110 sq ft / L / coat",
    thinner: "mineral turpentine oil",
    thinPercent: [10, 15],
    packSizes: [20, 10, 4, 1],
  },
];

/** Absorbency multipliers on the reference spreading rate. */
export const SUBSTRATES = [
  {
    id: "metal",
    label: "Bare metal (non-absorbent)",
    factor: 1.2,
    note: "Nothing soaks in, so the whole film stays on the surface.",
  },
  {
    id: "puttied",
    label: "Puttied and sanded wall",
    factor: 1.15,
    note: "Putty has already closed most of the pores.",
  },
  {
    id: "repaint",
    label: "Sound existing paint",
    factor: 1.12,
    note: "Sealed surface — prime only where the old film is chalky or patchy.",
  },
  {
    id: "gypsum",
    label: "Gypsum board or POP",
    factor: 1.1,
    note: "Flat and only lightly absorbent.",
  },
  {
    id: "smooth-plaster",
    label: "Smooth cement plaster",
    factor: 1.0,
    note: "The reference substrate the published coverage is quoted against.",
  },
  {
    id: "wood",
    label: "Seasoned wood, plywood or MDF edge",
    factor: 0.85,
    note: "Open grain and cut edges pull primer in unevenly.",
  },
  {
    id: "bare-plaster",
    label: "New or bare cement plaster",
    factor: 0.78,
    note: "Fresh plaster is thirsty; let it cure fully before priming.",
  },
  {
    id: "porous-block",
    label: "AAC block, brick or rough masonry",
    factor: 0.6,
    note: "The worst case — open pores and joints swallow the first coat.",
  },
];

/** Brush, roller and tray losses. */
export const DEFAULT_WASTAGE_PERCENT = 5;

/** Sanity ceiling so a mistyped dimension cannot produce a nonsense answer. */
export const MAX_AREA_SQFT = 500000;

const INF = 0x7fffffff;
const EMPTY_PLAN = { packs: [], totalLitres: 0, totalPacks: 0 };

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
    .map(([size, count]) => ({ size, count, litres: size * count }))
    .sort((a, b) => b.size - a.size);
  return {
    packs,
    totalLitres: total,
    totalPacks: packs.reduce((sum, row) => sum + row.count, 0),
  };
}

/** Least primer bought: the smallest whole-litre total at or above the need. */
export function planPacks(litresNeeded, packSizes) {
  const target = Math.ceil(Number(litresNeeded));
  if (!Number.isFinite(target) || target <= 0 || !packSizes || packSizes.length === 0) {
    return { ...EMPTY_PLAN };
  }
  const sizes = packSizes.slice().sort((a, b) => b - a);
  const { pick } = packTable(sizes, target);
  return unwind(sizes, pick, target);
}

/** Fewest tins: may overshoot by up to one tin of the largest size. */
export function planFewestTins(litresNeeded, packSizes) {
  const target = Math.ceil(Number(litresNeeded));
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

/**
 * Paintable surface of a rectangular room, in square feet.
 *
 *   walls   = 2 x (length + width) x height
 *   ceiling = length x width, when it is being primed too
 *
 * Openings are deducted as a flat area because door and window sizes vary.
 * Returns NaN for unusable input so the caller can show its own message.
 */
export function roomSurfaceAreaSqft({
  lengthFt = 0,
  widthFt = 0,
  heightFt = 0,
  includeCeiling = false,
  deductionsSqft = 0,
} = {}) {
  const l = Number(lengthFt);
  const w = Number(widthFt);
  const h = Number(heightFt);
  const d = Number(deductionsSqft);
  if (![l, w, h, d].every(Number.isFinite)) return NaN;
  if (l < 0 || w < 0 || h < 0 || d < 0) return NaN;
  const walls = 2 * (l + w) * h;
  const ceiling = includeCeiling ? l * w : 0;
  return walls + ceiling - d;
}

const primerFor = (id) => PRIMER_TYPES.find((entry) => entry.id === id);
const substrateFor = (id) => SUBSTRATES.find((entry) => entry.id === id);

/**
 * @param {object} input
 * @param {number} input.areaSqft       Surface to be primed, square feet.
 * @param {number} input.coats          Number of primer coats.
 * @param {string} input.primerType     Id from PRIMER_TYPES.
 * @param {string} input.substrate      Id from SUBSTRATES.
 * @param {number} input.wastagePercent Brush and tray allowance.
 * @param {number} input.pricePerLitre  Primer price, INR per litre.
 */
export function computePrimer({
  areaSqft = 0,
  coats = 1,
  primerType = "interior-wall-wb",
  substrate = "smooth-plaster",
  wastagePercent = DEFAULT_WASTAGE_PERCENT,
  pricePerLitre = 0,
} = {}) {
  const n = {
    areaSqft: Number(areaSqft),
    coats: Number(coats),
    wastagePercent: Number(wastagePercent),
    pricePerLitre: Number(pricePerLitre),
  };

  if (Object.values(n).some((value) => !Number.isFinite(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (Object.values(n).some((value) => value < 0)) {
    return { error: "Area, wastage and price cannot be negative." };
  }
  if (!(n.areaSqft > 0)) {
    return { error: "Enter an area greater than zero." };
  }
  if (n.areaSqft > MAX_AREA_SQFT) {
    return { error: "That area looks unrealistic — check the units, they should be square feet." };
  }
  if (!(n.coats >= 1) || n.coats > 4) {
    return { error: "Primer is applied in 1 to 4 coats — one full coat is the usual specification." };
  }
  if (n.wastagePercent > 50) {
    return { error: "A wastage allowance above 50% is not a realistic estimate." };
  }

  const primer = primerFor(primerType) || primerFor("interior-wall-wb");
  const surface = substrateFor(substrate) || substrateFor("smooth-plaster");

  const effectiveSpread = primer.spreadSqftPerLitre * surface.factor;
  const litresBare = (n.areaSqft * n.coats) / effectiveSpread;
  const litresNeeded = litresBare * (1 + n.wastagePercent / 100);

  const plan = planPacks(litresNeeded, primer.packSizes);
  const compact = planFewestTins(litresNeeded, primer.packSizes);
  const materialCost = plan.totalLitres * n.pricePerLitre;

  return {
    areaSqft: n.areaSqft,
    coats: n.coats,
    primerLabel: primer.label,
    primerRange: primer.range,
    thinner: primer.thinner,
    // Thinner volume is informational: the published coverage already assumes
    // the primer has been thinned as directed, so it does not change the litres
    // of concentrate you have to buy.
    thinnerMinLitres: (litresNeeded * primer.thinPercent[0]) / 100,
    thinnerMaxLitres: (litresNeeded * primer.thinPercent[1]) / 100,
    thinPercent: primer.thinPercent,
    substrateLabel: surface.label,
    substrateNote: surface.note,
    substrateFactor: surface.factor,
    baseSpread: primer.spreadSqftPerLitre,
    effectiveSpread,
    litresBare,
    litresNeeded,
    packs: plan.packs,
    purchasedLitres: plan.totalLitres,
    totalPacks: plan.totalPacks,
    spareLitres: plan.totalLitres - litresNeeded,
    compactPacks: compact.packs,
    compactLitres: compact.totalLitres,
    compactTins: compact.totalPacks,
    compactCost: compact.totalLitres * n.pricePerLitre,
    materialCost,
    costPerSqft: materialCost / n.areaSqft,
  };
}
