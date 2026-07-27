const seo = {
  "intro": "The Percentage Increase Decrease Calculator compares two numbers and tells you the percentage change between them, clearly labelled as an increase or a decrease, alongside the plain difference and the multiplier. A second mode goes the other way: give it a starting value and a percentage and it applies the rise or cut for you. It is built for the everyday cases — a price change, a salary revision, a month-on-month traffic swing, a marks comparison.",
  "useCases": [
    "Work out that a rent rise from Rs 18,000 to Rs 21,500 is a 19.44% increase.",
    "Check how far a stock, weight, or website metric has fallen from its previous figure in percentage terms.",
    "Apply a 12% hike or a 25% discount to a price without doing the arithmetic by hand."
  ],
  "benefits": [
    [
      "Direction stated explicitly",
      "The result is labelled increase, decrease, or no change, so a negative sign is never misread."
    ],
    [
      "Difference and multiplier too",
      "You get the raw difference and the multiplier (such as 1.24x) next to the percentage, which is often the number you actually need."
    ],
    [
      "Handles the awkward cases",
      "Zero starting values, negative numbers, and the non-symmetry of a rise versus a fall are all handled rather than silently producing nonsense."
    ]
  ],
  "faqs": [
    [
      "What is the percentage increase formula?",
      "((new value - original value) / original value) x 100. A positive answer is an increase and a negative answer is a decrease; this tool uses the absolute value of the original so negative starting figures still give a sensible sign."
    ],
    [
      "Why does a 50% increase followed by a 50% decrease not return me to the start?",
      "Because each percentage applies to a different base. 100 up 50% is 150, and 50% of 150 is 75, so you end at 75. To reverse a 50% increase you need a 33.33% decrease, which the reverse-change row shows."
    ],
    [
      "What if the original value is zero?",
      "Percentage change from zero is mathematically undefined, since any rise from nothing is infinite in percentage terms. The calculator flags this and suggests using the absolute difference instead."
    ],
    [
      "What is the difference between percentage change and percentage points?",
      "If a rate moves from 4% to 5%, that is a 1 percentage point rise but a 25% increase. Use this calculator for the percentage change; subtract directly for percentage points."
    ]
  ]
};

export default seo;
