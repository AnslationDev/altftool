/**
 * Painting cost per square foot, Indian residential practice.
 *
 * The all-in cost of a paint job is
 *
 *   total = paint + primer + putty + labour
 *   costPerSqft = total / paintableArea
 *
 * Paint volume comes from the spreading rate printed on the tin:
 *
 *   litres = area x coats / spreadingRate      (spreading rate in sq ft per litre per coat)
 *
 * Paint is not sold by the litre though - it is sold in 1 L, 4 L, 10 L and
 * 20 L packs, and the per-litre price falls as the pack gets bigger. So the
 * buying cost is solved exactly with a small dynamic program that finds the
 * cheapest set of packs covering the litres needed.
 */

/** Whole litres the calculator will plan packs for. */
export const MAX_LITRES = 2000;

/** Largest paintable area accepted, in square feet. */
export const MAX_AREA_SQFT = 200000;

/**
 * Retail pack sizes for Indian decorative paint, with the typical premium a
 * smaller pack carries over the 20 L rate. A 1 L tin commonly costs about a
 * third more per litre than the 20 L bucket of the same product; these factors
 * are indicative, so compare them against your dealer's actual price list.
 */
export const PACK_SIZES = [
  { litres: 20, perLitreFactor: 1.0 },
  { litres: 10, perLitreFactor: 1.05 },
  { litres: 4, perLitreFactor: 1.15 },
  { litres: 1, perLitreFactor: 1.35 },
];

/**
 * The three quality tiers a dealer will quote for interior walls.
 * `spreadingRate` is sq ft covered by one litre in one coat on a smooth,
 * puttied surface - manufacturers quote roughly 90-110 for acrylic distemper,
 * 130-150 for a standard acrylic emulsion and 150-170 for a premium emulsion.
 * `pricePerLitre` is an indicative 20 L-pack rate in rupees and is meant to be
 * overwritten with the price you are actually being quoted.
 */
export const TIERS = [
  {
    id: "economy",
    label: "Economy",
    product: "Acrylic distemper / budget emulsion",
    spreadingRate: 100,
    pricePerLitre: 110,
  },
  {
    id: "premium",
    label: "Premium",
    product: "Acrylic interior emulsion",
    spreadingRate: 140,
    pricePerLitre: 250,
  },
  {
    id: "luxury",
    label: "Luxury",
    product: "Premium washable / low-VOC emulsion",
    spreadingRate: 160,
    pricePerLitre: 450,
  },
];

/** Water-based interior primer: about 110 sq ft per litre per coat. */
export const PRIMER_SPREADING_RATE = 110;

/** Indicative interior primer rate, rupees per litre in the 20 L pack. */
export const PRIMER_PRICE_PER_LITRE = 150;

/**
 * Wall putty coverage, square feet per kilogram for a two-coat application.
 * Datasheets for white-cement and acrylic putties quote a wide band - roughly
 * 12 to 25 sq ft per kg - because it depends on how uneven the plaster is.
 * 15 sq ft/kg is a mid-range planning figure.
 */
export const PUTTY_COVERAGE_SQFT_PER_KG = 15;

/** Putty is bagged in 20 kg and 40 kg sacks. */
export const PUTTY_BAG_KG = 20;

const isNum = (v) => Number.isFinite(v);

/**
 * Cheapest set of packs that supplies at least `litres`.
 * Exact optimum by dynamic programming over whole litres.
 *
 * @returns {{ litresBought: number, cost: number, packs: Array<{litres:number,count:number,unitPrice:number}> }}
 */
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
      const rest = Math.max(0, v - priced[i].litres);
      const cost = priced[i].unitPrice + best[rest];
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

  const packs = PACK_SIZES.filter((p) => counts.has(p.litres)).map((p) => ({
    litres: p.litres,
    count: counts.get(p.litres),
    unitPrice: base * p.litres * p.perLitreFactor,
  }));

  return { litresBought, cost: best[target], packs };
}

/**
 * Cost of painting one area at one quality tier.
 *
 * @param {object} input
 * @param {number} input.area              Paintable area, sq ft.
 * @param {number} input.coats             Coats of finish paint.
 * @param {number} input.spreadingRate     Sq ft per litre per coat.
 * @param {number} input.pricePerLitre     Finish paint, rupees per litre.
 * @param {number} input.primerCoats       0 for none.
 * @param {number} input.primerPricePerLitre
 * @param {boolean} input.includePutty
 * @param {number} input.puttyPricePerKg
 * @param {number} input.labourRatePerSqft Rupees per sq ft, all trades.
 */
