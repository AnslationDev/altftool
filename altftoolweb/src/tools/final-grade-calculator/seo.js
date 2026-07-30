const seo = {
  intro:
    "This calculator solves required final = (target − current × (1 − weight)) ÷ weight, so you can see the exact percentage you need on the final exam to land a given overall grade. It has three modes: the required-score mode above, a reverse mode that computes overall = current × (1 − weight) + final × weight once you know your exam result, and a weighted-average mode that totals any number of coursework components as Σ(score × weight) ÷ Σ weight. It also tells you the best overall grade still achievable, so an impossible target is labelled as such instead of quietly returning a number above 100.",
  useCases: [
    "Your final is worth 30% of the module, you are sitting at 72%, and you want to know the exact mark that gets you to an 80% overall",
    "You have already written the final and think you scored around 85% — you want your overall percentage before results are published",
    "You want to check whether your syllabus weights actually add up to 100% and see how many points each assignment has already locked in",
  ],
  benefits: [
    [
      "Tells you when a target is out of reach",
      "It computes the best achievable overall — current × (1 − weight) + 100 × weight — and flags a target as not mathematically possible rather than printing a required score over 100.",
    ],
    [
      "Shows every common target at once",
      "A table lists the final score needed for 90, 80, 70, 60 and 40 percent overall side by side, each marked achievable or not.",
    ],
    [
      "Prints the arithmetic, not just the answer",
      "Each mode shows the formula with your own numbers substituted in, so you can check it against the marking scheme in your handbook.",
    ],
  ],
  faqs: [
    [
      "What score do I need on my final to pass?",
      "Take your target overall, subtract your current grade multiplied by (1 − exam weight), then divide by the exam weight. If you are at 45% with a 40%-weighted final and need 40% overall, coursework has already locked in 27 points, so you need 32.5% on the final.",
    ],
    [
      "Can I still get an A if my coursework is weak?",
      "Only if current × (1 − weight) + 100 × weight reaches your target — that best-case figure is shown next to every result. A 65% average with a 50%-weighted final tops out at 82.5% overall, so an A at 80% is still reachable but a 90% is not.",
    ],
    [
      "Why does it say I need a negative score on the final?",
      "Because your coursework alone already exceeds the target, so the tool clamps the display to 0% and tells you the target is secured. It still shows the locked-in figure so you can see how much headroom you have if the exam goes badly.",
    ],
    [
      "How does the weighted-average mode handle weights that do not add to 100?",
      "It divides by the weight you actually entered, so a partial syllabus still gives a meaningful running average, and it shows how much weight is left. If the components total more than 100% it flags the overshoot and tells you how many points to trim — grading rules vary by institution, so check your course handbook for the official scheme.",
    ],
  ],
};

export default seo;
