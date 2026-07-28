/**
 * Quotation cover letter builder.
 *
 * Prices the line items, applies discount and tax in the order a tax invoice
 * requires (discount first, tax on the discounted value), works out the validity
 * and payment split, and composes the covering note around those numbers.
 *
 * Pure module — no React, no DOM, no clock reads.
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86400000;

/** Combined GST rates notified under India's GST Act (CGST + SGST, or IGST). */
export const GST_SLABS = [0, 5, 12, 18, 28];

/** A quote left open indefinitely invites haggling; two weeks is the common default. */
export const DEFAULT_VALIDITY_DAYS = 15;
export const MIN_VALIDITY_DAYS = 1;
export const MAX_VALIDITY_DAYS = 180;

export const MAX_LINE_ITEMS = 25;

export const TONES = [
  {
    id: "professional",
    label: "Professional",
    opener: (client) => `Dear ${client},`,
    thanks: "Thank you for the opportunity to quote for this work.",
    signOff: "Kind regards,",
  },
  {
    id: "formal",
    label: "Formal",
    opener: (client) => `Dear ${client},`,
    thanks: "We thank you for your enquiry and are pleased to submit our quotation.",
    signOff: "Yours faithfully,",
  },
  {
    id: "direct",
    label: "Direct",
    opener: (client) => `Hi ${client},`,
    thanks: "Here is the quote you asked for.",
    signOff: "Thanks,",
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

export function addDays(date, days) {
  return date instanceof Date ? new Date(date.getTime() + days * MS_PER_DAY) : null;
}

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function formatMoney(amount) {
  return INR.format(Number.isFinite(amount) ? amount : 0);
}

/** Round to paise so repeated percentages never drift. */
function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** One item per line: "Description | quantity | unit price". */
export function parseLineItems(raw) {
  if (typeof raw !== "string") return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, MAX_LINE_ITEMS)
    .map((line) => {
      const parts = line.split("|").map((part) => part.trim());
      const description = parts[0] || "";
      const quantity = parts.length > 1 ? Number(parts[1]) : 1;
      const unitPrice = parts.length > 2 ? Number(parts[2]) : Number(parts[1]);
      return {
        description,
        quantity: Number.isFinite(quantity) ? quantity : NaN,
        unitPrice: Number.isFinite(unitPrice) ? unitPrice : NaN,
      };
    });
}

/**
 * Price the quote. Discount is applied to the subtotal, tax to the discounted value —
 * the order used on a GST tax invoice.
 */
export function computeQuote(items, discountPct, taxPct) {
  const priced = items.map((item) => ({
    ...item,
    lineTotal: round2(item.quantity * item.unitPrice),
  }));
  const subtotal = round2(priced.reduce((sum, item) => sum + item.lineTotal, 0));
  const discount = round2((subtotal * discountPct) / 100);
  const taxable = round2(subtotal - discount);
  const tax = round2((taxable * taxPct) / 100);
  const total = round2(taxable + tax);
  return { priced, subtotal, discount, taxable, tax, total };
}

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

/**
 * Build the quotation covering letter.
 * Returns { subject, body, totals, ... } or { error }.
 */
export function buildQuotationLetter(input = {}) {
  const client = clean(input.client);
  if (!client) return { error: "Add the client contact name the letter is addressed to." };

  const sender = clean(input.sender);
  if (!sender) return { error: "Add your name — the letter has to be signed." };

  const company = clean(input.company);
  const quoteNumber = clean(input.quoteNumber);
  if (!quoteNumber) return { error: "Add a quotation number so the client can reference it." };

  const scope = clean(input.scope);
  if (!scope) return { error: "Describe the scope in one line — what the quote actually covers." };

  const rawItems = parseLineItems(input.items);
  if (rawItems.length === 0) {
    return { error: "Add at least one line item as 'Description | quantity | unit price'." };
  }
  const bad = rawItems.find(
    (item) =>
      !item.description ||
      !Number.isFinite(item.quantity) ||
      !Number.isFinite(item.unitPrice) ||
      item.quantity <= 0 ||
      item.unitPrice < 0,
  );
  if (bad) {
    return {
      error: `Check the line "${bad.description || "(blank)"}" — it needs a description, a quantity above zero and a price.`,
    };
  }

  const discountPct = Number(input.discountPct);
  if (!Number.isFinite(discountPct) || discountPct < 0 || discountPct > 100) {
    return { error: "Discount must be between 0% and 100%." };
  }

  const taxPct = Number(input.taxPct);
  if (!Number.isFinite(taxPct) || taxPct < 0 || taxPct > 100) {
    return { error: "Tax rate must be between 0% and 100%." };
  }

  const advancePct = Number(input.advancePct);
  if (!Number.isFinite(advancePct) || advancePct < 0 || advancePct > 100) {
    return { error: "Advance payment must be between 0% and 100%." };
  }

  const validityDays = Number(input.validityDays);
  if (
    !Number.isFinite(validityDays) ||
    validityDays < MIN_VALIDITY_DAYS ||
    validityDays > MAX_VALIDITY_DAYS
  ) {
    return {
      error: `Validity should be between ${MIN_VALIDITY_DAYS} and ${MAX_VALIDITY_DAYS} days.`,
    };
  }

  const quoteDate = parseIsoDate(input.quoteDate);
  if (!quoteDate) return { error: "Pick a valid quotation date." };

  const leadTimeDays = Number(input.leadTimeDays);
  if (!Number.isFinite(leadTimeDays) || leadTimeDays < 0 || leadTimeDays > 730) {
    return { error: "Delivery lead time must be between 0 and 730 days." };
  }

  const totals = computeQuote(rawItems, discountPct, taxPct);
  const validUntil = addDays(quoteDate, Math.round(validityDays));
  const advance = round2((totals.total * advancePct) / 100);
  const balance = round2(totals.total - advance);

  const subject = `Quotation ${quoteNumber} — ${scope} — ${formatMoney(totals.total)}`;
  const tone = TONES.find((item) => item.id === clean(input.toneId)) || TONES[0];
  const nextStep =
    clean(input.nextStep) ||
    "Reply to this email with your approval and we will send the proforma invoice the same day.";

  const lines = [];
  lines.push(tone.opener(client));
  lines.push("");
  lines.push(tone.thanks);
  lines.push(
    `Quotation ${quoteNumber}, dated ${formatDate(quoteDate)}, covers ${scope}. The figures below are inclusive of everything listed and exclude nothing that has been discussed.`,
  );
  lines.push("");
  totals.priced.forEach((item) => {
    lines.push(
      `  ${item.description} — ${item.quantity} x ${formatMoney(item.unitPrice)} = ${formatMoney(item.lineTotal)}`,
    );
  });
  lines.push("");
  lines.push(`  Subtotal: ${formatMoney(totals.subtotal)}`);
  if (discountPct > 0) lines.push(`  Discount (${discountPct}%): -${formatMoney(totals.discount)}`);
  if (taxPct > 0) lines.push(`  GST (${taxPct}%): ${formatMoney(totals.tax)}`);
  lines.push(`  Total payable: ${formatMoney(totals.total)}`);
  lines.push("");
  lines.push(
    `This quotation is valid until ${formatDate(validUntil)} (${Math.round(validityDays)} days from the date above).`,
  );
  if (advancePct > 0) {
    lines.push(
      `Payment terms: ${advancePct}% advance (${formatMoney(advance)}) on approval, balance ${formatMoney(balance)} on completion.`,
    );
  } else {
    lines.push(`Payment terms: full amount ${formatMoney(totals.total)} on completion.`);
  }
  lines.push(
    leadTimeDays > 0
      ? `Delivery: ${Math.round(leadTimeDays)} days from the date we receive your written approval.`
      : "Delivery: as agreed once the approval is received.",
  );

  const exclusions = clean(input.exclusions);
  if (exclusions) {
    lines.push("");
    lines.push(`Not included: ${exclusions}`);
  }

  lines.push("");
  lines.push(`Next step: ${nextStep}`);
  lines.push("");
  lines.push(tone.signOff);
  lines.push(sender);
  if (company) lines.push(company);
  const contact = clean(input.contact);
  if (contact) lines.push(contact);

  const checklist = [
    { label: "Quotation number and date stated", ok: true },
    { label: "Every line item priced individually", ok: totals.priced.length > 1 },
    { label: "Tax shown separately from the net amount", ok: taxPct > 0 },
    { label: "Validity date given, not just a number of days", ok: true },
    { label: "Payment split spelled out in money, not only percentages", ok: advancePct > 0 },
    { label: "Exclusions listed so scope creep has a boundary", ok: Boolean(exclusions) },
    { label: "One concrete next step", ok: nextStep.length > 15 },
  ];

  return {
    subject,
    body: lines.join("\n"),
    items: totals.priced,
    subtotal: totals.subtotal,
    discount: totals.discount,
    taxable: totals.taxable,
    tax: totals.tax,
    total: totals.total,
    advance,
    balance,
    advancePct,
    discountPct,
    taxPct,
    validUntilLabel: formatDate(validUntil),
    quoteDateLabel: formatDate(quoteDate),
    validityDays: Math.round(validityDays),
    leadTimeDays: Math.round(leadTimeDays),
    checklist,
    score: checklist.filter((item) => item.ok).length,
    scoreMax: checklist.length,
  };
}
