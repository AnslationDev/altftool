const seo = {
  title: "Rent Receipt Generator: PAN, Revenue Stamp",
  metaDescription:
    "Builds monthly HRA rent receipts with the amount in words, and flags the Re 1 stamp above ₹5,000 cash, landlord PAN above ₹1 lakh and 194-IB TDS.",
  steps: [
    "Fill Monthly rent (INR), First month of rent, Number of receipts (1 to 60) and How the rent was paid — Cash, or Bank transfer, UPI or cheque — plus the tenant, landlord, PAN, prefix and address fields.",
    "Tick \"I am an individual or HUF not subject to a tax audit\" to apply section 194-IB, and read the rows for Landlord PAN needed, Revenue stamp on each receipt and Section 194-IB TDS.",
    "Each receipt appears under Your receipts with the amount in figures and words, the rent period, a dashed \"Affix Re 1 revenue stamp\" box where cash rent needs one and a Landlord signature line; Print outputs them without the controls and Copy result copies them as text.",
  ],
  intro:
    "This generator builds a month-by-month set of Indian rent receipts, each with the rent period, the amount in words using the lakh and crore system, and a signature block, then applies the three rules that decide whether a receipt will actually hold up: the landlord PAN requirement above Rs 1,00,000 of annual rent under CBDT Circular 8/2013, the Re 1 revenue stamp on cash receipts above Rs 5,000 under Article 53 of the Indian Stamp Act, and section 194-IB TDS once monthly rent exceeds Rs 50,000. It is meant for salaried tenants assembling HRA proof and for landlords issuing receipts.",
  useCases: [
    "Producing twelve receipts for a financial year in one go when the employer asks for HRA proof in January.",
    "Checking whether a Rs 15,000 cash rent receipt needs a revenue stamp before the landlord signs it.",
    "Working out the section 194-IB deduction on Rs 60,000 monthly rent and the Form 26QC deadline that follows.",
  ],
  benefits: [
    ["Amount in words", "Writes the figure out in the Indian lakh and crore system, which most templates get wrong."],
    ["Correct triggers", "Applies the PAN, stamp duty and 194-IB thresholds instead of leaving you to guess."],
    ["Print-ready", "Each receipt prints on its own without the tool's controls, with the stamp box already marked."],
  ],
  faqs: [
    [
      "Is a revenue stamp required on a rent receipt?",
      "A Re 1 revenue stamp is required where the receipt is for cash exceeding Rs 5,000, under Article 53 of Schedule I to the Indian Stamp Act, 1899, and the landlord signs across it. Rent paid by bank transfer, UPI or cheque already leaves a record, so receipts for it are not stamped in practice.",
    ],
    [
      "When is the landlord's PAN mandatory for HRA?",
      "Once the rent you pay in the financial year exceeds Rs 1,00,000, CBDT Circular No. 8/2013 requires you to report the landlord's PAN to your employer. If the landlord has no PAN, a signed declaration from them takes its place, and without either the employer can refuse the exemption.",
    ],
    [
      "Do I have to deduct TDS on rent I pay?",
      "Yes, if you are an individual or HUF not subject to tax audit and monthly rent exceeds Rs 50,000. Section 194-IB then requires a 2% deduction, made once in the last month of the tenancy or the financial year, capped at that last month's rent, deposited with Form 26QC within 30 days of the month ending and certified in Form 16C.",
    ],
    [
      "What details must a rent receipt contain?",
      "The tenant's name, the landlord's name, signature and address, the property address, the rent amount in figures and words, the month or period it covers, the date and the mode of payment, plus the landlord's PAN where annual rent crosses Rs 1,00,000. Receipts must reflect rent actually paid — the assessing officer can ask for the agreement and bank statements to match them.",
    ],
  ],
};

export default seo;
