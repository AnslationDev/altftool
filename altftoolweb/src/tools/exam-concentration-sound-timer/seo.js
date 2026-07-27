const seo = {
  intro:
    "This timer divides an exam paper into timed blocks in proportion to the marks each section carries, then runs those blocks with a quiet sound bed and audible cues. It works out writing time as total time minus reading time and review time, converts that into minutes per mark, and uses the largest-remainder method so the section minutes add back to the paper length exactly. It is built for students rehearsing pace at home before a board or university paper.",
  useCases: [
    "Rehearsing a 3-hour, 100-mark CBSE paper with 15 minutes of reading time and 10 minutes kept back to check answers",
    "Finding the clock time you must have finished Section B by, so you notice slippage during the paper rather than after it",
    "Running quiet brown-noise blocks in a shared room while practising, with a cue tone five minutes before each section ends",
  ],
  benefits: [
    ["Marks drive the minutes", "Every section gets time in proportion to what it is worth, not a guessed split."],
    ["Checkpoints on the wall clock", "Each block shows a real start and end time you can compare against the hall clock."],
    ["Cues instead of clock-watching", "A tone marks each block start and the warning point, so your eyes stay on the paper."],
  ],
  faqs: [
    [
      "How many minutes per mark should I spend in an exam?",
      "Divide the writing time by the total marks. A 180-minute paper with 15 minutes of reading and 10 minutes of review leaves 155 minutes for 100 marks, which is 1.55 minutes — about 93 seconds — per mark. Use it as a ceiling: if a 5-mark question has taken more than 8 minutes, move on and come back.",
    ],
    [
      "Does CBSE give reading time before the exam?",
      "Yes. CBSE board papers include 15 minutes of reading time before the writing time starts, during which candidates read the question paper but do not write in the answer book. Cambridge and most UK boards do not schedule separate reading time, so plan to spend the first few minutes of the paper scanning it.",
    ],
    [
      "Does background noise help concentration while studying?",
      "It depends on the room. Steady broadband noise helps mainly by covering intermittent sounds like talking or traffic, which are far more disruptive than constant sound. In an already quiet room it adds nothing, which is why the reading and review blocks here default to silence.",
    ],
    [
      "Can I use this in the actual exam hall?",
      "No. Almost all exam boards ban headphones, phones and any sound-making device in the hall. Use it while practising so the pacing becomes habit, then work from the invigilator's clock and the section end times you have memorised on the day.",
    ],
  ],
};

export default seo;
