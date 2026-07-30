/**
 * Old Account Deletion Tracker — deadline maths and progress scoring for erasure requests.
 *
 * Response deadlines encoded
 * --------------------------
 * - GDPR / UK GDPR: Article 12(3) requires the controller to inform the data subject of
 *   the action taken without undue delay and in any event within one month of receipt.
 *   That period may be extended by two further months where the request is complex, and
 *   the controller must tell you within the first month if it is extending. "One month"
 *   is a calendar month, so 15 January runs to 15 February, and a date that does not
 *   exist in the next month rolls back to that month's last day.
 * - CCPA / CPRA: a business must respond to a verifiable consumer request within 45
 *   days of receipt, extendable by a further 45 days with notice.
 * - India's DPDP Act: erasure is a data-principal right and every Data Fiduciary must
 *   publish a grievance mechanism and respond within the prescribed period. Because the
 *   published period varies by fiduciary, this tracker uses a 30-day follow-up prompt
 *   and labels it as a prompt, not a statutory limit.
 * - No specific law: a 30-day follow-up prompt, again non-statutory.
 *
 * All date maths takes `today` as an argument; nothing reads the clock.
 */

const MS_PER_DAY = 86400000;

/** Rows a single tracker can hold. */
export const MAX_ACCOUNTS = 60;

export const REGIMES = [
  {
    id: "gdpr",
    label: "GDPR / UK GDPR (EU, EEA, UK)",
    responseMonths: 1,
    extensionMonths: 2,
    statutory: true,
    escalateTo: "your data protection supervisory authority",
    note: "One calendar month to respond, extendable by two months for complex requests, with notice inside the first month.",
  },
  {
    id: "ccpa",
    label: "CCPA / CPRA (California)",
    responseDays: 45,
    extensionDays: 45,
    statutory: true,
    escalateTo: "the California Privacy Protection Agency or the Attorney General",
    note: "45 days to respond to a verifiable consumer request, extendable by a further 45 days with notice.",
  },
  {
    id: "dpdp",
    label: "DPDP Act (India)",
    responseDays: 30,
    statutory: false,
    escalateTo: "the Data Protection Board, after the company's own grievance process",
    note: "Erasure is a data-principal right; the response window is the one the company publishes in its grievance mechanism. 30 days is used here as a follow-up prompt.",
  },
  {
    id: "none",
    label: "No specific privacy law / unsure",
    responseDays: 30,
    statutory: false,
    escalateTo: "the company's published complaints process",
    note: "No statutory clock. 30 days is a practical follow-up prompt before you chase again.",
  },
];

export const SENSITIVITIES = [
  { id: "low", label: "Low — email address and a username only", weight: 1 },
  { id: "medium", label: "Medium — address, phone, order or message history", weight: 3 },
  { id: "high", label: "High — ID documents, payment details, health or location data", weight: 5 },
];

export const STATUSES = [
  { id: "not-requested", label: "Found, not yet requested" },
  { id: "requested", label: "Deletion requested" },
  { id: "acknowledged", label: "Acknowledged by the company" },
  { id: "refused", label: "Refused or ignored" },
  { id: "deleted", label: "Deletion confirmed" },
];

export const PROGRESS_BANDS = [
  { min: 100, label: "Cleared", note: "Every account in the list is confirmed deleted." },
  { min: 70, label: "Nearly there", note: "Most accounts are closed. Chase the stragglers that are past their deadline." },
  { min: 30, label: "In progress", note: "Keep sending requests and record a reference for each reply." },
  { min: 0, label: "Just started", note: "Send the requests for the highest-sensitivity accounts first." },
];

function parseDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const [y, m, d] = value.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return NaN;
  const ts = Date.UTC(y, m - 1, d);
  const back = new Date(ts);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) {
    return NaN;
  }
  return ts;
}

function toIso(ts) {
  return new Date(ts).toISOString().slice(0, 10);
}

/** Add calendar months, rolling an impossible date back to the last day of the month. */
export function addMonths(ts, months) {
  const d = new Date(ts);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + months;
  const day = d.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Date.UTC(year, month, Math.min(day, lastDay));
}

function addDays(ts, days) {
  return ts + days * MS_PER_DAY;
}

/** Deadline for a regime, given the request date. */
function deadlineFor(regime, requestedTs, extended) {
  if (regime.responseMonths) {
    const months = regime.responseMonths + (extended ? regime.extensionMonths ?? 0 : 0);
    return addMonths(requestedTs, months);
  }
  const days = regime.responseDays + (extended ? regime.extensionDays ?? 0 : 0);
  return addDays(requestedTs, days);
}

function bandFor(percent) {
  return PROGRESS_BANDS.find((band) => percent >= band.min) ?? PROGRESS_BANDS[PROGRESS_BANDS.length - 1];
}

/**
 * Build the tracker.
 * @param {{accounts: Array<{id,service,regime,sensitivity,status,requestedOn,proof}>, today:string}} input
 */
