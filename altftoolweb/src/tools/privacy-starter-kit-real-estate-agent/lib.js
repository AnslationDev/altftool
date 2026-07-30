/**
 * Real Estate Agent Privacy Kit — a retention register for client KYC documents.
 *
 * Rules encoded
 * -------------
 * 1. PMLA record keeping. Real estate agents above the notified turnover threshold are
 *    "persons carrying on designated business or profession" under the Prevention of
 *    Money-Laundering Act, and a reporting entity must preserve records of transactions
 *    and of client identity for five years (PMLA section 12 read with the Maintenance of
 *    Records Rules). So documents tied to a completed transaction have a real statutory
 *    keep-until date rather than being deletable at will.
 * 2. Purpose limitation. Where no statutory duty applies — a buyer who walked away, a
 *    tenant who was not selected — the lawful basis ends with the purpose. India's DPDP
 *    Act requires erasure once the purpose is no longer being served, unless retention
 *    is required by law. This register applies a short practical grace period and then
 *    marks the document for deletion.
 * 3. Aadhaar. UIDAI's guidance is that an unmasked Aadhaar copy should not be collected
 *    or stored by unlicensed private entities; a masked Aadhaar or an offline
 *    verification document is the acceptable substitute. Full-number copies are always
 *    flagged as "should not hold", whatever the deal outcome.
 *
 * Everything here is pure: pass `today` in, no clock is read inside the maths.
 */

/** PMLA record-retention period, in years, for a reporting entity. */
export const PMLA_RETENTION_YEARS = 5;

/** Turnover from which a real estate agent is a notified reporting entity under PMLA (INR). */
export const PMLA_AGENT_TURNOVER_THRESHOLD_INR = 2000000;

/** Practical grace period before deleting documents with no statutory duty. Not statutory. */
export const PURPOSE_GRACE_DAYS = 30;

/** A keep-until date inside this window is flagged as "due soon". */
export const DUE_SOON_DAYS = 90;

/** Register can hold at most this many rows. */
export const MAX_ITEMS = 60;

export const OUTCOMES = [
  { id: "closed", label: "Deal completed" },
  { id: "in-progress", label: "Deal still in progress" },
  { id: "not-proceeded", label: "Enquiry did not proceed" },
];

/**
 * sensitivity: 1-5, how much harm a leaked copy causes.
 * statutory: whether a completed transaction pulls this document into PMLA retention.
 * allowed: false means it should never sit in an agent's files in that form.
 */
export const DOC_TYPES = [
  {
    id: "aadhaar-full",
    label: "Aadhaar copy with the full number visible",
    sensitivity: 5,
    statutory: false,
    allowed: false,
    guidance:
      "Replace with a masked Aadhaar or an offline verification document and destroy the full-number copy.",
  },
  {
    id: "aadhaar-masked",
    label: "Masked Aadhaar / offline verification document",
    sensitivity: 3,
    statutory: true,
    allowed: true,
    guidance: "Acceptable identity proof. Keep it inside the KYC file, not in chat or a phone gallery.",
  },
  {
    id: "pan",
    label: "PAN card copy",
    sensitivity: 4,
    statutory: true,
    allowed: true,
    guidance: "Needed for transaction reporting. Store encrypted and stamp the copy with its purpose.",
  },
  {
    id: "passport",
    label: "Passport copy",
    sensitivity: 4,
    statutory: true,
    allowed: true,
    guidance: "Keep only the identity pages actually required, not the full booklet scan.",
  },
  {
    id: "bank-statement",
    label: "Bank statement",
    sensitivity: 5,
    statutory: true,
    allowed: true,
    guidance: "Redact unrelated transactions before filing; only the balance and identity lines are relevant.",
  },
  {
    id: "salary-slip",
    label: "Salary slip or employment letter",
    sensitivity: 4,
    statutory: false,
    allowed: true,
    guidance: "Affordability evidence only. Once the tenant or buyer is chosen, it has served its purpose.",
  },
  {
    id: "itr",
    label: "Income tax return",
    sensitivity: 5,
    statutory: false,
    allowed: true,
    guidance: "Rarely needed by the agent at all — prefer letting the lender collect it directly.",
  },
  {
    id: "cheque-copy",
    label: "Cancelled cheque or bank details",
    sensitivity: 4,
    statutory: true,
    allowed: true,
    guidance: "Account numbers are payment-fraud fuel. Never send one over an unencrypted channel.",
  },
  {
    id: "agreement",
    label: "Sale agreement, lease deed or title document",
    sensitivity: 3,
    statutory: true,
    allowed: true,
    guidance: "Core transaction record. Keep it for the statutory period, then archive or destroy.",
  },
  {
    id: "police-verification",
    label: "Tenant police verification form",
    sensitivity: 3,
    statutory: false,
    allowed: true,
    guidance: "Hand the completed form to the police station; you do not need a permanent copy.",
  },
  {
    id: "photo",
    label: "Passport photograph",
    sensitivity: 2,
    statutory: false,
    allowed: true,
    guidance: "Low value to you and high value to an impersonator. Delete once identity is confirmed.",
  },
  {
    id: "whatsapp-copy",
    label: "Document received on WhatsApp and left in the gallery",
    sensitivity: 5,
    statutory: false,
    allowed: false,
    guidance:
      "Move it into the KYC file, then delete the chat copy, the auto-download in the gallery and the phone backup.",
  },
];

