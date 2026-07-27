const seo = {
  intro:
    "This comparator runs the same principal, rate and period through both interest formulas — simple interest as P(1 + rt) and compound interest as P(1 + r/m)^(mt) — and reports the rupee gap between them. It supports annual, half-yearly, quarterly, monthly and daily compounding, states the effective annual rate that each frequency produces, and gives the exact doubling period under each method: 1/r for simple interest and ln 2 / ln(1 + EAR) for compound.",
  useCases: [
    "Checking whether a cumulative fixed deposit that compounds quarterly genuinely beats a non-cumulative one paying simple interest at the same rate.",
    "Showing a student why Rs 1,00,000 at 10% for 10 years matures at Rs 2,00,000 one way and Rs 2,59,374 the other.",
    "Working out what a lender's compounding frequency is really costing when two loans quote the same headline rate.",
  ],
  benefits: [
    ["Both formulas, one screen", "Maturity value and interest earned side by side, plus the exact difference."],
    ["Frequency matters", "Choose annual to daily compounding and see the effective annual rate it produces."],
    ["Year-by-year table", "The gap for every year, so you can see when compounding starts to matter."],
  ],
  faqs: [
    [
      "What is the difference between simple and compound interest?",
      "Simple interest is calculated only on the original principal, so it adds the same amount every year. Compound interest is calculated on the principal plus the interest already credited, so each year's interest is larger than the last. On Rs 1,00,000 at 10% for 10 years the difference is Rs 59,374 — Rs 2,00,000 against Rs 2,59,374.",
    ],
    [
      "What is the formula for simple and compound interest?",
      "Simple interest is SI = P x r x t, giving a maturity value of P(1 + rt). Compound interest gives A = P(1 + r/m)^(mt), where m is the number of times a year the interest is added. Set m = 1 and the two differ only by the interest that compounding earns on earlier interest.",
    ],
    [
      "Is compound interest always better than simple interest?",
      "For a saver, yes, once at least one compounding period has passed. Inside the first period compound interest is fractionally behind, because (1 + r)^t is less than 1 + rt when t is under one year. For a borrower the position reverses — a compounding loan costs more than a simple-interest one at the same rate.",
    ],
    [
      "How long does it take to double money under each method?",
      "At simple interest the answer is exactly 1/r years, so 10 years at 10% and 20 years at 5%. At compound interest it is ln 2 divided by ln(1 + effective annual rate), which at 10% compounded annually is 7.27 years — nearly three years sooner.",
    ],
  ],
};

export default seo;
