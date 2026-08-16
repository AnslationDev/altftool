const seo = {
  title: "Security Deposit Refund Calculator",
  metaDescription:
    "Itemise unpaid rent, notice shortfall, utilities and damage against the deposit, add agreed interest, and test it against the Model Tenancy Act cap.",
  steps: [
    "Enter Deposit paid (INR) and Monthly rent (INR), then pick Residential or Non-residential and a Daily rent basis for part months (30-day or 365-day).",
    "Fill the Deductions grid: unpaid rent months, Notice period shortfall (days), unpaid utilities and society dues, Damage beyond normal wear and tear, and painting or deep cleaning.",
    "Read Refund due to the tenant, the Deduction breakdown table and the Model Tenancy Act guide cap row, then press Copy result for the itemised statement.",
  ],
  intro:
    "This calculator works out the rental security deposit due back on moving out, subtracting the amounts a landlord can lawfully hold — unpaid rent, a notice period cut short, unpaid utilities and society dues, damage beyond normal wear and tear, and any painting or cleaning the agreement allows. It converts a part month into a daily figure on either a 30-day or a 365-day basis, adds simple interest where the agreement promises it, and compares the deposit against the two-month residential and six-month non-residential ceilings in section 11(1) of the Model Tenancy Act, 2021. Landlord and tenant can both use the same breakdown to settle without argument.",
  useCases: [
    "Settling a move-out where fifteen days of notice were missed and the landlord wants pro-rata rent deducted.",
    "Checking whether a Rs 2,00,000 deposit on Rs 25,000 rent is out of line with the Model Tenancy Act benchmark.",
    "Producing an itemised statement of deductions so the tenant can see exactly what was withheld and why.",
  ],
  benefits: [
    ["Itemised, not lump sum", "Every deduction is listed separately so an unexplained round figure has nowhere to hide."],
    ["Two daily-rent bases", "Prices a part month on a 30-day month or on actual days, whichever the agreement uses."],
    ["Handles a negative balance", "When deductions exceed the deposit, it shows what the tenant still owes instead of a zero."],
  ],
  faqs: [
    [
      "What can a landlord deduct from a security deposit?",
      "Rent still unpaid, dues under the agreement such as electricity, water and society charges, rent for a notice period the tenant did not serve, and the cost of repairing damage that goes beyond normal wear and tear. Faded paint, minor scuffs and ordinary ageing of fittings are not deductible, and a landlord claiming repair costs should be able to show bills.",
    ],
    [
      "What is the maximum security deposit in India?",
      "Section 11(1) of the Model Tenancy Act, 2021 caps it at two months' rent for residential premises and six months' rent for non-residential premises. That Act is a template, so it applies only in states and union territories that have enacted or notified it; elsewhere the agreement and local rent legislation decide.",
    ],
    [
      "When must a landlord return the security deposit?",
      "Section 11(2) of the Model Tenancy Act requires the refund on the date the landlord takes vacant possession, after deducting the tenant's liabilities. Many agreements instead give a window of fifteen to thirty days, so the clause you signed is the first place to look.",
    ],
    [
      "What if the landlord refuses to refund the deposit?",
      "Send a written demand with the itemised statement and the dates first, since that is usually what settles it. If it fails, states that have adopted the Model Tenancy Act provide a Rent Authority to hear the claim; elsewhere the route is a civil suit or the consumer forum. Take legal advice before filing rather than relying on a calculator.",
    ],
  ],
};

export default seo;
