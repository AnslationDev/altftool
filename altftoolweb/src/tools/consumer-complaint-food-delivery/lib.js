/**
 * Food-delivery complaint helper.
 *
 * Rules referenced (India):
 *  - Consumer Protection (E-Commerce) Rules, 2020, rule 4(5): every e-commerce
 *    entity must appoint a grievance officer, acknowledge a consumer complaint
 *    within forty-eight hours and redress it within one month of receipt.
 *  - Consumer Protection (E-Commerce) Rules, 2020, rule 4(3)/5(3): the entity
 *    must display the grievance officer's name and contact details and must not
 *    refuse to take back or refund defective or deficient goods and services.
 *  - Consumer Protection Act, 2019 s.2(11) "deficiency" and s.2(47) "unfair
 *    trade practice" — the grounds a food-delivery complaint rests on.
 *  - Consumer Protection Act, 2019 s.34(2)(d): a complaint may be filed where
 *    the complainant resides or personally works for gain.
 *  - Consumer Protection Act, 2019 s.69: complaint must be filed within two
 *    years of the cause of action.
 *  - District Commission pecuniary limit of Rs 50 lakh, per the Central
 *    Government notification dated 20 December 2021.
 *  - Food Safety and Standards Act, 2006 s.3(1)(zz) defines "unsafe food";
 *    FSSAI takes complaints about stale or contaminated food and every
 *    restaurant must display its FSSAI licence number.
 */

/** Rule 4(5), Consumer Protection (E-Commerce) Rules, 2020. */
export const ACKNOWLEDGE_HOURS = 48;

/** Rule 4(5), Consumer Protection (E-Commerce) Rules, 2020. */
export const REDRESS_DAYS = 30;

/** Section 69, Consumer Protection Act, 2019. */
export const LIMITATION_YEARS = 2;

/** District Commission ceiling in rupees (notification dated 20-12-2021). */
export const DISTRICT_COMMISSION_LIMIT_INR = 5000000;

/** Restaurant service supplied through an e-commerce operator is taxed at 5%
 *  without input tax credit under GST. Editable because platform fees and
 *  delivery charges can be taxed differently. */
export const DEFAULT_FOOD_GST_PCT = 5;

/** Tolerance, in rupees, before a difference between the computed bill and the
 *  amount actually charged is called out as an overcharge. Covers rounding of
 *  paise to the nearest rupee across several line items. */
export const BILL_TOLERANCE_INR = 1;

