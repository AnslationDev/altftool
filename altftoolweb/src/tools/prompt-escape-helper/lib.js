/**
 * Prompt Escape Helper — escape a prompt so it survives being embedded in
 * source code, a config file or a shell command.
 *
 * Each escaper implements the quoting rule of the target language:
 *  - C-family strings (JS, Python, Java, C#, YAML double-quoted) use
 *    backslash escapes for the delimiter, the backslash itself and control
 *    characters.
 *  - POSIX single-quoted shell strings cannot escape anything, so a quote is
 *    closed, an escaped quote is emitted, and the string is reopened: '\''
 *  - SQL standard string literals double the single quote: '' (SQL-92).
 *  - CSV follows RFC 4180: a field containing a comma, a double quote or a
 *    line break is wrapped in double quotes and inner quotes are doubled.
 *  - Python str.format and C# interpolated strings treat { and } as syntax,
 *    so a literal brace is written twice.
 */

/** Characters a regular expression treats as syntax. */
const REGEX_SPECIALS = /[.*+?^${}()|[\]\\/]/g;

/** Escape the delimiter, the backslash and control characters, C-string style. */
function escapeCString(input, delimiter) {
  let out = "";
  for (const character of String(input)) {
    switch (character) {
      case "\\":
        out += "\\\\";
        break;
      case "\n":
        out += "\\n";
        break;
      case "\r":
        out += "\\r";
        break;
      case "\t":
        out += "\\t";
        break;
      case "\b":
        out += "\\b";
        break;
      case "\f":
        out += "\\f";
        break;
      default:
        if (character === delimiter) {
          out += `\\${character}`;
        } else if (character.charCodeAt(0) < 0x20 || character.charCodeAt(0) === 0x7f) {
          // Remaining control characters, including DEL, go out as \uXXXX.
          out += `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`;
        } else {
          out += character;
        }
    }
  }
  return out;
}

/** Double every { and } so a format string treats them as literals. */
export function doubleBraces(input) {
  return String(input).replace(/[{}]/g, (brace) => brace + brace);
}

