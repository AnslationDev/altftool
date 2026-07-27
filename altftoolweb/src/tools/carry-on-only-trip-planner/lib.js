/**
 * Carry-on only trip planner.
 *
 * Three independent constraints decide whether a trip fits in one cabin bag,
 * and this module models each one exactly.
 *
 * 1. CAPSULE COMBINATORICS — a wardrobe of t tops and b bottoms produces
 *    t x b distinct outfits. To dress for N days you need t x b >= N while
 *    minimising t + b, the number of garments actually carried. The optimum
 *    sits near sqrt(N): seven days needs six pieces (four tops, two bottoms)
 *    producing eight outfits, not seven separate sets. This module searches
 *    every split rather than approximating, and breaks ties toward more tops,
 *    which are lighter and get dirty faster than bottoms.
 *
 * 2. THE 3-1-1 LIQUID RULE — the ICAO one-bag standard adopted by TSA, the EU
 *    and Indian security (BCAS): every container 100 ml or less, all of them
 *    inside a single transparent resealable bag of at most 1 litre, one bag
 *    per passenger. A 150 ml bottle fails even if it is half empty, because
 *    the limit is on container size, not contents. Solid formats — bar soap,
 *    solid shampoo, toothpaste tablets, stick sunscreen — fall outside the
 *    rule entirely and free up the whole of their volume.
 *
 * 3. BAG WEIGHT AND VOLUME — cabin bags have both a mass limit and a size
 *    limit, and packed clothing is bulky before it is heavy. Interior volume
 *    is derived from the stated dimensions, then discounted by a packing
 *    efficiency because no bag fills to 100%.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** ICAO / TSA / BCAS cabin liquid limits, in millilitres. */
export const LIQUID_CONTAINER_MAX_ML = 100;
export const LIQUID_BAG_MAX_ML = 1000;

/** No bag packs to 100% of its internal volume. */
export const PACKING_EFFICIENCY = 0.85;

/** Minimum sensible capsule size regardless of trip length. */
export const MIN_TOPS = 3;
export const MIN_BOTTOMS = 2;

/** Typical cabin bag allowances. Always confirm with your airline and fare. */
export const CABIN_PRESETS = {
  indianLcc: {
    label: "Indian / short-haul low cost — 55 x 35 x 25 cm, 7 kg",
    lengthCm: 55,
    widthCm: 35,
    depthCm: 25,
    weightKg: 7,
  },
  euLcc: {
    label: "European low cost — 55 x 40 x 20 cm, 10 kg",
    lengthCm: 55,
    widthCm: 40,
    depthCm: 20,
    weightKg: 10,
  },
  fullService: {
    label: "Full-service carrier — 56 x 36 x 23 cm, 8 kg",
    lengthCm: 56,
    widthCm: 36,
    depthCm: 23,
    weightKg: 8,
  },
  usDomestic: {
    label: "US domestic — 56 x 36 x 23 cm, no stated weight limit",
    lengthCm: 56,
    widthCm: 36,
    depthCm: 23,
    weightKg: 0,
  },
};

/** Toiletries, with the volume each typically takes in a decanted bottle. */
export const LIQUID_ITEMS = [
  { id: "shampoo", name: "Shampoo", ml: 100, solidSwap: "Solid shampoo bar" },
  { id: "conditioner", name: "Conditioner", ml: 100, solidSwap: "Conditioner bar" },
  { id: "shower-gel", name: "Shower gel", ml: 100, solidSwap: "Bar soap" },
  { id: "toothpaste", name: "Toothpaste", ml: 75, solidSwap: "Toothpaste tablets" },
  { id: "moisturiser", name: "Moisturiser", ml: 50, solidSwap: "Solid moisturiser stick" },
  { id: "sunscreen", name: "Sunscreen", ml: 100, solidSwap: "Stick sunscreen" },
  { id: "deodorant", name: "Roll-on deodorant", ml: 50, solidSwap: "Solid deodorant stick" },
  { id: "perfume", name: "Perfume or aftershave", ml: 30, solidSwap: "Solid perfume balm" },
  { id: "contact-solution", name: "Contact lens solution", ml: 100, solidSwap: null },
  { id: "makeup", name: "Liquid foundation or makeup", ml: 50, solidSwap: "Powder or stick formats" },
  { id: "hand-sanitiser", name: "Hand sanitiser", ml: 50, solidSwap: "Sanitising wipes" },
  { id: "shaving-gel", name: "Shaving gel", ml: 75, solidSwap: "Shaving soap" },
];

