const seo = {
  title: "Rent Increment Planner: Compound Escalation Cost",
  metaDescription:
    "Compounds your rent escalation across renewal cycles, totals the outgo in nominal and today's money, and prices a second scenario alongside.",
  steps: [
    "Enter Current monthly rent (INR), Agreed escalation per renewal (%), the Renewal cycle in months and Years to project.",
    "Fill the Comparison scenario with the landlord's ask or the escalation percentage you are negotiating towards.",
    "Read Total rent over the horizon, the cycle-by-cycle rent table and the difference between scenarios, then use Copy result.",
  ],
  intro:
    "This planner compounds an agreed rent escalation across every renewal cycle, so the rent in cycle k is the starting rent multiplied by (1 + escalation)^k, and totals the outgo across a horizon you choose. It also discounts that total back to today's money using a present-value deflator, and runs a second scenario alongside so a negotiated percentage point can be priced in rupees. It suits tenants reviewing an escalation clause and landlords modelling revenue from a property.",
  useCases: [
    "Pricing what a 10% escalation clause costs over five years compared with the 5% you want to negotiate",
    "Working out whether a cheaper flat with a steeper escalation ends up dearer than a pricier one with a mild clause",
    "Projecting rental income from a let-out property before you commit to a long tenancy",
  ],
  benefits: [
    ["Compounding made visible", "Shows each renewal cycle's rent, not just the first-year figure."],
    ["Two scenarios side by side", "Prices the difference between what is offered and what you are asking for."],
    ["Today's-money view", "Discounts the future rent stream so long horizons stay comparable."],
  ],
  faqs: [
    [
      "What is a normal rent increase percentage in India?",
      "Residential agreements in Indian metros commonly carry a 5% to 10% escalation per renewal, with 8% to 10% typical in high-demand city markets and 5% in slower ones. The figure is negotiable and must be written into the agreement, because an escalation that is not in the contract cannot be enforced mid-term.",
    ],
    [
      "How much will my rent be after 5 years at 10% a year?",
      "Rent grows by (1.10)^4 by the fifth renewal cycle — the first cycle still carries no increase, so five renewals mean four completed escalations — which is about 1.46, so Rs 25,000 becomes about Rs 36,603 a month in that fifth cycle. Across those five years you pay roughly Rs 18.3 lakh in total, about 10% more than the Rs 16.6 lakh a 5% escalation would cost on the same flat.",
    ],
    [
      "Does the rent go up every 11 months or every 12?",
      "It goes up whenever the agreement says it does, which is usually at renewal. Since 11-month agreements are the norm in India to stay outside the compulsory registration rule in Section 17 of the Registration Act, 1908, the escalation in those cases lands every 11 months, which is one extra increase roughly every 11 years compared with an annual cycle.",
    ],
    [
      "Can a landlord raise the rent whenever they want?",
      "No. Mid-term increases are not permitted unless the agreement provides for them, and several states have rent control laws that cap the frequency or size of a revision for covered properties. If you receive an increase you believe is outside the agreement, check the escalation clause and take legal advice before responding.",
    ],
  ],
};

export default seo;
