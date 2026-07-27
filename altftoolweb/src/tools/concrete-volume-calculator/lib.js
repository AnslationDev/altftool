/**
 * Concrete volume and material take-off.
 *
 * Wet (placed) volume comes from the geometry of the member:
 *   rectangular  V = L x W x D
 *   circular     V = pi x (d/2)^2 x h
 *   trapezoidal  V = h/3 x (A1 + A2 + sqrt(A1 x A2))   (frustum of a pyramid)
 *
 * Dry material volume is larger than the placed volume because cement, sand and
 * aggregate lose their voids once mixed and compacted. Indian site practice uses
 * a dry-volume factor of about 1.54 (IS 456 mix-design practice; the commonly
 * quoted band is 1.52-1.57).
 *
 * Each ingredient is then its share of the nominal mix ratio:
 *   cement volume = dry volume x cement part / sum of parts
 * and cement bags = cement volume / 0.0347 m3, because one 50 kg bag of cement
 * occupies 50 / 1440 = 0.03472 m3 at a bulk density of 1440 kg/m3.
 */

/** IS 456:2000 nominal mix proportions, cement : fine aggregate : coarse aggregate. */
export const MIX_RATIOS = [
  { grade: "M5", cement: 1, sand: 5, aggregate: 10, use: "Levelling course, non-structural fill" },
  { grade: "M7.5", cement: 1, sand: 4, aggregate: 8, use: "Blinding, mass filling" },
  { grade: "M10", cement: 1, sand: 3, aggregate: 6, use: "PCC bed under footings" },
  { grade: "M15", cement: 1, sand: 2, aggregate: 4, use: "Plain concrete, kerbs, flooring base" },
  { grade: "M20", cement: 1, sand: 1.5, aggregate: 3, use: "Slabs, beams, columns in houses" },
  { grade: "M25", cement: 1, sand: 1, aggregate: 2, use: "RCC frames, higher-load members" },
];

/** Bulking allowance from placed (wet) volume to loose dry ingredient volume. */
export const DRY_VOLUME_FACTOR = 1.54;

/** One bag of OPC cement in India. */
export const CEMENT_BAG_KG = 50;

/** Bulk density of bagged cement, kg per m3 (IS 269 handling data). */
export const CEMENT_DENSITY_KG_M3 = 1440;

/** Volume occupied by one 50 kg cement bag, m3. */
export const CEMENT_BAG_VOLUME_M3 = CEMENT_BAG_KG / CEMENT_DENSITY_KG_M3;

/** Loose bulk density of dry river sand, kg per m3 (IS 2386 typical value). */
export const SAND_DENSITY_KG_M3 = 1600;

/** Loose bulk density of 20 mm crushed coarse aggregate, kg per m3. */
export const AGGREGATE_DENSITY_KG_M3 = 1500;

/** Density of normal-weight concrete for self-weight, kg per m3 (IS 875 Part 1). */
export const CONCRETE_DENSITY_KG_M3 = 2400;

/** 1 cubic metre in cubic feet. */
export const CFT_PER_M3 = 35.3146667;

/** Length unit conversions into metres. */
export const LENGTH_UNITS = [
  { id: "m", label: "metre (m)", toMetre: 1 },
  { id: "cm", label: "centimetre (cm)", toMetre: 0.01 },
  { id: "mm", label: "millimetre (mm)", toMetre: 0.001 },
  { id: "ft", label: "foot (ft)", toMetre: 0.3048 },
  { id: "in", label: "inch (in)", toMetre: 0.0254 },
];

export const SHAPES = [
  { id: "rectangular", label: "Rectangular (slab, beam, footing, square column)" },
  { id: "circular", label: "Circular column / pile" },
  { id: "trapezoidal", label: "Trapezoidal (sloped footing)" },
];

/** Typical water-cement ratio band for nominal mixes without a plasticiser. */
export const DEFAULT_WATER_CEMENT_RATIO = 0.5;

function toMetres(value, unitId) {
  const unit = LENGTH_UNITS.find((entry) => entry.id === unitId);
  if (!unit) return NaN;
  return value * unit.toMetre;
}

