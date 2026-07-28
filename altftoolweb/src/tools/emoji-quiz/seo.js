const seo = {
  title: "Emoji Quiz Game — Guess the Phrase from Emojis",
  h1: "Emoji Quiz — Guess the Word or Phrase from Emoji Clues",
  metaDescription:
    "Free emoji quiz game: 20 emoji puzzles across 8 categories, instant answer checking, free hints and streak bonuses. No signup, runs in your browser.",
  intro:
    "The Emoji Quiz is a browser-based guessing game built on a fixed bank of 20 emoji puzzles, each a two- or three-emoji clue for an everyday word or phrase (🎬🍿 for \"movie night\", 🌮🌮🌮 for \"taco tuesday\"). Every round draws a puzzle at random and rejects any index already stored in a Set of used questions, so no clue repeats before all 20 are exhausted. Your guess is checked in the page itself: both strings are lowercased, trimmed and stripped of every character outside a-z, 0-9 and spaces, then compared for an exact or substring match, so capitalisation and punctuation never cost you a point. Scoring adds 10 points plus 2 for each answer already in your streak, and everything — questions, hints and score — ships with the page as client-side React, so nothing you type is sent anywhere.",
  useCases: [
    "Run a no-setup icebreaker for a class, team standup or party — 20 questions, one shared screen, no accounts to create.",
    "Practise reading emoji shorthand before you use it in captions, chat or social posts.",
    "Fill a short break with a puzzle round that actually ends: the game closes out after all 20 clues with a final score screen.",
  ],
  benefits: [
    [
      "No repeated clues in a round",
      "Each question is drawn at random from the puzzles you have not seen yet, tracked in a Set of used indices, so all 20 appear exactly once before the quiz ends.",
    ],
    [
      "Forgiving answer matching",
      "Your guess and the answer are both lowercased, trimmed and stripped of punctuation before they are compared, and a guess contained in the answer also counts — so \"Movie Night!\" passes just like \"movie night\".",
    ],
    [
      "Streak-weighted scoring",
      "A correct answer pays 10 points plus 2 for every answer already in your streak, so five in a row scores 10, 12, 14, 16 and 18. A single miss resets the streak to zero.",
    ],
    [
      "Hints that cost nothing",
      "Every puzzle carries a one-line hint behind the lightbulb button, and revealing it does not reduce your score or break your streak.",
    ],
  ],
  faqs: [
    [
      "how do you play an emoji quiz",
      "You read a short emoji clue and type the word or phrase it describes. Here each puzzle shows two or three emoji — 🌞🏖️🌊 for \"beach day\", 📚🎓📝 for \"exam time\" — and you type your guess, then press Enter or Submit to check it. There is no timer, so you can take as long as you like on a clue.",
    ],
    [
      "how many questions are in this emoji quiz",
      "20. The question bank holds 20 fixed puzzles and each one is served once per game; when all 20 have been used the quiz ends and shows your final score with a Play Again button that reshuffles the same set.",
    ],
    [
      "how is the emoji quiz score calculated",
      "Each correct answer is worth 10 points plus 2 points for every answer already in your current streak — 10 for the first, 12 for the second in a row, 14 for the third, and so on. A wrong answer scores nothing, resets the streak to zero, and reveals the correct phrase.",
    ],
    [
      "does spelling or capitalization matter in an emoji quiz",
      "No — capitalisation and punctuation are ignored. Before comparing, both your guess and the answer are lowercased, trimmed and stripped of every character outside a-z, 0-9 and spaces, so \"Movie Night!\" matches \"movie night\". There is no fuzzy or phonetic matching, though, so a misspelled word inside the phrase will still be marked wrong.",
    ],
    [
      "can i get a hint in the emoji quiz",
      "Yes, and it is free. The lightbulb button beside Submit reveals a one-line hint written for that specific puzzle — \"Sun, sand, and waves\" for 🌞🏖️🌊 — and using it does not reduce your score or reset your streak.",
    ],
    [
      "does the emoji quiz save my score",
      "No. Score, streak and question number live only in the page's React state, so reloading or hitting Play Again starts you at zero. There is no leaderboard, no saved history and no local storage.",
    ],
    [
      "is this emoji quiz free and do i need an account",
      "It is free with no signup. The 20 puzzles, their hints and the answer-checking logic all ship with the page and run as client-side React in your browser, so nothing you type is uploaded or stored on a server.",
    ],
    [
      "are the emoji quiz questions about movies",
      "Not specifically — these are everyday words and phrases, not film or song titles. The 20 puzzles span eight categories: Activity, Event, Sport, Emotion, Weather, Concept, Animal and Food, with answers such as \"birthday party\", \"rainy day\", \"space travel\" and \"fast food\".",
    ],
  ],
  steps: [
    "Read the emoji clue on the question card and type your guess into the answer box.",
    "Press Enter or click Submit to check it — or tap the lightbulb first for a free one-line hint.",
    "Click Next for a new clue; after all 20 puzzles are used, the final score screen appears with Play Again.",
  ],
};

export default seo;
