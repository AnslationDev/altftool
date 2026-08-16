const seo = {
  title: "PSI to Bar Converter + Hot Tyre Pressure Rise",
  metaDescription:
    "Converts pressure between psi, bar, kPa, kgf/cm2, atm and torr with exact factors, and projects a cold tyre reading to its hot value by gas law.",
  steps: [
    "Type a Pressure reading and pick its Unit — psi, bar, kPa, kgf/cm2, atm, Pa, MPa or torr — or tap a preset chip such as 32 psi or 2.2 bar.",
    "Enter Temperature when measured (°C) and Temperature to project to (°C) to apply the cold-to-hot tyre correction.",
    "Read the In bar headline and every unit's value below it, plus the projected hot reading and change in psi; Copy result copies the conversion.",
  ],
  intro:
    "This converter restates a pressure reading in psi, bar, kPa, kgf/cm2 and atm by anchoring every unit to the pascal: 1 psi is exactly 6,894.757293 Pa, 1 bar is exactly 100,000 Pa and 1 kgf/cm2 is exactly 98,066.5 Pa. It also applies Gay-Lussac's law to absolute pressure and temperature, so you can see what a cold 32 psi tyre will read once it heats up on the road. Useful for anyone reading a European bar-marked placard at an Indian air pump calibrated in psi.",
  useCases: [
    "Translate a European car's 2.2 bar placard into the psi your local air pump displays.",
    "Read a workshop gauge marked in kgf/cm2 when the manual quotes kPa.",
    "Check whether a tyre reading 35 psi after a highway run was actually set correctly when cold.",
  ],
  benefits: [
    ["Exact factors", "Uses the defined values (6,894.757293 Pa per psi, 98,066.5 Pa per kgf/cm2), not rounded shortcuts."],
    ["Temperature honest", "Converts cold to hot pressure with the gas law rather than the approximate 1 psi per 10 °F rule."],
    ["Every common unit", "psi, bar, kPa, MPa, kgf/cm2, atm and torr in one list, plus absolute pressure."],
  ],
  faqs: [
    [
      "How many psi is 1 bar?",
      "1 bar is 14.5038 psi. Going the other way, 1 psi is 0.0689476 bar, so a 32 psi tyre is 2.206 bar and a 2.2 bar placard is about 31.9 psi.",
    ],
    [
      "Is kgf/cm2 the same as bar?",
      "Almost, but not exactly. 1 kgf/cm2 is 98,066.5 Pa while 1 bar is 100,000 Pa, so kgf/cm2 is about 1.9% smaller — 1 bar equals 1.0197 kgf/cm2. Many Indian air pumps are labelled in psi but some older gauges read in kgf/cm2, sometimes just written as \"kg\".",
    ],
    [
      "Why does tyre pressure go up after driving?",
      "The air heats up and, since the tyre's volume barely changes, absolute pressure rises in proportion to absolute temperature. A tyre set to 32 psi at 25 °C reads about 35.1 psi once the air inside reaches 45 °C. That is why pressure should be set cold and hot readings should never be bled down.",
    ],
    [
      "Should I use the pressure on the tyre sidewall?",
      "No. The number moulded on the sidewall is the maximum the tyre is rated for, not the recommended setting. Use the vehicle placard on the driver door sill, fuel flap or glovebox, which is matched to the car's weight and load rating.",
    ],
  ],
};

export default seo;
