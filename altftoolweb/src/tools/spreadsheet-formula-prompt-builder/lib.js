/**
 * Spreadsheet Formula Prompt Builder.
 *
 * Converts a pasted header row into real A1-style column letters and data
 * ranges, then writes a prompt that asks for a formula in the dialect of the
 * chosen application — including the functions that application actually has
 * and the argument separator its locale uses.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/**
 * Target applications. `available` lists functions the app supports;
 * `unavailable` lists ones people wrongly assume are there.
 */
export const PLATFORMS = [
  {
    id: "excel365",
    label: "Excel 365 / Excel 2021",
    available: ["XLOOKUP", "FILTER", "UNIQUE", "SORT", "SEQUENCE", "LET", "LAMBDA", "TEXTJOIN", "IFS", "SUMIFS"],
    unavailable: ["QUERY", "ARRAYFORMULA", "GOOGLEFINANCE"],
    arrayNote:
      "Dynamic arrays spill automatically — do not wrap formulas in CTRL+SHIFT+ENTER and do not use ARRAYFORMULA.",
  },
  {
    id: "excel2019",
    label: "Excel 2019 / 2016 (no dynamic arrays)",
    available: ["VLOOKUP", "INDEX", "MATCH", "SUMIFS", "COUNTIFS", "IFERROR", "TEXTJOIN", "AGGREGATE"],
    unavailable: ["XLOOKUP", "FILTER", "UNIQUE", "SORT", "LET", "LAMBDA", "QUERY", "ARRAYFORMULA"],
    arrayNote:
      "No dynamic arrays: use INDEX/MATCH rather than XLOOKUP, and enter genuine array formulas with CTRL+SHIFT+ENTER.",
  },
  {
    id: "sheets",
    label: "Google Sheets",
    available: ["QUERY", "ARRAYFORMULA", "FILTER", "UNIQUE", "SORT", "XLOOKUP", "SUMIFS", "TEXTJOIN", "LAMBDA", "IMPORTRANGE"],
    unavailable: ["LET", "AGGREGATE", "TEXTSPLIT"],
    arrayNote:
      "Wrap a formula in ARRAYFORMULA to fill a whole column from one cell, or use QUERY when the logic is really a small database query.",
  },
  {
    id: "calc",
    label: "LibreOffice Calc",
    available: ["VLOOKUP", "INDEX", "MATCH", "SUMIFS", "COUNTIFS", "IFERROR", "TEXTJOIN", "SUMPRODUCT"],
    unavailable: ["XLOOKUP", "QUERY", "ARRAYFORMULA", "LET", "LAMBDA"],
    arrayNote:
      "Array formulas are entered with CTRL+SHIFT+ENTER. SUMPRODUCT replaces most single-cell array tricks.",
  },
];

/**
 * The argument separator depends on the list separator of the file's locale,
 * not on the application. Comma in en-US and most English locales; semicolon
 * where the comma is the decimal mark, such as de-DE, fr-FR and es-ES.
 */
export const SEPARATORS = [
  { id: "comma", label: "Comma — =SUM(A1,B1)", character: "," },
  { id: "semicolon", label: "Semicolon — =SUM(A1;B1)", character: ";" },
];

/** What the formula is meant to produce, which shapes the requested approach. */
export const GOALS = [
  {
    id: "lookup",
    label: "Look a value up in another table",
    directive:
      "Prefer an exact-match lookup, state what happens when there is no match, and never leave a raw #N/A visible to a user.",
  },
  {
    id: "aggregate",
    label: "Sum, count or average with conditions",
    directive:
      "Use the multi-condition form (SUMIFS/COUNTIFS or equivalent) rather than nesting IFs, and say how blanks and text values are treated.",
  },
  {
    id: "clean",
    label: "Clean or reformat text",
    directive:
      "Handle leading and trailing spaces, mixed case and empty cells explicitly. Say whether the output is text or a number.",
  },
  {
    id: "dates",
    label: "Work with dates or durations",
    directive:
      "State the assumed date system and whether the result is a serial number that needs formatting. Handle blank dates without returning 1900 or 1970.",
  },
  {
    id: "conditional",
    label: "Flag rows or apply conditional logic",
    directive:
      "Return a stable, sortable value (TRUE/FALSE or a short label), not a coloured cell, and keep the condition readable.",
  },
  {
    id: "dedupe",
    label: "Find duplicates or unique values",
    directive:
      "Say exactly which columns define a duplicate, and whether the first occurrence counts as a duplicate.",
  },
];

