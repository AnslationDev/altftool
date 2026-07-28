const seo = {
  intro:
    "A would-you-rather generator serves up forced-choice dilemmas — two options, no opt-out — to break the ice at a party, fill a car journey or warm up a team call. This one holds 55 hand-written dilemmas across eight categories and three difficulty bands, shuffled with a seeded Fisher–Yates deck so every question in a run appears exactly once before any repeats. Type the same seed again and you get the same deck in the same order, which makes a round replayable and shareable.",
  useCases: [
    "Open a remote team standup with three light dilemmas instead of a silent minute.",
    "Run a party round where everyone answers the same seeded deck in the same order.",
    "Keep kids occupied on a long drive with the Easy and Silly categories only.",
  ],
  benefits: [
    ["No repeats in a run", "A Fisher–Yates shuffle deals the whole deck before looping, unlike random-index pickers that repeat within a handful of draws."],
    ["Same seed, same deck", "Share the seed word and everyone plays the identical sequence of questions."],
    ["Pick the mood", "Eight categories and Easy/Medium/Hard bands, so a kids' round and a philosophy round never collide."],
  ],
  faqs: [
    [
      "How many would-you-rather questions does this have?",
      "55 dilemmas, spread over eight categories: Classic, Food & Drink, Superpowers, Travel, Work & Money, Tech & Internet, Silly & Gross, and Deep & Philosophical.",
    ],
    [
      "Will it ask me the same question twice?",
      "Not within a single pass. The deck is shuffled once and dealt in order, so with no filters you get all 55 before the first repeat. Narrowing to one category shrinks the deck to that category's size.",
    ],
    [
      "What does the seed do?",
      "It fixes the shuffle. The same seed text always produces the same order of questions, so two people typing \"party-night\" see identical decks — useful for playing the same round in different rooms.",
    ],
    [
      "What makes a good would-you-rather question?",
      "A real trade-off where both options cost you something, so there is no obvious answer. That is what the Hard band is for — options like a job you love that pays poorly versus a job you hate that pays brilliantly split a room roughly evenly.",
    ],
  ],
};

export default seo;
