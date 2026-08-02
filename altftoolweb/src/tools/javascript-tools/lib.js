/**
 * JavaScript Tools — format, minify and inspect a JavaScript snippet.
 *
 * Everything is built on one lexical scanner (`scanRegions`) that splits the
 * source into code, comments, string literals, template literals and regular
 * expression literals. Working from regions rather than regular expressions is
 * what makes it safe to strip a `//` that lives inside a string, or to leave a
 * URL inside a template literal untouched.
 *
 * The minifier is deliberately conservative: it removes comments and redundant
 * whitespace but never renames identifiers and never deletes a newline, so
 * automatic semicolon insertion (ECMA-262 §12.10) behaves exactly as it did in
 * the original source.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Indent presets offered by the formatter. */
export const INDENT_PRESETS = [
  { id: "2", label: "2 spaces", value: "  " },
  { id: "4", label: "4 spaces", value: "    " },
  { id: "tab", label: "Tab", value: "\t" },
];

/** Guard: refuse inputs large enough to lock the main thread (1 MB of text). */
export const MAX_INPUT_CHARS = 1000000;

/**
 * After these tokens a `/` begins a regular expression literal rather than a
 * division operator. Derived from the ECMA-262 lexical goal rules.
 */
const REGEX_PRECEDING_CHARS = new Set([
  "",
  "(",
  ",",
  "=",
  ":",
  "[",
  "!",
  "&",
  "|",
  "?",
  "{",
  "}",
  ";",
  "+",
  "-",
  "*",
  "%",
  "~",
  "^",
  "<",
  ">",
  "\n",
]);

const REGEX_PRECEDING_WORDS = new Set([
  "return",
  "typeof",
  "instanceof",
  "in",
  "of",
  "new",
  "delete",
  "void",
  "case",
  "do",
  "else",
  "yield",
  "await",
  "throw",
]);

/**
 * Punctuation where surrounding whitespace can be dropped with no risk of two
 * tokens merging into a different token (unlike `+ +`, which would become the
 * increment operator `++`). Used by the minifier.
 */
export const SAFE_TO_HUG = "{}()[];,:";

/**
 * The minifier's actual punctuation-hugging pattern, derived from
 * `SAFE_TO_HUG` so the two can never drift apart. Only `]`, `\`, `^` and `-`
 * are meaningful inside a `[...]` character class and need escaping — none
 * of the other `SAFE_TO_HUG` characters do.
 */
const HUGGABLE_PUNCTUATION = new RegExp(` ?([${SAFE_TO_HUG.replace(/[\]\\^-]/g, "\\$&")}]) ?`, "g");

const isIdentChar = (char) => /[A-Za-z0-9_$]/.test(char);

/**
 * Scan a single- or double-quoted string literal starting at `start` (the
 * opening quote). Mirrors the string-literal branch of `scanRegions` exactly,
 * so a string nested inside a template-literal `${...}` substitution is
 * skipped identically to one found at the top level.
 *
 * @returns {number} index just past the closing quote (or the end of the
 *   line/source, if the string is never closed).
 */
function scanStringLiteralAt(source, start) {
  const quote = source[start];
  const length = source.length;
  let end = start + 1;
  while (end < length) {
    if (source[end] === "\\") {
      end += 2;
      continue;
    }
    if (source[end] === quote) {
      end += 1;
      break;
    }
    if (source[end] === "\n") break;
    end += 1;
  }
  return end;
}

/**
 * Scan the code inside a `${ ... }` template substitution, starting right
 * after the `${`. A plain depth counter tracks `{`/`}` nesting so a braced
 * block that lives inside the substitution — an arrow-function body, an
 * `if` block, an object literal, and so on — is never confused with the
 * brace that actually closes the substitution. Strings, line/block comments
 * and — recursively, via `scanTemplateLiteral` — nested template literals
 * (which may contain their own `${...}` substitutions) are skipped
 * wholesale, so a `}` or a backtick that lives inside one of those can never
 * be mistaken for substitution syntax.
 *
 * @returns {number} index just past the substitution's closing `}` (or the
 *   end of the source, if the substitution is never closed).
 */
