/**
 * Data Access Request (subject access request) letter generator.
 *
 * A subject access request asks an organisation to confirm whether it is
 * processing your personal data and, if so, to give you a copy of it together
 * with the information the law says must accompany it.
 *
 * Rules encoded here, by regime:
 *
 *  EU GDPR — Regulation (EU) 2016/679
 *   - Article 15(1): the data subject has the right to confirmation and to the
 *     eight categories of supplementary information listed in 15(1)(a)-(h).
 *   - Article 15(3): the controller shall provide a copy of the personal data
 *     undergoing processing; where the request is made electronically the
 *     information shall be provided in a commonly used electronic form.
 *   - Article 12(3): the controller responds without undue delay and in any
 *     event within ONE MONTH of receipt; that period may be extended by TWO
 *     FURTHER MONTHS where the request is complex or numerous, provided the
 *     data subject is told of the extension and the reasons within one month.
 *   - Article 12(5): the response is free of charge; a reasonable fee may be
 *     charged, or the request refused, only where it is manifestly unfounded
 *     or excessive, and the controller bears the burden of showing that.
 *   - Article 12(6): the controller may request additional information to
 *     confirm identity only where it has reasonable doubts.
 *   - Article 77: right to lodge a complaint with a supervisory authority.
 *
 *  UK GDPR / Data Protection Act 2018 — the same Article 15 right and the same
 *   one-month plus two-month timetable; the regulator is the ICO.
 *
 *  India DPDP Act 2023 — Section 11 gives the Data Principal the right to
 *   obtain a summary of personal data being processed and the processing
 *   activities, the identities of other Data Fiduciaries and Data Processors
 *   with whom the data has been shared, and any other prescribed information.
 *   Section 13 requires the Data Fiduciary to publish a grievance redressal
 *   mechanism, and Section 13(3) requires the Data Principal to exhaust it
 *   before approaching the Data Protection Board. The Act itself does not fix
 *   a response period for a Section 11 request, so the deadline this tool
 *   prints for DPDP is a REQUESTED date, not a statutory one; that is flagged.
 *
 *  California CCPA as amended by the CPRA — Cal. Civ. Code § 1798.100 and
 *   § 1798.110/115 (right to know categories and specific pieces of personal
 *   information). § 1798.130(a)(2) requires the business to confirm receipt
 *   within 10 BUSINESS DAYS and to respond within 45 CALENDAR DAYS of receipt,
 *   extendable once by a further 45 days with notice. § 1798.130(a)(3)(B)(iii)
 *   requires disclosure beyond the 12-month look-back for personal information
 *   collected on or after 1 January 2022 unless doing so proves impossible or
 *   would involve disproportionate effort.
 *
 * This module is informational only. It does not give legal advice, and the
 * deadline it prints assumes the organisation actually received the request on
 * the date you send it.
 */

/** Article 12(3) GDPR / UK GDPR: one month to respond, from receipt. */
export const GDPR_RESPONSE_MONTHS = 1;
/** Article 12(3) GDPR / UK GDPR: extension of two further months. */
export const GDPR_EXTENSION_MONTHS = 2;
/** Cal. Civ. Code § 1798.130(a)(2): 45 calendar days to respond. */
export const CCPA_RESPONSE_DAYS = 45;
/** Cal. Civ. Code § 1798.130(a)(2): one further 45-day extension. */
export const CCPA_EXTENSION_DAYS = 45;
/** Cal. Civ. Code § 1798.130(a)(2): confirm receipt within 10 business days. */
export const CCPA_ACK_BUSINESS_DAYS = 10;
/** Days this tool will let you ask a DPDP Data Fiduciary to reply within. */
export const DPDP_DEFAULT_REQUESTED_DAYS = 30;

const MS_PER_DAY = 86400000;
/** Longest single free-text field accepted, to keep the letter readable. */
const MAX_FIELD = 200;
/** Longest free-text block (identifiers, extra detail). */
const MAX_BLOCK = 800;

