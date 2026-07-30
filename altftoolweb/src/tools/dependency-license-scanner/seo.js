const seo = {
  intro:
    "The Dependency License Scanner reads the license strings already written into a package.json or package-lock.json and sorts every package into four buckets: declared, review cue, unresolved declaration, and missing field. It flags text matches for AGPL, GPL/LGPL/EUPL/MPL, SSPL/BUSL/Commons Clause/PolyForm/Elastic, non-commercial wording, and UNLICENSED so you know which entries need a human to look at them. It is for engineers preparing an open-source review who need a first-pass inventory of what their lockfile actually declares — not a legal opinion.",
  useCases: [
    "Procurement asks whether anything in your app ships under a network-copyleft licence, and you need to know within the hour which packages in package-lock.json declare an AGPL string.",
    "You are about to publish a closed-source client build and want a list of every dependency whose license field is empty or says UNLICENSED before counsel reviews it.",
    "A lockfile has grown past a thousand entries and you want the unresolved declarations — Proprietary, NOASSERTION, NONE, UNKNOWN, LicenseRef-* — separated out rather than hunting them by eye.",
  ],
  benefits: [
    ["Four honest statuses, not a pass/fail", "Separates declared text, review cues, unresolved values and missing fields instead of pretending a string match is a compliance verdict."],
    ["Handles real lockfiles", "Parses npm lockfileVersion inventories up to 2,000,000 characters and 12,000 components, deduplicating packages and recording every path an entry appears at."],
    ["Exports a reviewable report", "Downloads a structured JSON report with per-package declared licence, version, scope, occurrence count and the limitations that apply to it."],
  ],
  faqs: [
    [
      "Does this tool tell me if my licences are compatible?",
      "No — it reports what the JSON declares and flags text patterns worth reviewing, and it explicitly is not SPDX validation, a compatibility decision, or legal advice. Use the output as an inventory to bring to whoever handles licensing at your organisation.",
    ],
    [
      "Which licences get flagged for review?",
      "Five cue groups: AGPL as network copyleft; GPL, LGPL, EUPL and MPL as copyleft; SSPL, BUSL, Commons Clause, PolyForm and Elastic License as source-available or additional-terms; non-commercial wording such as CC-BY-NC; and UNLICENSED or 'SEE LICENSE IN' as package-specific declarations.",
    ],
    [
      "What does a missing licence field mean?",
      "It means that package's entry in your JSON has no license value — it does not prove the package is unlicensed. Check the package's distributed LICENSE files and its authoritative registry metadata before drawing any conclusion.",
    ],
    [
      "How large a lockfile can it review?",
      "Up to 2,000,000 bytes per file and 12,000 components, with dependency nesting followed to 40 levels. If input is truncated or anything is skipped the report is marked incomplete and lists the warnings.",
    ],
  ],
};

export default seo;
