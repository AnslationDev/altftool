/**
 * Tab to Spaces Converter — and back again, using real tab stops.
 *
 * THE RULE THAT MOST CONVERTERS GET WRONG
 *   A tab character is not "N spaces". It advances the cursor to the next tab stop, and
 *   tab stops sit at every multiple of the tab size. This is how terminals, printers and
 *   every text editor have behaved since the teletype, and it is what POSIX `expand`
 *   implements.
 *
 *       spacesToInsert = tabSize - (currentColumn mod tabSize)
 *
 *   So with tabSize 4, a tab at column 0 inserts 4 spaces, but a tab at column 6 inserts
 *   only 2 — enough to reach column 8. A naive replace-all of "\t" with four spaces
 *   silently destroys every aligned comment and table in the file. This tool tracks the
 *   column and does it properly.
 *
 * GOING BACK (spaces to tabs) — POSIX `unexpand`
 *   A run of spaces can become a tab whenever the run crosses a tab stop. Doing this
 *   everywhere is risky, because runs of spaces inside string literals would be rewritten
 *   too, so leading-indentation-only is the default and matches `unexpand` with no -a.
 *
 * DETECTING WHAT A FILE ALREADY USES
 *   Lines are classified by their first indent character: tab, space, or neither.
 *   For space-indented files the indent width is guessed by scoring the candidate sizes
 *   8, 4, 2 and 3 on how many of the file's distinct indent widths are exact multiples,
 *   preferring the largest size that explains everything. That scoring is this tool's own
 *   heuristic, not a standard.
 *
 * Pure module: text in, text and counts out. No clock, no DOM.
 */

/** Tab size the tool defaults to, matching the POSIX `expand` default. */
export const DEFAULT_TAB_SIZE = 4;

/** Range of tab sizes the tool accepts. */
export const MIN_TAB_SIZE = 1;
export const MAX_TAB_SIZE = 16;

/** Candidate indent widths, tried largest first so 8 wins over 4 over 2. */
export const CANDIDATE_INDENT_SIZES = [8, 4, 3, 2];

/** Largest input this tool will process in one go, in characters. */
export const MAX_CHARACTERS = 500000;

/** Line-ending styles the tool can normalise to. */
export const LINE_ENDINGS = [
  { id: "keep", label: "Leave as they are", value: null },
  { id: "lf", label: "LF (Unix, \\n)", value: "\n" },
  { id: "crlf", label: "CRLF (Windows, \\r\\n)", value: "\r\n" },
];

/**
 * Expand tabs to spaces using real tab stops.
 * @param {string} text
 * @param {number} tabSize
 * @returns {string}
 */
export function expandTabs(text, tabSize = DEFAULT_TAB_SIZE) {
  const size = clampTabSize(tabSize);
  let out = "";
  let column = 0;
  for (const ch of text) {
    if (ch === "\t") {
      const gap = size - (column % size);
      out += " ".repeat(gap);
      column += gap;
    } else if (ch === "\n" || ch === "\r") {
      out += ch;
      column = 0;
    } else {
      out += ch;
      column += 1;
    }
  }
  return out;
}

/**
 * Turn runs of spaces back into tabs.
 * @param {string} text
 * @param {number} tabSize
 * @param {boolean} leadingOnly  true = indentation only (POSIX `unexpand`),
 *                               false = every run of two or more blanks (`unexpand -a`)
 */
export function collapseSpaces(text, tabSize = DEFAULT_TAB_SIZE, leadingOnly = true) {
  const size = clampTabSize(tabSize);
  if (size === 1) return text; // every column is a tab stop; collapsing is meaningless
  const expanded = expandTabs(text, size);

  return expanded
    .split("\n")
    .map((line) => {
      if (leadingOnly) {
        const match = /^ +/.exec(line);
        if (!match) return line;
        const width = match[0].length;
        const tabs = Math.floor(width / size);
        if (tabs === 0) return line;
        return "\t".repeat(tabs) + " ".repeat(width % size) + line.slice(width);
      }

      // Every run of two or more spaces that crosses a tab stop becomes tabs.
      let out = "";
      let column = 0;
      let i = 0;
      while (i < line.length) {
        if (line[i] !== " ") {
          out += line[i];
          column += 1;
          i += 1;
          continue;
        }
        let runEnd = i;
        while (runEnd < line.length && line[runEnd] === " ") runEnd += 1;
        const runLength = runEnd - i;
        const start = column;
        const end = column + runLength;
        // First tab stop strictly after the start of the run.
        let stop = start + (size - (start % size));
        if (runLength < 2 || stop > end) {
          out += " ".repeat(runLength);
        } else {
          while (stop <= end) {
            out += "\t";
            stop += size;
          }
          out += " ".repeat(end - (stop - size));
        }
        column = end;
        i = runEnd;
      }
      return out;
    })
    .join("\n");
}

function clampTabSize(tabSize) {
  const size = Math.trunc(Number(tabSize));
  if (!Number.isFinite(size)) return DEFAULT_TAB_SIZE;
  return Math.max(MIN_TAB_SIZE, Math.min(MAX_TAB_SIZE, size));
}

