/**
 * Split Excel — pure split-planning logic.
 *
 * The UI reads the workbook into plain arrays-of-arrays (one matrix per sheet)
 * and writes the resulting parts back out; every decision about WHAT goes into
 * WHICH file is made here so it can be tested without a browser.
 *
 * Rules implemented:
 *  - Worksheet names in the .xlsx format may be at most 31 characters and may
 *    not contain : \ / ? * [ ]  (Office Open XML / Excel worksheet-name rules),
 *    and may not be blank. Names are sanitised to satisfy this.
 *  - When the source sheet has a header row it is repeated at the top of every
 *    output sheet so each file keeps its column names.
 *  - "parts" mode distributes rows as evenly as possible: with R rows into N
 *    files, the first (R mod N) files get ceil(R/N) rows and the rest floor(R/N).
 */

/** Excel worksheet name limit (Office Open XML spec). */
export const MAX_SHEET_NAME = 31;

/** Characters Excel forbids in a worksheet name. */
export const FORBIDDEN_SHEET_CHARS = /[:\\/?*[\]]/g;

/** Cap on generated files so a browser tab cannot be flooded. */
export const MAX_PARTS = 300;

export const SPLIT_MODES = [
  { id: "sheets", label: "One file per worksheet" },
  { id: "rows", label: "Max rows per file" },
  { id: "parts", label: "Equal number of files" },
  { id: "column", label: "One file per column value" },
];

/**
 * Make a string safe to use as an Excel worksheet name.
 * @param {string} value
 * @returns {string} 1–31 characters, no forbidden characters.
 */
export function safeSheetName(value) {
  const cleaned = String(value ?? "")
    .replace(FORBIDDEN_SHEET_CHARS, "-")
    .replace(/\s+/g, " ")
    .trim();
  const trimmed = cleaned.slice(0, MAX_SHEET_NAME);
  return trimmed === "" ? "Sheet" : trimmed;
}

/**
 * Make a string safe to use as a download file name (no path separators).
 * @param {string} value
 */
export function safeFileName(value) {
  const cleaned = String(value ?? "")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned === "" ? "part" : cleaned.slice(0, 60);
}

/**
 * Distribute `total` rows into `parts` chunks of as-equal-as-possible size.
 * The first (total mod parts) chunks receive one extra row.
 * @returns {number[]}
 */
export function equalChunkSizes(total, parts) {
  const t = Math.trunc(Number(total));
  const p = Math.trunc(Number(parts));
  if (!Number.isFinite(t) || !Number.isFinite(p) || t <= 0 || p <= 0) return [];
  const base = Math.floor(t / p);
  const remainder = t % p;
  return Array.from({ length: p }, (_, i) => base + (i < remainder ? 1 : 0)).filter((n) => n > 0);
}

/**
 * Derive column labels for a sheet matrix.
 * @param {any[][]} matrix
 * @param {boolean} hasHeader
 * @returns {string[]}
 */
export function columnLabels(matrix, hasHeader) {
  const rows = Array.isArray(matrix) ? matrix : [];
  const width = rows.reduce((max, row) => Math.max(max, Array.isArray(row) ? row.length : 0), 0);
  if (hasHeader && rows.length > 0) {
    return Array.from({ length: width }, (_, i) => {
      const cell = rows[0][i];
      const text = String(cell ?? "").trim();
      return text === "" ? `Column ${i + 1}` : text;
    });
  }
  return Array.from({ length: width }, (_, i) => `Column ${i + 1}`);
}

/**
 * Plan the split of a workbook into parts.
 *
 * @param {object} input
 * @param {Array<{name: string, matrix: any[][]}>} input.sheets  Workbook sheets.
 * @param {number} [input.sheetIndex]  Which sheet to split in row/parts/column modes.
 * @param {boolean} [input.hasHeader]  First row of the sheet is a header.
 * @param {string} [input.mode]        SPLIT_MODES[].id.
 * @param {number} [input.rowsPerFile] Used when mode === "rows".
 * @param {number} [input.fileCount]   Used when mode === "parts".
 * @param {number} [input.columnIndex] Used when mode === "column".
 * @param {string} [input.baseName]    File name stem.
 * @returns {{parts: Array, partCount: number, totalRows: number, columns: string[]}|{error: string}}
 */
