const seo = {
  title: "Weighted Average Calculator with Per-Item Contribution",
  metaDescription:
    "Enter value and weight pairs to get the weighted mean — weights need not total 100 — with each item's contribution and the plain average alongside.",
  steps: [
    "Type a Value and Weight into each item row — grade components, holdings or ratings; weights need not total 100.",
    "Click Add item for more rows or Remove to drop one; the result recalculates as you type.",
    "Read the weighted average with each item's contribution and share of total weight, plus the unweighted mean, then click Copy result.",
  ],
  "intro": "Weighted Average Calculator computes the weighted mean of any set of value and weight pairs: it multiplies each value by its weight, adds those products, and divides by the total weight. Weights do not have to add up to 100 or 1 — they are normalised automatically — and each row shows how much it contributes to the final number. Handy for course grades with different component weights, portfolio returns, survey scores and any average where some items simply matter more than others.",
  "useCases": [
    "Combine assignment, mid-term and final exam scores that carry 20%, 30% and 50% of a course grade.",
    "Work out a blended interest rate or portfolio return where each holding has a different amount invested.",
    "Average customer ratings where each product has a different number of reviews behind it."
  ],
  "benefits": [
    [
      "Weights need not total 100",
      "Enter credit hours, rupee amounts or raw counts as weights and the tool normalises them for you."
    ],
    [
      "Per-item contribution",
      "Each row shows the points it adds to the result and its share of total weight, so outliers are easy to spot."
    ],
    [
      "Weighted vs plain mean",
      "The unweighted average is shown alongside, making the effect of weighting immediately visible."
    ]
  ],
  "faqs": [
    [
      "How do you calculate a weighted average?",
      "Multiply each value by its weight, add all those products, then divide by the sum of the weights. For scores of 88, 74 and 81 with weights 20, 30 and 50 the result is (1760 + 2220 + 4050) / 100 = 80.3."
    ],
    [
      "Do the weights have to add up to 100?",
      "No. Dividing by the sum of the weights normalises them, so 2, 3 and 5 give exactly the same answer as 20, 30 and 50."
    ],
    [
      "When is a weighted average better than a simple average?",
      "Whenever the items are not equally important or not equally sized — course components with different marks, holdings with different amounts invested, or averages of averages built from different sample sizes."
    ],
    [
      "Can a weight be zero or negative?",
      "A zero weight simply excludes that item. Negative weights are rejected here because they can produce a mean outside the range of your data, which is almost never what you want."
    ]
  ]
};

export default seo;
