const seo = {
  title: "Salary Tax Calculator: CTC to Take-Home",
  metaDescription:
    "Enter CTC, HRA, LTA, 80C and 80D to get taxable income, tax across the 5% to 30% slabs, 4% cess and monthly take-home. An estimate, not a filing.",
  steps: [
    "Fill Annual CTC (Cost to Company), HRA Exemption, LTA Exemption, Section 80C Deductions and Section 80D (Health Insurance) — the form loads with ₹12,00,000 CTC and ₹1,50,000 under 80C",
    "Press Calculate; it subtracts a ₹50,000 standard deduction, your 80C and 80D amounts, half the HRA figure and LTA, then runs the balance through the ₹3L/₹6L/₹9L/₹12L/₹15L slab ladder and adds 4% health and education cess",
    "Annual Take-Home Salary appears as the headline with Total Tax + Cess under it, and the cards below break out CTC, Taxable Income, Income Tax, Health & Edu Cess and Take-Home per Month; the refresh button beside Calculate clears the form",
  ],
  intro:
    "Salary Tax Calculator estimates annual take-home pay from your CTC by subtracting exemptions and deductions, running the balance through a five-band Indian slab ladder — nil up to ₹3,00,000, then 5%, 10%, 15%, 20% and 30% at ₹3L/₹6L/₹9L/₹12L/₹15L — and adding 4% health and education cess. You enter CTC, HRA exemption, LTA, Section 80C and Section 80D amounts; it applies a ₹50,000 standard deduction, counts half your stated HRA figure, and returns taxable income, income tax, cess, annual take-home and a monthly figure. It is an informational estimate for salaried employees sizing up an offer or a payslip, not a tax filing.",
  useCases: [
    "You have an offer letter quoting a CTC and want a number for what actually lands in your account each month before you accept it.",
    "You are deciding whether to top up your Section 80C investments before year end and want to see how much tax each extra rupee of deduction saves.",
    "You are comparing two job offers where one has a larger HRA component and want to see which one leaves you more after tax rather than which quotes a bigger CTC.",
  ],
  benefits: [
    [
      "Shows the slab-by-slab arithmetic, not just a total",
      "Taxable income, income tax before cess, the 4% cess, and monthly take-home are broken out separately, so you can see which band pushed the bill up.",
    ],
    [
      "Starts from CTC, the number recruiters actually quote",
      "Most calculators want taxable income you have to work out first; this one begins at the figure printed on your offer letter and subtracts from there.",
    ],
    [
      "Deduction fields you can move one at a time",
      "80C, 80D, HRA and LTA are separate inputs, so you can change one and re-run to see the exact rupee effect on take-home.",
    ],
  ],
  faqs: [
    [
      "What tax slabs does this calculator use?",
      "It applies a five-band ladder: nothing on the first ₹3,00,000, 5% from ₹3,00,000 to ₹6,00,000, 10% from ₹6,00,000 to ₹9,00,000, 15% from ₹9,00,000 to ₹12,00,000, 20% from ₹12,00,000 to ₹15,00,000, and 30% above ₹15,00,000. A 4% health and education cess is then added to the tax figure. Slab boundaries and rates change with each Union Budget, so check the current year's rules before relying on the number.",
    ],
    [
      "How is take-home salary calculated from CTC?",
      "Take-home here is CTC minus total tax and cess. Taxable income is CTC less a ₹50,000 standard deduction, less your Section 80C and Section 80D amounts, less half the HRA exemption you enter, less LTA — and the slab ladder plus 4% cess is applied to whatever remains.",
    ],
    [
      "Does this include PF, gratuity and professional tax?",
      "No. The estimate only models income tax and the 4% cess, so employer PF contributions, gratuity accrual, state professional tax and any employee PF deduction are not subtracted. Real monthly credit is usually lower than the figure shown for exactly that reason.",
    ],
    [
      "Can I use this number for my income tax return?",
      "No — treat it as a planning estimate only. It uses a simplified deduction model and one fixed slab ladder, and it does not handle rebates, surcharge on high incomes, capital gains, other income heads, or regime selection. Have a chartered accountant or qualified tax professional review anything you actually file.",
    ],
  ],
};

export default seo;
