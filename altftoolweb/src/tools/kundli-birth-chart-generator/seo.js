const seo = {
  title: "Free Kundli Generator — Birth Chart, Lagna & Dasha",
  h1: "Kundli / Birth Chart Generator",
  metaDescription:
    "Enter birth date, time and place for a Vedic kundli: lagna, planet houses, nakshatra, panchang and Vimshottari dasha — all calculated in your browser.",
  intro:
    "This Kundli / Birth Chart Generator builds a Vedic-style chart from a birth date, time, UTC offset and a pair of coordinates. Planetary longitudes are computed with the astronomy-engine ephemeris library — geocentric ecliptic positions for the Sun, Moon, Mars, Mercury, Jupiter, Venus and Saturn, plus Rahu and Ketu from the mean lunar node — then shifted by an ayanamsa (Lahiri, Krishnamurti or Raman) to give sidereal placements. The lagna comes from local sidereal time at your latitude and longitude, the twelve houses are assigned whole-sign from the ascendant, and the Vimshottari dasha timeline is seeded from the Moon's nakshatra lord. All of that runs as JavaScript in your browser: your birth details are never sent to AltFTool.",
  useCases: [
    "Casting your own kundli from birth date, time and city to read the lagna, moon rashi and janma nakshatra with pada",
    "Checking which Vimshottari mahadasha was running at a given age, starting from the dasha balance left at birth",
    "Comparing how Lahiri, Krishnamurti and Raman ayanamsa shift the same chart — useful when two software packages disagree",
  ],
  benefits: [
    [
      "Real ephemeris, not a lookup table",
      "Planet longitudes are calculated for your exact birth moment with astronomy-engine, down to degrees, minutes and seconds, with retrograde motion detected by comparing each planet's position twelve hours either side of birth.",
    ],
    [
      "Chart, panchang and dasha in one view",
      "A twelve-box square chart you can click house by house, plus tithi and paksha, yoga, karana, janma nakshatra with pada, element balance, atmakaraka, and the Vimshottari mahadasha sequence from the balance at birth.",
    ],
    [
      "Everything is computed on your device",
      "The chart maths is client-side JavaScript — no account, no upload of birth data. The only network call is the optional \"Find\" city search, which sends just the place name you typed to OpenStreetMap's Nominatim geocoder.",
    ],
    [
      "Copy, export or print the result",
      "Copy a plain-text kundli summary, download the full calculation (including all nine mahadasha periods) as JSON, or print the chart straight from the browser.",
    ],
  ],
  faqs: [
    [
      "How do I get my kundli from my date of birth?",
      "Date of birth alone is not enough — you also need the birth time and the birth place, because the lagna depends on both. Enter the date, the time, the UTC offset (IST is +5.5), then type the city and press Find to fill latitude and longitude, and click Generate Kundli. Without a time and coordinates you can still get planetary signs, but not a meaningful ascendant or house layout.",
    ],
    [
      "Why does the exact birth time matter so much in a kundli?",
      "Because the ascendant moves about one degree every four minutes — a full 360 degrees a day — so a whole sign of lagna passes roughly every two hours. A twenty-minute error shifts the lagna by about five degrees, and near a sign boundary it changes the lagna sign outright, which re-numbers all twelve houses and every planet's house placement.",
    ],
    [
      "Which ayanamsa does this kundli generator use?",
      "Lahiri by default, with Krishnamurti and Raman available in the dropdown. The Lahiri value is computed from a linear precession model — roughly 23.857 degrees at the start of 2000, increasing about 0.014 degrees (50 arcseconds) per year. Krishnamurti is applied as Lahiri minus 0.1 degrees and Raman as Lahiri minus 1.45 degrees. The exact ayanamsa used is printed in the centre of the chart.",
    ],
    [
      "Is this kundli and birth chart generator free?",
      "Yes — free, with no signup, no login and no limit on how many charts you generate. There is no paid tier and nothing is watermarked; you can copy the summary, download the JSON or print the chart every time.",
    ],
    [
      "What does the dasha balance at birth mean?",
      "It is the unfinished portion of the mahadasha you were born into. Vimshottari runs a 120-year cycle in a fixed order — Ketu 7, Venus 20, Sun 6, Moon 10, Mars 7, Rahu 18, Jupiter 16, Saturn 19, Mercury 17 years — and it starts with the lord of your Moon's nakshatra. The tool multiplies that lord's full period by the fraction of the nakshatra the Moon had still to travel, so the first entry is a part-period; the panel then lists the following mahadashas with start and end dates, and the JSON export carries all nine.",
    ],
    [
      "Does the chart include Rahu and Ketu?",
      "Yes. Rahu is calculated from the standard mean lunar node polynomial and Ketu is placed exactly 180 degrees opposite, and both are shown as retrograde, which is how the nodes always move. The chart covers the nine grahas of Vedic astrology — the seven visible planets plus the two nodes — so Uranus, Neptune and Pluto are deliberately not included.",
    ],
    [
      "How accurate are the planetary positions?",
      "The Sun, Moon and planet positions come from a genuine astronomical ephemeris rather than an approximation table, so they are precise for the birth moment you enter. The Vedic layer involves conventional choices: the ayanamsa uses a linear model, the nodes are mean rather than true, houses are whole-sign from the lagna, and the extreme-latitude ascendant is clamped near the polar circles. Panchang values in particular can differ from a printed panchang depending on school, ayanamsa and local sunrise rules — treat the output as an astrological and learning reference.",
    ],
    [
      "Are my birth details uploaded or stored anywhere?",
      "No. The birth date, time, coordinates and name stay in the browser tab; the chart, nakshatra, panchang and dasha are all computed locally and nothing is written to an AltFTool server. The single exception is the optional city search, which sends only the place text you typed to OpenStreetMap's public Nominatim service to get coordinates back — skip it and type the latitude and longitude yourself if you would rather make no request at all.",
    ],
  ],
  steps: [
    "Enter the birth date, birth time and UTC offset (or tap a preset such as IST +5:30), then type the birth city and press Find to fill in latitude and longitude — you can also use GPS or type coordinates directly.",
    "Choose an ayanamsa — Lahiri, Krishnamurti or Raman — and click Generate Kundli.",
    "Read the lagna chart, click any house to see its sign, lord, element and planets, then copy the summary, export the JSON or print the chart.",
  ],
};

export default seo;
