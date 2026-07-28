/**
 * Refund request email builder.
 *
 * Composes the email and works out the dates that give a refund request its force:
 * days since delivery, whether that still falls inside the consumer-protection window
 * for the chosen region, and the dated deadline by which you expect a reply.
 *
 * Informational only — this is not legal advice. Pure module: no React, no DOM,
 * no clock reads (the "today" date is passed in).
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86400000;

/** A fortnight is the customary notice period before escalating a written complaint. */
export const DEFAULT_NOTICE_DAYS = 14;
export const MIN_NOTICE_DAYS = 3;
export const MAX_NOTICE_DAYS = 60;

/**
 * Consumer-protection reference points by region. Each `windowDays` is the headline
 * statutory period, counted from delivery unless the note says otherwise.
 */
export const REGIONS = [
  {
    id: "in",
    label: "India",
    currency: "INR",
    locale: "en-IN",
    statute: "the Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules, 2020",
    windowDays: 30,
    windowNote:
      "India has no single statutory refund window for all goods — the seller's published return policy governs, and e-commerce sellers must display it. A consumer complaint can be filed with the District Commission within two years of the cause of action.",
    escalation:
      "the National Consumer Helpline (1915) and, if that fails, the District Consumer Disputes Redressal Commission",
  },
  {
    id: "uk",
    label: "United Kingdom",
    currency: "GBP",
    locale: "en-GB",
    statute: "the Consumer Rights Act 2015 and the Consumer Contracts Regulations 2013",
    windowDays: 30,
    windowNote:
      "Faulty goods carry a 30-day short-term right to reject for a full refund under the Consumer Rights Act 2015. Separately, most online orders can be cancelled within 14 days of delivery under the Consumer Contracts Regulations 2013.",
    escalation: "an alternative dispute resolution scheme, and then the small claims track",
  },
  {
    id: "eu",
    label: "European Union",
    currency: "EUR",
    locale: "en-IE",
    statute: "the Consumer Rights Directive 2011/83/EU as implemented in national law",
    windowDays: 14,
    windowNote:
      "Distance and off-premises contracts carry a 14-day right of withdrawal running from the day the goods are received, with a further 14 days to send them back.",
    escalation: "the European Consumer Centre in your country",
  },
  {
    id: "us",
    label: "United States",
    currency: "USD",
    locale: "en-US",
    statute: "the seller's stated return policy and, for card payments, the Fair Credit Billing Act",
    windowDays: 30,
    windowNote:
      "There is no federal refund right for a change of mind; the seller's published policy governs. For a credit-card billing error, a written dispute must reach the card issuer within 60 days of the statement showing the charge.",
    escalation: "your card issuer's dispute process and the state attorney general's consumer division",
  },
];

export const REASONS = [
  {
    id: "faulty",
    label: "Item arrived faulty or damaged",
    sentence: (item) => `The ${item} was faulty on arrival and cannot be used as intended.`,
    ask: "a full refund to my original payment method",
  },
  {
    id: "not-as-described",
    label: "Not as described",
    sentence: (item) =>
      `The ${item} delivered does not match the description on the product page I ordered from.`,
    ask: "a full refund to my original payment method",
  },
  {
    id: "never-arrived",
    label: "Never arrived",
    sentence: (item) => `The ${item} has still not been delivered.`,
    ask: "a full refund, as the goods were never received",
  },
  {
    id: "cancelled",
    label: "Order cancelled but not refunded",
    sentence: (item) => `The order for the ${item} was cancelled but no refund has reached my account.`,
    ask: "the refund already due to me, credited to the original payment method",
  },
  {
    id: "duplicate",
    label: "Charged twice",
    sentence: (item) => `I was charged twice for the same ${item}.`,
    ask: "a refund of the duplicate charge",
  },
  {
    id: "service",
    label: "Service not delivered",
    sentence: (item) => `The ${item} I paid for was not provided.`,
    ask: "a full refund of the amount paid",
  },
];

export const TONES = [
  {
    id: "firm",
    label: "Firm",
    opener: "I am writing to request a refund.",
    closer: (deadline, escalation) =>
      `Please confirm the refund in writing by ${deadline}. If I have no reply by that date I will take the matter to ${escalation}.`,
  },
  {
    id: "polite",
    label: "Polite",
    opener: "I would like to ask for a refund on the order below.",
    closer: (deadline) =>
      `A written reply by ${deadline} would be appreciated so I know where this stands.`,
  },
  {
    id: "final",
    label: "Final notice",
    opener: "This is a final written request for a refund before I escalate.",
    closer: (deadline, escalation) =>
      `Unless the refund is confirmed by ${deadline}, I will refer this to ${escalation} and treat this email as my written notice.`,
  },
];

export function parseIsoDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return date;
}

const LONG_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(date) {
  return date instanceof Date && !Number.isNaN(date.getTime()) ? LONG_DATE.format(date) : "";
}

