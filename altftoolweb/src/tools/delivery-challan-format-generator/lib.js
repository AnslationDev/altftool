/**
 * Delivery challan (Rule 55, CGST Rules 2017) — pure logic.
 *
 * Everything here is arithmetic and date work over the values the user types:
 * line totals, the consignment value as Explanation 2 to Rule 138(1) defines
 * it, the e-way bill decision and validity from Rule 138(10), the section 143
 * job-work return dates and the ITC-04 due date. No network, no Date.now — the
 * challan date and dispatch date are arguments, so the same form always
 * produces the same document.
 */

/* ------------------------------------------------------------------ *
 * Statutory reference data
 * ------------------------------------------------------------------ */

/** Rule 55(1) — the cases in which a delivery challan is issued instead of an invoice. */
export const CHALLAN_REASONS = [
  {
    id: "job-work",
    label: "Goods sent for job work",
    clause: "Rule 55(1)(b)",
    detail: "Transportation of goods for job work. Section 143 return clocks apply.",
    jobWork: true,
  },
  {
    id: "job-work-return",
    label: "Job worked goods returned to the principal",
    clause: "Rule 55(1)(b)",
    detail: "The job worker returning the processed goods, on their own challan or endorsing the principal's.",
    jobWork: true,
  },
  {
    id: "liquid-gas",
    label: "Liquid gas, quantity not known at removal",
    clause: "Rule 55(1)(a)",
    detail: "Supply of liquid gas where the quantity at removal from the supplier's place of business is not known.",
    jobWork: false,
  },
  {
    id: "not-supply",
    label: "Movement for a reason other than supply",
    clause: "Rule 55(1)(c)",
    detail: "Branch or warehouse transfer, goods to an exhibition, repair, testing, weighbridge, demo stock.",
    jobWork: false,
  },
  {
    id: "sale-on-approval",
    label: "Sale on approval / approval basis",
    clause: "Rule 55(1)(c)",
    detail: "Goods sent on approval; the invoice follows only when the recipient accepts the goods.",
    jobWork: false,
  },
  {
    id: "skd-ckd",
    label: "SKD / CKD or a consignment in batches",
    clause: "Rule 55(5)",
    detail:
      "Semi knocked down or completely knocked down goods moved in lots: the full invoice goes with the first consignment, a challan referring to it with each later one, and the original invoice with the last.",
    jobWork: false,
  },
  {
    id: "invoice-later",
    label: "For supply, but the invoice could not be issued at removal",
    clause: "Rule 55(4)",
    detail: "Goods moved for supply where the tax invoice is issued after delivery.",
    jobWork: false,
  },
];

/** Rule 55(2) — the particulars a delivery challan must carry. */
export const RULE_55_PARTICULARS = [
  { id: "number", clause: "55(2)(i)", label: "Date and number of the delivery challan" },
  { id: "consigner", clause: "55(2)(ii)", label: "Name, address and GSTIN of the consigner, if registered" },
  { id: "consignee", clause: "55(2)(iii)", label: "Name, address and GSTIN or UIN of the consignee, if registered" },
  { id: "hsn", clause: "55(2)(iv)", label: "HSN code and description of the goods" },
  { id: "quantity", clause: "55(2)(v)", label: "Quantity (provisional, where the exact quantity is not known)" },
  { id: "taxableValue", clause: "55(2)(vi)", label: "Taxable value" },
  { id: "tax", clause: "55(2)(vii)", label: "Tax rate and amount, where the transportation is for supply to the consignee" },
  { id: "placeOfSupply", clause: "55(2)(viii)", label: "Place of supply, in the case of inter-State movement" },
  { id: "signature", clause: "55(2)(ix)", label: "Signature" },
];

/** Rule 55(3) — the challan is prepared in triplicate, each copy marked. */
export const CHALLAN_COPIES = [
  { id: "original", marking: "ORIGINAL FOR CONSIGNEE", clause: "Rule 55(3)(a)" },
  { id: "duplicate", marking: "DUPLICATE FOR TRANSPORTER", clause: "Rule 55(3)(b)" },
  { id: "triplicate", marking: "TRIPLICATE FOR CONSIGNER", clause: "Rule 55(3)(c)" },
];

