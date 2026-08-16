const seo = {
  title: "Traffic Challan Tracker: Overdue & Payoff Plan",
  metaDescription:
    "Log e-challans privately in your browser: each offence shows its Motor Vehicles Act section and central penalty, with overdue flags and months to clear.",
  steps: [
    "Set Check against date, the Payment window (days) your state uses, and a Monthly budget (INR).",
    "Press Add challan for each fine, pick the Offence — the option shows its Motor Vehicles Act section — and enter Amount on the challan (INR) and Issued on.",
    "Read the Pending total, how many sit past the payment window, and Months to clear at your budget above the Payment queue table, then press Copy result.",
  ],
  intro:
    "This tracker keeps a private ledger of traffic fines: pick the offence, enter the amount printed on the challan and the date it was issued, and it returns what is still pending, what has slipped past your state's payment window, and how many months a fixed monthly budget needs to clear the balance. The offence list carries the central penalty and the section from the Motor Vehicles (Amendment) Act, 2019, so you can see when a challan is larger than the statutory figure. Everything is stored in your browser only.",
  useCases: [
    "Keeping every e-challan for a household's two vehicles in one place instead of across SMS and email",
    "Spotting a fine that has gone past the payment window before it is referred to a court",
    "Planning how many months at ₹2,000 it takes to clear a pending balance after a bad quarter",
  ],
  benefits: [
    ["Statute against the ticket", "Shows the section and central penalty next to what you were actually charged."],
    ["Overdue is explicit", "Uses your state's payment window to separate open challans from ones that have run out of time."],
    ["Stays private", "Challan numbers and registrations are held in browser storage and never uploaded."],
  ],
  faqs: [
    [
      "What is the fine for driving without a helmet in India?",
      "₹1,000 under section 194D of the Motor Vehicles Act, along with disqualification from holding a licence for three months. That is the central amount set by the 2019 amendment; a few states have notified lower figures under the same section, so check what your challan says.",
    ],
    [
      "How long do I have to pay a traffic challan?",
      "It depends on your state. Rule 167A of the Central Motor Vehicles Rules requires an electronically detected offence to be notified within fifteen days, and states then set their own period — commonly 60 days — before an unpaid challan is sent to a virtual court or a Lok Adalat. Set that window in the tool to match your state.",
    ],
    [
      "What happens if I never pay an e-challan?",
      "The challan is referred to a court, which can summon you, and unpaid challans commonly block services such as transferring ownership or renewing fitness. Courts can also order licence suspension for repeat offences. If a challan has reached court, get advice from a lawyer rather than relying on a tracker.",
    ],
    [
      "How do I check for pending challans against my vehicle?",
      "Use the official e-challan service run by the Ministry of Road Transport and Highways, or your state traffic police portal, searching by registration number, challan number or driving licence. This tool only records what you enter — it cannot look anything up, which is also why nothing you type leaves your device.",
    ],
  ],
};

export default seo;
