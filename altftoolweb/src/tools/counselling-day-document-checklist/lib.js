/**
 * Admission counselling: the documents the reporting centre keeps, and the money you
 * have to have arranged before the reporting window shuts.
 *
 * Rule sources — figures are the amounts notified in the recent counselling schemes
 * and every one of them is an editable input here, because they are revised for each
 * cycle:
 *
 *  - JoSAA (IITs, NITs, IIITs and other GFTIs). A candidate accepting an allotted
 *    seat pays the Seat Acceptance Fee, notified in recent cycles as ₹35,000 for the
 *    OPEN, OPEN-PwD, OBC-NCL, OBC-NCL-PwD, EWS and EWS-PwD categories and ₹17,500 for
 *    SC, ST, SC-PwD and ST-PwD candidates. The amount is adjusted against the
 *    institute's own fee when you finally take admission; on withdrawal a processing
 *    charge is deducted under the JoSAA business rules for the cycle.
 *
 *  - MCC counselling for NEET UG all-India-quota seats. A non-refundable registration
 *    fee plus a refundable security deposit are paid at registration, notified in
 *    recent schemes as ₹1,000 registration and ₹10,000 deposit for General
 *    candidates, and ₹500 and ₹5,000 for SC, ST, OBC and PwD candidates. Deemed and
 *    central university seats carry a much higher deposit — ₹5,000 registration with
 *    a ₹2,00,000 security deposit in the same schemes. The deposit is forfeited if a
 *    candidate is allotted a seat and then does not report.
 *
 *  - Reporting is against originals. Institutes retain the originals of the
 *    allotment letter and specified certificates until the process closes; you keep
 *    photocopies. A candidate who does not report inside the window loses both the
 *    seat and, where a deposit was paid, the deposit.
 *
 *  - The date of birth is taken from the Class 10 certificate, and category
 *    certificates for central counselling have to be in the central prescribed
 *    format and current with reference to the cut-off date in the information
 *    bulletin.
 *
 * Informational only. The information bulletin and business rules for your own
 * counselling cycle are the authority on fees, formats and deadlines.
 */

/** JoSAA seat acceptance fee for OPEN, OBC-NCL and EWS categories, in rupees. */
export const JOSAA_SEAT_FEE_GENERAL = 35000;

/** JoSAA seat acceptance fee for SC, ST and PwD categories, in rupees. */
export const JOSAA_SEAT_FEE_RESERVED = 17500;

/** MCC all-India-quota registration fee, General, in rupees. */
export const MCC_AIQ_REGISTRATION_GENERAL = 1000;

/** MCC all-India-quota registration fee, SC/ST/OBC/PwD, in rupees. */
export const MCC_AIQ_REGISTRATION_RESERVED = 500;

/** MCC all-India-quota refundable security deposit, General, in rupees. */
export const MCC_AIQ_DEPOSIT_GENERAL = 10000;

/** MCC all-India-quota refundable security deposit, SC/ST/OBC/PwD, in rupees. */
export const MCC_AIQ_DEPOSIT_RESERVED = 5000;

/** MCC deemed and central university registration fee, in rupees. */
export const MCC_DEEMED_REGISTRATION = 5000;

/** MCC deemed and central university refundable security deposit, in rupees. */
export const MCC_DEEMED_DEPOSIT = 200000;

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const MAX_RUPEES = 50000000;

