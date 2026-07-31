/**
 * Data correction (rectification) request letter generator.
 *
 * Statutory basis per regime:
 *
 *  - EU GDPR Art. 16: the data subject has the right to obtain rectification of
 *    inaccurate personal data without undue delay, and to have incomplete data
 *    completed, including by means of a supplementary statement.
 *    Art. 12(3): the controller must respond without undue delay and in any event
 *    within one calendar month of receipt, extendable by two further months where
 *    necessary given the complexity and number of requests, with notice of the
 *    extension inside the first month.
 *    Art. 18(1)(a): while accuracy is contested, the data subject may require
 *    processing to be restricted for the period needed to verify it.
 *    Art. 19: the controller must communicate the rectification to each recipient
 *    the data was disclosed to, unless that is impossible or disproportionate.
 *    Art. 12(5): the response is free of charge.
 *
 *  - UK GDPR: identical articles, enforced by the ICO.
 *
 *  - India, Digital Personal Data Protection Act, 2023 s.12(2): a Data Principal
 *    has the right to correction, completion and updating of personal data. The
 *    Act itself sets no number of days; the response period is set by rules made
 *    under the Act, so this tool applies a stated 30-day assumption and flags it
 *    rather than presenting it as a statutory figure.
 *
 *  - California, Cal. Civ. Code s.1798.106: the right to correct inaccurate
 *    personal information, with the response deadline in s.1798.130(a)(2) of 45
 *    calendar days from receipt, extendable once by a further 45 days on notice.
 *
 * All date maths takes the request date as an argument, so the module stays pure.
 */

const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const REGIMES = [
  {
    id: "gdpr",
    label: "EU — GDPR",
    right: "Article 16 GDPR (right to rectification)",
    deadlineKind: "months",
    deadlineValue: 1,
    extensionKind: "months",
    extensionValue: 2,
    statutory: true,
    freeOfCharge: "Article 12(5) GDPR",
  },
  {
    id: "uk-gdpr",
    label: "UK — UK GDPR",
    right: "Article 16 UK GDPR (right to rectification)",
    deadlineKind: "months",
    deadlineValue: 1,
    extensionKind: "months",
    extensionValue: 2,
    statutory: true,
    freeOfCharge: "Article 12(5) UK GDPR",
  },
  {
    id: "india-dpdp",
    label: "India — DPDP Act, 2023",
    right: "Section 12(2), Digital Personal Data Protection Act, 2023",
    deadlineKind: "days",
    deadlineValue: 30,
    extensionKind: "none",
    extensionValue: 0,
    statutory: false,
    freeOfCharge: "No fee is payable for exercising a Data Principal right",
  },
  {
    id: "ccpa",
    label: "California — CCPA/CPRA",
    right: "Cal. Civ. Code s.1798.106 (right to correct)",
    deadlineKind: "days",
    deadlineValue: 45,
    extensionKind: "days",
    extensionValue: 45,
    statutory: true,
    freeOfCharge: "Cal. Civ. Code s.1798.130(a)(2) — free for up to two requests a year",
  },
];

export const DELIVERY_METHODS = [
  { id: "email", label: "Email to the privacy team" },
  { id: "recorded", label: "Recorded / registered post" },
  { id: "portal", label: "In-product privacy request form" },
];

const REGIME_BY_ID = new Map(REGIMES.map((item) => [item.id, item]));

const clean = (value) => String(value ?? "").trim();

const parseIso = (iso) => {
  if (!ISO_PATTERN.test(String(iso))) return null;
  const [year, month, day] = String(iso).split("-").map(Number);
  const stamp = Date.UTC(year, month - 1, day);
  const date = new Date(stamp);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
};

const toIso = (date) => date.toISOString().slice(0, 10);

/** Days in a given UTC month, leap years included. */
function daysInMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/**
 * Add whole calendar months. Where the target month is shorter, the deadline
 * falls on its last day — the convention the ICO applies to the one-month
 * response period (31 January + 1 month = 28 or 29 February).
 */
