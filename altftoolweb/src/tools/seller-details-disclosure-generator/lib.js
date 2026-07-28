/**
 * Seller details disclosure block — text builder plus GSTIN, PAN and CIN checks.
 *
 * What the law asks for (India):
 *  - Consumer Protection (E-Commerce) Rules, 2020, Rule 4(2): every e-commerce
 *    entity shall provide on its platform (a) its legal name, (b) the principal
 *    geographic address of its headquarters and all branches, (c) the name and
 *    details of its website, and (d) contact details including e-mail address,
 *    fax, landline and mobile numbers of customer care and of the grievance
 *    officer.
 *  - Rule 5(3): every seller offering goods or services through a marketplace
 *    shall provide the same particulars, together with its GSTIN and PAN where
 *    applicable, so that the buyer can see who they are contracting with.
 *  - Companies Act, 2013, s.12(3)(c): a company must print its name, registered
 *    office address, Corporate Identity Number, telephone number and e-mail on
 *    all business letters, billheads and other official publications.
 *  - Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6: the name and
 *    address of the manufacturer, packer or importer must be declared on the
 *    listing for a packaged commodity sold online.
 *
 * Identifier formats:
 *  - PAN: five letters, four digits, one letter. The fourth character encodes
 *    the holder type (P individual, C company, H HUF, F firm, A AOP, T trust,
 *    B body of individuals, L local authority, J artificial juridical person,
 *    G government).
 *  - GSTIN: fifteen characters — a two-digit state code, the ten-character PAN,
 *    a one-character entity code, the letter Z, and a mod-36 check character.
 *  - CIN: twenty-one characters — listing status (L or U), a five-digit
 *    industry code, a two-letter state code, a four-digit year of
 *    incorporation, a three-letter ownership type and a six-digit registration
 *    number.
 */

const GSTIN_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;
const CIN_RE = /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;

/** Fourth character of a PAN — the holder type. */
export const PAN_HOLDER_TYPES = {
  P: "Individual",
  C: "Company",
  H: "Hindu Undivided Family",
  F: "Firm or LLP",
  A: "Association of persons",
  T: "Trust",
  B: "Body of individuals",
  L: "Local authority",
  J: "Artificial juridical person",
  G: "Government",
};

/** GST state codes as used in the first two digits of a GSTIN. */
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
  97: "Other territory",
  99: "Centre jurisdiction",
};

export const ENTITY_TYPES = [
  { key: "proprietorship", label: "Sole proprietorship", needsCin: false, panType: "P" },
  { key: "partnership", label: "Partnership firm", needsCin: false, panType: "F" },
  { key: "llp", label: "Limited liability partnership", needsCin: true, panType: "F" },
  { key: "privateLimited", label: "Private limited company", needsCin: true, panType: "C" },
  { key: "publicLimited", label: "Public limited company", needsCin: true, panType: "C" },
  { key: "opc", label: "One person company", needsCin: true, panType: "C" },
  { key: "huf", label: "Hindu Undivided Family", needsCin: false, panType: "H" },
  { key: "trust", label: "Trust or society", needsCin: false, panType: "T" },
];

export const SELLING_CHANNELS = [
  { key: "ownStore", label: "Own website or app (inventory model)" },
  { key: "marketplace", label: "Third-party marketplace listing" },
  { key: "both", label: "Both own store and marketplaces" },
];

const clean = (value) => String(value || "").toUpperCase().replace(/\s+/g, "");

/**
 * Validate a PAN and describe the holder type it encodes.
 * @param {string} value
 */
export function validatePan(value) {
  const pan = clean(value);
  if (!pan) return { provided: false, valid: false, message: "PAN not entered." };
  if (pan.length !== 10) {
    return { provided: true, valid: false, message: "A PAN is exactly 10 characters long." };
  }
  if (!PAN_RE.test(pan)) {
    return {
      provided: true,
      valid: false,
      message: "A PAN reads as five letters, four digits and one letter, for example ABCDE1234F.",
    };
  }
  const holderCode = pan[3];
  const holderType = PAN_HOLDER_TYPES[holderCode] || null;
  if (!holderType) {
    return {
      provided: true,
      valid: false,
      message: `"${holderCode}" is not a recognised holder-type letter in the fourth position of a PAN.`,
    };
  }
  return { provided: true, valid: true, value: pan, holderCode, holderType, message: `Valid PAN for a: ${holderType}.` };
}

