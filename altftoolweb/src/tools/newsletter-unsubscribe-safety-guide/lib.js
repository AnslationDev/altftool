/**
 * Newsletter unsubscribe safety guide.
 *
 * Decides whether clicking unsubscribe is safe for a given message, and works
 * out the date by which the sender is legally required to stop. Pure logic:
 * dates are passed in, never read from the clock.
 */

/**
 * Signals that a message is unsolicited rather than a list you joined.
 * Weights total 100 so a message carrying every signal scores exactly 100.
 * A comparison aid, not a probability.
 */
export const SPAM_SIGNALS = [
  {
    id: "neverSignedUp",
    label: "I never gave this sender my address",
    weight: 30,
    note: "The defining test. If you never opted in, the unsubscribe link is not an opt-out mechanism, it is a delivery confirmation.",
  },
  {
    id: "senderUnknown",
    label: "I do not recognise the brand or the person",
    weight: 20,
    note: "Unknown senders using a real brand's name is the standard shape of a phishing run.",
  },
  {
    id: "linkDomainMismatch",
    label: "The unsubscribe link points at a domain unrelated to the sender",
    weight: 20,
    note: "Legitimate bulk mail unsubscribes on the sender's own domain or its named email service provider. Hover the link and read the host before the first single slash.",
  },
  {
    id: "noListUnsubscribe",
    label: "My mail client shows no built-in unsubscribe button",
    weight: 10,
    note: "The button appears when the message carries a List-Unsubscribe header (RFC 2369). Bulk senders to Gmail and Yahoo have been required to include one-click unsubscribe since February 2024, so its absence is itself a signal.",
  },
  {
    id: "aliasMismatch",
    label: "It arrived at an alias I only ever gave to a different company",
    weight: 10,
    note: "Proof the address was sold, leaked or breached. The sender has no relationship with you to unsubscribe from.",
  },
  {
    id: "pressureLanguage",
    label: "Prize, refund, invoice or account-suspension language",
    weight: 10,
    note: "Urgency plus a link is the core of a phishing message; the unsubscribe link is often the payload.",
  },
];

/** What you can actually do about it. */
export const ACTIONS = {
  markSpam: {
    id: "markSpam",
    label: "Mark as spam — do not click anything",
    detail:
      "Reporting trains your provider's filter and never contacts the sender, so it leaks nothing. This is the only safe response to mail you never asked for.",
    steps: [
      "Do not click the unsubscribe link, and do not load remote images.",
      "Use your client's Report spam or Report phishing action, not just Delete — deleting teaches the filter nothing.",
      "Block the sender address and, if the same campaign keeps rotating addresses, add a filter on the sending domain.",
      "If the mail reached a per-service alias, disable that alias; the company it belonged to has leaked or sold your address.",
    ],
  },
  nativeOneClick: {
    id: "nativeOneClick",
    label: "Use your mail client's built-in unsubscribe button",
    detail:
      "The button comes from the List-Unsubscribe header. With RFC 8058 one-click, your provider sends a POST directly; no page loads in your browser, no tracking pixel fires and no session cookie is exposed.",
    steps: [
      "Click the unsubscribe control your client shows at the top of the message, not the link inside the body.",
      "Confirm if your client asks; the request goes provider to provider.",
      "Leave the message in place for a week so you can prove the date if mail keeps arriving.",
      "If a second message arrives after the deadline below, report it as spam rather than unsubscribing again.",
    ],
  },
  accountSettings: {
    id: "accountSettings",
    label: "Turn it off inside your account, not through the email",
    detail:
      "For a company you genuinely have an account with, the notification settings page is the most reliable and the least trackable route — you navigate there yourself, so no link in the message is ever clicked.",
    steps: [
      "Type the company's address into the browser yourself; never follow the link in the message.",
      "Sign in and open notification, communication or marketing preferences.",
      "Turn off the specific category rather than every message, so you keep security and order alerts.",
      "Save, then check that a marketing preference toggle exists at all — if not, use the built-in unsubscribe button instead.",
    ],
  },
  webUnsubscribe: {
    id: "webUnsubscribe",
    label: "Use the unsubscribe link, with precautions",
    detail:
      "Acceptable for a list you knowingly joined when no native button is offered. The link normally carries a unique identifier, so treat it as a page that already knows who you are.",
    steps: [
      "Hover the link first and read the host — everything up to the first single slash must belong to the sender or its named email provider.",
      "Turn off automatic remote image loading before you open the message, so no tracking pixel fires.",
      "Open the link and unsubscribe. Never enter a password, and never re-type your address on a page you reached from a link.",
      "If the page asks you to log in, close it and go to the site directly instead.",
    ],
  },
  filterAndBlock: {
    id: "filterAndBlock",
    label: "Filter it out and stop engaging",
    detail:
      "When mail keeps arriving after a valid unsubscribe, further clicks only confirm the address. Route it away and, if it matters, escalate to the regulator.",
    steps: [
      "Create a rule that files the sender straight to spam or trash.",
      "Keep one copy of the original message and the date you unsubscribed as evidence.",
      "Report continued mail to your national regulator, quoting the deadline that has passed.",
      "Retire the alias if the address was per-service, and replace it at the source account.",
    ],
  },
};

