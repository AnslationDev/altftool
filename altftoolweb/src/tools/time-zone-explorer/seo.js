const seo = {
  title: "Time Zone Explorer — Live Clocks for 39 World",
  metaDescription:
    "Compare live clocks across 39 cities with UTC offsets, DST badges and hour differences from your home city — then copy or download a plain-text report.",
  steps: [
    "Type in the \"Add a city...\" search box and pick from the 39 built-in cities; the first card is marked Home and others show hours ahead or behind it.",
    "Watch each card's analog and digital clock tick every second with its UTC offset, local date, day period and a DST Active badge when daylight saving applies.",
    "Click Copy Report, or Download to save all times, offsets and differences as Timezone_Report.txt.",
  ],
  intro:
    "Time Zone Explorer shows live analog and digital clocks for a shelf of world cities side by side, with each city's UTC offset, local date, day-or-night period and a badge when daylight saving is currently in effect. It reads the browser's built-in Intl API rather than a bundled offset table, so the offsets follow the current IANA zone rules, and every clock ticks once a second. Pick from 39 cities across six continents, set one as your home zone, and each other card shows the hour difference from it.",
  useCases: [
    "Running a standup across New York, London and Tokyo — the three defaults — and wanting to see at a glance whether the slot you are about to propose lands at 6 am for someone.",
    "Working out whether a colleague in Sydney or Auckland has already moved their clocks: the DST Active badge and the shown offset tell you, instead of you remembering that the southern hemisphere shifts the other way.",
    "Sending round a written summary of a distributed team's local times — copy or download the plain-text report, which lists each city's time, offset, date, DST state and hours from your home city.",
  ],
  benefits: [
    [
      "Offsets from the live zone database, not a static table",
      "Times and offsets come from Intl.DateTimeFormat with the IANA zone id, so a country that changes its rules is reflected as soon as the browser's data is updated.",
    ],
    [
      "Day-or-night at a glance",
      "Each card is tagged Morning, Afternoon, Evening or Night by local hour, so you can see who is asleep without doing the arithmetic.",
    ],
    [
      "Everything relative to one home city",
      "Whichever city sits first is marked Home, and every other card shows the hour difference from it, which is the number you actually need when proposing a meeting.",
    ],
  ],
  faqs: [
    [
      "How many cities can I compare at once?",
      "As many as you like, chosen from the 39 built-in cities across the Americas, Europe, Africa, Asia and Oceania; there is no cap on how many clocks you add. The view resets to New York, London and Tokyo whenever you press Reset.",
    ],
    [
      "How do I know if a city is currently on daylight saving time?",
      "A DST Active badge appears on the card when the city's current abbreviation differs from its winter one. Daylight saving shifts the clock forward by one hour, and changeover dates differ by country — the EU and the US, for example, do not switch on the same weekend.",
    ],
    [
      "Why is the difference between two cities not a whole number of hours?",
      "Not every zone is offset by a whole hour. India runs at UTC+5:30, Nepal at UTC+5:45, and parts of Australia at UTC+9:30, because zones are political boundaries rather than exact 15°-per-hour slices of the Earth's rotation.",
    ],
    [
      "Are the times accurate?",
      "They are as accurate as your device's clock, since every zone is computed by converting your system time into the target zone. If a city looks an hour out, check that your operating system's clock and time zone are set to update automatically.",
    ],
  ],
};

export default seo;
