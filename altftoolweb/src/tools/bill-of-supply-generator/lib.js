/**
 * Bill of Supply — Rule 49 of the CGST Rules, 2017.
 *
 * A bill of supply (not a tax invoice) is issued by:
 *   - a registered person supplying exempt / nil-rated / non-GST goods or services, and
 *   - a composition taxable person under Section 10 of the CGST Act, 2017,
 * because neither is allowed to charge GST on the face of the document.
 *
 * All statutory particulars, thresholds and declaration wordings below are named
 * constants with the rule they come from.
 */

/** Rule 49(b): serial number shall not exceed 16 characters. */
export const MAX_SERIAL_LENGTH = 16;

/**
 * Rule 49(b): the serial number may contain alphabets, numerals and the
 * special characters hyphen/dash and slash only, and must be unique for a
 * financial year.
 */
export const SERIAL_ALLOWED_PATTERN = /^[A-Za-z0-9/-]+$/;

/**
 * Rule 49, third proviso: a registered person may choose not to issue a bill of
 * supply where the value of the supply is less than ₹200, subject to the
 * conditions in the fourth proviso of Rule 46.
 */
export const BILL_OF_SUPPLY_OPTIONAL_BELOW = 200;

/**
 * Rule 5(1)(f) of the CGST Rules: a composition taxable person must print this
 * declaration at the top of every bill of supply.
 */
export const COMPOSITION_DECLARATION =
  "Composition taxable person, not eligible to collect tax on supplies";

/** Customary declaration for exempt / nil-rated / non-GST outward supplies. */
export const EXEMPT_DECLARATION =
  "Not a tax invoice. Supply of exempt / nil-rated / non-GST goods or services — no GST charged.";

export const SUPPLIER_TYPES = {
  exempt: {
    label: "Regular dealer — exempt / nil-rated / non-GST supply",
    declaration: EXEMPT_DECLARATION,
  },
  composition: {
    label: "Composition taxable person (Section 10)",
    declaration: COMPOSITION_DECLARATION,
  },
};

/** 15-char GSTIN shape: 2 state digits + 10-char PAN + entity code + literal Z + checksum. */
export const GSTIN_PATTERN =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/** GSTIN state / UT codes as notified for the first two digits. */
export const GST_STATE_CODES = {
  "01": "Jammu and Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  10: "Bihar",
  11: "Sikkim",
  12: "Arunachal Pradesh",
  13: "Nagaland",
  14: "Manipur",
  15: "Mizoram",
  16: "Tripura",
  17: "Meghalaya",
  18: "Assam",
  19: "West Bengal",
  20: "Jharkhand",
  21: "Odisha",
  22: "Chhattisgarh",
  23: "Madhya Pradesh",
  24: "Gujarat",
  25: "Daman and Diu (pre-2020; merged into Dadra and Nagar Haveli and Daman and Diu)",
  26: "Dadra and Nagar Haveli and Daman and Diu",
  27: "Maharashtra",
  29: "Karnataka",
  30: "Goa",
  31: "Lakshadweep",
  32: "Kerala",
  33: "Tamil Nadu",
  34: "Puducherry",
  35: "Andaman and Nicobar Islands",
  36: "Telangana",
  37: "Andhra Pradesh",
  38: "Ladakh",
  97: "Other Territory",
  99: "Centre Jurisdiction",
};

/** Alphabet used by the GSTIN check-digit algorithm (base 36). */
const CHECKSUM_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * GSTIN check digit: weight each of the first 14 characters alternately by 1
 * and 2, add the quotient and remainder of each product over 36, then take the
 * base-36 complement of the running total.
 */
export function gstinCheckDigit(first14) {
  if (typeof first14 !== "string" || first14.length !== 14) return null;
  let sum = 0;
  for (let i = 0; i < 14; i += 1) {
    const value = CHECKSUM_ALPHABET.indexOf(first14[i]);
    if (value < 0) return null;
    const factor = i % 2 === 0 ? 1 : 2;
    const product = value * factor;
    sum += Math.floor(product / 36) + (product % 36);
  }
  return CHECKSUM_ALPHABET[(36 - (sum % 36)) % 36];
}

/**
 * Validate a GSTIN's shape, state code and check digit.
 * Returns { valid, reason, stateCode, stateName, pan }.
 */
