/**
 * Beta Tester NDA Generator.
 *
 * A beta NDA has to do three things a generic confidentiality template does
 * not: settle who owns the ideas a tester sends back, describe the telemetry
 * the build sends home, and make clear that reporting a security bug is
 * welcome rather than an offence.
 *
 * Rules the clauses rest on:
 *  - Copyright: a bug report, mock-up or written suggestion is an original
 *    work, so its author holds copyright in the expression by default. A beta
 *    programme therefore needs an express, perpetual, royalty-free licence to
 *    use feedback, otherwise implementing a tester's write-up is a permission
 *    question. Ideas themselves are not protected by copyright (17 U.S.C.
 *    section 102(b) excludes ideas, procedures and methods of operation), but
 *    the write-up is.
 *  - Inventorship, 35 U.S.C. section 100(f): an inventor is the individual who
 *    invented the subject matter. A tester who contributes to the conception
 *    of a claimed feature can raise a joint-inventor question, which is why a
 *    beta agreement includes an assignment or waiver of rights in feedback.
 *  - Computer Fraud and Abuse Act, 18 U.S.C. section 1030: unauthorised access
 *    is defined by what the operator authorises, so an express safe harbour for
 *    good-faith testing is what converts security research from a risk into a
 *    permitted activity. The US Department of Justice charging policy announced
 *    in May 2022 directs prosecutors not to charge good-faith security research
 *    under the CFAA, but that policy binds federal prosecutors, not the company.
 *  - Coordinated vulnerability disclosure: ISO/IEC 29147 (vulnerability
 *    disclosure) and ISO/IEC 30111 (vulnerability handling) describe the
 *    process; the window itself is a matter of policy, and 90 days is the
 *    widely used industry default.
 *  - GDPR, Regulation (EU) 2016/679, Articles 6 and 13: crash logs, device
 *    identifiers and watermarked build identifiers are personal data, so a
 *    lawful basis and a transparency notice are needed. India's Digital
 *    Personal Data Protection Act 2023 requires a notice and, in most beta
 *    settings, consent. An NDA is not a privacy notice and cannot replace one.
 *  - COPPA, 16 CFR Part 312: verifiable parental consent is required before
 *    collecting personal information online from a child under 13, so a beta
 *    open to minors needs a guardian signature and a narrower data footprint.
 *  - US Export Administration Regulations, 15 CFR Parts 730-774: software,
 *    especially with encryption, cannot be supplied to embargoed destinations
 *    or denied parties, so a beta distributed by download needs an export
 *    clause.
 *  - Defend Trade Secrets Act, 18 U.S.C. section 1833(b): the immunity notice
 *    must appear in an agreement governing trade secret use with a contractor
 *    or consultant, or exemplary damages and fees under section 1836 are lost.
 *
 * Informational template only, not legal advice.
 */

/** Industry-default coordinated disclosure window in days. */
export const DEFAULT_DISCLOSURE_DAYS = 90;
/** Default number of days after the beta ends to delete the build and materials. */
export const DEFAULT_DELETION_DAYS = 14;
/** Default confidentiality tail after the beta ends, in months. */
export const DEFAULT_TAIL_MONTHS = 24;
const MAX_TAIL_MONTHS = 120;
const MAX_FIELD = 140;
const MS_PER_DAY = 86400000;

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

/** Facts about the beta programme that make particular clauses necessary. */
export const PROFILE_TAGS = [
  { id: "us", label: "Testers in the United States" },
  { id: "eu", label: "Testers in the EU or UK" },
  { id: "india", label: "Testers in India" },
  { id: "telemetry", label: "Build sends crash logs or usage telemetry" },
  { id: "watermark", label: "Builds are watermarked or uniquely fingerprinted" },
  { id: "security", label: "Testers are encouraged to report security bugs" },
  { id: "minors", label: "Testers may be under 18" },
  { id: "download", label: "Build is distributed by download across borders" },
  { id: "hardware", label: "Physical prototype hardware is loaned out" },
];

/**
 * Clause library. `always` means every beta NDA needs it; `requiredFor` lists
 * profile tags that make an otherwise optional clause necessary. `weight` is
 * how heavily a gap counts against the coverage score.
 */
