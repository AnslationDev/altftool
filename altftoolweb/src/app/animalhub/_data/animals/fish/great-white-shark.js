// Great white shark — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const greatWhiteShark = {
  slug: "great-white-shark",
  category: "fish",
  name: "Great White Shark",
  scientificName: "Carcharodon carcharias",
  otherNames: ["White shark", "White pointer"],

  summary:
    "The largest predatory fish in the ocean, warm-blooded enough to hunt in cold water and able to detect the faint electrical fields given off by living muscle.",

  heroImage: {
    src: "https://images.unsplash.com/photo-1704694214588-24f4bae4757b?auto=format&fit=crop&w=1600&q=80",
    alt: "A great white shark swimming in open blue water, countershading visible",
    credit: "Gerald Schömbs / Unsplash",
  },
  gallery: [
    {
      src: "https://images.unsplash.com/photo-1637380781238-9b703b0d2db0?auto=format&fit=crop&w=1400&q=80",
      alt: "A great white shark turning towards the camera below the surface",
      credit: "Chase Baker / Unsplash",
      title: "Built for the ambush",
      caption:
        "The countershaded body — dark above, white below — is what makes the vertical attack work. Seen from above the shark disappears against the seabed; seen from below it dissolves into the bright surface.",
    },
  ],

  headline: "A warm-blooded fish in cold water",
  intro: [
    "The great white is the largest predatory fish alive, reaching around six metres and over a tonne. It is also one of the few fish that keeps its body warmer than the water around it, which lets it hunt actively in seas cold enough to slow most other fish down.",
    "Almost everything the public believes about the species comes from a single film. The reality is a long-lived, slow-breeding, highly mobile animal that crosses ocean basins, and one whose numbers have fallen far enough that it is assessed as Vulnerable.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Chondrichthyes",
    order: "Lamniformes",
    family: "Lamnidae",
    genus: "Carcharodon",
    species: "Carcharodon carcharias",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2018,
    populationTrend: "decreasing",
    populationEstimate: "No reliable global figure; regional populations number in the hundreds to low thousands",
    note: "Late maturity, long gestation and small litters make the species slow to recover from losses. Protected in South Africa, Australia, the United States, New Zealand and elsewhere, and listed on CITES Appendix II.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "4–6 m",
      min: 4,
      max: 6,
      unit: "m",
      note: "Females grow larger than males; reliable records approach 6.1 m",
    },
    {
      key: "weight",
      label: "Weight",
      value: "680–1,100 kg",
      min: 680,
      max: 1100,
      unit: "kg",
      note: "Large females have been recorded well above 1,500 kg",
    },
    {
      key: "swimming-speed",
      label: "Burst swimming speed",
      value: "Around 40 km/h",
      min: 35,
      max: 40,
      unit: "km/h",
      note: "Cruising speed is far lower — closer to 3 km/h on long migrations",
    },
    {
      key: "bite-force",
      label: "Bite force",
      value: "Estimated around 4,000 PSI",
      min: 4000,
      max: 4000,
      unit: "PSI",
      note: "Derived from computer modelling of the jaw, never directly measured in a living shark",
    },
    {
      key: "dive-depth",
      label: "Maximum dive depth",
      value: "Beyond 1,200 m",
      min: 1200,
      max: 1200,
      unit: "m",
      note: "Recorded by satellite tags during open-ocean migrations",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "About 26 years (males), 33 years (females)",
      min: 26,
      max: 33,
      unit: "years",
      note: "Established by bomb-radiocarbon dating of vertebrae; the late age is why the species recovers so slowly",
    },
    {
      key: "body-temperature",
      label: "Body temperature above water",
      value: "Up to 10–15 °C warmer than the surrounding sea",
      min: 10,
      max: 15,
      unit: "°C",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "Around 12–18 months",
      min: 12,
      max: 18,
      unit: "months",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "2–10 pups",
      min: 2,
      max: 10,
      unit: "pups",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Up to about 70 years",
      min: 50,
      max: 70,
      unit: "years",
      note: "Radiocarbon dating of vertebrae revised earlier estimates sharply upward",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — seals, fish and carrion", icon: "Fish" },
    { key: "thermoregulation", label: "Thermoregulation", value: "Regional endothermy", icon: "Thermometer" },
    { key: "reproduction", label: "Reproduction", value: "Live-bearing; embryos develop without a placenta", icon: "Egg" },
    { key: "movement", label: "Movement", value: "Long-distance ocean migrations", icon: "Navigation" },
    { key: "water-type", label: "Water type", value: "Saltwater", icon: "Droplet" },
    { key: "schooling-behaviour", label: "Schooling", value: "Largely solitary; gathers loosely at seal colonies and carcasses", icon: "Users" },
    { key: "ocean-range", label: "Ocean range", value: "Temperate and subtropical coastal waters worldwide", icon: "Globe" },
  ],

  highlights: ["length", "weight", "body-temperature", "lifespan"],

  distribution: {
    continents: ["Africa", "Asia", "Australia", "Europe", "North America", "South America"],
    regions: [
      "California and Mexico's Pacific coast",
      "South Africa",
      "Southern and eastern Australia",
      "New Zealand",
      "Mediterranean Sea",
      "Northeast United States",
    ],
    habitats: ["Coastal shelf waters", "Offshore open ocean", "Seal colonies"],
    elevation: "Surface waters to depths beyond 1,000 m",
    note: "Prefers temperate coastal waters between about 12 and 24 °C, but individuals cross entire ocean basins. Tagged sharks have travelled from South Africa to Australia and back, and Pacific animals gather seasonally in an open-ocean area between Baja California and Hawaii known as the White Shark Café.",
  },

  sections: [
    {
      id: "warm-blooded",
      title: "A partly warm-blooded fish",
      body: [
        "Most fish are the temperature of the water they swim in. The great white is not. It uses a countercurrent heat exchanger called the rete mirabile — a dense network in which warm blood leaving the swimming muscles passes alongside cold blood arriving from the gills, transferring heat inward rather than losing it to the sea.",
        "The result is a core temperature that can run 10 to 15 °C above the surrounding water. Warm muscle contracts faster and recovers quicker, and a warm stomach digests more efficiently, so the shark can hunt with speed and power in cold seas where a fully cold-blooded predator would be sluggish. This trait, shared with mako and salmon sharks and with tuna, is what makes the temperate coasts of California, South Africa and southern Australia viable hunting grounds.",
      ],
    },
    {
      id: "senses",
      title: "Senses and hunting",
      body: [
        "Great whites carry the full sensory toolkit of a shark plus one that has no equivalent in land animals. Small jelly-filled pores across the snout, the ampullae of Lorenzini, detect the minute electrical fields produced by muscle contraction — sensitive enough to find a fish that is hidden but alive. A lateral line runs the length of the body, reading pressure changes and movement in the water.",
        "Smell is acute, and the shark can determine direction from the tiny difference in arrival time between its two nostrils. Vision is good and adapted to low light, and the eye rolls back protectively at the moment of impact.",
        "Against seals, the attack is a vertical ambush: the shark approaches from deep below, where its dark dorsal surface is invisible against the seabed, and accelerates upward. The strike is often powerful enough to carry both animals clear of the surface — the breaching behaviour associated with False Bay in South Africa.",
      ],
    },
    {
      id: "diet",
      title: "Diet across a lifetime",
      body: [
        "Diet changes as the shark grows. Juveniles feed mainly on fish and rays, whose skeletons their jaws and teeth can handle. As they pass roughly three metres, both jaw structure and tooth shape shift, and marine mammals — seals, sea lions and dolphins — become a major part of the diet.",
        "Whale carcasses are an important and underappreciated food source. A dead whale supplies an enormous quantity of energy-dense blubber, and multiple large sharks will feed on one in a loose hierarchy, with the biggest individuals taking priority.",
        "Attacks on humans are rare, and most are single bites rather than sustained predation. The common interpretation is that people are not recognised as normal prey and are usually released after an exploratory bite — which offers little comfort given the size of the animal, but does explain why the great majority of encounters are survived.",
      ],
    },
    {
      id: "reproduction",
      title: "Reproduction and growth",
      body: [
        "Great whites bear live young, but without a placenta: embryos develop inside the female and are nourished by eating unfertilised eggs, a strategy known as oophagy. Gestation is thought to last somewhere between twelve and eighteen months, producing a small litter of two to ten well-developed pups, each already over a metre long and independent at birth.",
        "Growth to maturity is slow — the bomb-radiocarbon vertebral ageing that revised the lifespan upward also put males at roughly 26 years and females later still, at around 33 — and the same work showed individuals living to about 70 years, far longer than researchers once assumed.",
        "That combination is the species' central conservation problem. An animal that matures late, breeds infrequently and produces few young cannot replace losses quickly, so a population reduced by fishing may take generations to recover even after the pressure stops.",
      ],
    },
    {
      id: "threats",
      title: "Threats and conservation",
      body: [
        "The main pressures are bycatch in commercial fisheries, targeted fishing for fins, jaws and teeth, and beach protection programmes that use nets and drumlines. Declining prey and habitat degradation add to it.",
        "The species is now legally protected in South Africa — the first country to do so, in 1991 — as well as Australia, the United States, New Zealand and elsewhere, and international trade is regulated under CITES Appendix II. Some regional populations have shown signs of stabilising under protection, notably off the northeast United States and parts of California.",
        "Satellite tagging has transformed what is known about the species over the past two decades, revealing trans-oceanic migrations and offshore aggregation areas that were entirely unsuspected, and that knowledge is what makes meaningful protection possible.",
      ],
    },
  ],

  related: ["axolotl"],
  tags: ["shark", "apex predator", "marine", "cartilaginous fish", "vulnerable"],
  searchTerms: ["carcharodon", "white shark", "white pointer", "jaws", "man eater"],

  faqs: [
    {
      q: "Are great white sharks warm-blooded?",
      a: "Partly. They use regional endothermy: a countercurrent heat exchanger called the rete mirabile keeps the swimming muscles, stomach and brain 10 to 15 °C warmer than the surrounding water. This is why they can hunt effectively in cold temperate seas, though they are not fully warm-blooded in the way a mammal is.",
    },
    {
      q: "How long do great white sharks live?",
      a: "Up to about 70 years. This was only established relatively recently — radiocarbon dating of growth bands in their vertebrae showed the species lives far longer than earlier estimates of 20 to 30 years suggested, and matures very late: around 26 years in males and roughly 33 in females.",
    },
    {
      q: "How do great white sharks find prey?",
      a: "With several senses at once. The ampullae of Lorenzini, jelly-filled pores on the snout, detect the faint electrical fields produced by contracting muscle. A lateral line senses movement and pressure changes in the water, smell is highly directional, and their vision is well adapted to low light.",
    },
    {
      q: "Why do great white sharks attack humans?",
      a: "Rarely, and usually not as predation. Most incidents involve a single exploratory bite after which the shark leaves, which suggests people are not recognised as normal prey. Their actual diet is seals, sea lions, fish and whale carcasses.",
    },
    {
      q: "Why are great white sharks vulnerable to extinction?",
      a: "Because of how slowly they reproduce. Females do not mature until around 33 years of age, gestation lasts over a year, and litters are small. When adults are removed by fishing or bycatch, the population cannot replace them quickly — recovery takes generations even where protection is in place.",
    },
  ],

  seo: {
    title: "Great White Shark — Size, Senses, Diet & Conservation",
    description:
      "A researched profile of the great white shark (Carcharodon carcharias): regional endothermy, electroreception, hunting behaviour, 70-year lifespan, ocean migrations and Vulnerable status.",
    keywords: [
      "great white shark facts",
      "carcharodon carcharias",
      "white shark",
      "shark senses",
      "great white shark size",
    ],
  },

  sources: [
    {
      label: "Carcharodon carcharias — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/3855/212629880",
    },
    {
      label: "White shark research and tracking",
      publisher: "Monterey Bay Aquarium",
      url: "https://www.montereybayaquarium.org/animals/animals-a-to-z/white-shark",
    },
    {
      label: "White shark species profile",
      publisher: "NOAA Fisheries",
      url: "https://www.fisheries.noaa.gov/species/white-shark",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default greatWhiteShark;
