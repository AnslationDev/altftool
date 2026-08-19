const seo = {
  title: "ESI Calculator: 0.75% Employee, 3.25% Employer",
  metaDescription:
    "Monthly ESI on gross wages: 0.75% employee and 3.25% employer, rounded up to the rupee, with the Rs 21,000 ceiling and Rule 52 daily-wage exemption.",
  steps: [
    "Enter 'Monthly gross wages (INR)' and 'Days wages were paid for'; the wage figure is tested against the Rs 21,000 coverage ceiling.",
    "Tick 'Person with disability (Rs 25,000 ceiling)' or 'Crossed the ceiling mid contribution period' when either applies to the employee.",
    "Read 'Employee share (0.75% of wages)', 'Employer share (3.25% of wages)' and the 6-month contribution period total, then press 'Copy result'.",
  ],
  intro:
    "This calculator works out the monthly Employees' State Insurance liability on a wage figure: 0.75% from the employee and 3.25% from the employer under Rule 51 of the ESI (Central) Rules, 1950. It checks the Rs 21,000 monthly gross-wage coverage ceiling (Rs 25,000 for a person with disability), applies the Rule 52 exemption for workers averaging Rs 176 a day or less, and rounds each share up to the next rupee the way ESIC does. It is aimed at payroll staff, small-business owners and employees reconciling an ESI deduction on a payslip.",
  useCases: [
    "Checking whether an ESI deduction printed on a payslip matches the 0.75% employee rate",
    "Budgeting the employer's 3.25% cost before adding factory or warehouse headcount",
    "Deciding whether an employee crossing Rs 21,000 mid-period must keep contributing until September or March",
  ],
  benefits: [
    ["Both shares separated", "See the employee deduction and the employer cost as distinct figures."],
    ["Ceiling logic built in", "Handles the Rs 25,000 disability ceiling and mid-period crossings."],
    ["ESIC rounding", "Rounds each share up to the next rupee, matching the ESIC challan."],
  ],
  faqs: [
    [
      "What is the current ESI contribution rate?",
      "The employee contributes 0.75% of gross wages and the employer 3.25%, a combined 4%, in force since 1 July 2019 after the rate was cut from 6.5%. Both shares are computed on actual wages paid for the month and rounded up to the next rupee.",
    ],
    [
      "What is the ESI salary limit in 2025?",
      "ESI covers employees drawing gross wages up to Rs 21,000 a month, raised to Rs 25,000 a month for a person with disability employed under the notified schemes. Wages above the ceiling take the employee out of ESI, but only from the start of the next contribution period.",
    ],
    [
      "Does an employee ever pay zero ESI while still being covered?",
      "Yes. Under Rule 52, an employee whose average daily wage is up to Rs 176 is exempt from the employee's 0.75% share, yet remains fully insured because the employer continues to deposit its 3.25%.",
    ],
    [
      "When is the ESI contribution due and what are the contribution periods?",
      "Contributions for a month must reach ESIC by the 15th of the following month. The two contribution periods run 1 April to 30 September and 1 October to 31 March, and wages crossing the ceiling inside a period attract contribution on the actual higher wages until that period ends.",
    ],
  ],
};

export default seo;
