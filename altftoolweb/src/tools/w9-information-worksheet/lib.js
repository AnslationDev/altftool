/**
 * Worksheet for IRS Form W-9, Request for Taxpayer Identification Number and
 * Certification.
 *
 * Rules encoded here, from the form and its instructions:
 *
 *  - Line 1 carries the name shown on your income tax return. It is never left
 *    blank and it is never the trade name if the trade name is different.
 *  - Line 2 carries the business, trade or disregarded entity name where that
 *    differs from line 1.
 *  - Line 3a is the federal tax classification. The trap is the single-member
 *    LLC: if it is a disregarded entity, you do NOT tick the LLC box. You tick
 *    "Individual/sole proprietor or single-member LLC", put the owner's name on
 *    line 1 and the LLC's name on line 2, and give the owner's TIN. The LLC box
 *    is for an LLC taxed as a C corporation, an S corporation or a partnership,
 *    and the letter C, S or P goes in the space provided.
 *  - Line 4 carries an exempt payee code and a FATCA exemption code where they
 *    apply. Most individuals and sole proprietors are not exempt payees.
 *  - Part I is the taxpayer identification number: an SSN for an individual or
 *    sole proprietor, an EIN for a corporation, partnership, trust or estate.
 *    A sole proprietor with an EIN may give either, but the IRS prefers the SSN
 *    so the number matches the name on line 1.
 *  - Part II is the certification. Where you have been notified by the IRS that
 *    you are currently subject to backup withholding for underreported interest
 *    or dividends, item 2 of the certification must be struck out before signing.
 *  - Backup withholding under section 3406 is 24 per cent of the reportable
 *    payment, applied when a payee does not furnish a correct TIN or fails to
 *    certify. That rate has applied since the Tax Cuts and Jobs Act.
 *  - Penalties: section 6723 sets a penalty for failing to furnish a correct
 *    TIN, and section 6682 a larger one for a false statement with no
 *    reasonable basis that results in no backup withholding.
 *  - A foreign person does not use Form W-9. An individual uses Form W-8BEN, an
 *    entity Form W-8BEN-E, and a person with effectively connected income
 *    Form W-8ECI.
 *
 * Reporting thresholds change by legislation, so the threshold is an input here
 * rather than a constant: the long-standing figure for nonemployee compensation
 * on Form 1099-NEC was 600 dollars, and Congress has since legislated an
 * increase with inflation indexing. Check the current year's instructions.
 *
 * Informational only. This is not tax or legal advice — a US tax professional
 * should confirm the classification for anything unusual.
 */

/** Backup withholding rate under section 3406. */
export const BACKUP_WITHHOLDING_RATE = 0.24;

/** Historical reporting threshold for nonemployee compensation, in dollars. */
export const LEGACY_1099_THRESHOLD = 600;

export const MAX_PAYMENT = 1000000000;

export const TIN_TYPES = [
  { id: "ssn", label: "SSN — Social Security Number", format: "XXX-XX-XXXX" },
  { id: "ein", label: "EIN — Employer Identification Number", format: "XX-XXXXXXX" },
  { id: "itin", label: "ITIN — Individual Taxpayer Identification Number", format: "9XX-XX-XXXX" },
];

/**
 * Federal tax classifications from line 3a, with what each one implies for the
 * name lines and the TIN.
 */
