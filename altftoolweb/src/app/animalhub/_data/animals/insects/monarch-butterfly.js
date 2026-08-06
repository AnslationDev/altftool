// Monarch butterfly — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const monarchButterfly = {
  slug: "monarch-butterfly",
  category: "insects",
  name: "Monarch Butterfly",
  scientificName: "Danaus plexippus",
  otherNames: ["Wanderer", "Common tiger"],

  summary:
    "An insect that migrates thousands of kilometres to a forest it has never seen, guided by an inherited sun compass, and makes itself poisonous by eating milkweed.",

  heroImage: {
    src: "https://images.unsplash.com/photo-1534198601173-4de3342a0b62?auto=format&fit=crop&w=1600&q=80",
    alt: "A monarch butterfly feeding on a coneflower, orange wings veined in black",
    credit: "Erin Minuskin / Unsplash",
  },
  gallery: [],

  headline: "A migration no single butterfly completes",
  intro: [
    "Each autumn, monarchs across eastern North America fly south to a few small groves of oyamel fir in the mountains of central Mexico — up to 4,000 kilometres, to a location none of them has ever visited. The butterflies that arrive are the great-grandchildren of those that left the previous spring.",
    "How the route is inherited rather than learned is one of the more remarkable problems in animal navigation. The answer involves a sun compass in the antennae, corrected for the time of day by an internal clock, with a magnetic sense as backup when the sun is obscured.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Arthropoda",
    class: "Insecta",
    order: "Lepidoptera",
    family: "Nymphalidae",
    genus: "Danaus",
    species: "Danaus plexippus",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2024,
    populationTrend: "decreasing",
    populationEstimate:
      "The eastern North American population has declined by roughly 80% over recent decades; the western population by well over 95%",
    note: "The species as a whole is widespread and not at risk — the assessment applies to the migratory North American subspecies, Danaus plexippus plexippus. It was listed as Endangered in 2022 and reassessed as Vulnerable in 2024 after revised analysis, though the underlying decline is not disputed.",
  },

  measurements: [
    {
      key: "wingspan",
      label: "Wingspan",
      value: "8.9–10.2 cm",
      min: 8.9,
      max: 10.2,
      unit: "cm",
    },
    {
      key: "weight",
      label: "Weight",
      value: "About 0.5 g",
      min: 0.25,
      max: 0.75,
      unit: "g",
    },
    {
      key: "migration-distance",
      label: "Migration distance",
      value: "Up to 4,000 km",
      min: 3000,
      max: 4000,
      unit: "km",
    },
    {
      key: "flight-speed",
      label: "Flight speed",
      value: "Around 8–20 km/h",
      min: 8,
      max: 20,
      unit: "km/h",
      note: "Monarchs conserve energy by soaring on thermals during migration",
    },
    {
      key: "lifespan-summer",
      label: "Lifespan (summer generations)",
      value: "2–6 weeks",
      min: 2,
      max: 6,
      unit: "weeks",
    },
    {
      key: "lifespan-migratory",
      label: "Lifespan (migratory generation)",
      value: "8–9 months",
      min: 8,
      max: 9,
      unit: "months",
    },
    {
      key: "eggs-laid",
      label: "Eggs laid per female",
      value: "300–500",
      min: 300,
      max: 500,
      unit: "eggs",
    },
  ],

  traits: [
    { key: "diet-larva", label: "Larval diet", value: "Milkweed leaves only", icon: "Leaf" },
    { key: "diet-adult", label: "Adult diet", value: "Nectar from a wide range of flowers", icon: "Flower" },
    { key: "defence", label: "Defence", value: "Toxic to predators; warning coloration", icon: "ShieldAlert" },
    { key: "navigation", label: "Navigation", value: "Time-compensated sun compass", icon: "Compass" },
  ],

  highlights: ["wingspan", "migration-distance", "lifespan-migratory", "defence"],

  distribution: {
    continents: ["North America", "South America", "Australia", "Europe"],
    regions: [
      "Eastern and central North America",
      "Western North America",
      "Overwintering sites in Michoacán and México State, Mexico",
      "Coastal California",
      "Introduced populations in Australia, New Zealand and Iberia",
    ],
    habitats: [
      "Meadow and prairie",
      "Roadside and field margin",
      "Gardens",
      "Oyamel fir forest (overwintering)",
    ],
    elevation: "Sea level to around 3,600 m at the Mexican overwintering sites",
    note: "The eastern population overwinters in a small cluster of high-altitude fir groves in central Mexico. The western population winters along the California coast in eucalyptus, pine and cypress.",
  },

  sections: [
    {
      id: "migration",
      title: "The multi-generation migration",
      body: [
        "Monarchs that emerge in late summer are physiologically different from those born earlier in the year. Shorter days and cooler temperatures trigger a state called reproductive diapause: development of the reproductive organs is suspended, and instead of breeding within weeks and dying, these butterflies live for eight or nine months.",
        "This generation flies south, sometimes covering more than a hundred kilometres in a day by riding thermals, and clusters in the Mexican fir groves from November through February. In spring the same individuals begin flying north, breed in northern Mexico and the southern United States, and die.",
        "Their offspring continue north. It takes three or four successive generations, each living only a few weeks, to reach the northern limits of the range by summer — and then a new long-lived generation is produced and the cycle repeats. No individual completes the full circuit.",
      ],
    },
    {
      id: "navigation",
      title: "How they find the way",
      body: [
        "The primary mechanism is a sun compass. Monarchs read the sun's position for direction, but because the sun moves across the sky, that reading is useless without knowing the time — so it is corrected by a circadian clock located in the antennae. Experiments in which antennae were painted to block light disrupted the butterflies' orientation while leaving them otherwise able to fly.",
        "When cloud obscures the sun, monarchs fall back on a light-dependent magnetic compass, using inclination — the angle of Earth's magnetic field relative to the surface — rather than polarity.",
        "None of this is learned. The butterflies arriving in Mexico are several generations removed from any that made the journey before, so the entire navigational system must be inherited.",
      ],
    },
    {
      id: "milkweed",
      title: "Milkweed and chemical defence",
      body: [
        "Monarch caterpillars eat the leaves of milkweed and nothing else. Milkweed sap contains cardenolides, toxins that disrupt the sodium-potassium pump essential to animal cells. Monarchs carry mutations in that pump which make them largely insensitive, so they store the toxins in their own tissue instead of being harmed by them.",
        "The result is a caterpillar and adult butterfly that are poisonous to most vertebrate predators. A bird that eats one typically vomits and learns to avoid the pattern — which is why the bold orange and black is advertising rather than camouflage. The viceroy butterfly's close resemblance to the monarch is a well-known case of mimicry.",
        "The dependency is absolute: no milkweed means no monarchs. That single fact explains most of what has happened to the population.",
      ],
    },
    {
      id: "decline",
      title: "Decline and conservation",
      body: [
        "The eastern population, measured by the area of forest the overwintering clusters occupy, has fallen by roughly 80% from its 1990s levels. The western population, which winters in coastal California, has done far worse — down by well over 95%, dropping below 2,000 butterflies in the 2020-21 count before a partial recovery.",
        "The primary cause is loss of milkweed across the agricultural Midwest, largely following the adoption of herbicide-tolerant crops that allowed the systematic clearing of milkweed from and around fields. Habitat loss at the Mexican overwintering sites through illegal logging, pesticide use, and climate disruption of migration timing all compound it.",
        "Conservation efforts focus on restoring milkweed and nectar corridors along the migratory route — roadside plantings, farm margins and gardens — and on protecting the Monarch Butterfly Biosphere Reserve in Mexico, a UNESCO World Heritage site. Because so much potential habitat is in private hands, this is one of the few large-scale conservation problems where individual gardens genuinely contribute.",
      ],
    },
  ],

  related: [],
  tags: ["butterfly", "migration", "pollinator", "north america", "milkweed", "lepidoptera"],
  searchTerms: ["danaus plexippus", "monarch migration", "milkweed butterfly", "wanderer butterfly"],

  faqs: [
    {
      q: "How do monarch butterflies know where to migrate if they have never been there?",
      a: "The route is inherited, not learned. Monarchs use a sun compass corrected for time of day by a circadian clock in their antennae, with a light-dependent magnetic compass as backup when the sun is hidden. The butterflies reaching Mexico are several generations removed from those that made the previous journey, so none of them can be following experience.",
    },
    {
      q: "Why does the monarch migration take several generations?",
      a: "The southward flight is made by a single long-lived generation that enters reproductive diapause and survives eight to nine months. The northward return is completed in stages: that generation breeds and dies in the southern United States, and it takes three or four successive short-lived generations to reach the northern range by summer.",
    },
    {
      q: "Why do monarch caterpillars only eat milkweed?",
      a: "Milkweed contains cardenolide toxins that most insects cannot tolerate. Monarchs carry mutations that make them largely insensitive, so they can eat it safely and store the toxins in their own bodies — which makes them poisonous to predators. The trade-off is total dependence: without milkweed there are no monarchs.",
    },
    {
      q: "Are monarch butterflies endangered?",
      a: "The migratory North American subspecies is threatened, though the species worldwide is not. It was listed as Endangered by the IUCN in 2022 and reassessed as Vulnerable in 2024 following revised analysis. The eastern population has declined by around 80% and the western population by well over 95%.",
    },
    {
      q: "Does planting milkweed actually help monarchs?",
      a: "Yes, provided it is a species native to your region. Loss of milkweed across the agricultural Midwest is the main driver of the decline, and because much of the potential habitat is on private land, gardens, roadsides and field margins make a measurable difference. Nectar plants that flower in late summer also help fuel the southward migration.",
    },
  ],

  seo: {
    title: "Monarch Butterfly — Migration, Milkweed & Conservation",
    description:
      "A researched profile of the monarch butterfly (Danaus plexippus): the multi-generation 4,000 km migration, its inherited sun compass, milkweed dependence and chemical defence, and its decline.",
    keywords: [
      "monarch butterfly facts",
      "danaus plexippus",
      "monarch migration",
      "milkweed",
      "monarch butterfly endangered",
    ],
  },

  sources: [
    {
      label: "Danaus plexippus plexippus — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/194052138/238378185",
    },
    {
      label: "Monarch butterfly conservation",
      publisher: "Xerces Society for Invertebrate Conservation",
      url: "https://www.xerces.org/monarchs",
    },
    {
      label: "Monarch Butterfly Biosphere Reserve",
      publisher: "UNESCO World Heritage Centre",
      url: "https://whc.unesco.org/en/list/1290/",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default monarchButterfly;
