/**
 * Nonprofit Privacy Policy Generator.
 *
 * A charity holds three quite different populations in the same database:
 * donors, whose records are governed as much by tax law as by data protection
 * law; volunteers, whose records often include criminal record checks; and
 * beneficiaries, whose records frequently contain health, religious or
 * political data. A single generic policy fails all three. This module builds
 * a notice that separates them, and computes the donor receipting thresholds
 * and record retention periods the surrounding rules impose.
 *
 * Rules the sections and the maths rest on:
 *  - GDPR, Regulation (EU) 2016/679. Article 9(1) prohibits processing special
 *    category data — including health, religious or philosophical beliefs,
 *    political opinions and trade union membership — unless an exception in
 *    Article 9(2) applies. Article 9(2)(d) is the charity exception: a
 *    foundation, association or other not-for-profit body with a political,
 *    philosophical, religious or trade union aim may process the data of its
 *    members, former members and people in regular contact with it, with
 *    appropriate safeguards, provided the data is not disclosed outside
 *    without consent. Article 10 governs criminal conviction data, which may
 *    be processed only under the control of official authority or where
 *    domestic law authorises it. Recital 47 records that direct marketing may
 *    be a legitimate interest, but the channel rules in the ePrivacy Directive
 *    still decide whether you may email or text.
 *  - UK enforcement history: in 2016 and 2017 the Information Commissioner
 *    fined charities for wealth screening, data matching and telematching
 *    donors without telling them. Those practices are why a modern charity
 *    notice says explicitly whether it profiles donors by wealth.
 *  - US tax rules on donor records. Under 26 U.S.C. section 170(f)(8) a donor
 *    cannot deduct a contribution of 250 US dollars or more without a
 *    contemporaneous written acknowledgment from the charity. Under 26 U.S.C.
 *    section 6115 a charity must give a written disclosure for a quid pro quo
 *    contribution over 75 US dollars, stating that the deductible amount is
 *    limited to the excess over the value of goods or services provided and
 *    giving a good faith estimate of that value. Schedule B to Form 990 lists
 *    contributors who gave, in money or property, the greater of 5,000 US
 *    dollars or 2% of total contributions; a section 501(c)(3) organisation
 *    that is not a private foundation redacts contributor names and addresses
 *    from the copy it makes available for public inspection.
 *  - Federal grant records: 2 CFR 200.334, the Uniform Guidance, requires
 *    financial records, supporting documents and statistical records of a
 *    federal award to be retained for three years from the date the final
 *    financial report is submitted, longer where litigation or an audit is
 *    started before that period ends.
 *  - India: the Foreign Contribution (Regulation) Act 2010 and the rules made
 *    under it require an organisation receiving foreign contribution to keep a
 *    separate account, to file an annual return in Form FC-4 by 31 December
 *    for the preceding financial year, and to preserve the account and records
 *    for six years. The Digital Personal Data Protection Act 2023 adds notice,
 *    consent, correction and erasure rights and a named grievance contact.
 *
 * Informational template only. It is not legal, tax or accounting advice.
 */

/** 26 U.S.C. section 170(f)(8): contemporaneous written acknowledgment threshold. */
export const IRS_WRITTEN_ACK_THRESHOLD_USD = 250;
/** 26 U.S.C. section 6115: quid pro quo disclosure threshold. */
export const IRS_QUID_PRO_QUO_THRESHOLD_USD = 75;
/** Form 990 Schedule B: greater of this amount or the percentage below. */
export const SCHEDULE_B_FIXED_USD = 5000;
export const SCHEDULE_B_PERCENT_OF_CONTRIBUTIONS = 2;
/** 2 CFR 200.334: retention from submission of the final financial report. */
export const UNIFORM_GUIDANCE_RETENTION_YEARS = 3;
/** FCRA 2010 and the rules made under it: retention of foreign contribution records. */
export const FCRA_RETENTION_YEARS = 6;
/** FCRA annual return Form FC-4 filing deadline. */
export const FCRA_RETURN_DEADLINE = "31 December";
const MAX_MONTHS = 240;
const MAX_FIELD = 160;

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