export const COUNSELLING_TYPES = [
  {
    id: "josaa",
    label: "JoSAA — IITs, NITs, IIITs and GFTIs",
    feeLabel: "Seat acceptance fee",
    generalFee: JOSAA_SEAT_FEE_GENERAL,
    reservedFee: JOSAA_SEAT_FEE_RESERVED,
    generalDeposit: 0,
    reservedDeposit: 0,
    feeAdjustable: true,
    note: "The seat acceptance fee is adjusted against the institute's own fee when you take admission. Reporting is online for most rounds, with physical reporting at the allotted institute afterwards.",
  },
  {
    id: "mcc-aiq",
    label: "MCC NEET UG — all-India-quota seats",
    feeLabel: "Registration fee",
    generalFee: MCC_AIQ_REGISTRATION_GENERAL,
    reservedFee: MCC_AIQ_REGISTRATION_RESERVED,
    generalDeposit: MCC_AIQ_DEPOSIT_GENERAL,
    reservedDeposit: MCC_AIQ_DEPOSIT_RESERVED,
    feeAdjustable: false,
    note: "The registration fee is not refundable. The security deposit is, but it is forfeited if you are allotted a seat and then fail to report.",
  },
  {
    id: "mcc-deemed",
    label: "MCC NEET UG — deemed and central universities",
    feeLabel: "Registration fee",
    generalFee: MCC_DEEMED_REGISTRATION,
    reservedFee: MCC_DEEMED_REGISTRATION,
    generalDeposit: MCC_DEEMED_DEPOSIT,
    reservedDeposit: MCC_DEEMED_DEPOSIT,
    feeAdjustable: false,
    note: "The deposit for deemed university counselling is very large and is forfeited on a no-show. Do not register for this stream unless you intend to take a seat in it.",
  },
  {
    id: "state-engineering",
    label: "State engineering counselling",
    feeLabel: "Processing or tuition fee",
    generalFee: 0,
    reservedFee: 0,
    generalDeposit: 0,
    reservedDeposit: 0,
    feeAdjustable: true,
    note: "State counselling almost always needs a domicile or nativity certificate, which central counselling does not. Fees vary by state — enter yours from the notification.",
  },
  {
    id: "state-medical",
    label: "State medical or dental counselling",
    feeLabel: "Registration or tuition fee",
    generalFee: 0,
    reservedFee: 0,
    generalDeposit: 0,
    reservedDeposit: 0,
    feeAdjustable: false,
    note: "State medical counselling usually requires a bond or an undertaking in addition to the fee. Read the bond amount before you accept the seat.",
  },
  {
    id: "university",
    label: "University or CUET admission reporting",
    feeLabel: "Admission fee",
    generalFee: 0,
    reservedFee: 0,
    generalDeposit: 0,
    reservedDeposit: 0,
    feeAdjustable: true,
    note: "Universities typically want the migration certificate and the transfer certificate at reporting, which the entrance counselling did not ask for.",
  },
];

export const CATEGORIES = [
  { id: "general", label: "General / OPEN", reserved: false },
  { id: "ews", label: "EWS", reserved: false },
  { id: "obc", label: "OBC — non-creamy-layer", reserved: false },
  { id: "sc", label: "SC", reserved: true },
  { id: "st", label: "ST", reserved: true },
];

/**
 * Suggested defaults for a counselling type and category.
 *
 * @param {string} typeId
 * @param {string} categoryId
 * @returns {{ fee:number, deposit:number }|null}
 */
export function defaultFeesFor(typeId, categoryId) {
  const type = COUNSELLING_TYPES.find((entry) => entry.id === typeId);
  const category = CATEGORIES.find((entry) => entry.id === categoryId);
  if (!type || !category) return null;
  // MCC treats OBC and PwD alongside SC and ST for the reduced fee; JoSAA does not.
  const reduced = type.id.startsWith("mcc") ? category.id !== "general" && category.id !== "ews" : category.reserved;
  return {
    fee: reduced ? type.reservedFee : type.generalFee,
    deposit: reduced ? type.reservedDeposit : type.generalDeposit,
  };
}

/**
 * What the reporting day costs, and how much of it comes back.
 *
 * @param {object} input
 * @param {string} input.typeId
 * @param {number} input.seatFee            Acceptance or registration fee.
 * @param {number} input.securityDeposit    Refundable deposit, 0 where there is none.
 * @param {number} input.instituteFee       First instalment payable at reporting.
 * @param {number} input.travelCost         Fare for the candidate and one parent.
 * @param {number} input.lodgingCost        Stay near the reporting centre.
 * @param {number} input.incidentalCost     Photocopies, affidavits, photographs.
 * @returns {object} costing, or { error }.
 */
