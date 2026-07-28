/**
 * Newsletter Privacy Policy Generator.
 *
 * A mailing list is the one part of a website where three different regimes
 * apply at once: the consent rule that decides whether you may send at all,
 * the cookie rule that covers the tracking pixel inside the message, and the
 * data protection rule that covers the address on the list. This module works
 * out the dates each of those regimes imposes and assembles a policy that says
 * what actually happens to a subscriber's address.
 *
 * Rules the sections and the maths rest on:
 *  - CAN-SPAM Act, 15 U.S.C. section 7704 and the FTC Rule at 16 CFR Part 316.
 *    A commercial email must not use deceptive headers or subject lines, must
 *    identify itself as an advertisement where the recipient did not opt in,
 *    must carry a valid physical postal address, and must include a working
 *    opt-out that stays live for at least 30 days after the message is sent.
 *    An opt-out request must be honoured within 10 business days, and the
 *    sender may not charge for it or require anything beyond an email address
 *    and an opt-out preference. Penalties are assessed per email and are
 *    adjusted for inflation each year.
 *  - Canada's Anti-Spam Legislation, S.C. 2010, c. 23. Consent must exist
 *    before a commercial electronic message is sent. Implied consent from an
 *    existing business relationship lasts 24 months from the transaction or
 *    contract, and implied consent from an inquiry lasts 6 months from the
 *    inquiry. Every message needs sender identification and an unsubscribe
 *    mechanism that remains functional for at least 60 days after the message
 *    is sent, and an unsubscribe request must be given effect without delay
 *    and in any event within 10 business days.
 *  - GDPR, Regulation (EU) 2016/679. Article 6(1)(a) makes consent the usual
 *    basis for a marketing list; Article 7(1) puts the burden of proving
 *    consent on the sender, which is why the date, time, IP address and form
 *    wording are stored; Article 7(3) requires withdrawal to be as easy as
 *    giving consent. Articles 15 to 21 give the access, erasure and objection
 *    rights, and Article 21(2) makes the right to object to direct marketing
 *    absolute.
 *  - ePrivacy Directive 2002/58/EC. Article 13 requires prior consent for
 *    unsolicited marketing email, with a narrow soft opt-in where the address
 *    was obtained in the course of a sale of a similar product and an opt-out
 *    is offered in every message — the same exception appears in regulation 22
 *    of the UK Privacy and Electronic Communications Regulations 2003.
 *    Article 5(3) covers a tracking pixel, because opening the message reads
 *    information from the subscriber's device.
 *  - India's Digital Personal Data Protection Act 2023: an itemised notice,
 *    consent that can be withdrawn as easily as it was given, access,
 *    correction and erasure rights, and a named grievance contact.
 *
 * Informational template only, not legal advice.
 */

/** CAN-SPAM and CASL both require an opt-out to be actioned within 10 business days. */
export const OPT_OUT_BUSINESS_DAYS = 10;
/** CASL requires the unsubscribe mechanism to stay live 60 days after the message. */
export const CASL_UNSUBSCRIBE_VALID_DAYS = 60;
/** CAN-SPAM requires the opt-out mechanism to work for at least 30 days after sending. */
export const CANSPAM_MECHANISM_VALID_DAYS = 30;
/** CASL implied consent from an existing business relationship: 24 months. */
export const CASL_TRANSACTION_MONTHS = 24;
/** CASL implied consent from an inquiry: 6 months. */
export const CASL_INQUIRY_MONTHS = 6;
const MAX_MONTHS = 120;
const MAX_FIELD = 160;
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

/** How a subscriber ended up on the list. Drives the CASL expiry maths. */
export const CONSENT_TYPES = [
  {
    id: "express-double",
    label: "Express consent, confirmed by a double opt-in email",
    expiresMonths: 0,
  },
  { id: "express-single", label: "Express consent, single opt-in form", expiresMonths: 0 },
  {
    id: "implied-transaction",
    label: "Implied consent — bought something or signed a contract",
    expiresMonths: CASL_TRANSACTION_MONTHS,
  },
  {
    id: "implied-inquiry",
    label: "Implied consent — made an inquiry",
    expiresMonths: CASL_INQUIRY_MONTHS,
  },
  { id: "soft-optin", label: "Soft opt-in — address taken during a sale of a similar product", expiresMonths: 0 },
];

