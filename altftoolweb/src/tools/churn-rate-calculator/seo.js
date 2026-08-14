const seo = {
  title: "Churn Rate Calculator: Churn, Retention, Remaining",
  metaDescription:
    "Customers lost ÷ customers at the start × 100, to 0.01%. Shows churn, the matching retention rate and customers remaining from the same two numbers.",
  intro:
    "The Churn Rate Calculator divides the customers you lost during a period by the customers you had at the start of it, giving customer churn as a percentage along with the matching retention rate and the headcount left. It is for subscription and SaaS teams, membership operators and account managers who need one defensible number for a monthly or quarterly review. Retention is reported as 100% minus churn, and remaining customers as start minus lost, so every figure on screen traces back to the two numbers you entered.",
  useCases: [
    "You are writing the monthly board update and need last month's churn stated the standard way: 1,000 customers at the start, 50 cancellations, 5.00% churn and 95.00% retention.",
    "A customer-success lead wants to compare two quarters fairly and needs both periods measured against their own opening customer count rather than an end-of-period total.",
    "You are sanity-checking a retention figure from a dashboard before it goes into an investor deck, and want to confirm it was calculated on starting customers rather than an average balance.",
  ],
  benefits: [
    [
      "Churn and retention from the same base",
      "Retention is derived as 100% minus churn on the identical denominator, so the two numbers can never disagree with each other.",
    ],
    [
      "Shows the surviving headcount",
      "Alongside the percentages it returns customers remaining, which is the figure you actually forecast next period's revenue from.",
    ],
    [
      "Two decimal places",
      "Churn is reported to 0.01%, enough resolution to see a move from 4.90% to 5.10% that a rounded whole-number dashboard would hide.",
    ],
  ],
  faqs: [
    [
      "How is churn rate calculated?",
      "Churn rate = customers lost during the period ÷ customers at the start of the period × 100. Losing 50 of 1,000 starting customers is 5.00% churn, leaving 950 customers and a 95.00% retention rate.",
    ],
    [
      "Do new customers acquired during the period count?",
      "No — this is the standard simple churn formula, which measures losses only against the opening customer count. New signups are deliberately excluded from the denominator so that fast growth cannot mask a rising cancellation rate.",
    ],
    [
      "How do I turn monthly churn into an annual figure?",
      "Compound it rather than multiplying by 12. Monthly churn of 5% means 95% survive each month, so annual retention is 0.95¹² ≈ 54%, implying about 46% of the starting cohort is gone after a year — not 60%.",
    ],
    [
      "Is this customer churn or revenue churn?",
      "Customer churn — it counts accounts, not money. If your customers pay very different amounts, run the same formula on revenue instead by entering starting recurring revenue and revenue lost, which gives gross revenue churn.",
    ],
  ],
};

export default seo;
