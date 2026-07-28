/**
 * Split CSV — pure splitting logic.
 *
 * Rules implemented (RFC 4180 CSV semantics, handled by PapaParse):
 *  - A CSV file is a header row (optional) followed by data records.
 *  - Splitting NEVER breaks a record: every output part is itself a valid CSV
 *    file, and when the source has a header row that header is repeated at the
 *    top of every part so each part opens correctly in a spreadsheet.
 *  - Three split modes:
 *      "rows"   — at most N data rows per part (last part holds the remainder).
 *      "parts"  — split into N parts of as-equal-as-possible size; the first
 *                 (total % N) parts get one extra row (ceil/floor distribution).
 *      "column" — one part per distinct value of a chosen column, values kept
 *                 in first-seen order.
 */

import Papa from "papaparse";

/** Guard against pathological browser memory use when fanning out parts. */
export const MAX_PARTS = 500;

/** Delimiters offered by the UI. "auto" lets PapaParse sniff the delimiter. */
export const DELIMITERS = [
  { id: "auto", label: "Auto-detect", value: "" },
  { id: "comma", label: "Comma  ,", value: "," },
  { id: "semicolon", label: "Semicolon  ;", value: ";" },
  { id: "tab", label: "Tab", value: "\t" },
  { id: "pipe", label: "Pipe  |", value: "|" },
];

export const SPLIT_MODES = [
  { id: "rows", label: "Max rows per file" },
  { id: "parts", label: "Equal number of files" },
  { id: "column", label: "One file per column value" },
];

/**
 * Parse CSV text into a header + data rows structure.
 *
 * @param {string} text        Raw CSV text.
 * @param {object} [options]
 * @param {string} [options.delimiterId] One of DELIMITERS[].id.
 * @param {boolean} [options.hasHeader]  Treat the first row as a header.
 * @returns {{header: string[]|null, rows: string[][], columns: string[], delimiter: string}|{error: string}}
 */
export function parseCsv(text, { delimiterId = "auto", hasHeader = true } = {}) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Paste or upload some CSV text first." };
  }
  const chosen = DELIMITERS.find((d) => d.id === delimiterId) ?? DELIMITERS[0];
  const parsed = Papa.parse(text.trim(), {
    header: false,
    delimiter: chosen.value,
    skipEmptyLines: "greedy",
  });

  const matrix = Array.isArray(parsed.data) ? parsed.data.filter((r) => Array.isArray(r)) : [];
  if (matrix.length === 0) return { error: "No rows found in this CSV." };

  const delimiter = parsed.meta && parsed.meta.delimiter ? parsed.meta.delimiter : ",";

  if (hasHeader) {
    const header = matrix[0].map((cell, index) => String(cell ?? "").trim() || `Column ${index + 1}`);
    const rows = matrix.slice(1);
    if (rows.length === 0) return { error: "This CSV has a header row but no data rows to split." };
    return { header, rows, columns: header, delimiter };
  }

  const width = matrix.reduce((max, row) => Math.max(max, row.length), 0);
  const columns = Array.from({ length: width }, (_, i) => `Column ${i + 1}`);
  return { header: null, rows: matrix, columns, delimiter };
}

/**
 * Distribute `total` rows into `parts` chunks of as-equal-as-possible size.
 * The first (total % parts) chunks receive one extra row.
 *
 * @returns {number[]} chunk sizes, or [] when inputs are unusable.
 */
export function equalChunkSizes(total, parts) {
  const t = Math.trunc(Number(total));
  const p = Math.trunc(Number(parts));
  if (!Number.isFinite(t) || !Number.isFinite(p) || t <= 0 || p <= 0) return [];
  const base = Math.floor(t / p);
  const remainder = t % p;
  return Array.from({ length: p }, (_, i) => base + (i < remainder ? 1 : 0)).filter((n) => n > 0);
}

function sanitiseName(value) {
  const cleaned = String(value ?? "")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned === "" ? "blank" : cleaned.slice(0, 60);
}

function buildCsv(header, rows, delimiter) {
  const data = header ? [header, ...rows] : rows;
  return Papa.unparse(data, { delimiter });
}