/** Facts about the list that make particular sections necessary. */
export const PRACTICES = [
  { id: "eu", label: "Subscribers in the EU or UK" },
  { id: "canada", label: "Subscribers in Canada" },
  { id: "us", label: "Subscribers in the United States" },
  { id: "india", label: "Subscribers in India" },
  { id: "pixel", label: "Open tracking pixel in every email" },
  { id: "click-tracking", label: "Links are wrapped for click tracking" },
  { id: "segmentation", label: "List is segmented by behaviour or interests" },
  { id: "paid", label: "Paid subscription tier" },
  { id: "sponsors", label: "Sponsored placements or advertising in the email" },
  { id: "referrals", label: "Referral programme that collects a friend's address" },
  { id: "ai-personalisation", label: "Automated personalisation of subject lines or content" },
];

/** Policy sections. */
export const SECTIONS = [
  {
    id: "who",
    title: "Who sends this newsletter",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "{{listName}} is sent by {{publisher}}, whose postal address is {{postalAddress}}. Every email we send carries that address, because the CAN-SPAM Act requires a valid physical postal address in a commercial message. For anything about your data write to {{contact}}.",
  },
  {
    id: "what-we-hold",
    title: "What we hold about you",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "{{dataSummary}} We do not buy lists, we do not rent or sell yours, and we do not add anyone who has not asked for it.",
  },
  {
    id: "how-you-joined",
    title: "How you got on the list, and proof of it",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "{{consentSummary}} We store the date and time you subscribed, the page you subscribed from, the exact wording of the form and, where our provider records it, the IP address used — because Article 7(1) of the GDPR puts the burden of proving consent on us, not on you. You can ask to see that record.",
  },
  {
    id: "double-optin",
    title: "Confirmation email",
    always: false,
    requiredFor: [],
    weight: 2,
    body: "After you enter your address we send one email asking you to confirm. Nothing else is sent until you click it, and an unconfirmed address is deleted after {{unconfirmedDays}} days. This is what stops someone else adding your address to our list.",
  },
  {
    id: "casl",
    title: "Canadian subscribers and implied consent",
    always: false,
    requiredFor: ["canada"],
    weight: 3,
    body: `Canada's Anti-Spam Legislation requires consent before a commercial electronic message is sent. {{caslSummary}} Every message identifies us, gives our postal address, and carries an unsubscribe link that stays live for at least ${CASL_UNSUBSCRIBE_VALID_DAYS} days after the message was sent. An unsubscribe request is given effect without delay and in any event within ${OPT_OUT_BUSINESS_DAYS} business days.`,
  },
  {
    id: "lawful-basis",
    title: "Lawful basis",
    always: false,
    requiredFor: ["eu"],
    weight: 3,
    body: "{{basisSummary}} You may withdraw consent at any time and it is as easy to withdraw as it was to give, which Article 7(3) of the GDPR requires. Your right to object to direct marketing under Article 21(2) is absolute: if you object, we stop, with no balancing test and no questions.",
  },
  {
    id: "pixel",
    title: "Open tracking",
    always: false,
    requiredFor: ["pixel"],
    weight: 3,
    body: "Each email contains a small invisible image. When your email client loads it, we learn that the message was opened, roughly when, and the general location and device type derived from the request. Because loading it reads information from your device, it is covered by the consent rule in Article 5(3) of the ePrivacy Directive in the same way a cookie is. Blocking remote images in your email client stops it, and so does unsubscribing. We use open data only to decide what to write and when to stop emailing inactive addresses.",
  },
  {
    id: "click-tracking",
    title: "Click tracking",
    always: false,
    requiredFor: ["click-tracking"],
    weight: 2,
    body: "Links in the email are rewritten so that a click passes through our email provider before reaching the destination. That records which link you clicked and when. We use it to see which topics are read. It also means the URL you see on hover is our redirect rather than the final destination — the destination is always shown in the link text.",
  },
  {
    id: "segmentation",
    title: "Segmentation and profiling",
    always: false,
    requiredFor: ["segmentation"],
    weight: 2,
    body: "We group subscribers by which emails they opened, which links they clicked and which topics they chose when subscribing, so that a message is relevant rather than generic. This is profiling in the GDPR sense but it produces no legal or similarly significant effect on you: it changes which email you get, not your price, your access or your rights. You can ask us to stop segmenting your address and to send you everything, or nothing.",
  },
  {
    id: "ai-personalisation",
    title: "Automated personalisation",
    always: false,
    requiredFor: ["ai-personalisation"],
    weight: 2,
    body: "Subject lines and section ordering may be chosen automatically based on what you have opened before. A human decides what goes into the newsletter; the automation only decides how it is presented to you. There is no automated decision-making that produces a legal or similarly significant effect, so Article 22 of the GDPR is not engaged, and you can turn personalisation off from the preference link in any email.",
  },
  {
    id: "frequency",
    title: "How often we email and how to change it",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "We send {{frequency}}. Every email has a preference link where you can change topics or frequency, and an unsubscribe link that needs no login, no password and no reason. We never require you to log in, answer a survey or send a reply in order to unsubscribe, because the CAN-SPAM Act forbids charging a fee or demanding anything beyond an email address and a preference.",
  },
  {
    id: "unsubscribe",
    title: "Unsubscribing and what happens next",
    always: true,
    requiredFor: [],
    weight: 3,
    body: `An unsubscribe takes effect immediately in our system and in any case within ${OPT_OUT_BUSINESS_DAYS} business days, which is the deadline set by both the CAN-SPAM Act and Canada's Anti-Spam Legislation. Your address then moves to a suppression list, which exists only so that an import or a re-subscribe by mistake cannot put you back on. We keep it for {{suppressionMonths}} months and then delete it. Ask us to erase it sooner and we will, accepting that we then have no record of your objection.`,
  },
  {
    id: "sunset",
    title: "Inactive subscribers",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "If you have not opened anything for {{sunsetMonths}} months we send one email asking whether you want to stay, and if there is no answer we remove you. Holding an address nobody reads serves no purpose and stores personal data past the point where the purpose has ended, which Article 5(1)(e) of the GDPR does not allow.",
  },
  {
    id: "paid",
    title: "Paid subscriptions",
    always: false,
    requiredFor: ["paid"],
    weight: 2,
    body: "For a paid subscription our payment provider handles the card details; we never see or store a card number. We keep your name, billing country, subscription status and invoice history because tax law requires it, typically for six or seven years depending on the country, which is longer than we keep anything else. Cancelling a paid subscription does not by itself unsubscribe you from the free list, and unsubscribing does not cancel a paid subscription — use the billing page for that.",
  },
  {
    id: "sponsors",
    title: "Sponsors and advertising",
    always: false,
    requiredFor: ["sponsors"],
    weight: 3,
    body: "Some issues carry a sponsored placement. We do not give sponsors your address, and they do not get a copy of the list. A sponsor sees only aggregate figures: how many people received the issue and how many clicked their link. If a sponsored link takes you to their site, their own privacy notice applies from that point. Sponsored content is labelled as such in the email.",
  },
  {
    id: "referrals",
    title: "Referrals and forwarding",
    always: false,
    requiredFor: ["referrals"],
    weight: 3,
    body: "If you refer someone, we ask you to send them the link yourself rather than giving us their address, because we have no lawful basis for emailing a person who has not asked to hear from us. Where our referral tool does accept an address, we send exactly one invitation naming you as the referrer, keep the address only if that person subscribes, and delete it within 30 days otherwise.",
  },
  {
    id: "processors",
    title: "Who else touches your address",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "Your address sits with {{provider}}, which sends the email on our behalf as a processor under a written contract meeting Article 28 of the GDPR. Nobody else receives it. We disclose data to a public authority only where the law compels it.",
  },
  {
    id: "transfers",
    title: "Where your data is stored",
    always: false,
    requiredFor: ["eu"],
    weight: 2,
    body: "Our email provider may store or process data outside the EEA and the UK. Where that happens we rely on an adequacy decision where one applies, and otherwise on the European Commission's Standard Contractual Clauses together with a transfer risk assessment, as Chapter V of the GDPR requires. Ask us and we will tell you which mechanism covers your data.",
  },
  {
    id: "rights",
    title: "Your rights over the address we hold",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "Write to {{contact}} to see what we hold about you, to correct it, to have it deleted, to get a copy in a portable format, or to object. We answer within one month. Under India's Digital Personal Data Protection Act 2023 you may also nominate someone to exercise these rights on your behalf, and {{contact}} is our grievance redressal contact. If we do not resolve a complaint you can go to your data protection authority — the Data Protection Board of India for readers there.",
  },
  {
    id: "security",
    title: "Security and breach",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "Access to the subscriber list is limited to the people who send the newsletter, protected by multi-factor authentication, and exports are not kept on personal machines. If a breach happens and it is likely to put you at risk, we notify the supervisory authority within 72 hours as Article 33 of the GDPR requires and tell you directly where the risk is high. A leaked email list is a real harm, not a formality.",
  },
  {
    id: "changes",
    title: "Changes to this notice",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "Last updated {{effectiveLong}}, reviewed at least every {{reviewMonths}} months and next by {{reviewByLong}}. If we start doing something new with your address — a new tracking method, a new recipient, a longer retention period — we will say so in the newsletter itself before it starts, and ask again where consent is needed.",
  },
];

