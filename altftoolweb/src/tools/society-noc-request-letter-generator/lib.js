/**
 * Housing society NOC request letter builder (India).
 *
 * Sources for the rules and figures used below:
 *  - Maharashtra Co-operative Societies Act 1960, s.22(2): the society must communicate its
 *    decision on a membership application within 60 days of receiving it; if it does not, the
 *    applicant is deemed to have been admitted.
 *  - Maharashtra Co-operative Societies Act 1960, s.29(2): shares or interest in the society
 *    cannot be transferred before they have been held for one year.
 *  - Model Bye-laws for Co-operative Housing Societies (Maharashtra, 2014), bye-law 38(a):
 *    a member intending to transfer shares gives the Secretary 15 days' written notice with
 *    the transferee's consent.
 *  - Bye-law 38(e): transfer fee of Rs 500 payable to the society, plus a transfer premium
 *    fixed by the general body which the Government of Maharashtra circular of 9 August 2001
 *    caps at Rs 25,000. No other amount may be demanded as a condition of the NOC.
 *  - Bye-law 43: a member letting the flat on leave and licence informs the society in writing
 *    before the licensee moves in; the Government circular of 1 August 2001 caps non-occupancy
 *    charges at 10% of service charges, excluding municipal taxes.
 *  - Registration Act 1908 s.17 read with Maharashtra Rent Control Act 1999 s.55: a leave and
 *    licence agreement must be in writing and registered.
 *
 * Bye-law numbers are the Maharashtra model set; other states follow the same structure with
 * different numbering, so the letter cites the requirement rather than relying on the number.
 */

/** Bye-law 38(e) read with the Government of Maharashtra circular dated 9 August 2001. */
export const TRANSFER_PREMIUM_CAP = 25000;

/** Bye-law 38(e) — flat transfer fee payable to the society. */
export const TRANSFER_FEE = 500;

/** Government of Maharashtra circular dated 1 August 2001 — non-occupancy charge ceiling. */
export const NON_OCCUPANCY_CAP_PERCENT = 10;

/** Bye-law 38(a) — notice of intention to transfer. */
export const TRANSFER_NOTICE_DAYS = 15;

/** Bye-law 43 — advance intimation before a licensee occupies the flat. */
export const LEAVE_LICENCE_NOTICE_DAYS = 8;

/** MCS Act 1960 s.22(2) — deemed admission if the society stays silent. */
export const SOCIETY_DECISION_DAYS = 60;

/** MCS Act 1960 s.29(2) — minimum holding before a transfer. */
export const MINIMUM_HOLDING_MONTHS = 12;

