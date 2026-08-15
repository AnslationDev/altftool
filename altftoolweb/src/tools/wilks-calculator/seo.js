const seo = {
  title: "Wilks Score Calculator with DOTS and IPF GL",
  metaDescription:
    "Scores a powerlifting total against bodyweight with the 1994 Wilks coefficient, plus DOTS and IPF GL, and the total needed at any other bodyweight.",
  steps: [
    "Set units to kilograms or pounds, pick the men or women coefficient set, and enter your bodyweight.",
    "Enter squat, bench press and deadlift, or switch Enter lifts as to One total and type the total straight in.",
    "Read the Wilks score with its coefficient, the DOTS and IPF GL points, and the total needed at your compare bodyweight.",
  ],
  intro:
    "The Wilks Calculator turns a powerlifting total into a bodyweight-adjusted score so lifters in different weight classes can be compared. It uses Robert Wilks' 1994 formula — coefficient = 500 / (a + bx + cx² + dx³ + ex⁴ + fx⁵) with x as bodyweight in kilograms — and shows DOTS and IPF GL Points alongside it, because most federations moved to those after 2019. Enter squat, bench and deadlift, or a total straight in, and it also tells you what total you would need at a different bodyweight for the same score.",
  useCases: [
    "Comparing a 610 kg total at 83 kg against a training partner's 700 kg at 105 kg to see who is actually stronger pound for pound.",
    "Deciding whether cutting from 93 kg to 83 kg helps your score, by seeing the total needed at each bodyweight for the same Wilks.",
    "Checking your IPF GL points before entering a meet, since the IPF has scored on GL rather than Wilks since 2020.",
  ],
  benefits: [
    ["Three scoring systems", "Wilks (1994), DOTS (2019) and IPF GL Points (2020) from one set of numbers, so you can quote whichever your federation uses."],
    ["Equivalent-total planner", "Shows the total needed at any other bodyweight to hold the same Wilks score."],
    ["Honest about its limits", "Warns when your bodyweight sits outside the range the curves were fitted on, where the score is an extrapolation."],
  ],
  faqs: [
    [
      "How is the Wilks score calculated?",
      "Wilks score = total x coefficient, where coefficient = 500 / (a + bx + cx² + dx³ + ex⁴ + fx⁵) and x is bodyweight in kg, with separate coefficient sets for men and women. A 100 kg man has a Wilks coefficient of 0.6086, so a 610 kg total scores 371.2.",
    ],
    [
      "What is a good Wilks score?",
      "There is no official grading table — Wilks exists to rank lifters against each other, not to hand out labels. A useful anchor is IPF GL Points, which is deliberately calibrated so a world-class performance sits near 100; this calculator shows both figures side by side.",
    ],
    [
      "Why did the IPF stop using Wilks?",
      "The IPF replaced Wilks with IPF Points in 2019 and IPF GL Points in 2020, because the Wilks curve was fitted to competition data from the early 1990s and had drifted out of line with modern results, particularly at the lightest and heaviest bodyweights.",
    ],
    [
      "What is the difference between Wilks, DOTS and IPF GL points?",
      "Wilks and DOTS are both polynomial coefficients multiplied by your total, and land on similar numbers — 0.6086 and 0.6155 respectively for a 100 kg man. IPF GL points use an exponential curve, total x 100 / (A - B x e^(-C x bodyweight)), and are scaled to about 100 for a world-class lift rather than to a few hundred.",
    ],
  ],
};

export default seo;
