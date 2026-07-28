/**
 * Consumer complaint drafter for a failed ecommerce order.
 *
 * Everything cited in the drafted notice and complaint comes from the Consumer
 * Protection Act 2019 and the rules under it:
 *
 *  - Section 2(11): "deficiency" includes any shortcoming or inadequacy in the
 *    quality, nature or manner of performance of a service. A parcel not
 *    delivered, delivered short or delivered damaged is a deficiency.
 *  - Section 2(47): unfair trade practice, which includes refusing to take
 *    back or withdraw defective goods, or to withdraw or discontinue a
 *    deficient service, and refund the consideration within the period
 *    stipulated or within thirty days where no period is stipulated. THIRTY
 *    DAYS is the fallback refund period the notice relies on.
 *  - Section 2(7): a person who buys goods or hires services for consideration
 *    is a consumer, and Explanation (b) makes clear that buying online is
 *    covered.
 *  - Section 34(1): the District Commission entertains complaints where the
 *    value of the goods or services PAID AS CONSIDERATION does not exceed
 *    fifty lakh rupees. Jurisdiction is fixed by the consideration paid, not
 *    by the compensation claimed - this is the change the 2019 Act made.
 *  - Section 47(1)(a)(i): State Commission where the consideration exceeds
 *    fifty lakh rupees but does not exceed two crore rupees.
 *  - Section 58(1)(a)(i): National Commission where the consideration exceeds
 *    two crore rupees. The fifty-lakh and two-crore figures are those set by
 *    the Consumer Protection (Jurisdiction of the District Commission, the
 *    State Commission and the National Commission) Rules 2021.
 *  - Section 34(2)(d): a complaint may be filed where the COMPLAINANT resides
 *    or personally works for gain - so an online buyer can file at home.
 *  - Section 35(1)(a): a complaint may be filed by the consumer to whom the
 *    goods were sold or the service provided.
 *  - Section 38(7): the Commission is to decide a complaint within three
 *    months of notice to the opposite party, or five months where the goods
 *    have to be analysed or tested.
 *  - Section 39: reliefs include return of the price, replacement, removal of
 *    the defect, compensation for loss or injury, and the costs of the
 *    proceeding.
 *  - Section 69(1): a complaint must be filed within TWO YEARS from the date
 *    on which the cause of action arose; Section 69(2) allows condonation of
 *    delay for sufficient cause recorded in writing.
 *  - Section 80: the Commission may refer the dispute to mediation.
 *  - Consumer Protection (E-Commerce) Rules 2020, Rule 4(5): a grievance
 *    officer must acknowledge a complaint within FORTY-EIGHT hours and redress
 *    it within ONE MONTH.
 *  - Consumer Protection (Consumer Disputes Redressal Commissions) Rules 2020:
 *    no fee is payable on a complaint where the value of the goods or services
 *    and the compensation claimed is up to five lakh rupees; above that the
 *    fee rises in slabs set out in the schedule to those rules.
 *  - The National Consumer Helpline number is 1915 and complaints can be filed
 *    online on the e-Daakhil portal.
 *
 * Informational only; not legal advice.
 */

/** Section 34(1) read with the Jurisdiction Rules 2021. */
export const DISTRICT_CEILING_INR = 5000000;
/** Section 47(1)(a)(i) read with the Jurisdiction Rules 2021. */
export const STATE_CEILING_INR = 20000000;
/** Consumer Disputes Redressal Commissions Rules 2020 - nil-fee ceiling. */
export const NIL_FEE_CEILING_INR = 500000;
/** Section 69(1) - limitation for filing a consumer complaint. */
export const LIMITATION_YEARS = 2;
/** Section 2(47) - fallback refund period where none is stipulated. */
export const DEFAULT_REFUND_DAYS = 30;
/** Rule 4(5), Consumer Protection (E-Commerce) Rules 2020. */
export const GRIEVANCE_ACK_HOURS = 48;
export const GRIEVANCE_REDRESS_DAYS = 30;
/** Section 38(7) - target for deciding a complaint. */
export const DECISION_MONTHS = 3;
export const DECISION_MONTHS_WITH_TESTING = 5;
/** National Consumer Helpline short code. */
export const NATIONAL_CONSUMER_HELPLINE = "1915";