export const NOC_PURPOSES = [
  {
    value: "sale",
    label: "Sale / transfer of the flat",
    subject: "Request for No Objection Certificate for transfer of",
    noticeDays: TRANSFER_NOTICE_DAYS,
    purposeLine:
      "I intend to transfer my flat together with the shares and interest I hold in the society to the proposed transferee named below, and I request the society's No Objection Certificate for that transfer.",
    enclosures: [
      "Notice of intention to transfer signed by me (bye-law 38(a) format)",
      "Written consent of the proposed transferee to become a member",
      "Copy of the share certificate issued to me",
      "Copy of the registered agreement or index II for my flat",
      "Latest maintenance bill and receipt showing no dues",
      "Application for membership from the transferee with the entrance fee",
    ],
    notes: [
      `The society may charge the transfer fee of Rs ${TRANSFER_FEE} and a transfer premium fixed by the general body, which is capped at Rs ${TRANSFER_PREMIUM_CAP}. No donation or extra amount may be demanded as a condition of the NOC.`,
      `Shares must have been held for at least ${MINIMUM_HOLDING_MONTHS} months before a transfer (s.29(2), MCS Act 1960).`,
    ],
  },
  {
    value: "rent",
    label: "Leave and licence / renting out",
    subject: "Intimation and request for No Objection Certificate for leave and licence of",
    noticeDays: LEAVE_LICENCE_NOTICE_DAYS,
    purposeLine:
      "I intend to give my flat on leave and licence and I am informing the society in advance, with a request for the society's No Objection Certificate so that the licensee can be registered with the society and the building security.",
    enclosures: [
      "Draft or registered leave and licence agreement",
      "Photo identity and address proof of the licensee and every occupant",
      "Police verification form for the licensee",
      "Latest maintenance bill and receipt showing no dues",
      "Undertaking that I remain liable for the society's dues during the licence",
    ],
    notes: [
      `Non-occupancy charges cannot exceed ${NON_OCCUPANCY_CAP_PERCENT}% of the service charges, excluding municipal taxes.`,
      "The leave and licence agreement has to be in writing and registered; registration is the licensor's responsibility.",
    ],
  },
  {
    value: "mortgage",
    label: "Bank loan / mortgage of the flat",
    subject: "Request for No Objection Certificate for mortgage of",
    noticeDays: 0,
    purposeLine:
      "I have applied for a housing loan secured against my flat and the lender requires a No Objection Certificate from the society recording that the society has no objection to the mortgage and will note the lien in its records.",
    enclosures: [
      "Sanction letter or loan application reference from the lender",
      "Copy of the share certificate and the registered agreement for the flat",
      "Latest maintenance bill and receipt showing no dues",
      "Format of NOC required by the lender, if the lender prescribes one",
    ],
    notes: [
      "The society only records the lien; it does not become a guarantor for the loan.",
      "The society cannot make the NOC conditional on payment of anything other than lawful dues already billed.",
    ],
  },
  {
    value: "renovation",
    label: "Interior renovation of the flat",
    subject: "Request for No Objection Certificate for interior renovation of",
    noticeDays: 8,
    purposeLine:
      "I propose to carry out interior renovation work in my flat and request the society's No Objection Certificate so that the work can begin on the dates set out below.",
    enclosures: [
      "Scope of work and layout showing that no structural member is touched",
      "Structural engineer's certificate where any change affects a wall or slab",
      "Contractor details with worker identity proofs",
      "Debris removal plan and the security deposit demanded by the society",
      "Latest maintenance bill and receipt showing no dues",
    ],
    notes: [
      "No structural change, no change to the elevation and no work on load-bearing members without a licensed structural engineer's certificate and municipal permission where required.",
      "Work is normally allowed only on working days within the hours fixed by the managing committee.",
    ],
  },
  {
    value: "utility",
    label: "New water, gas, electricity or internet connection",
    subject: "Request for No Objection Certificate for a new utility connection to",
    noticeDays: 0,
    purposeLine:
      "The utility provider named below requires a No Objection Certificate from the society before the connection can be released to my flat, and I request the society to issue it.",
    enclosures: [
      "Application or reference number issued by the utility provider",
      "Copy of the share certificate and the agreement for the flat",
      "Latest maintenance bill and receipt showing no dues",
      "Sketch of the route where any cable or pipe passes through common areas",
    ],
    notes: [
      "Any work in common areas needs the managing committee's approval on the route and on restoring finishes afterwards.",
      "The connection is in the occupant's name; the society is not billed for consumption.",
    ],
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

const isIsoDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim());

/** Pure date arithmetic on ISO strings — no clock is read anywhere in this module. */
export function addDays(isoDate, days) {
  if (!isIsoDate(isoDate) || !Number.isFinite(days)) return null;
  const [year, month, day] = isoDate.trim().split("-").map(Number);
  const base = Date.UTC(year, month - 1, day);
  if (!Number.isFinite(base)) return null;
  const shifted = new Date(base + days * DAY_MS);
  if (Number.isNaN(shifted.getTime())) return null;
  return shifted.toISOString().slice(0, 10);
}

/** "2026-08-04" -> "04 August 2026". Returns the input unchanged when it is not a date. */
export function formatLongDate(isoDate) {
  if (!isIsoDate(isoDate)) return "";
  const [year, month, day] = isoDate.trim().split("-").map(Number);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  if (!(month >= 1 && month <= 12)) return "";
  return `${String(day).padStart(2, "0")} ${months[month - 1]} ${year}`;
}

const clean = (value) => (typeof value === "string" ? value.trim() : "");

/**
 * Build the NOC request letter.
 * Returns { error } for unusable input, otherwise
 * { letter, subject, enclosures, notes, missing, readiness, decisionDueDate, effectiveFrom }.
 */
export function buildNocRequestLetter({
  purpose = "sale",
  societyName = "",
  societyAddress = "",
  memberName = "",
  flatNumber = "",
  wing = "",
  shareCertificateNumber = "",
  membershipNumber = "",
  letterDate = "",
  effectiveDate = "",
  counterpartyName = "",
  counterpartyDetail = "",
  outstandingDues = 0,
  contactPhone = "",
  contactEmail = "",
  extraNote = "",
}) {
  const config = NOC_PURPOSES.find((item) => item.value === purpose);
  if (!config) return { error: "Choose what the No Objection Certificate is needed for." };

  const society = clean(societyName);
  const member = clean(memberName);
  const flat = clean(flatNumber);

  if (!society) return { error: "Enter the registered name of the housing society." };
  if (!member) return { error: "Enter the name of the member making the request." };
  if (!flat) return { error: "Enter the flat number the request relates to." };
  if (!isIsoDate(letterDate)) return { error: "Pick the date of the letter." };
  if (effectiveDate && !isIsoDate(effectiveDate)) {
    return { error: "The proposed date must be a real calendar date." };
  }
  const dues = Number(outstandingDues);
  if (!Number.isFinite(dues) || dues < 0) {
    return { error: "Outstanding dues must be zero or a positive amount." };
  }

  const decisionDueDate = addDays(letterDate, SOCIETY_DECISION_DAYS);
  const earliestEffective = config.noticeDays > 0 ? addDays(letterDate, config.noticeDays) : letterDate;

  const warnings = [];
  if (effectiveDate && earliestEffective && effectiveDate < earliestEffective) {
    warnings.push(
      `The bye-laws expect ${config.noticeDays} days' notice, so the earliest date you can rely on is ${formatLongDate(earliestEffective)}.`,
    );
  }
  if (dues > 0) {
    warnings.push(
      "Outstanding dues are the most common reason an NOC is refused — clear them or attach the agreed payment plan.",
    );
  }

  const missing = [];
  if (!clean(shareCertificateNumber)) missing.push("Share certificate number");
  if (!clean(membershipNumber)) missing.push("Membership / registration number");
  if (!clean(contactPhone) && !clean(contactEmail)) missing.push("A phone number or email for the reply");
  if (config.value !== "utility" && config.value !== "renovation" && !clean(counterpartyName)) {
    missing.push("Name of the transferee, licensee or lender");
  }
  if (!effectiveDate) missing.push("Proposed effective date");

  const address = [
    "To,",
    "The Secretary / Hon. Chairman,",
    `${society}${/\b(society|chs|cghs|apartment|association|owners)\b/i.test(society) ? "" : " Co-operative Housing Society Ltd."}`,
    clean(societyAddress),
  ]
    .filter(Boolean)
    .join("\n");

  const flatLabel = clean(wing) ? `Flat No. ${flat}, ${clean(wing)}` : `Flat No. ${flat}`;

  const identityLine = [
    `I am the member holding ${flatLabel}`,
    clean(shareCertificateNumber) ? `under Share Certificate No. ${clean(shareCertificateNumber)}` : "",
    clean(membershipNumber) ? `and Membership No. ${clean(membershipNumber)}` : "",
  ]
    .filter(Boolean)
    .join(" ")
    .concat(".");

  const counterpartyBlock =
    clean(counterpartyName) || clean(counterpartyDetail)
      ? `\n${[
          "Details:",
          clean(counterpartyName) ? `Name: ${clean(counterpartyName)}` : "",
          clean(counterpartyDetail) ? `Particulars: ${clean(counterpartyDetail)}` : "",
        ]
          .filter(Boolean)
          .join("\n")}`
      : "";

  const duesLine =
    dues > 0
      ? `As on the date of this letter an amount of Rs ${dues.toLocaleString("en-IN")} is outstanding against my flat, which I undertake to clear before the certificate is acted upon.`
      : "All maintenance and other society dues against my flat are paid up to date and I am not in default.";

  const effectiveLine = effectiveDate
    ? `The proposed effective date is ${formatLongDate(effectiveDate)}.`
    : "I will confirm the effective date as soon as it is fixed.";

  const enclosureBlock = config.enclosures
    .map((item, index) => `${index + 1}. ${item}`)
    .join("\n");

  const signOff = [
    "Yours faithfully,",
    "(signature)",
    member,
    flatLabel,
    clean(contactPhone) ? `Phone: ${clean(contactPhone)}` : "",
    clean(contactEmail) ? `Email: ${clean(contactEmail)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const letter = [
    formatLongDate(letterDate),
    "",
    address,
    "",
    `Subject: ${config.subject} ${flatLabel}`,
    "",
    "Respected Sir / Madam,",
    "",
    identityLine,
    "",
    config.purposeLine,
    counterpartyBlock,
    "",
    effectiveLine,
    "",
    duesLine,
    "",
    `I request the managing committee to place this application before the next committee meeting and to communicate its decision in writing. I am given to understand that a decision is expected within ${SOCIETY_DECISION_DAYS} days of this application${decisionDueDate ? `, that is by ${formatLongDate(decisionDueDate)}` : ""}.`,
    clean(extraNote) ? `\n${clean(extraNote)}` : "",
    "",
    "The following documents are enclosed:",
    enclosureBlock,
    "",
    "Thank you for your consideration.",
    "",
    signOff,
  ]
    .filter((block) => block !== null && block !== undefined)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const words = letter.split(/\s+/).filter(Boolean).length;
  const totalChecks = 5;
  const readiness = Math.round(((totalChecks - Math.min(missing.length, totalChecks)) / totalChecks) * 100);

  return {
    letter,
    subject: `${config.subject} ${flatLabel}`,
    enclosures: config.enclosures,
    notes: config.notes,
    warnings,
    missing,
    readiness,
    wordCount: words,
    decisionDueDate,
    effectiveFrom: earliestEffective,
    noticeDays: config.noticeDays,
  };
}