/** Packed garment weights and compressed volumes for planning. */
export const GARMENT_SPECS = {
  top: { name: "Tops", grams: 180, litres: 1.2 },
  bottom: { name: "Bottoms", grams: 350, litres: 2.2 },
  underwear: { name: "Underwear", grams: 40, litres: 0.3 },
  socks: { name: "Socks (pairs)", grams: 50, litres: 0.3 },
  sleepwear: { name: "Sleepwear", grams: 240, litres: 1.4 },
  layer: { name: "Jacket or jumper", grams: 450, litres: 3.5 },
  shoes: { name: "Shoes (pairs)", grams: 750, litres: 4.5 },
};

/** Fixed non-clothing kit: weight in grams, volume in litres. */
export const KIT_ITEMS = [
  { id: "toiletry-bag", name: "Transparent liquids bag and wash kit", grams: 500, litres: 1.5 },
  { id: "tech", name: "Charger, cable and power bank", grams: 400, litres: 0.9 },
  { id: "documents", name: "Documents, wallet and keys", grams: 200, litres: 0.4 },
  { id: "laundry", name: "Travel detergent sheets and a sink plug", grams: 60, litres: 0.2 },
  { id: "packing-cubes", name: "Packing cubes", grams: 220, litres: 0.4 },
  { id: "medication", name: "Medication and small first-aid kit", grams: 250, litres: 0.6 },
];

export const MIN_DAYS = 1;
export const MAX_DAYS = 60;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const ceil = (value) => Math.ceil(value - 1e-9);
const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Smallest capsule wardrobe covering `days` distinct outfits.
 * Exhaustive search over every bottoms count, so the answer is optimal.
 *
 * @param {number} days
 * @param {number} laundryEveryDays 0 = no laundry; otherwise outfits only need
 *        to cover one wash cycle plus a day of turnaround
 * @returns {{ tops:number, bottoms:number, outfits:number, pieces:number,
 *             outfitsNeeded:number } | { error:string }}
 */
export function minimiseCapsule(days, laundryEveryDays = 0) {
  if (!isNum(days) || days < MIN_DAYS) return { error: "Enter a trip of at least one day." };
  if (days > MAX_DAYS) return { error: `Keep the trip under ${MAX_DAYS} days.` };
  if (!isNum(laundryEveryDays) || laundryEveryDays < 0) {
    return { error: "Enter how many days between washes, or 0 for no laundry." };
  }

  const outfitsNeeded =
    laundryEveryDays > 0 ? Math.min(Math.round(days), Math.round(laundryEveryDays) + 1) : Math.round(days);

  let best = null;
  for (let bottoms = 1; bottoms <= outfitsNeeded; bottoms += 1) {
    const tops = ceil(outfitsNeeded / bottoms);
    if (tops < bottoms) break; // mirrored splits from here on
    const pieces = tops + bottoms;
    if (!best || pieces < best.pieces || (pieces === best.pieces && tops > best.tops)) {
      best = { tops, bottoms, pieces };
    }
  }

  const tops = Math.max(best.tops, MIN_TOPS);
  const bottoms = Math.max(best.bottoms, MIN_BOTTOMS);
  return {
    tops,
    bottoms,
    outfits: tops * bottoms,
    pieces: tops + bottoms,
    outfitsNeeded,
  };
}

/**
 * Audit a set of liquids against the cabin one-bag rule.
 * @param {string[]} selectedIds
 * @returns {{ items:Array, totalMl:number, capacityMl:number, fits:boolean,
 *             oversize:string[], solidSavingMl:number } | { error:string }}
 */
export function liquidsAudit(selectedIds) {
  if (!Array.isArray(selectedIds)) return { error: "Select your liquids as a list." };
  const items = [];
  let totalMl = 0;
  let solidSavingMl = 0;
  const oversize = [];

  for (const id of selectedIds) {
    const item = LIQUID_ITEMS.find((entry) => entry.id === id);
    if (!item) return { error: `Unknown toiletry: ${String(id)}.` };
    if (items.some((entry) => entry.id === item.id)) continue;
    items.push(item);
    totalMl += item.ml;
    if (item.ml > LIQUID_CONTAINER_MAX_ML) oversize.push(item.name);
    if (item.solidSwap) solidSavingMl += item.ml;
  }

  return {
    items,
    totalMl,
    capacityMl: LIQUID_BAG_MAX_ML,
    fits: totalMl <= LIQUID_BAG_MAX_ML && oversize.length === 0,
    oversize,
    solidSavingMl,
    remainingMl: LIQUID_BAG_MAX_ML - totalMl,
  };
}

