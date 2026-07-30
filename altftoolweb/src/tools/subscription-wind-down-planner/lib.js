/**
 * Subscription Wind-Down Planner.
 *
 * Digital-inheritance planning: turn a list of recurring subscriptions into an
 * ordered wind-down sheet an executor (or the person themselves, after a lost
 * card or a hospital stay) can actually work through.
 *
 * What the maths does:
 *  - Normalises every billing cycle to a comparable annual and monthly figure.
 *  - Projects the next renewal date from the last charge date using calendar
 *    month arithmetic with end-of-month clamping, the way card mandates behave
 *    (a 31st anchor charges on the 28th/29th in February and returns to the
 *    31st afterwards).
 *  - Counts how many charges land inside a chosen "nobody is watching" window
 *    and totals what that silently costs.
 *  - Sorts the list by urgency, cost and whether the account holds data that
 *    must be exported before the subscription is closed.
 *
 * Pure functions only. No DOM, no network, no clock — every date is an
 * argument, so the same input always gives the same output.
 */

/* ------------------------------------------------------------------ */
/* Billing cycles                                                      */
/* ------------------------------------------------------------------ */

/**
 * periodsPerYear follows normal billing convention: 52 weekly charges and 26
 * fortnightly charges a year (52 x 7 = 364 days), and exact calendar months
 * for everything monthly and longer.
 */
export const BILLING_CYCLES = [
  { id: "weekly", label: "Weekly", days: 7, months: 0, periodsPerYear: 52 },
  { id: "fortnightly", label: "Every 2 weeks", days: 14, months: 0, periodsPerYear: 26 },
  { id: "monthly", label: "Monthly", days: 0, months: 1, periodsPerYear: 12 },
  { id: "quarterly", label: "Quarterly", days: 0, months: 3, periodsPerYear: 4 },
  { id: "halfYearly", label: "Every 6 months", days: 0, months: 6, periodsPerYear: 2 },
  { id: "yearly", label: "Yearly", days: 0, months: 12, periodsPerYear: 1 },
  { id: "biennial", label: "Every 2 years", days: 0, months: 24, periodsPerYear: 0.5 },
];

export function getCycle(cycleId) {
  return BILLING_CYCLES.find((cycle) => cycle.id === cycleId) || null;
}

/* ------------------------------------------------------------------ */
/* Billing channels — where a subscription can actually be stopped      */
/* ------------------------------------------------------------------ */

/**
 * The channel matters more than the brand. A subscription bought inside an app
 * store is billed by the store, so the provider's own website has no cancel
 * button for it, and blocking the card does not end the agreement.
 */
export const BILLING_CHANNELS = [
  {
    id: "appleAppStore",
    label: "Apple App Store / iTunes",
    where:
      "Settings > Apple Account > Subscriptions on any signed-in Apple device, or reportaproblem.apple.com.",
    note:
      "Only the Apple Account holder can cancel. The app publisher cannot, and deleting the app does not stop billing.",
    needsAccountAccess: true,
  },
  {
    id: "googlePlay",
    label: "Google Play",
    where:
      "Play Store > profile picture > Payments and subscriptions > Subscriptions, or play.google.com/store/account/subscriptions.",
    note:
      "Billed by Google against the Google Account, not by the app publisher. Uninstalling the app does not cancel it.",
    needsAccountAccess: true,
  },
  {
    id: "directCard",
    label: "Card on the provider's own site",
    where: "Sign in to the provider's account settings and cancel there, then confirm by email.",
    note:
      "Ask the card issuer to withdraw the standing instruction afterwards so a re-issued card number does not revive the charge.",
    needsAccountAccess: true,
  },
  {
    id: "upiAutopay",
    label: "UPI AutoPay mandate",
    where:
      "In the UPI app: the Mandates / AutoPay section, where the mandate can be paused or revoked.",
    note:
      "Revoke the mandate in the UPI app and cancel in the provider account — the mandate can outlive the service agreement.",
    needsAccountAccess: false,
  },
  {
    id: "bankMandate",
    label: "Bank e-mandate / NACH",
    where: "Net banking > manage mandates (or the branch), plus the provider's own cancellation form.",
    note:
      "Banks send a pre-debit notification before an e-mandate debit; that notification is the paper trail an executor can follow.",
    needsAccountAccess: false,
  },
  {
    id: "carrier",
    label: "Mobile carrier billing",
    where: "The telecom operator's app or care line — it appears as a value-added service on the bill.",
    note: "Survives a change of handset; ends only when the operator removes the VAS.",
    needsAccountAccess: false,
  },
  {
    id: "invoice",
    label: "Invoice / bank transfer",
    where: "Written cancellation notice to the provider's billing address before the renewal date.",
    note: "Usually the easiest to stop: no auto-debit exists, so an unpaid invoice ends it.",
    needsAccountAccess: false,
  },
];

