const seo = {
  title: "Child Education Corpus Planner - Monthly SIP Size",
  metaDescription:
    "Inflates each degree year separately, discounts to course start, subtracts existing savings and sizes the monthly SIP - flat or annual step-up.",
  steps: [
    "Enter \"Cost of one year today (₹)\", \"Years until the course starts\", \"Course duration (years)\", \"Fee inflation (% per year)\" and \"Expected return on savings (% per year)\".",
    "Add anything under \"Already saved for this goal (₹)\" and an optional \"Annual SIP step-up (% per year)\".",
    "Read \"Monthly SIP required\" with the corpus needed on day one and the fee-due-in-each-course-year table, then click \"Copy result\".",
  ],
  intro:
    "This planner converts today's college fee into the corpus you must actually hold on the first day of the course, then works out the monthly SIP that gets you there. Each year of the degree is inflated separately at your chosen fee-inflation rate and discounted back to the course start date at your expected return, because money left in the fund keeps earning while the course runs. It also rolls forward what you have already set aside and supports an annual step-up in the SIP amount.",
  useCases: [
    "Your child is eight and you want the monthly amount that funds a four-year engineering degree starting in ten years.",
    "You already hold ₹20 lakh in an earmarked fund and want to check whether any further saving is needed at all.",
    "Comparing a flat SIP against a 10%-a-year step-up SIP to see how much lower the starting instalment can be.",
  ],
  benefits: [
    ["Corpus, not a single fee", "A four-year degree is four separate inflated bills, so the target is the present value of all of them at course start."],
    ["Existing savings counted", "Money already earmarked is compounded to the goal date and subtracted before the SIP is sized."],
    ["Step-up modelled exactly", "The step-up SIP is rolled forward month by month rather than approximated, so the first instalment is accurate."],
  ],
  faqs: [
    [
      "How much will a degree cost in 10 years?",
      "Multiply today's annual fee by (1 + fee inflation) raised to the number of years. At 8% inflation a ₹5 lakh annual fee becomes about ₹10.8 lakh in year one of the course, and a four-year degree costs roughly ₹48.6 lakh in nominal terms against ₹20 lakh today.",
    ],
    [
      "What education inflation rate should I use?",
      "Use the fee history of the specific institution rather than a generic figure — private professional colleges have historically raised fees faster than headline CPI inflation. If you have no data, plan on a rate above general inflation and revisit the number every two or three years.",
    ],
    [
      "Do I need the whole amount saved before the course starts?",
      "No. You need the present value at course start of every year's fee, which is less than the nominal total because the balance keeps earning through the course. In the example above, roughly ₹42 lakh at course start funds ₹48.6 lakh of nominal fees at a 10% return.",
    ],
    [
      "Is a step-up SIP better than a flat SIP?",
      "It lowers the starting instalment, which matters when the goal is far away and your income is still growing. A 10% annual step-up can cut the first instalment by around a third versus a flat SIP for the same target, but the final year's instalment is much higher — check it against your expected income. This is general information, not investment advice.",
    ],
  ],
};

export default seo;
