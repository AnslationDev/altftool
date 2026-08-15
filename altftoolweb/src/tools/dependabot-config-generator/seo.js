const seo = {
  title: "Dependabot Config Generator for .github/dependabot.yml",
  metaDescription:
    "Build a version-2 .github/dependabot.yml: pick from 18 package ecosystems, set daily, weekly or monthly schedules, group minor+patch PRs, ignore majors.",
  steps: [
    "For each update entry, pick a Package ecosystem (18 choices, npm to GitHub Actions), its Directory and a daily, weekly or monthly Schedule interval; press Add ecosystem for more entries.",
    "Set the Open PR limit (0 disables version PRs) and tick 'Group minor and patch updates into a single pull request' or 'Ignore major version updates for all dependencies'.",
    "Press Copy YAML and commit the generated file to .github/dependabot.yml on your default branch, where Dependabot picks it up automatically.",
  ],
  intro:
    "This generator builds a valid .github/dependabot.yml file — the version 2 configuration GitHub's Dependabot reads to open automated dependency-update pull requests. Pick your package ecosystems (npm, pip, Docker, Go modules, Maven and more), set daily, weekly or monthly schedules, group minor and patch bumps into one PR, and ignore major versions, then copy the ready-to-commit YAML.",
  useCases: [
    "A maintainer enabling weekly npm and GitHub Actions updates on a repository without writing the YAML schema by hand",
    "A team lead grouping minor and patch bumps into a single pull request per week to stop Dependabot flooding the review queue",
    "A platform engineer configuring per-directory update entries for a monorepo with separate frontend and backend manifests",
  ],
  benefits: [
    ["Schema-correct output", "Emits version 2 YAML with the exact keys Dependabot validates: package-ecosystem, directory and schedule.interval."],
    ["PR noise control", "One click adds a groups block for minor and patch updates and an ignore rule for semver-major bumps."],
    ["Multi-ecosystem", "Covers all 18 public package-ecosystem values, with duplicate ecosystem + directory pairs caught before you commit."],
  ],
  faqs: [
    [
      "Where does the dependabot.yml file go in my repository?",
      "At .github/dependabot.yml on your repository's default branch. Dependabot reads it automatically once committed — there is no separate enable step for version updates, though your organisation can also turn Dependabot on or off in repository security settings.",
    ],
    [
      "What is the default open-pull-requests-limit in Dependabot?",
      "Five open pull requests per update entry when the key is omitted. Setting it to 0 disables version-update PRs for that entry while leaving Dependabot security updates active, and you can raise it to any value up to 99 if you want more parallel PRs.",
    ],
    [
      "How do I stop Dependabot opening a separate PR for every package?",
      "Add a groups block to the update entry. Grouping by update-types \"minor\" and \"patch\" — which this generator emits with one checkbox — makes Dependabot combine all minor and patch bumps for that ecosystem into a single pull request, while major updates still arrive individually.",
    ],
    [
      "Can Dependabot ignore major version updates?",
      "Yes. An ignore rule with dependency-name \"*\" and update-types \"version-update:semver-major\" suppresses every major-version PR for that entry; minor and patch updates continue as scheduled. You can also ignore specific packages by name instead of the wildcard if only a few dependencies are pinned.",
    ],
  ],
};

export default seo;
