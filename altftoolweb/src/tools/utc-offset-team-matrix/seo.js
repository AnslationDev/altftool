const seo = {
  intro:
    "This tool builds a 24-hour overlap matrix for a distributed team: pick the cities your teammates work from and the shared local working hours, and it maps every UTC hour to each city's local clock, counts who is at work, and finds the longest slot where the most people overlap. It handles half-hour offsets like Bengaluru's UTC+5:30 and windows that wrap midnight, giving engineering managers a defensible answer for standup and meeting times.",
  useCases: [
    "An engineering manager with teammates in New York, London and Bengaluru finding that no single hour covers all three, and picking the best 2-of-3 slots",
    "A remote-first startup choosing a recurring standup time and needing its local equivalent in every hub city",
    "A recruiter or founder checking how much daily overlap a candidate in Sydney would actually have with a San Francisco team",
  ],
  benefits: [
    ["Full 24-hour grid", "Every UTC hour shows each city's local time and who is inside working hours."],
    ["Best-slot detection", "Finds the longest contiguous run at maximum overlap, even when it wraps midnight UTC."],
    ["Half-hour zones handled", "Bengaluru's UTC+5:30 and similar offsets are computed to the minute, not rounded."],
  ],
  faqs: [
    [
      "How do I find overlapping working hours across timezones?",
      "Convert each city's working hours into UTC using its offset, then intersect them: an hour overlaps when it falls inside every city's converted range. With 09:00-17:00 local days, London and Berlin share 7 hours, but adding New York and Bengaluru to the same team leaves zero hours where all four are at work — which is exactly what the matrix makes visible.",
    ],
    [
      "What is the best meeting time for a team in the US, Europe and India?",
      "With standard 09:00-17:00 working days there is usually no hour that suits all three; the practical compromises are around 14:00-16:00 UTC (morning US East, afternoon Europe, evening India) or 09:00-11:00 UTC (Europe morning, India afternoon, before the US wakes). Many teams alternate between two slots so the same region is not always inconvenienced.",
    ],
    [
      "How much timezone overlap does a distributed team need?",
      "A common working rule is at least 3-4 shared hours per day for teams that pair or review synchronously, while heavily async teams can function with 1-2 hours reserved for standups and blockers. Below one shared hour, teams generally switch to fully async communication with rotating meeting times for the few live sessions.",
    ],
    [
      "Does daylight saving time change team overlap?",
      "Yes — US, UK, EU and Australian cities shift their UTC offset by one hour seasonally, and because the northern and southern hemispheres shift in opposite directions, a Sydney-London overlap can change by two hours across the year. This matrix uses standard-time offsets, so re-check your slots after each DST transition.",
    ],
  ],
};

export default seo;
