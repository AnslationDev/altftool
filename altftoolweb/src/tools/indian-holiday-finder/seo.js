const seo = {
  intro:
    "Indian Holiday Finder is a year planner that lists India's national holidays, festival dates, state-wise observances and banking closures for 2025, 2026 and 2027, and flags the ones that create long weekends. It applies the RBI-style banking pattern — every Sunday plus the second and fourth Saturday of each month — and marks any holiday landing on a Monday or Friday as a long-weekend candidate. Filter by month, by one of 12 states or All India, and by type, then export the result as CSV.",
  useCases: [
    "Planning next year's leave in December: switch to 2026, filter to holidays falling on Monday or Friday, and see which three-day weekends you can extend with a single day off.",
    "You need a cheque cleared or an NEFT settled and want to know whether the branch is shut — filter type to Bank to see the Sundays and the second and fourth Saturdays for that month.",
    "Running an office with staff in Kerala and Maharashtra: set the state filter to each one in turn to see Onam and Ganesh Chaturthi separately from the all-India list before publishing the holiday policy.",
  ],
  benefits: [
    ["State filter, not just a national list", "Twelve states are mapped individually, so Pongal, Kannada Rajyotsava and Poila Boishakh show up only where they are actually observed."],
    ["Bank weekends generated, not typed", "Sundays and second/fourth Saturdays are computed from the calendar for whichever year you pick, so they stay correct across leap years."],
    ["Long weekends surfaced automatically", "Holidays falling on a Monday or Friday are separated out so you can spot bridge-day opportunities without scanning the whole year."],
  ],
  faqs: [
    [
      "Which Saturdays are bank holidays in India?",
      "The second and fourth Saturday of every month are bank holidays, along with every Sunday. The first, third and fifth Saturdays are normal working days for banks, which is why some months have two Saturday closures and some have two plus a working fifth Saturday.",
    ],
    [
      "Which years does this holiday finder cover?",
      "It covers 2025, 2026 and 2027. Fixed-date holidays such as Republic Day (26 January), Independence Day (15 August) and Gandhi Jayanti (2 October) repeat every year, while lunar and moon-sighting festivals are listed per year because their dates move.",
    ],
    [
      "How do I find long weekends in India this year?",
      "Look for holidays that fall on a Monday or a Friday — those give a three-day weekend with no leave at all, and one bridge day either side turns them into four. The tool separates these out for the year and state you have selected.",
    ],
    [
      "Are the festival dates guaranteed to be accurate?",
      "Treat them as planning dates, not official notifications. Eid al-Fitr, Eid al-Adha, Muharram and Milad-un-Nabi depend on local moon sighting and can shift by a day, and each state government publishes its own gazetted holiday list — confirm against that before booking travel or committing to a payroll calendar.",
    ],
  ],
};

export default seo;
