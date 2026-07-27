/**
 * Quantity-break (bulk order) pricing.
 *
 * Volume price lists come in two shapes, and they give very different totals
 * for the same quantity. Both are implemented here:
 *
 *   FLAT (non-cumulative, "whole order at one rate")
 *     The entire order is priced at the rate of the band the quantity lands in.
 *     tiers 1-9 @ 100, 10-49 @ 90, 50+ @ 80; an order of 60 costs 60 x 80.
 *     Side effect worth knowing: the total is NOT monotonic in quantity, so
 *     ordering 50 can cost less than ordering 48. The next-break finder below
 *     surfaces exactly those cases.
 *
 *   GRADUATED (cumulative, slab-style, like income tax)
 *     Each unit is charged at the rate of the band that unit falls in.
 *     Same tiers, 60 units = 9 x 100 + 40 x 90 + 11 x 80 = 5,380.
 *     Always monotonic; buying more can never cost less.
 *
 * Shipping is added after the goods value, free above an optional order value,
 * and GST is charged on goods plus freight because under section 15(2)(c) of
 * the CGST Act incidental expenses such as freight charged by the supplier form
 * part of the value of supply.
 *
 * Pure and total: bad input returns { error }, never NaN.
 */

export const MODES = [
  {
    id: "flat",
    label: "Flat rate for the whole order",
    hint: "Every unit is charged at the rate of the band the quantity reaches.",
  },
  {
    id: "graduated",
    label: "Graduated, band by band",
    hint: "Each unit is charged at its own band's rate, like tax slabs.",
  },
];

/** GST rate slabs notified under the CGST Act. */
export const GST_SLABS = [0, 5, 12, 18, 28];

/** Guard against a runaway quantity making the arithmetic meaningless. */
export const MAX_QUANTITY = 10_000_000;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;
const round4 = (v) => Math.round((v + Number.EPSILON) * 10000) / 10000;

/** Validate and normalise a tier list into ascending order. */
export function normaliseTiers(tiers) {
  if (!Array.isArray(tiers) || tiers.length === 0) {
    return { error: "Add at least one price tier." };
  }

  const rows = [];
  for (const [index, tier] of tiers.entries()) {
    const minQty = tier?.minQty;
    const unitPrice = tier?.unitPrice;
    if (!isNum(minQty) || !isNum(unitPrice)) {
      return { error: `Tier ${index + 1} needs a numeric minimum quantity and unit price.` };
    }
    if (!Number.isInteger(minQty) || minQty < 1) {
      return { error: `Tier ${index + 1}'s minimum quantity must be a whole number of at least 1.` };
    }
    if (unitPrice < 0) return { error: `Tier ${index + 1}'s unit price cannot be negative.` };
    rows.push({ id: tier.id ?? `tier-${index}`, minQty, unitPrice: round2(unitPrice) });
  }

  rows.sort((a, b) => a.minQty - b.minQty);

  if (rows[0].minQty !== 1) {
    return { error: "The first tier must start at a minimum quantity of 1." };
  }
  for (let i = 1; i < rows.length; i += 1) {
    if (rows[i].minQty === rows[i - 1].minQty) {
      return { error: `Two tiers both start at quantity ${rows[i].minQty}. Each break needs its own starting quantity.` };
    }
  }

  return {
    rows: rows.map((row, index) => ({
      ...row,
      maxQty: index < rows.length - 1 ? rows[index + 1].minQty - 1 : null,
    })),
  };
}

/** Goods value for a quantity under a given mode. Assumes validated tiers. */
function goodsValue(quantity, rows, mode) {
  if (mode === "graduated") {
    const bands = [];
    let total = 0;
    for (const row of rows) {
      const bandEnd = row.maxQty === null ? quantity : Math.min(quantity, row.maxQty);
      const units = Math.max(0, bandEnd - row.minQty + 1);
      const value = round2(units * row.unitPrice);
      total = round2(total + value);
      bands.push({ ...row, units, value });
    }
    return { total, bands };
  }

  // Flat: the last tier whose minimum quantity the order reaches.
  let applied = rows[0];
  for (const row of rows) {
    if (quantity >= row.minQty) applied = row;
  }
  const total = round2(quantity * applied.unitPrice);
  return {
    total,
    applied,
    bands: rows.map((row) => ({
      ...row,
      units: row.id === applied.id ? quantity : 0,
      value: row.id === applied.id ? total : 0,
    })),
  };
}

