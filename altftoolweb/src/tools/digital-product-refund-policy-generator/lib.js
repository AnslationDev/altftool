/**
 * Digital product refund policy generator — pure logic.
 *
 * Digital goods are treated differently from physical goods in most consumer
 * law: a seller can switch off the change-of-mind right, but only by getting an
 * express waiver before delivery starts, and never for content that is faulty
 * or not as described. This module writes that policy and flags the settings
 * that would not stand up. It is a drafting aid, not legal advice.
 */

/**
 * Statutory reference points per market.
 *
 * EU : Consumer Rights Directive 2011/83/EU, Article 16(m) — the withdrawal
 *      right does not apply to digital content supplied without a tangible
 *      medium where performance began with the consumer's prior express
 *      consent and their acknowledgement that the right is thereby lost.
 *      Directive (EU) 2019/770 still gives remedies for non-conforming content.
 * UK : Consumer Contracts Regulations 2013, reg. 37 — the same waiver
 *      mechanism. The Consumer Rights Act 2015 requires digital content to be
 *      of satisfactory quality, fit for purpose and as described, with repair,
 *      replacement or a price reduction as remedies.
 * IN : Consumer Protection (E-Commerce) Rules, 2020 — a seller cannot refuse a
 *      refund where the service is deficient or not as described.
 * US : No federal refund mandate for digital goods; the applicable rules are
 *      usually the app store's or payment processor's.
 */
export const MARKET_PRESETS = [
  {
    id: "eu",
    label: "European Union",
    requiresExpressWaiver: true,
    statute: "Consumer Rights Directive 2011/83/EU, Article 16(m)",
    waiverLine:
      "Because this is digital content delivered without a physical medium, EU law lets us disapply the 14-day withdrawal right — but only where you gave prior express consent to immediate delivery and acknowledged that you lose the right of withdrawal by doing so.",
    statutoryLine:
      "This does not affect your rights under Directive (EU) 2019/770 where the content is faulty, incomplete or does not match its description.",
  },
  {
    id: "uk",
    label: "United Kingdom",
    requiresExpressWaiver: true,
    statute: "Consumer Contracts Regulations 2013, reg. 37",
    waiverLine:
      "Because this is digital content supplied immediately, UK law lets us disapply the 14-day cancellation right — but only where you expressly consented to immediate supply and acknowledged that you lose the right to cancel.",
    statutoryLine:
      "Your rights under the Consumer Rights Act 2015 remain: digital content must be of satisfactory quality, fit for purpose and as described.",
  },
  {
    id: "in",
    label: "India",
    requiresExpressWaiver: false,
    statute: "Consumer Protection (E-Commerce) Rules, 2020",
    waiverLine:
      "Digital products are delivered instantly and cannot be returned once accessed, so change-of-mind refunds are not offered.",
    statutoryLine:
      "Under the Consumer Protection (E-Commerce) Rules, 2020 we will still refund you where the product is deficient or does not match the description advertised.",
  },
  {
    id: "us",
    label: "United States",
    requiresExpressWaiver: false,
    statute: "No federal digital refund mandate",
    waiverLine:
      "Digital products are delivered instantly and cannot be returned once downloaded or accessed, so change-of-mind refunds are not offered.",
    statutoryLine:
      "State consumer protection law and your card issuer's rules still apply, as do any refund rules of the app store you bought through.",
  },
  {
    id: "other",
    label: "Other / worldwide",
    requiresExpressWaiver: false,
    statute: "",
    waiverLine:
      "Digital products are delivered instantly and cannot be returned once downloaded or accessed, so change-of-mind refunds are not offered.",
    statutoryLine:
      "Where your local consumer law gives you stronger rights than this policy, that law applies and this policy does not limit it.",
  },
];

