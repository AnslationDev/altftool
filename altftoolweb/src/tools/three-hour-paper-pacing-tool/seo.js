const seo = {
  title: "3 Hour Exam Paper Pacing – Mark-Weighted Checkpoints",
  metaDescription:
    "Split a 3-hour paper by marks: enter sections, start time, reading time and a review buffer to get the exact clock time each section must end.",
  steps: [
    "Set Exam start time, Paper duration (minutes), Reading time (minutes) and the Review buffer at the end.",
    "List each section's name, Marks and Questions, using Add section for more rows; writing minutes are split in proportion to marks.",
    "Read the checkpoint list — each section gets its minutes and a finish-by HH:MM clock time — and press Copy plan.",
  ],
  intro:
    "This tool converts a three hour question paper into a set of clock-time checkpoints, allocating writing minutes to each section in proportion to the marks it carries — the classic mark-weighted \"minute per mark\" pacing method scaled to your actual paper. Students preparing for board exams, university semesters or competitive descriptive papers enter their sections, marks and start time, and get the exact time each section must end, with reading time and a final review buffer already carved out.",
  useCases: [
    "A CBSE class 12 student splitting a 3-hour, 80-mark paper into checkpoints after the 15-minute reading window",
    "A university student who always runs out of time on the last long-answer question and wants a hard stop time for each section",
    "A mock-test taker practising the same checkpoint times across several papers so the pacing becomes automatic",
  ],
  benefits: [
    ["Mark-weighted split", "A 30-mark section gets exactly three times the minutes of a 10-mark section — no guesswork."],
    ["Real clock times", "Checkpoints are shown as HH:MM times you can match against the exam hall clock."],
    ["Buffers built in", "Reading time and an end-of-paper review buffer are subtracted before the split, so the plan is honest."],
  ],
  faqs: [
    [
      "How should I divide time in a 3 hour exam paper?",
      "Divide your writing time in proportion to marks: subtract reading time and a 5-10 minute review buffer, then give each section (working minutes × section marks ÷ total marks). For a 180-minute, 100-mark paper with 15 minutes reading and 10 minutes review, that works out to about 1.55 minutes per mark.",
    ],
    [
      "How much time should I keep for revision at the end of an exam?",
      "Around 5-10% of the total duration — 10 to 15 minutes on a three hour paper. Use it to check numbering, fill skipped answers and verify calculations rather than rewriting anything.",
    ],
    [
      "What is the minute-per-mark rule?",
      "It is the exam-technique rule of thumb that a question deserves roughly one minute of writing per mark it carries, scaled to your paper. If your paper has more marks than minutes, this tool scales the ratio down automatically so the whole paper still fits.",
    ],
    [
      "Do all boards give 15 minutes of reading time?",
      "CBSE and several Indian state boards grant 15 minutes of reading time before writing begins, but not every exam does — university and competitive exams often give none. The tool lets you set reading time to zero, and the checkpoints adjust accordingly.",
    ],
  ],
};

export default seo;
