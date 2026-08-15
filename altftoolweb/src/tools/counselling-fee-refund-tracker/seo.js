const seo = {
  title: "Counselling Fee Refund Tracker: UGC 100/90/80/50/0",
  metaDescription:
    "Estimate an admission-withdrawal refund from your dates: UGC 100/90/80/50/0% slabs, an up-to-5% processing cut capped at Rs 5,000.",
  steps: [
    "Enter \"Aggregate fees paid (INR)\" and \"Caution / security deposit (INR)\" — the deposit sits outside the percentage slabs and is returned in full.",
    "Set \"Last date of admission (notified)\", your \"Withdrawal request date\" and \"Expected processing time (days)\".",
    "Read the \"Refund slab\", \"Refund percentage\", \"Processing deduction\", \"Amount forfeited\" and \"Expected refund by\" rows against the UGC refund slabs table, then press \"Copy result\".",
  ],
  intro:
    "This tracker estimates the refund due when a student withdraws an admission, using the UGC fee-refund policy of October 2018: 100% of aggregate fees if the withdrawal is 15 or more days before the notified last date of admission, then 90%, 80%, 50% and 0% as the withdrawal moves later. It also handles the separately refundable security deposit and the processing deduction of up to 5% (capped at Rs 5,000) allowed in the full-refund slab. It is for students and parents juggling seat-acceptance fees across counselling rounds.",
  useCases: [
    "A student who paid Rs 1,00,000 at one college and got a better seat elsewhere checking the refund if they withdraw 20 days before the last admission date",
    "A parent estimating how much of the fee is forfeited when the withdrawal happens 10 days after admissions closed",
    "A family tracking the expected payout date so they can follow up if the refund has not arrived",
  ],
  benefits: [
    ["UGC slabs applied exactly", "The 100/90/80/50/0 percent windows are computed from your actual dates, not guessed."],
    ["Deposit handled separately", "The caution/security deposit is added back in full, as the UGC policy requires."],
    ["Forfeit made visible", "Shows the exact rupee amount you lose at each timing so you can decide when to withdraw."],
  ],
  faqs: [
    [
      "How much fee refund do I get if I cancel my college admission?",
      "Under the UGC policy, 100% of aggregate fees if you withdraw 15 or more days before the formally-notified last date of admission (less a processing charge of up to 5%, capped at Rs 5,000), 90% if fewer than 15 days before, 80% up to 15 days after, 50% between 16 and 30 days after, and nothing beyond 30 days.",
    ],
    [
      "Is the security deposit refundable when I withdraw admission?",
      "Yes. Caution money and security deposits are refundable in full and sit outside the percentage slabs — the UGC policy applies its percentages only to the aggregate of tuition and other fees. If an institute withholds the deposit, that is a grievance you can escalate to the UGC portal.",
    ],
    [
      "Does the UGC refund rule apply to JoSAA or state counselling seat acceptance fees?",
      "Centralised counselling bodies publish their own business rules each year — JoSAA, for instance, refunds the seat acceptance fee less a processing charge if you withdraw before the final round, and forfeits it afterwards. The UGC slabs bind universities and colleges for fees paid to the institution; use both documents together for a counselling-paid fee.",
    ],
    [
      "How long does a college admission fee refund take?",
      "The UGC directs institutions to settle refunds within 15 days of the withdrawal application in its grievance framework, but actual timelines vary by institute and counselling body. This tool lets you set your own expected processing days and gives you a follow-up date; keep written proof of the withdrawal request in case you need to escalate.",
    ],
  ],
};

export default seo;