/** The kinds of digital product this policy can cover. */
export const PRODUCT_TYPES = [
  { id: "ebook", label: "Ebooks and PDFs", noun: "ebook", plural: "ebooks and PDFs", access: "download link" },
  { id: "course", label: "Online course", noun: "course", plural: "online courses", access: "course login" },
  { id: "software", label: "Software or licence key", noun: "licence", plural: "software licences", access: "licence key" },
  { id: "template", label: "Templates and digital assets", noun: "template pack", plural: "templates and digital assets", access: "download link" },
  { id: "membership", label: "Membership or subscription", noun: "membership", plural: "memberships and subscriptions", access: "member login" },
  { id: "media", label: "Audio or video files", noun: "media file", plural: "audio and video files", access: "download link" },
];

/**
 * Scenarios in which a refund is still given. An "always" flag marks the ones
 * that consumer law does not let a seller switch off.
 */
export const REFUND_EXCEPTIONS = [
  {
    id: "duplicate",
    label: "Duplicate purchase",
    always: false,
    text: "you were charged twice for the same product",
  },
  {
    id: "access",
    label: "Delivery or access failed",
    always: true,
    text: "the download or login never worked and we could not fix it for you",
  },
  {
    id: "misdescribed",
    label: "Not as described",
    always: true,
    text: "the product is materially different from what the sales page described",
  },
  {
    id: "faulty",
    label: "Corrupt or broken files",
    always: true,
    text: "the files are corrupt, incomplete or unusable",
  },
  {
    id: "unauthorised",
    label: "Unauthorised transaction",
    always: false,
    text: "the purchase was made without the cardholder's authorisation",
  },
  {
    id: "unaccessed",
    label: "Accidental purchase, not yet accessed",
    always: false,
    text: "you bought by mistake and have not downloaded or opened the product",
  },
  {
    id: "requirements",
    label: "Undisclosed technical requirement",
    always: false,
    text: "the product needs hardware or software that was not disclosed before purchase",
  },
  {
    id: "renewal",
    label: "Unwanted auto-renewal",
    always: false,
    text: "a subscription renewed after you had already cancelled",
  },
];

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);
const clean = (value) => (typeof value === "string" ? value.trim() : "");
const looksLikeEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/** Parse "YYYY-MM-DD" and confirm it is a real calendar date. */
export function parseISODate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean(value));
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return date;
}

