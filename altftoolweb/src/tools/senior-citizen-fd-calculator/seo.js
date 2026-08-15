const seo = {
  title: "Senior Citizen FD Calculator: Extra Rate, TDS & 80TTB",
  metaDescription:
    "Price the senior citizen FD rate premium in rupees with quarterly compounding, the Rs 1,00,000 section 194A TDS threshold and the 80TTB deduction.",
  steps: [
    "Enter 'Deposit amount (INR)', the 'Depositor's age (completed years)', the 'Bank's ordinary card rate (%)' and 'Tenure (years)'.",
    "Set 'Senior premium, ages 60–79 (points)' and 'Premium from age 80 (points)', add 'Other deposit interest in the year (INR)', choose your 'Marginal slab rate', and tick 'Old tax regime', 'PAN given to bank' or 'Form 15H filed' in the Tax position box.",
    "Read 'Extra earned from the senior rate' in rupees, then 'Maturity value at the senior rate' against 'Maturity value at the ordinary rate', the 'TDS threshold that applies', 'TDS deducted across the term' and 'Section 80TTB deduction claimed', and press 'Copy result'.",
  ],
  intro:
    "This calculator prices the extra interest rate banks give depositors aged 60 and above — usually 0.50 percentage points, with a further step for those aged 80 or more — by running the deposit at both the ordinary card rate and the senior rate with quarterly compounding, then reporting the rupee difference. It also applies the two tax rules that matter to senior depositors: the ₹1,00,000 section 194A TDS threshold and the ₹50,000 section 80TTB deduction on deposit interest, which is only available under the old regime.",
  useCases: [
    "See what an extra 0.50% is worth in rupees on a ₹15 lakh five-year deposit before choosing a bank.",
    "Work out which year a large deposit's interest first crosses ₹1,00,000 and TDS begins.",
    "Check how much of the interest section 80TTB actually shelters once savings account interest is counted too.",
  ],
  benefits: [
    ["Both rates run side by side", "Compounds the deposit at the card rate and the senior rate so the premium is shown as money, not basis points."],
    ["Correct 80TTB ceiling", "Treats other deposit interest as consuming the ₹50,000 headroom first, rather than double-counting it."],
    ["Regime aware", "Removes the 80TTB deduction when the new regime applies, while keeping the higher TDS threshold."],
  ],
  faqs: [
    [
      "How much extra interest do senior citizens get on an FD?",
      "Most Indian banks add 0.50 percentage points to the card rate for resident depositors aged 60 and above, and some add a further 0.25 points from age 80. It is a commercial decision, not a statutory entitlement, and banks often exclude the premium on very long tenures or on bulk deposits.",
    ],
    [
      "What is the TDS limit on FD interest for senior citizens?",
      "₹1,00,000 of interest from one bank in a financial year, raised from ₹50,000 by the Finance Act 2025 with effect from 1 April 2025. Above that the bank deducts 10%, or 20% if PAN is not on record. A senior citizen with income below the taxable limit can file Form 15H for nil deduction.",
    ],
    [
      "What is section 80TTB and how much can I claim?",
      "Section 80TTB lets a resident individual aged 60 or above deduct up to ₹50,000 a year of interest from deposits with banks, co-operative banks and the post office — savings, fixed and recurring together. It replaces section 80TTA for seniors and is available only under the old tax regime, not under section 115BAC.",
    ],
    [
      "Can a senior citizen claim both the higher TDS limit and 80TTB?",
      "Yes, they are separate. The ₹1,00,000 threshold decides whether the bank withholds tax during the year; section 80TTB is a deduction claimed in the return that reduces taxable income by up to ₹50,000. A senior in the old regime benefits from both, though the deduction is shared across all deposit interest. Speak to a tax professional about your own return.",
    ],
  ],
};

export default seo;
