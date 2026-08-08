const seo = {
  title: "Freelance Rate Calculator: Take-Home to Hourly Rate",
  metaDescription:
    "Works backwards from your target take-home: adds tax and costs, then divides by billable hours — 48 weeks x 40h at 60% is 1,152, not 1,920.",
  steps: [
    "Under '1. The life you want' enter 'Target annual take-home', then list every yearly cost under '2. What the business costs' using its Add button.",
    "In '3. Tax set-aside' choose 'Flat % of profit' or '44ADA presumptive', then in '4. Billable reality' set Working weeks, Hours per week and the 'Billable share of your week' slider.",
    "Read the per-billable-hour rate with the day rate and monthly retainer, check it against the editable Junior, Mid and Senior bands, then press 'Copy rate card'.",
  ],
  intro:
    "The Freelance Rate & Retainer Calculator works backwards from the take-home income you want to the hourly, day, project and monthly retainer rates you actually have to charge, by grossing your target up for tax, adding your annual business costs, and dividing by billable hours only. Billable hours come from working weeks times hours per week times your billable percentage — 48 weeks at 40 hours with 60% billable is 1,152 hours, not 1,920 — which is why the rate it returns is usually higher than people expect. It then checks that rate against editable junior, mid and senior market bands for development, design or writing so you can see whether the number is sellable.",
  useCases: [
    "Deciding whether to quit a salaried job: enter the take-home you need to match, your yearly software, gear and insurance costs, and see the hourly rate that actually clears it",
    "Quoting a 40-hour project without underpricing it — add a 20% buffer for scope creep and a 25% rush premium and get the quote as one figure",
    "Testing what a 10% or 20% rate rise would buy you: either the same income for fewer billable hours per week, or the extra take-home if you keep the hours",
  ],
  benefits: [
    ["It starts from take-home, not revenue", "Tax and business costs are added on top of your target rather than quietly eaten out of it, so the rate you get is the rate that leaves you whole."],
    ["Unbillable time is priced in", "Admin, pitching and downtime are excluded from billable hours and spread across the ones you do bill, which is the step most rate maths skips."],
    ["A reality check against market bands", "The required rate is compared to junior, mid and senior ranges you can edit for your own market, and flagged if it falls below the junior floor or above the senior ceiling."],
  ],
  faqs: [
    [
      "How do I calculate my freelance hourly rate?",
      "Take your target annual take-home, gross it up for tax, add your total annual business costs, then divide by your billable hours — not your total working hours. With 48 working weeks, 40 hours a week and 60% billable, that divisor is 1,152 hours a year.",
    ],
    [
      "What percentage of my hours will actually be billable?",
      "Most solo freelancers land somewhere between 50% and 70%; the calculator defaults to 60%. The rest goes to pitching, invoicing, email, learning and admin, and if you price as though every hour is billable you will end up roughly 40% short.",
    ],
    [
      "How does the presumptive tax option differ from a flat rate?",
      "The flat option taxes profit — revenue minus costs — at the percentage you enter. The presumptive option models India's Section 44ADA treatment, where 50% of gross receipts is deemed profit and taxed at your slab rate plus 4% cess, and business expenses are not separately deducted. Eligibility and receipt limits apply, so confirm your own position with a qualified tax professional; this is informational only.",
    ],
    [
      "How much should I add to a project quote as a buffer?",
      "The default here is 20% on top of your estimated hours, with optional rush premiums of 25% for a tight deadline and 50% for drop-everything work. The buffer is applied to hours before the rate, so a 40-hour estimate is quoted as 48 hours.",
    ],
  ],
};

export default seo;