/** Verdict bands on the 0-100 unsolicited score. min is an inclusive lower bound. */
export const VERDICT_BANDS = [
  {
    min: 55,
    id: "unsolicited",
    label: "Treat as spam — clicking confirms your address",
    action: "markSpam",
  },
  {
    min: 25,
    id: "uncertain",
    label: "Unclear — use the safest available route",
    action: "nativeOneClick",
  },
  { min: 0, id: "legitimate", label: "A list you joined — unsubscribing is fine", action: "nativeOneClick" },
];

/**
 * Statutory and platform deadlines for a sender to stop mailing you.
 * `businessDays` counts Monday to Friday only; `calendarDays` counts every day.
 */
export const DEADLINE_RULES = [
  {
    id: "canspam",
    region: "United States",
    rule: "CAN-SPAM Act",
    businessDays: 10,
    calendarDays: 0,
    note: "Opt-outs must be honoured within 10 business days, and the unsubscribe mechanism must keep working for at least 30 days after the message was sent.",
  },
  {
    id: "casl",
    region: "Canada",
    rule: "CASL",
    businessDays: 10,
    calendarDays: 0,
    note: "The unsubscribe mechanism must be valid for 60 days after the message is sent, and withdrawal must be given effect within 10 business days.",
  },
  {
    id: "gdpr",
    region: "EU / UK",
    rule: "GDPR and PECR",
    businessDays: 0,
    calendarDays: 30,
    note: "Withdrawing consent must be as easy as giving it (GDPR Article 7(3)), and a rights request must be answered without undue delay and within one month (Article 12(3)).",
  },
  {
    id: "dpdp",
    region: "India",
    rule: "DPDP Act 2023",
    businessDays: 0,
    calendarDays: 30,
    note: "Consent can be withdrawn at any time and must be as easy to withdraw as to give; the fiduciary must then stop processing within a reasonable time.",
  },
  {
    id: "bulk",
    region: "Any — Gmail and Yahoo bulk senders",
    rule: "Bulk sender requirements",
    businessDays: 0,
    calendarDays: 2,
    note: "Since February 2024, senders of large volumes to Gmail or Yahoo must offer one-click unsubscribe and process it within two days, regardless of where they are based.",
  },
];

const MS_PER_DAY = 86400000;

/** Parse a YYYY-MM-DD string as a UTC date. Returns null when unparseable. */
export function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return date;
}

/** Format a UTC date back to YYYY-MM-DD. */
export function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

/** Add whole calendar days to a UTC date. */
export function addCalendarDays(date, days) {
  return new Date(date.getTime() + Math.trunc(days) * MS_PER_DAY);
}

/**
 * Add business days, counting Monday to Friday only. Public holidays vary by
 * country and are not applied, so a real deadline can fall slightly later.
 */
export function addBusinessDays(date, days) {
  let remaining = Math.max(0, Math.trunc(days));
  let cursor = new Date(date.getTime());
  while (remaining > 0) {
    cursor = addCalendarDays(cursor, 1);
    const weekday = cursor.getUTCDay();
    if (weekday !== 0 && weekday !== 6) remaining -= 1;
  }
  return cursor;
}

