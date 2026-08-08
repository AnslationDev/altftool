const seo = {
  title: "Rent Receipt Generator for HRA — Up to 24 Months",
  metaDescription:
    "Print up to 24 monthly rent receipts with amount in words, landlord PAN when annual rent tops ₹1,00,000, and the ₹1 stamp flag for cash above ₹5,000.",
  steps: [
    "Fill Tenant name, Landlord name, 'Landlord PAN', 'Place of signing', 'Rented property address', 'Monthly rent (₹)' and 'Starting month'.",
    "Set 'Number of months' anywhere from 1 to 24 and a Payment mode of Bank transfer, UPI, Cheque or Cash — Cash above ₹5,000 raises the 'Affix ₹1 stamp' flag.",
    "Check 'Landlord PAN required?' against the ₹1,00,000 annual threshold, then press Print to send each receipt to its own page, or Copy result for the text version.",
  ],
  "intro": "Rent Receipt Generator for HRA turns one set of details — tenant, landlord, PAN, property address and monthly rent — into a printable receipt for every month you choose, up to twenty-four. Each receipt carries the amount in figures and in words, the rent period, the payment mode and a landlord signature line, and the tool flags the two things that get HRA claims rejected: a missing landlord PAN when annual rent crosses ₹1,00,000, and a missing revenue stamp on cash payments above ₹5,000. Built for salaried employees submitting proofs to payroll.",
  "useCases": [
    "Produce twelve months of receipts in one go for your employer's investment proof deadline.",
    "Recreate receipts for a past financial year before filing your income tax return.",
    "Hand a landlord a ready-to-sign receipt book instead of asking for one each month."
  ],
  "benefits": [
    [
      "PAN rule built in",
      "The tool checks the ₹1,00,000 annual rent threshold and warns when the landlord's PAN is missing or malformed."
    ],
    [
      "Amount in words",
      "Rent is spelled out in the Indian numbering system automatically, so nothing has to be written by hand."
    ],
    [
      "Print or save as PDF",
      "One click prints each receipt on its own page; everything is generated locally with no upload."
    ]
  ],
  "faqs": [
    [
      "When is the landlord's PAN mandatory for an HRA claim?",
      "When your rent exceeds ₹1,00,000 in a financial year. If the landlord has no PAN, you can submit a signed declaration from them along with their name and address."
    ],
    [
      "Do rent receipts need a revenue stamp?",
      "Only for cash payments above ₹5,000, where a ₹1 revenue stamp with the landlord's signature across it is the usual practice. Bank transfer, UPI and cheque payments do not need one."
    ],
    [
      "Can I claim HRA if I pay rent to a parent?",
      "Yes, provided the arrangement is genuine — the property must be owned by them, rent must actually be paid, and they must report the rent as income in their own return."
    ],
    [
      "Is HRA exemption available in the new tax regime?",
      "No. HRA exemption under Section 10(13A) is only available in the old regime. Employees on the new regime get the ₹75,000 standard deduction instead."
    ]
  ]
};

export default seo;
