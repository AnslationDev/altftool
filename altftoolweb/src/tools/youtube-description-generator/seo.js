const seo = {
  intro:
    "This YouTube description generator assembles a description in the order viewers actually read it — hook, summary, chapters, links, call to action, hashtags — and validates it live against YouTube's published limits. It counts against the 5,000-character description cap and the 60-hashtag cap, and checks your timestamps against the three conditions YouTube requires before it will build automatic chapters. It is for creators who want a repeatable description template rather than a blank box, and it writes nothing to a server.",
  useCases: [
    "Paste your rough timestamps and find out why YouTube is not showing chapters on the video.",
    "Build a house-style description template you reuse for every upload, with the same link and CTA blocks each time.",
    "Check that a long description with affiliate links and 40 hashtags still fits inside the 5,000-character cap.",
  ],
  benefits: [
    ["Chapter rules checked live", "It flags a list that does not start at 0:00, has fewer than three timestamps, or contains a chapter shorter than 10 seconds."],
    ["Hashtag cap enforced", "Passing 60 hashtags makes YouTube ignore every hashtag on the video, so the counter warns you before you upload."],
    ["Shows the part people read", "A separate preview of the first three lines — everything else sits behind “…more”."],
  ],
  faqs: [
    [
      "How long can a YouTube description be?",
      "5,000 characters, including spaces and line breaks. Anything past that is cut off when you save, so the counter here turns red the moment you cross it.",
    ],
    [
      "Why are my YouTube chapters not showing?",
      "Almost always one of three rules. The first timestamp must be 0:00, there must be at least three timestamps in the list, and every chapter must run at least 10 seconds. Break any one and YouTube shows no chapters at all rather than a partial set.",
    ],
    [
      "How many hashtags should I put in a description?",
      "Three is the practical answer, because only the first three appear above the video title. The hard cap is 60 — go over it and YouTube ignores every hashtag on that video, not just the ones past the limit.",
    ],
    [
      "How much of the description do viewers actually see?",
      "The watch page collapses the description after its first three lines behind a “…more” link. That is why this tool previews those lines separately: the hook, not the keyword list, is what has to earn the click on “more”.",
    ],
  ],
};

export default seo;
