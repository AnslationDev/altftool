const seo = {
  title: "RTI Application to an Electricity Board, Drafted",
  metaDescription:
    "Draft a Section 6(1) RTI over a connection delay, disputed bill or meter record, framed on the Electricity Act, with reply and appeal dates calculated.",
  steps: [
    "Enter your full name, consumer or application number, the distribution company or board and its section, sub-division or circle, plus the Records from and Records to dates and the date the RTI is filed on.",
    "Pick what the dispute is about, tick any extra questions to add, and flag a BPL card (fee exempt), a privately owned licensee, or a request to inspect the records first.",
    "Read the reply due date under Section 7(1) with the Section 6(3) transfer and Section 19(1) and 19(3) appeal deadlines, then press Copy application.",
  ],
  intro:
    "This tool drafts an application under Section 6(1) of the Right to Information Act 2005 to an electricity distribution licensee, asking for the specific records behind a delayed new connection, a disputed bill, a suspect meter or an assessment notice. The questions are framed against the Electricity Act 2003 — Section 43(1) for the one-month supply obligation, Section 55(1) for metered supply, Section 56(2) for the two-year bar on recovering arrears and Section 57 for standards of performance — so each one names a document the office is required to hold. It also calculates the Section 7(1) reply date, the appeal windows, the days of default on a pending connection and the age of a disputed arrear.",
  useCases: [
    "Get the meter reading sheet and calculation for a bill that suddenly tripled, instead of a call-centre explanation.",
    "Establish how long a new connection has been pending past the one-month deadline before approaching the Consumer Grievance Redressal Forum.",
    "Obtain the meter test report and change report when a meter is replaced and the closing reading is disputed.",
    "Check whether an arrear demand crosses the two-year line in Section 56(2) before paying it under protest.",
  ],
  benefits: [
    ["Records, not opinions", "Each query names a ledger, register, test report or noting sheet rather than asking the office to explain itself."],
    ["Electricity Act framing", "Questions are anchored to Sections 43, 55, 56, 57 and 126, which makes a bare refusal harder to sustain."],
    ["Private licensee route flagged", "If your discom is privately owned the tool points you to the regulatory commission and the state department instead."],
  ],
  faqs: [
    [
      "How long does an electricity board have to give a new connection?",
      "One month from receipt of the application under Section 43(1) of the Electricity Act 2003, except where the State Commission has fixed a longer period because mains have to be extended or a sub-station commissioned. Section 43(3) makes a defaulting licensee liable to a penalty of up to Rs 1,000 for each day of default, imposed by the appropriate Commission.",
    ],
    [
      "Can I file an RTI against a private electricity company?",
      "Usually not directly. A state-owned distribution company is a public authority under Section 2(h) of the RTI Act, but a private licensee generally is not. The workable route is to seek the same records from the State Electricity Regulatory Commission and the state power department, which hold licence conditions and compliance filings, and to file a grievance with the Consumer Grievance Redressal Forum under Section 42(5) of the Electricity Act 2003.",
    ],
    [
      "How old can an electricity arrear be before it cannot be recovered?",
      "Section 56(2) of the Electricity Act 2003 bars recovery of a sum due for electricity supplied after two years from the date it first became due, unless the sum has been shown continuously as a recoverable arrear of charges. Asking for the date the amount first became due, and for the ledger showing whether it was carried forward, is how you test that.",
    ],
    [
      "What documents should I ask for in a billing dispute RTI?",
      "Ask for the meter reading sheet with each reading and its date, the calculation sheet showing tariff category and units billed, whether the bill was actual or estimated with the regulation permitting estimation, the full consumer ledger, and the action taken on each complaint you filed. This is general information, not legal advice; a Consumer Grievance Redressal Forum complaint runs in parallel with the RTI.",
    ],
  ],
};

export default seo;
