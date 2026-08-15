const seo = {
  title: "Breaking Change Checklist & API Risk Score Generator",
  metaDescription:
    "Plan an API or library breaking change: phased before/release/after checklist, a 0-100 risk score and the SemVer major bump rule, as copyable Markdown.",
  steps: [
    "Tick the change under \"What kind of change is it?\" and \"Which surfaces does it touch?\", then pick the audience in the \"Who consumes this surface?\" dropdown.",
    "Check any \"Mitigations already in place\" — each one subtracts a fixed credit, such as 15 points for a deprecation period, from the 0-100 risk score.",
    "Read the risk level with its score out of 100, the Required version bump (SemVer item 8) and the Before, Release and After items, then press \"Copy Markdown\" for a \"- [ ]\" task list.",
  ],
  intro:
    "This tool generates a phased consumer-impact checklist — before, release and after — for an API or library breaking change, along with a 0-100 risk score built from the change type, affected surfaces, audience and mitigations you select. It encodes the SemVer 2.0.0 rule that any incompatible public API change requires a major version bump, and the deprecate-warn-remove lifecycle that mature platforms use. Maintainers get a copyable Markdown checklist ready to paste into an issue or RFC.",
  useCases: [
    "Preparing an RFC for removing a deprecated endpoint from a public HTTP API and needing the rollout steps enumerated",
    "Comparing the risk of shipping a config-format change with and without a dual-support release, using the transparent score",
    "Turning 'we're renaming this SDK method' into a concrete checklist covering aliases, type definitions and changelog wording",
  ],
  benefits: [
    ["Phased checklist", "Items are grouped into Before, Release and After so nothing lands unannounced or unmonitored."],
    ["Transparent risk score", "Every weight and mitigation credit is a named constant — the same inputs always score the same."],
    ["Copy-ready Markdown", "Exports as a - [ ] task list that pastes directly into GitHub issues, RFCs or release plans."],
  ],
  faqs: [
    [
      "What counts as a breaking change in an API or library?",
      "Anything that makes previously valid consumer code or requests stop working or behave differently: removing or renaming public functions, endpoints, flags or fields; changing signatures, types or response shapes; changing documented behaviour or defaults; altering wire or config formats; and raising runtime or dependency requirements. SemVer 2.0.0 item 8 requires a major version bump for all of them.",
    ],
    [
      "Can I ship a breaking change in a minor version?",
      "Not under SemVer for packages at 1.0.0 or above — item 8 reserves incompatible changes for major releases, and consumers using caret ranges will auto-install your minor releases assuming compatibility. The only exception is major version zero (0.x), where item 4 allows anything to change; the convention there is to signal breakage in the minor digit.",
    ],
    [
      "How long should a deprecation period be before removal?",
      "There is no universal number; the norm is at least one full major release cycle with runtime warnings, and public platforms commonly give calendar guarantees — for example Google's stable API policies promise a year or more of notice for many products. The right length depends on how fast your consumers actually upgrade, which is why the checklist pushes usage telemetry before removal.",
    ],
    [
      "How is the risk score calculated?",
      "It sums fixed weights for each selected change type (removal and wire-format changes weigh 30, behaviour changes 25, signature changes 20, renames and config changes 15, platform bumps 10), adds 5 per extra affected surface, multiplies by an audience factor (0.5 internal, 0.8 company-wide, 1.0 public), then subtracts mitigation credits such as 15 for a deprecation period. The result is clamped to 5-100 and banded Low, Moderate, High or Critical.",
    ],
  ],
};

export default seo;
