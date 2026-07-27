const seo = {
  intro:
    "The Study Plan Prompt Builder converts a syllabus, a start date and an exam date into an AI prompt for a day-by-day spaced study schedule. It computes your real study-day budget from days-per-week availability, applies the standard expanding 1-3-7-14-30 day spaced-repetition review ladder, and reserves roughly 15% of study days as a final mixed-review block. Students get a plan grounded in distributed-practice research instead of a vague cramming timetable.",
  useCases: [
    "A student four weeks from a biology final pastes eight syllabus topics and gets a prompt that schedules first passes, spaced reviews and a final revision block.",
    "A professional preparing for a certification exam with only weekend availability builds a plan that respects 2 study days per week.",
    "A tutor generates individualised revision timetables for several students by changing only the weak-topics line between prompts.",
  ],
  benefits: [
    ["Evidence-based spacing", "Reviews are scheduled at expanding 1, 3, 7, 14 and 30-day intervals — the distributed-practice pattern shown to beat massed re-reading."],
    ["A real day budget", "Study days are computed from your actual availability, so the AI cannot silently assume you study every day."],
    ["Protected review block", "About 15% of study days are reserved before the exam for mixed self-testing with no new material."],
  ],
  faqs: [
    [
      "What is spaced repetition and why does the plan use it?",
      "Spaced repetition means reviewing material at increasing intervals after first learning it, rather than re-reading it in one block. Research on distributed practice (including the Cepeda et al. 2006 meta-analysis) consistently finds spaced reviews produce better long-term retention, which is why the prompt schedules reviews at roughly 1, 3, 7, 14 and 30 days after each topic's first pass.",
    ],
    [
      "How does the tool work out how many study days I have?",
      "It counts the days between your start date and the exam, then pro-rates by your study days per week: a 28-day window at 6 days per week gives 24 study days. Reviews that would fall after the exam are dropped automatically.",
    ],
    [
      "Why does the plan reserve days at the end with no new material?",
      "The final block — about 15% of study days, at least one day — is for mixed review: past papers, self-testing and your weakest topics. Learning new material in the last days before an exam crowds out consolidation, so the prompt explicitly forbids it there.",
    ],
    [
      "How many topics can I include?",
      "Between 1 and 60 topic lines. Beyond about 60 items, a single AI response cannot schedule reliably; if your syllabus is longer, merge sub-points into their parent topics or split the plan into two prompts by subject.",
    ],
  ],
};

export default seo;
