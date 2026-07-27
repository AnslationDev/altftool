/**
 * Excel Copilot Prompt Builder — worksheet grid rules and prompt assembly.
 *
 * All grid figures below come from the Microsoft "Excel specifications and
 * limits" sheet for the .xlsx format (Excel 2007 and later). They have not
 * changed across versions, so they are safe to hard-code as constants.
 */

/** Rows on one worksheet in the .xlsx format. */
export const EXCEL_MAX_ROWS = 1048576;
/** Columns on one worksheet in the .xlsx format; the last one is XFD. */
export const EXCEL_MAX_COLUMNS = 16384;
/** Letter form of column 16384. */
export const EXCEL_LAST_COLUMN = "XFD";
/** Worksheet (tab) name length limit in characters. */
export const EXCEL_SHEET_NAME_MAX = 31;
/** Formula content length limit in characters. */
export const EXCEL_FORMULA_MAX_CHARS = 8192;
/** Characters Excel refuses inside a worksheet name. */
export const EXCEL_ILLEGAL_SHEET_CHARS = ": \\ / ? * [ ]";

/**
 * Soft, tool-defined guidance (NOT a Microsoft limit): past this many cells a
 * single Copilot request usually needs to be narrowed to a smaller range or a
 * summarised table before the answer stays reliable.
 */
export const LARGE_RANGE_CELL_HINT = 100000;

const ILLEGAL_SHEET_RE = /[:\\/?*[\]]/;
const COLUMN_LETTERS_RE = /^[A-Z]+$/;
const CELL_RE = /^([A-Z]{1,3})([1-9][0-9]{0,7})$/;

export const TASK_TYPES = [
  {
    id: "formula",
    label: "Write a formula",
    instruction:
      "Write one Excel formula that produces the result described below, and explain in plain language what each part of it does.",
    deliverable:
      "the finished formula on its own line, then a short bullet for each function used, then one worked example using a real row from the range",
    rules: [
      "Use functions available in the current version of Excel for Microsoft 365; if you use a dynamic array function such as FILTER, XLOOKUP or LET, say so explicitly.",
      "Prefer structured table references (Table[Column]) when the range is a real Excel table, otherwise use absolute references with $ signs where the formula will be copied.",
      "Never invent column names — use only the headers listed above.",
    ],
  },
  {
    id: "clean",
    label: "Clean and standardise data",
    instruction:
      "Find and fix data quality problems in this range: inconsistent casing, stray spaces, mixed date formats, numbers stored as text, duplicates and blank required fields.",
    deliverable:
      "a table of issues found with the affected column and an example row, then the exact steps or formulas to fix each one",
    rules: [
      "List the issues before changing anything, and do not overwrite the original columns — put cleaned values in new columns.",
      "Flag any row you are unsure about instead of guessing a correction.",
      "State how many rows each issue affects.",
    ],
  },
  {
    id: "analyze",
    label: "Summarise and find patterns",
    instruction:
      "Summarise what this data shows: the main totals, the distribution, the largest movers and anything that looks unusual.",
    deliverable:
      "five to eight findings, each one sentence, each with the number that supports it and the columns it came from",
    rules: [
      "Quote real figures from the range rather than describing trends in general terms.",
      "Say explicitly when a finding is based on too few rows to be reliable.",
      "Do not extrapolate beyond the rows in the range.",
    ],
  },
  {
    id: "pivot",
    label: "Build a PivotTable",
    instruction:
      "Design a PivotTable over this range that answers the question below.",
    deliverable:
      "the fields to place in Rows, Columns, Values and Filters, the summary function for each value field, and the click-by-click steps to build it",
    rules: [
      "Use only the headers listed above as field names.",
      "Say which value fields need a number format change (currency, percentage, thousands separator).",
      "Mention any column that must be cleaned or converted to a real date before the pivot will group correctly.",
    ],
  },
  {
    id: "chart",
    label: "Choose and build a chart",
    instruction:
      "Recommend the right chart type for this data and describe exactly how to build it.",
    deliverable:
      "the chart type with one sentence of reasoning, the exact source range, what goes on each axis, and the title and axis labels to use",
    rules: [
      "Pick the chart from the comparison being made, not from what looks impressive.",
      "Do not use a pie chart for more than five categories or for anything that is not a part-of-whole comparison.",
      "State the axis minimum and maximum if a default axis would mislead.",
    ],
  },
  {
    id: "format",
    label: "Conditional formatting rules",
    instruction:
      "Write conditional formatting rules that make the important values in this range visible at a glance.",
    deliverable:
      "each rule as: applies-to range, rule type, the formula or threshold, and the format to apply",
    rules: [
      "Use formula-based rules with the correct relative and absolute references so the rule copies down properly.",
      "Do not rely on colour alone — pair each colour with an icon set, a bold weight or a text cue.",
      "Keep the total number of rules to five or fewer.",
    ],
  },
  {
    id: "explain",
    label: "Explain an existing formula",
    instruction:
      "Explain the formula pasted below in plain language, then say what would break it.",
    deliverable:
      "a step-by-step walkthrough from the innermost function outwards, then a list of inputs that would return an error or a wrong answer",
    rules: [
      "Evaluate the formula against a real row from the range and show the intermediate values.",
      "Name every error the formula could return (#N/A, #REF!, #VALUE!, #DIV/0!) and what causes each.",
      "Suggest a simpler equivalent only if it is genuinely shorter and does the same thing.",
    ],
  },
];

