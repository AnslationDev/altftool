const seo = {
  title: "Gas Leak Time-to-LEL Calculator & Safety Checklist",
  metaDescription:
    "Model how long an LPG or PNG leak takes to reach the explosive limit in your room and ventilation, with detector placement and shut-down order.",
  steps: [
    "Pick Which gas, then enter Room length, width and Ceiling height (m), Air changes per hour, Leak rate (grams per hour) and Cylinder contents (kg)",
    "The single-zone room balance computes the Time to the lower explosive limit headline, the Steady-state concentration and what a full cylinder would give in this room",
    "Follow the numbered 'If you smell gas, in this order' sequence and the detector placement advice, then press Copy result to save the assessment",
  ],
  intro:
    "A gas leak is only dangerous once the room reaches the fuel's lower explosive limit — 1.9% by volume for a typical LPG blend, 5% for the methane in piped natural gas. This tool applies the standard single-zone room mass balance, C(t) = C_ss × (1 − e^(−ACH·t)), to work out how long a leak of a given size takes to get there in a room of your size and ventilation, and pairs it with the shut-down sequence and detector placement that follow from whether your gas sinks or rises.",
  useCases: [
    "Deciding where to mount a gas detector when you switch a kitchen from LPG cylinders to piped natural gas",
    "Showing a household why a burner knob left open overnight in a closed kitchen is a different problem from one left open with a window ajar",
    "Briefing staff in a canteen or hostel kitchen on the correct order of shut-down actions",
  ],
  benefits: [
    ["Limits, not vibes", "Published LEL and UEL figures, blended with Le Chatelier's rule for cylinder LPG."],
    ["Ventilation modelled properly", "Uses the well-mixed room balance, so an open window changes the answer the way it does in reality."],
    ["Order matters", "Response steps are sequenced — valve before ventilation, no switches at any point."],
  ],
  faqs: [
    [
      "Is LPG heavier or lighter than air?",
      "LPG is heavier — a butane/propane blend has a vapour density around 1.9 times that of air, so it sinks, pools at floor level and flows into basements, drains and lift pits. Piped natural gas is methane at about 0.55 times air density and does the opposite, rising to the ceiling. That is why an LPG detector mounts near the floor and a PNG detector near the ceiling.",
    ],
    [
      "What should I do first if I smell gas?",
      "Do not touch any electrical switch, then shut the regulator knob and the cylinder or meter valve. Switch contacts arc when they move, so turning a light off is as much an ignition source as turning it on. After the valve is closed, open doors and windows, get everyone out, and call the emergency line from outside — in India that is 1906, which covers both LPG and piped gas.",
    ],
    [
      "At what concentration does LPG become explosive?",
      "Commercial LPG is flammable between roughly 1.9% and 8.8% by volume in air, and propane and butane individually span 2.1–9.5% and 1.8–8.4%. Below the lower figure the mixture is too lean to ignite and above the upper one it is too rich, though a rich room is still dangerous because the mixture passes through the flammable band at every doorway and window.",
    ],
    [
      "How do I check for a gas leak at home safely?",
      "Brush soapy water over the regulator, hose and joints and watch for bubbles — never use a flame or a lighter. Also check the hose for cracks, stickiness or a past replacement date, commonly two years for a plain rubber tube and five for a reinforced type. If the smell is strong or you can hear hissing, do not test anything: shut the valve, leave, and call the supplier.",
    ],
  ],
};

export default seo;
