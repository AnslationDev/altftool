const seo = {
  title: "EPF Maturity Calculator with EPS Split and Year Table",
  metaDescription:
    "Projects your PF corpus month by month with 8.33% of wages up to Rs 15,000 diverted to EPS, yearly salary hikes and an age-by-age balance table.",
  steps: [
    "Enter your Current age, Retirement age, Monthly basic + DA, Your contribution rate (12% is statutory, higher for VPF), Expected annual salary hike (%), EPF interest rate (%) and any Existing EPF balance.",
    "Tick the statutory wage ceiling box if your employer restricts PF to Rs 15,000; 8.33% of wages up to that ceiling is diverted to the Employees' Pension Scheme and interest accrues on the monthly running balance, credited at year end.",
    "Read the EPF corpus at retirement with your contributions, employer EPF contributions, interest earned and amount diverted to EPS, scan the Year-by-year growth table of age, contributions, interest and closing balance, then press 'Copy result'.",
  ],
  "intro": "EPF Maturity Calculator projects the Employees' Provident Fund corpus you will have at retirement from your current basic plus DA, contribution rate, expected annual hikes and the interest rate EPFO declares. It adds your share and the employer's share month by month, diverts 8.33% of wages up to Rs 15,000 to the Employees' Pension Scheme, and compounds interest on the monthly running balance the way EPFO credits it at year end. A year-by-year table shows contributions, interest and closing balance at every age.",
  "useCases": [
    "See what your PF alone will be worth at 58 before deciding how much extra to invest elsewhere.",
    "Compare a 12% contribution with a higher Voluntary Provident Fund rate to see the difference in corpus.",
    "Check the effect of your employer capping PF at the Rs 15,000 statutory wage instead of full basic."
  ],
  "benefits": [
    [
      "Month-by-month compounding",
      "Interest accrues on the running balance each month and is credited annually, matching how EPFO actually calculates it."
    ],
    [
      "EPS diversion handled",
      "8.33% of wages up to Rs 15,000 goes to pension, not to your PF balance, and the projection keeps the two separate."
    ],
    [
      "Salary growth built in",
      "Annual hikes raise contributions every year instead of assuming a flat salary for your whole career."
    ]
  ],
  "faqs": [
    [
      "How much do the employee and employer contribute to EPF?",
      "Both contribute 12% of basic plus dearness allowance. The employee's full 12% goes to EPF, while of the employer's 12%, 8.33% of wages up to Rs 15,000 goes to the Employees' Pension Scheme and the rest goes to EPF."
    ],
    [
      "What is the current EPF interest rate?",
      "EPFO declared 8.25% for FY 2024-25. The rate is announced each year by the Central Board of Trustees, so a long projection should be treated as an estimate rather than a guarantee."
    ],
    [
      "How is EPF interest calculated?",
      "Interest is worked out on the monthly running balance at one twelfth of the annual rate and credited to the account at the end of the financial year, which is exactly what this calculator does."
    ],
    [
      "Is the EPF maturity amount tax free?",
      "Withdrawal is exempt if you have five years of continuous service. Interest on employee contributions above Rs 2.5 lakh a year (Rs 5 lakh where the employer does not contribute) is taxable, so very high VPF contributions have a tax cost."
    ]
  ]
};

export default seo;
