const seo = {
  intro:
    "This visualiser plots the balance of a lump sum plus a monthly contribution against the same money earning simple interest, so the widening gap between the two lines is the interest earned on interest. It works month by month using the effective monthly rate (1 + r/m)^(m/12) - 1, which handles annual, half-yearly, quarterly, monthly and daily compounding correctly alongside a monthly deposit. It also reports the effective annual rate, the exact doubling period from ln 2 / ln(1 + EAR), and the year in which interest earned overtakes everything you have paid in.",
  useCases: [
    "Showing a first-time investor why starting a Rs 5,000 SIP at 25 rather than 35 changes the outcome more than picking a better fund does.",
    "Comparing a deposit compounded quarterly with one compounded annually at the same headline rate, to see what the effective rate really is.",
    "Teaching the difference between simple and compound interest with a chart rather than two formulas on a board.",
  ],
  benefits: [
    ["Both curves on one chart", "The compound line, the simple-interest line and the money you paid in, drawn to the same scale."],
    ["Any compounding frequency", "Annual through daily, with the effective annual rate stated so the headline rate stops being misleading."],
    ["Names the crossover", "Reports the year in which accumulated interest first exceeds total contributions."],
  ],
  faqs: [
    [
      "What is the formula for compound interest?",
      "A = P (1 + r/m)^(mt), where P is the principal, r the nominal annual rate as a decimal, m the number of compounding periods a year and t the years. Rs 1,00,000 at 10% compounded annually for 10 years gives Rs 2,59,374 against Rs 2,00,000 at simple interest — the Rs 59,374 difference is interest earned on interest.",
    ],
    [
      "How is compound interest different from simple interest?",
      "Simple interest is charged only on the original principal, so it adds the same amount every year and plots as a straight line. Compound interest is charged on the principal plus the interest already added, so the balance curves upward and the gap between the two grows faster the longer the period runs.",
    ],
    [
      "Does compounding frequency really matter?",
      "It matters, but less than the rate or the time. A 10% nominal rate compounded annually gives an effective 10%; compounded monthly it gives 10.47%, and daily 10.52%. Doubling the years, by contrast, roughly squares the growth multiple.",
    ],
    [
      "How long does money take to double at a given return?",
      "Divide 72 by the annual return in per cent for a quick estimate — 72/12 gives 6 years at 12%. The exact answer is ln 2 divided by ln(1 + effective annual rate), which at 12% is 6.12 years, so the shortcut is close for rates between roughly 4% and 15%.",
    ],
  ],
};

export default seo;
