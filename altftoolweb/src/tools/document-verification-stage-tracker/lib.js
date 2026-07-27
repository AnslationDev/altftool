/**
 * Document verification (DV) stage tracker.
 *
 * The document list mirrors what Indian government recruitment DV notices
 * (SSC, railways, banking, state PSCs) routinely demand. "Critical" marks
 * documents whose absence normally stops verification outright rather than
 * earning a provisional acceptance. Certificate-validity notes follow the
 * standing DoPT/SSC positions: EWS income-and-asset certificates are issued
 * for a financial year, and OBC non-creamy-layer certificates are expected
 * to be recent (bodies commonly ask for one issued within the last year or
 * the period the notice specifies).
 */

/** Status a document can be in on the tracker. */
export const STATUS_OPTIONS = [
  { id: "ready", label: "Ready (original + photocopies)" },
  { id: "pending", label: "Not yet arranged" },
  { id: "reissue", label: "Needs correction / reissue" },
];

/**
 * Photocopy sets DV notices usually ask candidates to carry alongside
 * originals — two self-attested sets is the common instruction.
 */
export const PHOTOCOPY_SETS = 2;

/** Standard DV document checklist. `conditional` = applies only to some candidates. */
export const STANDARD_DOCUMENTS = [
  {
    id: "admit-cards",
    label: "Admit cards / call letters of all exam stages",
    critical: true,
    conditional: false,
    note: "Carried for every stage attempted, including the DV call letter itself.",
  },
  {
    id: "matric-cert",
    label: "Matriculation (10th) certificate",
    critical: true,
    conditional: false,
    note: "The accepted proof of date of birth in government recruitment.",
  },
  {
    id: "higher-marksheets",
    label: "12th / diploma certificates and marksheets",
    critical: true,
    conditional: false,
    note: "All years/semesters, originals plus photocopies.",
  },
  {
    id: "degree",
    label: "Graduation degree / provisional and marksheets",
    critical: true,
    conditional: false,
    note: "Provisional certificate is accepted where the convocation degree is not yet issued.",
  },
  {
    id: "photo-id",
    label: "Photo identity proof (Aadhaar / PAN / passport / voter ID)",
    critical: true,
    conditional: false,
    note: "The same ID used in the application avoids mismatch queries.",
  },
  {
    id: "photographs",
    label: "Recent passport-size photographs",
    critical: true,
    conditional: false,
    note: "Same appearance as the application photo; carry 8-10.",
  },
  {
    id: "category-cert",
    label: "Caste / category certificate (SC / ST / OBC-NCL) in central format",
    critical: true,
    conditional: true,
    note: "OBC candidates need the non-creamy-layer certificate, recent as per the notice.",
  },
  {
    id: "ews-cert",
    label: "EWS income & asset certificate",
    critical: true,
    conditional: true,
    note: "Issued for a financial year — must cover the year the notice specifies.",
  },
  {
    id: "pwbd-cert",
    label: "PwBD (disability) certificate",
    critical: true,
    conditional: true,
    note: "In the prescribed format from a competent medical authority.",
  },
  {
    id: "noc",
    label: "NOC from current government employer",
    critical: true,
    conditional: true,
    note: "Required only for candidates already in government service.",
  },
  {
    id: "app-printout",
    label: "Online application form printout",
    critical: false,
    conditional: false,
    note: "Some boards verify entries against it.",
  },
  {
    id: "gap-affidavit",
    label: "Gap / name-change affidavit (if applicable)",
    critical: false,
    conditional: true,
    note: "Needed when education gaps or a name mismatch exist across documents.",
  },
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Parse an ISO yyyy-mm-dd string into a UTC-midnight Date, or null when invalid. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
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

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Whole days between two UTC-midnight dates. */
export function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/**
 * Summarise DV readiness.
 *
 * @param {object} input
 * @param {Array}  input.items   [{ id, label, critical, applicable, status }]
 * @param {string} input.dvDate  yyyy-mm-dd of the DV appointment ("" if unknown).
 * @param {string} input.today   yyyy-mm-dd, injected by the caller.
 * @returns {object} readiness summary, or { error }.
 */
export function summarizeDV({ items, dvDate, today }) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "The checklist needs at least one document." };
  }
  const now = parseIsoDate(today);
  if (!now) return { error: "Enter today's date as yyyy-mm-dd." };

  let dv = null;
  if (typeof dvDate === "string" && dvDate.trim() !== "") {
    dv = parseIsoDate(dvDate);
    if (!dv) return { error: "Enter the DV date as yyyy-mm-dd, or leave it blank." };
  }

  const validStatuses = new Set(STATUS_OPTIONS.map((s) => s.id));
  let applicable = 0;
  let ready = 0;
  let pending = 0;
  let reissue = 0;
  const pendingCritical = [];
  const reissueList = [];

  for (const item of items) {
    if (!item.applicable) continue;
    if (!validStatuses.has(item.status)) {
      return { error: `"${item.label}" has an unknown status.` };
    }
    applicable += 1;
    if (item.status === "ready") ready += 1;
    else if (item.status === "pending") {
      pending += 1;
      if (item.critical) pendingCritical.push(item);
    } else {
      reissue += 1;
      reissueList.push(item);
      if (item.critical) pendingCritical.push(item);
    }
  }

  if (applicable === 0) {
    return { error: "Mark at least one document as applicable to you." };
  }

  const daysLeft = dv ? daysBetween(now, dv) : null;
  const readinessPercent = Math.round((ready / applicable) * 100);

  let verdict;
  if (readinessPercent === 100) {
    verdict = "All applicable documents ready — carry originals plus photocopy sets.";
  } else if (pendingCritical.length > 0) {
    verdict =
      daysLeft !== null && daysLeft <= 7
        ? "Critical documents are missing with a week or less to go — treat reissue requests as emergencies."
        : "Critical documents are still missing — start with those, they stop verification outright.";
  } else {
    verdict = "Only non-critical items remain — finish them, but the stage should clear.";
  }

  return {
    applicable,
    ready,
    pending,
    reissue,
    readinessPercent,
    pendingCritical,
    reissueList,
    daysLeft,
    dvDateSet: dv !== null,
    dvPassed: dv !== null && daysLeft < 0,
    verdict,
    photocopySets: PHOTOCOPY_SETS,
  };
}
