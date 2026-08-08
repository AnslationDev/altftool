const seo = {
  title: "Dependency Upgrade Impact Estimator: Semver Risk",
  metaDescription:
    "Scores each upgrade 0-100 from the semver jump — patch 12, minor 34, major 68 — plus 18 for next, react, react-dom, firebase, typescript or eslint.",
  steps: [
    "Paste your manifest into the package.json box; both dependencies and devDependencies are read, and Load sample fills in a next, react, firebase and lucide-react example.",
    "In the Target versions box put one \"name version\" pair per line, such as next 16.2.6; any package you leave out is compared against itself and counts as no version jump.",
    "Read Average risk and Major upgrades beside the Upgrade matrix, where each row shows current to target, the jump type, and a badge reading Review carefully above 65 or Low friction at or below it.",
  ],
  intro:
    "The Dependency Upgrade Impact Estimator scores each package upgrade from 0 to 100 by comparing your current version against a target version and grading the semantic-version jump — 0 for no change, 12 for a patch, 34 for a minor, 68 for a major — then adding 18 points when the package is framework-critical. Paste a package.json on one side and a list of 'name version' targets on the other, and you get a per-package risk score, an average risk figure, and a count of major jumps. It is for anyone planning an upgrade sprint who needs to decide what to batch together and what to isolate.",
  useCases: [
    "You have three months of Dependabot PRs queued and want to know which ones can be merged in a single batch and which majors deserve their own branch and QA pass.",
    "Before a quarterly maintenance window you paste in the versions you intend to move to and use the average risk number to argue for how much time the upgrade actually needs.",
    "A framework bump is on the table and you want to see, in one view, whether React, Next, Firebase, TypeScript or ESLint are also crossing a major boundary at the same time.",
  ],
  benefits: [
    ["Explicit, inspectable scoring", "Every score is a stated number — patch 12, minor 34, major 68, plus 18 for critical packages — rather than an opaque risk label."],
    ["Weights the packages that break everything", "next, react, react-dom, firebase, typescript and eslint carry an extra 18 points because a major there ripples through the whole build."],
    ["Triage view, not a wall of diffs", "Rolls the matrix up into an average risk percentage and a major-upgrade count so you can size the work before opening a single changelog."],
  ],
  faqs: [
    [
      "How is the upgrade risk score calculated?",
      "The base score comes from the semver jump — 0 for the same version, 12 for a patch, 34 for a minor, 68 for a major — and 18 points are added if the package is on the framework-critical list, capped at 100. So a major bump of React scores 86 while a patch bump of an ordinary utility scores 12.",
    ],
    [
      "Which packages count as critical?",
      "Six: next, react, react-dom, firebase, typescript and eslint. Each of those adds 18 points on top of the semver base because a breaking change there tends to affect build tooling, types or rendering across the whole project.",
    ],
    [
      "What score means I should be careful?",
      "Anything above 65 is marked 'Review carefully' and everything at or below is marked 'Low friction'. In practice that threshold catches every major upgrade and every critical-package minor.",
    ],
    [
      "Does it read changelogs or check for breaking changes?",
      "No — it works only from the version numbers you supply and the critical-package list, so it estimates the shape of the work rather than the actual API differences. Read the release notes for anything the matrix flags for careful review before you plan the migration.",
    ],
  ],
};

export default seo;
