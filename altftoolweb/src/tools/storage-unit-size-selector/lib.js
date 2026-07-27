/**
 * Self-storage unit sizer.
 *
 * A unit's advertised size is a floor area, but what you actually buy is a
 * volume, and only part of that volume is stackable:
 *
 *   usable cube = floor area x (ceiling height - sprinkler clearance) x access factor
 *
 * Sprinkler clearance: sprinklered storage buildings require a clear space
 * below the deflectors — 18 inches (1.5 ft) is the standard minimum applied in
 * sprinkler design and enforced by storage operators, who will make you
 * restack anything piled into it.
 *
 * Access factor: if you need to walk in and reach things, you lose an aisle and
 * cannot stack against every wall. A unit packed solid for long-term storage
 * reaches roughly 90% of the stackable cube; one you visit regularly reaches
 * about 75%; one you treat as a working store with a clear walkway is nearer
 * 60%.
 *
 * Item cubes are the standard removal-survey allowances: the packed rectangle
 * an item occupies once wrapped and stacked, not its bare footprint.
 *
 * Unit sizes are the self-storage industry's standard footprints, from a 5x5
 * locker to a 10x30 drive-up unit.
 */

/** Minimum clear space below a sprinkler deflector, in feet (18 inches). */
export const SPRINKLER_CLEARANCE_FT = 1.5;

/** Cubic feet to cubic metres (1 ft = 0.3048 m). */
export const CUFT_TO_M3 = 0.028316846592;
/** Square feet to square metres. */
export const SQFT_TO_M2 = 0.09290304;

export const CEILING_OPTIONS = [
  { id: "8", label: "8 ft — standard indoor unit", feet: 8 },
  { id: "9", label: "9 ft — taller indoor unit", feet: 9 },
  { id: "10", label: "10 ft — drive-up or warehouse bay", feet: 10 },
];

export const ACCESS_LEVELS = [
  {
    id: "solid",
    label: "Packed solid — I will not open it until I move out",
    factor: 0.9,
  },
  {
    id: "occasional",
    label: "Occasional access — a narrow path to the back",
    factor: 0.75,
  },
  {
    id: "working",
    label: "Working store — clear walkway, everything reachable",
    factor: 0.6,
  },
];

/** Standard self-storage footprints. */
export const UNITS = [
  { id: "5x5", label: "5 x 5 ft locker", widthFt: 5, depthFt: 5, holds: "A few cartons, a bicycle, seasonal decor" },
  { id: "5x10", label: "5 x 10 ft", widthFt: 5, depthFt: 10, holds: "A studio: mattress, chest of drawers, 20-30 cartons" },
  { id: "5x15", label: "5 x 15 ft", widthFt: 5, depthFt: 15, holds: "A 1 BHK without large furniture" },
  { id: "10x10", label: "10 x 10 ft", widthFt: 10, depthFt: 10, holds: "A furnished 1-2 BHK" },
  { id: "10x15", label: "10 x 15 ft", widthFt: 10, depthFt: 15, holds: "A 2-3 BHK including appliances" },
  { id: "10x20", label: "10 x 20 ft", widthFt: 10, depthFt: 20, holds: "A 3-4 BHK, or a household plus a car" },
  { id: "10x25", label: "10 x 25 ft", widthFt: 10, depthFt: 25, holds: "A large 4 BHK with garden and garage contents" },
  { id: "10x30", label: "10 x 30 ft", widthFt: 10, depthFt: 30, holds: "A villa, or business stock and equipment" },
].map((unit) => ({ ...unit, sqft: unit.widthFt * unit.depthFt }));

/** Average packed cube of a mixed moving carton, in cubic feet. */
export const AVG_CARTON_CUFT = 3.5;

/** Packed cube per item, in cubic feet. */
export const ITEMS = [
  { id: "doubleBed", label: "Double / queen bed with mattress", cuft: 60, group: "Furniture" },
  { id: "singleBed", label: "Single bed with mattress", cuft: 35, group: "Furniture" },
  { id: "wardrobe", label: "Wardrobe or almirah", cuft: 45, group: "Furniture" },
  { id: "sofa3", label: "Sofa, 3-seat", cuft: 45, group: "Furniture" },
  { id: "sofa2", label: "Sofa or loveseat, 2-seat", cuft: 30, group: "Furniture" },
  { id: "diningSet", label: "Dining table with 4 chairs", cuft: 45, group: "Furniture" },
  { id: "bookshelf", label: "Bookshelf, cabinet or showcase", cuft: 25, group: "Furniture" },
  { id: "desk", label: "Desk with chair", cuft: 20, group: "Furniture" },
  { id: "mattressExtra", label: "Spare mattress, on edge", cuft: 20, group: "Furniture" },
  { id: "fridge", label: "Refrigerator", cuft: 25, group: "Appliances" },
  { id: "washer", label: "Washing machine", cuft: 12, group: "Appliances" },
  { id: "ac", label: "AC unit, packed", cuft: 12, group: "Appliances" },
  { id: "tv", label: "Television, boxed", cuft: 8, group: "Appliances" },
  { id: "bicycle", label: "Bicycle", cuft: 15, group: "Bulky" },
  { id: "twoWheeler", label: "Scooter or motorcycle", cuft: 45, group: "Bulky" },
  { id: "treadmill", label: "Treadmill or exercise machine", cuft: 30, group: "Bulky" },
  { id: "gardenTools", label: "Garden tools and mower, bundled", cuft: 20, group: "Bulky" },
  { id: "suitcase", label: "Large suitcase", cuft: 6, group: "Bulky" },
];

