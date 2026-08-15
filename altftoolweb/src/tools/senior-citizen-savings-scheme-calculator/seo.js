const seo = {
  title: "SCSS Calculator: Quarterly Payout, Interest",
  metaDescription:
    "SCSS quarterly payout is deposit × rate ÷ 400. Get the payout schedule, total interest, 80C deduction and tax at your slab, up to the ₹30 lakh cap.",
  steps: [
    "Enter Deposit amount (INR) in multiples of ₹1,000 — the Max deposit chip fills the ₹30,00,000 cap — plus Interest rate (% per year) and Tenure (years); the 5 years and 8 years (with extension) chips set the term.",
    "Pick Your income-tax slab (%) from 0, 5, 10, 15, 20 or 30 so the 80C and interest-tax lines are worked out at your rate.",
    "Read Quarterly interest payout with Annual interest income, Total interest over the term, 80C deduction available on deposit and Net annual income after tax, plus the Quarterly payout schedule and Premature closure penalty tables, then press Copy result.",
  ],
  intro:
    "This Senior Citizen Savings Scheme calculator turns an SCSS deposit into the numbers that actually matter: the quarterly interest credited to your bank account, the annual income it produces, the total interest over the five-year term, and the principal returned at maturity. SCSS pays simple interest quarterly rather than compounding it, so the tool also shows the 80C deduction on the deposit, the tax payable on the interest at your slab, and whether your interest crosses the senior-citizen TDS threshold. It is meant for retirees planning a predictable income stream from a lump sum such as gratuity, PF or a matured FD.",
  useCases: [
    "A 62-year-old investing a ₹30 lakh retirement corpus and wanting to know the exact quarterly cheque it produces at the current 8.2% rate.",
    "A retired couple splitting deposits across two SCSS accounts to keep each person's annual interest below the TDS threshold.",
    "Someone deciding whether to extend an SCSS account by three years after the initial five-year term, comparing total interest for both options.",
  ],
  benefits: [
    ["Quarterly payout, not just maturity", "SCSS pays out every quarter — the tool shows the exact cheque amount and a full payout schedule."],
    ["Tax picture included", "80C deduction on the deposit, tax on interest at your slab, and the TDS threshold warning are all worked out."],
    ["Premature closure costs shown", "See the 1.5% and 1% penalties before you commit money you may need back early."],
  ],
  faqs: [
    [
      "How is SCSS interest calculated?",
      "Interest is simple, not compounded: quarterly payout = deposit × annual rate ÷ 400. Nothing is reinvested, so the full principal comes back at maturity and the interest is credited to your account every quarter.",
    ],
    [
      "What is the maximum deposit in the Senior Citizen Savings Scheme?",
      "The limit is ₹30 lakh per individual, raised from ₹15 lakh with effect from 1 April 2023. The minimum is ₹1,000 and deposits must be in multiples of ₹1,000.",
    ],
    [
      "Who is eligible to open an SCSS account?",
      "Anyone aged 60 or above; those aged 55 to 60 who retired on superannuation or VRS, if the account is opened within one month of receiving retirement benefits; and retired defence personnel from age 50, subject to conditions.",
    ],
    [
      "Is SCSS interest taxable?",
      "Yes, the interest is fully taxable as income from other sources and TDS applies once annual interest crosses the senior-citizen threshold, unless you submit Form 15H. The deposit itself qualifies for a section 80C deduction of up to ₹1.5 lakh under the old tax regime.",
    ],
  ],
};

export default seo;