export function getChannel(channelId) {
  return BILLING_CHANNELS.find((channel) => channel.id === channelId) || BILLING_CHANNELS[2];
}

/**
 * Reserve Bank of India e-mandate framework: recurring card and UPI mandates
 * above this value need fresh authentication from the cardholder at every
 * debit, so higher-value mandates fail on their own once nobody can approve
 * them — lower-value ones keep going silently.
 */
export const RECURRING_MANDATE_AFA_LIMIT_INR = 15000;

/** Pre-debit notification window required before an e-mandate debit, in hours. */
export const PRE_DEBIT_NOTICE_HOURS = 24;

/* ------------------------------------------------------------------ */
/* Date helpers (UTC, so results never depend on the local timezone)   */
/* ------------------------------------------------------------------ */

const MS_PER_DAY = 86400000;

/** Parse "YYYY-MM-DD" into a UTC timestamp. Returns null if unusable. */
export function parseISODate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const stamp = Date.UTC(year, month - 1, day);
  const back = new Date(stamp);
  if (back.getUTCFullYear() !== year || back.getUTCMonth() !== month - 1 || back.getUTCDate() !== day) {
    return null;
  }
  return stamp;
}

/** Format a UTC timestamp back to "YYYY-MM-DD". */
export function toISODate(stamp) {
  const date = new Date(stamp);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

export function addDays(stamp, days) {
  return stamp + days * MS_PER_DAY;
}

/**
 * Add whole calendar months, clamping to the last day of the target month.
 * 2026-01-31 + 1 month = 2026-02-28, and + 2 months = 2026-03-31, because the
 * offset is always measured from the original anchor rather than from the
 * clamped result.
 */
export function addMonthsClamped(stamp, months) {
  const date = new Date(stamp);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const targetMonthIndex = month + months;
  const lastDayOfTarget = new Date(Date.UTC(year, targetMonthIndex + 1, 0)).getUTCDate();
  return Date.UTC(year, targetMonthIndex, Math.min(day, lastDayOfTarget));
}

/** Advance an anchor date by `count` whole billing periods. */
export function advance(anchorStamp, cycle, count) {
  if (cycle.months > 0) return addMonthsClamped(anchorStamp, cycle.months * count);
  return addDays(anchorStamp, cycle.days * count);
}

export function daysBetween(fromStamp, toStamp) {
  return Math.round((toStamp - fromStamp) / MS_PER_DAY);
}

/* ------------------------------------------------------------------ */
/* Per-subscription maths                                              */
/* ------------------------------------------------------------------ */

/** Annual and monthly-equivalent cost of one subscription. */
export function normaliseCost(amount, cycleId) {
  const cycle = getCycle(cycleId);
  if (!cycle) return { error: "Unknown billing cycle." };
  if (!Number.isFinite(amount) || amount < 0) {
    return { error: "Amount must be zero or more." };
  }
  const annual = amount * cycle.periodsPerYear;
  return { annual, monthly: annual / 12, periodsPerYear: cycle.periodsPerYear };
}

/** Hard stop so a stale anchor from decades ago cannot spin forever. */
const MAX_PERIODS_SCANNED = 4000;

/**
 * First charge date strictly after the reference date, projected from the last
 * charge date. If the last charge is in the future it is itself the next one.
 */
export function nextRenewal({ lastChargedISO, cycleId, referenceISO }) {
  const cycle = getCycle(cycleId);
  if (!cycle) return { error: "Unknown billing cycle." };
  const anchor = parseISODate(lastChargedISO);
  const reference = parseISODate(referenceISO);
  if (anchor === null) return { error: "Last charge date must be a real date (YYYY-MM-DD)." };
  if (reference === null) return { error: "Reference date must be a real date (YYYY-MM-DD)." };

  if (anchor > reference) {
    return { nextISO: toISODate(anchor), daysAway: daysBetween(reference, anchor), periodsAhead: 0 };
  }
  for (let count = 1; count <= MAX_PERIODS_SCANNED; count += 1) {
    const candidate = advance(anchor, cycle, count);
    if (candidate > reference) {
      return {
        nextISO: toISODate(candidate),
        daysAway: daysBetween(reference, candidate),
        periodsAhead: count,
      };
    }
  }
  return { error: "That last charge date is too far in the past to project from." };
}

/** Every charge falling in (reference, reference + windowMonths]. */
export function chargesInWindow({ lastChargedISO, cycleId, referenceISO, windowMonths }) {
  const cycle = getCycle(cycleId);
  if (!cycle) return { error: "Unknown billing cycle." };
  const anchor = parseISODate(lastChargedISO);
  const reference = parseISODate(referenceISO);
  if (anchor === null || reference === null) return { error: "Dates must be real dates (YYYY-MM-DD)." };
  if (!Number.isFinite(windowMonths) || windowMonths <= 0 || windowMonths > 120) {
    return { error: "The unattended window should be between 1 and 120 months." };
  }

  const windowEnd = addMonthsClamped(reference, Math.round(windowMonths));
  const dates = [];
  const startCount = anchor > reference ? 0 : 1;
  for (let count = startCount; count <= MAX_PERIODS_SCANNED; count += 1) {
    const candidate = count === 0 ? anchor : advance(anchor, cycle, count);
    if (candidate > windowEnd) break;
    if (candidate > reference) dates.push(toISODate(candidate));
  }
  return { count: dates.length, dates, windowEndISO: toISODate(windowEnd) };
}

/* ------------------------------------------------------------------ */
/* Priority                                                            */
/* ------------------------------------------------------------------ */

/** Sooner renewals cost money sooner, so they score higher. */
function urgencyPoints(daysAway) {
  if (daysAway <= 7) return 3;
  if (daysAway <= 30) return 2;
  if (daysAway <= 90) return 1;
  return 0;
}

/** Cost bands in the account currency; a yearly plan is judged on its annual total. */
function costPoints(annual) {
  if (annual >= 12000) return 3;
  if (annual >= 6000) return 2;
  if (annual >= 1500) return 1;
  return 0;
}

export const PRIORITY_BANDS = [
  { min: 6, label: "Do first", tone: "danger" },
  { min: 3, label: "Do this week", tone: "warning" },
  { min: 0, label: "Do when convenient", tone: "muted" },
];

export function priorityBand(score) {
  return PRIORITY_BANDS.find((band) => score >= band.min) || PRIORITY_BANDS[PRIORITY_BANDS.length - 1];
}

export const ACTIONS = {
  EXPORT_FIRST: {
    id: "EXPORT_FIRST",
    label: "Export data, then cancel",
    detail:
      "Closing this account destroys content the family may want. Download the archive first, move the domain or files elsewhere, then cancel.",
  },
  CANCEL: {
    id: "CANCEL",
    label: "Cancel",
    detail: "Nothing to salvage — stop the billing and keep the confirmation email.",
  },
};

/* ------------------------------------------------------------------ */
/* The plan                                                            */
/* ------------------------------------------------------------------ */

/**
 * Build the wind-down sheet.
 *
 * items: [{ id, name, amount, cycleId, channelId, lastChargedISO, holdsData }]
 */
export function planWindDown({ items, referenceISO, windowMonths }) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Add at least one subscription to plan." };
  }
  if (items.length > 100) {
    return { error: "Keep the list to 100 subscriptions or fewer." };
  }
  if (parseISODate(referenceISO) === null) {
    return { error: "Reference date must be a real date (YYYY-MM-DD)." };
  }
  const window = Number(windowMonths);
  if (!Number.isFinite(window) || window <= 0 || window > 120) {
    return { error: "The unattended window should be between 1 and 120 months." };
  }

  const rows = [];
  for (const item of items) {
    const name = String(item?.name || "").trim();
    if (!name) return { error: "Every subscription needs a name." };

    const amount = Number(item?.amount);
    const cost = normaliseCost(amount, item?.cycleId);
    if (cost.error) return { error: `${name}: ${cost.error}` };

    const next = nextRenewal({
      lastChargedISO: item?.lastChargedISO,
      cycleId: item?.cycleId,
      referenceISO,
    });
    if (next.error) return { error: `${name}: ${next.error}` };

    const window_ = chargesInWindow({
      lastChargedISO: item?.lastChargedISO,
      cycleId: item?.cycleId,
      referenceISO,
      windowMonths: window,
    });
    if (window_.error) return { error: `${name}: ${window_.error}` };

    const holdsData = Boolean(item?.holdsData);
    const score = urgencyPoints(next.daysAway) + costPoints(cost.annual) + (holdsData ? 2 : 0);
    const channel = getChannel(item?.channelId);

    rows.push({
      id: item?.id ?? name,
      name,
      amount,
      cycleId: item?.cycleId,
      cycleLabel: getCycle(item?.cycleId).label,
      annual: cost.annual,
      monthly: cost.monthly,
      nextISO: next.nextISO,
      daysAway: next.daysAway,
      chargesAhead: window_.count,
      windowCost: window_.count * amount,
      holdsData,
      action: holdsData ? ACTIONS.EXPORT_FIRST : ACTIONS.CANCEL,
      channel,
      needsAccountAccess: channel.needsAccountAccess,
      belowAfaLimit: amount <= RECURRING_MANDATE_AFA_LIMIT_INR,
      score,
      band: priorityBand(score),
    });
  }

  rows.sort((a, b) => b.score - a.score || a.daysAway - b.daysAway || b.annual - a.annual);

  const annualTotal = rows.reduce((sum, row) => sum + row.annual, 0);
  const windowTotal = rows.reduce((sum, row) => sum + row.windowCost, 0);
  const lockedBehindAccounts = rows.filter((row) => row.needsAccountAccess).length;
  const exportFirst = rows.filter((row) => row.holdsData).length;
  const dueInSevenDays = rows.filter((row) => row.daysAway <= 7).length;

  return {
    rows,
    annualTotal,
    monthlyTotal: annualTotal / 12,
    windowTotal,
    windowMonths: Math.round(window),
    windowEndISO: toISODate(addMonthsClamped(parseISODate(referenceISO), Math.round(window))),
    count: rows.length,
    lockedBehindAccounts,
    exportFirst,
    dueInSevenDays,
  };
}

