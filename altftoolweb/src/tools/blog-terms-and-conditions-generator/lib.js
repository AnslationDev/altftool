/**
 * Blog Terms and Conditions Generator.
 *
 * The terms page on a blog does two jobs. It states what a reader may do with
 * the writing, and it sets out how a comment section is moderated. The second
 * job is the one that carries legal consequences: the liability shields that
 * protect a site from what its commenters post are conditional, and the
 * conditions are procedural — publish the rules, name a contact, act within a
 * deadline, keep a repeat-infringer policy.
 *
 * Rules the clauses and the maths rest on:
 *  - Copyright. Protection is automatic on creation under the Berne
 *    Convention, and 17 U.S.C. section 106 gives the owner the exclusive
 *    rights to reproduce, adapt, distribute and display. For a US work,
 *    however, 17 U.S.C. section 411(a) requires registration before an
 *    infringement suit can be filed, and the Supreme Court held in Fourth
 *    Estate Public Benefit Corp. v. Wall-Street.com (2019) that registration
 *    means the Copyright Office has acted on the application. Section 412 then
 *    limits statutory damages and attorney fees to works registered before the
 *    infringement began or within three months of first publication.
 *  - DMCA safe harbour, 17 U.S.C. section 512. To rely on the hosting safe
 *    harbour in section 512(c) a site must designate an agent with the
 *    Copyright Office and publish the agent's contact details, act
 *    expeditiously to remove material on a compliant notice, and under section
 *    512(i) adopt and reasonably implement a policy for terminating repeat
 *    infringers. Section 512(g)(2)(C) sets the counter-notice timetable: after
 *    a valid counter-notice the material must be restored not less than 10 and
 *    not more than 14 business days later, unless the complainant files a
 *    court action. Section 512(f) makes a knowing material misrepresentation
 *    in a notice or counter-notice actionable.
 *  - Section 230 of the Communications Decency Act, 47 U.S.C. section 230.
 *    Subsection (c)(1) means the site is not treated as the publisher or
 *    speaker of a commenter's words, and subsection (c)(2) protects
 *    good-faith moderation. Moderating does not forfeit the protection, which
 *    is why a stated moderation policy costs nothing.
 *  - EU Digital Services Act, Regulation (EU) 2022/2065. Article 14 requires
 *    terms and conditions to describe content moderation policies, procedures
 *    and tools in clear, plain and intelligible language. Article 16 requires
 *    a notice and action mechanism, and Article 17 requires a statement of
 *    reasons whenever content is removed or restricted.
 *  - India: section 79 of the Information Technology Act 2000 and the
 *    Information Technology (Intermediary Guidelines and Digital Media Ethics
 *    Code) Rules, 2021. The rules must be published, a grievance officer named,
 *    a complaint acknowledged within 24 hours and disposed of within 15 days,
 *    a court order or government direction acted on within 36 hours, and a
 *    complaint about non-consensual intimate imagery acted on within 24 hours.
 *  - Consumer contract fairness: the UK Consumer Rights Act 2015 Part 2 and
 *    EU Directive 93/13/EEC make a one-sided term unenforceable, and section
 *    65 of the 2015 Act means liability for death or personal injury caused by
 *    negligence can never be excluded.
 *
 * Informational template only, not legal advice.
 */

/** 17 U.S.C. section 512(g)(2)(C): restore between these business-day bounds. */
export const DMCA_RESTORE_MIN_BUSINESS_DAYS = 10;
export const DMCA_RESTORE_MAX_BUSINESS_DAYS = 14;
/** 17 U.S.C. section 412: statutory damages window after first publication. */
export const STATUTORY_DAMAGES_WINDOW_MONTHS = 3;
/** A designated DMCA agent registration lapses unless renewed on this cycle. */
export const DMCA_AGENT_RENEWAL_YEARS = 3;
/** IT Rules 2021: acknowledge a grievance within this many hours. */
export const INDIA_ACK_HOURS = 24;
/** IT Rules 2021: dispose of a grievance within this many days. */
export const INDIA_RESOLVE_DAYS = 15;
/** IT Rules 2021: act on a court order or government direction within this many hours. */
export const INDIA_COURT_ORDER_HOURS = 36;
/** IT Rules 2021: act on a non-consensual intimate imagery complaint within this many hours. */
export const INDIA_NCII_HOURS = 24;
const MAX_FIELD = 160;
const MS_PER_DAY = 86400000;
const MS_PER_HOUR = 3600000;

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

