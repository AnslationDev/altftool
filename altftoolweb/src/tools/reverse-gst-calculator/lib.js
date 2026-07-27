/**
 * Reverse GST (India): recover the taxable value and the tax from a GST-inclusive amount.
 *
 * The identity used is the one in section 15 of the CGST Act, 2017 — GST is charged on the
 * transaction value, so an amount that already contains tax at rate r per cent is
 *
 *     inclusive = taxableValue x (1 + r/100 + c/100)
 *
 * where c is any compensation cess levied ad valorem under the GST (Compensation to States)
 * Act, 2017. Rearranged:
 *
 *     taxableValue = inclusive / (1 + (r + c)/100)
 *
 * For an intra-state supply the tax splits equally into CGST and SGST/UTGST, sections 9(1) of
 * the CGST and SGST Acts. For an inter-state supply the whole amount is IGST, section 5(1) of
 * the IGST Act.
 */

/** GST rate slabs in common use. A custom rate is also accepted. */
export const GST_RATE_SLABS = [0, 0.25, 1, 1.5, 3, 5, 12, 18, 28];

/** Highest rate the calculator will accept, to catch typos rather than to state the law. */
export const MAX_RATE = 100;

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Section 170 of the CGST Act, 2017 — the amount of tax payable is rounded off to the
 * nearest rupee, and where the fraction is exactly fifty paise it is rounded up.
 */
export function roundTaxToRupee(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.sign(value) * Math.round(Math.abs(value));
}

/**
 * Strip GST out of a tax-inclusive amount.
 *
 * @param {object} input
 * @param {number} input.inclusiveAmount  The all-in amount printed on the bill.
 * @param {number} input.gstRate          GST rate in per cent.
 * @param {number} [input.cessRate]       Ad valorem compensation cess in per cent.
 * @param {"intra"|"inter"} [input.supplyType]
 * @returns {object} the split, or { error } for unusable input.
 */
export function reverseGst({ inclusiveAmount, gstRate, cessRate = 0, supplyType = "intra" }) {
  const inclusive = Number(inclusiveAmount);
  const rate = Number(gstRate);
  const cess = Number(cessRate);

  if (!Number.isFinite(inclusive)) return { error: "Enter the tax-inclusive amount as a number." };
  if (inclusive < 0) return { error: "The amount cannot be negative." };
  if (!Number.isFinite(rate) || rate < 0) return { error: "The GST rate cannot be negative." };
  if (rate > MAX_RATE) return { error: `The GST rate should be ${MAX_RATE}% or lower.` };
  if (!Number.isFinite(cess) || cess < 0) return { error: "The cess rate cannot be negative." };
  if (cess > MAX_RATE) return { error: `The cess rate should be ${MAX_RATE}% or lower.` };

  const combined = rate + cess;
  const taxableValue = round2(inclusive / (1 + combined / 100));
  const gstAmount = round2(taxableValue * (rate / 100));
  const cessAmount = round2(inclusive - taxableValue - gstAmount);

  const isIntra = supplyType !== "inter";
  const cgst = isIntra ? round2(gstAmount / 2) : 0;
  const sgst = isIntra ? round2(gstAmount - cgst) : 0;
  const igst = isIntra ? 0 : gstAmount;

  return {
    inclusiveAmount: round2(inclusive),
    gstRate: rate,
    cessRate: cess,
    taxableValue,
    gstAmount,
    cessAmount,
    cgst,
    sgst,
    igst,
    totalTax: round2(gstAmount + cessAmount),
    gstRoundedToRupee: roundTaxToRupee(gstAmount),
    halfRate: round2(rate / 2),
    taxSharePercent: inclusive > 0 ? round2(((gstAmount + cessAmount) / inclusive) * 100) : 0,
    baseSharePercent: inclusive > 0 ? round2(100 - ((gstAmount + cessAmount) / inclusive) * 100) : 100,
    supplyType: isIntra ? "intra" : "inter",
  };
}

/**
 * Reference table: for each slab, the divisor used to strip tax out of a gross amount and the
 * tax expressed as a percentage of the gross rather than of the base.
 */
export function rateReferenceTable(slabs = GST_RATE_SLABS) {
  return slabs
    .filter((slab) => slab > 0)
    .map((slab) => ({
      rate: slab,
      // Kept to four decimals so 0.25% shows 1.0025 rather than collapsing to 1.00.
      divisor: Math.round((1 + slab / 100) * 10000) / 10000,
      shareOfGross: round2((slab / (100 + slab)) * 100),
    }));
}

/**
 * The forward calculation, used to prove the reverse result adds back up.
 *
 * @param {{ taxableValue: number, gstRate: number, cessRate?: number }} input
 * @returns {object} the gross amount, or { error }.
 */
export function forwardGst({ taxableValue, gstRate, cessRate = 0 }) {
  const base = Number(taxableValue);
  const rate = Number(gstRate);
  const cess = Number(cessRate);

  if (!Number.isFinite(base) || base < 0) return { error: "Taxable value must be zero or more." };
  if (!Number.isFinite(rate) || rate < 0 || rate > MAX_RATE) {
    return { error: `The GST rate should be between 0% and ${MAX_RATE}%.` };
  }
  if (!Number.isFinite(cess) || cess < 0 || cess > MAX_RATE) {
    return { error: `The cess rate should be between 0% and ${MAX_RATE}%.` };
  }

  const gstAmount = round2(base * (rate / 100));
  const cessAmount = round2(base * (cess / 100));
  return {
    taxableValue: round2(base),
    gstAmount,
    cessAmount,
    inclusiveAmount: round2(base + gstAmount + cessAmount),
  };
}
