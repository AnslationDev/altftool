const seo = {
  intro:
    "This countdown turns the days left before CAT into a mock schedule and a sectional study pace. It splits the remaining calendar into a concept-build, sectional-practice and full-mock phase, distributes the mocks you still owe yourself across them with the volume deliberately back-loaded, and divides your study hours across VARC, DILR and QA by each section's share of the paper. A separate calculation applies CAT's +3 and -1 marking to work out how many questions you must attempt at your current accuracy to reach a target net score.",
  useCases: [
    "Deciding in August how many mocks a 30-mock target means per week between now and the last Sunday of November",
    "Checking whether QA still has enough hours left in the plan once VARC and DILR take their share of the paper",
    "Working out how many attempts a net score of 100 needs at 80 percent accuracy before deciding to push attempts or fix accuracy",
  ],
  benefits: [
    ["Back-loaded mock plan", "Mock volume rises phase by phase instead of sitting flat across five months."],
    ["Hours split by paper weight", "Sectional time follows each section's share of the questions, not gut feel."],
    ["Marking scheme built in", "The attempts figure uses the real +3 / -1 rule, so negatives are priced in."],
  ],
  faqs: [
    [
      "When is the CAT exam held?",
      "CAT is normally written on the last Sunday of November, in three shifts across the day, and the exact date is announced by the convening IIM in its notification around late July or August. Enter your own admit card date here — the default is only the usual November Sunday.",
    ],
    [
      "How many mocks should I give before CAT?",
      "There is no official number; 25 to 35 full-length mocks with serious analysis is a common target among successful candidates, and what matters more is that the volume rises towards the exam. This tool takes whatever target you set and spreads the remaining mocks across three phases at roughly 20, 40 and 40 percent, so a 24-mock balance over 126 days becomes about 0.6 mocks a week early and 2.4 a week in the final stretch.",
    ],
    [
      "What is the CAT marking scheme?",
      "Each correct answer earns 3 marks and each wrong multiple-choice answer loses 1, while type-in-the-answer questions carry no negative marking. That makes the break-even accuracy on MCQs 25 percent — below that, every extra guess reduces your score rather than raising it.",
    ],
    [
      "Can I move time between CAT sections?",
      "No. Each of the three sections is locked to its own 40 minute window inside the 120 minute paper, so unused VARC time cannot be carried into DILR or QA. This is why sectional pace matters as much as overall preparation — a weak section cannot be rescued with extra time on exam day.",
    ],
  ],
};

export default seo;
