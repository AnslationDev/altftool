const seo = {
  intro:
    "An API changelog generator turns a list of changes into a release section formatted to the Keep a Changelog 1.1.0 convention, and works out the Semantic Versioning 2.0.0 bump those changes require. It is aimed at teams who publish a versioned HTTP API and need consumers to see exactly what broke, what was added and what is being sunset. Removals and any change you mark as incompatible force a major bump; new functionality gives a minor bump; bug and security fixes give a patch.",
  useCases: [
    "Draft the release notes for a v2 API cut where two endpoints were removed and three fields were renamed",
    "Give a partner integration team a dated, machine-readable record of a deprecation and its sunset date",
    "Settle an internal argument about whether a response-shape change is a minor or a major version",
  ],
  benefits: [
    ["Correct bump every time", "The version is derived from the change types, not guessed by hand."],
    ["Breaking changes stand out", "Incompatible items are prefixed BREAKING and counted in a callout at the top."],
    ["Drop-in markdown", "Output pastes straight into CHANGELOG.md, including the compare link between the two tags."],
  ],
  faqs: [
    [
      "What are the six sections in Keep a Changelog?",
      "Added, Changed, Deprecated, Removed, Fixed and Security. Keep a Changelog 1.1.0 prints them in that order under each version heading, and every heading carries the version number and an ISO 8601 release date.",
    ],
    [
      "When does an API change require a major version bump?",
      "Whenever the change is not backwards compatible for an existing client — removing an endpoint or field, renaming a field, tightening validation, or changing an error code a client branches on. Semantic Versioning 2.0.0 reserves MAJOR for incompatible API changes, MINOR for backwards-compatible additions and PATCH for backwards-compatible fixes.",
    ],
    [
      "How long should an API deprecation window be?",
      "There is no universal rule, but a common practice is to announce the deprecation in a minor release with a dated sunset, keep the old behaviour working for at least one full major version, and return a `Deprecation` and `Sunset` response header (RFC 8594 defines `Sunset`) so clients can detect it programmatically.",
    ],
    [
      "Should version 0.x follow the same rules?",
      "Semantic Versioning says anything may change at any time while the major version is 0, so a 0.x API carries no compatibility promise. Teams that want stability signals before 1.0.0 usually still bump the minor for breaking changes and the patch for fixes, and say so in the changelog header.",
    ],
  ],
};

export default seo;