/** What the organisation does, which decides which sections it needs. */
export const PRACTICES = [
  { id: "donors", label: "Takes donations from individuals" },
  { id: "us-tax", label: "US organisation filing Form 990" },
  { id: "uk", label: "Registered with a UK regulator or fundraising in the UK" },
  { id: "eu", label: "Supporters or staff in the EU" },
  { id: "india", label: "Registered in India" },
  { id: "fcra", label: "Receives foreign contribution under FCRA" },
  { id: "volunteers", label: "Recruits volunteers" },
  { id: "background-checks", label: "Runs criminal record checks on volunteers or staff" },
  { id: "beneficiaries", label: "Holds records about the people it helps" },
  { id: "special-category", label: "Those records include health, belief or political data" },
  { id: "grants", label: "Reports to grant funders" },
  { id: "federal-grants", label: "Receives US federal awards" },
  { id: "case-studies", label: "Publishes photographs or case studies" },
  { id: "legacy", label: "Runs a legacy or bequest programme" },
  { id: "wealth-screening", label: "Uses wealth screening or donor research" },
];

/** Policy sections. */
export const SECTIONS = [
  {
    id: "who",
    title: "Who we are",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "{{org}} is {{orgType}}, registration number {{regNumber}}. We decide why and how personal data about our supporters, volunteers and the people we work with is used, which makes us the controller under the GDPR and the data fiduciary under India's Digital Personal Data Protection Act 2023. Write to {{contact}} about anything in this notice.",
  },
  {
    id: "three-groups",
    title: "Three different groups, three different rules",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "This notice separates the people whose data we hold, because the rules that apply to each are different. Donors and supporters: we hold what you tell us and what your payment leaves behind. Volunteers and staff: we hold recruitment, suitability and rota records. The people our work supports: we hold whatever the service needs and nothing more. Where a rule applies to only one group, we say so.",
  },
  {
    id: "donors",
    title: "Donors and supporters",
    always: false,
    requiredFor: ["donors"],
    weight: 3,
    body: "When you give, we record your name, contact details, the amount, the date, the campaign, the payment method reference and whatever message you send with it. Your card number reaches our payment provider, not us. We use this to process the gift, thank you, keep our accounts, meet the reporting duties below, and — where you have agreed or where the law allows — tell you what your money did. {{giftAidLine}}",
  },
  {
    id: "us-receipting",
    title: "Receipts and tax acknowledgments",
    always: false,
    requiredFor: ["us-tax"],
    weight: 3,
    body: "{{receiptingBody}}",
  },
  {
    id: "schedule-b",
    title: "What the tax return discloses about donors",
    always: false,
    requiredFor: ["us-tax"],
    weight: 3,
    body: "{{scheduleBBody}}",
  },
  {
    id: "fundraising-marketing",
    title: "Fundraising contact and how to stop it",
    always: false,
    requiredFor: ["donors"],
    weight: 3,
    body: "We contact supporters about our work by {{channels}}. Email and text messages go only to people who have agreed to them. Post and telephone rest on our legitimate interest in fundraising, which Recital 47 of the GDPR recognises, and you can object at any time with no reason given and we will stop. {{fpsLine}} Every message tells you how to stop, and stopping one channel never stops your donation from being processed.",
  },
  {
    id: "wealth-screening",
    title: "Donor research and wealth screening",
    always: false,
    requiredFor: ["donors"],
    weight: 3,
    body: "{{wealthBody}}",
  },
  {
    id: "volunteers",
    title: "Volunteers",
    always: false,
    requiredFor: ["volunteers"],
    weight: 3,
    body: "For volunteers we hold an application, references, emergency contact details, availability, training records, expenses claims and any incident reports. We use them to place you safely, to keep our insurance valid and to run the rota. Emergency contact details are used only in an emergency. We keep a volunteer record for {{volunteerMonths}} months after your last shift, because a safeguarding or insurance question can arrive after someone has left, and then delete it.",
  },
  {
    id: "background-checks",
    title: "Criminal record checks",
    always: false,
    requiredFor: ["background-checks"],
    weight: 3,
    body: "For roles that involve children or adults at risk we run a criminal record check. Article 10 of the GDPR allows criminal conviction data to be processed only under the control of official authority or where domestic law authorises it, so we run checks only where the role legally qualifies for one. We record the certificate number, the date and the decision — not the certificate itself, which is returned or destroyed after the decision, normally within six months. A disclosure does not automatically bar you; we assess relevance to the role and you may explain.",
  },
  {
    id: "beneficiaries",
    title: "The people our work supports",
    always: false,
    requiredFor: ["beneficiaries"],
    weight: 3,
    body: "We hold the minimum needed to provide the service: who you are, what you asked for, what we did and what happens next. You are not required to give a reason for wanting help beyond what the service needs. Records are seen only by the workers involved in your case and their supervisor. Asking us to delete a record does not affect help you have already received, and we will explain if a safeguarding duty means we must keep something.",
  },
  {
    id: "special-category",
    title: "Health, belief and other sensitive data",
    always: false,
    requiredFor: ["special-category"],
    weight: 3,
    body: "Some records contain data that Article 9(1) of the GDPR treats as special category — health, disability, religious or philosophical belief, political opinion, ethnicity or sexual orientation. We hold it only where it is needed for the service, and we rely on your explicit consent, on the substantial public interest condition in domestic law, or on the not-for-profit exception in Article 9(2)(d) which lets a body with a political, philosophical, religious or trade union aim process the data of its members, former members and people in regular contact with it. Under that exception the data is never disclosed outside the organisation without your consent. Access is restricted, and this data is never used for fundraising selection.",
  },
  {
    id: "case-studies",
    title: "Photographs, stories and case studies",
    always: false,
    requiredFor: ["case-studies"],
    weight: 3,
    body: "We publish stories about our work only with the specific, written and freely given consent of the person in them, recorded separately from any consent to receive the service — help is never conditional on agreeing to be photographed. Consent says where the image or story will appear and for how long, and it can be withdrawn: we will remove the material from anything we control, though we cannot recall a printed report already distributed. Where a person cannot consent, or is a child, we use consent from a parent or guardian plus the child's own agreement, and we do not identify people at risk.",
  },
  {
    id: "grants",
    title: "What funders see",
    always: false,
    requiredFor: ["grants"],
    weight: 3,
    body: "Funders receive figures, not files. A grant report contains counts, outcomes and anonymised examples. We share identifiable data with a funder only where the grant agreement requires it, we tell you before we do, and we push back on a funder that asks for more than its purpose needs. {{federalGrantsLine}}",
  },
  {
    id: "fcra",
    title: "Foreign contribution records",
    always: false,
    requiredFor: ["fcra"],
    weight: 3,
    body: `Foreign contribution is received into the designated FCRA account and is accounted for separately from domestic funds, as the Foreign Contribution (Regulation) Act 2010 requires. We file the annual return in Form FC-4 by ${FCRA_RETURN_DEADLINE} for the preceding financial year, and we preserve the account and the supporting records for ${FCRA_RETENTION_YEARS} years. Donor identity in those records is disclosed to the authorities that supervise the Act, and otherwise kept confidential.`,
  },
  {
    id: "legacy",
    title: "Legacies and bequests",
    always: false,
    requiredFor: ["legacy"],
    weight: 2,
    body: "If you tell us you have left us a gift in your will, we record that, keep it confidential, and use it only for planning. We never ask for a copy of the will, we do not contact your family, and telling us costs you nothing and commits you to nothing — you may change your will at any time without telling us. After a death we deal with the executors and hold what is needed to administer the estate and account for the gift.",
  },
  {
    id: "sharing",
    title: "Who else sees the data",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "We share personal data with the providers that run our systems — {{processors}} — under written contracts meeting Article 28 of the GDPR, with our auditor, and with regulators and authorities where the law requires it. We do not sell, rent or swap supporter lists, and we do not take part in list exchanges with other charities.",
  },
  {
    id: "retention",
    title: "How long we keep records",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "{{retentionSummary}} A record kept for a legal or accounting reason is locked down to that purpose and is not used for fundraising.",
  },
  {
    id: "rights",
    title: "Your rights",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "You may ask us for a copy of what we hold about you, to correct it, to delete it, to restrict how we use it, to receive it in a portable format, or to object — and an objection to fundraising is absolute, so we simply stop. Write to {{contact}} and we answer within one month. Under India's Digital Personal Data Protection Act 2023 you may also nominate someone to exercise these rights for you, and {{contact}} is our grievance redressal contact. If we get it wrong you can complain to your data protection authority.",
  },
  {
    id: "security",
    title: "Security, access and breaches",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "Access follows the job: fundraisers cannot see case records, and case workers cannot see donation histories, unless a specific task requires it and it is logged. Volunteers with data access are trained and sign a confidentiality undertaking. If a breach is likely to put someone at risk we notify the supervisory authority within 72 hours as Article 33 of the GDPR requires and tell the people affected where the risk is high. For a charity, an exposed beneficiary list is a safeguarding incident before it is a compliance one.",
  },
  {
    id: "changes",
    title: "Changes to this notice",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "Last updated {{effectiveLong}}, reviewed at least every {{reviewMonths}} months, next by {{reviewByLong}}. A change that affects what we do with your data is announced before it takes effect, and where consent is needed we ask again rather than assume.",
  },
];

