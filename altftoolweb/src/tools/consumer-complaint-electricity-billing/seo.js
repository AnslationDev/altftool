const seo = {
  title: "Electricity Bill Complaint Letter + Meter Proof",
  metaDescription:
    "Compare metered units with billed units, get the overcharge in rupees, and draft a DISCOM letter citing CGRF under section 42(5) of the Electricity Act.",
  intro:
    "This tool compares the units your electricity meter actually recorded against the units the DISCOM charged you, then drafts a formal billing complaint around that gap. It derives the effective per-unit rate from your own bill, shows how much of the demand the meter does not support, and cites the escalation ladder created by the Electricity Act, 2003 — section office, then the Consumer Grievance Redressal Forum under section 42(5), then the Electricity Ombudsman under section 42(6). It is meant for households and small commercial consumers who have received an estimated, doubled or unexplained bill and want a letter that quotes numbers instead of adjectives.",
  useCases: [
    "Your premises were locked all month but the bill shows 600 units on an 'estimated' reading — show the meter photograph reading against the billed units.",
    "The bill has jumped from about Rs 2,900 to Rs 5,580 with no change in appliances, and you need a written complaint with a docket number before the due date.",
    "A meter with a multiplying factor was billed at MF 1 (or the other way round) and you need the corrected unit count spelled out.",
    "An old arrear has appeared on the current bill with no break-up, and you want it disputed in writing so no disconnection follows.",
  ],
  benefits: [
    ["Numbers, not adjectives", "The letter states metered units, billed units, the derived rate and the excess amount, which is what a billing officer can act on."],
    ["Correct escalation path", "Section office, nodal officer, CGRF under section 42(5), then the Electricity Ombudsman under section 42(6) — in the order the Act requires."],
    ["Meter-test request built in", "Asks for testing in your presence and for the test report, the step that resolves most defective-meter disputes."],
  ],
  faqs: [
    [
      "How do I complain about a wrong electricity bill in India?",
      "Submit a written complaint to your DISCOM's section or billing office and insist on a docket number, attaching the disputed bill, the last three bills and a dated photograph of the meter showing the current reading. If it is not resolved, escalate to the Consumer Grievance Redressal Forum that every distribution licensee must maintain under section 42(5) of the Electricity Act, 2003, and then to the Electricity Ombudsman under section 42(6).",
    ],
    [
      "Can my electricity connection be disconnected while a billing complaint is pending?",
      "You should ask in writing that no disconnection be effected on the disputed amount while the complaint is under consideration, and most state supply codes let you deposit an interim amount based on your past average pending resolution. The exact interim-payment rule is fixed by your State Electricity Regulatory Commission, so check your state's supply code or ask the section office what deposit protects the connection.",
    ],
    [
      "How do I know if my electricity meter is faulty?",
      "Compare the difference between two meter readings with the units billed and with your usual consumption; a persistent gap, a bill raised without any reading, or a meter that keeps running with the mains off all point to a defect. Under the Electricity (Rights of Consumers) Rules, 2020 you can ask the licensee to test the meter, and if it is found defective the bill for the affected period must be revised.",
    ],
    [
      "How long does the DISCOM have to reply to a billing complaint?",
      "Most State Electricity Regulatory Commissions set roughly seven days for billing complaints in their Standards of Performance notified under section 57 of the Electricity Act, 2003, and several also prescribe compensation when the limit is missed. The exact number of days and the compensation amount vary by state, so quote your own state's Standards of Performance regulation in the letter.",
    ],
  ],
};

export default seo;
