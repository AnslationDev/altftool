const seo = {
  intro:
    "This calculator works out Canada Pension Plan and Employment Insurance payroll contributions for both sides of the paycheque: CPP on earnings above the $3,500 basic exemption up to the Year's Maximum Pensionable Earnings, the 4% second additional CPP2 tier on earnings between the YMPE and the Year's Additional Maximum Pensionable Earnings, and EI premiums on insurable earnings up to the annual ceiling. Quebec employees are handled through QPP at its higher rate with the lower federal EI rate that reflects QPIP, and self-employed people see both halves of the pension contribution. Employees checking a T4, employers budgeting payroll cost and contractors planning instalments all get the same line-by-line breakdown.",
  useCases: [
    "An employee reconciling the CPP and EI boxes on a T4 against what was actually deducted through the year.",
    "A small employer costing a new hire, needing the employer share as well as the employee deduction before income tax.",
    "A self-employed consultant estimating the CPP they will owe on their tax return, where both halves fall on them.",
  ],
  benefits: [
    ["Both CPP tiers", "Applies the first tier up to the YMPE and the 4% CPP2 tier between the YMPE and YAMPE, which many older calculators miss."],
    ["Employer side shown", "Adds the matched pension contribution and the 1.4x EI multiplier so total payroll cost is visible."],
    ["Quebec and self-employed handled", "Switches to QPP rates for Quebec and to double pension contributions for the self-employed."],
  ],
  faqs: [
    [
      "How is CPP calculated on a paycheque?",
      "Subtract the $3,500 annual basic exemption (prorated across your pay periods) from pensionable earnings, then apply the 5.95% employee rate up to the YMPE. The employer matches it exactly. For 2025 the YMPE is $71,300, giving a maximum first-tier employee contribution of $4,034.10.",
    ],
    [
      "What is CPP2 and who pays it?",
      "CPP2 is the second additional contribution introduced in 2024. It applies at 4% to earnings between the YMPE and the YAMPE, paid by both employee and employer. In 2025 that band runs from $71,300 to $81,200, so the maximum employee CPP2 contribution is $396.",
    ],
    [
      "How much EI is deducted from my pay?",
      "The employee rate is applied to insurable earnings up to the annual maximum, and the employer pays 1.4 times that amount. For 2025 the rate outside Quebec is 1.64% on maximum insurable earnings of $65,700, giving a maximum employee premium of $1,077.48; Quebec's federal rate is 1.31% because QPIP covers parental benefits.",
    ],
    [
      "Do self-employed people pay CPP and EI?",
      "Self-employed people pay both the employee and employer halves of CPP — 11.90% on contributory earnings plus 8% on the CPP2 band — remitted with their income tax return. EI is optional: you can register with the Canada Employment Insurance Commission for special benefits and pay the employee premium only. Speak to an accountant about which makes sense for you.",
    ],
  ],
};

export default seo;
