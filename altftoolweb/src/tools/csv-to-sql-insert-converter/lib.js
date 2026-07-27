/**
 * CSV to SQL INSERT converter.
 *
 * CSV parsing follows RFC 4180: fields are separated by the delimiter, a field
 * may be enclosed in double quotes, a double quote inside a quoted field is
 * escaped by doubling it (""), and quoted fields may contain delimiters and
 * line breaks.
 *
 * SQL string escaping follows the SQL standard ('' escapes a quote). For MySQL
 * the backslash is additionally doubled because MySQL's default sql_mode treats
 * \ as an escape character inside string literals (MySQL manual, "String
 * Literals"). Identifier quoting per dialect: PostgreSQL/SQLite use "double
 * quotes" (SQL standard), MySQL uses `backticks`, SQL Server uses [brackets].
 */

export const DIALECTS = [
  { id: "postgres", label: "PostgreSQL" },
  { id: "mysql", label: "MySQL / MariaDB" },
  { id: "sqlite", label: "SQLite" },
  { id: "sqlserver", label: "SQL Server" },
];

/** Hard cap so a pasted 100 MB file cannot freeze the tab. */
export const MAX_ROWS = 20000;

/** Multi-row INSERT batch size bounds. */
export const MIN_BATCH = 1;
export const MAX_BATCH = 1000;

/**
 * Parse CSV text per RFC 4180.
 * @returns {{rows:string[][]}|{error:string}}
 */
export function parseCsv(text, delimiter = ",") {
  if (typeof text !== "string") return { error: "Paste CSV text to convert." };
  if (delimiter.length !== 1) return { error: "The delimiter must be a single character." };
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }
    if (ch === '"' && field === "") {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === delimiter) {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      field = "";
      // skip fully empty trailing lines
      if (!(row.length === 1 && row[0] === "")) rows.push(row);
      row = [];
      i += 1;
      continue;
    }
    field += ch;
    i += 1;
  }
  if (inQuotes) return { error: "Unterminated quoted field — a closing \" is missing." };
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (!(row.length === 1 && row[0] === "")) rows.push(row);
  }
  return { rows };
}

const INTEGER_RE = /^-?\d+$/;
const DECIMAL_RE = /^-?(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?$/;
const BOOLEAN_RE = /^(?:true|false)$/i;

/**
 * Infer a column type from its non-null sample values:
 * every value integer -> integer; every value numeric -> decimal;
 * every value true/false -> boolean; otherwise text.
 */
export function inferColumnType(values) {
  const samples = values.filter((value) => value !== null && value.trim() !== "");
  if (samples.length === 0) return "text";
  if (samples.every((value) => INTEGER_RE.test(value.trim()))) return "integer";
  if (samples.every((value) => DECIMAL_RE.test(value.trim()))) return "decimal";
  if (samples.every((value) => BOOLEAN_RE.test(value.trim()))) return "boolean";
  return "text";
}

/** Quote an identifier for the target dialect. */
export function quoteIdentifier(name, dialect) {
  if (dialect === "mysql") return `\`${name.replace(/`/g, "``")}\``;
  if (dialect === "sqlserver") return `[${name.replace(/\]/g, "]]")}]`;
  return `"${name.replace(/"/g, '""')}"`; // postgres, sqlite (SQL standard)
}

