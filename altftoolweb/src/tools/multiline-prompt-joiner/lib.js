/**
 * Multiline Prompt Joiner
 *
 * Collapses a multi-line prompt into a single string literal, escaped for the
 * target language. Escaping follows the published grammars:
 *   - JSON strings: RFC 8259 section 7 (must escape the quote, the backslash
 *     and every character from U+0000 to U+001F)
 *   - JavaScript literals: ECMA-262 StringLiteral and TemplateLiteral
 *   - Python literals: Python Language Reference 2.4.1 (string escapes)
 *   - Java literals: JLS 3.10.5 (Java has no vertical-tab escape)
 *   - YAML double-quoted scalars: YAML 1.2 section 7.3.1
 *   - POSIX shell quoting: POSIX.1-2017 Shell Command Language 2.2
 *   - Bash ANSI-C quoting: the dollar-quote form understands backslash escapes
 */

/** Control characters that every C-family grammar spells the same way. */
const CONTROL_ESCAPES = {
  8: "\\b", // backspace       U+0008
  9: "\\t", // character tab   U+0009
  10: "\\n", // line feed       U+000A
  12: "\\f", // form feed       U+000C
  13: "\\r", // carriage return U+000D
};

/** Highest code point that JSON and ECMAScript treat as a control character. */
const CONTROL_MAX = 0x1f;
/** DELETE (U+007F) is legal raw but is unsafe to paste into source. */
const DELETE_CODE = 0x7f;
/** U+000B vertical tab: JS, Python and C# have an escape for it, Java does not. */
const VERTICAL_TAB = 0x0b;

function padHex(code, width) {
  return code.toString(16).padStart(width, "0");
}

/**
 * Escape one line (a line never contains a newline) for a C-family grammar.
 * The `unicode` option picks the fallback spelling for control characters:
 * "u4" produces a four-digit backslash-u escape, "x2" produces a two-digit
 * backslash-x escape.
 */
function escapeCLike(line, options) {
  const {
    quote,
    unicode = "u4",
    verticalTab = false,
    dollarBrace = false,
  } = options;
  const chars = Array.from(line);
  let out = "";

  for (let i = 0; i < chars.length; i += 1) {
    const ch = chars[i];
    const code = ch.codePointAt(0);

    if (ch === "\\") {
      out += "\\\\";
    } else if (quote && ch === quote) {
      out += `\\${quote}`;
    } else if (dollarBrace && ch === "$" && chars[i + 1] === "{") {
      out += "\\$";
    } else if (verticalTab && code === VERTICAL_TAB) {
      out += "\\v";
    } else if (CONTROL_ESCAPES[code]) {
      out += CONTROL_ESCAPES[code];
    } else if (code <= CONTROL_MAX || code === DELETE_CODE) {
      out += unicode === "x2" ? `\\x${padHex(code, 2)}` : `\\u${padHex(code, 4)}`;
    } else {
      out += ch;
    }
  }

  return out;
}

/**
 * POSIX single quotes escape nothing at all, so an embedded apostrophe has to
 * close the quote, emit a backslash-apostrophe, then reopen the quote.
 */
function escapePosixSingle(line) {
  return line.split("'").join("'\\''");
}

