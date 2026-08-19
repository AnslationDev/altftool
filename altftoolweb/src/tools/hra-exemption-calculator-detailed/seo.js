const seo = {
  title: "HRA Exemption Calculator: Least-of-Three Test",
  metaDescription:
    "Applies the section 10(13A) least-of-three test with 50%/40% metro rules, names the limb that binds, and prints a month-by-month exempt/taxable table.",
  steps: [
    "Enter each period's months, City type — 'Metro — Delhi, Mumbai, Kolkata, Chennai (50%)' or 'Any other city (40%)' — and the monthly basic, DA, commission, HRA received and rent.",
    "Click 'Add another period' (up to 4) when salary, rent or city changed mid-year; total months across periods are capped at 12.",
    "Read the exempt and taxable totals, the least-of-three breakdown naming the limb that binds each period, and the month-by-month table; 'Copy result' exports the calculation.",
  ],
  "intro": "Detailed HRA Exemption Calculator applies the section 10(13A) least-of-three test to your own numbers: actual house rent allowance received, rent paid minus 10% of salary, and 50% of salary for Delhi, Mumbai, Kolkata and Chennai or 40% everywhere else. It shows each limb separately, names the one that binds, and prints a month-by-month table of exempt and taxable HRA. You can add extra periods for a mid-year salary revision, a rent increase or a move between a metro and a non-metro city.",
  "useCases": [
    "Check how much of your HRA is actually exempt before submitting rent receipts to payroll.",
    "Split the year into two periods when you shift from Bengaluru to Mumbai and the 40% rule becomes 50%.",
    "Compare a proposed rent with your salary structure to see how much extra exemption it would really buy."
  ],
  "benefits": [
    [
      "All three limbs shown",
      "You see actual HRA, rent minus 10% of salary and the 50/40% cap side by side, plus which one is limiting your exemption."
    ],
    [
      "Handles mid-year changes",
      "Add up to four periods with their own months, city type, salary, HRA and rent instead of forcing one average for the year."
    ],
    [
      "Month-wise table",
      "A per-month breakdown of exempt and taxable HRA that matches how payroll processes the declaration."
    ]
  ],
  "faqs": [
    [
      "How is HRA exemption calculated?",
      "The exemption is the least of three amounts: the HRA actually received, rent paid minus 10% of salary, and 50% of salary if you live in Delhi, Mumbai, Kolkata or Chennai (40% in any other city). Salary means basic pay plus dearness allowance forming part of retirement benefits plus commission fixed as a percentage of turnover."
    ],
    [
      "Which cities count as metro for HRA?",
      "Only Delhi, Mumbai, Kolkata and Chennai qualify for the 50% limit. Bengaluru, Hyderabad, Pune, Gurugram, Noida and every other city use the 40% limit, however expensive they are."
    ],
    [
      "Can I claim HRA under the new tax regime?",
      "No. The section 10(13A) exemption is one of the deductions given up under the new regime, so it only reduces tax if you file under the old regime."
    ],
    [
      "Do I need my landlord's PAN?",
      "If your rent for the year exceeds Rs 1,00,000, your employer must collect the landlord's PAN (or a declaration where the landlord has none) before allowing the exemption in Form 16."
    ]
  ]
};

export default seo;
