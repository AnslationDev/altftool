/**
 * Google Sheets AI Prompt Builder — A1 notation rules and prompt assembly.
 *
 * Limits below are the documented Google Sheets limits:
 *  - a spreadsheet holds up to 10,000,000 cells across all sheets;
 *  - a single sheet holds at most 18,278 columns, the last being ZZZ;
 *  - one cell holds at most 50,000 characters.
 * Row count is not a fixed number in Sheets — it is whatever the cell budget
 * allows for the width of the sheet, which is why rows are checked against the
 * cell budget here rather than against a constant.
 */

/** Cells allowed in one Google Sheets spreadsheet, across every tab. */
export const SHEETS_MAX_CELLS = 10000000;
/** Columns allowed in one sheet; column 18,278 is ZZZ. */
export const SHEETS_MAX_COLUMNS = 18278;
/** Letter form of column 18,278. */
export const SHEETS_LAST_COLUMN = "ZZZ";
/** Characters allowed in a single cell. */
export const SHEETS_MAX_CHARS_PER_CELL = 50000;

/**
 * Soft, tool-defined guidance (not a Google limit): beyond this many cells a
 * single AI request is better served by a summary tab or a QUERY first.
 */
export const LARGE_RANGE_CELL_HINT = 250000;

const COLUMN_LETTERS_RE = /^[A-Z]+$/;
/** A sheet name is safe unquoted only if it is letters, digits and underscores and does not start with a digit. */
const UNQUOTED_SHEET_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
const CELL_RE = /^([A-Z]{1,4})([1-9][0-9]{0,8})$/;
const COLUMN_ONLY_RE = /^([A-Z]{1,4})$/;

export const TASK_TYPES = [
  {
    id: "formula",
    label: "Write a formula",
    instruction:
      "Write one Google Sheets formula that produces the result described below, then explain each function in it.",
    deliverable:
      "the formula on its own line, a one-line explanation per function, and the value it returns for the first data row",
    rules: [
      "Use Google Sheets functions only — do not suggest Excel-only functions such as XLOOKUP unless you confirm the Sheets equivalent.",
      "Wrap the formula in IFERROR only if you also say what the fallback value means.",
      "Prefer ARRAYFORMULA or a single QUERY over a formula that has to be dragged down thousands of rows.",
    ],
  },
  {
    id: "query",
    label: "Write a QUERY",
    instruction:
      "Write a QUERY() formula over this range that answers the question below.",
    deliverable:
      "the full QUERY formula, the query string broken down clause by clause, and the shape of the output it returns",
    rules: [
      "Reference columns by their QUERY letters (Col1, Col2 ... when the range is a virtual array; A, B, C ... when it is a plain range) and say which style you used and why.",
      "Set the headers argument explicitly rather than relying on the default guess.",
      "Quote date literals as date 'yyyy-mm-dd' — QUERY will not compare a bare date string.",
    ],
  },
  {
    id: "clean",
    label: "Clean and standardise data",
    instruction:
      "Find the data quality problems in this range — trailing spaces, mixed casing, text that looks numeric, inconsistent date formats, duplicates and empty required cells.",
    deliverable:
      "a list of issues with the affected column, an example cell reference and the row count affected, then the fix for each",
    rules: [
      "Write cleaned values into new columns; never overwrite the source columns.",
      "Use TRIM, CLEAN, PROPER, VALUE and DATEVALUE explicitly rather than describing the fix in general terms.",
      "Flag rows you are unsure about instead of guessing.",
    ],
  },
  {
    id: "chart",
    label: "Choose and build a chart",
    instruction: "Recommend the right chart for this data and give the exact setup steps.",
    deliverable:
      "the chart type with one sentence of reasoning, the data range for each series, the X axis field, and the title and axis labels",
    rules: [
      "Pick the chart from the comparison being made, not from what looks impressive.",
      "Say which columns need to be a real date or number type before the chart will plot correctly.",
      "Give the Chart editor path for every setting you mention.",
    ],
  },
  {
    id: "pivot",
    label: "Build a pivot table",
    instruction: "Design a pivot table over this range that answers the question below.",
    deliverable:
      "the fields for Rows, Columns, Values and Filters, the summarise-by function for each value, and the menu steps to create it",
    rules: [
      "Use only the headers listed above as field names.",
      "Say which value fields need a currency, percentage or date grouping format.",
      "Mention any calculated field the pivot needs and give its formula.",
    ],
  },
  {
    id: "validate",
    label: "Data validation and formatting rules",
    instruction:
      "Write data validation and conditional formatting rules that keep this range clean as people type into it.",
    deliverable:
      "each rule as: applies-to range, rule type, the criterion or custom formula, and the message or format to apply",
    rules: [
      "Use custom formula rules with the correct relative references so the rule fills down correctly.",
      "Never rely on colour alone — pair each colour with text, an icon or a bold weight.",
      "Say whether the validation should reject the input or only warn.",
    ],
  },
  {
    id: "script",
    label: "Apps Script automation",
    instruction:
      "Write a Google Apps Script function that performs the task below on this range.",
    deliverable:
      "the complete script, the trigger it should run on, and the scopes it will ask the user to authorise",
    rules: [
      "Read the range once with getValues() and write once with setValues() — do not call the Sheets service inside a loop.",
      "Handle the empty-range case and log what the script changed.",
      "State plainly what the script deletes or overwrites before any code runs.",
    ],
  },
];

