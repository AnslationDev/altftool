/**
 * Sublet permission request — letter builder and date maths.
 *
 * Legal backbone (India):
 *  - Transfer of Property Act, 1882, s.108(j): a lessee may sub-let the whole
 *    or any part of his interest "in the absence of a contract or local usage
 *    to the contrary", and remains liable to the lessor under the lease
 *    notwithstanding the sub-lease. Almost every written residential lease
 *    contracts out of this by barring sub-letting without written consent —
 *    which is why the consent has to be asked for in writing.
 *  - Model Tenancy Act, 2021, s.8(1): a tenant shall not sub-let the whole or
 *    part of the premises, or assign or transfer rights in the tenancy, unless
 *    permitted by a SUPPLEMENTARY AGREEMENT to the existing tenancy agreement
 *    entered into between the landlord and the tenant. The Act also requires
 *    the landlord and tenant to jointly intimate the Rent Authority. It applies
 *    only in states that have enacted it.
 *  - Model Bye-laws for Co-operative Housing Societies: a member letting or
 *    parting with possession must intimate the society, and non-occupancy
 *    charges are capped at 10% of service charges.
 *
 * All functions are pure — the current date is always passed in.
 */

/** Default number of days the letter allows the landlord to reply. */
export const DEFAULT_REPLY_DAYS = 15;

export const SUBLET_TYPES = [
  {
    key: "whole",
    label: "Sub-let the whole premises",
    clause: "sub-let the entire premises described above",
  },
  {
    key: "part",
    label: "Sub-let a part (one room / one floor)",
    clause: "sub-let a part of the premises described above",
  },
  {
    key: "payingGuest",
    label: "Take in a paying guest / flatmate",
    clause: "admit a paying guest into the premises described above",
  },
  {
    key: "assignment",
    label: "Assign the whole tenancy to someone else",
    clause: "assign the whole of my interest in the tenancy of the premises described above",
  },
];

export const USE_PURPOSES = [
  { key: "residential", label: "Residential use only" },
  { key: "homeOffice", label: "Residential with a registered home office" },
  { key: "commercial", label: "Commercial / shop use" },
  { key: "studentHousing", label: "Student accommodation" },
];

export const ID_PROOFS = [
  "Aadhaar",
  "Passport",
  "Voter ID",
  "Driving licence",
  "PAN card",
  "Employer ID card",
];

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86400000;

const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const daysInMonth = (year, month) =>
  [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];

