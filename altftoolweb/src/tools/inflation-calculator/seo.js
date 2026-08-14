const seo = {
  title: "Inflation Calculator: Future Cost & Real Return",
  metaDescription:
    "Compound a rupee amount at 6-12% with FV = P x (1 + r)^n, reverse it for purchasing power, and the pre-tax return needed to beat inflation at your slab.",
  steps: [
    "Pick a mode — Future cost, Purchasing power or Required return — then enter Today's cost (₹) and Years ahead, or in Required return mode your income-tax slab and current FD rate.",
    "Set the Inflation rate (% per year), or tap a preset: India CPI ~6%, Lifestyle 8%, Education 10% or Healthcare 12%.",
    "Read the headline figure with the Year / Projected cost / Rise vs today table, then use Copy summary or Download to save inflation-impact-summary.txt.",
  ],
  intro:
    "Inflation Purchasing Power Calculator compounds a rupee amount forward at your chosen inflation rate using FV = P x (1 + r)^n, and runs the same formula in reverse to show what today's cash will actually buy after n years. It also answers the return question: the pre-tax return you need to stay level is your inflation rate divided by (1 minus your tax rate), and it applies the Fisher relation to tell you whether a fixed deposit is really gaining ground once tax and inflation are both taken out. Rate presets cover India CPI at 6%, lifestyle at 8%, education at 10% and healthcare at 12%.",
  useCases: [
    "Your child starts college in 15 years and the course costs Rs 12 lakh today — set education inflation to 10% to see the number you are actually saving toward, not the brochure price.",
    "You are sitting on Rs 20 lakh in a fixed deposit at 7% and want to know whether it is growing or quietly shrinking; enter your slab and the tool shows the post-tax return against inflation.",
    "Planning retirement spending and needing the honest figure: switch to purchasing power mode to see what a fixed monthly amount buys in 20 years at 6% versus today.",
  ],
  benefits: [
    ["Answers the return question, not just the price question", "It works out the pre-tax return you need to break even against inflation at your own slab, which is the number most inflation calculators never show."],
    ["Tax is built into the comparison", "Fixed-deposit interest is taxed at slab and equity gains at a lower long-term rate, and both are compared on a post-tax, post-inflation basis rather than headline yield."],
    ["Year-by-year table, not a single figure", "Every year from 1 to your horizon is listed with the cost and the cumulative rise, so you can see when a target crosses a threshold."],
  ],
  faqs: [
    [
      "How do I calculate the future cost of something with inflation?",
      "Multiply today's price by (1 + inflation rate)^number of years. At 6% inflation, Rs 1,00,000 becomes about Rs 1,79,000 in 10 years and about Rs 3,21,000 in 20 — the compounding, not the annual rate, is what makes the gap large.",
    ],
    [
      "What return do I need to beat inflation after tax?",
      "Divide your inflation rate by (1 minus your marginal tax rate). At 6% inflation in the 30% slab, you need about 8.6% pre-tax just to stand still, which is why an FD at 7% loses purchasing power for a top-slab taxpayer.",
    ],
    [
      "How long until prices double at the current inflation rate?",
      "Divide 72 by the inflation rate — the rule of 72. At 6% prices double in roughly 12 years, at 8% in about 9 years, and at 12% healthcare inflation in about 6 years.",
    ],
    [
      "Which inflation rate should I use for planning?",
      "Use a category rate rather than headline CPI, because the things you are saving for rarely inflate at the average. India's headline CPI has run around 6%, while school and college fees and hospital costs have historically risen faster — the presets here use 10% for education and 12% for healthcare. These are planning assumptions for information only; talk to a registered financial adviser before committing to a long-term plan.",
    ],
  ],
};

export default seo;
