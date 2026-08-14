const seo = {
  title: "GST Late Fee Calculator with Interest under Section 50",
  metaDescription:
    "Per-day late fee for GSTR-1, GSTR-3B and GSTR-9 with turnover-linked caps, plus 18% Section 50 interest on tax paid late in cash.",
  steps: [
    "Pick GSTR-3B, GSTR-1 or GSTR-9 under Return, set the Due date and Actual filing date, and tick \"This is a nil return\" if no tax was payable.",
    "Choose the Turnover slab that sets the late fee cap — or enter Annual turnover (INR) for GSTR-9 — plus the Tax paid late, in cash (INR) for GSTR-3B interest.",
    "Read the Total payable split into the capped late fee and Interest @ 18% p.a., then press Copy summary for the day count and breakdown.",
  ],
  intro:
    "This calculator works out what a late GST return actually costs: the per-day late fee for GSTR-1, GSTR-3B or GSTR-9 up to the turnover-linked cap, plus interest under section 50(1) of the CGST Act at 18% a year on the tax you paid late in cash. It counts the whole days between the due date and the actual filing date, applies the combined CGST + SGST rate, and stops the fee at the cap for your turnover slab. It is meant for taxpayers and accountants reconciling a delayed filing before they pay.",
  useCases: [
    "You filed a monthly GSTR-3B twenty-five days after the 20th and want to know whether the ₹50-a-day fee has already hit the cap for your slab",
    "A client with nil outward supplies missed two quarterly GSTR-1 filings and you need the nil-return figure rather than the regular one",
    "You are settling an annual GSTR-9 filed months late and need the 0.04%-per-day turnover fee checked against the 0.50% ceiling",
  ],
  benefits: [
    [
      "Cap logic, not just multiplication",
      "Shows the uncapped fee alongside the capped one, so you can see exactly when the ceiling took over.",
    ],
    [
      "Separates fee from interest",
      "GSTR-1 and GSTR-9 carry no tax payment, so section 50 interest is correctly left out of those two.",
    ],
    [
      "Cash-only interest base",
      "Interest is computed on the tax you settled in cash, since credit set off against the liability does not attract it.",
    ],
  ],
  faqs: [
    [
      "How much is the GST late fee per day?",
      "For a regular GSTR-3B or GSTR-1 it is ₹50 per day combined — ₹25 under CGST and ₹25 under SGST. A nil return is charged ₹20 per day combined and is capped at ₹500. GSTR-9 is different: it runs at 0.04% of annual turnover per day.",
    ],
    [
      "What is the maximum late fee I can be charged?",
      "It depends on the return and your turnover. GSTR-3B caps at ₹5,000 for turnover up to ₹1.5 crore and ₹10,000 above that; GSTR-1 caps at ₹2,000, ₹5,000 and ₹10,000 across the up-to-₹1.5-crore, ₹1.5–5-crore and above-₹5-crore slabs; GSTR-9 caps at 0.50% of annual turnover.",
    ],
    [
      "What rate of interest applies on late GST payment?",
      "18% a year under section 50(1) of the CGST Act, charged for the number of days the tax stayed unpaid. The calculator applies it as tax × 18% × days ÷ 365, on the cash portion of the liability only — tax discharged from input tax credit does not attract it.",
    ],
    [
      "Does the figure include amnesty or waiver notifications?",
      "No. The result reflects the standard statutory rates and caps only; conditional waivers and amnesty schemes announced by notification are not applied. Check the notification in force for your tax period, and confirm with your tax adviser before paying — this is informational, not tax advice.",
    ],
  ],
};

export default seo;
