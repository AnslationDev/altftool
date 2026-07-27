const seo = {
  intro:
    "The Senior Citizen Savings Scheme calculator works out the quarterly interest cheque on an SCSS deposit as deposit x annual rate / 4, because SCSS pays simple interest each quarter rather than compounding it. It is built for retirees planning a predictable income stream and for families comparing SCSS against a bank fixed deposit. Alongside the payout it shows the five-year interest total, the Section 194A TDS position and the Rule 9 deduction if the account is closed early.",
  useCases: [
    "A retiree with a ₹30 lakh corpus checking the exact rupee amount that will land in the bank account on 31 March, 30 June, 30 September and 31 December.",
    "A couple splitting a retirement lump sum across two SCSS accounts to see whether each person's yearly interest stays under the senior-citizen TDS threshold.",
    "Someone who needs the money back in year three, comparing the 1% deposit deduction on premature closure against the interest already received.",
  ],
  benefits: [
    ["Quarterly, not compounded", "Uses the simple-interest payout rule SCSS actually follows, so the figure matches the post office credit."],
    ["Eligibility built in", "Checks the age-60 general route as well as the age-55 superannuation and age-50 defence routes."],
    ["Exit cost shown", "Applies the Rule 9 deductions of 1.5% and 1% and the forfeiture of interest before one year."],
  ],
  faqs: [
    [
      "How much interest will I get every quarter on ₹30 lakh in SCSS?",
      "At the 8.2% rate notified for SCSS, ₹30,00,000 earns ₹61,500 a quarter, which is ₹2,46,000 a year and ₹12,30,000 over the full five years. The formula is deposit x rate / 4, and the ₹30 lakh principal comes back untouched at maturity.",
    ],
    [
      "What is the maximum I can invest in SCSS?",
      "₹30,00,000 per depositor across all SCSS accounts, raised from ₹15,00,000 with effect from 1 April 2023. The minimum is ₹1,000 and deposits must be in multiples of ₹1,000. A joint account with a spouse is treated as belonging to the first holder for this limit.",
    ],
    [
      "Is SCSS interest taxable and will TDS be deducted?",
      "SCSS interest is fully taxable as income from other sources and is added to your total income at slab rates. Tax is deducted at source under Section 194A once interest crosses the senior-citizen threshold, which the Finance Act 2025 raised to ₹1,00,000 a year. Filing Form 15H stops the deduction if your total income is below the taxable limit.",
    ],
    [
      "What do I lose if I close an SCSS account before five years?",
      "Closing on or after two years costs 1% of the deposit; closing between one and two years costs 1.5%; closing before one year means no interest is payable at all and any interest already paid is recovered from the principal. These are the deductions set out in Rule 9 of the SCSS Rules, 2019 — check the exact figure with your post office or bank before closing.",
    ],
  ],
};

export default seo;
