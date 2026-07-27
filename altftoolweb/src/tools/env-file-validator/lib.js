/**
 * .env file validator.
 *
 * The .env format has no single standard; this linter validates against the
 * two most important consumers and flags where they DISAGREE:
 * - dotenv (motdotla/dotenv, the de-facto npm format): "#" comments, optional
 *   "export ", quoted values (single/double/backtick) that may span lines,
 *   "#" starts an inline comment in unquoted values, last duplicate wins.
 * - POSIX shell / docker run --env-file: names must match the POSIX portable
 *   rule [A-Za-z_][A-Za-z0-9_]* (IEEE Std 1003.1-2017, §8.1 Environment
 *   Variable Definition); docker's --env-file does NOT strip quotes, does not
 *   support multiline values, and keeps "#" literally inside values.
 *
 * severity: "error"   -> at least one mainstream parser will misread or reject it
 *           "warning" -> parses, but behaves differently across parsers or is risky
 */

/** POSIX portable environment-variable name (IEEE Std 1003.1-2017 §8.1). */
export const POSIX_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** Names dotenv itself accepts (letters, digits, _, ., -), superset of POSIX. */
export const DOTENV_NAME_PATTERN = /^[\w.-]+$/;

/** Find the first unescaped `q` in `text`, or -1. */
function findClosingQuote(text, q) {
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] !== q) continue;
    let backslashes = 0;
    for (let j = i - 1; j >= 0 && text[j] === "\\"; j -= 1) backslashes += 1;
    if (backslashes % 2 === 0) return i;
  }
  return -1;
}

/**
 * Validate a .env document.
 *
 * @param {string} text
 * @returns {object} { issues: [{line, key, severity, message}],
 *   summary: { errors, warnings, variables, lines }, ok } or { error }.
 */
