/**
 * CSS tools — a dependency-free CSS parser with a pretty printer and a
 * minifier. Everything here is pure: same input string, same output string.
 *
 * The parser is a character scanner rather than a regular expression, because
 * CSS values legally contain braces, semicolons and colons inside strings,
 * comments and url() tokens. Regex-based "minifiers" break on
 * url(data:image/svg+xml;base64,...) — this one does not.
 */

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

/** Indent widths offered by the formatter. */
export const INDENT_OPTIONS = [2, 4, 8];
export const DEFAULT_INDENT = 2;

/**
 * A comment starting with "/*!" is the conventional marker for a licence
 * header (used by UglifyJS, cssnano, terser and friends) and survives
 * minification.
 */
export const BANG_COMMENT_PREFIX = "!";


/** Bytes in one kibibyte, used for the size read-out. */
export const BYTES_PER_KIB = 1024;

const NODE_RULE = "rule";
const NODE_DECLARATION = "declaration";
const NODE_COMMENT = "comment";
const NODE_AT_STATEMENT = "at-statement";

/* ------------------------------------------------------------------ */
/* Parser                                                              */
/* ------------------------------------------------------------------ */

function isWhitespace(char) {
  return char === " " || char === "\t" || char === "\n" || char === "\r" || char === "\f";
}

/**
 * Collapse runs of whitespace to a single space without touching the inside
 * of quoted strings.
 */
export function collapseWhitespace(text) {
  let out = "";
  let quote = null;
  let pendingSpace = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quote) {
      out += char;
      if (char === "\\" && i + 1 < text.length) {
        out += text[i + 1];
        i += 1;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      if (pendingSpace && out) out += " ";
      pendingSpace = false;
      quote = char;
      out += char;
      continue;
    }
    if (isWhitespace(char)) {
      pendingSpace = true;
      continue;
    }
    if (pendingSpace && out) out += " ";
    pendingSpace = false;
    out += char;
  }
  return out;
}

/** Split a declaration at its first top-level colon. */
function splitDeclaration(text) {
  let quote = null;
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quote) {
      if (char === "\\") i += 1;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === "(") depth += 1;
    else if (char === ")") depth = Math.max(0, depth - 1);
    else if (char === ":" && depth === 0) {
      return { property: text.slice(0, i).trim(), value: text.slice(i + 1).trim() };
    }
  }
  return null;
}

function makeStatement(raw) {
  const text = raw.trim();
  if (!text) return null;
  if (text.startsWith("@")) {
    const parts = splitDeclaration(text);
    // "@import url(a.css)" has no top-level colon; custom properties do.
    if (!parts || !text.slice(1).match(/^[-\w]+\s*:/)) {
      return { type: NODE_AT_STATEMENT, text };
    }
  }
  const parts = splitDeclaration(text);
  if (!parts || !parts.property) return { type: NODE_AT_STATEMENT, text };
  return { type: NODE_DECLARATION, property: parts.property, value: collapseWhitespace(parts.value) };
}

/**
 * Parse a stylesheet into a node tree.
 * Returns { error } when braces are unbalanced or a comment is unterminated.
 */
