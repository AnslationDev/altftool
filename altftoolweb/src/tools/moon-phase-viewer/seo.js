const seo = {
  intro:
    "Moon Phase Today & Calendar reports the current phase name, the illuminated fraction of the disc as a percentage, and the moon's age in days since the last new moon, computed with the astronomy-engine ephemeris rather than an approximation of the 29.53-day cycle. Alongside it sits a month grid drawing every day's phase with its illumination, and the dates and clock times of the next new moon, first quarter, full moon and last quarter. It is for anyone planning around moonlight — a night shoot, a stargazing session, a fast or festival date — who needs the real figure for a specific day rather than a rough phase name.",
  useCases: [
    "You are planning an astrophotography night and want the darkest window in the month, so you scan the calendar grid for the days sitting closest to zero percent illumination.",
    "A festival or fast in your family falls on a full moon and you need the exact date and time it occurs this month, not just which week it lands in.",
    "You are checking a date months ahead for an outdoor event and want to know whether there will be useful moonlight after sunset.",
  ],
  benefits: [
    ["Real ephemeris, not a 29.5-day estimate", "Phase angle and illuminated fraction come from an astronomical calculation for the exact moment, so the figure holds up against an almanac instead of drifting."],
    ["A whole month at once", "Every day in the grid is drawn with its own lit shape and illumination percentage, and the new and full moon days are marked, so the cycle is readable at a glance."],
    ["Next four quarters with times", "The upcoming new moon, first quarter, full moon and last quarter are each given with a date, a local time and a countdown in days."],
  ],
  faqs: [
    [
      "What moon phase is it today?",
      "The page reads your device's current date and returns the phase name, the percentage of the disc that is lit and the moon's age in days since the last new moon. Ages run from 0 at new moon to about 29.53 days when the next one begins, with the full moon falling near day 14.8.",
    ],
    [
      "How is the illumination percentage different from the phase name?",
      "Illumination is the exact fraction of the visible disc that is sunlit — it changes every hour — while the phase name is a band. A phase is labelled new, first quarter, full or last quarter only when the moon is within 6.1 degrees of that exact alignment; everything in between is called a crescent or gibbous.",
    ],
    [
      "When is the next full moon?",
      "The events panel searches forward from today for each of the four principal phases and lists them in date order with the local clock time and a countdown such as 'in 9 days'. Because the search runs from the current moment, the next full moon is shown whether it falls this month or next.",
    ],
    [
      "How long is the cycle between two full moons?",
      "29.53 days on average — the synodic month, used here as 29.530588853 days. Individual cycles vary by several hours either side because the Moon's orbit is elliptical, which is why the tool gives each event a computed time instead of adding a fixed interval.",
    ],
  ],
};

export default seo;
