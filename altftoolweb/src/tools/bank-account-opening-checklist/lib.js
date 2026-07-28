/**
 * Bank account opening checklist for India.
 *
 * The document rules come from the RBI Master Direction on Know Your Customer
 * (KYC), 2016 as amended, and the Prevention of Money-laundering (Maintenance
 * of Records) Rules, 2005:
 *
 *  - Officially Valid Documents (OVDs) are a closed list: passport, driving
 *    licence, proof of possession of an Aadhaar number, Voter's Identity Card
 *    issued by the Election Commission, a job card issued under NREGA signed by
 *    a State Government officer, and a letter issued by the National Population
 *    Register containing name and address. A PAN card is not an OVD.
 *
 *  - Where the OVD carries an old address, a "deemed OVD" may be used for
 *    address: a utility bill not more than two months old (electricity,
 *    telephone, post-paid mobile, piped gas or water), a municipal or property
 *    tax receipt, a pension payment order to a retired government or PSU
 *    employee showing the address, or an accommodation allotment letter from a
 *    government, PSU, scheduled bank, financial institution or listed company.
 *    An OVD carrying the current address must then be produced within three
 *    months.
 *
 *  - PAN or a signed Form 60 is mandatory for account opening, under Rule 114B
 *    of the Income-tax Rules and the PML Rules.
 *
 *  - A Small Account may be opened without an OVD on a self-attested photograph
 *    and signature or thumb impression taken before a bank officer. It carries
 *    hard limits: aggregate credits of up to Rs 1,00,000 in a financial year,
 *    aggregate withdrawals and transfers of up to Rs 10,000 a month, and a
 *    balance of up to Rs 50,000 at any time. It is valid for 12 months, and for
 *    a further 12 months on proof that an OVD has been applied for.
 *
 *  - A Basic Savings Bank Deposit Account (BSBDA) is a zero-balance account
 *    with a minimum of four cash withdrawals a month free of charge, and needs
 *    normal full KYC.
 *
 *  - Video-based Customer Identification Process (V-CIP) is a permitted
 *    alternative to in-person verification under the KYC Master Direction.
 *
 *  - A proprietorship current account needs, beyond the proprietor's own KYC,
 *    any two documents proving the activity of the firm in its own name -
 *    registration certificate, GST registration, shops and establishment
 *    licence, professional or trade licence, IEC, the firm's income tax return,
 *    a CST/VAT/service tax certificate, or utility bills in the firm's name.
 *
 *  - Minors: RBI's circular of 6 May 2014 allows a minor above 10 to open and
 *    operate a savings account independently, subject to limits set by the bank.
 *    A younger minor operates through a natural or legal guardian.
 *
 *  - Non-resident accounts sit under the Foreign Exchange Management (Deposit)
 *    Regulations, 2016 - NRE under Schedule 1, FCNR(B) under Schedule 2 and NRO
 *    under Schedule 3. Interest on an NRE deposit is exempt from Indian income
 *    tax under section 10(4)(ii) while the account holder is a person resident
 *    outside India; interest on an NRO account is taxable, with tax deducted at
 *    source under section 195.
 *
 * Informational only. Banks add their own requirements and the rules change;
 * confirm the list with the branch before you travel to it.
 */

/** Small Account limits, from the PML Rules. */
export const SMALL_ACCOUNT_ANNUAL_CREDIT_LIMIT = 100000;
export const SMALL_ACCOUNT_MONTHLY_DEBIT_LIMIT = 10000;
export const SMALL_ACCOUNT_BALANCE_LIMIT = 50000;
export const SMALL_ACCOUNT_VALIDITY_MONTHS = 12;

/** Deadline to produce an OVD carrying the current address. */
export const DEEMED_OVD_GRACE_MONTHS = 3;

/** Age at which a minor may operate a savings account independently. */
export const MINOR_SELF_OPERATION_AGE = 10;

/** Documents proving the firm's activity that a proprietorship must produce. */
export const PROPRIETORSHIP_PROOFS_REQUIRED = 2;

export const OVD_LIST = [
  "Passport",
  "Driving licence",
  "Proof of possession of an Aadhaar number",
  "Voter's Identity Card issued by the Election Commission",
  "NREGA job card signed by a State Government officer",
  "Letter from the National Population Register with name and address",
];

export const DEEMED_OVD_LIST = [
  "Utility bill not more than two months old — electricity, telephone, post-paid mobile, piped gas or water",
  "Municipal or property tax receipt",
  "Pension payment order to a retired government or PSU employee showing the address",
  "Accommodation allotment letter from a government body, PSU, scheduled bank, financial institution or listed company",
];

