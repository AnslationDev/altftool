const seo = {
  intro:
    "This generator defines a git branch naming convention — allowed type prefixes, an optional Jira-style ticket segment, a separator and a kebab-case description — and turns it into a template, a validation regular expression, worked examples and a CI check script. Names are built from an alphabet that always satisfies git-check-ref-format, so nothing the standard allows can be rejected by git itself. It is for tech leads who want branch names that link to tickets and group cleanly in git UIs.",
  useCases: [
    "Agreeing a team convention like feature/PROJ-123-add-login before a new project's first sprint",
    "Adding a CI step that fails a pull request when the source branch does not match the agreed pattern",
    "Checking whether an existing branch name is valid against the standard before pushing it",
  ],
  benefits: [
    ["Regex included", "Every standard comes with the exact regular expression to enforce it in CI or a server-side hook."],
    ["Git-safe by construction", "Generated names use only characters permitted by git-check-ref-format, so git never rejects them."],
    ["Ticket traceability", "Jira-style KEY-123 segments let GitHub, GitLab and Jira auto-link branches to issues."],
  ],
  faqs: [
    [
      "What is a good git branch naming convention?",
      "The most common pattern is type/ticket-description, for example feature/PROJ-123-add-login: a type prefix (feature, bugfix, hotfix), the ticket ID, then a short kebab-case description. Slash separators make branches group into folders in tools like GitKraken and the GitHub branch list; the ticket ID lets issue trackers auto-link the branch.",
    ],
    [
      "Which characters are not allowed in git branch names?",
      "Per git-check-ref-format, a branch name cannot contain spaces, two consecutive dots (..), the characters ~ ^ : ? * [ or backslash, cannot begin or end with a slash, cannot end with a dot or .lock, and no path component may start with a dot. Sticking to lowercase letters, digits, hyphens and slashes avoids every one of these rules.",
    ],
    [
      "Should branch names use slashes or hyphens?",
      "Slashes create a hierarchy (feature/, hotfix/) that many git GUIs render as folders, which is useful once a repository has dozens of active branches. One caveat: git stores branches as files, so after a branch named feature exists you cannot create feature/login — pick one style and use the type name only as a prefix, never as a standalone branch.",
    ],
    [
      "How do I enforce a branch naming convention automatically?",
      "Add a CI step that tests the branch name against a regular expression and exits non-zero on a mismatch — this tool generates that script. On GitHub, the branch name for a pull request is available as GITHUB_HEAD_REF; GitLab exposes CI_COMMIT_REF_NAME. Server-side pre-receive hooks can enforce the same regex for pushes on self-hosted git.",
    ],
  ],
};

export default seo;
