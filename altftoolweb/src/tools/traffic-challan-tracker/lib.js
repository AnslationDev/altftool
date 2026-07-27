/**
 * Traffic challan tracking and budgeting.
 *
 * Penalty amounts are the central figures set by the Motor Vehicles (Amendment)
 * Act, 2019, with the section noted against each entry. State governments are
 * free to notify their own amounts under the same sections, and several have
 * reduced them, so treat the catalogue as a starting point and overwrite the
 * amount with what your challan actually says.
 *
 * Notice timing: Rule 167A of the Central Motor Vehicles Rules, 1989 requires an
 * electronically detected offence to be notified within fifteen days of the
 * offence. How long an unpaid challan stays out of court before it is referred on
 * is set by each state, so the escalation window here is an input.
 */

const MS_PER_DAY = 86400000;

/** Rule 167A, CMVR 1989 — notice for an electronically detected offence. */
export const NOTICE_WINDOW_DAYS = 15;

/** Default window before a state typically refers an unpaid challan onward. */
export const DEFAULT_ESCALATION_DAYS = 60;

/**
 * Common offences with the central penalty from the 2019 amendment.
 * `min` and `max` are the same where the Act fixes a single amount.
 */
export const OFFENCE_CATALOGUE = [
  { id: "general", label: "General offence, first time", section: "s.177", min: 500, max: 500 },
  { id: "general-repeat", label: "General offence, repeat", section: "s.177", min: 1500, max: 1500 },
  { id: "road-rules", label: "Breach of road regulations", section: "s.177A", min: 500, max: 1000 },
  { id: "disobedience", label: "Disobeying an order of an authority", section: "s.179", min: 2000, max: 2000 },
  { id: "no-licence", label: "Driving without a valid licence", section: "s.181", min: 5000, max: 5000 },
  { id: "disqualified", label: "Driving while disqualified", section: "s.182", min: 10000, max: 10000 },
  { id: "speeding-lmv", label: "Over-speeding, light motor vehicle", section: "s.183", min: 1000, max: 2000 },
  { id: "speeding-hmv", label: "Over-speeding, medium or heavy vehicle", section: "s.183", min: 2000, max: 4000 },
  { id: "dangerous", label: "Dangerous driving, including phone use and red-light jumping", section: "s.184", min: 1000, max: 5000 },
  { id: "drunk", label: "Drink driving, first offence", section: "s.185", min: 10000, max: 10000 },
  { id: "drunk-repeat", label: "Drink driving, repeat offence", section: "s.185", min: 15000, max: 15000 },
  { id: "racing", label: "Racing or speed testing", section: "s.189", min: 5000, max: 5000 },
  { id: "no-puc", label: "No valid PUC certificate", section: "s.190(2)", min: 10000, max: 10000 },
  { id: "no-permit", label: "Driving without a permit", section: "s.192A", min: 10000, max: 10000 },
  { id: "overload", label: "Overloading a goods vehicle", section: "s.194", min: 20000, max: 20000 },
  { id: "seatbelt", label: "Not wearing a seat belt", section: "s.194B", min: 1000, max: 1000 },
  { id: "pillion", label: "Extra pillion rider on a two-wheeler", section: "s.194C", min: 2000, max: 2000 },
  { id: "helmet", label: "Riding without a helmet", section: "s.194D", min: 1000, max: 1000 },
  { id: "emergency", label: "Not giving way to an emergency vehicle", section: "s.194E", min: 10000, max: 10000 },
  { id: "no-insurance", label: "Driving without insurance, first offence", section: "s.196", min: 2000, max: 2000 },
  { id: "no-insurance-repeat", label: "Driving without insurance, repeat", section: "s.196", min: 4000, max: 4000 },
  { id: "juvenile", label: "Offence by a minor, guardian liable", section: "s.199A", min: 25000, max: 25000 },
  { id: "other", label: "Something else — enter the amount", section: "—", min: 0, max: 0 },
];

const offenceById = new Map(OFFENCE_CATALOGUE.map((item) => [item.id, item]));

export function parseDate(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const stamp = Date.UTC(year, month - 1, day);
  const probe = new Date(stamp);
  if (probe.getUTCFullYear() !== year) return NaN;
  if (probe.getUTCMonth() !== month - 1) return NaN;
  if (probe.getUTCDate() !== day) return NaN;
  return stamp;
}

export function toIsoDate(stamp) {
  if (!Number.isFinite(stamp)) return "";
  return new Date(stamp).toISOString().slice(0, 10);
}

export function daysBetween(from, to) {
  const a = parseDate(from);
  const b = parseDate(to);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return NaN;
  return Math.round((b - a) / MS_PER_DAY);
}

