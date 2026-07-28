/**
 * Newsletter Terms Generator.
 *
 * A paid newsletter is a recurring consumer contract for digital content, and
 * most of the disputes it produces are about money and timing rather than
 * about writing: when a subscriber may cancel and get money back, when a
 * renewal may be charged, and what happens to the archive afterwards. This
 * module prices the tiers, computes those dates, and assembles terms whose
 * clauses are tied to identifiable rules.
 *
 * Rules the maths and clauses rest on:
 *  - EU Consumer Rights Directive 2011/83/EU. Article 9 gives a consumer 14
 *    days to withdraw from a distance contract without giving a reason.
 *    Article 16(m) removes that right for digital content not supplied on a
 *    tangible medium once performance has begun with the consumer's prior
 *    express consent and their acknowledgement that they lose the right, and
 *    since Directive (EU) 2019/2161 the trader must also provide confirmation
 *    of that agreement. The UK equivalent is the Consumer Contracts
 *    (Information, Cancellation and Additional Charges) Regulations 2013.
 *  - Directive (EU) 2019/770 on contracts for the supply of digital content:
 *    the content must match the description and be fit for purpose, and a
 *    consumer has remedies where it does not.
 *  - Restore Online Shoppers' Confidence Act, 15 U.S.C. section 8403. A
 *    negative option feature — anything that keeps charging until cancelled —
 *    requires clear and conspicuous disclosure of the material terms before
 *    obtaining billing information, express informed consent before the charge,
 *    and a simple mechanism to stop recurring charges.
 *  - California's Automatic Renewal Law, Cal. Bus. and Prof. Code section
 *    17600 and following. It requires the automatic renewal terms to be
 *    presented clearly and conspicuously before the subscription is accepted,
 *    affirmative consent to those terms, an acknowledgement that includes the
 *    cancellation policy and how to cancel, an online cancellation route for
 *    anyone who signed up online, and — for a term of one year or longer — a
 *    renewal reminder sent between 15 and 45 days before the renewal date.
 *  - Place of supply for electronically supplied services: for a business to
 *    consumer sale the VAT is due where the customer belongs, under Article 58
 *    of the EU VAT Directive 2006/112/EC, so the price shown to a consumer has
 *    to be tax inclusive. India charges GST on online information and database
 *    access or retrieval services supplied to a consumer there.
 *  - FTC Endorsement Guides, 16 CFR Part 255: sponsored placements inside an
 *    issue are advertising and must be disclosed clearly and conspicuously.
 *
 * Informational template only. It is not legal or tax advice.
 */

/** Consumer Rights Directive Article 9: withdrawal period for a distance contract. */
export const WITHDRAWAL_DAYS = 14;
/** California ARL renewal reminder window for terms of a year or more. */
export const RENEWAL_REMINDER_MIN_DAYS = 15;
export const RENEWAL_REMINDER_MAX_DAYS = 45;
/** Months in a year, used for the annual-versus-monthly comparison. */
const MONTHS_PER_YEAR = 12;
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

/** Currencies the terms can be priced in. */
export const CURRENCIES = [
  { code: "USD", locale: "en-US" },
  { code: "GBP", locale: "en-GB" },
  { code: "EUR", locale: "en-IE" },
  { code: "INR", locale: "en-IN" },
  { code: "AUD", locale: "en-AU" },
  { code: "CAD", locale: "en-CA" },
];

/** How the publication handles a cancellation mid-term. */
export const REFUND_POLICIES = [
  { id: "prorated", label: "Prorated refund of the unused part" },
  { id: "no-refund-run-out", label: "No refund; access runs to the end of the paid term" },
  { id: "full-window", label: "Full refund inside the withdrawal window, none after" },
];

/** Facts about the publication that make particular clauses necessary. */
export const PRACTICES = [
  { id: "paid", label: "There is a paid tier" },
  { id: "free", label: "There is a free tier" },
  { id: "eu", label: "Subscribers in the EU or UK" },
  { id: "us", label: "Subscribers in the United States" },
  { id: "california", label: "Subscribers in California" },
  { id: "india", label: "Subscribers in India" },
  { id: "annual", label: "Annual plan alongside monthly" },
  { id: "trial", label: "Free trial before the first charge" },
  { id: "founding", label: "Founding or lifetime membership tier" },
  { id: "group", label: "Team or group subscriptions" },
  { id: "sponsors", label: "Sponsored placements inside issues" },
  { id: "community", label: "Subscriber comments or community space" },
];

