const seo = {
  title: "Credit Score Impact Simulator: 300-900, Before/After",
  metaDescription:
    "Model a card payoff, extra loan applications or a missed EMI on the 300-900 bureau scale, weighted by the five factors bureaus disclose.",
  steps: [
    "Fill in Your credit profile today: total credit card limit and current outstanding balance, missed payments in the last 24 months, worst delinquency on record, age of your oldest credit account, hard enquiries in the last 12 months, and your card and loan counts.",
    "Under What you are planning to change, set the balance after the change — or tap Take utilisation to 0%, 10%, 30% or 50% — plus new loan or card applications and payments you expect to miss.",
    "Read the Estimated score movement in points, the Today and After the change cards on the 300-900 scale with their bands, and the Where the points come from table scoring each of the five factors out of 100.",
  ],
  intro:
    "This Credit Score Impact Simulator estimates how a specific change — paying a credit card down, applying for two more loans, or missing an EMI — could move your score on the 300–900 scale used by Indian bureaus. It weights five factors using the widely cited FICO-style breakdown — payment history at roughly 35%, credit utilisation 30%, length of credit history 15%, credit mix 10% and new credit or hard enquiries 10% — used here as an illustrative proxy, since Indian bureaus do not publish their own exact scoring weights. The result is an educational estimate for planning, not a reproduction of any bureau's proprietary model.",
  useCases: [
    "Checking whether clearing INR 60,000 of card balance before applying for a home loan is worth doing first.",
    "Seeing the likely cost of three loan applications in one month versus spacing them out.",
    "Understanding how much a single 30-day-late payment could set back a score that is currently in the 'very good' band.",
  ],
  benefits: [
    ["Before and after view", "Two scores side by side with the point movement between them."],
    ["Factor breakdown", "See which of the five bureau factors is actually holding your score down."],
    ["FICO-style weighting", "Built on the widely cited FICO factor breakdown used as an industry proxy, not invented numbers — bureaus themselves do not publish exact weights."],
  ],
  faqs: [
    [
      "What is a good credit score in India?",
      "On the 300–900 CIBIL scale, this tool treats 800 and above as excellent and 750–799 as very good — both bands get the best loan pricing — 650–749 as good, 550–649 as fair, and below 550 as poor. Lenders set their own cut-offs.",
    ],
    [
      "How much does credit utilisation affect a score?",
      "Utilisation is roughly 30% of the score and is the fastest lever, because it is recalculated every statement cycle. Keeping usage under 30% of your total limit is the widely cited guideline.",
    ],
    [
      "Do loan enquiries lower a credit score?",
      "Hard enquiries — where a lender pulls your report for an application — carry about 10% weight. One enquiry barely registers; several within a few months signal credit hunger and can cost a noticeable number of points. Checking your own score is a soft enquiry and does not hurt it.",
    ],
    [
      "How long does a missed payment stay on my report?",
      "Late payments and defaults typically remain visible on Indian bureau reports for around 36 months of payment history, and settled or written-off accounts stay much longer. This tool is informational only and does not constitute financial advice.",
    ],
  ],
};

export default seo;
