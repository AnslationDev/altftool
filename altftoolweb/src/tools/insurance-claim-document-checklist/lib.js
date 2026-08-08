/**
 * Insurance claim document checklist builder (India).
 *
 * Document sets follow the standard claim forms and policy conditions used by
 * Indian insurers. Settlement timelines come from:
 *  - IRDAI Master Circular on Health Insurance Business (2024): cashless
 *    authorisation decided within 1 hour of request, final discharge
 *    authorisation within 3 hours, and a reimbursement claim settled or
 *    rejected within 15 days of the last necessary document.
 *  - IRDAI (Protection of Policyholders' Interests) Regulations: for a general
 *    insurance claim needing a survey, the surveyor's report is due within 15
 *    days and the insurer must settle within 30 days of receiving it.
 *  - Life insurance: settlement within 30 days of all documents; where an
 *    investigation is needed it must finish within 90 days and the claim be
 *    settled within a further 30 days.
 *  - Section 45 of the Insurance Act 1938: a life policy cannot be questioned
 *    after 3 years from commencement, revival or rider addition.
 */

export const HEALTH_SETTLEMENT_DAYS = 15;
export const GENERAL_SETTLEMENT_DAYS = 30;
export const SURVEY_REPORT_DAYS = 15;
export const LIFE_SETTLEMENT_DAYS = 30;
export const LIFE_INVESTIGATION_DAYS = 90;
export const SECTION_45_YEARS = 3;
/** Cashless pre-authorisation and discharge run on an hour-based clock, not the
 *  15-day reimbursement clock — see the top-of-file basis note. */
export const CASHLESS_PREAUTH_HOURS = 1;
export const CASHLESS_DISCHARGE_HOURS = 3;

/** Typical policy conditions for intimating a claim. */
export const INTIMATION_RULES = {
  health: "Within 24 hours of an emergency admission, or 48 hours before a planned admission.",
  motor: "Immediately, and in any case within 48 to 72 hours of the accident or theft.",
  life: "As soon as possible after the event; there is no statutory deadline but delay invites queries.",
};

const doc = (label, note = "", optional = false) => ({ label, note, optional });

/**
 * Claim scenarios. Each scenario lists always-required documents plus
 * conditional blocks keyed to a yes/no answer the claimant gives.
 */