/** Rule 138(1): an e-way bill is needed once the consignment value crosses this. */
export const EWB_THRESHOLD = 50000;

/** Rule 138(10) validity: one day per this many km for ordinary cargo. */
export const EWB_KM_PER_DAY = 200;

/** Rule 138(10) validity for over dimensional cargo and multimodal with a ship leg. */
export const EWB_KM_PER_DAY_ODC = 20;

/** Rule 138(3) proviso: Part B may be left out on a leg of up to this distance within the State. */
export const PART_B_EXEMPT_KM = 50;

/** Section 143(1) — return clocks, in years, counted from the date the goods were sent out. */
export const JOB_WORK_RETURN_YEARS = { inputs: 1, capital: 3 };

/** Proviso to section 143(1) — the Commissioner may extend by this much. */
export const JOB_WORK_EXTENSION_YEARS = { inputs: 1, capital: 2 };

/** Rule 45(3) read with Notification 35/2021-CT: ITC-04 frequency turns on aggregate turnover. */
export const ITC04_TURNOVER_LIMIT = 50000000; // Rs 5 crore

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

export const GST_RATES = [0, 0.1, 0.25, 1, 1.5, 3, 5, 6, 7.5, 12, 18, 28];

export const UNITS = ["NOS", "PCS", "KGS", "GMS", "TON", "LTR", "MTR", "SQM", "BOX", "SET", "ROL", "BAG"];

const GSTIN_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;

/* ------------------------------------------------------------------ *
 * GSTIN
 * ------------------------------------------------------------------ */

/**
 * Validate a GSTIN, including the mod-36 check digit the GSTN publishes:
 * every character is weighted 1, 2, 1, 2 ... and the check character is
 * (36 - sum mod 36) mod 36.
 */
export function validateGstin(value) {
  const gstin = String(value || "").toUpperCase().replace(/\s+/g, "");
  if (!gstin) return { provided: false, valid: false, reason: "not provided" };
  if (gstin.length !== 15) {
    return { provided: true, valid: false, reason: `a GSTIN is 15 characters; this one is ${gstin.length}` };
  }
  if (!GSTIN_PATTERN.test(gstin)) {
    return {
      provided: true,
      valid: false,
      reason: "the pattern must be 2 digits, 5 letters, 4 digits, 1 letter, 1 alphanumeric, Z, 1 alphanumeric",
    };
  }
  const stateCode = gstin.slice(0, 2);
  if (!GST_STATE_CODES[stateCode]) {
    return { provided: true, valid: false, reason: `"${stateCode}" is not an allotted State code` };
  }

  let sum = 0;
  for (let i = 0; i < 14; i += 1) {
    const codePoint = GSTIN_CHARS.indexOf(gstin[i]);
    const factor = i % 2 === 0 ? 1 : 2;
    const product = codePoint * factor;
    sum += Math.floor(product / 36) + (product % 36);
  }
  const expected = GSTIN_CHARS[(36 - (sum % 36)) % 36];
  if (expected !== gstin[14]) {
    return {
      provided: true,
      valid: false,
      reason: `the check digit should be "${expected}", not "${gstin[14]}"`,
      stateCode,
    };
  }

  return {
    provided: true,
    valid: true,
    gstin,
    stateCode,
    stateName: GST_STATE_CODES[stateCode],
    pan: gstin.slice(2, 12),
  };
}

/* ------------------------------------------------------------------ *
 * Dates — plain calendar arithmetic on YYYY-MM-DD strings
 * ------------------------------------------------------------------ */

export function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1) return null;
  if (day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year, month) {
  const lengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return lengths[month - 1];
}

function toIso({ year, month, day }) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Same date n years on; 29 February falls back to 28 February in a common year. */
export function addYears(iso, years) {
  const date = parseIsoDate(iso);
  if (!date) return null;
  const year = date.year + years;
  const day = Math.min(date.day, daysInMonth(year, date.month));
  return toIso({ year, month: date.month, day });
}

/** DD-MM-YYYY, the form printed on Indian commercial documents. */
export function formatDate(iso) {
  const date = parseIsoDate(iso);
  if (!date) return "";
  return `${String(date.day).padStart(2, "0")}-${String(date.month).padStart(2, "0")}-${date.year}`;
}