export const CLASSIFICATIONS = [
  {
    id: "individual",
    label: "Individual / sole proprietor",
    box: "Individual/sole proprietor or single-member LLC",
    line1: "Your own legal name, exactly as it appears on your tax return.",
    line2: "Your trade or DBA name, if you use one.",
    tinTypes: ["ssn", "ein", "itin"],
    preferredTin: "ssn",
    note: "A sole proprietor with an EIN may give either number, but the IRS prefers the SSN because it matches the individual name on line 1.",
  },
  {
    id: "smllcDisregarded",
    label: "Single-member LLC, disregarded for tax",
    box: "Individual/sole proprietor or single-member LLC — NOT the LLC box",
    line1: "The owner's name, not the LLC's name.",
    line2: "The LLC's name.",
    tinTypes: ["ssn", "ein"],
    preferredTin: "ssn",
    note: "This is the most common W-9 error. Ticking the LLC box for a disregarded single-member LLC causes a TIN mismatch notice, because the IRS matches the number against the owner's name.",
  },
  {
    id: "llcC",
    label: "LLC taxed as a C corporation",
    box: "Limited liability company — enter C",
    line1: "The LLC's legal name.",
    line2: "A trade name, if different from line 1.",
    tinTypes: ["ein"],
    preferredTin: "ein",
    note: "Write the letter C in the space next to the LLC box so the payer knows which return the entity files.",
  },
  {
    id: "llcS",
    label: "LLC taxed as an S corporation",
    box: "Limited liability company — enter S",
    line1: "The LLC's legal name.",
    line2: "A trade name, if different from line 1.",
    tinTypes: ["ein"],
    preferredTin: "ein",
    note: "The S election must actually be on file with the IRS — ticking S without a Form 2553 acceptance causes problems later.",
  },
  {
    id: "llcP",
    label: "LLC taxed as a partnership",
    box: "Limited liability company — enter P",
    line1: "The LLC's legal name.",
    line2: "A trade name, if different from line 1.",
    tinTypes: ["ein"],
    preferredTin: "ein",
    note: "A multi-member LLC defaults to partnership treatment unless it has elected corporate status.",
  },
  {
    id: "cCorp",
    label: "C corporation",
    box: "C corporation",
    line1: "The corporation's legal name as registered.",
    line2: "A trade name, if different from line 1.",
    tinTypes: ["ein"],
    preferredTin: "ein",
    note: "Payments to a corporation are generally exempt from Form 1099-NEC reporting, though legal fees and a few other categories are still reported.",
  },
  {
    id: "sCorp",
    label: "S corporation",
    box: "S corporation",
    line1: "The corporation's legal name as registered.",
    line2: "A trade name, if different from line 1.",
    tinTypes: ["ein"],
    preferredTin: "ein",
    note: "Same reporting exemption as a C corporation, with the same carve-outs for legal and medical payments.",
  },
  {
    id: "partnership",
    label: "Partnership",
    box: "Partnership",
    line1: "The partnership's legal name.",
    line2: "A trade name, if different from line 1.",
    tinTypes: ["ein"],
    preferredTin: "ein",
    note: "A flow-through entity with foreign partners has an extra box to tick on the current revision of the form.",
  },
  {
    id: "trust",
    label: "Trust or estate",
    box: "Trust/estate",
    line1: "The trust or estate name as it appears on the tax return.",
    line2: "Leave blank unless a different name is used.",
    tinTypes: ["ein", "ssn"],
    preferredTin: "ein",
    note: "A grantor trust reporting under an alternative method may use the grantor's SSN — check the trust's reporting method first.",
  },
];

/** Exempt payee codes most likely to be relevant, from the W-9 instructions. */
export const EXEMPT_PAYEE_CODES = [
  { code: "", label: "Not exempt — most individuals, sole proprietors and small businesses" },
  { code: "1", label: "1 — An organisation exempt from tax under section 501(a) or an IRA" },
  { code: "3", label: "3 — A state, the District of Columbia, a US commonwealth or their subdivisions" },
  { code: "5", label: "5 — A corporation" },
  { code: "7", label: "7 — A futures commission merchant registered with the CFTC" },
  { code: "11", label: "11 — A financial institution" },
];

/**
 * Validate a taxpayer identification number for shape only.
 * This checks format, not whether the number was ever issued.
 */
