const seo = {
  intro:
    "Quiz App runs a 12-question multiple-choice round in one of five ready-made categories - Web Development, General Knowledge, Science, Aptitude and Digital Marketing - scoring you at the end as correct, wrong and skipped, plus a percentage. Nothing is revealed mid-quiz: you can move back and forth, change an answer or skip, and only after finishing does the review list every question with the right option and a one-line explanation of why. It suits anyone doing quick self-testing before an interview, a class test or an aptitude round.",
  useCases: [
    "You have a frontend interview tomorrow and want a fast check on semantic HTML, hooks, Grid versus Flexbox and list keys before you revise further.",
    "A campus placement aptitude round is coming up and you want twelve timed-free practice sums on percentages, averages, speed and sequences with worked explanations.",
    "A teacher wants a no-signup warm-up quiz to project in class, switching between the Science and General Knowledge decks between groups.",
  ],
  benefits: [
    ["Answers stay hidden until you finish", "No instant right/wrong flash per click, so you cannot accidentally learn the answer before committing to the next question."],
    ["Skipped is tracked separately from wrong", "The result splits correct, wrong and skipped, so an unattempted question does not get lumped in with a mistake."],
    ["Every question has a reason attached", "The post-quiz review shows the correct option and a short explanation, such as why CSS Grid suits two-dimensional layouts."],
  ],
  faqs: [
    [
      "How many questions are in a quiz?",
      "12 per category, and there are five categories, so 60 questions in total. Switching category resets the round and loads that deck's 12 questions from the first one.",
    ],
    [
      "Can I change an answer or come back to a question?",
      "Yes. Use the previous and next controls to move freely through all 12 questions and tap a different option to replace your selection at any point before you finish. Skipping leaves the question blank and moves you forward.",
    ],
    [
      "How is the score calculated?",
      "As correct answers divided by the total 12, rounded to a whole percentage. The feedback message keys off that number: 90% and above is excellent, 70% and above is strong, 50% and above is a good start, and below that suggests another run.",
    ],
    [
      "Do I need an account, and is my score saved?",
      "No account, and no score history - the quiz runs entirely in the page and restarting or reloading clears the round. Note down or screenshot your result if you want to compare attempts.",
    ],
  ],
};

export default seo;
