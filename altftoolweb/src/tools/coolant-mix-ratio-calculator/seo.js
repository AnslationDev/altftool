const seo = {
  title: "Coolant Mix Ratio Calculator: Litres, Freeze & Boil",
  metaDescription:
    "Exact coolant and distilled water litres for your system capacity and target glycol %, with the freeze point and the boil point under cap pressure.",
  steps: [
    "Enter 'Cooling system capacity (litres)' and your 'Target glycol concentration (% by volume)'.",
    "Pick the Coolant chemistry — ethylene glycol or propylene glycol — and 'What is in the bottle': 'Concentrate (undiluted, mix with water)' or 'Ready-to-use 50:50 premix'. Then set 'Radiator cap rating (bar)' and 'Concentration already in the system (%)'.",
    "Read 'Coolant to pour in' in litres, with the distilled water litres and the resulting ratio underneath, then 'Freeze point of the mix', 'Boil point with no cap pressure', 'Extra headroom from the cap' and 'Boil point with the cap on'. 'Copy result' copies the figures.",
  ],
  intro:
    "The Coolant Mix Ratio Calculator converts a cooling-system capacity and a target glycol percentage into exact litres of coolant and distilled water, then reads the resulting freeze point and boil point off the published glycol/water property curves. It also adds the boiling headroom your radiator cap contributes, calculated from the water saturation temperature at the raised pressure. Use it when refilling after a flush, when moving a car to a colder region, or when checking whether an existing mix is strong enough.",
  useCases: [
    "Refilling a 6 litre cooling system after a radiator flush and needing the exact concentrate and water split",
    "Checking whether a 33% mix is still safe before parking a car through a hill-station winter",
    "Deciding how many litres to drain from an over-diluted system to bring it back to 50%",
  ],
  benefits: [
    ["Real property curves", "Freeze and boil points are interpolated from the published glycol/water tables, not guessed."],
    ["Cap pressure included", "Shows the extra boiling headroom the radiator cap gives, calculated from saturation temperature."],
    ["Premix aware", "Handles both undiluted concentrate and ready-to-use 50:50 premix, and flags impossible targets."],
  ],
  faqs: [
    [
      "What is the correct coolant to water ratio?",
      "A 50:50 mix by volume is the normal specification: it freezes at about -37 °C and boils at about 108 °C before the cap is considered. Manufacturers generally allow anywhere from 33% to 60% glycol, but not below 33%, because the corrosion inhibitor package is then too dilute to protect aluminium and gaskets.",
    ],
    [
      "Can I use 100% coolant without water?",
      "No — neat ethylene glycol is worse in both directions. Freeze protection peaks near 68% glycol and then reverses, so pure concentrate freezes at only about -13 °C, and undiluted glycol carries heat away much more slowly than a mix, so the engine actually runs hotter.",
    ],
    [
      "Should I use tap water to mix coolant?",
      "Use distilled or deionised water. The calcium and magnesium in tap water form scale on the hottest surfaces inside the head and radiator, and the dissolved chlorides accelerate corrosion, which is exactly what the inhibitor package is there to prevent.",
    ],
    [
      "How much does a radiator cap raise the boiling point?",
      "A 1.1 bar (about 16 psi) cap raises the boiling point by roughly 22 °C, which takes a 50:50 mix from about 108 °C to around 130 °C. This is why a failed or wrongly rated cap shows up as boiling over even when the coolant itself is fine.",
    ],
  ],
};

export default seo;
