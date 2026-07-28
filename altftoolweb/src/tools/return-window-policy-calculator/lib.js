/**
 * Return window policy — category defaults, deadline maths and policy text.
 *
 * What the law fixes and what it does not:
 *  - India has NO statutory cooling-off period for online purchases. The length
 *    of a return window is contractual, which is why it has to be published.
 *    The Consumer Protection (E-Commerce) Rules, 2020 require an e-commerce
 *    entity and every seller on a marketplace to display their return, refund,
 *    exchange, warranty and guarantee, delivery and shipment terms, including
 *    who bears the cost of return shipping, before the buyer places an order.
 *    Separately, the Rules bar refusing to take back goods or to refund the
 *    price where goods are defective, deficient, spurious, or not of the
 *    characteristics or features advertised — regardless of the stated window.
 *  - EU: Article 9 of the Consumer Rights Directive 2011/83/EU gives a consumer
 *    14 DAYS to withdraw from a distance contract without giving a reason.
 *  - UK: the Consumer Contracts (Information, Cancellation and Additional
 *    Charges) Regulations 2013 give 14 DAYS from delivery to cancel, a further
 *    14 DAYS to send the goods back, and require the refund within 14 DAYS of
 *    the trader receiving the goods back.
 *
 * The category windows below are commercial defaults reflecting common Indian
 * marketplace practice. They are editable starting points, not legal minimums.
 *
 * All functions are pure — today's date is always an argument.
 */

/** EU Consumer Rights Directive 2011/83/EU, Article 9 — withdrawal period. */
export const EU_WITHDRAWAL_DAYS = 14;

/** UK Consumer Contracts Regulations 2013 — days to cancel, to return, and to refund. */
export const UK_CANCEL_DAYS = 14;
export const UK_RETURN_DAYS = 14;
export const UK_REFUND_DAYS = 14;

export const CLOCK_STARTS = [
  { key: "delivery", label: "Date of delivery" },
  { key: "dispatch", label: "Date of dispatch" },
  { key: "order", label: "Date the order was placed" },
];

export const RESOLUTION_TYPES = [
  { key: "refund", label: "Refund" },
  { key: "replacement", label: "Replacement only" },
  { key: "exchange", label: "Exchange or store credit" },
  { key: "none", label: "Not returnable" },
];

/**
 * Commercial defaults by category. windowDays is counted from the clock start;
 * returnable false means the category is excluded from returns altogether.
 */
export const CATEGORY_PRESETS = [
  { key: "apparel", label: "Apparel and footwear", windowDays: 30, resolution: "refund", returnable: true, note: "Unworn, with tags and original packaging." },
  { key: "electronics", label: "Consumer electronics", windowDays: 10, resolution: "refund", returnable: true, note: "Sealed accessories and all in-box items required." },
  { key: "mobiles", label: "Mobile phones and tablets", windowDays: 7, resolution: "replacement", returnable: true, note: "Replacement for defects; IMEI must match the invoice." },
  { key: "largeAppliances", label: "Large appliances", windowDays: 7, resolution: "replacement", returnable: true, note: "Subject to a technician visit confirming the fault." },
  { key: "books", label: "Books and stationery", windowDays: 15, resolution: "refund", returnable: true, note: "Unmarked and unused." },
  { key: "homeFurniture", label: "Furniture and home furnishing", windowDays: 7, resolution: "refund", returnable: true, note: "Not applicable to made-to-order pieces." },
  { key: "jewellery", label: "Jewellery and watches", windowDays: 15, resolution: "refund", returnable: true, note: "Certificate and tamper seal must be intact." },
  { key: "beauty", label: "Beauty and personal care", windowDays: 7, resolution: "refund", returnable: true, note: "Unopened, seal intact." },
  { key: "grocery", label: "Grocery and fresh food", windowDays: 0, resolution: "none", returnable: false, note: "Perishable — report damage at delivery instead." },
  { key: "hygiene", label: "Innerwear, swimwear and hygiene items", windowDays: 0, resolution: "none", returnable: false, note: "Excluded on hygiene grounds." },
  { key: "digital", label: "Digital downloads and licence keys", windowDays: 0, resolution: "none", returnable: false, note: "Access granted on purchase." },
  { key: "custom", label: "Personalised or made-to-order goods", windowDays: 0, resolution: "none", returnable: false, note: "Made specifically for the buyer." },
];

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86400000;

const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const daysInMonth = (year, month) =>
  [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];

