/**
 * Legal notice dispatch tracker — pure logic.
 *
 * Tracks how each notice went out, when it was (or is deemed to have been)
 * served, and what date the next step falls due. Statutory periods are cited
 * against the provision they come from; transit estimates are explicitly
 * assumptions, not law. Informational only — not legal advice.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Section 27 of the General Clauses Act, 1897: service by post is deemed
 * effected by properly addressing, prepaying and posting a registered letter,
 * and unless the contrary is proved, at the time the letter would be delivered
 * in the ordinary course of post. The transit figures below are working
 * assumptions for planning only — a delivery date from the tracking record
 * always overrides them.
 */
export const DEEMED_SERVICE_STATUTE = "Section 27, General Clauses Act, 1897";

export const DISPATCH_MODES = [
  {
    id: "registered-ad",
    label: "Registered post with acknowledgement due",
    assumedTransitDays: 7,
    proof: "AD card signed by the recipient",
    strongest: true,
  },
  {
    id: "speed-post",
    label: "Speed post",
    assumedTransitDays: 5,
    proof: "India Post tracking record and delivery confirmation",
    strongest: true,
  },
  {
    id: "courier",
    label: "Private courier",
    assumedTransitDays: 5,
    proof: "Courier POD (proof of delivery) slip",
    strongest: false,
  },
  {
    id: "email",
    label: "Email",
    assumedTransitDays: 0,
    proof: "Sent-items copy with the delivery or read receipt",
    strongest: false,
  },
  {
    id: "whatsapp",
    label: "WhatsApp or messaging app",
    assumedTransitDays: 0,
    proof: "Screenshot showing double blue ticks and the timestamp",
    strongest: false,
  },
  {
    id: "hand",
    label: "Hand delivery",
    assumedTransitDays: 0,
    proof: "Signed and dated receipt on the office copy",
    strongest: false,
  },
];

/**
 * Notice types and the periods attached to them.
 *
 * Cheque dishonour: under the proviso to Section 138 of the Negotiable
 * Instruments Act, 1881 the demand notice must be sent within 30 days of the
 * bank's return memo, the drawer has 15 days from receipt to pay, and a
 * complaint must be filed within one month of that 15-day period expiring.
 *
 * Government notice: Section 80 of the Code of Civil Procedure, 1908 requires
 * two months' notice before suing the government or a public officer.
 *
 * Consumer: Section 69 of the Consumer Protection Act, 2019 sets a two-year
 * limitation period from the date of the cause of action.
 */
export const NOTICE_TYPES = [
  {
    id: "general",
    label: "General civil or contractual notice",
    defaultReplyDays: 15,
    fixedReplyDays: false,
    statute: "",
    note: "The reply period is whatever the notice itself specifies — 15 or 30 days is customary.",
  },
  {
    id: "cheque",
    label: "Cheque dishonour demand (s.138 NI Act)",
    defaultReplyDays: 15,
    fixedReplyDays: true,
    complaintWindowDays: 30,
    statute: "Section 138, Negotiable Instruments Act, 1881",
    note: "The drawer gets 15 days from receipt of the notice to pay. A complaint must then be filed within one month of that period expiring.",
  },
  {
    id: "government",
    label: "Notice to government or public officer (s.80 CPC)",
    defaultReplyDays: 60,
    fixedReplyDays: true,
    statute: "Section 80, Code of Civil Procedure, 1908",
    note: "No suit may be instituted until two months have expired from delivery of the notice.",
  },
  {
    id: "eviction",
    label: "Eviction or tenancy notice",
    defaultReplyDays: 30,
    fixedReplyDays: false,
    statute: "",
    note: "The notice period comes from the tenancy agreement and the applicable state rent legislation.",
  },
  {
    id: "employment",
    label: "Employment or dues recovery notice",
    defaultReplyDays: 15,
    fixedReplyDays: false,
    statute: "",
    note: "Set the reply period the notice itself states, and keep the salary or invoice records with it.",
  },
  {
    id: "consumer",
    label: "Pre-complaint consumer notice",
    defaultReplyDays: 15,
    fixedReplyDays: false,
    limitationYears: 2,
    statute: "Consumer Protection Act, 2019",
    note: "A consumer complaint has to be filed within two years of the cause of action, so do not let the notice stage eat that period.",
  },
];

