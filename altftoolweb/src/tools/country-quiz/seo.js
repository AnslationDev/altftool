const seo = {
  title: "Country Quiz: Capitals, Flags, Borders",
  metaDescription:
    "A geography quiz generated from live country data: pick capitals, flags, borders or a random mix, 10 to 50 questions, and a 15-60 second timer or none.",
  steps: [
    "On the setup screen pick a Question Type from the ten cards — Capitals, Continents, Regions, Currencies, Languages, Borders, Area, Domains, Flags or Random Mix — and a Difficulty of Easy, Medium, Hard or Mixed.",
    "Set Number of Questions to 10, 15, 20, 30 or 50 and Time Per Question to No Limit, 15s, 20s, 30s, 45s or 60s, then press Start Quiz.",
    "Answer each question to reveal its Explanation and move the Streak counter; the results screen shows your percentage with Correct, Wrong, Best Streak and Avg Time tiles, Category Performance bars and an Answer Review, then New Quiz or Play Again.",
  ],
  intro:
    "This geography quiz generates multiple-choice questions on the fly from a live open dataset of the world's countries, so no two rounds are the same. You pick a topic — capitals, continents, subregions, currencies, languages, land borders, area, internet domains, flags, or a random mix — then a length of 10, 15, 20, 30 or 50 questions and a per-question time limit of 15 to 60 seconds or none at all. Every question comes with a one-line explanation after you answer, and a running streak counter tracks consecutive correct answers.",
  useCases: [
    "Revising for a pub quiz where the geography round always turns on capitals and currencies, and you want repeatable practice rather than a fixed list you memorise",
    "A teacher wanting a five-minute warm-up on continents and subregions that produces fresh questions for every class",
    "Preparing for travel or a competitive exam and drilling the one topic you keep getting wrong — say, which countries border which — at 50 questions a session",
  ],
  benefits: [
    ["Questions are generated, not stored", "Each round is built from live country data, so you cannot pass by memorising a fixed question bank."],
    ["Wrong answers are deliberately plausible", "The three decoys are drawn from the same world region as the correct country, so guessing by continent will not save you."],
    ["Ten topics you can isolate", "Drill only capitals, only flags or only borders instead of taking whatever a mixed quiz throws at you."],
  ],
  faqs: [
    [
      "How many questions can I take in one quiz?",
      "10, 15, 20, 30 or 50. You can also set a per-question timer at 15, 20, 30, 45 or 60 seconds, or turn the limit off entirely for untimed practice.",
    ],
    [
      "What do the difficulty levels change?",
      "Which countries can appear. Easy draws only from countries larger than 100,000 km² or located in Europe and the Americas; Medium from any country above 10,000 km²; Hard and Mixed use the full list, so microstates and small island nations are in play.",
    ],
    [
      "What topics does the quiz cover?",
      "Ten: capitals, continents, subregions, currencies, official languages, land borders, land area, country-code top-level domains, flags, and a random mix that draws from all of them. Each answered question shows a short explanation of the correct answer.",
    ],
    [
      "Where does the country data come from, and does it work offline?",
      "It loads an open, publicly maintained countries dataset and caches it in your browser for 24 hours, so the first quiz needs a connection but repeat sessions within a day run from the cache. Facts like capitals and currencies reflect that dataset, so verify anything you plan to rely on against an official source.",
    ],
  ],
};

export default seo;
