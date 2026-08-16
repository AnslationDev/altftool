const seo = {
  title: "NEET Countdown: Chapter Pace & 45-45-90 Split",
  metaDescription:
    "Days left to NEET, the chapter pace each subject needs before your revision buffer, question targets in the 45-45-90 split and projected marks.",
  steps: [
    "Set the 'NEET exam date (from the NTA notice)', a 'Revision buffer before the exam (days)' and your daily practice-question count, plus an optional prep start date for the pace check.",
    "Fill the Chapter tracker with 'Total chapters' and 'Chapters completed' for Physics, Chemistry and Biology (Botany + Zoology).",
    "Read 'Days to NEET', the chapters per day each subject needs, questions per day in the paper's 45-45-90 split and projected marks at +4/-1; press 'Copy result' for the plan.",
  ],
  intro:
    "This countdown works out how many days remain until NEET UG and converts your unfinished chapters into the pace you need — chapters per day per subject, after setting aside a revision buffer. It is built for NEET aspirants and droppers who track preparation chapter-wise, and it also splits a daily practice-question target in the paper's own 45-45-90 proportion (Physics, Chemistry, Biology) under the NTA scheme of 180 questions, 720 marks, +4 for a correct answer and −1 for a wrong one.",
  useCases: [
    "A class 12 student checking whether finishing 46 pending chapters is realistic before a 30-day revision buffer starts",
    "A dropper who began prep in April comparing syllabus percentage done against prep time already spent to see if they are ahead or behind even pace",
    "An aspirant fixing a daily practice target of 120 questions and wanting it split 30-30-60 the way the actual paper weights the subjects",
  ],
  benefits: [
    ["Chapter-wise pace", "Turns chapters left and days left into a concrete chapters-per-day number for each subject."],
    ["Revision buffer built in", "Study days are counted only up to the start of your revision window, not up to the exam date."],
    ["Paper-pattern targets", "Daily question targets follow the real 45-45-90 subject split of the NEET paper."],
  ],
  faqs: [
    [
      "How many questions does NEET have and what is the marking scheme?",
      "NEET UG has 180 compulsory multiple-choice questions worth 720 marks, answered in 180 minutes: Physics 45, Chemistry 45 and Biology 90 (Botany 45 plus Zoology 45). Each correct answer earns +4 marks and each wrong answer deducts 1 mark; unanswered questions score zero. The optional Section B was withdrawn from NEET 2025, so all questions are now compulsory.",
    ],
    [
      "How do I calculate how many chapters I need to study per day for NEET?",
      "Divide the chapters you have not finished by the study days remaining, where study days are the days to the exam minus your revision buffer. For example, 46 chapters left with 280 days to the exam and a 30-day revision buffer gives 46 ÷ 250 ≈ 0.18 chapters a day — roughly one chapter every five to six days. This tool does that division per subject so a heavy Biology backlog is visible separately from Physics.",
    ],
    [
      "How many days before NEET should I stop new chapters and start revision?",
      "Most structured plans reserve the final 30 to 45 days purely for revision and full-length mock tests, and stop opening new chapters before that window. The right buffer depends on how much of the syllabus is genuinely complete — this tool lets you set any buffer and shows whether the remaining chapters still fit in the days before it.",
    ],
    [
      "Why should my daily practice questions be split 30-30-60 between Physics, Chemistry and Biology?",
      "Because that is the paper's own weighting: Biology carries 90 of the 180 questions (360 of 720 marks), while Physics and Chemistry carry 45 each. Practising in the same 25%-25%-50% proportion keeps your preparation aligned with where the marks actually are, though you can tilt the split toward a weaker subject deliberately.",
    ],
  ],
};

export default seo;