/**
 * Price a bulk order.
 *
 * @returns {object} costed order with per-unit figures, or { error }.
 */
export function priceBulkOrder({
  quantity,
  tiers,
  mode = "flat",
  shippingFlat = 0,
  freeShippingAbove = 0,
  gstRatePct = 0,
}) {
  if (!isNum(quantity)) return { error: "Enter a valid quantity." };
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { error: "Quantity must be a whole number of at least 1." };
  }
  if (quantity > MAX_QUANTITY) {
    return { error: `Quantity is capped at ${MAX_QUANTITY.toLocaleString("en-IN")} units.` };
  }
  if (mode !== "flat" && mode !== "graduated") return { error: "Pick a pricing mode." };
  for (const [key, value] of Object.entries({ shippingFlat, freeShippingAbove, gstRatePct })) {
    if (!isNum(value)) return { error: `Enter a valid number for ${key}.` };
    if (value < 0) return { error: "Shipping and tax figures cannot be negative." };
  }
  if (gstRatePct > 100) return { error: "GST rate must be 100% or less." };

  const normalised = normaliseTiers(tiers);
  if (normalised.error) return { error: normalised.error };
  const rows = normalised.rows;

  const goods = goodsValue(quantity, rows, mode);
  const shipping =
    freeShippingAbove > 0 && goods.total >= freeShippingAbove ? 0 : round2(shippingFlat);
  const taxableValue = round2(goods.total + shipping);
  const gst = round2((taxableValue * gstRatePct) / 100);
  const total = round2(taxableValue + gst);

  const basePrice = rows[0].unitPrice;
  const undiscounted = round2(quantity * basePrice);
  const saving = round2(undiscounted - goods.total);

  // Flat pricing is not monotonic, so a bigger order can be cheaper. Find the
  // smallest quantity increase that lowers the goods value, if one exists.
  let cheaperUpgrade = null;
  if (mode === "flat") {
    for (const row of rows) {
      if (row.minQty <= quantity) continue;
      const candidate = goodsValue(row.minQty, rows, mode);
      if (candidate.total < goods.total) {
        cheaperUpgrade = {
          quantity: row.minQty,
          extraUnits: row.minQty - quantity,
          unitPrice: row.unitPrice,
          goodsValue: candidate.total,
          saves: round2(goods.total - candidate.total),
        };
        break;
      }
    }
  }

  // The next break and what reaching it would cost per unit.
  const nextTier = rows.find((row) => row.minQty > quantity) ?? null;
  const nextTierInfo = nextTier
    ? {
        minQty: nextTier.minQty,
        unitsAway: nextTier.minQty - quantity,
        unitPrice: nextTier.unitPrice,
        goodsValueAtBreak: goodsValue(nextTier.minQty, rows, mode).total,
      }
    : null;

  return {
    quantity,
    mode,
    tiers: rows,
    bands: goods.bands,
    appliedTier: goods.applied ?? null,
    goodsValue: goods.total,
    shipping,
    shippingWaived: freeShippingAbove > 0 && goods.total >= freeShippingAbove,
    taxableValue,
    gstRatePct,
    gst,
    total,
    undiscounted,
    saving,
    savingPct: undiscounted > 0 ? round2((saving / undiscounted) * 100) : 0,
    effectiveUnitPriceExTax: round4(goods.total / quantity),
    effectiveUnitPriceLanded: round4(total / quantity),
    nextTier: nextTierInfo,
    cheaperUpgrade,
  };
}

/**
 * Compare a set of candidate order quantities on landed cost per unit.
 * Handy for choosing between "what we need" and "what gets the better rate".
 */
export function compareQuantities({ quantities = [], ...options }) {
  if (!Array.isArray(quantities) || quantities.length === 0) {
    return { error: "Give at least one quantity to compare." };
  }
  const rows = [];
  for (const quantity of quantities) {
    const priced = priceBulkOrder({ ...options, quantity });
    if (priced.error) return { error: priced.error };
    rows.push({
      quantity,
      total: priced.total,
      goodsValue: priced.goodsValue,
      effectiveUnitPriceLanded: priced.effectiveUnitPriceLanded,
    });
  }
  const best = rows.reduce((low, row) =>
    row.effectiveUnitPriceLanded < low.effectiveUnitPriceLanded ? row : low,
  );
  return { rows, bestQuantity: best.quantity };
}
