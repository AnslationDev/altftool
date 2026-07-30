const seo = {
  intro:
    "This tracker reads the IANA time zone database bundled with the page and reports, for any zone, the exact UTC instant of its next clock change, the local wall-clock reading before and after the jump, the size and direction of the shift and the resulting UTC offset — plus the dates on which a recurring meeting's gap between two or three zones silently moves. It is built for anyone running a standing call across borders, and for developers scheduling cron jobs and calendar invites, because the underlying rules do not line up: the United States switches on the second Sunday of March and the first Sunday of November under the Energy Policy Act of 2005 §110, while the European Union switches on the last Sundays of March and October at 01:00 UTC under Directive 2000/84/EC, leaving three weeks each spring and one week each autumn in which the usual offset between them is simply wrong.",
  useCases: [
    "Checking why a weekly New York–London call moves an hour for exactly 21 days from 8 March 2026 to 29 March 2026, and getting the two dates to warn attendees about",
    "Confirming that a nightly job scheduled at 02:30 local in America/New_York has no instant to run on 8 March 2026, because the clock jumps straight from 02:00 EST to 03:00 EDT",
    "Deciding which UTC instant a 01:30 timestamp in Europe/London means on 25 October 2026, when 01:30 happens once on BST and again an hour later on GMT",
    "Answering whether a partner in São Paulo, Mexico City or Istanbul will shift with you in March — none of them have moved their clocks since 2019, 2022 and 2016 respectively",
  ],
  benefits: [
    [
      "The exact instant, not the date",
      "Each change is reported as a UTC timestamp plus the local reading either side, so 2026-03-08T07:00:00Z is shown as 02:00 EST becoming 03:00 EDT.",
    ],
    [
      "Meeting gaps over time, not today's offset",
      "The safety check walks every weekly occurrence and lists only the dates where the gap to another zone actually changes, with the old and new local start times.",
    ],
    [
      "Skipped and repeated hours handled",
      "A local time inside a spring-forward gap is reported as never happening; one inside an autumn overlap is reported with both UTC instants it maps to.",
    ],
    [
      "Data that maintains itself",
      "Every figure comes from the IANA tz database shipped with the site, so a new tzdb release — Egypt restarting summer time in 2023, Iran dropping it in 2022 — updates the page with no hand-edited table to go stale.",
    ],
  ],
  faqs: [
    [
      "When do the clocks change in 2026?",
      "In the United States clocks go forward one hour at 02:00 local on Sunday 8 March 2026 (07:00 UTC for Eastern time) and back one hour at 02:00 local on Sunday 1 November 2026 (06:00 UTC). In the United Kingdom and the European Union clocks go forward at 01:00 UTC on Sunday 29 March 2026 and back at 01:00 UTC on Sunday 25 October 2026. Australia's south-eastern states go back at 03:00 local on Sunday 5 April 2026 and forward at 02:00 local on Sunday 4 October 2026.",
    ],
    [
      "Why is New York only 4 hours behind London for part of March?",
      "Because the two regions switch on different weekends. New York moves to UTC-4 on 8 March 2026 while London stays on UTC+0 until 29 March 2026, so for those 21 days the gap is 4 hours instead of the usual 5. The same thing happens in reverse for 7 days in autumn: London returns to UTC+0 on 25 October 2026 but New York stays on UTC-4 until 1 November 2026.",
    ],
    [
      "What happens to a meeting set for 02:30 on the morning the clocks go forward?",
      "It has no instant at all. In America/New_York on 8 March 2026 the clock reads 01:59:59 EST and the next second reads 03:00:00 EDT, so every local time from 02:00 up to 02:59 is skipped — this tool reports such a reading as never happening and gives you the instant the clocks jump to, 2026-03-08T07:00:00Z. Calendar apps and cron implementations each pick their own fallback, which is why the invite and the job can disagree.",
    ],
    [
      "Which countries have stopped changing their clocks?",
      "Going by the last clock change recorded in the IANA database: Brazil last moved in 2019, Mexico and Iran in 2022, Türkiye in 2016 and Russia in 2014, while India last moved in 1945, China in 1991, Japan in 1951 and the Australian state of Queensland in 1992. The traffic is not one way — Egypt restarted summer time in 2023 after last changing its clocks in 2014, so the tool reads the current database rather than a fixed list.",
    ],
  ],
};

export default seo;