export const CLAUSES = [
  {
    id: "parties",
    title: "Parties, programme and purpose",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "This agreement is between {{company}} and the tester named below, for participation in the {{program}} beta programme, which runs from {{startLong}} to {{endLong}} ({{betaDays}} days). Its purpose is to let the tester use a pre-release build and report back, and to keep everything about that build confidential until {{company}} makes it public.",
  },
  {
    id: "definition",
    title: "What counts as confidential",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "Confidential Information means the pre-release build itself and anything about it that is not already public: unreleased features, screens, menu wording, icons, pricing, release timing, known bugs, the contents of the bug tracker and release notes, performance figures, roadmap discussions, the tester community forum, and the fact that the programme exists. Verbal information from a briefing call is included.",
  },
  {
    id: "exclusions",
    title: "What is not confidential",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "Information is not confidential if it is already public through no fault of the tester, becomes public later through no fault of the tester, was already known to the tester without a duty of confidence, is independently developed without using the Confidential Information, or is rightfully received from a third party free to share it. These exclusions apply automatically.",
  },
  {
    id: "screenshots",
    title: "Screenshots, recordings and streaming",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "Do not screenshot, screen-record, photograph, stream or share any part of the build. That includes posting a cropped screenshot, describing an unreleased screen in a public forum, filing a bug on a public tracker, showing the build on a call with someone outside the programme, and leaving it visible in the background of a video. Share bug evidence only through {{channel}}.",
  },
  {
    id: "feedback",
    title: "Feedback and who owns it",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "Feedback means anything the tester sends back: bug reports, reproduction steps, logs, mock-ups, suggestions and survey answers. The tester grants {{company}} a perpetual, irrevocable, worldwide, royalty-free, sublicensable licence to use, reproduce, modify and incorporate Feedback in any product, with no obligation to credit or compensate, and waives any claim to ownership of features built on it. The tester confirms the Feedback is theirs to give and does not include anyone else's confidential material or code they are not free to share.",
  },
  {
    id: "no-warranty",
    title: "Beta builds come with no warranty",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "The build is pre-release, is provided as is, may lose data, may stop working, and may be withdrawn at any time. Do not use it for production work, for anything safety-critical, or with real customer data, financial records or health records. Keep independent backups. {{company}} gives no warranty of any kind and does not promise the product will ship, ship with these features, or ship at this price.",
  },
  {
    id: "security-safe-harbour",
    title: "Good-faith security research is authorised",
    always: false,
    requiredFor: ["security"],
    weight: 3,
    body: "{{company}} authorises testing for security flaws in the build, and will not bring a claim under the Computer Fraud and Abuse Act, 18 U.S.C. section 1030, or its equivalents elsewhere, against a tester acting in good faith within this clause. Good faith means: test only your own accounts and data, do not access, alter or exfiltrate anyone else's data, do not degrade the service or run denial-of-service tests, stop as soon as you have proof of a flaw, and report it through {{channel}} rather than exploiting it. This authorisation is what makes the access authorised, so stay inside it.",
  },
  {
    id: "disclosure-window",
    title: "Coordinated vulnerability disclosure",
    always: false,
    requiredFor: ["security"],
    weight: 3,
    body: "Report security flaws to {{channel}} and give {{company}} {{disclosureDays}} days from the report to fix and ship before publishing details. {{company}} will acknowledge within five working days, keep the reporter updated and credit them on request. If a fix is not shipped in that window, or the flaw is being exploited, the parties will agree a revised date rather than either side acting unilaterally. This follows the process described in ISO/IEC 29147 and ISO/IEC 30111; the window itself is a matter of agreement, and {{disclosureDays}} days is the industry norm.",
  },
  {
    id: "telemetry",
    title: "What the build collects about you",
    always: false,
    requiredFor: ["telemetry", "eu", "india"],
    weight: 3,
    body: "The build sends {{company}} crash reports, error logs, device and operating system details, and usage events, so that failures can be reproduced. This is personal data. It is processed for the purpose of developing and debugging the product, and it is described in {{company}}'s privacy notice, which governs it — this agreement does not replace that notice. Under the GDPR you can ask for access, correction or deletion, and under India's Digital Personal Data Protection Act 2023 you may withdraw consent, in each case by contacting {{channel}}. Leaving the programme stops further collection.",
  },
  {
    id: "watermark",
    title: "Builds are traceable to you",
    always: false,
    requiredFor: ["watermark"],
    weight: 2,
    body: "Each build is watermarked with an identifier tied to the tester's account, and screens may carry a visible or invisible marker. If a screenshot or build leaks, {{company}} can identify which copy it came from. This identifier is personal data and is used only to detect and investigate leaks. Do not attempt to remove, alter or obscure the watermark.",
  },
  {
    id: "no-share",
    title: "Do not pass the build on",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "The build is licensed to the named tester only. Do not install it on a shared or work machine, lend an account, re-upload the installer, publish a download link, decompile or reverse engineer it except where local law expressly permits, or use it to build a competing product. Household members must not use it.",
  },
  {
    id: "hardware",
    title: "Loaned prototype hardware",
    always: false,
    requiredFor: ["hardware"],
    weight: 3,
    body: "Prototype units remain {{company}}'s property. Do not open, disassemble, modify, benchmark against competitors, or let anyone outside the programme handle or see the unit. Keep it stored out of sight when not in use. Return it, with all accessories and packaging, within {{deletionDays}} days of the programme ending or on written request, and report loss or damage immediately.",
  },
  {
    id: "minors",
    title: "Testers under 18",
    always: false,
    requiredFor: ["minors"],
    weight: 3,
    body: "A tester under 18 may take part only with a parent or guardian who signs this agreement as well and supervises participation. {{company}} does not knowingly collect personal information from children under 13 without verifiable parental consent as required by the Children's Online Privacy Protection Rule, 16 CFR Part 312, and collects the minimum needed to run the programme. India's Digital Personal Data Protection Act 2023 similarly requires verifiable consent from a parent or guardian before processing a child's personal data.",
  },
  {
    id: "export",
    title: "Export control and sanctions",
    always: false,
    requiredFor: ["download"],
    weight: 2,
    body: "The build may be subject to the US Export Administration Regulations, 15 CFR Parts 730-774, and to comparable rules elsewhere. The tester confirms they are not located in, and will not export the build to, an embargoed destination, and that they are not a person on a restricted or denied-party list. Do not carry the build into a country you are not permitted to take it to.",
  },
  {
    id: "dtsa",
    title: "Trade secret immunity notice",
    always: false,
    requiredFor: ["us"],
    weight: 3,
    body: "Notice under 18 U.S.C. section 1833(b): an individual is not criminally or civilly liable under any federal or state trade secret law for disclosing a trade secret in confidence to a federal, state or local government official, or to an attorney, solely for the purpose of reporting or investigating a suspected violation of law, or in a complaint or other document filed under seal in a lawsuit or other proceeding. An individual who sues for retaliation for reporting a suspected violation of law may disclose the trade secret to their attorney and use it in the proceeding, provided any document containing it is filed under seal and it is not disclosed except by court order.",
  },
  {
    id: "reporting",
    title: "Nothing here blocks a lawful report",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "Nothing in this agreement prevents the tester from reporting a suspected criminal offence, a safety defect, a data breach or any other unlawful act to a regulator, a data protection authority, a computer emergency response team or a lawyer, or from responding truthfully to a court order or lawful regulatory request.",
  },
  {
    id: "term",
    title: "How long the duty lasts",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "Confidentiality runs from the effective date until {{tailEndLong}}, which is {{tailMonths}} months after the programme ends. Information that qualifies as a trade secret remains protected for as long as it stays secret. Anything {{company}} itself makes public stops being confidential when it is published.",
  },
  {
    id: "deletion",
    title: "Uninstall and delete at the end",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "Within {{deletionDays}} days of the programme ending, or immediately on written request, uninstall the build, delete installers, exported logs, screenshots, briefing documents and any copies including cloud backups, and confirm in writing that you have done so. The feedback licence and the confidentiality duty survive the end of the programme.",
  },
  {
    id: "remedies",
    title: "If a build or screenshot leaks",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "A leak cannot be undone with money alone, so {{company}} may seek an injunction or other equitable relief in addition to any other remedy. Tell {{channel}} immediately if you think something has leaked, before deleting anything, so the response can be coordinated. Accidental disclosure reported promptly is treated very differently from a deliberate leak.",
  },
  {
    id: "governing-law",
    title: "Governing law and signature",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "This agreement is governed by the laws of {{jurisdiction}}, and the courts of {{jurisdiction}} have jurisdiction over disputes about it. It is the whole agreement about confidentiality for this programme, replaces earlier drafts, and can be changed only in writing. If a clause is unenforceable the rest still applies. Participation is voluntary and either party may end it at any time.",
  },
];

