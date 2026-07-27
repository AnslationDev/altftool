/**
 * GitHub Actions secrets scope planner.
 *
 * Scope semantics and limits from GitHub's docs, "Using secrets in GitHub Actions"
 * (docs.github.com/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions):
 *  - Three scopes exist: organization, repository, environment.
 *  - Organization secrets are shared across repos with an access policy
 *    (all / private / selected repositories).
 *  - Environment secrets are only exposed to jobs that reference the
 *    environment, and deployment protection rules (required reviewers, wait
 *    timers) gate access.
 *  - Precedence when names collide: environment > repository > organization.
 *  - Naming: alphanumerics and underscores only, must not start with a digit,
 *    the GITHUB_ prefix is reserved, names are case-insensitive.
 *  - Limits: 1,000 org secrets, 100 repo secrets, 100 secrets per environment;
 *    a secret value maxes out at 48 KB.
 */

/** GitHub-documented secret name rule (also: GITHUB_ prefix reserved). */
export const SECRET_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
export const RESERVED_PREFIX = "GITHUB_";

/** Documented storage limits per scope. */
export const LIMITS = {
  organization: 1000,
  repository: 100,
  environmentPerEnv: 100,
  valueKb: 48,
};

export const USED_BY_OPTIONS = [
  { id: "one-repo", label: "One repository" },
  { id: "several-repos", label: "Several repositories" },
  { id: "all-repos", label: "Most / all repositories" },
];

export const SCOPE_LABELS = {
  organization: "Organization secret",
  repository: "Repository secret",
  environment: "Environment secret",
};

/**
 * Decide the scope for one secret.
 * Rule order (most restrictive wins):
 *  1. Different value per environment, or approval-gated → environment scope,
 *     because only environment secrets honour deployment protection rules.
 *  2. Shared by several/all repos → organization scope with an access policy.
 *  3. Otherwise → repository scope.
 */
export function decideScope({ variesPerEnv, needsApproval, usedBy }) {
  if (variesPerEnv || needsApproval) {
    return {
      scope: "environment",
      reason: variesPerEnv
        ? "The value differs per environment — only environment secrets keep prod and staging values separate under one name."
        : "Access must be approval-gated — deployment protection rules (required reviewers, wait timers) only apply to environment secrets.",
    };
  }
  if (usedBy === "several-repos" || usedBy === "all-repos") {
    return {
      scope: "organization",
      reason:
        usedBy === "all-repos"
          ? "Used by most repositories — one organization secret with an 'all repositories' policy beats duplicating it everywhere."
          : "Shared by several repositories — an organization secret with a 'selected repositories' policy keeps one source of truth.",
    };
  }
  return {
    scope: "repository",
    reason: "Single repository, same value everywhere — a plain repository secret is the simplest correct scope.",
  };
}

/** Validate one secret name against GitHub's rules. Returns null when fine. */
export function validateSecretName(name) {
  if (typeof name !== "string" || name.trim() === "") return "Secret name is empty.";
  const trimmed = name.trim();
  if (!SECRET_NAME_PATTERN.test(trimmed)) {
    return `"${trimmed}" — use only letters, digits and underscores, not starting with a digit.`;
  }
  if (trimmed.toUpperCase().startsWith(RESERVED_PREFIX)) {
    return `"${trimmed}" — the ${RESERVED_PREFIX} prefix is reserved by GitHub.`;
  }
  return null;
}

/**
 * Plan scopes for a list of secrets.
 * @param {object} input
 * @param {Array}  input.secrets  [{ name, usedBy, variesPerEnv, needsApproval }]
 * @param {string} [input.environments] Comma-separated environment names.
 * @param {string} [input.org]          Organization slug for gh commands.
 * @returns {object} { plans, counts, checklist, warnings } or { error }
 */
export function planSecretScopes({ secrets, environments = "staging, production", org = "" }) {
  if (!Array.isArray(secrets) || secrets.length === 0) {
    return { error: "Add at least one secret." };
  }
  if (secrets.length > 100) {
    return { error: "More than 100 secrets — plan them in batches." };
  }

  const envList = String(environments)
    .split(",")
    .map((env) => env.trim())
    .filter(Boolean);

  const seen = new Set();
  const plans = [];
  for (const secret of secrets) {
    const nameError = validateSecretName(secret.name);
    if (nameError) return { error: nameError };
    const name = secret.name.trim().toUpperCase(); // names are case-insensitive
    if (seen.has(name)) {
      return { error: `"${name}" appears twice — secret names are case-insensitive and must be unique.` };
    }
    seen.add(name);
    if (!USED_BY_OPTIONS.some((option) => option.id === secret.usedBy)) {
      return { error: `Choose how many repositories use ${name}.` };
    }

    const decision = decideScope(secret);
    const orgSlug = org.trim() === "" ? "<org>" : org.trim();
    let commands;
    if (decision.scope === "environment") {
      if (envList.length === 0) {
        return { error: "List at least one environment — some secrets need environment scope." };
      }
      commands = envList.map(
        (env) => `gh secret set ${name} --env ${env} --repo <owner>/<repo>`,
      );
    } else if (decision.scope === "organization") {
      commands = [
        secret.usedBy === "all-repos"
          ? `gh secret set ${name} --org ${orgSlug} --visibility all`
          : `gh secret set ${name} --org ${orgSlug} --repos "<repo-one>,<repo-two>"`,
      ];
    } else {
      commands = [`gh secret set ${name} --repo <owner>/<repo>`];
    }

    plans.push({ name, ...decision, commands });
  }

  const counts = {
    organization: plans.filter((plan) => plan.scope === "organization").length,
    repository: plans.filter((plan) => plan.scope === "repository").length,
    environment: plans.filter((plan) => plan.scope === "environment").length,
    total: plans.length,
  };

  const warnings = [];
  if (counts.repository > LIMITS.repository) {
    warnings.push(`${counts.repository} repository secrets exceeds GitHub's limit of ${LIMITS.repository} per repo.`);
  }
  if (counts.environment > LIMITS.environmentPerEnv) {
    warnings.push(
      `${counts.environment} environment secrets exceeds GitHub's limit of ${LIMITS.environmentPerEnv} per environment.`,
    );
  }

  const checklist = [];
  if (counts.environment > 0) {
    checklist.push(
      `Create the environment${envList.length === 1 ? "" : "s"} ${envList.join(", ")} under Settings → Environments in each deploying repo.`,
      "Add required reviewers or a wait timer to the production environment so approval-gated secrets are actually gated.",
      "Reference the environment in the job: `environment: production` — otherwise its secrets are not injected.",
    );
  }
  if (counts.organization > 0) {
    checklist.push(
      "Set each organization secret's access policy (all / private / selected repositories) under Org Settings → Secrets and variables → Actions.",
    );
  }
  if (counts.repository > 0) {
    checklist.push("Add repository secrets under Repo Settings → Secrets and variables → Actions.");
  }
  checklist.push(
    "Remember precedence: an environment secret overrides a repository secret, which overrides an organization secret of the same name.",
    `Keep each value under ${LIMITS.valueKb} KB — larger blobs belong in encrypted files, not secrets.`,
  );

  return { plans, counts, checklist, warnings, environments: envList };
}