/** Non-computed guidance on the agent's own exposure, shown alongside the register. */
export const AGENT_EXPOSURE_TIPS = [
  [
    "Publish a work number, not your personal one",
    "Listing portals syndicate contact details across dozens of sites, and the number is impossible to recall later.",
  ],
  [
    "Never share a client's contact details with another broker without asking",
    "Passing on a phone number is a disclosure of personal data, and it is the fastest way to lose a client's trust.",
  ],
  [
    "Strip metadata and personal items from listing photos",
    "Photographs of an occupied home can carry GPS coordinates, and often show documents, keys and children.",
  ],
  [
    "Do site visits from a shared calendar, not your personal location history",
    "Live-location shares with unknown enquirers reveal your movements long after the viewing ends.",
  ],
  [
    "Keep one encrypted KYC folder per deal",
    "Documents scattered across chat, email and a phone gallery cannot be produced on request or deleted on time.",
  ],
];

export const EXPOSURE_BANDS = [
  { min: 60, label: "High exposure", note: "A large share of what you hold is either overdue for deletion or should never have been kept." },
  { min: 30, label: "Moderate exposure", note: "Clear out the overdue rows and replace any unmasked identity copies." },
  { min: 10, label: "Low exposure", note: "Mostly clean. Keep an eye on the documents coming due." },
  { min: 0, label: "Clean register", note: "Nothing in the register is overdue or prohibited." },
];

const MS_PER_DAY = 86400000;

/** Parse a YYYY-MM-DD string into a UTC timestamp, or NaN. */
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

function addYears(ts, years) {
  const d = new Date(ts);
  return Date.UTC(d.getUTCFullYear() + years, d.getUTCMonth(), d.getUTCDate());
}

function addDays(ts, days) {
  return ts + days * MS_PER_DAY;
}

function bandFor(percent) {
  return EXPOSURE_BANDS.find((band) => percent >= band.min) ?? EXPOSURE_BANDS[EXPOSURE_BANDS.length - 1];
}

/**
 * Build the retention register.
 * @param {{items: Array<{id:string, docType:string, collectedOn:string, outcome:string}>, today:string}} input
 */
export function buildRegister({ items, today } = {}) {
  if (!Array.isArray(items)) return { error: "The register must be a list of documents." };
  if (items.length === 0) return { error: "Add at least one document to the register." };
  if (items.length > MAX_ITEMS) {
    return { error: `This register holds up to ${MAX_ITEMS} documents at a time.` };
  }

  const now = parseDate(today);
  if (Number.isNaN(now)) return { error: "Today's date must be a valid calendar date." };

  const rows = [];
  for (const item of items) {
    const doc = DOC_TYPES.find((type) => type.id === item.docType);
    if (!doc) return { error: "Choose a document type for every row." };

    const outcome = OUTCOMES.find((option) => option.id === item.outcome);
    if (!outcome) return { error: "Choose an outcome for every row." };

    const collected = parseDate(item.collectedOn);
    if (Number.isNaN(collected)) {
      return { error: `Enter a valid collection date for "${doc.label}".` };
    }
    if (collected > now) {
      return { error: `"${doc.label}" cannot have been collected in the future.` };
    }

    let keepUntil = null;
    let status;
    let reason;

    if (!doc.allowed) {
      status = "prohibited";
      reason = "Should not be held in this form at all.";
    } else if (outcome.id === "in-progress") {
      status = "active";
      reason = "The deal is live, so the document is still in use.";
    } else if (outcome.id === "closed" && doc.statutory) {
      keepUntil = addYears(collected, PMLA_RETENTION_YEARS);
      status = now > keepUntil ? "overdue" : "retain";
      reason =
        now > keepUntil
          ? `The ${PMLA_RETENTION_YEARS}-year record-keeping period has ended.`
          : `Held under the ${PMLA_RETENTION_YEARS}-year record-keeping period.`;
    } else {
      keepUntil = addDays(collected, PURPOSE_GRACE_DAYS);
      status = now > keepUntil ? "overdue" : "retain";
      reason =
        now > keepUntil
          ? "The purpose has been served and no statutory duty applies."
          : "No statutory duty — delete once the short grace period ends.";
    }

    const daysLeft = keepUntil === null ? null : Math.round((keepUntil - now) / MS_PER_DAY);

    rows.push({
      id: item.id,
      docType: doc.id,
      label: doc.label,
      sensitivity: doc.sensitivity,
      guidance: doc.guidance,
      outcome: outcome.id,
      outcomeLabel: outcome.label,
      collectedOn: toIso(collected),
      keepUntil: keepUntil === null ? null : toIso(keepUntil),
      daysLeft,
      dueSoon: daysLeft !== null && daysLeft >= 0 && daysLeft <= DUE_SOON_DAYS,
      status,
      reason,
    });
  }

  const maxExposure = rows.reduce((sum, row) => sum + row.sensitivity, 0);
  const atRisk = rows.filter((row) => row.status === "overdue" || row.status === "prohibited");
  const exposurePoints = atRisk.reduce((sum, row) => sum + row.sensitivity, 0);
  const exposurePercent = maxExposure > 0 ? (exposurePoints / maxExposure) * 100 : 0;

  const order = { prohibited: 0, overdue: 1, retain: 2, active: 3 };
  const sorted = [...rows].sort((a, b) => {
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    if (b.sensitivity !== a.sensitivity) return b.sensitivity - a.sensitivity;
    return a.collectedOn.localeCompare(b.collectedOn);
  });

  return {
    rows: sorted,
    total: rows.length,
    prohibited: rows.filter((row) => row.status === "prohibited").length,
    overdue: rows.filter((row) => row.status === "overdue").length,
    dueSoon: rows.filter((row) => row.dueSoon && row.status === "retain").length,
    active: rows.filter((row) => row.status === "active").length,
    exposurePoints,
    maxExposure,
    exposurePercent,
    band: bandFor(exposurePercent),
    actionList: sorted.filter((row) => row.status === "prohibited" || row.status === "overdue"),
  };
}
