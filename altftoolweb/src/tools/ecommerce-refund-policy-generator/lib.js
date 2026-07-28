/**
 * Ecommerce refund policy generator — pure logic.
 *
 * The generator writes plain-language policy text and checks the numbers you
 * choose against the statutory minimums of the market you sell into. It is a
 * drafting aid, not legal advice.
 */

/**
 * Statutory reference points per market.
 *
 * EU  : Consumer Rights Directive 2011/83/EU — 14-day right of withdrawal from
 *       delivery, refund within 14 days of being told of the withdrawal, and
 *       the trader must refund standard outbound delivery costs too.
 * UK  : Consumer Contracts (Information, Cancellation and Additional Charges)
 *       Regulations 2013 — 14 days to cancel from delivery, a further 14 days
 *       to send the goods back, refund within 14 days.
 * IN  : Consumer Protection (E-Commerce) Rules, 2020 — a seller must not refuse
 *       to take back goods or refund the price where the goods are defective,
 *       deficient, delivered late, or do not match the advertised description.
 *       No fixed change-of-mind window is prescribed.
 * US  : No federal return-window mandate. The FTC Mail, Internet, or Telephone
 *       Order Merchandise Rule requires shipment within the promised time (or
 *       30 days if none was stated) and a prompt refund if you cannot ship.
 */
export const MARKET_PRESETS = [
  {
    id: "in",
    label: "India",
    minWindowDays: null,
    refundWithinDays: null,
    refundsOutboundShipping: false,
    allowsRestockingFee: true,
    statute: "Consumer Protection (E-Commerce) Rules, 2020",
    statutoryLine:
      "Under the Consumer Protection (E-Commerce) Rules, 2020 a seller cannot refuse to take back goods or refund the price where the goods are defective, deficient, delivered late, or do not match the description advertised.",
  },
  {
    id: "eu",
    label: "European Union",
    minWindowDays: 14,
    refundWithinDays: 14,
    refundsOutboundShipping: true,
    allowsRestockingFee: false,
    statute: "Consumer Rights Directive 2011/83/EU",
    statutoryLine:
      "Consumers in the EU have a statutory 14-day right of withdrawal from the day the goods are received, with the refund due within 14 days of being told of the withdrawal, including standard outbound delivery costs.",
  },
  {
    id: "uk",
    label: "United Kingdom",
    minWindowDays: 14,
    refundWithinDays: 14,
    refundsOutboundShipping: true,
    allowsRestockingFee: false,
    statute: "Consumer Contracts Regulations 2013",
    statutoryLine:
      "Under the Consumer Contracts Regulations 2013 a consumer has 14 days from delivery to cancel, a further 14 days to send the goods back, and must be refunded within 14 days of the goods being received back or proof of return.",
  },
  {
    id: "us",
    label: "United States",
    minWindowDays: null,
    refundWithinDays: null,
    refundsOutboundShipping: false,
    allowsRestockingFee: true,
    statute: "FTC Mail, Internet, or Telephone Order Merchandise Rule",
    statutoryLine:
      "There is no federal return-window requirement in the United States, but the FTC Mail, Internet, or Telephone Order Merchandise Rule requires you to ship within the time you promised (or 30 days if you promised none) and to refund promptly if you cannot.",
  },
  {
    id: "other",
    label: "Other / multiple markets",
    minWindowDays: null,
    refundWithinDays: null,
    refundsOutboundShipping: false,
    allowsRestockingFee: true,
    statute: "",
    statutoryLine:
      "Local consumer law may give buyers stronger rights than this policy. Where it does, the law applies and this policy does not limit it.",
  },
];

/** Condition requirements a seller can attach to a return. */
export const CONDITION_RULES = [
  { id: "unused", label: "Unused and unworn", text: "the item is unused, unworn and undamaged" },
  { id: "packaging", label: "Original packaging", text: "the original packaging and box are returned with the item" },
  { id: "tags", label: "Tags still attached", text: "all tags, labels and seals are still attached and intact" },
  { id: "accessories", label: "All accessories included", text: "every accessory, manual, cable and free gift shipped with the order is included" },
  { id: "invoice", label: "Copy of the invoice", text: "a copy of the invoice or the order number is enclosed" },
];

