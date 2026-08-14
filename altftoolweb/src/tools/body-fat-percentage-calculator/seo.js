const seo = {
  title: "US Navy Body Fat Calculator (Tape Measure Method)",
  metaDescription:
    "Estimate body fat from height, neck and waist (plus hip for women) using the Hodgdon-Beckett equation, with ACE bands and your waist-to-height ratio.",
  steps: [
    "Set \"Sex (for the formula)\" to Male or Female and pick Units — Metric (cm/kg) or Imperial (in/lb) — then enter Height, Neck and Waist, with the extra Hip field the female formula needs.",
    "Add the optional Weight so the result can be split into fat mass and lean body mass; every figure recalculates as you type, and Reset restores the defaults.",
    "\"Estimated body fat\" gives the percentage and its ACE category, with Fat mass, Lean body mass, a Waist-to-height ratio marked healthy below 0.50 or elevated above it, and the ACE reference ranges for your sex; \"Copy result\" copies the summary.",
  ],
  "intro": "US Navy Body Fat Calculator uses the US Navy (Hodgdon-Beckett) circumference method: height, neck and waist for men, plus hip for women. It returns your estimated body fat percentage, places it on the American Council on Exercise reference bands, and — if you add your weight — splits that into fat mass and lean body mass. It also reports your waist-to-height ratio, a simple screen where under 0.5 is the usual target. Useful for anyone tracking a cut, a bulk or a fitness test with nothing but a tape measure.",
  "useCases": [
    "Track body composition month to month when the scale is not moving but your waist is shrinking.",
    "Check where you sit against the athletic, fitness and average bands before starting a training block.",
    "Estimate lean mass so you can set a protein target or a realistic rate of fat loss."
  ],
  "benefits": [
    [
      "No equipment beyond a tape",
      "The Navy method needs only circumference measurements — no calipers, no scales, no clinic visit."
    ],
    [
      "Metric and imperial",
      "Enter centimetres and kilograms or inches and pounds; the conversion is handled for you."
    ],
    [
      "Context, not just a number",
      "The result is mapped to ACE reference ranges and paired with your waist-to-height ratio."
    ]
  ],
  "faqs": [
    [
      "How accurate is the US Navy body fat method?",
      "Studies generally put it within about 3-4 percentage points of a DEXA scan for average builds, with larger errors for very lean or very heavy people. It is best used to track change over time rather than as an exact figure."
    ],
    [
      "Where exactly do I measure?",
      "Neck just below the larynx with the tape sloping slightly down at the front; waist at the navel for men and at the narrowest point for women; hip at the widest point. Keep the tape snug but not compressing, and measure after breathing out normally."
    ],
    [
      "What is a healthy body fat percentage?",
      "ACE lists roughly 14-17% (fitness) and 18-24% (average) for men, and 21-24% and 25-31% for women; essential fat is about 2-5% for men and 10-13% for women. These are general references, not a diagnosis."
    ],
    [
      "Why does the formula ask for sex?",
      "The Navy equation was fitted separately for men and women because fat distribution differs, which is also why the female version includes the hip measurement."
    ]
  ]
};

export default seo;
