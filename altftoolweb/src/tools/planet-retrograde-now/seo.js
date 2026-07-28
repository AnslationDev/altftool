const seo = {
  intro:
    "This page answers whether Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune or Pluto is retrograde on any given date by computing the planet's apparent geocentric ecliptic longitude and checking whether that longitude is decreasing. It is built for anyone who needs the station dates rather than a remembered rule of thumb — astronomy students, ephemeris checkers, calendar and almanac builders, and astrology readers who want the underlying geometry stated plainly. Longitudes are referred to the true ecliptic and equinox of date and corrected for light travel time and annual aberration using the astronomy-engine v2 ephemeris (VSOP87 for Mercury through Neptune, the analytic Pluto model valid 1700-2200); stations are the instants where the rate of change of longitude crosses zero, located by bisection to one minute of time, and the pre- and post-retrograde shadow boundaries are solved as the instants the planet crosses the two station degrees while moving direct.",
  useCases: [
    "Check whether Mercury is retrograde on a specific date, and get the exact station-retrograde and station-direct instants in UT rather than a vague month",
    "Find when the pre-retrograde shadow opens and the post-retrograde shadow closes — the full window over which a planet covers the same arc of the ecliptic three times",
    "Read every planet's status for one date at a glance, including how many of the eight are retrograde simultaneously",
    "Verify a printed or app-supplied ephemeris against an independently computed station date before publishing a calendar",
  ],
  benefits: [
    [
      "Computed, never tabulated",
      "Stations are solved from the ephemeris each time the page runs, so any date from 1900 to 2100 works and nothing goes stale when a hardcoded year ends.",
    ],
    [
      "Shadow windows included",
      "Both the pre- and post-retrograde shadow boundaries are computed as longitude crossings of the two station degrees, not estimated from a rule of thumb.",
    ],
    [
      "Stated as geometry",
      "Retrograde motion is reported as what it is — an apparent westward drift caused by the changing line of sight between Earth and the planet — with the degree, the rate in degrees per day and the method named.",
    ],
  ],
  faqs: [
    [
      "How do you tell if a planet is retrograde right now?",
      "A planet is retrograde when its apparent geocentric ecliptic longitude is decreasing, that is when the daily motion figure is negative. That single test is what this page applies: it computes longitude at two instants a tenth of a day either side of your date and takes the difference. Anything below 0 degrees per day is retrograde, anything above is direct, and the two instants where the rate passes exactly through zero are the station-retrograde and station-direct moments.",
    ],
    [
      "What is the retrograde shadow period, and how long is it?",
      "The pre-retrograde shadow begins when the planet, still moving direct, first reaches the degree at which it will later station direct; the post-retrograde shadow ends when it climbs back to the degree at which it stationed retrograde. For loops computed between 2024 and 2028 each of Mercury's shadow legs runs about 14 to 20 days against a 20 to 24 day retrograde, Venus about 32 to 34 days against roughly 41 to 43, Mars about 63 to 67 days against roughly 80, and Saturn about 95 to 98 days against roughly 137. Across the whole span the planet crosses the same arc of the ecliptic three times.",
    ],
    [
      "Why do planets appear to move backwards if they never reverse orbit?",
      "Because retrograde motion is a line-of-sight effect, not a change in the orbit. Earth and the other planet travel around the Sun at different speeds, and when Earth overtakes an outer planet near opposition, or an inner planet overtakes Earth near inferior conjunction, the planet's projected position against the background stars drifts westward for a time. Every planet keeps moving the same direction around the Sun throughout; only the apparent direction seen from a moving Earth changes.",
    ],
    [
      "How often does each planet go retrograde, and for how long?",
      "Mercury three or four times a year for about 20 to 24 days, covering roughly 9 to 16 degrees. Venus once every mean synodic period of 583.92 days — about 19 months — for roughly 41 to 43 days. Mars once every 779.94 days, about 26 months, for roughly 80 days. The outer planets turn retrograde once per synodic year: Jupiter every 398.88 days for about 118 to 123 days, Saturn every 378.09 days for about 136 to 139, Uranus about 151 days, Neptune about 158, and Pluto about 162 to 163. The durations quoted are values computed by this page for loops falling between 2024 and 2028.",
    ],
  ],
  steps: [
    "Pick a planet from the list — Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune or Pluto.",
    "Set the date. It defaults to today and is evaluated at 12:00 UT; any date from 1900 to 2100 is accepted.",
    "Read the headline answer: whether the planet is retrograde, its position in ecliptic longitude and its daily motion in degrees per day.",
    "Check the station-retrograde and station-direct instants, given in UT with the ecliptic degree at each station.",
    "Read the pre-retrograde shadow start and post-retrograde shadow end to see the full window over which the same arc is covered three times.",
    "Scan the eight-planet table for every planet's status on that same date, or copy the summary for the selected planet.",
  ],
};

export default seo;
