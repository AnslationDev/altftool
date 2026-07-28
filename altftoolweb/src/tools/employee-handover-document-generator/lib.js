/**
 * Handover readiness scoring and document builder.
 *
 * Scoring model (stated so the number is auditable rather than a black box):
 *  - Every handover item carries a criticality weight: 3 for critical, 2 for
 *    important, 1 for routine. Weighting by criticality is what stops a long
 *    tail of trivial items from hiding an undocumented production system.
 *  - Every item carries a completion factor: 1.0 when documented AND transferred,
 *    0.6 when documented but not yet walked through, 0.3 when in progress, 0
 *    when not started. The 0.6 step reflects that a written runbook nobody has
 *    read is most of the value but not all of it.
 *  - Readiness = sum(weight x factor) / sum(weight), expressed as a percentage.
 *  - An item that is critical and not fully transferred is reported as a blocker
 *    regardless of the overall score.
 *
 * No credentials or passwords belong in a handover document. The tool records
 * where a credential lives and who owns it, never the secret itself.
 */

export const CRITICALITIES = [
  { id: "critical", label: "Critical — breaks if unattended", weight: 3 },
  { id: "important", label: "Important — noticed within a week", weight: 2 },
  { id: "routine", label: "Routine — nice to have documented", weight: 1 },
];

export const STATUSES = [
  { id: "transferred", label: "Documented and walked through", factor: 1 },
  { id: "documented", label: "Documented, not yet walked through", factor: 0.6 },
  { id: "in-progress", label: "In progress", factor: 0.3 },
  { id: "not-started", label: "Not started", factor: 0 },
];

export const CATEGORIES = [
  { id: "systems", label: "Systems and access", hint: "Every tool, console or repository you can log into, and who should own it next." },
  { id: "recurring", label: "Recurring tasks", hint: "Anything on a daily, weekly, monthly or quarterly cadence, with the deadline that matters." },
  { id: "projects", label: "Live projects", hint: "Work in flight, its current state, and the next decision due." },
  { id: "contacts", label: "Key contacts", hint: "Internal counterparts, vendors and clients, with what each one is for." },
  { id: "documents", label: "Documents and runbooks", hint: "Where the source of truth lives, not a copy of it." },
  { id: "pending", label: "Pending approvals and commitments", hint: "Promises you made that outlive your last working day." },
];

/** Below this score the handover is not safe to sign off. Chosen so that a
 *  single untransferred critical item in a small list keeps the score under it. */
export const SAFE_HANDOVER_PCT = 85;

const MS_PER_DAY = 86400000;
const round1 = (value) => Math.round(value * 10) / 10;

export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(Number(match[1]), month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

export function daysBetweenISO(fromISO, toISODate) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISODate);
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
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

const findBy = (list, id, fallbackIndex = 0) =>
  list.find((entry) => entry.id === id) || list[fallbackIndex];

/**
 * Score the handover and surface what is still at risk.
 * @returns {object} { error } or the full readiness report.
 */
export function computeHandoverReadiness({ items, todayISO, lastWorkingDayISO }) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Add at least one item to hand over." };
  }
  if (!parseISODate(todayISO)) return { error: "Enter a valid current date." };
  if (!parseISODate(lastWorkingDayISO)) return { error: "Enter a valid last working day." };

  const daysRemaining = daysBetweenISO(todayISO, lastWorkingDayISO);
  if (daysRemaining < 0) {
    return { error: "Your last working day is before today's date. Check the two dates." };
  }

  const scored = [];
  for (const item of items) {
    const name = typeof item.name === "string" ? item.name.trim() : "";
    if (!name) return { error: "Every handover item needs a name." };
    const criticality = findBy(CRITICALITIES, item.criticalityId, 1);
    const status = findBy(STATUSES, item.statusId, 3);
    const category = findBy(CATEGORIES, item.categoryId, 0);
    scored.push({
      name,
      note: typeof item.note === "string" ? item.note.trim() : "",
      successor: typeof item.successor === "string" ? item.successor.trim() : "",
      criticality,
      status,
      category,
      weight: criticality.weight,
      earned: criticality.weight * status.factor,
      done: status.factor === 1,
    });
  }

  const totalWeight = scored.reduce((sum, item) => sum + item.weight, 0);
  const earnedWeight = scored.reduce((sum, item) => sum + item.earned, 0);
  const readinessPct = totalWeight > 0 ? round1((earnedWeight / totalWeight) * 100) : 0;

  const openItems = scored.filter((item) => !item.done);
  const blockers = scored.filter((item) => item.criticality.id === "critical" && !item.done);
  const unowned = scored.filter((item) => !item.successor && !item.done);

  const byCategory = CATEGORIES.map((category) => {
    const inCategory = scored.filter((item) => item.category.id === category.id);
    const weight = inCategory.reduce((sum, item) => sum + item.weight, 0);
    const earned = inCategory.reduce((sum, item) => sum + item.earned, 0);
    return {
      id: category.id,
      label: category.label,
      count: inCategory.length,
      open: inCategory.filter((item) => !item.done).length,
      readinessPct: weight > 0 ? round1((earned / weight) * 100) : null,
      items: inCategory,
    };
  }).filter((group) => group.count > 0);

  const itemsPerDay = daysRemaining > 0 ? round1(openItems.length / daysRemaining) : openItems.length;

  let verdict;
  if (blockers.length > 0) {
    verdict = `${blockers.length} critical item(s) are not fully transferred. Clear those before anything else.`;
  } else if (readinessPct >= SAFE_HANDOVER_PCT) {
    verdict = "Handover is in good shape — safe to circulate for sign-off.";
  } else if (openItems.length === 0) {
    verdict = "Every item is transferred.";
  } else {
    verdict = `${openItems.length} item(s) still open. Nothing critical, but the score is below the ${SAFE_HANDOVER_PCT}% sign-off mark.`;
  }

  return {
    readinessPct,
    totalWeight,
    earnedWeight: round1(earnedWeight),
    itemCount: scored.length,
    openCount: openItems.length,
    doneCount: scored.length - openItems.length,
    blockers,
    unowned,
    byCategory,
    daysRemaining,
    itemsPerDay,
    verdict,
    safe: blockers.length === 0 && readinessPct >= SAFE_HANDOVER_PCT,
    items: scored,
  };
}

