const seo = {
  title: "Due Date Calculator: LMP, Conception or IVF Transfer",
  metaDescription:
    "Due date from LMP + 280 days adjusted for cycle length, conception + 266, or IVF transfer + 261 days, with trimester dates and dated milestones.",
  steps: [
    "Choose a Calculation method — Last menstrual period, Conception date or IVF transfer — and enter the date in the field that method swaps in.",
    "For LMP set Average cycle length (days), accepted from 21 to 40; for IVF pick Day-3 embryo or Day-5 embryo. The panel prints the Formula it is applying underneath.",
    "Read Estimated due date with Gestational age today, Trimester and Days remaining, plus the dated trimester spans and milestones including the Anatomy scan window and Full term, then press Copy summary.",
  ],
  intro:
    "The Pregnancy Due Date Calculator estimates an expected delivery date three ways — Naegele's rule of LMP + 280 days adjusted for cycle length, conception date + 266 days, or an IVF transfer date + 261 days for a day-5 embryo (263 for day-3) — and then works back to gestational age, trimester dates and milestone windows. It is for anyone who has just found out they are pregnant, or who conceived through IVF and knows the calculator on most sites assumes a 28-day cycle they do not have. All three routes are normalised to the same 40-week timeline, so the week-by-week output is consistent whichever input you started from.",
  useCases: [
    "Your cycle runs 33 days rather than 28, and the standard LMP calculator has given you a date you suspect is five days early — this one shifts the estimate by the cycle-length difference.",
    "You had a day-5 blastocyst transfer and want a due date from the transfer date itself instead of back-calculating a fictional last period.",
    "You are booking time off and want the dates of the 18-20 week anatomy scan window and the start of the third trimester, not just the final due date.",
  ],
  benefits: [
    [
      "Cycle length actually changes the answer",
      "Naegele's rule is applied as LMP + 280 + (cycle length − 28) for cycles from 21 to 40 days, because later ovulation shifts the whole timeline rather than leaving it fixed.",
    ],
    [
      "IVF handled as its own method",
      "Day-3 and day-5 transfers get their own intervals (263 and 261 days from transfer), which is more precise than any LMP estimate because the conception date is known exactly.",
    ],
    [
      "The whole timeline, dated",
      "Alongside the due date it gives current gestational age in weeks and days, the exact start and end date of each trimester, six dated milestones, and the week's approximate fetal length.",
    ],
  ],
  faqs: [
    [
      "How is a due date calculated from the last period?",
      "By Naegele's rule: the first day of the last menstrual period plus 280 days, which is 40 weeks. This assumes a 28-day cycle with ovulation on day 14, so this calculator adds the difference between your cycle length and 28 days to the estimate.",
    ],
    [
      "How do I calculate a due date after IVF?",
      "From the transfer date: 261 days for a day-5 (blastocyst) transfer and 263 days for a day-3 transfer, since the embryo's age at transfer is already known. This is why IVF dating is usually more accurate than an LMP-based estimate.",
    ],
    [
      "When does each trimester start and end?",
      "Counting from the last menstrual period, the first trimester covers weeks 1-13 (through day 97), the second weeks 14-27 (days 98-195), and the third from week 28 (day 196) to the due date at week 40. Full term is reached at 39 weeks, day 273.",
    ],
    [
      "How accurate is a due date?",
      "It is an estimate, not an appointment — only a small minority of births happen on the calculated date, and a first-trimester dating ultrasound is generally the most reliable way to set or revise it. This tool is informational; your midwife, obstetrician or fertility clinic sets your official due date and should be your reference for any decision about care.",
    ],
  ],
};

export default seo;
