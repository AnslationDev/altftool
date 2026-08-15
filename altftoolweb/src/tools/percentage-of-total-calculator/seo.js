const seo = {
  title: "Percentage of Total Calculator — Part, Percent, Whole",
  metaDescription:
    "Solve X is what % of Y, what is X% of Y, and X is Y% of what — with the remainder shown in amount and percent, and zero-total errors explained.",
  steps: [
    "Pick a mode: 'X is what % of Y?', 'What is X% of Y?' or 'X is Y% of what?'.",
    "Fill the two known fields — 'Part (the smaller number)', 'Percentage (%)' or 'Total (the whole)'; thousands separators and stray spaces are tolerated.",
    "Read the headline answer with the remaining amount, remaining percentage and the formula used, then click 'Copy result'.",
  ],
  "intro": "The Percentage of Total Calculator answers the question \"X is what percent of Y?\" and shows the remainder alongside it, so you see both the share and what is left. Two reverse modes cover the other unknowns: what a given percentage of a total comes to, and what total a known part represents a given percentage of. It suits marks out of a maximum, spend against a budget, one line item inside a larger figure, or any share-of-whole check.",
  "useCases": [
    "Convert a score of 45 out of 180 into a percentage for a mark sheet or report card.",
    "See what share of a Rs 60,000 monthly budget a Rs 21,000 rent payment takes up, and how much is left.",
    "Reverse-engineer a total: if a Rs 4,500 deposit was 15% of the price, work out the full price."
  ],
  "benefits": [
    [
      "Three lookups in one place",
      "Solve for the percentage, the part, or the total without switching tools or rearranging the formula yourself."
    ],
    [
      "Remainder shown too",
      "Every result includes what is left over in both absolute and percentage terms, which is usually the follow-up question."
    ],
    [
      "Safe with edge cases",
      "A zero total or a zero percentage is flagged with a plain explanation instead of returning Infinity or NaN."
    ]
  ],
  "faqs": [
    [
      "How do I calculate what percent one number is of another?",
      "Divide the part by the total and multiply by 100. For example 45 / 180 x 100 = 25%, so 45 is 25% of 180."
    ],
    [
      "How do I find the total when I only know the part and its percentage?",
      "Divide the part by the percentage and multiply by 100. If 4,500 is 15% of the total, then 4,500 / 15 x 100 = 30,000."
    ],
    [
      "Can the answer be more than 100%?",
      "Yes. If the part is larger than the total the percentage exceeds 100, which is correct and common when comparing an actual figure against a target. The progress bar simply caps at full."
    ],
    [
      "Why can the total not be zero?",
      "Because the calculation divides by the total, and division by zero is undefined. If your whole is genuinely zero, there is no meaningful share to express as a percentage."
    ]
  ]
};

export default seo;
