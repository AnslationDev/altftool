const seo = {
  title: "Check package.json Install Scripts Without",
  metaDescription:
    "Nothing runs: paste a package.json and see which preinstall, install, postinstall and prepare hooks fire on npm install, flagged by six review cues.",
  steps: [
    "Paste your package.json into the JSON source box, or press Choose package.json to load a .json file — the limit is 500,000 characters and lockfiles are rejected rather than partially parsed.",
    "Press Inspect without running: every command is read as inert text and pattern-matched against six cues — network or remote source, file write and permission change, shell or runtime invocation, native build toolchain, environment-variable access, and encoded or dynamic evaluation.",
    "Read the Script summary tiles (All scripts, Install lifecycle, With cues, No pattern cue) and the Script evidence cards, then press Download local JSON to save package-install-script-inert-review.json.",
  ],
  intro:
    "The Package Install-Script Inspector parses a pasted package.json as inert text and reports which of its scripts run automatically during npm install — preinstall, install, postinstall, prepare and the rest of the install lifecycle — flagging each command against six review cues: network or remote source, file write and permission changes, shell or runtime invocation, native build toolchain, environment-variable access, and encoded or dynamic evaluation. Nothing is executed, fetched or resolved; commands are only read and pattern-matched. It is for developers reviewing an unfamiliar dependency before they let its lifecycle hooks run on their machine or in CI.",
  useCases: [
    "A pull request adds a dependency you have never heard of, and you want to see whether its package.json has a postinstall hook and what that hook touches before you approve the merge.",
    "A build machine started making outbound requests during npm ci, and you want to check each candidate package's install-lifecycle scripts for curl, wget or npx calls.",
    "You are writing a dependency review policy and need a repeatable way to record, per package, which scripts run at install time and which cue categories they trip.",
  ],
  benefits: [
    ["Separates install hooks from the rest", "Scripts are classified into install-lifecycle, pack/publish-only and other, so you can see exactly what runs on npm install rather than scanning a flat list of thirty script names."],
    ["Six cue categories with evidence", "Each match is reported with the surrounding command text, so you can judge the actual line rather than trusting a category label."],
    ["Refuses to give a partial picture", "It rejects lockfiles and oversized inputs outright instead of silently truncating, because a review report missing half the scripts is worse than no report."],
  ],
  faqs: [
    [
      "Which package.json scripts run automatically on npm install?",
      "The install lifecycle covers preinstall, install and postinstall, plus prepare with its preprepare and postprepare hooks, the legacy prepublish, and dependencies. This tool marks exactly those as install-lifecycle and reports prepublishOnly, prepack, postpack, publish and postpublish separately, since those run only when packing or publishing.",
    ],
    [
      "Does this tool run or download anything?",
      "No. The package.json is parsed as JSON and every script command is treated as inert text — it is never executed, no registry is contacted, and no referenced file or URL is fetched. That is also its limit: shell aliases, referenced scripts and platform-specific expansion are not resolved.",
    ],
    [
      "Does a flagged script mean the package is malicious?",
      "No — the cues are review prompts, not verdicts. Plenty of legitimate packages run node-gyp, read process.env or write files during install; equally, a script with no cue at all can still be harmful, because it may call a checked-in file the inspector cannot see. Use the report to decide what to read next.",
    ],
    [
      "How large a package.json can I paste?",
      "Up to 500,000 characters of source, containing at most 100 scripts, with a 10,000-character limit per script command and 100,000 characters of script text in total. Exceeding any of these produces an error rather than a truncated report.",
    ],
  ],
};

export default seo;
