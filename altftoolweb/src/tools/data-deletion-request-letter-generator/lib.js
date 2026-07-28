/**
 * Data Deletion (erasure) Request Letter Generator.
 *
 * An erasure request tells an organisation to delete the personal data it
 * holds about you, names the legal ground that makes the deletion mandatory,
 * and requires the organisation to pass the instruction down to everyone it
 * shared the data with.
 *
 * Rules encoded here:
 *
 *  EU / UK GDPR
 *   - Article 17(1)(a)-(f) lists the six grounds on which erasure is a right
 *     rather than a favour. They are reproduced in ERASURE_GROUNDS below.
 *   - Article 17(2): where the controller has made the data public it must
 *     take reasonable steps to inform other controllers processing it that you
 *     have requested erasure of links to and copies of that data.
 *   - Article 19: the controller must communicate the erasure to each
 *     recipient to whom the data was disclosed, and tell you who they are if
 *     you ask.
 *   - Article 17(3) sets out when erasure does NOT apply: freedom of
 *     expression and information, compliance with a legal obligation or a
 *     public-interest task, public health, archiving/research/statistics, and
 *     the establishment, exercise or defence of legal claims. These are the
 *     carve-outs the retention calculator below deals with.
 *   - Article 12(3): respond without undue delay and within ONE MONTH of
 *     receipt, extendable by TWO further months for complex or numerous
 *     requests, with notice inside the first month.
 *   - Article 18(1)(d): while a request is being verified you may ask for
 *     processing to be restricted.
 *
 *  India DPDP Act 2023
 *   - Section 12(3): the Data Principal has the right to erasure of personal
 *     data, and the Data Fiduciary shall erase it unless retention is
 *     necessary for the specified purpose or for compliance with any law.
 *   - Section 8(7): on withdrawal of consent, or once it is reasonable to
 *     assume the specified purpose is no longer being served, the Data
 *     Fiduciary shall erase the personal data and cause its Processors to do
 *     the same, unless retention is required by law.
 *   - Section 13: grievance redressal must be exhausted before the Data
 *     Protection Board is approached (Section 13(3)).
 *
 *  California CCPA / CPRA
 *   - Cal. Civ. Code § 1798.105(a) and (c): right to delete, and the business
 *     must direct its service providers, contractors and (for data sold or
 *     shared) third parties to delete too.
 *   - § 1798.105(d) lists the exemptions, including completing a transaction,
 *     security, debugging, legal obligations and internal uses reasonably
 *     aligned with the consumer's expectations.
 *   - § 1798.130(a)(2): confirm receipt within 10 BUSINESS DAYS, respond
 *     within 45 CALENDAR DAYS, extendable once by a further 45 days.
 *
 *  Retention carve-outs. Deletion rarely means every byte disappears the same
 *  day: statutory bookkeeping duties keep transaction records alive for years.
 *  The reference periods offered below are the ones this tool is confident
 *  about and each is editable:
 *   - Companies Act 2013 (India), Section 128(5): books of account and
 *     vouchers for not less than EIGHT financial years immediately preceding
 *     the current one.
 *   - Companies Act 2006 (UK), Section 388(4): accounting records for THREE
 *     years from the date they are made for a private company, and SIX years
 *     for a public company.
 *  Anything else is entered by you, because the period depends on the
 *  jurisdiction and the record type.
 *
 * Informational only; nothing here is legal advice.
 */

/** Article 12(3): one calendar month to respond. */
export const GDPR_RESPONSE_MONTHS = 1;
/** Article 12(3): extension of two further months. */
export const GDPR_EXTENSION_MONTHS = 2;
/** Cal. Civ. Code § 1798.130(a)(2): 45 calendar days to respond. */
export const CCPA_RESPONSE_DAYS = 45;
/** Cal. Civ. Code § 1798.130(a)(2): one further 45-day extension. */
export const CCPA_EXTENSION_DAYS = 45;
/** Cal. Civ. Code § 1798.130(a)(2): confirm receipt within 10 business days. */
export const CCPA_ACK_BUSINESS_DAYS = 10;
/** Days this tool asks a DPDP Data Fiduciary to reply within (not statutory). */
export const DPDP_REQUESTED_DAYS = 30;
/** Days most controllers need to purge data from rotating backups. */
export const DEFAULT_BACKUP_PURGE_DAYS = 90;

