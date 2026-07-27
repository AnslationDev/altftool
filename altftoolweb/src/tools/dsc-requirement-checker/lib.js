/**
 * Which filings actually need a Class 3 Digital Signature Certificate.
 *
 * Legal basis
 *  - Digital signatures have statutory effect under sections 3 and 5 of the Information
 *    Technology Act, 2000, and certificates are issued by Certifying Authorities licensed by the
 *    Controller of Certifying Authorities.
 *  - Class of certificate: the CCA's Interoperability Guidelines were revised so that from
 *    1 January 2021 Class 2 certificates are no longer issued. Class 3 is now the single class
 *    for every application, which is why "Class 3" appears against everything below.
 *  - Storage: a Class 3 signing certificate must be held in a hardware cryptographic token
 *    certified to FIPS 140-2 Level 2 or higher. It cannot be issued as a downloadable file, and
 *    it is personal to the signatory — it cannot be shared or transferred.
 *  - Income tax: section 140 read with rule 12(3) of the Income-tax Rules makes a digital
 *    signature compulsory for a company, for a political party, and for any person whose
 *    accounts must be audited under section 44AB. Everyone else may verify by EVC or Aadhaar OTP.
 *  - GST: rule 26(1) of the CGST Rules requires a company and a limited liability partnership to
 *    sign electronically with a DSC. Every other registered person may use a DSC or an EVC.
 *  - MCA: rule 8 of the Companies (Registration Offices and Fees) Rules, 2014 requires e-forms
 *    to be authenticated by digital signature, and the signatory's DSC must be registered on the
 *    MCA portal against the DIN or PAN.
 *  - Public procurement: rule 160 of the General Financial Rules, 2017 requires e-procurement,
 *    and the CPP Portal and GeM require a Class 3 signing certificate plus an encryption
 *    certificate, because bids are encrypted until the opening event.
 *  - DGFT: applications for an Importer Exporter Code and for authorisations are filed with a
 *    Class 3 organisational certificate; DGFT historically required the IEC to be embedded in
 *    the certificate.
 */

/** Certificate classes still issued. */
export const CERTIFICATE_CLASS = "Class 3";

/** Validity terms a Certifying Authority may issue for. */
export const VALIDITY_YEARS = [1, 2, 3];

/** Storage requirement under the CCA Interoperability Guidelines. */
export const TOKEN_STANDARD = "FIPS 140-2 Level 2";

/** Entity types the rules distinguish between. */
export const ENTITY_TYPES = [
  { value: "company", label: "Private or public limited company", isBody: true },
  { value: "llp", label: "Limited liability partnership", isBody: true },
  { value: "opc", label: "One person company", isBody: true },
  { value: "firm", label: "Partnership firm", isBody: false },
  { value: "proprietor", label: "Proprietorship or individual", isBody: false },
  { value: "huf", label: "Hindu Undivided Family", isBody: false },
  { value: "trust", label: "Trust, society or section 8 company", isBody: false },
];

/**
 * Each filing, with the rule that decides whether a DSC is compulsory.
 * `decide` returns { verdict, reason } where verdict is "mandatory", "optional" or "notApplicable".
 */