/**
 * Compute the GSTIN check character from the first fourteen characters.
 * Each character's value is multiplied by an alternating factor of 1 and 2;
 * the quotient and remainder of that product divided by 36 are summed, and the
 * check character is the one whose value is (36 - sum mod 36) mod 36.
 * @param {string} first14
 * @returns {string|null}
 */
export function gstinCheckCharacter(first14) {
  const body = clean(first14);
  if (body.length !== 14) return null;
  let sum = 0;
  for (let index = 0; index < 14; index += 1) {
    const position = GSTIN_ALPHABET.indexOf(body[index]);
    if (position < 0) return null;
    const factor = index % 2 === 0 ? 1 : 2;
    const product = position * factor;
    sum += Math.floor(product / 36) + (product % 36);
  }
  return GSTIN_ALPHABET[(36 - (sum % 36)) % 36];
}

/**
 * Validate a GSTIN's shape, state code and check character, and pull out the PAN.
 * @param {string} value
 * @param {string} [expectedPan] the PAN entered separately, for a cross-check
 */
export function validateGstin(value, expectedPan = "") {
  const gstin = clean(value);
  if (!gstin) return { provided: false, valid: false, message: "GSTIN not entered." };
  if (gstin.length !== 15) {
    return { provided: true, valid: false, message: "A GSTIN is exactly 15 characters long." };
  }
  if (!GSTIN_RE.test(gstin)) {
    return {
      provided: true,
      valid: false,
      message:
        "A GSTIN reads as a two-digit state code, a ten-character PAN, an entity code, the letter Z and a check character.",
    };
  }
  const stateCode = gstin.slice(0, 2);
  const stateName = GST_STATE_CODES[stateCode] || GST_STATE_CODES[String(Number(stateCode))] || null;
  if (!stateName) {
    return { provided: true, valid: false, message: `"${stateCode}" is not an allotted GST state code.` };
  }
  const expected = gstinCheckCharacter(gstin.slice(0, 14));
  if (expected !== gstin[14]) {
    return {
      provided: true,
      valid: false,
      stateCode,
      stateName,
      message: `The check character does not match — for these first 14 characters it should be "${expected}".`,
    };
  }
  const embeddedPan = gstin.slice(2, 12);
  const wanted = clean(expectedPan);
  const panMatches = wanted ? wanted === embeddedPan : null;
  return {
    provided: true,
    valid: true,
    value: gstin,
    stateCode,
    stateName,
    embeddedPan,
    panMatches,
    message: `Valid GSTIN registered in ${stateName}.`,
  };
}

/**
 * Validate a CIN and decode the parts it encodes.
 * @param {string} value
 */
export function validateCin(value) {
  const cin = clean(value);
  if (!cin) return { provided: false, valid: false, message: "CIN not entered." };
  if (cin.length !== 21) {
    return { provided: true, valid: false, message: "A CIN is exactly 21 characters long." };
  }
  if (!CIN_RE.test(cin)) {
    return {
      provided: true,
      valid: false,
      message:
        "A CIN reads as L or U, five digits, a two-letter state code, a four-digit year, three letters and six digits.",
    };
  }
  const year = Number(cin.slice(8, 12));
  if (year < 1850 || year > 2200) {
    return { provided: true, valid: false, message: `"${year}" is not a plausible year of incorporation.` };
  }
  return {
    provided: true,
    valid: true,
    value: cin,
    listed: cin[0] === "L",
    industryCode: cin.slice(1, 6),
    stateCode: cin.slice(6, 8),
    incorporationYear: year,
    ownershipCode: cin.slice(12, 15),
    registrationNumber: cin.slice(15),
    message: `Valid CIN for ${cin[0] === "L" ? "a listed" : "an unlisted"} company incorporated in ${year}.`,
  };
}

const REQUIRED = [
  ["legalName", "the legal name of the seller"],
  ["registeredAddress", "the registered or principal address"],
  ["supportEmail", "a customer care email address"],
  ["supportPhone", "a customer care phone number"],
  ["websiteName", "the name of the website or store"],
];

/**
 * Build the seller details disclosure block, in plain text and as an HTML fragment.
 * @returns {object} { text, html, checks, missing, warnings } or { error }
 */
