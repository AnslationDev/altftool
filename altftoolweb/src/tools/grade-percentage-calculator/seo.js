const seo = {
  title: "Grade Percentage Calculator for Marks and Weightings",
  metaDescription:
    "Find what a percentage of a total comes to — 15% of 200 is 30 — plus the value with that amount added and subtracted, for weightings and grace marks.",
  intro:
    "This calculator works out what a given percentage of a number comes to — (percent ÷ 100) × value — and at the same time shows that value increased and decreased by the same amount. Enter 15 and 200 and it returns 30, along with 230 and 170, so a weighting, a bonus and a deduction are all visible in one result. It is aimed at students and teachers converting mark weightings, grace marks and score adjustments without setting up a spreadsheet.",
  useCases: [
    "An assignment is worth 15% of a 200-mark paper and you need the actual marks it carries before deciding how much time to spend on it.",
    "Your school announced 5% grace marks on a 350-mark total and you want both the grace amount and the revised total in one step.",
    "A moderator cut every score by 8% and you need the post-moderation figure for a 76-mark paper without doing two separate calculations.",
  ],
  benefits: [
    [
      "Three answers from one entry",
      "The percentage amount, the value plus that amount and the value minus it appear together, so mark-ups and mark-downs need no second calculation.",
    ],
    [
      "Recalculates as you type",
      "Change either the percentage or the base number and every figure updates immediately, which makes comparing weightings fast.",
    ],
    [
      "Readable formatting on large totals",
      "Results are grouped with thousands separators and capped at two decimals, so a five-figure total stays legible instead of running together.",
    ],
  ],
  faqs: [
    [
      "How do I calculate a percentage of a number?",
      "Divide the percentage by 100 and multiply by the number: 15% of 200 is (15 ÷ 100) × 200 = 30. That is exactly the arithmetic this tool runs, and it also reports 200 + 30 = 230 and 200 − 30 = 170.",
    ],
    [
      "How do I turn my marks into a percentage grade?",
      "Divide the marks you scored by the total marks and multiply by 100 — 68 out of 80 is (68 ÷ 80) × 100 = 85%. This tool does the reverse operation, taking a percentage and a total and returning the marks, so use it when you know the weighting and want the mark value.",
    ],
    [
      "What is the difference between a percentage and a percentage point?",
      "A percentage change is relative to the starting value, a percentage point is an absolute difference. A grade moving from 60% to 63% has risen 3 percentage points but only 5% in relative terms, because 3 ÷ 60 = 5%. Mixing the two is the most common error in grade discussions.",
    ],
    [
      "Can I use it to add or subtract a percentage, like grace marks or a penalty?",
      "Yes — that is what the two extra rows are for. Entering the percentage and the base value gives you the adjusted totals directly, so a 10% late penalty on a 45-mark submission shows both the 4.5 deduction and the 40.5 result without a second entry.",
    ],
  ],
};

export default seo;
