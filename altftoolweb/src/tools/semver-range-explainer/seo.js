const seo = {
  title: "Semver Range Explainer: Caret, Tilde and Hyphen",
  metaDescription:
    "Desugars ^1.2.3 to >=1.2.3 <2.0.0 in exact node-semver comparators with a plain-English sentence, and tests any version against the range.",
  steps: [
    "Type any npm-style range in the Version range box, or tap a preset chip such as ^1.2.3, ~1.2.3 or 1.2.x.",
    "Read the plain-English meaning and the desugared comparators — ^1.2.3 becomes >=1.2.3 <2.0.0 — with allowed and blocked example versions.",
    "Enter a version under 'Test a version against it' for an instant SATISFIES or does-NOT-satisfy verdict, then use Copy result.",
  ],
  intro:
    "This tool desugars any npm-style semver range — caret, tilde, hyphen, x-range, comparators or || unions — into its exact comparator form and a plain-English sentence describing which versions it allows. It implements the node-semver range grammar that npm, pnpm and yarn share, so ^1.2.3 becomes >=1.2.3 <2.0.0 and ^0.2.3 becomes >=0.2.3 <0.3.0. Developers reviewing package.json entries can also test a specific version against the range and see worked allowed/blocked examples.",
  useCases: [
    "Checking whether ^0.2.3 in package.json will pick up version 0.3.0 before approving a dependency update PR",
    "Explaining to a teammate why 2.0.0 is excluded from ^1.2.3 while 1.9.9 is included, with the desugared comparators as proof",
    "Verifying that a hyphen range like 1.2.3 - 2.3 rounds its open end up to <2.4.0 before pinning a peer dependency",
  ],
  benefits: [
    ["Exact node-semver rules", "Caret, tilde, x-range, hyphen and partial-comparator desugaring match npm's own semver library."],
    ["Plain-English output", "Every range becomes one readable sentence with explicit inclusive and exclusive bounds."],
    ["Live version tester", "Type any concrete version and get an immediate satisfies / does-not-satisfy verdict with pre-release handling."],
  ],
  faqs: [
    [
      "What does the caret (^) mean in package.json?",
      "^1.2.3 allows every version from 1.2.3 up to but not including 2.0.0 — it freezes the left-most non-zero digit. That makes it stricter for 0.x packages: ^0.2.3 only allows up to 0.3.0 (exclusive), and ^0.0.3 allows only 0.0.3 itself.",
    ],
    [
      "What is the difference between tilde (~) and caret (^)?",
      "~1.2.3 allows only patch updates (>=1.2.3 <1.3.0), while ^1.2.3 also allows minor updates (>=1.2.3 <2.0.0). For 0.2.x versions the two behave identically, because the caret then freezes the minor digit just as the tilde does.",
    ],
    [
      "Will a pre-release version like 2.0.0-beta.1 match my range?",
      "Usually not. Under node-semver rules a pre-release version only satisfies a range that explicitly includes a pre-release tag on the same major.minor.patch — so 2.0.0-beta.1 does not match ^1.2.3 or even >=1.0.0, but 1.2.3-beta.2 does match >=1.2.3-beta.1. This prevents npm from silently installing unstable builds.",
    ],
    [
      "What does a hyphen range like 1.2.3 - 2.3 allow?",
      "It means >=1.2.3 <2.4.0. The left side is inclusive, and a partial right side is rounded up: '- 2.3' becomes anything below 2.4.0 and '- 2' becomes anything below 3.0.0, while a full right side like '- 2.3.4' is inclusive (<=2.3.4).",
    ],
  ],
};

export default seo;
