/**
 * Code Beautifier — format or compact a snippet of JavaScript, JSON, CSS,
 * HTML, XML or SQL.
 *
 * Pure JavaScript: no React, no DOM, no clock. `js-beautify` does the
 * indentation for the JS/CSS/HTML family; JSON, SQL and the minifiers are
 * implemented here so their rules are explicit and testable.
 */

import jsBeautify from "js-beautify";

/** Languages this tool handles, in menu order. */
export const LANGUAGES = [
  { key: "javascript", label: "JavaScript / TypeScript", ext: "js" },
  { key: "json", label: "JSON", ext: "json" },
  { key: "css", label: "CSS / SCSS / LESS", ext: "css" },
  { key: "html", label: "HTML", ext: "html" },
  { key: "xml", label: "XML / SVG", ext: "xml" },
  { key: "sql", label: "SQL", ext: "sql" },
];

/** What to do with the snippet. */
export const MODES = [
  { key: "beautify", label: "Beautify" },
  { key: "minify", label: "Minify" },
];

/** Indent widths offered; 2 is the default in Prettier and the Google style guides. */
export const INDENT_SIZES = [2, 4, 8];
export const DEFAULT_INDENT = 2;

/** Roughly 500 KB — past this the browser main thread starts to stutter. */
export const MAX_INPUT_CHARS = 500_000;

/**
 * SQL clauses that start a new line. Longer phrases are listed before their
 * prefixes so "LEFT OUTER JOIN" wins over "LEFT JOIN" and "JOIN".
 */
export const SQL_MAJOR_CLAUSES = [
  "INSERT INTO",
  "DELETE FROM",
  "CREATE TABLE",
  "ALTER TABLE",
  "DROP TABLE",
  "GROUP BY",
  "ORDER BY",
  "UNION ALL",
  "LEFT OUTER JOIN",
  "RIGHT OUTER JOIN",
  "FULL OUTER JOIN",
  "CROSS JOIN",
  "INNER JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "FULL JOIN",
  "SELECT",
  "FROM",
  "WHERE",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "UNION",
  "VALUES",
  "UPDATE",
  "RETURNING",
  "WITH",
  "JOIN",
  "SET",
  // Sub-clauses come last so a longer phrase is always matched first.
  "ON",
  "AND",
  "OR",
];

/** Clauses that hang one level under the clause above them. */
export const SQL_SUB_CLAUSES = new Set(["ON", "AND", "OR"]);

/** Reserved words uppercased when "uppercase keywords" is on. */
export const SQL_KEYWORDS = new Set([
  "SELECT", "FROM", "WHERE", "GROUP", "BY", "ORDER", "HAVING", "LIMIT", "OFFSET",
  "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "RETURNING", "WITH",
  "JOIN", "INNER", "LEFT", "RIGHT", "FULL", "OUTER", "CROSS", "ON", "AND", "OR",
  "NOT", "NULL", "IS", "IN", "LIKE", "ILIKE", "BETWEEN", "EXISTS", "CASE", "WHEN",
  "THEN", "ELSE", "END", "AS", "DISTINCT", "ALL", "UNION", "ASC", "DESC", "CREATE",
  "TABLE", "ALTER", "DROP", "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "DEFAULT",
  "UNIQUE", "INDEX", "CONSTRAINT", "CASCADE", "USING", "OVER", "PARTITION",
]);

/**
 * A `/` starts a regular expression literal only when the previous
 * significant character cannot end an expression. This is the standard
 * heuristic used by JS tokenizers that do not parse.
 */
const REGEX_ALLOWED_BEFORE = new Set([
  "(", ",", "=", ":", "[", "!", "&", "|", "?", "{", "}", ";", "+", "-", "*", "%",
  "~", "^", "<", ">", "\n", "",
]);
const REGEX_ALLOWED_KEYWORDS = new Set([
  "return", "typeof", "instanceof", "in", "of", "new", "delete", "void", "do",
  "else", "case", "yield", "await", "throw",
]);

