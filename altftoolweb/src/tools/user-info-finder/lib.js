/**
 * User Info Finder — a local directory search over a list of people you supply.
 *
 * IMPORTANT
 * ---------
 * This does not look anyone up. There is no people-search API behind it, no
 * profile scraping and no network call of any kind. You paste or upload your
 * own records — a CSV export from a CRM, an admin panel, a support tool, a JSON
 * dump — and this parses them, works out what each column holds, and then lets
 * you search and filter them fast. Nothing about a person is ever invented: if
 * a field is not in your data, it does not appear.
 *
 * Everything here is pure. No DOM, no fetch, no clock, no randomness — the same
 * data and the same query always produce the same rows in the same order.
 */

/* -------------------------------------------------------------------------- */
/* Parsing                                                                    */
/* -------------------------------------------------------------------------- */

export const DELIMITERS = [
  { char: ",", label: "comma" },
  { char: "\t", label: "tab" },
  { char: ";", label: "semicolon" },
  { char: "|", label: "pipe" },
];

export const MAX_ROWS = 20000;

/** Count a delimiter in a line, ignoring anything inside double quotes. */
function countOutsideQuotes(line, char) {
  let inQuotes = false;
  let count = 0;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && c === char) count += 1;
  }
  return count;
}

/**
 * The first logical row of the text, respecting quotes — unlike a naive
 * `split("\n")[0]`, this does not stop early when the first field is a
 * quoted value that itself contains a literal newline.
 */
function firstLogicalLine(text) {
  const source = String(text == null ? "" : text);
  let inQuotes = false;
  for (let i = 0; i < source.length; i += 1) {
    const c = source[i];
    if (c === '"') {
      if (inQuotes && source[i + 1] === '"') {
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && c === "\n") {
      return source.slice(0, i).replace(/\r$/, "");
    }
  }
  return source.replace(/\r$/, "");
}

export function detectDelimiter(text) {
  const firstLine = firstLogicalLine(text);
  let best = DELIMITERS[0];
  let bestCount = 0;
  for (const candidate of DELIMITERS) {
    const count = countOutsideQuotes(firstLine, candidate.char);
    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  }
  return { delimiter: best.char, label: best.label, count: bestCount };
}

/** RFC 4180 style reader: quoted fields, "" escapes, newlines inside quotes. */
export function parseDelimited(text, delimiter) {
  const source = String(text == null ? "" : text);
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let touched = false;

  for (let i = 0; i < source.length; i += 1) {
    const c = source[i];
    if (inQuotes) {
      if (c === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      touched = true;
      continue;
    }
    if (c === delimiter) {
      row.push(field);
      field = "";
      touched = true;
      continue;
    }
    if (c === "\r") continue;
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      touched = false;
      continue;
    }
    field += c;
    touched = true;
  }
  if (touched || field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return { rows, unterminatedQuote: inQuotes };
}

function uniqueHeaders(rawHeaders) {
  const seen = new Map();
  const notes = [];
  const columns = rawHeaders.map((raw, index) => {
    let name = String(raw == null ? "" : raw).trim();
    if (name === "") {
      name = `column_${index + 1}`;
      notes.push(`Column ${index + 1} had no header, so it is called "${name}".`);
    }
    if (seen.has(name)) {
      const next = seen.get(name) + 1;
      seen.set(name, next);
      const renamed = `${name}_${next}`;
      notes.push(`Header "${name}" appeared more than once; the later one is called "${renamed}".`);
      return renamed;
    }
    seen.set(name, 1);
    return name;
  });
  return { columns, notes };
}

function normaliseValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return value.map(normaliseValue).filter(Boolean).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function parseJsonRecords(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    return { error: `That is not valid JSON: ${err.message}` };
  }
  let list = data;
  if (!Array.isArray(list) && data && typeof data === "object") {
    const key = ["users", "records", "data", "results", "items", "rows"].find((candidate) =>
      Array.isArray(data[candidate]),
    );
    if (key) list = data[key];
  }
  if (!Array.isArray(list)) {
    return { error: "JSON input must be an array of objects, or an object with a users/records/data array." };
  }
  if (list.length === 0) return { error: "The JSON array is empty — there are no records to search." };

  const columns = [];
  for (const entry of list) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return { error: "Every item in the JSON array must be an object with named fields." };
    }
    for (const key of Object.keys(entry)) {
      if (!columns.includes(key)) columns.push(key);
    }
  }
  const rows = list.slice(0, MAX_ROWS).map((entry, index) => {
    const record = { __id: index };
    for (const column of columns) record[column] = normaliseValue(entry[column]);
    return record;
  });
  return { columns, rows, format: "json", notes: [], truncated: list.length > MAX_ROWS, totalSeen: list.length };
}