export function buildTracker({ accounts, today } = {}) {
  if (!Array.isArray(accounts)) return { error: "The tracker needs a list of accounts." };
  if (accounts.length === 0) return { error: "Add at least one account to track." };
  if (accounts.length > MAX_ACCOUNTS) {
    return { error: `This tracker holds up to ${MAX_ACCOUNTS} accounts at a time.` };
  }

  const now = parseDate(today);
  if (Number.isNaN(now)) return { error: "Today's date must be a valid calendar date." };

  const rows = [];
  for (const account of accounts) {
    const service = String(account.service ?? "").trim();
    if (!service) return { error: "Give every row a service name." };

    const regime = REGIMES.find((option) => option.id === account.regime);
    if (!regime) return { error: `Choose which privacy law applies for "${service}".` };

    const sensitivity = SENSITIVITIES.find((option) => option.id === account.sensitivity);
    if (!sensitivity) return { error: `Choose a data sensitivity for "${service}".` };

    const status = STATUSES.find((option) => option.id === account.status);
    if (!status) return { error: `Choose a status for "${service}".` };

    const needsDate = status.id !== "not-requested";
    let requestedTs = null;
    if (needsDate) {
      requestedTs = parseDate(account.requestedOn);
      if (Number.isNaN(requestedTs)) {
        return { error: `Enter the date you sent the request for "${service}".` };
      }
      if (requestedTs > now) {
        return { error: `The request for "${service}" cannot be dated in the future.` };
      }
    }

    const proof = String(account.proof ?? "").trim();
    let dueOn = null;
    let extendedDueOn = null;
    let daysLeft = null;
    let state;
    let nextAction;

    if (status.id === "deleted") {
      state = proof ? "closed" : "unverified";
      nextAction = proof
        ? "Nothing further — keep the confirmation reference."
        : "Ask for a written confirmation and record the reference before you close this row.";
    } else if (status.id === "not-requested") {
      state = "to-send";
      nextAction = "Send the deletion request and note the date you sent it.";
    } else if (status.id === "refused") {
      state = "escalate";
      nextAction = `Ask for the reason in writing, then escalate to ${regime.escalateTo}.`;
    } else {
      dueOn = deadlineFor(regime, requestedTs, false);
      extendedDueOn = deadlineFor(regime, requestedTs, true);
      daysLeft = Math.round((dueOn - now) / MS_PER_DAY);
      if (daysLeft < 0) {
        state = "overdue";
        nextAction = regime.statutory
          ? `The response deadline has passed — send a follow-up and escalate to ${regime.escalateTo}.`
          : `No reply within the follow-up window — chase in writing, then escalate to ${regime.escalateTo}.`;
      } else {
        state = "waiting";
        nextAction = `Wait for the reply; the response window ends on ${toIso(dueOn)}.`;
      }
    }

    rows.push({
      id: account.id,
      service,
      regime: regime.id,
      regimeLabel: regime.label,
      regimeNote: regime.note,
      statutory: regime.statutory,
      sensitivity: sensitivity.id,
      sensitivityLabel: sensitivity.label,
      weight: sensitivity.weight,
      status: status.id,
      statusLabel: status.label,
      requestedOn: requestedTs === null ? null : toIso(requestedTs),
      dueOn: dueOn === null ? null : toIso(dueOn),
      extendedDueOn: extendedDueOn === null ? null : toIso(extendedDueOn),
      daysLeft,
      state,
      nextAction,
      proof,
    });
  }

  const total = rows.length;
  const closed = rows.filter((row) => row.state === "closed").length;
  const percentComplete = total > 0 ? (closed / total) * 100 : 0;

  const totalWeight = rows.reduce((sum, row) => sum + row.weight, 0);
  const openWeight = rows
    .filter((row) => row.state !== "closed")
    .reduce((sum, row) => sum + row.weight, 0);

  const order = { overdue: 0, escalate: 1, "to-send": 2, unverified: 3, waiting: 4, closed: 5 };
  const sorted = [...rows].sort((a, b) => {
    if (order[a.state] !== order[b.state]) return order[a.state] - order[b.state];
    if (b.weight !== a.weight) return b.weight - a.weight;
    return a.service.localeCompare(b.service);
  });

  return {
    rows: sorted,
    total,
    closed,
    toSend: rows.filter((row) => row.state === "to-send").length,
    waiting: rows.filter((row) => row.state === "waiting").length,
    overdue: rows.filter((row) => row.state === "overdue").length,
    escalate: rows.filter((row) => row.state === "escalate").length,
    unverified: rows.filter((row) => row.state === "unverified").length,
    percentComplete,
    band: bandFor(percentComplete),
    totalWeight,
    openWeight,
    exposurePercent: totalWeight > 0 ? (openWeight / totalWeight) * 100 : 0,
    actionQueue: sorted.filter((row) => row.state !== "closed" && row.state !== "waiting"),
  };
}
