/**
 * Sports current-affairs revision tracker — pure list logic.
 *
 * Exam current-affairs sections repeatedly test "tournament — winner —
 * runner-up — venue — year". This module holds the row model, validation,
 * sorting, filtering, CSV export and summaries. Persistence and rendering
 * live in the UI layer.
 */

/** Sanity bounds for the year field. */
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;

export const FIELDS = [
  { key: "tournament", label: "Tournament", required: true },
  { key: "sport", label: "Sport", required: false },
  { key: "winner", label: "Winner", required: true },
  { key: "runnerUp", label: "Runner-up", required: false },
  { key: "venue", label: "Venue / host", required: false },
  { key: "year", label: "Year", required: true },
];

/**
 * Starter rows — widely reported, verifiable results shown as format
 * examples. Users edit or clear them.
 */
export const SEED_ENTRIES = [
  {
    id: 1,
    tournament: "ICC Men's Cricket World Cup",
    sport: "Cricket",
    winner: "Australia",
    runnerUp: "India",
    venue: "Narendra Modi Stadium, Ahmedabad",
    year: 2023,
  },
  {
    id: 2,
    tournament: "ICC Men's T20 World Cup",
    sport: "Cricket",
    winner: "India",
    runnerUp: "South Africa",
    venue: "Bridgetown, Barbados",
    year: 2024,
  },
  {
    id: 3,
    tournament: "World Chess Championship",
    sport: "Chess",
    winner: "Gukesh Dommaraju",
    runnerUp: "Ding Liren",
    venue: "Singapore",
    year: 2024,
  },
  {
    id: 4,
    tournament: "Summer Olympic Games",
    sport: "Multi-sport",
    winner: "United States (medal table)",
    runnerUp: "China",
    venue: "Paris, France",
    year: 2024,
  },
];

/** Validate and normalise a raw form entry. Returns { error } or { value }. */
export function normalizeEntry(entry) {
  const tournament = String(entry?.tournament ?? "").trim();
  const sport = String(entry?.sport ?? "").trim();
  const winner = String(entry?.winner ?? "").trim();
  const runnerUp = String(entry?.runnerUp ?? "").trim();
  const venue = String(entry?.venue ?? "").trim();
  const year = Number(entry?.year);

  if (tournament === "") return { error: "Tournament name is required." };
  if (winner === "") return { error: "Winner is required." };
  if (!Number.isFinite(year) || !Number.isInteger(year)) {
    return { error: "Year must be a whole number, e.g. 2024." };
  }
  if (year < MIN_YEAR || year > MAX_YEAR) {
    return { error: `Year must be between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }

  return { value: { tournament, sport, winner, runnerUp, venue, year } };
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
    [row.tournament, row.sport, row.winner, row.runnerUp, row.venue, String(row.year)]
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

/** Counts by year (descending) and by sport. */
export function summarize(list) {
  const byYear = new Map();
  const bySport = new Map();
  for (const row of list) {
    byYear.set(row.year, (byYear.get(row.year) ?? 0) + 1);
    const sport = row.sport && row.sport !== "" ? row.sport : "Unspecified";
    bySport.set(sport, (bySport.get(sport) ?? 0) + 1);
  }
  return {
    total: list.length,
    byYear: [...byYear.entries()].sort((a, b) => b[0] - a[0]),
    bySport: [...bySport.entries()].sort((a, b) => b[1] - a[1]),
  };
}
