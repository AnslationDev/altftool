const seo = {
  title: "HRA Exemption: Metro 50% vs Non-Metro 40% (Rule 2A)",
  metaDescription:
    "Runs Rule 2A twice on the same salary to show the 50% metro cap against 40% elsewhere, which of the three limits binds, and the tax the gap is worth.",
  steps: [
    "Enter Monthly basic pay, Monthly DA counted for retirement benefits, Monthly HRA received and Monthly rent actually paid in INR.",
    "Set \"Months in the year (1-12)\" and pick your slab rate from the dropdown so the cess-inclusive tax is worked out.",
    "Compare the metro 50% cap against the non-metro 40% cap, see which of the three Rule 2A limits binds, and read the monthly rent below which the two answers match.",
  ],
  intro:
    "This tool shows how much of your house rent allowance stays tax-free in a metro city versus anywhere else, by running Rule 2A of the Income-tax Rules twice on the same salary. Rule 2A exempts the least of three amounts — the HRA actually received, rent paid minus 10% of salary, and 50% of salary in Delhi, Mumbai, Kolkata or Chennai (40% everywhere else) — so the city rate only changes the answer when the percentage cap is the binding one. It is for salaried employees under the old tax regime who are relocating, comparing offers, or checking what their landlord's city costs them at tax time.",
  useCases: [
    "An employee weighing a Mumbai offer against a Bengaluru offer at the same CTC, and quantifying the extra HRA exemption Mumbai's 50% cap allows.",
    "Someone who moved from Chennai to Coimbatore mid-year, running the calculation for each block of months separately.",
    "A payroll or HR team explaining to a Hyderabad employee why the 50% rate does not apply there even though Hyderabad is a metro for every other purpose.",
  ],
  benefits: [
    ["All three limits shown", "See the actual HRA, the rent-minus-10% figure and the percentage cap side by side, and which one is binding."],
    ["Tax value, not just exemption", "Converts the exemption gap into rupees of tax at your slab plus the 4% health and education cess."],
    ["Break-even rent", "Tells you the monthly rent below which the metro and non-metro answers are identical on your salary."],
  ],
  faqs: [
    [
      "Which cities count as metro for HRA exemption?",
      "Only four: Delhi, Mumbai, Kolkata and Chennai. Rule 2A names them specifically, so Bengaluru, Hyderabad, Pune, Ahmedabad, Gurugram and Noida all use the 40% rate even though they are large cities. Living in Delhi qualifies; living in Noida or Gurugram does not.",
    ],
    [
      "How is HRA exemption calculated under Rule 2A?",
      "The exemption is the lowest of three figures: the HRA actually received, the rent you paid minus 10% of salary, and 50% of salary for the four metro cities or 40% of salary elsewhere. 'Salary' means basic pay plus dearness allowance that counts for retirement benefits plus commission fixed as a percentage of turnover — no other allowance.",
    ],
    [
      "How much extra tax does the 50% metro cap actually save?",
      "Only the difference between the two caps, and only when that cap is the binding limit. On a basic of ₹60,000 a month with ₹30,000 HRA and ₹35,000 rent, the metro exemption is ₹3,48,000 against ₹2,88,000 non-metro — a ₹60,000 gap worth ₹18,720 at the 30% slab plus 4% cess. If your rent is low or your HRA is small, the gap is zero.",
    ],
    [
      "Can I claim HRA exemption under the new tax regime?",
      "No. Section 115BAC, the default regime from AY 2024-25, withdraws the section 10(13A) HRA exemption along with most other deductions. You have to opt for the old regime to claim it, so compare the total tax under both regimes before deciding.",
    ],
  ],
};

export default seo;
