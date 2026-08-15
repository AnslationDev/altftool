const seo = {
  title: "NEET Study Prompt Builder: NCERT-Locked AI Prompts",
  metaDescription:
    "Turn an NTA NEET unit and study goal into an AI prompt carrying +4/-1 marking, sized against the real 200 minutes for 180 questions.",
  steps: [
    "Choose a Subject and a Chapter / unit from the NTA NEET lists, then a Study mode such as \"MCQ drill (NEET pattern)\" or \"NCERT line-by-line check\".",
    "Set Difficulty, Number of items, Time limit (minutes) and Output language, and list any weak areas to target.",
    "Check the marks the drill is worth, your pace per item against the real 200 min / 180 Q pace and the 20% guessing break-even, then press Copy prompt.",
  ],
  intro:
    "The NEET Study Prompt Builder turns a syllabus unit and a study goal into a ready-to-paste AI prompt that is locked to the NTA NEET (UG) syllabus, NCERT sourcing and the paper's +4/-1 marking. It is for droppers and Class 11-12 aspirants who get vague, off-syllabus answers when they ask a chatbot to 'make questions on Human Physiology'. Alongside the prompt it sizes the drill using the real paper's pace of 200 minutes for 180 questions and shows the 20% accuracy break-even below which guessing costs marks.",
  useCases: [
    "Generating a 20-question NEET-pattern MCQ set on Human Physiology with distractors built from common misconceptions, timed at the real 66-second-per-question pace.",
    "Turning a chapter you keep forgetting, like Coordination Compounds, into an NCERT line-by-line checklist before a weekly test.",
    "Feeding your last mock's wrong answers into a mistake-audit prompt so the model names the misconception behind each one and re-tests it.",
  ],
  benefits: [
    ["Syllabus-locked", "Chapter lists follow the NTA NEET (UG) units, so the model cannot wander into rationalised-out topics."],
    ["Marking built in", "Every prompt carries +4/-1 scoring and the 20% guessing break-even, so practice matches the real paper."],
    ["Pace you can trust", "Item counts and time limits are checked against 200 minutes for 180 questions before the prompt is written."],
  ],
  faqs: [
    [
      "What is the marking scheme for NEET UG?",
      "Each correct response earns 4 marks, each incorrect response loses 1 mark, and unattempted questions score zero. With 180 questions the paper is out of 720 marks, so guessing only pays off above 20% accuracy - that is the point where 4 x correct exactly cancels 1 x wrong.",
    ],
    [
      "How much time do I get per question in NEET?",
      "The paper runs 200 minutes for 180 questions, which is about 66.7 seconds per question on average. In practice most toppers spend far less on Biology to bank time for numerical Physics, so drilling at a tighter per-item pace than 66.7 seconds is deliberate practice, not overkill.",
    ],
    [
      "Can AI-generated NEET questions replace previous year papers?",
      "No. Use generated questions for volume, recall and misconception drilling, and use NTA's actual previous-year papers to calibrate difficulty and phrasing. Always verify a generated answer against NCERT before you memorise it, because language models can state a plausible but wrong fact confidently.",
    ],
    [
      "How many questions come from each subject in NEET?",
      "Biology contributes 90 questions (360 marks), Physics 45 and Chemistry 45 (180 marks each), for 180 questions and 720 marks in total. That weighting is why the builder tells the model which subject share it is writing for, so depth matches the paper rather than the textbook.",
    ],
  ],
};

export default seo;