export const TARGETS = [
  {
    id: "js-double",
    label: 'JavaScript — "double quoted"',
    group: "JavaScript",
    open: '"',
    close: '"',
    note: 'Escapes " \\ and control characters. Same rules as TypeScript.',
    escape: (input) => escapeCString(input, '"'),
  },
  {
    id: "js-single",
    label: "JavaScript — 'single quoted'",
    group: "JavaScript",
    open: "'",
    close: "'",
    note: "Escapes ' \\ and control characters.",
    escape: (input) => escapeCString(input, "'"),
  },
  {
    id: "js-template",
    label: "JavaScript — `template literal`",
    group: "JavaScript",
    open: "`",
    close: "`",
    note: "Escapes the backtick, the backslash and ${ so no interpolation fires. Newlines stay as real line breaks.",
    escape: (input) =>
      String(input)
        .replace(/\\/g, "\\\\")
        .replace(/`/g, "\\`")
        .replace(/\$\{/g, "\\${"),
  },
  {
    id: "json",
    label: "JSON string value",
    group: "Data",
    open: "",
    close: "",
    note: "Produced with JSON.stringify, so it is valid JSON including the surrounding quotes.",
    escape: (input) => JSON.stringify(String(input)),
  },
  {
    id: "python-double",
    label: 'Python — "double quoted"',
    group: "Python",
    open: '"',
    close: '"',
    note: 'Escapes " \\ and control characters.',
    escape: (input) => escapeCString(input, '"'),
  },
  {
    id: "python-triple",
    label: 'Python — """triple quoted"""',
    group: "Python",
    open: '"""',
    close: '"""',
    note: "Keeps real line breaks. Escapes the backslash and any run of three double quotes.",
    escape: (input) => String(input).replace(/\\/g, "\\\\").replace(/"""/g, '\\"\\"\\"'),
  },
  {
    id: "python-format",
    label: "Python str.format / f-string",
    group: "Python",
    open: '"',
    close: '"',
    note: "Escapes the string normally, then doubles { and } so no placeholder is substituted.",
    escape: (input) => doubleBraces(escapeCString(input, '"')),
  },
  {
    id: "shell-single",
    label: "Shell — POSIX 'single quoted'",
    group: "Shell",
    open: "'",
    close: "'",
    note: "Single quotes cannot escape anything, so each inner quote becomes '\\'' — the safest form for bash, zsh and sh.",
    escape: (input) => String(input).replace(/'/g, "'\\''"),
  },
  {
    id: "shell-double",
    label: 'Shell — "double quoted"',
    group: "Shell",
    open: '"',
    close: '"',
    note: 'Escapes \\ $ ` and " so the shell performs no expansion.',
    escape: (input) => String(input).replace(/([\\$`"])/g, "\\$1"),
  },
  {
    id: "sql",
    label: "SQL string literal",
    group: "Data",
    open: "'",
    close: "'",
    note: "Doubles the single quote, which is the standard SQL escape. Use bound parameters instead wherever you can.",
    escape: (input) => String(input).replace(/'/g, "''"),
  },
  {
    id: "csv",
    label: "CSV field (RFC 4180)",
    group: "Data",
    open: "",
    close: "",
    note: "Doubles inner quotes and wraps the field only when it contains a comma, a quote or a line break.",
    escape: (input) => {
      const text = String(input);
      const needsQuoting = /[",\r\n]/.test(text);
      const doubled = text.replace(/"/g, '""');
      return needsQuoting ? `"${doubled}"` : doubled;
    },
  },
  {
    id: "yaml-double",
    label: 'YAML — "double quoted"',
    group: "Data",
    open: '"',
    close: '"',
    note: "The only YAML style that supports escapes. Single-quoted YAML instead doubles the quote and escapes nothing else.",
    escape: (input) => escapeCString(input, '"'),
  },
  {
    id: "yaml-single",
    label: "YAML — 'single quoted'",
    group: "Data",
    open: "'",
    close: "'",
    note: "Doubles the single quote. Backslashes stay literal, which is often what you want for a prompt.",
    escape: (input) => String(input).replace(/'/g, "''"),
  },
  {
    id: "java",
    label: 'Java / C# — "string"',
    group: "Other languages",
    open: '"',
    close: '"',
    note: 'Escapes " \\ and control characters.',
    escape: (input) => escapeCString(input, '"'),
  },
  {
    id: "csharp-interpolated",
    label: "C# interpolated $\"string\"",
    group: "Other languages",
    open: '$"',
    close: '"',
    note: "Escapes the string, then doubles { and } so interpolation holes are not opened.",
    escape: (input) => doubleBraces(escapeCString(input, '"')),
  },
  {
    id: "html-attribute",
    label: "HTML attribute value",
    group: "Markup",
    open: '"',
    close: '"',
    note: "Escapes & < > \" and ' as entities, in that order so ampersands are not double-encoded.",
    escape: (input) =>
      String(input)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;"),
  },
  {
    id: "url-component",
    label: "URL query parameter",
    group: "Markup",
    open: "",
    close: "",
    note: "Percent-encodes with encodeURIComponent, so the prompt is safe as a query string value.",
    escape: (input) => encodeURIComponent(String(input)),
  },
  {
    id: "regex-literal",
    label: "Regular expression literal text",
    group: "Markup",
    open: "",
    close: "",
    note: "Escapes every regex metacharacter so the prompt matches itself exactly.",
    escape: (input) => String(input).replace(REGEX_SPECIALS, "\\$&"),
  },
];

export const TARGET_GROUPS = [...new Set(TARGETS.map((target) => target.group))];

/** Practical ceiling so the page stays responsive on a phone. */
export const MAX_INPUT_CHARS = 200000;

/** Count the characters that will need escaping in the source text. */
export function countRiskyCharacters(input) {
  const text = String(input ?? "");
  const counts = {
    backslash: (text.match(/\\/g) || []).length,
    doubleQuote: (text.match(/"/g) || []).length,
    singleQuote: (text.match(/'/g) || []).length,
    backtick: (text.match(/`/g) || []).length,
    openBrace: (text.match(/\{/g) || []).length,
    closeBrace: (text.match(/\}/g) || []).length,
    dollar: (text.match(/\$/g) || []).length,
    newline: (text.match(/\r\n|\r|\n/g) || []).length,
    tab: (text.match(/\t/g) || []).length,
  };
  counts.total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return counts;
}

/**
 * Escape the text for one target.
 * Returns { error } for empty or oversized input rather than a misleading "".
 */
export function escapeForTarget(input, targetId, { wrap = true } = {}) {
  const text = String(input ?? "");
  if (!text) return { error: "Paste the prompt you want to escape." };
  if (text.length > MAX_INPUT_CHARS) {
    return {
      error: `That is ${text.length.toLocaleString("en-US")} characters; this tool handles up to ${MAX_INPUT_CHARS.toLocaleString("en-US")}.`,
    };
  }

  const target = TARGETS.find((entry) => entry.id === targetId);
  if (!target) return { error: "Pick a target language." };

  const escaped = target.escape(text);
  const wrapped = wrap ? `${target.open}${escaped}${target.close}` : escaped;
  const risky = countRiskyCharacters(text);

  return {
    target,
    escaped,
    wrapped,
    originalLength: text.length,
    escapedLength: escaped.length,
    wrappedLength: wrapped.length,
    addedCharacters: escaped.length - text.length,
    growthPercent: text.length > 0 ? ((escaped.length - text.length) / text.length) * 100 : 0,
    risky,
    lineCount: text.split(/\r\n|\r|\n/).length,
  };
}

/** Escape the same text for every target at once. */
export function escapeForAllTargets(input, { wrap = true } = {}) {
  const text = String(input ?? "");
  if (!text) return { error: "Paste the prompt you want to escape." };
  const rows = TARGETS.map((target) => {
    const result = escapeForTarget(text, target.id, { wrap });
    return result.error ? { id: target.id, label: target.label, error: result.error } : result;
  });
  return { rows };
}
