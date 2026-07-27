/**
 * Return Deadline Tracker — works out the last day you can return a purchase,
 * how long is left, and roughly when the refund should land.
 *
 * Return windows below are each retailer's published standard policy for
 * general merchandise bought online. Two things vary between retailers and are
 * modelled explicitly:
 *
 *  - `days`   : the length of the standard window.
 *  - `countFrom`: whether the clock starts on the DELIVERY date (Amazon,
 *                 Flipkart, Myntra) or the PURCHASE/receipt date (Walmart,
 *                 Target, Best Buy, Apple, IKEA, Zara, H&M).
 *
 * Statutory windows are included as separate entries because they are a legal
 * minimum rather than a shop policy:
 *  - EU: Consumer Rights Directive 2011/83/EU gives a 14-day withdrawal period
 *    for distance sales, running from the day the goods are received.
 *  - UK: Consumer Contracts (Information, Cancellation and Additional Charges)
 *    Regulations 2013 give 14 days to cancel from receipt, then a further 14
 *    days to send the goods back.
 *
 * Refund timing uses the card-network settlement norm quoted by almost every
 * retailer: once the return is received and inspected, a card refund posts
 * within about 5 to 10 BUSINESS days (weekends excluded).
 *
 * Pure module: no React, no DOM, no clock reads — every date is an argument.
 */

/** Milliseconds in one day. */
const MS_PER_DAY = 86400000;

/** Card refunds typically post 5–10 business days after the return is received. */
export const REFUND_BUSINESS_DAYS_MIN = 5;
export const REFUND_BUSINESS_DAYS_MAX = 10;

/** Longest window this tool will accept for a custom policy, in days. */
export const MAX_WINDOW_DAYS = 3650;

/**
 * Published standard return windows.
 * `countFrom` is "delivery" or "purchase".
 */
export const RETAILERS = [
  {
    id: "amazon-us",
    label: "Amazon (US) — most items",
    days: 30,
    countFrom: "delivery",
    note: "30 days from delivery for most items; some categories such as cell phones are shorter.",
  },
  {
    id: "amazon-in",
    label: "Amazon India — most items",
    days: 10,
    countFrom: "delivery",
    note: "10 days from delivery for most categories; apparel is often 10–30 days, large appliances 7.",
  },
  {
    id: "flipkart",
    label: "Flipkart — most items",
    days: 7,
    countFrom: "delivery",
    note: "7 days from delivery for most categories; lifestyle items are commonly 10–14 days.",
  },
  {
    id: "myntra",
    label: "Myntra",
    days: 30,
    countFrom: "delivery",
    note: "30 days from delivery on most fashion, provided tags are intact.",
  },
  {
    id: "walmart",
    label: "Walmart — general merchandise",
    days: 90,
    countFrom: "purchase",
    note: "90 days for general merchandise; most electronics are 30 days.",
  },
  {
    id: "target",
    label: "Target — most items",
    days: 90,
    countFrom: "purchase",
    note: "90 days for most items; Target-owned brands get 365 days, Apple products 15.",
  },
  {
    id: "best-buy",
    label: "Best Buy — standard",
    days: 15,
    countFrom: "purchase",
    note: "15 days standard; paid membership tiers extend this to 60 days.",
  },
  {
    id: "apple",
    label: "Apple Store",
    days: 14,
    countFrom: "delivery",
    note: "14 days from receipt for a standard return, opened or not.",
  },
  {
    id: "ikea",
    label: "IKEA — unopened",
    days: 365,
    countFrom: "purchase",
    note: "365 days for unopened goods; opened items are 180 days.",
  },
  {
    id: "zara",
    label: "Zara",
    days: 30,
    countFrom: "purchase",
    note: "30 days from the shipping or purchase date, in original condition with tags.",
  },
  {
    id: "hm",
    label: "H&M",
    days: 30,
    countFrom: "purchase",
    note: "30 days from purchase for most items, with proof of purchase.",
  },
  {
    id: "eu-statutory",
    label: "EU statutory withdrawal (distance sales)",
    days: 14,
    countFrom: "delivery",
    note: "Consumer Rights Directive 2011/83/EU: 14 days from receipt to withdraw from a distance sale.",
  },
  {
    id: "uk-statutory",
    label: "UK statutory cancellation (online)",
    days: 14,
    countFrom: "delivery",
    note: "Consumer Contracts Regulations 2013: 14 days from receipt to cancel, then 14 more to send goods back.",
  },
  {
    id: "custom",
    label: "Custom policy — enter the days yourself",
    days: null,
    countFrom: "purchase",
    note: "Use the window printed on your receipt or order confirmation.",
  },
];