/** Practical bounds. */
export const LIMITS = {
  columns: { min: 1, max: 200 },
  rows: { min: 2, max: 5000000 },
};

/** Roughly four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

const LETTERS = 26;

/**
 * Zero-based column index to an A1-style column letter.
 * 0 → A, 25 → Z, 26 → AA, 701 → ZZ, 702 → AAA (bijective base-26).
 * @returns {string} empty string for an invalid index
 */
export function columnLetter(index) {
  if (!Number.isInteger(index) || index < 0) return "";
  let remaining = index;
  let letters = "";
  while (remaining >= 0) {
    letters = String.fromCharCode(65 + (remaining % LETTERS)) + letters;
    remaining = Math.floor(remaining / LETTERS) - 1;
  }
  return letters;
}

/**
 * Split a pasted header row on tabs, commas or pipes.
 * @returns {{error:string}|{columns:Array<{name:string,letter:string,index:number}>}}
 */
export function parseHeaders(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { error: "Paste your header row — tab, comma or pipe separated." };
  }
  const firstLine = text.split(/\r?\n/).find((line) => line.trim().length > 0) || "";
  const names = firstLine
    .split(/\t|\||,/)
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  if (names.length < LIMITS.columns.min) {
    return { error: "Paste your header row — tab, comma or pipe separated." };
  }
  if (names.length > LIMITS.columns.max) {
    return { error: `That is more than ${LIMITS.columns.max} columns — trim it to the ones the formula touches.` };
  }
  return {
    columns: names.map((name, index) => ({ name, index, letter: columnLetter(index) })),
  };
}

/**
 * Build an A1 range for one column.
 * @returns {{error:string}|{range:string,absolute:string}}
 */
export function buildRange(letter, firstDataRow, lastRow) {
  if (typeof letter !== "string" || letter.length === 0) {
    return { error: "That column does not exist in the header row." };
  }
  if (!Number.isInteger(firstDataRow) || firstDataRow < 1) {
    return { error: "The first data row must be a whole number, 1 or more." };
  }
  if (!Number.isInteger(lastRow) || lastRow < firstDataRow) {
    return { error: "The last data row must be the same as, or after, the first data row." };
  }
  if (lastRow > LIMITS.rows.max) {
    return { error: `The last row must be ${LIMITS.rows.max.toLocaleString("en-US")} or lower.` };
  }
  return {
    range: `${letter}${firstDataRow}:${letter}${lastRow}`,
    absolute: `$${letter}$${firstDataRow}:$${letter}$${lastRow}`,
  };
}

export function getPlatform(id) {
  return PLATFORMS.find((item) => item.id === id) || null;
}

export function getGoal(id) {
  return GOALS.find((item) => item.id === id) || null;
}

