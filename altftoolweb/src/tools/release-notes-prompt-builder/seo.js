const seo = {
  title: "Release Notes Prompt Builder: Breaking Changes",
  metaDescription:
    "Prefix changes breaking, security, deprecated, feature or fix, pick a channel from a 60-word in-app note to a 900-word blog post, and date the removal.",
  steps: [
    "Fill in Product name, 'Version or release name' and Release date, then paste your shipped changes one per line into the Changes box, each prefixed breaking, security, deprecated, feature, improvement, fix or known.",
    "Choose 'Published as' — In-app notification at 60 words, Customer email at 250, GitHub release at 600 or Blog or docs page at 900 — and set 'Deprecation notice period (days)' plus 'Highlights up top'.",
    "The Generated prompt orders breaking changes and security fixes above features; read the removal date, the word budget for that channel and the prompt length in words and tokens, then press 'Copy prompt'.",
  ],
  intro:
    "A release notes prompt builder sorts a flat list of shipped changes into breaking changes, security fixes, deprecations, features, improvements, bug fixes and known issues, then writes an announcement prompt in that order — because a reader has to meet what breaks them before what delights them. It sizes the note against the channel it will be published on, from a 60-word in-app notice to a 900-word blog post, and calculates the exact date a deprecation stops working from your release date and notice period.",
  useCases: [
    "Announce a major version where a breaking change, a security fix and three new features all ship together.",
    "Produce the in-app notification, the customer email and the full blog post from one list of changes.",
    "Give customers a firm removal date for a deprecated endpoint instead of a vague \"later this year\".",
    "Hand a support team the known-issues section before the release goes out, so the first ticket is not a surprise.",
  ],
  benefits: [
    [
      "Ordered by consequence",
      "Breaking changes and security fixes are placed above new features automatically, not left to whoever writes the draft.",
    ],
    [
      "Sized for the channel",
      "Each channel carries its own word ceiling, so the in-app note does not arrive as a wall of text.",
    ],
    [
      "Deprecation dates that are real",
      "The removal date is calculated from the release date and notice period, including month and year rollovers.",
    ],
  ],
  faqs: [
    [
      "What is the difference between release notes and a changelog?",
      "A changelog is the complete, chronological record of every change, written for people who want the detail. Release notes are the announcement for one release, written for people who just want to know what changed for them. The changelog is generated from commits; the release notes are edited by a human from that list.",
    ],
    [
      "How much notice should I give before removing a deprecated feature?",
      "Long enough for your slowest customer to migrate — commonly 90 to 180 days for a public API, and longer where enterprise contracts specify a notice period. The number matters less than announcing a specific calendar date up front and not moving it. Check your own terms of service before committing.",
    ],
    [
      "What should go at the top of a release note?",
      "Anything that requires the reader to act: breaking changes, security fixes and deprecation deadlines. New features come after. Readers skim, and a migration step buried under three feature paragraphs is a support ticket waiting to happen.",
    ],
    [
      "How long should release notes be?",
      "Match the channel. An in-app notice works at around 60 words, a customer email at 250, a blog or docs page up to about 900. At roughly 238 words per minute of adult silent reading, 900 words is already a four-minute commitment — link out rather than keep going.",
    ],
  ],
};

export default seo;