/** Indian financial year containing a date: 1 April to 31 March. */
export function financialYearOf(iso) {
  const date = parseIsoDate(iso);
  if (!date) return null;
  const startYear = date.month >= 4 ? date.year : date.year - 1;
  return { startYear, endYear: startYear + 1, label: `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}` };
}

/* ------------------------------------------------------------------ *
 * Money
 * ------------------------------------------------------------------ */

const ONES = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigitWords(n) {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones ? `${TENS[tens]} ${ONES[ones]}` : TENS[tens];
}

function threeDigitWords(n) {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const parts = [];
  if (hundreds) parts.push(`${ONES[hundreds]} Hundred`);
  if (rest) parts.push(twoDigitWords(rest));
  return parts.join(" ");
}

/** Indian numbering: crore, lakh, thousand, hundred. */
export function amountInWords(amount) {
  if (!Number.isFinite(amount) || amount < 0) return "";
  const rupees = Math.floor(Math.round(amount * 100) / 100);
  const paise = Math.round((Math.round(amount * 100) / 100 - rupees) * 100);

  if (rupees === 0 && paise === 0) return "Rupees Zero Only";

  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const remainder = rupees % 1000;

  const parts = [];
  if (crore) parts.push(`${threeDigitWords(crore)} Crore`);
  if (lakh) parts.push(`${twoDigitWords(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigitWords(thousand)} Thousand`);
  if (remainder) parts.push(threeDigitWords(remainder));

  const rupeeWords = parts.length ? parts.join(" ") : "Zero";
  const paiseWords = paise ? ` and ${twoDigitWords(paise)} Paise` : "";
  return `Rupees ${rupeeWords}${paiseWords} Only`;
}

function round2(value) {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return rounded === 0 ? 0 : rounded;
}

/* ------------------------------------------------------------------ *
 * The challan
 * ------------------------------------------------------------------ */

function normalizeItems(items) {
  if (!Array.isArray(items)) return { error: "No line items were supplied." };
  const cleaned = [];
  for (let i = 0; i < items.length; i += 1) {
    const raw = items[i] || {};
    const description = String(raw.description || "").trim();
    const hsn = String(raw.hsn || "").trim();
    const uom = String(raw.uom || "").trim();
    const quantity = Number(raw.quantity);
    const rate = Number(raw.rate);
    const taxRate = raw.taxRate === "" || raw.taxRate === undefined ? 0 : Number(raw.taxRate);

    if (!description && !hsn && !Number.isFinite(quantity) && !Number.isFinite(rate)) continue;

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { error: `Line ${i + 1}: quantity must be a number greater than zero.` };
    }
    if (!Number.isFinite(rate) || rate < 0) {
      return { error: `Line ${i + 1}: rate per unit must be zero or more.` };
    }
    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
      return { error: `Line ${i + 1}: tax rate must be between 0 and 100 percent.` };
    }
    cleaned.push({ description, hsn, uom, quantity, rate, taxRate, provisional: Boolean(raw.provisional) });
  }
  if (cleaned.length === 0) {
    return { error: "Add at least one line of goods — a challan with no goods on it is not a challan." };
  }
  return { items: cleaned };
}

/**
 * Build the delivery challan.
 *
 * @param {object} input see the defaults in pages/index.jsx for the full shape
 * @returns {object} the challan, or { error }
 */