export function validateTin(raw, tinType) {
  const value = String(raw ?? "").trim();
  if (!value) return { valid: false, reason: "Enter the taxpayer identification number." };

  const digits = value.replace(/\D/g, "");
  if (digits.length !== 9) {
    return { valid: false, reason: "A TIN has exactly 9 digits — check for a missing or extra digit." };
  }

  if (tinType === "ein") {
    // An EIN prefix of 00 was never issued.
    if (digits.slice(0, 2) === "00") {
      return { valid: false, reason: "An EIN never starts with 00." };
    }
    return { valid: true, formatted: `${digits.slice(0, 2)}-${digits.slice(2)}` };
  }

  const area = digits.slice(0, 3);
  const group = digits.slice(3, 5);
  const serial = digits.slice(5);

  if (tinType === "itin") {
    // ITINs always begin with 9 and have a group in specific ranges.
    if (area[0] !== "9") {
      return { valid: false, reason: "An ITIN always begins with the digit 9." };
    }
    return { valid: true, formatted: `${area}-${group}-${serial}` };
  }

  // SSN shape rules published by the Social Security Administration.
  if (area === "000" || area === "666" || area[0] === "9") {
    return {
      valid: false,
      reason: "No SSN begins with 000, 666 or 9 — a number starting with 9 is an ITIN.",
    };
  }
  if (group === "00") return { valid: false, reason: "The middle group of an SSN is never 00." };
  if (serial === "0000") return { valid: false, reason: "The last four digits of an SSN are never 0000." };

  return { valid: true, formatted: `${area}-${group}-${serial}` };
}

/**
 * Build the worksheet.
 *
 * @param {object} input
 * @param {string} input.classificationId  id from CLASSIFICATIONS
 * @param {string} input.legalName         line 1
 * @param {string} input.businessName      line 2
 * @param {string} input.tinType           id from TIN_TYPES
 * @param {string} input.tin               the number as typed
 * @param {string} input.address           lines 5 and 6
 * @param {string} input.exemptPayeeCode   line 4
 * @param {boolean} input.isForeignPerson  triggers the W-8 redirect
 * @param {boolean} input.subjectToBackupWithholding IRS has notified the payee
 * @param {number} input.expectedPayment   expected annual payment in dollars
 * @param {number} input.reportingThreshold  1099-NEC threshold for the year
 * @returns {object} lines, checks and exposure — or { error }
 */
