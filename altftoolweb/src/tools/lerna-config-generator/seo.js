const seo = {
  title: "Lerna Config Generator: lerna.json for Lerna v7",
  metaDescription:
    "Pick fixed or independent versioning, allowBranch, registry and dist-tag; copy a lerna.json that validates against Lerna's own JSON schema.",
  steps: [
    "Choose the \"Versioning mode\" (fixed or independent) and \"npm client\"; fixed mode asks for a \"Current fixed version\".",
    "Set \"Allowed release branches\", the optional publish registry and npm dist-tag, ignoreChanges globs, and tick \"Use conventional commits to derive version bumps and changelogs\".",
    "Click \"Copy JSON\" and save the output shown under \"Save as\" as lerna.json in your repository root.",
  ],
  intro:
    "This tool generates a lerna.json for Lerna v7/v8 — the config file that decides whether your monorepo uses fixed (one shared version) or independent per-package versioning, and how lerna version and lerna publish behave. It emits the documented command.version and command.publish options: conventionalCommits, allowBranch, message, ignoreChanges, registry and distTag, with the $schema pointer for editor validation. Package maintainers get a valid config without reading two generations of Lerna docs.",
  useCases: [
    "A library author starting an npm monorepo and choosing independent versioning with conventional-commit-driven changelogs",
    "A team locking releases to the main branch with allowBranch so lerna version refuses to run from feature branches",
    "A company publishing pre-releases to an internal registry under a next dist-tag instead of latest",
  ],
  benefits: [
    ["Both versioning modes", "Emits version: \"independent\" or a validated fixed semver — the core choice that shapes every later release."],
    ["Real option names", "Uses the documented command.version / command.publish keys, so the file validates against Lerna's own JSON schema."],
    ["Workspace-aware", "Leaves packages out when you use package-manager workspaces, matching Lerna v7+'s default discovery."],
  ],
  faqs: [
    [
      "What is the difference between fixed and independent versioning in Lerna?",
      "Fixed (locked) mode keeps every package on one shared version — a single number in lerna.json that all packages bump together, the model Babel uses. Independent mode sets version to \"independent\" so each changed package gets its own bump and changelog at release time; pick it when packages evolve at genuinely different speeds.",
    ],
    [
      "Do I still need a packages field in lerna.json?",
      "Usually not — since Lerna v7 removed useWorkspaces, Lerna reads package locations from your package manager's workspaces (the workspaces field in package.json, or pnpm-workspace.yaml) by default. An explicit packages array in lerna.json overrides that, which is only needed when your Lerna packages differ from your workspace globs.",
    ],
    [
      "How does conventionalCommits work in Lerna?",
      "With command.version.conventionalCommits set to true, lerna version parses commit messages to decide each bump — fix: produces a patch, feat: a minor, and a BREAKING CHANGE footer or ! a major — and writes CHANGELOG.md files automatically. It requires your team to actually follow the Conventional Commits spec, otherwise every release defaults to patch.",
    ],
    [
      "How do I stop Lerna publishing from the wrong branch?",
      "Set command.version.allowBranch to a branch name or list (for example \"main\") and lerna version will refuse to run anywhere else. For registry safety, command.publish.registry pins the target registry and distTag publishes under a tag like next so accidental installs of pre-releases via npm install package@latest cannot happen.",
    ],
  ],
};

export default seo;
