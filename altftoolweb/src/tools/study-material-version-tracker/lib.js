/**
 * Study material version tracker.
 *
 * Rule set (own convention, stated in the UI):
 *  - CURRENT  : the edition you are using is the latest edition (or newer, e.g. a
 *               regional reprint numbered ahead of the mainline edition).
 *  - BEHIND   : the latest edition number is higher than the one you are using.
 *  - UNKNOWN  : you have not recorded what the latest edition is, so the item
 *               needs a check against the publisher's page.
 * Age is computed from a caller-supplied reference year so the function stays pure.
 */

/** Earliest plausible publication year for study material still in circulation. */
export const MIN_YEAR = 1900;

/** Statuses in display order. */
export const STATUSES = [
  { id: "behind", label: "Behind — newer edition exists" },
  { id: "unknown", label: "Unknown — latest edition not recorded" },
  { id: "current", label: "Current" },
];

/**
 * A book revised more than this many years ago is flagged as worth re-checking
 * even when marked current — syllabi and law/science content drift. Heuristic.
 */
export const STALE_AFTER_YEARS = 5;

/**
 * Evaluate one material row.
 * @param {object} input
 * @param {string} input.title
 * @param {number|string} input.usingEdition   Edition you own/use (positive integer).
 * @param {number|string} [input.usingYear]    Year of that edition (optional).
 * @param {number|string} [input.latestEdition] Latest edition, if known (blank = unknown).
 * @param {number} input.referenceYear         "Today" year supplied by the caller.
 * @returns {object} evaluation or { error }
 */
export function evaluateMaterial({ title, usingEdition, usingYear, latestEdition, referenceYear }) {
  const name = typeof title === "string" ? title.trim() : "";
  if (name === "") return { error: "Give the material a name." };

  const refYear = Number(referenceYear);
  if (!Number.isInteger(refYear) || refYear < MIN_YEAR) {
    return { error: "Reference year is invalid." };
  }

  const using = Number(usingEdition);
  if (!Number.isInteger(using) || using < 1) {
    return { error: `"${name}": the edition you use must be a whole number of 1 or more.` };
  }

  const hasYear = usingYear !== undefined && usingYear !== null && String(usingYear).trim() !== "";
  let year = null;
  if (hasYear) {
    year = Number(usingYear);
    if (!Number.isInteger(year) || year < MIN_YEAR || year > refYear + 1) {
      return { error: `"${name}": edition year must be between ${MIN_YEAR} and ${refYear + 1}.` };
    }
  }

  const hasLatest =
    latestEdition !== undefined && latestEdition !== null && String(latestEdition).trim() !== "";
  let latest = null;
  if (hasLatest) {
    latest = Number(latestEdition);
    if (!Number.isInteger(latest) || latest < 1) {
      return { error: `"${name}": latest edition must be a whole number of 1 or more.` };
    }
  }

  let status = "unknown";
  let editionsBehind = 0;
  if (latest !== null) {
    if (latest > using) {
      status = "behind";
      editionsBehind = latest - using;
    } else {
      status = "current";
    }
  }

  const ageYears = year === null ? null : refYear - year;
  const stale = ageYears !== null && ageYears > STALE_AFTER_YEARS;

  return { title: name, usingEdition: using, usingYear: year, latestEdition: latest, status, editionsBehind, ageYears, stale };
}

/**
 * Summarise a list of material rows.
 * @param {object} input
 * @param {Array<object>} input.materials    Rows as accepted by evaluateMaterial.
 * @param {number} input.referenceYear
 * @returns {object} { items, counts, actionNeeded, oldest } or { error }
 */
export function summarizeMaterials({ materials, referenceYear }) {
  if (!Array.isArray(materials) || materials.length === 0) {
    return { error: "Add at least one book or module to track." };
  }

  const items = [];
  for (const row of materials) {
    const evaluated = evaluateMaterial({ ...row, referenceYear });
    if (evaluated.error) return { error: evaluated.error };
    items.push(evaluated);
  }

  const counts = { current: 0, behind: 0, unknown: 0 };
  for (const item of items) counts[item.status] += 1;

  const behindItems = items.filter((item) => item.status === "behind");
  const mostBehind =
    behindItems.length === 0
      ? null
      : behindItems.reduce((worst, item) => (item.editionsBehind > worst.editionsBehind ? item : worst));

  const dated = items.filter((item) => item.ageYears !== null);
  const oldest =
    dated.length === 0
      ? null
      : dated.reduce((old, item) => (item.ageYears > old.ageYears ? item : old));

  return {
    items,
    counts,
    total: items.length,
    actionNeeded: counts.behind + counts.unknown,
    mostBehind,
    oldest,
    staleCount: items.filter((item) => item.stale).length,
  };
}
