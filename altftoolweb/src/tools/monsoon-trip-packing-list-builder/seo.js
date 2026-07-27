const seo = {
  intro:
    "This builder sizes a monsoon packing list from the two things that actually decide it: how long fabric takes to dry at the local humidity, and how hard it rains. Drying time is modelled as reference-hours divided by (1 − RH/100), so at 88% humidity everything takes roughly eight times longer than it would in dry air — and if a garment cannot dry within one overnight window, the laundry credit is withdrawn and you pack for the full trip. Rain gear steps up with the India Meteorological Department 24-hour rainfall bands, from light rain at 2.5-15.5 mm through moderate at 15.6-64.4 mm to heavy at 64.5-115.5 mm.",
  useCases: [
    "Check whether washing shirts halfway through a Kerala or Konkan trip is realistic at 90% humidity.",
    "Decide if a forecast of 80 mm a day calls for over-trousers and a second pair of shoes, not just an umbrella.",
    "Plan a Himalayan monsoon trek where wet footwear will not dry between walking days.",
  ],
  benefits: [
    ["Laundry maths, not optimism", "Withdraws the wash-mid-trip assumption when the humidity makes it impossible."],
    ["Gear tied to the IMD scale", "Shell, over-trousers and a second pair of shoes switch on at the published rainfall thresholds."],
    ["Covers the wet-weather aftermath", "Antifungal powder, purification tablets and day-biting mosquito cover, which generic lists miss."],
  ],
  faqs: [
    [
      "How long do clothes take to dry in monsoon humidity?",
      "Roughly the dry-air time divided by (1 − RH/100): at 88% humidity that is about eight times longer, so a quick-dry top needing 45 minutes in dry air takes over six hours, and cotton takes nearly seventeen. Once a garment passes about twelve hours it cannot dry overnight, which is why washing mid-trip stops helping.",
    ],
    [
      "What counts as heavy rain?",
      "The India Meteorological Department classifies a 24-hour total of 15.6-64.4 mm as moderate, 64.5-115.5 mm as heavy, 115.6-204.4 mm as very heavy and 204.5 mm or more as extremely heavy. From the moderate band upward an umbrella stops being enough on its own; from heavy upward, plan on shoes that will still be wet the next morning.",
    ],
    [
      "What should I wear in the monsoon?",
      "Synthetic or merino quick-dry layers, full-length quick-dry trousers, and sandals or water shoes for walking around town — no denim and no cotton socks. Keep one complete set of clothes sealed in a dry bag that never gets worn outdoors, so there is always something dry to change into.",
    ],
    [
      "Is monsoon travel a health risk?",
      "There are two well-known seasonal risks worth planning for: mosquito-borne illness such as dengue and chikungunya, whose mosquitoes bite during the day and breed in the standing water rain leaves behind, and waterborne illness when drains and supply lines flood. Repellent, covered skin at dusk and treated drinking water cover most of it — see a doctor about vaccines or prophylaxis for your specific destination.",
    ],
  ],
};

export default seo;
