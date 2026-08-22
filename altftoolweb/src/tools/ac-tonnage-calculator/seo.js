const seo = {
  title: "AC Tonnage Calculator: Real BTU Heat Load",
  metaDescription:
    "Size a room AC by adding real heat load — 34 BTU/sq ft, 600 per person, 165 per sq ft of sunlit glass — then compare 3, 4 and 5 star running costs.",
  intro:
    "This calculator sizes a room air conditioner by adding up the actual heat load in BTU rather than applying a rule of thumb: floor area at 34 BTU per sq ft scaled by ceiling height, 600 BTU per person, 165 BTU per sq ft of sunlit glass (55 if shaded), 150 BTU per window for leakage, appliance watts at 3.412 BTU each, plus 28 BTU per sq ft if you are on the top floor. The subtotal is multiplied by a climate factor for your city — 1.15 hot and humid, 1.10 hot and dry, 1.05 composite, 0.92 moderate — then divided by 12,000 BTU to give tons and rounded up to the nearest standard size. It then estimates the monthly running cost at 3, 4 and 5 star for both inverter and fixed-speed units.",
  useCases: [
    "You are buying for a top-floor 12x12 bedroom in Delhi and want to know whether the 1.5 ton everyone recommends is actually right for a west-facing room under a sun-baked slab",
    "A dealer is pushing a 2 ton unit for a small Bengaluru study and you want an itemised load breakdown to argue for something smaller",
    "You are choosing between a 3-star and a 5-star inverter and want the monthly bill difference at your own tariff and running hours before deciding",
  ],
  benefits: [
    ["Itemised load, not a square-foot shortcut", "Every contribution — fabric, people, glass, leakage, appliances, roof, orientation, insulation — is listed in BTU so you can see what is driving the size."],
    ["Climate and construction are separate inputs", "City climate zone, top floor, west-facing wall and insulation quality each apply their own factor, which is why the same room needs different units in Mumbai and Pune."],
    ["Sizing and running cost together", "The same load feeds an ISEER-based bill estimate for 3, 4 and 5 star inverter and fixed-speed units, so capacity and operating cost are decided in one pass."],
  ],
  faqs: [
    [
      "What size AC do I need for a 12x12 room?",
      "A 144 sq ft room with average construction usually lands between 1 and 1.5 ton, but the deciding factors are the extras: a top-floor slab adds about 28 BTU per sq ft, direct sun on 15 sq ft of glass adds around 2,500 BTU, and a hot-humid city multiplies the whole load by 1.15. The same room can need 1 ton in Bengaluru and 1.5 ton in Delhi's top floor.",
    ],
    [
      "Is a bigger AC always better?",
      "No — oversizing hurts comfort. An oversized unit cools the air quickly, hits the setpoint and shuts off before it has removed much moisture, so the room feels cold and clammy, and a fixed-speed compressor short-cycles, which wastes power and wears it out. Sizing to the calculated load is what gives both temperature and humidity control.",
    ],
    [
      "Does a top floor or a west-facing wall really change the tonnage?",
      "Yes, and often by a whole step. A directly sunlit roof adds about 28 BTU per sq ft of floor area, so a 144 sq ft top-floor room picks up roughly 4,000 extra BTU — a third of a ton — and a west-facing wall adds around 8% of the fabric load for the afternoon peak.",
    ],
    [
      "How is the monthly running cost worked out?",
      "Cooling capacity in watts is divided by the unit's ISEER to get the electrical draw, then multiplied by your daily hours, 30 days and your tariff. Inverter models are assumed at roughly 3.7, 4.2 and 4.8 ISEER for 3, 4 and 5 star and fixed-speed at about 3.2 to 3.6, so an inverter's advantage grows the longer you run it. Check the ISEER printed on the model you are buying, since BEE revises the star bands periodically.",
    ],
  ],
};

export default seo;
