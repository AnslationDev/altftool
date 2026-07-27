/**
 * Terraform environment-separation strategy planner.
 *
 * The heuristics encode published HashiCorp guidance:
 *  - "Managing Workspaces" / CLI workspaces docs: workspaces suit multiple states
 *    for the SAME configuration and are NOT suitable for strong isolation or
 *    per-environment credentials, because every workspace shares one backend.
 *    (developer.hashicorp.com/terraform/language/state/workspaces)
 *  - HashiCorp "Terraform Recommended Practices" and the well-known community
 *    guidance (e.g. Gruntwork/Terragrunt docs): use separate directories or fully
 *    separate backends when environments diverge or must be isolated by account.
 */

export const STRATEGIES = [
  {
    id: "workspaces",
    label: "CLI workspaces",
    summary:
      "One root module, one backend, `terraform workspace select <env>` switches state.",
    pros: [
      "Zero code duplication — one configuration for every environment",
      "Cheapest to set up; nothing new to wire in CI",
      "State files stay together under a single backend key prefix",
    ],
    cons: [
      "All environments share one backend and one set of credentials",
      "Easy to apply to the wrong environment — the prompt looks identical",
      "Conditional logic (terraform.workspace) creeps into the code as envs diverge",
    ],
    layout: [
      "infra/",
      "├── main.tf          # single root module",
      "├── variables.tf",
      "├── dev.tfvars",
      "├── prod.tfvars",
      "└── backend.tf       # one backend, state per workspace",
      "",
      "$ terraform workspace select prod",
      "$ terraform apply -var-file=prod.tfvars",
    ].join("\n"),
  },
  {
    id: "directories",
    label: "Directory per environment",
    summary:
      "envs/dev, envs/prod each hold a thin root module calling shared modules; each directory has its own state.",
    pros: [
      "Environments can diverge freely — different sizes, features, even providers",
      "Each directory can point at a different backend or account",
      "Blast radius of a bad apply is one directory",
    ],
    cons: [
      "Root-module boilerplate is duplicated per environment and can drift",
      "Promoting a change means touching several directories",
      "More plumbing in CI — one pipeline (or matrix leg) per directory",
    ],
    layout: [
      "infra/",
      "├── modules/",
      "│   └── app/          # shared, versionable module",
      "└── envs/",
      "    ├── dev/",
      "    │   ├── main.tf   # module \"app\" { source = \"../../modules/app\" ... }",
      "    │   └── backend.tf",
      "    └── prod/",
      "        ├── main.tf",
      "        └── backend.tf",
    ].join("\n"),
  },
  {
    id: "separate-state",
    label: "Separate backend / account per environment",
    summary:
      "Each environment gets its own state backend (often its own cloud account), wired via partial backend config, Terragrunt or TFC/HCP workspaces.",
    pros: [
      "Strongest isolation — separate credentials, accounts and state stores",
      "Satisfies compliance regimes that require production segregation",
      "An attacker or bad apply in dev cannot touch prod state",
    ],
    cons: [
      "Most moving parts: backend bootstrap per environment, credential handling in CI",
      "Usually needs tooling (Terragrunt, partial backend config, or TFC) to stay DRY",
      "Overkill for a solo project with two similar environments",
    ],
    layout: [
      "accounts/",
      "├── dev    → backend: s3://acme-tfstate-dev    (dev account)",
      "└── prod   → backend: s3://acme-tfstate-prod   (prod account)",
      "",
      "$ terraform init -backend-config=env/prod.backend.hcl",
      "# or terragrunt run-all plan with per-env remote_state blocks",
    ].join("\n"),
  },
];

export const DIVERGENCE_OPTIONS = [
  { id: "identical", label: "Identical — only variable values differ" },
  { id: "minor", label: "Minor — a few counts/sizes/features differ" },
  { id: "major", label: "Major — different resources or providers per env" },
];

export const ISOLATION_OPTIONS = [
  { id: "low", label: "Low — hobby or internal tooling" },
  { id: "medium", label: "Medium — prod matters, no formal compliance" },
  { id: "strict", label: "Strict — compliance requires segregation" },
];

export const TEAM_OPTIONS = [
  { id: "solo", label: "Solo engineer" },
  { id: "small", label: "One small team" },
  { id: "multiple", label: "Multiple teams touch this code" },
];

const SCORE_MIN = 0;
const SCORE_MAX = 10;
const clamp = (value) => Math.min(SCORE_MAX, Math.max(SCORE_MIN, value));

/** Environments beyond this in one shared backend make workspace sprawl painful. */
const MANY_ENVS = 6;

/**
 * Score the three strategies. Deterministic: same input, same output.
 * @returns {object} { ranked, recommended } or { error }
 */