/** Categories that are commonly excluded from change-of-mind returns. */
export const EXCLUSION_RULES = [
  { id: "perishable", label: "Perishable goods", text: "perishable food, flowers and other goods that spoil quickly" },
  { id: "hygiene", label: "Hygiene and intimate items", text: "innerwear, swimwear, earrings and other hygiene-sensitive items once the seal is broken" },
  { id: "custom", label: "Personalised or made to order", text: "personalised, engraved or made-to-order items" },
  { id: "digital", label: "Digital downloads", text: "digital downloads and software keys once the download has started or the key has been revealed" },
  { id: "giftcard", label: "Gift cards", text: "gift cards and store credit vouchers" },
  { id: "media", label: "Opened media", text: "sealed media such as CDs, DVDs and games once the seal is broken" },
  { id: "clearance", label: "Clearance / final sale", text: "items sold as clearance or marked final sale" },
];

export const RETURN_SHIPPING_OPTIONS = [
  {
    id: "customer",
    label: "Customer pays return shipping",
    text: "Return shipping is arranged and paid for by the customer, except where the item is faulty, damaged, incorrect or not as described — in those cases we cover the cost.",
  },
  {
    id: "seller",
    label: "We pay return shipping (free returns)",
    text: "We pay return shipping on every accepted return. A prepaid label will be emailed to you once your return is approved.",
  },
  {
    id: "pickup",
    label: "We arrange a reverse pickup",
    text: "We arrange a reverse pickup from your delivery address. Where the return is a change of mind, the pickup charge shown at approval is deducted from your refund.",
  },
];

export const REFUND_METHOD_OPTIONS = [
  {
    id: "original",
    label: "Original payment method only",
    text: "Refunds are issued to the original payment method used for the order.",
  },
  {
    id: "credit",
    label: "Store credit only",
    text: "Refunds are issued as store credit that can be used against any future order.",
  },
  {
    id: "choice",
    label: "Customer chooses",
    text: "You can choose a refund to your original payment method or store credit, whichever suits you better.",
  },
];

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);
const clean = (value) => (typeof value === "string" ? value.trim() : "");

/** Very light email sanity check — enough to catch typos, not to validate RFC 5322. */
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

const listToSentence = (items) => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
};

/**
 * Generate a return and refund policy.
 *
 * @param {object} input
 * @param {string} input.storeName            Trading name shown to customers.
 * @param {string} input.legalName            Registered legal entity name (optional).
 * @param {string} input.contactEmail         Support email address.
 * @param {string} input.contactAddress       Postal address for returns (optional).
 * @param {string} input.market               One of the MARKET_PRESETS ids.
 * @param {number} input.returnWindowDays     Days from delivery to raise a return.
 * @param {number} input.refundProcessingDays Working days to refund after the return is received.
 * @param {number} input.restockingFeePercent Restocking fee as a percentage, 0 for none.
 * @param {string[]} input.conditionIds       CONDITION_RULES ids that apply.
 * @param {string[]} input.exclusionIds       EXCLUSION_RULES ids that apply.
 * @param {string} input.returnShipping       One of the RETURN_SHIPPING_OPTIONS ids.
 * @param {string} input.refundMethod         One of the REFUND_METHOD_OPTIONS ids.
 * @param {boolean} input.offerExchange       Whether exchanges are offered.
 * @param {string} input.effectiveDate        "YYYY-MM-DD".
 * @returns {object} policy, or { error } for invalid input.
 */