export function planExcelSplit({
  sheets,
  sheetIndex = 0,
  hasHeader = true,
  mode = "rows",
  rowsPerFile = 100,
  fileCount = 2,
  columnIndex = 0,
  baseName = "workbook",
}) {
  if (!Array.isArray(sheets) || sheets.length === 0) {
    return { error: "Upload an Excel or CSV workbook first." };
  }
  const stem = safeFileName(baseName);

  if (mode === "sheets") {
    const usable = sheets.filter((s) => Array.isArray(s.matrix) && s.matrix.length > 0);
    if (usable.length === 0) return { error: "Every worksheet in this workbook is empty." };
    const parts = usable.map((sheet, index) => ({
      index: index + 1,
      label: sheet.name,
      sheetName: safeSheetName(sheet.name),
      filename: `${stem}-${safeFileName(sheet.name)}.xlsx`,
      rowCount: sheet.matrix.length,
      matrix: sheet.matrix,
    }));
    return {
      parts,
      partCount: parts.length,
      totalRows: usable.reduce((sum, s) => sum + s.matrix.length, 0),
      columns: columnLabels(usable[0].matrix, hasHeader),
      mode,
      largestPart: parts.reduce((max, p) => Math.max(max, p.rowCount), 0),
      smallestPart: parts.reduce((min, p) => Math.min(min, p.rowCount), parts[0].rowCount),
    };
  }

  const idx = Math.trunc(Number(sheetIndex));
  const sheet = sheets[idx];
  if (!sheet || !Array.isArray(sheet.matrix)) return { error: "Choose a worksheet to split." };

  const matrix = sheet.matrix;
  if (matrix.length === 0) return { error: `Worksheet "${sheet.name}" is empty.` };

  const columns = columnLabels(matrix, hasHeader);
  const header = hasHeader ? matrix[0] : null;
  const dataRows = hasHeader ? matrix.slice(1) : matrix;
  const totalRows = dataRows.length;
  if (totalRows === 0) {
    return { error: `Worksheet "${sheet.name}" has a header row but no data rows to split.` };
  }

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
      groups.push({ label: `part-${groups.length + 1}`, rows: dataRows.slice(i, i + size) });
    }
  } else if (mode === "parts") {
    const count = Math.trunc(Number(fileCount));
    if (!Number.isFinite(count) || count < 1) {
      return { error: "Number of files must be a whole number of 1 or more." };
    }
    if (count > MAX_PARTS) return { error: `Number of files must be ${MAX_PARTS} or fewer.` };
    if (count > totalRows) {
      return {
        error: `Only ${totalRows} data row${totalRows === 1 ? "" : "s"} available — ask for ${totalRows} files or fewer.`,
      };
    }
    const sizes = equalChunkSizes(totalRows, count);
    groups = [];
    let cursor = 0;
    sizes.forEach((size, index) => {
      groups.push({ label: `part-${index + 1}`, rows: dataRows.slice(cursor, cursor + size) });
      cursor += size;
    });
  } else if (mode === "column") {
    const colIdx = Math.trunc(Number(columnIndex));
    if (!Number.isFinite(colIdx) || colIdx < 0 || colIdx >= columns.length) {
      return { error: "Choose a column that exists in this worksheet." };
    }
    const buckets = new Map();
    for (const row of dataRows) {
      const raw = String((row && row[colIdx]) ?? "").trim();
      const key = raw === "" ? "(blank)" : raw;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(row);
    }
    if (buckets.size > MAX_PARTS) {
      return {
        error: `Column "${columns[colIdx]}" has ${buckets.size} distinct values — that exceeds the ${MAX_PARTS} file limit. Pick a column with fewer values.`,
      };
    }
    groups = [...buckets.entries()].map(([key, rows]) => ({ label: key, rows }));
  } else {
    return { error: "Choose a split mode." };
  }

  if (groups.length === 0) return { error: "Nothing to split — no data rows were found." };

  const parts = groups.map((group, index) => ({
    index: index + 1,
    label: group.label,
    sheetName: safeSheetName(group.label),
    filename: `${stem}-${safeFileName(group.label)}.xlsx`,
    rowCount: group.rows.length,
    matrix: header ? [header, ...group.rows] : group.rows,
  }));

  return {
    parts,
    partCount: parts.length,
    totalRows,
    columns,
    mode,
    sourceSheet: sheet.name,
    largestPart: parts.reduce((max, p) => Math.max(max, p.rowCount), 0),
    smallestPart: parts.reduce((min, p) => Math.min(min, p.rowCount), parts[0].rowCount),
  };
}
