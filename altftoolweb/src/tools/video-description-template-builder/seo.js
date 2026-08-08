const seo = {
  title: "YouTube Description Template with Chapter Checks",
  metaDescription:
    "Assemble hook, chapters, links and hashtags into a reusable description, checked against the 5,000-character limit and YouTube's chapter rules.",
  steps: [
    "Write the Opening line (first 157 characters show before \"Show more\"), then the Summary and Call to action.",
    "Add Chapters, one per line — \"0:00 Title\", Links, one per line — \"Label | https://...\", plus Hashtags and a Disclosure or legal line; any {{placeholder}} you use gets its own field.",
    "Characters used counts against the 5,000-character limit while Chapters detected, Chapters valid, Hashtags and Unfilled placeholders report the checks; Copy description copies the finished text.",
  ],
  intro:
    "Video Description Template Builder assembles a reusable description from a hook, summary, chapters, links, hashtags and a disclosure line, then checks it against the platform rules before you publish. It counts against the 5,000-character description limit, validates chapters (first timestamp at 0:00, at least three of them, each at least 10 seconds long, in ascending order) and warns when hashtags pass 15, the point at which YouTube ignores every hashtag on the video. Placeholders written as double braces let you keep one template and swap the episode-specific parts each time.",
  useCases: [
    "Keep one channel template and fill only the episode title, chapters and links for each upload.",
    "Check that chapters will actually appear before you publish, instead of discovering they did not afterwards.",
    "See exactly which characters land above the 'Show more' fold, where search snippets are taken from.",
    "Hand an editor or VA a template where the only blanks are clearly marked placeholders.",
  ],
  benefits: [
    ["Chapter rules enforced", "Timestamps are validated for order, the 0:00 start and the 10-second minimum length."],
    ["Character budget visible", "A live count against the 5,000-character limit, with the opening line highlighted."],
    ["Reusable, not retyped", "Placeholders keep the boilerplate identical across a series while the details change."],
  ],
  faqs: [
    [
      "How long can a YouTube description be?",
      "5,000 characters, including spaces and line breaks. Only about the first 157 characters appear before the 'Show more' fold, so put the key sentence and any critical link at the very top.",
    ],
    [
      "Why are my YouTube chapters not showing?",
      "Chapters need at least three timestamps, the first must be exactly 0:00, they must be listed in ascending order, and every chapter must last at least 10 seconds. If any one of those fails, YouTube silently falls back to no chapters — this tool checks all four rules.",
    ],
    [
      "How many hashtags should I put in a video description?",
      "Three to five is plenty. Only the first three appear above the video title, and if you use more than 15 hashtags YouTube ignores all of them for that video, so a long list is worse than a short one.",
    ],
    [
      "Where should links go in a video description?",
      "Put the single most important link in the first two lines, above the fold, and group the rest under a clear heading further down. Descriptions are also where disclosure of affiliate or sponsored links belongs — many advertising regulators require the disclosure to be visible without clicking 'Show more', so keep it high and in plain language.",
    ],
  ],
};

export default seo;
