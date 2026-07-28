/**
 * Text column extractor — pull one or more columns out of delimited or
 * fixed-width text.
 *
 * Three splitting modes:
 *  - "delimited": split each line on a separator. Comma mode follows RFC 4180
 *    quoting, so a field wrapped in double quotes may contain commas and an
 *    escaped quote is written as two double quotes ("").
 *  - "whitespace": split on runs of spaces and tabs, the way `awk` does, so
 *    ragged column alignment still lines up.
 *  - "fixed": cut each line at character positions, for report output where
 *    columns are padded rather than separated.
 *
 * Column numbers are 1-based, matching `cut -f` and spreadsheet column numbers.
 * A negative number counts from the end, so -1 is the last column on the line.
 */

/** Preset separators offered to the user. */
export const DELIMITERS = [
  { value: "comma", label: "Comma  ,", char: "," },
  { value: "tab", label: "Tab", char: "\t" },
  { value: "semicolon", label: "Semicolon  ;", char: ";" },
  { value: "pipe", label: "Pipe  |", char: "|" },
  { value: "colon", label: "Colon  :", char: ":" },
  { value: "whitespace", label: "Any run of spaces or tabs", char: null },
  { value: "custom", label: "Custom string", char: null },
];

export const MODES = [
  { value: "delimited", label: "Delimited (CSV, TSV, pipe…)" },
  { value: "fixed", label: "Fixed width (character positions)" },
];

/** Refuse absurd work rather than freezing the tab. */
export const MAX_LINES = 200000;
export const MAX_COLUMNS = 2000;

/**
 * Split one line on a single-character delimiter, honouring RFC 4180 quotes.
 * @returns {string[]}
 */
export function splitQuoted(line, delimiter) {
  const out = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      out.push(field);
      field = "";
    } else {
      field += ch;
    }
  }
  out.push(field);
  return out;
}

/**
 * Turn a column specification such as "1,3,5-7,-1" into a list of 1-based
 * column numbers. Negative numbers are kept as-is and resolved per line.
 * @returns {{ columns: number[] } | { error: string }}
 */
export function parseColumnSpec(spec) {
  const text = String(spec ?? "").trim();
  if (text === "") return { error: "Enter at least one column number, for example 1 or 2,4-6." };

  const columns = [];
  for (const rawPart of text.split(",")) {
    const part = rawPart.trim();
    if (part === "") continue;

    const range = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const from = Number(range[1]);
      const to = Number(range[2]);
      if (from < 1 || to < 1) return { error: "Column numbers start at 1, not 0." };
      if (to < from) return { error: `The range "${part}" runs backwards — write the smaller number first.` };
      if (to - from + 1 > MAX_COLUMNS) return { error: "That range asks for too many columns." };
      for (let i = from; i <= to; i += 1) columns.push(i);
      continue;
    }

    if (/^-?\d+$/.test(part)) {
      const n = Number(part);
      if (n === 0) return { error: "Column numbers start at 1, not 0." };
      columns.push(n);
      continue;
    }

    return { error: `"${part}" is not a column number. Use 1, 2-5 or -1 for the last column.` };
  }

  if (columns.length === 0) return { error: "Enter at least one column number, for example 1 or 2,4-6." };
  if (columns.length > MAX_COLUMNS) return { error: "That asks for too many columns at once." };
  return { columns };
}

/**
 * Turn a fixed-width specification such as "1-10,12-20,25" into character
 * slices. A bare number means "from that position to the end of the line".
 * @returns {{ slices: Array<{from:number,to:number}> } | { error: string }}
 */
export function parseFixedSpec(spec) {
  const text = String(spec ?? "").trim();
  if (text === "") return { error: "Enter character positions, for example 1-10,12-20." };

  const slices = [];
  for (const rawPart of text.split(",")) {
    const part = rawPart.trim();
    if (part === "") continue;

    const range = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const from = Number(range[1]);
      const to = Number(range[2]);
      if (from < 1) return { error: "Character positions start at 1, not 0." };
      if (to < from) return { error: `The range "${part}" runs backwards — write the smaller number first.` };
      slices.push({ from, to });
      continue;
    }

    if (/^\d+$/.test(part)) {
      const from = Number(part);
      if (from < 1) return { error: "Character positions start at 1, not 0." };
      slices.push({ from, to: Infinity });
      continue;
    }

    return { error: `"${part}" is not a character range. Use 1-10 or 12-20.` };
  }

  if (slices.length === 0) return { error: "Enter character positions, for example 1-10,12-20." };
  return { slices };
}

/**
 * Guess the delimiter of a block of text by counting candidates on the first
 * few lines and picking the one that appears the same number of times on
 * every line — the sign of a real column separator.
 */
export function detectDelimiter(text) {
  const lines = String(text ?? "")
    .split(/\r\n|\r|\n/)
    .filter((l) => l.trim() !== "")
    .slice(0, 20);
  if (lines.length === 0) return "comma";

  const candidates = [
    { value: "tab", char: "\t" },
    { value: "comma", char: "," },
    { value: "semicolon", char: ";" },
    { value: "pipe", char: "|" },
    { value: "colon", char: ":" },
  ];

  let bestValue = "whitespace";
  let bestScore = 0;
  for (const c of candidates) {
    const counts = lines.map((l) => l.split(c.char).length - 1);
    const first = counts[0];
    if (first === 0) continue;
    const consistent = counts.every((n) => n === first);
    const score = (consistent ? 1000 : 0) + first;
    if (score > bestScore) {
      bestScore = score;
      bestValue = c.value;
    }
  }
  return bestValue;
}

