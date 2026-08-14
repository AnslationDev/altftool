const seo = {
  title: "Ultrasound vs LMP Due Date: ACOG Redating Comparator",
  metaDescription:
    "Compares period-based and scan-based due dates, measures the gap in days and applies ACOG redating thresholds to show which date a clinic would keep.",
  steps: [
    "Enter the 'First day of the last period' and 'Usual cycle length (days)' (20-45), then the 'Date of the ultrasound' and the gestational age the scan reported in weeks and days.",
    "Both due dates compute as you type — the 'Gap between the two dates' panel checks the gap against the ACOG threshold for the gestational age at the scan.",
    "Read 'Dating usually adopted' with the two due-date cards and the redating-threshold table; 'Copy result' copies the comparison and 'Reset' restores the defaults.",
  ],
  intro:
    "This comparator puts two due dates side by side: the one from Naegele's rule (last period + 280 days, shifted for a cycle that is not 28 days) and the one implied by the gestational age your ultrasound reported. It measures the gap in days and checks it against the ACOG redating thresholds — 5 days up to 8w6d, 7 days to 15w6d, 10 days to 21w6d, 14 days to 27w6d and 21 days from 28 weeks — so you can see whether a clinician would normally keep the period date or adopt the scan date.",
  useCases: [
    "Your app says one due date and the sonographer wrote another, and you want to know which one the hospital will use.",
    "You have long or irregular cycles, so the period-based date is likely to be off and you want the cycle adjustment applied.",
    "A 20-week scan measured a week ahead and you want to know whether that is enough to change the due date.",
    "You want the exact size of the gap in days before asking your midwife about it.",
  ],
  benefits: [
    ["Both methods, one screen", "Naegele's rule with a cycle-length correction, and the scan-implied date, computed the same way a clinic would."],
    ["Threshold-aware", "Applies the published redating cut-offs instead of leaving you to judge whether a gap is big."],
    ["Explains the gap", "Shows the gestational age each method gives on the scan day, not just the two end dates."],
  ],
  faqs: [
    [
      "Which due date is more accurate, the scan or my last period?",
      "An early ultrasound is more accurate. Crown-rump length dating before 14 weeks is precise to about ±5 to 7 days, while the period-based date assumes a 28-day cycle with ovulation on day 14, which is wrong for many people.",
    ],
    [
      "When do doctors change the due date to the ultrasound date?",
      "When the gap exceeds the threshold for the gestational age at the scan: more than 5 days up to 8w6d, more than 7 days from 9w0d to 15w6d, more than 10 days to 21w6d, more than 14 days to 27w6d, and more than 21 days from 28 weeks. Inside those limits the last-period date is normally kept.",
    ],
    [
      "How does a long or short cycle change the due date?",
      "Each day your usual cycle is longer than 28 days pushes the due date one day later, and each day shorter pulls it one day earlier, because ovulation is assumed to happen 14 days before the next period. A 35-day cycle therefore adds 7 days to the Naegele estimate.",
    ],
    [
      "Why does a late scan rarely change the due date?",
      "Babies of the same gestational age vary far more in size later in pregnancy, so third-trimester biometry can be out by two to three weeks. That is why the tolerance widens to 21 days after 28 weeks — a big measurement gap then usually means a large or small baby, not wrong dates, which is something to discuss with your obstetrician.",
    ],
  ],
};

export default seo;
