const seo = {
  title: "80G Donation Receipt Format: Deduction Worked Out",
  metaDescription:
    "Build a donation receipt carrying 12A/12AB, 80G approval, both PANs and the amount in words, and see the deduction after the 10% qualifying limit.",
  steps: [
    "Under Donation enter the amount received in INR, mode of payment, transaction reference and purpose, then pick the 80G category, the donor's adjusted gross total income and their tax regime.",
    "Fill the Donor block — name, PAN, address, receipt number and receipt date — and the Institution block with its PAN, 12A/12AB registration, 80G approval number and validity, URN and FCRA number.",
    "Check the deduction after the 10% qualifying limit and the Receipt preview with the amount in Indian words, then press Copy receipt.",
  ],
  intro:
    "A donation receipt is only useful to the donor if it carries the institution's 12A/12AB registration, its 80G approval number and validity, the PAN of both sides, the amount in words and the mode of payment — this generator assembles all of that in the standard Indian format. It also computes the deduction the donor can actually claim under section 80G of the Income-tax Act, 1961, applying the 10% of adjusted gross total income qualifying limit where the category carries one, and blocking the deduction for cash donations above Rs 2,000 under section 80G(5D) or for anyone taxed under the new regime. The receipt closes with the Form 10BD and Form 10BE commitment that every donee institution now has.",
  useCases: [
    "Issue a numbered receipt to a donor immediately after a UPI or bank transfer, with the 80G particulars filled in.",
    "Show a large donor how much of a Rs 1,50,000 gift actually qualifies once the 10% of income cap is applied.",
    "Flag to a walk-in cash donor that anything above Rs 2,000 has to be paid by a non-cash mode to be deductible.",
    "Add the FCRA registration number and the designated-account declaration to receipts for foreign contributions.",
  ],
  benefits: [
    ["Deduction computed, not assumed", "Applies the category rate and the qualifying limit rather than printing a flat 50% claim."],
    ["Amount in Indian words", "Spells lakh and crore correctly, including paise, so the receipt stands up to scrutiny."],
    ["Compliance fields prompted", "12A/12AB, 80G approval and validity, URN, FCRA number and the Form 10BE undertaking are all built into the layout."],
  ],
  faqs: [
    [
      "What details must a donation receipt contain for an 80G claim?",
      "The name, address and PAN of the institution, its 12A/12AB registration and 80G approval numbers with validity, the donor's name, address and PAN, the receipt number and date, the amount in figures and words, and the mode of payment. Without the donor's PAN the institution cannot report the donation in Form 10BD or issue the Form 10BE certificate.",
    ],
    [
      "Is a cash donation eligible for 80G deduction?",
      "Only up to Rs 2,000. Section 80G(5D) disallows a deduction for any sum exceeding Rs 2,000 paid in cash, a threshold reduced from Rs 10,000 by the Finance Act, 2017. Cheque, demand draft, NEFT, UPI and card payments have no such cap.",
    ],
    [
      "What is the 10% qualifying limit under section 80G?",
      "For the categories that carry a limit, the donation eligible for deduction is capped at 10% of the donor's adjusted gross total income, and the 50% or 100% rate applies to that capped figure. So on an adjusted gross total income of Rs 8,00,000, a Rs 1,50,000 donation in the 50%-with-limit category yields a deduction of Rs 40,000, not Rs 75,000.",
    ],
    [
      "Can a donor claim 80G under the new tax regime?",
      "No. Section 115BAC(1A), the default regime, disallows most Chapter VI-A deductions including section 80G. The receipt is still valid and the institution must still report the donation, but the donor gets the deduction only if they opt for the old regime. Confirm the position with a chartered accountant before relying on it.",
    ],
  ],
};

export default seo;