/** Human-readable date, e.g. "1 August 2026". */
export function formatLongDate(value) {
  const date = parseISODate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Turn hours into "48 hours" or "3 days" where that reads better. */
export function formatHours(hours) {
  if (!isNumber(hours) || hours <= 0) return "no window";
  if (hours % 24 === 0 && hours >= 24) {
    const days = hours / 24;
    return `${days} day${days === 1 ? "" : "s"}`;
  }
  return `${hours} hour${hours === 1 ? "" : "s"}`;
}

const listToSentence = (items) => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join("; ")}; or ${items[items.length - 1]}`;
};

/**
 * Generate a digital-product refund policy.
 *
 * @param {object} input
 * @param {string} input.sellerName          Trading name.
 * @param {string} input.legalName           Registered entity (optional).
 * @param {string} input.contactEmail        Support email.
 * @param {string} input.productType         One of the PRODUCT_TYPES ids.
 * @param {string} input.market              One of the MARKET_PRESETS ids.
 * @param {boolean} input.waiverAtCheckout   Whether checkout captures an express waiver.
 * @param {string[]} input.exceptionIds      REFUND_EXCEPTIONS ids that apply.
 * @param {number} input.exceptionWindowHours Hours in which an exception must be raised.
 * @param {number} input.refundProcessingDays Days to process an approved refund.
 * @param {boolean} input.prorateSubscriptions Whether part-period subscription refunds are given.
 * @param {string} input.effectiveDate       "YYYY-MM-DD".
 * @returns {object} policy, or { error } for invalid input.
 */
export function generateDigitalRefundPolicy(input) {
  const {
    sellerName,
    legalName,
    contactEmail,
    productType,
    market,
    waiverAtCheckout,
    exceptionIds,
    exceptionWindowHours,
    refundProcessingDays,
    prorateSubscriptions,
    effectiveDate,
  } = input || {};

  const name = clean(sellerName);
  if (!name) return { error: "Enter the name buyers see at checkout." };

  const email = clean(contactEmail);
  if (!email) return { error: "Enter a support email address for refund requests." };
  if (!looksLikeEmail(email)) return { error: "That support email address does not look valid." };

  if (!isNumber(exceptionWindowHours) || !isNumber(refundProcessingDays)) {
    return { error: "Enter a number for the request window and the refund processing time." };
  }
  if (exceptionWindowHours < 1 || exceptionWindowHours > 720) {
    return { error: "The request window should be between 1 hour and 720 hours (30 days)." };
  }
  if (refundProcessingDays < 1 || refundProcessingDays > 60) {
    return { error: "Refund processing time should be between 1 and 60 days." };
  }

  const dateLabel = formatLongDate(effectiveDate);
  if (!dateLabel) return { error: "Enter the effective date as a real calendar date." };

  const preset = MARKET_PRESETS.find((entry) => entry.id === market) || MARKET_PRESETS[0];
  const product = PRODUCT_TYPES.find((entry) => entry.id === productType) || PRODUCT_TYPES[0];
  const exceptions = REFUND_EXCEPTIONS.filter((rule) =>
    Array.isArray(exceptionIds) ? exceptionIds.includes(rule.id) : false,
  );
  const missingMandatory = REFUND_EXCEPTIONS.filter(
    (rule) => rule.always && !exceptions.some((entry) => entry.id === rule.id),
  );

  const entity = clean(legalName) || name;
  const windowHours = Math.round(exceptionWindowHours);
  const processingDays = Math.round(refundProcessingDays);
  const windowLabel = formatHours(windowHours);

  const warnings = [];
  if (preset.requiresExpressWaiver && !waiverAtCheckout) {
    warnings.push(
      `${preset.label} only lets you disapply the 14-day cancellation right if the buyer gives prior express consent to immediate delivery AND acknowledges losing that right (${preset.statute}). Without that checkbox at checkout, a "no refunds" clause is not enforceable there.`,
    );
  }
  if (missingMandatory.length > 0) {
    warnings.push(
      `You have not listed ${missingMandatory
        .map((rule) => rule.label.toLowerCase())
        .join(", ")} as refundable. Consumer law does not let a seller refuse a refund for content that is faulty, undeliverable or not as described, so leaving these out will not hold.`,
    );
  }
  if (windowHours < 24) {
    warnings.push(
      `Only ${windowLabel} to report a problem is very short. Buyers in a different time zone may not even have opened the product yet.`,
    );
  }
  if (product.id === "membership" && !prorateSubscriptions) {
    warnings.push(
      "You are selling a subscription but not offering part-period refunds. Say clearly at checkout that cancelling stops the next renewal rather than refunding the current period.",
    );
  }
  if (exceptions.length === 0) {
    warnings.push(
      "No exceptions are selected at all, which reads as an absolute no-refund policy. Payment processors treat those as a chargeback risk.",
    );
  }

  const exceptionSentence =
    exceptions.length > 0
      ? `We refund in full where: ${listToSentence(exceptions.map((rule) => rule.text))}.`
      : "No refund exceptions are currently listed.";

  const sections = [
    {
      id: "scope",
      heading: "1. What this policy covers",
      body: [
        `${entity} ("${name}", "we", "us") sells ${product.plural}. This policy explains when a purchase can be refunded and when it cannot.`,
        `Every product is delivered digitally — as a ${product.access} — so there is nothing to send back once you have it.`,
      ],
    },
    {
      id: "nogeneral",
      heading: "2. Digital products are not returnable",
      body: [
        `Once your ${product.noun} has been delivered, we do not offer change-of-mind refunds. A digital file cannot be returned or un-downloaded, and access cannot be withdrawn from a copy you already hold.`,
        preset.waiverLine,
      ],
    },
    {
      id: "consent",
      heading: "3. Your consent at checkout",
      body: [
        waiverAtCheckout
          ? "At checkout you tick a box confirming that you want immediate access and that you understand you give up any change-of-mind cancellation right by doing so. We keep a record of that confirmation with your order."
          : "Checkout does not currently capture a separate consent to immediate delivery. Where local law requires that consent before the cancellation right can be disapplied, that law takes precedence over this policy.",
      ],
    },
    {
      id: "exceptions",
      heading: "4. When we do refund",
      body: [
        exceptionSentence,
        `Tell us within ${windowLabel} of purchase so we can look into it. Where the problem is something we can fix — a broken link, a missing file, a licence key that will not activate — we will always try to fix it first, and refund if we cannot.`,
      ],
    },
    {
      id: "request",
      heading: "5. How to request a refund",
      body: [
        `Email ${email} from the address you used to buy, with your order number and a short description of the problem. Screenshots or an error message help us resolve it faster.`,
        "We reply to every refund request, including the ones we decline, and we tell you why.",
      ],
    },
    {
      id: "timing",
      heading: "6. Refund timing and method",
      body: [
        `Approved refunds are issued to the original payment method within ${processingDays} day${processingDays === 1 ? "" : "s"} of approval. Your bank or card issuer may take a few days longer to display it.`,
        "We do not charge a processing fee on refunds.",
      ],
    },
    {
      id: "subscriptions",
      heading: "7. Subscriptions and renewals",
      body: [
        prorateSubscriptions
          ? "You can cancel a subscription at any time. Cancelling stops all future renewals, and we refund the unused part of the current billing period."
          : "You can cancel a subscription at any time. Cancelling stops all future renewals; the current billing period is not refunded and you keep access until it ends.",
        "Renewal reminders are sent to the email address on your account before each charge.",
      ],
    },
    {
      id: "statutory",
      heading: "8. Faulty or misdescribed content",
      body: [
        "Nothing in this policy limits your rights where the product is faulty, incomplete or not as described.",
        preset.statutoryLine,
      ],
    },
    {
      id: "chargebacks",
      heading: "9. Chargebacks",
      body: [
        `Please contact ${email} before raising a chargeback with your bank. A chargeback on a delivered digital product suspends access to your account while the dispute runs, and most disputes are resolved faster by email.`,
      ],
    },
    {
      id: "stores",
      heading: "10. Purchases made through an app store or marketplace",
      body: [
        "If you bought through an app store, marketplace or reseller rather than directly from us, their refund rules apply and the refund has to be requested from them. We cannot refund a payment we never received.",
      ],
    },
    {
      id: "changes",
      heading: "11. Changes to this policy",
      body: [
        `We may update this policy. The version that applies to your order is the one published on the day you bought. This version is effective from ${dateLabel}.`,
      ],
    },
    {
      id: "contact",
      heading: "12. Contact",
      body: [`${entity}. Refund requests and questions: ${email}.`],
    },
  ];

  const policyText = [
    `${name} — Digital Product Refund Policy`,
    `Effective ${dateLabel}`,
    "",
    ...sections.flatMap((section) => [section.heading, ...section.body, ""]),
  ]
    .join("\n")
    .trim();

  const keyFacts = [
    ["Product type", product.label],
    ["Change-of-mind refunds", "Not offered"],
    ["Refund exceptions listed", String(exceptions.length)],
    ["Window to report a problem", windowLabel],
    ["Refund issued within", `${processingDays} day${processingDays === 1 ? "" : "s"}`],
    ["Checkout waiver captured", waiverAtCheckout ? "Yes" : "No"],
    ["Part-period subscription refunds", prorateSubscriptions ? "Yes" : "No"],
    ["Market rules applied", preset.label],
  ];

  return {
    sellerName: name,
    entity,
    product,
    market: preset,
    waiverAtCheckout: Boolean(waiverAtCheckout),
    exceptions,
    missingMandatory,
    windowHours,
    windowLabel,
    processingDays,
    prorateSubscriptions: Boolean(prorateSubscriptions),
    effectiveDateLabel: dateLabel,
    sections,
    policyText,
    wordCount: policyText.split(/\s+/).filter(Boolean).length,
    keyFacts,
    warnings,
  };
}
