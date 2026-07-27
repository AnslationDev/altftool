/**
 * Exterior wall paint quantity.
 *
 * Core relation used throughout the paint industry:
 *
 *   litres = paintable area (sq ft) x number of coats / spreading rate
 *
 * where the spreading rate is quoted by the manufacturer in square feet per
 * litre per coat on a smooth, primed, plastered surface. Rougher and more
 * absorbent substrates swallow more paint, so the quoted rate is scaled by a
 * surface factor before it is used.
 */

/**
 * Spreading rate for exterior acrylic emulsion on smooth plaster.
 * Indian exterior emulsion data sheets quote 100-140 sq ft per litre per coat;
 * 120 is the midpoint of that published band.
 */
export const EXTERIOR_EMULSION_SPREAD_SQFT_PER_LITRE = 120;

/**
 * Multipliers applied to the smooth-plaster spreading rate. A factor below 1
 * means the surface covers less area per litre.
 */
export const SURFACE_FACTORS = [
  {
    id: "repaint",
    label: "Repaint over sound old paint",
    factor: 1.1,
    note: "Already sealed, so the film sits on top instead of soaking in.",
  },
  {
    id: "smooth-plaster",
    label: "Smooth cement plaster (primed)",
    factor: 1.0,
    note: "The reference surface manufacturers quote coverage against.",
  },
  {
    id: "bare-cement",
    label: "Bare / new cement plaster",
    factor: 0.8,
    note: "Fresh plaster is porous and drinks the first coat.",
  },
  {
    id: "sand-faced",
    label: "Sand-faced or rough plaster",
    factor: 0.72,
    note: "The extra surface area of the grain raises consumption.",
  },
  {
    id: "textured",
    label: "Textured / exterior texture finish",
    factor: 0.58,
    note: "Deep profiles can nearly double the paint needed.",
  },
  {
    id: "exposed-brick",
    label: "Exposed brick or block work",
    factor: 0.5,
    note: "Open joints and pores are the worst case for coverage.",
  },
];

/** Retail pack sizes for exterior emulsion in India, in litres. */
export const PACK_SIZES_LITRES = [20, 10, 4, 1];

/** Brush, roller, tray and tinting losses typically add about this much. */
export const DEFAULT_WASTAGE_PERCENT = 5;

/** Sanity ceiling so a mistyped dimension cannot produce a nonsense answer. */
export const MAX_AREA_SQFT = 500000;

const factorFor = (id) => SURFACE_FACTORS.find((entry) => entry.id === id);

const INF = 0x7fffffff;

/** Minimum-tin-count table for every whole litre total up to `limit`. */
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

const EMPTY_PLAN = { packs: [], totalLitres: 0, totalPacks: 0 };

/**
 * Plan A — buy the least paint. Because a 1 litre pack exists, the smallest
 * whole-litre total at or above the requirement is ceil(needed); the search
 * then makes up that exact total with as few tins as possible.
 */
export function planPacks(litresNeeded, packSizes = PACK_SIZES_LITRES) {
  const target = Math.ceil(Number(litresNeeded));
  if (!Number.isFinite(target) || target <= 0) return { ...EMPTY_PLAN };
  const sizes = packSizes.slice().sort((a, b) => b - a);
  const { pick } = packTable(sizes, target);
  return unwind(sizes, pick, target);
}

/**
 * Plan B — carry the fewest tins home. Allows overshooting up to one extra
 * pack of the largest size, then breaks ties on the least paint bought. Big
 * tins are usually cheaper per litre, so this is often the cheaper trip.
 */