export const FILINGS = [
  {
    id: "mcaEforms",
    label: "MCA / ROC e-forms (SPICe+, AOC-4, MGT-7, DIR-12, DIR-3 KYC)",
    authority: "Ministry of Corporate Affairs",
    rule: "Rule 8, Companies (Registration Offices and Fees) Rules, 2014",
    holder: "individual signatory in organisational capacity",
    needsEncryption: false,
    decide: ({ entity }) =>
      entity.isBody || entity.value === "trust"
        ? {
            verdict: "mandatory",
            reason:
              "Every MCA e-form must be authenticated by the digital signature of a director, designated partner or authorised signatory, and that DSC has to be registered on the MCA portal first.",
          }
        : {
            verdict: "notApplicable",
            reason:
              "A firm, proprietorship or HUF does not file with the Registrar of Companies, so no MCA DSC is needed.",
          },
  },
  {
    id: "incomeTaxReturn",
    label: "Income tax return and tax audit report",
    authority: "Income Tax Department",
    rule: "Section 140 read with rule 12(3), Income-tax Rules, 1962",
    holder: "individual signatory",
    needsEncryption: false,
    decide: ({ entity, taxAuditApplicable }) => {
      if (entity.value === "company" || entity.value === "opc") {
        return {
          verdict: "mandatory",
          reason:
            "Rule 12(3) requires a company to verify its return by digital signature. EVC and Aadhaar OTP are not available to it.",
        };
      }
      if (taxAuditApplicable) {
        return {
          verdict: "mandatory",
          reason:
            "Where accounts must be audited under section 44AB, rule 12(3) requires the return to be verified by digital signature, and the auditor signs Form 3CD with a DSC as well.",
        };
      }
      return {
        verdict: "optional",
        reason:
          "Without a section 44AB audit you may verify the return by EVC or Aadhaar OTP instead, so a DSC is convenient but not compulsory.",
      };
    },
  },
  {
    id: "gstReturns",
    label: "GST registration, returns and refund applications",
    authority: "GST Network",
    rule: "Rule 26(1), CGST Rules, 2017",
    holder: "authorised signatory",
    needsEncryption: false,
    decide: ({ entity }) =>
      entity.value === "company" || entity.value === "opc" || entity.value === "llp"
        ? {
            verdict: "mandatory",
            reason:
              "Rule 26(1) requires a company and a limited liability partnership to sign every GST document with a digital signature certificate.",
          }
        : {
            verdict: "optional",
            reason:
              "Rule 26(1) lets every other registered person sign with either a DSC or an electronic verification code sent to the registered mobile and email.",
          },
  },
  {
    id: "eTender",
    label: "e-tenders on the CPP Portal, GeM or a state procurement portal",
    authority: "Government e-procurement portals",
    rule: "Rule 160, General Financial Rules, 2017 and portal terms",
    holder: "individual bidder or authorised signatory",
    needsEncryption: true,
    decide: () => ({
      verdict: "mandatory",
      reason:
        "Bids are digitally signed and the bid file is encrypted until the opening event, so you need a signing certificate AND an encryption certificate — a combination token, not a signature-only one.",
    }),
  },
  {
    id: "dgft",
    label: "DGFT filings — IEC application, amendment and authorisations",
    authority: "Directorate General of Foreign Trade",
    rule: "Foreign Trade Policy procedures and DGFT portal requirements",
    holder: "organisational certificate for the entity",
    needsEncryption: false,
    decide: () => ({
      verdict: "mandatory",
      reason:
        "DGFT applications are filed with a Class 3 organisational certificate issued in the entity's name, and the portal validates it against the IEC.",
    }),
  },
  {
    id: "icegate",
    label: "Customs filings on ICEGATE (bills of entry, shipping bills)",
    authority: "Central Board of Indirect Taxes and Customs",
    rule: "ICEGATE registration and digital signature requirements",
    holder: "organisational certificate for the entity",
    needsEncryption: false,
    decide: () => ({
      verdict: "mandatory",
      reason:
        "ICEGATE requires the registered user's Class 3 certificate to be mapped to the IEC or the customs broker licence before any document can be filed.",
    }),
  },
  {
    id: "epfoEsic",
    label: "EPFO and ESIC employer filings and online claim attestation",
    authority: "Employees' Provident Fund Organisation / ESIC",
    rule: "EPFO circulars on digital signature registration by employers",
    holder: "authorised signatory of the establishment",
    needsEncryption: false,
    decide: ({ hasEmployees }) =>
      hasEmployees
        ? {
            verdict: "mandatory",
            reason:
              "An employer must register an authorised signatory's DSC on the unified portal to attest KYC, approve transfer claims and file returns online.",
          }
        : {
            verdict: "notApplicable",
            reason: "With no employees on the rolls there is nothing to attest on the EPFO or ESIC portal.",
          },
  },
  {
    id: "ipFilings",
    label: "Trademark, patent and design e-filings",
    authority: "Office of the Controller General of Patents, Designs and Trade Marks",
    rule: "Trade Marks Rules, 2017 and Patents Rules, 2003 — electronic filing provisions",
    holder: "applicant or registered agent",
    needsEncryption: false,
    decide: () => ({
      verdict: "mandatory",
      reason:
        "Electronic filing on the IP India portal requires the application to be digitally signed by the applicant or the registered agent or attorney.",
    }),
  },
  {
    id: "eAuction",
    label: "Bank and insolvency e-auctions",
    authority: "Auction platforms and IBBI-registered professionals",
    rule: "Platform terms; IBBI liquidation process regulations for e-auctions",
    holder: "individual bidder",
    needsEncryption: true,
    decide: () => ({
      verdict: "mandatory",
      reason:
        "Auction platforms require a signing certificate and, where bids are sealed, an encryption certificate too, so a combination token is safest.",
    }),
  },
  {
    id: "tdsReturns",
    label: "TDS returns and TRACES corrections",
    authority: "Income Tax Department / TRACES",
    rule: "Rule 31A, Income-tax Rules, 1962",
    holder: "authorised signatory of the deductor",
    needsEncryption: false,
    decide: ({ entity }) =>
      entity.isBody
        ? {
            verdict: "mandatory",
            reason:
              "A corporate deductor registers the authorised person's DSC on TRACES to file returns, download certificates in bulk and submit online corrections.",
          }
        : {
            verdict: "optional",
            reason:
              "A non-corporate deductor may use the TRACES electronic verification route instead, though a DSC removes the repeated validation steps.",
          },
  },
];