export const PROPRIETORSHIP_PROOF_LIST = [
  "Registration certificate of the firm",
  "GST registration certificate",
  "Shops and Establishment licence",
  "Professional or trade licence issued by a municipal authority",
  "Importer Exporter Code",
  "The firm's latest income tax return, acknowledged",
  "Utility bill in the name of the proprietary firm",
];

export const KYC_MODES = [
  {
    id: "branch",
    label: "In person at the branch",
    note: "Originals are seen and returned; self-attested copies are retained.",
  },
  {
    id: "vcip",
    label: "Video KYC (V-CIP)",
    note: "Permitted under the KYC Master Direction. You need a working camera, a live location match and your PAN and Aadhaar to hand.",
  },
  {
    id: "overseas",
    label: "From overseas, by post",
    note: "Copies must be attested by an Indian Embassy or Consulate, a notary public, or a banker overseas.",
  },
];

/**
 * Account types. `residency` decides which document set applies.
 */
export const ACCOUNT_TYPES = [
  {
    id: "savings",
    label: "Savings account (resident)",
    residency: "resident",
    note: "Standard full-KYC savings account with the bank's minimum balance rules.",
  },
  {
    id: "bsbda",
    label: "Basic Savings Bank Deposit Account (BSBDA)",
    residency: "resident",
    note: "Zero minimum balance, at least four free cash withdrawals a month, but full KYC is still required.",
  },
  {
    id: "smallAccount",
    label: "Small Account (no OVD available)",
    residency: "resident",
    note: "For someone who cannot produce an OVD. Comes with hard credit, debit and balance limits and a 12-month life.",
  },
  {
    id: "salary",
    label: "Salary account",
    residency: "resident",
    note: "Opened on the employer's instruction; the employer letter or offer letter is usually needed.",
  },
  {
    id: "senior",
    label: "Senior citizen savings account",
    residency: "resident",
    note: "Age proof drives the higher deposit rate and the higher TDS threshold under section 194P / 80TTB.",
  },
  {
    id: "minorGuardian",
    label: "Minor account operated by a guardian",
    residency: "resident",
    note: "For a minor below 10, or any minor whose parent prefers guardian operation.",
  },
  {
    id: "minorSelf",
    label: "Minor account operated by the minor (age 10+)",
    residency: "resident",
    note: "Allowed by RBI's 2014 circular, subject to limits the bank sets on the account.",
  },
  {
    id: "joint",
    label: "Joint savings account",
    residency: "resident",
    note: "Every holder completes KYC separately, and the operating mandate has to be recorded.",
  },
  {
    id: "proprietorship",
    label: "Current account — sole proprietorship",
    residency: "resident",
    note: "Proprietor's own KYC plus any two documents proving the firm's activity in its own name.",
  },
  {
    id: "nre",
    label: "NRE savings or deposit account",
    residency: "nonResident",
    note: "Rupee account funded from abroad. Principal and interest are freely repatriable; interest is exempt under section 10(4)(ii).",
  },
  {
    id: "nro",
    label: "NRO savings or deposit account",
    residency: "nonResident",
    note: "For income arising in India such as rent, dividend or pension. Interest is taxable and TDS applies under section 195.",
  },
  {
    id: "fcnr",
    label: "FCNR(B) term deposit",
    residency: "nonResident",
    note: "Held in a permitted foreign currency for one to five years, so there is no rupee exchange risk on the principal.",
  },
];

/** Stable id derived from the label, so a ticked box survives an input change. */
const slugify = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const doc = (label, group, why, mandatory = true) => ({
  id: slugify(label),
  label,
  group,
  why,
  mandatory,
});

const GROUP_ORDER = [
  "Identity",
  "Address",
  "Tax",
  "Photographs and forms",
  "Account-specific",
  "Business proof",
  "Optional but useful",
];

/**
 * Build the checklist.
 *
 * @param {object} input
 * @param {string} input.accountTypeId  id from ACCOUNT_TYPES
 * @param {string} input.kycMode        id from KYC_MODES
 * @param {boolean} input.hasPan        the applicant holds a PAN
 * @param {boolean} input.ovdHasCurrentAddress the OVD shows where they live now
 * @param {boolean} input.isFirstAccount opening the first account with this bank
 * @param {string[]} input.collectedIds ids of documents already gathered
 * @returns {object} groups, counts and readiness — or { error }
 */