function scanTemplateSubstitution(source, start) {
  const length = source.length;
  let index = start;
  let depth = 0;

  while (index < length) {
    const char = source[index];

    if (char === "`") {
      index = scanTemplateLiteral(source, index).end;
      continue;
    }
    if (char === '"' || char === "'") {
      index = scanStringLiteralAt(source, index);
      continue;
    }
    if (char === "/" && source[index + 1] === "/") {
      while (index < length && source[index] !== "\n") index += 1;
      continue;
    }
    if (char === "/" && source[index + 1] === "*") {
      index += 2;
      while (index < length && !(source[index] === "*" && source[index + 1] === "/")) index += 1;
      index = index < length ? index + 2 : length;
      continue;
    }
    if (char === "{") {
      depth += 1;
      index += 1;
      continue;
    }
    if (char === "}") {
      if (depth === 0) return index + 1;
      depth -= 1;
      index += 1;
      continue;
    }
    index += 1;
  }

  return length;
}

/**
 * Scan a template literal starting at `start` (its opening backtick).
 * Recurses into `scanTemplateSubstitution` for every `${ ... }`, which in
 * turn recurses back here for any template literal nested inside it. That
 * mutual recursion is what lets arbitrarily deep nesting — a substitution
 * containing a braced block that itself contains another template literal,
 * and so on — resolve correctly, instead of the flat brace counter this
 * replaces (which could be driven back to zero by a nested block's closing
 * `}`, causing the next backtick to be misread as the outer template's own
 * terminator).
 *
 * @returns {{ end: number, terminated: boolean }}
 */
function scanTemplateLiteral(source, start) {
  const length = source.length;
  let index = start + 1;

  while (index < length) {
    const char = source[index];
    if (char === "\\") {
      index += 2;
      continue;
    }
    if (char === "`") {
      return { end: index + 1, terminated: true };
    }
    if (char === "$" && source[index + 1] === "{") {
      index = scanTemplateSubstitution(source, index + 2);
      continue;
    }
    index += 1;
  }

  return { end: length, terminated: false };
}

/**
 * Split source into lexical regions.
 *
 * @param {string} source
 * @returns {Array<{ type: "code"|"line-comment"|"block-comment"|"string"|"template"|"regex", value: string, terminated?: boolean }>}
 */
export function scanRegions(source) {
  const regions = [];
  if (typeof source !== "string" || source === "") return regions;

  const length = source.length;
  let index = 0;
  let codeStart = 0;
  let lastCodeChar = "";
  let lastWord = "";

  const flushCode = (end) => {
    if (end > codeStart) regions.push({ type: "code", value: source.slice(codeStart, end) });
  };

  while (index < length) {
    const char = source[index];
    const next = source[index + 1];

    if (char === "/" && next === "/") {
      flushCode(index);
      let end = index;
      while (end < length && source[end] !== "\n") end += 1;
      regions.push({ type: "line-comment", value: source.slice(index, end) });
      index = end;
      codeStart = index;
      continue;
    }

    if (char === "/" && next === "*") {
      flushCode(index);
      let end = index + 2;
      while (end < length && !(source[end] === "*" && source[end + 1] === "/")) end += 1;
      const terminated = end < length;
      end = terminated ? end + 2 : length;
      regions.push({ type: "block-comment", value: source.slice(index, end), terminated });
      index = end;
      codeStart = index;
      continue;
    }

    if (char === '"' || char === "'") {
      flushCode(index);
      let end = index + 1;
      let terminated = false;
      while (end < length) {
        if (source[end] === "\\") {
          end += 2;
          continue;
        }
        if (source[end] === char) {
          end += 1;
          terminated = true;
          break;
        }
        if (source[end] === "\n") break;
        end += 1;
      }
      regions.push({ type: "string", value: source.slice(index, end), terminated });
      index = end;
      codeStart = index;
      lastCodeChar = char;
      lastWord = "";
      continue;
    }

    if (char === "`") {
      flushCode(index);
      const { end, terminated } = scanTemplateLiteral(source, index);
      regions.push({ type: "template", value: source.slice(index, end), terminated });
      index = end;
      codeStart = index;
      lastCodeChar = "`";
      lastWord = "";
      continue;
    }

    if (
      char === "/" &&
      (REGEX_PRECEDING_CHARS.has(lastCodeChar) || REGEX_PRECEDING_WORDS.has(lastWord))
    ) {
      flushCode(index);
      let end = index + 1;
      let inClass = false;
      let terminated = false;
      while (end < length) {
        const current = source[end];
        if (current === "\\") {
          end += 2;
          continue;
        }
        if (current === "[") inClass = true;
        else if (current === "]") inClass = false;
        else if (current === "/" && !inClass) {
          end += 1;
          terminated = true;
          break;
        } else if (current === "\n") break;
        end += 1;
      }
      while (end < length && /[dgimsuvy]/.test(source[end])) end += 1;
      regions.push({ type: "regex", value: source.slice(index, end), terminated });
      index = end;
      codeStart = index;
      lastCodeChar = "/";
      lastWord = "";
      continue;
    }

    if (!/\s/.test(char)) {
      lastCodeChar = char;
      lastWord = isIdentChar(char) ? lastWord + char : "";
    } else if (char === "\n") {
      lastCodeChar = "\n";
      lastWord = "";
    } else {
      lastWord = "";
    }
    index += 1;
  }

  flushCode(length);
  return regions;
}

