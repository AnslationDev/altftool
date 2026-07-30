const seo = {
  intro:
    "The Changelog Generator turns a flat list of one-line changes into a Keep a Changelog release entry — a `## [version] - YYYY-MM-DD` heading followed by grouped `### Added`, `### Changed`, `### Fixed` and `### Removed` sections. It routes each line by its opening verb (fix goes to Fixed, change or update to Changed, remove or delete to Removed, everything else to Added), strips that verb from the text, and stamps today's date in ISO format. It is for developers writing a release note from the commits they just merged, without hand-formatting the markdown.",
  useCases: [
    "You are cutting a release and have a scratch list of what changed in the sprint — paste it in and get the CHANGELOG.md block ready to commit above the previous version.",
    "A pull request template asks for a changelog entry and you want the section headings and dashes to match the rest of the file exactly rather than approximating them.",
    "Turning a list of merged commit subjects, which already start with fix/add/update, into grouped release notes without sorting them by hand.",
  ],
  benefits: [
    [
      "Sorts by the verb you already wrote",
      "Lines beginning with fix, change, update, remove or delete are routed automatically, so a raw commit list groups itself.",
    ],
    [
      "Removes the redundant verb",
      "\"fix login crash\" becomes \"login crash\" under the Fixed heading, so the entry does not read \"Fixed: fixed login crash\".",
    ],
    [
      "Standard heading shape, ready to paste",
      "Output uses the Keep a Changelog structure with an ISO date, which is what tooling and reviewers expect at the top of CHANGELOG.md.",
    ],
  ],
  faqs: [
    [
      "What is the Keep a Changelog format?",
      "It is a convention where each release gets a `## [version] - YYYY-MM-DD` heading and changes sit under type headings such as Added, Changed, Fixed and Removed, newest release first. This generator produces those four sections and omits any that would be empty.",
    ],
    [
      "How does it decide which section a line goes in?",
      "By the first word: lines starting with \"fix\" go to Fixed, \"change\" or \"update\" to Changed, \"remove\" or \"delete\" to Removed, and anything else falls through to Added. The verb itself is then stripped from the entry text.",
    ],
    [
      "What date does it put on the release?",
      "Today's date in ISO 8601 form, YYYY-MM-DD, taken from your device. If you are dating a release for a different day, edit that line after copying the output.",
    ],
    [
      "Does it handle Deprecated and Security sections?",
      "No — it emits Added, Changed, Fixed and Removed only. Keep a Changelog also defines Deprecated and Security; add those headings manually if a release needs them.",
    ],
  ],
};

export default seo;