export const ISSUE_TYPES = [
  {
    id: "missing-items",
    label: "Items missing from the order",
    line: "one or more items that I paid for were not delivered at all",
    refundsWholeOrder: false,
    foodSafety: false,
  },
  {
    id: "spoiled",
    label: "Food was spoiled, stale or smelt off",
    line: "the food delivered was stale and unfit for consumption",
    refundsWholeOrder: true,
    foodSafety: true,
  },
  {
    id: "foreign-object",
    label: "Foreign object found in the food",
    line: "a foreign object was found in the food delivered, which makes it unsafe food within the meaning of the Food Safety and Standards Act, 2006",
    refundsWholeOrder: true,
    foodSafety: true,
  },
  {
    id: "wrong-order",
    label: "Completely wrong order delivered",
    line: "the order delivered was not the order I placed",
    refundsWholeOrder: true,
    foodSafety: false,
  },
  {
    id: "not-delivered",
    label: "Order marked delivered but never received",
    line: "the order was marked delivered in the app but never reached me",
    refundsWholeOrder: true,
    foodSafety: false,
  },
  {
    id: "overcharged",
    label: "Charged more than the listed price",
    line: "I was charged more than the prices displayed at the time of ordering",
    refundsWholeOrder: false,
    foodSafety: false,
  },
  {
    id: "cold-late",
    label: "Very late delivery, food arrived cold",
    line: "the order arrived far beyond the promised time and the food was cold and inedible",
    refundsWholeOrder: true,
    foodSafety: false,
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;
const MS_PER_DAY = 86400000;

export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (date.getUTCMonth() !== Number(match[2]) - 1 || date.getUTCDate() !== Number(match[3])) return null;
  return date;
}

export function addDaysISO(isoDate, days) {
  const date = parseISODate(isoDate);
  if (!date || !isNum(days)) return null;
  return new Date(date.getTime() + Math.round(days) * MS_PER_DAY).toISOString().slice(0, 10);
}

export function formatLongDate(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Days between two ISO dates (later minus earlier). Null if unparseable. */
export function daysBetweenISO(fromISO, toISO) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISO);
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/**
 * Work out the refund the order justifies.
 *
 * The refund is the value of the affected food plus the GST charged on that
 * food. Delivery, packaging and tip come back only when the whole order failed
 * (wrong order, never delivered, unsafe food), because in that case none of the
 * service was performed.
 */
export function computeFoodRefund({
  foodSubtotal,
  affectedValue,
  deliveryFee = 0,
  packagingFee = 0,
  tip = 0,
  discount = 0,
  gstPct = DEFAULT_FOOD_GST_PCT,
  amountPaid,
  issueTypeId,
}) {
  const numbers = { foodSubtotal, affectedValue, deliveryFee, packagingFee, tip, discount, gstPct, amountPaid };
  for (const [key, value] of Object.entries(numbers)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${key.replace(/([A-Z])/g, " $1").toLowerCase()}.` };
    if (value < 0) return { error: "Amounts and rates cannot be negative." };
  }
  if (!(foodSubtotal > 0)) return { error: "Food subtotal must be greater than zero." };
  if (!(amountPaid > 0)) return { error: "Amount paid must be greater than zero." };
  if (gstPct > 28) return { error: "GST rate on food cannot exceed 28%." };
  if (discount > foodSubtotal) return { error: "Discount cannot be larger than the food subtotal." };
  if (affectedValue > foodSubtotal) {
    return { error: "Value of the affected items cannot exceed the food subtotal." };
  }

  const issue = ISSUE_TYPES.find((item) => item.id === issueTypeId) || ISSUE_TYPES[0];

  const taxableFood = round2(Math.max(0, foodSubtotal - discount));
  const gstOnFood = round2((taxableFood * gstPct) / 100);
  const expectedTotal = round2(taxableFood + gstOnFood + deliveryFee + packagingFee + tip);
  const billingGap = round2(amountPaid - expectedTotal);

  // Share of the order that failed, used to apportion the discount and the tax.
  const affectedShare = foodSubtotal > 0 ? affectedValue / foodSubtotal : 0;
  const wholeOrder = issue.refundsWholeOrder || affectedShare >= 0.999;

  const refundableFood = round2(wholeOrder ? taxableFood : affectedValue - discount * affectedShare);
  const refundableGst = round2((Math.max(0, refundableFood) * gstPct) / 100);
  const refundableFees = round2(wholeOrder ? deliveryFee + packagingFee + tip : 0);
  const refundDue = round2(Math.max(0, refundableFood) + refundableGst + refundableFees);
  const refundSharePct = amountPaid > 0 ? round2((refundDue / amountPaid) * 100) : 0;

  const notes = [];
  if (billingGap > BILL_TOLERANCE_INR) {
    notes.push(
      `You were charged Rs ${billingGap} more than the line items add up to — ask the platform for a full break-up of the bill.`,
    );
  } else if (billingGap < -BILL_TOLERANCE_INR) {
    notes.push(
      `The amount paid is Rs ${Math.abs(billingGap)} less than the line items add up to; check whether a coupon or wallet credit was applied.`,
    );
  }
  if (wholeOrder) {
    notes.push("Because the whole order failed, delivery, packaging and tip are claimed back along with the food value.");
  } else {
    notes.push("Only the affected items and the GST on them are claimed; delivery and packaging stay with the platform.");
  }
  if (issue.foodSafety) {
    notes.push(
      "Unsafe or stale food can also be reported to FSSAI, which regulates food businesses under the Food Safety and Standards Act, 2006. Keep the food, the packaging and the FSSAI licence number shown on the bill.",
    );
  }

  return {
    issue,
    taxableFood,
    gstOnFood,
    expectedTotal,
    amountPaid: round2(amountPaid),
    billingGap,
    wholeOrder,
    refundableFood: round2(Math.max(0, refundableFood)),
    refundableGst,
    refundableFees,
    refundDue,
    refundSharePct,
    notes,
    withinDistrictCommissionLimit: amountPaid <= DISTRICT_COMMISSION_LIMIT_INR,
  };
}

const clean = (value) => (typeof value === "string" ? value.trim() : "");
const rupees = (value) =>
  isNum(value) ? `Rs ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)}` : "Rs —";

/** Compose the complaint to the platform / its grievance officer. */
export function buildFoodComplaintLetter({
  customerName,
  platformName,
  restaurantName,
  orderId,
  orderDateISO,
  letterDateISO,
  deliveryAddress,
  phone,
  email,
  itemsAffected,
  extraNotes,
  refund,
  wantCompensation,
}) {
  if (!refund || refund.error) {
    return { error: refund?.error || "Fix the order figures before drafting the letter." };
  }
  const name = clean(customerName) || "[Your name]";
  const platform = clean(platformName) || "[Food delivery platform]";
  const restaurant = clean(restaurantName) || "[Restaurant name]";
  const order = clean(orderId) || "[Order ID]";
  const address = clean(deliveryAddress) || "[Delivery address]";
  const orderDateLong = formatLongDate(orderDateISO) || "[order date]";
  const letterDateLong = formatLongDate(letterDateISO) || "[date]";
  const ackByISO = addDaysISO(letterDateISO, Math.ceil(ACKNOWLEDGE_HOURS / 24));
  const redressByISO = addDaysISO(letterDateISO, REDRESS_DAYS);

  const subject = `Refund of ${rupees(refund.refundDue)} for order ${order} placed on ${orderDateLong}`;

  const asks = [
    `Refund ${rupees(refund.refundDue)} to the original payment method, not as wallet or app credit.`,
    "Share the itemised bill and the restaurant's FSSAI licence number for this order.",
  ];
  if (refund.billingGap > BILL_TOLERANCE_INR) {
    asks.push(`Explain the ${rupees(refund.billingGap)} charged over and above the listed line items.`);
  }
  if (refund.issue.foodSafety) {
    asks.push("Confirm what action has been taken with the restaurant partner on the food safety issue.");
  }
  if (wantCompensation) {
    asks.push(
      "Compensate me for the deficiency in service; I am willing to accept a reasonable amount without going further.",
    );
  }

  const body = [
    letterDateLong,
    "",
    "To,",
    "The Grievance Officer,",
    `${platform},`,
    "(as published under rule 4(5) of the Consumer Protection (E-Commerce) Rules, 2020)",
    "",
    `Subject: ${subject}`,
    "",
    "Sir / Madam,",
    "",
    `I placed order ${order} on ${platform} on ${orderDateLong} from ${restaurant}, for delivery at ${address}. I paid ${rupees(refund.amountPaid)} for that order.`,
    "",
    `I am writing because ${refund.issue.line}.`,
    clean(itemsAffected) ? `Items affected: ${clean(itemsAffected)}.` : "",
    "",
    "Break-up of my claim:",
    `Value of the food being claimed: ${rupees(refund.refundableFood)}`,
    `GST charged on that food: ${rupees(refund.refundableGst)}`,
    refund.refundableFees > 0
      ? `Delivery, packaging and tip on a failed order: ${rupees(refund.refundableFees)}`
      : "Delivery and packaging: not claimed, since the rest of the order was delivered",
    `Total refund claimed: ${rupees(refund.refundDue)} of the ${rupees(refund.amountPaid)} paid`,
    "",
    clean(extraNotes) ? `${clean(extraNotes)}` : "",
    clean(extraNotes) ? "" : "",
    "This is a deficiency in service within the meaning of section 2(11) of the Consumer Protection Act, 2019. I therefore request that you:",
    ...asks.map((ask, index) => `${index + 1}. ${ask}`),
    "",
    `Under rule 4(5) of the Consumer Protection (E-Commerce) Rules, 2020, this complaint must be acknowledged within ${ACKNOWLEDGE_HOURS} hours and redressed within one month of receipt. I look forward to your acknowledgement by ${formatLongDate(ackByISO) || "the due date"} and a resolution by ${formatLongDate(redressByISO) || "the due date"}.`,
    "",
    "If it is not resolved, I will take up the matter with the National Consumer Helpline and file a complaint before the District Consumer Disputes Redressal Commission through the e-Daakhil portal.",
    "",
    "Yours faithfully,",
    "",
    name,
    clean(phone) ? `Phone: ${clean(phone)}` : "Phone: [your phone number]",
    clean(email) ? `Email: ${clean(email)}` : "Email: [your email]",
    `Registered address: ${address}`,
    "",
    "Enclosures: order invoice, in-app chat transcript, photographs of the delivered food and packaging.",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

  return {
    subject,
    body,
    wordCount: body.split(/\s+/).filter(Boolean).length,
    ackByISO,
    redressByISO,
  };
}

/** Escalation ladder with the deadline maths done. */
export function escalationPlan({ letterDateISO, amountPaid }) {
  const plan = [
    {
      stage: "1. In-app support",
      by: formatLongDate(letterDateISO),
      detail: "Raise the issue in the app first and save the chat transcript — it is the evidence that you gave the platform a chance.",
    },
    {
      stage: "2. Grievance officer",
      by: formatLongDate(addDaysISO(letterDateISO, Math.ceil(ACKNOWLEDGE_HOURS / 24))),
      detail: `Send this letter by email. Rule 4(5) of the Consumer Protection (E-Commerce) Rules, 2020 requires acknowledgement within ${ACKNOWLEDGE_HOURS} hours.`,
    },
    {
      stage: "3. National Consumer Helpline",
      by: formatLongDate(addDaysISO(letterDateISO, REDRESS_DAYS)),
      detail: `If nothing moves within ${REDRESS_DAYS} days, register on the NCH portal or call 1915 — the platform usually responds to an NCH docket.`,
    },
    {
      stage: "4. District Consumer Commission (e-Daakhil)",
      by: formatLongDate(addDaysISO(letterDateISO, 365 * LIMITATION_YEARS)),
      detail:
        isNum(amountPaid) && amountPaid <= DISTRICT_COMMISSION_LIMIT_INR
          ? `File online through e-Daakhil where you reside or work, within ${LIMITATION_YEARS} years of the cause of action. The District Commission handles claims up to Rs 50 lakh.`
          : `File within ${LIMITATION_YEARS} years of the cause of action; the forum depends on the value of the claim.`,
    },
  ];
  return plan;
}
