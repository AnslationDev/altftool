/**
 * CSV converter — pure logic.
 *
 * Parsing follows RFC 4180: fields separated by a delimiter, records separated
 * by CRLF or LF, any field may be wrapped in double quotes, and a literal
 * double quote inside a quoted field is written as two double quotes ("").
 * Quoted fields may contain the delimiter and line breaks.
 *
 * Output targets: JSON, an HTML table, XML, SQL INSERT statements and a Python
 * list of dicts. Every target escapes according to its own rules.
 */

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

/** Delimiters offered. Tab-separated files are the common non-comma case. */
export const DELIMITERS = [
  { key: "comma", label: "Comma ( , )", value: "," },
  { key: "semicolon", label: "Semicolon ( ; )", value: ";" },
  { key: "tab", label: "Tab", value: "\t" },
  { key: "pipe", label: "Pipe ( | )", value: "|" },
];

/** Output formats this tool can produce. */
export const OUTPUT_FORMATS = [
  { key: "json", label: "JSON", extension: "json" },
  { key: "html", label: "HTML table", extension: "html" },
  { key: "xml", label: "XML", extension: "xml" },
  { key: "sql", label: "SQL INSERT", extension: "sql" },
  { key: "python", label: "Python dicts", extension: "py" },
];

/** RFC 4180 quoting characters. */
export const QUOTE_CHAR = '"';
export const ESCAPED_QUOTE = '""';

/** Guard against a paste large enough to lock the tab up. */
export const MAX_ROWS = 20000;
export const MAX_INPUT_CHARS = 4000000; // ~4 MB of text

/** Default names used when a column header is blank or the file has none. */
export const FALLBACK_COLUMN_PREFIX = "column_";
export const DEFAULT_TABLE_NAME = "my_table";
export const DEFAULT_XML_ROOT = "rows";
export const DEFAULT_XML_ROW = "row";

/** Values treated as booleans when type inference is on. */
export const TRUE_LITERALS = new Set(["true", "yes"]);
export const FALSE_LITERALS = new Set(["false", "no"]);

/** A number literal for inference purposes: optional sign, digits, optional decimals/exponent. */
const NUMBER_RE = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;

/* ------------------------------------------------------------------ */
/* Parsing                                                             */
/* ------------------------------------------------------------------ */

/**
 * Parse RFC 4180 CSV text into a matrix of strings.
 * Returns { error } for unterminated quotes or oversized input.
 */
