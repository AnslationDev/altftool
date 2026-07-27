/**
 * Quotation and estimate arithmetic.
 *
 * Quotation vs estimate
 * ---------------------
 * A quotation is a fixed price the customer can accept to form a contract; once accepted the
 * supplier is generally bound by it. An estimate is a considered forecast that is expected to
 * move, which is why it is presented as a range rather than a single figure. Consumer
 * protection regimes in the UK, Australia and elsewhere treat the two differently, so the
 * document should say plainly which one it is — this module models both.
 *
 * Rules implemented
 * -----------------
 * 1. Line arithmetic: gross = quantity x rate; the line discount is a percentage of gross.
 * 2. An overall discount applies to the total of the discounted lines, and is pushed back
 *    across every line pro rata before tax is worked out. Applying tax to the pre-discount
 *    figure would overstate the tax due, so the discount always comes first.
 * 3. Contingency (or builder's margin) is a percentage of the discounted net total, added as
 *    its own line so the customer can see it, and taxed at its own rate.
 * 4. Materials and labour are totalled separately, because many trades must show the split and
 *    because labour is sometimes taxed differently from goods.
 * 5. A payment schedule must add up to 100%. Amounts are rounded to the cent and the final
 *    milestone absorbs the rounding difference, so the milestones always sum exactly to the
 *    quoted total rather than being a cent or two out.
 * 6. Validity is issue date plus a whole number of days in UTC, so the answer never shifts
 *    with the reader's time zone. The date is an argument, never read from the clock.
 *
 * This is document tooling, not legal advice. Whether a document binds you as a quotation
 * depends on how it is worded and on local consumer law.
 */

/** Line kinds tracked separately on the summary. */
export const LINE_KINDS = [
  { value: "material", label: "Materials / goods" },
  { value: "labour", label: "Labour / services" },
];

/** Common validity periods offered on quotations. */
export const VALIDITY_PRESETS = [7, 14, 30, 60, 90];

/** Typical payment splits used by trades and agencies. */
export const SCHEDULE_PRESETS = [
  { name: "Deposit and balance", milestones: [{ label: "Deposit on acceptance", percent: 50 }, { label: "Balance on completion", percent: 50 }] },
  { name: "Thirds", milestones: [{ label: "On acceptance", percent: 33.34 }, { label: "On commencement", percent: 33.33 }, { label: "On completion", percent: 33.33 }] },
  { name: "30 / 40 / 30", milestones: [{ label: "Deposit", percent: 30 }, { label: "At the halfway stage", percent: 40 }, { label: "On completion", percent: 30 }] },
  { name: "Paid in full on completion", milestones: [{ label: "On completion", percent: 100 }] },
];

/** Round a money amount to the nearest cent, half away from zero. */
function roundCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundRate(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isBadNumber(value) {
  return typeof value !== "number" || !Number.isFinite(value);
}

/**
 * Total a quotation.
 *
 * @param {object} input
 * @param {Array} input.items                    [{ description, kind, quantity, unitPrice, discountPercent, taxPercent }]
 * @param {number} [input.overallDiscountPercent] Discount on the whole job, applied before tax.
 * @param {number} [input.contingencyPercent]     Contingency / margin as a % of the net total.
 * @param {number} [input.contingencyTaxPercent]  Tax rate applied to the contingency line.
 * @returns {object} totals, or { error } when the input cannot produce a real answer.
 */
export function computeQuotationTotals(input = {}) {
  const {
    items,
    overallDiscountPercent = 0,
    contingencyPercent = 0,
    contingencyTaxPercent = 0,
  } = input;

  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Add at least one line before totalling the quotation." };
  }
  if (
    isBadNumber(overallDiscountPercent) ||
    isBadNumber(contingencyPercent) ||
    isBadNumber(contingencyTaxPercent)
  ) {
    return { error: "Enter valid numbers for the overall discount, contingency and its tax rate." };
  }
  if (overallDiscountPercent < 0 || overallDiscountPercent > 100) {
    return { error: "The overall discount must be between 0% and 100%." };
  }
  if (contingencyPercent < 0 || contingencyPercent > 100) {
    return { error: "Contingency must be between 0% and 100% of the net total." };
  }
  if (contingencyTaxPercent < 0 || contingencyTaxPercent > 100) {
    return { error: "The contingency tax rate must be between 0% and 100%." };
  }

  // The overall discount is pushed back across every line before tax is worked out.
  const discountFactor = 1 - overallDiscountPercent / 100;

  const lines = [];
  let grossTotal = 0;
  let lineDiscountTotal = 0;
  let netBeforeOverall = 0;
  let netTotal = 0;
  let taxTotal = 0;
  let materialsNet = 0;
  let labourNet = 0;

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index] || {};
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    const discountPercent = Number(item.discountPercent ?? 0);
    const taxPercent = Number(item.taxPercent ?? 0);
    const label = item.description ? `"${item.description}"` : `line ${index + 1}`;

    if (isBadNumber(quantity) || isBadNumber(unitPrice) || isBadNumber(discountPercent) || isBadNumber(taxPercent)) {
      return { error: `Enter valid numbers on ${label}.` };
    }
    if (quantity < 0 || unitPrice < 0) {
      return { error: `Quantity and rate on ${label} cannot be negative.` };
    }
    if (discountPercent < 0 || discountPercent > 100) {
      return { error: `The discount on ${label} must be between 0% and 100%.` };
    }
    if (taxPercent < 0 || taxPercent > 100) {
      return { error: `The tax rate on ${label} must be between 0% and 100%.` };
    }

    const gross = quantity * unitPrice;
    const lineDiscount = gross * (discountPercent / 100);
    const netBefore = gross - lineDiscount;
    const net = netBefore * discountFactor;
    const tax = net * (taxPercent / 100);
    const kind = item.kind === "labour" ? "labour" : "material";

    grossTotal += gross;
    lineDiscountTotal += lineDiscount;
    netBeforeOverall += netBefore;
    netTotal += net;
    taxTotal += tax;
    if (kind === "labour") labourNet += net;
    else materialsNet += net;

    lines.push({
      description: item.description || `Item ${index + 1}`,
      kind,
      unit: item.unit || "unit",
      quantity,
      unitPrice: roundCents(unitPrice),
      discountPercent,
      taxPercent,
      gross: roundCents(gross),
      net: roundCents(net),
      tax: roundCents(tax),
      total: roundCents(net + tax),
    });
  }

  const overallDiscount = netBeforeOverall - netTotal;
  const contingency = netTotal * (contingencyPercent / 100);
  const contingencyTax = contingency * (contingencyTaxPercent / 100);
  const totalTax = taxTotal + contingencyTax;
  const grandTotal = netTotal + contingency + totalTax;

  return {
    lines,
    lineCount: lines.length,
    grossTotal: roundCents(grossTotal),
    lineDiscountTotal: roundCents(lineDiscountTotal),
    overallDiscountPercent,
    overallDiscount: roundCents(overallDiscount),
    totalDiscount: roundCents(lineDiscountTotal + overallDiscount),
    netTotal: roundCents(netTotal),
    materialsNet: roundCents(materialsNet),
    labourNet: roundCents(labourNet),
    labourSharePercent: netTotal > 0 ? roundRate((labourNet / netTotal) * 100) : 0,
    contingencyPercent,
    contingency: roundCents(contingency),
    contingencyTax: roundCents(contingencyTax),
    lineTax: roundCents(taxTotal),
    totalTax: roundCents(totalTax),
    grandTotal: roundCents(grandTotal),
    effectiveTaxPercent:
      netTotal + contingency > 0 ? roundRate((totalTax / (netTotal + contingency)) * 100) : 0,
  };
}