export function buildDeliveryChallan(input = {}) {
  const {
    challanNumber = "",
    challanDate = "",
    reasonId = "job-work",
    consigner = {},
    consignee = {},
    items = [],
    forSupply = false,
    transport = {},
    jobWork = {},
    intraStateThreshold = EWB_THRESHOLD,
  } = input;

  const reason = CHALLAN_REASONS.find((entry) => entry.id === reasonId);
  if (!reason) {
    return { error: `Pick why the goods are moving. "${reasonId}" is not one of the Rule 55 cases.` };
  }

  const date = parseIsoDate(challanDate);
  if (!date) {
    return { error: "Enter the challan date as a real calendar date (YYYY-MM-DD)." };
  }

  const normalized = normalizeItems(items);
  if (normalized.error) return { error: normalized.error };

  const consignerGstin = validateGstin(consigner.gstin);
  const consigneeGstin = validateGstin(consignee.gstin);
  if (consignerGstin.provided && !consignerGstin.valid) {
    return { error: `Consigner GSTIN is not valid — ${consignerGstin.reason}.` };
  }
  if (consigneeGstin.provided && !consigneeGstin.valid) {
    return { error: `Consignee GSTIN is not valid — ${consigneeGstin.reason}.` };
  }

  const consignerState = consignerGstin.valid ? consignerGstin.stateCode : String(consigner.stateCode || "");
  const consigneeState = consigneeGstin.valid ? consigneeGstin.stateCode : String(consignee.stateCode || "");
  const statesKnown = Boolean(GST_STATE_CODES[consignerState] && GST_STATE_CODES[consigneeState]);
  const interState = statesKnown ? consignerState !== consigneeState : null;

  /* ---- lines ---- */
  const chargeTax = Boolean(forSupply); // Rule 55(2)(vii) only asks for tax where the movement is a supply
  const lines = normalized.items.map((item, index) => {
    const taxableValue = round2(item.quantity * item.rate);
    const taxAmount = chargeTax ? round2((taxableValue * item.taxRate) / 100) : 0;
    const isInter = interState === true;
    const cgst = chargeTax && !isInter ? round2(taxAmount / 2) : 0;
    const sgst = chargeTax && !isInter ? round2(taxAmount - round2(taxAmount / 2)) : 0;
    const igst = chargeTax && isInter ? taxAmount : 0;
    return {
      serial: index + 1,
      description: item.description,
      hsn: item.hsn,
      uom: item.uom,
      quantity: item.quantity,
      provisional: item.provisional,
      rate: item.rate,
      taxRate: chargeTax ? item.taxRate : null,
      taxableValue,
      cgst,
      sgst,
      igst,
      lineTotal: round2(taxableValue + cgst + sgst + igst),
    };
  });

  const totals = lines.reduce(
    (acc, line) => ({
      taxable: round2(acc.taxable + line.taxableValue),
      cgst: round2(acc.cgst + line.cgst),
      sgst: round2(acc.sgst + line.sgst),
      igst: round2(acc.igst + line.igst),
    }),
    { taxable: 0, cgst: 0, sgst: 0, igst: 0 },
  );
  const taxTotal = round2(totals.cgst + totals.sgst + totals.igst);

  // Explanation 2 to Rule 138(1): consignment value is the section 15 value declared
  // in the document, including the tax charged on it.
  const consignmentValue = round2(totals.taxable + taxTotal);

  /* ---- e-way bill ---- */
  const distanceRaw = transport.distanceKm;
  const distance =
    distanceRaw === "" || distanceRaw === undefined || distanceRaw === null ? null : Number(distanceRaw);
  if (distance !== null && (!Number.isFinite(distance) || distance < 0)) {
    return { error: "Approximate distance must be zero or more kilometres." };
  }

  const threshold = Number.isFinite(Number(intraStateThreshold)) && Number(intraStateThreshold) > 0
    ? Number(intraStateThreshold)
    : EWB_THRESHOLD;
  const applicableThreshold = interState === false ? threshold : EWB_THRESHOLD;

  const interStateJobWork = reason.jobWork && interState === true;
  const handicraftUnregistered = Boolean(transport.handicraftUnregistered);

  let ewbRequired = false;
  const ewbReasons = [];
  if (interStateJobWork) {
    ewbRequired = true;
    ewbReasons.push(
      "Goods sent by a principal in one State to a job worker in another: the first proviso to Rule 138(1) requires an e-way bill whatever the consignment value.",
    );
  }
  if (handicraftUnregistered) {
    ewbRequired = true;
    ewbReasons.push(
      "Handicraft goods moved inter-State by a person exempt from registration: the second proviso to Rule 138(1) requires an e-way bill whatever the value.",
    );
  }
  if (consignmentValue > applicableThreshold) {
    ewbRequired = true;
    ewbReasons.push(
      `Consignment value of ${formatInr(consignmentValue)} is above the ${formatInr(applicableThreshold)} threshold in Rule 138(1).`,
    );
  }
  if (!ewbRequired) {
    ewbReasons.push(
      `Consignment value of ${formatInr(consignmentValue)} is at or below the ${formatInr(applicableThreshold)} threshold and no value-free proviso applies.`,
    );
  }

  const odc = Boolean(transport.overDimensional);
  const kmPerDay = odc ? EWB_KM_PER_DAY_ODC : EWB_KM_PER_DAY;
  const validityDays = distance === null ? null : Math.max(1, Math.ceil(distance / kmPerDay));
  const partBExempt =
    distance !== null && interState === false && distance <= PART_B_EXEMPT_KM;

  /* ---- job work clocks ---- */
  let jobWorkBlock = null;
  if (reason.jobWork) {
    const dispatchIso = String(jobWork.dispatchDate || challanDate);
    const dispatch = parseIsoDate(dispatchIso);
    if (!dispatch) {
      return { error: "Enter the date the goods were sent out as a real calendar date (YYYY-MM-DD)." };
    }
    const goodsType = jobWork.goodsType === "capital" ? "capital" : "inputs";
    const isTooling = Boolean(jobWork.tooling);
    const returnYears = JOB_WORK_RETURN_YEARS[goodsType];
    const extendedYears = returnYears + JOB_WORK_EXTENSION_YEARS[goodsType];

    const aatoRaw = jobWork.aato;
    const aato = aatoRaw === "" || aatoRaw === undefined || aatoRaw === null ? null : Number(aatoRaw);
    if (aato !== null && (!Number.isFinite(aato) || aato < 0)) {
      return { error: "Aggregate annual turnover must be zero or more." };
    }

    jobWorkBlock = {
      goodsType,
      tooling: isTooling,
      dispatchDate: dispatchIso,
      returnBy: isTooling ? null : addYears(dispatchIso, returnYears),
      returnYears,
      extendedReturnBy: isTooling ? null : addYears(dispatchIso, extendedYears),
      extendedYears,
      basis: isTooling
        ? "Section 143(5): moulds and dies, jigs and fixtures, and tools sent to a job worker are outside the return clock."
        : `Section 143(1)(${goodsType === "inputs" ? "a" : "b"}): ${goodsType === "inputs" ? "inputs" : "capital goods"} must come back, or be supplied from the job worker's premises, within ${returnYears} year${returnYears === 1 ? "" : "s"} of being sent out.`,
      extensionBasis: isTooling
        ? null
        : `Proviso to section 143(1): the Commissioner may extend the period by up to ${JOB_WORK_EXTENSION_YEARS[goodsType]} year${JOB_WORK_EXTENSION_YEARS[goodsType] === 1 ? "" : "s"}.`,
      itc04: aato === null ? null : buildItc04(dispatchIso, aato),
    };
  }

  /* ---- Rule 55(2) completeness ---- */
  const supplied = {
    number: Boolean(String(challanNumber).trim()),
    consigner: Boolean(String(consigner.name || "").trim() && String(consigner.address || "").trim()),
    consignee: Boolean(String(consignee.name || "").trim() && String(consignee.address || "").trim()),
    hsn: lines.every((line) => line.hsn && line.description),
    quantity: lines.every((line) => line.quantity > 0 && line.uom),
    taxableValue: lines.every((line) => Number.isFinite(line.taxableValue)),
    tax: !chargeTax || taxTotal >= 0,
    placeOfSupply: interState !== true || Boolean(String(input.placeOfSupply || "").trim()),
    signature: true, // printed as a signature block; nothing to validate
  };
  const missing = RULE_55_PARTICULARS.filter((particular) => !supplied[particular.id]);

  /* ---- notes ---- */
  const warnings = [];
  if (interState === null) {
    warnings.push(
      "Neither party's State is known, so the tool cannot tell an intra-State movement from an inter-State one. Enter a valid GSTIN or pick a State for each side.",
    );
  }
  if (!consignerGstin.provided) {
    warnings.push("No consigner GSTIN. Rule 55(2)(ii) only asks for it where the consigner is registered.");
  }
  if (!consigneeGstin.provided) {
    warnings.push("No consignee GSTIN or UIN. Rule 55(2)(iii) only asks for it where the consignee is registered.");
  }
  if (chargeTax && interState === null) {
    warnings.push("Tax has been charged but the movement type is unknown, so it is shown as CGST + SGST by default.");
  }
  if (ewbRequired && distance === null) {
    warnings.push("An e-way bill is needed, but without an approximate distance its validity period cannot be worked out.");
  }
  if (reason.id === "skd-ckd") {
    warnings.push(
      "Rule 55(5): the complete invoice goes with the first consignment, each later consignment carries a challan referring back to that invoice, and the original invoice travels with the last one.",
    );
  }
  if (reason.id === "invoice-later") {
    warnings.push("Rule 55(4): the tax invoice has to be issued after the goods are delivered.");
  }

  return {
    challan: {
      number: String(challanNumber).trim(),
      date: challanDate,
      dateFormatted: formatDate(challanDate),
      financialYear: financialYearOf(challanDate),
      reason,
      copies: CHALLAN_COPIES,
    },
    parties: {
      consigner: {
        name: String(consigner.name || "").trim(),
        address: String(consigner.address || "").trim(),
        gstin: consignerGstin.valid ? consignerGstin.gstin : "",
        stateCode: consignerState,
        stateName: GST_STATE_CODES[consignerState] || "",
      },
      consignee: {
        name: String(consignee.name || "").trim(),
        address: String(consignee.address || "").trim(),
        gstin: consigneeGstin.valid ? consigneeGstin.gstin : "",
        stateCode: consigneeState,
        stateName: GST_STATE_CODES[consigneeState] || "",
      },
      interState,
      placeOfSupply: String(input.placeOfSupply || "").trim(),
    },
    lines,
    totals: { ...totals, tax: taxTotal, consignmentValue },
    amountInWords: amountInWords(consignmentValue),
    forSupply: chargeTax,
    transport: {
      mode: String(transport.mode || "").trim(),
      vehicle: String(transport.vehicle || "").trim().toUpperCase(),
      transporterId: String(transport.transporterId || "").trim().toUpperCase(),
      distanceKm: distance,
      overDimensional: odc,
    },
    ewayBill: {
      required: ewbRequired,
      reasons: ewbReasons,
      threshold: applicableThreshold,
      thresholdIsCustom: interState === false && threshold !== EWB_THRESHOLD,
      validityDays,
      kmPerDay,
      partBExempt,
      partBNote: partBExempt
        ? `Rule 138(3) proviso: on a leg of up to ${PART_B_EXEMPT_KM} km within the State, between the consignor and the transporter or between the transporter and the consignee, Part B need not be filled.`
        : `Part B of FORM GST EWB-01 carries the vehicle number and has to be filled before movement, except on a leg of up to ${PART_B_EXEMPT_KM} km within the State.`,
    },
    jobWork: jobWorkBlock,
    missing,
    warnings,
  };
}

