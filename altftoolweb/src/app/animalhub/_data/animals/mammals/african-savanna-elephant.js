// African savanna elephant — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const africanSavannaElephant = {
  slug: "african-savanna-elephant",
  category: "mammals",
  name: "African Savanna Elephant",
  scientificName: "Loxodonta africana",
  otherNames: ["African bush elephant", "African elephant"],

  summary:
    "The largest living land animal, with a trunk capable of both uprooting a tree and picking up a single seed, living in memory-driven herds led by the oldest female.",

  heroImage: {
    src: "https://images.unsplash.com/photo-1544211412-2a32426e7fd5?auto=format&fit=crop&w=1600&q=80",
    alt: "An African savanna elephant with broad ears and tusks walking along a track",
    credit: "Zoë Reeve / Unsplash",
  },
  gallery: [
    {
      src: "https://images.unsplash.com/photo-1581852017103-68ac65514cf7?auto=format&fit=crop&w=1400&q=80",
      alt: "An African savanna elephant crossing dry grassland",
      credit: "Wolfgang Hasselmann / Unsplash",
    },
  ],

  headline: "The largest animal that walks on land",
  intro: [
    "An adult male African savanna elephant can stand well over three metres at the shoulder and weigh six tonnes — no land animal alive is larger. Size shapes everything about how the species lives: what it eats, how far it walks, how much water it needs, and how thoroughly it rearranges the landscape around it.",
    "Until 2021 all African elephants were treated as a single species. Genetic and morphological evidence has since separated the savanna elephant from the smaller, darker African forest elephant of the Congo Basin, and the two are now assessed separately.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Proboscidea",
    family: "Elephantidae",
    genus: "Loxodonta",
    species: "Loxodonta africana",
  },

  conservation: {
    status: "EN",
    assessmentYear: 2021,
    populationTrend: "decreasing",
    populationEstimate: "Around 350,000–400,000 savanna elephants; roughly 415,000 African elephants across both species",
    note: "The 2021 assessment split African elephants into two species: the savanna elephant was listed as Endangered and the forest elephant as Critically Endangered. Trends vary sharply by region — some southern African populations are stable or growing while parts of Central and West Africa continue to decline.",
  },

  measurements: [
    {
      key: "shoulder-height",
      label: "Shoulder height",
      value: "2.2–4.0 m",
      min: 2.2,
      max: 4.0,
      unit: "m",
      note: "Bulls are substantially taller than cows",
    },
    {
      key: "weight",
      label: "Weight",
      value: "2,700–6,000 kg",
      min: 2700,
      max: 6000,
      unit: "kg",
      note: "Exceptional bulls have exceeded 10,000 kg",
    },
    {
      key: "trunk-length",
      label: "Trunk length",
      value: "About 2 m",
      min: 2,
      max: 2,
      unit: "m",
      note: "Contains roughly 40,000 muscle units",
    },
    {
      key: "daily-food",
      label: "Daily food intake",
      value: "Up to 150 kg of vegetation",
      min: 100,
      max: 150,
      unit: "kg",
    },
    {
      key: "daily-water",
      label: "Daily water intake",
      value: "Around 150–200 litres",
      min: 150,
      max: 200,
      unit: "litres",
    },
    {
      key: "running-speed",
      label: "Running speed",
      value: "Around 40 km/h",
      min: 35,
      max: 40,
      unit: "km/h",
      note: "A fast walk rather than a true run — elephants always keep at least one foot on the ground",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "10–12 years",
      min: 10,
      max: 12,
      unit: "years",
      note: "Bulls do not usually breed successfully until their late twenties or thirties",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 22 months",
      min: 20,
      max: 22,
      unit: "months",
      note: "The longest gestation of any land mammal",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "60–70 years",
      min: 60,
      max: 70,
      unit: "years",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Herbivore", icon: "Leaf" },
    { key: "social-structure", label: "Social structure", value: "Matriarchal family herds", icon: "Users" },
    { key: "activity", label: "Activity", value: "Active day and night, resting in the hottest hours", icon: "Sun" },
    { key: "ecological-role", label: "Ecological role", value: "Keystone species and ecosystem engineer", icon: "Sprout" },
  ],

  highlights: ["shoulder-height", "weight", "gestation", "social-structure"],

  distribution: {
    continents: ["Africa"],
    regions: [
      "Southern Africa",
      "Eastern Africa",
      "Parts of Central and West Africa",
    ],
    habitats: ["Savanna", "Grassland", "Open woodland", "Semi-desert", "Floodplain"],
    elevation: "Sea level to around 4,500 m on Mount Kilimanjaro's slopes",
    note: "Range is now largely confined to protected areas and the corridors between them. Botswana, Zimbabwe, Tanzania and Kenya hold some of the largest remaining populations.",
  },

  sections: [
    {
      id: "habitat",
      title: "Habitat and range",
      body: [
        "Savanna elephants use open grassland, wooded savanna, floodplains and semi-desert, moving seasonally between feeding areas and reliable water. Herds can cover long distances along traditional routes that older females remember across decades.",
        "That mobility is now the central conservation problem. As farmland and settlement expand, the corridors linking protected areas are closing, leaving populations isolated inside reserves. Where fences confine large numbers of elephants to a small area, the vegetation damage they cause can become severe enough to require active management.",
      ],
    },
    {
      id: "diet",
      title: "Diet and feeding",
      body: [
        "Elephants are bulk feeders, taking grasses, leaves, bark, roots and fruit, and spending a large part of the day and night eating. Their digestion is inefficient — much of what they consume passes through only partly broken down — which is precisely why the volume is so large.",
        "That inefficiency has an ecological upside. Seeds pass through intact and are deposited in dung far from the parent tree, making elephants among the most important long-distance seed dispersers in Africa. Their feeding also opens up woodland into grassland, digs waterholes other animals use in drought, and creates deadwood habitat — the reason they are described as ecosystem engineers.",
      ],
    },
    {
      id: "behavior",
      title: "Behaviour and social life",
      body: [
        "A family herd is a group of related females and their young, led by the oldest and most experienced female. Her memory of where water persists in a drought, or which routes are safe, directly affects whether the herd survives hard years — research in Amboseli found that groups with older matriarchs did better during severe drought.",
        "Adult bulls live apart from the family herds, alone or in loose bachelor groups, joining females mainly to breed. Bulls periodically enter musth, a state of elevated testosterone and heightened aggression.",
        "Much of elephant communication happens below the range of human hearing. Infrasonic calls, some under 20 Hz, travel several kilometres through air and ground, allowing separated groups to coordinate. Elephants also show behaviour towards the bones and bodies of dead herd members that has no clear parallel in most other mammals.",
      ],
    },
    {
      id: "trunk",
      title: "The trunk and tusks",
      body: [
        "The trunk is a fusion of nose and upper lip containing on the order of 40,000 muscle units and no bone. It is strong enough to push over a tree and precise enough to pick up a single seed — African elephants have two opposing finger-like tips at the end, where Asian elephants have one.",
        "It serves as a breathing tube, a hand, a hose for drinking and dust-bathing, a sound amplifier and a chemical sensor. Tusks are elongated upper incisors that grow throughout life and are used for digging, stripping bark, moving obstacles and fighting. Because they are ivory, they are also the reason elephants are poached.",
      ],
    },
    {
      id: "threats",
      title: "Threats and conservation",
      body: [
        "Poaching for ivory drove steep declines through the 2000s and 2010s. International trade in ivory has been banned since 1990, and the closure of domestic markets in China and elsewhere from 2017 was followed by falling prices and reduced poaching in several regions, though the pressure has not disappeared.",
        "Habitat loss and human-elephant conflict are now at least as serious. Elephants that raid crops can destroy a family's harvest in a night, and are killed in response. Approaches that reduce this conflict — beehive fences, early-warning systems, chilli-based deterrents and compensation schemes — have shown real results in Kenya and elsewhere, alongside anti-poaching enforcement and the protection of movement corridors.",
      ],
    },
  ],

  related: ["lion"],
  tags: ["megafauna", "herbivore", "africa", "keystone species", "savanna", "endangered"],
  searchTerms: ["biggest land animal", "loxodonta", "tusks", "ivory", "bush elephant"],

  faqs: [
    {
      q: "How is a savanna elephant different from a forest elephant?",
      a: "They are now recognised as two separate species. The savanna elephant is larger, with outward-curving tusks and broad, fan-shaped ears, and lives in open country. The African forest elephant is smaller and darker, with straighter, downward-pointing tusks and rounder ears, and lives in the rainforests of the Congo Basin. The forest elephant is assessed as Critically Endangered, the savanna elephant as Endangered.",
    },
    {
      q: "Why is elephant gestation so long?",
      a: "At about 22 months it is the longest of any land mammal. A calf is born with a large, complex brain and must be able to stand and follow the herd almost immediately, which requires a great deal of development before birth rather than after it.",
    },
    {
      q: "Do elephants really never forget?",
      a: "The saying overstates it, but the underlying observation is real. Matriarchs retain detailed knowledge of water sources, migration routes and social relationships over decades, and research has shown that herds led by older females cope better with drought — experience that only accumulates with age.",
    },
    {
      q: "How much does an elephant eat in a day?",
      a: "Up to about 150 kg of vegetation, along with 150 to 200 litres of water. Their digestive system extracts only part of the nutrition available, so the sheer volume is what sustains them — and it is why a herd needs such a large area to live in.",
    },
    {
      q: "Why are elephants called a keystone species?",
      a: "Because their presence shapes the entire ecosystem. They disperse seeds over long distances, convert woodland into grassland by feeding, dig waterholes that other species rely on during drought, and open paths through dense vegetation. Remove elephants and the landscape itself changes.",
    },
  ],

  seo: {
    title: "African Savanna Elephant — Facts, Habitat, Diet & Conservation",
    description:
      "A researched profile of the African savanna elephant (Loxodonta africana): size, trunk and tusks, matriarchal herd structure, range across Africa, and its Endangered conservation status.",
    keywords: [
      "african elephant facts",
      "loxodonta africana",
      "savanna elephant",
      "largest land animal",
      "elephant conservation",
    ],
  },

  sources: [
    {
      label: "Loxodonta africana — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/181008073/223031019",
    },
    {
      label: "African elephant species profile",
      publisher: "WWF",
      url: "https://www.worldwildlife.org/species/african-elephant",
    },
    {
      label: "Amboseli Elephant Research Project",
      publisher: "Amboseli Trust for Elephants",
      url: "https://www.elephanttrust.org",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default africanSavannaElephant;
