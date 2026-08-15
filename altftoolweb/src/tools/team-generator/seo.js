const seo = {
  title: "Random Team Generator – Split Names into Even Teams",
  steps: [
    "Type or paste names into the 'Add name or paste list...' box — line- or comma-separated lists are split in one go and duplicates are dropped case-insensitively.",
    "In Settings pick Number of Teams (slider 2-20) or Team Size (slider 1-20), then press Generate Teams to run a Fisher-Yates shuffle over the whole list.",
    "Review the Results cards, press Reshuffle to redeal while keeping each team's size, Copy for one-team-per-block text, or CSV to download teams.csv with Team and Members columns.",
  ],
  intro:
    "This is a random team splitter: paste or type a list of names and it shuffles them with a Fisher-Yates pass, then divides them either into a fixed number of teams or into teams of a fixed size. When the list does not divide evenly, the remainder is spread one person at a time across the first teams, so group sizes never differ by more than one. Names are deduplicated case-insensitively as you add them, and finished teams can be copied as text or downloaded as a two-column CSV.",
  useCases: [
    "You have 23 people at a workshop and need six breakout groups right now — paste the attendance list, set the team count to 6, and take the split it gives you instead of counting off around the room",
    "You run a five-a-side football night where the same people always end up together, so you want an unarguable random draw projected on a screen before kick-off",
    "You are assigning a class of students to lab benches that seat four, so you set team size rather than team count and let the number of benches fall out of the list length",
  ],
  benefits: [
    ["Two ways to split, one list", "Choose a number of teams (2 to 20) or a number of people per team (1 to 20) without re-entering the names."],
    ["Sizes stay within one of each other", "The remainder after dividing is handed out one member per team rather than dumped on the last group."],
    ["Reshuffle keeps the shape", "Reshuffle redeals every member across the existing teams while preserving each team's current size, so you can rerun a draw without resetting your settings."],
  ],
  faqs: [
    [
      "How do I paste a whole list of names at once?",
      "Paste it into the input box — anything separated by line breaks or commas is split into separate participants in one go. Duplicate names are dropped during the paste, with the comparison done case-insensitively, so 'Sam' and 'sam' count as the same person.",
    ],
    [
      "What happens if my group does not divide evenly?",
      "The leftover people are distributed one per team starting from Team 1. Split 10 people into 3 teams and you get 4, 3 and 3 — never 4, 4 and 2 — because the remainder is spread rather than concentrated.",
    ],
    [
      "Is the draw actually random?",
      "Each generation runs a Fisher-Yates shuffle over the full participant list before any team is filled, which gives every ordering an equal chance. It uses the browser's standard random number generator, which is fine for classrooms, sports and icebreakers but is not a cryptographic draw for anything with money on it.",
    ],
    [
      "Can I get the teams out of the page?",
      "Yes — Copy puts them on the clipboard as plain text with one team per block, and CSV downloads a teams.csv file with a Team column and a Members column, one row per person, ready to open in a spreadsheet.",
    ],
  ],
};

export default seo;