export function generateRefundPolicy(input) {
  const {
    storeName,
    legalName,
    contactEmail,
    contactAddress,
    market,
    returnWindowDays,
    refundProcessingDays,
    restockingFeePercent,
    conditionIds,
    exclusionIds,
    returnShipping,
    refundMethod,
    offerExchange,
    effectiveDate,
  } = input || {};

  const name = clean(storeName);
  if (!name) return { error: "Enter the store name that customers will recognise." };

  const email = clean(contactEmail);
  if (!email) return { error: "Enter a support email address so customers can start a return." };
  if (!looksLikeEmail(email)) return { error: "That support email address does not look valid." };

  if (!isNumber(returnWindowDays) || !isNumber(refundProcessingDays) || !isNumber(restockingFeePercent)) {
    return { error: "Enter a number for the return window, refund time and restocking fee." };
  }
  if (returnWindowDays < 0 || returnWindowDays > 365) {
    return { error: "The return window must be between 0 and 365 days." };
  }
  if (refundProcessingDays < 1 || refundProcessingDays > 60) {
    return { error: "Refund processing time should be between 1 and 60 days." };
  }
  if (restockingFeePercent < 0 || restockingFeePercent > 50) {
    return { error: "A restocking fee above 50% is not workable — enter 0 to 50." };
  }

  const dateLabel = formatLongDate(effectiveDate);
  if (!dateLabel) return { error: "Enter the effective date as a real calendar date." };

  const preset = MARKET_PRESETS.find((entry) => entry.id === market) || MARKET_PRESETS[0];
  const shipping =
    RETURN_SHIPPING_OPTIONS.find((entry) => entry.id === returnShipping) || RETURN_SHIPPING_OPTIONS[0];
  const refund =
    REFUND_METHOD_OPTIONS.find((entry) => entry.id === refundMethod) || REFUND_METHOD_OPTIONS[0];

  const conditions = CONDITION_RULES.filter((rule) =>
    Array.isArray(conditionIds) ? conditionIds.includes(rule.id) : false,
  );
  const exclusions = EXCLUSION_RULES.filter((rule) =>
    Array.isArray(exclusionIds) ? exclusionIds.includes(rule.id) : false,
  );

  const entity = clean(legalName) || name;
  const address = clean(contactAddress);
  const windowDays = Math.round(returnWindowDays);
  const processingDays = Math.round(refundProcessingDays);
  const fee = Math.round(restockingFeePercent * 10) / 10;

  // Compliance checks against the chosen market.
  const warnings = [];
  if (preset.minWindowDays !== null && windowDays < preset.minWindowDays) {
    warnings.push(
      `${preset.label} requires at least ${preset.minWindowDays} days to cancel (${preset.statute}). A ${windowDays}-day window is shorter than the law allows.`,
    );
  }
  if (preset.refundWithinDays !== null && processingDays > preset.refundWithinDays) {
    warnings.push(
      `${preset.label} requires the refund within ${preset.refundWithinDays} days (${preset.statute}). ${processingDays} days is longer than that.`,
    );
  }
  if (fee > 0 && !preset.allowsRestockingFee) {
    warnings.push(
      `A restocking fee cannot be charged on a statutory cancellation in ${preset.label}. Apply it only to returns outside the ${preset.minWindowDays}-day statutory window.`,
    );
  }
  if (preset.refundsOutboundShipping) {
    warnings.push(
      `In ${preset.label} the refund must also cover the standard outbound delivery charge the customer originally paid.`,
    );
  }
  if (windowDays === 0) {
    warnings.push(
      "A zero-day window means you accept no change-of-mind returns at all. Faulty, damaged or misdescribed goods must still be dealt with.",
    );
  }
  if (exclusions.length === 0) {
    warnings.push(
      "No excluded categories are selected, so this policy promises returns on everything you sell — including perishables and personalised goods.",
    );
  }

  // ---- Policy body ----
  const conditionSentence =
    conditions.length > 0
      ? `We can only accept a return when ${listToSentence(conditions.map((rule) => rule.text))}.`
      : "We accept returns in any condition, provided the item is identifiable as one we sold.";

  const exclusionSentence =
    exclusions.length > 0
      ? `The following cannot be returned for a change of mind: ${listToSentence(exclusions.map((rule) => rule.text))}.`
      : "No product categories are excluded from this policy.";

  const feeSentence =
    fee > 0
      ? `A restocking fee of ${fee}% of the item price is deducted from change-of-mind refunds. No restocking fee applies when the item was faulty, damaged, incorrect or not as described.`
      : "We do not charge a restocking fee.";

  const sections = [
    {
      id: "overview",
      heading: "1. Returns and refunds at a glance",
      body: [
        `${entity} ("${name}", "we", "us") wants you to be happy with what you ordered. This policy explains when you can return an item, how to do it, and when your money comes back.`,
        windowDays > 0
          ? `You have ${windowDays} days from the day your order is delivered to tell us you want to return an item.`
          : "We do not accept change-of-mind returns. Faulty, damaged, incorrect or misdescribed items are always covered.",
        `Approved refunds are processed within ${processingDays} days of the returned item reaching us.`,
      ],
    },
    {
      id: "window",
      heading: "2. Your return window",
      body: [
        windowDays > 0
          ? `Contact us within ${windowDays} days of delivery to start a return. Requests raised after ${windowDays} days can only be considered where the item is faulty or not as described.`
          : "Change-of-mind returns are not offered. Contact us as soon as you notice a fault or an error with your order.",
        "The clock starts on the date the courier records delivery, not the date you placed the order.",
      ],
    },
    {
      id: "condition",
      heading: "3. Condition of returned items",
      body: [
        conditionSentence,
        "We may reduce your refund to reflect any loss in value caused by handling beyond what is needed to check the item, in the same way you would be able to inspect it in a shop.",
      ],
    },
    {
      id: "exclusions",
      heading: "4. Items we cannot take back",
      body: [
        exclusionSentence,
        "These exclusions never apply to items that arrive faulty, damaged, incorrect or materially different from their description.",
      ],
    },
    {
      id: "how",
      heading: "5. How to start a return",
      body: [
        `Email ${email} with your order number, the item you want to return and the reason. We will confirm your return and tell you where to send it.`,
        address
          ? `Once approved, send the item to: ${address}. Please do not post anything back before your return is confirmed — unapproved parcels may be refused.`
          : "Once approved, we will give you the return address. Please do not post anything back before your return is confirmed — unapproved parcels may be refused.",
      ],
    },
    {
      id: "shipping",
      heading: "6. Return shipping costs",
      body: [shipping.text, "Please keep your proof of postage until the refund reaches you."],
    },
    {
      id: "refunds",
      heading: "7. Refunds",
      body: [
        refund.text,
        `Once we receive and check the returned item, your refund is issued within ${processingDays} days. Your bank or card issuer may take a few extra days to show it.`,
        feeSentence,
      ],
    },
    {
      id: "exchange",
      heading: "8. Exchanges",
      body: [
        offerExchange
          ? "If you would rather swap an item for a different size, colour or variant, say so when you contact us. Exchanges are subject to stock; if the replacement is unavailable we refund you instead."
          : "We do not offer direct exchanges. Return the item for a refund and place a new order for the replacement.",
      ],
    },
    {
      id: "faulty",
      heading: "9. Damaged, faulty or wrong items",
      body: [
        `If an item arrives damaged, faulty, incorrect or not as described, email ${email} with photographs within 48 hours of delivery. We will arrange a replacement or a full refund, including any delivery charge you paid, and we cover the return cost.`,
        preset.statutoryLine,
      ],
    },
    {
      id: "cancel",
      heading: "10. Cancelling before dispatch",
      body: [
        `You can cancel any order that has not yet been dispatched by emailing ${email}. Cancelled orders are refunded in full to the original payment method.`,
      ],
    },
    {
      id: "rights",
      heading: "11. Your statutory rights",
      body: [
        "Nothing in this policy limits the rights you have under consumer law. Where local law gives you a longer return window or a stronger remedy, that law applies.",
      ],
    },
    {
      id: "contact",
      heading: "12. Contact us",
      body: [
        address
          ? `${entity}, ${address}. Email: ${email}.`
          : `${entity}. Email: ${email}.`,
        `This policy is effective from ${dateLabel}.`,
      ],
    },
  ];

  const policyText = [
    `${name} — Return and Refund Policy`,
    `Effective ${dateLabel}`,
    "",
    ...sections.flatMap((section) => [section.heading, ...section.body, ""]),
  ]
    .join("\n")
    .trim();

  const keyFacts = [
    ["Return window", windowDays > 0 ? `${windowDays} days from delivery` : "No change-of-mind returns"],
    ["Refund issued within", `${processingDays} days of receiving the return`],
    ["Return shipping", shipping.label],
    ["Refund method", refund.label],
    ["Restocking fee", fee > 0 ? `${fee}%` : "None"],
    ["Exchanges", offerExchange ? "Offered, subject to stock" : "Not offered"],
    ["Excluded categories", exclusions.length > 0 ? String(exclusions.length) : "None"],
    ["Market rules applied", preset.label],
  ];

  return {
    storeName: name,
    entity,
    market: preset,
    windowDays,
    processingDays,
    restockingFeePercent: fee,
    conditions,
    exclusions,
    shipping,
    refund,
    offerExchange: Boolean(offerExchange),
    effectiveDateLabel: dateLabel,
    sections,
    policyText,
    wordCount: policyText.split(/\s+/).filter(Boolean).length,
    keyFacts,
    warnings,
  };
}