const SECTION_BY_ID = new Map(SECTIONS.map((section) => [section.id, section]));
const CONSENT_BY_ID = new Map(CONSENT_TYPES.map((entry) => [entry.id, entry]));

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
 * Add calendar days.
 * @param {number} stamp
 * @param {number} days
 * @returns {number}
 */
export function addDays(stamp, days) {
  return stamp + days * MS_PER_DAY;
}

/**
 * Add business days, counting Monday to Friday only. Public holidays vary by
 * country and are not deducted, so the result is the earliest possible
 * deadline rather than the latest.
 *
 * @param {number} stamp UTC-midnight timestamp of the request.
 * @param {number} days Whole business days to add.
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
 * Work out the deadlines a mailing list is subject to.
 *
 * optOutDeadline       = request date + 10 business days (CAN-SPAM and CASL)
 * unsubscribeValidTo   = send date + 60 days (CASL) and + 30 days (CAN-SPAM)
 * impliedConsentExpiry = signup date + 24 months (transaction) or 6 months
 *                        (inquiry); express consent does not expire on a timer
 *
 * @param {object} input
 * @param {string} input.signupDate  yyyy-mm-dd
 * @param {string} input.consentType Id from CONSENT_TYPES.
 * @param {string} input.requestDate yyyy-mm-dd, when an unsubscribe arrives.
 * @param {string} input.sendDate    yyyy-mm-dd, when the message went out.
 * @returns {{optOutDeadlineLong:string, caslMechanismUntilLong:string,
 *            canSpamMechanismUntilLong:string, impliedExpiryLong:string|null,
 *            impliedMonths:number}|{error:string}}
 */