/** Licences a blog can offer readers over its own posts. */
export const CONTENT_LICENCES = [
  {
    id: "all-rights",
    label: "All rights reserved",
    body: "All rights are reserved. You may read, link to and quote briefly from posts with attribution and a link, as fair dealing or fair use allows. You may not republish a whole post, translate it, put it behind your own paywall, or feed it into a product without written permission — asking is free and usually answered yes.",
  },
  {
    id: "cc-by",
    label: "Creative Commons Attribution 4.0",
    body: "Posts are licensed under the Creative Commons Attribution 4.0 International licence. You may copy, redistribute, adapt and build on them, including commercially, provided you credit {{siteName}}, link to the original and indicate any changes. The licence covers the text; images, logos and quoted third-party material are excluded unless they say otherwise.",
  },
  {
    id: "cc-by-nc",
    label: "Creative Commons Attribution-NonCommercial 4.0",
    body: "Posts are licensed under the Creative Commons Attribution-NonCommercial 4.0 International licence. You may copy, redistribute and adapt them for non-commercial purposes with credit to {{siteName}}, a link to the original and a note of any changes. Commercial reuse needs written permission. The licence covers the text; images, logos and quoted third-party material are excluded unless they say otherwise.",
  },
  {
    id: "cc-by-nd",
    label: "Creative Commons Attribution-NoDerivatives 4.0",
    body: "Posts are licensed under the Creative Commons Attribution-NoDerivatives 4.0 International licence. You may copy and redistribute a whole post, in any medium, including commercially, with credit to {{siteName}} and a link to the original — but you may not publish an adapted, abridged or translated version. The licence covers the text; images, logos and quoted third-party material are excluded unless they say otherwise.",
  },
];

/** Facts about the site that make particular clauses necessary. */
export const PRACTICES = [
  { id: "comments", label: "Comments are open" },
  { id: "user-content", label: "Readers can submit posts, images or files" },
  { id: "us", label: "Site or host is in the United States" },
  { id: "eu", label: "Readers in the EU" },
  { id: "india", label: "Site is an intermediary under Indian law" },
  { id: "affiliate", label: "Affiliate links or sponsored posts" },
  { id: "ai-training", label: "You want to state a position on AI training" },
  { id: "paid", label: "Paid membership or subscription" },
  { id: "downloads", label: "Downloadable templates, code or files" },
  { id: "health-finance", label: "Health, legal or financial subject matter" },
];

