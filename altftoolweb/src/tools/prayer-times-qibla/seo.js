const seo = {
  title: "Prayer Times and Qibla Direction, Computed",
  metaDescription:
    "Fajr to Isha and the Qibla bearing from true north for 92 cities or your own location, worked out on your device — MWL, ISNA, Umm al-Qura or Karachi.",
  steps: [
    "Use 'Search cities' to pick one of the 92 built-in cities or press 'Use my location', then set the Date.",
    "Open Calculation settings to choose the convention — Muslim World League, ISNA, Umm al-Qura or Karachi — the Shafi or Hanafi Asr rule, and a high-latitude rule if Isha comes out undefined.",
    "Read Fajr, Dhuhr, Asr, Maghrib and Isha with the next prayer called out, and the Qibla bearing in degrees from true north with the distance to the Kaaba, then press Copy times.",
  ],
  intro:
    "This tool computes the five daily prayer times and the Qibla bearing from the standard solar equations — Julian date, solar declination, the equation of time and hour angles — entirely on your device, with no lookup or network request. Choose from 92 built-in cities or use your browser location, pick a calculation method (Muslim World League, ISNA, Umm al-Qura or Karachi) and the Shafi or Hanafi rule for Asr, and it returns Fajr, Dhuhr, Asr, Maghrib and Isha plus sunrise and Islamic midnight. The Qibla is the great-circle bearing to the Kaaba at 21.4225°N, 39.8262°E, given in degrees from true north alongside the distance in kilometres.",
  useCases: [
    "You have travelled to a new city and want today's Fajr and Isha for that exact location and time zone, using the same convention your local mosque follows.",
    "You are setting up a prayer space in a new flat and need the Qibla bearing in degrees so you can line the mat up with a compass rather than guessing from a map.",
    "You are in northern Europe in June, the sun barely dips below the horizon, and Isha comes out undefined — so you switch on the one-seventh or middle-of-the-night rule to get a usable time.",
  ],
  benefits: [
    [
      "Four calculation methods with their angles shown",
      "MWL uses Fajr 18° and Isha 17°, ISNA 15°/15°, Karachi 18°/18°, and Umm al-Qura Fajr 18.5° with Isha fixed at 90 minutes after Maghrib — the parameters are on screen, not hidden.",
    ],
    [
      "Handles high-latitude edge cases",
      "Angle-based, one-seventh and middle-of-the-night rules are all available for locations where the sun never reaches the twilight angle, and the page flags when an adjustment has been applied.",
    ],
    [
      "Qibla with the compass caveat built in",
      "The bearing is computed from true north via the great-circle formula and shown with the distance to Mecca, plus a reminder that a phone compass usually reads magnetic north and needs the local declination added.",
    ],
  ],
  faqs: [
    [
      "Why do prayer times differ between apps and mosques?",
      "Because different organisations use different twilight angles for Fajr and Isha. This tool exposes four: MWL at 18°/17°, ISNA at 15°/15°, Karachi at 18°/18°, and Umm al-Qura at 18.5° with Isha 90 minutes after Maghrib (120 minutes in Ramadan). Pick the one your local mosque follows and the times will line up.",
    ],
    [
      "What is the difference between Shafi and Hanafi Asr?",
      "Asr is set by shadow length: the Shafi (and Maliki, Hanbali) rule starts Asr when an object's shadow equals its own length plus its noon shadow, while the Hanafi rule uses twice the object's length. The Hanafi setting therefore gives a noticeably later Asr.",
    ],
    [
      "How is the Qibla direction calculated?",
      "As the initial great-circle bearing from your coordinates to the Kaaba at 21.4225°N, 39.8262°E, expressed in degrees clockwise from true north. Note that a magnetic compass points to magnetic north, which differs from true north by anywhere from under a degree in much of India to more than 15° in parts of North America — add your local declination before using the figure on a compass.",
    ],
    [
      "Are these times exact enough to pray by?",
      "They are astronomical calculations and should agree closely with published timetables using the same method, but conventions differ on small details — this tool adds one minute to solar noon for Dhuhr and uses the 0.833° refraction figure for sunrise and sunset. Where a local mosque or religious authority publishes a timetable, follow that; treat these figures as a reference, especially at high latitudes where the rules are approximations.",
    ],
  ],
};

export default seo;