/**
 * Remove every comment, leaving all other bytes untouched.
 *
 * @param {string} source
 * @returns {{ code: string, lineComments: number, blockComments: number, removedChars: number }}
 */
export function stripComments(source) {
  const regions = scanRegions(source);
  let code = "";
  let lineComments = 0;
  let blockComments = 0;
  let removedChars = 0;

  for (const region of regions) {
    if (region.type === "line-comment") {
      lineComments += 1;
      removedChars += region.value.length;
      continue;
    }
    if (region.type === "block-comment") {
      blockComments += 1;
      removedChars += region.value.length;
      // A block comment that spanned lines still separated two statements.
      if (region.value.includes("\n")) code += "\n";
      continue;
    }
    code += region.value;
  }

  return { code, lineComments, blockComments, removedChars };
}

/**
 * Whitespace-and-comment minifier.
 *
 * Identifiers are never renamed and newlines are never removed, so the output
 * behaves identically to the input. Expect roughly 20–45% off ordinary indented
 * source; a name-mangling bundler will always beat it.
 *
 * @param {string} source
 * @param {{ keepComments?: boolean }} [options]
 * @returns {{ code: string, originalChars: number, minifiedChars: number, savedChars: number, savedPercent: number } | { error: string }}
 */
export function minifyJavaScript(source, options = {}) {
  if (typeof source !== "string") return { error: "Paste some JavaScript to minify." };
  if (!source.trim()) return { error: "Paste some JavaScript to minify." };
  if (source.length > MAX_INPUT_CHARS) {
    return { error: `Keep the snippet under ${MAX_INPUT_CHARS.toLocaleString("en-US")} characters.` };
  }

  const regions = options.keepComments ? scanRegions(source) : scanRegions(stripComments(source).code);

  let out = "";
  for (const region of regions) {
    if (region.type !== "code") {
      out += region.value;
      continue;
    }
    let chunk = region.value
      // Collapse runs of spaces/tabs.
      .replace(/[ \t]+/g, " ")
      // Drop indentation and trailing spaces around every newline.
      .replace(/[ \t]*\n[ \t]*/g, "\n")
      // Collapse blank lines.
      .replace(/\n{2,}/g, "\n");

    // Hug punctuation that cannot merge with a neighbouring token.
    chunk = chunk.replace(HUGGABLE_PUNCTUATION, "$1");
    out += chunk;
  }

  const code = out.replace(/\n{2,}/g, "\n").trim();
  const originalChars = source.length;
  const minifiedChars = code.length;
  const savedChars = originalChars - minifiedChars;
  return {
    code,
    originalChars,
    minifiedChars,
    savedChars,
    savedPercent: originalChars === 0 ? 0 : (savedChars / originalChars) * 100,
  };
}

/**
 * Re-indent a snippet: one statement per line, braces controlling depth.
 *
 * Only newlines and indentation change — no token is added, removed or
 * reordered, and comments and literals are copied verbatim.
 *
 * @param {string} source
 * @param {{ indent?: string }} [options]
 * @returns {{ code: string, lines: number } | { error: string }}
 */
