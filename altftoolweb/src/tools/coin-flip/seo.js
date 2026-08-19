const seo = {
  title: "Coin Flip Simulator: Fair Toss & Best-of Series",
  metaDescription:
    "Flip a fair coin using crypto.getRandomValues — 3D animation, 1–6 coins at once, best-of-3 to 9 series scoring, streak tracking and your last 30 results.",
  intro:
    "This coin flip tool tosses a fair virtual coin using the browser's cryptographic random number generator, crypto.getRandomValues, rather than Math.random, so each result is an unbiased 50/50 and cannot be predicted from the previous flips. Alongside the 3D flip animation it keeps a running tally of heads versus tails, your current and best same-side streak, the last 30 results, and best-of-3, 5, 7 or 9 series scoring. Stats are saved in your browser between visits.",
  useCases: [
    "Two of you are deciding who takes the early shift and neither has a coin, so you want a toss both people can watch land.",
    "You are settling something that deserves more than one flip, so you run a best-of-5 series and let it call the winner at the first side to reach three.",
    "You are teaching probability and want to flip several coins at once, then show the class that heads and tails converge slowly, not neatly, over the running counter.",
  ],
  benefits: [
    ["Cryptographic randomness, not Math.random", "Every toss draws from crypto.getRandomValues, the same source used for security tokens, with a documented fallback if the browser lacks it."],
    ["Series scoring is settled for you", "Pick best-of-3, 5, 7 or 9 and the winner is declared the moment one side reaches the majority — 2, 3, 4 or 5 wins."],
    ["Streaks and history you can check", "It tracks your current run, your longest run on one side, and the last 30 results as a readable H/T strip."],
  ],
  faqs: [
    [
      "Is this coin flip actually random?",
      "Yes. It calls window.crypto.getRandomValues, the browser's cryptographically secure generator, and maps the value to heads or tails on an even split, so the odds are 50/50 on every flip. Math.random is only a fallback for browsers that do not expose the crypto API.",
    ],
    [
      "Does the tool remember my results?",
      "Yes, in your browser only. Total flips, the heads and tails split, your best streak and the last 30 results are saved to local storage, so they are still there when you come back and are never sent anywhere.",
    ],
    [
      "How does the best-of series decide a winner?",
      "First side to a simple majority. In a best-of-5, three heads or three tails ends it, and remaining flips are not needed — the tool locks the series the moment that threshold is reached.",
    ],
    [
      "Why did I get five heads in a row?",
      "Because runs are normal. Each flip is independent at 50/50, so any five flips coming up heads has a 1 in 32 chance — common enough to see in a short session — and it does not make the next flip any more likely to be tails.",
    ],
  ],
};

export default seo;