export function validateEnv(text) {
  const raw = String(text ?? "");
  if (raw.trim() === "") {
    return { error: "Paste a .env file to validate." };
  }

  const issues = [];
  const push = (line, key, severity, message) => issues.push({ line, key, severity, message });

  if (raw.charCodeAt(0) === 0xfeff) {
    push(1, null, "warning", "File starts with a UTF-8 BOM; some parsers read it into the first key name.");
  }
  if (raw.includes("\r\n")) {
    push(
      1,
      null,
      "warning",
      "CRLF (Windows) line endings detected; naive parsers keep the invisible \\r at the end of each value.",
    );
  }

  const lines = raw.replace(/^﻿/, "").split(/\r?\n/);
  const seen = new Map(); // key -> first line
  let variables = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const lineNo = i + 1;
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;

    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) {
      push(lineNo, null, "error", `Not a KEY=VALUE assignment: "${trimmed.slice(0, 40)}"`);
      continue;
    }

    let keyPart = trimmed.slice(0, eqIdx);
    let rest = trimmed.slice(eqIdx + 1);

    const hasExport = /^export\s+/.test(keyPart);
    if (hasExport) {
      keyPart = keyPart.replace(/^export\s+/, "");
      push(
        lineNo,
        keyPart.trim(),
        "warning",
        '"export " prefix works when sourcing in a shell and in dotenv, but docker --env-file treats it as part of the key.',
      );
    }

    const key = keyPart.trim();
    if (keyPart !== key || /^\s/.test(rest)) {
      push(
        lineNo,
        key,
        "warning",
        "Whitespace around '=' — dotenv trims it, but a POSIX shell and docker --env-file will not parse KEY = value.",
      );
    }
    const value = rest.replace(/^\s+/, "");

    if (key === "") {
      push(lineNo, null, "error", "Empty key before '='.");
      continue;
    }
    variables += 1;

    if (!POSIX_NAME_PATTERN.test(key)) {
      if (DOTENV_NAME_PATTERN.test(key)) {
        push(
          lineNo,
          key,
          "warning",
          `"${key}" is accepted by dotenv but is not a POSIX-portable name ([A-Za-z_][A-Za-z0-9_]*); shells and docker will reject it.`,
        );
      } else {
        push(lineNo, key, "error", `Invalid variable name "${key}".`);
      }
    } else if (/[a-z]/.test(key)) {
      push(
        lineNo,
        key,
        "warning",
        "Lowercase letters in the name — POSIX reserves lowercase names for shell-local variables; convention is UPPER_SNAKE_CASE.",
      );
    }

    if (seen.has(key)) {
      push(
        lineNo,
        key,
        "warning",
        `Duplicate of line ${seen.get(key)} — dotenv keeps the LAST assignment, so the earlier value is dead.`,
      );
    } else {
      seen.set(key, lineNo);
    }

    const q = value[0];
    if (q === '"' || q === "'" || q === "`") {
      let buf = value.slice(1);
      let consumed = 0;
      let closeIdx = findClosingQuote(buf, q);
      while (closeIdx === -1 && i + 1 < lines.length) {
        i += 1;
        consumed += 1;
        buf += `\n${lines[i]}`;
        closeIdx = findClosingQuote(buf, q);
      }
      if (closeIdx === -1) {
        push(lineNo, key, "error", `Unclosed ${q} quote — the value swallows the rest of the file.`);
      } else {
        if (consumed > 0) {
          push(
            lineNo,
            key,
            "warning",
            `Multiline quoted value (${consumed + 1} lines) — supported by dotenv, but docker --env-file and many CI parsers read only the first line.`,
          );
        }
        const after = buf.slice(closeIdx + 1).trim();
        if (after !== "" && !after.startsWith("#")) {
          push(lineNo, key, "error", `Unexpected text after the closing quote: "${after.slice(0, 30)}"`);
        }
        if (q !== "'" && /\$\{?[A-Za-z_]/.test(buf.slice(0, closeIdx))) {
          push(
            lineNo,
            key,
            "warning",
            "Value contains $VAR — dotenv-expand and docker compose will substitute it; single-quote the value to keep it literal.",
          );
        }
      }
    } else {
      const hashIdx = value.indexOf("#");
      if (hashIdx !== -1) {
        push(
          lineNo,
          key,
          "warning",
          "Unquoted '#' — dotenv cuts the value there as an inline comment, but docker --env-file keeps it literally. Quote the value to disambiguate.",
        );
      }
      if (/\s$/.test(rest)) {
        push(lineNo, key, "warning", "Trailing whitespace after the value — invisible, and kept by some parsers.");
      }
      if (/\$\{?[A-Za-z_]/.test(value)) {
        push(
          lineNo,
          key,
          "warning",
          "Value contains $VAR — dotenv-expand and docker compose will substitute it; single-quote the value to keep it literal.",
        );
      }
      if (/\s/.test(value.trim()) ) {
        push(
          lineNo,
          key,
          "warning",
          "Unquoted value contains whitespace — fine for dotenv, but breaks when the file is sourced by a shell.",
        );
      }
    }
  }

  if (variables === 0 && issues.every((iss) => iss.severity !== "error")) {
    return { error: "No variables found — the file is only comments or blank lines." };
  }

  const errors = issues.filter((iss) => iss.severity === "error").length;
  const warnings = issues.length - errors;

  return {
    issues,
    summary: { errors, warnings, variables, lines: lines.length },
    ok: errors === 0,
  };
}

/** Plain-text report for the copy button. */
export function formatValidationReport(result) {
  if (!result || result.error) return "";
  const head = `.env validation: ${result.summary.errors} error(s), ${result.summary.warnings} warning(s), ${result.summary.variables} variable(s)`;
  const body = result.issues.map(
    (iss) => `${iss.severity.toUpperCase()} line ${iss.line}${iss.key ? ` [${iss.key}]` : ""}: ${iss.message}`,
  );
  return [head, ...body].join("\n");
}