/** Clause library. */
export const CLAUSES = [
  {
    id: "what-you-get",
    title: "What a subscription includes",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "{{tierSummary}} We aim to publish {{cadence}}. Publishing is a human activity, so an issue may be late or occasionally skipped; a sustained failure to publish is a failure of this contract and is dealt with under the refunds clause rather than ignored.",
  },
  {
    id: "free-tier",
    title: "The free tier",
    always: false,
    requiredFor: ["free"],
    weight: 2,
    body: "The free tier costs nothing, and nothing is owed for it. We may change what it includes, reduce it, or withdraw it entirely, and we will say so in the newsletter before doing it. A free subscriber has the same rights over their personal data as a paying one, and the privacy notice applies equally.",
  },
  {
    id: "price-and-billing",
    title: "Price and billing",
    always: false,
    requiredFor: ["paid"],
    weight: 3,
    body: "{{priceSummary}} Payment is taken by our payment provider; we never see or store your card number. Prices for consumers are shown inclusive of any tax due where you live, because for an electronically supplied service the tax follows the customer's location.",
  },
  {
    id: "auto-renewal",
    title: "Automatic renewal and how to stop it",
    always: false,
    requiredFor: ["paid"],
    weight: 3,
    body: "{{renewalSummary}} You can cancel at any time from your account page in the same number of steps it took to subscribe — no email, no phone call, no retention interview. Cancelling stops the next charge; it does not delete your account or your archive access before the paid period ends. This clause exists because 15 U.S.C. section 8403 requires a simple mechanism to stop a recurring charge and because California's Automatic Renewal Law requires an online cancellation route for anyone who signed up online.",
  },
  {
    id: "renewal-reminder",
    title: "Renewal reminder",
    always: false,
    requiredFor: ["annual", "california"],
    weight: 3,
    body: `Before an annual subscription renews we email you a reminder that states the renewal date, the amount and how to cancel. California's Automatic Renewal Law requires that reminder to arrive between ${RENEWAL_REMINDER_MIN_DAYS} and ${RENEWAL_REMINDER_MAX_DAYS} days before renewal for a term of a year or more, and we send it to everyone rather than by region. For a renewal on {{renewalLong}} the reminder goes out between {{reminderFromLong}} and {{reminderToLong}}.`,
  },
  {
    id: "price-changes",
    title: "Price changes",
    always: false,
    requiredFor: ["paid"],
    weight: 2,
    body: "If we raise the price, we tell you at least {{priceNoticeDays}} days before the change takes effect, we say what the new price is, and it applies from your next renewal rather than mid-term. Continuing after that date is acceptance; cancelling before it means you never pay the new price. A founding or lifetime rate, where offered, is honoured for as long as that tier exists.",
  },
  {
    id: "trial",
    title: "Free trial",
    always: false,
    requiredFor: ["trial"],
    weight: 3,
    body: "A free trial runs for {{trialDays}} days and converts to a paid subscription at the end unless you cancel first. We tell you the conversion date and the amount when the trial starts, and again before it converts. One trial per person. Cancelling during the trial costs nothing and takes effect immediately.",
  },
  {
    id: "withdrawal",
    title: "Your right to change your mind",
    always: false,
    requiredFor: ["eu"],
    weight: 3,
    body: `As a consumer buying at a distance you have ${WITHDRAWAL_DAYS} days to withdraw without giving a reason, under Article 9 of the Consumer Rights Directive 2011/83/EU and, in the United Kingdom, the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013 — for a subscription starting on {{purchaseLong}} that runs to {{withdrawalDeadlineLong}}. Article 16(m) removes the right once delivery of digital content has begun with your prior express consent and your acknowledgement that you lose it, so we ask for both at checkout and send you confirmation of that agreement. If you would rather keep the right, say so and we will hold delivery until the period ends.`,
  },
  {
    id: "refunds",
    title: "Refunds and cancelling mid-term",
    always: false,
    requiredFor: ["paid"],
    weight: 3,
    body: "{{refundSummary}} A refund goes back to the card that paid. Where we cannot deliver what was promised — a paid tier that stops publishing, or a feature withdrawn mid-term — we refund the unused part regardless of the policy above, because Directive (EU) 2019/770 entitles a consumer to a remedy where digital content does not match its description.",
  },
  {
    id: "founding",
    title: "Founding and lifetime memberships",
    always: false,
    requiredFor: ["founding"],
    weight: 3,
    body: "A founding or lifetime membership buys access for as long as this publication continues, not for the natural life of the subscriber. If the publication closes, we will say so with as much notice as we can, and any lifetime membership bought within the previous 12 months is refunded pro rata. A lifetime membership is personal, is not transferable and is not an investment in the business.",
  },
  {
    id: "group",
    title: "Team and group subscriptions",
    always: false,
    requiredFor: ["group"],
    weight: 2,
    body: "A group subscription covers a stated number of named seats at one organisation. Seats can be reassigned when someone leaves; they cannot be shared simultaneously, pooled across organisations, or used to run an internal reproduction of the newsletter. The account administrator is responsible for who holds a seat and for paying the invoice.",
  },
  {
    id: "sharing",
    title: "Sharing paid issues",
    always: false,
    requiredFor: ["paid"],
    weight: 3,
    body: "A paid subscription is personal. Forwarding an issue to a colleague or a friend occasionally is fine and expected. Republishing a paid issue in full, posting it publicly, feeding it to a mailing list of your own, or systematically stripping the paywall is not, and repeat cases end the subscription without a refund. Quoting with attribution and a link is always allowed.",
  },
  {
    id: "archive",
    title: "The archive after you cancel",
    always: false,
    requiredFor: ["paid"],
    weight: 3,
    body: "{{archiveSummary}} Issues you were emailed while subscribed stay in your inbox and are yours to keep; nothing we do removes them. We will give notice before making a previously public archive paid, or a previously paid archive public.",
  },
  {
    id: "community",
    title: "Comments and community",
    always: false,
    requiredFor: ["community"],
    weight: 2,
    body: "Subscriber comments are for adding to an issue. We remove abuse, harassment, doxxing, spam and unlawful content, and we tell the person what was removed and why. Losing comment access for breaking these rules does not entitle you to a refund of the rest of the term, since the writing is what was paid for. You keep copyright in your comments and give us a licence to display them alongside the issue.",
  },
  {
    id: "sponsors",
    title: "Sponsorship and advertising",
    always: false,
    requiredFor: ["sponsors"],
    weight: 3,
    body: "Some issues carry a sponsored placement, always labelled at the top of the section, because the FTC's Endorsement Guides at 16 CFR Part 255 require a material connection to be disclosed clearly and conspicuously. A sponsor does not choose or approve editorial content and does not receive the subscriber list. A paid subscription does not remove sponsorship unless the tier description says it does.",
  },
  {
    id: "ip",
    title: "Copyright in the writing",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "We own the copyright in the issues. A subscription is a personal, non-transferable licence to read them, to quote briefly with attribution and a link, and to forward an issue to an individual. It is not a licence to republish, translate, sell, or use the issues to train a model. Permission for anything wider is usually given if asked.",
  },
  {
    id: "termination",
    title: "Ending the subscription from our side",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "We may end a subscription for repeated abuse of another subscriber, for systematically republishing paid issues, for chargeback fraud, or where the law requires it. Where we end a paid subscription for a reason that is not your fault, we refund the unused part. We will tell you why, in writing, unless the law prevents it.",
  },
  {
    id: "liability",
    title: "Liability",
    always: true,
    requiredFor: [],
    weight: 3,
    body: "Issues are journalism and opinion, not professional advice, and decisions you take after reading one are yours. Our liability for any claim connected with a subscription is limited to the amount you paid in the previous 12 months, except where the law does not allow that limit — liability for death or personal injury caused by negligence, and for fraud, is never excluded. Nothing here removes a consumer right you have under the law where you live.",
  },
  {
    id: "changes-law",
    title: "Changes, governing law and disputes",
    always: true,
    requiredFor: [],
    weight: 2,
    body: "These terms were last updated on {{effectiveLong}}. A change that affects a paid subscriber takes effect at their next renewal, not immediately. The terms are governed by the law of {{jurisdiction}}, but if you are a consumer you keep the protection of the mandatory rules of your own country and may bring a claim in its courts. Write to {{contact}} first — a subscription dispute is usually a billing date that surprised someone.",
  },
];

