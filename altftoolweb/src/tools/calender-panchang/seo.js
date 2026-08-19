const seo = {
  title: "Panchang: Tithi, Nakshatra, Yoga, Rahu Kaal",
  metaDescription:
    "Free Panchang: tithi, nakshatra, yoga, karana and the sunrise-to-sunrise day for any date and place, computed with the Lahiri ayanamsa.",
  intro:
    "This panchang computes what it shows. Sunrise, sunset and solar noon come from the NOAA solar position algorithm; tithi and karana from the Moon's elongation from the Sun; nakshatra from the sidereal lunar longitude; yoga from the sum of the sidereal solar and lunar longitudes — all from the Meeus (Astronomical Algorithms) series, evaluated for the date and coordinates you choose. Sidereal positions use the Lahiri (Chitrapaksha) ayanamsa, which is stated on the page because a different ayanamsa can move a nakshatra boundary by more than an hour. Rahu Kaal, Yamaganda, Gulika, Abhijit and the Choghadiya are derived from that day's own sunrise and sunset rather than from fixed clock times. Nothing is sent to a server, and the same date and place always give the same answer.",
  useCases: [
    "Check the tithi and nakshatra running at sunrise, and the exact moment each of them ends, before fixing a vrat or a ceremony.",
    "Read the day's Rahu Kaal, Yamaganda and Gulika computed from the real sunrise for your own city rather than a generic table.",
    "Look up sunrise, sunset, day length and Abhijit Muhurta for a date months ahead while planning travel or a function.",
    "Compare the amanta lunar month, ritu, ayana, Shaka and Vikram years and the samvatsara for any date between 1700 and 2200.",
  ],
  benefits: [
    [
      "Computed, never tabulated",
      "Every time on the page is solved for the given date and latitude and longitude. There are no stored constants standing in for sunrise, Rahu Kaal or a tithi boundary.",
    ],
    [
      "The ayanamsa is stated",
      "Sidereal longitudes use Lahiri (Chitrapaksha) and the exact value for the date is printed, so you can tell at a glance why a boundary may differ from another panchang.",
    ],
    [
      "Real ending times",
      "Tithi, nakshatra, yoga and karana ending instants are found by solving for the angle, so kshaya (skipped) and vriddhi (repeated) tithis appear naturally.",
    ],
    [
      "Honest gaps",
      "On the days when the Moon genuinely has no rise or no set, the tool says so. Quantities that cannot be derived from astronomy are not displayed at all.",
    ],
    [
      "Offline and private",
      "The city list and the whole calculation ship with the page. No geocoding request, no API key, no data leaving your device.",
    ],
  ],
  steps: [
    "Pick the date you want the panchang for.",
    "Choose a city from the built-in list, or switch to manual entry and type a latitude, longitude and UTC offset.",
    "Read the sunrise, sunset and Moon block, then the five limbs — tithi, nakshatra, yoga, karana and vaara — each with the moment it ends.",
    "Scroll on for Rahu Kaal, Yamaganda, Gulika, Abhijit, Brahma Muhurta and the eight day Choghadiya, all measured from that day's sunrise and sunset.",
    "Use Copy result to take the whole panchang as plain text, or Reset to return to today and New Delhi.",
  ],
  faqs: [
    [
      "Which ayanamsa does this panchang use?",
      "Lahiri, also called Chitrapaksha — the ayanamsa adopted by the Indian Calendar Reform Committee and used by the Indian Astronomical Ephemeris. The exact value for the date you pick is printed in the Hindu calendar section. This matters because Raman, Krishnamurti and Fagan-Bradley sit up to roughly a degree away from Lahiri, and a degree of lunar motion is about an hour and forty minutes, so a nakshatra boundary can land in a different part of the day under a different ayanamsa.",
    ],
    [
      "Why does your sunrise differ by a minute from my printed panchang?",
      "Sunrise is defined here as the moment the Sun's upper limb reaches minus fifty arcminutes of geometric altitude, which is thirty-four arcminutes of mean refraction plus the sixteen-arcminute solar semidiameter — the usual convention. Publishers differ on the refraction constant, on whether they correct for the observer's elevation, and on the exact coordinates they assign to a city, and any of those moves the answer by a minute or so. Day length is unaffected by which minute you round to: at an equinox it comes out near twelve hours and seven minutes at Indian latitudes, because refraction lifts the Sun into view before it geometrically rises.",
    ],
    [
      "How is Rahu Kaal calculated?",
      "The period from sunrise to sunset is divided into eight equal parts and one part is taken according to the weekday: the eighth on Sunday, the second on Monday, the seventh on Tuesday, the fifth on Wednesday, the sixth on Thursday, the fourth on Friday and the third on Saturday. Because the parts are cut from the sunrise and sunset computed for your own coordinates, Rahu Kaal here shifts through the year and between cities instead of sitting at a fixed clock time. Yamaganda and Gulika use the same eight parts with their own published weekday indices.",
    ],
    [
      "What exactly is Abhijit Muhurta here?",
      "The daylight period is divided into fifteen equal muhurtas and Abhijit is the eighth, which means it is centred exactly on solar noon and lasts a fifteenth of the day — about forty-eight minutes at an equinox, longer in summer and shorter in winter. Many traditions do not observe Abhijit on a Wednesday, and the page notes that when the date falls on one.",
    ],
    [
      "Why is there no Amrit Kaal, and why do some days show no moonrise?",
      "Amrit Kaal is read off a per-nakshatra table of amrita ghatis that differs between panchang traditions, so there is no single derivation this tool could compute and verify; rather than print a value that might be wrong, it is left out, along with the Sandhya periods and festival lists, which depend on regional convention rather than astronomy. Moonrise is different: it is genuinely computed, and on about one day a month the Moon really does not rise (or does not set) inside a single calendar day, because it comes up roughly fifty minutes later each day. On those days the page says so instead of inventing a time.",
    ],
    [
      "Can I use it for a place that is not in the list?",
      "Yes. Switch to manual entry and type the latitude, longitude and UTC offset. Positive latitude is north, positive longitude is east, and India is UTC+5.5 throughout with no daylight saving. Any coordinates on Earth work; at very high latitudes the Sun can stay above or below the horizon all day, in which case the page says so and omits the eight-part day divisions, which are undefined without a sunrise and a sunset.",
    ],
  ],
};

export default seo;