const MS_PER_DAY = 86400000;
const MAX_FIELD = 200;
const MAX_BLOCK = 800;
/** Longest retention carve-out this tool will accept, in years. */
const MAX_RETENTION_YEARS = 30;

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

export const REGIMES = [
  {
    id: "eu-gdpr",
    label: "EU GDPR (European Union / EEA)",
    right: "Article 17 of the General Data Protection Regulation (EU) 2016/679",
    shortRight: "Article 17 GDPR",
    subject: "Request for erasure of personal data under Article 17 GDPR",
    you: "data subject",
    them: "controller",
    deadline: { kind: "months", value: GDPR_RESPONSE_MONTHS, extension: GDPR_EXTENSION_MONTHS },
    statutory: true,
    ackBusinessDays: 0,
    downstream:
      "Article 19 GDPR requires you to communicate this erasure to each recipient to whom my data has been disclosed, and to tell me who those recipients are.",
    publicData:
      "Where you have made any of my data public, Article 17(2) requires you to take reasonable steps, including technical measures, to inform other controllers processing it that I have requested erasure of any links to, or copies of, that data.",
    restriction:
      "Pending verification, I ask you to restrict processing of my data under Article 18(1)(d).",
    exemptionClause:
      "If you rely on any of the Article 17(3) exceptions, state which one and explain how it applies to each category of data you keep.",
    regulator: "the supervisory authority in your EU/EEA member state",
    complaintBasis: "Article 77 GDPR",
  },
  {
    id: "uk-gdpr",
    label: "UK GDPR / Data Protection Act 2018",
    right: "Article 17 of the UK GDPR, read with the Data Protection Act 2018",
    shortRight: "Article 17 UK GDPR",
    subject: "Request for erasure of personal data under Article 17 UK GDPR",
    you: "data subject",
    them: "controller",
    deadline: { kind: "months", value: GDPR_RESPONSE_MONTHS, extension: GDPR_EXTENSION_MONTHS },
    statutory: true,
    ackBusinessDays: 0,
    downstream:
      "Article 19 UK GDPR requires you to communicate this erasure to each recipient to whom my data has been disclosed, and to tell me who those recipients are.",
    publicData:
      "Where you have made any of my data public, Article 17(2) requires you to take reasonable steps to inform other controllers processing it that I have requested erasure of any links to, or copies of, that data.",
    restriction:
      "Pending verification, I ask you to restrict processing of my data under Article 18(1)(d).",
    exemptionClause:
      "If you rely on any of the Article 17(3) exceptions, state which one and explain how it applies to each category of data you keep.",
    regulator: "the Information Commissioner's Office (ICO)",
    complaintBasis: "Article 77 UK GDPR",
  },
  {
    id: "in-dpdp",
    label: "India — Digital Personal Data Protection Act, 2023",
    right: "Section 12(3) of the Digital Personal Data Protection Act, 2023",
    shortRight: "Section 12(3) DPDP Act",
    subject: "Request for erasure of personal data under Section 12(3) of the DPDP Act, 2023",
    you: "Data Principal",
    them: "Data Fiduciary",
    deadline: { kind: "days", value: DPDP_REQUESTED_DAYS, extension: 0 },
    statutory: false,
    ackBusinessDays: 0,
    downstream:
      "Section 8(7) requires you to cause any Data Processor engaged by you to erase the same personal data.",
    publicData:
      "Where any of my data has been published or shared onward, please confirm what you have done to have it removed at the receiving end.",
    restriction: "Pending verification, please stop any further processing of my data.",
    exemptionClause:
      "If you retain any data because retention is necessary for the specified purpose or for compliance with a law, identify the law and the record, and confirm the date the retention period ends.",
    regulator: "the Data Protection Board of India",
    complaintBasis: "Section 13 of the DPDP Act, 2023",
  },
  {
    id: "us-ccpa",
    label: "California CCPA / CPRA",
    right: "Cal. Civ. Code § 1798.105 (CCPA as amended by the CPRA)",
    shortRight: "Cal. Civ. Code § 1798.105",
    subject: "Consumer request to delete under the California Consumer Privacy Act",
    you: "consumer",
    them: "business",
    deadline: { kind: "days", value: CCPA_RESPONSE_DAYS, extension: CCPA_EXTENSION_DAYS },
    statutory: true,
    ackBusinessDays: CCPA_ACK_BUSINESS_DAYS,
    downstream:
      "Cal. Civ. Code § 1798.105(c) requires you to direct your service providers and contractors to delete my personal information, and to notify any third party to whom you sold or shared it.",
    publicData:
      "Where any of my personal information has been made publicly available, please confirm what steps you have taken to have it removed.",
    restriction: "Pending verification, please suspend any sale or sharing of my personal information.",
    exemptionClause:
      "If you rely on an exemption in Cal. Civ. Code § 1798.105(d), identify the specific subsection and the categories of information it covers.",
    regulator: "the California Privacy Protection Agency or the California Attorney General",
    complaintBasis: "Cal. Civ. Code § 1798.199.45",
  },
];

