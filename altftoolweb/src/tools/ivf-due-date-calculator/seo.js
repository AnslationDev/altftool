const seo = {
  title: "IVF Due Date Calculator: Day 3, 5 & 6 Transfers",
  metaDescription:
    "Counts 261 days from a day-5 blastocyst transfer (263 day-3, 260 day-6, 266 from retrieval), plus the equivalent LMP date and scan milestones.",
  steps: [
    "Enter your \"Transfer or retrieval date\" and choose \"What that date refers to\" - day-5, day-3 or day-6 transfer, or the egg retrieval date.",
    "Optionally set \"Show gestational age as of\" a date to see your current week, trimester stage and days to the due date.",
    "Read the estimated due date (transfer date plus the 260-266 day offset), the equivalent LMP date and the milestone table from NT scan to post-term; \"Copy result\" copies the summary.",
  ],
  intro:
    "After IVF the conception date is known to the day, so the due date is counted from the transfer rather than estimated from a last period: 261 days after a day-5 blastocyst transfer, 263 days after a day-3 transfer, 260 days after a day-6 transfer and 266 days after egg retrieval. This calculator applies those offsets, converts the result into the equivalent LMP date that gestational age is measured from, and lays out the scan and term milestones that follow. It is a dating tool, not medical advice.",
  useCases: [
    "You had a day-5 frozen embryo transfer and want the due date your clinic will use rather than a period-based estimate.",
    "You need the equivalent LMP date because hospital forms and pregnancy apps ask for it.",
    "You want to know which week you are in today and when the anomaly scan window opens.",
    "You are comparing a day-3 and a day-5 transfer date from two cycles and want to see the two-day difference.",
  ],
  benefits: [
    ["Exact, not estimated", "Uses the known embryo age instead of Naegele's rule, which assumes a 28-day cycle."],
    ["All four starting points", "Day-3, day-5, day-6 transfers and the egg retrieval date each have their own offset."],
    ["Full milestone timeline", "NT scan, anomaly scan, viability, early term, full term and post-term dates, all derived from the same anchor."],
  ],
  faqs: [
    [
      "How is the IVF due date calculated for a day-5 transfer?",
      "Add 261 days to the transfer date. A pregnancy runs 266 days from fertilisation, and a day-5 blastocyst has already spent 5 of those days in the lab, so 266 − 5 = 261 days remain from the day of transfer.",
    ],
    [
      "What is the due date after a day-3 embryo transfer?",
      "Add 263 days to the transfer date — 266 days from fertilisation minus the 3 days the embryo spent developing before transfer. A day-6 blastocyst transfer uses 260 days, and dating from egg retrieval uses the full 266 days.",
    ],
    [
      "How many weeks pregnant am I on the day of transfer?",
      "2 weeks and 5 days for a day-5 transfer, 2 weeks and 3 days for a day-3 transfer. Gestational age is counted from the equivalent last menstrual period, which is 2 weeks before fertilisation, so the embryo's own age is added to that.",
    ],
    [
      "Is an IVF due date more accurate than an LMP due date?",
      "Yes, because the conception date is known rather than inferred from a cycle assumed to be 28 days with ovulation on day 14. Even so, only about 4 in 100 babies arrive on the exact due date, and your clinic may still adjust dating after an early scan.",
    ],
  ],
};

export default seo;
