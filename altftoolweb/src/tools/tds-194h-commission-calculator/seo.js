const seo = {
  title: "TDS on Commission Calculator: Section 194H at 2%",
  metaDescription:
    "Section 194H TDS at 2% from 1 October 2024 (5% before) against the Rs 20,000 yearly limit, with the catch-up deduction when the limit is crossed.",
  steps: [
    "Enter Commission or brokerage being paid (INR), Commission already paid to this payee this year (INR) and the Date of payment or credit, which decides the 5% or 2% rate.",
    "Untick Agent has furnished a valid PAN to apply the 20% section 206AA rate, or untick Payer is required to deduct under 194H for an individual or HUF not audited under section 44AB.",
    "Read TDS to deduct now with the Rate applied, Annual exemption limit, Yearly aggregate and Net amount payable to the agent rows, then press Copy result.",
  ],
  intro:
    "This calculator applies section 194H of the Income-tax Act to a commission or brokerage payment, picking the rate and the threshold from the date of payment: 2% for payments made on or after 1 October 2024 (5% before that), against an annual exemption of Rs 20,000 from FY 2025-26 and Rs 15,000 earlier. Because the limit is tested on the financial-year aggregate paid to one agent, it also shows the catch-up deduction on the payment that breaches the limit. Built for businesses paying sales agents, distributors and brokers, and for agents checking their own net receipt.",
  useCases: [
    "A distributor paying a sales agent Rs 50,000 needs the deduction and the net cheque figure",
    "A real estate firm settling a broker's 2% fee on a Rs 25 lakh sale wants the commission and the TDS in one place",
    "An accounts team compares a September 2024 payment at 5% with an October 2024 payment at 2% on the same invoice",
  ],
  benefits: [
    ["Date-driven rate", "Applies 5% or 2% from the actual date of payment rather than guessing the year."],
    ["Threshold change handled", "Uses Rs 20,000 from FY 2025-26 and Rs 15,000 for earlier years automatically."],
    ["Commission helper", "Derives the fee from a transaction value and percentage before computing the deduction."],
  ],
  faqs: [
    [
      "What is the TDS rate on commission under section 194H?",
      "2% for commission or brokerage paid or credited on or after 1 October 2024, down from 5% earlier, following the Finance (No. 2) Act 2024. Payments to residents carry no surcharge or health and education cess.",
    ],
    [
      "What is the threshold limit for TDS on commission?",
      "Rs 20,000 of aggregate commission or brokerage to one payee in a financial year from FY 2025-26 onwards, raised from Rs 15,000 by the Finance Act 2025. Once the yearly total crosses the limit, tax is deducted on the entire aggregate, including the payments made earlier in that year.",
    ],
    [
      "Is TDS deducted on insurance commission under 194H?",
      "No. Insurance commission is covered by section 194D, which has its own rate and threshold. Section 194H also excludes brokerage on transactions in securities and payments for professional services, which fall under section 194J.",
    ],
    [
      "Is a trade discount treated as commission for TDS?",
      "Generally no, if the parties deal on a principal-to-principal basis and the discount simply reduces the sale price. Commission implies an agency relationship where the payee acts on behalf of the payer. The distinction is fact-specific and has been litigated often, so have your distributor agreement reviewed by a tax professional before deciding.",
    ],
  ],
};

export default seo;
