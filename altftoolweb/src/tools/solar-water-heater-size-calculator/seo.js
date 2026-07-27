const seo = {
  intro:
    "A solar water heater size calculator converts a household's real hot water usage into the litres-per-day (LPD) rating to buy. Systems are rated at roughly 60 °C storage while people bathe at about 40 °C, so the tool applies the mixing equation — stored litres = used litres × (bath temp − inlet temp) ÷ (storage temp − inlet temp) — and then sizes collector area against the MNRE benchmark of about 2 m² of flat plate collector per 100 LPD. Thermal output uses Q = m·c·ΔT with water's specific heat of 4.186 kJ/kg·K.",
  useCases: [
    "Deciding between a 100 LPD and a 200 LPD system for a family of four before a dealer upsells you",
    "Estimating how much of the winter geyser bill a solar heater will actually remove",
    "Checking the roof area a collector plus tank stand will occupy alongside a planned solar PV array",
    "Working out payback years on a quoted installed price net of subsidy",
  ],
  benefits: [
    ["Sized on the mixing equation", "Accounts for the cold water you blend in, which is why 100 LPD serves far more than 100 litres of bathing."],
    ["Collector area and roof footprint", "Uses the 50 LPD per m² flat plate and 60 LPD per m² evacuated tube benchmarks."],
    ["Honest about the backup", "Reports the kWh the electric element will still burn on cloudy days rather than promising 100% solar."],
  ],
  faqs: [
    [
      "Which solar water heater size is best for a family of 4?",
      "A 100 LPD system covers most families of four. Four short showers of about 45 litres each at 40 °C is 180 litres of blended water, which needs only about 77 litres stored at 60 °C once 25 °C mains water is mixed in. Step up to 150–200 LPD if the household takes long or rain showers, or if the inlet water is very cold in winter.",
    ],
    [
      "How much roof area does a solar water heater need?",
      "About 2 m² of collector per 100 LPD for a flat plate system, or roughly 1.7 m² for an evacuated tube system, plus around 60% more for the tilt frame, tank stand and service access. A 200 LPD flat plate installation therefore wants about 6.4 m² of clear, unshaded roof.",
    ],
    [
      "How much electricity does a solar water heater save?",
      "A 100 LPD system heating water from 25 °C to 60 °C delivers roughly 3.1 kWh of heat a day. At a 70% solar fraction and a 90% efficient geyser it displaces about 890 kWh a year — near ₹7,000 at a ₹8 per unit tariff. Savings rise sharply where mains water is colder, because the temperature lift is larger.",
    ],
    [
      "FPC or ETC — which solar water heater should I buy?",
      "Choose a flat plate collector if your water is hard or the site sees hail, since the copper absorber tolerates scale and impact far better. Evacuated tube collectors cost less and perform better on cold mornings, but the glass tubes scale up and crack more readily. A local installer who knows your water hardness is the right person to confirm the choice.",
    ],
  ],
};

export default seo;
