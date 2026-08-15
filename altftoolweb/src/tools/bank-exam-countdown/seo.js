const seo = {
  title: "Bank Exam Countdown: IBPS, SBI and RBI Stage",
  metaDescription:
    "Days to each stage and the prelims-to-mains gap, plus seconds per question by section and the attempts a cutoff needs after 1/4 negative marking.",
  steps: [
    "Set Today's date and choose a Recruitment exam — IBPS PO, IBPS Clerk, SBI PO, SBI Clerk, RBI Grade B (DR General) or RBI Assistant — to load that cycle's stages.",
    "Fill in a date for each stage you know, such as Preliminary exam, Main exam and Interview, and leave the rest blank; only dated stages appear on the board.",
    "The 'Next:' headline counts the days and weeks to the nearest stage and the gaps between stages follow, while 'Attempts needed to clear a cutoff' turns 'Target cutoff (marks)' and 'Your accuracy in mocks (%)' into attempts after one-fourth negative marking; Copy result copies the board.",
  ],
  intro:
    "This countdown board tracks every stage of a bank recruitment cycle — preliminary exam, main exam, interview or language test — from the dates you enter, and shows the gap between each one so the switch from prelims practice to mains preparation is planned rather than improvised. It also prices the two numbers that decide a bank result: the seconds per question a sectionally timed paper allows, and the attempts a target cutoff needs once one fourth negative marking is deducted. Stage structures are pre-filled for IBPS PO and Clerk, SBI PO and Clerk, RBI Grade B and RBI Assistant.",
  useCases: [
    "Seeing how many days sit between the IBPS PO prelims and the mains so the descriptive paper is not left to the last week",
    "Checking the speed budget table shows 40 seconds per question in a 30 question English section but only about 34 seconds per question in a 35 question Quantitative Aptitude section, even though both are locked to the same 20 minute clock",
    "Working out whether a 55 mark sectional cutoff is reachable at 85 percent accuracy or needs more attempts than the paper has questions",
  ],
  benefits: [
    ["Whole cycle on one board", "Prelims, mains and interview in date order with the gap between each stage."],
    ["Negative marking priced in", "The attempts figure uses the real one fourth deduction, so guessing is not free."],
    ["Sectional clock respected", "Speed is computed per section, because unused minutes cannot be carried forward."],
  ],
  faqs: [
    [
      "What is the negative marking in bank exams?",
      "One fourth of the marks assigned to a question is deducted for every wrong answer in the objective papers of IBPS, SBI and RBI recruitment exams, and unattempted questions cost nothing. That makes break-even accuracy 20 percent — below one correct in five, extra guessing lowers your score.",
    ],
    [
      "How much time do I get per question in bank prelims?",
      "A typical preliminary paper is 100 questions in 60 minutes with each section locked to 20 minutes, which averages 36 seconds a question, and only about 34 seconds in a 35 question Quantitative Aptitude section. Because the sections are separately timed, minutes saved in English cannot be spent on Quant.",
    ],
    [
      "Does the prelims score count in the final merit list?",
      "For IBPS probationary officer recruitment the preliminary exam is only a qualifying filter — the merit list is built on 80 percent weightage for the main examination and 20 percent for the interview. Check the notification for the post you applied to, because the weightage differs between officer and clerical cadre recruitment.",
    ],
    [
      "How many days are there between bank prelims and mains?",
      "The gap is set by each notification and has commonly run between four and eight weeks, which is why this board shows the exact number of days between the dates you enter. Plan the mains-only subjects such as banking awareness and the descriptive paper into that window rather than assuming it will be long.",
    ],
  ],
};

export default seo;
