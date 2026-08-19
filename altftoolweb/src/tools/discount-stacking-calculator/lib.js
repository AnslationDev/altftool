/**
 * Discount Stacking Calculator — what a basket actually costs once every
 * percentage promo, flat coupon, card offer, shipping rule, tax and cashback
 * has been applied in the order retailers apply them.
 *
 * The two rules that decide the answer:
 *
 * 1. Percentage discounts MULTIPLY, they do not add.
 *      combined = 1 - PRODUCT(1 - p_i)
 *    20% off then a further 10% off is 1 - 0.8 x 0.9 = 28%, not 30%.
 *
 * 2. A percentage applied BEFORE a flat amount always beats the reverse.
 *      percent-first: S(1-p) - F
 *      flat-first:    (S-F)(1-p) = S(1-p) - F(1-p)
 *    flat-first minus percent-first = F x p >= 0, so the flat coupon should be
 *    the last money off. That gap is reported as the "ordering penalty".
 *
 * Everything after that is a straight sequence: card offer (percentage with a
 * cap and a minimum spend), shipping (free above a threshold), tax on the
 * discounted merchandise, then cashback, which is a rebate on the amount paid
 * rather than a reduction in it — so it lowers the effective cost, not the bill.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** GST slabs used in India (CGST+SGST combined). Source: GST Council rate schedule. */
export const TAX_PRESETS = [
  { label: "No tax (price includes it)", percent: 0 },
  { label: "GST 5%", percent: 5 },
  { label: "GST 12%", percent: 12 },
  { label: "GST 18%", percent: 18 },
  { label: "GST 28%", percent: 28 },
];

/** Default GST slab for most electronics and services. */
export const DEFAULT_TAX_PERCENT = 18;

/** Largest basket the calculator will price, to keep output readable. */
export const MAX_SUBTOTAL = 1e10;

/** Most stackable offers of one kind. */
export const MAX_OFFERS = 12;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round = (v, p = 2) => {
  const f = 10 ** p;
  return Math.round((v + Number.EPSILON) * f) / f;
};

/**
 * Combine any number of percentage discounts multiplicatively.
 *
 * @param {number[]} percents each 0-100
 * @returns {{ combinedPercent: number, factor: number } | { error: string }}
 */
export function combinePercentOffs(percents) {
  if (!Array.isArray(percents)) return { error: "Percentage offers must be a list." };
  if (percents.length > MAX_OFFERS) return { error: `Stack at most ${MAX_OFFERS} percentage offers.` };
  let factor = 1;
  for (const p of percents) {
    if (!isNum(p)) return { error: "Every percentage offer needs a number." };
    if (p < 0 || p > 100) return { error: "Percentage offers must be between 0% and 100%." };
    factor *= 1 - p / 100;
  }
  return { combinedPercent: round((1 - factor) * 100, 4), factor };
}

/**
 * Value of a percentage offer that has a cap and a minimum spend, e.g. a card
 * offer reading "10% off, up to Rs 1,500, on orders over Rs 5,000".
 *
 * @param {{ base: number, percent: number, cap: number, minSpend: number }} input
 *   cap of 0 or less means "no cap".
 * @returns {{ discount: number, capped: boolean, qualified: boolean } | { error: string }}
 */
export function cappedPercentOff({ base, percent, cap, minSpend } = {}) {
  if (!isNum(base) || base < 0) return { error: "The amount the offer applies to must be zero or more." };
  if (!isNum(percent) || percent < 0 || percent > 100) {
    return { error: "The card offer percentage must be between 0% and 100%." };
  }
  const capValue = isNum(cap) && cap > 0 ? cap : Infinity;
  const floorSpend = isNum(minSpend) && minSpend > 0 ? minSpend : 0;
  if (base < floorSpend) return { discount: 0, capped: false, qualified: false };
  const raw = (base * percent) / 100;
  const discount = Math.min(raw, capValue);
  return { discount: round(discount, 2), capped: raw > capValue, qualified: true };
}

/**
 * Price a whole basket through the full stack.
 *
 * @param {object} input
 * @param {number} input.subtotal list price of the basket before any offer
 * @param {Array<{ label?: string, percent: number }>} [input.percentOffs]
 * @param {Array<{ label?: string, amount: number }>} [input.flatOffs]
 * @param {number} [input.cardPercent]
 * @param {number} [input.cardCap] 0 = uncapped
 * @param {number} [input.cardMinSpend]
 * @param {number} [input.shippingCost]
 * @param {number} [input.freeShippingThreshold] 0 = never free
 * @param {number} [input.taxPercent]
 * @param {boolean} [input.taxOnShipping]
 * @param {number} [input.cashbackPercent]
 * @param {number} [input.cashbackCap] 0 = uncapped
 * @returns {object} priced stack or { error }
 */