export function buildAccountChecklist({
  accountTypeId = "savings",
  kycMode = "branch",
  hasPan = true,
  ovdHasCurrentAddress = true,
  isFirstAccount = true,
  collectedIds = [],
} = {}) {
  const account = ACCOUNT_TYPES.find((item) => item.id === accountTypeId);
  if (!account) return { error: "Choose the type of account you want to open." };

  const mode = KYC_MODES.find((item) => item.id === kycMode);
  if (!mode) return { error: "Choose how the KYC will be done." };

  if (account.residency === "nonResident" && kycMode === "vcip") {
    return {
      error:
        "Video KYC is not offered for NRE, NRO and FCNR accounts by most banks — choose the branch or the overseas route.",
    };
  }
  if (account.residency === "resident" && kycMode === "overseas") {
    return { error: "The overseas attestation route applies to non-resident accounts." };
  }

  const items = [];
  const warnings = [];
  const isNonResident = account.residency === "nonResident";
  const isSmallAccount = accountTypeId === "smallAccount";
  const isMinor = accountTypeId === "minorGuardian" || accountTypeId === "minorSelf";

  // ---- Identity ---------------------------------------------------------
  if (isSmallAccount) {
    items.push(
      doc(
        "Self-attested photograph, signed or thumb-printed before the bank officer",
        "Identity",
        "A Small Account is opened without an OVD, so the officer's attestation is the identification.",
      ),
    );
  } else if (isNonResident) {
    items.push(
      doc("Passport — photo page, address page and signature page", "Identity", "The primary identity document for a non-resident applicant."),
      doc(
        "Valid visa, work permit, residence permit, OCI card or PIO card",
        "Identity",
        "Establishes that you are a person resident outside India under FEMA.",
      ),
    );
  } else {
    items.push(
      doc(
        "One Officially Valid Document — passport, driving licence, Aadhaar, Voter's ID, NREGA job card or NPR letter",
        "Identity",
        "The PML Rules define this closed list. A PAN card is not an OVD.",
      ),
    );
  }

  // ---- Address ----------------------------------------------------------
  if (isNonResident) {
    items.push(
      doc(
        "Overseas address proof — utility bill, bank statement, driving licence or employer letter",
        "Address",
        "Banks record both the overseas and the Indian communication address.",
      ),
      doc(
        "Indian address proof, if you keep one",
        "Address",
        "Needed where the account will carry an Indian correspondence address.",
        false,
      ),
    );
  } else if (!isSmallAccount) {
    if (ovdHasCurrentAddress) {
      items.push(
        doc(
          "The same OVD, showing your current address",
          "Address",
          "One OVD carrying the current address covers both identity and address.",
        ),
      );
    } else {
      items.push(
        doc(
          "A deemed OVD for address — utility bill under two months old, tax receipt, pension payment order or accommodation allotment letter",
          "Address",
          "Permitted where the OVD carries an old address.",
        ),
      );
      warnings.push(
        `Because your OVD does not show your current address you must produce an OVD carrying the current address within ${DEEMED_OVD_GRACE_MONTHS} months, or the account gets restricted.`,
      );
    }
  }

  // ---- Tax --------------------------------------------------------------
  if (hasPan) {
    items.push(doc("PAN card", "Tax", "PAN is required for account opening under Rule 114B of the Income-tax Rules."));
  } else {
    items.push(
      doc(
        "Signed Form 60",
        "Tax",
        "The declaration used where the applicant does not hold a PAN. Bring it filled and signed.",
      ),
    );
    warnings.push(
      "Without a PAN the account runs on Form 60, and higher TDS applies to interest under section 206AA. Applying for a PAN is usually the cheaper option.",
    );
  }
  if (isNonResident) {
    items.push(
      doc(
        "FATCA and CRS self-certification, with your tax identification number abroad",
        "Tax",
        "Required for reporting under FATCA and the Common Reporting Standard.",
      ),
    );
  }

  // ---- Photographs and forms -------------------------------------------
  items.push(
    doc("Two recent passport-size photographs", "Photographs and forms", "Banks retain one for the account opening form and one for the signature card."),
    doc("Completed and signed account opening form", "Photographs and forms", "Including the nomination — Form DA-1 — which is worth doing at opening, not later."),
  );
  if (mode.id === "overseas") {
    items.push(
      doc(
        "Copies attested by an Indian Embassy or Consulate, a notary public, or a banker overseas",
        "Photographs and forms",
        "Attestation replaces in-person verification when the forms are posted from abroad.",
      ),
    );
  }
  if (mode.id === "vcip") {
    warnings.push(
      "Video KYC needs your original PAN card on camera, a live face-to-photo match and a location inside India. Keep the room lit and the phone steady.",
    );
  }

  // ---- Account-specific -------------------------------------------------
  if (accountTypeId === "salary") {
    items.push(
      doc("Employer letter, offer letter or latest salary slip", "Account-specific", "Establishes the salary relationship the account is opened on."),
      doc("Employee identity card", "Account-specific", "Banks with a corporate tie-up usually ask for this.", false),
    );
  }
  if (accountTypeId === "senior") {
    items.push(
      doc(
        "Age proof — passport, PAN, birth certificate, school leaving certificate or Aadhaar",
        "Account-specific",
        "Age drives the extra interest rate and the deduction available under section 80TTB.",
      ),
    );
  }
  if (isMinor) {
    items.push(
      doc(
        "Minor's date of birth proof — birth certificate, school certificate or passport",
        "Account-specific",
        "Establishes the age, which decides whether the minor can operate the account.",
      ),
    );
  }
  if (accountTypeId === "minorGuardian") {
    items.push(
      doc("Guardian's own full KYC — OVD and PAN", "Account-specific", "The guardian operates the account and is KYC-verified in their own right."),
      doc(
        "Guardianship proof where the guardian is not a natural guardian",
        "Account-specific",
        "A court order is needed where a legal rather than natural guardian operates the account.",
        false,
      ),
    );
  }
  if (accountTypeId === "minorSelf") {
    warnings.push(
      `RBI's circular of 6 May 2014 allows a minor above ${MINOR_SELF_OPERATION_AGE} to open and operate a savings account independently, but the bank sets limits on the balance and on facilities such as cheque books and internet banking.`,
    );
  }
  if (accountTypeId === "joint") {
    items.push(
      doc("Full KYC for every joint holder", "Account-specific", "Each holder is a customer in their own right."),
      doc(
        "Signed operating mandate — either or survivor, jointly, or former or survivor",
        "Account-specific",
        "Decides who can operate the account and what happens on a death.",
      ),
    );
  }
  if (accountTypeId === "proprietorship") {
    items.push(
      doc(
        `Any ${PROPRIETORSHIP_PROOFS_REQUIRED} documents proving the firm's activity in its own name`,
        "Business proof",
        "RBI requires two proofs of the activity of the proprietary firm, over and above the proprietor's own KYC.",
      ),
      doc("Proprietor's own OVD and PAN", "Business proof", "The proprietor is the customer; the firm is not a separate person."),
      doc(
        "Declaration of the credit facilities you hold with any bank",
        "Business proof",
        "RBI's current account rules restrict opening a current account where credit facilities are held elsewhere.",
      ),
    );
  }
  if (isNonResident) {
    items.push(
      doc(
        "Proof of non-resident status — employment contract, work permit or immigration stamp",
        "Account-specific",
        "The bank has to satisfy itself that you are a person resident outside India under FEMA.",
      ),
    );
    if (accountTypeId === "fcnr") {
      items.push(
        doc(
          "Currency and tenor instruction — one to five years, in a permitted currency",
          "Account-specific",
          "An FCNR(B) deposit is held in foreign currency, so the currency and the term have to be chosen at the start.",
        ),
      );
    }
  }

  // ---- Optional but useful ---------------------------------------------
  items.push(
    doc("Nominee's name, date of birth and address", "Optional but useful", "Filing the nomination at opening saves the family a claim process later.", false),
    doc("Initial funding cheque or transfer details", "Optional but useful", "Some banks activate the account only after the first credit.", false),
  );
  if (!isFirstAccount) {
    items.push(
      doc(
        "Existing customer ID or account number with this bank",
        "Optional but useful",
        "An existing full-KYC relationship often removes the need to submit documents again.",
        false,
      ),
    );
  }

  const collected = new Set(Array.isArray(collectedIds) ? collectedIds : []);
  const rows = items.map((item) => ({ ...item, collected: collected.has(item.id) }));

  const mandatory = rows.filter((item) => item.mandatory);
  const mandatoryCollected = mandatory.filter((item) => item.collected);
  const readiness =
    mandatory.length > 0 ? Math.round((mandatoryCollected.length / mandatory.length) * 100) : 100;

  const groups = GROUP_ORDER.map((title) => ({
    title,
    items: rows.filter((item) => item.group === title),
  })).filter((group) => group.items.length > 0);

  return {
    account,
    mode,
    groups,
    rows,
    totalCount: rows.length,
    mandatoryCount: mandatory.length,
    optionalCount: rows.length - mandatory.length,
    collectedCount: mandatoryCollected.length,
    missingCount: mandatory.length - mandatoryCollected.length,
    readiness,
    warnings,
    ovdList: OVD_LIST,
    deemedOvdList: isNonResident || isSmallAccount ? [] : DEEMED_OVD_LIST,
    proprietorshipProofs: accountTypeId === "proprietorship" ? PROPRIETORSHIP_PROOF_LIST : [],
    smallAccountLimits: isSmallAccount
      ? {
          annualCredit: SMALL_ACCOUNT_ANNUAL_CREDIT_LIMIT,
          monthlyDebit: SMALL_ACCOUNT_MONTHLY_DEBIT_LIMIT,
          balance: SMALL_ACCOUNT_BALANCE_LIMIT,
          validityMonths: SMALL_ACCOUNT_VALIDITY_MONTHS,
        }
      : null,
  };
}
