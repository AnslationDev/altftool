const seo = {
  title: "Kaal Sarp Dosha Checker: Sidereal Planet Positions",
  metaDescription:
    "Tests whether all seven grahas fall in the 180° Rahu-Ketu arc, names the type from Rahu's sign, and lists each planet's sidereal longitude and rashi.",
  intro:
    "The Kaal Sarp Dosha Checker computes sidereal positions for the Sun, Moon, Mars, Mercury, Venus, Jupiter and Saturn on a given birth date and reports whether all seven fall inside the 180-degree arc running from Rahu forward to Ketu — the condition Vedic astrology calls Kaal Sarp Dosha. When the condition is met it names the type from Rahu's sign, one of the twelve from Anant through Sheshnag. It is for anyone who has been told they have this yoga and wants to see the planetary longitudes the claim rests on rather than take it on trust.",
  useCases: [
    "An astrologer told you that you have Kaal Sarp Dosha and you want to see, planet by planet, which ones actually sit inside the Rahu-Ketu arc.",
    "You are comparing readings from two different sources that disagree about whether the yoga is present, and you want the underlying longitudes to settle it.",
    "You want to check a family member's chart for the same condition and see which of the twelve named types the Rahu position corresponds to.",
  ],
  benefits: [
    ["Shows the working, not just a verdict", "Every planet is listed with its sidereal longitude, its rashi, its degree within that sign and its angular distance from Rahu."],
    ["Names the type from Rahu's sign", "A positive result is classified as Anant, Kulik, Vasuki, Shankhpal, Padmak, Mahapadmak, Takshak, Karkotak, Shankhchood, Ghatak, Vishdhar or Sheshnag."],
    ["Partial cases are visible", "Because each planet is flagged individually, you can see when six of seven fall in the arc — the near-miss that different astrologers read differently."],
  ],
  faqs: [
    [
      "What exactly makes a chart Kaal Sarp Dosha?",
      "All seven classical grahas — Sun, Moon, Mars, Mercury, Venus, Jupiter and Saturn — must lie within the 180-degree half of the zodiac that runs from Rahu to Ketu. If even one planet sits on the other side of the Rahu-Ketu axis, the full yoga is not formed.",
    ],
    [
      "Do I need my birth time and place?",
      "Birth time refines the result and is used here; birth place is not. Time matters most for the Moon, which moves roughly 13 degrees a day, so a chart where the Moon sits near the Rahu or Ketu point can flip with a few hours' difference — noon is assumed when you leave the time blank.",
    ],
    [
      "Are the positions tropical or sidereal?",
      "Sidereal, as Vedic astrology requires: tropical longitudes are computed first, then an ayanamsha correction is subtracted before the signs and the Rahu-Ketu test are applied. Rahu is taken as the Moon's mean north node, with Ketu exactly 180 degrees opposite.",
    ],
    [
      "Is this a substitute for a full chart reading?",
      "No — it tests one specific condition and is informational only. Traditional interpretation weighs the ascendant, house placements, dashas and planetary strength alongside this yoga, so consult a qualified astrologer before drawing conclusions or acting on a result.",
    ],
  ],
};

export default seo;