/**
 * Article 17(1)(a)-(f) grounds. `ccpa` gives the nearest Californian framing so
 * the letter reads correctly when the CCPA regime is selected.
 */
export const ERASURE_GROUNDS = [
  {
    id: "no-longer-necessary",
    label: "The data is no longer needed for the purpose it was collected for",
    gdpr: "Article 17(1)(a)",
    text: "the personal data is no longer necessary in relation to the purposes for which it was collected or otherwise processed",
    ccpaText:
      "the personal information is no longer needed for the purpose for which it was collected",
  },
  {
    id: "consent-withdrawn",
    label: "I am withdrawing the consent the processing relied on",
    gdpr: "Article 17(1)(b)",
    text: "I withdraw the consent on which the processing was based and there is no other legal ground for it",
    ccpaText: "I am withdrawing any consent on which the processing was based",
  },
  {
    id: "objection",
    label: "I object to the processing and you have no overriding grounds",
    gdpr: "Article 17(1)(c)",
    text: "I object to the processing under Article 21(1) and there are no overriding legitimate grounds for it",
    ccpaText: "I object to the continued processing of my personal information",
  },
  {
    id: "marketing",
    label: "I object to direct marketing (an absolute right)",
    gdpr: "Article 17(1)(c) with Article 21(2)",
    text: "I object to the processing of my data for direct marketing purposes under Article 21(2), which is an absolute right and admits no balancing exercise",
    ccpaText:
      "I am opting out of the sale and sharing of my personal information under Cal. Civ. Code § 1798.120",
  },
  {
    id: "unlawful",
    label: "The processing was unlawful",
    gdpr: "Article 17(1)(d)",
    text: "the personal data has been unlawfully processed",
    ccpaText: "the personal information was collected or used unlawfully",
  },
  {
    id: "legal-obligation",
    label: "A law requires you to erase it",
    gdpr: "Article 17(1)(e)",
    text: "the personal data must be erased for compliance with a legal obligation to which you are subject",
    ccpaText: "a legal obligation requires deletion of the personal information",
  },
  {
    id: "child",
    label: "The data was collected from me as a child using an online service",
    gdpr: "Article 17(1)(f)",
    text: "the personal data was collected in relation to the offer of information society services to a child within the meaning of Article 8(1)",
    ccpaText:
      "the personal information was collected from me as a minor through an online service",
  },
];

/**
 * Retention carve-outs the organisation may lawfully rely on. `years` is a
 * starting figure, editable in the UI, and `source` says where it comes from.
 */
