// Galápagos giant tortoise — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const galapagosTortoise = {
  slug: "galapagos-tortoise",
  category: "reptiles",
  name: "Galápagos Giant Tortoise",
  scientificName: "Chelonoidis niger",
  otherNames: ["Galápagos tortoise", "Giant Galápagos tortoise", "Galapaguera"],

  summary:
    "The largest tortoise on Earth and the animal the Galápagos are named after — not one uniform species but a radiation of island populations, three of which are already gone.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Galapagos_giant_tortoise_Geochelone_elephantopus.jpg/1920px-Galapagos_giant_tortoise_Geochelone_elephantopus.jpg",
    alt: "A dome-shelled Galápagos giant tortoise",
    credit: "Mfield , Matthew Field, http://www.photography.mattfield.com / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Galapagos_giant_tortoise_01.jpg/1920px-Galapagos_giant_tortoise_01.jpg",
      alt: "A dome-shelled Galápagos giant tortoise on Santa Cruz island",
      credit: "Bengt Oberger / Wikimedia Commons",
      title: "A dome for wet highlands",
      caption:
        "Santa Cruz has a high, damp interior where vegetation grows at ground level, and its tortoises are domed. Shell shape across the archipelago tracks island climate closely enough that you can often name the island from the animal.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Galapagos_giant_tortoise_feeding.jpg",
      alt: "A Galápagos giant tortoise feeding",
      credit: "Garrondo / Wikimedia Commons",
      title: "The islands' largest herbivore",
      caption:
        "Grazing on this scale reshapes the vegetation. Tortoises open paths, keep woody growth down, and pass viable seeds over kilometres — which is why removing them changed the islands far more than their numbers alone would suggest.",
    },
  ],

  headline: "One name, fifteen island populations, three of them extinct",
  intro: [
    "Galápagos giant tortoises are the largest tortoises alive, reaching 1.87 m over the curve of the shell and up to 417 kg, and among the longest-lived animals on Earth. They are also the reason the archipelago has its name: galápago is an old Spanish word for a saddle, and it was applied to the shells of the tortoises on the drier islands.",
    "The name Chelonoidis niger is more complicated than it looks. It has been used for a single archipelago-wide species, for a species with a dozen or more subspecies, and — under the treatment the IUCN still follows — for the tortoises of Floreana Island alone, which were hunted out by about 1850. Getting a straight answer about the Galápagos tortoise means being explicit about which of those is meant.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Testudines",
    family: "Testudinidae",
    genus: "Chelonoidis",
    species: "Chelonoidis niger",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2017,
    populationTrend: "increasing",
    populationEstimate: "Around 30,000 across the archipelago, against 200,000–300,000 before whaling",
    note: "There is no single Red List category for the Galápagos tortoise as a whole, because the IUCN assesses each island population separately — as full species, under a taxonomy that the Turtle Taxonomy Working Group and the Reptile Database moved away from in 2021. Of the twelve surviving island taxa, six are Critically Endangered, three are Endangered and three are Vulnerable; Vulnerable is therefore the floor rather than a summary. Two more are Extinct: the Floreana tortoise, which is what the name Chelonoidis niger refers to in IUCN usage and was assessed Extinct in 2017, and the Pinta tortoise, whose last individual died in 2012. An undescribed Santa Fe population was lost in the 1800s. Numbers overall are now rising after decades of eradication and captive breeding work.",
  },

  measurements: [
    {
      key: "length",
      label: "Shell length",
      value: "Up to 1.87 m over the curve",
      min: 0.6,
      max: 1.87,
      unit: "m",
      note: "Varies enormously by island — the Pinzón population tops out around 61 cm, a third of the largest Isabela animals",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Males 270–320 kg; females 135–180 kg",
      min: 76,
      max: 417,
      unit: "kg",
      note: "The heaviest recorded individual reached 417 kg. Smaller island forms mature at under 80 kg",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "2–20 eggs",
      min: 2,
      max: 20,
      unit: "eggs",
      note: "Domed populations average around ten eggs a clutch, saddlebacks closer to five; a female may lay several clutches a season",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "About 4–8 months",
      min: 120,
      max: 240,
      unit: "days",
      note: "Length depends on nest temperature, which also determines the sex of the hatchlings",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "20–25 years in captivity; up to 40 in the wild",
      min: 20,
      max: 40,
      unit: "years",
      note: "The single most important number in the species' conservation — a population takes decades to respond to anything done for it",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Over 100 years in the wild",
      min: 100,
      max: 177,
      unit: "years",
      note: "Captive animals have been credibly documented past 170; Harriet, who died in Australia in 2006, was about 175",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Herbivore — grasses, cactus pads, leaves, fruit and lichen", icon: "Leaf" },
    { key: "activity", label: "Activity", value: "Diurnal; feeds in the morning, rests through the heat of the day", icon: "Sun" },
    { key: "nest-type", label: "Nest type", value: "A flask-shaped hole dug in dry lowland soil with the hind feet, then sealed and abandoned", icon: "Egg" },
    { key: "breeding-season", label: "Breeding season", value: "Mating in the warm wet season; nesting in the dry lowlands from June onwards", icon: "Calendar" },
    { key: "ecological-role", label: "Ecological role", value: "Keystone herbivore and long-distance seed disperser", icon: "Globe" },
  ],

  highlights: ["weight", "lifespan", "length", "ecological-role"],

  distribution: {
    continents: ["South America"],
    regions: [
      "Isabela — Volcán Wolf, Darwin, Alcedo, Sierra Negra and Cerro Azul",
      "Santa Cruz",
      "San Cristóbal",
      "Santiago",
      "Española",
      "Pinzón",
      "Fernandina",
    ],
    habitats: [
      "Humid highland grassland",
      "Arid lowland scrub",
      "Cactus and thorn woodland",
      "Volcanic caldera rim",
      "Seasonal pools and wallows",
    ],
    elevation: "Sea level to about 1,500 m",
    note: "Every surviving population is confined to a single island or, on Isabela, to a single volcano — the lava fields between volcanoes are as effective a barrier as open sea. On the larger, wetter islands tortoises migrate seasonally, climbing to the highlands to feed in the dry season and descending to nest, using the same routes for generations.",
  },

  sections: [
    {
      id: "taxonomy",
      title: "What 'Chelonoidis niger' actually means",
      body: [
        "This is the single thing most often got wrong about the species, and it is worth setting out plainly. Quoy and Gaimard described Testudo nigra in 1824 from Floreana Island. Through the twentieth century all Galápagos tortoises were treated as one species with a dozen or more subspecies. From the 2000s, genetic work led most authorities to elevate the island populations to full species — Chelonoidis porteri on Santa Cruz, C. hoodensis on Española, C. abingdonii on Pinta, and so on.",
        "That was reversed again in 2021. A study comparing the divergence within Galápagos tortoises against the extinct West Indian Chelonoidis radiation concluded that the differences had been substantially overestimated, and both the Turtle Taxonomy Working Group and the Reptile Database returned to a single species, Chelonoidis niger, with fifteen named subspecies: twelve surviving and three extinct.",
        "The IUCN has not followed. Its Red List still assesses the island populations as separate species, which means that on the Red List the bare name Chelonoidis niger refers to the Floreana tortoise specifically — a population hunted out by around 1850 and assessed as Extinct in 2017. The same binomial therefore points at an extinct island form in one system and at a living archipelago-wide species in another.",
        "This page uses the current Turtle Taxonomy Working Group treatment: one species, Chelonoidis niger, of which the Floreana tortoise is the extinct nominate subspecies, C. n. niger.",
      ],
    },
    {
      id: "shells",
      title: "Domes, saddlebacks and Darwin",
      body: [
        "Shell shape splits into two broad types, and the split follows the climate. On large, high islands with wet interiors — Santa Cruz, Alcedo on Isabela — tortoises are domed, heavy, with the shell curving down over a short neck. Food there grows at ground level and there is no reason to reach.",
        "On low, dry islands such as Española and the lost populations of Pinta and Floreana, the front of the shell is raised into a high arch and the neck and legs are long. That is the saddleback form, and it lets a tortoise stretch upward to browse cactus pads well above the ground. The Spanish word for that shape, galápago, is where the islands got their name.",
        "The observation nearly passed Darwin by. On the Beagle's visit in 1835 the acting governor, Nicholas Lawson, told him he could tell which island a tortoise came from by its shell. Darwin did not take it seriously at the time and failed to label his specimens by island — a mistake he later regretted, and one that makes the tortoises a footnote rather than a centrepiece in the origin of his thinking, where the mockingbirds and finches did the real work.",
      ],
    },
    {
      id: "collapse",
      title: "Whalers, goats and the collapse",
      body: [
        "Before people arrived the archipelago held something like 200,000 to 300,000 tortoises. What followed is one of the most efficient exploitations of a wild animal on record. Whalers, sealers and naval crews took tortoises as living provisions: the animals could be stacked in a hold and survive for months without food or water, which made them fresh meat on a long voyage in an age before refrigeration.",
        "Ships' logs record the scale. Something over 100,000 tortoises were taken in the nineteenth century, and crews preferred females, which are smaller and were easier to carry from the lowlands where they nest. Floreana's population, the one that carries the species name, was gone by about 1850.",
        "Introduced animals finished what hunting started. Goats stripped the vegetation on Pinta, Santiago and northern Isabela; pigs, dogs, rats and cats took eggs and hatchlings, in some populations for so long that no young tortoise survived for decades. By 1974 the archipelago held roughly 3,000 tortoises in total, about one per cent of the original number.",
      ],
    },
    {
      id: "restoration",
      title: "Bringing them back",
      body: [
        "Recovery has taken sixty years and has worked. Captive breeding began in the 1960s at the Charles Darwin Research Station, and the Española programme became its emblem: fourteen surviving tortoises were brought in, joined by a male named Diego repatriated from San Diego Zoo, and between them they produced roughly two thousand young. The programme closed in 2020 and its founders were returned to the island, leaving a wild population of around three thousand where fifteen animals had remained.",
        "The other half of the work was removal. Goats were eradicated from Pinta, then from Santiago, then — in the largest island eradication ever attempted — from northern Isabela, letting the vegetation and the tortoises recover together. Rat control on Pinzón allowed hatchlings to survive there for the first time in more than a century. Over 7,000 captive-reared juveniles had been repatriated across the islands by the end of 2017.",
        "Two threads remain open. Tortoises carrying Floreana ancestry were found on Volcán Wolf, descended from animals dumped overboard by whalers, and a breeding programme begun in 2017 is working to reconstruct that population from them. And in 2019 a single female tortoise was found on Fernandina, an island whose tortoises had been considered extinct since 1906; genetic work published in 2022 confirmed she belongs to that taxon. She remains the only one known.",
      ],
    },
    {
      id: "ecology",
      title: "What a giant tortoise does to an island",
      body: [
        "Tortoises are the largest native herbivores in the Galápagos, and they behave like a slow, heavy grazing herd. They crop grasses and herbs, break up woody seedlings, trample paths that other animals use, and open the vegetation enough to change what can grow.",
        "They are also the archipelago's most important seed dispersers. Seeds pass through the gut intact, sometimes days later and kilometres away, and germination rates for several plants are higher after that passage than without it. GPS tracking shows adults on the larger islands making seasonal migrations of ten kilometres or more between highland feeding grounds and lowland nesting areas, which is what gives the dispersal its reach.",
        "That is why their loss mattered out of proportion to the numbers. Islands that lost tortoises became woodier and more closed, and the plants that depended on them for movement stopped moving. Restoring tortoises to Pinta and Santiago has been treated explicitly as restoring an ecological process, not just a species — in some cases using tortoises from other islands as stand-ins for populations that no longer exist.",
      ],
    },
  ],

  related: ["green-sea-turtle", "leatherback-sea-turtle"],
  tags: ["tortoise", "island endemic", "galapagos", "herbivore", "long-lived", "reptile"],
  searchTerms: [
    "chelonoidis niger",
    "galapagos tortoise",
    "giant tortoise",
    "lonesome george",
    "chelonoidis nigra",
  ],

  faqs: [
    {
      q: "Is the Galápagos tortoise one species or many?",
      a: "Both answers have been current within the last twenty years. Since 2021 the Turtle Taxonomy Working Group and the Reptile Database have treated all Galápagos tortoises as one species, Chelonoidis niger, with fifteen subspecies — twelve surviving and three extinct. The IUCN still assesses the island populations as separate full species, which is why you will see names like Chelonoidis porteri and Chelonoidis hoodensis in conservation listings.",
    },
    {
      q: "Was Lonesome George the last Galápagos tortoise?",
      a: "No. He was the last of the Pinta Island population, Chelonoidis niger abingdonii, and he died on 24 June 2012. Twelve other island populations survive, totalling roughly 30,000 animals. He was not the nominate Floreana tortoise, which is a different subspecies and was lost more than 150 years earlier.",
    },
    {
      q: "How long do Galápagos tortoises live?",
      a: "Over a hundred years in the wild, and considerably longer in captivity — Harriet, who died in Australia in 2006, was about 175. They also mature extremely slowly, at twenty to twenty-five years in captivity and up to forty in the wild, which is the reason conservation results take decades to appear.",
    },
    {
      q: "Why do some Galápagos tortoises have saddle-shaped shells?",
      a: "Because of what they have to eat. On dry, low islands the vegetation a tortoise wants is above ground level, and the raised front arch of a saddleback shell — with a longer neck and legs — lets the animal reach up to cactus pads. On wet, high islands food grows underfoot and the tortoises are domed instead. The Spanish word for that saddle shape, galápago, gave the islands their name.",
    },
    {
      q: "How close did Galápagos tortoises come to extinction?",
      a: "Very. From something like 200,000 to 300,000 before whaling, the archipelago was down to roughly 3,000 animals by 1974. Three populations were lost outright. Captive breeding, goat and rat eradication and the repatriation of more than 7,000 young tortoises have brought the total back to around 30,000, and numbers are now rising.",
    },
  ],

  seo: {
    title: "Galápagos Giant Tortoise — Species, Size, Lifespan & Recovery",
    description:
      "A researched profile of the Galápagos giant tortoise (Chelonoidis niger): what the name actually refers to, domed and saddleback shells, the whaling collapse, Lonesome George and the Pinta tortoise, and the breeding programmes that brought the archipelago back to 30,000 animals.",
    keywords: [
      "galapagos tortoise facts",
      "chelonoidis niger",
      "galapagos giant tortoise lifespan",
      "lonesome george",
      "galapagos tortoise species",
    ],
  },

  sources: [
    {
      label: "Chelonoidis niger — Red List assessment (van Dijk et al., 2017)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/9023/3149101",
    },
    {
      label: "Chelonoidis niger entry, with the fifteen recognised subspecies",
      publisher: "The Reptile Database",
      url: "https://reptile-database.reptarium.cz/species?genus=Chelonoidis&species=niger",
    },
    {
      label: "Giant tortoise restoration in the Galápagos Islands",
      publisher: "Galápagos Conservancy",
      url: "https://www.galapagos.org/conservation/giant-tortoise-restoration/",
    },
    {
      label: "The Galápagos giant tortoise Chelonoidis phantasticus is not extinct",
      publisher: "Communications Biology (Jensen et al., 2022)",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9184544/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default galapagosTortoise;