export function getSeparator(id) {
  return SEPARATORS.find((item) => item.id === id) || null;
}

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  const characters = text.length;
  const words = text.trim().split(/\s+/).length;
  return {
    characters,
    words,
    approxTokens: Math.max(1, Math.ceil(characters / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/**
 * Build the formula prompt.
 * @returns {{error:string}|{text:string,...}}
 */
export function buildFormulaPrompt({
  headerText,
  headerRow,
  lastRow,
  sheetName,
  platformId,
  separatorId,
  goalId,
  outputColumn,
  task,
  notes,
} = {}) {
  const platform = getPlatform(platformId);
  if (!platform) return { error: "Choose the spreadsheet application." };
  const separator = getSeparator(separatorId);
  if (!separator) return { error: "Choose the argument separator." };
  const goal = getGoal(goalId);
  if (!goal) return { error: "Choose what the formula should do." };

  const described = typeof task === "string" ? task.trim() : "";
  if (described.length < 10) {
    return { error: "Describe what the formula should do, in a sentence." };
  }

  const parsed = parseHeaders(headerText);
  if (parsed.error) return { error: parsed.error };

  const header = Number(headerRow);
  if (!Number.isInteger(header) || header < 1) {
    return { error: "The header row number must be a whole number, 1 or more." };
  }
  const last = Number(lastRow);
  const firstDataRow = header + 1;
  const rangeCheck = buildRange(parsed.columns[0].letter, firstDataRow, last);
  if (rangeCheck.error) return { error: rangeCheck.error };

  const columns = parsed.columns.map((column) => {
    const built = buildRange(column.letter, firstDataRow, last);
    return { ...column, range: built.range, absolute: built.absolute };
  });

  const sheet = typeof sheetName === "string" && sheetName.trim() ? sheetName.trim() : "";
  const targetLetter = typeof outputColumn === "string" ? outputColumn.trim().toUpperCase() : "";
  const extra = typeof notes === "string" ? notes.trim() : "";
  const rowCount = last - header;

  const qualify = (range) => (sheet ? `'${sheet}'!${range}` : range);

  const lines = [
    `Write a formula for ${platform.label}.`,
    "",
    `WHAT IT MUST DO: ${described}`,
    `CATEGORY: ${goal.label}. ${goal.directive}`,
    "",
    `SHEET LAYOUT${sheet ? ` — sheet named "${sheet}"` : ""}:`,
    `- Header row: ${header}. Data runs from row ${firstDataRow} to row ${last} (${rowCount.toLocaleString("en-US")} data rows).`,
    "- Columns:",
    ...columns.map(
      (column) => `  ${column.letter} = ${column.name} → range ${qualify(column.range)} (absolute ${qualify(column.absolute)})`,
    ),
  ];

  if (targetLetter) {
    lines.push(`- The formula goes in column ${targetLetter}, starting at ${targetLetter}${firstDataRow}.`);
  }

  lines.push(
    "",
    "DIALECT RULES:",
    `- Argument separator: "${separator.character}". Write every formula with it.`,
    `- Functions available: ${platform.available.join(", ")}.`,
    `- Do NOT use: ${platform.unavailable.join(", ")} — not available here.`,
    `- ${platform.arrayNote}`,
    "",
    "ANSWER WITH:",
    "1. The formula on one line, ready to paste, using the real column letters above.",
    "2. Which cell to put it in, and whether to fill it down or let it spill.",
    "3. A plain-language read of the formula, one clause at a time.",
    "4. What it returns for the awkward cases: blank cells, text where a number is expected, no match, and division by zero.",
    "5. One alternative approach, and why you did not choose it.",
    "",
    "RULES:",
    "- Use the exact column letters and ranges given above. Do not invent a column that is not listed.",
    "- Prefer absolute references for lookup ranges so the formula survives being filled down.",
    "- Wrap anything that can error, and say what the fallback value means.",
    "- Do not use whole-column references over hundreds of thousands of rows if a bounded range will do.",
    "- If the task cannot be done with one formula, say so and give the smallest set of helper columns instead.",
  );

  if (extra) lines.push(`- ${extra}`);

  const text = lines.join("\n");
  return {
    text,
    columns,
    columnCount: columns.length,
    firstDataRow,
    lastRow: last,
    rowCount,
    platform,
    separator,
    goal,
    sheet,
    targetLetter,
    ...measureText(text),
  };
}