export const CLAIM_SCENARIOS = {
  "health-cashless": {
    category: "health",
    label: "Health — cashless treatment at a network hospital",
    // Cashless is decided on an hour-based clock (see CASHLESS_PREAUTH_HOURS /
    // CASHLESS_DISCHARGE_HOURS), not the 15-day reimbursement clock — settlementDays
    // is intentionally null here so settlementDeadline() doesn't apply the wrong basis.
    settlementDays: null,
    base: [
      doc("Pre-authorisation request form", "Filled by the hospital insurance desk and signed by you"),
      doc("Health insurance card or policy number", "Carry a printed or digital copy"),
      doc("Government photo ID of the patient", "Aadhaar, passport, voter ID or driving licence"),
      doc("Treating doctor's advice for admission", "States the diagnosis and planned treatment"),
      doc("Copy of the policy schedule", "Shows sum insured, room-rent limit and sub-limits"),
    ],
    conditional: {
      accident: [
        doc("Medico-legal case (MLC) papers or FIR copy", "Hospitals must register an MLC for accident cases"),
      ],
      planned: [
        doc("Pre-authorisation sent 48 hours before admission", "Planned procedures need advance approval"),
      ],
      firstYear: [
        doc("Past medical records and prescriptions", "Insurers verify pre-existing disease waiting periods"),
      ],
    },
  },
  "health-reimbursement": {
    category: "health",
    label: "Health — reimbursement after paying the hospital",
    settlementDays: HEALTH_SETTLEMENT_DAYS,
    base: [
      doc("Duly filled and signed claim form", "Part A by you, Part B by the hospital"),
      doc("Original hospital bill with itemised break-up", "Keep a photocopy of everything you submit"),
      doc("Original payment receipts", "Card or UPI receipts count"),
      doc("Discharge summary", "The single most-queried document — check dates and diagnosis"),
      doc("All investigation and diagnostic reports", "Lab, radiology and pathology reports"),
      doc("Doctor's prescriptions matching every pharmacy bill", "Bills without a prescription are usually rejected"),
      doc("Pharmacy bills", "Consumables may be excluded — check the policy"),
      doc("Cancelled cheque or bank passbook page", "Name must match the proposer"),
      doc("KYC documents of the proposer", "PAN plus one address proof"),
    ],
    conditional: {
      accident: [
        doc("FIR or MLC copy", "Required for road accidents, burns, poisoning and assault"),
      ],
      implant: [
        doc("Implant invoice and sticker or barcode", "Stents, lenses and prosthetics need the batch sticker"),
      ],
      prePost: [
        doc("Pre-hospitalisation bills and reports", "Usually 30 days before admission"),
        doc("Post-hospitalisation bills and reports", "Usually 60 days after discharge"),
      ],
      firstYear: [
        doc("Past medical records and prescriptions", "Insurers verify pre-existing disease waiting periods"),
      ],
    },
  },
  "motor-own-damage": {
    category: "motor",
    label: "Motor — own damage / accident repair",
    settlementDays: GENERAL_SETTLEMENT_DAYS,
    base: [
      doc("Duly signed claim form", "Give the exact time, place and description of the accident"),
      doc("Copy of the registration certificate (RC)", "Carry the original for verification"),
      doc("Driving licence of the person at the wheel", "A claim fails if the driver was not validly licensed"),
      doc("Copy of the policy schedule", "Check the IDV and the compulsory excess"),
      doc("Repair estimate from the garage", "Needed before the surveyor inspects"),
      doc("Photographs of the damage", "Take them before any repair begins"),
      doc("Final repair invoice and payment receipt", "For reimbursement claims"),
    ],
    conditional: {
      thirdParty: [
        doc("FIR copy", "Compulsory when a third party is injured or property is damaged"),
      ],
      cashless: [
        doc("Satisfaction voucher for the network garage", "Sign only after checking the repair"),
      ],
      commercial: [
        doc("Fitness certificate and permit", "Commercial vehicles need a valid permit at the time of loss"),
      ],
    },
  },
  "motor-theft": {
    category: "motor",
    label: "Motor — vehicle theft",
    settlementDays: GENERAL_SETTLEMENT_DAYS,
    base: [
      doc("Duly signed claim form", "Intimate the insurer and the police the same day"),
      doc("FIR lodged at the nearest police station", "File it immediately — delay is the top rejection reason"),
      doc("Original registration certificate", "Insurers settle only against the original RC"),
      doc("All original keys of the vehicle", "Usually both sets, including any spare"),
      doc("Non-traceable report from the police", "Issued after the police close the investigation"),
      doc("RTO Forms 28, 29 and 30 signed by you", "Transfers the wreck or title to the insurer"),
      doc("Letter of subrogation and indemnity bond", "On the stamp paper value your insurer specifies"),
      doc("Copy of the policy schedule", "Settlement is at the IDV shown here"),
    ],
    conditional: {
      loan: [
        doc("No-objection certificate from the financier", "Needed while hypothecation is still on the RC"),
      ],
    },
  },
  "life-death": {
    category: "life",
    label: "Life — death claim",
    settlementDays: LIFE_SETTLEMENT_DAYS,
    base: [
      doc("Claim intimation and claimant's statement form", "Signed by the nominee"),
      doc("Original policy document", "File an indemnity if it is lost"),
      doc("Death certificate issued by the municipal authority", "Not the hospital's certificate of death"),
      doc("Photo ID and address proof of the nominee", "Aadhaar plus PAN is the usual pair"),
      doc("Cancelled cheque or bank passbook of the nominee", "Payout is by NEFT only"),
    ],
    conditional: {
      hospitalised: [
        doc("Medical attendant's certificate", "From the doctor who last treated the life assured"),
        doc("Hospital treatment certificate and case papers", "Admission notes, discharge summary and reports"),
      ],
      unnatural: [
        doc("FIR or police complaint", "For accident, suicide, drowning or any unnatural death"),
        doc("Post-mortem report", "Along with the chemical or viscera analysis if one was ordered"),
        doc("Police inquest report or panchnama", "Records the scene and circumstances"),
        doc("Final police report or charge sheet", "Where an investigation was registered"),
      ],
      earlyClaim: [
        doc("Employer certificate for a salaried life assured", "Asked for on claims inside the first three years"),
        doc("Records of any treatment before the policy started", "Used to check non-disclosure"),
      ],
    },
  },
  "life-maturity": {
    category: "life",
    label: "Life — maturity or survival benefit",
    settlementDays: LIFE_SETTLEMENT_DAYS,
    base: [
      doc("Original policy document", "Surrender it against the discharge voucher"),
      doc("Signed discharge voucher (Form 3825 or insurer equivalent)", "Sign only in the space provided"),
      doc("Photo ID and address proof", "Must match the policy records"),
      doc("Cancelled cheque or bank passbook page", "Name must match the policyholder"),
      doc("PAN card copy", "Needed for tax reporting on the payout"),
    ],
    conditional: {
      assigned: [
        doc("Re-assignment deed from the assignee", "Where the policy was assigned to a bank"),
      ],
      nriClaim: [
        doc("NRE or NRO account details and passport copy", "For payouts to a non-resident policyholder"),
      ],
    },
  },
};

