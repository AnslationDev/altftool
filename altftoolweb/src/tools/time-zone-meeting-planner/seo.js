const seo = {
  title: "Time Zone Meeting Planner: Working-Hours Overlap",
  metaDescription:
    "Grades every slot on a chosen day green, amber or red per participant, using the IANA time zone database for DST and 30- and 45-minute offsets.",
  steps: [
    "Pick the Meeting date, length and working hours, then add up to 8 zones from 'Add a participant's time zone'.",
    "Scan the Every workable slot table — green inside working hours, amber up to an hour outside, red unworkable, with +1d and -1d date shifts marked.",
    "Read the Best slot with each zone's local time and its score, then press Copy result to share it.",
  ],
  intro:
    "A time zone meeting planner lines up a single day across every participant's zone and shows which start times fall inside working hours for all of them. It grades each slot per zone — inside working hours, spilling up to an hour either side, or unworkable — and ranks the day by the total. Conversions use the IANA time zone database built into your browser, so daylight saving changes, India's UTC+05:30 and Nepal's UTC+05:45 come out right without any manual offset arithmetic.",
  useCases: [
    "Find the one hour that works for a standup with people in London, Bengaluru and New York before the clocks change.",
    "Check whether a 90-minute workshop can fit inside a 9-to-5 day for teams in San Francisco and Sydney, where the overlap crosses the date line.",
    "Show a client which of your afternoon slots is still morning for them, with the date shift marked.",
  ],
  benefits: [
    ["Real IANA data", "Daylight saving transitions and 30- and 45-minute offsets are resolved by the browser's time zone database."],
    ["Graded, not binary", "Amber marks a slot that spills an hour outside working hours, so you can see the near misses too."],
    ["Date shift shown", "Any zone where the meeting lands on the previous or next calendar day is flagged on the slot itself."],
  ],
  faqs: [
    [
      "What is the best time for a meeting between London, India and New York?",
      "The usual answer is around 13:00 to 14:00 UK time: that is 18:30 in India and 08:00 or 09:00 in New York depending on daylight saving. There is no slot where all three are inside a strict 9-to-5, because London to New York is five hours and London to India is another five and a half — so one side always takes an early or late call.",
    ],
    [
      "How does daylight saving affect the overlap?",
      "It can move the overlap by a full hour twice a year, and the shift is not simultaneous: the United States changes on the second Sunday in March and the first Sunday in November, the EU and UK on the last Sundays in March and October. For a fortnight each spring and autumn the usual London-to-New York gap is four hours instead of five. Because this tool converts on the actual meeting date, that is already accounted for.",
    ],
    [
      "Which time zones have offsets that are not a whole hour?",
      "India is UTC+05:30, Iran UTC+03:30, parts of Australia UTC+09:30, Newfoundland UTC−03:30, and Nepal UTC+05:45 and the Chatham Islands UTC+12:45 are 45-minute offsets. This planner reads them from the IANA database rather than a rounded table, so a slot that lands at 18:45 local shows as 18:45.",
    ],
    [
      "What counts as working hours here?",
      "Whatever you set — the default is 09:00 to 17:00 applied to every zone. A slot is graded green when the whole meeting, start to finish, sits inside that window locally; amber when it starts up to an hour early or ends up to an hour late; and red when it falls further outside or crosses local midnight.",
    ],
  ],
};

export default seo;