/** Guess the language from the shape of the snippet. */
export function detectLanguage(code) {
  const trimmed = String(code == null ? "" : code).trim();
  if (!trimmed) return "javascript";
  if (/^(--|\/\*)?\s*(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+(TABLE|INDEX|VIEW)|ALTER\s+TABLE|WITH)\b/i.test(trimmed)) {
    return "sql";
  }
  if (/^[[{]/.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      /* not JSON — fall through */
    }
  }
  if (/^<\?xml|^<svg[\s>]/i.test(trimmed)) return "xml";
  if (/^<!doctype\s+html|^<html[\s>]|<\/(div|body|head|span|p|section)>/i.test(trimmed)) return "html";
  if (/^</.test(trimmed)) return "xml";
  if (/[{][^{}]*:[^{};]*;/.test(trimmed) && !/[;)]\s*(function|=>)/.test(trimmed)) return "css";
  return "javascript";
}

/**
 * Remove `//` and block comments without touching strings, template
 * literals or regular expression literals.
 */
export function stripJsComments(code) {
  const source = String(code == null ? "" : code);
  let out = "";
  let i = 0;
  let lastSignificant = "";
  let lastWord = "";
  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      let j = i + 1;
      while (j < source.length) {
        if (source[j] === "\\") {
          j += 2;
          continue;
        }
        if (source[j] === quote) break;
        j += 1;
      }
      out += source.slice(i, Math.min(j + 1, source.length));
      lastSignificant = quote;
      lastWord = "";
      i = j + 1;
      continue;
    }

    if (ch === "/" && next === "/") {
      while (i < source.length && source[i] !== "\n") i += 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);
      i = end === -1 ? source.length : end + 2;
      continue;
    }

    if (ch === "/") {
      const canBeRegex =
        REGEX_ALLOWED_BEFORE.has(lastSignificant) || REGEX_ALLOWED_KEYWORDS.has(lastWord);
      if (canBeRegex) {
        let j = i + 1;
        let inClass = false;
        while (j < source.length) {
          const c = source[j];
          if (c === "\\") {
            j += 2;
            continue;
          }
          if (c === "[") inClass = true;
          else if (c === "]") inClass = false;
          else if (c === "/" && !inClass) break;
          else if (c === "\n") break;
          j += 1;
        }
        if (source[j] === "/") {
          out += source.slice(i, j + 1);
          lastSignificant = "/";
          lastWord = "";
          i = j + 1;
          continue;
        }
      }
    }

    out += ch;
    if (!/\s/.test(ch)) {
      lastSignificant = ch;
      lastWord = /[A-Za-z_$]/.test(ch) ? lastWord + ch : "";
    } else if (ch === "\n") {
      lastSignificant = "\n";
      lastWord = "";
    } else {
      lastWord = "";
    }
    i += 1;
  }
  return out;
}

/**
 * Compact JavaScript: comments and indentation go, line breaks stay.
 * Keeping the newlines means automatic semicolon insertion behaves exactly
 * as it did in the original, so the output cannot change meaning.
 */
export function minifyJs(code) {
  const withoutComments = stripJsComments(code);
  let out = "";
  let i = 0;
  while (i < withoutComments.length) {
    const ch = withoutComments[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      let j = i + 1;
      while (j < withoutComments.length) {
        if (withoutComments[j] === "\\") {
          j += 2;
          continue;
        }
        if (withoutComments[j] === quote) break;
        j += 1;
      }
      out += withoutComments.slice(i, Math.min(j + 1, withoutComments.length));
      i = j + 1;
      continue;
    }
    if (/\s/.test(ch)) {
      let j = i;
      let sawNewline = false;
      while (j < withoutComments.length && /\s/.test(withoutComments[j])) {
        if (withoutComments[j] === "\n") sawNewline = true;
        j += 1;
      }
      out += sawNewline ? "\n" : " ";
      i = j;
      continue;
    }
    out += ch;
    i += 1;
  }
  return out.replace(/\n{2,}/g, "\n").trim();
}

/** Compact CSS: drop `/* *​/` comments, collapse whitespace, tighten punctuation. */
export function minifyCss(code) {
  return String(code == null ? "" : code)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>~])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

