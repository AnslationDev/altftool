const seo = {
  title: "Maharashtra Professional Tax Calculator",
  metaDescription:
    "Enter a monthly salary to get the slab, the Rs 200 monthly and Rs 300 February deductions, and the Rs 2,500 yearly total. Women exempt up to Rs 25,000.",
  steps: [
    "Enter the monthly salary or wage in INR and pick Male or Female in the Employee dropdown.",
    "Tick the notified exemption checkbox if a 40%+ disability, parent of a child with disability, ex-serviceman or senior citizen above 65 applies.",
    "Read the year's professional tax with the normal-month and February deductions against the Maharashtra slab table, then click Copy result.",
  ],
  intro:
    "This calculator returns the professional tax an employer must deduct in Maharashtra for a given monthly salary, using Schedule I of the Maharashtra State Tax on Professions, Trades, Callings and Employments Act, 1975 as amended from 1 April 2023. It handles the three salary slabs, the higher February deduction that brings the year to Rs 2,500, and the exemption for women earning up to Rs 25,000 a month. Payroll teams and salaried employees can use it to check a PT line on a payslip.",
  useCases: [
    "Verifying why a Mumbai payslip shows Rs 200 in most months and Rs 300 in February",
    "Setting up the PT deduction rule for a new Maharashtra branch in a payroll system",
    "Checking whether a woman employee crossing Rs 25,000 a month now attracts professional tax",
  ],
  benefits: [
    ["Slab-accurate", "Uses the current three-slab schedule, not an outdated Rs 5,000 threshold."],
    ["February handled", "Shows the Rs 300 February deduction separately from the other eleven months."],
    ["Exemptions covered", "Applies the women's Rs 25,000 limit and the notified exemption categories."],
  ],
  faqs: [
    [
      "How much professional tax is deducted in Maharashtra?",
      "Nothing up to a monthly salary of Rs 7,500, Rs 175 a month between Rs 7,501 and Rs 10,000, and Rs 200 a month above Rs 10,000 with Rs 300 deducted in February. The top slab therefore totals Rs 2,500 for the year.",
    ],
    [
      "Why is professional tax higher in February?",
      "Article 276(2) of the Constitution caps professional tax at Rs 2,500 per person per year, and Maharashtra collects that as eleven deductions of Rs 200 plus a single Rs 300 deduction in February. It is a balancing entry, not an extra levy.",
    ],
    [
      "Is professional tax applicable to women in Maharashtra?",
      "Women drawing a monthly salary up to Rs 25,000 are exempt, an exemption raised from Rs 10,000 with effect from 1 April 2023. Above that salary the ordinary slab applies, so the deduction is Rs 200 a month and Rs 300 in February.",
    ],
    [
      "Can I claim professional tax as a deduction in my income tax return?",
      "Professional tax actually paid is deductible from salary income under Section 16(iii) of the Income-tax Act, but only if you are taxed under the old regime; the deduction is not available under Section 115BAC. Confirm the treatment with a tax professional for your own return.",
    ],
  ],
};

export default seo;
