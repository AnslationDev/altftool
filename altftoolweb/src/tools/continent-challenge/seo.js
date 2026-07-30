const seo = {
  intro:
    "Continent Challenge is a timed four-option geography quiz drawn from 197 countries across Africa, Asia, Europe, North America, South America and Oceania, asking you to match a country to its continent, a country to its capital, or a capital back to its country. Four difficulty levels set both the length and the clock — Easy is 10 questions at 25 seconds each, Expert is 50 questions at 8 seconds — and you can restrict the pool to a single continent. It suits students revising for a geography test and anyone who wants their capitals drilled rather than listed.",
  useCases: [
    "You have a map-and-capitals test on Friday covering Africa only, and you want 30 timed questions pulled solely from its 54 countries instead of the whole world.",
    "You keep confusing Slovakia with Slovenia and Guinea with Guinea-Bissau, and you want repeated four-option prompts until the distinction sticks.",
    "You are running a family quiz night and want a shareable text report of who scored what, including which questions were missed and the right answers.",
  ],
  benefits: [
    ["Three question directions, not one", "The same country is tested as country-to-continent, country-to-capital and capital-to-country, so you learn the pairing both ways instead of memorising one list order."],
    ["The clock scales with difficulty", "Time per question drops from 25 seconds on Easy to 12 on Hard and 8 on Expert, which forces recall rather than reasoning your way to the answer."],
    ["A wrong-answer breakdown you can keep", "The end-of-quiz report lists every question with the correct answer beside your response, and copies or downloads as plain text for revision."],
  ],
  faqs: [
    [
      "How many countries and continents does the quiz cover?",
      "197 countries across six inhabited continents: Africa with 54, Asia with 49, Europe with 45, North America with 23, Oceania with 14 and South America with 12. Antarctica is excluded because it has no countries or capitals to test.",
    ],
    [
      "How does the scoring and streak bonus work?",
      "A correct answer is worth 1 point, and once you already have a streak of 2 each further correct answer is worth 2. A wrong answer or a timeout resets the streak to zero, and your best streak of the run is reported at the end.",
    ],
    [
      "What happens if the timer runs out?",
      "The question is marked wrong with no answer recorded, your streak resets, and the quiz moves on after about 1.2 seconds. On Expert that gives you 8 seconds per question, so unanswered questions are part of the challenge.",
    ],
    [
      "Can I practise just one continent?",
      "Yes — pick a continent before starting and every question is drawn only from its countries. Combining a single continent with Hard or Expert is the fastest way to find the specific capitals you do not know.",
    ],
  ],
};

export default seo;
