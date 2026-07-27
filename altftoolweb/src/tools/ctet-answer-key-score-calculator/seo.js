const seo = {
  intro:
    "This calculator scores a CTET attempt from the answer key: 150 questions of 1 mark each, no negative marking, so your score is simply the number of correct answers. It covers Paper I (classes I–V, five 30-question sections) and Paper II (classes VI–VIII, with the 60-question Mathematics & Science or Social Studies block) and checks the result against the CBSE qualifying line — 90 marks (60%), or 55% where the reserved-category relaxation applies. Candidates get a section-wise breakdown with accuracy, plus how far they sit from the cut-off.",
  useCases: [
    "Counting responses against the provisional answer key on results-eve to estimate a Paper II Maths & Science score",
    "Checking whether 87 marks with the reserved-category relaxation crosses the 55% qualifying line",
    "Finding the weakest of the five Paper I sections to target before the next attempt",
  ],
  benefits: [
    ["Exact CBSE pattern", "Both papers, both Paper II subject blocks, 1 mark per question and zero negative marking are encoded as-is."],
    ["Qualifying check built in", "Compares your total against 90 marks (60%) or the 55% relaxed standard, and shows the exact shortfall."],
    ["Section analytics", "Marks, percentage and accuracy per section, with strongest and weakest sections flagged."],
  ],
  faqs: [
    [
      "Is there negative marking in CTET?",
      "No. Each of the 150 questions carries 1 mark for a correct answer and 0 for a wrong or blank one, so your score equals your count of correct answers — and leaving a question unattempted is never better than guessing.",
    ],
    [
      "What is the passing mark for CTET?",
      "90 out of 150 (60%). CBSE's notification permits school managements to extend up to 5% relaxation to reserved-category candidates, which brings the line to 55% — arithmetically 82.5 marks, commonly quoted as 82 or 83 in notices. Check the notification that applies to the recruitment you are targeting.",
    ],
    [
      "How is the CTET score calculated section-wise?",
      "Paper I has five sections of 30 questions each: Child Development & Pedagogy, Language I, Language II, Mathematics and Environmental Studies. Paper II has the first three plus a 60-question subject block — Mathematics & Science or Social Studies. Each correct answer adds 1 mark; there is no section-wise minimum, only the overall qualifying total.",
    ],
    [
      "How long is the CTET certificate valid?",
      "For life. In 2021 the Ministry of Education replaced the earlier seven-year validity with lifetime validity for qualifying candidates. Note this tool estimates from the answer key you counted against — dropped questions and revised keys after the objection window can change the official score.",
    ],
  ],
};

export default seo;