export const RETENTION_PRESETS = [
  {
    id: "none",
    label: "No transaction history — delete everything",
    years: 0,
    source: "No bookkeeping duty applies, so there is nothing to carve out.",
  },
  {
    id: "in-companies-act",
    label: "India — books of account (Companies Act 2013)",
    years: 8,
    source:
      "Section 128(5) of the Companies Act 2013 requires books of account and vouchers for not less than eight financial years immediately preceding the current one.",
  },
  {
    id: "uk-private",
    label: "UK — private company accounting records",
    years: 3,
    source:
      "Section 388(4)(a) of the Companies Act 2006 requires a private company to keep accounting records for three years from the date they are made.",
  },
  {
    id: "uk-public",
    label: "UK — public company accounting records",
    years: 6,
    source:
      "Section 388(4)(b) of the Companies Act 2006 requires a public company to keep accounting records for six years from the date they are made.",
  },
  {
    id: "custom",
    label: "Other — I will enter the period",
    years: 6,
    source:
      "Retention periods vary by jurisdiction and record type. Enter the period the organisation has told you it relies on, or the one your local tax rules impose.",
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
 * Parse yyyy-mm-dd into a UTC-midnight timestamp, or null when not a real date.
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
 * Add whole calendar months, clamping to the last day of the target month so
 * 31 January plus one month is 28 or 29 February, never 2 or 3 March.
 * @param {number} stamp UTC-midnight timestamp.
 * @param {number} months
 * @returns {number}
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
 * Add whole business days (Monday to Friday); public holidays are not modelled.
 * @param {number} stamp
 * @param {number} days
 * @returns {number}
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

/**
 * Build the erasure request letter, the response deadline and the date on
 * which any statutory retention carve-out expires.
 *
 * @param {object} input
 * @param {string} input.regimeId
 * @param {string} input.sentDate        yyyy-mm-dd the request is sent.
 * @param {string} input.fullName
 * @param {string} input.email
 * @param {string} input.companyName
 * @param {string} input.companyContact
 * @param {string} input.identifiers     Accounts / ids that identify you.
 * @param {string[]} input.groundIds     Ids from ERASURE_GROUNDS.
 * @param {string} input.retentionId     One of RETENTION_PRESETS ids.
 * @param {number} input.retentionYears  Years the carve-out lasts.
 * @param {string} input.lastActivityDate yyyy-mm-dd of the last transaction.
 * @param {number} input.backupPurgeDays Days you allow for backup rotation.
 * @param {boolean} input.wasPublic      Was any of the data published?
 * @param {boolean} input.askRestriction Ask for processing to be paused meanwhile?
 * @param {boolean} input.keepSuppression Allow a minimal suppression record?
 * @param {string} input.extraDetail
 * @returns {object|{error:string}}
 */
export function buildDeletionRequest({
  regimeId,
  sentDate,
  fullName,
  email,
  companyName,
  companyContact = "",
  identifiers = "",
  groundIds = [],
  retentionId = "none",
  retentionYears = 0,
  lastActivityDate = "",
  backupPurgeDays = DEFAULT_BACKUP_PURGE_DAYS,
  wasPublic = false,
  askRestriction = true,
  keepSuppression = true,
  extraDetail = "",
}) {
  const regime = REGIMES.find((item) => item.id === regimeId);
  if (!regime) return { error: "Choose which privacy law you are relying on." };

  const preset = RETENTION_PRESETS.find((item) => item.id === retentionId);
  if (!preset) return { error: "Choose which retention carve-out, if any, applies." };

  const sentStamp = parseIsoDate(sentDate);
  if (sentStamp === null) return { error: "Enter a valid date for the request, as yyyy-mm-dd." };

  const name = clean(fullName);
  const mail = clean(email);
  const company = clean(companyName);
  const contact = clean(companyContact);
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
  if ([ids, extra].some((value) => value.length > MAX_BLOCK)) {
    return { error: `Keep the identifier and detail blocks under ${MAX_BLOCK} characters.` };
  }

  const grounds = ERASURE_GROUNDS.filter((item) => groundIds.includes(item.id));
  if (grounds.length === 0) {
    return {
      error: "Select at least one ground for erasure — a request without a ground is easy to refuse.",
    };
  }

  const purgeDays = Number(backupPurgeDays);
  if (!Number.isFinite(purgeDays) || !Number.isInteger(purgeDays) || purgeDays < 0 || purgeDays > 365) {
    return { error: "The backup purge window must be a whole number of days between 0 and 365." };
  }

  const years = preset.id === "none" ? 0 : Number(retentionYears);
  if (!Number.isFinite(years) || years < 0 || years > MAX_RETENTION_YEARS) {
    return { error: `The retention period must be between 0 and ${MAX_RETENTION_YEARS} years.` };
  }

  let retentionEnd = null;
  if (years > 0) {
    const lastStamp = parseIsoDate(lastActivityDate);
    if (lastStamp === null) {
      return {
        error:
          "A retention carve-out needs the date of your last transaction so the end of the period can be worked out.",
      };
    }
    if (lastStamp > sentStamp) {
      return { error: "The last transaction date is after the date of this request." };
    }
    const wholeMonths = Math.round(years * 12);
    retentionEnd = addCalendarMonths(lastStamp, wholeMonths);
  }

  const due =
    regime.deadline.kind === "months"
      ? addCalendarMonths(sentStamp, regime.deadline.value)
      : sentStamp + regime.deadline.value * MS_PER_DAY;
  const extended =
    regime.deadline.extension > 0
      ? regime.deadline.kind === "months"
        ? addCalendarMonths(sentStamp, regime.deadline.value + regime.deadline.extension)
        : sentStamp + (regime.deadline.value + regime.deadline.extension) * MS_PER_DAY
      : due;
  const ack =
    regime.ackBusinessDays > 0 ? addBusinessDays(sentStamp, regime.ackBusinessDays) : null;
  const backupsClear = due + purgeDays * MS_PER_DAY;

  const useCcpa = regime.id === "us-ccpa";
  const numbered = grounds.map((item, index) => {
    const body = useCcpa ? item.ccpaText : item.text;
    const cite = useCcpa ? "" : ` (${item.gdpr})`;
    return `${index + 1}. ${body.charAt(0).toUpperCase()}${body.slice(1)}${cite}.`;
  });

  const deadlineSentence = regime.statutory
    ? regime.deadline.kind === "months"
      ? `Article 12(3) requires you to act without undue delay and in any event within one month of receipt, so I expect written confirmation that the erasure is complete by ${formatStamp(due)}. If you rely on the extension of up to two further months, you must tell me within that first month and give your reasons.`
      : `Cal. Civ. Code § 1798.130(a)(2) requires a response within 45 calendar days of receipt, so I expect written confirmation by ${formatStamp(due)}. If you take the single further 45-day extension the statute allows, notify me in writing with the reason before the first deadline passes.`
    : `The Act does not fix a response period for this request, so I ask you to confirm completion by ${formatStamp(due)}, which is ${regime.deadline.value} days from today, and to tell me promptly if you need longer and why.`;

  const ackSentence = ack
    ? `Please confirm receipt of this request within ${regime.ackBusinessDays} business days, by ${formatStamp(ack)}, as Cal. Civ. Code § 1798.130(a)(2) requires.`
    : "";

  const backupSentence = `Deletion must reach your backups and archives as well as your live systems. If your backup rotation means copies survive for a period, tell me the length of that period and confirm the data will be excluded from any restore; on the ${purgeDays}-day window you operate that would place final deletion no later than ${formatStamp(backupsClear)}.`;

  const retentionSentence = retentionEnd
    ? `I accept that you may be required to retain a limited transaction record. On the period you rely on — ${years} year${years === 1 ? "" : "s"} from my last transaction on ${formatStamp(parseIsoDate(lastActivityDate))} — that record may be kept until ${formatStamp(retentionEnd)} and no longer. Please confirm that any retained record is limited to what the law actually requires, is not used for marketing, profiling, analytics or model training, and is deleted on that date.`
    : "I am not aware of any transaction record you are legally required to keep. If you believe one exists, identify the law, the record and the date the period ends.";

  const suppressionSentence = keepSuppression
    ? "You may keep the minimum record needed to honour this request — a suppression entry that stops my details being re-added — provided it holds nothing beyond what that purpose requires and is never used for any other purpose."
    : "Do not retain a suppression record. I understand that if you hold nothing at all, my details could be re-added from a future source.";

  const salutation = contact ? `${company}\n${contact}` : company;

  const lines = [
    `Date: ${formatStamp(sentStamp)}`,
    "",
    "To,",
    salutation,
    "",
    `Subject: ${regime.subject}`,
    "",
    "Dear Sir or Madam,",
    "",
    `I am writing as a ${regime.you} to require the erasure of all personal data you hold about me, under ${regime.right}. Please treat this as a formal request and route it to your privacy team or data protection officer.`,
    "",
    "The grounds on which erasure is required are:",
    "",
    ...numbered,
    "",
    `Please erase my personal data from your production systems, analytics stores, data warehouses, customer relationship systems, marketing platforms and any training datasets derived from it. ${regime.downstream}`,
    "",
    backupSentence,
    "",
    retentionSentence,
    "",
    suppressionSentence,
  ];

  if (wasPublic) lines.push("", regime.publicData);
  if (askRestriction) lines.push("", regime.restriction);

  if (ids) lines.push("", "Identifiers you hold for me:", ids);
  if (extra) lines.push("", "Further detail:", extra);

  lines.push(
    "",
    deadlineSentence,
  );
  if (ackSentence) lines.push("", ackSentence);

  lines.push(
    "",
    `Please reply in writing listing the systems and categories of data erased, the recipients notified, and anything retained with the reason. ${regime.exemptionClause} If you refuse this request in whole or in part, confirm that I may complain to ${regime.regulator} under ${regime.complaintBasis}.`,
    "",
    "Yours faithfully,",
    "",
    name,
    `Email: ${mail}`,
  );

  const letter = lines.join("\n");

  const notes = [];
  if (!regime.statutory) {
    notes.push(
      "The DPDP Act does not set a response deadline, so the date above is what you are asking for. If it passes, use the Data Fiduciary's published grievance mechanism first — Section 13(3) requires that before the Data Protection Board can be approached.",
    );
  }
  if (grounds.some((item) => item.id === "consent-withdrawn")) {
    notes.push(
      "Withdrawing consent only forces erasure where consent was the actual legal basis. If the organisation relies on contract or legitimate interests instead, pair this with the objection ground so the request still bites.",
    );
  }
  if (grounds.some((item) => item.id === "marketing") && regime.id !== "us-ccpa") {
    notes.push(
      "Objecting to direct marketing under Article 21(2) is absolute — there is no balancing test and no exemption. This is the strongest ground you can cite for marketing data.",
    );
  }
  if (retentionEnd && retentionEnd > due) {
    notes.push(
      "A retention carve-out runs past the response deadline, so expect partial erasure now and full erasure later. Ask them to diarise the residual deletion date in writing.",
    );
  }
  if (!keepSuppression) {
    notes.push(
      "Refusing a suppression record means nothing stops your details being re-imported from a bought list later. Most people are better off allowing it.",
    );
  }

  return {
    regime: regime.label,
    rightCited: regime.shortRight,
    sentLong: formatStamp(sentStamp),
    dueIso: isoOf(due),
    dueLong: formatStamp(due),
    dueDays: Math.round((due - sentStamp) / MS_PER_DAY),
    extendedLong: formatStamp(extended),
    hasExtension: extended !== due,
    ackLong: ack === null ? null : formatStamp(ack),
    backupsClearLong: formatStamp(backupsClear),
    retentionEndLong: retentionEnd === null ? null : formatStamp(retentionEnd),
    retentionEndIso: retentionEnd === null ? null : isoOf(retentionEnd),
    retentionSource: preset.source,
    retentionYears: years,
    statutory: regime.statutory,
    regulator: regime.regulator,
    groundCount: grounds.length,
    notes,
    letter,
  };
}
