const seo = {
  title: "Section 194-IB TDS on Rent Calculator for Tenants",
  metaDescription:
    "Rent over Rs 50,000 a month: 2% from 1 Oct 2024 (5% before), capped at the last month's rent, with Form 26QC and Form 16C due dates.",
  steps: [
    "Enter 'Monthly rent (INR)', 'Months of tenancy in this financial year' and 'Rent payable for the last month (INR)'.",
    "Set 'Date of deduction' to pick the 2% or 5% statutory rate, and untick 'Landlord has furnished a valid PAN' to apply the 20% section 206AA rate.",
    "Read 'TDS to deposit', 'Cap: last month's rent', 'Cap bites?' and the 'Form 26QC due' and 'Form 16C to landlord by' dates, then press 'Copy result'.",
  ],
  intro:
    "Section 194-IB makes an individual or HUF tenant deduct tax on house rent when the rent exceeds Rs 50,000 for a month or part of a month and the tenant is not covered by a tax audit. This calculator applies the 2% rate in force for deductions made on or after 1 October 2024 (5% before that), applies the section 194-IB(4) cap that stops the deduction exceeding the last month's rent, and dates the Form 26QC and Form 16C obligations. Written for salaried tenants and small professionals who pay rent from their own pocket and have no TAN.",
  useCases: [
    "A salaried tenant paying Rs 60,000 a month works out the one-time deduction to make from the March rent",
    "A tenant vacating in August needs the deduction on the months occupied plus the Form 26QC deadline for that month",
    "A tenant whose landlord will not share a PAN checks how far the 20% rate is held down by the last-month cap",
  ],
  benefits: [
    ["Correct rate by date", "Picks 2% or 5% from the date of deduction rather than the year of rent."],
    ["Statutory cap applied", "Stops the deduction exceeding the last month's rent, including in no-PAN cases."],
    ["Deadlines dated for you", "Gives the Form 26QC and Form 16C due dates and the section 234E late fee."],
  ],
  faqs: [
    [
      "What is the TDS rate on rent under section 194-IB?",
      "2% for deductions made on or after 1 October 2024, reduced from 5% by the Finance (No. 2) Act 2024. Because section 194-IB requires only one deduction in the year, the rate that applies is the one in force on the date the deduction is made.",
    ],
    [
      "When does a tenant have to deduct TDS on rent?",
      "When rent to a resident landlord exceeds Rs 50,000 for a month or part of a month and the tenant is an individual or HUF not required to deduct under section 194-I. The deduction is made once, from the rent for the last month of the financial year, or from the last month's rent if the premises are vacated earlier.",
    ],
    [
      "Do I need a TAN to deduct TDS on rent under 194-IB?",
      "No. Section 194-IB deliberately dispenses with the TAN requirement. You pay using the challan-cum-statement in Form 26QC, quoting your PAN and the landlord's PAN, within 30 days from the end of the month in which the deduction was made.",
    ],
    [
      "What if the tax works out higher than one month's rent?",
      "Section 194-IB(4) caps the deduction at the rent payable for the last month of the year or of the tenancy, so the tax can never exceed that figure. The cap matters most when no PAN is furnished and section 206AA pushes the rate to 20%, and it also matters for very high rents. Late filing of Form 26QC additionally attracts a section 234E fee of Rs 200 a day, itself capped at the tax deducted.",
    ],
  ],
};

export default seo;