export function addCalendarMonths(iso, months) {
  const date = parseIso(iso);
  if (!date || !Number.isInteger(months)) return null;
  const year = date.getUTCFullYear();
  const monthIndex = date.getUTCMonth() + months;
  const day = date.getUTCDate();
  const targetYear = year + Math.floor(monthIndex / 12);
  const targetMonth = ((monthIndex % 12) + 12) % 12;
  const capped = Math.min(day, daysInMonth(targetYear, targetMonth));
  return toIso(new Date(Date.UTC(targetYear, targetMonth, capped)));
}

/** Add whole calendar days. */
export function addCalendarDays(iso, days) {
  const date = parseIso(iso);
  if (!date || !Number.isInteger(days)) return null;
  return toIso(new Date(date.getTime() + days * 86400000));
}

function applyPeriod(iso, kind, value) {
  if (kind === "months") return addCalendarMonths(iso, value);
  if (kind === "days") return addCalendarDays(iso, value);
  return null;
}

/**
 * @param {object} input
 * @param {string} input.fullName      Name of the person making the request.
 * @param {string} input.postalAddress Their address, for identification.
 * @param {string} input.email         Reply address.
 * @param {string} input.accountRef    Customer or account number held by the org.
 * @param {string} input.organisation  Organisation the request is addressed to.
 * @param {string} input.orgAddress    Its address or privacy team address.
 * @param {string} input.regime        One of REGIMES[].id.
 * @param {Array<{field:string,incorrectValue:string,correctValue:string,evidence:string}>} input.fields
 * @param {string} input.requestDate   ISO date the request is sent (yyyy-mm-dd).
 * @param {boolean} input.includeRestriction Ask for processing to be restricted meanwhile.
 * @param {boolean} input.includeDownstream  Ask for recipients to be told.
 * @param {string} input.deliveryMethod One of DELIVERY_METHODS[].id.
 * @returns {object} letter and deadlines, or { error }.
 */
