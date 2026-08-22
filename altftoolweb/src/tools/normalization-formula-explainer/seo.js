const seo = {
  title: "Exam Normalization Calculator: SSC, NTA & Z-Score",
  metaDescription:
    "Put your own marks through SSC linear equating, Z-score equating, the NTA percentile or min-max scaling, with every substitution shown as a step.",
  steps: [
    "Pick a Normalization method: SSC linear equating, Z-score equating, NTA percentile or Min-max scaling.",
    "Fill the fields that method needs — for SSC, 'Your raw marks (X)', your shift's mean, standard deviation and top 0.1% average, and the same three for all shifts.",
    "Every substitution appears as a numbered step, from the shift anchor and stretch factor to the normalized mark; 'Copy result' copies the worked steps.",
  ],
  intro:
    "Normalization is the arithmetic that makes marks from different exam shifts comparable, because no two question papers are exactly equally hard. This explainer runs your own figures through the four formulas that Indian exams actually use: the SSC two-point linear equating that maps a shift's mean-plus-standard-deviation point and top-0.1% average onto the all-shift equivalents, Z-score equating, the NTA percentile used by JEE Main and CUET, and plain min-max scaling. Every substitution is shown as a numbered step, so you can see where each figure lands rather than trusting a single output number.",
  useCases: [
    "Checking how your SSC CGL Tier-1 raw marks translate once the Commission publishes each shift's mean and top-0.1% average.",
    "Understanding why a JEE Main percentile of 99.1 is not the same as scoring 99.1% of the marks.",
    "Teaching a statistics class how a Z-score of 2.36 becomes a scaled mark on a different mean and standard deviation.",
  ],
  benefits: [
    [
      "The published formulas, unaltered",
      "SSC linear equating, Z-score equating, the NTA percentile definition and min-max scaling are implemented exactly as issued.",
    ],
    [
      "Every step visible",
      "Anchors, stretch factor and final substitution appear as separate lines, so an unexpected result can be traced to the input that caused it.",
    ],
    [
      "Guarded against nonsense",
      "A zero denominator, a zero standard deviation or a count larger than the session size return a plain explanation instead of an impossible number.",
    ],
  ],
  faqs: [
    [
      "What is the SSC normalization formula?",
      "SSC maps two reference points of a shift onto the all-shift equivalents: normalized marks = ((M̄t − M̄tg) ÷ (M̄i − M̄ig)) × (X − M̄ig) + M̄tg, where M̄t and M̄i are the average marks of the top 0.1% of candidates across all shifts and in your shift, M̄tg and M̄ig are the mean plus one standard deviation across all shifts and in your shift, and X is your raw mark. A harder shift produces a lower M̄i and M̄ig, which lifts the normalized mark.",
    ],
    [
      "How is the NTA percentile calculated?",
      "NTA score = 100 × (number of candidates in your session who scored equal to or less than you) ÷ (total candidates who appeared in that session). It is a rank position within one session, not a percentage of marks, which is why the topper of every session gets exactly 100 and why a percentile of 99 with 300,000 candidates still leaves roughly 3,000 people ahead.",
    ],
    [
      "What is the difference between a Z-score and a percentile?",
      "A Z-score says how many standard deviations your mark sits from the mean — (X − mean) ÷ standard deviation — while a percentile says what share of candidates you beat. They are only interchangeable if the marks follow a normal curve; on that assumption a Z of 1.96 corresponds to the 97.5th percentile.",
    ],
    [
      "Does normalization always increase my marks?",
      "No. It raises marks in a shift that was harder than the exam average and lowers them in a shift that was easier, which is the whole point of the exercise. If your shift's statistics match the all-shift statistics, the normalized mark comes out close to the raw mark. The shift statistics are published by the conducting body after the exam, so any figure worked out before then is an estimate.",
    ],
  ],
};

export default seo;
