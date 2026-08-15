const seo = {
  title: "Exam Score Analyzer: Percentage, Grade & Weak",
  metaDescription:
    "Total marks ÷ total maximum × 100, graded on the 90/80/70/60/40 scale, with your strongest and weakest subject by percentage, charts and a PDF export.",
  intro:
    "This exam score analyzer takes your marks subject by subject and returns the aggregate percentage — total obtained ÷ total maximum × 100 — along with a letter grade on the standard 90/80/70/60/40 scale, your strongest and weakest subject by individual percentage, and a pass flag at the 40% mark. Bar and pie charts show where the marks sit across subjects, and the whole analysis can be exported as a PDF. It is for students and parents who have a marksheet and want the totals, the grade and the weak spot identified without doing the arithmetic by hand.",
  useCases: [
    "Your results are out subject by subject and you want the overall percentage and grade before the school publishes them",
    "Deciding which subject to give the most revision time to next term, by comparing each subject's own percentage rather than its raw marks",
    "Producing a one-page PDF of the term's results, with the charts, to keep in a file or show at a parent-teacher meeting",
  ],
  benefits: [
    ["Weakest subject found on percentage, not marks", "A 45/50 and a 60/100 are compared on the same scale, so the subject flagged for attention is genuinely the weaker one."],
    ["Grade and pass status applied consistently", "The same cut-offs are used every time — 90 for A+, 80 for A, 70 for B, 60 for C, 40 for D — so results from different terms are directly comparable."],
    ["Charts plus a PDF export", "A bar chart per subject and a share-of-total pie sit alongside the numbers, and the full analysis exports to an A4 PDF in one click."],
  ],
  faqs: [
    [
      "How is the overall percentage calculated?",
      "Total marks obtained divided by total maximum marks, times 100 — not the average of the subject percentages. The two differ whenever subjects carry different maximum marks, and the total-based figure is what most boards and schools report.",
    ],
    [
      "What grade will my percentage get?",
      "On the scale used here: 90% and above is A+, 80–89.99% is A, 70–79.99% is B, 60–69.99% is C, 40–59.99% is D, and below 40% is a fail. Your own board or university may use different bands or a GPA, so check the official grading scheme before treating this as your final grade.",
    ],
    [
      "What is the pass mark?",
      "40% overall is used as the pass threshold here, which is the common minimum across Indian school boards. Many institutions also require a minimum in each individual subject, and some professional courses set the bar at 50%, so confirm the rule that applies to your exam.",
    ],
    [
      "How does it decide my strongest and weakest subject?",
      "By each subject's own percentage — marks obtained divided by that subject's maximum — so subjects marked out of different totals are ranked fairly. The lowest-scoring subject is flagged for revision unless your overall percentage is already 95% or above.",
    ],
  ],
};

export default seo;