export function priceStack(input = {}) {
  const {
    subtotal,
    percentOffs = [],
    flatOffs = [],
    cardPercent = 0,
    cardCap = 0,
    cardMinSpend = 0,
    shippingCost = 0,
    freeShippingThreshold = 0,
    taxPercent = 0,
    taxOnShipping = true,
    cashbackPercent = 0,
    cashbackCap = 0,
  } = input;

  if (!isNum(subtotal)) return { error: "Enter the basket subtotal as a number." };
  if (subtotal <= 0) return { error: "The basket subtotal must be greater than zero." };
  if (subtotal > MAX_SUBTOTAL) return { error: "That subtotal is too large for this calculator." };
  if (!isNum(shippingCost) || shippingCost < 0) return { error: "Shipping cost cannot be negative." };
  if (!isNum(taxPercent) || taxPercent < 0 || taxPercent > 100) {
    return { error: "The tax rate must be between 0% and 100%." };
  }
  if (!isNum(cashbackPercent) || cashbackPercent < 0 || cashbackPercent > 100) {
    return { error: "The cashback rate must be between 0% and 100%." };
  }
  if (!Array.isArray(flatOffs) || flatOffs.length > MAX_OFFERS) {
    return { error: `Stack at most ${MAX_OFFERS} flat coupons.` };
  }

  // Step 1 — percentage offers, multiplied together.
  const combined = combinePercentOffs(percentOffs.map((o) => o?.percent));
  if (combined.error) return { error: combined.error };
  const afterPercent = subtotal * combined.factor;

  // Step 2 — flat coupons, last, and never below zero.
  let flatTotal = 0;
  for (const off of flatOffs) {
    const amount = off?.amount;
    if (!isNum(amount)) return { error: "Every flat coupon needs a rupee amount." };
    if (amount < 0) return { error: "A flat coupon cannot be a negative amount." };
    flatTotal += amount;
  }
  const flatApplied = Math.min(flatTotal, afterPercent);
  const afterFlat = afterPercent - flatApplied;

  // Step 3 — card offer on the post-coupon merchandise total.
  const card = cappedPercentOff({
    base: afterFlat,
    percent: cardPercent,
    cap: cardCap,
    minSpend: cardMinSpend,
  });
  if (card.error) return { error: card.error };
  const merchandise = afterFlat - card.discount;

  // Step 4 — shipping, free at or above the threshold.
  const freeAt = isNum(freeShippingThreshold) && freeShippingThreshold > 0 ? freeShippingThreshold : Infinity;
  const shippingFree = merchandise >= freeAt;
  const shipping = shippingFree ? 0 : shippingCost;
  const shortOfFreeShipping = shippingFree || freeAt === Infinity ? 0 : round(freeAt - merchandise, 2);

  // Step 5 — tax on the discounted merchandise (and shipping if taxable).
  const taxBase = merchandise + (taxOnShipping ? shipping : 0);
  const tax = (taxBase * taxPercent) / 100;

  const payable = merchandise + shipping + tax;

  // Step 6 — cashback is a rebate on what you pay, not a price cut.
  const cashRaw = (payable * cashbackPercent) / 100;
  const cashCapValue = isNum(cashbackCap) && cashbackCap > 0 ? cashbackCap : Infinity;
  const cashback = Math.min(cashRaw, cashCapValue);
  const effective = payable - cashback;

  // Baseline: the same basket with no offers at all — shipping is still free
  // if the raw subtotal alone clears the free-shipping threshold, same rule
  // as Step 4 above.
  const baselineShipping = subtotal >= freeAt ? 0 : shippingCost;
  const baseTax = ((subtotal + (taxOnShipping ? baselineShipping : 0)) * taxPercent) / 100;
  const baseline = subtotal + baselineShipping + baseTax;
  const saved = baseline - effective;

  // The penalty you would pay by letting the flat coupon go first.
  const orderingPenalty = flatApplied * (combined.combinedPercent / 100);

  return {
    subtotal: round(subtotal, 2),
    combinedPercent: combined.combinedPercent,
    percentDiscount: round(subtotal - afterPercent, 2),
    afterPercent: round(afterPercent, 2),
    flatDiscount: round(flatApplied, 2),
    flatRequested: round(flatTotal, 2),
    flatWasted: round(flatTotal - flatApplied, 2),
    afterFlat: round(afterFlat, 2),
    cardDiscount: card.discount,
    cardCapped: card.capped,
    cardQualified: card.qualified,
    merchandise: round(merchandise, 2),
    shipping: round(shipping, 2),
    shippingFree,
    shortOfFreeShipping,
    tax: round(tax, 2),
    payable: round(payable, 2),
    cashback: round(cashback, 2),
    cashbackCapped: cashRaw > cashCapValue,
    effective: round(effective, 2),
    baseline: round(baseline, 2),
    saved: round(saved, 2),
    savedPercent: round((saved / baseline) * 100, 2),
    effectiveDiscountPercent: round(((subtotal - merchandise) / subtotal) * 100, 2),
    orderingPenalty: round(orderingPenalty, 2),
  };
}

/**
 * Per-step ledger for display, derived entirely from priceStack's output.
 *
 * @param {ReturnType<typeof priceStack>} stack
 * @returns {Array<{ label: string, delta: number, running: number }>}
 */
export function stackLedger(stack) {
  if (!stack || stack.error) return [];
  const steps = [
    { label: "Basket subtotal", delta: stack.subtotal, running: stack.subtotal },
    { label: `Percentage offers (${stack.combinedPercent}% combined)`, delta: -stack.percentDiscount, running: stack.afterPercent },
    { label: "Flat coupons", delta: -stack.flatDiscount, running: stack.afterFlat },
    { label: "Card offer", delta: -stack.cardDiscount, running: stack.merchandise },
    { label: stack.shippingFree ? "Shipping (free)" : "Shipping", delta: stack.shipping, running: round(stack.merchandise + stack.shipping, 2) },
    { label: "Tax", delta: stack.tax, running: stack.payable },
    { label: "Cashback returned", delta: -stack.cashback, running: stack.effective },
  ];
  return steps;
}