/** Compact HTML/XML: drop comments and whitespace between tags. */
export function minifyMarkup(code) {
  return String(code == null ? "" : code)
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Split XML into tags, text, comments and CDATA. Written here rather than
 * reused from the HTML beautifier because that one applies HTML's inline
 * versus block rules, which do not exist in XML — `<b>` is just an element.
 */
export function tokenizeXml(xml) {
  const source = String(xml == null ? "" : xml);
  const tokens = [];
  let i = 0;
  while (i < source.length) {
    if (source[i] === "<") {
      if (source.startsWith("<!--", i)) {
        const end = source.indexOf("-->", i);
        const stop = end === -1 ? source.length : end + 3;
        tokens.push({ type: "comment", value: source.slice(i, stop) });
        i = stop;
        continue;
      }
      if (source.startsWith("<![CDATA[", i)) {
        const end = source.indexOf("]]>", i);
        const stop = end === -1 ? source.length : end + 3;
        tokens.push({ type: "cdata", value: source.slice(i, stop) });
        i = stop;
        continue;
      }
      // Scan to the closing `>`, ignoring any inside a quoted attribute.
      let j = i + 1;
      let quote = "";
      while (j < source.length) {
        const ch = source[j];
        if (quote) {
          if (ch === quote) quote = "";
        } else if (ch === '"' || ch === "'") {
          quote = ch;
        } else if (ch === ">") {
          break;
        }
        j += 1;
      }
      const raw = source.slice(i, Math.min(j + 1, source.length));
      let type = "open";
      if (raw.startsWith("</")) type = "close";
      else if (raw.startsWith("<?") || raw.startsWith("<!")) type = "meta";
      else if (/\/>$/.test(raw)) type = "self";
      tokens.push({ type, value: raw });
      i = j + 1;
      continue;
    }
    const next = source.indexOf("<", i);
    const stop = next === -1 ? source.length : next;
    const text = source.slice(i, stop).trim();
    if (text) tokens.push({ type: "text", value: text });
    i = stop;
  }
  return tokens;
}

/** Indent XML one element per line; short text-only elements stay inline. */
export function formatXml(xml, indentSize = DEFAULT_INDENT) {
  const tokens = tokenizeXml(xml);
  if (tokens.length === 0) return { error: "There is no XML to format." };
  const pad = " ".repeat(Math.max(1, indentSize));
  const lines = [];
  let depth = 0;
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.type === "close") {
      depth = Math.max(0, depth - 1);
      lines.push(pad.repeat(depth) + token.value);
      continue;
    }
    if (token.type === "open") {
      const text = tokens[i + 1];
      const close = tokens[i + 2];
      if (text && text.type === "text" && close && close.type === "close") {
        lines.push(pad.repeat(depth) + token.value + text.value + close.value);
        i += 2;
        continue;
      }
      lines.push(pad.repeat(depth) + token.value);
      depth += 1;
      continue;
    }
    lines.push(pad.repeat(depth) + token.value);
  }
  const output = lines.join("\n").trim();
  if (!output) return { error: "There is no XML to format." };
  return { output };
}