export const FILING_IDS = FILINGS.map((filing) => filing.id);

/**
 * Work out the DSC requirement.
 *
 * @param {object} input
 * @param {string} input.entityType         One of ENTITY_TYPES values.
 * @param {string[]} input.selectedFilings  Filing ids the entity actually does.
 * @param {boolean} input.taxAuditApplicable Accounts audited under section 44AB.
 * @param {boolean} input.hasEmployees      EPFO or ESIC registered with staff on the rolls.
 * @param {number} input.signatoryCount     People who will need to sign.
 */
export function checkDscRequirement({
  entityType = "company",
  selectedFilings = [],
  taxAuditApplicable = false,
  hasEmployees = false,
  signatoryCount = 1,
}) {
  const entity = ENTITY_TYPES.find((item) => item.value === entityType);
  if (!entity) {
    return { error: "Choose the type of entity filing." };
  }
  if (!Array.isArray(selectedFilings) || selectedFilings.length === 0) {
    return { error: "Select at least one filing you make, so there is something to assess." };
  }
  const unknown = selectedFilings.filter((id) => !FILING_IDS.includes(id));
  if (unknown.length > 0) {
    return { error: `Unrecognised filing: ${unknown.join(", ")}.` };
  }
  if (!Number.isInteger(signatoryCount) || signatoryCount < 1 || signatoryCount > 50) {
    return { error: "The number of signatories must be a whole number between 1 and 50." };
  }

  const context = { entity, taxAuditApplicable, hasEmployees };

  const assessed = FILINGS.filter((filing) => selectedFilings.includes(filing.id)).map((filing) => {
    const { verdict, reason } = filing.decide(context);
    return {
      id: filing.id,
      label: filing.label,
      authority: filing.authority,
      rule: filing.rule,
      holder: filing.holder,
      needsEncryption: filing.needsEncryption && verdict === "mandatory",
      verdict,
      reason,
    };
  });

  const mandatory = assessed.filter((row) => row.verdict === "mandatory");
  const optional = assessed.filter((row) => row.verdict === "optional");
  const notApplicable = assessed.filter((row) => row.verdict === "notApplicable");

  const required = mandatory.length > 0;
  const needsEncryption = mandatory.some((row) => row.needsEncryption);
  const needsOrganisational = mandatory.some((row) => row.holder.includes("organisational"));

  // A DSC is personal and non-transferable, so one is needed per signatory.
  const certificatesNeeded = required ? signatoryCount : 0;

  const certificateType = !required
    ? "None compulsory"
    : needsEncryption
      ? `${CERTIFICATE_CLASS} combination certificate — signing plus encryption`
      : `${CERTIFICATE_CLASS} signature certificate`;

  const headline = required
    ? needsEncryption
      ? `Yes — ${CERTIFICATE_CLASS} signing and encryption certificate`
      : `Yes — ${CERTIFICATE_CLASS} signature certificate`
    : optional.length > 0
      ? "Not compulsory — EVC or Aadhaar OTP will do"
      : "No digital signature needed for what you selected";

  const notes = [];
  notes.push(
    `Class 2 certificates stopped being issued on 1 January 2021, so ${CERTIFICATE_CLASS} is the only class a Certifying Authority now offers.`,
  );
  if (required) {
    notes.push(
      `The certificate must be held in a hardware crypto token certified to ${TOKEN_STANDARD} or higher, and it is personal to the signatory — one token per person, never shared.`,
    );
  }
  if (needsEncryption) {
    notes.push(
      "A signature-only certificate cannot decrypt a sealed bid, so buy the combination certificate before the first tender rather than after.",
    );
  }
  if (needsOrganisational) {
    notes.push(
      "An organisational certificate carries the entity name and needs an authorisation letter plus entity KYC at issue, so allow extra time.",
    );
  }
  if (optional.length > 0 && !required) {
    notes.push(
      "Even where it is optional, a DSC avoids repeated OTP verification and works when the registered mobile is out of reach.",
    );
  }

  return {
    entityLabel: entity.label,
    headline,
    required,
    certificateType,
    certificateClass: CERTIFICATE_CLASS,
    needsEncryption,
    needsOrganisational,
    certificatesNeeded,
    signatoryCount,
    mandatory,
    optional,
    notApplicable,
    assessed,
    notes,
    validityOptions: VALIDITY_YEARS,
    tokenStandard: TOKEN_STANDARD,
  };
}