/** Parse "YYYY-MM-DD" to {year, month, day}; null when it is not a real calendar date. */
export function parseISODate(text) {
  const match = ISO_RE.exec(String(text || "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2200 || month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

const utc = ({ year, month, day }) => Date.UTC(year, month - 1, day);

const iso = ({ year, month, day }) =>
  `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

/** Add whole days to an ISO date. */
export function addDays(date, count) {
  const parts = parseISODate(date);
  if (!parts || !Number.isFinite(count)) return null;
  const shifted = new Date(utc(parts) + Math.trunc(count) * DAY_MS);
  return iso({
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  });
}

/** Whole days between two ISO dates (b - a). */
export function diffDays(a, b) {
  const first = parseISODate(a);
  const second = parseISODate(b);
  if (!first || !second) return null;
  return Math.round((utc(second) - utc(first)) / DAY_MS);
}

/**
 * Length of the proposed sub-letting.
 * Both endpoints are inclusive, so a 1 Jan to 31 Jan term is 31 days.
 */
export function subletDuration({ startDate, endDate } = {}) {
  const days = diffDays(startDate, endDate);
  if (days === null) return { error: "Enter a valid start and end date for the sub-letting." };
  if (days < 0) return { error: "The sub-letting cannot end before it begins." };
  const inclusiveDays = days + 1;
  return {
    days: inclusiveDays,
    approxMonths: Math.round((inclusiveDays / 30.4375) * 10) / 10,
  };
}

const REQUIRED_FIELDS = [
  ["tenantName", "your full name"],
  ["landlordName", "the landlord's name"],
  ["propertyAddress", "the address of the premises"],
  ["subTenantName", "the proposed sub-tenant's name"],
  ["startDate", "the proposed start date"],
  ["endDate", "the proposed end date"],
];

const line = (label, value) => (value ? `${label}: ${value}` : null);

const formatLongDate = (date) => {
  const parts = parseISODate(date);
  if (!parts) return "";
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${parts.day} ${months[parts.month - 1]} ${parts.year}`;
};

/**
 * Build the sublet-permission letter.
 * Returns { letter, subject, missing, duration, replyBy, ... } or { error }.
 */
export function buildSubletRequest(input = {}) {
  const {
    tenantName = "",
    tenantAddress = "",
    tenantPhone = "",
    tenantEmail = "",
    landlordName = "",
    landlordAddress = "",
    propertyAddress = "",
    agreementDate = "",
    agreementEndDate = "",
    monthlyRent = "",
    subletType = "part",
    portionDescription = "",
    subTenantName = "",
    subTenantOccupation = "",
    subTenantIdProof = "",
    usePurpose = "residential",
    startDate = "",
    endDate = "",
    subletRent = "",
    reason = "",
    remainLiable = true,
    rentUnchanged = true,
    intimateSociety = true,
    policeVerification = true,
    supplementaryAgreement = true,
    replyDays = DEFAULT_REPLY_DAYS,
    letterDate = "",
    place = "",
  } = input;

  const type = SUBLET_TYPES.find((item) => item.key === subletType);
  if (!type) return { error: "Choose what kind of sub-letting you are asking permission for." };

  const purpose = USE_PURPOSES.find((item) => item.key === usePurpose);
  if (!purpose) return { error: "Choose what the premises will be used for." };

  const days = Number(replyDays);
  if (!Number.isFinite(days) || days < 1 || days > 90) {
    return { error: "The reply deadline must be between 1 and 90 days." };
  }

  const missing = REQUIRED_FIELDS.filter(([key]) => !String(input[key] || "").trim()).map(
    ([, label]) => label,
  );

  const duration = subletDuration({ startDate, endDate });
  if (duration.error && !missing.length) return { error: duration.error };

  if (agreementEndDate && endDate && !duration.error) {
    const overrun = diffDays(agreementEndDate, endDate);
    if (overrun !== null && overrun > 0) {
      return {
        error: `The proposed sub-letting ends ${overrun} day(s) after your own tenancy expires on ${formatLongDate(agreementEndDate)}. You cannot grant more than you hold.`,
      };
    }
  }

  const effectiveLetterDate = parseISODate(letterDate) ? letterDate : "";
  const replyBy = effectiveLetterDate ? addDays(effectiveLetterDate, Math.trunc(days)) : null;

  const subject = `Request for written consent to ${type.clause.replace(" described above", "")} at ${propertyAddress || "[address of the premises]"}`;

  const undertakings = [
    remainLiable
      ? "I will continue to remain personally liable to you for the rent and for every other obligation under the tenancy agreement, and section 108(j) of the Transfer of Property Act, 1882 preserves that liability notwithstanding a sub-lease."
      : null,
    rentUnchanged
      ? "The rent, the security deposit and every other term of my tenancy will remain exactly as they are; I am not asking for any change to them."
      : null,
    supplementaryAgreement
      ? "I am willing to record this permission in a supplementary agreement to the existing tenancy agreement, as section 8(1) of the Model Tenancy Act, 2021 contemplates, and to join you in intimating the Rent Authority where that applies."
      : null,
    policeVerification
      ? "I will arrange police verification of the occupant and share a copy of the acknowledgement with you."
      : null,
    intimateSociety
      ? "I will provide the society with the occupant's details so that the society record and any non-occupancy charge position is regularised."
      : null,
    "I will vacate or restore the position on the date stated above without requiring any further notice from you.",
  ].filter(Boolean);

  const body = [
    place || effectiveLetterDate
      ? [place, effectiveLetterDate ? formatLongDate(effectiveLetterDate) : ""]
          .filter(Boolean)
          .join(", ")
      : null,
    "",
    "To,",
    landlordName || "[Landlord's name]",
    landlordAddress || "",
    "",
    `Subject: ${subject}`,
    "",
    `Dear ${landlordName || "[Landlord's name]"},`,
    "",
    `I am the tenant in occupation of ${propertyAddress || "[address of the premises]"}${
      agreementDate ? ` under the tenancy agreement dated ${formatLongDate(agreementDate)}` : ""
    }${monthlyRent ? `, at a monthly rent of ${monthlyRent}` : ""}. I write to seek your written permission to ${type.clause}.`,
    "",
    "Details of the proposal",
    line("Premises", propertyAddress),
    subletType === "part" || subletType === "payingGuest"
      ? line("Portion proposed to be given", portionDescription)
      : null,
    line("Proposed occupant", subTenantName),
    line("Occupation", subTenantOccupation),
    line("Identity proof to be furnished", subTenantIdProof),
    line("Intended use", purpose.label),
    line("Proposed period", startDate && endDate ? `${formatLongDate(startDate)} to ${formatLongDate(endDate)}` : ""),
    !duration.error ? line("Duration", `${duration.days} days (about ${duration.approxMonths} months)`) : null,
    line("Amount payable by the occupant", subletRent),
    line("Reason for the request", reason),
    "",
    "My undertakings",
    ...undertakings.map((text, index) => `${index + 1}. ${text}`),
    "",
    replyBy
      ? `I would be grateful for your written response by ${formatLongDate(replyBy)}, that is within ${Math.trunc(days)} days of this letter, so that I can either proceed on your terms or make other arrangements. I am happy to sign any conditions you wish to attach.`
      : `I would be grateful for your written response within ${Math.trunc(days)} days of this letter, so that I can either proceed on your terms or make other arrangements. I am happy to sign any conditions you wish to attach.`,
    "",
    "Nothing in this letter is intended to alter the tenancy agreement, and I will not permit anyone to occupy the premises unless and until I have your written consent.",
    "",
    "Yours sincerely,",
    "",
    "",
    tenantName || "[Your name]",
    tenantAddress || "",
    [tenantPhone ? `Phone: ${tenantPhone}` : "", tenantEmail ? `Email: ${tenantEmail}` : ""]
      .filter(Boolean)
      .join(" · "),
    "",
    "Enclosures: copy of the tenancy agreement; identity proof of the proposed occupant.",
  ]
    .filter((item) => item !== null)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const words = body.split(/\s+/).filter(Boolean).length;

  return {
    letter: body,
    subject,
    missing,
    complete: missing.length === 0,
    duration: duration.error ? null : duration,
    replyBy,
    replyDays: Math.trunc(days),
    wordCount: words,
    characterCount: body.length,
  };
}