export function computeMailingDeadlines({ signupDate, consentType, requestDate, sendDate }) {
  const consent = CONSENT_BY_ID.get(consentType);
  if (!consent) return { error: "Choose how the subscriber joined the list." };

  const signup = parseIsoDate(signupDate);
  if (signup === null) return { error: "Enter a valid subscription date." };
  const request = parseIsoDate(requestDate);
  if (request === null) return { error: "Enter a valid unsubscribe request date." };
  const send = parseIsoDate(sendDate);
  if (send === null) return { error: "Enter a valid send date for the last issue." };

  const impliedExpiry =
    consent.expiresMonths > 0 ? addMonths(signup, consent.expiresMonths) : null;

  return {
    optOutDeadlineLong: formatStamp(addBusinessDays(request, OPT_OUT_BUSINESS_DAYS)),
    caslMechanismUntilLong: formatStamp(addDays(send, CASL_UNSUBSCRIBE_VALID_DAYS)),
    canSpamMechanismUntilLong: formatStamp(addDays(send, CANSPAM_MECHANISM_VALID_DAYS)),
    impliedExpiryLong: impliedExpiry === null ? null : formatStamp(impliedExpiry),
    impliedMonths: consent.expiresMonths,
  };
}

/**
 * Sections this list needs.
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
 * Assemble the newsletter privacy notice and score it.
 *
 * @returns {{policy:string, completenessPercent:number, missing:object[], warnings:string[],
 *            deadlines:object, reviewByLong:string, wordCount:number,
 *            included:object[]}|{error:string}}
 */