/** ITC-04 period and due date for goods sent out on a given date. */
export function buildItc04(dispatchIso, aato) {
  const date = parseIsoDate(dispatchIso);
  if (!date) return null;
  const halfYearly = aato > ITC04_TURNOVER_LIMIT;

  if (halfYearly) {
    const firstHalf = date.month >= 4 && date.month <= 9;
    if (firstHalf) {
      return {
        frequency: "Half-yearly",
        period: `April ${date.year} to September ${date.year}`,
        dueDate: `${date.year}-10-25`,
        basis: "Aggregate annual turnover above Rs 5 crore: ITC-04 is half-yearly, due by 25 October for April to September.",
      };
    }
    const periodStartYear = date.month >= 10 ? date.year : date.year - 1;
    return {
      frequency: "Half-yearly",
      period: `October ${periodStartYear} to March ${periodStartYear + 1}`,
      dueDate: `${periodStartYear + 1}-04-25`,
      basis: "Aggregate annual turnover above Rs 5 crore: ITC-04 is half-yearly, due by 25 April for October to March.",
    };
  }

  const fy = financialYearOf(dispatchIso);
  return {
    frequency: "Annual",
    period: `FY ${fy.label} (April ${fy.startYear} to March ${fy.endYear})`,
    dueDate: `${fy.endYear}-04-25`,
    basis: "Aggregate annual turnover up to Rs 5 crore: ITC-04 is annual, due by 25 April after the financial year.",
  };
}

