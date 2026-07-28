/**
 * Address change request letter builder (India).
 *
 * Rules referenced:
 *  - Motor Vehicles Act, 1988, s.49(1): where the owner of a registered motor
 *    vehicle ceases to reside at the address recorded in the certificate of
 *    registration, they must intimate the new address to the registering
 *    authority within thirty days of the change, in the prescribed form
 *    (Form 33 under the Central Motor Vehicles Rules, 1989).
 *  - RBI Master Direction on Know Your Customer: where the officially valid
 *    document (OVD) produced does not carry the current address, a limited set
 *    of documents is "deemed to be an OVD" for the limited purpose of proving
 *    address — among them a utility bill of any service provider that is not
 *    more than two months old. The customer must then submit an OVD carrying
 *    the updated address within three months of producing the deemed OVD.
 *  - Aadhaar (Enrolment and Update) Regulations, 2016: a resident is expected
 *    to keep the demographic information in the Aadhaar record current, and an
 *    address update needs a supported proof of address.
 *  - Registration of Electors Rules, 1960: a shift of residence is notified to
 *    the electoral registration officer in Form 8.
 *
 * Nothing here is legal advice; deadlines other than the ones named above are
 * institutional practice and vary by organisation.
 */

/* ------------------------------------------------------------------ dates */

const MS_PER_DAY = 86_400_000;

export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

const toISO = (date) => date.toISOString().slice(0, 10);

export function addDaysISO(isoDate, days) {
  const date = parseISODate(isoDate);
  if (!date || !Number.isFinite(days)) return null;
  return toISO(new Date(date.getTime() + Math.round(days) * MS_PER_DAY));
}

/** Add calendar months, clamping to the last day of the target month. */
export function addMonthsISO(isoDate, months) {
  const date = parseISODate(isoDate);
  if (!date || !Number.isFinite(months)) return null;
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + Math.round(months);
  const d = date.getUTCDate();
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return toISO(new Date(Date.UTC(y, m, Math.min(d, lastDay))));
}