/**
 * Full carry-on plan.
 *
 * @param {object} input
 * @param {number} input.days
 * @param {number} input.laundryEveryDays
 * @param {string} input.cabinPreset
 * @param {string[]} input.liquids
 * @param {boolean} input.wearBulkiestOnPlane
 * @param {number} input.extraShoePairs additional pairs packed in the bag
 * @returns {object | { error:string }}
 */
export function buildCarryOnPlan(input) {
  const {
    days,
    laundryEveryDays = 0,
    cabinPreset = "indianLcc",
    liquids = [],
    wearBulkiestOnPlane = true,
    extraShoePairs = 1,
  } = input || {};

  const preset = CABIN_PRESETS[cabinPreset];
  if (!preset) return { error: "Pick a cabin bag size." };
  if (!isNum(extraShoePairs) || extraShoePairs < 0 || extraShoePairs > 3) {
    return { error: "Enter between 0 and 3 extra pairs of shoes." };
  }

  const capsule = minimiseCapsule(days, laundryEveryDays);
  if (capsule.error) return { error: capsule.error };

  const audit = liquidsAudit(liquids);
  if (audit.error) return { error: audit.error };

  const wholeDays = Math.round(days);
  const wearDays = capsule.outfitsNeeded;

  const counts = {
    top: capsule.tops,
    bottom: capsule.bottoms,
    underwear: wearDays + 1,
    socks: Math.max(2, ceil(wearDays / 2) + 1),
    sleepwear: 1,
    layer: 1,
    shoes: 1 + Math.round(extraShoePairs),
  };

  // What you wear on the flight is not in the bag.
  const worn = wearBulkiestOnPlane
    ? { top: 1, bottom: 1, layer: 1, shoes: 1 }
    : { top: 0, bottom: 0, layer: 0, shoes: 0 };

  const clothing = Object.entries(counts).map(([key, total]) => {
    const spec = GARMENT_SPECS[key];
    const wornCount = worn[key] || 0;
    const packed = Math.max(0, total - wornCount);
    return {
      id: key,
      name: spec.name,
      total,
      worn: wornCount,
      packed,
      grams: packed * spec.grams,
      litres: round1(packed * spec.litres),
    };
  });

  let packedGrams = clothing.reduce((sum, item) => sum + item.grams, 0);
  let packedLitres = clothing.reduce((sum, item) => sum + item.packed * GARMENT_SPECS[item.id].litres, 0);

  const kit = KIT_ITEMS.map((item) => ({ ...item }));
  for (const item of kit) {
    packedGrams += item.grams;
    packedLitres += item.litres;
  }

  // Liquids ride inside the wash kit, so only their mass is added.
  packedGrams += audit.totalMl; // 1 ml of a typical toiletry weighs about 1 g

  const bagLitres = (preset.lengthCm * preset.widthCm * preset.depthCm) / 1000;
  const usableLitres = round1(bagLitres * PACKING_EFFICIENCY);
  const weightLimitKg = preset.weightKg;

  const packedKg = round1(packedGrams / 1000);
  const packedVolumeL = round1(packedLitres);

  const weightOk = weightLimitKg === 0 || packedKg <= weightLimitKg;
  const volumeOk = packedVolumeL <= usableLitres;

  return {
    capsule,
    clothing,
    kit,
    liquids: audit,
    days: wholeDays,
    wearDays,
    preset: { id: cabinPreset, ...preset },
    bagLitres: round1(bagLitres),
    usableLitres,
    packedKg,
    packedVolumeL,
    weightLimitKg,
    weightOk,
    volumeOk,
    fitsCarryOn: weightOk && volumeOk && audit.fits,
    weightSpareKg: weightLimitKg === 0 ? null : round1(weightLimitKg - packedKg),
    volumeSpareL: round1(usableLitres - packedVolumeL),
    wearBulkiestOnPlane,
  };
}
