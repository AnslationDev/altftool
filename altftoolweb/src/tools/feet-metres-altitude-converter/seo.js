const seo = {
  intro:
    "This converter changes an altitude between feet and metres at the exact rate of 1 foot = 0.3048 m, then reports the air pressure, effective oxygen and altitude band that go with it. Pressure comes from the International Standard Atmosphere (ISO 2533) using the troposphere formula p = p₀(1 − Lh/T₀)^(gM/RL) below 11 km and the isothermal formula above it, and effective oxygen is 20.95% scaled by the pressure ratio. It is built for trekkers reading a permit in metres, pilots and passengers reading a cabin altitude in feet, and anyone who wants to know what the thin air actually means.",
  useCases: [
    "Converting an Everest trek itinerary quoted in metres into the feet your altimeter watch shows.",
    "Checking how much oxygen is left at a 4,000 m pass before planning a hard day's walking.",
    "Understanding why water will not boil properly at a high-altitude campsite.",
  ],
  benefits: [
    ["Exact foot definition", "0.3048 m exactly, so summit and flight-level figures match official ones."],
    ["Physics, not folklore", "Standard-atmosphere pressure and Clausius-Clapeyron boiling point rather than rules of thumb."],
    ["Altitude band shown", "Places the number in the moderate, high, very high or extreme band used in trekking guidance."],
  ],
  faqs: [
    [
      "How many metres is 1 foot?",
      "Exactly 0.3048 m, and one metre is about 3.2808 feet. The value is definitional under the 1959 international yard and pound agreement, so mountain heights convert without any rounding error.",
    ],
    [
      "How much oxygen is there at 5,000 metres?",
      "Air is still 20.95% oxygen, but the pressure is about half of sea level, so the oxygen available to you is equivalent to roughly 11% at sea level. At Everest Base Camp (5,364 m) the standard atmosphere gives about 51% of sea-level pressure; on the summit at 8,849 m it is close to a third.",
    ],
    [
      "What altitude is a plane cabin pressurised to?",
      "FAA rule 14 CFR 25.841 caps cabin pressure altitude at 8,000 ft (2,438 m) at the aircraft's maximum operating altitude, and most modern jets hold 6,000 to 8,000 ft. That is about 75% of sea-level pressure, or an effective oxygen level near 15.6%, which is why long flights leave people tired and dehydrated.",
    ],
    [
      "At what altitude does altitude sickness start?",
      "Acute mountain sickness becomes common above about 2,500 m, though susceptible people can feel it lower. Standard guidance above 3,000 m is to raise your sleeping altitude by no more than roughly 500 m a day with a rest day every third or fourth day, and to descend if symptoms worsen. This is general information — talk to a travel-medicine clinician before a high-altitude trip, particularly if you have heart or lung conditions.",
    ],
  ],
};

export default seo;
