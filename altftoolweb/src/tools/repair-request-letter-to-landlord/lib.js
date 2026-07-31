/**
 * Repair Request Letter to Landlord — pure logic.
 *
 * Statutory basis (India):
 *  - Model Tenancy Act, 2021, Second Schedule splits repair liability. The
 *    landlord's list covers whitewashing walls and painting doors and windows,
 *    changing and plumbing of pipes, internal and external electrical wiring
 *    and related maintenance, structural repairs other than damage caused by
 *    the tenant, and maintenance of common facilities such as lifts, water
 *    pumps, staircases and common lighting. The tenant's list covers drain
 *    cleaning, switch and socket repairs, kitchen fixture repairs, replacement
 *    of glass panels in windows and doors, and upkeep of gardens and open
 *    spaces.
 *  - Model Tenancy Act, 2021, Section 15: if the landlord neglects repairs he
 *    is liable for after being given notice, the tenant may get them done and
 *    deduct the cost from rent, subject to a ceiling of fifty per cent of the
 *    rent payable for that month.
 *
 * The response windows by severity below are practice, not statute: they are
 * the deadlines habitability complaints are usually held to, and the caller can
 * override the overall deadline.
 */

/** Model Tenancy Act, 2021, Section 15 — rent deduction ceiling. */
export const RENT_DEDUCTION_CAP_SHARE = 0.5;

/** Practice-based response windows in days, by how bad the fault is. */
export const SEVERITY_LEVELS = Object.freeze([
  {
    id: "urgent",
    label: "Urgent — premises unsafe or unusable",
    days: 2,
    note: "No water or power, sewage backflow, gas leak, falling plaster, unsafe wiring.",
    rank: 3,
  },
  {
    id: "major",
    label: "Major — daily use badly affected",
    days: 7,
    note: "Persistent leak, broken geyser, lift out of service, damp on a bedroom wall.",
    rank: 2,
  },
  {
    id: "minor",
    label: "Minor — cosmetic or slow deterioration",
    days: 15,
    note: "Peeling paint, a stiff window, a dripping tap, patchy common-area lighting.",
    rank: 1,
  },
]);

/**
 * Common faults mapped to the party responsible under the Second Schedule of
 * the Model Tenancy Act, 2021.
 */
export const ISSUE_CATALOG = Object.freeze([
  { id: "seepage", label: "Seepage or damp on walls or ceiling", party: "landlord", basis: "Structural repair" },
  { id: "pipes", label: "Leaking or burst water pipe", party: "landlord", basis: "Changing and plumbing of pipes" },
  { id: "wiring", label: "Faulty internal or external electrical wiring", party: "landlord", basis: "Electrical wiring maintenance" },
  { id: "structure", label: "Cracks, falling plaster or a weak slab", party: "landlord", basis: "Structural repair" },
  { id: "paint", label: "Whitewashing walls, painting doors and windows", party: "landlord", basis: "Whitewashing and painting" },
  { id: "lift", label: "Lift, water pump or staircase lighting out of order", party: "landlord", basis: "Common facilities" },
  { id: "waterproof", label: "Terrace or bathroom waterproofing failure", party: "landlord", basis: "Structural repair" },
  { id: "sewage", label: "Blocked main sewage line or overflow", party: "landlord", basis: "Plumbing of pipes" },
  { id: "drain", label: "Cleaning a choked basin or floor drain", party: "tenant", basis: "Drain cleaning" },
  { id: "switch", label: "Broken switch or socket", party: "tenant", basis: "Switch and socket repairs" },
  { id: "kitchen", label: "Kitchen fixture repair (chimney, shutters, sink trap)", party: "tenant", basis: "Kitchen fixture repairs" },
  { id: "glass", label: "Replacing a broken window or door glass panel", party: "tenant", basis: "Glass panel replacement" },
  { id: "garden", label: "Garden and open space upkeep", party: "tenant", basis: "Maintenance of gardens and open spaces" },
]);

const MS_PER_DAY = 86400000;