/**
 * Turn a fixed total into the range an estimate should quote.
 *
 * @param {number} total            The calculated total.
 * @param {number} variancePercent  Expected movement either side, in percent.
 * @returns {object} { low, high, spread } or { error }.
 */
export function buildEstimateRange(total, variancePercent) {
  if (isBadNumber(total) || isBadNumber(variancePercent)) {
    return { error: "Enter a valid total and variance percentage." };
  }
  if (total < 0) {
    return { error: "The total cannot be negative." };
  }
  if (variancePercent < 0 || variancePercent > 100) {
    return { error: "The variance must be between 0% and 100%." };
  }

  const low = total * (1 - variancePercent / 100);
  const high = total * (1 + variancePercent / 100);

  return {
    low: roundCents(low),
    high: roundCents(high),
    midpoint: roundCents(total),
    spread: roundCents(high - low),
    variancePercent,
  };
}

/**
 * Split a total into payment milestones. Percentages must add to 100; the final milestone
 * absorbs the rounding so the amounts sum exactly to the total.
 *
 * @param {number} total      The amount to split.
 * @param {Array} milestones  [{ label, percent }]
 * @returns {object} { milestones, total } or { error }.
 */
export function buildPaymentSchedule(total, milestones) {
  if (isBadNumber(total) || total < 0) {
    return { error: "Enter a valid, non-negative total to split into payments." };
  }
  if (!Array.isArray(milestones) || milestones.length === 0) {
    return { error: "Add at least one payment milestone." };
  }

  let sum = 0;
  for (const milestone of milestones) {
    const percent = Number(milestone?.percent);
    if (isBadNumber(percent) || percent < 0 || percent > 100) {
      return { error: "Each milestone must be between 0% and 100%." };
    }
    sum += percent;
  }
  // Allow a cent of float slack so 33.34 + 33.33 + 33.33 is accepted.
  if (Math.abs(sum - 100) > 0.01) {
    return {
      error: `Payment milestones add up to ${Math.round(sum * 100) / 100}%. They must total 100%.`,
    };
  }

  const rounded = roundCents(total);
  const rows = [];
  let allocated = 0;
  for (let index = 0; index < milestones.length; index += 1) {
    const isLast = index === milestones.length - 1;
    const percent = Number(milestones[index].percent);
    const amount = isLast ? roundCents(rounded - allocated) : roundCents(rounded * (percent / 100));
    allocated = roundCents(allocated + amount);
    rows.push({
      label: milestones[index].label || `Payment ${index + 1}`,
      percent,
      amount,
    });
  }

  return { milestones: rows, total: rounded, allocated };
}

/**
 * Add a whole number of days to an ISO date in UTC, so the result is time-zone independent.
 *
 * @param {string} isoDate  Date as YYYY-MM-DD.
 * @param {number} days     Days to add.
 * @returns {object} { isoDate, days } or { error }.
 */
export function addDaysToIsoDate(isoDate, days) {
  if (typeof isoDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return { error: "Enter the date as YYYY-MM-DD." };
  }
  if (isBadNumber(days) || !Number.isInteger(days)) {
    return { error: "The validity period must be a whole number of days." };
  }
  if (days < 0 || days > 3650) {
    return { error: "The validity period must be between 0 and 3650 days." };
  }

  const [year, month, day] = isoDate.split("-").map(Number);
  const base = Date.UTC(year, month - 1, day);
  if (!Number.isFinite(base)) {
    return { error: "That is not a valid calendar date." };
  }
  const target = new Date(base + days * 24 * 60 * 60 * 1000);
  return { isoDate: target.toISOString().slice(0, 10), days };
}
