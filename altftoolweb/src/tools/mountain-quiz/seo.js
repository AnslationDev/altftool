const seo = {
  intro:
    "Mountain Quiz is a timed multiple-choice test built from a set of 31 real peaks, from Everest at 8,849 m down to Rio's Sugarloaf at 396 m, that asks you to match each mountain to its height band, range, continent, country, or to name the peak from a fact about it. You pick one of those five question types and one of four difficulties, then answer against a per-question countdown with four options each. It suits geography students, pub-quiz regulars and anyone drilling the eight-thousanders before a trek.",
  useCases: [
    "You are revising physical geography for a school exam and want repeated drilling on which range each major peak belongs to, Himalayas versus Karakoram versus Andes.",
    "You are prepping for a trivia night and want a fast 10-question round on the easy setting to see which of the fourteen 8,000 m peaks you can still place by country.",
    "You have a trek to Kilimanjaro or Aconcagua booked and want to test whether you can rank the Seven Summits by height without looking them up.",
  ],
  benefits: [
    [
      "Five separate question angles",
      "Height band, range, continent, country and name-from-fact are chosen up front, so you can drill the one dimension you keep getting wrong instead of a random mix.",
    ],
    [
      "Difficulty changes pace, not just length",
      "Moving from easy to expert cuts the clock from 25 seconds to 8 seconds a question while raising the count from 10 to 40, so recall speed is tested as well as knowledge.",
    ],
    [
      "Every question carries a hint and a review",
      "Each item offers a related clue such as the country or the height, and the end screen lists every question with your answer next to the correct one.",
    ],
  ],
  faqs: [
    [
      "How many questions are in each difficulty?",
      "Easy is 10 questions at 25 seconds each, medium is 20 at 18 seconds, hard is 30 at 12 seconds, and expert is 40 at 8 seconds. The question type you select applies to every question in the round.",
    ],
    [
      "What happens if the timer runs out?",
      "The question is recorded as unanswered and scored as incorrect, and your streak resets to zero. The quiz then advances automatically to the next question after showing the correct answer.",
    ],
    [
      "How does the streak bonus work?",
      "Once you already have a run of two correct answers, each further correct answer is worth 2 points instead of 1. Streak labels appear as you climb, from Nice at 3 in a row to Legendary at 10, and a single wrong or timed-out answer sends the streak back to zero.",
    ],
    [
      "Which mountains can appear in the questions?",
      "A fixed set of 31 well-known peaks covering all seven continents, including all fourteen 8,000-metre summits, plus landmarks such as Mont Blanc at 4,809 m, Mount Fuji at 3,776 m and Ben Nevis at 1,345 m. Each round draws its questions from a shuffled subset of that list.",
    ],
  ],
};

export default seo;
