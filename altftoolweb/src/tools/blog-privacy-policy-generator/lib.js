/**
 * Blog Privacy Policy Generator.
 *
 * Most blog privacy policies are copied from a template that describes data a
 * blog does not collect and omits the two things that actually apply: the
 * cookie consent rule, which is separate from the GDPR lawful basis, and the
 * per-purpose lawful basis for analytics, comments and a mailing list.
 *
 * Rules the sections rest on:
 *  - GDPR, Regulation (EU) 2016/679. Article 13 lists what must be told to a
 *    person at the point their data is collected: identity of the controller,
 *    purposes, lawful basis, recipients, transfers, retention, and their
 *    rights. Article 6 sets the lawful bases; for a blog the realistic ones
 *    are consent (Article 6(1)(a)) and legitimate interests (Article 6(1)(f)).
 *    Article 7 requires consent to be as easy to withdraw as to give. Articles
 *    15 to 22 set the access, rectification, erasure, restriction, portability
 *    and objection rights. Article 33 requires notification of a personal data
 *    breach to the supervisory authority within 72 hours where it is likely to
 *    result in a risk to individuals.
 *  - ePrivacy Directive 2002/58/EC, Article 5(3), implemented in the UK by the
 *    Privacy and Electronic Communications Regulations 2003: storing or
 *    accessing information on a user's device needs prior consent unless it is
 *    strictly necessary to deliver a service the user requested. Analytics
 *    cookies, ad cookies and third-party embeds are not strictly necessary, so
 *    they need consent before they load, regardless of which GDPR lawful basis
 *    is claimed.
 *  - California Consumer Privacy Act as amended by the CPRA, Cal. Civ. Code
 *    section 1798.100 and following. It applies to a for-profit business that
 *    meets one of three thresholds: annual gross revenue over 25 million US
 *    dollars, buying selling or sharing the personal information of 100,000 or
 *    more consumers or households in a year, or deriving 50% or more of annual
 *    revenue from selling or sharing personal information. Where it applies, a
 *    notice at collection, the right to know, delete, correct and opt out, and
 *    recognition of an opt-out preference signal such as Global Privacy
 *    Control are all required.
 *  - India's Digital Personal Data Protection Act 2023: an itemised notice and,
 *    in most website settings, consent; the right to access, correction,
 *    erasure and grievance redressal; and verifiable parental consent before
 *    processing a child's personal data.
 *  - CAN-SPAM Act, 15 U.S.C. section 7701 and the FTC Rule at 16 CFR Part 316:
 *    a commercial email needs accurate headers, a non-deceptive subject line, a
 *    valid physical postal address and a working opt-out that is honoured
 *    within 10 business days.
 *  - COPPA Rule, 16 CFR Part 312: verifiable parental consent before
 *    collecting personal information online from a child under 13. GDPR
 *    Article 8 sets the digital consent age at 16, and lets member states
 *    lower it to no less than 13.
 *
 * Informational template only, not legal advice.
 */

/** CCPA applicability thresholds, Cal. Civ. Code section 1798.140(d)(1). */
export const CCPA_REVENUE_THRESHOLD_USD = 25000000;
export const CCPA_CONSUMER_THRESHOLD = 100000;
export const CCPA_REVENUE_SHARE_THRESHOLD_PERCENT = 50;
/** GDPR Article 33 breach notification deadline. */
export const GDPR_BREACH_HOURS = 72;
/** CAN-SPAM opt-out deadline, 15 U.S.C. section 7704(a)(4). */
export const CANSPAM_OPTOUT_BUSINESS_DAYS = 10;
/** GDPR Article 8 default digital consent age. */
export const GDPR_CHILD_AGE = 16;
/** COPPA age threshold, 16 CFR Part 312. */
export const COPPA_AGE = 13;
/** Default analytics retention. GA4 offers 2 or 14 months on the standard tier. */
export const DEFAULT_ANALYTICS_MONTHS = 14;
const MAX_RETENTION_MONTHS = 120;
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