export function planFewestTins(litresNeeded, packSizes = PACK_SIZES_LITRES) {
  const target = Math.ceil(Number(litresNeeded));
  if (!Number.isFinite(target) || target <= 0) return { ...EMPTY_PLAN };
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
 * @param {object} input
 * @param {"perimeter"|"area"} input.mode      How the wall size is given.
 * @param {number} input.perimeterFt           Total running length of wall, feet.
 * @param {number} input.wallHeightFt          Wall height, feet.
 * @param {number} input.directAreaSqft        Wall area entered directly, sq ft.
 * @param {number} input.openingsSqft          Doors, windows and grilles to deduct.
 * @param {number} input.coats                 Number of finish coats.
 * @param {string} input.surface               Surface id from SURFACE_FACTORS.
 * @param {number} input.wastagePercent        Allowance for brush and tray loss.
 * @param {number} input.pricePerLitre         Emulsion price, INR per litre.
 */
export function computeExteriorPaint({
  mode = "perimeter",
  perimeterFt = 0,
  wallHeightFt = 0,
  directAreaSqft = 0,
  openingsSqft = 0,
  coats = 2,
  surface = "smooth-plaster",
  wastagePercent = DEFAULT_WASTAGE_PERCENT,
  pricePerLitre = 0,
} = {}) {
  const numbers = {
    perimeterFt: Number(perimeterFt),
    wallHeightFt: Number(wallHeightFt),
    directAreaSqft: Number(directAreaSqft),
    openingsSqft: Number(openingsSqft),
    coats: Number(coats),
    wastagePercent: Number(wastagePercent),
    pricePerLitre: Number(pricePerLitre),
  };

  const relevant =
    mode === "area"
      ? ["directAreaSqft", "openingsSqft", "coats", "wastagePercent", "pricePerLitre"]
      : ["perimeterFt", "wallHeightFt", "openingsSqft", "coats", "wastagePercent", "pricePerLitre"];

  if (relevant.some((key) => !Number.isFinite(numbers[key]))) {
    return { error: "Enter a valid number in every field." };
  }
  if (relevant.some((key) => numbers[key] < 0)) {
    return { error: "Measurements, wastage and price cannot be negative." };
  }

  const grossArea =
    mode === "area" ? numbers.directAreaSqft : numbers.perimeterFt * numbers.wallHeightFt;

  if (!(grossArea > 0)) {
    return { error: "Enter a wall size greater than zero." };
  }
  if (grossArea > MAX_AREA_SQFT) {
    return { error: "That wall area looks unrealistic — check the units, they should be feet." };
  }
  if (numbers.openingsSqft >= grossArea) {
    return { error: "Openings cannot be larger than the wall itself." };
  }
  if (!(numbers.coats >= 1) || numbers.coats > 6) {
    return { error: "Exterior emulsion is applied in 1 to 6 coats — two is the usual specification." };
  }
  if (numbers.wastagePercent > 50) {
    return { error: "A wastage allowance above 50% is not a realistic estimate." };
  }

  const surfaceEntry = factorFor(surface) || factorFor("smooth-plaster");
  const netArea = grossArea - numbers.openingsSqft;
  const effectiveSpread = EXTERIOR_EMULSION_SPREAD_SQFT_PER_LITRE * surfaceEntry.factor;
  const litresBare = (netArea * numbers.coats) / effectiveSpread;
  const litresNeeded = litresBare * (1 + numbers.wastagePercent / 100);

  const plan = planPacks(litresNeeded);
  const compactPlan = planFewestTins(litresNeeded);
  const materialCost = plan.totalLitres * numbers.pricePerLitre;

  return {
    grossArea,
    openings: numbers.openingsSqft,
    netArea,
    coats: numbers.coats,
    surfaceLabel: surfaceEntry.label,
    surfaceNote: surfaceEntry.note,
    surfaceFactor: surfaceEntry.factor,
    effectiveSpread,
    litresBare,
    litresNeeded,
    packs: plan.packs,
    purchasedLitres: plan.totalLitres,
    totalPacks: plan.totalPacks,
    spareLitres: plan.totalLitres - litresNeeded,
    compactPacks: compactPlan.packs,
    compactLitres: compactPlan.totalLitres,
    compactTins: compactPlan.totalPacks,
    compactCost: compactPlan.totalLitres * numbers.pricePerLitre,
    materialCost,
    costPerSqft: netArea > 0 ? materialCost / netArea : 0,
  };
}
