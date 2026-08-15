const seo = {
  title: "NDA & CDS Exam Countdown with SSB Interview Dates",
  metaDescription:
    "Days to the NDA or CDS written paper and your SSB reporting date, with paper-wise marks, one-third negative-marking maths and the 5-day SSB schedule.",
  steps: [
    "Choose your exam in \"Exam and entry\", set the \"Written exam date (UPSC calendar)\", and optionally add the SSB reporting date from your call-up letter plus \"Study hours per day\".",
    "Read \"Days to the written exam\", study hours left, the written-to-SSB prep window and the day-by-day 5-day SSB schedule from screening to conference.",
    "Under \"Marks from your attempt plan\", set \"Questions attempted\" and \"Accuracy on what you attempt (%)\" to project marks under one-third negative marking, then press \"Copy result\".",
  ],
  intro:
    "This countdown tracks the two clocks a defence aspirant lives by: days to the UPSC written paper (NDA or CDS) and days to the SSB interview reporting date, including the prep window between them. It encodes the real paper structures — NDA Mathematics 300 marks and GAT 600 marks, CDS papers of 100 marks each — and UPSC's one-third negative marking rule, plus the standard 5-day SSB schedule from screening to conference.",
  useCases: [
    "An NDA aspirant counting down to the written paper while budgeting study hours across Mathematics and the General Ability Test",
    "A CDS candidate whose SSB call-up letter has arrived, measuring the written-to-SSB window left for GTO and interview preparation",
    "An aspirant deciding whether to guess on remaining questions using the 25% break-even accuracy under one-third negative marking",
  ],
  benefits: [
    ["Both stages on one clock", "Counts down to the written date and the SSB reporting date, and shows the prep window between them."],
    ["Real UPSC paper maths", "Marks per question and the one-third penalty are derived from each paper's actual marks and question count."],
    ["SSB demystified", "The 5-day board schedule — screening, psychology, GTO days and conference — is laid out day by day."],
  ],
  faqs: [
    [
      "What is the exam pattern of NDA written exam?",
      "The NDA & NA written exam has two papers on one day: Mathematics — 300 marks, 120 questions, 2½ hours — and the General Ability Test — 600 marks, 150 questions, 2½ hours — for a written total of 900 marks. The SSB interview that follows carries a further 900 marks, so the written and the interview weigh equally in the final merit list.",
    ],
    [
      "Is there negative marking in NDA and CDS?",
      "Yes. UPSC deducts one-third of the marks assigned to a question for every wrong answer in both NDA and CDS. In NDA Mathematics each question carries 2.5 marks, so a wrong answer costs about 0.83; in the GAT each carries 4 marks, so a wrong answer costs about 1.33. A guess breaks even only above 25% expected accuracy.",
    ],
    [
      "How long after the written exam is the SSB interview?",
      "There is no fixed gap — SSB call-ups follow the written result and are spread over batches, commonly landing a few months after the paper. The reporting date on your call-up letter is the only authoritative one, which is why this tool asks for it directly instead of guessing an offset.",
    ],
    [
      "What happens on each day of the 5-day SSB interview?",
      "Day 1 is screening (OIR test and PPDT), after which only screened-in candidates stay; day 2 is the psychology battery (TAT, WAT, SRT, self-description); days 3 and 4 are GTO ground tasks such as group discussion, progressive group task, command task and lecturette, with personal interviews slotted across days 2–4; day 5 is the board conference where results are announced. Recommended candidates then proceed to the medical board.",
    ],
  ],
};

export default seo;
