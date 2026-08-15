const seo = {
  title: "Kundli Matching: Guna Milan Score Out of 36 +",
  metaDescription:
    "Match two birth charts on all eight Ashta Koota categories out of 36 gunas, with Moon nakshatra from sidereal longitudes and a Manglik check.",
  steps: [
    "Fill Person 1 (Boy) and Person 2 (Girl) with Name and the Day, Month and Year of birth.",
    "Add Birth Time (optional, 24h IST) as HH:MM plus the birth Latitude and Longitude, then press Calculate Guna Milan.",
    "Read the guna total out of 36, the Ashta Koota (8 Categories) cards showing points against each maximum, and the Manglik Dosha panel covering both charts.",
  ],
  intro:
    "Kundli Matching (Guna Milan) scores the compatibility of two birth charts on the Ashta Koota system — eight categories worth 36 gunas in total: Varna 1, Vashya 2, Tara 3, Yoni 4, Graha Maitri 5, Gana 6, Bhakoot 7 and Nadi 8. It computes each person's Moon nakshatra, pada and rashi from their birth date and time using sidereal longitudes rather than a lookup table, then checks Mangal (Manglik) Dosha from the position of Mars relative to the Moon sign. The result is a guna total, a percentage and a per-koota breakdown you can read line by line. This is presented for cultural and informational interest, not as a decision to make on someone's behalf.",
  useCases: [
    "A proposal is being discussed in the family and someone has quoted a guna score — you want to see the eight categories separately and find out whether the points were lost on Nadi, Bhakoot or something minor.",
    "You know both birth dates but only roughly remember the birth times, and you want to see how much the nakshatra and the score shift when the time changes.",
    "Someone has been told they are Manglik and you want to check which house Mars actually falls in relative to the Moon, and whether the other chart carries the same dosha.",
  ],
  benefits: [
    ["Real astronomical positions", "Moon, Sun and Mars longitudes are computed from the Julian day and converted to sidereal values, rather than read off a fixed nakshatra table."],
    ["Every koota shown separately", "You see the points scored and the maximum for all eight categories, so a low total can be traced to the exact category that caused it."],
    ["Manglik checked for both charts", "Mars is tested against the 1st, 2nd, 4th, 7th, 8th and 12th houses from the Moon sign for each person, and the result flags whether one or both are affected."],
  ],
  faqs: [
    [
      "How many gunas are needed for marriage?",
      "18 out of 36 is the conventional minimum for a match to be considered acceptable in Guna Milan. Totals of 24 and above are usually described as very good and 30-plus as excellent, while below 18 is treated as low compatibility. These are traditional thresholds, not predictions.",
    ],
    [
      "Which of the eight kootas carries the most weight?",
      "Nadi carries the most at 8 points, followed by Bhakoot at 7 and Gana at 6. Nadi is all-or-nothing — matching nadi between the two charts scores 0 and differing nadi scores the full 8 — which is why an otherwise strong match can lose a large block of points in one category.",
    ],
    [
      "What makes someone Manglik?",
      "A chart is treated as Manglik when Mars occupies the 1st, 2nd, 4th, 7th, 8th or 12th house counted from the Moon sign. The traditional view is that the dosha is considered cancelled when both charts carry it. Interpretations of Manglik Dosha vary widely between regions and astrologers.",
    ],
    [
      "Do I need the exact birth time?",
      "Birth time is optional here and defaults to 12:00 noon IST, but it matters: the Moon moves roughly 13 degrees a day and each nakshatra spans 13 degrees 20 minutes, so the Moon can change nakshatra within a single day. If the time is uncertain, try a couple of values and see whether the nakshatra holds.",
    ],
  ],
};

export default seo;