const SECTION_BY_ID = new Map(SECTIONS.map((section) => [section.id, section]));

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
 * @param {number} stamp
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
 * Work out which US donor disclosures a gift triggers, and what the donor may
 * actually deduct.
 *
 * deductibleAmount = donation - fair market value of goods or services given
 *                    back, floored at zero
 * writtenAck       required at 250 US dollars or more (26 U.S.C. 170(f)(8))
 * quidProQuo       required above 75 US dollars where anything was given back
 *                  (26 U.S.C. 6115)
 * scheduleBThreshold = the greater of 5,000 US dollars and 2% of total
 *                      contributions reported for the year
 *
 * @param {object} input
 * @param {number} input.donationAmount
 * @param {number} input.benefitValue Fair market value of goods or services given to the donor.
 * @param {number} input.totalContributions Total contributions the organisation reports for the year.
 * @returns {{deductibleAmount:number, needsWrittenAck:boolean, needsQuidProQuo:boolean,
 *            scheduleBThreshold:number, isScheduleBContributor:boolean,
 *            notes:string[]}|{error:string}}
 */
export function assessDonorDisclosures({
  donationAmount = 0,
  benefitValue = 0,
  totalContributions = 0,
}) {
  const donation = Number(donationAmount);
  const benefit = Number(benefitValue);
  const total = Number(totalContributions);
  if (!Number.isFinite(donation) || donation < 0) {
    return { error: "The donation amount must be zero or more." };
  }
  if (!Number.isFinite(benefit) || benefit < 0) {
    return { error: "The value of anything given back must be zero or more." };
  }
  if (!Number.isFinite(total) || total < 0) {
    return { error: "Total contributions for the year must be zero or more." };
  }
  if (benefit > donation) {
    return {
      error:
        "What the donor received back is worth more than the gift, so there is no contribution to deduct. Check the two figures.",
    };
  }

  const deductibleAmount = Math.max(0, donation - benefit);
  const needsWrittenAck = donation >= IRS_WRITTEN_ACK_THRESHOLD_USD;
  const needsQuidProQuo = donation > IRS_QUID_PRO_QUO_THRESHOLD_USD && benefit > 0;
  const scheduleBThreshold = Math.max(
    SCHEDULE_B_FIXED_USD,
    (total * SCHEDULE_B_PERCENT_OF_CONTRIBUTIONS) / 100,
  );
  const isScheduleBContributor = donation >= scheduleBThreshold;

  const notes = [];
  if (needsWrittenAck) {
    notes.push(
      `At ${IRS_WRITTEN_ACK_THRESHOLD_USD} US dollars or more, the donor cannot deduct this gift without a contemporaneous written acknowledgment from you under 26 U.S.C. section 170(f)(8).`,
    );
  }
  if (needsQuidProQuo) {
    notes.push(
      `Above ${IRS_QUID_PRO_QUO_THRESHOLD_USD} US dollars with something given back, 26 U.S.C. section 6115 requires a written statement that only the excess over the value received is deductible, with a good faith estimate of that value.`,
    );
  }
  if (isScheduleBContributor) {
    notes.push(
      "This gift reaches the Schedule B reporting threshold, so the contributor is listed on the return filed with the IRS. A section 501(c)(3) organisation that is not a private foundation redacts contributor names and addresses from the copy made available for public inspection.",
    );
  }
  if (notes.length === 0) {
    notes.push(
      "No federal acknowledgment or disclosure threshold is crossed by this gift. Sending a receipt anyway is good practice and costs nothing.",
    );
  }

  return {
    deductibleAmount,
    needsWrittenAck,
    needsQuidProQuo,
    scheduleBThreshold,
    isScheduleBContributor,
    notes,
  };
}

