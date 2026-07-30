const seo = {
  intro:
    "The Currency Quiz is a timed four-option multiple-choice game built from 82 distinct world currencies, testing three things: which currency a country uses, which country uses a named currency, and which currency a symbol such as ₭, ₾ or ₪ belongs to. Four difficulty levels change both the length and the pressure — Easy is 10 questions at 25 seconds each, while Expert is 30 questions at 8 seconds each. Answer three or more in a row and each further correct answer is worth 2 points instead of 1, and at the end you get a scored report with your best streak.",
  useCases: [
    "You are prepping for a pub quiz or general-knowledge round and keep blanking on which country uses the koruna versus the krona versus the krone.",
    "A geography student wants repeat drilling on currency-country pairings where the flag is shown but the answer is the three-letter ISO code.",
    "You saw ₸ or ₴ on a price list and realised you cannot place unusual currency symbols, so you want the symbol-recognition round on Hard.",
  ],
  benefits: [
    ["Three different question directions", "Country to currency, currency to country and symbol to currency each test a different recall path, so you cannot pass by memorising one mapping direction."],
    ["Difficulty changes the format, not just the clock", "Easy and Medium show a flag, Hard shows only a currency symbol and Expert asks you to name the country from the currency, so each level is genuinely a different test."],
    ["Streak scoring rewards consistency", "Points double after two consecutive correct answers, so a run of confident answers outscores the same number of lucky scattered ones."],
  ],
  faqs: [
    [
      "How long do I get to answer each question?",
      "It depends on the level: 25 seconds on Easy, 18 on Medium, 12 on Hard and 8 on Expert. Letting the timer run out is scored the same as a wrong answer and resets your streak.",
    ],
    [
      "How does the streak bonus work?",
      "Once you have two correct answers in a row, every further correct answer is worth 2 points rather than 1, and the bonus keeps applying until you miss one. A single wrong answer or timeout drops the streak back to zero.",
    ],
    [
      "How many currencies are in the question pool?",
      "82 unique currency codes drawn from over 100 countries and territories. Countries that share a currency — the twenty-odd Eurozone members, for instance — appear as country options but contribute only one currency to the answer pool.",
    ],
    [
      "Does the quiz ask about live exchange rates?",
      "No. Questions cover currency names, ISO codes, symbols and the countries that use them — facts that stay stable — rather than rates, which change by the minute. Check a live rate source if that is what you need.",
    ],
  ],
};

export default seo;
