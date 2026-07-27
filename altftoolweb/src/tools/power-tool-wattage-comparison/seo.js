const seo = {
  intro:
    "Compares the running and starting power of common corded tools and applies the two-test sizing rule that decides whether a generator or inverter can run them: total running watts must fit the continuous rating, and the total with the biggest machine starting must fit the surge rating. Starting surge is set by motor type — around 5× running for an induction motor, whose locked rotor current is 5 to 6 times full load, and about 2× for a brushed universal motor. Generator output is derated 3% per 300 m of altitude and 1% per 5.6 °C above 25 °C.",
  useCases: [
    "Deciding whether a 3.5 kVA site generator will start a 254 mm table saw, or only the hand tools",
    "Sizing a battery inverter for a day of cordless charging, lighting and an occasional grinder",
    "Working out why a generator that runs a 2 kW heat gun happily stalls on a 1.5 kW compressor",
  ],
  benefits: [
    ["Surge, not just running", "Sizes on the start, which is what actually trips the breaker."],
    ["Power factor included", "Shows apparent power in VA and real current in amps, not just watts."],
    ["Altitude and heat derating", "A generator at 1,500 m and 35 °C delivers about 83% of its plate rating."],
  ],
  faqs: [
    [
      "How many watts does a circular saw use?",
      "A 185 mm corded circular saw typically draws about 1,400 W running and roughly 2,800 W for the instant it starts, because its universal motor pulls around twice running current on inrush. That means a 2 kW generator will run one but may stumble on the start, while a 3 kW one has real margin.",
    ],
    [
      "What size generator do I need for power tools?",
      "Size it on the largest starting surge, not the sum of the labels. Take the total running watts, subtract the biggest tool, add that tool's starting surge, and choose a generator whose peak rating exceeds the result — then check the continuous rating covers the running total. An induction-motor table saw at 1,800 W needs about 9,000 W of surge capability on its own.",
    ],
    [
      "Why does my generator handle a heater but not a compressor?",
      "Because a heater is resistive and has no inrush, while a compressor's induction motor demands five times its running power for the first second. A 2,000 W heat gun asks for exactly 2,000 W from the moment it switches on; a 1,500 W compressor asks for around 7,500 W at start, which is what stalls the engine.",
    ],
    [
      "How long will a battery inverter run a power tool?",
      "Runtime in hours equals amp-hours × battery volts × usable depth of discharge × inverter efficiency, divided by the load in watts. A 100 Ah lead-acid battery at 12 V gives about 528 Wh usable at 50% depth and 88% efficiency, which is roughly 35 minutes of a 900 W angle grinder. The same bank in lithium iron phosphate gives nearly twice that, because 80% of it is usable.",
    ],
  ],
};

export default seo;
