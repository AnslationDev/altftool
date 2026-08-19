/**
 * Restaurant / food-delivery refund policy generator.
 *
 * The clauses and timelines drafted here follow published Indian rules, not
 * house style:
 *
 *  - Consumer Protection (E-Commerce) Rules 2020, Rule 4(5): an e-commerce
 *    entity must appoint a grievance officer, ACKNOWLEDGE a consumer complaint
 *    within FORTY-EIGHT HOURS and REDRESS it within ONE MONTH of receipt.
 *    Those two numbers are the outer limits used as defaults below.
 *  - Consumer Protection Act 2019, Section 2(11): failure to perform a service
 *    to the standard promised is a "deficiency in service".
 *  - Consumer Protection Act 2019, Section 2(47)(ix)/(x): refusing to withdraw
 *    or refund defective goods within the stated period is an unfair trade
 *    practice.
 *  - Consumer Protection Act 2019, Section 69: a consumer complaint must be
 *    filed within TWO YEARS of the cause of action.
 *  - Consumer Protection (Jurisdiction) Rules 2021: District Commission hears
 *    claims up to Rs 50 lakh, State Commission above Rs 50 lakh and up to
 *    Rs 2 crore, National Commission above Rs 2 crore.
 *  - Food Safety and Standards Act 2006, Section 26: the food business
 *    operator is responsible for the safety of the food it sells, which is why
 *    hygiene and foreign-object complaints carry a full refund by default.
 *  - RBI circular DPSS.CO.PD No.629/02.01.014/2019-20 (20 September 2019) on
 *    Harmonisation of Turn Around Time fixes reversal timelines for FAILED
 *    transactions (UPI T+1 day, card T+5 days) with Rs 100 per day
 *    compensation for delay. Merchant-initiated refunds are not covered by
 *    that circular; the bank credit ranges below are ordinary processing
 *    times quoted by acquiring banks, so the policy states them as estimates.
 *
 * This module is arithmetic and text assembly only. It is informational and is
 * not legal advice.
 */

/** Rule 4(5), Consumer Protection (E-Commerce) Rules 2020. */
export const ACK_HOURS_LIMIT = 48;
/** Rule 4(5) outer limit for redressal, expressed in days (one month). */
export const REDRESS_DAYS_LIMIT = 30;
/** Section 69, Consumer Protection Act 2019 - limitation for a complaint. */
export const COMPLAINT_LIMITATION_YEARS = 2;
/** Consumer Protection (Jurisdiction) Rules 2021, District Commission ceiling. */
export const DISTRICT_COMMISSION_CEILING_INR = 5000000;
/** National Consumer Helpline short code run by the Dept of Consumer Affairs. */
export const NATIONAL_CONSUMER_HELPLINE = "1915";

/** Longest a single free-text field may run so the policy stays readable. */
const MAX_FIELD = 120;
/** A reporting window shorter than this is unenforceable in practice. */
const MIN_WINDOW_HOURS = 0;
/** Longest reporting window the drafter will accept (7 days). */
const MAX_WINDOW_HOURS = 168;
/** Goodwill uplift is capped at 100% - anything more is not a refund policy. */
const MAX_GOODWILL_PERCENT = 100;

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

/**
 * What the refund is measured against.
 *  full            - order value plus delivery and packaging charges
 *  affected-items  - only the value of the items complained about
 *  delivery-fee    - only the delivery charge
 *  none            - no money moves (used with a replacement)
 */
export const REFUND_SCOPES = [
  { id: "full", label: "Full order value plus all charges" },
  { id: "affected-items", label: "Value of the affected items only" },
  { id: "delivery-fee", label: "Delivery charge only" },
  { id: "none", label: "No monetary refund" },
];

/** How the money (or its substitute) reaches the customer. */
export const PAYOUT_MODES = [
  { id: "original", label: "Back to the original payment method" },
  { id: "credit", label: "Store credit / wallet coupon" },
  { id: "replacement", label: "Replacement order at no extra cost" },
];

/**
 * Default remedy per complaint type. Windows are counted from the moment the
 * order is marked delivered, except cancellations, which are immediate.
 */