export function validateGstin(raw) {
  const gstin = String(raw ?? "").trim().toUpperCase();
  if (!gstin) return { valid: false, reason: "GSTIN is empty." };
  if (gstin.length !== 15) {
    return { valid: false, reason: `A GSTIN is exactly 15 characters; this one has ${gstin.length}.` };
  }
  if (!GSTIN_PATTERN.test(gstin)) {
    return { valid: false, reason: "Pattern must be 2 digits, then a 10-character PAN, then entity code, Z and a check digit." };
  }
  const stateCode = gstin.slice(0, 2);
  const stateName = GST_STATE_CODES[stateCode] ?? GST_STATE_CODES[Number(stateCode)];
  if (!stateName) {
    return { valid: false, reason: `${stateCode} is not a notified GST state or UT code.`, stateCode };
  }
  const expected = gstinCheckDigit(gstin.slice(0, 14));
  if (expected !== gstin[14]) {
    return {
      valid: false,
      reason: `Check digit fails — the 15th character should be ${expected}.`,
      stateCode,
      stateName,
    };
  }
  return { valid: true, stateCode, stateName, pan: gstin.slice(2, 12), gstin };
}

/** Validate the document serial number against Rule 49(b). */
export function validateSerialNumber(raw) {
  const serial = String(raw ?? "").trim();
  if (!serial) return { valid: false, reason: "A consecutive serial number is required by Rule 49(b)." };
  if (serial.length > MAX_SERIAL_LENGTH) {
    return { valid: false, reason: `Serial number may not exceed ${MAX_SERIAL_LENGTH} characters (this one has ${serial.length}).` };
  }
  if (!SERIAL_ALLOWED_PATTERN.test(serial)) {
    return { valid: false, reason: "Only letters, digits, hyphen and slash are allowed in the serial number." };
  }
  return { valid: true, serial };
}

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Value of one line item: quantity x rate, less any percentage discount.
 * Rule 49(g) requires the value of supply after discount or abatement.
 */
export function computeLine(line = {}) {
  const quantity = Number(line.quantity);
  const rate = Number(line.rate);
  const discountPercent = line.discountPercent === "" || line.discountPercent == null ? 0 : Number(line.discountPercent);

  if (!Number.isFinite(quantity) || !Number.isFinite(rate) || !Number.isFinite(discountPercent)) {
    return { error: "Quantity, rate and discount must be numbers." };
  }
  if (quantity < 0 || rate < 0) return { error: "Quantity and rate cannot be negative." };
  if (discountPercent < 0 || discountPercent > 100) {
    return { error: "Discount must be between 0% and 100%." };
  }

  const gross = round2(quantity * rate);
  const discount = round2((gross * discountPercent) / 100);
  return { gross, discount, value: round2(gross - discount) };
}

const ONES = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n) {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const unit = n % 10;
  return unit ? `${TENS[tens]} ${ONES[unit]}` : TENS[tens];
}