export function computeCounsellingCost({
  typeId = "josaa",
  seatFee = 0,
  securityDeposit = 0,
  instituteFee = 0,
  travelCost = 0,
  lodgingCost = 0,
  incidentalCost = 0,
} = {}) {
  const type = COUNSELLING_TYPES.find((entry) => entry.id === typeId);
  if (!type) return { error: "Choose the counselling you are reporting for." };

  const amounts = { seatFee, securityDeposit, instituteFee, travelCost, lodgingCost, incidentalCost };
  const entries = Object.entries(amounts).map(([key, raw]) => [key, Number(raw)]);

  if (entries.some(([, value]) => !Number.isFinite(value))) {
    return { error: "Enter every amount as a number in rupees, or 0 where it does not apply." };
  }
  if (entries.some(([, value]) => value < 0)) {
    return { error: "Amounts cannot be negative." };
  }
  if (entries.some(([, value]) => value > MAX_RUPEES)) {
    return { error: "One of those amounts is beyond any counselling fee. Check the figures." };
  }

  const values = Object.fromEntries(entries);
  const totalToArrange =
    values.seatFee +
    values.securityDeposit +
    values.instituteFee +
    values.travelCost +
    values.lodgingCost +
    values.incidentalCost;

  // The deposit comes back; the acceptance fee comes back only where it is adjusted
  // against the institute fee on admission.
  const refundable = values.securityDeposit;
  const adjustable = type.feeAdjustable ? values.seatFee : 0;
  const recoverable = refundable + adjustable;
  const netCost = totalToArrange - recoverable;

  return {
    type,
    ...values,
    totalToArrange,
    refundable,
    adjustable,
    recoverable,
    netCost,
    recoverablePercent: totalToArrange === 0 ? 0 : Math.round((recoverable / totalToArrange) * 1000) / 10,
    depositAtRisk: values.securityDeposit,
  };
}

/**
 * How much of the reporting window is left.
 * Dates are passed in as ISO "YYYY-MM-DD" strings so the function stays pure.
 *
 * @param {object} input
 * @param {string} input.allotmentDate
 * @param {string} input.lastReportingDate
 * @param {string} input.todayDate
 * @returns {object} window figures, or { error }.
 */
export function computeReportingWindow({ allotmentDate = "", lastReportingDate = "", todayDate = "" } = {}) {
  const parse = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const time = Date.parse(`${value}T00:00:00Z`);
    return Number.isNaN(time) ? null : time;
  };

  const allotment = parse(allotmentDate);
  const last = parse(lastReportingDate);
  const today = parse(todayDate);

  if (allotment === null || last === null || today === null) {
    return { error: "Enter the allotment date, the last reporting date and today's date." };
  }
  if (last < allotment) {
    return { error: "The last reporting date falls before the allotment date. Check both." };
  }

  const windowDays = Math.round((last - allotment) / MILLISECONDS_PER_DAY) + 1;
  const daysLeft = Math.round((last - today) / MILLISECONDS_PER_DAY);
  const elapsed = Math.round((today - allotment) / MILLISECONDS_PER_DAY);

  return {
    windowDays,
    daysLeft,
    daysElapsed: elapsed,
    closed: daysLeft < 0,
    lastDay: daysLeft === 0,
    notStarted: elapsed < 0,
    urgent: daysLeft >= 0 && daysLeft <= 1,
    message:
      daysLeft < 0
        ? `The reporting window closed ${Math.abs(daysLeft)} day(s) ago. A seat not reported against is released, and any security deposit is liable to be forfeited.`
        : daysLeft === 0
          ? "Today is the last day to report. Reach the centre in the morning — a queue at 4 pm is not a defence."
          : `${daysLeft} day(s) left in a ${windowDays}-day window. Collect anything missing today, not on the last morning.`,
  };
}

/**
 * The document list for a counselling type and candidate.
 *
 * @param {object} input
 * @param {string} input.typeId
 * @param {string} input.categoryId
 * @param {object} [input.profile]
 * @returns {object} { type, category, documents } or { error }.
 */
