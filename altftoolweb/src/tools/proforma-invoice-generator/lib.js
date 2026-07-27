/**
 * Proforma invoice arithmetic and document helpers.
 *
 * What a proforma invoice is
 * --------------------------
 * A proforma invoice is a binding quotation issued before the goods ship. It is not a demand
 * for payment and cannot be used to claim input tax, but customs authorities accept it for
 * valuation and import-licence purposes, and buyers use it to open a letter of credit or
 * release an advance payment. Because it is a commitment, it carries a validity period after
 * which the quoted prices lapse.
 *
 * Rules implemented
 * -----------------
 * 1. Line arithmetic: gross = quantity x unit price; discount is a percentage of gross;
 *    the taxable value is gross less discount; tax is a percentage of the taxable value.
 *    Discount before tax is the ordinary commercial and statutory order in most VAT/GST
 *    systems, including EU VAT and Indian GST.
 * 2. Freight, insurance, packing and other charges are added after the line totals. Which of
 *    them the seller bears is fixed by the Incoterms 2020 rule quoted on the invoice — the
 *    list below records that allocation so the invoice and the trade term agree.
 * 3. Customs valuation normally uses the CIF value (goods + freight + insurance), so those
 *    two charges are reported separately from packing and other charges.
 * 4. Validity is calculated as issue date plus a whole number of days, using UTC date
 *    arithmetic so the answer never shifts with the viewer's time zone. The date is passed in
 *    rather than read from the clock, which keeps the function pure and testable.
 * 5. The grand total is spelled out in words, which banks and customs commonly require on the
 *    document. The short scale (thousand, million, billion) is used.
 *
 * This is document tooling, not legal or customs advice. Confirm the Incoterm, tax treatment
 * and any licence requirements with your freight forwarder or customs broker.
 */

/** Incoterms 2020 rules, with who carries freight and insurance to the named place. */
export const INCOTERMS_2020 = [
  { code: "EXW", name: "Ex Works", sellerPaysFreight: false, sellerPaysInsurance: false },
  { code: "FCA", name: "Free Carrier", sellerPaysFreight: false, sellerPaysInsurance: false },
  { code: "FAS", name: "Free Alongside Ship", sellerPaysFreight: false, sellerPaysInsurance: false },
  { code: "FOB", name: "Free On Board", sellerPaysFreight: false, sellerPaysInsurance: false },
  { code: "CFR", name: "Cost and Freight", sellerPaysFreight: true, sellerPaysInsurance: false },
  { code: "CIF", name: "Cost, Insurance and Freight", sellerPaysFreight: true, sellerPaysInsurance: true },
  { code: "CPT", name: "Carriage Paid To", sellerPaysFreight: true, sellerPaysInsurance: false },
  { code: "CIP", name: "Carriage and Insurance Paid To", sellerPaysFreight: true, sellerPaysInsurance: true },
  { code: "DAP", name: "Delivered At Place", sellerPaysFreight: true, sellerPaysInsurance: false },
  { code: "DPU", name: "Delivered at Place Unloaded", sellerPaysFreight: true, sellerPaysInsurance: false },
  { code: "DDP", name: "Delivered Duty Paid", sellerPaysFreight: true, sellerPaysInsurance: true },
];

/** Currencies commonly quoted on export proformas. */
export const PROFORMA_CURRENCIES = [
  { code: "USD", unit: "US Dollars", subunit: "Cents" },
  { code: "EUR", unit: "Euro", subunit: "Cents" },
  { code: "GBP", unit: "Pounds Sterling", subunit: "Pence" },
  { code: "INR", unit: "Rupees", subunit: "Paise" },
  { code: "AED", unit: "Dirhams", subunit: "Fils" },
  { code: "SGD", unit: "Singapore Dollars", subunit: "Cents" },
  { code: "AUD", unit: "Australian Dollars", subunit: "Cents" },
  { code: "CAD", unit: "Canadian Dollars", subunit: "Cents" },
];

