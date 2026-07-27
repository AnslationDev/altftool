/**
 * GST Delivery Challan — Rule 55 of the CGST Rules, 2017.
 *
 * A delivery challan is issued in lieu of a tax invoice when goods move without
 * a supply having taken place, in the cases listed in Rule 55(1):
 *   (a) supply of liquid gas where the quantity at removal is not known,
 *   (b) transportation of goods for job work,
 *   (c) transportation of goods for reasons other than by way of supply,
 *   (d) other supplies notified by the Board.
 *
 * Every rate, limit and copy marking below carries the rule it comes from.
 */

/** Rule 55(1): the challan is serially numbered, not exceeding 16 characters. */
export const MAX_SERIAL_LENGTH = 16;

/** Rule 55(1): letters, digits, hyphen and slash only, in one or multiple series. */
export const SERIAL_ALLOWED_PATTERN = /^[A-Za-z0-9/-]+$/;

/** Rule 55(2): a challan for supply of goods is prepared in triplicate. */
export const CHALLAN_COPIES = [
  "Original for consignee",
  "Duplicate for transporter",
  "Triplicate for consigner",
];

/**
 * Rule 138(1) of the CGST Rules: an e-way bill is required before movement of
 * goods where the consignment value exceeds ₹50,000. States may set a higher
 * intra-state limit, so the tool reports this as the central default.
 */
export const EWAY_BILL_THRESHOLD = 50000;

/**
 * Section 143 of the CGST Act: goods sent to a job worker must come back (or be
 * supplied from the job worker's premises) within one year for inputs and three
 * years for capital goods, otherwise the despatch is treated as a supply on the
 * day it was sent out. Moulds, dies, jigs, fixtures and tools are outside this.
 */
export const JOB_WORK_RETURN_YEARS = { inputs: 1, capitalGoods: 3 };

/**
 * Rule 55(1) reasons for movement. `taxOnChallan` follows Rule 55(1)(vii):
 * the tax rate and amount are shown only where the transportation is for
 * supply to the consignee.
 */
export const CHALLAN_PURPOSES = {
  jobWork: { label: "Goods sent for job work", taxOnChallan: false, jobWork: true },
  jobWorkReturn: { label: "Return of goods after job work", taxOnChallan: false, jobWork: true },
  approval: { label: "Goods sent on sale or approval basis", taxOnChallan: false, jobWork: false },
  branchTransfer: { label: "Stock or branch transfer (same GSTIN)", taxOnChallan: false, jobWork: false },
  exhibition: { label: "Goods for exhibition, demo or testing", taxOnChallan: false, jobWork: false },
  repair: { label: "Goods sent for repair or servicing", taxOnChallan: false, jobWork: false },
  liquidGas: { label: "Liquid gas — quantity not known at removal", taxOnChallan: true, jobWork: false },
  supplyQtyUnknown: { label: "Supply to consignee, invoice to follow", taxOnChallan: true, jobWork: false },
};

/** GST rate slabs available on the challan when tax has to be shown. */
export const GST_RATES = [0, 0.25, 3, 5, 12, 18, 28];

export const GSTIN_PATTERN =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[A-Z]{1}[0-9A-Z]{1}$/;

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

