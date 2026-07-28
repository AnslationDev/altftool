const seo = {
  intro:
    "The Tournament Bracket Maker turns a list of players or teams into a complete single-elimination draw, with rounds, match numbers and automatic byes. It pads the field to the next power of two and uses standard snake seeding — the rule that pairs seed 1 with the lowest seed and keeps seeds 1 and 2 apart until the final. It suits club organisers, teachers and anyone running an office or gaming tournament who wants a printable bracket in seconds.",
  useCases: [
    "Drawing a 12-team five-a-side knockout where the top four seeds receive first-round byes",
    "Setting up an office table-tennis ladder with a random draw that can be reproduced by sharing the draw number",
    "Building a 16-player esports bracket with a third-place play-off for the losing semi-finalists",
  ],
  benefits: [
    ["Byes handled correctly", "Empty slots are given to the highest seeds first, exactly as knockout convention requires."],
    ["Reproducible random draws", "Each random draw is tied to a draw number, so the same number always rebuilds the same bracket."],
    ["Copy-ready text bracket", "One button copies every round and fixture as plain text for a group chat or notice board."],
  ],
  faqs: [
    [
      "How many matches are in a single-elimination tournament?",
      "Exactly one fewer than the number of entrants: 16 teams play 15 matches, 12 teams play 11. Every match eliminates one entrant and all but the champion must be eliminated, so the count never depends on the number of byes. A third-place play-off adds one extra match.",
    ],
    [
      "How do byes work in a tournament bracket?",
      "Byes fill the gap between your entrant count and the next power of two — 12 teams in a 16-team draw means 4 byes. They are always awarded to the highest seeds, so seeds 1 to 4 skip round one and enter at the quarter-finals in that example.",
    ],
    [
      "What is standard seeding in a bracket?",
      "Standard (snake) seeding pairs each seed s with seed n + 1 − s at every stage, giving 1 v 8, 4 v 5, 2 v 7, 3 v 6 in an eight-team draw. It guarantees the top two seeds can only meet in the final and that seeds 1 to 4 are spread across separate quarters.",
    ],
    [
      "How many entrants can this bracket maker handle?",
      "From 2 up to 64 entrants, which is a six-round draw. Fewer than 2 cannot form a match, and above 64 a knockout bracket becomes impractical to print or read on one screen.",
    ],
  ],
};

export default seo;