export function formatJavaScript(source, options = {}) {
  if (typeof source !== "string" || !source.trim()) {
    return { error: "Paste some JavaScript to format." };
  }
  if (source.length > MAX_INPUT_CHARS) {
    return { error: `Keep the snippet under ${MAX_INPUT_CHARS.toLocaleString("en-US")} characters.` };
  }

  const indent = typeof options.indent === "string" ? options.indent : "  ";
  const regions = scanRegions(source);

  let out = "";
  let depth = 0;
  let parenDepth = 0;
  let atLineStart = true;
  // A closing brace usually ends the line, unless the next token continues the
  // same statement (`} else`, `})`, `};`, `}.then(`, …).
  let justClosedBrace = false;

  const newline = () => {
    out = out.replace(/[ \t]+$/, "");
    out += "\n";
    atLineStart = true;
  };
  const write = (piece) => {
    if (atLineStart) {
      out += indent.repeat(Math.max(0, depth));
      atLineStart = false;
    }
    out += piece;
  };
  const BRACE_CONTINUATION_CHARS = new Set([")", "]", "}", ",", ";", ".", ":", "="]);
  const BRACE_CONTINUATION_WORDS = ["else", "catch", "finally", "while"];
  // Match the keyword itself, not merely an identifier that starts with the
  // same letters (e.g. `catchAllErrors()` must not be treated as `catch`).
  const BRACE_CONTINUATION_PATTERN = new RegExp(`^(?:${BRACE_CONTINUATION_WORDS.join("|")})(?![\\w$])`);

  for (const region of regions) {
    if (region.type !== "code") {
      if (justClosedBrace) {
        justClosedBrace = false;
        if (region.type !== "line-comment" && !atLineStart) newline();
      }
      write(region.value);
      if (region.type === "line-comment") newline();
      continue;
    }

    const body = region.value;
    for (let position = 0; position < body.length; position += 1) {
      const char = body[position];

      if (char === "\n" || char === "\r") {
        justClosedBrace = false;
        if (!atLineStart) newline();
        continue;
      }
      if (char === " " || char === "\t") {
        if (!atLineStart && !out.endsWith(" ")) out += " ";
        continue;
      }

      if (justClosedBrace) {
        justClosedBrace = false;
        const rest = body.slice(position);
        const continues =
          BRACE_CONTINUATION_CHARS.has(char) || BRACE_CONTINUATION_PATTERN.test(rest);
        if (!continues && !atLineStart) newline();
        else if (continues && BRACE_CONTINUATION_PATTERN.test(rest)) {
          if (!atLineStart && !out.endsWith(" ")) out += " ";
        }
      }

      if (char === "(" || char === "[") parenDepth += 1;
      if (char === ")" || char === "]") parenDepth = Math.max(0, parenDepth - 1);

      if (char === "}") {
        if (!atLineStart) newline();
        depth = Math.max(0, depth - 1);
        write(char);
        justClosedBrace = true;
        continue;
      }
      if (char === "{") {
        write(char);
        depth += 1;
        newline();
        continue;
      }
      if (char === ";" && parenDepth === 0) {
        write(char);
        newline();
        continue;
      }
      write(char);
    }
  }

  const code = out
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { code, lines: code === "" ? 0 : code.split("\n").length };
}

/** Bracket pairs checked by `checkBalance`. */
const BRACKET_PAIRS = { ")": "(", "]": "[", "}": "{" };

/**
 * Structural sanity check: are all brackets, strings and comments closed?
 * This is not a parser — it catches the mistakes that actually happen when
 * pasting a fragment, not every syntax error.
 *
 * @param {string} source
 * @returns {{ balanced: boolean, issues: string[] }}
 */
export function checkBalance(source) {
  const regions = scanRegions(source);
  const issues = [];
  const stack = [];

  for (const region of regions) {
    if (region.type === "string" && region.terminated === false) {
      issues.push("A string literal is never closed.");
      continue;
    }
    if (region.type === "template" && region.terminated === false) {
      issues.push("A template literal is never closed.");
      continue;
    }
    if (region.type === "block-comment" && region.terminated === false) {
      issues.push("A /* block comment */ is never closed.");
      continue;
    }
    if (region.type !== "code") continue;

    for (const char of region.value) {
      if (char === "(" || char === "[" || char === "{") stack.push(char);
      else if (BRACKET_PAIRS[char]) {
        const expected = BRACKET_PAIRS[char];
        if (stack.length === 0) issues.push(`Found a closing "${char}" with nothing open.`);
        else if (stack[stack.length - 1] !== expected) {
          issues.push(`Found "${char}" where "${stack[stack.length - 1]}" was still open.`);
          stack.pop();
        } else stack.pop();
      }
    }
  }

  if (stack.length > 0) {
    issues.push(`${stack.length} bracket${stack.length === 1 ? "" : "s"} left open: ${stack.join(" ")}`);
  }

  return { balanced: issues.length === 0, issues };
}

