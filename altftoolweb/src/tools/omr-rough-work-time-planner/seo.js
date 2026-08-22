const seo = {
  title: "OMR Sheet Transfer Time Planner for NEET & SSC",
  metaDescription:
    "Reserve the right minutes for OMR bubbling: questions × seconds per bubble plus a safety buffer gives the exact clock minute to stop solving.",
  steps: [
    "Enter 'Exam duration (minutes)' and 'Answers to transfer', set 'Seconds per bubble' (default 4) and the 'Safety buffer' (default 25%), then pick a 'Transfer strategy' — one batch at the end, batches after each section, or bubbling after every question.",
    "The plan recomputes live: 'Reserve for OMR transfer', raw bubbling time plus buffer, time left for solving, seconds per question while solving, and the 'Stop solving at' minute mark on the exam clock.",
    "Press 'Copy result' for the text plan or 'Reset' for the 180-minute, 180-question defaults; the section strategy adds a 'Number of batches' field with per-batch size and time.",
  ],
  intro:
    "This planner computes how much of an OMR-based exam to reserve for transferring answers from the question booklet to the answer sheet, using transfer time = questions × seconds per bubble × (1 + safety buffer). It is built for NEET, SSC, board and state-exam candidates who solve on rough work first, and it returns the exact clock minute to stop solving, the time left per question, and batch sizes for section-wise transfer.",
  useCases: [
    "A NEET aspirant with 180 answers to bubble in a 3-hour paper deciding whether to reserve 12 or 18 minutes at the end",
    "A student who ran out of time in their last mock comparing one end-of-exam batch against transferring after every section",
    "A teacher setting a class-wide rule of thumb for when students should put the pen down and start bubbling",
  ],
  benefits: [
    ["Exact stop time", "Get the minute mark on the exam clock at which solving must stop for a safe transfer."],
    ["Three strategies", "Compare end-of-exam, section-wise batch and bubble-as-you-go approaches with the same numbers."],
    ["Honest buffer", "A configurable safety margin covers row-alignment checks and skipped questions, not just raw bubbling."],
  ],
  faqs: [
    [
      "How much time does it take to fill an OMR sheet?",
      "Around 3–5 seconds per bubble for a careful, fully darkened mark, so 180 answers take roughly 9–15 minutes of pure bubbling. Add a 20–30% buffer for checking row alignment and skipped questions — this planner defaults to 4 seconds per answer with a 25% buffer.",
    ],
    [
      "Should I fill the OMR at the end or after every question?",
      "Batch transfer after each section is the approach most coaching faculty recommend: it is nearly as fast as one end-of-exam batch but catches alignment mistakes while the section is still fresh. Bubbling after every single question is safest against time-outs but costs the most total time because each answer pays the pen-switch overhead separately.",
    ],
    [
      "What happens if I run out of time before filling the OMR?",
      "Every answer left in the question booklet scores zero — invigilators collect the OMR at the closing bell and no extra time is given for transfer in exams like NEET. That is why this planner treats the transfer reserve as non-negotiable and tells you the exact minute to stop solving.",
    ],
    [
      "How many questions can I bubble per minute on an OMR sheet?",
      "About 12–20 bubbles per minute at a careful 3–5 seconds each. Rushing below 3 seconds per bubble sharply raises the risk of half-filled marks that the scanner rejects, so gaining speed by rushing the OMR is usually a losing trade.",
    ],
  ],
};

export default seo;
