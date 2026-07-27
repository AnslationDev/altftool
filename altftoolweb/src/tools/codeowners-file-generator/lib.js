/**
 * CODEOWNERS generator + matcher.
 *
 * Syntax rules from GitHub's "About code owners" documentation
 * (docs.github.com), which GitLab and Bitbucket follow closely:
 * - A rule is a path pattern followed by one or more owners.
 * - Owners are @username, @org/team-name, or an email address.
 * - Patterns follow .gitignore rules with two exceptions: negation with `!`
 *   and character ranges `[...]` are NOT supported.
 * - ORDER MATTERS: the LAST matching pattern in the file takes precedence.
 * - Gitignore-style semantics implemented here (git-scm.com/docs/gitignore):
 *   - `*` matches anything except `/`; `?` matches one char except `/`;
 *     `**` matches anything including `/`.
 *   - A pattern with a `/` before its final character is anchored to the
 *     repository root; a pattern without one matches at any depth.
 *   - A trailing `/` restricts to directories (here: matches paths under it).
 * - The file lives at CODEOWNERS, .github/CODEOWNERS or docs/CODEOWNERS.
 */

// Owner forms per GitHub docs: @user, @org/team, or an email.
const USER_RE = /^@[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const TEAM_RE = /^@[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9_.-]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate one owner handle. Returns null when valid, else a reason. */
export function ownerProblem(owner) {
  const o = String(owner || "").trim();
  if (o === "") return "Owner is empty.";
  if (USER_RE.test(o) || TEAM_RE.test(o) || EMAIL_RE.test(o)) return null;
  if (!o.startsWith("@") && !o.includes("@")) {
    return `"${o}" must be @username, @org/team or an email address.`;
  }
  return `"${o}" is not a valid @username, @org/team or email.`;
}

/**
 * Convert a CODEOWNERS pattern to a RegExp over repo-relative paths
 * (no leading slash), per the gitignore semantics described above.
 * Returns null for unusable patterns.
 */
export function patternToRegex(pattern) {
  let pat = String(pattern || "").trim();
  if (pat === "" || pat.startsWith("#")) return null;
  // GitHub: negation and character ranges are unsupported in CODEOWNERS.
  if (pat.startsWith("!")) return null;

  let dirOnly = false;
  if (pat.endsWith("/")) {
    dirOnly = true;
    pat = pat.slice(0, -1);
  }

  // Anchored if a slash appears anywhere (now that trailing / was stripped).
  let anchored = false;
  if (pat.startsWith("/")) {
    anchored = true;
    pat = pat.slice(1);
  } else if (pat.includes("/")) {
    anchored = true;
  }
  if (pat === "") return null;

  // Tokenize: **, *, ?, literal chars.
  let source = "";
  for (let i = 0; i < pat.length; i += 1) {
    const ch = pat[i];
    if (ch === "*") {
      if (pat[i + 1] === "*") {
        // `**` — match across directories. Collapse `**/` and `/**` niceties.
        i += 1;
        source += ".*";
      } else {
        source += "[^/]*";
      }
    } else if (ch === "?") {
      source += "[^/]";
    } else {
      source += ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  }

  const prefix = anchored ? "^" : "(?:^|.*/)";
  // dirOnly, or matching a directory prefix: allow anything beneath.
  const suffix = dirOnly ? "/.*$" : "(?:$|/.*$)";
  try {
    return new RegExp(`${prefix}${source}${suffix}`);
  } catch {
    return null;
  }
}

/**
 * Build the CODEOWNERS file content from rules.
 *
 * @param {object} input
 * @param {Array<{pattern:string, owners:string}>} input.rules
 *        owners is a space/comma separated list of handles.
 * @param {string} [input.defaultOwner] Optional catch-all owner placed FIRST
 *        so later, more specific rules override it (last match wins).
 * @returns {object} { content, ruleCount, parsedRules } or { error }.
 */
export function generateCodeowners({ rules, defaultOwner = "" }) {
  const cleaned = (rules || [])
    .map((r) => ({
      pattern: String(r.pattern || "").trim(),
      owners: String(r.owners || "")
        .split(/[\s,]+/)
        .map((o) => o.trim())
        .filter(Boolean),
    }))
    .filter((r) => r.pattern !== "" || r.owners.length > 0);

  const def = String(defaultOwner || "").trim();
  if (cleaned.length === 0 && def === "") {
    return { error: "Add at least one rule or a default owner." };
  }

  if (def !== "") {
    const problem = ownerProblem(def);
    if (problem) return { error: `Default owner: ${problem}` };
  }

  for (const rule of cleaned) {
    if (rule.pattern === "") return { error: "Every rule needs a path pattern." };
    if (/\s/.test(rule.pattern)) {
      return { error: `Pattern "${rule.pattern}" cannot contain spaces.` };
    }
    if (rule.pattern.startsWith("!")) {
      return { error: "Negated patterns (!) are not supported in CODEOWNERS (GitHub docs)." };
    }
    if (/\[.*\]/.test(rule.pattern)) {
      return { error: "Character ranges [..] are not supported in CODEOWNERS (GitHub docs)." };
    }
    if (rule.owners.length === 0) {
      return { error: `Rule "${rule.pattern}" needs at least one owner.` };
    }
    for (const owner of rule.owners) {
      const problem = ownerProblem(owner);
      if (problem) return { error: problem };
    }
    if (!patternToRegex(rule.pattern)) {
      return { error: `Pattern "${rule.pattern}" could not be parsed.` };
    }
  }

  const parsedRules = [];
  const lines = [
    "# CODEOWNERS — reviewers auto-requested when matching files change.",
    "# Order matters: the LAST matching pattern takes precedence.",
    "",
  ];
  if (def !== "") {
    lines.push("# Default owners for everything not matched by a later rule.");
    lines.push(`* ${def}`);
    lines.push("");
    parsedRules.push({ pattern: "*", owners: [def], line: lines.length - 2 });
  }
  for (const rule of cleaned) {
    lines.push(`${rule.pattern} ${rule.owners.join(" ")}`);
    parsedRules.push({ pattern: rule.pattern, owners: rule.owners, line: lines.length });
  }

  return {
    content: `${lines.join("\n")}\n`,
    ruleCount: parsedRules.length,
    parsedRules,
    location: "Commit to CODEOWNERS, .github/CODEOWNERS or docs/CODEOWNERS on the default branch.",
  };
}

/**
 * Find the rule that owns a given path (LAST matching rule wins, per GitHub docs).
 *
 * @param {Array<{pattern:string, owners:string[]}>} parsedRules In file order.
 * @param {string} filePath Repo-relative path, e.g. "src/app/page.jsx".
 * @returns {object} { matched:true, pattern, owners } | { matched:false } | { error }.
 */
export function matchOwners(parsedRules, filePath) {
  const path = String(filePath || "").trim().replace(/^\/+/, "");
  if (path === "") return { error: "Enter a file path to test." };
  if (/\s/.test(path)) return { error: "Test path cannot contain spaces." };

  let winner = null;
  for (const rule of parsedRules || []) {
    const re = patternToRegex(rule.pattern);
    if (re && re.test(path)) winner = rule;
  }
  return winner
    ? { matched: true, pattern: winner.pattern, owners: winner.owners }
    : { matched: false };
}