export function scoreStrategies({
  envCount,
  divergence,
  isolation,
  team,
  separateAccounts = false,
  promoteViaCi = false,
}) {
  const envs = Number(envCount);
  if (!Number.isFinite(envs) || envs < 1) {
    return { error: "Enter at least 1 environment." };
  }
  if (envs > 100) {
    return { error: "More than 100 environments — split the estate before choosing a layout." };
  }
  if (!DIVERGENCE_OPTIONS.some((option) => option.id === divergence)) {
    return { error: "Choose how much the environments differ." };
  }
  if (!ISOLATION_OPTIONS.some((option) => option.id === isolation)) {
    return { error: "Choose an isolation requirement." };
  }
  if (!TEAM_OPTIONS.some((option) => option.id === team)) {
    return { error: "Choose a team shape." };
  }

  const reasons = { workspaces: [], directories: [], "separate-state": [] };
  const scores = { workspaces: 5, directories: 5, "separate-state": 4 };

  // --- configuration divergence (HashiCorp: workspaces = same config, different state)
  if (divergence === "identical") {
    scores.workspaces += 3;
    reasons.workspaces.push("+3 identical configs are exactly what workspaces are designed for");
    scores.directories -= 1;
    reasons.directories.push("-1 per-env directories duplicate identical code");
  } else if (divergence === "minor") {
    scores.workspaces += 1;
    reasons.workspaces.push("+1 minor differences fit var-files per workspace");
    scores.directories += 1;
    reasons.directories.push("+1 small divergence is easy to express per directory");
  } else {
    scores.workspaces -= 3;
    reasons.workspaces.push("-3 major divergence forces terraform.workspace conditionals everywhere");
    scores.directories += 3;
    reasons.directories.push("+3 each environment can have its own root module");
    scores["separate-state"] += 1;
    reasons["separate-state"].push("+1 divergent envs usually deserve their own backends too");
  }

  // --- account separation (workspaces share ONE backend and credential set)
  if (separateAccounts) {
    scores.workspaces -= 4;
    reasons.workspaces.push("-4 workspaces share one backend — clashes with per-account credentials");
    scores.directories += 1;
    reasons.directories.push("+1 each directory can carry its own backend block");
    scores["separate-state"] += 4;
    reasons["separate-state"].push("+4 separate accounts map one-to-one onto separate backends");
  }

  // --- isolation requirement
  if (isolation === "strict") {
    scores.workspaces -= 3;
    reasons.workspaces.push("-3 shared state store fails strict segregation requirements");
    scores.directories += 1;
    reasons.directories.push("+1 directory split limits blast radius");
    scores["separate-state"] += 3;
    reasons["separate-state"].push("+3 separate state stores satisfy compliance segregation");
  } else if (isolation === "medium") {
    scores.workspaces -= 1;
    reasons.workspaces.push("-1 wrong-workspace applies are a real risk once prod matters");
    scores["separate-state"] += 1;
    reasons["separate-state"].push("+1 extra isolation still pays off for production");
  }

  // --- team shape
  if (team === "solo" || team === "small") {
    scores.workspaces += 1;
    reasons.workspaces.push("+1 low ceremony suits a small crew");
    if (team === "solo") {
      scores["separate-state"] -= 2;
      reasons["separate-state"].push("-2 backend bootstrap per env is heavy for one person");
    }
  } else {
    scores.workspaces -= 1;
    reasons.workspaces.push("-1 many teams in one backend step on each other's state");
    scores.directories += 1;
    reasons.directories.push("+1 teams can own directories independently");
    scores["separate-state"] += 1;
    reasons["separate-state"].push("+1 per-team/per-env backends decouple ownership");
  }

  // --- CI promotion flow
  if (promoteViaCi) {
    scores["separate-state"] += 1;
    reasons["separate-state"].push("+1 a promotion pipeline absorbs the per-env backend plumbing");
  }

  // --- environment count
  if (envs >= MANY_ENVS) {
    scores.workspaces -= 1;
    reasons.workspaces.push(`-1 ${envs} workspaces in one backend get hard to audit`);
    scores.directories -= 1;
    reasons.directories.push(`-1 ${envs} copies of the root module invite drift`);
  }

  // Rank on the raw score so a clamped tie (e.g. two strategies both hitting 10)
  // still resolves to the one that earned more points; display the clamped value.
  const ranked = STRATEGIES.map((strategy) => ({
    ...strategy,
    score: clamp(scores[strategy.id]),
    rawScore: scores[strategy.id],
    reasons: reasons[strategy.id],
  })).sort((a, b) => b.rawScore - a.rawScore);

  return { ranked, recommended: ranked[0], envCount: envs };
}
