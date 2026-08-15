const seo = {
  title: "Startup Runway Calculator: Month-by-Month Net",
  metaDescription:
    "Walks the cash balance month by month as revenue and costs compound, so you get runway, the break-even month, burn multiple and default alive or dead.",
  steps: [
    "Fill in Cash in the bank (INR), Monthly cash expenses / gross burn (INR) and Monthly revenue collected (INR).",
    "Set Revenue growth (% a month), Expense growth (% a month) and Months to project, so both sides compound month by month.",
    "Runway gives the months left and the cash-out date, with gross burn, net burn, the break-even month, the burn multiple and default alive or dead.",
  ],
  intro:
    "Runway is the number of months a company can operate before its cash balance reaches zero, calculated as cash divided by net burn, where net burn is monthly cash expenses minus monthly cash revenue. This calculator walks the balance month by month so that revenue growth and cost growth both compound, which a single division cannot capture, and reports the break-even month, the burn multiple over the first twelve months and whether the company is default alive. Founders and finance leads use it to time a raise and to test whether a hiring plan still leaves enough cushion.",
  useCases: [
    "Deciding whether a seed round buys enough months to reach a Series A milestone at the current growth rate",
    "Testing how much runway a hiring plan costs when payroll grows 5% a month but revenue grows 10%",
    "Preparing the burn and runway slide for a board pack, including the burn multiple investors will ask about",
  ],
  benefits: [
    ["Growth-aware, not a single division", "Compounds revenue and cost separately so the runway number survives contact with a plan."],
    ["Default alive test built in", "Tells you whether break-even arrives before the cash does."],
    ["Investor metrics included", "Reports the burn multiple and net new ARR the way a diligence deck would."],
  ],
  faqs: [
    [
      "How do you calculate startup runway?",
      "Divide cash in the bank by net monthly burn, where net burn is monthly cash expenses minus monthly cash revenue. Rs 5 crore of cash against a Rs 50 lakh net burn is ten months of runway, but that shortcut only holds if revenue and costs stay flat, which is why a month-by-month model gives a different and usually longer answer for a growing company.",
    ],
    [
      "What is the difference between gross burn and net burn?",
      "Gross burn is every rupee of operating cash leaving the business in a month, regardless of revenue. Net burn subtracts the cash revenue collected in that month, so it is the amount the bank balance actually falls by, and it is the figure runway is calculated on.",
    ],
    [
      "What is a good burn multiple?",
      "Burn multiple is net cash burned divided by net new ARR added over the same period. In the original framework under 1x is amazing, 1x to 1.5x is great, 1.5x to 2x is good, 2x to 3x is suspect and above 3x is bad, because it means you are spending more than three rupees to add one rupee of recurring revenue.",
    ],
    [
      "When should a startup start raising its next round?",
      "Most boards trigger a raise at around six months of remaining runway, because a round commonly takes three to six months from first meeting to money in the bank, and a company negotiating with under three months of cash has very little leverage. Rounds are usually sized to buy about eighteen months of runway plus the milestones the next investor will want to see.",
    ],
  ],
};

export default seo;