export const CONDITION_LABELS = {
  accident: "The claim arises from an accident, assault or poisoning",
  planned: "This was a planned (non-emergency) admission",
  firstYear: "The policy is less than one year old",
  implant: "An implant, stent or lens was used",
  prePost: "There are pre or post hospitalisation expenses",
  thirdParty: "A third party was injured or their property damaged",
  cashless: "Repairs are being done at a network (cashless) garage",
  commercial: "The vehicle is registered for commercial use",
  loan: "The vehicle is still hypothecated to a lender",
  hospitalised: "The life assured was hospitalised before death",
  unnatural: "The death was unnatural (accident, suicide, homicide)",
  earlyClaim: "The policy is less than three years old",
  assigned: "The policy was assigned to a bank or lender",
  nriClaim: "The payout goes to a non-resident account",
};

/** Every condition key that a given scenario can switch on. */
export function conditionsFor(scenarioId) {
  const scenario = CLAIM_SCENARIOS[scenarioId];
  if (!scenario) return [];
  return Object.keys(scenario.conditional);
}

/**
 * Build the checklist for a scenario.
 *
 * @param {string} scenarioId key of CLAIM_SCENARIOS
 * @param {object} conditions map of condition key -> boolean
 * @returns {object} { scenario, items, baseCount, extraCount, total } or { error }
 */
export function buildChecklist(scenarioId, conditions = {}) {
  const scenario = CLAIM_SCENARIOS[scenarioId];
  if (!scenario) {
    return { error: "Choose a claim type to build the checklist." };
  }
  const items = scenario.base.map((item) => ({ ...item, source: "base" }));
  let extraCount = 0;
  for (const key of Object.keys(scenario.conditional)) {
    if (conditions[key]) {
      for (const item of scenario.conditional[key]) {
        items.push({ ...item, source: key });
        extraCount += 1;
      }
    }
  }
  return {
    label: scenario.label,
    category: scenario.category,
    settlementDays: scenario.settlementDays,
    intimation: INTIMATION_RULES[scenario.category],
    items,
    baseCount: scenario.base.length,
    extraCount,
    total: items.length,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Parse a YYYY-MM-DD string into a UTC timestamp, or NaN. */
export function parseIsoDate(iso) {
  if (typeof iso !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return NaN;
  const ts = Date.UTC(year, month - 1, day);
  const back = new Date(ts);
  if (back.getUTCFullYear() !== year || back.getUTCMonth() !== month - 1 || back.getUTCDate() !== day) {
    return NaN;
  }
  return ts;
}

export function formatIsoDate(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/**
 * Settlement deadline from the day the last document is submitted.
 *
 * @param {string} submittedIso YYYY-MM-DD the last document was handed over.
 * @param {string} scenarioId   key of CLAIM_SCENARIOS.
 * @param {boolean} investigated Life claims only: an investigation was ordered.
 */
export function settlementDeadline(submittedIso, scenarioId, investigated = false) {
  const scenario = CLAIM_SCENARIOS[scenarioId];
  if (!scenario) return { error: "Choose a claim type first." };
  if (scenario.settlementDays === null) {
    // Cashless: no day-based deadline runs from a submission date — decision is on the
    // hour-based clock instead (see CASHLESS_PREAUTH_HOURS / CASHLESS_DISCHARGE_HOURS).
    return {
      days: null,
      basis: `Cashless is decided within ${CASHLESS_PREAUTH_HOURS} hour of the pre-authorisation request and within ${CASHLESS_DISCHARGE_HOURS} hours for final discharge approval — this isn't a day-based deadline counted from a submission date`,
      submitted: null,
      deadline: null,
    };
  }
  const ts = parseIsoDate(submittedIso);
  if (Number.isNaN(ts)) {
    return { error: "Enter the submission date as a real calendar date." };
  }
  let days = scenario.settlementDays;
  let basis = `${days} days from the last document`;
  if (scenario.category === "life" && investigated) {
    days = LIFE_INVESTIGATION_DAYS + LIFE_SETTLEMENT_DAYS;
    basis = `${LIFE_INVESTIGATION_DAYS} days to finish the investigation plus ${LIFE_SETTLEMENT_DAYS} days to settle`;
  }
  return {
    days,
    basis,
    submitted: formatIsoDate(ts),
    deadline: formatIsoDate(ts + days * DAY_MS),
  };
}