const CHECKSUM_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Base-36 GSTIN check digit: alternate weights of 1 and 2 over the first 14 characters. */
export function gstinCheckDigit(first14) {
  if (typeof first14 !== "string" || first14.length !== 14) return null;
  let sum = 0;
  for (let i = 0; i < 14; i += 1) {
    const value = CHECKSUM_ALPHABET.indexOf(first14[i]);
    if (value < 0) return null;
    const product = value * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  return CHECKSUM_ALPHABET[(36 - (sum % 36)) % 36];
}

export function validateGstin(raw) {
  const gstin = String(raw ?? "").trim().toUpperCase();
  if (!gstin) return { valid: false, reason: "GSTIN is empty." };
  if (gstin.length !== 15) {
    return { valid: false, reason: `A GSTIN is exactly 15 characters; this one has ${gstin.length}.` };
  }
  if (!GSTIN_PATTERN.test(gstin)) {
    return { valid: false, reason: "Pattern must be 2 digits, a 10-character PAN, entity code, Z and a check digit." };
  }
  const stateCode = gstin.slice(0, 2);
  const stateName = GST_STATE_CODES[stateCode] ?? GST_STATE_CODES[Number(stateCode)];
  if (!stateName) return { valid: false, reason: `${stateCode} is not a notified GST state or UT code.` };
  const expected = gstinCheckDigit(gstin.slice(0, 14));
  if (expected !== gstin[14]) {
    return { valid: false, reason: `Check digit fails — the 15th character should be ${expected}.`, stateCode, stateName };
  }
  return { valid: true, gstin, stateCode, stateName };
}

export function validateSerialNumber(raw) {
  const serial = String(raw ?? "").trim();
  if (!serial) return { valid: false, reason: "Rule 55(1)(i) needs a challan number." };
  if (serial.length > MAX_SERIAL_LENGTH) {
    return { valid: false, reason: `Challan number may not exceed ${MAX_SERIAL_LENGTH} characters (this one has ${serial.length}).` };
  }
  if (!SERIAL_ALLOWED_PATTERN.test(serial)) {
    return { valid: false, reason: "Only letters, digits, hyphen and slash are allowed in the challan number." };
  }
  return { valid: true, serial };
}

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Add whole years to an ISO date, clamping 29 February to 28 February in a
 * non-leap year. Pure — the date is always supplied by the caller.
 */
export function addYearsIso(iso, years) {
  const match = ISO_DATE.exec(String(iso ?? "").trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const year = Number(y) + Number(years);
  const month = Number(m);
  const day = Number(d);
  if (!Number.isFinite(year) || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const safeDay = Math.min(day, lastDay);
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
}

/** Whole days between two ISO dates (later minus earlier). */
export function daysBetweenIso(fromIso, toIso) {
  const a = ISO_DATE.exec(String(fromIso ?? "").trim());
  const b = ISO_DATE.exec(String(toIso ?? "").trim());
  if (!a || !b) return null;
  const from = Date.UTC(Number(a[1]), Number(a[2]) - 1, Number(a[3]));
  const to = Date.UTC(Number(b[1]), Number(b[2]) - 1, Number(b[3]));
  return Math.round((to - from) / 86400000);
}

/** Taxable value of one challan line, and the tax split when tax must be shown. */
export function computeChallanLine(line = {}, { interState = false, showTax = false } = {}) {
  const quantity = Number(line.quantity);
  const rate = Number(line.rate);
  const gstRate = showTax ? Number(line.gstRate ?? 0) : 0;

  if (!Number.isFinite(quantity) || !Number.isFinite(rate) || !Number.isFinite(gstRate)) {
    return { error: "Quantity, rate and GST rate must be numbers." };
  }
  if (quantity < 0 || rate < 0) return { error: "Quantity and rate cannot be negative." };
  if (gstRate < 0 || gstRate > 100) return { error: "GST rate must be between 0% and 100%." };

  const taxableValue = round2(quantity * rate);
  const taxAmount = round2((taxableValue * gstRate) / 100);
  return {
    taxableValue,
    gstRate,
    taxAmount,
    cgst: interState ? 0 : round2(taxAmount / 2),
    sgst: interState ? 0 : round2(taxAmount / 2),
    igst: interState ? taxAmount : 0,
    lineTotal: round2(taxableValue + taxAmount),
  };
}

const ONES = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n) {
  if (n < 20) return ONES[n];
  const unit = n % 10;
  return unit ? `${TENS[Math.floor(n / 10)]} ${ONES[unit]}` : TENS[Math.floor(n / 10)];
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

export function amountInWordsINR(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value) || Math.abs(value) > 1e15) return "";
  const absolute = round2(Math.abs(value));
  const rupees = Math.floor(absolute);
  const paise = Math.round((absolute - rupees) * 100);
  let words = `${integerToWords(rupees)} Rupees`;
  if (paise) words += ` and ${twoDigits(paise)} Paise`;
  return `${value < 0 ? "Minus " : ""}${words} only`;
}

/**
 * Build a complete delivery challan.
 *
 * @param {object} input
 * @param {object} input.consigner   { name, address, gstin }
 * @param {object} input.consignee   { name, address, gstin }
 * @param {string} input.serialNumber
 * @param {string} input.dateOfIssue     ISO yyyy-mm-dd — supplied, never read from the clock
 * @param {string} input.purpose         key of CHALLAN_PURPOSES
 * @param {"inputs"|"capitalGoods"} input.jobWorkGoodsType
 * @param {Array}  input.lines           [{ description, hsn, quantity, unit, rate, gstRate }]
 * @param {string} input.placeOfSupply   required for inter-state movement — Rule 55(1)(viii)
 * @param {string} input.vehicleNumber
 * @param {string} input.transporter
 * @param {boolean} input.signed         Rule 55(1)(ix)
 */
export function buildDeliveryChallan(input = {}) {
  const consigner = input.consigner ?? {};
  const consignee = input.consignee ?? {};
  const purposeKey = CHALLAN_PURPOSES[input.purpose] ? input.purpose : "jobWork";
  const purpose = CHALLAN_PURPOSES[purposeKey];

  const serial = validateSerialNumber(input.serialNumber);
  if (!serial.valid) return { error: serial.reason };

  if (!String(consigner.name ?? "").trim()) return { error: "Consigner name is required by Rule 55(1)(ii)." };
  const consignerGstin = validateGstin(consigner.gstin);
  if (!consignerGstin.valid) return { error: `Consigner GSTIN: ${consignerGstin.reason}` };

  const dateOfIssue = String(input.dateOfIssue ?? "").trim();
  if (!ISO_DATE.test(dateOfIssue)) return { error: "Enter the challan date as yyyy-mm-dd — Rule 55(1)(i)." };

  let consigneeGstin = null;
  const consigneeGstinRaw = String(consignee.gstin ?? "").trim();
  if (consigneeGstinRaw) {
    consigneeGstin = validateGstin(consigneeGstinRaw);
    if (!consigneeGstin.valid) return { error: `Consignee GSTIN: ${consigneeGstin.reason}` };
  }

  const rawLines = Array.isArray(input.lines) ? input.lines : [];
  const priced = rawLines.filter((line) => String(line?.description ?? "").trim());
  if (priced.length === 0) return { error: "Add at least one line describing the goods being moved." };

  const interState = Boolean(consigneeGstin?.valid) && consigneeGstin.stateCode !== consignerGstin.stateCode;
  const showTax = purpose.taxOnChallan;

  const lines = [];
  let taxableValue = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let totalQuantity = 0;

  for (let i = 0; i < priced.length; i += 1) {
    const computed = computeChallanLine(priced[i], { interState, showTax });
    if (computed.error) return { error: `Line ${i + 1}: ${computed.error}` };
    taxableValue = round2(taxableValue + computed.taxableValue);
    cgst = round2(cgst + computed.cgst);
    sgst = round2(sgst + computed.sgst);
    igst = round2(igst + computed.igst);
    totalQuantity = round2(totalQuantity + Number(priced[i].quantity));
    lines.push({
      description: String(priced[i].description).trim(),
      hsn: String(priced[i].hsn ?? "").trim(),
      unit: String(priced[i].unit ?? "").trim(),
      quantity: Number(priced[i].quantity),
      rate: Number(priced[i].rate),
      ...computed,
    });
  }

  const totalTax = round2(cgst + sgst + igst);
  const consignmentValue = round2(taxableValue + totalTax);

  // Rule 138: e-way bill needed once the consignment value crosses ₹50,000.
  const ewayBillRequired = consignmentValue > EWAY_BILL_THRESHOLD;

  // Section 143 job-work clock.
  let jobWork = null;
  if (purpose.jobWork) {
    const goodsType = JOB_WORK_RETURN_YEARS[input.jobWorkGoodsType] ? input.jobWorkGoodsType : "inputs";
    const years = JOB_WORK_RETURN_YEARS[goodsType];
    const returnBy = addYearsIso(dateOfIssue, years);
    jobWork = {
      goodsType,
      years,
      returnBy,
      daysAllowed: daysBetweenIso(dateOfIssue, returnBy),
    };
  }

  const warnings = [];
  if (!String(consignee.name ?? "").trim()) {
    warnings.push("Rule 55(1)(iii): name and address of the consignee (with GSTIN if registered) must appear on the challan.");
  }
  if (lines.some((line) => !line.hsn)) {
    warnings.push("Rule 55(1)(iv): give the HSN code as well as the description for every line of goods.");
  }
  if (interState && !String(input.placeOfSupply ?? "").trim()) {
    warnings.push("Rule 55(1)(viii): the place of supply must be stated for inter-state movement.");
  }
  if (input.signed === false) {
    warnings.push("Rule 55(1)(ix): the challan needs a signature or digital signature.");
  }
  if (ewayBillRequired) {
    warnings.push(
      `Consignment value is above ₹${EWAY_BILL_THRESHOLD.toLocaleString("en-IN")}, so generate an e-way bill in Part-A and Part-B before the goods move (Rule 138).`,
    );
  }
  if (showTax && lines.every((line) => line.gstRate === 0)) {
    warnings.push("Rule 55(1)(vii): where the movement is a supply to the consignee, the tax rate and amount must be shown.");
  }
  if (purposeKey === "jobWork") {
    warnings.push("Declare these despatches in Form ITC-04 for the relevant period under Rule 45(3).");
  }

  return {
    serialNumber: serial.serial,
    dateOfIssue,
    purpose: purposeKey,
    purposeLabel: purpose.label,
    showTax,
    copies: CHALLAN_COPIES,
    consigner: { ...consigner, gstin: consignerGstin.gstin, stateName: consignerGstin.stateName },
    consignee: {
      ...consignee,
      gstin: consigneeGstin?.valid ? consigneeGstin.gstin : "",
      stateName: consigneeGstin?.stateName ?? "",
    },
    placeOfSupply: String(input.placeOfSupply ?? "").trim(),
    vehicleNumber: String(input.vehicleNumber ?? "").trim(),
    transporter: String(input.transporter ?? "").trim(),
    interState,
    lines,
    taxableValue,
    cgst,
    sgst,
    igst,
    totalTax,
    consignmentValue,
    totalQuantity,
    ewayBillRequired,
    jobWork,
    amountInWords: amountInWordsINR(consignmentValue),
    warnings,
  };
}