export function buildSellerDisclosure(input = {}) {
  const {
    entityType = "privateLimited",
    channel = "both",
    legalName = "",
    tradeName = "",
    websiteName = "",
    websiteUrl = "",
    registeredAddress = "",
    branchAddresses = "",
    warehouseAddress = "",
    supportEmail = "",
    supportPhone = "",
    supportHours = "Monday to Saturday, 10:00 to 18:00 IST",
    gstin = "",
    pan = "",
    cin = "",
    fssai = "",
    importerName = "",
    countryOfOrigin = "",
  } = input;

  const entity = ENTITY_TYPES.find((item) => item.key === entityType);
  if (!entity) return { error: "Choose the legal form of the seller." };

  const sellingChannel = SELLING_CHANNELS.find((item) => item.key === channel);
  if (!sellingChannel) return { error: "Choose where you sell." };

  const panCheck = validatePan(pan);
  const gstinCheck = validateGstin(gstin, pan);
  const cinCheck = validateCin(cin);

  const missing = REQUIRED.filter(([key]) => !String(input[key] || "").trim()).map(
    ([, label]) => label,
  );

  const warnings = [];
  if (entity.needsCin && !cinCheck.provided) {
    warnings.push(
      "Section 12(3)(c) of the Companies Act, 2013 requires a company or LLP to publish its CIN alongside its name, registered office, phone number and email.",
    );
  }
  if (panCheck.provided && !panCheck.valid) warnings.push(`PAN: ${panCheck.message}`);
  if (gstinCheck.provided && !gstinCheck.valid) warnings.push(`GSTIN: ${gstinCheck.message}`);
  if (cinCheck.provided && !cinCheck.valid) warnings.push(`CIN: ${cinCheck.message}`);
  if (gstinCheck.valid && panCheck.valid && gstinCheck.panMatches === false) {
    warnings.push(
      `The PAN embedded in the GSTIN (${gstinCheck.embeddedPan}) does not match the PAN entered (${panCheck.value}).`,
    );
  }
  if (panCheck.valid && entity.panType && panCheck.holderCode !== entity.panType) {
    warnings.push(
      `The PAN entered is issued to this holder type: ${panCheck.holderType}. The entity type selected is: ${entity.label}. Check which one is wrong.`,
    );
  }
  if (!warnings.length && !missing.length) {
    warnings.push("Every identifier entered passed its format and checksum test.");
  }

  const rows = [
    ["Legal name of the seller", legalName],
    ["Trade name / brand", tradeName],
    ["Legal form", entity.label],
    ["Website or store", websiteUrl ? `${websiteName} (${websiteUrl})` : websiteName],
    ["Registered / principal place of business", registeredAddress],
    ["Branch offices", branchAddresses],
    ["Despatch warehouse", warehouseAddress],
    ["Customer care email", supportEmail],
    ["Customer care phone", supportPhone],
    ["Customer care hours", supportHours],
    ["GSTIN", gstinCheck.valid ? `${gstinCheck.value} (${gstinCheck.stateName})` : gstin],
    ["PAN", panCheck.valid ? panCheck.value : pan],
    ["CIN", cinCheck.valid ? cinCheck.value : cin],
    ["FSSAI licence", fssai],
    ["Importer", importerName],
    ["Country of origin", countryOfOrigin],
  ].filter(([, value]) => String(value || "").trim());

  const text = [
    "SELLER DETAILS",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    sellingChannel.key === "marketplace" || sellingChannel.key === "both"
      ? "These particulars are published under Rule 5(3) of the Consumer Protection (E-Commerce) Rules, 2020."
      : "These particulars are published under Rule 4(2) of the Consumer Protection (E-Commerce) Rules, 2020.",
  ].join("\n");

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const html = [
    '<section class="seller-details">',
    "  <h2>Seller details</h2>",
    "  <dl>",
    ...rows.flatMap(([label, value]) => [
      `    <dt>${escapeHtml(label)}</dt>`,
      `    <dd>${escapeHtml(value)}</dd>`,
    ]),
    "  </dl>",
    "</section>",
  ].join("\n");

  return {
    text,
    html,
    rows,
    missing,
    warnings,
    checks: { pan: panCheck, gstin: gstinCheck, cin: cinCheck },
    entity,
    channel: sellingChannel,
    complete: missing.length === 0,
    fieldCount: rows.length,
  };
}