const CLAUSE_BY_ID = new Map(CLAUSES.map((clause) => [clause.id, clause]));

function clean(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

/**
 * Parse yyyy-mm-dd into a UTC-midnight timestamp, or null when invalid.
 * @param {string} iso
 * @returns {number|null}
 */
export function parseIsoDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
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

function formatStamp(stamp) {
  const date = new Date(stamp);
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * Add whole calendar months, clamping to the last day of the target month.
 * @param {number} stamp UTC-midnight timestamp.
 * @param {number} months
 * @returns {number}
 */
export function addMonths(stamp, months) {
  const date = new Date(stamp);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + months + 1, 0)).getUTCDate();
  return Date.UTC(year, month + months, Math.min(day, lastDay));
}

/**
 * Whole days between two UTC-midnight timestamps.
 * @param {number} from
 * @param {number} to
 * @returns {number}
 */
export function daysBetween(from, to) {
  return Math.round((to - from) / MS_PER_DAY);
}

/**
 * Clauses this beta programme needs.
 * @param {string[]} profileTags Ids from PROFILE_TAGS.
 * @returns {object[]}
 */
export function requiredClauses(profileTags = []) {
  const tags = new Set(profileTags);
  return CLAUSES.filter(
    (clause) => clause.always || clause.requiredFor.some((tag) => tags.has(tag)),
  );
}

