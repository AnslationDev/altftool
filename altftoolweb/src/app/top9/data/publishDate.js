/**
 * Turns a human date string from the list data ("May 11, 2026") into a calendar
 * date (YYYY-MM-DD) for `datePublished` and `<time dateTime>`.
 *
 * Deliberately not `new Date(value).toISOString()`: that parses the string at
 * local midnight and then serialises in UTC, which shifts the date back a day
 * in every timezone east of UTC and puts a machine-readable date in the markup
 * that disagrees with the date shown to the reader.
 *
 * Returns null when the source carries no usable date. Callers must render
 * nothing in that case — never a build date, never a fallback.
 */
export function toPublishDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;

  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${parsed.getFullYear()}-${month}-${day}`;
}
