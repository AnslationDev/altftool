const seo = {
  intro:
    "This tool ranks syllabus units by marks recoverable per study hour — recoverable = unit marks × (1 − readiness%), priority = recoverable ÷ hours needed — and then allocates your remaining hours greedily from the top. That is the value-density rule from the fractional knapsack problem, the provably efficient way to order work when time, not material, is the constraint. Built for the night-before and last-48-hours crunch before a university or board paper.",
  useCases: [
    "A student with 10 hours before a 70-mark paper deciding whether the 20-mark theory unit or the 18-mark numericals unit deserves the evening",
    "A repeater triaging five units at very different readiness levels to maximise expected marks rather than finishing the easiest unit first",
    "A study group splitting a syllabus the day before the exam, using the ranked table to agree what each person covers and what gets skipped",
  ],
  benefits: [
    ["Ranks by marks per hour", "High-mark, low-readiness, quick-to-study units float to the top — not just the scariest or biggest chapter."],
    ["Greedy hour allocation", "Your available hours are distributed down the ranking, showing full, partial and skip verdicts per unit."],
    ["Expected-gain estimate", "See roughly how many marks the plan captures out of everything still recoverable, before you start."],
  ],
  faqs: [
    [
      "Which unit should I study first when there is little time before the exam?",
      "The unit with the highest marks recoverable per hour: multiply the unit's paper marks by how unprepared you are (100% minus readiness), then divide by the hours it needs. A 20-mark unit you are 40% ready for that needs 5 hours scores 2.4 marks/hour, beating a 12-mark unit at 80% readiness needing 2 hours (1.2 marks/hour).",
    ],
    [
      "Is it better to skip a unit entirely or study everything a little?",
      "With very limited time, ranking by marks-per-hour and skipping the lowest-density units usually beats spreading thin, because the top units yield more marks for the same hours. The exception is a paper with compulsory questions from every unit — then give each unit a minimum pass over its highest-yield topics before returning to the ranking.",
    ],
    [
      "How do I estimate the hours a unit needs?",
      "Count the lectures or textbook pages the unit spans and convert at your own pace — a common rough rate is 1 hour per lecture of first-pass revision, plus problem practice for numerical units. If unsure, err higher for numerical units and lower for memorisation units, then adjust after your first session.",
    ],
    [
      "Does this tool guarantee the marks it predicts?",
      "No — the expected-gain figure assumes marks scale linearly with study hours, which real learning only approximates, and actual papers vary in question distribution. Use the ranking to decide order and cut-offs; treat the marks estimate as a planning number, not a prediction.",
    ],
  ],
};

export default seo;