/** Round a money amount to the nearest cent, half away from zero. */
function roundCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isBadNumber(value) {
  return typeof value !== "number" || !Number.isFinite(value);
}

/**
 * Total a proforma invoice.
 *
 * @param {object} input
 * @param {Array} input.items              [{ description, quantity, unitPrice, discountPercent, taxPercent }]
 * @param {number} [input.freight]         Freight / carriage charged to the buyer.
 * @param {number} [input.insurance]       Marine or transit insurance charged to the buyer.
 * @param {number} [input.packing]         Packing, palletising and marking charges.
 * @param {number} [input.otherCharges]    Documentation, inspection or handling charges.
 * @param {number} [input.advancePercent]  Advance payable before shipment, as a percentage.
 * @returns {object} totals, or { error } when the input cannot produce a real answer.
 */
export function computeProformaTotals(input = {}) {
  const {
    items,
    freight = 0,
    insurance = 0,
    packing = 0,
    otherCharges = 0,
    advancePercent = 0,
  } = input;

  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Add at least one line item before totalling the proforma." };
  }
  if (
    isBadNumber(freight) ||
    isBadNumber(insurance) ||
    isBadNumber(packing) ||
    isBadNumber(otherCharges) ||
    isBadNumber(advancePercent)
  ) {
    return { error: "Enter valid numbers for freight, insurance, packing, other charges and the advance." };
  }
  if (freight < 0 || insurance < 0 || packing < 0 || otherCharges < 0) {
    return { error: "Charges cannot be negative." };
  }
  if (advancePercent < 0 || advancePercent > 100) {
    return { error: "The advance must be between 0% and 100% of the invoice value." };
  }

  const lines = [];
  let subtotal = 0;
  let totalDiscount = 0;
  let taxableValue = 0;
  let totalTax = 0;

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
      return { error: `Quantity and unit price on ${label} cannot be negative.` };
    }
    if (discountPercent < 0 || discountPercent > 100) {
      return { error: `The discount on ${label} must be between 0% and 100%.` };
    }
    if (taxPercent < 0 || taxPercent > 100) {
      return { error: `The tax rate on ${label} must be between 0% and 100%.` };
    }

    const gross = quantity * unitPrice;
    const discount = gross * (discountPercent / 100);
    const net = gross - discount;
    const tax = net * (taxPercent / 100);

    subtotal += gross;
    totalDiscount += discount;
    taxableValue += net;
    totalTax += tax;

    lines.push({
      description: item.description || `Item ${index + 1}`,
      hsCode: item.hsCode || "",
      quantity,
      unit: item.unit || "pcs",
      unitPrice: roundCents(unitPrice),
      discountPercent,
      taxPercent,
      gross: roundCents(gross),
      discount: roundCents(discount),
      net: roundCents(net),
      tax: roundCents(tax),
      total: roundCents(net + tax),
    });
  }

  const chargesTotal = freight + insurance + packing + otherCharges;
  const grandTotal = taxableValue + totalTax + chargesTotal;
  const advanceDue = grandTotal * (advancePercent / 100);

  return {
    lines,
    lineCount: lines.length,
    totalQuantity: roundCents(lines.reduce((sum, line) => sum + line.quantity, 0)),
    subtotal: roundCents(subtotal),
    totalDiscount: roundCents(totalDiscount),
    taxableValue: roundCents(taxableValue),
    totalTax: roundCents(totalTax),
    freight: roundCents(freight),
    insurance: roundCents(insurance),
    packing: roundCents(packing),
    otherCharges: roundCents(otherCharges),
    chargesTotal: roundCents(chargesTotal),
    // Customs valuation is usually CIF: goods value plus freight plus insurance.
    cifValue: roundCents(taxableValue + freight + insurance),
    fobValue: roundCents(taxableValue),
    grandTotal: roundCents(grandTotal),
    advancePercent,
    advanceDue: roundCents(advanceDue),
    balanceDue: roundCents(grandTotal - advanceDue),
    effectiveDiscountPercent: subtotal > 0 ? roundCents((totalDiscount / subtotal) * 100) : 0,
  };
}