export function daysBetween(from, to) {
  if (!(from instanceof Date) || !(to instanceof Date)) return 0;
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export function addDays(date, days) {
  if (!(date instanceof Date)) return null;
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function formatMoney(amount, currency, locale) {
  if (!Number.isFinite(amount)) return "";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

/**
 * Build the refund request email.
 * Returns { subject, body, daysSinceDelivery, ... } or { error }.
 */
export function buildRefundEmail(input = {}) {
  const region = REGIONS.find((item) => item.id === clean(input.regionId)) || REGIONS[0];
  const reason = REASONS.find((item) => item.id === clean(input.reasonId)) || REASONS[0];
  const tone = TONES.find((item) => item.id === clean(input.toneId)) || TONES[0];

  const customerName = clean(input.customerName);
  if (!customerName) return { error: "Add your name — an unsigned refund request gets ignored." };

  const seller = clean(input.seller);
  if (!seller) return { error: "Add the seller or company name." };

  const orderNumber = clean(input.orderNumber);
  if (!orderNumber) {
    return { error: "Add the order or invoice number — it is the first thing support will ask for." };
  }

  const item = clean(input.item) || "item";

  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter the amount paid as a positive number." };
  }

  const orderDate = parseIsoDate(input.orderDate);
  if (!orderDate) return { error: "Pick a valid order date." };

  const deliveryDate = parseIsoDate(input.deliveryDate) || orderDate;
  if (deliveryDate.getTime() < orderDate.getTime()) {
    return { error: "The delivery date cannot be before the order date." };
  }

  const today = parseIsoDate(input.today);
  if (!today) return { error: "Pick a valid date for today." };
  if (today.getTime() < orderDate.getTime()) {
    return { error: "Today cannot be before the order date." };
  }

  const noticeDays = Number(input.noticeDays);
  if (!Number.isFinite(noticeDays) || noticeDays < MIN_NOTICE_DAYS || noticeDays > MAX_NOTICE_DAYS) {
    return {
      error: `Give the seller between ${MIN_NOTICE_DAYS} and ${MAX_NOTICE_DAYS} days to reply.`,
    };
  }

  const daysSinceOrder = daysBetween(orderDate, today);
  const daysSinceDelivery = daysBetween(deliveryDate, today);
  const deadline = addDays(today, Math.round(noticeDays));
  const withinWindow = daysSinceDelivery <= region.windowDays;
  const daysLeft = region.windowDays - daysSinceDelivery;

  const money = formatMoney(amount, region.currency, region.locale);
  const contactedBefore = clean(input.previousContact);
  const preferredOutcome = clean(input.preferredOutcome) || reason.ask;

  const subject = `Refund request — order ${orderNumber} — ${money}`;

  const lines = [];
  lines.push(`Dear ${clean(input.recipient) || `${seller} customer service`},`);
  lines.push("");
  lines.push(tone.opener);
  lines.push("");
  lines.push("Order details:");
  lines.push(`  Order / invoice number: ${orderNumber}`);
  lines.push(`  Item: ${item}`);
  lines.push(`  Amount paid: ${money}`);
  lines.push(`  Order date: ${formatDate(orderDate)}`);
  lines.push(`  Delivery date: ${formatDate(deliveryDate)} (${daysSinceDelivery} days ago)`);
  lines.push("");
  lines.push(reason.sentence(item));
  if (contactedBefore) lines.push(contactedBefore);
  lines.push("");
  lines.push(`I am asking for ${preferredOutcome}.`);
  if (withinWindow) {
    lines.push(
      `This request is made ${daysSinceDelivery} days after delivery, within the ${region.windowDays}-day period commonly relied on under ${region.statute}.`,
    );
  } else {
    lines.push(
      `I am aware that ${daysSinceDelivery} days have passed since delivery. I am relying on your published returns policy and on ${region.statute}.`,
    );
  }
  lines.push("");
  lines.push(tone.closer(formatDate(deadline), region.escalation));
  lines.push("");
  lines.push("Yours sincerely,");
  lines.push(customerName);
  const contact = clean(input.contact);
  if (contact) lines.push(contact);

  const checklist = [
    { label: "Order or invoice number included", ok: true },
    { label: "Exact amount and dates stated", ok: true },
    { label: "One clear ask, not a list of complaints", ok: preferredOutcome.length > 0 },
    { label: "A dated deadline for the reply", ok: true },
    { label: "Names what happens if the deadline passes", ok: tone.id !== "polite" },
    { label: "Mentions earlier contact attempts", ok: Boolean(contactedBefore) },
    { label: "Still inside the headline statutory window", ok: withinWindow },
  ];

  return {
    subject,
    body: lines.join("\n"),
    money,
    daysSinceOrder,
    daysSinceDelivery,
    daysLeft,
    withinWindow,
    windowDays: region.windowDays,
    windowNote: region.windowNote,
    regionLabel: region.label,
    statute: region.statute,
    escalation: region.escalation,
    deadlineLabel: formatDate(deadline),
    orderDateLabel: formatDate(orderDate),
    deliveryDateLabel: formatDate(deliveryDate),
    toneLabel: tone.label,
    checklist,
    score: checklist.filter((entry) => entry.ok).length,
    scoreMax: checklist.length,
  };
}
