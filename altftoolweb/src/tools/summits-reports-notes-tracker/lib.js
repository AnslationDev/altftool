/**
 * Summits, indices & reports revision tracker — pure list logic.
 *
 * Exam current-affairs sections repeatedly test "summit — host — year" and
 * "report — publisher — India's rank". This module holds the row model,
 * validation, sorting, filtering, CSV export and summaries. Persistence and
 * rendering live in the UI layer.
 */

/** Sanity bounds for the year field. */
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;

export const FIELDS = [
  { key: "name", label: "Summit / report", required: true },
  { key: "organisation", label: "Organisation / publisher", required: true },
  { key: "host", label: "Host / venue", required: false },
  { key: "year", label: "Year", required: true },
  { key: "outcome", label: "India's rank / outcome", required: false },
  { key: "notes", label: "Notes", required: false },
];

/**
 * Starter rows — widely reported, verifiable facts shown as format examples.
 * Users edit or clear them; always confirm ranks against the source report.
 */
export const SEED_ENTRIES = [
  {
    id: 1,
    name: "G20 Summit",
    organisation: "G20",
    host: "New Delhi, India",
    year: 2023,
    outcome: "New Delhi Leaders' Declaration adopted",
    notes: "African Union admitted as permanent member",
  },
  {
    id: 2,
    name: "COP29 (UN Climate Change Conference)",
    organisation: "UNFCCC",
    host: "Baku, Azerbaijan",
    year: 2024,
    outcome: "New collective climate finance goal agreed",
    notes: "",
  },
  {
    id: 3,
    name: "Global Hunger Index",
    organisation: "Concern Worldwide & Welthungerhilfe",
    host: "Annual report",
    year: 2024,
    outcome: "India ranked 105 of 127",
    notes: "Category: serious",
  },
  {
    id: 4,
    name: "World Happiness Report",
    organisation: "UN SDSN / Gallup",
    host: "Annual report",
    year: 2024,
    outcome: "India ranked 126 of 143",
    notes: "",
  },
];

/** Validate and normalise a raw form entry. Returns { error } or { value }. */
export function normalizeEntry(entry) {
  const name = String(entry?.name ?? "").trim();
  const organisation = String(entry?.organisation ?? "").trim();
  const host = String(entry?.host ?? "").trim();
  const outcome = String(entry?.outcome ?? "").trim();
  const notes = String(entry?.notes ?? "").trim();
  const year = Number(entry?.year);

  if (name === "") return { error: "Summit or report name is required." };
  if (organisation === "") return { error: "Organisation / publisher is required." };
  if (!Number.isFinite(year) || !Number.isInteger(year)) {
    return { error: "Year must be a whole number, e.g. 2024." };
  }
  if (year < MIN_YEAR || year > MAX_YEAR) {
    return { error: `Year must be between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }

  return { value: { name, organisation, host, year, outcome, notes } };
}

/** Smallest positive id not yet used — pure derivation from the list. */
export function nextId(list) {
  return list.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
}

/** Append (no id) or replace (matching id). Returns a new array. */
export function upsertEntry(list, entry) {
  if (entry.id != null && list.some((row) => row.id === entry.id)) {
    return list.map((row) => (row.id === entry.id ? { ...row, ...entry } : row));
  }
  return [...list, { ...entry, id: entry.id ?? nextId(list) }];
}

export function removeEntry(list, id) {
  return list.filter((row) => row.id !== id);
}

/** Case-insensitive substring match across all text fields plus year. */
export function filterEntries(list, query) {
  const q = String(query ?? "").trim().toLowerCase();
  if (q === "") return list;
  return list.filter((row) =>
    [row.name, row.organisation, row.host, row.outcome, row.notes, String(row.year)]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

/** Stable sort by a column; year sorts numerically, text sorts locale-insensitively. */
export function sortEntries(list, key, direction = "asc") {
  const dir = direction === "desc" ? -1 : 1;
  return [...list].sort((a, b) => {
    if (key === "year") return (Number(a.year) - Number(b.year)) * dir;
    return String(a[key] ?? "").localeCompare(String(b[key] ?? ""), undefined, {
      sensitivity: "base",
    }) * dir;
  });
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** RFC 4180-style CSV with a header row. */
export function toCsv(list) {
  const header = FIELDS.map((f) => f.label).join(",");
  const rows = list.map((row) => FIELDS.map((f) => csvCell(row[f.key])).join(","));
  return [header, ...rows].join("\n");
}

/** Counts by year (descending) and by organisation. */
export function summarize(list) {
  const byYear = new Map();
  const byOrganisation = new Map();
  for (const row of list) {
    byYear.set(row.year, (byYear.get(row.year) ?? 0) + 1);
    const org = row.organisation && row.organisation !== "" ? row.organisation : "Unattributed";
    byOrganisation.set(org, (byOrganisation.get(org) ?? 0) + 1);
  }
  return {
    total: list.length,
    byYear: [...byYear.entries()].sort((a, b) => b[0] - a[0]),
    byOrganisation: [...byOrganisation.entries()].sort((a, b) => b[1] - a[1]),
  };
}
