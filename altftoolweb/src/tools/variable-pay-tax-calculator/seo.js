const seo = {
  title: "Bonus & Variable Pay Tax Calculator India (FY 2025-26)",
  metaDescription:
    "Shows the extra FY 2025-26 tax a bonus adds on top of salary - slabs, 87A rebate, surcharge and cess - plus in-hand value and the TDS hit per month.",
  steps: [
    "Enter 'Fixed annual salary, before bonus (INR)' and 'Bonus / variable pay (INR)', then pick a 'Tax regime' — choosing the old regime adds Chapter VI-A deduction and exempt-allowance fields.",
    "Set 'Payroll months left in the year' (1-12) so the extra tax is spread across the months payroll will actually recover it in.",
    "Read 'Extra tax caused by the bonus', 'Bonus in hand after tax' and 'Extra TDS per remaining payroll month'; 'Copy result' copies the whole summary.",
  ],
  intro:
    "This calculator shows the incremental income tax a bonus or variable payout adds to your salary — the difference between tax on salary plus bonus and tax on salary alone. It applies the FY 2025-26 slabs, the Section 16(ia) standard deduction, the Section 87A rebate with marginal relief, surcharge with marginal relief and 4% health and education cess. It is built for salaried employees who want to know what a performance payout is really worth in hand before payroll deducts the TDS.",
  useCases: [
    "Estimating take-home value of an annual performance bonus before appraisal letters are signed",
    "Understanding why a March bonus pushed one month's TDS far above every other payslip",
    "Comparing the new and old regime when a large variable payout lifts you into a higher slab",
  ],
  benefits: [
    ["Marginal, not flat", "Shows the real slab-stacked cost of a bonus instead of a guessed flat 30%."],
    ["Regime comparison", "Switch between Section 115BAC and the old regime with your own deductions."],
    ["Payroll-ready TDS", "Splits the extra tax across the payroll months left in the financial year."],
  ],
  faqs: [
    [
      "Is a bonus taxed at a flat 30% in India?",
      "No. A bonus is added to salary income and taxed at your ordinary slab rates, so the effective rate depends on total income. Someone whose income lands in the 15% band pays roughly 15% plus 4% cess on the bonus, while a bonus that pushes income past Rs 24,00,000 is taxed at 30% plus cess.",
    ],
    [
      "Why was the TDS on my bonus month so high?",
      "Employers re-estimate your full-year income the moment the bonus is credited and recover the extra tax across the remaining payroll months, so a bonus paid in February or March compresses that recovery into one or two payslips. The annual tax is unchanged — only the timing shifts.",
    ],
    [
      "Does the Section 87A rebate still apply if a bonus pushes me over Rs 12,00,000?",
      "The full rebate stops once total income under the new regime exceeds Rs 12,00,000, but marginal relief caps the tax so it never exceeds the amount by which income crosses that line. At a total income of Rs 12,05,000 the tax before cess is limited to Rs 5,000 rather than the Rs 60,750 the slabs alone would produce.",
    ],
    [
      "Can I reduce the tax on my variable pay?",
      "Under the new regime the only salary deduction is the Rs 75,000 standard deduction plus the employer's NPS contribution under Section 80CCD(2), so there is little room to shelter a bonus. Under the old regime, 80C, 80D and NPS investments made in the same financial year do reduce it — a chartered accountant can confirm which regime leaves you better off.",
    ],
  ],
};

export default seo;