/**
 * Add a whole number of days to an ISO date, in UTC so the result never depends on the
 * viewer's time zone.
 *
 * @param {string} isoDate      Date in YYYY-MM-DD form.
 * @param {number} days         Days to add.
 * @returns {object} { date, isoDate } or { error }.
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
  return {
    isoDate: target.toISOString().slice(0, 10),
    days,
  };
}

const ONES = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
/** Short-scale group names, applied every three digits. */
const SCALES = ["", "Thousand", "Million", "Billion", "Trillion"];

/** Spell a number below 1000 in words. */
function threeDigitsToWords(value) {
  const words = [];
  const hundreds = Math.floor(value / 100);
  const rest = value % 100;
  if (hundreds > 0) words.push(ONES[hundreds], "Hundred");
  if (rest > 0) {
    if (rest < 20) {
      words.push(ONES[rest]);
    } else {
      const tens = Math.floor(rest / 10);
      const ones = rest % 10;
      words.push(ones > 0 ? `${TENS[tens]}-${ONES[ones]}` : TENS[tens]);
    }
  }
  return words.join(" ");
}

/**
 * Spell a money amount in words, as banks and customs authorities require on the document.
 * Uses the short scale (thousand, million, billion).
 *
 * @param {number} amount           The amount to spell out.
 * @param {string} [unit]           Currency unit name, e.g. "US Dollars".
 * @param {string} [subunit]        Fractional unit name, e.g. "Cents".
 * @returns {string} The amount in words, or an explanatory string for invalid input.
 */
export function amountInWords(amount, unit = "US Dollars", subunit = "Cents") {
  if (isBadNumber(amount) || amount < 0) return "Amount not available";
  // Above a quadrillion the short-scale table runs out; refuse rather than mislabel.
  if (amount >= 1e15) return "Amount too large to spell out";

  const rounded = roundCents(amount);
  const whole = Math.floor(rounded);
  const fraction = Math.round((rounded - whole) * 100);

  let wholeWords;
  if (whole === 0) {
    wholeWords = "Zero";
  } else {
    const groups = [];
    let remaining = whole;
    while (remaining > 0) {
      groups.push(remaining % 1000);
      remaining = Math.floor(remaining / 1000);
    }
    const parts = [];
    for (let index = groups.length - 1; index >= 0; index -= 1) {
      if (groups[index] === 0) continue;
      const scale = SCALES[index];
      parts.push(scale ? `${threeDigitsToWords(groups[index])} ${scale}` : threeDigitsToWords(groups[index]));
    }
    wholeWords = parts.join(" ");
  }

  const base = `${wholeWords} ${unit}`;
  if (fraction === 0) return `${base} Only`;
  return `${base} and ${threeDigitsToWords(fraction)} ${subunit} Only`;
}

/**
 * Build a proforma reference number from a prefix, a financial-year style date and a sequence.
 * Kept pure — the date is supplied, never read from the clock.
 *
 * @param {string} prefix   Short alphanumeric prefix, e.g. "PI".
 * @param {string} isoDate  Issue date as YYYY-MM-DD.
 * @param {number} sequence Running number for the year.
 * @returns {string} e.g. "PI/2026/0007".
 */
export function buildProformaNumber(prefix, isoDate, sequence) {
  const safePrefix = String(prefix || "PI").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || "PI";
  const year = /^\d{4}-\d{2}-\d{2}$/.test(String(isoDate)) ? String(isoDate).slice(0, 4) : "0000";
  const safeSequence =
    Number.isFinite(Number(sequence)) && Number(sequence) > 0 ? Math.floor(Number(sequence)) : 1;
  return `${safePrefix}/${year}/${String(safeSequence).padStart(4, "0")}`;
}
