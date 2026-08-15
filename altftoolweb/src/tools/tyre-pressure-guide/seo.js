const seo = {
  title: "Tyre Pressure Guide: Cold psi, bar and kPa",
  metaDescription:
    "Cold tyre pressure by vehicle class and load in psi, bar and kPa, with the drop to expect on a cold morning and a check against sidewall MAX PRESS.",
  steps: [
    "Choose Vehicle type and 'How is it loaded?', then enter Temperature when you inflate (°C), Coldest ambient before your next check (°C) and the Sidewall MAX PRESS (psi, optional).",
    "Tick 'Sustained high-speed run planned' to apply the high-speed adder, or type Your placard front and Your placard rear in psi to override the class defaults.",
    "Read the cold front / rear psi headline with bar and kPa, the load and high-speed adders, the gauge reading at your coldest temperature, drift per 10 °C fall, the warm-tyre reading and the space-saver spare, then press Copy result.",
  ],
  intro:
    "This guide converts a vehicle class, load and ambient temperature into a recommended cold tyre inflation pressure in psi, bar and kPa. Cold means the tyre has been parked at least three hours or driven under about three kilometres — the state every placard and every tyre standard (ETRTO, TRA, JATMA) refers to. Temperature drift is computed from Gay-Lussac's law on absolute pressure, so you can see how far the gauge will fall on a cold morning and whether the load adders would breach the MAX PRESS figure moulded on your sidewall.",
  useCases: [
    "Setting pressures before a loaded highway run with five passengers and a full boot, where the rear axle needs more than the solo figure.",
    "Working out why the gauge reads 4 psi low on a winter morning after the tyres were filled on a hot afternoon.",
    "Checking that a load or high-speed adder still sits under the MAX PRESS number stamped on the tyre sidewall.",
  ],
  benefits: [
    ["Cold pressure, stated properly", "Every figure is a cold inflation pressure in psi, bar and kPa, so it matches your placard and any workshop gauge."],
    ["Temperature drift, not guesswork", "Drift uses the absolute-pressure gas law rather than the rough 1 psi per 10 °F rule of thumb."],
    ["Sidewall limit enforced", "Enter the MAX PRESS figure and load adders are capped at it instead of pushing you past the tyre's rating."],
  ],
  faqs: [
    [
      "What is the correct tyre pressure for my car?",
      "The figure on your vehicle's placard — the sticker in the driver's door jamb, on the fuel flap or in the glovebox — is the only correct answer, and it is a cold pressure. Mainstream hatchbacks and sedans usually sit between 30 and 34 psi (about 2.1-2.3 bar), compact SUVs 31-35 psi, and loaded full-size SUVs and pickups run higher at the rear. The MAX PRESS number on the tyre sidewall is the tyre's structural ceiling, not a recommendation.",
    ],
    [
      "Should I inflate tyres hot or cold?",
      "Always cold. A tyre warmed by normal driving reads roughly 4 psi above its cold value, so bleeding air out of a hot tyre to hit the placard number leaves you around 4 psi under-inflated once it cools. If you can only reach a pump after a drive, set it about 4 psi above the placard figure and re-check the next morning.",
    ],
    [
      "How much does tyre pressure drop in cold weather?",
      "About 1 psi for every 10 °F (roughly 1.6-1.8 psi per 10 °C) drop in ambient temperature, because absolute pressure falls in proportion to absolute temperature. A tyre set to 33 psi on a 35 °C afternoon reads about 28 psi on a 5 °C morning — a real 14% under-inflation, not a faulty gauge.",
    ],
    [
      "Do I need to add pressure when the car is fully loaded?",
      "Yes, and mostly at the rear. Manufacturer placards with a full-load column typically add 0.2-0.3 bar (about 3-4 psi) to the loaded axle, and many European manuals ask for a further 0.2 bar before sustained high-speed running. Follow your own placard's load column where one exists; this guide's adders are typical values, not a substitute for it.",
    ],
  ],
};

export default seo;