export function parseCss(source) {
  const css = String(source == null ? "" : source);
  let index = 0;

  function parseBlock(depth) {
    const nodes = [];
    let buffer = "";
    // Parenthesis depth. Inside url(...), var(...) fallbacks and at-rule
    // preludes, the characters ; { } are ordinary text — a data URI such as
    // url(data:image/svg+xml;base64,...) contains a semicolon that must not
    // end the declaration.
    let parens = 0;

    const flushStatement = () => {
      const node = makeStatement(buffer);
      if (node) nodes.push(node);
      buffer = "";
    };

    while (index < css.length) {
      const char = css[index];

      if (char === "/" && css[index + 1] === "*") {
        const end = css.indexOf("*/", index + 2);
        if (end === -1) return { error: "Unterminated comment — a /* is never closed." };
        const body = css.slice(index + 2, end);
        if (buffer.trim()) flushStatement();
        nodes.push({ type: NODE_COMMENT, text: body });
        index = end + 2;
        continue;
      }

      if (char === '"' || char === "'") {
        const quote = char;
        buffer += char;
        index += 1;
        while (index < css.length) {
          const inner = css[index];
          buffer += inner;
          index += 1;
          if (inner === "\\" && index < css.length) {
            buffer += css[index];
            index += 1;
            continue;
          }
          if (inner === quote) break;
        }
        continue;
      }

      if (char === "(") {
        parens += 1;
        buffer += char;
        index += 1;
        continue;
      }

      if (char === ")") {
        parens = Math.max(0, parens - 1);
        buffer += char;
        index += 1;
        continue;
      }

      if (parens > 0) {
        buffer += char;
        index += 1;
        continue;
      }

      if (char === "{") {
        const prelude = collapseWhitespace(buffer).trim();
        buffer = "";
        index += 1;
        const inner = parseBlock(depth + 1);
        if (inner.error) return inner;
        nodes.push({ type: NODE_RULE, prelude, nodes: inner.nodes });
        continue;
      }

      if (char === "}") {
        if (depth === 0) {
          return { error: "Unbalanced braces — a } appears with no matching {." };
        }
        index += 1;
        flushStatement();
        return { nodes };
      }

      if (char === ";") {
        index += 1;
        flushStatement();
        continue;
      }

      buffer += char;
      index += 1;
    }

    if (depth > 0) return { error: "Unbalanced braces — a { is never closed." };
    flushStatement();
    return { nodes };
  }

  const result = parseBlock(0);
  if (result.error) return result;
  return { nodes: result.nodes };
}

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */

/** Count rules, declarations and comments in a parsed tree. */
export function countNodes(nodes, { dropEmptyRules = false } = {}) {
  let rules = 0;
  let declarations = 0;
  let comments = 0;
  const walk = (list) => {
    for (const node of list) {
      if (node.type === NODE_RULE) {
        if (dropEmptyRules && !hasContent(node)) continue;
        rules += 1;
        walk(node.nodes);
      } else if (node.type === NODE_DECLARATION) declarations += 1;
      else if (node.type === NODE_COMMENT) comments += 1;
    }
  };
  walk(nodes);
  return { rules, declarations, comments };
}

/* ------------------------------------------------------------------ */
/* Printers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Split a selector list on its top-level commas only. Commas inside :is(),
 * :not() and :nth-child(An+B of S) belong to the inner selector.
 */
export function splitTopLevelCommas(text) {
  const parts = [];
  let current = "";
  let quote = null;
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quote) {
      current += char;
      if (char === "\\" && i + 1 < text.length) {
        current += text[i + 1];
        i += 1;
      } else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }
    if (char === "(") depth += 1;
    else if (char === ")") depth = Math.max(0, depth - 1);
    if (char === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/**
 * Tighten one selector: no space around the > + ~ combinators, and no space
 * around commas nested inside :is() / :not(). Skipped when the part contains a
 * quote, because an attribute value may legally hold a comma and spaces.
 */
export function tightenSelectorPart(part) {
  const tight = part.replace(/\s*([>+~])\s*/g, "$1");
  if (tight.includes('"') || tight.includes("'")) return tight;
  return tight.replace(/\s*,\s*/g, ",");
}

/** Tighten a selector: single spaces, no space around , > + ~ combinators. */
export function normaliseSelector(prelude) {
  return splitTopLevelCommas(collapseWhitespace(prelude))
    .map((part) => tightenSelectorPart(part))
    .join(",");
}

/** Tighten a value: no space after commas outside strings. */
export function normaliseValue(value) {
  let out = "";
  let quote = null;
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (quote) {
      out += char;
      if (char === "\\" && i + 1 < value.length) {
        out += value[i + 1];
        i += 1;
      } else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      out += char;
      continue;
    }
    if (char === " " && (out.endsWith(",") || value[i + 1] === ",")) continue;
    out += char;
  }
  return out;
}

function hasContent(node) {
  if (node.type !== NODE_RULE) return true;
  return node.nodes.some((child) => hasContent(child));
}

