const seo = {
  title: "Random Picker: Lunch, Truth or Dare, Names & Teams",
  metaDescription:
    "Three fair pickers in one page: filter a lunch spot, draw Truth or Dare, or pick names and split even teams. Fisher-Yates shuffle, odds shown.",
  intro:
    "Random Fun Picker is three fair random pickers in one page: a lunch-spot chooser with cuisine, budget, meal-type and rating filters; a Truth or Dare deck at three difficulty levels; and a name drawer that also splits a group into even teams. Every draw runs a Fisher-Yates shuffle on a seeded mulberry32 generator — the only shuffle that gives all n! orderings equal probability — so no name or option is quietly favoured. It is for teams settling lunch, hosts running a party round, and teachers picking who goes next.",
  useCases: [
    "Break a four-way deadlock over lunch by filtering to moderate-budget vegetarian places rated 4.0 or better and letting the picker choose.",
    "Draw three raffle winners from a list of 40 names without anyone accusing the organiser of picking favourites.",
    "Split 7 people into 3 teams and get an even 3-2-2 split instead of arguing about who goes where.",
  ],
  benefits: [
    ["Genuinely fair draws", "Fisher-Yates on a seeded generator, so every ordering is equally likely and the odds are shown alongside the result."],
    ["Shows the odds", "Tells you exactly what chance the winner had — 1 in 7 is 14.3%, not a vague feeling."],
    ["Even teams, no arguing", "Splits n names into t teams so the first (n mod t) teams get one extra member and no team is short by two."],
  ],
  faqs: [
    [
      "Is this random name picker actually fair?",
      "Yes. It uses the Fisher-Yates shuffle, which is the only shuffle algorithm that produces all n! orderings with equal probability. With 7 names, each has exactly a 1 in 7 chance — 14.3% — of being drawn first.",
    ],
    [
      "How does it split people into teams evenly?",
      "It shuffles the list, then gives the first (n mod t) teams one extra member. Seven names across three teams becomes 3, 2 and 2 — never 4, 2, 1.",
    ],
    [
      "What chance do I have of getting a Truth rather than a Dare?",
      "Exactly 50% when the mode is set to 'either' — the tool draws a single fair coin flip before selecting the card. Each deck holds 8 prompts per difficulty, so any one card has a 12.5% chance.",
    ],
    [
      "Are the restaurants real places I can visit?",
      "No — the names and ratings are sample data used to demonstrate the filters. Use it to decide the cuisine, budget and meal type, then search for a real place near you that fits.",
    ],
  ],
  steps: [
    "Choose one of the three Picker radios — Lunch picker, Truth or Dare or Name picker — then set that picker's fields: Cuisine, Budget, Meal type and Minimum rating (0 to 5); or Draw (Either — let the coin decide, Truth only, Dare only) and Difficulty (Easy, Medium or Hard); or the Names — one per line, or comma separated box with How many to draw and Split into how many teams (2–20).",
    "Press Spin again. It re-seeds the generator so the shuffle produces a fresh draw, and editing any field above redraws immediately as well.",
    "The result panel headlines the pick under Lunch is, You drew or Drawn with the odds listed beneath — Chance this one came up, Chance of this card or Chance of being drawn — plus the Everything that matched table for lunch or the Teams grid for names. Copy result puts that summary on the clipboard and the button flips to Copied!, while Reset returns every picker to its defaults.",
  ],
};

export default seo;
