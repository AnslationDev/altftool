const seo = {
  title: "HSA Contribution Calculator: 2025 and 2026 IRS",
  metaDescription:
    "Work out your HSA limit for self-only or family HDHP coverage with the $1,000 age-55 catch-up, month-by-month proration and the last-month rule.",
  steps: [
    "Under Eligibility set Tax year, HDHP coverage, Your age at the end of the year and Months eligible (on the 1st of the month), or tick \"Use the last-month rule (eligible on 1 December, claim the full year)\".",
    "Under Contributions enter Your own contribution ($) and Employer contribution ($) and tick \"Contributed by payroll deduction (also avoids FICA)\", then set Federal marginal rate (%), State marginal rate (%), Years invested and Expected return (% a year).",
    "Your contribution limit shows the cap and the room left, with IRS annual limit for this coverage, the prorated Base limit, Age 55+ catch-up, Room left before the limit, FICA saved via payroll deduction and First-year tax saving below; press Copy result.",
  ],
  intro:
    "This calculator works out how much you may put into a Health Savings Account for a given tax year, applying the IRS annual limit for self-only or family HDHP coverage, the $1,000 catch-up from age 55 under IRC §223(b)(3), and month-by-month proration when you were only eligible for part of the year. It then estimates the triple tax benefit: the income and FICA tax saved on the way in, the untaxed growth, and tax-free withdrawals for qualified medical costs. It is for anyone on a high deductible health plan deciding how much to put through payroll before the year closes.",
  useCases: [
    "Check how much room is left after your employer's $1,000 seed contribution before you set your payroll deduction.",
    "Work out the prorated limit when your HDHP coverage started in July rather than January.",
    "See whether the age-55 catch-up applies in the year you turn 55 and what it adds to your limit.",
  ],
  benefits: [
    ["Employer money counts too", "Employer contributions share the same annual limit, and the tool subtracts them before showing your room."],
    ["Proration and the last-month rule", "Prorates by eligible months, or applies the full annual limit under the last-month rule if you toggle it."],
    ["Shows the real cost", "Nets federal, state and FICA savings off your contribution so you see what it actually costs you."],
  ],
  faqs: [
    [
      "What is the HSA contribution limit for 2025 and 2026?",
      "For 2025 it is $4,300 for self-only coverage and $8,550 for family coverage (Rev. Proc. 2024-25). For 2026 it rises to $4,400 and $8,750 (Rev. Proc. 2025-19). Employer contributions count towards the same limit.",
    ],
    [
      "How much extra can I contribute at age 55?",
      "An extra $1,000, provided you turn 55 or older by the end of the tax year. This catch-up is fixed in statute under IRC §223(b)(3) and is not indexed for inflation, so a 56-year-old with family coverage in 2025 may contribute $9,550 in total.",
    ],
    [
      "What happens if I contribute more than the HSA limit?",
      "The excess is subject to a 6% excise tax under IRC §4973(a)(5) for every year it stays in the account. Withdrawing the excess plus its earnings before your tax filing deadline, including extensions, avoids the tax.",
    ],
    [
      "Is it better to contribute through payroll or directly?",
      "Payroll deduction through a §125 cafeteria plan is better because it also escapes the 7.65% employee FICA (6.2% Social Security plus 1.45% Medicare) on wages up to the Social Security wage base. Direct contributions claimed on Form 8889 get the income tax deduction but not the FICA saving.",
    ],
  ],
};

export default seo;