/** Byte offset → 1-based line and column, for JSON parse errors. */
export function offsetToLineColumn(text, offset) {
  const upto = String(text || "").slice(0, Math.max(0, offset));
  const lines = upto.split("\n");
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

/** Pretty-print JSON, or report exactly where it broke. */
export function formatJson(code, indentSize = DEFAULT_INDENT, minify = false) {
  const source = String(code == null ? "" : code).trim();
  if (!source) return { error: "There is no JSON to format." };
  let parsed;
  try {
    parsed = JSON.parse(source);
  } catch (parseError) {
    const message = String(parseError && parseError.message ? parseError.message : parseError);
    // The engines disagree: V8 sometimes reports a byte position, Firefox
    // reports line and column, and newer V8 echoes the source instead. Take
    // whichever is available and drop the echoed blob, which is unreadable.
    const clean = message.replace(/,\s*"[\s\S]*$/, "").replace(/\s*in JSON at position \d+.*$/, "").trim();
    const positionMatch = /position (\d+)/.exec(message);
    if (positionMatch) {
      const { line, column } = offsetToLineColumn(source, Number(positionMatch[1]));
      return { error: `Invalid JSON at line ${line}, column ${column}: ${clean}.` };
    }
    const lineColumnMatch = /line (\d+) column (\d+)/.exec(message);
    if (lineColumnMatch) {
      return { error: `Invalid JSON at line ${lineColumnMatch[1]}, column ${lineColumnMatch[2]}: ${clean}.` };
    }
    return { error: `Invalid JSON: ${clean}. Check for a trailing comma, a missing value or single quotes instead of double.` };
  }
  return { output: minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indentSize) };
}

/** Split SQL into strings, comments, punctuation and words. */
export function tokenizeSql(sql) {
  const source = String(sql == null ? "" : sql);
  const tokens = [];
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (ch === "-" && source[i + 1] === "-") {
      const end = source.indexOf("\n", i);
      tokens.push({ type: "comment", value: source.slice(i, end === -1 ? source.length : end) });
      i = end === -1 ? source.length : end;
      continue;
    }
    if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      tokens.push({ type: "comment", value: source.slice(i, end === -1 ? source.length : end + 2) });
      i = end === -1 ? source.length : end + 2;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      const quote = ch;
      let j = i + 1;
      while (j < source.length) {
        if (source[j] === quote && source[j + 1] === quote) {
          j += 2;
          continue;
        }
        if (source[j] === quote) break;
        j += 1;
      }
      tokens.push({ type: "string", value: source.slice(i, Math.min(j + 1, source.length)) });
      i = j + 1;
      continue;
    }
    if (/[A-Za-z_@#$]/.test(ch)) {
      let j = i;
      while (j < source.length && /[A-Za-z0-9_@#$.]/.test(source[j])) j += 1;
      tokens.push({ type: "word", value: source.slice(i, j) });
      i = j;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < source.length && /[0-9.eE]/.test(source[j])) j += 1;
      tokens.push({ type: "number", value: source.slice(i, j) });
      i = j;
      continue;
    }
    tokens.push({ type: "punct", value: ch });
    i += 1;
  }
  return tokens;
}

function matchClause(tokens, index) {
  for (const clause of SQL_MAJOR_CLAUSES) {
    const parts = clause.split(" ");
    let ok = true;
    for (let k = 0; k < parts.length; k += 1) {
      const token = tokens[index + k];
      if (!token || token.type !== "word" || token.value.toUpperCase() !== parts[k]) {
        ok = false;
        break;
      }
    }
    if (ok) return { clause, length: parts.length };
  }
  return null;
}

const NO_SPACE_BEFORE = new Set([",", ")", ";", ".", "(", "%"]);

/**
 * Format SQL: one major clause per line, list items one per line, and a
 * level of indentation for each level of parentheses.
 */
export function formatSql(sql, indentSize = DEFAULT_INDENT, uppercaseKeywords = true) {
  const tokens = tokenizeSql(sql);
  if (tokens.length === 0) return { error: "There is no SQL to format." };

  const pad = " ".repeat(Math.max(1, indentSize));
  const lines = [];
  let current = "";
  let currentIndent = 0;
  let depth = 0;
  let clauseIndent = 0;
  /** One entry per open `(`: true when the group was broken across lines. */
  const parenStack = [];

  const flush = () => {
    if (current.trim()) lines.push(pad.repeat(currentIndent) + current.trim());
    current = "";
  };
  const startLine = (indent) => {
    flush();
    currentIndent = Math.max(0, indent);
  };
  const append = (text, glue = true) => {
    if (!current) current = text;
    else if (!glue || NO_SPACE_BEFORE.has(text) || current.endsWith("(")) current += text;
    else current += ` ${text}`;
  };

  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];

    if (token.type === "comment") {
      startLine(depth);
      current = token.value;
      startLine(depth);
      i += 1;
      continue;
    }

    if (token.type === "word") {
      const matched = matchClause(tokens, i);
      if (matched) {
        const isSub = SQL_SUB_CLAUSES.has(matched.clause);
        clauseIndent = depth + (isSub ? 1 : 0);
        startLine(clauseIndent);
        current = uppercaseKeywords ? matched.clause : matched.clause.toLowerCase();
        i += matched.length;
        continue;
      }
      const upper = token.value.toUpperCase();
      append(uppercaseKeywords && SQL_KEYWORDS.has(upper) ? upper : token.value);
      i += 1;
      continue;
    }

    if (token.type === "punct") {
      if (token.value === "(") {
        // `count(*)` stays tight; `IN (…)` and `VALUES (…)` get a space.
        const trailingWord = (current.match(/([A-Za-z_]+)\s*$/) || [])[1];
        if (trailingWord && SQL_KEYWORDS.has(trailingWord.toUpperCase())) current += " (";
        else append("(");
        depth += 1;
        const nextClause = matchClause(tokens, i + 1);
        // A parenthesised sub-query gets its own indented block.
        const broken = Boolean(nextClause && nextClause.clause === "SELECT");
        parenStack.push(broken);
        if (broken) startLine(depth);
        i += 1;
        continue;
      }
      if (token.value === ")") {
        const broken = parenStack.pop();
        depth = Math.max(0, depth - 1);
        if (broken || !current.trim()) startLine(depth);
        append(")");
        i += 1;
        continue;
      }
      if (token.value === ",") {
        append(",");
        const insideBrokenGroup = parenStack.length > 0 && parenStack[parenStack.length - 1];
        // Only break the line for commas that separate top-level list items,
        // never for the ones inside `count(a, b)` or a VALUES tuple.
        if (parenStack.length === 0) startLine(clauseIndent + 1);
        else if (insideBrokenGroup) startLine(depth);
        i += 1;
        continue;
      }
      if (token.value === ";") {
        append(";");
        startLine(0);
        depth = 0;
        i += 1;
        continue;
      }
      append(token.value);
      i += 1;
      continue;
    }

    append(token.value);
    i += 1;
  }
  flush();
  const output = lines.join("\n").trim();
  if (!output) return { error: "There is no SQL to format." };
  return { output };
}