const MONTH_NAMES = [
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

/**
 * The legal regimes this generator can draft under. `deadline` describes how
 * the response period is counted, which differs between the GDPR family
 * (calendar months) and California (calendar days).
 */
export const REGIMES = [
  {
    id: "eu-gdpr",
    label: "EU GDPR (European Union / EEA)",
    right: "Article 15 of the General Data Protection Regulation (EU) 2016/679",
    shortRight: "Article 15 GDPR",
    subject: "Data subject access request under Article 15 GDPR",
    you: "data subject",
    them: "controller",
    deadline: { kind: "months", value: GDPR_RESPONSE_MONTHS, extension: GDPR_EXTENSION_MONTHS },
    statutory: true,
    ackBusinessDays: 0,
    regulator: "the supervisory authority in your EU/EEA member state",
    complaintBasis: "Article 77 GDPR",
    freeOfCharge:
      "Article 12(5) GDPR requires the first copy to be provided free of charge.",
  },
  {
    id: "uk-gdpr",
    label: "UK GDPR / Data Protection Act 2018",
    right: "Article 15 of the UK GDPR, read with the Data Protection Act 2018",
    shortRight: "Article 15 UK GDPR",
    subject: "Subject access request under Article 15 UK GDPR",
    you: "data subject",
    them: "controller",
    deadline: { kind: "months", value: GDPR_RESPONSE_MONTHS, extension: GDPR_EXTENSION_MONTHS },
    statutory: true,
    ackBusinessDays: 0,
    regulator: "the Information Commissioner's Office (ICO)",
    complaintBasis: "Article 77 UK GDPR",
    freeOfCharge:
      "Article 12(5) UK GDPR requires the response to be provided free of charge.",
  },
  {
    id: "in-dpdp",
    label: "India — Digital Personal Data Protection Act, 2023",
    right: "Section 11 of the Digital Personal Data Protection Act, 2023",
    shortRight: "Section 11 DPDP Act",
    subject: "Request for access to personal data under Section 11 of the DPDP Act, 2023",
    you: "Data Principal",
    them: "Data Fiduciary",
    deadline: { kind: "days", value: DPDP_DEFAULT_REQUESTED_DAYS, extension: 0 },
    statutory: false,
    ackBusinessDays: 0,
    regulator: "the Data Protection Board of India",
    complaintBasis: "Section 13 of the DPDP Act, 2023",
    freeOfCharge:
      "The DPDP Act does not permit a charge for exercising the Section 11 right of access.",
  },
  {
    id: "us-ccpa",
    label: "California CCPA / CPRA",
    right: "Cal. Civ. Code §§ 1798.100, 1798.110 and 1798.115 (CCPA as amended by the CPRA)",
    shortRight: "the CCPA right to know",
    subject: "Consumer request to know under the California Consumer Privacy Act",
    you: "consumer",
    them: "business",
    deadline: { kind: "days", value: CCPA_RESPONSE_DAYS, extension: CCPA_EXTENSION_DAYS },
    statutory: true,
    ackBusinessDays: CCPA_ACK_BUSINESS_DAYS,
    regulator: "the California Privacy Protection Agency or the California Attorney General",
    complaintBasis: "Cal. Civ. Code § 1798.199.45",
    freeOfCharge:
      "Cal. Civ. Code § 1798.130(a)(2) requires the disclosure to be made free of charge.",
  },
];

/**
 * What you can ask for. Ids map to Article 15(1)(a)-(h), 15(2) and 15(3) of
 * the GDPR; the CCPA equivalents are noted in the `ccpa` field where one
 * exists so the letter cites the right statute for the chosen regime.
 */
export const SCOPE_ITEMS = [
  {
    id: "copy",
    label: "A copy of all personal data you hold about me",
    gdpr: "Article 15(3)",
    ccpa: "Cal. Civ. Code § 1798.110(a)(5)",
    text: "a copy of all personal data concerning me that you are processing",
  },
  {
    id: "purposes",
    label: "The purposes of the processing",
    gdpr: "Article 15(1)(a)",
    ccpa: "Cal. Civ. Code § 1798.110(a)(3)",
    text: "the purposes for which that personal data is processed",
  },
  {
    id: "categories",
    label: "The categories of personal data concerned",
    gdpr: "Article 15(1)(b)",
    ccpa: "Cal. Civ. Code § 1798.110(a)(1)",
    text: "the categories of personal data concerned",
  },
  {
    id: "recipients",
    label: "Recipients the data has been or will be disclosed to",
    gdpr: "Article 15(1)(c)",
    ccpa: "Cal. Civ. Code § 1798.115(a)",
    text: "the recipients or categories of recipient to whom the data has been or will be disclosed, including any recipients in third countries or international organisations",
  },
  {
    id: "retention",
    label: "How long the data will be kept",
    gdpr: "Article 15(1)(d)",
    ccpa: "",
    text: "the period for which the data will be stored, or if that is not possible, the criteria used to determine that period",
  },
  {
    id: "source",
    label: "Where the data came from, if not from me",
    gdpr: "Article 15(1)(g)",
    ccpa: "Cal. Civ. Code § 1798.110(a)(2)",
    text: "any available information as to the source of the data where it was not collected from me",
  },
  {
    id: "automated",
    label: "Automated decision-making and profiling applied to me",
    gdpr: "Article 15(1)(h)",
    ccpa: "",
    text: "the existence of any automated decision-making, including profiling, together with meaningful information about the logic involved and the significance and envisaged consequences of that processing for me",
  },
  {
    id: "transfers",
    label: "Safeguards used for transfers outside the country",
    gdpr: "Article 15(2)",
    ccpa: "",
    text: "where the data is transferred to a third country or an international organisation, the appropriate safeguards relied on for that transfer",
  },
];

/** How you want the copy delivered. */
export const DELIVERY_FORMATS = [
  {
    id: "electronic",
    label: "Commonly used electronic format by email",
    text: "in a commonly used electronic format, sent to the email address below",
  },
  {
    id: "secure-portal",
    label: "Secure download link or portal",
    text: "as a secure download from a link sent to the email address below, valid for at least 14 days",
  },
  {
    id: "post",
    label: "Printed copy by post",
    text: "as a printed copy sent by post to the address below",
  },
];

function clean(value) {
  return String(value ?? "").trim().replace(/[ \t]+/g, " ");
}

function cleanBlock(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line, index, all) => line !== "" || (index > 0 && all[index - 1] !== ""))
    .join("\n")
    .trim();
}