export function daysBetweenISO(fromISO, toISODate) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISODate);
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export function formatLongDate(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/* --------------------------------------------------------------- constants */

/** Motor Vehicles Act, 1988, s.49(1) — intimate the RTO within 30 days. */
export const RTO_INTIMATION_DAYS = 30;
/** RBI KYC Master Direction — a utility bill must be under two months old. */
export const UTILITY_BILL_MAX_AGE_MONTHS = 2;
/** RBI KYC Master Direction — updated OVD due within three months of a deemed OVD. */
export const OVD_UPDATE_MONTHS = 3;
/** Sanity bound: a move recorded more than this long ago is almost certainly a typo. */
export const MAX_MOVE_AGE_DAYS = 3650;

/* -------------------------------------------------------------- recipients */

export const RECIPIENTS = [
  {
    id: "bank",
    label: "Bank or NBFC",
    addressee: "The Branch Manager",
    orgLabel: "Bank and branch",
    refLabel: "Account number",
    kycRule: true,
    proofs: [
      "Aadhaar, passport, driving licence or voter ID showing the new address",
      "A utility bill for the new address that is not more than two months old",
      "Registered rent agreement or the latest property tax receipt",
    ],
    ask: "update the address recorded against my account in your core banking record and in the KYC file",
    extra:
      "Please also update the address on my cheque book, debit card and account statements, and send an SMS or email confirmation to my registered contact details once it is done.",
  },
  {
    id: "school",
    label: "School or college",
    addressee: "The Principal",
    orgLabel: "Institution name",
    refLabel: "Admission / roll number",
    kycRule: false,
    proofs: [
      "A utility bill or rent agreement for the new address",
      "Aadhaar of the parent or guardian showing the new address",
    ],
    ask: "update the residential address in the student record and in the school's communication list",
    extra:
      "Please make sure the change is reflected in the transport route allotment, report card and all future circulars and SMS alerts.",
  },
  {
    id: "electricity",
    label: "Electricity board / discom",
    addressee: "The Assistant Engineer / Nodal Officer",
    orgLabel: "Distribution company",
    refLabel: "Consumer number",
    kycRule: false,
    proofs: [
      "Sale deed, registered rent agreement or allotment letter for the premises",
      "The latest paid electricity bill for the connection",
      "Photo identity of the consumer",
    ],
    ask: "update the billing address recorded against my consumer number",
    extra:
      "This request is only to change the address to which bills and notices are sent; it is not an application to shift the meter or transfer the connection to another person.",
  },
  {
    id: "gas",
    label: "LPG / piped gas agency",
    addressee: "The Distributor",
    orgLabel: "Gas agency and company",
    refLabel: "Consumer / LPG ID",
    kycRule: false,
    proofs: [
      "Proof of address for the new premises",
      "The subscription voucher and the blue book / customer card",
    ],
    ask: "update the delivery and billing address recorded against my consumer number",
    extra:
      "If the new address falls outside your delivery area, please advise me on the termination voucher so that I can take a new connection at my new location.",
  },
  {
    id: "insurance",
    label: "Insurance company",
    addressee: "The Branch Head / Customer Service Manager",
    orgLabel: "Insurer",
    refLabel: "Policy number",
    kycRule: true,
    proofs: [
      "A KYC-compliant proof of address for the new address",
      "A copy of the policy schedule",
    ],
    ask: "update the correspondence address recorded against my policy",
    extra:
      "Please confirm the change on the policy servicing portal as well, so that renewal notices and premium receipts reach the correct address.",
  },
  {
    id: "employer",
    label: "Employer / HR department",
    addressee: "The Head of Human Resources",
    orgLabel: "Employer",
    refLabel: "Employee ID",
    kycRule: false,
    proofs: ["Proof of the new address, if your HR policy requires it"],
    ask: "update my residential address in the HR master, payroll record and the EPF and insurance records",
    extra:
      "Please also make sure the change is passed on for Form 16, the group medical policy and any courier of documents to my home.",
  },
  {
    id: "post",
    label: "Post office (redirection)",
    addressee: "The Postmaster",
    orgLabel: "Post office",
    refLabel: "Old address PIN code",
    kycRule: false,
    proofs: ["Photo identity", "Proof of the new address"],
    ask: "register a redirection so that post addressed to my old address is forwarded to my new address",
    extra: "Please confirm the redirection period available and the fee payable for it.",
  },
  {
    id: "rto",
    label: "RTO / registering authority",
    addressee: "The Registering Authority",
    orgLabel: "Regional Transport Office",
    refLabel: "Vehicle registration number",
    kycRule: false,
    isRto: true,
    proofs: [
      "Form 33 duly filled and signed",
      "Original certificate of registration",
      "Proof of the new address",
      "Valid insurance certificate and pollution under control certificate",
      "No objection certificate from the financier, if the vehicle is hypothecated",
    ],
    ask: "record my new address on the certificate of registration of the vehicle mentioned above",
    extra:
      "I am submitting this intimation under section 49 of the Motor Vehicles Act, 1988 in Form 33 as prescribed under the Central Motor Vehicles Rules, 1989.",
  },
  {
    id: "telecom",
    label: "Telecom / broadband provider",
    addressee: "The Nodal Officer",
    orgLabel: "Service provider",
    refLabel: "Mobile / account number",
    kycRule: true,
    proofs: ["A valid proof of address for the new address", "Photo identity"],
    ask: "update the billing address recorded against my connection",
    extra:
      "If the new address is outside your service area for this plan, please let me know the options before making any change to the connection.",
  },
];

export function recipientById(id) {
  return RECIPIENTS.find((item) => item.id === id) || RECIPIENTS[0];
}

/* --------------------------------------------------------------- assessment */

/**
 * Work out the timing position: how long ago the move happened, the section 49
 * intimation deadline, whether the chosen utility bill is still fresh enough to
 * serve as address proof, and when an updated OVD would be due.
 * Pure: all dates are arguments.
 */
export function assessAddressChange({ moveDateISO, letterDateISO, proofBillDateISO }) {
  if (!parseISODate(letterDateISO)) return { error: "Enter a valid date for the letter." };
  if (!parseISODate(moveDateISO)) return { error: "Enter a valid date on which you moved (or will move)." };

  const daysSinceMove = daysBetweenISO(moveDateISO, letterDateISO);
  if (daysSinceMove > MAX_MOVE_AGE_DAYS) {
    return { error: "That move date is more than ten years ago — check the date." };
  }
  if (daysSinceMove < -MAX_MOVE_AGE_DAYS) {
    return { error: "That move date is more than ten years in the future — check the date." };
  }

  const rtoDeadlineISO = addDaysISO(moveDateISO, RTO_INTIMATION_DAYS);
  const rtoOverdueBy = Math.max(0, daysBetweenISO(rtoDeadlineISO, letterDateISO));
  const rtoDaysLeft = Math.max(0, daysBetweenISO(letterDateISO, rtoDeadlineISO));

  let billAgeDays = null;
  let billValidUntilISO = null;
  let billAcceptable = null;
  if (parseISODate(proofBillDateISO)) {
    billAgeDays = daysBetweenISO(proofBillDateISO, letterDateISO);
    if (billAgeDays < 0) {
      return { error: "The bill you are using as proof is dated in the future." };
    }
    billValidUntilISO = addMonthsISO(proofBillDateISO, UTILITY_BILL_MAX_AGE_MONTHS);
    billAcceptable = daysBetweenISO(letterDateISO, billValidUntilISO) >= 0;
  }

  return {
    daysSinceMove,
    movedAlready: daysSinceMove >= 0,
    rtoDeadlineISO,
    rtoOverdueBy,
    rtoDaysLeft,
    rtoOverdue: rtoOverdueBy > 0,
    billAgeDays,
    billValidUntilISO,
    billAcceptable,
    ovdDueISO: addMonthsISO(letterDateISO, OVD_UPDATE_MONTHS),
  };
}

/* ------------------------------------------------------------------ letter */

const clean = (value) => (typeof value === "string" ? value.trim() : "");
const or = (value, fallback) => clean(value) || fallback;

export function plural(count, word) {
  const n = Math.abs(Math.round(Number(count) || 0));
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export function buildAddressChangeLetter({
  senderName,
  recipientId,
  organisationName,
  branchOrOffice,
  organisationAddress,
  addressee,
  referenceNumber,
  oldAddress,
  newAddress,
  moveDateISO,
  letterDateISO,
  proofDocument,
  proofBillDateISO,
  phone,
  email,
  assessment,
}) {
  if (!assessment || assessment.error) {
    return { error: assessment?.error || "Fix the dates before drafting the letter." };
  }

  const recipient = recipientById(recipientId);
  const name = or(senderName, "[Your full name]");
  const org = or(organisationName, `[${recipient.orgLabel}]`);
  const to = or(addressee, recipient.addressee);
  const ref = or(referenceNumber, `[${recipient.refLabel}]`);
  const oldAddr = or(oldAddress, "[Your old address]");
  const newAddr = or(newAddress, "[Your new address]");

  const moveSentence = assessment.movedAlready
    ? `I have shifted my residence with effect from ${formatLongDate(moveDateISO)}, ${plural(assessment.daysSinceMove, "day")} ago, and I request you to ${recipient.ask}.`
    : `I will be shifting my residence with effect from ${formatLongDate(moveDateISO)}, ${plural(assessment.daysSinceMove, "day")} from the date of this letter, and I request you to ${recipient.ask}.`;

  const statutoryLines = [];
  if (recipient.isRto) {
    statutoryLines.push(
      assessment.rtoOverdue
        ? `Section 49 of the Motor Vehicles Act, 1988 requires the change of address to be intimated within ${RTO_INTIMATION_DAYS} days, which fell due on ${formatLongDate(assessment.rtoDeadlineISO)}. This intimation is ${plural(assessment.rtoOverdueBy, "day")} late and I request that the delay be condoned; I am willing to pay any fee or penalty payable.`
        : `Section 49 of the Motor Vehicles Act, 1988 requires the change to be intimated within ${RTO_INTIMATION_DAYS} days of the change of residence, that is by ${formatLongDate(assessment.rtoDeadlineISO)}. This intimation is being filed within that period.`,
    );
  }
  if (recipient.kycRule) {
    statutoryLines.push(
      `The proof of address enclosed is submitted for updating my KYC record. If you treat it as a document deemed to be an officially valid document, I will submit an officially valid document carrying the updated address within ${OVD_UPDATE_MONTHS} months, that is by ${formatLongDate(assessment.ovdDueISO)}.`,
    );
  }
  if (assessment.billAcceptable === false) {
    statutoryLines.push(
      `Please note that the utility bill I hold is dated ${formatLongDate(proofBillDateISO)} and is therefore older than ${UTILITY_BILL_MAX_AGE_MONTHS} months. If a more recent bill is required, please tell me and I will provide one.`,
    );
  }

  const proofLine = clean(proofDocument)
    ? `Proof of the new address enclosed: ${clean(proofDocument)}${parseISODate(proofBillDateISO) ? ` dated ${formatLongDate(proofBillDateISO)}` : ""}.`
    : "Proof of the new address is enclosed with this letter.";

  const subject = `Change of address — ${recipient.refLabel} ${ref} — ${name}`;

  const body = [
    formatLongDate(letterDateISO),
    "",
    "To,",
    `${to},`,
    `${org}${clean(branchOrOffice) ? `, ${clean(branchOrOffice)}` : ""}`,
    clean(organisationAddress),
    "",
    `Subject: ${subject}`,
    "",
    "Dear Sir / Madam,",
    "",
    `I am ${name}, and my ${recipient.refLabel.toLowerCase()} with you is ${ref}.`,
    "",
    moveSentence,
    "",
    "Old address:",
    oldAddr,
    "",
    "New address:",
    newAddr,
    "",
    proofLine,
    "",
    "Documents that are normally accepted for this change:",
    ...recipient.proofs.map((item, index) => `${index + 1}. ${item}`),
    "",
    ...statutoryLines,
    "",
    recipient.extra,
    "",
    "Please acknowledge this request and confirm in writing once the record has been updated. Do let me know if any form has to be signed in person or any fee is payable.",
    "",
    "Thank you.",
    "",
    "Yours faithfully,",
    "",
    name,
    `${recipient.refLabel}: ${ref}`,
    clean(phone) ? `Phone: ${clean(phone)}` : "Phone: [your phone number]",
    clean(email) ? `Email: ${clean(email)}` : "Email: [your email address]",
    "",
    "New address:",
    newAddr,
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    subject,
    body,
    wordCount: body.split(/\s+/).filter(Boolean).length,
    recipient,
  };
}
