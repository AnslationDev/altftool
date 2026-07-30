const seo = {
  intro:
    "The Availability & Time-Zone Finder takes a list of people written as `Name | UTC offset | HH:MM-HH:MM` and returns every UTC start time at which the whole meeting fits inside everyone's local working window. It steps through the full 24-hour day at your chosen interval and keeps a slot only when each person's local start time is at or after their window opens and their local end time is at or before it closes — no partial overlaps. Each surviving slot is listed with the UTC start and the local start and end for every participant, so you can pick the one that costs the fewest people their evening.",
  useCases: [
    "Booking a recurring standup for a team split across India, the UK and the US east coast, and finding out whether an hour that works for all three even exists.",
    "Checking before you promise a client a 90-minute workshop that their 09:00-17:00 and your team's 10:00-19:00 leave enough shared room for it.",
    "Settling an argument about whether someone is being unreasonable, by showing the full list of valid start times and letting the group choose rather than the organiser deciding.",
  ],
  benefits: [
    [
      "The whole meeting has to fit, not just the start",
      "A slot is only reported when start plus duration lands inside every person's window, so a 60-minute call is never proposed at 16:45 for someone who stops at 17:00.",
    ],
    [
      "Handles half-hour and quarter-hour offsets",
      "Offsets are entered as decimal hours, so 5.5 for India, 5.75 for Nepal and -3.5 for Newfoundland all work — not just whole-hour zones.",
    ],
    [
      "Shows each person's local clock time",
      "Every result row prints the local start and end for each participant next to the UTC time, so the cost of a slot is visible before anyone accepts the invite.",
    ],
  ],
  faqs: [
    [
      "How do I enter each person's availability?",
      "One person per line as `Name | UTC offset in hours | HH:MM-HH:MM`, for example `Asha | 5.5 | 09:00-18:00`. The offset is that person's current offset from UTC as a decimal number, positive east of Greenwich and negative west, and the range is their local working window in 24-hour time.",
    ],
    [
      "What meeting lengths and search intervals can I use?",
      "Duration runs from 15 to 480 minutes and the search step from 15 to 120 minutes, defaulting to a 60-minute meeting searched in 30-minute increments. A smaller step finds more candidate start times; the results table lists up to 100 of them.",
    ],
    [
      "Does it account for daylight saving time?",
      "No — you supply each person's offset yourself, so it reflects whatever offset you type. If a participant's region changes clocks between now and the meeting date, enter the offset that will apply on that date rather than today's.",
    ],
    [
      "What if it finds no common time?",
      "It reports zero common start times, which means no slot exists where the full duration sits inside every window. Shorten the meeting, widen one person's stated hours, or accept that someone takes it outside their normal day — the tool is a decision aid, and the group should agree who absorbs that cost.",
    ],
  ],
};

export default seo;
