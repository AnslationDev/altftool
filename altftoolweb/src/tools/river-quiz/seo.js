const seo = {
  title: "River Quiz: 50 World Rivers, 4 Modes, Timed Rounds",
  metaDescription:
    "Timed quiz on 50+ major rivers: name the continent, country, length range or river. Easy is 10 questions at 25s, Expert 40 at 8s, with streak scoring.",
  steps: [
    "Pick a Question Type — Which continent?, Which country?, Name the river or How long? — then a difficulty card from Easy (10 questions, 25s each) to Expert (40 questions, 8s each).",
    "Answer each timed multiple-choice question; a correct answer scores 1 point, rising to 2 once your streak reaches 3, and a timeout marks the question wrong and resets the streak.",
    "At the Quiz Complete! screen, review Score, Accuracy and Best Streak with the answer breakdown, then Copy the report or Download it as River_Quiz_<difficulty>.txt.",
  ],
  intro:
    "A timed multiple-choice quiz on more than 50 of the world's major rivers, with four question modes: name the continent, name the main country, identify the river from a fact, or place its length in a range. Four difficulty levels set both the question count and the clock — Easy is 10 questions at 25 seconds each, Expert is 40 questions at 8 seconds each. Answers score 1 point, rising to 2 once you are on a streak of three or more, and every question carries a hint you can reveal.",
  useCases: [
    "Revising for a geography test where you need continent and country for rivers like the Amur, Syr Darya and Okavango, not just the famous ten.",
    "Settling whether the Nile or the Amazon is longer by drilling the length ranges until the 6,650 km and 6,400 km figures stick.",
    "Running a quick classroom warm-up: Easy mode gives ten questions at 25 seconds each, short enough to fit before a lesson starts.",
  ],
  benefits: [
    ["Four ways to ask about the same river", "Continent, country, length band and fact-to-name modes force you to learn a river from several angles instead of memorising one list order."],
    ["Difficulty changes the clock, not just the count", "Time per question drops from 25 seconds on Easy to 8 on Expert, so recall speed is tested as well as knowledge."],
    ["Streaks are rewarded", "From the third correct answer in a row each further correct answer is worth 2 points, so consistency beats lucky guesses."],
  ],
  faqs: [
    [
      "What is the longest river in the world?",
      "The Nile, at about 6,650 km, is the longest river in this quiz's dataset, ahead of the Amazon at roughly 6,400 km. The Amazon is still the largest river by discharge, carrying around a fifth of all river water on Earth, and length rankings between the two remain debated among geographers depending on where the source is measured.",
    ],
    [
      "How many questions are in each round?",
      "Easy gives 10 questions, Medium 20, Hard 30 and Expert 40, with 25, 18, 12 and 8 seconds per question respectively. Questions are drawn from a shuffled pool of at least 20 rivers, so no two rounds run in the same order.",
    ],
    [
      "How does the scoring work?",
      "A correct answer is 1 point, and once your current streak reaches 3 or more each further correct answer is worth 2 points. A wrong answer or a timeout resets the streak to zero, and your best streak of the round is reported at the end alongside the score.",
    ],
    [
      "What happens if the timer runs out?",
      "The question is marked wrong automatically, your streak resets, and the quiz moves on after a short reveal of the correct answer. Tapping the hint button first costs nothing — it shows the river's length or continent, depending on the question mode.",
    ],
  ],
};

export default seo;