/** Rupees, Indian digit grouping, two decimals. */
export function formatInr(value) {
  if (!Number.isFinite(value)) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Plain-text challan, one copy marking per print. */
export function challanToText(result, copyMarking = CHALLAN_COPIES[0].marking) {
  if (!result || result.error) return "";
  const lines = [];
  lines.push("DELIVERY CHALLAN");
  lines.push(`(Rule 55 of the CGST Rules, 2017 — ${result.challan.reason.clause})`);
  lines.push(copyMarking);
  lines.push("");
  lines.push(`Challan No: ${result.challan.number || "—"}    Date: ${result.challan.dateFormatted}`);
  lines.push(`Reason for movement: ${result.challan.reason.label}`);
  lines.push("");
  lines.push("CONSIGNER");
  lines.push(result.parties.consigner.name || "—");
  lines.push(result.parties.consigner.address || "—");
  lines.push(
    `GSTIN: ${result.parties.consigner.gstin || "Unregistered"}    State: ${result.parties.consigner.stateName || "—"} (${result.parties.consigner.stateCode || "—"})`,
  );
  lines.push("");
  lines.push("CONSIGNEE");
  lines.push(result.parties.consignee.name || "—");
  lines.push(result.parties.consignee.address || "—");
  lines.push(
    `GSTIN/UIN: ${result.parties.consignee.gstin || "Unregistered"}    State: ${result.parties.consignee.stateName || "—"} (${result.parties.consignee.stateCode || "—"})`,
  );
  if (result.parties.interState) {
    lines.push(`Place of supply: ${result.parties.placeOfSupply || "—"}`);
  }
  lines.push("");
  const header = ["#", "Description", "HSN", "Qty", "UOM", "Rate", "Taxable value"];
  if (result.forSupply) header.push("Tax %", "CGST", "SGST", "IGST");
  lines.push(header.join("\t"));
  for (const line of result.lines) {
    const row = [
      line.serial,
      line.description || "—",
      line.hsn || "—",
      line.provisional ? `${line.quantity} (provisional)` : line.quantity,
      line.uom || "—",
      line.rate.toFixed(2),
      line.taxableValue.toFixed(2),
    ];
    if (result.forSupply) {
      row.push(`${line.taxRate}%`, line.cgst.toFixed(2), line.sgst.toFixed(2), line.igst.toFixed(2));
    }
    lines.push(row.join("\t"));
  }
  lines.push("");
  lines.push(`Taxable value: ${result.totals.taxable.toFixed(2)}`);
  if (result.forSupply) {
    lines.push(
      `CGST: ${result.totals.cgst.toFixed(2)}    SGST: ${result.totals.sgst.toFixed(2)}    IGST: ${result.totals.igst.toFixed(2)}`,
    );
  }
  lines.push(`Consignment value (Explanation 2 to Rule 138(1)): ${result.totals.consignmentValue.toFixed(2)}`);
  lines.push(result.amountInWords);
  lines.push("");
  lines.push(
    `Transport: ${result.transport.mode || "—"}   Vehicle: ${result.transport.vehicle || "—"}   Transporter ID: ${result.transport.transporterId || "—"}   Distance: ${result.transport.distanceKm === null ? "—" : `${result.transport.distanceKm} km`}`,
  );
  lines.push(
    `E-way bill: ${result.ewayBill.required ? "required" : "not required"}${
      result.ewayBill.required && result.ewayBill.validityDays
        ? ` · validity ${result.ewayBill.validityDays} day${result.ewayBill.validityDays === 1 ? "" : "s"} from generation`
        : ""
    }`,
  );
  for (const reason of result.ewayBill.reasons) lines.push(`  - ${reason}`);
  if (result.jobWork) {
    lines.push("");
    lines.push(
      result.jobWork.tooling
        ? `Job work: tooling — ${result.jobWork.basis}`
        : `Job work: ${result.jobWork.goodsType === "inputs" ? "inputs" : "capital goods"} sent on ${formatDate(result.jobWork.dispatchDate)}, due back by ${formatDate(result.jobWork.returnBy)} (extendable to ${formatDate(result.jobWork.extendedReturnBy)}).`,
    );
    if (result.jobWork.itc04) {
      lines.push(
        `ITC-04: ${result.jobWork.itc04.frequency}, ${result.jobWork.itc04.period}, due ${formatDate(result.jobWork.itc04.dueDate)}.`,
      );
    }
  }
  lines.push("");
  lines.push("For " + (result.parties.consigner.name || "the consigner"));
  lines.push("");
  lines.push("Authorised signatory");
  return lines.join("\n");
}
