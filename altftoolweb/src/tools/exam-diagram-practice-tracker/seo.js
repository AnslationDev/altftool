const seo = {
  title: "Exam Diagram Practice Tracker: Readiness Score & Queue",
  metaDescription:
    "Track which exam diagrams you can draw from memory within a time budget, get a weighted readiness percentage and a weakest-first practice queue.",
  steps: [
    "Click 'Add diagram' and give each one a 'Diagram name' and a 'Target time (min)' budget.",
    "Log the 'Last attempt' for each diagram and, if it was attempted, the 'Time taken (min)'.",
    "Read your overall exam readiness percentage and the 'Practise next (weakest first)' queue, then click 'Copy summary'.",
  ],
  intro:
    "This tracker classifies every diagram on your exam syllabus by whether you last drew it from memory within a set time budget — the retrieval-practice standard for calling something exam-ready. Each diagram lands in one of four levels (exam-ready, close but too slow, learning, not practised) and the tool computes a weighted readiness percentage plus a weakest-first practice queue. It suits biology, geography, economics and engineering students whose papers award marks for accurate labelled diagrams.",
  useCases: [
    "A biology student listing the 12 labelled diagrams their board exam can ask and checking how many they can reproduce from memory in under 6 minutes each",
    "An economics student separating diagrams they merely recognise from ones they can actually draw unaided before a mock exam",
    "A study session that starts from the tracker's weakest-first queue instead of redrawing already-mastered favourites",
  ],
  benefits: [
    ["Memory and speed together", "A diagram counts as exam-ready only when drawn unaided and within its time budget, not just recognised."],
    ["Weighted readiness score", "Slow-but-correct attempts score 70% and reference-assisted ones 40%, so progress shows before full mastery."],
    ["Weakest-first queue", "Unpractised diagrams are queued before slow ones, directing practice where marks are most at risk."],
  ],
  faqs: [
    [
      "How do I memorise diagrams for exams?",
      "Draw them from memory repeatedly rather than re-reading them — retrieval practice is consistently shown to beat passive review for recall. Study the diagram once, close the book, reproduce it with labels, compare against the original, and repeat the cycle focusing on the parts you missed.",
    ],
    [
      "How long should drawing an exam diagram take?",
      "Budget it from your paper's mark scheme: a common rule of thumb is about a minute to a minute and a half per mark, so a 5-mark labelled diagram deserves roughly 5-7 minutes including labels. Set that number as the diagram's target time and practise until you beat it from memory.",
    ],
    [
      "What counts as exam-ready in this tracker?",
      "A diagram is exam-ready only when your last attempt was drawn fully from memory and finished within the target time you set. From-memory but over time counts as 'close', and any attempt that needed notes open counts as 'learning'.",
    ],
    [
      "How is the readiness percentage calculated?",
      "Each diagram contributes a weight to the average: exam-ready counts 100%, from-memory-but-slow 70%, reference-assisted 40% and unattempted 0%. Four diagrams at those four levels would therefore show (100+70+40+0)/4 = 52.5% readiness.",
    ],
  ],
};

export default seo;
