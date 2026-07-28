const seo = {
  title: "Income Tax Calculator India — Old vs New Regime",
  h1: "Income Tax Calculator — Old vs New Regime (AY 2026-27)",
  metaDescription:
    "Free India income tax calculator, AY 2026-27: compare old vs new regime with 80C, 80D, HRA, NPS, 87A rebate, surcharge and 4% cess. Nothing uploaded.",
  intro:
    "The Income Tax Calculator runs both Indian regimes on the same income and shows which one produces the lower liability. It walks taxable income slab by slab — the AY 2026-27 new-regime bands (nil up to ₹4 lakh, then 5%, 10%, 15%, 20%, 25% and 30% above ₹24 lakh) and the age-based old-regime bands — then applies the Section 87A rebate with marginal relief, surcharge with threshold relief, and 4% health and education cess on top. Every figure is computed in JavaScript on your own device and formatted with Intl.NumberFormat in the en-IN locale; there is no server call, no signup, and your salary figures never leave the page. It is an estimate of regular individual income tax, not tax advice or a filing.",
  useCases: [
    "Decide what to put in your investment declaration: check whether ₹1.5 lakh of 80C plus HRA, 80D and NPS actually beats the new regime's ₹75,000 standard deduction on your salary.",
    "Test the ₹12 lakh rebate edge — enter a taxable income just above ₹12,00,000 and see how 87A marginal relief caps the tax at roughly the amount by which you crossed.",
    "Model a package above ₹50 lakh, where surcharge of 10% to 37% and its marginal relief start to matter, then export the two-regime comparison as CSV for your records.",
  ],
  benefits: [
    [
      "Both regimes from one input",
      "Enter salary, other income and deductions once. Old and new are computed side by side down to base slab tax, 87A rebate, surcharge, relief and cess — with the lower one flagged.",
    ],
    [
      "Rebate and relief modelled",
      "Applies the ₹60,000 87A rebate up to ₹12 lakh taxable in the new regime and ₹12,500 up to ₹5 lakh in the old, plus marginal relief for income just past the ₹12 lakh line.",
    ],
    [
      "Surcharge handled properly",
      "Adds the 10%, 15%, 25% and 37% surcharge bands (capped at 25% in the new regime) and subtracts marginal relief so tax never exceeds the excess over the threshold.",
    ],
    [
      "Copy or export the working",
      "One click copies a plain-text summary; the CSV button builds income-tax-comparison.csv locally from a Blob with all 13 comparison rows — no upload, no account.",
    ],
  ],
  faqs: [
    [
      "Old or new tax regime — which one gives less tax?",
      "It depends on how much deduction you can actually claim, and the calculator settles it by computing both. Under AY 2026-27 slabs the new regime gives a ₹75,000 standard deduction and a ₹60,000 87A rebate that wipes out tax up to ₹12 lakh taxable income, so the old regime only comes out lower when 80C, 80D, HRA, home loan interest and NPS together are large enough to offset the wider new bands. The tool labels whichever result is smaller as the suggested regime and shows the rupee gap — treat it as an estimate, not tax advice.",
    ],
    [
      "What are the new regime income tax slabs for AY 2026-27?",
      "Nil up to ₹4,00,000; 5% from ₹4,00,000 to ₹8,00,000; 10% to ₹12,00,000; 15% to ₹16,00,000; 20% to ₹20,00,000; 25% to ₹24,00,000; and 30% above ₹24,00,000. These are the exact bands this calculator uses, applied one slab at a time, with 4% health and education cess added at the end.",
    ],
    [
      "How much tax do I pay on ₹12.75 lakh salary in the new regime?",
      "Zero. A salaried resident on ₹12,75,000 gets the ₹75,000 standard deduction, leaving ₹12,00,000 taxable. Slab tax is ₹20,000 (5% on ₹4-8 lakh) plus ₹40,000 (10% on ₹8-12 lakh) = ₹60,000, and the Section 87A rebate of up to ₹60,000 cancels it entirely, so cess is nil too.",
    ],
    [
      "What happens just above ₹12 lakh — is there marginal relief?",
      "Yes, and it is built in. At ₹12,10,000 taxable the slab tax is ₹61,500, but marginal relief reduces the payable amount to the ₹10,000 by which you crossed ₹12,00,000 — about ₹10,400 after 4% cess. The calculator computes this as tax minus (taxable income − ₹12,00,000) and shows it as a separate '87A marginal relief' line.",
    ],
    [
      "Can I claim 80C, 80D or HRA under the new regime?",
      "No. In this calculator only the ₹75,000 standard deduction (if you mark yourself salaried) and employer NPS under 80CCD(2) reduce income in the new regime. 80C up to ₹1,50,000, 80D, NPS 80CCD(1B) up to ₹50,000, HRA exemption, home loan interest up to ₹2,00,000 and other deductions apply to the old regime only.",
    ],
    [
      "What are the old regime slabs for senior citizens?",
      "For ages 60 to 79 the exemption limit is ₹3,00,000, then 5% to ₹5,00,000, 20% to ₹10,00,000 and 30% above. For 80 and above it is nil to ₹5,00,000, 20% to ₹10,00,000 and 30% above, with no 5% band. Below 60 the exemption limit is ₹2,50,000. Pick your age group and the old-regime table switches automatically.",
    ],
    [
      "How are surcharge and cess calculated here?",
      "Surcharge is 10% on taxable income above ₹50 lakh, 15% above ₹1 crore, 25% above ₹2 crore, and 37% above ₹5 crore in the old regime — capped at 25% in the new regime. Marginal relief is subtracted so the total never exceeds the threshold tax plus the income above it. Health and education cess of 4% is then charged on tax plus surcharge.",
    ],
    [
      "Is this income tax calculator free, and does it send my salary anywhere?",
      "It is free with no signup, and every calculation runs in your browser. The slabs, deductions, rebate, surcharge and cess are computed in client-side JavaScript, the copy button uses your clipboard, and the CSV download is generated locally as a Blob. No income figure is transmitted to a server or stored.",
    ],
  ],
  steps: [
    "Enter salary or pension and other income, toggle Salaried and Resident, and choose your age group — below 60, 60 to 79, or 80 and above.",
    "Fill the old-regime deductions you can claim: 80C up to ₹1,50,000, 80D, NPS 80CCD(1B) up to ₹50,000, HRA exemption, home loan interest up to ₹2,00,000, and employer NPS under 80CCD(2).",
    "Press Calculate Tax to see both regimes with effective and marginal rates, open the slab-wise table for either regime, then copy the summary or download the CSV comparison.",
  ],
};

export default seo;
