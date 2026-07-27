const seo = {
  intro:
    "This helper answers the question 'is this release a major, minor or patch?' by mapping a short checklist about your change onto the Semantic Versioning 2.0.0 rules: major for incompatible API changes (item 8), minor for backwards-compatible features and deprecations (item 7), patch for compatible bug fixes (item 6). It also handles the 0.x special case, where the spec allows anything to change and the ecosystem signals breakage in the minor digit. Library maintainers get the exact next version number computed from their current one, including pre-release finalisation.",
  useCases: [
    "Deciding whether removing a deprecated function from a 1.x library forces 2.0.0 or can ride along in a minor release",
    "Choosing between 0.5.0 and 0.4.3 for a 0.4.2 package after an incompatible config format change",
    "Confirming that deprecating (but not removing) a public API requires at least a minor bump before tagging the release",
  ],
  benefits: [
    ["Spec-cited answers", "Every recommendation names the exact SemVer 2.0.0 item (3, 4, 5, 6, 7 or 8) that drives it."],
    ["0.x aware", "Applies the major-version-zero convention: breaking changes bump minor, additions bump patch."],
    ["Computes the number", "Turns 1.4.2 plus your answers into the literal next version, finalising pre-release tags correctly."],
  ],
  faqs: [
    [
      "When should I bump the major version?",
      "Whenever you make any backwards-incompatible change to the public API — removing or renaming exports, changing documented behaviour or types, or raising platform requirements. SemVer 2.0.0 item 8 makes this mandatory even for tiny breaking changes; the size of the change is irrelevant, only its compatibility.",
    ],
    [
      "Is deprecating an API a minor or patch change?",
      "Minor, at minimum. SemVer item 7 explicitly states the minor version must be incremented if any public API functionality is marked as deprecated, even though the API still works. The actual removal later is the major bump.",
    ],
    [
      "How do version bumps work for 0.x packages?",
      "SemVer item 4 says that in major version zero anything may change at any time, so the spec imposes no rule. The universal convention — which npm's caret ranges assume, since ^0.4.2 excludes 0.5.0 — is to put breaking changes in the minor digit and everything else in patch. When the API stabilises, item 5 says release 1.0.0.",
    ],
    [
      "Does a dependency update or internal refactor need a version bump at all?",
      "If you release it, yes: SemVer item 3 forbids modifying the contents of a released version, so any new release needs a new number — a patch bump when nothing observable changed. A dependency update becomes minor or major only if it changes your own public behaviour or raises requirements for your consumers.",
    ],
  ],
};

export default seo;