export const ISSUE_TYPES = [
  {
    id: "missing-item",
    label: "An item is missing from the bag",
    windowHours: 2,
    scope: "affected-items",
    payout: "original",
    evidence: "a photo of everything received, next to the itemised bill",
  },
  {
    id: "wrong-item",
    label: "A wrong item was delivered",
    windowHours: 2,
    scope: "affected-items",
    payout: "replacement",
    evidence: "a photo of the item received and its label or sticker",
  },
  {
    id: "late-delivery",
    label: "Delivered later than the promised time",
    windowHours: 6,
    scope: "delivery-fee",
    payout: "original",
    evidence: "the order screen showing the promised and actual delivery times",
  },
  {
    id: "spilled",
    label: "Spilled, crushed or leaking packaging",
    windowHours: 2,
    scope: "full",
    payout: "original",
    evidence: "photographs of the packaging as it arrived, before unpacking further",
  },
  {
    id: "quality",
    label: "Food arrived cold, stale or inedible",
    windowHours: 4,
    scope: "full",
    payout: "original",
    evidence: "a photograph of the dish and a short description of the problem",
  },
  {
    id: "foreign-object",
    label: "Foreign object or hygiene complaint",
    windowHours: 24,
    scope: "full",
    payout: "original",
    evidence: "photographs of the object in the food and retention of the item for inspection",
  },
  {
    id: "allergen",
    label: "A declared allergen or diet instruction was ignored",
    windowHours: 24,
    scope: "full",
    payout: "original",
    evidence: "the order note recording the instruction and a photo of the dish",
  },
  {
    id: "kitchen-cancel",
    label: "The kitchen cancelled the order after payment",
    windowHours: 0,
    scope: "full",
    payout: "original",
    evidence: "nothing - the cancellation is already on our own record",
  },
];

/**
 * Ordinary acquiring-bank credit times for a merchant-initiated refund.
 * These are estimates, not statutory limits; the RBI Turn Around Time circular
 * quoted at the top of this file governs FAILED transactions, not refunds.
 */
export const REFUND_ROUTES = [
  { id: "upi", label: "UPI", credit: "1 to 3 working days" },
  { id: "card", label: "Credit or debit card", credit: "5 to 7 working days" },
  { id: "netbanking", label: "Net banking", credit: "3 to 7 working days" },
  { id: "wallet", label: "Prepaid wallet", credit: "within 24 hours" },
  { id: "cod", label: "Cash on delivery", credit: "3 to 5 working days by bank transfer or as store credit" },
];

