const seo = {
  intro:
    "This Credit Score Impact Simulator estimates how a specific change — paying a credit card down, applying for two more loans, or missing an EMI — could move your score on the 300–900 scale used by Indian bureaus. It weights the five factors bureaus publicly disclose: payment history at roughly 35%, credit utilisation 30%, length of credit history 15%, credit mix 10% and new credit or hard enquiries 10%. The result is an educational estimate for planning, not a reproduction of any bureau's proprietary model.",
  useCases: [
    "Checking whether clearing INR 60,000 of card balance before applying for a home loan is worth doing first.",
    "Seeing the likely cost of three loan applications in one month versus spacing them out.",
    "Understanding how much a single 30-day-late payment could set back a score that is currently in the 'very good' band.",
  ],
  benefits: [
    ["Before and after view", "Two scores side by side with the point movement between them."],
    ["Factor breakdown", "See which of the five bureau factors is actually holding your score down."],
    ["Published weightings", "Built on the factor weights bureaus disclose, not invented numbers."],
  ],
  faqs: [
    [
      "What is a good credit score in India?",
      "On the 300–900 CIBIL scale, 750 and above is generally treated as very good and gets the best loan pricing, 650–749 is good, 550–649 is fair, and below 550 is poor. Lenders set their own cut-offs.",
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
