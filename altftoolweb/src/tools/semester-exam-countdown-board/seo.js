const seo = {
  intro:
    "This board counts the exact days remaining to each semester exam paper and lines them up with a readiness bar per subject, so the whole exam window is visible at a glance. Papers you rate under 50% ready with a week or less to go are flagged at risk — a plain, transparent rule for deciding what to study next. It is built for university and college students juggling four to eight papers spread across an exam timetable.",
  useCases: [
    "An engineering student two weeks from end-semester exams laying out all six papers to see which countdowns are tightest",
    "A student who keeps drifting to their favourite subject using the at-risk flags to force attention onto a weak paper due in five days",
    "Hostel roommates copying the board as text into their group chat the night the exam timetable is released",
  ],
  benefits: [
    ["Whole timetable on one screen", "Every paper sorted by date with its days-left countdown — no mental date arithmetic."],
    ["Readiness bars per subject", "Rate each paper 0–100% and see the weak spots instantly next to their deadlines."],
    ["At-risk flags", "Papers under 50% readiness within 7 days are highlighted so the scarcest study hours go where they matter."],
  ],
  faqs: [
    [
      "How should I decide which subject to study first before exams?",
      "Study the paper with the worst combination of low readiness and few days remaining — that is exactly what this board's at-risk flag surfaces, marking papers under 50% readiness with 7 or fewer days to go. Papers that are far away or already well prepared can wait for revision passes.",
    ],
    [
      "How do I estimate my readiness percentage for a subject?",
      "A quick honest method is syllabus coverage: units you could answer an exam question on right now, divided by total units. If you have covered 3 of 5 units well, call it 60%; adjust down if past-paper attempts go badly, since solving papers is a better signal than reading notes.",
    ],
    [
      "Does the board save my exam dates?",
      "No — everything runs in your browser on this page, and reloading returns the board to the example papers. Use the copy button to keep a text snapshot of the countdown and readiness list wherever you take notes.",
    ],
    [
      "How many days before a semester exam should I start preparing?",
      "For a typical university paper with 4–6 units, most study-planning advice converges on 2 to 3 weeks of first-pass preparation plus a final revision week, which is roughly 15 to 20 focused days per exam season. The countdown makes the arithmetic concrete: divide the days the board shows by the units still uncovered to get your required daily pace.",
    ],
  ],
};

export default seo;
