/**
 * Event cancellation and refund policy generator.
 *
 * A tiered event refund policy pays back a percentage of the ticket price that
 * falls as the event date gets closer. The maths and the tax treatment below
 * follow published rules:
 *
 *  - CBIC Circular No. 178/10/2022-GST dated 3 August 2022: a cancellation or
 *    forfeiture charge is consideration for the principal supply, so it is
 *    taxed at the SAME GST rate as the ticket itself. In practice this means
 *    GST is refunded only on the portion of the ticket price that is refunded;
 *    GST on the amount the organiser keeps stays with the exchequer. That is
 *    exactly how this module splits the tax.
 *  - Consumer Protection Act 2019, Section 2(11): if the organiser cancels,
 *    postpones or fails to hold the event, that is a deficiency in service and
 *    the whole amount collected, including booking fees, is refundable.
 *  - Consumer Protection Act 2019, Section 2(46)/(47): a term that is one-sided
 *    or unfair can be struck down, so a policy that refunds nothing at any
 *    notice period is risky; the drafter warns when the top tier is 0%.
 *  - Consumer Protection (E-Commerce) Rules 2020, Rule 4(5): consumer
 *    complaints must be acknowledged in 48 hours and redressed within a month,
 *    which is why the drafted grievance clause uses those outer limits.
 *  - Consumer Protection Act 2019, Section 69: two years to file a complaint.
 *
 * Everything here is arithmetic and text assembly. It is informational and is
 * not legal or tax advice.
 */

/** Rule 4(5), Consumer Protection (E-Commerce) Rules 2020. */
export const ACK_HOURS_LIMIT = 48;
/** Rule 4(5) outer limit for redressal, in days. */
export const REDRESS_DAYS_LIMIT = 30;
/** Section 69, Consumer Protection Act 2019. */
export const COMPLAINT_LIMITATION_YEARS = 2;
/** Milliseconds in one calendar day at UTC midnight. */
const MS_PER_DAY = 86400000;
/** No policy tier may sit further out than three years before the event. */
const MAX_TIER_DAYS = 1095;
/** Longest a free-text field may run. */
const MAX_FIELD = 120;
/** Most tickets a single booking may hold in this calculator. */
const MAX_QUANTITY = 10000;

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
 * Default refund ladder. `minDaysBefore` is inclusive: a cancellation made
 * exactly that many whole days before the event gets that tier's percentage.
 */
export const DEFAULT_TIERS = [
  { minDaysBefore: 30, refundPercent: 100 },
  { minDaysBefore: 15, refundPercent: 75 },
  { minDaysBefore: 7, refundPercent: 50 },
  { minDaysBefore: 3, refundPercent: 25 },
  { minDaysBefore: 0, refundPercent: 0 },
];

/** Reasons a booking can end, and who bears the cost of each. */
export const CANCEL_REASONS = [
  {
    id: "attendee",
    label: "The attendee cancelled",
    fullRefund: false,
    note: "The tiered ladder applies and the organiser keeps the tier's share.",
  },
  {
    id: "organiser",
    label: "The organiser cancelled the event",
    fullRefund: true,
    note: "Failure to hold the event is a deficiency in service under Section 2(11) of the Consumer Protection Act 2019, so everything collected, booking fee included, goes back.",
  },
  {
    id: "postponed",
    label: "The event was postponed and the attendee cannot attend the new date",
    fullRefund: true,
    note: "The attendee bought a date as much as a seat, so a moved date that does not suit them is refunded in full.",
  },
  {
    id: "force-majeure",
    label: "Cancelled by an authority, weather or force majeure",
    fullRefund: true,
    note: "The event never took place, so the ticket price is returned; the organiser may retain only costs the policy expressly names.",
  },
];

