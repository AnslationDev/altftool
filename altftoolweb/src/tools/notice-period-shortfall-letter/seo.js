const seo = {
  title: "Notice Period Shortfall: Buyout Cost & Waiver Letter",
  metaDescription:
    "Prices unserved notice days at salary ÷ 30, 26 or the month's actual days, sets leave encashment against it, and drafts the waiver or buyout request.",
  steps: [
    "Enter the Resignation date, Contractual notice (days), Last working day you want, Monthly salary used for recovery (INR) and Accrued leave balance (days).",
    "Choose Which salary component and the Per-day divisor in the contract — Fixed 30 days per month, 26 working days per month, or the actual days in the month — then pick What you are asking for.",
    "Read the Net amount at stake with the shortfall in days, the per-day rate and all four waiver outcomes, then press Copy letter for the draft.",
  ],
  intro:
    "This tool prices a notice-period shortfall — the days between the last working day you want and the one your contract requires — and drafts the letter asking for them to be waived, halved or bought out. It computes the per-day rate as your monthly salary divided by the divisor your contract uses (30 days, 26 working days, or the actual days in the month), applies your accrued leave balance against the recovery, and compares four settlement outcomes side by side. It also notes that CBIC Circular No. 178/10/2022-GST confirms no GST is payable on notice pay recovery.",
  useCases: [
    "You have a 90-day notice, can only serve 45, and need to know what the other 45 days actually cost before you negotiate.",
    "Your leave balance is large enough to cover most of the shortfall and you want that set-off proposed in writing rather than assumed.",
    "HR has quoted a recovery figure and you want to check it against the divisor and salary component stated in your appointment letter.",
    "You want a letter that offers a middle path — part waived, part settled — instead of an all-or-nothing request.",
  ],
  benefits: [
    ["The divisor matters", "Dividing by 26 instead of 30 raises the per-day rate by about 15%, and the tool shows which one your contract uses."],
    ["Leave set-off in the numbers", "Applies accrued leave against the recovery and shows what is left to be paid out separately."],
    ["Four outcomes compared", "Full waiver, half waiver, leave-only and full buyout, each with the cash figure, so you go in knowing your range."],
  ],
  faqs: [
    [
      "How is notice period buyout calculated in India?",
      "Unserved days are multiplied by a per-day salary derived from the component your contract names — usually basic or basic plus dearness allowance — divided by 30 days, 26 working days, or the actual days in the month. On a basic of Rs 60,000 with a 30-day divisor, each unserved day costs Rs 2,000, so a 45-day shortfall is Rs 90,000 before any leave set-off.",
    ],
    [
      "Is GST payable on notice pay recovery?",
      "No. CBIC Circular No. 178/10/2022-GST dated 3 August 2022 clarified that notice pay recovered by an employer from an employee is not consideration for a supply, so no GST arises on it. If your settlement statement adds GST to the recovery, point the payroll team to that circular.",
    ],
    [
      "Can my employer refuse to release me early?",
      "Yes — serving the agreed notice is a contractual obligation, and an employer can insist on it or on payment in lieu. In practice most employers negotiate, especially when the handover is documented and complete, which is why the request should lead with the handover position rather than with the personal reason.",
    ],
    [
      "Can accrued leave be adjusted against a notice period shortfall?",
      "Often, but it is a policy decision rather than a right, so ask for it in writing before your last day. Encashment of accrued earned leave on separation is itself required under the state Shops and Establishments Acts and section 79 of the Factories Act, 1948 for covered workers; whether it offsets a recovery or is paid out separately depends on your employer's policy.",
    ],
  ],
};

export default seo;