export const OUTPUT_TARGETS = [
  { id: "new-column", label: "A new column next to the data" },
  { id: "new-sheet", label: "A new sheet in the same workbook" },
  { id: "summary", label: "A written summary in the chat pane" },
  { id: "steps", label: "Step-by-step instructions I follow myself" },
];

/** Bijective base-26: "A" -> 1, "Z" -> 26, "AA" -> 27, "XFD" -> 16384. */
export function columnLetterToIndex(letters) {
  const value = String(letters ?? "").trim().toUpperCase();
  if (!COLUMN_LETTERS_RE.test(value)) return 0;
  let index = 0;
  for (let i = 0; i < value.length; i += 1) {
    index = index * 26 + (value.charCodeAt(i) - 64);
  }
  return index;
}

/** Inverse of columnLetterToIndex. Returns "" for anything below 1. */
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
 * Parse an A1 range ("A1:F250", "b2", "$A$1:$C$9") and measure it.
 * Returns { error } for anything Excel itself would reject.
 */
export function parseA1Range(raw) {
  const cleaned = String(raw ?? "").trim().toUpperCase().replace(/\$/g, "");
  if (!cleaned) return { error: "Enter a range such as A1:F250." };
  if (cleaned.includes("!")) {
    return { error: "Enter the range only — put the sheet name in the sheet field." };
  }

  const parts = cleaned.split(":");
  if (parts.length > 2) {
    return { error: "A range has at most one colon, for example A1:F250." };
  }

  const matches = parts.map((part) => CELL_RE.exec(part.trim()));
  if (matches.some((match) => !match)) {
    return {
      error: "Use A1 notation — a column letter then a row number, for example A1:F250.",
    };
  }

  const columns = matches.map((match) => columnLetterToIndex(match[1]));
  const rows = matches.map((match) => Number(match[2]));

  if (columns.some((column) => column < 1 || column > EXCEL_MAX_COLUMNS)) {
    return {
      error: `Excel stops at column ${EXCEL_LAST_COLUMN} (${EXCEL_MAX_COLUMNS.toLocaleString("en-US")} columns).`,
    };
  }
  if (rows.some((row) => row < 1 || row > EXCEL_MAX_ROWS)) {
    return {
      error: `Excel stops at row ${EXCEL_MAX_ROWS.toLocaleString("en-US")}.`,
    };
  }

  const startColumnIndex = Math.min(...columns);
  const endColumnIndex = Math.max(...columns);
  const startRow = Math.min(...rows);
  const endRow = Math.max(...rows);

  const columnCount = endColumnIndex - startColumnIndex + 1;
  const rowCount = endRow - startRow + 1;
  const startColumn = columnIndexToLetter(startColumnIndex);
  const endColumn = columnIndexToLetter(endColumnIndex);

  return {
    startColumn,
    endColumn,
    startColumnIndex,
    endColumnIndex,
    startRow,
    endRow,
    columnCount,
    rowCount,
    cellCount: columnCount * rowCount,
    normalized: `${startColumn}${startRow}:${endColumn}${endRow}`,
  };
}

/** Excel worksheet name rules: 1-31 chars, no : \ / ? * [ ] */
export function validateSheetName(name) {
  const value = String(name ?? "").trim();
  if (!value) return { ok: false, error: "Enter the worksheet name Copilot should work on." };
  if (value.length > EXCEL_SHEET_NAME_MAX) {
    return {
      ok: false,
      error: `Worksheet names are limited to ${EXCEL_SHEET_NAME_MAX} characters; this one is ${value.length}.`,
    };
  }
  if (ILLEGAL_SHEET_RE.test(value)) {
    return { ok: false, error: `Excel does not allow these characters in a sheet name: ${EXCEL_ILLEGAL_SHEET_CHARS}` };
  }
  return { ok: true, value };
}

