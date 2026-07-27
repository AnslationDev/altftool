const seo = {
  intro:
    "This calculator checks VTU exam eligibility course by course: attendance percentage = classes attended ÷ classes held × 100, measured against VTU's requirement of at least 85% in each course, with condonation possible down to 75% in genuine cases. For every course it also computes how many classes you can still miss while staying at 85%, or how many you must now attend consecutively to climb back over the line.",
  useCases: [
    "A VTU student at 78% in one lab checking how many consecutive classes it takes to get back to 85% before the eligibility list is drawn",
    "Planning a two-day absence by seeing the exact number of classes each course can afford to lose while staying at 85%",
    "Verifying that a healthy 88% aggregate is not hiding a single course sitting at 74%, which alone would block that exam",
  ],
  benefits: [
    ["Per-course, like VTU checks it", "Eligibility is tested in each course separately — one weak course is flagged even when the aggregate looks safe."],
    ["Recovery count, not vague advice", "Solves (attended + n)/(held + n) ≥ 85% to give the exact consecutive classes needed."],
    ["Condonation band shown", "Courses between 75% and 85% are marked as condonable so you know when the medical-grounds route exists."],
  ],
  faqs: [
    [
      "What is the minimum attendance required in VTU?",
      "85% of the classes conducted in each course, not as an overall average. A student below 85% in even one course is not eligible for that course's semester-end examination; shortage between 75% and 85% may be condoned by the college and university on medical or similar genuine grounds with documentation.",
    ],
    [
      "How many classes do I need to attend to recover VTU attendance?",
      "Solve (attended + n) ÷ (held + n) ≥ 0.85 for n. For example, at 30 of 40 classes (75%), n ≥ (0.85 × 40 − 30) ÷ 0.15 = 27 consecutive classes. The deeper the shortfall and the later in the semester, the faster this number becomes impossible — which is why recovery has to start early.",
    ],
    [
      "Can I miss classes if my VTU attendance is above 85%?",
      "Yes, up to the point your percentage would drop below 85%. The safe-miss count is (attended ÷ 0.85) − held, rounded down: at 90 of 100 classes you can miss 5 more; at exactly 85% you can miss none.",
    ],
    [
      "Does aggregate attendance matter in VTU or only subject-wise?",
      "Subject-wise is what decides eligibility — VTU applies the 85% test to each course individually. The aggregate across courses is a useful health check but cannot compensate for one course below the line, and this tool reports both so the distinction stays visible.",
    ],
  ],
};

export default seo;
