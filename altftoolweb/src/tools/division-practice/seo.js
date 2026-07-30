const seo = {
  intro:
    "Division Practice generates timed sets of division questions — basic facts, long division, division with remainders, decimal division and large numbers — and marks each answer as you type it, with a step-by-step worked solution shown when you get one wrong. Five difficulty bands set the divisor range, from beginner (divisors 1-10) up to expert (divisors 12-99), and sets run to 10, 15, 20, 30 or 50 questions. Accuracy, streaks and time per question are saved in the browser so a student can see progress across sessions.",
  useCases: [
    "A Year 5 pupil has a long-division test on Friday and needs twenty questions a night with divisors in the 10-50 range and the working shown for every miss.",
    "A parent wants their child on remainder questions specifically, where the answer has to be entered as '7 R 3' and the remainder must be smaller than the divisor.",
    "An adult brushing up before an aptitude test runs mixed 50-question sets and watches whether the average time per question drops below five seconds.",
  ],
  benefits: [
    [
      "Every wrong answer is worked through",
      "Missed questions expand into numbered steps — divide, multiply back, subtract, check the remainder — instead of only showing the right number.",
    ],
    [
      "Questions built to be exact",
      "Basic, long and large problems are generated as divisor x quotient, so they divide cleanly; remainder problems are built with a remainder deliberately smaller than the divisor.",
    ],
    [
      "Progress that survives the session",
      "Accuracy, streaks, questions solved today and the last 50 sessions are kept in the browser, along with eight unlockable milestones such as a 10-answer streak.",
    ],
  ],
  faqs: [
    [
      "What difficulty should a beginner start on?",
      "Start on Beginner, which uses divisors from 1 to 10 and quotients from 1 to 10 — the standard division-facts table. Easy moves to divisors 2-12, Medium 5-25, Hard 10-50, and Expert 12-99.",
    ],
    [
      "How do I type an answer with a remainder?",
      "Write the quotient, the letter R, then the remainder — for example 7 R 3. A comma works too, and entering just the quotient is accepted for the quotient part. The remainder is always smaller than the divisor, so 23 divided by 5 is 4 R 3, never 3 R 8.",
    ],
    [
      "Are decimal answers marked as wrong if I round?",
      "No. Decimal questions are graded to a tolerance of 0.01, and the target answer is itself rounded to two decimal places, so 6.67 is accepted for 20 divided by 3.",
    ],
    [
      "How do I check a division answer is right?",
      "Multiply the divisor by the quotient and add the remainder — it should equal the dividend. For 47 divided by 6, that is 6 x 7 + 5 = 47. The step-by-step solution uses this same check on every question.",
    ],
  ],
};

export default seo;
