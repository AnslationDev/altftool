const seo = {
  title: "Manglik Dosha Checker: Mars House From Your Moon",
  metaDescription:
    "Computes sidereal Moon and Mars longitudes from your birth date and time, then reports the house Mars occupies from the Moon and the severity.",
  steps: [
    "Under Your Birth Details, enter your Name and your birth Day, Month and Year.",
    "Add Birth Time (optional, 24h IST); leave it blank and the calculation uses 12:00 noon IST.",
    "Press Check Manglik Dosha to see your Moon rashi and nakshatra, Mars from Moon as a house number, and the severity.",
  ],
  intro:
    "Manglik Dosha Checker works out whether Mars falls in one of the six Manglik houses counted from the Moon — the 1st, 2nd, 4th, 7th, 8th or 12th — by computing sidereal longitudes for the Moon and Mars from your birth date and time and taking the sign offset between them. It reports your Moon rashi and nakshatra, the rashi and degree Mars occupies, which house it sits in from the Moon, and a severity label, with the 7th house treated as the most serious. Everything runs in your browser and is offered as information about a traditional Vedic astrology rule, not as guidance on whom to marry.",
  useCases: [
    "Being told during a marriage discussion that you are Manglik and wanting to see for yourself which house Mars actually falls in from your Moon before the family astrologer meets.",
    "Comparing two birth charts in a match-making conversation, since the tradition holds that when both partners are Manglik the dosha is considered cancelled.",
    "Simply wanting to know your Moon rashi and birth nakshatra, which are shown alongside the Manglik result whether or not the dosha applies.",
  ],
  benefits: [
    [
      "Positions computed, not looked up in a table",
      "Sidereal Moon and Mars longitudes are calculated from your birth date and time and converted to rashi and degree, so the house count is derived rather than approximated.",
    ],
    [
      "Says which house and how serious",
      "You get the specific Manglik house Mars falls in with its severity rating, instead of a bare yes or no.",
    ],
    [
      "Birth details never leave the page",
      "The whole calculation runs in your browser, so your date and time of birth are not sent to a server.",
    ],
  ],
  faqs: [
    [
      "Which houses make a person Manglik?",
      "The 1st, 2nd, 4th, 7th, 8th and 12th — if Mars occupies any of those six houses, the chart is read as Manglik. This checker counts them from the Moon sign (Chandra kundli), and treats Mars in the 7th, the house of marriage, as the most severe placement.",
    ],
    [
      "Do I need my exact birth time?",
      "It helps but is not required — leave it blank and the calculation uses 12:00 noon IST. Because the Moon moves roughly 13 degrees a day, it changes rashi about every two and a quarter days, so an unknown time can shift the house count when the Moon is near a sign boundary.",
    ],
    [
      "What if both partners are Manglik?",
      "In the traditional reading the two doshas are held to cancel each other, which is why a Manglik-Manglik match is the remedy most often cited. Other customary remedies include Kumbh Vivah, a Mangal Shanti puja, Tuesday fasting and chanting the Mars mantra 108 times.",
    ],
    [
      "Is a Manglik result something to worry about?",
      "No — this is a traditional astrological classification, not a prediction, and it carries no evidence about how a marriage will actually go. Treat the result as cultural information; if it matters to your family, discuss it with an astrologer they trust, and take decisions about a relationship on their own terms.",
    ],
  ],
};

export default seo;
