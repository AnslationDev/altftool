const seo = {
  title: "TDS Calculator Section 194J: 10%, 2% and No-PAN",
  metaDescription:
    "Works out 194J TDS on professional or technical fees at 10% or 2%, applies the yearly aggregate exemption limit, and the 206AA 20% rate without PAN.",
  steps: [
    "Choose the 'Nature of payment' — each option shows its 10% or 2% rate — and the 'Financial year', which sets the Rs 50,000 or Rs 30,000 threshold.",
    "Enter 'Amount being paid or credited now (INR)' and 'Already paid to this payee this year (INR)', and untick 'Payee has furnished a valid PAN' if none is on file.",
    "Read 'TDS to deduct now' with the rate applied, the yearly aggregate and 'Net amount payable to the payee', then press 'Copy result'.",
  ],
  intro:
    "This calculator works out the tax deductible at source under section 194J of the Income-tax Act on fees for professional services, fees for technical services, royalty, non-compete payments and director's remuneration. It applies the 10% general rate and the 2% rate reserved for technical services, film-distribution royalty and call-centre payments, tests the yearly aggregate against the exemption limit in the first proviso, and switches to the 20% section 206AA rate when no PAN is on file. Useful for accounts teams cutting vendor payments and for freelancers checking the deduction on their own invoice.",
  useCases: [
    "A company paying a chartered accountant Rs 1.5 lakh in fees needs the exact deduction and the net cheque amount",
    "A startup paying an IT support vendor wants to confirm the 2% technical-services rate rather than 10%",
    "A finance team that has already paid Rs 40,000 to a consultant checks how much TDS the next Rs 20,000 invoice attracts once the threshold is crossed",
  ],
  benefits: [
    ["Both rates handled", "Separates the 10% professional rate from the 2% technical, film-royalty and call-centre rate."],
    ["Aggregate threshold logic", "Deducts on the whole yearly total once the limit is crossed, not just on the excess."],
    ["No-PAN case built in", "Applies the section 206AA rate of 20% when the payee has not furnished a PAN."],
  ],
  faqs: [
    [
      "What is the TDS rate under section 194J?",
      "10% for fees for professional services, royalty, non-compete fees and director's remuneration, and 2% for fees for technical services that are not professional services, royalty for the sale, distribution or exhibition of cinematographic films, and payments to a payee engaged only in operating a call centre. No surcharge or cess is added when the payee is a resident.",
    ],
    [
      "What is the threshold limit for TDS under 194J?",
      "Rs 50,000 paid or credited to one payee during the financial year for each category of payment, raised from Rs 30,000 by the Finance Act 2025 with effect from 1 April 2025. Director's remuneration under section 194J(1)(ba) has no threshold and is deducted from the first rupee.",
    ],
    [
      "Do I deduct TDS only on the amount above Rs 50,000?",
      "No. The limit is an exemption ceiling, not a slab. Once the yearly aggregate to that payee crosses Rs 50,000, tax is deducted on the entire aggregate including the amounts already paid earlier in the year, so the payment that breaches the limit carries the catch-up deduction too.",
    ],
    [
      "Does an individual or proprietor have to deduct TDS under 194J?",
      "Only if their accounts were subject to tax audit under section 44AB in the preceding financial year, and not for payments made exclusively for personal purposes. An individual outside that net may still fall under section 194M, which requires 5% deduction once payments to one professional or contractor exceed Rs 50 lakh in the year. Check your audit position with a tax professional.",
    ],
  ],
};

export default seo;
