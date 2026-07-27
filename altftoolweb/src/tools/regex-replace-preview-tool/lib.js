/**
 * Regex find & replace preview.
 *
 * Replacement-string semantics follow ECMA-262 §22.2.7.2 (GetSubstitution),
 * the algorithm String.prototype.replace uses:
 *   $$        a literal dollar sign
 *   $&        the whole match
 *   $`        the portion of the text before the match
 *   $'        the portion of the text after the match
 *   $1…$99    numbered capture groups (literal if the group does not exist)
 *   $<name>   named capture group (literal "$<" when the pattern has no
 *             named groups, matching V8's behaviour)
 *
 * expandReplacement below implements that algorithm so the tool can show,
 * per match, exactly what each occurrence becomes — something the native
 * one-shot replace cannot report.
 */

/** Input guards: keep worst-case regex work bounded in a browser tab. */
export const MAX_TEXT_LENGTH = 100000;
export const MAX_PATTERN_LENGTH = 1000;
export const MAX_REPLACEMENT_LENGTH = 1000;
/** Hard cap on matches processed, so a zero-width global match on a huge text stays snappy. */
export const MATCH_LIMIT = 5000;

/** Flags String.prototype.replace accepts that make sense here (no d/v). */
export const ALLOWED_FLAGS = ["g", "i", "m", "s", "u", "y"];

/**
 * ECMA-262 GetSubstitution: expand a replacement template for one match.
 * Pure string work — no regex re-execution.
 */
export function expandReplacement(template, { matched, index, input, captures, groups }) {
  let out = "";
  let i = 0;
  while (i < template.length) {
    const ch = template[i];
    if (ch !== "$" || i === template.length - 1) {
      out += ch;
      i += 1;
      continue;
    }
    const next = template[i + 1];
    if (next === "$") {
      out += "$";
      i += 2;
    } else if (next === "&") {
      out += matched;
      i += 2;
    } else if (next === "`") {
      out += input.slice(0, index);
      i += 2;
    } else if (next === "'") {
      out += input.slice(index + matched.length);
      i += 2;
    } else if (next === "<") {
      const close = template.indexOf(">", i + 2);
      // Per spec: with no named groups in the pattern, "$<" is literal.
      if (!groups || close === -1) {
        out += "$";
        i += 1;
      } else {
        const name = template.slice(i + 2, close);
        out += Object.prototype.hasOwnProperty.call(groups, name) ? (groups[name] ?? "") : "";
        i = close + 1;
      }
    } else if (next >= "0" && next <= "9") {
      // Try two digits first, then one; out-of-range references stay literal.
      const two = template.slice(i + 1, i + 3);
      const one = next;
      const twoNum = /^\d{2}$/.test(two) ? Number(two) : NaN;
      const oneNum = Number(one);
      if (Number.isInteger(twoNum) && twoNum >= 1 && twoNum <= captures.length) {
        out += captures[twoNum - 1] ?? "";
        i += 3;
      } else if (oneNum >= 1 && oneNum <= captures.length) {
        out += captures[oneNum - 1] ?? "";
        i += 2;
      } else {
        out += ch;
        i += 1;
      }
    } else {
      out += ch;
      i += 1;
    }
  }
  return out;
}

/**
 * Validate a flags string: known letters only, no duplicates.
 * @returns {{flags: string} | {error: string}}
 */
export function validateFlags(flags) {
  if (typeof flags !== "string") return { error: "Flags must be a string." };
  const seen = new Set();
  for (const flag of flags) {
    if (!ALLOWED_FLAGS.includes(flag)) {
      return { error: `Unsupported flag "${flag}" — allowed: ${ALLOWED_FLAGS.join(", ")}.` };
    }
    if (seen.has(flag)) return { error: `Duplicate flag "${flag}".` };
    seen.add(flag);
  }
  return { flags };
}

/**
 * Preview a find & replace: full output plus a per-match breakdown.
 *
 * @returns {{
 *   output: string, matchCount: number, truncated: boolean,
 *   matches: Array<{index: number, matched: string, replacement: string}>
 * } | {error: string}}
 */
export function previewReplace({ text, pattern, flags = "g", replacement = "" }) {
  if (typeof text !== "string") return { error: "Enter the text to search." };
  if (typeof pattern !== "string" || pattern === "") {
    return { error: "Enter a regex pattern to find." };
  }
  if (typeof replacement !== "string") return { error: "Replacement must be a string." };
  if (text.length > MAX_TEXT_LENGTH) {
    return { error: `Text is limited to ${MAX_TEXT_LENGTH.toLocaleString()} characters.` };
  }
  if (pattern.length > MAX_PATTERN_LENGTH) {
    return { error: `Pattern is limited to ${MAX_PATTERN_LENGTH.toLocaleString()} characters.` };
  }
  if (replacement.length > MAX_REPLACEMENT_LENGTH) {
    return { error: `Replacement is limited to ${MAX_REPLACEMENT_LENGTH.toLocaleString()} characters.` };
  }

  const flagCheck = validateFlags(flags);
  if (flagCheck.error) return { error: flagCheck.error };

  let regex;
  try {
    regex = new RegExp(pattern, flags);
  } catch (cause) {
    return { error: `Invalid regular expression: ${cause.message}` };
  }

  const global = regex.global;
  const matches = [];
  let output = "";
  let lastEnd = 0;
  let truncated = false;

  if (global) {
    let count = 0;
    for (const match of text.matchAll(regex)) {
      if (count >= MATCH_LIMIT) {
        truncated = true;
        break;
      }
      const matched = match[0];
      const index = match.index ?? 0;
      const replacementText = expandReplacement(replacement, {
        matched,
        index,
        input: text,
        captures: match.slice(1),
        groups: match.groups,
      });
      output += text.slice(lastEnd, index) + replacementText;
      lastEnd = index + matched.length;
      matches.push({ index, matched, replacement: replacementText });
      count += 1;
    }
    output += text.slice(lastEnd);
  } else {
    const match = regex.exec(text);
    if (match) {
      const matched = match[0];
      const index = match.index;
      const replacementText = expandReplacement(replacement, {
        matched,
        index,
        input: text,
        captures: match.slice(1),
        groups: match.groups,
      });
      output = text.slice(0, index) + replacementText + text.slice(index + matched.length);
      matches.push({ index, matched, replacement: replacementText });
    } else {
      output = text;
    }
  }

  return { output, matchCount: matches.length, truncated, matches };
}