/**
 * Sections this organisation needs.
 * @param {string[]} practices Ids from PRACTICES.
 * @returns {object[]}
 */
export function requiredSections(practices = []) {
  const set = new Set(practices);
  return SECTIONS.filter(
    (section) => section.always || section.requiredFor.some((id) => set.has(id)),
  );
}

function checkMonths(value, label) {
  const months = Number(value);
  if (!Number.isFinite(months) || !Number.isInteger(months) || months < 1 || months > MAX_MONTHS) {
    return `${label} must be a whole number of months between 1 and ${MAX_MONTHS}.`;
  }
  return null;
}

/**
 * Assemble the notice, score it, and return the donor disclosure assessment.
 *
 * @returns {{policy:string, completenessPercent:number, missing:object[], warnings:string[],
 *            donor:object, reviewByLong:string, wordCount:number,
 *            included:object[]}|{error:string}}
 */
export function buildNonprofitPolicy({
  orgName,
  orgType = "a registered charity",
  regNumber = "not yet registered",
  contactEmail,
  processors = "our CRM provider, our payment provider and our email provider",
  channels = "email, post and, occasionally, the telephone",
  effectiveDate,
  reviewMonths = 12,
  donorRecordMonths = 84,
  volunteerMonths = 36,
  beneficiaryMonths = 84,
  giftAid = false,
  donationAmount = 1000,
  benefitValue = 120,
  totalContributions = 400000,
  practices = [],
  includedIds = [],
}) {
  if (!Array.isArray(practices) || !Array.isArray(includedIds)) {
    return { error: "Practice and section selections must be given as lists." };
  }
  const unknown = includedIds.find((id) => !SECTION_BY_ID.has(id));
  if (unknown) return { error: `Unknown section: ${unknown}.` };

  const org = clean(orgName);
  const contact = clean(contactEmail);
  if (!org) return { error: "Enter the organisation's name." };
  if (!contact) return { error: "Enter a contact address for data and grievance requests." };
  if ([org, contact].some((value) => value.length > MAX_FIELD)) {
    return { error: `Keep each field under ${MAX_FIELD} characters.` };
  }

  const effective = parseIsoDate(effectiveDate);
  if (effective === null) return { error: "Enter a valid last-updated date." };

  for (const [value, label] of [
    [reviewMonths, "The review interval"],
    [donorRecordMonths, "Donor record retention"],
    [volunteerMonths, "Volunteer record retention"],
    [beneficiaryMonths, "Beneficiary record retention"],
  ]) {
    const problem = checkMonths(value, label);
    if (problem) return { error: problem };
  }

  const donor = assessDonorDisclosures({ donationAmount, benefitValue, totalContributions });
  if (donor.error) return { error: donor.error };

  const included = SECTIONS.filter((section) => includedIds.includes(section.id));
  if (included.length === 0) {
    return { error: "Include at least one section — an empty notice is worse than none." };
  }

  const set = new Set(practices);
  const usd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const giftAidLine = giftAid
    ? "If you make a Gift Aid declaration we keep it, and the record of the gifts it covers, for as long as the tax authority may inspect it, which is longer than we keep anything else about you. A declaration can be cancelled at any time."
    : "We do not operate a tax-reclaim declaration scheme, so we hold no tax status information about you.";

  const receiptingBody = `Every gift gets a receipt. For a gift of ${usd.format(IRS_WRITTEN_ACK_THRESHOLD_USD)} or more the receipt is a contemporaneous written acknowledgment under 26 U.S.C. section 170(f)(8), stating the amount and whether we gave you any goods or services in return — without it the donor cannot deduct the gift. Where you paid more than ${usd.format(IRS_QUID_PRO_QUO_THRESHOLD_USD)} and received something back, 26 U.S.C. section 6115 requires us to state in writing that only the excess over the value of what you received is deductible, and to give a good faith estimate of that value. On the example in this notice — a gift of ${usd.format(Number(donationAmount))} with ${usd.format(Number(benefitValue))} of benefits — the deductible amount is ${usd.format(donor.deductibleAmount)}. We keep the receipt record for ${donorRecordMonths} months so we can re-issue it.`;

  const scheduleBBody = `Our annual return on Form 990 includes Schedule B, which lists contributors who gave the greater of ${usd.format(SCHEDULE_B_FIXED_USD)} or ${SCHEDULE_B_PERCENT_OF_CONTRIBUTIONS}% of total contributions. On total contributions of ${usd.format(Number(totalContributions))} that threshold is ${usd.format(donor.scheduleBThreshold)}. The copy filed with the IRS names those contributors. As a section 501(c)(3) organisation that is not a private foundation, we redact contributor names and addresses from the copy we make available for public inspection, so a large gift does not become a public record through us. We cannot control what a state regulator or a third party publishes from its own filings.`;

  const wealthBody = set.has("wealth-screening")
    ? "We use donor research: publicly available information about a supporter's likely capacity to give, and in some cases a screening service. We do this only for supporters who already have a relationship with us, we tell you here because the UK Information Commissioner fined several charities for doing it silently, and you can opt out of research entirely by writing to us — it will not affect how your gift is handled or how you are treated. We do not buy data about people who have not contacted us, and we do not combine your record with data brokers' profiles."
    : "We do not carry out wealth screening, data matching or telematching. We do not buy in data about supporters, we do not estimate what you can afford, and we do not append information to your record from outside sources. What we know about you is what you have told us and what your gifts show.";

  const fpsLine = set.has("uk")
    ? "You can also stop all fundraising contact from us through the Fundraising Preference Service, and we check suppression lists before every mailing."
    : "You can ask us to suppress your record entirely, which stops all fundraising contact while keeping the minimum needed to honour that instruction.";

  const federalGrantsLine = set.has("federal-grants")
    ? `Where a grant is a US federal award, 2 CFR 200.334 requires the financial records, supporting documents and statistical records to be kept for ${UNIFORM_GUIDANCE_RETENTION_YEARS} years from the date the final financial report is submitted, and longer if litigation, a claim or an audit starts before that period ends.`
    : "Grant records are kept for as long as the grant agreement and our accounting duties require, and then deleted.";

  const retentionParts = [];
  if (set.has("donors")) {
    retentionParts.push(`donation and receipt records: ${donorRecordMonths} months`);
  }
  if (set.has("volunteers")) {
    retentionParts.push(`volunteer records: ${volunteerMonths} months after the last shift`);
  }
  if (set.has("beneficiaries")) {
    retentionParts.push(`case records: ${beneficiaryMonths} months after the case closes`);
  }
  if (set.has("federal-grants")) {
    retentionParts.push(
      `federal award records: ${UNIFORM_GUIDANCE_RETENTION_YEARS} years from the final financial report, under 2 CFR 200.334`,
    );
  }
  if (set.has("fcra")) {
    retentionParts.push(
      `foreign contribution accounts: ${FCRA_RETENTION_YEARS} years, under the Foreign Contribution (Regulation) Act 2010`,
    );
  }
  const retentionSummary =
    retentionParts.length > 0
      ? `Each kind of record has its own period — ${retentionParts.join("; ")}.`
      : "We keep records only as long as the purpose that justified collecting them lasts.";

  const values = {
    org,
    orgType: clean(orgType),
    regNumber: clean(regNumber),
    contact,
    processors: clean(processors),
    channels: clean(channels),
    giftAidLine,
    receiptingBody,
    scheduleBBody,
    wealthBody,
    fpsLine,
    federalGrantsLine,
    retentionSummary,
    volunteerMonths: String(volunteerMonths),
    reviewMonths: String(reviewMonths),
    effectiveLong: formatStamp(effective),
    reviewByLong: formatStamp(addMonths(effective, Number(reviewMonths))),
  };

  const fill = (text) =>
    Object.keys(values).reduce((acc, key) => acc.split(`{{${key}}}`).join(values[key]), text);

  const required = requiredSections(practices);
  const totalWeight = required.reduce((sum, section) => sum + section.weight, 0);
  const coveredWeight = required
    .filter((section) => includedIds.includes(section.id))
    .reduce((sum, section) => sum + section.weight, 0);
  const completenessPercent =
    totalWeight === 0 ? 100 : Math.round((coveredWeight / totalWeight) * 100);

  const missing = required
    .filter((section) => !includedIds.includes(section.id))
    .map((section) => ({
      id: section.id,
      title: section.title,
      why: section.always
        ? "Every charity notice needs this section."
        : `Needed because: ${section.requiredFor
            .filter((id) => set.has(id))
            .map((id) => PRACTICES.find((entry) => entry.id === id)?.label ?? id)
            .join("; ")}.`,
    }));

  const warnings = [];
  if (set.has("special-category") && !includedIds.includes("special-category")) {
    warnings.push(
      "You hold health, belief or political data but the notice does not name an Article 9(2) condition for it. Processing special category data without one is prohibited by Article 9(1) of the GDPR.",
    );
  }
  if (set.has("background-checks") && !set.has("volunteers")) {
    warnings.push(
      "You run criminal record checks but have not selected volunteer recruitment. Article 10 of the GDPR only permits conviction data where domestic law authorises it for that role.",
    );
  }
  if (set.has("wealth-screening") && !includedIds.includes("wealth-screening")) {
    warnings.push(
      "Silent wealth screening is exactly what the UK Information Commissioner fined charities for in 2016 and 2017. If you do it, the notice has to say so.",
    );
  }
  if (set.has("case-studies") && !includedIds.includes("case-studies")) {
    warnings.push(
      "Publishing a beneficiary's photograph or story without a separate, freely given consent makes access to help look conditional on publicity.",
    );
  }
  if (set.has("fcra") && !set.has("india")) {
    warnings.push(
      "FCRA obligations apply to organisations registered in India. Confirm which entity actually receives the foreign contribution.",
    );
  }
  if (donor.isScheduleBContributor && set.has("us-tax") && !includedIds.includes("schedule-b")) {
    warnings.push(
      `A gift of this size reaches the Schedule B threshold of ${usd.format(donor.scheduleBThreshold)}, so donors should be told how their name is handled on the return.`,
    );
  }

  const lines = [
    `${org} — Privacy Notice`,
    `${values.orgType}, registration ${values.regNumber}. Last updated ${formatStamp(effective)}. Next review by ${values.reviewByLong}.`,
    "",
  ];
  included.forEach((section, index) => {
    lines.push(`${index + 1}. ${section.title}`);
    lines.push(fill(section.body));
    lines.push("");
  });
  lines.push(
    `Questions, corrections and complaints go to ${contact}. We would rather fix something than have you stop supporting the work.`,
  );

  const policy = lines.join("\n");

  return {
    policy,
    completenessPercent,
    missing,
    warnings,
    donor,
    reviewByLong: values.reviewByLong,
    wordCount: policy.split(/\s+/).filter(Boolean).length,
    included: included.map((section) => ({ id: section.id, title: section.title })),
  };
}
