const seo = {
  title: "Study Hydration Reminder & Sip Schedule Planner",
  metaDescription:
    "Pro-rates EFSA daily water intake (2.0-2.5 L adults) over your study block into a sip schedule sized to your glass, with a hot-room uplift of about 20%.",
  steps: [
    "Enter 'Study session length (minutes)', pick who is studying from the EFSA profiles ('Girl, 9-13 years' to 'Male, 14 years and over'), set your 'Comfortable amount per drink (ml)' and tick the hot-room checkbox if it applies.",
    "The plan recomputes live: 'Water for this session' in ml, how much to drink every how many minutes, EFSA daily reference rows, and a 'Sip timeline' with a running total at each stop; the hot-room toggle adds about 20%.",
    "Press 'Copy schedule' to copy the plan as text or 'Reset' to return to the 180-minute session and 150 ml drink defaults.",
  ],
  intro:
    "This tool works out how much water one study session needs by pro-rating the EFSA adequate daily intake — 2.5 litres total water for adult men, 2.0 litres for adult women, of which about 80% normally comes from drinks — across a 16-hour waking day, then converts it into a sip schedule sized to your glass or bottle. It is built for students who forget to drink during long revision blocks and end up with a headache by evening.",
  useCases: [
    "A student doing a 3-hour evening revision block who wants to know that roughly 300 ml spread over the session is enough — not a full bottle",
    "Parents setting a simple 'drink at these times' card for a 12-year-old preparing for school exams in summer",
    "A candidate studying 8-hour days in a hot room who wants the schedule adjusted upward and copied into their planner",
  ],
  benefits: [
    ["Real reference values", "Targets come from EFSA's 2010 dietary reference values for water, split by sex and age band — not a made-up 8-glasses rule."],
    ["Sized to your bottle", "Tell it how much you comfortably drink at once and it computes how many drinks and how far apart."],
    ["Heat-aware", "A hot-room toggle adds a clearly labelled ~20% uplift, since needs rise in warm conditions."],
  ],
  faqs: [
    [
      "How much water should I drink while studying?",
      "Pro-rated from EFSA's daily values, a 3-hour study block needs roughly 300-375 ml for an adult — about two to three small glasses, spread out rather than downed at once. The full daily reference is 2.0 litres of total water for adult women and 2.5 litres for adult men, with about 80% of that normally coming from drinks.",
    ],
    [
      "Does mild dehydration really affect concentration and memory?",
      "Yes — studies of mild dehydration at around 1-2% of body mass loss report measurable dips in attention, short-term memory and mood, which is exactly the range you can reach by simply forgetting to drink through a long study day. Steady sipping prevents it without bathroom-break disruption.",
    ],
    [
      "Is the 8 glasses of water a day rule true?",
      "It has no clear scientific origin. Formal reference values are set by bodies like EFSA — 2.0 to 2.5 litres of total water per day for adults, including the roughly 20% that comes from food — and actual needs shift with body size, heat and activity. Thirst plus pale-yellow urine is a better practical check than glass-counting.",
    ],
    [
      "Should I drink water during the exam itself?",
      "If your exam centre allows a transparent water bottle, yes — small sips are sensible in a 3-hour paper, especially in summer, and research on students allowed water in exams has associated it with slightly better performance. Check your admit card or centre rules first, since policies differ between boards.",
    ],
  ],
};

export default seo;
