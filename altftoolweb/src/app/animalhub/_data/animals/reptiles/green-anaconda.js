// Green anaconda — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const greenAnaconda = {
  slug: "green-anaconda",
  category: "reptiles",
  name: "Green Anaconda",
  scientificName: "Eunectes murinus",
  otherNames: ["Common anaconda", "Water boa", "Sucuri"],

  summary:
    "The heaviest snake in the world — not the longest — a semi-aquatic boa of South American wetlands whose females outgrow males more dramatically than in any other snake.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Sucuri_verde.jpg/1920px-Sucuri_verde.jpg",
    alt: "A green anaconda, olive-green with the dark oval blotches typical of the species",
    credit: "MKAMPIS / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Anaconda_verde_%28Eunectes_murinus%29_de_Casanare%2C_Colombia.jpg/1920px-Anaconda_verde_%28Eunectes_murinus%29_de_Casanare%2C_Colombia.jpg",
      alt: "A green anaconda moving through wetland vegetation in Casanare, Colombia",
      credit: "Juli 2000 her / Wikimedia Commons",
      title: "Heavy on land, weightless in water",
      caption:
        "An anaconda's bulk is a liability out of water and an asset in it. Buoyancy carries the mass, which is why the species hunts, mates and digests almost entirely in the shallows and moves overland only when it has to.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Anaconda_verde_%28Eunectes_murinus%29_en_Casanare%2C_Colombia.jpg/1920px-Anaconda_verde_%28Eunectes_murinus%29_en_Casanare%2C_Colombia.jpg",
      alt: "A green anaconda looking directly towards the camera, photographed in Casanare, Colombia",
      credit: "Juli 2000 her / Wikimedia Commons",
      title: "Eyes and nostrils on top",
      caption:
        "Both sit high on the skull, so the snake can watch a bank and breathe with the rest of its head under water. It is the same solution crocodilians arrived at, in an animal that is not remotely related to them.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Anaconda_verde_%28Eunectes_murinus%29_fotografiada_en_Casanare%2C_Colombia.jpg/1920px-Anaconda_verde_%28Eunectes_murinus%29_fotografiada_en_Casanare%2C_Colombia.jpg",
      alt: "A green anaconda in a natural wetland in Casanare, Colombia",
      credit: "Juli 2000 her / Wikimedia Commons",
      title: "Camouflage for still water",
      caption:
        "Olive-green ground colour with dark oval blotches breaks the body up against floating vegetation. In seasonally flooded grassland like the Colombian llanos, that pattern is close to invisible from a metre away.",
    },
  ],

  headline: "The heaviest snake alive, and the most misreported",
  intro: [
    "The green anaconda is the bulkiest snake in the world. The largest individual measured under controlled conditions — one of hundreds handled by the biologist Jesús Rivas and colleagues over decades of fieldwork in Venezuela — was 5.21 m long and weighed 97.5 kg. A reticulated python of that length would weigh a third as much.",
    "It is not, however, the longest snake; that title belongs to the reticulated python. Nor does it reach the ten- and eleven-metre lengths that have been reported since the sixteenth century. Every such claim rests on estimates, stretched skins or memory, and none has ever been supported by a measured animal or a museum specimen.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Squamata",
    family: "Boidae",
    genus: "Eunectes",
    species: "Eunectes murinus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2021,
    populationTrend: "unknown",
    populationEstimate: "No global estimate; locally abundant in seasonally flooded grassland",
    note: "Least Concern on the strength of an enormous range that includes many protected areas. A 2024 paper proposed splitting the northern populations off as a separate species, Eunectes akayima; the Reptile Database currently treats that name as a preliminary synonym of E. murinus, on the grounds that the proposed species cannot be told apart morphologically. If the split is eventually accepted, both halves would need reassessing. Listed on CITES Appendix II.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "Females around 4.6 m; males around 3 m",
      min: 3,
      max: 5.21,
      unit: "m",
      note: "The largest anaconda measured under controlled conditions was 5.21 m. Reports of 10 m and above have circulated for four centuries without a single verified specimen",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Up to 97.5 kg verified",
      min: 30,
      max: 97.5,
      unit: "kg",
      note: "The heaviest reliably weighed individual, at 5.21 m — heavier than any other snake at a comparable length",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "20–40 young",
      min: 20,
      max: 40,
      unit: "young",
      note: "Litters of up to 100 have been recorded. Newborns are 60–80 cm and independent immediately",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 6–7 months",
      min: 180,
      max: 210,
      unit: "days",
      note: "Anacondas give birth to live young rather than laying eggs, the embryos developing inside the female",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "Males around 3 years; females around 4–5",
      min: 3,
      max: 5,
      unit: "years",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "About 10 years in the wild",
      min: 10,
      max: 30,
      unit: "years",
      note: "Captive animals commonly reach 30; the oldest documented was 37",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — fish, caiman, capybara, birds, turtles and deer", icon: "Drumstick" },
    { key: "activity", label: "Activity", value: "Mainly nocturnal, and largely inactive between meals", icon: "Moon" },
    { key: "water-type", label: "Water type", value: "Fresh water — swamps, oxbows and seasonally flooded grassland", icon: "Droplet" },
    { key: "heat-sensing", label: "Heat sensing", value: "No labial pits — unlike pythons and the tree boas. Infrared-sensitive nerve endings are present, but there are no pit organs", icon: "Thermometer" },
    { key: "shedding-frequency", label: "Shedding", value: "Several times a year, often in water, which loosens the old skin", icon: "RefreshCw" },
    { key: "ecological-role", label: "Ecological role", value: "Apex predator of South American wetlands", icon: "Globe" },
  ],

  highlights: ["weight", "length", "litter-size", "diet-type"],

  distribution: {
    continents: ["South America"],
    regions: [
      "Amazon basin",
      "Orinoco basin",
      "Venezuelan and Colombian llanos",
      "The Guianas",
      "Northern Bolivia and eastern Peru",
      "Trinidad",
    ],
    habitats: [
      "Seasonally flooded grassland",
      "Swamp and marsh",
      "Slow river and oxbow lake",
      "Flooded forest",
    ],
    elevation: "Lowlands, generally below 300 m",
    note: "The species is tied to standing and slow-moving water east of the Andes. In the llanos it tracks the flood cycle — dispersed across the plain in the wet season, concentrated in shrinking pools in the dry, which is when it is most often encountered.",
  },

  sections: [
    {
      id: "size",
      title: "Heaviest, not longest",
      body: [
        "Two different superlatives get muddled constantly. The reticulated python is the longest snake in the world; the green anaconda is the heaviest. A 5 m anaconda is a far bulkier animal than a 5 m python, with a girth that can approach 30 cm, and the weight difference is not marginal.",
        "The reliable numbers come from long-running fieldwork rather than one-off encounters. Jesús Rivas and colleagues captured, measured and released hundreds of anacondas in the Venezuelan llanos over more than two decades. The largest was 5.21 m and 97.5 kg. Females averaged around 4.6 m; males, remarkably, around 3 m.",
        "Longer claims have a consistent shape: an estimate rather than a measurement, or a skin rather than an animal. Snake skins stretch by twenty to forty per cent or more during removal and drying, which is enough to turn a genuine 5 m snake into an apparent 7 m one on the wall. No museum holds a specimen anywhere near the lengths repeatedly reported from the Amazon, and the reports have been repeated since the 1500s.",
      ],
    },
    {
      id: "taxonomy",
      title: "One species, or two?",
      body: [
        "In February 2024 a team including Rivas published a paper describing the anacondas of the Orinoco basin, the Guianas and Trinidad as a distinct species, Eunectes akayima — the northern green anaconda. The genetic divergence between northern and Amazonian populations is real and had been known for some years.",
        "The description drew immediate criticism. The main objection is diagnostic: the proposed species cannot be separated from Eunectes murinus by any morphological character, so there is no way to identify one in the field or in a museum drawer. Questions were also raised about the holotype designation, which the authors addressed in a follow-up paper later in 2024.",
        "As it stands, the Reptile Database lists Eunectes akayima as a preliminary synonym of E. murinus. That is where the question sits: the genetic structure within green anacondas is not in dispute, but whether it warrants two species names — and whether a species that cannot be diagnosed is a usable species — is. This page treats the green anaconda as one species while the argument runs.",
      ],
    },
    {
      id: "hunting",
      title: "How constriction actually kills",
      body: [
        "An anaconda hunts by waiting. It lies submerged with only eyes and nostrils showing, often for hours, and strikes at whatever comes to drink. The strike is a bite that anchors the prey; the coils follow within a second.",
        "For most of the twentieth century constriction was explained as suffocation — the snake tightening each time the prey exhales until it cannot breathe. Direct measurements of blood pressure in constricted prey, published in 2015, showed something faster and less merciful. Constriction collapses circulation: arterial pressure crashes, venous pressure spikes, the heart cannot fill, and the brain loses blood supply within seconds. Prey is unconscious far sooner than suffocation would allow.",
        "The prey list is broad and skewed to large items — capybara, caiman, peccary, deer, large birds, turtles. A meal of that size means weeks or months without another, and a heavily fed anaconda is close to helpless, which is one reason it retreats to water to digest.",
      ],
    },
    {
      id: "breeding",
      title: "Breeding balls and a very large female",
      body: [
        "Green anacondas show the most extreme size difference between the sexes of any snake: a mature female may be several times the mass of a mature male. That asymmetry drives the whole mating system.",
        "In the dry season, males follow scent trails to a receptive female and pile onto her. The resulting 'breeding ball' can hold a dozen or more males wrapped around one female and may last for weeks, with the males competing by squeezing rather than fighting. Rivas's fieldwork also documented females occasionally consuming a male at the end of the process — a substantial meal at exactly the point when a pregnant snake will stop feeding for months.",
        "Gestation runs six to seven months and the young are born live, 20 to 40 of them, each 60 to 80 cm long and entirely independent. The female typically loses a large fraction of her body mass over a breeding cycle and may not reproduce again for two years or more.",
      ],
    },
    {
      id: "threats",
      title: "Threats, and a reputation problem",
      body: [
        "The species is not currently threatened at a global level. Its range covers most of tropical South America east of the Andes, much of it thinly populated and some of it protected, and it can persist in cattle country as long as wetland remains.",
        "The pressures are local rather than continental: drainage and conversion of seasonal wetland, cattle ranching that removes cover, hunting for skins, capture for the pet trade, and killing on sight. That last one is the largest in some regions, and it is driven almost entirely by the animal's reputation.",
        "Attacks on people are extraordinarily rare, and confirmed cases of an anaconda killing an adult human are effectively absent from the record. The species is large enough to be dangerous in principle and almost never is in practice — a gap between reputation and behaviour that costs the snake far more than it costs anyone else.",
      ],
    },
  ],

  related: ["reticulated-python", "king-cobra"],
  tags: ["snake", "constrictor", "boa", "south america", "wetland", "reptile"],
  searchTerms: ["eunectes murinus", "anaconda", "heaviest snake", "water boa", "eunectes akayima"],

  faqs: [
    {
      q: "How big does a green anaconda really get?",
      a: "The largest individual measured under controlled conditions was 5.21 m long and weighed 97.5 kg, from fieldwork in Venezuela in which hundreds of anacondas were caught and measured. Females average around 4.6 m and males around 3 m. Reports of 10 m or more have circulated since the 1500s but have never been supported by a measured animal or a museum specimen.",
    },
    {
      q: "Is the anaconda the biggest snake in the world?",
      a: "It depends which measure you mean, and the two answers are different animals. The green anaconda is the heaviest snake, by a wide margin at any given length. The reticulated python is the longest, reaching close to 7 m in reliably measured wild specimens.",
    },
    {
      q: "Is the northern green anaconda a separate species?",
      a: "It is proposed, not settled. A 2024 paper named the northern populations Eunectes akayima, and the genetic difference between northern and Amazonian anacondas is real. Critics point out that the proposed species cannot be distinguished by any physical character, which makes it unidentifiable in practice, and the Reptile Database currently lists the name as a preliminary synonym of Eunectes murinus.",
    },
    {
      q: "How does constriction kill?",
      a: "By stopping circulation, not by suffocation. Direct measurements of blood pressure in constricted prey published in 2015 showed that the coils collapse arterial pressure and prevent the heart from filling, so the brain loses its blood supply within seconds — much faster than a lack of air could act.",
    },
    {
      q: "Do anacondas lay eggs?",
      a: "No. They give birth to live young after a gestation of six to seven months, typically 20 to 40 at a time and occasionally many more. Newborns are 60 to 80 cm long and receive no parental care at all.",
    },
  ],

  seo: {
    title: "Green Anaconda — Size, Weight, Diet & the Eunectes akayima Split",
    description:
      "A researched profile of the green anaconda (Eunectes murinus): the world's heaviest snake, what its verified maximum size actually is, how constriction kills, breeding balls, and the disputed 2024 split of the northern green anaconda.",
    keywords: [
      "green anaconda facts",
      "eunectes murinus",
      "heaviest snake",
      "anaconda size",
      "eunectes akayima",
    ],
  },

  sources: [
    {
      label: "Eunectes murinus — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/44580041/44580052",
    },
    {
      label: "Eunectes murinus entry, including the status of Eunectes akayima",
      publisher: "The Reptile Database",
      url: "https://reptile-database.reptarium.cz/species?genus=Eunectes&species=murinus",
    },
    {
      label: "Disentangling the anacondas: revealing a new green species and rethinking yellows",
      publisher: "Diversity (Rivas et al., 2024)",
      url: "https://www.mdpi.com/1424-2818/16/2/127",
    },
    {
      label: "Description of the northern green anaconda: what is in a name?",
      publisher: "Diversity (2024)",
      url: "https://www.mdpi.com/1424-2818/16/7/418",
    },
  ],

  updatedAt: "2026-07-29",
};

export default greenAnaconda;
