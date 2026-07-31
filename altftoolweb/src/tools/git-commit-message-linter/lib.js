/**
 * Commit message linter.
 *
 * Rules implemented are from the Conventional Commits v1.0.0 specification
 * (conventionalcommits.org) plus the defaults of commitlint's
 * config-conventional preset (commitlint.js.org):
 * - Header shape `type(scope)!: description` — spec §1: commits MUST be
 *   prefixed with a type, optional scope in parentheses, optional `!`, then
 *   the REQUIRED terminal colon and space.
 * - Allowed types: the config-conventional / Angular set.
 * - Body MUST begin one blank line after the description (spec §6).
 * - Breaking changes: `!` in the header or a `BREAKING CHANGE:` /
 *   `BREAKING-CHANGE:` footer (spec §11-§13, §16: BREAKING-CHANGE is
 *   synonymous with BREAKING CHANGE).
 * - Length rules are commitlint config-conventional defaults:
 *   header-max-length 100, body-max-line-length 100. The classic
 *   50/72 git convention is offered as a stricter option.
 * - subject-case / subject-full-stop: config-conventional forbids a
 *   sentence-case start and a trailing period in the subject.
 */

/** commitlint config-conventional type-enum (same as the Angular convention). */
export const CONVENTIONAL_TYPES = [
  "build",
  "chore",
  "ci",
  "docs",
  "feat",
  "fix",
  "perf",
  "refactor",
  "revert",
  "style",
  "test",
];

/** commitlint config-conventional: header-max-length default. */
export const HEADER_MAX_DEFAULT = 100;
/** Classic git convention popularised by Tim Pope's note: ~50-char summary. */
export const HEADER_MAX_CLASSIC = 50;
/** commitlint config-conventional: body-max-line-length default. */
export const BODY_LINE_MAX = 100;

export const HEADER_LIMIT_OPTIONS = [
  { id: "commitlint", label: "commitlint default — 100 characters", max: HEADER_MAX_DEFAULT },
  { id: "classic", label: "Classic git convention — 50 characters", max: HEADER_MAX_CLASSIC },
];

// Conventional Commits §1: type, optional (scope), optional !, ": " then description.
const HEADER_RE = /^([A-Za-z]+)(\(([^()\r\n]*)\))?(!)?: (.*)$/;
const BREAKING_FOOTER_RE = /^BREAKING[ -]CHANGE: /;

/**
 * Lint one commit message.
 *
 * @param {object} input
 * @param {string} input.message      Full commit message (header, blank line, body).
 * @param {number} input.headerMax    Maximum header length.
 * @param {boolean} input.requireScope Whether a scope is mandatory.
 * @returns {object} { valid, errors, warnings, parsed, fixed, checkedRules } or { error }.
 */