/** Compact SQL: comments removed, everything on one line. */
export function minifySql(sql) {
  const tokens = tokenizeSql(sql).filter((token) => token.type !== "comment");
  let out = "";
  for (const token of tokens) {
    if (!out) out = token.value;
    else if (NO_SPACE_BEFORE.has(token.value) || out.endsWith("(")) out += token.value;
    else out += ` ${token.value}`;
  }
  return out.trim();
}

/** UTF-8 byte length of a string. */
export function byteLength(text) {
  return new TextEncoder().encode(String(text == null ? "" : text)).length;
}

/**
 * Total function: format or compact `code`.
 * Returns `{ error }` or a complete result — never NaN, never Infinity.
 *
 * @param {{code: string, language?: string, mode?: string, indentSize?: number, uppercaseKeywords?: boolean}} options
 */
export function processCode({
  code,
  language = "javascript",
  mode = "beautify",
  indentSize = DEFAULT_INDENT,
  uppercaseKeywords = true,
} = {}) {
  const source = String(code == null ? "" : code);
  if (!source.trim()) return { error: "Paste some code to format." };
  if (source.length > MAX_INPUT_CHARS) {
    return { error: `That snippet is too long — the limit is ${MAX_INPUT_CHARS.toLocaleString("en-US")} characters.` };
  }
  const lang = LANGUAGES.some((entry) => entry.key === language) ? language : "javascript";
  const action = MODES.some((entry) => entry.key === mode) ? mode : "beautify";
  const indent = INDENT_SIZES.includes(Number(indentSize)) ? Number(indentSize) : DEFAULT_INDENT;

  let output;
  try {
    if (lang === "json") {
      const json = formatJson(source, indent, action === "minify");
      if (json.error) return { error: json.error };
      output = json.output;
    } else if (lang === "sql") {
      if (action === "minify") output = minifySql(source);
      else {
        const formatted = formatSql(source, indent, uppercaseKeywords);
        if (formatted.error) return { error: formatted.error };
        output = formatted.output;
      }
    } else if (lang === "css") {
      output = action === "minify" ? minifyCss(source) : jsBeautify.css(source, { indent_size: indent });
    } else if (lang === "xml") {
      if (action === "minify") output = minifyMarkup(source);
      else {
        const formatted = formatXml(source, indent);
        if (formatted.error) return { error: formatted.error };
        output = formatted.output;
      }
    } else if (lang === "html") {
      output =
        action === "minify"
          ? minifyMarkup(source)
          : jsBeautify.html(source, { indent_size: indent, wrap_line_length: 0, preserve_newlines: false });
    } else {
      output =
        action === "minify"
          ? minifyJs(source)
          : jsBeautify.js(source, { indent_size: indent, end_with_newline: false });
    }
  } catch (formatError) {
    return { error: `That snippet could not be formatted: ${String(formatError && formatError.message ? formatError.message : formatError)}` };
  }

  if (typeof output !== "string" || !output.trim()) {
    return { error: "Formatting produced no output — check that the snippet is complete." };
  }

  const inputBytes = byteLength(source);
  const outputBytes = byteLength(output);
  const delta = inputBytes - outputBytes;

  return {
    output,
    language: lang,
    mode: action,
    indentSize: indent,
    inputBytes,
    outputBytes,
    inputLines: source.split("\n").length,
    outputLines: output.split("\n").length,
    bytesSaved: delta,
    // Guarded division: inputBytes is at least 1 because the input is non-blank.
    percentChange: inputBytes > 0 ? Math.round((delta / inputBytes) * 1000) / 10 : 0,
    fileName: `formatted.${(LANGUAGES.find((entry) => entry.key === lang) || { ext: "txt" }).ext}`,
  };
}
