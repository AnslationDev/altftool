const seo = {
  intro:
    "The Notice Period Calculator models how notice and severance scale with length of service for four employment types — full-time, part-time, contract and executive — from your years worked and monthly salary. Full-time service accrues one month of notice per year served (up to a 24-month ceiling) and severance of two months' pay per year served (also capped at 24 months), part-time accrues notice at 60% of the full-time rate and severance at 75% of the full-time rate, both capped at 12 months, and contract and executive engagements are capped at six months' notice, with executive severance running to three months per year and a 36-month ceiling. These are the tool's own planning multipliers for comparing scenarios side by side, not a statement of any country's employment law: your actual entitlement comes from your signed contract and local statute, so read the contract and take advice from an employment lawyer before acting on a number here.",
  useCases: [
    "You have two offers and want to see, in money terms, what walking away from six years of accrued service costs before you compare the salaries.",
    "You are modelling a restructuring and want a consistent basis for costing full-time, part-time and contract exits rather than a different rule of thumb for each.",
    "You are about to read your employment contract's notice clause and want a reference figure in mind so you can tell whether what it offers is generous or thin.",
  ],
  benefits: [
    [
      "Treats the four employment types differently",
      "Part-time accrues at 60% of the full-time rate and contract work caps at six months, instead of applying one formula to everyone.",
    ],
    [
      "Shows notice and severance together",
      "The months you owe and the pay you would receive are calculated from the same tenure figure, so you can see the whole exit cost at once.",
    ],
    [
      "Flags the service thresholds it uses",
      "Crossing three, five, ten or fifteen years surfaces a note about the enhanced tier that applies at that point in the model.",
    ],
  ],
  faqs: [
    [
      "How is notice period actually determined?",
      "By your employment contract first, and by the statutory minimum in your jurisdiction where the contract offers less — a contract can generally improve on the legal minimum but not undercut it. Figures produced here are a planning model, not a legal entitlement, so check the notice clause in your appointment letter and confirm it against local law before you resign or serve notice.",
    ],
    [
      "How does this tool calculate severance?",
      "It multiplies your monthly salary by an accrual rate that depends on employment type: two months of pay per year served for full-time to a 24-month cap, 1.5 per year for part-time to a 12-month cap, one per year for contract to six months, and three per year for executive to a 36-month cap. Real severance is set by contract, statute and any settlement you negotiate, and will often differ.",
    ],
    [
      "Can I buy out my notice period?",
      "Very often yes — many contracts include a payment in lieu of notice clause letting either side end the notice early by paying the salary that would have been earned during it. Whether it is your right or your employer's discretion depends on the exact wording, so check whether the clause says the company may accept a buyout or that you may elect one.",
    ],
    [
      "Does a longer notice period mean a bigger payout?",
      "In this model, yes — notice and severance both accrue with tenure, so six years of full-time service produces a larger figure on both than two years does. In practice the two are separate entitlements: notice is time you work or are paid for, severance is a separate sum, and some contracts grant one without the other.",
    ],
  ],
};

export default seo;
