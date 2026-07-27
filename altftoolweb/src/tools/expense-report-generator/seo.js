const seo = {
  intro:
    "An expense report is the schedule of business bills an employee submits to be paid back, and this generator builds it line by line: bill total, the GST on it, the category it belongs to, and how it was paid. It separates the GST you can take input credit on from the GST that Section 17(5) of the CGST Act, 2017 blocks — food, outdoor catering, club membership and most vehicle hire — and settles the claim against any advance already drawn. Cash payments above ₹10,000 are flagged because Section 40A(3) of the Income-tax Act, 1961 can disallow them as a deduction.",
  useCases: [
    "Closing a three-day sales trip: air fare, hotel, cabs and client meals totalled and settled against a ₹10,000 advance.",
    "Splitting a claim into rebillable client costs and internal costs before raising the client invoice.",
    "Checking, before submission, which lines carry GST the company can actually recover and which are a straight cost.",
  ],
  benefits: [
    [
      "Credit versus cost, separated",
      "Blocked-credit heads are identified per line so finance is not left claiming GST it cannot take.",
    ],
    [
      "Advance settled automatically",
      "The report shows whether money is payable to you or has to be returned, not just a gross total.",
    ],
    [
      "Compliance flags as you type",
      "Cash payments over ₹10,000, missing receipts and lines above your approval limit are marked before the claim goes in.",
    ],
  ],
  faqs: [
    [
      "Is an expense reimbursement taxable as salary?",
      "No, where it is a reimbursement of actual expenditure incurred for the employer's business and is supported by bills. Without supporting bills, or where the payment is a fixed allowance rather than a reimbursement, it can be treated as a taxable perquisite or allowance, so keep the receipts with the claim and confirm the treatment with your payroll team.",
    ],
    [
      "Can a company claim GST input credit on employee meal and cab bills?",
      "Generally no. Section 17(5)(b) of the CGST Act, 2017 blocks input tax credit on food and beverages, outdoor catering, club and health-club membership, and on renting or hiring motor vehicles seating up to thirteen persons, unless the employer is obliged to provide them under a law in force or supplies the same category onward. Hotel accommodation is different — credit is available, but only if the hotel is in the state where the company is registered, because the place of supply is the hotel's location.",
    ],
    [
      "What is the cash limit for business expenses in India?",
      "₹10,000 per person per day. Section 40A(3) of the Income-tax Act, 1961 disallows a business expenditure where payment above that figure is made otherwise than by account payee cheque, bank draft or a prescribed electronic mode; the ceiling rises to ₹35,000 for payments to a goods-carriage operator. Rule 6DD lists narrow exceptions.",
    ],
    [
      "What should an expense report include?",
      "Date, category, description, bill value, the GST shown separately, how it was paid, and whether a receipt is attached. Adding the advance drawn and a rebillable flag makes the report self-settling: reimbursable total minus advance is the amount actually payable to the employee.",
    ],
  ],
};

export default seo;