/**
 * Parse yyyy-mm-dd into a UTC-midnight timestamp, or null when it is not a
 * real calendar date (2025-02-30 is rejected rather than rolled over).
 * @param {string} iso
 * @returns {number|null}
 */
export function parseIsoDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2200) return null;
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return stamp;
}

/**
 * Add whole calendar months the way Article 12(3) is counted in practice: the
 * deadline is the same date in the later month, and where that date does not
 * exist the deadline is the last day of that month (31 January + 1 month is
 * 28 or 29 February, never 2 or 3 March).
 * @param {number} stamp UTC-midnight timestamp.
 * @param {number} months Whole months to add.
 * @returns {number} UTC-midnight timestamp.
 */
export function addCalendarMonths(stamp, months) {
  const date = new Date(stamp);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const lastDayOfTarget = new Date(Date.UTC(year, month + months + 1, 0)).getUTCDate();
  return Date.UTC(year, month + months, Math.min(day, lastDayOfTarget));
}

/**
 * Add whole business days (Monday to Friday). Public holidays are not modelled
 * because they differ by jurisdiction, so treat the result as the earliest
 * possible acknowledgement date.
 * @param {number} stamp UTC-midnight timestamp.
 * @param {number} days Business days to add.
 * @returns {number} UTC-midnight timestamp.
 */
export function addBusinessDays(stamp, days) {
  let cursor = stamp;
  let left = days;
  while (left > 0) {
    cursor += MS_PER_DAY;
    const weekday = new Date(cursor).getUTCDay();
    if (weekday !== 0 && weekday !== 6) left -= 1;
  }
  return cursor;
}