/**
 * Assemble the beta NDA and score its coverage.
 *
 * Coverage = weight of required clauses included / total weight of required
 * clauses, as a whole percentage.
 *
 * @param {object} input
 * @param {string} input.companyName
 * @param {string} input.programName
 * @param {string} input.contactChannel Where bugs and questions go.
 * @param {string} input.jurisdiction
 * @param {string} input.startDate yyyy-mm-dd
 * @param {string} input.endDate   yyyy-mm-dd
 * @param {number} input.tailMonths      Confidentiality tail after the beta ends.
 * @param {number} input.disclosureDays  Coordinated disclosure window.
 * @param {number} input.deletionDays    Days to uninstall and delete.
 * @param {string[]} input.profileTags
 * @param {string[]} input.includedIds
 * @returns {{agreement:string, coveragePercent:number, missing:object[], warnings:string[],
 *            betaDays:number, tailEndLong:string, wordCount:number, included:object[]}|{error:string}}
 */
export function buildBetaNda({
  companyName,
  programName,
  contactChannel,
  jurisdiction,
  startDate,
  endDate,
  tailMonths = DEFAULT_TAIL_MONTHS,
  disclosureDays = DEFAULT_DISCLOSURE_DAYS,
  deletionDays = DEFAULT_DELETION_DAYS,
  profileTags = [],
  includedIds = [],
}) {
  if (!Array.isArray(profileTags) || !Array.isArray(includedIds)) {
    return { error: "Profile and clause selections must be given as lists." };
  }
  const unknown = includedIds.find((id) => !CLAUSE_BY_ID.has(id));
  if (unknown) return { error: `Unknown clause: ${unknown}.` };

  const company = clean(companyName);
  const program = clean(programName);
  const channel = clean(contactChannel);
  const law = clean(jurisdiction);
  if (!company) return { error: "Enter the company name running the beta." };
  if (!program) return { error: "Enter the beta programme or build name." };
  if (!channel) return { error: "Enter where testers should send bugs and questions." };
  if (!law) return { error: "Enter the governing law — a country or a state." };
  if ([company, program, channel, law].some((value) => value.length > MAX_FIELD)) {
    return { error: `Keep each field under ${MAX_FIELD} characters.` };
  }

  const start = parseIsoDate(startDate);
  if (start === null) return { error: "Enter a valid programme start date." };
  const end = parseIsoDate(endDate);
  if (end === null) return { error: "Enter a valid programme end date." };
  if (end <= start) return { error: "The programme must end after it starts." };

  const tail = Number(tailMonths);
  if (!Number.isFinite(tail) || !Number.isInteger(tail) || tail < 1 || tail > MAX_TAIL_MONTHS) {
    return {
      error: `The confidentiality tail must be a whole number of months between 1 and ${MAX_TAIL_MONTHS}.`,
    };
  }

  const disclosure = Number(disclosureDays);
  if (
    !Number.isFinite(disclosure) ||
    !Number.isInteger(disclosure) ||
    disclosure < 1 ||
    disclosure > 365
  ) {
    return { error: "The disclosure window must be a whole number of days between 1 and 365." };
  }

  const deletion = Number(deletionDays);
  if (!Number.isFinite(deletion) || !Number.isInteger(deletion) || deletion < 1 || deletion > 180) {
    return { error: "The deletion window must be a whole number of days between 1 and 180." };
  }

  const included = CLAUSES.filter((clause) => includedIds.includes(clause.id));
  if (included.length === 0) {
    return { error: "Include at least one clause — an empty agreement is worse than none." };
  }

  const required = requiredClauses(profileTags);
  const totalWeight = required.reduce((sum, clause) => sum + clause.weight, 0);
  const coveredWeight = required
    .filter((clause) => includedIds.includes(clause.id))
    .reduce((sum, clause) => sum + clause.weight, 0);
  const coveragePercent = totalWeight === 0 ? 100 : Math.round((coveredWeight / totalWeight) * 100);

  const missing = required
    .filter((clause) => !includedIds.includes(clause.id))
    .map((clause) => ({
      id: clause.id,
      title: clause.title,
      why: clause.always
        ? "Every beta NDA needs this clause."
        : `Needed because: ${clause.requiredFor
            .filter((tag) => profileTags.includes(tag))
            .map((tag) => PROFILE_TAGS.find((entry) => entry.id === tag)?.label ?? tag)
            .join("; ")}.`,
    }));

  const tags = new Set(profileTags);
  const warnings = [];
  if (tags.has("security") && !includedIds.includes("security-safe-harbour")) {
    warnings.push(
      "You invite security reports but authorise nothing. Without an express safe harbour, testing the build can still look like unauthorised access under the Computer Fraud and Abuse Act, 18 U.S.C. section 1030.",
    );
  }
  if ((tags.has("telemetry") || tags.has("watermark")) && !includedIds.includes("telemetry")) {
    warnings.push(
      "The build collects data about testers but the agreement does not say so. GDPR Article 13 requires that testers be told at the point of collection, and an NDA does not satisfy it.",
    );
  }
  if (tags.has("minors") && !includedIds.includes("minors")) {
    warnings.push(
      "A minor cannot generally give a binding consent or sign a licence of feedback rights. Add the guardian clause or exclude under-18s from the programme.",
    );
  }
  if (!includedIds.includes("feedback")) {
    warnings.push(
      "Without the feedback licence, the copyright in a tester's write-up stays with the tester and a contributed idea can raise a joint-inventor question under 35 U.S.C. section 100(f).",
    );
  }
  if (tags.has("us") && !includedIds.includes("dtsa")) {
    warnings.push(
      "Without the 18 U.S.C. section 1833(b) immunity notice you cannot recover exemplary damages or attorney fees under the Defend Trade Secrets Act against a tester.",
    );
  }

  const betaDays = daysBetween(start, end);
  const tailEnd = addMonths(end, tail);

  const values = {
    company,
    program,
    channel,
    jurisdiction: law,
    startLong: formatStamp(start),
    endLong: formatStamp(end),
    betaDays: String(betaDays),
    tailMonths: String(tail),
    tailEndLong: formatStamp(tailEnd),
    disclosureDays: String(disclosure),
    deletionDays: String(deletion),
  };

  const fill = (text) =>
    Object.keys(values).reduce((acc, key) => acc.split(`{{${key}}}`).join(values[key]), text);

  const lines = [
    `${company.toUpperCase()} — ${program.toUpperCase()} BETA TESTER NON-DISCLOSURE AGREEMENT`,
    `Programme runs ${formatStamp(start)} to ${formatStamp(end)} (${betaDays} days). Confidentiality runs to ${formatStamp(tailEnd)}.`,
    "",
  ];
  included.forEach((clause, index) => {
    lines.push(`${index + 1}. ${clause.title.toUpperCase()}`);
    lines.push(fill(clause.body));
    lines.push("");
  });
  lines.push("Tester name: ______________________  Signature: ______________________  Date: __________");
  if (tags.has("minors")) {
    lines.push(
      "Parent or guardian (required if the tester is under 18): ______________________  Date: __________",
    );
  }
  lines.push(`For ${company}: ______________________  Date: __________`);

  const agreement = lines.join("\n");

  return {
    agreement,
    coveragePercent,
    missing,
    warnings,
    betaDays,
    tailEndLong: formatStamp(tailEnd),
    wordCount: agreement.split(/\s+/).filter(Boolean).length,
    included: included.map((clause) => ({ id: clause.id, title: clause.title })),
  };
}