const clean = (value) => (typeof value === "string" ? value.trim() : "");

/** Compose the handover document itself. */
export function buildHandoverDocument({
  employeeName,
  designation,
  department,
  managerName,
  successorName,
  lastWorkingDayISO,
  documentDateISO,
  contactAfterExitDays,
  closingNote,
  report,
}) {
  if (!report || report.error) {
    return { error: report?.error || "Fix the handover items before generating the document." };
  }
  const name = clean(employeeName) || "[Your name]";
  const role = clean(designation) || "[Designation]";
  const dept = clean(department) || "[Department]";
  const manager = clean(managerName) || "[Manager]";
  const successor = clean(successorName) || "[Primary successor]";
  const availableDays = Number.isFinite(contactAfterExitDays) ? Math.max(0, Math.round(contactAfterExitDays)) : 15;

  const lines = [
    `HANDOVER DOCUMENT — ${name.toUpperCase()}`,
    "",
    `Prepared on: ${formatLongDate(documentDateISO) || "[date]"}`,
    `Role: ${role}, ${dept}`,
    `Last working day: ${formatLongDate(lastWorkingDayISO) || "[last working day]"}`,
    `Reporting manager: ${manager}`,
    `Primary successor: ${successor}`,
    "",
    "1. STATUS AT A GLANCE",
    `Handover readiness: ${report.readinessPct}% (weighted by criticality)`,
    `Items in scope: ${report.itemCount} — ${report.doneCount} fully transferred, ${report.openCount} open`,
    `Working time left: ${report.daysRemaining} day(s)`,
    report.blockers.length > 0
      ? `Critical items still open: ${report.blockers.map((item) => item.name).join("; ")}`
      : "Critical items still open: none",
    "",
  ];

  let section = 2;
  for (const group of report.byCategory) {
    lines.push(`${section}. ${group.label.toUpperCase()} (${group.readinessPct}% ready, ${group.open} open)`);
    group.items.forEach((item, index) => {
      lines.push(
        `${section}.${index + 1} ${item.name} — ${item.criticality.id}, ${item.status.label.toLowerCase()}${item.successor ? `, handed to ${item.successor}` : ", OWNER NOT YET NAMED"}`,
      );
      if (item.note) lines.push(`      ${item.note}`);
    });
    lines.push("");
    section += 1;
  }

  if (report.unowned.length > 0) {
    lines.push(`${section}. ITEMS WITHOUT A NAMED OWNER`);
    report.unowned.forEach((item, index) => {
      lines.push(`${section}.${index + 1} ${item.name} (${item.category.label})`);
    });
    lines.push("");
    section += 1;
  }

  lines.push(
    `${section}. AFTER MY LAST DAY`,
    `I am contactable by email for clarifications for ${availableDays} day(s) after ${formatLongDate(lastWorkingDayISO) || "my last working day"}. Please route anything urgent through ${manager}.`,
    "No passwords or credentials are recorded in this document. Access should be re-issued through the normal provisioning process rather than shared.",
    "",
    clean(closingNote) ||
      "Please review this document and confirm by email that the handover is accepted, or flag anything you would like covered in more depth while I am still here.",
    "",
    `Prepared by: ${name}`,
    `Accepted by: ${successor} / ${manager} (please countersign)`,
  );

  const body = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return { body, wordCount: body.split(/\s+/).filter(Boolean).length };
}
