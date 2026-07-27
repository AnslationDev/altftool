const seo = {
  intro:
    "This planner builds a revision timetable and a bedtime around a fixed exam start time, then works out how many nights it takes to move your body clock there at the safe rate of about 30 minutes earlier per night. It sets the exam-day alarm at whichever is earlier — the time your commute and getting ready demand, or two hours before the paper so sleep inertia has cleared. Sleep targets follow the AASM and Sleep Research Society consensus of 7 or more hours for adults and 8 to 10 hours for 13 to 18 year olds.",
  useCases: [
    "A final-year student sitting a 9:30am paper finds out that shifting from a 1am bedtime to 11:15pm takes four nights, so the schedule starts on the right day.",
    "A parent plans a teenager's revision week so focus blocks finish before the wind-down instead of running to midnight.",
    "A candidate with a two-hour journey to the exam centre checks whether an eight-hour sleep target is still reachable.",
  ],
  benefits: [
    ["Realistic body clock shift", "Caps the change at 30 minutes a night, which is roughly what a sleep schedule will actually move."],
    ["Revision built around consolidation", "Reserves the last slot before bed for the hardest topic and re-tests it the next morning."],
    ["Shows when the plan breaks", "Flags focus hours that swallow the wind-down or a target below the recommended sleep range."],
  ],
  faqs: [
    [
      "How many hours should I sleep the night before an exam?",
      "Aim for your normal full night — 7 or more hours for adults, 8 to 10 for teenagers aged 13 to 18, per the AASM and Sleep Research Society consensus statements. A single short night mainly costs you reading speed, working memory and attention, which are exactly the things a paper tests.",
    ],
    [
      "How early can I move my bedtime before an exam?",
      "About 30 minutes earlier per night is the practical limit; larger jumps usually mean lying awake rather than sleeping. Moving a 1am bedtime to 11:15pm is a 105-minute shift, so it needs roughly four nights. Getting bright light immediately after waking each morning helps the shift hold.",
    ],
    [
      "Is it better to study late or to sleep?",
      "Sleep, in most cases. Memory consolidation happens during the night, so material reviewed shortly before sleeping is strengthened while you rest, whereas an all-nighter degrades the recall and attention you need the following day. If you must choose, review the hardest topic last and go to bed.",
    ],
    [
      "What time should I wake up on exam day?",
      "At least two hours before the paper starts, or earlier if your travel and getting-ready time demand it. Sleep inertia — the grogginess right after waking — typically clears within 15 to 60 minutes, and a two-hour buffer leaves room for breakfast, travel delays and a short warm-up question set.",
    ],
  ],
};

export default seo;
