const seo = {
  title: "Git Tag Naming Generator: SemVer 2.0.0 Format + Regex",
  metaDescription:
    "Set MAJOR.MINOR.PATCH, the v prefix, a prerelease channel and an environment label; get the format template, a validation regex and git commands.",
  steps: [
    "Enter MAJOR, MINOR and PATCH, tick 'Use the conventional \"v\" prefix (v1.2.3)', and add a Custom prefix such as app@ if a monorepo needs one.",
    "Tick 'Include a prerelease segment (-alpha/-beta/-rc)' to set a Prerelease channel and Prerelease iteration, and use Environment suffix plus Environment name to place a label either as a prerelease identifier or as +build metadata.",
    "Read the Next release tag with its Format template and Validation regex, take the annotated git commands under 'Cut the release', and press Copy standard to save the whole thing.",
  ],
  intro:
    "This generator designs a consistent git release tag format built on Semantic Versioning 2.0.0: the conventional v prefix, MAJOR.MINOR.PATCH, optional alpha/beta/rc prerelease segments and environment labels as either prerelease identifiers or build metadata. It outputs the format template, a validation regex that rejects malformed tags (including leading zeroes), the git commands to cut an annotated tag, and notes on how SemVer precedence treats each part. It is for teams standardising release tags across repositories and CI pipelines.",
  useCases: [
    "Standardising on v1.2.3 style tags across a dozen microservice repositories with a regex CI can enforce",
    "Working out whether a staging label belongs in the prerelease slot or in build metadata before it breaks version sorting",
    "Setting up release candidate tags (v2.0.0-rc.1) that semantic-release and GoReleaser will interpret correctly",
  ],
  benefits: [
    ["SemVer 2.0.0 exact", "Numeric rules, prerelease hyphen and build-metadata plus sign follow the spec items 2, 9 and 10."],
    ["Precedence explained", "Shows that v2.0.0-rc.1 sorts below v2.0.0 and that +metadata never affects ordering."],
    ["Enforceable", "The regex rejects leading zeroes and malformed segments, and ships in a one-line CI check."],
  ],
  faqs: [
    [
      "Should git tags start with v?",
      "The v prefix (v1.2.3) is the dominant convention — git's own releases use it, and tools like GoReleaser and semantic-release expect it by default. Strictly, the v is not part of the semantic version: semver.org's FAQ states v1.2.3 is not a semantic version, the version is the 1.2.3 after the prefix. Pick one style and use it everywhere.",
    ],
    [
      "How do release candidate tags work with semantic versioning?",
      "Append the prerelease identifiers with a hyphen: v2.0.0-rc.1, then v2.0.0-rc.2, and finally the plain v2.0.0. SemVer item 11 gives prerelease versions lower precedence than the associated normal version, so tooling correctly treats every rc as older than the final release, and rc.2 as newer than rc.1.",
    ],
    [
      "What is the difference between prerelease identifiers and build metadata in a tag?",
      "Prerelease identifiers (after -) affect version precedence; build metadata (after +) is ignored for precedence entirely per SemVer item 10. So v1.2.3-staging.1 is an earlier version than v1.2.3, while v1.2.3+staging is the same version as v1.2.3 to any SemVer-aware tool. Use the prerelease slot for maturity stages and build metadata for pure labels.",
    ],
    [
      "Should I use annotated or lightweight git tags for releases?",
      "Annotated tags (git tag -a) — they are full git objects storing the tagger's name, date and a message, they can be GPG-signed, and git describe uses them by default. Lightweight tags are just pointers with no metadata, which the Pro Git book recommends only for temporary or private labels.",
    ],
  ],
};

export default seo;