export function computeTierCost({
  area,
  coats,
  spreadingRate,
  pricePerLitre,
  primerCoats = 0,
  primerPricePerLitre = PRIMER_PRICE_PER_LITRE,
  includePutty = false,
  puttyPricePerKg = 0,
  labourRatePerSqft = 0,
}) {
  const paintLitres = (area * coats) / spreadingRate;
  const paint = planPacks(paintLitres, pricePerLitre);

  const primerLitres = primerCoats > 0 ? (area * primerCoats) / PRIMER_SPREADING_RATE : 0;
  const primer =
    primerLitres > 0
      ? planPacks(primerLitres, primerPricePerLitre)
      : { litresBought: 0, cost: 0, packs: [] };

  const puttyKg = includePutty ? area / PUTTY_COVERAGE_SQFT_PER_KG : 0;
  const puttyBags = includePutty ? Math.ceil(puttyKg / PUTTY_BAG_KG) : 0;
  const puttyCost = includePutty ? puttyBags * PUTTY_BAG_KG * puttyPricePerKg : 0;

  const materialCost = paint.cost + primer.cost + puttyCost;
  const labourCost = area * labourRatePerSqft;
  const totalCost = materialCost + labourCost;

  return {
    paintLitres,
    paintLitresBought: paint.litresBought,
    paintPacks: paint.packs,
    paintCost: paint.cost,
    primerLitres,
    primerLitresBought: primer.litresBought,
    primerPacks: primer.packs,
    primerCost: primer.cost,
    puttyKg,
    puttyBags,
    puttyCost,
    materialCost,
    labourCost,
    totalCost,
    costPerSqft: totalCost / area,
    materialPerSqft: materialCost / area,
    labourPerSqft: labourCost / area,
    materialSharePct: totalCost > 0 ? (materialCost / totalCost) * 100 : 0,
  };
}

/**
 * Compare all three tiers for one job.
 *
 * @returns {object} { tiers, selected, cheapest, ... } or { error }.
 */
export function computePaintCostPerSqft({
  area,
  coats = 2,
  primerCoats = 1,
  includePutty = true,
  puttyPricePerKg = 28,
  labourRatePerSqft = 18,
  primerPricePerLitre = PRIMER_PRICE_PER_LITRE,
  tierPrices = {},
  selectedTier = "premium",
}) {
  const a = Number(area);
  const c = Number(coats);
  const pc = Number(primerCoats);
  const putty = Number(puttyPricePerKg);
  const labour = Number(labourRatePerSqft);
  const primerPrice = Number(primerPricePerLitre);

  if (![a, c, pc, putty, labour, primerPrice].every(isNum)) {
    return { error: "Enter valid numbers in every field." };
  }
  if (a <= 0) return { error: "Paintable area must be greater than zero." };
  if (a > MAX_AREA_SQFT) {
    return { error: `Paintable area above ${MAX_AREA_SQFT.toLocaleString("en-IN")} sq ft is out of range.` };
  }
  if (c < 1 || c > 5) return { error: "Number of coats should be between 1 and 5." };
  if (pc < 0 || pc > 3) return { error: "Primer coats should be between 0 and 3." };
  if (labour < 0 || labour > 500) return { error: "Labour rate should be between 0 and 500 per sq ft." };
  if (putty < 0 || putty > 500) return { error: "Putty rate should be between 0 and 500 per kg." };
  if (primerPrice < 0 || primerPrice > 5000) {
    return { error: "Primer price should be between 0 and 5,000 per litre." };
  }

  const tiers = [];
  for (const tier of TIERS) {
    const rawPrice = tierPrices[tier.id];
    const price = rawPrice === undefined || rawPrice === null || rawPrice === "" ? tier.pricePerLitre : Number(rawPrice);
    if (!isNum(price)) return { error: `Enter a valid price per litre for the ${tier.label} tier.` };
    if (price <= 0 || price > 5000) {
      return { error: `${tier.label} paint price should be between 1 and 5,000 per litre.` };
    }
    const costs = computeTierCost({
      area: a,
      coats: c,
      spreadingRate: tier.spreadingRate,
      pricePerLitre: price,
      primerCoats: pc,
      primerPricePerLitre: primerPrice,
      includePutty: Boolean(includePutty),
      puttyPricePerKg: putty,
      labourRatePerSqft: labour,
    });
    tiers.push({ ...tier, pricePerLitre: price, ...costs });
  }

  const selected = tiers.find((t) => t.id === selectedTier) ?? tiers[1] ?? tiers[0];
  const sorted = [...tiers].sort((x, y) => x.totalCost - y.totalCost);
  const cheapest = sorted[0];
  const dearest = sorted[sorted.length - 1];

  return {
    tiers,
    selected,
    cheapest,
    dearest,
    area: a,
    coats: c,
    spreadBetweenTiers: dearest.costPerSqft - cheapest.costPerSqft,
    extraOverCheapest: selected.totalCost - cheapest.totalCost,
    includePutty: Boolean(includePutty),
    primerCoats: pc,
  };
}
