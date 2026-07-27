const seo = {
  intro:
    "A design handoff checklist is the list of artefacts a development team needs before it can build a screen without asking the designer another question. This generator filters a library of handoff checks down to the ones that apply to your platform and feature set, then scores completion with blockers weighted three times a nice-to-have, so an unticked blocker can never read as ready. Built for product designers, design system owners and engineering leads agreeing on a definition of done.",
  useCases: [
    "Run a five-minute self-review before booking the walkthrough with engineering, so the meeting is about decisions rather than missing states.",
    "Agree a shared definition of done between design and development at the start of a project, and paste it into the ticket as a markdown task list.",
    "Check that a mobile handoff covers safe areas, 44x44pt tap targets and the narrowest supported width before a sprint commits to the work.",
    "Verify a localisation-ready handoff includes right-to-left mirroring and layouts tested with roughly 30% longer strings.",
  ],
  benefits: [
    ["Only what applies", "Motion, localisation and accessibility checks appear only when you say the project has them."],
    ["Blockers weighted", "Missing focus states or unresolved tokens outrank a missing changelog in the score."],
    ["Markdown export", "Copies as a GitHub-flavoured task list you can paste straight into an issue or pull request."],
  ],
  faqs: [
    [
      "What should be included in a design handoff?",
      "At minimum: a single source-of-truth file, named type and colour styles, every interactive state (default, hover, focus, active, disabled, loading), the narrowest supported layout, final copy, export settings for icons and images, and a written list of open questions. Anything a developer would otherwise have to guess belongs in the handoff.",
    ],
    [
      "Which handoff items are genuinely blocking?",
      "Items that force a rewrite if they arrive late: missing interactive states, undefined tokens or colours, no layout at the smallest breakpoint, placeholder copy, missing font licences, and for animation, no reduced-motion fallback. This tool tags those as blockers and caps the readiness label until they are cleared.",
    ],
    [
      "What contrast ratios does the accessibility section refer to?",
      "WCAG 2.2 level AA asks for 4.5:1 for normal text, 3:1 for large text (at least 18.66px bold or 24px regular), and 3:1 for user interface components and meaningful graphics. Check these in both light and dark themes, since a dark palette rarely inherits the light one's ratios.",
    ],
    [
      "Should the checklist replace a handoff meeting?",
      "No. It removes the avoidable questions so the meeting can cover intent, edge cases and trade-offs. Teams that skip the conversation entirely tend to ship correct pixels with the wrong behaviour.",
    ],
  ],
};

export default seo;