const CLAUSE_BY_ID = new Map(CLAUSES.map((clause) => [clause.id, clause]));
const REFUND_BY_ID = new Map(REFUND_POLICIES.map((entry) => [entry.id, entry]));

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
 * Add calendar days.
 * @param {number} stamp
 * @param {number} days
 * @returns {number}
 */
export function addDays(stamp, days) {
  return stamp + days * MS_PER_DAY;
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

function currencyFormatter(code) {
  const entry = CURRENCIES.find((item) => item.code === code) ?? CURRENCIES[0];
  return new Intl.NumberFormat(entry.locale, {
    style: "currency",
    currency: entry.code,
    maximumFractionDigits: 2,
  });
}

/**
 * Price the tiers and compute the dates a subscription contract turns on.
 *
 * annualSavingPercent = (monthly x 12 - annual) / (monthly x 12) x 100
 * effectiveMonthly    = annual / 12
 * withdrawalDeadline  = purchase date + 14 days
 * reminder window     = renewal date - 45 days to renewal date - 15 days
 * unusedDays          = days from cancellation to the end of the paid term
 * proratedRefund      = annual price x unusedDays / term length in days
 *
 * @returns {{annualSavingPercent:number, effectiveMonthly:number, monthlyYearCost:number,
 *            withdrawalDeadlineLong:string, reminderFromLong:string, reminderToLong:string,
 *            termDays:number, unusedDays:number, proratedRefund:number,
 *            priceWithTax:number}|{error:string}}
 */
export function computeSubscriptionEconomics({
  monthlyPrice = 0,
  annualPrice = 0,
  taxPercent = 0,
  purchaseDate,
  renewalDate,
  cancelDate,
}) {
  const monthly = Number(monthlyPrice);
  const annual = Number(annualPrice);
  const tax = Number(taxPercent);
  if (!Number.isFinite(monthly) || monthly < 0) {
    return { error: "The monthly price must be zero or more." };
  }
  if (!Number.isFinite(annual) || annual < 0) {
    return { error: "The annual price must be zero or more." };
  }
  if (!Number.isFinite(tax) || tax < 0 || tax > 100) {
    return { error: "The tax rate must be between 0% and 100%." };
  }

  const purchase = parseIsoDate(purchaseDate);
  if (purchase === null) return { error: "Enter a valid subscription start date." };
  const renewal = parseIsoDate(renewalDate);
  if (renewal === null) return { error: "Enter a valid renewal date." };
  if (renewal <= purchase) return { error: "The renewal date must fall after the start date." };
  const cancel = parseIsoDate(cancelDate);
  if (cancel === null) return { error: "Enter a valid cancellation date for the refund example." };
  if (cancel < purchase || cancel > renewal) {
    return { error: "The cancellation date must fall inside the paid term." };
  }

  const monthlyYearCost = monthly * MONTHS_PER_YEAR;
  const annualSavingPercent =
    monthlyYearCost > 0 ? ((monthlyYearCost - annual) / monthlyYearCost) * 100 : 0;
  const effectiveMonthly = annual / MONTHS_PER_YEAR;

  const termDays = daysBetween(purchase, renewal);
  const unusedDays = daysBetween(cancel, renewal);
  const proratedRefund = termDays > 0 ? (annual * unusedDays) / termDays : 0;

  return {
    annualSavingPercent,
    effectiveMonthly,
    monthlyYearCost,
    withdrawalDeadlineLong: formatStamp(addDays(purchase, WITHDRAWAL_DAYS)),
    reminderFromLong: formatStamp(addDays(renewal, -RENEWAL_REMINDER_MAX_DAYS)),
    reminderToLong: formatStamp(addDays(renewal, -RENEWAL_REMINDER_MIN_DAYS)),
    termDays,
    unusedDays,
    proratedRefund,
    priceWithTax: annual * (1 + tax / 100),
  };
}

/**
 * Clauses this publication needs.
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
 * Assemble the subscription terms and score them.
 *
 * @returns {{terms:string, coveragePercent:number, missing:object[], warnings:string[],
 *            economics:object, wordCount:number, included:object[]}|{error:string}}
 */
export function buildNewsletterTerms({
  publicationName,
  publisher,
  contactEmail,
  jurisdiction,
  currency = "USD",
  cadence = "one issue a week",
  monthlyPrice = 8,
  annualPrice = 80,
  taxPercent = 0,
  trialDays = 7,
  priceNoticeDays = 30,
  archiveAfterCancel = "paid-only",
  refundPolicyId = "prorated",
  purchaseDate,
  renewalDate,
  cancelDate,
  effectiveDate,
  practices = [],
  includedIds = [],
}) {
  if (!Array.isArray(practices) || !Array.isArray(includedIds)) {
    return { error: "Practice and clause selections must be given as lists." };
  }
  const unknown = includedIds.find((id) => !CLAUSE_BY_ID.has(id));
  if (unknown) return { error: `Unknown clause: ${unknown}.` };

  const refundPolicy = REFUND_BY_ID.get(refundPolicyId);
  if (!refundPolicy) return { error: "Choose a refund policy." };

  const publication = clean(publicationName);
  const owner = clean(publisher);
  const contact = clean(contactEmail);
  const law = clean(jurisdiction);
  if (!publication) return { error: "Enter the publication name." };
  if (!owner) return { error: "Enter who publishes it." };
  if (!contact) return { error: "Enter a contact address for billing questions." };
  if (!law) return { error: "Enter the governing law — a country or a state." };
  if ([publication, owner, contact, law].some((value) => value.length > MAX_FIELD)) {
    return { error: `Keep each field under ${MAX_FIELD} characters.` };
  }

  const effective = parseIsoDate(effectiveDate);
  if (effective === null) return { error: "Enter a valid last-updated date." };

  const trial = Number(trialDays);
  if (!Number.isFinite(trial) || !Number.isInteger(trial) || trial < 0 || trial > 365) {
    return { error: "The trial length must be a whole number of days between 0 and 365." };
  }
  const priceNotice = Number(priceNoticeDays);
  if (
    !Number.isFinite(priceNotice) ||
    !Number.isInteger(priceNotice) ||
    priceNotice < 1 ||
    priceNotice > 365
  ) {
    return { error: "Price-change notice must be a whole number of days between 1 and 365." };
  }

  const economics = computeSubscriptionEconomics({
    monthlyPrice,
    annualPrice,
    taxPercent,
    purchaseDate,
    renewalDate,
    cancelDate,
  });
  if (economics.error) return { error: economics.error };

  const included = CLAUSES.filter((clause) => includedIds.includes(clause.id));
  if (included.length === 0) {
    return { error: "Include at least one clause — empty terms are worse than none." };
  }

  const set = new Set(practices);
  const money = currencyFormatter(currency);
  const percent = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });

  const tierParts = [];
  if (set.has("free")) {
    tierParts.push("A free tier gives you the public issues by email as they are published.");
  }
  if (set.has("paid")) {
    tierParts.push(
      "A paid tier adds the subscriber-only issues, the full archive and anything else listed on the subscribe page at the time you join.",
    );
  }
  if (set.has("founding")) {
    tierParts.push("A founding tier is the paid tier at a higher voluntary price.");
  }
  const tierSummary =
    tierParts.length > 0
      ? tierParts.join(" ")
      : `${publication} is published by ${owner} and delivered by email.`;

  const priceSummary = set.has("annual")
    ? `The paid tier costs ${money.format(Number(monthlyPrice))} a month or ${money.format(Number(annualPrice))} a year. Twelve monthly payments come to ${money.format(economics.monthlyYearCost)}, so the annual plan saves ${percent.format(economics.annualSavingPercent)}% and works out at ${money.format(economics.effectiveMonthly)} a month.`
    : `The paid tier costs ${money.format(Number(monthlyPrice))} a month, charged on the same day each month.`;

  const renewalSummary = set.has("annual")
    ? `A subscription renews automatically at the end of each term — monthly on the same date each month, annually on the anniversary — at the price then shown on the subscribe page, until you cancel.`
    : `A subscription renews automatically each month on the same date, at the price then shown on the subscribe page, until you cancel.`;

  const refundSummary = (() => {
    switch (refundPolicyId) {
      case "prorated":
        return `Cancel mid-term and we refund the unused part. On the example in these terms — an annual subscription of ${money.format(Number(annualPrice))} starting ${formatStamp(parseIsoDate(purchaseDate))} and cancelled on ${formatStamp(parseIsoDate(cancelDate))}, leaving ${economics.unusedDays} of ${economics.termDays} days — that is ${money.format(economics.proratedRefund)}.`;
      case "no-refund-run-out":
        return `We do not refund the unused part of a term. Cancelling stops the next charge and your access runs to the end of the period you have already paid for — on the example in these terms, ${economics.unusedDays} days of the ${economics.termDays}-day term remain and stay available to you.`;
      default:
        return `A full refund is available inside the withdrawal window and not afterwards, at which point access simply runs to the end of the paid term. On the example in these terms that window closes on ${economics.withdrawalDeadlineLong}, leaving ${economics.unusedDays} of ${economics.termDays} days to run.`;
    }
  })();

  const archiveSummary =
    archiveAfterCancel === "keep-access"
      ? "After cancelling you keep access to the issues published while you were a subscriber, and lose access to anything published afterwards."
      : archiveAfterCancel === "all-public"
        ? "The archive is public, so cancelling changes nothing about what you can read — you simply stop receiving subscriber-only issues by email."
        : "After cancelling you lose access to the subscriber-only archive at the end of the paid period, and keep access to the public issues.";

  const values = {
    publication,
    publisher: owner,
    contact,
    jurisdiction: law,
    cadence: clean(cadence),
    tierSummary,
    priceSummary,
    renewalSummary,
    refundSummary,
    archiveSummary,
    trialDays: String(trial),
    priceNoticeDays: String(priceNotice),
    purchaseLong: formatStamp(parseIsoDate(purchaseDate)),
    withdrawalDeadlineLong: economics.withdrawalDeadlineLong,
    renewalLong: formatStamp(parseIsoDate(renewalDate)),
    reminderFromLong: economics.reminderFromLong,
    reminderToLong: economics.reminderToLong,
    effectiveLong: formatStamp(effective),
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
        ? "Every set of subscription terms needs this clause."
        : `Needed because: ${clause.requiredFor
            .filter((id) => set.has(id))
            .map((id) => PRACTICES.find((entry) => entry.id === id)?.label ?? id)
            .join("; ")}.`,
    }));

  const warnings = [];
  if (set.has("paid") && !includedIds.includes("auto-renewal")) {
    warnings.push(
      "A recurring charge with no automatic renewal clause fails 15 U.S.C. section 8403, which requires the material terms to be disclosed clearly and conspicuously before billing information is taken.",
    );
  }
  if (set.has("annual") && !includedIds.includes("renewal-reminder")) {
    warnings.push(
      `California's Automatic Renewal Law requires a reminder ${RENEWAL_REMINDER_MIN_DAYS} to ${RENEWAL_REMINDER_MAX_DAYS} days before an annual subscription renews. Sending it to everyone is simpler than segmenting by state.`,
    );
  }
  if (set.has("eu") && !includedIds.includes("withdrawal")) {
    warnings.push(
      `EU and UK consumers have ${WITHDRAWAL_DAYS} days to withdraw from a distance contract. You only lose that obligation if you took express consent and an acknowledgement at checkout, and the terms have to say so.`,
    );
  }
  if (set.has("trial") && !includedIds.includes("trial")) {
    warnings.push(
      "A trial that converts to a paid plan is a negative option feature. The conversion date and amount must be disclosed before the trial starts, not only in the terms.",
    );
  }
  if (economics.annualSavingPercent < 0 && set.has("annual")) {
    warnings.push(
      `The annual plan costs more than twelve monthly payments (${money.format(Number(annualPrice))} against ${money.format(economics.monthlyYearCost)}). Check the two prices before publishing.`,
    );
  }
  if (set.has("founding") && !includedIds.includes("founding")) {
    warnings.push(
      "A lifetime or founding tier makes an open-ended promise. Say what happens if the publication closes, or the promise is read as lifetime of the subscriber.",
    );
  }

  const lines = [
    `${publication} — Subscription Terms`,
    `Published by ${owner}. Last updated ${formatStamp(effective)}.`,
    "",
  ];
  included.forEach((clause, index) => {
    lines.push(`${index + 1}. ${clause.title}`);
    lines.push(fill(clause.body));
    lines.push("");
  });
  lines.push(`Billing questions and cancellations: ${contact}.`);

  const terms = lines.join("\n");

  return {
    terms,
    coveragePercent,
    missing,
    warnings,
    economics,
    wordCount: terms.split(/\s+/).filter(Boolean).length,
    included: included.map((clause) => ({ id: clause.id, title: clause.title })),
  };
}
