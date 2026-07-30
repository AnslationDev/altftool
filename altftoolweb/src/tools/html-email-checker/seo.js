const seo = {
  intro:
    "This checker parses your email HTML and runs a fixed set of rules against the actual markup — DOCTYPE and table structure, inline CSS coverage, alt text and lang attributes, HTTPS images and links, message size against Gmail's clipping limit, and CSS features that Outlook, Gmail, Apple Mail or Yahoo silently drop — then scores six weighted categories into one grade from A+ to D. Every issue comes with why it matters, how to fix it and an example snippet, alongside a live preview and a 15-point pre-send checklist. Email developers and marketers get a deterministic audit: the same HTML always produces the same result, with no sending or account required.",
  useCases: [
    "A campaign is built and the send is in an hour, and you want to know before it goes out whether the layout will collapse in Outlook because someone used display:flex",
    "Your last send showed '[Message clipped]' in Gmail for half the list, and you need to see how far over the ~102KB threshold the HTML actually is",
    "Auditing a template you inherited from an agency for missing alt text and http:// image sources before it becomes the base for every future campaign",
  ],
  benefits: [
    ["Per-client compatibility scores", "Gmail, Outlook, Apple Mail and Yahoo each get their own score and a list of the exact features that break in that client."],
    ["Findings are actionable, not just flagged", "Each issue states the reason, the fix and a copyable example — so 'low inline CSS coverage' comes with the percentage measured and what to inline."],
    ["Deterministic, rule-based scoring", "Checks are string and DOM tests against your markup, so results are reproducible and you can see precisely which rule produced each penalty."],
  ],
  faqs: [
    [
      "How is the email score calculated?",
      "Each category starts at 100 and loses 18 points per error, 9 per warning and 3 per info issue; the six category scores are then combined with fixed weights — structure 20%, accessibility 20%, compatibility 20%, CSS 15%, performance 15% and responsive 10%. The total maps to a grade: 90+ is A+, 80+ A, 65+ B, 50+ C and below that D.",
    ],
    [
      "At what size does Gmail clip an email?",
      "Around 102KB of message body, after which Gmail truncates and shows a '[Message clipped]' link — hiding everything below the cut, including footers and tracking pixels. The checker raises this as an error above 102KB and as a warning once you pass 80KB, so there is room to trim before it bites.",
    ],
    [
      "Which CSS properties should I avoid in HTML email?",
      "The checker flags display:flex and display:grid, position:fixed/absolute, @keyframes animations, CSS variables, transforms and gradient backgrounds, because at least one major client drops each of them — Grid fails in all four checked clients, and Outlook desktop ignores media queries because it renders with the Word engine. The reliable alternative is nested tables with inline CSS.",
    ],
    [
      "Does this actually send test emails to real inboxes?",
      "No — it analyses the HTML in your browser and renders a preview, so nothing is transmitted and no seed accounts are needed. That makes it fast for catching structural, accessibility and compatibility problems, but it is not a substitute for a real render test if pixel-level appearance in a specific client version matters.",
    ],
  ],
};

export default seo;
