const seo = {
  title: "Life Productivity Score: 7 Weighted Pillars",
  metaDescription:
    "Score one logged day out of 100 across sleep (25), focused work (20), activity (15), tasks (15), screen time (10), learning (8) and social (7).",
  intro:
    "The Life Productivity Score turns one logged day into a single 100-point number built from seven weighted pillars: sleep (25 points), focused work (20), physical activity (15), task completion (15), discretionary screen time (10), learning (8) and social contact (7). Each target is a published guideline — the National Sleep Foundation's 7–9 hour adult range and the WHO's 150 minutes of moderate activity a week, for example — and the tool shows exactly how many points each pillar earned so the number is auditable rather than mysterious. It is for anyone who wants a repeatable weekly measure instead of a vague sense that the week went badly.",
  useCases: [
    "Score each weekday for a fortnight to see whether late nights or long screen sessions cost you more points.",
    "Compare a work-from-home day against an office day using the same seven pillars.",
    "Settle on the single habit worth fixing first by reading the biggest-gap line instead of guessing.",
  ],
  benefits: [
    ["Transparent weights", "All seven weights and targets are printed, so you can check the arithmetic by hand."],
    ["Guideline-based targets", "Sleep and activity thresholds come from published health guidance, not invented numbers."],
    ["One clear next action", "The pillar losing the most points is named, so the improvement is obvious."],
  ],
  faqs: [
    [
      "How is the productivity score calculated?",
      "It is the sum of seven weighted components out of 100: sleep 25, focused work 20, physical activity 15, task completion 15, screen time 10, learning 8 and social contact 7. Each component scores full marks at its target and tapers linearly away from it — sleeping 5 hours instead of 7, for instance, costs 8 points per hour and scores 9 of 25.",
    ],
    [
      "How many hours of focused work should I aim for?",
      "Three to five hours a day earns full marks. Research on deliberate practice, starting with Ericsson's 1993 study of expert performers, puts the sustainable ceiling near four hours; claiming much more usually means the hours were not genuinely undistracted, so the score tapers above five.",
    ],
    [
      "What counts as a good score?",
      "90 and above is exceptional, 75–89 strong, 60–74 solid, 40–59 building and below 40 needs attention. A single day means little — the useful figure is your average across a week or two, because one bad night's sleep can move the total by 25 points.",
    ],
    [
      "Is this a medical or clinical assessment?",
      "No. It is a self-tracking aid that scores your own logged numbers against public health guidelines. It cannot diagnose anything, and persistent short sleep, exhaustion or low mood are worth discussing with a doctor rather than a calculator.",
    ],
  ],
  steps: [
    "Log the day in the eight number boxes: Sleep last night (hours), Focused, undistracted work (hours), Physical activity (minutes), Tasks completed, Tasks planned, Non-work screen time (hours), Reading or learning (minutes) and Meaningful social contact (minutes). The three hour fields step by 0.5 and cap at 24, the minute fields step by 5 and cap at 1440, and the two task fields are whole numbers up to 999.",
    "Today's score recalculates on every keystroke — there is no calculate button — giving a total out of 100, a band from Exceptional through Strong, Solid and Building to Needs attention with its one-line note, and one row per pillar showing points earned against the weight, for example Sleep (target 7–9 hours) 25 / 25. Two further rows name the Biggest single gain available and the Hours accounted for out of 24; if sleep, focus, screen time, activity, learning and social time add up to more than 24 hours the score is replaced by \"That adds up to … hours — a day only has 24.\"",
    "Click Copy result to copy the score and band, every pillar line with its target and points, the biggest gap and the hours logged as plain text — the button reads Copied! for 1.5 seconds. Reset puts all eight fields back to their starting values.",
  ],
};

export default seo;
