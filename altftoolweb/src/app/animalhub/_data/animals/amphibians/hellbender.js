// Hellbender — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const hellbender = {
  slug: "hellbender",
  category: "amphibians",
  name: "Hellbender",
  scientificName: "Cryptobranchus alleganiensis",
  otherNames: ["Snot otter", "Allegheny alligator", "Mud devil", "Devil dog"],

  summary:
    "North America's largest salamander, up to 74 cm of loose wrinkled skin under a flat rock in an Appalachian stream. It takes almost all its oxygen through those skin folds, which is exactly why silt washing off a logged hillside is killing it.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Hellbender.jpg/1920px-Hellbender.jpg",
    alt: "A hellbender on a stream bed, brown and mottled with a flattened head and loose folds of skin along its flanks",
    credit: "Brian Gratwicke / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Hellbender_amphibian_animal_cryptobranchus_alleganiensis.jpg/1920px-Hellbender_amphibian_animal_cryptobranchus_alleganiensis.jpg",
      alt: "A hellbender held clear of the water during a survey, showing its full length and wrinkled flanks",
      credit: "Poulin Chris, U.S. Fish and Wildlife Service / Wikimedia Commons",
      title: "All that skin is a lung",
      caption:
        "The loose lateral folds are not fat or age. They multiply the skin's surface area, and almost all of the animal's oxygen crosses them from the water — which is why a hellbender cannot live anywhere the current is slow or the water is warm.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Hellbender_Cryptobranchus_alleganiensis.jpg/1920px-Hellbender_Cryptobranchus_alleganiensis.jpg",
      alt: "A hellbender among rocks underwater, mottled brown against the stream bed",
      credit: "Brian Gratwicke / Wikimedia Commons",
      title: "One rock, for years",
      caption:
        "An adult hellbender occupies a single large flat rock and may keep it for its whole adult life. Turning stream rocks over — for fishing, for construction, for fun — destroys shelters that took decades to become occupied.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Hellbenders_in_aquarium_cryptobranchus_alleganiensis.jpg/1920px-Hellbenders_in_aquarium_cryptobranchus_alleganiensis.jpg",
      alt: "Several hellbenders in an aquarium tank",
      credit: "Blanton Dee, U.S. Fish and Wildlife Service / Wikimedia Commons",
      title: "Raised in tanks, released to rivers",
      caption:
        "Captive rearing has become central to hellbender conservation. Eggs are collected from wild nests, grown on for years in facilities such as the Saint Louis Zoo's hellbender centre, and released at a size that gives them a chance.",
    },
  ],

  headline: "A giant salamander that breathes through its wrinkles",

  intro: [
    "The hellbender is a flat, brown, entirely aquatic salamander that can reach 74 cm from snout to tail tip — the largest amphibian in North America, and the only living member of its genus. Its closest relatives are the Japanese and Chinese giant salamanders, and cryptobranchids of one kind or another have been sitting under rocks in cold rivers for a very long time.",
    "Almost everything about it follows from one constraint. An adult hellbender takes the great majority of its oxygen directly from the water through the skin, and specifically through the loose, wrinkled folds that run down each flank and multiply its surface area. Lungs are present but contribute little to gas exchange; they mostly help with buoyancy. Water that is cold, fast and turbulent carries a lot of dissolved oxygen. Water that is warm, slow or clogged with silt does not, and the animal has no way to compensate.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Amphibia",
    order: "Caudata",
    family: "Cryptobranchidae",
    genus: "Cryptobranchus",
    species: "Cryptobranchus alleganiensis",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2022,
    populationTrend: "decreasing",
    populationEstimate:
      "No range-wide count; of 570 known occurrences of the eastern subspecies, 12% are extirpated and 19% are of unknown status",
    note: "Assessed as Vulnerable under criterion A2cde in 2022, up from Near Threatened in 2004, with an overall decline suspected at 30–50% over three generations. Individual datasets are worse: a Missouri study recorded a 77% fall over twenty years and an Ohio population an 82% relative fall over thirty. The Ozark subspecies, Cryptobranchus alleganiensis bishopi, has been listed as endangered under the US Endangered Species Act since 2011, with fewer than 600 believed left in the wild against a historical figure of some 8,000. Federal protection for the far more widespread eastern subspecies was proposed in December 2024 and had still not been finalised by mid-2026.",
  },

  measurements: [
    {
      key: "length",
      label: "Total length",
      value: "30–74 cm",
      min: 30,
      max: 74,
      unit: "cm",
      note: "Most adults measure 30–60 cm; snout-to-vent length is 24–40 cm. It is the largest salamander in North America and the fourth largest aquatic salamander in the world.",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Usually 0.4–1 kg",
      min: 0.4,
      max: 1,
      unit: "kg",
      note: "Measured adults commonly fall between 405 and 1,010 g; large individuals are reported at up to about 2.5 kg.",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Up to about 30 years",
      min: 25,
      max: 30,
      unit: "years",
      note: "A captive animal reached 29 years. Longevity is one reason declines go unnoticed: a river can hold adults for decades after it has stopped producing young.",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "5–8 years",
      min: 5,
      max: 8,
      unit: "years",
      note: "Males mature slightly earlier than females.",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "150–450 eggs",
      min: 150,
      max: 450,
      unit: "eggs",
      note: "Several females may lay in the same male's nest cavity, so a single rock can hold close to 2,000 eggs.",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "45–80 days",
      min: 45,
      max: 80,
      unit: "days",
      note: "The male guards and fans the eggs throughout.",
    },
    {
      key: "water-temperature",
      label: "Stream temperature tolerated",
      value: "About 9–22.5 °C",
      min: 9,
      max: 22.5,
      unit: "°C",
      note: "Cold, fast water holds more dissolved oxygen, which an animal breathing through its skin cannot do without.",
    },
  ],

  traits: [
    {
      key: "respiration",
      label: "Respiration",
      value: "Almost entirely through wrinkled folds of skin; the lungs contribute little",
      icon: "Wind",
    },
    {
      key: "diet-type",
      label: "Diet",
      value: "Carnivore — mostly crayfish, plus fish, insects and smaller salamanders",
      icon: "Drumstick",
    },
    {
      key: "activity",
      label: "Activity",
      value: "Nocturnal; spends the day beneath a single large flat rock",
      icon: "Moon",
    },
    {
      key: "water-type",
      label: "Water type",
      value: "Freshwater — cold, fast, well-oxygenated rocky streams",
      icon: "Droplet",
    },
    {
      key: "ecological-role",
      label: "Ecological role",
      value: "Indicator species — a river with hellbenders in it is a clean river",
      icon: "Leaf",
    },
  ],

  highlights: ["length", "respiration", "water-temperature", "lifespan"],

  distribution: {
    continents: ["North America"],
    regions: [
      "Appalachian streams from southern New York to northern Georgia",
      "The Ohio River drainage across Pennsylvania, Ohio, West Virginia, Kentucky and Indiana",
      "The Ozark highlands of southern Missouri and northern Arkansas",
    ],
    habitats: [
      "Cold, fast-flowing rocky streams and rivers",
      "Riffles and runs with large flat shelter rocks",
      "Forested headwater catchments",
    ],
    elevation: "Appalachian and Ozark uplands, in streams rather than at any particular altitude",
    note: "Two subspecies are recognised: the widespread eastern hellbender, Cryptobranchus alleganiensis alleganiensis, and the Ozark hellbender, C. a. bishopi, confined to a handful of rivers in southern Missouri and northern Arkansas. The Ozark form is the more threatened by a wide margin and is separately listed under US federal law.",
  },

  sections: [
    {
      id: "biggest",
      title: "The biggest salamander on the continent",
      body: [
        "A full-grown hellbender is an unmistakable animal: a flattened brown or grey body up to 74 cm long, a broad blunt head, tiny lidless eyes, a keeled paddle-like tail, and skin that hangs in loose lateral folds like something several sizes too large. The vernacular names it has collected — snot otter, mud devil, Allegheny alligator, devil dog — capture the reaction better than any description.",
        "It belongs to the Cryptobranchidae, the giant salamander family, alongside the Japanese and Chinese giant salamanders in the genus Andrias. It is the only living species of Cryptobranchus and the only member of the family outside Asia. Larvae hatch with external gills and lose them at around a year and a half to two years old, after which the animal is committed to breathing through its skin for the rest of a life that may run to three decades.",
        "For all its size it is a shy, sedentary, nocturnal predator. It eats crayfish above all, plus fish, aquatic insects and smaller salamanders, taking them with a sideways snap and a pulse of suction. It is completely harmless to people, is not venomous, and does not bite anything the size of a hand — the folklore attached to it is a comment on how it looks rather than what it does.",
      ],
    },
    {
      id: "skin",
      title: "Why the wrinkles matter",
      body: [
        "The skin folds are the hellbender's respiratory system. They are richly supplied with capillaries and they greatly increase the surface area exposed to water, and adults take almost all their oxygen through them. Lungs exist but do very little gas exchange; their main role is buoyancy control.",
        "Skin breathing only works with a steep oxygen gradient, which means the water has to be cold and moving. The species is associated with streams in roughly the 9 to 22.5 °C range, in riffles and runs where turbulence keeps the water saturated. A hellbender in still water will rock its body from side to side to drive current over its flanks — the amphibian equivalent of a fish ventilating its gills.",
        "This is the vulnerability that shapes everything else. The animal cannot switch to breathing air when conditions deteriorate. Impoundment behind a dam, removal of streamside forest, warming water and any input that lowers dissolved oxygen all attack the one mechanism it has. It is why hellbenders are treated as an indicator species: the presence of a breeding population is a fairly reliable statement about a river's water quality.",
      ],
    },
    {
      id: "nest",
      title: "Under the rock",
      body: [
        "An adult hellbender lives under a single large flat rock, usually with one entrance, and will occupy the same shelter for years. Suitable rocks are not common, they are not quickly replaced, and competition for them is real.",
        "Breeding happens in late summer and autumn. The male excavates a saucer-shaped depression beneath a shelter rock and waits; a female enters, lays 150 to 450 eggs in paired strings, and is then driven out. More than one female may use the same nest, so a single cavity can end up holding close to two thousand eggs.",
        "The male stays with them for the full 45 to 80 days of incubation. He guards the entrance and rocks or undulates his body to fan oxygenated water across the clutch, which matters as much here as anywhere: an unattended mass of eggs in a stream bed will suffocate. He also eats some of them, which is normal for the species and thought to be a way of maintaining condition during a long fast.",
      ],
    },
    {
      id: "silt",
      title: "Silt, and what it buries",
      body: [
        "The hellbender is a habitat specialist with very little tolerance of change, and the change doing most of the damage is sediment. Logging, mining, road construction and bank erosion wash fine silt into headwater streams; the silt settles into the gaps between rocks and gravel, fills the crevices that shelter crayfish, smothers eggs, and buries the loose rock and gravel the animals need as nest sites. It does not have to poison anything to end a population.",
        "Dams and water management compound it by slowing the current, warming the water and cutting the dissolved oxygen the animal depends on. Chemical pollution and acid mine drainage add to the load, and both chytrid fungus and ranavirus have been detected in hellbender populations. Many subpopulations have declined for reasons that remain unclear.",
        "The decline is severe and long-running. The 2022 Red List assessment put the overall fall at 30 to 50 percent over three generations, on the way to moving the species from Near Threatened to Vulnerable. Missouri populations fell 77 percent over twenty years; an Ohio population fell 82 percent over thirty. Of 570 recorded occurrences of the eastern subspecies, 12 percent are extirpated. Because the animals live for decades, many surviving populations are almost entirely old adults with no young coming through — a river can look occupied for years after it has effectively stopped functioning.",
        "The legal picture is split. The Ozark hellbender was listed as endangered under the US Endangered Species Act in October 2011, when fewer than 600 were thought to remain against a historical population of around 8,000. The US Fish and Wildlife Service proposed endangered status for the much more widespread eastern subspecies in December 2024; that rule had not been finalised by mid-2026, and the delay is itself now the subject of litigation.",
        "The conservation work that does exist is unusually hands-on. The world's first captive breeding of Ozark hellbenders took place in autumn 2011 at the Saint Louis Zoo and produced more than 150 larvae; the zoo's Ron Goellner Center and the Missouri Department of Conservation's hatchery at Shepherd of the Hills have since reared thousands of animals for release into Missouri rivers. Alongside that sits the unglamorous half: fencing livestock out of streams, replanting streamside forest, and leaving the rocks where they are.",
      ],
    },
  ],

  related: ["chinese-giant-salamander", "olm", "axolotl"],
  tags: ["salamander", "north america", "freshwater", "vulnerable", "appalachia", "indicator species"],
  searchTerms: [
    "cryptobranchus alleganiensis",
    "snot otter",
    "mud devil",
    "allegheny alligator",
    "ozark hellbender",
    "largest salamander north america",
  ],

  faqs: [
    {
      q: "How big does a hellbender get?",
      a: "Up to about 74 cm from snout to tail tip, though most adults are 30 to 60 cm. That makes it the largest salamander in North America and the fourth largest aquatic salamander in the world, behind the Chinese, South China and Japanese giant salamanders.",
    },
    {
      q: "How does a hellbender breathe?",
      a: "Almost entirely through its skin, and particularly through the loose wrinkled folds along each flank, which are packed with capillaries and hugely increase the surface area. Lungs are present but do little gas exchange and mainly assist with buoyancy. In still water a hellbender will rock its body to drive fresh water over its flanks.",
    },
    {
      q: "Are hellbenders dangerous or venomous?",
      a: "No. They are not venomous, they do not attack people, and their reputation is entirely a product of their appearance and their names. They are shy, nocturnal and spend the day under a rock. The greater risk runs the other way: anglers who catch one and kill it are removing an animal that may be twenty years old from a population that cannot replace it.",
    },
    {
      q: "Why are hellbenders declining?",
      a: "Chiefly siltation. Fine sediment from logging, mining, road building and bank erosion fills the spaces between rocks and gravel, smothering eggs and destroying both shelter and nest sites. Dams slow and warm the water, lowering the dissolved oxygen a skin-breathing animal cannot do without, and chytrid fungus and ranavirus are also present. The overall decline is put at 30 to 50 percent over three generations.",
    },
    {
      q: "Is the hellbender protected by law?",
      a: "Partly. The Ozark subspecies has been listed as endangered under the US Endangered Species Act since October 2011. The far more widespread eastern subspecies was proposed for endangered listing in December 2024, but that rule had not been finalised by mid-2026. Globally the species is assessed as Vulnerable on the IUCN Red List.",
    },
  ],

  seo: {
    title: "Hellbender — Skin Breathing, Siltation & Conservation Status",
    description:
      "A researched profile of the hellbender (Cryptobranchus alleganiensis): North America's largest salamander, how it breathes through its skin folds, and why silt from logged catchments is driving a 30–50% decline.",
    keywords: [
      "hellbender",
      "cryptobranchus alleganiensis",
      "snot otter",
      "ozark hellbender endangered",
      "largest salamander north america",
    ],
  },

  sources: [
    {
      label: "Cryptobranchus alleganiensis — Red List assessment (2022, e.T59077A82473431)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/59077/82473431",
    },
    {
      label: "Endangered Species Status for Eastern Hellbender — proposed rule, 13 December 2024",
      publisher: "US Fish and Wildlife Service / Federal Register",
      url: "https://www.federalregister.gov/documents/2024/12/13/2024-28352/endangered-and-threatened-wildlife-and-plants-endangered-species-status-for-eastern-hellbender",
    },
    {
      label: "Cryptobranchus alleganiensis — size, longevity and life history account",
      publisher: "Animal Diversity Web, University of Michigan",
      url: "https://animaldiversity.org/accounts/Cryptobranchus_alleganiensis/",
    },
    {
      label: "Hellbender restoration — captive rearing and release programme",
      publisher: "Missouri Department of Conservation",
      url: "https://mdc.mo.gov/wildlife/wildlife-restoration/hellbender-restoration",
    },
  ],

  updatedAt: "2026-07-29",
  featured: false,
};

export default hellbender;