/** Placed volume of one member, in cubic metres. */
export function memberVolume({ shape, unit, length, width, depth, diameter, topLength, topWidth }) {
  const L = toMetres(Number(length), unit);
  const W = toMetres(Number(width), unit);
  const D = toMetres(Number(depth), unit);

  if (shape === "circular") {
    const d = toMetres(Number(diameter), unit);
    if (!(d > 0) || !(D > 0)) return NaN;
    return Math.PI * (d / 2) * (d / 2) * D;
  }
  if (shape === "trapezoidal") {
    const tl = toMetres(Number(topLength), unit);
    const tw = toMetres(Number(topWidth), unit);
    if (!(L > 0) || !(W > 0) || !(D > 0) || !(tl > 0) || !(tw > 0)) return NaN;
    const a1 = L * W;
    const a2 = tl * tw;
    return (D / 3) * (a1 + a2 + Math.sqrt(a1 * a2));
  }
  if (!(L > 0) || !(W > 0) || !(D > 0)) return NaN;
  return L * W * D;
}

/**
 * Full take-off for a concrete member.
 *
 * @param {object} input
 * @param {string} input.shape        rectangular | circular | trapezoidal
 * @param {string} input.unit         one of LENGTH_UNITS ids
 * @param {number} input.length       base length (rectangular / trapezoidal)
 * @param {number} input.width        base width
 * @param {number} input.depth        thickness or height
 * @param {number} input.diameter     circular column diameter
 * @param {number} input.topLength    top length of a sloped footing
 * @param {number} input.topWidth     top width of a sloped footing
 * @param {number} input.count        how many identical members
 * @param {string} input.grade        grade id from MIX_RATIOS
 * @param {number} input.wastagePct   extra volume ordered for spillage
 * @param {number} input.waterCementRatio
 * @returns {object} take-off, or { error }
 */
export function computeConcrete({
  shape = "rectangular",
  unit = "m",
  length,
  width,
  depth,
  diameter,
  topLength,
  topWidth,
  count = 1,
  grade = "M20",
  wastagePct = 5,
  waterCementRatio = DEFAULT_WATER_CEMENT_RATIO,
}) {
  const mix = MIX_RATIOS.find((entry) => entry.grade === grade);
  if (!mix) return { error: "Choose a concrete grade from the list." };
  if (!LENGTH_UNITS.some((entry) => entry.id === unit)) {
    return { error: "Choose a valid unit for the dimensions." };
  }

  const n = Number(count);
  const waste = Number(wastagePct);
  const wcr = Number(waterCementRatio);

  if (!Number.isFinite(n) || n < 1) return { error: "Number of members must be at least 1." };
  if (n > 10000) return { error: "Number of members must be 10,000 or fewer." };
  if (!Number.isFinite(waste) || waste < 0 || waste > 50) {
    return { error: "Wastage should be between 0% and 50%." };
  }
  if (!Number.isFinite(wcr) || wcr < 0.3 || wcr > 0.8) {
    return { error: "Water-cement ratio should be between 0.30 and 0.80." };
  }

  const one = memberVolume({ shape, unit, length, width, depth, diameter, topLength, topWidth });
  if (!Number.isFinite(one) || one <= 0) {
    return { error: "Enter every dimension as a number greater than zero." };
  }
  if (one > 100000) return { error: "That member is unrealistically large — check the unit you picked." };

  const netVolume = one * n;
  const wetVolume = netVolume * (1 + waste / 100);
  const dryVolume = wetVolume * DRY_VOLUME_FACTOR;

  const totalParts = mix.cement + mix.sand + mix.aggregate;
  const cementVolume = (dryVolume * mix.cement) / totalParts;
  const sandVolume = (dryVolume * mix.sand) / totalParts;
  const aggregateVolume = (dryVolume * mix.aggregate) / totalParts;

  const cementKg = cementVolume * CEMENT_DENSITY_KG_M3;
  const cementBags = cementVolume / CEMENT_BAG_VOLUME_M3;

  return {
    grade: mix.grade,
    ratioLabel: `1 : ${mix.sand} : ${mix.aggregate}`,
    use: mix.use,
    volumePerMember: one,
    count: n,
    netVolume,
    wetVolume,
    dryVolume,
    volumeCft: wetVolume * CFT_PER_M3,
    cementVolume,
    cementKg,
    cementBags,
    cementBagsToBuy: Math.ceil(cementBags),
    sandVolume,
    sandCft: sandVolume * CFT_PER_M3,
    sandKg: sandVolume * SAND_DENSITY_KG_M3,
    aggregateVolume,
    aggregateCft: aggregateVolume * CFT_PER_M3,
    aggregateKg: aggregateVolume * AGGREGATE_DENSITY_KG_M3,
    waterLitres: cementKg * wcr,
    selfWeightKg: netVolume * CONCRETE_DENSITY_KG_M3,
    wastagePct: waste,
    waterCementRatio: wcr,
  };
}