/** Inside POSIX double quotes only backslash, quote, dollar and backtick are special. */
function escapePosixDouble(line) {
  return line.replace(/[\\"$`]/g, (ch) => `\\${ch}`);
}

/**
 * Supported targets.
 * newlineEscape: the sequence that means "line feed" in this grammar, or null
 *   when the grammar has no such escape.
 * allowsRawNewline: whether a real line break may sit inside the quotes.
 */
export const OUTPUT_FORMATS = [
  {
    id: "json",
    label: "JSON string",
    open: '"',
    close: '"',
    newlineEscape: "\\n",
    allowsRawNewline: false,
    escape: (line) => escapeCLike(line, { quote: '"', unicode: "u4" }),
    note: "RFC 8259 requires every character below U+0020 to be escaped.",
  },
  {
    id: "js-double",
    label: "JavaScript double quotes",
    open: '"',
    close: '"',
    newlineEscape: "\\n",
    allowsRawNewline: false,
    escape: (line) =>
      escapeCLike(line, { quote: '"', unicode: "u4", verticalTab: true }),
    note: "Also valid for TypeScript, C and C# string literals.",
  },
  {
    id: "js-single",
    label: "JavaScript single quotes",
    open: "'",
    close: "'",
    newlineEscape: "\\n",
    allowsRawNewline: false,
    escape: (line) =>
      escapeCLike(line, { quote: "'", unicode: "u4", verticalTab: true }),
    note: "The quote style most JavaScript lint configs default to.",
  },
  {
    id: "js-template",
    label: "JavaScript template literal",
    open: "`",
    close: "`",
    newlineEscape: "\\n",
    allowsRawNewline: true,
    escape: (line) =>
      escapeCLike(line, { quote: "`", unicode: "u4", dollarBrace: true }),
    note: "Backticks and interpolation openers are escaped so nothing evaluates.",
  },
  {
    id: "python-double",
    label: "Python double quotes",
    open: '"',
    close: '"',
    newlineEscape: "\\n",
    allowsRawNewline: false,
    escape: (line) =>
      escapeCLike(line, { quote: '"', unicode: "x2", verticalTab: true }),
    note: "Python spells stray control characters with a two-digit hex escape.",
  },
  {
    id: "java",
    label: "Java, C or Go string",
    open: '"',
    close: '"',
    newlineEscape: "\\n",
    allowsRawNewline: false,
    escape: (line) => escapeCLike(line, { quote: '"', unicode: "u4" }),
    note: "Java has no vertical-tab escape, so U+000B falls back to hex.",
  },
  {
    id: "yaml-double",
    label: "YAML double-quoted scalar",
    open: '"',
    close: '"',
    newlineEscape: "\\n",
    allowsRawNewline: false,
    escape: (line) => escapeCLike(line, { quote: '"', unicode: "x2" }),
    note: "Double quotes are the only YAML scalar style that reads escapes.",
  },
  {
    id: "shell-single",
    label: "POSIX shell single quotes",
    open: "'",
    close: "'",
    newlineEscape: null,
    allowsRawNewline: true,
    escape: escapePosixSingle,
    note: "Single quotes have no line-feed escape, so keep real line breaks.",
  },
  {
    id: "shell-double",
    label: "POSIX shell double quotes",
    open: '"',
    close: '"',
    newlineEscape: null,
    allowsRawNewline: true,
    escape: escapePosixDouble,
    note: "A backslash-n stays literal here, so real line breaks are required.",
  },
  {
    id: "shell-ansi",
    label: "Bash ANSI-C quoting",
    open: "$'",
    close: "'",
    newlineEscape: "\\n",
    allowsRawNewline: false,
    escape: (line) => escapeCLike(line, { quote: "'", unicode: "x2" }),
    note: "The dollar-quote form is the one shell string that reads escapes.",
  },
];

export const NEWLINE_MODES = [
  { id: "escape", label: "Escape line breaks" },
  { id: "space", label: "Join with a space" },
  { id: "raw", label: "Keep real line breaks" },
];

export function getFormat(id) {
  return OUTPUT_FORMATS.find((format) => format.id === id) || null;
}

/**
 * Join a multi-line prompt into one escaped literal.
 *
 * @param {object} input
 * @param {string} input.text            the multi-line prompt
 * @param {string} input.format          an OUTPUT_FORMATS id
 * @param {string} input.newlineMode     a NEWLINE_MODES id
 * @param {boolean} input.trimLines      strip leading and trailing spaces per line
 * @param {boolean} input.dropEmptyLines remove blank lines entirely
 * @param {boolean} input.wrapInQuotes   include the surrounding quote marks
 * @returns {{output:string,body:string,lineCount:number,inputChars:number,
 *   outputChars:number,escapedCount:number,note:string}|{error:string}}
 */
export function joinPromptLines({
  text = "",
  format = "json",
  newlineMode = "escape",
  trimLines = true,
  dropEmptyLines = false,
  wrapInQuotes = true,
} = {}) {
  if (typeof text !== "string") {
    return { error: "The prompt must be text." };
  }
  const target = getFormat(format);
  if (!target) {
    return { error: "Pick one of the supported output formats." };
  }
  if (!NEWLINE_MODES.some((mode) => mode.id === newlineMode)) {
    return { error: "Pick one of the supported line-break handling modes." };
  }
  if (text.trim().length === 0) {
    return { error: "Paste a prompt first - there is nothing to join yet." };
  }
  if (newlineMode === "escape" && target.newlineEscape === null) {
    return {
      error: `${target.label} has no line-feed escape sequence. Join with a space or keep real line breaks instead.`,
    };
  }
  if (newlineMode === "raw" && !target.allowsRawNewline) {
    return {
      error: `${target.label} cannot contain a real line break. Escape the line breaks or join with a space instead.`,
    };
  }

  // Normalise CRLF and lone CR first so the line count is stable.
  let lines = text.replace(/\r\n?/g, "\n").split("\n");
  if (trimLines) lines = lines.map((line) => line.trim());
  // "Drop blank lines" means whitespace-only lines too, regardless of whether
  // trimLines itself is on - the filter check is independent of whether the
  // surviving line content gets trimmed.
  if (dropEmptyLines) lines = lines.filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return { error: "Every line was blank after trimming." };
  }

  const escapedLines = lines.map((line) => target.escape(line));
  let separator;
  if (newlineMode === "escape") separator = target.newlineEscape;
  else if (newlineMode === "space") separator = " ";
  else separator = "\n";

  let body = escapedLines.join(separator);
  if (newlineMode === "space") {
    // Collapse the runs of spaces created by joining already-spaced lines.
    body = body.replace(/ {2,}/g, " ").trim();
  }

  const output = wrapInQuotes ? `${target.open}${body}${target.close}` : body;
  // Count escape characters directly from what each per-line escape() call
  // inserted (escaped line length minus original line length), summed across
  // all lines. Diffing the final joined strings doesn't work because body and
  // the old joinedRaw comparator go through different whitespace transforms
  // (e.g. newlineMode "space" collapses runs of spaces in body only).
  const escapedCount = escapedLines.reduce(
    (sum, escapedLine, i) => sum + Math.max(0, escapedLine.length - lines[i].length),
    0
  );

  return {
    output,
    body,
    lineCount: lines.length,
    inputChars: text.length,
    outputChars: output.length,
    escapedCount,
    note: target.note,
  };
}
