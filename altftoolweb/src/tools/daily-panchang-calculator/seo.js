const seo = {
  intro:
    "A Panchang is the Hindu almanac's five limbs — Tithi, Nakshatra, Yoga, Karana and Vaar — and this calculator derives all five for any date from the sidereal (nirayana) longitudes of the Sun and Moon, after subtracting an ayanamsha correction of roughly 24 degrees. Enter a date and a latitude/longitude (it opens on Delhi, 28.61 N 77.21 E) and it also reports the Moon and Sun Rashi, the Hindu month, the Saka year, sunrise and sunset, and the day's Abhijit, Brahma, Rahu Kaal, Yamaganda and Gulik windows. It is for anyone checking a day before fixing a puja, a housewarming or a travel date, and for students learning how the almanac is actually derived.",
  useCases: [
    "Checking which Tithi and Nakshatra fall on a wedding or griha pravesh date your family has proposed, before you agree to it",
    "Finding the Abhijit Muhurta window on the morning you plan to sign papers or start a new venture, and seeing when Rahu Kaal falls that day",
    "Looking up the Nakshatra and its pada for a birth date so you know the Moon Rashi and the nakshatra lord to discuss with an astrologer",
  ],
  benefits: [
    ["The five limbs, each with its working", "Tithi shows the paksha and how far through it you are, and Nakshatra shows pada, gana and presiding deity."],
    ["Your coordinates, not a fixed city", "Sunrise and sunset are solved for the latitude and longitude you type, and every muhurta window is derived from that day length."],
    ["Any date from 1900 to 2100", "Julian Day conversion plus quick presets for the seven days either side of today, so you can compare dates side by side."],
  ],
  faqs: [
    [
      "How is Tithi calculated?",
      "Tithi is the angular distance from the Sun to the Moon divided by 12 degrees, giving 30 tithis per lunar month — the first 15 form Shukla Paksha (waxing) and the next 15 Krishna Paksha (waning). The tool also shows the percentage of the current tithi already elapsed, since a tithi is not tied to a calendar day and can be roughly 19 to 26 hours long.",
    ],
    [
      "What are Nakshatra padas and how are they found?",
      "The zodiac is split into 27 nakshatras of 13 degrees 20 minutes each, and each nakshatra into 4 padas of 3 degrees 20 minutes, so the Moon's sidereal longitude fixes both. Alongside the pada the tool names the nakshatra's deity and gana, which are the details usually asked for in naming and matching.",
    ],
    [
      "How are Rahu Kaal and Abhijit Muhurta worked out?",
      "The interval from sunrise to sunset is divided into eight equal parts, and Rahu Kaal, Yamaganda and Gulik Kaal are each one of those parts. Abhijit is the eighth of the day centred on local noon, about 48 minutes long when the day is 12 hours. Because these are proportional to day length, they shift through the year and with your latitude.",
    ],
    [
      "How accurate is it, and can I plan a ceremony from it?",
      "Times are approximate to within a couple of minutes because the Sun and Moon positions use truncated series and a linear ayanamsha rather than a full ephemeris. Treat it as an informational reference for understanding a date; for a wedding, naming or other ceremony, confirm with your family's panchangam or a practising astrologer, who will also apply regional conventions this tool does not.",
    ],
  ],
};

export default seo;