/** Parse "YYYY-MM-DD"; null when it is not a real calendar date. */
export function parseISODate(text) {
  const match = ISO_RE.exec(String(text || "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2200 || month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

const utc = ({ year, month, day }) => Date.UTC(year, month - 1, day);
const iso = ({ year, month, day }) =>
  `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
const fromMs = (ms) => {
  const date = new Date(ms);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
};

/** Add whole calendar days to an ISO date. */
export function addDays(date, count) {
  const parts = parseISODate(date);
  if (!parts || !Number.isFinite(count)) return null;
  return iso(fromMs(utc(parts) + Math.trunc(count) * DAY_MS));
}

/** Whole days between two ISO dates (b - a). */
export function diffDays(a, b) {
  const first = parseISODate(a);
  const second = parseISODate(b);
  if (!first || !second) return null;
  return Math.round((utc(second) - utc(first)) / DAY_MS);
}

/** 0 = Sunday through 6 = Saturday. */
export function weekdayIndex(date) {
  const parts = parseISODate(date);
  if (!parts) return null;
  return new Date(utc(parts)).getUTCDay();
}

/** True for Saturday and Sunday. */
export function isWeekend(date) {
  const day = weekdayIndex(date);
  return day === 0 || day === 6;
}

/** Add working days, skipping Saturdays and Sundays. */
export function addBusinessDays(date, count) {
  const parts = parseISODate(date);
  if (!parts || !Number.isFinite(count)) return null;
  const steps = Math.trunc(count);
  if (steps <= 0) return iso(parts);
  let cursor = iso(parts);
  let added = 0;
  let guard = 0;
  while (added < steps && guard < 20000) {
    cursor = addDays(cursor, 1);
    guard += 1;
    if (!isWeekend(cursor)) added += 1;
  }
  return cursor;
}

const advance = (date, days, businessDaysOnly) =>
  businessDaysOnly ? addBusinessDays(date, days) : addDays(date, days);

/**
 * Return, pickup and refund deadlines for a single order.
 *
 * @param {object} input
 * @param {string} input.orderDate       ISO date the order was placed.
 * @param {string} [input.dispatchDate]  ISO date of dispatch.
 * @param {string} [input.deliveryDate]  ISO date of delivery.
 * @param {string} input.clockStart      Key from CLOCK_STARTS.
 * @param {number} input.windowDays      Length of the return window.
 * @param {boolean} [input.businessDaysOnly] Count working days only.
 * @param {number} [input.pickupDays]    Days allowed for the courier to collect.
 * @param {number} [input.refundDays]    Days to refund after the goods are back.
 * @param {string} input.todayDate       ISO "today".
 * @param {boolean} [input.returnable]   Whether the category is returnable at all.
 */
export function computeReturnWindow({
  orderDate,
  dispatchDate = "",
  deliveryDate = "",
  clockStart = "delivery",
  windowDays,
  businessDaysOnly = false,
  pickupDays = 5,
  refundDays = 7,
  todayDate,
  returnable = true,
} = {}) {
  const start = CLOCK_STARTS.find((item) => item.key === clockStart);
  if (!start) return { error: "Choose what starts the return clock." };

  if (!parseISODate(orderDate)) return { error: "Enter a valid order date." };
  if (!parseISODate(todayDate)) return { error: "Enter a valid current date." };

  const anchor =
    clockStart === "delivery" ? deliveryDate : clockStart === "dispatch" ? dispatchDate : orderDate;
  if (!parseISODate(anchor)) {
    return { error: `Enter a valid ${start.label.toLowerCase()} — that is what starts the clock.` };
  }
  if (diffDays(orderDate, anchor) < 0) {
    return { error: `The ${start.label.toLowerCase()} cannot fall before the order date.` };
  }

  const window = Math.trunc(Number(windowDays));
  if (!Number.isFinite(window) || window < 0 || window > 365) {
    return { error: "The return window must be between 0 and 365 days." };
  }

  const pickup = Math.trunc(Number(pickupDays));
  if (!Number.isFinite(pickup) || pickup < 0 || pickup > 90) {
    return { error: "Pickup days must be between 0 and 90." };
  }

  const refund = Math.trunc(Number(refundDays));
  if (!Number.isFinite(refund) || refund < 0 || refund > 90) {
    return { error: "Refund days must be between 0 and 90." };
  }

  if (!returnable || window === 0) {
    return {
      returnable: false,
      clockStartLabel: start.label,
      clockStartDate: anchor,
      windowDays: 0,
      requestBy: null,
      pickupBy: null,
      refundBy: null,
      daysLeft: 0,
      expired: true,
      businessDaysOnly,
      message: "This category is not returnable, so no deadline applies.",
    };
  }

  const requestBy = advance(anchor, window, businessDaysOnly);
  const pickupBy = advance(requestBy, pickup, businessDaysOnly);
  const refundBy = advance(pickupBy, refund, businessDaysOnly);

  const daysLeft = diffDays(todayDate, requestBy);
  const elapsed = diffDays(anchor, todayDate);

  return {
    returnable: true,
    clockStartLabel: start.label,
    clockStartDate: anchor,
    windowDays: window,
    businessDaysOnly,
    requestBy,
    pickupBy,
    refundBy,
    daysLeft,
    elapsedDays: elapsed,
    expired: daysLeft < 0,
    calendarSpanDays: diffDays(anchor, requestBy),
    message:
      daysLeft > 0
        ? `${daysLeft} day(s) left to raise the return.`
        : daysLeft === 0
          ? "Today is the last day to raise the return."
          : `The window closed ${Math.abs(daysLeft)} day(s) ago.`,
  };
}

/**
 * Build the published return policy from a set of category rows.
 * @param {object} input
 * @param {Array<{key: string, windowDays: number, resolution: string, returnable: boolean, note: string}>} input.rows
 */
export function buildReturnPolicy({
  rows = [],
  storeName = "",
  clockStart = "delivery",
  pickupDays = 5,
  refundDays = 7,
  refundMethod = "the original payment method",
  returnShippingBorneBy = "the seller for defective or wrongly sent items, and by the buyer otherwise",
  contactEmail = "",
  businessDaysOnly = false,
} = {}) {
  const start = CLOCK_STARTS.find((item) => item.key === clockStart);
  if (!start) return { error: "Choose what starts the return clock." };
  if (!Array.isArray(rows) || rows.length === 0) {
    return { error: "Select at least one product category for the policy." };
  }

  const detailed = [];
  for (const row of rows) {
    const preset = CATEGORY_PRESETS.find((item) => item.key === row.key);
    if (!preset) return { error: `Unknown product category "${row.key}".` };
    const days = Math.trunc(Number(row.windowDays));
    if (!Number.isFinite(days) || days < 0 || days > 365) {
      return { error: `The window for ${preset.label} must be between 0 and 365 days.` };
    }
    const resolution = RESOLUTION_TYPES.find((item) => item.key === row.resolution);
    if (!resolution) return { error: `Unknown resolution type for ${preset.label}.` };
    detailed.push({
      key: preset.key,
      label: preset.label,
      windowDays: days,
      returnable: Boolean(row.returnable) && days > 0,
      resolution: resolution.label,
      note: row.note || preset.note,
    });
  }

  const dayWord = businessDaysOnly ? "working days" : "days";
  const returnableRows = detailed.filter((row) => row.returnable);
  const excludedRows = detailed.filter((row) => !row.returnable);

  const text = [
    `RETURN AND REFUND POLICY — ${storeName || "[Store name]"}`,
    "",
    `The return window runs from the ${start.label.toLowerCase()}.`,
    "",
    "Return windows by category",
    ...returnableRows.map(
      (row) => `- ${row.label}: ${row.windowDays} ${dayWord} — ${row.resolution}. ${row.note}`,
    ),
    excludedRows.length ? "" : null,
    excludedRows.length ? "Not eligible for return" : null,
    ...excludedRows.map((row) => `- ${row.label}. ${row.note}`),
    "",
    "How a return works",
    `1. Raise the request within the window shown above, measured from the ${start.label.toLowerCase()}.`,
    `2. Keep the item unused and in its original packaging with all tags, manuals and free items.`,
    `3. A courier will collect the item within ${pickupDays} ${dayWord} of the request being approved.`,
    `4. Once the item reaches us and passes inspection, the refund is issued to ${refundMethod} within ${refundDays} ${dayWord}.`,
    "",
    "Return shipping",
    `Return shipping is borne by ${returnShippingBorneBy}.`,
    "",
    "Damaged, defective or wrong items",
    "If an item arrives damaged, defective, spurious or materially different from what was advertised, tell us as soon as you notice it. We will take the item back and refund it regardless of the window above, as required of us under the Consumer Protection (E-Commerce) Rules, 2020.",
    "",
    contactEmail ? `Questions: ${contactEmail}` : null,
  ]
    .filter((item) => item !== null)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const longestWindow = returnableRows.reduce((max, row) => Math.max(max, row.windowDays), 0);
  const shortestWindow = returnableRows.length
    ? returnableRows.reduce((min, row) => Math.min(min, row.windowDays), Number.MAX_SAFE_INTEGER)
    : 0;

  return {
    text,
    rows: detailed,
    returnableCount: returnableRows.length,
    excludedCount: excludedRows.length,
    longestWindow,
    shortestWindow,
    wordCount: text.split(/\s+/).filter(Boolean).length,
  };
}