/** Render one CSV cell as a SQL literal of the inferred type. */
export function toSqlLiteral(raw, type, dialect, nullifyEmpty) {
  const value = raw ?? "";
  const trimmed = value.trim();
  if (trimmed === "" || /^null$/i.test(trimmed)) {
    if (nullifyEmpty || /^null$/i.test(trimmed)) return "NULL";
    // empty string kept as ''
    return "''";
  }
  if (type === "integer" || type === "decimal") return trimmed;
  if (type === "boolean") {
    const truthy = /^true$/i.test(trimmed);
    // SQLite and SQL Server have no TRUE/FALSE literals; use 1/0 there.
    if (dialect === "sqlite" || dialect === "sqlserver") return truthy ? "1" : "0";
    return truthy ? "TRUE" : "FALSE";
  }
  let escaped = value.replace(/'/g, "''");
  if (dialect === "mysql") escaped = escaped.replace(/\\/g, "\\\\");
  return `'${escaped}'`;
}

/** Default column names when the CSV has no header row: col_1, col_2, … */
export function defaultColumnName(index) {
  return `col_${index + 1}`;
}

/**
 * Convert CSV text into INSERT statements.
 *
 * @param {object} input
 * @param {string} input.csv
 * @param {string} input.tableName
 * @param {"postgres"|"mysql"|"sqlite"|"sqlserver"} input.dialect
 * @param {boolean} input.hasHeader     first row holds column names
 * @param {number}  input.batchSize     rows per multi-row INSERT (1–1000)
 * @param {boolean} input.nullifyEmpty  empty cells become NULL instead of ''
 * @param {string}  [input.delimiter]
 * @returns {{sql:string, rowCount:number, statements:number, columns:Array<{name:string,type:string}>, warnings:string[]}|{error:string}}
 */
export function convertCsvToInserts({
  csv,
  tableName = "my_table",
  dialect = "postgres",
  hasHeader = true,
  batchSize = 100,
  nullifyEmpty = true,
  delimiter = ",",
}) {
  if (typeof csv !== "string" || csv.trim() === "") {
    return { error: "Paste CSV text to convert." };
  }
  if (typeof tableName !== "string" || tableName.trim() === "") {
    return { error: "Enter a table name." };
  }
  if (!DIALECTS.some((option) => option.id === dialect)) {
    return { error: "Choose a SQL dialect." };
  }
  const batch = Number(batchSize);
  if (!Number.isInteger(batch) || batch < MIN_BATCH || batch > MAX_BATCH) {
    return { error: `Batch size must be a whole number between ${MIN_BATCH} and ${MAX_BATCH}.` };
  }

  const parsed = parseCsv(csv, delimiter);
  if (parsed.error) return { error: parsed.error };
  const allRows = parsed.rows;
  if (allRows.length === 0) return { error: "The CSV contains no rows." };
  if (allRows.length > MAX_ROWS) {
    return { error: `Too many rows — the converter caps at ${MAX_ROWS.toLocaleString()} rows per run.` };
  }

  const warnings = [];
  let columnNames;
  let dataRows;
  if (hasHeader) {
    columnNames = allRows[0].map((name, index) =>
      name.trim() === "" ? defaultColumnName(index) : name.trim(),
    );
    dataRows = allRows.slice(1);
    if (dataRows.length === 0) return { error: "The CSV has a header row but no data rows." };
  } else {
    const widest = Math.max(...allRows.map((row) => row.length));
    columnNames = Array.from({ length: widest }, (_, index) => defaultColumnName(index));
    dataRows = allRows;
  }

  const columnCount = columnNames.length;
  const normalized = dataRows.map((row, rowIndex) => {
    if (row.length < columnCount) {
      warnings.push(
        `Row ${rowIndex + 1} has ${row.length} of ${columnCount} fields — missing cells written as NULL.`,
      );
      return [...row, ...Array(columnCount - row.length).fill(null)];
    }
    if (row.length > columnCount) {
      warnings.push(
        `Row ${rowIndex + 1} has ${row.length} fields but the header defines ${columnCount} — extras dropped.`,
      );
      return row.slice(0, columnCount);
    }
    return row;
  });

  const columns = columnNames.map((name, index) => ({
    name,
    type: inferColumnType(normalized.map((row) => row[index] ?? null)),
  }));

  const table = quoteIdentifier(tableName.trim(), dialect);
  const columnList = columns.map((column) => quoteIdentifier(column.name, dialect)).join(", ");

  const statements = [];
  for (let start = 0; start < normalized.length; start += batch) {
    const chunk = normalized.slice(start, start + batch);
    const tuples = chunk.map(
      (row) =>
        `(${columns
          .map((column, index) => toSqlLiteral(row[index], column.type, dialect, nullifyEmpty))
          .join(", ")})`,
    );
    statements.push(`INSERT INTO ${table} (${columnList})\nVALUES\n  ${tuples.join(",\n  ")};`);
  }

  return {
    sql: statements.join("\n\n"),
    rowCount: normalized.length,
    statements: statements.length,
    columns,
    warnings: warnings.slice(0, 20),
  };
}