export function buildCounsellingDocuments({ typeId = "josaa", categoryId = "general", profile = {} } = {}) {
  const type = COUNSELLING_TYPES.find((entry) => entry.id === typeId);
  if (!type) return { error: "Choose the counselling you are reporting for." };
  const category = CATEGORIES.find((entry) => entry.id === categoryId);
  if (!category) return { error: "Choose the category you were allotted under." };

  const documents = [
    {
      id: "allotment",
      label: "Provisional seat allotment letter, printed",
      retained: true,
      detail: "Downloaded from the counselling portal after the round. Print it the day it is released, before servers get busy.",
    },
    {
      id: "rankCard",
      label: "Rank card or score card for the entrance",
      retained: false,
      detail: "The one showing the roll number, rank and category rank exactly as used in the allotment.",
    },
    {
      id: "admitCard",
      label: "Entrance admit card",
      retained: false,
      detail: "Checked against the rank card to confirm the roll number belongs to you.",
    },
    {
      id: "classTen",
      label: "Class 10 marksheet and certificate",
      retained: true,
      detail: "This is the date-of-birth proof. Nothing else is accepted for that purpose.",
    },
    {
      id: "classTwelve",
      label: "Class 12 marksheet and pass certificate",
      retained: true,
      detail:
        "The eligibility percentage is verified from this. Carry the marksheet even where the result is available online.",
    },
    {
      id: "photoId",
      label: "Photo identity — Aadhaar or passport",
      retained: false,
      detail: "The name must match the entrance application exactly, initials included.",
    },
    {
      id: "photographs",
      label: "Eight to ten passport photographs",
      retained: true,
      detail: "The same image used in the entrance application. Institutes take several for their own records.",
    },
    {
      id: "medicalFitness",
      label: "Medical fitness certificate in the institute's format",
      retained: true,
      detail: "Download the format from the institute's site first — a general fitness letter from a clinic is usually rejected.",
    },
    {
      id: "feeProof",
      label: "Proof of the fee already paid online",
      retained: false,
      detail: "The transaction receipt and the bank statement line. Portal receipts do go missing.",
    },
  ];

  if (category.id !== "general") {
    documents.push({
      id: "categoryCert",
      label: `${category.label} certificate in the prescribed format`,
      retained: true,
      detail:
        type.id.startsWith("mcc") || type.id === "josaa"
          ? "Central counselling needs the central format, current with reference to the cut-off date in the information bulletin. A state-format certificate is not accepted."
          : "State counselling accepts the state's own format, issued by the authority named in the notification.",
    });
  }
  if (category.id === "obc") {
    documents.push({
      id: "obcValidity",
      label: "Non-creamy-layer declaration for the current year",
      retained: true,
      detail:
        "The certificate has to show non-creamy-layer status valid on the cut-off date, not merely at some earlier point.",
    });
  }
  if (profile.pwd) {
    documents.push({
      id: "pwdCert",
      label: "Disability certificate, and the medical board report if one was directed",
      retained: true,
      detail:
        "Several counsellings require a fresh examination by their own designated board before the seat is confirmed, whatever certificate you hold.",
    });
  }
  if (profile.stateQuota) {
    documents.push({
      id: "domicile",
      label: "Domicile or nativity certificate",
      retained: true,
      detail: "State-quota seats turn on this. It is the document most often missing on reporting day.",
    });
  }
  if (profile.needsMigration) {
    documents.push({
      id: "migration",
      label: "Migration certificate from the previous board or university",
      retained: true,
      detail:
        "Apply for it as soon as the result is out. Boards take weeks to issue one and no institute waives it for long.",
    });
  }
  if (profile.needsTransfer) {
    documents.push({
      id: "transfer",
      label: "Transfer certificate and character certificate from the last institution",
      retained: true,
      detail: "Both are issued by the school or college office, usually on the same day if you ask together.",
    });
  }
  if (profile.gapYear) {
    documents.push({
      id: "gapAffidavit",
      label: "Gap-year affidavit on stamp paper",
      retained: true,
      detail:
        "Stating what you did between school and admission and that you were not enrolled elsewhere. Get it notarised before you travel.",
    });
  }
  if (profile.antiRagging) {
    documents.push({
      id: "antiRagging",
      label: "Anti-ragging undertaking, signed by candidate and parent",
      retained: true,
      detail:
        "Filed online first and then printed. Institutes will not complete admission without the reference number from that filing.",
    });
  }

  return { type, category, documents };
}

/**
 * Readiness across the counselling documents.
 *
 * @param {Array<{id:string}>} documents
 * @param {Array<string>} readyIds
 * @returns {{ ready:number, total:number, percent:number, missing:Array, complete:boolean }}
 */
export function computeCounsellingReadiness(documents, readyIds) {
  const list = Array.isArray(documents) ? documents : [];
  const held = Array.isArray(readyIds) ? readyIds : [];
  const missing = list.filter((doc) => !held.includes(doc.id));
  const total = list.length;
  const have = total - missing.length;
  return {
    ready: have,
    total,
    percent: total === 0 ? 0 : Math.round((have / total) * 100),
    missing,
    complete: total > 0 && missing.length === 0,
  };
}

export default buildCounsellingDocuments;