export function buildNewsletterPolicy({
  listName,
  publisher,
  postalAddress,
  contactEmail,
  provider = "our email service provider",
  frequency = "one issue a week",
  consentType = "express-double",
  signupDate,
  requestDate,
  sendDate,
  effectiveDate,
  reviewMonths = 12,
  suppressionMonths = 36,
  sunsetMonths = 12,
  unconfirmedDays = 7,
  practices = [],
  includedIds = [],
}) {
  if (!Array.isArray(practices) || !Array.isArray(includedIds)) {
    return { error: "Practice and section selections must be given as lists." };
  }
  const unknown = includedIds.find((id) => !SECTION_BY_ID.has(id));
  if (unknown) return { error: `Unknown section: ${unknown}.` };

  const list = clean(listName);
  const owner = clean(publisher);
  const postal = clean(postalAddress);
  const contact = clean(contactEmail);
  if (!list) return { error: "Enter the newsletter name." };
  if (!owner) return { error: "Enter who publishes the newsletter." };
  if (!postal) {
    return {
      error:
        "Enter a physical postal address — CAN-SPAM requires one in every commercial email, so the policy cannot be written without it.",
    };
  }
  if (!contact) return { error: "Enter a contact address for privacy requests." };
  if ([list, owner, postal, contact].some((value) => value.length > MAX_FIELD)) {
    return { error: `Keep each field under ${MAX_FIELD} characters.` };
  }

  const effective = parseIsoDate(effectiveDate);
  if (effective === null) return { error: "Enter a valid last-updated date." };

  for (const [value, label] of [
    [reviewMonths, "The review interval"],
    [suppressionMonths, "Suppression list retention"],
    [sunsetMonths, "The inactive-subscriber window"],
  ]) {
    const problem = checkMonths(value, label);
    if (problem) return { error: problem };
  }

  const unconfirmed = Number(unconfirmedDays);
  if (
    !Number.isFinite(unconfirmed) ||
    !Number.isInteger(unconfirmed) ||
    unconfirmed < 1 ||
    unconfirmed > 90
  ) {
    return { error: "Unconfirmed addresses must be deleted after 1 to 90 days." };
  }

  const deadlines = computeMailingDeadlines({ signupDate, consentType, requestDate, sendDate });
  if (deadlines.error) return { error: deadlines.error };

  const included = SECTIONS.filter((section) => includedIds.includes(section.id));
  if (included.length === 0) {
    return { error: "Include at least one section — an empty notice is worse than none." };
  }

  const set = new Set(practices);
  const consent = CONSENT_BY_ID.get(consentType);

  const dataParts = ["your email address"];
  if (set.has("segmentation")) dataParts.push("the topics you chose and the segments you fall into");
  if (set.has("pixel")) dataParts.push("whether and roughly when each issue was opened");
  if (set.has("click-tracking")) dataParts.push("which links you clicked");
  if (set.has("paid")) dataParts.push("your subscription status and invoice history");
  dataParts.push("the date you subscribed and the page you subscribed from");
  const dataSummary = `We hold ${dataParts.join("; ")}. We do not hold your name unless you typed one, and we never ask for a phone number, a date of birth or an address.`;

  const consentSummary = (() => {
    switch (consentType) {
      case "express-double":
        return "You entered your address on our signup form and then clicked a confirmation link in an email we sent. That double opt-in is what we treat as your consent, and nothing is sent before you confirm.";
      case "express-single":
        return "You entered your address on our signup form and were added straight away. We do not send a confirmation email, which means we rely on the form record alone as evidence of your consent.";
      case "implied-transaction":
        return `You bought something from us or entered into a contract with us, which creates implied consent under Canada's Anti-Spam Legislation for ${CASL_TRANSACTION_MONTHS} months from that transaction. We ask for express consent before that period runs out.`;
      case "implied-inquiry":
        return `You made an inquiry to us, which creates implied consent under Canada's Anti-Spam Legislation for ${CASL_INQUIRY_MONTHS} months from the inquiry. We ask for express consent before that period runs out.`;
      default:
        return "We took your address while selling you a similar product or service and offered you an opt-out at that moment and in every message since. This is the soft opt-in permitted by Article 13(2) of the ePrivacy Directive and regulation 22(3) of the UK Privacy and Electronic Communications Regulations 2003; it does not extend to people who only browsed or downloaded something free.";
    }
  })();

  const caslSummary =
    consent.expiresMonths > 0
      ? `Your consent is implied rather than express, so it expires ${consent.expiresMonths} months after the event that created it — on ${deadlines.impliedExpiryLong} for a subscription dated ${formatStamp(parseIsoDate(signupDate))}. After that date we may not send to you unless you have given express consent.`
      : "Your consent is express, so it does not expire on a timer; it lasts until you withdraw it.";

  const basisParts = [
    "sending you the newsletter rests on your consent under Article 6(1)(a) of the GDPR",
  ];
  if (set.has("pixel") || set.has("click-tracking")) {
    basisParts.push(
      "open and click tracking rests on your consent as well, because reading information from your device is covered by Article 5(3) of the ePrivacy Directive",
    );
  }
  if (set.has("segmentation")) {
    basisParts.push(
      "grouping subscribers by interest rests on our legitimate interest in sending relevant rather than generic issues, under Article 6(1)(f)",
    );
  }
  basisParts.push(
    "keeping the suppression list rests on our legal obligation to honour your opt-out",
  );
  const basisSummary = `${basisParts.join("; ")}.`;

  const values = {
    listName: list,
    publisher: owner,
    postalAddress: postal,
    contact,
    provider: clean(provider),
    frequency: clean(frequency),
    dataSummary,
    consentSummary,
    caslSummary,
    basisSummary,
    suppressionMonths: String(suppressionMonths),
    sunsetMonths: String(sunsetMonths),
    unconfirmedDays: String(unconfirmed),
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
        ? "Every mailing list notice needs this section."
        : `Needed because: ${section.requiredFor
            .filter((id) => set.has(id))
            .map((id) => PRACTICES.find((entry) => entry.id === id)?.label ?? id)
            .join("; ")}.`,
    }));

  const warnings = [];
  if (consentType === "express-single" && set.has("eu")) {
    warnings.push(
      "Single opt-in leaves you with only a form record to prove consent, and Article 7(1) of the GDPR puts that burden on you. A confirmation click is the evidence regulators expect.",
    );
  }
  if (consentType === "express-single" && !includedIds.includes("double-optin")) {
    warnings.push(
      "Without a confirmation email, anyone can add someone else's address to your list — including a competitor doing it deliberately.",
    );
  }
  if (consent.expiresMonths > 0) {
    warnings.push(
      `Implied consent under CASL runs out on ${deadlines.impliedExpiryLong}. Collect express consent before then or stop sending to this subscriber.`,
    );
  }
  if (set.has("pixel") && set.has("eu") && !includedIds.includes("pixel")) {
    warnings.push(
      "A tracking pixel that is not disclosed is the most commonly enforced failing in email marketing, because Article 5(3) of the ePrivacy Directive treats it the same as a cookie.",
    );
  }
  if (set.has("referrals") && !includedIds.includes("referrals")) {
    warnings.push(
      "Collecting a friend's address without their consent has no lawful basis under the GDPR and is not covered by CAN-SPAM's forward-to-a-friend exception unless the sender pays nothing and the message is genuinely from the friend.",
    );
  }
  if (!set.has("us") && !set.has("eu") && !set.has("canada") && !set.has("india")) {
    warnings.push(
      "No subscriber region is selected, so the notice omits the jurisdiction-specific sections. Email lists rarely stay inside one country.",
    );
  }

  const lines = [
    `${list} — Privacy Notice for Subscribers`,
    `Published by ${owner}. Last updated ${formatStamp(effective)}. Next review by ${values.reviewByLong}.`,
    "",
  ];
  included.forEach((section, index) => {
    lines.push(`${index + 1}. ${section.title}`);
    lines.push(fill(section.body));
    lines.push("");
  });
  lines.push(
    `To unsubscribe, use the link at the bottom of any issue. To ask anything else about your data, write to ${contact}.`,
  );

  const policy = lines.join("\n");

  return {
    policy,
    completenessPercent,
    missing,
    warnings,
    deadlines,
    reviewByLong: values.reviewByLong,
    wordCount: policy.split(/\s+/).filter(Boolean).length,
    included: included.map((section) => ({ id: section.id, title: section.title })),
  };
}
