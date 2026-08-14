const seo = {
  title: "Star Life Cycle Explorer: 0.1 to 40 Solar Masses",
  metaDescription:
    "Set initial mass from 0.1 to 40 solar masses; the track branches at 8. Six stages with temperature, radius, luminosity, lifetime and fusion process.",
  steps: [
    "Drag the Initial Solar Mass slider between 0.1 and 40, and the Evolutionary Branch label flips at 8 solar masses.",
    "Step through the Evolutionary Stage buttons, from Stellar Nebula and Protostar to White Dwarf or Neutron Star / Black Hole.",
    "Read Surface Temp, Radius, Luminosity and Lifetime for that stage, plus the Core Fusion Stage caption on the canvas.",
  ],
  intro:
    "The Star Life Cycle Explorer is an interactive stellar evolution model: set a star's initial mass anywhere from 0.1 to 40 solar masses and it follows the corresponding six-stage evolutionary track, with 8 solar masses as the branch point between the low-mass path and the high-mass path. Each stage shows surface temperature, radius, luminosity, the fusion process running at that point and how long it lasts, drawn live on a canvas so a red giant at 100 R☉ and a white dwarf at 0.01 R☉ are visibly different objects. It is written for students and teachers covering stellar evolution, hydrostatic equilibrium and nucleosynthesis.",
  useCases: [
    "You are revising for an astronomy exam and need to be able to state, in order, what happens to a one-solar-mass star from nebula to white dwarf and why it never reaches a supernova.",
    "A class has just been told that mass decides a star's fate, and you want to drag the slider past 8 solar masses so they see the track itself change rather than reading two separate diagrams.",
    "You are checking whether a specific star ends as a white dwarf, a neutron star or a black hole, and want the fusion sequence and remnant type for that mass in one place.",
  ],
  benefits: [
    ["Mass drives the whole track", "The slider does not just relabel a diagram — crossing 8 solar masses swaps in an entirely different sequence, ending in core collapse instead of a planetary nebula."],
    ["Physics values on every stage", "Temperature, radius, luminosity, lifetime and the specific fusion process are listed per stage, so you can see luminosity climb from 1 L☉ on the main sequence to 500,000 L☉ as a red supergiant."],
    ["Visual scale, not just text", "Each stage is rendered on canvas — a diffuse nebula, a compact degenerate remnant, a supernova shock front — which makes the thousand-fold size changes concrete."],
  ],
  faqs: [
    [
      "How massive does a star have to be to go supernova?",
      "Roughly 8 solar masses, which is the threshold this explorer uses to switch between its two evolutionary tracks. Below it a star ends by shedding a planetary nebula and leaving a white dwarf; above it the core fuses successively heavier elements up to iron, at which point fusion stops releasing energy and the core collapses.",
    ],
    [
      "What is the main sequence and why do stars spend so long on it?",
      "The main sequence is the long stable phase where a star fuses hydrogen into helium and outward radiation pressure exactly balances inward gravity — hydrostatic equilibrium. Stars spend about 90% of their lives in it: around 10 billion years for a one-solar-mass star like the Sun at 5,800 K, but only about 10 million years for a hot O-type star, because greater mass burns fuel disproportionately faster.",
    ],
    [
      "Why does fusion stop at iron?",
      "Because iron has the highest binding energy per nucleon, so fusing it consumes energy instead of releasing it. Once a massive star builds an iron core, there is nothing left to hold the core up against gravity, and the collapse and rebound is what drives a Type II supernova — elements heavier than iron are made in that explosion by rapid neutron capture.",
    ],
    [
      "What is the difference between a white dwarf, a neutron star and a black hole?",
      "All three are stellar remnants held up by different things, or by nothing. A white dwarf is an Earth-sized core about 0.01 R☉ supported by electron degeneracy pressure; a neutron star packs a stellar core into roughly 20 km supported by neutron degeneracy pressure; a black hole forms when even that fails and collapse continues past an event horizon.",
    ],
  ],
};

export default seo;