function clean(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function isMoney(value) {
  return Number.isFinite(value) && value >= 0;
}

function roundPaise(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Format a yyyy-mm-dd string as "5 August 2026".
 * Returns null when the string is not a real calendar date.
 * @param {string} iso
 * @returns {string|null}
 */
export function formatIsoLong(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return `${day} ${MONTH_NAMES[month - 1]} ${year}`;
}

/**
 * Work out what a single complaint is worth under the chosen remedy.
 *
 * @param {object} input
 * @param {number} input.orderValue          Food value of the order, before charges.
 * @param {number} [input.deliveryFee]       Delivery charge on the bill.
 * @param {number} [input.packagingFee]      Packaging / handling charge on the bill.
 * @param {number} [input.affectedItemsValue] Value of the items complained about.
 * @param {string} input.scope               One of REFUND_SCOPES ids.
 * @param {string} input.payout              One of PAYOUT_MODES ids.
 * @param {number} [input.goodwillPercent]   Uplift applied only to store credit.
 * @returns {{billTotal:number, refundBase:number, cashRefund:number,
 *            storeCredit:number, replacementValue:number, customerKeeps:number,
 *            sharePercent:number} | {error:string}}
 */
export function computeRefundEntitlement({
  orderValue,
  deliveryFee = 0,
  packagingFee = 0,
  affectedItemsValue = 0,
  scope,
  payout,
  goodwillPercent = 0,
}) {
  const order = Number(orderValue);
  const delivery = Number(deliveryFee);
  const packaging = Number(packagingFee);
  const affected = Number(affectedItemsValue);
  const goodwill = Number(goodwillPercent);

  if (![order, delivery, packaging, affected, goodwill].every((v) => Number.isFinite(v))) {
    return { error: "Enter valid numbers for the order value, charges and goodwill percentage." };
  }
  if (!(order > 0)) return { error: "Order value must be greater than zero." };
  if (![delivery, packaging, affected].every(isMoney)) {
    return { error: "Charges and item values cannot be negative." };
  }
  if (goodwill < 0 || goodwill > MAX_GOODWILL_PERCENT) {
    return { error: `Goodwill uplift must be between 0% and ${MAX_GOODWILL_PERCENT}%.` };
  }
  if (!REFUND_SCOPES.some((s) => s.id === scope)) {
    return { error: "Choose what the refund is measured against." };
  }
  if (!PAYOUT_MODES.some((p) => p.id === payout)) {
    return { error: "Choose how the customer is paid back." };
  }
  // Only "affected-items" scope actually reads `affected` into the refund
  // base (see refundBase below), so this comparison must not reject "full"
  // or "delivery-fee" calculations just because affectedItemsValue happens
  // to exceed orderValue - that field is unused by those scopes.
  if (scope === "affected-items" && affected > order) {
    return { error: "The value of the affected items cannot exceed the order value." };
  }
  if (scope === "affected-items" && !(affected > 0)) {
    return { error: "Enter the value of the affected items to refund them." };
  }
  if (scope === "delivery-fee" && !(delivery > 0)) {
    return { error: "There is no delivery charge on this bill to refund." };
  }

  const billTotal = roundPaise(order + delivery + packaging);

  let refundBase = 0;
  if (scope === "full") refundBase = billTotal;
  else if (scope === "affected-items") refundBase = affected;
  else if (scope === "delivery-fee") refundBase = delivery;

  refundBase = roundPaise(refundBase);

  let cashRefund = 0;
  let storeCredit = 0;
  let replacementValue = 0;
  if (payout === "original") cashRefund = refundBase;
  else if (payout === "credit") storeCredit = roundPaise(refundBase * (1 + goodwill / 100));
  else replacementValue = refundBase;

  const customerKeeps = roundPaise(cashRefund + storeCredit + replacementValue);

  return {
    billTotal,
    refundBase,
    cashRefund,
    storeCredit,
    replacementValue,
    customerKeeps,
    sharePercent: roundPaise((refundBase / billTotal) * 100),
  };
}

function scopeSentence(scope) {
  if (scope === "full") return "the full bill, including delivery and packaging charges";
  if (scope === "affected-items") return "the value of the affected item or items";
  if (scope === "delivery-fee") return "the delivery charge";
  return "no monetary refund";
}

function payoutSentence(payout) {
  if (payout === "original") return "credited back to the original payment method";
  if (payout === "credit") return "issued as store credit valid on your next order";
  return "settled by re-preparing and re-delivering the order at no extra cost";
}

function windowSentence(hours) {
  if (hours <= 0) return "immediately, without any report from you";
  if (hours === 1) return "within 1 hour of delivery";
  if (hours < 24) return `within ${hours} hours of delivery`;
  const days = hours / 24;
  const whole = Number.isInteger(days) ? days : Math.round(days * 10) / 10;
  return `within ${whole} day${whole === 1 ? "" : "s"} of delivery`;
}

/**
 * Clause-2 sentence for a single issue type. A zero-or-less reporting
 * window (e.g. kitchen-cancel) cannot reuse the "report it ... Please keep
 * {evidence}" template built for reportable windows: windowSentence(0)
 * already says "without any report from you", so appending "report it"
 * before it and "Please keep {evidence}" after it produced a
 * self-contradictory, ungrammatical clause.
 */
function issueSentence(issue) {
  if (issue.windowHours <= 0) {
    return `- ${issue.label}: no report is needed from you - we will refund ${scopeSentence(issue.scope)}, ${payoutSentence(issue.payout)} as soon as the cancellation is recorded.`;
  }
  return `- ${issue.label}: report it ${windowSentence(issue.windowHours)} and we will refund ${scopeSentence(issue.scope)}, ${payoutSentence(issue.payout)}. Please keep ${issue.evidence}.`;
}

/**
 * Assemble the refund policy document.
 *
 * @param {object} input
 * @param {string} input.brandName        Restaurant or brand name.
 * @param {string} input.city             City / place of business.
 * @param {string} input.contactEmail     Grievance contact email.
 * @param {string} input.contactPhone     Grievance contact phone.
 * @param {string} input.effectiveDate    yyyy-mm-dd the policy takes effect.
 * @param {string[]} input.issueIds       Ticked ISSUE_TYPES ids.
 * @param {Record<string, {windowHours:number, scope:string, payout:string}>} [input.overrides]
 * @param {number} input.ackHours         Hours to acknowledge a complaint.
 * @param {number} input.redressDays      Days to close a complaint.
 * @param {number} input.graceMinutes     Minutes past the promised ETA before a
 *                                        delivery counts as late.
 * @param {string[]} input.routeIds       Payment routes accepted.
 * @param {number} [input.goodwillPercent] Store credit uplift.
 * @returns {{policyText:string, clauses:{title:string, body:string}[],
 *            effectiveLong:string, ackHours:number, redressDays:number,
 *            issueCount:number} | {error:string}}
 */
export function buildRefundPolicy({
  brandName,
  city,
  contactEmail,
  contactPhone,
  effectiveDate,
  issueIds = [],
  overrides = {},
  ackHours,
  redressDays,
  graceMinutes,
  routeIds = [],
  goodwillPercent = 0,
}) {
  const brand = clean(brandName);
  const place = clean(city);
  const email = clean(contactEmail);
  const phone = clean(contactPhone);

  if (!brand) return { error: "Enter the restaurant or brand name." };
  if (!place) return { error: "Enter the city the restaurant operates from." };
  if (!email) return { error: "Enter a grievance contact email - the rules require a named channel." };
  if ([brand, place, email, phone].some((v) => v.length > MAX_FIELD)) {
    return { error: `Keep each field under ${MAX_FIELD} characters.` };
  }

  const effectiveLong = formatIsoLong(effectiveDate);
  if (!effectiveLong) return { error: "Enter a valid effective date." };

  const ack = Number(ackHours);
  if (!Number.isFinite(ack) || !Number.isInteger(ack) || ack < 1 || ack > ACK_HOURS_LIMIT) {
    return {
      error: `Acknowledgement time must be between 1 and ${ACK_HOURS_LIMIT} hours - Rule 4(5) of the Consumer Protection (E-Commerce) Rules 2020 caps it at ${ACK_HOURS_LIMIT} hours.`,
    };
  }

  const redress = Number(redressDays);
  if (
    !Number.isFinite(redress) ||
    !Number.isInteger(redress) ||
    redress < 1 ||
    redress > REDRESS_DAYS_LIMIT
  ) {
    return {
      error: `Resolution time must be between 1 and ${REDRESS_DAYS_LIMIT} days - Rule 4(5) requires redressal within one month.`,
    };
  }

  const grace = Number(graceMinutes);
  if (!Number.isFinite(grace) || !Number.isInteger(grace) || grace < 0 || grace > 240) {
    return { error: "Late-delivery grace period must be a whole number of minutes from 0 to 240." };
  }

  const chosen = ISSUE_TYPES.filter((issue) => issueIds.includes(issue.id)).map((issue) => {
    const patch = overrides[issue.id] || {};
    const hours = Number.isFinite(Number(patch.windowHours))
      ? Number(patch.windowHours)
      : issue.windowHours;
    return {
      ...issue,
      windowHours: hours,
      scope: patch.scope || issue.scope,
      payout: patch.payout || issue.payout,
    };
  });

  if (chosen.length === 0) {
    return { error: "Tick at least one complaint type - a policy that covers nothing is not a policy." };
  }
  if (
    chosen.some(
      (issue) =>
        !Number.isFinite(issue.windowHours) ||
        !Number.isInteger(issue.windowHours) ||
        issue.windowHours < MIN_WINDOW_HOURS ||
        issue.windowHours > MAX_WINDOW_HOURS,
    )
  ) {
    return {
      error: `Every reporting window must be a whole number of hours from ${MIN_WINDOW_HOURS} to ${MAX_WINDOW_HOURS}.`,
    };
  }

  const routes = REFUND_ROUTES.filter((route) => routeIds.includes(route.id));
  if (routes.length === 0) {
    return { error: "Select at least one payment method you accept." };
  }

  const goodwill = Number(goodwillPercent);
  if (!Number.isFinite(goodwill) || goodwill < 0 || goodwill > MAX_GOODWILL_PERCENT) {
    return { error: `Goodwill uplift must be between 0% and ${MAX_GOODWILL_PERCENT}%.` };
  }

  const usesCredit = chosen.some((issue) => issue.payout === "credit");

  const clauses = [
    {
      title: "1. Scope",
      body: `This refund policy applies to every food order placed with ${brand}, ${place}, whether on our own website or app, over the phone, or through a delivery marketplace. It takes effect on ${effectiveLong} and applies to orders placed on or after that date. ${brand} is a food business operator and accepts responsibility for the safety of the food it sells under Section 26 of the Food Safety and Standards Act 2006.`,
    },
    {
      title: "2. When you can ask for a refund",
      body: chosen.map(issueSentence).join("\n"),
    },
    {
      title: "3. What counts as a late delivery",
      body: `An order is treated as late once it arrives more than ${grace} minute${grace === 1 ? "" : "s"} after the delivery time shown to you when you placed it. Delays caused by weather, traffic restrictions, a blocked address, an unreachable phone number or an incorrect address are outside our control and are not treated as late delivery.`,
    },
    {
      title: "4. How to raise a complaint",
      body: `Write to ${email}${phone ? ` or call ${phone}` : ""} with your order number, the date of the order and the evidence listed above. We will acknowledge your complaint within ${ack} hour${ack === 1 ? "" : "s"} and close it within ${redress} day${redress === 1 ? "" : "s"}. These timelines are set to stay inside Rule 4(5) of the Consumer Protection (E-Commerce) Rules 2020, which requires acknowledgement within ${ACK_HOURS_LIMIT} hours and redressal within one month.`,
    },
    {
      title: "5. How long the money takes to reach you",
      body: `${routes.map((route) => `- ${route.label}: ${route.credit} after we approve the refund.`).join("\n")}\nOnce we approve a refund we release it the same working day. The time taken after that is the bank's or the payment operator's processing time and is outside our control. If a payment fails and money is debited without the order being placed, the reversal timelines in the Reserve Bank of India's Turn Around Time circular of 20 September 2019 apply to your bank, not to us.`,
    },
    {
      title: "6. What we do not refund",
      body: `- Orders where the whole quantity has been consumed and the complaint is about taste or preference rather than safety or accuracy.\n- Orders refused at the door after the rider has reached the address, where no fault is found with the food.\n- Requests made after the reporting window for that complaint type has closed.\n- Discount coupons, promotional credits and loyalty points applied to an order, which are reversed as credits rather than cash.`,
    },
    {
      title: usesCredit ? "7. Store credit" : "7. Cancellations by you",
      body: usesCredit
        ? `Where this policy offers store credit, the credit is issued to the account that placed the order${goodwill > 0 ? `, with a goodwill uplift of ${goodwill}% on the refundable value` : ""}. Store credit can be used on any future order and is not exchangeable for cash. You may ask for the same amount back to your original payment method instead, and we will not treat that request as a reason to reduce the refund.`
        : `You can cancel free of charge until the kitchen accepts the order. Once preparation has started, ingredients have been committed and we can only refund the portion of the order not yet prepared. If we cancel an accepted order for any reason, you get the full bill back.`,
    },
    {
      title: "8. If we cannot settle it",
      body: `If you are not satisfied with our decision you may call the National Consumer Helpline on ${NATIONAL_CONSUMER_HELPLINE}, or file a complaint with the District Consumer Disputes Redressal Commission where you live, work or where we operate. A complaint must be filed within ${COMPLAINT_LIMITATION_YEARS} years of the cause of action under Section 69 of the Consumer Protection Act 2019, and the District Commission hears claims up to Rs 50 lakh. Nothing in this policy limits any right you have under that Act.`,
    },
  ];

  const policyText = [
    `${brand.toUpperCase()} - REFUND AND ORDER ISSUES POLICY`,
    `Effective from ${effectiveLong}`,
    "",
    ...clauses.flatMap((clause) => [clause.title, clause.body, ""]),
    `Questions about this policy: ${email}${phone ? ` / ${phone}` : ""}`,
  ]
    .join("\n")
    .trim();

  return {
    policyText,
    clauses,
    effectiveLong,
    ackHours: ack,
    redressDays: redress,
    issueCount: chosen.length,
  };
}