/**
 * Split CSV text into parts.
 *
 * @param {object} input
 * @param {string} input.text          Raw CSV text.
 * @param {string} [input.delimiterId] DELIMITERS[].id.
 * @param {boolean} [input.hasHeader]  First row is a header.
 * @param {string} [input.mode]        SPLIT_MODES[].id.
 * @param {number} [input.rowsPerFile] Used when mode === "rows".
 * @param {number} [input.fileCount]   Used when mode === "parts".
 * @param {number} [input.columnIndex] Used when mode === "column".
 * @param {string} [input.baseName]    Base filename without extension.
 * @returns {{parts: Array, totalRows: number, columns: string[], header: string[]|null}|{error: string}}
 */
export function splitCsv({
  text,
  delimiterId = "auto",
  hasHeader = true,
  mode = "rows",
  rowsPerFile = 100,
  fileCount = 2,
  columnIndex = 0,
  baseName = "split",
}) {
  const parsed = parseCsv(text, { delimiterId, hasHeader });
  if (parsed.error) return parsed;

  const { header, rows, columns, delimiter } = parsed;
  const totalRows = rows.length;
  const stem = sanitiseName(baseName) || "split";

  let groups;

  if (mode === "rows") {
    const size = Math.trunc(Number(rowsPerFile));
    if (!Number.isFinite(size) || size < 1) {
      return { error: "Rows per file must be a whole number of 1 or more." };
    }
    const partCount = Math.ceil(totalRows / size);
    if (partCount > MAX_PARTS) {
      return {
        error: `That would create ${partCount} files. Raise rows per file so the split stays under ${MAX_PARTS} files.`,
      };
    }
    groups = [];
    for (let i = 0; i < totalRows; i += size) {
      groups.push({ label: `part-${groups.length + 1}`, rows: rows.slice(i, i + size) });
    }
  } else if (mode === "parts") {
    const count = Math.trunc(Number(fileCount));
    if (!Number.isFinite(count) || count < 1) {
      return { error: "Number of files must be a whole number of 1 or more." };
    }
    if (count > MAX_PARTS) {
      return { error: `Number of files must be ${MAX_PARTS} or fewer.` };
    }
    if (count > totalRows) {
      return {
        error: `Only ${totalRows} data row${totalRows === 1 ? "" : "s"} available — ask for ${totalRows} files or fewer.`,
      };
    }
    const sizes = equalChunkSizes(totalRows, count);
    groups = [];
    let cursor = 0;
    sizes.forEach((size, index) => {
      groups.push({ label: `part-${index + 1}`, rows: rows.slice(cursor, cursor + size) });
      cursor += size;
    });
  } else if (mode === "column") {
    const idx = Math.trunc(Number(columnIndex));
    if (!Number.isFinite(idx) || idx < 0 || idx >= columns.length) {
      return { error: "Choose a column that exists in this CSV." };
    }
    const buckets = new Map();
    for (const row of rows) {
      const raw = String(row[idx] ?? "").trim();
      const key = raw === "" ? "(blank)" : raw;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(row);
    }
    if (buckets.size > MAX_PARTS) {
      return {
        error: `Column "${columns[idx]}" has ${buckets.size} distinct values — that exceeds the ${MAX_PARTS} file limit. Pick a column with fewer values.`,
      };
    }
    groups = [...buckets.entries()].map(([key, groupRows]) => ({
      label: sanitiseName(key),
      rows: groupRows,
    }));
  } else {
    return { error: "Choose a split mode." };
  }

  if (groups.length === 0) return { error: "Nothing to split — no data rows were found." };

  const parts = groups.map((group, index) => ({
    index: index + 1,
    label: group.label,
    filename: `${stem}-${group.label}.csv`,
    rowCount: group.rows.length,
    csv: buildCsv(header, group.rows, delimiter),
  }));

  return {
    parts,
    partCount: parts.length,
    totalRows,
    columns,
    header,
    delimiter,
    largestPart: parts.reduce((max, p) => Math.max(max, p.rowCount), 0),
    smallestPart: parts.reduce((min, p) => Math.min(min, p.rowCount), Infinity),
  };
}
