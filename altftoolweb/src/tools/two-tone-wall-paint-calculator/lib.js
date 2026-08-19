/**
 * Two-tone wall paint split at a dado line.
 *
 * A two-tone wall is one wall painted in two horizontal bands that meet at the
 * dado height d. For a room of perimeter P and wall height H:
 *
 *   lower gross = P x d
 *   upper gross = P x (H - d)
 *
 * The interesting part is the openings. A door or window is not "deducted from
 * the wall" - it is deducted from whichever band it actually sits in, and a
 * window that straddles the dado line is split between the two. Each opening
 * occupies the vertical interval [sill, sill + height], so the area removed
 * from a band spanning [a, b] is
 *
 *   width x max(0, min(sill + height, b) - max(sill, a))
 *
 * which is the ordinary overlap of two intervals. Paint volume then follows the
 * spreading rate on the tin, and each band is bought separately because the two
 * colours come in different tins.
 */

/** Whole litres the pack planner will work up to. */
export const MAX_LITRES = 2000;

/** Bounds that keep a typo from producing nonsense. */
export const MAX_DIMENSION_FT = 500;
export const MAX_WASTAGE_PCT = 30;

/**
 * Retail pack sizes for Indian decorative paint with the typical per-litre
 * premium a smaller tin carries over the 20 L rate. A 1 L tin commonly works
 * out about a third dearer per litre than the 20 L bucket.
 */
export const PACK_SIZES = [
  { litres: 20, perLitreFactor: 1.0 },
  { litres: 10, perLitreFactor: 1.05 },
  { litres: 4, perLitreFactor: 1.15 },
  { litres: 1, perLitreFactor: 1.35 },
];

/**
 * Default spreading rate for interior acrylic emulsion on a smooth puttied
 * wall, in square feet per litre per coat. Manufacturers quote roughly 130-150;
 * a darker shade over a light one, or a rough surface, will come in lower.
 */
export const DEFAULT_SPREADING_RATE = 140;

const isNum = (v) => Number.isFinite(v);

/** Overlap of the vertical interval [aLow, aHigh] with [bLow, bHigh]. */
export function intervalOverlap(aLow, aHigh, bLow, bHigh) {
  return Math.max(0, Math.min(aHigh, bHigh) - Math.max(aLow, bLow));
}

/**
 * Area an opening removes from a band spanning [bandLow, bandHigh].
 * @param {object} opening { count, widthFt, heightFt, sillFt }
 */
export function openingAreaInBand(opening, bandLow, bandHigh) {
  const count = Number(opening?.count);
  const width = Number(opening?.widthFt);
  const height = Number(opening?.heightFt);
  const sill = Number(opening?.sillFt ?? 0);
  if (![count, width, height, sill].every(isNum)) return 0;
  if (count <= 0 || width <= 0 || height <= 0 || sill < 0) return 0;
  return count * width * intervalOverlap(sill, sill + height, bandLow, bandHigh);
}

/** Cheapest set of packs supplying at least `litres`. Exact optimum by DP. */
export function planPacks(litres, basePricePerLitre) {
  const need = Math.ceil(Number(litres));
  const base = Number(basePricePerLitre);
  if (!isNum(need) || need <= 0 || !isNum(base) || base < 0) {
    return { litresBought: 0, cost: 0, packs: [] };
  }
  const target = Math.min(need, MAX_LITRES);
  const priced = PACK_SIZES.map((p) => ({
    litres: p.litres,
    unitPrice: base * p.litres * p.perLitreFactor,
  }));

  const best = new Array(target + 1).fill(Infinity);
  const choice = new Array(target + 1).fill(-1);
  best[0] = 0;
  for (let v = 1; v <= target; v += 1) {
    for (let i = 0; i < priced.length; i += 1) {
      const cost = priced[i].unitPrice + best[Math.max(0, v - priced[i].litres)];
      if (cost < best[v]) {
        best[v] = cost;
        choice[v] = i;
      }
    }
  }

  const counts = new Map();
  let litresBought = 0;
  let v = target;
  while (v > 0 && choice[v] >= 0) {
    const pack = priced[choice[v]];
    counts.set(pack.litres, (counts.get(pack.litres) ?? 0) + 1);
    litresBought += pack.litres;
    v = Math.max(0, v - pack.litres);
  }

  return {
    litresBought,
    cost: best[target],
    packs: PACK_SIZES.filter((p) => counts.has(p.litres)).map((p) => ({
      litres: p.litres,
      count: counts.get(p.litres),
    })),
  };
}

/**
 * Split a two-tone room between the two bands.
 *
 * @param {object} input
 * @param {number} input.lengthFt, input.widthFt, input.wallHeightFt
 * @param {number} input.dadoHeightFt   Height of the lower band from the floor.
 * @param {object} input.doors          { count, widthFt, heightFt }
 * @param {object} input.windows        { count, widthFt, heightFt, sillFt }
 * @param {number} input.lowerCoats, input.upperCoats
 * @param {number} input.lowerSpreadingRate, input.upperSpreadingRate
 * @param {number} input.lowerPricePerLitre, input.upperPricePerLitre
 * @param {number} input.wastagePct
 * @returns {object} band-by-band quantities and costs, or { error }.
 */
