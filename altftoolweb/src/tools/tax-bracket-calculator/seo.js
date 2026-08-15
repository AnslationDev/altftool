const seo = {
  title: "Tax Bracket Calculator: 2025 and 2026 IRS",
  metaDescription:
    "See how many dollars each federal rate taxes — 10% through 37% — for 2025 or 2026, plus your marginal rate, effective rate and bracket headroom.",
  steps: [
    "Type your Total income (before deductions), choose a Filing status and the Tax year 2025 or 2026, and enter any Pre-tax contributions such as a traditional 401(k) or HSA.",
    "Pick Standard deduction — adding People aged 65 or older — or Itemized deduction with your Schedule A total; the bracket table recalculates as you type.",
    "Read your top marginal bracket, Taxable income, Federal income tax, Effective rate on total income and Room left in this bracket, then press Copy result for the bracket-by-bracket breakdown.",
  ],
  intro:
    "A tax bracket calculator slices your taxable income across the seven US federal rates — 10%, 12%, 22%, 24%, 32%, 35% and 37% — and shows how many dollars each bracket actually taxes. It is for anyone who wants to know their marginal bracket before a raise, a bonus or a Roth conversion, and who has been told a bracket applies to their whole salary. The schedules used are the IRS inflation-adjusted brackets from Rev. Proc. 2024-40 for tax year 2025 and Rev. Proc. 2025-32 for 2026, with the standard deduction as amended by P.L. 119-21.",
  useCases: [
    "Check whether a $12,000 raise pushes any part of your income from the 22% bracket into the 24% bracket, and how much of the raise you keep.",
    "See how much taxable income is still left in your current bracket before deciding how large a Roth conversion to do this December.",
    "Compare the tax on the same salary as single versus head of household after a change in filing status.",
  ],
  benefits: [
    ["Marginal, not flat", "Shows the dollars taxed in each bracket instead of applying one rate to the whole income."],
    ["Both published years", "Switch between the 2025 and 2026 IRS rate schedules and standard deductions."],
    ["Headroom figure", "Tells you how much more taxable income fits before the next bracket starts."],
  ],
  faqs: [
    [
      "Does moving into a higher tax bracket mean all my income is taxed at that rate?",
      "No. Only the dollars above the bracket threshold are taxed at the higher rate. A single filer with $84,250 of taxable income in 2025 pays 10% on the first $11,925, 12% on the next $36,550 and 22% only on the $35,775 above $48,475 — a total of $13,449, which is an effective rate of about 16.0% on taxable income, not 22%.",
    ],
    [
      "What are the 2025 federal tax brackets for a single filer?",
      "For tax year 2025 a single filer pays 10% up to $11,925 of taxable income, 12% to $48,475, 22% to $103,350, 24% to $197,300, 32% to $250,525, 35% to $626,350 and 37% above that. Married filing jointly uses double those figures up to the 35% band, which starts at $501,050.",
    ],
    [
      "What is the difference between my marginal rate and my effective rate?",
      "The marginal rate is the rate on your next dollar of taxable income; the effective rate is total tax divided by income. A single filer earning $100,000 in 2025 has a 22% marginal rate but pays $13,449, an effective rate of 13.4% on gross income — the gap comes from the standard deduction and from the lower brackets underneath.",
    ],
    [
      "How much is the standard deduction?",
      "For tax year 2025 it is $15,750 for single and married filing separately, $31,500 for married filing jointly and $23,625 for head of household, following P.L. 119-21. For 2026 the figures are $16,100, $32,200 and $24,150. Filers aged 65 or older add a further amount per qualifying person.",
    ],
  ],
};

export default seo;