const MS_PER_DAY = 86400000;
const MAX_FIELD = 140;
/** Nothing above this is a retail ecommerce dispute; it guards typos. */
const MAX_AMOUNT_INR = 1000000000;

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

/** What went wrong with the order, and the facts that have to be pleaded. */
export const ORDER_PROBLEMS = [
  {
    id: "not-delivered",
    label: "Marked delivered but never received",
    statement:
      "the parcel was marked delivered on the tracking page although it was never handed to me or to anyone authorised by me",
    proof: "the tracking page screenshot showing the delivery scan, and a written statement that nobody at the address received it",
    demand: "a full refund of the amount paid, or delivery of the ordered item, at my option",
  },
  {
    id: "missing-item",
    label: "Parcel arrived short of items",
    statement: "the parcel arrived with fewer items than the invoice records",
    proof: "photographs of the opened parcel next to the invoice, and the unboxing video if one was recorded",
    demand: "delivery of the missing items or a refund of their invoice value",
  },
  {
    id: "damaged",
    label: "Item arrived damaged or broken",
    statement: "the item arrived damaged and unusable for the purpose it was bought for",
    proof: "photographs of the outer packing, the shipping label and the damaged item as it lay in the box",
    demand: "a replacement in sound condition, or a full refund",
  },
  {
    id: "wrong-item",
    label: "A completely different item was sent",
    statement: "an item different from the one ordered and paid for was delivered",
    proof: "photographs of the item received and its label, next to the order confirmation",
    demand: "delivery of the item actually ordered, or a full refund",
  },
  {
    id: "counterfeit",
    label: "Counterfeit or not as described",
    statement:
      "the item delivered is not the branded or specified product ordered, and does not match the description and images on the listing",
    proof: "photographs of the item, its packaging and any serial or authenticity marking, next to the listing screenshot",
    demand: "a full refund, and the removal of the misleading listing",
  },
  {
    id: "refund-not-paid",
    label: "Return picked up but refund not paid",
    statement:
      "the item was returned and collected, but the refund has not been credited despite the return being marked complete",
    proof: "the return pickup confirmation, the courier acknowledgement and the bank or card statement showing no credit",
    demand: "immediate credit of the refund with interest for the period of delay",
  },
  {
    id: "cancelled-not-refunded",
    label: "Order cancelled but money not returned",
    statement: "the order was cancelled but the amount debited has not been returned",
    proof: "the cancellation confirmation and the bank or card statement showing the debit and no credit",
    demand: "immediate refund of the full amount debited",
  },
];

/** Optional heads of claim a consumer may add to the prayer. */
export const CLAIM_HEADS = [
  { id: "mental-agony", label: "Compensation for mental agony and harassment" },
  { id: "litigation-cost", label: "Cost of the proceedings" },
  { id: "interest", label: "Interest on the amount withheld" },
  { id: "punitive", label: "Punitive damages for a repeated practice" },
];