function clean(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function roundPaise(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Parse yyyy-mm-dd into a UTC-midnight timestamp, or null if not a real date.
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

/**
 * Format yyyy-mm-dd as "1 September 2026".
 * @param {string} iso
 * @returns {string|null}
 */
export function formatIsoLong(iso) {
  const stamp = parseIsoDate(iso);
  if (stamp === null) return null;
  const date = new Date(stamp);
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * Whole days between the cancellation date and the event date.
 * Positive means the cancellation is before the event.
 * @param {string} cancelDate yyyy-mm-dd
 * @param {string} eventDate  yyyy-mm-dd
 * @returns {number|null}
 */
export function daysBetween(cancelDate, eventDate) {
  const from = parseIsoDate(cancelDate);
  const to = parseIsoDate(eventDate);
  if (from === null || to === null) return null;
  return Math.round((to - from) / MS_PER_DAY);
}

/**
 * Sort and validate a refund ladder. Tiers must be whole days, whole-number-
 * friendly percentages, and must include a floor tier at 0 days.
 * @param {{minDaysBefore:number, refundPercent:number}[]} tiers
 * @returns {{tiers:{minDaysBefore:number, refundPercent:number}[]}|{error:string}}
 */
export function normaliseTiers(tiers) {
  if (!Array.isArray(tiers) || tiers.length === 0) {
    return { error: "Add at least one refund tier." };
  }
  const cleaned = [];
  for (const tier of tiers) {
    const days = Number(tier?.minDaysBefore);
    const percent = Number(tier?.refundPercent);
    if (!Number.isFinite(days) || !Number.isInteger(days) || days < 0 || days > MAX_TIER_DAYS) {
      return { error: `Each tier needs a whole number of days from 0 to ${MAX_TIER_DAYS}.` };
    }
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      return { error: "Each refund percentage must be between 0 and 100." };
    }
    if (cleaned.some((existing) => existing.minDaysBefore === days)) {
      return { error: `Two tiers both start at ${days} days before the event - remove one.` };
    }
    cleaned.push({ minDaysBefore: days, refundPercent: percent });
  }
  cleaned.sort((a, b) => b.minDaysBefore - a.minDaysBefore);
  if (cleaned[cleaned.length - 1].minDaysBefore !== 0) {
    return { error: "Add a final tier starting at 0 days so every cancellation has an answer." };
  }
  for (let i = 1; i < cleaned.length; i += 1) {
    if (cleaned[i].refundPercent > cleaned[i - 1].refundPercent) {
      return {
        error: "A later tier cannot refund more than an earlier one - the ladder must fall as the event nears.",
      };
    }
  }
  return { tiers: cleaned };
}

/**
 * Price one cancellation against the ladder.
 *
 * GST split follows CBIC Circular 178/10/2022-GST: tax is returned only on the
 * refunded slice of the ticket price, and the retained slice keeps its tax.
 *
 * @param {object} input
 * @param {number} input.ticketPrice        Face price of one ticket, before GST.
 * @param {number} input.quantity           Number of tickets in the booking.
 * @param {number} [input.bookingFeePerTicket] Platform / convenience fee per ticket.
 * @param {number} [input.gstPercent]       GST rate on the ticket.
 * @param {string} input.eventDate          yyyy-mm-dd of the event.
 * @param {string} input.cancelDate         yyyy-mm-dd the cancellation is made.
 * @param {{minDaysBefore:number, refundPercent:number}[]} input.tiers
 * @param {string} [input.reasonId]         One of CANCEL_REASONS ids.
 * @param {boolean} [input.bookingFeeRefundable] Refund the fee on an attendee cancellation.
 * @returns {{daysBefore:number, refundPercent:number, tierLabel:string,
 *            grossPaid:number, ticketFace:number, gstOnTickets:number, fees:number,
 *            refundTotal:number, refundOnFace:number, refundOnGst:number,
 *            refundOnFees:number, retained:number, retainedGst:number,
 *            effectivePercent:number, reasonNote:string} | {error:string}}
 */
export function computeEventRefund({
  ticketPrice,
  quantity,
  bookingFeePerTicket = 0,
  gstPercent = 0,
  eventDate,
  cancelDate,
  tiers,
  reasonId = "attendee",
  bookingFeeRefundable = false,
}) {
  const price = Number(ticketPrice);
  const qty = Number(quantity);
  const fee = Number(bookingFeePerTicket);
  const gst = Number(gstPercent);

  if (![price, qty, fee, gst].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for the ticket price, quantity, fee and GST rate." };
  }
  if (!(price > 0)) return { error: "Ticket price must be greater than zero." };
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
    return { error: `Quantity must be a whole number between 1 and ${MAX_QUANTITY}.` };
  }
  if (fee < 0) return { error: "Booking fee cannot be negative." };
  if (gst < 0 || gst > 100) return { error: "GST rate must be between 0% and 100%." };

  const reason = CANCEL_REASONS.find((item) => item.id === reasonId);
  if (!reason) return { error: "Choose why the booking is being cancelled." };

  const ladder = normaliseTiers(tiers);
  if (ladder.error) return { error: ladder.error };

  const daysBefore = daysBetween(cancelDate, eventDate);
  if (daysBefore === null) {
    return { error: "Enter valid event and cancellation dates in yyyy-mm-dd form." };
  }
  if (daysBefore < 0) {
    return { error: "The cancellation date falls after the event date - a used ticket cannot be cancelled." };
  }

  const ticketFace = roundPaise(price * qty);
  const gstOnTickets = roundPaise(ticketFace * (gst / 100));
  const fees = roundPaise(fee * qty);
  const grossPaid = roundPaise(ticketFace + gstOnTickets + fees);

  const tier = ladder.tiers.find((item) => daysBefore >= item.minDaysBefore) ?? {
    minDaysBefore: 0,
    refundPercent: 0,
  };

  const refundPercent = reason.fullRefund ? 100 : tier.refundPercent;
  const refundOnFace = roundPaise(ticketFace * (refundPercent / 100));
  const refundOnGst = roundPaise(gstOnTickets * (refundPercent / 100));
  const refundOnFees = reason.fullRefund || bookingFeeRefundable ? fees : 0;
  const refundTotal = roundPaise(refundOnFace + refundOnGst + refundOnFees);
  const retained = roundPaise(grossPaid - refundTotal);
  const retainedGst = roundPaise(gstOnTickets - refundOnGst);

  const tierLabel = reason.fullRefund
    ? "Full refund - organiser side cancellation"
    : tier.minDaysBefore === 0
      ? `Under ${ladder.tiers[ladder.tiers.length - 2]?.minDaysBefore ?? 1} days before the event`
      : `${tier.minDaysBefore} or more days before the event`;

  return {
    daysBefore,
    refundPercent,
    tierLabel,
    grossPaid,
    ticketFace,
    gstOnTickets,
    fees,
    refundTotal,
    refundOnFace,
    refundOnGst,
    refundOnFees,
    retained,
    retainedGst,
    effectivePercent: roundPaise((refundTotal / grossPaid) * 100),
    reasonNote: reason.note,
  };
}

function tierSentence(tier, nextHigher) {
  if (tier.minDaysBefore === 0) {
    const ceiling = nextHigher ? nextHigher.minDaysBefore : 1;
    return `Less than ${ceiling} day${ceiling === 1 ? "" : "s"} before the event: ${tier.refundPercent}% of the ticket price refunded.`;
  }
  if (!nextHigher) {
    return `${tier.minDaysBefore} or more days before the event: ${tier.refundPercent}% of the ticket price refunded.`;
  }
  return `${tier.minDaysBefore} to ${nextHigher.minDaysBefore - 1} days before the event: ${tier.refundPercent}% of the ticket price refunded.`;
}

/**
 * Assemble the published event refund policy.
 *
 * @param {object} input
 * @param {string} input.organiserName
 * @param {string} input.eventName
 * @param {string} input.eventDate       yyyy-mm-dd
 * @param {string} input.contactEmail
 * @param {{minDaysBefore:number, refundPercent:number}[]} input.tiers
 * @param {boolean} input.bookingFeeRefundable
 * @param {boolean} input.transferAllowed  Allow name transfer instead of refund.
 * @param {number} input.transferCutoffDays Days before the event that transfers close.
 * @param {number} input.ackHours
 * @param {number} input.redressDays
 * @param {number} input.gstPercent
 * @returns {{policyText:string, clauses:{title:string, body:string}[],
 *            eventLong:string, tierCount:number, warning:string|null} | {error:string}}
 */
export function buildEventRefundPolicy({
  organiserName,
  eventName,
  eventDate,
  contactEmail,
  tiers,
  bookingFeeRefundable = false,
  transferAllowed = true,
  transferCutoffDays = 7,
  ackHours,
  redressDays,
  gstPercent = 0,
}) {
  const organiser = clean(organiserName);
  const event = clean(eventName);
  const email = clean(contactEmail);

  if (!organiser) return { error: "Enter the organiser's name." };
  if (!event) return { error: "Enter the event name." };
  if (!email) return { error: "Enter a contact email for refund requests." };
  if ([organiser, event, email].some((value) => value.length > MAX_FIELD)) {
    return { error: `Keep each field under ${MAX_FIELD} characters.` };
  }

  const eventLong = formatIsoLong(eventDate);
  if (!eventLong) return { error: "Enter a valid event date." };

  const ladder = normaliseTiers(tiers);
  if (ladder.error) return { error: ladder.error };

  const ack = Number(ackHours);
  if (!Number.isFinite(ack) || !Number.isInteger(ack) || ack < 1 || ack > ACK_HOURS_LIMIT) {
    return {
      error: `Acknowledgement time must be 1 to ${ACK_HOURS_LIMIT} hours - Rule 4(5) of the Consumer Protection (E-Commerce) Rules 2020 caps it at ${ACK_HOURS_LIMIT} hours.`,
    };
  }

  const redress = Number(redressDays);
  if (
    !Number.isFinite(redress) ||
    !Number.isInteger(redress) ||
    redress < 1 ||
    redress > REDRESS_DAYS_LIMIT
  ) {
    return { error: `Resolution time must be 1 to ${REDRESS_DAYS_LIMIT} days under Rule 4(5).` };
  }

  const cutoff = Number(transferCutoffDays);
  if (!Number.isFinite(cutoff) || !Number.isInteger(cutoff) || cutoff < 0 || cutoff > MAX_TIER_DAYS) {
    return { error: "Transfer cut-off must be a whole number of days from 0 upwards." };
  }

  const gst = Number(gstPercent);
  if (!Number.isFinite(gst) || gst < 0 || gst > 100) {
    return { error: "GST rate must be between 0% and 100%." };
  }

  const ladderLines = ladder.tiers.map((tier, index) =>
    tierSentence(tier, ladder.tiers[index - 1] ?? null),
  );

  const warning =
    ladder.tiers[0].refundPercent === 0
      ? "Your top tier refunds nothing even with the longest notice. A blanket no-refund term is the kind of one-sided clause a consumer commission can strike down under Section 2(46) of the Consumer Protection Act 2019 - consider refunding at least part of the price at long notice."
      : null;

  const clauses = [
    {
      title: "1. What this policy covers",
      body: `This policy governs every ticket sold by ${organiser} for ${event}, scheduled for ${eventLong}. It applies from the moment payment is confirmed. Buying a ticket means accepting these terms; nothing in them takes away any right you have under the Consumer Protection Act 2019.`,
    },
    {
      title: "2. Refund ladder when you cancel",
      body: `Refunds are calculated on how many whole days before the event we receive your written cancellation:\n${ladderLines.map((line) => `- ${line}`).join("\n")}`,
    },
    {
      title: "3. Booking and convenience fees",
      body: bookingFeeRefundable
        ? "The booking or convenience fee is refunded along with the ticket price on every approved refund."
        : "The booking or convenience fee covers payment-gateway and ticketing costs already incurred and is not refundable on an attendee cancellation. It is refunded in full if we cancel or postpone the event.",
    },
    {
      title: "4. GST on the amount we keep",
      body:
        gst > 0
          ? `Ticket prices carry GST at ${gst}%. Where a refund is partial, GST is returned only on the refunded portion. The portion we retain is a cancellation charge and, following CBIC Circular No. 178/10/2022-GST dated 3 August 2022, it carries GST at the same ${gst}% rate as the ticket, which we deposit with the government and cannot return.`
          : "Where a refund is partial, any tax charged is returned only on the refunded portion. Tax on the amount retained is a cancellation charge taxed at the same rate as the ticket, in line with CBIC Circular No. 178/10/2022-GST dated 3 August 2022.",
    },
    {
      title: "5. If we cancel or postpone",
      body: `If ${organiser} cancels the event, or postpones it to a date you cannot attend, you get 100% of everything you paid, including the booking fee, without any deduction. We will start those refunds within ${redress} day${redress === 1 ? "" : "s"} of announcing the change. A cancellation forced by an authority, a public-safety order or weather is treated the same way for the ticket price.`,
    },
    {
      title: "6. Name transfer instead of a refund",
      body: transferAllowed
        ? `You may transfer your ticket to another person free of charge up to ${cutoff} day${cutoff === 1 ? "" : "s"} before the event by writing to ${email} with the new attendee's name, phone number and email. After that cut-off the guest list is locked with the venue and only the refund ladder applies.`
        : "Tickets are personal to the buyer and cannot be transferred to another name. Only the refund ladder above applies.",
    },
    {
      title: "7. How to ask for a refund",
      body: `Email ${email} from the address used to book, with the booking ID and the reason. We acknowledge every request within ${ack} hour${ack === 1 ? "" : "s"} and settle approved refunds within ${redress} day${redress === 1 ? "" : "s"}, which is inside the 48-hour acknowledgement and one-month redressal limits set by Rule 4(5) of the Consumer Protection (E-Commerce) Rules 2020. Money is returned to the original payment method; the time it takes to appear is set by your bank.`,
    },
    {
      title: "8. No-shows and denied entry",
      body: "A ticket not used on the day is not refundable. Entry may be refused without refund where a valid ID does not match the booking, where the venue's security or age rules are broken, or where an authority restricts entry for reasons attributable to the ticket holder.",
    },
    {
      title: "9. Disputes",
      body: `If you disagree with our decision you may escalate to the District Consumer Disputes Redressal Commission where you live or where the event was to be held, within ${COMPLAINT_LIMITATION_YEARS} years of the cause of action under Section 69 of the Consumer Protection Act 2019.`,
    },
  ];

  const policyText = [
    `${event.toUpperCase()} - CANCELLATION AND REFUND POLICY`,
    `Organiser: ${organiser}`,
    `Event date: ${eventLong}`,
    "",
    ...clauses.flatMap((clause) => [clause.title, clause.body, ""]),
    `Refund requests: ${email}`,
  ]
    .join("\n")
    .trim();

  return {
    policyText,
    clauses,
    eventLong,
    tierCount: ladder.tiers.length,
    warning,
  };
}