export function addDays(isoDate, days) {
  const stamp = parseDate(isoDate);
  if (!Number.isFinite(stamp) || !Number.isFinite(days)) return "";
  return toIsoDate(stamp + Math.trunc(days) * MS_PER_DAY);
}

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/** Score one challan against the reference date. */
export function evaluateChallan(entry, today, escalationDays = DEFAULT_ESCALATION_DAYS) {
  if (!entry || typeof entry !== "object") return { error: "A challan entry is missing." };
  const offence = offenceById.get(entry.offenceId);
  if (!offence) return { error: "Choose an offence from the list." };
  if (!Number.isFinite(parseDate(today))) {
    return { error: "Reference date must be a real calendar date." };
  }
  if (!Number.isFinite(parseDate(entry.issuedOn))) {
    return { error: "Every challan needs a valid issue date." };
  }
  if (typeof entry.amount !== "number" || !Number.isFinite(entry.amount)) {
    return { error: "Every challan needs a numeric amount." };
  }
  if (entry.amount < 0) return { error: "A challan amount cannot be negative." };
  if (daysBetween(today, entry.issuedOn) > 0) {
    return { error: "A challan cannot be issued in the future." };
  }

  const age = daysBetween(entry.issuedOn, today);
  const payBy = addDays(entry.issuedOn, Math.trunc(escalationDays));
  const daysLeft = daysBetween(today, payBy);
  const paid = Boolean(entry.paid);

  let status = "open";
  let statusLabel = "Open";
  if (paid) {
    status = "paid";
    statusLabel = "Paid";
  } else if (daysLeft < 0) {
    status = "overdue";
    statusLabel = "Past the window";
  } else if (daysLeft <= 7) {
    status = "urgent";
    statusLabel = "Pay this week";
  }

  return {
    id: entry.id,
    offenceId: offence.id,
    offenceLabel: offence.label,
    section: offence.section,
    statutoryRange:
      offence.max > 0
        ? offence.min === offence.max
          ? `${offence.min}`
          : `${offence.min}–${offence.max}`
        : "not fixed",
    challanNo: entry.challanNo || "",
    vehicle: entry.vehicle || "",
    issuedOn: entry.issuedOn,
    ageDays: age,
    payBy,
    daysLeft,
    amount: round2(entry.amount),
    paid,
    status,
    statusLabel,
    aboveCatalogue: offence.max > 0 && entry.amount > offence.max,
  };
}

/**
 * Score a whole list and budget the pending amount.
 *
 * @param {Array} challans
 * @param {string} today "YYYY-MM-DD"
 * @param {object} [options]
 * @param {number} [options.escalationDays]
 * @param {number} [options.monthlyBudget]
 */
export function evaluateChallans(challans, today, options = {}) {
  const { escalationDays = DEFAULT_ESCALATION_DAYS, monthlyBudget = 0 } = options;
  if (!Array.isArray(challans)) return { error: "Challan list is missing." };
  if (challans.length === 0) return { error: "Add a challan to start tracking." };
  if (!Number.isFinite(escalationDays) || escalationDays < 1 || escalationDays > 365) {
    return { error: "The payment window should be between 1 and 365 days." };
  }
  if (!Number.isFinite(monthlyBudget) || monthlyBudget < 0) {
    return { error: "Monthly budget cannot be negative." };
  }

  const items = [];
  for (const entry of challans) {
    const scored = evaluateChallan(entry, today, escalationDays);
    if (scored.error) return { error: scored.error };
    items.push(scored);
  }

  items.sort((a, b) => {
    if (a.paid !== b.paid) return a.paid ? 1 : -1;
    return a.daysLeft - b.daysLeft;
  });

  const pendingItems = items.filter((item) => !item.paid);
  const pendingTotal = pendingItems.reduce((sum, item) => sum + item.amount, 0);
  const paidTotal = items
    .filter((item) => item.paid)
    .reduce((sum, item) => sum + item.amount, 0);
  const overdueItems = pendingItems.filter((item) => item.status === "overdue");
  const overdueTotal = overdueItems.reduce((sum, item) => sum + item.amount, 0);

  const monthsToClear =
    monthlyBudget > 0 && pendingTotal > 0 ? Math.ceil(pendingTotal / monthlyBudget) : 0;

  const byVehicle = new Map();
  for (const item of pendingItems) {
    const key = item.vehicle || "Unassigned";
    byVehicle.set(key, round2((byVehicle.get(key) || 0) + item.amount));
  }

  return {
    items,
    total: items.length,
    pendingCount: pendingItems.length,
    pendingTotal: round2(pendingTotal),
    paidTotal: round2(paidTotal),
    overdueCount: overdueItems.length,
    overdueTotal: round2(overdueTotal),
    escalationDays,
    monthlyBudget: round2(monthlyBudget),
    monthsToClear,
    nextDue: pendingItems[0] || null,
    byVehicle: [...byVehicle.entries()].map(([vehicle, amount]) => ({ vehicle, amount })),
  };
}