function clean(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function roundPaise(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Parse yyyy-mm-dd into a UTC-midnight timestamp, or null when unreal.
 * @param {string} iso
 * @returns {number|null}
 */
export function parseIsoDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
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

function describe(stamp) {
  const date = new Date(stamp);
  const yyyy = String(date.getUTCFullYear()).padStart(4, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return {
    iso: `${yyyy}-${mm}-${dd}`,
    long: `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`,
  };
}

/**
 * Format yyyy-mm-dd as "3 August 2026".
 * @param {string} iso
 * @returns {string|null}
 */
export function formatIsoLong(iso) {
  const stamp = parseIsoDate(iso);
  return stamp === null ? null : describe(stamp).long;
}

/**
 * Add whole days to a yyyy-mm-dd date.
 * @param {string} iso
 * @param {number} days
 * @returns {{iso:string, long:string}|null}
 */
export function addDays(iso, days) {
  const stamp = parseIsoDate(iso);
  if (stamp === null || !Number.isInteger(days)) return null;
  return describe(stamp + days * MS_PER_DAY);
}

/**
 * Which consumer commission the complaint goes to, and what it is worth.
 *
 * Under Section 34(1) of the Consumer Protection Act 2019 the forum is fixed
 * by the consideration PAID, not by the compensation claimed, so the two are
 * reported separately.
 *
 * @param {object} input
 * @param {number} input.considerationPaid  Amount actually paid for the goods or service.
 * @param {number} [input.shippingPaid]     Shipping or handling paid on the order.
 * @param {number} [input.incidentalCost]   Out-of-pocket costs caused by the failure.
 * @param {number} [input.compensationClaim] Compensation claimed for agony and loss.
 * @param {number} [input.interestClaim]    Interest claimed on the withheld amount.
 * @param {number} [input.litigationCost]   Cost of the proceeding claimed.
 * @returns {{considerationPaid:number, totalClaim:number, forum:string,
 *            forumBasis:string, nilFee:boolean, refundableNow:number}
 *          | {error:string}}
 */
export function computeClaim({
  considerationPaid,
  shippingPaid = 0,
  incidentalCost = 0,
  compensationClaim = 0,
  interestClaim = 0,
  litigationCost = 0,
}) {
  const amounts = {
    considerationPaid: Number(considerationPaid),
    shippingPaid: Number(shippingPaid),
    incidentalCost: Number(incidentalCost),
    compensationClaim: Number(compensationClaim),
    interestClaim: Number(interestClaim),
    litigationCost: Number(litigationCost),
  };

  if (!Object.values(amounts).every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for every amount." };
  }
  if (Object.values(amounts).some((value) => value < 0)) {
    return { error: "Amounts cannot be negative." };
  }
  if (!(amounts.considerationPaid > 0)) {
    return { error: "Enter the amount actually paid for the order - it fixes which commission hears the case." };
  }
  if (Object.values(amounts).some((value) => value > MAX_AMOUNT_INR)) {
    return { error: "That amount is outside what this tool handles." };
  }

  const totalClaim = roundPaise(
    amounts.considerationPaid +
      amounts.shippingPaid +
      amounts.incidentalCost +
      amounts.compensationClaim +
      amounts.interestClaim +
      amounts.litigationCost,
  );

  let forum = "District Consumer Disputes Redressal Commission";
  let forumBasis = `the consideration paid does not exceed Rs ${DISTRICT_CEILING_INR.toLocaleString("en-IN")}, so Section 34(1) puts it before the District Commission`;
  if (amounts.considerationPaid > STATE_CEILING_INR) {
    forum = "National Consumer Disputes Redressal Commission";
    forumBasis = `the consideration paid exceeds Rs ${STATE_CEILING_INR.toLocaleString("en-IN")}, so Section 58(1)(a)(i) puts it before the National Commission`;
  } else if (amounts.considerationPaid > DISTRICT_CEILING_INR) {
    forum = "State Consumer Disputes Redressal Commission";
    forumBasis = `the consideration paid exceeds Rs ${DISTRICT_CEILING_INR.toLocaleString("en-IN")} but not Rs ${STATE_CEILING_INR.toLocaleString("en-IN")}, so Section 47(1)(a)(i) puts it before the State Commission`;
  }

  return {
    considerationPaid: roundPaise(amounts.considerationPaid),
    totalClaim,
    forum,
    forumBasis,
    nilFee: totalClaim <= NIL_FEE_CEILING_INR,
    refundableNow: roundPaise(amounts.considerationPaid + amounts.shippingPaid),
  };
}

/**
 * Whether the complaint is still within the two-year limitation.
 *
 * @param {object} input
 * @param {string} input.causeOfActionDate yyyy-mm-dd the cause of action arose.
 * @param {string} input.filingDate        yyyy-mm-dd the complaint is filed.
 * @returns {{lastDate:{iso:string,long:string}, daysElapsed:number,
 *            daysLeft:number, withinTime:boolean} | {error:string}}
 */
export function computeLimitation({ causeOfActionDate, filingDate }) {
  const cause = parseIsoDate(causeOfActionDate);
  if (cause === null) return { error: "Enter a valid date on which the cause of action arose." };
  const filing = parseIsoDate(filingDate);
  if (filing === null) return { error: "Enter a valid date for filing the complaint." };
  if (filing < cause) {
    return { error: "The filing date falls before the cause of action arose." };
  }

  const causeDate = new Date(cause);
  const lastStamp = Date.UTC(
    causeDate.getUTCFullYear() + LIMITATION_YEARS,
    causeDate.getUTCMonth(),
    causeDate.getUTCDate(),
  );

  const daysElapsed = Math.round((filing - cause) / MS_PER_DAY);
  const daysLeft = Math.round((lastStamp - filing) / MS_PER_DAY);

  return {
    lastDate: describe(lastStamp),
    daysElapsed,
    daysLeft,
    withinTime: filing <= lastStamp,
  };
}

/**
 * Draft the pre-litigation notice and the complaint outline.
 *
 * @param {object} input
 * @param {string} input.consumerName
 * @param {string} input.consumerAddress
 * @param {string} input.consumerPhone
 * @param {string} input.consumerEmail
 * @param {string} input.platformName     Marketplace or store the order was placed on.
 * @param {string} input.sellerName       Seller of record, if different.
 * @param {string} input.orderNumber
 * @param {string} input.itemDescription
 * @param {string} input.orderDate        yyyy-mm-dd
 * @param {string} input.incidentDate     yyyy-mm-dd the problem arose.
 * @param {string} input.problemId        One of ORDER_PROBLEMS ids.
 * @param {string[]} input.claimHeadIds   Ticked CLAIM_HEADS ids.
 * @param {number} input.noticeDays       Days given to comply before filing.
 * @param {string} input.noticeDate       yyyy-mm-dd the notice is sent.
 * @param {string} input.complaintsMadeText Free text listing earlier complaints.
 * @param {object} input.claim            Result of computeClaim.
 * @param {object} input.limitation       Result of computeLimitation.
 * @returns {{notice:string, complaintOutline:string, subject:string,
 *            complyBy:{iso:string,long:string}} | {error:string}}
 */
export function buildEcommerceComplaint({
  consumerName,
  consumerAddress,
  consumerPhone,
  consumerEmail,
  platformName,
  sellerName,
  orderNumber,
  itemDescription,
  orderDate,
  incidentDate,
  problemId,
  claimHeadIds = [],
  noticeDays,
  noticeDate,
  complaintsMadeText = "",
  claim,
  limitation,
}) {
  const name = clean(consumerName);
  const addr = clean(consumerAddress);
  const tel = clean(consumerPhone);
  const mail = clean(consumerEmail);
  const platform = clean(platformName);
  const seller = clean(sellerName);
  const order = clean(orderNumber);
  const item = clean(itemDescription);
  const earlier = clean(complaintsMadeText);

  if (!name) return { error: "Enter your name." };
  if (!addr) return { error: "Enter your address - it also decides where you can file." };
  if (!platform) return { error: "Enter the platform or store the order was placed on." };
  if (!order) return { error: "Enter the order number." };
  if (!item) return { error: "Describe the item ordered in a few words." };
  if ([name, tel, mail, platform, seller, order, item].some((value) => value.length > MAX_FIELD)) {
    return { error: `Keep each field under ${MAX_FIELD} characters.` };
  }
  if (addr.length > 400) return { error: "Keep the address under 400 characters." };
  if (earlier.length > 500) return { error: "Keep the note about earlier complaints under 500 characters." };

  const problem = ORDER_PROBLEMS.find((entry) => entry.id === problemId);
  if (!problem) return { error: "Choose what went wrong with the order." };

  const orderLong = formatIsoLong(orderDate);
  const incidentLong = formatIsoLong(incidentDate);
  const noticeLong = formatIsoLong(noticeDate);
  if (!orderLong) return { error: "Enter a valid order date." };
  if (!incidentLong) return { error: "Enter a valid date on which the problem arose." };
  if (!noticeLong) return { error: "Enter a valid date for the notice." };
  if (parseIsoDate(incidentDate) < parseIsoDate(orderDate)) {
    return { error: "The problem cannot have arisen before the order was placed." };
  }

  const days = Number(noticeDays);
  if (!Number.isInteger(days) || days < 1 || days > 90) {
    return { error: "Give the other side between 1 and 90 days to comply before filing." };
  }

  if (!claim || claim.error) {
    return { error: claim?.error || "Enter the amounts so the claim can be valued." };
  }
  if (!limitation || limitation.error) {
    return { error: limitation?.error || "Enter valid dates so limitation can be checked." };
  }

  const complyBy = addDays(noticeDate, days);
  if (!complyBy) return { error: "Could not work out the compliance date." };

  const heads = CLAIM_HEADS.filter((head) => claimHeadIds.includes(head.id));
  const addressee = seller ? `${platform} and ${seller}` : platform;

  const subject = `Notice of deficiency in service and demand for refund - order ${order} dated ${orderLong}`;

  const notice = [
    "NOTICE UNDER THE CONSUMER PROTECTION ACT, 2019",
    "",
    `Date: ${noticeLong}`,
    "",
    "To,",
    `The Grievance Officer, ${platform}`,
    ...(seller ? [`And to: ${seller} (seller of record)`] : []),
    "",
    `Subject: ${subject}`,
    "",
    "Sir / Madam,",
    "",
    `1. I placed order number ${order} with ${platform} on ${orderLong} for ${item}, and paid Rs ${claim.considerationPaid.toLocaleString("en-IN")} as consideration${claim.refundableNow > claim.considerationPaid ? `, besides shipping and handling, taking the amount paid to Rs ${claim.refundableNow.toLocaleString("en-IN")}` : ""}.`,
    "",
    `2. On ${incidentLong}, ${problem.statement}. I have retained ${problem.proof} and will produce it.`,
    "",
    earlier
      ? `3. I have already taken this up with you: ${earlier} No effective redress has followed, although Rule 4(5) of the Consumer Protection (E-Commerce) Rules 2020 requires a grievance to be acknowledged within ${GRIEVANCE_ACK_HOURS} hours and redressed within one month.`
      : `3. I have already raised this through your customer support channel and no effective redress has followed, although Rule 4(5) of the Consumer Protection (E-Commerce) Rules 2020 requires a grievance to be acknowledged within ${GRIEVANCE_ACK_HOURS} hours and redressed within one month.`,
    "",
    `4. What has happened is a deficiency in service within the meaning of Section 2(11) of the Consumer Protection Act 2019. A refusal to take back a defective item or to refund the consideration within the stipulated period, or within ${DEFAULT_REFUND_DAYS} days where none is stipulated, is also an unfair trade practice under Section 2(47) of that Act.`,
    "",
    `5. I therefore call upon ${addressee} to provide ${problem.demand} within ${days} day${days === 1 ? "" : "s"} of receipt of this notice, that is on or before ${complyBy.long}.`,
    "",
    heads.length > 0
      ? `6. If that is not done I shall file a complaint before the ${claim.forum} claiming, besides the refund, ${heads.map((head) => head.label.toLowerCase()).join(", ")}, taking the total claim to Rs ${claim.totalClaim.toLocaleString("en-IN")}. A complaint may be filed where I reside or work, as Section 34(2)(d) permits.`
      : `6. If that is not done I shall file a complaint before the ${claim.forum} for the reliefs available under Section 39 of the Act. A complaint may be filed where I reside or work, as Section 34(2)(d) permits.`,
    "",
    `7. This notice is issued without prejudice to any other remedy available to me in law, including a complaint through the National Consumer Helpline on ${NATIONAL_CONSUMER_HELPLINE}.`,
    "",
    "Yours faithfully,",
    "",
    name,
    addr,
    ...(tel ? [`Phone: ${tel}`] : []),
    ...(mail ? [`Email: ${mail}`] : []),
    `Order number: ${order}`,
  ].join("\n");

  const complaintOutline = [
    `COMPLAINT OUTLINE - ${claim.forum.toUpperCase()}`,
    "",
    `Complainant: ${name}, ${addr}`,
    `Opposite parties: 1) ${platform}${seller ? `; 2) ${seller}` : ""}`,
    "",
    "Jurisdiction",
    `- Pecuniary: ${claim.forumBasis}.`,
    `- Territorial: Section 34(2)(d) allows the complaint to be filed where the complainant resides or personally works for gain.`,
    `- Limitation: the cause of action arose on ${incidentLong}. Section 69(1) allows two years, so the last date to file is ${limitation.lastDate.long}. ${
      limitation.withinTime
        ? `The proposed filing date is within time, with ${limitation.daysLeft} day${limitation.daysLeft === 1 ? "" : "s"} to spare.`
        : `The proposed filing date is beyond that, so an application under Section 69(2) to condone the delay, with reasons, must be filed along with the complaint.`
    }`,
    "",
    "Facts to plead",
    `1. Order ${order} placed on ${orderLong} for ${item}; consideration paid Rs ${claim.considerationPaid.toLocaleString("en-IN")}.`,
    `2. On ${incidentLong}, ${problem.statement}.`,
    `3. Grievance raised with the opposite parties and not redressed within the one month allowed by Rule 4(5) of the Consumer Protection (E-Commerce) Rules 2020.`,
    `4. Notice dated ${noticeLong} calling for compliance by ${complyBy.long} went unanswered or was refused.`,
    "",
    "Documents to file",
    "- Order confirmation and tax invoice.",
    "- Proof of payment - bank or card statement showing the debit.",
    `- ${problem.proof}.`,
    "- Screenshots of the grievance raised and every reply received.",
    "- Copy of this notice with proof of despatch and delivery.",
    "",
    "Reliefs to claim under Section 39",
    `- Refund of Rs ${claim.refundableNow.toLocaleString("en-IN")} being the amount paid, or replacement of the item.`,
    ...heads.map((head) => `- ${head.label}.`),
    `- Total claim as valued: Rs ${claim.totalClaim.toLocaleString("en-IN")}.`,
    "",
    "Filing notes",
    `- The complaint can be filed online on the e-Daakhil portal or in person at the Commission.`,
    `- Fee: ${claim.nilFee ? `no fee is payable, because the value of the goods or services and the compensation claimed is up to Rs ${NIL_FEE_CEILING_INR.toLocaleString("en-IN")}` : "a fee applies above the nil-fee ceiling; check the current schedule to the Consumer Protection (Consumer Disputes Redressal Commissions) Rules 2020 for the slab that fits this claim"}.`,
    `- Section 38(7) sets a target of ${DECISION_MONTHS} months to decide a complaint, or ${DECISION_MONTHS_WITH_TESTING} months where the goods have to be tested.`,
    `- The Commission may refer the dispute to mediation under Section 80; a settlement there is usually faster than a contested hearing.`,
  ].join("\n");

  return { notice, complaintOutline, subject, complyBy };
}
