const seo = {
  intro:
    "Rashi Finder matches your date of birth against the twelve zodiac date ranges — Mesha 21 March to 19 April, Vrishabh 20 April to 20 May, and so on through Meen — and returns the rashi name in Sanskrit and English along with its element, keyword traits, a lucky number from 1 to 60, a lucky colour and time, and a partner compatibility score. Everything is derived from the birth date itself, so the same date always returns the same profile. It is written for entertainment and cultural curiosity, not for prediction or decision-making.",
  useCases: [
    "Someone asks your rashi at a family gathering and you only know your Western star sign, so you enter your birth date and get both names together — Singh (Leo), Kanya (Virgo) and the rest.",
    "You are filling in a birth chart form or a matrimonial profile that asks for a rashi and want the sign name spelled the way the form expects.",
    "You and a partner or friend compare birth dates for fun and want a compatibility number with a stated reason — sharing an element scores far higher than not.",
  ],
  benefits: [
    ["Sanskrit and English names side by side", "Each result gives both, so you can answer whether you are Vrishchik or Scorpio without cross-referencing a chart."],
    ["Stable, repeatable results", "The lucky number, colour and personality traits come from your birth date itself, so the same date always produces the same profile rather than a fresh random one each visit."],
    ["Compatibility with a visible rule", "The score is built on whether two signs share an element — Fire, Earth, Air or Water — instead of an unexplained number."],
  ],
  faqs: [
    [
      "Which dates belong to which rashi?",
      "The twelve ranges run Mesha 21 Mar to 19 Apr, Vrishabh 20 Apr to 20 May, Mithun 21 May to 20 Jun, Karka 21 Jun to 22 Jul, Singh 23 Jul to 22 Aug, Kanya 23 Aug to 22 Sep, Tula 23 Sep to 22 Oct, Vrishchik 23 Oct to 21 Nov, Dhanu 22 Nov to 21 Dec, Makar 22 Dec to 19 Jan, Kumbh 20 Jan to 18 Feb and Meen 19 Feb to 20 Mar.",
    ],
    [
      "Why is this different from the rashi my panchang or astrologer gives?",
      "Because they are calculated differently. This tool uses the tropical sun-sign date ranges above, while traditional Vedic practice usually means chandra rashi — the Moon's sidereal position at the exact time and place of birth — which needs your birth time and location and commonly lands on a different sign. For a janma kundali, consult a practitioner.",
    ],
    [
      "How is the compatibility score calculated?",
      "Two birth dates start at a base of 60 and gain 30 points if both rashis share the same element, giving 90 for a Fire-Fire or Water-Water pairing; different elements add a smaller amount derived from the two dates, landing in the 60s or low 70s. It is a rule of thumb for fun, not a Guna Milan or Ashtakoota matching.",
    ],
    [
      "What are the elements and which signs belong to them?",
      "Four, three signs each: Fire is Mesha, Singh and Dhanu; Earth is Vrishabh, Kanya and Makar; Air is Mithun, Tula and Kumbh; Water is Karka, Vrishchik and Meen. The element drives the trait summary and the compatibility score.",
    ],
  ],
};

export default seo;