/** Resolve a delimiter option into the actual separator string. */
export function resolveDelimiter(delimiter, customDelimiter) {
  if (delimiter === "custom") {
    const raw = String(customDelimiter ?? "");
    // Allow the usual escapes so a user can type \t for a tab.
    return raw.replace(/\\t/g, "\t").replace(/\\n/g, "\n").replace(/\\\\/g, "\\");
  }
  const preset = DELIMITERS.find((d) => d.value === delimiter);
  return preset ? preset.char : ",";
}

/** Split one line into fields according to the current settings. */
function splitLine(line, mode, delimiter, sep, respectQuotes, slices) {
  if (mode === "fixed") {
    return slices.map(({ from, to }) =>
      line.slice(from - 1, Number.isFinite(to) ? to : undefined),
    );
  }
  if (delimiter === "whitespace") {
    return line.trim() === "" ? [""] : line.trim().split(/[ \t]+/);
  }
  if (respectQuotes && sep && sep.length === 1) {
    return splitQuoted(line, sep);
  }
  if (!sep) return [line];
  return line.split(sep);
}

/**
 * Extract columns from a block of text.
 *
 * @param {object} input
 * @param {string} input.text            The pasted text.
 * @param {string} input.mode            "delimited" or "fixed".
 * @param {string} input.delimiter       A DELIMITERS value (delimited mode).
 * @param {string} input.customDelimiter Separator string when delimiter is "custom".
 * @param {string} input.columnSpec      "1,3,5-7" (delimited mode).
 * @param {string} input.fixedSpec       "1-10,12-20" (fixed mode).
 * @param {number} input.skipRows        Header rows to drop before extracting.
 * @param {boolean} input.trim           Trim whitespace from each field.
 * @param {boolean} input.unique         Drop duplicate output rows.
 * @param {boolean} input.dropEmpty      Drop output rows that are entirely empty.
 * @param {boolean} input.respectQuotes  Honour RFC 4180 double quotes.
 * @param {string} input.outputDelimiter Separator used to join the kept fields.
 */
export function extractColumns({
  text = "",
  mode = "delimited",
  delimiter = "comma",
  customDelimiter = "",
  columnSpec = "1",
  fixedSpec = "1-10",
  skipRows = 0,
  trim = true,
  unique = false,
  dropEmpty = true,
  respectQuotes = true,
  outputDelimiter = "\t",
} = {}) {
  const source = String(text ?? "");
  if (source.trim() === "") {
    return { error: "Paste some text to pull columns out of." };
  }

  const allLines = source.split(/\r\n|\r|\n/);
  if (allLines.length > MAX_LINES) {
    return { error: `That is ${allLines.length.toLocaleString("en-US")} lines — this tool handles up to ${MAX_LINES.toLocaleString("en-US")}.` };
  }

  const skip = Number.isFinite(skipRows) && skipRows > 0 ? Math.floor(skipRows) : 0;
  if (skip >= allLines.length) {
    return { error: `You are skipping ${skip} rows but the text only has ${allLines.length}.` };
  }

  let slices = [];
  let columns = [];
  if (mode === "fixed") {
    const parsed = parseFixedSpec(fixedSpec);
    if (parsed.error) return { error: parsed.error };
    slices = parsed.slices;
  } else {
    const parsed = parseColumnSpec(columnSpec);
    if (parsed.error) return { error: parsed.error };
    columns = parsed.columns;
  }

  const sep = mode === "fixed" ? null : resolveDelimiter(delimiter, customDelimiter);
  if (mode !== "fixed" && delimiter === "custom" && sep === "") {
    return { error: "Type the custom separator you want to split on." };
  }

  const header = allLines.slice(0, skip);
  const body = allLines.slice(skip);

  const rows = [];
  let widest = 0;
  let missing = 0;

  for (const line of body) {
    const fields = splitLine(line, mode, delimiter, sep, respectQuotes, slices);
    if (fields.length > widest) widest = fields.length;

    let picked;
    if (mode === "fixed") {
      picked = fields;
    } else {
      picked = columns.map((n) => {
        const index = n > 0 ? n - 1 : fields.length + n;
        if (index < 0 || index >= fields.length) {
          missing += 1;
          return "";
        }
        return fields[index];
      });
    }

    if (trim) picked = picked.map((f) => f.trim());
    if (dropEmpty && picked.every((f) => f === "")) continue;
    rows.push(picked);
  }

  let finalRows = rows;
  if (unique) {
    const seen = new Set();
    finalRows = [];
    for (const row of rows) {
      const key = row.join(" ");
      if (seen.has(key)) continue;
      seen.add(key);
      finalRows.push(row);
    }
  }

  const joiner = String(outputDelimiter ?? "\t")
    .replace(/\\t/g, "\t")
    .replace(/\\n/g, "\n");

  const output = finalRows.map((row) => row.join(joiner)).join("\n");

  return {
    rows: finalRows,
    output,
    rowsIn: body.length,
    rowsOut: finalRows.length,
    duplicatesRemoved: rows.length - finalRows.length,
    columnsDetected: widest,
    columnsRequested: mode === "fixed" ? slices.length : columns.length,
    missingCells: missing,
    headerLines: header,
    detected: mode === "fixed" ? null : delimiter,
  };
}
