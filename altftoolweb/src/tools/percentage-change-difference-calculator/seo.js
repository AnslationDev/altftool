const seo = {
  title: "Percentage Change vs Difference Calculator, 6 Modes",
  metaDescription:
    "Percentage change divides by the old value, percentage difference by the average — two answers for one pair. Plus percent of, what percent and pp.",
  steps: [
    "Under 'What do you want to work out?' choose Percentage change, Percentage difference, Percent of a number, X is what percent of Y, Increase or decrease by, or Percentage points.",
    "Fill the two fields the mode relabels — 'Old value (baseline)' and 'New value' for change, 'First percentage (%)' and 'Second percentage (%)' for points.",
    "Read the headline figure with its supporting rows, such as absolute change, multiplier and the reverse change needed to undo it, then press Copy result.",
  ],
  intro:
    "Percentage change measures a before-and-after move as (new − old) ÷ |old| × 100, while percentage difference compares two values with no baseline as |a − b| ÷ their average × 100 — two different formulas that give two different answers for the same pair of numbers. This calculator covers both, plus percent of a number, X is what percent of Y, applying an increase or decrease, and the percentage-point gap between two rates. Each result is shown with the formula that produced it, so the answer can be checked rather than trusted.",
  useCases: [
    "Checking whether revenue that moved from 80 lakh to 1 crore grew 25% or 22.2%, and which framing is correct",
    "Working out the discount percentage implied by a price drop, and the exact increase needed to undo it",
    "Separating a 15 percentage point rise in a rate from the 33% relative increase it represents before quoting it",
  ],
  benefits: [
    ["Six calculations, one page", "Change, difference, percent of, what percent, apply a change and percentage points."],
    ["Formula shown with the answer", "Every result displays the expression used, so it can be verified by hand."],
    ["Handles the awkward cases", "Zero baselines, negative values and reverse changes return a plain explanation, never a bad number."],
  ],
  faqs: [
    [
      "How do you calculate percentage change?",
      "Subtract the old value from the new value, divide by the absolute value of the old value, and multiply by 100. Going from 80 to 100 gives (100 − 80) ÷ 80 × 100 = 25% increase; going from 100 to 80 gives (80 − 100) ÷ 100 × 100 = 20% decrease. The two are different because the baseline changes.",
    ],
    [
      "What is the difference between percentage change and percentage difference?",
      "Percentage change is directional and divides by the starting value, so it needs a clear before and after. Percentage difference is symmetric and divides by the average of the two values, giving the same answer whichever order you write them: 80 and 100 differ by 20 ÷ 90 × 100 = 22.22%. Use change for growth over time and difference for two independent measurements.",
    ],
    [
      "Why does a 20% decrease need a 25% increase to reverse it?",
      "Because each percentage is measured against a different base. Cutting 100 by 20% leaves 80, and to get from 80 back to 100 you need to add 20, which is 20 ÷ 80 = 25% of the new, smaller base. The general rule for reversing a change of p percent is 100p ÷ (100 − p) percent in the opposite direction.",
    ],
    [
      "What is the difference between percent and percentage points?",
      "Percentage points measure the arithmetic gap between two percentages, while percent measures the relative change between them. An interest rate moving from 45% to 60% has risen 15 percentage points and 33.33% relatively. Saying it rose 15% would be wrong, and the ambiguity is why financial and statistical writing always specifies percentage points, often abbreviated to pp or bps for basis points where one basis point is 0.01 percentage points.",
    ],
  ],
};

export default seo;
