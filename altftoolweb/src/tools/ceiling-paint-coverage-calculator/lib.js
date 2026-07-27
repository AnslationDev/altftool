/**
 * Ceiling paint coverage.
 *
 *   ceiling area = length x width
 *   cove area    = room perimeter x cove drop
 *   litres       = (area x coats) / (spreading rate x ceiling factor)
 *
 * The spreading rate is the manufacturer's published figure in square feet per
 * litre per coat for a smooth, primed surface; the ceiling factor corrects it
 * for gypsum board, bare plaster or a textured finish.
 */

/**
 * Spreading rate for interior emulsion / ceiling white on smooth primed
 * plaster. Indian interior emulsion data sheets quote 130-160 sq ft per litre
 * per coat; 140 sits in the middle of that published band.
 */
export const INTERIOR_EMULSION_SPREAD_SQFT_PER_LITRE = 140;

/** Multipliers on the smooth-plaster spreading rate for each ceiling build-up. */
export const CEILING_TYPES = [
  {
    id: "gypsum",
    label: "Gypsum board or POP false ceiling (primed)",
    factor: 1.1,
    note: "The flattest, least absorbent ceiling surface, so coverage is at its best.",
  },
  {
    id: "repaint",
    label: "Repaint over sound existing paint",
    factor: 1.06,
    note: "Already sealed, so most of the paint stays on the surface.",
  },
  {
    id: "smooth-plaster",
    label: "Smooth plastered RCC slab (primed)",
    factor: 1.0,
    note: "The reference surface the published coverage is quoted against.",
  },
  {
    id: "bare-plaster",
    label: "Bare or newly plastered slab",
    factor: 0.82,
    note: "New plaster is porous; prime it first or the first coat disappears into it.",
  },
  {
    id: "textured",
    label: "Textured / popcorn / sand-finish ceiling",
    factor: 0.62,
    note: "The profile can add half as much surface again as the flat measurement.",
  },
];

/** Retail pack sizes for interior emulsion in India, in litres. */
export const PACK_SIZES_LITRES = [20, 10, 4, 1];

/**
 * Overhead rolling drips and loads the roller more heavily than wall work, so
 * the default allowance is a little higher than the 5% used on walls.
 */
export const DEFAULT_WASTAGE_PERCENT = 8;

/** Sanity ceiling on a single ceiling run. */
export const MAX_AREA_SQFT = 200000;

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

/** Least paint bought: the smallest whole-litre total at or above the need. */
export function planPacks(litresNeeded, packSizes = PACK_SIZES_LITRES) {
  const target = Math.ceil(Number(litresNeeded));
  if (!Number.isFinite(target) || target <= 0) return { ...EMPTY_PLAN };
  const sizes = packSizes.slice().sort((a, b) => b - a);
  const { pick } = packTable(sizes, target);
  return unwind(sizes, pick, target);
}

/** Fewest tins: allows overshooting by up to one extra tin of the largest size. */
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

const typeFor = (id) => CEILING_TYPES.find((entry) => entry.id === id);

/**
 * @param {object} input
 * @param {number} input.lengthFt        Room length in feet.
 * @param {number} input.widthFt         Room width in feet.
 * @param {number} input.coveDepthInches Vertical drop of the cove / cornice band.
 * @param {number} input.rooms           How many identical ceilings to paint.
 * @param {number} input.coats           Number of finish coats.
 * @param {string} input.ceilingType     Id from CEILING_TYPES.
 * @param {number} input.wastagePercent  Roller and drip allowance.
 * @param {number} input.pricePerLitre   Paint price, INR per litre.
 */
export function computeCeilingPaint({
  lengthFt = 0,
  widthFt = 0,
  coveDepthInches = 0,
  rooms = 1,
  coats = 2,
  ceilingType = "smooth-plaster",
  wastagePercent = DEFAULT_WASTAGE_PERCENT,
  pricePerLitre = 0,
} = {}) {
  const n = {
    lengthFt: Number(lengthFt),
    widthFt: Number(widthFt),
    coveDepthInches: Number(coveDepthInches),
    rooms: Number(rooms),
    coats: Number(coats),
    wastagePercent: Number(wastagePercent),
    pricePerLitre: Number(pricePerLitre),
  };

  if (Object.values(n).some((value) => !Number.isFinite(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (Object.values(n).some((value) => value < 0)) {
    return { error: "Dimensions, wastage and price cannot be negative." };
  }
  if (!(n.lengthFt > 0) || !(n.widthFt > 0)) {
    return { error: "Room length and width must both be greater than zero." };
  }
  if (!(n.rooms >= 1) || !Number.isInteger(n.rooms)) {
    return { error: "Enter the number of ceilings as a whole number, one or more." };
  }
  if (!(n.coats >= 1) || n.coats > 6) {
    return { error: "Ceilings take 1 to 6 coats — two over a primed surface is standard." };
  }
  if (n.coveDepthInches > 36) {
    return { error: "A cove drop over 36 inches is really a wall — measure it as wall area instead." };
  }
  if (n.wastagePercent > 50) {
    return { error: "A wastage allowance above 50% is not a realistic estimate." };
  }

  const flatArea = n.lengthFt * n.widthFt;
  const perimeter = 2 * (n.lengthFt + n.widthFt);
  const coveArea = perimeter * (n.coveDepthInches / 12);
  const areaPerRoom = flatArea + coveArea;
  const totalArea = areaPerRoom * n.rooms;

  if (totalArea > MAX_AREA_SQFT) {
    return { error: "That ceiling area looks unrealistic — check the units, they should be feet." };
  }

  const type = typeFor(ceilingType) || typeFor("smooth-plaster");
  const effectiveSpread = INTERIOR_EMULSION_SPREAD_SQFT_PER_LITRE * type.factor;
  const litresBare = (totalArea * n.coats) / effectiveSpread;
  const litresNeeded = litresBare * (1 + n.wastagePercent / 100);

  const plan = planPacks(litresNeeded);
  const compact = planFewestTins(litresNeeded);

  return {
    flatArea,
    perimeter,
    coveArea,
    areaPerRoom,
    totalArea,
    rooms: n.rooms,
    coats: n.coats,
    typeLabel: type.label,
    typeNote: type.note,
    effectiveSpread,
    litresBare,
    litresNeeded,
    packs: plan.packs,
    purchasedLitres: plan.totalLitres,
    totalPacks: plan.totalPacks,
    spareLitres: plan.totalLitres - litresNeeded,
    materialCost: plan.totalLitres * n.pricePerLitre,
    compactPacks: compact.packs,
    compactLitres: compact.totalLitres,
    compactTins: compact.totalPacks,
    compactCost: compact.totalLitres * n.pricePerLitre,
    costPerSqft: totalArea > 0 ? (plan.totalLitres * n.pricePerLitre) / totalArea : 0,
  };
}