/** Where a notice has got to. The first four are computed; the last two are set by you. */
export const NOTICE_STATUSES = [
  { id: "auto", label: "Track automatically" },
  { id: "replied", label: "Reply received" },
  { id: "settled", label: "Settled / withdrawn" },
  { id: "filed", label: "Case filed" },
];

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);
const clean = (value) => (typeof value === "string" ? value.trim() : "");

/** Parse "YYYY-MM-DD" into a UTC Date, or null when it is not a real date. */
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

export function toISODate(date) {
  return date instanceof Date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : "";
}

export function addDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function addYears(date, years) {
  const target = new Date(Date.UTC(date.getUTCFullYear() + years, date.getUTCMonth(), 1));
  const daysInTarget = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(date.getUTCDate(), daysInTarget)),
  );
}

export function daysBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

/** "12 Aug 2026". */
export function formatShortDate(value) {
  const date = value instanceof Date ? value : parseISODate(value);
  if (!date || Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Work out the state of one notice.
 *
 * @param {object} notice One row from the board. `causeOfActionDate`
 *   ("YYYY-MM-DD") is optional and, when supplied, anchors a consumer
 *   notice's two-year limitation period instead of the dispatch date.
 * @param {Date} today    The date to evaluate against.
 * @returns {object} the row with computed fields, or with an `error` string.
 */
function evaluateNotice(notice, today) {
  const recipient = clean(notice.recipient) || "Unnamed recipient";
  const type = NOTICE_TYPES.find((entry) => entry.id === notice.noticeType) || NOTICE_TYPES[0];
  const mode = DISPATCH_MODES.find((entry) => entry.id === notice.mode) || DISPATCH_MODES[0];

  const dispatch = parseISODate(notice.dispatchDate);
  if (!dispatch) {
    return { ...notice, recipient, type, mode, error: "Enter a real dispatch date for this notice." };
  }

  const replyDays = type.fixedReplyDays
    ? type.defaultReplyDays
    : isNumber(notice.replyDays)
      ? Math.round(notice.replyDays)
      : type.defaultReplyDays;

  if (replyDays < 0 || replyDays > 365) {
    return { ...notice, recipient, type, mode, error: "The reply period must be between 0 and 365 days." };
  }

  const delivered = parseISODate(notice.deliveryDate);
  if (delivered && delivered.getTime() < dispatch.getTime()) {
    return {
      ...notice,
      recipient,
      type,
      mode,
      error: "The delivery date cannot be earlier than the dispatch date.",
    };
  }

  const servedOn = delivered || addDays(dispatch, mode.assumedTransitDays);
  const servedBasis = delivered ? "actual" : "assumed";
  const replyDeadline = addDays(servedOn, replyDays);
  const daysToDeadline = daysBetween(today, replyDeadline);

  let complaintWindow = null;
  if (type.complaintWindowDays) {
    const opens = addDays(replyDeadline, 1);
    const closes = addDays(replyDeadline, type.complaintWindowDays);
    complaintWindow = {
      opens: toISODate(opens),
      closes: toISODate(closes),
      daysToClose: daysBetween(today, closes),
    };
  }

  let limitation = null;
  if (type.limitationYears) {
    // Section 69 of the Consumer Protection Act, 2019 runs the two-year
    // limitation from the date the cause of action arose, not from the date
    // the pre-complaint notice was dispatched. Use the cause-of-action date
    // when the user has entered one; only fall back to the dispatch date
    // (which understates how much of the period has already run) when it is
    // not available.
    const causeOfAction = parseISODate(notice.causeOfActionDate);
    const anchor = causeOfAction || dispatch;
    const expires = addYears(anchor, type.limitationYears);
    limitation = {
      expires: toISODate(expires),
      daysLeft: daysBetween(today, expires),
      anchorDate: toISODate(anchor),
      anchorBasis: causeOfAction ? "cause-of-action" : "dispatch-date-fallback",
    };
  }

  let status = clean(notice.status) || "auto";
  if (status === "auto") {
    if (today.getTime() < dispatch.getTime()) status = "not-dispatched";
    else if (!delivered && today.getTime() < servedOn.getTime()) status = "in-transit";
    else if (today.getTime() <= replyDeadline.getTime()) status = "awaiting-reply";
    else status = "overdue";
  }

  const issues = [];
  if (!clean(notice.trackingId) && mode.id !== "hand") {
    issues.push("No tracking or receipt reference recorded.");
  }
  if (!delivered && daysBetween(dispatch, today) > mode.assumedTransitDays + 14) {
    issues.push("No delivery date after more than two weeks — check the tracking record.");
  }
  if (!mode.strongest && type.id === "cheque") {
    issues.push(
      "A s.138 demand notice is safest by registered post with acknowledgement due; courier and messaging proof is contested more often.",
    );
  }
  if (limitation && limitation.daysLeft < 90) {
    issues.push(`Only ${limitation.daysLeft} days left of the two-year limitation period.`);
  }
  if (limitation && limitation.anchorBasis === "dispatch-date-fallback") {
    issues.push(
      "No cause-of-action date entered — the limitation expiry is estimated from the dispatch date, which may overstate how much time is left.",
    );
  }

  return {
    ...notice,
    recipient,
    type,
    mode,
    replyDays,
    dispatchDate: toISODate(dispatch),
    deliveryDate: delivered ? toISODate(delivered) : "",
    servedOn: toISODate(servedOn),
    servedBasis,
    replyDeadline: toISODate(replyDeadline),
    daysToDeadline,
    complaintWindow,
    limitation,
    status,
    issues,
  };
}

/**
 * Evaluate a whole board of notices.
 *
 * @param {object} input
 * @param {object[]} input.notices Rows from the board.
 * @param {string} input.today     Date to evaluate against, "YYYY-MM-DD".
 * @returns {object} board summary, or { error } for invalid input.
 */
export function trackNotices(input) {
  const { notices, today } = input || {};
  if (!Array.isArray(notices)) return { error: "The notice list could not be read." };

  const now = parseISODate(today);
  if (!now) return { error: "Enter today's date as a real calendar date." };

  if (notices.length === 0) {
    return {
      rows: [],
      total: 0,
      counts: { "not-dispatched": 0, "in-transit": 0, "awaiting-reply": 0, overdue: 0, replied: 0, settled: 0, filed: 0 },
      overdueCount: 0,
      openCount: 0,
      nextDeadline: null,
      issueCount: 0,
      empty: true,
    };
  }

  const rows = notices.map((notice) => evaluateNotice(notice, now));
  const valid = rows.filter((row) => !row.error);

  const counts = {
    "not-dispatched": 0,
    "in-transit": 0,
    "awaiting-reply": 0,
    overdue: 0,
    replied: 0,
    settled: 0,
    filed: 0,
  };
  valid.forEach((row) => {
    if (counts[row.status] !== undefined) counts[row.status] += 1;
  });

  const openRows = valid.filter((row) => ["not-dispatched", "in-transit", "awaiting-reply", "overdue"].includes(row.status));
  const upcoming = openRows
    .filter((row) => row.daysToDeadline >= 0)
    .sort((a, b) => a.daysToDeadline - b.daysToDeadline);

  return {
    rows,
    total: rows.length,
    invalidCount: rows.length - valid.length,
    counts,
    overdueCount: counts.overdue,
    openCount: openRows.length,
    nextDeadline: upcoming.length > 0 ? upcoming[0] : null,
    issueCount: valid.reduce((sum, row) => sum + row.issues.length, 0),
    empty: false,
  };
}
