// King cobra — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const kingCobra = {
  slug: "king-cobra",
  category: "reptiles",
  name: "King Cobra",
  scientificName: "Ophiophagus hannah",
  otherNames: ["Hamadryad"],

  summary:
    "The world's longest venomous snake, a specialist hunter of other snakes and the only snake known to build a nest for its eggs and guard them.",

  heroImage: {
    src: "https://images.unsplash.com/photo-1779106498152-3a99b970e167?auto=format&fit=crop&w=1600&q=80",
    alt: "Close view of a king cobra's head with its tongue extended",
    credit: "Smithsonian / Unsplash",
  },
  gallery: [],

  headline: "The longest venomous snake, and a hunter of other snakes",
  intro: [
    "The king cobra can exceed five metres, making it the longest venomous snake in the world, though most adults measure three to four. Its scientific name, Ophiophagus, means snake-eater — and that is close to the whole of its diet. It hunts rat snakes, pythons and other cobras, including members of its own species.",
    "Despite the name it is not a true cobra. True cobras belong to the genus Naja; the king cobra sits alone in Ophiophagus, distinguished by its size, its diet, its narrower hood, and a low growling hiss produced by pouch-like structures off the trachea — an arrangement it shares with the rat snakes it hunts, but with almost no other snake.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Squamata",
    family: "Elapidae",
    genus: "Ophiophagus",
    species: "Ophiophagus hannah",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2011,
    populationTrend: "decreasing",
    populationEstimate: "No reliable global estimate",
    note: "Threatened primarily by deforestation across South and Southeast Asia, along with collection for skins, traditional medicine and the pet trade. Research published in 2024 proposed splitting the king cobra into four separate species, which would change how each population is assessed.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "3–4 m typically, up to 5.5 m",
      min: 3,
      max: 5.5,
      unit: "m",
      note: "The longest documented specimen reached 5.71 m — a snake caught in Negeri Sembilan, Malaysia in 1937 and later measured at London Zoo",
    },
    {
      key: "weight",
      label: "Weight",
      value: "6–10 kg",
      min: 6,
      max: 10,
      unit: "kg",
    },
    {
      key: "venom-yield",
      label: "Venom yield per bite",
      value: "Around 400–600 mg (dry weight)",
      min: 400,
      max: 600,
      unit: "mg",
      note: "Among the highest volumes of any venomous snake",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "20–40 eggs",
      min: 20,
      max: 40,
      unit: "eggs",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "About 60–80 days",
      min: 60,
      max: 80,
      unit: "days",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Around 20 years",
      min: 17,
      max: 20,
      unit: "years",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — mainly other snakes", icon: "Drumstick" },
    { key: "venom-type", label: "Venom", value: "Primarily neurotoxic", icon: "Droplet" },
    { key: "activity", label: "Activity", value: "Mainly diurnal", icon: "Sun" },
    { key: "nest-type", label: "Nest type", value: "A leaf-litter mound the female builds and guards — unique among snakes", icon: "Egg" },
    { key: "heat-sensing", label: "Heat sensing", value: "None — cobras lack the infrared pits of vipers and pythons", icon: "Thermometer" },
    { key: "shedding-frequency", label: "Shedding", value: "Roughly 4–6 times a year as adults; more often while growing", icon: "RefreshCw" },
  ],

  highlights: ["length", "venom-yield", "diet-type", "nest-type"],

  distribution: {
    continents: ["Asia"],
    regions: [
      "India",
      "Southern China",
      "Southeast Asia",
      "Indonesia",
      "Philippines",
    ],
    habitats: [
      "Tropical and subtropical forest",
      "Mangrove swamp",
      "Bamboo thicket",
      "Agricultural land near forest",
    ],
    elevation: "Lowlands up to around 2,000 m",
    note: "Strongly associated with undisturbed forest near water. Individuals are increasingly found near plantations and villages as forest is cleared, which raises the frequency of encounters with people.",
  },

  sections: [
    {
      id: "diet",
      title: "A diet of other snakes",
      body: [
        "King cobras feed overwhelmingly on other snakes — rat snakes are a staple, and they also take pythons, kraits and other cobras. Lizards are eaten occasionally, particularly by younger individuals, but the specialisation is unusually narrow for a large predator.",
        "This diet shapes its ecology. King cobras follow prey by scent, flicking the tongue and reading chemical traces with the vomeronasal organ, and can go weeks or months between meals after swallowing a large snake. It also means their abundance is tied to the abundance of other snakes, so declines further down the chain affect them directly.",
      ],
    },
    {
      id: "venom",
      title: "Venom and defence",
      body: [
        "The venom is primarily neurotoxic, interrupting the signals between nerves and muscle and causing paralysis that can progress to respiratory failure. Drop for drop it is less potent than that of several smaller elapids, but the king cobra delivers an exceptional volume — 400 to 600 mg dry weight in a single bite, with larger amounts recorded.",
        "Bites on humans are rare, because the species is retiring and generally avoids confrontation. When cornered it raises the front third of its body, spreads a narrow hood, and produces a low growl rather than a conventional hiss — a sound made possible by pouch-like structures off the trachea that lower its frequency. It may also strike with a closed mouth as a warning.",
        "Where bites do occur, antivenom and prompt hospital care with respiratory support are the treatment. Access to both is uneven across the species' range, which is why the danger it poses varies far more by geography than by the snake itself.",
      ],
    },
    {
      id: "nesting",
      title: "Nest building",
      body: [
        "The king cobra is the only snake known to build a nest for its eggs. Using coils of her body, the female gathers leaf litter into a mound, deposits 20 to 40 eggs in a chamber within it, and covers them over. Decomposing vegetation keeps the interior warm, functioning as an incubator.",
        "She then stays with the nest, guarding it for the whole of the roughly two-month incubation and driving off animals that approach. Shortly before the eggs hatch she leaves — behaviour usually explained as avoiding the risk that she would eat her own young.",
        "Hatchlings emerge around 45 to 55 cm long and are fully venomous from the start, though their venom yield is small. They are independent immediately.",
      ],
    },
    {
      id: "threats",
      title: "Threats and conservation",
      body: [
        "Habitat loss is the dominant threat. King cobras depend on forest, and logging and conversion to plantation and farmland across South and Southeast Asia have fragmented much of their range. They are also killed on sight in many areas, collected for skins and for use in traditional medicine, and taken for the international pet trade.",
        "The species is listed on CITES Appendix II, and it is protected under Indian wildlife law. Some of the most effective local work has come from snake rescue and relocation programmes, which move individuals found near villages rather than killing them, and from research stations in the Western Ghats that have improved understanding of how the species uses forest landscapes.",
      ],
    },
  ],

  related: ["komodo-dragon"],
  tags: ["snake", "venomous", "asia", "elapid", "forest", "reptile"],
  searchTerms: ["ophiophagus", "hamadryad", "longest venomous snake", "cobra"],

  faqs: [
    {
      q: "Is the king cobra a true cobra?",
      a: "No. True cobras belong to the genus Naja, while the king cobra is the only member of the genus Ophiophagus. It differs in its far greater size, its diet of other snakes, its narrower hood, and its ability to produce a low growl rather than a normal hiss.",
    },
    {
      q: "How dangerous is a king cobra bite?",
      a: "Serious, but the risk is often misunderstood. The venom is less potent drop for drop than that of several smaller elapids; what makes a bite dangerous is the volume delivered — 400 to 600 mg dry weight or more. Untreated, neurotoxic effects can lead to respiratory failure. Bites are uncommon because the species avoids people, and antivenom with hospital respiratory support is effective where available.",
    },
    {
      q: "Why do king cobras eat other snakes?",
      a: "It is what they are specialised for — the genus name Ophiophagus literally means snake-eater. They track other snakes by scent and take rat snakes, pythons, kraits and other cobras, including their own species. Because of this, their numbers depend directly on the health of the wider snake population.",
    },
    {
      q: "Do king cobras really build nests?",
      a: "Yes, and they are the only snake known to do it. The female scrapes leaf litter into a mound with her coils, lays 20 to 40 eggs inside, and guards it for the roughly two-month incubation while decomposing vegetation warms the chamber. She leaves shortly before hatching, most likely to avoid preying on her own young.",
    },
    {
      q: "How long is the longest king cobra?",
      a: "Most adults are three to four metres. Exceptionally large individuals exceed five metres, and the longest documented specimen reached 5.71 m — a snake caught in Negeri Sembilan, Malaysia in 1937 and later measured at London Zoo. That remains the longest venomous snake ever recorded.",
    },
  ],

  seo: {
    title: "King Cobra — Size, Venom, Diet & Nesting Behaviour",
    description:
      "A researched profile of the king cobra (Ophiophagus hannah): the world's longest venomous snake, its diet of other snakes, neurotoxic venom, unique nest-building, and Vulnerable status.",
    keywords: [
      "king cobra facts",
      "ophiophagus hannah",
      "longest venomous snake",
      "king cobra venom",
      "king cobra nest",
    ],
  },

  sources: [
    {
      label: "Ophiophagus hannah — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/177540/7461683",
    },
    {
      label: "King cobra species profile",
      publisher: "Smithsonian's National Zoo and Conservation Biology Institute",
      url: "https://nationalzoo.si.edu/animals/king-cobra",
    },
    {
      label: "Ophiophagus hannah entry",
      publisher: "The Reptile Database",
      url: "https://reptile-database.reptarium.cz/species?genus=Ophiophagus&species=hannah",
    },
  ],

  updatedAt: "2026-07-29",
};

export default kingCobra;
