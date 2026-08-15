const seo = {
  title: "FD Maturity Calculator with TDS (Quarterly Compounding)",
  metaDescription:
    "Maturity value with quarterly compounding, year-wise section 194A TDS at the ₹50,000/₹1 lakh limits, and the post-tax return at your slab rate.",
  steps: [
    "Enter Deposit amount (INR), Interest rate (% per year) and the Term in years and extra months, then set Your marginal slab rate and the TDS status checkboxes (senior, PAN given to the bank, Form 15G / 15H filed)",
    "The calculator compounds quarterly and tests each year's credited interest against your TDS threshold, filling the Year / Opening / Interest / TDS / Closing schedule",
    "Read the Maturity value, Value after tax and Post-tax annual return rows, then press Copy result to copy the summary",
  ],
  intro:
    "This calculator returns the maturity value of a cumulative bank fixed deposit using the quarterly compounding Indian banks actually apply — P x (1 + r/4)^(4n) — and then shows the interest credited in each year, the tax deducted at source under section 194A, and what the deposit is worth after tax at your slab rate. It is for depositors who want the post-tax number rather than the headline rate, because a 7% deposit yields 7.19% effective before tax and much less after it.",
  useCases: [
    "Compare a 7.1% five-year deposit against a debt fund by looking at the post-tax annual return rather than the coupon.",
    "Check in which year a large deposit's interest crosses the ₹50,000 TDS threshold so you can time Form 15G.",
    "Work out the balance tax to keep aside when your slab rate is 30% but the bank has only withheld 10%.",
  ],
  benefits: [
    ["Real compounding convention", "Uses quarterly compounding, so the effective yield is higher than the quoted nominal rate."],
    ["Year-wise TDS test", "Applies the threshold to each year's credited interest, the way a bank actually deducts."],
    ["Post-tax return shown", "Converts the after-tax value back into an annual percentage you can compare with other products."],
  ],
  faqs: [
    [
      "How is FD maturity amount calculated?",
      "For a cumulative deposit, maturity = principal x (1 + annual rate / 4) raised to the power of 4 times the number of years, because banks compound quarterly. ₹1,00,000 at 7% for five years matures at about ₹1,41,478.",
    ],
    [
      "What is the TDS limit on FD interest for FY 2025-26?",
      "₹50,000 of interest in a financial year from one bank, and ₹1,00,000 for a resident senior citizen. The Finance Act 2025 raised both limits with effect from 1 April 2025; below the limit the bank deducts nothing, above it the rate is 10%, or 20% if PAN is not on record.",
    ],
    [
      "Is FD interest taxable if TDS has already been deducted?",
      "Yes. TDS is only an advance credit, not the final tax. The whole interest is added to your income under 'Income from Other Sources' and taxed at your slab rate, so a 30%-slab depositor still owes roughly another 20% after the bank's 10% deduction.",
    ],
    [
      "Can I avoid TDS on fixed deposit interest?",
      "Only if your estimated total income for the year is below the taxable limit, in which case you can file Form 15G, or Form 15H if you are 60 or older, at the start of the financial year. Splitting deposits across banks to stay under the threshold does not make the interest tax-free — it remains reportable income.",
    ],
  ],
};

export default seo;