/** What the blog actually does. Each toggle pulls in the sections it requires. */
export const PRACTICES = [
  { id: "server-logs", label: "Web host keeps server access logs" },
  { id: "analytics-cookie", label: "Cookie-based analytics (Google Analytics or similar)" },
  { id: "analytics-cookieless", label: "Cookieless analytics (Plausible, Fathom or similar)" },
  { id: "comments", label: "Readers can post comments" },
  { id: "gravatar", label: "Comment avatars come from Gravatar" },
  { id: "newsletter", label: "Email newsletter signup" },
  { id: "contact-form", label: "Contact form" },
  { id: "ads", label: "Display advertising" },
  { id: "affiliate", label: "Affiliate links" },
  { id: "embeds", label: "Third-party embeds (video, maps, social)" },
  { id: "eu", label: "Readers in the EU or UK" },
  { id: "california", label: "Readers in California" },
  { id: "india", label: "Readers in India" },
  { id: "children", label: "Audience may include children" },
];

/** Cookie categories used by the consent assessment. */
const CONSENT_TRIGGERING = ["analytics-cookie", "ads", "embeds", "gravatar"];

/**
 * Policy sections. `always` means every blog policy needs it; `requiredFor`
 * lists practice ids that make an otherwise optional section necessary.
 */
export const SECTIONS = [
  {
    id: "who-we-are",
    title: "Who we are and how to reach us",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "{{site}} is run by {{owner}}. For anything about your personal data, including a request to see, correct or delete it, write to {{contact}}. {{owner}} decides why and how your data is used, which makes it the controller for the purposes of the GDPR and the data fiduciary under India's Digital Personal Data Protection Act 2023.",
  },
  {
    id: "what-we-collect",
    title: "What we collect and why",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "{{collectionSummary}} We do not collect anything else about you, we do not build advertising profiles ourselves, and we do not ask for data we have no use for.",
  },
  {
    id: "lawful-basis",
    title: "The lawful basis for each purpose",
    always: false,
    requiredFor: ["eu"],
    weight: 3,
    body: "Under Article 6 of the GDPR every purpose needs a lawful basis. {{lawfulBasisSummary}} Where we rely on consent you may withdraw it at any time and it is as easy to withdraw as it was to give, as Article 7(3) requires. Where we rely on legitimate interests you may object under Article 21 and we will stop unless we can show compelling grounds.",
  },
  {
    id: "server-logs",
    title: "Server logs",
    always: false,
    requiredFor: ["server-logs"],
    weight: 2,
    body: "Our web host records each request to the site: the IP address, the time, the page requested, the referring page and the browser user-agent string. These logs exist to keep the site running and to investigate abuse and outages, and they are kept for {{logMonths}} months and then deleted. We do not use them to identify individual readers.",
  },
  {
    id: "analytics-cookie",
    title: "Analytics",
    always: false,
    requiredFor: ["analytics-cookie"],
    weight: 3,
    body: "We use cookie-based analytics to see which articles are read and where readers arrive from. This sets cookies on your device and shares a pseudonymous identifier, your approximate location derived from your IP address and your page views with the analytics provider. Because these cookies are not strictly necessary, they load only after you agree in the consent banner, as Article 5(3) of the ePrivacy Directive requires. Analytics data is retained for {{analyticsMonths}} months. You can withdraw consent at any time from the consent link in the footer.",
  },
  {
    id: "analytics-cookieless",
    title: "Analytics without cookies",
    always: false,
    requiredFor: ["analytics-cookieless"],
    weight: 2,
    body: "We use privacy-focused analytics that set no cookies and store no identifier on your device. It records the page viewed, the referring site, the country and the device type, all in aggregate. Because nothing is stored on or read from your device, the consent rule in Article 5(3) of the ePrivacy Directive does not apply, but we still need a lawful basis under the GDPR and rely on our legitimate interest in understanding which articles are useful. Aggregate figures are kept for {{analyticsMonths}} months.",
  },
  {
    id: "comments",
    title: "Comments",
    always: false,
    requiredFor: ["comments"],
    weight: 3,
    body: "If you leave a comment we store the name and email address you type, the comment itself, the time, your IP address and your browser user-agent string. The name and comment are published; the email address and IP are not, and are used to reply to you, to moderate and to catch spam. Comments and their metadata are kept for {{commentMonths}} months after publication unless you ask us to remove them sooner. Do not put personal information about anyone else in a comment.",
  },
  {
    id: "gravatar",
    title: "Comment avatars",
    always: false,
    requiredFor: ["gravatar"],
    weight: 2,
    body: "When you comment, a hashed version of your email address is sent to the Gravatar service so an avatar can be shown if you have one. The hash is derived from your address and is sent whether or not you have a Gravatar account. This is a third-party request from your browser, so it happens only after you agree in the consent banner. Gravatar's own privacy notice covers what it does with the hash.",
  },
  {
    id: "newsletter",
    title: "Newsletter",
    always: false,
    requiredFor: ["newsletter"],
    weight: 3,
    body: "If you subscribe we store your email address, the date you subscribed, the page you subscribed from and your confirmation. We use it only to send {{newsletterName}} and never sell or rent the list. Every email carries a working unsubscribe link and our postal address, and an unsubscribe request is honoured within {{optOutDays}} business days, which is the deadline in the CAN-SPAM Act at 15 U.S.C. section 7704(a)(4). We keep your address until you unsubscribe, and for {{suppressionMonths}} months afterwards on a suppression list so that we do not email you again by accident.",
  },
  {
    id: "email-tracking",
    title: "Open and click tracking in email",
    always: false,
    requiredFor: ["newsletter"],
    weight: 2,
    body: "{{emailTrackingBody}}",
  },
  {
    id: "contact-form",
    title: "Contact form",
    always: false,
    requiredFor: ["contact-form"],
    weight: 2,
    body: "A message sent through the contact form reaches us by email and is kept for {{contactMonths}} months so we can follow up and keep a record of what was agreed. We use it only to answer you. Please do not send sensitive information — health, financial or identity documents — through a web form.",
  },
  {
    id: "ads",
    title: "Advertising",
    always: false,
    requiredFor: ["ads"],
    weight: 3,
    body: "We show advertising supplied by third parties. Those providers may set cookies or similar identifiers to measure and target ads, which is not strictly necessary and therefore loads only after you agree in the consent banner. Under the California Consumer Privacy Act, sharing personal information for cross-context behavioural advertising counts as sharing even where no money changes hands, so Californian readers can opt out. We do not control what an ad provider does with data it collects; read its own notice.",
  },
  {
    id: "affiliate",
    title: "Affiliate links",
    always: false,
    requiredFor: ["affiliate"],
    weight: 2,
    body: "Some links to products are affiliate links, which means we may earn a commission if you buy. Following one sets a cookie or passes an identifier on the merchant's site so the referral can be attributed; that happens on the merchant's side and is covered by their privacy notice. Affiliate links are marked, and a commission never changes what we recommend.",
  },
  {
    id: "embeds",
    title: "Embedded content from other sites",
    always: false,
    requiredFor: ["embeds"],
    weight: 2,
    body: "Articles sometimes embed video, maps or social posts. An embed behaves exactly as if you had visited the other site: it can see your IP address, set cookies and track your interaction with it, even if you do not click. Embeds load only after you agree in the consent banner, and where possible we use privacy-enhanced or click-to-load versions.",
  },
  {
    id: "cookies",
    title: "Cookies and consent",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "{{consentBody}} You can change or withdraw your choice at any time from the cookie settings link in the footer, and you can block or delete cookies in your browser, though strictly necessary ones are needed for the site to work.",
  },
  {
    id: "sharing",
    title: "Who we share data with",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "We share personal data only with the service providers that run this site — {{processors}} — and only so they can provide their service to us. They act on our instructions under a written contract, as Article 28 of the GDPR requires. We do not sell personal data. We disclose data to a public authority only where the law requires it and, where we are allowed to, we tell you first.",
  },
  {
    id: "transfers",
    title: "International transfers",
    always: false,
    requiredFor: ["eu"],
    weight: 2,
    body: "Some of our providers are outside the EEA and the UK, which means your data may be transferred there. Where that happens we rely on an adequacy decision where one covers the provider, and otherwise on the Standard Contractual Clauses adopted by the European Commission together with a transfer risk assessment, as Chapter V of the GDPR requires. We will tell you which mechanism applies to a specific provider if you ask.",
  },
  {
    id: "retention",
    title: "How long we keep things",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "{{retentionSummary}} When a period ends, data is deleted or irreversibly anonymised. We do not keep anything because it might be useful one day.",
  },
  {
    id: "rights-gdpr",
    title: "Your rights",
    always: false,
    requiredFor: ["eu"],
    weight: 3,
    body: "You can ask us for a copy of your data (Article 15), to correct it (Article 16), to delete it (Article 17), to restrict how we use it (Article 18), to receive it in a portable format (Article 20), and to object to processing based on legitimate interests (Article 21). Write to {{contact}} and we will answer within one month, extendable by two further months for complex requests. We do not charge for this unless a request is manifestly unfounded or excessive. If you are not satisfied you can complain to your national supervisory authority.",
  },
  {
    id: "rights-ccpa",
    title: "Notice for California readers",
    always: false,
    requiredFor: ["california"],
    weight: 3,
    body: "{{ccpaBody}}",
  },
  {
    id: "rights-india",
    title: "Notice for readers in India",
    always: false,
    requiredFor: ["india"],
    weight: 2,
    body: "Under the Digital Personal Data Protection Act 2023 you may ask us for a summary of the personal data we process about you and what we do with it, ask for correction, completion, updating or erasure, and nominate someone to exercise those rights if you die or become incapacitated. Write to {{contact}}, which is also our grievance redressal contact. If we do not resolve your grievance you may complain to the Data Protection Board of India. Where we rely on consent you may withdraw it at any time, and withdrawal does not affect what we did before.",
  },
  {
    id: "children",
    title: "Children",
    always: false,
    requiredFor: ["children"],
    weight: 3,
    body: `This site is not aimed at children and we do not knowingly collect personal information from a child under ${COPPA_AGE} without verifiable parental consent, which the Children's Online Privacy Protection Rule at 16 CFR Part 312 requires. Article 8 of the GDPR sets the age for a child's own consent to information society services at ${GDPR_CHILD_AGE}, and lets member states lower it to no less than ${COPPA_AGE}. India's Digital Personal Data Protection Act 2023 requires verifiable consent from a parent or guardian before a child's personal data is processed. If you believe a child has given us data, write to {{contact}} and we will delete it.`,
  },
  {
    id: "security",
    title: "Security and what happens after a breach",
    always: true,
    requiredFor: [],
    weight: 2,
    body: `The site is served over HTTPS, administrative accounts use multi-factor authentication, and access to reader data is limited to the people who need it. No system is perfectly secure. If a personal data breach happens and it is likely to result in a risk to you, we will notify the supervisory authority within ${GDPR_BREACH_HOURS} hours of becoming aware of it, as Article 33 of the GDPR requires, and tell you directly where the risk is high.`,
  },
  {
    id: "changes",
    title: "Changes to this policy",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "This policy was last updated on {{effectiveLong}} and is reviewed at least every {{reviewMonths}} months, next by {{reviewByLong}}. If we change something that affects you materially — a new purpose, a new recipient, a longer retention period — we will say so on the site before the change takes effect, and where the change needs consent we will ask again.",
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
 * Does the CCPA apply? A for-profit business that does business in California
 * qualifies if it meets any one of the three thresholds in Cal. Civ. Code
 * section 1798.140(d)(1).
 *
 * @param {object} input
 * @param {number} input.annualRevenueUsd
 * @param {number} input.consumersPerYear Consumers or households whose data is bought, sold or shared.
 * @param {number} input.revenueShareFromSellingPercent
 * @returns {{applies:boolean, reasons:string[]}|{error:string}}
 */
export function assessCcpa({
  annualRevenueUsd = 0,
  consumersPerYear = 0,
  revenueShareFromSellingPercent = 0,
}) {
  const revenue = Number(annualRevenueUsd);
  const consumers = Number(consumersPerYear);
  const share = Number(revenueShareFromSellingPercent);
  if (!Number.isFinite(revenue) || revenue < 0) {
    return { error: "Annual revenue must be zero or more." };
  }
  if (!Number.isFinite(consumers) || consumers < 0) {
    return { error: "The number of consumers must be zero or more." };
  }
  if (!Number.isFinite(share) || share < 0 || share > 100) {
    return { error: "The share of revenue from selling or sharing data must be between 0% and 100%." };
  }

  const reasons = [];
  if (revenue > CCPA_REVENUE_THRESHOLD_USD) {
    reasons.push(
      `annual gross revenue above USD ${CCPA_REVENUE_THRESHOLD_USD.toLocaleString("en-US")}`,
    );
  }
  if (consumers >= CCPA_CONSUMER_THRESHOLD) {
    reasons.push(
      `personal information of ${CCPA_CONSUMER_THRESHOLD.toLocaleString("en-US")} or more consumers or households bought, sold or shared in a year`,
    );
  }
  if (share >= CCPA_REVENUE_SHARE_THRESHOLD_PERCENT) {
    reasons.push(
      `${CCPA_REVENUE_SHARE_THRESHOLD_PERCENT}% or more of annual revenue from selling or sharing personal information`,
    );
  }
  return { applies: reasons.length > 0, reasons };
}

/**
 * Does anything on the page need prior consent under Article 5(3) of the
 * ePrivacy Directive? Only storing or reading information on the device
 * triggers it — cookieless analytics does not.
 *
 * @param {string[]} practices Ids from PRACTICES.
 * @returns {{required:boolean, triggers:string[], why:string}}
 */
export function assessCookieConsent(practices = []) {
  const set = new Set(practices);
  const triggers = CONSENT_TRIGGERING.filter((id) => set.has(id)).map(
    (id) => PRACTICES.find((entry) => entry.id === id)?.label ?? id,
  );
  if (triggers.length === 0) {
    return {
      required: false,
      triggers,
      why: "Nothing on the site stores or reads information on the reader's device beyond what is strictly necessary, so Article 5(3) of the ePrivacy Directive does not require a consent banner. A lawful basis under GDPR Article 6 is still needed for any personal data you process.",
    };
  }
  return {
    required: true,
    triggers,
    why: `Prior consent is required before these load, because they store or read information on the reader's device and are not strictly necessary: ${triggers.join(", ")}. Article 5(3) of the ePrivacy Directive applies here regardless of which GDPR lawful basis you claim, so the scripts must not run until the reader agrees.`,
  };
}

/**
 * Sections this blog needs.
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
  if (
    !Number.isFinite(months) ||
    !Number.isInteger(months) ||
    months < 1 ||
    months > MAX_RETENTION_MONTHS
  ) {
    return `${label} must be a whole number of months between 1 and ${MAX_RETENTION_MONTHS}.`;
  }
  return null;
}

/**
 * Assemble the policy and score how much of what this blog needs is covered.
 *
 * Completeness = weight of required sections included / total weight of
 * required sections, as a whole percentage.
 *
 * @returns {{policy:string, completenessPercent:number, missing:object[], warnings:string[],
 *            consent:object, ccpa:object, reviewByLong:string, wordCount:number,
 *            included:object[]}|{error:string}}
 */
export function buildBlogPrivacyPolicy({
  siteName,
  ownerName,
  contactEmail,
  newsletterName = "the newsletter",
  processors = "our web host, our email provider and our analytics provider",
  effectiveDate,
  reviewMonths = 12,
  logMonths = 12,
  analyticsMonths = DEFAULT_ANALYTICS_MONTHS,
  commentMonths = 60,
  contactMonths = 24,
  suppressionMonths = 36,
  emailTracking = true,
  annualRevenueUsd = 0,
  consumersPerYear = 0,
  revenueShareFromSellingPercent = 0,
  practices = [],
  includedIds = [],
}) {
  if (!Array.isArray(practices) || !Array.isArray(includedIds)) {
    return { error: "Practice and section selections must be given as lists." };
  }
  const unknown = includedIds.find((id) => !SECTION_BY_ID.has(id));
  if (unknown) return { error: `Unknown section: ${unknown}.` };

  const site = clean(siteName);
  const owner = clean(ownerName);
  const contact = clean(contactEmail);
  if (!site) return { error: "Enter the name of the blog." };
  if (!owner) return { error: "Enter who runs the blog — a person or a company." };
  if (!contact) return { error: "Enter a contact address for privacy requests." };
  if ([site, owner, contact].some((value) => value.length > MAX_FIELD)) {
    return { error: `Keep each field under ${MAX_FIELD} characters.` };
  }

  const effective = parseIsoDate(effectiveDate);
  if (effective === null) return { error: "Enter a valid last-updated date." };

  const monthChecks = [
    [reviewMonths, "The review interval"],
    [logMonths, "Server log retention"],
    [analyticsMonths, "Analytics retention"],
    [commentMonths, "Comment retention"],
    [contactMonths, "Contact form retention"],
    [suppressionMonths, "Suppression list retention"],
  ];
  for (const [value, label] of monthChecks) {
    const problem = checkMonths(value, label);
    if (problem) return { error: problem };
  }

  const ccpa = assessCcpa({
    annualRevenueUsd,
    consumersPerYear,
    revenueShareFromSellingPercent,
  });
  if (ccpa.error) return { error: ccpa.error };

  const included = SECTIONS.filter((section) => includedIds.includes(section.id));
  if (included.length === 0) {
    return { error: "Include at least one section — an empty policy is worse than none." };
  }

  const set = new Set(practices);
  const consent = assessCookieConsent(practices);

  const collectionParts = [];
  if (set.has("server-logs")) {
    collectionParts.push("your IP address and browser details, from our web host's access logs");
  }
  if (set.has("analytics-cookie")) {
    collectionParts.push("pseudonymous analytics identifiers and the pages you read");
  }
  if (set.has("analytics-cookieless")) {
    collectionParts.push("aggregate page views with no identifier stored on your device");
  }
  if (set.has("comments")) {
    collectionParts.push("the name, email address, comment text and IP address you supply when you comment");
  }
  if (set.has("newsletter")) {
    collectionParts.push("your email address if you subscribe to the newsletter");
  }
  if (set.has("contact-form")) {
    collectionParts.push("whatever you type into the contact form");
  }
  if (set.has("ads") || set.has("embeds")) {
    collectionParts.push("data collected by third-party ad or embed providers once you allow them");
  }
  const collectionSummary =
    collectionParts.length > 0
      ? `We collect ${collectionParts.join("; ")}.`
      : "We collect nothing beyond what your browser sends to load a page.";

  const basisParts = [];
  if (set.has("server-logs")) {
    basisParts.push(
      "server logs rest on our legitimate interest in keeping the site available and secure (Article 6(1)(f))",
    );
  }
  if (set.has("analytics-cookie") || set.has("ads") || set.has("embeds")) {
    basisParts.push(
      "analytics, advertising and third-party embeds rest on your consent (Article 6(1)(a)), collected through the banner",
    );
  }
  if (set.has("analytics-cookieless")) {
    basisParts.push(
      "cookieless analytics rests on our legitimate interest in knowing which articles are useful (Article 6(1)(f))",
    );
  }
  if (set.has("comments")) {
    basisParts.push(
      "publishing your comment rests on your consent, and keeping the email and IP for moderation rests on our legitimate interest in preventing abuse",
    );
  }
  if (set.has("newsletter")) {
    basisParts.push("the newsletter rests on your consent, given when you confirm your subscription");
  }
  if (set.has("contact-form")) {
    basisParts.push(
      "answering a message rests on our legitimate interest in responding to people who write to us, or on steps taken at your request before a contract",
    );
  }
  const lawfulBasisSummary =
    basisParts.length > 0 ? `${basisParts.join("; ")}.` : "We process no personal data on this site.";

  const retentionParts = [];
  if (set.has("server-logs")) retentionParts.push(`server logs: ${logMonths} months`);
  if (set.has("analytics-cookie") || set.has("analytics-cookieless")) {
    retentionParts.push(`analytics: ${analyticsMonths} months`);
  }
  if (set.has("comments")) retentionParts.push(`comments and their metadata: ${commentMonths} months`);
  if (set.has("contact-form")) retentionParts.push(`contact form messages: ${contactMonths} months`);
  if (set.has("newsletter")) {
    retentionParts.push(
      `newsletter subscribers: until you unsubscribe, then ${suppressionMonths} months on a suppression list`,
    );
  }
  const retentionSummary =
    retentionParts.length > 0
      ? `We keep each kind of data only as long as the purpose needs — ${retentionParts.join("; ")}.`
      : "We hold no personal data, so there is nothing to retain.";

  const emailTrackingBody = emailTracking
    ? `Our emails include a tracking pixel and wrapped links, so we can see whether an email was opened and which links were clicked. We use this only to judge whether ${clean(newsletterName) || "the newsletter"} is worth writing, we do not sell it, and you can stop it by reading in plain text or by blocking remote images. Because a pixel reads information from your device, it is covered by consent in the same way a cookie is.`
    : "Our emails contain no tracking pixel and no wrapped links. We do not record whether you opened an email or what you clicked, so our figures are limited to how many messages were delivered and how many people unsubscribed.";

  const ccpaBody = ccpa.applies
    ? `The California Consumer Privacy Act applies to us because of ${ccpa.reasons.join(" and ")}. You may ask what personal information we have collected about you in the last 12 months and where it came from, ask us to delete it, ask us to correct it, and opt out of any sale or sharing of it — including sharing for cross-context behavioural advertising. We honour an opt-out preference signal such as Global Privacy Control sent by your browser. We will not discriminate against you for exercising these rights. Write to ${contact}, and you may use an authorised agent.`
    : `We are below all three California Consumer Privacy Act thresholds — annual gross revenue over USD ${CCPA_REVENUE_THRESHOLD_USD.toLocaleString("en-US")}, buying selling or sharing the personal information of ${CCPA_CONSUMER_THRESHOLD.toLocaleString("en-US")} or more consumers or households a year, or ${CCPA_REVENUE_SHARE_THRESHOLD_PERCENT}% or more of revenue from selling or sharing personal information — so the Act does not apply to us. We still handle the same requests from Californian readers: write to ${contact} to ask what we hold, to correct it, or to have it deleted, and we honour a Global Privacy Control signal.`;

  const consentBody = consent.required
    ? `${consent.why} Strictly necessary cookies — the ones that remember your consent choice and keep the site working — are set without asking, because Article 5(3) exempts them.`
    : `${consent.why} We set only strictly necessary cookies, such as the one that remembers your consent choice, so there is no banner asking you to accept tracking.`;

  const values = {
    site,
    owner,
    contact,
    newsletterName: clean(newsletterName) || "the newsletter",
    processors: clean(processors),
    collectionSummary,
    lawfulBasisSummary,
    retentionSummary,
    emailTrackingBody,
    ccpaBody,
    consentBody,
    logMonths: String(logMonths),
    analyticsMonths: String(analyticsMonths),
    commentMonths: String(commentMonths),
    contactMonths: String(contactMonths),
    suppressionMonths: String(suppressionMonths),
    optOutDays: String(CANSPAM_OPTOUT_BUSINESS_DAYS),
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
        ? "Every privacy policy needs this section."
        : `Needed because: ${section.requiredFor
            .filter((id) => set.has(id))
            .map((id) => PRACTICES.find((entry) => entry.id === id)?.label ?? id)
            .join("; ")}.`,
    }));

  const warnings = [];
  if (consent.required && !set.has("eu")) {
    warnings.push(
      "You load cookies that are not strictly necessary. Even without EU readers ticked, a consent banner is the safer default, because the ePrivacy rule follows the reader, not the publisher.",
    );
  }
  if (set.has("analytics-cookie") && set.has("analytics-cookieless")) {
    warnings.push(
      "You have selected both cookie-based and cookieless analytics. Say which one is live, or readers cannot tell whether consent is needed.",
    );
  }
  if (set.has("children") && !includedIds.includes("children")) {
    warnings.push(
      `An audience that may include children needs the children's section: the COPPA Rule requires verifiable parental consent below age ${COPPA_AGE}, and GDPR Article 8 sets the digital consent age at ${GDPR_CHILD_AGE}.`,
    );
  }
  if (set.has("newsletter") && !includedIds.includes("newsletter")) {
    warnings.push(
      "You run a mailing list but the policy does not describe it. CAN-SPAM requires a valid postal address and a working opt-out in every commercial email.",
    );
  }
  if (ccpa.applies && !includedIds.includes("rights-ccpa")) {
    warnings.push(
      `You cross a CCPA threshold (${ccpa.reasons.join("; ")}) but the policy has no California notice.`,
    );
  }

  const lines = [
    `${site} — Privacy Policy`,
    `Last updated ${formatStamp(effective)}. Next review by ${values.reviewByLong}.`,
    "",
  ];
  included.forEach((section, index) => {
    lines.push(`${index + 1}. ${section.title}`);
    lines.push(fill(section.body));
    lines.push("");
  });
  lines.push(
    `Questions about this policy go to ${contact}. This page is written to be read, not to be skimmed past — if something in it is unclear, ask and we will fix the wording.`,
  );

  const policy = lines.join("\n");

  return {
    policy,
    completenessPercent,
    missing,
    warnings,
    consent,
    ccpa,
    reviewByLong: values.reviewByLong,
    wordCount: policy.split(/\s+/).filter(Boolean).length,
    included: included.map((section) => ({ id: section.id, title: section.title })),
  };
}