/** Pretty-print a parsed tree with the given indent width. */
export function printFormatted(nodes, indentWidth = DEFAULT_INDENT, depth = 0) {
  const pad = " ".repeat(indentWidth * depth);
  const lines = [];
  for (const node of nodes) {
    if (node.type === NODE_COMMENT) {
      lines.push(`${pad}/*${node.text}*/`);
    } else if (node.type === NODE_AT_STATEMENT) {
      lines.push(`${pad}${collapseWhitespace(node.text)};`);
    } else if (node.type === NODE_DECLARATION) {
      lines.push(`${pad}${node.property}: ${node.value};`);
    } else if (node.type === NODE_RULE) {
      const tidy = collapseWhitespace(node.prelude);
      const selector = tidy.startsWith("@")
        ? tidy.replace(/\s*:\s*/g, ": ")
        : splitTopLevelCommas(tidy)
            .map((part) => tightenSelectorPart(part).replace(/([>+~])(?!=)/g, " $1 "))
            .join(`,\n${pad}`);
      lines.push(`${pad}${selector} {`);
      if (node.nodes.length) {
        lines.push(printFormatted(node.nodes, indentWidth, depth + 1));
      }
      lines.push(`${pad}}`);
      if (depth === 0) lines.push("");
    }
  }
  return lines.join("\n").replace(/\n+$/, depth === 0 ? "\n" : "");
}

/** Print a parsed tree as one minified line. */
export function printMinified(nodes, { keepBangComments = true, dropEmptyRules = true } = {}) {
  let out = "";
  for (const node of nodes) {
    if (node.type === NODE_COMMENT) {
      if (keepBangComments && node.text.startsWith(BANG_COMMENT_PREFIX)) {
        out += `/*${node.text}*/`;
      }
      continue;
    }
    if (node.type === NODE_AT_STATEMENT) {
      out += `${collapseWhitespace(node.text)};`;
      continue;
    }
    if (node.type === NODE_DECLARATION) {
      out += `${node.property}:${normaliseValue(node.value)};`;
      continue;
    }
    if (node.type === NODE_RULE) {
      if (dropEmptyRules && !hasContent(node)) continue;
      const body = printMinified(node.nodes, { keepBangComments, dropEmptyRules });
      if (dropEmptyRules && !body) continue;
      const prelude = node.prelude.startsWith("@")
        ? collapseWhitespace(node.prelude).replace(/\s*:\s*/g, ":").replace(/\s*,\s*/g, ",")
        : normaliseSelector(node.prelude);
      out += `${prelude}{${body.replace(/;$/, "")}}`;
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Public entry point                                                  */
/* ------------------------------------------------------------------ */

/** UTF-8 byte length of a string, which is what a browser downloads. */
export function byteLength(text) {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(text).length;
  let bytes = 0;
  for (const char of String(text)) {
    const code = char.codePointAt(0);
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (code < 0x10000) bytes += 3;
    else bytes += 4;
  }
  return bytes;
}

/**
 * Format or minify a stylesheet.
 *
 * @param {string} source CSS text
 * @param {"format"|"minify"} mode
 * @param {{ indent?: number, keepBangComments?: boolean, dropEmptyRules?: boolean }} options
 */
export function processCss(source, mode = "minify", options = {}) {
  const css = String(source == null ? "" : source);
  if (!css.trim()) return { error: "Paste some CSS to format or minify." };

  const parsed = parseCss(css);
  if (parsed.error) return { error: parsed.error };

  const indent = INDENT_OPTIONS.includes(Number(options.indent))
    ? Number(options.indent)
    : DEFAULT_INDENT;

  const output =
    mode === "format"
      ? printFormatted(parsed.nodes, indent, 0)
      : printMinified(parsed.nodes, {
          keepBangComments: options.keepBangComments !== false,
          dropEmptyRules: options.dropEmptyRules !== false,
        });

  if (!output.trim()) {
    return { error: "Nothing left after processing — the input had no usable rules." };
  }

  const inputBytes = byteLength(css);
  const outputBytes = byteLength(output);
  const savedBytes = inputBytes - outputBytes;
  // Guard: inputBytes cannot be 0 here because css.trim() is non-empty.
  const savedPercent = Math.round((savedBytes / inputBytes) * 1000) / 10;
  const counts = countNodes(parsed.nodes, {
    dropEmptyRules: mode === "minify" && options.dropEmptyRules !== false,
  });

  return {
    mode,
    output,
    inputBytes,
    outputBytes,
    savedBytes,
    savedPercent,
    inputKib: Math.round((inputBytes / BYTES_PER_KIB) * 100) / 100,
    outputKib: Math.round((outputBytes / BYTES_PER_KIB) * 100) / 100,
    ...counts,
  };
}