/** Plain-text handover sheet an executor can print or paste into a will file. */
export function formatHandoverSheet(plan, { currency = "INR", referenceISO = "" } = {}) {
  if (!plan || plan.error) return "";
  const money = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);

  const lines = [
    "SUBSCRIPTION WIND-DOWN SHEET",
    `Prepared from: ${referenceISO || "today"}`,
    `Subscriptions listed: ${plan.count}`,
    `Committed cost per year: ${money(plan.annualTotal)}`,
    `Cost if nothing is cancelled for ${plan.windowMonths} months: ${money(plan.windowTotal)}`,
    "",
  ];
  plan.rows.forEach((row, index) => {
    lines.push(
      `${index + 1}. ${row.name} — ${row.band.label}`,
      `   ${money(row.amount)} ${row.cycleLabel.toLowerCase()} (${money(row.annual)}/year)`,
      `   Next charge: ${row.nextISO} (in ${row.daysAway} days)`,
      `   Cancel at: ${row.channel.label} — ${row.channel.where}`,
      `   Action: ${row.action.label}`,
      "",
    );
  });
  lines.push(
    "Notes for whoever works through this list:",
    "- Keep every cancellation confirmation email; it is the proof a charge should have stopped.",
    "- Store-billed subscriptions can only be cancelled inside that store account.",
    "- Blocking a card ends the payment, not the contract — arrears can still be claimed.",
  );
  return lines.join("\n");
}