/** Deadline date for one rule, given the date you unsubscribed. */
export function deadlineFor(rule, startDate) {
  const base = rule.businessDays > 0 ? addBusinessDays(startDate, rule.businessDays) : startDate;
  return rule.calendarDays > 0 ? addCalendarDays(base, rule.calendarDays) : base;
}

/**
 * Whole days between two UTC dates, later minus earlier. Negative when the
 * deadline is already in the past relative to `today`.
 */
export function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/**
 * Main assessment.
 *
 * @param {{signals:Record<string,boolean>, hasAccount:boolean, hasNativeButton:boolean, unsubscribedOn:string, today:string}} input
 */
export function assessUnsubscribe(input = {}) {
  const signals = input.signals || {};
  const active = SPAM_SIGNALS.filter((signal) => Boolean(signals[signal.id]));
  const score = Math.min(100, active.reduce((sum, signal) => sum + signal.weight, 0));
  const band = VERDICT_BANDS.find((entry) => score >= entry.min) || VERDICT_BANDS[VERDICT_BANDS.length - 1];

  const hasAccount = Boolean(input.hasAccount);
  const hasNativeButton = Boolean(input.hasNativeButton);

  // Pick the concrete action: spam always wins; otherwise prefer the route that
  // never loads a page the sender controls.
  let actionId = band.action;
  if (band.id !== "unsolicited") {
    if (hasAccount) actionId = "accountSettings";
    else if (hasNativeButton) actionId = "nativeOneClick";
    else if (band.id === "uncertain") actionId = "markSpam";
    else actionId = "webUnsubscribe";
  }
  const action = ACTIONS[actionId];

  const warnings = [];
  if (signals.linkDomainMismatch) {
    warnings.push(
      "The link host does not match the sender. Read the address up to the first single slash — that is the real destination, whatever the visible text says.",
    );
  }
  if (signals.aliasMismatch) {
    warnings.push(
      "Retire the alias this arrived at and change it at the company you originally gave it to; the address is already circulating.",
    );
  }
  if (!hasNativeButton && band.id === "legitimate") {
    warnings.push(
      "No List-Unsubscribe header means no one-click route, so load the message with remote images off before you open the link.",
    );
  }
  if (band.id === "unsolicited") {
    warnings.push(
      "Never reply to unsolicited mail, even to ask for removal. A reply is the strongest possible confirmation that a human reads the address.",
    );
  }

  return {
    score,
    band,
    action,
    activeSignals: active,
    warnings,
    hasAccount,
    hasNativeButton,
  };
}

/**
 * Deadline table for a date you unsubscribed on, measured against a date you
 * supply as "today" so the function stays pure.
 */
export function buildDeadlines(unsubscribedOn, today) {
  const start = parseIsoDate(unsubscribedOn);
  if (!start) {
    return { error: "Enter the date you unsubscribed as a real calendar date." };
  }
  const now = parseIsoDate(today) || start;
  if (daysBetween(start, now) < 0) {
    return { error: "The unsubscribe date is in the future — check the date you entered." };
  }

  const rows = DEADLINE_RULES.map((rule) => {
    const due = deadlineFor(rule, start);
    const daysLeft = daysBetween(now, due);
    return {
      ...rule,
      due: toIsoDate(due),
      daysLeft,
      overdue: daysLeft < 0,
    };
  });

  return { start: toIsoDate(start), today: toIsoDate(now), rows, overdueCount: rows.filter((row) => row.overdue).length };
}

/** Plain-text summary of the guidance. */
export function formatGuidance(assessment, deadlines) {
  if (!assessment) return "";
  const lines = [
    "Unsubscribe safety check",
    `Unsolicited score: ${assessment.score}/100 — ${assessment.band.label}`,
    `Do this: ${assessment.action.label}`,
    "",
    ...assessment.action.steps.map((step, index) => `${index + 1}. ${step}`),
  ];
  if (assessment.warnings.length > 0) {
    lines.push("", "Watch out:");
    assessment.warnings.forEach((warning) => lines.push(`- ${warning}`));
  }
  if (deadlines && !deadlines.error) {
    lines.push("", `Unsubscribed on ${deadlines.start}. Mail should stop by:`);
    deadlines.rows.forEach((row) => {
      lines.push(`- ${row.region} (${row.rule}): ${row.due}${row.overdue ? " — already overdue" : ""}`);
    });
  }
  return lines.join("\n");
}
