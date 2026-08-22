const seo = {
  title: "Percentage Calculator: Percent Of, Ratio & Change",
  metaDescription:
    "Three modes: what is X% of Y, X is what % of Y, and change from old to new. Each answer prints the formula behind it, with 10/25/50% alongside.",
  steps: [
    "Choose a mode: \"What is X% of Y?\", \"X is what % of Y?\" or \"Percentage change\".",
    "Type the two numbers — Percentage and Value, Part value and Whole value, or Old value and New value — and the answer updates as you type.",
    "Read the result with the formula it used, such as (new value - old value) / old value x 100, then press Copy report, or Download to save percentage-calculation-report.txt.",
  ],
  intro:
    "This percentage calculator answers the three questions that cover almost every percentage problem: what is X% of Y (X ÷ 100 × Y), X is what percent of Y (part ÷ whole × 100), and the percentage change from one value to another ((new − old) ÷ old × 100). Pick a mode, type two numbers, and the result updates as you type, with the formula shown underneath so you can check the working. Handy for shoppers checking a discount, students converting marks, and anyone comparing this month's figure with last month's.",
  useCases: [
    "A jacket is listed at 1,499 with 20% off — work out the discount amount and what you actually pay at the till",
    "You scored 82 out of 100 in one paper and 41 out of 60 in another, and want both as percentages to compare them fairly",
    "Revenue moved from 1,200 to 1,560 between two months and you need the growth figure to put in a report",
  ],
  benefits: [
    ["Three modes, one screen", "Percent-of, part-of-whole and change all use the same two inputs, so you never have to hunt for the right calculator."],
    ["Shows the formula it used", "Each result prints the exact expression behind it, so you can reproduce the answer by hand or in a spreadsheet."],
    ["Instant 10/25/50% reference", "A side panel breaks the same value into common fractions, useful for tips, deposits and quick sanity checks."],
  ],
  faqs: [
    [
      "How do I calculate a percentage of a number?",
      "Divide the percentage by 100, then multiply by the number: 18% of 1,000 is 0.18 × 1,000 = 180. The percent-of mode does this directly — enter 18 and 1,000 and it returns 180.",
    ],
    [
      "How do I work out what percentage one number is of another?",
      "Divide the part by the whole and multiply by 100: 41 out of 60 is 41 ÷ 60 × 100 = 68.33%. Use the 'X is what % of Y' mode, entering the part first and the whole second; if the whole is zero the result is undefined, so the calculator shows 0.",
    ],
    [
      "What is the difference between percentage change and percentage points?",
      "Percentage change is relative and percentage points are absolute. Going from 4% to 5% is a rise of 1 percentage point but a 25% increase, because (5 − 4) ÷ 4 × 100 = 25. This tool reports percentage change, calculated against the old value.",
    ],
    [
      "Why isn't a 20% drop cancelled out by a 20% rise?",
      "Because each percentage is applied to a different base. 100 falling 20% gives 80, and 80 rising 20% gives 96, not 100 — you would need a 25% rise to get back. Entering 100 and 96 in change mode confirms the net effect of −4%.",
    ],
  ],
};

export default seo;
