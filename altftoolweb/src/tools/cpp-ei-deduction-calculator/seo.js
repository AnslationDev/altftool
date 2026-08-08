const seo = {
  title: "CPP, CPP2 and EI Deduction Calculator for Canada",
  metaDescription:
    "Employee and employer CPP, the 4% CPP2 tier and EI premiums with the $3,500 exemption, YMPE, YAMPE and EI ceilings applied — QPP and self-employed too.",
  steps: [
    "Enter annual pensionable earnings in CAD, pick the contribution year (or Custom to type this year's YMPE, YAMPE and rates) and your pay periods.",
    "Tick Working in Quebec to switch to QPP with the lower federal EI rate, or Self-employed to pay both halves of the pension contribution.",
    "The table splits first-tier CPP, second-tier CPP2 and EI across employee and employer columns, with per-pay amounts; Copy result takes the breakdown.",
  ],
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
      "Subtract the $3,500 annual basic exemption (prorated across your pay periods) from pensionable earnings, then apply the 5.95% employee rate up to the YMPE. The employer matches it exactly. For 2026 the YMPE is $74,600, giving a maximum first-tier employee contribution of $4,230.45.",
    ],
    [
      "What is CPP2 and who pays it?",
      "CPP2 is the second additional contribution introduced in 2024. It applies at 4% to earnings between the YMPE and the YAMPE, paid by both employee and employer. In 2026 that band runs from $74,600 to $85,000, so the maximum employee CPP2 contribution is $416.",
    ],
    [
      "How much EI is deducted from my pay?",
      "The employee rate is applied to insurable earnings up to the annual maximum, and the employer pays 1.4 times that amount. For 2026 the rate outside Quebec is 1.63% on maximum insurable earnings of $68,900, giving a maximum employee premium of $1,123.07; Quebec's federal rate is 1.30%, giving a maximum of $895.70, because QPIP covers parental benefits.",
    ],
    [
      "Do self-employed people pay CPP and EI?",
      "Self-employed people pay both the employee and employer halves of CPP — 11.90% on contributory earnings plus 8% on the CPP2 band — remitted with their income tax return. EI is optional: you can register with the Canada Employment Insurance Commission for special benefits and pay the employee premium only. Speak to an accountant about which makes sense for you.",
    ],
  ],
};

export default seo;