export function parseCsvMatrix(text, delimiter = ",") {
  const source = String(text == null ? "" : text);
  if (!source.trim()) return { error: "Paste some CSV data to convert." };
  if (source.length > MAX_INPUT_CHARS) {
    return { error: `Input is too large — keep it under ${MAX_INPUT_CHARS / 1000000} MB.` };
  }
  const sep = String(delimiter || ",");
  if (sep.length !== 1) return { error: "The delimiter must be a single character." };
  if (sep === QUOTE_CHAR) return { error: 'A double quote cannot be used as the delimiter.' };

  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];

    if (inQuotes) {
      if (char === QUOTE_CHAR) {
        if (source[i + 1] === QUOTE_CHAR) {
          field += QUOTE_CHAR;
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === QUOTE_CHAR) {
      inQuotes = true;
      continue;
    }
    if (char === sep) {
      row.push(field);
      field = "";
      continue;
    }
    if (char === "\r") {
      // CRLF and a bare CR both end the record.
      if (source[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    field += char;
  }

  if (inQuotes) {
    return { error: 'Unterminated quote — a field opens with " and is never closed.' };
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop a trailing blank record produced by a final newline.
  const cleaned = rows.filter(
    (record, index) => !(index === rows.length - 1 && record.length === 1 && record[0] === ""),
  );

  if (cleaned.length === 0) return { error: "No records found in that input." };
  if (cleaned.length > MAX_ROWS) {
    return { error: `That is ${cleaned.length} records — this tool handles up to ${MAX_ROWS}.` };
  }
  return { matrix: cleaned };
}

function sanitiseColumnName(name, index) {
  const trimmed = String(name == null ? "" : name).trim();
  if (!trimmed) return `${FALLBACK_COLUMN_PREFIX}${index + 1}`;
  return trimmed;
}

/**
 * Turn CSV text into { headers, records } where each record is an array of
 * strings padded to the header width.
 */
export function parseCsv(text, { delimiter = ",", hasHeader = true, trimFields = true } = {}) {
  const parsed = parseCsvMatrix(text, delimiter);
  if (parsed.error) return parsed;

  const matrix = trimFields
    ? parsed.matrix.map((row) => row.map((cell) => cell.trim()))
    : parsed.matrix;

  const width = matrix.reduce((max, row) => Math.max(max, row.length), 0);
  if (width === 0) return { error: "No columns found in that input." };

  let headers;
  let body;
  if (hasHeader) {
    if (matrix.length < 2) {
      return { error: "Only a header row was found — add at least one data row." };
    }
    headers = Array.from({ length: width }, (_, index) =>
      sanitiseColumnName(matrix[0][index], index),
    );
    body = matrix.slice(1);
  } else {
    headers = Array.from({ length: width }, (_, index) => `${FALLBACK_COLUMN_PREFIX}${index + 1}`);
    body = matrix;
  }

  // De-duplicate header names so object keys and SQL columns stay unique.
  const seen = new Map();
  headers = headers.map((name) => {
    const count = seen.get(name) || 0;
    seen.set(name, count + 1);
    return count === 0 ? name : `${name}_${count + 1}`;
  });

  let ragged = 0;
  const records = body.map((row) => {
    if (row.length !== width) ragged += 1;
    return Array.from({ length: width }, (_, index) => (row[index] === undefined ? "" : row[index]));
  });

  return { headers, records, columnCount: width, rowCount: records.length, ragged };
}

/* ------------------------------------------------------------------ */
/* Type inference                                                      */
/* ------------------------------------------------------------------ */

/** Convert a raw CSV cell into a JS value: number, boolean, null or string. */
export function inferValue(raw) {
  const text = String(raw == null ? "" : raw);
  if (text.trim() === "") return null;
  const lower = text.trim().toLowerCase();
  if (TRUE_LITERALS.has(lower)) return true;
  if (FALSE_LITERALS.has(lower)) return false;
  if (NUMBER_RE.test(text.trim())) {
    const value = Number(text.trim());
    // Never hand back Infinity from an overflowing literal.
    if (Number.isFinite(value)) return value;
  }
  return text;
}

/** Build an array of plain objects from a parsed CSV. */
export function toObjects({ headers, records }, inferTypes = true) {
  return records.map((row) => {
    const object = {};
    headers.forEach((header, index) => {
      object[header] = inferTypes ? inferValue(row[index]) : row[index];
    });
    return object;
  });
}

/* ------------------------------------------------------------------ */
/* Escaping helpers                                                    */
/* ------------------------------------------------------------------ */

/** Escape the five characters that matter in HTML text and attributes. */
export function escapeHtml(text) {
  return String(text == null ? "" : text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Escape XML character data. XML has no &apos; problem in text nodes. */
export function escapeXml(text) {
  return String(text == null ? "" : text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Make a legal XML element name: letters, digits, hyphen, underscore and dot,
 * never starting with a digit or the letters "xml".
 */
export function toXmlName(name, fallbackIndex = 0) {
  let cleaned = String(name == null ? "" : name)
    .trim()
    .replace(/[^\w.-]/g, "_");
  if (!cleaned) cleaned = `${FALLBACK_COLUMN_PREFIX}${fallbackIndex + 1}`;
  if (/^[\d.-]/.test(cleaned)) cleaned = `_${cleaned}`;
  if (/^xml/i.test(cleaned)) cleaned = `_${cleaned}`;
  return cleaned;
}

/** Make a safe SQL identifier: snake_case ASCII, never starting with a digit. */
export function toSqlIdentifier(name, fallbackIndex = 0) {
  let cleaned = String(name == null ? "" : name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!cleaned) cleaned = `${FALLBACK_COLUMN_PREFIX}${fallbackIndex + 1}`;
  if (/^\d/.test(cleaned)) cleaned = `_${cleaned}`;
  return cleaned;
}

/** SQL literal: numbers bare, empty cells NULL, everything else single-quoted with '' escaping. */
export function toSqlLiteral(raw, inferTypes = true) {
  const text = String(raw == null ? "" : raw).trim();
  if (text === "") return "NULL";
  if (inferTypes && NUMBER_RE.test(text) && Number.isFinite(Number(text))) return text;
  return `'${text.replace(/'/g, "''")}'`;
}

/** Python literal for a cell. */
export function toPythonLiteral(raw, inferTypes = true) {
  const value = inferTypes ? inferValue(raw) : String(raw == null ? "" : raw);
  if (value === null) return "None";
  if (value === true) return "True";
  if (value === false) return "False";
  if (typeof value === "number") return String(value);
  // A CSV field may legally contain a newline; a Python string literal may not,
  // so it is escaped rather than emitted raw.
  return `"${String(value)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t")}"`;
}

/* ------------------------------------------------------------------ */
/* Writers                                                             */
/* ------------------------------------------------------------------ */

function writeJson(parsed, options) {
  const objects = toObjects(parsed, options.inferTypes);
  return options.pretty ? JSON.stringify(objects, null, 2) : JSON.stringify(objects);
}

function writeHtml(parsed) {
  const head = parsed.headers.map((h) => `      <th>${escapeHtml(h)}</th>`).join("\n");
  const body = parsed.records
    .map(
      (row) =>
        `    <tr>\n${row.map((cell) => `      <td>${escapeHtml(cell)}</td>`).join("\n")}\n    </tr>`,
    )
    .join("\n");
  return `<table>\n  <thead>\n    <tr>\n${head}\n    </tr>\n  </thead>\n  <tbody>\n${body}\n  </tbody>\n</table>`;
}

function writeXml(parsed, options) {
  const root = toXmlName(options.rootName || DEFAULT_XML_ROOT);
  const rowName = toXmlName(options.rowName || DEFAULT_XML_ROW);
  const names = parsed.headers.map((header, index) => toXmlName(header, index));
  const body = parsed.records
    .map((row) => {
      const cells = row
        .map((cell, index) => `    <${names[index]}>${escapeXml(cell)}</${names[index]}>`)
        .join("\n");
      return `  <${rowName}>\n${cells}\n  </${rowName}>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${root}>\n${body}\n</${root}>`;
}

function writeSql(parsed, options) {
  const table = toSqlIdentifier(options.tableName || DEFAULT_TABLE_NAME);
  const columns = parsed.headers.map((header, index) => toSqlIdentifier(header, index));
  const columnList = columns.join(", ");
  return parsed.records
    .map((row) => {
      const values = row.map((cell) => toSqlLiteral(cell, options.inferTypes)).join(", ");
      return `INSERT INTO ${table} (${columnList}) VALUES (${values});`;
    })
    .join("\n");
}

function writePython(parsed, options) {
  const rows = parsed.records
    .map((row) => {
      const pairs = parsed.headers
        .map((header, index) => `"${header.replace(/"/g, '\\"')}": ${toPythonLiteral(row[index], options.inferTypes)}`)
        .join(", ");
      return `    {${pairs}},`;
    })
    .join("\n");
  return `data = [\n${rows}\n]`;
}

/* ------------------------------------------------------------------ */
/* Public entry point                                                  */
/* ------------------------------------------------------------------ */

/**
 * Convert CSV text into the requested format.
 *
 * @param {string} text CSV source
 * @param {"json"|"html"|"xml"|"sql"|"python"} format
 * @param {object} options delimiter, hasHeader, trimFields, inferTypes, pretty,
 *                         tableName, rootName, rowName
 */
export function convertCsv(text, format = "json", options = {}) {
  const settings = {
    delimiter: ",",
    hasHeader: true,
    trimFields: true,
    inferTypes: true,
    pretty: true,
    tableName: DEFAULT_TABLE_NAME,
    rootName: DEFAULT_XML_ROOT,
    rowName: DEFAULT_XML_ROW,
    ...options,
  };

  const known = OUTPUT_FORMATS.some((entry) => entry.key === format);
  if (!known) {
    return { error: `Unknown output format "${format}".` };
  }

  const parsed = parseCsv(text, settings);
  if (parsed.error) return parsed;
  if (parsed.rowCount === 0) return { error: "No data rows found — only a header was supplied." };

  let output;
  if (format === "json") output = writeJson(parsed, settings);
  else if (format === "html") output = writeHtml(parsed);
  else if (format === "xml") output = writeXml(parsed, settings);
  else if (format === "sql") output = writeSql(parsed, settings);
  else output = writePython(parsed, settings);

  return {
    format,
    output,
    headers: parsed.headers,
    preview: parsed.records.slice(0, 5),
    rowCount: parsed.rowCount,
    columnCount: parsed.columnCount,
    ragged: parsed.ragged,
    cellCount: parsed.rowCount * parsed.columnCount,
    outputChars: output.length,
  };
}
