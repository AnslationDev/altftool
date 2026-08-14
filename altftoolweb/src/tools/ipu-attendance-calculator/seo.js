const seo = {
  title: "IPU Attendance Calculator: 75% Rule, Subject-Wise",
  metaDescription:
    "Per-subject GGSIPU attendance against the 75% bar, how many of the classes left you must attend, how many you can skip, and the condonation bands.",
  steps: [
    "For each paper enter Classes held, Classes attended and 'Classes still to come', adding papers with the 'Add another subject' button.",
    "Leave 'Attendance required per subject (%)' at 75 unless your institute says otherwise; the panel beside it sets out the Dean/Director's 5-point condonation and the Vice-Chancellor's further 5 points.",
    "'Overall attendance so far' and a 'Subject by subject' table appear at once, giving Now, Must attend, Can skip and Best possible per paper plus the weakest subject; Copy result copies the summary.",
  ],
  intro:
    "This calculator works out your GGSIPU attendance one subject at a time — attended ÷ held × 100 — and compares each paper against the University's 75% requirement for sitting the end-term examination. Because IPU judges attendance per subject rather than as a semester average, it also computes how many of the classes still scheduled you cannot afford to miss, and how many you can skip and still finish above the bar. It is built for IPU undergraduates tracking detention risk mid-semester, when there is still time to act.",
  useCases: [
    "A second-year BTech student sitting at 70% in Digital Electronics with twelve classes left, checking how many of those twelve are compulsory to finish at 75%.",
    "A student who is comfortably at 92% in one paper working out how many lectures can be missed for a placement drive without dropping below the requirement.",
    "Deciding, in week eight rather than week fifteen, whether a shortfall is still recoverable or whether the class coordinator needs to be approached about condonation.",
  ],
  benefits: [
    ["Per-subject, like the University", "Flags the one weak paper that a healthy overall average hides."],
    ["Counts the classes, not just the percentage", "Turns a shortfall into a number of lectures you must attend."],
    ["Shows the condonation bands", "Separates a recoverable gap from one only a discretionary relaxation could cover."],
  ],
  faqs: [
    [
      "What is the minimum attendance required in IPU?",
      "75% of the classes held in each subject, counted separately for every paper, is the requirement to be allowed to sit the end-term examination. An overall semester average of 75% does not help if one subject is below it — detention is decided subject by subject.",
    ],
    [
      "Can IPU condone attendance below 75%?",
      "A shortfall of up to 5 percentage points may be condoned by the Dean or Director of the institution, and the Vice-Chancellor may relax a further 5 points for students who represented the University in approved sports, NCC, NSS or cultural activity. Both are discretionary powers, not entitlements, so a student at 70% should treat detention as the default outcome and the condonation as a request that may be refused.",
    ],
    [
      "How many classes do I need to attend to get from 70% to 75%?",
      "If the term length is unknown, the number of consecutive classes n satisfies n = (75 × classes held − 100 × classes attended) ÷ 25. At 28 attended out of 40 held, that is 8 classes in a row, which takes you to 36 of 48, exactly 75%. Every class you attend raises the numerator and the denominator together, which is why recovery gets slower the later you leave it.",
    ],
    [
      "Does medical leave count as attendance at IPU?",
      "Medical absence is not marked present; it is a ground on which a shortfall may be condoned once you fall short. Submit the medical certificate to the institute at the time of the illness rather than at the end of the semester, and keep checking the attendance uploaded on the portal, since the figure the institute uploads on the cut-off date is what decides eligibility. For your own case, confirm the position with your class coordinator and the current examination ordinance.",
    ],
  ],
};

export default seo;