function formatStamp(stamp) {
  const date = new Date(stamp);
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function isoOf(stamp) {
  return new Date(stamp).toISOString().slice(0, 10);
}

function joinList(parts) {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/**
 * Work out the deadline dates for a regime from the date the request is sent.
 * @param {object} regime One of REGIMES.
 * @param {number} sentStamp UTC-midnight timestamp of the send date.
 * @returns {{due:number, extended:number, ack:number|null}}
 */
export function computeDeadlines(regime, sentStamp) {
  const { deadline } = regime;
  const due =
    deadline.kind === "months"
      ? addCalendarMonths(sentStamp, deadline.value)
      : sentStamp + deadline.value * MS_PER_DAY;
  const extended =
    deadline.extension > 0
      ? deadline.kind === "months"
        ? addCalendarMonths(sentStamp, deadline.value + deadline.extension)
        : sentStamp + (deadline.value + deadline.extension) * MS_PER_DAY
      : due;
  const ack =
    regime.ackBusinessDays > 0 ? addBusinessDays(sentStamp, regime.ackBusinessDays) : null;
  return { due, extended, ack };
}

/**
 * Build the subject access request letter and its deadline dates.
 *
 * @param {object} input
 * @param {string} input.regimeId       One of REGIMES ids.
 * @param {string} input.sentDate       yyyy-mm-dd the request is sent.
 * @param {string} input.fullName       Name of the person making the request.
 * @param {string} input.email          Reply-to email address.
 * @param {string} input.postalAddress  Postal address (optional unless delivery is by post).
 * @param {string} input.identifiers    Account numbers, usernames, order ids that identify you.
 * @param {string} input.companyName    Organisation the request is addressed to.
 * @param {string} input.companyContact Privacy team or DPO email / address.
 * @param {string[]} input.scopeIds     Ids from SCOPE_ITEMS.
 * @param {string} input.deliveryId     One of DELIVERY_FORMATS ids.
 * @param {string} input.periodFrom     yyyy-mm-dd, optional start of the period requested.
 * @param {string} input.extraDetail    Free text describing specific records wanted.
 * @returns {object|{error:string}}
 */
export function buildAccessRequest({
  regimeId,
  sentDate,
  fullName,
  email,
  postalAddress = "",
  identifiers = "",
  companyName,
  companyContact = "",
  scopeIds = [],
  deliveryId,
  periodFrom = "",
  extraDetail = "",
}) {
  const regime = REGIMES.find((item) => item.id === regimeId);
  if (!regime) return { error: "Choose which privacy law you are relying on." };

  const delivery = DELIVERY_FORMATS.find((item) => item.id === deliveryId);
  if (!delivery) return { error: "Choose how you want the copy of your data delivered." };

  const sentStamp = parseIsoDate(sentDate);
  if (sentStamp === null) return { error: "Enter a valid date for the request, as yyyy-mm-dd." };

  const name = clean(fullName);
  const mail = clean(email);
  const company = clean(companyName);
  const contact = clean(companyContact);
  const post = cleanBlock(postalAddress);
  const ids = cleanBlock(identifiers);
  const extra = cleanBlock(extraDetail);

  if (!name) return { error: "Enter your full name as the organisation holds it." };
  if (!company) return { error: "Enter the name of the organisation you are writing to." };
  if (!mail) return { error: "Enter an email address the organisation can reply to." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) {
    return { error: "That email address does not look valid — check for a typo." };
  }
  if ([name, company, contact].some((value) => value.length > MAX_FIELD)) {
    return { error: `Keep the name, organisation and contact fields under ${MAX_FIELD} characters.` };
  }
  if ([post, ids, extra].some((value) => value.length > MAX_BLOCK)) {
    return { error: `Keep the address, identifiers and detail blocks under ${MAX_BLOCK} characters.` };
  }
  if (delivery.id === "post" && !post) {
    return { error: "You asked for a printed copy by post, so enter the postal address to send it to." };
  }

  const chosen = SCOPE_ITEMS.filter((item) => scopeIds.includes(item.id));
  if (chosen.length === 0) {
    return { error: "Select at least one thing to request — start with a copy of your personal data." };
  }

  let periodStamp = null;
  if (periodFrom) {
    periodStamp = parseIsoDate(periodFrom);
    if (periodStamp === null) return { error: "The 'data from' date is not a valid calendar date." };
    if (periodStamp > sentStamp) {
      return { error: "The 'data from' date is after the date of the request." };
    }
  }

  const { due, extended, ack } = computeDeadlines(regime, sentStamp);

  const useCcpaCites = regime.id === "us-ccpa";
  const numbered = chosen.map((item, index) => {
    const cite = useCcpaCites ? item.ccpa : item.gdpr;
    const suffix = cite ? ` (${cite})` : "";
    return `${index + 1}. ${item.text.charAt(0).toUpperCase()}${item.text.slice(1)}${suffix}.`;
  });

  const deadlineSentence = regime.statutory
    ? regime.deadline.kind === "months"
      ? `Article 12(3) requires a response without undue delay and in any event within one month of receipt, so I expect your substantive reply by ${formatStamp(due)}. If you intend to rely on the extension of up to two further months, you must tell me within that first month and give your reasons.`
      : `${regime.right} requires a response within ${regime.deadline.value} calendar days of receipt, so I expect your substantive reply by ${formatStamp(due)}. If you extend that period by the further ${regime.deadline.extension} days the statute allows, please notify me in writing with the reason before the first deadline passes.`
    : `The Act does not fix a response period for this request, so I ask you to reply by ${formatStamp(due)}, which is ${regime.deadline.value} days from the date of this request, and to tell me promptly if you need longer and why.`;

  const ackSentence = ack
    ? `Please also confirm receipt of this request within ${regime.ackBusinessDays} business days, by ${formatStamp(ack)}, as Cal. Civ. Code § 1798.130(a)(2) requires.`
    : "";

  const periodSentence = periodStamp
    ? `Please cover the period from ${formatStamp(periodStamp)} to the date you respond. If any category of data predates that period, include it and say so.`
    : "Please cover the whole period during which you have held data about me, not only a recent window.";

  const identitySentence = ids
    ? `To help you locate my records, the identifiers you hold for me are set out below. If you have reasonable doubts about my identity, tell me exactly what further verification you need; ${regime.id === "us-ccpa" ? "please do not require me to create an account in order to make this request" : "please do not ask for more identity documents than are necessary, as that would go beyond what Article 12(6) permits"}.`
    : `If you have reasonable doubts about my identity, tell me precisely what verification you need and I will supply it. Please do not request more identity documents than are necessary to identify me.`;

  const salutation = contact ? `${company}\n${contact}` : company;

  const bodyLines = [
    `Date: ${formatStamp(sentStamp)}`,
    "",
    "To,",
    salutation,
    "",
    `Subject: ${regime.subject}`,
    "",
    "Dear Sir or Madam,",
    "",
    `I am writing as a ${regime.you} to exercise my right of access under ${regime.right}. This is a formal request; please treat it as such and route it to your privacy team or data protection officer.`,
    "",
    `Please confirm whether you are processing personal data concerning me and, if you are, provide the following:`,
    "",
    ...numbered,
    "",
    periodSentence,
    "",
    `Please provide the copy of my personal data ${delivery.text}. ${regime.freeOfCharge}`,
    "",
    deadlineSentence,
  ];

  if (ackSentence) bodyLines.push("", ackSentence);

  bodyLines.push("", identitySentence);

  if (extra) {
    bodyLines.push(
      "",
      "There are specific records I am particularly interested in:",
      extra,
      "",
      "Listing these does not narrow the request; I am still asking for everything set out above.",
    );
  }

  if (ids) {
    bodyLines.push("", "Identifiers you hold for me:", ids);
  }

  bodyLines.push(
    "",
    `If you refuse this request in whole or in part, please say so in writing, identify the exact exemption you rely on and explain how it applies, and confirm that I may complain to ${regime.regulator} under ${regime.complaintBasis}.`,
    "",
    "Yours faithfully,",
    "",
    name,
    `Email: ${mail}`,
  );

  if (post) bodyLines.push(post);

  const letter = bodyLines.join("\n");

  const notes = [];
  if (!regime.statutory) {
    notes.push(
      "The DPDP Act does not set a response deadline for a Section 11 request, so the date above is what you are asking for, not a statutory limit. If the Data Fiduciary ignores it, use its published grievance redressal mechanism first — Section 13(3) requires that before you can approach the Data Protection Board.",
    );
  }
  if (regime.ackBusinessDays > 0) {
    notes.push(
      "Business days here are Monday to Friday. Californian public holidays are not counted, so treat the acknowledgement date as the earliest it could fall.",
    );
  }
  if (!chosen.some((item) => item.id === "copy")) {
    notes.push(
      "You have not asked for a copy of the data itself. Most people want that — it is the part of the right that produces the actual records.",
    );
  }
  if (delivery.id === "post" && regime.id !== "in-dpdp") {
    notes.push(
      "Asking for paper slows responses and some controllers charge for large print runs. An electronic copy is the default under Article 15(3) when you write in electronically.",
    );
  }

  return {
    regime: regime.label,
    rightCited: regime.shortRight,
    sentIso: isoOf(sentStamp),
    sentLong: formatStamp(sentStamp),
    dueIso: isoOf(due),
    dueLong: formatStamp(due),
    dueDays: Math.round((due - sentStamp) / MS_PER_DAY),
    extendedIso: isoOf(extended),
    extendedLong: formatStamp(extended),
    hasExtension: extended !== due,
    ackIso: ack === null ? null : isoOf(ack),
    ackLong: ack === null ? null : formatStamp(ack),
    statutory: regime.statutory,
    regulator: regime.regulator,
    itemCount: chosen.length,
    itemsRequested: joinList(chosen.map((item) => item.label.toLowerCase())),
    notes,
    letter,
  };
}