/** Split a comma or newline separated header list into trimmed names. */
export function parseHeaders(raw) {
  return String(raw ?? "")
    .split(/[\n,]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Pair header names with the column letters they sit in. */
export function mapHeadersToColumns(headers, startColumnIndex) {
  const start = Math.max(1, Math.trunc(Number(startColumnIndex) || 1));
  return headers.map((header, offset) => ({
    letter: columnIndexToLetter(start + offset),
    header,
  }));
}

/**
 * Assemble the finished Copilot prompt.
 * Returns { error } when any input is unusable, never a half-built prompt.
 */
export function buildExcelCopilotPrompt({
  sheetName = "",
  range = "",
  headerRow = 1,
  headers = "",
  taskId = "formula",
  goal = "",
  outputTarget = "new-column",
  isTable = true,
  tableName = "",
  extraContext = "",
} = {}) {
  const sheet = validateSheetName(sheetName);
  if (!sheet.ok) return { error: sheet.error };

  const rangeInfo = parseA1Range(range);
  if (rangeInfo.error) return { error: rangeInfo.error };

  const task = TASK_TYPES.find((entry) => entry.id === taskId);
  if (!task) return { error: "Pick a task for Copilot to do." };

  const goalText = String(goal ?? "").trim();
  if (!goalText) return { error: "Describe what you actually want, in one sentence." };

  const headerList = parseHeaders(headers);
  if (headerList.length === 0) {
    return { error: "List the column headers so Copilot uses your real field names." };
  }

  const headerRowNumber = Math.trunc(Number(headerRow));
  if (!Number.isFinite(headerRowNumber) || headerRowNumber < 1) {
    return { error: "The header row must be a row number of 1 or more." };
  }

  const target = OUTPUT_TARGETS.find((entry) => entry.id === outputTarget) || OUTPUT_TARGETS[0];

  const headerInRange =
    headerRowNumber >= rangeInfo.startRow && headerRowNumber <= rangeInfo.endRow;
  const dataRowCount = headerInRange ? rangeInfo.rowCount - 1 : rangeInfo.rowCount;

  const warnings = [];
  if (!headerInRange) {
    warnings.push(
      `Row ${headerRowNumber} sits outside ${rangeInfo.normalized}, so every row in the range is treated as data.`,
    );
  }
  if (headerList.length !== rangeInfo.columnCount) {
    warnings.push(
      `You listed ${headerList.length} header${headerList.length === 1 ? "" : "s"} but ${rangeInfo.normalized} is ${rangeInfo.columnCount} column${rangeInfo.columnCount === 1 ? "" : "s"} wide.`,
    );
  }
  if (rangeInfo.cellCount > LARGE_RANGE_CELL_HINT) {
    warnings.push(
      `${rangeInfo.cellCount.toLocaleString("en-US")} cells is a lot for one request — narrow the range or ask for a summary table first.`,
    );
  }
  if (isTable && !String(tableName).trim()) {
    warnings.push(
      "Give the Excel table its real name (Table Design > Table Name) so structured references resolve.",
    );
  }

  const columnMap = mapHeadersToColumns(headerList, rangeInfo.startColumnIndex);
  const referenceStyle =
    isTable && String(tableName).trim()
      ? `structured table references such as ${String(tableName).trim()}[${headerList[0]}]`
      : "absolute A1 references such as $A$2:$A$" + rangeInfo.endRow;

  const lines = [];
  lines.push(
    `Work only on the worksheet "${sheet.value}", range ${rangeInfo.normalized} — ${rangeInfo.rowCount.toLocaleString("en-US")} row${rangeInfo.rowCount === 1 ? "" : "s"} by ${rangeInfo.columnCount} column${rangeInfo.columnCount === 1 ? "" : "s"}.`,
  );
  lines.push(
    headerInRange
      ? `Row ${headerRowNumber} is the header row, so there are ${dataRowCount.toLocaleString("en-US")} data rows.`
      : `There is no header row inside the range; all ${dataRowCount.toLocaleString("en-US")} rows are data.`,
  );
  lines.push("");
  lines.push("Columns, left to right:");
  columnMap.forEach((entry) => {
    lines.push(`- ${entry.letter}: ${entry.header}`);
  });
  lines.push("");
  lines.push(`Task: ${task.instruction}`);
  lines.push(`Goal: ${goalText}`);
  lines.push(`Return: ${task.deliverable}.`);
  lines.push(`Put the result here: ${target.label}.`);
  lines.push("");
  lines.push("Rules:");
  lines.push(`- Use ${referenceStyle}.`);
  task.rules.forEach((rule) => lines.push(`- ${rule}`));
  lines.push(
    `- Keep any single formula under ${EXCEL_FORMULA_MAX_CHARS.toLocaleString("en-US")} characters, which is Excel's formula length limit.`,
  );
  lines.push("- If anything above is ambiguous, ask one clarifying question before you change the workbook.");

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
    dataRowCount,
    headerCount: headerList.length,
    characterCount: prompt.length,
    wordCount: prompt.split(/\s+/).filter(Boolean).length,
  };
}
