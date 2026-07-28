/**
 * Shared helpers for the "JS object" input converters.
 * Pulls the first complete, balanced object `{...}` or array `[...]` literal
 * out of a JS snippet, so full statements like `const x = { ... };` or
 * `export default { ... }` reduce to just the literal that JSON5 can parse.
 * String and comment contents are skipped so braces inside them never throw
 * off the depth count.
 */
export function extractLiteral(src) {
  const text = String(src);
  const start = text.search(/[{[]/);
  if (start === -1) return text.trim();

  let depth = 0;
  let inStr = null;
  let i = start;
  for (; i < text.length; i += 1) {
    const c = text[i];
    const next = text[i + 1];

    if (inStr) {
      if (c === "\\") {
        i += 1;
        continue;
      }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      inStr = c;
      continue;
    }
    if (c === "/" && next === "/") {
      const nl = text.indexOf("\n", i);
      i = nl === -1 ? text.length : nl;
      continue;
    }
    if (c === "/" && next === "*") {
      const e = text.indexOf("*/", i + 2);
      i = e === -1 ? text.length : e + 1;
      continue;
    }

    if (c === "{" || c === "[") depth += 1;
    else if (c === "}" || c === "]") {
      depth -= 1;
      if (depth === 0) {
        i += 1;
        break;
      }
    }
  }
  return text.slice(start, i);
}
