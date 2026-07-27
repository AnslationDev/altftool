/**
 * Person-in-news / appointments revision tracker — pure list logic.
 *
 * Exam current-affairs sections repeatedly test "who was appointed as X" and
 * "why was Y in the news". This module holds the row model, validation,
 * sorting, filtering, CSV export and summaries. Persistence and rendering
 * live in the UI layer.
 */

/** Dates are stored as ISO yyyy-mm-dd so lexicographic order equals chronological order. */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Sanity bounds for the date's year component. */
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;

export const FIELDS = [
  { key: "person", label: "Person", required: true },
  { key: "role", label: "Role / appointment", required: true },
  { key: "organisation", label: "Organisation", required: false },
  { key: "date", label: "Date", required: true },
  { key: "why", label: "Why in news", required: false },
];

/**
 * Starter rows — widely reported, verifiable facts shown as format examples.
 * Users edit or clear them.
 */
export const SEED_ENTRIES = [
  {
    id: 1,
    person: "Droupadi Murmu",
    role: "President of India",
    organisation: "Government of India",
    date: "2022-07-25",
    why: "Sworn in as the 15th President",
  },
  {
    id: 2,
    person: "Sanjiv Khanna",
    role: "Chief Justice of India",
    organisation: "Supreme Court of India",
    date: "2024-11-11",
    why: "Sworn in as the 51st CJI",
  },
  {
    id: 3,
    person: "Gukesh Dommaraju",
    role: "World Chess Champion",
    organisation: "FIDE",
    date: "2024-12-12",
    why: "Youngest undisputed world champion, at 18",
  },
  {
    id: 4,
    person: "Shubhanshu Shukla",
    role: "Astronaut, Axiom Mission 4 pilot",
    organisation: "ISRO / Axiom Space",
    date: "2025-06-25",
    why: "First Indian astronaut to visit the ISS",
  },
];

/** Validate an ISO yyyy-mm-dd date string including real calendar days. */
export function isValidIsoDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < MIN_YEAR || year > MAX_YEAR) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Validate and normalise a raw form entry. Returns { error } or { value }. */
export function normalizeEntry(entry) {
  const person = String(entry?.person ?? "").trim();
  const role = String(entry?.role ?? "").trim();
  const organisation = String(entry?.organisation ?? "").trim();
  const why = String(entry?.why ?? "").trim();
  const date = String(entry?.date ?? "").trim();

  if (person === "") return { error: "Person's name is required." };
  if (role === "") return { error: "Role or appointment is required." };
  if (!isValidIsoDate(date)) {
    return { error: "Enter a valid date in yyyy-mm-dd form, e.g. 2025-01-15." };
  }

  return { value: { person, role, organisation, date, why } };
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

/** Case-insensitive substring match across all fields. */
export function filterEntries(list, query) {
  const q = String(query ?? "").trim().toLowerCase();
  if (q === "") return list;
  return list.filter((row) =>
    [row.person, row.role, row.organisation, row.why, row.date]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

/** Stable sort by a column; ISO dates sort correctly as strings. */
export function sortEntries(list, key, direction = "asc") {
  const dir = direction === "desc" ? -1 : 1;
  return [...list].sort(
    (a, b) =>
      String(a[key] ?? "").localeCompare(String(b[key] ?? ""), undefined, {
        sensitivity: "base",
      }) * dir,
  );
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

/** Counts by year (descending, from the date field) and by organisation. */
export function summarize(list) {
  const byYear = new Map();
  const byOrganisation = new Map();
  for (const row of list) {
    const year = Number(String(row.date ?? "").slice(0, 4));
    if (Number.isFinite(year) && year > 0) {
      byYear.set(year, (byYear.get(year) ?? 0) + 1);
    }
    const org = row.organisation && row.organisation !== "" ? row.organisation : "Unattributed";
    byOrganisation.set(org, (byOrganisation.get(org) ?? 0) + 1);
  }
  return {
    total: list.length,
    byYear: [...byYear.entries()].sort((a, b) => b[0] - a[0]),
    byOrganisation: [...byOrganisation.entries()].sort((a, b) => b[1] - a[1]),
  };
}
