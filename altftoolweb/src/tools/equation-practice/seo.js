const seo = {
  title: "Algebra Equation Practice: Step-by-Step Answers",
  metaDescription:
    "Drill five levels from x + a = b to ax² + bx + c = 0, with hints, full working and answers accepted within 0.05. Practice, 60-second timed or survival.",
  steps: [
    "Pick a Difficulty from Beginner (x + a = b) to Challenge (ax² + bx + c = 0), a Game Mode of Practice, Timed 60 seconds or Survival 3 lives, and 5 to 30 questions.",
    "Press Start Practice, type the value into the x = ? box and press Submit — Hint and Skip sit beside it.",
    "You get Correct! or Wrong! with the answer (anything within 0.05 counts), then open Show Explanation for the numbered working and press Next Equation.",
  ],
  intro:
    "This equation practice tool generates randomised algebra problems across five levels — x + a = b, ax + b = c, ax + b = cx + d, ax² + b = c and the full quadratic ax² + bx + c = 0 — and marks your answer instantly against a worked step-by-step solution. Answers are accepted within a tolerance of 0.05, so a rounded decimal still counts as correct, and each problem carries a hint and the exact fractional or ± form. It is for students drilling linear and quadratic equations, and for anyone who needs repetition rather than a single answer.",
  useCases: [
    "Revising for an algebra test where you can already solve ax + b = c but keep slipping when x appears on both sides",
    "Building speed before a timed exam by running the 60-second mode and watching how long each question actually takes you",
    "Checking whether you really know the quadratic formula by working through ax² + bx + c = 0 problems that always have real roots, with the discriminant shown in the solution",
  ],
  benefits: [
    ["Full working, not just a verdict", "Every problem expands into the actual steps — isolate, collect terms, divide, take the root — plus the exact fraction or ± form of the answer."],
    ["Problems are built backwards from the root", "Coefficients are generated from a chosen integer solution, so the answers stay clean and quadratics always have real roots."],
    ["Three ways to practise", "Untimed practice, a 60-second sprint, or survival with three lives, with score, current streak and best streak tracked as you go."],
  ],
  faqs: [
    [
      "How close does my answer have to be?",
      "Within 0.05 of the true value. That means 2.33 is accepted where the exact answer is 7/3, so you can type a rounded decimal instead of a fraction. For quadratics with two roots, either root alone is accepted, or both separated by a comma or space.",
    ],
    [
      "What are the difficulty levels?",
      "Five, in increasing order: beginner is x + a = b, easy is ax + b = c, medium is ax + b = cx + d with x on both sides, hard is ax² + b = c solved by square root, and challenge is the full quadratic ax² + bx + c = 0. Each level generates fresh numbers every time, so the same problem does not repeat.",
    ],
    [
      "How is the score calculated?",
      "Ten points for a correct answer, plus a speed bonus of up to 20 points for answering quickly, plus 2 points per streak up to a streak of 10. A wrong answer or a skip resets the streak to zero, and in survival mode a wrong answer also costs one of your three lives.",
    ],
    [
      "How do I solve an equation with x on both sides?",
      "Collect the x terms on one side and the constants on the other, then divide. For ax + b = cx + d that gives (a − c)x = d − b, so x = (d − b) ÷ (a − c) — which is exactly the working the medium level shows you after each answer.",
    ],
  ],
};

export default seo;