/**
 * Accepts a CSV/TSV/semicolon/pipe table with a header row, or a JSON array of
 * objects. Returns { columns, rows } or { error }.
 */
export function parseRecords(text) {
  const source = String(text == null ? "" : text).trim();
  if (source === "") {
    return { error: "Paste a CSV export or a JSON array of records to search." };
  }
  if (source.startsWith("[") || source.startsWith("{")) {
    return parseJsonRecords(source);
  }

  const detected = detectDelimiter(source);
  if (detected.count === 0) {
    return {
      error:
        "No column separator found on the first line. A CSV needs a header row such as name,email,city — or paste JSON instead.",
    };
  }

  const parsed = parseDelimited(source, detected.delimiter);
  if (parsed.unterminatedQuote) {
    return { error: 'A quoted field is never closed — there is an odd number of " characters.' };
  }
  const grid = parsed.rows.filter((row) => !(row.length === 1 && row[0].trim() === ""));
  if (grid.length < 2) {
    return { error: "Found a header row but no data rows underneath it." };
  }

  const { columns, notes } = uniqueHeaders(grid[0]);
  const body = grid.slice(1);
  let ragged = 0;
  const rows = body.slice(0, MAX_ROWS).map((cells, index) => {
    if (cells.length !== columns.length) ragged += 1;
    const record = { __id: index };
    columns.forEach((column, columnIndex) => {
      record[column] = String(cells[columnIndex] == null ? "" : cells[columnIndex]).trim();
    });
    return record;
  });
  if (ragged > 0) {
    notes.push(
      `${ragged} row${ragged === 1 ? "" : "s"} did not have ${columns.length} fields. Missing fields are blank; extra fields were dropped.`,
    );
  }

  return {
    columns,
    rows,
    format: detected.label === "comma" ? "csv" : `${detected.label}-separated`,
    delimiter: detected.delimiter,
    notes,
    truncated: body.length > MAX_ROWS,
    totalSeen: body.length,
  };
}

/* -------------------------------------------------------------------------- */
/* Column typing                                                              */
/* -------------------------------------------------------------------------- */

export const COLUMN_TYPES = [
  { key: "email", label: "Email", test: (v) => /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/.test(v) },
  { key: "url", label: "URL", test: (v) => /^(?:https?:\/\/|www\.)[^\s]+$/i.test(v) },
  // Dates are tested before phones: 2023-04-11 also fits a loose phone shape.
  { key: "date", label: "Date", test: (v) => /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2})?)?$/.test(v) },
  {
    key: "phone",
    label: "Phone",
    test: (v) => {
      if (/^\d{4}-\d{2}-\d{2}/.test(v)) return false;
      if (!/^\+?[\d][\d\s().-]{5,}$/.test(v)) return false;
      const digits = v.replace(/\D/g, "").length;
      return digits >= 7 && digits <= 15;
    },
  },
  { key: "boolean", label: "Yes / no", test: (v) => /^(true|false|yes|no)$/i.test(v) },
  { key: "number", label: "Number", test: (v) => /^-?\d+(?:\.\d+)?$/.test(v) },
];

/** A column takes a type when at least this share of its filled values match. */
export const TYPE_CONFIDENCE = 0.8;