export const OUTPUT_TARGETS = [
  { id: "helper-column", label: "A helper column beside the data" },
  { id: "new-tab", label: "A new tab in the same spreadsheet" },
  { id: "explanation", label: "A written explanation I read first" },
  { id: "steps", label: "Numbered steps I follow myself" },
];

/** Bijective base-26: "A" -> 1, "Z" -> 26, "AA" -> 27, "ZZZ" -> 18278. */
export function columnLetterToIndex(letters) {
  const value = String(letters ?? "").trim().toUpperCase();
  if (!COLUMN_LETTERS_RE.test(value)) return 0;
  let index = 0;
  for (let i = 0; i < value.length; i += 1) {
    index = index * 26 + (value.charCodeAt(i) - 64);
  }
  return index;
}

/** Inverse of columnLetterToIndex. Returns "" below 1. */
export function columnIndexToLetter(index) {
  let n = Math.trunc(Number(index));
  if (!Number.isFinite(n) || n < 1) return "";
  let out = "";
  while (n > 0) {
    const remainder = (n - 1) % 26;
    out = String.fromCharCode(65 + remainder) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

/**
 * A1 notation quoting: a tab name only survives unquoted when it is letters,
 * digits and underscores and does not begin with a digit. Otherwise it is
 * wrapped in single quotes, and any single quote inside it is doubled.
 */
export function quoteSheetName(name) {
  const value = String(name ?? "").trim();
  if (!value) return "";
  if (UNQUOTED_SHEET_RE.test(value)) return value;
  return `'${value.replace(/'/g, "''")}'`;
}

/**
 * Parse a Sheets A1 range. Accepts A1:D100, a single cell, and the open-ended
 * forms Sheets allows (A:D whole columns, A2:D from a row to the bottom).
 * Returns { error } for anything Sheets would reject.
 */
export function parseSheetsRange(raw) {
  const cleaned = String(raw ?? "").trim().toUpperCase().replace(/\$/g, "");
  if (!cleaned) return { error: "Enter a range such as A1:F250 or A:F." };
  if (cleaned.includes("!")) {
    return { error: "Enter the range only — put the tab name in the sheet field." };
  }

  const parts = cleaned.split(":");
  if (parts.length > 2) {
    return { error: "A range has at most one colon, for example A1:F250." };
  }

  const ends = parts.map((part) => {
    const token = part.trim();
    const cell = CELL_RE.exec(token);
    if (cell) return { column: cell[1], row: Number(cell[2]) };
    const columnOnly = COLUMN_ONLY_RE.exec(token);
    if (columnOnly) return { column: columnOnly[1], row: null };
    return null;
  });

  if (ends.some((end) => !end)) {
    return {
      error: "Use A1 notation — a column letter with an optional row number, for example A2:F or A1:F250.",
    };
  }

  const columns = ends.map((end) => columnLetterToIndex(end.column));
  if (columns.some((column) => column < 1 || column > SHEETS_MAX_COLUMNS)) {
    return {
      error: `Google Sheets stops at column ${SHEETS_LAST_COLUMN} (${SHEETS_MAX_COLUMNS.toLocaleString("en-US")} columns per sheet).`,
    };
  }

  const startColumnIndex = Math.min(...columns);
  const endColumnIndex = Math.max(...columns);
  const startColumn = columnIndexToLetter(startColumnIndex);
  const endColumn = columnIndexToLetter(endColumnIndex);
  const columnCount = endColumnIndex - startColumnIndex + 1;

  const rowValues = ends.map((end) => end.row).filter((row) => row !== null);
  const bothRows = rowValues.length === ends.length;

  // A range with exactly one row number is only documented as start-anchored
  // (A2:D — open end, runs to the bottom). If the row instead sits on the end
  // token (A:E500) the meaning flips: the start is implicitly row 1 and the
  // end row is known, so this is really a closed range, not an open one.
  const endAnchoredOpenRange =
    !bothRows && ends.length === 2 && rowValues.length === 1 && ends[0].row === null && ends[1].row !== null;

  if (endAnchoredOpenRange) {
    const startRow = 1;
    const endRow = ends[1].row;
    const rowCount = endRow - startRow + 1;
    const cellCount = rowCount * columnCount;

    if (cellCount > SHEETS_MAX_CELLS) {
      return {
        error: `That range is ${cellCount.toLocaleString("en-US")} cells; a whole Google Sheets spreadsheet only holds ${SHEETS_MAX_CELLS.toLocaleString("en-US")}.`,
      };
    }

    return {
      startColumn,
      endColumn,
      startColumnIndex,
      endColumnIndex,
      startRow,
      endRow,
      columnCount,
      rowCount,
      cellCount,
      openEnded: false,
      normalized: `${startColumn}${startRow}:${endColumn}${endRow}`,
    };
  }

  if (!bothRows) {
    // Open-ended: A:D, or A2:D. Row count runs to the bottom of the sheet.
    const startRow = rowValues.length === 1 ? Math.min(...rowValues) : 1;
    const normalized =
      rowValues.length === 1
        ? `${startColumn}${startRow}:${endColumn}`
        : `${startColumn}:${endColumn}`;
    return {
      startColumn,
      endColumn,
      startColumnIndex,
      endColumnIndex,
      startRow,
      endRow: null,
      columnCount,
      rowCount: null,
      cellCount: null,
      openEnded: true,
      normalized,
    };
  }

  const startRow = Math.min(...rowValues);
  const endRow = Math.max(...rowValues);
  const rowCount = endRow - startRow + 1;
  const cellCount = rowCount * columnCount;

  if (cellCount > SHEETS_MAX_CELLS) {
    return {
      error: `That range is ${cellCount.toLocaleString("en-US")} cells; a whole Google Sheets spreadsheet only holds ${SHEETS_MAX_CELLS.toLocaleString("en-US")}.`,
    };
  }

  return {
    startColumn,
    endColumn,
    startColumnIndex,
    endColumnIndex,
    startRow,
    endRow,
    columnCount,
    rowCount,
    cellCount,
    openEnded: false,
    normalized: `${startColumn}${startRow}:${endColumn}${endRow}`,
  };
}

/** Full A1 reference with the tab name quoted the way Sheets requires. */
export function buildRangeReference(sheetName, normalizedRange) {
  const quoted = quoteSheetName(sheetName);
  return quoted ? `${quoted}!${normalizedRange}` : normalizedRange;
}

/** Split a comma or newline separated header list into trimmed names. */
export function parseHeaders(raw) {
  return String(raw ?? "")
    .split(/[\n,]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Pair headers with their column letters and their QUERY Col index. */
export function mapHeadersToColumns(headers, startColumnIndex) {
  const start = Math.max(1, Math.trunc(Number(startColumnIndex) || 1));
  return headers.map((header, offset) => ({
    letter: columnIndexToLetter(start + offset),
    queryColumn: `Col${offset + 1}`,
    header,
  }));
}

/**
 * Assemble the finished Sheets AI prompt.
 * Returns { error } for unusable input, never a half-built prompt.
 */
export function buildSheetsPrompt({
  sheetName = "",
  range = "",
  headerRow = 1,
  headers = "",
  taskId = "formula",
  goal = "",
  outputTarget = "helper-column",
  frozenHeader = true,
  extraContext = "",
} = {}) {
  const tab = String(sheetName ?? "").trim();
  if (!tab) return { error: "Enter the tab name the AI should work on." };

  const rangeInfo = parseSheetsRange(range);
  if (rangeInfo.error) return { error: rangeInfo.error };

  const task = TASK_TYPES.find((entry) => entry.id === taskId);
  if (!task) return { error: "Pick a task for the assistant to do." };

  const goalText = String(goal ?? "").trim();
  if (!goalText) return { error: "Describe what you actually want, in one sentence." };

  const headerList = parseHeaders(headers);
  if (headerList.length === 0) {
    return { error: "List the column headers so the assistant uses your real field names." };
  }

  const headerRowNumber = Math.trunc(Number(headerRow));
  if (!Number.isFinite(headerRowNumber) || headerRowNumber < 1) {
    return { error: "The header row must be a row number of 1 or more." };
  }

  const target = OUTPUT_TARGETS.find((entry) => entry.id === outputTarget) || OUTPUT_TARGETS[0];
  const reference = buildRangeReference(tab, rangeInfo.normalized);

  const headerInRange =
    headerRowNumber >= rangeInfo.startRow &&
    (rangeInfo.endRow === null || headerRowNumber <= rangeInfo.endRow);
  const dataRowCount =
    rangeInfo.rowCount === null ? null : headerInRange ? rangeInfo.rowCount - 1 : rangeInfo.rowCount;

  const warnings = [];
  if (quoteSheetName(tab) !== tab) {
    warnings.push(
      `"${tab}" needs quoting in A1 notation, so every formula must reference it as ${quoteSheetName(tab)}!${rangeInfo.normalized}.`,
    );
  }
  if (rangeInfo.openEnded) {
    warnings.push(
      "This is an open-ended range, so the assistant cannot know how many data rows there are — add an end row if the count matters.",
    );
  }
  if (!headerInRange && !rangeInfo.openEnded) {
    warnings.push(
      `Row ${headerRowNumber} sits outside ${rangeInfo.normalized}, so every row in the range is treated as data.`,
    );
  }
  if (headerList.length !== rangeInfo.columnCount) {
    warnings.push(
      `You listed ${headerList.length} header${headerList.length === 1 ? "" : "s"} but ${rangeInfo.normalized} is ${rangeInfo.columnCount} column${rangeInfo.columnCount === 1 ? "" : "s"} wide.`,
    );
  }
  if (rangeInfo.cellCount !== null && rangeInfo.cellCount > LARGE_RANGE_CELL_HINT) {
    warnings.push(
      `${rangeInfo.cellCount.toLocaleString("en-US")} cells is a lot for one request — build a summary tab or a QUERY first.`,
    );
  }

  const columnMap = mapHeadersToColumns(headerList, rangeInfo.startColumnIndex);

  const lines = [];
  lines.push(`Work only on the Google Sheets range ${reference}.`);
  lines.push(
    rangeInfo.rowCount === null
      ? `The range is ${rangeInfo.columnCount} column${rangeInfo.columnCount === 1 ? "" : "s"} wide and runs from row ${rangeInfo.startRow} to the last row with data.`
      : `That is ${rangeInfo.rowCount.toLocaleString("en-US")} row${rangeInfo.rowCount === 1 ? "" : "s"} by ${rangeInfo.columnCount} column${rangeInfo.columnCount === 1 ? "" : "s"}, ${rangeInfo.cellCount.toLocaleString("en-US")} cells.`,
  );
  if (headerInRange) {
    lines.push(
      dataRowCount === null
        ? `Row ${headerRowNumber} is the header row.`
        : `Row ${headerRowNumber} is the header row, so there are ${dataRowCount.toLocaleString("en-US")} data rows.`,
    );
  }
  if (frozenHeader) lines.push("The header row is frozen, so it stays out of any sort.");
  lines.push("");
  lines.push("Columns, left to right:");
  columnMap.forEach((entry) => {
    lines.push(`- ${entry.letter} (${entry.queryColumn}): ${entry.header}`);
  });
  lines.push("");
  lines.push(`Task: ${task.instruction}`);
  lines.push(`Goal: ${goalText}`);
  lines.push(`Return: ${task.deliverable}.`);
  lines.push(`Put the result here: ${target.label}.`);
  lines.push("");
  lines.push("Rules:");
  task.rules.forEach((rule) => lines.push(`- ${rule}`));
  lines.push("- Use only the column names listed above; do not invent fields.");
  lines.push(
    `- Keep any single cell's contents under ${SHEETS_MAX_CHARS_PER_CELL.toLocaleString("en-US")} characters, which is the Google Sheets per-cell limit.`,
  );
  lines.push("- If anything above is ambiguous, ask one clarifying question before changing the sheet.");

  const context = String(extraContext ?? "").trim();
  if (context) {
    lines.push("");
    lines.push(`Extra context: ${context}`);
  }

  const prompt = lines.join("\n");

  return {
    prompt,
    warnings,
    range: rangeInfo,
    reference,
    dataRowCount,
    headerCount: headerList.length,
    characterCount: prompt.length,
    wordCount: prompt.split(/\s+/).filter(Boolean).length,
  };
}
