/**
 * Discount stacking and final payable price.
 *
 * Discounts applied one after another MULTIPLY, they do not add:
 *
 *   final = price x (1 - d1/100) x (1 - d2/100) x ...
 *
 * so "20% off, then an extra 10% off" is 0.8 x 0.9 = 0.72 of the price, a 28%
 * saving rather than 30%. The equivalent single discount is
 *
 *   1 - Π(1 - di/100)
 *
 * A flat rupee discount does not commute with a percentage one: taking Rs 200
 * off Rs 1,000 and then 10% leaves Rs 720, while 10% first and then Rs 200 off
 * leaves Rs 700. Order is therefore preserved exactly as entered.
 *
 * GST is charged on the transaction value AFTER a discount that is shown on the
 * face of the invoice — section 15(3)(a) of the CGST Act, 2017 — so tax here is
 * computed on the discounted price, not on the MRP.
 *
 * Every function is pure and total; bad input returns { error }.
 */

/** GST rate slabs notified under the CGST Act for goods and services. */
export const GST_SLABS = [0, 5, 12, 18, 28];

/** A percentage discount cannot exceed the whole price. */
export const MAX_DISCOUNT_PCT = 100;

export const STEP_TYPES = [
  { id: "percent", label: "% off" },
  { id: "flat", label: "Flat amount off" },
];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

/**
 * Run a price through an ordered list of discount steps, then add tax.
 *
 * @param {object} args
 * @param {number} args.price          list price before any discount
 * @param {Array}  args.steps          [{ type: 'percent'|'flat', value }] in order
 * @param {number} args.taxRatePct     GST added on the discounted price
 * @returns {object} stage-by-stage breakdown, or { error }
 */
export function applyDiscounts({ price, steps = [], taxRatePct = 0 }) {
  if (!isNum(price)) return { error: "Enter a valid list price." };
  if (price <= 0) return { error: "List price must be greater than zero." };
  if (!isNum(taxRatePct)) return { error: "Enter a valid GST rate." };
  if (taxRatePct < 0 || taxRatePct > 100) return { error: "GST rate must be between 0% and 100%." };
  if (!Array.isArray(steps)) return { error: "Discount steps must be a list." };

  let running = round2(price);
  const stages = [];
  let clampedAny = false;

  for (const [index, step] of steps.entries()) {
    const value = step?.value;
    if (!isNum(value)) return { error: `Discount ${index + 1} needs a numeric value.` };
    if (value < 0) return { error: `Discount ${index + 1} cannot be negative.` };

    if (step?.type === "percent") {
      if (value > MAX_DISCOUNT_PCT) {
        return { error: `Discount ${index + 1} cannot be more than ${MAX_DISCOUNT_PCT}%.` };
      }
      const off = round2((running * value) / 100);
      const after = round2(running - off);
      stages.push({
        id: step.id ?? `step-${index}`,
        type: "percent",
        value,
        label: step.label || `${value}% off`,
        before: running,
        off,
        after,
        clamped: false,
      });
      running = after;
    } else {
      // Flat amount. Never take the price below zero.
      const requested = round2(value);
      const off = round2(Math.min(requested, running));
      const clamped = requested > running;
      if (clamped) clampedAny = true;
      const after = round2(running - off);
      stages.push({
        id: step.id ?? `step-${index}`,
        type: "flat",
        value: requested,
        label: step.label || `${requested} off`,
        before: running,
        off,
        after,
        clamped,
      });
      running = after;
    }
  }

  const discountedPrice = round2(running);
  const totalSaved = round2(price - discountedPrice);
  const effectiveDiscountPct = round2((totalSaved / price) * 100);
  const tax = round2((discountedPrice * taxRatePct) / 100);
  const finalPayable = round2(discountedPrice + tax);
  const taxOnListPrice = round2((price * taxRatePct) / 100);

  // The naive answer people expect when percentages are added instead of multiplied.
  const naiveSumPct = round2(
    steps.reduce((sum, step) => (step?.type === "percent" ? sum + (step.value || 0) : sum), 0),
  );

  return {
    price: round2(price),
    stages,
    discountedPrice,
    totalSaved,
    effectiveDiscountPct,
    payingPct: round2(100 - effectiveDiscountPct),
    taxRatePct,
    tax,
    finalPayable,
    savedIncludingTax: round2(price + taxOnListPrice - finalPayable),
    naiveSumPct,
    stackingGapPct: round2(naiveSumPct - effectiveDiscountPct),
    clampedAny,
  };
}

/**
 * Reverse question: what discount does an observed price cut represent?
 * (list - paid) / list x 100
 */
export function discountFromPrices({ listPrice, paidPrice }) {
  if (!isNum(listPrice) || !isNum(paidPrice)) return { error: "Enter both prices as numbers." };
  if (listPrice <= 0) return { error: "List price must be greater than zero." };
  if (paidPrice < 0) return { error: "The price paid cannot be negative." };
  if (paidPrice > listPrice) {
    return { error: "The price paid is higher than the list price, so there is no discount." };
  }
  const saved = round2(listPrice - paidPrice);
  return {
    listPrice: round2(listPrice),
    paidPrice: round2(paidPrice),
    saved,
    discountPct: round2((saved / listPrice) * 100),
    paidPct: round2((paidPrice / listPrice) * 100),
  };
}

/**
 * The single discount equal to a chain of percentage discounts.
 * Useful on its own for comparing "30% off" against "20% + extra 15%".
 */
export function equivalentSingleDiscount(percentages = []) {
  if (!Array.isArray(percentages) || percentages.length === 0) {
    return { error: "Add at least one percentage discount." };
  }
  let factor = 1;
  for (const pct of percentages) {
    if (!isNum(pct)) return { error: "Every discount must be a number." };
    if (pct < 0 || pct > MAX_DISCOUNT_PCT) {
      return { error: `Each discount must be between 0% and ${MAX_DISCOUNT_PCT}%.` };
    }
    factor *= 1 - pct / 100;
  }
  return { equivalentPct: round2((1 - factor) * 100), remainingFactor: round2(factor) };
}
