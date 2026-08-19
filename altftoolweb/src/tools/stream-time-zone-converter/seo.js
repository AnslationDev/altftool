const seo = {
  title: "Stream Time Zone Converter: DST-Correct Times",
  metaDescription:
    "Convert one stream start time into every audience zone via IANA data — DST correct for the exact date, with day shifts and prime-time flags.",
  steps: [
    "Pick the Stream date, the Start time (24-hour) and the source zone under 'That time is in'.",
    "Tick the Audience time zones checkboxes for every region you announce to; offsets come from the IANA database for that exact date.",
    "Read the 'Local start time by zone' table with day-shift and slot labels, then press Copy result for a paste-ready announcement.",
  ],
  intro:
    "This converter resolves one stream start time in one IANA time zone to a single UTC instant, then re-renders that instant in every audience zone you tick. Because it reads the IANA time zone database rather than a fixed offset table, daylight saving is applied for the exact date entered — a 20:00 London slot lands on a different US hour in July than in January. Streamers, community managers and remote hosts use it to announce a schedule once without a wall of manual conversions.",
  useCases: [
    "Announcing a Saturday 20:00 IST stream and posting the matching local time for viewers in London, New York and Sydney",
    "Checking whether a slot that suits Europe leaves your US west-coast audience awake at 4am",
    "Scheduling a launch stream months ahead and getting the offsets right across a daylight-saving changeover",
  ],
  benefits: [
    ["Real DST handling", "Offsets come from the IANA database for the chosen date, not a fixed table."],
    ["Day shifts shown", "Marks when the local time lands on the next or previous calendar day."],
    ["Slot quality flags", "Labels each zone late night, morning, afternoon or prime time at a glance."],
  ],
  faqs: [
    [
      "What time should I start a stream for a global audience?",
      "No single hour suits everyone; a slot that is early evening in Europe is usually late morning in North America and the small hours in Australia. Pick the zone holding most of your audience, keep the rest above about 8am local, and check the flags here before committing.",
    ],
    [
      "Why does the time difference between two cities change during the year?",
      "Because daylight saving starts and ends on different dates in different countries. London and New York are 5 hours apart most of the year but 4 hours apart for roughly two weeks in March and one week in late October, when only one of them has shifted.",
    ],
    [
      "Does India change its clocks for daylight saving?",
      "No. India stays on IST, UTC+05:30, all year. So the gap between India and any country that does observe daylight saving moves by an hour twice a year.",
    ],
    [
      "What happens if I pick a time that does not exist?",
      "On the spring-forward date, clocks jump straight from 02:00 to 03:00 in most of the US and from 01:00 to 02:00 in the UK, so times inside that hour never occur. The converter flags this and uses the nearest real local time instead.",
    ],
  ],
};

export default seo;
