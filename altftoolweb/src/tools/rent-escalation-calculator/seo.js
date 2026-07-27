const seo = {
  intro:
    "This calculator projects what a lease actually costs when rent escalates, applying the compounding formula rent = base x (1 + escalation) ^ number of steps rather than adding the percentage to the base each time. Give it the starting rent, the escalation percentage, how often it applies and the lease length, and it returns the rent for every step, the total outgo, the average monthly rent and the true annualised escalation rate. It is useful to tenants comparing offers and to landlords pricing a multi-year lease.",
  useCases: [
    "Comparing a 5% every 11 months clause against 8% yearly on the same starting rent over three years.",
    "Working out the total rent commitment on a 33-month lease before signing, including every step-up.",
    "Showing a landlord that three 5% steps put rent 15.76% above the base, not 15%.",
  ],
  benefits: [
    ["Compounding, not addition", "Each step is applied to the previous rent, matching how escalation clauses are normally drafted."],
    ["True annual rate", "Converts an 11-month or 24-month cycle into the equivalent yearly rate so offers compare fairly."],
    ["Cost of the clause", "Separates out how much of the total outgo is caused by escalation rather than the base rent."],
  ],
  faqs: [
    [
      "How is rent escalation calculated?",
      "Multiply the current rent by one plus the escalation rate at each step: rent = base x (1 + rate) raised to the number of steps completed. On Rs 25,000 with 5% yearly, year two is Rs 26,250 and year three is Rs 27,562.50, so rent is 10.25% above the base after two steps rather than 10%.",
    ],
    [
      "Why are Indian rent agreements for 11 months?",
      "Section 17(1)(d) of the Registration Act, 1908 makes a lease from year to year, or for a term exceeding one year, compulsorily registrable, with stamp duty to match. An eleven-month agreement stays outside that requirement, which is why escalation is so often set on an 11-month cycle.",
    ],
    [
      "Is a 5% increase every 11 months the same as 5% a year?",
      "No. Twelve months divided by eleven means the step happens about 1.09 times a year, so the effective annual rate is 1.05 raised to the power 12/11 minus 1, which is roughly 5.47% a year. Over a long tenancy that gap compounds noticeably.",
    ],
    [
      "Can a landlord increase rent whenever they want?",
      "Not usually — the increase is governed by the escalation clause in the agreement, and any change outside it needs the tenant's consent or a fresh agreement. Several states also have rent control or tenancy legislation limiting increases and requiring notice, so check the law that applies to your property and take legal advice for a disputed increase.",
    ],
  ],
};

export default seo;
