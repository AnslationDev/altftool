const seo = {
  title: "Flag Quiz: 9 Modes, 200+ Countries, Timed Rounds",
  steps: [
    "Choose a \"Question Type\", a \"Difficulty\", a \"Number of Questions\" from 10 to 50 and a \"Time Per Question\" (no limit, 10, 15, 20, 30 or 45 seconds).",
    "Press \"Start Flag Quiz\" and answer each item — wrong options are drawn from the answer's own world region, and every question ends with an explanation.",
    "Finish the round for your percentage score, best streak and average answer time, then press \"Play Again\".",
  ],
  intro:
    "A flag quiz that builds every round from a live country dataset rather than a fixed question list: pick a question type, a length of 10 to 50 questions and a per-question timer, and each item is generated with the correct answer plus three distractors. Nine question types are available — identify the flag, pick the flag from a country name, and flag-to-capital, continent, currency, language, subregion or land-area questions — and wrong options are drawn from the same world region as the answer wherever possible, so the choices are genuinely hard to tell apart. Every question ends with an explanation naming the country and the fact behind it.",
  useCases: [
    "You have a geography test on Friday and want unlimited flag-to-capital drills instead of the same twenty cards",
    "You can recognise European flags but keep confusing the Central American ones, so you want a round whose wrong answers all come from the same region",
    "You want a quick 10-question round with a 15-second timer as a daily warm-up and a streak to beat",
  ],
  benefits: [
    [
      "Distractors come from the same region",
      "Wrong options are pulled from countries sharing the answer's region before falling back to the rest of the world, so you cannot eliminate choices by continent alone.",
    ],
    [
      "Nine question types off one flag",
      "The same flag can be asked about eight different ways — country, capital, continent, currency, language, subregion, land area, or shown in reverse — plus a random mix.",
    ],
    [
      "Difficulty filters the country pool, not the wording",
      "Easy restricts questions to countries over 100,000 km² or in Europe and the Americas, medium to countries over 10,000 km², and hard opens the pool to every nation including the micro-states.",
    ],
  ],
  faqs: [
    [
      "How many countries does the quiz cover?",
      "The full open country dataset it loads — roughly 250 territories including every UN member state — filtered by the difficulty you choose. Flag images are served as PNG and SVG from a flag CDN keyed on each country's two-letter ISO code.",
    ],
    [
      "Can I play without a time limit?",
      "Yes. The timer options are no limit, 10, 15, 20, 30 or 45 seconds per question; choosing no limit stops the countdown entirely. When a timed question runs out it is recorded as incorrect and the run moves on.",
    ],
    [
      "How does the streak work?",
      "Each correct answer adds one, and a wrong answer or a skip resets it to zero. Your best streak in a round is kept alongside your percentage score, and both are stored locally on your device so you can see whether you beat your previous best.",
    ],
    [
      "How are the country-size questions scored?",
      "Land area is bucketed into four bands — under 50,000 km², 50,000 to 500,000 km², 500,000 to 5 million km², and over 5 million km² — and you pick the band. The explanation then shows the country's actual area, so a near miss still teaches you the real figure.",
    ],
  ],
};

export default seo;