export function buildCorrectionLetter({
  fullName = "",
  postalAddress = "",
  email = "",
  accountRef = "",
  organisation = "",
  orgAddress = "",
  regime = "gdpr",
  fields = [],
  requestDate = "",
  includeRestriction = true,
  includeDownstream = true,
  deliveryMethod = "email",
} = {}) {
  const name = clean(fullName);
  if (!name) return { error: "Enter the name of the person making the request." };

  const org = clean(organisation);
  if (!org) return { error: "Enter the organisation holding the incorrect data." };

  const law = REGIME_BY_ID.get(regime);
  if (!law) return { error: "Choose one of the supported privacy regimes." };

  if (!parseIso(requestDate)) {
    return { error: "Enter the request date as a real calendar date." };
  }

  const rows = fields
    .map((row) => ({
      field: clean(row?.field),
      incorrectValue: clean(row?.incorrectValue),
      correctValue: clean(row?.correctValue),
      evidence: clean(row?.evidence),
    }))
    .filter((row) => row.field && row.correctValue);

  if (rows.length === 0) {
    return {
      error:
        "Add at least one correction: name the field and give the correct value. A request that does not say what is wrong cannot be actioned.",
    };
  }
  if (rows.length > 40) {
    return { error: "List 40 corrections or fewer in a single letter." };
  }

  const deadlineDate = applyPeriod(requestDate, law.deadlineKind, law.deadlineValue);
  const extensionDate =
    law.extensionKind === "none"
      ? null
      : applyPeriod(deadlineDate, law.extensionKind, law.extensionValue);

  if (!deadlineDate) return { error: "Could not calculate the response deadline from that date." };

  const deadlineLabel =
    law.deadlineKind === "months"
      ? `${law.deadlineValue} calendar month${law.deadlineValue === 1 ? "" : "s"}`
      : `${law.deadlineValue} calendar days`;

  const delivery = DELIVERY_METHODS.find((item) => item.id === deliveryMethod) || DELIVERY_METHODS[0];

  const ref = clean(accountRef);

  const subject = `Request for correction of inaccurate personal data — ${name}${ref ? ` (ref ${ref})` : ""}`;

  const bodyLines = [
    `Dear ${org} Privacy Team,`,
    "",
    `I am writing to exercise my right to have inaccurate personal data about me corrected under ${law.right}.`,
    ref
      ? `You hold data about me under the reference ${ref}. My details are: ${name}${clean(postalAddress) ? `, ${clean(postalAddress)}` : ""}${clean(email) ? `, ${clean(email)}` : ""}.`
      : `My details are: ${name}${clean(postalAddress) ? `, ${clean(postalAddress)}` : ""}${clean(email) ? `, ${clean(email)}` : ""}.`,
    "",
    `The following ${rows.length} item${rows.length === 1 ? " is" : "s are"} inaccurate. For each one I have set out the value you currently hold, the correct value, and the evidence supporting it.`,
    "",
    ...rows.flatMap((row, index) => [
      `${index + 1}. ${row.field}`,
      `   Currently recorded: ${row.incorrectValue || "(value unknown to me)"}`,
      `   Correct value: ${row.correctValue}`,
      row.evidence ? `   Evidence: ${row.evidence}` : "   Evidence: available on request",
    ]),
    "",
    includeRestriction && (law.id === "gdpr" || law.id === "uk-gdpr")
      ? "While you verify the accuracy of these entries, I ask you to restrict processing of the disputed data under Article 18(1)(a), so it is stored but not otherwise used."
      : "",
    includeDownstream
      ? law.id === "gdpr" || law.id === "uk-gdpr"
        ? "Under Article 19 I also ask you to communicate the corrections to every recipient the data has been disclosed to, and to tell me who those recipients are."
        : "Please also pass the corrections to any third party you have shared the incorrect data with, and tell me who they are."
      : "",
    "",
    `Please confirm in writing what you have corrected. I expect a response by ${deadlineDate}, being ${deadlineLabel} from the date of this request.${extensionDate ? ` If you need the permitted extension you must tell me, with reasons, before that date, and the extended deadline would be ${extensionDate}.` : ""}`,
    law.statutory
      ? `${law.freeOfCharge} means no fee is payable for this request.`
      : `No fee is payable for exercising this right.`,
    "",
    `Sent by ${delivery.label.toLowerCase()} on ${requestDate}.`,
    "",
    "Yours faithfully,",
    name,
  ].filter((line, index, all) => !(line === "" && all[index - 1] === ""));

  const warnings = [];
  if (!law.statutory) {
    warnings.push(
      `The ${law.deadlineValue}-day deadline stated in the letter is a reasonable expectation, not a figure fixed in the DPDP Act, 2023 itself — the Act leaves the period to rules made under it. Keep the demand but be ready for a different timeline.`,
    );
  }
  if (!clean(email) && !clean(postalAddress)) {
    warnings.push(
      "Give at least one reply address. A controller that cannot identify you may ask for further information, which pauses the clock until you provide it.",
    );
  }
  if (rows.some((row) => !row.evidence)) {
    warnings.push(
      "Attach evidence for every disputed field where you can. A controller is entitled to satisfy itself that the new value is accurate before changing its records.",
    );
  }
  if (rows.some((row) => !row.incorrectValue)) {
    warnings.push(
      "Where you know the value currently on file, state it. Naming both the wrong and the right value removes any ambiguity about which record to change.",
    );
  }
  if (deliveryMethod === "email") {
    warnings.push(
      "Keep the sent email and any delivery receipt. If the deadline passes you will need to evidence the date the request was received.",
    );
  }
  if (law.id === "ccpa") {
    warnings.push(
      "A California business may require you to verify your identity before correcting a record, and may decline where documentary evidence shows its version is more likely accurate (CCPA Regs s.7023).",
    );
  }

  return {
    subject,
    bodyLines,
    letter: bodyLines.join("\n"),
    deadlineDate,
    deadlineLabel,
    extensionDate,
    rows,
    warnings,
    regimeLabel: law.label,
    right: law.right,
    stats: {
      corrections: rows.length,
      withEvidence: rows.filter((row) => row.evidence).length,
      warningCount: warnings.length,
    },
  };
}
