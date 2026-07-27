/**
 * Git branch naming standard generator.
 *
 * Constraints on what a branch name may contain come from
 * git-check-ref-format (git-scm.com/docs/git-check-ref-format): no spaces,
 * no "..", no leading/trailing "/", no trailing ".", none of ~ ^ : ? * [ \,
 * and no component starting with ".". This tool generates names from a
 * conservative safe alphabet (lowercase letters, digits, hyphens, slashes as
 * segment separators) which satisfies all of those rules by construction.
 *
 * The type prefixes offered are the de-facto standard set popularised by the
 * Conventional Commits / Angular commit types and common git-flow branch
 * prefixes (feature, bugfix, hotfix, release).
 */

/** Branch type prefixes: git-flow prefixes + common conventional types. */
export const BRANCH_TYPES = [
  { id: "feature", label: "feature — new functionality" },
  { id: "bugfix", label: "bugfix — non-urgent fix" },
  { id: "hotfix", label: "hotfix — urgent production fix" },
  { id: "release", label: "release — release preparation" },
  { id: "chore", label: "chore — tooling and maintenance" },
  { id: "docs", label: "docs — documentation only" },
  { id: "experiment", label: "experiment — spike or prototype" },
];

/** Segment separators that are safe in git ref names. */
export const SEPARATORS = [
  { id: "/", label: "Slash (feature/PROJ-12-title) — groups in git UIs" },
  { id: "-", label: "Hyphen (feature-PROJ-12-title) — flat, single segment" },
];

// Jira-style project keys: start with a letter, uppercase letters + digits.
// (Atlassian: project keys must start with an uppercase letter, and contain
// only uppercase letters and numbers.)
const PROJECT_KEY_RE = /^[A-Z][A-Z0-9]*$/;

// Description slug: lowercase kebab-case, satisfies git-check-ref-format.
const SLUG_SOURCE = "[a-z0-9]+(?:-[a-z0-9]+)*";

/** Escape a literal for embedding in a regular expression. */
export function escapeRegex(literal) {
  return String(literal).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Turn free text into a branch-safe kebab-case slug. */
export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Build the naming standard: template, regex, examples and enforcement snippets.
 *
 * @param {object} input
 * @param {string[]} input.types        Selected type ids (subset of BRANCH_TYPES).
 * @param {string}  input.separator     "/" or "-".
 * @param {boolean} input.requireTicket Whether a ticket id segment is mandatory.
 * @param {string}  input.projectKey    Jira-style project key, e.g. "PROJ".
 * @param {boolean} input.includeUser   Include a username segment after the type.
 * @param {string}  input.sampleTicket  Ticket number used in the examples.
 * @param {string}  input.sampleDescription Description used in the examples.
 * @returns {object} { template, regex, regexSource, examples, ciSnippet, rules } or { error }.
 */
export function buildBranchStandard({
  types,
  separator,
  requireTicket = true,
  projectKey = "PROJ",
  includeUser = false,
  sampleTicket = "123",
  sampleDescription = "add login form",
}) {
  const selected = (types || []).filter((t) => BRANCH_TYPES.some((b) => b.id === t));
  if (selected.length === 0) return { error: "Select at least one branch type." };

  const sep = SEPARATORS.some((s) => s.id === separator) ? separator : null;
  if (!sep) return { error: "Choose a separator." };

  const key = String(projectKey || "").trim().toUpperCase();
  if (requireTicket && !PROJECT_KEY_RE.test(key)) {
    return {
      error:
        "Project key must start with a letter and contain only uppercase letters and digits (e.g. PROJ, WEB2).",
    };
  }

  const ticketNo = String(sampleTicket || "").trim();
  if (requireTicket && !/^\d+$/.test(ticketNo)) {
    return { error: "Sample ticket number must be digits only (e.g. 123)." };
  }

  const descSlug = slugify(sampleDescription);
  if (descSlug === "") {
    return { error: "Enter a sample description with at least one letter or digit." };
  }

  const sepEsc = escapeRegex(sep);
  const typeAlt = `(?:${selected.join("|")})`;

  // Assemble the template and regex segment by segment.
  const templateParts = ["<type>"];
  const regexParts = [typeAlt];

  if (includeUser) {
    templateParts.push("<username>");
    regexParts.push(SLUG_SOURCE);
  }
  if (requireTicket) {
    // Ticket and description form one segment joined by "-": PROJ-123-add-login
    templateParts.push(`${key}-<ticket>-<short-description>`);
    regexParts.push(`${escapeRegex(key)}-\\d+-${SLUG_SOURCE}`);
  } else {
    templateParts.push("<short-description>");
    regexParts.push(SLUG_SOURCE);
  }

  const template = templateParts.join(sep);
  const regexSource = `^${regexParts.join(sepEsc)}$`;

  let regex;
  try {
    regex = new RegExp(regexSource);
  } catch {
    return { error: "Could not build a valid pattern from these inputs." };
  }

  const sampleUser = "asha";
  const examples = selected.slice(0, 3).map((type) => {
    const parts = [type];
    if (includeUser) parts.push(sampleUser);
    if (requireTicket) parts.push(`${key}-${ticketNo}-${descSlug}`);
    else parts.push(descSlug);
    return parts.join(sep);
  });

  const rules = [
    `Allowed types: ${selected.join(", ")}.`,
    includeUser ? "A lowercase username segment follows the type." : null,
    requireTicket
      ? `Ticket id ${key}-<number> is mandatory and prefixes the description.`
      : "No ticket segment — the description follows the type directly.",
    "Descriptions are lowercase kebab-case: letters, digits and single hyphens.",
    "This alphabet automatically satisfies git-check-ref-format (no spaces, ~, ^, :, ?, *, [ or ..).",
  ].filter(Boolean);

  const ciSnippet = [
    "# CI check (e.g. GitHub Actions step) — fails the build on a bad branch name",
    `BRANCH="\${GITHUB_HEAD_REF:-\$(git rev-parse --abbrev-ref HEAD)}"`,
    `echo "\$BRANCH" | grep -Eq '${regexSource}' || {`,
    `  echo "Branch name '\$BRANCH' does not match ${template}"; exit 1;`,
    "}",
  ].join("\n");

  return { template, regex, regexSource, examples, rules, ciSnippet };
}

/**
 * Validate a candidate branch name against a standard built by buildBranchStandard.
 * Returns { valid } or { valid:false, reason }.
 */
export function validateBranchName(name, standard) {
  const candidate = String(name || "").trim();
  if (candidate === "") return { valid: false, reason: "Branch name is empty." };
  if (/\s/.test(candidate)) {
    return { valid: false, reason: "Branch names cannot contain whitespace (git-check-ref-format)." };
  }
  if (!standard || !standard.regex) return { valid: false, reason: "No standard to check against." };
  if (!standard.regex.test(candidate)) {
    return {
      valid: false,
      reason: `Does not match the template ${standard.template} (pattern ${standard.regexSource}).`,
    };
  }
  return { valid: true };
}
