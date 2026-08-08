const seo = {
  title: "TDS on Salary Calculator: Section 192 Monthly Cut",
  metaDescription:
    "Estimate monthly TDS under Section 192 from gross salary, regime, exemptions and deductions — slab tax, 87A rebate, surcharge and 4% cess included.",
  steps: [
    "Choose New regime or Old regime, then enter Annual gross salary (₹); the old regime also unlocks HRA exemption, Section 80C (max ₹1,50,000), Section 80D, Section 80CCD(1B) NPS (max ₹50,000) and Home loan interest u/s 24(b).",
    "Fill TDS already deducted (₹) and Months left in the year so only the remaining balance is spread, and add Employer NPS u/s 80CCD(2) and Other income reported (₹) if they apply.",
    "Monthly TDS to be deducted shows on the results panel, with Taxable income, Tax on slab rates, Surcharge, Annual tax (total TDS for the year) and Effective rate on gross salary below it; Copy result copies the whole computation.",
  ],
  "intro": "TDS on Salary Calculator estimates the tax your employer should withhold every month under Section 192. Enter your annual gross salary, the regime you declared, and any exemptions or deductions you have submitted proof for — the tool computes salary income after the standard deduction, applies the slab rates, Section 87A rebate, surcharge and 4% cess, then divides the balance across the months still left in the financial year. Useful for salaried employees checking a payslip and for payroll staff sanity-checking a withholding sheet.",
  "useCases": [
    "Check whether the TDS on your payslip matches what your declared investments should produce.",
    "See how much monthly TDS jumps in the last quarter if you fail to submit proofs on time.",
    "Compare the new regime's ₹75,000 standard deduction against the old regime with HRA and 80C."
  ],
  "benefits": [
    [
      "Regime-aware",
      "The old regime opens HRA, 80C, 80D and home loan interest; the new regime keeps only the standard deduction and employer NPS."
    ],
    [
      "Statutory caps applied",
      "80C is capped at ₹1,50,000, 80CCD(1B) at ₹50,000, home loan interest at ₹2,00,000 and professional tax at ₹2,500."
    ],
    [
      "Catch-up aware",
      "Enter the TDS already deducted and the months left, and the tool re-spreads only the remaining balance."
    ]
  ],
  "faqs": [
    [
      "How is TDS on salary calculated?",
      "Under Section 192 the employer estimates your annual salary income, allows the standard deduction and any declared exemptions and Chapter VI-A deductions, computes the annual tax including cess, and deducts one-twelfth of it each month — adjusting later months if declarations change."
    ],
    [
      "What is the standard deduction on salary?",
      "₹75,000 in the new regime and ₹50,000 in the old regime for FY 2025-26. It is allowed automatically on salary income without any proof or investment."
    ],
    [
      "Why did my TDS suddenly increase in January or February?",
      "If you did not submit investment proofs, the employer withdraws the provisional deductions and recovers the shortfall over the remaining months of the year, which makes the last few deductions much larger."
    ],
    [
      "Can I claim HRA and 80C in the new regime?",
      "No. The new regime disallows HRA, LTA, 80C, 80D and most other deductions. Only the standard deduction, the employer's NPS contribution under 80CCD(2) and a few specific items remain."
    ]
  ]
};

export default seo;
