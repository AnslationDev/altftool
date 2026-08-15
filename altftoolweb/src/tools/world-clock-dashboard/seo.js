const seo = {
  title: "World Clock Dashboard: 12 Cities, Shared Work Hours",
  metaDescription:
    "Live local time, UTC offset and day for up to 12 cities, plus an overlap strip of hours inside everyone's working window. DST and +05:45 handled.",
  steps: [
    "Set \"Home city (everything is compared to this)\", then choose a city under \"Add a city\" and press Add — the board holds up to 12.",
    "Set \"Working day starts\" and \"Working day ends\", and use the 12-hour clock / 24-hour clock toggle to change how times are shown.",
    "Read the Board for each city's live time and UTC offset, check the Overlap strip for hours inside every city's working window, then press Copy board.",
  ],
  intro:
    "A world clock dashboard is a single board showing the current local time, UTC offset and day for several cities at once, so you never have to add or subtract hours in your head. This one runs entirely in your browser on the IANA time-zone database that ships with the JavaScript engine, so daylight saving, half-hour zones like India's UTC+05:30 and 45-minute zones like Nepal's UTC+05:45 are all handled correctly. It is built for remote teams, freelancers with overseas clients and anyone scheduling calls across continents.",
  useCases: [
    "Check whether it is still office hours in London, New York and Singapore before sending a call invite.",
    "Find the two or three hours a day when a Mumbai, Berlin and San Francisco team are all at their desks.",
    "Confirm that a 09:00 Sydney standup lands on the previous calendar day for colleagues in Los Angeles.",
  ],
  benefits: [
    ["Daylight saving handled for you", "Offsets come from the browser's IANA tz database, so a March or November clock change is reflected the moment it happens."],
    ["Odd offsets get it right", "Kolkata at UTC+05:30, Kathmandu at UTC+05:45 and Chatham-style zones land on the correct half-hour slot, not a rounded hour."],
    ["Overlap at a glance", "A 24-row strip highlights every hour where every city on the board is inside its own working day."],
  ],
  faqs: [
    [
      "How many time zones can I add to the board?",
      "Up to 12 cities. That limit keeps the overlap table readable on a phone screen; beyond about a dozen columns the strip has to scroll sideways to be useful.",
    ],
    [
      "Does this handle daylight saving time automatically?",
      "Yes. Offsets are derived live from the IANA time-zone database built into your browser, so New York shows UTC−05:00 in January and UTC−04:00 in July without you changing anything.",
    ],
    [
      "Why does India show UTC+05:30 instead of UTC+5?",
      "India uses a single national offset of 5 hours 30 minutes ahead of UTC, set from the 82.5°E meridian, and it has no daylight saving. Nepal goes further at UTC+05:45, which is why hour-only converters mis-schedule calls to Kathmandu.",
    ],
    [
      "What counts as a shared working hour?",
      "An hour where the local clock in every city on the board falls inside the working window you set, which defaults to 09:00–17:00. The end hour is exclusive, so a 09:00–17:00 window covers 09:00 through 16:59 local.",
    ],
  ],
};

export default seo;
