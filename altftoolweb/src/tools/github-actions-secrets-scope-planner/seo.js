const seo = {
  intro:
    "This planner assigns each of your CI secrets to the correct GitHub Actions scope — organization, repository or environment — using the rules from GitHub's secrets documentation: environment secrets for values that differ per environment or need deployment protection rules, organization secrets for values shared across repositories, and repository secrets for the rest. It outputs the reasoning per secret, ready-to-run gh CLI commands, and a checklist of the settings screens you still have to touch.",
  useCases: [
    "Untangling a repo where prod and staging deploy keys live as two differently named repository secrets instead of one environment secret",
    "Rolling out a shared NPM_TOKEN to forty repositories as a single organization secret with a selected-repositories policy",
    "Putting a production database password behind required-reviewer approval by moving it into an environment secret",
  ],
  benefits: [
    ["Rule-based decisions", "Environment beats repo beats org is applied per secret, with the reason spelled out."],
    ["gh CLI commands included", "Each secret comes with the exact gh secret set command for its scope, environments included."],
    ["Limits checked", "Warns when a plan would blow past GitHub's 100-per-repo or 100-per-environment secret limits."],
  ],
  faqs: [
    [
      "What is the difference between repository, environment and organization secrets in GitHub Actions?",
      "Repository secrets are available to all workflows in one repo; environment secrets are only injected into jobs that declare that environment and can be gated by required reviewers or wait timers; organization secrets are defined once and shared across repos via an access policy. When the same name exists at several levels, the environment value wins, then repository, then organization.",
    ],
    [
      "When should I use environment secrets instead of repository secrets?",
      "Whenever the value differs between staging and production, or when access should require approval. Only environment secrets honour deployment protection rules, so a PROD_DB_PASSWORD stored as a repository secret is readable by any workflow run without review.",
    ],
    [
      "How many secrets can I have in GitHub Actions?",
      "GitHub documents 1,000 organization secrets, 100 repository secrets per repo, and 100 secrets per environment, with each value limited to 48 KB. A workflow run can reference up to 100 organization plus 100 repository plus 100 environment secrets.",
    ],
    [
      "Why is my GitHub Actions secret name invalid?",
      "Secret names may contain only letters, numbers and underscores, cannot start with a number, and cannot start with GITHUB_, which is a reserved prefix. Names are case-insensitive, so api_key and API_KEY are the same secret.",
    ],
  ],
};

export default seo;