export function computeTwoTonePaint({
  lengthFt,
  widthFt,
  wallHeightFt,
  dadoHeightFt,
  doors = {},
  windows = {},
  lowerCoats = 2,
  upperCoats = 2,
  lowerSpreadingRate = DEFAULT_SPREADING_RATE,
  upperSpreadingRate = DEFAULT_SPREADING_RATE,
  lowerPricePerLitre = 0,
  upperPricePerLitre = 0,
  wastagePct = 10,
}) {
  const L = Number(lengthFt);
  const W = Number(widthFt);
  const H = Number(wallHeightFt);
  const d = Number(dadoHeightFt);
  const waste = Number(wastagePct);
  const coatsLow = Number(lowerCoats);
  const coatsUp = Number(upperCoats);
  const rateLow = Number(lowerSpreadingRate);
  const rateUp = Number(upperSpreadingRate);
  const priceLow = Number(lowerPricePerLitre);
  const priceUp = Number(upperPricePerLitre);

  if (![L, W, H, d, waste, coatsLow, coatsUp, rateLow, rateUp, priceLow, priceUp].every(isNum)) {
    return { error: "Enter valid numbers in every field." };
  }
  if (L <= 0 || W <= 0) return { error: "Room length and width must be greater than zero." };
  if (L > MAX_DIMENSION_FT || W > MAX_DIMENSION_FT || H > MAX_DIMENSION_FT) {
    return { error: `Dimensions above ${MAX_DIMENSION_FT} ft are out of range.` };
  }
  if (H <= 0) return { error: "Wall height must be greater than zero." };
  if (d <= 0) return { error: "The dado height must be greater than zero." };
  if (d >= H) return { error: "The dado line has to sit below the ceiling — reduce the dado height." };
  if (coatsLow < 1 || coatsLow > 5 || coatsUp < 1 || coatsUp > 5) {
    return { error: "Coats should be between 1 and 5 for each band." };
  }
  if (rateLow <= 0 || rateUp <= 0 || rateLow > 500 || rateUp > 500) {
    return { error: "Spreading rate should be between 1 and 500 sq ft per litre per coat." };
  }
  if (priceLow < 0 || priceUp < 0 || priceLow > 5000 || priceUp > 5000) {
    return { error: "Paint price should be between 0 and 5,000 per litre." };
  }
  if (waste < 0 || waste > MAX_WASTAGE_PCT) {
    return { error: `Wastage should be between 0% and ${MAX_WASTAGE_PCT}%.` };
  }

  const doorCount = Number(doors?.count ?? 0);
  const doorWidth = Number(doors?.widthFt);
  const doorHeight = Number(doors?.heightFt);
  if (doorCount > 0 && (!isNum(doorWidth) || doorWidth <= 0 || !isNum(doorHeight) || doorHeight <= 0)) {
    return { error: "Enter a valid door width and height, or set the door count to 0." };
  }
  if (doorCount > 0 && doorHeight > H) {
    return { error: "A door cannot be taller than the wall." };
  }

  const windowCount = Number(windows?.count ?? 0);
  const windowWidth = Number(windows?.widthFt);
  const windowHeight = Number(windows?.heightFt);
  const windowSill = Number(windows?.sillFt ?? 0);
  if (
    windowCount > 0 &&
    (!isNum(windowWidth) || windowWidth <= 0 || !isNum(windowHeight) || windowHeight <= 0 || !isNum(windowSill) || windowSill < 0)
  ) {
    return { error: "Enter a valid window width, height and sill, or set the window count to 0." };
  }
  if (windowCount > 0 && windowSill + windowHeight > H) {
    return { error: "The window top sits above the ceiling — check the sill height." };
  }

  const perimeter = 2 * (L + W);
  const doorSpec = { ...doors, sillFt: 0 };

  const bands = [
    { id: "lower", label: "Lower band", low: 0, high: d, heightFt: d, coats: coatsLow, rate: rateLow, price: priceLow },
    {
      id: "upper",
      label: "Upper band",
      low: d,
      high: H,
      heightFt: H - d,
      coats: coatsUp,
      rate: rateUp,
      price: priceUp,
    },
  ].map((band) => {
    const gross = perimeter * band.heightFt;
    const doorDeduction = openingAreaInBand(doorSpec, band.low, band.high);
    const windowDeduction = openingAreaInBand(windows, band.low, band.high);
    const net = Math.max(0, gross - doorDeduction - windowDeduction);
    const litres = ((net * band.coats) / band.rate) * (1 + waste / 100);
    const plan = planPacks(litres, band.price);
    return {
      ...band,
      grossArea: gross,
      doorDeduction,
      windowDeduction,
      deduction: doorDeduction + windowDeduction,
      netArea: net,
      litres,
      litresToBuy: plan.litresBought,
      packs: plan.packs,
      cost: plan.cost,
    };
  });

  const overCapBand = bands.find((band) => band.litres > MAX_LITRES);
  if (overCapBand) {
    return {
      error: `${overCapBand.label} needs ${Math.ceil(overCapBand.litres)} L of paint, above the ${MAX_LITRES} L planning limit built into the pack calculator — split this job into smaller sections.`,
    };
  }

  const lower = bands[0];
  const upper = bands[1];
  const netArea = lower.netArea + upper.netArea;

  if (!(netArea > 0)) {
    return { error: "The openings you entered leave no wall to paint — check the sizes." };
  }

  return {
    perimeter,
    wallHeightFt: H,
    dadoHeightFt: d,
    grossArea: lower.grossArea + upper.grossArea,
    totalDeduction: lower.deduction + upper.deduction,
    netArea,
    lower,
    upper,
    bands,
    lowerSharePct: (lower.netArea / netArea) * 100,
    upperSharePct: (upper.netArea / netArea) * 100,
    totalLitres: lower.litres + upper.litres,
    totalLitresToBuy: lower.litresToBuy + upper.litresToBuy,
    totalCost: lower.cost + upper.cost,
    costPerSqft: (lower.cost + upper.cost) / netArea,
    dividerLengthFt: perimeter,
    wastagePct: waste,
  };
}
