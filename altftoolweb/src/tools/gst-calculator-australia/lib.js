/**
 * Australian GST (Goods and Services Tax) maths.
 *
 * GST was introduced on 1 July 2000 by A New Tax System (Goods and Services
 * Tax) Act 1999 and has been 10% ever since.
 *
 *   Add GST:    GST = price x 10/100        -> divide by 10
 *   Remove GST: GST = price(inc) x 1/11     -> divide by 11
 *
 * The divide-by-11 rule is exact, not an approximation: if gross = net x 1.1
 * then GST = gross - gross/1.1 = gross x (1 - 10/11) = gross / 11.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** The single Australian GST rate, unchanged since 1 July 2000. */
export const GST_RATE = 10;
/** Divisor that extracts GST from a GST-inclusive price. */
export const GST_INCLUSIVE_DIVISOR = 11;

/** Treatment options that change the amount of GST charged. */
export const GST_TREATMENTS = [
  {
    id: "taxable",
    label: "Taxable (10%)",
    rate: 10,
    note: "Most goods and services sold in Australia by a GST-registered business.",
  },
  {
    id: "free",
    label: "GST-free (0%)",
    rate: 0,
    note: "Basic food, most medical and health services, education courses, childcare and exports.",
  },
  {
    id: "input-taxed",
    label: "Input taxed (0%)",
    rate: 0,
    note: "Residential rent and most financial supplies: no GST is charged and no credits are claimable.",
  },
];

/** GST registration turnover thresholds (ATO). */
export const REGISTRATION_THRESHOLD = 75000;
export const NON_PROFIT_THRESHOLD = 150000;

export const MAX_AMOUNT = 1e12;

export const CURRENCY = "AUD";
export const LOCALE = "en-AU";

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Round to whole cents. */
export function roundMoney(value) {
  if (!isNum(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * @param {object} input
 * @param {number} input.amount        figure typed in
 * @param {"add"|"remove"} input.mode  "add" treats amount as GST-exclusive, "remove" as inclusive
 * @param {number} [input.ratePercent] rate to apply; 0 for GST-free or input taxed supplies
 */
export function calculateGst({ amount, mode = "add", ratePercent = GST_RATE } = {}) {
  if (!isNum(amount)) return { error: "Enter an amount as a number." };
  if (amount < 0) return { error: "The amount cannot be negative." };
  if (amount > MAX_AMOUNT) return { error: "Enter an amount below 1,000,000,000,000." };
  if (!isNum(ratePercent) || ratePercent < 0 || ratePercent > 100) {
    return { error: "The GST rate must be between 0% and 100%." };
  }
  if (mode !== "add" && mode !== "remove") return { error: "Choose add or remove GST." };

  let net;
  let gst;
  let gross;

  if (mode === "add") {
    net = roundMoney(amount);
    gst = roundMoney((net * ratePercent) / 100);
    gross = roundMoney(net + gst);
  } else {
    gross = roundMoney(amount);
    net = roundMoney(gross / (1 + ratePercent / 100));
    gst = roundMoney(gross - net);
  }

  return {
    mode,
    ratePercent,
    net,
    gst,
    gross,
    // At the 10% rate this is exactly one eleventh of the inclusive price.
    elevenths: ratePercent === GST_RATE ? roundMoney(gross / GST_INCLUSIVE_DIVISOR) : null,
    gstShareOfGross: gross > 0 ? (gst / gross) * 100 : 0,
  };
}

/**
 * Business activity statement summary for one period.
 * G1 is total sales including GST, 1A is GST on sales, 1B is GST credits on
 * purchases, and the net amount is 1A minus 1B.
 */
export function computeBas({ salesInclGst, purchasesInclGst, gstFreeSales = 0 } = {}) {
  if (!isNum(salesInclGst) || salesInclGst < 0) {
    return { error: "Enter total sales including GST as a positive number." };
  }
  if (!isNum(purchasesInclGst) || purchasesInclGst < 0) {
    return { error: "Enter total purchases including GST as a positive number." };
  }
  if (!isNum(gstFreeSales) || gstFreeSales < 0) {
    return { error: "GST-free sales cannot be negative." };
  }
  if (gstFreeSales > salesInclGst) {
    return { error: "GST-free sales cannot exceed total sales." };
  }
  const taxableSales = salesInclGst - gstFreeSales;
  const g1 = roundMoney(salesInclGst);
  const oneA = roundMoney(taxableSales / GST_INCLUSIVE_DIVISOR);
  const oneB = roundMoney(purchasesInclGst / GST_INCLUSIVE_DIVISOR);
  const netAmount = roundMoney(oneA - oneB);
  return {
    g1,
    gstFreeSales: roundMoney(gstFreeSales),
    taxableSales: roundMoney(taxableSales),
    oneA,
    oneB,
    netAmount,
    payable: netAmount > 0,
    refund: netAmount < 0 ? Math.abs(netAmount) : 0,
  };
}

/**
 * Registration test. Businesses must register once GST turnover reaches the
 * threshold; the ATO treats reaching it, not just exceeding it, as the trigger.
 */
export function checkRegistration(turnover, nonProfit = false) {
  if (!isNum(turnover) || turnover < 0) {
    return { error: "Enter your annual GST turnover as a positive number." };
  }
  const threshold = nonProfit ? NON_PROFIT_THRESHOLD : REGISTRATION_THRESHOLD;
  const mustRegister = turnover >= threshold;
  return {
    turnover: roundMoney(turnover),
    threshold,
    nonProfit: Boolean(nonProfit),
    mustRegister,
    headroom: roundMoney(threshold - turnover),
  };
}
