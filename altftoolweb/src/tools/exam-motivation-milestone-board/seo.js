const seo = {
  title: "Exam Milestone Board: Target Dates, Ahead",
  metaDescription:
    "Space 2 to 12 prep milestones between your start date and exam day, get a target date for each, and see if you are ahead, on track or behind.",
  steps: [
    "Set \"Preparation start date\" and \"Exam date\", then name each entry under \"Milestones (in order — tick them off as you go)\"; \"Add milestone\" extends the list, which accepts 2 to 12 milestones.",
    "Tick a milestone's checkbox as you finish it. The board compares your completed count against what even pacing expects by today, allowing a tolerance of one milestone either way.",
    "\"Preparation progress\" gives the percentage plus an ahead, on track or behind verdict, with \"Plan expects by today\", \"Cycle elapsed\" and \"Days to exam\"; \"Milestone targets\" lists each evenly spaced date and \"Copy board\" copies it.",
  ],
  intro:
    "This board spaces your exam-preparation milestones evenly between your start date and exam day, assigns each a target date, and compares milestones actually completed against what linear pacing expects by today — the same planned-versus-actual idea used in earned-value tracking. Marking off visible sub-goals exploits the small-wins effect documented in Amabile and Kramer's progress-principle research. It is built for long prep cycles — boards, NEET, JEE, UPSC — where motivation sags between the start and the exam.",
  useCases: [
    "A JEE aspirant with 90 days left splitting prep into six milestones and checking weekly whether they are ahead or behind the line",
    "A UPSC candidate whose year-long cycle needs visible interim wins so the syllabus does not feel like one endless block",
    "A parent and teenager agreeing five concrete milestones for board prep and reviewing the board together every Sunday",
  ],
  benefits: [
    ["Honest pacing signal", "Ahead, on track, or behind — computed from elapsed days versus milestones done, with a one-milestone tolerance."],
    ["Auto target dates", "Each milestone gets an evenly spaced calendar date, the last landing on exam day."],
    ["Momentum by design", "Ticking visible sub-goals leverages the goal-gradient and small-wins effects that keep long efforts moving."],
  ],
  faqs: [
    [
      "How many milestones should I set for exam preparation?",
      "Four to eight works best for most prep cycles; this board accepts 2 to 12. Each milestone should be a verifiable event — 'first mock attempted', 'organic chemistry notes finished' — not a vague state like 'get better at maths', because you must be able to tick it decisively.",
    ],
    [
      "How does the board decide if I am ahead or behind?",
      "It assumes even pacing: if 33% of the days between your start date and exam have passed, it expects about 33% of your milestones done. Your actual count is compared with that expectation, with a tolerance of one milestone either way counting as on track — the same planned-versus-actual logic project managers call earned value.",
    ],
    [
      "Does celebrating small milestones actually help motivation?",
      "Yes — research by Teresa Amabile and Steven Kramer on the 'progress principle' found that visible progress on meaningful work is one of the strongest day-to-day motivators, and goal-gradient studies show effort rises as a marked goal gets closer. A board of ticked milestones makes that progress visible instead of leaving it as a feeling.",
    ],
    [
      "What should I do if the board says I am behind?",
      "Re-plan rather than panic: either shrink the remaining milestones to what the remaining days genuinely allow, or move the effort you can — extra daily hours rarely persist, but cutting low-yield topics does. The 'behind' flag appears when you are more than one milestone under the linear expectation, so treat it as an early warning, not a verdict on the exam.",
    ],
  ],
};

export default seo;
