const seo = {
  title: "Word Scramble Game: Timed Rounds, Shareable Seeds",
  metaDescription:
    "Unscramble words against 45-90 second timers: 10 points a letter plus a speed bonus, minus 25 per hint. Share a seed to race identical puzzles.",
  steps: [
    "Pick a Difficulty — Easy 4 to 5 letters at 45s, Medium 6 to 7 at 60s, Hard 8 or more at 90s — plus the Rounds count and a Puzzle seed.",
    "Type the unscrambled word and press Submit before the countdown ends; each Hint (3 maximum) reveals more but costs 25 points.",
    "Finish every round to see total points, accuracy and best streak, then use Copy result to compare scores on the same seed.",
  ],
  intro:
    "Word Scramble Game gives you a jumbled word and a countdown, and you type the word it came from. Puzzles are drawn from a bank of common English words at three lengths — 5, 6-7 and 8-plus letters — and every scramble is a true Fisher-Yates shuffle driven by a seeded generator, so the same seed always rebuilds the same game and you can share a puzzle by sharing its number. Scoring is 10 points per letter, plus a time bonus worth up to half of that, minus 25 points per hint.",
  useCases: [
    "A five-minute vocabulary warm-up before study or a spelling test.",
    "Sharing the same seed with a friend so you both get an identical set of puzzles and can compare scores fairly.",
    "Classroom or family word practice at a difficulty that matches the player, from five-letter words up to ten.",
  ],
  benefits: [
    ["Reproducible puzzles", "The seed drives every shuffle, so the same number always gives the same words in the same order."],
    ["Real hints, real cost", "Each hint reveals the definition, then letters — and each one costs 25 points, so guessing stays worth it."],
    ["Scored, not just timed", "Points combine word length, seconds remaining and hints used, and the summary shows accuracy and best streak."],
  ],
  faqs: [
    [
      "How is the score calculated?",
      "Base points are 10 per letter, so a six-letter word is worth 60. The time bonus is (seconds left / time limit) x base x 0.5, so solving PLANET in 20 seconds of a 60-second limit adds 20 points. Each hint costs 25 points, and a round never scores below zero.",
    ],
    [
      "How long do I get for each word?",
      "45 seconds on easy (5 letters), 60 seconds on medium (6-7 letters) and 90 seconds on hard (8 or more letters). Running out of time ends the round with zero points but does not end the game.",
    ],
    [
      "What does the seed do?",
      "The seed is the starting number for the random generator that picks and shuffles the words. Two people entering the same seed at the same difficulty get exactly the same puzzles in the same order, which makes scores comparable.",
    ],
    [
      "Are the letters always properly mixed?",
      "Yes. The shuffle is Fisher-Yates, which gives every arrangement an equal chance, and the result is rejected and reshuffled if it comes out identical to the original word. Only a word made entirely of one repeated letter cannot be scrambled.",
    ],
  ],
};

export default seo;