/** Clause library. */
export const CLAUSES = [
  {
    id: "acceptance",
    title: "Agreeing to these terms",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "These terms govern your use of {{siteName}}, run by {{owner}}. Using the site means accepting them. They were last updated on {{effectiveLong}}; if we change something material we will say so on this page and date it, and continued use after that is acceptance of the new version. Nothing here takes away a right you have as a consumer under the law of the country you live in.",
  },
  {
    id: "our-content",
    title: "What you may do with our writing",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "{{licenceBody}} Copyright arises automatically on creation and nothing on this page waives it beyond what the licence says.",
  },
  {
    id: "enforcement",
    title: "If someone copies a post",
    always: false,
    requiredFor: ["us"],
    weight: 2,
    body: `We register posts we intend to enforce. For a US work, 17 U.S.C. section 411(a) requires registration before an infringement suit can be filed, and the Supreme Court confirmed in Fourth Estate Public Benefit Corp. v. Wall-Street.com that this means the Copyright Office has acted on the application, not merely received it. Section 412 limits statutory damages and attorney fees to works registered before the infringement began or within ${STATUTORY_DAMAGES_WINDOW_MONTHS} months of first publication — for material first published on {{publicationLong}} that window closes on {{statutoryDeadlineLong}}.`,
  },
  {
    id: "ai-training",
    title: "Text and data mining, and AI training",
    always: false,
    requiredFor: ["ai-training"],
    weight: 2,
    body: "{{aiBody}}",
  },
  {
    id: "your-content",
    title: "What happens to what you post",
    always: false,
    requiredFor: ["comments", "user-content"],
    weight: 3,
    body: "You keep the copyright in your comment or submission. By posting it you give us a non-exclusive, worldwide, royalty-free licence to display it on the site, to include it in an archive or an email digest of the post it belongs to, and to quote it in a later article with attribution to the name you used. That licence lasts as long as the post is published; ask us to delete your comment and we will, and the licence ends with it. You confirm the words are yours, that you have the right to post any image or quotation in them, and that they do not contain someone else's personal data.",
  },
  {
    id: "comment-rules",
    title: "Comment rules",
    always: false,
    requiredFor: ["comments"],
    weight: 3,
    body: "Comments are for adding to the article. We remove: abuse and harassment aimed at a person, threats, doxxing, spam and link-dropping, content that infringes copyright, impersonation, and anything unlawful. We do not remove a comment for disagreeing with the post, for criticising us, or for being blunt. Off-topic promotion is removed rather than argued with. Repeat breaches lose posting access.",
  },
  {
    id: "moderation-process",
    title: "How moderation actually works",
    always: false,
    requiredFor: ["comments", "user-content", "eu"],
    weight: 3,
    body: `Comments are checked by {{moderationMethod}}. Anyone can report a comment using the report link or by writing to {{contact}}. When we remove or restrict something we tell the person who posted it what was removed, why, which rule it broke, and how to challenge the decision — Article 17 of the EU Digital Services Act calls that a statement of reasons, and we do it for everyone rather than by region. Article 14 of the same Regulation is why this section exists at all: moderation policies and tools have to be described in the terms in plain language. Appeals go to {{contact}} and are answered by a person.`,
  },
  {
    id: "section-230",
    title: "Who is responsible for a comment",
    always: false,
    requiredFor: ["comments", "us"],
    weight: 2,
    body: "A comment is the view of the person who wrote it, not ours. Under 47 U.S.C. section 230(c)(1) an interactive computer service is not treated as the publisher or speaker of information provided by someone else, and section 230(c)(2) protects good-faith removal of material we consider objectionable. Moderating does not make us the author of what we leave up. If a comment defames you, the claim lies against its author, and we will act on a court order.",
  },
  {
    id: "dmca",
    title: "Copyright complaints",
    always: false,
    requiredFor: ["us"],
    weight: 3,
    body: `Send a copyright complaint to our designated agent at {{dmcaAgent}}. To be effective under 17 U.S.C. section 512(c)(3) it must identify the work, identify the material and where it is, give your contact details, state that you believe in good faith that the use is not authorised, state that the information is accurate and — under penalty of perjury — that you are authorised to act for the owner, and be signed. We act expeditiously on a compliant notice and tell the person who posted the material. We keep a repeat infringer policy and terminate accounts under it, as section 512(i) requires. A knowing material misrepresentation in a notice is actionable under section 512(f), so do not send one about material you do not own. Our agent registration is renewed every ${DMCA_AGENT_RENEWAL_YEARS} years, which the Copyright Office requires to keep it valid.`,
  },
  {
    id: "counter-notice",
    title: "Counter-notice and restoration",
    always: false,
    requiredFor: ["us"],
    weight: 3,
    body: `If your material was removed and you believe that was a mistake or a misidentification, send a counter-notice to {{dmcaAgent}} with your name, address, phone number, the material and its former location, a statement under penalty of perjury that you have a good faith belief it was removed by mistake, and your consent to the jurisdiction of the federal court for your district. We forward it to the complainant. Section 512(g)(2)(C) then requires the material to be restored not less than ${DMCA_RESTORE_MIN_BUSINESS_DAYS} and not more than ${DMCA_RESTORE_MAX_BUSINESS_DAYS} business days later unless the complainant tells us they have filed a court action — for a counter-notice dated {{counterNoticeLong}} that window runs from {{restoreEarliestLong}} to {{restoreLatestLong}}.`,
  },
  {
    id: "india-grievance",
    title: "Grievance officer and statutory timelines",
    always: false,
    requiredFor: ["india"],
    weight: 3,
    body: `Our grievance officer is {{grievanceOfficer}}, contactable at {{contact}}. Under the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 we acknowledge a complaint within ${INDIA_ACK_HOURS} hours and dispose of it within ${INDIA_RESOLVE_DAYS} days; we act on a court order or a government direction within ${INDIA_COURT_ORDER_HOURS} hours; and we remove non-consensual intimate imagery within ${INDIA_NCII_HOURS} hours of a complaint. For a complaint received on {{complaintLong}} that means acknowledgement by {{ackByLong}}, a court order actioned by {{courtOrderByLong}}, and disposal by {{resolveByLong}}. These rules and this page are published so that section 79 of the Information Technology Act 2000 continues to apply to us.`,
  },
  {
    id: "acceptable-use",
    title: "Things you may not do to the site",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "Do not scrape at a rate that degrades the site, bypass rate limits or paywalls, probe for vulnerabilities without asking us first, upload malware, or use the site to send unsolicited messages. Reasonable, well-behaved crawling that respects robots.txt is fine. If you want a bulk copy of something, ask — it is usually easier for both of us than scraping.",
  },
  {
    id: "downloads",
    title: "Downloads, code and templates",
    always: false,
    requiredFor: ["downloads"],
    weight: 2,
    body: "Files offered for download come with the licence stated next to them, and where a file contains code that licence governs the code. They are provided as is, without warranty of any kind. Test anything before you rely on it, and read the licence of any third-party component included.",
  },
  {
    id: "affiliate",
    title: "Affiliate links and sponsored posts",
    always: false,
    requiredFor: ["affiliate"],
    weight: 3,
    body: "Some links earn us a commission and some posts are paid placements. Both are labelled at the top of the post and next to the link, because the FTC's Endorsement Guides at 16 CFR Part 255 require a material connection to be disclosed clearly and conspicuously. A commission never buys a recommendation, and a sponsor does not see a post before publication unless the label says so.",
  },
  {
    id: "no-advice",
    title: "This is writing, not advice",
    always: false,
    requiredFor: ["health-finance"],
    weight: 3,
    body: "Articles here are general information. They are not medical, legal, tax or financial advice, no professional relationship is created by reading them, and your situation may differ in ways the article does not consider. Speak to a qualified professional before acting, and treat anything time-sensitive — a rate, a limit, a dosage, a deadline — as needing verification against the current source.",
  },
  {
    id: "paid",
    title: "Paid membership",
    always: false,
    requiredFor: ["paid"],
    weight: 3,
    body: "A paid subscription renews automatically until cancelled, and you can cancel at any time from your account page with effect from the end of the current period. Where you are a consumer in the EU or UK you have a 14-day right to withdraw from a distance contract, which you lose for digital content once supply has begun with your express consent and acknowledgement. If we withdraw the paid tier we refund the unused part of the period.",
  },
  {
    id: "third-party-links",
    title: "Links to other sites",
    always: true,
    requiredFor: [],
    weight: 1,
    body: "Links to other sites are there because they were useful when the post was written. We do not control them, we are not responsible for what they say now, and a link is not an endorsement. Their terms and privacy notices apply once you leave.",
  },
  {
    id: "availability",
    title: "Availability and changes",
    always: true,
    requiredFor: [],
    weight: 1,
    body: "The site is offered as it is. We may change, move or remove a post, close comments on an old article, or take the site down for maintenance, without notice. We try to keep old URLs working and to redirect rather than delete, because a broken link is somebody's citation.",
  },
  {
    id: "liability",
    title: "Liability",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "We are liable for loss caused by our own breach of these terms or our negligence where that loss was foreseeable. We are not liable for indirect or consequential loss, lost profits, or loss caused by your reliance on general information without professional advice. Nothing in these terms excludes or limits liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be excluded — section 65 of the UK Consumer Rights Act 2015 is the clearest statement of that, and we apply it generally.",
  },
  {
    id: "governing-law",
    title: "Governing law and disputes",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "These terms are governed by the law of {{jurisdiction}}. If you are a consumer, this does not deprive you of the protection of the mandatory rules of the country where you live, and you may bring proceedings in the courts of that country. Talk to us first at {{contact}} — most disputes about a blog turn out to be a misunderstanding about a sentence.",
  },
];

