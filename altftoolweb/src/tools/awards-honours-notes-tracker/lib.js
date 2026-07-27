/**
 * Awards & honours revision tracker — pure list logic.
 *
 * Exam current-affairs sections (SSC, banking, UPSC prelims, state PSCs)
 * repeatedly test "award — recipient — field — year". This module holds the
 * row model, validation, sorting, filtering, CSV export and per-year /
 * per-field summaries. Persistence and rendering live in the UI layer.
 */

/** Sanity bounds for the year field — awards tracked for exams fall well inside this window. */
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;

export const FIELDS = [
  { key: "award", label: "Award", required: true },
  { key: "recipient", label: "Recipient", required: true },
  { key: "field", label: "Field / category", required: false },
  { key: "year", label: "Year", required: true },
  { key: "notes", label: "Notes", required: false },
];

/**
 * Starter rows — verifiable, widely reported facts useful as format examples.
 * Users edit or clear them; nothing here is generated.
 */
export const SEED_ENTRIES = [
  {
    id: 1,
    award: "Nobel Peace Prize",
    recipient: "Nihon Hidankyo",
    field: "Peace",
    year: 2024,
    notes: "Japanese atomic-bomb survivors' organisation",
  },
  {
    id: 2,
    award: "Nobel Prize in Literature",
    recipient: "Han Kang",
    field: "Literature",
    year: 2024,
    notes: "First South Korean literature laureate",
  },
  {
    id: 3,
    award: "Booker Prize",
    recipient: "Samantha Harvey",
    field: "Literature",
    year: 2024,
    notes: "For the novel Orbital",
  },
  {
    id: 4,
    award: "Bharat Ratna",
    recipient: "Karpoori Thakur",
    field: "Public affairs",
    year: 2024,
    notes: "Posthumous; former Bihar CM",
  },
];

/** Validate and normalise a raw form entry. Returns { error } or { value }. */
export function normalizeEntry(entry) {
  const award = String(entry?.award ?? "").trim();
  const recipient = String(entry?.recipient ?? "").trim();
  const field = String(entry?.field ?? "").trim();
  const notes = String(entry?.notes ?? "").trim();
  const year = Number(entry?.year);

  if (award === "") return { error: "Award name is required." };
  if (recipient === "") return { error: "Recipient is required." };
  if (!Number.isFinite(year) || !Number.isInteger(year)) {
    return { error: "Year must be a whole number, e.g. 2024." };
  }
  if (year < MIN_YEAR || year > MAX_YEAR) {
    return { error: `Year must be between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }

  return { value: { award, recipient, field, year, notes } };
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
    [row.award, row.recipient, row.field, row.notes, String(row.year)]
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

/** Counts by year (descending) and by field, for quick revision focus. */
export function summarize(list) {
  const byYear = new Map();
  const byField = new Map();
  for (const row of list) {
    byYear.set(row.year, (byYear.get(row.year) ?? 0) + 1);
    const field = row.field && row.field !== "" ? row.field : "Uncategorised";
    byField.set(field, (byField.get(field) ?? 0) + 1);
  }
  return {
    total: list.length,
    byYear: [...byYear.entries()].sort((a, b) => b[0] - a[0]),
    byField: [...byField.entries()].sort((a, b) => b[1] - a[1]),
  };
}