export function lintCommitMessage({ message, headerMax = HEADER_MAX_DEFAULT, requireScope = false }) {
  const raw = String(message ?? "");
  if (raw.trim() === "") return { error: "Paste a commit message to lint." };

  const max = Number(headerMax);
  if (!Number.isFinite(max) || max < 10) {
    return { error: "Header length limit must be a number of at least 10." };
  }

  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const header = lines[0];

  const errors = [];
  const warnings = [];

  const match = HEADER_RE.exec(header);
  let type = null;
  let scope = null;
  let bang = false;
  let subject = null;

  if (!match) {
    errors.push({
      rule: "header-format",
      text: 'Header must be "type(scope)!: description" — a type, optional scope, optional "!", then a colon and a single space (Conventional Commits §1).',
    });
  } else {
    [, type, , scope, , subject] = [match[0], match[1], match[2], match[3], match[4], match[5]];
    bang = match[4] === "!";

    if (!CONVENTIONAL_TYPES.includes(type.toLowerCase())) {
      errors.push({
        rule: "type-enum",
        text: `Type "${type}" is not in the conventional set: ${CONVENTIONAL_TYPES.join(", ")}.`,
      });
    } else if (type !== type.toLowerCase()) {
      errors.push({
        rule: "type-case",
        text: `Type must be lower case — "${type}" should be "${type.toLowerCase()}".`,
      });
    }

    if (match[2] !== undefined && String(scope).trim() === "") {
      errors.push({ rule: "scope-empty-parens", text: "Scope parentheses are present but empty." });
    }
    if (requireScope && (match[2] === undefined || String(scope).trim() === "")) {
      errors.push({ rule: "scope-required", text: "Your rules require a scope, e.g. feat(api): …" });
    }

    if (!subject || subject.trim() === "") {
      errors.push({ rule: "subject-empty", text: "Description after the colon must not be empty." });
    } else {
      if (subject.endsWith(".")) {
        errors.push({
          rule: "subject-full-stop",
          text: "Subject must not end with a period (commitlint subject-full-stop).",
        });
      }
      if (/^[A-Z]/.test(subject)) {
        warnings.push({
          rule: "subject-case",
          text: "config-conventional expects the subject to start lower-case (no sentence-case).",
        });
      }
      if (subject !== subject.trimStart() || / {2,}/.test(subject)) {
        warnings.push({ rule: "subject-whitespace", text: "Subject has extra whitespace." });
      }
    }
  }

  if (header.length > max) {
    errors.push({
      rule: "header-max-length",
      text: `Header is ${header.length} characters — limit is ${max}.`,
    });
  }

  // Body / footer checks
  let hasBody = false;
  let breakingFooter = false;
  if (lines.length > 1) {
    const rest = lines.slice(1);
    const firstContent = rest.findIndex((l) => l.trim() !== "");
    if (firstContent !== -1) {
      hasBody = true;
      if (firstContent !== 1 || lines[1].trim() !== "") {
        // Either no blank line (firstContent === 0) or content preceded oddly.
        if (lines[1].trim() !== "") {
          errors.push({
            rule: "body-leading-blank",
            text: "Body must begin one blank line after the description (Conventional Commits §6).",
          });
        }
      }
      rest.forEach((line, i) => {
        if (line.length > BODY_LINE_MAX) {
          warnings.push({
            rule: "body-max-line-length",
            text: `Line ${i + 2} is ${line.length} characters — commitlint's default limit is ${BODY_LINE_MAX}.`,
          });
        }
        if (BREAKING_FOOTER_RE.test(line.trim())) breakingFooter = true;
      });
    }
  }

  // Build a suggested fix when the header parsed at least partially.
  let fixed = null;
  if (match) {
    const fixedType = CONVENTIONAL_TYPES.includes(type.toLowerCase()) ? type.toLowerCase() : "feat";
    const cleanScope = scope && String(scope).trim() !== "" ? `(${String(scope).trim()})` : "";
    let fixedSubject = (subject || "change")
      .trim()
      .replace(/ {2,}/g, " ")
      .replace(/\.+$/, "");
    if (/^[A-Z][a-z]/.test(fixedSubject)) {
      fixedSubject = fixedSubject[0].toLowerCase() + fixedSubject.slice(1);
    }

    // A subject made up of nothing but trailing period(s) (e.g. "...")
    // strips down to an empty description, which would still fail
    // subject-empty. There's no honest text to fill in on the user's
    // behalf, so skip the suggestion rather than emit a still-broken fix.
    if (fixedSubject !== "") {
      const prefix = `${fixedType}${cleanScope}${bang ? "!" : ""}: `;
      let fixedHeader = `${prefix}${fixedSubject}`;

      if (fixedHeader.length > max) {
        // Truncate ONLY the description so type(scope)!: stays intact —
        // slicing the whole header can chop the closing paren, the colon,
        // or the description entirely, producing an invalid header.
        const ellipsis = "…";
        const budget = max - prefix.length - ellipsis.length;
        if (budget < 1) {
          // type(scope)!: alone already meets or exceeds the limit — no
          // truncation of the description keeps the header valid.
          fixedHeader = null;
        } else {
          let truncated = fixedSubject.slice(0, budget);
          const lastSpace = truncated.lastIndexOf(" ");
          if (lastSpace > 0) truncated = truncated.slice(0, lastSpace).trimEnd();
          if (truncated === "") truncated = fixedSubject.slice(0, budget).trimEnd();
          fixedHeader = `${prefix}${truncated}${ellipsis}`;
        }
      }

      if (fixedHeader) {
        const bodyPart = hasBody
          ? `\n\n${lines.slice(1).join("\n").replace(/^\n+/, "")}`
          : "";
        fixed = `${fixedHeader}${bodyPart}`;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    parsed: match
      ? {
          type,
          scope: scope && String(scope).trim() !== "" ? scope : null,
          breaking: bang || breakingFooter,
          subject,
          hasBody,
        }
      : null,
    fixed,
    headerLength: header.length,
    headerMax: max,
    checkedRules: [
      "header-format",
      "type-enum",
      "type-case",
      "scope rules",
      "subject-empty",
      "subject-full-stop",
      "subject-case",
      "header-max-length",
      "body-leading-blank",
      "body-max-line-length",
      "breaking-change footer",
    ],
  };
}
