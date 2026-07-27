const seo = {
  intro:
    "The SSC Exam Prompt Builder writes AI study prompts that carry the exact marking scheme, per-question pace and skip-or-guess threshold of the SSC paper you are preparing for. Pick CGL Tier I, CHSL Tier I, MTS Session I or II, CPO Paper I, GD Constable or JE Paper I, then a section and topic, and it also solves the attempt maths: how many questions you must attempt at a given accuracy to reach a target score, using marks-per-attempt = accuracy x marks-per-correct minus (1 - accuracy) x penalty.",
  useCases: [
    "Generating a Quantitative Aptitude shortcut sheet for Time and Work with a 36-second-per-question target, matching SSC CGL Tier I pacing.",
    "Working out that a 140 target in CGL Tier I at 80% accuracy needs 94 attempts, then building a drill sized to that.",
    "Turning last week's mock mistake list into an error-log prompt that classifies each error as conceptual, calculation, misreading or time pressure.",
  ],
  benefits: [
    ["Paper-accurate marking", "Each exam carries its own marks per correct and its own deduction, not a one-size-fits-all rule."],
    ["Attempt maths, not guesswork", "The target planner tells you the attempt count your accuracy actually supports, and refuses impossible targets."],
    ["Section-aware topics", "Topic lists switch with the section, so a reasoning prompt never gets a quant topic."],
  ],
  faqs: [
    [
      "What is the negative marking in SSC CGL Tier 1?",
      "SSC CGL Tier I deducts 0.50 marks for every wrong answer, against 2 marks for every correct one. That makes the break-even accuracy 20% - below 20% accuracy on your guesses, guessing costs you more than it earns.",
    ],
    [
      "How many questions should I attempt in SSC CGL Tier 1?",
      "It depends on your accuracy, not on a fixed number. At 80% accuracy each attempt is worth 1.5 marks net (0.8 x 2 minus 0.2 x 0.5), so 94 attempts projects about 140 marks. At 60% accuracy the same 94 attempts would only project about 94 marks.",
    ],
    [
      "Does SSC MTS have negative marking?",
      "Session I of SSC MTS has no negative marking, so every question should be attempted. Session II deducts 1 mark per wrong answer against 3 marks per correct answer, which puts the break-even accuracy at 25%.",
    ],
    [
      "How much time do I get per question in SSC CGL Tier 1?",
      "60 minutes for 100 questions works out to 36 seconds per question on average. In practice candidates bank time on General Awareness, where questions are recall-based, to fund the longer Quantitative Aptitude and Reasoning items.",
    ],
  ],
};

export default seo;
