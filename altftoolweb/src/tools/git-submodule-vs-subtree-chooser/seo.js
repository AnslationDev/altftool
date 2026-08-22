const seo = {
  title: "Git Submodule vs Subtree vs Package Chooser",
  metaDescription:
    "Answer six questions — registry, change rate, consumer edits, git expertise, consumers, pinning — to rank submodule, subtree and package with reasons.",
  steps: [
    "Answer the workflow questions: How often does the shared code change?, Team git expertise, and Repositories consuming the shared code.",
    "Tick the checkboxes that apply — a package registry is available, developers edit the shared code from inside consumer repos, consumers must pin an exact commit — and the scoring updates instantly.",
    "Read the 'Best fit for your answers' verdict and each option's score bar with reasons and cautions, then press Copy result to paste the ranked list into an RFC or ticket.",
  ],
  intro:
    "This chooser scores the three standard ways to share code across git repositories — git submodules, git subtree and a published package dependency — against six facts about your situation: registry availability, change frequency, whether consumers edit the shared code, team git expertise, consumer count and exact-commit pinning. The trade-offs encoded come from the Pro Git submodules chapter, git's contrib/subtree documentation and standard registry practice, and every point scored is explained.",
  useCases: [
    "Deciding how two product repos should consume a shared design-system package the same team maintains",
    "Evaluating whether to replace a painful submodule setup with git subtree or a private npm registry",
    "Writing an engineering RFC that needs the submodule vs subtree trade-offs laid out with sources",
  ],
  benefits: [
    ["Three options, not two", "Includes the package-registry route that submodule-vs-subtree debates usually forget."],
    ["Documented trade-offs", "Reasons cite the actual behaviours: pointer pinning, --recurse-submodules, subtree push, semver upgrades."],
    ["Cautions per option", "Each mechanism lists why it may hurt in your case, like vendored copies diverging across many consumers."],
  ],
  faqs: [
    [
      "What is the difference between git submodule and git subtree?",
      "A submodule stores a pointer to an exact commit of another repository, checked out into a nested directory — the code is not in your repo. A subtree copies the other repository's files (and optionally history) into a subdirectory of your repo, so a plain git clone contains everything. Submodules pin precisely but demand submodule-aware workflows; subtrees are invisible to consumers but duplicate content.",
    ],
    [
      "Why do people say git submodules are painful?",
      "Because the workflow has sharp edges the Pro Git book itself documents: cloning without --recurse-submodules (or running git submodule update --init) leaves empty directories, the submodule checks out a detached HEAD, and every update to the shared code needs a pointer-bump commit in each parent repo. Teams with strong git discipline handle this fine; mixed-experience teams frequently do not.",
    ],
    [
      "When should shared code become a package instead?",
      "When it is a stable library with several consumers and a registry is available. Publishing versioned releases gives consumers semver upgrades, changelogs and lockfile pinning, and avoids both submodule pointer ceremony and subtree divergence. The cost is release overhead and a slower loop when a consumer needs to change the shared code itself.",
    ],
    [
      "Can I push changes back upstream from a git subtree?",
      "Yes — git subtree push -P <prefix> <remote> <branch> re-splits the commits that touched the subtree directory and pushes them to the shared repository. It works, but it rewrites those commits and gets slow on big histories, which is why teams whose consumers edit shared code heavily sometimes still prefer submodules or a package workflow.",
    ],
  ],
};

export default seo;
