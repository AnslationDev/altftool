const seo = {
  intro:
    "A SIP top-up raises your monthly instalment by a fixed percentage every twelve months, and this calculator projects what that yearly increase does to the final corpus, the total invested and the date you reach a goal. It compounds each instalment at a nominal monthly rate of the expected annual return divided by twelve, debiting at the start of the month, which is the annuity-due convention used by the standard AMFI and fund-house SIP calculators. Useful when your salary rises each year and you want to size the increase against a target rather than guess it.",
  useCases: [
    "Testing whether a 10% yearly top-up on a Rs 10,000 SIP is enough to reach Rs 50 lakh, instead of raising the base instalment straight away.",
    "Comparing the corpus from a flat SIP against the same SIP with a 5%, 10% or 15% annual step-up over a 10 to 20 year horizon.",
    "Working out how many months earlier a retirement or house-deposit goal arrives once the yearly increase is switched on.",
  ],
  benefits: [
    [
      "Side-by-side with a flat SIP",
      "Every projection also runs the same instalment with no top-up, so the extra corpus and extra outlay are both visible.",
    ],
    [
      "Goal date, not just a number",
      "Enter a target and see the months needed with and without the top-up, and the difference between them.",
    ],
    [
      "Year-by-year table",
      "Shows the instalment for each year, what was put in and the closing balance, so the compounding is auditable.",
    ],
  ],
  faqs: [
    [
      "How much difference does a 10% SIP top-up actually make?",
      "On a Rs 10,000 monthly SIP for 10 years at 12% a year, a 10% annual top-up grows the corpus from about Rs 23.2 lakh to about Rs 33.7 lakh. That comes from investing roughly Rs 19.1 lakh instead of Rs 12 lakh, with the last instalment reaching about Rs 23,600 a month.",
    ],
    [
      "When does the SIP top-up first apply?",
      "With the standard annual step-up facility the increase applies from the 13th instalment and again every twelve instalments after that, so the first year runs at the base amount. Most AMCs let you set the step-up as a fixed percentage or a fixed rupee amount when you register the mandate.",
    ],
    [
      "Is a top-up SIP better than simply starting with a bigger SIP?",
      "Starting bigger builds more corpus for the same end-instalment because the early money compounds longest, but a top-up matches the outflow to a rising salary, which is why people stick with it. If you can comfortably afford the higher amount today, the flat higher SIP wins on pure arithmetic.",
    ],
    [
      "Can I stop or change the top-up later?",
      "Yes. The step-up is part of the SIP mandate and can be cancelled or modified by submitting a fresh instruction to the AMC or registrar, usually with 15 to 30 days of notice before the next debit date. The units already bought are unaffected.",
    ],
  ],
};

export default seo;