/** Tokens that add a branch, used for the decision-point count below. */
const DECISION_PATTERNS = [
  /\bif\b/g,
  /\bfor\b/g,
  /\bwhile\b/g,
  /\bcase\b/g,
  /\bcatch\b/g,
  /&&/g,
  /\|\|/g,
  /\?\?/g,
];

/**
 * Count what is in the snippet.
 *
 * `decisionPoints + 1` is McCabe's cyclomatic complexity for the file taken as
 * a whole ((T. J. McCabe, 1976): complexity = decisions + 1).
 *
 * @param {string} source
 * @returns {object} statistics, or { error }
 */
export function analyseJavaScript(source) {
  if (typeof source !== "string" || !source.trim()) {
    return { error: "Paste some JavaScript to inspect." };
  }
  if (source.length > MAX_INPUT_CHARS) {
    return { error: `Keep the snippet under ${MAX_INPUT_CHARS.toLocaleString("en-US")} characters.` };
  }

  const regions = scanRegions(source);
  const codeOnly = regions
    .filter((region) => region.type === "code")
    .map((region) => region.value)
    .join("");

  const lines = source.split("\n");

  // Classify every physical line as exactly one of blank / comment / code, so
  // the three counts always add up to `lines.length` and `commentRatio` can
  // never exceed 100%. A line counts as "comment" only when every
  // non-whitespace character on it belongs to a comment region — a line that
  // mixes code and a trailing comment (`const x = 1; // legacy`) is real code
  // and must be counted as such, not as a comment line.
  const isCommentChar = new Uint8Array(source.length);
  {
    let offset = 0;
    for (const region of regions) {
      if (region.type === "line-comment" || region.type === "block-comment") {
        isCommentChar.fill(1, offset, offset + region.value.length);
      }
      offset += region.value.length;
    }
  }

  let blankLines = 0;
  let commentLines = 0;
  let cursor = 0;
  for (const line of lines) {
    const lineEnd = cursor + line.length;
    if (line.trim() === "") {
      blankLines += 1;
    } else {
      let hasCode = false;
      for (let position = cursor; position < lineEnd; position += 1) {
        if (isCommentChar[position] === 1) continue;
        if (/\s/.test(source[position])) continue;
        hasCode = true;
        break;
      }
      if (!hasCode) commentLines += 1;
    }
    cursor = lineEnd + 1; // skip the "\n" separator
  }

  const count = (pattern) => (codeOnly.match(pattern) || []).length;
  const decisionPoints = DECISION_PATTERNS.reduce(
    (total, pattern) => total + (codeOnly.match(pattern) || []).length,
    0,
  );

  const longest = lines.reduce(
    (best, line, position) => (line.length > best.length ? { length: line.length, line: position + 1 } : best),
    { length: 0, line: 0 },
  );

  const bytes = new TextEncoder().encode(source).length;

  return {
    characters: source.length,
    bytes,
    lines: lines.length,
    blankLines,
    commentLines,
    codeLines: Math.max(0, lines.length - blankLines - commentLines),
    commentRatio: lines.length === 0 ? 0 : (commentLines / lines.length) * 100,
    functions: count(/\bfunction\b/g),
    arrowFunctions: count(/=>/g),
    classes: count(/\bclass\s+[A-Za-z_$]/g),
    varDeclarations: count(/\bvar\b/g),
    letDeclarations: count(/\blet\b/g),
    constDeclarations: count(/\bconst\b/g),
    imports: count(/\bimport\b/g),
    exports: count(/\bexport\b/g),
    consoleCalls: count(/\bconsole\s*\./g),
    todos: (source.match(/\b(TODO|FIXME|HACK)\b/g) || []).length,
    stringLiterals: regions.filter((region) => region.type === "string").length,
    templateLiterals: regions.filter((region) => region.type === "template").length,
    regexLiterals: regions.filter((region) => region.type === "regex").length,
    decisionPoints,
    cyclomaticComplexity: decisionPoints + 1,
    longestLineLength: longest.length,
    longestLineNumber: longest.line,
    ...checkBalance(source),
  };
}