export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function diffDays(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatMoney(value) {
  return inr.format(Number.isFinite(value) ? Math.round(value) : 0);
}

export function formatLongDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function severityById(id) {
  return SEVERITY_LEVELS.find((level) => level.id === id) || SEVERITY_LEVELS[2];
}

/**
 * Build the repair log and the deadline the letter should demand.
 *
 * @param {object} input
 * @param {Array} input.issues       [{ description, party, severity, reportedDate }]
 * @param {number} input.monthlyRent monthly rent, for the deduction ceiling
 * @param {string} input.noticeDate  YYYY-MM-DD, the date of this letter
 * @param {number} input.responseDays days the landlord is given to act
 */
export function computeRepairRequest(input) {
  const { issues, monthlyRent, noticeDate, responseDays = 15 } = input || {};

  if (typeof monthlyRent !== "number" || !Number.isFinite(monthlyRent) || monthlyRent <= 0) {
    return { error: "Enter a monthly rent greater than zero." };
  }
  if (typeof responseDays !== "number" || !Number.isFinite(responseDays)) {
    return { error: "Enter a valid number of days for the landlord to respond." };
  }
  if (responseDays < 1 || responseDays > 90) {
    return { error: "Give the landlord between 1 and 90 days to respond." };
  }
  const notice = parseISODate(noticeDate);
  if (!notice) return { error: "Enter the letter date as a valid calendar date." };
  if (!Array.isArray(issues) || issues.length === 0) {
    return { error: "Add at least one repair issue to the log." };
  }

  const rows = [];
  for (const issue of issues) {
    const description = String(issue?.description ?? "").trim();
    if (!description) continue;
    const severity = severityById(issue?.severity);
    const reported = parseISODate(issue?.reportedDate);
    const outstandingDays = reported ? diffDays(reported, notice) : null;
    if (outstandingDays !== null && outstandingDays < 0) {
      return { error: `"${description}" is marked as first reported after the date of this letter.` };
    }
    rows.push({
      description,
      party: issue?.party === "tenant" ? "tenant" : "landlord",
      severityId: severity.id,
      severityLabel: severity.label,
      severityRank: severity.rank,
      recommendedDays: severity.days,
      reportedDate: reported ? toISODate(reported) : "",
      outstandingDays,
      dueDate: toISODate(addDays(notice, Math.min(severity.days, responseDays))),
    });
  }

  if (rows.length === 0) {
    return { error: "Every issue needs a short description of the fault." };
  }

  rows.sort((a, b) => b.severityRank - a.severityRank || (b.outstandingDays ?? 0) - (a.outstandingDays ?? 0));

  const landlordItems = rows.filter((row) => row.party === "landlord");
  const tenantItems = rows.filter((row) => row.party === "tenant");
  if (landlordItems.length === 0) {
    return {
      error:
        "This letter requests repairs from the landlord — log at least one issue marked as the landlord's responsibility.",
    };
  }
  const urgentCount = landlordItems.filter((row) => row.severityId === "urgent").length;
  const oldest = landlordItems.reduce(
    (max, row) => (row.outstandingDays !== null && row.outstandingDays > max ? row.outstandingDays : max),
    0,
  );
  const tightestDays = landlordItems.length
    ? Math.min(responseDays, ...landlordItems.map((row) => row.recommendedDays))
    : responseDays;

  return {
    rows,
    landlordItems,
    tenantItems,
    urgentCount,
    oldestOutstandingDays: oldest,
    noticeDate: toISODate(notice),
    responseDays,
    deadlineDate: toISODate(addDays(notice, responseDays)),
    priorityDeadlineDate: toISODate(addDays(notice, tightestDays)),
    priorityDays: tightestDays,
    monthlyRent: Math.round(monthlyRent),
    maxMonthlyDeduction: Math.round(monthlyRent * RENT_DEDUCTION_CAP_SHARE),
    deductionCapPercent: RENT_DEDUCTION_CAP_SHARE * 100,
  };
}

/** Assemble the repair request letter. */
export function buildRepairLetter(result, details) {
  if (!result || result.error) return "";
  const {
    tenantName = "[Tenant name]",
    landlordName = "[Landlord name]",
    propertyAddress = "[Property address]",
    contact = "",
    accessWindow = "",
  } = details || {};

  const notice = parseISODate(result.noticeDate);
  const lines = [];

  lines.push(`Date: ${formatLongDate(notice)}`);
  lines.push("");
  lines.push("To,");
  lines.push(landlordName);
  lines.push("");
  lines.push(`Subject: Request for repairs at ${propertyAddress}`);
  lines.push("");
  lines.push(`Dear ${landlordName},`);
  lines.push("");
  lines.push(
    `I am the tenant of the premises at ${propertyAddress}. This letter records the repairs that are pending and requests that they be attended to.`,
  );

  if (result.landlordItems.length > 0) {
    lines.push("");
    lines.push("Repairs that fall to the landlord under the Second Schedule of the Model Tenancy Act, 2021:");
    result.landlordItems.forEach((row, index) => {
      const age =
        row.outstandingDays !== null
          ? ` — first reported on ${formatLongDate(parseISODate(row.reportedDate))}, ${row.outstandingDays} day(s) ago`
          : "";
      lines.push(`  ${index + 1}. ${row.description} [${row.severityId}]${age}`);
    });
  }

  if (result.tenantItems.length > 0) {
    lines.push("");
    lines.push("Items I accept as my responsibility as tenant, which I am arranging myself:");
    result.tenantItems.forEach((row, index) => {
      lines.push(`  ${index + 1}. ${row.description}`);
    });
  }

  lines.push("");
  if (result.urgentCount > 0) {
    lines.push(
      `${result.urgentCount} of the items above ${
        result.urgentCount === 1 ? "makes" : "make"
      } the premises unsafe or unusable, so I request attention within ${result.priorityDays} day(s), that is by ${formatLongDate(
        parseISODate(result.priorityDeadlineDate),
      )}.`,
    );
  }
  lines.push(
    `I request that the remaining repairs be completed by ${formatLongDate(
      parseISODate(result.deadlineDate),
    )}, being ${result.responseDays} days from the date of this letter, or that you write to me with a schedule of works.`,
  );
  lines.push("");
  lines.push(
    `If the repairs are not carried out, the Model Tenancy Act, 2021 allows a tenant to have the landlord's repairs done and deduct the cost from rent, limited to ${result.deductionCapPercent}% of a month's rent — ${formatMoney(
      result.maxMonthlyDeduction,
    )} in this tenancy. I would much rather you arranged the work.`,
  );
  if (accessWindow.trim()) {
    lines.push("");
    lines.push(`Access to the premises: ${accessWindow.trim()}`);
  }
  lines.push("");
  lines.push("Kindly acknowledge this letter and confirm when your contractor will visit.");
  if (contact.trim()) {
    lines.push("");
    lines.push(`Contact: ${contact.trim()}`);
  }
  lines.push("");
  lines.push("Yours sincerely,");
  lines.push(tenantName);
  lines.push("(Tenant)");

  return lines.join("\n");
}