export function profileColumns(columns, rows) {
  return columns.map((column) => {
    const values = rows.map((row) => String(row[column] == null ? "" : row[column]).trim());
    const filled = values.filter((value) => value !== "");
    const distinct = new Set(filled);

    let type = "text";
    let invalid = [];
    if (filled.length > 0) {
      for (const candidate of COLUMN_TYPES) {
        const matches = filled.filter((value) => candidate.test(value));
        if (matches.length / filled.length >= TYPE_CONFIDENCE) {
          type = candidate.key;
          invalid = filled.filter((value) => !candidate.test(value));
          break;
        }
      }
    }

    return {
      column,
      type,
      typeLabel: (COLUMN_TYPES.find((item) => item.key === type) || { label: "Text" }).label,
      filled: filled.length,
      empty: values.length - filled.length,
      distinct: distinct.size,
      invalid,
      invalidCount: invalid.length,
    };
  });
}

/** Distinct values with real counts, for columns small enough to filter on. */
export const MAX_FACET_VALUES = 25;

export function buildFacets(columns, rows, maxValues = MAX_FACET_VALUES) {
  const facets = [];
  for (const column of columns) {
    const counts = new Map();
    for (const row of rows) {
      const value = String(row[column] == null ? "" : row[column]).trim();
      if (value === "") continue;
      counts.set(value, (counts.get(value) || 0) + 1);
    }
    // Only offer a column as a filter when it actually groups rows together:
    // a column where every value is unique is a search target, not a facet.
    const repeats = [...counts.values()].some((count) => count > 1);
    if (counts.size === 0 || counts.size > maxValues || !repeats) continue;
    const values = [...counts.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
    facets.push({ column, values });
  }
  return facets;
}

/* -------------------------------------------------------------------------- */
/* Query language                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Supported forms:
 *   bare word            match anywhere in any field
 *   "two words"          match the phrase anywhere
 *   field:value          match inside that one field
 *   field:"two words"    same, phrased
 *   -word / -field:value exclude rows that match
 */
/** Split on whitespace, but keep "quoted spans" together. */
export function tokeniseQuery(query) {
  const source = String(query == null ? "" : query);
  const tokens = [];
  let current = "";
  let inQuotes = false;
  for (const char of source) {
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
      continue;
    }
    if (!inQuotes && /\s/.test(char)) {
      if (current !== "") tokens.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  if (current !== "") tokens.push(current);
  return tokens;
}

/**
 * @param {string} query
 * @param {string[]} [columns] Known field names. When given, a `word:rest`
 *   token is only treated as field syntax when `word` actually names one of
 *   these columns (case-insensitively) — otherwise the colon is just part of
 *   the searched text (a time like "10:30", a URL, a score like "3:2", etc.)
 *   and the whole token is matched as a bare/plain value instead.
 */
export function parseQuery(query, columns) {
  const knownFields = Array.isArray(columns) ? columns.map((column) => String(column).toLowerCase()) : null;
  const terms = [];
  for (const rawToken of tokeniseQuery(query)) {
    let token = rawToken;
    let negated = false;
    if (token.startsWith("-") && token.length > 1) {
      negated = true;
      token = token.slice(1);
    }

    let field = null;
    const colon = token.indexOf(":");
    if (colon > 0 && !token.slice(0, colon).includes('"')) {
      const candidateField = token.slice(0, colon).trim();
      if (!knownFields || knownFields.includes(candidateField.toLowerCase())) {
        field = candidateField;
        token = token.slice(colon + 1);
      }
    }

    let phrase = false;
    if (token.length >= 2 && token.startsWith('"') && token.endsWith('"')) {
      phrase = true;
      token = token.slice(1, -1);
    } else {
      token = token.replace(/"/g, "");
    }

    const value = token.trim();
    if (value === "") continue;
    terms.push({ negated, field: field || null, value, phrase });
  }
  return terms;
}

/* -------------------------------------------------------------------------- */
/* Matching and ranking                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Fixed, published weights. These are the only numbers the ranking uses; there
 * is no learned model and no random tie-break.
 */
export const MATCH_WEIGHTS = [
  { key: "exact", score: 100, label: "field is exactly the term" },
  { key: "prefix", score: 60, label: "field starts with the term" },
  { key: "word", score: 40, label: "a word in the field starts with the term" },
  { key: "contains", score: 20, label: "the term appears somewhere in the field" },
];

const SCORE = Object.fromEntries(MATCH_WEIGHTS.map((item) => [item.key, item.score]));

function matchValue(value, needle) {
  const haystack = value.toLowerCase();
  const term = needle.toLowerCase();
  if (haystack === "") return null;
  if (haystack === term) return { kind: "exact", score: SCORE.exact };
  if (haystack.startsWith(term)) return { kind: "prefix", score: SCORE.prefix };
  const words = haystack.split(/[\s,;/@._-]+/).filter(Boolean);
  if (words.some((word) => word.startsWith(term))) return { kind: "word", score: SCORE.word };
  if (haystack.includes(term)) return { kind: "contains", score: SCORE.contains };
  return null;
}

function bestMatchForTerm(row, columns, term) {
  const searchable = term.field
    ? columns.filter((column) => column.toLowerCase() === term.field.toLowerCase())
    : columns;
  let best = null;
  for (const column of searchable) {
    const hit = matchValue(String(row[column] == null ? "" : row[column]), term.value);
    if (hit && (!best || hit.score > best.score)) best = { ...hit, column };
  }
  return best;
}

function compareValues(a, b, type) {
  // Blank cells always sort last, regardless of column type — checked first
  // so a numeric column doesn't treat "" as Number("") === 0, a legitimate
  // comparable value, ahead of this rule.
  if (a === "" && b !== "") return 1;
  if (b === "" && a !== "") return -1;
  if (a === "" && b === "") return 0;
  if (type === "number") {
    const na = Number(a);
    const nb = Number(b);
    const aOk = Number.isFinite(na);
    const bOk = Number.isFinite(nb);
    if (aOk && bOk) return na - nb;
    if (aOk) return -1;
    if (bOk) return 1;
    return String(a).localeCompare(String(b));
  }
  return String(a).localeCompare(String(b), undefined, { numeric: type === "date", sensitivity: "base" });
}

export const DEFAULT_PAGE_SIZE = 25;

/**
 * @param {object} input
 * @param {string[]} input.columns
 * @param {object[]} input.rows
 * @param {string}  [input.query]
 * @param {object}  [input.filters]   { column: [allowed values] }
 * @param {string}  [input.sortBy]    'relevance' or a column name
 * @param {string}  [input.sortDir]   'asc' | 'desc'
 * @param {number}  [input.page]      1-based
 * @param {number}  [input.pageSize]
 * @returns {{error:string}|object}
 */
export function searchRecords(input) {
  const source = input && typeof input === "object" ? input : {};
  const columns = Array.isArray(source.columns) ? source.columns : null;
  const rows = Array.isArray(source.rows) ? source.rows : null;
  if (!columns || columns.length === 0) return { error: "No columns to search — load some records first." };
  if (!rows) return { error: "No records to search — load some records first." };

  const terms = parseQuery(source.query, columns);
  const unknownField = terms
    .filter((term) => term.field)
    .map((term) => term.field)
    .find((field) => !columns.some((column) => column.toLowerCase() === field.toLowerCase()));
  if (unknownField) {
    return { error: `There is no field called "${unknownField}". Available fields: ${columns.join(", ")}.` };
  }

  const filters = source.filters && typeof source.filters === "object" ? source.filters : {};
  for (const key of Object.keys(filters)) {
    if (!columns.includes(key)) return { error: `Cannot filter on "${key}" — that column is not in the data.` };
  }

  const pageSize = Number.isFinite(Number(source.pageSize)) && Number(source.pageSize) > 0
    ? Math.floor(Number(source.pageSize))
    : DEFAULT_PAGE_SIZE;

  const positives = terms.filter((term) => !term.negated);
  const negatives = terms.filter((term) => term.negated);

  const matched = [];
  for (const row of rows) {
    let excluded = false;
    for (const key of Object.keys(filters)) {
      const allowed = filters[key];
      if (!Array.isArray(allowed) || allowed.length === 0) continue;
      if (!allowed.includes(String(row[key] == null ? "" : row[key]).trim())) {
        excluded = true;
        break;
      }
    }
    if (excluded) continue;

    if (negatives.some((term) => bestMatchForTerm(row, columns, term))) continue;

    let score = 0;
    const hits = [];
    let missing = false;
    for (const term of positives) {
      const hit = bestMatchForTerm(row, columns, term);
      if (!hit) {
        missing = true;
        break;
      }
      score += hit.score;
      hits.push({ term: term.value, field: hit.column, kind: hit.kind, score: hit.score });
    }
    if (missing) continue;
    matched.push({ row, score, hits });
  }

  const sortBy = source.sortBy && columns.includes(source.sortBy) ? source.sortBy : "relevance";
  const sortDir = source.sortDir === "desc" ? "desc" : "asc";
  const typeOf = new Map(profileColumns(columns, rows).map((item) => [item.column, item.type]));

  matched.sort((a, b) => {
    if (sortBy === "relevance") {
      if (b.score !== a.score) return b.score - a.score;
      return a.row.__id - b.row.__id;
    }
    const cmp = compareValues(
      String(a.row[sortBy] == null ? "" : a.row[sortBy]),
      String(b.row[sortBy] == null ? "" : b.row[sortBy]),
      typeOf.get(sortBy),
    );
    if (cmp !== 0) return sortDir === "desc" ? -cmp : cmp;
    return a.row.__id - b.row.__id;
  });

  const total = matched.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const requested = Number(source.page);
  const page = Number.isFinite(requested) && requested >= 1 ? Math.min(Math.floor(requested), pageCount) : 1;
  const start = (page - 1) * pageSize;

  return {
    total,
    scanned: rows.length,
    page,
    pageCount,
    pageSize,
    sortBy,
    sortDir,
    terms,
    results: matched.slice(start, start + pageSize),
  };
}

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

function csvCell(value) {
  const text = String(value == null ? "" : value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Re-serialise matched rows as CSV so results can leave with you. */
export function toCsv(columns, rows) {
  if (!Array.isArray(columns) || !Array.isArray(rows)) return "";
  const lines = [columns.map(csvCell).join(",")];
  for (const row of rows) lines.push(columns.map((column) => csvCell(row[column])).join(","));
  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* Sample data                                                                */
/* -------------------------------------------------------------------------- */

/**
 * A fixed demo table so the page shows a working search before you paste
 * anything. These are made-up example rows, not real people, and they are
 * replaced the moment you load your own data.
 */
export const SAMPLE_CSV = `name,email,phone,city,country,role,plan,signup_date,active
Aditi Sharma,aditi.sharma@example.com,+91 98200 11234,Mumbai,India,Admin,Business,2023-04-11,true
Ben Okafor,ben.okafor@example.com,+44 20 7946 0812,London,United Kingdom,Editor,Team,2024-01-07,true
Carla Mendes,carla.mendes@example.com,+55 11 91234 5678,Sao Paulo,Brazil,Viewer,Free,2024-06-22,false
Daniel Kim,daniel.kim@example.com,+82 10 2345 6789,Seoul,South Korea,Admin,Business,2022-11-30,true
Elena Rossi,elena.rossi@example.com,+39 06 4567 8901,Rome,Italy,Editor,Team,2023-09-14,true
Farah Haddad,farah.haddad@example.com,+971 50 123 4567,Dubai,United Arab Emirates,Viewer,Free,2025-02-03,true
Grace Nolan,grace.nolan@example.com,+353 1 234 5678,Dublin,Ireland,Editor,Team,2024-03-19,false
Hiro Tanaka,hiro.tanaka@example.com,+81 3 1234 5678,Tokyo,Japan,Admin,Business,2021-08-02,true
Isabel Ortiz,isabel.ortiz@example.com,+34 91 234 5678,Madrid,Spain,Viewer,Free,2025-05-27,true
Jonas Weber,jonas.weber@example.com,+49 30 1234 5678,Berlin,Germany,Editor,Team,2023-12-05,true
Kavya Nair,kavya.nair@example.com,+91 80 4123 5678,Bengaluru,India,Viewer,Free,2024-10-18,false
Liam Byrne,liam.byrne@example.com,+61 2 9012 3456,Sydney,Australia,Admin,Business,2022-05-21,true`;