const CLAUSE_BY_ID = new Map(CLAUSES.map((clause) => [clause.id, clause]));
const LICENCE_BY_ID = new Map(CONTENT_LICENCES.map((entry) => [entry.id, entry]));

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

function formatStampWithTime(stamp) {
  const date = new Date(stamp);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()} at ${hours}:${minutes} UTC`;
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
 * Add business days, Monday to Friday. Public holidays vary by state and are
 * not deducted, so the result is the earliest possible date.
 * @param {number} stamp
 * @param {number} days
 * @returns {number}
 */
export function addBusinessDays(stamp, days) {
  if (!Number.isFinite(days) || days < 0) return stamp;
  let remaining = Math.floor(days);
  let cursor = stamp;
  while (remaining > 0) {
    cursor += MS_PER_DAY;
    const weekday = new Date(cursor).getUTCDay();
    if (weekday !== 0 && weekday !== 6) remaining -= 1;
  }
  return cursor;
}

/**
 * Work out the deadlines a comment section is subject to.
 *
 * statutoryDamagesDeadline = first publication + 3 months (17 U.S.C. 412)
 * restore window           = counter-notice + 10 to 14 business days (512(g)(2)(C))
 * grievance acknowledgement = complaint + 24 hours (IT Rules 2021)
 * court order compliance    = complaint + 36 hours
 * grievance disposal        = complaint + 15 days
 *
 * @param {object} input
 * @param {string} input.publicationDate  yyyy-mm-dd
 * @param {string} input.counterNoticeDate yyyy-mm-dd
 * @param {string} input.complaintDate     yyyy-mm-dd
 * @returns {{statutoryDeadlineLong:string, restoreEarliestLong:string, restoreLatestLong:string,
 *            ackByLong:string, courtOrderByLong:string, resolveByLong:string,
 *            nciiByLong:string}|{error:string}}
 */
export function computeModerationDeadlines({ publicationDate, counterNoticeDate, complaintDate }) {
  const publication = parseIsoDate(publicationDate);
  if (publication === null) return { error: "Enter a valid first-publication date." };
  const counter = parseIsoDate(counterNoticeDate);
  if (counter === null) return { error: "Enter a valid counter-notice date." };
  const complaint = parseIsoDate(complaintDate);
  if (complaint === null) return { error: "Enter a valid complaint date." };

  return {
    statutoryDeadlineLong: formatStamp(addMonths(publication, STATUTORY_DAMAGES_WINDOW_MONTHS)),
    restoreEarliestLong: formatStamp(addBusinessDays(counter, DMCA_RESTORE_MIN_BUSINESS_DAYS)),
    restoreLatestLong: formatStamp(addBusinessDays(counter, DMCA_RESTORE_MAX_BUSINESS_DAYS)),
    ackByLong: formatStampWithTime(complaint + INDIA_ACK_HOURS * MS_PER_HOUR),
    courtOrderByLong: formatStampWithTime(complaint + INDIA_COURT_ORDER_HOURS * MS_PER_HOUR),
    nciiByLong: formatStampWithTime(complaint + INDIA_NCII_HOURS * MS_PER_HOUR),
    resolveByLong: formatStamp(complaint + INDIA_RESOLVE_DAYS * MS_PER_DAY),
  };
}

/**
 * Clauses this site needs.
 * @param {string[]} practices Ids from PRACTICES.
 * @returns {object[]}
 */
export function requiredClauses(practices = []) {
  const set = new Set(practices);
  return CLAUSES.filter(
    (clause) => clause.always || clause.requiredFor.some((id) => set.has(id)),
  );
}

/**
 * Assemble the terms and score them.
 *
 * @returns {{terms:string, coveragePercent:number, missing:object[], warnings:string[],
 *            deadlines:object, wordCount:number, included:object[]}|{error:string}}
 */
export function buildBlogTerms({
  siteName,
  ownerName,
  contactEmail,
  jurisdiction,
  licenceId = "all-rights",
  moderationMethod = "a person, with an automatic spam filter running first",
  dmcaAgent = "",
  grievanceOfficer = "",
  aiTrainingAllowed = false,
  effectiveDate,
  publicationDate,
  counterNoticeDate,
  complaintDate,
  practices = [],
  includedIds = [],
}) {
  if (!Array.isArray(practices) || !Array.isArray(includedIds)) {
    return { error: "Practice and clause selections must be given as lists." };
  }
  const unknown = includedIds.find((id) => !CLAUSE_BY_ID.has(id));
  if (unknown) return { error: `Unknown clause: ${unknown}.` };

  const licence = LICENCE_BY_ID.get(licenceId);
  if (!licence) return { error: "Choose a licence for your own posts." };

  const site = clean(siteName);
  const owner = clean(ownerName);
  const contact = clean(contactEmail);
  const law = clean(jurisdiction);
  if (!site) return { error: "Enter the site name." };
  if (!owner) return { error: "Enter who runs the site." };
  if (!contact) return { error: "Enter a contact address for reports and appeals." };
  if (!law) return { error: "Enter the governing law — a country or a state." };
  if ([site, owner, contact, law].some((value) => value.length > MAX_FIELD)) {
    return { error: `Keep each field under ${MAX_FIELD} characters.` };
  }

  const effective = parseIsoDate(effectiveDate);
  if (effective === null) return { error: "Enter a valid last-updated date." };

  const deadlines = computeModerationDeadlines({
    publicationDate,
    counterNoticeDate,
    complaintDate,
  });
  if (deadlines.error) return { error: deadlines.error };

  const set = new Set(practices);
  if (set.has("us") && includedIds.includes("dmca") && !clean(dmcaAgent)) {
    return {
      error:
        "Enter the designated DMCA agent's contact details — the safe harbour in 17 U.S.C. section 512(c) is only available if the agent is named and registered.",
    };
  }
  if (set.has("india") && includedIds.includes("india-grievance") && !clean(grievanceOfficer)) {
    return {
      error:
        "Enter the grievance officer's name — the IT Rules 2021 require it to be published on the site.",
    };
  }

  const included = CLAUSES.filter((clause) => includedIds.includes(clause.id));
  if (included.length === 0) {
    return { error: "Include at least one clause — empty terms are worse than none." };
  }

  const aiBody = aiTrainingAllowed
    ? `Text and data mining of the posts on ${site}, including for training machine learning models, is permitted on the same conditions as the content licence above: keep the attribution, and do not present output as our writing. We do not treat a crawl for this purpose as a breach of these terms, and we do not set a machine-readable reservation of rights against it.`
    : `We reserve our rights against text and data mining, including the collection of these posts to train machine learning models. Article 4(3) of EU Directive 2019/790 allows a rightsholder to reserve those rights expressly, and in a machine-readable form for material available online — this clause is that reservation, and it is mirrored in our robots.txt and in the site metadata. Permission for research or model training can be given, and is sometimes given free, but it has to be asked for.`;

  const values = {
    siteName: site,
    owner,
    contact,
    jurisdiction: law,
    licenceBody: licence.body.split("{{siteName}}").join(site),
    moderationMethod: clean(moderationMethod),
    dmcaAgent: clean(dmcaAgent) || contact,
    grievanceOfficer: clean(grievanceOfficer) || owner,
    aiBody,
    effectiveLong: formatStamp(effective),
    publicationLong: formatStamp(parseIsoDate(publicationDate)),
    statutoryDeadlineLong: deadlines.statutoryDeadlineLong,
    counterNoticeLong: formatStamp(parseIsoDate(counterNoticeDate)),
    restoreEarliestLong: deadlines.restoreEarliestLong,
    restoreLatestLong: deadlines.restoreLatestLong,
    complaintLong: formatStamp(parseIsoDate(complaintDate)),
    ackByLong: deadlines.ackByLong,
    courtOrderByLong: deadlines.courtOrderByLong,
    resolveByLong: deadlines.resolveByLong,
  };

  const fill = (text) =>
    Object.keys(values).reduce((acc, key) => acc.split(`{{${key}}}`).join(values[key]), text);

  const required = requiredClauses(practices);
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
        ? "Every set of site terms needs this clause."
        : `Needed because: ${clause.requiredFor
            .filter((id) => set.has(id))
            .map((id) => PRACTICES.find((entry) => entry.id === id)?.label ?? id)
            .join("; ")}.`,
    }));

  const warnings = [];
  if (set.has("us") && (set.has("comments") || set.has("user-content")) && !includedIds.includes("dmca")) {
    warnings.push(
      "You host material posted by other people but have no copyright complaints clause. The safe harbour in 17 U.S.C. section 512(c) requires a designated agent registered with the Copyright Office and published on the site — without it you are liable for what commenters upload.",
    );
  }
  if (includedIds.includes("dmca") && !includedIds.includes("counter-notice")) {
    warnings.push(
      "A takedown route with no counter-notice route is one-sided and does not match section 512(g), which requires you to restore material 10 to 14 business days after a valid counter-notice unless a court action is filed.",
    );
  }
  if (set.has("eu") && !includedIds.includes("moderation-process")) {
    warnings.push(
      "Article 14 of the EU Digital Services Act requires the terms to describe content moderation policies, procedures and tools in clear, plain language.",
    );
  }
  if (set.has("india") && !includedIds.includes("india-grievance")) {
    warnings.push(
      "Publishing the rules and naming a grievance officer is what keeps section 79 of the Information Technology Act 2000 available to an intermediary in India.",
    );
  }
  if (set.has("health-finance") && !includedIds.includes("no-advice")) {
    warnings.push(
      "Health, legal and financial writing needs an explicit statement that it is general information, not advice, and that no professional relationship is created.",
    );
  }
  if (set.has("affiliate") && !includedIds.includes("affiliate")) {
    warnings.push(
      "Affiliate and sponsored content must be disclosed clearly and conspicuously under the FTC Endorsement Guides at 16 CFR Part 255 — a line in the terms is not enough on its own, but its absence is a gap.",
    );
  }

  const lines = [
    `${site} — Terms and Conditions`,
    `Run by ${owner}. Last updated ${formatStamp(effective)}.`,
    "",
  ];
  included.forEach((clause, index) => {
    lines.push(`${index + 1}. ${clause.title}`);
    lines.push(fill(clause.body));
    lines.push("");
  });
  lines.push(`Questions about these terms go to ${contact}.`);

  const terms = lines.join("\n");

  return {
    terms,
    coveragePercent,
    missing,
    warnings,
    deadlines,
    wordCount: terms.split(/\s+/).filter(Boolean).length,
    included: included.map((clause) => ({ id: clause.id, title: clause.title })),
  };
}