const ITEM_BY_ID = Object.fromEntries(ITEMS.map((item) => [item.id, item]));

/**
 * Usable cube of a unit, given ceiling height and how much access you need.
 *
 * @returns {number} cubic feet you can actually fill.
 */
export function usableCuft(unit, ceilingFt, accessFactor) {
  const stackHeight = ceilingFt - SPRINKLER_CLEARANCE_FT;
  if (!(stackHeight > 0) || !(accessFactor > 0)) return 0;
  return unit.sqft * stackHeight * accessFactor;
}

/**
 * Pick the smallest storage unit that holds the load.
 *
 * @param {object} input
 * @param {Record<string, number>} input.counts  Item id -> quantity (0-99).
 * @param {number} input.cartons                 Cartons of any size (0-999).
 * @param {number} input.extraCuft               Anything unlisted, in cu ft (0-5000).
 * @param {string} input.ceiling                 A CEILING_OPTIONS id.
 * @param {string} input.access                  An ACCESS_LEVELS id.
 * @param {number} input.ratePerSqFt             Optional monthly rent per sq ft (0-1000).
 * @returns {object} recommendation, or { error }.
 */
export function selectStorageUnit({
  counts = {},
  cartons = 0,
  extraCuft = 0,
  ceiling = "8",
  access = "occasional",
  ratePerSqFt = 0,
} = {}) {
  const cartonCount = Number(cartons);
  const extra = Number(extraCuft);
  const rate = Number(ratePerSqFt);

  if (!Number.isFinite(cartonCount) || cartonCount < 0) return { error: "Enter 0 or more cartons." };
  if (cartonCount > 999) return { error: "Enter up to 999 cartons." };
  if (!Number.isFinite(extra) || extra < 0) return { error: "Extra volume cannot be negative." };
  if (extra > 5000) return { error: "Enter up to 5,000 cu ft of extra volume." };
  if (!Number.isFinite(rate) || rate < 0) return { error: "The monthly rate cannot be negative." };
  if (rate > 1000) return { error: "Enter a monthly rate of up to 1,000 per sq ft." };

  const ceilingOption = CEILING_OPTIONS.find((option) => option.id === ceiling);
  if (!ceilingOption) return { error: "Choose the unit's ceiling height." };

  const accessLevel = ACCESS_LEVELS.find((level) => level.id === access);
  if (!accessLevel) return { error: "Choose how much access you need to the unit." };

  const lines = [];
  let itemCuft = 0;
  for (const [id, rawQty] of Object.entries(counts)) {
    const item = ITEM_BY_ID[id];
    if (!item) continue;
    const qty = Number(rawQty);
    if (!Number.isFinite(qty) || qty < 0) return { error: `Enter 0 or more for "${item.label}".` };
    if (qty > 99) return { error: `Enter up to 99 of "${item.label}".` };
    const whole = Math.floor(qty);
    if (whole <= 0) continue;
    const cuft = whole * item.cuft;
    itemCuft += cuft;
    lines.push({ id, label: item.label, qty: whole, cuft });
  }

  const cartonCuft = Math.floor(cartonCount) * AVG_CARTON_CUFT;
  const totalCuft = itemCuft + cartonCuft + extra;
  if (totalCuft <= 0) {
    return { error: "Add at least one item, carton or extra volume to size a unit." };
  }

  const stackHeight = ceilingOption.feet - SPRINKLER_CLEARANCE_FT;
  const sized = UNITS.map((unit) => ({
    ...unit,
    usable: Math.round(usableCuft(unit, ceilingOption.feet, accessLevel.factor)),
    monthlyCost: rate > 0 ? Math.round(unit.sqft * rate) : null,
  }));

  const recommended = sized.find((unit) => unit.usable >= totalCuft) ?? null;
  const largest = sized[sized.length - 1];
  const chosen = recommended ?? largest;
  // Nothing in the range holds it: quote how many of the largest unit are needed.
  const unitsNeeded = recommended ? 1 : Math.ceil(totalCuft / largest.usable);

  const capacity = chosen.usable * unitsNeeded;
  const fillPercent = Math.round((totalCuft / capacity) * 100);
  const spareCuft = Math.round(capacity - totalCuft);

  const index = sized.findIndex((unit) => unit.id === chosen.id);
  const smaller = index > 0 && unitsNeeded === 1 ? sized[index - 1] : null;
  const shedCuft = smaller ? Math.max(0, Math.round(totalCuft - smaller.usable)) : 0;

  return {
    totalCuft: Math.round(totalCuft * 10) / 10,
    itemCuft: Math.round(itemCuft * 10) / 10,
    cartonCuft: Math.round(cartonCuft * 10) / 10,
    extraCuft: Math.round(extra * 10) / 10,
    totalM3: Math.round(totalCuft * CUFT_TO_M3 * 100) / 100,
    lines: lines.sort((a, b) => b.cuft - a.cuft),
    units: sized,
    recommended: chosen,
    fitsInOne: Boolean(recommended),
    unitsNeeded,
    fillPercent,
    spareCuft,
    smaller,
    shedCuft,
    stackHeightFt: stackHeight,
    accessLabel: accessLevel.label,
    accessFactor: accessLevel.factor,
    floorAreaSqft: chosen.sqft * unitsNeeded,
    floorAreaM2: Math.round(chosen.sqft * unitsNeeded * SQFT_TO_M2 * 10) / 10,
    monthlyCost: rate > 0 ? Math.round(chosen.sqft * unitsNeeded * rate) : null,
  };
}