/**
 * Urgency bands on days remaining. Upper bound is inclusive.
 * "critical" mirrors the point where most couriers can no longer collect in time.
 */
export const URGENCY_BANDS = [
  { id: "expired", max: -1, label: "Window closed" },
  { id: "critical", max: 2, label: "Act today" },
  { id: "urgent", max: 7, label: "Closing this week" },
  { id: "comfortable", max: Infinity, label: "Plenty of time" },
];

/** Order lifecycle states a shopper can set on a tracked item. */
export const RETURN_STATUSES = [
  { id: "keeping", label: "Keeping — no return started" },
  { id: "deciding", label: "Undecided" },
  { id: "requested", label: "Return requested" },
  { id: "picked-up", label: "Picked up / shipped back" },
  { id: "refund-pending", label: "Received, refund pending" },
  { id: "refunded", label: "Refunded" },
];

/** Statuses where the return has already been lodged, so the deadline no longer bites. */
const LODGED_STATUSES = new Set(["requested", "picked-up", "refund-pending", "refunded"]);

const parseIsoDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return null;
  const date = new Date(`${value.trim()}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toIso = (date) => date.toISOString().slice(0, 10);

/** Whole days between two UTC midnights (b - a). */
export function daysBetween(fromIso, toIsoDate) {
  const a = parseIsoDate(fromIso);
  const b = parseIsoDate(toIsoDate);
  if (!a || !b) return { error: "Enter both dates as YYYY-MM-DD." };
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

/**
 * Add whole business days (Mon–Fri) to a date. Weekends are skipped; public
 * holidays are not modelled because they differ by country.
 */
export function addBusinessDays(startIso, businessDays) {
  const start = parseIsoDate(startIso);
  if (!start) return { error: "Enter the date as YYYY-MM-DD." };
  if (!Number.isInteger(businessDays) || businessDays < 0) {
    return { error: "Business days must be a whole number of zero or more." };
  }
  const cursor = new Date(start.getTime());
  let added = 0;
  while (added < businessDays) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    const weekday = cursor.getUTCDay(); // 0 = Sunday, 6 = Saturday
    if (weekday !== 0 && weekday !== 6) added += 1;
  }
  return toIso(cursor);
}

/** Band a number of days remaining. */
export function urgencyFor(daysRemaining) {
  if (!Number.isFinite(daysRemaining)) return URGENCY_BANDS[0];
  return URGENCY_BANDS.find((band) => daysRemaining <= band.max) ?? URGENCY_BANDS[URGENCY_BANDS.length - 1];
}

/**
 * Work out the return deadline for one purchase.
 *
 * @param {object} input
 * @param {string} input.retailerId      - id from RETAILERS
 * @param {string} input.purchaseDate    - ISO date of purchase
 * @param {string} [input.deliveryDate]  - ISO date of delivery (needed when countFrom is "delivery")
 * @param {number} [input.customDays]    - window length when retailerId is "custom"
 * @param {string} input.today           - ISO date to measure from
 * @param {string} [input.status]        - one of RETURN_STATUSES ids
 * @param {string} [input.returnedOn]    - ISO date the retailer received the return
 * @returns {object} deadline breakdown, or { error }
 */
export function computeReturnDeadline({
  retailerId,
  purchaseDate,
  deliveryDate,
  customDays,
  today,
  status = "deciding",
  returnedOn,
}) {
  const retailer = RETAILERS.find((entry) => entry.id === retailerId);
  if (!retailer) return { error: "Pick a retailer or choose the custom policy." };

  const purchase = parseIsoDate(purchaseDate);
  if (!purchase) return { error: "Enter the purchase date as YYYY-MM-DD." };

  const now = parseIsoDate(today);
  if (!now) return { error: "Enter today's date as YYYY-MM-DD." };

  let windowDays = retailer.days;
  if (retailer.id === "custom") {
    const custom = Number(customDays);
    if (!Number.isFinite(custom) || !Number.isInteger(custom) || custom < 1) {
      return { error: "Enter the return window as a whole number of days, 1 or more." };
    }
    if (custom > MAX_WINDOW_DAYS) {
      return { error: `A return window longer than ${MAX_WINDOW_DAYS} days is not realistic.` };
    }
    windowDays = custom;
  }

  const needsDelivery = retailer.countFrom === "delivery";
  const delivery = parseIsoDate(deliveryDate);
  if (needsDelivery && !delivery) {
    return { error: `${retailer.label} counts from the delivery date, so enter when it arrived.` };
  }
  if (delivery && delivery.getTime() < purchase.getTime()) {
    return { error: "The delivery date cannot be before the purchase date." };
  }

  const startDate = needsDelivery ? delivery : purchase;
  const deadline = new Date(startDate.getTime() + windowDays * MS_PER_DAY);
  const daysRemaining = Math.round((deadline.getTime() - now.getTime()) / MS_PER_DAY);
  const daysElapsed = Math.round((now.getTime() - startDate.getTime()) / MS_PER_DAY);

  const lodged = LODGED_STATUSES.has(status);
  const expired = daysRemaining < 0;
  const band = lodged ? URGENCY_BANDS[URGENCY_BANDS.length - 1] : urgencyFor(daysRemaining);

  let refundWindow = null;
  const received = parseIsoDate(returnedOn);
  if (received) {
    const earliest = addBusinessDays(toIso(received), REFUND_BUSINESS_DAYS_MIN);
    const latest = addBusinessDays(toIso(received), REFUND_BUSINESS_DAYS_MAX);
    if (typeof earliest === "string" && typeof latest === "string") {
      refundWindow = { earliest, latest };
    }
  }

  return {
    retailer,
    windowDays,
    countFrom: retailer.countFrom,
    startDate: toIso(startDate),
    deadline: toIso(deadline),
    daysRemaining,
    daysElapsed,
    percentUsed: Math.min(100, Math.max(0, (daysElapsed / windowDays) * 100)),
    expired,
    lodged,
    canStillReturn: lodged || !expired,
    urgency: band,
    refundWindow,
    status,
  };
}

/**
 * Summarise a list of tracked purchases.
 * @param {Array<object>} items - each item is an input for computeReturnDeadline
 * @returns {{rows: Array, openCount: number, expiredCount: number, urgentCount: number, nextDeadline: string|null}|{error: string}}
 */
export function summariseReturns(items, today) {
  if (!Array.isArray(items)) return { error: "Pass the tracked purchases as an array." };
  const rows = items.map((item) => ({
    ...item,
    result: computeReturnDeadline({ ...item, today }),
  }));

  const valid = rows.filter((row) => !row.result.error);
  const open = valid.filter((row) => !row.result.lodged && !row.result.expired);
  const expired = valid.filter((row) => !row.result.lodged && row.result.expired);
  const urgent = open.filter((row) => row.result.daysRemaining <= 7);

  const nextDeadline = open
    .map((row) => row.result.deadline)
    .sort()
    .shift();

  return {
    rows,
    openCount: open.length,
    expiredCount: expired.length,
    urgentCount: urgent.length,
    nextDeadline: nextDeadline ?? null,
  };
}