/** Indian numbering system: crore, lakh, thousand, hundred. */
function integerToWords(value) {
  if (value === 0) return "Zero";
  const parts = [];
  const crore = Math.floor(value / 10000000);
  let rest = value % 10000000;
  const lakh = Math.floor(rest / 100000);
  rest %= 100000;
  const thousand = Math.floor(rest / 1000);
  rest %= 1000;
  const hundred = Math.floor(rest / 100);
  const remainder = rest % 100;

  if (crore) parts.push(`${integerToWords(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (hundred) parts.push(`${ONES[hundred]} Hundred`);
  if (remainder) parts.push(twoDigits(remainder));
  return parts.join(" ");
}

/** Rupees-and-paise wording used on Indian invoices. */
export function amountInWordsINR(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "";
  const negative = value < 0;
  const absolute = round2(Math.abs(value));
  // Beyond a lakh crore the wording stops being useful on a printed document.
  if (absolute > 1e15) return "";
  const rupees = Math.floor(absolute);
  const paise = Math.round((absolute - rupees) * 100);
  let words = `${integerToWords(rupees)} Rupees`;
  if (paise) words += ` and ${twoDigits(paise)} Paise`;
  return `${negative ? "Minus " : ""}${words} only`;
}

/**
 * Assemble a complete bill of supply.
 *
 * @param {object} input
 * @param {object} input.supplier      { name, address, gstin }
 * @param {object} input.recipient     { name, address, gstin }  (GSTIN optional — Rule 49(d))
 * @param {string} input.serialNumber
 * @param {string} input.dateOfIssue   ISO yyyy-mm-dd, passed in so the maths stays pure
 * @param {Array}  input.lines         [{ description, hsn, quantity, unit, rate, discountPercent }]
 * @param {"exempt"|"composition"} input.supplierType
 * @param {boolean} input.roundOff     round the payable total to the nearest rupee (Section 170)
 * @param {boolean} input.signed       signature or digital signature present — Rule 49(h)
 */
export function buildBillOfSupply(input = {}) {
  const supplier = input.supplier ?? {};
  const recipient = input.recipient ?? {};
  const rawLines = Array.isArray(input.lines) ? input.lines : [];
  const supplierType = SUPPLIER_TYPES[input.supplierType] ? input.supplierType : "exempt";

  const serial = validateSerialNumber(input.serialNumber);
  if (!serial.valid) return { error: serial.reason };

  const supplierGstin = validateGstin(supplier.gstin);
  if (!supplierGstin.valid) return { error: `Supplier GSTIN: ${supplierGstin.reason}` };

  if (!String(supplier.name ?? "").trim()) return { error: "Supplier name is required by Rule 49(a)." };
  if (!String(supplier.address ?? "").trim()) return { error: "Supplier address is required by Rule 49(a)." };

  const dateOfIssue = String(input.dateOfIssue ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfIssue)) {
    return { error: "Enter the date of issue as yyyy-mm-dd — Rule 49(c)." };
  }

  const priced = rawLines.filter((line) => String(line?.description ?? "").trim());
  if (priced.length === 0) return { error: "Add at least one line with a description of the goods or services." };

  const lines = [];
  let subTotal = 0;
  let totalDiscount = 0;
  for (let i = 0; i < priced.length; i += 1) {
    const computed = computeLine(priced[i]);
    if (computed.error) return { error: `Line ${i + 1}: ${computed.error}` };
    subTotal = round2(subTotal + computed.gross);
    totalDiscount = round2(totalDiscount + computed.discount);
    lines.push({
      description: String(priced[i].description).trim(),
      hsn: String(priced[i].hsn ?? "").trim(),
      unit: String(priced[i].unit ?? "").trim(),
      quantity: Number(priced[i].quantity),
      rate: Number(priced[i].rate),
      discountPercent: Number(priced[i].discountPercent || 0),
      ...computed,
    });
  }

  const netTotal = round2(subTotal - totalDiscount);
  const rounded = input.roundOff ? Math.round(netTotal) : netTotal;
  const roundOffAmount = round2(rounded - netTotal);

  // Rule 49(d)–(h) particulars that are still missing, reported as warnings.
  const warnings = [];
  const recipientGstinRaw = String(recipient.gstin ?? "").trim();
  let recipientGstin = null;
  if (recipientGstinRaw) {
    recipientGstin = validateGstin(recipientGstinRaw);
    if (!recipientGstin.valid) return { error: `Recipient GSTIN: ${recipientGstin.reason}` };
  }
  if (!String(recipient.name ?? "").trim()) {
    warnings.push("Rule 49(d): add the recipient's name (and address, plus GSTIN if they are registered).");
  }
  if (lines.some((line) => !line.hsn)) {
    warnings.push("Rule 49(e): give the HSN code for goods or the SAC for services on every line.");
  }
  if (input.signed === false) {
    warnings.push("Rule 49(h): the supplier or an authorised representative must sign or digitally sign the bill.");
  }
  if (netTotal < BILL_OF_SUPPLY_OPTIONAL_BELOW) {
    warnings.push(
      `Value is under ₹${BILL_OF_SUPPLY_OPTIONAL_BELOW}, so Rule 49's third proviso lets you skip a bill of supply if you display a consolidated one at the close of business.`,
    );
  }

  const interState = Boolean(recipientGstin?.valid) && recipientGstin.stateCode !== supplierGstin.stateCode;

  return {
    serialNumber: serial.serial,
    dateOfIssue,
    supplierType,
    declaration: SUPPLIER_TYPES[supplierType].declaration,
    supplier: { ...supplier, gstin: supplierGstin.gstin, stateName: supplierGstin.stateName },
    recipient: {
      ...recipient,
      gstin: recipientGstin?.valid ? recipientGstin.gstin : "",
      stateName: recipientGstin?.stateName ?? "",
    },
    interState,
    lines,
    subTotal,
    totalDiscount,
    netTotal,
    roundOffAmount,
    total: rounded,
    totalQuantity: round2(lines.reduce((sum, line) => sum + line.quantity, 0)),
    amountInWords: amountInWordsINR(rounded),
    warnings,
  };
}
