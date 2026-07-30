const seo = {
  intro:
    "This is a compatibility-score demo: you fill in a short profile — name, age, location, interests, personality type and lifestyle — and it ranks five built-in sample profiles against you with a 40/30/30 weighted score. Shared interests are worth up to 40 points (shared interests ÷ the number you picked, times 40), personality contributes 30 for an exact match, 20 if either side is an ambivert and 10 otherwise, and lifestyle scores the same way with 'balanced' as the flexible middle. It is a demonstration of how a matching algorithm weighs its inputs, not a dating service — the profiles it scores against are fictional examples, and nothing you type is sent anywhere.",
  useCases: [
    "You want to see, concretely, how a dating app can turn three answers into a single percentage before you trust one",
    "You are designing your own matching or recommendation feature and want a working reference for how to split weight across attributes",
    "You are running a class or workshop on scoring algorithms and want a hands-on example where changing one answer visibly moves the ranking",
  ],
  benefits: [
    [
      "The whole scoring rule is visible",
      "Interests, personality and lifestyle are weighted 40, 30 and 30, and each result card shows which of your interests the profile shares, so you can trace where the percentage came from.",
    ],
    [
      "Middle options are treated as flexible, not neutral",
      "Ambivert and balanced answers score 20 against any opposite rather than the 10 a hard mismatch gets, which is what makes the ranking shift when you change them.",
    ],
    [
      "Results are ranked, not filtered",
      "All five sample profiles come back sorted highest first with their scores, so you can see the near-misses instead of only the top pick.",
    ],
  ],
  faqs: [
    [
      "How is the compatibility percentage calculated?",
      "Shared interests give up to 40 points, scaled by how many interests you selected; personality gives 30 for an exact match, 20 if either side is ambivert, or 10 for opposites; lifestyle gives 30, 20 or 10 on the same rule with 'balanced' as the middle. The total is capped at 100, so the floor for any profile is 20 and the ceiling is a full 100.",
    ],
    [
      "Are the matches real people?",
      "No. The tool scores you against five fixed fictional profiles written into the page as sample data. There is no sign-up, no database of users and no messaging — it exists to show the algorithm, not to introduce you to anyone.",
    ],
    [
      "Why did selecting more interests lower my score?",
      "Because the interest component divides shared interests by the number you picked. Choosing all six when a profile lists three caps that part at 20 of the available 40 points, while choosing exactly those three would score the full 40.",
    ],
    [
      "What do the labels like 'Perfect Match' mean?",
      "They are bands over the score: 80 and above reads Perfect Match, 60 to 79 Great Match, 40 to 59 Good Match, and anything below 40 Potential Match. They are presentation labels for the same number, not a separate judgement.",
    ],
  ],
};

export default seo;
