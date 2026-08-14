const seo = {
  title: "Voltage Drop Calculator: Minimum Wire Size in mm²",
  metaDescription:
    "Uses R = p x k x L / A with 0.0175 copper, 0.0282 aluminium and k of 2 or root-3, then back-solves the minimum mm² that meets your 3% drop target.",
  steps: [
    "Choose Circuit — \"DC / single-phase 2-wire\" or \"Balanced three-phase\" — and Conductor: Copper or Aluminium.",
    "Enter Nominal voltage (V), Current (A), One-way length (m), Conductor area (mm²) and Target maximum drop (%), or load the \"230 V copper\" example.",
    "Read the volt drop with its percentage and the row \"Minimum area for target (resistance only)\" in mm², then use Copy or Download.",
  ],
  intro:
    "The Voltage Drop & Wire Gauge Calculator works out how many volts a cable run loses under load, using R = ρ × k × L / A with a resistivity of 0.0175 Ω·mm²/m for copper and 0.0282 for aluminium, a path factor k of 2 for DC and single-phase two-wire circuits and √3 for balanced three-phase, then drop = I × R. It is for electricians, solar and battery installers, and anyone running a long cable who needs to know whether the far end still sees usable voltage. Alongside the drop in volts and percent, it back-solves the minimum conductor area that would meet your target percentage.",
  useCases: [
    "You are feeding a workshop 30 m from the consumer unit at 230 V and 20 A and want to know whether 4 mm² copper keeps you inside a 3% drop before you buy the cable.",
    "You are wiring a 12 V solar array to a charge controller and the loss matters far more at low voltage, so you check whether the run needs the next size up.",
    "You have been quoted aluminium instead of copper on a long submain and want to see how much extra cross-section the higher resistivity costs you for the same drop target.",
  ],
  benefits: [
    ["Solves the gauge, not just the drop", "It reports the minimum conductor area in mm² that would hit your target percentage, so you get the answer you actually need when specifying cable."],
    ["Correct path factor per circuit type", "Two-wire runs are multiplied by 2 for the return path and balanced three-phase by √3, rather than applying one blanket factor to both."],
    ["Copper and aluminium side by side", "Switching conductor material swaps in the correct resistivity, so the roughly 60% higher resistance of aluminium shows up in the result immediately."],
  ],
  faqs: [
    [
      "What is an acceptable voltage drop?",
      "3% for a branch circuit is the usual working target and is the default here, with around 5% commonly treated as the ceiling for the whole run from supply to load. These are the values used in common practice; check the specific figure your local wiring code or client specification requires, because it is not identical everywhere.",
    ],
    [
      "What resistivity values does it use?",
      "0.0175 Ω·mm²/m for copper and 0.0282 Ω·mm²/m for aluminium, which are room-temperature values. Conductor resistance rises with temperature, so a cable running hot in an insulated wall will drop slightly more than the calculated figure.",
    ],
    [
      "Do I enter the one-way length or the total loop length?",
      "One-way length — the distance from source to load. The calculator applies the return path itself, multiplying by 2 for DC and single-phase two-wire circuits and by √3 for balanced three-phase.",
    ],
    [
      "Can I use this to size a cable on its own?",
      "No. This is a resistance-only estimate and does not consider ampacity, insulation temperature rating, grouping and derating, fault current, motor starting current, reactance or terminal ratings. Voltage drop is one of several checks — have the final design confirmed by a qualified electrician against your local code.",
    ],
  ],
};

export default seo;