export function buildW9Worksheet({
  classificationId = "individual",
  legalName = "",
  businessName = "",
  tinType = "ssn",
  tin = "",
  address = "",
  exemptPayeeCode = "",
  isForeignPerson = false,
  subjectToBackupWithholding = false,
  expectedPayment = 0,
  reportingThreshold = LEGACY_1099_THRESHOLD,
} = {}) {
  if (isForeignPerson) {
    return {
      error:
        "A foreign person does not complete Form W-9. Use Form W-8BEN if you are an individual, Form W-8BEN-E for an entity, or Form W-8ECI for income effectively connected with a US trade or business.",
    };
  }

  const classification = CLASSIFICATIONS.find((item) => item.id === classificationId);
  if (!classification) return { error: "Choose the federal tax classification." };

  if (!TIN_TYPES.some((item) => item.id === tinType)) {
    return { error: "Choose which kind of taxpayer identification number you will give." };
  }
  if (!classification.tinTypes.includes(tinType)) {
    return {
      error: `A ${classification.label.toLowerCase()} cannot give a ${tinType.toUpperCase()} on line 1 — this classification uses ${classification.tinTypes
        .map((item) => item.toUpperCase())
        .join(" or ")}.`,
    };
  }

  const payment = Number(expectedPayment);
  if (!Number.isFinite(payment) || payment < 0) {
    return { error: "Expected annual payment must be zero or more." };
  }
  if (payment > MAX_PAYMENT) {
    return { error: "That payment figure is beyond what this worksheet handles." };
  }

  const threshold = Number(reportingThreshold);
  if (!Number.isFinite(threshold) || threshold < 0) {
    return { error: "The reporting threshold must be zero or more." };
  }

  const name = String(legalName).trim();
  const trade = String(businessName).trim();
  const where = String(address).trim();
  const tinCheck = validateTin(tin, tinType);

  const lines = [
    {
      id: "line1",
      label: "Line 1 — Name",
      guidance: classification.line1,
      value: name,
      complete: name.length > 0,
    },
    {
      id: "line2",
      label: "Line 2 — Business name / disregarded entity name",
      guidance: classification.line2,
      value: trade,
      complete: true,
      optional: true,
    },
    {
      id: "line3",
      label: "Line 3a — Federal tax classification",
      guidance: `Tick: ${classification.box}`,
      value: classification.box,
      complete: true,
    },
    {
      id: "line4",
      label: "Line 4 — Exemptions",
      guidance:
        "An exempt payee code stops backup withholding; a FATCA code applies only to accounts maintained outside the United States. Most individuals leave both blank.",
      value:
        EXEMPT_PAYEE_CODES.find((item) => item.code === String(exemptPayeeCode))?.label ??
        "Not exempt",
      complete: true,
      optional: true,
    },
    {
      id: "lines56",
      label: "Lines 5 and 6 — Address",
      guidance: "The address the payer will post information returns to. Keep it current — a 1099 sent to an old address is still your income.",
      value: where,
      complete: where.length > 0,
    },
    {
      id: "partI",
      label: "Part I — Taxpayer identification number",
      guidance: `${TIN_TYPES.find((item) => item.id === tinType)?.label}. ${classification.note}`,
      value: tinCheck.valid ? tinCheck.formatted : "",
      complete: tinCheck.valid,
    },
    {
      id: "partII",
      label: "Part II — Certification and signature",
      guidance: subjectToBackupWithholding
        ? "Strike out item 2 of the certification before signing, because the IRS has notified you that you are currently subject to backup withholding."
        : "Sign and date. Signing certifies that the TIN is correct, that you are not subject to backup withholding, and that you are a US person.",
      value: "To be signed",
      complete: false,
      manual: true,
    },
  ];

  const checks = [];
  if (!tinCheck.valid) checks.push(`Part I: ${tinCheck.reason}`);
  if (!name) checks.push("Line 1 is blank. It is never left blank, and it is never the trade name.");
  if (classificationId === "smllcDisregarded" && trade === "") {
    checks.push("Line 2 should carry the LLC's name, with the owner's name on line 1.");
  }
  if (classificationId === "smllcDisregarded" && name && trade && name === trade) {
    checks.push(
      "Lines 1 and 2 are identical. For a disregarded single-member LLC they differ: the owner goes on line 1, the LLC on line 2.",
    );
  }
  if (tinType !== classification.preferredTin) {
    checks.push(
      `The IRS prefers a ${classification.preferredTin.toUpperCase()} for this classification, because it matches the name that goes on line 1.`,
    );
  }
  if (!where) checks.push("Lines 5 and 6 are blank — the payer needs somewhere to post the 1099.");
  if (subjectToBackupWithholding) {
    checks.push(
      "Item 2 of the certification must be struck out before you sign, and the payer will withhold at 24 per cent until the IRS lifts the notice.",
    );
  }

  const requiredLines = lines.filter((line) => !line.optional && !line.manual);
  const completedLines = requiredLines.filter((line) => line.complete);
  const completeness = Math.round((completedLines.length / requiredLines.length) * 100);

  const reportable = payment >= threshold;
  const corporateExemption = classificationId === "cCorp" || classificationId === "sCorp";
  const withholdingRisk = tinCheck.valid && !subjectToBackupWithholding ? 0 : payment * BACKUP_WITHHOLDING_RATE;

  return {
    classification,
    lines,
    checks,
    completeness,
    completedLines: completedLines.length,
    requiredLines: requiredLines.length,
    tinValid: tinCheck.valid,
    tinFormatted: tinCheck.valid ? tinCheck.formatted : "",
    tinReason: tinCheck.valid ? "" : tinCheck.reason,
    payment,
    threshold,
    reportable,
    corporateExemption,
    backupWithholdingRate: BACKUP_WITHHOLDING_RATE,
    withholdingRisk,
    netIfWithheld: payment - withholdingRisk,
  };
}
