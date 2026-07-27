const seo = {
  intro:
    "This tool generates the .changeset/config.json that controls how @changesets/cli versions and publishes a monorepo — changelog generator, npm access level, base branch, fixed and linked package groups, internal-dependency bump policy and ignored packages. It emits the documented option names and shapes, including the [\"@changesets/changelog-github\", { repo }] tuple for GitHub-linked changelogs. Maintainers get a valid config with the sharp edges (restricted access, fixed-vs-linked semantics) explained inline.",
  useCases: [
    "An open-source maintainer switching the default changelog to @changesets/changelog-github so entries link commits and pull requests",
    "A team publishing scoped @org/* packages who must set access to public before their first npm publish succeeds",
    "A monorepo with a core and CLI package that must always share a version, configured as a fixed group",
  ],
  benefits: [
    ["Schema-valid output", "Includes the $schema pointer and only documented keys, so editors and the CLI validate the file immediately."],
    ["Fixed vs linked done right", "Group syntax is checked, single-package groups are rejected, and a package cannot land in both lists."],
    ["GitHub changelog wired", "Emits the changelog-github tuple with your org/repo and reminds you it needs a GITHUB_TOKEN in CI."],
  ],
  faqs: [
    [
      "What is the difference between fixed and linked packages in changesets?",
      "Fixed groups always share the exact same version — releasing any member bumps every member, like Lerna's fixed mode. Linked groups only receive a shared bump when they are released together; a linked package with no changes keeps its old version, which suits packages that should stay in step without forcing empty releases.",
    ],
    [
      "Why does changesets publish fail with a 402 error for my scoped package?",
      "Because access defaults to restricted, and npm charges for private scoped packages — publishing @org/package without a paid plan returns a 402 Payment Required. Set access to \"public\" in .changeset/config.json (or publishConfig.access in the package) for open-source scoped packages.",
    ],
    [
      "How do I stop changesets from versioning a package like my docs site?",
      "Add its package name to the ignore array — ignored packages are never bumped or published, and the CLI will refuse a changeset that mixes an ignored and a published package. For private packages across the board, the privatePackages option can disable versioning and tagging entirely.",
    ],
    [
      "What does updateInternalDependencies patch versus minor mean?",
      "It sets the smallest bump of a workspace dependency that makes changesets rewrite the depending package's range: with \"patch\" (the usual choice) any internal release propagates, while with \"minor\" a patch release of a dependency leaves dependents' ranges untouched. It only affects internal workspace dependencies, not third-party ones.",
    ],
  ],
};

export default seo;
