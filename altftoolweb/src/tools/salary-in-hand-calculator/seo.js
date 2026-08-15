const seo = {
  title: "Salary In-Hand Calculator: CTC to Take-Home FY",
  metaDescription:
    "Turn CTC into monthly in-hand under the new regime: 12% EPF on basic, professional tax, the ₹75,000 standard deduction, 87A rebate and marginal relief.",
  steps: [
    "Enter Annual CTC (₹), drag the ₹3L–₹1Cr slider, or tap a 6 LPA, 12 LPA, 18 LPA or 30 LPA preset, then set Basic salary as a percentage of CTC anywhere from 20% to 60%.",
    "Switch the toggles Employer PF included in CTC, Cap PF at statutory ₹1,800/mo and Metro city, and set Professional tax (₹ per month).",
    "Read Monthly in-hand and Annual in-hand with the share of CTC you take home, the effective tax rate and the Where your CTC goes bar, then press Copy breakdown for the Full breakdown table.",
  ],
  intro:
    "The Salary In-Hand Calculator converts an annual CTC into monthly take-home pay under India's new tax regime for FY 2025-26, deducting employee EPF at 12% of basic, professional tax, and slab tax after the ₹75,000 standard deduction with the Section 87A rebate, marginal relief and 4% cess applied. You set the basic as a percentage of CTC, choose metro or non-metro HRA, and decide whether the employer's PF contribution sits inside the CTC figure — the three assumptions that make two offers of the same CTC pay differently. It is for anyone comparing an offer letter against what will actually land in the bank each month.",
  useCases: [
    "You have an offer at 16 LPA and want the monthly number before you accept, not the headline CTC.",
    "Two offers quote the same CTC but one folds the employer PF contribution into it — you want to see what that does to the gross.",
    "Your basic is set at 40% of CTC and HR is willing to change it; you want to see how the EPF deduction and take-home move as the basic goes up.",
  ],
  benefits: [
    [
      "Models the CTC-versus-gross gap",
      "Toggling employer PF in or out of CTC changes the gross it works from, which is where most take-home estimates go wrong.",
    ],
    [
      "Handles the rebate edge properly",
      "Applies the Section 87A rebate and marginal relief just above the threshold, so income slightly over the limit is not hit with the full slab tax.",
    ],
    [
      "PF cap as an option",
      "You can cap employee PF at the ₹1,800 statutory-wage-ceiling figure or run it uncapped at 12% of basic, matching whichever your employer actually does.",
    ],
  ],
  faqs: [
    [
      "What are the income tax slabs under the new regime for FY 2025-26?",
      "Nil up to ₹4 lakh, 5% from ₹4–8 lakh, 10% from ₹8–12 lakh, 15% from ₹12–16 lakh, 20% from ₹16–20 lakh, 25% from ₹20–24 lakh and 30% above ₹24 lakh, with 4% health and education cess on the tax. A standard deduction of ₹75,000 applies to salary income before the slabs are applied.",
    ],
    [
      "At what salary is income tax zero under the new regime?",
      "Taxable income up to ₹12 lakh attracts no tax because the Section 87A rebate wipes out the slab liability, and with the ₹75,000 standard deduction that corresponds to a salary of about ₹12.75 lakh. Just above that, marginal relief limits the tax to the amount by which income exceeds ₹12 lakh.",
    ],
    [
      "How much PF is deducted from salary?",
      "The employee contribution is 12% of basic salary, and the employer matches it. Many employers restrict it to the ₹15,000 statutory wage ceiling, which caps the deduction at ₹1,800 a month — the calculator lets you switch between the capped and uncapped treatment.",
    ],
    [
      "Why is my in-hand salary much lower than my CTC?",
      "CTC includes costs that never reach your account — most commonly the employer's PF contribution, and often gratuity, insurance premiums and variable pay — while your own PF, professional tax and income tax come out of the gross on top of that. This calculator models the new regime only, and not the old regime, 80C/80D deductions, HRA exemption, NPS, gratuity, bonuses or surcharge; treat it as informational and check your payslip or a chartered accountant for your actual liability.",
    ],
  ],
};

export default seo;
