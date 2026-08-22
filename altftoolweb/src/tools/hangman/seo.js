const seo = {
  title: "Hangman Word Game: 240 Words in Four Categories",
  metaDescription:
    "Guess the hidden word before six wrong letters end the round — 240 words across Animals, Countries, Fruits & Food and Technology, with hints and streaks.",
  steps: [
    "Pick a category — Animals, Countries, Fruits & Food, Technology or \"All categories\" — and press \"Start game\".",
    "Guess letters by typing or tapping the on-screen keyboard; six wrong letters end the round, and the \"Hint\" button (2 per round, -15 pts each) reveals one letter.",
    "Win to score 20 points plus 10 per remaining life, keep your streak alive round to round, and press Enter for the next word.",
  ],
  intro:
    "Hangman is the classic word game where you guess a hidden word one letter at a time and six wrong letters end the round. This version draws from 240 words across four categories — Animals, Countries, Fruits & Food and Technology — or mixes all of them, and scores each win at 20 points plus 10 for every life you still had, minus 15 for each hint you spent. It tracks your streak and your best score, and works with either the on-screen keys or a physical keyboard.",
  useCases: [
    "You want a two-minute break between meetings that does not need an account or an install",
    "You are helping a child practise spelling and want a category like Animals rather than random dictionary words",
    "You are learning English vocabulary and want to drill a themed set such as Technology terms",
  ],
  benefits: [
    [
      "Themed word pools",
      "Four categories of 60 words each, or an all-categories mix, so you can aim the difficulty at what you actually want to practise.",
    ],
    [
      "Scoring that rewards clean rounds",
      "Points scale with the lives you kept and shrink when you take hints, so a flawless solve is worth far more than a scraped one.",
    ],
    [
      "No immediate repeats",
      "The last ten words are excluded from the next draw, so the same word does not come back two rounds later.",
    ],
  ],
  faqs: [
    [
      "How many wrong guesses do I get in hangman?",
      "Six. Each wrong letter adds one part to the figure, and the sixth wrong guess ends the round with a loss and resets your streak. Correct letters are free — only wrong ones count against you.",
    ],
    [
      "How is the score calculated?",
      "Each win is worth 20 points plus 10 for every life still remaining, less 15 for each hint used, with a floor of 5 points. So a perfect round with no wrong guesses and no hints scores 80.",
    ],
    [
      "How many hints can I use?",
      "Two per round. A hint reveals one letter that is genuinely in the word and has not been found yet, and it costs 15 points off that round's score.",
    ],
    [
      "How many words are in the game?",
      "240 — 60 each in Animals, Countries, Fruits & Food and Technology. All are uppercase A–Z with no spaces, hyphens or accents, so every word maps cleanly onto the letter keyboard.",
    ],
  ],
};

export default seo;
