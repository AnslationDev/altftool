const seo = {
  title: "Fire Extinguisher Selector: Right Agent + NFPA",
  metaDescription:
    "Pick the agent for a kitchen, garage or server room, see the ones that make it worse, and get NFPA 10 counts, A/B ratings and travel distances.",
  steps: [
    "Choose What are you protecting? — Home kitchen, Commercial kitchen or canteen, Living room, bedroom or hallway, office and other spaces.",
    "Enter Floor area (sq ft) and set Hazard level to Light, Ordinary or Extra, ticking the box if flammable liquids are stored or used there.",
    "Read the Buy this first agent and suggested size, the agents to avoid, and the NFPA 10 extinguisher count, A and B ratings and max travel distances, then Copy result.",
  ],
  intro:
    "This selector matches an extinguishing agent to the fire class a space actually presents, then works out coverage from NFPA 10. Class letters differ by standard, so both are used: A for ordinary combustibles, B for flammable liquids, C for gases in EN 2 or energised electrical equipment in NFPA 10, D for combustible metals, and F or K for cooking oils. Coverage follows NFPA 10's limits — a maximum of 11,250 sq ft per Class A extinguisher, one unit of A rating per 3,000, 1,500 or 1,000 sq ft depending on hazard level, a maximum 75 ft travel distance to a Class A unit and 30 ft to a Class B one.",
  useCases: [
    "Choosing between CO2, powder and wet chemical for a specific room instead of buying whatever is on the shelf",
    "Working out how many extinguishers a workshop or storeroom of a given floor area needs",
    "Checking that the agent already mounted in a kitchen or server room is not the wrong one for the risk",
  ],
  benefits: [
    ["Names the wrong answers too", "Every risk lists the agents that make it worse, with the reason — water on oil, CO2 on a fryer, powder over electronics."],
    ["Coverage from a real standard", "Counts and ratings come from NFPA 10's area and travel-distance rules, not a rule of thumb."],
    ["Honest about lithium-ion", "Says plainly that no portable extinguisher reliably stops a cell in thermal runaway, and that Class D powder is not the answer."],
  ],
  faqs: [
    [
      "Which fire extinguisher should I keep in my kitchen?",
      "A fire blanket first, and a wet chemical extinguisher if you deep fry. Wet chemical is the only portable agent that reliably handles burning cooking oil: it turns the hot oil into a soap crust that seals the surface. Never use water, foam or CO2 on a pan of oil — water flashes to steam and throws burning oil across the room, and a CO2 blast splashes it.",
    ],
    [
      "What is the difference between ABC powder and CO2 extinguishers?",
      "ABC powder is rated for solids, flammable liquids, gases and live electrical equipment, which makes it the most versatile single unit — but the discharge is blinding in a small room and the residue is corrosive to electronics. CO2 is rated only for flammable liquids and live equipment, has no Class A rating, and leaves no residue, which is why it is the standard choice near servers and switchgear. Neither is right for cooking oil.",
    ],
    [
      "How many fire extinguishers do I need for my building?",
      "Under NFPA 10 one Class A extinguisher covers at most 11,250 sq ft, and the total A rating required is one unit of A per 3,000 sq ft for light hazard, 1,500 for ordinary and 1,000 for extra hazard, with a minimum of 2-A per unit (4-A for extra hazard). Travel distance is the binding constraint in practice: nobody should have to walk more than 75 ft to reach a Class A extinguisher, or 30 ft where flammable liquids are handled.",
    ],
    [
      "What extinguisher works on a lithium-ion battery fire?",
      "None reliably, once a cell is in thermal runaway — the cell generates its own oxygen and heat, so smothering does not stop it. The practical response is large volumes of water to cool the surrounding cells and slow propagation, plus evacuation and a call to the fire service. Class D powder is for burning metals such as magnesium and sodium and is not the correct agent for lithium-ion. Prevention matters more here than equipment: charge on a hard surface, away from the escape route, and never overnight in a hallway.",
    ],
  ],
};

export default seo;