/**
 * Work out what a file currently uses for indentation.
 * @returns {{style: "tabs"|"spaces"|"mixed"|"none", size: number|null,
 *            tabLines: number, spaceLines: number, mixedLines: number}}
 */
export function detectIndentation(text) {
  if (typeof text !== "string")
    return { style: "none", size: null, tabLines: 0, spaceLines: 0, mixedLines: 0 };

  const lines = text.split(/\r?\n/);
  let tabLines = 0;
  let spaceLines = 0;
  let mixedLines = 0;
  const widths = new Set();

  for (const line of lines) {
    const indent = /^[ \t]+/.exec(line);
    if (!indent || line.trim() === "") continue;
    const lead = indent[0];
    const hasTab = lead.indexOf("\t") !== -1;
    const hasSpace = lead.indexOf(" ") !== -1;
    if (hasTab && hasSpace) mixedLines += 1;
    else if (hasTab) tabLines += 1;
    else {
      spaceLines += 1;
      widths.add(lead.length);
    }
  }

  let style = "none";
  if (mixedLines > 0 && tabLines + spaceLines > 0) style = "mixed";
  else if (mixedLines > 0) style = "mixed";
  else if (tabLines > 0 && spaceLines > 0) style = "mixed";
  else if (tabLines > 0) style = "tabs";
  else if (spaceLines > 0) style = "spaces";

  let size = null;
  if (widths.size > 0) {
    let best = null;
    for (const candidate of CANDIDATE_INDENT_SIZES) {
      let explained = 0;
      for (const width of widths) if (width % candidate === 0) explained += 1;
      const score = explained / widths.size;
      if (best === null || score > best.score) best = { candidate, score };
    }
    // Only claim a size when it explains every distinct indent width seen.
    size = best && best.score === 1 ? best.candidate : null;
  }

  return { style, size, tabLines, spaceLines, mixedLines, distinctIndentWidths: widths.size };
}

/** UTF-8 byte length — what the file will actually weigh. */
export function byteLength(text) {
  if (typeof text !== "string") return 0;
  if (typeof TextEncoder === "function") return new TextEncoder().encode(text).length;
  return Buffer.byteLength(text, "utf8");
}

export const DEFAULT_OPTIONS = {
  direction: "tabsToSpaces", // or "spacesToTabs"
  tabSize: DEFAULT_TAB_SIZE,
  leadingOnly: true,
  trimTrailing: false,
  lineEnding: "keep",
};

/**
 * Run a conversion.
 *
 * @param {string} text
 * @param {object} [options] see DEFAULT_OPTIONS
 * @returns {object} { output, ... counts } or { error }
 */
export function convert(text, options = {}) {
  if (typeof text !== "string" || text === "")
    return { error: "Paste some text or code to convert." };
  if (text.length > MAX_CHARACTERS)
    return {
      error: `That input is ${text.length.toLocaleString("en-US")} characters — the limit is ${MAX_CHARACTERS.toLocaleString("en-US")}.`,
    };

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const size = Math.trunc(Number(opts.tabSize));
  if (!Number.isFinite(size) || size < MIN_TAB_SIZE || size > MAX_TAB_SIZE)
    return { error: `Tab size must be a whole number between ${MIN_TAB_SIZE} and ${MAX_TAB_SIZE}.` };
  if (opts.direction !== "tabsToSpaces" && opts.direction !== "spacesToTabs")
    return { error: "Pick a direction: tabs to spaces, or spaces to tabs." };

  const before = detectIndentation(text);

  let output =
    opts.direction === "tabsToSpaces"
      ? expandTabs(text, size)
      : collapseSpaces(text, size, opts.leadingOnly);

  if (opts.trimTrailing) {
    output = output
      .split("\n")
      .map((line) => line.replace(/[ \t]+(\r?)$/, "$1"))
      .join("\n");
  }

  const endingOption = LINE_ENDINGS.find((e) => e.id === opts.lineEnding);
  if (endingOption && endingOption.value) {
    output = output.replace(/\r\n|\r|\n/g, endingOption.value);
  }

  const countTabs = (s) => (s.match(/\t/g) || []).length;
  const originalLines = text.split(/\r?\n/);
  const outputLines = output.split(/\r?\n/);
  let changedLines = 0;
  const lineCount = Math.max(originalLines.length, outputLines.length);
  for (let i = 0; i < lineCount; i += 1) {
    if (originalLines[i] !== outputLines[i]) changedLines += 1;
  }

  const originalBytes = byteLength(text);
  const outputBytes = byteLength(output);

  return {
    output,
    tabSize: size,
    direction: opts.direction,
    before,
    after: detectIndentation(output),
    tabsBefore: countTabs(text),
    tabsAfter: countTabs(output),
    lines: originalLines.length,
    changedLines,
    originalBytes,
    outputBytes,
    byteChange: outputBytes - originalBytes,
  };
}
